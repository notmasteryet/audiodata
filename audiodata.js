/*
 * Audio Data API Objects
 * Copyright (c) 2010 notmasteryet
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* AudioParameters */
function AudioParameters(channels, sampleRate) {
  this.channels = channels;
  this.sampleRate = sampleRate;
}

AudioParameters.prototype.match = function(other) {
  return this.channels === other.channels && this.sampleRate === other.sampleRate;
};

/* AudioDataSource */
function AudioDataSource(mediaElement) {
  if(!("mozChannels" in mediaElement)) {
    throw "Audio Data API read is not supported";
  }
  this.mediaElement = mediaElement;
}

AudioDataSource.prototype.readAsync = function(destination) {
  this.__destination = destination;
  var source = this;

  function onAudioAvailable(event) {
    var soundData = event.frameBuffer;
    var written = destination.write(soundData);
    /* ignoring if whole data was not written */
  }

  function onLoadedMetadata(event) {
    if(source.__destinationInitialized) {
      return;
    }

    source.onload();
  }

  var media = this.mediaElement;
  media.addEventListener("MozAudioAvailable", onAudioAvailable, false);
  media.addEventListener("loadedmetadata", onLoadedMetadata, false);
  this.__removeListeners = function() {
    media.removeEventListener("MozAudioAvailable", onAudioAvailable, false);
    media.removeEventListener("loadedmetadata", onLoadedMetadata, false);    
  };

  // Time to initialize?
  if(media.readState != 0) {
    // all except HAVE_NOTHING
    this.onload();
  }
};

AudioDataSource.prototype.shutdown = function() {
  if(this.__removeListeners) {
    this.__removeListeners();
    delete this.__removeListeners;
  }
  if(this.__destinationInitialized) {
    this.__destination.shutdown();
    delete this.__destinationInitialized;
  }
  delete this.__destination;
};

AudioDataSource.prototype.onload = function() {
  var media = this.mediaElement;
  var audioParameters = new AudioParameters(media.mozChannels, media.mozSampleRate);
  this.audioParamaters = audioParameters;

  this.__destination.init(audioParameters);
  this.__destinationInitialized = true;
};

/* AudioDataDestination */
function AudioDataDestination() {
  this.autoLatency = false;
  this.latency = 0.5;
}

AudioDataDestination.prototype.init = function(audioParameters) {
  this.audioParameters = audioParameters;
  var audio = new Audio();
  if(!("mozSetup" in audio)) {
    throw "Audio Data API write is not supported";
  }
  audio.mozSetup(audioParameters.channels, audioParameters.sampleRate);
  this.__audio = audio;
  this.currentPlayPosition = 0;
  this.currentWritePosition = 0;
};

AudioDataDestination.prototype.shutdown = function() {
  if(this.__asyncInterval) {
    clearInterval(this.__asyncInterval);
    delete this.__asyncInterval;
  }
  delete this.__audio;
};

AudioDataDestination.prototype.write = function(data) {
  return this.__audio.mozWriteAudio(data);
};

AudioDataDestination.prototype.writeAsync = function(source) {
  var audioParameters = source.audioParameters;
  var channels = audioParameters.channels;
  var samplesPerSecond = channels * audioParameters.sampleRate;
  this.init(audioParameters);
  
  var tail = null;
  var autoLatency = this.autoLatency;
  var prebufferSize, prebufferSizeDelta;

  if(autoLatency) {
    this.latency = 0;
    prebufferSize = samplesPerSecond * 0.020; // initial latency 20ms
    prebufferSizeDelta = samplesPerSecond * 0.010; // with 10ms step
  } else {
    prebufferSize = samplesPerSecond * this.latency;
  }

  var destination = this;
  var audio = this.__audio;

  // The function called with regular interval to populate 
  // the audio output buffer.
  this.__asyncInterval = setInterval(function() {
    // Updating the play position.
    destination.currentPlayPosition = audio.mozCurrentSampleOffset();

    var written;
    // Check if some data was not written in previous attempts.
    if(tail) {  
      written = audio.mozWriteAudio(tail);
      destination.currentWritePosition += written;
      if(written < tail.length) {
        // Not all the data was written, saving the tail...
        tail = tail.slice(written);
        return; // ... and exit the function.
      }
      tail = null;
    }

    // Check if we need add some data to the audio output.
    var available = destination.currentPlayPosition + 
                    prebufferSize - destination.currentWritePosition;

    // Auto latency detection
    if(autoLatency) {
      if(destination.currentPlayPosition) { // play position moved
       if(destination.currentPlayPosition === destination.currentWritePosition) {
         // bug 591719 workaround
         prebufferSize += prebufferSizeDelta;               
       } else {
         autoLatency = false;
         prebufferSize += 2 * prebufferSizeDelta; // add couple for missed timer events
         destination.latency = prebufferSize / samplesPerSecond;
       }
      } else {
        prebufferSize += prebufferSizeDelta;
      }
    }

    if(available >= channels) {
      // Request some sound data from the callback function, align to channels boundary.
      var soundData = new Float32Array(available - (available % channels));
      var read = source.read(soundData);
      if(!read) {
        return; // no new data found
      }

      if(read < available) {
        soundData = soundData.slice(0, read);
      }

      // Writting the data.
      written = audio.mozWriteAudio(soundData);
      if(written < soundData.length) {
        // Not all the data was written, saving the tail.
        tail = soundData.slice(written);
      }
      destination.currentWritePosition += written;
    }
  }, 10);
};

/* AudioDataMixer */
function AudioDataMixer(audioParameters) {
  this.audioParameters = audioParameters;
  this.__inputs = [];
}

AudioDataMixer.prototype.addInput = function(input) {
  if(!input.audioParameters.match(this.audioParameters)) {
    throw "Invalid input parameters";
  }
  this.__inputs.push(input);
};

AudioDataMixer.prototype.removeInput = function(input) {
  var index = 0;
  while(index < this.__inputs.length && this.__inputs[index] !== input) {
    ++index;
  }
  if(index < this.__inputs.length) {
    this.__inputs.splice(index, 1);
  }
};

AudioDataMixer.prototype.read = function(soundData) {
  var size = soundData.length;
  for(var i=0;i<this.__inputs.length;++i) {
    var data = new Float32Array(size);
    var read = this.__inputs[i].read(data);
    for(var j=0;j<read;++j) {
      soundData[j] += data[j];
    }
  }
  return size;
};

/* AudioDataSplitter */

function AudioDataSplitter() {
  this.__outputs = [];
}

AudioDataSplitter.prototype.addOutput = function(output) {
  this.__outputs.push(output);
  if(this.audioParameters) {
    output.init(this.audioParameters);
  }
};

AudioDataSplitter.prototype.removeOutput = function(output) {
  var index = 0;
  while(index < this.__outputs.length && this.__output[index] !== output) {
    ++index;
  }
  if(index < this.__inputs.length) {
    this.__outputs.splice(index, 1);
    if(this.audioParameters) {
      output.shutdown();
    }
  }
};

AudioDataSplitter.prototype.init = function(audioParameters) {
  this.audioParameters = audioParameters;
  for(var i=0;i<this.__outputs.length;++i) {
    this.__outputs[i].init(audioParameters);
  }
};

AudioDataSplitter.prototype.shutdown = function() {
  for(var i=0;i<this.__outputs.length;++i) {
    this.__outputs[i].shutdown();
  }
  delete this.audioParameters;
};

AudioDataSplitter.prototype.write = function(soundData) {
  for(var i=0;i<this.__outputs.length;++i) {
    this.__outputs[i].write(soundData);
  }
  return soundData.length;
};


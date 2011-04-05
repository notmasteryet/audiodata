// Mock DOM objects with Audio Data API
load("../misc/dsp.js");

function Audio() {
  this.readState = 0;
  this.__written = [];
  this.__playbackPosition = 0;
  this.__hardwareBuffer = 0.4;
  this.__hardwareWritten = [];
}
Audio.prototype.addEventListener = addEventListener;
Audio.prototype.removeEventListener = removeEventListener;
Audio.prototype.__dispatchEvent = __dispatchEvent;
Audio.prototype.mozChannels = void(0);
Audio.prototype.mozSampleRate = void(0);
Audio.prototype.mozFrameBufferSize = void(0);
Audio.prototype.mozSetup = function(channels, sampleRate) {
  this.mozChannels = channels;
  this.mozSampleRate = sampleRate;
  var audio = this, started = new Date().valueOf();
  var lag = channels * sampleRate * audio.__hardwareBuffer;
  var interval = setInterval(function() {
    var hardwareWritten = (new Date().valueOf() - started) / 1000 * channels * sampleRate;
    var write = Math.floor(hardwareWritten - audio.__hardwareWritten.length);
    if(audio.__playbackPosition < audio.__written.length) {
      while(write > 0 && lag > 0) {
        audio.__hardwareWritten.push(NaN);
        write--;
        lag--;
      }
      while(write > 0 && audio.__playbackPosition < audio.__written.length) {
        audio.__hardwareWritten.push(audio.__written[audio.__playbackPosition++]);
        write--;
      }
    } 
    if (write > 0 && audio.__playbackPosition >= audio.__written.length) {
      lag = channels * sampleRate * audio.__hardwareBuffer;
    }
    while(write > 0) {
      audio.__hardwareWritten.push(NaN);
      write--;
    }
  }, 10);
};
Audio.prototype.mozCurrentSampleOffset = function() {
  return this.__playbackPosition;
};
Audio.prototype.mozWriteAudio = function(data) {
  for(var i=0,len=data.length;i<len;++i) {
    this.__written.push(data[i]);
  }
  return data.length;
};
Audio.prototype.__play = function(channels, sampleRate, data) {
  this.mozChannels = channels;
  this.mozSampleRate = sampleRate;
  this.mozFrameBufferSize = this.mozChannels * 1024;

  var position = 0, audio = this, 
    samplesPerSecond = this.mozSampleRate * this.mozChannels;
  this.__dispatchEvent("loadedmetadata", { target: audio });
  this.readState = 1;
  var started = new Date().valueOf();
  var interval = setInterval(function() {
    var passed = (new Date().valueOf() - started) / 1000 * samplesPerSecond;
    var portion = audio.mozFrameBufferSize;
    if(position <= passed) {
      this.readState = 2;
      var tmp = (data.subarray ? data.subarray : data.slice)(position, position + portion);
      if(tmp.length < portion) {
        var tmp2 = new Float32Array(portion);
        for(var j=0;j<tmp.length;++j) tmp2[j] = tmp[j];
        tmp = tmp2;
      }
      var e = { target: audio, 
        time: position / samplesPerSecond, 
        frameBuffer: tmp };
      audio.__dispatchEvent("MozAudioAvailable", e);
      position += portion;
    }
    if(position >= data.length) {
      clearInterval(interval);
    }
  }, 10);
}

var window = this;

var __timers = [];

function setInterval(fn, timeout) {
  var obj = {};
  obj.fn = fn;
  obj.timeout = timeout;
  obj.next = new Date().valueOf() + timeout;
  __timers.push(obj);
  return obj;
}

function clearInterval(t) {
  var i=0;
  while(i < __timers.length) {
    if(__timers[i] === t) {
      __timers[i].remove = true;
      break;
    }
    i++;
  }
}

// TODO setTimeout

function __executeTimers(time) {
  var i = 0;
  while(i < __timers.length) {
    if(__timers[i].next <= time) {
      __timers[i].fn(); // TODO params
      if("timeout" in __timers[i]) {
        __timers[i].next = time + __timers[i].timeout;
      } 
    }
    ++i;
  }
  i = 0;
  while(i < __timers.length) {
    if(__timers[i].remove) {
      __timers.splice(i, 1);
    } else 
      ++i;
  }
}

function addEventListener(name, fn, hook) {
  if(!("__listeners" in this)) this.__listeners = [];
  this.__listeners.push( { name: name, fn: fn } );
}

function removeEventListener(name, fn, hook) {
  var i=0;
  while(i < this.__listeners.length) {
    if(this.__listeners[i].name === name && this.__listeners[i].fn === fn) {
      this.__listeners.splice(i, 1);
      break;
    }
    i++;
  }
}

function __dispatchEvent(name, e) {
  if("__listeners" in this) {
    for(var i=0;i<this.__listeners.length;++i) {
      if(this.__listeners[i].name === name) {
       this.__listeners[i].fn(e);
      }
    }
  }
}

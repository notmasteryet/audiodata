// Mock DOM objects with Audio Data API

function Audio() {
  this.mozChannels = void(0);
  this.mozSampleRate = void(0);
  this.mozFrameBufferSize = void(0);
  this.readState = 0;
  this.__written = [];
}
Audio.prototype.addEventListener = addEventListener;
Audio.prototype.removeEventListener = removeEventListener;
Audio.prototype.__dispatchEvent = __dispatchEvent;
Audio.prototype.mozSetup = function(channels, sampleRate) {
  this.mozChannels = channels;
  this.mozSampleRate = sampleRate;
};
Audio.prototype.mozCurrentSampleOffset = function() {
  return this.__written.length;
};
Audio.prototype.mozWriteAudio = function(data) {
  this.__written = this.__written.concat(data);
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
      var tmp = data.slice(position, position + portion);
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

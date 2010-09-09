function InvertFilter(next) {
  AudioDataFilter.call(this, next);
  this.process = function(data, length) {
    for(var k=0;k<length;++k) {
      data[k] = -data[k];
    }
  }
};
InvertFilter.prototype = new AudioDataFilter(null);


function test() {
  var len = 64000, samples = new Float32Array(len);

  for(var i = 0; i < len; ++i) {
    samples[i] = 1 / (i + 1);
  }

  var dest = new AudioDataMemoryDestination();
  var filter1 = new InvertFilter(dest);
  var written = filter1.write(samples); // write copy
  var writtenData = dest.toArray();

  Assert.assertEquals(written, len, "Data written result");
  Assert.assertEquals(writtenData.length, len, "Data written length");
  var writtenIsGood = true;
  for(var i=0;i<len;++i) {
    if(writtenData[i] !== -samples[i]) {writtenInGood = false; break;}
  }
  Assert.assertTrue(writtenIsGood, "Data write inverted");

  for(var i = 0; i < len; ++i) {
    samples[i] = 1 / (i + 1);
  }

  var audioParams = new AudioParameters(1, 44100);
  var source = new AudioDataMemorySource(audioParams, samples);
  var filter2 = new InvertFilter(source);
  var read1 = new Float32Array(len), read2 = new Float32Array(1);
  var read = filter2.read(read1), noRead = filter2.read(read2);
  Assert.assertEquals(read, len, "Data read result");
  Assert.assertEquals(noRead, EndOfAudioStream, "Data read #2 result");
  var readIsGood = true;
  for(var i=0;i<len;++i) {
    if(read1[i] !== -samples[i]) {readIsGood = false; break;}
  }
  Assert.assertTrue(readIsGood, "Data read inverted");
}

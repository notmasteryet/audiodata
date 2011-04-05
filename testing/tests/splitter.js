function test() {
  var len = 64000, samples = new Float32Array(len);
  for(var i = 0; i < len; ++i) {
    samples[i] = 1 / (i + 1);
  }
  var checksum = 0, checkLength = len;
  for(var i = 0; i < checkLength; ++i) {
    checksum += samples[i];
  }

  var dest1 = new AudioDataMemoryDestination();
  var dest2 = new AudioDataMemoryDestination();
  var splitter = new AudioDataSplitter();
  splitter.addOutputDestination(dest1);
  splitter.addOutputDestination(dest2);

  var audioParams = new AudioParameters(1, 44100);
  splitter.init(audioParams);  
  splitter.write(samples.subarray(0, 10));
  splitter.write(samples.subarray(10));
  splitter.shutdown();
  
  Assert.assertEquals(dest1.currentWritePosition, len, "Data written #1");
  Assert.assertEquals(dest2.currentWritePosition, len, "Data written #2");

  var res1 = dest1.toArray();
  Assert.assertEquals(res1.length, len, "toArray #1");
  var res2 = dest2.toArray();
  Assert.assertEquals(res2.length, len, "toArray #2");

  var sum1 = 0, sum2 = 0;
  for (var j = 0; j < len; ++j) {
    sum1 += res1[j];
    sum2 += res2[j];
  }
  Assert.assertEquals(sum1, checksum, "Data checksum #1");
  Assert.assertEquals(sum2, checksum, "Data checksum #2");
}

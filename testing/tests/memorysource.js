function test() {
  var len = 64000, samples = new Float32Array(len);
  for(var i = 0; i < len; ++i) {
    samples[i] = 1 / (i + 1);
  }
  var checksum = 0, checkLength = len;
  for(var i = 0; i < checkLength; ++i) {
    checksum += samples[i];
  }

  var source = new AudioDataMemorySource(new AudioParameters(1, 44100), samples);

  var dest = new AudioDataDestination();
  dest.writeAsync(source);
  
  var written = dest.__audio.__hardwareWritten; // internal vars
  Testing.waitForExit(2500);

  Assert.assertEquals(dest.currentWritePosition, len, "Data written");

  var sum = 0, checked = 0;
  for (var j = 0; j < written.length; ++j) {
    if (isNaN(written[j])) continue;
    sum += written[j];
    if (++checked >= checkLength) break;
  }
  Assert.assertEquals(sum, checksum, "Data checksum");
}

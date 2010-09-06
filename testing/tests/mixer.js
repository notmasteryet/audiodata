function test() {
  var len = 64, samples = new Float32Array(len);
  var checksum = 0;
  for(var i = 0; i < len; ++i) {
    samples[i] = 1 / (i + 1);
    checksum += 2*samples[i];
  }

  var audioParams = new AudioParameters(1, 44100);
  var source1 = new AudioDataMemorySource(audioParams, samples);
  var source2 = new AudioDataMemorySource(audioParams, samples);

  var mixer = new AudioDataMixer(audioParams);
  mixer.addInputSource(source1);
  mixer.addInputSource(source2);

  var check1 = new Float32Array(10), check2 = new Float32Array(len), check3 = new Float32Array(len);
  var l1 = mixer.read(check1);
  Assert.assertEquals(l1, check1.length, "Read #1 result");
  var l2 = mixer.read(check2);
  Assert.assertEquals(l2, check2.length, "Read #2 result");

  var j=0;
  for(var i=0;i<l1;++i) check3[j++] = check1[i];
  for(var i=0;i<l2;++i) check3[j++] = check2[i];

  var sum = 0, checked = 0;
  for (var j = 0; j < len; ++j) {
    sum += check3[j];
  }
  Assert.assertEquals(sum, checksum, "Data checksum");
}

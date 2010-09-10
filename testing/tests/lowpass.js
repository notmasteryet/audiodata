function test() {
  var len = 1024, samples1 = new Float32Array(len), samples2 = new Float32Array(len);
  var sampleRate = 44100, audioParams = new AudioParameters(1, sampleRate);
  
  var k1 = 2 * Math.PI * 200 / sampleRate;
  var k2 = 2 * Math.PI * 800 / sampleRate;
  for(var i = 0; i < len; ++i) {
    samples1[i] = samples2[i] = Math.sin(k1 * i) + Math.sin(k2 * i);
  }

  var ff1 = new FFT(len, sampleRate);
  var ff2 = new FFT(len, sampleRate);

  var dest = new AudioDataMemoryDestination();
  var filter = new AudioDataLowPassFilter(dest, 400);
  filter.init(audioParams);
  filter.write(samples2);
  filter.shutdown();

  var result = dest.toArray();

  ff1.forward(samples1);
  ff2.forward(result);

  var backet1 = Math.round(200 * len / sampleRate);
  var backet2 = Math.round(800 * len / sampleRate);

  Assert.assertTrue((ff1.spectrum[backet1] - ff2.spectrum[backet1]) < 0.1, "Low frequency sound must stay");
  Assert.assertTrue((ff1.spectrum[backet2] - ff2.spectrum[backet2]) > 0.1, "High frequency sound must be removed");
}

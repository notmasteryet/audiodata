function test() {
  var len = 6000, samples = new Float32Array(len);
  var sampleRate = 44100, audioParams = new AudioParameters(2, sampleRate);
  var fftFrameLength = 1024;
  
  var k = 2 * Math.PI * 800 / sampleRate;
  for(var i = 0, j = 0; i < len; i+=2, j++) {
    samples[i + 1] = samples[i] = Math.sin(k * j);
  }

  function cloneArray(ar) {
    var len = ar.length, res = new Float32Array(len);
    for(var q=0;q<len;++q) res[q] = ar[q];
    return res;
  }

  var results = [];
  var analyzer = new AudioDataAnalyzer(fftFrameLength);
  analyzer.onDataAnalyzed = function(e) {
    var res = [];
    for(var j=0;j<e.spectrums.length;j++) {
      res.push(cloneArray(e.spectrums[j]));
    }
    results.push(res);
  };

  analyzer.init(audioParams);
  analyzer.write(samples);
  analyzer.shutdown();

  var backet = Math.round(800 * fftFrameLength / sampleRate);

  Assert.assertEquals(results.length, 3, "Amount of results");
  var isFreqDetected = true, isChannelsOk = true, isSpectrumLengthOk = true;
check1:
  for(var j=0;j<results.length;j++) {
    var res = results[j];
    if(res.length !== 2) { isChannelsOk = false; break check1; }
    for(var q = 0;q<res.length;++q) {
      var chanRes = res[q];
      if(chanRes.length != fftFrameLength/2) { isSpectrumLengthOk = false; break check1; }
      if(results[0][0][backet] < 0.5) { isFreqDetected = false; break check1; }
    }
  }
  Assert.assertTrue(isFreqDetected, "Frequency was detected");
  Assert.assertTrue(isChannelsOk, "Channels amount is wrong");
  Assert.assertTrue(isSpectrumLengthOk, "Spectrum length");
  Assert.assertTrue(results[0][0][backet] > results[2][0][backet], "Last frame has less frequency");
}

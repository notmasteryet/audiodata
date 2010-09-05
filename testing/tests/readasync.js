function test() {
  var audio = new Audio(), obj = new AudioDataSource(audio);

  var params = null;
  var dataWritten = 0;
  var shutdownCalled = false;
  var dest = {
    init: function(params_) { params = params_; },
    write: function(data) { dataWritten += data.length; return data.length; },
    shutdown: function() { shutdownCalled = true;  }
  };

  obj.readAsync(dest);

  var testData = new Float32Array(80000);
  audio.__play(2, 44100, testData);
  Testing.waitForExit(1500);

  obj.shutdown();

  Assert.assertNotNull(params, "Sound parameters was not set");
  Assert.assertEquals(params.channels, 2, "Channels in parameters");
  Assert.assertEquals(params.sampleRate, 44100, "Sample rate in parameters");
  Assert.assertEquals(dataWritten, 81920, "All data written");
  Assert.assertTrue(shutdownCalled, "Shutdown is called");
}

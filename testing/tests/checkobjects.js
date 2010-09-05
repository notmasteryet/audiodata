function test() {
  Assert.assertTrue(AudioDataSource instanceof Function, "AudioDataSource exists");
  var audio = new Audio(), obj = new AudioDataSource(audio);
  Assert.assertTrue(obj.readAsync instanceof Function, "Check IAudioDataSourceMaster.readAsync");
  Assert.assertTrue(obj.shutdown instanceof Function, "Check IAudioDataSourceMaster.shutdown");

  Assert.assertTrue(AudioDataDestination instanceof Function, "AudioDataDestination exists");
  var dest = new AudioDataDestination();
  Assert.assertTrue(dest.writeAsync instanceof Function, "Check IAudioDataDestinationMaster.writeAsync");
  Assert.assertTrue(dest.init instanceof Function, "Check IAudioDataDestination.init");
  Assert.assertTrue(dest.write instanceof Function, "Check IAudioDataDestination.write");
  Assert.assertTrue(dest.shutdown instanceof Function, "Check IAudioDataDestination.shutdown");

  Assert.assertTrue(AudioParameters instanceof Function, "AudioParameters exists");
  var params = new AudioParameters(2, 44100);
  Assert.assertEquals(params.channels, 2);
  Assert.assertEquals(params.sampleRate, 44100);

}

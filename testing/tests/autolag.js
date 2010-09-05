function test() {
  var source = {
    audioParameters : new AudioParameters(1, 44100),
    len: 64000, // more than a second
    read : function(data) {
      var read = Math.max(this.len, data.length);
      this.len -= read;
      return read;
    }
  };

  var dest = new AudioDataDestination();
  dest.autoLatency = true;
  dest.writeAsync(source);

  Testing.waitForExit(1500);

  Assert.assertTrue(dest.currentWritePosition > 64000, "Data written");
  // mock hardware lag in 0.4s
  Assert.assertTrue(Math.abs(dest.latency - 0.425) <= 0.025, "Latency detected " + dest.latency + "; expected in 0.40-0.45");
}

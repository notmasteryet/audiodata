var Assert = {
  __Inconclusive: function(msg) { this.msg },
  assertEquals: function(actual, expected, msg) {
    if(actual !== expected) {
      throw (msg || "assertEquals failed") +
        ". Expected: " + expected + "; Actual: " + actual;
    }
  },
  assertTrue: function(actual, msg) {
    if(actual !== true) {
      throw (msg || "assertEquals failed") +
        ". Expected true";
    }
  },
  assertFalse: function(actual, msg) {
    if(actual !== false) {
      throw (msg || "assertEquals failed") +
        ". Expected false";
    }
  },
  assertNull: function(actual, msg) {
    if(actual !== null) {
      throw (msg || "assertNull failed") +
        ". Expected null";
    }
  },
  assertNotNull: function(actual, msg) {
    if(actual === null) {
      throw (msg || "assertNotNull failed") +
        ". Expected not null";
    }
  },
  fail: function(msg) {
    throw (msg || "fail");
  },
  inconclusive: function(msg) {
    throw new Assert.__Inconclusive(msg || "inconclusive");
  }
};

print("RUNNING: " + __testId);

var Testing = {
  __exited : false,
  waitForExit : function(maxTime) {
    var startTime = new Date().valueOf();
    var endTime = startTime + (maxTime || 36000000);
    var currentTime;
    do {
      if(this.__exited) break;
      currentTime = new Date().valueOf();
      __executeTimers(currentTime);
    } while(currentTime < endTime);
  },
  exit : function() {
    this.__exited = true;
  }
};

try {
  test();
  print("TEST PASSED");
} catch(e) {
  if(e instanceof Assert.__Inconclusive) {
    print(e);
    print("TEST INCONCLUSIVE");
  } else {
    print("Exception: " + e);
    print("TEST FAILED");
  }
}

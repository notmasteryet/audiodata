var results = snarf("logs/testing.log");

var items = results.split(/(RUNNING:\s[^\n]+)/g);
var totalCount = items.length >> 1;
var passed=0,failed=0,inconclusive=0;
var errors = [];
for(var i=0;i<totalCount;++i) {
  var testResult = items[(i << 1) + 2];
  if(testResult.match(/TEST PASSED/))
    ++passed;
  else if(testResult.match(/TEST INCONCLUSIVE/))
    ++inconclusive;
  else {
    errors.push(items[(i << 1) + 1]);
    errors.push(items[(i << 1) + 2]); 
    ++failed;
  }
}

if(errors.length > 0) {
  print("TEST FAILURES FOUND:");
  print(errors.join(""));
}
print("TESTING SUMMARY");
print("Total: " + totalCount + "; Passed: " + passed + "; Failed: " + failed + "; Inconclusive: " + inconclusive);

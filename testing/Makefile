TESTS = \
	checkobjects.js \
	readasync.js

.PHONY: run-tests clean-log $(TESTS) print-report
.SILENT: run-tests clean-log $(TESTS) print-report
.IGNORE: $(TESTS)

run-tests: clean-log $(TESTS) print-report

clean-log:
	rm -rf logs/
	mkdir logs

$(TESTS):
	$(JSSHELL) -t 30 -f mockdom.js -e "var __testId = '$@'; " -f ../audiodata.js \
		-f tests/$@ -f runtest.js 1>>logs/testing.log 2>>logs/testing.log

print-report:
	$(JSSHELL) -f printreport.js


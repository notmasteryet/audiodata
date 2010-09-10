TESTS = \
	checkobjects.js \
	readasync.js \
	autolag.js \
	memorysource.js \
	mixer.js \
	splitter.js \
	filter.js \
	lowpass.js \
	analyzer.js \
	$(NULL)

ifdef TEST
  EFFECTIVE-TESTS = $(filter $(TEST), $(TESTS))
else
  EFFECTIVE-TESTS = $(TESTS)
endif

.PHONY: run-tests clean-log $(TESTS) print-report
.SILENT: run-tests clean-log $(TESTS) print-report
.IGNORE: $(TESTS)

run-tests: clean-log $(EFFECTIVE-TESTS) print-report

clean-log:
	rm -rf logs/
	mkdir logs

$(TESTS):
	echo "Testing $@ ..."
	$(JSSHELL) -t 30 -f mockdom.js -e "var __testId = '$@'; " -f ../audiodata.js \
		-f tests/$@ -f runtest.js 1>>logs/testing.log 2>>logs/testing.log

print-report:
	$(JSSHELL) -f printreport.js

get-lint:
	wget http://www.jslint.com/rhino/jslint.js

run-lint: jslint.js
	$(JSSHELL) -e "var readFile=snarf;" jslint.js "../audiodata.js"


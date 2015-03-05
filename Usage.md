# Introduction #

Javascript unit tests can be collected together in one or more html files.  A master unit test can also run tests in a separate file and report the summary of the results.

# Formatting a Unit Test HTML file #

Unit test files contain collections of named tests.  Each test executes javascript code interspersed with Assert calls to verify the expected results.

The Unit test framework executes each of the tests in sequence, and displays the result within the test page.

Each unit test file is structured like this example:

```
<html>
<head>
<title>Example Unit Test</title>
<script src="unit.js"></script>
<body>
<h1><script>document.write(document.title);</script></h1>
<script>

function Sample()
{
	this.x = 1;
}

Sample.prototype.Double = function()
{
	this.x *= 2;
}

ts = new UT.TestSuite();
ts.DWOutputDiv();

ts.AddTest("All Pass", function(ut)
{
	var s = new Sample();
	ut.Assert(s.x == 1, "Constructor");
	s.Double();
	ut.Assert(s.x == 2, "Double Test 1");
	s.x = 10;
	s.Double();
	ut.Assert(s.x == 20, "Double Test 2");
	ut.AssertEval("1+1==2");
	ut.AssertGT(2, 1);
	ut.AssertGT("Z", "A");
});

ts.AddTest("All Fail", function(ut)
{
	ut.Assert(false);
	ut.AssertEval("1+1 == 3");
	ut.AssertEq(1, 2);
	ut.AssertNEq("hello", "hello");
	ut.AssertGT(1, 2);
	ut.AssertGT(undefined, 2);
	ut.AssertGT("A", "Z");
	var x = 7;
	ut.AssertFn(function () { return x != 7; });
	ut.AssertFn(new Function);
	ut.AssertFn(function () { });
	IllegalFunction();
});

ts.Run();
ts.Report();

</script>
</body>
</html>
```

This results in the following in-page report:
---
```
Unit Test Output

1. PASS [All Pass] 0 errors out of 6 tests
2. FAIL [All Fail] 11 errors out of 11 tests
Failed: 1. undefined
Failed: 2. 1+1 == 3
Failed: 3. 1 == 2 (type: number)
Failed: 4. hello != hello
Failed: 5. 1 > 2
Failed: 6. undefined > 2
Failed: 7. A > Z
Failed: 8. return x != 7;
Failed: 9.
Failed: 10.
Failed: 11. Exception: ReferenceError (IllegalFunction is not defined) @ line 49
Summary: 1 failures out of 2 tests.
```
---

# Unit Test (UT) Classes and Functions #

**TestSuite** - Class for creating a collection of unit tests.

ts = new **UT.TestSuite**() - A TestSuite contains a collection of unit test functions.

ts.**DWOutputDiv**() - document.write a ` <div> ` into the file which will contain the test report output.

ts.**AddTest**("test name", function(ut) {...}) - Add a test function to the TestSuite.  When run, the unit text context, _ut_, is passed in.
> Returns a unit-test context object, ut (see below).

ts.**SkipTo**(i) - Start at the ith (1-based) test rather than start at the beginning.

ts.**Run**() - Run all the tests in the suite.

ts.**Report**() - Display the results of the tests (runs asynchronously to the tests running).

# Unit Test context functions #

ut.**Assert**(f, stNote1, stNote2) - If f is false, displays error string "N. [Trace](Trace.md) Note (Note2)"

ut.**AssertEval**(sExp) - Asserts that the expression (string) evaluates to true.

ut.**AssertEq**(v1, v2, stNote) - Assert that the two values are equal.
> Can compare objects and arrays - but only tests top level (not deep) equality.  By convension, v1 is a computed value, and v2 is the expected (constant) value of the computation.

ut.**AssertIdent**(v1, v2) - Assert that values are identical - objects point to the _same_ object instance.

ut.**!AssertNEq**(v1, v2) - Assert two values are _not_ equal.

ut.**!AssertGT**(v1, v2) - Assert that v1 is greater than v2.

ut.**!AssertLT**(v1, v2) - Assert that v1 is less than v2.

ut.**AssertFn**(fn) - Asserts that the value of the passed in function returns _true_.

ut.**AssertThrows**(sType, function (ut) {...}) - Assert that the called function throws an exception of the given type, sType.

ut.**AssertContains**(obj, objHas) - Assert that _obj_ contains all of the properties of objHas.
> This is a shallow object comparison.  It can be used for arrays or objects.

ut.**Async**(f=true, ms=10000) - Mark the current test as executing asynchronously.
> The test framework will not continue until the testing code calls ut.Async(false) (or
> until the current timeout interval has expired).  By default, unit tests are given 10
> seconds (10,000 milliseconds) to execute before being abandoned.

ut.**AsyncSquence**(` [fn1, fn2, ..., fnN] `) - Call each of the test functions passed in the array.
> Each fn(ut) must call ut.NextFn() to advance to the next function (this allows the functions to be called asynchronously and await their results).
> The last call to NextFn calls ut.Async(false) to complete the outer (Asynchronous) unit test.

ut.**FnWrap**(fn) - Wrap a function call to catch possible exceptions and report them in the error framework.
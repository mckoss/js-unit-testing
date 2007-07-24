// unit.js - Unit testing framework
// Copyright (c) 2007, Mike Koss (mike@mckoss.com)
//
// Usage:
// ts = new mckoss.TestSuite("Suite Name");
// ts.DWOutputDiv();
// ts.AddTest("Test Name", function(ut) { ... ut.Assert() ... });
// ...
// ts.Run();
// ts.Report();
//
// Requires: base.js, timer.js

// UnitTest - Each unit test calls a function which in turn calls
// back Assert's on the unit test object.

mckoss.AddClass("UnitTest", function (stName, fn)
{
	this.stName = stName;
	this.fn = fn;
	this.rgres = [];
});

mckoss.UnitTest.prototype = {
    state: 0,
    cErrors: 0,
    cErrorsExpected: 0,
    cAsserts: 0,
    fEnable: true,
    fAsync: false,
    fThrows: false,
    cThrows: 0,

Run: function(ts)
    {
	var fCaught = false;

	if (!this.fEnable)
		return;
	this.state = 1;

	try
		{
		this.fn(this);
		}
	catch (e)
		{
		fCaught = true;
		this.fAsync = false;
		this.e = e;
		if (this.fThrows)
			this.AssertException(this.e, this.stThrows);
		else
		    {
		    var stMsg = "Exception: " + e.name + " (" + e.message;
		    if (e.number != undefined)
		        {
		        if (e.number < 0)
		            e.number = -e.number;
		        stMsg += " 0x" + e.number.toString(16).toUpperCase();
		        }
			stMsg += ")";
			if (e.lineNumber != undefined)
			    stMsg += " @ line " + e.lineNumber;
			this.Assert(false, stMsg);
			}
		}
	
	if (this.fThrows && !fCaught)
		this.Assert(false, "Missing expected Exception: " + this.stThrows);

	if (!this.fAsync)
		this.state = 2;
    },

AssertThrown: function()
    {
    this.AssertGT(this.cThrows, 0, "Expected exceptions not thrown.");
    this.cThrows = 0;
    },

Enable: function(f)
    {
	this.fEnable = f;
	return this;
    },

Async: function(f)
    {
	if (f == undefined)
		f = true;
	this.fAsync = f;
	if (!this.fAsync && this.state == 1)
		this.state = 2;
	this.CheckValid();
	return this;
    },

Throws: function(stThrows)
    {
	this.fThrows = true;
	this.stThrows = stThrows;
	this.CheckValid();
	return this;
    },

Expect: function(cErrors, cTests)
    {
	this.cErrorsExpected = cErrors;
	this.cTestsExpected = cTests;
	return this;
    },

CheckValid: function()
    {
	if (this.fAsync && this.fThrows)
		this.Assert(false, "Test error: can't test async thrown exceptions.");
    },
    
Reference: function(url)
    {
    this.urlRef = url;
    return this;
    },

Assert: function(f, stNote)
    {
	var res = new mckoss.TestResult(f, this, stNote);
	this.rgres.push(res);
	if (!res.f)
		this.cErrors++;
	this.cAsserts++;
    },

AssertEval: function(stEval)
    {
	this.Assert(eval(stEval), stEval);
    },

AssertEq: function(v1, v2)
    {
	this.Assert(v1 == v2, v1 + " == " + v2);
    },

AssertNEq: function(v1, v2)
    {
	this.Assert(v1 != v2, v1 + " != " + v2);
    },

AssertGT: function(v1, v2)
    {
    this.Assert(v1 > v2, v1 + " > " + v2);
    },

AssertFn: function(fn)
    {
	var stFn = fn.toString();
	stFn = stFn.substring(stFn.indexOf("{")+1, stFn.lastIndexOf("}")-1);
	this.Assert(fn(), stFn);
    },

// Assert expected and caught exceptions
// If stExpected != undefined, e.name or e.message must contain it
AssertException: function(e, stExpected)
    {
	this.Assert(!stExpected || e.name.indexOf(stExpected) != -1 ||
		e.message.indexOf(stExpected) != -1,
		"Exception: " + e.name + " (" + e.message + ")" +
		(stExpected ? " Expecting: " + stExpected : ""));
    this.cThrows++;
    }
};

// TestResult - a single result from the test

mckoss.AddClass("TestResult", function (f, ut, stNote)
{
	this.f = f;
	this.ut = ut;
	this.stNote = stNote;
});

// Test Suite - Holds, executes, and reports on a collection of unit tests.

mckoss.AddClass("TestSuite", function (stName)
{
	this.stName = stName;
	this.rgut = [];
	this.stOut = "";
});


mckoss.TestSuite.prototype = {
    cFailures: 0,
    iWait: 0,

AddTest: function(stName, fn)
    {
	var ut = new mckoss.UnitTest(stName, fn);
	this.rgut.push(ut);
	return ut;	
    },

Run: function()
    {
	var i;
	
	for (i = 0; i < this.rgut.length; i++)
		{
		this.utCur = this.rgut[i];
		this.utCur.Run(this);
		}
    },

IsComplete: function()
    {
	var i;

	for (i = 0; i < this.rgut.length; i++)
		{
		var ut = this.rgut[i];
		if (ut.fEnable && ut.fAsync)
			return false;
		}
	return true;
    },
    
DWOutputDiv: function()
    {
    mckoss.DW("<DIV style=\"font-family: Courier;border:1px solid red;\" id=\"divUnit\">Unit Test Output</DIV>");
    },

Out: function(st)
    {
	this.stOut += st;
	return this;
    },
    
OutRef: function(st, url)
    {
    if (!url)
        {
        this.Out(st);
        return;
        }
    if (this.divOut)
        this.Out("<A target=\"_blank\" href=\"" + url + "\">" + st + "</A>");
    else
        {
        if (st != url)
            this.Out(st + " (" + url + ")");
        else
            this.Out(st);
        }
    },

NL: function()
    {
    if (this.divOut)
        {
        this.divOut.appendChild(document.createElement("BR"));
        var txt = document.createElement("span");
        txt.innerHTML = this.stOut;
        this.divOut.appendChild(txt);
        }
	else if (typeof console != "undefined")
		console.log(this.stOut);
	else
		alert(this.stOut);
	this.stOut = "";
	return this;
    },

Report: function()
    {
	var i;
	var j;

    this.divOut = this.divOut || document.getElementById("divUnit");
	
	this.cFailures = 0;

	for (i = 0; i < this.rgut.length; i++)
		{
		var ut = this.rgut[i];

		this.Out((i+1) + ". ");

		switch (ut.state)
			{
		case 0:
			this.Out("N/A");
			break;
		case 1:
			if (ut.fAsync)
				this.Out("RUNNING");
			else
			    {
				this.Out("INCOMPLETE");
				}
			this.cFailures++;
			break;
		case 2:
			if (ut.cErrors == ut.cErrorsExpected &&
				(ut.cTestsExpected == undefined || ut.cTestsExpected == ut.cAsserts))
				this.Out("PASS");
			else
			    {
				this.Out("FAIL");
				this.cFailures++;
				}
			break;
			}

		this.Out(" [");
		this.OutRef(ut.stName, ut.urlRef);
		this.Out("] ");

		if (ut.state != 0)
			{
			this.Out(ut.cErrors + " errors " + "out of " + ut.cAsserts + " tests");
			if (ut.cTestsExpected && ut.cTestsExpected != ut.cAsserts)
				this.Out(" (" + ut.cTestsExpected + " expected)");
			}
		this.NL();

		for (j = 0; j < ut.rgres.length; j++)
			{
			var res = ut.rgres[j];
			if (!res.f)
				this.Out("Failed: " + res.stNote).NL();
			}
		}

    if (this.cFailures == 0)
        this.Out("Summary: All (" + this.rgut.length + ") tests pass.").NL();
    else		
	    this.Out("Summary: " + this.cFailures + " failures out of " + this.rgut.length + " tests.").NL();
	
	this.ReportOut();
    },

// Report results to master unit test, if any.
ReportOut: function()
    {
    if (!this.IsComplete())
        return;
    if (window.opener && window.opener.MasterTest)
        {
        var iUnit = parseInt(window.name.replace(/^Unit_/, ""));
        window.opener.MasterTest(iUnit, this.cFailures, this.rgut.length);
        }
    },
    
AddSubTest: function(stPath)
    {
    var ut = this.AddTest(stPath, this.RunSubTest.FnCallback(this)).Async(true).Reference(stPath);
    ut.stPath = stPath;
    ut.iUnit = this.rgut.length-1;
    return ut;
    },
    
RunSubTest: function(ut)
    {
    var stName = "Unit_" + ut.iUnit;
    // Ensure unique name even if multi-level of master-child tests.
    if (window.name)
        stName += " from " + window.name;
    ut.win = window.open(ut.stPath, "Unit_" + ut.iUnit);
    if (window.MasterTest == undefined)
        window.MasterTest = this.MasterTest.FnCallback(this);
    },
    
MasterTest: function(iUnit, cErrors, cTests)
    {
    var ut = this.rgut[iUnit];
    ut.cErrors = cErrors;
    ut.cAsserts = cTests;
    ut.Async(false);
    if (ut.cErrors == ut.cErrorsExpected)
        ut.win.close();
    },

ReportAsync: function()
    {
	this.iWait = 0;
	this.tmReport = new mckoss.Timer(this.ReportWhenReady.FnCallback(this), 5000).Repeat().Active();
	this.Report();
    },

ReportWhenReady: function()
    {
	if (!this.IsComplete())
		{
		this.iWait++;
		this.Out("Waiting - " + this.iWait*5 + " seconds.").NL();
		return;
		}

	this.tmReport.Active(false);
	this.Report();
    }

}
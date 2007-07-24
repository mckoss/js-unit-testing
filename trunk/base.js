// base.js - misc core javascript functions
// Copyright (c) 2002-2007 by Mike Koss (mike@mckoss.com)

// Namespaces allow us not to pollute the global (window) namespace with class objects
// and allow us to use anonymous functions as constructors and still use DeriveFrom
// properly.

if (!window["mckoss"])
    mckoss = {};
    
mckoss.vers = "2007-07-08";
    
mckoss.NameSpace = function () {};

mckoss.NameSpace.Ensure = function(stNS)
{
    var rgst = stNS.split(/\./);
    if (!window[rgst[0]])
        window[rgst[0]] = new mckoss.NameSpace();
    objLast = window[rgst[0]];
        
    for (var i = 1; i < rgst.length; i++)
        {
        objLast = objLast[rgst[i]] = new mckoss.NameSpace();
        }
}

mckoss.NameSpace.prototype.AddClass = function(stName, fn)
{
    if (!fn)
        fn = function() {};
    this[stName] = fn;
    fn.SetClassName(stName);
};

// Resolve chicken or egg problem
mckoss.AddClass = mckoss.NameSpace.prototype.AddClass;

// Copy all base class methods that do not have a definition in the current
// constructor prototype.  Also add a prototype variable that references to
// base class's constructor by name
Function.prototype.DeriveFrom = function(fnBase)
{
	var prop;

	if (this == fnBase)
		{
		alert("Error - cannot derive from self");
		return;
		}

	for (prop in fnBase.prototype)
		{
		if (typeof(fnBase.prototype[prop]) == "function" && !this.prototype[prop])
			{
			this.prototype[prop] = fnBase.prototype[prop];
			}
		}

	this.prototype[fnBase.StName()] = fnBase;
}

Function.prototype.SetClassName = function(stClassName)
{
    this._stClassName = stClassName;
}

Function.prototype.StName = function()
{
    if (this._stClassName)
        return this._stClassName;
    
	var st;

    // Kludge - get the name from the full function definition - must be a better way...
	st = this.toString();
	st = st.substring(st.indexOf(" ")+1, st.indexOf("("));
	
	// Cache the name
    this.SetClassName(st);
    
	return st;
}

// Give subclass access to parent's method, via Parent_Method() like call.
Function.prototype.Override = function(fnBase, stMethod)
{
	this.prototype[fnBase.StName() + "_" + stMethod] = fnBase.prototype[stMethod];
}

Function.prototype.FnCallback = function(obj)
{
	var _fn = this;
	return function () { return _fn.apply(obj, arguments); };
}

// Prepend "salted" object - additional state with callback function
Function.prototype.FnCallbackSalt = function(obj, objSalt)
{
	var _fn = this;
	return function () {
		var i;
		var args = [];

		args.push(objSalt);
		for (i = 0; i < arguments.length; i++)
			args.push(arguments[i]);

		return _fn.apply(obj, args);
	};
}


// Named - Base class for jsavascript objects that need scriptable names
//
// Derive from the Named object for any object that you want to have a script-evalable name
// (these are often needed in attributes added to browser elements for click events, timer callbacks etc.)
//
// Usage:
// MyObj.DeriveFrom(mckoss.Named);
// function MyObj()
// {
//     this.Named();
//     ...
// }
// "<IMG onclick=" + StAttrQuote(this.StNamed() + ".Callback();") + ">"

mckoss.AddClass("Named", function()
{
	this.idNamed = mckoss.Named.idNext++;
	mckoss.Named.rg[this.idNamed] = this;
});

mckoss.Named.idNext = 0;
mckoss.Named.rg = new Array;

// Name for the JS object
mckoss.Named.prototype = {
StNamed: function()
    {
	return "mckoss.Named.rg[" + this.idNamed + "]";
    },

// Produce DHTML name for web component associated with this JS object
StNamedPart: function(stPart, iPart)
    {
	var st;

	st = "MCK_" + this.idNamed;
	if (stPart)
	    st += "_" + stPart;
	if (iPart != undefined)
		st += "_" + iPart;
	return st;
    },
    
StPartID: function(stPart, iPart)
    {
	return "ID=" + mckoss.StAttrQuote(this.StNamedPart(stPart, iPart));
    },

BoundPart: function(stPart, iPart)
    {
	return document.getElementById(this.StNamedPart(stPart, iPart));
    }
};

//
// Misc helper functions
//

String.prototype.StReplace = function(stPat, stRep)
{

	var st = "";

	var ich = 0;
	var ichFind = this.indexOf(stPat, 0);

	while (ichFind >= 0)
		{
		st += this.substring(ich, ichFind) + stRep;
		ich = ichFind + stPat.length;
		ichFind = this.indexOf(stPat, ich);
		}
	st += this.substring(ich);

	return st;
}

mckoss.RandomInt = function(n)
{
	return Math.floor(Math.random()*n);
}

mckoss.StAttrQuote = function(st)
{
	return '"' + mckoss.StAttrQuoteInner(st) + '"';
}

mckoss.StAttrQuoteInner = function(st)
{
	st = st.toString();
	st = st.replace(/&/g, '&amp;');
	st = st.replace(/\"/g, '&quot;');
	st = st.replace(/'/g, '&#39;');
	st = st.replace(/\r/g, '&#13;');
	st = st.replace(/\n/g, '&#10;');
	return st;
}

mckoss.Browser = {
	version: parseInt(navigator.appVersion),
	fIE: navigator.appName.indexOf("Microsoft") != -1
};

mckoss.DW = function(st) {document.write(st);}
// DW = mckoss.DW;
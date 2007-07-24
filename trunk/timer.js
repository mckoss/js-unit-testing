//
// Timer class supports periodic execution of a snippet of jscript code.
//
mckoss.AddClass("Timer", function(fnCallback, ms)
{
	this.ms = ms;
	this.fnCallback = fnCallback;
	this.fActive = false;
	this.fRepeat = false;
	this.fInCallback = false;
	this.fReschedule = false;
});

mckoss.Timer.prototype.Repeat = function(f)
{
	if (f == undefined)
		f = true;
	this.fRepeat = f;
	return this;
}

mckoss.Timer.prototype.Ping = function()
{
	// In case of race condition - don't call function if deactivated
	if (!this.fActive)
		return;

	// Eliminate re-entrancy
	if (this.fInCallback)
		{
		this.fReschedule = true;
		return;
		}

	this.fInCallback = true;
	this.fnCallback();
	this.fInCallback = false;

	if (this.fActive && (this.fRepeat || this.fReschedule))
		this.Active(true);
}

// Calling Active resets the timer so that next call to Ping will be in this.ms milliseconds from NOW
mckoss.Timer.prototype.Active = function(fActive)
{
	if (fActive == undefined)
		fActive = true;
	this.fActive = fActive;
	this.fReschedule = false;

	if (this.iTimer)
		{
		clearTimeout(this.iTimer);
		this.iTimer = undefined;
		}

	if (fActive)
		this.iTimer = setTimeout(this.Ping.FnCallback(this), this.ms);

	return this;
}

//
// MSTimer - Uses Date object to create a ms-resolution timer.
//
mckoss.AddClass("MSTimer", function(c)
{
	this.Reset();
});

mckoss.MSTimer.prototype.Reset = function()
{
	this.ms = 0;
	return this;
}

mckoss.MSTimer.prototype.Start = function()
{
	this.d = new Date;
}

mckoss.MSTimer.prototype.Stop = function()
{
	this.d2 = new Date;
	this.ms += this.d2.getTime() - this.d.getTime();
	delete this.d;
	delete this.d2;
}
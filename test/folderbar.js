mckoss.AddClass("FolderBar", function (rgstLabels, fnSelect)
{
	this.rgstLabels = rgstLabels;
	this.fnSelect = fnSelect;
	this.fBody = true;
});

mckoss.FolderBar.prototype.Body = function(fBody)
{
	if (fBody == undefined)
		fBody = true;
		
	this.fBody = fBody;
	return this;
}

mckoss.FolderBar.prototype.BuildUI = function()
{
	this.divAll = document.createElement("DIV");
	this.divBar = document.createElement("DIV");

	// IEBug: border-top clipped if outer DIV padding is not increased.
	if (mckoss.Browser.fIE)
		this.divBar.style.padding = "1px 0 0 0;";

	this.divBar.className = "FolderBar";

	var i;
	for (i = 0; i < this.rgstLabels.length; i++)
		{
		var spn = document.createElement("SPAN");
		spn.className = "Tab";

		// IEBug: One pixel of white space from bottom border if not offset.
		if (mckoss.Browser.fIE && i == 0)
			spn.style.margin = "0 5px 0 4px";

		spn.appendChild(document.createTextNode(this.rgstLabels[i]));

		spn.onmousedown = this.MouseDown.FnCallbackSalt(this, {iTab:i});
		spn.onclick = this.Click.FnCallback(this);

		this.divBar.appendChild(spn);
		}

	this.divAll.appendChild(this.divBar);

	if (this.fBody)
		{
		this.divBody = document.createElement("DIV");
		this.divBody.className = "FolderBody";
		this.divAll.appendChild(this.divBody);
		}

	this.Select(0);

	return this.divAll;	
}

mckoss.FolderBar.prototype.Select = function(iSelected)
{
	var spnSel;

	if (this.iSelected == iSelected)
		return;

	if (iSelected < 0 || iSelected > this.rgstLabels.length)
		throw new Error("FolderBar: Tab out of range");

	if (this.iSelected != undefined)
		{
		spnSel = this.divBar.childNodes[this.iSelected];
		spnSel.className = "Tab";
		}

	spnSel = this.divBar.childNodes[iSelected];
	spnSel.className = "TabSel";
	this.iSelected = iSelected;
	if (this.fnSelect)
		this.fnSelect(this.iSelected);
}

mckoss.FolderBar.prototype.Selected = function()
{
	return this.iSelected;
}

function StopEvent(evt)
{
    if (evt.preventDefault)
        {
        evt.preventDefault();
        evt.stopPropagation();
        }
    else
        {
        evt.returnValue = false;
        evt.cancelBubble = true;
        }
}

mckoss.FolderBar.prototype.MouseDown = function(objSalt, evt)
{
	if (!evt)
		evt = window.event;

	this.Select(objSalt.iTab);

	// Stop text selection in folder tabs
    StopEvent(evt);
}

mckoss.FolderBar.prototype.Click = function(evt)
{
    StopEvent(evt);
}
jQuery.sap.require("sap.m.DateRangeSelection");
sap.m.DateRangeSelection.extend("oneapp.incture.workbox.controlExtension.ExtDateRangeSelection", {
	renderer: {},
	init: function () {
		sap.m.DateRangeSelection.prototype.init.apply(this);
	},
	onfocusin: function () {
		document.activeElement.blur();
	}
});
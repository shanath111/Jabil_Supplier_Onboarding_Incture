jQuery.sap.require("sap.m.DatePicker");
sap.m.DatePicker.extend("oneapp.incture.workbox.controlExtension.ExtDatePicker", {
	renderer: {},
	init: function () {
		sap.m.DatePicker.prototype.init.apply(this);
	},
	onfocusin: function () {
		document.activeElement.blur();
	}
});
jQuery.sap.require("sap.m.ComboBox");
sap.m.ComboBox.extend("oneapp.incture.workbox.controlExtension.ExtComboBox", {
	renderer: {},
	init: function () {
		sap.m.ComboBox.prototype.init.apply(this);
	},
	onfocusin: function () {
		document.activeElement.blur();
	}
});
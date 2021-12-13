sap.ui.define([
    "sap/m/ComboBox",
    "sap/m/ComboBoxRenderer"
],
function (ComboBox, ComboBoxRenderer) {
    "use strict";
    var ExtComboBox = ComboBox.extend("oneapp.incture.report.reports.controlExtension.ExtComboBox", {
		metadata: {
			
			events: {
				click: {}
			}
		},
		onclick: function (event) {
			this.fireClick();
		},
		renderer: function (oRm, oControl) {
			ComboBoxRenderer.render(oRm, oControl);
		}
	});
	return ExtComboBox;
    
});
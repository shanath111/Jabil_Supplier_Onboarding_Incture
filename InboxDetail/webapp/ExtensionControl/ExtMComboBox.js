sap.ui.define([
    "sap/m/MultiComboBox",
    "sap/m/ComboBoxRenderer"
],
function (ComboBox, ComboBoxRenderer) {
    "use strict";
    var ExtComboBox = ComboBox.extend("oneapp.incture.report.reports.controlExtension.ExtMComboBox", {
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
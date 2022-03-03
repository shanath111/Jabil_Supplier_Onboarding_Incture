sap.ui.define([
	"sap/m/VBox"
], function (VBox) {
	"use strict";
	var ExtVbox = VBox.extend("oneapp.incture.workbox.controlExtension.ExtVbox", {
		metadata: {
			dnd: {
				droppable: true
			},
			events: {
				click: {}
			},
			properties: {
				"additionalText": "sap.ui.model.type.String"
			}
		},
		onclick: function (event) {
			this.fireClick();
		},
		renderer: function (oRm, oControl) {
			sap.m.VBoxRenderer.render(oRm, oControl);
		}
	});
	return ExtVbox;
});
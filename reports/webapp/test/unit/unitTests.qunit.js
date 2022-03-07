/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"oneappincture.report./reports/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});

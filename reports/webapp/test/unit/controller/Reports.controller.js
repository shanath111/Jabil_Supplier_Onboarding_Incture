/*global QUnit*/

sap.ui.define([
	"oneappincture.report./reports/controller/Reports.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Reports Controller");

	QUnit.test("I should test the Reports controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

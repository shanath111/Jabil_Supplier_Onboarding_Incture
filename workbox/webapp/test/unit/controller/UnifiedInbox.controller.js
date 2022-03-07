sap.ui.require(
	[
		"oneapp/incture/workbox/controller/UnifiedInbox.controller",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/model/json/JSONModel",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"

	],
	function (controller, ResourceModel, JSONModel) {
		"user strict";

		QUnit.module("Filter tests");

		QUnit.test("Filter Expand", function (assert) {
			controller.getModel = function () {
				return new JSONModel({
					"oAppModel": "oAppModel"
				});
			};
			// Arrange
			var oViewStub = {
				getModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};
			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var sFunction = controller.onFilterExpand.bind(oControllerStub);

		});
	}
);
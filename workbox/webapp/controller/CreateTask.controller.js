sap.ui.define([
	"oneapp/incture/workbox/controller/BaseController",
	"oneapp/incture/workbox/util/formatter",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"oneapp/incture/workbox/controlExtension/ExtDatePicker"
], function (BaseController, formatter, taskManagement, workbox, utility, JSONModel, Dialog, ExtDatePicker) {
	"use strict";

	return BaseController.extend("oneapp.incture.workbox.controller.CreateTask", {

		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			var oAppModel = this.getOwner().getModel("oAppModel");
			this.oAppModel = oAppModel;
			var customTask = {
				"customProcessNames": [],
				"selectedProcess": "",
				"enableVBoxContent": false,
				"singleInstance": false,
				"multipleInstance": false,
				"customInstance": {}
			};
			var oCustomTaskModel = new JSONModel(customTask);
			this.setModel(oCustomTaskModel, "oCustomTaskModel");
			this.setModel(this.getModel("oConstantsModel"), "oConstantsModel");
			oRouter.attachRoutePatternMatched(function (oEvent) {
				
				if (oEvent.getParameter("name") === "CreateTask") {
							this.oAppModel.setProperty("/transitionWait",false);
					this.removeAllTokens(true);
					this.getAdhocProcessNames();
					if (oAppModel.getProperty("/draftEventId")) {
						this.viewDraftFn();
					}
					oAppModel.setProperty("/currentView", "createTask");
					oCustomTaskModel.setProperty("/selectedProcess", "");
					oCustomTaskModel.setProperty("/enableVBoxContent", false);
					oCustomTaskModel.setProperty("/multipleInstance", false);
					oCustomTaskModel.setProperty("/singleInstance", false);
					oAppModel.setProperty("/functionality/expanded", false);
					oAppModel.setProperty("/functionality/direction", "Column");
					oAppModel.setProperty("/functionality/visibility", false);
					oCustomTaskModel.setProperty("/busyBarIndicator", false);
					oCustomTaskModel.setProperty("/busyIndicatorValue", 0);
				}
			}.bind(this));
		},

		//getting the process names
		getAdhocProcessNames: function () {
			taskManagement.onOpenCreateTaskFragmentTM(this);
		},

		//creating dynamic grid/table according to the selected process (create task instance)
		dynamicInstanceCreation: function (oEvent) {
			var selectedItem = oEvent.getSource().getSelectedItem().getKey();
			taskManagement.dynamicInstanceCreationTM(this, selectedItem, ExtDatePicker);
		},

		// Adding task row in multiple instance creation
		addInstance: function (oEvent) {
			taskManagement.addInstanceTM(this, this.getModel("oCustomTaskModel"));
		},

		//edit draft view and service call to get draft instance details
		viewDraftFn: function (oEvent) {
			var that = this;
			var eventId = this.oAppModel.getProperty("/draftEventId");
			var url = "/WorkboxJavaService/tasks/viewDraft/" + eventId;
			taskManagement.viewDraftFnTM(that, url, ExtDatePicker);
		}
	});
});
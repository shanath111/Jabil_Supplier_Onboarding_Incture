sap.ui.define([
	"oneapp/incture/processFlow/processFlow/controller/BaseController",
	"oneapp/incture/processFlow/processFlow/util/formatter",
	// "oneapp/incture/processFlow/processFlow/util/taskManagement",
	// "oneapp/incture/processFlow/processFlow/util/workbox",
	// "oneapp/incture/processFlow/processFlow/util/utility",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog"
], function (BaseController, formatter, JSONModel, Dialog) {
	"use strict";

	return BaseController.extend("oneapp.incture.processFlow.processFlow.controller.enterTaskId", {
		onInit: function(){
            var oRouter = this.getOwnerComponent().getRouter();
			var oAppModel = this.getOwner().getModel("oAppModel");
            this.oAppModel = oAppModel;
            var oProcessFlowModel = new JSONModel();
			oProcessFlowModel.busy = false;
			this.setModel(oProcessFlowModel, "oProcessFlowModel");
        },

        onClickViewFLowBtn: function(oEvent){
            var oEvent = oEvent;
            var caseId = oEvent.getSource().getParent().getItems()[0].getValue();
            var requestPayload = {
                "requestId":  caseId
            }
            var oProcessFlowModel = this.getModel("oProcessFlowModel");
            var url = "/oneappinctureprocessFlowprocessFlow/WorkboxJavaService/task/details";
            this.doAjax(url, "POST", requestPayload, function (oData) {
                var oData = oData;
                var oProcessFlowModel = this.getModel("oProcessFlowModel");
                oProcessFlowModel.setProperty("/taskDetails", oData.tasks);
            }.bind(this), function (oError) {}.bind(this));
            this._doNavigate("processFlow", {});
        }
	});

});
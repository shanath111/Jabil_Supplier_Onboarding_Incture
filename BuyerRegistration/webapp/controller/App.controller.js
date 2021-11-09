sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";
        return Controller.extend("ns.BuyerRegistration.controller.App", {
            onInit: function () {
                this.fnLoadUser();
               
            },
            fnDisplayNav: function (vIsNew, vCaseId) {
                var isNew = vIsNew;
                if (isNew == "true") {
                    var vCaseId = vCaseId;
                    this.getOwnerComponent().getRouter().navTo("BPCreate", {
                        Id: vCaseId
                    },true);
                } else {
                    var vCaseId = vCaseId;
                    this.getOwnerComponent().getRouter().navTo("BPExtend", {
                        Id: vCaseId,
                        Name: "Display"
                    },true);
                }

            }
         
                // var oModel = new JSONModel();
                // var sUrl = "/nsBuyerRegistration/plcm_portal_services/loggedinUser";
                // oModel.loadData(sUrl, false, {
                //     "Content-Type": "application/json"
                // });
                // oModel.attachRequestCompleted(function (oEvent) {
                //     if (oEvent.getParameter("success")) {
                //         that.getView().getModel("oConfigMdl").setProperty("/usrData", oEvent.getSource().getData());
                //         that.getView().getModel("oConfigMdl").refresh();
                //     }
                // });
            },
            onAfterRendering: function () {


            }
        });
    });

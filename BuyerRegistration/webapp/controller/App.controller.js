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
                if(this.getOwnerComponent().getComponentData()){
                  if (this.getOwnerComponent().getComponentData().startupParameters.caseId) {
                    var vCaseId = this.getOwnerComponent().getComponentData().startupParameters.caseId[0];
                    var vIsNew = this.getOwnerComponent().getComponentData().startupParameters.isNew[0];
                    this.fnDisplayNav(vIsNew, vCaseId);
                } else {
                    this.getOwnerComponent().getRouter().navTo("BPExtend", {
                        Id: "New",
                        Name: "Display"
                    },true);
                }
            }else{
                 this.getOwnerComponent().getRouter().navTo("BPExtend", {
                        Id: "New",
                        Name: "Display"
                    },true); 
            }
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

            },
            fnLoadUser: function () {
                var that = this;
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/loggedinUser";
                $.ajax({
                    url: sUrl,
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        that.getView().getModel("oConfigMdl").setProperty("/usrData", data);
                        that.getView().getModel("oConfigMdl").refresh();

                    },
                    async: false,
                    error: function (data) {

                    }
                });

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

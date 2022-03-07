sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/jabil/surveyform/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
], function (Controller, BaseController, JSONModel, MessageBox) {
    "use strict";
    var oi18n;
    return BaseController.extend("com.jabil.surveyform.controller.MainView", {
        onInit: function () {
            oi18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this._router = this.getOwnerComponent().getRouter();
            this._router.getRoute("MainView").attachPatternMatched(this._fnHandleRouteMatched, this);
        },
        _fnHandleRouteMatched: function (oEvent) {
            
            this.getUser();
            var taskId = oEvent.getParameter("arguments").contextPath;
            if (taskId !== "") {
                var that = this;
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskContext/" + taskId;
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        that.getView().getModel("oUserModel").setProperty("/caseId", oEvent.getSource().getData().caseId);
                        that.getView().getModel("oUserModel").setProperty("/bpNumber", oEvent.getSource().getData().bpNumber);
                        that.getView().getModel("oUserModel").setProperty("/isNew", oEvent.getSource().getData().isNew);
                        that.getView().getModel("oUserModel").setProperty("/taskId", taskId);
                        if(oEvent.getSource().getData().isBuyerReviewRejected){
                            that.getView().getModel("oUserModel").setProperty("/isBuyerRejectTask", oEvent.getSource().getData().isBuyerReviewRejected);
                          }else {
                            that.getView().getModel("oUserModel").setProperty("/isBuyerRejectTask", null);
                          }
                        that.getView().getModel("oUserModel").refresh();
                        that._fnCheckEulaStatus(oEvent.getSource().getData().caseId, taskId);
                        // if (oEvent.getSource().getData().isNew) {
                           
                        // } else {
                                    
                        //     that._router.navTo("VendorSurvey", { contextPath: taskId, Name: "Supplier" });
                        // }

                    }
                    else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });

                    }
                });
var aModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/WorkboxJavaService/inbox/isClaimed?eventId=" + taskId;
                aModel.loadData(sUrl);
                aModel.attachRequestCompleted(function (oEvent) {
                      if (oEvent.getParameter("success")) {
                          that.getOwnerComponent().getModel("oVisibilityModel").getData().claimedTask = oEvent.getSource().getData().isClaimed;
                             that.getOwnerComponent().getModel("oVisibilityModel").getData().isTaskCompleted = oEvent.getSource().getData().isTaskCompleted;
                      that.getOwnerComponent().getModel("oVisibilityModel").refresh();
                        }
                       else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });

                    }
                });
            }
        },
        _fnCheckEulaStatus: function (caseId, taskId) {
            var that = this
            var oModel = new JSONModel();
            var sUrl = "/comjabilsurveyform/plcm_portal_services/eula/findById/" + caseId;
            oModel.loadData(sUrl);
            oModel.attachRequestCompleted(function (oEvent) {
                if (oEvent.getParameter("success")) {
                    if (oEvent.getSource().getData() == undefined) {
                        that._router.navTo("Welcome", { contextPath: taskId });
                    }
                    else if (oEvent.getSource().getData().eulaStatus == "Rejected") {
                        that._router.navTo("Welcome", { contextPath: taskId });
                    } else if (oEvent.getSource().getData().eulaStatus == "Accepted") {
                        that._router.navTo("VendorSurvey", { contextPath: taskId, Name: "Supplier" });
                    }
                      that.getView().getModel("oUserModel").setProperty("/language", oEvent.getSource().getData().language);
                 that.getView().getModel("oUserModel").refresh();
                   if(oEvent.getSource().getData().language){
               sap.ui.getCore().getConfiguration().setLanguage(oEvent.getSource().getData().language);}
                      
                }
                else if (oEvent.getParameter("errorobject").statusCode == 400 || oEvent.getParameter("errorobject").statusCode == 409 || oEvent.getParameter("errorobject").statusCode == 500 || oEvent.getParameter("errorobject").statusCode == 404) {

                    that._router.navTo("Welcome", { contextPath: taskId });
                } else {
                    var sErMsg = oEvent.getParameter("errorobject").responseText;
                    MessageBox.show(sErMsg, {
                        icon: MessageBox.Icon.ERROR,
                        title: oi18n.getText("error")
                    });
                }


            });
        }
    });
});
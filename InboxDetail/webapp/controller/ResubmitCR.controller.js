sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "InboxDetail/util/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/Sorter"
],

    function (Controller, formatter, JSONModel, Filter, FilterOperator, MessageBox, BusyDialog, Sorter) {
        "use strict";
        var that, oView, oBusyDilog, oi18n;
        return Controller.extend("InboxDetail.controller.ResubmitCR", {
            onInit: function () {
                that = this;
                oView = this.getView();
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt")   //initialize Busy Dialog
                });
                // window.addEventListener("resize", this.fnScreenResize); //Event to be triggered on screen resize
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("ResubmitCR").attachMatched(this.fnVendorRequestRoute, this);
            },
            fnLoadCaseHistory: function (oEvent) {
                var vCaseId = this.getView().byId("id_CaseId").getValue();
                var oModel = new JSONModel();
                var that = this;
                var sUrl = "/InboxDetail/plcm_portal_services/api/v1/mdg/crHistory/" + vCaseId;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        var oJson = new sap.ui.model.json.JSONModel();
                        oJson.setData(oEvent.getSource().getData());
                        that.getView().setModel(oJson, "JMCaseHistory");

                    } else {
                        var oJson = new sap.ui.model.json.JSONModel();
                        oJson.setData([]);
                        that.getView().setModel(oJson, "JMCaseHistory");
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        // MessageBox.show(sErMsg, {
                        //     icon: MessageBox.Icon.ERROR,
                        //     title: "Error"
                        // });
                    }
                });
            },
            fnPressRetrigger: function (oEvent) {
                var vChildCase = oEvent.getSource().getBindingContext("JMCaseHistory").getProperty("childId");
                var vCaseId = oEvent.getSource().getBindingContext("JMCaseHistory").getProperty("caseId");
                var vScenario = oEvent.getSource().getBindingContext("JMCaseHistory").getProperty("scenario");
                var vcrNumber = oEvent.getSource().getBindingContext("JMCaseHistory").getProperty("crNumber");
                var vportalCrStatus = oEvent.getSource().getBindingContext("JMCaseHistory").getProperty("portalCrStatus");
                MessageBox.confirm(oi18n.getProperty("confirmResubmit"), {
                    icon: MessageBox.Icon.Confirmation,
                    title: "Confirmation",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            oBusyDilog.open();
                            var oModel = new JSONModel();
                            var oPayload = {
                                "caseId": vCaseId,
                                "childId": vChildCase,
                                "scenario": vScenario,
                                "crNumber": vcrNumber,
                                "portalCrStatus": vportalCrStatus
                            }
                            var sUrl = "/InboxDetail/plcm_portal_services/api/v1/mdg/cr/retrigger";
                            oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, true, {
                                "Content-Type": "application/json"
                            });
                            oModel.attachRequestCompleted(function (oEvent) {
                                if (oEvent.getParameter("success")) {
                                    var temp = {};
                                    temp.Message = oi18n.getProperty("CRRetriggerSuccess");
                                    var oJosnMessage = new sap.ui.model.json.JSONModel();
                                    oJosnMessage.setData(temp);
                                    oView.setModel(oJosnMessage, "JMMessageData");
                                    if (!that.oBPSuccess) {
                                        that.oBPSuccess = sap.ui.xmlfragment(
                                            "InboxDetail.fragments.CreateSuccessGBS", that);
                                        oView.addDependent(that.oBPSuccess);
                                    }
                                    oBusyDilog.close();
                                    that.oBPSuccess.open();
                                } else {
                                    oBusyDilog.close();
                                    var sErMsg = oEvent.getParameter("errorobject").responseText;
                                    MessageBox.show(sErMsg, {
                                        icon: MessageBox.Icon.ERROR,
                                        title: "Error"
                                    });
                                }
                            });
                        }
                    }
                });
            },
            fnDoneSubmit: function () {
                this.oBPSuccess.close();
                this.fnLoadCaseHistory();
            },
            fnNavToHome: function () {
                this.getOwnerComponent().getRouter().navTo("Home");
            }
        });
    });

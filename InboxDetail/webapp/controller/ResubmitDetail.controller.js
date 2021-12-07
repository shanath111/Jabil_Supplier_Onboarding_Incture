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
        return Controller.extend("InboxDetail.controller.ResubmitDetail", {
            onInit: function () {
                that = this;
                oView = this.getView();
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt")   //initialize Busy Dialog
                });
                // window.addEventListener("resize", this.fnScreenResize); //Event to be triggered on screen resize
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("ResubmitDetail").attachMatched(this.fnCRDetail, this);

            },

            fnCRDetail: function (oEvent) {
                oView.getModel("oBPLookUpMdl").setData([]);
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);

                var oJsonFilter = new sap.ui.model.json.JSONModel();
                var temp = {
                    "country": "",
                    "taxCategory": ""
                };
                oJsonFilter.setData(temp);
                oView.setModel(oJsonFilter, "JMFilter");
                this.fnLoadCountry();

                var oJsonFilter1 = new sap.ui.model.json.JSONModel();
                var temp = {
                    "country": "",
                    "taxCategory": "",
                    "toolTip": ""
                };
                oJsonFilter1.setData(temp);
                oView.setModel(oJsonFilter1, "JMFilter1");

            },
            fnLoadCountry: function () {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/countries";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/Country", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });
            },
            fnLiveChangeCountry(oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                oView.getModel("JMFilter").getData().taxCategory = "";
                oView.getModel("JMFilter").refresh();
                this.fnLoadTaxCategory(oView.getModel("JMFilter").getData().country);
            },
            fnChangeTaxCategory:function(oEvent){
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
            },
            fnLiveChangeCountry1(oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                oView.getModel("JMFilter1").getData().taxCategory = "";
                oView.getModel("JMFilter1").refresh();
                this.fnLoadTaxCategory1(oView.getModel("JMFilter1").getData().country);
            },
            fnLoadTaxCategory: function (vCountry) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/taxType/" + vCountry;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/taxCategory", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });
            },
            fnLoadTaxCategory1: function (vCountry) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/taxType/" + vCountry;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/taxCategory1", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });
            },
            fnSearchTooltip: function () {
                var vError = false;
                if (oView.getModel("JMFilter").getData().taxCategory == "") {
                    vError = true
                }
                if (oView.getModel("JMFilter").getData().country == "") {
                    vError = true
                }
                if (vError == false) {
                    oBusyDilog.open();
                    var oModel = new JSONModel();
                    var sUrl = "/InboxDetail/plcm_portal_services/api/v1/tax-tooltip/search"

                    var oPayload = {
                        "country": oView.getModel("JMFilter").getData().country,
                        "taxType": oView.getModel("JMFilter").getData().taxCategory,
                    }

                    oModel.loadData(sUrl, JSON.stringify(
                        oPayload
                    ), true, "POST", false, true, {
                        "Content-Type": "application/json"
                    });
                    oModel.attachRequestCompleted(function onCompleted(oEvent) {
                        if (oEvent.getParameter("success")) {

                            oBusyDilog.close();

                            var oJsonTooltipSearch = new sap.ui.model.json.JSONModel();
                            oJsonTooltipSearch.setData(oEvent.getSource().getData());
                            oView.setModel(oJsonTooltipSearch, "JMTooltipSearch");
                        } else {
                            oBusyDilog.close();
                             var oJsonTooltipSearch = new sap.ui.model.json.JSONModel();
                            oJsonTooltipSearch.setData([]);
                            oView.setModel(oJsonTooltipSearch, "JMTooltipSearch")
                            var sErMsg = oEvent.getParameter("errorobject").responseText;
                            MessageBox.show(sErMsg, {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });


                        }
                    });


                } else {
                    sap.m.MessageToast.show(oi18n.getProperty("enterTaxCategory"))
                }

            },
            fnSubmitTooltip: function () {
                var vError = false;
                if (oView.getModel("JMFilter1").getData().taxCategory == "") {
                    vError = true
                }
                if (oView.getModel("JMFilter1").getData().country == "") {
                    vError = true
                }
                if (oView.getModel("JMFilter1").getData().toolTip == "") {
                    vError = true
                }
                if (vError == false) {
                    var vConfirmTxt = oi18n.getProperty("BPCConfirmSubmit");
                    MessageBox.confirm(vConfirmTxt, {
                        icon: MessageBox.Icon.Confirmation,
                        title: "Confirmation",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (oAction) {
                            if (oAction == "YES") {
                                oBusyDilog.open();
                                var oModel = new JSONModel();
                                var sUrl = "/InboxDetail/plcm_portal_services/api/v1/tax-tooltip/create"
                                var vBuyer = ""
                                if (oView.getModel("oConfigMdl").getData().usrData) {
                                    vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;

                                }
                                var oPayload = {
                                    "country": oView.getModel("JMFilter1").getData().country,
                                    "taxType": oView.getModel("JMFilter1").getData().taxCategory,
                                    "toolTip": oView.getModel("JMFilter1").getData().toolTip,
                                    "createdBy": vBuyer
                                }

                                oModel.loadData(sUrl, JSON.stringify(
                                    oPayload
                                ), true, "POST", false, true, {
                                    "Content-Type": "application/json"
                                });
                                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                                    if (oEvent.getParameter("success")) {
                                        var temp = {};
                                        var vSccuessTxt = oi18n.getProperty("TooltipCreatedSuccessfully");
                                        temp.Message = vSccuessTxt;
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
                } else {
                    sap.m.MessageToast.show(oi18n.getProperty("enterTaxCategory"))
                }

            },
            fnDoneSubmit: function () {
                var oJsonFilter1 = new sap.ui.model.json.JSONModel();
                var temp = {
                    "country": "",
                    "taxCategory": "",
                    "toolTip": ""
                };
                oJsonFilter1.setData(temp);
                oView.setModel(oJsonFilter1, "JMFilter1");
                that.oBPSuccess.close();
            },
             fnNavToHome: function () {
                this.getOwnerComponent().getRouter().navTo("Home");
            },
            fnDeleteCC: function (oEvent) {
                var vccId = oEvent.getSource().getBindingContext("JMTooltipSearch").getProperty("taxType");
                var that = this;
                var vConfirmTxt = oi18n.getProperty("BPCConfirmDelete");
                MessageBox.confirm(vConfirmTxt, {
                    icon: MessageBox.Icon.Confirmation,
                    title: "Confirmation",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            oBusyDilog.open();
                            var oModel = new JSONModel();

                         
                            var sUrl = "/InboxDetail/plcm_portal_services/api/v1/tax-tooltip/deleteById/" + vccId;
                            $.ajax({
                                url: sUrl,
                                type: 'DELETE',
                                dataType: 'json',
                                success: function (data) {
                                    var temp = {};
                                    var vSccuessTxt = oi18n.getProperty("CCCPPDeleteSuccess");
                                    temp.Message = vSccuessTxt;
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
                                    that.fnSearchTooltip();

                                },
                                async: false,
                                error: function (data) {
                                    oBusyDilog.close();
                                    var sErMsg = data.responseText;
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
        });
    });

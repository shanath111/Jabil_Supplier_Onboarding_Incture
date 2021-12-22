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
        return Controller.extend("InboxDetail.controller.MaintenanceAdmin", {
            onInit: function () {
                that = this;
                oView = this.getView();
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt")   //initialize Busy Dialog
                });
                // window.addEventListener("resize", this.fnScreenResize); //Event to be triggered on screen resize
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("MaintenanceAdmin").attachMatched(this.fnLaucnhCCRoute, this);

            },

            fnLaucnhCCRoute: function (oEvent) {
                oView.getModel("oBPLookUpMdl").setData([]);
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);

                var oJsonFilter = new sap.ui.model.json.JSONModel();
                var temp = {
                    "companyCode": "",
                    "purchasingOrganisation": ""
                };
                oJsonFilter.setData(temp);
                oView.setModel(oJsonFilter, "JMFilter");

                var oJsonFilter = new sap.ui.model.json.JSONModel();
                var temp = {
                    "companyCode": "",
                    "purchasingOrganisation": ""
                };
                oJsonFilter.setData(temp);
                oView.setModel(oJsonFilter, "JMFilter1");
                // this.fnLoadSiteName();
                // this.fnLoadSiteName1();
                this.fnLoadCompanyCode();
                this.fnLoadCompanyCode1();
                this.fnLoadDocName();
                this.fnLoadDocName1();


            },

            // fnLoadSiteName: function() {
            //     var oModel = new JSONModel();
            //     var sUrl = "/InboxDetail/plcm_portal_services/ccpo/localDocuments/siteNames";
            //     oModel.loadData(sUrl, {
            //         "Content-Type": "application/json"
            //     });
            //     oModel.attachRequestCompleted(function (oEvent) {
            //         if (oEvent.getParameter("success")) {
            //             oView.getModel("oBPLookUpMdl").setProperty("/SiteName", oEvent.getSource().getData());
            //             oView.getModel("oBPLookUpMdl").refresh();
            //         }
            //     });
            // },

            // fnLoadSiteName1: function() {
            //     var oModel = new JSONModel();
            //     var sUrl = "/InboxDetail/plcm_portal_services/ccpo/localDocuments/siteNames";
            //     oModel.loadData(sUrl, {
            //         "Content-Type": "application/json"
            //     });
            //     oModel.attachRequestCompleted(function (oEvent) {
            //         if (oEvent.getParameter("success")) {
            //             oView.getModel("oBPLookUpMdl").setProperty("/SiteName1", oEvent.getSource().getData());
            //             oView.getModel("oBPLookUpMdl").refresh();
            //         }
            //     });
            // },


            fnLoadCompanyCode: function () {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_portal_services/api/v1/reference-data/company-codes";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/CompanyCode", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });
            },
            fnLoadCompanyCode1: function () {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/company-codes";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/CompanyCode1", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });
            },
            fnLiveChangeCompCode: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }

                }
                this.fnLoadPurOrg(oView.getModel("JMFilter").getData().companyCode, oEvent.getSource().getSelectedItem().getAdditionalText());
                oView.getModel("JMFilter").getData().purchasingOrg = "";
                oView.getModel("JMFilter").refresh();
                if (oView.getModel("JMFilter").getData().companyCodee == "Error") {
                    oView.getModel("JMFilter").getData().companyCodee = "None";
                    oView.getModel("JMFilter").getData().companyCodem = "";
                    oView.getModel("JMFilter").refresh();
                }

            },
            fnLiveChangeCompCode1: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }

                }
                this.fnLoadPurOrg1(oView.getModel("JMFilter1").getData().companyCode, oEvent.getSource().getSelectedItem().getAdditionalText());
                oView.getModel("JMFilter").getData().purchasingOrg = "";
                oView.getModel("JMFilter").refresh();
                if (oView.getModel("JMFilter").getData().companyCodee == "Error") {
                    oView.getModel("JMFilter").getData().companyCodee = "None";
                    oView.getModel("JMFilter").getData().companyCodem = "";
                    oView.getModel("JMFilter").refresh();
                }

            },
            fnLoadPurOrg: function (vCompCode, vDescription) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_portal_services/api/v1/reference-data/purchasingOrg/" + vCompCode;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/PurOrg", oEvent.getSource().getData());
                        if (oEvent.getSource().getData().length == 0) {
                            if (vDescription.includes("Nypro")) {
                                var temp = [{
                                    "code": "0155",
                                    "description": "Nypro Inc."
                                }]
                                oView.getModel("oBPLookUpMdl").setProperty("/PurOrg", temp);
                            }
                        }
                        oView.getModel("oBPLookUpMdl").refresh();
                    } else {
                        if (vDescription.includes("Nypro")) {
                            var temp = [{
                                "code": "0155",
                                "description": "Nypro Inc."
                            }]
                            oView.getModel("oBPLookUpMdl").setProperty("/PurOrg", temp);
                        }
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });

            },
            fnLoadPurOrg1: function (vCompCode, vDescription) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/purchasingOrg/" + vCompCode;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/PurOrg1", oEvent.getSource().getData());
                        if (oEvent.getSource().getData().length == 0) {
                            if (vDescription.includes("Nypro")) {
                                var temp = [{
                                    "code": "0155",
                                    "description": "Nypro Inc."
                                }]
                                oView.getModel("oBPLookUpMdl").setProperty("/PurOrg1", temp);
                            }
                        }
                        oView.getModel("oBPLookUpMdl").refresh();
                    } else {
                        if (vDescription.includes("Nypro")) {
                            var temp = [{
                                "code": "0155",
                                "description": "Nypro Inc."
                            }]
                            oView.getModel("oBPLookUpMdl").setProperty("/PurOrg1", temp);
                        }
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });

            },

            fnLoadDocName: function() {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_portal_services/ccpo/localDocuments/documentNames";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/DocName", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });
            },
            fnLoadDocName1: function() {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_portal_services/ccpo/localDocuments/documentNames";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/DocName1", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });
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
            fnLiveChangeCountry() {
                oView.getModel("JMFilter").getData().taxCategory = "";
                oView.getModel("JMFilter").refresh();
                this.fnLoadTaxCategory(oView.getModel("JMFilter").getData().country);
            },
            fnLiveChangeCountry1() {
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
            fnSearchSME: function () {
                var vError = false;
                // if (oView.getModel("JMFilter").getData().companyCode == "") {
                //     vError = true
                // }

                if (vError == false) {
                    oBusyDilog.open();
                    var oModel = new JSONModel();
                    var sUrl = "/InboxDetail/plcm_portal_services/sme/search"

                    var oPayload = {
                        "companyCode": oView.getModel("JMFilter").getData().companyCode,
                        "purchasingOrganisation": oView.getModel("JMFilter").getData().purchasingOrganisation,
                        "smeEmail":oView.getModel("JMFilter").getData().smeEmail

                    }

                    oModel.loadData(sUrl, JSON.stringify(
                        oPayload
                    ), true, "POST", false, true, {
                        "Content-Type": "application/json"
                    });
                    oModel.attachRequestCompleted(function onCompleted(oEvent) {
                        if (oEvent.getParameter("success")) {

                            oBusyDilog.close();

                            var oJsonCompSearch = new sap.ui.model.json.JSONModel();
                            oJsonCompSearch.setData(oEvent.getSource().getData());
                            oView.setModel(oJsonCompSearch, "JMCompSearchResult");
                        } else {
                            oBusyDilog.close();
                            var oJsonCompSearch = new sap.ui.model.json.JSONModel();
                            oJsonCompSearch.setData([]);
                            oView.setModel(oJsonCompSearch, "JMCompSearchResult")
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
            fnFetchDescriptionCommon(aArray, value, vFieldName) {
                if (aArray) {
                    if (value) {
                        var item = aArray.find(item => item.code == value);
                        if (item) {
                            return item.description;
                        } else {
                            return "";
                        }

                    } else {
                        return "";
                    }
                } else {
                    return "";
                }
            },
            fnSubmitSME: function () {
                var vError = false;
                
                if (oView.getModel("JMFilter1").getData().companyCode == "") {
                    vError = true
                }
                if (oView.getModel("JMFilter1").getData().purchasingOrganisation == "") {
                    vError = true
                }
                if (oView.getModel("JMFilter1").getData().createdBy == "") {
                    vError = true
                }
                if (oView.getModel("JMFilter1").getData().smeEmail == "") {
                    vError = true
                }
                if (oView.getModel("JMFilter1").getData().smeFirstName == "") {
                    vError = true
                }
                if (oView.getModel("JMFilter1").getData().smeLastName == "") {
                    vError = true
                }
                

                if (vError == false) {
                    var that = this;
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
                                var sUrl = "/InboxDetail/plcm_portal_services/sme/create"
                                var vBuyer = ""
                                if (oView.getModel("oConfigMdl").getData().usrData) {
                                    vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;

                                }

                                var oPayload = {
                                    "companyCode": oView.getModel("JMFilter1").getData().companyCode,
                                    "purchasingOrganisation": oView.getModel("JMFilter1").getData().purchasingOrganisation,
                                    "createdBy": oView.getModel("JMFilter1").getData().createdBy,
                                    "smeEmail": oView.getModel("JMFilter1").getData().smeEmail,
                                    "smeFirstName": oView.getModel("JMFilter1").getData().smeFirstName,
                                    "smeLastName": oView.getModel("JMFilter1").getData().smeLastName
                                }

                                oModel.loadData(sUrl, JSON.stringify(
                                    oPayload
                                ), true, "POST", false, true, {
                                    "Content-Type": "application/json"
                                });
                                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                                    if (oEvent.getParameter("success")) {
                                        var temp = {};
                                        var vSccuessTxt = oi18n.getProperty("CCCPPLaunchedSuccess");
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
            fnDeleteSME: function (oEvent) {
                var vccId = oEvent.getSource().getBindingContext("JMCompSearchResult").getProperty("siteSmeId");
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

                         
                            var sUrl = "/nsBuyerRegistration/plcm_portal_services/sme/deleteById/" + vccId;
                            $.ajax({
                                url: sUrl,
                                type: 'DELETE',
                                dataType: 'json',
                                success: function (data) {
                                    var temp = {};
                                    var vSccuessTxt = oi18n.getProperty("CCCPPDeleteSuccess1");
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
                                    that.fnSearchCompanyCode();

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

            fnDoneSubmit: function () {
                var oJsonFilter1 = new sap.ui.model.json.JSONModel();
                var temp = {
                    "companyCode": "",
                    "purchasingOrganisation": ""
                };
                oJsonFilter1.setData(temp);
                oView.setModel(oJsonFilter1, "JMFilter1");
                this.oBPSuccess.close();
            },
            fnNavToHome: function () {
                this.getOwnerComponent().getRouter().navTo("Home");
            },
            onChangeLookupValue: function(oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }

                }
            },
            onChangeDocName: function(oEvent) {
                if(oEvent.getSource().getValue().length > 255) {
                    oView.getModel("JMFilter").getData().docNamee ="Error";
                    oView.getModel("JMFilter").getData().docNamem =oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMFilter").refresh();
                } else{
                    oView.getModel("JMFilter").getData().docNamee ="None";
                    oView.getModel("JMFilter").getData().docNamem ="";
                    oView.getModel("JMFilter").refresh();
                }
            },
            onChangeDocLink: function(oEvent) {
                var link = oEvent.getSource().getValue();
                if(link.startsWith('https')){
                    oView.getModel("JMFilter").getData().docLinke ="None";
                    oView.getModel("JMFilter").getData().docLinkm ="";
                    oView.getModel("JMFilter").refresh();
                } else {
                    oView.getModel("JMFilter").getData().docLinke ="Error";
                    oView.getModel("JMFilter").getData().docLinkm =oi18n.getProperty("DocLinkErrorMsg");
                    oView.getModel("JMFilter").refresh();
                }
            },

            fnLiveChangePurchOrg: function (oEvent) {
                var compCode= oView.getModel("JMFilter").getData().companyCode;
                if(compCode === "" || compCode === undefined){
                    sap.m.MessageToast.show(oi18n.getProperty("SelectCompanyCode"));
                    
                }
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
            },

            fnLiveChangePurchOrg1: function (oEvent) {
                var compCode= oView.getModel("JMFilter1").getData().companyCode;
                if(compCode === "" || compCode === undefined){
                    sap.m.MessageToast.show(oi18n.getProperty("SelectCompanyCode"));
                    
                }
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
            },

            fnChangeSMEEmail: function(oEvent) {
                var email = oEvent.getSource().getValue();
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (email) {
                    if (!email.match(mailregex)) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("BPCInvalidEmail"));
                    } else {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }
                }
            }
            
        });
    });

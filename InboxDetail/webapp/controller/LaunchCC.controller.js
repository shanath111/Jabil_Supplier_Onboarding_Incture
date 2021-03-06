sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "InboxDetail/util/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/Sorter",
    'sap/m/Token'
],

    function (Controller, formatter, JSONModel, Filter, FilterOperator, MessageBox, BusyDialog, Sorter, Token) {
        "use strict";
        var that, oView, oBusyDilog, oi18n;
        return Controller.extend("InboxDetail.controller.LaunchCC", {
            onInit: function () {
                that = this;
                oView = this.getView();
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt")   //initialize Busy Dialog
                });
                // window.addEventListener("resize", this.fnScreenResize); //Event to be triggered on screen resize
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("LaunchCC").attachMatched(this.fnLaucnhCCRoute, this);

            },

            fnLaucnhCCRoute: function (oEvent) {
                oView.setModel(new JSONModel({
                    "ComCodeInputV": false,
                    "ComCodeDDV": true,
                    "PurcOrgDDV": true,
                    "PurcOrgInputV": false,
                    "CompanyCodeDesc": "",
                    "CompanyCodeDescVS": "None",
                    "CompanyCodeVS": "None",
                    "CompanyCodeVStext": "",
                    "CompanyCodeDescVStext": "",
                    "PurOrgDesc": "For Non PRD Sites",
                    "PurOrgVS": "None",
                    "PurOrgVStext": "",
                    "siteNameVS": "None",
                    "siteNameVStext": "",
                    "erpSystemVS": "None",
                    "erpSystemVStext": ""
                }), "LocalModel");

                oView.getModel("oBPLookUpMdl").setData([]);
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);

                var oJsonFilter = new sap.ui.model.json.JSONModel();
                var temp = {
                    "companyCode": "",
                    "purchasingOrganisation": "",
                    "siteName": "",
                    "paymentMethod": "",
                    "erpSystem": ""
                };
                oJsonFilter.setData(temp);
                oView.setModel(oJsonFilter, "JMFilter");
                this.fnClearSearch();

                // this.fnLoadSiteName();
                // this.fnLoadSiteName1();
                this.fnLoadCompanyCode();
                this.fnLoadCompanyCode1();
                // this.fnLoadDocName();
                // this.fnLoadDocName1();


            },
            fnClearSearch: function () {
                var oJsonFilter = new sap.ui.model.json.JSONModel();
                var temp = {
                    "companyCode": "",
                    "purchasingOrganisation": "",
                    "siteName": "",
                    "paymentMethod": [{ "code": "", "description": "", "codee": "None", "codem": "", "descriptione": "None", "descriptionm": "", "codeEnabled": false, "descEnabled": false }],
                    "erpSystem": ""
                };
                oJsonFilter.setData(temp);
                oView.setModel(oJsonFilter, "JMFilter1");
                // user story 596896               
                oView.getModel("LocalModel").setProperty("/ComCodeInputV", false);
                oView.getModel("LocalModel").setProperty("/ComCodeDDV", true);
                oView.getModel("LocalModel").setProperty("/PurcOrgDDV", true);
                oView.getModel("LocalModel").setProperty("/PurcOrgInputV", false);
                oView.getModel("LocalModel").setProperty("/CompanyCodeDesc", "");
                oView.getModel("LocalModel").setProperty("/CompanyCodeDescVS", "None");
                oView.getModel("LocalModel").setProperty("/CompanyCodeDescVStext", "");
                oView.getModel("LocalModel").setProperty("/PurOrgVS", "None");
                oView.getModel("LocalModel").setProperty("/PurOrgVStext", "");
                oView.getModel("LocalModel").setProperty("/PurOrgVS", "None");
                oView.getModel("LocalModel").setProperty("/PurOrgVStext", "");
                oView.getModel("LocalModel").setProperty("/PurOrgDesc", "");
                oView.getModel("LocalModel").setProperty("/erpSystemVS", "None");
                oView.getModel("LocalModel").setProperty("/erpSystemVStext", "");
                oView.getModel("LocalModel").setProperty("/CompanyCodeVS", "None");
                oView.getModel("LocalModel").setProperty("/CompanyCodeVStext", "");
                oView.getModel("LocalModel").setProperty("/siteNameVS", "None");
                oView.getModel("LocalModel").setProperty("/siteNameVStext", "");


                //oView.getModel("LocalModel").setProperty("/PurcOrgInputV",true);
                // user story 596896

                // oView.byId("id_PaymentMetod").setEnabled(false);
                //  oView.byId("id_PaymentMethodLbl").setRequired(false);

                // var oMultiInput1 = oView.byId("id_PaymentMetod");
                // oMultiInput1.destroyTokens();
                // var fnValidator = function(args){
                //     var text = args.text;

                //     return new Token({key: text, text: text});
                // };

                // oMultiInput1.addValidator(fnValidator);
            },
            fnChangeERPSystem: function () {
                oView.getModel("JMFilter1").getData().paymentMethod = [{ "code": "", "description": "", "codee": "None", "codem": "", "descriptione": "None", "descriptionm": "", "codeEnabled": true, "descEnabled": true }];
                oView.getModel("LocalModel").setProperty("/erpSystemVS", "None");
                oView.getModel("LocalModel").setProperty("/erpSystemVStext", "");
                oView.getModel("LocalModel").setProperty("/CompanyCodeVS", "None");
                oView.getModel("LocalModel").setProperty("/CompanyCodeVStext", "");
                oView.getModel("LocalModel").setProperty("/CompanyCodeDesc", "");
                oView.getModel("LocalModel").setProperty("/CompanyCodeDescVS", "None");
                oView.getModel("LocalModel").setProperty("/CompanyCodeDescVStext", "");
                oView.getModel("LocalModel").setProperty("/PurOrgVS", "None");
                oView.getModel("LocalModel").setProperty("/PurOrgVStext", "");
                if (oView.getModel("JMFilter1").getData().erpSystem == "Site's ERP") {

                    // oView.byId("id_PaymentMetod").setEnabled(true);
                    oView.byId("id_PaymentMethodLbl").setRequired(true);

                    // Changes user story 596896
                    oView.getModel("LocalModel").setProperty("/ComCodeInputV", true);
                    oView.getModel("LocalModel").setProperty("/ComCodeDDV", false);
                    oView.getModel("LocalModel").setProperty("/PurcOrgDDV", false);
                    oView.getModel("LocalModel").setProperty("/PurcOrgInputV", true);
                    oView.getModel("JMFilter1").setProperty("/purchasingOrganisation", "9999");
                    oView.getModel("LocalModel").setProperty("/PurOrgDesc", "For Non PRD Sites");
                    // Changes user story 596896
                } else {
                    // oView.byId("id_PaymentMetod").setEnabled(false);
                    oView.getModel("JMFilter1").getData().paymentMethod[0].codeEnabled = false;
                    oView.getModel("JMFilter1").getData().paymentMethod[0].descEnabled = false;
                    oView.byId("id_PaymentMethodLbl").setRequired(false);

                    //Changes User story 596896
                    oView.getModel("LocalModel").setProperty("/ComCodeInputV", false);
                    oView.getModel("LocalModel").setProperty("/ComCodeDDV", true);
                    oView.getModel("LocalModel").setProperty("/PurcOrgDDV", true);
                    oView.getModel("LocalModel").setProperty("/PurcOrgInputV", false);
                    oView.getModel("JMFilter1").setProperty("/purchasingOrganisation", "");
                    oView.getModel("LocalModel").setProperty("/PurOrgDesc", "");
                    oView.getModel("JMFilter1").setProperty("/companyCode", "");
                    //Changes User story 596896
                }


                oView.getModel("JMFilter1").refresh();

            },

            fnLivePaymentMethodChange: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }

            },
            fnLivePaymentMethodFinish: function (oEvent) {
                if (oEvent.getSource().getSelectedKeys().length !== 0) {
                    oView.getModel("JMFilter1").getData().paymentMethod = "";
                    for (var i = 0; i < oEvent.getSource().getSelectedKeys().length; i++) {
                        oView.getModel("JMFilter1").getData().paymentMethod = oView.getModel("JMFilter1").getData().paymentMethod + oEvent.getSource().getSelectedKeys()[i];
                    }
                } else {
                    oView.getModel("JMFilter1").getData().paymentMethod = "";
                }
                oView.getModel("JMFilter1").refresh();

            },

            // fnLoadSiteName: function() {
            //     var oModel = new JSONModel();
            //     var sUrl = "/InboxDetail/plcm_portal_services/ccpo/siteNames";
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
            //     var sUrl = "/InboxDetail/plcm_portal_services/ccpo/siteNames";
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
                        oView.getModel("JMFilter").getData().purchasingOrg = "";
                        oView.getModel("JMFilter").refresh();
                    }

                }
                this.fnLoadPurOrg(oView.getModel("JMFilter").getData().companyCode, oEvent.getSource().getSelectedItem().getAdditionalText());

                oView.getModel("JMFilter").getData().purchasingOrg = "";
                oView.getModel("JMFilter").refresh();
                // if (oView.getModel("JMFilter").getData().companyCodee == "Error") {
                //     oView.getModel("JMFilter").getData().companyCodee = "None";
                //     oView.getModel("JMFilter").getData().companyCodem = "";
                //     oView.getModel("JMFilter").refresh();
                // }
                if (oView.getModel("LocalModel").getData().CompanyCodeVS == "Error") {
                    oView.getModel("LocalModel").getData().CompanyCodeVS = "None";
                    oView.getModel("LocalModel").getData().CompanyCodeVStext = "";
                    oView.getModel("LocalModel").refresh();
                    oView.getModel("JMFilter").refresh();

                }

            },
            fnLoadPaymentMethod: function (vCompCode) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/paymentMethod/" + vCompCode;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/PaymentMethod", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }


                });

            },
            fnLiveChangeCompCode1: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                oView.getModel("LocalModel").getData().PurOrgVS = "None";
                oView.getModel("LocalModel").getData().PurOrgVStext = "";
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }

                }
                this.fnLoadPurOrg1(oView.getModel("JMFilter1").getData().companyCode, oEvent.getSource().getSelectedItem().getAdditionalText());
                this.fnLoadPaymentMethod(oView.getModel("JMFilter1").getData().companyCode);
                oView.getModel("JMFilter1").getData().purchasingOrganisation = "";

                oView.getModel("JMFilter1").refresh();
                // if (oView.getModel("JMFilter1").getData().companyCodee == "Error") {
                //     oView.getModel("JMFilter1").getData().companyCodee = "None";
                //     oView.getModel("JMFilter1").getData().companyCodem = "";
                //     oView.getModel("JMFilter1").refresh();
                // }
                if (oView.getModel("LocalModel").getData().CompanyCodeVS == "Error") {
                    oView.getModel("LocalModel").getData().CompanyCodeVS = "None";
                    oView.getModel("LocalModel").getData().CompanyCodeVStext = "";
                    oView.getModel("LocalModel").refresh();
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

            // fnLoadDocName: function() {
            //     var oModel = new JSONModel();
            //     var sUrl = "/InboxDetail/plcm_portal_services/ccpo/documentNames";
            //     oModel.loadData(sUrl, {
            //         "Content-Type": "application/json"
            //     });
            //     oModel.attachRequestCompleted(function (oEvent) {
            //         if (oEvent.getParameter("success")) {
            //             oView.getModel("oBPLookUpMdl").setProperty("/DocName", oEvent.getSource().getData());
            //             oView.getModel("oBPLookUpMdl").refresh();
            //         }
            //     });
            // },
            // fnLoadDocName1: function() {
            //     var oModel = new JSONModel();
            //     var sUrl = "/InboxDetail/plcm_portal_services/ccpo/documentNames";
            //     oModel.loadData(sUrl, {
            //         "Content-Type": "application/json"
            //     });
            //     oModel.attachRequestCompleted(function (oEvent) {
            //         if (oEvent.getParameter("success")) {
            //             oView.getModel("oBPLookUpMdl").setProperty("/DocName1", oEvent.getSource().getData());
            //             oView.getModel("oBPLookUpMdl").refresh();
            //         }
            //     });
            // },

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
            fnSearchCompanyCode: function () {
                var vError = false;
                // if (oView.getModel("JMFilter").getData().companyCode == "") {
                //     vError = true
                // }

                if (vError == false) {
                    oBusyDilog.open();
                    var oModel = new JSONModel();
                    var sUrl = "/InboxDetail/plcm_portal_services/ccpo/search"

                    var oPayload = {
                        "companyCode": oView.getModel("JMFilter").getData().companyCode,
                        "purchasingOrganisation": oView.getModel("JMFilter").getData().purchasingOrg,
                        "siteName": oView.getModel("JMFilter").getData().siteName,
                        "erpSystem": oView.getModel("JMFilter").getData().erpSystem,

                    }

                    oModel.loadData(sUrl, JSON.stringify(
                        oPayload
                    ), true, "POST", false, true, {
                        "Content-Type": "application/json"
                    });
                    oModel.attachRequestCompleted(function onCompleted(oEvent) {
                        that.fnLoadCompanyCode();
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
                            // var sErMsg = oEvent.getParameter("errorobject").responseText;
                            // MessageBox.show(sErMsg, {
                            //     icon: MessageBox.Icon.ERROR,
                            //     title: "Error"
                            // });


                        }
                    });


                } else {
                    sap.m.MessageToast.show(oi18n.getProperty("enterTaxCategory"))
                }

            },


            ccLiveChange: function (oEvent) {
                numericFilter(oEvent.getSource().getValue());
                function numericFilter(txb) {
                    oEvent.getSource().setValue(txb.replace(/[^\0-9]/ig, ""));
                    if (oEvent.getSource().getValue().length < 4) {
                        oEvent.getSource().setValueStateText("Company code must be exactly 4 digits numarical");
                        oEvent.getSource().setValueState("Error");
                    } else if (oEvent.getSource().getValue().length === 4) {
                        oEvent.getSource().setValueStateText("");
                        oEvent.getSource().setValueState("None");
                    }
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
            fnSubmitCCPO: function () {
                var vError = false;

                if (oView.getModel("JMFilter1").getData().companyCode == "" || oView.getModel("JMFilter1").getData().companyCode.length < 4) {
                    vError = true;
                    oView.getModel("LocalModel").setProperty("/CompanyCodeVS", "Error");
                    oView.getModel("LocalModel").setProperty("/CompanyCodeVStext", "Company code must be exactly 4 digits numarical");
                }
                if (oView.getModel("JMFilter1").getData().purchasingOrganisation == "") {
                    vError = true;
                    oView.getModel("LocalModel").setProperty("/PurOrgVS", "Error");
                    oView.getModel("LocalModel").setProperty("/PurOrgVStext", "Please enter purchase organisation");
                }
                if(oView.getModel("JMFilter1").getData().erpSystem == "Site's ERP"){
                if (oView.getModel("LocalModel").getProperty("/CompanyCodeDesc") == "") {
                    vError = true;


                    oView.getModel("LocalModel").setProperty("/CompanyCodeDescVS", "Error");
                    oView.getModel("LocalModel").setProperty("/CompanyCodeDescVStext", "Please enter company code description");
                }
            }
                if (oView.getModel("JMFilter1").getData().siteName == "") {
                    vError = true;
                    oView.getModel("LocalModel").setProperty("/siteNameVS", "Error");
                    oView.getModel("LocalModel").setProperty("/siteNameVStext", "Please enter site name");
                }
                if (oView.getModel("JMFilter1").getData().erpSystem == "") {
                    vError = true;
                    oView.getModel("LocalModel").setProperty("/erpSystemVS", "Error");
                    oView.getModel("LocalModel").setProperty("/erpSystemVStext", "Please enter erp system");
                }
                var aPaymentMethod = oView.getModel("JMFilter1").getData().paymentMethod;
                if (oView.getModel("JMFilter1").getData().erpSystem == "Site's ERP" && aPaymentMethod.length > 0) {
                    for (let i = 0; i < aPaymentMethod.length; i++) {
                        if (aPaymentMethod[i].code === "") {
                            vError = true;
                            oView.getModel("JMFilter1").getData().paymentMethod[i].codee = "Error";
                            oView.getModel("JMFilter1").getData().paymentMethod[i].codem = "Please enter payment method Code.";
                        }
                        if (aPaymentMethod[i].description === "") {
                            vError = true;
                            oView.getModel("JMFilter1").getData().paymentMethod[i].descriptione = "Error";
                            oView.getModel("JMFilter1").getData().paymentMethod[i].descriptionm = "Please enter payment method description.";
                        }
                        oView.getModel("JMFilter1").refresh();

                    }

                }









                oView.getModel("JMFilter1").refresh();
                //     var vPaymentMethodVal = "";
                //     if (oView.getModel("JMFilter1").getData().erpSystem == "Site's ERP") {       
                //     if (vPaymentMethod.length == 0) {
                //         vError = true;
                //     }else{
                //       for (var i=0;i<vPaymentMethod.length;i++){
                //           if(!vPaymentMethodVal){
                //             vPaymentMethodVal = vPaymentMethod[i].getText();
                //           }else{
                //             vPaymentMethodVal = vPaymentMethodVal + ","+vPaymentMethod[i].getText();
                //           }
                //       }                }
                // }

                // if(aPaymentMethod && aPaymentMethod.length>0){
                //     for(let i=0; i<aPaymentMethod.length; i++){
                //         if(aPaymentMethod[i].code != "" && aPaymentMethod[i].description === ""){
                //             vError = true;
                //             oView.getModel("JMFilter1").getData().paymentMethod[i].descriptione="Error";
                //             oView.getModel("JMFilter1").getData().paymentMethod[i].descriptionm="Please enter payment method description.";
                //         }
                //         oView.getModel("JMFilter1").refresh();
                //     }
                // }


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
                                var sUrl = "/InboxDetail/plcm_portal_services/ccpo/create"
                                var vBuyer = ""
                                if (oView.getModel("oConfigMdl").getData().usrData) {
                                    vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;

                                }

                                if (oView.getModel("JMFilter1").getData().erpSystem == "Site's ERP") {
                                    var vPaymentMethodVal = [];
                                    for (let i = 0; i < aPaymentMethod.length; i++) {
                                        var paymentMethodObj = { "code": aPaymentMethod[i].code, "description": aPaymentMethod[i].description };
                                        vPaymentMethodVal.push(paymentMethodObj);
                                    }
                                } else {
                                    vPaymentMethodVal = "";
                                }



                                var oPayload = {
                                    "companyCode": oView.getModel("JMFilter1").getData().companyCode,
                                    "purchasingOrganisation": oView.getModel("JMFilter1").getData().purchasingOrganisation,
                                    "companyCodeDescription": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode1, oView.getModel("JMFilter1").getData().companyCode, "CompanyCode"),
                                    "purchasingOrganisationDescription": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PurOrg1, oView.getModel("JMFilter1").getData().purchasingOrganisation, "PurchOrg"),
                                    "siteName": oView.getModel("JMFilter1").getData().siteName,
                                    "paymentMethod": JSON.stringify(vPaymentMethodVal),
                                    "erpSystem": oView.getModel("JMFilter1").getData().erpSystem,
                                    "createdOn": new Date(),
                                    //"updatedOn": null,
                                    "createdBy": vBuyer
                                    //"updatedBy": "Updated Again"
                                };
                                // user story 596896     
                                if (oView.getModel("JMFilter1").getProperty("/erpSystem") === "Site's ERP") {
                                    oPayload.companyCodeDescription = oView.getModel("LocalModel").getProperty("/CompanyCodeDesc");
                                    oPayload.purchasingOrganisationDescription = oView.getModel("LocalModel").getProperty("/PurOrgDesc");


                                }
                                // user story 596896     

                                oModel.loadData(sUrl, JSON.stringify(
                                    oPayload
                                ), true, "POST", false, true, {
                                    "Content-Type": "application/json"
                                });
                                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                                    that.fnLoadCompanyCode();
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
                                        that.fnClearSearch();
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
            fnDeleteCC: function (oEvent) {
                var vccId = oEvent.getSource().getBindingContext("JMCompSearchResult").getProperty("ccAndPoId");
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


                            var sUrl = "/nsBuyerRegistration/plcm_portal_services/ccpo/deleteById/" + vccId;
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
                                    that.fnSearchCompanyCode();
                                    that.fnLoadCompanyCode();

                                },
                                async: false,
                                error: function (data) {
                                    oBusyDilog.close();
                                    that.fnLoadCompanyCode();
                                    // var sErMsg = data.responseText;
                                    // MessageBox.show(sErMsg, {
                                    //     icon: MessageBox.Icon.ERROR,
                                    //     title: "Error"
                                    // });
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
                    "purchasingOrganisation": "",
                    "paymentMethod": [{ "code": "", "description": "", "codee": "None", "codem": "", "descriptione": "None", "descriptionm": "", "codeEnabled": false, "descEnabled": false }]
                };
                oJsonFilter1.setData(temp);
                oView.setModel(oJsonFilter1, "JMFilter1");
                this.oBPSuccess.close();
            },
            fnNavToHome: function () {
                this.getOwnerComponent().getRouter().navTo("Home");
            },
            onChangeLookupValue: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }

                }
            },
            fnLiveChangePurchOrg: function (oEvent) {
                var compCode = oView.getModel("JMFilter").getData().companyCode;
                if (compCode === "" || compCode === undefined) {
                    sap.m.MessageToast.show(oi18n.getProperty("SelectCompanyCode"));

                }
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("LocalModel").getData().PurOrgVS == "Error") {
                    oView.getModel("LocalModel").getData().PurOrgVS = "None";
                    oView.getModel("LocalModel").getData().PurOrgVStext = "";
                    oView.getModel("LocalModel").refresh();
                    oView.getModel("JMFilter").refresh();

                }
            },

            fnLiveChangePurchOrg1: function (oEvent) {
                var compCode = oView.getModel("JMFilter1").getData().companyCode;
                oView.getModel("LocalModel").setProperty("/PurOrgVS", "None");
                oView.getModel("LocalModel").setProperty("/PurOrgVStext", "");
                //  oView.getModel("LocalModel").updateBindings();
                if (compCode === "" || compCode === undefined) {
                    sap.m.MessageToast.show(oi18n.getProperty("SelectCompanyCode"));

                }
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
            },

            addPaymentMethod: function (oEvent) {
                var pmCount = this.getView().getModel("JMFilter1").getData().paymentMethod.length;

                this.getView().getModel("JMFilter1").getData().paymentMethod.push({
                    "code": "",
                    "description": ""
                });

                this.getView().getModel("JMFilter1").refresh();
            },
            fnDeleteContainerlayout: function (oEvent) {
                var index = oEvent.getSource().getBindingContext("JMFilter1").sPath.split("/paymentMethod/")[1];
                this.getView().getModel("JMFilter1").getData().paymentMethod.splice(
                    index, 1);
                this.getView().getModel("JMFilter1").refresh();
            },
            fnChangeInputVal: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
            },
            fnViewPaymentMethod: function (oEvent) {
                var that = this;
                var index = oEvent.getParameter('id').split('-')[2];
                var aPMList = JSON.parse(oView.getModel("JMCompSearchResult").getData()[index].paymentMethod);
                // if()
                var oJsonPM = new sap.ui.model.json.JSONModel();

                oJsonPM.setData(aPMList);
                oView.setModel(oJsonPM, "PMList");
                if (!that.oPopup) {
                    that.oPopup = sap.ui.xmlfragment(
                        "InboxDetail.fragments.PaymentMethodList", that);
                    this.getView().addDependent(that.oPopup);
                }
                that.oPopup.openBy(oEvent.getSource());

            }

            // onChangeDocLink: function(oEvent) {
            //     if(oEvent.getSource().getValue().length > 255) {
            //         oView.getModel("JMFilter").getData().docLinke ="Error";
            //         oView.getModel("JMFilter").getData().docLinkm =oi18n.getProperty("BPCMaxLengthExceeds");
            //         oView.getModel("JMFilter").refresh();
            //     } else{
            //         oView.getModel("JMFilter").getData().docLinke ="None";
            //         oView.getModel("JMFilter").getData().docLinkm ="";
            //         oView.getModel("JMFilter").refresh();
            //     }
            // }
        });
    });

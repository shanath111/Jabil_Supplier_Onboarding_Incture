sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/f/library',
    "ns/BuyerRegistration/util/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/Sorter",
    "sap/base/util/deepExtend"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, library, formatter, JSONModel, Filter, FilterOperator, MessageBox, BusyDialog, Sorter, deepExtend) {
        "use strict";
        var that, oView, oBusyDilog, oi18n, vAction, oSelManageArray;
        return Controller.extend("ns.BuyerRegistration.controller.GBSDetail", {
            onInit: function () {
                oView = this.getView();
                that = this;
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt") //initialize Busy Dialog
                });
                // window.addEventListener("resize", this.fnScreenResize); //Event to be triggered on screen resize
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("GBSDetail").attachPatternMatched(this.fnBuyerExtendRoute1, this);

            },
            fnScreenResize: function () {
                setTimeout(function () {
                    var vTableHeight;
                    vTableHeight = that.getView().byId("id_FilterHeight").getDomRef().offsetHeight - that.getView().byId("id_FilterPanel").getDomRef()
                        .offsetHeight;

                    vTableHeight = vTableHeight - 40;
                    vTableHeight = vTableHeight - 110;
                    var vRow = parseInt(vTableHeight / 33);
                    oView.getModel("oConfigMdl").getData().visibleRowCnt = vRow;
                    oView.getModel("oConfigMdl").refresh();
                }, 600);
            },
            fnPanelCollapse: function () {
                setTimeout(function () {
                    var vTableHeight;
                    vTableHeight = that.getView().byId("id_FilterHeight").getDomRef().offsetHeight - that.getView().byId("id_FilterPanel").getDomRef()
                        .offsetHeight;
                    vTableHeight = vTableHeight - 40;
                    vTableHeight = vTableHeight - 110;
                    var vRow = parseInt(vTableHeight / 33);

                    oView.getModel("oConfigMdl").getData().visibleRowCnt = vRow;
                    oView.getModel("oConfigMdl").refresh();
                }, 600);
            },

            fnBuyerExtendRoute1: function (oEvent) {

                vAction = oEvent.getParameter("arguments").contextPath;

                that.fnLoadLookUpData();
                this.fnScreenResize();
                this.fnClearSearch();
                oView.getModel("oConfigMdl").getData().searchEnable = false;
                oView.getModel("oConfigMdl").refresh();


                this.fnLoadPersonalizationData();

                var oFCL = this.getView().byId("flexibleColumnLayout");
                oFCL.setLayout(library.LayoutType.OneColumn);
                if (vAction !== "New") {
                    this.fnLoadContextData(vAction);
                }
                that.vTaskID = vAction;
                this.fnLoadTaskClaimed(vAction);
            },
            fnLoadTaskClaimed: function (vTaskId) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/WorkboxJavaService/inbox/isClaimed?eventId=" + vTaskId;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {

                        oView.getModel("oConfigMdl").getData().isClaimed = oEvent.getSource().getData().isClaimed;
                        oView.getModel("oConfigMdl").refresh();
                    }
                });
            },
            fnRefresh:function(){
                this.fnLoadContextData(that.vTaskID);
            },


            fnLoadContextData: function (vTaskID) {
                oBusyDilog.open();
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskContext/" + vTaskID
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {


                        var oJosnMdl = new sap.ui.model.json.JSONModel();
                        oJosnMdl.setData(oEvent.getSource().getData().bpSearchParams);
                        oView.setModel(oJosnMdl, "JMSearchFilter");
                        var aTempData = [];
                        that.caseId = oEvent.getSource().getData().caseId;

                        var aFilter = oEvent.getSource().getData().bpSearchParams;
                        var aBPData = oEvent.getSource().getData().bpSelectedResults;
                        var oJosnMdlSel = new sap.ui.model.json.JSONModel();
                        oJosnMdlSel.setData(aBPData);
                        oView.setModel(oJosnMdlSel, "JMSelData");
                        //  that.fnLoadPartnerData("Display", aFilter, aBPData);
                        var vError = false;
                        for (var i = 0; i < aBPData.length; i++) {
                            vError = false;

                            if (!aBPData[i].VENDOR_NAME) {
                                vError = true;
                            }
                            if (!aBPData[i].STREET) {
                                vError = true;
                            }
                            if (!aBPData[i].POSTAL_CODE) {
                                vError = true;
                            }
                            if (!aBPData[i].CITY) {
                                vError = true;
                            }
                            if (!aBPData[i].COUNTRY) {
                                vError = true;
                            }
                            if (!aBPData[i].REGION_STATE_PROVINCE) {
                                vError = true;
                            }
                            if (!aBPData[i].PAYMENT_METHOD) {
                                vError = true;
                            }
                            if (!aBPData[i].PAYMENT_TERMS) {
                                vError = true;
                            }
                            if (!aBPData[i].CURRENCY) {
                                vError = true;
                            }
                            if (!aBPData[i].INCO_TERMS) {
                                vError = true;
                            }
                            if (!aBPData[i].INCOTERMS2) {
                                vError = true;
                            }
                            // if (!aBPData[i].BANK_COUNTRY) {
                            //     vError = true;
                            // }
                            // if (!aBPData[i].IBAN) {
                            //     vError = true;
                            // }
                            if (aBPData[i].BLOCK_FUNCTION) {
                                vError = true;
                            }
                            if (aBPData[i].CENTRAL_POSTING_BLOCK) {
                                vError = true;
                            }
                            if (aBPData[i].CENTRAL_PURCHASING_BLOCK) {
                                vError = true;
                            } if (aBPData[i].COMPANY_CODE_POSTING_BLOCK) {
                                vError = true;
                            } if (aBPData[i].PURCHASING_ORG_BLOCK) {
                                vError = true;
                            } if (aBPData[i].CENTRAL_DELETION_FLAG) {
                                vError = true;
                            } if (aBPData[i].COMPANY_CODE_DEL_FLAG) {
                                vError = true;
                            }
                            if (aBPData[i].PURCHASING_ORG_DEL_FLAG) {
                                vError = true;
                            }

                            if (aBPData[i].CENTRAL_BLOCK_CODE) {
                                vError = true;
                            }
                            if (aBPData[i].PENDING_CHANGE_REQUEST) {
                                vError = true;
                            }

                            if (aBPData[i].RELATIONSHIP_INDICATOR !== "PRIMARY") {
                                vError = true;
                            }
                            aBPData[i].isError = vError;
                        }



                        var temp = {
                            "data": aBPData,
                            "Comments": oEvent.getSource().getData().duplicatesBuyerComments,
                            // "totalPage": vTotalPage,
                            // "fenable": vfenable,
                            // "renable": vrenable,
                            // "totalCount": oEvent.getSource().getData().d.__count,
                            // "currentPage": oView.getModel("oVendorListModel").getData().currentPage,
                            "headerText": "Partner Data Detail (" + aBPData.length + ")"
                        }


                        var oVendorListJson = new sap.ui.model.json.JSONModel();
                        oVendorListJson.setData(temp);
                        that.getView().setModel(oVendorListJson, "oVendorListModel");

                        if (that.caseId) {
                            that.fnLoadCaseDetail(that.caseId);
                        }

                    } else {
                        var temp = {};
                        var oBPCreateModel = new sap.ui.model.json.JSONModel();
                        oBPCreateModel.setData(temp);
                        oView.setModel(oBPCreateModel, "JMBPCreate");
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsfnLoadPartnerDatag, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                    }
                });

            },
            fnLoadLookUpData: function () {
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);
                this.fnLoadCompanyCode();
                this.fnLoadPurOrg();
                this.fnLoadCountry();
                this.fnLoadBlockFunction();

            },
            fnLoadBlockFunction: function (vBind) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/block-functions";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/BlockFunction", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();

                    }
                });
            },
            fnLoadCompanyCode: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/company-codes";
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
            fnLoadPurOrg: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/purchasing-orgs";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/PurOrg", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });

            },
            fnLoadCountry: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/countries";
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


            fnValidationClear: function () {
                this.getView().byId("id_FilterPanel").setExpanded(true);

                oView.byId("id_oneTimeInd").setSelectedIndex(0);
                oView.byId("id_CustDirInd").setSelectedIndex(0);
                oView.byId("id_OutsideProcessInd").setSelectedIndex(0);
                oView.byId("id_ManualAddressInd").setSelectedIndex(0);

            },
            fnClearSearch: function () {
                oSelManageArray = [];
                var temp = {
                    "accountingGroup": "",
                    "blockFunction": "",
                    "centralDeletionFlag": "",
                    "centralPostingBlock": "",
                    "centralPurchasingBlock": "",
                    "city": "",
                    "companyCode": "",
                    "companyCodeDeletionFlag": "",
                    "companyCodePostingBlock": "",
                    "country": "",
                    "duns": "",
                    // "limit": 2,
                    // "pageNo": 0,
                    "postalCode": "",
                    "relationshipIndicator": "",
                    "search": "",
                    "purchaingOrgBlock": "",
                    "purchasingOrg": "",
                    "purchasingOrgDelFlag": "",
                    "street": "",
                    "vendorName": "",
                    "vendorNumber": ""

                };
                var oJosnMdl = new sap.ui.model.json.JSONModel();
                oJosnMdl.setData(temp);
                oView.setModel(oJosnMdl, "JMSearchFilter");
                oView.byId("id_SearchResultTb").clearSelection(true);
                var temp1 = {
                    "data": [],
                    "totalPage": 1,
                    "totalCount": 0,
                    "currentPage": 1,
                    "headerText": "Partner Data Detail (0)"
                }
                var oVendorListJson = new sap.ui.model.json.JSONModel();
                oVendorListJson.setData(temp1);
                this.getView().setModel(oVendorListJson, "oVendorListModel");
            },

            fnCaseListPressNav: function (oEvent) {
                var temp = oView.getModel("oVendorListModel").getData().data[oEvent.getSource().getSelectedIndex()]
                var oBPCreateModel = new sap.ui.model.json.JSONModel();
                oBPCreateModel.setData(temp);
                oView.setModel(oBPCreateModel, "JMBPCreate");


                this.getView().byId("id_FilterPanel").setExpanded(false);
                //  this.getView().byId("id_foter").setVisible(true);

                var oFCL = this.getView().byId("flexibleColumnLayout");
                oFCL.setLayout(library.LayoutType.TwoColumnsMidExpanded);
                oView.getModel("oConfigMdl").getData().closeFullScreenButton = true;
                oView.getModel("oConfigMdl").getData().enterFullScreen = true;
                oView.getModel("oConfigMdl").getData().exitFullScreen = false;
                oView.getModel("oConfigMdl").refresh();

            },
            fnCloseMessage: function () {
                this.oBPSuccess.close();
            },
            fnDoneSubmit: function () {
                //  var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                // var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                //     target: {
                //         semanticObject: "inbox",
                //         action: "Approve"
                //     }
                // })) || ""; // generate the Hash to display a Supplier
                // oCrossAppNavigator.toExternal({
                //     target: {
                //         shellHash: hash
                //     }
                // });
                // var   vUrl = "https://jabil-inc--partner-life-cycle-management-supplieronboar3f57b9da.cfapps.us10.hana.ondemand.com/cp.portal/site#inbox-Approve?sap-ui-app-id-hint=oneapp.incture.workbox&/UnifiedInbox";
                // //vUrl = vUrl.replace("TaskDetail", "UnifiedInbox");
                // sap.m.URLHelper.redirect(vUrl);
                window.parent.location.reload();
            },
            fnCancelAction: function () {
                this.getOwnerComponent().getRouter().navTo("VendorRequest");
            },


            fnPressFullScreen: function () {

                oView.getModel("oConfigMdl").getData().exitFullScreen = true;
                oView.getModel("oConfigMdl").getData().enterFullScreen = false;
                oView.getModel("oConfigMdl").refresh();
                var oFCL = this.getView().byId("flexibleColumnLayout");
                oFCL.setLayout(library.LayoutType.MidColumnFullScreen);


            },
            fnExitFullScreen: function () {
                oView.getModel("oConfigMdl").getData().exitFullScreen = false;
                oView.getModel("oConfigMdl").getData().enterFullScreen = true;
                oView.getModel("oConfigMdl").refresh();
                var oFCL = this.getView().byId("flexibleColumnLayout");
                oFCL.setLayout(library.LayoutType.TwoColumnsMidExpanded);
            },

            fnCloseFullScreen: function () {

                //   this.getView().byId("id_foter").setVisible(false);
                var oFCL = this.getView().byId("flexibleColumnLayout");
                oView.byId("id_SearchResultTb").clearSelection(true);
                oFCL.setLayout(library.LayoutType.OneColumn);
                this.fnScreenResize();
                this.getView().byId("id_FilterPanel").setExpanded(true);
            },
            fnNewBuinessPartner: function () {
                this.getOwnerComponent().getRouter().navTo("BPCreate", {
                    contextPath: "New"
                });
            },
            fnNavToHome: function () {
                this.getOwnerComponent().getRouter().navTo("VendorRequest");
            },
            fnLiveChangeCompCode: function () {

                if (oView.getModel("JMBPCreate").getData().companyCodee == "Error") {
                    oView.getModel("JMBPCreate").getData().companyCodee = "None";
                    oView.getModel("JMBPCreate").getData().companyCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },


            fnLiveChangePlant: function () {
                if (oView.getModel("JMBPCreate").getData().plante == "Error") {
                    oView.getModel("JMBPCreate").getData().plante = "None";
                    oView.getModel("JMBPCreate").getData().plantm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangePurchOrg: function () {
                if (oView.getModel("JMBPCreate").getData().purchasingOrge == "Error") {
                    oView.getModel("JMBPCreate").getData().purchasingOrge = "None";
                    oView.getModel("JMBPCreate").getData().purchasingOrgm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnSelectAllTable: function () {
                if (oView.byId("id_SelectAllCheck").getSelected() == true) {
                    var aJsonData = oView.getModel("oVendorListModel");
                    for (var i = 0; i < aJsonData.getData().length; i++) {
                        aJsonData.getData()[i].isSelect = true;
                    }
                    aJsonData.refresh();
                } else {
                    var aJsonData = oView.getModel("oVendorListModel");
                    for (var i = 0; i < aJsonData.getData().length; i++) {
                        aJsonData.getData()[i].isSelect = false;
                    }
                    aJsonData.refresh();
                }
            },
            fnLoadPartnerData: function (vActn, vFilter, vSelData) {

                var aFilter = oView.getModel("JMSearchFilter").getData();
                oBusyDilog.open();
                var oModel2 = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/api/v1/ehana/search";
                aFilter.limit = 10;
                aFilter.pageNo = oView.getModel("oVendorListModel").getData().currentPage - 1;

                oModel2.loadData(sUrl, JSON.stringify(aFilter), true, "POST", false, true, {
                    "Content-Type": "application/json"
                });
                oModel2.attachRequestCompleted(function (oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {

                        var vTotalPage = parseFloat(oEvent.getSource().getData().d.__count) / 10;

                        if (vTotalPage > 1) {
                            if (vTotalPage % 1 !== 0) {
                                vTotalPage = Number(vTotalPage) + 1;
                            }


                        } else {
                            vTotalPage = 1;
                        }
                        vTotalPage = parseInt(vTotalPage);
                        var vfenable, vrenable;
                        if (vTotalPage == 1) {
                            vfenable = false;
                        }
                        else {
                            vfenable = true;
                        }
                        if (oView.getModel("oVendorListModel").getData().currentPage == vTotalPage) {
                            vfenable = false;
                        }

                        if (oView.getModel("oVendorListModel").getData().currentPage == 1) {
                            vrenable = false;
                        } else {
                            vrenable = true;
                        }

                        var temp = {
                            "data": oEvent.getSource().getData().d.results,
                            "totalPage": vTotalPage,
                            "fenable": vfenable,
                            "renable": vrenable,
                            "totalCount": oEvent.getSource().getData().d.__count,
                            "currentPage": oView.getModel("oVendorListModel").getData().currentPage,
                            "headerText": "Partner Data Detail (" + oEvent.getSource().getData().d.__count + ")"
                        }
                        var vSelData = oView.getModel("JMSelData").getData();
                        if (vSelData) {
                            for (var i = 0; i < vSelData.length; i++) {
                                for (var j = 0; j < temp.data.length; j++) {
                                    if (vSelData[i].BUSINESS_PARTNER_NUMBER == temp.data[j].BUSINESS_PARTNER_NUMBER) {
                                        temp.data[j].isSelect = true;
                                        break;
                                    }
                                }
                            }
                        }

                        var oData = oEvent.getSource().getData();
                        var oVendorListJson = new sap.ui.model.json.JSONModel();
                        oVendorListJson.setData(temp);
                        that.getView().setModel(oVendorListJson, "oVendorListModel");
                        if (oData.statusCode === "0" || (oData.responseMessage !== undefined ? oData.responseMessage.statusCode === "0" : false)) {

                        } else if (oData.statusCode === "1" || (oData.responseMessage !== undefined ? oData.responseMessage.statusCode === "1" : false)) {
                            var sMsg;
                            if (oData.message) {
                                sMsg = oData.message;
                            } else if (oData.responseMessage.message) {
                                sMsg = oData.responseMessage.message;
                            }
                            MessageBox.show(sMsg, {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });

                        }
                    } else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        var oData = oEvent.getSource().getData();
                        var oVendorListJson = new sap.ui.model.json.JSONModel();
                        oVendorListJson.setData([]);
                        that.getView().setModel(oVendorListJson, "oVendorListModel");
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                    }
                });




            },


            fnLoadCaseDetail: function (vCaseID) {
                var oModelFetch = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/case/findById/" + vCaseID
                oModelFetch.loadData(sUrl);
                oModelFetch.attachRequestCompleted(function onCompleted(oEvent) {
                    if (oEvent.getParameter("success")) {
                        var data = oEvent.getSource().getData();
                        var oCaseDetail = new sap.ui.model.json.JSONModel();
                        oCaseDetail.setData(data);
                        that.getView().setModel(oCaseDetail, "JMCaseDetail");
                    } else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                    }
                });

            },
            fnUpdateLocalModel: function (temp) {
                oView.getModel("JMCaseDetail").getData().bpRequestScope.companyCode = temp.COMPANY_CODE;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.purchasingOrg = temp.PURCHASING_ORG;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.corporationName = temp.VENDOR_NAME;
                //oView.getModel("JMCaseDetail").getData().bpRequestScope.workCell = temp.COMPANY_CODE;
                //   oView.getModel("JMCaseDetail").getData().bpRequestScope.plant =temp.COMPANY_CODE;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.incoTerms = temp.INCO_TERMS;
                // oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.firstName = temp.COMPANY_CODE;
                // oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.lastName = temp.COMPANY_CODE;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.email = temp.EMAIL_ADDRESS;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.address1 = temp.STREET;
                //oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.address2 = temp.COMPANY_CODE;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.city = temp.CITY;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.state = temp.REGION_STATE_PROVINCE;
                // oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.district = temp.COMPANY_CODE;

                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.postalCode = temp.POSTAL_CODE;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.country = temp.COUNTRY;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.telephone = temp.PRIMARY_PHONE_NUMBER;

                // oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.fax = temp.COMPANY_CODE;
                // oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.poBoxPostalCode = temp.COMPANY_CODE;
                // oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.rfc = temp.COMPANY_CODE;
                // oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.supplierUrlCompanyWebsite = temp.COMPANY_CODE;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.paymentTerms = temp.PAYMENT_TERMS;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.currency = temp.CURRENCY;
                oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.dunsNumber = temp.DUNS;
                oView.getModel("JMCaseDetail").getData().bpNumber = temp.BUSINESS_PARTNER_NUMBER;
                // oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.incotermNameLocation = temp.COMPANY_CODE;
            },
            fnCloseBankComments: function () {
                this.oBankComments.close();
            },
            fnGBSApprove: function () {
                var vBPNo = [];
                var aTableData = oView.getModel("oVendorListModel").getData().data;
                var vCount = 0;
                var vSelDataTem;
                for (var i = 0; i < aTableData.length; i++) {
                    if (aTableData[i].isSelect == true) {
                        vCount = vCount + 1;
                        var temp = {
                            "BUSINESS_PARTNER_NUMBER": aTableData[i].BUSINESS_PARTNER_NUMBER
                        }
                        vBPNo.push(temp);
                        vSelDataTem = aTableData[i];
                    }
                }


                if (vCount !== 1) {
                    sap.m.MessageToast.show(oi18n.getProperty("GBSSelectSingleRecord"));
                } else {
                    // if (vSelDataTem.isError == true) {
                    //     var sErMsg = oi18n.getProperty("ExtentionNotAllowedWithError");
                    //     MessageBox.show(sErMsg, {
                    //         icon: MessageBox.Icon.ERROR,
                    //         title: "Error"
                    //     });
                    //     return;
                    // }
                    var temp = {};
                    temp.Action = "RJ";
                    //temp.Comments ;
                    temp.Commentse = "None";
                    temp.Commentsm = "";
                    temp.commentsTxt = "Comments";
                    temp.required = true;
                    var oJosnComments = new sap.ui.model.json.JSONModel();
                    oJosnComments.setData(temp);
                    oView.setModel(oJosnComments, "JMAppvrComments");
                    if (!this.oBankComments) {
                        this.oBankComments = sap.ui.xmlfragment(
                            "ns.BuyerRegistration.fragments.ApproverComments", this);
                        oView.addDependent(this.oBankComments);
                    }

                    this.oBankComments.open();
                }
            },
            fnLiveChangeCmntTxtArea: function () {
                oView.getModel("JMAppvrComments").getData().Commentse = "None";
                oView.getModel("JMAppvrComments").getData().Commentsm = "";
                oView.getModel("JMAppvrComments").refresh();
            },

            fnSubmitComments: function () {
                if (!oView.getModel("JMAppvrComments").getData().Comments) {
                    oView.getModel("JMAppvrComments").getData().Commentse = "Error";
                    oView.getModel("JMAppvrComments").getData().Commentsm = oi18n.getProperty("provideComments");
                    oView.getModel("JMAppvrComments").refresh();
                    return;
                }
                var vBPNo = [];
                var aTableData = oView.getModel("oVendorListModel").getData().data;
                var vCount = 0;
                var vSelDataTem;
                for (var i = 0; i < aTableData.length; i++) {
                    if (aTableData[i].isSelect == true) {
                        vCount = vCount + 1;
                        var temp = {
                            "BUSINESS_PARTNER_NUMBER": aTableData[i].BUSINESS_PARTNER_NUMBER
                        }
                        vBPNo.push(temp);
                        vSelDataTem = aTableData[i];
                    }
                }
                oView.getModel("JMCaseDetail").getData().bpSearch.selectedSupplier = JSON.stringify(vSelDataTem);
                var vBuyer = "";
                if (oView.getModel("oConfigMdl").getData().usrData) {
                    vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;
                   
                }
                oView.getModel("JMCaseDetail").getData().userUpdated = vBuyer;
                oView.getModel("JMCaseDetail").getData().dateUpdated = new Date();
                oView.getModel("JMCaseDetail").refresh();

                if (vCount !== 1) {
                    sap.m.MessageToast.show(oi18n.getProperty("GBSSelectSingleRecord"));
                } else {
                    // if (vSelDataTem) {
                    //     if (vSelDataTem.PENDING_CHANGE_REQUEST) {
                    //         var sErMsg = oi18n.getProperty("ExtentionNotAllowed");
                    //         MessageBox.show(sErMsg, {
                    //             icon: MessageBox.Icon.ERROR,
                    //             title: "Error"
                    //         });
                    //         return;
                    //     }
                    // }
                    this.oBankComments.close();
                 //   that.fnUpdateLocalModel(vSelDataTem);
                    MessageBox.confirm(oi18n.getProperty("GBSApprover"), {
                        icon: MessageBox.Icon.Confirmation,
                        title: "Confirmation",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (oAction) {
                            if (oAction == "YES") {
                                oBusyDilog.open();

                                var oModelUpdate = new JSONModel();
                                var sUrl = "/nsBuyerRegistration/plcm_portal_services/case/updateBP"

                                var oPayload = oView.getModel("JMCaseDetail").getData();

                                oModelUpdate.loadData(sUrl, JSON.stringify(
                                    oPayload
                                ), true, "PUT", false, true, {
                                    "Content-Type": "application/json"
                                });
                                oModelUpdate.attachRequestCompleted(function onCompleted(oEvent) {

                                    if (oEvent.getParameter("success")) {

                                        var oModel = new JSONModel();
                                        var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskComplete"
                                        var oPayload = {
                                            "taskId": that.vTaskID,
                                            "bpNumber": "",
                                            "duplicatesSMEComments": oView.getModel("JMAppvrComments").getData().Comments
                                        }
                                        oModel.loadData(sUrl, JSON.stringify(
                                            oPayload
                                        ), true, "POST", false, true, {
                                            "Content-Type": "application/json"
                                        });
                                        oModel.attachRequestCompleted(function onCompleted(oEvent) {
                                            if (oEvent.getParameter("success")) {

                                                oBusyDilog.close();
                                                var temp = {
                                                    "Message": ""
                                                }
                                                temp.Message = oi18n.getProperty("GBSSubmitSuc");
                                                var oJosnMessage = new sap.ui.model.json.JSONModel();
                                                oJosnMessage.setData(temp);
                                                oView.setModel(oJosnMessage, "JMMessageData");
                                                if (!that.oBPSuccess) {
                                                    that.oBPSuccess = sap.ui.xmlfragment(
                                                        "ns.BuyerRegistration.fragments.CreateSuccessGBS", that);
                                                    oView.addDependent(that.oBPSuccess);
                                                }
                                                oBusyDilog.close();
                                                that.oBPSuccess.open();

                                            } else {
                                                oBusyDilog.close();
                                                var sErMsg;
                                                if (oEvent.getParameter("errorobject").statusCode == 409) {
                                                    sErMsg = JSON.parse(oEvent.getParameter("errorobject").responseText).errorMessage;
                                                } else {
                                                    sErMsg = oEvent.getParameter("errorobject").responseText;
                                                }


                                                MessageBox.show(sErMsg, {
                                                    icon: MessageBox.Icon.ERROR,
                                                    title: "Error"
                                                });

                                            }
                                        });

                                    } else {
                                        oBusyDilog.close();
                                        var sErMsg;
                                        if (oEvent.getParameter("errorobject").statusCode == 409) {
                                            sErMsg = JSON.parse(oEvent.getParameter("errorobject").responseText).errorMessage;
                                        } else {
                                            sErMsg = oEvent.getParameter("errorobject").responseText;
                                        }


                                        MessageBox.show(sErMsg, {
                                            icon: MessageBox.Icon.ERROR,
                                            title: "Error"
                                        });
                                    }

                                });





                            }
                        }

                    });
                }
            },
            fnLoadPersonalizationData: function () {
                var clmnList = [
                    {
                        "name": "Pending Change Request",
                        "isSelect": "true"
                    },
                    {
                        "name": "Company Code",
                        "isSelect": "true"
                    },
                    {
                        "name": "Company Code Description",
                        "isSelect": "true"
                    },
                    {
                        "name": "Purchasing Order",
                        "isSelect": "true"
                    },
                    {
                        "name": "Vendor Number",
                        "isSelect": "true"
                    },
                    {
                        "name": "Account Group",
                        "isSelect": "true"
                    },
                    {
                        "name": "Relationship Indicator",
                        "isSelect": "true"
                    },
                    {
                        "name": "Vendor Name",
                        "isSelect": "true"
                    },
                    {
                        "name": "Street",
                        "isSelect": "true"
                    },
                    {
                        "name": "City",
                        "isSelect": "true"
                    },
                    {
                        "name": "Region/State/Province",
                        "isSelect": "true"
                    },
                    {
                        "name": "Country",
                        "isSelect": "true"
                    },
                    {
                        "name": "PostalCode",
                        "isSelect": "true"
                    },
                    {
                        "name": "Primary Phone Number",
                        "isSelect": "true"
                    },
                    {
                        "name": "Email Address",
                        "isSelect": "true"
                    },
                    {
                        "name": "DUNS Number",
                        "isSelect": "true"
                    },
                    {
                        "name": "Vendor Creation Date",
                        "isSelect": "true"
                    },
                    {
                        "name": "FI Payment Terms",
                        "isSelect": "true"
                    },
                    {
                        "name": "PU Payment Terms",
                        "isSelect": "true"
                    },
                    {
                        "name": "Central Deletion Flag",
                        "isSelect": "true"
                    }, {
                        "name": "Block Function",
                        "isSelect": "true"
                    },
                    {
                        "name": "Company Code Deleletion Flag",
                        "isSelect": "true"
                    },
                    {
                        "name": "Purchasing Org Deletion Flag",
                        "isSelect": "true"
                    },
                    {
                        "name": "Central Posting Block",
                        "isSelect": "true"
                    },
                    {
                        "name": "Central Purchasing Block",
                        "isSelect": "true"
                    },
                    {
                        "name": "Central Block Code",
                        "isSelect": "true"
                    },
                    {
                        "name": "Company Code Description",
                        "isSelect": "true"
                    },
                    {
                        "name": "Purchasing Org Block",
                        "isSelect": "true"
                    },
                    {
                        "name": "Payment Method",
                        "isSelect": "true"
                    },
                    {
                        "name": "Payment Terms",
                        "isSelect": "true"
                    },
                    {
                        "name": "Currency",
                        "isSelect": "true"
                    },
                    {
                        "name": "IncoTerms",
                        "isSelect": "true"
                    },
                    {
                        "name": "Bank Country",
                        "isSelect": "true"
                    },
                    {
                        "name": "Bank Key",
                        "isSelect": "true"
                    },
                    {
                        "name": "Bank Account",
                        "isSelect": "true"
                    },
                    {
                        "name": "Bank Acc Holder's Name",
                        "isSelect": "true"
                    },
                    {
                        "name": "Control Key",
                        "isSelect": "true"
                    },
                    {
                        "name": "Bank Type",
                        "isSelect": "true"
                    },
                    {
                        "name": "IBAN",
                        "isSelect": "true"
                    },
                    {
                        "name": "Business Partner Number",
                        "isSelect": "true"
                    },


                ];
                var filterPersonalization = new sap.ui.model.json.JSONModel({
                    "columnList": clmnList
                });
                this.getView().setModel(filterPersonalization, "personalizationModel");

                filterPersonalization.refresh();
            },

            fnPersonaliseColumns: function (oEvent) {
                var oCurrentSelectedColumns = this.getView().getModel("personalizationModel").getData();
                var currentColumnModel = new sap.ui.model.json.JSONModel(deepExtend({}, oCurrentSelectedColumns));
                this.getView().setModel(currentColumnModel, "currentSelectedClmnModel");
                if (!this.FilterPersonalization) {
                    this.FilterPersonalization = sap.ui.xmlfragment("idPersonaliseDialog", "ns.BuyerRegistration.fragments.personalizationFilter", this);
                    this.getView().addDependent(this.FilterPersonalization);
                }
                this.FilterPersonalization.open();
            },

            onChangeCheckbox: function (oEvent) {

                var currentColumnModel = this.getView().getModel("currentSelectedClmnModel");
                var aColumn = $.extend([], currentColumnModel.getData().columnList);
                var sPath = oEvent.getSource().getBindingContext("currentSelectedClmnModel").sPath;
                var nIndex = parseInt(sPath.split("/")[2]);
                if (oEvent.getSource().getSelected()) {
                    aColumn[nIndex].isSelect = "true";
                } else {

                    aColumn[nIndex].isSelect = "false";
                    var oSelectAll = sap.ui.core.Fragment.byId("idPersonaliseDialog", "id_SelectAllClm");
                    oSelectAll.setSelected(false);
                }
                currentColumnModel.setProperty("/columnList", aColumn);
                currentColumnModel.refresh();
            },

            onSavePersonaliseTable: function (oEvent) {
                var personalizationModel = this.getView().getModel("personalizationModel");
                var currentColumnSelected = this.getView().getModel("currentSelectedClmnModel").getData().columnList;
                personalizationModel.getData().columnList = currentColumnSelected;
                personalizationModel.refresh();
                this.FilterPersonalization.close();
            },


            onCancelPersonalization: function () {
                this.FilterPersonalization.close();
            },

            onResetPersonalization: function () {
                var initialArr = this.getView().getModel("personalizationModel").getData().columnList;
                var currentColumnModel = this.getView().getModel("currentSelectedClmnModel");
                currentColumnModel.getData().columnList = initialArr;
                currentColumnModel.refresh();
            },

            fnSelectAllColumns: function (oEvent) {
                var currentColumnModel = this.getView().getModel("currentSelectedClmnModel");
                var aClmnList = currentColumnModel.getData().columnList;
                if (oEvent.getSource().getSelected()) {
                    for (var i = 0; i < aClmnList.length; i++) {
                        currentColumnModel.getData().columnList[i].isSelect = "true";
                    }
                } else {
                    for (var i = 0; i < aClmnList.length; i++) {
                        currentColumnModel.getData().columnList[i].isSelect = "false";
                    }
                }
                currentColumnModel.refresh();
            },

            onSearchColumn: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    var filter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }

                // update list binding
                var oList = sap.ui.core.Fragment.byId("idPersonaliseDialog", "personalizationTableId");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters);
            },
            fnNextPage: function () {
                oView.getModel("oVendorListModel").getData().currentPage = oView.getModel("oVendorListModel").getData().currentPage + 1;
                this.fnLoadPartnerData();
            },
            fnPreviousPage: function () {
                oView.getModel("oVendorListModel").getData().currentPage = oView.getModel("oVendorListModel").getData().currentPage - 1;
                this.fnLoadPartnerData();
            },
        });
    });

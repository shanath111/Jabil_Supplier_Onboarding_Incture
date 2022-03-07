sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/f/library',
    "InboxDetail/util/formatter",
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
        var that, oView, oBusyDilog, oi18n, vAction;
        return Controller.extend("InboxDetail.controller.BPExtend", {
            onInit: function () {
                oView = this.getView();
                that = this;
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt") //initialize Busy Dialog
                });
                // window.addEventListener("resize", this.fnScreenResize); //Event to be triggered on screen resize
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("BPExtend").attachPatternMatched(this.fnBuyerExtendRoute, this);
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

            fnBuyerExtendRoute: function (oEvent) {


                vAction = oEvent.getParameter("arguments").contextPath;
                that.fnValidationClear();
                that.fnLoadLookUpData();

                oView.getModel("oConfigMdl").getData().closeFullScreenButton = false;
                oView.getModel("oConfigMdl").getData().enterFullScreen = false;
                oView.getModel("oConfigMdl").getData().exitFullScreen = false;
                oView.getModel("oConfigMdl").getData().searchEnable = false;
                oView.getModel("oConfigMdl").refresh();
                var oFCL = that.getView().byId("flexibleColumnLayout");
                oFCL.setLayout(library.LayoutType.MidColumnFullScreen);
                oView.getModel("oConfigMdl").getData().ActnBtnEnable = true;
                oView.getModel("oConfigMdl").getData().ActnBtnEnable1 = false;
                oView.getModel("oConfigMdl").refresh();
                oView.getModel("oConfigMdl").getData().ActnBtnEnable1 = false;
                oView.getModel("oConfigMdl").refresh();
                this.fnPopulateGBSData(vAction);
            },
            fnPopulateGBSData: function (vTaskId) {
                oBusyDilog.open();
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_portal_services/workflow/taskContext/" + vTaskId
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {
                        if (oEvent.getSource().getData().error) {
                            var sErMsg = oEvent.getSource().getData().error.message;
                            MessageBox.show(sErMsg, {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });
                        } else {
                            var oModelLdData = new JSONModel();
                            var sUrl = "/InboxDetail/plcm_portal_services/case/findById/" + oEvent.getSource().getData().caseId
                            oModelLdData.loadData(sUrl);
                            oModelLdData.attachRequestCompleted(function onCompleted(oEvent) {
                                if (oEvent.getParameter("success")) {
                                    var data = oEvent.getSource().getData();
                                    var temp;
                                    var vBuyer = ""
                                    if (oView.getModel("oConfigMdl").getData().usrData) {
                                        vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;

                                    }

                                    temp = {
                                        "caseId": data.caseId,
                                        "status": data.status,
                                        "dateCreated": data.dateCreated,
                                        "userCreated": data.userCreated,
                                        "dateUpdated": data.dateUpdated,
                                        "userUpdated": data.userUpdated,
                                        "scopeId": data.bpRequestScope.scopeId,
                                        "workflowId": data.bpRequestScope.workflowId,
                                        "supplier": data.bpRequestScope.supplier,
                                        "companyCode": data.bpRequestScope.companyCode,
                                        "purchasingOrg": data.bpRequestScope.purchasingOrg,
                                        "plant": data.bpRequestScope.plant,
                                        "corporationName": data.bpRequestScope.corporationName,
                                        "workCell": data.bpRequestScope.workCell,
                                        "workCelld": "",
                                        "buyerName": vBuyer,
                                        "incoTerms": data.bpRequestScope.incoTerms,
                                        "incoTermsd": "",
                                        "isNew": data.bpRequestScope.isNew,
                                        "isDuplicatesFound": data.bpRequestScope.isDuplicatesFound,
                                        "conflictOfInterest": data.bpRequestScope.conflictOfInterest,
                                        "additionalInformation": data.bpRequestScope.additionalInformation,
                                        "addlScopeId": data.bpRequestScope.bpRequestScopeAddlDetails.addlScopeId,
                                        "firstName": data.bpRequestScope.bpRequestScopeAddlDetails.firstName,
                                        "lastName": data.bpRequestScope.bpRequestScopeAddlDetails.lastName,
                                        "jobTitle": data.bpRequestScope.bpRequestScopeAddlDetails.jobTitle,
                                        "email": data.bpRequestScope.bpRequestScopeAddlDetails.email,
                                        "contactCountryCode": data.bpRequestScope.bpRequestScopeAddlDetails.contactCountryCode,
                                        "contactNumber": data.bpRequestScope.bpRequestScopeAddlDetails.contactNumber,
                                        "extension": data.bpRequestScope.bpRequestScopeAddlDetails.extension,
                                        "address1": data.bpRequestScope.bpRequestScopeAddlDetails.address1,
                                        "address2": data.bpRequestScope.bpRequestScopeAddlDetails.address2,
                                        "city": data.bpRequestScope.bpRequestScopeAddlDetails.city,
                                        "state": data.bpRequestScope.bpRequestScopeAddlDetails.state,
                                        "stated": "",
                                        "district": data.bpRequestScope.bpRequestScopeAddlDetails.district,
                                        "region": data.bpRequestScope.bpRequestScopeAddlDetails.region,

                                        "postalCode": data.bpRequestScope.bpRequestScopeAddlDetails.postalCode,
                                        "country": data.bpRequestScope.bpRequestScopeAddlDetails.country,
                                        "countryd": "",
                                        "telephone": data.bpRequestScope.bpRequestScopeAddlDetails.telephone,
                                        "fax": data.bpRequestScope.bpRequestScopeAddlDetails.fax,
                                        "poBoxPostalCode": data.bpRequestScope.bpRequestScopeAddlDetails.poBoxPostalCode,
                                        "rfc": data.bpRequestScope.bpRequestScopeAddlDetails.rfc,
                                        "supplierUrlCompanyWebsite": data.bpRequestScope.bpRequestScopeAddlDetails.supplierUrlCompanyWebsite,
                                        "representAnotherCompany": data.bpRequestScope.bpRequestScopeAddlDetails.representAnotherCompany,
                                        "supplierTypeClassificationL1": data.bpRequestScope.bpRequestScopeAddlDetails.supplierTypeClassificationL1,
                                        "supplierCommodityClassificationL2": data.bpRequestScope.bpRequestScopeAddlDetails.supplierCommodityClassificationL2,
                                        "oneTimePurchaseSupplierIndicator": data.bpRequestScope.bpRequestScopeAddlDetails.oneTimePurchaseSupplierIndicator,
                                        "customerDirectedSupplierIndicator": data.bpRequestScope.bpRequestScopeAddlDetails.customerDirectedSupplierIndicator,
                                        "customerDirectedSupplierCustName": data.bpRequestScope.bpRequestScopeAddlDetails.customerDirectedSupplierCustName,
                                        "customerDirectedSupplierContract": data.bpRequestScope.bpRequestScopeAddlDetails.customerDirectedSupplierContract,
                                        "outsideProcessiongSupplierIndicator": data.bpRequestScope.bpRequestScopeAddlDetails.outsideProcessiongSupplierIndicator,
                                        "manualAddressOverrideSupplierIndicator": data.bpRequestScope.bpRequestScopeAddlDetails.manualAddressOverrideSupplierIndicator,
                                        "paymentTerms": data.bpRequestScope.bpRequestScopeAddlDetails.paymentTerms,
                                        "paymentTermsd": "",
                                        "newPaymentTerms": data.bpRequestScope.bpRequestScopeAddlDetails.newPaymentTerms,
                                        "currency": data.bpRequestScope.bpRequestScopeAddlDetails.currency,
                                        "dunsNumber": data.bpRequestScope.bpRequestScopeAddlDetails.dunsNumber,
                                        "incotermNameLocation": data.bpRequestScope.bpRequestScopeAddlDetails.incotermNameLocation,
                                        "newIncoTermsNameLocation": data.bpRequestScope.bpRequestScopeAddlDetails.newIncoTermsNameLocation,
                                        "newIncoTerms": data.bpRequestScope.bpRequestScopeAddlDetails.newIncoTerms,
                                        "altContactFirstName": data.bpRequestScope.bpRequestScopeAddlDetails.altContactFirstName,
                                        "altContactJobTitle": data.bpRequestScope.bpRequestScopeAddlDetails.altContactJobTitle,
                                        "altContactLastName": data.bpRequestScope.bpRequestScopeAddlDetails.altContactLastName,
                                        "altEmail": data.bpRequestScope.bpRequestScopeAddlDetails.altEmail,
                                        "altPhoneNumber": data.bpRequestScope.bpRequestScopeAddlDetails.altPhoneNumber,
                                        "product": data.bpRequestScope.bpRequestScopeAddlDetails.product,
                                        "requestorConflictOfInterest": data.bpRequestScope.bpRequestScopeAddlDetails.requestorConflictOfInterest,
                                        "companyCodee": "None",
                                        "companyCodem": "",
                                        "plante": "None",
                                        "plantm": "",
                                        "purchasingOrge": "None",
                                        "purchasingOrgm": "",
                                        "altContactFirstNamee": "None",
                                        "altContactLastNamee": "None",
                                        "altContactJobTitlee": "None",
                                        "altEmaile": "None",
                                        "altPhoneNumbere": "None",
                                        "altContactFirstNamem": "",
                                        "altContactLastNamem": "",
                                        "altContactJobTitlem": "",
                                        "altEmailm": "",
                                        "altPhoneNumberm": "",
                                    };
                                    var oBPCreateModel = new sap.ui.model.json.JSONModel();
                                    oBPCreateModel.setData(temp);
                                    oView.setModel(oBPCreateModel, "JMBPCreate");
                                  //  that.fnLoadWorkCell(true);
                                    that.fnLoadIncoterms(true);
                                    that.fnLoadCountry(true);
                                    that.fnLoadState(temp.country);
                                    that.fnLoadPayemntTerms(true);
                                    if (temp.conflictOfInterest == true) {
                                        oView.byId("id_conflictIntrest").setSelectedIndex(0);
                                    } else if (temp.conflictOfInterest == false) {
                                        oView.byId("id_conflictIntrest").setSelectedIndex(1);
                                    } else {
                                        oView.byId("id_conflictIntrest").setSelectedIndex(-1);
                                    }
                                    if (temp.requestorConflictOfInterest == true) {
                                        oView.byId("id_conflictIntrest1").setSelectedIndex(0);
                                    } else if (temp.requestorConflictOfInterest == false) {
                                        oView.byId("id_conflictIntrest1").setSelectedIndex(1);
                                    } else {
                                        oView.byId("id_conflictIntrest1").setSelectedIndex(-1);
                                    }
                                    if (temp.oneTimePurchaseSupplierIndicator == false) {
                                        oView.byId("id_oneTimeInd").setSelectedIndex(1);
                                    } else {
                                        oView.byId("id_oneTimeInd").setSelectedIndex(0);
                                    }
                                    if (temp.customerDirectedSupplierIndicator == false) {
                                        oView.byId("id_CustDirInd").setSelectedIndex(1);
                                    } else {
                                        oView.byId("id_CustDirInd").setSelectedIndex(0);
                                    }
                                    if (temp.outsideProcessiongSupplierIndicator == false) {
                                        oView.byId("id_OutsideProcessInd").setSelectedIndex(1);
                                    } else {
                                        oView.byId("id_OutsideProcessInd").setSelectedIndex(0);
                                    }
                                    if (temp.manualAddressOverrideSupplierIndicator == false) {
                                        oView.byId("id_ManualAddressInd").setSelectedIndex(1);
                                    } else {
                                        oView.byId("id_ManualAddressInd").setSelectedIndex(0);
                                    }

                                } else {
                                    var sErMsg = oEvent.getParameter("errorobject").responseText;
                                    MessageBox.show(sErMsg, {
                                        icon: MessageBox.Icon.ERROR,
                                        title: "Error"
                                    });
                                }
                            });
                        }
                    } else {
                        var temp = {};
                        var oBPCreateModel = new sap.ui.model.json.JSONModel();
                        oBPCreateModel.setData(temp);
                        oView.setModel(oBPCreateModel, "JMBPCreate");
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });

                    }
                });

            },
            fnLoadLookUpData: function () {
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);
                this.fnLoadCompanyCode();
                this.fnLoadPlant();
                this.fnLoadPurOrg();
                this.fnLoadWorkCell();

            },
            fnLoadCompanyCode: function () {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/company-codes";
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

            fnLoadPlant: function () {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/plants";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/Plant", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });

            },
            fnLoadPurOrg: function () {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/purchasing-orgs";
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
            fnLoadWorkCell: function (vBind) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/workcell-list";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/WorkCell", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                        if (vBind == true) {
                            oView.getModel("JMBPCreate").getData().workCelld = that.fnFetchDescriptionWorkCell(oView.getModel("oBPLookUpMdl").getData().WorkCell, oView.getModel("JMBPCreate").getData().workCell, "WorkCell")
                            oView.getModel("JMBPCreate").refresh();
                        }
                    }
                });
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
            fnFetchDescriptionWorkCell(aArray, value, vFieldName) {
                if (aArray) {
                    if (value) {
                        var item = aArray.find(item => item.id == value);
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
            fnLoadPayemntTerms: function (vBind) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/payment-terms";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/PaymentTerms", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                        if (vBind == true) {
                            oView.getModel("JMBPCreate").getData().paymentTermsd = that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PaymentTerms, oView.getModel("JMBPCreate").getData().paymentTerms, "PaymentTerms")
                            oView.getModel("JMBPCreate").refresh();
                        }


                    }
                });
            },
            fnLoadIncoterms: function (vBind) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/incoterms";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/Incoterms", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                        if (vBind == true) {
                            oView.getModel("JMBPCreate").getData().incoTermsd = that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().Incoterms, oView.getModel("JMBPCreate").getData().incoTerms, "Incoterms")
                            oView.getModel("JMBPCreate").refresh();
                        }
                    }
                });
            },

            fnLoadState: function (vCountry) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/regions/?country=" + vCountry;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/State", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                        oView.getModel("JMBPCreate").getData().stated = that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().State, oView.getModel("JMBPCreate").getData().state, "State")
                        oView.getModel("JMBPCreate").refresh();

                    }
                });
            },
            fnLoadCountry: function (vBind) {
                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/countries";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/Country", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                        if (vBind == true) {
                            oView.getModel("JMBPCreate").getData().countryd = that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().Country, oView.getModel("JMBPCreate").getData().country, "Country")
                            oView.getModel("JMBPCreate").refresh();
                        }
                    }
                });
            },

            fnValidationClear: function () {
                this.getView().byId("id_FilterPanel").setExpanded(true);

                oView.byId("id_oneTimeInd").setSelectedIndex(0);
                oView.byId("id_CustDirInd").setSelectedIndex(0);
                oView.byId("id_OutsideProcessInd").setSelectedIndex(0);
                oView.byId("id_ManualAddressInd").setSelectedIndex(0);
                oView.byId("id_conflictIntrest").setSelectedIndex(-1);
                oView.byId("id_conflictIntrest1").setSelectedIndex(-1);
            },
            fnClearSearch: function () {
                var temp = {
                    "AccountGroup": "",
                    "DUNS": "",
                    "VendorName": "",
                    "VendorNumber": "",
                    "CompanyCode": "",
                    "PurchasingOrg": "",
                    "RelationshipIndicator": "",
                    "Street": "",
                    "City": "",
                    "Country": "",
                    "PostalCode": "",
                    "CentralDeletionFlag": "",
                    "BlockFunction": "",
                    "CentralPostingBlock": "",
                    "CentralPurchasingBlock": "",
                    "CompanyCodePostingBlock": "",
                    "PurchasingOrgBlock": "",
                    "CompanyCodeDelFlag": "",
                    "PurchasingOrgDelFlag": ""
                };
                var oJosnMdl = new sap.ui.model.json.JSONModel();
                oJosnMdl.setData(temp);
                oView.setModel(oJosnMdl, "JMSearchFilter");
                oView.byId("id_SearchResultTb").clearSelection(true);
                var oVendorListJson = new sap.ui.model.json.JSONModel();
                oVendorListJson.setData([]);
                this.getView().setModel(oVendorListJson, "oVendorListModel");
            },


            fnCloseMessage: function () {
                this.oBPSuccess.close();
            },
            fnDoneSubmit: function () {

                // var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
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
                //       var  vUrl = "https://jabil-inc--partner-life-cycle-management-supplieronboar3f57b9da.cfapps.us10.hana.ondemand.com/cp.portal/site#inbox-Approve?sap-ui-app-id-hint=oneapp.incture.workbox&/UnifiedInbox;
                //   //  vUrl = vUrl.replace("TaskDetail", "UnifiedInbox");
                //     sap.m.URLHelper.redirect(vUrl);
                window.parent.location.reload();

            },
            fnCancelAction: function () {
                //    this.getOwnerComponent().getRouter().navTo("VendorRequest");
            },
            fnCreateBP: function () {
                this.fnMandatoryFieldClear();
                this.fnSubmitBP("SD");
            },
            fnCreateBPWF: function () {
                this.fnSubmitBP("SU");
            },

            fnSubmitBP: function (vBtnActn) {
                var vError = false;
                if (vBtnActn == "SU") {
                    if (!oView.getModel("JMBPCreate").getData().companyCode) {
                        oView.getModel("JMBPCreate").getData().companyCodee = "Error";
                        oView.getModel("JMBPCreate").getData().companyCodem = oi18n.getProperty("BPCCompCodeMandat");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }

                    var vIsNew = false;
                    if (!oView.getModel("JMBPCreate").getData().plant) {
                        oView.getModel("JMBPCreate").getData().plante = "Error";
                        oView.getModel("JMBPCreate").getData().plantm = oi18n.getProperty("BPCMandatoryValidationPlant");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }
                    if (!oView.getModel("JMBPCreate").getData().purchasingOrg) {
                        oView.getModel("JMBPCreate").getData().purchasingOrge = "Error";
                        oView.getModel("JMBPCreate").getData().purchasingOrgm = oi18n.getProperty("BPCMandatoryValidationPOrg");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }
                    if (!oView.getModel("JMBPCreate").getData().altContactFirstName) {
                        oView.getModel("JMBPCreate").getData().altContactFirstNamee = "Error";
                        oView.getModel("JMBPCreate").getData().altContactFirstNamem = oi18n.getProperty("BPCMandatoryValidationAltFname");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    } else if (oView.getModel("JMBPCreate").getData().altContactFirstNamee == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().altContactLastName) {
                        oView.getModel("JMBPCreate").getData().altContactLastNamee = "Error";
                        oView.getModel("JMBPCreate").getData().altContactLastNamem = oi18n.getProperty("BPCMandatoryValidationAltLastName");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    } else if (oView.getModel("JMBPCreate").getData().altContactLastNamee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().altContactJobTitlee == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().altEmail) {
                        oView.getModel("JMBPCreate").getData().altEmaile = "Error";
                        oView.getModel("JMBPCreate").getData().altEmailm = oi18n.getProperty("PleaseProvideAltEmail");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    } else if (oView.getModel("JMBPCreate").getData().altEmaile == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().altPhoneNumber) {
                        oView.getModel("JMBPCreate").getData().altPhoneNumbere = "Error";
                        oView.getModel("JMBPCreate").getData().altPhoneNumberm = oi18n.getProperty("BPCMandatoryValidationAltPhoneNum");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    } else if (oView.getModel("JMBPCreate").getData().altPhoneNumbere == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().supplierTypeClassificationL1e == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().supplierCommodityClassificationL2e == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().incotermNameLocatione == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().workCell) {
                        oView.getModel("JMBPCreate").getData().workCelle = "Error";
                        oView.getModel("JMBPCreate").getData().workCellm = oi18n.getProperty("BPCMandatoryValidationWorkCell");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }
                    if (!oView.getModel("JMBPCreate").getData().product) {
                        oView.getModel("JMBPCreate").getData().producte = "Error";
                        oView.getModel("JMBPCreate").getData().productm = oi18n.getProperty("BPCMandatoryValidationProduct");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    } else if (oView.getModel("JMBPCreate").getData().producte == "Error") {
                        vError = true;
                    }
                    if (oView.byId("id_conflictIntrest").getSelectedIndex() == -1) {
                        oView.getModel("JMBPCreate").getData().conflicte = "Error";
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }

                } else {
                    if (oView.getModel("JMBPCreate").getData().altContactFirstNamee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().altContactLastNamee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().altContactJobTitlee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().altPhoneNumbere == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().altEmaile == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().supplierTypeClassificationL1e == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().supplierCommodityClassificationL2e == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().producte == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().incotermNameLocatione == "Error") {
                        vError = true;
                    }

                }


                var oModel = new JSONModel();
                var sUrl, vQuery;
                if (oView.getModel("JMBPCreate").getData().caseId) {
                    sUrl = "/InboxDetail/plcm_portal_services/case/updateBP";
                    vQuery = "PUT";
                } else {
                    sUrl = "/InboxDetail/plcm_portal_services/case/createBP";
                    vQuery = "POST";
                }
                var vConflictOfInt;
                var vConflictOfIntSel = oView.byId("id_conflictIntrest").getSelectedIndex();
                if (vConflictOfIntSel == 0) {
                    vConflictOfInt = true;
                } else if (vConflictOfIntSel == 1) {
                    vConflictOfInt = false;
                } else {
                    vConflictOfInt = "";
                }
                var vConflictOfInt1;
                var vConflictOfIntSel1 = oView.byId("id_conflictIntrest1").getSelectedIndex();
                if (vConflictOfIntSel1 == 0) {
                    vConflictOfInt1 = true;
                } else if (vConflictOfIntSel1 == 1) {
                    vConflictOfInt1 = false;
                } else {
                    vConflictOfInt1 = "";
                }
                var vOneTimeInd = oView.byId("id_oneTimeInd").getSelectedIndex();
                if (vOneTimeInd == 0) {
                    vOneTimeInd = true;
                } else {
                    vOneTimeInd = false;
                }
                var vCustDirInd = oView.byId("id_CustDirInd").getSelectedIndex();
                if (vCustDirInd == 0) {
                    vCustDirInd = true;
                } else {
                    vCustDirInd = false;
                }
                var vOutsideProcessInd = oView.byId("id_OutsideProcessInd").getSelectedIndex();
                if (vOutsideProcessInd == 0) {
                    vOutsideProcessInd = true;
                } else {
                    vOutsideProcessInd = false;
                }
                var vManualAddrInd = oView.byId("id_ManualAddressInd").getSelectedIndex();
                if (vManualAddrInd == 0) {
                    vManualAddrInd = true;
                } else {
                    vManualAddrInd = false;
                }
                if (vError == true) {
                    return;
                }
                var vConfirmMsg, vStatus = "";
                if (vBtnActn == "SD") {
                    vConfirmMsg = oi18n.getProperty("BPCConfirmSaveAsDraft");
                } else if (vBtnActn == "SU") {
                    vConfirmMsg = oi18n.getProperty("BPCConfirmSubmit");
                    vStatus = "In Progress"
                }

                MessageBox.confirm(vConfirmMsg, {
                    icon: MessageBox.Icon.Confirmation,
                    title: "Confirmation",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            oBusyDilog.open();
                            var oPayload = {
                                "bpRequestScope": {
                                    "bpRequestScopeAddlDetails": {
                                        "addlScopeId": oView.getModel("JMBPCreate").getData().addlScopeId,
                                        "address1": oView.getModel("JMBPCreate").getData().address1,
                                        "address2": oView.getModel("JMBPCreate").getData().address2,
                                        "city": oView.getModel("JMBPCreate").getData().city,
                                        "contactNumber": oView.getModel("JMBPCreate").getData().contactNumber,
                                        "country": oView.getModel("JMBPCreate").getData().country,
                                        "customerDirectedSupplierContract": oView.getModel("JMBPCreate").getData().customerDirectedSupplierContract,
                                        "customerDirectedSupplierCustName": oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustName,
                                        "customerDirectedSupplierIndicator": vCustDirInd,
                                        "district": oView.getModel("JMBPCreate").getData().district,
                                        "email": oView.getModel("JMBPCreate").getData().email,
                                        "extension": "",
                                        "fax": oView.getModel("JMBPCreate").getData().fax,
                                        "firstName": oView.getModel("JMBPCreate").getData().firstName,
                                        "jobTitle": oView.getModel("JMBPCreate").getData().jobTitle,
                                        "lastName": oView.getModel("JMBPCreate").getData().lastName,
                                        "manualAddressOverrideSupplierIndicator": vManualAddrInd,
                                        "oneTimePurchaseSupplierIndicator": vOneTimeInd,
                                        "outsideProcessiongSupplierIndicator": vOutsideProcessInd,
                                        "postalCode": oView.getModel("JMBPCreate").getData().postalCode,
                                        "region": oView.getModel("JMBPCreate").getData().region,
                                        "state": oView.getModel("JMBPCreate").getData().state,
                                        "supplierCommodityClassificationL2": oView.getModel("JMBPCreate").getData().supplierCommodityClassificationL2,
                                        "supplierTypeClassificationL1": oView.getModel("JMBPCreate").getData().supplierTypeClassificationL1,
                                        "telephone": oView.getModel("JMBPCreate").getData().telephone,
                                        "poBoxPostalCode": oView.getModel("JMBPCreate").getData().poBoxPostalCode,
                                        "rfc": oView.getModel("JMBPCreate").getData().rfc,
                                        "supplierUrlCompanyWebsite": oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsite,
                                        "representAnotherCompany": oView.getModel("JMBPCreate").getData().representAnotherCompany,
                                        "altContactFirstName": oView.getModel("JMBPCreate").getData().altContactFirstName,
                                        "altContactJobTitle": oView.getModel("JMBPCreate").getData().altContactJobTitle,
                                        "altContactLastName": oView.getModel("JMBPCreate").getData().altContactLastName,
                                        "altEmail": oView.getModel("JMBPCreate").getData().altEmail,
                                        "altPhoneNumber": oView.getModel("JMBPCreate").getData().altPhoneNumber,

                                        "paymentTerms": oView.getModel("JMBPCreate").getData().paymentTerms,
                                        "newPaymentTerms": oView.getModel("JMBPCreate").getData().newPaymentTerms,
                                        "currency": oView.getModel("JMBPCreate").getData().currency,
                                        "dunsNumber": oView.getModel("JMBPCreate").getData().dunsNumber,
                                        "incotermNameLocation": oView.getModel("JMBPCreate").getData().incotermNameLocation,
                                        "newIncoTermsNameLocation": oView.getModel("JMBPCreate").getData().newIncoTermsNameLocation,
                                        "newIncoTerms": oView.getModel("JMBPCreate").getData().newIncoTerms,
                                        "requestorConflictOfInterest": vConflictOfInt1,
                                        "product": oView.getModel("JMBPCreate").getData().product
                                    },
                                    "additionalInformation": oView.getModel("JMBPCreate").getData().additionalInformation,
                                    "buyerName": oView.getModel("JMBPCreate").getData().buyerName,
                                    "companyCode": oView.getModel("JMBPCreate").getData().companyCode,
                                    "conflictOfInterest": vConflictOfInt,
                                    "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                                    "incoTerms": oView.getModel("JMBPCreate").getData().incoTerms,

                                    "isNew": vIsNew,
                                    "isDuplicatesFound": false,
                                    "plant": oView.getModel("JMBPCreate").getData().plant,
                                    "purchasingOrg": oView.getModel("JMBPCreate").getData().purchasingOrg,
                                    "scopeId": oView.getModel("JMBPCreate").getData().scopeId,

                                    "workCell": oView.getModel("JMBPCreate").getData().workCell,
                                    "workflowId": ""
                                },
                                "caseId": oView.getModel("JMBPCreate").getData().caseId,
                                "dateCreated": oView.getModel("JMBPCreate").getData().dateCreated,
                                "dateUpdated": oView.getModel("JMBPCreate").getData().dateUpdated,
                                "status": vStatus,
                                "userCreated": oView.getModel("JMBPCreate").getData().buyerName,
                                "userUpdated": oView.getModel("JMBPCreate").getData().userUpdated
                            }
                            oModel.loadData(sUrl, JSON.stringify(oPayload), true, vQuery, false, true, {
                                "Content-Type": "application/json"
                            });
                            oModel.attachRequestCompleted(function (oEvent) {
                                if (oEvent.getParameter("success")) {
                                    var temp = {
                                        "Message": "",
                                        "caseId": oEvent.getSource().getData().caseId
                                    }
                                    that.caseId = oEvent.getSource().getData().caseId;
                                    if (vBtnActn == "SD") {
                                        temp.Message = oi18n.getProperty("BPCSaveAsDraftMessageExt");
                                        var oJosnMessage = new sap.ui.model.json.JSONModel();
                                        oJosnMessage.setData(temp);
                                        oView.setModel(oJosnMessage, "JMMessageData");
                                        if (!that.oBPSuccess) {
                                            that.oBPSuccess = sap.ui.xmlfragment(
                                                "InboxDetail.fragments.CreateSuccess", that);
                                            oView.addDependent(that.oBPSuccess);
                                        }
                                        oBusyDilog.close();
                                        that.oBPSuccess.open();
                                    } else if (vBtnActn == "SU") {
                                        var oModelWf = new JSONModel();
                                        var sUrl = "/InboxDetail/plcm_portal_services/workflow/taskComplete"
                                        var oPayload = {
                                            "taskId": vAction,
                                            "bpNumber": ""
                                        }
                                        oModelWf.loadData(sUrl, JSON.stringify(
                                            oPayload
                                        ), true, "POST", false, true, {
                                            "Content-Type": "application/json"
                                        });
                                        oModelWf.attachRequestCompleted(function (oEvent) {
                                            if (oEvent.getParameter("success")) {
                                                oBusyDilog.close();
                                                var temp = {
                                                    "Message": "",
                                                    "caseId": that.caseId
                                                }
                                                temp.Message = oi18n.getProperty("BPCSuccessMessageExt");
                                                var oJosnMessage = new sap.ui.model.json.JSONModel();
                                                oJosnMessage.setData(temp);
                                                oView.setModel(oJosnMessage,
                                                    "JMMessageData");
                                                if (!that.oBPSuccess) {
                                                    that.oBPSuccess = sap.ui.xmlfragment(
                                                        "InboxDetail.fragments.CreateSuccess", that);
                                                    oView.addDependent(that.oBPSuccess);
                                                }
                                                that.oBPSuccess.open();
                                            } else {
                                                var temp = {
                                                    "Message": oi18n.getProperty("BPCSuccessMessageExt"),
                                                    "caseId": that.caseId
                                                };
                                                var oJosnMessage = new sap.ui.model.json.JSONModel();
                                                oJosnMessage.setData(temp);
                                                oView.setModel(oJosnMessage, "JMMessageData");
                                                if (!that.oBPSuccess) {
                                                    that.oBPSuccess = sap.ui.xmlfragment(
                                                        "InboxDetail.fragments.CreateSuccess", that);
                                                    oView.addDependent(that.oBPSuccess);
                                                }
                                                oBusyDilog.close();
                                                that.oBPSuccess.open();
                                                // oBusyDilog.close();
                                                // var sErMsg = oEvent.getParameter("errorobject").responseText;
                                                // MessageBox.show(sErMsg, {
                                                //     icon: MessageBox.Icon.ERROR,
                                                //     title: "Error"
                                                // });

                                            }
                                        });

                                    }
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
            fnChangeFirstName1: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 34) {
                    oView.getModel("JMBPCreate").getData().altContactFirstNamee = "Error";
                    oView.getModel("JMBPCreate").getData().altContactFirstNamem = oi18n.getProperty("BPCMaxLengthExceeds");;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().altContactFirstNamee == "Error") {
                        oView.getModel("JMBPCreate").getData().altContactFirstNamee = "None";
                        oView.getModel("JMBPCreate").getData().altContactFirstNamem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnChangeLastName1: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 34) {
                    oView.getModel("JMBPCreate").getData().altContactLastNamee = "Error";
                    oView.getModel("JMBPCreate").getData().altContactLastNamem = oi18n.getProperty("BPCMaxLengthExceeds");;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().altContactLastNamee == "Error") {
                        oView.getModel("JMBPCreate").getData().altContactLastNamee = "None";
                        oView.getModel("JMBPCreate").getData().altContactLastNamem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnChangeJobTitle1: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 4) {
                    oView.getModel("JMBPCreate").getData().altContactJobTitlee = "Error";
                    oView.getModel("JMBPCreate").getData().altContactJobTitlem = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().altContactJobTitlee == "Error") {
                        oView.getModel("JMBPCreate").getData().altContactJobTitlee = "None";
                        oView.getModel("JMBPCreate").getData().altContactJobTitlem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }

            },

            fnChangeContactNumber1: function (oEvent) {
                var vLength = oEvent.getParameter("value").length
                if (vLength > 30) {
                    oView.getModel("JMBPCreate").getData().altPhoneNumbere = "Error";
                    oView.getModel("JMBPCreate").getData().altPhoneNumberm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                }
                else {
                    if (oView.getModel("JMBPCreate").getData().altPhoneNumbere == "Error") {
                        oView.getModel("JMBPCreate").getData().altPhoneNumbere = "None";
                        oView.getModel("JMBPCreate").getData().altPhoneNumberm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }

            },
            fnChangeEmailID1: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                var email = oView.getModel("JMBPCreate").getData().altEmail;
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (!email.match(mailregex)) {
                    oView.getModel("JMBPCreate").getData().altEmaile = "Error";
                    oView.getModel("JMBPCreate").getData().altEmailm = oi18n.getProperty("BPCInvalidEmail");
                    oView.getModel("JMBPCreate").refresh();
                } else if (email.toUpperCase().includes("JABIL.COM")) {
                    oView.getModel("JMBPCreate").getData().altEmaile = "Error";
                    oView.getModel("JMBPCreate").getData().altEmailm = oi18n.getProperty("BPCInvalidEmail1");
                    oView.getModel("JMBPCreate").refresh();

                } else if (vLength > 241) {
                    oView.getModel("JMBPCreate").getData().altEmaile = "Error";
                    oView.getModel("JMBPCreate").getData().altEmailm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                }
                else {
                    oView.getModel("JMBPCreate").getData().altEmaile = "None";
                    oView.getModel("JMBPCreate").getData().altEmailm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (vLength == 0) {
                    oView.getModel("JMBPCreate").getData().altEmaile = "None";
                    oView.getModel("JMBPCreate").getData().altEmailm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeSuppClass: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 34) {
                    oView.getModel("JMBPCreate").getData().supplierTypeClassificationL1e = "Error";
                    oView.getModel("JMBPCreate").getData().supplierTypeClassificationL1m = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                }
                else {
                    if (oView.getModel("JMBPCreate").getData().supplierTypeClassificationL1e == "Error") {
                        oView.getModel("JMBPCreate").getData().supplierTypeClassificationL1e = "None";
                        oView.getModel("JMBPCreate").getData().supplierTypeClassificationL1m = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeSupplierCommodityCL2: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 34) {
                    oView.getModel("JMBPCreate").getData().supplierCommodityClassificationL2e = "Error";
                    oView.getModel("JMBPCreate").getData().supplierCommodityClassificationL2m = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                }
                else {
                    if (oView.getModel("JMBPCreate").getData().supplierCommodityClassificationL2e == "Error") {
                        oView.getModel("JMBPCreate").getData().supplierCommodityClassificationL2e = "None";
                        oView.getModel("JMBPCreate").getData().supplierCommodityClassificationL2m = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeCustomerDirectSupplierCustNmbr: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 100) {
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee = "Error";
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamem = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee == "Error") {
                        oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee = "None";
                        oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },

            fnLiveChangeCustomerDirectContact: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 100) {
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte = "Error";
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierContractm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte == "Error") {
                        oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte = "None";
                        oView.getModel("JMBPCreate").getData().customerDirectedSupplierContractm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnMandatoryFieldClear: function () {
                if (oView.getModel("JMBPCreate").getData().plantm == oi18n.getProperty("BPCMandatoryValidationPlant")) {
                    oView.getModel("JMBPCreate").getData().plante = "None";
                    oView.getModel("JMBPCreate").getData().plantm = "";
                    oView.getModel("JMBPCreate").refresh();
                }

                if (oView.getModel("JMBPCreate").getData().companyCodem == oi18n.getProperty("BPCCompCodeMandat")) {
                    oView.getModel("JMBPCreate").getData().companyCodee = "None";
                    oView.getModel("JMBPCreate").getData().companyCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().workCellm == oi18n.getProperty("BPCMandatoryValidationWorkCell")) {
                    oView.getModel("JMBPCreate").getData().workCelle = "None";
                    oView.getModel("JMBPCreate").getData().workCellm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().purchasingOrgm == oi18n.getProperty("BPCMandatoryValidationPOrg")) {
                    oView.getModel("JMBPCreate").getData().purchasingOrge = "None";
                    oView.getModel("JMBPCreate").getData().purchasingOrgm = "";
                    oView.getModel("JMBPCreate").refresh();
                }

                if (oView.getModel("JMBPCreate").getData().altContactFirstNamem == oi18n.getProperty("BPCMandatoryValidationAltFname")) {
                    oView.getModel("JMBPCreate").getData().altContactFirstNamee = "None";
                    oView.getModel("JMBPCreate").getData().altContactFirstNamem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().altContactLastNamem == oi18n.getProperty("BPCMandatoryValidationAltLastName")) {
                    oView.getModel("JMBPCreate").getData().altContactLastNamee = "None";
                    oView.getModel("JMBPCreate").getData().altContactLastNamem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().altContactJobTitlem == oi18n.getProperty("BPCMandatoryValidationJobTitle")) {
                    oView.getModel("JMBPCreate").getData().altContactJobTitlee = "None";
                    oView.getModel("JMBPCreate").getData().altContactJobTitlem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().altPhoneNumberm == oi18n.getProperty("BPCMandatoryValidationAltPhoneNum")) {
                    oView.getModel("JMBPCreate").getData().altPhoneNumbere = "None";
                    oView.getModel("JMBPCreate").getData().altPhoneNumberm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().altEmailm == oi18n.getProperty("PleaseProvideAltEmail")) {
                    oView.getModel("JMBPCreate").getData().altEmaile = "None";
                    oView.getModel("JMBPCreate").getData().altEmailm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().productm == oi18n.getProperty("BPCMandatoryValidationProduct")) {
                    oView.getModel("JMBPCreate").getData().producte = "None";
                    oView.getModel("JMBPCreate").getData().productm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().conflicte == "Error") {
                    oView.getModel("JMBPCreate").getData().conflicte = "None";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeIncotermLoc: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 34) {
                    oView.getModel("JMBPCreate").getData().incotermNameLocatione = "Error";
                    oView.getModel("JMBPCreate").getData().incotermNameLocationm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().incotermNameLocatione == "Error") {
                        oView.getModel("JMBPCreate").getData().incotermNameLocatione = "None";
                        oView.getModel("JMBPCreate").getData().incotermNameLocationm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeWorkCell: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (vSelected == false) {
                    oEvent.getSource().setValue("");
                }
                if (oView.getModel("JMBPCreate").getData().workCelle == "Error") {
                    oView.getModel("JMBPCreate").getData().workCelle = "None";
                    oView.getModel("JMBPCreate").getData().workCellm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeProduct: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 34) {
                    oView.getModel("JMBPCreate").getData().producte = "Error";
                    oView.getModel("JMBPCreate").getData().productm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().producte == "Error") {
                        oView.getModel("JMBPCreate").getData().producte = "None";
                        oView.getModel("JMBPCreate").getData().productm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }

            },
            fnConflictOfIntChnage: function (oEvent) {
                if (oView.getModel("JMBPCreate").getData().conflicte == "Error") {
                    oView.getModel("JMBPCreate").getData().conflicte = "None";
                    oView.getModel("JMBPCreate").refresh();
                }
            },



        });
    });

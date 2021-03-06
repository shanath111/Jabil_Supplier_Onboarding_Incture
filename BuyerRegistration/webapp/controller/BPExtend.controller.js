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
        var that, oView, oBusyDilog, oi18n;
        return Controller.extend("ns.BuyerRegistration.controller.BPExtend", {
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
            fnBuyerExtendRoute: function (oEvent) {
                var vContext = {
                    "Id": oEvent.getParameter("arguments").Id,
                    "Name": oEvent.getParameter("arguments").Name
                };

                that.fnSetConfigModel(vContext);
                that.fnLoadLookUpData();
                this.fnClearData();
            },
            fnSetConfigModel: function (oContext) {
                oView.getModel("oConfigMdl").getData().caseDeailVis = true;
                oView.getModel("oConfigMdl").getData().HeaderTxtVis = true;
                oView.getModel("oConfigMdl").getData().CompleteTaskVis = false;
                oView.getModel("oConfigMdl").getData().ExtentionTxtVis = true;
                oView.getModel("oConfigMdl").getData().SMETxtVis = false;


                if (oContext.Name == "Display") {
                    if (oContext.Id == "New") {
                        oView.getModel("oConfigMdl").getData().caseDeailVis = false;
                        this.fnScreenResize();
                        this.fnLoadPersonalizationData();
                        var oFCL = this.getView().byId("flexibleColumnLayout");
                        oFCL.setLayout(library.LayoutType.OneColumn);
                        oView.getModel("oConfigMdl").getData().screenEditable = true;
                        oView.getModel("oConfigMdl").getData().searchEnable = true;
                        oView.getModel("oConfigMdl").getData().createNewBtn = false;

                        oView.getModel("oConfigMdl").getData().searchEnableGBS = false;
                        oView.getModel("oConfigMdl").getData().ActnBtnEnable = true;
                        oView.getModel("oConfigMdl").getData().HeaderLinkTxt = oi18n.getProperty("VRVendorDetails");
                    } else {
                        oView.getModel("oConfigMdl").getData().closeFullScreenButton = false;
                        oView.getModel("oConfigMdl").getData().enterFullScreen = false;
                        oView.getModel("oConfigMdl").getData().exitFullScreen = false;
                        oView.getModel("oConfigMdl").getData().searchEnable = false;
                        oView.getModel("oConfigMdl").getData().searchEnableGBS = false;
                        oView.getModel("oConfigMdl").getData().createNewBtn = false;
                        oView.getModel("oConfigMdl").getData().screenEditable = false;
                        oView.getModel("oConfigMdl").getData().HeaderLinkTxt = oi18n.getProperty("VRVendorDetails2");
                        that.fnLoadCaseDetail(oContext.Id);//Load Case ID Details
                    }
                    oView.getModel("oConfigMdl").getData().toolBarVisible = true;
                } else {
                    oView.getModel("oConfigMdl").getData().closeFullScreenButton = false;
                    oView.getModel("oConfigMdl").getData().enterFullScreen = false;
                    oView.getModel("oConfigMdl").getData().exitFullScreen = false;
                    oView.getModel("oConfigMdl").getData().searchEnable = false;
                    oView.getModel("oConfigMdl").getData().searchEnableGBS = false;
                    oView.getModel("oConfigMdl").getData().createNewBtn = false;
                    oView.getModel("oConfigMdl").getData().screenEditable = true;
                    oView.getModel("oConfigMdl").getData().CompleteTaskVis = true;
                    oView.getModel("oConfigMdl").getData().ExtentionTxtVis = false;
                    oView.getModel("oConfigMdl").getData().SMETxtVis = true;
                    var oFCL = this.getView().byId("flexibleColumnLayout");
                    oFCL.setLayout(library.LayoutType.OneColumn);
                    this.fnSetGBSData(oContext.Id);//Load GBS Data
                    oView.getModel("oConfigMdl").getData().toolBarVisible = false;
                    oView.getModel("oConfigMdl").getData().HeaderLinkTxt = oi18n.getProperty("VRVendorDetails2");

                }

                oView.getModel("oConfigMdl").getData().contextPath = oContext;
                oView.getModel("oConfigMdl").refresh();
            },
            fnLoadCaseDetailSME: function (vCaseID) {
                var oModelFetch = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/case/findById/" + vCaseID
                oModelFetch.loadData(sUrl);
                oModelFetch.attachRequestCompleted(function onCompleted(oEvent) {
                    if (oEvent.getParameter("success")) {
                        var data = oEvent.getSource().getData();
                        var oCaseDetail = new sap.ui.model.json.JSONModel();
                        oCaseDetail.setData(data);
                        that.getView().setModel(oCaseDetail, "JMCaseDetail");

                        for (var i = 0; i < oView.getModel("oVendorListModel").getData().data.length; i++) {
                            if (oView.getModel("oVendorListModel").getData().data[i].BUSINESS_PARTNER_NUMBER == JSON.parse(oView.getModel("JMCaseDetail").getData().bpSearch.selectedSupplier).BUSINESS_PARTNER_NUMBER) {
                                oView.getModel("oVendorListModel").getData().data[i].isSelect = true;
                                oView.getModel("oVendorListModel").refresh();
                                break;
                            }
                        }
                    } else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                    }
                });

            },
            fnSetGBSData: function (vTaskID) {
                oBusyDilog.open();
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskContext/" + vTaskID
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {

                        var oJsonTaskContext = new sap.ui.model.json.JSONModel();
                        oJsonTaskContext.setData(oEvent.getSource().getData());
                        if (oEvent.getSource().getData().smeEmail) {
                            oEvent.getSource().getData().smeEmail = oEvent.getSource().getData().smeEmail.split("@")[0].split("_").join(" ");
                        }
                        oView.setModel(oJsonTaskContext, "JMTaskContext")

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
                            that.fnLoadCaseDetailSME(that.caseId);
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
            fnPopulateGBSData: function (vTaskId) {
                oBusyDilog.open();
                var oModelTask = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskContext/" + vTaskId
                oModelTask.loadData(sUrl);
                oModelTask.attachRequestCompleted(function onCompleted(oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {

                        var oModelLdData = new JSONModel();
                        var sUrl = "/nsBuyerRegistration/plcm_portal_services/case/findById/" + oEvent.getSource().getData().caseId
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
                                    "bpNumber": data.caseId,
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
                                    "mobileCountryCode": data.bpRequestScope.bpRequestScopeAddlDetails.mobileCountryCode,
                                    "altContactCountryCode": data.bpRequestScope.bpRequestScopeAddlDetails.altContactCountryCode,
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
                                    "isExclCiscoGhub": data.bpRequestScope.bpRequestScopeAddlDetails.isExclCiscoGhub,

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
                                    "requestorCOIEmail": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIEmail,
                                    "requestorCOIName": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIName,
                                    "requestorCOIPhoneNumber": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIPhoneNumber,
                                    "requestorCOIReason": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIReason
                                };
                                if (temp.conflictOfInterest == true) {
                                    temp.conflictOfInterests = 1;
                                    temp.CoIFields = true;
                                } else {
                                    temp.conflictOfInterests = 0;
                                    temp.CoIFields = false;
                                }
                                if (temp.requestorConflictOfInterest == true) {
                                    temp.requestorConflictOfInterests = 1;
                                    temp.reqCoIFields = true;
                                } else if (temp.requestorConflictOfInterest == false) {
                                    temp.reqCoIFields = false;
                                    temp.requestorConflictOfInterests = 0;
                                } else {
                                    temp.reqCoIFields = false;
                                    temp.requestorConflictOfInterests = -1;
                                }
                                if (temp.isExclCiscoGhub == true) {
                                    temp.isExclCiscoGhub = 0;

                                } else {
                                    temp.isExclCiscoGhub = 1;

                                }

                                if (temp.representAnotherCompany == true) {
                                    temp.representAnotherCompanys = 0;
                                } else {
                                    temp.representAnotherCompanys = 1;
                                }
                                if (temp.oneTimePurchaseSupplierIndicator == true) {
                                    temp.oneTimePurchaseSupplierIndicators = 0;
                                } else {
                                    temp.oneTimePurchaseSupplierIndicators = 1;
                                }
                                if (temp.customerDirectedSupplierIndicator == true) {
                                    temp.customerDirectedSupplierIndicatorsMan = true;
                                    temp.customerDirectedSupplierIndicators = 0;
                                } else {
                                    temp.customerDirectedSupplierIndicatorsMan = false;
                                    temp.customerDirectedSupplierIndicators = 1;
                                }
                                if (temp.outsideProcessiongSupplierIndicator == true) {
                                    temp.outsideProcessiongSupplierIndicators = 0;
                                } else {
                                    temp.outsideProcessiongSupplierIndicators = 1;
                                }
                                if (temp.manualAddressOverrideSupplierIndicator == true) {
                                    temp.manualAddressOverrideSupplierIndicators = 0;
                                } else {
                                    temp.manualAddressOverrideSupplierIndicators = 1;
                                }

                                var oBPCreateModel = new sap.ui.model.json.JSONModel();
                                oBPCreateModel.setData(temp);
                                oView.setModel(oBPCreateModel, "JMBPCreate");
                                //   that.fnLoadWorkCell(true);
                                that.fnLoadIncoterms(true);
                                that.fnLoadCountry(true);
                                that.fnLoadState(temp.country);
                                that.fnLoadPurOrg(temp.companyCode);
                                that.fnLoadPayemntTerms(true);


                                if (oView.getModel("oConfigMdl").getData().contextPath.Name == "Display") {
                                    if (temp.status == "Draft") {
                                        oView.getModel("oConfigMdl").getData().screenEditable = true;
                                    } else {
                                        oView.getModel("oConfigMdl").getData().screenEditable = false;
                                    }
                                } else {
                                    oView.getModel("oConfigMdl").getData().screenEditable = true;
                                }
                                oView.getModel("oConfigMdl").refresh();


                            } else {
                                var sErMsg = oEvent.getParameter("errorobject").responseText;
                                MessageBox.show(sErMsg, {
                                    icon: MessageBox.Icon.ERROR,
                                    title: "Error"
                                });
                            }
                        });

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

            fnScreenResize: function () {
                setTimeout(function () {
                    var vTableHeight;
                    vTableHeight = that.getView().byId("id_FilterHeight").getDomRef().offsetHeight - that.getView().byId("id_FilterPanel").getDomRef()
                        .offsetHeight;
                    vTableHeight = vTableHeight - that.getView().byId("id_FilterPanel0").getDomRef()
                        .offsetHeight;
                    //   vTableHeight = vTableHeight - 40;
                    vTableHeight = vTableHeight - 120;
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



            fnLoadLookUpData: function () {
                oView.getModel("oBPLookUpMdl").setData([]);
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);
                oView.getModel("oBPLookUpMdl").refresh();
                this.fnLoadCompanyCode();
                this.fnLoadPlant();
                //   this.fnLoadPurOrg();
                this.fnLoadPurGroup();

                that.fnLoadPayemntTerms();
                that.fnLoadWorkCell();
                that.fnLoadIncoterms();
                that.fnLoadCountry();
                that.fnLoadBlockFunction();
                that.fnLoadCountryCode();

            },
            fnLoadCountryCode: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/contactCode";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/countryContactCode", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();

                    }
                });
            },
            fnLoadPayemntTerms: function (vBind) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/payment-terms";
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
            fnLoadPurGroup: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/purchasing-groups";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/PurchasingGroup", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });

            },
            fnLoadWorkCell: function (vBind) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/workcell-list";
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
            fnLoadCompanyCode: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/api/v1/reference-data/company-codes";
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
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/plants";
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
            fnLoadPurOrg: function (vCompCode, vDescription) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/api/v1/reference-data/purchasingOrg/" + vCompCode;
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
            fnLoadIncoterms: function (vBind) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/incoterms";
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
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/regions/?country=" + vCountry;
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
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/countries";
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
            fnLiveChangeSuppLang: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().supplierLanguagee == "Error") {
                    oView.getModel("JMBPCreate").getData().supplierLanguagee = "None";
                    oView.getModel("JMBPCreate").getData().supplierLanguagem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },


            fnLoadCaseDetail: function (vCaseId) {
                oBusyDilog.open();
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/case/findById/" + vCaseId
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {
                        var data = oEvent.getSource().getData();
                        var temp;
                        var oFCL = that.getView().byId("flexibleColumnLayout");
                        oFCL.setLayout(library.LayoutType.MidColumnFullScreen);
                        if (data) {
                            if (data.bpRequestScope.isDuplicatesFound == true) {
                                var oFCL = that.getView().byId("flexibleColumnLayout");
                                oFCL.setLayout(library.LayoutType.OneColumn);
                                oView.getModel("oConfigMdl").getData().searchEnable = false;
                                oView.getModel("oConfigMdl").getData().searchEnableGBS = false;
                                oView.getModel("oConfigMdl").refresh();

                                var oJosnMdl = new sap.ui.model.json.JSONModel();
                                oJosnMdl.setData(JSON.parse(data.bpSearch.searchCriteria));
                                oView.setModel(oJosnMdl, "JMSearchFilter");
                                var aTempData = [];
                                that.caseId = vCaseId;
                                var aFilter = JSON.parse(data.bpSearch.searchCriteria);
                                that.fnLoadPartnerData("Display", aFilter, JSON.parse(data.bpSearch.selectedResults));
                                var oBPCreateModel = new sap.ui.model.json.JSONModel();
                                oBPCreateModel.setData(temp);
                                oView.setModel(oBPCreateModel, "JMBPCreate");

                            } else {
                                temp = {
                                    "bpNumber": data.bpNumber,
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
                                    "buyerName": data.bpRequestScope.buyerName,
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
                                    "mobileCountryCode": data.bpRequestScope.bpRequestScopeAddlDetails.mobileCountryCode,
                                    "altContactCountryCode": data.bpRequestScope.bpRequestScopeAddlDetails.altContactCountryCode,
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
                                    "newPaymentMethod": data.bpRequestScope.bpRequestScopeAddlDetails.newPaymentMethod,
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
                                    "isExclCiscoGhub": data.bpRequestScope.bpRequestScopeAddlDetails.isExclCiscoGhub,
                                    "contactMobilePhone": data.bpRequestScope.bpRequestScopeAddlDetails.contactMobilePhone,
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
                                    "requestorCOIEmail": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIEmail,
                                    "requestorCOIName": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIName,
                                    "requestorCOIPhoneNumber": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIPhoneNumber,
                                    "requestorCOIReason": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIReason,
                                    "addlSurveyForSupplier": data.bpRequestScope.bpRequestScopeAddlDetails.addlSurveyForSupplier,
                                    "bpSearch": data.bpSearch,
                                    "materialGroup": data.bpRequestScope.materialGroup,
                                    "supplierLanguage": data.bpRequestScope.bpRequestScopeAddlDetails.supplierLanguage
                                };
                                if (temp.conflictOfInterest == true) {
                                    temp.conflictOfInterests = 1;
                                    temp.CoIFields = true;
                                } else if (temp.conflictOfInterest == false) {
                                    temp.conflictOfInterests = 0;
                                    temp.CoIFields = false;
                                } else {
                                    temp.conflictOfInterests = -1;
                                    temp.CoIFields = false;
                                }
                                if (temp.requestorConflictOfInterest == true) {
                                    temp.requestorConflictOfInterests = 1;
                                    temp.reqCoIFields = true;
                                } else if (temp.requestorConflictOfInterest == false) {
                                    temp.reqCoIFields = false;
                                    temp.requestorConflictOfInterests = 0;
                                } else {
                                    temp.reqCoIFields = false;
                                    temp.requestorConflictOfInterests = -1;
                                }

                                if (temp.isExclCiscoGhub == true) {
                                    temp.isExclCiscoGhub = 0;
                                } else if (temp.isExclCiscoGhub == false) {
                                    temp.isExclCiscoGhub = 1;
                                } else {
                                    temp.isExclCiscoGhub = -1;
                                }
                                if (temp.addlSurveyForSupplier == true) {
                                    temp.addlSurveyForSuppliers = 0;
                                    temp.buyerAttachmentVis = true;
                                    that._fnReadDocumentList1(temp.caseId, that);
                                } else {
                                    temp.buyerAttachmentVis = false;
                                    temp.addlSurveyForSuppliers = 1;
                                }
                                if (temp.representAnotherCompany == true) {
                                    temp.representAnotherCompanys = 0;
                                } else {
                                    temp.representAnotherCompanys = 1;
                                }
                                if (temp.oneTimePurchaseSupplierIndicator == true) {
                                    temp.oneTimePurchaseSupplierIndicators = 0;
                                } else if (temp.oneTimePurchaseSupplierIndicator == false) {
                                    temp.oneTimePurchaseSupplierIndicators = 1;
                                } else {
                                    temp.oneTimePurchaseSupplierIndicators = -1;
                                }
                                if (temp.customerDirectedSupplierIndicator == true) {
                                    temp.customerDirectedSupplierIndicatorsMan = true;
                                    temp.customerDirectedSupplierIndicators = 0;
                                } else if (temp.customerDirectedSupplierIndicator == false) {
                                    temp.customerDirectedSupplierIndicatorsMan = false;
                                    temp.customerDirectedSupplierIndicators = 1;
                                } else {
                                    temp.customerDirectedSupplierIndicatorsMan = false;
                                    temp.customerDirectedSupplierIndicators = -1;
                                }
                                if (temp.outsideProcessiongSupplierIndicator == true) {
                                    temp.outsideProcessiongSupplierIndicators = 0;
                                } else {
                                    temp.outsideProcessiongSupplierIndicators = 1;
                                }
                                if (temp.manualAddressOverrideSupplierIndicator == true) {
                                    temp.manualAddressOverrideSupplierIndicators = 0;
                                } else {
                                    temp.manualAddressOverrideSupplierIndicators = 1;
                                }

                                var oBPCreateModel = new sap.ui.model.json.JSONModel();
                                oBPCreateModel.setData(temp);
                                oView.setModel(oBPCreateModel, "JMBPCreate");
                                //   that.fnLoadWorkCell(true);
                                that.fnLoadIncoterms(true);
                                that.fnLoadCountry(true);
                                that.fnLoadState(temp.country);
                                that.fnLoadPaymentMethod(temp.companyCode, temp.purchasingOrg);
                                that.fnLoadPurOrg(temp.companyCode, that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, temp.companyCode, "CompanyCode"));
                                that.fnLoadPayemntTerms(true);
                                if (oView.getModel("JMBPCreate").getData().plant == "CN30" || oView.getModel("JMBPCreate").getData().plant == "CN81") {
                                    oView.getModel("JMBPCreate").getData().materialGroupVis = true;
                                    var vMTData = oView.getModel("oStaticData").getData().wuxi;
                                    var aData = [];
                                    for (var i = 0; i < vMTData.length; i++) {
                                        if (vMTData[i].plant == oView.getModel("JMBPCreate").getData().plant) {
                                            aData.push(vMTData[i]);
                                        }
                                    }
                                    oView.getModel("oBPLookUpMdl").setProperty("/materialGroup", aData);
                                    oView.getModel("oBPLookUpMdl").refresh();
                                } else {
                                    oView.getModel("JMBPCreate").getData().materialGroupVis = false;
                                    oView.getModel("JMBPCreate").refresh();
                                }

                                if (oView.getModel("oConfigMdl").getData().contextPath.Name == "Display") {
                                    if (temp.status == "Draft") {
                                        oView.getModel("oConfigMdl").getData().screenEditable = true;
                                    } else {
                                        oView.getModel("oConfigMdl").getData().screenEditable = false;
                                    }
                                } else {
                                    oView.getModel("oConfigMdl").getData().screenEditable = true;
                                }
                                if (that.getOwnerComponent().getComponentData()) {
                                    if (that.getOwnerComponent().getComponentData().startupParameters.caseId) {
                                        var vEnb = that.getOwnerComponent().getComponentData().startupParameters.Enb[0];
                                        if (vEnb == "false") {
                                            oView.getModel("oConfigMdl").getData().screenEditable = false;

                                        }
                                    }
                                }
                                oView.getModel("oConfigMdl").refresh();
                            }
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

            fnClearData: function () {

                var temp = {
                    "accountingGroup": "ZVEN",
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
                    "purchaingOrgBlock": "",
                    "purchasingOrg": "",
                    "purchasingOrgDelFlag": "",
                    "street": "",
                    "vendorName": "",
                    "vendorNumber": "",
                    "search": ""

                };
                var oJosnMdl = new sap.ui.model.json.JSONModel();
                oJosnMdl.setData(temp);
                oView.setModel(oJosnMdl, "JMSearchFilter");
                that.getView().getModel("oAttachmentList").setProperty("/buyerAttachment", []);
                that.getView().getModel("oAttachmentList").refresh();

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

                this.getView().byId("id_FilterPanel").setExpanded(true);
                oView.byId("id_SearchResultTb").clearSelection(true);
                oView.getModel("oConfigMdl").getData().searchEnableGBS = false;
                oView.getModel("oConfigMdl").refresh();
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

            fnLiveChangeMaterialGroup: function () {
                if (oView.getModel("JMBPCreate").getData().materialGroupe == "Error") {
                    oView.getModel("JMBPCreate").getData().materialGroupe = "None";
                    oView.getModel("JMBPCreate").getData().materialGroupm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnCaseListPressNav: function (oEvent) {

                if (oView.getModel("oConfigMdl").getData().contextPath.Id == "New" || oView.getModel("oConfigMdl").getData().contextPath.Name == "BuyerApproveExtention") {

                    var temp = oView.getModel("oVendorListModel").getData().data[oEvent.getSource().getSelectedIndex()];
                    if (temp.COMPANY_CODE && temp.PURCHASING_ORG) {
                        this.fnLoadPaymentMethod(temp.COMPANY_CODE, temp.PURCHASING_ORG);

                    }
                    if (temp.isError == true) {
                        var oBPCreateModel = new sap.ui.model.json.JSONModel();
                        oBPCreateModel.setData([]);
                        oView.setModel(oBPCreateModel, "JMBPCreate");
                        var sErMsg = oi18n.getProperty("ExtentionNotAllowed");
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                        this.getView().byId("id_FilterPanel").setExpanded(true);
                        var oFCL = this.getView().byId("flexibleColumnLayout");
                        oFCL.setLayout(library.LayoutType.OneColumn);
                        return;

                    } else {


                        var vBankValid = false;
                        if (temp.PAYMENT_METHOD !== "C" && temp.PAYMENT_METHOD !== "J") {
                            var vMessage = "";
                            var requestData = {
                                "companyCodeCountry": temp.COMPANY_CODE,
                                "purchaseOrderCurrency": temp.CURRENCY,
                                "supplierBankCountry": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().Country, temp.COUNTRY, "Country"),
                            }
                            var sUrl = "/nsBuyerRegistration/plcm_portal_services/api/v1/bank/matrix";
                            var bModel = new JSONModel();
                            $.ajax({
                                type: "POST",
                                url: sUrl,
                                data: JSON.stringify(requestData),
                                dataType: "json",
                                async: false,
                                contentType: 'application/json; charset=utf-8',
                                success: function (data) {
                                    if (data.bankCountry == "Mandatory") {
                                        if (!temp.BANK_COUNTRY) {
                                            vBankValid = true;
                                            vMessage = "Bank Country is Required \n"
                                        }

                                    }
                                    if (data.iban == "Mandatory") {
                                        if (!temp.IBAN) {
                                            vBankValid = true;
                                            vMessage = vMessage + " IBAN is Required"
                                        }

                                    }

                                },

                                error: function (data) {
                                    vMessage = data.getParameter("errorobject").responseText;
                                    vBankValid = true;

                                }
                            });
                        }


                        if (vBankValid == true) {
                            vMessage = oi18n.getProperty("ErrorOnBank");
                            MessageBox.show(vMessage, {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });
                            return;
                        }



                    }
                    if (temp.ACCOUNT_GROUP !== "ZVEN") {
                        var oBPCreateModel = new sap.ui.model.json.JSONModel();
                        oBPCreateModel.setData([]);
                        oView.setModel(oBPCreateModel, "JMBPCreate");
                        var sErMsg = oi18n.getProperty("PartnerFunctionExtentionNotAllowed") + " " + temp.ACCOUNT_GROUP;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                        this.getView().byId("id_FilterPanel").setExpanded(true);
                        var oFCL = this.getView().byId("flexibleColumnLayout");
                        oFCL.setLayout(library.LayoutType.OneColumn);
                        return;

                    }

                    if (temp) {
                        var vBuyer = "";
                        if (oView.getModel("oConfigMdl").getData().usrData) {
                            vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;

                        }
                        var vMatGrpVis = false;
                        if (temp.plant == "CN30" || temp.plant == "CN81") {
                            vMatGrpVis = true;

                        }
                        var temp1 = {
                            "bpNumber": temp.BUSINESS_PARTNER_NUMBER,
                            "supplier": "",
                            "caseId": "",
                            "companyCode": temp.COMPANY_CODE,
                            "purchasingOrg": temp.PURCHASING_ORG,
                            "plant": temp.PLANT,
                            "corporationName": temp.VENDOR_NAME,
                            // "workCelld": that.fnFetchDescriptionWorkCell(oView.getModel("oBPLookUpMdl").getData().WorkCell, "", "WorkCell"),
                            "workCell": "",
                            "buyerName": vBuyer,
                            "userCreated": vBuyer,
                            "incoTermsd": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().Incoterms, temp.INCO_TERMS, "Incoterms"),
                            "incoTerms": temp.INCO_TERMS,
                            "newincoTerms": "",
                            "additionalInformation": "",
                            "firstName": "",
                            "lastName": "",
                            "jobTitle": "",
                            "email": "",
                            //"contactNumber": temp.PRIMARY_PHONE_NUMBER,
                            "address1": temp.STREET,
                            "address2": "",
                            "city": temp.CITY,
                            //  "state": ,
                            "district": "",
                            "stated": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().State, temp.REGION_STATE_PROVINCE, "Region"),
                            "state": temp.REGION_STATE_PROVINCE,
                            "postalCode": temp.POSTAL_CODE,
                            "countryd": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().Country, temp.COUNTRY, "Country"),
                            "country": temp.COUNTRY,
                            "telephone": "",
                            "fax": "",
                            "poBoxPostalCode": "",
                            "rfc": "",
                            "supplierUrlCompanyWebsite": "",
                            "representAnotherCompany": true,

                            "paymentTermsd": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PaymentTerms, temp.PAYMENT_TERMS, "PaymentTerms"),
                            "paymentTerms": temp.PAYMENT_TERMS,
                            "newpaymentTerms": "",
                            "currency": temp.CURRENCY,
                            "dunsNumber": temp.DUNS,

                            "incotermNameLocation": temp.INCOTERMS2,
                            "paymentMethod": temp.PAYMENT_METHOD,
                            "newPaymentMethod": "",
                            "newincotermNameLocation": "",
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
                            "conflictOfInterests": -1,
                            "isExclCiscoGhub": -1,

                            "representAnotherCompanys": 1,
                            "oneTimePurchaseSupplierIndicators": 1,
                            "customerDirectedSupplierIndicators": -1,
                            "outsideProcessiongSupplierIndicators": 1,
                            "manualAddressOverrideSupplierIndicators": 1,
                            "requestorConflictOfInterests": -1,
                            "reqCoIFields": false,
                            "CoIFields": false,
                            "buyerAttachmentVis": false,
                            "addlSurveyForSuppliers": 1,
                            "materialGroupVis": vMatGrpVis,
                            "materialGroup": "",
                            "supplierLanguage":"en",

                            "bpSearch": {
                                "selectedSupplier": JSON.stringify(temp)
                            }
                        };

                        if (oView.getModel("oConfigMdl").getData().contextPath.Name == "BuyerApproveExtention") {
                            temp1.caseId = oView.getModel("JMCaseDetail").getData().caseId;
                            temp1.status = oView.getModel("JMCaseDetail").getData().status;
                            temp1.bpSearch = oView.getModel("JMCaseDetail").getData().bpSearch;
                            temp1.bpSearch.selectedSupplier = JSON.stringify(temp);
                            temp1.userCreated = oView.getModel("JMCaseDetail").getData().userCreated;
                            temp1.dateCreated = oView.getModel("JMCaseDetail").getData().dateCreated;
                            temp1.userUpdated = oView.getModel("JMCaseDetail").getData().userUpdated;
                            temp1.scopeId = oView.getModel("JMCaseDetail").getData().bpRequestScope.scopeId;
                            temp1.addlScopeId = oView.getModel("JMCaseDetail").getData().bpRequestScope.bpRequestScopeAddlDetails.addlScopeId;
                        }


                        var oBPCreateModel = new sap.ui.model.json.JSONModel();
                        oBPCreateModel.setData(temp1);
                        oView.setModel(oBPCreateModel, "JMBPCreate");
                        that.fnLoadPurOrg(temp1.companyCode, that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, temp1.companyCode, "CompanyCode"));

                        that.fnLoadState(temp1.country);

                        that.getView().getModel("oAttachmentList").setProperty("/buyerAttachment", []);
                        that.getView().getModel("oAttachmentList").refresh();


                    }





                    //  this.getView().byId("id_foter").setVisible(true);
                    this.getView().byId("id_FilterPanel").setExpanded(false);
                    var oFCL = this.getView().byId("flexibleColumnLayout");
                    oFCL.setLayout(library.LayoutType.TwoColumnsMidExpanded);
                    oView.getModel("oConfigMdl").getData().closeFullScreenButton = true;
                    oView.getModel("oConfigMdl").getData().enterFullScreen = true;
                    oView.getModel("oConfigMdl").getData().exitFullScreen = false;
                    oView.getModel("oConfigMdl").refresh();
                }

            },
            fnLoadPaymentMethod: function (vCompCode, vPOrg) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/paymentMethod/" + vCompCode + "/" + vPOrg;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/PaymentMethod", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }

                    if (!oView.getModel("JMBPCreate").getData().newPaymentMethod) {
                        var aArray = oView.getModel("oBPLookUpMdl").getData().PaymentMethod;
                        var value = oView.getModel("JMBPCreate").getData().paymentMethod;
                        if (aArray) {
                            if (value) {
                                var vMessage;
                                for (var i = 0; i < value.length; i++) {
                                    var item = aArray.find(item => item.code == value[i]);
                                    if (!item) {
                                        if (!vMessage) {
                                            vMessage = "The current Payment Method " + value[i];
                                        } else {
                                            vMessage = vMessage + ', ' + value[i];
                                        }

                                    }
                                }

                            }
                            if (vMessage) {
                                vMessage = vMessage + " is not available for the new Site. Please select a New Payment Method";
                                oView.getModel("JMBPCreate").getData().newPaymentMethode = "Error";
                                oView.getModel("JMBPCreate").getData().newPaymentMethodm = vMessage;
                                oView.getModel("JMBPCreate").refresh();
                                // vError = true;
                                sap.m.MessageBox.alert(vMessage, {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                    contentWidth: "30%",
                                    styleClass: "sapUiSizeCompact"
                                });

                            }

                        }
                    }
                });

            },
            fnCloseMessage: function () {
                this.oBPSuccess.close();
            },
            fnDoneSubmit: function () {
                window.history.go(-1);
            },
            fnSaveContinue: function () {
                this.oBPSuccessDraft.close();
                that.fnLoadCaseDetail(oView.getModel("JMBPCreate").getData().caseId);//Load Case ID Details
            },
            fnCloseTask: function () {
                oBusyDilog.open();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskComplete"
                var oPayload = {
                    "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                    "bpNumber": "",
                    "context": {
                        "buyerActionOnExtension": "close"
                    }

                }
                var oModelWf = new JSONModel();

                oModelWf.loadData(sUrl, JSON.stringify(
                    oPayload
                ), true, "POST", false, true, {
                    "Content-Type": "application/json"
                });
                oModelWf.attachRequestCompleted(function (oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {
                        var temp = {
                            "Message": "",
                            "caseId": that.caseId
                        }
                        temp.Message = oi18n.getProperty("Task Canceled Successfully");
                        var oJosnMessage = new sap.ui.model.json.JSONModel();
                        oJosnMessage.setData(temp);
                        oView.setModel(oJosnMessage,
                            "JMMessageData");
                        if (!that.oBPSuccess) {
                            that.oBPSuccess = sap.ui.xmlfragment(
                                "ns.BuyerRegistration.fragments.CreateSuccess", that);
                            oView.addDependent(that.oBPSuccess);
                        }
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



            },
            fnCancelAction: function () {
                if (oView.getModel("oConfigMdl").getData().contextPath.Name == "BuyerApproveExtention") {
                    oBusyDilog.open();
                    var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskComplete"
                    var oPayload = {
                        "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                        "bpNumber": ""
                    }
                    var oModelWf = new JSONModel();

                    oModelWf.loadData(sUrl, JSON.stringify(
                        oPayload
                    ), true, "POST", false, true, {
                        "Content-Type": "application/json"
                    });
                    oModelWf.attachRequestCompleted(function (oEvent) {
                        oBusyDilog.close();
                        if (oEvent.getParameter("success")) {
                            var temp = {
                                "Message": "",
                                "caseId": that.caseId
                            }
                            temp.Message = oi18n.getProperty("Task Canceled Successfully");
                            var oJosnMessage = new sap.ui.model.json.JSONModel();
                            oJosnMessage.setData(temp);
                            oView.setModel(oJosnMessage,
                                "JMMessageData");
                            if (!that.oBPSuccess) {
                                that.oBPSuccess = sap.ui.xmlfragment(
                                    "ns.BuyerRegistration.fragments.CreateSuccess", that);
                                oView.addDependent(that.oBPSuccess);
                            }
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









                } else {
                    window.history.go(-1);
                }

            },
            fnCreateBP: function () {
                this.fnMandatoryFieldClear();
                this.fnSubmitBP("SD");
            },
            fnCreateBPWF: function () {
                this.fnSubmitBP("SU");
            },
            fnChangeReqCOI: function () {
                oView.getModel("JMBPCreate").getData().requestorConflictOfInterestse = "None";
                if (oView.getModel("JMBPCreate").getData().requestorConflictOfInterests == 1) {
                    oView.getModel("JMBPCreate").getData().reqCoIFields = true;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    oView.getModel("JMBPCreate").getData().reqCoIFields = false;
                    oView.getModel("JMBPCreate").refresh();
                    if (!oView.getModel("JMBPCreate").getData().caseId) {


                    }
                }

                oView.getModel("JMBPCreate").getData().requestorCOIName = "";
                oView.getModel("JMBPCreate").getData().requestorCOIEmail = "";

                oView.getModel("JMBPCreate").refresh();
                if (oView.getModel("JMBPCreate").getData().requestorCOIEmailm == oi18n.getProperty("PleaseProvideAltEmail")) {
                    oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "None";
                    oView.getModel("JMBPCreate").getData().requestorCOIEmailm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().requestorCOINamem == oi18n.getProperty("BPCMandatoryValidationAltFname")) {
                    oView.getModel("JMBPCreate").getData().requestorCOINamee = "None";
                    oView.getModel("JMBPCreate").getData().requestorCOINamem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumberm == oi18n.getProperty("BPCMandatoryValidationAltPhoneNum")) {
                    oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumbere = "None";
                    oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumberm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                oView.getModel("JMBPCreate").refresh();
            },

            fnLivePaymentMethodChange: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().newPaymentMethode == "Error") {
                    oView.getModel("JMBPCreate").getData().newPaymentMethode = "None";
                    oView.getModel("JMBPCreate").getData().newPaymentMethodm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLivePaymentMethodFinish: function (oEvent) {
                if (oEvent.getSource().getSelectedKeys().length !== 0) {
                    oView.getModel("JMBPCreate").getData().newPaymentMethod = "";
                    // if(oEvent.getSource().getSelectedKeys().length == 1){
                    //     oView.getModel("JMBPCreate").getData().newPaymentMethod =    oEvent.getSource().getSelectedKeys()[0];
                    // }else{
                        for (var i = 0; i < oEvent.getSource().getSelectedKeys().length; i++) {
                            // if(!oView.getModel("JMBPCreate").getData().newPaymentMethod){
                            //     oView.getModel("JMBPCreate").getData().newPaymentMethod = oEvent.getSource().getSelectedKeys()[i];
                            // }else{
                            //     oView.getModel("JMBPCreate").getData().newPaymentMethod = oView.getModel("JMBPCreate").getData().newPaymentMethod +","+ oEvent.getSource().getSelectedKeys()[i];
                            // }
                           
                        //}
                        oView.getModel("JMBPCreate").getData().newPaymentMethod = oView.getModel("JMBPCreate").getData().newPaymentMethod + oEvent.getSource().getSelectedKeys()[i];
                    }
                   
                } else {
                    oView.getModel("JMBPCreate").getData().newPaymentMethod = "";
                }
                oView.getModel("JMBPCreate").refresh();

            },

            fnSubmitBP: function (vBtnActn) {
                var vIsNew = false;
                var vError = false;
                if (vBtnActn == "SU") {
                    if (!oView.getModel("JMBPCreate").getData().companyCode) {
                        oView.getModel("JMBPCreate").getData().companyCodee = "Error";
                        oView.getModel("JMBPCreate").getData().companyCodem = oi18n.getProperty("BPCCompCodeMandat");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }

                    if (oView.getModel("JMBPCreate").getData().conflictOfInterests == -1) {
                        oView.getModel("JMBPCreate").getData().conflicte = "Error";
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }
                    if (oView.getModel("JMBPCreate").getData().oneTimePurchaseSupplierIndicators == -1) {
                        oView.getModel("JMBPCreate").getData().oneTimePurchaseSupplierIndicatorse = "Error";
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }
                    // if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicators == -1) {
                    //     oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicatorse = "Error";
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // }
                    // if (oView.getModel("JMBPCreate").getData().isExclCiscoGhub == -1) {
                    //     oView.getModel("JMBPCreate").getData().isExclCiscoGhube = "Error";
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // }
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
                    // if (!oView.getModel("JMBPCreate").getData().workCell) {
                    //     oView.getModel("JMBPCreate").getData().workCelle = "Error";
                    //     oView.getModel("JMBPCreate").getData().workCellm = oi18n.getProperty("BPCMandatoryValidationWorkCell");
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // }
                    if (!oView.getModel("JMBPCreate").getData().firstName) {
                        oView.getModel("JMBPCreate").getData().firstNamee = "Error";
                        oView.getModel("JMBPCreate").getData().firstNamem = oi18n.getProperty("BPCMandatoryValidationFName");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    } else if (oView.getModel("JMBPCreate").getData().firstNamee == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().lastName) {
                        oView.getModel("JMBPCreate").getData().lastNamee = "Error";
                        oView.getModel("JMBPCreate").getData().lastNamem = oi18n.getProperty("BPCMandatoryValidationLastName");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    } else if (oView.getModel("JMBPCreate").getData().lastNamee == "Error") {
                        vError = true;
                    }

                    if (!oView.getModel("JMBPCreate").getData().email) {
                        oView.getModel("JMBPCreate").getData().emaile = "Error";
                        oView.getModel("JMBPCreate").getData().emailm = oi18n.getProperty("PleaseProvideEmail");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    } else if (oView.getModel("JMBPCreate").getData().emaile == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().telephone) {
                        oView.getModel("JMBPCreate").getData().telephonee = "Error";
                        oView.getModel("JMBPCreate").getData().telephonem = oi18n.getProperty("BPCMandatoryValidationTeplephone");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    } else if (oView.getModel("JMBPCreate").getData().telephonee == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().contactMobilePhone) {
                        oView.getModel("JMBPCreate").getData().contactMobilePhonee = "Error";
                        oView.getModel("JMBPCreate").getData().contactMobilePhonem = oi18n.getProperty("BPCMandatoryValidationTeplephoneMob");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    } else if (oView.getModel("JMBPCreate").getData().contactMobilePhonee == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().contactCountryCode) {
                        oView.getModel("JMBPCreate").getData().contactCountryCodee = "Error";
                        oView.getModel("JMBPCreate").getData().contactCountryCodem = oi18n.getProperty("BPCEnterCountryCode");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().supplierLanguage) {
                        oView.getModel("JMBPCreate").getData().supplierLanguagee = "Error";
                        oView.getModel("JMBPCreate").getData().supplierLanguagem = oi18n.getProperty("BPCMandatoryLanguage");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }
                    if (!oView.getModel("JMBPCreate").getData().mobileCountryCode) {
                        oView.getModel("JMBPCreate").getData().mobileCountryCodee = "Error";
                        oView.getModel("JMBPCreate").getData().mobileCountryCodem = oi18n.getProperty("BPCEnterCountryCode");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    }

                    if (oView.getModel("JMBPCreate").getData().paymentMethod) {

                        if (!oView.getModel("JMBPCreate").getData().newPaymentMethod) {
                            var aArray = oView.getModel("oBPLookUpMdl").getData().PaymentMethod;
                            var value = oView.getModel("JMBPCreate").getData().paymentMethod;
                            if (aArray) {
                                if (value) {
                                    var vMessage;
                                    for (var i = 0; i < value.length; i++) {
                                        var item = aArray.find(item => item.code == value[i]);
                                        if (!item) {
                                            if (!vMessage) {
                                                vMessage = "The current Payment Method " + value[i];
                                            } else {
                                                vMessage = vMessage + ', ' + value[i];
                                            }

                                        }
                                    }

                                }
                                if (vMessage) {
                                    vMessage = vMessage + " is not available for the new Site. Please select a New Payment Method";
                                    oView.getModel("JMBPCreate").getData().newPaymentMethode = "Error";
                                    oView.getModel("JMBPCreate").getData().newPaymentMethodm = vMessage;
                                    oView.getModel("JMBPCreate").refresh();
                                    vError = true;
                                }

                            }
                        }
                    } else {
                        if (!oView.getModel("JMBPCreate").getData().newPaymentMethod) {
                            oView.getModel("JMBPCreate").getData().newPaymentMethode = "Error";
                            oView.getModel("JMBPCreate").getData().newPaymentMethodm = "Please select a valid Payment Method";
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        }
                    }
                    if (!oView.getModel("JMBPCreate").getData().paymentTerms) {
                        if (!oView.getModel("JMBPCreate").getData().newPaymentTerms) {
                            oView.getModel("JMBPCreate").getData().paymentTermse = "Error";
                            oView.getModel("JMBPCreate").getData().paymentTermsm = "Please select valid Payment Terms";
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        }
                    }

                    if (!oView.getModel("JMBPCreate").getData().incoTerms) {
                        if (!oView.getModel("JMBPCreate").getData().newIncoTerms) {
                            oView.getModel("JMBPCreate").getData().incoTermse = "Error";
                            oView.getModel("JMBPCreate").getData().incoTermsm = "Please select a valid Incoterm";
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        }
                    }
                    if (!oView.getModel("JMBPCreate").getData().incotermNameLocation) {
                        if (!oView.getModel("JMBPCreate").getData().newIncoTermsNameLocation) {
                            oView.getModel("JMBPCreate").getData().incotermNameLocatione = "Error";
                            oView.getModel("JMBPCreate").getData().incotermNameLocationm = "Please enter a valid Incoterm Named Location";
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        }
                    }











                    // if (!oView.getModel("JMBPCreate").getData().product) {
                    //     oView.getModel("JMBPCreate").getData().producte = "Error";
                    //     oView.getModel("JMBPCreate").getData().productm = oi18n.getProperty("BPCMandatoryValidationProduct");
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // } else if (oView.getModel("JMBPCreate").getData().producte == "Error") {
                    //     vError = true;
                    // }
                    // if (oView.byId("id_conflictIntrest").getSelectedIndex() == -1) {
                    //     oView.getModel("JMBPCreate").getData().conflicte = "Error";
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // }
                    // if (!oView.getModel("JMBPCreate").getData().altContactFirstName) {
                    //     oView.getModel("JMBPCreate").getData().altContactFirstNamee = "Error";
                    //     oView.getModel("JMBPCreate").getData().altContactFirstNamem = oi18n.getProperty("BPCMandatoryValidationAltFname");
                    //     oView.getModel("JMBPCreate").refresh();
                    //     vError = true;
                    // } else if (oView.getModel("JMBPCreate").getData().altContactFirstNamee == "Error") {
                    //     vError = true;
                    // }
                    // if (!oView.getModel("JMBPCreate").getData().altContactLastName) {
                    //     oView.getModel("JMBPCreate").getData().altContactLastNamee = "Error";
                    //     oView.getModel("JMBPCreate").getData().altContactLastNamem = oi18n.getProperty("BPCMandatoryValidationAltLastName");
                    //     oView.getModel("JMBPCreate").refresh();
                    //     vError = true;
                    // } else if (oView.getModel("JMBPCreate").getData().altContactLastNamee == "Error") {
                    //     vError = true;
                    // }
                    // if (!oView.getModel("JMBPCreate").getData().altContactJobTitle) {
                    //     oView.getModel("JMBPCreate").getData().altContactJobTitlee = "Error";
                    //     oView.getModel("JMBPCreate").getData().altContactJobTitlem = oi18n.getProperty("BPCMandatoryValidationJobTitle");
                    //     oView.getModel("JMBPCreate").refresh();
                    //     vError = true;
                    // } else
                    if (oView.getModel("JMBPCreate").getData().altContactJobTitlee == "Error") {
                        vError = true;
                    }
                    // if (!oView.getModel("JMBPCreate").getData().altEmail) {
                    //     oView.getModel("JMBPCreate").getData().altEmaile = "Error";
                    //     oView.getModel("JMBPCreate").getData().altEmailm = oi18n.getProperty("PleaseProvideAltEmail");
                    //     oView.getModel("JMBPCreate").refresh();
                    //     vError = true;
                    // } else if (oView.getModel("JMBPCreate").getData().altEmaile == "Error") {
                    //     vError = true;
                    // }
                    // if (!oView.getModel("JMBPCreate").getData().altPhoneNumber) {
                    //     oView.getModel("JMBPCreate").getData().altPhoneNumbere = "Error";
                    //     oView.getModel("JMBPCreate").getData().altPhoneNumberm = oi18n.getProperty("BPCMandatoryValidationAltPhoneNum");
                    //     oView.getModel("JMBPCreate").refresh();
                    //     vError = true;
                    // } else if (oView.getModel("JMBPCreate").getData().altPhoneNumbere == "Error") {
                    //     vError = true;
                    // }
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
                    if (oView.getModel("JMBPCreate").getData().requestorConflictOfInterests == -1) {
                        oView.getModel("JMBPCreate").getData().requestorConflictOfInterestse = "Error";

                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().requestorConflictOfInterests == 1) {
                        if (!oView.getModel("JMBPCreate").getData().requestorCOIName) {
                            oView.getModel("JMBPCreate").getData().requestorCOINamee = "Error";
                            oView.getModel("JMBPCreate").getData().requestorCOINamem = oi18n.getProperty("BPCMandatoryValidationAltFname");
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        } else if (oView.getModel("JMBPCreate").getData().requestorCOINamee == "Error") {
                            vError = true;
                        }
                        // if (!oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumber) {
                        //     oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumbere = "Error";
                        //     oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumberm = oi18n.getProperty("BPCMandatoryValidationAltPhoneNum");
                        //     oView.getModel("JMBPCreate").refresh();
                        //     vError = true;
                        // } else if (oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumbere == "Error") {
                        //     vError = true;
                        // }
                        if (!oView.getModel("JMBPCreate").getData().requestorCOIEmail) {
                            oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "Error";
                            oView.getModel("JMBPCreate").getData().requestorCOIEmailm = oi18n.getProperty("PleaseProvideAltEmail");
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        } else if (oView.getModel("JMBPCreate").getData().requestorCOIEmaile == "Error") {
                            vError = true;
                        }
                    }
                    if (oView.getModel("JMBPCreate").getData().conflictOfInterests == 1) {
                        if (!oView.getModel("JMBPCreate").getData().additionalInformation) {
                            oView.getModel("JMBPCreate").getData().additionalInformatione = "Error";
                            oView.getModel("JMBPCreate").getData().additionalInformationm = oi18n.getProperty("pleaseEnterCOIReason");
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        } else if (oView.getModel("JMBPCreate").getData().additionalInformatione == "Error") {
                            vError = true;
                        }
                    }
                    if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicators == 0) {
                        if (!oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustName) {
                            oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee = "Error";
                            oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamem = oi18n.getProperty("pleaseEnterCustDirSuppName");
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        } else if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee == "Error") {
                            vError = true;
                        }
                        if (!oView.getModel("JMBPCreate").getData().customerDirectedSupplierContract) {
                            oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte = "Error";
                            oView.getModel("JMBPCreate").getData().customerDirectedSupplierContractm = oi18n.getProperty("pleaseEnterCustDirContact");
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        } else if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte == "Error") {
                            vError = true;
                        }
                    }
                    // if (!oView.getModel("JMBPCreate").getData().altContactCountryCode) {
                    //     oView.getModel("JMBPCreate").getData().altContactCountryCodee = "Error";
                    //     oView.getModel("JMBPCreate").getData().altContactCountryCodem = oi18n.getProperty("BPCEnterCountryCode1");
                    //     oView.getModel("JMBPCreate").refresh();
                    //     vError = true;
                    // }

                    if (oView.getModel("JMBPCreate").getData().plant == "CN30" || oView.getModel("JMBPCreate").getData().plant == "CN81") {
                        if (!oView.getModel("JMBPCreate").getData().materialGroup) {
                            oView.getModel("JMBPCreate").getData().materialGroupe = "Error";
                            oView.getModel("JMBPCreate").getData().materialGroupm = oi18n.getProperty("pleaseProvideMaterialGroup");
                            oView.getModel("JMBPCreate").refresh();
                            vError = true;
                        }
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
                    if (oView.getModel("JMBPCreate").getData().producte == "Error") {
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
                    if (oView.getModel("JMBPCreate").getData().requestorConflictOfInterests == 0) {
                        if (oView.getModel("JMBPCreate").getData().requestorCOINamee == "Error") {
                            vError = true;
                        }
                        if (oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumbere == "Error") {
                            vError = true;
                        }
                        if (oView.getModel("JMBPCreate").getData().requestorCOIEmaile == "Error") {
                            vError = true;
                        }
                    }


                }
                var vError1 = false;
                if (!oView.getModel("JMBPCreate").getData().address1) {
                    vError1 = true;
                }

                if (!oView.getModel("JMBPCreate").getData().city) {
                    vError1 = true;
                }
                if (!oView.getModel("JMBPCreate").getData().state) {
                    vError1 = true;
                }

                // if (!oView.getModel("JMBPCreate").getData().district) {
                //     vError1 = true;
                // }
                if (!oView.getModel("JMBPCreate").getData().country) {
                    vError1 = true;
                }
                if (!oView.getModel("JMBPCreate").getData().postalCode) {
                    vError1 = true;
                }
                if (vError1) {
                    sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("AddressErrorExtention")), {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                        contentWidth: "30%",
                        styleClass: "sapUiSizeCompact"
                    });
                    return;
                }

                var oModel = new JSONModel();
                var sUrl, vQuery;
                if (oView.getModel("JMBPCreate").getData().caseId) {
                    sUrl = "/nsBuyerRegistration/plcm_portal_services/case/updateBP";
                    vQuery = "PUT";
                } else {
                    sUrl = "/nsBuyerRegistration/plcm_portal_services/case/createBP";
                    vQuery = "POST";
                }
                var vConflictOfInt;
                var vConflictOfIntSel = oView.getModel("JMBPCreate").getData().conflictOfInterests;
                if (vConflictOfIntSel == 0) {
                    vConflictOfInt = false;
                } else if (vConflictOfIntSel == 1) {
                    vConflictOfInt = true;
                } else {
                    vConflictOfInt = null;
                }
                var vConflictOfInt1;
                var vConflictOfIntSel1 = oView.getModel("JMBPCreate").getData().requestorConflictOfInterests;
                if (vConflictOfIntSel1 == 0) {
                    vConflictOfInt1 = false;
                } else if (vConflictOfIntSel1 == 1) {
                    vConflictOfInt1 = true;
                } else {
                    vConflictOfInt1 = null;
                }
                var vCiscoGrub;
                var isExclCiscoGhubSel1 = oView.getModel("JMBPCreate").getData().isExclCiscoGhub;
                if (isExclCiscoGhubSel1 == 0) {
                    vCiscoGrub = true;
                } else if (isExclCiscoGhubSel1 == 1) {
                    vCiscoGrub = false;
                } else {
                    vCiscoGrub = null;
                }

                var vAdditionalSuvey;
                var vAdditionalSuvey = oView.getModel("JMBPCreate").getData().addlSurveyForSuppliers;
                if (vAdditionalSuvey == 0) {
                    vAdditionalSuvey = true;
                } else {
                    vAdditionalSuvey = false;
                }
                var vOtherCompany;
                if (oView.getModel("JMBPCreate").getData().representAnotherCompanys == 0) {
                    vOtherCompany = true;
                } else {
                    vOtherCompany = false;
                }
                var vOneTimeInd = oView.getModel("JMBPCreate").getData().oneTimePurchaseSupplierIndicators;
                if (vOneTimeInd == 0) {
                    vOneTimeInd = true;
                } else if (vOneTimeInd == 1) {
                    vOneTimeInd = false;
                } else {
                    vOneTimeInd = null;
                }

                var vCustDirInd = oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicators;
                if (vCustDirInd == 0) {
                    vCustDirInd = true;
                } else if (vCustDirInd == 1) {
                    vCustDirInd = false;
                } else {
                    vCustDirInd = null;
                }

                var vOutsideProcessInd = oView.getModel("JMBPCreate").getData().outsideProcessiongSupplierIndicators;
                if (vOutsideProcessInd == 0) {
                    vOutsideProcessInd = true;
                } else {
                    vOutsideProcessInd = false;
                }
                var vManualAddrInd = oView.getModel("JMBPCreate").getData().manualAddressOverrideSupplierIndicators;
                if (vManualAddrInd == 0) {
                    vManualAddrInd = true;
                } else {
                    vManualAddrInd = false;
                }


                if (vError == true) {
                    sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("validationDefaultMsg")), {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                        contentWidth: "30%",
                        styleClass: "sapUiSizeCompact"
                    });
                    return;
                }
                var vConfirmMsg, vStatus = "";
                var vBuyerEmail = ""
                if (oView.getModel("oConfigMdl").getData().usrData) {
                    vBuyerEmail = oView.getModel("oConfigMdl").getData().usrData.email;
                }
                if (vBtnActn == "SD") {
                    vConfirmMsg = oi18n.getProperty("BPCConfirmSaveAsDraft");
                    //   MessageBox.confirm(vConfirmMsg, {
                    // icon: MessageBox.Icon.Confirmation,
                    // title: "Confirmation",
                    // actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    // emphasizedAction: MessageBox.Action.YES,
                    // onClose: function (oAction) {
                    //     if (oAction == "YES") {
                    var vBuyer = "", vBuyerEmail = "";
                    if (oView.getModel("oConfigMdl").getData().usrData) {
                        vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;
                        //  vBuyerEmail = oView.getModel("oConfigMdl").getData().usrData.email;
                    }

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
                                "newPaymentMethod": oView.getModel("JMBPCreate").getData().newPaymentMethod,
                                "currency": oView.getModel("JMBPCreate").getData().currency,
                                "dunsNumber": oView.getModel("JMBPCreate").getData().dunsNumber,
                                "incotermNameLocation": oView.getModel("JMBPCreate").getData().incotermNameLocation,
                                "newIncoTermsNameLocation": oView.getModel("JMBPCreate").getData().newIncoTermsNameLocation,
                                "newIncoTerms": oView.getModel("JMBPCreate").getData().newIncoTerms,
                                "requestorConflictOfInterest": vConflictOfInt1,
                                "isExclCiscoGhub": vCiscoGrub,
                                "product": oView.getModel("JMBPCreate").getData().product,
                                "requestorCOIEmail": oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                "requestorCOIName": oView.getModel("JMBPCreate").getData().requestorCOIName,
                                "requestorCOIPhoneNumber": oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumber,
                                "requestorCOIReason": oView.getModel("JMBPCreate").getData().requestorCOIReason,
                                "addlSurveyForSupplier": vAdditionalSuvey,
                                "contactMobilePhone": oView.getModel("JMBPCreate").getData().contactMobilePhone,
                                "contactCountryCode": oView.getModel("JMBPCreate").getData().contactCountryCode,
                                "altContactCountryCode": oView.getModel("JMBPCreate").getData().altContactCountryCode,
                                "mobileCountryCode": oView.getModel("JMBPCreate").getData().mobileCountryCode,
                                "supplierLanguage": oView.getModel("JMBPCreate").getData().supplierLanguage
                            },
                            "additionalInformation": oView.getModel("JMBPCreate").getData().additionalInformation,
                            "buyerName": oView.getModel("JMBPCreate").getData().buyerName,
                            "buyerEmailId": vBuyerEmail,
                            "companyCode": oView.getModel("JMBPCreate").getData().companyCode,
                            "companyCodeDesc": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, oView.getModel("JMBPCreate").getData().companyCode, "CompanyCode"),
                            "conflictOfInterest": vConflictOfInt,
                            "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                            "incoTerms": oView.getModel("JMBPCreate").getData().incoTerms,

                            "isNew": vIsNew,
                            "isDuplicatesFound": false,
                            "plant": oView.getModel("JMBPCreate").getData().plant,
                            "purchasingOrg": oView.getModel("JMBPCreate").getData().purchasingOrg,
                            "scopeId": oView.getModel("JMBPCreate").getData().scopeId,
                            // "supplier": oView.getModel("JMBPCreate").getData().supplier,
                            "workCell": oView.getModel("JMBPCreate").getData().workCell,
                            "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup,
                            "workflowId": "",
                        },
                        "bpNumber": oView.getModel("JMBPCreate").getData().bpNumber,
                        "caseId": oView.getModel("JMBPCreate").getData().caseId,
                        "dateCreated": oView.getModel("JMBPCreate").getData().dateCreated,
                        "dateUpdated": oView.getModel("JMBPCreate").getData().dateUpdated,
                        "status": vStatus,
                        "userCreated": oView.getModel("JMBPCreate").getData().userCreated,
                        "userUpdated": vBuyer,
                        "bpSearch": oView.getModel("JMBPCreate").getData().bpSearch,
                    }
                    oModel.loadData(sUrl, JSON.stringify(oPayload), true, vQuery, false, true, {
                        "Content-Type": "application/json"
                    });
                    oModel.attachRequestCompleted(function (oEvent) {
                        if (oEvent.getParameter("success")) {
                            oView.getModel("JMBPCreate").getData().caseId = oEvent.getSource().getData().caseId;
                            var temp = {
                                "Message": "",
                                "caseId": oEvent.getSource().getData().caseId
                            }
                            if (oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.addlSurveyForSupplier == true) {
                                that.fnFinalFileUpload(oEvent.getSource().getData().caseId);
                            }
                            that.caseId = oEvent.getSource().getData().caseId;
                            if (vBtnActn == "SD") {
                                temp.Message = oi18n.getProperty("BPCSaveAsDraftMessageExt");
                                var oJosnMessage = new sap.ui.model.json.JSONModel();
                                oJosnMessage.setData(temp);
                                oView.setModel(oJosnMessage, "JMMessageData");
                                if (!that.oBPSuccessDraft) {
                                    that.oBPSuccessDraft = sap.ui.xmlfragment(
                                        "ns.BuyerRegistration.fragments.CreateSuccessDraft", that);
                                    oView.addDependent(that.oBPSuccessDraft);
                                }
                                oBusyDilog.close();
                                that.oBPSuccessDraft.open();
                            } else if (vBtnActn == "SU") {

                                var oModelWf = new JSONModel();
                                if (oView.getModel("oConfigMdl").getData().contextPath.Name == "Display") {
                                    var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/trigger";
                                    var oPayload = {
                                        "context": {
                                            "isNew": vIsNew,
                                            "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                                            "isDplicatesFound": false,
                                            "caseId": oEvent.getSource().getData().caseId,
                                            "buyerName": vBuyer,
                                            "buyerTelephone": "",
                                            "buyerEmailid": vBuyerEmail,
                                            "division": "",
                                            "conflictOfInterest": vConflictOfInt,
                                            "requestorConflictOfInterest": vConflictOfInt1,
                                            "requestorCOIEmail": oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                            "requestorCOIName": oView.getModel("JMBPCreate").getData().requestorCOIName,
                                            "coiReason": oView.getModel("JMBPCreate").getData().additionalInformation,
                                            "supplierName": oView.getModel("JMBPCreate").getData().firstName + " " + oView.getModel("JMBPCreate").getData().lastName,
                                            "supplierAddress": oView.getModel("JMBPCreate").getData().address1,
                                            "supplierCity": oView.getModel("JMBPCreate").getData().city,
                                            "supplierCountry": oView.getModel("JMBPCreate").getData().countryd,
                                            "supplierDistrict": oView.getModel("JMBPCreate").getData().district,
                                            "supplierPostalCode": oView.getModel("JMBPCreate").getData().postalCode,
                                            "supplierTelephone": oView.getModel("JMBPCreate").getData().telephone,
                                            "supplierEmail": oView.getModel("JMBPCreate").getData().email,
                                            "purchasingGroup": "",
                                            "workCell": oView.getModel("JMBPCreate").getData().workCelld,
                                            "plant": oView.getModel("JMBPCreate").getData().plant,
                                            "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup,
                                            "companyCode": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, oView.getModel("JMBPCreate").getData().companyCode, "CompanyCode"),
                                            "purchasingOrg": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PurOrg, oView.getModel("JMBPCreate").getData().purchasingOrg, "PurchOrg"),
                                            "supplierDetails": {
                                                "firstName": oView.getModel("JMBPCreate").getData().firstName,
                                                "lastName": oView.getModel("JMBPCreate").getData().lastName,
                                                "email": oView.getModel("JMBPCreate").getData().email
                                            },
                                            "cc": oView.getModel("JMBPCreate").getData().companyCode,
                                            "po": oView.getModel("JMBPCreate").getData().purchasingOrg
                                            // "company_code": oView.getModel("JMBPCreate").getData().companyCode,
                                            // "purchasing_code": oView.getModel("JMBPCreate").getData().purchasingOrg
                                        },

                                        "definitionId": "partner_onboarding_main"
                                    }
                                } else {
                                    var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskComplete"

                                    var oPayload = {
                                        "context": {
                                            "bpNumber": "",
                                            "isNew": vIsNew,
                                            "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                            "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                                            "isDplicatesFound": false,
                                            "caseId": oEvent.getSource().getData().caseId,
                                            "buyerName": vBuyer,
                                            "buyerTelephone": "",
                                            "buyerEmailid": vBuyerEmail,
                                            "division": "",
                                            "conflictOfInterest": vConflictOfInt,
                                            "requestorConflictOfInterest": vConflictOfInt1,
                                            "requestorCOIEmail": oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                            "requestorCOIName": oView.getModel("JMBPCreate").getData().requestorCOIName,
                                            "coiReason": oView.getModel("JMBPCreate").getData().additionalInformation,
                                            "supplierName": oView.getModel("JMBPCreate").getData().firstName + " " + oView.getModel("JMBPCreate").getData().lastName,
                                            "supplierAddress": oView.getModel("JMBPCreate").getData().address1,
                                            "supplierCity": oView.getModel("JMBPCreate").getData().city,
                                            "supplierCountry": oView.getModel("JMBPCreate").getData().countryd,
                                            "supplierDistrict": oView.getModel("JMBPCreate").getData().district,
                                            "supplierPostalCode": oView.getModel("JMBPCreate").getData().postalCode,
                                            "supplierTelephone": oView.getModel("JMBPCreate").getData().telephone,
                                            "supplierEmail": oView.getModel("JMBPCreate").getData().email,
                                            "purchasingGroup": "",
                                            "workCell": oView.getModel("JMBPCreate").getData().workCelld,
                                            "plant": oView.getModel("JMBPCreate").getData().plant,
                                            "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup,
                                            "companyCode": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, oView.getModel("JMBPCreate").getData().companyCode, "CompanyCode"),
                                            "purchasingOrg": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PurOrg, oView.getModel("JMBPCreate").getData().purchasingOrg, "PurchOrg"),
                                            "supplierDetails": {
                                                "firstName": oView.getModel("JMBPCreate").getData().firstName,
                                                "lastName": oView.getModel("JMBPCreate").getData().lastName,
                                                "email": oView.getModel("JMBPCreate").getData().email
                                            },
                                            "cc": oView.getModel("JMBPCreate").getData().companyCode,
                                            "po": oView.getModel("JMBPCreate").getData().purchasingOrg
                                            // "company_code": oView.getModel("JMBPCreate").getData().companyCode,
                                            // "purchasing_code": oView.getModel("JMBPCreate").getData().purchasingOrg
                                        },
                                        "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                        "bpNumber": ""
                                        //"definitionId": "partner_onboarding_main"
                                    }

                                }

                                oModelWf.loadData(sUrl, JSON.stringify(
                                    oPayload
                                ), true, "POST", false, true, {
                                    "Content-Type": "application/json"
                                });
                                oModelWf.attachRequestCompleted(function (oEvent) {
                                    oBusyDilog.close();
                                    if (oEvent.getParameter("success")) {

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
                                                "ns.BuyerRegistration.fragments.CreateSuccess", that);
                                            oView.addDependent(that.oBPSuccess);
                                        }
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
                    //         }
                    //     }
                    // });
                } else if (vBtnActn == "SU") {
                    //  vConfirmMsg = oi18n.getProperty("BPCConfirmSubmit");
                    vConfirmMsg = "Please confirm submission request for " + oView.getModel("JMBPCreate").getData().corporationName + " in Company Code: " + oView.getModel("JMBPCreate").getData().companyCode + " and Purchasing Org: " + oView.getModel("JMBPCreate").getData().purchasingOrg;
                    vStatus = "In Progress"
                    MessageBox.confirm(vConfirmMsg, {
                        icon: MessageBox.Icon.Confirmation,
                        title: "Confirmation",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (oAction) {
                            if (oAction == "YES") {
                                var vBuyer = "", vBuyerEmail = "";
                                if (oView.getModel("oConfigMdl").getData().usrData) {
                                    vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;
                                    vBuyerEmail = oView.getModel("oConfigMdl").getData().usrData.email;
                                }

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
                                            "newPaymentMethod": oView.getModel("JMBPCreate").getData().newPaymentMethod,
                                            "currency": oView.getModel("JMBPCreate").getData().currency,
                                            "dunsNumber": oView.getModel("JMBPCreate").getData().dunsNumber,
                                            "incotermNameLocation": oView.getModel("JMBPCreate").getData().incotermNameLocation,
                                            "newIncoTermsNameLocation": oView.getModel("JMBPCreate").getData().newIncoTermsNameLocation,
                                            "newIncoTerms": oView.getModel("JMBPCreate").getData().newIncoTerms,
                                            "requestorConflictOfInterest": vConflictOfInt1,
                                            "isExclCiscoGhub": vCiscoGrub,
                                            "product": oView.getModel("JMBPCreate").getData().product,
                                            "requestorCOIEmail": oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                            "requestorCOIName": oView.getModel("JMBPCreate").getData().requestorCOIName,
                                            "requestorCOIPhoneNumber": oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumber,
                                            "requestorCOIReason": oView.getModel("JMBPCreate").getData().requestorCOIReason,
                                            "addlSurveyForSupplier": vAdditionalSuvey,
                                            "altContactCountryCode": oView.getModel("JMBPCreate").getData().altContactCountryCode,
                                            "contactMobilePhone": oView.getModel("JMBPCreate").getData().contactMobilePhone,
                                            "contactCountryCode": oView.getModel("JMBPCreate").getData().contactCountryCode,
                                            "mobileCountryCode": oView.getModel("JMBPCreate").getData().mobileCountryCode,
                                            "supplierLanguage": oView.getModel("JMBPCreate").getData().supplierLanguage
                                        },
                                        "additionalInformation": oView.getModel("JMBPCreate").getData().additionalInformation,
                                        "buyerName": oView.getModel("JMBPCreate").getData().buyerName,
                                        "buyerEmailId": vBuyerEmail,
                                        "companyCode": oView.getModel("JMBPCreate").getData().companyCode,
                                        "companyCodeDesc": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, oView.getModel("JMBPCreate").getData().companyCode, "CompanyCode"),
                                        "conflictOfInterest": vConflictOfInt,
                                        "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                                        "incoTerms": oView.getModel("JMBPCreate").getData().incoTerms,

                                        "isNew": vIsNew,
                                        "isDuplicatesFound": false,
                                        "plant": oView.getModel("JMBPCreate").getData().plant,
                                        "purchasingOrg": oView.getModel("JMBPCreate").getData().purchasingOrg,
                                        "scopeId": oView.getModel("JMBPCreate").getData().scopeId,
                                        // "supplier": oView.getModel("JMBPCreate").getData().supplier,
                                        "workCell": oView.getModel("JMBPCreate").getData().workCell,
                                        "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup,
                                        "workflowId": "",
                                    },
                                    "bpNumber": oView.getModel("JMBPCreate").getData().bpNumber,
                                    "caseId": oView.getModel("JMBPCreate").getData().caseId,
                                    "dateCreated": oView.getModel("JMBPCreate").getData().dateCreated,
                                    "dateUpdated": oView.getModel("JMBPCreate").getData().dateUpdated,
                                    "status": vStatus,
                                    "userCreated": oView.getModel("JMBPCreate").getData().userCreated,
                                    "userUpdated": vBuyer,
                                    "bpSearch": oView.getModel("JMBPCreate").getData().bpSearch,
                                }
                                oModel.loadData(sUrl, JSON.stringify(oPayload), true, vQuery, false, true, {
                                    "Content-Type": "application/json"
                                });
                                oModel.attachRequestCompleted(function (oEvent) {
                                    if (oEvent.getParameter("success")) {
                                        oView.getModel("JMBPCreate").getData().caseId = oEvent.getSource().getData().caseId;
                                        var temp = {
                                            "Message": "",
                                            "caseId": oEvent.getSource().getData().caseId
                                        }
                                        if (oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.addlSurveyForSupplier == true) {
                                            that.fnFinalFileUpload(oEvent.getSource().getData().caseId);
                                        }
                                        that.caseId = oEvent.getSource().getData().caseId;
                                        if (vBtnActn == "SD") {
                                            temp.Message = oi18n.getProperty("BPCSaveAsDraftMessageExt");
                                            var oJosnMessage = new sap.ui.model.json.JSONModel();
                                            oJosnMessage.setData(temp);
                                            oView.setModel(oJosnMessage, "JMMessageData");
                                            if (!that.oBPSuccessDraft) {
                                                that.oBPSuccessDraft = sap.ui.xmlfragment(
                                                    "ns.BuyerRegistration.fragments.CreateSuccessDraft", that);
                                                oView.addDependent(that.oBPSuccessDraft);
                                            }
                                            oBusyDilog.close();
                                            that.oBPSuccessDraft.open();
                                        } else if (vBtnActn == "SU") {

                                            var oModelWf = new JSONModel();
                                            if (oView.getModel("oConfigMdl").getData().contextPath.Name == "Display") {
                                                var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/trigger";
                                                var oPayload = {
                                                    "context": {
                                                        "isNew": vIsNew,
                                                        "isDplicatesFound": false,
                                                        "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                                                        "caseId": oEvent.getSource().getData().caseId,
                                                        "buyerName": vBuyer,
                                                        "buyerTelephone": "",
                                                        "buyerEmailid": vBuyerEmail,
                                                        "division": "",
                                                        "conflictOfInterest": vConflictOfInt,
                                                        "requestorConflictOfInterest": vConflictOfInt1,
                                                        "requestorCOIEmail": oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                                        "requestorCOIName": oView.getModel("JMBPCreate").getData().requestorCOIName,
                                                        "coiReason": oView.getModel("JMBPCreate").getData().additionalInformation,
                                                        "supplierName": oView.getModel("JMBPCreate").getData().firstName + " " + oView.getModel("JMBPCreate").getData().lastName,
                                                        "supplierAddress": oView.getModel("JMBPCreate").getData().address1,
                                                        "supplierCity": oView.getModel("JMBPCreate").getData().city,
                                                        "supplierCountry": oView.getModel("JMBPCreate").getData().countryd,
                                                        "supplierDistrict": oView.getModel("JMBPCreate").getData().district,
                                                        "supplierPostalCode": oView.getModel("JMBPCreate").getData().postalCode,
                                                        "supplierTelephone": oView.getModel("JMBPCreate").getData().telephone,
                                                        "supplierEmail": oView.getModel("JMBPCreate").getData().email,
                                                        "purchasingGroup": "",
                                                        "workCell": oView.getModel("JMBPCreate").getData().workCelld,
                                                        "plant": oView.getModel("JMBPCreate").getData().plant,
                                                        "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup,
                                                        "companyCode": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, oView.getModel("JMBPCreate").getData().companyCode, "CompanyCode"),
                                                        "purchasingOrg": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PurOrg, oView.getModel("JMBPCreate").getData().purchasingOrg, "PurchOrg"),
                                                        "supplierDetails": {
                                                            "firstName": oView.getModel("JMBPCreate").getData().firstName,
                                                            "lastName": oView.getModel("JMBPCreate").getData().lastName,
                                                            "email": oView.getModel("JMBPCreate").getData().email
                                                        },
                                                        "cc": oView.getModel("JMBPCreate").getData().companyCode,
                                                        "po": oView.getModel("JMBPCreate").getData().purchasingOrg
                                                        // "company_code": oView.getModel("JMBPCreate").getData().companyCode,
                                                        // "purchasing_code": oView.getModel("JMBPCreate").getData().purchasingOrg
                                                    },

                                                    "definitionId": "partner_onboarding_main"
                                                }
                                            } else {
                                                var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskComplete"
                                                var oPayload = {
                                                    "context": {
                                                        "bpNumber": "",
                                                        "isNew": vIsNew,
                                                        "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                                        "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                                                        "isDplicatesFound": false,
                                                        "caseId": oEvent.getSource().getData().caseId,
                                                        "buyerName": vBuyer,
                                                        "buyerTelephone": "",
                                                        "buyerEmailid": vBuyerEmail,
                                                        "division": "",
                                                        "conflictOfInterest": vConflictOfInt,
                                                        "requestorConflictOfInterest": vConflictOfInt1,
                                                        "requestorCOIEmail": oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                                        "requestorCOIName": oView.getModel("JMBPCreate").getData().requestorCOIName,
                                                        "coiReason": oView.getModel("JMBPCreate").getData().additionalInformation,
                                                        "supplierName": oView.getModel("JMBPCreate").getData().firstName + " " + oView.getModel("JMBPCreate").getData().lastName,
                                                        "supplierAddress": oView.getModel("JMBPCreate").getData().address1,
                                                        "supplierCity": oView.getModel("JMBPCreate").getData().city,
                                                        "supplierCountry": oView.getModel("JMBPCreate").getData().countryd,
                                                        "supplierDistrict": oView.getModel("JMBPCreate").getData().district,
                                                        "supplierPostalCode": oView.getModel("JMBPCreate").getData().postalCode,
                                                        "supplierTelephone": oView.getModel("JMBPCreate").getData().telephone,
                                                        "supplierEmail": oView.getModel("JMBPCreate").getData().email,
                                                        "purchasingGroup": "",
                                                        "workCell": oView.getModel("JMBPCreate").getData().workCelld,
                                                        "plant": oView.getModel("JMBPCreate").getData().plant,
                                                        "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup,
                                                        "companyCode": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, oView.getModel("JMBPCreate").getData().companyCode, "CompanyCode"),
                                                        "purchasingOrg": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PurOrg, oView.getModel("JMBPCreate").getData().purchasingOrg, "PurchOrg"),
                                                        "supplierDetails": {
                                                            "firstName": oView.getModel("JMBPCreate").getData().firstName,
                                                            "lastName": oView.getModel("JMBPCreate").getData().lastName,
                                                            "email": oView.getModel("JMBPCreate").getData().email
                                                        },
                                                        "cc": oView.getModel("JMBPCreate").getData().companyCode,
                                                        "po": oView.getModel("JMBPCreate").getData().purchasingOrg
                                                        // "company_code": oView.getModel("JMBPCreate").getData().companyCode,
                                                        // "purchasing_code": oView.getModel("JMBPCreate").getData().purchasingOrg
                                                    },

                                                    "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                                    "bpNumber": ""
                                                }



                                            }

                                            oModelWf.loadData(sUrl, JSON.stringify(
                                                oPayload
                                            ), true, "POST", false, true, {
                                                "Content-Type": "application/json"
                                            });
                                            oModelWf.attachRequestCompleted(function (oEvent) {
                                                oBusyDilog.close();
                                                if (oEvent.getParameter("success")) {

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
                                                            "ns.BuyerRegistration.fragments.CreateSuccess", that);
                                                        oView.addDependent(that.oBPSuccess);
                                                    }
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
                                    } else {
                                        oBusyDilog.close();

                                        var sErMsg;
                                        if (oEvent.getParameter("errorobject").statusCode == 409) {
                                            sErMsg = JSON.parse(oEvent.getParameter("errorobject").responseText).errorMessage;
                                        } else {
                                            sErMsg = oEvent.getParameter("errorobject").responseText;
                                        }

                                        //  var sErMsg = oEvent.getParameter("errorobject").responseText;
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
                this.getView().byId("id_FilterPanel").setExpanded(true);
                //   this.getView().byId("id_foter").setVisible(false);
                var oFCL = this.getView().byId("flexibleColumnLayout");

                oFCL.setLayout(library.LayoutType.OneColumn);
                this.fnScreenResize();
            },
            fnNewBuinessPartner: function () {
                this.getOwnerComponent().getRouter().navTo("BPCreate", {
                    Id: "New"
                });
            },
            fnNavToHome: function () {
                window.history.go(-1);
            },
            fnLiveChangeCountryCodeMob: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().mobileCountryCodee == "Error") {
                    oView.getModel("JMBPCreate").getData().mobileCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().mobileCountryCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeCountryCode1: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().altContactCountryCodee == "Error") {
                    oView.getModel("JMBPCreate").getData().altContactCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().altContactCountryCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeCompCode: function (oEvent) {

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                this.fnLoadPurOrg(oView.getModel("JMBPCreate").getData().companyCode, oEvent.getSource().getSelectedItem().getAdditionalText());
                // this.fnLoadPaymentMethod(oView.getModel("JMBPCreate").getData().companyCode);
                oView.getModel("JMBPCreate").getData().purchasingOrg = "";
                oView.getModel("JMBPCreate").getData().newPaymentMethod = "";

                oView.getModel("JMBPCreate").refresh();
                if (oView.getModel("JMBPCreate").getData().companyCodee == "Error") {
                    oView.getModel("JMBPCreate").getData().companyCodee = "None";
                    oView.getModel("JMBPCreate").getData().companyCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }


            },
            fnChangeDropDown: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
            },
            fnChangeDropDownComp: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                this.fnLoadPurOrg(oView.getModel("JMSearchFilter").getData().companyCode, oEvent.getSource().getSelectedItem().getAdditionalText());

                oView.getModel("JMSearchFilter").getData().purchasingOrg = "";
                oView.getModel("JMSearchFilter").refresh();
            },

            fnLiveChangeCountry: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
            },

            fnLiveChangePlant: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().plante == "Error") {
                    oView.getModel("JMBPCreate").getData().plante = "None";
                    oView.getModel("JMBPCreate").getData().plantm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                oView.getModel("JMBPCreate").getData().materialGroup = "";
                if (oView.getModel("JMBPCreate").getData().plant == "CN30" || oView.getModel("JMBPCreate").getData().plant == "CN81") {
                    oView.getModel("JMBPCreate").getData().materialGroupVis = true;
                    var vMTData = oView.getModel("oStaticData").getData().wuxi;
                    var aData = [];
                    for (var i = 0; i < vMTData.length; i++) {
                        if (vMTData[i].plant == oView.getModel("JMBPCreate").getData().plant) {
                            aData.push(vMTData[i]);
                        }
                    }
                    oView.getModel("oBPLookUpMdl").setProperty("/materialGroup", aData);
                    oView.getModel("oBPLookUpMdl").refresh();
                } else {
                    oView.getModel("JMBPCreate").getData().materialGroupVis = false;
                }
                oView.getModel("JMBPCreate").refresh();
            },
            fnLiveChangePurchOrg: function (oEvent) {
                //    var vSelected = oEvent.getParameter("itemPressed");
                var compCode = oView.getModel("JMBPCreate").getData().companyCode;
                if (compCode === "" || compCode === undefined) {
                    sap.m.MessageToast.show(oi18n.getProperty("SelectCompanyCode"));

                } else {
                    // this.fnLoadPaymentMethod(oView.getModel("JMBPCreate").getData().companyCode,oView.getModel("JMBPCreate").getData().purchasingOrg);
                }

            },
            fnLiveChangePurchOrgVal: function (oEvent) {
                //    var vSelected = oEvent.getParameter("itemPressed");
                var compCode = oView.getModel("JMBPCreate").getData().companyCode;
                this.fnLoadPaymentMethod(oView.getModel("JMBPCreate").getData().companyCode, oView.getModel("JMBPCreate").getData().purchasingOrg);
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
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
            // fnHadleTableSelection: function (oEvent) {
            //     var vPath = oEvent.getSource().getBindingContext("oVendorListModel").getPath();
            //     var vBPNo = oEvent.getSource().getBindingContext("oVendorListModel").getProperty(vPath).BUSINESS_PARTNER_NUMBER
            //     if (oEvent.getParameter("selected") == true) {
            //         oSelManageArray.push(vBPNo);
            //     } else {
            //         var index = oSelManageArray.indexOf(vBPNo);
            //         if (index !== -1) {
            //             oSelManageArray.splice(index, 1);
            //         }
            //     }
            // },
           
            fnLoadPartnerData: function (vActn, vFilter, vSelData) {

                var aFilter = vFilter;
                var aFilter = oView.getModel("JMSearchFilter").getData();
                var vCount = 0;
                for (var key in aFilter) {
                    if (aFilter.hasOwnProperty(key)) {
                        if (aFilter[key]) {
                            vCount = vCount + 1;
                        }
                    }

                }

                if (vCount == 1) {
                    sap.m.MessageToast.show(oi18n.getProperty("BPEEnterAtLeastOneFiltr"))
                } else {
                    if(aFilter.country){
                        if(!aFilter.vendorName && !aFilter.vendorNumber && !aFilter.duns){
                            var sMsg = oi18n.getProperty("FilterForSearchErr");
                            
                          MessageBox.show(sMsg, {
                              icon: MessageBox.Icon.ERROR,
                              title: "Error"
                          });
                          return;
                        }
                     
                    }
  
                    oBusyDilog.open();

                    var oModel = new JSONModel();
                    var sUrl = "/nsBuyerRegistration/plcm_portal_services/api/v1/ehana/search";
                    aFilter.limit = 10;
                    // User Stor 578292 
                    if(vActn!==undefined && typeof vActn !=='string' ){
                            if(vActn.getSource().getText()==='Search'){                               
                                oView.getModel("oVendorListModel").getData().currentPage=1;
                            }
                    }
                    // User Story 578292
                    aFilter.pageNo = oView.getModel("oVendorListModel").getData().currentPage - 1;

                    oModel.loadData(sUrl, JSON.stringify(aFilter), true, "POST", false, true, {
                        "Content-Type": "application/json"
                    });
                    oModel.attachRequestCompleted(function (oEvent) {
                        oBusyDilog.close();
                        if (oEvent.getParameter("success")) {
                            oView.getModel("oConfigMdl").getData().createNewBtn = true;
                            if (oEvent.getSource().getData().d.results.length > 1) {
                                oView.getModel("oConfigMdl").getData().searchEnableGBS = true;

                            } else {
                                oView.getModel("oConfigMdl").getData().searchEnableGBS = false;

                            }
                            oView.getModel("oConfigMdl").refresh();

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
                            var vError = false;
                            for (var i = 0; i < oEvent.getSource().getData().d.results.length; i++) {
                                vError = false;

                                if (!oEvent.getSource().getData().d.results[i].VENDOR_NAME) {
                                    vError = true;
                                }
                                if (!oEvent.getSource().getData().d.results[i].STREET) {
                                    vError = true;
                                }
                                if (!oEvent.getSource().getData().d.results[i].POSTAL_CODE) {
                                    vError = true;
                                }
                                if (!oEvent.getSource().getData().d.results[i].CITY) {
                                    vError = true;
                                }
                                if (!oEvent.getSource().getData().d.results[i].COUNTRY) {
                                    vError = true;
                                }
                                if (!oEvent.getSource().getData().d.results[i].REGION_STATE_PROVINCE) {
                                    vError = true;
                                }
                                // if (!oEvent.getSource().getData().d.results[i].PAYMENT_METHOD) {
                                //     vError = true;
                                // }
                                // if (!oEvent.getSource().getData().d.results[i].PAYMENT_TERMS) {
                                //     vError = true;
                                // }
                                // if (!oEvent.getSource().getData().d.results[i].CURRENCY) {
                                //     vError = true;
                                // }
                                // if (!oEvent.getSource().getData().d.results[i].INCO_TERMS) {
                                //     vError = true;
                                // }
                                // if (!oEvent.getSource().getData().d.results[i].INCOTERMS2) {
                                //     vError = true;
                                // }
                                // if (!oEvent.getSource().getData().d.results[i].BANK_COUNTRY) {
                                //     vError = true;
                                // }
                                // if (!oEvent.getSource().getData().d.results[i].IBAN) {
                                //     vError = true;
                                // }
                                if (oEvent.getSource().getData().d.results[i].BLOCK_FUNCTION) {
                                    vError = true;
                                }
                                if (oEvent.getSource().getData().d.results[i].CENTRAL_POSTING_BLOCK) {
                                    vError = true;
                                }
                                if (oEvent.getSource().getData().d.results[i].CENTRAL_PURCHASING_BLOCK) {
                                    vError = true;
                                } if (oEvent.getSource().getData().d.results[i].COMPANY_CODE_POSTING_BLOCK) {
                                    vError = true;
                                } if (oEvent.getSource().getData().d.results[i].PURCHASING_ORG_BLOCK) {
                                    vError = true;
                                } if (oEvent.getSource().getData().d.results[i].CENTRAL_DELETION_FLAG) {
                                    vError = true;
                                } if (oEvent.getSource().getData().d.results[i].COMPANY_CODE_DEL_FLAG) {
                                    vError = true;
                                }
                                if (oEvent.getSource().getData().d.results[i].PURCHASING_ORG_DEL_FLAG) {
                                    vError = true;
                                }

                                if (oEvent.getSource().getData().d.results[i].CENTRAL_BLOCK_CODE) {
                                    vError = true;
                                }
                                if (oEvent.getSource().getData().d.results[i].PENDING_CHANGE_REQUEST) {
                                    vError = true;
                                }

                                // if (oEvent.getSource().getData().d.results[i].RELATIONSHIP_INDICATOR !== "PRIMARY") {
                                //     vError = true;
                                // }
                                oEvent.getSource().getData().d.results[i].isError = vError;
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
                            if (vSelData) {
                                for (var i = 0; i < vSelData.length; i++) {
                                    for (var j = 0; j < temp.data.length; j++) {
                                        if (vSelData[i].BUSINESS_PARTNER_NUMBER == temp.data[j].BUSINESS_PARTNER_NUMBER) {
                                            temp.data[j].isSelect = true;

                                        }
                                    }
                                }
                            }
                            // if (oSelManageArray.length !== 0) {
                            //     for (var i = 0; i < oSelManageArray.length; i++) {
                            //         for (var j = 0; j < temp.data.length; j++) {
                            //             if (oSelManageArray[i] == temp.data[j].BUSINESS_PARTNER_NUMBER) {
                            //                 temp.data[j].isSelect = true;
                            //                 continue;
                            //             }
                            //         }

                            //     }
                            // }
                            var oData = oEvent.getSource().getData();
                            var oVendorListJson = new sap.ui.model.json.JSONModel();
                            oVendorListJson.setData(temp);
                            that.getView().setModel(oVendorListJson, "oVendorListModel");

                            // if (oView.getModel("oVendorListModel").getData().currentPage == 1) {
                            //     if (temp.data.length > 1) {
                            //         MessageBox.information(oi18n.getProperty("DuplicateInfoText"));
                            //     }
                            // }

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
                            if (oEvent.getParameter("errorobject").statusCode == 504) {
                                var sErMsg = "Gateway Timeout due to large data set, please try with additional filter";
                            } else {
                                var sErMsg = oEvent.getParameter("errorobject").responseText;
                            }

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

                }


            },
            fnLoadSME: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/sme/list";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/SMEList", oEvent.getSource().getData());
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
                    var sUrl = "/nsBuyerRegistration/plcm_portal_services/sme/search"

                    var oPayload = {
                        "companyCode": oView.getModel("JMFilter").getData().companyCode,
                        "purchasingOrganisation": oView.getModel("JMFilter").getData().purchasingOrganisation,
                        "smeEmail": oView.getModel("JMFilter").getData().smeEmail

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
            fnLoadPurOrgSME: function (vCompCode, vDescription) {
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
            fnCloseSMEList: function () {
                this.oBPSendToSMEList.close();
            },
            fnLiveChangeCompCodeSME: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }

                }
                this.fnLoadPurOrgSME(oView.getModel("JMFilter").getData().companyCode, oEvent.getSource().getSelectedItem().getAdditionalText());
                oView.getModel("JMFilter").getData().purchasingOrg = "";
                oView.getModel("JMFilter").refresh();
                if (oView.getModel("JMFilter").getData().companyCodee == "Error") {
                    oView.getModel("JMFilter").getData().companyCodee = "None";
                    oView.getModel("JMFilter").getData().companyCodem = "";
                    oView.getModel("JMFilter").refresh();
                }

            },
            fnSMETableOpen: function () {
                var oJsonFilter = new sap.ui.model.json.JSONModel();
                var temp = {
                    "companyCode": "",
                    "purchasingOrganisation": ""
                };
                oJsonFilter.setData(temp);
                oView.setModel(oJsonFilter, "JMFilter");
                this.fnSearchSME();
                if (!this.oBPSendToSMEList) {
                    this.oBPSendToSMEList = sap.ui.xmlfragment(
                        "ns.BuyerRegistration.fragments.SMETabView", this);
                    oView.addDependent(this.oBPSendToSMEList);
                }
                this.oBPSendToSMEList.open();
            },
            fnSelectSMEList: function (oEvent) {
                var oSelected = sap.ui.getCore().byId("id_SMEListContent").getSelectedItem();
                if (oSelected) {
                    var vEmail = oSelected.getBindingContext("JMCompSearchResult").getProperty("smeEmail");

                    oView.getModel("JMSMESel").getData().smeEmail = vEmail;
                    oView.getModel("JMSMESel").refresh();
                    this.oBPSendToSMEList.close();
                } else {
                    sap.m.MessageToast.show(oi18n.getProperty("PlSelAtLeastOneRec"));
                }

            },
            fnSendToSME: function () {
                var aSelData = [];
                for (var i = 0; i < oView.getModel("oVendorListModel").getData().data.length; i++) {
                    if (oView.getModel("oVendorListModel").getData().data[i].isSelect == true) {
                        aSelData.push({
                            "BUSINESS_PARTNER_NUMBER": oView.getModel("oVendorListModel").getData().data[i].BUSINESS_PARTNER_NUMBER,
                            "ID": oView.getModel("oVendorListModel").getData().data[i].ID
                        })
                    }
                }

                if (aSelData.length > 0) {
                    // this.fnLoadSME();
                    var temp = {
                        "smeEmail": "",
                        "smeEmaile": "None",
                        "smeEmailm": "",
                        "Commentse": "None",
                        "Commentsm": "",
                        "Comments": ""
                    }
                    var oJsonListSME = new sap.ui.model.json.JSONModel();
                    oJsonListSME.setData(temp);
                    oView.setModel(oJsonListSME, "JMSMESel")
                    if (!this.oBPSendToSME) {
                        this.oBPSendToSME = sap.ui.xmlfragment(
                            "ns.BuyerRegistration.fragments.SMEList", this);
                        oView.addDependent(this.oBPSendToSME);
                    }
                    this.oBPSendToSME.open();
                } else {
                    sap.m.MessageToast.show(oi18n.getProperty("PlSelAtLeastOneRec"));
                }

            },
            fnLiveChangeSME: function () {
                oView.getModel("JMSMESel").getData().smeEmaile = "None";
                oView.getModel("JMSMESel").getData().smeEmailm = "";
                oView.getModel("JMSMESel").refresh();
            },
            fnLiveChangeCmntTxtArea: function () {
                oView.getModel("JMSMESel").getData().Commentse = "None";
                oView.getModel("JMSMESel").getData().Commentsm = "";
                oView.getModel("JMSMESel").refresh();
            },

            fnCloseSME: function () {
                this.oBPSendToSME.close();
            },

            fnSendToGBS: function () {
                if (!oView.getModel("JMSMESel").getData().smeEmail || !oView.getModel("JMSMESel").getData().Comments) {
                    if (!oView.getModel("JMSMESel").getData().smeEmail) {
                        oView.getModel("JMSMESel").getData().smeEmaile = "Error";
                        oView.getModel("JMSMESel").getData().smeEmailm = oi18n.getProperty("EnterSMEEmail");
                        oView.getModel("JMSMESel").refresh();
                    }
                    if (!oView.getModel("JMSMESel").getData().Comments) {
                        oView.getModel("JMSMESel").getData().Commentse = "Error";
                        oView.getModel("JMSMESel").getData().Commentsm = oi18n.getProperty("provideComments");
                        oView.getModel("JMSMESel").refresh();
                    }
                }
                else {
                    this.oBPSendToSME.close();

                    MessageBox.confirm(oi18n.getProperty("SMEConfirm") + oView.getModel("JMSMESel").getData().smeEmail, {
                        icon: MessageBox.Icon.Confirmation,
                        title: "Confirmation",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (oAction) {
                            if (oAction == "YES") {
                                var aSelData = [];
                                for (var i = 0; i < oView.getModel("oVendorListModel").getData().data.length; i++) {
                                    if (oView.getModel("oVendorListModel").getData().data[i].isSelect == true) {
                                        aSelData.push(oView.getModel("oVendorListModel").getData().data[i])
                                    }
                                }
                                var vBuyer = "", vBuyerEmail = "";
                                if (oView.getModel("oConfigMdl").getData().usrData) {
                                    vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;
                                    //  vBuyerEmail = oView.getModel("oConfigMdl").getData().usrData.email;
                                }

                                oBusyDilog.open();
                                var oPayload = {
                                    "bpRequestScope": {
                                        "bpRequestScopeAddlDetails": {
                                        },
                                        "isNew": false,
                                        "isDuplicatesFound": true,
                                        "buyerName": vBuyer
                                        //  "companyCode": "0001",
                                        //  "corporationName": "Jabil Corp",
                                        //  "purchasingOrg": "PUR01"
                                    },
                                    "bpSearch": {
                                        "searchCriteria": JSON.stringify(oView.getModel("JMSearchFilter").getData()),
                                        "searchId": "",
                                        "selectedResults": JSON.stringify(aSelData)
                                    },
                                    "status": "In Progress",
                                    "userCreated": "Shanath Shetty",
                                }
                                var oModel = new JSONModel();
                                var sUrl, vQuery;
                                sUrl = "/nsBuyerRegistration/plcm_portal_services/case/createBP";
                                vQuery = "POST";
                                oModel.loadData(sUrl, JSON.stringify(oPayload), true, vQuery, false, true, {
                                    "Content-Type": "application/json"
                                });
                                oModel.attachRequestCompleted(function (oEvent) {
                                    if (oEvent.getParameter("success")) {
                                        var oModelWf = new JSONModel();
                                        var aSelData = [];
                                        for (var i = 0; i < oView.getModel("oVendorListModel").getData().data.length; i++) {
                                            if (oView.getModel("oVendorListModel").getData().data[i].isSelect == true) {
                                                aSelData.push(oView.getModel("oVendorListModel").getData().data[i])
                                                //  aSelData[i].isSelect = false;
                                            }
                                        }
                                        for (var i = 0; i < aSelData.length; i++) {
                                            aSelData[i].isSelect = false;
                                        }
                                        var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/trigger";
                                        that.caseId = oEvent.getSource().getData().caseId;
                                        var vBuyer = "", vBuyerEmail = "";
                                        if (oView.getModel("oConfigMdl").getData().usrData) {
                                            vBuyer = oView.getModel("oConfigMdl").getData().usrData.givenName;
                                            vBuyerEmail = oView.getModel("oConfigMdl").getData().usrData.email;
                                        }
                                        var oPayload = {
                                            "context": {
                                                "caseId": oEvent.getSource().getData().caseId,
                                                "isNew": false,
                                                "isDplicatesFound": true,
                                                "buyerName": vBuyer,
                                                "buyerTelephone": "",
                                                "buyerEmailid": vBuyerEmail,
                                                "smeEmail": oView.getModel("JMSMESel").getData().smeEmail,
                                                "duplicatesBuyerComments": oView.getModel("JMSMESel").getData().Comments,
                                                "bpSearchParams": oView.getModel("JMSearchFilter").getData(),
                                                "bpSelectedResults": aSelData
                                            },
                                            "definitionId": "partner_onboarding_main"
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
                                                temp.Message = oi18n.getProperty("BPCGBSSuccessMessageExt");
                                                var oJosnMessage = new sap.ui.model.json.JSONModel();
                                                oJosnMessage.setData(temp);
                                                oView.setModel(oJosnMessage,
                                                    "JMMessageData");
                                                if (!that.oBPSuccess) {
                                                    that.oBPSuccess = sap.ui.xmlfragment(
                                                        "ns.BuyerRegistration.fragments.CreateSuccess", that);
                                                    oView.addDependent(that.oBPSuccess);
                                                }
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
            fnChangeFirstName1: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 30) {
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
            fnChangeFirstName2: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 30) {
                    oView.getModel("JMBPCreate").getData().requestorCOINamee = "Error";
                    oView.getModel("JMBPCreate").getData().requestorCOINamem = oi18n.getProperty("BPCMaxLengthExceeds");;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().requestorCOINamee == "Error") {
                        oView.getModel("JMBPCreate").getData().requestorCOINamee = "None";
                        oView.getModel("JMBPCreate").getData().requestorCOINamem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnChangeLastName1: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 30) {
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
                if (vLength > 35) {
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
            fnLiveChangeAdditionalInfo: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 400) {
                    oView.getModel("JMBPCreate").getData().additionalInformatione = "Error";
                    oView.getModel("JMBPCreate").getData().additionalInformationm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().additionalInformatione == "Error") {
                        oView.getModel("JMBPCreate").getData().additionalInformatione = "None";
                        oView.getModel("JMBPCreate").getData().additionalInformationm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },

            fnChangeContactNumber1: function (oEvent) {
                var numRegex = /^[1-9]\d*$/;
                var val = oEvent.getSource().getValue();
                var vLength = oEvent.getParameter("value").length
                if (vLength > 30) {
                    oView.getModel("JMBPCreate").getData().altPhoneNumbere = "Error";
                    oView.getModel("JMBPCreate").getData().altPhoneNumberm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else if (!numRegex.test(oEvent.getSource().getValue())) {
                    oEvent.getSource().setValue(oEvent.getSource().getValue().replace(/\D+/g, ''));

                }
                else {
                    if (oView.getModel("JMBPCreate").getData().altPhoneNumbere == "Error") {
                        oView.getModel("JMBPCreate").getData().altPhoneNumbere = "None";
                        oView.getModel("JMBPCreate").getData().altPhoneNumberm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }

            },
            fnChangeContactNumber2: function (oEvent) {
                var vLength = oEvent.getParameter("value").length
                if (vLength > 30) {
                    oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumbere = "Error";
                    oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumberm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                }
                else {
                    if (oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumbere == "Error") {
                        oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumbere = "None";
                        oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumberm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnValidateEmailDomain: function (email) {
                var vStat;
                if (email) {
                    if (email.toUpperCase() == "NA@JABIL.COM") {
                        vStat = "Valid";
                        return vStat;
                    }
                    var domain = email.substring(email.lastIndexOf("@") + 1);
                    var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/email/validations/" + domain;
                    $.ajax({
                        url: sUrl,
                        type: 'GET',
                        async: false,
                        success: function (data) {
                            vStat = JSON.parse(data).response;
                        }, error: {}

                    })
                    return vStat;
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
                    //  var vResonse = this.fnValidateEmailDomain(email);
                    var vResonse = "Valid"
                    if (vResonse == "Invalid") {
                        oView.getModel("JMBPCreate").getData().altEmaile = "Error";
                        oView.getModel("JMBPCreate").getData().altEmailm = oi18n.getProperty("BPCInvalidEmail");
                        oView.getModel("JMBPCreate").refresh();
                    } else {
                        oView.getModel("JMBPCreate").getData().altEmaile = "None";
                        oView.getModel("JMBPCreate").getData().altEmailm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }

                }
                if (vLength == 0) {
                    oView.getModel("JMBPCreate").getData().altEmaile = "None";
                    oView.getModel("JMBPCreate").getData().altEmailm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnChangeEmailID2: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                var email = oView.getModel("JMBPCreate").getData().requestorCOIEmail;
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (!email.match(mailregex)) {
                    oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "Error";
                    oView.getModel("JMBPCreate").getData().requestorCOIEmailm = oi18n.getProperty("BPCInvalidEmail");
                    oView.getModel("JMBPCreate").refresh();
                } else if (vLength > 241) {
                    oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "Error";
                    oView.getModel("JMBPCreate").getData().requestorCOIEmailm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                }
                else {
                    //    var vResonse = this.fnValidateEmailDomain(email);
                    var domain = email.substring(email.lastIndexOf("@") + 1);
                    if (domain.toUpperCase() != "JABIL.COM") {
                        oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "Error";
                        oView.getModel("JMBPCreate").getData().requestorCOIEmailm = oi18n.getProperty("pleaseEnterJabilEmail");
                        oView.getModel("JMBPCreate").refresh();
                        return;
                    }
                    var vResonse = "Valid"
                    if (vResonse == "Invalid") {
                        oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "Error";
                        oView.getModel("JMBPCreate").getData().requestorCOIEmailm = oi18n.getProperty("BPCInvalidEmail");
                        oView.getModel("JMBPCreate").refresh();
                    } else {
                        oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "None";
                        oView.getModel("JMBPCreate").getData().requestorCOIEmailm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }

                }
                if (vLength == 0) {
                    oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "None";
                    oView.getModel("JMBPCreate").getData().requestorCOIEmailm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },

            fnLiveChangeSuppClass: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 255) {
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
                if (vLength > 255) {
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
                if (vLength > 71) {
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
                if (vLength > 71) {
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
                if (oView.getModel("JMBPCreate").getData().purchasingOrgm == oi18n.getProperty("BPCMandatoryValidationPOrg")) {
                    oView.getModel("JMBPCreate").getData().purchasingOrge = "None";
                    oView.getModel("JMBPCreate").getData().purchasingOrgm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().workCellm == oi18n.getProperty("BPCMandatoryValidationWorkCell")) {
                    oView.getModel("JMBPCreate").getData().workCelle = "None";
                    oView.getModel("JMBPCreate").getData().workCellm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().firstNamem == oi18n.getProperty("BPCMandatoryValidationFName")) {
                    oView.getModel("JMBPCreate").getData().firstNamee = "None";
                    oView.getModel("JMBPCreate").getData().firstNamem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().lastNamem == oi18n.getProperty("BPCMandatoryValidationLastName")) {
                    oView.getModel("JMBPCreate").getData().lastNamee = "None";
                    oView.getModel("JMBPCreate").getData().lastNamem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().emailm == oi18n.getProperty("PleaseProvideEmail")) {
                    oView.getModel("JMBPCreate").getData().emaile = "None";
                    oView.getModel("JMBPCreate").getData().emailm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().telephonem == oi18n.getProperty("BPCMandatoryValidationTeplephone")) {
                    oView.getModel("JMBPCreate").getData().telephonee = "None";
                    oView.getModel("JMBPCreate").getData().telephonem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().contactMobilePhonem == oi18n.getProperty("BPCMandatoryValidationTeplephoneMob")) {
                    oView.getModel("JMBPCreate").getData().contactMobilePhonee = "None";
                    oView.getModel("JMBPCreate").getData().contactMobilePhonem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().contactCountryCodem == oi18n.getProperty("BPCEnterCountryCode")) {
                    oView.getModel("JMBPCreate").getData().contactCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().contactCountryCodem = "";
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
                if (oView.getModel("JMBPCreate").getData().requestorCOIEmailm == oi18n.getProperty("PleaseProvideAltEmail")) {
                    oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "None";
                    oView.getModel("JMBPCreate").getData().requestorCOIEmailm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().requestorCOINamem == oi18n.getProperty("BPCMandatoryValidationAltFname")) {
                    oView.getModel("JMBPCreate").getData().requestorCOINamee = "None";
                    oView.getModel("JMBPCreate").getData().requestorCOINamem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumberm == oi18n.getProperty("BPCMandatoryValidationAltPhoneNum")) {
                    oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumbere = "None";
                    oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumberm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().additionalInformationm == oi18n.getProperty("pleaseEnterCOIReason")) {
                    oView.getModel("JMBPCreate").getData().additionalInformatione = "None";
                    oView.getModel("JMBPCreate").getData().additionalInformationm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().altContactCountryCodem == oi18n.getProperty("BPCEnterCountryCode1")) {
                    oView.getModel("JMBPCreate").getData().altContactCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().altContactCountryCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().mobileCountryCodem == oi18n.getProperty("BPCEnterCountryCode")) {
                    oView.getModel("JMBPCreate").getData().mobileCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().mobileCountryCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamem == oi18n.getProperty("pleaseEnterCustDirSuppName")) {
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee = "None";
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierContractm == oi18n.getProperty("pleaseEnterCustDirContact")) {
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte = "None";
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierContractm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().materialGroupm == oi18n.getProperty("pleaseProvideMaterialGroup")) {
                    oView.getModel("JMBPCreate").getData().materialGroupe = "None";
                    oView.getModel("JMBPCreate").getData().materialGroupm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                oView.getModel("JMBPCreate").getData().conflicte = "None";
                oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicatorse = "None";
                oView.getModel("JMBPCreate").getData().oneTimePurchaseSupplierIndicatorse = "None";
                oView.getModel("JMBPCreate").getData().isExclCiscoGhube = "None";
                oView.getModel("JMBPCreate").getData().requestorConflictOfInterestse = "None";
                oView.getModel("JMBPCreate").refresh();
            },
            fnLiveChangeIncotermLoc: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 200) {
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
            fnNextPage: function () {
                oView.getModel("oVendorListModel").getData().currentPage = oView.getModel("oVendorListModel").getData().currentPage + 1;
                this.fnLoadPartnerData();
            },
            fnPreviousPage: function () {
                oView.getModel("oVendorListModel").getData().currentPage = oView.getModel("oVendorListModel").getData().currentPage - 1;
                this.fnLoadPartnerData();
            },

            fnLiveChangeWorkCell: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                var vLength = oEvent.getParameter("value").length
                if (vLength > 200) {
                    oView.getModel("JMBPCreate").getData().workCelle = "Error";
                    oView.getModel("JMBPCreate").getData().workCellm = oi18n.getProperty("BPCMaxLengthExceeds");;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().workCelle == "Error") {
                        oView.getModel("JMBPCreate").getData().workCelle = "None";
                        oView.getModel("JMBPCreate").getData().workCellm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeProduct: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 40) {
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
                if (oView.getModel("JMBPCreate").getData().conflictOfInterests == 1) {
                    oView.getModel("JMBPCreate").getData().CoIFields = true;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    oView.getModel("JMBPCreate").getData().CoIFields = false;
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().additionalInformatione == "Error") {
                    oView.getModel("JMBPCreate").getData().additionalInformatione = "None";
                    oView.getModel("JMBPCreate").getData().additionalInformationm = "";

                }
                oView.getModel("JMBPCreate").getData().conflicte = "None";
                oView.getModel("JMBPCreate").getData().additionalInformation = "";
                oView.getModel("JMBPCreate").refresh();
            },
            fnAddBuyerAttachment: function () {
                if (!this.oBuyerAttachment) {
                    this.oBuyerAttachment = sap.ui.xmlfragment(
                        "ns.BuyerRegistration.fragments.BuyerAttachment", this);
                    oView.addDependent(this.oBuyerAttachment);
                }
                oView.getModel("JMBPCreate").getData().attachmentDesc = "";
                oView.getModel("JMBPCreate").getData().attachmentDesce = "None";
                oView.getModel("JMBPCreate").getData().attachmentDescm = "";
                oView.getModel("JMBPCreate").getData().attachmentFilee = "None";
                oView.getModel("JMBPCreate").getData().attachmentFilem = "";
                oView.getModel("JMBPCreate").getData().attachmentFile = "";
                oView.getModel("JMBPCreate").refresh();
                this.oBuyerAttachment.open();
            },
            fnCloseBuyerAttchment: function () {
                this.oBuyerAttachment.close();
            },
            fnSubmitUpload: function () {
                var vError = false;
                if (!oView.getModel("JMBPCreate").getData().attachmentDesc) {
                    vError = true;
                    oView.getModel("JMBPCreate").getData().attachmentDesce = "Error";
                    oView.getModel("JMBPCreate").getData().attachmentDescm = oi18n.getProperty("BPCEnterDesc");
                    oView.getModel("JMBPCreate").refresh();
                }
                if (!oView.getModel("JMBPCreate").getData().attachmentFile) {
                    vError = true;
                    oView.getModel("JMBPCreate").getData().attachmentFilee = "Error";
                    oView.getModel("JMBPCreate").getData().attachmentFilem = oi18n.getProperty("BPCEnterFile");
                    oView.getModel("JMBPCreate").refresh();
                }

                if (vError == false) {
                    var fileUpload = sap.ui.getCore().byId("id_BuyerAttachment"),
                        domRef = fileUpload.getFocusDomRef(),
                        // @ts-ignore
                        file = domRef.files[0];
                    var vDocId = Math.random() * 10000000000000000;
                    vDocId = vDocId.toString();

                    var fileSizeInBytes = Number(file.size / 1024);

                    if (fileSizeInBytes > 1024) {
                        fileSizeInBytes = fileSizeInBytes / 1024;
                        fileSizeInBytes = fileSizeInBytes.toFixed(1);

                        fileSizeInBytes = fileSizeInBytes.toString() + " MB"
                    } else {
                        fileSizeInBytes = fileSizeInBytes.toFixed(1);
                        fileSizeInBytes = fileSizeInBytes.toString() + " kB"
                    }

                    var oAttachData = {
                        "fileExt": file.name.split(".")[1],
                        "name": file.name,
                        "dmsDocumentId": "New",
                        "dmsFolderId": vDocId,
                        "fileSize": fileSizeInBytes,
                        "Local": true,
                        "file": file,
                        "Desc": oView.getModel("JMBPCreate").getData().attachmentDesc
                    };

                    that.getView().getModel("oAttachmentList").getData().buyerAttachment.push(oAttachData);
                    that.getView().getModel("oAttachmentList").refresh(true);
                    this.oBuyerAttachment.close();
                }

            },
            fnOnFileUpload: function () {
                oView.getModel("JMBPCreate").getData().attachmentFilee = "None";
                oView.getModel("JMBPCreate").getData().attachmentFilem = "";
                oView.getModel("JMBPCreate").refresh();
            },
            fnLiveChangeDesc: function () {
                oView.getModel("JMBPCreate").getData().attachmentDesce = "None";
                oView.getModel("JMBPCreate").getData().attachmentDescm = "";
                oView.getModel("JMBPCreate").refresh();
            },
            // @ts-ignore
            fnFinalFileUpload: function (vCaseId) {
                that = this;
                var oBusyDilogFile = new BusyDialog({
                    text: oi18n.getProperty("BusyTxtFileUpload") //initialize Busy Dialog
                });
                var aFileData = this.getView().getModel("oAttachmentList").getData().buyerAttachment;
                for (var i = 0; i < aFileData.length; i++) {
                    if (aFileData[i].Local) {
                        if (aFileData[i].Local == true) {
                            oBusyDilogFile.open();
                            var oFormData = new FormData(),
                                // @ts-ignore
                                file = aFileData[i].file;
                            oFormData.append("file", file);
                            oFormData.append("name", file.name);
                            //   oFormData.append("reminderDays", 5);

                            oFormData.append("folderName", vCaseId);
                            oFormData.append("docDescription", aFileData[i].Desc);
                            oFormData.append("requestId", vCaseId);
                            oFormData.append("docInSection", "companyInfo");
                            oFormData.append("fileExt", file.name.split(".")[1]);
                            oFormData.append("type", "application/octet-stream");
                            oFormData.append("overwriteFlag", false);

                            oFormData.append("addedBy", oView.getModel("oConfigMdl").getData().usrData.givenName);

                            var sUrl = "/nsBuyerRegistration/plcm_portal_services/document/upload";
                            // @ts-ignore
                            $.ajax({
                                url: sUrl,
                                data: oFormData,
                                contentType: false,
                                accept: '*/*',
                                type: 'POST',
                                processData: false,
                                success: function (data) {
                                    oBusyDilogFile.close();
                                },
                                async: false,
                                error: function (data) {
                                    oBusyDilogFile.close();
                                }
                            });
                        }
                    }
                }
            },
            // @ts-ignore
            fnOnCancelAttachment: function (oEvt) {
                this.getView().getModel("oAttachmentList").refresh(true);
                var name = oEvt.getSource().getParent().oParent.getItems()[0].mAggregations.items[1].mAggregations.items[0].getProperty("text");
                var isLocal = oEvt.getSource().getBindingContext("oAttachmentList").getProperty().Local;
                // @ts-ignore
                var dmsDocId = this.getView().getModel("oAttachmentList").getData().buyerAttachment.filter(function (docId) {
                    return docId.name == name
                })[0].dmsDocumentId;
                if (isLocal == true) {
                    var index = that.getView().getModel("oAttachmentList").getData().buyerAttachment.findIndex(function (docId) { return docId.name == name });
                    that.getView().getModel("oAttachmentList").getData().buyerAttachment.splice(index, 1);
                    that.getView().getModel("oAttachmentList").refresh(true);
                } else {
                    var deletedBy = oView.getModel("oConfigMdl").getData().usrData.givenName;

                    // var _arrayTitle= this._fnGetUploaderId(fileUploadId);
                    var sUrl = "/nsBuyerRegistration/plcm_portal_services/document/deleteByDmsDocumentId/" + dmsDocId + "/" + deletedBy;
                    $.ajax({
                        url: sUrl,
                        contentType: false,
                        accept: '*/*',
                        type: 'DELETE',
                        processData: false,
                        success: function () {
                            var index = that.getView().getModel("oAttachmentList").getData().buyerAttachment.findIndex(function (docId) { return docId.name == name });
                            that.getView().getModel("oAttachmentList").getData().buyerAttachment.splice(index, 1);
                            that.getView().getModel("oAttachmentList").refresh(true);
                        },
                        error: function (data) {
                            var eMsg = data.responseText
                            MessageBox.show(eMsg, {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n.getProperty("Error")
                            });

                        }
                    });
                }

            },

            fnOnDownlAttachment: function (oEvt) {
                this.getView().getModel("oAttachmentList").refresh(true);
                var name = oEvt.getSource().getParent().oParent.getItems()[0].mAggregations.items[1].mAggregations.items[0].getProperty("text"),
                    _arrayTitle = oEvt.oSource.oParent.oParent.oParent.oParent.mBindingInfos.items.path.split("/0/")[1];
                // @ts-ignore
                var isLocal = oEvt.getSource().getBindingContext("oAttachmentList").getProperty().Local;
                var vFile = oEvt.getSource().getBindingContext("oAttachmentList").getProperty().file;
                var dmsDocId = this.getView().getModel("oAttachmentList").getData().buyerAttachment.filter(function (docId) {
                    return docId.name == name
                })[0].dmsDocumentId;
                if (isLocal == true) {
                    var a = document.createElement('a');
                    var url = window.URL.createObjectURL(vFile);
                    a.href = url;
                    a.download = name;
                    document.body.append(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                } else {
                    //var _arrayTitle= this._fnGetUploaderId(fileUploadId);
                    var sUrl = "/nsBuyerRegistration/plcm_portal_services/document/download/" + dmsDocId;
                    // @ts-ignore
                    $.ajax({
                        url: sUrl,
                        //   contentType: false,
                        //   accept:'*/*',
                        //   localUri: "/Downloads",
                        type: 'GET',
                        xhrFields: {
                            responseType: 'blob'
                        },
                        //   processData: false,
                        success: function (data) {
                            var a = document.createElement('a');
                            var url = window.URL.createObjectURL(data);
                            a.href = url;
                            a.download = name;
                            document.body.append(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);

                        },
                        error: function () {
                            var eMsg = data.responseText
                            MessageBox.show(eMsg, {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n.getProperty("Error")
                            });

                        }
                    });
                }


            },
            _fnReadDocumentList1: function (caseId, that) {
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/document/findByRequestId/" + caseId;
                $.ajax({
                    url: sUrl,
                    type: 'GET',
                    success: function (data) {

                        $.each(data, function (index, value) {
                            if (value.docInSection == "companyInfo") {
                                that.getView().getModel("oAttachmentList").getData().buyerAttachment.push(value);
                            }
                        });
                        that.getView().getModel("oAttachmentList").refresh();
                    },
                    error: function (data) {
                        var eMsg = data.responseText
                        MessageBox.show(eMsg, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n.getProperty("Error")
                        });

                    }
                });


            },
            fnOnDownlAttachment1: function (oEvt) {
                this.getView().getModel("oAttachmentList").refresh(true);
                var name = oEvt.getSource().getParent().oParent.getItems()[0].mAggregations.items[1].mAggregations.items[0].getProperty("text"),
                    _arrayTitle = oEvt.oSource.oParent.oParent.oParent.oParent.mBindingInfos.items.path.split("/0/")[1];
                // @ts-ignore
                var dmsDocId = this.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).filter(function (docId) {
                    return docId.name == name
                })[0].dmsDocumentId;
                //var _arrayTitle= this._fnGetUploaderId(fileUploadId);
                var sUrl = "/comjabilsurveyform/plcm_portal_services/document/download/" + dmsDocId;
                // @ts-ignore
                $.ajax({
                    url: sUrl,
                    //   contentType: false,
                    //   accept:'*/*',
                    //   localUri: "/Downloads",
                    type: 'GET',
                    xhrFields: {
                        responseType: 'blob'
                    },
                    //   processData: false,
                    success: function (data) {
                        var a = document.createElement('a');
                        var url = window.URL.createObjectURL(data);
                        a.href = url;
                        a.download = name;
                        document.body.append(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);

                    },
                    error: function () {
                        var eMsg = data.responseText
                        MessageBox.show(eMsg, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n.getProperty("Error")
                        });

                    }
                });

            },
            _fnReadDocumentList: function (caseId, that) {
                that.getView().getModel("oAttachmentList").setProperty("/buyerAttachment", []);
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/document/findByRequestId/" + caseId;
                $.ajax({
                    url: sUrl,

                    type: 'GET',
                    success: function (data) {

                        $.each(data, function (index, value) {
                            that.getView().getModel("oAttachmentList").getData().buyerAttachment.push(value);
                        });

                        that.getView().getModel("oAttachmentList").refresh();
                    },
                    error: function (data) {
                        var eMsg = data.responseText
                        MessageBox.show(eMsg, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n.getProperty("Error")
                        });

                    }
                });

            },
            fnChangeAttachmentVis: function () {

                if (oView.getModel("JMBPCreate").getData().addlSurveyForSuppliers == 0) {
                    oView.getModel("JMBPCreate").getData().buyerAttachmentVis = true;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    oView.getModel("JMBPCreate").getData().buyerAttachmentVis = false;
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnChangeFirstName: function (oEvent) {
                var vLength = oEvent.getParameter("value").length
                if (vLength > 30) {
                    oView.getModel("JMBPCreate").getData().firstNamee = "Error";
                    oView.getModel("JMBPCreate").getData().firstNamem = oi18n.getProperty("BPCMaxLengthExceeds");;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().firstNamee == "Error") {
                        oView.getModel("JMBPCreate").getData().firstNamee = "None";
                        oView.getModel("JMBPCreate").getData().firstNamem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }

            },
            fnChangeLastName: function (oEvent) {
                var vLength = oEvent.getParameter("value").length
                if (vLength > 40) {
                    oView.getModel("JMBPCreate").getData().lastNamee = "Error";
                    oView.getModel("JMBPCreate").getData().lastNamem = oi18n.getProperty("BPCMaxLengthExceeds");;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().lastNamee == "Error") {
                        oView.getModel("JMBPCreate").getData().lastNamee = "None";
                        oView.getModel("JMBPCreate").getData().lastNamem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },


            fnChangeEmailID: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                var email = oView.getModel("JMBPCreate").getData().email;
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (!email.match(mailregex)) {
                    oView.getModel("JMBPCreate").getData().emaile = "Error";
                    oView.getModel("JMBPCreate").getData().emailm = oi18n.getProperty("BPCInvalidEmail");
                    oView.getModel("JMBPCreate").refresh();
                } else if (vLength > 241) {
                    oView.getModel("JMBPCreate").getData().emaile = "Error";
                    oView.getModel("JMBPCreate").getData().emailm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                }
                else {
                    //  var vResonse = this.fnValidateEmailDomain(email);
                    var vResonse = "Valid"
                    if (vResonse == "Invalid") {
                        oView.getModel("JMBPCreate").getData().emaile = "Error";
                        oView.getModel("JMBPCreate").getData().emailm = oi18n.getProperty("BPCInvalidEmail");
                        oView.getModel("JMBPCreate").refresh();
                    } else {
                        oView.getModel("JMBPCreate").getData().emaile = "None";
                        oView.getModel("JMBPCreate").getData().emailm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }

                if (vLength == 0) {
                    oView.getModel("JMBPCreate").getData().emaile = "None";
                    oView.getModel("JMBPCreate").getData().emailm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeCountryCode: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().contactCountryCodee == "Error") {
                    oView.getModel("JMBPCreate").getData().contactCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().contactCountryCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeTelephone: function (oEvent) {
                var numRegex = /^[1-9]\d*$/;
                var val = oEvent.getSource().getValue();
                var vLength = oEvent.getParameter("value").length
                if (vLength > 40) {
                    oView.getModel("JMBPCreate").getData().telephonee = "Error";
                    oView.getModel("JMBPCreate").getData().telephonem = oi18n.getProperty("BPCMaxLengthExceeds");;
                    oView.getModel("JMBPCreate").refresh();
                } else if (!numRegex.test(oEvent.getSource().getValue())) {
                    // var newval = val.substring(0, val.length - 1);
                    oEvent.getSource().setValue(oEvent.getSource().getValue().replace(/\D+/g, ''));
                }
                else {
                    if (oView.getModel("JMBPCreate").getData().telephonee == "Error") {
                        oView.getModel("JMBPCreate").getData().telephonee = "None";
                        oView.getModel("JMBPCreate").getData().telephonem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeTelephoneMob: function (oEvent) {
                var numRegex = /^[1-9]\d*$/;
                var val = oEvent.getSource().getValue();
                var vLength = oEvent.getParameter("value").length
                if (vLength > 30) {
                    oView.getModel("JMBPCreate").getData().contactMobilePhonee = "Error";
                    oView.getModel("JMBPCreate").getData().contactMobilePhonem = oi18n.getProperty("BPCMaxLengthExceeds");;
                    oView.getModel("JMBPCreate").refresh();
                } else if (!numRegex.test(oEvent.getSource().getValue())) {
                    // var newval = val.substring(0, val.length - 1);
                    oEvent.getSource().setValue(oEvent.getSource().getValue().replace(/\D+/g, ''));

                }
                else {
                    if (oView.getModel("JMBPCreate").getData().contactMobilePhonee == "Error") {
                        oView.getModel("JMBPCreate").getData().contactMobilePhonee = "None";
                        oView.getModel("JMBPCreate").getData().contactMobilePhonem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnCustDirChange: function (oEvent) {
                if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicators == 0) {
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicatorsMan = true;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicatorsMan = false;
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee == "Error") {
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamee = "None";
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustNamem = "";
                }
                if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte == "Error") {
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierContracte = "None";
                    oView.getModel("JMBPCreate").getData().customerDirectedSupplierContractm = "";

                }
                oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicatorse = "None";
                oView.getModel("JMBPCreate").getData().customerDirectedSupplierContract = "";
                oView.getModel("JMBPCreate").getData().customerDirectedSupplierCustName = "";
                oView.getModel("JMBPCreate").refresh();
            },
            fnInputSpaceCheck: function (oEvent) {
                var spaceRegex = /^\s+$/;
                if (spaceRegex.test(oEvent.getSource().getValue())) {
                    oEvent.getSource().setValue("");
                }
            },
            fnChangeOneTimePurchInd: function () {
                oView.getModel("JMBPCreate").getData().oneTimePurchaseSupplierIndicatorse = "None";
                oView.getModel("JMBPCreate").refresh();
            },
            fnChangeCiscoGrub: function () {
                oView.getModel("JMBPCreate").getData().isExclCiscoGhube = "None";
                oView.getModel("JMBPCreate").refresh();
            },

            onAfterRendering: function () {

                // oView.byId("purchaseOrgId").addEventDelegate({
                //     ontap: this.fnLiveChangePurchOrg
                // }, this);
            },

            fnLiveChangePaymentTerms: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().paymentTermse == "Error") {
                    oView.getModel("JMBPCreate").getData().paymentTermse = "None";
                    oView.getModel("JMBPCreate").getData().paymentTermsm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeIncoTerms: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().incoTermse == "Error") {
                    oView.getModel("JMBPCreate").getData().incoTermse = "None";
                    oView.getModel("JMBPCreate").getData().incoTermsm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },



        });
    });

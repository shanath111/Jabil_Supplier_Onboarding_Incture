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
        return Controller.extend("ns.BuyerRegistration.controller.LegalApprove", {
            onInit: function () {
                oView = this.getView();
                that = this;
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt") //initialize Busy Dialog
                });
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("LegalApprove").attachPatternMatched(this.fnEulaRejectRoute, this);
            },


            fnEulaRejectRoute: function (oEvent) {
                var vContext = {
                    "Id": oEvent.getParameter("arguments").Id,
                    "Name": oEvent.getParameter("arguments").Name
                };
                that.fnClearData();
                that.fnSetConfigModel(vContext);
                that.fnLoadLookUpData();
            },
            fnSetConfigModel: function (oContext) {
                oView.getModel("oConfigMdl").getData().closeFullScreenButton = false;
                oView.getModel("oConfigMdl").getData().enterFullScreen = false;
                oView.getModel("oConfigMdl").getData().exitFullScreen = false;
                oView.getModel("oConfigMdl").getData().searchEnable = false;
                oView.getModel("oConfigMdl").getData().screenEditable = false;
                oView.getModel("oConfigMdl").getData().screenEditable = false;
                oView.getModel("oConfigMdl").getData().contextPath = oContext;
                oView.getModel("oConfigMdl").getData().searchAddress = false;
                    oView.getModel("oConfigMdl").getData().CommentsVis = false;

                if (oContext.Name == "COILegal") {
                    oView.getModel("oConfigMdl").getData().EulaCommentsVis = false;
                    oView.getModel("oConfigMdl").getData().ButtonNameReject = "Disqulify";
                    oView.getModel("oConfigMdl").getData().ButtonNameApprove = "Remediate";

                } else {
                    oView.getModel("oConfigMdl").getData().EulaCommentsVis = true;
                    oView.getModel("oConfigMdl").getData().ButtonNameReject = "Reject";
                    oView.getModel("oConfigMdl").getData().ButtonNameApprove = "Approve";
                }
                this.fnLoadTaskDetail(oContext.Id);
                this.fnLoadTaskClaimed(oContext.Id);

                oView.getModel("oConfigMdl").refresh();

            },
            fnLoadTaskClaimed: function (vTaskId) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/WorkboxJavaService/inbox/isClaimed?eventId=" + vTaskId;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
 if (oEvent.getSource().getData().comments) {
                            oView.getModel("oConfigMdl").getData().CommentsVis = true;
                            oView.getModel("oConfigMdl").getData().comments = oEvent.getSource().getData().comments;
                        }
                       if (oEvent.getSource().getData().isTaskCompleted == true) {
                            oView.getModel("oConfigMdl").getData().isClaimed = false;
                        } else {
                            oView.getModel("oConfigMdl").getData().isClaimed = oEvent.getSource().getData().isClaimed;
                        }


                        oView.getModel("oConfigMdl").getData().isTaskCompleted = oEvent.getSource().getData().isTaskCompleted;
                       
                        oView.getModel("oConfigMdl").refresh();
                    }
                });
            },

            fnLoadTaskDetail: function (vTaskId) {
                oBusyDilog.open();
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskContext/" + vTaskId
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {
                        var oBPCreateModelCmnt = new sap.ui.model.json.JSONModel();
                        // oEvent.getSource().getData().eulaComments = oEvent.getSource().getData().COIComments;
                        oBPCreateModelCmnt.setData(oEvent.getSource().getData());
                        oView.setModel(oBPCreateModelCmnt, "JMEulaComments");
                        var oModelLdData = new JSONModel();
                        var sUrl = "/nsBuyerRegistration/plcm_portal_services/case/findById/" + oEvent.getSource().getData().caseId
                        oModelLdData.loadData(sUrl);
                        oModelLdData.attachRequestCompleted(function onCompleted(oEvent) {
                            if (oEvent.getParameter("success")) {
                                var data = oEvent.getSource().getData();
                                var temp;
                                if (data) {
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
                                        "purchasingGroup": data.bpRequestScope.purchasingGroup,
                                        "plant": data.bpRequestScope.plant,

                                        "corporationName": data.bpRequestScope.corporationName,
                                        "corporationName2": data.bpRequestScope.corporationName2,
                                        "corporationName3": data.bpRequestScope.corporationName3,
                                        "corporationName4": data.bpRequestScope.corporationName4,
                                        "workCell": data.bpRequestScope.workCell,
                                        "buyerName": data.bpRequestScope.buyerName,
                                        "incoTerms": data.bpRequestScope.incoTerms,
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
                                        "address3": data.bpRequestScope.bpRequestScopeAddlDetails.address3,
                                        "address4": data.bpRequestScope.bpRequestScopeAddlDetails.address4,
                                        "address5": data.bpRequestScope.bpRequestScopeAddlDetails.address5,
                                        "city": data.bpRequestScope.bpRequestScopeAddlDetails.city,
                                        "state": data.bpRequestScope.bpRequestScopeAddlDetails.state,
                                        "district": data.bpRequestScope.bpRequestScopeAddlDetails.district,
                                        "region": data.bpRequestScope.bpRequestScopeAddlDetails.region,
                                        "postalCode": data.bpRequestScope.bpRequestScopeAddlDetails.postalCode,
                                        "country": data.bpRequestScope.bpRequestScopeAddlDetails.country,
                                        "telephone": data.bpRequestScope.bpRequestScopeAddlDetails.telephone,
                                        "contactMobilePhone": data.bpRequestScope.bpRequestScopeAddlDetails.contactMobilePhone,
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
                                        "altContactFirstName": data.bpRequestScope.bpRequestScopeAddlDetails.altContactFirstName,
                                        "altContactJobTitle": data.bpRequestScope.bpRequestScopeAddlDetails.altContactJobTitle,
                                        "altContactLastName": data.bpRequestScope.bpRequestScopeAddlDetails.altContactLastName,
                                        "altEmail": data.bpRequestScope.bpRequestScopeAddlDetails.altEmail,
                                        "altPhoneNumber": data.bpRequestScope.bpRequestScopeAddlDetails.altPhoneNumber,
                                        "product": data.bpRequestScope.bpRequestScopeAddlDetails.product,
                                        "requestorConflictOfInterest": data.bpRequestScope.bpRequestScopeAddlDetails.requestorConflictOfInterest,
                                        "paymentTerms": data.bpRequestScope.bpRequestScopeAddlDetails.paymentTerms,
                                        "currency": data.bpRequestScope.bpRequestScopeAddlDetails.currency,
                                        "dunsNumber": data.bpRequestScope.bpRequestScopeAddlDetails.dunsNumber,
                                        "incotermNameLocation": data.bpRequestScope.bpRequestScopeAddlDetails.incotermNameLocation,
                                        "newPaymentTerms": data.bpRequestScope.bpRequestScopeAddlDetails.newPaymentTerms,
                                        "isExclCiscoGhub": data.bpRequestScope.bpRequestScopeAddlDetails.isExclCiscoGhub,
                                        "newIncoTermsNameLocation": data.bpRequestScope.bpRequestScopeAddlDetails.newIncoTermsNameLocation,
                                        "newIncoTerms": data.bpRequestScope.bpRequestScopeAddlDetails.newIncoTerms,
                                        "requestorCOIEmail": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIEmail,
                                        "requestorCOIName": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIName,
                                        "requestorCOIPhoneNumber": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIPhoneNumber,
                                        "requestorCOIReason": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIReason,
                                        "addlSurveyForSupplier": data.bpRequestScope.bpRequestScopeAddlDetails.addlSurveyForSupplier
                                    };

                                }
                                if (temp) {
                                    temp.searchAddress = false;
                                    if (temp.isNew == true) {
                                        temp.BPCreate = true;
                                        temp.BPExtend = false;
                                    } else {
                                        temp.BPCreate = false;
                                        temp.BPExtend = true;
                                    }
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

                                    } else {
                                        temp.requestorConflictOfInterests = 0;
                                        temp.reqCoIFields = false;
                                    }
                                    if (temp.isExclCiscoGhub == true) {
                                        temp.isExclCiscoGhub = 0;
                                    } else {
                                        temp.isExclCiscoGhub = 1;

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
                                // that.fnLoadWorkCell(true);
                                // that.fnLoadIncoterms(true);
                                // that.fnLoadCountry(true);
                                that.fnLoadState(temp.country);
                                // that.fnLoadPayemntTerms(true);
                                }
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

            fnLoadLookUpData: function () {
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);
                this.fnLoadCompanyCode();
                this.fnLoadPlant();
                this.fnLoadPurOrg();
                this.fnLoadPurGroup();

                that.fnLoadPayemntTerms();
                that.fnLoadWorkCell();
                that.fnLoadIncoterms();
                that.fnLoadCountry();

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



            fnClearData: function () {
                try {
                    var temp = {
                        "buyerName": oView.getModel("oConfigMdl").getData().usrData.givenName,
                        "rfcv": false,
                        "conflictOfInterests": 0,
                        "representAnotherCompanys": 1,
                        "oneTimePurchaseSupplierIndicators": 1,
                        "customerDirectedSupplierIndicators": 1,
                        "outsideProcessiongSupplierIndicators": 1,
                        "manualAddressOverrideSupplierIndicators": 1,
                        "requestorConflictOfInterests": 1,
                        "reqCoIFields": false,
                        "BPCreate": true,
                        "BPExtend": false,
                        "buyerAttachmentVis": false
                    };

                    var oBPCreateModel = new sap.ui.model.json.JSONModel();
                    oBPCreateModel.setData(temp);
                    oView.setModel(oBPCreateModel, "JMBPCreate");

                    oView.getModel("oConfigMdl").refresh();
                    that.getView().getModel("oAttachmentList").setProperty("/buyerAttachment", []);
                    that.getView().getModel("oAttachmentList").refresh();

                }
                catch (err) {

                }


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

                // var oRoute = localStorage.getItem("InboxRoute");
                // var oCrossAppNavigator = localStorage.getItem("InboxCrossNav");
                // oRoute.navTo("UnifiedInbox");
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
                // var vUrl = location.href;
                // vUrl = vUrl.replace("TaskDetail", "UnifiedInbox");
                // vUrl = "https://jabil-inc--partner-life-cycle-management-supplieronboar3f57b9da.cfapps.us10.hana.ondemand.com/cp.portal/site#inbox-Approve?sap-ui-app-id-hint=oneapp.incture.workbox&/UnifiedInbox"
                // sap.m.URLHelper.redirect(vUrl);
                window.parent.location.reload();

            },
            fnCancelAction: function () {
                //    this.getOwnerComponent().getRouter().navTo("VendorRequest");
            },
            fnOpenBankCommentsApp: function () {
                var temp = {};
                temp.Action = "AP";
                //  temp.Comments = "";
                temp.Commentse = "None";
                temp.Commentsm = "";
                temp.commentsTxt = "Comments (if any)";
                temp.required = false;
                var oJosnComments = new sap.ui.model.json.JSONModel();
                oJosnComments.setData(temp);
                oView.setModel(oJosnComments, "JMAppvrComments");
                if (!this.oBankComments) {
                    this.oBankComments = sap.ui.xmlfragment(
                        "ns.BuyerRegistration.fragments.ApproverComments", this);
                    oView.addDependent(this.oBankComments);
                }

                this.oBankComments.open();
            },
            fnOpenBankCommentsReject: function () {
                var temp = {};
                temp.Action = "RJ";
                //temp.Comments ;
                temp.commentsTxt = "Comments";
                temp.Commentse = "None";
                temp.Commentsm = "";
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
            },
            fnCloseBankComments: function () {
                this.oBankComments.close();
            },
            fnSubmitComments: function () {
                if (oView.getModel("JMAppvrComments").getData().Action == "RJ") {
                    if (oView.getModel("JMAppvrComments").getData().Comments) {
                        this.fnApproveSub("RJ");
                        this.oBankComments.close();
                    } else {
                        oView.getModel("JMAppvrComments").getData().Commentse = "Error";
                        oView.getModel("JMBankComments").getData().Commentsm = oi18n.getText("EnterCommentsTxt");
                        oView.getModel("JMAppvrComments").refresh();
                    }
                } else {
                    this.fnApproveSub("AP");
                    this.oBankComments.close();
                }
            },

            // fnRejectTask: function () {
            //     this.fnApproveSub("RJ");
            // },
            // fnApproveTask: function () {
            //     this.fnApproveSub("AP");
            // },
            fnApproveSub: function (vBtn) {
                var vConfirmTxt, vAprActn, vSccuessTxt;
                if (vBtn == "AP") {
                    vConfirmTxt = oi18n.getProperty("EulaSubConfirm");
                    vSccuessTxt = oi18n.getProperty("EulaSubSuccess");
                    vAprActn = true;
                } else {
                    vConfirmTxt = oi18n.getProperty("EulaRejConfirm");
                    vSccuessTxt = oi18n.getProperty("EulaRejSuccess");
                    vAprActn = false;
                }
                MessageBox.confirm(vConfirmTxt, {
                    icon: MessageBox.Icon.Confirmation,
                    title: "Confirmation",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            oBusyDilog.open();
                            var oModel = new JSONModel();
                            var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskComplete"
                            if (oView.getModel("oConfigMdl").getData().contextPath.Name == "COILegal") {
                                var vCommentsActn;
                                if (vAprActn) {
                                    vCommentsActn = "remediate";
                                } else {
                                    vCommentsActn = "disqualify";
                                }
                                var oPayload = {
                                    "context": {
                                        "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                                        "caseId": oView.getModel("JMEulaComments").getData().caseId,
                                        "coiLegalApproved": vAprActn,
                                        "COIComments": oView.getModel("JMAppvrComments").getData().Comments,
                                        "legal_coi_comment":oView.getModel("JMAppvrComments").getData().Comments
                                    },
                                    "status": "",
                                    "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                    "action": vCommentsActn,
                                    "comments": oView.getModel("JMAppvrComments").getData().Comments
                                }
                            } else if (oView.getModel("oConfigMdl").getData().contextPath.Name == "COIBuyer") {
                                var vActn = "";
                                if (vAprActn) {
                                    vActn = "approved";
                                } else {
                                    vActn = "rejected";
                                }
                                var vCommentsActn;
                                if (vAprActn) {
                                    vCommentsActn = "approve";
                                } else {
                                    vCommentsActn = "reject";
                                }
                                var oPayload = {
                                    "context": {
                                        "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                                        "caseId": oView.getModel("JMEulaComments").getData().caseId,
                                        "buyerActionOnRemediation": vActn,
                                        "buyer_coi_comment":oView.getModel("JMAppvrComments").getData().Comments
                                    },
                                    "status": "",
                                    "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                    "action": vCommentsActn,
                                    "comments": oView.getModel("JMAppvrComments").getData().Comments
                                }
                            }

                            else {
                                var vCommentsActn;
                                if (vAprActn) {
                                    vCommentsActn = "approve";
                                } else {
                                    vCommentsActn = "reject";
                                }
                                var oPayload = {
                                    "context": {
                                        "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                                        "caseId": oView.getModel("JMEulaComments").getData().caseId,
                                        "isBuyerApprovedonEULA": vAprActn,
                                        "buyer_eula_comment":oView.getModel("JMAppvrComments").getData().Comments
                                    },
                                    "status": "",
                                    "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                    "action": vCommentsActn,
                                    "comments": oView.getModel("JMAppvrComments").getData().Comments
                                }
                            }
                            // var oPayload = {
                            //     "taskId": vAction,
                            //     "isBuyerApprovedonEULA": vAprActn
                            // }
                            oModel.loadData(sUrl, JSON.stringify(
                                oPayload
                            ), true, "POST", false, true, {
                                "Content-Type": "application/json"
                            });
                            oModel.attachRequestCompleted(function onCompleted(oEvent) {
                                if (oEvent.getParameter("success")) {
                                    var temp = {};
                                    temp.Message = vSccuessTxt;
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
                    oView.getModel("JMBPCreate").getData().emaile = "None";
                    oView.getModel("JMBPCreate").getData().emailm = "";
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
            fnLiveChangeCmntTxtArea: function () {
                oView.getModel("JMAppvrComments").getData().Commentse = "None";
                oView.getModel("JMAppvrComments").refresh();
            }
        });
    });

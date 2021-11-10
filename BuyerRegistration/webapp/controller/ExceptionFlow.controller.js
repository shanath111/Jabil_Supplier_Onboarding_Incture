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
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, library, formatter, JSONModel, Filter, FilterOperator, MessageBox, BusyDialog, Sorter) {
        "use strict";
        var that, oView, oBusyDilog, oi18n;
        return Controller.extend("ns.BuyerRegistration.controller.ExceptionFlow", {
            onInit: function () {
                oView = this.getView();
                that = this;
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt") //initialize Busy Dialog
                });

                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("ExceptionFlow").attachPatternMatched(this.fnReviewerRouteException, this);
            },
            fnReviewerRouteException: function (oEvent) {
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);
                var vContext = {
                    "Id": oEvent.getParameter("arguments").Id,
                    "Name": oEvent.getParameter("arguments").Name
                };
                //   that.fnClearData();
                that.fnSetConfigModel(vContext);
            },

            fnSetConfigModel: function (oContext) {
                oView.getModel("oConfigMdl").getData().CommentsVis = false;
                if (oContext.Name == "GTS") {
                    oView.getModel("oConfigMdl").getData().LegalVis = false;
                    oView.getModel("oConfigMdl").getData().GTSVis = false;
                    oView.getModel("oConfigMdl").getData().COIVis = false;
                    oView.getModel("oConfigMdl").getData().MitgationVis = false;

                } else if (oContext.Name == "LegalExp") {
                    oView.getModel("oConfigMdl").getData().LegalVis = false;
                    oView.getModel("oConfigMdl").getData().GTSVis = false;
                    oView.getModel("oConfigMdl").getData().COIVis = false;
                    oView.getModel("oConfigMdl").getData().MitgationVis = false;
                } else if (oContext.Name == "COISupp") {
                    oView.getModel("oConfigMdl").getData().LegalVis = false;
                    oView.getModel("oConfigMdl").getData().GTSVis = false;
                    oView.getModel("oConfigMdl").getData().COIVis = false;
                    oView.getModel("oConfigMdl").getData().MitgationVis = true;
                }
                else if (oContext.Name == "COIBuyer") {
                    oView.getModel("oConfigMdl").getData().LegalVis = false;
                    oView.getModel("oConfigMdl").getData().GTSVis = false;
                    oView.getModel("oConfigMdl").getData().COIVis = false;
                    oView.getModel("oConfigMdl").getData().MitgationVis = false;
                }
                oView.getModel("oConfigMdl").getData().contextPath = oContext;
                oView.getModel("oConfigMdl").refresh();
                this.fnLoadTaskDetail(oContext.Id);
                this.fnLoadTaskClaimed(oContext.Id);

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
                        if (oView.getModel("oConfigMdl").getData().isClaimed == false) {
                            oView.getModel("oConfigMdl").getData().defaultEnable = false;
                        }
                        oView.getModel("oConfigMdl").getData().validationMessage = oEvent.getSource().getData().validationMessage;
                        oView.getModel("oConfigMdl").refresh();
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
            fnLoadSurveyFormDetail: function (vCaseId) {
                oBusyDilog.open();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/supplier/read/" + vCaseId;
                var oModel = new JSONModel();
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                    if (oEvent.getParameter("success")) {
                        if (oEvent.getSource().getData().businessPartnerId !== "") {
                            oEvent.getSource().getData().defaultValuesDto.reqPurchasingOrg = oView.getModel("JMBPCreate").getData().purchasingOrg;
                            oEvent.getSource().getData().defaultValuesDto.reqCompanyCode = oView.getModel("JMBPCreate").getData().companyCode;

                            oView.getModel("oDataModel").setData(oEvent.getSource().oData);
                            oView.getModel("oDataModel").refresh();
                            if (oView.getModel("oConfigMdl").getData().contextPath.Name == "Buyer") {
                                if (oEvent.getSource().getData().comInfoDto.isOrderToAddress == true || oEvent.getSource().getData().comInfoDto.isRemitToAddress == true) {
                                    oView.getModel("oConfigMdl").getData().SegmentVisibleP = true;
                                    oView.getModel("oConfigMdl").refresh();
                                } else {
                                    oView.getModel("oConfigMdl").getData().SegmentVisibleP = true;
                                    oView.getModel("oConfigMdl").refresh();
                                }
                            }

                            for (var i = 0; i < oEvent.getSource().getData().comInfoDto.address.length; i++) {
                                if (oEvent.getSource().getData().comInfoDto.address[i].addressInSection == "CompanyInfo-RTA") {
                                    oView.getModel("oConfigMdl").getData().companyInfoInv = oEvent.getSource().getData().comInfoDto.address[i].postal;
                                } else {
                                    oView.getModel("oConfigMdl").getData().companyInfoOrd = oEvent.getSource().getData().comInfoDto.address[i].postal;
                                }
                            }
                            if (oView.getModel("oConfigMdl").getData().contextPath.Name == "GTS") {
                                oView.getModel("oConfigMdl").getData().LegalVis = false;
                                oView.getModel("oConfigMdl").getData().GTSVis = true;
                                oView.getModel("oConfigMdl").getData().COIVis = false;
                            } else if (oView.getModel("oConfigMdl").getData().contextPath.Name == "LegalExp") {
                                oView.getModel("oConfigMdl").getData().LegalVis = true;
                                oView.getModel("oConfigMdl").getData().GTSVis = false;
                                oView.getModel("oConfigMdl").getData().COIVis = false;
                            } else if (oView.getModel("oConfigMdl").getData().contextPath.Name == "COISupp") {
                                oView.getModel("oConfigMdl").getData().LegalVis = false;
                                oView.getModel("oConfigMdl").getData().GTSVis = false;
                                oView.getModel("oConfigMdl").getData().COIVis = true;
                            }
                            else if (oView.getModel("oConfigMdl").getData().contextPath.Name == "COIBuyer") {
                                oView.getModel("oConfigMdl").getData().LegalVis = false;
                                oView.getModel("oConfigMdl").getData().GTSVis = false;
                                oView.getModel("oConfigMdl").getData().COIVis = true;
                            }

                            oView.getModel("oConfigMdl").refresh();
                        }


                        oBusyDilog.close();
                    }
                    else {
                        oBusyDilog.close();
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getProperty("Error")
                        });
                    }

                }
                );

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
            fnLoadPurGroup: function (vBind) {
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


            fnLoadPlant: function (vBind) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/plants";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/Plant", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                        if (vBind == true) {
                            oView.getModel("JMBPCreate").getData().plantd = that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().Plant, oView.getModel("JMBPCreate").getData().plant, "Plant")
                            oView.getModel("JMBPCreate").refresh();
                        }
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

            fnLoadTaskDetail: function (vTaskId) {
                oBusyDilog.open();
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskContext/" + vTaskId
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {
                        var oBPCreateModelCmnt = new sap.ui.model.json.JSONModel();
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

                                        "newIncoTermsNameLocation": data.bpRequestScope.bpRequestScopeAddlDetails.newIncoTermsNameLocation,
                                        "newIncoTerms": data.bpRequestScope.bpRequestScopeAddlDetails.newIncoTerms,
                                        "requestorCOIEmail": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIEmail,
                                        "requestorCOIName": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIName,
                                        "requestorCOIPhoneNumber": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIPhoneNumber,
                                        "requestorCOIReason": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIReason
                                    };

                                }
                                if (temp) {
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
                                        temp.customerDirectedSupplierIndicators = 0;
                                    } else {
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
                                    that.fnLoadCompanyCode(true);
                                    that.fnLoadPlant(true);
                                    that.fnLoadPurOrg(true);
                                    // this.fnLoadPurGroup();
                                    that.fnLoadWorkCell(true);
                                    that.fnLoadIncoterms(true);
                                    that.fnLoadCountry(true);
                                    that.fnLoadState(temp.country);
                                    that.fnLoadPayemntTerms(true);
                                    if (oView.getModel("oConfigMdl").getData().contextPath.Name == "NDARejectLegal") {
                                        that._fnReadDocumentList(temp.caseId, that);
                                    }
                                    if (oView.getModel("oConfigMdl").getData().contextPath.Name == "GBSBank") {
                                        that._fnReadDocumentList1(temp.caseId, that);
                                    }
                                    if (oView.getModel("oConfigMdl").getData().contextPath.Name == "Buyer") {
                                        that.fnLoadPartnerData(temp.caseId);
                                        that.fnLoadValidationDone(temp.caseId);
                                    }

                                    that.fnLoadSurveyFormDetail(temp.caseId, that);

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

            fnOpenBankCommentsApp: function () {

                var vError = false, vErrorTxt = "", orderBpNumber = "", invoiceBpNumber = "";

                if (vError == false) {
                    // var oPayloadSupp = that.getView().getModel("oDataModel").getData();
                    // oPayloadSupp.shippingInfoDto.comCode = oPayloadSupp.defaultValuesDto.reqCompanyCode;
                    // oPayloadSupp.shippingInfoDto.purchasingOrg = oPayloadSupp.defaultValuesDto.reqPurchasingOrg;
                    // oPayloadSupp.defaultValuesDto.orderAddrBpNumber = orderBpNumber.replace(/^0+/, '');
                    // oPayloadSupp.defaultValuesDto.invoiceAddrBpNumber = invoiceBpNumber.replace(/^0+/, '');
                    // oPayloadSupp.userUpdated = oView.getModel("oConfigMdl").getData().usrData.givenName
                    // var sUrl1 = "/nsBuyerRegistration/plcm_portal_services/supplier/update";
                    // var oModelSave = new JSONModel();
                    // oModelSave.loadData(sUrl1, JSON.stringify(oPayloadSupp), true, "PUT", false, true, {
                    //     "Content-Type": "application/json"
                    // });

                    var temp = {};
                    temp.Action = "AP";
                    //  temp.Comments = "";
                    temp.Commentse = "None";
                    temp.required = false;
                    temp.commentsTxt = "Comments (if any)";
                    temp.orderBpNumber = orderBpNumber;
                    temp.invoiceBpNumber = invoiceBpNumber;
                    var oJosnComments = new sap.ui.model.json.JSONModel();
                    oJosnComments.setData(temp);
                    oView.setModel(oJosnComments, "JMAppvrComments");
                    if (oView.getModel("oConfigMdl").getData().contextPath.Name == "COISupp") {
                    this.fnApproveSub(oView.getModel("JMAppvrComments").getData().Action);
                    }
                    else {
                        if (!this.oBankComments) {
                            this.oBankComments = sap.ui.xmlfragment(
                                "ns.BuyerRegistration.fragments.ApproverComments", this);
                            oView.addDependent(this.oBankComments);
                        }

                        this.oBankComments.open();
                    }

                   
                } else {
                    oView.byId("id_SegmentedBtn").setSelectedKey("partnerFunction");
                    oView.getModel("oConfigMdl").getData().buyerData = false;
                    oView.getModel("oConfigMdl").getData().onBoardDet = false;
                    oView.getModel("oConfigMdl").getData().BankDetails = false;
                    oView.getModel("oConfigMdl").getData().PartnerFunctionVis = true;
                    oView.getModel("oConfigMdl").refresh();
                    sap.m.MessageBox.error(vErrorTxt, {
                        icon: sap.m.MessageBox.Icon.Error,
                        title: "Error"
                    });
                }
            },
            fnLiveChangeCmntTxtArea: function () {
                oView.getModel("JMAppvrComments").getData().Commentse = "None";
                oView.getModel("JMAppvrComments").refresh();
            },
            fnOpenBankCommentsReject: function () {
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
            },
            fnMitigate: function () {
                var temp = {};
                temp.Action = "MT";
                //temp.Comments ;
                temp.Commentse = "None";
                temp.required = true;
                temp.Commentsm = "";
                temp.commentsTxt = "Comments";
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
                if (oView.getModel("JMAppvrComments").getData().Action == "RJ" || oView.getModel("JMAppvrComments").getData().Action == "MT") {
                    if (oView.getModel("JMAppvrComments").getData().Comments) {
                        this.fnApproveSub(oView.getModel("JMAppvrComments").getData().Action);
                        this.oBankComments.close();
                    } else {
                        oView.getModel("JMAppvrComments").getData().Commentse = "Error";
                        oView.getModel("JMAppvrComments").getData().Commentsm = oi18n.getProperty("EnterCommentsTxt");
                        oView.getModel("JMAppvrComments").refresh();
                    }
                } else {

                    this.fnApproveSub(oView.getModel("JMAppvrComments").getData().Action);
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
                // MessageBox.confirm(vConfirmTxt, {
                //     icon: MessageBox.Icon.Confirmation,
                //     title: "Confirmation",
                //     actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                //     emphasizedAction: MessageBox.Action.YES,
                //     onClose: function (oAction) {
                //         if (oAction == "YES") {
                oBusyDilog.open();
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/workflow/taskComplete"
                if (oView.getModel("oConfigMdl").getData().contextPath.Name == "GTS") {
                    var vCommentsActn, vContextActn;
                    if (vAprActn) {
                        vCommentsActn = "approve";
                        vContextActn = "approved";
                    } else {
                        vCommentsActn = "reject";
                        vContextActn = "rejected";
                    }
                    var oPayload = {
                        "context": {
                            "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                            "caseId": oView.getModel("JMEulaComments").getData().caseId,
                            "gtsAction": vContextActn
                        },
                        "status": "",
                        "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                        "action": vCommentsActn,
                        "comments": oView.getModel("JMAppvrComments").getData().Comments,
                        "gts_comment": oView.getModel("JMAppvrComments").getData().Comments
                    }
                } else if (oView.getModel("oConfigMdl").getData().contextPath.Name == "LegalExp") {

                    var vCommentsActn, vContextActn;
                    if (vAprActn) {
                        vCommentsActn = "approve";
                        vContextActn = "approved";
                    } else {
                        vCommentsActn = "reject";
                        vContextActn = "rejected";
                    }
                    var oPayload = {
                        "context": {
                            "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                            "caseId": oView.getModel("JMEulaComments").getData().caseId,
                            "legalAction": vContextActn,
                            "legal_exceptional_flow_comment": oView.getModel("JMAppvrComments").getData().Comments
                        },
                        "status": "",
                        "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                        "action": vCommentsActn,
                        "comments": oView.getModel("JMAppvrComments").getData().Comments
                    }
                }
                else if (oView.getModel("oConfigMdl").getData().contextPath.Name == "COISupp") {

                    var vCommentsActn, vContextActn;

                    if (vBtn == "AP") {
                        vContextActn = "approved";
                        vCommentsActn = "approve";
                    } else if (vBtn == "RJ") {
                        vContextActn = "rejected";
                        vCommentsActn = "reject";
                    } else {
                        vContextActn = "mitigation";
                        vCommentsActn = "mitigation";
                    }
                    var oPayload = {
                        "context": {
                            "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                            "caseId": oView.getModel("JMEulaComments").getData().caseId,
                            "legal_action_supplier_coi": vContextActn,
                            "legal_supplier_coi_comment": oView.getModel("JMAppvrComments").getData().Comments
                        },
                        "status": "",
                        "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                        "action": vCommentsActn,
                        "comments": oView.getModel("JMAppvrComments").getData().Comments
                    }
                }
                else if (oView.getModel("oConfigMdl").getData().contextPath.Name == "COIBuyer") {

                    var vCommentsActn, vContextActn;

                    if (vBtn == "AP") {
                        vContextActn = "approved";
                        vCommentsActn = "approve";
                    } else if (vBtn == "RJ") {
                        vContextActn = "rejected";
                        vCommentsActn = "reject";
                    } else {
                        vContextActn = "mitigation";
                        vCommentsActn = "mitigation";
                    }
                    var oPayload = {
                        "context": {
                            "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                            "caseId": oView.getModel("JMEulaComments").getData().caseId,
                            "buyerActionOnSupplierCOI": vContextActn,
                            "buyer_supplier_coi_comment": oView.getModel("JMAppvrComments").getData().Comments
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
                //         }
                //     }

                // });

            },

            fnSegmentButtonChange: function (oEvent) {
                if (oEvent.getParameter('item').getProperty('key') == "BuyerData") {
                    if (oEvent.getParameter('item').getProperty('text') == "Bank Information") {
                        oView.getModel("oConfigMdl").getData().BankDetails = true;
                        oView.getModel("oConfigMdl").getData().buyerData = false;
                    } else {
                        oView.getModel("oConfigMdl").getData().BankDetails = false;
                        oView.getModel("oConfigMdl").getData().buyerData = true;
                    }
                    oView.getModel("oConfigMdl").getData().PartnerFunctionVis = false;
                    oView.getModel("oConfigMdl").getData().onBoardDet = false;
                } else if (oEvent.getParameter('item').getProperty('key') == "OnBoardingDet") {
                    oView.getModel("oConfigMdl").getData().buyerData = false;
                    oView.getModel("oConfigMdl").getData().onBoardDet = true;
                    oView.getModel("oConfigMdl").getData().BankDetails = false;
                    oView.getModel("oConfigMdl").getData().PartnerFunctionVis = false;
                } else {
                    oView.getModel("oConfigMdl").getData().buyerData = false;
                    oView.getModel("oConfigMdl").getData().onBoardDet = false;
                    oView.getModel("oConfigMdl").getData().BankDetails = false;
                    oView.getModel("oConfigMdl").getData().PartnerFunctionVis = true;
                }
                oView.getModel("oConfigMdl").refresh();
            },
            fnValidateSegm: function (oEvent) {
                oView.getModel("JMValidateResult").setData([]);
                oView.getModel("JMValidateResult").refresh();
                if (oEvent.getParameter('item').getProperty('key') == "CentralData") {
                    for (var i = 0; i < that.aCheckData.mdgLogDto.length; i++) {
                        if (that.aCheckData.mdgLogDto[i].businessGroup == "ZVEN") {
                            oView.getModel("JMValidateResult").setData(JSON.parse(that.aCheckData.mdgLogDto[i].responseMessage))
                            oView.getModel("JMValidateResult").refresh();
                            break;
                        }


                    }

                } else if (oEvent.getParameter('item').getProperty('key') == "OrderAddress") {
                    for (var i = 0; i < that.aCheckData.mdgLogDto.length; i++) {
                        if (that.aCheckData.mdgLogDto[i].businessGroup == "Z006") {
                            oView.getModel("JMValidateResult").setData(JSON.parse(that.aCheckData.mdgLogDto[i].responseMessage))
                            oView.getModel("JMValidateResult").refresh();
                            break;
                        }


                    }

                } else {
                    for (var i = 0; i < that.aCheckData.mdgLogDto.length; i++) {
                        if (that.aCheckData.mdgLogDto[i].businessGroup == "Z004") {
                            oView.getModel("JMValidateResult").setData(JSON.parse(that.aCheckData.mdgLogDto[i].responseMessage))
                            oView.getModel("JMValidateResult").refresh();
                            break;
                        }


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
            fnViewDetails: function () {
                var vUrl = window.location.origin + "/comjabilsurveyform/index.html#/VendorSurvey/" + "Display:" + oView.getModel("oConfigMdl").getData().contextPath.Name + "/" + oView.getModel("oConfigMdl").getData().contextPath.Id
                sap.m.URLHelper.redirect(vUrl);
            },
            // @ts-ignore
            fnOnFileUpload: function (oEvt) {
                var oFormData = new FormData(),
                    that = this,
                    fileUpload = this.getView().byId("id_NDADocUpload"),
                    domRef = fileUpload.getFocusDomRef(),
                    // @ts-ignore
                    file = domRef.files[0];


                // @ts-ignore
                jQuery.sap.domById(fileUpload.getId() + "-fu").setAttribute("type", "file");
                // @ts-ignore
                oFormData.append("file", jQuery.sap.domById(fileUpload.getId() + "-fu").files[0]);
                oFormData.append("name", file.name);
                oFormData.append("reminderDays", 5);

                oFormData.append("folderName", oView.getModel("JMEulaComments").getData().caseId);
                oFormData.append("requestId", oView.getModel("JMEulaComments").getData().caseId);
                oFormData.append("docInSection", "NDADocument");
                oFormData.append("fileExt", file.name.split(".")[1]);
                oFormData.append("type", "application/octet-stream");


                oFormData.append("addedBy", oView.getModel("oConfigMdl").getData().usrData.givenName);

                var oAttachData = {

                    "fileExt": file.name.split(".")[1],

                    "name": file.name,
                };

                var _arrayTitle = "NDADocuments";

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
                        oAttachData.dmsDocumentId = data.dmsDocumentId;
                        oAttachData.dmsFolderId = data.dmsFolderId;
                        oAttachData.fileSize = data.fileSize;
                        that.getView().getModel("oAttachmentList").getData().NDADocuments.push(oAttachData);
                        that.getView().getModel("oAttachmentList").refresh(true);
                    },
                    error: function (data) {
                        var eMsg = data.responseText
                        MessageBox.show(eMsg, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Error"
                        });


                    }
                });
            },
            // @ts-ignore
            fnOnCancelAttachment: function (oEvt) {
                this.getView().getModel("oAttachmentList").refresh(true);
                var name = oEvt.getSource().getParent().oParent.getItems()[0].mAggregations.items[1].mAggregations.items[0].getProperty("text");
                // @ts-ignore
                var dmsDocId = this.getView().getModel("oAttachmentList").getData().NDADocuments.filter(function (docId) {
                    return docId.name == name
                })[0].dmsDocumentId;

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
                        var index = that.getView().getModel("oAttachmentList").getData().NDADocuments.findIndex(function (docId) { return docId.name == name });
                        that.getView().getModel("oAttachmentList").getData().NDADocuments.splice(index, 1);
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
            },

            fnOnDownlAttachment: function (oEvt) {
                this.getView().getModel("oAttachmentList").refresh(true);
                var name = oEvt.getSource().getParent().oParent.getItems()[0].mAggregations.items[1].mAggregations.items[0].getProperty("text"),
                    _arrayTitle = oEvt.oSource.oParent.oParent.oParent.oParent.mBindingInfos.items.path.split("/0/")[1];
                // @ts-ignore
                var dmsDocId = this.getView().getModel("oAttachmentList").getData().NDADocuments.filter(function (docId) {
                    return docId.name == name
                })[0].dmsDocumentId;
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

            },
            _fnReadDocumentList1: function (caseId, that) {
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/document/findByRequestId/" + caseId;
                $.ajax({
                    url: sUrl,
                    type: 'GET',
                    success: function (data) {

                        $.each(data, function (index, value) {
                            if (value.docInSection == "bankInfo") {
                                that.getView().getModel("oAttachmentListBank").getData()[0].bankDArray.push(value);
                            }
                        });
                        that.getView().getModel("oAttachmentListBank").refresh();
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
                this.getView().getModel("oAttachmentListBank").refresh(true);
                var name = oEvt.getSource().getParent().oParent.getItems()[0].mAggregations.items[1].mAggregations.items[0].getProperty("text"),
                    _arrayTitle = oEvt.oSource.oParent.oParent.oParent.oParent.mBindingInfos.items.path.split("/0/")[1];
                // @ts-ignore
                var dmsDocId = this.getView().getModel("oAttachmentListBank").getProperty("/0/" + _arrayTitle).filter(function (docId) {
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
                that.getView().getModel("oAttachmentList").setProperty("/NDADocuments", []);
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/document/findByRequestId/" + caseId;
                $.ajax({
                    url: sUrl,

                    type: 'GET',
                    success: function (data) {

                        $.each(data, function (index, value) {
                            that.getView().getModel("oAttachmentList").getData().NDADocuments.push(value);
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
            fnLiveChangeCompCode: function (oEvent) {

                var vSelected = oEvent.getParameter("itemPressed");
                if (vSelected == false) {
                    oEvent.getSource().setValue("");
                }
                if (oView.getModel("JMValidateDefault").getData().reqCompanyCodee == "Error") {
                    oView.getModel("JMValidateDefault").getData().reqCompanyCodee = "None";
                    oView.getModel("JMValidateDefault").getData().reqCompanyCodem = "";
                    oView.getModel("JMValidateDefault").refresh();
                }
            },
            fnLiveChangePurchOrg: function (oEvent) {

                var vSelected = oEvent.getParameter("itemPressed");
                if (vSelected == false) {
                    oEvent.getSource().setValue("");
                }
                if (oView.getModel("JMValidateDefault").getData().reqPurchasingOrge == "Error") {
                    oView.getModel("JMValidateDefault").getData().reqPurchasingOrge = "None";
                    oView.getModel("JMValidateDefault").getData().reqPurchasingOrgm = "";
                    oView.getModel("JMValidateDefault").refresh();
                }
            },
            fnLiveChangGBSRegion: function (oEvent) {

                if (oView.getModel("JMValidateDefault").getData().gbsRegione == "Error") {
                    oView.getModel("JMValidateDefault").getData().gbsRegione = "None";
                    oView.getModel("JMValidateDefault").getData().gbsRegionm = "";
                    oView.getModel("JMValidateDefault").refresh();
                }
            },
            fnLiveChangChangeType: function (oEvent) {


                if (oView.getModel("JMValidateDefault").getData().changeTypee == "Error") {
                    oView.getModel("JMValidateDefault").getData().changeTypee = "None";
                    oView.getModel("JMValidateDefault").getData().changeTypem = "";
                    oView.getModel("JMValidateDefault").refresh();
                }
            },
            fnLiveChangPriority: function (oEvent) {


                if (oView.getModel("JMValidateDefault").getData().prioritye == "Error") {
                    oView.getModel("JMValidateDefault").getData().prioritye = "None";
                    oView.getModel("JMValidateDefault").getData().prioritym = "";
                    oView.getModel("JMValidateDefault").refresh();
                }
            },
            fnChangeSearchTerm: function (oEvent) {
                if (oView.getModel("JMValidateDefault").getData().searchTerm1e == "Error") {
                    oView.getModel("JMValidateDefault").getData().searchTerm1e = "None";
                    oView.getModel("JMValidateDefault").getData().searchTerm1m = "";
                    oView.getModel("JMValidateDefault").refresh();
                }
            },
            fnValidateData: function () {

                var vError = false;

                if (!that.getView().getModel("oDataModel").getData().defaultValuesDto.reqCompanyCode) {
                    oView.getModel("JMValidateDefault").getData().reqCompanyCodee = "Error";
                    oView.getModel("JMValidateDefault").getData().reqCompanyCodem = oi18n.getProperty("BPCMandatoryValidation");
                    vError = true;
                }
                if (!that.getView().getModel("oDataModel").getData().defaultValuesDto.reqPurchasingOrg) {
                    oView.getModel("JMValidateDefault").getData().reqPurchasingOrge = "Error";
                    oView.getModel("JMValidateDefault").getData().reqPurchasingOrgm = oi18n.getProperty("BPCMandatoryValidation");
                    vError = true;
                }
                if (!that.getView().getModel("oDataModel").getData().defaultValuesDto.gbsRegion) {
                    oView.getModel("JMValidateDefault").getData().gbsRegione = "Error";
                    oView.getModel("JMValidateDefault").getData().gbsRegionm = oi18n.getProperty("BPCMandatoryValidation");
                    vError = true;
                }
                if (!that.getView().getModel("oDataModel").getData().defaultValuesDto.changeType) {
                    oView.getModel("JMValidateDefault").getData().changeTypee = "Error";
                    oView.getModel("JMValidateDefault").getData().changeTypem = oi18n.getProperty("BPCMandatoryValidation");
                    vError = true;
                }
                if (!that.getView().getModel("oDataModel").getData().defaultValuesDto.priority) {
                    oView.getModel("JMValidateDefault").getData().prioritye = "Error";
                    oView.getModel("JMValidateDefault").getData().prioritym = oi18n.getProperty("BPCMandatoryValidation");
                    vError = true;
                }
                if (!that.getView().getModel("oDataModel").getData().defaultValuesDto.searchTerm1) {
                    oView.getModel("JMValidateDefault").getData().searchTerm1e = "Error";
                    oView.getModel("JMValidateDefault").getData().searchTerm1m = oi18n.getProperty("BPCMandatoryValidation");
                    vError = true;
                }
                oView.getModel("JMValidateDefault").refresh();
                if (vError == true) {
                    oView.byId("id_SegmentedBtn").setSelectedKey("BuyerData");
                    oView.getModel("oConfigMdl").getData().BankDetails = false;
                    oView.getModel("oConfigMdl").getData().buyerData = true;
                    oView.getModel("oConfigMdl").getData().onBoardDet = false;
                    oView.getModel("oConfigMdl").refresh();
                    return;
                }
                var vError1 = false, vErrorTxt1 = "", orderBpNumber = "", invoiceBpNumber = "";
                var aData = oView.getModel("oVendorListModel").getData();

                if (oView.getModel("oDataModel").getData().comInfoDto.isOrderToAddress == true) {
                    if (oView.getModel("oConfigMdl").getData().orderingAddNew == false) {
                        var vCount = 0;
                        for (var i = 0; i < aData.orderAddressResults.d.results.length; i++) {
                            if (aData.orderAddressResults.d.results[i].isSelect == true) {
                                vCount = vCount + 1;
                                orderBpNumber = aData.orderAddressResults.d.results[i].BUSINESS_PARTNER_NUMBER;
                            }
                        }
                        if (vCount !== 1) {
                            vError1 = true;
                            vErrorTxt1 = vErrorTxt1 + oi18n.getProperty("orderingAddrErrorSel") + "\n";
                        }
                    }
                }
                if (oView.getModel("oDataModel").getData().comInfoDto.isRemitToAddress == true) {
                    if (oView.getModel("oConfigMdl").getData().invoicingAddNew == false) {
                        var vCount = 0;
                        for (var i = 0; i < aData.invoiceAddressResults.d.results.length; i++) {
                            if (aData.invoiceAddressResults.d.results[i].isSelect == true) {
                                vCount = vCount + 1;
                                invoiceBpNumber = aData.invoiceAddressResults.d.results[i].BUSINESS_PARTNER_NUMBER;

                            }
                        }
                        if (vCount !== 1) {
                            vError1 = true;
                            vErrorTxt1 = vErrorTxt1 + oi18n.getProperty("InvoicingAddrErrorSel") + "\n";
                        }
                    }
                }


                if (vError1 == true) {
                    oView.byId("id_SegmentedBtn").setSelectedKey("partnerFunction");
                    oView.getModel("oConfigMdl").getData().buyerData = false;
                    oView.getModel("oConfigMdl").getData().onBoardDet = false;
                    oView.getModel("oConfigMdl").getData().BankDetails = false;
                    oView.getModel("oConfigMdl").getData().PartnerFunctionVis = true;
                    oView.getModel("oConfigMdl").refresh();
                    sap.m.MessageBox.error(vErrorTxt1, {
                        icon: sap.m.MessageBox.Icon.Error,
                        title: "Error"
                    });
                    return;
                }


                oBusyDilog.open();

                var oPayloadSupp = that.getView().getModel("oDataModel").getData();
                oPayloadSupp.shippingInfoDto.comCode = oPayloadSupp.defaultValuesDto.reqCompanyCode;
                oPayloadSupp.shippingInfoDto.purchasingOrg = oPayloadSupp.defaultValuesDto.reqPurchasingOrg;
                oPayloadSupp.defaultValuesDto.orderAddrBpNumber = orderBpNumber.replace(/^0+/, '');
                oPayloadSupp.defaultValuesDto.invoiceAddrBpNumber = invoiceBpNumber.replace(/^0+/, '');
                oPayloadSupp.userUpdated = oView.getModel("oConfigMdl").getData().usrData.givenName
                var sUrl1 = "/nsBuyerRegistration/plcm_portal_services/supplier/update";
                var oModelSave = new JSONModel();
                oModelSave.loadData(sUrl1, JSON.stringify(oPayloadSupp), true, "PUT", false, true, {
                    "Content-Type": "application/json"
                });
                oModelSave.attachRequestCompleted(function onCompleted(oEvent) {
                    if (oEvent.getParameter("success")) {
                        //var vCaseId = "BPR-000267";
                        var vCaseId = oView.getModel("JMEulaComments").getData().caseId;
                        var sUrl = "/nsBuyerRegistration/plcm_portal_services/api/v1/mdg/validate/request/" + vCaseId + "?testDataIndicator=true";
                        var oModelValidateReq = new JSONModel();
                        oModelValidateReq.loadData(sUrl);
                        oModelValidateReq.attachRequestCompleted(function onCompleted(oEvent) {
                            if (oEvent.getParameter("success")) {
                                // oBusyDilog.close();
                                if (oEvent.getSource().getData().ValidateRequest == "Request Initiated to MDG") {
                                    var oModelValidateResponse = new JSONModel();
                                    //   var vCaseId = "BPR-000267";
                                    var vCaseId = oView.getModel("JMEulaComments").getData().caseId;
                                    var sUrlResp = "/nsBuyerRegistration/plcm_portal_services/api/v1/mdg/validate/response/" + vCaseId;
                                    var i = 0
                                    for (; i < 6; i++) {
                                        var vBreak = false;
                                        //   setTimeout(function () {
                                        $.ajax({
                                            url: sUrlResp,
                                            type: 'GET',
                                            dataType: 'json',
                                            success: function (data) {
                                                if (data.responseReceived == true) {
                                                    var aValidateJson = new sap.ui.model.json.JSONModel();
                                                    that.aCheckData = data;
                                                    for (var i = 0; i < data.mdgLogDto.length; i++) {
                                                        if (data.mdgLogDto[i].businessGroup == "ZVEN") {
                                                            aValidateJson.setData(JSON.parse(data.mdgLogDto[i].responseMessage));
                                                            oView.setModel(aValidateJson, "JMValidateResult");
                                                            break;
                                                        }

                                                    }
                                                    that.fnLoadValidationDone(oView.getModel("JMEulaComments").getData().caseId);
                                                    oBusyDilog.close();
                                                    if (!that.oValidateResult) {
                                                        that.oValidateResult = sap.ui.xmlfragment(
                                                            "ns.BuyerRegistration.fragments.ValidateResult", that);
                                                        oView.addDependent(that.oValidateResult);
                                                    }
                                                    that.oValidateResult.open();
                                                    sap.ui.getCore().byId('id_SegmentValidate').setSelectedKey("CentralData");
                                                    vBreak = true;

                                                }

                                            },
                                            async: false,
                                            error: function (data) {
                                                vBreak = true;
                                                oBusyDilog.close();
                                                var sErMsg = "Failed to fetch validation response";
                                                MessageBox.show(sErMsg, {
                                                    icon: MessageBox.Icon.ERROR,
                                                    title: oi18n.getProperty("Error")
                                                });
                                            }
                                        });

                                        //}, 1000);
                                        if (vBreak) {
                                            break;
                                        }
                                    }
                                } else {
                                    oBusyDilog.close();
                                    var sErMsg = "Failed to initiate validation request";
                                    MessageBox.show(sErMsg, {
                                        icon: MessageBox.Icon.ERROR,
                                        title: oi18n.getProperty("Error")
                                    });
                                }

                            }
                            else {
                                oBusyDilog.close();
                                var sErMsg = oEvent.getParameter("errorobject").responseText;
                                MessageBox.show(sErMsg, {
                                    icon: MessageBox.Icon.ERROR,
                                    title: oi18n.getProperty("Error")
                                });
                            }

                        }
                        );
                    } else {
                        oBusyDilog.close();
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getProperty("Error")
                        });
                    }


                });
            },
            fnCloseValidation: function () {
                that.oValidateResult.close();
            },
            fnDoneSubmit: function () {
                window.parent.location.reload();
            },

        });
    });

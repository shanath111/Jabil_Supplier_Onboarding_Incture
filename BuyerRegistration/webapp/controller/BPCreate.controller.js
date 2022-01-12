var options;
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "ns/BuyerRegistration/util/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/Sorter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, formatter, JSONModel, Filter, FilterOperator, MessageBox, BusyDialog, Sorter) {
        "use strict";
        var that, oView, oBusyDilog, oi18n;
        return Controller.extend("ns.BuyerRegistration.controller.BPCreate", {
            onInit: function () {
                oView = this.getView();
                that = this;
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt") //initialize Busy Dialog
                });

                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("BPCreate").attachPatternMatched(this.fnBuyerCreateRoute, this);
            },
            fnChange22:function(){

            },
            fnBuyerCreateRoute: function (oEvent) {
                var vContext = {
                    "Id": oEvent.getParameter("arguments").Id
                };
                that.fnClearData();
                that.fnSetConfigModel(vContext);
                that.fnLoadLookUpData();

                this.fnCreateServiceObj();
            },
            fnCreateServiceObj: function () {
                var that = this;
                setTimeout(function () {
                    var CustomKey = "8E55A2E520B342FABBB87DE6968743A1";
                    options = { key: CustomKey, setCountryByIP: false, isTrial: false };
                    var fields = [
                        { element: "iAddress1", field: "Address1", mode: so.fieldMode.SEARCH },
                    ];
                    var DOTSGlobalAddressComplete = new so.Address(fields, options);

                    DOTSGlobalAddressComplete.listen("populate", function (address, validations) {


                        oView.getModel("JMBPCreate").getData().address1 = address.Address1;
                        oView.getModel("JMBPCreate").getData().address2 = address.Address2;
                        oView.getModel("JMBPCreate").getData().address3 = address.Address3;
                        oView.getModel("JMBPCreate").getData().address4 = address.Address4;
                        oView.getModel("JMBPCreate").getData().address5 = address.Address5;
                        oView.getModel("JMBPCreate").getData().city = address.Locality;
                        oView.getModel("JMBPCreate").getData().postalCode = address.PostalCode;
                        oView.getModel("JMBPCreate").getData().state = address.AdminAreaCode;
                        oView.getModel("JMBPCreate").refresh();
                        //  oView.getModel("companyInfoModel").getData().oCountry = address.Country;
                        //  oView.getModel("JMBPCreate").getData().oRegionC = address.AdminAreaCode;

                    });


                    // DOTSGlobalAddressComplete.listen("populate", function (address, validations) {
                    // });
                }, 1000);
            },

            fnSetConfigModel: function (oContext) {
                oView.getModel("oConfigMdl").getData().caseDeailVis = true;
                if (oContext.Id == "New") {
                    oView.getModel("oConfigMdl").getData().HeaderNavLink = true;
                    oView.getModel("oConfigMdl").getData().caseDeailVis = false;
                    oView.getModel("oConfigMdl").getData().screenEditable = true;
                    oView.getModel("oConfigMdl").getData().searchAddress = false;
                    
                    oView.getModel("oConfigMdl").getData().HeaderLinkTxt = oi18n.getProperty("VRVendorDetails1");
                } else {
                    oView.getModel("oConfigMdl").getData().HeaderNavLink = false;
                    oView.getModel("oConfigMdl").getData().HeaderLinkTxt = oi18n.getProperty("VRVendorDetails2");
                    oView.getModel("oConfigMdl").getData().searchAddress = false;
                    that.fnLoadCaseDetail(oContext.Id);//Load Case ID Details
                }
                oView.getModel("oConfigMdl").getData().contextPath = oContext;
                oView.getModel("oConfigMdl").refresh();
            },
            fnLoadLookUpData: function () {
                oView.getModel("oBPLookUpMdl").setData([]);
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);
                oView.getModel("oBPLookUpMdl").refresh();
                this.fnLoadCompanyCode();
                this.fnLoadPlant();
                //    this.fnLoadPurOrg();
                this.fnLoadIncoterms();
                this.fnLoadCountry();
                // this.fnLoadState();
                this.fnLoadPurGroup();
                this.fnLoadWorkCell();
                this.fnLoadPayemntTerms();
                this.fnLoadCountryCode();

            },
            fnLoadValidation: function (vCountry) {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/validations/" + vCountry;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    oView.getModel("oBPLookUpMdl").setProperty("/Validation", oEvent.getSource().getData());
                    oView.getModel("oBPLookUpMdl").refresh();
                });
            },

            fnLoadPayemntTerms: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/payment-terms";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/PaymentTerms", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });
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
            fnLoadWorkCell: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/workcell-list";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/WorkCell", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
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
                            if (vDescription) {
                                if (vDescription.includes("Nypro")) {
                                    var temp = [{
                                        "code": "0155",
                                        "description": "Nypro Inc."
                                    }]
                                    oView.getModel("oBPLookUpMdl").setProperty("/PurOrg", temp);
                                }
                            }
                        }
                        oView.getModel("oBPLookUpMdl").refresh();
                    } else {
                        if (vDescription) {
                            if (vDescription.includes("Nypro")) {
                                var temp = [{
                                    "code": "0155",
                                    "description": "Nypro Inc."
                                }]
                                oView.getModel("oBPLookUpMdl").setProperty("/PurOrg", temp);
                            }
                        }
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });

            },
            fnLoadIncoterms: function () {
                var oModel = new JSONModel();
                var sUrl = "/nsBuyerRegistration/plcm_reference_data/api/v1/reference-data/incoterms";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/Incoterms", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
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

            fnClearData: function () {
                // oView.getModel("oConfigMdl").setData([]);
                // oView.getModel("oConfigMdl").refresh();

                try {
                    var temp = {
                        "buyerName": oView.getModel("oConfigMdl").getData().usrData.givenName,
                        "userCreated":oView.getModel("oConfigMdl").getData().usrData.givenName,
                        "rfcv": false,
                        "conflictOfInterests": -1,
                        "paymentTerms":"ZE90",
                        "representAnotherCompanys": 1,
                        "oneTimePurchaseSupplierIndicators": 1,
                        "customerDirectedSupplierIndicators": -1,
                        "outsideProcessiongSupplierIndicators": 1,
                        "manualAddressOverrideSupplierIndicators": 1,
                        "requestorConflictOfInterests": -1,
                        "addlSurveyForSuppliers": 1,
                        "reqCoIFields": false,
                        "CoIFields": false,
                        "buyerAttachmentVis": false,
                        "materialGroupVis": false
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
                                "mobileCountryCode": data.bpRequestScope.bpRequestScopeAddlDetails.mobileCountryCode,
                                "altContactCountryCode": data.bpRequestScope.bpRequestScopeAddlDetails.altContactCountryCode,
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
                                "requestorCOIEmail": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIEmail,
                                "requestorCOIName": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIName,
                                "requestorCOIPhoneNumber": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIPhoneNumber,
                                "requestorCOIReason": data.bpRequestScope.bpRequestScopeAddlDetails.requestorCOIReason,
                                "addlSurveyForSupplier": data.bpRequestScope.bpRequestScopeAddlDetails.addlSurveyForSupplier,
                                "instructionKey": data.bpRequestScope.bpRequestScopeAddlDetails.instructionKey,
                                "materialGroup": data.bpRequestScope.materialGroup

                            };
                        }
                        if (temp) {

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
                            } else if(temp.requestorConflictOfInterest == false){
                                temp.reqCoIFields = false;
                                temp.requestorConflictOfInterests = 0;
                            }else{
                                temp.reqCoIFields = false;
                                temp.requestorConflictOfInterests = -1;
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
                            if (temp.country == "MX") {
                                temp.rfcv = true;
                            } else {
                                temp.rfcv = false;
                            }


                            var oBPCreateModel = new sap.ui.model.json.JSONModel();
                            oBPCreateModel.setData(temp);
                            oView.setModel(oBPCreateModel, "JMBPCreate");
                            that.fnLoadState(temp.country);
                            that.fnLoadValidation(temp.country);
                            that.fnLoadPurOrg(temp.companyCode, that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, temp.companyCode, "CompanyCode"));
                            //Set Radio Button Data

                            if (temp.status == "Draft") {
                                if (temp.country == "US") {
                                    oView.getModel("oConfigMdl").getData().searchAddress = true;
                                }
                                oView.getModel("oConfigMdl").getData().screenEditable = true;
                            } else {
                                oView.getModel("oConfigMdl").getData().screenEditable = false;
                                oView.getModel("oConfigMdl").getData().searchAddress = false;
                            }
                            if(that.getOwnerComponent().getComponentData()){
                                if (that.getOwnerComponent().getComponentData().startupParameters.caseId) {
                                  var vEnb = that.getOwnerComponent().getComponentData().startupParameters.Enb[0];
                                  if(vEnb == false){
                                    oView.getModel("oConfigMdl").getData().screenEditable = false;
                                    oView.getModel("oConfigMdl").getData().searchAddress = false;
                                  }
                              }
                          }

                            oView.getModel("oConfigMdl").getData().representAnotherCompany = temp.representAnotherCompany;
                            oView.getModel("oConfigMdl").refresh();

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
            fnNavToBPCreate: function () {
                window.history.go(-1);
            },

            fnCloseMessage: function () {
                this.oBPSuccess.close();
                
            },
            fnDoneSubmit: function () {
                window.history.go(-1);
            },
            
            fnSaveContinue:function(){
                this.oBPSuccessDraft.close();
                that.fnLoadCaseDetail(oView.getModel("JMBPCreate").getData().caseId);//Load Case ID Details
            },
            fnNavToExtend: function () {
                this.getOwnerComponent().getRouter().navTo("BPExtend", {
                    Id: "New",
                    Name: "Display"
                });
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
                    var vIsNew = true;
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
                    // if (!oView.getModel("JMBPCreate").getData().incoTerms) {
                    //     oView.getModel("JMBPCreate").getData().incoTermse = "Error";
                    //     oView.getModel("JMBPCreate").getData().incoTermsm = oi18n.getProperty("BPCMandatoryValidationIncoterm");
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // }
                    if (!oView.getModel("JMBPCreate").getData().paymentTerms) {
                        oView.getModel("JMBPCreate").getData().paymentTermse = "Error";
                        oView.getModel("JMBPCreate").getData().paymentTermsm = oi18n.getProperty("BPCMandatoryValidationPaymentTerms");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }

                    if (oView.getModel("JMBPCreate").getData().incotermNameLocatione == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().corporationName) {
                        oView.getModel("JMBPCreate").getData().corporationNamee = "Error";
                        oView.getModel("JMBPCreate").getData().corporationNamem = oi18n.getProperty("BPCMandatoryValidationCorpName");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    } else if (oView.getModel("JMBPCreate").getData().corporationNamee == "Error") {
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().instructionKey) {
                        oView.getModel("JMBPCreate").getData().instructionKeye = "Error";
                        oView.getModel("JMBPCreate").getData().instructionKeym = oi18n.getProperty("BPCMandatoryInstructionKey");
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    } else if (oView.getModel("JMBPCreate").getData().instructionKeye == "Error") {
                        vError = true;
                    }

                    // if (!oView.getModel("JMBPCreate").getData().product) {
                    //     oView.getModel("JMBPCreate").getData().producte = "Error";
                    //     oView.getModel("JMBPCreate").getData().productm = oi18n.getProperty("BPCMandatoryValidationProduct");
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // } else if (oView.getModel("JMBPCreate").getData().producte == "Error") {
                    //     vError = true;
                    // }

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
                    if (oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicators == -1) {
                        oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicatorse = "Error";
                        vError = true;
                        oView.getModel("JMBPCreate").refresh();
                    }


                    // if (!oView.getModel("JMBPCreate").getData().address1) {
                    //     oView.getModel("JMBPCreate").getData().address1e = "Error";
                    //     oView.getModel("JMBPCreate").getData().address1m = oi18n.getProperty("BPCMandatoryValidationAddress1");
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // } else if (oView.getModel("JMBPCreate").getData().address1e == "Error") {
                    //     vError = true;
                    // }

                    if (oView.getModel("JMBPCreate").getData().address2e == "Error") {
                        vError = true;
                    }
                    // if (!oView.getModel("JMBPCreate").getData().city) {
                    //     oView.getModel("JMBPCreate").getData().citye = "Error";
                    //     oView.getModel("JMBPCreate").getData().citym = oi18n.getProperty("BPCMandatoryValidationCity");
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // } else if (oView.getModel("JMBPCreate").getData().citye == "Error") {
                    //     vError = true;
                    // }
                    // if (!oView.getModel("JMBPCreate").getData().state) {
                    //     oView.getModel("JMBPCreate").getData().statee = "Error";
                    //     oView.getModel("JMBPCreate").getData().statem = oi18n.getProperty("BPCMandatoryValidationState");
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // }

                    if (oView.getModel("JMBPCreate").getData().districte == "Error") {
                        vError = true;
                    }

                    // if (!oView.getModel("JMBPCreate").getData().country) {
                    //     oView.getModel("JMBPCreate").getData().countrye = "Error";
                    //     oView.getModel("JMBPCreate").getData().countrym = oi18n.getProperty("BPCMandatoryValidationCountry");
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // }

                    // if (!oView.getModel("JMBPCreate").getData().postalCode) {
                    //     oView.getModel("JMBPCreate").getData().postalCodee = "Error";
                    //     oView.getModel("JMBPCreate").getData().postalCodem = oi18n.getProperty("BPCMandatoryValidationPostalCode");
                    //     vError = true;
                    //     oView.getModel("JMBPCreate").refresh();
                    // } else if (oView.getModel("JMBPCreate").getData().postalCodee == "Error") {
                    //     vError = true;
                    // }
                    if (oView.getModel("JMBPCreate").getData().poBoxPostalCode == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().faxe == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsitee == "Error") {
                        vError = true;
                    }

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

                    // if (oView.getModel("JMBPCreate").getData().additionalInformatione == "Error") {
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
                    if (!oView.getModel("JMBPCreate").getData().contactCountryCode) {
                        oView.getModel("JMBPCreate").getData().contactCountryCodee = "Error";
                        oView.getModel("JMBPCreate").getData().contactCountryCodem = oi18n.getProperty("BPCEnterCountryCode");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    }
                    if (!oView.getModel("JMBPCreate").getData().mobileCountryCode) {
                        oView.getModel("JMBPCreate").getData().mobileCountryCodee = "Error";
                        oView.getModel("JMBPCreate").getData().mobileCountryCodem = oi18n.getProperty("BPCEnterCountryCode");
                        oView.getModel("JMBPCreate").refresh();
                        vError = true;
                    }
                    // if (!oView.getModel("JMBPCreate").getData().altContactCountryCode) {
                    //     oView.getModel("JMBPCreate").getData().altContactCountryCodee = "Error";
                    //     oView.getModel("JMBPCreate").getData().altContactCountryCodem = oi18n.getProperty("BPCEnterCountryCode1");
                    //     oView.getModel("JMBPCreate").refresh();
                    //     vError = true;
                    // }

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

                    if (oView.getModel("JMBPCreate").getData().addlSurveyForSuppliers == 0) {
                        var aFileData = this.getView().getModel("oAttachmentList").getData().buyerAttachment;
                        if (aFileData) {
                            if (aFileData.length == 0) {
                                vError = true;

                                MessageBox.show(oi18n.getProperty("AttachMentError"), {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: oi18n.getProperty("Error")
                                });
                            }
                        } else {
                            MessageBox.show(oi18n.getProperty("AttachMentError"), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n.getProperty("Error")
                            });
                            vError = true;
                        }
                    }

                    if (oView.getModel("JMBPCreate").getData().plant == "CN30" || oView.getModel("JMBPCreate").getData().plant == "CN81") {
                        if (!oView.getModel("JMBPCreate").getData().materialGroup) {
                            oView.getModel("JMBPCreate").getData().materialGroupe = "Error";
                            oView.getModel("JMBPCreate").getData().materialGroupm = oi18n.getProperty("pleaseProvideMaterialGroup");
                            oView.getModel("JMBPCreate").refresh();
                            vError = false;
                        }
                    }

                    if (vError == false) {
                        if (oView.getModel("JMBPCreate").getData().country == "US") {
                            var Address1, Address2, Address3, Address4, Address5, Locality, AdministrativeArea, PostalCode, Country, OutputLanguage, LicenseKey;
                            var validMessage = true;
                            Address1 = oView.getModel("JMBPCreate").getData().address1;
                            Address2 = oView.getModel("JMBPCreate").getData().address2;
                            Address3 = oView.getModel("JMBPCreate").getData().address3;
                            Address4 = oView.getModel("JMBPCreate").getData().address4;
                            Address5 = oView.getModel("JMBPCreate").getData().address5;
                            Locality = oView.getModel("JMBPCreate").getData().city;
                            AdministrativeArea = oView.getModel("JMBPCreate").getData().state;
                            PostalCode = oView.getModel("JMBPCreate").getData().postalCode;
                            Country = oView.getModel("JMBPCreate").getData().country;
                            OutputLanguage = "english";
                            LicenseKey = "WS80-TZS3-FDQ1";
                            var primaryUrl = '/nsBuyerRegistration/plcm_service_object/AVI/api.svc/json/GetAddressInfo?Address1=' + Address1 + '&Address2=' + Address2 + '&Address3=' + Address3 + '&Address4=' + Address4 + '&Address5=' + Address5 + '&Locality=' + Locality + '&AdministrativeArea=' + AdministrativeArea + '&PostalCode=' + PostalCode + '&Country=' + Country + '&OutputLanguage=' + OutputLanguage + '&LicenseKey=' + LicenseKey;
                            $.ajax({
                                url: primaryUrl,
                                type: 'GET',
                                dataType: 'json',
                                success: function (data) {
                                    if (data.AddressInfo.Status !== "Valid") {
                                        validMessage = false;
                                    }

                                },
                                async: false,
                                error: function (data) {
                                    validMessage = false;

                                }
                            });

                            if (validMessage == false) {
                                var sErMsg = oi18n.getProperty("InvalidAddressEntered");
                                MessageBox.show(sErMsg, {
                                    icon: MessageBox.Icon.ERROR,
                                    title: "Error"
                                });
                                return;
                            }
                        }
                    }
                } else {


                    var vIsNew = true;
                    if (oView.getModel("JMBPCreate").getData().incotermNameLocatione == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().corporationNamee == "Error") {
                        vError = true;
                    }

                    if (oView.getModel("JMBPCreate").getData().address1e == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().instructionKeye == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().address2e == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().citye == "Error") {
                        vError = true;
                    }

                    if (oView.getModel("JMBPCreate").getData().districte == "Error") {
                        vError = true;
                    }

                    if (oView.getModel("JMBPCreate").getData().postalCodee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().poBoxPostalCode == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().faxe == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsitee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().firstNamee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().lastNamee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().emaile == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().telephonee == "Error") {
                        vError = true;
                    }
                    if (oView.getModel("JMBPCreate").getData().contactMobilePhonee == "Error") {
                        vError = true;
                    }
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
                    if (oView.getModel("JMBPCreate").getData().additionalInformatione == "Error") {
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

                    if (oView.getModel("JMBPCreate").getData().requestorConflictOfInterests == 1) {
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
                } else if(vConflictOfIntSel1 == 1){
                    vConflictOfInt1 = true;
                }else{
                    vConflictOfInt1 = null;  
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
                    // MessageBox.confirm(vConfirmMsg, {
                    //     icon: MessageBox.Icon.Confirmation,
                    //     title: "Confirmation",
                    //     actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    //     emphasizedAction: MessageBox.Action.YES,
                    //     onClose: function (oAction) {
                    //         if (oAction == "YES") {
                    oBusyDilog.open();
                    var oPayload = {
                        "bpRequestScope": {
                            "bpRequestScopeAddlDetails": {
                                "addlScopeId": oView.getModel("JMBPCreate").getData().addlScopeId,
                                "address1": oView.getModel("JMBPCreate").getData().address1,
                                "address2": oView.getModel("JMBPCreate").getData().address2,
                                "address3": oView.getModel("JMBPCreate").getData().address3,
                                "address4": oView.getModel("JMBPCreate").getData().address4,
                                "address5": oView.getModel("JMBPCreate").getData().address5,
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
                                "contactMobilePhone": oView.getModel("JMBPCreate").getData().contactMobilePhone,
                                "poBoxPostalCode": oView.getModel("JMBPCreate").getData().poBoxPostalCode,
                                "rfc": oView.getModel("JMBPCreate").getData().rfc,
                                "supplierUrlCompanyWebsite": oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsite,
                                "representAnotherCompany": vOtherCompany,
                                "altContactFirstName": oView.getModel("JMBPCreate").getData().altContactFirstName,
                                "altContactJobTitle": oView.getModel("JMBPCreate").getData().altContactJobTitle,
                                "altContactLastName": oView.getModel("JMBPCreate").getData().altContactLastName,
                                "altEmail": oView.getModel("JMBPCreate").getData().altEmail,
                                "altPhoneNumber": oView.getModel("JMBPCreate").getData().altPhoneNumber,
                                "product": oView.getModel("JMBPCreate").getData().product,
                                "requestorConflictOfInterest": vConflictOfInt1,
                                "paymentTerms": oView.getModel("JMBPCreate").getData().paymentTerms,
                                "incotermNameLocation": oView.getModel("JMBPCreate").getData().incotermNameLocation,
                                "requestorCOIEmail": oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                "requestorCOIName": oView.getModel("JMBPCreate").getData().requestorCOIName,
                                "requestorCOIPhoneNumber": oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumber,
                                "requestorCOIReason": oView.getModel("JMBPCreate").getData().requestorCOIReason,
                                "addlSurveyForSupplier": vAdditionalSuvey,
                                "instructionKey": oView.getModel("JMBPCreate").getData().instructionKey,
                                "contactCountryCode": oView.getModel("JMBPCreate").getData().contactCountryCode,
                                "altContactCountryCode": oView.getModel("JMBPCreate").getData().altContactCountryCode,
                                "mobileCountryCode": oView.getModel("JMBPCreate").getData().mobileCountryCode

                            },

                            "additionalInformation": oView.getModel("JMBPCreate").getData().additionalInformation,
                            "buyerName": oView.getModel("JMBPCreate").getData().buyerName,
                            "buyerEmailId": vBuyerEmail,
                            "companyCode": oView.getModel("JMBPCreate").getData().companyCode,
                            "conflictOfInterest": vConflictOfInt,
                            "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                            "corporationName2": oView.getModel("JMBPCreate").getData().corporationName2,
                            "corporationName3": oView.getModel("JMBPCreate").getData().corporationName3,
                            "corporationName4": oView.getModel("JMBPCreate").getData().corporationName4,
                            "incoTerms": oView.getModel("JMBPCreate").getData().incoTerms,
                            "isNew": vIsNew,
                            "isDuplicatesFound": false,
                            "plant": oView.getModel("JMBPCreate").getData().plant,
                            "purchasingOrg": oView.getModel("JMBPCreate").getData().purchasingOrg,
                            "purchasingGroup": oView.getModel("JMBPCreate").getData().purchasingGroup,
                            "scopeId": oView.getModel("JMBPCreate").getData().scopeId,
                            // "supplier": oView.getModel("JMBPCreate").getData().supplier,
                            "workCell": oView.getModel("JMBPCreate").getData().workCell,
                            "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup,
                            "workflowId": ""
                        },
                        "caseId": oView.getModel("JMBPCreate").getData().caseId,
                        "dateCreated": oView.getModel("JMBPCreate").getData().dateCreated,
                        "dateUpdated": oView.getModel("JMBPCreate").getData().dateUpdated,
                        "status": vStatus,
                        "userCreated": oView.getModel("JMBPCreate").getData().userCreated,
                        "userUpdated": oView.getModel("JMBPCreate").getData().buyerName
                    }
                    oModel.loadData(sUrl, JSON.stringify(oPayload), true, vQuery, false, true, {
                        "Content-Type": "application/json"
                    });
                    oModel.attachRequestCompleted(function (oEvent) {

                        if (oEvent.getParameter("success")) {
                            oView.getModel("JMBPCreate").getData().caseId = oEvent.getSource().getData().caseId;
                            oView.getModel("JMBPCreate").refresh;
                            var temp = {
                                "Message": "",
                                "caseId": oEvent.getSource().getData().caseId
                            }
                            if (oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.addlSurveyForSupplier == true) {
                                that.fnFinalFileUpload(oEvent.getSource().getData().caseId);
                            }

                            that.caseId = oEvent.getSource().getData().caseId;
                            that.savedData = oEvent.getSource().getData();
                            if (vBtnActn == "SD") {
                                temp.Message = oi18n.getProperty("BPCSaveAsDraftMessage");
                               temp.saveContinue = true;
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
                                var vRequesterConflict;
                                if (vConflictOfInt1 == true) {
                                    vRequesterConflict = true;
                                } else {
                                    vRequesterConflict = false;
                                }
                                var sUrlWf = "/nsBuyerRegistration/plcm_portal_services/workflow/trigger";
                                var oPayload = {
                                    "context": {

                                        "isNew": vIsNew,
                                        "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                                        "isDplicatesFound": false,
                                        "caseId": oEvent.getSource().getData().caseId,
                                        "buyerName": oView.getModel("JMBPCreate").getData().buyerName,
                                        "buyerTelephone": "",
                                        "buyerEmailid": vBuyerEmail,
                                        "division": "",
                                        "conflictOfInterest": vConflictOfInt,
                                        "requestorConflictOfInterest": vRequesterConflict,
                                        "coiReason": oView.getModel("JMBPCreate").getData().additionalInformation,
                                        "supplierName": oView.getModel("JMBPCreate").getData().firstName + " " + oView.getModel("JMBPCreate").getData().lastName,
                                        "supplierAddress": oView.getModel("JMBPCreate").getData().address1,
                                        "supplierCity": oView.getModel("JMBPCreate").getData().city,

                                        "supplierCountry": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().Country, oView.getModel("JMBPCreate").getData().country, "Country"),
                                        "supplierDistrict": oView.getModel("JMBPCreate").getData().district,
                                        "supplierPostalCode": oView.getModel("JMBPCreate").getData().postalCode,
                                        "supplierTelephone": oView.getModel("JMBPCreate").getData().telephone,
                                        "supplierEmail": oView.getModel("JMBPCreate").getData().email,
                                        "plant": oView.getModel("JMBPCreate").getData().plant,
                                        "requestorCOIEmail":oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                        "requestorCOIName":oView.getModel("JMBPCreate").getData().requestorCOIName,
                                        "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup,
                                        "purchasingGroup": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PurchasingGroup, oView.getModel("JMBPCreate").getData().purchasingGroup, "PurchasingGroup"),
                                        "workCell": that.fnFetchDescriptionWorkCell(oView.getModel("oBPLookUpMdl").getData().WorkCell, oView.getModel("JMBPCreate").getData().workCell, "WorkCell"),
                                        "companyCode": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, oView.getModel("JMBPCreate").getData().companyCode, "CompanyCode"),
                                        "purchasingOrg": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PurOrg, oView.getModel("JMBPCreate").getData().purchasingOrg, "PurchOrg"),
                                        // "company_code":oView.getModel("JMBPCreate").getData().companyCode,
                                        // "purchasing_code":oView.getModel("JMBPCreate").getData().purchasingOrg,
                                        "supplierDetails": {
                                            "firstName": oView.getModel("JMBPCreate").getData().firstName,
                                            "lastName": oView.getModel("JMBPCreate").getData().lastName,
                                            "email": oView.getModel("JMBPCreate").getData().email
                                        }
                                    },
                                    "definitionId": "partner_onboarding_main"
                                }

                                oModelWf.loadData(sUrlWf, JSON.stringify(
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
                                        temp.Message = oi18n.getProperty("BPCSuccessMessage");
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
                                        // var oModelUpdate = new JSONModel();
                                        // var oPayloadUpdate = that.savedData;
                                        // oPayloadUpdate.status = "Draft";
                                        // oModelUpdate.loadData(sUrl, JSON.stringify(oPayloadUpdate), true, "PUT", false, true, {
                                        //     "Content-Type": "application/json"
                                        // });
                                        // oBusyDilog.close();
                                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                                        // sErMsg = sErMsg+"\n"+"Data Saved as Draft \n Case ID:"+ that.caseId+"\n";
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
                    vConfirmMsg = "Please confirm submission request for " + oView.getModel("JMBPCreate").getData().corporationName +" in Company Code: " + oView.getModel("JMBPCreate").getData().companyCode + " and Purchasing Org: " + oView.getModel("JMBPCreate").getData().purchasingOrg;

                    // vConfirmMsg = oi18n.getProperty("BPCConfirmSubmit");
                    vStatus = "In Progress"
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
                                            "address3": oView.getModel("JMBPCreate").getData().address3,
                                            "address4": oView.getModel("JMBPCreate").getData().address4,
                                            "address5": oView.getModel("JMBPCreate").getData().address5,
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
                                            "contactMobilePhone": oView.getModel("JMBPCreate").getData().contactMobilePhone,
                                            "poBoxPostalCode": oView.getModel("JMBPCreate").getData().poBoxPostalCode,
                                            "rfc": oView.getModel("JMBPCreate").getData().rfc,
                                            "supplierUrlCompanyWebsite": oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsite,
                                            "representAnotherCompany": vOtherCompany,
                                            "altContactFirstName": oView.getModel("JMBPCreate").getData().altContactFirstName,
                                            "altContactJobTitle": oView.getModel("JMBPCreate").getData().altContactJobTitle,
                                            "altContactLastName": oView.getModel("JMBPCreate").getData().altContactLastName,
                                            "altEmail": oView.getModel("JMBPCreate").getData().altEmail,
                                            "altPhoneNumber": oView.getModel("JMBPCreate").getData().altPhoneNumber,
                                            "product": oView.getModel("JMBPCreate").getData().product,
                                            "requestorConflictOfInterest": vConflictOfInt1,
                                            "paymentTerms": oView.getModel("JMBPCreate").getData().paymentTerms,
                                            "incotermNameLocation": oView.getModel("JMBPCreate").getData().incotermNameLocation,
                                            "requestorCOIEmail": oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                            "requestorCOIName": oView.getModel("JMBPCreate").getData().requestorCOIName,
                                            "requestorCOIPhoneNumber": oView.getModel("JMBPCreate").getData().requestorCOIPhoneNumber,
                                            "requestorCOIReason": oView.getModel("JMBPCreate").getData().requestorCOIReason,
                                            "addlSurveyForSupplier": vAdditionalSuvey,
                                            "instructionKey": oView.getModel("JMBPCreate").getData().instructionKey,
                                            "contactCountryCode": oView.getModel("JMBPCreate").getData().contactCountryCode,
                                            "altContactCountryCode": oView.getModel("JMBPCreate").getData().altContactCountryCode,
                                            "mobileCountryCode": oView.getModel("JMBPCreate").getData().mobileCountryCode
                                        },

                                        "additionalInformation": oView.getModel("JMBPCreate").getData().additionalInformation,
                                        "buyerName": oView.getModel("JMBPCreate").getData().buyerName,
                                        "buyerEmailId": vBuyerEmail,
                                        "companyCode": oView.getModel("JMBPCreate").getData().companyCode,
                                        "conflictOfInterest": vConflictOfInt,
                                        "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                                        "corporationName2": oView.getModel("JMBPCreate").getData().corporationName2,
                                        "corporationName3": oView.getModel("JMBPCreate").getData().corporationName3,
                                        "corporationName4": oView.getModel("JMBPCreate").getData().corporationName4,
                                        "incoTerms": oView.getModel("JMBPCreate").getData().incoTerms,
                                        "isNew": vIsNew,
                                        "isDuplicatesFound": false,
                                        "plant": oView.getModel("JMBPCreate").getData().plant,
                                        "purchasingOrg": oView.getModel("JMBPCreate").getData().purchasingOrg,
                                        "purchasingGroup": oView.getModel("JMBPCreate").getData().purchasingGroup,
                                        "scopeId": oView.getModel("JMBPCreate").getData().scopeId,
                                        // "supplier": oView.getModel("JMBPCreate").getData().supplier,
                                        "workCell": oView.getModel("JMBPCreate").getData().workCell,
                                        "workflowId": "",
                                        "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup
                                    },
                                    "caseId": oView.getModel("JMBPCreate").getData().caseId,
                                    "dateCreated": oView.getModel("JMBPCreate").getData().dateCreated,
                                    "dateUpdated": oView.getModel("JMBPCreate").getData().dateUpdated,
                                    "status": vStatus,
                                    "userCreated": oView.getModel("JMBPCreate").getData().userCreated,
                                    "userUpdated": oView.getModel("JMBPCreate").getData().buyerName
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
                                        that.savedData = oEvent.getSource().getData();
                                        if (vBtnActn == "SD") {
                                            temp.Message = oi18n.getProperty("BPCSaveAsDraftMessage");
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

                                            var vBuyerEmail = ""
                                            if (oView.getModel("oConfigMdl").getData().usrData) {
                                                vBuyerEmail = oView.getModel("oConfigMdl").getData().usrData.email;
                                            }
                                            var oModelWf = new JSONModel();
                                            var vRequesterConflict;
                                            if (vConflictOfInt1 == true) {
                                                vRequesterConflict = true;
                                            } else {
                                                vRequesterConflict = false;
                                            }
                                            var sUrlWf = "/nsBuyerRegistration/plcm_portal_services/workflow/trigger";
                                            var oPayload = {
                                                "context": {
                                                    "isNew": vIsNew,
                                                    "isDplicatesFound": false,
                                                    "corporationName": oView.getModel("JMBPCreate").getData().corporationName,
                                                    "caseId": oEvent.getSource().getData().caseId,
                                                    "buyerName": oView.getModel("JMBPCreate").getData().buyerName,
                                                    "buyerTelephone": "",
                                                    "buyerEmailid": vBuyerEmail,
                                                    "division": "",
                                                    "conflictOfInterest": vConflictOfInt,
                                                    "requestorConflictOfInterest": vRequesterConflict,
                                                    "coiReason": oView.getModel("JMBPCreate").getData().additionalInformation,
                                                    "supplierName": oView.getModel("JMBPCreate").getData().firstName + " " + oView.getModel("JMBPCreate").getData().lastName,
                                                    "supplierAddress": oView.getModel("JMBPCreate").getData().address1,
                                                    "supplierCity": oView.getModel("JMBPCreate").getData().city,

                                                    "supplierCountry": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().Country, oView.getModel("JMBPCreate").getData().country, "Country"),
                                                    "supplierDistrict": oView.getModel("JMBPCreate").getData().district,
                                                    "supplierPostalCode": oView.getModel("JMBPCreate").getData().postalCode,
                                                    "supplierTelephone": oView.getModel("JMBPCreate").getData().telephone,
                                                    "supplierEmail": oView.getModel("JMBPCreate").getData().email,
                                                    "plant": oView.getModel("JMBPCreate").getData().plant,
                                                    "requestorCOIEmail":oView.getModel("JMBPCreate").getData().requestorCOIEmail,
                                                    "requestorCOIName":oView.getModel("JMBPCreate").getData().requestorCOIName,
                                                    "materialGroup": oView.getModel("JMBPCreate").getData().materialGroup,
                                                    "purchasingGroup": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PurchasingGroup, oView.getModel("JMBPCreate").getData().purchasingGroup, "PurchasingGroup"),
                                                    "workCell": that.fnFetchDescriptionWorkCell(oView.getModel("oBPLookUpMdl").getData().WorkCell, oView.getModel("JMBPCreate").getData().workCell, "WorkCell"),
                                                    "companyCode": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().CompanyCode, oView.getModel("JMBPCreate").getData().companyCode, "CompanyCode"),
                                                    "purchasingOrg": that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().PurOrg, oView.getModel("JMBPCreate").getData().purchasingOrg, "PurchOrg"),
                                                    "supplierDetails": {
                                                        "firstName": oView.getModel("JMBPCreate").getData().firstName,
                                                        "lastName": oView.getModel("JMBPCreate").getData().lastName,
                                                        "email": oView.getModel("JMBPCreate").getData().email
                                                    }
                                                    // "company_code":oView.getModel("JMBPCreate").getData().companyCode,
                                                    // "purchasing_code":oView.getModel("JMBPCreate").getData().purchasingOrg
                                                },
                                                "definitionId": "partner_onboarding_main"
                                            }

                                            oModelWf.loadData(sUrlWf, JSON.stringify(
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
                                                    temp.Message = oi18n.getProperty("BPCSuccessMessage");
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
                                                    // var oModelUpdate = new JSONModel();
                                                    // var oPayloadUpdate = that.savedData;
                                                    // oPayloadUpdate.status = "Draft";
                                                    // oModelUpdate.loadData(sUrl, JSON.stringify(oPayloadUpdate), true, "PUT", false, true, {
                                                    //     "Content-Type": "application/json"
                                                    // });
                                                    // oBusyDilog.close();
                                                    var sErMsg = oEvent.getParameter("errorobject").responseText;
                                                    // sErMsg = sErMsg+"\n"+"Data Saved as Draft \n Case ID:"+ that.caseId+"\n";
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
                            }
                        }
                    });
                }
            },
            

            fnLiveChangeSupplier: function () {
                if (oView.getModel("JMBPCreate").getData().materialGroupe == "Error") {
                    oView.getModel("JMBPCreate").getData().materialGroupe = "None";
                    oView.getModel("JMBPCreate").getData().materialGroupm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeMaterialGroup: function () {
                if (oView.getModel("JMBPCreate").getData().suppliere == "Error") {
                    oView.getModel("JMBPCreate").getData().suppliere = "None";
                    oView.getModel("JMBPCreate").getData().supplierm = "";
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
            fnLiveChangeCountryCode1: function () {
                if (oView.getModel("JMBPCreate").getData().altContactCountryCodee == "Error") {
                    oView.getModel("JMBPCreate").getData().altContactCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().altContactCountryCodem = "";
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
            fnChangeOneTimePurchInd: function () {
                oView.getModel("JMBPCreate").getData().oneTimePurchaseSupplierIndicatorse = "None";
                oView.getModel("JMBPCreate").refresh();
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
            fnLiveChangeCompCode: function (oEvent) {
                
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                this.fnLoadPurOrg(oView.getModel("JMBPCreate").getData().companyCode, oEvent.getSource().getSelectedItem().getAdditionalText());
                oView.getModel("JMBPCreate").getData().purchasingOrg = "";
                oView.getModel("JMBPCreate").refresh();
                if (oView.getModel("JMBPCreate").getData().companyCodee == "Error") {
                    oView.getModel("JMBPCreate").getData().companyCodee = "None";
                    oView.getModel("JMBPCreate").getData().companyCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }

            },
            fnLiveChangePurGroup: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().purchasingGroupe == "Error") {
                    oView.getModel("JMBPCreate").getData().purchasingGroupe = "None";
                    oView.getModel("JMBPCreate").getData().purchasingGroupm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangePurchOrg: function (oEvent) {
                var compCode= oView.getModel("JMBPCreate").getData().companyCode;
                if(compCode === "" || compCode === undefined){
                    sap.m.MessageToast.show(oi18n.getProperty("SelectCompanyCode"));
                    
                }
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
            fnLiveChangeAddress1: function (oEvent) {
                var vLength = oEvent.getParameter("value").length
                if (vLength > 35) {
                    oView.getModel("JMBPCreate").getData().address1e = "Error";
                    oView.getModel("JMBPCreate").getData().address1m = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().address1e == "Error") {
                        oView.getModel("JMBPCreate").getData().address1e = "None";
                        oView.getModel("JMBPCreate").getData().address1m = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeAddress2: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 35) {
                    oView.getModel("JMBPCreate").getData().address2e = "Error";
                    oView.getModel("JMBPCreate").getData().address2m = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().address2e == "Error") {
                        oView.getModel("JMBPCreate").getData().address2e = "None";
                        oView.getModel("JMBPCreate").getData().address2m = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeCity: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                var vLength = oEvent.getParameter("value").length;
                // if (vSelected == false) {
                //     oEvent.getSource().setValue("");
                // }
                if (vLength > 40) {
                    oView.getModel("JMBPCreate").getData().citye = "Error";
                    oView.getModel("JMBPCreate").getData().citym = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().citye == "Error") {
                        oView.getModel("JMBPCreate").getData().citye = "None";
                        oView.getModel("JMBPCreate").getData().citym = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }

            },
            fnLiveChangeDistrict: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 40) {
                    oView.getModel("JMBPCreate").getData().districte = "Error";
                    oView.getModel("JMBPCreate").getData().districtm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().districte == "Error") {
                        oView.getModel("JMBPCreate").getData().districte = "None";
                        oView.getModel("JMBPCreate").getData().districtm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnInstructionKeyChange: function (oEvent) {
                var vLength = oEvent.getParameter("value").length
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                // if (vLength > 3) {
                //     oView.getModel("JMBPCreate").getData().instructionKeye = "Error";
                //     oView.getModel("JMBPCreate").getData().instructionKeym = oi18n.getProperty("BPCMaxLengthExceeds");
                //     oView.getModel("JMBPCreate").refresh();
                // } else {
                if (oView.getModel("JMBPCreate").getData().instructionKeye == "Error") {
                    oView.getModel("JMBPCreate").getData().instructionKeye = "None";
                    oView.getModel("JMBPCreate").getData().instructionKeym = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                //}
            },
            fnLiveChangeState: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().statee == "Error") {
                    oView.getModel("JMBPCreate").getData().statee = "None";
                    oView.getModel("JMBPCreate").getData().statem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeRegion: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                if (oView.getModel("JMBPCreate").getData().regione == "Error") {
                    oView.getModel("JMBPCreate").getData().regione = "None";
                    oView.getModel("JMBPCreate").getData().regionm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnLiveChangeCountry: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                this.fnLoadState(oView.getModel("JMBPCreate").getData().country);
                this.fnLoadValidation(oView.getModel("JMBPCreate").getData().country);
                oView.getModel("JMBPCreate").getData().state = "";
                oView.getModel("JMBPCreate").refresh();
                if (oView.getModel("JMBPCreate").getData().countrye == "Error") {
                    oView.getModel("JMBPCreate").getData().countrye = "None";
                    oView.getModel("JMBPCreate").getData().countrym = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().country == "MX") {
                    oView.getModel("JMBPCreate").getData().rfcv = true;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    oView.getModel("JMBPCreate").getData().rfcv = false;
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().country == "US") {
                    oView.getModel("oConfigMdl").getData().searchAddress = true;
                } else {
                    oView.getModel("oConfigMdl").getData().searchAddress = false;
                }
                oView.getModel("oConfigMdl").refresh();

            },
            // fnLiveChangeCountryCode: function (oEvent) {
            //     var vSelected = oEvent.getParameter("itemPressed");
            //     // if (vSelected == false) {
            //     //     oEvent.getSource().setValue("");
            //     // }
            //     if (oView.getModel("JMBPCreate").getData().contactCountryCodee == "Error") {
            //         oView.getModel("JMBPCreate").getData().contactCountryCodee = "None";
            //         oView.getModel("JMBPCreate").getData().contactCountryCodem = "";
            //         oView.getModel("JMBPCreate").refresh();
            //     }
            // },
            fnLiveChangePostalCode: function (oEvent) {
                var vInpVal = oEvent.getParameter("value");
                var vMaxLength = 0;
                var vRule = null;
                if (oView.getModel("oBPLookUpMdl").getData().Validation) {
                    vMaxLength = Number(oView.getModel("oBPLookUpMdl").getData().Validation[0].postalCodeLength);
                    vRule = Number(oView.getModel("oBPLookUpMdl").getData().Validation[0].postalCodeRule);
                }
                if (Number(vMaxLength == 0)) {
                    vMaxLength = 10;
                }

                if (oView.getModel("JMBPCreate").getData().country) {
                    if (oView.getModel("JMBPCreate").getData().country == "US") {
                        // var vTestResult = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(vInpVal);
                        // if (!vTestResult) {
                        //     oView.getModel("JMBPCreate").getData().postalCodee = "Error";
                        //     oView.getModel("JMBPCreate").getData().postalCodem = oi18n.getProperty("BPCInvalidPostalCode");
                        //     oView.getModel("JMBPCreate").refresh();
                        // } else {
                        //     if (oView.getModel("JMBPCreate").getData().postalCodee == "Error") {
                        //         oView.getModel("JMBPCreate").getData().postalCodee = "None";
                        //         oView.getModel("JMBPCreate").getData().postalCodem = "";
                        //         oView.getModel("JMBPCreate").refresh();
                        //     }
                        // }
                    } else {

                        if (oView.getModel("JMBPCreate").getData().postalCodee == "Error") {
                            oView.getModel("JMBPCreate").getData().postalCodee = "None";
                            oView.getModel("JMBPCreate").getData().postalCodem = "";
                            oView.getModel("JMBPCreate").refresh();
                        }
                    }
                } else {
                    oView.getModel("JMBPCreate").getData().postalCodee = "Error";
                    oView.getModel("JMBPCreate").getData().postalCode = "";
                    oView.getModel("JMBPCreate").getData().postalCodem = oi18n.getProperty("BPCPleaseSelCountryCode");
                    oView.getModel("JMBPCreate").refresh();
                    return;
                }
                if (vInpVal) {
                    if (Number(vInpVal) == 0) {
                        oView.getModel("JMBPCreate").getData().postalCodee = "Error";
                        oView.getModel("JMBPCreate").getData().postalCodem = oi18n.getProperty("BPCInvalidPostalCode");
                        oView.getModel("JMBPCreate").refresh();
                        return;
                    }
                } else {
                    oView.getModel("JMBPCreate").getData().postalCodee = "None";
                    oView.getModel("JMBPCreate").getData().postalCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                    return;
                }
                if (vInpVal.length == 0) {
                    oView.getModel("JMBPCreate").getData().postalCodee = "None";
                    oView.getModel("JMBPCreate").getData().postalCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }

                if (vRule == 3 || vRule == 4 || vRule == 7 || vRule == 8) {
                    if (vInpVal.length !== vMaxLength) {
                        if (Number(vMaxLength) !== 0) {
                            oView.getModel("JMBPCreate").getData().postalCodee = "Error";
                            oView.getModel("JMBPCreate").getData().postalCodem = oi18n.getProperty("BPCInvalidPostalCode");
                            oView.getModel("JMBPCreate").refresh();
                        }
                    } else {
                        oView.getModel("JMBPCreate").getData().postalCodee = "None";
                        oView.getModel("JMBPCreate").getData().postalCodem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                } else {
                    if (vInpVal.length > vMaxLength) {
                        if (Number(vMaxLength) !== 0) {
                            oView.getModel("JMBPCreate").getData().postalCodee = "Error";
                            oView.getModel("JMBPCreate").getData().postalCodem = oi18n.getProperty("BPCInvalidPostalCode");
                            oView.getModel("JMBPCreate").refresh();
                        }
                    } else {
                        oView.getModel("JMBPCreate").getData().postalCodee = "None";
                        oView.getModel("JMBPCreate").getData().postalCodem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }

            },

            fnLiveChangePOBox: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 40) {
                    oView.getModel("JMBPCreate").getData().poBoxPostalCodee = "Error";
                    oView.getModel("JMBPCreate").getData().poBoxPostalCodem = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().poBoxPostalCodee == "Error") {
                        oView.getModel("JMBPCreate").getData().poBoxPostalCodee = "None";
                        oView.getModel("JMBPCreate").getData().poBoxPostalCodem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeFaxNumber: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 40) {
                    oView.getModel("JMBPCreate").getData().faxe = "Error";
                    oView.getModel("JMBPCreate").getData().faxm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().faxe == "Error") {
                        oView.getModel("JMBPCreate").getData().faxe = "None";
                        oView.getModel("JMBPCreate").getData().faxm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeSupplierUrl: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 50) {
                    oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsitee = "Error";
                    oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsitem = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsitee == "Error") {
                        oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsitee = "None";
                        oView.getModel("JMBPCreate").getData().supplierUrlCompanyWebsitem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeRFC: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 40) {
                    oView.getModel("JMBPCreate").getData().rfce = "Error";
                    oView.getModel("JMBPCreate").getData().rfcm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().rfce == "Error") {
                        oView.getModel("JMBPCreate").getData().rfce = "None";
                        oView.getModel("JMBPCreate").getData().rfcm = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
            },
            fnLiveChangeCorporationName: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                if (vLength > 35) {
                    oView.getModel("JMBPCreate").getData().corporationNamee = "Error";
                    oView.getModel("JMBPCreate").getData().corporationNamem = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    if (oView.getModel("JMBPCreate").getData().corporationNamee == "Error") {
                        oView.getModel("JMBPCreate").getData().corporationNamee = "None";
                        oView.getModel("JMBPCreate").getData().corporationNamem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
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
                    oEvent.getSource().setValue("");
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
                    oEvent.getSource().setValue("");

                }
                else {
                    if (oView.getModel("JMBPCreate").getData().contactMobilePhonee == "Error") {
                        oView.getModel("JMBPCreate").getData().contactMobilePhonee = "None";
                        oView.getModel("JMBPCreate").getData().contactMobilePhonem = "";
                        oView.getModel("JMBPCreate").refresh();
                    }
                }
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
                    //   var vResonse = this.fnValidateEmailDomain(email);
                    var vResonse = "Valid";
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

            fnCancelAction: function () {
                window.history.go(-1);
            },
            fnAdvancedSearchOpen: function () {
                if (!that.oAdvancedSearch) {
                    that.oAdvancedSearch = sap.ui.xmlfragment(
                        "ns.BuyerRegistration.fragments.AdvancedSearch", that);
                    oView.addDependent(that.oAdvancedSearch);
                }
                that.oAdvancedSearch.open();
            },
            fnCloseAdvancedSearch: function () {
                that.oAdvancedSearch.close();
            },
            // fnChangeRepOtherComp: function () {
            //     if (oView.byId("id_otherCompany").getSelectedIndex() == 0) {
            //         oView.getModel("oConfigMdl").getData().representAnotherCompany = true;
            //         oView.getModel("oConfigMdl").refresh();
            //     } else {
            //         oView.getModel("oConfigMdl").getData().representAnotherCompany = false;
            //         oView.getModel("oConfigMdl").refresh();
            //         if (!oView.getModel("JMBPCreate").getData().caseId) {

            //             oView.getModel("JMBPCreate").getData().altContactFirstName = "";
            //             oView.getModel("JMBPCreate").getData().altContactLastName = "";
            //             oView.getModel("JMBPCreate").getData().altContactJobTitle = "";
            //             oView.getModel("JMBPCreate").getData().altEmail = "";
            //             oView.getModel("JMBPCreate").getData().altPhoneNumber = "";
            //             oView.getModel("JMBPCreate").refresh();
            //         }
            //     }
            // },  
            fnChangeAttachmentVis: function () {

                if (oView.getModel("JMBPCreate").getData().addlSurveyForSuppliers == 0) {
                    oView.getModel("JMBPCreate").getData().buyerAttachmentVis = true;
                    oView.getModel("JMBPCreate").refresh();
                } else {
                    oView.getModel("JMBPCreate").getData().buyerAttachmentVis = false;
                    oView.getModel("JMBPCreate").refresh();
                }
            },
            fnChangeReqCOI: function () {
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
                oView.getModel("JMBPCreate").getData().requestorConflictOfInterestse = "None";
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
                if (vLength > 30) {
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
            fnChangeJobTitle: function () {
                if (oView.getModel("JMBPCreate").getData().jobTitlee == "Error") {
                    oView.getModel("JMBPCreate").getData().jobTitlee = "None";
                    oView.getModel("JMBPCreate").getData().jobTitlem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
            },

            fnChangeContactNumber: function () {
                if (oView.getModel("JMBPCreate").getData().contactNumbere == "Error") {
                    oView.getModel("JMBPCreate").getData().contactNumbere = "None";
                    oView.getModel("JMBPCreate").getData().contactNumberm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
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
                if (vLength > 40) {
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

            fnChangeContactNumber1: function (oEvent) {
                var numRegex = /^[1-9]\d*$/;
                var val = oEvent.getSource().getValue();
                var vLength = oEvent.getParameter("value").length
                if (vLength > 30) {
                    oView.getModel("JMBPCreate").getData().altPhoneNumbere = "Error";
                    oView.getModel("JMBPCreate").getData().altPhoneNumberm = oi18n.getProperty("BPCMaxLengthExceeds");
                    oView.getModel("JMBPCreate").refresh();
                } else if (!numRegex.test(oEvent.getSource().getValue())) {
                    var newval = val.substring(0, val.length - 1);
                    oEvent.getSource().setValue(newval);

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
            fnChangeEmailID1: function (oEvent) {
                var vLength = oEvent.getParameter("value").length;
                var email = oView.getModel("JMBPCreate").getData().altEmail;
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (!email.match(mailregex)) {
                    oView.getModel("JMBPCreate").getData().altEmaile = "Error";
                    oView.getModel("JMBPCreate").getData().altEmailm = oi18n.getProperty("BPCInvalidEmail");
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
                    var domain = email.substring(email.lastIndexOf("@") + 1);
                   if(domain.toUpperCase() != "JABIL.COM"){
                    oView.getModel("JMBPCreate").getData().requestorCOIEmaile = "Error";
                    oView.getModel("JMBPCreate").getData().requestorCOIEmailm = oi18n.getProperty("pleaseEnterJabilEmail");
                    oView.getModel("JMBPCreate").refresh();
                    return;
                   }

                    // var vResonse = this.fnValidateEmailDomain(email);
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


            fnMandatoryFieldClear: function () {
                if (oView.getModel("JMBPCreate").getData().plantm == oi18n.getProperty("BPCMandatoryValidationPlant")) {
                    oView.getModel("JMBPCreate").getData().plante = "None";
                    oView.getModel("JMBPCreate").getData().plantm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().workCellm == oi18n.getProperty("BPCMandatoryValidationWorkCell")) {
                    oView.getModel("JMBPCreate").getData().workCelle = "None";
                    oView.getModel("JMBPCreate").getData().workCellm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().companyCodem == oi18n.getProperty("BPCCompCodeMandat")) {
                    oView.getModel("JMBPCreate").getData().companyCodee = "None";
                    oView.getModel("JMBPCreate").getData().companyCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().instructionKeym == oi18n.getProperty("BPCMandatoryInstructionKey")) {
                    oView.getModel("JMBPCreate").getData().instructionKeye = "None";
                    oView.getModel("JMBPCreate").getData().instructionKeym = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().purchasingOrgm == oi18n.getProperty("BPCMandatoryValidationPOrg")) {
                    oView.getModel("JMBPCreate").getData().purchasingOrge = "None";
                    oView.getModel("JMBPCreate").getData().purchasingOrgm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().incoTermsm == oi18n.getProperty("BPCMandatoryValidationIncoterm")) {
                    oView.getModel("JMBPCreate").getData().incoTermse = "None";
                    oView.getModel("JMBPCreate").getData().incoTermsm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().incotermNameLocationm == oi18n.getProperty("BPCMandatoryValidationIncotermNamedLoc")) {
                    oView.getModel("JMBPCreate").getData().incotermNameLocatione = "None";
                    oView.getModel("JMBPCreate").getData().incotermNameLocationm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().corporationNamem == oi18n.getProperty("BPCMandatoryValidationCorpName")) {
                    oView.getModel("JMBPCreate").getData().corporationNamee = "None";
                    oView.getModel("JMBPCreate").getData().corporationNamem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().paymentTermsm == oi18n.getProperty("BPCMandatoryValidationPaymentTerms")) {
                    oView.getModel("JMBPCreate").getData().paymentTermse = "None";
                    oView.getModel("JMBPCreate").getData().paymentTermsm = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().address1m == oi18n.getProperty("BPCMandatoryValidationAddress1")) {
                    oView.getModel("JMBPCreate").getData().address1e = "None";
                    oView.getModel("JMBPCreate").getData().address1m = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().citym == oi18n.getProperty("BPCMandatoryValidationCity")) {
                    oView.getModel("JMBPCreate").getData().citye = "None";
                    oView.getModel("JMBPCreate").getData().citym = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().statem == oi18n.getProperty("BPCMandatoryValidationState")) {
                    oView.getModel("JMBPCreate").getData().statee = "None";
                    oView.getModel("JMBPCreate").getData().statem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().countrym == oi18n.getProperty("BPCMandatoryValidationCountry")) {
                    oView.getModel("JMBPCreate").getData().countrye = "None";
                    oView.getModel("JMBPCreate").getData().countrym = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().postalCodem == oi18n.getProperty("BPCMandatoryValidationPostalCode")) {
                    oView.getModel("JMBPCreate").getData().postalCodee = "None";
                    oView.getModel("JMBPCreate").getData().postalCodem = "";
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
                if (oView.getModel("JMBPCreate").getData().contactCountryCodem == oi18n.getProperty("BPCEnterCountryCode")) {
                    oView.getModel("JMBPCreate").getData().contactCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().contactCountryCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().mobileCountryCodem == oi18n.getProperty("BPCEnterCountryCode")) {
                    oView.getModel("JMBPCreate").getData().mobileCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().mobileCountryCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().altContactCountryCodem == oi18n.getProperty("BPCEnterCountryCode1")) {
                    oView.getModel("JMBPCreate").getData().altContactCountryCodee = "None";
                    oView.getModel("JMBPCreate").getData().altContactCountryCodem = "";
                    oView.getModel("JMBPCreate").refresh();
                }
                if (oView.getModel("JMBPCreate").getData().materialGroupm == oi18n.getProperty("pleaseProvideMaterialGroup")) {
                    oView.getModel("JMBPCreate").getData().materialGroupe = "None";
                    oView.getModel("JMBPCreate").getData().materialGroupm = "";
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
                oView.getModel("JMBPCreate").getData().conflicte = "None";
                oView.getModel("JMBPCreate").getData().customerDirectedSupplierIndicatorse = "None";
                oView.getModel("JMBPCreate").getData().oneTimePurchaseSupplierIndicatorse = "None";
                oView.getModel("JMBPCreate").getData().requestorConflictOfInterestse = "None";
                       
                oView.getModel("JMBPCreate").refresh();

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
                            oFormData.append("overwriteFlag", false);
                            oFormData.append("docDescription", aFileData[i].Desc);
                            oFormData.append("requestId", vCaseId);
                            oFormData.append("docInSection", "companyInfo");
                            oFormData.append("fileExt", file.name.split(".")[1]);
                            oFormData.append("type", "application/octet-stream");


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
            fnInputSpaceCheck: function (oEvent) {
                var spaceRegex = /^\s+$/;
                if (spaceRegex.test(oEvent.getSource().getValue())) {
                    oEvent.getSource().setValue("");
                }
            },
            onAfterRendering: function () {
                // oView.byId("purchaseOrgId").addEventDelegate({
                //     ontap: this.fnLiveChangePurchOrg
                // }, this);
            }

        });
    });
var options;
sap.ui.define([
    "com/jabil/surveyform/controller/BaseController",
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'com/jabil/surveyform/formatter/formatter',
    "sap/m/BusyDialog",
    "sap/ui/core/Fragment"

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 * @param {typeof sap.ui.core.mvc.Controller} BaseController 
	 * @param {typeof JSONModel} formatter 
	 */
    // @ts-ignore
	/**
 * @param {typeof sap.ui.core.mvc.Controller} BaseController 
 * @param {typeof JSONModel} formatter 
 */
    function (BaseController, JSONModel, MessageBox, formatter, BusyDialog, Fragment) {

        "use strict";
        var oBusyDialog, oBusyDialogFile, oBusyDialogLoadData, oView, oi18n, vAppName, copiedData, listenFirst, emailValidResult;
        return BaseController.extend("com.jabil.surveyform.controller.VendorSurvey", {
            formatter: formatter,
            onInit: function () {
                var screen = "Web";
                if (sap.ui.Device.system.phone === true) {
                    screen = "Phone";
                }
                var deviceModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(deviceModel, "deviceModel");
                if (screen === "Web") {
                    this.getView().getModel("deviceModel").setProperty("/hBoxWidth", "auto");

                } else if (screen === "Phone") {
                    this.getView().getModel("deviceModel").setProperty("/hBoxWidth", "70%");

                }

                var oJosnEnable = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oJosnEnable, "oEnableMdl");


                oBusyDialog = new sap.m.BusyDialog({ text: "Posting data" });
                oBusyDialogLoadData = new sap.m.BusyDialog({ text: "...please wait while the data is loading" });
                oBusyDialogFile = new sap.m.BusyDialog({ text: "Uploading File" });
                oView = this.getView();
                oi18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                var that = this;
                this.getView().byId("surveyWizard").mAggregations._progressNavigator.attachStepChanged(function (oEvent) {
                    if (oEvent.getSource()._iActiveStep == 11 || (oEvent.getSource().getStepCount() == 8 && oEvent.getSource()._iActiveStep == 8)) {
                        that.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStep = false;
                        that.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepAccept = false;
                        that.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepSave = false;
                        that.getOwnerComponent().getModel("oVisibilityModel").refresh(true);
                    }
                    if (oEvent.getSource().getStepCount() == 11) {
                        oEvent.getSource().getParent().setCurrentStep(oEvent.getSource().getParent().getSteps()[oEvent.getSource().getParent()._getProgressNavigator()._iCurrentStep - 1].sId);
                    } else if (oEvent.getSource().getStepCount() == 8) {
                        if (oEvent.getSource().getParent()._getProgressNavigator()._iCurrentStep == 1 || oEvent.getSource().getParent()._getProgressNavigator()._iCurrentStep == 2) {
                            oEvent.getSource().getParent().setCurrentStep(oEvent.getSource().getParent().getSteps()[oEvent.getSource().getParent()._getProgressNavigator()._iCurrentStep - 1].sId);
                        } else if (oEvent.getSource().getParent()._getProgressNavigator()._iCurrentStep == 7) {
                            oEvent.getSource().getParent().setCurrentStep(oEvent.getSource().getParent().getSteps()[oEvent.getSource().getParent()._getProgressNavigator()._iCurrentStep + 1].sId);
                        } else {
                            oEvent.getSource().getParent().setCurrentStep(oEvent.getSource().getParent().getSteps()[oEvent.getSource().getParent()._getProgressNavigator()._iCurrentStep].sId);
                        }
                    }
                     if (oEvent.getSource().getParent()._getProgressNavigator()._iCurrentStep == 1) {
                        oView.getModel("oEnableMdl").getData().BackBtnEnb = false;
                    } else {
                        oView.getModel("oEnableMdl").getData().BackBtnEnb = true;
                    }
                    oView.getModel("oEnableMdl").refresh();
                });
                this._router = this.getOwnerComponent().getRouter();
                this._router.getRoute("VendorSurvey").attachPatternMatched(this._fnHandleRouteMatched, this);
                // @ts-ignore
                this.getView().byId("surveyWizard").setRenderMode("Page");
                if (this.getView().byId("surveyWizard")._getProgressNavigator()._iCurrentStep == 1) {
                        oView.getModel("oEnableMdl").getData().BackBtnEnb = false;
                    } else {
                        oView.getModel("oEnableMdl").getData().BackBtnEnb = true;
                    }
                    oView.getModel("oEnableMdl").refresh();

            },


            _fnHandleRouteMatched: function (oEvent) {
                var that = this;
                var taskId = oEvent.getParameter("arguments").contextPath;
                vAppName = oEvent.getParameter("arguments").Name;
                if (vAppName == "Supplier") {
                    if (oView.getModel("oUserModel").getData().language == undefined || oView.getModel("oUserModel").getData().language == 'en' || oView.getModel("oUserModel").getData().language == 'en-US') {
                        that.getView().getModel("oVisibilityModel").getData().isdefaultLan = true;
                    } else {
                        that.getView().getModel("oVisibilityModel").getData().isdefaultLan = false;
                    }
                    that.getView().getModel("oVisibilityModel").refresh();

                }
                oi18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                var oDeferred = $.Deferred();
                that.fnSetSupplierFinanceView();
                this.getUser();
                if (taskId !== "") {
                    this.getTaskDetails(taskId, oDeferred, oi18n);
                    var aModel = new JSONModel();
                    var sUrl = "/comjabilsurveyform/WorkboxJavaService/inbox/isClaimed?eventId=" + taskId;
                    aModel.loadData(sUrl);
                    aModel.attachRequestCompleted(function (oEvent) {
                        if (oEvent.getParameter("success")) {
                            that.getOwnerComponent().getModel("oVisibilityModel").getData().claimedTask = oEvent.getSource().getData().isClaimed;
                            that.getOwnerComponent().getModel("oVisibilityModel").getData().isTaskCompleted = oEvent.getSource().getData().isTaskCompleted;
                            that.getOwnerComponent().getModel("oVisibilityModel").refresh();
                        }
                        else {
                            var sErMsg = oEvent.getParameter("errorobject").responseText;
                            MessageBox.show(sErMsg, {
                                icon: MessageBox.Icon.ERROR,
                                title: oi18n.getText("error")
                            });

                        }
                    });
                }

                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                this.getView().setModel(oi18n_En, "oi18n_En");
                this._fnLoadEnterpriseList();
                this._fnLoadSmallDisAdvList();
                this._fnLoadOperServicesList();
                this._fnLoadManuSuppliesList();

                this._fnLoadEstablishConnList();
                this._fnLoadBusinessActList();

                oDeferred.done(function () {
                    oBusyDialogLoadData.open();
                    that.assignNextStepByStep();
                    if (oView.getModel("oUserModel").getData().caseId !== "") {
                        var sUrl = "/comjabilsurveyform/plcm_portal_services/supplier/read/" + oView.getModel("oUserModel").getData().caseId;
                        var oModel = new JSONModel();
                        oModel.loadData(sUrl);
                        oModel.attachRequestCompleted(function onCompleted(oEvent) {
                            if (oEvent.getParameter("success")) {
                                if (oEvent.getSource().oData.businessPartnerId !== "") {
                                    if (!oEvent.getSource().oData.surveyInfoDto.isAuthority) {
                                        var existingData = oView.getModel("oDataModel").getData();
                                        existingData.caseId = oEvent.getSource().oData.caseId;
                                        existingData.businessPartnerId = oEvent.getSource().oData.businessPartnerId;
                                        existingData.surveyInfoDto.authorityContact = oEvent.getSource().oData.surveyInfoDto.authorityContact;
                                        existingData.surveyInfoDto.authorityContact.contactName = oEvent.getSource().oData.surveyInfoDto.authorityContact.firstName + " " + oEvent.getSource().oData.surveyInfoDto.authorityContact.lastName;
                                        existingData.surveyInfoDto.altContact = oEvent.getSource().oData.surveyInfoDto.altContact;
                                        existingData.surveyInfoDto.address[0] = oEvent.getSource().oData.surveyInfoDto.address[0];
                                        existingData.surveyInfoDto.supplierAddlDataId = oEvent.getSource().oData.surveyInfoDto.supplierAddlDataId;
                                        existingData.surveyInfoDto.supplierId = oEvent.getSource().oData.surveyInfoDto.supplierId;
                                        existingData.bankDto.isBankProvided = oEvent.getSource().oData.bankDto.isBankProvided;
                                        if (oEvent.getSource().oData.bankDto.isBankProvided) {
                                            existingData.bankDto.bankInfoDto[0] = oEvent.getSource().oData.bankDto.bankInfoDto[0];
                                        }
                                        existingData.bpCentral[0] = oEvent.getSource().oData.bpCentral[0];
                                        existingData.bpInfoDto.legalName = oEvent.getSource().oData.bpCentral[0].organisationName1;
                                        existingData.bpInfoDto.dunsNumber = oEvent.getSource().oData.bpInfoDto.dunsNumber;
                                        existingData.bpInfoDto.dunsRegistrationNum = oEvent.getSource().oData.bpInfoDto.dunsRegistrationNum;
                                        existingData.bpInfoDto.deletedInd = oEvent.getSource().oData.bpInfoDto.deletedInd;
                                        existingData.bpInfoDto.purchasingBlockInd = oEvent.getSource().oData.bpInfoDto.purchasingBlockInd;
                                        existingData.bpInfoDto.postBlockedInd = oEvent.getSource().oData.bpInfoDto.postBlockedInd;
                                        existingData.bpInfoDto.altPayeePartyAllowedInd = oEvent.getSource().oData.bpInfoDto.altPayeePartyAllowedInd;
                                        existingData.bpInfoDto.valueAddedTaxRelInd = oEvent.getSource().oData.bpInfoDto.valueAddedTaxRelInd;
                                        existingData.bpInfoDto.taxAuthorityPartyId = oEvent.getSource().oData.bpInfoDto.taxAuthorityPartyId;
                                        existingData.bpInfoDto.corporateGroupName = oEvent.getSource().oData.bpInfoDto.corporateGroupName;
                                        existingData.bpInfoDto.procurementTransactionBlockingCode = oEvent.getSource().oData.bpInfoDto.procurementTransactionBlockingCode;
                                        existingData.bpInfoDto.receiverRespTaxOfficePartyInternalId = oEvent.getSource().oData.bpInfoDto.receiverRespTaxOfficePartyInternalId;
                                        existingData.dateUpdated = oEvent.getSource().oData.dateUpdated;
                                        existingData.surveyInfoDto.isAuthority = null;
                                        existingData.surveyInfoDto.isJabilMainContact = null;
                                        existingData.shippingInfoDto = oEvent.getSource().oData.shippingInfoDto;
                                        existingData.defaultValuesDto = oEvent.getSource().oData.defaultValuesDto;

                                        that._fnLoadSupplierRegion(oEvent.getSource().oData.surveyInfoDto.address[0].postal[0].countryCode);
                                        //    that._fnGETSupplierAuthority();

                                    } else {
                                        oView.getModel("oDataModel").setData(oEvent.getSource().oData);
                                        that._fnLoadSupplierRegion(oEvent.getSource().oData.surveyInfoDto.address[0].postal[0].countryCode);
                                        oView.getModel("oDataModel").refresh();

                                    }

                                    if (oEvent.getSource().oData.surveyInfoDto.address[0].postal[0].countryCode) {
                                        var countryCode = oEvent.getSource().oData.surveyInfoDto.address[0].postal[0].countryCode;
                                        var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + countryCode;
                                        $.ajax({
                                            url: loadTaxTypeUrl,
                                            type: 'GET',
                                            success: function (data) {
                                                var postalCodeLength = parseInt(data[0].postalCodeLength);
                                                var postalCodeRule = parseInt(data[0].postalCodeRule)
                                                if (postalCodeLength == 0) {
                                                    var PostalCodeValidation = {
                                                        "postalCodeLength": 10,
                                                        "postalCodeRule": postalCodeRule
                                                    };
                                                } else {
                                                    var PostalCodeValidation = {
                                                        "postalCodeLength": postalCodeLength,
                                                        "postalCodeRule": postalCodeRule
                                                    };
                                                }

                                                oView.getModel("oLookUpModel").setProperty("/PostalCodeValidation", PostalCodeValidation);
                                                oView.getModel("oLookUpModel").refresh();
                                            },
                                            async: false,
                                            error: function (data) {

                                            }
                                        });
                                    }
                                    if (oEvent.getSource().oData.bpInfoDto.tax) {
                                        if (oEvent.getSource().oData.bpInfoDto.tax[0]) {
                                            var CountryCode1 = oEvent.getSource().oData.bpInfoDto.tax[0].country;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/taxType/" + CountryCode1;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    oView.getModel("oLookUpModel").setProperty("/taxType1", data);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });

                                            var selectedTaxType = oEvent.getSource().oData.bpInfoDto.tax[0].type;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax/validations/" + selectedTaxType;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var taxMaxLength = parseInt(data[0].taxNumLength);
                                                    var taxNumRule = parseInt(data[0].taxNumRule);
                                                    if (taxMaxLength == 0) {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": 20,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    } else {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": taxMaxLength,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    }


                                                    oView.getModel("oLookUpModel").setProperty("/taxIDValidation1", taxIDValidationData);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });

                                        }
                                        if (oEvent.getSource().oData.bpInfoDto.tax[1]) {
                                            var CountryCode2 = oEvent.getSource().oData.bpInfoDto.tax[1].country;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/taxType/" + CountryCode2;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    oView.getModel("oLookUpModel").setProperty("/taxType2", data);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });

                                            var selectedTaxType = oEvent.getSource().oData.bpInfoDto.tax[1].type;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax/validations/" + selectedTaxType;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var taxMaxLength = parseInt(data[0].taxNumLength);
                                                    var taxNumRule = parseInt(data[0].taxNumRule);
                                                    if (taxMaxLength == 0) {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": 20,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    } else {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": taxMaxLength,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/taxIDValidation2", taxIDValidationData);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });

                                        }
                                        if (oEvent.getSource().oData.bpInfoDto.tax[2]) {
                                            var CountryCode3 = oEvent.getSource().oData.bpInfoDto.tax[2].country;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/taxType/" + CountryCode3;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    oView.getModel("oLookUpModel").setProperty("/taxType3", data);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });
                                            var selectedTaxType = oEvent.getSource().oData.bpInfoDto.tax[2].type;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax/validations/" + selectedTaxType;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var taxMaxLength = parseInt(data[0].taxNumLength);
                                                    var taxNumRule = parseInt(data[0].taxNumRule);
                                                    if (taxMaxLength == 0) {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": 20,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    } else {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": taxMaxLength,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/taxIDValidation3", taxIDValidationData);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });


                                        }
                                        if (oEvent.getSource().oData.bpInfoDto.tax[3]) {
                                            var CountryCode4 = oEvent.getSource().oData.bpInfoDto.tax[3].country;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/taxType/" + CountryCode4;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    oView.getModel("oLookUpModel").setProperty("/taxType4", data);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });
                                            var selectedTaxType = oEvent.getSource().oData.bpInfoDto.tax[3].type;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax/validations/" + selectedTaxType;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var taxMaxLength = parseInt(data[0].taxNumLength);
                                                    var taxNumRule = parseInt(data[0].taxNumRule);
                                                    if (taxMaxLength == 0) {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": 20,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    } else {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": taxMaxLength,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/taxIDValidation4", taxIDValidationData);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });


                                        }
                                        if (oEvent.getSource().oData.bpInfoDto.tax[4]) {
                                            var CountryCode5 = oEvent.getSource().oData.bpInfoDto.tax[4].country;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/taxType/" + CountryCode5;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    oView.getModel("oLookUpModel").setProperty("/taxType5", data);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });
                                            var selectedTaxType = oEvent.getSource().oData.bpInfoDto.tax[4].type;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax/validations/" + selectedTaxType;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var taxMaxLength = parseInt(data[0].taxNumLength);
                                                    var taxNumRule = parseInt(data[0].taxNumRule);
                                                    if (taxMaxLength == 0) {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": 20,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    } else {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": taxMaxLength,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/taxIDValidation5", taxIDValidationData);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });


                                        }
                                        if (oEvent.getSource().oData.bpInfoDto.tax[5]) {
                                            var CountryCode6 = oEvent.getSource().oData.bpInfoDto.tax[5].country;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/taxType/" + CountryCode6;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    oView.getModel("oLookUpModel").setProperty("/taxType6", data);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });
                                            var selectedTaxType = oEvent.getSource().oData.bpInfoDto.tax[5].type;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax/validations/" + selectedTaxType;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var taxMaxLength = parseInt(data[0].taxNumLength);
                                                    var taxNumRule = parseInt(data[0].taxNumRule);
                                                    if (taxMaxLength == 0) {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": 20,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    } else {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": taxMaxLength,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/taxIDValidation6", taxIDValidationData);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });


                                        }
                                        if (oEvent.getSource().oData.bpInfoDto.tax[6]) {
                                            var CountryCode7 = oEvent.getSource().oData.bpInfoDto.tax[6].country;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/taxType/" + CountryCode7;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    oView.getModel("oLookUpModel").setProperty("/taxType7", data);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });
                                            var selectedTaxType = oEvent.getSource().oData.bpInfoDto.tax[6].type;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax/validations/" + selectedTaxType;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var taxMaxLength = parseInt(data[0].taxNumLength);
                                                    var taxNumRule = parseInt(data[0].taxNumRule);
                                                    if (taxMaxLength == 0) {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": 20,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    } else {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": taxMaxLength,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/taxIDValidation7", taxIDValidationData);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });


                                        }
                                        if (oEvent.getSource().oData.bpInfoDto.tax[7]) {
                                            var CountryCode8 = oEvent.getSource().oData.bpInfoDto.tax[7].country;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/taxType/" + CountryCode8;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    oView.getModel("oLookUpModel").setProperty("/taxType8", data);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {


                                                }
                                            });
                                            var selectedTaxType = oEvent.getSource().oData.bpInfoDto.tax[7].type;
                                            var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax/validations/" + selectedTaxType;
                                            $.ajax({
                                                url: loadTaxTypeUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var taxMaxLength = parseInt(data[0].taxNumLength);
                                                    var taxNumRule = parseInt(data[0].taxNumRule);
                                                    if (taxMaxLength == 0) {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": 20,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    } else {
                                                        var taxIDValidationData = {
                                                            "taxMaxLength": taxMaxLength,
                                                            "taxNumRule": taxNumRule
                                                        }
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/taxIDValidation8", taxIDValidationData);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });


                                        }
                                    }
                                    //commented validation logic for bank fields based on country- Siva, Date:05/10/2021
                                    // if (oEvent.getSource().oData.bankDto.bankInfoDto[0].bankCountry && oEvent.getSource().oData.bankDto.bankInfoDto[0].bankCountry != "") {
                                    //     var bankCountryCode = oEvent.getSource().oData.bankDto.bankInfoDto[0].bankCountry;
                                    //     var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + bankCountryCode;
                                    //     $.ajax({
                                    //         url: loadTaxTypeUrl,
                                    //         type: 'GET',
                                    //         success: function (data) {
                                    //             var bankNumLength = parseInt(data[0].bankNumLength);
                                    //             var bankAccNumLength = parseInt(data[0].bankAccNumLength);
                                    //             var bankNumRule = parseInt(data[0].bankNumRule);
                                    //             var bankAccNumRule = parseInt(data[0].bankAccNumRule);
                                    //             var oBankValidation = {
                                    //                 "bankNumLength": bankNumLength,
                                    //                 "bankAccNumLength": bankAccNumLength,
                                    //                 "bankNumRule": bankNumRule,
                                    //                 "bankAccNumRule": bankAccNumRule
                                    //             };
                                    //             oView.getModel("oVisibilityModel").setProperty("/bankValidation", oBankValidation);
                                    //         },
                                    //         async: false,
                                    //         error: function (data) {
                                    //             var eMsg = data.responseText
                                    //             MessageBox.show(eMsg, {
                                    //                 icon: sap.m.MessageBox.Icon.ERROR,
                                    //                 title: oi18n.getText("error")
                                    //             });

                                    //         }
                                    //     });

                                    // }


                                    if (oEvent.getSource().oData.comInfoDto.address) {

                                        if (oEvent.getSource().oData.comInfoDto.address && oEvent.getSource().oData.comInfoDto.address.length > 1) {
                                            var cModel = new JSONModel();
                                            var rModel = new JSONModel();
                                            cModel.setData(
                                                {
                                                    "isOrderFromAddress": oEvent.getSource().oData.comInfoDto.isOrderToAddress,
                                                    "oName": oEvent.getSource().oData.comInfoDto.address[0].postal[0].name,
                                                    "oAddress1": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address1,
                                                    "oAddress2": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address2,
                                                    "oAddress3": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address3,
                                                    "oAddress4": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address4,
                                                    "oAddress5": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address5,
                                                    "oDist": oEvent.getSource().oData.comInfoDto.address[0].postal[0].district,
                                                    "oPostalCode": oEvent.getSource().oData.comInfoDto.address[0].postal[0].postalCode,
                                                    "oCity": oEvent.getSource().oData.comInfoDto.address[0].postal[0].city,
                                                    "oCountry": oEvent.getSource().oData.comInfoDto.address[0].postal[0].country,
                                                    "oRegion": oEvent.getSource().oData.comInfoDto.address[0].postal[0].region,
                                                    "oCountryC": oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryCode,
                                                    "oRegionC": oEvent.getSource().oData.comInfoDto.address[0].postal[0].regionCode,
                                                    "oTeleNum": oEvent.getSource().oData.comInfoDto.address[0].postal[0].telephone[0].telephoneNum,
                                                    "oFaxNum": oEvent.getSource().oData.comInfoDto.address[0].postal[0].fax[0].faxNum,
                                                    "oPostOffBox": oEvent.getSource().oData.comInfoDto.address[0].postal[0].postOfficeBox,
                                                    "oPostOffZipCode": oEvent.getSource().oData.comInfoDto.address[0].postal[0].postOfficeBoxZipCode,
                                                    "haveDiversityCertifications": oEvent.getSource().oData.comInfoDto.haveDiversityCertifications,
                                                    "companyWebsite": oEvent.getSource().oData.comInfoDto.companyWebsite
                                                });
                                            rModel.setData({
                                                "isRemitToAddress": oEvent.getSource().oData.comInfoDto.isRemitToAddress || false,

                                                "rName": oEvent.getSource().oData.comInfoDto.address[1].postal[0].name,
                                                "rAddress1": oEvent.getSource().oData.comInfoDto.address[1].postal[0].address1,
                                                "rAddress2": oEvent.getSource().oData.comInfoDto.address[1].postal[0].address2,
                                                "rAddress3": oEvent.getSource().oData.comInfoDto.address[1].postal[0].address3,
                                                "rAddress4": oEvent.getSource().oData.comInfoDto.address[1].postal[0].address4,
                                                "rAddress5": oEvent.getSource().oData.comInfoDto.address[1].postal[0].address5,
                                                "rDist": oEvent.getSource().oData.comInfoDto.address[1].postal[0].district,
                                                "rPostalCode": oEvent.getSource().oData.comInfoDto.address[1].postal[0].postalCode,
                                                "rCity": oEvent.getSource().oData.comInfoDto.address[1].postal[0].city,
                                                "rCountry": oEvent.getSource().oData.comInfoDto.address[1].postal[0].country,
                                                "rRegion": oEvent.getSource().oData.comInfoDto.address[1].postal[0].region,
                                                "rCountryC": oEvent.getSource().oData.comInfoDto.address[1].postal[0].countryCode,
                                                "rRegionC": oEvent.getSource().oData.comInfoDto.address[1].postal[0].regionCode,
                                                "rTeleNum": oEvent.getSource().oData.comInfoDto.address[1].postal[0].telephone[0].telephoneNum,
                                                "rFaxNum": oEvent.getSource().oData.comInfoDto.address[1].postal[0].fax[0].faxNum,
                                                "rPostOffBox": oEvent.getSource().oData.comInfoDto.address[1].postal[0].postOfficeBox,
                                                "rPostOffZipCode": oEvent.getSource().oData.comInfoDto.address[1].postal[0].postOfficeBoxZipCode

                                            });
                                            oView.setModel(cModel, "companyInfoModel");
                                            oView.setModel(rModel, "remitModel");
                                            var oModel = new JSONModel();
                                            var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/regions/?country=" + oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryCode;
                                            oModel.loadData(sUrl, {
                                                "Content-Type": "application/json"
                                            });
                                            oModel.attachRequestCompleted(function (oEve) {
                                                if (oEve.getParameter("success")) {
                                                    oView.getModel("oLookUpModel").setProperty("/StateOFA", oEve.getSource().getData());
                                                    oView.getModel("oLookUpModel").refresh();
                                                }
                                            });
                                            var aModel = new JSONModel();
                                            var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/regions/?country=" + oEvent.getSource().oData.comInfoDto.address[1].postal[0].countryCode;
                                            aModel.loadData(sUrl, {
                                                "Content-Type": "application/json"
                                            });
                                            aModel.attachRequestCompleted(function (oEve) {
                                                if (oEve.getParameter("success")) {
                                                    oView.getModel("oLookUpModel").setProperty("/StateRTA", oEve.getSource().getData());
                                                    oView.getModel("oLookUpModel").refresh();
                                                }
                                            });

                                            var loadPostalCodeOFAUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryCode;
                                            $.ajax({
                                                url: loadPostalCodeOFAUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var postalCodeLength = parseInt(data[0].postalCodeLength);
                                                    var postalCodeRule = parseInt(data[0].postalCodeRule)
                                                    if (postalCodeLength == 0) {
                                                        var PostalCodeValidation = {
                                                            "postalCodeLength": 10,
                                                            "postalCodeRule": postalCodeRule
                                                        };
                                                    } else {
                                                        var PostalCodeValidation = {
                                                            "postalCodeLength": postalCodeLength,
                                                            "postalCodeRule": postalCodeRule
                                                        };
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/PostalCodeValidationOFA", PostalCodeValidation);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });

                                            var loadPostalCodeRTAUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + oEvent.getSource().oData.comInfoDto.address[1].postal[0].countryCode;
                                            $.ajax({
                                                url: loadPostalCodeRTAUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var postalCodeLength = parseInt(data[0].postalCodeLength);
                                                    var postalCodeRule = parseInt(data[0].postalCodeRule)
                                                    if (postalCodeLength == 0) {
                                                        var PostalCodeValidation = {
                                                            "postalCodeLength": 10,
                                                            "postalCodeRule": postalCodeRule
                                                        };
                                                    } else {
                                                        var PostalCodeValidation = {
                                                            "postalCodeLength": postalCodeLength,
                                                            "postalCodeRule": postalCodeRule
                                                        };
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/PostalCodeValidationRTA", PostalCodeValidation);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });


                                            // oView.byId("iAddress1").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].address1,
                                            //     oView.byId("iAddress2").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].address2,

                                            //     oView.byId("iPostal").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].postalCode,
                                            //     oView.byId("iCity").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].city,
                                            //     oView.byId("iState").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryKey,
                                            //     oView.byId("iCountry").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].region,
                                            //     oView.byId("iAddress1R").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[1].postal[0].address1,
                                            //     oView.byId("iAddress2R").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].address2,

                                            //     oView.byId("iPostalR").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].postalCode,
                                            //     oView.byId("iCityR").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].city,
                                            //     oView.byId("iCountryR").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryKey,
                                            //     oView.byId("iStateR").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].region

                                        }
                                        else if (oEvent.getSource().oData.comInfoDto.address[0] && oEvent.getSource().oData.comInfoDto.address[0].addressInSection == "CompanyInfo-OFA") {

                                            var cModel = new JSONModel();
                                            var rModel = new JSONModel();
                                            cModel.setData(
                                                {
                                                    "isOrderFromAddress": oEvent.getSource().oData.comInfoDto.isOrderToAddress,
                                                    "oName": oEvent.getSource().oData.comInfoDto.address[0].postal[0].name,
                                                    "oAddress1": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address1,
                                                    "oAddress2": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address2,
                                                    "oAddress3": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address3,
                                                    "oAddress4": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address4,
                                                    "oAddress5": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address5,
                                                    "oDist": oEvent.getSource().oData.comInfoDto.address[0].postal[0].district,
                                                    "oPostalCode": oEvent.getSource().oData.comInfoDto.address[0].postal[0].postalCode,
                                                    "oCity": oEvent.getSource().oData.comInfoDto.address[0].postal[0].city,
                                                    "oCountry": oEvent.getSource().oData.comInfoDto.address[0].postal[0].country,
                                                    "oRegion": oEvent.getSource().oData.comInfoDto.address[0].postal[0].region,
                                                    "oCountryC": oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryCode,
                                                    "oRegionC": oEvent.getSource().oData.comInfoDto.address[0].postal[0].regionCode,

                                                    "oTeleNum": oEvent.getSource().oData.comInfoDto.address[0].postal[0].telephone[0].telephoneNum,
                                                    "oFaxNum": oEvent.getSource().oData.comInfoDto.address[0].postal[0].fax[0].faxNum,
                                                    "oPostOffBox": oEvent.getSource().oData.comInfoDto.address[0].postal[0].postOfficeBox,
                                                    "oPostOffZipCode": oEvent.getSource().oData.comInfoDto.address[0].postal[0].postOfficeBoxZipCode,
                                                    "haveDiversityCertifications": oEvent.getSource().oData.comInfoDto.haveDiversityCertifications,
                                                    "companyWebsite": oEvent.getSource().oData.comInfoDto.companyWebsite
                                                });
                                            rModel.setData({
                                                "isRemitToAddress": oEvent.getSource().oData.comInfoDto.isRemitToAddress || false,
                                                "rName": "",
                                                "rAddress1": "",
                                                "rAddress2": "",
                                                "rAddress3": "",
                                                "rAddress4": "",
                                                "rAddress5": "",
                                                "rDist": "",
                                                "rPostalCode": "",
                                                "rCity": "",
                                                "rCountry": "",
                                                "rRegion": "",
                                                "rTeleNum": "",
                                                "rFaxNum": "",
                                                "rPostOffBox": "",
                                                "rPostOffZipCode": ""

                                            });
                                            oView.setModel(cModel, "companyInfoModel");
                                            oView.setModel(rModel, "remitModel");
                                            var oModel = new JSONModel();
                                            var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/regions/?country=" + oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryCode;
                                            oModel.loadData(sUrl, {
                                                "Content-Type": "application/json"
                                            });
                                            oModel.attachRequestCompleted(function (oEve) {
                                                if (oEve.getParameter("success")) {
                                                    oView.getModel("oLookUpModel").setProperty("/StateOFA", oEve.getSource().getData());
                                                    oView.getModel("oLookUpModel").refresh();
                                                }
                                            });
                                            var loadPostalCodeOFAUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryCode;
                                            $.ajax({
                                                url: loadPostalCodeOFAUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var postalCodeLength = parseInt(data[0].postalCodeLength);
                                                    var postalCodeRule = parseInt(data[0].postalCodeRule)
                                                    if (postalCodeLength == 0) {
                                                        var PostalCodeValidation = {
                                                            "postalCodeLength": 10,
                                                            "postalCodeRule": postalCodeRule
                                                        };
                                                    } else {
                                                        var PostalCodeValidation = {
                                                            "postalCodeLength": postalCodeLength,
                                                            "postalCodeRule": postalCodeRule
                                                        };
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/PostalCodeValidationOFA", PostalCodeValidation);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });


                                            // oView.byId("iAddress1").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].address1,
                                            //     oView.byId("iAddress2").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].address2,

                                            //     oView.byId("iPostal").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].postalCode,
                                            //     oView.byId("iCity").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].city,
                                            //     oView.byId("iState").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryKey,
                                            //     oView.byId("iCountry").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].region



                                        } else if (oEvent.getSource().oData.comInfoDto.address[0] && oEvent.getSource().oData.comInfoDto.address[0].addressInSection == "CompanyInfo-RTA") {

                                            var cModel = new JSONModel();
                                            var rModel = new JSONModel();
                                            cModel.setData(
                                                {
                                                    "isOrderFromAddress": oEvent.getSource().oData.comInfoDto.isOrderToAddress,
                                                    "oName": "",
                                                    "oAddress1": "",
                                                    "oAddress2": "",
                                                    "oAddress3": "",
                                                    "oAddress4": "",
                                                    "oAddress5": "",
                                                    "oDist": "",
                                                    "oPostalCode": "",
                                                    "oCity": "",
                                                    "oCountry": "",
                                                    "oRegion": "",
                                                    "oTeleNum": "",
                                                    "oFaxNum": "",
                                                    "oPostOffBox": "",
                                                    "oPostOffZipCode": "",
                                                    "haveDiversityCertifications": oEvent.getSource().oData.comInfoDto.haveDiversityCertifications,
                                                    "companyWebsite": oEvent.getSource().oData.comInfoDto.companyWebsite
                                                });

                                            rModel.setData({
                                                "isRemitToAddress": oEvent.getSource().oData.comInfoDto.isRemitToAddress || false,
                                                "rName": oEvent.getSource().oData.comInfoDto.address[0].postal[0].name,
                                                "rAddress1": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address1,
                                                "rAddress2": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address2,
                                                "rAddress3": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address3,
                                                "rAddress4": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address4,
                                                "rAddress5": oEvent.getSource().oData.comInfoDto.address[0].postal[0].address5,
                                                "rDist": oEvent.getSource().oData.comInfoDto.address[0].postal[0].district,
                                                "rPostalCode": oEvent.getSource().oData.comInfoDto.address[0].postal[0].postalCode,
                                                "rCity": oEvent.getSource().oData.comInfoDto.address[0].postal[0].city,
                                                "rCountry": oEvent.getSource().oData.comInfoDto.address[0].postal[0].country,
                                                "rRegion": oEvent.getSource().oData.comInfoDto.address[0].postal[0].region,
                                                "rCountryC": oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryCode,
                                                "rRegionC": oEvent.getSource().oData.comInfoDto.address[0].postal[0].regionCode,
                                                "rTeleNum": oEvent.getSource().oData.comInfoDto.address[0].postal[0].telephone[0].telephoneNum,
                                                "rFaxNum": oEvent.getSource().oData.comInfoDto.address[0].postal[0].fax[0].faxNum,
                                                "rPostOffBox": oEvent.getSource().oData.comInfoDto.address[0].postal[0].postOfficeBox,
                                                "rPostOffZipCode": oEvent.getSource().oData.comInfoDto.address[0].postal[0].postOfficeBoxZipCode,

                                            });
                                            oView.setModel(cModel, "companyInfoModel");
                                            oView.setModel(rModel, "remitModel");
                                            var aModel = new JSONModel();
                                            var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/regions/?country=" + oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryCode;
                                            aModel.loadData(sUrl, {
                                                "Content-Type": "application/json"
                                            });
                                            aModel.attachRequestCompleted(function (oEve) {
                                                if (oEve.getParameter("success")) {
                                                    oView.getModel("oLookUpModel").setProperty("/StateRTA", oEve.getSource().getData());
                                                    oView.getModel("oLookUpModel").refresh();
                                                }
                                            });

                                            var loadPostalCodeRTAUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryCode;
                                            $.ajax({
                                                url: loadPostalCodeRTAUrl,
                                                type: 'GET',
                                                success: function (data) {
                                                    var postalCodeLength = parseInt(data[0].postalCodeLength);
                                                    var postalCodeRule = parseInt(data[0].postalCodeRule)
                                                    if (postalCodeLength == 0) {
                                                        var PostalCodeValidation = {
                                                            "postalCodeLength": 10,
                                                            "postalCodeRule": postalCodeRule
                                                        };
                                                    } else {
                                                        var PostalCodeValidation = {
                                                            "postalCodeLength": postalCodeLength,
                                                            "postalCodeRule": postalCodeRule
                                                        };
                                                    }

                                                    oView.getModel("oLookUpModel").setProperty("/PostalCodeValidationRTA", PostalCodeValidation);
                                                    oView.getModel("oLookUpModel").refresh();
                                                },
                                                async: false,
                                                error: function (data) {

                                                }
                                            });
                                            // oView.byId("iAddress1R").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].address1,
                                            //     oView.byId("iAddress2R").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].address2,

                                            //     oView.byId("iPostalR").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].postalCode,
                                            //     oView.byId("iCityR").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].city,
                                            //     oView.byId("iCountryR").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].countryKey,
                                            //     oView.byId("iStateR").getDomRef().value = oEvent.getSource().oData.comInfoDto.address[0].postal[0].region


                                        }
                                        else {
                                            //  oView.getModel("oDataModel").getData().comInfoDto.address = [];
                                            var cModel = new JSONModel();
                                            var rModel = new JSONModel();
                                            cModel.setData(
                                                {
                                                    "isOrderFromAddress": false,
                                                    "oName": "",
                                                    "oAddress1": "",
                                                    "oAddress2": "",
                                                    "oAddress3": "",
                                                    "oAddress4": "",
                                                    "oAddress5": "",
                                                    "oDist": "",
                                                    "oPostalCode": "",
                                                    "oCity": "",
                                                    "oCountry": "",
                                                    "oRegion": "",
                                                    "oCountryC": "",
                                                    "oRegionC": "",
                                                    "oTeleNum": "",
                                                    "oFaxNum": "",
                                                    "oPostOffBox": "",
                                                    "oPostOffZipCode": "",
                                                    "haveDiversityCertifications": oEvent.getSource().oData.comInfoDto.haveDiversityCertifications,
                                                    "companyWebsite": oView.getModel("oDataModel").getData().comInfoDto.companyWebsite
                                                });
                                            rModel.setData({
                                                "isRemitToAddress": false,
                                                "rName": "",
                                                "rAddress1": "",
                                                "rAddress2": "",
                                                "rAddress3": "",
                                                "rAddress4": "",
                                                "rAddress5": "",
                                                "rDist": "",
                                                "rPostalCode": "",
                                                "rCity": "",
                                                "rCountry": "",
                                                "rRegion": "",
                                                "rCountryC": "",
                                                "rRegionC": "",
                                                "rTeleNum": "",
                                                "rFaxNum": "",
                                                "rPostOffBox": "",
                                                "rPostOffZipCode": ""


                                            });
                                            oView.setModel(cModel, "companyInfoModel");
                                            oView.setModel(rModel, "remitModel");

                                        }
                                    }

                                    oView.getModel("oDataModel").refresh();
                                    that._fnLoadDropDownModel();
                                    that._fnLoadLookUpModel(oEvent.getSource().oData);
                                    that._fnLoadOperServList(oEvent.getSource().oData);
                                    that._fnLoadManServList(oEvent.getSource().oData);

                                    that._fnReadDocumentList(oEvent.getSource().oData.caseId, that);


                                }
                                oBusyDialogLoadData.close();

                            }

                            else if (oEvent.getParameter("errorobject").statusCode == 400 || oEvent.getParameter("errorobject").statusCode == 404 || oEvent.getParameter("errorobject").statusCode == 409 || oEvent.getParameter("errorobject").statusCode == 500) {

                                var sUrl = "/comjabilsurveyform/plcm_portal_services/case/findById/" + oView.getModel("oUserModel").getData().caseId;
                                var oModel = new JSONModel();
                                var cDeffered = $.Deferred();
                                oModel.loadData(sUrl);
                                oModel.attachRequestCompleted(function onCompleted(oEvent) {
                                    if (oEvent.getParameter("success")) {
                                        var a = that.getView().getModel("oDataModel").getData().surveyInfoDto.authorityContact;
                                        var b = that.getView().getModel("oDataModel").getData().surveyInfoDto.altContact;
                                        var c = that.getView().getModel("oDataModel").getData().shippingInfoDto;
                                        var d = that.getView().getModel("oDataModel").getData().bpCentral[0];
                                        var e = that.getView().getModel("oDataModel").getData().bankDto.bankInfoDto[0];
                                        var address = that.getView().getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0];
                                        a.contactName = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.firstName + " " + oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.lastName;
                                        a.firstName = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.firstName;
                                        a.lastName = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.lastName;
                                        a.contact = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.telephone;
                                        a.mobile = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.contactMobilePhone;
                                        a.email = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.email;
                                        a.countryContactCode = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.contactCountryCode;
                                        a.countryMobileCode =oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.mobileCountryCode;
                                        b.firstName = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.altContactFirstName;
                                        b.lastName = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.altContactLastName;
                                        b.contact = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.altPhoneNumber;
                                        b.jobTitle = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.altContactJobTitle;
                                        b.email = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.altEmail;
                                        b.countryContactCode = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.altContactCountryCode
                                        c.paymentTerms = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.paymentTerms;
                                        c.incoterm = oEvent.getSource().getData().bpRequestScope.incoTerms;
                                        c.incotermNamedPlace = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.incotermNameLocation;
                                        d.organisationName1 = oEvent.getSource().getData().bpRequestScope.corporationName;
                                        d.organisationName2 = oEvent.getSource().getData().bpRequestScope.corporationName2;
                                        d.organisationName3 = oEvent.getSource().getData().bpRequestScope.corporationName3;
                                        d.organisationName4 = oEvent.getSource().getData().bpRequestScope.corporationName4;
                                        e.instructionKey = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.instructionKey;
                                        address.address1 = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.address1;
                                        address.address2 = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.address2;
                                        address.address3 = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.address3;
                                        address.address4 = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.address4;
                                        address.address5 = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.address5;
                                        address.district = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.district;
                                        address.regionCode = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.state;
                                        address.postalCode = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.postalCode;
                                        address.city = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.city;
                                        address.countryCode = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.country;
                                        that._fnLoadSupplierRegion(address.countryCode);
                                        address.fax[0].faxNum = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.fax;
                                        address.poBoxPostalCode = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.poBoxPostalCode;
                                        address.url[0].websiteUrl = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.supplierUrlCompanyWebsite;
                                        if (oEvent.getSource().getData().bpRequestScope.isNew) {
                                            that.getView().getModel("oDataModel").getData().bpInfoDto.legalName = oEvent.getSource().getData().bpRequestScope.corporationName;
                                            that.getView().getModel("oDataModel").getData().bpInfoDto.dunsNumber = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.dunsNumber;
                                        }
                                        that.getView().getModel("oDataModel").getData().shippingInfoDto.purchasingOrg = oEvent.getSource().getData().bpRequestScope.purchasingOrg;
                                        that.getView().getModel("oDataModel").getData().shippingInfoDto.comCode = oEvent.getSource().getData().bpRequestScope.companyCode;
                                        that.getView().getModel("oDataModel").getData().shippingInfoDto.plant = oEvent.getSource().getData().bpRequestScope.plant;
                                        that.getView().getModel("oDataModel").refresh();
                                        cDeffered.resolve();
                                        that.getOwnerComponent().getModel("oVisibilityModel").getData().buyerSurveyAttach = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.addlSurveyForSupplier;
                                        that.getOwnerComponent().getModel("oVisibilityModel").refresh();
                                        oBusyDialogLoadData.close();
                                    }
                                    else {
                                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                                        MessageBox.show(sErMsg, {
                                            icon: MessageBox.Icon.ERROR,
                                            title: oi18n.getText("error")
                                        });
                                        oBusyDialogLoadData.close();
                                    }
                                });
                                that._fnLoadDropDownModel();
                                cDeffered.done(function () {
                                    that._fnLoadPaymentMethod();
                                });
                                var cModel = new JSONModel();
                                var rModel = new JSONModel();
                                cModel.setData(
                                    {
                                        "isOrderFromAddress": false,
                                        "oName": "",
                                        "oAddress1": "",
                                        "oAddress2": "",
                                        "oAddress3": "",
                                        "oAddress4": "",
                                        "oAddress5": "",
                                        "oDist": "",
                                        "oPostalCode": "",
                                        "oCity": "",
                                        "oCountry": "",
                                        "oRegion": "",
                                        "oCountryC": "",
                                        "oRegionC": "",
                                        "oTeleNum": "",
                                        "oFaxNum": "",
                                        "oPostOffBox": "",
                                        "oPostOffZipCode": "",
                                        "haveDiversityCertifications": null,
                                        "companyWebsite": ""
                                    });
                                rModel.setData({
                                    "isRemitToAddress": false,
                                    "rName": "",
                                    "rAddress1": "",
                                    "rAddress2": "",
                                    "rAddress3": "",
                                    "rAddress4": "",
                                    "rAddress5": "",
                                    "rDist": "",
                                    "rPostalCode": "",
                                    "rCity": "",
                                    "rCountry": "",
                                    "rRegion": "",
                                    "rCountryC": "",
                                    "rRegionC": "",
                                    "rTeleNum": "",
                                    "rFaxNum": "",
                                    "rPostOffBox": "",
                                    "rPostOffZipCode": "",


                                });
                                oView.setModel(cModel, "companyInfoModel");
                                oView.setModel(rModel, "remitModel");
                                that._fnReadDocumentList(oView.getModel("oUserModel").getData().caseId, that);

                            } else {
                                var sErMsg = oEvent.getParameter("errorobject").responseText;
                                MessageBox.show(sErMsg, {
                                    icon: MessageBox.Icon.ERROR,
                                    title: oi18n.getText("error")
                                });
                                oBusyDialogLoadData.close();
                            }

                        }
                        );

                    }
                });
            },
            _fnGETSupplierAuthority: function () {
                var sUrl = "/comjabilsurveyform/plcm_portal_services/case/findById/" + oView.getModel("oUserModel").getData().caseId;
                var bModel = new JSONModel();

                bModel.loadData(sUrl);
                bModel.attachRequestCompleted(function onCompleted(oEvent) {
                    if (oEvent.getParameter("success")) {
                        var a = oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact;
                        a.contactName = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.firstName + " " + oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.lastName;
                        a.firstName = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.firstName;
                        a.lastName = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.lastName;
                        a.contact = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.telephone;
                        a.mobile = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.contactMobilePhone;
                        a.email = oEvent.getSource().getData().bpRequestScope.bpRequestScopeAddlDetails.email;
                        oView.getModel("oDataModel").refresh();
                    } else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });
                    }
                });
                oView.getModel("oDataModel").refresh();

            },
            _fnLoadLookUpModel: function (resultModel) {
                var establishConnection = oView.getModel("oLookUpModel").getData().orgEstablishConnection;
                var resultData = resultModel.itCyberDto.orgEstablishConnection;
                if (resultData && resultData.length > 0) {
                    $.each(establishConnection, function (index, row) {
                        $.each(resultData, function (index1, row1) {
                            if (row.value == row1.value) {
                                row.isSelected = row1.isSelected;
                            } if (row1.value == "Other connection type") {
                                row.otherValue = row1.otherValue;
                            }
                        });
                    });
                }
                var businessConnection = oView.getModel("oLookUpModel").getData().orgBusinessActivities;
                var resultData = resultModel.itCyberDto.orgBusinessActivities;
                if (resultData && resultData.length > 0) {
                    $.each(businessConnection, function (index, row) {
                        $.each(resultData, function (index1, row1) {
                            if (row.value == row1.value) {
                                row.isSelected = row1.isSelected;
                            } if (row1.value == "Other data type") {
                                row.otherValue = row1.otherValue;
                            }
                        });
                    });
                }

                var tableData = oView.getModel("oLookUpModel").getData().tabledata;
                var resultContactData = resultModel.comContactDto;
                if (resultContactData && resultContactData.length > 0) {
                    $.each(tableData, function (index, row) {
                        $.each(resultContactData, function (index1, row1) {
                            if (row.contactType == row1.contactType) {
                                row.contactId = row1.contactId;
                                row.countryContactCode = row1.countryContactCode;
                                row.extension = row1.extension;
                                row.firstName = row1.firstName;
                                row.jobTitle = row1.jobTitle;
                                row.contact = row1.contact;
                                row.lastName = row1.lastName;
                                row.email = row1.email;
                            }
                        });
                    });
                }
                if (resultModel.comInfoDto.address[0] && resultModel.comInfoDto.address[0].postal[0].country == "United States") {
                    var enterpriseList = oView.getModel("oLookUpModel").getData().enterprise;
                    var resultData1 = resultModel.comInfoDto.enterprise;
                    if (resultData1 && resultData1.length > 0) {
                        $.each(enterpriseList, function (index, row) {
                            $.each(resultData1, function (index1, row1) {
                                if (row.value == row1.value) {
                                    row.isSelected = row1.isSelected;
                                } if (row1.value == "Other") {
                                    row.otherValue = row1.otherValue;
                                }
                            });
                        });
                    }
                    var smallDisAdvList = oView.getModel("oLookUpModel").getData().smallDisadvantagedBusiness;
                    var resultData2 = resultModel.comInfoDto.smallDisadvantagedBusiness;
                    if (resultData2 && resultData2.length > 0) {
                        $.each(smallDisAdvList, function (index, row) {
                            $.each(resultData2, function (index1, row1) {
                                if (row.value == row1.value) {
                                    row.isSelected = row1.isSelected;
                                } if (row1.value == "Other") {
                                    row.otherValue = row1.otherValue;
                                }
                            });
                        });
                    }
                }

            },
            _fnLoadOperServList: function (resultModel) {
                var list = oView.byId("operServList").getItems();
                var resultList = resultModel.comProductsUiDto.operationServices;
                if (resultList) {
                    $.each(list, function (i, r) {
                        $.each(resultList, function (i1, r1) {
                            if (r.getAggregation("content")[0].getAggregation("items")[0].getProperty("text") == r1.value) {
                                r.setSelected(true);
                            } if (r1.value == "Other") {
                                r.getAggregation("content")[0].getAggregation("items")[1].setValue(r1.otherValue);

                            }
                        });
                    });
                }
            },
            _fnLoadManServList: function (resultModel) {
                var list = oView.byId("manServList").getItems();
                var resultList = resultModel.comProductsUiDto.manufacturingProcessSupplies;
                if (resultList) {
                    $.each(list, function (i, r) {
                        $.each(resultList, function (i1, r1) {
                            if (r.getAggregation("content")[0].getAggregation("items")[0].getProperty("text") == r1.value) {
                                r.setSelected(true);
                            } if (r1.value == "Other") {
                                r.getAggregation("content")[0].getAggregation("items")[1].setValue(r1.otherValue);
                            }
                        });
                    });
                }
            },

            _fnLoadDropDownModel: function () {
                oView.getModel("oLookUpModel").setSizeLimit(10000);
                this._fnLoadCountry();
                // this._fnLoadTax();
                this._fnLoadIncoterms();
                this._fnLoadPaymentTerms();
                this._fnLoadPaymentMethod();
                this._fnLoadCurrency();
                this._fnLoadRegion();
                this._fnLoadCountryContactCode();

            },

            _fnLoadCountryContactCode: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/contactCode";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/countryContactCode", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
            },

            _fnLoadCountry: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/countries";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {

                        oView.getModel("oLookUpModel").setProperty("/SupplierCountry", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                        oView.getModel("oLookUpModel").setProperty("/Country", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
            },
            _fnLoadTax: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax-types";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/TaxType", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });

            },
            _fnLoadIncoterms: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/incoterms";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/Incoterm", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
            },
            _fnLoadPaymentTerms: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/payment-terms";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/PaymentTerm", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
            },
            _fnLoadPaymentMethod: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/paymentMethod/" + oView.getModel("oDataModel").getData().shippingInfoDto.comCode;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/PaymentMethod", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });

            },
            _fnLoadCurrency: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/currency-list";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/Currency", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
            },
            fnLoadStateOFA: function (oEvent) {
                var vCountry = oEvent.getParameter("selectedItem").getKey();
                oView.getModel("companyInfoModel").getData().oRegion = "";
                //  oView.getModel("oDataModel").getData().comInfoDto.address[0].postal[0].region = "";
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/regions/?country=" + vCountry;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/StateOFA", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
                var loadPostalCodeDetail = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + vCountry;
                $.ajax({
                    url: loadPostalCodeDetail,
                    type: 'GET',
                    success: function (data) {
                        var postalCodeLength = parseInt(data[0].postalCodeLength);
                        var postalCodeRule = parseInt(data[0].postalCodeRule)
                        if (postalCodeLength == 0) {
                            var PostalCodeValidation = {
                                "postalCodeLength": 10,
                                "postalCodeRule": postalCodeRule
                            };
                        } else {
                            var PostalCodeValidation = {
                                "postalCodeLength": postalCodeLength,
                                "postalCodeRule": postalCodeRule
                            };
                        }

                        oView.getModel("oLookUpModel").setProperty("/PostalCodeValidationOFA", PostalCodeValidation);
                        oView.getModel("oLookUpModel").refresh();
                    },
                    async: false,
                    error: function (data) {

                    }
                });


            },
            fnLoadStateRTA: function (oEvent) {
                oView.getModel("remitModel").getData().rRegion = "";
                //  oView.getModel("oDataModel").getData().comInfoDto.address[1].postal[0].region = "";
                var vCountry = oEvent.getParameter("selectedItem").getKey();

                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/regions/?country=" + vCountry;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/StateRTA", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
                var loadPostalCodeDetail = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + vCountry;
                $.ajax({
                    url: loadPostalCodeDetail,
                    type: 'GET',
                    success: function (data) {
                        var postalCodeLength = parseInt(data[0].postalCodeLength);
                        var postalCodeRule = parseInt(data[0].postalCodeRule)
                        if (postalCodeLength == 0) {
                            var PostalCodeValidation = {
                                "postalCodeLength": 10,
                                "postalCodeRule": postalCodeRule
                            };
                        } else {
                            var PostalCodeValidation = {
                                "postalCodeLength": postalCodeLength,
                                "postalCodeRule": postalCodeRule
                            };
                        }

                        oView.getModel("oLookUpModel").setProperty("/PostalCodeValidationRTA", PostalCodeValidation);
                        oView.getModel("oLookUpModel").refresh();
                    },
                    async: false,
                    error: function (data) {

                    }
                });
            },
            _fnLoadRegion: function () {
                var vCountry = 'US';

                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/regions/?country=" + vCountry;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/Region", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
            },
            _fnLoadSupplierRegion: function (vCountry) {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/regions/?country=" + vCountry;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/SupplierRegion", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
            },
            _fnLoadOperServicesList: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/services/findByServiceName/operationServices";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/operationServices", oEvent.getSource().getData().serviceValues);
                        oView.getModel("oLookUpModel").refresh();
                    }
                });

            },
            _fnLoadManuSuppliesList: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/services/findByServiceName/manufacturingProcessSupplies";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/manufacturingProcessSupplies", oEvent.getSource().getData().serviceValues);
                        oView.getModel("oLookUpModel").refresh();
                    }
                });

            },
            _fnLoadEnterpriseList: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/services/findByServiceName/enterprise";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/enterprise", oEvent.getSource().getData().serviceValues);
                        oView.getModel("oLookUpModel").refresh();
                    }
                });

            },
            _fnLoadSmallDisAdvList: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/services/findByServiceName/smallDisadvantagedBusiness";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/smallDisadvantagedBusiness", oEvent.getSource().getData().serviceValues);
                        oView.getModel("oLookUpModel").refresh();
                    }
                });

            },
            _fnLoadEstablishConnList: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/services/findByServiceName/orgEstablishConnection";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/orgEstablishConnection", oEvent.getSource().getData().serviceValues);
                        oView.getModel("oLookUpModel").refresh();
                    }
                });

            },
            _fnLoadBusinessActList: function () {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/services/findByServiceName/orgBusinessActivities";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/orgBusinessActivities", oEvent.getSource().getData().serviceValues);
                        oView.getModel("oLookUpModel").refresh();
                    }
                });

            },

            fnChangeSupplierCountry: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                    oEvent.getSource().setSelectedKey(oEvent.getSource().getSelectedKey())
                    oView.getModel("oDataModel").refresh();
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }

                var selectedCountryCode = oEvent.getSource().getSelectedKey();
                var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + selectedCountryCode;
                $.ajax({
                    url: loadTaxTypeUrl,
                    type: 'GET',
                    success: function (data) {
                        var postalCodeLength = parseInt(data[0].postalCodeLength);
                        var postalCodeRule = parseInt(data[0].postalCodeRule)

                        if (postalCodeLength == 0) {
                            var PostalCodeValidation = {
                                "postalCodeLength": 10,
                                "postalCodeRule": postalCodeRule
                            };
                        } else {
                            var PostalCodeValidation = {
                                "postalCodeLength": postalCodeLength,
                                "postalCodeRule": postalCodeRule
                            };
                        }

                        oView.getModel("oLookUpModel").setProperty("/PostalCodeValidation", PostalCodeValidation);
                        oView.getModel("oLookUpModel").refresh();
                    },
                    async: false,
                    error: function (data) {

                    }
                });

                oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].region = "";
                oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].regionCode = "";
                oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].country = formatter.fnFetchDescription(oView.getModel("oLookUpModel").getData().SupplierCountry, oEvent.getParameter("selectedItem").getKey());
                oView.getModel("oDataModel").refresh();
                var vCountry = oEvent.getParameter("selectedItem").getKey();
                this._fnLoadSupplierRegion(vCountry);
            },
            fnChangeSupplierRegion: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                    oEvent.getSource().setSelectedKey(oEvent.getSource().getSelectedKey())
                    oView.getModel("oDataModel").refresh();
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].region = formatter.fnFetchDescription(oView.getModel("oLookUpModel").getData().SupplierRegion, oEvent.getParameter("selectedItem").getKey());
                oView.getModel("oDataModel").refresh();
            },

            fnSelectIsBankInfoProvided: function (oEvent) {
                var selectedIndex = oEvent.getParameter("selectedIndex");
                if (selectedIndex === 1) {
                    oView.byId("fileUploader_BA").removeStyleClass("attachmentWithBorder");
                }
                if (selectedIndex !== -1) {
                    oEvent.getSource().setValueState("None");
                }
            },
            _fnReadDocumentList: function (caseId, that) {
                var sUrl = "/comjabilsurveyform/plcm_portal_services/document/findByRequestId/" + caseId;
                $.ajax({
                    url: sUrl,

                    type: 'GET',
                    success: function (data) {

                        $.each(data, function (index, value) {
                            if (value.docInSection == "businessPartnerInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].bPDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].bPDArray.push(value);
                            } else if (value.docInSection == "ownerShipInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].ownerDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].ownerDArray.push(value);
                            } else if (value.docInSection == "companyInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].compDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].compDArray.push(value);
                            } else if (value.docInSection == "bankInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].bankDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].bankDArray.push(value);
                            }
                            //  else if (value.docInSection == "bankIntermediateInfo") {
                            //     that.getView().getModel("oAttachmentList").getData()[0].bankINDArray = [];
                            //     that.getView().getModel("oAttachmentList").getData()[0].bankINDArray.push(value);
                            // } 
                            else if (value.docInSection == "shippingInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].shippingDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].shippingDArray.push(value);
                            } else if (value.docInSection == "prodAndServInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].compProdDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].compProdDArray.push(value);
                            } else if (value.docInSection == "contactInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].compContDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].compContDArray.push(value);
                            } else if (value.docInSection == "financialInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].compFinDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].compFinDArray.push(value);
                            }
                            else if (value.docInSection == "cComplianceInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].compComplDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].compComplDArray.push(value);
                            }
                            else if (value.docInSection == "cyberSecInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].compSecuDArray = [];
                                that.getView().getModel("oAttachmentList").getData()[0].compSecuDArray.push(value);
                            }
                        });

                        that.getView().getModel("oAttachmentList").refresh();
                    },
                    error: function (data) {
                        var eMsg = data.responseText
                        MessageBox.show(eMsg, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });

                    }
                });


            },
            _fnReadOwnershipData: function (oContact) {

                $.each(oContact, function (index, value) {
                    if (value.contactInSection == "OwnerShipInfo" && value.contactName == "supplier Owned By SDN") {
                        if (!oView.getModel("modelSDNList")) {
                            var modelSDNList = new JSONModel();
                            modelSDNList.setData([]);
                            modelSDNList.getData().push(value);
                            oView.setModel(modelSDNList, "modelSDNList");
                            oView.getModel("modelSDNList").refresh();
                        } else {
                            oView.getModel("modelSDNList").getData().push(value);
                            oView.getModel("modelSDNList").refresh();
                        }




                    }
                    if (value.contactInSection == "OwnerShipInfo" && value.contactName == "supplier Owned By CISNK") {
                        if (!oView.getModel("modelCISNKList")) {
                            var modelCISNKList = new JSONModel();
                            modelCISNKList.setData([]);
                            modelCISNKList.getData().push(value);
                            oView.setModel(modelCISNKList, "modelCISNKList");
                            oView.getModel("modelCISNKList").refresh();
                        } else {
                            oView.getModel("modelCISNKList").push(value);
                            oView.getModel("modelCISNKList").refresh();
                        }



                    }
                });

            },
            _fnValidateBasicInfo: function (oEvent) {
                var spaceRegex = /^\s+$/;
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contactName || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contactName)) {
                    oView.getModel("oErrorModel").getData().supplierNameE = "Error";
                    oView.getModel("oErrorModel").getData().supplierNameM = oi18n.getText("mandatoryFName");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.firstName)) {
                    oView.getModel("oErrorModel").getData().authorityFNameE = "Error";
                    oView.getModel("oErrorModel").getData().authorityFNameM = oi18n.getText("mandatoryFName");

                    iError = true;
                } if (!oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.lastName)) {
                    oView.getModel("oErrorModel").getData().authorityLNameE = "Error";
                    oView.getModel("oErrorModel").getData().authorityLNameM = oi18n.getText("mandatoryLName");

                    iError = true;
                }

                if (!oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.email || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.email)) {

                    oView.getModel("oErrorModel").getData().authorityEmailE = "Error";
                    oView.getModel("oErrorModel").getData().authorityEmailM = oi18n.getText("mandatoryEmail");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.countryContactCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.countryContactCode)) {
                    oView.getModel("oErrorModel").getData().authorityCountryContactCodeE = "Error";
                    oView.getModel("oErrorModel").getData().authorityCountryContactCodeM = oi18n.getText("mandatoryCountryConatactCode");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contact || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contact)) {
                    oView.getModel("oErrorModel").getData().authorityContE = "Error";
                    oView.getModel("oErrorModel").getData().authorityContM = oi18n.getText("mandatoryContact");

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contact !== "" && Number(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contact.replaceAll("-", "")) == 0) {
                    oView.getModel("oErrorModel").getData().authorityContE = "Error";
                    oView.getModel("oErrorModel").getData().authorityContM = oi18n.getText("invalidContact");
                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.countryMobileCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.countryMobileCode)) {
                    oView.getModel("oErrorModel").getData().authorityCountryContactCodeMobE = "Error";
                    oView.getModel("oErrorModel").getData().authorityCountryContactCodeMobM = oi18n.getText("mandatoryCountryConatactCode");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.mobile || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.mobile)) {
                    oView.getModel("oErrorModel").getData().authorityMobE = "Error";
                    oView.getModel("oErrorModel").getData().authorityMobM = oi18n.getText("mandatoryMContact");

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.mobile !== "" && Number(oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.mobile.replaceAll("-", "")) == 0) {
                    oView.getModel("oErrorModel").getData().authorityMobE = "Error";
                    oView.getModel("oErrorModel").getData().authorityMobM = oi18n.getText("invalidMContact");
                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address1 || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address1)) {
                    oView.getModel("oErrorModel").getData().address1E = "Error";
                    oView.getModel("oErrorModel").getData().adrress1M = oi18n.getText("mandatoryAddr1");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].countryCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].countryCode)) {
                    oView.getModel("oErrorModel").getData().countryE = "Error";
                    oView.getModel("oErrorModel").getData().countryM = oi18n.getText("mandatoryCountry");

                    iError = true;
                } if (!oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].regionCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].regionCode)) {
                    oView.getModel("oErrorModel").getData().stateE = "Error";
                    oView.getModel("oErrorModel").getData().stateM = oi18n.getText("mandatoryState");

                    iError = true;
                }

                if (!oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].city || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].city)) {
                    oView.getModel("oErrorModel").getData().cityE = "Error";
                    oView.getModel("oErrorModel").getData().cityM = oi18n.getText("mandatoryCity");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].postalCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].postalCode)) {
                    oView.getModel("oErrorModel").getData().poE = "Error";
                    oView.getModel("oErrorModel").getData().poM = oi18n.getText("mandatoryPostalCode");

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].postalCode !== "" && Number(oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].postalCode.replaceAll("-", "")) == 0) {
                    oView.getModel("oErrorModel").getData().poE = "Error";
                    oView.getModel("oErrorModel").getData().poM = oi18n.getText("invalidPostalCode");
                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.altContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.altContact.firstName)) {
                    oView.getModel("oErrorModel").getData().altNameE = "Error";
                    oView.getModel("oErrorModel").getData().altNameM = oi18n.getText("mandatoryFName");

                    iError = true;
                } if (!oView.getModel("oDataModel").getData().surveyInfoDto.altContact.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.altContact.lastName)) {
                    oView.getModel("oErrorModel").getData().altLNameE = "Error";
                    oView.getModel("oErrorModel").getData().altLNameM = oi18n.getText("mandatoryLName");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.altContact.email || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.altContact.email)) {
                    oView.getModel("oErrorModel").getData().altEmailE = "Error";
                    oView.getModel("oErrorModel").getData().altEmailM = oi18n.getText("mandatoryEmail");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.altContact.countryContactCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.altContact.countryContactCode)) {
                    oView.getModel("oErrorModel").getData().altCountryContactCodeE = "Error";
                    oView.getModel("oErrorModel").getData().altCountryContactCodeM = oi18n.getText("mandatoryCountryConatactCode");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().surveyInfoDto.altContact.contact || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.altContact.contact)) {
                    oView.getModel("oErrorModel").getData().altContactE = "Error";
                    oView.getModel("oErrorModel").getData().altContactM = oi18n.getText("mandatoryContact");

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.altContact.contact !== "" && Number(oView.getModel("oDataModel").getData().surveyInfoDto.altContact.contact.replaceAll("-", "")) == 0) {
                    oView.getModel("oErrorModel").getData().altContactE = "Error";
                    oView.getModel("oErrorModel").getData().altContactM = oi18n.getText("invalidContact");
                    iError = true;
                }

                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contactName && oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contactName.length > 60) {


                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.firstName && oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.firstName.length > 30) {


                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.lastName && oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.lastName.length > 30) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.email.length && oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.email.length > 241) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contact && oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contact.length > 30) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.mobile && oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.mobile.length > 30) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.extension && oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.extension.length > 10) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.isAuthority === null) {
                    oView.getModel("oErrorModel").getData().isAuthorityE = "Error";
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.isAuthority === false) {
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName)) {
                        oView.getModel("oErrorModel").getData().ackNameE = "Error";
                        oView.getModel("oErrorModel").getData().ackNameM = oi18n.getText("mandatoryFName");

                        iError = true;
                    } if (!oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName)) {
                        oView.getModel("oErrorModel").getData().ackLNameE = "Error";
                        oView.getModel("oErrorModel").getData().ackLNameM = oi18n.getText("mandatoryLName");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.email || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.email)) {
                        oView.getModel("oErrorModel").getData().ackEmailE = "Error";
                        oView.getModel("oErrorModel").getData().ackEmailM = oi18n.getText("mandatoryEmail");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.countryContactCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.countryContactCode)) {
                        oView.getModel("oErrorModel").getData().ackCountryContactCodeE = "Error";
                        oView.getModel("oErrorModel").getData().ackCountryContactCodeM = oi18n.getText("mandatoryCountryConatactCode");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.contact || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.contact)) {
                        oView.getModel("oErrorModel").getData().ackContactE = "Error";
                        oView.getModel("oErrorModel").getData().ackContactM = oi18n.getText("mandatoryContact");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.contact !== "" && Number(oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.contact.replaceAll("-", "")) == 0) {
                        oView.getModel("oErrorModel").getData().ackContactE = "Error";
                        oView.getModel("oErrorModel").getData().ackContactM = oi18n.getText("invalidContact");
                        iError = true;
                    }
                     if (!oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.countryMobileCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.countryMobileCode)) {
                        oView.getModel("oErrorModel").getData().ackCountryContactCodeMobE = "Error";
                        oView.getModel("oErrorModel").getData().ackCountryContactCodeMobM = oi18n.getText("mandatoryCountryConatactCode");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.mobile || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.mobile)) {
                        oView.getModel("oErrorModel").getData().ackPhoneE = "Error";
                        oView.getModel("oErrorModel").getData().ackPhoneM = oi18n.getText("mandatoryMContact");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.mobile !== "" && Number(oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.mobile.replaceAll("-", "")) == 0) {
                        oView.getModel("oErrorModel").getData().ackPhoneE = "Error";
                        oView.getModel("oErrorModel").getData().ackPhoneM = oi18n.getText("invalidMContact");
                        iError = true;
                    }

                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName.length > 30) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName.length > 30) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.email && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.email.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.contact && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.contact.length > 30) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.mobile && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.mobile.length > 10) {
                        iError = true;
                    }
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.isJabilMainContact === null) {
                    oView.getModel("oErrorModel").getData().isJabilMainContactE = "Error";
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.isJabilMainContact === false) {
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.firstName)) {
                        oView.getModel("oErrorModel").getData().mcFNameE = "Error";
                        oView.getModel("oErrorModel").getData().mcFNameM = oi18n.getText("mandatoryFName");

                        iError = true;
                    } if (!oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.lastName)) {
                        oView.getModel("oErrorModel").getData().mcLNameE = "Error";
                        oView.getModel("oErrorModel").getData().mcLNameM = oi18n.getText("mandatoryLName");

                        iError = true;
                    }

                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.email || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.email)) {
                        oView.getModel("oErrorModel").getData().mcEmailE = "Error";
                        oView.getModel("oErrorModel").getData().mcEmailM = oi18n.getText("mandatoryEmail");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.countryContactCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.countryContactCode)) {
                        oView.getModel("oErrorModel").getData().mcCountryContactCodeE = "Error";
                        oView.getModel("oErrorModel").getData().mcCountryContactCodeM = oi18n.getText("mandatoryCountryConatactCode");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.contact || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.contact)) {
                        oView.getModel("oErrorModel").getData().mcContE = "Error";
                        oView.getModel("oErrorModel").getData().mcContM = oi18n.getText("mandatoryContact");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.contact !== "" && Number(oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.contact.replaceAll("-", "")) == 0) {
                        oView.getModel("oErrorModel").getData().mcContE = "Error";
                        oView.getModel("oErrorModel").getData().mcContM = oi18n.getText("invalidContact");
                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.countryMobileCode || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.countryMobileCode)) {
                        oView.getModel("oErrorModel").getData().mcCountryContactCodeMobE = "Error";
                        oView.getModel("oErrorModel").getData().mcCountryContactCodeMobM = oi18n.getText("mandatoryCountryConatactCode");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.mobile || spaceRegex.test(oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.mobile)) {
                        oView.getModel("oErrorModel").getData().mcPhoneE = "Error";
                        oView.getModel("oErrorModel").getData().mcPhoneM = oi18n.getText("mandatoryContact");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.mobile !== "" && Number(oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.mobile.replaceAll("-", "")) == 0) {
                        oView.getModel("oErrorModel").getData().mcPhoneE = "Error";
                        oView.getModel("oErrorModel").getData().mcPhoneM = oi18n.getText("invalidMContact");
                        iError = true;
                    }

                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.firstName && oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.firstName.length > 30) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.lastName && oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.lastName.length > 30) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.email && oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.email.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.contact && oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.contact.length > 30) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.extension && oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.extension.length > 10) {
                        iError = true;
                    }
 if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.mobile && oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.mobile.length > 30) {

                        iError = true;
                    }

                }

                if (oView.getModel("oDataModel").getData().surveyInfoDto.altContact.firstName.length > 30) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.altContact.lastName.length > 30) {
                    iError = true;
                }
                // if (oView.getModel("oDataModel").getData().surveyInfoDto.altContact.email.length > 241) {
                //     iError = true;
                // }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.altContact.contact.length > 30) {
                    iError = true;
                }



                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address1 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address1.length > 60) {


                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address2 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address2.length > 40) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address3 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address3.length > 40) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address4 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address4.length > 40) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address5 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address5.length > 40) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].district && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].district.length > 40) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].city && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].city.length > 40) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].postalCode) {
                    var postalCode = oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].postalCode;
                    var PostalCodeValidationData = oView.getModel("oLookUpModel").getData().PostalCodeValidation;
                    var postalCodeLength = PostalCodeValidationData ? PostalCodeValidationData.postalCodeLength : "";
                    var postalCodeRule = PostalCodeValidationData ? PostalCodeValidationData.postalCodeRule : "";
                    switch (postalCodeRule) {
                        case 1:
                            if (/\s/.test(postalCode) || postalCode.length > postalCodeLength) {

                                iError = true;
                            }
                            break;
                        case 2:
                            if (!(/^\d+$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                iError = true;
                            }
                            break;
                        case 3:
                            if (/\s/.test(postalCode) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                iError = true;
                            }
                            break;
                        case 4:
                            if (!(/^\d+$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                iError = true;
                            }
                            break;
                        case 5:
                            if (postalCode.length > postalCodeLength) {
                                iError = true;
                            }
                            break;
                        case 6:
                            if (!(/^[\d ]*$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                iError = true;
                            }
                            break;
                        case 7:
                            if (!(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                iError = true;
                            }
                            break;
                        case 8:
                            if (!(/^[\d ]*$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                iError = true;
                            }
                    }

                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].faxNum && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].faxNum.length > 30) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].poBoxPostalCode && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].poBoxPostalCode.length > 10) {
                    iError = true;
                }

                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("basicInfo").setValidated(false);
                } else {
                    oView.byId("basicInfo").setValidated(true);
                }
            },
            _fnValidateBusinessPartner: function (oEvent) {
                var spaceRegex = /^\s+$/;
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                // if (!oView.getModel("oUserModel").getData().isNew) {
                //     if (!oView.getModel("oDataModel").getData().bpInfoDto.isLegalCorrect && (!oView.getModel("oDataModel").getData().bpInfoDto.legalName || spaceRegex.test(oView.getModel("oDataModel").getData().bpInfoDto.legalName))) {
                //         oView.getModel("oErrorModel").getData().legalNameE = "Error";
                //         oView.getModel("oErrorModel").getData().legalNameM = oi18n.getText("mandatoryLegalName");
                //         iError = true;
                //     }
                //     if (!oView.getModel("oDataModel").getData().bpInfoDto.isDunsCorrect) {
                //         if (oView.getModel("oDataModel").getData().bpInfoDto.dunsNumber && !spaceRegex.test(oView.getModel("oDataModel").getData().bpInfoDto.dunsNumber) && oView.getModel("oDataModel").getData().bpInfoDto.dunsNumber.length != 9) {
                //             oView.getModel("oErrorModel").getData().dunsNumE = "Error";
                //             oView.getModel("oErrorModel").getData().dunsNumM = oi18n.getText("DunsNumberLengthValidation");
                //             iError = true;
                //         } else {
                //             oView.getModel("oErrorModel").getData().dunsNumE = "None";
                //             oView.getModel("oErrorModel").getData().dunsNumM = "";
                //             //  iError = false;
                //         }
                //     }

                // } else {
                if (oView.getModel("oUserModel").getData().isNew) {
                    if (oView.getModel("oDataModel").getData().bpInfoDto.siteHaveDunsNumber === null) {
                        oView.getModel("oErrorModel").getData().siteHaveDunsNumberE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bpInfoDto.siteHaveDunsNumber) {
                        if (oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum && oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum.length != 9) {
                            oView.getModel("oErrorModel").getData().dunsRegistrationNumE = "Error";
                            oView.getModel("oErrorModel").getData().dunsRegistrationNumM = oi18n.getText("DunsNumberLengthValidation");
                            iError = true;
                        } else {
                            oView.getModel("oErrorModel").getData().dunsRegistrationNumE = "None";
                            oView.getModel("oErrorModel").getData().dunsRegistrationNumM = "";

                        }
                    } else if (oView.getModel("oDataModel").getData().bpInfoDto.siteHaveDunsNumber === false) {
                        if (oView.getModel("oDataModel").getData().bpInfoDto.isSiteCorporateHeadquaters === null) {
                            oView.getModel("oErrorModel").getData().isSiteCorporateHeadquatersE = "Error";
                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().bpInfoDto.noOfEmployees) {
                            oView.getModel("oErrorModel").getData().numOfEmpE = "Error";
                            oView.getModel("oErrorModel").getData().numOfEmpM = oi18n.getText("mandatoryNumber");
                            iError = true;
                        } if (!oView.getModel("oDataModel").getData().bpInfoDto.year) {
                            oView.getModel("oErrorModel").getData().yearE = "Error";
                            oView.getModel("oErrorModel").getData().yearM = oi18n.getText("mandatoryYear");

                            iError = true;
                        }

                    }
                }
                //}
                if (!oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.firstName)) {
                    oView.getModel("oErrorModel").getData().ppocFNameE = "Error";
                    oView.getModel("oErrorModel").getData().ppocFNameM = oi18n.getText("mandatoryFName");
                    iError = true;
                } if (!oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.lastName)) {
                    oView.getModel("oErrorModel").getData().ppocLNameE = "Error";
                    oView.getModel("oErrorModel").getData().ppocLNameM = oi18n.getText("mandatoryLName");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.email || spaceRegex.test(oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.email)) {
                    oView.getModel("oErrorModel").getData().ppocEmailE = "Error";
                    oView.getModel("oErrorModel").getData().ppocEmailM = oi18n.getText("mandatoryEmail");

                    iError = iError || false;
                }
                if (!oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.countryContactCode || spaceRegex.test(oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.countryContactCode)) {
                    oView.getModel("oErrorModel").getData().ppocCountryContCodeE = "Error";
                    oView.getModel("oErrorModel").getData().ppocCountryContCodeM = oi18n.getText("mandatoryCountryConatactCode");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.contact || spaceRegex.test(oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.contact)) {
                    oView.getModel("oErrorModel").getData().ppocContE = "Error";
                    oView.getModel("oErrorModel").getData().ppocContM = oi18n.getText("mandatoryContact");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.countryMobileCode || spaceRegex.test(oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.countryMobileCode)) {
                    oView.getModel("oErrorModel").getData().ppocCountryContCodeMobE = "Error";
                    oView.getModel("oErrorModel").getData().ppocCountryContCodeMobM = oi18n.getText("mandatoryCountryConatactCode");

                    iError = true;
                }
                if (!oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.mobile || spaceRegex.test(oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.mobile)) {
                    oView.getModel("oErrorModel").getData().ppocMobE = "Error";
                    oView.getModel("oErrorModel").getData().ppocMobM = oi18n.getText("mandatoryMContact");

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.contact !== "" && Number(oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.contact.replaceAll("-", "")) == 0) {
                    oView.getModel("oErrorModel").getData().ppocContE = "Error";
                    oView.getModel("oErrorModel").getData().ppocContM = oi18n.getText("invalidContact");

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.mobile !== "" && Number(oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.mobile.replaceAll("-", "")) == 0) {
                    oView.getModel("oErrorModel").getData().ppocMobE = "Error";
                    oView.getModel("oErrorModel").getData().ppocMobM = oi18n.getText("invalidMContact");
                    iError = true;
                }

                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.firstName && oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.firstName.length > 30) {


                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.lastName && oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.lastName.length > 30) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.email.length && oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.email.length > 241) {
                    iError = iError || false;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.contact && oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.contact.length > 30) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.mobile && oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.mobile.length > 30) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.extension && oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.extension.length > 10) {
                    iError = true;
                }
                var taxArr = oView.getModel("oDataModel").getData().bpInfoDto.tax;
                if (taxArr.length != 0) {
                    for (var i = 0; i < taxArr.length; i++) {
                        var taxID = taxArr[i].taxNum;
                        var nIndex = i + 1;
                        var indexStr = "/taxIDValidation" + nIndex;
                        var taxIDValidationData = oView.getModel("oLookUpModel").getProperty(indexStr);
                        var taxIDMaxLength = taxIDValidationData ? taxIDValidationData.taxMaxLength : "";
                        var taxIDNumRule = taxIDValidationData ? taxIDValidationData.taxNumRule : "";
                        switch (taxIDNumRule) {
                            case 1:
                                if (/\s/.test(taxID) || taxID.length > taxIDMaxLength) {
                                    this.emailValidResult = true;
                                    iError = true;
                                } else {
                                    this.emailValidResult = false;
                                }
                                break;
                            case 2:
                                if (!(/^\d+$/.test(taxID)) || taxID.length > taxIDMaxLength) {
                                    this.emailValidResult = true;
                                    iError = true;
                                } else {
                                    this.emailValidResult = false;
                                }
                                break;
                            case 3:
                                if (/\s/.test(taxID) || !(taxID.length === taxIDMaxLength) && taxID.length > 0) {
                                    this.emailValidResult = true;
                                    iError = true;
                                } else {
                                    this.emailValidResult = false;
                                }
                                break;
                            case 4:
                                if (!(/^\d+$/.test(taxID)) || !(taxID.length === taxIDMaxLength) && taxID.length > 0) {
                                    this.emailValidResult = true;
                                    iError = true;
                                } else {
                                    this.emailValidResult = false;
                                }
                                break;
                            case 5:
                                if (taxID.length > taxIDMaxLength) {
                                    this.emailValidResult = true;
                                    iError = true;
                                } else {
                                    this.emailValidResult = false;
                                }
                                break;
                            case 6:
                                if (!(/^[\d ]*$/.test(taxID)) || taxID.length > taxIDMaxLength) {
                                    this.emailValidResult = true;
                                    iError = true;
                                } else {
                                    this.emailValidResult = false;
                                }
                                break;
                            case 7:
                                if (!(taxID.length === taxIDMaxLength) && taxID.length > 0) {
                                    this.emailValidResult = true;
                                    iError = true;
                                } else {
                                    this.emailValidResult = false;
                                }
                                break;
                            case 8:
                                if (!(/^[\d ]*$/.test(taxID)) || !(taxID.length === taxIDMaxLength) && taxID.length > 0) {
                                    this.emailValidResult = true;

                                } else {
                                    this.emailValidResult = false;
                                }
                        }
                    }
                    // var taxCountryArr = taxArr.map(function(item){ return item.country });
                    // var isDuplicateCountry = taxCountryArr.some(function(item, idx){ 
                    //     return item || taxCountryArr.indexOf(item) != idx 
                    // });
                    // var taxTypeArr = taxArr.map(function(item){ return item.type });
                    // var isDuplicateType = taxTypeArr.some(function(item, idx){ 
                    //     return item || taxTypeArr.indexOf(item) != idx 
                    // });
                    // if(isDuplicateCountry && isDuplicateType) {
                    //     this.emailValidResult = true;
                    //     iError = true;
                    // } else{
                    //     this.emailValidResult = false;
                    //     iError = false;
                    // }

                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.email) {
                    var email = oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.email;
                    var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                    if (email) {
                        if (!email.match(mailregex)) {
                            oView.getModel("oErrorModel").getData().ppocEmailE = "Error";
                            oView.getModel("oErrorModel").getData().ppocEmailM = oi18n.getText("invalidEmail");

                            iError = true;
                        } else if (!email.toUpperCase().includes("JABIL.COM")) {
                            oView.getModel("oErrorModel").getData().ppocEmailE = "Error";
                            oView.getModel("oErrorModel").getData().ppocEmailM = oi18n.getText("invalidEmail");

                            iError = true;
                        } else {
                            oView.getModel("oErrorModel").getData().ppocEmailE = "None";
                            oView.getModel("oErrorModel").getData().ppocEmailM = oi18n.getText("");

                            iError = iError || false;
                        }
                    }
                }

                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("businessPartnerInfo").setValidated(false);
                } else {
                    oView.byId("businessPartnerInfo").setValidated(true);
                }
            },
            _fnValidateOwnerInfo: function (oEvent) {
                var spaceRegex = /^\s+$/;
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                
                if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityTradedCompany === null) {
                    oView.getModel("oErrorModel").getData().isEntityTradedCompanyE = "Error";
                    iError = true;
                }
               

                if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.ownershipType) {
                    oView.getModel("oErrorModel").getData().ownershipTypeE = "Error";
                    oView.getModel("oErrorModel").getData().ownershipTypeM = oi18n.getText("mandatoryOwnshpType");

                    iError = true;
                }
                if (oView.getModel("oUserModel").getData().isNew) {
                    if ((!oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum || oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum === "NODUNS") && oView.getModel("oDataModel").getData().ownerShipInfoDto.doesOtherEntityOwnSite === null) {
                    oView.getModel("oErrorModel").getData().doesOtherEntityOwnSiteE = "Error";
                    iError = true;
                }
                 if (oView.getModel("oDataModel").getData().ownerShipInfoDto.doesOtherEntityOwnSite && (!oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum || oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum === "NODUNS"))
                    if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.companyName || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.companyName)) {
                        oView.getModel("oErrorModel").getData().compNameE = "Error";
                        oView.getModel("oErrorModel").getData().compNameM = oi18n.getText("mandatoryCompName");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntitySDNList === null) {
                        oView.getModel("oErrorModel").getData().isEntitySDNListE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntitySDNList) {
                        var sdnList = oView.getModel("oDataModel").getData().ownerShipInfoDto.sdnlistContact;
                        var oItems = oView.byId("sdnLC").getItems();
                        $.each(sdnList, function (index, row) {
                            var item = oView.byId("sdnLC").getItems()[index].getAggregation("cells");
                            if (row.firstName == null || row.firstName == "" || spaceRegex.test(row.firstName)) {
                                item[0].getAggregation("items")[2].setValueState("Error");
                                item[0].getAggregation("items")[2].setValueStateText(oi18n.getText("mandatoryFName"));
                                iError = true;
                            } if (row.lastName == null || row.lastName == "" || spaceRegex.test(row.lastName)) {
                                item[1].getAggregation("items")[2].setValueState("Error");
                                item[1].getAggregation("items")[2].setValueStateText(oi18n.getText("mandatoryLName"));
                                iError = true;
                            }
                        });
                        for (var i = 0; i < sdnList.length; i++) {
                            if (sdnList[i].firstName && sdnList[i].firstName.length > 30) {
                                iError = true;
                            }
                            if (sdnList[i].lastName && sdnList[i].lastName.length > 30) {
                                iError = true;
                            }
                        }
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityRegInCISNK === null) {
                        oView.getModel("oErrorModel").getData().isEntityRegInCISNKE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityRegInCISNK) {
                        var cisnkList = oView.getModel("oDataModel").getData().ownerShipInfoDto.regInCISNKContact;
                        var oItems = oView.byId("cisnkLC").getItems();
                        $.each(cisnkList, function (index, row) {
                            var item = oView.byId("cisnkLC").getItems()[index].getAggregation("cells");
                            if (row.firstName == null || row.firstName == "" || spaceRegex.test(row.firstName)) {
                                item[0].getAggregation("items")[2].setValueState("Error");
                                item[0].getAggregation("items")[2].setValueStateText(oi18n.getText("mandatoryFName"));
                                iError = true;
                            } if (row.lastName == null || row.lastName == "" || spaceRegex.test(row.lastName)) {
                                item[1].getAggregation("items")[2].setValueState("Error");
                                item[1].getAggregation("items")[2].setValueStateText(oi18n.getText("mandatoryLName"));
                                iError = true;
                            }
                        });
                        for (var j = 0; j < cisnkList.length; j++) {
                            if (cisnkList[j].firstName && cisnkList[j].firstName.length > 30) {
                                iError = true;
                            }
                            if (cisnkList[j].lastName && cisnkList[j].lastName.length > 30) {
                                iError = true;
                            }
                        }
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovt === null) {
                        oView.getModel("oErrorModel").getData().isEntityManagedByGovtE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovt) {
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.entityName || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.entityName)) {
                            oView.getModel("oErrorModel").getData().govtEntityNameE = "Error";
                            oView.getModel("oErrorModel").getData().govtEntityNameM = oi18n.getText("mandatoryGEName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.firstName)) {
                            oView.getModel("oErrorModel").getData().govtEntityFNameE = "Error";
                            oView.getModel("oErrorModel").getData().govtEntityFNameM = oi18n.getText("mandatoryFName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.lastName)) {
                            oView.getModel("oErrorModel").getData().govtEntityLNameE = "Error";
                            oView.getModel("oErrorModel").getData().govtEntityLNameM = oi18n.getText("mandatoryLName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.email || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.email)) {
                            oView.getModel("oErrorModel").getData().govtEntityEmailE = "Error";
                            oView.getModel("oErrorModel").getData().govtEntityEmailM = oi18n.getText("mandatoryEmail");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.contact || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.contact)) {
                            oView.getModel("oErrorModel").getData().govtEntityContE = "Error";
                            oView.getModel("oErrorModel").getData().govtEntityContM = oi18n.getText("mandatoryContact");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.contact !== "" && Number(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.contact.replaceAll("-", "")) == 0) {
                            oView.getModel("oErrorModel").getData().govtEntityContE = "Error";
                            oView.getModel("oErrorModel").getData().govtEntityContM = oi18n.getText("invalidContact");

                            iError = true;
                        }


                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.jobTitle || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.jobTitle)) {
                            oView.getModel("oErrorModel").getData().govtEntityJobTitleE = "Error";
                            oView.getModel("oErrorModel").getData().govtEntityJobTitleM = oi18n.getText("mandatoryJobTitle");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.countryContactCode || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.countryContactCode)) {
                            oView.getModel("oErrorModel").getData().govtEntityCountryCodeE = "Error";
                            oView.getModel("oErrorModel").getData().govtEntityCountryCodeM = oi18n.getText("mandatoryCountryConatactCode");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.entityName && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.entityName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.firstName && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.firstName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.lastName && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.lastName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.email && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.email.length > 241) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.contact && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.contact.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.extension && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.extension.length > 10) {
                            iError = true;
                        }

                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovtFamily === null) {
                        oView.getModel("oErrorModel").getData().isEntityManagedByGovtFamilyE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovtFamily) {
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.entityName || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.entityName)) {
                            oView.getModel("oErrorModel").getData().closegovtEntityNameE = "Error";
                            oView.getModel("oErrorModel").getData().closegovtEntityNameM = oi18n.getText("mandatoryGEName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.firstName)) {
                            oView.getModel("oErrorModel").getData().closegovtEntityFNameE = "Error";
                            oView.getModel("oErrorModel").getData().closegovtEntityFNameM = oi18n.getText("mandatoryFName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.lastName)) {
                            oView.getModel("oErrorModel").getData().closegovtEntityLNameE = "Error";
                            oView.getModel("oErrorModel").getData().closegovtEntityLNameM = oi18n.getText("mandatoryLName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.email || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.email)) {
                            oView.getModel("oErrorModel").getData().closegovtEntityEmailE = "Error";
                            oView.getModel("oErrorModel").getData().closegovtEntityEmailM = oi18n.getText("mandatoryEmail");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.contact || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.contact)) {
                            oView.getModel("oErrorModel").getData().closegovtEntityContE = "Error";
                            oView.getModel("oErrorModel").getData().closegovtEntityContM = oi18n.getText("mandatoryContact");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.contact !== "" && Number(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.contact.replaceAll("-", "")) == 0) {
                            oView.getModel("oErrorModel").getData().closegovtEntityContE = "Error";
                            oView.getModel("oErrorModel").getData().closegovtEntityContM = oi18n.getText("invalidContact");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.jobTitle || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.jobTitle)) {
                            oView.getModel("oErrorModel").getData().closegovtEntityJobTitleE = "Error";
                            oView.getModel("oErrorModel").getData().closegovtEntityJobTitleM = oi18n.getText("mandatoryJobTitle");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.countryContactCode || spaceRegex.test(oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.countryContactCode)) {
                            oView.getModel("oErrorModel").getData().closegovtEntityCountryCodeE = "Error";
                            oView.getModel("oErrorModel").getData().closegovtEntityCountryCodeM = oi18n.getText("mandatoryCountryConatactCode");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.entityName && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.entityName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.firstName && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.firstName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.lastName && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.lastName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.email && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.email.length > 241) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.contact && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.contact.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.extension && oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.extension.length > 10) {
                            iError = true;
                        }

                    }
                }

                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("ownerShipInfo").setValidated(false);
                } else {
                    oView.byId("ownerShipInfo").setValidated(true);
                }
            },
            _fnValidateCompanyInfo: function (oEvent) {
                if (oView.getModel("companyInfoModel")) {
                    var spaceRegex = /^\s+$/;
                    var iError = false;
                    var aError = false, that = this;
                    var oi18n_En = this.getOwnerComponent().getModel("oi18n_En"),
                        isDefaultLan = this.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                    if (oView.getModel("companyInfoModel").getData().isOrderFromAddress) {
                        if (!oView.getModel("companyInfoModel").getData().oName || spaceRegex.test(oView.getModel("companyInfoModel").getData().oName)) {
                            oView.getModel("oErrorModel").getData().oFANameE = "Error";
                            oView.getModel("oErrorModel").getData().oFANameM = oi18n.getText("mandatoryName");

                            iError = true;
                        }

                        if (!oView.getModel("companyInfoModel").getData().oAddress1 || spaceRegex.test(oView.getModel("companyInfoModel").getData().oAddress1)) {
                            oView.getModel("oErrorModel").getData().oFAAddr1E = "Error";
                            oView.getModel("oErrorModel").getData().oFAAddr1M = oi18n.getText("mandatoryAddr1");

                            iError = true;
                        }


                        if (!oView.getModel("companyInfoModel").getData().oPostalCode || spaceRegex.test(oView.getModel("companyInfoModel").getData().oPostalCode)) {
                            oView.getModel("oErrorModel").getData().oFAPostCdE = "Error";
                            oView.getModel("oErrorModel").getData().oFAPostCdM = oi18n.getText("mandatoryPostalCode");

                            iError = true;


                        }
                        // did not undertand below code
                        if (oView.getModel("companyInfoModel").getData().oPostalCode !== "" && Number(oView.getModel("companyInfoModel").getData().oPostalCode.replaceAll("-", "")) == 0) {
                            oView.getModel("oErrorModel").getData().oFAPostCdE = "Error";
                            oView.getModel("oErrorModel").getData().oFAPostCdM = oi18n.getText("invalidPostalCode");

                            iError = true;
                        }


                        if (!oView.getModel("companyInfoModel").getData().oCity || spaceRegex.test(oView.getModel("companyInfoModel").getData().oCity)) {
                            oView.getModel("oErrorModel").getData().oFACityE = "Error";
                            oView.getModel("oErrorModel").getData().oFACityM = oi18n.getText("mandatoryCity");

                            iError = true;



                        }
                        if (!oView.getModel("companyInfoModel").getData().oCountry || spaceRegex.test(oView.getModel("companyInfoModel").getData().oCountry)) {
                            oView.getModel("oErrorModel").getData().oFACounE = "Error";
                            oView.getModel("oErrorModel").getData().oFACounM = oi18n.getText("mandatoryCountry");

                            iError = true;

                        }

                        if (!oView.getModel("companyInfoModel").getData().oTeleNum || spaceRegex.test(oView.getModel("companyInfoModel").getData().oTeleNum)) {
                            oView.getModel("oErrorModel").getData().oFATeleNumE = "Error";
                            oView.getModel("oErrorModel").getData().oFATeleNumM = oi18n.getText("mandatoryTel");

                            iError = true;
                        }
                        if (oView.getModel("companyInfoModel").getData().oTeleNum !== "" && Number(oView.getModel("companyInfoModel").getData().oTeleNum.replaceAll("-", "")) == 0) {
                            oView.getModel("oErrorModel").getData().oFATeleNumE = "Error";
                            oView.getModel("oErrorModel").getData().oFATeleNumM = oi18n.getText("invalidTel");

                            iError = true;
                        }
                        // if (oView.getModel("companyInfoModel").getData().oCountry === 'USA' && oView.getModel("companyInfoModel").getData().haveDiversityCertifications === null) {
                        //     oView.getModel("oErrorModel").getData().haveDiversityCertificationsE = "Error";
                        //     iError = true;
                        // }
                        if (oView.getModel("companyInfoModel").getData().oName && oView.getModel("companyInfoModel").getData().oName.length > 35) {


                            iError = true;
                        }

                        if (oView.getModel("companyInfoModel").getData().oAddress1 && oView.getModel("companyInfoModel").getData().oAddress1.length > 60) {
                            iError = true;
                        }
                        if (oView.getModel("companyInfoModel").getData().oAddress2 && oView.getModel("companyInfoModel").getData().oAddress2.length > 40) {

                            iError = true;
                        }
                        if (oView.getModel("companyInfoModel").getData().oAddress3 && oView.getModel("companyInfoModel").getData().oAddress3.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("companyInfoModel").getData().oAddress4 && oView.getModel("companyInfoModel").getData().oAddress4.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("companyInfoModel").getData().oAddress5 && oView.getModel("companyInfoModel").getData().oAddress5.length > 40) {

                            iError = true;
                        }
                        if (oView.getModel("companyInfoModel").getData().oDist && oView.getModel("companyInfoModel").getData().oDist.length > 40) {

                            iError = true;
                        }
                        if (oView.getModel("companyInfoModel").getData().oPostalCode) {
                            var postalCode = oView.getModel("companyInfoModel").getData().oPostalCode;
                            var PostalCodeValidationData = oView.getModel("oLookUpModel").getData().PostalCodeValidationOFA;
                            var postalCodeLength = PostalCodeValidationData ? PostalCodeValidationData.postalCodeLength : "";
                            var postalCodeRule = PostalCodeValidationData ? PostalCodeValidationData.postalCodeRule : "";
                            switch (postalCodeRule) {
                                case 1:
                                    if (/\s/.test(postalCode) || postalCode.length > postalCodeLength) {

                                        iError = true;
                                    }
                                    break;
                                case 2:
                                    if (!(/^\d+$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                        iError = true;
                                    }
                                    break;
                                case 3:
                                    if (/\s/.test(postalCode) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                        iError = true;
                                    }
                                    break;
                                case 4:
                                    if (!(/^\d+$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                        iError = true;
                                    }
                                    break;
                                case 5:
                                    if (postalCode.length > postalCodeLength) {
                                        iError = true;
                                    }
                                    break;
                                case 6:
                                    if (!(/^[\d ]*$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                        iError = true;
                                    }
                                    break;
                                case 7:
                                    if (!(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                        iError = true;
                                    }
                                    break;
                                case 8:
                                    if (!(/^[\d ]*$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                        iError = true;
                                    }
                            }
                        }
                        if (oView.getModel("companyInfoModel").getData().oCity && oView.getModel("companyInfoModel").getData().oCity.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("companyInfoModel").getData().oTeleNum && oView.getModel("companyInfoModel").getData().oTeleNum.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("companyInfoModel").getData().oFaxNum && oView.getModel("companyInfoModel").getData().oFaxNum.length > 30) {
                            iError = true;
                        }


                    }

                    if (oView.getModel("remitModel").getData().isRemitToAddress) {
                        if (!oView.getModel("remitModel").getData().rName || spaceRegex.test(oView.getModel("remitModel").getData().rName)) {
                            oView.getModel("oErrorModel").getData().rTANameE = "Error";
                            oView.getModel("oErrorModel").getData().rTANameM = oi18n.getText("mandatoryName");

                            iError = true;
                        }

                        if (!oView.getModel("remitModel").getData().rAddress1 || spaceRegex.test(oView.getModel("remitModel").getData().rAddress1)) {
                            oView.getModel("oErrorModel").getData().rTAAddr1E = "Error";
                            oView.getModel("oErrorModel").getData().rTAAddr1M = oi18n.getText("mandatoryAddr1");

                            iError = true;


                        }
                        if (!oView.getModel("remitModel").getData().rPostalCode || spaceRegex.test(oView.getModel("remitModel").getData().rPostalCode)) {
                            oView.getModel("oErrorModel").getData().rTAPostCdE = "Error";
                            oView.getModel("oErrorModel").getData().rTAPostCdM = oi18n.getText("mandatoryPostalCode");

                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rPostalCode !== "" && Number(oView.getModel("remitModel").getData().rPostalCode.replaceAll("-", "")) == 0) {
                            oView.getModel("oErrorModel").getData().rTAPostCdE = "Error";
                            oView.getModel("oErrorModel").getData().rTAPostCdM = oi18n.getText("invalidPostalCode");

                            iError = true;
                        }
                        if (!oView.getModel("remitModel").getData().rCity || spaceRegex.test(oView.getModel("remitModel").getData().rCity)) {
                            oView.getModel("oErrorModel").getData().rTACityE = "Error";
                            oView.getModel("oErrorModel").getData().rTACityM = oi18n.getText("mandatoryCity");

                            iError = true;

                        }
                        if (!oView.getModel("remitModel").getData().rCountry || spaceRegex.test(oView.getModel("remitModel").getData().rCountry)) {
                            oView.getModel("oErrorModel").getData().rTACounE = "Error";
                            oView.getModel("oErrorModel").getData().rTACounM = oi18n.getText("mandatoryCountry");

                            iError = true;
                        }
                        if (!oView.getModel("remitModel").getData().rTeleNum || spaceRegex.test(oView.getModel("remitModel").getData().rTeleNum)) {
                            oView.getModel("oErrorModel").getData().rTATeleNumE = "Error";
                            oView.getModel("oErrorModel").getData().rTATeleNumM = oi18n.getText("mandatoryTel");

                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rTeleNum !== "" && Number(oView.getModel("remitModel").getData().rTeleNum.replaceAll("-", "")) == 0) {
                            oView.getModel("oErrorModel").getData().rTATeleNumE = "Error";
                            oView.getModel("oErrorModel").getData().rTATeleNumM = oi18n.getText("invalidTel");

                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rName && oView.getModel("remitModel").getData().rName.length > 35) {


                            iError = true;
                        }

                        if (oView.getModel("remitModel").getData().rAddress1 && oView.getModel("remitModel").getData().rAddress1.length > 60) {
                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rAddress2 && oView.getModel("remitModel").getData().rAddress2.length > 40) {

                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rAddress3 && oView.getModel("remitModel").getData().rAddress3.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rAddress4 && oView.getModel("remitModel").getData().rAddress4.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rAddress5 && oView.getModel("remitModel").getData().rAddress5.length > 40) {

                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rDist && oView.getModel("remitModel").getData().rDist.length > 40) {

                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rPostalCode) {
                            var postalCode = oView.getModel("remitModel").getData().rPostalCode;
                            var PostalCodeValidationData = oView.getModel("oLookUpModel").getData().PostalCodeValidationRTA;
                            var postalCodeLength = PostalCodeValidationData ? PostalCodeValidationData.postalCodeLength : "";
                            var postalCodeRule = PostalCodeValidationData ? PostalCodeValidationData.postalCodeRule : "";
                            switch (postalCodeRule) {
                                case 1:
                                    if (/\s/.test(postalCode) || postalCode.length > postalCodeLength) {

                                        iError = true;
                                    }
                                    break;
                                case 2:
                                    if (!(/^\d+$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                        iError = true;
                                    }
                                    break;
                                case 3:
                                    if (/\s/.test(postalCode) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                        iError = true;
                                    }
                                    break;
                                case 4:
                                    if (!(/^\d+$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                        iError = true;
                                    }
                                    break;
                                case 5:
                                    if (postalCode.length > postalCodeLength) {

                                        iError = true;
                                    }
                                    break;
                                case 6:
                                    if (!(/^[\d ]*$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                        iError = true;
                                    }
                                    break;
                                case 7:
                                    if (!(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                        iError = true;
                                    }
                                    break;
                                case 8:
                                    if (!(/^[\d ]*$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                        iError = true;
                                    }
                            }

                        }
                        if (oView.getModel("remitModel").getData().rCity && oView.getModel("remitModel").getData().rCity.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rTeleNum && oView.getModel("remitModel").getData().rTeleNum.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rFaxNum && oView.getModel("remitModel").getData().rFaxNum.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rPostOffBox && oView.getModel("remitModel").getData().rPostOffBox.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("remitModel").getData().rPostOffZipCode && oView.getModel("remitModel").getData().rPostOffZipCode.length > 10) {
                            iError = true;
                        }
                    }
                    oView.getModel("oErrorModel").refresh();

                    if (iError) {
                        oView.byId("companyInfo").setValidated(false);
                        if (isDefaultLan) {
                            sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("validationDefaultMsg")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        } else {
                            sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.validationDefaultMsg + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("validationDefaultMsg")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        }
                    }
                    else {
                        oView.byId("companyInfo").setValidated(true);
                    }
                    if (!iError) {
                        if (oView.getModel("companyInfoModel").getData().isOrderFromAddress && oView.getModel("companyInfoModel").getData().oCountry === 'USA') {
                            var Address1, Address2, Address3, Address4, Address5, Locality, AdministrativeArea, PostalCode, Country, OutputLanguage, LicenseKey;
                            Address1 = oView.getModel("companyInfoModel").getData().oAddress1;
                            Address2 = oView.getModel("companyInfoModel").getData().oAddress2;
                            Address3 = oView.getModel("companyInfoModel").getData().oAddress3;
                            Address4 = oView.getModel("companyInfoModel").getData().oAddress4;
                            Address5 = oView.getModel("companyInfoModel").getData().oAddress5;
                            Locality = oView.getModel("companyInfoModel").getData().oCity;
                            AdministrativeArea = oView.getModel("companyInfoModel").getData().oRegionC;
                            PostalCode = oView.getModel("companyInfoModel").getData().oPostalCode;
                            Country = oView.getModel("companyInfoModel").getData().oCountryC;
                            OutputLanguage = "english";
                            LicenseKey = "WS80-TZS3-FDQ1";
                           // Added by shanath for Address validation
                            var primaryUrl = '/comjabilsurveyform/plcm_service_object/AVI/api.svc/json/GetAddressInfo?Address1=' + Address1 + '&Address2=' + Address2 + '&Address3=' + Address3 + '&Address4=' + Address4 + '&Address5=' + Address5 + '&Locality=' + Locality + '&AdministrativeArea=' + AdministrativeArea + '&PostalCode=' + PostalCode + '&Country=' + Country + '&OutputLanguage=' + OutputLanguage + '&LicenseKey=' + LicenseKey;

                            $.ajax({
                                url: primaryUrl,
                                type: 'GET',
                                dataType: 'json',
                                success: function (data) {
                                    if (data.AddressInfo.Status !== "Valid") {
                                        aError = true;
                                        MessageBox.show(oi18n.getText("invalidAddress"), {
                                            icon: MessageBox.Icon.ERROR,
                                            title: "Invalid Order Address"
                                        });
                                    }



                                },
                                async: false,
                                error: function (data) {
                                    var eMsg = data.responseText
                                    MessageBox.show(eMsg, {
                                        icon: sap.m.MessageBox.Icon.ERROR,
                                        title: oi18n.getText("error")
                                    });

                                }
                            });
                        }
                        if (oView.getModel("remitModel").getData().isRemitToAddress && oView.getModel("remitModel").getData().rCountry === 'USA') {
                            var Address1, Address2, Address3, Address4, Address5, Locality, AdministrativeArea, PostalCode, Country, OutputLanguage, LicenseKey;
                            Address1 = oView.getModel("remitModel").getData().rAddress1;
                            Address2 = oView.getModel("remitModel").getData().rAddress2;
                            Address3 = oView.getModel("remitModel").getData().rAddress3;
                            Address4 = oView.getModel("remitModel").getData().rAddress4;
                            Address5 = oView.getModel("remitModel").getData().rAddress5;
                            Locality = oView.getModel("remitModel").getData().rCity;
                            AdministrativeArea = oView.getModel("remitModel").getData().rRegionC;
                            PostalCode = oView.getModel("remitModel").getData().rPostalCode;
                            Country = oView.getModel("remitModel").getData().rCountryC;
                            OutputLanguage = "english";
                            LicenseKey = "WS80-TZS3-FDQ1";
                            var primaryUrlR = '/comjabilsurveyform/plcm_service_object/AVI/api.svc/json/GetAddressInfo?Address1=' + Address1 + '&Address2=' + Address2 + '&Address3=' + Address3 + '&Address4=' + Address4 + '&Address5=' + Address5 + '&Locality=' + Locality + '&AdministrativeArea=' + AdministrativeArea + '&PostalCode=' + PostalCode + '&Country=' + Country + '&OutputLanguage=' + OutputLanguage + '&LicenseKey=' + LicenseKey;
                            $.ajax({
                                url: primaryUrlR,
                                type: 'GET',
                                success: function (data) {
                                    if (data.AddressInfo.Status !== "Valid") {
                                        aError = true;
                                        MessageBox.show(oi18n.getText("invalidAddress"), {
                                            icon: MessageBox.Icon.ERROR,
                                            title: "Invalid Remit Adddress"
                                        });
                                    }
                                },
                                async: false,
                                error: function (data) {
                                    var eMsg = data.responseText
                                    MessageBox.show(eMsg, {
                                        icon: sap.m.MessageBox.Icon.ERROR,
                                        title: oi18n.getText("error")
                                    });

                                }
                            });
                        }
                        if (aError) {
                            oView.byId("companyInfo").setValidated(false);
                        } else {
                            oView.byId("companyInfo").setValidated(true);
                        }
                    }

                }
            },
            _fnValidateBankInfo: function (oEvent) {
                var spaceRegex = /^\s+$/;
                var iError = false;
                var bankFields = this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation;
                var apaymentMethod =formatter.fnFetchAdditionalDescription(oView.getModel("oLookUpModel").getData().PaymentMethod, oView.getModel("oDataModel").getData().shippingInfoDto.paymentMethod);
                if (this.emailValidResult) {
                    iError = true;
                }
                var visiblility = oView.getModel("oDataModel").getData().bankDto;
                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En"),
                    isDefaultLan = this.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                var that = this;
                if (!oView.getModel("oDataModel").getData().shippingInfoDto.paymentMethod) {
                    oView.getModel("oErrorModel").getData().paymentTermMethdE = "Error";
                    oView.getModel("oErrorModel").getData().paymentTermMethdM = oi18n.getText("mandatoryPayMethod");

                    iError = true;
                }
                if (oView.getModel("oUserModel").getData().isNew) {
                    if (!oView.getModel("oDataModel").getData().shippingInfoDto.paymentTerms) {
                        oView.getModel("oErrorModel").getData().paymentTermE = "Error";
                        oView.getModel("oErrorModel").getData().paymentTermM = oi18n.getText("mandatoryPayTerms");

                        iError = true;
                    }
                   
                    if (!oView.getModel("oDataModel").getData().shippingInfoDto.paymentCurrency) {
                        oView.getModel("oErrorModel").getData().paymentCurrE = "Error";
                        oView.getModel("oErrorModel").getData().paymentCurrM = oi18n.getText("mandatoryCurr");

                        iError = true;
                    }
                    if (visiblility.isBankProvided === null) {
                        oView.getModel("oErrorModel").getData().isBankProvidedE = "Error";
                        iError = true;
                    }
                    if (visiblility.isBankProvided) {
if(apaymentMethod !== 'Optional'){
                        if (!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry)) {
                            oView.getModel("oErrorModel").getData().bankCountryE = "Error";
                            oView.getModel("oErrorModel").getData().bankCountryM = oi18n.getText("mandatoryCountry");

                            iError = true;
                        }

                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName && bankFields.bankName) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName)) {
                            oView.getModel("oErrorModel").getData().bankNameE = "Error";
                            oView.getModel("oErrorModel").getData().bankNameM = oi18n.getText("mandatoryBName");

                            iError = true;
                        }

                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAddress && bankFields.bankStreet) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAddress)) {
                            oView.getModel("oErrorModel").getData().bankAddrE = "Error";
                            oView.getModel("oErrorModel").getData().bankAddrM = oi18n.getText("mandatoryBAddress");

                            iError = true;
                        }
                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCity && bankFields.bankCity) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCity)) {
                            oView.getModel("oErrorModel").getData().bankCityE = "Error";
                            oView.getModel("oErrorModel").getData().bankCityM = oi18n.getText("mandatoryCity");

                            iError = true;
                        }

                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum && bankFields.benificiaryAccountNumber) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum)) {
                            oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                            oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("mandatoryAccNum");

                            iError = true;
                        }

                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].benefAccHolderName && bankFields.benificiaryAccHolderName) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry)) {
                            oView.getModel("oErrorModel").getData().benifAccHNameE = "Error";
                            oView.getModel("oErrorModel").getData().benifAccHNameM = oi18n.getText("mandatoryHolderName");

                            iError = true;
                        }

                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode && bankFields.swiftCode) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode)) {
                            oView.getModel("oErrorModel").getData().bankSwiftE = "Error";
                            oView.getModel("oErrorModel").getData().bankSwiftM = oi18n.getText("mandatorySwftCd");

                            iError = true;
                        }

                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch && bankFields.bankBranch) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch)) {
                            // if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry == "CN" && !oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch) {
                            oView.getModel("oErrorModel").getData().bankBranchE = "Error";
                            oView.getModel("oErrorModel").getData().bankBranchM = oi18n.getText("mandatoryBranch");

                            iError = true;
                        }
                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].refBankDetails && bankFields.referenceDetails) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].refBankDetails)) {
                            oView.getModel("oErrorModel").getData().bankRefE = "Error";
                            oView.getModel("oErrorModel").getData().bankRefM = oi18n.getText("mandatoryRefDet");

                            iError = true;
                        }
                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber && bankFields.bankNumber) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber)) {
                            oView.getModel("oErrorModel").getData().bankNumE = "Error";
                            oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("mandatoryBankNum");

                            iError = true;
                        }
                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].ibanNum && bankFields.iban) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].ibanNum)) {
                            oView.getModel("oErrorModel").getData().ibanE = "Error";
                            oView.getModel("oErrorModel").getData().ibanM = oi18n.getText("mandatoryIban");

                            iError = true;
                        }
                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].partnerBankType && bankFields.benificiaryAccCurrency) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].partnerBankType)) {
                            oView.getModel("oErrorModel").getData().benifAccCurrE = "Error";
                            oView.getModel("oErrorModel").getData().benifAccCurrM = oi18n.getText("mandatoryAccCurr");

                            iError = true;
                        }
                        if ((!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey && bankFields.bankControlKey) || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey)) {
                            oView.getModel("oErrorModel").getData().bankCtrlKeyE = "Error";
                            oView.getModel("oErrorModel").getData().bankCtrlKeyM = oi18n.getText("mandatoryctrlKey");

                            iError = true;
                        }
                    }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName.length > 60) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAddress && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAddress.length > 35) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum.length > 18) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].benefAccHolderName && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].benefAccHolderName.length > 60) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].refBankDetails && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].refBankDetails.length > 20) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode.length > 11) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCode && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCode.length > 4) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber.length > 15) {
                            iError = true;
                        }
                        if (this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.ibanLength) {
                            if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].ibanNum && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].ibanNum.length !== parseInt(this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.ibanLength)) {
                                iError = true;
                            }
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCity && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCity.length > 35) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankState && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankState.length > 3) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey.length > 2) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].instructionKey && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].instructionKey.length > 3) {
                            iError = true;
                        }
 
            
                        if (apaymentMethod !== 'Optional' && that.getView().getModel("oAttachmentList").getData()[0].bankDArray.length == 0) {
                            iError = true;
                            oView.byId("fileUploader_BA").removeStyleClass("attachmentWithoutBorder");
                            oView.byId("fileUploader_BA").addStyleClass("attachmentWithBorder");
                        } else {
                            oView.byId("fileUploader_BA").removeStyleClass("attachmentWithBorder");
                            oView.byId("fileUploader_BA").addStyleClass("attachmentWithoutBorder");
                        }
                        // var oBankValidation = oView.getModel("oVisibilityModel").getProperty("/bankValidation");
                        // if(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber) {
                        //     var bankNum = oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber;
                        //     var bankNumMaxLength = oBankValidation.bankNumLength;
                        //     var bankNumRule = oBankValidation.bankNumRule;
                        //     switch(bankNumRule) {
                        //         case 1:
                        //             if (/\s/.test(bankNum) || bankNum.length > bankNumMaxLength) {
                        //                 oView.getModel("oErrorModel").getData().bankNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("rule1");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 2:
                        //             if (!(/^\d+$/.test(bankNum)) || bankNum.length > bankNumMaxLength) {
                        //                 oView.getModel("oErrorModel").getData().bankNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("rule2");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 3:
                        //             if (/\s/.test(bankNum) || !(bankNum.length === bankNumMaxLength)) {
                        //                 oView.getModel("oErrorModel").getData().bankNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("rule3_1") + " " + bankNumMaxLength + " " + oi18n.getText("rule3_2");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 4:
                        //             if (!(/^\d+$/.test(bankNum)) || !(bankNum.length === bankNumMaxLength)) {
                        //                 oView.getModel("oErrorModel").getData().bankNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("rule3_1") + " " + bankNumMaxLength + " " + oi18n.getText("rule4");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 5:
                        //             if (bankNum.length > bankNumMaxLength) {
                        //                 oView.getModel("oErrorModel").getData().bankNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("rule5");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 6:
                        //             if (!(/^[\d ]*$/.test(bankNum)) || bankNum.length > bankNumMaxLength) {
                        //                 oView.getModel("oErrorModel").getData().bankNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("rule6");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 7:
                        //             if (!(bankNum.length === bankNumMaxLength)) {
                        //                 oView.getModel("oErrorModel").getData().bankNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("rule7_1") + " " + bankNumMaxLength + " " + oi18n.getText("rule7_2");
                        //                     iError = true;
                        //             }
                        //             break;
                        //         case 8:
                        //             if (!(/^[\d ]*$/.test(bankNum)) || !(bankNum.length === bankNumMaxLength)) {
                        //                 oView.getModel("oErrorModel").getData().bankNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("rule7_1") + " " + bankNumMaxLength + " " + oi18n.getText("rule8");
                        //                 iError = true;
                        //             }     
                        //     }
                        // }
                        // if(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum) {
                        //     var bankAccNum = oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum;
                        //     var bankAccNumMaxLength = oBankValidation.bankAccNumLength;
                        //     var bankAccNumRule = oBankValidation.bankAccNumRule;
                        //     switch(bankAccNumRule) {
                        //         case 1:
                        //             if (/\s/.test(bankAccNum) || bankAccNum.length > bankAccNumMaxLength) {
                        //                 oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("rule1");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 2:
                        //             if (!(/^\d+$/.test(bankAccNum)) || bankAccNum.length > bankAccNumMaxLength) {
                        //                 oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("rule2");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 3:
                        //             if (/\s/.test(bankAccNum) || !(bankAccNum.length === bankAccNumMaxLength)) {
                        //                 oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("rule3_1") + " " + bankNumMaxLength + " " + oi18n.getText("rule3_2");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 4:
                        //             if (!(/^\d+$/.test(bankAccNum)) || !(bankAccNum.length === bankAccNumMaxLength)) {
                        //                 oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("rule3_1") + " " + bankNumMaxLength + " " + oi18n.getText("rule4");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 5:
                        //             if (bankAccNum.length > bankAccNumMaxLength) {
                        //                 oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("rule5");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 6:
                        //             if (!(/^[\d ]*$/.test(bankAccNum)) || bankAccNum.length > bankAccNumMaxLength) {
                        //                 oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("rule6");
                        //                 iError = true;
                        //             }
                        //             break;
                        //         case 7:
                        //             if (!(bankAccNum.length === bankAccNumMaxLength)) {
                        //                     oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                        //                     oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("rule7_1") + " " + bankNumMaxLength + " " + oi18n.getText("rule7_2");
                        //                     iError = true;
                        //             }
                        //             break;
                        //         case 8:
                        //             if (!(/^[\d ]*$/.test(bankAccNum)) || !(bankAccNum.length === bankAccNumMaxLength)) {
                        //                 oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                        //                 oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("rule7_1") + " " + bankNumMaxLength + " " + oi18n.getText("rule8");
                        //                 iError = true;
                        //             }     
                        //     }
                        // }
                    } else {
                        oView.byId("fileUploader_BA").removeStyleClass("attachmentWithBorder");
                    }
                    if (visiblility.isBankProvided === false) {
                        if (!oView.getModel("oDataModel").getData().bankDto.financeContact1.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact1.firstName)) {
                            oView.getModel("oErrorModel").getData().finance1FNameE = "Error";
                            oView.getModel("oErrorModel").getData().finance1FNameM = oi18n.getText("mandatoryFName");

                            iError = true;
                        } if (!oView.getModel("oDataModel").getData().bankDto.financeContact1.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact1.lastName)) {
                            oView.getModel("oErrorModel").getData().finance1LNameE = "Error";
                            oView.getModel("oErrorModel").getData().finance1LNameM = oi18n.getText("mandatoryLName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().bankDto.financeContact1.email || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact1.email)) {

                            oView.getModel("oErrorModel").getData().finance1EmailE = "Error";
                            oView.getModel("oErrorModel").getData().finance1EmailM = oi18n.getText("mandatoryEmail");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().bankDto.financeContact1.countryContactCode || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact1.countryContactCode)) {
                            oView.getModel("oErrorModel").getData().finance1CountryContCodeE = "Error";
                            oView.getModel("oErrorModel").getData().finance1CountryContCodeM = oi18n.getText("mandatoryCountryConatactCode");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().bankDto.financeContact1.contact || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact1.contact)) {
                            oView.getModel("oErrorModel").getData().finance1ContE = "Error";
                            oView.getModel("oErrorModel").getData().finance1ContM = oi18n.getText("mandatoryContact");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.financeContact1.contact !== "" && Number(oView.getModel("oDataModel").getData().bankDto.financeContact1.contact.replaceAll("-", "")) == 0) {
                            oView.getModel("oErrorModel").getData().finance1ContE = "Error";
                            oView.getModel("oErrorModel").getData().finance1ContM = oi18n.getText("invalidContact");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().bankDto.financeContact1.countryMobileCode || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact1.countryMobileCode)) {
                            oView.getModel("oErrorModel").getData().finance1CountryContCodeMobE = "Error";
                            oView.getModel("oErrorModel").getData().finance1CountryContCodeMobM = oi18n.getText("mandatoryCountryConatactCode");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().bankDto.financeContact1.mobile || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact1.mobile)) {
                            oView.getModel("oErrorModel").getData().finance1MobE = "Error";
                            oView.getModel("oErrorModel").getData().finance1MobM = oi18n.getText("mandatoryMContact");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.financeContact1.mobile !== "" && Number(oView.getModel("oDataModel").getData().bankDto.financeContact1.mobile.replaceAll("-", "")) == 0) {
                            oView.getModel("oErrorModel").getData().finance1MobE = "Error";
                            oView.getModel("oErrorModel").getData().finance1MobM = oi18n.getText("invalidMContact");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.financeContact1.firstName && oView.getModel("oDataModel").getData().bankDto.financeContact1.firstName.length > 30) {


                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.financeContact1.lastName && oView.getModel("oDataModel").getData().bankDto.financeContact1.lastName.length > 30) {

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.financeContact1.email.length && oView.getModel("oDataModel").getData().bankDto.financeContact1.email.length > 241) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.financeContact1.contact && oView.getModel("oDataModel").getData().bankDto.financeContact1.contact.length > 30) {

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.financeContact1.mobile && oView.getModel("oDataModel").getData().bankDto.financeContact1.mobile.length > 30) {

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().bankDto.financeContact1.extension && oView.getModel("oDataModel").getData().bankDto.financeContact1.extension.length > 10) {
                            iError = true;
                        }
                    }

                    if (!oView.getModel("oDataModel").getData().bankDto.financeContact2.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact2.firstName)) {
                        oView.getModel("oErrorModel").getData().finance2FNameE = "Error";
                        oView.getModel("oErrorModel").getData().finance2FNameM = oi18n.getText("mandatoryFName");

                        iError = true;
                    } if (!oView.getModel("oDataModel").getData().bankDto.financeContact2.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact2.lastName)) {
                        oView.getModel("oErrorModel").getData().finance2LNameE = "Error";
                        oView.getModel("oErrorModel").getData().finance2LNameM = oi18n.getText("mandatoryLName");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().bankDto.financeContact2.email || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact2.email)) {

                        oView.getModel("oErrorModel").getData().finance2EmailE = "Error";
                        oView.getModel("oErrorModel").getData().finance2EmailM = oi18n.getText("mandatoryEmail");

                        iError = true;
                    }
                     if (!oView.getModel("oDataModel").getData().bankDto.financeContact2.countryContactCode || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact2.countryContactCode)) {
                        oView.getModel("oErrorModel").getData().finance2CountryContCodeE = "Error";
                        oView.getModel("oErrorModel").getData().finance2CountryContCodeM = oi18n.getText("mandatoryCountryConatactCode");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().bankDto.financeContact2.countryMobileCode || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact2.countryMobileCode)) {
                        oView.getModel("oErrorModel").getData().finance2CountryContCodeMobE = "Error";
                        oView.getModel("oErrorModel").getData().finance2CountryContCodeMobM = oi18n.getText("mandatoryCountryConatactCode");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().bankDto.financeContact2.contact || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact2.contact)) {
                        oView.getModel("oErrorModel").getData().finance2ContE = "Error";
                        oView.getModel("oErrorModel").getData().finance2ContM = oi18n.getText("mandatoryContact");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.contact !== "" && Number(oView.getModel("oDataModel").getData().bankDto.financeContact2.contact.replaceAll("-", "")) == 0) {
                        oView.getModel("oErrorModel").getData().finance2ContE = "Error";
                        oView.getModel("oErrorModel").getData().finance2ContM = oi18n.getText("invalidContact");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().bankDto.financeContact2.mobile || spaceRegex.test(oView.getModel("oDataModel").getData().bankDto.financeContact2.mobile)) {
                        oView.getModel("oErrorModel").getData().finance2MobE = "Error";
                        oView.getModel("oErrorModel").getData().finance2MobM = oi18n.getText("mandatoryMContact");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.mobile !== "" && Number(oView.getModel("oDataModel").getData().bankDto.financeContact2.mobile.replaceAll("-", "")) == 0) {
                        oView.getModel("oErrorModel").getData().finance2MobE = "Error";
                        oView.getModel("oErrorModel").getData().finance2MobM = oi18n.getText("invalidMContact");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.firstName && oView.getModel("oDataModel").getData().bankDto.financeContact2.firstName.length > 30) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.lastName && oView.getModel("oDataModel").getData().bankDto.financeContact2.lastName.length > 30) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.email.length && oView.getModel("oDataModel").getData().bankDto.financeContact2.email.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.contact && oView.getModel("oDataModel").getData().bankDto.financeContact2.contact.length > 30) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.mobile && oView.getModel("oDataModel").getData().bankDto.financeContact2.mobile.length > 30) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.extension && oView.getModel("oDataModel").getData().bankDto.financeContact2.extension.length > 10) {
                        iError = true;
                    }
                    if (visiblility.isBankProvided === false) {
                        if (oView.getModel("oDataModel").getData().bankDto.financeContact1.email && oView.getModel("oDataModel").getData().bankDto.financeContact1.email == oView.getModel("oDataModel").getData().bankDto.financeContact2.email) {
                            iError = true;


                            if (isDefaultLan) {
                                sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("correctFC")), {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: that.getView().getModel("i18n").getResourceBundle().getText("error")
                                });
                            } else {
                                sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.correctFC + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("correctFC")), {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),

                                });
                            }
                        }
                        else if (oView.getModel("oDataModel").getData().bankDto.financeContact1.contact && oView.getModel("oDataModel").getData().bankDto.financeContact1.contact == oView.getModel("oDataModel").getData().bankDto.financeContact2.contact) {
                            iError = true;
                            if (isDefaultLan) {
                                sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("correctFC")), {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: that.getView().getModel("i18n").getResourceBundle().getText("error")
                                });
                            } else {
                                sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.correctFC + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("correctFC")), {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),

                                });
                            }
                        }
                        else if (oView.getModel("oDataModel").getData().bankDto.financeContact1.mobile && oView.getModel("oDataModel").getData().bankDto.financeContact1.mobile == oView.getModel("oDataModel").getData().bankDto.financeContact2.mobile) {
                            iError = true;
                            if (isDefaultLan) {
                                sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("correctFC")), {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: that.getView().getModel("i18n").getResourceBundle().getText("error")
                                });
                            } else {
                                sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.correctFC + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("correctFC")), {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),

                                });
                            }
                        }
                    }

                    if (oView.getModel("oDataModel").getData().financeInfoDto.doesFinancialStatements === -1) {
                        oView.getModel("oErrorModel").getData().doesFinancialStatementsE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().financeInfoDto.financeAuditedLast12M === null) {
                        oView.getModel("oErrorModel").getData().financeAuditedLast12ME = "Error";
                        iError = true;
                    }
                     if (oView.getModel("oDataModel").getData().financeInfoDto.financeAuditedLast12M === true) {
                          if (!oView.getModel("oDataModel").getData().financeInfoDto.userAudited || spaceRegex.test(oView.getModel("oDataModel").getData().financeInfoDto.userAudited)) {
                            oView.getModel("oErrorModel").getData().financeUserAuditE = "Error";
                            oView.getModel("oErrorModel").getData().financeUserAuditM = oi18n.getText("mandatoryName");

                            iError = true;
                        }
                    }
                }
                //  }
                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("bankInfo").setValidated(false);
                } else {
                    oView.byId("bankInfo").setValidated(true);
                }
                if (vAppName == "SupplierFinance") {
                    if (iError == true) {
                        return "Invalid";
                    }
                }
            },
            _fnValidateShippingInfo: function (oEvent) {
                var spaceRegex = /^\s+$/;
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                if (oView.getModel("oUserModel").getData().isNew) {
                    if (!oView.getModel("oDataModel").getData().shippingInfoDto.incoterm) {
                        oView.getModel("oErrorModel").getData().incotermE = "Error";
                        oView.getModel("oErrorModel").getData().incotermM = oi18n.getText("mandatoryIncoterm");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().shippingInfoDto.incotermNamedPlace || spaceRegex.test(oView.getModel("oDataModel").getData().shippingInfoDto.incotermNamedPlace)) {
                        oView.getModel("oErrorModel").getData().incotermNPE = "Error";
                        oView.getModel("oErrorModel").getData().incotermNPM = oi18n.getText("mandatoryIncotermNL");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.incotermNamedPlace && oView.getModel("oDataModel").getData().shippingInfoDto.incotermNamedPlace.length > 28) {
                        iError = true;
                    }
                } else {
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.newincotermNamedPlace && oView.getModel("oDataModel").getData().shippingInfoDto.newincotermNamedPlace.length > 28) {
                        iError = true;
                    }
                }
                if (!oView.getModel("oDataModel").getData().shippingInfoDto.vendor || spaceRegex.test(oView.getModel("oDataModel").getData().shippingInfoDto.vendor)) {
                    oView.getModel("oErrorModel").getData().vendorE = "Error";
                    oView.getModel("oErrorModel").getData().vendorM = oi18n.getText("mandatoryVendor");

                    iError = true;
                }

                if (oView.getModel("oDataModel").getData().shippingInfoDto.isDeliver === null) {
                    oView.getModel("oErrorModel").getData().isDeliverE = "Error";
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().shippingInfoDto.vendor && oView.getModel("oDataModel").getData().shippingInfoDto.vendor.length > 30) {
                    iError = true;
                }

                if (oView.getModel("oDataModel").getData().shippingInfoDto.deliveryLocation && oView.getModel("oDataModel").getData().shippingInfoDto.deliveryLocation.length > 20) {
                    iError = true;
                }

                if (oView.getModel("oDataModel").getData().shippingInfoDto.isDeliver) {
                    //check field validation
                    if (!oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepName || spaceRegex.test(oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepName)) {
                        oView.getModel("oErrorModel").getData().dRespNameE = "Error";
                        oView.getModel("oErrorModel").getData().dRespNameM = oi18n.getText("mandatoryCompName");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().shippingInfoDto.supplierContactInLogistics || spaceRegex.test(oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepName)) {
                        oView.getModel("oErrorModel").getData().dRespLogistE = "Error";
                        oView.getModel("oErrorModel").getData().dRespLogistM = oi18n.getText("mandatorySupplierLogis");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepCountryContactCode) {
                        oView.getModel("oErrorModel").getData().dRespCountryContactCodeE = "Error";
                        oView.getModel("oErrorModel").getData().dRespCountryContactCodeM = oi18n.getText("mandatoryCountryConatactCode");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepContact || spaceRegex.test(oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepContact)) {
                        oView.getModel("oErrorModel").getData().dRespContactE = "Error";
                        oView.getModel("oErrorModel").getData().dRespContactM = oi18n.getText("mandatoryContact");

                        iError = true;
                    }

                    if (oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepContact !== "" && Number(oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepContact.replaceAll("-", "")) == 0) {
                        oView.getModel("oErrorModel").getData().dRespContactE = "Error";
                        oView.getModel("oErrorModel").getData().dRespContactM = oi18n.getText("invalidContact");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepEmail || spaceRegex.test(oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepEmail)) {
                        oView.getModel("oErrorModel").getData().dRespEmailE = "Error";
                        oView.getModel("oErrorModel").getData().dRespEmailM = oi18n.getText("mandatoryEmail");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepName.length > 35) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.supplierContactInLogistics.length > 40) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepEmail.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepContact.length > 30) {
                        iError = true;
                    }
                }
                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("shippingInfo").setValidated(false);
                } else {
                    oView.byId("shippingInfo").setValidated(true);
                }
            },

            onEnterOtherValueOperServ: function () {
                var i, j;
                var arrOperService = oView.getModel("oDataModel").getData().comProductsUiDto.operationServices;
                var arrLookupOperService = oView.getModel("oLookUpModel").getData().operationServices;
                for (i = 0; i < arrOperService.length; i++) {
                    if (arrOperService[i].value == "Other") {
                        for (j = 0; j < arrLookupOperService.length; j++) {
                            if (arrLookupOperService[j].value == "Other") {
                                oView.getModel("oDataModel").getData().comProductsUiDto.operationServices[i].otherValue = arrLookupOperService[j].otherValue;
                            }
                        }
                    }
                }
                oView.getModel("oDataModel").refresh();

            },

            onEnterOtherValueManProd: function () {
                var i, j;
                var arrOperService = oView.getModel("oDataModel").getData().comProductsUiDto.manufacturingProcessSupplies;
                var arrLookupOperService = oView.getModel("oLookUpModel").getData().manufacturingProcessSupplies;
                for (i = 0; i < arrOperService.length; i++) {
                    if (arrOperService[i].value == "Other") {
                        for (j = 0; j < arrLookupOperService.length; j++) {
                            if (arrLookupOperService[j].value == "Other") {
                                oView.getModel("oDataModel").getData().comProductsUiDto.manufacturingProcessSupplies[i].otherValue = arrLookupOperService[j].otherValue;
                            }
                        }
                    }
                }
                oView.getModel("oDataModel").refresh();
            },

            _fnValidateComProductServiceInfo: function () {
                var spaceRegex = /^\s+$/;
                var that = this;
                var iError = false;
                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                var isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                if (oView.getModel("oDataModel").getData().comProductsUiDto.isOperationServices || oView.getModel("oDataModel").getData().comProductsUiDto.isManufacturingProcessSupplies) {
                    iError = false;

                } else {
                    iError = true;
                    if (isDefaultLan) {
                        sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastOne")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    } else {
                        sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.selectAtleastOne + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastOne")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    }
                }
                if (oView.getModel("oDataModel").getData().comProductsUiDto.isOperationServices) {
                    var arrOperService = oView.getModel("oDataModel").getData().comProductsUiDto.operationServices;

                    if (arrOperService) {
                        for (var i = 0; i < arrOperService.length; i++) {
                            if (arrOperService[i].value == "Other" && (arrOperService[i].otherValue == "" || spaceRegex.test(arrOperService[i].otherValue)) && arrOperService[i].isSelected == true) {
                                oView.getModel("oErrorModel").getData().operServOtherValE = "Error";
                                oView.getModel("oErrorModel").getData().operServOtherValM = oi18n.getText("mandatoryText");
                                // oView.byId("OprServId").removeStyleClass("otherStyle");

                                iError = true;
                            }
                        }
                    }
                    if (arrOperService == null || arrOperService.length === 0) {
                        iError = true;

                        if (isDefaultLan) {
                            sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastAnItemOP")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        } else {
                            sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.selectAtleastAnItemOP + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastAnItemOP")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        }
                    }
                }
                if (oView.getModel("oDataModel").getData().comProductsUiDto.isManufacturingProcessSupplies) {
                    var arrManProd = oView.getModel("oDataModel").getData().comProductsUiDto.manufacturingProcessSupplies;
                    if (arrManProd) {
                        for (var i = 0; i < arrManProd.length; i++) {
                            if (arrManProd[i].value == "Other" && (arrManProd[i].otherValue == "" || spaceRegex.test(arrManProd[i].otherValue)) && arrManProd[i].isSelected == true) {
                                oView.getModel("oErrorModel").getData().manProOtherValE = "Error";
                                oView.getModel("oErrorModel").getData().manProOtherValM = oi18n.getText("mandatoryText");

                                iError = true;
                            }
                        }
                    }
                    if (arrManProd == null || arrManProd.length === 0) {
                        iError = true;
                        var isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                        if (isDefaultLan) {
                            sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastAnItemMS")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        } else {
                            sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.selectAtleastAnItemMS + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastAnItemMS")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        }
                    }
                }
                //  if (oView.getModel("oLookUpModel").getData().operationServices[12].otherValue=="" && oView.getModel("oLookUpModel").getData().operationServices[12].isSelected==true) {
                //     oView.getModel("oErrorModel").getData().operServOtherValE = "Error";
                //     oView.getModel("oErrorModel").getData().operServOtherValM = oi18n.getText("mandatoryText");

                //     iError = true;
                // }
                // if (oView.getModel("oLookUpModel").getData().manufacturingProcessSupplies[10].otherValue=="" && oView.getModel("oLookUpModel").getData().manufacturingProcessSupplies[10].isSelected==true) {
                //     oView.getModel("oErrorModel").getData().manProOtherValE = "Error";
                //     oView.getModel("oErrorModel").getData().manProOtherValM = oi18n.getText("mandatoryText");

                //     iError = true;
                // }

                oView.getModel("oErrorModel").refresh();
                if (iError) {

                    oView.byId("prodAndServInfo").setValidated(false);
                } else {


                    // oView.byId("OprServId").addStyleClass("otherStyle");
                    oView.byId("prodAndServInfo").setValidated(true);
                }


            },
            _fnValidateCompanyCompliance: function () {
                var spaceRegex = /^\s+$/;
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().comComplianceDto.ndaSignedBefore === -1) {
                    oView.getModel("oErrorModel").getData().ndaSignedBeforeE = "Error";
                    iError = true;
                }
                // if (oView.getModel("companyInfoModel").getData().haveDiversityCertifications === null) {
                //     oView.getModel("oErrorModel").getData().haveDiversityCertificationsE = "Error";
                //     iError = true;
                // }
                if (oView.getModel("oUserModel").getData().isNew) {
                    if (oView.getModel("oDataModel").getData().comComplianceDto.isSrmReceived === null) {
                        oView.getModel("oErrorModel").getData().isSrmReceivedE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectations === null) {
                        oView.getModel("oErrorModel").getData().commitedToExpectationsE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmp === null) {
                        oView.getModel("oErrorModel").getData().companyRelationWithJabilEmpE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().comComplianceDto.companyContactWithPreviouseJabilEmp === null) {
                        oView.getModel("oErrorModel").getData().companyContactWithPreviouseJabilEmpE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().comComplianceDto.isDisasterRecoveryPlan === null) {
                        oView.getModel("oErrorModel").getData().isDisasterRecoveryPlanE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().comComplianceDto.isDisasterRecoveryPlan === true && oView.getModel("oDataModel").getData().comComplianceDto.canDisasterRecoveryPlan === null) {
                        oView.getModel("oErrorModel").getData().canDisasterRecoveryPlanE = "Error";
                        iError = true;
                    }

                    if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectations === false) {
                        var email = oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.email
                        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                        if (email) {
                            if (!email.match(mailregex)) {
                                oView.getModel("oErrorModel").getData().cocE = "Error";
                                oView.getModel("oErrorModel").getData().cocM = oi18n.getText("invalidEmail");

                                iError = true;
                            } else if (email.toUpperCase().includes("JABIL.COM")) {
                                oView.getModel("oErrorModel").getData().cocE = "Error";
                                oView.getModel("oErrorModel").getData().cocM = oi18n.getText("invalidEmail");

                                iError = true;
                            } else {
                                oView.getModel("oErrorModel").getData().cocE = "None";
                                oView.getModel("oErrorModel").getData().cocM = "";

                                // iError = false;
                            }
                        }

                        if (!oView.getModel("oDataModel").getData().comComplianceDto.notCommitedExplanation || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.notCommitedExplanation)) {
                            oView.getModel("oErrorModel").getData().notCommitedExplanationE = "Error";
                            oView.getModel("oErrorModel").getData().notCommitedExplanationM = oi18n.getText("mandatoryExplanation");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.firstName)) {
                            oView.getModel("oErrorModel").getData().commitedToExpectationsContactFNameE = "Error";
                            oView.getModel("oErrorModel").getData().commitedToExpectationsContactFNameM = oi18n.getText("mandatoryName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.countryContactCode) {
                            oView.getModel("oErrorModel").getData().cocCountryCodeE = "Error";
                            oView.getModel("oErrorModel").getData().cocCountryCodeM = oi18n.getText("mandatoryCountryConatactCode");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.contact || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.contact)) {
                            oView.getModel("oErrorModel").getData().cocContactE = "Error";
                            oView.getModel("oErrorModel").getData().cocContactM = oi18n.getText("mandatoryContact");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.contact !== "" && Number(oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.contact.replaceAll("-", "")) == 0) {
                            oView.getModel("oErrorModel").getData().cocContactE = "Error";
                            oView.getModel("oErrorModel").getData().cocContactM = oi18n.getText("invalidContact");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.email || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.email)) {
                            oView.getModel("oErrorModel").getData().cocE = "Error";
                            oView.getModel("oErrorModel").getData().cocM = oi18n.getText("mandatoryEmail");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.firstName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.lastName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.email.length > 241) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.contact && oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.contact.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.extension && oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.extension.length > 10) {
                            iError = true;
                        }

                    }

                    if (oView.getModel("oDataModel").getData().comComplianceDto.isSrmReceived === false) {
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.supplierReqManualExplanation || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.supplierReqManualExplanation)) {
                            oView.getModel("oErrorModel").getData().isSrmReceivedExplanationE = "Error";
                            oView.getModel("oErrorModel").getData().isSrmReceivedExplanationM = oi18n.getText("mandatoryExplanation");

                            iError = true;
                        }
                    }
                    if (oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmp) {
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.firstName)) {
                            oView.getModel("oErrorModel").getData().relationFNameE = "Error";
                            oView.getModel("oErrorModel").getData().relationFNameM = oi18n.getText("mandatoryName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.department || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.department)) {
                            oView.getModel("oErrorModel").getData().relationDeptE = "Error";
                            oView.getModel("oErrorModel").getData().relationDeptM = oi18n.getText("mandatoryDepartment");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.jobTitle || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.jobTitle)) {
                            oView.getModel("oErrorModel").getData().relationJobTE = "Error";
                            oView.getModel("oErrorModel").getData().relationJobTM = oi18n.getText("mandatoryJobTitle");

                            iError = true;
                        }

                        var email = oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.email
                        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                        if (email) {
                            if (!email.match(mailregex)) {
                                oView.getModel("oErrorModel").getData().pEmpE = "Error";
                                oView.getModel("oErrorModel").getData().pEmpM = oi18n.getText("invalidEmail");

                                iError = true;
                            } else if (!email.toUpperCase().includes("JABIL.COM")) {
                                oView.getModel("oErrorModel").getData().pEmpE = "Error";
                                oView.getModel("oErrorModel").getData().pEmpM = oi18n.getText("invalidEmail");

                                iError = true;
                            } else {
                                oView.getModel("oErrorModel").getData().pEmpE = "";
                                oView.getModel("oErrorModel").getData().pEmpM = oi18n.getText("");

                                iError = iError || false;
                            }
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.firstName.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.department.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.email.length > 241) {
                            iError = true;
                        }

                    }
                    if (oView.getModel("oDataModel").getData().comComplianceDto.companyContactWithPreviouseJabilEmp) {
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.employeeName || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.employeeName)) {
                            oView.getModel("oErrorModel").getData().empFNameE = "Error";
                            oView.getModel("oErrorModel").getData().empFNameM = oi18n.getText("mandatoryEmpName");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.startDate || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.startDate)) {
                            oView.getModel("oErrorModel").getData().empSDateE = "Error";
                            oView.getModel("oErrorModel").getData().empSDateM = oi18n.getText("mandatoryStartDate");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.endDate || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.endDate)) {
                            oView.getModel("oErrorModel").getData().empEDateE = "Error";
                            oView.getModel("oErrorModel").getData().empEDateM = oi18n.getText("mandatoryEndDate");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.jobTitle || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.jobTitle)) {
                            oView.getModel("oErrorModel").getData().empJBE = "Error";
                            oView.getModel("oErrorModel").getData().empJBM = oi18n.getText("mandatoryJobTitle");

                            iError = true;
                        }
                        if (!oView.getModel("oDataModel").getData().comComplianceDto.region || spaceRegex.test(oView.getModel("oDataModel").getData().comComplianceDto.region)) {
                            oView.getModel("oErrorModel").getData().empRegionE = "Error";
                            oView.getModel("oErrorModel").getData().empRegionM = oi18n.getText("mandatoryLocation");

                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.employeeName && oView.getModel("oDataModel").getData().comComplianceDto.employeeName.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.region && oView.getModel("oDataModel").getData().comComplianceDto.region.length > 20) {
                            iError = true;
                        }
                    }
                }

                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("cComplianceInfo").setValidated(false);
                } else {
                    oView.byId("cComplianceInfo").setValidated(true);
                }
            },
            _fnValidateCyberSec: function () {
                var spaceRegex = /^\s+$/;
                var that = this;
                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                var isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                var iError = false;
                var olist = oView.getModel("oLookUpModel").getData().orgEstablishConnection;
                var olist1 = oView.getModel("oLookUpModel").getData().orgBusinessActivities;
                var oListLength = [], oListLength1 = [];
                var oSelectedList = [], oSelectedList1 = [];
                if (this.emailValidResult) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().itCyberDto.orgConnectToJabilSystem === null) {
                    oView.getModel("oErrorModel").getData().orgConnectToJabilSystemE = "Error";
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().itCyberDto.orgMaintainProcessDataFromJabil === null) {
                    oView.getModel("oErrorModel").getData().orgMaintainProcessDataFromJabilE = "Error";
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().itCyberDto.orgConnectToJabilSystem || oView.getModel("oDataModel").getData().itCyberDto.orgMaintainProcessDataFromJabil) {
                    if (oView.getModel("oDataModel").getData().itCyberDto.certifiedForInfoSecurity === null) {
                        oView.getModel("oErrorModel").getData().certifiedForInfoSecurityE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.validateCertificate === null) {
                        oView.getModel("oErrorModel").getData().validateCertificateE = "Error";
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.responsibleForInforSecurity === null) {
                        oView.getModel("oErrorModel").getData().responsibleForInforSecurityE = "Error";
                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.firstName || spaceRegex.test(oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.firstName)) {
                        oView.getModel("oErrorModel").getData().cyberSurveyFNE = "Error";
                        oView.getModel("oErrorModel").getData().cyberSurveyFNM = oi18n.getText("mandatoryFName");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.lastName || spaceRegex.test(oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.lastName)) {
                        oView.getModel("oErrorModel").getData().cyberSurveyLNE = "Error";
                        oView.getModel("oErrorModel").getData().cyberSurveyLNM = oi18n.getText("mandatoryLName");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.email || spaceRegex.test(oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.email)) {
                        oView.getModel("oErrorModel").getData().cyberSurveyE = "Error";
                        oView.getModel("oErrorModel").getData().cyberSurveyM = oi18n.getText("mandatoryEmail");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.contact || spaceRegex.test(oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.contact)) {
                        oView.getModel("oErrorModel").getData().cyberSurveyMNE = "Error";
                        oView.getModel("oErrorModel").getData().cyberSurveyMNM = oi18n.getText("mandatoryContact");

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.contact !== "" && Number(oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.contact.replaceAll("-", "")) == 0) {
                        oView.getModel("oErrorModel").getData().cyberSurveyMNE = "Error";
                        oView.getModel("oErrorModel").getData().cyberSurveyMNM = oi18n.getText("invalidContact");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.countryContactCode) {
                        oView.getModel("oErrorModel").getData().cyberSurveyCountryCodeE = "Error";
                        oView.getModel("oErrorModel").getData().cyberSurveyCountryCodeM = oi18n.getText("mandatoryCountryConatactCode");

                        iError = true;
                    }
                    var email = oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.email
                    var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                    if (email) {
                        if (!email.match(mailregex)) {
                            oView.getModel("oErrorModel").getData().cyberSurveyE = "Error";
                            oView.getModel("oErrorModel").getData().cyberSurveyM = oi18n.getText("invalidEmail");

                            iError = true;
                        } else if (email.toUpperCase().includes("JABIL.COM")) {
                            oView.getModel("oErrorModel").getData().cyberSurveyE = "Error";
                            oView.getModel("oErrorModel").getData().cyberSurveyM = oi18n.getText("invalidEmail");

                            iError = true;
                        } else {
                            oView.getModel("oErrorModel").getData().cyberSurveyE = "None";
                            oView.getModel("oErrorModel").getData().cyberSurveyM = "";


                        }
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.firstName && oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.firstName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.lastName && oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.lastName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.email && oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.email.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.contact && oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.extension && oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.extension.length > 10) {
                        iError = true;
                    }
                }
                if (iError) {

                    if (isDefaultLan) {
                        sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("validationDefaultMsg")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    } else {
                        sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.validationDefaultMsg + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("validationDefaultMsg")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    }
                }
                if (oView.getModel("oDataModel").getData().itCyberDto.orgConnectToJabilSystem && !iError) {


                    $.each(olist, function (index, value) {
                        if (value.isSelected) {
                            oListLength.push(value);
                        }
                    });
                    if (oListLength.length === 0) {
                        iError = true;

                        if (isDefaultLan) {
                            sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastAnItemJBN")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        } else {
                            sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.selectAtleastAnItemJBN + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastAnItemJBN")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        }

                    }
                }
                if (oView.getModel("oDataModel").getData().itCyberDto.orgMaintainProcessDataFromJabil && !iError) {


                    $.each(olist1, function (index, value) {
                        if (value.isSelected) {
                            oListLength1.push(value);
                        }
                    });
                    if (oListLength1.length === 0) {
                        iError = true;

                        if (isDefaultLan) {
                            sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastAnItemBA")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        } else {
                            sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.selectAtleastAnItemBA + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("selectAtleastAnItemBA")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        }

                    }

                }

                if (oView.getModel("oDataModel").getData().itCyberDto.orgConnectToJabilSystem) {
                    $.each(olist, function (index, value) {
                        if (value.isSelected) {
                            oSelectedList.push(value);
                        }
                    });
                    if (oSelectedList.length === 0) {
                        oView.getModel("oErrorModel").getData().orgEstablishConnectionSelectedE = "Error";
                    }

                }

                if (oView.getModel("oDataModel").getData().itCyberDto.orgMaintainProcessDataFromJabil) {
                    $.each(olist1, function (index, value) {
                        if (value.isSelected) {
                            oSelectedList1.push(value);
                        }
                    });
                    if (oSelectedList1.length === 0) {
                        oView.getModel("oErrorModel").getData().orgBusinessActivitiesisSelectedE = "Error";
                    }

                }
                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("cyberSecInfo").setValidated(false);
                } else {
                    oView.byId("cyberSecInfo").setValidated(true);
                }


            },
            onSelectOrgEstablishConnection: function (oEvent) {
                if (oEvent.getParameters().selected) {
                    oView.getModel("oErrorModel").getData().orgEstablishConnectionSelectedE = "None";
                    oView.getModel("oErrorModel").refresh();
                }
            },
            onSelectOrgBusinessActivities: function (oEvent) {
                if (oEvent.getParameters().selected) {
                    oView.getModel("oErrorModel").getData().orgBusinessActivitiesisSelectedE = "None";
                    oView.getModel("oErrorModel").refresh();
                }
            },
            _fnValidateContactInfo: function () {
                var spaceRegex = /^\s+$/;
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                var vcontactList = oView.getModel("oLookUpModel").getData().tabledata;
                var oItems = oView.byId("contTable").getItems();
                $.each(vcontactList, function (index, row) {
                    var item = oView.byId("contTable").getItems()[index].getAggregation("cells");
                    if (row.email == null || row.email == "" || spaceRegex.test(row.email)) {
                        item[1].setValueState("Error");
                        item[1].setValueStateText(oi18n.getText("mandatoryEmail"));
                        iError = true;
                    } if (row.firstName == null || row.firstName == "" || spaceRegex.test(row.firstName)) {
                        item[2].setValueState("Error");
                        item[2].setValueStateText(oi18n.getText("mandatoryFName"));
                        iError = true;
                    }
                    if (row.lastName == null || row.lastName == "" || spaceRegex.test(row.lastName)) {
                        item[3].setValueState("Error");
                        item[3].setValueStateText(oi18n.getText("mandatoryLName"));
                        iError = true;
                    }
                    if (row.jobTitle == null || row.jobTitle == "" || spaceRegex.test(row.jobTitle)) {
                        item[4].setValueState("Error");
                        item[4].setValueStateText(oi18n.getText("mandatoryJobTitle"));
                        iError = true;
                    }
                    if (row.countryContactCode == null || row.countryContactCode == "" || spaceRegex.test(row.countryContactCode)) {
                        item[5].mAggregations.items[0].setValueState("Error")
                        item[5].mAggregations.items[0].setValueStateText(oi18n.getText("mandatoryCountryConatactCode"));
                        iError = true;

                    }
                    if (row.contact == null || row.contact == "" || spaceRegex.test(row.contact)) {
                        item[5].mAggregations.items[1].setValueState("Error")
                        item[5].mAggregations.items[1].setValueStateText(oi18n.getText("mandatoryContact"));

                        iError = true;

                    }
                    if (row.contact !== "" && Number(row.contact.replaceAll("-", "")) == 0) {
                        item[5].mAggregations.items[1].setValueState("Error")
                        item[5].mAggregations.items[1].setValueStateText(oi18n.getText("invalidContact"));

                        iError = true;

                    }
                });
                var aCompanyContact = oView.getModel("oLookUpModel").getData().tabledata;
                for (var i = 0; i < aCompanyContact.length; i++) {
                    if (aCompanyContact[i].email && aCompanyContact[i].email.length > 241) {
                        iError = true;
                    }
                    if (aCompanyContact[i].firstName && aCompanyContact[i].firstName.length > 30) {
                        iError = true;
                    }
                    if (aCompanyContact[i].lastName && aCompanyContact[i].lastName.length > 30) {
                        iError = true;
                    }
                    if (aCompanyContact[i].contact && aCompanyContact[i].contact.length > 30) {
                        iError = true;
                    }
                    if (aCompanyContact[i].extension && aCompanyContact[i].extension.length > 10) {
                        iError = true;
                    }
                }
                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("contactInfo").setValidated(false);
                } else {
                    oView.byId("contactInfo").setValidated(true);
                }

            },
            _fnValidateDraftBasicInfo: function () {
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contactName.length > 60) {


                    iError = true;
                }

                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.firstName.length > 30) {


                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.lastName.length > 30) {


                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.email.length > 241) {


                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.contact.length > 30) {


                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.mobile && oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.mobile.length > 30) {


                    iError = true;
                }

                if (oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.extension && oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.extension.length > 10) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.isAuthority === false) {
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName.length > 30) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName.length > 30) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.email && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.email.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.contact && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.contact.length > 30) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.mobile && oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.mobile.length > 10) {
                        iError = true;
                    }
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.isJabilMainContact === false) {
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.firstName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.lastName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.email.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.contact.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.extension.length > 10) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().surveyInfoDto.mainContact.mobile.length > 30) {
                        iError = true;
                    }
                }

                if (oView.getModel("oDataModel").getData().surveyInfoDto.altContact.firstName.length > 30) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.altContact.lastName.length > 30) {
                    iError = true;
                }
                // if (oView.getModel("oDataModel").getData().surveyInfoDto.altContact.email.length > 241) {
                //     iError = true;
                // }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.altContact.contact.length > 30) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address1 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address1.length > 60) {


                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address2 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address2.length > 40) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address3 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address3.length > 40) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address4 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address4.length > 40) {

                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address5 && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].address5.length > 40) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].district && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].district.length > 40) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].city && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].city.length > 40) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].postalCode) {
                    var postalCode = oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].postalCode;
                    var PostalCodeValidationData = oView.getModel("oLookUpModel").getData().PostalCodeValidation;
                    var postalCodeLength = PostalCodeValidationData ? PostalCodeValidationData.postalCodeLength : "";
                    var postalCodeRule = PostalCodeValidationData ? PostalCodeValidationData.postalCodeRule : "";
                    switch (postalCodeRule) {
                        case 1:
                            if (/\s/.test(postalCode) || postalCode.length > postalCodeLength) {

                                iError = true;
                            }
                            break;
                        case 2:
                            if (!(/^\d+$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                iError = true;
                            }
                            break;
                        case 3:
                            if (/\s/.test(postalCode) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                iError = true;
                            }
                            break;
                        case 4:
                            if (!(/^\d+$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                iError = true;
                            }
                            break;
                        case 5:
                            if (postalCode.length > postalCodeLength) {

                                iError = true;
                            }
                            break;
                        case 6:
                            if (!(/^[\d ]*$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                iError = true;
                            }
                            break;
                        case 7:
                            if (!(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                iError = true;
                            }
                            break;
                        case 8:
                            if (!(/^[\d ]*$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                iError = true;
                            }
                    }
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].faxNum && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].faxNum.length > 30) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].poBoxPostalCode && oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].poBoxPostalCode.length > 10) {
                    iError = true;
                }





                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("basicInfo").setValidated(false);
                } else {
                    oView.byId("basicInfo").setValidated(true);
                }
            },

            _fnValidateDraftBusinessPartnerInfo: function () {
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                var email = oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.email
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (email) {
                    if (!email.match(mailregex)) {
                        oView.getModel("oErrorModel").getData().ppocEmailE = "Error";
                        oView.getModel("oErrorModel").getData().ppocEmailM = oi18n.getText("invalidEmail");

                        iError = true;
                    } else if (!email.toUpperCase().includes("JABIL.COM")) {
                        oView.getModel("oErrorModel").getData().ppocEmailE = "Error";
                        oView.getModel("oErrorModel").getData().ppocEmailM = oi18n.getText("invalidEmail");

                        iError = true;
                    } else {
                        oView.getModel("oErrorModel").getData().ppocEmailE = "None";
                        oView.getModel("oErrorModel").getData().ppocEmailM = "";

                        iError = iError || false;
                    }
                }
                //if (oView.getModel("oUserModel").getData().isNew && oView.getModel("oDataModel").getData().bpInfoDto.siteHaveDunsNumber) {
                if (oView.getModel("oUserModel").getData().isNew) {
                    if (oView.getModel("oDataModel").getData().bpInfoDto.siteHaveDunsNumber) {
                        if (oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum && oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum.length != 9) {
                            oView.getModel("oErrorModel").getData().dunsRegistrationNumE = "Error";
                            oView.getModel("oErrorModel").getData().dunsRegistrationNumM = oi18n.getText("DunsNumberLengthValidation");
                            iError = true;
                        } else {
                            oView.getModel("oErrorModel").getData().dunsRegistrationNumE = "None";
                            oView.getModel("oErrorModel").getData().dunsRegistrationNumM = "";
                            // iError = false;
                        }
                    }
                }


                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.firstName.length > 30) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.lastName.length > 30) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.email.length > 241) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.contact.length > 30) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.extension.length > 10) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().bpInfoDto.pointOfContact.mobile.length > 30) {
                    iError = true;
                }
                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("businessPartnerInfo").setValidated(false);
                } else {
                    oView.byId("businessPartnerInfo").setValidated(true);
                }
            },

            _fnValidateDraftCompanyContactnfo: function () {
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                var aCompanyContact = oView.getModel("oLookUpModel").getData().tabledata;
                for (var i = 0; i < aCompanyContact.length; i++) {
                    if (aCompanyContact[i].email && aCompanyContact[i].email.length > 241) {
                        iError = true;
                    }
                    if (aCompanyContact[i].firstName && aCompanyContact[i].firstName.length > 30) {
                        iError = true;
                    }
                    if (aCompanyContact[i].lastName && aCompanyContact[i].lastName.length > 30) {
                        iError = true;
                    }
                    if (aCompanyContact[i].contact && aCompanyContact[i].contact.length > 30) {
                        iError = true;
                    }
                    if (aCompanyContact[i].extension && aCompanyContact[i].extension.length > 10) {
                        iError = true;
                    }
                }
                if (iError) {
                    oView.byId("contactInfo").setValidated(false);
                } else {
                    oView.byId("contactInfo").setValidated(true);
                }
            },

            _fnValidateDraftOwnershipInfo: function () {
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                if (oView.getModel("oUserModel").getData().isNew) {
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntitySDNList) {
                        var sdnList = oView.getModel("oDataModel").getData().ownerShipInfoDto.sdnlistContact;
                        for (var i = 0; i < sdnList.length; i++) {
                            if (sdnList[i].firstName && sdnList[i].firstName.length > 30) {
                                iError = true;
                            }
                            if (sdnList[i].lastName && sdnList[i].lastName.length > 30) {
                                iError = true;
                            }
                        }
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityRegInCISNK) {
                        var cisnkList = oView.getModel("oDataModel").getData().ownerShipInfoDto.regInCISNKContact;
                        for (var j = 0; j < cisnkList.length; j++) {
                            if (cisnkList[j].firstName && cisnkList[j].firstName.length > 30) {
                                iError = true;
                            }
                            if (cisnkList[j].lastName && cisnkList[j].lastName.length > 30) {
                                iError = true;
                            }
                        }
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovt) {
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.entityName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.firstName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.lastName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.email.length > 241) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.contact.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtContact.extension.length > 10) {
                            iError = true;
                        }
                    }
                    if (oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovtFamily) {
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.entityName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.firstName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.lastName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.email.length > 241) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.contact.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().ownerShipInfoDto.managedByGovtFamilyContact.extension.length > 10) {
                            iError = true;
                        }
                    }
                }
                // if(oView.getModel("oDataModel").getData().ownerShipInfoDto.sdnlistContact.firstName.length > 34) {
                //     oView.getModel("oErrorModel").getData().sdnFNameE = "Error";
                //     oView.getModel("oErrorModel").getData().sdnFNameM = oi18n.getText("maxLengthExceed");

                //     iError = true;
                // }
                // if(oView.getModel("oDataModel").getData().ownerShipInfoDto.regInCISNKContact.firstName.length > 34) {
                //     oView.getModel("oErrorModel").getData().cisnkFNameE = "Error";
                //     oView.getModel("oErrorModel").getData().cisnkFNameM = oi18n.getText("maxLengthExceed");

                //     iError = true;
                // }
                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("ownerShipInfo").setValidated(false);
                } else {
                    oView.byId("ownerShipInfo").setValidated(true);
                }
            },

            _fnValidateDraftCompanyInfo: function () {
                var iError = false;
                if (oView.getModel("companyInfoModel").getData().isOrderFromAddress) {
                    if (oView.getModel("companyInfoModel").getData().oName && oView.getModel("companyInfoModel").getData().oName.length > 35) {


                        iError = true;
                    }

                    if (oView.getModel("companyInfoModel").getData().oAddress1 && oView.getModel("companyInfoModel").getData().oAddress1.length > 60) {
                        iError = true;
                    }
                    if (oView.getModel("companyInfoModel").getData().oAddress2 && oView.getModel("companyInfoModel").getData().oAddress2.length > 40) {

                        iError = true;
                    }
                    if (oView.getModel("companyInfoModel").getData().oAddress3 && oView.getModel("companyInfoModel").getData().oAddress3.length > 40) {
                        iError = true;
                    }
                    if (oView.getModel("companyInfoModel").getData().oAddress4 && oView.getModel("companyInfoModel").getData().oAddress4.length > 40) {
                        iError = true;
                    }
                    if (oView.getModel("companyInfoModel").getData().oAddress5 && oView.getModel("companyInfoModel").getData().oAddress5.length > 40) {

                        iError = true;
                    }
                    if (oView.getModel("companyInfoModel").getData().oDist && oView.getModel("companyInfoModel").getData().oDist.length > 40) {

                        iError = true;
                    }
                    if (oView.getModel("companyInfoModel").getData().oPostalCode) {
                        var postalCode = oView.getModel("companyInfoModel").getData().oPostalCode;
                        var PostalCodeValidationData = oView.getModel("oLookUpModel").getData().PostalCodeValidationOFA;
                        var postalCodeLength = PostalCodeValidationData ? PostalCodeValidationData.postalCodeLength : "";
                        var postalCodeRule = PostalCodeValidationData ? PostalCodeValidationData.postalCodeRule : "";
                        switch (postalCodeRule) {
                            case 1:
                                if (/\s/.test(postalCode) || postalCode.length > postalCodeLength) {

                                    iError = true;
                                }
                                break;
                            case 2:
                                if (!(/^\d+$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                    iError = true;
                                }
                                break;
                            case 3:
                                if (/\s/.test(postalCode) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                    iError = true;
                                }
                                break;
                            case 4:
                                if (!(/^\d+$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                    iError = true;
                                }
                                break;
                            case 5:
                                if (postalCode.length > postalCodeLength) {

                                    iError = true;
                                }
                                break;
                            case 6:
                                if (!(/^[\d ]*$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                    iError = true;
                                }
                                break;
                            case 7:
                                if (!(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                    iError = true;
                                }
                                break;
                            case 8:
                                if (!(/^[\d ]*$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                    iError = true;
                                }
                        }

                    }
                    if (oView.getModel("companyInfoModel").getData().oCity && oView.getModel("companyInfoModel").getData().oCity.length > 40) {
                        iError = true;
                    }
                    if (oView.getModel("companyInfoModel").getData().oTeleNum && oView.getModel("companyInfoModel").getData().oTeleNum.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("companyInfoModel").getData().oFaxNum && oView.getModel("companyInfoModel").getData().oFaxNum.length > 30) {
                        iError = true;
                    }



                }

                if (oView.getModel("remitModel").getData().isRemitToAddress) {
                    if (oView.getModel("remitModel").getData().rName && oView.getModel("remitModel").getData().rName.length > 35) {


                        iError = true;
                    }

                    if (oView.getModel("remitModel").getData().rAddress1 && oView.getModel("remitModel").getData().rAddress1.length > 60) {
                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rAddress2 && oView.getModel("remitModel").getData().rAddress2.length > 40) {

                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rAddress3 && oView.getModel("remitModel").getData().rAddress3.length > 40) {
                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rAddress4 && oView.getModel("remitModel").getData().rAddress4.length > 40) {
                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rAddress5 && oView.getModel("remitModel").getData().rAddress5.length > 40) {

                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rDist && oView.getModel("remitModel").getData().rDist.length > 40) {

                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rPostalCode) {
                        var postalCode = oView.getModel("remitModel").getData().rPostalCode;
                        var PostalCodeValidationData = oView.getModel("oLookUpModel").getData().PostalCodeValidationRTA;
                        var postalCodeLength = PostalCodeValidationData ? PostalCodeValidationData.postalCodeLength : "";
                        var postalCodeRule = PostalCodeValidationData ? PostalCodeValidationData.postalCodeRule : "";
                        switch (postalCodeRule) {
                            case 1:
                                if (/\s/.test(postalCode) || postalCode.length > postalCodeLength) {

                                    iError = true;
                                }
                                break;
                            case 2:
                                if (!(/^\d+$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                    iError = true;
                                }
                                break;
                            case 3:
                                if (/\s/.test(postalCode) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                    iError = true;
                                }
                                break;
                            case 4:
                                if (!(/^\d+$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                    iError = true;
                                }
                                break;
                            case 5:
                                if (postalCode.length > postalCodeLength) {

                                    iError = true;
                                }
                                break;
                            case 6:
                                if (!(/^[\d ]*$/.test(postalCode)) || postalCode.length > postalCodeLength) {

                                    iError = true;
                                }
                                break;
                            case 7:
                                if (!(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                    iError = true;
                                }
                                break;
                            case 8:
                                if (!(/^[\d ]*$/.test(postalCode)) || !(postalCode.length === postalCodeLength) && postalCode.length > 0) {

                                    iError = true;
                                }
                        }

                    }
                    if (oView.getModel("remitModel").getData().rCity && oView.getModel("remitModel").getData().rCity.length > 40) {
                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rTeleNum && oView.getModel("remitModel").getData().rTeleNum.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rFaxNum && oView.getModel("remitModel").getData().rFaxNum.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rPostOffBox && oView.getModel("remitModel").getData().rPostOffBox.length > 40) {
                        iError = true;
                    }
                    if (oView.getModel("remitModel").getData().rPostOffZipCode && oView.getModel("remitModel").getData().rPostOffZipCode.length > 10) {
                        iError = true;
                    }


                }

                if (iError) {
                    oView.byId("companyInfo").setValidated(false);
                } else {
                    oView.byId("companyInfo").setValidated(true);
                }
            },


            _fnValidateDraftOperAndManu: function () {
                var iError = false;

                if (iError) {
                    oView.byId("prodAndServInfo").setValidated(false);
                } else {
                    oView.byId("prodAndServInfo").setValidated(true);
                }

            },

            _fnValidateDraftBankInfo: function () {
                var iError = false;
                if (this.emailValidResult) {
                    iError = true;
                }
                if (oView.getModel("oUserModel").getData().isNew) {
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName.length > 60) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAddress && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAddress.length > 35) {


                        iError = true;
                    }

                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].refBankDetails && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].refBankDetails.length > 20) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber.length > 15) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum.length > 18) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCode && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCode.length > 4) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].benefAccHolderName && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].benefAccHolderName.length > 60) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode.length > 11) {

                        iError = true;
                    }
                    if (this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.ibanLength && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].ibanNum.length !== parseInt(this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.ibanLength)) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCity && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCity.length > 35) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankState && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankState.length > 3) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry.length > 3) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch.length > 40) {


                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey.length > 2) {

                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].instructionKey && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].instructionKey.length > 3) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact1.firstName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact1.lastName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact1.email.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact1.contact.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact1.extension.length > 10) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact1.mobile.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.firstName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.lastName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.contact.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.email.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.extension.length > 10) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.financeContact2.mobile.length > 30) {
                        iError = true;
                    }
                }

                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("bankInfo").setValidated(false);
                } else {
                    oView.byId("bankInfo").setValidated(true);
                }

            },

            _fnValidateDraftShippingInfo: function () {
                var iError = false;
                if (oView.getModel("oDataModel").getData().shippingInfoDto.vendor && oView.getModel("oDataModel").getData().shippingInfoDto.vendor.length > 30) {
                    iError = true;
                }
                if (oView.getModel("oDataModel").getData().shippingInfoDto.deliveryLocation && oView.getModel("oDataModel").getData().shippingInfoDto.deliveryLocation.length > 20) {
                    iError = true;
                }
                if (oView.getModel("oUserModel").getData().isNew) {
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.incotermNamedPlace && oView.getModel("oDataModel").getData().shippingInfoDto.incotermNamedPlace.length > 28) {
                        iError = true;
                    }
                }
                else {
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.newincotermNamedPlace && oView.getModel("oDataModel").getData().shippingInfoDto.newincotermNamedPlace.length > 28) {
                        iError = true;
                    }
                }
                if (oView.getModel("oDataModel").getData().shippingInfoDto.isDeliver) {

                    if (this.emailValidResult) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepName.length > 35) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.supplierContactInLogistics.length > 40) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepEmail.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().shippingInfoDto.deliverRepContact.length > 30) {
                        iError = true;
                    }
                }
                oView.getModel("oErrorModel").refresh();

                if (iError) {
                    oView.byId("shippingInfo").setValidated(false);
                } else {
                    oView.byId("shippingInfo").setValidated(true);
                }

            },

            _fnValidateDraftComplianceInfo: function () {
                var iError = false;
                if (oView.getModel("oUserModel").getData().isNew) {
                    if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectations === false) {

                        if (this.emailValidResult) {
                            iError = true;
                        }
                        var email1 = oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.email
                        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                        if (email1) {
                            if (!email1.match(mailregex)) {
                                oView.getModel("oErrorModel").getData().cocE = "Error";
                                oView.getModel("oErrorModel").getData().cocM = oi18n.getText("invalidEmail");

                                iError = true;
                            } else if (email1.toUpperCase().includes("JABIL.COM")) {
                                oView.getModel("oErrorModel").getData().cocE = "Error";
                                oView.getModel("oErrorModel").getData().cocM = oi18n.getText("invalidEmail");

                                iError = true;
                            } else {
                                oView.getModel("oErrorModel").getData().cocE = "None";
                                oView.getModel("oErrorModel").getData().cocM = "";

                                iError = iError || false;
                            }
                        }


                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.firstName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.lastName.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.email.length > 241) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.contact.length > 30) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.commitedToExpectationsContact.extension.length > 10) {
                            iError = true;
                        }
                    }
                    if (oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmp) {
                        if (this.emailValidResult) {
                            iError = true;
                        }
                        var email2 = oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.email
                        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                        if (email2) {
                            if (!email2.match(mailregex)) {
                                oView.getModel("oErrorModel").getData().pEmpE = "Error";
                                oView.getModel("oErrorModel").getData().cocM = oi18n.getText("invalidEmail");

                                iError = true;
                            } else if (!email2.toUpperCase().includes("JABIL.COM")) {
                                oView.getModel("oErrorModel").getData().pEmpE = "Error";
                                oView.getModel("oErrorModel").getData().cocM = oi18n.getText("invalidEmail");

                                iError = true;
                            } else {
                                oView.getModel("oErrorModel").getData().pEmpE = "None";
                                oView.getModel("oErrorModel").getData().cocM = "";

                                iError = iError || false;
                            }
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.firstName.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.department.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmpContact.email.length > 241) {
                            iError = true;
                        }
                    }
                    if (oView.getModel("oDataModel").getData().comComplianceDto.companyContactWithPreviouseJabilEmp) {
                        if (oView.getModel("oDataModel").getData().comComplianceDto.employeeName && oView.getModel("oDataModel").getData().comComplianceDto.employeeName.length > 40) {
                            iError = true;
                        }
                        if (oView.getModel("oDataModel").getData().comComplianceDto.region && oView.getModel("oDataModel").getData().comComplianceDto.region.length > 20) {
                            iError = true;
                        }
                    }
                }
                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("cComplianceInfo").setValidated(false);
                } else {
                    oView.byId("cComplianceInfo").setValidated(true);
                }

            },

            _fnValidateDraftCyberSecurityInfo: function () {
                var iError = false;
                if (oView.getModel("oDataModel").getData().itCyberDto.orgConnectToJabilSystem || oView.getModel("oDataModel").getData().itCyberDto.orgMaintainProcessDataFromJabil) {
                    if (this.emailValidResult) {
                        iError = true;
                    }
                    var email = oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.email
                    var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                    if (email) {
                        if (!email.match(mailregex)) {
                            oView.getModel("oErrorModel").getData().cyberSurveyE = "Error";
                            oView.getModel("oErrorModel").getData().cyberSurveyM = oi18n.getText("invalidEmail");

                            iError = true;
                        } else if (email.toUpperCase().includes("JABIL.COM")) {
                            oView.getModel("oErrorModel").getData().cyberSurveyE = "Error";
                            oView.getModel("oErrorModel").getData().cyberSurveyM = oi18n.getText("invalidEmail");

                            iError = true;
                        } else {
                            oView.getModel("oErrorModel").getData().cyberSurveyE = "None";
                            oView.getModel("oErrorModel").getData().cyberSurveyM = "";

                            iError = iError || false;
                        }
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.firstName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.lastName.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.email.length > 241) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.contact.length > 30) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().itCyberDto.itcyberSecurityContact.extension.length > 10) {
                        iError = true;
                    }
                }
                oView.getModel("oErrorModel").refresh();
                if (iError) {
                    oView.byId("cyberSecInfo").setValidated(false);
                } else {
                    oView.byId("cyberSecInfo").setValidated(true);
                }
            },
            fnLiveInputValueChange: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    if (oEvent.getSource().getValue().length == oEvent.getSource().getMaxLength()) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("maxLengthExceed"));
                    } else if (oEvent.getSource().getValue()) {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }
                }
            },


            fnChangeTaxCountryLookUp: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    var sPath = oEvent.getSource().mBindingInfos.selectedKey.binding.oContext.sPath;
                    oView.getModel("oDataModel").setProperty(sPath + "/type", "");
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                var sIndex = oEvent.getParameter("id").split("-", 3)[2];
                var nIndex = parseInt(sIndex);
                var selectedCountryCode = oEvent.getSource().getSelectedKey();
                var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/taxType/" + selectedCountryCode;
                $.ajax({
                    url: loadTaxTypeUrl,
                    type: 'GET',
                    success: function (data) {
                        if (nIndex == 0) {
                            oView.getModel("oLookUpModel").setProperty("/taxType1", data);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 1) {
                            oView.getModel("oLookUpModel").setProperty("/taxType2", data);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 2) {
                            oView.getModel("oLookUpModel").setProperty("/taxType3", data);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 3) {
                            oView.getModel("oLookUpModel").setProperty("/taxType4", data);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 4) {
                            oView.getModel("oLookUpModel").setProperty("/taxType5", data);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 5) {
                            oView.getModel("oLookUpModel").setProperty("/taxType6", data);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 6) {
                            oView.getModel("oLookUpModel").setProperty("/taxType7", data);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 7) {
                            oView.getModel("oLookUpModel").setProperty("/taxType8", data);
                            oView.getModel("oLookUpModel").refresh();
                        } else {
                            sap.ui.m.MessageToast("Upto 8 Registrations are allowed");
                        }
                    },
                    async: false,
                    error: function (data) {

                    }
                });


            },

            fnChangeTaxTypeLookup: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                var taxArr = oView.getModel("oDataModel").getData().bpInfoDto.tax;
                if (taxArr.length != 0) {
                    var taxCountryArr = taxArr.map(function (item) { return item.country });
                    var isDuplicateCountry = taxCountryArr.some(function (item, idx) {
                        return taxCountryArr.indexOf(item) != idx
                    });
                    var taxTypeArr = taxArr.map(function (item) { return item.type });
                    var isDuplicateType = taxTypeArr.some(function (item, idx) {
                        return taxTypeArr.indexOf(item) != idx
                    });
                    if (isDuplicateCountry && isDuplicateType) {
                        this.emailValidResult = true;
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText("Tax Type for the corresponding Country has already been entered.");
                    } else {
                        this.emailValidResult = false;
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }
                }
                var sIndex = oEvent.getParameter("id").split("__")[1].split("-")[1];
                var nIndex = parseInt(sIndex);
                var selectedTaxType = oEvent.getSource().getSelectedKey();

                var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/tax/validations/" + selectedTaxType;
                $.ajax({
                    url: loadTaxTypeUrl,
                    type: 'GET',
                    success: function (data) {
                        var taxMaxLength = parseInt(data[0].taxNumLength);
                        var taxNumRule = parseInt(data[0].taxNumRule);

                        if (taxMaxLength == 0) {
                            var taxIDValidationData = {
                                "taxMaxLength": 20,
                                "taxNumRule": taxNumRule
                            }
                        } else {
                            var taxIDValidationData = {
                                "taxMaxLength": taxMaxLength,
                                "taxNumRule": taxNumRule
                            }
                        }



                        if (nIndex == 0) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation1", taxIDValidationData);
                            oView.getModel("oLookUpModel").refresh();
                            oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNum = "";
                            // oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[1].setProperty("value","");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[1].setProperty("valueState", "None");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[1].setProperty("valueStateText", "");

                        }
                        else if (nIndex == 1) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation2", taxIDValidationData);
                            oView.getModel("oLookUpModel").refresh();

                            oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNum = "";
                            // oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[2].setProperty("value","");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[2].setProperty("valueState", "None");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[2].setProperty("valueStateText", "");
                        }
                        else if (nIndex == 2) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation3", taxIDValidationData);
                            oView.getModel("oLookUpModel").refresh();
                            oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNum = "";

                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[3].setProperty("valueState", "None");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[3].setProperty("valueStateText", "");
                        }
                        else if (nIndex == 3) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation4", taxIDValidationData);
                            oView.getModel("oLookUpModel").refresh();
                            oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNum = "";

                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueState", "None");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueStateText", "");
                        }
                        else if (nIndex == 4) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation5", taxIDValidationData);
                            oView.getModel("oLookUpModel").refresh();
                            oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNum = "";

                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueState", "None");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueStateText", "");
                        }
                        else if (nIndex == 5) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation6", taxIDValidationData);
                            oView.getModel("oLookUpModel").refresh();
                            oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNum = "";

                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueState", "None");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueStateText", "");
                        }
                        else if (nIndex == 6) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation7", taxIDValidationData);
                            oView.getModel("oLookUpModel").refresh();
                            oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNum = "";

                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueState", "None");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueStateText", "");
                        }
                        else if (nIndex == 7) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation8", taxIDValidationData);
                            oView.getModel("oLookUpModel").refresh();
                            oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNum = "";

                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueState", "None");
                            oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[4].setProperty("valueStateText", "");
                        } else {
                            sap.ui.m.MessageToast("Only upto 8 Registrations are allowed");
                        }



                        // if(taxMaxLength == 0){
                        //     oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[1].setProperty("value","");
                        //     oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[1].setProperty("editable", false);


                        // } else {
                        //     oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[1].setProperty("editable", true);
                        //     oEvent.getSource().getParent().getParent().mAggregations.cells[2].mAggregations.items[1].setProperty("maxLength",taxMaxLength);

                        // }



                    },
                    async: false,
                    error: function (data) {


                    }
                });
                var loadTooltipUrl = "/comjabilsurveyform/plcm_portal_services/api/v1/tax-tooltip/findById/" + selectedTaxType;
                $.ajax({
                    url: loadTooltipUrl,
                    type: 'GET',
                    success: function (data) {
                        var vtoolTip = data ? data.toolTip : "";
                        if (nIndex == 0) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation1/tooltip", vtoolTip);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 1) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation2/tooltip", vtoolTip);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 2) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation3/tooltip", vtoolTip);
                            oView.getModel("oLookUpModel").refresh();
                        }
                        else if (nIndex == 3) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation4/tooltip", vtoolTip);
                            oView.getModel("oLookUpModel").refresh();

                        }
                        else if (nIndex == 4) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation5/tooltip", vtoolTip);
                            oView.getModel("oLookUpModel").refresh();

                        }
                        else if (nIndex == 5) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation6/tooltip", vtoolTip);
                            oView.getModel("oLookUpModel").refresh();

                        }
                        else if (nIndex == 6) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation7/tooltip", vtoolTip);
                            oView.getModel("oLookUpModel").refresh();

                        }
                        else if (nIndex == 7) {
                            oView.getModel("oLookUpModel").setProperty("/taxIDValidation8/tooltip", vtoolTip);
                            oView.getModel("oLookUpModel").refresh();

                        }
                    },
                    async: false,
                    error: function (data) {
                    }
                });
            },

            fnVerifyTaxID: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
                var taxID = oEvent.getSource().getValue();
                var sIndex = oEvent.getParameter("id").split("-", 3)[2];
                var nIndex = parseInt(sIndex) + 1;
                var indexStr = "/taxIDValidation" + nIndex;
                var taxIDValidationData = oView.getModel("oLookUpModel").getProperty(indexStr);
                var taxIDMaxLength = taxIDValidationData.taxMaxLength;
                var taxIDNumRule = taxIDValidationData.taxNumRule;
                switch (taxIDNumRule) {
                    case 1:
                        if (/\s/.test(taxID) || (taxID.includes("_") || taxID.length > taxIDMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID shouldn't exceed max length with no gaps");
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumE = "Error";
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumM = "ID shouldn't exceed max length with no gaps";
                        }
                        break;
                    case 2:
                        if (!(/^\d+$/.test(taxID)) || (taxID.includes("_") || taxID.length > taxIDMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers without spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 3:
                        if (/\s/.test(taxID) || (taxID.includes("_") || !(taxID.length === taxIDMaxLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + taxIDMaxLength + " characters in length without any spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 4:
                        if (!(/^\d+$/.test(taxID)) || (taxID.includes("_") || !(taxID.length === taxIDMaxLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + taxIDMaxLength + " numerical digits in length without any spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 5:
                        if (taxID.includes("_") || taxID.length > taxIDMaxLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Maximum length exceeded");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 6:
                        if (!(/^[\d ]*$/.test(taxID)) || (taxID.includes("_") || taxID.length > taxIDMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 7:
                        if (!(taxID.length === taxIDMaxLength) || (taxID.includes("_"))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + taxIDMaxLength + "characters in length");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 8:
                        if (!(/^[\d ]*$/.test(taxID)) || (taxID.includes("_") || !(taxID.length === taxIDMaxLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + taxIDMaxLength + "digits in length");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = true;
                        }
                }

            },

            fnVerifyPostalCode: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
                // var selectedCountry = oView.getModel("oDataModel").getData().surveyInfoDto.address[0].postal[0].countryCode;
                // if(selectedCountry == "USA"){
                //     var postalRegex = /^\d{5}[/-]\d{4}$/;
                //    if(postalRegex.test(oEvent.getSource().getValue())){

                //    }
                // }
                var postalCode = oEvent.getSource().getValue();

                var PostalCodeValidationData = oView.getModel("oLookUpModel").getData().PostalCodeValidation;
                var postalCodeLength = PostalCodeValidationData.postalCodeLength;
                var postalCodeRule = PostalCodeValidationData.postalCodeRule;
                switch (postalCodeRule) {
                    case 1:
                        if (/\s/.test(postalCode) || (postalCode.includes("_") || postalCode.length > postalCodeLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID shouldn't exceed max length with no gaps");
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumE = "Error";
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumM = "ID shouldn't exceed max length with no gaps";
                        }
                        break;
                    case 2:
                        if (!(/^\d+$/.test(postalCode)) || (postalCode.includes("_") || postalCode.length > postalCodeLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers without spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 3:
                        if (/\s/.test(postalCode) || (postalCode.includes("_") || !(postalCode.length === postalCodeLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + postalCodeLength + " characters in length without any spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 4:
                        if (!(/^\d+$/.test(postalCode)) || (postalCode.includes("_") || !(postalCode.length === postalCodeLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + postalCodeLength + " numerical digits in length without any spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 5:
                        if (postalCode.includes("_") || postalCode.length > postalCodeLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Maximum length exceeded");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 6:
                        if (!(/^[\d ]*$/.test(postalCode)) || (postalCode.includes("_") || postalCode.length > postalCodeLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 7:
                        if (!(postalCode.length === postalCodeLength) || (postalCode.includes("_"))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + postalCodeLength + "characters in length");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 8:
                        if (!(/^[\d ]*$/.test(postalCode)) || (postalCode.includes("_") || !(postalCode.length === postalCodeLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + postalCodeLength + "digits in length");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                }

            },

            fnVerifyPostalCodeOFA: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
                var postalCode = oEvent.getSource().getValue();

                var PostalCodeValidationData = oView.getModel("oLookUpModel").getData().PostalCodeValidationOFA;
                var postalCodeLength = PostalCodeValidationData.postalCodeLength;
                var postalCodeRule = PostalCodeValidationData.postalCodeRule;
                switch (postalCodeRule) {
                    case 1:
                        if (/\s/.test(postalCode) || (postalCode.includes("_") || postalCode.length > postalCodeLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID shouldn't exceed max length with no gaps");
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumE = "Error";
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumM = "ID shouldn't exceed max length with no gaps";
                        }
                        break;
                    case 2:
                        if (!(/^\d+$/.test(postalCode)) || (postalCode.includes("_") || postalCode.length > postalCodeLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers without spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                    case 3:
                        if (/\s/.test(postalCode) || (postalCode.includes("_") || !(postalCode.length === postalCodeLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + postalCodeLength + " characters in length without any spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 4:
                        if (!(/^\d+$/.test(postalCode)) || (postalCode.includes("_") || !(postalCode.length === postalCodeLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + postalCodeLength + " numerical digits in length without any spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 5:
                        if (postalCode.includes("_") || postalCode.length > postalCodeLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Maximum length exceeded");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 6:
                        if (!(/^[\d ]*$/.test(postalCode)) || (postalCode.includes("_") || postalCode.length > postalCodeLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 7:
                        if (!(postalCode.length === postalCodeLength) || (postalCode.includes("_"))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + postalCodeLength + "characters in length");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 8:
                        if (!(/^[\d ]*$/.test(postalCode)) || (postalCode.includes("_") || !(postalCode.length === postalCodeLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + postalCodeLength + "digits in length");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                }
            },

            fnVerifyPostalCodeRTA: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
                var postalCode = oEvent.getSource().getValue();

                var PostalCodeValidationData = oView.getModel("oLookUpModel").getData().PostalCodeValidationRTA;
                var postalCodeLength = PostalCodeValidationData.postalCodeLength;
                var postalCodeRule = PostalCodeValidationData.postalCodeRule;
                switch (postalCodeRule) {
                    case 1:
                        if (/\s/.test(postalCode) || (postalCode.includes("_") || postalCode.length > postalCodeLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID shouldn't exceed max length with no gaps");
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumE = "Error";
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumM = "ID shouldn't exceed max length with no gaps";
                        }
                        break;
                    case 2:
                        if (!(/^\d+$/.test(postalCode)) || (postalCode.includes("_") || postalCode.length > postalCodeLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers without spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                    case 3:
                        if (/\s/.test(postalCode) || (postalCode.includes("_") || !(postalCode.length === postalCodeLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + postalCodeLength + " characters in length without any spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 4:
                        if (!(/^\d+$/.test(postalCode)) || (postalCode.includes("_") || !(postalCode.length === postalCodeLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + postalCodeLength + " numerical digits in length without any spaces");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 5:
                        if (postalCode.includes("_") || postalCode.length > postalCodeLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Maximum length exceeded");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 6:
                        if (!(/^[\d ]*$/.test(postalCode)) || (postalCode.includes("_") || postalCode.length > postalCodeLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 7:
                        if (!(postalCode.length === postalCodeLength) || (postalCode.includes("_"))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + postalCodeLength + "characters in length");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                        break;
                    case 8:
                        if (!(/^[\d ]*$/.test(postalCode)) || (postalCode.includes("_") || !(postalCode.length === postalCodeLength))) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + postalCodeLength + "digits in length");
                            this.emailValidResult = true;
                        } else {
                            this.emailValidResult = false;
                        }
                }
            },

            fnVerifyBankNumber: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }

                var bankNum = oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber;
                var bankValidationData = oView.getModel("oVisibilityModel").getProperty("/bankValidation");
                var bankNumMaxLength = bankValidationData.bankNumLength;
                var bankNumRule = bankValidationData.bankNumRule;
                switch (bankNumRule) {
                    case 1:
                        if (/\s/.test(bankNum) || bankNum.length > bankNumMaxLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Shouldn't exceed max length with no gaps");
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumE = "Error";
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumM = "ID shouldn't exceed max length with no gaps";
                        }
                        break;
                    case 2:
                        if (!(/^\d+$/.test(bankNum)) || bankNum.length > bankNumMaxLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers without spaces");
                        }
                        break;
                    case 3:
                        if (/\s/.test(bankNum) || !(bankNum.length === bankNumMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + bankNumMaxLength + " characters in length without any spaces");
                        }
                        break;
                    case 4:
                        if (!(/^\d+$/.test(bankNum)) || !(bankNum.length === bankNumMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + bankNumMaxLength + " numerical digits in length without any spaces");
                        }
                        break;
                    case 5:
                        if (bankNum.length > bankNumMaxLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Maximum length exceeded");
                        }
                        break;
                    case 6:
                        if (!(/^[\d ]*$/.test(bankNum)) || bankNum.length > bankNumMaxLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers");
                        }
                        break;
                    case 7:
                        if (!(bankNum.length === bankNumMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + bankNumMaxLength + " characters in length");
                        }
                        break;
                    case 8:
                        if (!(/^[\d ]*$/.test(bankNum)) || !(bankNum.length === bankNumMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + bankNumMaxLength + "digits in length");
                        }
                }


            },

            fnInputBankAccNumber: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    if (oEvent.getSource().getValue().length == oEvent.getSource().getMaxLength()) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("maxLengthExceed"));
                    } else if (oEvent.getSource().getValue()) {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }
                }
                var firstDigit = "", secondDigit = "";
                var bankCountryDesc = formatter.fnFetchDescription(oView.getModel("oLookUpModel").getData().Country, oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry);
                if (bankCountryDesc == "Russian Fed.") {
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum) {
                        oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey = oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum.substring(2, 0);
                    }
                } else if (bankCountryDesc == "Brazil") {
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch.includes("-")) {
                        var bankBranch = oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch;
                        firstDigit = bankBranch.substring(bankBranch.indexOf("-") + 2, bankBranch.indexOf("-") + 1)
                    } else {
                        firstDigit = " ";
                    }
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum.includes("-")) {
                        var bankAccNum = oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum;
                        secondDigit = bankAccNum.substring(bankAccNum.indexOf("-") + 2, bankAccNum.indexOf("-") + 1)
                    }
                    if (!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch.includes("-") && !oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum.includes("-")) {
                        oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey = "";
                    }
                    else {
                        oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey = firstDigit + secondDigit;
                    }

                }

            },
            fnInputIban: function (oEvent) {
                if (oEvent.getSource().getValue()) {

                    if (oEvent.getSource().getMaxLength() && oEvent.getSource().getValue().length !== oEvent.getSource().getMaxLength()) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("exactLengthMessage") + " " + this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.ibanLength + " " + oi18n.getText("characters"));
                    } else if (oEvent.getSource().getValue()) {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }


                }
                if (this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.bankControlKeyLogic == "IBAN") {
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey = "";
                    var digitVal = this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.bankControlKeyDigitsLogic;
                    digitVal = digitVal.split(",");
                    var dlength = digitVal.length;
                    if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].ibanNum) {
                        for (var i = 0; i < dlength; i++) {
                            oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey = oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey + oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].ibanNum.charAt(digitVal[i] - 1);
                        }
                    }
                }
            },
            fnVerifyBankAccNum: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }

                var bankAccNum = oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum;
                var bankValidationData = oView.getModel("oVisibilityModel").getProperty("/bankValidation");
                var bankAccNumMaxLength = bankValidationData.bankAccNumLength;
                var bankAccNumRule = bankValidationData.bankAccNumRule;
                switch (bankAccNumRule) {
                    case 1:
                        if (/\s/.test(bankAccNum) || bankAccNum.length > bankAccNumMaxLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID shouldn't exceed max length with no gaps");
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumE = "Error";
                            // oView.getModel("oDataModel").getData().bpInfoDto.tax[nIndex].taxNumM = "ID shouldn't exceed max length with no gaps";
                        }
                        break;
                    case 2:
                        if (!(/^\d+$/.test(bankAccNum)) || bankAccNum.length > bankAccNumMaxLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers without spaces");
                        }
                        break;
                    case 3:
                        if (/\s/.test(bankAccNum) || !(bankAccNum.length === bankAccNumMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + bankAccNumMaxLength + " characters in length without any spaces");
                        }
                        break;
                    case 4:
                        if (!(/^\d+$/.test(bankAccNum)) || !(bankAccNum.length === bankAccNumMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of " + bankAccNumMaxLength + " numerical digits in length without any spaces");
                        }
                        break;
                    case 5:
                        if (bankAccNum.length > bankAccNumMaxLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Maximum length exceeded");
                        }
                        break;
                    case 6:
                        if (!(/^[\d ]*$/.test(bankAccNum)) || bankAccNum.length > bankAccNumMaxLength) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("Accepts only numbers");
                        }
                        break;
                    case 7:
                        if (!(bankAccNum.length === bankAccNumMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + bankAccNumMaxLength + "characters in length");
                        }
                        break;
                    case 8:
                        if (!(/^[\d ]*$/.test(bankAccNum)) || !(bankAccNum.length === bankAccNumMaxLength)) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText("ID must be of exactly " + bankAccNumMaxLength + "digits in length");
                        }
                }
            },

            fnLiveBankCountryChange: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }

                var selectedCountryCode = oEvent.getSource().getSelectedKey();
                var loadTaxTypeUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/validations/" + selectedCountryCode;
                $.ajax({
                    url: loadTaxTypeUrl,
                    type: 'GET',
                    success: function (data) {
                        var bankNumLength = parseInt(data[0].bankNumLength);
                        var bankAccNumLength = parseInt(data[0].bankAccNumLength);
                        var bankNumRule = parseInt(data[0].bankNumRule);
                        var bankAccNumRule = parseInt(data[0].bankAccNumRule);
                        var oBankValidation = {
                            "bankNumLength": bankNumLength,
                            "bankAccNumLength": bankAccNumLength,
                            "bankNumRule": bankNumRule,
                            "bankAccNumRule": bankAccNumRule
                        };
                        oView.getModel("oVisibilityModel").setProperty("/bankValidation", oBankValidation);
                        oEvent.getSource().getParent().getParent().mAggregations.content[9].mAggregations.items[1].setProperty("value", "");
                        oEvent.getSource().getParent().getParent().mAggregations.content[9].mAggregations.items[1].setProperty("valueState", "None");
                        oEvent.getSource().getParent().getParent().mAggregations.content[9].mAggregations.items[1].setProperty("valueStateText", "");
                        oEvent.getSource().getParent().getParent().mAggregations.content[7].mAggregations.items[1].setProperty("value", "");
                        oEvent.getSource().getParent().getParent().mAggregations.content[7].mAggregations.items[1].setProperty("valueState", "None");
                        oEvent.getSource().getParent().getParent().mAggregations.content[7].mAggregations.items[1].setProperty("valueStateText", "");
                        // if(bankNumLength == 0) {
                        //     oEvent.getSource().getParent().getParent().mAggregations.content[9].mAggregations.items[1].setProperty("value","");
                        //     oEvent.getSource().getParent().getParent().mAggregations.content[9].mAggregations.items[1].setProperty("editable",false);
                        // } else {
                        //     oEvent.getSource().getParent().getParent().mAggregations.content[9].mAggregations.items[1].setProperty("editable",true);
                        //     oEvent.getSource().getParent().getParent().mAggregations.content[9].mAggregations.items[1].setProperty("maxLength",bankNumLength);
                        // }

                        // if(bankAccNumLength == 0) {
                        //     oEvent.getSource().getParent().getParent().mAggregations.content[7].mAggregations.items[1].setProperty("value","");
                        //     oEvent.getSource().getParent().getParent().mAggregations.content[7].mAggregations.items[1].setProperty("editable",false);
                        // } else {
                        //     oEvent.getSource().getParent().getParent().mAggregations.content[7].mAggregations.items[1].setProperty("editable",true);
                        //     oEvent.getSource().getParent().getParent().mAggregations.content[7].mAggregations.items[1].setProperty("maxLength",bankAccNumLength);
                        // }

                        // oEvent.getSource().getParent().getParent().mAggregations.content[9].mAggregations.items[1].setProperty("maxLength",bankNumLength);
                        // oEvent.getSource().getParent().getParent().mAggregations.content[7].mAggregations.items[1].setProperty("maxLength",bankAccNumLength);


                    },
                    async: false,
                    error: function (data) {
                        var eMsg = data.responseText
                        MessageBox.show(eMsg, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });

                    }
                });
            },

            fnLiveValueChange: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                    oEvent.getSource().setSelectedKey(oEvent.getSource().getSelectedKey())
                    oView.getModel("oDataModel").refresh();
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }

            },
            fnValueChange: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
            },
            fnClearValueState: function (oEvent) {
                var selectedIndex = oEvent.getParameter("selectedIndex");
                if (selectedIndex !== -1) {
                    oEvent.getSource().setValueState("None");
                } if (selectedIndex == 1) {
                    var selPath = oEvent.getSource().getButtons()[0].getBindingPath("selected");
                    if (selPath) {
                        oView.getModel("oDataModel").setProperty(selPath, false);
                        oView.getModel("oDataModel").refresh(true);
                    }
                }
            },
            fnClearValueStateDiv: function (oEvent) {
                var selectedIndex = oEvent.getParameter("selectedIndex");
                if (selectedIndex !== -1) {
                    oEvent.getSource().setValueState("None");
                } if (selectedIndex == 1) {
                    var selPath = oEvent.getSource().getButtons()[0].getBindingPath("selected");
                    if (selPath) {
                        oView.getModel("companyInfoModel").setProperty(selPath, false);
                        oView.getModel("companyInfoModel").refresh(true);
                    }
                }
            },
            fnLiveEmailChange: function (oEvent) {
                var email = oEvent.getSource().getValue();
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (email) {
                    if (!email.match(mailregex)) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("invalidEmail"));
                    } else if (email.toUpperCase().includes("JABIL.COM")) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("invalidEmail"));
                    } else {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }
                }
            },
            fnLiveEmailJValid: function (oEvent) {
                var email = oEvent.getSource().getValue();
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                if (email) {
                    if (!email.match(mailregex)) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("invalidEmail"));
                    } else if (!(email.toUpperCase().includes("JABIL.COM") || email.toUpperCase().includes("NYPRO.COM") || email.toUpperCase().includes("JABILDAS.COM"))) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("invalidEmail"));
                    } else {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }
                }
            },

            fnLiveEmailNotJValid: function (oEvent) {
                var that = this;
                var email = oEvent.getSource().getValue();
                var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
                var sDeferred = $.Deferred();
                var aEvent = oEvent.getSource(), iError = false;
                if (email) {
                    if (!email.match(mailregex)) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("invalidEmail"));
                        that.emailValidResult = true;
                    } else if (email.match(mailregex) && email.toUpperCase() == "NA@JABIL.COM") {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                        that.emailValidResult = false;
                    }
                    // else if (email.match(mailregex)) {
                    //     var domain = email.substring(email.lastIndexOf("@") + 1);
                    //     var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/email/validations/" + domain.toLowerCase();

                    //     $.ajax({
                    //         url: sUrl,

                    //         type: 'GET',
                    //         success: function (data) {
                    //             if (JSON.parse(data).response == "Invalid") {

                    //                 aEvent.setValueState("Error");
                    //                 aEvent.setValueStateText(oi18n.getText("invalidEmail"));
                    //                 iError = true;
                    //                 that.emailValidResult = true;
                    //             } else {
                    //                 aEvent.setValueState("None");
                    //                 aEvent.setValueStateText("");
                    //                 iError = false;
                    //                 that.emailValidResult = false;
                    //             }


                    //         }, error: {}

                    //     })

                    // } // removed email validation, to be covered in Phase 2- Siva
                    //Date 20/09/2021
                    else if (email.match(mailregex)) {
                        if (oEvent.getSource().getValue().length == oEvent.getSource().getMaxLength()) {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValueStateText(oi18n.getText("maxLengthExceed"));
                            that.emailValidResult = true;
                        } else {
                            oEvent.getSource().setValueState("None");
                            oEvent.getSource().setValueStateText("");
                            that.emailValidResult = false;
                        }
                    }
                    else {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                        that.emailValidResult = false;
                    }


                }
            },

            fnLiveInputAlphaSpaceValueChange: function (oEvent) {
                var alphaRegex = /^[a-zA-Z ]*$/;
                var val = oEvent.getSource().getValue();
                if (oEvent.getSource().getValue()) {
                    if (val.length == oEvent.getSource().getMaxLength()) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("maxLengthExceed"));
                    } else if (!alphaRegex.test(oEvent.getSource().getValue())) {

                        var newval = val.substring(0, val.length - 1);
                        oEvent.getSource().setValue(newval);

                    }
                    else if (oEvent.getSource().getValue()) {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }
                }
            },

            fnLiveInputAlphaValueChange: function (oEvent) {
                var alphaRegex = /^[A-Za-z]*$/;
                var val = oEvent.getSource().getValue();
                if (oEvent.getSource().getValue()) {
                    if (val.length == oEvent.getSource().getMaxLength()) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("maxLengthExceed"));
                    } else if (!alphaRegex.test(oEvent.getSource().getValue())) {

                        var newval = val.substring(0, val.length - 1);
                        oEvent.getSource().setValue(newval);

                    }
                    else if (oEvent.getSource().getValue()) {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }
                }
            },

            fnLiveInputNumericValueChange: function (oEvent) {
                var numRegex = /^[0-9]*$/;
                var val = oEvent.getSource().getValue();
                if (val.length == oEvent.getSource().getMaxLength()) {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText(oi18n.getText("maxLengthExceed"));
                } else if (!numRegex.test(oEvent.getSource().getValue())) {
                    var newval = val.substring(0, val.length - 1);
                    oEvent.getSource().setValue(newval);

                }
                else if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
            },


            fnOperationServiceSel: function (oEvt) {
                var that = this;
                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                var listLen = this.getView().byId("operServList").getSelectedItems().length;
                var isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                if (listLen > 3) {
                    if (isDefaultLan) {
                        sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("oprServAlertMsg")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    } else {
                        sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.oprServAlertMsg + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("oprServAlertMsg")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    }

                }
                if (listLen <= 3) {
                    if (oView.getModel("oDataModel").getData().comProductsUiDto.isOperationServices) {
                        oView.getModel("oDataModel").getData().comProductsUiDto.operationServices = [];
                        var flag = false;

                        for (var j = 0; j < listLen; j++) {

                            var select1 = Number(oView.byId("operServList").getSelectedItems()[j].sId.split("-surveyform---VendorSurvey--operServList-")[1]);
                            oView.getModel("oDataModel").getData().comProductsUiDto.operationServices.push({ "value": oView.getModel("oLookUpModel").getData().operationServices[select1].value, "isSelected": true, "otherValue": oView.getModel("oLookUpModel").getData().operationServices[select1].otherValue });
                            if (oView.getModel("oDataModel").getData().comProductsUiDto.operationServices[j].value == "Other") {
                                flag = true;

                            }
                        }
                        if (flag) {
                            oView.getModel("oDataModel").getData().comProductsUiDto.isoperServOtherSelected = true;
                        } else {
                            oView.getModel("oDataModel").getData().comProductsUiDto.isoperServOtherSelected = false;
                        }

                    } else {
                        oView.getModel("oDataModel").getData().comProductsUiDto.operationServices = [];
                    }
                    oView.getModel("oDataModel").refresh();
                }
            },
            fnManufaturingProdSel: function (oEvt) {
                var that = this;
                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                var isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                var listLen = this.getView().byId("manServList").getSelectedItems().length;
                var flag = false;
                if (listLen > 3) {
                    if (isDefaultLan) {
                        sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("manServAlertMsg")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    } else {
                        sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.manServAlertMsg + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("manServAlertMsg")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    }
                }
                if (listLen <= 3) {
                    if (oView.getModel("oDataModel").getData().comProductsUiDto.isManufacturingProcessSupplies) {
                        oView.getModel("oDataModel").getData().comProductsUiDto.manufacturingProcessSupplies = [];
                        for (var i = 0; i < listLen; i++) {
                            var select1 = Number(oView.byId("manServList").getSelectedItems()[i].sId.split("-surveyform---VendorSurvey--manServList-")[1]);
                            oView.getModel("oDataModel").getData().comProductsUiDto.manufacturingProcessSupplies.push({ "value": oView.getModel("oLookUpModel").getData().manufacturingProcessSupplies[select1].value, "isSelected": true, "otherValue": oView.getModel("oLookUpModel").getData().manufacturingProcessSupplies[select1].otherValue });
                            if (oView.getModel("oDataModel").getData().comProductsUiDto.manufacturingProcessSupplies[i].value === "Other") {
                                flag = true;
                            }
                        }
                        if (flag) {
                            oView.getModel("oDataModel").getData().comProductsUiDto.isManProdOtherSelected = true;
                        } else {
                            oView.getModel("oDataModel").getData().comProductsUiDto.isManProdOtherSelected = false;
                        }

                    } else {
                        oView.getModel("oDataModel").getData().comProductsUiDto.manufacturingProcessSupplies = [];
                    }
                    oView.getModel("oLookUpModel").refresh();
                    oView.getModel("oDataModel").refresh();
                }
            },

            fnLivePaymentMethodChange: function (oEvent){
                 if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                    oEvent.getSource().setSelectedKey(oEvent.getSource().getSelectedKey())
                    oView.getModel("oDataModel").refresh();
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
                var apaymentMethod =formatter.fnFetchAdditionalDescription(oView.getModel("oLookUpModel").getData().PaymentMethod, oView.getModel("oDataModel").getData().shippingInfoDto.paymentMethod);
                if( apaymentMethod === 'Optional'){
                //  MessageBox.show(oi18n.getText("paymentMethodOptionalMsg"), {
                //                 icon: MessageBox.Icon.INFORMATION,
                //                 title: oi18n.getText("information"),
                //             });
                             oView.getModel("oErrorModel").getData().bankNameE = "None";
                oView.getModel("oErrorModel").getData().bankNameM = "";
                oView.getModel("oErrorModel").getData().bankAddrE = "None";
                oView.getModel("oErrorModel").getData().bankAddrM = "";
                oView.getModel("oErrorModel").getData().bankCityE = "None";
                oView.getModel("oErrorModel").getData().bankCityM = "";
                oView.getModel("oErrorModel").getData().bankAccNumE = "None";
                oView.getModel("oErrorModel").getData().bankAccNumM = "";
                oView.getModel("oErrorModel").getData().benifAccHNameE = "None";
                oView.getModel("oErrorModel").getData().benifAccHNameM = "";
                oView.getModel("oErrorModel").getData().bankSwiftE = "None";
                oView.getModel("oErrorModel").getData().bankSwiftM = "";
                oView.getModel("oErrorModel").getData().bankBranchE = "None";
                oView.getModel("oErrorModel").getData().bankBranchM = "";
                oView.getModel("oErrorModel").getData().bankRefE = "None";
                oView.getModel("oErrorModel").getData().bankRefM = "";
                oView.getModel("oErrorModel").getData().bankNumE = "None";
                oView.getModel("oErrorModel").getData().bankNumM = "";
                oView.getModel("oErrorModel").getData().ibanE = "None";
                oView.getModel("oErrorModel").getData().ibanM = "";
                oView.getModel("oErrorModel").getData().benifAccCurrE = "None";
                oView.getModel("oErrorModel").getData().benifAccCurrM = "";
                oView.getModel("oErrorModel").getData().bankCtrlKeyE = "None";
                oView.getModel("oErrorModel").getData().bankCtrlKeyM = "";
                oView.getModel("oErrorModel").getData().paymentCurrE = "None";
                oView.getModel("oErrorModel").getData().paymentCurrM = "";
                oView.getModel("oErrorModel").refresh();
                 var bankFields = this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation;
                    bankFields.bankName = false;
                    bankFields.bankBranch = false;
                    bankFields.bankStreet = false;
                    bankFields.bankCity = false;
                    bankFields.benificiaryAccountNumber = false;
                    bankFields.swiftCode = false;
                    bankFields.bankNumber = false;
                    bankFields.bankCountry = false;
                    bankFields.benificiaryAccHolderName = false;
                    bankFields.bankKey = false;
                    bankFields.benificiaryAccCurrency = false;
                    bankFields.instructionKey = false;
                    bankFields.bankControlKey = false;
                    bankFields.referenceDetails = false;
                    bankFields.iban = false;
                    bankFields.ibanLength = null;
                    bankFields.bankControlKeyLogic = null;
                    bankFields.bankControlKeyDigitsLogic = null;
                    bankFields.companyCodeCountry = "";
                    bankFields.bankKeyVal1 = "";
                    bankFields.bankKeyVal2 = "";
                    bankFields.bankKeyVal3 = "";
                    this.getOwnerComponent().getModel("oVisibilityModel").refresh();
                } else {
                     this.fnActivateBankScreen();
                }
            },

            fnLiveValueBankInput: function (oEvent) {
                var that = this;
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                    oEvent.getSource().setSelectedKey(oEvent.getSource().getSelectedKey())
                    oView.getModel("oDataModel").refresh();
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }

                oView.getModel("oErrorModel").getData().bankNameE = "None";
                oView.getModel("oErrorModel").getData().bankNameM = "";
                oView.getModel("oErrorModel").getData().bankAddrE = "None";
                oView.getModel("oErrorModel").getData().bankAddrM = "";
                oView.getModel("oErrorModel").getData().bankCityE = "None";
                oView.getModel("oErrorModel").getData().bankCityM = "";
                oView.getModel("oErrorModel").getData().bankAccNumE = "None";
                oView.getModel("oErrorModel").getData().bankAccNumM = "";
                oView.getModel("oErrorModel").getData().benifAccHNameE = "None";
                oView.getModel("oErrorModel").getData().benifAccHNameM = "";
                oView.getModel("oErrorModel").getData().bankSwiftE = "None";
                oView.getModel("oErrorModel").getData().bankSwiftM = "";
                oView.getModel("oErrorModel").getData().bankBranchE = "None";
                oView.getModel("oErrorModel").getData().bankBranchM = "";
                oView.getModel("oErrorModel").getData().bankRefE = "None";
                oView.getModel("oErrorModel").getData().bankRefM = "";
                oView.getModel("oErrorModel").getData().bankNumE = "None";
                oView.getModel("oErrorModel").getData().bankNumM = "";
                oView.getModel("oErrorModel").getData().ibanE = "None";
                oView.getModel("oErrorModel").getData().ibanM = "";
                oView.getModel("oErrorModel").getData().benifAccCurrE = "None";
                oView.getModel("oErrorModel").getData().benifAccCurrM = "";
                oView.getModel("oErrorModel").getData().bankCtrlKeyE = "None";
                oView.getModel("oErrorModel").getData().bankCtrlKeyM = "";
                oView.getModel("oErrorModel").getData().paymentCurrE = "None";
                oView.getModel("oErrorModel").getData().paymentCurrM = "";
                oView.getModel("oErrorModel").refresh();              
                this.fnActivateBankScreen();
            },

            fnActivateBankScreen: function () {
                var that = this;
                 var apaymentMethod =formatter.fnFetchAdditionalDescription(oView.getModel("oLookUpModel").getData().PaymentMethod, oView.getModel("oDataModel").getData().shippingInfoDto.paymentMethod);
                if(oView.getModel("oLookUpModel").getData().PaymentMethod && oView.getModel("oLookUpModel").getData().PaymentMethod !=="" && apaymentMethod === 'Optional'){
                     var bankFields = that.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation;
                    bankFields.bankName = false;
                    bankFields.bankBranch = false;
                    bankFields.bankStreet = false;
                    bankFields.bankCity = false;
                    bankFields.benificiaryAccountNumber = false;
                    bankFields.swiftCode = false;
                    bankFields.bankNumber = false;
                    bankFields.bankCountry = false;
                    bankFields.benificiaryAccHolderName = false;
                    bankFields.bankKey = false;
                    bankFields.benificiaryAccCurrency = false;
                    bankFields.instructionKey = false;
                    bankFields.bankControlKey = false;
                    bankFields.referenceDetails = false;
                    bankFields.iban = false;
                    bankFields.ibanLength = null;
                    bankFields.bankControlKeyLogic = null;
                    bankFields.bankControlKeyDigitsLogic = null;
                    bankFields.companyCodeCountry = "";
                    bankFields.bankKeyVal1 = "";
                    bankFields.bankKeyVal2 = "";
                    bankFields.bankKeyVal3 = "";
                    that.getOwnerComponent().getModel("oVisibilityModel").refresh();
                }
                else if (oView.getModel("oDataModel").getData().shippingInfoDto.paymentCurrency && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry) {
                    var requestData = {
                        "companyCodeCountry": oView.getModel("oDataModel").getData().shippingInfoDto.comCode,
                        "purchaseOrderCurrency": oView.getModel("oDataModel").getData().shippingInfoDto.paymentCurrency,
                        "supplierBankCountry": formatter.fnFetchDescription(oView.getModel("oLookUpModel").getData().Country, oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry)
                    }
                    var sUrl = "/comjabilsurveyform/plcm_portal_services/api/v1/bank/matrix";
                    var bModel = new JSONModel();

                    bModel.loadData(sUrl, JSON.stringify(requestData), true, "POST", false, true, {
                        "Content-Type": "application/json"
                    });
                    bModel.attachRequestCompleted(function (oEvent) {


                        if (oEvent.getParameter("success")) {
                            var bankFields = that.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation;
                            bankFields.bankName = oEvent.getSource().oData.bankName === "Mandatory" ? true : false;
                            bankFields.bankBranch = oEvent.getSource().oData.bankBranch === "Mandatory" ? true : false;
                            bankFields.bankStreet = oEvent.getSource().oData.bankStreet === "Mandatory" ? true : false;
                            bankFields.bankCity = oEvent.getSource().oData.bankCity === "Mandatory" ? true : false;
                            bankFields.benificiaryAccountNumber = oEvent.getSource().oData.benificiaryAccountNumber === "Mandatory" ? true : false;
                            bankFields.swiftCode = oEvent.getSource().oData.swiftCode === "Mandatory" ? true : false;
                            bankFields.bankNumber = oEvent.getSource().oData.bankNumber === "Mandatory" ? true : false;
                            bankFields.bankCountry = oEvent.getSource().oData.bankCountry === "Mandatory" ? true : false;
                            bankFields.benificiaryAccHolderName = oEvent.getSource().oData.benificiaryAccHolderName === "Mandatory" ? true : false;
                            bankFields.bankKey = oEvent.getSource().oData.bankKey === "Mandatory" ? true : false;
                            bankFields.benificiaryAccCurrency = oEvent.getSource().oData.benificiaryAccCurrency === "Mandatory" ? true : false;
                            bankFields.instructionKey = oEvent.getSource().oData.instructionKey === "Mandatory" ? true : false;
                            bankFields.bankControlKey = oEvent.getSource().oData.bankControlKey === "Mandatory" ? true : false;
                            bankFields.referenceDetails = oEvent.getSource().oData.referenceDetails === "Mandatory" ? true : false;
                            bankFields.iban = oEvent.getSource().oData.iban === "Mandatory" ? true : false;
                            bankFields.ibanLength = parseInt(oEvent.getSource().oData.ibanLength);
                            bankFields.bankControlKeyLogic = oEvent.getSource().oData.bankControlKeyLogic;
                            bankFields.bankControlKeyDigitsLogic = oEvent.getSource().oData.bankControlKeyDigitsLogic;
                            bankFields.companyCodeCountry = oEvent.getSource().oData.companyCodeCountry;
                            bankFields.bankKeyVal1 = oEvent.getSource().oData.bankKeyVal1;
                            bankFields.bankKeyVal2 = oEvent.getSource().oData.bankKeyVal2;
                            bankFields.bankKeyVal3 = oEvent.getSource().oData.bankKeyVal3;
                            that.getOwnerComponent().getModel("oVisibilityModel").refresh();

                        }
                        else {

                        }
                    });
                }
                // else {
                //     var bankFields = that.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation;
                //     bankFields.bankName = false;
                //     bankFields.bankBranch = false;
                //     bankFields.bankStreet = false;
                //     bankFields.bankCity = false;
                //     bankFields.benificiaryAccountNumber = false;
                //     bankFields.swiftCode = false;
                //     bankFields.bankNumber = false;
                //     bankFields.bankCountry = false;
                //     bankFields.benificiaryAccHolderName = false;
                //     bankFields.bankKey = false;
                //     bankFields.benificiaryAccCurrency = false;
                //     bankFields.instructionKey = false;
                //     bankFields.bankControlKey = false;
                //     bankFields.referenceDetails = false;
                //     bankFields.iban = false;
                //     bankFields.ibanLength = null;
                //     bankFields.bankControlKeyLogic = null;
                //     bankFields.bankControlKeyDigitsLogic = null;
                //     bankFields.companyCodeCountry = "";
                //     bankFields.bankKeyVal1 = "";
                //     bankFields.bankKeyVal2 = "";
                //     bankFields.bankKeyVal3 = "";
                //     that.getOwnerComponent().getModel("oVisibilityModel").refresh();
                // }
            },
            // @ts-ignore
            //File Upload function with Date Input
            fnOnFileUpload1: function (oEvt) {
                var that = this;

                var fileUploadId = oEvt.oSource.sId.split("VendorSurvey--")[1];


                if (!that.oPopup) {
                    that.oPopup = sap.ui.xmlfragment(
                        "com.jabil.surveyform.fragments.date", that);
                    oView.addDependent(that.oPopup);
                }
                that.oPopup.open();
                that.oPopup.attachAfterClose(function (oEvt) {
                    var expiryDate = this.oPopup.getContent().getAggregation("content")[0].getItems()[0].getAggregation("items")[1].getValue();
                    var reminderDays = Number(this.oPopup.getContent().getAggregation("content")[0].getItems()[1].getAggregation("items")[1].getValue());
                    // @ts-ignore
                    if (expiryDate && reminderDays) {
                        var oFormData = new FormData(),
                            fileUpload = oView.byId(fileUploadId),
                            domRef = fileUpload.getFocusDomRef(),
                            // @ts-ignore
                            file = domRef.files[0],
                            secName = that.oWizard.getCurrentStep().split("---VendorSurvey--")[1];
                        // if (secName == "bankInfo" && fileUploadId == "fileUploader_BIA") {
                        //     secName = "bankIntermediateInfo";
                        // }
                        jQuery.sap.domById(fileUpload.getId() + "-fu").setAttribute("type", "file");
                        // @ts-ignore
                        oFormData.append("file", jQuery.sap.domById(fileUpload.getId() + "-fu").files[0]);
                        oFormData.append("name", file.name);
                        oFormData.append("folderName", oView.getModel("oUserModel").getData().caseId);
                        oFormData.append("requestId", oView.getModel("oUserModel").getData().caseId);
                        oFormData.append("docInSection", secName);
                        oFormData.append("fileExt", file.name.split(".")[1]);
                        oFormData.append("type", "application/octet-stream");
                        oFormData.append("expiryDate", expiryDate);
                        oFormData.append("reminderDays", reminderDays);
                        oFormData.append("overwriteFlag", false);

                        if (oView.getModel("oUserModel")) {
                            oFormData.append("addedBy", oView.getModel("oUserModel").getData().user.givenName);
                        }
                        var oAttachData = {

                            "fileExt": file.name.split(".")[1],

                            "name": file.name,
                        };

                        var _arrayTitle = that._fnGetUploaderId(fileUploadId);

                        var sUrl = "/comjabilsurveyform/plcm_portal_services/document/upload";
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

                                that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).push(oAttachData);
                                that.getView().getModel("oAttachmentList").refresh(true);


                            },
                            error: function (data) {
                                var eMsg = data.responseText;
                                if (data.status == 406) {
                                    var eMsg = "The file already exists. Do you want to overwrite it?"
                                    MessageBox.confirm(eMsg, {
                                        icon: MessageBox.Icon.Confirmation,
                                        title: "Confirmation",
                                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                                        emphasizedAction: MessageBox.Action.YES,
                                        onClose: function (oAction) {
                                            if (oAction == "YES") {
                                                oFormData.set("overwriteFlag", true);
                                                //  oFormData.append("deletedBy", oView.getModel("oUserModel").getData().user.givenName);
                                                var index = that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).findIndex(function (docId) { return docId.name == file.name });
                                                that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).splice(index, 1);
                                                that.getView().getModel("oAttachmentList").refresh(true);
                                                var sUrl = "/comjabilsurveyform/plcm_portal_services/document/upload";
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

                                                        that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).push(oAttachData);
                                                        that.getView().getModel("oAttachmentList").refresh(true);


                                                    }, error: function (data) {
                                                        var eMsg = data.responseText
                                                        MessageBox.show(eMsg, {
                                                            icon: sap.m.MessageBox.Icon.ERROR,
                                                            title: oi18n.getText("error")
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                } else {

                                    MessageBox.show(eMsg, {
                                        icon: sap.m.MessageBox.Icon.ERROR,
                                        title: oi18n.getText("error")
                                    });
                                }

                            }
                        });
                        this.oPopup.getContent().getAggregation("content")[0].getItems()[0].getAggregation("items")[1].setValue("");
                        this.oPopup.getContent().getAggregation("content")[0].getItems()[1].getAggregation("items")[1].setValue("");
                    } else {
                        this.oPopup.getContent().getAggregation("content")[0].getItems()[0].getAggregation("items")[1].setValue("");
                        this.oPopup.getContent().getAggregation("content")[0].getItems()[1].getAggregation("items")[1].setValue("");
                    }
                });
            },
            fnOnFileUpload: function (oEvt) {
                var that = this;
                var fileUploadId = oEvt.oSource.sId.split("VendorSurvey--")[1];
                var oFormData = new FormData(),
                    fileUpload = oView.byId(fileUploadId),
                    domRef = fileUpload.getFocusDomRef(),
                    // @ts-ignore
                    file = domRef.files[0],
                    secName = that.oWizard.getCurrentStep().split("---VendorSurvey--")[1];
                // if (secName == "bankInfo" && fileUploadId == "fileUploader_BIA") {
                //     secName = "bankIntermediateInfo";
                // }
                if(file.name.length > 60){
                        var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                        var isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                        if (isDefaultLan) {
                            sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("docFileNameExtendedMessage")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        } else {
                            sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.docFileNameExtendedMessage + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("docFileNameExtendedMessage")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        } 
                }else{
                jQuery.sap.domById(fileUpload.getId() + "-fu").setAttribute("type", "file");
                // @ts-ignore
                oFormData.append("file", jQuery.sap.domById(fileUpload.getId() + "-fu").files[0]);
                oFormData.append("name", file.name);
                oFormData.append("folderName", oView.getModel("oUserModel").getData().caseId);
                oFormData.append("requestId", oView.getModel("oUserModel").getData().caseId);
                oFormData.append("docInSection", secName);
                oFormData.append("fileExt", file.name.split(".")[1]);
                oFormData.append("type", "application/octet-stream");
                // oFormData.append("expiryDate", expiryDate);
                // oFormData.append("reminderDays", reminderDays);
                oFormData.append("overwriteFlag", false);

                if (oView.getModel("oUserModel")) {
                    oFormData.append("addedBy", oView.getModel("oUserModel").getData().user.givenName);
                }
                var oAttachData = {

                    "fileExt": file.name.split(".")[1],

                    "name": file.name,
                };

                var _arrayTitle = that._fnGetUploaderId(fileUploadId);
                oBusyDialogFile.open();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/document/upload";
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

                        that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).push(oAttachData);
                        that.getView().getModel("oAttachmentList").refresh(true);

                        oBusyDialogFile.close();
                    },
                    error: function (data) {
                        var eMsg = data.responseText;
                        if (data.status == 406) {
                            var eMsg = "The file already exists. Do you want to overwrite it?"
                            MessageBox.confirm(eMsg, {
                                icon: MessageBox.Icon.Confirmation,
                                title: "Confirmation",
                                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                                emphasizedAction: MessageBox.Action.YES,
                                onClose: function (oAction) {
                                    if (oAction == "YES") {
                                        oFormData.set("overwriteFlag", true);
                                        //  oFormData.append("deletedBy", oView.getModel("oUserModel").getData().user.givenName);
                                        var index = that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).findIndex(function (docId) { return docId.name == file.name });
                                        that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).splice(index, 1);
                                        that.getView().getModel("oAttachmentList").refresh(true);
                                        var sUrl = "/comjabilsurveyform/plcm_portal_services/document/upload";
                                        oBusyDialogFile.open();
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

                                                that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).push(oAttachData);
                                                that.getView().getModel("oAttachmentList").refresh(true);
                                                oBusyDialogFile.close();

                                            }, error: function (data) {
                                                var eMsg = data.responseText
                                                MessageBox.show(eMsg, {
                                                    icon: sap.m.MessageBox.Icon.ERROR,
                                                    title: oi18n.getText("error")
                                                });
                                                oBusyDialogFile.close();
                                            }
                                        });
                                    }
                                }
                            });
                        } else {

                            MessageBox.show(eMsg, {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n.getText("error")
                            });
                        }

                    }
                });
                }

            },
            // @ts-ignore
            fnOnCancelAttachment: function (oEvt) {
                this.getView().getModel("oAttachmentList").refresh(true);
                var that = this, _arrayTitle = oEvt.oSource.oParent.oParent.oParent.oParent.mBindingInfos.items.path.split("/0/")[1];
                var name = oEvt.getSource().getParent().oParent.getItems()[0].mAggregations.items[1].mAggregations.items[0].getProperty("text");
                // @ts-ignore
                var dmsDocId = this.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).filter(function (docId) {
                    return docId.name == name
                })[0].dmsDocumentId;

                if (oView.getModel("oUserModel")) {
                    var deletedBy = oView.getModel("oUserModel").getData().user.givenName;
                }
                // var _arrayTitle= this._fnGetUploaderId(fileUploadId);
                var sUrl = "/comjabilsurveyform/plcm_portal_services/document/deleteByDmsDocumentId/" + dmsDocId + "/" + deletedBy;
                $.ajax({
                    url: sUrl,
                    contentType: false,
                    accept: '*/*',
                    type: 'DELETE',
                    processData: false,
                    success: function () {
                        var index = that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).findIndex(function (docId) { return docId.name == name });
                        that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).splice(index, 1);
                        that.getView().getModel("oAttachmentList").refresh(true);
                    },
                    error: function (data) {
                        var eMsg = data.responseText
                        MessageBox.show(eMsg, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });

                    }
                });
            },
            fnOnDownlAttachment: function (oEvt) {
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
                            title: oi18n.getText("error")
                        });

                    }
                });

            },
            _fnGetUploaderId: function (fileUploadId) {

                if (fileUploadId == "fileUploader") {
                    return "bPDArray";
                } else if (fileUploadId == "fileUploader_OW") {
                    return "ownerDArray";
                }
                else if (fileUploadId == "fileUploader_CO") {
                    return "compDArray";
                }
                else if (fileUploadId == "fileUploader_BA") {
                    return "bankDArray";
                }
                // else if (fileUploadId == "fileUploader_BIA") {
                //     return "bankINDArray";
                // }
                else if (fileUploadId == "fileUploader_SH") {
                    return "shippingDArray";
                }
                else if (fileUploadId == "fileUploader_PR") {
                    return "compProdDArray";
                }
                else if (fileUploadId == "fileUploader_CCO") {
                    return "compContDArray";
                }
                else if (fileUploadId == "fileUploader_FI") {
                    return "compFinDArray";
                }
                else if (fileUploadId == "fileUploader_CC") {
                    return "compComplDArray";
                }
                else if (fileUploadId == "fileUploader_CY") {
                    return "compSecuDArray";
                }
                return "";
            },
            fnHandleOwnshpType: function (oEvent) {
                var type = oEvent.getParameters().value;
                if (type == "Other") {
                    oEvent.getParameters().value = "Other - Enter here";
                }
            },
            assignNextStepByStep: function (event) {
                if (!oView.getModel("oUserModel").getData().isNew) {
                    this.getView().byId("businessPartnerInfo").setNextStep("container-surveyform---VendorSurvey--ownerShipInfo");
                    this.getView().byId("shippingInfo").setNextStep("container-surveyform---VendorSurvey--cComplianceInfo");
                    this.getView().byId("cComplianceInfo").setNextStep("container-surveyform---VendorSurvey--previewRegForm");
                } else {
                    this.getView().byId("businessPartnerInfo").setNextStep("container-surveyform---VendorSurvey--contactInfo");
                    this.getView().byId("shippingInfo").setNextStep("container-surveyform---VendorSurvey--prodAndServInfo");
                    this.getView().byId("cComplianceInfo").setNextStep("container-surveyform---VendorSurvey--cyberSecInfo");
                }
            },
            // @ts-ignore
            nextStep: function (event) {
                // @ts-ignore      
                this.oWizard = this.getView().byId("surveyWizard");
                var currentStepId = this.oWizard.getCurrentStep().split("container-surveyform---VendorSurvey--")[1];
                var isNew = oView.getModel("oUserModel").getData().isNew;
                if (!oView.getModel("oEnableMdl").getData().nextBtnExtensionDisplayVsb) {
                    if (currentStepId == "basicInfo") {
                        this._fnValidateBasicInfo();
                        
                        oView.byId('businessPartnerInfo').addEventDelegate({
                            onAfterRendering: function(){
                                if(isNew){
                                    oView.byId("site").focus();
                                } else if(!isNew) {
                                    $("input:text:visible:enabled:first").focus(); 
                                }
                                
                            }
                        });
                    }
                    else if (currentStepId == "businessPartnerInfo") {
                        this._fnValidateBusinessPartner();
                        
                        if(!isNew){
                            var isDunsRegNum = oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum;
                            oView.byId('ownerShipInfo').addEventDelegate({
                                onAfterRendering: function(){
                                    if(!isDunsRegNum || isDunsRegNum === 'NODUNS'){
                                        oView.byId("ownSite").focus();
                                    }
                                    else {
                                        oView.byId("ownershipTypeId").focus();
                                    }  
                                    
                                }
                            });
                        }

                    }
                    else if (currentStepId == "contactInfo") {
                        this._fnValidateContactInfo();
                        if(isNew){
                            var isDunsRegNum = oView.getModel("oDataModel").getData().bpInfoDto.dunsRegistrationNum;
                            oView.byId('ownerShipInfo').addEventDelegate({
                                onAfterRendering: function(){
                                    if(!isDunsRegNum || isDunsRegNum === 'NODUNS'){
                                        oView.byId("ownSite").focus();
                                    }
                                    else {
                                        oView.byId("ownershipTypeId").focus();
                                    }  
                                }
                            });
                        }
                        
                    }
                    else if (currentStepId == "ownerShipInfo") {
                        this._fnValidateOwnerInfo();
                        oView.byId('companyInfo').addEventDelegate({
                            onAfterRendering: function(){
                                oView.byId("orderfromAddrCheckBoxId").focus();
                            }
                        });
                    }
                    else if (currentStepId == "companyInfo") {
                        this._fnValidateCompanyInfo();
                        oView.byId('bankInfo').addEventDelegate({
                            onAfterRendering: function(){
                                if(isNew) {
                                    oView.byId("PaymentTermCreateId").focus();
                                } else {
                                    oView.byId("PaymentTermExtendId").focus();
                                }
                                
                            }
                        });


                    }
                    
                    else if (currentStepId == "bankInfo") {
                        this._fnValidateBankInfo();
                        oView.byId('shippingInfo').addEventDelegate({
                            onAfterRendering: function(){
                                $("input:text:visible:first").focus(); 
                            }
                        });

                    }
                    else if (currentStepId == "shippingInfo") {
                        this._fnValidateShippingInfo();
                        if(isNew){
                            oView.byId('prodAndServInfo').addEventDelegate({
                                onAfterRendering: function(){
                                    oView.byId("OperServId").focus();
                                }
                            });
                        } else {
                            oView.byId('cComplianceInfo').addEventDelegate({
                                onAfterRendering: function(){
                                    oView.byId("agreement").focus();
                                }
                            });
                        }
                        
                    }
                    else if (currentStepId == "prodAndServInfo") {
                        this._fnValidateComProductServiceInfo();
                        
                        oView.byId('cComplianceInfo').addEventDelegate({
                            onAfterRendering: function(){
                                oView.byId("srmMeet").focus();
                            }
                        });
                    }
                    else if (currentStepId == "cComplianceInfo") {
                        this._fnValidateCompanyCompliance();
                        if(isNew) {
                            oView.byId('cyberSecInfo').addEventDelegate({
                                onAfterRendering: function(){
                                    oView.byId("securitySys").focus();
                                }
                            });
                        } else {
                            oView.addEventDelegate({
                                onAfterRendering: function(){
                                    oView.byId("formAcceptanceId").focus();
                                }
                            });
                        }
                        
                    }
                    else if (currentStepId == "cyberSecInfo") {

                        this._fnValidateCyberSec();


                    }
                    else if (currentStepId == "previewRegForm") {


                    }


                    // if (this.getView().byId(this.getView().byId("surveyWizard").getSteps()[this.oWizard._getProgressNavigator()._iCurrentStep - 1].sId).getValidated()) {
                    if (this.getView().byId(this.getView().byId("surveyWizard").getCurrentStep()).getValidated()) {
                        this.getView().byId("surveyWizard")._oScroller.scrollTo(0, 0);

                        oView.getModel("oEnableMdl").getData().BackBtnEnb = true;
                        oView.getModel("oEnableMdl").refresh();
                        this.getView().byId("surveyWizard").setCurrentStep(this.getView().byId("surveyWizard").getCurrentStep()).nextStep();
                        // this.getView().byId("surveyWizard").setCurrentStep(this.getView().byId("surveyWizard").getSteps()[this.oWizard._getProgressNavigator()._iCurrentStep - 1].sId).nextStep();
                        //}
                    } else if (currentStepId !== "companyInfo" && currentStepId !== "prodAndServInfo" && currentStepId !== "cyberSecInfo") {
                        var that = this;
                        var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                        var isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                        if (isDefaultLan) {
                            sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("validationDefaultMsg")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        } else {
                            sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.validationDefaultMsg + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("validationDefaultMsg")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        }
                    }
                } else {
                    this.getView().byId("surveyWizard")._oScroller.scrollTo(0, 0);

                    oView.getModel("oEnableMdl").getData().BackBtnEnb = true;
                    oView.getModel("oEnableMdl").refresh();
                    this.getView().byId("surveyWizard").setCurrentStep(this.getView().byId("surveyWizard").getCurrentStep()).nextStep();
                    // this.getView().byId("surveyWizard").setCurrentStep(this.getView().byId("surveyWizard").getSteps()[this.oWizard._getProgressNavigator()._iCurrentStep - 1].sId).nextStep();

                }


            },

            nextStepDisplayOnly: function () {
                this.oWizard = this.getView().byId("surveyWizard");
                this.getView().byId("surveyWizard")._oScroller.scrollTo(0, 0);

                oView.getModel("oEnableMdl").getData().BackBtnEnb = true;
                oView.getModel("oEnableMdl").refresh();
                this.getView().byId("surveyWizard").setCurrentStep(this.getView().byId("surveyWizard").getCurrentStep()).nextStep();
                // this.getView().byId("surveyWizard").setCurrentStep(this.getView().byId("surveyWizard").getSteps()[this.oWizard._getProgressNavigator()._iCurrentStep - 1].sId).nextStep();
            },
            // @ts-ignore
            previousStep: function (event) {
                // @ts-ignore
                //for disabling back button for 1st widget in display only mode
                if (vAppName.split(":")[0] == "Display" && this.getView().byId("surveyWizard")._getProgressNavigator()._iCurrentStep == 2) {
                    oView.getModel("oEnableMdl").getData().BackBtnEnb = false;
                    oView.getModel("oEnableMdl").refresh();
                }
                if(this.getView().byId("surveyWizard")._getProgressNavigator()._iCurrentStep == 2) {
                    oView.getModel("oEnableMdl").getData().BackBtnEnb = false;
                    oView.getModel("oEnableMdl").refresh();
                }
                if (this.getView().byId("surveyWizard")._getProgressNavigator()._iCurrentStep == 1) {
                    // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    // oRouter.navTo("Welcome", {
                    //     contextPath: oView.getModel("oUserModel").getData().taskId,
                    // });
                } else {
                    this.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStep = false;
                    this.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepAccept = false;
                    this.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepSave = false;
                    this.getOwnerComponent().getModel("oVisibilityModel").refresh(true);
                    this.getView().byId("surveyWizard").previousStep();
                }

            },

            onActivateBPInfo: function (event) {
                var bpTaxDetails = oView.getModel("oDataModel").getData().bpInfoDto.tax;
                $.each(bpTaxDetails, function (index, row) {
                    if (row.country && row.type) {
                        var tooltipUrl = "/comjabilsurveyform/plcm_portal_services/api/v1/tax-tooltip/findById/" + row.type;
                        $.ajax({
                            url: tooltipUrl,
                            type: 'GET',
                            success: function (data) {
                                var vtoolTip = data ? data.toolTip : "";

                                oView.getModel("oLookUpModel").setProperty("/taxIDValidation" + (index + 1) + "/tooltip", vtoolTip);
                                oView.getModel("oLookUpModel").refresh();

                            },
                            async: false,
                            error: function (data) {
                            }
                        });

                    }
                });

            },
            onActivatePreview: function (event) {
                if (this.getView().byId("surveyWizard")._aStepPath.length == 11 || (this.getView().byId("surveyWizard")._aStepPath.length == 8 && this.getView().byId("surveyWizard")._getProgressNavigator().getStepCount() == 8)) {
                    this.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStep = true;
                    this.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepAccept = true;
                    this.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepSave = true;
                }
                this.getOwnerComponent().getModel("oVisibilityModel").refresh(true);
            },
            onCompletePreview: function (event) {

                this.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStep = false;
                this.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepAccept = false;
                this.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepSave = false;


                this.getOwnerComponent().getModel("oVisibilityModel").refresh(true);
            },
            addOwnbyInd1: function () {
                // @ts-ignore
                this.idOwnerShipInfo1 = this.byId("idOwnerShipInfo1");
                var sdnList = this.getView().getModel("oDataModel").getData().ownerShipInfoDto.sdnlistContact.length;
                this.getView().getModel("oDataModel").getData().ownerShipInfoDto.sdnlistContact.push({
                    "firstName": "", "lastName": "", "contactInSection": "OwnerShipInfo", "contact": "supplier Owned By SDN", "userCreated": "",
                    "userUpdated": ""
                });
                this.getView().getModel("oDataModel").refresh();


            },
            addOwnbyInd2: function () {
                // @ts-ignore
                this.idOwnerShipInfo2 = this.byId("idOwnerShipInfo2");
                var sdnList = this.getView().getModel("oDataModel").getData().ownerShipInfoDto.regInCISNKContact.length;
                this.getView().getModel("oDataModel").getData().ownerShipInfoDto.regInCISNKContact.push({
                    "firstName": "", "lastName": "", "contactInSection": "OwnerShipInfo", "contact": "supplier Owned By CISNK", "userCreated": "",
                    "userUpdated": ""
                });
                this.getView().getModel("oDataModel").refresh();


            },
            addTaxRegistration: function () {
                var taxCount = this.getView().getModel("oDataModel").getData().bpInfoDto.tax.length;
                if (taxCount < 8) {
                    this.getView().getModel("oDataModel").getData().bpInfoDto.tax.push({
                        "country": "",
                        "ifOther": "",
                        "taxId": "",
                        "taxNum": "",
                        "type": ""
                    });
                }
                this.getView().getModel("oDataModel").refresh();

            },
            // @ts-ignore

            fnDeleteContainerlayout: function (oEvent) {
                var index = oEvent.getSource().getBindingContext("oDataModel").sPath.split("/tax/")[1];
                this.getView().getModel("oDataModel").getData().bpInfoDto.tax.splice(
                    index, 1);
                this.getView().getModel("oDataModel").refresh();
            },
            _fnDeleteContainerlayoutOwner: function (oEvent) {
                var rowItemContainer = oEvent.getSource().getParent().getParent();
                rowItemContainer.destroy();
            },
            fnDeleteOwnByInd1: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext("oDataModel").sPath;
                var mPath = sPath.substring(0, sPath.length - 1);
                var index = oEvent.getSource().getBindingContext("oDataModel").sPath.split("/")[3];
                this.getView().getModel("oDataModel").getProperty(mPath).splice(
                    index, 1);
                this.getView().getModel("oDataModel").refresh();
            },
            fnDeleteOwnByInd2: function (oEvent) {
                var sPath = oEvent.getSource().getBindingContext("oDataModel").sPath;
                var mPath = sPath.substring(0, sPath.length - 1);
                var index = oEvent.getSource().getBindingContext("oDataModel").sPath.split("/")[3];
                this.getView().getModel("oDataModel").getProperty(mPath).splice(
                    index, 1);
                this.getView().getModel("oDataModel").refresh();
            },
            onSaveAsDraft: function (oEvent) {
                var btn = oEvent.getSource().sId.split("---VendorSurvey--")[1];
                if (vAppName == "SupplierFinance") {
                    if (btn === "submitS") {
                        var vValid = this._fnValidateBankInfo();
                        if (vValid == "Invalid") {
                            return;
                        }
                    }
                }
                if (btn === "submitS") {
                    var that = this;
                    if (vAppName == "Supplier") {
                        if (!oView.getModel("oDataModel").getData().isFormAccepted) {
                            var oi18n_En = this.getOwnerComponent().getModel("oi18n_En"),
                                isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;

                            if (isDefaultLan) {
                                sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("submitForm")), {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: that.getView().getModel("i18n").getResourceBundle().getText("error")
                                });
                            } else {
                                sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.submitForm + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("submitForm")), {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),

                                });
                            }

                        }
                    }
                }
                else {
                    this.onCompleteCompanyInfo();
                }
                this.oWizard = this.getView().byId("surveyWizard");
                var currentStepId = this.oWizard.getCurrentStep().split("container-surveyform---VendorSurvey--")[1];
                if (currentStepId == "basicInfo") {
                    this._fnValidateDraftBasicInfo();
                }
                if (currentStepId == "businessPartnerInfo") {
                    this._fnValidateDraftBusinessPartnerInfo();
                }
                if (currentStepId == "contactInfo") {
                    this._fnValidateDraftCompanyContactnfo();
                }
                if (currentStepId == "ownerShipInfo") {
                    this._fnValidateDraftOwnershipInfo();
                }
                if (currentStepId == "companyInfo") {
                    this._fnValidateDraftCompanyInfo();
                }
                if (currentStepId == "bankInfo") {
                    this._fnValidateDraftBankInfo();
                }
                if (currentStepId == "shippingInfo") {
                    this._fnValidateDraftShippingInfo();
                }
                if (currentStepId == "prodAndServInfo") {
                    this._fnValidateDraftOperAndManu();
                }
                if (currentStepId == "cComplianceInfo") {
                    this._fnValidateDraftComplianceInfo();
                }
                if (currentStepId == "cyberSecInfo") {
                    this._fnValidateDraftCyberSecurityInfo();
                }
                //  if (this.getView().byId(this.getView().byId("surveyWizard").getSteps()[this.oWizard._getProgressNavigator()._iCurrentStep - 1].sId).getValidated()) {
                if (this.getView().byId(this.getView().byId("surveyWizard").getCurrentStep()).getValidated()) {
                    var that = this;
                    var oModel = new JSONModel();
                    var oPayload = jQuery.extend(true, {}, this.getView().getModel("oDataModel").getData());
                    oPayload.caseId = oView.getModel("oUserModel").getData().caseId;
                    if (oPayload.surveyInfoDto.address[0]) {
                        oPayload.surveyInfoDto.address[0].postal[0].email[0].email = oPayload.surveyInfoDto.authorityContact.email;
                        oPayload.surveyInfoDto.address[0].postal[0].telephone[0].telephoneNum = oPayload.surveyInfoDto.authorityContact.contact;
                        oPayload.surveyInfoDto.address[0].postal[0].telephone[0].extension = oPayload.surveyInfoDto.authorityContact.extension;
                        if (oPayload.surveyInfoDto.address[0].postal[0].telephone.length == 1) {
                            oPayload.surveyInfoDto.address[0].postal[0].telephone.push({
                                "isMobileNumber": false,
                                "telephoneId": "",
                                "telephoneNum": "",
                                "extension": ""
                            });
                            oPayload.surveyInfoDto.address[0].postal[0].telephone[1].isMobileNumber = true;
                            oPayload.surveyInfoDto.address[0].postal[0].telephone[1].telephoneNum = oPayload.surveyInfoDto.authorityContact.mobile;
                        }
                    }

                    oPayload.bpCentral.personGivenName = oPayload.surveyInfoDto.authorityContact.firstName;
                    oPayload.bpCentral.personFamilyName = oPayload.surveyInfoDto.authorityContact.lastName;
                    oPayload.bpCentral.personAcademicTitleCode = oPayload.surveyInfoDto.authorityContact.jobTitle;

                    if (oPayload.bpInfoDto.siteHaveDunsNumber === false) {
                        oPayload.bpInfoDto.dunsRegistrationNum = "";
                        oPayload.bpInfoDto.dnbLegalBusinessName = "";
                    } else {
                        oPayload.bpInfoDto.encourgeDunsNumberReg = null;
                        oPayload.bpInfoDto.isSiteCorporateHeadquaters = null;
                        oPayload.bpInfoDto.noOfEmployees = "";
                        oPayload.bpInfoDto.year = "";
                    }
                    if (oPayload.bpInfoDto.dunsRegistrationNum !== "" && oPayload.bpInfoDto.dunsRegistrationNum !== "NODUNS") {
                        oPayload.ownerShipInfoDto.doesOtherEntityOwnSite = null;
                        oPayload.ownerShipInfoDto.companyName = "";
                    }
                    if (oPayload.ownerShipInfoDto.isEntitySDNList === false) {
                        $.each(oPayload.ownerShipInfoDto.sdnlistContact, function (index, row) {
                            row.firstName = "";
                            row.lastName = "";
                        });

                    }
                    if (oPayload.ownerShipInfoDto.isEntityRegInCISNK === false) {

                        $.each(oPayload.ownerShipInfoDto.regInCISNKContact, function (index, row) {
                            row.firstName = "";
                            row.lastName = "";
                        });
                    }
                    if (oPayload.ownerShipInfoDto.isEntityManagedByGovt === false) {
                        oPayload.ownerShipInfoDto.managedByGovtContact.contact = "";
                        oPayload.ownerShipInfoDto.managedByGovtContact.email = "";
                        oPayload.ownerShipInfoDto.managedByGovtContact.entityName = "";
                        oPayload.ownerShipInfoDto.managedByGovtContact.extension = "";
                        oPayload.ownerShipInfoDto.managedByGovtContact.firstName = "";
                        oPayload.ownerShipInfoDto.managedByGovtContact.lastName = "";
                        oPayload.ownerShipInfoDto.managedByGovtContact.jobTitle = "";
                        oPayload.ownerShipInfoDto.managedByGovtContact.countryContactCode = "";
                    }
                    if (oPayload.ownerShipInfoDto.isEntityManagedByGovtFamily === false) {
                        oPayload.ownerShipInfoDto.managedByGovtFamilyContact.contact = "";
                        oPayload.ownerShipInfoDto.managedByGovtFamilyContact.email = "";
                        oPayload.ownerShipInfoDto.managedByGovtFamilyContact.entityName = "";
                        oPayload.ownerShipInfoDto.managedByGovtFamilyContact.extension = "";
                        oPayload.ownerShipInfoDto.managedByGovtFamilyContact.firstName = "";
                        oPayload.ownerShipInfoDto.managedByGovtFamilyContact.lastName = "";
                        oPayload.ownerShipInfoDto.managedByGovtFamilyContact.jobTitle = "";
                        oPayload.ownerShipInfoDto.managedByGovtFamilyContact.countryContactCode = "";
                    }

                    if (oPayload.comInfoDto.isRemitToAddress) {
                        oPayload.bankDto.bankInfoDto[0].accountGroup = "Z004";
                    } else {
                        oPayload.bankDto.bankInfoDto[0].accountGroup = "ZVEN";
                    }

                    if (oPayload.shippingInfoDto.isDeliver === false) {
                        oPayload.shippingInfoDto.deliverRepName = "";
                        oPayload.shippingInfoDto.deliverRepAddress = "";
                        oPayload.shippingInfoDto.supplierContactInLogistics = "";
                        oPayload.shippingInfoDto.deliverRepCountryContactCode = "";
                        oPayload.shippingInfoDto.deliverRepEmail = "";
                        oPayload.shippingInfoDto.deliverRepContact = "";
                        oPayload.shippingInfoDto.deliverRepFax = "";
                    }


                    oPayload.comContactDto = jQuery.extend(true, [], oView.getModel("oLookUpModel").getData().tabledata);
                    $.each(oPayload.comContactDto, function (index, row) {
                        delete row.tooltip;
                    });
                    if (oPayload.bankDto.isBankProvided === false) {
                        oPayload.bankDto.bankInfoDto[0].bankName = "";
                        oPayload.bankDto.bankInfoDto[0].bankAddress = "";
                        oPayload.bankDto.bankInfoDto[0].bankCity = "";
                        oPayload.bankDto.bankInfoDto[0].bankState = "";
                        oPayload.bankDto.bankInfoDto[0].bankCountry = "";
                        oPayload.bankDto.bankInfoDto[0].bankBranch = "";
                        oPayload.bankDto.bankInfoDto[0].benefAccHolderName = "";
                        oPayload.bankDto.bankInfoDto[0].bankAccNum = "";
                        oPayload.bankDto.bankInfoDto[0].refBankDetails = "";
                        oPayload.bankDto.bankInfoDto[0].swiftCode = "";
                        oPayload.bankDto.bankInfoDto[0].bankNumber = "";
                        oPayload.bankDto.bankInfoDto[0].ibanNum = "";
                        oPayload.bankDto.bankInfoDto[0].bankCode = "";
                        oPayload.bankDto.bankInfoDto[0].partnerBankType = "";
                        oPayload.bankDto.bankInfoDto[0].bankControlKey = "";
                        // oPayload.bankDto.bankInfoDto[0].instructionKey = ""; // commented since the key is default value in all screens- siva ---- date:01/10/2021
                        oPayload.bankDto.financeContact1.contactInSection = "FinanceSupplier";
                        oPayload.bankDto.financeContact2.contactInSection = "Reviewer";
                    } else {
                        oPayload.bankDto.financeContact1.firstName = "";
                        oPayload.bankDto.financeContact1.lastName = "";
                        oPayload.bankDto.financeContact1.jobTitle = "";
                        oPayload.bankDto.financeContact1.email = "";
                        oPayload.bankDto.financeContact1.contact = "";
                        oPayload.bankDto.financeContact1.extension = "";
                        oPayload.bankDto.financeContact1.mobile = "";
                        oPayload.bankDto.financeContact1.countryContactCode = "";
                        oPayload.bankDto.financeContact1.contactInSection = "";
                        oPayload.bankDto.financeContact2.contactInSection = "Reviewer";
                    }

                    if (oPayload.financeInfoDto.financeAuditedLast12M === false) {
                        oPayload.financeInfoDto.userAudited = "";
                    }
                    if (oPayload.comComplianceDto.commitedToExpectations) {
                        oPayload.comComplianceDto.notCommitedExplanation = "";
                        oPayload.comComplianceDto.commitedToExpectationsContact.contact = "";
                        oPayload.comComplianceDto.commitedToExpectationsContact.email = "";
                        oPayload.comComplianceDto.commitedToExpectationsContact.extension = "";
                        oPayload.comComplianceDto.commitedToExpectationsContact.firstName = "";
                        oPayload.comComplianceDto.commitedToExpectationsContact.lastName = "";
                        oPayload.comComplianceDto.commitedToExpectationsContact.jobTitle = "";
                        oPayload.comComplianceDto.commitedToExpectationsContact.countryContactCode = "";
                    }
                    if (oPayload.comComplianceDto.companyRelationWithJabilEmp === false) {
                        oPayload.comComplianceDto.companyRelationWithJabilEmpContact.firstName = "";
                        oPayload.comComplianceDto.companyRelationWithJabilEmpContact.department = "";
                        oPayload.comComplianceDto.companyRelationWithJabilEmpContact.jobTitle = "";
                        oPayload.comComplianceDto.companyRelationWithJabilEmpContact.email = "";
                    }
                    if (oPayload.comComplianceDto.companyContactWithPreviouseJabilEmp === false) {
                        oPayload.comComplianceDto.employeeName = "";
                        oPayload.comComplianceDto.jobTitle = "";
                        oPayload.comComplianceDto.startDate = "";
                        oPayload.comComplianceDto.endDate = "";
                    } else {

                        oPayload.comComplianceDto.startDate = oPayload.comComplianceDto.startDate ? formatter.fnFormatDate(oPayload.comComplianceDto.startDate) : null;
                        oPayload.comComplianceDto.endDate = oPayload.comComplianceDto.endDate ? formatter.fnFormatDate(oPayload.comComplianceDto.endDate) : null;
                    }
                    if (oPayload.itCyberDto.orgConnectToJabilSystem) {
                        var networkCC = oView.getModel("oLookUpModel").getData().orgEstablishConnection;
                        oPayload.itCyberDto.orgEstablishConnection = [];
                        $.each(networkCC, function (index, value) {
                            if (value.isSelected) {
                                oPayload.itCyberDto.orgEstablishConnection.push(value);
                            }

                        });

                    } else { oPayload.itCyberDto.orgEstablishConnection = []; }
                    if (oPayload.itCyberDto.orgMaintainProcessDataFromJabil) {
                        var networkCC = oView.getModel("oLookUpModel").getData().orgBusinessActivities;
                        oPayload.itCyberDto.orgBusinessActivities = [];
                        $.each(networkCC, function (index, value) {
                            if (value.isSelected) {
                                oPayload.itCyberDto.orgBusinessActivities.push(value);
                            }
                        });
                    } else { oPayload.itCyberDto.orgBusinessActivities = []; }
                    if (oPayload.itCyberDto.orgConnectToJabilSystem || oPayload.itCyberDto.orgMaintainProcessDataFromJabil) {

                    } else {
                        oPayload.itCyberDto.responsibleForInforSecurity = null;
                        oPayload.itCyberDto.certifiedForInfoSecurity = null;
                        oPayload.itCyberDto.validateCertificate = null;
                    }

                    if (oPayload.businessPartnerId == "") {
                        oPayload.userCreated = oView.getModel("oUserModel").getData().user.givenName;
                        var sUrl = "/comjabilsurveyform/plcm_portal_services/supplier/create";
                        if (btn === "saveS") {
                            oBusyDialog.open();
                        } else if (btn === "submitS" && oView.getModel("oDataModel").getData().isFormAccepted) {
                            oBusyDialog.open();
                        }
                        oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, true, {
                            "Content-Type": "application/json"
                        });
                        oModel.attachRequestCompleted(function (oEvent) {
                            // @ts-ignore
                            if (btn === "saveS") {
                                oBusyDialog.close();
                            }
                            else if (btn === "submitS" && oView.getModel("oDataModel").getData().isFormAccepted) {
                                oBusyDialog.close();
                            }
                            if (oEvent.getParameter("success")) {
                                if (!that.oSuccess) {
                                    that.oSuccess = sap.ui.xmlfragment(
                                        "com.jabil.surveyform.fragments.success", that);
                                    oView.addDependent(that.oSuccess);
                                }

                                oView.getModel("oDataModel").setData(oEvent.getSource().oData);
                                oView.getModel("oDataModel").refresh();
                                that.oSuccess.getContent()[0].getItems()[1].setText(oPayload.caseId);
                                var oi18n_En = that.getOwnerComponent().getModel("oi18n_En"),
                                    isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                                if (btn === "saveS") {
                                    if (isDefaultLan) {
                                        that.oSuccess.getContent()[0].getItems()[2].setText(oi18n.getText("draftDialogMsg"));
                                        that.oSuccess.getContent()[0].getItems()[3].setText(btn);

                                    } else {
                                        that.oSuccess.getContent()[0].getItems()[2].setText(oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.draftDialogMsg + "\n" + oi18n.getText("draftDialogMsg"));
                                        that.oSuccess.getContent()[0].getItems()[3].setText(btn);

                                    }
                                    that.oSuccess.open();
                                } else if (btn === "submitS") {
                                    if (isDefaultLan) {
                                        that.oSuccess.getContent()[0].getItems()[2].setText(oi18n.getText("successDialogMsg"));
                                        that.oSuccess.getContent()[0].getItems()[3].setText(btn);
                                    } else {
                                        that.oSuccess.getContent()[0].getItems()[2].setText(oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.successDialogMsg + "\n" + oi18n.getText("successDialogMsg"));
                                        that.oSuccess.getContent()[0].getItems()[3].setText(btn);
                                    }
                                    if (oView.getModel("oDataModel").getData().isFormAccepted) {
                                        that._fnTaskComplete(oEvent.getSource().oData.businessPartnerId, that.oSuccess);
                                    }
                                    //    if(isSuccess){ that.oSuccess.open();
                                    //    }
                                }



                            }
                            else {
                                var eMsg = oEvent.getParameter("errorobject").responseText;
                                MessageBox.show(eMsg, {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: oi18n.getText("error")
                                });
                            }
                        });
                    } else if (oPayload.businessPartnerId != "") {

                        oPayload.userUpdated = oView.getModel("oUserModel").getData().user.givenName;
                        var sUrl = "/comjabilsurveyform/plcm_portal_services/supplier/update";
                        if (btn === "saveS") {
                            oBusyDialog.open();
                        }
                        else if (btn === "submitS" && oView.getModel("oDataModel").getData().isFormAccepted) {
                            oBusyDialog.open();
                        }
                        oModel.loadData(sUrl, JSON.stringify(oPayload), true, "PUT", false, true, {
                            "Content-Type": "application/json"
                        });
                        oModel.attachRequestCompleted(function (oEvent) {
                            // @ts-ignore
                            if (btn === "saveS") {
                                oBusyDialog.close();
                            } else if (btn === "submitS" && oView.getModel("oDataModel").getData().isFormAccepted) {
                                oBusyDialog.close();
                            }
                            if (oEvent.getParameter("success")) {
                                if (!that.oSuccess) {
                                    that.oSuccess = sap.ui.xmlfragment(
                                        "com.jabil.surveyform.fragments.success", that);
                                    oView.addDependent(that.oSuccess);
                                }

                                oView.getModel("oDataModel").setData(oEvent.getSource().oData);
                                oView.getModel("oDataModel").refresh();
                                that.oSuccess.getContent()[0].getItems()[1].setText(oPayload.caseId);
                                var oi18n_En = that.getOwnerComponent().getModel("oi18n_En"),
                                    isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                                if (btn === "saveS") {
                                    if (isDefaultLan) {
                                        that.oSuccess.getContent()[0].getItems()[2].setText(oi18n.getText("draftDialogMsg"));
                                        that.oSuccess.getContent()[0].getItems()[3].setText(btn);

                                    } else {
                                        that.oSuccess.getContent()[0].getItems()[2].setText(oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.draftDialogMsg + "\n" + oi18n.getText("draftDialogMsg"));
                                        that.oSuccess.getContent()[0].getItems()[3].setText(btn);

                                    }
                                    that.oSuccess.open();

                                } else if (btn === "submitS") {
                                    if (isDefaultLan) {
                                        that.oSuccess.getContent()[0].getItems()[2].setText(oi18n.getText("successDialogMsg"));
                                        that.oSuccess.getContent()[0].getItems()[3].setText(btn);
                                    } else {
                                        that.oSuccess.getContent()[0].getItems()[2].setText(oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.successDialogMsg + "\n" + oi18n.getText("successDialogMsg"));
                                        that.oSuccess.getContent()[0].getItems()[3].setText(btn);
                                    }

                                    if (oView.getModel("oDataModel").getData().isFormAccepted) {
                                        that._fnTaskComplete(oEvent.getSource().oData.businessPartnerId, that.oSuccess);
                                    }

                                }


                            }
                            else {
                                var eMsg = oEvent.getParameter("errorobject").responseText;
                                MessageBox.show(eMsg, {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: oi18n.getText("error")
                                });
                            }
                        });
                    }
                }
            },
            fnSupplierForward: function (oEvent) {
                var that = this;
                this._fnValidateBasicInfo();
                if (oView.byId("basicInfo").getValidated()) {
                    var oModel = new JSONModel();
                    var payload = {
                        "surveyInfoDto": oView.getModel("oDataModel").getData().surveyInfoDto,
                        "userCreated": oView.getModel("oUserModel").getData().user.givenName,
                        "userUpdated": "",
                        "dateCreated": null,
                        "dateUpdated": null,
                        "businessPartnerId": "",
                        "caseId": oView.getModel("oUserModel").getData().caseId,
                    }
                    payload.surveyInfoDto.isAuthority = true;
                    payload.surveyInfoDto.authorityContact.firstName = oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName;
                    payload.surveyInfoDto.authorityContact.lastName = oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName;
                    payload.surveyInfoDto.authorityContact.email = oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.email;
                    payload.surveyInfoDto.authorityContact.countryContactCode = oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.countryContactCode;
                    payload.surveyInfoDto.authorityContact.contact = oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.contact;
                    payload.surveyInfoDto.authorityContact.mobile = oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.mobile;
                    payload.surveyInfoDto.authorityContact.contactName = oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName + " " + oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName;
                    //             payload.surveyInfoDto.address =[
                    //     {
                    //         "addressId": "",
                    //         "addressInSection": "Authority",
                    //         "postal": [
                    //             {
                    //                 "address1": "",
                    //                 "address2": "",
                    //                 "city": "",
                    //                 "country": "",
                    //                 "countryCode": "",
                    //                 "district": "",
                    //                 "email": [
                    //                     {
                    //                         "email": ""
                    //                     }
                    //                 ],
                    //                 "fax": [
                    //                     {
                    //                         "faxId": "",
                    //                         "faxNum": ""
                    //                     }
                    //                 ],
                    //                 "name": "",
                    //                 "postOfficeBox": "",
                    //                 "postOfficeBoxZipCode": "",
                    //                 "postalCode": "",
                    //                 "postalId": "",
                    //                 "poBoxPostalCode": "",
                    //                 "region": "",
                    //                 "regionCode": "",
                    //                 "telephone": [
                    //                     {
                    //                         "isMobileNumber": false,
                    //                         "telephoneId": "",
                    //                         "telephoneNum": "",
                    //                         "extension": ""
                    //                     },
                    //                     {
                    //                         "isMobileNumber": false,
                    //                         "telephoneId": "",
                    //                         "telephoneNum": "",
                    //                         "extension": ""
                    //                     }
                    //                 ],
                    //                 "url": [
                    //                     {
                    //                         "webId": "",
                    //                         "websiteUrl": ""
                    //                     }
                    //                 ]
                    //             }
                    //         ]
                    //     }
                    // ];
                    var sUrl = "/comjabilsurveyform/plcm_portal_services/supplier/create";
                    oBusyDialog.open();
                    oModel.loadData(sUrl, JSON.stringify(payload), true, "POST", false, true, {
                        "Content-Type": "application/json"
                    });
                    oModel.attachRequestCompleted(function (oEvent) {
                        // @ts-ignore

                        if (oEvent.getParameter("success")) {

                            that._fnTransferTaskComplete(oEvent.getSource().oData.businessPartnerId);

                        }
                        else {
                            var eMsg = oEvent.getParameter("errorobject").responseText;
                            MessageBox.show(eMsg, {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n.getText("error")
                            });
                            oBusyDialog.close();
                        }
                    });

                }
            },
            _fnTransferTaskComplete: function (businessPartId) {
                var jModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskComplete";
                var wPayload =
                {
                    "context": {
                        "bpNumber": businessPartId,
                        "caseId": oView.getModel("oUserModel").getData().caseId,
                        "isEULAAccepted": true,
                        "supplierAction": "transfer",
                        "supplierDetails": {
                            "firstName": oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName,
                            "lastName": oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName,
                            "email": oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.email
                        },
                    },
                    "action": "transfer",
                    "comments": null,
                    "taskId": oView.getModel("oUserModel").getData().taskId
                }
                jModel.loadData(sUrl, JSON.stringify(
                    wPayload
                ), true, "POST", false, true, {
                    "Content-Type": "application/json"
                });
                jModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oBusyDialog.close();
                        MessageBox.show("Transferred Successfully", {
                            icon: MessageBox.Icon.INFORMATION,
                            title: oi18n.getText("information"),
                            onClose: function (oAction) {
                                if (oAction == "OK") {
                                    window.parent.location.reload();
                                }
                            }
                        });
                    }
                    else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });
                        oBusyDialog.close();
                        return false;

                    }
                });


            },

            _fnTaskComplete: function (bp, success) {
                var that = this;
                var jModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskComplete";
                var wPayload =
                {
                    "context": {
                        "bpNumber": bp,
                        "caseId": oView.getModel("oUserModel").getData().caseId,
                        "isEULAAccepted": true,
                        "supplierAction": "EULA_accepted",
                        "bankDetailsProvided": oView.getModel("oDataModel").getData().bankDto.isBankProvided ? "YES" : "NO",
                        "financeContact1": {
                            "firstName": oView.getModel("oDataModel").getData().bankDto.isBankProvided ? "" : oView.getModel("oDataModel").getData().bankDto.financeContact1.firstName,
                            "lastName": oView.getModel("oDataModel").getData().bankDto.isBankProvided ? "" : oView.getModel("oDataModel").getData().bankDto.financeContact1.lastName,
                            "email": oView.getModel("oDataModel").getData().bankDto.isBankProvided ? "" : oView.getModel("oDataModel").getData().bankDto.financeContact1.email
                        },
                        "financeContact2": {
                            "firstName": oView.getModel("oDataModel").getData().bankDto.financeContact2.firstName,
                            "lastName": oView.getModel("oDataModel").getData().bankDto.financeContact2.lastName,
                            "email": oView.getModel("oDataModel").getData().bankDto.financeContact2.email
                        },
                        "supplierDetails": {
                            "firstName": oView.getModel("oDataModel").getData().surveyInfoDto.isAuthority ? "" : oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.firstName,
                            "lastName": oView.getModel("oDataModel").getData().surveyInfoDto.isAuthority ? "" : oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.lastName,
                            "email": oView.getModel("oDataModel").getData().surveyInfoDto.isAuthority ? "" : oView.getModel("oDataModel").getData().surveyInfoDto.ackContact.email
                        },
                        "exceptional_wf_input": {
                            "GTS_question1": oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntitySDNList ? "YES" : "NO",
                            "GTS_question2": oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityRegInCISNK ? "YES" : "NO",
                            "Legal_exceptional_question1": oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovt ? "YES" : "NO",
                            "Legal_exceptional_question2": oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovtFamily ? "YES" : "NO",
                            "Legal_coi_exception_question1": oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmp ? "YES" : "NO",
                            "Legal_coi_exception_question2": oView.getModel("oDataModel").getData().comComplianceDto.companyContactWithPreviouseJabilEmp ? "YES" : "NO"
                        },
                        "ndaSupplierDetails": {
                            "email": oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.email,
                            "name": oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.firstName + " " + oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.lastName,
                            "company": oView.getModel("oDataModel").getData().bpCentral[0].organisationName1,
                            "jobTitle": oView.getModel("oDataModel").getData().surveyInfoDto.authorityContact.jobTitle
                        }
                    },
                    "action": "submit",
                    "comments": null,
                    "taskId": oView.getModel("oUserModel").getData().taskId
                }
                jModel.loadData(sUrl, JSON.stringify(
                    wPayload
                ), true, "POST", false, true, {
                    "Content-Type": "application/json"
                });
                jModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        success.open();
                        // return true;
                    }
                    else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });
                        return false;

                    }
                });
            },

            onSubmit: function (oEvent) {

            },
            fnCloseDialog: function () {
                this.oSuccess.close();
                if (this.oSuccess.getContent()[0] && this.oSuccess.getContent()[0].getItems()[3] && this.oSuccess.getContent()[0].getItems()[3].getText() == "submitS") {
                    window.parent.location.reload();
                }

            },
            fnClose: function () {
                this.oPopup.close();
            },
            fnOnPressInfoIcon: function (oEvent) {

                var popOverModel = this.getView().getModel("oPopoverModel");
                var oButton = oEvent.getSource();
                var BtnId = oEvent.getSource().getAggregation("tooltip");
                var oView = this.getView();
                var txt = popOverModel.getProperty("/" + BtnId).info;




                if (!this._pPopover) {
                    this._pPopover = sap.ui.xmlfragment("idFragment", "com.jabil.surveyform.fragments.infoPopover", this);
                    //    oDialog.refreshAggregation()
                    this.getView().addDependent(this._pPopover);
                    this._pPopover.getContent()[0].setProperty("text", txt);
                }

                this._pPopover.openBy(oButton);

            },

            fnClosePopover: function () {
                this._pPopover.destroy();
                this._pPopover = undefined;
            },

            fnChangeStartDate: function (oEvent) {
                if (oEvent.getParameter("value")) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
                oView.getModel("oDataModel").getData().comComplianceDto.startDate = oEvent.getParameter("value");
                oView.getModel("oDataModel").refresh();
            },
            fnChangeEndDate: function (oEvent) {
                if (oEvent.getParameter("value")) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
                oView.getModel("oDataModel").getData().comComplianceDto.endDate = oEvent.getParameter("value");
                oView.getModel("oDataModel").refresh();
            },

            onBeforeRendering: function () { },

            onAfterRendering: function () {
                jQuery.sap.delayedCall(0, this, function() {
                    $("input:text:visible:first").focus();
                });
            },
            onActivateCompanyInfo: function () {

                oView.byId("iOAddress").addEventDelegate({
                    onAfterRendering: this.onActivateCompanyInfoOFA
                }, this);
                oView.byId("iRAddress").addEventDelegate({
                    onAfterRendering: this.onActivateCompanyInfoRTA
                }, this);
            },
            onActivateOperAndManuServ: function () {
                var isDisplay = oView.getModel("oEnableMdl").getData().nextBtnExtensionDisplayVsb;
                if (!isDisplay) { }
                else {
                    oView.byId("operServList").addEventDelegate({
                        onAfterRendering: function () {
                            var cb = $.find('.sapMCbBg');
                            for (var j = 1; j < cb.length - 1; j++) {
                                $("#" + cb[j].id).click(function (event) { event.stopPropagation() });
                            }
                        }
                    }, this);
                    oView.byId("manServList").addEventDelegate({
                        onAfterRendering: function () {
                            var cbg = $.find('.sapMCbBg');
                            for (var k = 1; k < cbg.length - 1; k++) {
                                $("#" + cbg[k].id).click(function (event) { event.stopPropagation() });
                            }
                        }
                    }, this);
                }
            },
            onActivateCompanyInfoOFA: function () {
                var that = this;
                setTimeout(function () {
                    var CustomKey = "8E55A2E520B342FABBB87DE6968743A1";
                    options = { key: CustomKey, setCountryByIP: false, isTrial: false };
                    var fields = [
                        { element: "iOAddress", field: "Address1", mode: so.fieldMode.SEARCH },
                    ];
                    var DOTSGlobalAddressComplete = new so.Address(fields, options);
                    DOTSGlobalAddressComplete.listen("populate", function (address, validations) {
                        oView.getModel("companyInfoModel").getData().oAddress1 = address.Address1;
                        oView.getModel("companyInfoModel").getData().oAddress2 = address.Address2;
                        oView.getModel("companyInfoModel").getData().oAddress3 = address.Address3;
                        oView.getModel("companyInfoModel").getData().oAddress4 = address.Address4;
                        oView.getModel("companyInfoModel").getData().oAddress5 = address.Address5;
                        oView.getModel("companyInfoModel").getData().oCity = address.Locality;
                        oView.getModel("companyInfoModel").getData().oPostalCode = address.PostalCode;
                        oView.getModel("companyInfoModel").getData().oRegion = address.AdminArea;
                        // oView.getModel("companyInfoModel").getData().oCountry = address.Country;
                        //   oView.getModel("companyInfoModel").getData().oCountryC = address.CountryCode;
                        oView.getModel("companyInfoModel").getData().oRegionC = address.AdminAreaCode;
                        oView.getModel("companyInfoModel").refresh();

                    });
                }, 500);
            },
            onActivateCompanyInfoRTA: function () {
                setTimeout(function () {
                    var CustomKey1 = "8E55A2E520B342FABBB87DE6968743A1";
                    options = { key: CustomKey1, setCountryByIP: false, isTrial: false };
                    var fields = [
                        { element: "iRAddress", field: "Address1", mode: so.fieldMode.SEARCH },
                    ];
                    var DOTSGlobalAddressComplete1 = new so.Address(fields, options);
                    DOTSGlobalAddressComplete1.listen("populate", function (address, validations) {
                        oView.getModel("remitModel").getData().rAddress1 = address.Address1;
                        oView.getModel("remitModel").getData().rAddress2 = address.Address2;
                        oView.getModel("remitModel").getData().rAddress3 = address.Address3;
                        oView.getModel("remitModel").getData().rAddress4 = address.Address4;
                        oView.getModel("remitModel").getData().rAddress5 = address.Address5;
                        oView.getModel("remitModel").getData().rCity = address.Locality;
                        oView.getModel("remitModel").getData().rPostalCode = address.PostalCode;
                        oView.getModel("remitModel").getData().rRegion = address.AdminArea;
                        // oView.getModel("remitModel").getData().rCountry = address.Country;
                        //  oView.getModel("remitModel").getData().rCountryC = address.CountryCode;
                        oView.getModel("remitModel").getData().rRegionC = address.AdminAreaCode;
                        oView.getModel("remitModel").refresh();
                    });
                }, 500);

            },
            onCompleteCompanyInfo: function () {
                try {
                    var oPayload = this.getView().getModel("oDataModel").getData();
                    oPayload.comInfoDto = {
                        "isOrderToAddress": oView.getModel("companyInfoModel").getData().isOrderFromAddress || false,
                        // "isOrderToAddress": true,
                        "address": [{ "addressInSection": "" }],
                        "isRemitToAddress": oView.getModel("remitModel").getData().isRemitToAddress || false,
                        "haveDiversityCertifications": oView.getModel("companyInfoModel").getData().haveDiversityCertifications,
                        "companyWebsite": oView.getModel("companyInfoModel").getData().companyWebsite,
                        "enterprise": [
                        ],

                        "smallDisadvantagedBusiness": [
                        ]
                    }
                    if (oPayload.comInfoDto.isOrderToAddress) {
                        //  if (oView.byId("iAddress1").getDomRef()) {
                        oPayload.comInfoDto.address = [{
                            "addressId": "",
                            "addressInSection": "CompanyInfo-OFA",
                            // "postal": [
                            //     {
                            //         "postalId": "",
                            //         "address1": oView.byId("iAddress1").getDomRef().value,
                            //         "address2": oView.byId("iAddress2").getDomRef().value,
                            //            "address3": oView.byId("iAddress3").getDomRef().value,
                            //         "address4": oView.byId("iAddress4").getDomRef().value ,
                            //            "address5": oView.byId("iAddress5").getDomRef().value,
                            //         "city": oView.byId("iCity").getDomRef().value,
                            //         "country": oView.getModel("companyInfoModel").getData().oCountry,
                            //         "district": oView.getModel("companyInfoModel").getData().oDist,
                            //         "fax": [
                            //             {
                            //                 "faxNum": oView.getModel("companyInfoModel").getData().oFaxNum,
                            //                 "faxId": ""
                            //             }
                            //         ],
                            //         "name": oView.getModel("companyInfoModel").getData().oName,
                            //         "postOfficeBox": oView.getModel("companyInfoModel").getData().oPostOffBox,
                            //         "postOfficeBoxZipCode": oView.getModel("companyInfoModel").getData().oPostOffZipCode,
                            //         "postalCode": oView.byId("iPostal").getDomRef().value,
                            //         "region": oView.getModel("companyInfoModel").getData().oRegion,
                            //         "countryCode": oView.getModel("companyInfoModel").getData().oCountryC,
                            //         "regionCode": oView.getModel("companyInfoModel").getData().oRegionC,
                            //         "telephone": [
                            //             {
                            //                 "telephoneId": "",
                            //                 "telephoneNum": oView.getModel("companyInfoModel").getData().oTeleNum
                            //             }
                            //         ]
                            //     }
                            // ]
                            "postal": [
                                {
                                    "postalId": "",
                                    "address1": oView.getModel("companyInfoModel").getData().oAddress1,
                                    "address2": oView.getModel("companyInfoModel").getData().oAddress2,
                                    "address3": oView.getModel("companyInfoModel").getData().oAddress3,
                                    "address4": oView.getModel("companyInfoModel").getData().oAddress4,
                                    "address5": oView.getModel("companyInfoModel").getData().oAddress5,
                                    "city": oView.getModel("companyInfoModel").getData().oCity,
                                    "country": oView.getModel("companyInfoModel").getData().oCountry,
                                    "district": oView.getModel("companyInfoModel").getData().oDist,
                                    "fax": [
                                        {
                                            "faxNum": oView.getModel("companyInfoModel").getData().oFaxNum,
                                            "faxId": ""
                                        }
                                    ],
                                    "name": oView.getModel("companyInfoModel").getData().oName,
                                    "postOfficeBox": oView.getModel("companyInfoModel").getData().oPostOffBox,
                                    "postOfficeBoxZipCode": oView.getModel("companyInfoModel").getData().oPostOffZipCode,
                                    "postalCode": oView.getModel("companyInfoModel").getData().oPostalCode,
                                    "region": oView.getModel("companyInfoModel").getData().oRegion,
                                    "countryCode": oView.getModel("companyInfoModel").getData().oCountryC,
                                    "regionCode": oView.getModel("companyInfoModel").getData().oRegionC,
                                    "telephone": [
                                        {
                                            "telephoneId": "",
                                            "telephoneNum": oView.getModel("companyInfoModel").getData().oTeleNum
                                        }
                                    ]
                                }
                            ]
                        }

                        ]
                        if (oPayload.comInfoDto.address[0] && oPayload.comInfoDto.address[0].postal[0].country == "United States") {
                            if (oPayload.comInfoDto.enterprise) {
                                var enterpriseList = oView.getModel("oLookUpModel").getData().enterprise;

                                $.each(enterpriseList, function (index, value) {
                                    if (value.isSelected) {
                                        oPayload.comInfoDto.enterprise.push(value);
                                    }

                                });

                            } else { oPayload.comInfoDto.smallDisadvantagedBusiness = []; }
                            if (oPayload.comInfoDto.smallDisadvantagedBusiness) {
                                var smallDisAdvList = oView.getModel("oLookUpModel").getData().smallDisadvantagedBusiness;

                                $.each(smallDisAdvList, function (index, value) {
                                    if (value.isSelected) {
                                        oPayload.comInfoDto.smallDisadvantagedBusiness.push(value);
                                    }

                                });

                            } else { oPayload.comInfoDto.smallDisadvantagedBusiness = []; }
                        }

                        //  }
                    } else {
                        oPayload.comInfoDto.address = [{}];
                        oPayload.comInfoDto.address[0].addressInSection = "";
                    }
                    if (oPayload.comInfoDto.isRemitToAddress) {
                        // if (oView.byId("iAddress1R").getDomRef()) {
                        oPayload.comInfoDto.address.push({
                            "addressId": "",
                            "addressInSection": "CompanyInfo-RTA",
                            // "postal": [
                            //     {
                            //         "postalId": "",
                            //         "address1": oView.byId("iAddress1R").getDomRef().value,
                            //         "address2": oView.byId("iAddress2R").getDomRef().value,
                            //           "address3": oView.byId("iAddress3R").getDomRef().value,
                            //         "address4": oView.byId("iAddress4R").getDomRef().value,
                            //            "address5": oView.byId("iAddress5R").getDomRef().value,
                            //         "city": oView.byId("iCityR").getDomRef().value,
                            //         "country": oView.getModel("remitModel").getData().rCountry,
                            //         "district": oView.getModel("remitModel").getData().rDist,
                            //         "fax": [
                            //             {
                            //                 "faxNum": oView.getModel("remitModel").getData().rFaxNum,
                            //                 "faxId": ""
                            //             }
                            //         ],
                            //         "name": oView.getModel("remitModel").getData().rName,
                            //         "postOfficeBox": oView.getModel("remitModel").getData().rPostOffBox,
                            //         "postOfficeBoxZipCode": oView.getModel("remitModel").getData().rPostOffZipCode,
                            //         "postalCode": oView.byId("iPostalR").getDomRef().value,
                            //         "region": oView.getModel("remitModel").getData().rRegion,
                            //         "countryCode": oView.getModel("remitModel").getData().rCountryC,
                            //         "regionCode": oView.getModel("remitModel").getData().rRegionC,
                            //         "telephone": [
                            //             {
                            //                 "telephoneId": "",
                            //                 "telephoneNum": oView.getModel("remitModel").getData().rTeleNum
                            //             }
                            //         ]
                            //     }

                            // ]
                            "postal": [
                                {
                                    "postalId": "",
                                    "address1": oView.getModel("remitModel").getData().rAddress1,
                                    "address2": oView.getModel("remitModel").getData().rAddress2,
                                    "address3": oView.getModel("remitModel").getData().rAddress3,
                                    "address4": oView.getModel("remitModel").getData().rAddress4,
                                    "address5": oView.getModel("remitModel").getData().rAddress5,
                                    "city": oView.getModel("remitModel").getData().rCity,
                                    "country": oView.getModel("remitModel").getData().rCountry,
                                    "district": oView.getModel("remitModel").getData().rDist,
                                    "fax": [
                                        {
                                            "faxNum": oView.getModel("remitModel").getData().rFaxNum,
                                            "faxId": ""
                                        }
                                    ],
                                    "name": oView.getModel("remitModel").getData().rName,
                                    "postOfficeBox": oView.getModel("remitModel").getData().rPostOffBox,
                                    "postOfficeBoxZipCode": oView.getModel("remitModel").getData().rPostOffZipCode,
                                    "postalCode": oView.getModel("remitModel").getData().rPostalCode,
                                    "region": oView.getModel("remitModel").getData().rRegion,
                                    "countryCode": oView.getModel("remitModel").getData().rCountryC,
                                    "regionCode": oView.getModel("remitModel").getData().rRegionC,
                                    "telephone": [
                                        {
                                            "telephoneId": "",
                                            "telephoneNum": oView.getModel("remitModel").getData().rTeleNum
                                        }
                                    ]
                                }

                            ]
                        })
                        //  }

                    } else {
                        oPayload.comInfoDto.address.push({});
                        oPayload.comInfoDto.address[1].addressInSection = "";
                    }
                }
                catch (err) {

                }


            },
            fnOpenBankCommentsApp: function () {
                var temp = {};
                temp.Action = "AP";
                //  temp.Comments = "";
                temp.Commentse = "None";
                var oJosnComments = new sap.ui.model.json.JSONModel();
                oJosnComments.setData(temp);
                oView.setModel(oJosnComments, "JMBankComments");
                if (!this.oBankComments) {
                    this.oBankComments = sap.ui.xmlfragment(
                        "com.jabil.surveyform.fragments.BankComments", this);
                    oView.addDependent(this.oBankComments);
                }

                this.oBankComments.open();
            },
            fnOpenBankCommentsReject: function () {
                var temp = {};
                temp.Action = "RJ";
                //temp.Comments ;
                temp.Commentse = "None";
                var oJosnComments = new sap.ui.model.json.JSONModel();
                oJosnComments.setData(temp);
                oView.setModel(oJosnComments, "JMBankComments");
                if (!this.oBankComments) {
                    this.oBankComments = sap.ui.xmlfragment(
                        "com.jabil.surveyform.fragments.BankComments", this);
                    oView.addDependent(this.oBankComments);
                }

                this.oBankComments.open();
            },
            fnCloseBankComments: function () {
                this.oBankComments.close();
            },
            fnSubmitComments: function () {
                if (oView.getModel("JMBankComments").getData().Comments) {
                    if (oView.getModel("JMBankComments").getData().Action == "RJ") {
                        this.fnApproveSub("RJ");
                    } else {
                        this.fnApproveSub("AP");
                    }
                } else {
                    oView.getModel("JMBankComments").getData().Commentse = "Error";
                    oView.getModel("JMBankComments").refresh();
                }
            },

            fnApproveSub: function (vBtn) {
                var that = this;
                var vConfirmTxt, vAprActn, vSccuessTxt;
                if (vBtn == "AP") {
                    vConfirmTxt = this.getOwnerComponent().getModel("i18n").getProperty("EulaSubConfirm");
                    vSccuessTxt = this.getOwnerComponent().getModel("i18n").getProperty("EulaSubSuccess");
                    vAprActn = true;
                } else {
                    vConfirmTxt = this.getOwnerComponent().getModel("i18n").getProperty("EulaRejConfirm");
                    vSccuessTxt = this.getOwnerComponent().getModel("i18n").getProperty("EulaRejSuccess");
                    vAprActn = false;
                }

                oBusyDialog.open();
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskComplete"

                var oPayload = {
                    "context": {
                        "bpNumber": oView.getModel("oUserModel").getData().bpNumber,
                        "caseId": oView.getModel("oUserModel").getData().caseId,
                        "isFinanceApprovedBank": vAprActn
                    },
                    "status": "",
                    "taskId": oView.getModel("oUserModel").getData().taskId
                }


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
                                "com.jabil.surveyform.fragments.CreateSuccessGBS", that);
                            oView.addDependent(that.oBPSuccess);
                        }
                        oBusyDialog.close();
                        that.oBPSuccess.open();

                    } else {
                        oBusyDialog.close();
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });


                    }
                });

            },
            fnSetSupplierFinanceView: function () {
                var that = this;

                if (vAppName == "SupplierFinance") {
                    that.getView().byId("surveyWizard").setCurrentStep("container-surveyform---VendorSurvey--bankInfo");
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStep = true;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._BackButton = false;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepSave = true;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SaveAsDraftButton = true;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReview = false;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReviewEdit = true;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SupplierBankEdit = false;
                    that.getView().byId("surveyWizard")._getProgressNavigator().ontap = function () {
                        if (vAppName == "SupplierFinance") {
                            that.getView().byId("surveyWizard").setCurrentStep("container-surveyform---VendorSurvey--bankInfo");

                        } else if (vAppName == "SupplierFinanceReview") {
                            that.getView().byId("surveyWizard").setCurrentStep("container-surveyform---VendorSurvey--bankInfo");

                        }
                    };
                } else if (vAppName == "SupplierFinanceReview") {
                    that.getView().byId("surveyWizard").setCurrentStep("container-surveyform---VendorSurvey--bankInfo");
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._BackButton = false;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStep = true;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepSave = false;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReview = true;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReviewEdit = false;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SupplierBankEdit = false;

                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SaveAsDraftButton = false;
                    that.getView().byId("surveyWizard")._getProgressNavigator().ontap = function () {
                        if (vAppName == "SupplierFinance") {
                            that.getView().byId("surveyWizard").setCurrentStep("container-surveyform---VendorSurvey--bankInfo");

                        } else if (vAppName == "SupplierFinanceReview") {
                            that.getView().byId("surveyWizard").setCurrentStep("container-surveyform---VendorSurvey--bankInfo");

                        }
                    };
                } else {
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._BackButton = true;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SaveAsDraftButton = true;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReview = false;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReviewEdit = true;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SupplierBankEdit = false;

                }
                if (vAppName.split(":")[0] == "Display" || that.getOwnerComponent().getModel("oVisibilityModel").getData().isTaskCompleted) {
                    if (that.getOwnerComponent().getModel("oVisibilityModel").getData().isTaskCompleted) {
                        that.getOwnerComponent().getModel("oVisibilityModel").getData()._HomeBtnVis = false;
                    } else {
                        that.getOwnerComponent().getModel("oVisibilityModel").getData()._HomeBtnVis = true;
                    }
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._finalStepSave = false;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReviewEdit = false;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SupplierBankEdit = false;
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SaveAsDraftButton = false;

                    var temp = {
                        "contactNameEnb": false,
                        "address1Enb": false,
                        "address2Enb": false,
                        "countryEnb": false,
                        "regionEnb": false,
                        "districtEnb": false,
                        "cityEnb": false,
                        "postalCodeEnb": false,
                        "poBoxPostalCodeEnb": false,
                        "faxNumEnb": false,
                        "websiteUrlEnb": false,
                        "firstNameEnb": false,
                        "lastNameEnb": false,
                        "jobTitleEnb": false,
                        "emailEnb": false,
                        "countryContactCodeEnb": false,
                        "contactEnb": false,
                        "extensionEnb": false,
                        "mobileEnb": false,
                        "isAuthorityEnb": false,
                        "areYouMainContactEnb": false,
                        "mainContactfirstNameEnb": false,
                        "mainContactlastNameEnb": false,
                        "mainContactjobTitleEnb": false,
                        "mainContactemailEnb": false,
                        "mainContactcountryContactCodeEnb": false,
                        "mainContactcontactEnb": false,
                        "mainContactmobileEnb": false,
                        "mainContactextensionEnb": false,
                        "altContactfirstNameEnb": false,
                        "altContactlastNameEnb": false,
                        "altContactjobTitleEnb": false,
                        "altContactemailEnb": false,
                        "altContactcontactEnb": false,
                        "altContactCountryContactCodeEnb": false,
                        "altContactcompanyWebEnb": false,
                        "isLegalCorrectEnb": false,
                        "isDunsCorrectEnb": false,
                        "siteHaveDunsNumberEnb": false,
                        "dunsRegistrationNumEnb": false,
                        "dnbLegalBusinessNameEnb": false,
                        "encourgeDunsNumberRegEnb": false,
                        "isSiteCorporateHeadquatersEnb": false,
                        "noOfEmployeesEnb": false,
                        "yearEnb": false,
                        "cfrComplaintEnb": false,
                        "itarCertifiedIndicatorEnb": false,
                        "naturalPersonEnb": false,
                        "typeEnb": false,
                        "taxCountryEnb": false,
                        "taxNumEnb": false,
                        "ifOtherEnb": false,
                        "ppocFNameEnb": false,
                        "ppocLNameEnb": false,
                        "ppocJobTitleEnb": false,
                        "ppocEmailEnb": false,
                        "ppocCountryContEnb": false,
                        "ppocContEnb": false,
                        "ppocExtensionEnb": false,
                        "ppocMobEnb": false,
                        "primeContfirstNameGEnb": false,
                        "primeContlastNameGEnb": false,
                        "primeContjobTitleEnb": false,
                        "primeConteMailEnb": false,
                        "primeContphoneNumEnb": false,
                        "primeContextensionEnb": false,
                        "primeContmobPhoneEnb": false,
                        "addMoreEnb": false,
                        "deleteBtnEnb": false,
                        "ndaSignedBeforeEnb": false,
                        "bpInfoAttachmentEnb": false,
                        "CancelAttachmentBtnEnb": false,
                        "doesOtherEntityOwnSiteEnb": false,
                        "companyNameEnb": false,
                        "ownershipTypeEnb": false,
                        "ownershipTypeOtherValueEnb": false,
                        "isEntityTradedCompanyEnb": false,
                        "isEntitySDNListEnb": false,
                        "sdnlistContactfirstNameEnb": false,
                        "sdnlistContactlastNameEnb": false,
                        "addOwnbyInd1BtnEnb": false,
                        "DeleteOwnByInd1Enb": false,
                        "isEntityRegInCISNKEnb": false,
                        "regInCISNKContactfirstNameEnb": false,
                        "regInCISNKContactlastNameEnb": false,
                        "addOwnbyInd2Enb": false,
                        "DeleteOwnByInd2Enb": false,
                        "isEntityManagedByGovtEnb": false,
                        "managedByGovtContactentityNameEnb": false,
                        "managedByGovtContactfirstNameEnb": false,
                        "managedByGovtContactlastNameEnb": false,
                        "managedByGovtContactemailEnb": false,
                        "managedByGovtContactCountrycontactEnb": false,
                        "managedByGovtContactcontactEnb": false,
                        "managedByGovtContactextensionEnb": false,
                        "managedByGovtContactjobTitleEnb": false,
                        "isEntityManagedByGovtFamilyEnb": false,
                        "managedByGovtFamilyentityNameEnb": false,
                        "managedByGovtFamilyfirstNameEnb": false,
                        "managedByGovtFamilylastNameEnb": false,
                        "managedByGovtFamilyemailEnb": false,
                        "managedByGovtFamilyCountrycontactEnb": false,
                        "managedByGovtFamilycontactEnb": false,
                        "managedByGovtFamilyextensionEnb": false,
                        "managedByGovtFamilyjobTitleEnb": false,
                        "ownershipInfoAttachmentEnb": false,
                        "orderfromAddrEnb": false,
                        "orderFromAddrSearchVsb": false,
                        "remitToAddrEnb": false,
                        "remitToAddrSearchVsb": false,
                        "rNameEnb": false,
                        "rTeleNumEnb": false,
                        "rFaxNumEnb": false,
                        "rPostOffBoxEnb": false,
                        "rPostOffZipCodeEnb": false,
                        "haveDiversityCertificationsEnb": false,
                        "enterpriseisSelectedEnb": false,
                        "smallDisadvantagedBusinessisSelectedEnb": false,
                        "enterpriseotherValueEnb": false,
                        "companyWebsiteEnb": false,
                        "companyInfoAttachmentEnb": false,
                        "bankInformationEnb": false,
                        "bankNameEnb": false,
                        "bankAccNumEnb": false,
                        "bankCodeEnb": false,
                        "benefAccHolderNameEnb": false,
                        "swiftCodeEnb": false,
                        "ibanNumEnb": false,
                        "bankAddressEnb": false,
                        "bankCityEnb": false,
                        "bankStateEnb": false,
                        "bankCountryEnb": false,
                        "bankBranchEnb": false,
                        "bankControlKeyEnb": false,
                        "instructionKeyEnb": false,
                        "bankInfoAttachmentEnb": false,
                        "vendorEnb": false,
                        "incotermEnb": false,
                        "incotermNamedPlaceEnb": false,
                        "deliveryLocationEnb": false,
                        "isDeliverEnb": false,
                        "deliverRepNameEnb": false,
                        "deliverRepAddressEnb": false,
                        "supplierContactInLogisticsEnb": false,
                        "deliverRepEmailEnb": false,
                        "deliverRepCountryContactEnb": false,
                        "deliverRepContactEnb": false,
                        "deliverRepFaxEnb": false,
                        "paymentTermsEnb": false,
                        "paymentMethodEnb": false,
                        "paymentCurrencyEnb": false,
                        "finance1Enb": false,
                        "finance1FNameEnb": false,
                        "finance1LNameEnb": false,
                        "finance1jobTitleEnb": false,
                        "finance1eMailEnb": false,
                        "finance1CountryCodeEnb": false,
                        "finance1contactEnb": false,
                        "finance1phoneNumEnb": false,
                        "finance1extensionEnb": false,
                        "finance1mobPhoneEnb": false,
                        "finance2Enb": false,
                        "finance2FNameEnb": false,
                        "finance2LNameEnb": false,
                        "finance2jobTitleEnb": false,
                        "finance2eMailEnb": false,
                        "finance2CountryCodeEnb": false,
                        "finance2contactEnb": false,
                        "finance2phoneNumEnb": false,
                        "finance2extensionEnb": false,
                        "finance2mobPhoneEnb": false,
                        "shippingInfoAttachmentEnb": false,
                        "isOperationServicesEnb": false,
                        "operationServicesEnb": false,
                        "operationServicesotherValueEnb": false,
                        "isManufacturingProcessSuppliesEnb": false,
                        "manufacturingProcessSuppliesotherValueEnb": false,
                        "comProdServAttachmentEnb": false,
                        "comContactemailEnb": false,
                        "comContactfirstNameEnb": false,
                        "comContactlastNameEnb": false,
                        "comContactjobTitleEnb": false,
                        "comContactCountryContactEnb": false,
                        "comContactcontactEnb": false,
                        "comContactextensionEnb": false,
                        "comContactInfoAttachmentEnb": false,
                        "doesFinancialStatementsEnb": false,
                        "financeAuditedLast12MEnb": false,
                        "userAuditedEnb": false,
                        "companyFinInfoAttachmentEnb": false,
                        "compliedToSrmEnb": false,
                        "notCompliedSRMExplanationEnb": false,
                        "commitedToExpectationsEnb": false,
                        "notCommitedExplanationEnb": false,
                        "commitedToExpectationsContactfirstNameEnb": false,
                        "commitedToExpectationsContactlastNameEnb": false,
                        "commitedToExpectationsContactemailEnb": false,
                        "commitedToExpectationsContactCountrycontactEnb": false,
                        "commitedToExpectationsContactcontactEnb": false,
                        "commitedToExpectationsContactextensionEnb": false,
                        "commitedToExpectationsContactjobTitleEnb": false,
                        "companyRelationWithJabilEmpEnb": false,
                        "companyRelationWithJabilEmpContactfirstNameEnb": false,
                        "companyRelationWithJabilEmpContactdepartmentEnb": false,
                        "companyRelationWithJabilEmpContactjobTitleEnb": false,
                        "companyRelationWithJabilEmpContactemailEnb": false,
                        "companyContactWithPreviouseJabilEmpEnb": false,
                        "comComplianceDtoemployeeNameEnb": false,
                        "comComplianceDtostartDateEnb": false,
                        "comComplianceDtoendDateEnb": false,
                        "comComplianceDtojobTitleEnb": false,
                        "comComplianceDtoregionEnb": false,
                        "isDisasterRecoveryPlanEnb": false,
                        "canDisasterRecoveryPlanEnb": false,
                        "companyCmplianceAttachmentEnb": false,
                        "orgConnectToJabilSystemEnb": false,
                        "orgEstablishConnectionisSelectedEnb": false,
                        "orgEstablishConnectionotherValueEnb": false,
                        "orgMaintainProcessDataFromJabilEnb": false,
                        "orgBusinessActivitiesisSelectedEnb": false,
                        "orgBusinessActivitiesotherValueEnb": false,
                        "certifiedForInfoSecurityEnb": false,
                        "validateCertificateEnb": false,
                        "responsibleForInforSecurityEnb": false,
                        "itcyberSecurityContactfirstNameEnb": false,
                        "itcyberSecurityContactlastNameEnb": false,
                        "itcyberSecurityContactjobTitleEnb": false,
                        "itcyberSecurityContactemailEnb": false,
                        "itcyberSecurityContactCountrycontactEnb": false,
                        "itcyberSecurityContactcontactEnb": false,
                        "itcyberSecurityContactextensionEnb": false,
                        "comCyberSecurityInfoAttachmentEnb": false,
                        "isFormAcceptedEnb": false,
                        "submitBtnEnb": false,
                        "deletDocVsb": false,
                        "nextBtnExtensionDisplayVsb": true




                    };
                    oView.getModel("oEnableMdl").setData(temp);
                    // var gridlist = oView.byId("operServList");
                    if (that.getView().byId("surveyWizard")._getProgressNavigator()._iCurrentStep == 1) {
                        oView.getModel("oEnableMdl").getData().BackBtnEnb = false;
                    } else {
                        oView.getModel("oEnableMdl").getData().BackBtnEnb = true;
                    }
                    oView.getModel("oEnableMdl").refresh();
                } else {
                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._HomeBtnVis = false;
                }
                that.getOwnerComponent().getModel("oVisibilityModel").refresh(true);
            },
            fnDoneSubmit: function () {
                window.parent.location.reload();
            },
            fnNavBackToHome: function () {
                var vName = vAppName.split(":")[1];
                if (vName == "LegalExp" || vName == "GTS" || vName == "COISupp" || vName == "COIBuyer") {
                    var vUrl = window.location.origin + "/nsBuyerRegistration/index.html#/ExceptionFlow/" + vName + "/" + oView.getModel("oUserModel").getData().taskId
                } else {
                    var vUrl = window.location.origin + "/nsBuyerRegistration/index.html#/Reviewer/" + vName + "/" + oView.getModel("oUserModel").getData().taskId
                }

                sap.m.URLHelper.redirect(vUrl);
            },
            fnPrintScreen: function () {
                var $domTarget = oView.byId("id_PrintPreview").getContent()[0].getDomRef(),
                    sTargetContent = $domTarget.innerHTML;

                //	var vTitle = this.getResourceText("CalirationStatusTag");
                var printCssUrl = jQuery.sap.getModulePath("com.jabil.surveyform.css", "/style.css");
                var link = '<link rel="stylesheet" href="' + printCssUrl + '" type="text/css" />';
                var sURI = sap.ui.core.IconPool.getIconURI("accept");
                var url = sap.ui.require.toUrl(sURI);
                link = link + '<link rel="stylesheet" href="' + url + '" />';

                //		var hContent = '<html><head>' + link + '</head><body><img src="' + sMylanLogoUrl + '"/><p>' +
                //	this.getResourceText("mylanLogoText") + '</p><h1>' + vTitle + '</h1>';
                var bodyContent = sTargetContent;
                //		var closeContent = "<div style='text-align: end'>" + "</div>" + "</body></html>";
                //	var htmlpage = hContent + bodyContent + closeContent;
                var htmlpage = bodyContent;

                var win = window.open("", "PrintWindow");
                win.document.open();
                win.document.write(htmlpage);
                $.each(document.styleSheets, function (index, oStyleSheet) {
                    if (oStyleSheet.href) {
                        link = document.createElement("link");
                        link.type = oStyleSheet.type;
                        link.rel = "stylesheet";
                        link.href = oStyleSheet.href;
                        try {
                            win.document.head.appendChild(link);
                        } catch (e) {
                            win.document.getElementsByTagName("head")[0].innerHTML = win.document.getElementsByTagName("head")[0].innerHTML + link.outerHTML;
                        }
                    }
                });
                setTimeout(function () {
                    win.print();
                    win.document.close();
                    win.close();

                }, 2000);

            },

            fnCopyContactData: function (oEvent) {
                var sPath = oEvent.getSource().getParent().getBindingContext("oLookUpModel").sPath;
                copiedData = oView.getModel("oLookUpModel").getProperty(sPath);
                this.getOwnerComponent().getModel("oVisibilityModel").getData().copiedData = false;
                this.getOwnerComponent().getModel("oVisibilityModel").getData().pasteData = true;
                this.getOwnerComponent().getModel("oVisibilityModel").refresh();
            },
            fnPasteContactData: function (oEvent) {
                this.emailValidResult = false;
                var sPath = oEvent.getSource().getParent().getBindingContext("oLookUpModel").sPath;
                var index = sPath.replace("/tabledata/", "");
                if (copiedData) {
                    oView.getModel("oLookUpModel").setProperty(sPath + "/email", copiedData.email);
                    oView.getModel("oLookUpModel").setProperty(sPath + "/firstName", copiedData.firstName);
                    oView.getModel("oLookUpModel").setProperty(sPath + "/lastName", copiedData.lastName);
                    oView.getModel("oLookUpModel").setProperty(sPath + "/jobTitle", copiedData.jobTitle);
                    oView.getModel("oLookUpModel").setProperty(sPath + "/countryContactCode", copiedData.countryContactCode);
                    oView.getModel("oLookUpModel").setProperty(sPath + "/contact", copiedData.contact);
                    oView.getModel("oLookUpModel").setProperty(sPath + "/extension", copiedData.extension);
                }
                var item = oView.byId("contTable").getItems()[index].getAggregation("cells");
                if (item) {
                    item[1].setValueState("None");
                    item[1].setValueStateText("");
                    item[2].setValueState("None");
                    item[2].setValueStateText("");
                    item[3].setValueState("None");
                    item[3].setValueStateText("");
                    item[4].setValueState("None");
                    item[4].setValueStateText("");
                    item[5].mAggregations.items[0].setValueState("None");
                    item[5].mAggregations.items[0].setValueStateText("");
                    item[5].mAggregations.items[1].setValueState("None");
                    item[5].mAggregations.items[1].setValueStateText("");
                }
                this.getOwnerComponent().getModel("oVisibilityModel").getData().copiedData = true;
                this.getOwnerComponent().getModel("oVisibilityModel").getData().pasteData = false;
                this.getOwnerComponent().getModel("oVisibilityModel").refresh();
                oView.getModel("oLookUpModel").refresh();
            },
            fnCopyAllContactData: function (oEvent) {
                this.emailValidResult = false;
                var oItem = oView.getModel("oLookUpModel").getData().tabledata;
                $.each(oItem, function (index, row) {
                    row.email = copiedData.email;
                    row.firstName = copiedData.firstName;
                    row.lastName = copiedData.lastName;
                    row.jobTitle = copiedData.jobTitle;
                    row.countryContactCode = copiedData.countryContactCode;
                    row.contact = copiedData.contact;
                    row.extension = copiedData.extension;
                });
                this.getOwnerComponent().getModel("oVisibilityModel").getData().copiedData = true;
                this.getOwnerComponent().getModel("oVisibilityModel").getData().pasteData = false;
                this.getOwnerComponent().getModel("oVisibilityModel").refresh();
                oView.getModel("oLookUpModel").refresh();
                $.each(oItem, function (index, row) {
                    var item = oView.byId("contTable").getItems()[index].getAggregation("cells");
                    if (row.email) {
                        item[1].setValueState("None");
                        item[1].setValueStateText("");
                    } if (row.firstName) {
                        item[2].setValueState("None");
                        item[2].setValueStateText("");
                    }
                    if (row.lastName) {
                        item[3].setValueState("None");
                        item[3].setValueStateText("");
                    }
                    if (row.jobTitle) {
                        item[4].setValueState("None");
                        item[4].setValueStateText("");
                    }
                    if (row.countryContactCode) {
                        item[5].mAggregations.items[0].setValueState("None");
                        item[5].mAggregations.items[0].setValueStateText("");

                    }
                    if (row.contact) {
                        item[5].mAggregations.items[1].setValueState("None");
                        item[5].mAggregations.items[1].setValueStateText("");

                    }
                });
            },
            fnSelectionChange: function (oEvent) {
                var selPath = oEvent.getSource().getParent().getButtons()[0].getBindingPath("selected");
                oView.getModel("oDataModel").setProperty(selPath, false);
                oView.getModel("oDataModel").refresh(true);
            },
            fnSelectionChangeDiversity: function (oEvent) {
                var selPath = oEvent.getSource().getParent().getButtons()[0].getBindingPath("selected");
                oView.getModel("companyInfoModel").setProperty(selPath, false);
                oView.getModel("companyInfoModel").refresh(true);
            }
        });
    });

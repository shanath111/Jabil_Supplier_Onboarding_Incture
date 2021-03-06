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
    function (BaseController, JSONModel, MessageBox, formatter, BusyDialog, oBusyDialogSearching, Fragment) {

        "use strict";
        var oBusyDialog, oBusyDialogFile, oView, oi18n, vAppName, copiedData, listenFirst;
        return BaseController.extend("com.jabil.surveyform.controller.BankInfoRemit", {
            formatter: formatter,
            onInit: function () {
                oBusyDialogFile = new sap.m.BusyDialog({ text: "Uploading File" });
                oBusyDialog = new sap.m.BusyDialog({ text: "Posting data" });
                oBusyDialogSearching = new sap.m.BusyDialog({ text: "Searching" });
                oView = this.getView();
                oi18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                var that = this;
                this._router = this.getOwnerComponent().getRouter();
                this._router.getRoute("BankInfoRemit").attachPatternMatched(this._fnHandleRouteMatched, this);
            },
            onAfterRendering: function () {
                var bID = oView.byId('bankAccNumConfirmField').sId;
                $('#' + bID).bind("cut copy paste", function (e) {
                    e.preventDefault();
                    return false;
                });
                var cID = oView.byId('ibanConfirmField').sId;
                $('#' + cID).bind("cut copy paste", function (e) {
                    e.preventDefault();
                    return false;
                });
            },
            fnRadioButtonChange: function () {
                var that = this;
                if (vAppName == "SupplierFinanceRemit") {
                    if (this.getView().byId("isSCFC1").getSelectedIndex() == 0) {
                        that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceSaveVis = true;
                    } else {
                        that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceSaveVis = false;
                    }
                } else {
                    if (this.getView().byId("isSCFC1").getSelectedIndex() == 0) {
                        that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceReviewVis = true;
                    } else {
                        that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceReviewVis = false;
                    }
                }
                oView.getModel("oVisibilityModel").refresh();
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

            fnLoadTaskClaimed: function (vTaskId) {
                var oModel = new JSONModel();
                var that = this;
                var sUrl = "/comjabilsurveyform/WorkboxJavaService/inbox/isClaimed?eventId=" + vTaskId;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        //  oEvent.getSource().getData().isTaskCompleted = false;
                        if (oEvent.getSource().getData().isTaskCompleted == true) {
                            that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReviewEdit = false
                            that.getOwnerComponent().getModel("oVisibilityModel").getData()._CompletedTask = false
                        } else {
                            that.getOwnerComponent().getModel("oVisibilityModel").getData()._CompletedTask = true
                        }
                        that.getOwnerComponent().getModel("oVisibilityModel").getData().taskName = oEvent.getSource().getData().taskName;
                    }
                    that.getOwnerComponent().getModel("oVisibilityModel").refresh();
                });
            },
            _fnHandleRouteMatched: function (oEvent) {
                var that = this;
                this._fnLoadCountry();
                this._fnLoadCurrency();
                this._fnLoadCountryContactCode();
                this.getUser();
                var taskId = oEvent.getParameter("arguments").contextPath;

                vAppName = oEvent.getParameter("arguments").Name;
                var oContactInfo = {
                    "firstName": "",
                    "lastName": "",
                    "jobTitle": "",
                    "email": "",
                    "contact": "",
                    "extension": "",
                    "mobile": "",

                };
                var oJsonContact = new sap.ui.model.json.JSONModel();
                oJsonContact.setData(oContactInfo);
                oView.setModel(oJsonContact, "JMTarnsfer");
                if (oView.getModel("oUserModel").getData().language == undefined || oView.getModel("oUserModel").getData().language == 'en' || oView.getModel("oUserModel").getData().language == 'en-US' || oView.getModel("oUserModel").getData().language.includes("en")) {
                    that.getView().getModel("oVisibilityModel").getData().isdefaultLan = true;
                } else {
                    that.getView().getModel("oVisibilityModel").getData().isdefaultLan = false;
                }
                that.getView().getModel("oVisibilityModel").refresh();
                oView.getModel("JMTarnsfer").refresh();
                var oDeferred = $.Deferred();

                if (taskId !== "") {
                    this.getTaskDetails(taskId, oDeferred, oi18n);
                }
                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                this.getView().setModel(oi18n_En, "oi18n_En");

                oDeferred.done(function () {
                    if (oView.getModel("oUserModel").getData().caseId !== "") {
                        var sUrl = "/comjabilsurveyform/plcm_portal_services/supplier/read/" + oView.getModel("oUserModel").getData().caseId;
                        var oModel = new JSONModel();
                        oModel.loadData(sUrl);
                        oModel.attachRequestCompleted(function onCompleted(oEvent) {
                            if (oEvent.getParameter("success")) {
                                if (oEvent.getSource().oData.businessPartnerId !== "") {
                                    oView.getModel("oDataModel").setData(oEvent.getSource().oData);
                                    oView.getModel("oDataModel").refresh();
                                    that._fnLoadBankRegion(oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry);
                                    that.fnActivateBankScreen();
                                    that._fnReadDocumentList(oEvent.getSource().oData.caseId, that);
                                }
                                if (vAppName == "SupplierFinanceRemit") {
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReviewEdit = true;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceSaveVis = true;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceReviewVis = false;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceSaveVis1 = true;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceReviewVis1 = false;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SupplierBankEdit = false;
                                } else {
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._FinanceReviewEdit = false;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceReviewVis = true;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceSaveVis = false;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceReviewVis1 = true;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData().FinanceSaveVis1 = false;
                                    that.getOwnerComponent().getModel("oVisibilityModel").getData()._SupplierBankEdit = false;
                                }
                                that.fnLoadTaskClaimed(taskId);
                                that.getOwnerComponent().getModel("oVisibilityModel").refresh();

                            }

                            else {
                                var sErMsg = oEvent.getParameter("errorobject").responseText;
                                MessageBox.show(sErMsg, {
                                    icon: MessageBox.Icon.ERROR,
                                    title: oi18n.getText("error")
                                });
                            }

                        }
                        );
                    }
                });
                var bankSearchData = {
                    "selectedBankItem": "",
                    "isManualEntry": false,
                    "banksearchParam": {
                        "bankBranch": "",
                        "bankCity": "",
                        "bankCode": "",
                        "bankCountry": "",
                        "bankName": ""
                    }

                };
                var obankSearchModel = new sap.ui.model.json.JSONModel();
                obankSearchModel.setData(bankSearchData);
                oView.setModel(obankSearchModel, "bankSearchModel");
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
            fnSaveAsDraft: function () {
                var that = this;
                oBusyDialog.open();
                var oPayloadSupp = that.getView().getModel("oDataModel").getData();
                oPayloadSupp.userUpdated = oView.getModel("oUserModel").getData().user.givenName;
                var sUrl1 = "/comjabilsurveyform/plcm_portal_services/supplier/update";
                var oModelSave = new JSONModel();
                oModelSave.loadData(sUrl1, JSON.stringify(oPayloadSupp), true, "PUT", false, true, {
                    "Content-Type": "application/json"
                });
                oModelSave.attachRequestCompleted(function (oEvent) {

                    if (oEvent.getParameter("success")) {
                        var temp = {};
                        var oi18n_En = that.getOwnerComponent().getModel("oi18n_En"),
                            isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan,
                            vMessage;

                        if (isDefaultLan) {
                            vMessage = oi18n_En.getProperty("SaveAsDraftSuccessFinance");

                        } else {
                            vMessage = oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.SaveAsDraftSuccessFinance + "\n" + "/ " + that.getView().getModel("i18n").getProperty("SaveAsDraftSuccessFinance");
                        }

                        temp.Message = vMessage;
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
                        var eMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(eMsg, {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });
                    }
                });
            },
            fnSubmit: function () {


                var that = this;
                var vError = this._fnValidateBankInfo();
                if (!vError) {
                    var findBankDoc = this.getView().getModel("oAttachmentList").getProperty("/0/" + "bankDArrayR").findIndex(function (doc) {
                        return doc.docFormType !== "Indemnity Letter";
                    });
                    if (findBankDoc == -1) {
                        //  if (that.getView().getModel("oAttachmentList").getData()[0].bankDArray.length == 0) {
                        var oi18n_En = this.getOwnerComponent().getModel("oi18n_En"),
                            isDefaultLan = this.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                        if (isDefaultLan) {
                            sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("PleaseProvideAttachment")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        } else {
                            sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.PleaseProvideAttachment + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("PleaseProvideAttachment")), {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                contentWidth: "30%",
                                styleClass: "sapUiSizeCompact"
                            });
                        }




                        return;

                    } else {
                        if (oView.getModel("oUserModel").getData().bankCompName != oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].benefAccHolderName) {

                            var findDomesticDoc = this.getView().getModel("oAttachmentList").getProperty("/0/" + "bankDArrayR").findIndex(function (doc) {
                                return doc.docFormType == "Indemnity Letter";
                            });
                            if (findDomesticDoc == -1) {

                                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En"),
                                    isDefaultLan = this.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                                if (isDefaultLan) {
                                    sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("IdemnityMsg")), {
                                        icon: sap.m.MessageBox.Icon.ERROR,
                                        title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                        contentWidth: "30%",
                                        styleClass: "sapUiSizeCompact"
                                    });
                                } else {
                                    sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.IdemnityMsg + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("IdemnityMsg")), {
                                        icon: sap.m.MessageBox.Icon.ERROR,
                                        title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                                        contentWidth: "30%",
                                        styleClass: "sapUiSizeCompact"
                                    });
                                }
                                return;
                            }

                        }
                    }
                    var that = this;
                    oBusyDialog.open();
                    var vActionTxt = "";
                    var vBankProvide;
                    if (this.getView().byId("isSCFC1").getSelectedIndex() == 0) {
                        vActionTxt = "provided";
                        vBankProvide = true;
                    } else {
                        vActionTxt = "forwarded";
                        vBankProvide = false;
                    }

                    var oPayloadSupp = that.getView().getModel("oDataModel").getData();
                    oPayloadSupp.userUpdated = oView.getModel("oUserModel").getData().user.givenName;
                    var sUrl1 = "/comjabilsurveyform/plcm_portal_services/supplier/update";
                    var oModelSave = new JSONModel();
                    oModelSave.loadData(sUrl1, JSON.stringify(oPayloadSupp), true, "PUT", false, true, {
                        "Content-Type": "application/json"
                    });
                    oModelSave.attachRequestCompleted(function (oEvent) {

                        if (oEvent.getParameter("success")) {
                            var oModel = new JSONModel();
                            var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskComplete"
                            var vBnkaPayload = {
                                "bankBranch": "",
                                "bankCountry": "",
                                "bankName": "",
                                "bankNumber": "",
                                "swiftCode": ""
                            };

                            var oPayload = {
                                "context": {
                                    "bpNumber": oView.getModel("oUserModel").getData().bpNumber,
                                    "caseId": oView.getModel("oUserModel").getData().caseId,
                                    "financeContact1Action": vActionTxt,
                                    "financeProviderAction": "EULA_accepted",
                                    "bpAuditWfDto": {
                                        "caseId": oView.getModel("oUserModel").getData().caseId,
                                        "companyContactPreviousJabilEmployee": oView.getModel("oDataModel").getData().comComplianceDto.companyContactWithPreviouseJabilEmp,
                                        "companyRelationWithJabilEmployee": oView.getModel("oDataModel").getData().comComplianceDto.companyRelationWithJabilEmp,
                                        "isEntityManagedByGovt": oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovt,
                                        "isEntityManagedByGovtFamily": oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityManagedByGovtFamily,
                                        "isEntityRegInCisnk": oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntityRegInCISNK,
                                        "isEntitySdnList": oView.getModel("oDataModel").getData().ownerShipInfoDto.isEntitySDNList,
                                        "orgConnectToJabilSystemOrNetworkFlag": oView.getModel("oDataModel").getData().itCyberDto.orgConnectToJabilSystem,
                                        "orgMaintainProcessDataFromJabilForBusinessActivityFlag": oView.getModel("oDataModel").getData().itCyberDto.orgMaintainProcessDataFromJabil,
                                        "isBankProvided": oView.getModel("oDataModel").getData().bankDto.isBankProvided,
                                        "bankCountryKey": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry,
                                        "bankName": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName,
                                        "bankAddress": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAddress,
                                        "bankCity": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCity,
                                        "bankState": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankState,
                                        "bankBranch": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch,
                                        "bankAccountNumber": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum,
                                        "benfAccHolderName": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].benefAccHolderName,
                                        "refBankDetails": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].refBankDetails,
                                        "swiftCode": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode,
                                        "ibanNum": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].ibanNum,
                                        "bankNumber": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber,
                                        "instructionKey": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].instructionKey,
                                        "partnerBankType": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].partnerBankType,
                                        "isIntermediateBankProvided": oView.getModel("oDataModel").getData().bankDto.isIntermediateBankProvided ? true : false,
                                        "financeContact1": oView.getModel("oDataModel").getData().bankDto.isBankProvided ? "" : oView.getModel("oDataModel").getData().bankDto.financeContact1.email,
                                        "financeContact2": oView.getModel("oDataModel").getData().bankDto.financeContact2.email
                                    },
                                    "ipAuditWfDto": {
                                        "bankAccountNumber": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum,
                                        "bankAddress": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAddress,
                                        "bankBranch": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch,
                                        "bankCity": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCity,
                                        "bankCountryKey": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCountry,
                                        "bankName": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankName,
                                        "bankNumber": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankNumber,
                                        "bankState": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankState,
                                        "benfAccHolderName": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].benefAccHolderName,
                                        "caseId": oView.getModel("oUserModel").getData().caseId,
                                        "financeContact1": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.isBankProvided ? "" : oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.financeContact1.email,
                                        "financeContact2": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.financeContact2.email,
                                        "ibanNum": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum,
                                        "instructionKey": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].instructionKey,
                                        "isBankProvided":oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.isBankProvided,
                                        "partnerBankType": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].partnerBankType,
                                        "refBankDetails": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].refBankDetails,
                                        "swiftCode": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].swiftCode,
                                        "ipAuditwfId": ""
                                    }

                                    // "financeContact1": {
                                    //     "firstName": "",
                                    //     "lastName": "",
                                    //     "email": "",
                                    // }
                                    // "bnkaPayload": vBnkaPayload,
                                    // "bankBranch": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch,
                                    // "bankCountry": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry,
                                    // "bankName": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName,
                                    // "bankNumber": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber,
                                    // "swiftCode": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode
                                },
                                "status": "",
                                "taskId": oView.getModel("oUserModel").getData().taskId
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
                                    var oi18n_En = that.getOwnerComponent().getModel("oi18n_En"),
                                        isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan,
                                        vMessage;

                                    if (isDefaultLan) {
                                        vMessage = oi18n_En.getProperty("EulaSubSuccess");

                                    } else {
                                        vMessage = oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.EulaSubSuccess + "\n" + "/ " + that.getView().getModel("i18n").getProperty("EulaSubSuccess");
                                    }

                                    temp.Message = vMessage;


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


                        } else {
                            oBusyDialog.close();
                            var eMsg = oEvent.getParameter("errorobject").responseText;
                            MessageBox.show(eMsg, {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: oi18n.getText("error")
                            });
                        }
                    });
                } else {


                    var oi18n_En = this.getOwnerComponent().getModel("oi18n_En"),
                        isDefaultLan = this.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
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
            },
            fnTransfer: function () {
                var that = this;
                var iError = false;
                if (!oView.getModel("JMTarnsfer").getData().firstName) {
                    oView.getModel("oErrorModel").getData().finance1FNameE = "Error";
                    oView.getModel("oErrorModel").getData().finance1FNameM = oi18n.getText("mandatoryFName");

                    iError = true;
                } if (!oView.getModel("JMTarnsfer").getData().lastName) {
                    oView.getModel("oErrorModel").getData().finance1LNameE = "Error";
                    oView.getModel("oErrorModel").getData().finance1LNameM = oi18n.getText("mandatoryLName");

                    iError = true;
                }
                if (!oView.getModel("JMTarnsfer").getData().email) {

                    oView.getModel("oErrorModel").getData().finance1EmailE = "Error";
                    oView.getModel("oErrorModel").getData().finance1EmailM = oi18n.getText("mandatoryEmail");

                    iError = true;
                } if (!oView.getModel("JMTarnsfer").getData().contact) {
                    oView.getModel("oErrorModel").getData().finance1ContE = "Error";
                    oView.getModel("oErrorModel").getData().finance1ContM = oi18n.getText("mandatoryContact");

                    iError = true;
                }
                if (!oView.getModel("JMTarnsfer").getData().mobile) {
                    oView.getModel("oErrorModel").getData().finance1MobE = "Error";
                    oView.getModel("oErrorModel").getData().finance1MobM = oi18n.getText("mandatoryMContact");

                    iError = true;
                }
                if (!oView.getModel("JMTarnsfer").getData().countryContactCode) {
                    oView.getModel("oErrorModel").getData().finance1CountryContCodeE = "Error";
                    oView.getModel("oErrorModel").getData().finance1CountryContCodeM = oi18n.getText("mandatoryCountryConatactCode");

                    iError = true;
                }
                if (!oView.getModel("JMTarnsfer").getData().mobilecountryContactCode) {
                    oView.getModel("oErrorModel").getData().finance1mobileCountryContCodeE = "Error";
                    oView.getModel("oErrorModel").getData().finance1mobileCountryContCodeM = oi18n.getText("mandatoryCountryConatactCode");

                    iError = true;
                }
                if (oView.getModel("JMTarnsfer").getData().firstName && oView.getModel("JMTarnsfer").getData().firstName.length > 34) {


                    iError = true;
                }
                if (oView.getModel("JMTarnsfer").getData().lastName && oView.getModel("JMTarnsfer").getData().lastName.length > 34) {

                    iError = true;
                }
                if (oView.getModel("JMTarnsfer").getData().email.length && oView.getModel("JMTarnsfer").getData().email.length > 241) {
                    iError = true;
                }
                if (oView.getModel("JMTarnsfer").getData().contact && oView.getModel("JMTarnsfer").getData().contact.length > 30) {

                    iError = true;
                }
                if (oView.getModel("JMTarnsfer").getData().mobile && oView.getModel("JMTarnsfer").getData().mobile.length > 30) {

                    iError = true;
                }
                if (oView.getModel("JMTarnsfer").getData().extension && oView.getModel("JMTarnsfer").getData().extension.length > 3) {
                    iError = true;
                }
                oView.getModel("oErrorModel").refresh();
                if (!iError) {
                    if (oView.getModel("oUserModel").getData().user.email.toUpperCase() == oView.getModel("JMTarnsfer").getData().email.toUpperCase()) {
                        var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                        sap.m.MessageBox.alert(that.getView().getModel("i18n").getResourceBundle().getText("CannaotUseSameMail"), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                        return;
                    }
                    var oModel = new JSONModel();
                    var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskComplete"
                    oBusyDialog.open();
                    if (vAppName == "SupplierFinanceRemit") {
                        var oPayload = {
                            "context": {
                                "bpNumber": oView.getModel("oUserModel").getData().bpNumber,
                                "caseId": oView.getModel("oUserModel").getData().caseId,
                                "financeContact1Action": "forwarded",
                                "financeProviderAction": "EULA_accepted",
                                "financeContact1": {
                                    "firstName": oView.getModel("JMTarnsfer").getData().firstName,
                                    "lastName": oView.getModel("JMTarnsfer").getData().lastName,
                                    "email": oView.getModel("JMTarnsfer").getData().email,
                                }
                            },
                            "status": "",
                            "taskId": oView.getModel("oUserModel").getData().taskId
                        }
                    } else {
                        var oPayload = {
                            "context": {
                                "bpNumber": oView.getModel("oUserModel").getData().bpNumber,
                                "caseId": oView.getModel("oUserModel").getData().caseId,
                                "financeContact2Action": "forwarded",
                                "financeContact2": {
                                    "firstName": oView.getModel("JMTarnsfer").getData().firstName,
                                    "lastName": oView.getModel("JMTarnsfer").getData().lastName,
                                    "email": oView.getModel("JMTarnsfer").getData().email,
                                }
                            },
                            "status": "",
                            "taskId": oView.getModel("oUserModel").getData().taskId
                        }
                    }


                    oModel.loadData(sUrl, JSON.stringify(
                        oPayload
                    ), true, "POST", false, true, {
                        "Content-Type": "application/json"
                    });
                    oModel.attachRequestCompleted(function onCompleted(oEvent) {
                        if (oEvent.getParameter("success")) {
                            oBusyDialog.close();
                            var temp = {};
                            var oi18n_En = that.getOwnerComponent().getModel("oi18n_En"),
                                isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan,
                                vMessage;

                            if (isDefaultLan) {
                                vMessage = oi18n_En.getProperty("EulaSubSuccess");

                            } else {
                                vMessage = oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.EulaSubSuccess + "\n" + "/ " + that.getView().getModel("i18n").getProperty("EulaSubSuccess");
                            }

                            temp.Message = vMessage;

                            // temp.Message = that.getOwnerComponent().getModel("i18n").getProperty("EulaSubSuccess");
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
                }

            },


            _fnValidateBankInfo: function (oEvent) {
                var bankFields = this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation;
                var iError = false;
                var spaceRegex = /^\s+$/;
                var visiblility = this.getOwnerComponent().getModel("oVisibilityModel").getData();
                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En"),
                    isDefaultLan = this.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                var that = this;


                if (visiblility.sc) {
                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCountry) {
                        oView.getModel("oErrorModel").getData().bankCountryE = "Error";
                        oView.getModel("oErrorModel").getData().bankCountryM = oi18n.getText("mandatoryCountry");

                        iError = true;
                    }

                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankName && bankFields.bankName) {
                        oView.getModel("oErrorModel").getData().bankNameE = "Error";
                        oView.getModel("oErrorModel").getData().bankNameM = oi18n.getText("mandatoryName");

                        iError = true;
                    }

                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAddress && bankFields.bankStreet) {
                        oView.getModel("oErrorModel").getData().bankAddrE = "Error";
                        oView.getModel("oErrorModel").getData().bankAddrM = oi18n.getText("mandatoryAddr1");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCity && bankFields.bankCity) {
                        oView.getModel("oErrorModel").getData().bankCityE = "Error";
                        oView.getModel("oErrorModel").getData().bankCityM = oi18n.getText("mandatoryCity");

                        iError = true;
                    }

                    if ((!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum && bankFields.benificiaryAccountNumber) || spaceRegex.test(oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum)) {
                        oView.getModel("oErrorModel").getData().bankAccNumE = "Error";
                        oView.getModel("oErrorModel").getData().bankAccNumM = oi18n.getText("mandatoryAccNum");

                        iError = true;
                    }

                    if ((!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNumConfirm && bankFields.benificiaryAccountNumber) || spaceRegex.test(oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNumConfirm)) {
                        oView.getModel("oErrorModel").getData().bankAccNumConfirmE = "Error";
                        oView.getModel("oErrorModel").getData().bankAccNumConfirmM = oi18n.getText("mandatoryAccNumConfirm");

                        iError = true;
                    } else if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNumConfirm) {
                        if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNumConfirm !== oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum) {
                            oView.getModel("oErrorModel").getData().bankAccNumConfirmE = "Error";
                            oView.getModel("oErrorModel").getData().bankAccNumConfirmM = oi18n.getText("identicalValuesRequiredAccNum");

                            iError = true;
                        }
                    }

                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].benefAccHolderName && bankFields.benificiaryAccHolderName) {
                        oView.getModel("oErrorModel").getData().benifAccHNameE = "Error";
                        oView.getModel("oErrorModel").getData().benifAccHNameM = oi18n.getText("mandatoryHolderName");

                        iError = true;
                    }

                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].swiftCode && bankFields.swiftCode) {
                        oView.getModel("oErrorModel").getData().bankSwiftE = "Error";
                        oView.getModel("oErrorModel").getData().bankSwiftM = oi18n.getText("mandatorySwftCd");

                        iError = true;
                    }

                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch && bankFields.bankBranch) {
                        // if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry == "CN" && !oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch) {
                        oView.getModel("oErrorModel").getData().bankBranchE = "Error";
                        oView.getModel("oErrorModel").getData().bankBranchM = oi18n.getText("mandatoryBranch");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].refBankDetails && bankFields.referenceDetails) {
                        oView.getModel("oErrorModel").getData().bankRefE = "Error";
                        oView.getModel("oErrorModel").getData().bankRefM = oi18n.getText("mandatoryRefDet");

                        iError = true;
                    }
                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankNumber && bankFields.bankNumber) {
                        oView.getModel("oErrorModel").getData().bankNumE = "Error";
                        oView.getModel("oErrorModel").getData().bankNumM = oi18n.getText("mandatoryBankNum");

                        iError = true;
                    }
                    if ((!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNumConfirm && bankFields.iban) || spaceRegex.test(oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNumConfirm)) {

                        oView.getModel("oErrorModel").getData().ibanConfirmE = "Error";
                        oView.getModel("oErrorModel").getData().ibanConfirmM = oi18n.getText("mandatoryIbanConfirm");
                        iError = true;

                    } else if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNumConfirm) {
                        if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNumConfirm !== oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum) {
                            oView.getModel("oErrorModel").getData().ibanConfirmE = "Error";
                            oView.getModel("oErrorModel").getData().ibanConfirmM = oi18n.getText("identicalValuesRequiredIBAN");

                            iError = true;
                        }
                    }
                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].partnerBankType && bankFields.benificiaryAccCurrency) {
                        oView.getModel("oErrorModel").getData().benifAccCurrE = "Error";
                        oView.getModel("oErrorModel").getData().benifAccCurrM = oi18n.getText("mandatoryAccCurr");

                        iError = true;
                    }
                    // if (!oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey && bankFields.bankControlKey) {
                    //     oView.getModel("oErrorModel").getData().bankCtrlKeyE = "Error";
                    //     oView.getModel("oErrorModel").getData().bankCtrlKeyM = oi18n.getText("mandatoryctrlKey");

                    //     iError = true;
                    // }

                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankName && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankName.length > 60) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAddress && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAddress.length > 35) {
                        iError = true;
                    }
                    // if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAccNum.length > 18) {
                    //     iError = true;
                    // }
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].benefAccHolderName && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].benefAccHolderName.length > 60) {
                        iError = true;
                    }
                    // if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode.length > 11) {
                    //     iError = true;
                    // }
                    // if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCode && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCode.length > 4) {
                    //     iError = true;
                    // }
                    if (this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.ibanLength) {
                        if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum.length !== parseInt(this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.ibanLength)) {
                            iError = true;
                        }
                    }
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCity && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCity.length > 35) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankState && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankState.length > 3) {
                        iError = true;
                    }
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch.length > 40) {
                        iError = true;
                    }
                    // if (oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey && oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey.length > 2) {
                    //     iError = true;
                    // }
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].instructionKey && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].instructionKey.length > 3) {
                        iError = true;
                    }
                    // if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.isIntermediateBankProvided) {
                    //     if (that.getView().getModel("oAttachmentList").getData()[0].bankINDArray.length == 0) {
                    //         iError = true;
                    //         oView.byId("fileUploader_BIA").removeStyleClass("attachmentWithoutBorder");
                    //         oView.byId("fileUploader_BIA").addStyleClass("attachmentWithBorder");
                    //     } else {
                    //         oView.byId("fileUploader_BIA").removeStyleClass("attachmentWithBorder");
                    //         oView.byId("fileUploader_BIA").addStyleClass("attachmentWithoutBorder");
                    //     }
                    // }
                }

                oView.getModel("oErrorModel").refresh();
                return iError;
            },

            fnLiveInputAlphaValueChange: function (oEvent) {
                var alphaRegex = /^[A-Za-z]*$/;
                var val = oEvent.getSource().getValue();
                if (oEvent.getSource().getValue()) {
                    if (val.length == oEvent.getSource().getMaxLength()) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("maxLengthExceed"));
                    } else if (!alphaRegex.test(oEvent.getSource().getValue())) {
                        oEvent.getSource().setValue(oEvent.getSource().getValue().slice(0, -1));
                        // var newval = val.substring(0, val.length - 1);
                        // oEvent.getSource().setValue(newval);

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
                    oEvent.getSource().setValue(oEvent.getSource().getValue().replace(/\D+/g, ''));

                }
                else if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                }
            },
            fnOpenBankCommentsApp: function () {
                var temp = {};
                temp.Action = "AP";
                temp.required = false;
                temp.Commentsm = "";
                temp.commentsTxt = "Comments (if any)";
                //  temp.Comments = "";
                temp.Commentse = "None";
                var oJosnComments = new sap.ui.model.json.JSONModel();
                oJosnComments.setData(temp);
                oView.setModel(oJosnComments, "JMBankComments");
                // if (!this.oBankComments) {
                //     this.oBankComments = sap.ui.xmlfragment(
                //         "com.jabil.surveyform.fragments.BankComments", this);
                //     oView.addDependent(this.oBankComments);
                // }

                // this.oBankComments.open();
                this.fnApproveSub("AP");
            },
            fnLiveChangeCmntTxtArea: function () {
                oView.getModel("JMBankComments").getData().Commentse = "None";
                oView.getModel("JMBankComments").refresh();
            },

            fnInputConfirmBankAccNumber: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    if (oEvent.getSource().getValue().length == oEvent.getSource().getMaxLength()) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("maxLengthExceed"));
                    } else if (oEvent.getSource().getValue()) {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }
                }

                var that = this;
                var confirmBankAccNum = oEvent.getSource().getValue();
                var InputBankAccNum = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum;
                if (confirmBankAccNum !== InputBankAccNum) {
                    oView.getModel("oErrorModel").getData().bankAccNumConfirmE = "Error";
                    oView.getModel("oErrorModel").getData().bankAccNumConfirmM = oi18n.getText("identicalValuesRequiredAccNum");
                    oView.getModel("oErrorModel").refresh();
                    // that.emailValidResult = true;
                    // sap.m.MessageBox.alert(oView.getModel("i18n").getResourceBundle().getText("identicalValuesRequired"), {
                    //             icon: sap.m.MessageBox.Icon.ERROR,
                    //             title: oView.getModel("i18n").getResourceBundle().getText("error"),
                    //             contentWidth: "30%",
                    //             styleClass: "sapUiSizeCompact"
                    //         });
                } else {
                    // that.emailValidResult = false;
                }
            },
            fnInputConfirmBankAccNumber1: function (oEvent) {
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
                var bankCountryDesc = formatter.fnFetchDescription(oView.getModel("oLookUpModel").getData().Country, oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCountry);
                if (bankCountryDesc == "Russian Fed.") {
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum) {
                        oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankControlKey = oEvent.getSource().getValue().substring(2, 0);
                    }
                } else if (bankCountryDesc == "Brazil") {
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch.includes("-")) {
                        var bankBranch = oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch;
                        firstDigit = bankBranch.substring(bankBranch.indexOf("-") + 2, bankBranch.indexOf("-") + 1)
                    } else {
                        firstDigit = " ";
                    }
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum.includes("-")) {
                        var bankAccNum = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum;
                        secondDigit = bankAccNum.substring(bankAccNum.indexOf("-") + 2, bankAccNum.indexOf("-") + 1)
                    }
                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch.includes("-") && !oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum.includes("-")) {
                        oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey = "";
                    }
                    else {
                        oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey = firstDigit + secondDigit;
                    }

                }

                var that = this;
                var confirmBankAccNum = oEvent.getSource().getValue();
                var InputBankAccNum = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNumConfirm;
                if (confirmBankAccNum !== InputBankAccNum) {
                    oView.getModel("oErrorModel").getData().bankAccNumConfirmE = "Error";
                    oView.getModel("oErrorModel").getData().bankAccNumConfirmM = oi18n.getText("identicalValuesRequiredAccNum");
                    oView.getModel("oErrorModel").refresh();
                    // that.emailValidResult = true;
                    // sap.m.MessageBox.alert(oView.getModel("i18n").getResourceBundle().getText("identicalValuesRequired"), {
                    //             icon: sap.m.MessageBox.Icon.ERROR,
                    //             title: oView.getModel("i18n").getResourceBundle().getText("error"),
                    //             contentWidth: "30%",
                    //             styleClass: "sapUiSizeCompact"
                    //         });
                } else {
                    // that.emailValidResult = false;
                    oView.getModel("oErrorModel").getData().bankAccNumConfirmE = "None";

                    oView.getModel("oErrorModel").refresh();
                }
            },
            fnInputConfirmIban1: function (oEvent) {
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
                    oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey = "";
                    var digitVal = this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.bankControlKeyDigitsLogic;
                    digitVal = digitVal.split(",");
                    var dlength = digitVal.length;
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum) {
                        for (var i = 0; i < dlength; i++) {
                            oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey + oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum.charAt(digitVal[i] - 1);
                        }
                    }
                }

                var that = this;
                var confirmIBAN = oEvent.getSource().getValue();
                var InputIBAN = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNumConfirm;
                if (confirmIBAN !== InputIBAN) {
                    oView.getModel("oErrorModel").getData().ibanConfirmE = "Error";
                    oView.getModel("oErrorModel").getData().ibanConfirmM = oi18n.getText("identicalValuesRequiredIBAN");
                    oView.getModel("oErrorModel").refresh();
                    // that.emailValidResult = true;
                    // sap.m.MessageBox.alert(oView.getModel("i18n").getResourceBundle().getText("identicalValuesRequired"), {
                    //             icon: sap.m.MessageBox.Icon.ERROR,
                    //             title: oView.getModel("i18n").getResourceBundle().getText("error"),
                    //             contentWidth: "30%",
                    //             styleClass: "sapUiSizeCompact"
                    //         });
                } else {
                    // that.emailValidResult = false;
                    oView.getModel("oErrorModel").getData().ibanConfirmE = "None";
                    //   oView.getModel("oErrorModel").getData().ibanConfirmM = oi18n.getText("identicalValuesRequiredIBAN");
                    oView.getModel("oErrorModel").refresh();
                }
            },
            fnInputConfirmIban: function (oEvent) {
                if (oEvent.getSource().getValue()) {

                    if (oEvent.getSource().getMaxLength() && oEvent.getSource().getValue().length !== oEvent.getSource().getMaxLength()) {
                        oEvent.getSource().setValueState("Error");
                        oEvent.getSource().setValueStateText(oi18n.getText("exactLengthMessage") + " " + this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.ibanLength + " " + oi18n.getText("characters"));
                    } else if (oEvent.getSource().getValue()) {
                        oEvent.getSource().setValueState("None");
                        oEvent.getSource().setValueStateText("");
                    }


                }

                var that = this;
                var confirmIBAN = oEvent.getSource().getValue();
                var InputIBAN = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum;
                if (confirmIBAN !== InputIBAN) {
                    oView.getModel("oErrorModel").getData().ibanConfirmE = "Error";
                    oView.getModel("oErrorModel").getData().ibanConfirmM = oi18n.getText("identicalValuesRequiredIBAN");
                    oView.getModel("oErrorModel").refresh();
                    // that.emailValidResult = true;
                    // sap.m.MessageBox.alert(oView.getModel("i18n").getResourceBundle().getText("identicalValuesRequired"), {
                    //             icon: sap.m.MessageBox.Icon.ERROR,
                    //             title: oView.getModel("i18n").getResourceBundle().getText("error"),
                    //             contentWidth: "30%",
                    //             styleClass: "sapUiSizeCompact"
                    //         });
                } else {
                    // that.emailValidResult = false;
                }
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
                if (oView.getModel("JMBankComments").getData().Action == "RJ") {
                    if (oView.getModel("JMBankComments").getData().Comments) {
                        this.fnApproveSub("RJ");
                        this.oBankComments.close();
                    } else {
                        oView.getModel("JMBankComments").getData().Commentse = "Error";
                        oView.getModel("JMBankComments").getData().Commentsm = oi18n.getText("EnterCommentsTxt");

                        oView.getModel("JMBankComments").refresh();
                    }
                } else {
                    this.fnApproveSub("AP");
                    this.oBankComments.close();
                }
            },

            fnApproveSub: function (vBtn) {
                var that = this;
                var vConfirmTxt, vAprActn, vSccuessTxt;
                if (vBtn == "AP") {
                    vConfirmTxt = this.getOwnerComponent().getModel("i18n").getProperty("EulaSubConfirm");
                    var oi18n_En = that.getOwnerComponent().getModel("oi18n_En"),
                        isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan,
                        vMessage;

                    if (isDefaultLan) {
                        vMessage = oi18n_En.getProperty("EulaSubSuccess");

                    } else {
                        vMessage = oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.EulaSubSuccess + "\n" + "/ " + that.getView().getModel("i18n").getProperty("EulaSubSuccess");
                    }

                    vSccuessTxt = vMessage;
                    //  vSccuessTxt = this.getOwnerComponent().getModel("i18n").getProperty("EulaSubSuccess");


                    vAprActn = true;
                } else {
                    vConfirmTxt = this.getOwnerComponent().getModel("i18n").getProperty("EulaRejConfirm");

                    var oi18n_En = that.getOwnerComponent().getModel("oi18n_En"),
                        isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan,
                        vMessage;

                    if (isDefaultLan) {
                        vMessage = oi18n_En.getProperty("EulaRejSuccess");

                    } else {
                        vMessage = oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.EulaRejSuccess + "\n" + "/ " + that.getView().getModel("i18n").getProperty("EulaRejSuccess");
                    }

                    vSccuessTxt = vMessage;
                    // vSccuessTxt = this.getOwnerComponent().getModel("i18n").getProperty("EulaRejSuccess");
                    vAprActn = false;
                }
                // MessageBox.confirm(vConfirmTxt, {
                //     icon: MessageBox.Icon.Confirmation,
                //     title: "Confirmation",
                //     actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                //     emphasizedAction: MessageBox.Action.YES,
                //     onClose: function (oAction) {
                //         if (oAction == "YES") {
                oBusyDialog.open();

                var vActn = "";
                if (vAprActn) {
                    vActn = "approved";
                } else {
                    vActn = "rejected";
                }
                var vCommentsActn;
                if (vAprActn) {
                    vCommentsActn = "remediate";
                } else {
                    vCommentsActn = "disqualify";
                }


                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskComplete"
                var vBnkaPayload = {
                    "bankBranch": "",
                    "bankCountry": "",
                    "bankName": "",
                    "bankNumber": "",
                    "swiftCode": ""
                };
                var bankData = that.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation;
                if (bankData.bankKeyVal1 == "bankCountry") {
                    vBnkaPayload.bankCountry = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCountry;
                }
                if (bankData.bankKeyVal2 == "bankNumber") {
                    vBnkaPayload.bankNumber = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankNumber;
                }
                if (bankData.bankKeyVal3 == "swiftCode") {
                    vBnkaPayload.swiftCode = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].swiftCode;
                }
                if (bankData.bankKeyVal4 == "bankName") {
                    vBnkaPayload.bankName = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankName;
                }
                if (bankData.bankKeyVal5 == "bankBranch") {
                    vBnkaPayload.bankBranch = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch;
                }
                var vInterMedbank;
                if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.isIntermediateBankProvided == true) {
                    vInterMedbank = true;
                } else {
                    vInterMedbank = false;
                }
                var vBankProvide;
                if (this.getView().byId("isSCFC1").getSelectedIndex() == 0) {
                  
                    vBankProvide = true;
                } else {
                  
                    vBankProvide = false;
                }
                var oPayload = {
                    "context": {
                        "bpNumber": oView.getModel("oUserModel").getData().bpNumber,
                        "caseId": oView.getModel("oUserModel").getData().caseId,
                        "financeContact2Action": vActn,
                        "financeReviewerAction": "EULA_accepted",
                        "bank_details_provider_comment": oView.getModel("JMBankComments").getData().Comments,
                        "bnkaPayload": vBnkaPayload,
                        "isIntermediateBankProvided": vInterMedbank,
                        "ipAuditWfDto": {
                            "bankAccountNumber": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum,
                            "bankAddress": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAddress,
                            "bankBranch": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch,
                            "bankCity": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCity,
                            "bankCountryKey": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCountry,
                            "bankName": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankName,
                            "bankNumber": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankNumber,
                            "bankState": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankState,
                            "benfAccHolderName": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].benefAccHolderName,
                            "caseId": oView.getModel("oUserModel").getData().caseId,
                            "financeContact1": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.isBankProvided ? "" : oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.financeContact1.email,
                            "financeContact2": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.financeContact2.email,
                            "ibanNum": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum,
                            "instructionKey": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].instructionKey,
                            "isBankProvided":oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.isBankProvided,
                            "partnerBankType": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].partnerBankType,
                            "refBankDetails": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].refBankDetails,
                            "swiftCode": oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].swiftCode,
                            "ipAuditwfId": ""
                        }
                        // "financeContact2": {
                        //     "firstName": "",
                        //     "lastName": "",
                        //     "email": "",
                        // }
                        // "bankBranch": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch,
                        // "bankCountry": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry,
                        // "bankName": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName,
                        // "bankNumber": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber,
                        // "swiftCode": oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode
                    },
                    "status": "",
                    "taskId": oView.getModel("oUserModel").getData().taskId,
                    "action": vCommentsActn,
                    "comments": oView.getModel("JMBankComments").getData().Comments
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


                //         }
                //     }

                // });

            },
            fnDoneSubmit: function () {
                window.parent.location.reload();
            },
            _fnLoadCountry: function () {
                var oModel = new JSONModel();
                oView.getModel("oLookUpModel").setSizeLimit(10000);
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/countries";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        // oView.getModel("oLookUpModel").setProperty("/CountryOFA", oEvent.getSource().getData());
                        // oView.getModel("oLookUpModel").refresh();
                        oView.getModel("oLookUpModel").setProperty("/SupplierCountry", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                        oView.getModel("oLookUpModel").setProperty("/Country", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
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
                var bankCountryDesc = formatter.fnFetchDescription(oView.getModel("oLookUpModel").getData().Country, oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCountry);
                if (bankCountryDesc == "Russian Fed.") {
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum) {
                        oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey = oEvent.getSource().getValue().substring(2, 0);
                    }
                } else if (bankCountryDesc == "Brazil") {
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch.includes("-")) {
                        var bankBranch = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch;
                        firstDigit = bankBranch.substring(bankBranch.indexOf("-") + 2, bankBranch.indexOf("-") + 1)
                    } else {
                        firstDigit = " ";
                    }
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum.includes("-")) {
                        var bankAccNum = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum;
                        secondDigit = bankAccNum.substring(bankAccNum.indexOf("-") + 2, bankAccNum.indexOf("-") + 1)
                    }
                    if (!oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankBranch.includes("-") && !oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankAccNum.includes("-")) {
                        oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey = "";
                    }
                    else {
                        oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey = firstDigit + secondDigit;
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
                    oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey = "";
                    var digitVal = this.getOwnerComponent().getModel("oVisibilityModel").getData().bankValidation.bankControlKeyDigitsLogic;
                    digitVal = digitVal.split(",");
                    var dlength = digitVal.length;
                    if (oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum) {
                        for (var i = 0; i < dlength; i++) {
                            oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey = oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankControlKey + oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].ibanNum.charAt(digitVal[i] - 1);
                        }
                    }
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
                if (!oEvent.getSource().getBindingPath("items").includes('Currency')) {
                    oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankState = "";
                    oView.getModel("oDataModel").refresh();
                    this._fnLoadBankRegion(oEvent.getSource().getSelectedKey());
                }
                this.fnActivateBankScreen();
            },
            _fnLoadBankRegion: function (vCountry) {
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_reference_data/api/v1/reference-data/regions/?country=" + vCountry;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oLookUpModel").setProperty("/BankRegion", oEvent.getSource().getData());
                        oView.getModel("oLookUpModel").refresh();
                    }
                });
            },

            fnActivateBankScreen: function () {

                var that = this;
                if (oView.getModel("oDataModel").getData().shippingInfoDto.paymentCurrency && oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCountry) {
                    var requestData = {
                        "companyCodeCountry": oView.getModel("oDataModel").getData().shippingInfoDto.comCode,
                        "purchaseOrderCurrency": oView.getModel("oDataModel").getData().comInfoDto.invoiceAddrPaymentCurrency,
                        "supplierBankCountry": formatter.fnFetchDescription(oView.getModel("oLookUpModel").getData().Country, oView.getModel("oDataModel").getData().comInfoDto.invoiceBankDto.bankInfoDto[0].bankCountry)
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
                            bankFields.bankKeyVal4 = oEvent.getSource().oData.bankKeyVal4;
                            bankFields.bankKeyVal5 = oEvent.getSource().oData.bankKeyVal5;
                            that.getOwnerComponent().getModel("oVisibilityModel").refresh();

                        }
                        else {

                        }
                    });
                }
                else {
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
            },
            fnLiveValueChange: function (oEvent) {
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

            },
            fnOnFileUpload: function (oEvt) {
                var that = this;

                var fileUploadId = oEvt.oSource.sId.split("BankInfo--")[1];
                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                var isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;

                // if (!that.oPopup) {
                //     that.oPopup = sap.ui.xmlfragment(
                //         "com.jabil.surveyform.fragments.date", that);
                //     oView.addDependent(that.oPopup);
                // }
                // that.oPopup.open();
                // that.oPopup.attachAfterClose(function (oEvt) {
                //     var expiryDate = this.oPopup.getContent().getAggregation("content")[0].getItems()[0].getAggregation("items")[1].getValue();
                //     var reminderDays = Number(this.oPopup.getContent().getAggregation("content")[0].getItems()[1].getAggregation("items")[1].getValue());
                // @ts-ignore
                //   if (expiryDate && reminderDays) {
                var oFormData = new FormData(),
                    fileUpload = oView.byId(fileUploadId),
                    domRef = fileUpload.getFocusDomRef(),
                    // @ts-ignore
                    file = domRef.files[0],
                    secName = "";

                var _arrayTitle = "";
                var vSectionTitle = "";
                if (fileUploadId == "fileUploader_BIA") {
                    secName = "bankIntermediateInfo";
                    _arrayTitle = "bankINDArray";
                    vSectionTitle = "Intermediary Bank";
                } else {
                    secName = "bankInfo";
                    _arrayTitle = "bankDArray";
                    vSectionTitle = "Payment/Banking Supplier Finance";
                }
                if (file.name.length > 60) {
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
                } else if (Number((file.size * 0.000001).toFixed(1)) > 8) {
                    if (isDefaultLan) {
                        sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("docFileSizeExtendedMessage")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    } else {
                        sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.docFileSizeExtendedMessage + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("docFileSizeExtendedMessage")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    }
                }
                else {
                    jQuery.sap.domById(fileUpload.getId() + "-fu").setAttribute("type", "file");
                    // @ts-ignore
                    oFormData.append("file", jQuery.sap.domById(fileUpload.getId() + "-fu").files[0]);
                    oFormData.append("name", file.name);
                    oFormData.append("folderName", oView.getModel("oUserModel").getData().caseId);
                    oFormData.append("requestId", oView.getModel("oUserModel").getData().caseId);
                    oFormData.append("docInSection", secName);
                    oFormData.append("fileExt", file.name.split(".")[1]);
                    oFormData.append("type", "application/octet-stream");
                    //   oFormData.append("expiryDate", expiryDate);
                    //    oFormData.append("reminderDays", reminderDays);

                    oFormData.append("overwriteFlag", false);
                    oFormData.append("docDescription", secName);
                    oFormData.append("processName", that.getOwnerComponent().getModel("oVisibilityModel").getData().taskName);

                    if (oView.getModel("oUserModel")) {
                        oFormData.append("addedBy", oView.getModel("oUserModel").getData().user.givenName);
                    }
                    var oAttachData = {

                        "fileExt": file.name.split(".")[1],

                        "name": file.name,
                    };



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
                }
                //     this.oPopup.getContent().getAggregation("content")[0].getItems()[0].getAggregation("items")[1].setValue("");
                //     this.oPopup.getContent().getAggregation("content")[0].getItems()[1].getAggregation("items")[1].setValue("");
                // } else {
                //     this.oPopup.getContent().getAggregation("content")[0].getItems()[0].getAggregation("items")[1].setValue("");
                //     this.oPopup.getContent().getAggregation("content")[0].getItems()[1].getAggregation("items")[1].setValue("");
                // }
                // });
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

            fnClose: function () {
                this.oPopup.close();
            },
            _fnReadDocumentList: function (caseId, that) {
                that.getView().getModel("oAttachmentList").getData()[0].bankDArray = [];
                var sUrl = "/comjabilsurveyform/plcm_portal_services/document/findByRequestId/" + caseId;
                $.ajax({
                    url: sUrl,
                    type: 'GET',
                    success: function (data) {
                        $.each(data, function (index, value) {
                            if (value.docInSection == "bankDArrayR") {
                                that.getView().getModel("oAttachmentList").getData()[0].bankDArrayR.push(value);
                            } else if (value.docInSection == "bankIntermediateInfo") {
                                that.getView().getModel("oAttachmentList").getData()[0].bankINDArray.push(value);
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
            fnOpenBankAttachment: function () {
                var that = this;
                this.getOwnerComponent().getModel("oVisibilityModel").getData().bankDocTypeSelected = false;
                this.getOwnerComponent().getModel("oVisibilityModel").refresh();
                if (!that.oPopup) {
                    that.oPopup = sap.ui.xmlfragment(
                        "com.jabil.surveyform.fragments.selectDocTypeBankRemit", that);
                    oView.addDependent(that.oPopup);
                }
                that.oPopup.open();
            },
            fnCloseBank: function () {
                this.oPopup.close();
                this.oPopup.destroy();
                this.oPopup = undefined;
            },
            fnOnFileUploadBPBankRemit: function (oEvt) {
                var that = this;
                var oi18n_En = this.getOwnerComponent().getModel("oi18n_En");
                var isDefaultLan = that.getOwnerComponent().getModel("oVisibilityModel").getData().isdefaultLan;
                var fileUploadId = oEvt.mParameters.id,
                    fileUpload = oEvt.getSource(),
                    domRef = fileUpload.getFocusDomRef(),
                    // @ts-ignore
                    file = domRef.files[0];
                if (file.name.length > 60) {

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
                } else if (Number((file.size * 0.000001).toFixed(1)) > 8) {
                    if (isDefaultLan) {
                        sap.m.MessageBox.alert((that.getView().getModel("i18n").getResourceBundle().getText("docFileSizeExtendedMessage")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    } else {
                        sap.m.MessageBox.alert((oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.docFileNameExtendedMessage + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("docFileSizeExtendedMessage")), {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.error + "/" + that.getView().getModel("i18n").getResourceBundle().getText("error"),
                            contentWidth: "30%",
                            styleClass: "sapUiSizeCompact"
                        });
                    }
                }
                else {
                    var docType = this.oPopup.getContent()[0].getAggregation("items")[0].getAggregation("items")[2].getValue();
                    // @ts-ignore
                    if (docType) {
                        var oFormData = new FormData(),

                            secName = "bankDArrayR";
                        var vSectionTitle = "Payment/Banking Supplier Finance Remmitance";
                        // jQuery.sap.domById(fileUploadId + "-fu").setAttribute("type", "file");
                        // @ts-ignore
                        // oFormData.append("file", jQuery.sap.domById(fileUploadId + "-fu").files[0]);
                        oFormData.append("file", file);
                        oFormData.append("name", file.name);
                        oFormData.append("folderName", oView.getModel("oUserModel").getData().caseId);
                        oFormData.append("requestId", oView.getModel("oUserModel").getData().caseId);
                        oFormData.append("docInSection", secName);
                        oFormData.append("fileExt", file.name.split(".")[1]);
                        oFormData.append("type", "application/octet-stream");
                        // oFormData.append("expiryDate", expiryDate);
                        // oFormData.append("reminderDays", reminderDays);
                        oFormData.append("docFormType", docType);
                        oFormData.append("overwriteFlag", false);
                        oFormData.append("docDescription", vSectionTitle);
                        oFormData.append("processName", that.getOwnerComponent().getModel("oVisibilityModel").getData().taskName);

                        if (oView.getModel("oUserModel")) {
                            oFormData.append("addedBy", oView.getModel("oUserModel").getData().user.givenName);
                        }
                        var oAttachData = {

                            "fileExt": file.name.split(".")[1],

                            "name": file.name,
                            "docFormType": docType
                        };

                        var _arrayTitle = "bankDArrayR";
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
                                oAttachData.docFormType = data.docFormType;
                                that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).push(oAttachData);
                                that.getView().getModel("oAttachmentList").refresh(true);

                                oBusyDialogFile.close();
                            },
                            error: function (data) {
                                var eMsg = data.responseText;
                                if (data.status == 406) {
                                    // var eMsg = "The file already exists. Do you want to overwrite it?"
                                    var msg;
                                    if (isDefaultLan) {
                                        msg = that.getView().getModel("i18n").getResourceBundle().getText("fileAlreadyExists");
                                    } else {
                                        msg = oi18n_En._oResourceBundle.aPropertyFiles[0].mProperties.fileAlreadyExists + "\n" + that.getView().getModel("i18n").getResourceBundle().getText("fileAlreadyExists");
                                    }
                                    MessageBox.confirm(msg, {
                                        icon: MessageBox.Icon.Confirmation,
                                        title: "Confirmation",
                                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                                        emphasizedAction: MessageBox.Action.YES,
                                        onClose: function (oAction) {
                                            if (oAction == "YES") {
                                                oFormData.set("overwriteFlag", true);
                                                //  oFormData.append("deletedBy", oView.getModel("oUserModel").getData().user.givenName);
                                                var index = that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).findIndex(function (docId) { return docId.name === file.name });
                                                if (index !== -1) {
                                                    that.getView().getModel("oAttachmentList").getProperty("/0/" + _arrayTitle).splice(index, 1);
                                                }
                                                //     if(_arrayTitle === "bankINDArray" || _arrayTitle === "bankDArray"){
                                                //         var index = that.getView().getModel("oAttachmentList").getProperty("/0/" + "bankINDArray").findIndex(function (docId) { return docId.name == file.name });
                                                //    that.getView().getModel("oAttachmentList").getProperty("/0/" + "bankINDArray").splice(index, 1);
                                                //     var index = that.getView().getModel("oAttachmentList").getProperty("/0/" + "bankDArray").findIndex(function (docId) { return docId.name == file.name });
                                                //    that.getView().getModel("oAttachmentList").getProperty("/0/" + "bankDArray").splice(index, 1);
                                                //    }
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
                                                        oAttachData.docFormType = data.docFormType;
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
                                            } else {
                                                if (oBusyDialogFile) {
                                                    oBusyDialogFile.close();
                                                }
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
                    } else {
                        sap.m.MessageToast.show("Please select Document Type");
                        return;


                    }

                }
                this.oPopup.close();
                this.oPopup.destroy();
                this.oPopup = undefined;
            },

            fnSearchAccuityBank: function (oEvent) {
                var vError = false;
                if (!oView.getModel("bankSearchModel").getData().banksearchParam.bankCountry) {
                    oView.getModel("oErrorModel").getData().bankSearchCountryE = "Error";
                    oView.getModel("oErrorModel").getData().bankSearchCountryM = oi18n.getText("mandatoryCountry");

                    vError = true;
                }
                if (!oView.getModel("bankSearchModel").getData().banksearchParam.bankName && oView.getModel("oVisibilityModel").getData().bankNameSearchMandate) {
                    oView.getModel("oErrorModel").getData().bankSearchNameE = "Error";
                    oView.getModel("oErrorModel").getData().bankSearchNameM = oi18n.getText("mandatoryBName");

                    vError = true;
                }
                oView.getModel("oErrorModel").refresh();
                if (vError == false) {
                    oBusyDialogSearching.open();
                    var oModel = new JSONModel();
                    var sUrl = "/comjabilsurveyform/plcm_portal_services/acuity/getBankData";
                    var oPayload = {
                        "bankBranch": oView.getModel("bankSearchModel").getData().banksearchParam.bankBranch,
                        "bankCity": oView.getModel("bankSearchModel").getData().banksearchParam.bankCity,
                        "bankCode": oView.getModel("bankSearchModel").getData().banksearchParam.bankCode,
                        "bankCountry": oView.getModel("bankSearchModel").getData().banksearchParam.bankCountry,
                        "bankName": oView.getModel("bankSearchModel").getData().banksearchParam.bankName
                    }
                    oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, true, {
                        "Content-Type": "application/json"
                    });
                    oModel.attachRequestCompleted(function onCompleted(oEvent) {
                        if (oEvent.getParameter("success")) {
                            oBusyDialogSearching.close();
                            var oJsonBankSearch = new sap.ui.model.json.JSONModel();
                            oJsonBankSearch.setData(oEvent.getSource().getData());
                            oView.setModel(oJsonBankSearch, "bankDataModel");
                            if (oJsonBankSearch.getData().exceptions[0].code == "100") {
                                if (oJsonBankSearch.getData().exceptions[1].code == "101") {
                                    var sErMsg = oi18n.getText("InvalidBankSearchError");
                                    MessageBox.show(sErMsg, {
                                        icon: MessageBox.Icon.ERROR,
                                        title: oi18n.getText("error")
                                    });
                                } else {
                                    var sErMsg = oJsonBankSearch.getData().exceptions[1].description;
                                    MessageBox.show(sErMsg, {
                                        icon: MessageBox.Icon.ERROR,
                                        title: oi18n.getText("error")
                                    });
                                }

                            } else if (oJsonBankSearch.getData().exceptions[0].code == "000" && oJsonBankSearch.getData().exceptions[1].code == "102") {
                                var sErMsg = oi18n.getText("BankSearchTooManyMatches");
                                MessageBox.show(sErMsg, {
                                    icon: MessageBox.Icon.ERROR,
                                    title: oi18n.getText("error")
                                });
                            } else if (oJsonBankSearch.getData().exceptions[0].code == "000" && oJsonBankSearch.getData().exceptions.length >= 2) {
                                var sErMsg = oJsonBankSearch.getData().exceptions[1].description;
                                MessageBox.show(sErMsg, {
                                    icon: MessageBox.Icon.ERROR,
                                    title: oi18n.getText("error")
                                });
                            }
                        } else {
                            oBusyDialogSearching.close();

                        }
                    });
                } else {
                    // sap.m.MessageToast.show(oi18n.getProperty("enterTaxCategory"))
                }

            },
            fnSelectBankInfo: function (oEvent) {
                if (oEvent.getSource().getSelectedIndices().length == 0) {
                    oView.getModel("bankSearchModel").getData().selectedBankItem = "";
                    oView.getModel("bankSearchModel").refresh();
                    oView.byId('accuityBankTableReview').removeStyleClass("cl_AccuityTableSelect");
                } else {
                    oView.byId('accuityBankTableReview').addStyleClass("cl_AccuityTableSelect");
                    var oSelectedItem = oEvent.getParameter("rowContext").sPath;
                    if (oView.getModel("bankDataModel").getProperty(oSelectedItem).bankSanctioned) {
                        var sErMsg = oi18n.getText("bankSanctionMsg");
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });
                        oView.getModel("bankSearchModel").getData().selectedBankItem = "";
                        oView.getModel("bankSearchModel").getData().isManualEntry = false;
                        oView.getModel("bankSearchModel").refresh();
                        var oAccuityBankTable = this.getView().byId("accuityBankTableReview");
                        oAccuityBankTable.setSelectedIndex(-1);

                    } else {
                        oView.getModel("bankSearchModel").getData().selectedBankItem = oView.getModel("bankDataModel").getProperty(oSelectedItem);
                        oView.getModel("bankSearchModel").getData().isManualEntry = false;
                        oView.getModel("bankSearchModel").refresh();
                        var oAccuityBankTable = this.getView().byId("accuityBankTableReview"),
                            iSelectedIndex = oEvent.getSource().getSelectedIndex();
                        oAccuityBankTable.setSelectedIndex(iSelectedIndex);
                    }






                }


            },
            fnConfirmBankInfo: function (oEvent) {
                var selectedBankInfo = oView.getModel("bankSearchModel").getData().selectedBankItem;
                oView.getModel("oVisibilityModel").getData().bankAccuityPanel = false;
                oView.getModel("oVisibilityModel").refresh();
                if (selectedBankInfo.bankName && selectedBankInfo.bankName.length > 60) {
                    selectedBankInfo.bankName = selectedBankInfo.bankName.substring(0, 60);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("bankNameAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });

                }
                if (selectedBankInfo.bankStreet && selectedBankInfo.bankStreet.length > 35) {
                    selectedBankInfo.bankStreet = selectedBankInfo.bankStreet.substring(0, 35);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("bankAddrAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });
                }
                if (selectedBankInfo.bankCity && selectedBankInfo.bankCity.length > 35) {
                    selectedBankInfo.bankCity = selectedBankInfo.bankCity.substring(0, 35);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("bankCityAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });

                }
                if (selectedBankInfo.bankBranch && selectedBankInfo.bankBranch.length > 40) {
                    selectedBankInfo.bankBranch = selectedBankInfo.bankBranch.substring(0, 40);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("bankBranchAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });

                }
                if (selectedBankInfo.swiftCode && selectedBankInfo.swiftCode.length > 11) {
                    selectedBankInfo.swiftCode = selectedBankInfo.swiftCode.substring(0, 11);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("swiftAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });

                }
                if (selectedBankInfo.bankNumber && selectedBankInfo.bankNumber.length > 15) {
                    selectedBankInfo.bankNumber = selectedBankInfo.bankNumber.substring(0, 15);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("bankNumAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });

                }
                if (selectedBankInfo.localName && selectedBankInfo.localName.length > 60) {
                    selectedBankInfo.localName = selectedBankInfo.localName.substring(0, 60);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("bankNameLocalAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });

                }
                if (selectedBankInfo.localAddress && selectedBankInfo.localAddress.length > 35) {
                    selectedBankInfo.localAddress = selectedBankInfo.localAddress.substring(0, 35);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("bankAddrLocalAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });

                }
                if (selectedBankInfo.localCity && selectedBankInfo.localCity.length > 35) {
                    selectedBankInfo.localCity = selectedBankInfo.localCity.substring(0, 35);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("bankCityLocalAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });

                }
                if (selectedBankInfo.localBranch && selectedBankInfo.localBranch.length > 40) {
                    selectedBankInfo.localBranch = selectedBankInfo.localBranch.substring(0, 40);

                    MessageBox.show(oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo1") + " " + oView.getModel("i18n").getResourceBundle().getText("bankBranchLocalAccuity") + " " + oView.getModel("i18n").getResourceBundle().getText("acuityMaxLengthInfo2"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("information")
                    });

                }
                if ((!selectedBankInfo || selectedBankInfo == "") && !oView.getModel("bankSearchModel").getData().isManualEntry) {
                    var sErMsg = oi18n.getText("selectBankItemError");
                    MessageBox.show(sErMsg, {
                        icon: MessageBox.Icon.ERROR,
                        title: oi18n.getText("error")
                    });
                } else if (oView.getModel("bankSearchModel").getData().isManualEntry) {
                    this.fnManualBankInfoEntry();
                } else {

                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry = selectedBankInfo.bankCountry;
                    this.fnActivateBankScreen();
                    // this._fnLoadBankRegion(selectedBankInfo.country); 

                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName = selectedBankInfo.bankName;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAddress = selectedBankInfo.bankStreet;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCity = selectedBankInfo.bankCity;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankState = selectedBankInfo.bankState;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch = selectedBankInfo.bankBranch;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode = selectedBankInfo.swiftCode;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber = selectedBankInfo.bankNumber;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].localName = selectedBankInfo.localName;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].localAddress = selectedBankInfo.localAddress;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].localCity = selectedBankInfo.localCity;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].localBranch = selectedBankInfo.localBranch;
                    oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].validationIndicator = "1";
                    oView.getModel("oDataModel").refresh();
                    oView.getModel("oVisibilityModel").getData().manualBankInfoEdit = false;
                    oView.getModel("oVisibilityModel").refresh();
                }

            },
            fnManualBankInfoEntry: function () {
                oView.getModel("oVisibilityModel").getData().manualBankInfoEdit = true;
                // oView.getModel("oVisibilityModel").getData().bankAccuityPanel = false;
                oView.getModel("oVisibilityModel").refresh();
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCountry = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankName = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankAddress = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankCity = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankState = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankBranch = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].swiftCode = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].bankNumber = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].localName = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].localAddress = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].localCity = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].localBranch = "";
                oView.getModel("oDataModel").getData().bankDto.bankInfoDto[0].validationIndicator = "0";

                oView.getModel("oDataModel").refresh();

            },
            fnSelectManualBankEntry: function (oEvent) {
                if (oEvent.getParameters('selected').selected) {
                    oView.getModel("bankSearchModel").getData().isManualEntry = true;
                    var oAccuityBankTable = this.getView().byId("accuityBankTableReview");
                    oAccuityBankTable.setSelectedIndex(-1);
                } else {
                    oView.getModel("bankSearchModel").getData().isManualEntry = false;

                }
                oView.getModel("bankSearchModel").refresh();
            },
            fnClearBankSearch: function () {
                var clearData = {
                    "bankBranch": "",
                    "bankCity": "",
                    "bankCode": "",
                    "bankCountry": "",
                    "bankName": ""
                };
                oView.getModel("bankSearchModel").getData().banksearchParam = clearData;
                oView.getModel("bankSearchModel").refresh();
                oView.getModel("bankDataModel").setData({});
                oView.getModel("bankDataModel").refresh();
            },
            fnChangeBankCode: function (oEvent) {
                var spaceRegex = /^\s+$/;
                if (spaceRegex.test(oEvent.getSource().getValue())) {
                    oEvent.getSource().setValue("");
                }
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                    oView.getModel("oErrorModel").getData().bankSearchNameE = "None";
                    oView.getModel("oErrorModel").getData().bankSearchNameM = "";
                    oView.getModel("oErrorModel").refresh();
                    oView.getModel("oVisibilityModel").getData().bankNameSearchMandate = false;
                    oView.getModel("oVisibilityModel").refresh();
                } else {
                    oView.getModel("oVisibilityModel").getData().bankNameSearchMandate = true;
                    oView.getModel("oVisibilityModel").refresh();
                }

            },
            fnChangeBankSearchCountry: function (oEvent) {
                if (oEvent.getSource().getValue()) {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                    oEvent.getSource().setSelectedKey(oEvent.getSource().getSelectedKey());
                    oView.getModel("oDataModel").refresh();
                }

                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                }
            },
            fnDocTypeBankChange: function (oEvent) {
                if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                    var vSelected = oEvent.getParameter("itemPressed");
                    this.getOwnerComponent().getModel("oVisibilityModel").getData().bankDocTypeSelected = false;
                    if (vSelected == false) {
                        oEvent.getSource().setValue("");
                    }
                } else {
                    this.getOwnerComponent().getModel("oVisibilityModel").getData().bankDocTypeSelected = true;
                }
                this.getOwnerComponent().getModel("oVisibilityModel").refresh(true);

            }

        });
    });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/jabil/surveyform/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
], function (Controller, BaseController, JSONModel, MessageBox) {
    "use strict";
    var wView, oi18n, vAppName;
    return BaseController.extend("com.jabil.surveyform.controller.SupplierFinanceEula", {
        onInit: function () {
            wView = this.getView();
            oi18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this._router = this.getOwnerComponent().getRouter();
            this._router.getRoute("SupplierFinanceEula").attachPatternMatched(this._fnHandleRouteMatched, this);
        },
        _fnHandleRouteMatched: function (oEvent) {
            this.getUser();
            var taskId = oEvent.getParameter("arguments").contextPath;
            vAppName = oEvent.getParameter("arguments").Name;
            if (taskId !== "") {

                var sValidPath = sap.ui.require.toUrl("com/jabil/surveyform/files/Jabil_SupplierPortal_EULA.pdf");
                var oEULAModel = new JSONModel({
                    Source: sValidPath,
                    Title: "EULA.pdf",
                    Height: "300px"
                });
                this.getView().setModel(oEULAModel, "EULAModel");

                var that = this;
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskContext/" + taskId;
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        that.getView().getModel("oUserModel").setProperty("/caseId", oEvent.getSource().getData().caseId);
                        that.getView().getModel("oUserModel").setProperty("/bpNumber", oEvent.getSource().getData().bpNumber);
                        that.getView().getModel("oUserModel").setProperty("/isNew", oEvent.getSource().getData().isNew);
                        that.getView().getModel("oUserModel").setProperty("/taskId", taskId);
                        if (oEvent.getSource().getData().isBuyerReviewRejected) {
                            that.getView().getModel("oUserModel").setProperty("/isBuyerRejectTask", oEvent.getSource().getData().isBuyerReviewRejected);
                        } else {
                            that.getView().getModel("oUserModel").setProperty("/isBuyerRejectTask", null);
                        }
                        that.getView().getModel("oUserModel").refresh();
                        that._fnCheckEulaStatus(oEvent.getSource().getData().caseId, taskId);
                        // if (oEvent.getSource().getData().isNew) {

                        // } else {

                        //     that._router.navTo("VendorSurvey", { contextPath: taskId, Name: "Supplier" });
                        // }

                    }
                    else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });

                    }
                });
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
        },
        _fnCheckEulaStatus: function (caseId, taskId) {
            var that = this
            var oModel = new JSONModel();
            var vSuppSection;
            if (vAppName == "SupplierFinance") {
                vSuppSection = "Finance Provider";
            } else {
                vSuppSection = "Finance Reviewer";
            }
            var sUrl = "/comjabilsurveyform/plcm_portal_services/eula/findByIdAndSection/" + caseId + "/" + vSuppSection;
            oModel.loadData(sUrl);
            oModel.attachRequestCompleted(function (oEvent) {
                if (oEvent.getParameter("success")) {
                    if (oEvent.getSource().getData() == undefined) {

                        //that._router.navTo("Welcome", { contextPath: taskId });
                    } else {
                        // if (oEvent.getSource().getData().eulaInSection == "Finance Provider") {
                        if (oEvent.getSource().getData().eulaStatus == "Accepted") {
                            this.getOwnerComponent().getRouter().navTo("BankInfo", {
                                contextPath: wView.getModel("oUserModel").getData().taskId,
                                Name: vAppName
                            });
                        }
                        // } else if (oEvent.getSource().getData().eulaInSection == "Finance Reviewer") {
                        //     if (oEvent.getSource().getData().eulaStatus == "Accepted") {
                        //         this.getOwnerComponent().getRouter().navTo("BankInfo", {
                        //             contextPath: wView.getModel("oUserModel").getData().taskId,
                        //             Name: vAppName
                        //         });
                        //     }
                        // }
                    }
                    // else if (oEvent.getSource().getData().eulaStatus == "Rejected") {
                    //   //  that._router.navTo("Welcome", { contextPath: taskId });
                    // } else if (oEvent.getSource().getData().eulaStatus == "Accepted") {
                    //     this.getOwnerComponent().getRouter().navTo("BankInfo", {
                    //         contextPath: wView.getModel("oUserModel").getData().taskId,
                    //         Name:vAppName
                    //     });
                    // //  that._router.navTo("VendorSurvey", { contextPath: taskId, Name: "Supplier" });
                    // }
                    // if(vAppName == "SupplierFinance"){

                    //     if(oEvent.getSource().getData().eulaInSection == "Finance Provider"){
                    that.getView().getModel("oUserModel").setProperty("/language", oEvent.getSource().getData().language);
                    that.getView().getModel("oUserModel").refresh();
                    if (oEvent.getSource().getData().language) {
                        sap.ui.getCore().getConfiguration().setLanguage(oEvent.getSource().getData().language);
                    }
                    // }
                    // }else if(vAppName == "SupplierFinanceReviewer"){
                    //     if(oEvent.getSource().getData().eulaInSection == "Finance Reviewer"){
                    //     that.getView().getModel("oUserModel").setProperty("/language", oEvent.getSource().getData().language);
                    //     that.getView().getModel("oUserModel").refresh();
                    //     if (oEvent.getSource().getData().language) {
                    //         sap.ui.getCore().getConfiguration().setLanguage(oEvent.getSource().getData().language);
                    //     }
                    // }
                    // }

                }
                else if (oEvent.getParameter("errorobject").statusCode == 400 || oEvent.getParameter("errorobject").statusCode == 409 || oEvent.getParameter("errorobject").statusCode == 500 || oEvent.getParameter("errorobject").statusCode == 404) {

                 //   that._router.navTo("Welcome", { contextPath: taskId });
                } else {
                    var sErMsg = oEvent.getParameter("errorobject").responseText;
                    MessageBox.show(sErMsg, {
                        icon: MessageBox.Icon.ERROR,
                        title: oi18n.getText("error")
                    });
                }


            });
        },
        fnOnLanguageSelect: function (oEvent) {
            if (oEvent.getParameter("itemPressed") !== undefined && !oEvent.getParameter("itemPressed") && !oEvent.getSource().getSelectedKey()) {
                var vSelected = oEvent.getParameter("itemPressed");
                if (vSelected == false) {
                    oEvent.getSource().setValue("");
                }
            }
            if (oEvent.getSource().getValue() == "") {
                oEvent.getSource().setSelectedKey("en");
            }
            var _selLan = oEvent.getSource().getSelectedKey();
            sap.ui.getCore().getConfiguration().setLanguage(_selLan);
            sap.ui.getCore().getConfiguration().setFormatLocale("en-US");
            this.getView().getModel("oUserModel").setProperty("/language", _selLan);
            this.getView().getModel("oUserModel").refresh();
            if (_selLan == 'en') {
                this.getView().getModel("oVisibilityModel").getData().isdefaultLan = true;
            } else {
                this.getView().getModel("oVisibilityModel").getData().isdefaultLan = false;
            }
            this.getView().getModel("oVisibilityModel").refresh();
        },
        onPressAccept: function () {
            // var alreadyAccepted = true;
            this._fnUpdateDB("Accepted");

            this.getOwnerComponent().getRouter().navTo("BankInfo", {
                contextPath: wView.getModel("oUserModel").getData().taskId,
                Name: vAppName
            });
            // var oModelWf = new JSONModel();
            // var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskComplete"
            // var wPayload =

            // {
            //     "context": {
            //         "bpNumber": "",
            //         "caseId": wView.getModel("oUserModel").getData().caseId,
            //         "isEULAAccepted": true
            //     },
            //     "status": "",
            //     "action": "accept",
            //     "comments": null,
            //     "taskId": wView.getModel("oUserModel").getData().taskId
            // }
            // oModelWf.loadData(sUrl, JSON.stringify(
            //     wPayload
            // ), true, "POST", false, true, {
            //     "Content-Type": "application/json"
            // });
            // oModelWf.attachRequestCompleted(function (oEvent) {
            //     if (oEvent.getParameter("success")) {

            //     }
            //     else {
            //         var sErMsg = oEvent.getParameter("errorobject").responseText;
            //         MessageBox.show(sErMsg, {
            //             icon: MessageBox.Icon.ERROR,
            //             title: oi18n.getText("error")
            //         });

            //     }
            // });
        },
        onPressDecline: function () {
            var that = this;
            var commentModel = new JSONModel();
            commentModel.setData([{ "comment": "", "addedBy": "" }]);
            wView.setModel(commentModel, "commentModel");
            if (!that.oComment) {
                that.oComment = sap.ui.xmlfragment(
                    "com.jabil.surveyform.fragments.comment", that);
                wView.addDependent(that.oComment);

            }
            that.oComment.open();
        },
        fnSubmitDecline: function () {

            if (wView.getModel("commentModel").getData()[0].comment !== "") {
                var that = this;
                var oModelWf = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskComplete"


                if (vAppName == "SupplierFinance") {
                    var wPayload =

                    {
                        "context": {
                            "bpNumber": "",
                            "caseId": wView.getModel("oUserModel").getData().caseId,
                            "financeProviderEulaComments": wView.getModel("commentModel").getData()[0].comment,
                            "financeProviderEulaAccepted": false,
                            "financeProviderAction": "EULA_rejected",
                            "supplier_eula_comment": wView.getModel("commentModel").getData()[0].comment,
                            "fp_eula_task_instance_Id": wView.getModel("oUserModel").getData().taskId
                        },
                        "status": "",
                        "action": "reject",
                        "comments": wView.getModel("commentModel").getData()[0].comment,
                        "taskId": wView.getModel("oUserModel").getData().taskId
                    }
                } else {
                    var wPayload =
                    {
                        "context": {
                            "bpNumber": "",
                            "caseId": wView.getModel("oUserModel").getData().caseId,
                            "financeReviewerEulaComments": wView.getModel("commentModel").getData()[0].comment,
                            "financeReviewerEulaAccepted": false,
                            "financeReviewerAction": "EULA_rejected",
                            "supplier_eula_comment": wView.getModel("commentModel").getData()[0].comment,
                            "fr_eula_task_instance_Id": wView.getModel("oUserModel").getData().taskId
                        },
                        "status": "",
                        "action": "reject",
                        "comments": wView.getModel("commentModel").getData()[0].comment,
                        "taskId": wView.getModel("oUserModel").getData().taskId
                    }
                }



                oModelWf.loadData(sUrl, JSON.stringify(
                    wPayload
                ), true, "POST", false, true, {
                    "Content-Type": "application/json"
                });
                oModelWf.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        that.oComment.close();
                        MessageBox.show(oi18n.getText("declinedSuccessMsg"), {
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

                    }
                });
                this._fnUpdateDB("Rejected");

            }
        },

        _fnUpdateDB: function (status) {
            var vSuppSection;
            if (vAppName == "SupplierFinance") {
                vSuppSection = "Finance Provider";
            } else {
                vSuppSection = "Finance Reviewer";
            }
            var oModelDB = new JSONModel(),
                selectedLan = sap.ui.getCore().getConfiguration().getLanguage();
            var sUrl = "/comjabilsurveyform/plcm_portal_services/eula/update"
            var dbPayload = {
                "businessPartnerId": "",
                "caseId": wView.getModel("oUserModel").getData().caseId,
                "comments": wView.getModel("commentModel") ? wView.getModel("commentModel").getData()[0].comment : "",
                "dateCreated": "",
                "eulaInSection": vSuppSection,
                "eulaId": "",
                "eulaStatus": status,
                "language": selectedLan,
                "userCreated": wView.getModel("oUserModel") ? wView.getModel("oUserModel").getData().user.givenName : "",
            }
            oModelDB.loadData(sUrl, JSON.stringify(
                dbPayload
            ), true, "POST", false, true, {
                "Content-Type": "application/json"
            });
            oModelDB.attachRequestCompleted(function (oEvent) {
                if (oEvent.getParameter("success")) {


                }
                else {


                }
            });

        },
        fnEULAFormEmail: function () {
            var oModelDB = new JSONModel(), emailId;
            var sUrl = "/comjabilsurveyform/plcm_portal_services/email/notify";
            if (wView.getModel("oVisibilityModel").getData().isToSupplierEmail) {
                emailId = wView.getModel("oUserModel").getData().user.email;
            } else {
                emailId = wView.getModel("oVisibilityModel").getData().alternateEULAEmailId;
            }
            var emailPayload = {
                "caseId": wView.getModel("oUserModel").getData().caseId,
                "receiptUsers": [
                    emailId
                ],
                "templateId": "Supplier_Request_for_End_User_License_Agreement"
            }
            oModelDB.loadData(sUrl, JSON.stringify(
                emailPayload
            ), true, "POST", false, true, {
                "Content-Type": "application/json"
            });
            oModelDB.attachRequestCompleted(function (oEvent) {
                if (oEvent.getParameter("errorobject").statusCode == 200) {
                    MessageBox.show(oi18n.getText("sentEmailSuccess"), {
                        icon: MessageBox.Icon.INFORMATION,
                        title: oi18n.getText("success"),
                    });
                }
                else {
                }
            });

        },
        fnClose: function () {
            this.oComment.close();
        },
        fnRemoveSpace: function (oEvent) {
            var spaceRegex = /^\s+$/;
            if (spaceRegex.test(oEvent.getSource().getValue())) {
                oEvent.getSource().setValue("");
            }
        },

        fnLiveEmailNotJValid: function (oEvent) {
            var email = oEvent.getSource().getValue();
            var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
            if (email) {
                if (!email.match(mailregex)) {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText(oi18n.getText("invalidEmail"));
                    wView.getModel("oVisibilityModel").getData().validAlternateEmailId = false;
                } else if ((email.toUpperCase().includes("JABIL.COM") || email.toUpperCase().includes("NYPRO.COM") || email.toUpperCase().includes("JABILDAS.COM"))) {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText(oi18n.getText("invalidEmail"));
                    wView.getModel("oVisibilityModel").getData().validAlternateEmailId = false;
                } else {
                    oEvent.getSource().setValueState("None");
                    oEvent.getSource().setValueStateText("");
                    wView.getModel("oVisibilityModel").getData().validAlternateEmailId = true;
                }
                wView.getModel("oVisibilityModel").refresh();
            }
        },

    });
});
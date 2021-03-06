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
        return Controller.extend("ns.BuyerRegistration.controller.BuyerRem", {

            onInit: function () {
                oView = this.getView();
                that = this;
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt") //initialize Busy Dialog
                });

                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("BuyerRem").attachPatternMatched(this.fnBuyerReminderval, this);
            },
            fnBuyerReminderval: function (oEvent) {
                oView.getModel("oBPLookUpMdl").setSizeLimit(10000);
                var vContext = {
                    "Id": oEvent.getParameter("arguments").contextPath,
                    "Name": oEvent.getParameter("arguments").Name
                };
                //   that.fnClearData();
                that.fnSetConfigModel(vContext);
            },
            fnSetConfigModel: function (oContext) {

                if (oContext.Name == "EulaReject") {
                    oView.getModel("oConfigMdl").getData().BuyerFollowUpVis = false;
                    oView.getModel("oConfigMdl").getData().EulaRejectVis = true;
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt1 = "The Welcome email has been sent to the Supplier contact you provided.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt2 = "We request that you follow-up with the Supplier and determine why they chose not to accept the Portal End User Licensing Agreement. This may have been in error. However, with a follow-up conversation the Supplier may be willing to accept the EULA.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt3 = "If not, the Supplier will need to utilize the standard Vendor Management Maintenance form and supporting documents that have been used prior to the Portal.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt4 = "Your follow-up call will ensure that there are no unnecessary delays in the process. By checking the box below, you are saying that you have called and personally spoken to the Supplier Contact and they understand they must accept the Jabil EULA to complete the online form.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt5 = "Yes, I have called the Supplier Contact and spoken to them, letting them know they must accept the Portal EULA to complete the online form";
                } else if (oContext.Name == "EulaRejectFin") {
                    oView.getModel("oConfigMdl").getData().BuyerFollowUpVis = false;
                    oView.getModel("oConfigMdl").getData().EulaRejectVis = true;
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt1 = "The Welcome email has been sent to the Finance Provider contact you provided.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt2 = "We request that you follow-up with the Finance Provider and determine why they chose not to accept the Portal End User Licensing Agreement. This may have been in error. However, with a follow-up conversation the Finance Provider may be willing to accept the EULA.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt3 = "If not, the Finance Provider will need to utilize the standard Vendor Management Maintenance form and supporting documents that have been used prior to the Portal.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt4 = "Your follow-up call will ensure that there are no unnecessary delays in the process. By checking the box below, you are saying that you have called and personally spoken to the Finance Provider Contact and they understand they must accept the Jabil EULA to complete the online form.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt5 = "Yes, I have called the Finance Provider Contact and spoken to them, letting them know they must accept the Portal EULA to complete the online form";

                } else if (oContext.Name == "EulaRejectFinReview") {
                    oView.getModel("oConfigMdl").getData().BuyerFollowUpVis = false;
                    oView.getModel("oConfigMdl").getData().EulaRejectVis = true;
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt1 = "The Welcome email has been sent to the Finance Reviewer contact you provided.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt2 = "We request that you follow-up with the Finance Reviewer and determine why they chose not to accept the Portal End User Licensing Agreement. This may have been in error. However, with a follow-up conversation the Finance Reviewer may be willing to accept the EULA.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt3 = "If not, the Finance Reviewer will need to utilize the standard Vendor Management Maintenance form and supporting documents that have been used prior to the Portal.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt4 = "Your follow-up call will ensure that there are no unnecessary delays in the process. By checking the box below, you are saying that you have called and personally spoken to the Finance Reviewer Contact and they understand they must accept the Jabil EULA to complete the online form.";
                    oView.getModel("oConfigMdl").getData().EulaRejectTxt5 = "Yes, I have called the Finance Reviewer Contact and spoken to them, letting them know they must accept the Portal EULA to complete the online form";
                }
                else {
                    oView.getModel("oConfigMdl").getData().BuyerFollowUpVis = true;
                    oView.getModel("oConfigMdl").getData().EulaRejectVis = false;
                }
                oView.getModel("oConfigMdl").getData().contextPath = oContext;
                oView.getModel("oConfigMdl").refresh();
                this.fnLoadTaskDetail(oContext.Id);
                this.fnLoadTaskClaimed(oContext.Id);
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
                        } else {
                            oView.getModel("oConfigMdl").getData().CommentsVis = false;
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

                        oView.getModel("oConfigMdl").getData().isClaimed = true;
                        oView.getModel("oConfigMdl").getData().validationMessage = oEvent.getSource().getData().validationMessage;
                        oView.getModel("oConfigMdl").refresh();
                    }
                });
            },
            fnApproveSub: function (vBtn) {
                if (oView.getModel("oConfigMdl").getData().contextPath.Name == "EulaReject" || oView.getModel("oConfigMdl").getData().contextPath.Name == "EulaRejectFin" || oView.getModel("oConfigMdl").getData().contextPath.Name == "EulaRejectFinReview") {
                    if (oView.byId("id_ConfirmFollowUp1").getSelected() == false) {
                        var sErMsg = oi18n.getProperty("pleaseConfirmCheckBox");
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                        return;
                    }
                } else {
                    if (oView.byId("id_ConfirmFollowUp").getSelected() == false) {
                        var sErMsg = oi18n.getProperty("pleaseConfirmCheckBox");
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                        return;
                    }
                }

                var vConfirmTxt, vAprActn, vSccuessTxt;
                vBtn = "AP";
                if (vBtn == "AP") {
                    vConfirmTxt = "Are you sure you want to submit?";
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
                            var vCommentsActn, vContextActn;
                            if (vAprActn) {
                                vCommentsActn = "approve";
                                vContextActn = "approved";
                            } else {
                                vCommentsActn = "reject";
                                vContextActn = "rejected";
                            }
                            if (oView.getModel("oConfigMdl").getData().contextPath.Name == "EulaRejectFin") {
                                var oPayload = {
                                    "context": {
                                        "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                                        "caseId": oView.getModel("JMEulaComments").getData().caseId,
                                        "isBuyerApprovedonFPEula": vContextActn,
                                        // "gtsAction": vContextActn
                                    },
                                    "status": "",
                                    "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                    "action": vCommentsActn,
                                    //"comments": oView.getModel("JMAppvrComments").getData().Comments
                                }
                            } else if (oView.getModel("oConfigMdl").getData().contextPath.Name == "EulaRejectFinReview") {
                                var oPayload = {
                                    "context": {
                                        "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                                        "caseId": oView.getModel("JMEulaComments").getData().caseId,
                                        "isBuyerApprovedonFREula": vContextActn,
                                        // "gtsAction": vContextActn
                                    },
                                    "status": "",
                                    "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                    "action": vCommentsActn,
                                    //"comments": oView.getModel("JMAppvrComments").getData().Comments
                                }
                            } else {
                                var oPayload = {
                                    "context": {
                                        "bpNumber": oView.getModel("JMEulaComments").getData().bpNumber,
                                        "caseId": oView.getModel("JMEulaComments").getData().caseId,
                                        "isBuyerApprovedonEULA": vContextActn,
                                        // "gtsAction": vContextActn
                                    },
                                    "status": "",
                                    "taskId": oView.getModel("oConfigMdl").getData().contextPath.Id,
                                    "action": vCommentsActn,
                                    //"comments": oView.getModel("JMAppvrComments").getData().Comments
                                }
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
                                            "ns.BuyerRegistration.fragments.CreateSuccessGBS", that);
                                        oView.addDependent(that.oBPSuccess);
                                    }
                                    oBusyDilog.close();
                                    that.oBPSuccess.open();
                                    that.EmailResend = false;

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
                    },


                });

            },
            fnDoneSubmit: function () {
                if (that.EmailResend) {
                    this.oBPSuccess.close();
                }
                    else {
                    window.parent.location.reload();
                }
            },
            fnResendEmail: function () {

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
                            var sUrl = "/nsBuyerRegistration/plcm_portal_services/email/resendOnboardingMail/" + oView.getModel("JMEulaComments").getData().caseId;

                            oModel.loadData(sUrl, {
                                "Content-Type": "application/json"
                            });
                            oModel.attachRequestCompleted(function onCompleted(oEvent) {
                                if (oEvent.getParameter("success")) {
                                    var temp = {};
                                    var vSccuessTxt = oi18n.getProperty("EmailResentSuccess");
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
                                    that.EmailResend = true;
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

        });
    });

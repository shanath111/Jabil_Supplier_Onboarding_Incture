sap.ui.define([
    "com/jabil/surveyform/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, MessageBox) {
        "use strict";
        var wView, oi18n;
        return BaseController.extend("com.jabil.surveyform.controller.Welcome", {
            onInit: function () {
                wView = this.getView();
                oi18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                this._router = this.getOwnerComponent().getRouter();
               this._router.getRoute("Welcome").attachPatternMatched(this._fnHandleRouteMatched, this);

            },
            _fnHandleRouteMatched: function (oEvent) {
                var that= this;
               var taskId = oEvent.getParameter("arguments").contextPath;
               	var oDeferred = $.Deferred();
               this.getUser();
               if (taskId !== "") {
               this.getTaskDetails(taskId,oDeferred,oi18n);
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
               
                // if (taskId !== "") {
                //     var that = this;
                //     var oModelWf = new JSONModel();
                //     var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskContext/" + taskId;
                //     oModelWf.loadData(sUrl);
                //     oModelWf.attachRequestCompleted(function (oEvent) {
                //         if (oEvent.getParameter("success")) {
                //             if (wView.getModel("oUserModel")) {
                //                 wView.getModel("oUserModel").setProperty("/caseId", oEvent.getSource().getData().caseId)
                //                 wView.getModel("oUserModel").setProperty("/taskId", taskId);
                //                  wView.getModel("oUserModel").refresh();
                //             }
                //         }
                //         else {
                //             var sErMsg = oEvent.getParameter("errorobject").responseText;
                //             MessageBox.show(sErMsg, {
                //                 icon: MessageBox.Icon.ERROR,
                //                 title: oi18n.getText("error")
                //             });

                //         }
                //     });
                // }
            },
            fnOnLanguageSelect: function (oEvent) {
                var _selLan = oEvent.getSource().getSelectedKey();
                sap.ui.getCore().getConfiguration().setLanguage(_selLan);
                  this.getView().getModel("oUserModel").setProperty("/language", _selLan);
                   this.getView().getModel("oUserModel").refresh();
                if(_selLan == 'en'){
                this.getView().getModel("oVisibilityModel").getData().isdefaultLan = true;
                } else {
                     this.getView().getModel("oVisibilityModel").getData().isdefaultLan = false;
                }
                 this.getView().getModel("oVisibilityModel").refresh();
            },
            onPressAccept: function () {
                // var alreadyAccepted = true;
                this._fnUpdateDB("Accepted");
                this.getOwnerComponent().getRouter().navTo("VendorSurvey", {
                    contextPath: wView.getModel("oUserModel").getData().taskId,
                    Name:"Supplier"
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
                    var wPayload =

                    {
                        "context": {
                            "bpNumber": "",
                            "caseId": wView.getModel("oUserModel").getData().caseId,
                            "eulaComments": wView.getModel("commentModel").getData()[0].comment,
                            "isEULAAccepted": false,
                            "supplierAction" : "EULA_rejected",
                            "supplier_eula_comment":wView.getModel("commentModel").getData()[0].comment,
                            "supplier_eula_task_instance_Id": wView.getModel("oUserModel").getData().taskId
                        },
                        "status": "",
                        "action": "reject",
                        "comments": wView.getModel("commentModel").getData()[0].comment,
                        "taskId": wView.getModel("oUserModel").getData().taskId
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
                var oModelDB = new JSONModel(),
                selectedLan =  sap.ui.getCore().getConfiguration().getLanguage();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/eula/update"
                var dbPayload = {
                    "businessPartnerId": "",
                    "caseId": wView.getModel("oUserModel").getData().caseId,
                    "comments": wView.getModel("commentModel")? wView.getModel("commentModel").getData()[0].comment: "",
                    "dateCreated": "",
                    "eulaId": "",
                    "eulaStatus": status,
                    "language": selectedLan,
                    "userCreated": wView.getModel("oUserModel")? wView.getModel("oUserModel").getData().user.givenName: "",
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
            fnEULAFormEmail: function(){
                 var oModelDB = new JSONModel(), emailId;
                var sUrl = "/comjabilsurveyform/plcm_portal_services/email/notify";
                if(wView.getModel("oVisibilityModel").getData().isToSupplierEmail){
                    emailId = wView.getModel("oUserModel").getData().user.email;
                } else{
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
            onBeforeRendering: function () { },

            onAfterRendering: function () {
                //  this.getUser();
            }
        });
    });

sap.ui.define([
    "oneapp/incture/processFlow/processFlow/controller/BaseController",
    "oneapp/incture/processFlow/processFlow/util/formatter",
    // "oneapp/incture/processFlow/processFlow/util/taskManagement",
    // "oneapp/incture/processFlow/processFlow/util/workbox",
    // "oneapp/incture/processFlow/processFlow/util/utility",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/BusyDialog",
    "sap/m/MessageBox"
], function (BaseController, factionormatter, JSONModel, Dialog, BusyDialog, MessageBox) {
    "use strict";
    var oBusyDilog, oi18n;
    return BaseController.extend("oneapp.incture.processFlow.processFlow.controller.processFlow", {
        onInit: function () {
            oi18n = this.getOwnerComponent().getModel("i18n");
            oBusyDilog = new BusyDialog({
                text: oi18n.getProperty("BusyTxt") //initialize Busy Dialog
            });
            var oRouter = this.getOwnerComponent().getRouter();
            var oAppModel = this.getOwner().getModel("oAppModel");
            this.oAppModel = oAppModel;
            // oRouter.attachRoutePatternMatched(function (oEvent) {
            // 	if (oEvent.getParameter("name") === "processFlow") {
            this.oAppModel.setProperty("/transitionWait", false);
            //this.preserveData();
            oAppModel.setProperty("/currentView", "processFlow");
            oAppModel.setProperty("/functionality/expanded", false);
            oAppModel.setProperty("/functionality/direction", "Column");
            oAppModel.setProperty("/functionality/visibility", false);
            oAppModel.refresh(true);
            var oProcessFlowModel = new JSONModel();
            oProcessFlowModel.busy = false;
            this.setModel(oProcessFlowModel, "oProcessFlowModel");
            //var oProcessFlowModel = this.getModel("oProcessFlowModel");
            oProcessFlowModel.setProperty("/showDetails", true);
            this.showEventDetails(oProcessFlowModel.getProperty("/taskDetails"));
            this.getView().byId("id_CaseId").setEnabled(true);
            this.getView().byId("id_ViewProcessBtn").setVisible(true);
            this.getView().byId("id_ViewEmail").setVisible(true);


            // 	}
            // }.bind(this));
            if (this.getOwnerComponent().getComponentData()) {
                if (this.getOwnerComponent().getComponentData().startupParameters.caseId) {
                    var vCaseId = this.getOwnerComponent().getComponentData().startupParameters.caseId[0];
                    this.getModel("oProcessFlowModel").getData().caseIdInput = vCaseId;
                    this.getModel("oProcessFlowModel").refresh();
                    this.getView().byId("id_CaseId").setEnabled(false);
                    this.getView().byId("id_ViewProcessBtn").setVisible(false);
                    this.getView().byId("id_ViewEmail").setVisible(true);
                    this.onClickViewFLowBtn();
                }
            }

        },
        fnOpenEmail: function () {
            this.fnLoadEmail();
            if (!this.oEmailList) {
                this.oEmailList = sap.ui.xmlfragment(
                    "oneapp.incture.processFlow.processFlow.fragment.EmailList", this);
                this.getView().addDependent(this.oEmailList);
            }

            this.oEmailList.open();
        },
        fnOpenAttachments: function () {
            this.fnLoadAttachment();
            if (!this.oAttachMentList) {
                this.oAttachMentList = sap.ui.xmlfragment(
                    "oneapp.incture.processFlow.processFlow.fragment.AttachmentList", this);
                this.getView().addDependent(this.oAttachMentList);
            }

            this.oAttachMentList.open();
        },
        fnLoadAttachment: function () {
            oBusyDilog.open();
            var that = this;
            var vCaseId = this.getModel("oProcessFlowModel").getData().caseIdInput;
         //   vCaseId = "0000003";
            // if(!vCaseId){
            //     vCaseId = "0000559";
            // }
            var sUrl = "/oneappinctureprocessFlowprocessFlow/plcm_portal_services/document/getAllDocuments/" + vCaseId;
            var oModel = new JSONModel();
            oModel.loadData(sUrl);
            oModel.attachRequestCompleted(function onCompleted(oEvent) {
                if (oEvent.getParameter("success")) {

                    var oJosonMail = new sap.ui.model.json.JSONModel();
                    oJosonMail.setData(oEvent.getSource().getData());
                    that.getView().setModel(oJosonMail, "JMAttachmentList");
                    oBusyDilog.close();
                }
                else {
                    var oJosonMail = new sap.ui.model.json.JSONModel();
                    oJosonMail.setData([]);
                    that.getView().setModel(oJosonMail, "JMAttachmentList");
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
        fnLoadEmail: function () {
            oBusyDilog.open();
            var that = this;
            var vCaseId = this.getModel("oProcessFlowModel").getData().caseIdInput;
            // if(!vCaseId){
            //     vCaseId = "0000559";
            // }
            var sUrl = "/oneappinctureprocessFlowprocessFlow/WorkboxJavaService/inbox/getEmailData/?requestId=" + vCaseId;
            var oModel = new JSONModel();
            oModel.loadData(sUrl);
            oModel.attachRequestCompleted(function onCompleted(oEvent) {
                if (oEvent.getParameter("success")) {

                    var oJosonMail = new sap.ui.model.json.JSONModel();
                    oJosonMail.setData(oEvent.getSource().getData());
                    that.getView().setModel(oJosonMail, "JMEmailList");
                    oBusyDilog.close();
                }
                else {
                    var oJosonMail = new sap.ui.model.json.JSONModel();
                    oJosonMail.setData([]);
                    that.getView().setModel(oJosonMail, "JMEmailList");
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
        fnCloseEmail: function () {
            this.oEmailList.close();
        },
        fnCloseAttachList: function () {
            this.oAttachMentList.close();
        },
        fnViewMailContent: function (oEvent) {
            if (!this.oEmailContent) {
                this.oEmailContent = sap.ui.xmlfragment(
                    "oneapp.incture.processFlow.processFlow.fragment.EmailContent", this);
                this.getView().addDependent(this.oEmailContent);
            }

            this.oEmailContent.open();
            var oJsonEmailContent = new sap.ui.model.json.JSONModel();
            oJsonEmailContent.setData(oEvent.getSource().getBindingContext("JMEmailList").getProperty());
            this.getView().setModel(oJsonEmailContent, "JMMailContent");
        },
        fnViewAttachmentContent: function (oEvent) {
            if (!this.oAttachmentContent) {
                this.oAttachmentContent = sap.ui.xmlfragment(
                    "oneapp.incture.processFlow.processFlow.fragment.AttachmentContent", this);
                this.getView().addDependent(this.oAttachmentContent);
            }

            this.oAttachmentContent.open();
            var oJsonEmailContent1 = new sap.ui.model.json.JSONModel();
            oJsonEmailContent1.setData(oEvent.getSource().getBindingContext("JMAttachmentList").getProperty("docLinks"));
            this.getView().setModel(oJsonEmailContent1, "JMAttachmentContent");
        },
        fnCloseEmailContent: function () {
            this.oEmailContent.close();
        },
        fnCloseEmailAattchContent: function () {
            this.oAttachmentContent.close();
        },
        fetchEventClicked: function (oEvent) {
            var context = oEvent.getSource().getBindingContext("oProcessFlowModel");
            this.showEventDetails(context.getObject());
            this.getAuditLogs(context.getObject());
        },

        showEventDetails: function (eventDetails) {
            var that = this; //By Karishma
            var oProcessFlowModel = this.getModel("oProcessFlowModel");
            if (eventDetails) {
                oProcessFlowModel.setProperty("/selTaskSubject", eventDetails.subject);
            }
            // oProcessFlowModel.setProperty("/selTaskEvent", eventDetails.eventId);
            oProcessFlowModel.setProperty("/growingBusy", false);
            oProcessFlowModel.setProperty("/showMoreChat", false);
            var processFlowContainer = this.getView().byId("WB_PROCESSFLOW_CONTAINER");
            oProcessFlowModel.setProperty("/noDataText", true);
            this.generateProcessStoryControls(processFlowContainer);
            // var url = "/oneappinctureprocessFlowprocessFlow/WorkboxJavaService/detailPage/dynamicDetails?taskId=" + eventDetails.eventId +
            // 	"&$select=taskStory";
            // oProcessFlowModel.setProperty("/busy", true);

        },

        getAuditLogs: function (auditLogDetails) {
            var oProcessFlowModel = this.getModel("oProcessFlowModel");
            var url = "/oneappinctureprocessFlowprocessFlow/WorkboxJavaService/detailPage/dynamicDetails?taskId=" + auditLogDetails.eventId +
                "&$select=taskStory";
            oProcessFlowModel.setProperty("/busy", true);
            this.doAjax(url, "GET", null, function (oData) {
                var oProcessFlow = oProcessFlowModel.getData();
                oProcessFlowModel.setProperty("/costCenterValue", undefined);
                oProcessFlow.activityDto = [];

                // ACTIVITY DETAILS
                if (oData.activityDto && oData.activityDto.length > 0) {
                    oProcessFlow.activityDto = oData.activityDto;
                    oProcessFlow.lastActivityId = oData.activityDto[oData.activityDto.length - 1].auditId;
                }
                oProcessFlowModel.setProperty("/currentPage", 1);
                oProcessFlowModel.setProperty("/busy", false);
                oProcessFlowModel.setProperty("/growingBusy", false);
                oProcessFlowModel.refresh(true);
            }.bind(this), function (oError) { }.bind(this));
        },
        /************ Collaboration changes start - By Karishma *******************/
        fnGetChatHistory: function (sChatId, oProcessFlow) {
            var oProcessFlowModel = this.getModel("oProcessFlowModel");
            oProcessFlowModel.setProperty("/growingBusy", true);
            var conversationDto = oProcessFlowModel.getProperty("/conversationDto");
            var currentPage = oProcessFlowModel.getProperty("/currentPage");
            var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
            var url = "/ActJavaService/chat/chatHistory/" + sUserId + "/" + sChatId + "/" + currentPage + "/10";
            this.doAjax(url, "GET", null, function (oData) {
                if (oData.data) {
                    var aOldChatHistory = oData.data.chatHistory;
                    aOldChatHistory = aOldChatHistory ? aOldChatHistory : [];
                    conversationDto = conversationDto.concat(aOldChatHistory);
                    conversationDto = conversationDto.sort((a, b) => new Date(Number(a.sentAt)) - new Date(Number(b.sentAt)));
                    this.scrollBottom("ID_PROCESS_FLOW_CONV_SCROLL", this);
                    oProcessFlowModel.setProperty("/conversationDto", conversationDto);
                    oProcessFlowModel.setProperty("/totalChatCount", oData.data.totalItemCount);
                    oProcessFlowModel.setProperty("/pageCount", oData.data.pageSize);
                    oProcessFlowModel.setProperty("/sChatID", sChatId);
                    oProcessFlowModel.setProperty("/currentPage", oData.data.pageNumber);
                    oProcessFlowModel.setProperty("/bChatHistoryBusy", false);
                    oProcessFlowModel.setProperty("/iChatLength", conversationDto.length);
                    if (conversationDto.length < oData.data.totalItemCount) {
                        oProcessFlowModel.setProperty("/showMoreChat", true);
                    } else {
                        oProcessFlowModel.setProperty("/showMoreChat", false);
                    }
                    if (conversationDto.length > 0) {
                        oProcessFlowModel.setProperty("/bIsHistoryPresent", true);
                    } else {
                        oProcessFlowModel.setProperty("/bIsHistoryPresent", false);
                    }
                }
                oProcessFlowModel.setProperty("/growingBusy", false);
            }.bind(this),
                function (oError) { }.bind(this));

        },
        /************ Collaboration changes End- By Karishma *******************/
        closeProcessFlow: function () {
            // var oProcessFlowModel = this.getModel("oProcessFlowModel");
            // var oAppModel = this.getOwner().getModel("oAppModel");
            // this.oAppModel = oAppModel;
            // oProcessFlowModel.setProperty("/showDetails", false);
            // oProcessFlowModel.setProperty("/activityDto", []);
            // oProcessFlowModel.setProperty("/customAttributesDto", []);
            // oProcessFlowModel.setProperty("/attachmentDto", []);
            // oProcessFlowModel.setProperty("/conversationDto", []);
            // oProcessFlowModel.setProperty("/taskDetails/tasks", []);
            // oProcessFlowModel.setProperty("/busy", true);
            // oProcessFlowModel.setProperty("/currentPage", 1);
            // oAppModel.setProperty("/loadTableUserManagement", false);
            // if (this.oAppModel.getProperty("/currentViewPage") === "userWorkLoad") {
            // 	this.oAppModel.setProperty("/loadTableUserManagement", true);
            // }
            // oProcessFlowModel.setProperty("/bIsHistoryPresent", true);
            // oProcessFlowModel.refresh(true);
            this.onNavBack();
            //this.reapplyTokens();

        },
        generateProcessStoryControls: function (processFlowContainer) {
            var that = this;
            processFlowContainer.removeAllItems();
            // ADD PROCESS STARTED HBOX - START
            var processStartedIconVbox = new sap.m.VBox({
                renderType: "Bare",
                alignItems: "Start",
                justifyContent: "Start"
            }).addItem(new sap.ui.core.Icon({
                src: "sap-icon://accept",
                tooltip: "{i18n>PROCESS_STARTED_TEXT}"
            }).addStyleClass("wbProcessFlowIconCompletedState wbProcessFlowIcon")).addItem(new sap.m.VBox().addStyleClass(
                "wbProcessFlowBar wbProcessFlowBarCompletedState")).addStyleClass("wbProcessFlowIconBarVbox");

            var processStartedTray = new sap.m.HBox({
                renderType: "Bare",
                justifyContent: "SpaceBetween"
            }).addItem(new sap.m.Text({
                text: "{i18n>PROCESS_STARTED_TEXT}"
            }).addStyleClass("wbProcessFlowSubjectLabel wbProcessFlowSubjectLabelHeader wbTextBoldClass"))
                .addItem(new sap.m.Text({
                    text: "{path: 'oProcessFlowModel>/taskDetails/createdAtInString' ,formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbProcessFlowTime'}",
                    textAlign: "Right"
                }).addStyleClass("wbProcessFlowCreatedAtTime")).addStyleClass(
                    "wbProcessFlowStartState wbProcessFlowTaskHBoxPadding wbProcessFlowTaskBackground sapUiSmallMarginBottom");

            var processStart = new sap.m.HBox().addItem(processStartedIconVbox).addItem(processStartedTray);
            processFlowContainer.addItem(processStart);
            // ADD PROCESS STARTED HBOX - END

            // ADD TASKS VBOX - START

            var tasksVBox = new sap.m.VBox();
            tasksVBox.bindAggregation("items", "oProcessFlowModel>/taskDetails",
                function (index, context) {
                    var bindingObject = context.getObject();
                    var contextPath = context.getPath();

                    var HBox = this.addProcessFlowTasks(contextPath, bindingObject);
                    return HBox;
                }.bind(this));
            processFlowContainer.addItem(tasksVBox);
            this.getModel("oProcessFlowModel").refresh(true);
            // ADD TASKS VBOX - END
            //}


        },
        addProcessFlowTasks: function (bindingPath, bindingObject) {
            // ADD TASKS VBOX - START
            var that = this;
            var oProcessFlowModel = this.getModel("oProcessFlowModel");
            oProcessFlowModel.setProperty(bindingPath + "/sPath", bindingPath);
            bindingPath = "oProcessFlowModel>" + bindingPath;
            // VBOX STATUS ICON AND VERTICAL LINE
            var iconVbox = new sap.m.VBox({
                renderType: "Bare",
                alignItems: "Start",
                justifyContent: "Start"
            }).addItem(new sap.ui.core.Icon({
                src: "{path: 'oProcessFlowModel>status' ,formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbSetProcessFlowStatusIcon'}",
                tooltip: "{oProcessFlowModel>status}"
            }).addStyleClass("wbProcessFlowIcon")).addItem(new sap.m.VBox({
                visible: "{parts: ['oProcessFlowModel>showConnectingBar','oProcessFlowModel>status'] ,formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbSetProcessFlowConnectingBar'}"
            }).addStyleClass("wbProcessFlowBar")).addStyleClass("wbProcessFlowIconBarVbox");

            // TASK OWNER AND STARTED AT TIME
            var taskHeader = new sap.m.HBox({
                renderType: "Bare",
                justifyContent: "SpaceBetween",
                visible: "{path: 'oProcessFlowModel>status' ,formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbSetProcessFlowTaskHBoxUnderline'}"
            }).addItem(new sap.m.Text({
                text: "{= (${oProcessFlowModel>ownersName} === '' || ${oProcessFlowModel>ownersName} === null) ? ${i18n>NA_TEXT}: ${oProcessFlowModel>ownersName}}",
                tooltip: "{= (${oProcessFlowModel>ownersName} === '' || ${oProcessFlowModel>ownersName} === null) ? ${i18n>NA_TEXT}: ${oProcessFlowModel>ownersName}}",
                maxLines: 2
            }).addStyleClass("wbProcessFlowSubjectLabel wbProcessFlowSubjectLabelHeader wbTextBoldClass"))
                .addItem(new sap.m.Text({
                    text: "{path: 'oProcessFlowModel>createdAtInString' ,formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbProcessFlowTime'}",
                    textAlign: "Right"
                }).addStyleClass("wbProcessFlowCreatedAtTime")).addStyleClass(
                    "wbProcessFlowTaskHBoxPadding");
            // SINGLE TASK TRAY
            var oTaskTray = new sap.m.VBox({
                renderType: "Bare",
                width: "100%",
                visible: "{parts: ['oProcessFlowModel>status', 'oProcessFlowModel>eventId','oProcessFlowModel>/selTaskEvent','oProcessFlowModel>/showDetails'] ,formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbSetProcessFlowTaskBackground'}"
            }).addItem(taskHeader)
                .addItem(new sap.m.Text({ //SUBJECT
                    text: "{oProcessFlowModel>subject}",
                    tooltip: "{oProcessFlowModel>subject}",
                    maxLines: 2,
                    visible: true
                }).addStyleClass("wbProcessFlowSubjectLabel wbProcessFlowTaskHBoxPadding wbTextBoldClass"))
                .addItem(new sap.m.Text({ //DESCRIPTION
                    text: "{oProcessFlowModel>description}",
                    tooltip: "{oProcessFlowModel>description}",
                    maxLines: 2,
                    visible: true
                }).addStyleClass("wbProcessFlowDescText wbProcessFlowTaskHBoxPadding"))
                .addItem(new sap.m.HBox()
                    .addItem(new sap.m.Text({ //TASK COMPLETION TIME TEXT
                        text: "{i18n>TASK_COMPLETION_TIME_TEXT}",
                        visible: "{parts: ['oProcessFlowModel>status','oProcessFlowModel>totalTime'],formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbSetProcessFlowCompletionTime'}"
                    })).addItem(new sap.m.Text({ //TIME
                        text: "{oProcessFlowModel>totalTime}",
                        visible: "{parts: ['oProcessFlowModel>status','oProcessFlowModel>totalTime'],formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbSetProcessFlowCompletionTime'}"
                    }).addStyleClass("wbTextBoldClass")).addStyleClass("wbProcessFlowTaskHBoxPadding")).addStyleClass("wbProcessFlowTaskBackground")
                .addStyleClass(
                    "sapUiSmallMarginBottom")

            // TASK CLI
            var taskCLI = new sap.m.CustomListItem({
                type: "{parts: ['oProcessFlowModel>/showDetails','oProcessFlowModel>status'] ,formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbSetShowDetailsPS'}",
                press: function (oEvent) {
                    that.fetchEventClicked(oEvent);
                }
            }).addContent(new sap.m.HBox({
                renderType: "Bare",
                width: "100%"
            }).addItem(oTaskTray).addItem(new sap.m.VBox({
                alignItems: "Center",
                justifyContent: "Center",
                alignContent: "Center",
                width: "2%"
            }).addItem(new sap.m.VBox({
                //visible: "{parts: ['oProcessFlowModel>status', 'oProcessFlowModel>eventId','oProcessFlowModel>/selTaskEvent','oProcessFlowModel>/showDetails'] ,formatter: 'oneapp.incture.processFlow.processFlow.util.formatter.wbSetProcessFlowTaskArrow'}"
            }).addStyleClass("wbProcessFlowSelTaskArrow")))).addStyleClass("wbProcessFlowContentsMCLI");

            // TASKS VBOX
            var tasksTray = new sap.m.VBox({
                renderType: "Bare",
                width: "100%"
            }).addItem(taskCLI); //add subheader here
            if (bindingObject.subTask && bindingObject.subTask.length > 0) {
                var subTaskVBox = this.addProcessFlowSubTasks(bindingPath + "/subTask")
                tasksTray.addItem(subTaskVBox);
            }
            var tasksHBox = new sap.m.HBox({
                renderType: "Bare",
                width: "100%"
            }).addItem(iconVbox).addItem(tasksTray);
            return tasksHBox;
            this.getModel("oProcessFlowModel").refresh(true);
        },
        addProcessFlowSubTasks: function (bindingPath) {
            var subTaskParent = new sap.m.VBox({
                width: "100%",
                renderType: "Bare"
            });
            subTaskParent.bindAggregation("items", bindingPath,
                function (index, context) {
                    var parentPath = context.getPath();
                    var subTaskChildTask = new sap.m.VBox({
                        width: "100%",
                        renderType: "Bare"
                    });
                    subTaskChildTask.bindAggregation("items", "oProcessFlowModel>" + parentPath + "/task",
                        function (index, context) {
                            var childObject = context.getObject();
                            var childPath = context.getPath();
                            var subTaskTray = new sap.m.HBox({
                                width: "100%",
                                renderType: "Bare"
                            }).addItem(new sap.m.HBox({
                                width: "20px",
                                renderType: "Bare",
                                alignItems: "Center",
                                justifyContent: "Start"
                            }).addItem(new sap.m.HBox({
                                width: "100%",
                                height: "100%",
                                visible: false
                            })));
                            var subTask = this.addProcessFlowTasks(childPath, childObject);
                            subTaskTray.addItem(subTask);
                            return subTaskTray;
                        }.bind(this));
                    return subTaskChildTask;
                }.bind(this));
            return subTaskParent;
        },
       
        _fnReadDocumentList: function (caseId, that) {
            that = this;
         
            that.getView().getModel("oAttachmentList").setProperty("/AllDocuments", []);
            var sUrl = "/oneappinctureprocessFlowprocessFlow/plcm_portal_services/document/findByRequestId/" + caseId;
            $.ajax({
                url: sUrl,

                type: 'GET',
                success: function (data) {

                    $.each(data, function (index, value) {
                       
                        that.getView().getModel("oAttachmentList").getData().AllDocuments.push(value);

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
        
        fnOnDownlAttachmentAll: function (oEvt) {
            this.getView().getModel("oAttachmentList").refresh(true);
            var name = oEvt.getSource().getParent().oParent.getItems()[0].mAggregations.items[1].mAggregations.items[0].getProperty("text"),
                _arrayTitle = oEvt.oSource.oParent.oParent.oParent.oParent.mBindingInfos.items.path.split("/0/")[1];
            // @ts-ignore
            var dmsDocId = this.getView().getModel("oAttachmentList").getData().AllDocuments.filter(function (docId) {
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
        onClickViewFLowBtn: function (oEvent) {
            var oEvent = oEvent;
            var oProcessFlowModel = this.getModel("oProcessFlowModel");
            //var caseId = oEvent.getSource().getParent().getItems()[0].getValue();
            var caseId = oProcessFlowModel.getProperty("/caseIdInput");
            this._fnReadDocumentList(caseId);

            var requestPayload = {
                "requestId": caseId
            }

            var url = "/oneappinctureprocessFlowprocessFlow/WorkboxJavaService/task/details";
            this.doAjax(url, "POST", requestPayload, function (oData) {
                var oData = oData;
                var oProcessFlowModel = this.getModel("oProcessFlowModel");
                oProcessFlowModel.setProperty("/taskDetails", oData.tasks);
                //oProcessFlowModel.setProperty("/noDataText", false);
                if (oData.tasks.length !== 0) {
                    oProcessFlowModel.setProperty("/showConnectingBar", true);
                } else {
                    oProcessFlowModel.setProperty("/showConnectingBar", false);
                }
            }.bind(this), function (oError) { }.bind(this));
            this._doNavigate("processFlow", {});
        }
    });

});
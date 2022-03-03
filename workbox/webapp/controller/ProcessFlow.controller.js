sap.ui.define([
	"oneapp/incture/workbox/controller/BaseController",
	"oneapp/incture/workbox/util/formatter",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog"
], function (BaseController, formatter, taskManagement, workbox, utility, JSONModel, Dialog) {
	"use strict";

	return BaseController.extend("oneapp.incture.workbox.controller.ProcessFlow", {
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			var oAppModel = this.getOwner().getModel("oAppModel");
			this.oAppModel = oAppModel;
			oRouter.attachRoutePatternMatched(function (oEvent) {
				if (oEvent.getParameter("name") === "ProcessFlow") {
							this.oAppModel.setProperty("/transitionWait",false);
					this.preserveData();
					oAppModel.setProperty("/currentView", "processFlow");
					oAppModel.setProperty("/functionality/expanded", false);
					oAppModel.setProperty("/functionality/direction", "Column");
					oAppModel.setProperty("/functionality/visibility", false);
					oAppModel.refresh(true);
					var oProcessFlowModel = this.getModel("oProcessFlowModel");
					oProcessFlowModel.setProperty("/showDetails", true);
					this.showEventDetails(oProcessFlowModel.getProperty("/taskDetails/tasks/0"));
				}
			}.bind(this));
		},
		fetchEventClicked: function (oEvent) {
			var context = oEvent.getSource().getBindingContext("oProcessFlowModel");
			this.showEventDetails(context.getObject());
		},
		showEventDetails: function (eventDetails) {
			var that = this; //By Karishma
			var oProcessFlowModel = this.getModel("oProcessFlowModel");
			oProcessFlowModel.setProperty("/selTaskSubject", eventDetails.subject);
			oProcessFlowModel.setProperty("/selTaskEvent", eventDetails.eventId);
			oProcessFlowModel.setProperty("/growingBusy", false);
			oProcessFlowModel.setProperty("/showMoreChat", false);
			var processFlowContainer = this.getView().byId("WB_PROCESSFLOW_CONTAINER");
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().generateProcessStoryControls(
				processFlowContainer);
			var url = "/oneappinctureworkbox/WorkboxJavaService/detailPage/dynamicDetails?taskId=" + eventDetails.eventId +
				"&$select=taskStory";
			oProcessFlowModel.setProperty("/busy", true);
			this.doAjax(url, "GET", null, function (oData) {
					var oProcessFlow = oProcessFlowModel.getData();
					oProcessFlowModel.setProperty("/costCenterValue", undefined);
					oProcessFlow.activityDto = [];
					oProcessFlow.customAttributesDto = [];
					oProcessFlow.attachmentDto = [];
					oProcessFlow.conversationDto = [];
					var iTaskDetails = -1,
						iAttachment = -1;
					for (var j = 0; j < oData.contentDto.length; j++) {
						if (oData.contentDto[j].dataType === "TASKDETAILS") {
							iTaskDetails = j;
						}
						if (oData.contentDto[j].dataType === "ATTACHMENT") {
							iAttachment = j;
						}
					}
					// CUSTOM ATTRIBUTES
					if (iTaskDetails !== -1 && oData.contentDto[iTaskDetails].contentDto && oData.contentDto[iTaskDetails].contentDto.length > 0) {
						if (oProcessFlow.taskDetails.process.name === "ProjectProposalDocumentApproval") {
							var list = [],
								costCenter, content;
							for (var z = 0; z < oData.contentDto[iTaskDetails].contentDto.length; z++) {
								content = oData.contentDto[iTaskDetails].contentDto[z];
								if (content.label.includes("Cost Center")) {
									costCenter = content.value.split(",");

									break;

								}
							}
							oProcessFlowModel.setProperty("/costCenterValue", costCenter);
						}
						oProcessFlow.customAttributesDto = oData.contentDto[iTaskDetails].contentDto;
					}
					// ATTACHMENT 
					if (iAttachment !== -1 && oData.contentDto[iAttachment].contentDto && oData.contentDto[iAttachment].contentDto.length > 0) {
						var attachmentDto = oData.contentDto[iAttachment].contentDto;
						var checkIndex = true;
						for (var i = 0; i < attachmentDto.length; i++) {
							if (attachmentDto[i].attributeValues.length > 0) {
								attachmentDto[i].attachmentName = null;
								attachmentDto[i].attachmentSize = null;
								attachmentDto[i].attachmentType = null;
								attachmentDto[i].attachmentId = null;
								if (checkIndex) {
									var attributeData = attachmentDto[i].attributeValues;
									for (j = 0; j < attributeData.length; j++) {
										if (attributeData[j].key === "attachmentName") {
											attachmentDto[i].attachmentName = attachmentDto[i].attributeValues[j].attributeValue;
										} else if (attributeData[j].key === "attachmentSize") {
											attachmentDto[i].attachmentSize = attachmentDto[i].attributeValues[j].attributeValue;
										} else if (attributeData[j].key === "attachmentType") {
											attachmentDto[i].attachmentType = attachmentDto[i].attributeValues[j].attributeValue;

										} else if (attributeData[j].key === "attachmentId") {
											attachmentDto[i].attachmentId = attachmentDto[i].attributeValues[j].attributeValue;
										}
									}
									checkIndex = false;
								}
								oProcessFlow.attachmentDto.push(attachmentDto[i]);
							}
						}
					}
					// CHAT DETAILS
					oProcessFlowModel.setProperty("/bIsHistoryPresent", true); //By Karishma
					oProcessFlowModel.setProperty("/currentPage", 0); //By Karishma
					var sChatId = oProcessFlowModel.getProperty("/sProcessFlowTaskId"); //By Karishma
					that.fnGetChatHistory(oProcessFlowModel.getProperty("/selTaskEvent"), oProcessFlow); //By Karishma

					// if (oData.conversationDto && oData.conversationDto.length > 0) {
					// 	oProcessFlow.conversationDto = oData.conversationDto;
					// 	this.scrollBottom("ID_PROCESS_FLOW_CONV_SCROLL", this);
					// 	oProcessFlowModel.setProperty("/totalChatCount", oData.totalChatCount);
					// 	oProcessFlowModel.setProperty("/pageCount", oData.pageCount);
					// 	oProcessFlowModel.setProperty("/currentPage", oData.currentPage);
					// 	if (oData.conversationDto.length <= oData.totalChatCount) {
					// 		oProcessFlowModel.setProperty("/showMoreChat", true);
					// 	}
					// }
					// ACTIVITY DETAILS
					if (oData.activityDto && oData.activityDto.length > 0) {
						oProcessFlow.activityDto = oData.activityDto;
						oProcessFlow.lastActivityId = oData.activityDto[oData.activityDto.length - 1].auditId;
					}
					oProcessFlowModel.setProperty("/currentPage", 1);
					oProcessFlowModel.setProperty("/busy", false);
					oProcessFlowModel.setProperty("/growingBusy", false);
					oProcessFlowModel.refresh(true);
				}.bind(this),
				function (oError) {}.bind(this));
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
				function (oError) {}.bind(this));

		},
		showMoreChat: function (oEvent) {
			var oProcessFlowModel = this.getModel("oProcessFlowModel");
			oProcessFlowModel.setProperty("/currentPage", oProcessFlowModel.getProperty("/currentPage") + 1);
			oProcessFlowModel.setProperty("/growingBusy", true);
			var sChatId = oProcessFlowModel.getProperty("/sChatID");
			this.fnGetChatHistory(oProcessFlowModel.getProperty("/selTaskEvent"));
			// this.doAjax(url, "POST", requestPayload, function (oData) {
			// 	var conversationDto = oProcessFlowModel.getProperty("/conversationDto");
			// 	oProcessFlowModel.setProperty("/conversationDto", oData.chatMessages.messages.concat(conversationDto));
			// 	oProcessFlowModel.setProperty("/growingBusy", false);
			// 	oProcessFlowModel.setProperty("/totalChatCount", oData.totalChatCount);

			// 	if (oData.currentPage * oData.pageCount < oData.totalChatCount) {
			// 		oProcessFlowModel.setProperty("/showMoreChat", true);
			// 	} else {
			// 		oProcessFlowModel.setProperty("/showMoreChat", false);
			// 	}
			// 	oProcessFlowModel.refresh(true);
			// }.bind(this), function (oError) {}.bind(this));
		},
		/************ Collaboration changes End- By Karishma *******************/
		closeProcessFlow: function () {
			var oProcessFlowModel = this.getModel("oProcessFlowModel");
			var oAppModel = this.getOwner().getModel("oAppModel");
			this.oAppModel = oAppModel;
			oProcessFlowModel.setProperty("/showDetails", false);
			oProcessFlowModel.setProperty("/activityDto", []);
			oProcessFlowModel.setProperty("/customAttributesDto", []);
			oProcessFlowModel.setProperty("/attachmentDto", []);
			oProcessFlowModel.setProperty("/conversationDto", []);
			oProcessFlowModel.setProperty("/taskDetails/tasks", []);
			oProcessFlowModel.setProperty("/busy", true);
			oProcessFlowModel.setProperty("/currentPage", 1);
			oAppModel.setProperty("/loadTableUserManagement", true);
			oProcessFlowModel.setProperty("/bIsHistoryPresent", true);
			oProcessFlowModel.refresh(true);
			this.onNavBack();
			this.reapplyTokens();

		},
		generateProcessStoryControls: function (processFlowContainer) {
			processFlowContainer.removeAllItems();
			// var oData = this.getModel("oProcessFlowModel").getProperty("/taskDetails");
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
					text: "{path: 'oProcessFlowModel>/taskDetails/process/startedAtInString' ,formatter: 'oneapp.incture.workbox.util.formatter.wbProcessFlowTime'}",
					textAlign: "Right"
				}).addStyleClass("wbProcessFlowCreatedAtTime")).addStyleClass(
					"wbProcessFlowStartState wbProcessFlowTaskHBoxPadding wbProcessFlowTaskBackground sapUiSmallMarginBottom");

			var processStart = new sap.m.HBox().addItem(processStartedIconVbox).addItem(processStartedTray);
			processFlowContainer.addItem(processStart);
			// ADD PROCESS STARTED HBOX - END

			// ADD TASKS VBOX - START

			var tasksVBox = new sap.m.VBox();
			tasksVBox.bindAggregation("items", "oProcessFlowModel>/taskDetails/tasks",
				function (index, context) {
					var bindingObject = context.getObject();
					var contextPath = context.getPath();

					var HBox = this.addProcessFlowTasks(contextPath, bindingObject);
					return HBox;
				}.bind(this));

			// for (var i = 0; i < oData.tasks.length; i++) {
			// 	var oTaskHBox = this.addProcessFlowTasks1("/taskDetails/tasks/" + i + "/", oData.tasks[i]);
			// 	tasksVBox.addItem(oTaskHBox);
			// }
			processFlowContainer.addItem(tasksVBox);
			this.getModel("oProcessFlowModel").refresh(true);
			// ADD TASKS VBOX - END
		},
		addProcessFlowTasks: function (bindingPath, bindingObject) {
			// ADD TASKS VBOX - START
			var oProcessFlowModel = this.getModel("oProcessFlowModel");
			oProcessFlowModel.setProperty(bindingPath + "/sPath", bindingPath);
			bindingPath = "oProcessFlowModel>" + bindingPath;
			// VBOX STATUS ICON AND VERTICAL LINE
			var iconVbox = new sap.m.VBox({
				renderType: "Bare",
				alignItems: "Start",
				justifyContent: "Start"
			}).addItem(new sap.ui.core.Icon({
				src: "{path: 'oProcessFlowModel>status' ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowStatusIcon'}",
				tooltip: "{oProcessFlowModel>status}"
			}).addStyleClass("wbProcessFlowIcon")).addItem(new sap.m.VBox({
				visible: "{parts: ['oProcessFlowModel>showConnectingBar','oProcessFlowModel>status'] ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowConnectingBar'}"
			}).addStyleClass("wbProcessFlowBar")).addStyleClass("wbProcessFlowIconBarVbox");

			// TASK OWNER AND STARTED AT TIME
			var taskHeader = new sap.m.HBox({
					renderType: "Bare",
					justifyContent: "SpaceBetween",
					visible: "{path: 'oProcessFlowModel>status' ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowTaskHBoxUnderline'}"
				}).addItem(new sap.m.Text({
					text: "{= (${oProcessFlowModel>ownersName} === '' || ${oProcessFlowModel>ownersName} === null) ? ${i18n>NA_TEXT}: ${oProcessFlowModel>ownersName}}",
					tooltip: "{= (${oProcessFlowModel>ownersName} === '' || ${oProcessFlowModel>ownersName} === null) ? ${i18n>NA_TEXT}: ${oProcessFlowModel>ownersName}}",
					maxLines: 2
				}).addStyleClass("wbProcessFlowSubjectLabel wbProcessFlowSubjectLabelHeader wbTextBoldClass"))
				.addItem(new sap.m.Text({
					text: "{path: 'oProcessFlowModel>createdAtInString' ,formatter: 'oneapp.incture.workbox.util.formatter.wbProcessFlowTime'}",
					textAlign: "Right"
				}).addStyleClass("wbProcessFlowCreatedAtTime")).addStyleClass(
					"wbProcessFlowTaskHBoxPadding");
			// SINGLE TASK TRAY
			var oTaskTray = new sap.m.VBox({
					renderType: "Bare",
					width: "100%",
					visible: "{parts: ['oProcessFlowModel>status', 'oProcessFlowModel>eventId','oProcessFlowModel>/selTaskEvent','oProcessFlowModel>/showDetails'] ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowTaskBackground'}"
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
						visible: "{parts: ['oProcessFlowModel>status','oProcessFlowModel>totalTime'],formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowCompletionTime'}"
					})).addItem(new sap.m.Text({ //TIME
						text: "{oProcessFlowModel>totalTime}",
						visible: "{parts: ['oProcessFlowModel>status','oProcessFlowModel>totalTime'],formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowCompletionTime'}"
					}).addStyleClass("wbTextBoldClass")).addStyleClass("wbProcessFlowTaskHBoxPadding")).addStyleClass("wbProcessFlowTaskBackground")
				.addStyleClass(
					"sapUiSmallMarginBottom")

			// TASK CLI
			var taskCLI = new sap.m.CustomListItem({
				type: "{parts: ['oProcessFlowModel>/showDetails','oProcessFlowModel>status'] ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetShowDetailsPS'}",
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
				visible: "{parts: ['oProcessFlowModel>status', 'oProcessFlowModel>eventId','oProcessFlowModel>/selTaskEvent','oProcessFlowModel>/showDetails'] ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowTaskArrow'}"
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
		// showMoreChat: function (oEvent) {
		// 	var oProcessFlowModel = this.getModel("oProcessFlowModel");
		// 	oProcessFlowModel.setProperty("/currentPage", oProcessFlowModel.getProperty("/currentPage") + 1);
		// 	var requestPayload = {
		// 		"chatId": oProcessFlowModel.getProperty("/selTaskEvent"),
		// 		"chatType": "TASK",
		// 		"chatName": "Test",
		// 		"page": oProcessFlowModel.getProperty("/currentPage")
		// 	};
		// 	var url = "/WorkboxJavaService/chat/chatHistory";
		// 	oProcessFlowModel.setProperty("/growingBusy", true);
		// 	this.doAjax(url, "POST", requestPayload, function (oData) {
		// 		var conversationDto = oProcessFlowModel.getProperty("/conversationDto");
		// 		oProcessFlowModel.setProperty("/conversationDto", oData.chatMessages.messages.concat(conversationDto));
		// 		oProcessFlowModel.setProperty("/growingBusy", false);
		// 		oProcessFlowModel.setProperty("/totalChatCount", oData.totalChatCount);

		// 		if (oData.currentPage * oData.pageCount < oData.totalChatCount) {
		// 			oProcessFlowModel.setProperty("/showMoreChat", true);
		// 		} else {
		// 			oProcessFlowModel.setProperty("/showMoreChat", false);
		// 		}
		// 		oProcessFlowModel.refresh(true);
		// 	}.bind(this), function (oError) {}.bind(this));
		// },
	});

});
sap.ui.define([
	"oneapp/incture/workbox/util/formatter",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel"
], function (formatter, taskManagement, workbox, utility, JSONModel) {
	"use strict";

	return {
		formatter: formatter,
		utility: utility,

		//isJabil key is set to check for the jabil process - vaishnavi
		wbCommonSubheaderActionNew: function (that, status, taskType, tab, currentView, currentViewPage, multiselect, reset, isJabil,
			hideButtons) {
			var oSubheaderButtons = [];
			var oAllSubheaderBtns = [];
			var oAppModel = that.oAppModel;
			var selectedTasksArray = that.oAppModel.getProperty("/selectedTasksArray");
			var i18n = that.getView().getModel("i18n").getResourceBundle();
			var inboxName = oAppModel.getProperty("/inboxName");
			var viewBtn = {
				"key": "View",
				"name": i18n.getText("VIEW_TEXT"),
				"enabled": false,// changed true to false by siva, Date: 09/09/2021
				"visible": false,// changed true to false by siva, Date: 09/09/2021
				"icon": "sap-icon://customfont/Eye"
			};
			oAllSubheaderBtns.push(viewBtn);
			var forwardBtn = {
				"key": "Forward",
				"name": i18n.getText("FORWARD_TEXT"),
				"enabled": true,
				"visible": true,
				"icon": "sap-icon://customfont/Forward"
			};
			oAllSubheaderBtns.push(forwardBtn);
			var claimBtn = {
				"key": "Claim",
				"name": i18n.getText("CLAIM_TEXT"),
				"visible": true,
				"enabled": true,
				"icon": "sap-icon://customfont/Claim"
			};
			oAllSubheaderBtns.push(claimBtn);
			var releaseBtn = {
				"key": "Release",
				"name": i18n.getText("RELEASE_TEXT"),
				"visible": true,
				"enabled": true,
				"icon": "sap-icon://customfont/Release"
			};
			oAllSubheaderBtns.push(releaseBtn);
			var approveBtn = {
				"key": "Approve",
				"name": i18n.getText("APPROVE_TEXT"),
				"visible": true,
				"enabled": true,
				"icon": "sap-icon://customfont/ApproveAccept"
			};
			oAllSubheaderBtns.push(approveBtn);
			var rejectBtn = {
				"key": "Reject",
				"name": i18n.getText("REJECT_TEXT"),
				"visible": true,
				"enabled": true,
				"icon": "sap-icon://customfont/DeclineReject"
			};
			oAllSubheaderBtns.push(rejectBtn);
			/*var deleteBtn = {
				"key": "Delete",
				"name": i18n.getText("DELETE_TEXT"),
				"enabled": false,
				"visible": false,
				"icon": "sap-icon://delete"
			};*/
			var doneBtn = {
				"key": "Done",
				"name": i18n.getText("DONE_TEXT"),
				"enabled": true,
				"visible": true,
				"icon": "sap-icon://customfont/Complete"
			};
			oAllSubheaderBtns.push(doneBtn);
			var resolveBtn = {
				"key": "Resolve",
				"name": i18n.getText("RESOLVE_TEXT"),
				"enabled": true,
				"visible": true,
				"icon": "sap-icon://customfont/Complete"
			};
			oAllSubheaderBtns.push(resolveBtn);
			var completeBtn = {
				"key": "Complete",
				"name": i18n.getText("COMPLETE_TEXT"),
				"enabled": true,
				"visible": true,
				"icon": "sap-icon://customfont/Complete"
			};
			oAllSubheaderBtns.push(completeBtn);

			//submit button for jabil tasks - vaishnavi
			var submitBtn = {
				"key": "Update",
				"name": i18n.getText("SUBMIT_TEXT"),
				"enabled": true,
				"visible": true,
				"icon": "sap-icon://customfont/ApproveAccept"
			};
			oAllSubheaderBtns.push(submitBtn);

			if (!multiselect && !reset) {
				for (var i = 0; i < selectedTasksArray[0].actions.length; i++) {
					for (var j = 0; j < oAllSubheaderBtns.length; j++) {
						if (selectedTasksArray[0].actions[i].action === oAllSubheaderBtns[j].key) {
							oSubheaderButtons.push(oAllSubheaderBtns[j]);
						}
					}
				}
			} else if (reset) {
				viewBtn.enabled = false;
				viewBtn.visible = true;
				forwardBtn.enabled = false;
				forwardBtn.visible = true;
				oSubheaderButtons.push(forwardBtn);
				oSubheaderButtons.push(viewBtn);
			} else if (multiselect) {
				oSubheaderButtons = [];
				var confirmBtn = {
					"key": "Approve",
					"name": i18n.getText("CONFIRM_TEXT"),
					"visible": true,
					"enabled": true,
					"icon": "sap-icon://customfont/ApproveAccept"
				};
				var denyBtn = {
					"key": "Reject",
					"name": i18n.getText("DENY_TEXT"),
					"visible": true,
					"enabled": true,
					"icon": "sap-icon://customfont/DeclineReject"
				};

				forwardBtn.enabled = true;
				forwardBtn.visible = true;

				oSubheaderButtons.push(forwardBtn);
				// conditions for different tabs 

				if (currentViewPage === "CompletedTasks" || tab === "PinnedTasks" || currentViewPage === "CreatedTasks") {
					// show only view
					viewBtn.enabled = false;
					viewBtn.visible = true;
					oSubheaderButtons.push(viewBtn);
				} else {
					// to have the view button always visible on the screen 
					viewBtn.enabled = false;
					viewBtn.visible = true;
					oSubheaderButtons.push(viewBtn);
				}

				if (currentViewPage === "CreatedTasks" && status === "RESOLVED") {
					completeBtn.enabled = true;
					completeBtn.visible = true;
					oSubheaderButtons.push(completeBtn);
				}

				if (currentViewPage === "Draft") {
					if (reset) {
						oAppModel.setProperty("/enableBulkDeleteButton", false);
					} else {
						oAppModel.setProperty("/enableBulkDeleteButton", true);
					}
				}

				if (currentViewPage === "MyInbox" || currentViewPage === "SubstitutionInbox" || inboxName === "Groups") {
					if (status === "READY") {
						claimBtn.enabled = true;
						claimBtn.visible = true;
						if (hideButtons.includes(claimBtn.key)) {
							claimBtn.visible = false;
							claimBtn.enabled = false;
						}
						oSubheaderButtons.unshift(claimBtn);
					} else if (status === "RESERVED") {
						releaseBtn.enabled = true;
						releaseBtn.visible = true;
						if (hideButtons.includes(releaseBtn.key)) {
							releaseBtn.visible = false;
							releaseBtn.enabled = false;
						}
						oSubheaderButtons.unshift(releaseBtn);
					}

					if (currentView === "unifiedInbox") {
						denyBtn.enabled = !hideButtons.includes(denyBtn.key);
						denyBtn.visible = !hideButtons.includes(denyBtn.key);
						oSubheaderButtons.unshift(denyBtn);
						confirmBtn.enabled = !hideButtons.includes(confirmBtn.key);
						confirmBtn.visible = !hideButtons.includes(confirmBtn.key);
						oSubheaderButtons.unshift(confirmBtn);
						if (selectedTasksArray.length === 1 && selectedTasksArray[0].processName === "SIGNING") {
							var signButton = {
								"key": "Sign",
								"name": i18n.getText("SIGN_TEXT"),
								"visible": true,
								"enabled": true,
								"icon": "sap-icon://customfont/ApproveAccept"
							};
							oSubheaderButtons.unshift(signButton);
						}
					}
				}

			}
			oAppModel.setProperty("/finalActionButtons", oSubheaderButtons);
			var oActionHeader = that.getModel("oActionHeader");
			oActionHeader.setProperty("/dtoDefaultCopy", oSubheaderButtons);
		},
		wbCommonSubheaderAction: function (that, status, taskType, tab, currentView, currentViewPage, multiselect, reset, isJabil,
			hideButtons) {
			var taskObjectDetails = that.getModel("oAppModel").getProperty("/taskObjectDetails");
			var oSubheaderButtons = [];
			var oAppModel = that.oAppModel;
			var selectedTasksArray = that.oAppModel.getProperty("/selectedTasksArray");
			var i18n = that.getView().getModel("i18n").getResourceBundle();
			var inboxName = oAppModel.getProperty("/inboxName");
			var viewBtn = {
				"key": "View",
				"name": i18n.getText("VIEW_TEXT"),
				"enabled": false,
				"visible": false,
				"icon": "sap-icon://customfont/Eye"
			};
			var forwardBtn = {
				"key": "Forward",
				"name": i18n.getText("FORWARD_TEXT"),
				"enabled": false,
				"visible": false,
				"icon": "sap-icon://customfont/Forward"
			};
			var claimBtn = {
				"key": "Claim",
				"name": i18n.getText("CLAIM_TEXT"),
				"visible": true,
				"enabled": true,
				"icon": "sap-icon://customfont/Claim"
			};
			var releaseBtn = {
				"key": "Release",
				"name": i18n.getText("RELEASE_TEXT"),
				"visible": true,
				"enabled": true,
				"icon": "sap-icon://customfont/Release"
			};
			var approveBtn = {
				"key": "Approve",
				"name": i18n.getText("CONFIRM_TEXT"),
				"visible": true,
				"enabled": true,
				"icon": "sap-icon://customfont/ApproveAccept"
			};
			var rejectBtn = {
				"key": "Reject",
				"name": i18n.getText("DENY_TEXT"),
				"visible": true,
				"enabled": true,
				"icon": "sap-icon://customfont/DeclineReject"
			};
			/*var deleteBtn = {
						"key": "Delete",
								"name": i18n.getText("DELETE_TEXT"),
								"enabled": false,
								"visible": false,
								"icon": "sap-icon://delete"
							};*/
			var resubmit = {
				"key": "Resubmit",
				"name": i18n.getText("RESUBMIT_TEXT"),
				"enabled": false,
				"visible": false,
				"icon": "sap-icon://customfont/Complete"
			};
			var doneBtn = {
				"key": "Done",
				"name": i18n.getText("DONE_TEXT"),
				"enabled": true,
				"visible": true,
				"icon": "sap-icon://customfont/Complete"
			};
			var resolveBtn = {
				"key": "Resolve",
				"name": i18n.getText("RESOLVE_TEXT"),
				"enabled": true,
				"visible": true,
				"icon": "sap-icon://customfont/Complete"
			};
			var completeBtn = {
				"key": "Complete",
				"name": i18n.getText("COMPLETE_TEXT"),
				"enabled": true,
				"visible": true,
				"icon": "sap-icon://customfont/Complete"
			};

			//submit button for jabil tasks - vaishnavi
			var submitBtn = {
				"key": "Update",
				"name": i18n.getText("SUBMIT_TEXT"),
				"enabled": true,
				"visible": true,
				"icon": "sap-icon://customfont/ApproveAccept"
			};

			if (currentViewPage === "CompletedTasks" || currentViewPage === "RequestorCompletedTasks" || tab === "PinnedTasks" || currentViewPage ===
				"CreatedTasks") {
				// show only view
				if (multiselect || reset) {
					viewBtn.enabled = false;
					viewBtn.visible = true;
				} else {
					viewBtn.enabled = true;
					viewBtn.visible = true;
				}
				oSubheaderButtons.push(viewBtn);
				// show Complete button in created task page for status === "RESOLVED"
				if (currentViewPage === "CreatedTasks" && status === "RESOLVED") {

					completeBtn.enabled = true;
					completeBtn.visible = true;
					oSubheaderButtons.unshift(completeBtn);

				}
				if (taskObjectDetails.processName === "AFENexus" && (currentViewPage === "CompletedTasks" || currentViewPage ===
						"RequestorCompletedTasks") && (status === "REJECT" || status === "REJECTED")) {
					resubmit.enabled = true;
					resubmit.visible = true;
					oSubheaderButtons.push(resubmit);
				}
			} else if (currentViewPage === "Draft") {
				if (reset) {
					oAppModel.setProperty("/enableBulkDeleteButton", false);
				} else {
					oAppModel.setProperty("/enableBulkDeleteButton", true);
				}

			} else if (currentViewPage === "AdminInbox" || currentViewPage === "MyInbox" || currentViewPage === "SubstitutionInbox" ||
				inboxName ===
				"Groups") {
				if (reset) {
					forwardBtn.enabled = false;
					forwardBtn.visible = true;
				} else {
					forwardBtn.enabled = true;
					forwardBtn.visible = true;
				}
				oSubheaderButtons.push(forwardBtn);

				if (multiselect || reset) {
					viewBtn.enabled = false;
					viewBtn.visible = true;
				} else {
					viewBtn.enabled = true;
					viewBtn.visible = true;
				}
				oSubheaderButtons.unshift(viewBtn);
				if (!reset) {
					if (currentViewPage === "MyInbox" || currentViewPage === "SubstitutionInbox" || inboxName === "Groups") {
						if (status === "READY") {
							claimBtn.enabled = true;
							claimBtn.visible = true;
							if (hideButtons.includes(claimBtn.key)) {
								claimBtn.visible = false;
								claimBtn.enabled = false;
							}
							oSubheaderButtons.unshift(claimBtn);
						} else if (status === "RESERVED") {
							releaseBtn.enabled = true;
							releaseBtn.visible = true;
							if (hideButtons.includes(releaseBtn.key)) {
								releaseBtn.visible = false;
								releaseBtn.enabled = false;
							}
							oSubheaderButtons.unshift(releaseBtn);
						}

						if (currentView === "unifiedInbox") {
							rejectBtn.enabled = !hideButtons.includes(rejectBtn.key);
							rejectBtn.visible = !hideButtons.includes(rejectBtn.key);
							oSubheaderButtons.unshift(rejectBtn);
							approveBtn.enabled = !hideButtons.includes(approveBtn.key);
							approveBtn.visible = !hideButtons.includes(approveBtn.key);
							oSubheaderButtons.unshift(approveBtn);
							if (selectedTasksArray.length === 1 && selectedTasksArray[0].processName === "SIGNING") {
								var signButton = {
									"key": "Sign",
									"name": i18n.getText("SIGN_TEXT"),
									"visible": true,
									"enabled": true,
									"icon": "sap-icon://customfont/ApproveAccept"
								};
								oSubheaderButtons.unshift(signButton);
							}

						} else {
							//if the currrent view is task detail page and process is jabil then show submit button
							if (!isJabil) {
								if (taskType === "Done") {
									doneBtn.enabled = true;
									doneBtn.visible = true;
									oSubheaderButtons.unshift(doneBtn);
								} else if (taskType === "Complete/Resolve") {
									resolveBtn.enabled = true;
									resolveBtn.visible = true;
									oSubheaderButtons.unshift(resolveBtn);
								} else if (taskType === "Approve/Reject" || taskType === null) {
									rejectBtn.enabled = true;
									rejectBtn.visible = true;
									oSubheaderButtons.unshift(rejectBtn);

									approveBtn.enabled = true;
									approveBtn.visible = true;
									oSubheaderButtons.unshift(approveBtn);
								}
							} else {
								submitBtn.enabled = true;
								submitBtn.visible = true;
								oSubheaderButtons.unshift(submitBtn);
							}
						}
					}
				}

			}

			oAppModel.setProperty("/finalActionButtons", oSubheaderButtons);
			var oActionHeader = that.getModel("oActionHeader");
			oActionHeader.setProperty("/dtoDefaultCopy", oSubheaderButtons);
		},

		wbSubheaderActionClicked: function (that, selectedAction, selectedActionText) {
			var selectedTasksArray = that.oAppModel.getProperty("/selectedTasksArray");
			var i18n = that.getView().getModel("i18n").getResourceBundle();
			that.oAppModel.setProperty("/selectedAction", selectedAction);
			if (selectedAction === "View") {
				for (var i = 0; i < selectedTasksArray.length; i++) {
					var processId = selectedTasksArray[i].processId;
					var taskId = selectedTasksArray[i].taskId;
				}
				if (that.oAppModel.getProperty("/isProcessFlowVisible")) {
					sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().closeProcessFlow(true);
				}
				sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().viewProcessFlow(
					processId, taskId, true, null);
			} else if (selectedAction === "Forward") {
				// open forward popup
				that.oAppModel.setProperty("/actionFrom", "subheader");
				sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().forwardTaskIconPress();
			} else if (selectedAction === "Claim" || selectedAction === "Release") {
				// call the action payload function 
				sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().wbPrepareActionPayload(
					selectedAction);
			} else if (selectedAction === "Resubmit") {
				// Resubmit
				that.oAppModel.setProperty("/actionFrom", "subheader");
				// sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().forwardTaskIconPress();
			} else {
				// call the comments popup.
				var actionType;
				var commentsDescData = [];
				that.oAppModel.setProperty("/actionType", null);
				var currentView = that.oAppModel.getProperty("/currentView");
				var currentViewPage = that.oAppModel.getProperty("/currentViewPage");
				var isPurchaseOrder = false;
				for (var i = 0; i < selectedTasksArray.length; i++) {
					if (selectedAction === "Approve") {
						if (selectedTasksArray[i].processName === "PurchaseOrderApprovalProcess" || selectedTasksArray[i].processName ===
							"PurchaseRequisition") {
							isPurchaseOrder = true;
						}
						actionType = i18n.getText("APPROVING_TASK_TEXT");
						if (currentView === "unifiedInbox") {
							if (selectedTasksArray[i].taskType === "Done") {
								actionType = i18n.getText("PERFORMING_DONE_ACTION");
							} else if (selectedTasksArray[i].taskType === "Complete/Resolve") {
								if (currentViewPage === "CreatedTasks") {
									actionType = i18n.getText("COMPLETE_ACTION_TEXT");
								} else {
									actionType = i18n.getText("RESOLVING_TASKS_TEXT");
								}
							}
						}
					} else if (selectedAction === "Reject") {
						if (selectedTasksArray[i].processName === "PurchaseOrderApprovalProcess" || selectedTasksArray[i].processName ===
							"PurchaseRequisition") {
							isPurchaseOrder = true;
						}
						actionType = i18n.getText("REJECTING_TASK_TEXT");
						if (currentView === "unifiedInbox") {
							if (selectedTasksArray[i].taskType === "Done" || selectedTasksArray[i].taskType === "Complete/Resolve") {
								/*** when user rejects done task the text should be user cant perform reject - vaishnavi****/
								//actionType = i18n.getText("CANNOT_PERFORM_DONE");
								actionType = i18n.getText("CANNOT_REJECT_TASKS");
							} 
							//else if (selectedTasksArray[i].taskType === "Complete/Resolve") {
							//if (currentViewPage === "CreatedTasks") {
							//actionType = i18n.getText("CANNOT_REJECT_TASKS");
							//} else {
							//actionType = "Cannot resolve Task(s):";
							//}
							//}
						}
					} else if (selectedAction === "Done") {
						actionType = i18n.getText("PERFORMING_DONE_ACTION");
					} else if (selectedAction === "Complete") {
						actionType = i18n.getText("COMPLETE_ACTION_TEXT");
					} else if (selectedAction === "Resolve") {
						actionType = i18n.getText("RESOLVING_TASKS_TEXT");
					}

					commentsDescData.push({
						"actionType": actionType,
						"description": selectedTasksArray[i].taskDescription
					});
				}
				that.oAppModel.setProperty("/commentsDescData", commentsDescData);
				that.oAppModel.refresh(true);
				if (!isPurchaseOrder) {
					sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().openCommentsFragment(
						selectedAction, selectedActionText);
				} else {
					sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().openSignInFragment();
				}
			}

		}

	};
});
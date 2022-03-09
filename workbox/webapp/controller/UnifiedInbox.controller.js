sap.ui.define([
	"oneapp/incture/workbox/controller/BaseController",
	"oneapp/incture/workbox/util/formatter",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"oneapp/incture/workbox/controlExtension/ExtDatePicker",
    "sap/ui/core/Popup",
    "sap/ui/model/Sorter"
], function (BaseController, formatter, taskManagement, workbox, utility, JSONModel, Dialog, ExtDatePicker, Popup, Sorter) {
	"use strict";

	return BaseController.extend("oneapp.incture.workbox.controller.UnifiedInbox", {
        fnSetClaimButton:function(){
        var aUsrData = this.getView().getModel("oConfigMdl").getData().usrData;
        this.getView().getModel("oConfigMdl").getData().claimVisible = false;
        this.getView().getModel("oConfigMdl").getData().ListMode = "None";
        if(aUsrData){
            var aADGroups =JSON.parse(aUsrData.adGroups);
            if(aADGroups){
                for(var i=0;i<aADGroups.length;i++){
                    if(aADGroups[i] == "IAM_P_SCP_PLC_ADMIN" || aADGroups[i] == "IAM_S_SCP_SUP_PORTAL_APPROVER"){
                        this.getView().getModel("oConfigMdl").getData().claimVisible = true;
        this.getView().getModel("oConfigMdl").getData().ListMode = "SingleSelectLeft";
                        break;
                    }
                }
            }
        }
        this.getView().getModel("oConfigMdl").refresh();
        },
		onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            var componentData = this.getOwnerComponent().getComponentData();
            
			var oAppModel = this.getOwner().getModel("oAppModel");
			var localModel = this.getOwner().getModel("ViewModel");
            this.localModel = localModel;
			this.oAppModel = oAppModel;
			this.setCurrentPage("MyInbox", "MyInbox", "My Task", false, false);
			this.oAppModel.setProperty("/currentPage", "1");
			this.oAppModel.setProperty("/isAppliedAdvancedFilter", false);
			this.oAppModel.setProperty("/currentPageTray", "1");
			this.oAppModel.setProperty("/inboxTab", "MyInbox");
            this.oAppModel.refresh(true);
         //   this.fnSetClaimButton();
            if(componentData){
            if (componentData.startupParameters.params){
                oAppModel.setProperty("/graphClicked", true);
            }
        }
			this.setChatDto();
			this.fnGetChatUsers();
			oRouter.attachRoutePatternMatched(function (oEvent) {
				if (oEvent.getParameter("name") === "UnifiedInbox") {
					this.oAppModel.setProperty("/transitionWait", false);
					this.setInboxPanel();
					oAppModel.setProperty("/currentPage", 1);
					this.oAppModel.setProperty("/currentPageTray", 1);
					this.oAppModel.setProperty("/currentView", "unifiedInbox");
					if (!oAppModel.getProperty("/graphClicked")) { //graph is not clicked
						this.oAppModel.getProperty("/sideNavItemProperties").setSelectedKey(this.oAppModel.getProperty("/currentViewPage"));
						if (this.oAppModel.getProperty("/isViewApplied")) {
							var oContext = this.getModel("oAdvanceFilterModel").getProperty("/viewAppliedContext");
							this.oAppModel.getProperty("/sideNavItemProperties").setSelectedKey(oContext.inboxId);
						}
					} else { //set to admin if graph is clicked
						if (this.getModel("oAdvanceFilterModel").getProperty("/customTileClicked")) {
							var inboxIdGraph = this.getModel("oAdvanceFilterModel").getProperty("/inboxIdGraph");
							var inboxNameGraph = this.getModel("oAdvanceFilterModel").getProperty("/inboxNameGraph");
							this.setCurrentPage(inboxIdGraph, null, inboxNameGraph, true, true);
							inboxIdGraph = "";
							inboxNameGraph = "";
							this.getModel("oAdvanceFilterModel").setProperty("/customTileClicked", false);
							this.oAppModel.setProperty("/graphClicked", false);
						} else {
							this.setCurrentPage("AdminInbox", null, "Admin Task", true, true);
						}
					}

					this.oAppModel.setProperty("/pagination/scrollClicked", false);
					this.onClickFilterDetail(); // to get the tasks according to the filter details
					if (oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
						this.getTaskBoardData();
					}
					this.resetActionButtons();
					this.collapseRightPane();
					oAppModel.setProperty("/functionality/expanded", true);
					oAppModel.setProperty("/functionality/direction", "Row");
					oAppModel.setProperty("/functionality/visibility", true);
				}
			}.bind(this));
			this.aTaskButtonsArray = [];
			this.getView().setModel(new JSONModel(), "oFilterListModel");
		},

		/****Triggred when filter panel is expanded******/

		onFilterExpand: function (oEvent) {
			var oAppModel = this.getModel("oAppModel");
			var oSource = oEvent.getSource();
			if (!this._filterFragment) {
				this._filterFragment = this._createFragment("oneapp.incture.workbox.fragment.FilterFragment", this);
				this.getView().addDependent(this._filterFragment);
				this._filterFragment.setModel(oAppModel, "oAppModel");
			}
			this._filterFragment.setModel(oAppModel, "oAppModel");
			this._filterFragment.openBy(oSource);
		},

		onAfterRendering: function () {
			var that = this;
			this.oAppModel.setProperty("/filterVisible", true);
			this.oAppModel.setProperty("/filterExpandable", false);
			this.oAppModel.setProperty("/selectedTasksArray", []);
			// removed mouseenter and mouseleave eventListener and added in css
			// $(document).ready(function () { // on hover the visibility of action buttons
			// 	$(document).on("mouseenter", ".wbCardViewList", function (oEvent) {
			// 		$(this).find(".wbInboxActionContClass").show();
			// 		$(this).find(".wbShowDateClass").show();
			// 		$(this).find(".wbShowTimeClass").hide();
			// 	}).on("mouseleave", ".wbCardViewList", function (oEvent) {
			// 		if (that.oAppModel.getProperty("/currentView") === "unifiedInbox") {
			// 			$(this).find(".wbInboxActionContClass").hide();
			// 			$(this).find(".wbShowTimeClass").show();
			// 			$(this).find(".wbShowDateClass").hide();
			// 		}
			// 	});
			// });
			/*window.oncontextmenu = function () {
				return false; // cancel default right click
			};*/
			//to restrict window's right click option
			// var id = this.getView().byId("WB_TASK_CARD_ITEM");
			// var noContext = document.getElementById(id.getId());
			// noContext.addEventListener('contextmenu', function (e) {
			// 	e.preventDefault();
			// });

			this.oAppModel.setProperty("/isRightPaneVisible", false);
			this.oAppModel.setProperty("/isTaskLevelChatVisible", false);
			this.oAppModel.setProperty("/isTaskLevelChatBotVisible", false);
			this.oAppModel.setProperty("/isProcessFlowVisible", false);
			var customTask = {
				"customProcessNames": [],
				"selectedProcess": "",
				"enableVBoxContent": true,
				"singleInstance": true,
				"multipleInstance": false,
				"customInstance": [],
				"rightClick": false
			};
			var oCustomTaskModel = new JSONModel(customTask);
			this.setModel(oCustomTaskModel, "oCustomTaskModel");
		},

		/*Development by Vaishnavi - start*/

		// on tab change, according to the corresponding tab the function will be called
		onViewChange: function (oEvent) {
			var selectedKey = oEvent.getSource().getSelectedKey();
			this.oAppModel.setProperty("/inbox/currentView", selectedKey);
			this.oAppModel.refresh();
			if (selectedKey === "PinnedTasks") {
				this.setCurrentPage("PinnedTasks", null, null, false, true);
				this.getModel("oTaskInboxModel").setProperty("/checkBoxState", false);
				this.oAppModel.setProperty("/inboxTab", selectedKey);

			} else if (selectedKey === "MyInbox") {
				this.getModel("oTaskInboxModel").setProperty("/checkBoxState", false);
				this.setCurrentPage(this.oAppModel.getProperty("/currentViewPage"), null, null, false, true);
				this.oAppModel.setProperty("/filterVisible", true); // card view func to get data
				this.oAppModel.setProperty("/inboxTab", selectedKey);

			}
			this.removeAllTokens();
			this.oAppModel.setProperty("/currentPage", "1");
			this.oAppModel.setProperty("/currentPageTray", "1");
			this.getModel("oActionHeader").setProperty("/selectedItemLength", 0);
			this.resetActionButtons();
			this.onClickFilterDetail();
			if (this.oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				this.getTaskBoardData();
			}
		},

		//on right click of table and card opening the action fragment
		openActionFragmentFn: function (oEvent) {
			var oSource;
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var details;
			if (this.oAppModel.getProperty("/WB_CARD_VIEW")) {
				oSource = oEvent.getParameters().target;
				details = oEvent.getSource().getBindingContext("oTaskInboxModel").getObject();
			} else if (this.oAppModel.getProperty("/WB_TABLE_VIEW")) {
				oSource = oEvent.getSource();
				var index = oEvent.getParameter("rowIndex");
				details = oTaskInboxModel.getProperty("/workBoxDtos")[index];
			} else if (this.oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				oSource = oEvent.getParameters().target;
				details = oEvent.getSource().getBindingContext("oTaskInboxModel").getObject();
			} else {
				oSource = oEvent.getParameters().target;
				details = oEvent.getParameter("src").oBindingContexts.oTaskInboxModel.getObject();
			}
			oTaskInboxModel.setProperty("/lineItemTaskDetails", details);
			oTaskInboxModel.setProperty("/lineItemStatus", details.status);
			oTaskInboxModel.setProperty("/lineItemOrigin", details.origin);
			oTaskInboxModel.setProperty("/lineItemTaskType", details.taskType);
			oTaskInboxModel.setProperty("/openRightClickMenu", true);
			oTaskInboxModel.setProperty("/oParentSource", oEvent.getSource().getParent());
			oTaskInboxModel.refresh(true);
			// if (!this._rightClickMenu) {
			// 	this._rightClickMenu = this._createFragment("oneapp.incture.workbox.fragment.RightClickMenu", this);
			// 	this.getView().addDependent(this._rightClickMenu);
			// }
			// this._rightClickMenu.openBy(oSource);
		},

		//clearing the properties of task details 
		closeRightClickMenu: function () {
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			oTaskInboxModel.setProperty("/lineItemStatus", "");
			oTaskInboxModel.setProperty("/lineItemOrigin", "");
			oTaskInboxModel.setProperty("/lineItemTaskType", "");
			oTaskInboxModel.refresh(true);
		},

		//on click of menu options
		menuItemPress: function (oEvent) {
			var key = oEvent.getSource().getInfo();
			key = key.toLowerCase();
			if (key === "chat") {
				this.openChat();
			} else if (key === "view") {
				this.openProcessFlow();
			} else if (key === "forward") {
				this.forwardTaskIconPress();
			} else if (key === "createsubtask") {
				this.createSubTaskFn();
			} else if (key === "delete") {
				this.onDeleteDraftFn();
			} else if (key === "pin" || key === "unpin") {
				var isRightClick = true;
				this.pinTaskFn(isRightClick);
			} else {
				this.getModel("oTaskInboxModel").setProperty("/sSelectedActionText", oEvent.getSource().getTitle());
				this.getModel("oTaskInboxModel").setProperty("/sSelectedAction", oEvent.getSource().getInfo());
				this.lineItemActionFn();
			}
			this._rightClickMenu.close();
		},

		//opening the dialog of creation of sub task and setting the properties
		createSubTaskFn: function () {
			var oCustomTaskModel = this.getModel("oCustomTaskModel");
			var processName = this.getModel("oTaskInboxModel").getProperty("/lineItemTaskDetails/processName");
			/*	this.doAjax("/oneappinctureworkbox/WorkboxJavaService/idpMapping/getUsers", "GET", null, function (oData) {
					if (oCustomTaskModel.iSizeLimit < oData.dto.length) {
						oCustomTaskModel.setSizeLimit(oData.dto.length);
					}
					oCustomTaskModel.setProperty("/dropdownLists" + "approvalOwner", oData.dto);
					oCustomTaskModel.refresh();
				}.bind(this), function (oError) {}.bind(this));*/
			oCustomTaskModel.setProperty("/selectedProcess", processName);
			this.doAjax("/oneappinctureworkbox/WorkboxJavaService/customProcess/getProcess?processType=All", "GET", null, function (oData) {
					oCustomTaskModel.setProperty("/customProcessNames", oData.processDetails);
					oCustomTaskModel.refresh();
				}.bind(this),
				function (oEvent) {}.bind(this));
			var descriptionValue = this.getView().getModel("i18n").getResourceBundle().getText("CREATE_SUBTASK_DESC_TEXT") + " " + this.getModel(
				"oTaskInboxModel").getProperty("/lineItemTaskDetails/subject") + " - " + this.getModel("oTaskInboxModel").getProperty(
				"/lineItemTaskDetails/requestId");
			var template = {
				"actionType": "Submit",
				"isEdited": null,
				"processId": "",
				"processName": this.getModel("oTaskInboxModel").getProperty("/lineItemTaskDetails/processName"),
				"requestId": null,
				"resourceid": "",
				"type": "Single Instance",
				"listOfProcesssAttributes": [{
					"resourceId": "",
					"customAttributeTemplateDto": [{
						"attachmentName": null,
						"attachmentSize": null,
						"attachmentType": null,
						"attrDes": "",
						"dataType": "TEXT AREA",
						"dataTypeKey": 0,
						"dropDownType": null,
						"isActive": true,
						"isEditable": null,
						"isEdited": 0,
						"isMandatory": true,
						"key": "description",
						"label": "Description",
						"processName": "STANDARD",
						"processType": null,
						"taskId": "",
						"url": null,
						"value": descriptionValue,
						"valueList": null,
						"editableValue": false
					}, {
						"attachmentName": null,
						"attachmentSize": null,
						"attachmentType": null,
						"attrDes": "",
						"dataType": "TEXT AREA",
						"dataTypeKey": 0,
						"dropDownType": null,
						"isActive": true,
						"isEditable": null,
						"isEdited": 0,
						"isMandatory": true,
						"key": "details",
						"label": "Details",
						"processName": "processName",
						"processType": null,
						"taskId": "",
						"url": null,
						"value": "",
						"valueList": null
					}, {
						"attachmentName": null,
						"attachmentSize": null,
						"attachmentType": null,
						"attrDes": "",
						"dataType": "ATTACHMENT",
						"dataTypeKey": 0,
						"dropDownType": null,
						"isActive": true,
						"isEditable": null,
						"isEdited": 0,
						"isMandatory": true,
						"key": "attachment",
						"label": "Attachment",
						"processName": "processName",
						"processType": null,
						"taskId": "",
						"url": null,
						"value": "",
						"valueList": null
					}, {
						"attachmentName": null,
						"attachmentSize": null,
						"attachmentType": null,
						"attrDes": "",
						"dataType": "DROPDOWN",
						"dataTypeKey": 1,
						"dropDownType": "individual",
						"isActive": true,
						"isEditable": null,
						"isEdited": 0,
						"isMandatory": true,
						"key": "approvalOwner",
						"label": "Approval Owner",
						"processName": "processName",
						"processType": null,
						"taskId": "",
						"url": null,
						"value": "",
						"valueList": null
					}]
				}]
			};
			oCustomTaskModel.setProperty("/customInstance", template);
			var that = this;
			that.oAppModel.setProperty("/draftEventId", "taskID");
			// var _subTaskTemplateContent = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.CreateNewTask", this);
			if (!this._subTaskTemplateContent) {
				this._subTaskTemplateContent = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.CreateNewTask", this);
			}
			if (!this._subTaskTemplate) {
				this._subTaskTemplate = new Dialog({
					contentWidth: "60%",
					beginButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("SUBMIT_TEXT"),
						type: "Transparent",
						press: function (oEvent) {
							that.subTaskCreationPostCall();
						}
					}).addStyleClass("wbDefaultButtonClass sapUiSizeCompact"),
					endButton: new sap.m.Button({
						text: this.getView().getModel("i18n").getResourceBundle().getText("CANCEL_TEXT"),
						type: "Reject",
						press: function (oEvent) {
							that.onCloseCreateSubTaskFragment();
						}
					}).addStyleClass("wbAdminMGroupsRemoveBulkBtn sapUiSizeCompact")
				});
				this._subTaskTemplate.setCustomHeader(new sap.m.Toolbar({}).addContent(new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText("CREATE_SUB_TASK") + " - " + this.getModel(
								"oTaskInboxModel")
							.getProperty("/lineItemTaskDetails/requestId")
					})).addStyleClass("wbInboxTableHeaderText")
					.addContent(new sap.m.ToolbarSpacer({

					}))
					.addContent(new sap.ui.core.Icon({
						src: "sap-icon://decline",
						press: function (oEvent) {
							that.onCloseCreateSubTaskFragment();
						}
					}).addStyleClass("wbDialogCloseIcon")));
				this._subTaskTemplate.addContent(this._subTaskTemplateContent);
				this.getView().addDependent(this._subTaskTemplate);
			}
			this._subTaskTemplate.open();
			var mainVBox = this._subTaskTemplateContent.getItems()[1].getItems()[1];
			mainVBox.removeAllItems();
			mainVBox.addItem(new sap.ui.layout.cssgrid.CSSGrid({
				gridTemplateColumns: "1fr 1fr",
				gridGap: "1rem "
			}));
			var gridContent = mainVBox.getItems()[0];
			gridContent.bindAggregation("items",
				"oCustomTaskModel>/customInstance/listOfProcesssAttributes/0/customAttributeTemplateDto",
				function (
					index, context) {
					var VBox;
					var bindingObject = context.getObject();
					var bindingPath = context.getPath();
					VBox = taskManagement.addGridContentSingleInstanceTM(bindingObject, bindingPath, ExtDatePicker, oCustomTaskModel, this);
					return VBox;
				}.bind(that));
		},

		//creation of sub task post call and validation
		subTaskCreationPostCall: function () {
			var that = this;
			var oCustomTaskModel = this.getModel("oCustomTaskModel");
			var data = oCustomTaskModel.getProperty("/customInstance");
			var validationCheck;
			var attributes = data.listOfProcesssAttributes[0].customAttributeTemplateDto;
			for (var i = 0; i < attributes.length; i++) {
				if (attributes[i].isMandatory) {
					if (!attributes[i].value && attributes[i].dataType !== "DROPDOWN") {
						validationCheck = 1;
					} else if (attributes[i].dataType === "DROPDOWN" && attributes[i].dropDownType === "Resource") {
						if (!attributes[i].valueList || !attributes[i].valueList.length) {
							validationCheck = 1;
						}
					}
				}
			}
			if (!validationCheck) {
				this.doAjax("/oneappinctureworkbox/WorkboxJavaService/tasks/createTasks", "POST", data, function (oData) {
					if (oData.status !== "FAILURE") {
						that._showToastMessage(oData.message);
						that.setInboxPanel();
						that.onClickFilterDetail();
						that.oAppModel.setProperty("/draftEventId", "");
						that.oAppModel.setProperty("/draftProcessId", "");
						var customTask = {
							"selectedProcess": "",
							"enableVBoxContent": false,
							"singleInstance": false,
							"multipleInstance": false
						};
						oCustomTaskModel.setData(customTask);
					}
				}.bind(this), function (oEvent) {}.bind(this));
				this.onCloseCreateSubTaskFragment();
			} else {
				that._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			}
		},

		//closing of sub task creation fragment and resetting the properties
		onCloseCreateSubTaskFragment: function () {
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			oTaskInboxModel.setProperty("/lineItemTaskDetails", null);
			oTaskInboxModel.setProperty("/lineItemStatus", null);
			oTaskInboxModel.setProperty("/lineItemOrigin", null);
			oTaskInboxModel.setProperty("/lineItemTaskType", null);
			oTaskInboxModel.setProperty("/openRightClickMenu", false);
			oTaskInboxModel.setProperty("/oParentSource", null);
			oTaskInboxModel.refresh(true);
			this._subTaskTemplate.close();
		},

		/*Development by Vaishnavi - end*/

		/***Function to get the tasks****/
		/*Development by Varali - 13/04/2020 -Start*/

		createTableJson: function () {
			var oTableModel = this.getModel("oTaskInboxModel");
			var tableData = oTableModel.getData().workBoxDtos;
			var customAttributes = oTableModel.getData().customAttributes;
			if (tableData) {
				this.getView().byId("ID_TASK_TABLE").setVisibleRowCount(tableData.length);
				var columnHeaders = oTableModel.getData().headerDto.headers;
				var lineItemData = [];
				for (var i = 0; i < tableData.length; i++) {
					var obj = {};
					for (var j = 0; j < columnHeaders.length; j++) {
						if (columnHeaders[j].type === "STANDARD") {
							obj[columnHeaders[j].key] = tableData[i][columnHeaders[j].key];
						}

						if (columnHeaders[j].type === "CUSTOM") {
							obj[columnHeaders[j].key] = customAttributes[i][columnHeaders[j].key];
						}
					}
					obj.requestId = tableData[i].requestId;
					obj.createdAt = this.formatter.wbDateFormatter(tableData[i].createdAt) + " " + this.formatter.wbTimeFormatter(tableData[i].createdAt);
					obj.startedBy = tableData[i].startedBy;
					obj.description = tableData[i].taskDescription;
					obj.processName = tableData[i].processName;
					obj.subject = tableData[i].subject;
					obj.status = tableData[i].businessStatus;
					lineItemData.push(obj);
				}
				oTableModel.getData().headerData = columnHeaders;
				oTableModel.getData().lineItemData = lineItemData;
				this.createTable();
			} else {
				oTableModel.getData().headerData = [];
				oTableModel.getData().lineItemData = [];
				this.createTable();
			}
		},

		createTable: function () {
			var taskTable = this.getView().byId("ID_TASK_TABLE");
			var oAppModel = this.oAppModel;
			var selectionMode = oAppModel.getProperty("/tableSelection");
			this.getView().byId("ID_TASK_TABLE").setSelectionMode(selectionMode);
			var oTaskTableModel = this.getModel("oTaskInboxModel");
			taskTable.setModel(oTaskTableModel);
			var headerData = oTaskTableModel.getData().headerData;
			for (var i = 0; i < headerData.length; i++) {
				headerData[i].name = oTaskTableModel.getData().headerData[i].name.toUpperCase();
			}
			if (headerData.length !== 0) {
				oTaskTableModel.getData().headerData[1].name.toUpperCase();
			}

			taskTable.bindColumns("/headerData", function (sId, oContext) {
				var columnName = oContext.getObject().name;
				var template = oContext.getObject().key;
				return new sap.ui.table.Column({
					label: columnName,
					template: template,
					sortProperty: template

				});
			});
			taskTable.bindRows("/lineItemData");
		},
		/*Development by Varali - 13/04/2020 -end*/

		/*Development by Vaishnavi - start*/

		//getting the task baord details
		getTaskBoardData: function () {
			this.clearFilters();
			this.removeAllTokens(false)
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var inboxType = this.oAppModel.getProperty("/inboxType");
			var page = this.oAppModel.getProperty("/currentPageTray");
			var url = "/oneappinctureworkbox/WorkboxJavaService/inbox/filterService?inboxType=" + inboxType + "&page=" + page;
			oTaskInboxModel.setProperty("/taskBoardBusyIndicator", true);
			this.doAjax(url, "GET", null, function (oData) {
				oTaskInboxModel.setProperty("/taskBoardDto", oData.workboxStoryBoardDto);
				this.oAppModel.setProperty("/taskBoardPageCount", oData.count);
				oTaskInboxModel.setProperty("/taskBoardBusyIndicator", false);
				oTaskInboxModel.refresh(true);
				this.oAppModel.refresh(true);
				this.pagination();
			}.bind(this), function (oError) {}.bind(this));
		},

		//opening the filter fragment to save new try
		openFilterTrayFn: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.onOpenAdvFilter();
		},

		//function to get the tasks of tray - pagination 
		loadTrayTasksFn: function (oEvent) {
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var obj = oEvent.getSource().getBindingContext("oTaskInboxModel").getObject();
			var advFilter = JSON.parse(obj.filterData);
			var filterData = {};
			filterData.advanceFilter = {};
			filterData.inboxType = advFilter.inboxType;
            filterData.advanceFilter.advanceSearch = ad
            vFilter.advanceSearch;
			filterData.advanceFilter.filterMap = advFilter.filterMap;
			filterData.page = Math.ceil(obj.workBoxDtos.length / 20) + 1;
			var url = "/oneappinctureworkbox/WorkboxJavaService/inbox/filterService";
			this.doAjax(url, "POST", filterData, function (oEvent) {
				if (oEvent.workBoxDtos && oEvent.workBoxDtos.length) {
					obj.workBoxDtos = obj.workBoxDtos.concat(oEvent.workBoxDtos);
				}
				if (obj.workBoxDtos.length > 100) {
					oTaskInboxModel.setSizeLimit(obj.workBoxDtos.length);
				}
				oTaskInboxModel.refresh(true);
			}.bind(this), function (oEvent) {}.bind(this));

		},

		/**** filterDto function *****/
		// fetching the values from filter and passing filtered data and url to hit the service
		onClickFilterDetail: function () {
			var oAppModel = this.oAppModel;
			var filterData = {};
			filterData.quickFilter = {};
			var filterTokens = [],
				advanceFilter = [];
			var url;
			var currPage = oAppModel.getProperty("/currentPage");

			//if graph is clicked then fetching the graph values and getting the inbox details
			if (oAppModel.getProperty("/graphClicked")) {
                var startupParameters = this.getOwnerComponent().getComponentData().startupParameters;
                if (startupParameters.graph){
                   var graphName = startupParameters.graph.toString();
                    if (graphName === "totalActiveGraph"){

                        filterData.quickFilter.processName = startupParameters.processName.toString().replaceAll("%20", "");
                        filterData.quickFilter.freeFilter = startupParameters.measureNames.toString().replaceAll("%20", " ");

                    } else if (graphName === "taskCompletionTrend"){

                        filterData.quickFilter.duration = startupParameters.duration.toString();
                        filterData.quickFilter.status = startupParameters.status.toString().replace("%20", " ");

                    } else if (graphName === "userWorkLoad") {

                        filterData.quickFilter.freeFilter = startupParameters.measureNames.toString().replaceAll("%20", " ");
                        filterData.quickFilter.userId = startupParameters.userId.toString().replaceAll("%40", "@");;
                        
                    } else if (graphName === "donutGraph") {

                        filterData.quickFilter.freeFilter = startupParameters.taskName.toString().replaceAll("%20", " ");
                        filterData.quickFilter.status = startupParameters.status.toString().replaceAll("%20", " ");
                    }
                    
                    // if (graphName === "taskCompletionTrend"){
                    //     oAppModel.setProperty("/inboxType", "CompletedTasks");
                    //     filterData.inboxType = "CompletedTasks"
                    // } else {
                    filterData.inboxType = "AdminInbox" 
                    //}
                }
                filterData.page = currPage;
                
                oAppModel.setProperty("/graphClicked", false);
            }
            
			//remove token functionality
			else if (oAppModel.getProperty("/removeFilterToken")) {
				filterData = oAppModel.getProperty("/filterData");
				filterData.page = currPage;
				filterData.inboxType = oAppModel.getProperty("/inboxType");
			}
			//fetching the search filter values and getting the inbox details
			else {
				filterData.inboxType = oAppModel.getProperty("/inboxType");
				filterData.page = currPage;
				if (oAppModel.getProperty("/freeFilter") !== "") {
					filterData.quickFilter.freeFilter = this.oAppModel.getProperty("/freeFilter");
				}
				if (this.oAppModel.getProperty("/inboxName")) {
					filterData.inboxName = this.oAppModel.getProperty("/inboxName");
				}
				if (oAppModel.getProperty("/isAppliedAdvancedFilter")) {
					filterData.advanceFilter = this.oAppModel.getProperty("/advanceFilterDetail");
				}
			}
			if (oAppModel.getProperty("/isAppliedAdvancedFilter")) {
				advanceFilter = this.oAppModel.getProperty("/advFilterTokens");
			}
			if (oAppModel.getProperty("/isViewApplied")) {
				filterData.inboxType = this.getModel("oAdvanceFilterModel").getProperty("/searchInboxType");
			}
			if (graphName === "taskCompletionTrend" || filterData.quickFilter.freeFilter === "CompletedOnTime" || filterData.quickFilter.freeFilter === "CompletedSLABreached" ) {
				filterData.sortingDtos = [{
					"orderBy": "completedAt",
					"orderType": "DESC"
				}];
			}
			//splitting the tokens if one token has multiple values 
			//var parsedFilters = this.getFilterSearchFilters(filterData, filterTokens);
			// oAppModel.setProperty("/filterTokens", parsedFilters.filterTokens);
			// oAppModel.setProperty("/filterData", parsedFilters.filterData);
			url = "/oneappinctureworkbox/WorkboxJavaService/inbox/filterService";
			this.getAllTasks(filterData, url);
		},

		getAllTasks: function (filterData, url) { //	getting the filtered data, url to get all tasks
			var that = this;
			var oTaskInboxModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oTaskInboxModel, "oTaskInboxModel");
			oTaskInboxModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "POST", filterData, function (oEvent) {
				oTaskInboxModel.setProperty("/", oEvent);
				oTaskInboxModel.setProperty("/selectedItemsCount", 0);
				oTaskInboxModel.setProperty("/inboxType", "MyInbox");
				that.oAppModel.setProperty("/removeFilterToken", false);
				that.oAppModel.setProperty("/inbox", oEvent);
				that.oAppModel.setProperty("/totalTaskCount", oTaskInboxModel.getProperty("/").count);
				this._oAdvanceFilter = this.getModel("oAdvanceFilterModel").getProperty("/oSearchFilter");
				if (this._oAdvanceFilter && this._oAdvanceFilter.isOpen()) {
					this._oAdvanceFilter.close();
				}
				that.collapseRightPane();
			//	that.createTableJson();

				if (this._filterTokensPopover && this._filterTokensPopover.isOpen()) {
					this._filterTokensPopover.close();
				}
				if (!that.oAppModel.getProperty("/inbox/workBoxDtos")) {
					that.oAppModel.setProperty("/inbox/workBoxDtos", []);
				}

				that.pagination(); // function for pagination
				oTaskInboxModel.setProperty("/enableBusyIndicators", false);

				if (this.getModel("oActionHeader")) {
					this.getModel("oActionHeader").setProperty("/selectedItemLength", 0);
					this.resetActionButtons();
				}
				this.oAppModel.refresh(true);
			}.bind(this), function (oEvent) {}.bind(this));
		},

		//to refresh the inbox with basic filter data and disabling the graph click property
		refreshInboxFn: function () {
			var oAppModel = this.oAppModel;
			oAppModel.setProperty("/removeFilterToken", false);
			if (oAppModel.getProperty("/graphClicked")) {
				if (oAppModel.getProperty("/currentViewPage") === "CompletedTasks") {
					this.setCurrentPage(null, "AdminInbox", "Admin Tasks", true, true);
				}
				oAppModel.setProperty("/graphClicked", false);
			}
			oAppModel.setProperty("/currentPage", "1");
            this.oAppModel.setProperty("/currentPageTray", "1");
            this.removeAllTokens();
            this.onClickFilterDetail();
			this.getModel("oActionHeader").setProperty("/selectedItemLength", 0);
			this.resetActionButtons();
			this.setInboxPanel();
			if (oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				this.getTaskBoardData();
			}
		},

		//to get the table setting fragment and setting the values
		onClickTableSettings: function () {
			var that = this;
			if (!this._oTableSettings) {
				var _oTableSettingsContent = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.CustomAttributeView", this);
				this._oTableSettings = new Dialog({
					contentWidth: "64%"
				});
				this._oTableSettings.setCustomHeader(new sap.m.Toolbar({}).addContent(new sap.m.Text({
						text: this.getView().getModel("i18n").getResourceBundle().getText("TABLE_CONFIGURATION_TEXT")
					})).addStyleClass("wbInboxTableHeaderText")
					.addContent(new sap.m.ToolbarSpacer({

					}))
					.addContent(new sap.ui.core.Icon({
						src: "sap-icon://decline",
						press: function (oEvent) {
							that.onCloseTabConfigFragment(oEvent);
						}
					}).addStyleClass("wbDialogCloseIcon")));
				this._oTableSettings.addContent(_oTableSettingsContent);
				this.getView().addDependent(this._oTableSettings);
			}
			this._oTableSettings.open();
			if (!this.getModel("oDefaultDataModel")) {
				var oDefaultDataModel = new JSONModel();
				this.getView().setModel(oDefaultDataModel, "oDefaultDataModel");
				var selectedProcess = this.getModel("oConstantsModel").getProperty("/processNamesList")[0].processName;
				this.getModel("oConstantsModel").setProperty("/selectedProcess", selectedProcess);
				this.getCustomAttributes();
			}
		},

		//to get the custom attributes
		getCustomAttributes: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oAppModel = this.oAppModel;
			var processName = this.getModel("oConstantsModel").getProperty("/selectedProcess");
			var userID = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var surl = "/oneappinctureworkbox/WorkboxJavaService/customHeaders/getCustomTemplates?userId=" + userID + "&processName=STANDARD";
			this.doAjax(surl, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/standardTemplateDetails", oData.customAttributeTemplates);
			}.bind(this), function (oError) {}.bind(this));
			var url = "/oneappinctureworkbox/WorkboxJavaService/customHeaders/getCustomTemplates?userId=" + userID + "&processName=" + processName;
			oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/customAttributeDetails", oData.customAttributeTemplates);
				oAppModel.setProperty("/isChanged", false);
				var data1 = oDefaultDataModel.getProperty("/customAttributeDetails");
				oDefaultDataModel.setProperty("/maxCustomAttrCount", 3);
				var customData = [];
				var sequence = 1;
				var data = [];
				for (var z = 0; z < data1.length; z++) {
					if (data1[z].processName !== "STANDARD") {
						data.push(data1[z]);
					}
				}
				for (var i = 0; i < data.length; i++) {
					if (data[i].isActive) {
						data[i].sequenceNo = sequence;
						data[i].newLabel = data[i].label;
						customData.push(data[i]);
						sequence++;
					}
				}
				for (var j = 0; j < data.length; j++) {
					if (!data[j].isActive) {
						data[j].sequenceNo = sequence;
						data[j].newLabel = data[j].label;
						customData.push(data[j]);
						sequence++;
					}
				}
				oDefaultDataModel.setProperty("/customAttributeDetails", customData);
				oAppModel.refresh(true);
				oDefaultDataModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		//on dropping the list item the sequence no and isActive is set
		onDropListItem: function (oInfo) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),
				oGrid = oDragged.getParent(),
				oDefaultDataModel = this.getModel("oDefaultDataModel"),
				oData = this.getModel("oDefaultDataModel").getProperty("/customAttributeDetails"),
				iDragPosition = oGrid.indexOfItem(oDragged),
				iDropPosition = oGrid.indexOfItem(oDropped);

			// remove the item
			var oItem = oData[iDragPosition];
			oData.splice(iDragPosition, 1);

			if (iDragPosition < iDropPosition) {
				iDropPosition--;
			}

			// insert the control in target aggregation
			if (sInsertPosition === "Before") {
				oData.splice(iDropPosition, 0, oItem);
			} else {
				oData.splice(iDropPosition + 1, 0, oItem);
			}

			var limit = oDefaultDataModel.getProperty("/maxCustomAttrCount");
			for (var i = 0; i < oData.length; i++) {
				oData[i].sequenceNo = i + 1;
				if (i < limit) {
					oData[i].isActive = true;
				} else {
					oData[i].isActive = false;
				}
			}
			oDefaultDataModel.setProperty("/customAttributeDetails", oData);
		},

		//change in standard attributes
		addStandardAttributes: function (oEvent) {
			var newValue = oEvent.getSource().getValue();
			if (!newValue.replace(/\s/g, "").length) {
				oEvent.getSource().setValue("");
			}
			if (!oEvent.getSource().getValue()) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValueStateText("Label should not be empty");
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
			this.getModel("oDefaultDataModel").setProperty("/standardAttributeChange", true);
		},

		//on saving the custom attributes in user level - post call
		onSaveTableConfigFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var customData = oDefaultDataModel.getProperty("/customAttributeDetails");
			var postData = [];
			var userID = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			for (var i = 0; i < customData.length; i++) {
				var obj = {
					"userId": this.oAppModel.getProperty("/loggedInUserDetails/userId"),
					"processName": this.getModel("oConstantsModel").getProperty("/selectedProcess"),
					"key": customData[i].key,
					"label": customData[i].newLabel,
					"sequence": customData[i].sequenceNo,
					"isActive": customData[i].isActive,
					"dataType": customData[i].dataType
				};
				postData.push(obj);
			}
			var validationCheck;
			if (oDefaultDataModel.getProperty("/standardAttributeChange")) {
				var standardData = oDefaultDataModel.getProperty("/standardTemplateDetails");
				for (var i = 0; i < standardData.length; i++) {
					standardData[i].userId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
					if (!standardData[i].label) {
						validationCheck = 1;
					}
				}
				if (validationCheck) {
					this._showToastMessage(i18n.getText("LABEL_NOT_EMPTY"));
				} else {
					postData = standardData.concat(postData);
				}
			}
			if (!validationCheck) {
				var url = "/oneappinctureworkbox/WorkboxJavaService/customHeaders/saveCustomAttributes?userId=" + userID;
				this.doAjax(url, "POST", postData, function (oData) {
						this._showToastMessage(oData.message);
						this.getCustomAttributes();
						this.onClickFilterDetail();
						oDefaultDataModel.setProperty("/standardAttributeChange", false);
					}.bind(this),
					function (oData) {}.bind(this));
			}
			oDefaultDataModel.refresh();
		},

		//closing table configuration fragment
		onCloseTabConfigFragment: function (oEvent) {
			this._oTableSettings.close();
		},

		onEditDraftFn: function (oEvent) {
			var object = oEvent.getSource().getBindingContext("oTaskInboxModel").getObject();
			this.oAppModel.setProperty("/draftEventId", object.taskId);
			this.oAppModel.setProperty("/draftProcessId", object.processId);
			this._doNavigate("CreateTask", {});
		},

		onDeleteDraftFn: function (oEvent) {
			var object;
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			if (oTaskInboxModel.getProperty("/openRightClickMenu")) {
				object = oTaskInboxModel.getProperty("/lineItemTaskDetails");
			} else {
				object = oEvent.getSource().getBindingContext("oTaskInboxModel").getObject();
			}
			var url = "/oneappinctureworkbox/WorkboxJavaService/tasks/deleteDraft/" + object.processId + "/" + object.requestId;
			this.doAjax(url, "GET", null, function (oData) {
				oTaskInboxModel.setProperty("/openRightClickMenu", false);
				this.setInboxPanel();
				this._showToastMessage(oData.message);
				this.onClickFilterDetail();
			}.bind(this), function (oError) {}.bind(this));
		},

		//pin task functionality
		pinTaskFn: function (oEvent) {
			var object;
			if (oEvent === true) {
				object = this.getModel("oTaskInboxModel").getProperty("/lineItemTaskDetails");
			} else {
				object = oEvent.getSource().getBindingContext("oTaskInboxModel").getObject();
			}
			var url = "/oneappinctureworkbox/WorkboxJavaService/inbox/pinned";
			var status = true;
			if (object.pinned === true) {
				status = false;
			}
			var payload = {
				"pinnedTaskId": object.taskId,
				"isPinned": status
			};
			this.doAjax(url, "POST", payload, function (oData) {
				this.onClickFilterDetail();
			}.bind(this), function (oError) {}.bind(this));
		},

		//opening the task detail page
		fetchDetailsFn: function (oEvent) {
			var e = oEvent;
			var oAppModel = this.oAppModel;
			var taskDetails;
			if (oAppModel.getProperty("/currentViewPage") !== "Draft") {
				if (oAppModel.getProperty("/WB_CARD_VIEW")) {
					oAppModel.setProperty("/taskObjectDetails", oEvent.getSource().getBindingContext("oTaskInboxModel").getObject());
				} else if (oAppModel.getProperty("/WB_TABLE_VIEW")) {
					var index = oEvent.getParameter("rowIndex");
					taskDetails = this.getModel("oTaskInboxModel").getProperty("/workBoxDtos")[index];
					oAppModel.setProperty("/taskObjectDetails", taskDetails);
				} else if (oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
					oAppModel.setProperty("/taskObjectDetails", oEvent.getSource().getBindingContext("oTaskInboxModel").getObject());
				} else {
					if (oEvent.getParameter("appointments")) {
						var title = this.getView().getModel("i18n").getResourceBundle().getText("MULTIPLE_SELECTION_ERROR_TITLE");
						var msg = this.getView().getModel("i18n").getResourceBundle().getText("MULTIPLE_SELECTION_ERROR_TEXT");
						this._createConfirmationMessage(title, msg, "Warning", "OK", "OK", false, function () {}, function () {
							var appointments = e.getSource().getSelectedAppointments();
							var id;
							for (var i = 0; i < appointments.length; i++) {
								id = e.getSource().getSelectedAppointments()[i];
								sap.ui.getCore().byId(id).setSelected(false);
							}
						}).bind(this);
						return;
					}
					oAppModel.setProperty("/taskObjectDetails", oEvent.getParameter("appointment").getBindingContext("oTaskInboxModel").getObject());
				}
				// To check whether task detail should open in new tab or not
				this.checkNewTaskDetailTab();
			}
		},

		//To check whether task detail should open in new tab or not
		checkNewTaskDetailTab: function () {
			var oAppModel = this.oAppModel;
			var taskDetails = oAppModel.getProperty("/taskObjectDetails");
			//opening task detail in a new tab for resource planning tasks
			var checkString = taskDetails.processName.startsWith("DT");
			if (taskDetails.processName === "SIGNING") {
				this.getSigningProcessURl(taskDetails.processId);
			} else {
				if (taskDetails.processName === "ResourcePlanning" || checkString || taskDetails.processName ===
					"ResourcePlanningWorkflowForRMG" || taskDetails.processName === "AnnualLeavePlannerForRMG") {
					this.openNewTaskDetailTab(taskDetails);
				} else {
					this.navigateTaskDetailPage();
				}
			}
		},

		//to get the url of signing process
		getSigningProcessURl: function (processId) {
			var hUrl = "/oneappinctureworkbox/WorkboxJavaService/docusign/sign";
			var data = {
				"processId": processId,
				"puserId": this.oAppModel.getProperty("/loggedInUserId")
			};
			this.doAjax(hUrl, "POST", data, function (oData) {
				if (oData.message.toLowerCase === "failure") {
					this._showToastMessage(oData.message);
				}
				this.oAppModel.setProperty("/taskObjectDetails/url", oData.data.url);
				this.oAppModel.refresh(true);
				this.navigateTaskDetailPage();
			}.bind(this), function (oError) {}.bind(this));
		},

		//opening task detail in a new tab for resource planning tasks
		openNewTaskDetailTab: function (taskDetails) {
			var url = taskDetails.url;
			var newWindow = window.open(url);
			var that = this;
			window.callParentWindowFunction = function () {
				that.refreshInboxFn();
			};
		},

		//navigating to task detail page
		navigateTaskDetailPage: function () {
			// If current page is task detail call route pattern match function - condition satisfied in notification
			if (this.oAppModel.getProperty("/currentView") === "taskDetailPage") {
				sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.TaskDetail').getController().setTaskDetailPage();
			} else {
				// Navigate to task detail if current page is not task detail
				this.oAppModel.setProperty("/previousPage", this.oAppModel.getProperty("/currentViewPage"));
				this._doNavigate("TaskDetail", {});
			}
		},

		/*Development by Vaishnavi - end*/

		//function to set the pagination details
		pagination: function () {
			var oAppModel = this.oAppModel;
			var totalTasks;
			var currPage;
			var pageCount;

			//according to the current view page and the data, the pagination visibility is set - vaishnavi
			if (!oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				if (oAppModel.getProperty("/inbox/workBoxDtos").length === 0) {
					oAppModel.setProperty("/pagination/pageVisible", false);
				} else {
					oAppModel.setProperty("/pagination/pageVisible", true);
				}
				totalTasks = oAppModel.getProperty("/totalTaskCount");
				currPage = oAppModel.getProperty("/currentPage");
				pageCount = oAppModel.getProperty("/inbox/pageCount");
			} else {
				totalTasks = oAppModel.getProperty("/taskBoardPageCount");
				if (totalTasks) {
					oAppModel.setProperty("/pagination/pageVisible", true);
				} else {
					oAppModel.setProperty("/pagination/pageVisible", false);
				}
				currPage = oAppModel.getProperty("/currentPageTray");
				pageCount = 4;
			}

			var pages = parseInt(totalTasks / pageCount, 10);
			var remainder = totalTasks % pageCount;
			if (remainder) {
				pages = pages + 1;
			}
			var totalPage = pages;
			oAppModel.setProperty("/pagination/numberOfPages", pages);
			if (pages > 5) {
				pages = 5;
			}

			var endPage;
			if ((parseInt(currPage, 10) + 4) < totalPage) {
				endPage = parseInt(currPage, 10) + 4;
			} else {
				endPage = totalPage;
			}

			var pageArray = [];
			if (parseInt(currPage, 10) === 1) {
				for (var i = parseInt(currPage, 10); i <= endPage; i++) {
					var page = {
						"page": i
					};
					pageArray.push(page);
				}
				if (!oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
					oAppModel.setProperty("/pagination/pages", pageArray);
					oAppModel.setProperty("/currentPage", currPage);
				} else {
					oAppModel.setProperty("/currentPageTray", currPage);
					oAppModel.setProperty("/pagination/taskBoardPages", pageArray);
				}
			} else {
				if (!oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
					pageArray = oAppModel.getProperty("/pagination/pages");
					oAppModel.setProperty("/currentPage", currPage);
				} else {
					oAppModel.setProperty("/currentPageTray", currPage);
					pageArray = oAppModel.getProperty("/pagination/taskBoardPages");
				}
			}

			if (pageArray.length) {
				if (parseInt(pageArray[pageArray.length - 1].page, 10) === parseInt(totalPage, 10)) {
					oAppModel.setProperty("/pagination/pageNextVisible", false);
				} else {
					oAppModel.setProperty("/pagination/pageNextVisible", true);
				}

				if (parseInt(pageArray[0].page, 10) === 1) {
					oAppModel.setProperty("/pagination/pagePrevVisible", false);
				} else {
					oAppModel.setProperty("/pagination/pagePrevVisible", true);
				}
			}
			oAppModel.refresh(true);
		},

		onPageClick: function (oEvent) {
			var oAppModel = this.oAppModel;
			oAppModel.getProperty("/pagination/scrollClicked", false);
			var selectedPage = oEvent.getSource().getText();
			if (!oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				oAppModel.setProperty("/currentPage", selectedPage);
				this.onClickFilterDetail();
			} else {
				oAppModel.setProperty("/currentPageTray", selectedPage);
				this.getTaskBoardData();
			}
		},

		onScrollRight: function () {
			var oAppModel = this.oAppModel;
			oAppModel.getProperty("/pagination/scrollClicked", true);
			var currentPage;
			if (!oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				currentPage = parseInt(oAppModel.getProperty("/currentPage"), 10);
			} else {
				currentPage = parseInt(oAppModel.getProperty("/currentPageTray"), 10);
			}
			var numberOfPages = oAppModel.getProperty("/pagination/numberOfPages");
			var pageArray = [];
			for (var i = parseInt(currentPage, 10); i <= (parseInt(currentPage, 10) + 4); i++) {
				var page = {
					"page": i
				};
				pageArray.push(page);
			}
			if (parseInt(pageArray[pageArray.length - 1].page, 10) === parseInt(numberOfPages, 10)) {
				oAppModel.setProperty("/pagination/pageNextVisible", false);
			} else {
				oAppModel.setProperty("/pagination/pageNextVisible", true);
			}

			if (!oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				oAppModel.setProperty("/pagination/pages", pageArray);
				oAppModel.setProperty("/currentPage", currentPage + 1);
				this.onClickFilterDetail();
			} else {
				oAppModel.setProperty("/pagination/taskBoardPages", pageArray);
				oAppModel.setProperty("/currentPageTray", currentPage + 1);
				this.getTaskBoardData();
			}
			oAppModel.refresh(true);
		},

		onScrollLeft: function () {
			var oAppModel = this.oAppModel;
			oAppModel.getProperty("/pagination/scrollClicked", true);
			var currentPage;
			var paginatedData;
			if (!oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				currentPage = parseInt(oAppModel.getProperty("/currentPage"), 10);
				paginatedData = oAppModel.getProperty("/pagination/pages");
			} else {
				currentPage = parseInt(oAppModel.getProperty("/currentPageTray"), 10);
				paginatedData = oAppModel.getProperty("/pagination/taskBoardPages");
			}
			var startValue = parseInt(paginatedData[0].page, 10);
			var startNumber = 1;
			var pageArray = [];
			if ((startValue - 1) === 1) {
				startNumber = 1;
			} else {
				startNumber = startValue - 1;
			}

			for (var i = startNumber; i <= (startNumber + 4); i++) {
				var page = {
					"page": i
				};
				pageArray.push(page);
			}
			if (!oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				oAppModel.setProperty("/pagination/pages", pageArray);
				oAppModel.setProperty("/currentPage", currentPage - 1);
				this.onClickFilterDetail();
			} else {
				oAppModel.setProperty("/pagination/taskBoardPages", pageArray);
				oAppModel.setProperty("/currentPageTray", currentPage - 1);
				this.getTaskBoardData();
			}
			oAppModel.refresh(true);
		},

		/***Funtion to get the check box on list hover***/
		onListUpdateFinished: function (oEvent) {
			var oSource = oEvent.getSource();
			oSource.getItems().forEach(function (r) {
				r.$().find('.sapMCb').children().hide();
			});
		},

		onMoreActionsClick: function (oEvent) {

		},

		/*Function triggred when clicked on Card or Table Segmented button*/
		onTaskViewChange: function (oEvent) {
			var oAppModel = this.getModel("oAppModel");
			var sSelectedViewKey = oEvent.getSource().getSelectedKey();
			var oActionHeader = this.getModel("oActionHeader");
			var sCurrentViewPage = oAppModel.getProperty("/currentViewPage");
			oActionHeader.setProperty("/selectedItemLength", 0);
			this.resetActionButtons();
			this.getModel("oTaskInboxModel").setProperty("/checkBoxState", false);
			this.getView().byId("WB_TASK_CARD_ITEM").removeSelections();
			this.getView().byId("ID_TASK_TABLE").clearSelection();
			this.collapseRightPane();
			oAppModel.setProperty("/enableBulkDeleteButton", false);
			if (sSelectedViewKey === "WB_CARD_VIEW") {
				oAppModel.setProperty("/WB_CARD_VIEW", true);
				oAppModel.setProperty("/WB_TABLE_VIEW", false);
				oAppModel.setProperty("/WB_CALENDAR_VIEW", false);
				oAppModel.setProperty("/WB_TASK_BOARD_VIEW", false);
			} else if (sSelectedViewKey === "WB_TABLE_VIEW") {
				oAppModel.setProperty("/WB_CARD_VIEW", false);
				oAppModel.setProperty("/WB_TABLE_VIEW", true);
				oAppModel.setProperty("/WB_CALENDAR_VIEW", false);
				oAppModel.setProperty("/WB_TASK_BOARD_VIEW", false);
				if (sCurrentViewPage === "CompletedTasks") {
					oAppModel.setProperty("/tableSelection", "None");
				} else {
					oAppModel.setProperty("/tableSelection", "MultiToggle");
				}
			} else if (sSelectedViewKey === "WB_TASK_BOARD_VIEW") {
				oAppModel.setProperty("/WB_CARD_VIEW", false);
				oAppModel.setProperty("/WB_TABLE_VIEW", false);
				oAppModel.setProperty("/WB_CALENDAR_VIEW", false);
				oAppModel.setProperty("/WB_TASK_BOARD_VIEW", true);
				this.getTaskBoardData();
			} else if (sSelectedViewKey === "WB_CALENDAR_VIEW") {
				oAppModel.setProperty("/WB_CARD_VIEW", false);
				oAppModel.setProperty("/WB_TABLE_VIEW", false);
				oAppModel.setProperty("/WB_CALENDAR_VIEW", true);
				oAppModel.setProperty("/WB_TASK_BOARD_VIEW", false);
			}
			oAppModel.refresh(true);
			if (!oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
				this.pagination();
			}
		},

		onSelectStdCheckBox: function (oEvent) {
			if (this.oAppModel.getProperty("/WB_CARD_VIEW")) {
				var oList = this.getView().byId("WB_TASK_CARD_ITEM");
				if (oEvent.getSource().getProperty("selected")) {
					oList.selectAll();
					this.wbListSelect();
					if (this.oAppModel.getProperty("/isRightPaneVisible")) {
						this.collapseRightPane();
					}
					this.getModel("oActionHeader").setProperty("/selectedItemLength", oList.getSelectedItems().length);
					//this.resetActionButtons();
					this.oAppModel.setProperty("/enableBulkDeleteButton", true);
				} else {
					oList.removeSelections();
					this.resetActionButtons();
					this.oAppModel.setProperty("/enableBulkDeleteButton", false);
					//oList.addStyleClass("wbInboxCardListDisplay");
				}
				// to remove hide and unhide the checkboxes
				var selected = oEvent.getSource().getSelected();
				/*if (!selected) {
					oList.getItems().forEach(function (r) {
						r.$().find('.sapMCb').children().hide();
					});
				}*/
				this.getModel("oTaskInboxModel").refresh(true);
			} else {
				if (oEvent.getSource().getProperty("selected")) {
					this.getView().byId("ID_TASK_TABLE").setEnableSelectAll();
					this.getView().byId("ID_TASK_TABLE").selectAll();
				} else {
					this.getView().byId("ID_TASK_TABLE").clearSelection();
					this.resetActionButtons();
					this.oAppModel.setProperty("/enableBulkDeleteButton", false);
				}
			}
		},

		handleSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var index = sTerm.indexOf("@");
			if (index !== -1) {
				var term = sTerm.substring(index + 1, sTerm.length);
				if (term !== "") {
					var aFilters = [];
					if (term) {
						aFilters.push(new sap.ui.model.Filter("userLastName", sap.ui.model.FilterOperator.Contains, term));
						aFilters.push(new sap.ui.model.Filter("userFirstName", sap.ui.model.FilterOperator.Contains, term));
					}
					oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
				}
			}

		},

		onExpandRightPane: function (property) {
			var oAppModel = this.oAppModel;
			oAppModel.setProperty("/functionality/expanded", false);
			oAppModel.setProperty("/functionality/direction", "Column");
			oAppModel.setProperty("/functionality/visibility", false);
			oAppModel.setProperty("/isRightPaneVisible", true);
			oAppModel.setProperty("/" + property, true);
			var parentSource = this.oAppModel.getProperty("/rightPaneSource");
			if (oAppModel.getProperty("/isProcessFlowVisible") && property !== "isProcessFlowVisible") {
				oAppModel.setProperty("/isProcessFlowVisible", false);
				var parentSource = this.oAppModel.getProperty("/rightPaneSource");
				parentSource.removeStyleClass("wbInboxCardSelected");
			}
			if (oAppModel.getProperty("/isTaskLevelChatBotVisible") && property !== "isTaskLevelChatBotVisible") {
				oAppModel.setProperty("/isTaskLevelChatBotVisible", false);

			}
			if (oAppModel.getProperty("/isTaskLevelChatVisible") && property !== "isTaskLevelChatVisible") {
				oAppModel.setProperty("/isTaskLevelChatVisible", false);
				var parentSource = this.getModel("oTaskLevelChat").getProperty("/parentSource");
				parentSource.removeStyleClass("wbInboxCardSelected");
			}

		},
		collapseRightPane: function (property) {
			var oAppModel = this.oAppModel;
			oAppModel.setProperty("/isRightPaneVisible", false);
			if (property === undefined) {
				oAppModel.setProperty("/isProcessFlowVisible", false);
				oAppModel.setProperty("/isTaskLevelChatBotVisible", false);
				oAppModel.setProperty("/isTaskLevelChatVisible", false);
				var parentSource = this.oAppModel.getProperty("/rightPaneSource");
				if (parentSource)
					parentSource.removeStyleClass("wbInboxCardSelected");

			} else {
				oAppModel.setProperty("/functionality/expanded", true);
				oAppModel.setProperty("/functionality/direction", "Row");
				oAppModel.setProperty("/functionality/visibility", true);
				oAppModel.setProperty("/" + property, false);
			}
		},
		setChatDto: function () {
			var that = this //Collaboration changes - By Karishma
			var oTaskLevelChat = new JSONModel();
			oTaskLevelChat.setProperty("/chat", {});
			oTaskLevelChat.setProperty("/chatBot", {});
			oTaskLevelChat.setProperty("/newMessage", "");
			oTaskLevelChat.setProperty("/messages", []);
			oTaskLevelChat.setProperty("/busy", false);
			oTaskLevelChat.setProperty("/msgSentBusy", false);
			oTaskLevelChat.setProperty("/attachementBusy", false);
			oTaskLevelChat.setProperty("/aTaggedDetails", []); //Collaboration changes - By Karishma
			oTaskLevelChat.setProperty("/aTaggedId", []); //Collaboration changes - By Karishma
			oTaskLevelChat.setProperty("/bMemberBox", false); //Collaboration changes - By Karishma
			this.getView().setModel(oTaskLevelChat, "oTaskLevelChat");
			var oScrollContainer = this.getView().byId("ID_TASK_LEVEL_CHAT_SCROLL");
			/*********** Collaboration Changes - By Karishma ****************/
			oScrollContainer.attachBrowserEvent("scroll", function (oEvent) {
				if (oEvent.target.scrollTop === 0) {
					var oCollaborationModel = that.getModel("oTaskLevelChat");
					var iPageCount = oTaskLevelChat.getProperty("/iPageCount");
					var iTotalPageCount = oTaskLevelChat.getProperty("/iTotalPageCount");
					var bFirstTimeHistory = oTaskLevelChat.getProperty("/bFirstTimeHistory");
					var iScrollHeight = oEvent.target.scrollHeight;
					if ((iTotalPageCount > iPageCount) && bFirstTimeHistory) {
						var sUserId = that.getModel("oAppModel").getProperty("/loggedInUserDetails/userId");
						var aMessages = oTaskLevelChat.getProperty("/messages");
						var sChatId = oTaskLevelChat.getProperty("/currentChatId");
						iPageCount++;
						oTaskLevelChat.setProperty("/iPageCount", iPageCount);
						that.fnTaskPaginationHistory(sUserId, sChatId, iPageCount, aMessages, iScrollHeight);
					}
				}
			});
			/*********** Collaboration Changes - By Karishma ****************/

			// oScrollContainer.addEventDelegate({
			// 	"onAfterRendering": function (oEvent) {
			// 		$("#" + oEvent.srcControl.getId())[0].addEventListener(
			// 			'scroll',
			// 			function (event) {
			// 				var scrollTop = $("#" + event.target.id)[0].scrollTop;
			// 				var scrollHeight = $("#" + event.target.id)[0].scrollHeight;
			// 				if (scrollTop === 0 && oTaskLevelChat.getProperty("/currentChatId")) // scroll at tops 
			// 				{
			// 					var totalChatCount = oTaskLevelChat.getProperty("/totalChatCount");
			// 					var pageCount = oTaskLevelChat.getProperty("/pageCount");
			// 					var currentPage = oTaskLevelChat.getProperty("/currentPage");
			// 					if (currentPage * pageCount <= totalChatCount) {
			// 						oTaskLevelChat.setProperty("/scrollable", false);
			// 						currentPage++;
			// 						oTaskLevelChat.setProperty("/currentPage", currentPage);
			// 						this.loadChatData(oTaskLevelChat.getProperty("/currentChatId"));
			// 					}
			// 				}
			// 			}.bind(this)
			// 			// false
			// 		);
			// 	}.bind(this)
			// }, this);
		},

		handleTypeMissmatchChat: function (oEvent) {
			this.handleTypeMissmatch(oEvent);
		},

		//Closing task level chat 
		closeChat: function (bOpenLeftPanel) {
			if (bOpenLeftPanel) {
				this.collapseRightPane("isTaskLevelChatVisible");
			}
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var parentSource;
			if (oTaskInboxModel.getProperty("/openRightClickMenu")) {
				parentSource = oTaskInboxModel.getProperty("/oParentSource");
			} else {
				parentSource = this.oAppModel.getProperty("/rightPaneSource");
			}
			parentSource.removeStyleClass("wbInboxCardSelected");

			var oActionContentClass = oTaskLevelChat.getProperty("/actionContentSource");
			oActionContentClass.addStyleClass("wbInboxActionBackgroundClass");
			oActionContentClass.removeStyleClass("wbInboxActionTransparentClass");

			oTaskInboxModel.setProperty("/lineItemTaskDetails", "");
			oTaskInboxModel.setProperty("/openRightClickMenu", false);
			oTaskInboxModel.setProperty("/oParentSource", "");
			oTaskInboxModel.refresh();
			oTaskLevelChat.setProperty("/members", []);
			oTaskLevelChat.setProperty("/memberList", []);
			oTaskLevelChat.setProperty("/aActivemembers", []);
			oTaskLevelChat.setProperty("/messages", []);
			oTaskLevelChat.setProperty("/newMessage", "");
			oTaskLevelChat.setProperty("/unseenCount", []);
			oTaskLevelChat.setProperty("/responseMessage", {});
			oTaskLevelChat.setProperty("/attachments", []);
			oTaskLevelChat.setProperty("/sParticipants", "");
			oTaskLevelChat.setProperty("/sTooltip", "");
			oTaskLevelChat.setProperty("/isAttachment", false);
			oTaskLevelChat.setProperty("/busy", false);
			oTaskLevelChat.setProperty("/msgSentBusy", false);

			oTaskLevelChat.refresh(true);
		},
		openEmojiTLChat: function (oEvent) {
			this.openEmojiFrgament(oEvent);
		},
		addEmoji: function (oEvent) {
			this.addEmojiToText(oEvent);
		},

		// Opens Chat Bot
		openChatBot: function (oEvent) {
			var oAppModel = this.oAppModel;
			this.getModel("oChatBotModel").setProperty("/screen", "unifiedInbox");
			oAppModel.setProperty("/isTaskLevelChatVisible", false);
			oAppModel.setProperty("/isTaskLevelChatBotVisible", true);

		},
		closeChatBot: function (oEvent) {
			var oAppModel = this.oAppModel;
			this.collapseRightPane("isTaskLevelChatBotVisible");
			oAppModel.setProperty("/isTaskLevelChatBotVisible", false);

		},
		toggleToChat: function (oEvent) {
			var oAppModel = this.oAppModel;
			oAppModel.setProperty("/isTaskLevelChatVisible", true);
			oAppModel.setProperty("/isTaskLevelChatBotVisible", false);
		},
		// Open process flow for task
		openProcessFlow: function (oEvent) {
			var oAppModel = this.oAppModel;
			var oContext;
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			//change
			if (oEvent) {
				oTaskInboxModel.setProperty("/openRightClickMenu", false);
			}
			if (!oTaskInboxModel.getProperty("/openRightClickMenu")) {
				oContext = oEvent.getSource()._getBindingContext("oTaskInboxModel").getObject();
			} else {
				oContext = oTaskInboxModel.getProperty("/lineItemTaskDetails");
			}
			//change
			// if (oAppModel.getProperty("/isProcessFlowVisible")) {
			// 	this.closeProcessFlow(false);
			// }
			this.onExpandRightPane("isProcessFlowVisible");
			this.viewProcessFlow(oContext.processId, oContext.taskId, false, oEvent);
		},

		viewProcessFlow: function (processId, taskId, showDetails, oEvent) {
			var oProcessFlowModel = this.getModel("oProcessFlowModel");
			oProcessFlowModel.setProperty("/taskDetailsBusy", true);
			oProcessFlowModel.setProperty("/sProcessFlowTaskId", taskId); //Change by Karishma
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var requestPayload;

			if (this.oAppModel.getProperty("/currentView") !== "taskDetailPage") {
				if (this.oAppModel.getProperty("/isProcessFlowVisible")) { //ProcessFlow on Right Pane
					if (!oTaskInboxModel.getProperty("/openRightClickMenu")) {
						var oActionContentClass = oEvent.getSource().getParent();

						oProcessFlowModel.setProperty("/actionContentSource", oActionContentClass);
						oActionContentClass.addStyleClass("wbInboxActionTransparentClass");
						oActionContentClass.removeStyleClass("wbInboxActionBackgroundClass");

						var index = oEvent.getSource()._getBindingContext("oTaskInboxModel").getPath().split("/").pop();
						var oItem = this.byId("WB_TASK_CARD_ITEM").getAggregation("items")[index];
						oItem.addStyleClass("wbInboxCardSelected");
					}

					var oParentSource;
					if (!oTaskInboxModel.getProperty("/openRightClickMenu")) {
						oParentSource = oEvent.getSource().getParent().getParent().getParent().getParent();
					} else {
						oParentSource = oTaskInboxModel.getProperty("/oParentSource");
					}
					oParentSource.addStyleClass("wbIn boxCardSelected");
					this.oAppModel.setProperty("/rightPaneSource", oParentSource);
				}
				oProcessFlowModel.setProperty("/showDetails", showDetails);
				requestPayload = {
					"processId": processId,
					"taskId": taskId
				};
			} else {
				requestPayload = {
					"processId": this.oAppModel.getProperty("/taskObjectDetails/processId"),
					"taskId": this.oAppModel.getProperty("/taskObjectDetails/taskId")
				};
			}
			var url = "/oneappinctureworkbox/WorkboxJavaService/task/details";
			this.doAjax(url, "POST", requestPayload, function (oData) {
					var taskLength = oData.tasks.length;
					if (taskLength > 0) {
						if (!oData.tasks[taskLength - 1].subTask || oData.tasks[taskLength - 1].subTask.length === 0) {
							oData.tasks[taskLength - 1].showConnectingBar = false;
						}
					}

					oProcessFlowModel.setProperty("/taskDetails", oData);
					oProcessFlowModel.setProperty("/selTaskEvent", oData.tasks[0]);
					// oProcessFlowModel.setProperty("/selTaskSubject", oData.tasks[0].subject);
					// oProcessFlowModel.setProperty("/selTaskEvent", oData.tasks[0].eventId);
					oProcessFlowModel.setProperty("/taskDetailsBusy", false);
					var processFlowContainer = this.getView().byId("WB_PROCESSFLOW_CONTAINER");
					this.generateProcessStoryControls(processFlowContainer);
					if (oProcessFlowModel.getProperty("/showDetails") || this.oAppModel.getProperty("/currentView") === "taskDetailPage") {
						oProcessFlowModel.setProperty("/showDetails", true);
						// this.expandProcessFlow();
						this._doNavigate("ProcessFlow", {});
					}
				}.bind(this),
				function (oData) {}.bind(this));
			// this.oAppModel.refresh(true);
		},
		generateProcessStoryControls: function (processFlowContainer) {
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
			processFlowContainer.addItem(tasksVBox);
			this.getModel("oProcessFlowModel").refresh(true);
			// ADD TASKS VBOX - END
		},
		addProcessFlowTasks: function (bindingPath, bindingObject) {
			var that = this;
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
						visible: "{parts: ['oProcessFlowModel>status','oProcessFlowModel>totalTime','oProcessFlowModel>taskSla'],formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowCompletionTime'}"
					})).addItem(new sap.m.Text({ //TIME
						text: "{oProcessFlowModel>totalTime}",
						visible: "{parts: ['oProcessFlowModel>status','oProcessFlowModel>totalTime','oProcessFlowModel>taskSla'],formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowCompletionTime'}"
					}).addStyleClass("wbTextBoldClass")).addStyleClass("wbProcessFlowTaskHBoxPadding")).addStyleClass("wbProcessFlowTaskBackground")
				.addStyleClass(
					"sapUiSmallMarginBottom")

			// TASK CLI
			var taskCLI = new sap.m.CustomListItem({
				type: "{parts: ['oProcessFlowModel>/showDetails','oProcessFlowModel>status'] ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetShowDetailsPS'}",
				press: function (oEvent) {
					if (that.oAppModel.getProperty("/currentView") === "processFlow") {
						sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.ProcessFlow').getController().fetchEventClicked(
							oEvent);
					}
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
								renderType: "Bare"
							}).addItem(new sap.m.HBox({
								width: "20px",
								renderType: "Bare",
								alignItems: "Center",
								justifyContent: "Start"
							}).addItem(new sap.m.HBox({
								width: "100%",
								height: "100%",
								visible: "{parts: ['oProcessFlowModel>showConnectingBar','oProcessFlowModel>status'] ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetProcessFlowSubTaskConnectingBar'}"
							})));
							var subTask = this.addProcessFlowTasks(childPath, childObject);
							subTaskTray.addItem(subTask).addStyleClass("wbProcessFlowSubTaskVbox");
							return subTaskTray;
						}.bind(this));
					return subTaskChildTask;
				}.bind(this));
			return subTaskParent;
		},

		expandProcessFlow: function () {
			var oProcessFlowModel = this.getModel("oProcessFlowModel");
			oProcessFlowModel.setProperty("/showDetails", true);
			oProcessFlowModel.refresh(true);
			if (!this._oProcessFlow) {
				var _oProcessFlowContent = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.ProcessFlow", this);
				this._oProcessFlow = new Dialog({
						// 50%
						contentWidth: "35%",
						contentHeight: "70%",
					}).addStyleClass("wbDialog")
					.setCustomHeader(new sap.m.Bar()
						.addContentLeft(new sap.m.Title({
								text: "{i18n>REQUEST_ID_TEXT} - {oProcessFlowModel>/taskDetails/process/requestId}"
							})
							.addStyleClass("wbDialogTitle"))
						.addContentRight(new sap.ui.core.Icon({
							src: "sap-icon://decline",
							tooltip: "{i18n>CLOSE_TEXT}",
							press: function (oEvent) {
								this.closeProcessFlow();
							}.bind(this)
						}).addStyleClass("wbDialogCloseIcon"))
					);
				oProcessFlowModel.setProperty("/taskDetailsBusy", true);
				_oProcessFlowContent.removeStyleClass("wbProcessFlowMainContent");
				this._oProcessFlow.addContent(_oProcessFlowContent);
				this.getView().addDependent(this._oProcessFlow);

			}
			this._oProcessFlow.open();
			oProcessFlowModel.setProperty("/taskDetailsBusy", false);
		},
		fetchEventClicked: function (oEvent) {
			var context = oEvent.getSource().getBindingContext("oProcessFlowModel");
			this.showEventDetails(context.getPath());
		},

		showEventDetails: function (contextPath) {
			var oProcessFlowModel = this.getModel("oProcessFlowModel");
			var eventDetails = oProcessFlowModel.getProperty(contextPath);
			oProcessFlowModel.setProperty("/selTaskSubject", eventDetails.subject);
			oProcessFlowModel.refresh(true);
		},

		// Close process flow fragment of chat
		closeProcessFlow: function (bOpenLeftPanel) {
			var oProcessFlowModel = this.getModel("oProcessFlowModel");

			if (this._oProcessFlow !== undefined && this._oProcessFlow.isOpen()) {
				this._oProcessFlow.close();
			} else {
				if (bOpenLeftPanel) {
					this.collapseRightPane("isProcessFlowVisible");
				}
				var oTaskInboxModel = this.getModel("oTaskInboxModel");
				var parentSource;

				if (oTaskInboxModel.getProperty("/openRightClickMenu")) {
					parentSource = oTaskInboxModel.getProperty("/oParentSource");
				} else {
					parentSource = this.oAppModel.getProperty("/rightPaneSource");
				}
				parentSource.removeStyleClass("wbInboxCardSelected");

				var oActionContentClass = this.getModel("oProcessFlowModel").getProperty("/actionContentSource");
				oActionContentClass.removeStyleClass("wbInboxActionTransparentClass");
				oActionContentClass.addStyleClass("wbInboxActionBackgroundClass");

				oTaskInboxModel.setProperty("/lineItemTaskDetails", "");
				oTaskInboxModel.setProperty("/oParentSource", "");
				oTaskInboxModel.setProperty("/openRightClickMenu", false);
				oTaskInboxModel.refresh();
				this.getModel("oProcessFlowModel").refresh();
			}
			// this.oAppModel.refresh(true);
			oProcessFlowModel.setProperty("/taskDetailsBusy", false);

		},

		// Show more for process flow- shows attachments, process details, recent chat history and other information about the task
		showMoreProcessFlow: function (oEvent) {
			this.closeProcessFlow(true);
			this._doNavigate("ProcessFlow", {});
			// this.expandProcessFlow();

		},
		/*Fuction is triggerd when the Filters button next to Card-Table change segmented button is clicked.- QUICK FILTER*/
		onFiltersBtnPress: function (oEvent) {
			var oFilterListModel = this.getModel("oFilterListModel");
			if (this.oAppModel.getProperty("/selectedFreeFilter") === undefined) {
				this.oAppModel.setProperty("/selectedFreeFilter", "");
			}

			var i18n = this.getOwner().getModel("i18n").getResourceBundle();

			var oSource = oEvent.getSource();
			if (!this._quickFilter) {
				this._quickFilter = this._createFragment("oneapp.incture.workbox.fragment.QuickFilter", this);
				this.getView().addDependent(this._quickFilter);
				var filterData = [{
					"key": "ForMe",
					"label": i18n.getText("FOR_ME_TEXT"),
					"list": []
				}, {
					"key": "SLA Breached",
					"label": i18n.getText("SLA_BREACHED_LEGEND_TEXT"),
					"list": []
				}, {
					"key": "Completed After SLA",
					"label": i18n.getText("COMPLETED_AFTER_SLA_LEGEND_TEXT"),
					"list": []
				}, {
					"key": "AllForwarded",
					"label": i18n.getText("ALL_FORWARDED_TEXT"),
					"list": []
				}, {
					"key": "sortBy",
					"label": i18n.getText("SORTBY_TEXT"),
					"list": [{
						"key": "createdAt",
						"label": i18n.getText("CREATED_DATE_TEXT"),
						"list": []
					}, {
						"key": "requestId",
						"label": i18n.getText("REQUEST_NO_TEXT"),
						"list": []
					}]
				}];
				oFilterListModel.setProperty("/FilterList", filterData);
				this._quickFilter.setModel(oFilterListModel, "oFilterListModel");

			}
			this._quickFilter.open(
				false,
				oSource.getFocusDomRef(),
				sap.ui.core.Popup.Dock.RightTop,
				sap.ui.core.Popup.Dock.EndBottom,
				oSource.getFocusDomRef(),
				"0 0"
			);
		},
		// On item press of quick filter
		onFilterListItemPress: function (oEvent) {
			var selectedItem = oEvent.getParameter("item");
			if (selectedItem.getSubmenu()) {
				return;
			}
			var oFilterListModel = this.getModel("oFilterListModel");
			var oBindingContext = oFilterListModel.getProperty(selectedItem._getBindingContext("oFilterListModel").getPath());
			if (oBindingContext.key === "sortBy") {
				oBindingContext = oBindingContext.list[0];
			} else if (oBindingContext.key === "createdAt" || oBindingContext.key === "requestId") {
				var sortingDto = [{
					"orderBy": oBindingContext.key,
					"orderType": "ASC"
				}];
				this.oAppModel.setProperty("/freeFilter", "");
				this.oAppModel.setProperty("/sortingDto", sortingDto);
			} else {
				this.oAppModel.setProperty("/currentPage", "1");
				this.oAppModel.setProperty("/freeFilter", oBindingContext.key);
				this.oAppModel.setProperty("/sortingDto", []);
			}
			if (this.oAppModel.getProperty("/graphClicked") && (this.oAppModel.getProperty("/currentViewPage") === "CompletedTasks")) {
				this.setCurrentPage(null, "AdminInbox", "Admin Tasks", true, true);
			}
			this.oAppModel.setProperty("/graphClicked", false);

			this.onClickFilterDetail();
			this.oAppModel.setProperty("/selectedFreeFilter", oBindingContext.key);

		},

		// calling same function for both subheader and lineItem forward
		forwardTaskIconPress: function (oEvent) {
			//oEvent.getSource().getBinding("items").filter([]);
			//this.aActionsDataArray = [];
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var details;
			var actionForm = this.oAppModel.getProperty("/actionFrom");

			//if its from subheader no need to set the selectedTasksArray property - vaishnavi
			if (actionForm !== "subheader") {
				if (oEvent) {
					if (!oTaskInboxModel.getProperty("/openRightClickMenu")) {
						var sPath = oEvent.getParameters().id.split("-")[4];
						details = oTaskInboxModel.getData().workBoxDtos[sPath];
					}
				} else {
					details = oTaskInboxModel.getProperty("/lineItemTaskDetails");
				}
				this.oAppModel.setProperty("/selectedTasksArray", [details]);
			}

			// var taskId = details.taskId;
			// var origin = details.origin;
			// var oActionHeader = this.getModel("oActionHeader");
			// this.aActionsDataArray.push({
			// 	//"actionType": "FORWARD",
			// 	"origin": origin,
			// 	"instanceId": taskId
			// });
			// oActionHeader.setProperty("/singleInstanceId", taskId);
			// oActionHeader.setProperty("/singleOrigin", origin);
			var oConstantsModel = this.getModel("oConstantsModel");
			var allUsers = oConstantsModel.getData().allUsers;
			oConstantsModel.setProperty("/allUsers", allUsers);
			if (!this._forwardTaskPopup) {
				this._forwardTaskPopup = this._createFragment("oneapp.incture.workbox.fragment.ForwardPopup", this);
				this.getView().addDependent(this._forwardTaskPopup);
				this._forwardTaskPopup.setModel(oConstantsModel, "oConstantsModel");
			}
			this._forwardTaskPopup.setModel(oConstantsModel, "oConstantsModel");
			sap.ui.getCore().byId("idDelegateList").getBinding("items").filter([]);
			this._forwardTaskPopup.open();
		},

		onForwardPopupClose: function () {
			var oConstantsModel = this.getModel("oConstantsModel");
			oConstantsModel.setProperty("/fwdSearchValue", "");
			this.getModel("oTaskInboxModel").setProperty("/openRightClickMenu", false);
			this._forwardTaskPopup.close();
		},

		delegateUserSearch: function (oEvent) {
			var oConstantsModel = this.getModel("oConstantsModel");
			var aFilters = [];
			var sQuery = "";
			if (oEvent) {
				sQuery = oEvent.getSource().getValue();
				oConstantsModel.setProperty("/fwdSearchValue", sQuery);
			}
			var filterArry = [];
			var metaModel = ["userFirstName", "userLastName", "userId"];
			if (sQuery && sQuery.length > 0) {
				for (var i = 0; i < metaModel.length; i++) {
					var bindingName = metaModel[i];
					filterArry.push(new sap.ui.model.Filter(bindingName, sap.ui.model.FilterOperator.Contains, sQuery));
				}
				var filter = new sap.ui.model.Filter(filterArry, false);
				aFilters.push(filter);
			}
			//var reqList = oEvent.getSource().getParent().getParent();
			var reqList = sap.ui.getCore().byId("idDelegateList");
			var binding = reqList.getBinding("items");
			binding.filter(aFilters, "Application");
		},

		onUserSelect: function (oEvent) {
			//this.aActionsDataArray
			var that = this;
			var selectedPath = oEvent.getSource().getSelectedContextPaths()[0].split("/")[2];
			var oConstantsModel = this.getModel("oConstantsModel");
			var sendToUser = oConstantsModel.getData().allUsers[selectedPath].userId;
			var oActionHeader = this.getModel("oActionHeader");
			oActionHeader.setProperty("/sendToUser", sendToUser);
			var informationText = this.getView().getModel("i18n").getResourceBundle().getText("INFORMATION_TEXT");
			var confirmationMsg = this.getView().getModel("i18n").getResourceBundle().getText("FORWARD_TASK_CONFMESSAGE");
			this._createConfirmationMessage(informationText, confirmationMsg, "Information", "Yes", "No", true, function (oEvent) {
				var oEvent = oEvent;
				/*var isAdmin = false;
				if (this.oAppModel.getProperty("/inboxType") === "AdminInbox") {
					isAdmin = true;
				}
				if (this.oAppModel.getProperty("/currentView") === "taskDetailPage") {
					this.aActionsDataArray = [{
						"instanceId": this.oAppModel.getProperty("/taskObjectDetails/taskId"),
						"actionType": "Forward",
						"origin": this.oAppModel.getProperty("/taskObjectDetails/origin"),
						"sendToUser": oActionHeader.getProperty("/sendToUser"),
						"isAdmin": isAdmin
					}];
				}
				for (var i = 0; i < this.aActionsDataArray.length; i++) {
					this.aActionsDataArray[i].actionType = "Forward";
					this.aActionsDataArray[i].sendToUser = sendToUser;
					if (this.aActionsDataArray[i].origin === "BPM") {
						this.aActionsDataArray[i].origin = "SCP";
					}
					this.aActionsDataArray[i].isAdmin = isAdmin;
				}
				var oActionPayload = {
					"isChatBot": false,
					"task": this.aActionsDataArray
				};
				that.actionServiceCall(oActionPayload);*/
				this.wbPrepareActionPayload("Forward");
				sap.ui.getCore().byId("idDelegateList").removeSelections();
				oConstantsModel.setProperty("/fwdSearchValue", "");
				that.onForwardPopupClose();
			}, function (oEvt) {
				var oEvent = oEvt;
			});
		},

		//to be removed when ariba task moved to the new workbox service
		aribaApproveFn: function () {
			var oActionHeader = this.getModel("oActionHeader");
			var instanceId;
			var processId;

			if (this.oAppModel.getProperty("/currentView") !== "taskDetailPage") {
				instanceId = oActionHeader.getProperty("/taskInstanceId");
				processId = oActionHeader.getProperty("/taskProcessId");
			} else {
				instanceId = this.oAppModel.getProperty("/taskObjectDetails/taskId");
				processId = this.oAppModel.getProperty("/taskObjectDetails/processId");
			}

			var payload = {
				"actionType": "Approve",
				"action": "Approve",
				"userId": this.oAppModel.getProperty("/loggedInUserDetails/userId"),
				"instanceList": [instanceId],
				"comment": oActionHeader.getProperty("/sTypedComment"),
				"origin": "Ariba",
				"processId": processId
			};
			var that = this;
			var url = "/WorkboxServices/inbox/actions";
			this.doAjax(url, "POST", payload, function (oEvent) {
				var oEvent = oEvent;
				if (that._actionComments) {
					that._actionComments.close();
				}
				that.onClickFilterDetail();
				oActionHeader.setProperty("/selectedItemLength", 0);
				oActionHeader.setProperty("/actionComments", "");
				that.resetActionButtons();
				this.aActionsDataArray = [];
				this.setInboxPanel();
				that._showToastMessage(oEvent.message);
				setTimeout(function () {
					if (that.oAppModel.getProperty("/currentView") !== "unifiedInbox") {
						that._doNavigate("UnifiedInbox", {});
					}
				}, 1000);

			}.bind(this), function (oEvent) {
				that._showToastMessage(oEvent.message);
			}.bind(this));
		},

		//function to get the status of origin JIRA
		getJiraStatusDropdown: function (oActionHeader, taskId) {
			var url = "/oneappinctureworkbox/WorkboxJavaService/jira/getStatus?taskId=" + taskId;
			this.doAjax(url, "GET", null, function (oData) {
				if (oData) {
					oActionHeader.setProperty("/JiraStatusDropdown", oData)
				}
				oActionHeader.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//to approve jira tasks - service call
		jiraActionUpdateFn: function (oActionPayload) {
			var that = this;
			var oActionHeader = this.getModel("oActionHeader");

			oActionPayload.task[0].actionType = "accept";
			oActionPayload.task[0].actionTypeId = oActionHeader.getProperty("/selectedStatus");
			oActionPayload.task[0].sendToUser = oActionHeader.getProperty("/selectedAssignee");
			var aurl = "/oneappinctureworkbox/WorkboxJavaService/inbox/actions";
			this.doAjax(aurl, "POST", oActionPayload, function (oEvent) {
				if (that._actionComments) {
					that._actionComments.close();
				}
				that.onClickFilterDetail();
				if (that.oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
					that.getTaskBoardData();
				}
				oActionHeader.setProperty("/selectedItemLength", 0);
				oActionHeader.setProperty("/actionComments", "");
				oActionHeader.setProperty("/doneEnabled", true);
				oActionHeader.setProperty("/selectedAssignee", null);
				oActionHeader.setProperty("/selectedStatus", null);
				that.resetActionButtons();
				this.aActionsDataArray = [];
				this.setInboxPanel();
				that._showToastMessage(oEvent.message);
				setTimeout(function () {
					if (that.oAppModel.getProperty("/currentView") !== "unifiedInbox") {
						that._doNavigate("UnifiedInbox", {});
					}
				}, 1000);
			}.bind(this), function (oEvent) {
				that._showToastMessage(oEvent.message);
			}.bind(this));
		},

		//to approve jabil tasks and update line item - service call
		jabilTasksUpdateFn: function (oActionPayload) {
			var oTaskDetailModel = sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.TaskDetail').getModel(
				"oTaskDetailModel");
			var processName = this.oAppModel.getProperty("/taskObjectDetails/processName");
			var processId = this.oAppModel.getProperty("/taskObjectDetails/processId");
			var postUpdateData = {};
			var lineItems = [];
			var contentDto = oTaskDetailModel.getData().contentDto;
			for (var i = 0; i < contentDto.layouts.length; i++) {
				if (contentDto.layouts[i].layoutType === "TABLE") {
					var lineItems = contentDto.layouts[i].data;
					break;
				}
			}
			oActionPayload.task[0].actionType = "Approve";
			oActionPayload.task[0].platform = "Web";
			oActionPayload.task[0].signatureVerified = "NO";
			oActionPayload.task[0].isAdmin = this.oAppModel.getProperty("/isAdmin");
			oActionPayload.processLabel = processName;

			if (processName === "analyst_appproval_process") {
				oActionPayload.caseId = oTaskDetailModel.getProperty("/caseID");
				oActionPayload.icManagerProcessId = oTaskDetailModel.getProperty("/managerProcessID");
			}
			var role = oTaskDetailModel.getProperty("/roleEditableValue");

			if (processName === "jabilinventorymanagement" || processName === "inventoryparentworkflow") {
				postUpdateData.lineItems = [];

				for (var j = 0; j < lineItems.length; j++) {
					var attributeValues = lineItems[j].layoutAttributes;
					var obj = {};
					for (var z = 0; z < attributeValues.length; z++) {
						var key = attributeValues[z].keyLabel;
						var value = attributeValues[z].keyValue;
						obj[key] = value;
					}
					postUpdateData.lineItems.push(obj);
				}
			} else if (processName === "analyst_appproval_process" || processName === "analystprocessworkflow") {
				var formDetails = oTaskDetailModel.getProperty("/allFormDetails");
				var lineItemsPost = [];
				for (var j = 0; j < lineItems.length; j++) {
					var attributeValues = lineItems[j].layoutAttributes;
					var obj = {};
					for (var z = 0; z < attributeValues.length; z++) {
						var key = attributeValues[z].keyLabel;
						if (key !== "icon") {
							if (key !== "Form Id") {
								var value = attributeValues[z].keyValue;
								obj[key] = value;
							}
						}
					}
					var formId = "lineItemFormId";
					obj[formId] = formDetails[j].formId;
					lineItemsPost.push(obj);
				}

				var lineItemsPostObj = {
					"lineItems": lineItemsPost
				};

				var zurl = "/oneappinctureworkbox/WorkboxJavaService/workFlow/updateContextDataLineItems?processId=" + processId;
				this.doAjax(zurl, "POST", lineItemsPostObj, function (oData) {}.bind(this), function (oEvent) {}.bind(this));

				var formArray = [];
				var formID = "";
				for (var k = 0; k < formDetails.length; k++) {
					if (formID !== formDetails[k].formId) {
						formDetails[k].formStatus = "SUBMITTED";
						var form = formDetails[k].formData;
						formID = formDetails[k].formId;
						for (i = 0; i < form.length; i++) {
							var valueHelp = form[i].valueHelp;
							var valueArray = [];
							for (j = 0; j < valueHelp.length; j++) {
								if (valueHelp[j].key) {
									valueArray.push(valueHelp[j].key);
								} else {
									valueArray.push(valueHelp[j]);
								}
							}
							form[i].valueHelp = valueArray;
						}
						formArray.push(formDetails[k]);
					}
				}
				postUpdateData.forms = formArray;
			}

			if (processName !== "ic_manager_approval_process") {
				var url = "/oneappinctureworkbox/WorkboxJavaService/workFlow/updateContextData?processId=" + processId + "&processName=" + processName;
				this.doAjax(url, "POST", postUpdateData, function (oData) {
						var that = this;
						var oActionHeader = this.getModel("oActionHeader");
						var aurl = "/oneappinctureworkbox/WorkboxJavaService/inbox/actions";
						this.doAjax(aurl, "POST", oActionPayload, function (oEvent) {
							if (that._actionComments) {
								that._actionComments.close();
							}
							that.onClickFilterDetail();
							if (that.oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
								that.getTaskBoardData();
							}
							oActionHeader.setProperty("/selectedItemLength", 0);
							oActionHeader.setProperty("/actionComments", "");
							oActionHeader.setProperty("/doneEnabled", true);
							that.resetActionButtons();
							this.aActionsDataArray = [];
							this.setInboxPanel();
							that._showToastMessage(oEvent.message);
							setTimeout(function () {
								if (that.oAppModel.getProperty("/currentView") !== "unifiedInbox") {
									that._doNavigate("UnifiedInbox", {});
								}
							}, 1000);
						}.bind(this), function (oEvent) {
							that._showToastMessage(oEvent.message);
						}.bind(this));
					}.bind(this),
					function (oEvent) {}.bind(this));
			} else {
				var that = this;
				var oActionHeader = this.getModel("oActionHeader");
				var aurl = "/oneappinctureworkbox/WorkboxJavaService/inbox/actions";
				this.doAjax(aurl, "POST", oActionPayload, function (oEvent) {
					if (that._actionComments) {
						that._actionComments.close();
					}
					that.onClickFilterDetail();
					if (that.oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
						that.getTaskBoardData();
					}
					oActionHeader.setProperty("/selectedItemLength", 0);
					oActionHeader.setProperty("/actionComments", "");
					oActionHeader.setProperty("/doneEnabled", true);
					that.resetActionButtons();
					this.aActionsDataArray = [];
					this.setInboxPanel();
					that._showToastMessage(oEvent.message);
					setTimeout(function () {
						if (that.oAppModel.getProperty("/currentView") !== "unifiedInbox") {
							that._doNavigate("UnifiedInbox", {});
						}
					}, 1000);
				}.bind(this), function (oEvent) {
					that._showToastMessage(oEvent.message);
				}.bind(this));
			}
		},

		//to approve annualleavellanner rmg task
		rmgLeaveUpdateFn: function (oActionHeader, token) {
			var that = this;
			var oTaskDetailModel = sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.TaskDetail').getModel(
				"oTaskDetailModel");
			var contentDto = oTaskDetailModel.getData().contentDto;
			var Payload, tokenPayload, url, token;
			Payload = {
				"memberUserId": contentDto[0].contentDto[4].value,
				"userName": contentDto[0].contentDto[7].value,
				"projectManagerId": contentDto[0].contentDto[6].value,
				"createdDate": contentDto[0].contentDto[9].value,
				"startedDate": contentDto[0].contentDto[1].value,
				"endDate": contentDto[0].contentDto[11].value,
				"projectId": contentDto[0].contentDto[10].value,
				"approvedBy": contentDto[0].contentDto[5].value,
				"approvedDate": contentDto[0].contentDto[3].value,
				"noOdDays": contentDto[0].contentDto[8].value,
				"status": oActionHeader.getData().selectedAction
			};
			url = "https://hrapp.cfapps.eu10.hana.ondemand.com/hr-tech/AnnualLeavePlanner/approveOrRejectLeavePlan";
			$.ajax({
				url: url,
				type: "POST",
				data: JSON.stringify(Payload),
				headers: {
					"Accept": "application/json",
					"Authorization": token
				},
				contentType: "application/json; charset=utf-8",
				success: function (response) {
					that._showToastMessage(response.message);
				},
				error: function (response) {}
			});
		},

		// to Approve and reject the rmg expense process
		expenseProcessActionFn: function (oActionHeader) {
			var token = this.oAppModel.getProperty("/bearerToken");
			var oTaskDetailModel = sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.TaskDetail').getModel(
				"oTaskDetailModel");
			var contentDto = oTaskDetailModel.getData().contentDto;
			for (var i = 0; i < contentDto.length; i++) {
				if (contentDto[i].dataType === "TASKDETAILS") {
					var items = contentDto[i].contentDto;
					for (var j = 0; j < items.length; j++) {
						if (items[j].label === "RequestNo") {
							var expenseID = items[j].attributeValues[0].attributeValue;
						}
					}
				}
			}
			var selectedAction = oActionHeader.getProperty("/selectedAction");
			var date = new Date();
			date = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
			var payload = {
				"comment": oActionHeader.getProperty("/actionComments"),
				"updatedDate": date,
				"updatedBy": "INC01201",
				"expenseId": expenseID,
				"wfTaskId": "0",
				"status": "",
				"updatedByName": "Ajay Ghodke"
			};
			//"wfTaskId": this.oAppModel.getProperty("/taskObjectDetails/taskId"),
			var url;
			if (selectedAction === "Approve") {
				payload.status = "APPROVED";
				url = "https://hrapp.cfapps.eu10.hana.ondemand.com/hr-tech/expense-audit/approveExpense";
			} else {
				payload.status = "PENDING";
				url = "https://hrapp.cfapps.eu10.hana.ondemand.com/hr-tech/expense-audit/rejectExpense";
			}

			$.ajax({
				url: url,
				type: "POST",
				data: JSON.stringify(payload),
				headers: {
					"Accept": "application/json",
					"Authorization": token
				},
				contentType: "application/json; charset=utf-8",
				success: function (response) {},
				error: function (response) {}
			});
		},

		/*********** Collaboration Changes - By Karishma ****************/
		fnTaskPaginationHistory: function (sUserId, sChatId, iPageCount, aMessages, iScrollHeight) {
			var that = this;
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			oTaskLevelChat.setProperty("/busy", true);
			var url = "/ActJavaService/chat/chatHistory/" + sUserId + "/" + sChatId + "/" + iPageCount + "/10";
			this.doAjax(url, "GET", null, function (oData) {
				if (oData.data) {
					oTaskLevelChat.setProperty("/messages", []);
					var aOldChatHistory = oData.data.chatHistory;
					aOldChatHistory = aOldChatHistory.sort((a, b) => new Date(Number(a.sentAt)) - new Date(Number(b.sentAt)));
					var aNewMessages = aOldChatHistory.concat(aMessages);
					oTaskLevelChat.setProperty("/messages", aNewMessages);
					setTimeout(function () {
						var id = that.getView().byId("ID_TASK_LEVEL_CHAT_SCROLL");
						var iNewheight = $("#" + id.getId())[0].scrollHeight;
						$("#" + id.getId()).scrollTop(iNewheight - iScrollHeight);
					}, 200);
				}
				oTaskLevelChat.setProperty("/busy", false);
			}.bind(this), function (oError) {}.bind(this));

		},
		fnGetChatUsers: function () {
			var that = this;
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var aUserDetails = [];
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var url = "/ActJavaService/chat/getAllUsers/" + sUserId;
			this.doAjax(url, "GET", null, function (oData) {
				// var oConstantsModel = that.getModel("oConstantsModel");
				// oConstantsModel.setProperty("/chatUsers", oData.userDetails);
				var aWbUserDetails = oData.data;
				// for (var i = 0; i < aWbUserDetails.length; i++) {
				// 	var obj = aWbUserDetails[i];
				// 	var oMember = {
				// 		displayName: obj.displayName,
				// 		email: obj.email,
				// 		firstName: obj.firstName,
				// 		id: obj.id,
				// 		lastName: obj.lastName,
				// 	};
				// 	aUserDetails.push(oMember);
				// }
				oTaskLevelChat.setProperty("/aUserDetails", aWbUserDetails);
				// oConstantsModel.refresh(true);
			}.bind(this), function (oEvent) {}.bind(this));
		},

		openChat: function (oEvent) {
			var that = this;
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			oTaskLevelChat.setProperty("/bMemberBox", false);
			oTaskLevelChat.setProperty("/bIsMember", false);
			oTaskLevelChat.setProperty("/msgSentBusy", false);
			oTaskLevelChat.setProperty("/bSearchBar", false);
			oTaskLevelChat.setProperty("/bReplyToBox", false);
			oTaskLevelChat.setProperty("/bHasAccess", true);
			oTaskLevelChat.setProperty("/iTotalRead", 0);
			oTaskLevelChat.setProperty("/iTotalDelivered", 0);
			if (this.oAppModel.getProperty("/isTaskLevelChatVisible")) {
				this.closeChat(false);
			}
			oTaskLevelChat.setProperty("/busy", true);
			this.onExpandRightPane("isTaskLevelChatVisible");
			var oTask;
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			if (!oTaskInboxModel.getProperty("/openRightClickMenu")) {
				var sPath = oEvent.getSource()._getBindingContext("oTaskInboxModel").getPath();
				oTask = this.getModel("oTaskInboxModel").getProperty(sPath);
			} else {
				oTask = oTaskInboxModel.getProperty("/lineItemTaskDetails");
			}

			if (!oTaskInboxModel.getProperty("/openRightClickMenu")) {
				var oActionContentClass = oEvent.getSource().getParent();
				oTaskLevelChat.setProperty("/actionContentSource", oActionContentClass);
				oActionContentClass.removeStyleClass("wbInboxActionBackgroundClass");
				oActionContentClass.addStyleClass("wbInboxActionTransparentClass");
			}

			var oParentSource;
			if (!oTaskInboxModel.getProperty("/openRightClickMenu")) {
				oParentSource = oEvent.getSource().getParent().getParent().getParent().getParent();
			} else {
				oParentSource = oTaskInboxModel.getProperty("/oParentSource");
			}
			oParentSource.addStyleClass("wbInboxCardSelected");
			this.oAppModel.setProperty("/rightPaneSource", oParentSource);
			oTaskLevelChat.setProperty("/taskDetails", oTask);
			oTaskLevelChat.setProperty("/taskContext", sPath);
			oTaskLevelChat.setProperty("/sTaskDescription", oTask.taskDescription);
			oTaskLevelChat.setProperty("/chatEvent", {});
			oTaskLevelChat.setProperty("/scrollable", true);
			oTaskLevelChat.setProperty("/currentPage", 1);
			oTaskLevelChat.setProperty("/currentChatId", oTask.taskId);
			oTaskLevelChat.setProperty("/growingBusy", false);
			// oTaskLevelChat.setProperty("/currentChatId", false);
			oTaskLevelChat.setProperty("/sTaskOwner", oTask.taskOwner);
			oTaskLevelChat.setProperty("/sTaskStatus", oTask.status);
			oTaskLevelChat.setProperty("/iPageCount", 0);
			oTaskLevelChat.setProperty("/bFirstTimeHistory", true);
			this.loadChatData(oTask.taskId, 1);
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			if (oTask.status === "READY") {
				oTaskLevelChat.setProperty("/bIsOwner", true);
			} else if (oTask.status === "RESOLVED" || oTask.status === "RESERVED") {
				if (oTask.taskOwner === sUserId) {
					oTaskLevelChat.setProperty("/bIsOwner", true);
				} else {
					oTaskLevelChat.setProperty("/bIsOwner", false);
				}
			} else {
				if (oTask.taskOwner === sUserId) {
					oTaskLevelChat.setProperty("/bIsOwner", true);
				} else {
					oTaskLevelChat.setProperty("/bIsOwner", false);
				}
			}
			// this.oAppModel.refresh(true);
		},
		loadChatData: function (taskId) {
			var that = this;
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			oTaskLevelChat.setProperty("/currentChatId", taskId);
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var scrollId = "ID_TASK_LEVEL_CHAT_SCROLL";
			var iPageSize = 10;
			var sHistoryUrl = "/ActJavaService/chat/chatHistory/" + sUserId + "/" + taskId + "/0/" + iPageSize;
			this.doAjax(sHistoryUrl, "GET", null, function (oHistoryData) {
				var bIsHistorypresent = oHistoryData.message ? false : true;
				if (bIsHistorypresent) {
					var aChatHistory = oHistoryData.data.chatHistory;
					if (aChatHistory.length > 0) {
						var bIsDeliver = false,
							bIsSent = false;
						var aChatHistory = aChatHistory.sort((a, b) => new Date(Number(a.sentAt)) - new Date(Number(b.sentAt)));
						for (var j = aChatHistory.length - 1; j >= 0; j--) {
							if (aChatHistory[j].sentBy === sUserId) {
								if (aChatHistory[j].messageStatus.length > 0) {
									var aMessageStatus = aChatHistory[j].messageStatus;
									var aStatusFilter = aMessageStatus.filter(function (obj) {
										return (obj.status === "READ");
									});
									if (aMessageStatus.length === aStatusFilter.length) {
										aChatHistory[j].commentStatus = "READ";
										break;
									} else {
										var aStatusFilter = aMessageStatus.filter(function (obj) {
											return (obj.status === "DELIVERED");
										});
										if (aMessageStatus.length === aStatusFilter.length) {
											if (!bIsDeliver) {
												aChatHistory[j].commentStatus = "DELIVERED";
												bIsDeliver = true;
											}
										} else {
											var aStatusFilter = aMessageStatus.filter(function (obj) {
												return (obj.status === "SENT");
											});
											if (aStatusFilter.length > 0) {
												if (!bIsSent) {
													aChatHistory[j].commentStatus = "SENT";
													bIsSent = true;
												}
											} else {
												if (!bIsDeliver) {
													aChatHistory[j].commentStatus = "DELIVERED";
													bIsDeliver = true;
												}
											}
										}
									}
								}
							}
						}
					}
					var aMemberPid = [];
					var aActivemembers = [];
					var aMembers = oHistoryData.data.memberDetails ? oHistoryData.data.memberDetails : [];
					for (var i = 0; i < aMembers.length; i++) {
						if (aMembers[i].displayName) {
							aActivemembers.push({
								"displayName": aMembers[i].displayName,
								"lastName": aMembers[i].lastName,
								"firstName": aMembers[i].firstName,
								"id": aMembers[i].id,
								"status": "include"
							})

							aMemberPid.push(
								aMembers[i].id
							);
						}
					}
					oTaskLevelChat.setProperty("/aMemberList", aMembers);
					oTaskLevelChat.setProperty("/aActivemembers", aActivemembers);
					oTaskLevelChat.setProperty("/aMemberPid", aMemberPid);
					var memberDetails = that.setChatParticipantsList(aMembers);
					oTaskLevelChat.setProperty("/sParticipants", memberDetails.sParticipants);
					oTaskLevelChat.setProperty("/sTooltip", memberDetails.tooltip);

					// if (aChatHistory[aChatHistory.length - 1].action === "action") {
					// 	var aActionButtons = [];
					// 	for (var i = 0; i < aChatHistory[aChatHistory.length - 1].actionItems.length; i++) {
					// 		aActionButtons.push({
					// 			"button": aChatHistory[aChatHistory.length - 1].actionItems[i][0].toUpperCase() + aChatHistory[aChatHistory.length -
					// 				1].actionItems[i].substring(1)
					// 		});
					// 	}
					// 	aChatHistory[aChatHistory.length - 1].aActionButtons = aActionButtons;
					// }
					var iTotalMessage = oHistoryData.data.totalItemCount;
					var iTotalPageCount = (iTotalMessage / iPageSize) === 0 ? (iTotalMessage / iPageSize) - 1 : Math.floor(iTotalMessage /
						iPageSize);
					oTaskLevelChat.setProperty("/iTotalPageCount", iTotalPageCount);
					oTaskLevelChat.setProperty("/messages", aChatHistory);
					this.scrollBottom(scrollId, this);
					oTaskLevelChat.setProperty("/busy", false);
				} else {
					oTaskLevelChat.setProperty("/bMemberBox", false);
					this.fnInitiateServiceCall([]);
					oTaskLevelChat.setProperty("/busy", false);
				}
			}.bind(this), function (oError) {}.bind(this));

		},
		sendMessage: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var message = oTaskLevelChat.getProperty("/newMessage");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var aMemberList = oTaskLevelChat.getProperty("/aMemberList");
			var aMemberPid = oTaskLevelChat.getProperty("/aMemberPid");
			var aChat = oTaskLevelChat.getProperty("/messages");
			var sChatId = oTaskLevelChat.getProperty("/currentChatId");
			var aAttachment = oTaskLevelChat.getProperty("/aAttachment");
			aAttachment = aAttachment ? aAttachment : [];
			var aTaggedId = oTaskLevelChat.getProperty("/aTaggedId");
			var aSendTo = aMemberPid.filter(function (obj) {
				return (obj !== sUserId);
			});
			oTaskLevelChat.setProperty("/newMessage", "");
			if (message !== "" || aAttachment.length > 0) {
				if (aAttachment.length > 0) {
					this.fnTaskUploadAttachment(sChatId, message, aMemberPid, sUserId, aTaggedId, aMemberList);
				} else {
					this.fnTaskSendMessage(sChatId, message, aMemberPid, sUserId, "", aTaggedId, aMemberList);
				}
				// if (!oTaskLevelChat.getProperty("/memberList").includes(this.oAppModel.getProperty("/loggedInUserDetails/userId"))) {
				// 	requestPayload.taggedIds.push(this.oAppModel.getProperty("/loggedInUserDetails/userId"));
				// }
				oTaskLevelChat.setProperty("/isAttachment", false);
				// if (oTaskLevelChat.getProperty("/attachments").length > 0) {
				// 	oTaskLevelChat.setProperty("/msgSentBusy", true);
				// }
				oTaskLevelChat.setProperty("/typing", true);
			}
		},
		fnTaskUploadAttachment: function (sChatId, message, sSendToUserId, sUserId, aTagged, aMemberList) {
			var that = this;
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var aAttachment = oTaskLevelChat.getProperty("/aAttachment");
			var aAttachmentDetails = [];
			var oFormData = new FormData();
			$.each(aAttachment, function (index, oFile) {
				var sNewFileName = "img_web_" + (new Date().getTime()) + // Concat with file extension. 
					oFile.attachmentContent.name.substring(oFile.attachmentContent.name.lastIndexOf('.'));
				var sFileType;
				var sFileExtension = oFile.attachmentContent.name.substring(oFile.attachmentContent.name.lastIndexOf(".") + 1);
				var sFileName = oFile.attachmentContent.name.substring(0, oFile.attachmentContent.name.lastIndexOf("."));
				if (sFileExtension === "jpg" || sFileExtension === "jpeg" || sFileExtension === "png") {
					sFileType = "image/" + sFileExtension;
				} else {
					sFileType = "application/" + sFileExtension;
				}
				oFormData.append("file", oFile.attachmentContent);
				oFormData.append("fileName", sFileName);
				oFormData.append("fileType", sFileType);
				aAttachmentDetails.push({
					"fileName": sFileName,
					"fileType": sFileType,
					"compressed": oFile.attachment
				});
			});
			oTaskLevelChat.setProperty("/aAttachmentDetails", aAttachmentDetails);
			var sAttachmentUrl = "/ActJavaService/message/upload";
			$.ajax({
				url: sAttachmentUrl,
				type: "POST",
				crossDomain: true,
				processData: false,
				contentType: false,
				data: oFormData,
				success: function (data, textStatus, XMLHttpRequest) {
					var sCommentID = data.data.commentID;
					// var aDocument = data.data.attachments;
					that.fnTaskSendMessage(sChatId, message, sSendToUserId, sUserId, sCommentID, aTagged, aMemberList);

				},
				error: function (data, textStatus, XMLHttpRequest) {
					MessageToast.show("Error");
				}
			});
		},

		fnTaskSendMessage: function (sChatId, message, aMemberPid, sUserId, sCommentID, aTagged, aMemberDetails) {
			var that = this;
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var aChat = oTaskLevelChat.getProperty("/messages");
			var aAttachmentDetails = oTaskLevelChat.getProperty("/aAttachmentDetails");
			aAttachmentDetails = aAttachmentDetails ? aAttachmentDetails : [];
			var sSender = this.oAppModel.getProperty("/loggedInUserName");
			var sTaskDescription = oTaskLevelChat.getProperty("/taskDetails/taskDescription");
			var isReply = oTaskLevelChat.getProperty("/bReplyToBox");
			var sTaskOwner = oTaskLevelChat.getProperty("/sTaskOwner");
			var sTaskStatus = oTaskLevelChat.getProperty("/sTaskStatus");
			var taskOwners = [sTaskOwner, sTaskStatus];
			var aSendTo = aMemberPid.filter(function (obj) {
				return (obj !== sUserId);
			});
			if (isReply) {
				var sReplyToCommentId = oTaskLevelChat.getProperty("/sReplyToCommentId");
				var sReplyToText = oTaskLevelChat.getProperty("/sReplyToText");
				var sReplyToSentAt = oTaskLevelChat.getProperty("/sReplyToSentAt");
				var sReplyToSentBy = oTaskLevelChat.getProperty("/sReplyToSentBy");
				var sReplyToSenderName = oTaskLevelChat.getProperty("/sReplyToSenderName");
				var oReply = {
					"replyTo": isReply ? sReplyToCommentId : "", //commentID
					"comment": isReply ? sReplyToText : "",
					"sentAt": isReply ? sReplyToSentAt : "", //For the replied comment
					"sentBy": isReply ? sReplyToSentBy : "",
					"senderName": isReply ? sReplyToSenderName : "",
					"isAttachment": false,
					"attachmentDetails": aAttachmentDetails ? aAttachmentDetails : []
				};
			}

			var requestPayload = {
				"chatID": sChatId,
				"commentID": sCommentID ? sCommentID : "",
				"comment": message,
				"isAttachment": (aAttachmentDetails.length) > 0 ? true : false,
				"sentTo": aSendTo,
				"sentBy": sUserId,
				"chatType": "context",
				"sentAt": String(new Date().getTime()),
				"sendersName": sSender,
				"tagged": aTagged ? aTagged : [],
				"isReply": isReply,
				"taskDescription": sTaskDescription,
				"memberDetails": aMemberDetails,
				"attachmentDetails": [],
				"taskOwners": taskOwners,
				"botInfo": null,
				"commentType": "chat"
			};
			if (isReply) {
				requestPayload.replyDetails = oReply;
			}
			var oChat = $.extend(true, {}, requestPayload);
			oChat.attachmentDetails = aAttachmentDetails;
			oChat.commentStatus = "SENT";
			aChat.push(oChat);
			oTaskLevelChat.setProperty("/messages", aChat);
			var url = "/ActJavaService/chat/saveChat";
			this.doAjax(url, "POST", requestPayload, function (oData) {
					if (oData.data === "You are no longer a participant of this chat!") {
						if (aChat.length > 0) {
							aChat.pop();
							oTaskLevelChat.setProperty("/messages", aChat);
						}
						oTaskLevelChat.setProperty("/bIsMember", true);
					} else {
						// var oChat = $.extend(true, {}, requestPayload);
						// oChat.attachmentDetails = aAttachmentDetails;
						// oChat.commentStatus = "SENT";
						// aChat.push(oChat);
						this.onCloseTLReplyToBox()
							// oTaskLevelChat.setProperty("/messages", aChat);
						oTaskLevelChat.setProperty("/chat/isAttachments", true);
						oTaskLevelChat.setProperty("/aAttachment", []);
						oTaskLevelChat.setProperty("/aAttachmentDetails", []);
						oTaskLevelChat.setProperty("/isAttachments", false);
						oTaskLevelChat.setProperty("/BusyIndicator", false);
						// oTaskLevelChat.setProperty("/responseMessage", oData.responseMessage);
						this.scrollBottom("ID_TASK_LEVEL_CHAT_SCROLL", this);
						oTaskLevelChat.setProperty("/newMessage", "");
						if (this._emojiFragment !== undefined && this._emojiFragment.isOpen()) {
							this._emojiFragment.close();
						}
						oTaskLevelChat.refresh(true);
					}
					this.scrollBottom("ID_TASK_LEVEL_CHAT_SCROLL", this);
					oTaskLevelChat.setProperty("/BusyIndicator", false);

				}.bind(this),
				function (oData) {
					oTaskLevelChat.setProperty("/newMessage", this);
				}.bind(message));

		},
		uploadChatAttachment: function (oEvent) {
			this.sendActionPopup.close(); //Added by karishma
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var aFiles = oEvent.getParameter("files");
			var iFileSizeInBytes = 0;
			for (var i = 0; i < aFiles.length; i++) {
				iFileSizeInBytes = iFileSizeInBytes + aFiles[i].size;
			}
			var iFileSizeInMB = (iFileSizeInBytes / (1024 * 1024)).toFixed(2);
			if (iFileSizeInMB > 25) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILE_SIZE_LIMIT"));
			} else {
				var aAttachment = [];
				oTaskLevelChat.setProperty("/attachmentEvent", oEvent.getSource());
				this.uploadBase64Format(oEvent, function (oFile) {
					var attachment = {
						"attachment": oFile.filebase64Format,
						"attachmentName": oFile.fileName,
						"attachmentType": "application/" + oFile.fileType,
						"attachmentContent": oFile.fileContent
					};
					// var aAttachment = oTaskLevelChat.getProperty("/attachments");
					aAttachment.unshift(attachment);
					oTaskLevelChat.setProperty("/isAttachment", true);
					oTaskLevelChat.getProperty("/attachmentEvent").clear();
					oTaskLevelChat.setProperty("/aAttachment", aAttachment);
					// oTaskLevelChat.setProperty("/busy", false);
					oTaskLevelChat.setProperty("/msgSentBusy", false);
					oTaskLevelChat.refresh(true);
				}.bind(this));
				this.scrollBottom("ID_TASK_LEVEL_CHAT_SCROLL", this);
			}
		},
		deleteChatAttachment: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var sPath = oEvent.getSource()._getBindingContext("oTaskLevelChat").getPath();
			var iIndex = sPath.split("/")[2];
			var aAttachment = oTaskLevelChat.getProperty("/aAttachment");
			aAttachment.splice(iIndex, 1);
			oTaskLevelChat.setProperty("/aAttachment", aAttachment);
			if (aAttachment.length <= 0) {
				oTaskLevelChat.setProperty("/isAttachment", false);
			}
			oTaskLevelChat.refresh(true);
		},
		onAttachmentDownload: function (oEvent) {
			var attachment = oEvent.getSource().getBindingContext("oTaskLevelChat").getObject();
			this.downloadAttachment(attachment.documentID, attachment.fileType, attachment.fileName, null, attachment.attachmentSize, null,
				attachment.encodedFileContent, true);
		},
		onTagging: function (oEvent) {
			var oConstantsModel = this.getModel("oConstantsModel");
			var sText = oEvent.getParameter("value");
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var aMemberList = oTaskLevelChat.getProperty("/aMemberList");
			var aTaggedDetails = oTaskLevelChat.getProperty("/aTaggedDetails");
			var aTaggedId = oTaskLevelChat.getProperty("/aTaggedId");
			var aFilter = aMemberList.filter(function (obj) {
				return (obj.id !== sUserId);
			});
			for (var i = 0; i < aTaggedDetails.length; i++) {
				if (sText.includes("@" + aTaggedDetails[i].displayName)) {

				} else {
					aTaggedDetails.splice(i, 1);
					aTaggedId.splice(i, 1);
					oTaskLevelChat.setProperty("/aTaggedId", aTaggedId);
					oTaskLevelChat.setProperty("/aTaggedDetails", aTaggedDetails);
				}
			}
			oTaskLevelChat.setProperty("/aSuggestionTagging", aFilter);

			this.getView().byId("ID_TASK_LEVEL_INPUT").setFilterFunction(function (sFilterText, oItem) {
				if (sFilterText.lastIndexOf("@") !== -1) {
					var iIndex = sFilterText.lastIndexOf("@");
					var sFilterText = sFilterText.substring(iIndex + 1);
					var selected = oItem.getText().match(new RegExp(sFilterText, "i"));
					return selected;
				}
			});
		},
		onSelectingSuggestionItem: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var sText = oTaskLevelChat.getProperty("/newMessage");
			var sPath = oEvent.getParameter("selectedItem").getBindingContext("oTaskLevelChat").sPath;
			var oSelectedObject = oTaskLevelChat.getProperty(sPath);
			var sDisplayName = oTaskLevelChat.getProperty(sPath).displayName;
			var sId = oTaskLevelChat.getProperty(sPath).id;
			var value = this.getView().byId("ID_TASK_LEVEL_INPUT").getValue();
			var iIndex = value.lastIndexOf("@");
			var value = value.substring(0, iIndex + 1);
			var oInputFiels = this.getView().byId("ID_TASK_LEVEL_INPUT");
			var aTaggedId = oTaskLevelChat.getProperty("/aTaggedId");
			var aTaggedDetails = oTaskLevelChat.getProperty("/aTaggedDetails");
			var aFilter = aTaggedId.filter(function (obj) {
				return (obj.tagged === sId);
			});
			if (aFilter.length === 0) {
				aTaggedId.push({
					"tagged": sId
				});
				aTaggedDetails.push(oSelectedObject);
				oTaskLevelChat.setProperty("/aTaggedId", aTaggedId);
				oTaskLevelChat.setProperty("/aTaggedDetails", aTaggedDetails);
				this.getView().byId("ID_TASK_LEVEL_INPUT").setValue(value + sDisplayName);
			} else {
				this.getView().byId("ID_TASK_LEVEL_INPUT").setValue(value);
			}
		},
		onParticipantAction: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var bMemberBox = oTaskLevelChat.getProperty("/bMemberBox");
			if (!bMemberBox) {
				oTaskLevelChat.setProperty("/bMemberBox", true);
			} else {
				oTaskLevelChat.setProperty("/bMemberBox", false);
				var scrollId = "ID_TASK_LEVEL_CHAT_SCROLL";
				this.scrollBottom(scrollId, this);
			}
		},

		setChatParticipantsList: function (aMembers) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var sParticipants, tooltip = "",
				memberList = [];
			if (aMembers.length === 0) {
				sParticipants = "No particpants";
				tooltip = "No particpants";
			}
			if (aMembers.length === 1) {
				sParticipants = aMembers[0].firstName;
				tooltip = aMembers[0].displayName;
				memberList.push(aMembers[0].id);
			}
			if (aMembers.length === 2) {
				sParticipants = aMembers[0].firstName + " and " + aMembers[1].firstName;
				tooltip = aMembers[0].displayName + " and " + aMembers[1].displayName;
				memberList.push(aMembers[0].id);
				memberList.push(aMembers[1].id);
			}
			if (aMembers.length > 2) {
				tooltip = aMembers[0].displayName;
				sParticipants = aMembers[0].firstName + ", " + aMembers[1].firstName + " and " + (aMembers.length - 2) + " more.";
				for (var i = 1; i < aMembers.length; i++) {
					memberList.push(aMembers[i].id);
					if (i !== aMembers.length - 1) {
						tooltip = tooltip + ", " + aMembers[i].displayName;
					} else {
						tooltip = tooltip + " and " + aMembers[i].displayName;
					}
				}
			}
			var aFilter = aMembers.filter(function (obj) {
				return (obj.id === sUserId);
			});
			if (aFilter.length === 1) {
				oTaskLevelChat.setProperty("/bIsMember", false);
			} else {
				oTaskLevelChat.setProperty("/bIsMember", true);
				oTaskLevelChat.setProperty("/bIsOwner", false);
			}
			var memberDetails = {
				memberList: memberList,
				sParticipants: sParticipants,
				tooltip: tooltip
			};
			return memberDetails;
		},
		onPressAddMember: function () {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			oTaskLevelChat.setProperty("/bSearchBar", true);
		},
		onLiveSearch: function () {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var sQuery = oTaskLevelChat.getProperty("/searchValue");
			sQuery = sQuery ? sQuery.toLowerCase() : "";
			var aUserDetails = oTaskLevelChat.getProperty("/aUserDetails");
			if (sQuery) {
				var oSearchField = this.getView().byId("ID_TASKLEVEL_SEARCHFIELD");
				var aFilter = aUserDetails.filter(function (obj) {
					return (obj.displayName.toLowerCase().includes(sQuery));
				});
				// var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
				// var url = "/ActJavaService/chat/search/" + sUserId + "/" + sQuery;
				// this.doAjax(url, "GET", null, function (oData) {
				oTaskLevelChat.setProperty("/chatUsers", aFilter);
				// oSearchField.getBinding("suggestionItems").filter();
				oSearchField.suggest();
				// }.bind(this),
				// function (oEvent) {}.bind(this));
			}
		},
		onSelectName: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var aActivemembers = oTaskLevelChat.getProperty("/aActivemembers");
			var sTime = String(new Date().getTime());
			var bSelected = oTaskLevelChat.getProperty("/bHasAccess");
			if (oEvent.getParameter("query")) {
				var sPath = oEvent.getParameter("suggestionItem").getBindingContext("oTaskLevelChat").sPath;
				var oSelectedMember = oTaskLevelChat.getProperty(sPath);
				var aFilter = aActivemembers.filter(function (obj) {
					return (obj.id === oSelectedMember.id);
				});
				if (!(aFilter.length > 0)) {
					oSelectedMember.status = "include";
					oSelectedMember.dateJoined = sTime;
					oSelectedMember.hasAccess = bSelected;
					aActivemembers.push(oSelectedMember);
					oTaskLevelChat.setProperty("/aActivemembers", aActivemembers);
					this.fnInitiateServiceCall(aActivemembers);
				} else {
					sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ALREADY_MEMBER"));
				}
				oEvent.getSource().clear();
			}
		},
		onCloseSearchField: function () {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			oTaskLevelChat.setProperty("/bSearchBar", false);
		},
		fnInitiateServiceCall: function (aMemberDetails) {
			var that = this;
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var aMemberPid = [];
			var sTime = String(new Date().getTime());
			for (var i = 0; i < aMemberDetails.length; i++) {
				aMemberPid.push(aMemberDetails[i].id);
				// aMemberDetails[i].dateJoined = sTime;
				// aMemberDetails[i].hasAccess = true;
			}
			oTaskLevelChat.setProperty("/aMemberPid", aMemberPid);
			oTaskLevelChat.setProperty("/aMemberList", aMemberDetails);

			var oTask = oTaskLevelChat.getProperty("/taskDetails");
			var oInitiatePayload = {
				chatID: oTask.taskId,
				memberDetails: aMemberDetails,
				chatName: oTask.requestId + " : " + oTask.taskDescription,
				chatType: "context",
				lastMessageTime: sTime,
				isPublic: false,
				sizeLimit: 1000,
				contextDetails: {
					chatID: oTask.taskId,
					taskDescription: oTask.taskDescription,
					processID: oTask.processId,
					processType: oTask.processName,
					customAttributes: "",
					processDisplayName: oTask.processDisplayName
				}
			};
			var sInitiateChatUrl = "/ActJavaService/chat/initiateChat";
			this.doAjax(sInitiateChatUrl, "POST", oInitiatePayload, function (oChatData) {
				// oTaskLevelChat.setProperty("/bMemberBox", false);
				var sChatId = oChatData.data;
				if (oChatData.data instanceof Object) {
					sChatId = oChatData.data.chatID;
					aMemberDetails = oChatData.data.memberDetails;
					for (var j = 0; j < aMemberDetails.length; j++) {
						aMemberPid.push(aMemberDetails[j].id);
					}
					oTaskLevelChat.setProperty("/aMemberPid", aMemberPid);
					oTaskLevelChat.setProperty("/aMemberList", aMemberDetails);
					oTaskLevelChat.setProperty("/aActivemembers", aMemberDetails);
				}
				oTaskLevelChat.setProperty("/currentChatId", sChatId);
				var memberDetails = that.setChatParticipantsList(aMemberDetails);
				oTaskLevelChat.setProperty("/sParticipants", memberDetails.sParticipants);
				oTaskLevelChat.setProperty("/sTooltip", memberDetails.tooltip);
			}.bind(this), function (oError) {}.bind(this));
		},
		onRemoveMember: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var aActivemembers = oTaskLevelChat.getProperty("/aActivemembers");
			var sPath = oEvent.getSource().getBindingContext("oTaskLevelChat").sPath;
			var sName = oTaskLevelChat.getProperty(sPath).displayName;
			var confirmationMsg = "Do you want to remove " + sName + " from chat";
			var informationText = "";
			this._createConfirmationMessage("Confirmation", confirmationMsg, "Information", "Remove", "Cancel", true, function (oEvent) {
				var iIndex = sPath.split("/")[2];
				aActivemembers.splice(iIndex, 1);
				this.fnInitiateServiceCall(aActivemembers);
			}, function (oEvt) {
				var oEvent = oEvt;
			});

		},
		onTLMessageAction: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			if (!this.messageActionPopup) {
				this.messageActionPopup = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.TaskLevelMessageAction", this);
			}
			this.getView().addDependent(this.messageActionPopup);
			this.messageActionPopup.openBy(oEvent.getSource());
			var sSelectedMessagePath = oEvent.getSource().getBindingContext("oTaskLevelChat").sPath;
			var oSelectedMessage = oTaskLevelChat.getProperty(sSelectedMessagePath);
			oTaskLevelChat.setProperty("/oSelectedMessage", oSelectedMessage);
		},
		onTaskLevelFavouritePress: function (oEvent) {
			var that = this;
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var sPath = oEvent.getSource().getBindingContext("oTaskLevelChat").sPath;
			var iIndex = sPath.split("/")[2];
			var sChatId = oTaskLevelChat.getProperty(sPath).chatID;
			var sCommentId = oTaskLevelChat.getProperty(sPath).commentID;
			var sChatType = oTaskLevelChat.getProperty(sPath).chatType;
			var sAction = oEvent.getSource().getAggregation("tooltip");
			var sTime = String(new Date().getTime());
			var sFavoriteUrl = "/ActJavaService/chat/favourite";
			var oFavoritePayload = {
				"userID": sUserId,
				"chatID": sChatId,
				"commentID": sCommentId,
				"toDelete": (sAction === "Favorite") ? false : true,
				"favouriteTime": sTime
			};
			var aFavoritePayload = [oFavoritePayload];
			this.doAjax(sFavoriteUrl, "POST", aFavoritePayload, function (oData) {
					if (oData.statusCode === 200) {
						if (sAction === "Favorite") {
							oTaskLevelChat.setProperty(sPath + "/isFavourite", true);
						} else {
							oTaskLevelChat.setProperty(sPath + "/isFavourite", false);
						}
					}
				}.bind(this),
				function (oData) {}.bind(this));
		},
		onCloseMessageActionPopover: function () {
			sap.ui.getCore().byId("ID_TASKLEVELMESSAGEACTION_POPOVER").removeSelections(true);
		},
		onMessageActionPress: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var oSelectedMessage = oTaskLevelChat.getProperty("/oSelectedMessage");
			var sSelectedAction = oEvent.getParameter("listItem").getProperty("title");
			if (sSelectedAction === "Copy Message") {

			} else if (sSelectedAction === "Reply") {
				var sComment = "";
				if (oSelectedMessage.comment) {
					sComment = oSelectedMessage.comment;
				} else {
					var sAttachmentName = oSelectedMessage.attachmentDetails[0].fileName + "." + oSelectedMessage.attachmentDetails[0].fileType.split(
						"/")[1];
					if ((oSelectedMessage.attachmentDetails).length < 2) {
						sComment = sAttachmentName;
					} else {
						var sLeftItems = oSelectedMessage.attachmentDetails.length - 1;
						sComment = sAttachmentName + " and " + sLeftItems + " more";
					}
				}
				oTaskLevelChat.setProperty("/bReplyToBox", true);
				oTaskLevelChat.setProperty("/sReplyToSenderName", oSelectedMessage.sendersName);
				oTaskLevelChat.setProperty("/sReplyToSentAt", oSelectedMessage.sentAt);
				oTaskLevelChat.setProperty("/sReplyToText", sComment);
				oTaskLevelChat.setProperty("/sReplyToCommentId", oSelectedMessage.commentID);
				oTaskLevelChat.setProperty("/sReplyToSentBy", oSelectedMessage.sentBy);
			}
			this.messageActionPopup.close();
		},
		onCloseTLReplyToBox: function () {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			oTaskLevelChat.setProperty("/bReplyToBox", false);
			oTaskLevelChat.setProperty("/sReplyToUserName", "");
			oTaskLevelChat.setProperty("/sReplyToSentAt", "");
			oTaskLevelChat.setProperty("/sReplyToText", "");
		},
		onTLSendAction: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			if (!this.sendActionPopup) {
				this.sendActionPopup = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.TaskChatMoreAction", this);
			}
			this.getView().addDependent(this.sendActionPopup);
			this.sendActionPopup.openBy(oEvent.getSource());

		},
		onTLSelectCheckbox: function (oEvent) {
			var oTaskLevelChat = this.getModel("oTaskLevelChat");
			var bSelected = oEvent.getParameter("selected");
			oTaskLevelChat.setProperty("/bHasAccess", bSelected);
		},
		fnUpdateChatMember: function (sChatID) {
			var sTime = String(new Date().getTime());
			var sUpdateMemberUrl = "/ActJavaService/chat/updateChatMembers/" + sChatID + "/" + sTime;
			this.doAjax(sUpdateMemberUrl, "GET", null, function (oData) {

			}.bind(this), function (oError) {}.bind(this));
		},

		/***********End of collaboration changes ***************/

		/*******Start - Action buttons latest code********/
		wbListSelect: function () {
			var that = this;
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var oActionHeader = this.getModel("oActionHeader");
			var status;
			var hideButtons = [];
			var taskType = null;
			var tab = this.oAppModel.getProperty("/inboxTab"); // different tabs in unifiedInbox
			if (!tab) {
				tab = "myTasks";
			}
			var currentView = this.oAppModel.getProperty("/currentView"); // UnifiedInbox or TaskDetailPage
			var currentViewPage = this.oAppModel.getProperty("/currentViewPage"); // Admin inbox, draft ...
			var multiselect = false;
			var reset;
			///
			var selectedItems = this.getView().byId("WB_TASK_CARD_ITEM").getSelectedItems();
			// To set the state of the global checkbox.
			var items = this.getView().byId("WB_TASK_CARD_ITEM").getItems();
			if (selectedItems.length !== items.length) {
				this.getModel("oTaskInboxModel").setProperty("/checkBoxState", false);
			} else {
				this.getModel("oTaskInboxModel").setProperty("/checkBoxState", true);
			}

			if (selectedItems.length > 1) {
				multiselect = true;
			}
			var selectedTasksArray = [];
			var selectedContextPaths = this.getView().byId("WB_TASK_CARD_ITEM").getSelectedItems();
			if (selectedContextPaths.length === 0) {
				this.oAppModel.setProperty("/selectedTasksArray", []);
				this.oAppModel.setProperty("/enableBulkDeleteButton", false);
				reset = true;
			} else {
				var isEqualStatus = true;
				reset = false;
				for (var i = 0; i < selectedContextPaths.length; i++) {
					var contextData = selectedContextPaths[i].getBindingContext("oTaskInboxModel").getObject();
					if ((i < selectedContextPaths.length - 1) && (contextData.status !== selectedContextPaths[i + 1].getBindingContext(
							"oTaskInboxModel").getObject().status)) {
						isEqualStatus = false;
					}
					// Disable Claim and release
					if (contextData.processName === "ProjectProposalDocumentApproval") {
						hideButtons = ["Claim", "Release"];
					} else if (contextData.processName === "SIGNING") {
						hideButtons = ["Claim", "Release", "Approve", "Reject"];
					}

					selectedTasksArray.push(contextData);
				}
				this.oAppModel.setProperty("/selectedTasksArray", selectedTasksArray);

				if (isEqualStatus) {
					status = selectedTasksArray[0].status;
				} else {
					status = null;
				}
			}
			this.oAppModel.refresh(true);
			workbox.wbCommonSubheaderActionNew(that, status, taskType, tab, currentView, currentViewPage, multiselect, reset, null, hideButtons);

		},

		wbTableSelect: function () {
			var that = this;
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var oActionHeader = this.getModel("oActionHeader");
			///
			var status, hideButtons = [];
			var taskType = null;
			var tab = this.oAppModel.getProperty("/inboxTab"); // different tabs in unifiedInbox
			if (!tab) {
				tab = "myTasks";
			}
			var currentView = this.oAppModel.getProperty("/currentView"); // UnifiedInbox or TaskDetailPage
			var currentViewPage = this.oAppModel.getProperty("/currentViewPage");
			var multiselect = false;
			var reset;
			///
			var selectedItemLength = this.getView().byId("ID_TASK_TABLE").getSelectedIndices().length;
			var itemCount = this.getView().byId("ID_TASK_TABLE")._getRowCounts().count;
			if (selectedItemLength === itemCount) {
				this.getModel("oTaskInboxModel").setProperty("/checkBoxState", true);
			} else {
				this.getModel("oTaskInboxModel").setProperty("/checkBoxState", false);
			}
			//var selectedItemLength = this.getView().byId("ID_TASK_TABLE").getSelectedIndices().length;
			if (selectedItemLength > 1) {
				multiselect = true;
			}
			this.getModel("oActionHeader").setProperty("/selectedItemLength", selectedItemLength);
			var aSelectedIndexs = this.getView().byId("ID_TASK_TABLE").getSelectedIndices();
			if (aSelectedIndexs.length === 0) {
				this.oAppModel.setProperty("/selectedTasksArray", []);
				this.oAppModel.setProperty("/enableBulkDeleteButton", false);
				reset = true;
			} else {
				var isEqualStatus = true;
				reset = false;
				var oTableData = oTaskInboxModel.getData().workBoxDtos;
				var selectedTasksArray = [];
				for (var i = 0; i < aSelectedIndexs.length; i++) {
					for (var j = 0; j < oTableData.length; j++) {
						if (j === aSelectedIndexs[i]) {
							selectedTasksArray.push(oTableData[j]);
							if ((i < aSelectedIndexs.length - 1) && (oTableData[aSelectedIndexs[i]].status !== oTableData[aSelectedIndexs[i + 1]].status)) {
								isEqualStatus = false;
							}
							if (oTableData[j].processName === "ProjectProposalDocumentApproval") {
								hideButtons = ["Claim", "Release"];
							} else if (oTableData[j].processName === "SIGNING") {
								hideButtons = ["Claim", "Release", "Approve", "Reject"];
							}
						}
					}
				}
				this.oAppModel.setProperty("/selectedTasksArray", selectedTasksArray);
				if (isEqualStatus) {
					status = selectedTasksArray[0].status;
				} else {
					status = null;
				}
			}
			workbox.wbCommonSubheaderActionNew(that, status, taskType, tab, currentView, currentViewPage, multiselect, reset, null, hideButtons);

		},

		// Function when Approve/reject is clicked on the lineitem.
		lineItemActionFn: function (oEvent) {
			var oActionHeader = this.getModel("oActionHeader");
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var selectedAction;
			var selectedActionText;
			//var sPath;
			var contextData;
			if (oEvent) {
				selectedAction = oEvent.getSource().getCustomData()[0].getKey();
				selectedActionText = oEvent.getSource().getText(); // Approve/Reject
				this.oAppModel.setProperty("/selectedAction", selectedAction);
				this.oAppModel.setProperty("/selectedActionText", selectedActionText);
				var sPath = oEvent.getParameters().id.split("-")[4];
				contextData = oEvent.getSource().getModel("oTaskInboxModel").getData().workBoxDtos[sPath];
			} else {
				// when we do right click on the task 
				selectedAction = oTaskInboxModel.getProperty("/sSelectedAction");
				selectedActionText = oTaskInboxModel.getProperty("/sSelectedActionText");
				contextData = oTaskInboxModel.getProperty("/lineItemTaskDetails");
			}

			var selectedTasksArray = [];
			var commentsDescData = [];
			var actionType;
			var isPurchaseOrder = false;
			selectedTasksArray.push(contextData);
			this.oAppModel.setProperty("/selectedTasksArray", selectedTasksArray);
			switch (selectedAction) {
			case "Approve":
				actionType = i18n.getText("APPROVING_TASK_TEXT");
				break;
			case "Reject":
				actionType = i18n.getText("REJECTING_TASK_TEXT");
				break;
			case "Done":
				actionType = i18n.getText("PERFORMING_DONE_ACTION");
				break;
			case "Resolve":
				actionType = i18n.getText("RESOLVING_TASKS_TEXT");
				break;
			case "Complete":
				actionType = i18n.getText("COMPLETE_ACTION_TEXT");
			}

			if (selectedAction === "Claim" || selectedAction === "Release") {
				this.wbPrepareActionPayload(selectedAction);
			} else {
				for (var i = 0; i < selectedTasksArray.length; i++) {
					var taskDescription = selectedTasksArray[i].taskDescription;
					if (selectedTasksArray[i].processName === "PurchaseOrderApprovalProcess" || selectedTasksArray[i].processName ===
						"PurchaseRequisition") {
						isPurchaseOrder = true;
					}
				}
				commentsDescData.push({
					"actionType": actionType,
					"description": taskDescription
				});
				this.oAppModel.setProperty("/commentsDescData", commentsDescData);
				if (!isPurchaseOrder) {
					this.openCommentsFragment(selectedAction, selectedActionText);
				} else {
					this.openSignInFragment();
				}
			}
		},

		openSignInFragment: function () {
			if (!this._signInFragment) {
				this._signInFragment = this._createFragment("oneapp.incture.workbox.fragment.SignInAction", this);
				this.getView().addDependent(this._signInFragment);
			}
			this._signInFragment.open();
		},

		checkSignInData: function () {
			var oAppModel = this.oAppModel;
			if (oAppModel.getProperty("/loggedInPassword")) {
				var data = {
					"userId": oAppModel.getProperty("/loggedInUserId"),
					"password": oAppModel.getProperty("/loggedInPassword")
				};
				this.doAjax("/oneappinctureworkbox/WorkboxJavaService/idpMapping/validateUser", "POST", data, function (oData) {
					if (oData.status === "SUCCESS") {
						var selectedAction = this.oAppModel.getProperty("/selectedAction");
						var selectedActionText = this.oAppModel.getProperty("/selectedActionText");
						this.onCloseSignInFragment();
						this.openCommentsFragment(selectedAction, selectedActionText);
					} else {
						this._showToastMessage(oData.message);
					}
				}.bind(this), function (oEvent) {}.bind(this));
			} else {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			}
		},

		onCloseSignInFragment: function () {
			this.oAppModel.setProperty("/loggedInPassword", null);
			this._signInFragment.close();
		},

		wbPrepareActionPayload: function (actionTypeSelected) {
			var selectedTasksArray = this.oAppModel.getProperty("/selectedTasksArray");
			var currentViewPage = this.oAppModel.getProperty("/currentViewPage");
			var oActionPayload = [];
			var isAdmin = false;
			var origin;
			var userSeletedforForward = this.getModel("oActionHeader").getProperty("/sendToUser");
			if (this.oAppModel.getProperty("/inboxType") === "AdminInbox") {
				isAdmin = true;
			}
			var actionType;

			var oActionHeader = this.getModel("oActionHeader");

			for (var i = 0; i < selectedTasksArray.length; i++) {
				oActionHeader.setProperty("/taskProcessName", null);

				//service call to get the status dropdown for jira process if process is WP workflow - vaishnavi
				if (actionTypeSelected === "Reject" || actionTypeSelected === "Approve" || actionTypeSelected === "Update") {
					if (selectedTasksArray[i].processName === "WorkNet Project") {
						oActionHeader.setProperty("/taskProcessName", selectedTasksArray[i].processName);
						oActionHeader.setProperty("/selectedAssignee", null);
						oActionHeader.setProperty("/selectedStatus", null);
						this.getJiraStatusDropdown(oActionHeader, selectedTasksArray[i].taskId);
					}
				}

				if (actionTypeSelected === "Reject" && (selectedTasksArray[i].taskType === "Done" || selectedTasksArray[i].taskType ===
						"Complete/Resolve")) {
					// do nothing;
					//return;
				} else {
					origin = selectedTasksArray[i].origin;

					if (selectedTasksArray[i].processName === "budgetaryapprovalprocess" || selectedTasksArray[i].processName ===
						"purchaseorderapproval" || selectedTasksArray[
							i]
						.processName === "leaveapprovalmanagement" || selectedTasksArray[i].processName === "performanceappraisal" ||
						selectedTasksArray[
							i].processName ===
						"approvalforaward" || selectedTasksArray[i].processName === "campaignmanagementworkflow" || selectedTasksArray[i].processName ===
						"documentapproval") {
						origin = "SCP"; // to change all the "BPM" origin to "SCP" with same SCP payload.
					}

					if (actionTypeSelected === "Approve") {
						if (selectedTasksArray[i].taskType === "Done") {
							actionType = "Done";
						} else if (selectedTasksArray[i].taskType === "Complete/Resolve") {
							if (currentViewPage === "CreatedTasks") {
								actionType = "Complete";
							} else {
								actionType = "Resolved";
							}
						} else {
							actionType = actionTypeSelected;
						}
					} else {
						actionType = actionTypeSelected;
					}

					oActionPayload.push({
						"instanceId": selectedTasksArray[i].taskId,
						"origin": origin,
						"actionType": actionType,
						"isAdmin": isAdmin,
						"platform": "Web",
						"signatureVerified": "NO"
					});

					if (actionTypeSelected === "Forward") {
						oActionPayload[i].sendToUser = userSeletedforForward;
					}

					switch (selectedTasksArray[i].origin) {
					case "ECC":
						if (selectedTasksArray[i].processName === "PurchaseRequisition") {
							for (var j = 0; j < oActionPayload.length; j++) {
								if (selectedTasksArray[i].taskId === oActionPayload[j].instanceId) {
									oActionPayload[j].processType = "PR";
									oActionPayload[j].processId = selectedTasksArray[i].processId;
									oActionPayload[j].relCode = "21";
									oActionPayload[j].bnfPo = selectedTasksArray[0].taskDescription.split(" ")[3];
									oActionPayload[j].signatureVerified = "YES";
								}
							}
						} else if (selectedTasksArray[i].processName === "PurchaseOrder" || selectedTasksArray[i].processName ===
							"PurchaseOrderApprovalProcess") {
							for (var j = 0; j < oActionPayload.length; j++) {
								if (selectedTasksArray[i].taskId === oActionPayload[j].instanceId) {
									oActionPayload[j].processType = "PO";
									oActionPayload[j].processId = selectedTasksArray[i].processId;;
									oActionPayload[j].relCode = "10";
									if (selectedTasksArray[i].processName === "PurchaseOrderApprovalProcess") {
										oActionPayload[j].signatureVerified = "YES";
									}
								}
							}
						}
						break;

					case "Sharepoint":
						for (var j = 0; j < oActionPayload.length; j++) {
							if (selectedTasksArray[i].taskId === oActionPayload[j].instanceId) {
								oActionPayload[j].processId = selectedTasksArray[i].processId;
							}
						}

						break;

					case "SuccessFactors":
						for (var j = 0; j < oActionPayload.length; j++) {
							if (selectedTasksArray[i].taskId === oActionPayload[j].instanceId) {
								oActionPayload[j].subject = selectedTasksArray[i].subject;
							}
						}

						break;

					case "SuccessFactor":
						for (var j = 0; j < oActionPayload.length; j++) {
							if (selectedTasksArray[i].taskId === oActionPayload[j].instanceId) {
								oActionPayload[j].subject = selectedTasksArray[i].subject;
								oActionPayload[j].processType = selectedTasksArray[i].processName;
							}
						}

						break;

					case "BPM":
					case "SCP":
						for (var j = 0; j < oActionPayload.length; j++) {
							if (selectedTasksArray[i].taskId === oActionPayload[j].instanceId) {
								oActionPayload[j].origin = "SCP"; // to change all the "BPM" origin to "SCP" with same SCP payload.
							}
						}
						break;
					}
				}

			}

			var oFinalPayload = {
				"isChatbot": false,
				"task": oActionPayload
			}
			if (oFinalPayload.task.length === 0) {
				oActionHeader.setProperty("/doneEnabled", false);
			} else {
				oActionHeader.setProperty("/doneEnabled", true);
			}
			oActionHeader.setProperty("/oActionPayload", oFinalPayload);
			if (actionType === "Claim" || actionType === "Release" || actionType === "Forward") {
				this.actionServiceCall(oFinalPayload);
			}

		},

		// function triggered when the Done button is clicked on the comment popup
		onCommentsDone: function () {
			var oActionHeader = this.getModel("oActionHeader");
			var comment = oActionHeader.getProperty("/actionComments");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var selectedAction = this.oAppModel.getProperty("/selectedAction");
			var oActionPayload = oActionHeader.getProperty("/oActionPayload");
			var userComment = "";
			if (comment) {
				userComment = comment;
			}
			//var selectedTasksArray = this.oAppModel.getProperty("/selectedTasksArray");
			if (selectedAction === "Reject" && !comment) {
				this._showToastMessage(i18n.getText("ADD_COMMENT_MESSAGE"));
			} else {
				for (var i = 0; i < oActionPayload.task.length; i++) {
					oActionPayload.task[i].comment = userComment;
				}
				if (oActionHeader.getProperty("/taskProcessName") !== "ApprovalForAwardforRFQ") {
					this.actionServiceCall(oActionPayload);
				} else {
					this.aribaApproveFn();
				}
			}

		},

		openCommentsFragment: function (selectedAction, selectedActionText) {
			var oActionHeader = this.getModel("oActionHeader");
			oActionHeader.setProperty("/selectedActionText", selectedActionText);
			oActionHeader.setProperty("/selectedAction", selectedAction);
			if (!this._actionComments) {
				this._actionComments = this._createFragment("oneapp.incture.workbox.fragment.ActionComments", this);
				this.getView().addDependent(this._actionComments);
				this._actionComments.setModel(oActionHeader, "oActionHeader");
			}
			this._actionComments.setModel(oActionHeader, "oActionHeader");
			this.wbPrepareActionPayload(selectedAction); // to prepare payload
			this._actionComments.open();
		},

		closeComments: function (oEvent) {
			var oActionHeader = this.getModel("oActionHeader");
			oActionHeader.setProperty("/actionComments", "");
			oActionHeader.setProperty("/taskDataText", []);
			oActionHeader.setProperty("/nonRejectableText", []);
			this._actionComments.close();
		},

		onCommentEnter: function (oEvent) {
			var sTypedComment = oEvent.getParameters().value;
			var oActionHeader = this.getModel("oActionHeader");
			oActionHeader.setProperty("/sTypedComment", sTypedComment);
		},

		actionServiceCall: function (oActionPayload) {
			var oActionHeader = this.getModel("oActionHeader");
			oActionHeader.setProperty("/doneEnabled", false);
			var selectedAction = oActionHeader.getProperty("/selectedAction");
			var oAppModel = this.getModel("oAppModel");
			var processName;
			var validation = true;
			if (this.oAppModel.getProperty("/currentView") === "taskDetailPage") {
				processName = this.oAppModel.getProperty("/taskObjectDetails/processName");
				var taskName = this.oAppModel.getProperty("/taskObjectDetails/name");
				if (processName === "ExpenseApprovalProcess" && taskName === "Expense Request Approval L3") {
					this.expenseProcessActionFn(oActionHeader);
				}
			} else {
				processName = oActionHeader.getProperty("/taskProcessName");
				if (processName === "WorkNet Project" && (selectedAction === "Reject" ||
						selectedAction === "Approve")) {
					selectedAction = "Update";
				}
			}
			if (((processName !== "analystprocessworkflow" || processName !== "jabilinventorymanagement" || processName !==
						"analyst_appproval_process" || processName !== "inventoryparentworkflow" || processName !== "ic_manager_approval_process") &&
					selectedAction !== "Update") || (processName === "WorkNet Project" && selectedAction !== "Update")) {

				if (this.oAppModel.getProperty("/currentView") === "taskDetailPage") {
					// saving the task level attributes if the process origin is adhoc
					if (selectedAction === "Approve" || selectedAction === "Reject" || selectedAction === "Resolve" || selectedAction === "Done" ||
						selectedAction === "Complete") {
						if (this.oAppModel.getProperty("/taskObjectDetails/origin") === "Ad-hoc") {
							validation = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.TaskDetail").getController().saveAttributesFn();
							if (!validation) {
								if (this._actionComments) {
									this._actionComments.close();
								}
							}
						}
					}
				}
				if (oActionPayload.task.length === 0) {
					oActionHeader.setProperty("/doneEnabled", false);
				} else {
					var oDefaultDataModel = this.getModel("oDefaultDataModel");
					if (validation) {
						var that = this;
						var url = "/oneappinctureworkbox/WorkboxJavaService/inbox/actions";
						this.doAjax(url, "POST", oActionPayload, function (oEvent) {
							if (that._actionComments) {
								that._actionComments.close();
							}
							if (processName === "AnnualLeavePlannerForRMG" && this.oAppModel.getProperty("/currentView") === "taskDetailPage") {
								var tokenPayload = {
									"userId": "INC01201",
									"password": "INC01201@123"
								};
								url = "https://hrapp.cfapps.eu10.hana.ondemand.com/login";
								this.doAjax(url, "POST", tokenPayload, function (oData) {
									this.rmgLeaveUpdateFn(oActionHeader, oData.token);
								}.bind(this), function (oError) {}.bind(this));
							}
							that.onClickFilterDetail();
							oActionHeader.setProperty("/selectedItemLength", 0);
							oActionHeader.setProperty("/actionComments", "");
							oActionHeader.setProperty("/doneEnabled", true);
							that.resetActionButtons();
							this.aActionsDataArray = [];
							this.setInboxPanel();
							if (processName !== "AnnualLeavePlannerForRMG") {
								that._showToastMessage(oEvent.message);
							}
							if (oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
								that.setTaskBoardData();
							}
							if ((oActionPayload.task) instanceof Array && oActionPayload.task.length > 0) {
								for (var i = 0; i < oActionPayload.task.length; i++) {
									if (oActionPayload.task[i].actionType === "Forward") {
										that.fnUpdateChatMember(oActionPayload.task[i].instanceId);
									}
								}
							}
							setTimeout(function () {
								if (that.oAppModel.getProperty("/currentView") !== "unifiedInbox") {
									that._doNavigate("UnifiedInbox", {});
								}
							}, 1000);
						}.bind(this), function (oEvent) {
							that._showToastMessage(oEvent.message);
						}.bind(this));
					}
				}
			} else {
				if (processName === "WorkNet Project") {
					this.jiraActionUpdateFn(oActionPayload);
				} else {
					this.jabilTasksUpdateFn(oActionPayload);
				}
			}
		},

		/*Function triggered to reset the action buttons (remove this function after testing)*/
		resetActionButtons: function (sDeselectAll) {
				var oActionHeader = this.getModel("oActionHeader");
				var i18n = this.getView().getModel("i18n").getResourceBundle();
				var dtoDefault = [{
					"key": "Forward",
					"name": i18n.getText("FORWARD_TEXT"),
					"enabled": false,
					"visible": false,
					"icon": "sap-icon://customfont/Forward"
				},{
					"key": "View",
					"name": i18n.getText("VIEW_TEXT"),
					"enabled": false,
					"visible": false, // changed true to false by siva, Date: 09/09/2021
					"icon": "sap-icon://customfont/Eye"
				},  {
				"key": "Claim",
				"name": "Claim/Release",
				"visible": true,
				"enabled": false,
				"icon": "sap-icon://customfont/Claim"
            },{
					"key": "CreateSubtask",
					"name": "Create Subtask",
					"enabled": false,
					"visible": false,
					"icon": "sap-icon://customfont/CreateSubtask"
				}, {
					"key": "Renew",
					"name": "Renew",
					"enabled": false,
					"visible": false,
					"icon": "sap-icon://customfont/Renew"
				}, {
					"key": "Rrchive",
					"name": "Archive",
					"enabled": false,
					"visible": false,
					"icon": "sap-icon://customfont/Archive"
				}, {
					"key": "AdHoc",
					"name": "Ad Hoc",
					"enabled": false,
					"visible": false,
					"icon": "sap-icon://customfont/Check"
				}, {
					"key": "RequestRequestor",
					"name": "Request Requestor",
					"enabled": false,
					"visible": false,
					"icon": "sap-icon://customfont/PushBack"
				}];

				var dtoMore = [];
				oActionHeader.setProperty("/dtoDefaultCopy", dtoDefault);
				oActionHeader.setProperty("/dtoMoreCopy", dtoMore);
				oActionHeader.setProperty("/dtoDefault", dtoDefault);
				oActionHeader.setProperty("/dtoMore", dtoMore);
				oActionHeader.setProperty("/enableMore", false);
				this.oAppModel.setProperty("/selectedTasksArray", []);
				var aDtoDefaultCopy = oActionHeader.getProperty("/dtoDefaultCopy");
				oActionHeader.refresh(true);
			},
            /*********End - Action buttons latest code*********/
            
            exportData_test: function (oEvent) {
            var filterData = this.oAppModel.getProperty("/filterData");
            var url = "/WorkboxJavaService/filesExport/inboxDownload";

            this.doAjax(url, "POST", filterData, function (oData) {
                this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("EXPORTING_TEXT") + this.oAppModel.getProperty(
                    "/inbox/workBoxDtos").length + " tasks.");

                var fileName = filterData.inboxType;
                if (this.oAppModel.getProperty("/currentViewPage") === "AdminInbox") {
                    fileName = "Admin Tasks";
                }
                if (oData.message.status === "SUCCESS") {
                    this.downloadAttachment(null, "application/xlsx", fileName, oData.fileContent);
                }
            }.bind(this),
                function () { });
        },

        // Jabil changes - start
        fnSortDiloag: function () {
                var that = this;
                var oView = this.getView();
                if (!that.oSorter) {
                    that.oSorter = sap.ui.xmlfragment(
                        "oneapp.incture.workbox.fragment.SorterFragment", that);
                    oView.addDependent(that.oSorter);
                }
                that.oSorter.open();
            },

        onTabChange: function(oEvent) {
            var selectedKey = oEvent.getSource().getSelectedKey();
			var oAppModel = this.getModel("oAppModel");
			// if (selectedKey === "MyInbox"){
			//     oAppModel.setProperty("/inboxType", selectedKey);
			//     this.onClickFilterDetail();
			// }else if (selectedKey === "SubstitutionInbox") {

			// } else if (selectedKey === "CompletedTasks") {

            // }
            
            oAppModel.setProperty("/inboxType", selectedKey);
            this.resetActionButtons();
            this.removeAllTokens();
			this.onClickFilterDetail();
        },

        	onTaskCheckboxSelect: function () {
			var oTaskInboxModel = this.getModel("oTaskInboxModel");
			var oActionHeader = this.getModel("oActionHeader");
			var oAppModel = this.getModel("oAppModel");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var multiselect = false;
			var oAllSubheaderBtns = [];
			var selectedItems = this.getView().byId("WB_TASK_CARD_ITEM").getSelectedItems();
			// To set the state of the global checkbox.
			var items = this.getView().byId("WB_TASK_CARD_ITEM").getItems();
			if (selectedItems.length !== items.length) {
				this.getModel("oTaskInboxModel").setProperty("/checkBoxState", false);
			} else {
				this.getModel("oTaskInboxModel").setProperty("/checkBoxState", true);
			}
			if (selectedItems.length > 1) {
				multiselect = true;
			}
			var selectedTasksArray = [];
			var selectedContextPaths = this.getView().byId("WB_TASK_CARD_ITEM").getSelectedItems();
			for (var i = 0; i < selectedContextPaths.length; i++) {
				var contextData = selectedContextPaths[i].getBindingContext("oTaskInboxModel").getObject();
				selectedTasksArray.push(contextData);
			}
			this.oAppModel.setProperty("/selectedTasksArray", selectedTasksArray);
			// button data 
			var viewBtn = {
				"key": "View",
				"name": i18n.getText("VIEW_TEXT"),
				"enabled": false, // changed true to false by siva, Date: 09/09/2021
				"visible": false, // changed true to false by siva, Date: 09/09/2021
				"icon": "sap-icon://customfont/Eye"
			};
			var forwardBtn = {
				"key": "Forward",
				"name": i18n.getText("FORWARD_TEXT"),
				"enabled": true,
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
            
            var claimRelease = {
				"key": "ClaimRelease",
				"name": "Claim/Release",
				"visible": true,
				"enabled": true,
				"icon": "sap-icon://customfont/Claim"
			}
			if (!multiselect && selectedItems.length !== 0) {
                if (oAppModel.getProperty("/inboxType") === "CompletedTasks"){
                    oAllSubheaderBtns.push(viewBtn);
                } else {
                    oAllSubheaderBtns.push(forwardBtn);
				oAllSubheaderBtns.push(viewBtn);
				status = selectedTasksArray[0].status;
				if (status === "READY") {
					oAllSubheaderBtns.push(claimBtn);
				} else {
					oAllSubheaderBtns.push(releaseBtn);
                }
                }
				
                
			} else if (multiselect){
                if (oAppModel.getProperty("/inboxType") !== "CompletedTasks"){
                    //oAllSubheaderBtns.push(forwardBtn);
                } else {
                    claimBtn.enabled = false;
                    viewBtn.enabled = false;
                    oAllSubheaderBtns.push(viewBtn);
                    oAllSubheaderBtns.push(claimBtn);
                }
			} else if (selectedItems.length === 0){
                claimRelease.enabled = false;
                    viewBtn.enabled = false;
                    oAllSubheaderBtns.push(viewBtn);
                    oAllSubheaderBtns.push(claimRelease);
            }
			oAppModel.setProperty("/finalActionButtons", oAllSubheaderBtns);
			oActionHeader.setProperty("/dtoDefaultCopy", oAllSubheaderBtns);
		},
		onSelectBulkCheckBox: function (oEvent) {
				var oList = this.getView().byId("WB_TASK_CARD_ITEM");
				if (oEvent.getSource().getProperty("selected")) {
					oList.selectAll();
					this.onTaskCheckboxSelect();
				} else {
					oList.removeSelections();
					this.resetActionButtons();
				}
            },
        
        handleSortDialogConfirm: function (oEvent) {
                var oList = this.byId("WB_TASK_CARD_ITEM"),
                    mParams = oEvent.getParameters(),
                    oBinding = oList.getBinding("items"),
                    sPath,
                    bDescending,
                    aSorters = [];

                sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));

                // apply the selected sort and group settings
                oBinding.sort(aSorters);
            },
        // Jabil Changes - end 
        
	});
});
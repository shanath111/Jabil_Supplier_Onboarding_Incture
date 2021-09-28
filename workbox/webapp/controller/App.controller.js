sap.ui.define([
	"oneapp/incture/workbox/controller/BaseController",
	"oneapp/incture/workbox/util/formatter",
	"oneapp/incture/workbox/controlExtension/ExtDatePicker",
	"oneapp/incture/workbox/controlExtension/ExtDateRangeSelection",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel"
], function (BaseController, formatter, ExtDatePicker, ExtDateRangeSelection, taskManagement, workbox, utility, JSONModel) {
	"use strict";

	return BaseController.extend("oneapp.incture.workbox.controller.App", {
		formatter: formatter,
		utility: utility,

		onInit: function () {
			var that = this;
			this.fnInitApp();
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(function (oEvent) {
				that.routePatternMatched(oEvent);
			});
			this.fnSetSideNavItems(); //To be deleted on actual data

			var appFunctionality = {
				"expanded": true,
				"direction": "Row",
				"visibility": true
			};
			this.oAppModel.setProperty("/functionality", appFunctionality);
			this.registerIcons();
			var oProcessFlowModel = new JSONModel();
			oProcessFlowModel.busy = false;
			this.setModel(oProcessFlowModel, "oProcessFlowModel");
			var oLocalModel = this.getOwner().getModel("oLocalModel");
			this.setModel(oLocalModel, "oLocalModel");
			this.oLocalModel = oLocalModel;

			var oAdvanceFilterModel = new JSONModel(this.oLocalModel.getProperty("/advancefilterMetaData"));
			this.setModel(oAdvanceFilterModel, "oAdvanceFilterModel");
			this.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", this.oAppModel.getProperty("/currentViewPage"));
			this.getModel("oAdvanceFilterModel").setProperty("/appController", this);

			/**************************Collaboration Changes-By Karishma*********************/
			this.oAppModel.setProperty("/bGlobalSearchSuggestion", false);
			var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
			this.getView().setModel(oCollaborationModel, "oCollaborationModel");
			oCollaborationModel.setProperty("/bIsTaskOwner", true);
			/**************************Collaboration Changes End-By Karishma*********************/
			this.setChatBot();

		},

		setChatBot: function () {
			var chatBot = {
				screen: "",
				messages: [],
			};
			var oChatBotModel = new JSONModel(chatBot);
			this.setModel(oChatBotModel, "oChatBotModel");
			var developerToken = "30b29c484f504bf7ea3d479f9b3bedd5";
			var requestToken = "Token 05a0e1543534292aca4f95102c7edd6f";
			oChatBotModel.setProperty("/developerToken", developerToken);
			oChatBotModel.setProperty("/requestToken", requestToken);
			// this.getBot();
		},

		registerIcons: function () {
			sap.ui.core.IconPool.addIcon('TableSettings', 'customfont', 'icomoon', 'e923');
			sap.ui.core.IconPool.addIcon('sendArrow', 'customfont', 'icomoon', 'e922');
			sap.ui.core.IconPool.addIcon('PinIcon', 'customfont', 'icomoon', 'e921');
			sap.ui.core.IconPool.addIcon('ChatAttchmentIcon', 'customfont', 'icomoon', 'e911');
			sap.ui.core.IconPool.addIcon('ChatEmojiIcon', 'customfont', 'icomoon', 'e915');
			sap.ui.core.IconPool.addIcon('DeliveredStatus', 'customfont', 'icomoon', 'e916');
			sap.ui.core.IconPool.addIcon('Microphone', 'customfont', 'icomoon', 'e919');
			sap.ui.core.IconPool.addIcon('SeenStatus', 'customfont', 'icomoon', 'e91a');
			sap.ui.core.IconPool.addIcon('SentStatus', 'customfont', 'icomoon', 'e91d');
			sap.ui.core.IconPool.addIcon('unpinIcon', 'customfont', 'icomoon', 'e91e');
			sap.ui.core.IconPool.addIcon('VolumeOff', 'customfont', 'icomoon', 'e91f');
			sap.ui.core.IconPool.addIcon('volume-up', 'customfont', 'icomoon', 'e920');
			sap.ui.core.IconPool.addIcon('chatbubblesIcon', 'customfont', 'icomoon', 'e907');
			sap.ui.core.IconPool.addIcon('ExportIcon', 'customfont', 'icomoon', 'e912');
			sap.ui.core.IconPool.addIcon('LineItemEyeIcon', 'customfont', 'icomoon', 'e913');
			sap.ui.core.IconPool.addIcon('MoreIcon', 'customfont', 'icomoon', 'e914');
			sap.ui.core.IconPool.addIcon('ResetIcon', 'customfont', 'icomoon', 'e917');
			sap.ui.core.IconPool.addIcon('SaveIcon', 'customfont', 'icomoon', 'e918');
			sap.ui.core.IconPool.addIcon('CompleteIcon', 'customfont', 'icomoon', 'e90f');
			sap.ui.core.IconPool.addIcon('Eye', 'customfont', 'icomoon', 'e90c');
			sap.ui.core.IconPool.addIcon('AdHoc', 'customfont', 'icomoon', 'e900');
			sap.ui.core.IconPool.addIcon('ApproveAccept', 'customfont', 'icomoon', 'e901');
			sap.ui.core.IconPool.addIcon('Archive', 'customfont', 'icomoon', 'e902');
			sap.ui.core.IconPool.addIcon('Claim', 'customfont', 'icomoon', 'e903');
			sap.ui.core.IconPool.addIcon('Complete', 'customfont', 'icomoon', 'e904');
			sap.ui.core.IconPool.addIcon('CreateSubtask', 'customfont', 'icomoon', 'e905');
			sap.ui.core.IconPool.addIcon('DeclineReject', 'customfont', 'icomoon', 'e906');
			sap.ui.core.IconPool.addIcon('Forward', 'customfont', 'icomoon', 'e908');
			sap.ui.core.IconPool.addIcon('PushBack', 'customfont', 'icomoon', 'e909');
			sap.ui.core.IconPool.addIcon('Release', 'customfont', 'icomoon', 'e90a');
			sap.ui.core.IconPool.addIcon('Renew', 'customfont', 'icomoon', 'e90b');
			sap.ui.core.IconPool.addIcon('Resume', 'customfont', 'icomoon', 'e90d');
			sap.ui.core.IconPool.addIcon('skipCurrentAssignement', 'customfont', 'icomoon', 'e90e');
			sap.ui.core.IconPool.addIcon('Suspend', 'customfont', 'icomoon', 'e910');
		},

		routePatternMatched: function () {

		},

		//get all the user details
		//use the same function to set data to other models on success
		// initialised advancedsearch dto here as it needs user list for startedby and forwarded by
		getCommonServicesFn: function () {
			var oConstantsModel = this.getModel("oConstantsModel");
			var iurl = "/oneappinctureworkbox/WorkboxJavaService/idpMapping/getUsers";
			oConstantsModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(iurl, "GET", null, function (oData) {
				if (oData.dto.length > 100) {
					this.getModel("oConstantsModel").setSizeLimit(oData.dto.length);
				}
				oConstantsModel.setProperty("/allUsers", oData.dto);

				oConstantsModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function () {}.bind(this));
			this.setSearchFilterDto();
			var url = "/oneappinctureworkbox/WorkboxJavaService/customProcess/getProcess?processType=All";
			oConstantsModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "GET", null, function (oData) {
				oConstantsModel.setProperty("/processNames", oData.processDetails);
				var process = jQuery.extend(true, [], oData.processDetails);
				for (var i = 0; i < process.length; i++) {
					if (process[i].processName === "ALL") {
						process.splice(i, 1);
					}
				}
				oConstantsModel.setProperty("/processNamesList", process);
				oConstantsModel.setProperty("/selectedProcess", process[0].processName); // setting the default data as 1st process in  dropdown
				oConstantsModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function () {}.bind(this));
		},

		/*****Development by Vaishnavi - start*****/

		/***** App Controller (Common Functions) - start *****/

		//Function to set Side Nav items on load
		fnSetSideNavItems: function () {
			var oAppModel = this.oAppModel;
			oAppModel.setProperty("/sideNavItemProperties", this.getView().byId("WB_SIDENAV_LIST"));
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var that = this;
			utility.fnSetSideNavItemsUT(i18n, oAppModel, that);
		},

		//expandable collapsable functionality of side navigation list items
		onExpandCollapseNavBar: function () {
			var oAppModel = this.oAppModel;
			utility.onExpandCollapseNavBarUT(oAppModel, this);
		},

		//triggers when the tab is changed
		//admin console -  if there is any changes in the tab we present it ll open a dialog box else the tab will be changed to the selected tab
		onSelectApp: function (oEvent) {
			var oAppModel = this.oAppModel;
			var warning = this.getView().getModel("i18n").getResourceBundle().getText("DATA_LOSS_ALERT_TEXT");
			var alertmessage = this.getView().getModel("i18n").getResourceBundle().getText("ALERT_TEXT");
			var selectedKey = oEvent.getSource().getKey();
			oAppModel.setProperty("/inboxTab", "MyInbox");
			this.clearFilters();

			if (selectedKey === "CompletedTasks") {
				oAppModel.setProperty("/tableSelection", "None");
			} else {
				oAppModel.setProperty("/tableSelection", "MultiToggle");
			}
			oAppModel.setProperty("/enableBulkDeleteButton", false); // to disable the delete button on view change.
			if ((oAppModel.getProperty("/currentView")) === "adminConsole") {
				var oDefaultDataModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getModel(
					"oDefaultDataModel");
				oDefaultDataModel.setProperty("/sideNavItemProperties", this.getView().byId("WB_SIDENAV_LIST"));
				var that = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController();
				oDefaultDataModel.setProperty("/temporarySelectedKey", oEvent.getSource());
				oDefaultDataModel.setProperty("/openPreviewWorkFlow", false);
				oDefaultDataModel.setProperty("/fromApp", true);
				if (oAppModel.getProperty("/isChanged")) {
					this._createConfirmationMessage(warning, alertmessage, "Warning", "Yes", "No", true,
						function (discardChange) {
							oAppModel.setProperty("/previousPage", oAppModel.getProperty("/currentViewPage"));
							oAppModel.setProperty("/currentViewPage", selectedKey);
							oAppModel.setProperty("/isChanged", false);
							utility.onClickResetUT(that, oDefaultDataModel, oAppModel);
							oAppModel.setProperty("/currentViewDisplayText", oDefaultDataModel.getProperty("/temporarySelectedKey").mProperties.text);
						},
						function (clearTabPress) {
							oAppModel.setProperty("/isChanged", true);
							oDefaultDataModel.getProperty("/sideNavItemProperties").setSelectedKey(oAppModel.getProperty("/currentViewPage"));
						});
				} else {
					oAppModel.setProperty("/previousPage", oAppModel.getProperty("/currentViewPage"));
					oAppModel.setProperty("/currentViewPage", selectedKey);
					utility.onClickResetUT(that, oDefaultDataModel, oAppModel);
					oAppModel.setProperty("/currentViewDisplayText", oEvent.getSource().getText());
				}
				if (selectedKey === "versionControl") {
					this.getAllVersions();
				}
				if (selectedKey === "manageDashboardTiles") {
					this.onGraphSettings();
				}
			} else if (oAppModel.getProperty("/currentView") === "taskBoard") {
				/**************************Collaboration Changes-By Karishma*********************/
				var oCollaborationModel = this.getModel("oCollaborationModel");
				oCollaborationModel.setProperty("/bGlobalSearch", false);
				/**************************Collaboration Changes End-By Karishma*********************/
				var oConstantsModel = this.getModel("oConstantsModel");
				var chatController = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.Chat").getController();
				if (selectedKey === "directMessage") {
					oConstantsModel.setProperty("/chatSerachSuggesEnbl", true);
					chatController.selectedChatScreen(selectedKey);
				} else if (selectedKey === "channelsTasks") {
					oConstantsModel.setProperty("/chatSerachSuggesEnbl", false);
					chatController.selectedChatScreen(selectedKey);
				} else if (selectedKey === "groups") {
					oConstantsModel.setProperty("/chatSerachSuggesEnbl", false);
					chatController.selectedChatScreen(selectedKey);
				} else if (selectedKey === "favorites") {
					oConstantsModel.setProperty("/chatSerachSuggesEnbl", false);
					chatController.selectedChatScreen(selectedKey);
				} else if (selectedKey === "pinned") {
					oConstantsModel.setProperty("/chatSerachSuggesEnbl", false);
					chatController.selectedChatScreen(selectedKey);
				} else if (selectedKey === "chatBot") {
					oConstantsModel.setProperty("/chatSerachSuggesEnbl", false);
					chatController.selectedChatScreen(selectedKey);
				}
			} else if (oAppModel.getProperty("/currentView") === "unifiedInbox") {
				var oContext = oEvent.getSource().getBindingContext("oAppModel").getObject();
				if (selectedKey === "AllTask" || selectedKey === "Groups" || selectedKey === "Views") {
					if (selectedKey === "AllTask") {
						oContext = oContext.dtoList[0];
						selectedKey = oContext.inboxId;
					} else {
						if (oContext.dtoList) {
							oContext = oContext.dtoList[0];
							selectedKey = oContext.inboxId;
						} else {
							return;
						}
					}
				}
				this.removeAllTokens();
				oAppModel.setProperty("/graphClicked", false);
				var parentId = oContext.parentId;
				this.oAppModel.setProperty("/currentViewPageName", oContext.name);
				this.oAppModel.setProperty("/isAppliedAdvancedFilter", false);
				var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
				var cPage = selectedKey;
				oAppModel.setProperty("/inboxName", "");
				oAdvanceFilterModel.setProperty("/searchInboxType", oContext.inboxId);
				oAdvanceFilterModel.setProperty("/viewAppliedContext", {});
				oAppModel.setProperty("/isViewApplied", false);
				if (parentId === "Groups" || parentId === "Views") {
					if (parentId === "Views") {
						cPage = oContext.name;
						this.setCurrentPage(cPage, cPage, null, false, false);
						oAppModel.setProperty("/isViewApplied", true);
						oAdvanceFilterModel.setProperty("/filterName", oContext.name);
						oAdvanceFilterModel.setProperty("/isView", true);
						oAdvanceFilterModel.setProperty("/viewName", oContext.name);
						oAdvanceFilterModel.setProperty("/filterId", oContext.inboxId);
						oAdvanceFilterModel.setProperty("/viewAppliedContext", oContext);
						this.setSavedFilterToInbox(oContext.viewPayload);
					} else {
						oAppModel.setProperty("/inboxName", parentId);
					}
				}
				oAppModel.setProperty("/currentPage", "1");
				oAppModel.setProperty("/currentPageTray", "1");

				if (!oAppModel.getProperty("/isViewApplied")) {
					this.setCurrentPage(cPage, cPage, null, false, false);
					sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().onClickFilterDetail();

				}
				if (oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
					sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().getTaskBoardData();
				}
				var oActionHeader = this.getModel("oActionHeader");
				oActionHeader.setProperty("/selectedItemLength", 0);
				sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().resetActionButtons();
			}
		},

		/***** App Controller (Common Functions) - end *****/

		/***** App Controller (Admin Console related functions) - start *****/

		// according the to tab that is active, this will call the particular submit method in admin Console
		onClickApply: function () {
			var that = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController();
			var oAppModel = this.oAppModel;
			utility.onClickApplyUT(that, oAppModel);
		},

		// according the to tab that is active, this will call the particular reset method in admin console
		onClickReset: function () {
			var oDefaultDataModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getModel(
				"oDefaultDataModel");
			var that = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController();
			var oAppModel = this.oAppModel;
			utility.onClickResetUT(that, oDefaultDataModel, oAppModel);
		},

		//function to delete the process - bulk delete
		onDeleteProcess: function () {
			var that = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController().deleteProcessFn();;
		},

		//read the excel file and setting the custom attribute data and process name
		uploadExcelWorkFlow: function (oEvent) {
			var oDefaultDataModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getModel(
				"oDefaultDataModel");
			var that = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController();
			taskManagement.uploadExcelWorkFlowTM(that, oEvent, oDefaultDataModel);
		},

		//workflow preview
		previewFn: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController().workFlowPreviewFn();
		},

		//ui generator apply changes and load template fn
		onClickApplyUiGenerator: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController().updateUIGenerator();
		},

		//ui generator reset template function
		onClickResetUiGenerator: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController().onResetDataUI();
		},

		//calling the export function of cfa table
		exportCfaData: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController().exportCfaTableData();
		},
		// onClickVersionControl: function () {
		// 	sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController().versionControlTabClick();

		// },
		/***** App Controller (Admin Console related functions) - end *****/

		/*****Development by Vaishnavi - end*****/

		// <----------------------------------------- START SEARCH FILTER METHODS---------------------------------------------------------->
		// set search filter dto
		setSearchFilterDto: function () {

			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			if (!oAdvanceFilterModel.getProperty("/standardFilter") || oAdvanceFilterModel.getProperty("/standardFilter").length === 0) {
				var url = "/oneappinctureworkbox/WorkboxJavaService/inbox/getMetadata";
				this.doAjax(url, "GET", null, function (oData) {
					var oCheckBox = {
						"filterType": "CHECKBOX",
						"dropdownList": []
					};
					var checkBoxIndices = [];
					oAdvanceFilterModel.setProperty("/standardFilter", oData.standardFilter);
					var aAdvancedFilterNames = [];
					oAdvanceFilterModel.setProperty("/aAdvancedFilterNames", aAdvancedFilterNames);
					oAdvanceFilterModel.setProperty("/selectedFilterNames", []);
					oAdvanceFilterModel.setProperty("/allFilters", []);
					oAdvanceFilterModel.setProperty("/checkboxDto", oCheckBox);
					oAdvanceFilterModel.setProperty("/checkBoxIndices", checkBoxIndices);
					for (var i = 0; i < oData.standardFilter.length; i++) {
						i = this.remodelMetaData(oData, oData.standardFilter[i], i, i, "standard");
					}
					oAdvanceFilterModel.setProperty("/templateAdvancedFilterNames", jQuery.extend(true, [], aAdvancedFilterNames));
					var standardFilter = oAdvanceFilterModel.getProperty("/standardFilter");
					if (oAdvanceFilterModel.getProperty("/checkBoxIndices").length > 0) {
						standardFilter.splice(oAdvanceFilterModel.getProperty("/checkBoxIndices/0"), 0, oAdvanceFilterModel.getProperty("/checkboxDto"));
					}
					oAdvanceFilterModel.setProperty("/templateStandardFilter", jQuery.extend(true, [], standardFilter));
					oAdvanceFilterModel.setProperty("/filterCount", aAdvancedFilterNames.length);
					var headers = jQuery.extend(true, [], oAdvanceFilterModel.getProperty(
						"/listOfAdvancedFilters/0/advancedFilter"));
					oAdvanceFilterModel.setProperty("/templateAdvancedFilters", jQuery.extend(true, {}, oAdvanceFilterModel.getProperty(
						"/listOfAdvancedFilters/0")));
					oAdvanceFilterModel.setProperty("/headers", headers);
				}.bind(this), function () {}.bind());
			}
		},
		// Remodeling of payload- adding extra properties
		remodelMetaData: function (oData, bindingObject, index, aIndex, type) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var oCheckBox = oAdvanceFilterModel.getProperty("/checkboxDto");
			var checkBoxIndices = oAdvanceFilterModel.getProperty("/checkBoxIndices");
			bindingObject.selectedKey = "";
			if (bindingObject.filterType === "MULTICOMBOBOX") {
				bindingObject.selectedKey = [];
			}
			bindingObject.value = "";
			bindingObject.type = type;
			bindingObject.lowerLimit = "";
			bindingObject.upperLimit = "";
			bindingObject.dropdownList = [];
			bindingObject.operator = "AND";
			bindingObject.condition = "contains";
			bindingObject.enabled = true;
			bindingObject.displayValue = "";
			bindingObject.index = index.toString();
			bindingObject.aIndex = aIndex;
			var allFilters = oAdvanceFilterModel.getProperty("/allFilters");
			allFilters.push(bindingObject.tableAlias + "." + bindingObject.columnName);
			var aAdvancedFilterNames = oAdvanceFilterModel.getProperty("/aAdvancedFilterNames");
			aAdvancedFilterNames.push(bindingObject);
			var advancedFilterList = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters/0/advancedFilter/1/dropdownList");
			if (advancedFilterList instanceof Array && advancedFilterList.length >= 0)
				advancedFilterList.push(bindingObject);
			if (bindingObject.columnName === "SUBJECT") {
				oAdvanceFilterModel.setProperty("/subjectIndex", "/standardFilter/" + index);
			}
			if (bindingObject.columnName === "NAME") {
				bindingObject.selectionList = "";
				bindingObject.autoCompleteType = "default";
				oAdvanceFilterModel.setProperty("/processNameIndex", "/standardFilter/" + index);
			} else if (bindingObject.selectionList && bindingObject.autoCompleteType !== "default" && (bindingObject.filterType === "COMBOBOX" ||
					bindingObject.filterType === "MULTICOMBOBOX")) {
				this.aggregateDropdownList("/oneappinctureworkbox/WorkboxJavaService" + bindingObject.selectionList, index, aIndex, true);
			} else if (bindingObject.conditionList && (bindingObject.filterType === "DATEFILTER" || bindingObject.filterType === "COMBOINPUT")) {
				this.aggregateDropdownList("/oneappinctureworkbox/WorkboxJavaService" + bindingObject.conditionList, index, aIndex, true);
			} else if (bindingObject.filterType === "CHECKBOX") {
				checkBoxIndices.push(index);
				oCheckBox.dropdownList.push(bindingObject);
				bindingObject.index = index + "/dropdownList/" + (oCheckBox.dropdownList.length - 1);
				bindingObject.aIndex = index + (oCheckBox.dropdownList.length - 1);
				oData.standardFilter.splice(index, 1);
				index--;
			} else {
				this.getModel("oAdvanceFilterModel").setProperty("/standardFilter/" + index + "/dropdownList", []);
			}
			return index;

		},
		// Get dropdown list for combo input, combo box, date filter condition
		// bool === false	if user doesnt want to do service call for getting
		aggregateDropdownList: function (url, index, aIndex, bool) {

			var fnGetList = function (index, aIndex, oData) {
				this.getModel("oAdvanceFilterModel").setProperty("/standardFilter/" + index + "/dropdownList", oData);
				this.getModel("oAdvanceFilterModel").setProperty("/aAdvancedFilterNames/" + aIndex + "/dropdownList", oData);
				this.getModel("oAdvanceFilterModel").setProperty("/templateAdvancedFilterNames/" + aIndex + "/dropdownList", oData);
				this.getModel("oAdvanceFilterModel").setProperty("/templateStandardFilter/" + index + "/dropdownList", oData);
				this.getModel("oAdvanceFilterModel").refresh(true);

			}.bind(this);
			if (bool) {
				this.doAjax(url, "GET", null, function (oData) {
					fnGetList(index, aIndex, oData.keyValuePairs);
				}.bind(this), function (oError) {}.bind(this));
			} else {
				fnGetList(index, aIndex, this.getModel("oConstantsModel").getProperty("/allUsers"));
			}

		},
		// Get custom attribute based on process name and push to standard filter
		getCustomAttributes: function (processName, rSuccess) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			oAdvanceFilterModel.setProperty("/busy", true);
			var aAdvancedFilterNames = oAdvanceFilterModel.getProperty("/aAdvancedFilterNames");
			var allFilters = oAdvanceFilterModel.getProperty("/allFilters");
			var filterCount = oAdvanceFilterModel.getProperty("/filterCount"); //Gives the count of standard filters
			var standardFilter = oAdvanceFilterModel.getProperty("/standardFilter");
			if (filterCount < aAdvancedFilterNames.length) {
				var sLength = aAdvancedFilterNames.length - filterCount;
				aAdvancedFilterNames.splice(filterCount, sLength);
				allFilters.splice(filterCount, sLength);
				standardFilter.splice(standardFilter.length - sLength, sLength);
			}
			// The checkbox object is added to standardFilter by splicing the index to retain index
			var url = "/oneappinctureworkbox/WorkboxJavaService/inbox/getMetadata?processName=" + processName;
			if (processName !== "") {
				this.doAjax(url, "GET", null, function (oData) {
					for (var i = 0; i < oData.customFilter.length; i++) {
						var index = this.remodelMetaData(oData.customFilter, oData.customFilter[i], oAdvanceFilterModel.getProperty("/standardFilter")
							.length, oAdvanceFilterModel.getProperty("/aAdvancedFilterNames").length, "custom");
						standardFilter.push(oData.customFilter[i]);
					}
					if (rSuccess !== undefined) {
						rSuccess();
					}
					oAdvanceFilterModel.setProperty("/busy", false);
					this.setFilterNameDropdownInFilter();
					oAdvanceFilterModel.refresh(true);
				}.bind(this), function (oError) {}.bind(this));
			} else {
				this.setFilterNameDropdownInFilter(true);
				oAdvanceFilterModel.setProperty("/busy", false);
			}
			oAdvanceFilterModel.refresh(true);
		},
		// On opening of search filter fragment changing the css of the popover and the parent
		onOpenAdvFilter: function (oEvent) {
			if (this.oAppModel.getProperty("/currentViewPage") === 'chat') {
				var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
				this.getView().setModel(oCollaborationModel, "oCollaborationModel");
				var sValue = oEvent.getSource().getParent().getAggregation("items")[1].getValue();
				if (sValue) {
					oCollaborationModel.setProperty("/iTotalPageCount", 0);
					this.fnResetChatGlobalSearch(sValue);
					this.chatGlobalSearch(sValue, "globalSearchClick");
					oEvent.getSource().getParent().getAggregation("items")[1].setValue("");
				}
			} else {
				var oSource, oParent;
				if (!oEvent) {
					oSource = this.getView().byId("WB_ADVANCE_SEARCH_ICON");
				} else {
					oSource = oEvent.getSource();
				}
				oParent = oSource.getParent();
				var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
				if (!this._oAdvanceFilter) {
					this._oAdvanceFilter = this._createFragment("oneapp.incture.workbox.fragment.AdvanceFilter", this);
					this.getView().addDependent(this._oAdvanceFilter);
					var that = this;
					document.addEventListener("click",
						function closeDialog(event) {
							if (event.target.id === "sap-ui-blocklayer-popup") {
								that._oAdvanceFilter.close();

							}
						});
					oAdvanceFilterModel.setProperty("/popoverOpened", false);
					oAdvanceFilterModel.setProperty("/oSearchFilter", this._oAdvanceFilter);
					this.setSearchFilterDto()
					this.generateSearchFilters();
					// oAdvanceFilterModel.setProperty("/popoverProperties", jQuery.extend(true, {}, oEvent));

				}
				if (!this.oAppModel.getProperty("/searchInboxDto") || this.oAppModel.getProperty("/searchInboxDto").length === 0) {
					this.setInboxPanel();
				}
				if (oAdvanceFilterModel.getProperty("/popoverOpened") === false) {
					this._oAdvanceFilter.openBy(oParent);
					oAdvanceFilterModel.setProperty("/popoverOpened", true);
					oSource.addStyleClass("wbAdvSearchDropdownIconActive");
					oSource.removeStyleClass("wbAdvSearchDropdownIconInactive");
					oParent.getItems()[0].removeStyleClass("wbAdvSearchComboboxInactive");
					oParent.getItems()[0].addStyleClass("wbAdvSearchComboboxActive");
					oParent.getItems()[1].addStyleClass("wbAdvSearchInputFieldActive");

				} else {
					this._oAdvanceFilter.close();
				}
				oAdvanceFilterModel.refresh(true);
			}
		},
		// On closing of search filter fragment changing the css of the popover and the parent
		afterCloseAdvFilter: function () {
			var oSource = this.getView().byId("WB_ADVANCE_SEARCH_ICON");
			var oParent = oSource.getParent();
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			oAdvanceFilterModel.setProperty("/popoverOpened", false);
			oSource.addStyleClass("wbAdvSearchDropdownIconInactive");
			oSource.removeStyleClass(" wbAdvSearchDropdownIconActive");
			oParent.getItems()[0].addStyleClass("wbAdvSearchComboboxInactive");
			oParent.getItems()[0].removeStyleClass("wbAdvSearchComboboxActive");
			oParent.getItems()[1].removeStyleClass("wbAdvSearchInputFieldActive");
		},

		//removing the selected token and fetching the details

		removeFilterTokenFn: function (oEvent) {

			var oAppModel = this.oAppModel;
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			oAppModel.setProperty("/removeFilterToken", true);
			var selectedToken = oEvent.getSource().getText();
			var tokenDto = oAppModel.getProperty("/filterTokens");
			var filterData = {};
			var oStandardFilter;
			var data = oAppModel.getProperty("/filterData");
			var i = parseInt(oEvent.getSource()._getBindingContext("oAppModel").getPath().split("/")[2], 10);
			if (tokenDto[i].type === "quickFilter") {
				delete data.quickFilter[tokenDto[i].key];
				if (this.oAppModel.getProperty("/selectedFreeFilter") === selectedToken) {
					this.oAppModel.setProperty("/selectedFreeFilter", "");
					this.oAppModel.setProperty("/freeFilter", "");
				}
				tokenDto.splice(i, 1);
			} else if (tokenDto[i].type === "sortingDto") {
				delete data.sortingDtos;
				if (this.oAppModel.getProperty("/selectedFreeFilter") === tokenDto[i].key) {
					this.oAppModel.setProperty("/selectedFreeFilter", "");
					this.oAppModel.setProperty("/sortingDto", []);
				}
				tokenDto.splice(i, 1);

			} else if (tokenDto[i].type === "advanceSearch" || tokenDto[i].level === "advanceSearch") {
				data.advanceFilter.advanceSearch = "";
				oAdvanceFilterModel.setProperty("/subjectTokenIndex", -1);
				oStandardFilter = oAdvanceFilterModel.getProperty("/aAdvancedFilterNames/" + tokenDto[i].aIndex);
				oStandardFilter.selectedKey = "";
				oStandardFilter.value = "";
				oAdvanceFilterModel.setProperty("/standardFilter/" + tokenDto[i].index, oStandardFilter);
				tokenDto.splice(i, 1);
				this.oAppModel.setProperty("/advFilterTokens", tokenDto);
			} else { //Advanced filter
				//checking if there are multiple tokens at the same level 
				var tokenDtoArr = tokenDto.map(function (tokens) {
					return tokens.level;
				});
				var isDuplicate = tokenDtoArr.some(function (tokens, idx) {
					return tokenDtoArr.indexOf(tokens) != idx;
				});
				oStandardFilter = oAdvanceFilterModel.getProperty("/standardFilter/" + tokenDto[i].sIndex);
				var listOfAdvancedFilters = [],
					selectedFilterNames = [],
					index;
				//changing the values of the filtermap 
				if (isDuplicate) {
					var selectedTokenSplit = selectedToken.split(":");
					var displayValues = data.advanceFilter.filterMap[tokenDto[i].level].displayValue
					var values = data.advanceFilter.filterMap[tokenDto[i].level].value
					try {
						selectedTokenSplit = selectedTokenSplit[1].trim();
						displayValues = displayValues.split(",");
						values = values.split(",")
					} catch (e) {

					}
					for (var j = 0; j < displayValues.length; j++) {
						if (displayValues[j] === selectedTokenSplit) {
							values.splice(j, 1);
							data.advanceFilter.filterMap[tokenDto[i].level].value = values.join(",");
							displayValues.splice(j, 1);
							data.advanceFilter.filterMap[tokenDto[i].level].displayValue = displayValues.join(",");

							oStandardFilter.selectedKey.splice(j, 1);
							oStandardFilter.value = oStandardFilter.value.split(",");
							oStandardFilter.value.splice(j, 1);
							oStandardFilter.value = oStandardFilter.value.join();

							oStandardFilter.displayValue = oStandardFilter.displayValue.split(",");
							oStandardFilter.displayValue.splice(j, 1);
							oStandardFilter.displayValue = oStandardFilter.displayValue.join();

							if (tokenDto[i].advFilterType === "ADVANCED") {
								listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
								var index = oAdvanceFilterModel.getProperty("/selectedFilterNames").indexOf(tokenDto[i].key);
								listOfAdvancedFilters[index].advancedFilter[3] = oStandardFilter;
							}
						}
					}

				} else {
					//deleting the whole level
					delete(data.advanceFilter.filterMap[tokenDto[i].level]);
					if (tokenDto[i].advFilterType === "ADVANCED") {
						listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
						selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
						index = selectedFilterNames.indexOf(tokenDto[i].key);
						if (index !== -1) {
							selectedFilterNames.splice(index, 1);
							listOfAdvancedFilters.splice(index, 1);
							var queryList = oAdvanceFilterModel.getProperty("/queryList");
							queryList.splice(i, 1);
							oAdvanceFilterModel.setProperty("/queryText", queryList.join(" "));
						}
						if (listOfAdvancedFilters.length === 0) {
							this.clearAdvFilterData();
						}
					}
				}
				// Clearing value in oStandardfilter
				if (tokenDto[i].sIndex && tokenDto[i].aIndex) {
					if (!isDuplicate || tokenDto[i].key === "SUBJECT") {
						oStandardFilter.value = "";
						oStandardFilter.selectedKey = "";
						oStandardFilter.upperLimit = "";
						oStandardFilter.lowerLimit = "";
						if (oStandardFilter.datatype === "MULTICOMBOBOX") {
							oStandardFilter.selectedKey = [];
						}
						if (tokenDto[i].key === "SUBJECT") {
							data.advanceFilter.advanceSearch = "";
							oAdvanceFilterModel.setProperty("/subjectTokenIndex", -1);
						}
					}
					oAdvanceFilterModel.setProperty("/aAdvancedFilterNames/" + tokenDto[i].aIndex, oStandardFilter);
					oAdvanceFilterModel.setProperty("/standardFilter/" + tokenDto[i].sIndex, oStandardFilter)
				}

				if (tokenDto[i].filterType === "MULTICOMBOBOX") {
					if (tokenDto[i].key === "NAME") {
						// remove custom attribute tokens
						for (var x = 0; x < tokenDto.length; x++) {
							if (x !== i && tokenDto[x].type === "advanceFilter") {
								var tokenType = oAdvanceFilterModel.getProperty("/aAdvancedFilterNames/" + tokenDto[x].aIndex + "/type");
								if (tokenType === "custom") {
									delete(data.advanceFilter.filterMap[tokenDto[x].level]);
									tokenDto.splice(x, 1);
									x--;
									if (x < i) {
										i--;
									}
								}
							}
						}
						if (oStandardFilter.selectedKey.length === 0) {
							// remove process name and custom attributes
							this.removeSelProcess(true, true);
						} else if (oStandardFilter.selectedKey.length === 1) {
							//  Load custom attributes if 1 process is selected
							this.getCustomAttributes(oStandardFilter.selectedKey[0]);
						} else {
							//  Remove custom attributes if more than 1 process is selected
							this.removeSelProcess(false, true);
						}

					}
				}
				tokenDto.splice(i, 1);
				this.oAppModel.setProperty("/advFilterTokens", tokenDto);
				if (Object.keys(data.advanceFilter.filterMap).length === 0 && data.advanceFilter.advanceSearch === "") {
					this.oAppModel.setProperty("/isAppliedAdvancedFilter", false);
				}
			}
			oAppModel.setProperty("/filterData", data);
			oAppModel.setProperty("/filterTokens", tokenDto);
			if (!tokenDto.length) {
				if (this.oAppModel.getProperty("/graphClicked") && (this.oAppModel.getProperty("/currentViewPage") === "CompletedTasks")) {
					this.setCurrentPage(null, "AdminInbox", "Admin Tasks", true, true);
				}
				oAppModel.setProperty("/graphClicked", false);
				oAppModel.setProperty("/isAppliedAdvancedFilter", false);
			}
			oAppModel.setProperty("/currentPage", "1");
			oAdvanceFilterModel.refresh(true);
			oAppModel.refresh(true);
			sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().onClickFilterDetail();
		},
		// on change of global search set equals in advanced filter
		onChangeGlobalSearch: function (oEvent) {
			var value = oEvent.getParameter("value").replace(/^\s+/g, "");
			if (this.oAppModel.getProperty("/currentViewPage") !== 'chat') {
				var oSubjectFilter = this.getModel("oAdvanceFilterModel").getProperty(this.getModel("oAdvanceFilterModel").getProperty(
					"/subjectIndex"));
				var dropDown = "";
				if (value !== "") {
					dropDown = oSubjectFilter.dropdownList[0].value;
				}
				oSubjectFilter.selectedKey = dropDown;
				oSubjectFilter.value = value.replace(/^\s+/g, "");
				this.getModel("oAdvanceFilterModel").setProperty("/standardFilter/" + oSubjectFilter.index, oSubjectFilter);
				this.getModel("oAdvanceFilterModel").setProperty("/aAdvancedFilterNames/" + oSubjectFilter.aIndex, oSubjectFilter);
				this.getModel("oAdvanceFilterModel").refresh(true);
			} else {
				// live change for chat code
				/******************Collaboration Changes - By Karishma *******************/
				var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
				this.getView().setModel(oCollaborationModel, "oCollaborationModel");
				var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
				// var oSearchbar = this.getView().byId("ID_GLOBAL_SEARCH");
				var sGlobalTerm = oEvent.getParameter("value");
				if (sGlobalTerm) {
					this.chatGlobalSearch(sGlobalTerm, "liveSearch");
					oCollaborationModel.setProperty("/iTotalPageCount", 0);
				}
				/******************Collaboration Changes End - By Karishma *******************/
			}
		},

		// Dynamic UI creation from meta data- Layout of fragment
		generateSearchFilters: function () {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var filterList = sap.ui.getCore().byId("ID_BASIC_FILTER_CONTAINER");

			var parentRef = this;
			filterList.bindAggregation("items", "oAdvanceFilterModel>/standardFilter",
				function (index, context) {
					var bindingObject = context.getObject();
					var contextPath = context.getPath();
					var HBox = parentRef.aggregateBasicFilters(contextPath, bindingObject);
					return HBox;
				});

			var advancedFiltersContent = sap.ui.getCore().byId("ID_ADV_FILTER_CONTAINER");
			var advancedFilterHeader = new sap.m.HBox({
				renderType: "Bare",
				justifyContent: "SpaceBetween"
			});
			advancedFilterHeader.bindAggregation("items", "oAdvanceFilterModel>/headers",
				function (index, context) {

					var bindingObject = context.getObject();
					var HBox;
					if (bindingObject.filterType === "DELETEICON") {
						HBox = new sap.m.HBox({
							width: bindingObject.headerWidth
						});
					} else {
						HBox = new sap.m.HBox({
							renderType: "Bare",
							justifyContent: "Start",
							width: bindingObject.headerWidth
						}).addItem(new sap.m.Text({
							text: bindingObject.label
						}).addStyleClass("wbAdvSearchFragmentAdvancedFilterLabels "));
					}

					return HBox;

				});
			advancedFiltersContent.addItem(advancedFilterHeader);
			var advancedFilterColumns = new sap.m.VBox({
				renderType: "Bare",
				justifyContent: "Start"
			});
			var parentRef = this;
			advancedFilterColumns.bindAggregation("items", "oAdvanceFilterModel>/listOfAdvancedFilters", function (
				rowIndex, rowContext) {
				var rowData = new sap.m.HBox({
					renderType: "Bare",
					justifyContent: "Start"
				});
				var sPath = "oAdvanceFilterModel>" + rowContext.getPath();
				rowData.bindAggregation("items", sPath + "/advancedFilter", function (colIndex, colContext) {
					var contextPath = colContext.getPath();
					var contextData = colContext.getObject();
					var columnData = parentRef.aggregateAdvancedFilters("" + contextPath, contextData);
					return columnData;
				});
				return rowData;

			});
			advancedFiltersContent.addItem(advancedFilterColumns);
		},
		// Dynamic UI creation from meta data------ Basic Filters- Aggregate UI components to the layout
		aggregateBasicFilters: function (path, bindingObject) {
			var that = this;
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var HBox;
			var contextPath = "oAdvanceFilterModel>" + path;
			if (bindingObject.filterType === "INPUT") {
				HBox = this.addInput(bindingObject, contextPath, "78%", "BASIC");
			} else if (bindingObject.filterType === "COMBOBOX") {
				HBox = this.addComboBox(bindingObject, contextPath, "78%", "BASIC");
			} else if (bindingObject.filterType === "MULTICOMBOBOX") {
				HBox = this.addMultiComboBox(bindingObject, contextPath, "78%", "BASIC");
			} else if (bindingObject.filterType === "DATEFILTER") {
				HBox = this.addDateFilter(bindingObject, contextPath, "78%", "BASIC");
			} else if (bindingObject.filterType === "COMBOINPUT") {
				HBox = this.addComboInput(bindingObject, contextPath, "78%", "BASIC");
			} else if (bindingObject.filterType === "CHECKBOX") {
				HBox = new sap.m.HBox({
					renderType: "Bare",
				});
				HBox.bindAggregation("items", contextPath + "/dropdownList",
					function (index, context) {
						return this.addCheckBox(context.getObject(), context.getPath(), "BASIC", false);
					}.bind(this));

			} else {
				HBox = this.addInput(bindingObject, contextPath, "78%", "BASIC");
			}
			return HBox;

		},
		// Dynamic UI creation from meta data------- Advanced Filters- Aggregate UI components to the layout
		aggregateAdvancedFilters: function (path, bindingObject) {
			var HBox, enabled = true;
			var that = this;
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var contextPath = "oAdvanceFilterModel>" + path;
			if (bindingObject.filterType === "OPERATORCOMBOBOX") {
				if (bindingObject.key === "operator" && path === "/listOfAdvancedFilters/0/advancedFilter/0") {
					enabled = false;
					oAdvanceFilterModel.setProperty("/listOfAdvancedFilters/0/advancedFilter/0/value", "AND");
				}
				HBox = new sap.m.HBox({
					renderType: "Bare",
					width: bindingObject.colWidth,
					justifyContent: "Start"
				}).addStyleClass("sapUiTinyMarginEnd");

				var conditionCombo = new sap.m.Select({
						textAlign: "Left",
						change: function (oEvent) {
							var key = oEvent.getSource().getCustomData()[0].getKey();
							if (key === "condition") {
								var rowIndex;
								rowIndex = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getPath().split("/")[2];
								that.setOperatorAdvFilter(rowIndex);
								that.checkRowComplete(rowIndex);

							} else if (key === "operator") {
								rowIndex = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getPath().split("/")[2];
								that.checkRowComplete(rowIndex);
							}
						},
						items: {
							path: contextPath + "/dropdownList",
							template: new sap.ui.core.Item({
								key: "{oAdvanceFilterModel>columnName}",
								text: "{oAdvanceFilterModel>label}"
							})
						},
						selectedKey: "{" + contextPath + "/value}"
					}).addStyleClass("wbAdvSearchFragmentSelect")
					.addCustomData(new sap.ui.core.CustomData({
						key: bindingObject.key,
						// value: bindingObject.filterType
					}));
				if (enabled) {
					HBox.addItem(conditionCombo);
				}
			} else if (bindingObject.filterType === "FILTERCOMBOBOX") {
				HBox = new sap.m.HBox({
					renderType: "Bare",
					width: bindingObject.colWidth,
					justifyContent: "Start"
				}).addStyleClass("sapUiTinyMarginEnd");

				var conditionCombo = new sap.m.ComboBox({
						textAlign: "Left",
						placeholder: "{i18n>PLACEHOLDER_SELECT_TEXT} " + bindingObject.label,
						selectionChange: function (oEvent) {
							var key = oEvent.getSource().getCustomData()[0].getKey();
							if (key === "filterName") {
								that.setSelectedFiltersSearchFilter(oEvent);
							}
						},
						items: {
							path: contextPath + "/dropdownList",
							template: new sap.ui.core.Item({
								key: "{oAdvanceFilterModel>columnName}",
								text: "{oAdvanceFilterModel>label}"
							})
						},
						visible: "{path: '" + contextPath +
							"/label',formatter: 'oneapp.incture.workbox.util.formatter.wbSetReadOnlyCB'}",
						selectedKey: "{" + contextPath + "/value}"
					}).addStyleClass("wbAdvSearchFragmentInput")
					.addCustomData(new sap.ui.core.CustomData({
						key: bindingObject.key,
					}));

				HBox.addItem(conditionCombo);

			} else if (bindingObject.filterType === "DELETEICON") {
				HBox = new sap.m.HBox({
						renderType: "Bare",
						width: "5.5%",
						justifyContent: "SpaceBetween"
					})
					.addItem(new sap.m.Button({
						visible: true,
						icon: "sap-icon://decline",
						tooltip: "Discard Filter",
						press: function (oEvent) {
							that.deleteRowSearchFilter(oEvent);
						}.bind(this)
					}).addStyleClass("wbAdvSearchFragmentDiscardFilterIcon wbCustomButtonClass"));

			} else if (bindingObject.filterType === "INPUT") {
				HBox = this.addInput(bindingObject, contextPath, "100%", "ADVANCED");
			} else if (bindingObject.filterType === "COMBOBOX") {
				HBox = this.addComboBox(bindingObject, contextPath, "100%", "ADVANCED");
			} else
			if (bindingObject.filterType === "MULTICOMBOBOX") {
				HBox = this.addMultiComboBox(bindingObject, contextPath, "100%", "ADVANCED");
			} else if (bindingObject.filterType === "DATEFILTER") {
				HBox = this.addDateFilter(bindingObject, contextPath, "100%", "ADVANCED");
			} else if (bindingObject.filterType === "COMBOINPUT") {
				HBox = this.addComboInput(bindingObject, contextPath, "100%", "ADVANCED");
			} else if (bindingObject.filterType === "CHECKBOX") {
				HBox = this.addCheckBox(bindingObject, contextPath, "ADVANCED", true);
			} else {
				HBox = new sap.m.HBox({
						renderType: "Bare",
						justifyContent: "SpaceBetween"
					})
					.addItem(new sap.m.Input({
						width: "65%",
						value: "{" + contextPath + "/value}"
					})).addStyleClass("wbAdvSearchFragmentInput");
			}
			return HBox;
		},
		setOperatorAdvFilter: function (rowIndex) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			// If the filter applied is Process Name
			if (oAdvanceFilterModel.getProperty("/listOfAdvancedFilters/" + rowIndex + "/advancedFilter/1/value") === "NAME") {
				// If operator === AND NOT
				if (oAdvanceFilterModel.getProperty("/listOfAdvancedFilters/" + rowIndex + "/advancedFilter/2/value") === "NOT") {
					//  Remove custom attributes if more than 1 process is selected
					this.removeSelProcess(true, true);
				} else {
					// If process is selected and after that operator is set to !== NOT set custom attributes again
					var oStandardFilter = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters/" + rowIndex + "/advancedFilter/3");
					if (oStandardFilter.selectedKey.length === 1) {
						var oStandardFilterPN = oAdvanceFilterModel.getProperty(oAdvanceFilterModel.getProperty("/processNameIndex"));
						oStandardFilterPN.value = "'" + oStandardFilter.selectedKey[0] + "'";
						oStandardFilterPN.selectedKey = [oStandardFilter.selectedKey[0]];
						oAdvanceFilterModel.setProperty("/standardFilter/" + oStandardFilterPN.index, oStandardFilterPN);
						oAdvanceFilterModel.setProperty("/aAdvancedFilterNames/" + oStandardFilterPN.aIndex, oStandardFilterPN);
						this.getCustomAttributes(oStandardFilter.selectedKey[0]);
					} else if (oStandardFilter.selectedKey.length > 1) {
						this.getCustomAttributes("");
					}
				}
			}

		},
		addCheckBox: function (bindingObject, contextPath, filterType, isAssmble) {
			var that = this;
			var checkbox = new sap.m.CheckBox({
				text: bindingObject.label,
				tooltip: bindingObject.label,
				selected: "{= ${oAdvanceFilterModel>" + contextPath + "/value}=== '' ? false: true }",
				select: function (oEvent) {
					var bSelection = oEvent.getParameter("selected");
					if (!bSelection) {
						bSelection = "";
					}
					var path = oEvent.getSource()._getBindingContext("oAdvanceFilterModel").getPath();
					that.getModel("oAdvanceFilterModel").setProperty(path + "/value", bSelection);
					that.checkRowComplete(path.split("/")[2]);

				}
			}).addStyleClass("wbAdvSearchFilterCheckBox");
			if (filterType === "BASIC") {
				return checkbox;
			} else {
				checkbox.removeStyleClass("wbAdvSearchFilterCheckBox");
				return this.assemble(filterType, bindingObject.label, checkbox);
			}
		},
		addComboBox: function (bindingObject, contextPath, width, filterType) {
			var that = this;
			var comboBox = new sap.m.ComboBox({
					width: width,
					textAlign: "Left",
					enabled: bindingObject.enabled,
					placeholder: "{i18n>PLACEHOLDER_SELECT_TEXT} " + bindingObject.label,
					items: {
						path: contextPath + "/dropdownList",
						template: new sap.ui.core.Item({
							text: "{oAdvanceFilterModel>key}",
							key: "{oAdvanceFilterModel>value}",
						})
					},
					selectionChange: function (oEvent) {
						if (!that.getModel("oAdvanceFilterModel").getProperty("/showAdvancedFilter")) {
							var rowIndex = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getPath().split("/")[2];
							that.checkRowComplete(rowIndex);
						}
					},
					visible: "{path: '" + contextPath +
						"/label',formatter: 'oneapp.incture.workbox.util.formatter.wbSetReadOnlyCB'}",
					selectedKey: "{" + contextPath + "/value}"
				}).addStyleClass("wbAdvSearchFragmentInput")
				.addCustomData(new sap.ui.core.CustomData({
					key: bindingObject.label
				}));

			return this.assemble(filterType, bindingObject.label, comboBox);
		},
		addMultiComboBox: function (bindingObject, contextPath, width, filterType) {
			var that = this;
			if (bindingObject.columnName === "STATUS") {
				var templateList = this.getModel("oAdvanceFilterModel").getProperty("/aAdvancedFilterNames/" + bindingObject.aIndex +
					"/dropdownList");
				var list = [];

				for (var i = 0; i < templateList.length; i++) {
					// For Completed Inbox 
					if (this.getModel("oAdvanceFilterModel").getProperty("/searchInboxType") === "CompletedTasks" || this.getModel(
							"oAdvanceFilterModel").getProperty("/searchInboxType") === "RequestorCompletedTasks") {
						if (templateList[i].value !== "READY" && templateList[i].value !== "RESERVED") {
							list.push(templateList[i]);
						}
					} else if (this.getModel("oAdvanceFilterModel").getProperty("/searchInboxType") === "CreatedTasks") {
						if (templateList[i].value === "READY" || templateList[i].value === "RESERVED" || templateList[i].value === "RESOLVED") {
							list.push(templateList[i]);
						}
					}
					// For rest of the inboxes
					else {
						if (templateList[i].value === "READY" || templateList[i].value === "RESERVED") {
							list.push(templateList[i]);
						}
					}
				}
				bindingObject.dropdownList = list;
			}
			if (bindingObject.columnName === "COMP_DEADLINE" && this.getModel("oAdvanceFilterModel").getProperty("/searchInboxType") ===
				"CompletedTasks") {
				var templateList = this.getModel("oAdvanceFilterModel").getProperty("/aAdvancedFilterNames/" + bindingObject.aIndex +
					"/dropdownList");
				var list = [];

				for (var i = 0; i < templateList.length; i++) {
					// For Completed Inbox 
					if (templateList[i].value !== "critical" && templateList[i].value !== "crtical") {
						list.push(templateList[i]);
					}
				}
				bindingObject.dropdownList = list;
			}

			var template = new sap.ui.core.Item({
				text: "{oAdvanceFilterModel>key}",
				key: "{oAdvanceFilterModel>value}"
			});
			var sPath = contextPath + "/dropdownList";
			if (bindingObject.autoCompleteType === "default") {
				template = new sap.ui.core.Item({
					text: "{oConstantsModel>processDisplayName}",
					key: "{oConstantsModel>processName}"
				});
				sPath = "oConstantsModel>/processNamesList";
			};
			var multiComboBox = new sap.m.MultiComboBox({
					width: width,
					textAlign: "Left",
					enabled: bindingObject.enabled,
					showButton: bindingObject.enabled,
					placeholder: "{i18n>PLACEHOLDER_SELECT_TEXT} " + bindingObject.label,
					items: {
						path: sPath,
						template: template
					},
					selectionFinish: function (oEvent) {
						that.onChangeMultiCombo(oEvent);
					},
					selectionChange: function (oEvent) {
						if (oEvent.getParameter("selected") === false && oEvent.getSource().getSelectedItems().length <= 1) {
							that.onChangeMultiCombo(oEvent);
						}
					},
					selectedKeys: bindingObject.selectedKey
				}).addStyleClass("wbAdvSearchFragmentInput")
				.addCustomData(new sap.ui.core.CustomData({
					key: bindingObject.columnName
				}));
			return this.assemble(filterType, bindingObject.label, multiComboBox);
		},
		onChangeMultiCombo: function (oEvent) {
			var filterType = oEvent.getSource().getCustomData()[0].getKey();
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var contextObject = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getObject();
			var prevSelectedKey = contextObject.selectedKey;
			var selectedKey = oEvent.getSource().getSelectedKeys();
			if (prevSelectedKey.length === 1 && prevSelectedKey.length === selectedKey.length && selectedKey[0] === prevSelectedKey[0]) {
				return;
			}
			contextObject.selectedKey = selectedKey;
			var items = oEvent.getSource().getSelectedItems();
			// If no keys are selected
			if (items.length === 0) {
				contextObject.value = "";
				contextObject.displayValue = "";
			} else {
				// If selected keys is >0
				for (var i = 0; i < items.length; i++) {
					// if they selected key at index i is "" ,remove that key  else add value
					if (items[0].getKey() !== "") {
						if (i === 0) {
							contextObject.value = "'" + items[0].getKey() + "'";
							contextObject.displayValue = "'" + items[0].getText() + "'";
						} else {
							contextObject.value = contextObject.value + ",'" + items[i].getKey() + "'";
							contextObject.displayValue = contextObject.displayValue + ",'" + items[i].getText() + "'";
						}
					} else {
						contextObject.selectedKey.splice(i, 1);
					}
				}
			}
			// If process name is selected 
			if (filterType === "NAME") {
				// Set process name for basic filter if a process is selected from adv filter
				if (!oAdvanceFilterModel.getProperty("/showAdvancedFilter")) {
					oAdvanceFilterModel.setProperty("/standardFilter/" + contextObject.index, contextObject);
					oAdvanceFilterModel.setProperty("/aAdvancedFilterNames/" + contextObject.aIndex, contextObject);

				} else {

					var listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
					var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
					if (selectedFilterNames.length > 0 && selectedFilterNames.indexOf("NAME") !== -1) {
						var p = selectedFilterNames.indexOf("NAME");
						listOfAdvancedFilters.splice(p, 1);
						selectedFilterNames.splice(p, 1);
						var queryList = oAdvanceFilterModel.getProperty("/queryList");
						queryList.splice(i, 1);
						oAdvanceFilterModel.setProperty("/queryText", queryList.join(" "));

						if (listOfAdvancedFilters.length === 0) {
							this.clearAdvFilterData();
						}

					}

				}

				// Fetch custom attributes if 1 process is selected
				if (items.length === 1) {
					if (!oAdvanceFilterModel.getProperty("/showAdvancedFilter")) {
						// if operator is NOT selected
						var iListAdvFilter = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getPath().split("/")[2];
						if (oAdvanceFilterModel.getProperty("/listOfAdvancedFilters/" + iListAdvFilter + "/advancedFilter/0/value") + " " +
							oAdvanceFilterModel.getProperty("/listOfAdvancedFilters/" + iListAdvFilter + "/advancedFilter/2/value") === "AND NOT") {
							//  Remove custom attributes if more than 1 process is selected
							this.removeSelProcess(false, true);
						} else {

							this.getCustomAttributes(items[0].getKey());
						}
					} else {
						this.getCustomAttributes(items[0].getKey());
					}
				} else {
					//  Remove custom attributes if more than 1 process is selected
					this.removeSelProcess(false, true);
				}
			}

			if (!this.getModel("oAdvanceFilterModel").getProperty("/showAdvancedFilter")) {
				var rowIndex = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getPath().split("/")[2];
				this.checkRowComplete(rowIndex);

			}
		},
		addDateFilter: function (bindingObject, contextPath, width, filterType) {
			var that = this;
			var comboBox = new sap.m.ComboBox({
				width: "36%",
				textAlign: "Left",
				placeholder: "{i18n>PLACEHOLDER_SELECT_TEXT} " + bindingObject.label,
				selectedKey: "{" + contextPath + "/selectedKey}",
				items: {
					path: contextPath + "/dropdownList",
					template: new sap.ui.core.Item({
						text: "{oAdvanceFilterModel>key}",
						key: "{oAdvanceFilterModel>value}",
					})
				},
				selectionChange: function (oEvent) {
					var path = oEvent.getSource().getParent()._getBindingContext("oAdvanceFilterModel").getPath();
					that.setDateValueInFilter(path);
					if (!that.getModel("oAdvanceFilterModel").getProperty("/showAdvancedFilter")) {
						that.checkRowComplete(path.split("/")[2]);
					}

				},
				visible: "{path: '" + contextPath +
					"/label',formatter: 'oneapp.incture.workbox.util.formatter.wbSetReadOnlyCB'}"

			}).addStyleClass("wbAdvSearchFragmentInput");
			var datePicker = new ExtDatePicker({
				visible: "{= ${" + contextPath +
					"/selectedKey}=== 'Today' || ${" + contextPath +
					"/selectedKey} === 'Yesterday' || ${" + contextPath + "/selectedKey} === ''}",
				width: "62%",
				displayFormat: "dd MMM yyyy",
				valueFormat: "dd MMM yyyy",
				value: "{" + contextPath + "/value}",
				enabled: "{= ${" + contextPath + "/selectedKey}=== 'DateRange'}"
			}).addStyleClass("wbAdvSearchFragmentInput");
			var dateRange = new ExtDateRangeSelection({
				visible: "{=${" + contextPath +
					"/selectedKey}=== 'Last Month' || ${" + contextPath +
					"/selectedKey} === 'This Month' || ${" + contextPath + "/selectedKey} === 'Last Week' || ${" + contextPath +
					"/selectedKey} === 'DateRange'}",
				width: "60%",
				displayFormat: "dd MMM yyyy",
				valueFormat: "dd MMM yyyy",
				dateValue: "{path: '" + contextPath +
					"/lowerLimit',type:'sap.ui.model.type.Object' ,formatter: 'oneapp.incture.workbox.util.formatter.wbReturnDatePickerDateObj'}",
				secondDateValue: "{path: '" + contextPath +
					"/upperLimit',type:'sap.ui.model.type.Object' ,formatter: 'oneapp.incture.workbox.util.formatter.wbReturnDatePickerDateObj'}",
				enabled: "{= ${" + contextPath + "/selectedKey}=== 'DateRange'}",
				change: function (oEvent) {
					var oContext = oEvent.getSource().getParent()._getBindingContext("oAdvanceFilterModel").getObject();
					oContext.lowerLimit = that.formatter.wbDateFormatter(new Date(oEvent.getParameter("from")));
					oContext.upperLimit = that.formatter.wbDateFormatter(new Date(oEvent.getParameter("to")));

					if (!that.getModel("oAdvanceFilterModel").getProperty("/showAdvancedFilter")) {
						var rowIndex = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getPath().split("/")[2];
						that.checkRowComplete(rowIndex);
					}
					that.getModel("oAdvanceFilterModel").refresh(true);
				}
			}).addStyleClass("wbAdvSearchFragmentInput");
			var HBox = new sap.m.HBox({
				renderType: "Bare",
				justifyContent: "SpaceBetween",
				width: width
			}).addItem(comboBox).addItem(datePicker).addItem(dateRange);
			return this.assemble(filterType, bindingObject.label, HBox);
		},
		addComboInput: function (bindingObject, contextPath, width, filterType) {
			var that = this;
			var comboBox = new sap.m.ComboBox({
				width: "36%",
				textAlign: "Left",
				enabled: bindingObject.enabled,
				placeholder: "{i18n>PLACEHOLDER_SELECT_TEXT} " + bindingObject.label,
				items: {
					path: contextPath + "/dropdownList",
					template: new sap.ui.core.Item({
						text: "{oAdvanceFilterModel>key}",
						key: "{oAdvanceFilterModel>value}"
					})
				},
				selectionChange: function (oEvent) {
					if (!that.getModel("oAdvanceFilterModel").getProperty("/showAdvancedFilter")) {
						var rowIndex = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getPath().split("/")[2];
						that.checkRowComplete(rowIndex);
					}
				},
				selectedKey: "{" + contextPath + "/selectedKey}",
				visible: "{path: '" + contextPath +
					"/label',formatter: 'oneapp.incture.workbox.util.formatter.wbSetReadOnlyCB'}"
			}).addStyleClass("wbAdvSearchFragmentInput");
			var input = new sap.m.Input({
				width: "62%",
				enabled: bindingObject.enabled,
				value: "{oAdvanceFilterModel>value}",
			}).addStyleClass("wbAdvSearchFragmentInput");
			var HBox = new sap.m.HBox({
				renderType: "Bare",
				justifyContent: "SpaceBetween",
				width: width
			}).addItem(comboBox).addItem(input);
			this.preventBeginSpaceInput(input);
			return this.assemble(filterType, bindingObject.label, HBox);
		},
		addInput: function (bindingObject, contextPath, width, filterType) {
			var that = this;
			var input;
			if (bindingObject.autoCompleteType === "default") {
				input = new sap.m.Input({
					width: width,
					enabled: bindingObject.enabled,
					placeholder: "{i18n>PLACEHOLDER_SELECT_TEXT} " + bindingObject.label,
					suggestionItems: {
						path: "oConstantsModel>/allUsers",
						template: new sap.ui.core.Item({
							text: "{oConstantsModel>userFirstName} {oConstantsModel>userLastName}",
							key: "{oConstantsModel>userId}",
						})
					},
					selectedKey: "{" + contextPath + "/value}",
					startSuggestion: 2,
					filterSuggests: true,
					showSuggestion: true,
					autocomplete: false,
					// valueState: "{= ${" + contextPath + "/value}==='' ? 'Error' : 'None'}",
					// valueStateText: 'Invalid Entry'
				}).addStyleClass("wbAdvSearchFragmentInput");
				this.preventBeginSpaceInput(input, "default");
			} else if (bindingObject.autoCompleteType === "custom") {
				input = new sap.m.Input({
					width: width,
					enabled: bindingObject.enabled,
					value: "{oAdvanceFilterModel>value}",
					suggest: function (oEvent) {
						that.suggestAutoComplete(oEvent);
					},
					startSuggestion: 2,
					showSuggestion: true,
					autocomplete: false,
				}).addStyleClass("wbAdvSearchFragmentInput");
				this.preventBeginSpaceInput(input);
			} else {
				input = new sap.m.Input({
					enabled: bindingObject.enabled,
					width: width,
					value: "{" + contextPath + "/value}",
				}).addStyleClass("wbAdvSearchFragmentInput");
				this.preventBeginSpaceInput(input);
			}

			return this.assemble(filterType, bindingObject.label, input);
		},
		preventBeginSpaceInput: function (oControl, type) {
			oControl.addEventDelegate({
					"onAfterRendering": function (oEvent) {
						// Adding key down
						oEvent.srcControl.getDomRef().addEventListener('keydown', function (event) {
							var id = event.target.parentNode.parentNode.id;
							var control = sap.ui.getCore().byId(id);
							var path = control._getBindingContext("oAdvanceFilterModel");
							var value = control.getValue().replace(/^\s+/g, "");
							if (type === "default") {
								control.setValue(value);
							} else {
								if (path) {
									var oContext = path.getObject();
									oContext.value = value;
									this.getModel("oAdvanceFilterModel").setProperty(path.getPath(), oContext);
								}
								control.setValue(value);
							}
							if (!value) {
								control.setValueStateText("Invalid Entry")
							} else {
								control.setValueStateText("")

							}
						}.bind(this));
						// Adding focusout to generate query in adv filter
						oEvent.srcControl.getDomRef().addEventListener('focusout', function (event) {
							var id = event.target.parentNode.parentNode.id;
							var control = sap.ui.getCore().byId(id);
							var path = control._getBindingContext("oAdvanceFilterModel");
							if (!this.getModel("oAdvanceFilterModel").getProperty("/showAdvancedFilter")) {
								this.checkRowComplete(path.getPath().split("/")[2]);
							}
						}.bind(this));
					}.bind(this)
				},
				this);
		},
		suggestAutoComplete: function (oEvent, isSuggest) {
			var oSource = oEvent.getSource();
			var value = oEvent.getParameters().suggestValue;
			value = value.replace(/^\s+|\s+$/gm, "");
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var path = oSource.getBindingContext("oAdvanceFilterModel").getPath();
			var oContext = oAdvanceFilterModel.getProperty(path);
			oAdvanceFilterModel.setProperty("/aAdvancedFilterNames/" + oContext.aIndex, oContext);
			if (value) {
				oContext.value = value;
				oSource.setValue(oContext.value);
				var sUrl = "/oneappinctureworkbox/WorkboxJavaService" + oContext.selectionList + value;
				this.doAjax(sUrl, "GET", null, function (oData) {
					oSource = this;
					oSource.setValue(oContext.value);
					oSource.removeAllSuggestionItems();
					path = oSource.getBindingContext("oAdvanceFilterModel").getPath();
					if (oData.message.status === "SUCCESS") {
						oContext.dropdownList = oData.keyValuePairs;
						oSource.bindAggregation("suggestionItems", {
							path: "oAdvanceFilterModel>" + path + "/dropdownList",
							template: new sap.ui.core.ListItem({
								text: "{oAdvanceFilterModel>value}"
							})
						});
					} else {
						oContext.dropdownList = [];
					}
				}.bind(oSource), function (oError) {}.bind(this));
			}
		},
		assemble: function (filterType, labelName, item) {
			var HBox = new sap.m.HBox({
				renderType: "Bare",
				justifyContent: "SpaceBetween",
				width: "100%"
			}).addStyleClass("wbAdvSearchFragmentHboxPadding");
			var label = new sap.m.Label({
				text: labelName,
				tooltip: labelName,
				width: "19%",
			}).addStyleClass("wbAdvSearchFragmentLabels wbTextBoldClass");
			if (filterType === "BASIC") {
				HBox.addItem(label);
				HBox.addItem(item);
			} else {
				HBox.addItem(item);
				HBox.setWidth("45%");
			}
			return HBox;
		},

		// On select of a Search Filter - saves name of selected filter in selectedFilterNames so that the user does not get the same filter again
		setSelectedFiltersSearchFilter: function (oEvent) {
			var selectedKey = oEvent.getSource().getSelectedKey();
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var sPath, rowIndex;
			var queryList = oAdvanceFilterModel.getProperty("/queryList");
			var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");

			if (selectedKey) {
				sPath = oEvent.getParameter("selectedItem")._getBindingContext("oAdvanceFilterModel").getPath();
				var selectedObject = oAdvanceFilterModel.getProperty(sPath);
				selectedObject = oAdvanceFilterModel.getProperty("/standardFilter/" + selectedObject.index);
				rowIndex = parseInt(sPath.split("/")[2], 10);
				oAdvanceFilterModel.setProperty("/listOfAdvancedFilters/" + rowIndex + "/advancedFilter/3", jQuery.extend(true, {},
					selectedObject));
				// Clear query for that row
				queryList[rowIndex] = "Empty row";
				oAdvanceFilterModel.setProperty("/queryList", queryList);
				oAdvanceFilterModel.setProperty("/queryText", queryList.join(" "));

				// changing selected filter from process Name to something else 
				if (selectedFilterNames[rowIndex] === "NAME" && selectedKey !== "NAME") {
					selectedFilterNames[rowIndex] = selectedKey;
					this.removeSelProcess(true, true);
				}
				// selected filter is process name with  more than 1 process selected
				if (selectedKey === "NAME" && selectedObject.selectedKey.length > 1) {
					selectedFilterNames[rowIndex] = selectedKey;
					this.removeSelProcess(false, true);

				}
				// selected filter is process name with 1 process selected
				else if (selectedKey === "NAME" && selectedObject.selectedKey.length === 1) {
					selectedFilterNames[rowIndex] = selectedKey;
					this.getCustomAttributes(selectedObject.selectedKey[0]);
				} else {
					selectedFilterNames[rowIndex] = selectedKey;
					this.setFilterNameDropdownInFilter();
				}

			} else {
				// Selection change of filter name is triggered from formatter
				// when the combo box is cleared
				sPath = oEvent.getSource()._getBindingContext("oAdvanceFilterModel").getPath();
				rowIndex = parseInt(sPath.split("/")[2], 10);
				var listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
				// Remove row
				var selFilter = selectedFilterNames[rowIndex];

				listOfAdvancedFilters.splice(rowIndex, 1);
				selectedFilterNames.splice(rowIndex, 1);
				queryList.splice(rowIndex, 1);
				oAdvanceFilterModel.setProperty("/queryText", queryList.join(" "));
				if (listOfAdvancedFilters.length === 0) {
					this.clearAdvFilterData();
				} else {
					//If removed row was for process, then remve custom attribute  
					if (selFilter === "NAME") {
						this.removeSelProcess(true, true);
					}
					// Refresh dropdown for the rows
					else {
						this.setFilterNameDropdownInFilter();
					}
				}
			}
			oAdvanceFilterModel.refresh(true);
		},
		// Remove process name selected----removePN
		// Remove custom attributes filters from adv filter ---removeCA
		removeSelProcess: function (removePN, removeCA) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			this.getCustomAttributes("");
			if (removePN) {
				var oStandardFilterPN = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty(oAdvanceFilterModel.getProperty(
					"/processNameIndex")));
				oStandardFilterPN.value = "";
				oStandardFilterPN.selectedKey = [];
				oAdvanceFilterModel.setProperty("/standardFilter/" + oStandardFilterPN.index, oStandardFilterPN);
				oAdvanceFilterModel.setProperty("/aAdvancedFilterNames/" + oStandardFilterPN.aIndex, oStandardFilterPN);
			}
			if (removeCA) {
				var listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
				if (listOfAdvancedFilters.length === 0) {
					this.clearAdvFilterData();
				}
			}
			oAdvanceFilterModel.refresh(true);
		},
		// Dynamically  changing the dropdown values for the filter names, once a filter name is selected, it is removed from other rows dropdown list
		// To remove CA filters or not---- checkCA
		setFilterNameDropdownInFilter: function (checkCA) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var aAdvancedFilterNames = oAdvanceFilterModel.getProperty("/aAdvancedFilterNames");
			var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
			var listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
			for (var i = 0; i < listOfAdvancedFilters.length; i++) {
				//else {
				var filteredObject = listOfAdvancedFilters[i].advancedFilter[1];
				var filterItems = jQuery.extend(true, [], aAdvancedFilterNames);
				var temp = [];
				for (var j = 0; j < filterItems.length; j++) {
					// retain unselected filter names
					if (selectedFilterNames.includes(filterItems[j].columnName) === false) {
						temp.push(filterItems[j]);
					}
					// retain the selected filter name for that row
					if (filterItems[j].columnName === filteredObject.value && filteredObject.value !== "") {
						temp.push(filterItems[j]);
						filterItems[j].operator = listOfAdvancedFilters[i].advancedFilter[0].value;
					}
				}
				filteredObject.dropdownList = temp;
				this.checkRowComplete(i);

				if (checkCA) {
					// remove CA if checkCA is true
					// if item process name is changed in basic filter and process name is there in list of adv filters, remove it
					if (listOfAdvancedFilters[i].advancedFilter[3].type === "custom" || (listOfAdvancedFilters[i].advancedFilter[3].type ===
							"standard" && listOfAdvancedFilters[i].advancedFilter[1].value === "NAME" && oAdvanceFilterModel.getProperty(
								"/showAdvancedFilter"))) {
						var queryList = oAdvanceFilterModel.getProperty("/queryList");
						listOfAdvancedFilters.splice(i, 1);
						selectedFilterNames.splice(i, 1);
						queryList.splice(i, 1);
						oAdvanceFilterModel.setProperty("/queryText", queryList.join(" "));
						i--;
					}

				}
			}
		},
		checkRowComplete: function (rowIndex) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var showAdvancedFilter = oAdvanceFilterModel.getProperty("/showAdvancedFilter");
			if (!showAdvancedFilter) {
				var listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
				if (listOfAdvancedFilters[rowIndex].advancedFilter[0].value && listOfAdvancedFilters[rowIndex].advancedFilter[1].value &&
					listOfAdvancedFilters[rowIndex].advancedFilter[2].value) {
					this.generateQuery(rowIndex, "ADD");
				} else {
					this.generateQuery(rowIndex, "REMOVE");
				}
			} else {
				oAdvanceFilterModel.setProperty("/queryList", []);
				oAdvanceFilterModel.setProperty("/queryText", "");
			}

		},
		generateQuery: function (row, boolean) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
			var queryList = oAdvanceFilterModel.getProperty("/queryList");
			var text = "";
			var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
			var oStandardFilter = listOfAdvancedFilters[row].advancedFilter[3];
			// To add query
			if (boolean === "ADD") {
				var condition = " = ";
				// By default condition is considered EQ, if condition applied is NOT 
				if (listOfAdvancedFilters[row].advancedFilter[2].value === "NOT") {
					condition = " != ";
				}
				// QUERY LANGUAGE
				var value = listOfAdvancedFilters[row].advancedFilter[3].value;

				// Date type
				if (oStandardFilter.filterType === "DATEFILTER") {
					value = oStandardFilter.selectedKey;
					if (oStandardFilter.selectedKey === "DateRange") {
						value = "";
						if (oStandardFilter.lowerLimit && oStandardFilter.upperLimit) {
							value = oStandardFilter.lowerLimit + "-" + oStandardFilter.upperLimit;
							this._oAdvanceFilter.focus();
						}
					}
				}
				if (oStandardFilter.filterType === "COMBOINPUT") {
					condition = condition + " " + oStandardFilter.selectedKey.toUpperCase() + " ";
					if (!oStandardFilter.selectedKey || !oStandardFilter.value) {
						value = "";
					}
				}
				if (value) {
					text = oStandardFilter.label + condition + value;
					if (row > 0) {
						text = listOfAdvancedFilters[row].advancedFilter[0].value + " " + text;
					}
					queryList[row] = text;

					// Enable add row
					if (listOfAdvancedFilters.length >= oAdvanceFilterModel.getProperty("/aAdvancedFilterNames").length) {
						oAdvanceFilterModel.setProperty("/enableAddRow", false);
						this._oAdvanceFilter.focus();
					} else {
						oAdvanceFilterModel.setProperty("/enableAddRow", true);
					}
				} else {
					text = "Empty row";
					queryList[row] = text;
				}
			}
			// To remove query
			else {
				text = "Empty row";
				queryList[row] = text;
				if (listOfAdvancedFilters.length === 1 && (selectedFilterNames.length === 0 || selectedFilterNames[0] === "")) {
					queryList = [];
				}
				oAdvanceFilterModel.setProperty("/enableAddRow", false);
			}
			oAdvanceFilterModel.setProperty("/queryList", queryList);
			oAdvanceFilterModel.setProperty("/queryText", queryList.join(" "));

			if (oStandardFilter && oStandardFilter.filterType !== "INPUT" && oStandardFilter.filterType !== "COMBOINPUT") {
				oAdvanceFilterModel.refresh(true);
			}

		},
		// Show advanced filter or basic filter toggle
		toggleShowAdvancedFilter: function () {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var boolean = oAdvanceFilterModel.getProperty("/showAdvancedFilter");
			var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
			var listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
			oAdvanceFilterModel.setProperty("/busy", true);

			if (boolean) {
				var aAdvancedFilterNames = jQuery.extend(true, [], oAdvanceFilterModel.getProperty("/aAdvancedFilterNames"));
				var templateAdvancedFilters;
				for (var i = aAdvancedFilterNames.length - 1; i >= 0; i--) {
					var bAddFilter = false;
					var oStandardFilter = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty("/standardFilter/" + aAdvancedFilterNames[i].index));
					// Check filled basic Filter
					if (oStandardFilter.value !== "" && (oStandardFilter.filterType === "INPUT" || oStandardFilter.filterType === "CHECKBOX" ||
							oStandardFilter.filterType === "COMBOBOX")) {
						bAddFilter = true;
					} else if (oStandardFilter.filterType === "MULTICOMBOBOX" && oStandardFilter.selectedKey.length > 0) {
						bAddFilter = true;
					} else if (oStandardFilter.filterType === "DATEFILTER" && oStandardFilter.selectedKey !== "" && (oStandardFilter.value !== "" ||
							(oStandardFilter.lowerLimit !== "" && oStandardFilter.upperLimit !== ""))) {
						bAddFilter = true;
					} else if (oStandardFilter.filterType === "COMBOINPUT" && oStandardFilter.value !== "" && oStandardFilter.selectedKey !== "") {
						bAddFilter = true;
					}
					if (bAddFilter) {
						templateAdvancedFilters = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty("/templateAdvancedFilters"));
						templateAdvancedFilters.advancedFilter[0].value = "AND"; //OPERATOR
						templateAdvancedFilters.advancedFilter[2].value = "AND"; //CONDITION
						templateAdvancedFilters.advancedFilter[1].value = oStandardFilter.columnName; //FILTER NAME
						templateAdvancedFilters.advancedFilter[3] = oStandardFilter; //FILTER ATTRIBUTE
						if (!selectedFilterNames.includes(oStandardFilter.columnName)) {
							selectedFilterNames.unshift(oStandardFilter.columnName);
							listOfAdvancedFilters.unshift(templateAdvancedFilters);
						}
					}
				}
				var index = selectedFilterNames.indexOf("");
				if (index !== -1) {
					listOfAdvancedFilters.splice(index, 1);
					selectedFilterNames.splice(index, 1);
					var queryList = oAdvanceFilterModel.getProperty("/queryList");
					queryList.splice(i, 1);
					oAdvanceFilterModel.setProperty("/queryText", queryList.join(" "));
				}
				if (listOfAdvancedFilters.length === 0) {
					this.clearAdvFilterData();
				}
				oAdvanceFilterModel.setProperty("/showAdvancedFilter", !boolean);
				this.setFilterNameDropdownInFilter();
			} else {
				oAdvanceFilterModel.setProperty("/showAdvancedFilter", !boolean);
			}
			oAdvanceFilterModel.setProperty("/busy", false);
			oAdvanceFilterModel.refresh(true);
			this._oAdvanceFilter.focus();
		},
		clearFilterFn: function () {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			if (oAdvanceFilterModel.getProperty("/showAdvancedFilter")) {
				this.clearBasicFilterData();
			} else {
				this.clearAdvFilterData();
				oAdvanceFilterModel.setProperty("/selectedFilterNames", []);
			}

			this.setFilterNameDropdownInFilter(true);
		},
		// Set date value when today/yesterday etc is selected in the date picker
		setDateValueInFilter: function (sPath) {
			var dToday = new Date();
			var filterObject = this.getModel("oAdvanceFilterModel").getProperty(sPath);
			filterObject.value = "";
			filterObject.lowerLimit = "";
			filterObject.upperLimit = "";
			if (filterObject.selectedKey === "Today") {
				filterObject.value = this.formatter.wbDateFormatter(new Date());
			}
			if (filterObject.selectedKey === "Yesterday") {
				filterObject.value = this.formatter.wbDateFormatter(dToday.setDate(dToday.getDate() - 1));
			}
			if (filterObject.selectedKey === "Tomorrow") {
				filterObject.value = this.formatter.wbDateFormatter(dToday.setDate(dToday.getDate() + 1));
			}
			if (filterObject.selectedKey === "Last Week") {
				filterObject.lowerLimit = this.formatter.wbDateFormatter(new Date(new Date().setDate(dToday.getDate() - 8)));
				filterObject.upperLimit = this.formatter.wbDateFormatter(new Date(new Date().setDate(dToday.getDate() - 2)));
			}
			if (filterObject.selectedKey === "Last Month") {
				filterObject.lowerLimit = this.formatter.wbDateFormatter(new Date(dToday.getFullYear(), dToday.getMonth() - 1, 1));
				filterObject.upperLimit = this.formatter.wbDateFormatter(new Date(dToday.getFullYear(), dToday.getMonth(), 0));
			}
			if (filterObject.selectedKey === "This Month") {
				filterObject.lowerLimit = this.formatter.wbDateFormatter(new Date(dToday.getFullYear(), dToday.getMonth(), 1));
				filterObject.upperLimit = this.formatter.wbDateFormatter(new Date(dToday.getFullYear(), dToday.getMonth() + 1, 0));
			}

			this.getModel("oAdvanceFilterModel").refresh();
		},
		setDateRangeAdvFilter: function (dateType, sDate) {
			if (sDate) {
				var date = new Date(sDate);
				var time = "";
				if (dateType === "LOWERLIMIT") {
					time = " 00:00:00";
				} else {
					time = " 23:59:59";
				}
				date = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + time;
			}

			return date;
		},
		// Adding advanced filter row
		addRowSearchFilter: function (oEvent) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var templateAdvancedFilters = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty("/templateAdvancedFilters"));
			// templateAdvancedFilters.advancedFilter[4].isEnabled = true;
			var advancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
			advancedFilters[advancedFilters.length - 1].advancedFilter[4].isEnabled = true;
			advancedFilters.push(templateAdvancedFilters);
			oAdvanceFilterModel.refresh();
			var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
			selectedFilterNames.push("");
			if (advancedFilters.length >= oAdvanceFilterModel.getProperty("/aAdvancedFilterNames").length) {
				oAdvanceFilterModel.setProperty("/enableAddRow", false);
				this._oAdvanceFilter.focus();
			} else {
				oAdvanceFilterModel.setProperty("/enableAddRow", true);
			}
			this.setFilterNameDropdownInFilter();
			oAdvanceFilterModel.refresh();
		},
		// Deleting advanced filter row
		deleteRowSearchFilter: function (oEvent) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var sPath = oEvent.getSource().getParent().getParent()._getBindingContext("oAdvanceFilterModel").getPath();
			var index = sPath.slice("/listOfAdvancedFilters/".length) * 1;
			var advancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
			// If only one row is present
			if (advancedFilters.length === 1) {
				advancedFilters[0].advancedFilter[4].isEnabled = false;
				if (advancedFilters[0].advancedFilter[3].columnName === "NAME") {
					this.removeSelProcess(true, true);
				}
			}
			// If the row isnt the only row 
			if (advancedFilters[advancedFilters.length - 1].advancedFilter[4].isEnabled) {
				var deletedRow = advancedFilters.splice(index, 1);
				if (advancedFilters.length === 1) {
					advancedFilters[advancedFilters.length - 1].advancedFilter[4].isEnabled = false;
				}
				var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
				selectedFilterNames.splice(index, 1);
				var queryList = oAdvanceFilterModel.getProperty("/queryList");
				queryList.splice(index, 1);
				oAdvanceFilterModel.setProperty("/queryText", queryList.join(" "));

				if (advancedFilters.length >= oAdvanceFilterModel.getProperty("/aAdvancedFilterNames").length) {
					oAdvanceFilterModel.setProperty("/enableAddRow", false);
					this._oAdvanceFilter.focus();
				} else {
					oAdvanceFilterModel.setProperty("/enableAddRow", true);
				}

				if (deletedRow[0].advancedFilter[3].columnName === "NAME") {
					this.removeSelProcess(true, true);
				} else {
					this.setFilterNameDropdownInFilter();
				}
			} else {
				this.clearAdvFilterData();
			}

			oAdvanceFilterModel.refresh(true);
			this._oAdvanceFilter.focus();
		},
		//On applying advanced filter
		applyFilter: function (oEvent) {
			if (this.oAppModel.getProperty("/currentViewPage") === 'chat') {
				/***************** Collaboration changes - BY Karishma *********************/
				var value = oEvent.getParameter("value").replace(/^\s+/g, "");
				this.fnResetChatGlobalSearch(value);
				this.chatGlobalSearch(value, "globalSearchClick");
				oEvent.getSource().setValue("");
				/***************** Collaboration changes End- BY Karishma *********************/
			} else {
				var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
				var advFilterTokens = jQuery.extend(true, [], this.oAppModel.getProperty("/advFilterTokens"));
				var response = {},
					flag = false;
				//subject
				if (this._oAdvanceFilter === undefined || !this._oAdvanceFilter.isOpen()) {
					var oStandardFilter = oAdvanceFilterModel.getProperty(oAdvanceFilterModel.getProperty("/subjectIndex"));

					response.requestPayload = {};
					response.requestPayload.advanceSearch = oStandardFilter.value;
					response.requestPayload.filterMap = {};

					// while reapplying subject token remove previously applied subject token
					if (oAdvanceFilterModel.getProperty("/subjectTokenIndex") !== -1) {
						advFilterTokens.splice(oAdvanceFilterModel.getProperty("/subjectTokenIndex") - 1, 1);
						this.oAppModel.setProperty("/advFilterTokens", advFilterTokens);
					}
					if (oStandardFilter.value !== "") {
						this.oAppModel.setProperty("/isAppliedAdvancedFilter", false);
						this.oAppModel.setProperty("/advFilterTokens", []);
						this.oAppModel.setProperty("/removeFilterToken", false);
						this.oAppModel.setProperty("/filterTokens", []);
						this.oAppModel.setProperty("/filterData", {});
						oAdvanceFilterModel.setProperty("/subjectTokenIndex", this.oAppModel.getProperty("/advFilterTokens").length);
						this.generateTokens(oStandardFilter, "advanceSearch", null);
						flag = true;
					}
				} else { //Apply advanced filter
					response = this.validateAdvFilter();
					flag = response.flag;
					if (!flag) {
						this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("DETAILS_MISSING_TEXT"));
					} else if (response.requestPayload.advanceSearch === "" && Object.keys(response.requestPayload.filterMap).length === 0) {
						flag = true;
						this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("NO_FILTER_APPLIED_TEXT"));
						oAdvanceFilterModel.setProperty("/subjectTokenIndex", -1);
						this._oAdvanceFilter.close();
					}
				}
				if (flag) {
					this.applyAdvancedFilter(response.requestPayload);
				}
			}

		},
		// Common function to call onClickFilterDetail when ever a filter is applied, accepts requestPayload object
		applyAdvancedFilter: function (requestPayload) {
			var oAppModel = this.oAppModel;
			var advanceFilter = {
				"advanceSearch": requestPayload.advanceSearch,
				"filterMap": requestPayload.filterMap,
			};
			oAppModel.setProperty("/advanceFilterDetail", advanceFilter);
			oAppModel.setProperty("/isAppliedAdvancedFilter", true);
			oAppModel.setProperty("/currentPage", "1");
			if (this._oAdvanceFilter && this._oAdvanceFilter.isOpen()) {
				this._oAdvanceFilter.close();
			}

			if (this.getModel("oAdvanceFilterModel").getProperty("/customTileClicked")) {
				this._doNavigate("UnifiedInbox", {});

			} else {
				oAppModel.setProperty("/graphClicked", false);
				if (this.oAppModel.getProperty("/graphClicked") && (this.oAppModel.getProperty("/currentViewPage") === "CompletedTasks")) {
					this.setCurrentPage(null, "AdminInbox", "Admin Tasks", true, true);
				}
				if (oAppModel.getProperty("/currentView") !== "unifiedInbox") {
					if (oAppModel.getProperty("/currentView") !== "processFlow" &&
						oAppModel.getProperty("/currentView") !== "taskDetailPage") {
						this.setCurrentPage("MyInbox", "MyInbox", "My Task", true, true);
					}

					this._doNavigate("UnifiedInbox", {});
				} else {
					sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().onClickFilterDetail();
					if (oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
						sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().getTaskBoardData();
					}
				}
			}

		},
		// Validation and payload creation for advanced filter
		validateAdvFilter: function () {
			// Tokens generation
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var tokens = this.oAppModel.getProperty("/advFilterTokens");
			if (!tokens || !!tokens.length) {
				tokens = [];
			}
			oAdvanceFilterModel.setProperty("/subjectTokenIndex", -1);
			this.oAppModel.setProperty("/advFilterTokens", tokens);
			var requestPayload = {
				"inboxType": oAdvanceFilterModel.getProperty("/searchInboxType"),
				"advanceSearch": "",
				"filterMap": {}
			};
			var savedFilter = jQuery.extend(true, {}, requestPayload);
			oAdvanceFilterModel.setProperty("/busy", true);
			if (this.oAppModel.getProperty("/inboxName") === "Groups") {
				savedFilter.inboxName = "Groups";
			}
			// FOR SAVING A FILTER- THE JSON STRING IS MANIPULATED

			var result, flag = true;
			if (this._oAdvanceFilter !== undefined) {
				// basic filters
				if (this._oAdvanceFilter.isOpen() && (oAdvanceFilterModel.getProperty("/showAdvancedFilter") === true)) {
					var aAdvancedFilterNames = jQuery.extend(true, [], oAdvanceFilterModel.getProperty("/aAdvancedFilterNames"));
					for (var i = 0; i < aAdvancedFilterNames.length; i++) {
						var oStandardFilter = oAdvanceFilterModel.getProperty("/standardFilter/" + aAdvancedFilterNames[i].index);
						if (oStandardFilter) {
							if (oStandardFilter.value && typeof (oStandardFilter.value) === "string")
								oStandardFilter.value = oStandardFilter.value.replace(/^\s+|\s+$/gm, "");
							flag = this.generateAdvFilterMap(oStandardFilter, requestPayload, savedFilter, oStandardFilter.operator, "BASIC");

						}
						if (!flag)
							break;

					}
					savedFilter.filterType = "BASIC";
				}
				// advanced filters
				if (this._oAdvanceFilter.isOpen() && (oAdvanceFilterModel.getProperty("/showAdvancedFilter") === false)) {
					var listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
					var queryList = oAdvanceFilterModel.getProperty("/queryList");
					var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
					var isCustomFilterApplied = false,
						isProcessNameApplied = false;
					for (i = 0; i < listOfAdvancedFilters.length; i++) {
						if ((listOfAdvancedFilters[i].advancedFilter[0].value !== "") && (listOfAdvancedFilters[i].advancedFilter[2].value !== "") &&
							(
								listOfAdvancedFilters[i].advancedFilter[1].value !== "")) {
							flag = this.generateAdvFilterMap(listOfAdvancedFilters[i].advancedFilter[3], requestPayload, savedFilter,
								listOfAdvancedFilters[i].advancedFilter[0].value + " " + listOfAdvancedFilters[i].advancedFilter[2].value, "ADVANCED");
							if (flag && listOfAdvancedFilters[i].advancedFilter[3].type === "custom") {
								isCustomFilterApplied = true;
							}
							if (flag && listOfAdvancedFilters[i].advancedFilter[3].columnName === "NAME") {
								isProcessNameApplied = true;
							}
						} else if ((listOfAdvancedFilters[i].advancedFilter[0].value) && (listOfAdvancedFilters[i].advancedFilter[1].value ===
								"")) {
							// If row is unfilled remove the row
							flag = true;
							listOfAdvancedFilters.splice(i, 1);
							selectedFilterNames.splice(i, 1);
							queryList.splice(i, 1);
							oAdvanceFilterModel.setProperty("/queryText", queryList.join(" "));
							i--;
						} else {
							flag = false;
						}
					}

					if (Object.keys(requestPayload.filterMap).length > 0) {
						savedFilter.filterType = "ADVANCED";
						savedFilter.selProcessName = "";
						if (!isProcessNameApplied && isCustomFilterApplied) {
							savedFilter.selProcessName = oAdvanceFilterModel.getProperty(oAdvanceFilterModel.getProperty("/processNameIndex") +
								"/selectedKey/0");
						}
						oAdvanceFilterModel.setProperty("/enableAddRow", true);

					}
					if (listOfAdvancedFilters.length === 0) {
						this.clearAdvFilterData();
					}
				}
			}

			// For WORKDAY
			if (Object.keys(requestPayload.filterMap).includes("te.ORIGIN") && requestPayload.filterMap["te.ORIGIN"].value && requestPayload.filterMap[
					"te.ORIGIN"].value.split("'").includes(
					"Workday")) {
				requestPayload.filterMap = this.changeWorkdayPayload(requestPayload.filterMap);

			}

			var response = {
				"flag": flag,
				"requestPayload": requestPayload,
				"saveFilterPayload": savedFilter
			};
			oAdvanceFilterModel.setProperty("/validatedPayload", response);
			oAdvanceFilterModel.refresh(true);
			oAdvanceFilterModel.setProperty(
				"/busy", false);
			return response;
		},

		changeWorkdayPayload: function (filterMap) {
			//if process name is not mentioned add object
			if (!Object.keys(filterMap).includes("pe.NAME")) {
				filterMap["pe.NAME"] = {
					"operator": "AND",
					"condition": "in",
					"value": "'CFAApproverMatrixChangeProcess'",
					"upperLimit": "",
					"lowerLimit": "",
					"dataType": "STRING",
					"level": "pe"
				}
			}
			//if process name is there add workday
			else if (!filterMap["pe.NAME"].value.includes("'CFAApproverMatrixChangeProcess'")) {
				filterMap["pe.NAME"].value = filterMap["pe.NAME"].value + ",'CFAApproverMatrixChangeProcess'"
			}

			//remove workday from origin, keep remaining origin
			if (filterMap["te.ORIGIN"].value.split("'").length > 3) {
				filterMap["te.ORIGIN"].value = filterMap["te.ORIGIN"].value.replace("'Workday'", '');
				if (filterMap["te.ORIGIN"].value.charAt(0) === ",") {
					filterMap["te.ORIGIN"].value = filterMap["te.ORIGIN"].value.slice(1);
				}
				if (filterMap["te.ORIGIN"].value.charAt(filterMap["te.ORIGIN"].value.length - 1) === ',') {
					filterMap["te.ORIGIN"].value = filterMap["te.ORIGIN"].value = filterMap["te.ORIGIN"]
						.value.slice(0, filterMap[
							"te.ORIGIN"].value.length - 1);
				}
			} else {
				delete filterMap["te.ORIGIN"];
			}
			return filterMap;
		},
		generateAdvFilterMap: function (oStandardFilter, requestPayload, savedFilter, operator, advFilterType) {
			var oFilterMap;
			var flag = true;
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			if (oStandardFilter.enabled) {
				if (oStandardFilter.filterType === "INPUT" || oStandardFilter.filterType === "CHECKBOX" || oStandardFilter.filterType ===
					"COMBOBOX") {
					oStandardFilter.selectedKey = oStandardFilter.selectedKey.replace(/^\s+|\s+$/gm, "");
					if (oStandardFilter.value !== "") {
						oFilterMap = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty("/oFilterMap"));
						oFilterMap.value = oStandardFilter.value;
						oFilterMap.dataType = oStandardFilter.datatype;
						oFilterMap.level = oStandardFilter.tableAlias;
						oFilterMap.operator = operator;
						oFilterMap.displayValue = oStandardFilter.displayValue;
						requestPayload.filterMap[oFilterMap.level + "." + oStandardFilter.columnName] = oFilterMap;
						savedFilter.filterMap[oFilterMap.level + "." + oStandardFilter.columnName] = oFilterMap;
						this.generateTokens(oStandardFilter, oFilterMap.level + "." + oStandardFilter.columnName, advFilterType);
					} else if (oStandardFilter.value === "" && advFilterType === "ADVANCED") {
						flag = false;
					}
				}
				if (oStandardFilter.filterType === "MULTICOMBOBOX") {

					if (oStandardFilter.selectedKey.length > 0) {
						oFilterMap = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty("/oFilterMap"));
						oFilterMap.value = oStandardFilter.value;
						oFilterMap.dataType = oStandardFilter.datatype;
						oFilterMap.level = oStandardFilter.tableAlias;
						oFilterMap.condition = "in";
						oFilterMap.operator = operator;
						oFilterMap.displayValue = oStandardFilter.displayValue;
						requestPayload.filterMap[oFilterMap.level + "." + oStandardFilter.columnName] = oFilterMap;
						savedFilter.filterMap[oFilterMap.level + "." + oStandardFilter.columnName] = oFilterMap;
						this.generateTokens(oStandardFilter, oFilterMap.level + "." + oStandardFilter.columnName, advFilterType);
					} else if (oStandardFilter.selectedKey.length === 0 && advFilterType === "ADVANCED") {
						flag = false;
					}
				}

				if (oStandardFilter.filterType === "DATEFILTER") {
					oStandardFilter.selectedKey = oStandardFilter.selectedKey.replace(/^\s+|\s+$/gm, "");
					// If the dropdown and date picker is not empty - add it to filter payload
					if (oStandardFilter.selectedKey !== "" && (oStandardFilter.value !== "" || (oStandardFilter.lowerLimit !== "" &&
							oStandardFilter.upperLimit !== ""))) {
						oFilterMap = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty("/oFilterMap"));
						// if (oStandardFilter.value === "" && oStandardFilter.lowerLimit !== "" && oStandardFilter.upperLimit !== "") {
						oFilterMap.condition = "DateRange";
						// }
						if (oStandardFilter.selectedKey === "Today" || oStandardFilter.selectedKey === "Yesterday") {
							oStandardFilter.lowerLimit = oStandardFilter.value;
							oStandardFilter.upperLimit = oStandardFilter.value;
						}
						oFilterMap.operator = operator;
						oFilterMap.value = "";
						oFilterMap.dataType = oStandardFilter.datatype;
						oFilterMap.level = oStandardFilter.tableAlias;
						oFilterMap.displayValue = oStandardFilter.displayValue;
						oFilterMap.lowerLimit = this.setDateRangeAdvFilter("LOWERLIMIT", oStandardFilter.lowerLimit);
						oFilterMap.upperLimit = this.setDateRangeAdvFilter("UPPERLIMIT", oStandardFilter.upperLimit);

						requestPayload.filterMap[oFilterMap.level + "." + oStandardFilter.columnName] = oFilterMap;
						var extFilterMap = jQuery.extend(true, {}, oFilterMap);
						extFilterMap.condition = jQuery.extend(true, {}, oStandardFilter).selectedKey;
						savedFilter.filterMap[oFilterMap.level + "." + oStandardFilter.columnName] = extFilterMap;
						this.generateTokens(oStandardFilter, oFilterMap.level + "." + oStandardFilter.columnName, advFilterType);
					} else if (oStandardFilter.selectedKey === "" && (oStandardFilter.value === "" || (oStandardFilter.lowerLimit === "" &&
							oStandardFilter.upperLimit === ""))) {
						if (advFilterType === "ADVANCED") {
							flag = false;
						}

					} else {
						flag = false;

					}
				}
				if (oStandardFilter.filterType === "COMBOINPUT") {
					oStandardFilter.selectedKey = oStandardFilter.selectedKey.replace(/^\s+|\s+$/gm, "");
					// The dropdown and input fields are filled - add it to filter payload
					if (oStandardFilter.value !== "" && oStandardFilter.selectedKey !== "") {
						oFilterMap = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty("/oFilterMap"));
						oFilterMap.value = oStandardFilter.value;
						oFilterMap.dataType = oStandardFilter.datatype;
						oFilterMap.condition = oStandardFilter.selectedKey;
						oFilterMap.level = oStandardFilter.tableAlias;
						oFilterMap.operator = operator;
						oFilterMap.displayValue = oStandardFilter.displayValue;
						requestPayload.filterMap[oFilterMap.level + "." + oStandardFilter.columnName] = oFilterMap;
						savedFilter.filterMap[oFilterMap.level + "." + oStandardFilter.columnName] = oFilterMap;
						this.generateTokens(oStandardFilter, oFilterMap.level + "." + oStandardFilter.columnName, advFilterType);
					}
					// IF either the dropdown or input fields's value is missing prompt flag
					else if ((oStandardFilter.value !== "" &&
							oStandardFilter.selectedKey === "") || (oStandardFilter.value === "" &&
							oStandardFilter.selectedKey !== "")) {
						flag = false;
					} else if (oStandardFilter.value === "" && oStandardFilter.selectedKey === "" && advFilterType === "ADVANCED") {
						flag = false;
					}
				}
				if (flag && oFilterMap && advFilterType === "ADVANCED") {
					var newOperator;
					if (oFilterMap.operator === "AND AND") {
						newOperator = "AND";
					} else if (oFilterMap.operator === "OR AND") {
						newOperator = "OR";
					} else {
						newOperator = oFilterMap.operator;
					}
					oFilterMap.operator = newOperator;
					requestPayload.filterMap[oFilterMap.level + "." + oStandardFilter.columnName].operator = newOperator;
					savedFilter.filterMap[oFilterMap.level + "." + oStandardFilter.columnName].operator = newOperator;
				}
			}
			return flag;
		},
		// Generate Filter tokens
		generateTokens: function (oStandardFilter, level, advFilterType) {
			var tokens = this.oAppModel.getProperty("/advFilterTokens");
			if (!tokens) {
				tokens = [];
			}

			var value = oStandardFilter.label + ": " + oStandardFilter.value;
			if (oStandardFilter.label.includes("Process Name") && oStandardFilter.value.includes("CFAApproverMatrixChangeProcess")) {
				value = "Origin System" + ": " + "Workday";
			}
			var tokenItem = {
				"key": oStandardFilter.columnName,
				"value": value,
				"sIndex": oStandardFilter.index,
				"aIndex": oStandardFilter.aIndex,
				"type": "advanceFilter",
				"level": level,
				"filterType": oStandardFilter.filterType,
				"advFilterType": advFilterType,
				"label": oStandardFilter.label,
				"displayValue": oStandardFilter.displayValue
			};
			if (oStandardFilter.filterType === "DATEFILTER") {
				tokenItem.value = oStandardFilter.label + ": " + oStandardFilter.selectedKey;
				if (oStandardFilter.selectedKey === "DateRange") {
					if (oStandardFilter.lowerLimit === oStandardFilter.upperLimit)
						tokenItem.value = oStandardFilter.label + ": " + oStandardFilter.lowerLimit;
					else
						tokenItem.value = oStandardFilter.label + ": " + oStandardFilter.lowerLimit + "-" + oStandardFilter.upperLimit;

				}
			} else if (oStandardFilter.filterType === "CHECKBOX") {
				tokenItem.value = oStandardFilter.label;
			}
			if (oStandardFilter.columnName === "SUBJECT") {
				var subjectTokenIndex = this.getModel("oAdvanceFilterModel").getProperty("/subjectTokenIndex");
				if (subjectTokenIndex !== -1) {
					tokens.splice(subjectTokenIndex, 1);
				}
				this.getModel("oAdvanceFilterModel").setProperty("/subjectTokenIndex", tokens.length);
			}
			tokens.push(tokenItem);
			this.oAppModel.setProperty("/advFilterTokens", tokens);
		},
		// Opens Save filter fragment
		openSaveFilter: function (oEvent) {
			var selectedAction = oEvent.getSource().getCustomData()[0].getKey();
			var response = this.validateAdvFilter();
			if (response.flag && ((Object.keys(response.requestPayload.filterMap).length !== 0 && selectedAction === "FILTER") || (Object.keys(
					response.requestPayload.filterMap).length >= 0 && selectedAction === "TILE"))) {
				if (!this._oSaveAdvFilter) {
					this._oSaveAdvFilter = this._createFragment("oneapp.incture.workbox.fragment.SaveAdvancedFilter", this);
					this.getView().addDependent(this._oSaveAdvFilter);
				}
				this._oSaveAdvFilter.open();
				this.fetchSavedFilters();
			} else if (Object.keys(response.requestPayload.filterMap).length === 0) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("ADD_FILTERS_TO_SAVE_TEXT"));
			} else {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("DETAILS_MISSING_TEXT"));
			}
		},
		validateFilterName: function (oEvent) {
			var value = oEvent.getParameter("value").replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
			value = value.replace(/^\s+/g, "");
			oEvent.getSource().setValue(value);

		},
		// Closes Save filter fragment
		closeSaveFilter: function (oEvent) {
			if (this._oSaveAdvFilter !== undefined && this._oSaveAdvFilter.isOpen()) {
				this._oSaveAdvFilter.close();
			}
		},
		// Update or create new advanced filter
		applySaveFilter: function (property, oEvent) {
			var path = "";
			var url = "/oneappinctureworkbox/WorkboxJavaService/userCustomFilter/saveViewFilter";
			var flag = true,
				isTile = false;
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var filterData;
			// CREATE FILTER OR TILE
			if (property === "CreateFilter" || property === "CreateTile") {
				filterData = JSON.stringify(oAdvanceFilterModel.getProperty("/validatedPayload/saveFilterPayload"));
				if (property === "CreateTile") {
					filterData = JSON.stringify(oAdvanceFilterModel.getProperty("/validatedPayload/saveFilterPayload"));
					isTile = true
				}
				property = "Create";
				flag = oAdvanceFilterModel.getProperty("/validatedPayload/flag");
				this.confirmUpdateFilter(property, url, path, filterData, flag, isTile);
			} else {
				path = oEvent.getSource()._getBindingContext("oAdvanceFilterModel").getPath();
				var oContext = oAdvanceFilterModel.getProperty(path);
				filterData = oContext.filterData;
				// DELETE FILTER OR TILE
				if (property === "DeleteFilter" || property === "DeleteTile") {
					if (property === "DeleteTile") {
						isTile = true
					}
					property = "Delete";
					url = "/oneappinctureworkbox/WorkboxJavaService/userCustomFilter/deleteFilter";
					var delFlag = flag;
					flag = false;
					var i18n = this.getView().getModel("i18n").getResourceBundle();
					var warning = i18n.getText("WARNING_TEXT");
					var alertmessage = i18n.getText("DELETE_CAUTION_TEXT");
					this._createConfirmationMessage(warning, alertmessage, "Warning", i18n.getText(
							"YES_TEXT"), i18n.getText("NO_TEXT"), true,
						function (success) {
							flag = delFlag;
							// If the filter being deleted is applied clearing filters
							if (oAdvanceFilterModel.getProperty("/filterId") === oAdvanceFilterModel.getProperty(path + "/filterId")) {
								this.clearFilters();
							}
							this.confirmUpdateFilter(property, url, path, filterData, flag, isTile);
						}.bind(this),
						function (failure) {
							flag = false;
						});
				} else {
					// UPDATE FILTER OR TILE
					if (property === "UpdateTileActivate") {
						isTile = true;
						oAdvanceFilterModel.setProperty(path + "/isActive", oEvent.getParameter("state"));
						var activeTileCount = oAdvanceFilterModel.getProperty("/activeDashboardTiles");

					} else if (property === "UpdateTileName") {
						isTile = true;
					}
					property = "Update";
					if (activeTileCount === 6 && !oEvent.getParameter("state") === false && oAdvanceFilterModel.getProperty(path + "/userId") !==
						"ADMIN") {
						oAdvanceFilterModel.setProperty(path + "/isActive", false);
						this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("TILE_LIMIT_ERR_MSG_TEXT"));
					} else {
						this.confirmUpdateFilter(property, url, path, filterData, flag, isTile)
					};
				}
			}

		},

		confirmUpdateFilter: function (property, url, path, filterData, flag, isTile) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel"),
				that = this,
				payload = {},
				userTiles = oAdvanceFilterModel.getProperty("/userTiles");
			// SET SEQUENCE
			if (oAdvanceFilterModel.getProperty(path + "/sequence") === undefined) {
				if (path.includes("/userTiles") || path === "") {
					if (userTiles.length > 0) {
						oAdvanceFilterModel.setProperty(path + "/sequence", userTiles[userTiles.length - 1].sequence + 1);
					} else {
						oAdvanceFilterModel.setProperty(path + "/sequence", 1);
					}
				} else {
					oAdvanceFilterModel.setProperty(path + "/sequence", 0);
				}
			}
			if (isTile) {
				payload = {
					"filterId": oAdvanceFilterModel.getProperty(path + "/filterId"),
					"filterData": filterData,
					"filterName": oAdvanceFilterModel.getProperty(path + "/filterName"),
					"isView": oAdvanceFilterModel.getProperty(path + "/isActive"),
					"viewName": oAdvanceFilterModel.getProperty(path + "/filterName"),
					"isActive": oAdvanceFilterModel.getProperty(path + "/isActive"),
					"filterType": oAdvanceFilterModel.getProperty(path + "/filterType"),
					"description": oAdvanceFilterModel.getProperty(path + "/description"),
					"threshold": null,
					"isTile": true,
					"sequence": oAdvanceFilterModel.getProperty(path + "/sequence")
				};
				if (this.oAppModel.getProperty("/currentViewPage") === "manageDashboardTiles") {
					payload.userId = "ADMIN";
					payload.filterType = "STANDARD";
					payload.isView = false;
					payload.sequence = 0;
				}
			} else {
				payload = {
					"filterId": oAdvanceFilterModel.getProperty(path + "/filterId"),
					"filterData": filterData,
					"filterName": oAdvanceFilterModel.getProperty(path + "/filterName"),
					"isView": oAdvanceFilterModel.getProperty(path + "/isView"),
					"viewName": oAdvanceFilterModel.getProperty(path + "/filterName"),
					"isActive": oAdvanceFilterModel.getProperty(path + "/isView"),
					"filterType": oAdvanceFilterModel.getProperty(path + "/filterType"),
					"description": oAdvanceFilterModel.getProperty(path + "/description"),
					"threshold": null,
					"isTile": oAdvanceFilterModel.getProperty(path + "/isView"),
					"sequence": oAdvanceFilterModel.getProperty(path + "/sequence"),
					"inboxType": oAdvanceFilterModel.getProperty(path + "/inboxType")
				};
				if (oAdvanceFilterModel.getProperty(path + "/isTray")) {
					payload.tray = true;
				}
				if (oAdvanceFilterModel.getProperty(path)) {
					if (oAdvanceFilterModel.getProperty(path).tray) {
						payload.tray = true;;
					}
				}
			}
			if (!oAdvanceFilterModel.getProperty(path + "/inboxType")) {
				payload.inboxType = JSON.parse(payload.filterData).inboxType;
			}
			if (payload.filterName === "") {
				flag = false;
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("DETAILS_MISSING_TEXT"));
			} else if (!payload.isView) {
				payload.viewName = "";
			}
			if (flag) {
				var activeTileCount = oAdvanceFilterModel.getProperty("/activeDashboardTiles");
				if ((activeTileCount >= 6 && property === "Create") || (activeTileCount > 6 && property === "Update" && payload.isActive)) {
					payload.isActive = false;
				}
				var filterDetails = {
					"path": path,
					"property": property,
					"payload": payload,
					"isTile": isTile
				};

				this.doAjax(url, "POST", payload, function (oData) {
						that._showToastMessage(oData.message);
						filterDetails = this;
						// ------------------- Update sequence number for all items and save then fetch all rows ----------------------
						if (filterDetails.property === "Delete" && oData.status !== "FAILURE") {
							var trimmedPath = "/" + filterDetails.path.split("/")[1];
							var filters = oAdvanceFilterModel.getProperty(trimmedPath);
							filters.splice(filterDetails.path.split("/")[2], 1);

							filters.forEach(function (item, index) {
								item.sequence = index + 1;
							});

							oAdvanceFilterModel.setProperty(trimmedPath, filters);
							that.saveAllFilters(trimmedPath);
						} else {
							that.fetchSavedFilters();
						}

						// ------------------------------------- If tiles are updated -----------------------------------------

						if (filterDetails.isTile) {
							// Manage Tile updation
							if (that.oAppModel.getProperty("/currentView") === "dashBoard") {
								sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetGraphTiles();
							}

							oAdvanceFilterModel.setProperty("/searchInboxType", "AdminInbox");
						}
						// ------------------------------------- If filters are updated -----------------------------------------
						else {
							if (oData.status !== "FAILURE") {
								// ----------------- If new view created and you are in inbox update left panel -----------------
								if (that.oAppModel.getProperty("/currentView") === "unifiedInbox") {
									that.setInboxPanel();
								}
								// ------------------------------- Apply created view -------------------------------------------

								if (filterDetails.property === "Create") {
									that.applyAdvancedFilter(oAdvanceFilterModel.getProperty("/validatedPayload/requestPayload"));
								} else {

									// that.fetchSavedFilters();
									//-------------- If the inbox applied is same as the deleted or updated saved --------------
									var currentViewPageName = that.oAppModel.getProperty("/currentViewPageName");
									if (oAdvanceFilterModel.getProperty("/filterId").toString() === filterDetails.payload.filterId.toString()) {
										if (filterDetails.property === "Update") {
											if (currentViewPageName !== filterDetails.payload.filterName) {
												that.setCurrentPage(filterDetails.payload.filterName, filterDetails.payload.filterName, filterDetails.payload.filterName,
													false, true);
											}
											if (!filterDetails.payload.isView) {
												that.setCurrentPage("MyInbox", "MyInbox", "My Task", true, true);
												that.removeAllTokens();
												sap.ui.core.UIComponent.getRouterFor(
													that).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().onClickFilterDetail();
											}
										}
										if (filterDetails.property === "Delete") {
											that.setCurrentPage("MyInbox", "MyInbox", "My Task", true, true);
											that.removeAllTokens();
											sap.ui.core.UIComponent.getRouterFor(
												that).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().onClickFilterDetail();

										}
									}
									that.oAppModel.refresh(true);
								}
							}
						}
						if (that.oAppModel.getProperty("/WB_TASK_BOARD_VIEW")) {
							sap.ui.core.UIComponent.getRouterFor(
								that).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().getTaskBoardData();
						}
						oAdvanceFilterModel.refresh(true);
						that.closeSaveFilter();
						if (that._oAdvanceFilter && that._oAdvanceFilter.isOpen()) {
							that._oAdvanceFilter.close();
						}
					}.bind(filterDetails),
					function (oEvent) {}.bind(this));
			}
		},
		editTileFilter: function (oEvent) {
			var oSelectedTile = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getObject();
			this.oAppModel.setProperty("/removeFilterToken", false);
			oSelectedTile.tilePayload = JSON.parse(oSelectedTile.filterData);
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			this.oAppModel.setProperty("/isViewApplied", true);
			oAdvanceFilterModel.setProperty("/filterName", oSelectedTile.filterName);
			oAdvanceFilterModel.setProperty("/isView", false);
			oAdvanceFilterModel.setProperty("/isTray", false);
			oAdvanceFilterModel.setProperty("/description", oSelectedTile.description);
			oAdvanceFilterModel.setProperty("/viewName", oSelectedTile.viewName);
			oAdvanceFilterModel.setProperty("/filterId", oSelectedTile.filterId);
			oAdvanceFilterModel.setProperty("/isActive", oSelectedTile.isActive);
			oAdvanceFilterModel.setProperty("/sequence", oSelectedTile.sequence);
			oAdvanceFilterModel.setProperty("/viewAppliedContext", "");
			oAdvanceFilterModel.setProperty("/editTileFilter", true);
			this.setSavedFilterToInbox(oSelectedTile.tilePayload);
			this.addDashboardTile();
		},
		cloneTileFilter: function (oEvent) {
			var oSelectedTile = oEvent.getSource().getBindingContext("oAdvanceFilterModel").getObject(),
				oAdvanceFilterModel = this.getModel("oAdvanceFilterModel"),
				userTiles = oAdvanceFilterModel.getProperty("/userTiles");

			oAdvanceFilterModel.setProperty("/filterId", "");
			oAdvanceFilterModel.setProperty("/filterName", oSelectedTile.filterName + " Clone");
			oAdvanceFilterModel.setProperty("/isView", oSelectedTile.isActive);
			oAdvanceFilterModel.setProperty("/description", oSelectedTile.description);
			oAdvanceFilterModel.setProperty("/filterName", oSelectedTile.filterName + " Clone");
			oAdvanceFilterModel.setProperty("/isActive", oSelectedTile.isActive);
			oAdvanceFilterModel.setProperty("/filterType", "STANDARD");
			if (userTiles.length > 0) {
				oAdvanceFilterModel.setProperty("/sequence", userTiles[userTiles.length - 1].sequence + 1);
			} else {
				oAdvanceFilterModel.setProperty("/sequence", 1);
			}

			this.confirmUpdateFilter("Create", "/oneappinctureworkbox/WorkboxJavaService/userCustomFilter/saveViewFilter", "", oSelectedTile.filterData, true,
				true);
		},
		//on dropping the list item the sequence no and isActive is set
		onDropSavedTile: function (oInfo, sPath) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),
				oGrid = oDragged.getParent(),
				oAdvanceFilterModel = this.getModel("oAdvanceFilterModel"),
				oData = this.getModel("oAdvanceFilterModel").getProperty(sPath),
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

			// Update sequence number for all items
			oData.forEach(function (item, index) {
				item.sequence = index + 1;
			});

			oAdvanceFilterModel.setProperty(sPath, oData);
			this.saveAllFilters(sPath);
			oAdvanceFilterModel.refresh(true);
		},
		saveAllFilters: function (sPath) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel"),
				filters = oAdvanceFilterModel.getProperty(sPath);
			var url = "/oneappinctureworkbox/WorkboxJavaService/userCustomFilter/saveAllViewFilter";
			this.doAjax(url, "POST", filters, function (oData) {
				if (oData.status !== "FAILURE") {
					if (this.oAppModel.getProperty("/currentView") === "dashBoard") {
						sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetGraphTiles();
					}
					this.fetchSavedFilters();
				}
			}.bind(this), function (oError) {}.bind(this));
		},
		//  Opens Manage filter fragment
		openManageFilter: function () {
			if (!this._oManageFilter) {
				var _oManageGraphContent = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.GraphConfigurationView", this);
				var _oManageFilterContent = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.ManageFilter", this);
				this._oManageFilter = new sap.m.Dialog({
						verticalScrolling: false,
						contentWidth: "65%"
					}).addStyleClass("wbDialog sapUiSizeCompact")
					.setCustomHeader(new sap.m.Bar()
						.addContentLeft(new sap.m.Title({
								text: "{= ${oAppModel>/currentView} === 'dashBoard' || ${oAppModel>/currentViewPage} === 'manageDashboardTiles' ? ${i18n>DASHBOARD_SETTINGS_TEXT} : ${i18n>MANAGE_FILTERS_TEXT}}"
							})
							.addStyleClass("wbDialogTitle"))
						.addContentRight(new sap.ui.core.Icon({
							src: "sap-icon://decline",
							tooltip: "{i18n>CLOSE_TEXT}",
							press: function (oEvent) {
								this.closeManageFilter();
							}.bind(this)
						}).addStyleClass("wbDialogCloseIcon"))
					);
				var oIconTabBarContent = new sap.m.IconTabBar({
					expandable: false
				}).addStyleClass("wbAdminMGroupsIconTabBackground");
				var graphTabFiter = new sap.m.IconTabFilter({
					text: "{i18n>GRAPH_CONFIGURATION_TEXT}",
					key: "manageGraphs",
					visible: "{= ${oAppModel>/currentView} === 'dashBoard' ? true : false}"
				});
				graphTabFiter.addContent(_oManageGraphContent);
				var tileTabFiter = new sap.m.IconTabFilter({
					text: "{i18n>MANAGE_FILTERS_TEXT}",
					key: "manageTiles"
				});
				tileTabFiter.addContent(_oManageFilterContent);
				oIconTabBarContent.addItem(graphTabFiter);
				oIconTabBarContent.addItem(tileTabFiter);
				this._oManageFilter.addContent(oIconTabBarContent);
				this.getView().addDependent(this._oManageFilter);
			}
			if (this.oAppModel.getProperty("/currentView") === 'dashBoard') {
				this.getUserGraphConfigDetails();
			}
			this.fetchSavedFilters();
			this._oManageFilter.open();
			this.oAppModel.setProperty("/ManageFilterActive", true);
			if (this._oAdvanceFilter && this._oAdvanceFilter.isOpen()) {
				this._oAdvanceFilter.close();
			}
		},

		//to get the user configured graph details
		getUserGraphConfigDetails: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oDefaultDataModel = new JSONModel();
			this.getView().setModel(oDefaultDataModel, "oDefaultDataModel");
			this.fetchGraphListfn(oDefaultDataModel);
			this.fetchGraphParameterfn(oDefaultDataModel);
			this.setGraphConfigData(oDefaultDataModel);
		},

		//fetching the list of graphs
		fetchGraphListfn: function (oDefaultDataModel, user) {
			var surl = "/oneappinctureworkbox/WorkboxJavaService/Dashboard/getGraphList";
			if (user === "admin") {
				surl = surl + "?type=Admin";
			}
			oDefaultDataModel.setProperty("/sequenceApplyButton", false);
			oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(surl, "GET", null, function (oData) {
				if (oData) {
					oDefaultDataModel.setProperty("/graphListItems", oData.graphDetails);
					oDefaultDataModel.refresh(true);
					oDefaultDataModel.setProperty("/enableBusyIndicators", false);
				}
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//setting the graph configuration data
		setGraphConfigData: function (oDefaultDataModel) {
			if (oDefaultDataModel.oSource) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var data = {
				"graphConfigId": null, //empty if it's a new graph
				"userId": null,
				"graphName": null,
				"chartType": null,
				"gridView": true,
				"showLegends": true,
				"xLabel": null,
				"xParameter": null,
				"xCategory": null,
				"xFilter": null,
				"xScrollbar": true,
				"xAxisTopValue": 0,
				"yLabel": null,
				"yParameter": null,
				"yScrollbar": true,
				"yCategory": null,
				"yFilter": null,
				"yAxisTopValue": 0,
				"sequence": null,
				"frameDetail": null,
				"isActive": true
			};
			if (oDefaultDataModel.getProperty("/graphListItems")) {
				data.sequence = oDefaultDataModel.getProperty("/graphListItems").length + 1;
			}
			oDefaultDataModel.setProperty("/graphConfigData", data);
			oDefaultDataModel.refresh(true);
		},

		//checks the value string of labels and removes the special character
		checkInputValue: function (oEvent, property, oDefaultDataModel) {
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var sPath = oEvent.getSource().getBindingInfo("value").binding.sPath;
			if (oEvent.getSource().getValue()) {
				if (property === "specialCharacter") {
					var value;
					var oSource = oEvent.getSource();
					var i18n = this.getView().getModel("i18n").getResourceBundle();
					// Combobox or input
					value = oEvent.getParameter("value").replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
					oSource.setValue(value);
					var str = oEvent.getSource().getValue();
					var formattedStr = str.replace(
						/\w\S*/g,
						function (txt) {
							return txt.charAt(0).toUpperCase() + txt.substr(1);
						}
					);
					oDefaultDataModel.setProperty(sPath, formattedStr);
				} else {
					oDefaultDataModel.setProperty("/graphConfigData/xScrollbar", false);
					oDefaultDataModel.setProperty("/graphConfigData/yScrollbar", false);
				}
				oDefaultDataModel.refresh(true);
				this.setChangePropertyFn();
			}
		},

		//fetching the list of parameters and categories
		fetchGraphParameterfn: function (oDefaultDataModel) {
			var surl = "/oneappinctureworkbox/WorkboxJavaService/crossConstant/getConstants/graphParam";
			this.doAjax(surl, "GET", null, function (oData) {
					if (oData) {
						oDefaultDataModel.setProperty("/graphParameter", oData.dto);
						oDefaultDataModel.refresh(true);
					}
					oDefaultDataModel.refresh(true);
				}.bind(this),
				function (oError) {}.bind(this));
		},

		//setting the chart type and changing the class
		setChartTypeFn: function (oEvent, oDefaultDataModel) {
			var value = oEvent.getSource().getAlt();
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			oDefaultDataModel.setProperty("/graphConfigData/chartType", value);
			if (value === "pie" || value === "donut") {
				oDefaultDataModel.setProperty("/graphConfigData/yLabel", "Task Count");
				oDefaultDataModel.setProperty("/graphConfigData/yParameter", "taskCount");
				if (oDefaultDataModel.getProperty("/graphConfigData/xParameter") === "taskCount") {
					oDefaultDataModel.setProperty("/graphConfigData/xParameter", null);
				}
				oDefaultDataModel.setProperty("/graphConfigData/yCategory", null);
				oDefaultDataModel.setProperty("/graphConfigData/yFilter", null);
				oDefaultDataModel.setProperty("/graphConfigData/yScrollbar", true);
			}
			oDefaultDataModel.refresh(true);
			this.setChangePropertyFn();
		},

		//binding the filter multicombobox items w.r.t selected category
		changeFilterItemsFn: function (oEvent, oDefaultDataModel) {
			var value;
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			if (oEvent) {
				value = oEvent.getSource().getSelectedKey();
				oDefaultDataModel.setProperty("/graphConfigData/xFilter", null);
				oDefaultDataModel.setProperty("/graphConfigData/yFilter", null);
				oEvent.getSource().close();
			} else {
				var graphData = oDefaultDataModel.getProperty("/graphConfigData");
				if (graphData.chartType === "bar" || graphData.chartType === "stacked_bar") {
					value = graphData.xCategory;
				} else {
					value = graphData.yCategory;
				}
			}
			var dataSet;
			var items = [];
			var obj = {};
			var i;
			if (value === "userList" || value === "processList" || value === "createdBy") {
				var oConstantsModel = this.getModel("oConstantsModel");
				if (value === "userList" || value === "createdBy") {
					dataSet = oConstantsModel.getProperty("/allUsers");
					for (i = 0; i < dataSet.length; i++) {
						obj = {};
						obj.value = dataSet[i].userId;
						obj.key = dataSet[i].userFirstName + " " + dataSet[i].userLastName;
						items.push(obj);
					}
				} else {
					dataSet = oConstantsModel.getProperty("/processNamesList");
					for (i = 0; i < dataSet.length; i++) {
						obj = {};
						obj.value = dataSet[i].processName;
						obj.key = dataSet[i].processDisplayName;
						items.push(obj);
					}
				}
			} else if (value === "groupList") {
				dataSet = oDefaultDataModel.getProperty("/allGroups/groupListDto");
				if (!dataSet) {
					var url = "/oneappinctureworkbox/WorkboxJavaService/group/getAllGroup/CUSTOM";
					this.doAjax(url, "GET", null, function (oData) {
						if (oData.groupListDto.length > 100) {
							oDefaultDataModel.setSizeLimit(oData.groupListDto.length);
						}
						oDefaultDataModel.setProperty("/allGroups", oData);
					}.bind(this), function (oError) {}.bind(this));
				}
				for (i = 0; i < dataSet.length; i++) {
					obj = {};
					obj.value = dataSet[i].groupId;
					obj.key = dataSet[i].groupName;
					items.push(obj);
				}
			} else if (value === "origin" || value === "status" || value === "comp_deadline") {
				var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel").getProperty("/aAdvancedFilterNames");
				for (i = 0; i < oAdvanceFilterModel.length; i++) {
					if (oAdvanceFilterModel[i].columnName.toLowerCase() === value) {
						items = oAdvanceFilterModel[i].dropdownList;
					}
				}
			} else if (value.toLowerCase() === "createdon" || value.toLowerCase() === "completedon" || value.toLowerCase() === "duedate") {
				items = [{
					"value": "week",
					"key": "Week"
				}, {
					"value": "month",
					"key": "Month"
				}];
			}
			oDefaultDataModel.setProperty("/graphConfigFilterData", items);
			oDefaultDataModel.refresh(true);
			this.setChangePropertyFn();
		},

		//set the category and filter values 
		changeParameterFn: function (oEvent, property, oDefaultDataModel) {
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var value = oEvent.getSource().getSelectedKey();
			if (property === "xAxis") {
				if (value !== "taskCount") {
					oDefaultDataModel.setProperty("/graphConfigData/xCategory", null);
					oDefaultDataModel.setProperty("/graphConfigData/xFilter", null);
				} else {
					oDefaultDataModel.setProperty("/graphConfigData/yCategory", null);
					oDefaultDataModel.setProperty("/graphConfigData/xAxisTopValue", 0);
					oDefaultDataModel.setProperty("/graphConfigData/yFilter", null);
					if (oDefaultDataModel.getProperty("/graphConfigData/yParameter") === "taskCount") {
						oDefaultDataModel.setProperty("/graphConfigData/yParameter", null);
					}
				}
			} else {
				if (value !== "taskCount") {
					oDefaultDataModel.setProperty("/graphConfigData/yCategory", null);
					oDefaultDataModel.setProperty("/graphConfigData/yFilter", null);
				} else {
					oDefaultDataModel.setProperty("/graphConfigData/yAxisTopValue", 0);
					oDefaultDataModel.setProperty("/graphConfigData/xCategory", null);
					oDefaultDataModel.setProperty("/graphConfigData/xFilter", null);
					if (oDefaultDataModel.getProperty("/graphConfigData/xParameter") === "taskCount") {
						oDefaultDataModel.setProperty("/graphConfigData/xParameter", null);
					}
				}
			}
			oDefaultDataModel.refresh(true);
			oEvent.getSource().close();
			this.setChangePropertyFn();
		},

		//change switch and validate top value function
		setSwitchPropertyFn: function (oDefaultDataModel) {
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			oDefaultDataModel.setProperty("/graphConfigData/xAxisTopValue", 0);
			oDefaultDataModel.setProperty("/graphConfigData/yAxisTopValue", 0);
			oDefaultDataModel.refresh(true);
			this.setChangePropertyFn();
		},

		//change property is set for discard changes confirmation popup
		setChangePropertyFn: function () {
			this.oAppModel.setProperty("/isChanged", true);
			this.oAppModel.refresh(true);
		},

		//create graph configuration post call
		graphConfigPostFn: function (oDefaultDataModel, user) {
			if (oDefaultDataModel.oSource) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var data = oDefaultDataModel.getProperty("/graphConfigData");
			var validationCheck = this.validationGraphFn(data);
			if (validationCheck) {
				var oPayload = this.createFilterMapDashboard(data);
				var url = "/oneappinctureworkbox/WorkboxJavaService/Dashboard/createGraph";
				if (user === "admin") {
					url = url + "?type=Admin";
				}
				this.doAjax(url, "POST", oPayload, function (oData) {
					this._showToastMessage(oData.message);
					this.setGraphConfigData(oDefaultDataModel);
					this.fetchGraphListfn(oDefaultDataModel, user);
					this.oAppModel.setProperty("/isChanged", false);
					this.oAppModel.refresh(true);
					if (this.oAppModel.getProperty("/currentView") === 'dashBoard') {
						sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetCustomGraphList();
					}
				}.bind(this), function (oError) {}.bind(this));
			}
		},

		//validation of grpah configuration fields
		validationGraphFn: function (data) {
			var flag = true;
			if (!data.graphName || !data.chartType || !data.xParameter || !data.yParameter) {
				flag = false;
			}
			if (flag) {
				if (data.xParameter === "taskCount" && data.xCategory && !data.xFilter) {
					flag = false;
				}
				if (data.yParameter === "taskCount" && data.yCategory && !data.yFilter) {
					flag = false;
				}
			}
			if (!flag) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			}
			return flag;
		},

		createFilterMapDashboard: function (oPayload) {
			var filterMap = {};
			var filterPayload = {
				"inboxType": "AllTask",
				"filterType": "BASIC",
				"advanceSearch": "",
				"filterMap": filterMap
			};
			var category, parameter;
			if (oPayload.chartType === "bar" || oPayload.chartType === "stacked_bar") {
				category = oPayload.xCategory;
				parameter = oPayload.yParameter;
			} else {
				category = oPayload.yCategory;
				parameter = oPayload.xParameter;
			}

			if (!category) {
				category = "";
			}

			//if the category or parameter is not group list/user list check the filter parameter in advance filter details
			if (parameter.toLowerCase() !== "userlist" || category.toLowerCase() !== "grouplist" || category.toLowerCase() !==
				"userlist" || parameter.toLowerCase() !== "grouplist" || parameter.toLowerCase() !== "completedon" || category.toLowerCase() !==
				"completedon") {
				var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
				var aAdvancedFilterNames = oAdvanceFilterModel.getProperty("/aAdvancedFilterNames"),
					oSelectedFilter;
				for (var i = 0; i < aAdvancedFilterNames.length; i++) {

					if ((parameter.toLowerCase() === "origin" || category.toLowerCase() === "origin") && aAdvancedFilterNames[i].columnName ===
						"ORIGIN") {
						oSelectedFilter = aAdvancedFilterNames[i];
					} else if ((parameter.toLowerCase() === "processlist" || category.toLowerCase() === "processlist") &&
						aAdvancedFilterNames[i].columnName === "NAME") {
						oSelectedFilter = aAdvancedFilterNames[i];
					} else if ((parameter.toLowerCase() === "status" || category.toLowerCase() === "status") &&
						aAdvancedFilterNames[i].columnName === "STATUS") {
						oSelectedFilter = aAdvancedFilterNames[i];
					} else if ((parameter.toLowerCase() === "createdon" || category.toLowerCase() === "createdon") &&
						aAdvancedFilterNames[i].columnName === "CREATED_AT") {
						oSelectedFilter = aAdvancedFilterNames[i];
					} else if ((parameter.toLowerCase() === "duedate" || category.toLowerCase() === "duedate") &&
						aAdvancedFilterNames[i].columnName === "SLA_DUE_DATES") {
						oSelectedFilter = aAdvancedFilterNames[i];
					} else if ((parameter.toLowerCase() === "createdby" || category.toLowerCase() === "createdby") &&
						aAdvancedFilterNames[i].columnName === "STARTED_BY") {
						oSelectedFilter = aAdvancedFilterNames[i];
					} else if ((parameter.toLowerCase() === "comp_deadline" || category.toLowerCase() === "comp_deadline") &&
						aAdvancedFilterNames[i].columnName === "COMP_DEADLINE") {
						oSelectedFilter = aAdvancedFilterNames[i];
					}

					if (oSelectedFilter) {
						var condition = "in";
						if (aAdvancedFilterNames[i].columnName === "SLA_DUE_DATES" || aAdvancedFilterNames[i].columnName === "CREATED_AT")
							condition = "DateRange";
						filterPayload.filterMap[aAdvancedFilterNames[i].tableAlias + "." + aAdvancedFilterNames[i].columnName] = {
							"operator": "AND",
							"condition": condition,
							"value": "",
							"displayValue": "",
							"upperLimit": "",
							"lowerLimit": "",
							"dataType": oSelectedFilter.datatype,
							"level": oSelectedFilter.tableAlias
						};
						oPayload.filterData = JSON.stringify(filterPayload);
						oSelectedFilter = null;
					}
				}
			}

			//if the category or parameter is group list/user list set the filter map value
			if (parameter.toLowerCase() === "userlist" || category.toLowerCase() === "userlist") {
				filterPayload.filterMap["tw.TASK_OWNER"] = {
					"operator": "AND",
					"condition": "contains",
					"value": "",
					"upperLimit": "",
					"lowerLimit": "",
					"dataType": "STRING",
					"level": "tw"
				};
				oPayload.filterData = JSON.stringify(filterPayload);
			}
			if (category.toLowerCase() === "grouplist" || parameter.toLowerCase() === "grouplist") {
				filterPayload.filterMap["tw.GROUP_ID"] = {
					"operator": "AND",
					"condition": "contains",
					"value": "",
					"upperLimit": "",
					"lowerLimit": "",
					"dataType": "STRING",
					"level": "tw"
				};
				oPayload.filterData = JSON.stringify(filterPayload);
			}
			if (category.toLowerCase() === "completedon" || parameter.toLowerCase() === "completedon") {
				filterPayload.filterMap["te.COMPLETED_AT"] = {
					"operator": "AND",
					"condition": "DateRange",
					"value": "",
					"upperLimit": "",
					"lowerLimit": "",
					"dataType": "DATETYPE",
					"level": "te"
				};
				oPayload.filterData = JSON.stringify(filterPayload);
			}
			return oPayload;
		},

		//function to remove the graph
		deleteGraphConfigfn: function (oEvent, oDefaultDataModel, user) {
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var graphId = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().graphConfigId;
			var url = "/oneappinctureworkbox/WorkboxJavaService/Dashboard/deleteGraph/" + graphId;
			if (user === "admin") {
				url = url + "?type=Admin";
			}
			this.doAjax(url, "GET", null, function (oData) {
				this._showToastMessage(oData.message);
				this.fetchGraphListfn(oDefaultDataModel, user);
				oDefaultDataModel.refresh(true);
				if (this.oAppModel.getProperty("/currentView") === 'dashBoard') {
					sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetCustomGraphList();
				}
			}.bind(this), function (oError) {}.bind(this));
		},

		//function to get the values during Icon tab Switch in graph Config 
		onGraphConfigViewSelect: function (oEvent, oDefaultDataModel) {
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var oView = oEvent.getSource().getSelectedKey();
			this.oAppModel.setProperty("/currentTab", oView);
			if (oView === "manageGraphs") {
				oDefaultDataModel.setProperty("/sequenceApplyButton", false);
			} else {
				this.setGraphConfigData(oDefaultDataModel);
			}
		},

		//function for editing the graph
		onGraphListItemSelect: function (oEvent, oDefaultDataModel, view) {
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var graphId = oDefaultDataModel.getProperty(oEvent.getSource().getSelectedContextPaths()[0]).graphConfigId;
			var url = "/oneappinctureworkbox/WorkboxJavaService/Dashboard/getGraphDetails/" + graphId;
			this.doAjax(url, "GET", null, function (oData) {
				this._showToastMessage(oData.responseMessage.message);
				oDefaultDataModel.setProperty("/graphConfigData", oData.graphConfigurationDo);
				if (view) {
					view.byId("ID_GRAPH_LIST_BAR").setSelectedKey("createGraphs");
				} else {
					sap.ui.getCore().byId("ID_GRAPH_LIST_BAR").setSelectedKey("createGraphs");
				}
				this.oAppModel.setProperty("/currentTab", "createGraphs");
				this.changeFilterItemsFn(false, oDefaultDataModel);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
			oEvent.getSource().removeSelections(true);
		},

		//function to active and disable the graph
		activeGraphfn: function (oEvent, oDefaultDataModel) {
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var data = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			var url = "/oneappinctureworkbox/WorkboxJavaService/Dashboard/updateGraph";
			this.doAjax(url, "POST", data, function (oData) {
				this._showToastMessage(oData.message);
				this.fetchGraphListfn(oDefaultDataModel, user);
				oDefaultDataModel.refresh(true);
				if (this.oAppModel.getProperty("/currentView") === 'dashBoard') {
					sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetCustomGraphList();
				}
			}.bind(this), function (oError) {}.bind(this));
		},

		//on dropping the graph list item the sequence is set
		onDropGraphListItem: function (oInfo, oDefaultDataModel) {
			if (!oDefaultDataModel) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),
				oGrid = oDragged.getParent(),
				oData = oDefaultDataModel.getProperty("/graphListItems"),
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

			for (var i = 0; i < oData.length; i++) {
				oData[i].sequence = i + 1;
			}
			oDefaultDataModel.setProperty("/graphListItems", oData);
			oDefaultDataModel.setProperty("/sequenceApplyButton", true);
		},

		//To save the updated graph list 
		onSaveGraphListSequence: function (oDefaultDataModel) {
			if (oDefaultDataModel.oSource) {
				oDefaultDataModel = this.getModel("oDefaultDataModel");
			}
			var data = oDefaultDataModel.getProperty("/graphListItems");
			var url = "/oneappinctureworkbox/WorkboxJavaService/Dashboard/updateGraphList";
			this.doAjax(url, "POST", data, function (oData) {
				this._showToastMessage(oData.message);
				this.oAppModel.setProperty("/isChanged", false);
				this.oAppModel.refresh(true);
				oDefaultDataModel.setProperty("/sequenceApplyButton", false);
				if (this.oAppModel.getProperty("/currentView") === 'dashBoard') {
					sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetCustomGraphList();
				}
			}.bind(this), function (oError) {}.bind(this));
		},

		//refresh the dashboard
		refreshDashBoardFn: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().createFrag();
			if (this.getModel("oGraphDataModel").getProperty("/graphData")) {
				sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().wbGridRender(true);
			} else {
				sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().wbGridRender(false);
			}
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetDurationData();
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetProcessNames();
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetGraphTiles();
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetActiveTasksGraphData();
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetTaskCompletionGraphData();
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetUserWorkItemGraphData();
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetTaskDonutGraphData();
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().fnGetCustomGraphList();
		},

		addDashboardTile: function (oEvent) {
			if (oEvent) {
				this.clearFilters();
			}
			this.onOpenAdvFilter();
			if (this.oAppModel.getProperty("/currentViewPage") !== "manageDashboardTiles") {
				this.closeManageFilter();
			}
		},
		//  Closes Manage filter fragment
		closeManageFilter: function () {
			if (this._oManageFilter !== undefined && this._oManageFilter.isOpen()) {
				this._oManageFilter.close();
				this.getModel("oAdvanceFilterModel").setProperty("/manageFilterMode", "View");
				this.getModel("oAdvanceFilterModel").setProperty("/manageFilterBusy", false);
				this.getModel("oAdvanceFilterModel").setProperty("/userTiles", []);
				this.oAppModel.setProperty("/ManageFilterActive", false);
				// this.refreshDashBoardFn();
			}
		},
		// apply saved filter
		onSelectSavedFilter: function (oEvent) {
			var sPath = oEvent.getSource()._getBindingContext("oAdvanceFilterModel").getPath();
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var oContext = this.getModel("oAdvanceFilterModel").getProperty(sPath);
			oAdvanceFilterModel.setProperty("/filterName", oContext.filterName);
			oAdvanceFilterModel.setProperty("/isView", oContext.isView);
			oAdvanceFilterModel.setProperty("/viewName", oContext.viewName);
			oAdvanceFilterModel.setProperty("/filterId", oContext.filterId);
			oAdvanceFilterModel.setProperty("/viewAppliedContext", oContext);
			this.setSavedFilterToInbox(oContext.filterData);
		},
		// Common function to apply saved filter to inbox
		// Removes earlier filter applied and calls setSavedFilterToMetaData to remodel filter json and set to metadata
		setSavedFilterToInbox: function (oContext) {
			var that = this;
			if (typeof (oContext) === "string") {
				oContext = JSON.parse(oContext);
			}
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getModel("oTaskInboxModel").setProperty(
				"/enableBusyIndicators", true);

			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			oAdvanceFilterModel.setProperty("/searchInboxType", oContext.inboxType);
			if (!oAdvanceFilterModel.getProperty("/editTileFilter")) {
				// this.oAppModel.setProperty("/currentViewPage", oContext.inboxType);
				this.setCurrentPage(oContext.inboxType, oContext.inboxType, false, false, true);

			}
			if (oContext.inboxName) {
				this.oAppModel.setProperty("/inboxName", oContext.inboxName);
			}
			if (oContext.inboxType === "AdminInbox") {
				var oActionHeader = this.getModel("oActionHeader");
				oActionHeader.setProperty("/selectedItemLength", 0);
				sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().resetActionButtons();
			}
			oAdvanceFilterModel.setProperty("/showAdvancedFilter", true);
			this.oAppModel.setProperty("/filterTokens", []);
			var tokens = this.oAppModel.getProperty("/advFilterTokens");
			if (!tokens || !!tokens.length) {
				tokens = [];
			}
			this.oAppModel.setProperty("/advFilterTokens", tokens);
			var selectedName = oContext.filterMap["pe.NAME"];
			this.clearBasicFilterData();
			var processName = "";
			if (selectedName !== undefined && selectedName.value.split(",").length === 1) {
				processName = selectedName.value.split(",");
				processName = processName[0].substring(1, processName[0].length - 1);
				oContext.selProcessName = processName;
			}
			if (oContext.filterType === "BASIC") {
				this.clearAdvFilterData();
			} else if (oContext.filterType === "ADVANCED") {
				oAdvanceFilterModel.setProperty("/listOfAdvancedFilters", []);
				processName = oContext.selProcessName;
				if (oContext.selProcessName !== "") {
					var oStandardFilterPN = oAdvanceFilterModel.getProperty(oAdvanceFilterModel.getProperty("/processNameIndex"));
					oStandardFilterPN.value = "'" + oContext.selProcessName + "'";
					oStandardFilterPN.selectedKey = [oContext.selProcessName];
					oAdvanceFilterModel.setProperty("/standardFilter/" + oStandardFilterPN.index, oStandardFilterPN);
					oAdvanceFilterModel.setProperty("/aAdvancedFilterNames/" + oStandardFilterPN.aIndex, oStandardFilterPN);
				}
			}

			if (processName !== "") {
				this.getCustomAttributes(processName,
					function () {
						oContext = this;
						that.setSavedFilterToMetaData(oContext);
					}.bind(oContext));

			} else {
				this.setSavedFilterToMetaData(oContext);
			}

		},
		// remodelling Meta data with values from the saved filter
		setSavedFilterToMetaData: function (oContext) {
			var filterMap = jQuery.extend(true, {}, oContext.filterMap);
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var listOfAdvancedFilters = oAdvanceFilterModel.getProperty("/listOfAdvancedFilters");
			var aAdvancedFilterNames = oAdvanceFilterModel.getProperty("/aAdvancedFilterNames");
			var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
			var oStandardFilter;
			// For WORKDAY
			if (Object.keys(filterMap).includes("pe.NAME") && filterMap["pe.NAME"].value.split("'").includes("CFAApproverMatrixChangeProcess")) {
				// if remove process or process object
				if (filterMap["pe.NAME"].value.split("'").length > 3) {
					filterMap["pe.NAME"].value = filterMap["pe.NAME"].value.replace("'CFAApproverMatrixChangeProcess'", '');
					if (filterMap["pe.NAME"].value.charAt(0) === ",") {
						filterMap["pe.NAME"].value = filterMap["pe.NAME"].value.slice(1);
					}
					if (filterMap["pe.NAME"].value.charAt(filterMap["pe.NAME"].value.length - 1) === ',') {
						filterMap["pe.NAME"].value = filterMap["pe.NAME"].value = filterMap["pe.NAME"]
							.value.slice(0, filterMap["pe.NAME"].value.length - 1);
					}
				} else {
					delete filterMap["pe.NAME"];
				}

				// add origin or origin object

				if (!filterMap["te.ORIGIN"]) {
					filterMap["te.ORIGIN"] = {
						"operator": "AND",
						"condition": "in",
						"value": "'Workday'",
						"upperLimit": "",
						"lowerLimit": "",
						"dataType": "STRING",
						"level": "te"
					}
				}
				//if process name is there add workday
				else if (!filterMap["te.ORIGIN"].value.includes("'Workday'")) {
					filterMap["te.ORIGIN"].value = filterMap["te.ORIGIN"].value + ",'Workday'"
				}

			}
			if (oContext.filterType === "BASIC") {
				var templateFilterMap = jQuery.extend(true, {}, filterMap);
				for (var i = 0; i < aAdvancedFilterNames.length; i++) {
					var columnName = aAdvancedFilterNames[i].tableAlias + "." + aAdvancedFilterNames[i].columnName;
					oStandardFilter = oAdvanceFilterModel.getProperty("/standardFilter/" + aAdvancedFilterNames[i].index);
					var temp = jQuery.extend(true, {}, oStandardFilter);
					if (filterMap[columnName] !== undefined) { //If matching object is found
						this.generateSavedFilterMetaData(oStandardFilter, filterMap[columnName], oContext.filterType);
						aAdvancedFilterNames[i] = oStandardFilter;
						oAdvanceFilterModel.setProperty("/standardFilter/" + aAdvancedFilterNames[i].index, oStandardFilter);
						oAdvanceFilterModel.setProperty("/showAdvancedFilter", true);
						templateFilterMap[columnName] = undefined;
					}
				}
				if (filterMap["tw.TASK_OWNER"]) {
					oAdvanceFilterModel.setProperty("/showAdvancedFilter", true);
					var oStandardFilter = {
						aIndex: "",
						columnId: "",
						columnName: "TASK_OWNER",
						index: "",
						label: "Task owner",
						tableAlias: "tw",
						tableName: "TASK_OWNER",
						type: "advanceFilter",
						upperLimit: "",
						filterType: "",
						value: filterMap["tw.TASK_OWNER"].value
					};

					this.generateTokens(oStandardFilter, "tw.TASK_OWNER", "BASIC");
				}
				if (filterMap["tw.GROUP_ID"]) {
					oAdvanceFilterModel.setProperty("/showAdvancedFilter", true);
					var oStandardFilter = {
						aIndex: "",
						columnId: "",
						columnName: "GROUP_ID",
						index: "",
						label: "Group",
						tableAlias: "tw",
						tableName: "GROUP_ID",
						type: "advanceFilter",
						upperLimit: "",
						filterType: "",
						value: oAdvanceFilterModel.getProperty("/selectedGraphGroupId")
					};
					this.generateTokens(oStandardFilter, "tw.GROUP_ID", "BASIC");
					oAdvanceFilterModel.setProperty("/selectedGraphGroupId", null);
				}
				if (filterMap["te.COMPLETED_AT"]) {
					var Time;
					if (filterMap["te.COMPLETED_AT"].lowerLimit.slice(0, 10) === filterMap["te.COMPLETED_AT"].upperLimit.slice(0, 10))
						Time = new Date(filterMap["te.COMPLETED_AT"].upperLimit).toString().slice(4, 15);
					else Time = new Date(filterMap["te.COMPLETED_AT"].lowerLimit).toString().slice(4, 7);

					oAdvanceFilterModel.setProperty("/showAdvancedFilter", true);
					var oStandardFilter = {
						aIndex: "",
						columnId: "",
						columnName: "COMPLETED_AT",
						index: "",
						label: "Completed on",
						tableAlias: "te",
						tableName: "COMPLETED_AT",
						type: "advanceFilter",
						upperLimit: "",
						filterType: "",
						value: Time
					};
					this.generateTokens(oStandardFilter, "te.COMPLETED_AT", "BASIC");
				}
			} else if (oContext.filterType === "ADVANCED") {
				var filterMapKeys = Object.keys(filterMap);
				var allFilters = oAdvanceFilterModel.getProperty("/allFilters");
				for (var j = 0; j < filterMapKeys.length; j++) {
					var index = allFilters.indexOf(filterMapKeys[j]);
					if (index !== -1) { //If matching object is found
						oStandardFilter = oAdvanceFilterModel.getProperty("/standardFilter/" + aAdvancedFilterNames[index].index);
						var temp = jQuery.extend(true, {}, oStandardFilter);
						this.generateSavedFilterMetaData(oStandardFilter, filterMap[filterMapKeys[j]], oContext.filterType);
						oStandardFilter.dropdownList = oAdvanceFilterModel.getProperty("/standardFilter/" + aAdvancedFilterNames[index].index +
							"/dropdownList");
						var templateAdvancedFilters = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty("/templateAdvancedFilters"));
						templateAdvancedFilters.advancedFilter[1].dropdownList = aAdvancedFilterNames;
						templateAdvancedFilters.advancedFilter[1].value = oStandardFilter.columnName;
						// Operator manipulation
						var conditions = filterMap[filterMapKeys[j]].operator.split(" ");
						if (conditions.length === 1) {
							templateAdvancedFilters.advancedFilter[0].value = conditions[0];
							// if (conditions[0]==="AND") {
							templateAdvancedFilters.advancedFilter[2].value = "AND";
						} else if (conditions.length === 2) {
							templateAdvancedFilters.advancedFilter[0].value = conditions[0];
							templateAdvancedFilters.advancedFilter[2].value = conditions[1];
						}
						templateAdvancedFilters.advancedFilter[3] = oStandardFilter;
						listOfAdvancedFilters.push(templateAdvancedFilters);
						selectedFilterNames.push(oStandardFilter.columnName);
						oAdvanceFilterModel.setProperty("/standardFilter/" + aAdvancedFilterNames[index].index, temp);
						oAdvanceFilterModel.setProperty("/showAdvancedFilter", false);
						this.checkRowComplete(j);
					}
				}
			}
			if (listOfAdvancedFilters.length === 0) {
				this.clearAdvFilterData();
			}
			// oContext.filterMap = filterMap
			this.setFilterNameDropdownInFilter();

			if (!oAdvanceFilterModel.getProperty("/editTileFilter")) {
				this.applyAdvancedFilter(oContext);
				this.closeManageFilter();
			}
			oAdvanceFilterModel.setProperty("/editTileFilter", false);
			oAdvanceFilterModel.refresh(true);
		},

		generateSavedFilterMetaData: function (oStandardFilter, oFilterMap, advFilterType) {
			if (oStandardFilter.filterType === "COMBOINPUT") {
				oStandardFilter.selectedKey = oFilterMap.condition;
				oStandardFilter.value = oFilterMap.value;
			} else if (oStandardFilter.filterType === "MULTICOMBOBOX") {
				var keys = [];
				oStandardFilter.value = oFilterMap.value;
				var selectedKey = oFilterMap.value;
				selectedKey = selectedKey.split(",");
				// if (oStandardFilter.dropdownList.length > 0) {
				// 	oStandardFilter.displayValue = oStandardFilter.value;
				// 	for (var j = 0; j < oStandardFilter.dropdownList.length; j++) {
				// 		if (selectedKey.includes("'" + oStandardFilter.dropdownList[j].value + "'")) {
				// 			keys.push(oStandardFilter.dropdownList[j].value);
				// 			oStandardFilter.displayValue.replace("'" + oStandardFilter.dropdownList[j].value + "'", "'" + oStandardFilter.dropdownList[
				// 				j].key + "'");
				// 		}
				// 	}
				// } else {
				// 	for (var j = 0; j < selectedKey.length; j++) {
				// 		keys.push(selectedKey[j].substring(1, selectedKey[j].length - 1));
				// 	}
				// }

				for (var j = 0; j < selectedKey.length; j++) {
					keys.push(selectedKey[j].substring(1, selectedKey[j].length - 1));
				}
				oStandardFilter.displayValue = "";
				if (oFilterMap.displayValue) {
					oStandardFilter.displayValue = oFilterMap.displayValue
				}

				oStandardFilter.selectedKey = keys;
			} else if (oStandardFilter.filterType === "DATEFILTER") {
				oStandardFilter.selectedKey = oFilterMap.condition;
				oFilterMap.condition = "DateRange";
				if (oFilterMap.condition === "Today" || oFilterMap.condition === "Yesterday") {
					// oFilterMap.condition = "contains";
					oStandardFilter.value = this.formatter.wbDateFormatter(new Date(oFilterMap.lowerLimit));
					oStandardFilter.lowerLimit = "";
					oStandardFilter.upperLimit = "";
					this.setDateValueInFilter("/standardFilter/" + oStandardFilter.index);
				} else {
					oStandardFilter.value = "";
					oStandardFilter.lowerLimit = this.formatter.wbDateFormatter(new Date(oFilterMap.lowerLimit));
					oStandardFilter.upperLimit = this.formatter.wbDateFormatter(new Date(oFilterMap.upperLimit));
					if (oStandardFilter.selectedKey !== "DateRange") {
						this.setDateValueInFilter("/standardFilter/" + oStandardFilter.index);
					}
				}
			} else if (oStandardFilter.filterType === "CHECKBOX") {
				oStandardFilter.value = oFilterMap.value;
			} else { //For input type
				oStandardFilter.lowerLimit = "";
				oStandardFilter.upperLimit = "";
				oStandardFilter.value = oFilterMap.value;
			}
			this.generateTokens(oStandardFilter, oFilterMap.level + "." + oStandardFilter.columnName, advFilterType);
		},
		// Toggle from view to edit screen in manage filter
		toggleEditSavedFilters: function (oEvent) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			oAdvanceFilterModel.setProperty("/manageFilterMode", "Edit");
			oAdvanceFilterModel.refresh(true);
		},
		// Discard all changes and Toggle from edit to view screen in manage filter
		discardSavedFilters: function () {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			oAdvanceFilterModel.setProperty("/savedFilters", jQuery.extend(true, [], oAdvanceFilterModel.getProperty("/templateSavedFilters")));
			oAdvanceFilterModel.setProperty("/manageFilterMode", "View");
			oAdvanceFilterModel.refresh(true);
		},
		// <----------------------------------------- END - SEARCH FILTER METHODS---------------------------------------------------------->

		// <------------------------------------ START - CREATE NEW TASK FRAGMENT Methods-------------------------------->

		//navigate to new task page 
		onOpenCreateTaskFragment: function () {
			this.oAppModel.setProperty("/draftEventId", "");
			this.oAppModel.setProperty("/currentView", "CreateTask");
			this._doNavigate("CreateTask", {});
		},

		//validation of new task creation and service call
		onSubmitNewTask: function (oEvent) {
			var oCustomTaskModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getModel(
				"oCustomTaskModel");
			if (oCustomTaskModel.getProperty("/selectedProcess") === "ProjectProposalDocumentApproval") {
				this.onSubmitNewTaskUnilabPoc()
			} else {
				var that = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getController();
				var missingField = taskManagement.validateMandatoryFieldTM("Submit", oCustomTaskModel);

				if (!missingField) {
					if (this.oAppModel.getProperty("/draftEventId")) {
						taskManagement.onCreateTaskTM(that, "SecondSubmit");
					} else {
						taskManagement.onCreateTaskTM(that, "Submit");
					}
				} else if (missingField === true) {
					this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
				}
			}
		},

		//For unilab poc
		onSubmitNewTaskUnilabPoc: function (oEvent) {
			var oCustomTaskModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getModel(
				"oCustomTaskModel");
			var that = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getController();
			var missingField = taskManagement.validateMandatoryFieldTM("Submit", oCustomTaskModel);
			var isBudgetAllowed = true,
				timePeriodAllowed = true,
				startDate, endDate;
			if (!missingField) {
				var costCenterValue = oCustomTaskModel.getProperty("/costCenterValue");
				var remainingBudget = oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes/" + oCustomTaskModel.getProperty(
					"/budgetIndex") + "/value") / costCenterValue.length;
				var templateDto = oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes");
				for (var i = 0; i < templateDto.length; i++) {
					var customAttributeTemplate = templateDto[i].customAttributeTemplateDto;
					for (var j = 0; j < customAttributeTemplate.length; j++) {
						if (isBudgetAllowed && timePeriodAllowed) {
							if (customAttributeTemplate[j].label.includes("Available Budget")) {
								for (var z = 0; z < costCenterValue.length; z++) {
									if (customAttributeTemplate[j].label.includes(costCenterValue[z]) && customAttributeTemplate[j].value < remainingBudget) {
										isBudgetAllowed = false;
									}
								}
							} else if (customAttributeTemplate[j].label.includes("Project Start Date")) {
								startDate = customAttributeTemplate[j].value;
							} else if (customAttributeTemplate[j].label.includes("Project Closure Date")) {
								endDate = customAttributeTemplate[j].value;
							}
						}
					}
					if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
						timePeriodAllowed = false;
						break;
					}
				}
			}
			if (!missingField && isBudgetAllowed && timePeriodAllowed) {
				if (this.oAppModel.getProperty("/draftEventId")) {
					taskManagement.onCreateTaskTM(that, "SecondSubmit");
				} else {
					taskManagement.onCreateTaskTM(that, "Submit");

				}
			} else if (!isBudgetAllowed) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("BUDGET_EXCEEDED_TEXT"));

			} else if (!timePeriodAllowed) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("CLOSURE_DATE_VS_START_DATE_ERR_TEXT"));

			} else if (missingField) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			}
		},

		//saving the instance as draft and validation
		onSaveDraft: function (oEvent) {
			var oCustomTaskModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getModel(
				"oCustomTaskModel");
			var that = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getController();
			var missingField = taskManagement.validateMandatoryFieldTM("Save", oCustomTaskModel);
			if (missingField === false) {
				if (this.oAppModel.getProperty("/draftEventId")) {
					taskManagement.onCreateTaskTM(that, "SecondSave");
				} else {
					taskManagement.onCreateTaskTM(that, "Save");
				}
			} else if (missingField === true) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("DESCRIPTION_MANDATORY_TEXT"));
			}
		},

		//clear all the fields in create instance
		onClickClear: function (oEvent) {
			var warning = this.getView().getModel("i18n").getResourceBundle().getText("DATA_LOSS_ALERT_TEXT");
			var alertmessage = this.getView().getModel("i18n").getResourceBundle().getText("CLEAR_DATA");
			this._createConfirmationMessage(warning, alertmessage, "Warning", "Yes", "No", true, function () {
				var oCustomTaskModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getModel(
					"oCustomTaskModel");
				taskManagement.onClickClearTM(oCustomTaskModel);
			}, function () {});

		},

		//discard the instance
		onClickDiscard: function () {
			var that = this;
			var warning = this.getView().getModel("i18n").getResourceBundle().getText("DISCARD_ALERT_TEXT");
			var alertmessage = this.getView().getModel("i18n").getResourceBundle().getText("ALERT_TEXT");
			var oCustomTaskModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getModel(
				"oCustomTaskModel");
			var oData = oCustomTaskModel.getProperty("/customProcessNames");
			this._createConfirmationMessage(warning, alertmessage, "Warning", "Yes", "No", true,
				function (discardChange) {
					var customTask = {
						"customProcessNames": oData,
						"selectedProcess": "",
						"enableVBoxContent": false,
						"singleInstance": false,
						"multipleInstance": false
					};
					oCustomTaskModel.setData(customTask);
					oCustomTaskModel.refresh(true);
					if (that.oAppModel.getProperty("/currentViewPage") === "Draft") {
						that.setCurrentPage("Draft", "Draft", "Draft", true, true);
					} else if (that.oAppModel.getProperty("/currentViewPage") === "CreatedTasks") {
						that.setCurrentPage("CreatedTasks", "CreatedTasks", "Created Tasks", true, true);
					}
					that._doNavigate("UnifiedInbox", {});
				},
				function (clearTabPress) {});
		},

		//function to delete all the selected drafts in inbox
		bulkDeleteDraft: function () {
			var that = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.UnifiedInbox").getController();
			var selectedItems;
			var requestIds = [];
			if (this.oAppModel.getProperty("/WB_CARD_VIEW")) {
				selectedItems = that.getView().byId("WB_TASK_CARD_ITEM").getSelectedContextPaths();
			} else {
				selectedItems = that.getView().byId("ID_TASK_TABLE").getSelectedIndices();
				for (var i = 0; i < selectedItems.length; i++) {
					selectedItems[i] = "/workBoxDtos/" + selectedItems[i];
				}
			}
			for (var i = 0; i < selectedItems.length; i++) {
				var obj = {
					"processId": that.getModel("oTaskInboxModel").getProperty(selectedItems[i] + "/processId"),
					"requestId": that.getModel("oTaskInboxModel").getProperty(selectedItems[i] + "/requestId")
				};
				requestIds.push(obj);
			}
			for (var i = 0; i < requestIds.length; i++) {
				var url = "/oneappinctureworkbox/WorkboxJavaService/tasks/deleteDraft/" + requestIds[i].processId + "/" + requestIds[i].requestId;
				this.doAjax(url, "GET", null, function (oData) {
					this._showToastMessage(oData.message);
					that.onClickFilterDetail();
					this.oAppModel.setProperty("/enableBulkDeleteButton", false);
					this.setInboxPanel();
				}.bind(this), function (oError) {}.bind(this));
			}
		},

		//closing the new task creation page and resetting the properties
		onCloseCreateTaskFn: function () {
			var oAppModel = this.oAppModel;
			var currentTab = oAppModel.getProperty("/currentViewPage");
			var currentView = oAppModel.getProperty("/currentView");
			if ((currentTab === "emailTemplate") && (currentView === "adminConsole")) {
				oAppModel.setProperty("/emailTemplatelistVisible", true);
				oAppModel.setProperty("/emailTemplateVisible", false);
				oAppModel.refresh(true);
			} else {
				var oCustomTaskModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getModel(
					"oCustomTaskModel");
				var oData = oCustomTaskModel.getProperty("/customProcessNames");
				var customTask = {
					"customProcessNames": oData,
					"selectedProcess": "",
					"enableVBoxContent": false,
					"singleInstance": false,
					"multipleInstance": false
				};
				oCustomTaskModel.setData(customTask);
				oCustomTaskModel.refresh(true);
				if (this.oAppModel.getProperty("/currentViewPage") === "Draft") {
					this.setCurrentPage("Draft", "Draft", "Draft", true, true);
				} else if (this.oAppModel.getProperty("/currentViewPage") === "CreatedTasks") {
					this.setCurrentPage("CreatedTasks", "CreatedTasks", "Created Tasks", true, true);
				}
				this._doNavigate("UnifiedInbox", {});
			}
		},

		//On Upload of excel file from excel uploader
		uploadInstaceExcel: function (oEvent) {
			taskManagement.uploadInstaceExcelTM(this, oEvent, ExtDatePicker, sap.ui.core.UIComponent.getRouterFor(this).getView(
				"oneapp.incture.workbox.view.CreateTask").getModel(
				"oCustomTaskModel"));
		},
		uploadInstaceExcelCustom: function (oEvent) {
			var oCustomTaskModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.CreateTask").getModel(
				"oCustomTaskModel");
			this.setModel(oCustomTaskModel, "oCustomTaskModel");
			taskManagement.uploadInstaceExcelCustomTM(this, oEvent, ExtDatePicker, oCustomTaskModel);
		},
		// <------------------------------------ END - CREATE NEW TASK FRAGMENT Methods-------------------------------->

		// <------------------------------------ START - ACTION HEADER Methods-------------------------------->
		onAfterRendering: function () {
			var oAppModel = this.getModel("oAppModel");
			this.renderActionButtons();
			var i18n = this.getOwner().getModel("i18n").getResourceBundle();
			var oUserWorkLoadSortData = new JSONModel();
			this.setModel(oUserWorkLoadSortData, "oUserWorkLoadSortData");
			this.getProcessNameFunc();
			this.getView().setModel(new JSONModel(), "oConstantsModel");
			this.getCommonServicesFn();
		},

		renderActionButtons: function () {
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var dtoDefault = [{
				"key": "Forward",
				"name": i18n.getText("FORWARD_TEXT"),
				"enabled": false,
				"visible": false,
				"icon": "sap-icon://customfont/Forward"
            },
            //change visible true to false to key View to remove the view icon by Siva
            //Date: 08/09/2021
            {
				"key": "View",
				"name": i18n.getText("VIEW_TEXT"),
				"enabled": false,
				"visible": false,
				"icon": "sap-icon://customfont/Eye"
            },
             {
				"key": "Claim",
				"name": "Claim/Release",
				"visible": true,
				"enabled": false,
				"icon": "sap-icon://customfont/Claim"
            }];
            //i18n.getText("CLAIM_TEXT")

			var dtoMore = [];

			var oActionHeader = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oActionHeader, "oActionHeader");
			//var oActionHeader = this.getModel("oActionHeader");
			oActionHeader.setProperty("/dtoDefault", dtoDefault);
			oActionHeader.setProperty("/dtoMore", dtoMore);
			oActionHeader.setProperty("/dtoDefaultCopy", JSON.parse(JSON.stringify(dtoDefault)));
			oActionHeader.setProperty("/dtoMoreCopy", JSON.parse(JSON.stringify(dtoMore)));
			oActionHeader.setProperty("/prevStatus", ""); // this is set to avoid buttons related to two different tasks coming up.
			oActionHeader.setProperty("/prevOrigin", ""); // this is set to avoid buttons related to two different tasks coming up.
			oActionHeader.setProperty("/enableMore", false);
			this.oAppModel.setProperty("/enableBulkDeleteButton", false);
		},

		onActionPress: function (oEvent) {
			var that = this;
			var selectedActionText = oEvent.getSource().getText();
			var selectedAction = oEvent.getSource().getCustomData()[0].getKey();
			if (selectedAction === "Resubmit") {
				sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.TaskDetail").getController().resubmitFn();
			} else if (selectedAction !== 'Sign' && selectedAction !== "Resubmit") {
				workbox.wbSubheaderActionClicked(that, selectedAction, selectedActionText);
			} else {
				this.oAppModel.setProperty("/taskObjectDetails", this.oAppModel.getProperty("/selectedTasksArray/0"));
				sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().checkNewTaskDetailTab();
			}

		},

		/*End - Substitution related functions*/
		onMoreActionsClick: function (oEvent) {
			var oActionHeader = this.getModel("oActionHeader");
			var oSource = oEvent.getSource();
			if (!this._moreActions) {
				this._moreActions = this._createFragment("oneapp.incture.workbox.fragment.MoreActions", this);
				this.getView().addDependent(this._moreActions);
			}
			this._moreActions.setModel(oActionHeader, "oActionHeader");
			//	this.oAppModel.setProperty("/rightClickClaim", )
			this._moreActions.openBy(oSource);
		},

		// <------------------------------------ END - ACTION HEADER Methods-------------------------------->
		getProcessNameFunc: function () { //func to get all the process
			var oUserWorkLoadData = new JSONModel();
			this.getView().setModel(oUserWorkLoadData, "oUserWorkLoadData");
			var url = "/oneappinctureworkbox/WorkboxJavaService/heatMap/getSearchList";
			this.doAjax(url, "GET", null, function (oData) {
				oUserWorkLoadData.setProperty("/processNames", oData.procList);
				oUserWorkLoadData.setProperty("/selectedProcess", oData.procList[0].value); // setting the default data as 1st process in  dropdown
				oUserWorkLoadData.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		UWLprocessSelect: function (oEvent) {
			var selectedProcess = oEvent.getSource().getSelectedKey();
			var processText = oEvent.getSource().getSelectedItem().getText();
			var oAppModel = this.getModel("oAppModel");
			oAppModel.setProperty("/UWLProcessSelected", selectedProcess);
			oAppModel.setProperty("/UWLProcessSelectedProcess", processText);
			oAppModel.refresh(true);
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UserWorkLoad').getController().fnUserData();
		},

		onSortingUser: function (oEvent) {
			var selectedSortType = oEvent.getSource().getSelectedKey();
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UserWorkLoad').getController().onSortingUser(
				selectedSortType);
		},
		// <------------------------------------ START - SETTINGS Methods----------------------------------->

		openSettings: function (oEvent) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var that = this;
			if (!this._oSettings) {
				this._oSettings = this._createFragment("oneapp.incture.workbox.fragment.Settings", this);
				this.getView().addDependent(this._oSettings);
				this._oSettings.open();
				var oSubsParams = this.oLocalModel.getProperty("/oSubsParams");
				oSubsParams.createdByDisp = this.oAppModel.getProperty("/loggedInUserDetails/userFirstName") + " " + this.oAppModel.getProperty(
					"/loggedInUserDetails/userLastName");
				oSubsParams.createdBy = this.oAppModel.getProperty("/loggedInUserDetails/userId");
				oUserSettingsModel.setProperty("/settings/substitutionSettings/oSubsParams", oSubsParams);
				oUserSettingsModel.setProperty("/settings/substitutionSettings/templateSubsParams", jQuery.extend(true, {}, oSubsParams));
				oUserSettingsModel.setProperty("/settings/substitutionSettings/minDate", new Date());

				var scrollHeight = sap.ui.Device.resize.height - 492 + "px";
				oUserSettingsModel.setProperty(
					"/settings/substitutionSettings/mySubsScrollHeight", scrollHeight);
				oUserSettingsModel.setProperty(
					"/settings/substitutionSettings/iAmSubsScrollHeight", sap.ui.Device.resize.height - 516 + "px");
				oUserSettingsModel.setProperty(
					"/settings/substitutionSettings/manageSubsScrollHeight", sap.ui.Device.resize.height - 290 + "px");
				this._oSettings.setEscapeHandler(function (o) {
					o.reject();
				});
				this.getNoticationChannels();
				this.getNotifEventsDetails()

			} else {
				this._oSettings.open();
			}
			if (this.oAppModel.getProperty("/currentView") === "adminConsole" && this.oAppModel.getProperty("/currentViewPage") ===
				"manageNotifiifcationSetting") {
				oUserSettingsModel.setProperty("/settings/notification/isFragOpenInAD", true);
				oUserSettingsModel.setProperty("/settings/selectedSetting", oUserSettingsModel.getProperty(
					"/settings/settingsNavigationList/0/key"));
			}
		},
		getNoticationChannels: function () {
			var url = "/oneappinctureworkbox/WorkboxJavaService/customProcess/getDropDownValues/Notification%20Channels";
			this.doAjax(url, "GET", null, function (oData) {
				var aNotificationChannels = [];
				oData.values.forEach(function (item, index) {
					aNotificationChannels.push(item.value)
				});

				this.getModel("oConstantsModel").setProperty("/aNotificationChannels", aNotificationChannels);
				oData.values.push({
					value: "None",
					valueName: "None",
					isEdited: 0
				})
				this.getModel("oConstantsModel").setProperty("/notificationChannels", oData.values);
			}.bind(this), function (event) {}.bind(this));
		},
		closeSettings: function (oEvent) {
			var oAppModel = this.oAppModel;
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var bsettingsChanged = oUserSettingsModel.getProperty("/settings/settingsChanged");
			var blanguageChanged = oAppModel.getProperty("/languageChanged"),
				notificationEventChanged = oUserSettingsModel.getProperty("/settings/notification/notificationEventChanged"),
				notificationSettingsChanged = oUserSettingsModel.getProperty("/settings/notification/notificationSettingsChanged"),
				newEventAdded = oUserSettingsModel.getProperty("/settings/notification/newEventAdded"),
				eventsDeleted = oUserSettingsModel.getProperty("/settings/notification/eventsDeleted");
			if (notificationSettingsChanged || notificationEventChanged || newEventAdded || eventsDeleted) {
				bsettingsChanged = true;
			}
			var close = function () {
				if (oAppModel.getProperty("/currentView") === "unifiedInbox") {
					if (oAppModel.getProperty("/currentViewPage") === "SubstitutionInbox" || this.getModel("oAdvanceFilterModel").getProperty(
							"/searchInboxType") === "SubstitutionInbox") {
						sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().onClickFilterDetail();
					}
					this.setInboxPanel();
				}
				this._oSettings.close();
				oUserSettingsModel.setProperty("/settings/selectedSetting", oUserSettingsModel.getProperty(
					"/settings/settingsNavigationList/0/key"));
				if (oUserSettingsModel.setProperty("/settings/refreshSettings")) {
					oUserSettingsModel.setProperty("/settings/refreshSettings", false);
					this.getStandardSettings();
				}
				if (this.oAppModel.getProperty("/currentView") === "adminConsole" && this.oAppModel.getProperty("/currentViewPage") ===
					"manageNotifiifcationSetting") {
					oUserSettingsModel.setProperty("/settings/notification/isFragOpenInAD", false);
					oUserSettingsModel.setProperty("/settings/settingView", "GENERAL");
					oUserSettingsModel.setProperty("/settings/notifSelectedTab", "GENERAL");
					oUserSettingsModel.setProperty("/settings/settingsNav", []);
					this.loadNotification();
					oUserSettingsModel.setProperty("/settings/selectedSetting", "SETTINGS_ADMIN_NOTIFICATIONS");
				}
			}.bind(this);
			if (bsettingsChanged || blanguageChanged) {
				var warning = i18n.getText("SETTINGS_NOT_SAVED_ERR_MSG");
				var alertmessage = i18n.getText("ALERT_TEXT");
				this._createConfirmationMessage(warning, alertmessage, "Warning", i18n.getText("YES_TEXT"), i18n.getText("NO_TEXT"), true,
					function (discardChange) {
						var savedTheme = oUserSettingsModel.getProperty("/settings/themeSettings/savedTheme");
						oUserSettingsModel.setProperty("/settings/themeSettings/selectedTheme", jQuery.extend(true, {}, savedTheme));
						this.saveGeneralSettings(false);
						close();
						this.oAppModel.getProperty("/languageChanged", false);
						var currentLang = oAppModel.getProperty("/currentLanguage");
						sap.ui.getCore().getConfiguration().setLanguage(currentLang);
						oAppModel.setProperty("/selectedLanguage", currentLang);
						this.selectedLangText(currentLang);
						var notificationEventChanged = oUserSettingsModel.getProperty("/settings/notification/notificationEventChanged"),
							notificationSettingsChanged = oUserSettingsModel.getProperty("/settings/notification/notificationSettingsChanged");
						// if (notificationEventChanged || notificationSettingsChanged) {
						// 	this.saveNotificationSettings();
						// }
					},
					function (clearTabPress) {});

			} else {
				close();
				this.oAppModel.getProperty("/languageChanged", false);
			}

		},
		selectSetttings: function (oEvent) {
			var path = oEvent.getSource()._getBindingContext("oUserSettingsModel").getPath();
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var selectedKey = oUserSettingsModel.getProperty(path + "/key");
			/*if (selectedKey === "SETTINGS_SUBSTITUTION") {
				selectedKey = oUserSettingsModel.getProperty(path + "/list/0/key");
			}*/
			/*if (selectedKey === "SETTINGS_MYSUBS") {
				this.loadSubstitutionData("mySubs");
				this.loadSubstitutionData("iAmSubs");
			}
			if (selectedKey === "SETTINGS_MANAGESUBS") {
				this.loadSubstitutionData("allSubs");
			}*/

			if (selectedKey === "SETTINGS_MYSUBS" || selectedKey === "SETTINGS_SUBSTITUTION") {
				this.loadSubstitutionData("mySubs");
			}
			if (selectedKey === "SETTINGS_NOTIFICATIONS" || selectedKey === "SETTINGS_ADMIN_NOTIFICATIONS") {
				oUserSettingsModel.setProperty("/settings/settingView", "GENERAL");
				oUserSettingsModel.setProperty("/settings/notifSelectedTab", "GENERAL");
				oUserSettingsModel.setProperty("/settings/settingsNav", []);
				this.loadNotification();
			}
			if (selectedKey === "SETTINGS_VERSIONCONTROL") {
				this.getAllVersions();
			}
			oUserSettingsModel.setProperty("/settings/selectedSetting", selectedKey);
		},
		// -------------------------------------------- START - GENERAL SETTINGS  METHODS---------------------------

		selectTheme: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContextPath("oUserSettingsModel");
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var oSelectedTheme = oUserSettingsModel.getProperty(sPath);

			oUserSettingsModel.setProperty("/settings/themeSettings/selectedTheme", oSelectedTheme);
			oUserSettingsModel.setProperty("/settings/settingsChanged", true);
			if (oUserSettingsModel.getProperty("/settings/themeSettings/savedTheme/label") === oSelectedTheme.label) {
				oUserSettingsModel.setProperty("/settings/settingsChanged", false);
			}
			document.documentElement.style.setProperty("--root-color", oSelectedTheme.rootColor);
			oUserSettingsModel.refresh(true);
		},
		saveGeneralSettings: function (oEvent) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var oSelectedTheme = oUserSettingsModel.getProperty("/settings/themeSettings/selectedTheme");
			oUserSettingsModel.setProperty("/settings/themeSettings/savedTheme", oSelectedTheme);
			oUserSettingsModel.setProperty("/settings/settingsChanged", false);
			document.documentElement.style.setProperty("--root-color", oSelectedTheme.rootColor);
			this.oAppModel.setProperty("/loggedInUserDetails/theme", oSelectedTheme.rootColor);
			if (oEvent) {
				var payload = {
					"theme": oSelectedTheme.rootColor,
					"language": this.oAppModel.getProperty("/selectedLanguage")
				};
				this.doAjax("/oneappinctureworkbox/WorkboxJavaService/idpMapping/updateUserDetail", "POST", payload, function (oData) {
					this._showToastMessage(oData.message);
					var languageChanged = this.oAppModel.getProperty("/languageChanged");
					if (languageChanged) {
						var myLocation = window.location;
						myLocation.reload();
					}
					this.oAppModel.refresh(true);
				}.bind(this), function (oEvent) {}.bind(this));
			}
			this.oAppModel.refresh(true);
		},
		// -------------------------------------------- END - GENERAL SETTINGS  METHODS---------------------------

		// --------------------------------------------START - SUBSTITUTION METHODS---------------------------
		/*Function to call the services for data load*/
		loadSubstitutionData: function (property) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			this.backToSubsScreen();
			var url = "";
			var payload = null;
			var serviceType = "GET";
			var userId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataText" + property, false);

			oUserSettingsModel.setProperty("/settings/busy", true);
			if (property === "mySubs") {
				url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/substituting";
			}
			if (property === "iAmSubs") {
				url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/substituted";
			}
			if (property === "allSubs") {
				serviceType = "POST";
				payload = {};
				url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/getRules";
			}
			this.doAjax(url, serviceType, payload, function (oData) {
				oUserSettingsModel.setProperty("/settings/substitutionSettings/" + property, {});
				oUserSettingsModel.setProperty("/settings/substitutionSettings/" + property, oData);
				oUserSettingsModel.setProperty("/settings/substitutionSettings/temp" + property, jQuery.extend(true, {}, oData));
				if (property === "mySubs") {
					oUserSettingsModel.setProperty("/substitutionDto", oUserSettingsModel.getProperty(
						"/settings/substitutionSettings/mySubs/dtoList"));
				} else if (property === "iAmSubs") {
					oUserSettingsModel.setProperty("/substitutionDto", oUserSettingsModel.getProperty(
						"/settings/substitutionSettings/iAmSubs/dtoList"));
				}
				if (oData.dtoList !== null) {
					if (oData.dtoList.length > 0) {
						oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataText" + property, false);
					} else {
						oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataText" + property, true);
					}
				} else {
					oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataText" + property, true);
				}
				oUserSettingsModel.setProperty("/settings/substitutionSettings/addRow", true);
				oUserSettingsModel.setProperty("/settings/busy", false);
				oUserSettingsModel.refresh(true);
			}.bind(this), function (oEvent) {}.bind(this));
		},

		addSubstituteFnCall: function (oEvent) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var templateSubsParams = jQuery.extend(true, {}, oUserSettingsModel.getProperty(
				"/settings/substitutionSettings/templateSubsParams"));
			var selectedKey = oUserSettingsModel.getProperty("/settings/selectedSetting");
			var subsList;
			if (selectedKey === "SETTINGS_MYSUBS") {
				subsList = oUserSettingsModel.getProperty("/settings/substitutionSettings/mySubs");
				templateSubsParams.substitutedUser = this.oAppModel.getProperty("/loggedInUserDetails/userId");
				templateSubsParams.substitutedUserName = this.oAppModel.getProperty("/loggedInUserDetails/userFirstName") + " " + this.oAppModel
					.getProperty(
						"/loggedInUserDetails/userLastName");
				oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataTextmySubs", false);
			} else { //selectedKey === "SETTINGS_MANAGESUBS"
				subsList = oUserSettingsModel.getProperty("/settings/substitutionSettings/allSubs");
				oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataTextallSubs", false);
			}
			if (subsList && subsList.dtoList === null) {
				subsList.dtoList = [];
			}
			//changed by vaishnavi for mylan poc
			templateSubsParams.active = false;
			//
			subsList.dtoList.push(templateSubsParams);
			oUserSettingsModel.setProperty("/settings/substitutionSettings/addRow", false);
			oUserSettingsModel.refresh(true);
		},
		/*Function called for both create and update substitute*/
		onUpdateSubstitute: function (property, oEvent) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var url, flag = true;
			var sPath = oEvent.getSource().getParent()._getBindingContext("oUserSettingsModel").getPath();
			var oSubsParams = oUserSettingsModel.getProperty(sPath);
			if (property === "Discard") {
				this.discardChanges(property, oSubsParams, sPath);
			} else {
				var rSuccess = function (oSubsParams, url) {
					oSubsParams.startDate = new Date(oSubsParams.startDate);
					oSubsParams.startDate = oSubsParams.startDate.getFullYear() + "-" + ("0" + (oSubsParams.startDate.getMonth() + 1)).slice(-2) +
						"-" + ("0" + oSubsParams.startDate.getDate()).slice(-2) + "T00:00:00";
					oSubsParams.endDate = new Date(oSubsParams.endDate);
					oSubsParams.endDate = oSubsParams.endDate.getFullYear() + "-" + ("0" + (oSubsParams.endDate.getMonth() + 1)).slice(-2) +
						"-" + ("0" + oSubsParams.endDate.getDate()).slice(-2) + "T23:59:59";
					this.doAjax(url, "POST", oSubsParams, function (oData) {
						this._showToastMessage(oData.message);
						if (oUserSettingsModel.getProperty("/settings/selectedSetting") === "SETTINGS_MANAGESUBS") {
							this.loadSubstitutionData("allSubs");
						} else {
							this.loadSubstitutionData("mySubs");

						}
						oUserSettingsModel.refresh(true);
					}.bind(this), function (oEvent) {}.bind(this));
				}.bind(this);

				oSubsParams.substitutedUserName.trim();
				oSubsParams.substitutingUserName.trim();
				// Null field validation
				if (!oSubsParams.substitutedUserName || !oSubsParams.substitutingUserName || !oSubsParams.substitutedUser ||
					!oSubsParams.substitutingUser || !oSubsParams.endDate || !oSubsParams.endDate) {
					flag = false;
					if (!oSubsParams.substitutedUser || !oSubsParams.substitutedUserName) {
						oSubsParams.substitutedUserName = "";
						oSubsParams.substitutedUser = "";
					}
					if (!oSubsParams.substitutingUser || !oSubsParams.substitutingUserName) {
						oSubsParams.substitutingUser = "";
						oSubsParams.substitutingUserName = "";
					}
					oUserSettingsModel.refresh(true);
					this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
					return;
				}
				if (oSubsParams.processList === null || oSubsParams.processList.length === 0) {
					oSubsParams.processList = ["ALL"];
				}

				if (flag === true) {
					delete oSubsParams.isVisible;
					delete oSubsParams.isEdited;
					if (property === "Create") {
						url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/create";
						rSuccess(oSubsParams, url);

					} else if (property === "Update") {
						url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/update";
						rSuccess(oSubsParams, url);
					} else {
						url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/delete";
						var i18n = this.getView().getModel("i18n").getResourceBundle();
						var warning = i18n.getText("WARNING_TEXT");
						var alertmessage = i18n.getText("DELETE_CAUTION_TEXT");
						this._createConfirmationMessage(warning, alertmessage, "Warning", i18n.getText("YES_TEXT"), i18n.getText("NO_TEXT"), true,
							function (success) {
								rSuccess(oSubsParams, url);
							},
							function (failure) {});
					}

				}
			}
		},
		/*handleSubstitutionSuggests: function (oEvent, userType) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var sTerm = oEvent.getParameter("suggestValue");

			var sPath = oEvent.getSource().getParent()._getBindingContext("oUserSettingsModel").getPath();
			if (!userType) {
				userType = "substitutedUser";
			}
			var sUserId = oUserSettingsModel.getProperty(sPath + "/" + userType);
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("userId", sap.ui.model.FilterOperator.NE, sUserId));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			oEvent.getSource().setValue(sTerm);
			var oSubsParams = oUserSettingsModel.getProperty(sPath);
			oSubsParams.isEdited = true;

		},*/
		discardChanges: function (property, oSubsParams, sPath) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			if (property && !oSubsParams && !sPath) {
				this.loadSubstitutionData(property);
			} else {
				var temp = sPath.split("/");
				// discard new row
				if (oSubsParams.isVisible) {
					var row = temp.pop();
					temp = temp.join("/");
					var dtolist = oUserSettingsModel.getProperty(temp);
					dtolist.splice(row, 1);
					oUserSettingsModel.setProperty("/settings/substitutionSettings/addRow", true);
				} else {
					temp[3] = "temp" + temp[3];
					temp = temp.join("/");
					var tempParams = jQuery.extend(true, {}, oUserSettingsModel.getProperty(temp));
					oUserSettingsModel.setProperty(sPath, tempParams);
				}
			}
		},
		isSubsEdited: function (oEvent, property) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			//var sPath = oEvent.getSource().getParent()._getBindingContext("oUserSettingsModel").getPath();
			//var oSubsParams = oUserSettingsModel.getProperty(sPath);
			if (property) {
				/*	oSubsParams.isEdited = true;
					if (property === "DateRange") {
						oUserSettingsModel.setProperty(sPath + "/startDate", oEvent.getParameter("from"));
						oUserSettingsModel.setProperty(sPath + "/endDate", oEvent.getParameter("to"));

					}*/
				if (property === "ProcessFilter") {
					// if all is selected remove rest of the selections
					var selectedKeys = oEvent.getSource().getSelectedKeys();
					var allKeys = oEvent.getSource().getKeys();
					if (selectedKeys.length === 0 || selectedKeys.includes("ALL")) {
						if (selectedKeys[selectedKeys.length - 1] === "ALL") {
							oEvent.getSource().setSelectedKeys(["ALL"]);
						} else {
							selectedKeys.splice(selectedKeys.indexOf("ALL"), 1);
							oEvent.getSource().setSelectedKeys(selectedKeys);
						}
					}
					if ((selectedKeys.length + 1 === allKeys.length) && !selectedKeys.includes("ALL")) {
						oEvent.getSource().setSelectedKeys(["ALL"]);
					}
				}
				if (property === "IsActive") {
					oUserSettingsModel.setProperty(sPath + "/active", !oSubsParams.active);

				}
				oUserSettingsModel.refresh(true);
			}

		},

		//---------------New Substitution methods-Start ---------
		addSubstitute_old: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/isSubstitutionList", false);
			oUserSettingsModel.setProperty("/addNewSub", true);
			oUserSettingsModel.setProperty("/backToSubScreen", false);
			/*	oUserSettingsModel.getProperty("/updateSubs", false);*/
			oUserSettingsModel.setProperty("/updateSubs", false);
			oUserSettingsModel.setProperty("/addSubstituteDto", {
				"processList": []
			});
			var addSubstituteDto = oUserSettingsModel.getProperty("/addSubstituteDto");
			addSubstituteDto.active = "true";
			addSubstituteDto.createdBy = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			addSubstituteDto.createdByDisp = this.oAppModel.getProperty("/loggedInUserName");
			addSubstituteDto.disableButton = "true";
			addSubstituteDto.enabled = "true";
			addSubstituteDto.onBehalfOf = "";
			addSubstituteDto.startDate = "";
			addSubstituteDto.endDate = "";
			addSubstituteDto.substitutingUserName = "";
			addSubstituteDto.substitutingUser = "";
			addSubstituteDto.substitutedUser = this.oAppModel.getProperty("/loggedInUserDetails/userId")
			addSubstituteDto.substitutedUserName = this.oAppModel.getProperty("/loggedInUserName");
			//addSubstituteDto.substitutingUser = this.oAppModel.getProperty("/loggedInUserName");
			oUserSettingsModel.setProperty("/addSubstituteDto/startDate", "");
			oUserSettingsModel.setProperty("/addSubstituteDto/endDate", "");

		},

		updateSubsBtnClick: function (oEvent, clickedOn) {
			//this.editSubstitution();
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var addSubstituteDto = oUserSettingsModel.getProperty("/addSubstituteDto");
			if (!addSubstituteDto) {
				oUserSettingsModel.setProperty("/addSubstituteDto", {});
			}
			oUserSettingsModel.setProperty("/updateSubs", true);
			/*	oUserSettingsModel.getProperty("/updateSubs", true);*/
			var sPath = oEvent.getParameters().id.split("-")[2];
			//Payload for update
			var substitutionDto = oUserSettingsModel.getData().substitutionDto;
			addSubstituteDto.version = substitutionDto[sPath].version;
			addSubstituteDto.substitutedUser = substitutionDto[sPath].substitutedUser;
			addSubstituteDto.substitutedUserName = substitutionDto[sPath].substitutedUserName;
			addSubstituteDto.substitutingUser = substitutionDto[sPath].substitutingUser;
			addSubstituteDto.substitutingUserName = substitutionDto[sPath].substitutingUserName;
			addSubstituteDto.createdBy = substitutionDto[sPath].createdBy;
			addSubstituteDto.createdByDisp = substitutionDto[sPath].createdByDisp;
			addSubstituteDto.processList = substitutionDto[sPath].processList;
			addSubstituteDto.disableButton = substitutionDto[sPath].disableButton;
			addSubstituteDto.createdAt = substitutionDto[sPath].createdAt;
			addSubstituteDto.startDate = substitutionDto[sPath].startDate;
			addSubstituteDto.endDate = substitutionDto[sPath].endDate;
			addSubstituteDto.modifiedAt = null
			addSubstituteDto.processStatusMap = null;
			addSubstituteDto.active = substitutionDto[sPath].active;
			addSubstituteDto.enabled = substitutionDto[sPath].enabled;
			addSubstituteDto.validForUsage = substitutionDto[sPath].validForUsage;
			addSubstituteDto.ruleId = substitutionDto[sPath].ruleId;
			addSubstituteDto.changeActive = false;
			//to navigate to Update screen
			if (clickedOn === "switch") {
				var state = oEvent.getParameters().state;
				addSubstituteDto.changeActive = true;
				if (state) {
					addSubstituteDto.active = true;
				} else {
					addSubstituteDto.active = false;
				}
				oUserSettingsModel.refresh();
				this.saveSubstitution();
			} else {
				addSubstituteDto.active = true;
				oUserSettingsModel.setProperty("/addNewSub", true);
				oUserSettingsModel.setProperty("/backToSubScreen", false);
				oUserSettingsModel.refresh();
			}

		},

		backToSubsScreen: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/addNewSub", false);
			oUserSettingsModel.setProperty("/backToSubScreen", true);
			oUserSettingsModel.refresh();
			//this.loadSubstitutionData("mySubs");
		},

		substitutionITBSelect: function (oEvent) {
            var selectedKey = oEvent.getParameters().selectedKey;
            var oUserSubstitutionModel = new JSONModel(oUserSubstitutionModel);
            this.setModel(oUserSubstitutionModel, "oUserSubstitutionModel");
			var oUserSettingsModel = this.getView().getModel("oUserSettingsModel");
			oUserSubstitutionModel.setProperty("/selectedSubstitution", selectedKey);
			if (selectedKey === "MySubstitutes") {
				this.loadSubstitutionData("mySubs");
			} else if (selectedKey === "ImSubstituting") {
				this.loadSubstitutionData("iAmSubs");
			}
		},

		substitutionSuggestionItemSelect: function (oEvent) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var selectedItem = oEvent.getParameters().selectedItem.getText();
			var selectedKey = oEvent.getParameters().selectedItem.getKey();
			var createdUser = oUserSettingsModel.getProperty("/addSubstituteDto").substitutedUser;
			if (createdUser === selectedKey) {
				this._showToastMessage("Can't substitute same loggedin user");
				oUserSettingsModel.setProperty("/addSubstituteDto/substitutingUserName", null);
			} else {
				oUserSettingsModel.setProperty("/addSubstituteDto/substitutingUserName", selectedItem);
				oUserSettingsModel.setProperty("/addSubstituteDto/substitutingUser", selectedKey);
				oUserSettingsModel.refresh();
			}
		},

		subsProcessSelection: function (oEvent) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var selectedItem = oEvent.getParameters().changedItem.getKey();
			var selected = oEvent.getParameters().selected;
			var allItems = oEvent.getSource().getItems();
			if (selected) {
				if (selectedItem === "ALL") {
					for (var i = 1; i < allItems.length; i++) {
						oEvent.getSource().getItems()[i].setEnabled(false);
					}
				}
			} else {
				if (selectedItem === "ALL") {
					for (var i = 1; i < allItems.length; i++) {
						oEvent.getSource().getItems()[i].setEnabled(true);
					}
				}
			}
		},

		deleteSubstitution: function (oEvent) {
			var selectedRow = oEvent.getParameters().id.split("-")[2];
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var ruleId = oUserSettingsModel.getData().substitutionDto[selectedRow].ruleId;
			/*var payload = oUserSettingsModel.getData().substitutionDto.splice(selectedRow, 1);
			if (payload[0].processList === null) {
				payload[0].processList = [];
			}*/
			var requestPayload = oUserSettingsModel.getData().substitutionDto[selectedRow];
			oUserSettingsModel.refresh();
			var url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/delete"
			this.doAjax(url, "POST", requestPayload, function (oData) {
				var oData = oData;
				oUserSettingsModel.getData().substitutionDto.splice(selectedRow, 1);
				oUserSettingsModel.refresh();
				this._showToastMessage(oData.message);
			}.bind(this), function (oEvent) {}.bind(this));

		},

		saveSubstitution: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var addSubstituteDto = oUserSettingsModel.getProperty("/addSubstituteDto");
			var flag = true;
			var url;
			// if (!addSubstituteDto.substitutedUserName || !addSubstituteDto.substitutedUser ||
			// 	!addSubstituteDto.substitutingUser || !addSubstituteDto.startDate || !addSubstituteDto.endDate) {
			// 	flag = false;
			// 	if (!addSubstituteDto.substitutedUser || !addSubstituteDto.substitutedUserName) {
			// 		addSubstituteDto.substitutedUserName = "";
			// 		addSubstituteDto.substitutedUser = "";
			// 	}
			// 	if (!addSubstituteDto.substitutingUser) {
			// 		addSubstituteDto.substitutingUser = "";
			// 		addSubstituteDto.substitutingUserName = "";
			// 	}
			// 	oUserSettingsModel.refresh(true);
			// 	this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			// 	return;
			// }
			// if (addSubstituteDto.processList === null || addSubstituteDto.processList.length === 0) {
			// 	addSubstituteDto.processList = ["ALL"];
			// }

			addSubstituteDto.startDate = new Date(addSubstituteDto.startDate);
			addSubstituteDto.startDate = addSubstituteDto.startDate.getFullYear() + "-" + ("0" + (addSubstituteDto.startDate.getMonth() + 1))
				.slice(-
					2) +
				"-" + ("0" + addSubstituteDto.startDate.getDate()).slice(-2) + "T00:00:00";
			addSubstituteDto.endDate = new Date(addSubstituteDto.endDate);
			addSubstituteDto.endDate = addSubstituteDto.endDate.getFullYear() + "-" + ("0" + (addSubstituteDto.endDate.getMonth() + 1)).slice(-
					2) +
				"-" + ("0" + addSubstituteDto.endDate.getDate()).slice(-2) + "T23:59:59";

			if (oUserSettingsModel.getProperty("/updateSubs")) {
				url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/update";
			} else {
				url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/create";
			}
			//oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			if (flag) {
				this.doAjax(url, "POST", addSubstituteDto, function (oData) {
					this._showToastMessage(oData.message);
					this.loadSubstitutionData("mySubs");
					oUserSettingsModel.setProperty("/toDate", "");
					oUserSettingsModel.setProperty("/fromDate", "");
					oUserSettingsModel.refresh();
					//oUserSettingsModel.getProperty("/addSubstituteDto", {});
					oUserSettingsModel.setProperty("/addSubstituteDto", {});
					//oDefaultDataModel.setProperty("/enableBusyIndicators", false);

				}.bind(this), function (oEvent) {}.bind(this));
			}
		},

		

		//---------------New Substitution methods-End ---------
		// -------------------------------------------- END - SUBSTITUTION METHODS---------------------------
		// -------------------------------------------- START - NOTIFICATION METHODS---------------------------

		openNotification: function (oEvent) {
			if (!this._oNotification) {
				this._oNotification = this._createFragment("oneapp.incture.workbox.fragment.NotificationPopover", this);
				this.getView().addDependent(this._oNotification);
			}
			this.updateNotification();
			this._oNotification.openBy(oEvent.getSource());
		},
		discardNotificationBanner: function () {
			this.getModel("oUserSettingsModel").setProperty("/settings/notificationStyle", "OFF");
		},
		removeNotification: function (count, id) {
			var url = "/oneappinctureworkbox/WorkboxJavaService/notification/removeNotification/";
			if (count === "ALL") {
				url = url + "ALL";
			} else {
				url = url + "SINGLE?id=" + id;
				if (this._oNotification && this._oNotification.isOpen()) {
					this._oNotification.focus();
				}
			}
			this.doAjax(url, "GET", null, function (oData) {
				this.updateNotification();
				if (count === "SINGLEBANNER") {
					this.getModel("oUserSettingsModel").setProperty("/settings/notificationStyle", "OFF");

				}
			}.bind(this), function (oEvent) {}.bind(this));
		},
		loadNotification: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/busy", true);
			var url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/getViewList";
			this.doAjax(url, "GET", null, function (oData) {
				oUserSettingsModel.setProperty("/settings/notification/generalSettings", oData.viewDtos);
				oUserSettingsModel.setProperty("/settings/notification/eventOrigin", "");
				// oUserSettingsModel.setProperty("/settings/notification/notificationDto", oData.notificationactiondtos);
				oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", false);
				oUserSettingsModel.setProperty("/settings/busy", false);
			}.bind(this), function (oEvent) {}.bind(this));

		},
		selectNotificationGroup: function (oEvent, type) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel"),
				settingsNav = oUserSettingsModel.getProperty("/settings/settingsNav");

			settingsNav.push(oUserSettingsModel.getProperty("/settings/settingView"));
			oUserSettingsModel.setProperty("/settings/settingsNav", settingsNav);
			oUserSettingsModel.setProperty("/settings/settingView", "");

			if (type === "EVENTLIST") { // Switch with event
				oUserSettingsModel.setProperty("/settings/selectedNotification/header", "Events");
				oUserSettingsModel.setProperty("/settings/settingView", "EVENTLIST");
				if (oUserSettingsModel.getProperty("/settings/notification/notificationEventChanged")) {
					this.confirmDiscardChanges(true, false);
				}
			} else {
				var oSelectedObj = oEvent.getSource().getBindingContext("oUserSettingsModel").getObject();
				oUserSettingsModel.setProperty("/settings/selectedNotification", oSelectedObj);
				oUserSettingsModel.setProperty("/settings/selectedNotification/type", type);
				if (type === "GROUP" || type === "CHANNEL") {
					oUserSettingsModel.setProperty("/settings/selectedNotification/header", oSelectedObj.viewName);
					oUserSettingsModel.setProperty("/settings/settingView", type);
					this.getNotifEventsDetails(oSelectedObj.viewType, oSelectedObj.viewName)
					this.generateNotifSettings("settingId=" + oSelectedObj.settings);
				} else if (type === "PROFILE") {
					oUserSettingsModel.setProperty("/settings/selectedNotification/header", oSelectedObj.profileName);
					oUserSettingsModel.setProperty("/settings/settingView", "CHANNEL");
					this.getNotifEventsDetails("Profile", oSelectedObj.profileName)
					this.generateNotifSettings("settingId=" + oSelectedObj.settingId);
				} else if (type === "APPLICATION" || type === "ROLES") {
					oUserSettingsModel.setProperty("/settings/selectedNotification/header", oSelectedObj.value);
					oUserSettingsModel.setProperty("/settings/settingView", "GENERAL");
					this.loadNotification();
				}
			}

		},
		goBackNotificationGroup: function (oEvent, type) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel"),
				notificationEventChanged = oUserSettingsModel.getProperty("/settings/notification/notificationEventChanged"),
				notificationSettingsChanged = oUserSettingsModel.getProperty("/settings/notification/notificationSettingsChanged"),
				newEventAdded = oUserSettingsModel.getProperty("/settings/notification/newEventAdded"),
				eventsDeleted = oUserSettingsModel.getProperty("/settings/notification/eventsDeleted"),
				type = oUserSettingsModel.getProperty("/settings/selectedNotification/type");
			// var rSuccess = function ().bind(this);
			if (notificationEventChanged || notificationSettingsChanged || newEventAdded || eventsDeleted) {
				if ((type === "PROFILE" || type === "EVENTLIST") && notificationEventChanged) {
					this.confirmDiscardChanges()
				} else if (type === "GROUP" || type === "CHANNEL") {
					this.confirmDiscardChanges();
				}
			} else(this.successGoBack());
		},
		confirmDiscardChanges: function (notificationEventChanged, notificationSettingsChanged) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var newEventAdded = oUserSettingsModel.getProperty("/settings/notification/newEventAdded");

			var warning = i18n.getText("SETTINGS_NOT_SAVED_ERR_MSG");
			var alertmessage = i18n.getText("ALERT_TEXT");
			var that = this;
			this._createConfirmationMessage(warning, alertmessage, "Warning", i18n.getText("YES_TEXT"), i18n.getText("NO_TEXT"), true,
				function (discardChange) {
					var notificationEventChanged = oUserSettingsModel.getProperty("/settings/notification/notificationEventChanged"),
						newEventAdded = oUserSettingsModel.getProperty("/settings/notification/newEventAdded"),
						notificationSettingsChanged = oUserSettingsModel.getProperty("/settings/notification/notificationSettingsChanged"),
						oSelectedObj = oUserSettingsModel.getProperty("/settings/selectedNotification"),
						type = oUserSettingsModel.getProperty("/settings/settingView");
					var eventsDeleted = oUserSettingsModel.getProperty("/settings/notification/eventsDeleted");
					var deletedEvents = oUserSettingsModel.getProperty("/settings/notification/deletedEvents");

					if (notificationEventChanged) {
						if (type === "GROUP" || type === "CHANNEL") {
							oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", false);
						} else if (type === "PROFILE") {
							this.getNotifEventsDetails("Profile", oSelectedObj.profileName)
						} else if (type === "EVENTLIST") {
							// this.saveNotificationSettings();
							var viewType, viewName;
							if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") === "PROFILE") {
								viewType = "Profile";
								viewName = oSelectedObj.profileName

							} else {
								viewType = oSelectedObj.viewType;
								viewName = oSelectedObj.viewName;
							}
							this.getNotifEventsDetails(viewType, viewName)
						}
					}
					if (notificationSettingsChanged) {
						if (type === "GROUP" || type === "CHANNEL") {
							oUserSettingsModel.setProperty("/settings/notification/notificationSettingsChanged", false)
						} else if (type === "PROFILE") {
							this.generateNotifSettings("settingId=" + oSelectedObj.settingId);
						} else if (type === "ADDITIONAL") {
							settingId = "tabType=AdditionalSetting";
							oUserSettingsModel.setProperty("/settings/notification/notificationSettingsChanged", false)
						}
					}
					if (newEventAdded) {
						oUserSettingsModel.setProperty("/settings/notification/newEventAdded", false)
					}
					if (eventsDeleted) {
						oUserSettingsModel.setProperty("/settings/notification/eventsDeleted", false);
						deletedEvents = [];
					}
					this.successGoBack();
					oUserSettingsModel.refresh(true);
				},
				function (clearTabPress) {});
		},
		successGoBack: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel")
			var settingsNav = oUserSettingsModel.getProperty("/settings/settingsNav");
			var landingScreen = settingsNav.pop();
			oUserSettingsModel.setProperty("/settings/settingView", landingScreen);

			var oSelectedObj = oUserSettingsModel.getProperty("/settings/selectedNotification");
			if (landingScreen === "CHANNEL") {
				oUserSettingsModel.setProperty("/settings/selectedNotification/header", oSelectedObj.viewName)
				if (settingsNav[settingsNav.length - 1] === "PROFILE") {
					oUserSettingsModel.setProperty("/settings/selectedNotification/header", oSelectedObj.profileName);
				}
			}
			if (landingScreen === "GENERAL") {
				this.loadNotification();
			}
			oUserSettingsModel.refresh(true);
		},
		selectNotifSettings: function (oEvent) {
			var selectedKey = oEvent.getSource().getSelectedKey();
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/settingsNav", []);
			oUserSettingsModel.setProperty("/settings/settingView", selectedKey);
			oUserSettingsModel.setProperty("/settings/notifSelectedTab", selectedKey);
			// remind user
			oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", false);
			oUserSettingsModel.setProperty("/settings/notification/notificationSettingsChanged", false);
			oUserSettingsModel.setProperty("/settings/notification/newEventAdded", false)
			oUserSettingsModel.setProperty("/settings/notification/eventsDeleted", false);
			oUserSettingsModel.setProperty("/settings/notification/deletedEvents", []);

			if (selectedKey === "GENERAL") {
				this.loadNotification();
			} else if (selectedKey === "PROFILE") {
				this.loadProfileNotificationSettings();
			} else if (selectedKey === "ADDITIONAL") {
				this.loadAdditionalNotificationSettings();
			} else if (selectedKey === "APPLICATION") {
				this.loadAppNotificationSettings();
			}
			oUserSettingsModel.refresh(true);
		},
		loadProfileNotificationSettings: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/busy", true);
			var url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/getProfiles";
			if (oUserSettingsModel.getProperty("/settings/selectedSetting") === "SETTINGS_ADMIN_NOTIFICATIONS") {
				url = url + "?isAdmin=1";
			}
			this.doAjax(url, "GET", null, function (oData) {
				oUserSettingsModel.setProperty("/settings/notification/profileSettings", oData.profileDto || []);
				oUserSettingsModel.setProperty("/settings/notification/selectedProfileChange", false);
				var selectedProfile;
				if (oData.profileDto && oData.profileDto.length > 0) {
					selectedProfile = oData.profileDto[0];

					for (var i = 0; i < oData.profileDto.length; i++) {
						if (oData.profileDto[i].isActive) {
							selectedProfile = oData.profileDto[i];
							break;
						}
					}
				} else {
					selectedProfile = {
						isActive: false,
						profileName: "",
						scheduledFrom: null,
						scheduledTo: null
					}
				}
				oUserSettingsModel.setProperty("/settings/busy", false);
				oUserSettingsModel.setProperty("/settings/notification/selectedProfile", selectedProfile);
			}.bind(this), function (oEvent) {}.bind(this));
		},
		loadAdditionalNotificationSettings: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel")
			oUserSettingsModel.setProperty("/settings/selectedNotification", {});
			this.generateNotifSettings("tabType=AdditionalSetting");
		},
		getNotifEventsDetails: function (viewType, viewName) {

			var oUserSettingsModel = this.getModel("oUserSettingsModel")
			oUserSettingsModel.setProperty("/settings/selectedNotification/viewDetailBusy", true);
			var url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/getViewDetail",
				payload = {
					"viewType": viewType,
					"viewName": viewName,
					// "userId": null
				}
			this.doAjax(url, "POST", payload, function (oData) {
					if (!oData.eventDtos) {
						oData.eventDtos = [];
					}
					if (!payload.viewName && !payload.viewType) {
						oUserSettingsModel.setProperty("/settings/notification/eventOrigin", "");
						oUserSettingsModel.setProperty("/settings/notification/notificationEvents", oData.eventDtos);
						oUserSettingsModel.setProperty("/settings/busy", false);
					} else {

						oUserSettingsModel.setProperty("/settings/selectedNotification/viewDetailBusy", false);
						oUserSettingsModel.setProperty("/settings/selectedNotification/viewDetails", oData.eventDtos)
						var notifSelectedTab = oUserSettingsModel.getProperty("/settings/notifSelectedTab");

						if (oData.eventDtos.length > 0 && oUserSettingsModel.getProperty("/settings/settingView") !== "GROUP") {
							var sEventsList = "",
								aEventsList = [];
							oData.eventDtos.forEach(function (item, index) {
								if (index > 0) {
									sEventsList = sEventsList + "," + item.eventName
								} else {
									sEventsList = item.eventName;
								}
								aEventsList.push(item.eventId);
								// }

							});
							oUserSettingsModel.setProperty("/settings/selectedNotification/sEventsList", sEventsList);
							oUserSettingsModel.setProperty("/settings/selectedNotification/aEventsList", aEventsList);
						}

						oUserSettingsModel.refresh(true)
					}
					oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", false);
					oUserSettingsModel.setProperty("/settings/notification/deletedEvents", []);
					oUserSettingsModel.setProperty("/settings/notification/eventsDeleted", false)
				}.bind(this),
				function (oEvent) {}.bind(this));
		},
		generateNotifSettings: function (settingsParams) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/getSettingDetails?" + settingsParams;
			if (oUserSettingsModel.getProperty("/settings/selectedSetting") === "SETTINGS_ADMIN_NOTIFICATIONS" && oUserSettingsModel.getProperty(
					"/settings/notifSelectedTab") !== "PROFILE") {
				if (settingsParams === "tabType=AdditionalSetting") {
					url = url + "&isAdmin=1";
				} else {
					url = url + "&adminSetting=true";
				}
			}

			oUserSettingsModel.setProperty("/settings/selectedNotification/viewSettings", []);
			oUserSettingsModel.setProperty(
				"/settings/selectedNotification/viewSettingsBusy", true);
			this.doAjax(url, "GET", null, function (oData) {
					oUserSettingsModel.setProperty("/settings/selectedNotification/viewSettingsBusy", false);
					oUserSettingsModel.setProperty("/settings/selectedNotification/viewSettings", oData.settingDtos);
					var oSettingsTable = sap.ui.getCore().byId("ID_NOTIF_SETTINGS_TABLE");
					if (this.oAppModel.getProperty("/currentView") === "adminConsole" && (!this._oSettings || !this._oSettings.isOpen())) {
						oSettingsTable = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").byId(
							"ID_NOTIF_SETTINGS_TABLE")
					}
					if (oSettingsTable) {
						oSettingsTable.removeAllItems();
						oSettingsTable.bindAggregation("items", "oUserSettingsModel>/settings/selectedNotification/viewSettings",
							function (index, context) {
								var bindingObject = context.getObject();
								var contextPath = context.getPath();
								var row = new sap.m.ColumnListItem();
								var label = new sap.m.HBox({
										renderType: "Bare",
										alignItems: "Center",
										justifyContent: "Start"
									}).addItem(new sap.m.Switch({
										visible: "{= ${oUserSettingsModel>/settings/selectedSetting}==='SETTINGS_ADMIN_NOTIFICATIONS'}",
										state: "{oUserSettingsModel>isEnable}",
										change: function (oEvent) {
											this.updateNotificationSettings(oEvent, "SETTINGS", "ENABLEEVENT");
										}.bind(this)
									}).addStyleClass("wbSmallerCustomSwitch"))
									.addItem(new sap.m.Text({
										text: "{oUserSettingsModel>settingName}"
									}).addStyleClass("wbSettingsNotifLabel"));
								var control;
								if (bindingObject.selectionList && !oUserSettingsModel.getProperty("/settings/notification/dropdownLists" + bindingObject.settingName)) {
									this.addNotificationDropdownList(bindingObject);
								}
								if (bindingObject.dataType === "COMBOBOX") {
									control = new sap.m.HBox({
											renderType: "Bare",
											alignItems: "Center",
											justifyContent: "SpaceBetween"
										})
										.addItem(new sap.m.Select({
											width: "41%",
											forceSelection: false,
											selectedKey: "{oUserSettingsModel>value}",
											enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",
											items: {
												path: "oUserSettingsModel>/settings/notification/dropdownLists" + bindingObject.settingName,
												template: new sap.ui.core.Item({
													key: "{oUserSettingsModel>key}",
													text: "{oUserSettingsModel>value}"
												})
											},
											// enabled: "{= ${oUserSettingsModel>/settings/selectedSetting}!=='SETTINGS_ADMIN_NOTIFICATIONS'}",
											change: function (oEvent) {
												oUserSettingsModel.setProperty("/settings/notification/notificationSettingsChanged", true);
											}.bind(this)
										}).addStyleClass("wbTextBoldClass wbDefaultCustomInputWrapper"))
										.addItem(new sap.m.ObjectStatus({
											visible: "{= ${oUserSettingsModel>additionalSettingId} === 'Badges'}",
											text: "{i18n>APPLY_TO_ALL_EVENTS}",
											icon: "sap-icon://hint"
										}).addStyleClass("wbNotificationObjStatus"))

								}
								if (bindingObject.dataType === "MULTICOMBOBOX") {
									control = new sap.m.HBox({
											renderType: "Bare",
											alignItems: "Center",
											justifyContent: "SpaceBetween"
										})
										.addItem(new sap.m.MultiComboBox({
											width: "41%",
											enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",
											items: {
												path: "oUserSettingsModel>/settings/notification/dropdownLists" + bindingObject.settingName,
												template: new sap.ui.core.Item({
													key: "{oUserSettingsModel>key}",
													text: "{oUserSettingsModel>value}"
												})
											},
											// editable: "{= ${oUserSettingsModel>/settings/selectedSetting}!=='SETTINGS_ADMIN_NOTIFICATIONS'}",
											selectionFinish: function (oEvent) {
												var sPath = oEvent.getSource().getBindingContext("oUserSettingsModel").getPath();
												oUserSettingsModel.setProperty(sPath + "/value", oEvent.getSource().getSelectedKeys().join());
												oUserSettingsModel.setProperty("/settings/notification/notificationSettingsChanged", true);
												oUserSettingsModel.refresh(true);
											},

											selectedKeys: "{path: 'oUserSettingsModel>value' ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetSelectedKeysString'}"
										})).addStyleClass("wbTextBoldClass wbDefaultCustomInputWrapper")
										.addItem(new sap.m.ObjectStatus({
											visible: "{= ${oUserSettingsModel>additionalSettingId} === 'Badges'}",
											text: "{i18n>APPLY_TO_ALL_EVENTS}",
											icon: "sap-icon://hint"
										}).addStyleClass("wbNotificationObjStatus"))

								} else if (bindingObject.dataType === "RADIOBUTTON") {
									var that = this
									control = new sap.m.RadioButtonGroup({
										enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",
										buttons: {
											path: "oUserSettingsModel>/settings/notification/dropdownLists" + bindingObject.settingName,
											template: new sap.m.RadioButton({
												text: "{oUserSettingsModel>value}"
											})
										},
										// enabled: "{= ${oUserSettingsModel>/settings/selectedSetting}!=='SETTINGS_ADMIN_NOTIFICATIONS'}",
										select: function (oEvent) {
											this.updateNotificationSettings(oEvent, "SETTINGS", "RADIOBUTTON");
										}.bind(this)
									})
									control.addEventDelegate({
											"onAfterRendering": function (oEvent) {
												oEvent.srcControl.setSelectedIndex(this.formatter.wbNotifSetRadioButton(oUserSettingsModel.getProperty(
														"/settings/notification/dropdownLists/a" +
														bindingObject.settingName + "List"),
													bindingObject))
											}.bind(this)
										},
										this);
								} else if (bindingObject.dataType === "DATETYPE") {
									control = this.getFrequencyControl(bindingObject);
								} else if (bindingObject.dataType === "TOGGLE") {
									control = new sap.m.Switch({
										state: "{= ${oUserSettingsModel>value}==='ON'? true:false}",
										enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",
										// enabled: "{= ${oUserSettingsModel>/settings/selectedSetting}!=='SETTINGS_ADMIN_NOTIFICATIONS'}",
										change: function (oEvent) {
											this.updateNotificationSettings(oEvent, "SETTINGS", "TOGGLE");
										}.bind(this)
									}).addStyleClass("wbSmallerCustomSwitch")
								} else {
									control: new sap.m.Text({
										text: bindingObject.value,
									}).addStyleClass("wbTextBoldClass");
								}
								row.addCell(label);
								row.addCell(control);
								if (oUserSettingsModel.getProperty("/settings/selectedSetting") !== "SETTINGS_ADMIN_NOTIFICATIONS") {
									row.setVisible(bindingObject.isEnable)
								}
								// {oUserSettingsModel>/settings/selectedNotification/noSettings}
								return row;
							}.bind(this));

					}
					oUserSettingsModel.setProperty("/settings/notification/notificationSettingsChanged", false);
				}.bind(this),
				function (oEvent) {}.bind(this));
		},
		addNotificationDropdownList: function (bindingObject) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/notification/dropdownLists" + bindingObject.settingName, [])
			this.doAjax("/oneappinctureworkbox/WorkboxJavaService" + bindingObject.selectionList, "GET", null, function (oData) {
					oData.keyValuePairs = oData.keyValuePairs || [];
					if (bindingObject.dataType === "RADIOBUTTON" && oData.keyValuePairs.length > 0) {
						var list = []
						oData.keyValuePairs.forEach(function (item, index) {
							list.push(item.value);
						});
						oUserSettingsModel.setProperty("/settings/notification/dropdownLists/a" + bindingObject.settingName + "List", list)
					}
					oUserSettingsModel.setProperty("/settings/notification/dropdownLists" + bindingObject.settingName, oData.keyValuePairs || []);

				}.bind(this),
				function (oEvent) {}.bind(this));
		},
		getFrequencyControl: function (bindingObject) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var that = this;
			var control = new sap.m.VBox({
					renderType: "Bare",
				}).addItem(new sap.m.Select({
					width: "41%",
					forceSelection: false,
					selectedKey: "{oUserSettingsModel>value}",
					enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",
					items: {
						path: "oUserSettingsModel>/settings/notification/dropdownLists" + bindingObject.settingName,
						template: new sap.ui.core.Item({
							key: "{oUserSettingsModel>key}",
							text: "{oUserSettingsModel>value}",
							enabled: "{= ${oUserSettingsModel>key} !== 'Custom'}"
						})
					},
					change: function (oEvent) {
						this.updateNotificationSettings(oEvent, "SETTINGS", "SETFREQUENCY")
					}.bind(this)
				}).addStyleClass("wbTextBoldClass wbDefaultCustomInputWrapper sapUiTinyMarginEnd sapUiTinyMarginBottom"))
				.addItem(new sap.m.HBox({
						renderType: "Bare",
					})
					.addItem(new sap.m.Label({
						text: "{i18n>TIME_TEXT}",
						visible: "{= ${oUserSettingsModel>value} === 'Every day' || ${oUserSettingsModel>value} === 'Every hour'}"
					}).addStyleClass("wbTextBoldClass"))
					.addItem(new sap.m.Label({
						text: "{i18n>REPEAT_EVERY}",
						width: "24%",
						visible: "{= ${oUserSettingsModel>value} === 'Custom'}"
					}).addStyleClass("sapUiTinyMarginEnd wbTextBoldClass"))
					.addItem(new sap.m.Label({
						text: "{i18n>NOTIF_FROM_TO}",
						visible: "{= ${oUserSettingsModel>value} === 'Custom'}"
					}).addStyleClass("wbTextBoldClass"))
					.addItem(new sap.m.Label({
						text: "{i18n>DAY_TEXT}",
						// enabled: "{= ${oUserSettingsModel>/settings/selectedSetting}!=='SETTINGS_ADMIN_NOTIFICATIONS'}",

						width: "20%",
						visible: "{= ${oUserSettingsModel>value} === 'Every week'}"
					}).addStyleClass("sapUiTinyMarginEnd wbTextBoldClass"))
					.addItem(new sap.m.Label({
						text: "{i18n>TIME_TEXT}",
						visible: "{= ${oUserSettingsModel>value} === 'Every week'}"
					}).addStyleClass("wbTextBoldClass"))
					.addItem(new sap.m.Label({
						text: "{i18n>DATE_TEXT}",
						width: "{= ${oUserSettingsModel>value} === 'Every month' ? '20%' :'21%'}",
						visible: "{= ${oUserSettingsModel>value} === 'Every month' ||  ${oUserSettingsModel>value} === 'Every year' }"
					}).addStyleClass("sapUiTinyMarginEnd wbTextBoldClass"))
					.addItem(new sap.m.Label({
						text: "{i18n>TIME_TEXT}",
						visible: "{= ${oUserSettingsModel>value} === 'Every month' ||  ${oUserSettingsModel>value} === 'Every year' }"
					}).addStyleClass("wbTextBoldClass")))
				.addItem(new sap.m.HBox({
						renderType: "Bare",
					})
					//------------------------------------START- EVERY DAY-------------------------
					.addItem(new sap.m.TimePicker({
						valueFormat: "hh-mm-ss a",
						displayFormat: "hh:mm a",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",
						// enabled: "{= ${oUserSettingsModel>/settings/selectedSetting}!=='SETTINGS_ADMIN_NOTIFICATIONS'}",
						// value: "{oUserSettingsModel>more}",
						value: that.formatter.wbSetFrequecyValue(bindingObject.more, "TIMEPICKER"),
						width: "20%",
						visible: "{= ${oUserSettingsModel>value} === 'Every day'}",
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS", "TIMEPICKER")
						}.bind(this)
					}).addStyleClass("wbNotificatinMaskInp wbCustomTimePicker wbTextBoldClass wbDefaultCustomInputWrapper"))
					//------------------------------------END- EVERY DAY--------------------------
					//------------------------------------START- EVERY HOUR-------------------------
					.addItem(new sap.m.TimePicker({
						valueFormat: "mm",
						displayFormat: "mm",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",
						value: that.formatter.wbSetFrequecyValue(bindingObject.more, "MINUTESPICKER"),
						width: "20%",
						visible: "{= ${oUserSettingsModel>value} === 'Every hour'}",
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS", "MINUTESPICKER");
						}.bind(this)
					}).addStyleClass("wbNotificatinMaskInp wbCustomTimePicker wbTextBoldClass wbDefaultCustomInputWrapper"))
					//------------------------------------END- EVERY DAY--------------------------
					//------------------------------------START-  CUSTOM-------------------------
					.addItem(new sap.m.Input({
						width: "2rem",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS");
						}.bind(this),
						visible: "{= ${oUserSettingsModel>value} === 'Custom'}",
					}).addStyleClass("wbDefaultCustomInputWrapper sapUiTinyMarginEnd"))
					.addItem(new sap.m.Select({
						forceSelection: false,
						width: "17%",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",

						visible: "{= ${oUserSettingsModel>value} === 'Custom'}",
						selectedKey: "Day",
						items: {
							path: "oLocalModel>/notification/dropdownListsCustom",
							template: new sap.ui.core.Item({
								key: "{oLocalModel>key}",
								text: "{oLocalModel>value}"
							})
						},
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS");
						}.bind(this)
					}).addStyleClass("wbTextBoldClass wbDefaultCustomInputWrapper sapUiTinyMarginEnd"))
					.addItem(new ExtDateRangeSelection({
						displayFormat: "dd MMM yyyy",
						placeholder: "dd MMM yyyy",
						// value: "{oUserSettingsModel>more}",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",

						width: "36%",
						visible: "{= ${oUserSettingsModel>value} === 'Custom'}",
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS");
							// oUserSettingsModel.setProperty("/settings/notification/notificationSettingsChanged", true);
						}.bind(this)
					}).addStyleClass("wbNotificatinMaskInp wbCustomTimePicker wbTextBoldClass wbDefaultCustomInputWrapper"))
					//------------------------------------END- CUSTOM-------------------------
					//------------------------------------START- EVERY WEEK-------------------------

					.addItem(new sap.m.Select({
						width: "20%",
						forceSelection: false,
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",

						visible: "{= ${oUserSettingsModel>value} === 'Every week'}",
						selectedKey: that.formatter.wbSetFrequecyValue(bindingObject.more, "DAYSELECT"),
						items: {
							path: "oLocalModel>/notification/dropdownListsEveryWeek",
							template: new sap.ui.core.Item({
								key: "{oLocalModel>key}",
								text: "{oLocalModel>value}"
							})
						},
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS", "DAYSELECT");
						}.bind(this)
					}).addStyleClass("wbTextBoldClass wbDefaultCustomInputWrapper sapUiTinyMarginEnd"))
					.addItem(new sap.m.TimePicker({
						valueFormat: "hh-mm-ss a",
						displayFormat: "hh:mm a",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",

						value: that.formatter.wbSetFrequecyValue(bindingObject.more, "TIMEPICKER"),
						width: "20%",
						visible: "{= ${oUserSettingsModel>value} === 'Every week'}",
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS", "TIMEPICKER")
						}.bind(this)
					}).addStyleClass("wbNotificatinMaskInp wbCustomTimePicker wbTextBoldClass wbDefaultCustomInputWrapper"))
					//------------------------------------END- EVERY WEEK-------------------------
					//------------------------------------START- EVERY MONTH-------------------------

					.addItem(new sap.m.Select({
						forceSelection: false,
						width: "20%",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",

						visible: "{= ${oUserSettingsModel>value} === 'Every month'}",
						selectedKey: that.formatter.wbSetFrequecyValue(bindingObject.more, "DATESELECT"),
						items: {
							path: "oLocalModel>/notification/dropdownListsEveryMonth",
							template: new sap.ui.core.Item({
								key: "{oLocalModel>key}",
								text: "{oLocalModel>value}"
							})
						},
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS", "DATESELECT");
						}.bind(this)
					}).addStyleClass("wbTextBoldClass wbDefaultCustomInputWrapper sapUiTinyMarginEnd"))
					.addItem(new sap.m.TimePicker({
						valueFormat: "hh-mm-ss a",
						displayFormat: "hh:mm a",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",

						value: that.formatter.wbSetFrequecyValue(bindingObject.more, "TIMEPICKER"),
						width: "20%",
						visible: "{= ${oUserSettingsModel>value} === 'Every month'}",
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS", "TIMEPICKER");
						}.bind(this)
					}).addStyleClass("wbNotificatinMaskInp wbCustomTimePicker wbTextBoldClass wbDefaultCustomInputWrapper"))
					//------------------------------------END- EVERY MONTH-------------------------
					//------------------------------------START- EVERY YEAR-------------------------
					.addItem(new ExtDatePicker({
						valueFormat: "0000-MM-dd",
						displayFormat: "dd MMM",
						placeholder: "dd MMM",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",

						dateValue: that.formatter.wbSetFrequecyValue(bindingObject.more, "DATEPICKER"),
						minDate: this.formatter.wbReturnDatePickerDateObj(new Date("01 January" + new Date().getFullYear())),
						maxDate: this.formatter.wbReturnDatePickerDateObj(new Date("31 December" + new Date().getFullYear())),
						width: "21%",
						visible: "{= ${oUserSettingsModel>value} === 'Every year'}",
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS", "DATEPICKER");
						}.bind(this)
					}).addStyleClass("wbNotificatinMaskInp wbCustomTimePicker sapUiTinyMarginEnd wbTextBoldClass wbDefaultCustomInputWrapper"))
					.addItem(new sap.m.TimePicker({
						valueFormat: "hh-mm-ss a",
						displayFormat: "hh:mm a",
						enabled: "{=${oUserSettingsModel>/settings/selectedSetting} === 'SETTINGS_ADMIN_NOTIFICATIONS' &&  ${oUserSettingsModel>/settings/notifSelectedTab} === 'GENERAL'? false:true}",

						value: that.formatter.wbSetFrequecyValue(bindingObject.more, "TIMEPICKER"),
						width: "19%",
						visible: "{= ${oUserSettingsModel>value} === 'Every year'}",
						change: function (oEvent) {
							this.updateNotificationSettings(oEvent, "SETTINGS", "TIMEPICKER")
						}.bind(this)
					}).addStyleClass("wbNotificatinMaskInp wbCustomTimePicker wbTextBoldClass wbDefaultCustomInputWrapper")))
				//------------------------------------END- EVERY YEAR-------------------------

			return control;
		},
		updateNotificationSettings: function (oEvent, type, settingsType) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/notification/notificationSettingsChanged", true);
			var sPath = oEvent.getSource().getBindingContext("oUserSettingsModel").getPath();
			var selObj = oEvent.getSource().getBindingContext("oUserSettingsModel").getObject()
			if (settingsType === "SETFREQUENCY") {
				var key = oEvent.getSource().getSelectedItem().getKey();
				oUserSettingsModel.setProperty("/settings/notification/notificationSettingsChanged", true);
				var date = new Date();
				var string = "";
				if (key === "Every day") { // 0000-00-00-000-10-25-00 PM
					string = "0000-00-00-000-"
					var time = new Date().toLocaleString([], {
						hour: '2-digit',
						minute: '2-digit',
						second: '2-digit'
					});
					time = time.replaceAll(":", "-")
					string = string + time;
				} else if (key === "Every hour") { //0000-00-00-000-00-10-00 AM *
					string = "0000-00-00-000-00-"
					var time = new Date().toLocaleString([], {
						minute: '2-digit',
						second: '2-digit'
					});
					time = time.replaceAll(":", "-")
					string = string + time + " AM";
				} else if (key === "Every week") { //0000-00-00-Tue-10-25-00 PM
					string = "0000-00-00-"
					var day = new Date().toLocaleString('en-US', {
						weekday: 'short'
					})

					string = string + day + "-12-00-00 AM ";
				} else if (key === "Every month") { //0000-00-17-000-10-25-00 PM
					string = "0000-00-"
					var date = new Date().getDate().toString().padStart(2, "0");
					string = string + date + "-000-12-00-00 AM ";
				} else if (key === "Every year") { //0000-02-28-000-13-25-00 PM
					string = "0000-";
					var date = (new Date().getMonth() + 1).toString().padStart(2, "0") + "-" + new Date().getDate().toString().padStart(2,
						"0");
					string = string + date + "-000-12-00-00 AM ";
				}
				oUserSettingsModel.setProperty(sPath + "/more", string);
			} else if (settingsType === "TOGGLE") {
				oUserSettingsModel.setProperty(sPath + "/value", oEvent.getParameter("state") ? "ON" : "OFF");
			} else if (settingsType === "RADIOBUTTON") {
				var selectedIndex = oEvent.getParameter("selectedIndex")
				oEvent.getSource().setSelectedIndex(selectedIndex);
				var selectedValue = oUserSettingsModel.getProperty("/settings/notification/dropdownLists/a" +
					selObj.settingName + "List/" + selectedIndex);
				oUserSettingsModel.setProperty(sPath + "/value", selectedValue);
			} else if (settingsType === "TIMEPICKER") {
				var sPath = oEvent.getSource().getBindingContext("oUserSettingsModel").getPath();
				var time = oEvent.getParameter("value");
				var selObj = oEvent.getSource().getBindingContext("oUserSettingsModel").getObject()
				var split = selObj.more.split("-");
				split.splice(4, 3)
				split.push(time);
				selObj.more = split.join("-");
				oUserSettingsModel.setProperty(sPath, selObj);
			} else if (settingsType === "DATEPICKER") {
				var date = oEvent.getParameter("value");
				var split = selObj.more.split("-");
				split.splice(0, 3)
				selObj.more = date + "-" + split.join("-");
				selObj.more.split("-");
				oUserSettingsModel.setProperty(sPath, selObj);
			} else if (settingsType === "DATESELECT") {
				var key = oEvent.getSource().getSelectedItem().getKey();
				var split = selObj.more.split("-");
				split[2] = key;
				selObj.more = split.join("-");
				oUserSettingsModel.setProperty(sPath, selObj);
			} else if (settingsType === "DAYSELECT") {
				var key = oEvent.getSource().getSelectedItem().getKey();
				var split = selObj.more.split("-");
				split[3] = key;
				selObj.more = split.join("-");
				oUserSettingsModel.setProperty(sPath, selObj);
			} else if (settingsType === "MINUTESPICKER") {
				var time = oEvent.getParameter("value");
				var split = selObj.more.split("-");
				split[5] = time;
				selObj.more = split.join("-");
				oUserSettingsModel.setProperty(sPath, selObj);
			} else if (type === "ENABLEEVENT") {
				oUserSettingsModel.setProperty(sPath + "/isEnable", oEvent.getParameter("state"));
				oUserSettingsModel.refersh(true);
			}
			oUserSettingsModel.refresh(true);
		},
		updateEventSettings: function (oEvent, type) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var oSelectedObject = oEvent.getSource().getBindingContext("oUserSettingsModel").getObject();

			if (type === "EVENTLIST") {
				oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", true);
				var state = oEvent.getParameter("state");
				var aEventsList = oUserSettingsModel.getProperty("/settings/selectedNotification/aEventsList")
				var viewDetails = oUserSettingsModel.getProperty("/settings/selectedNotification/viewDetails");
				var index = aEventsList.indexOf(oSelectedObject.eventId);
				var viewName = oUserSettingsModel.getProperty("/settings/selectedNotification/viewName");
				if (state) {
					if (index === -1) {
						oSelectedObject.channelList = this.getModel("oConstantsModel").getProperty("/aNotificationChannels");
						viewDetails.push(oSelectedObject)
						aEventsList.push(oSelectedObject.eventId);

					} else {
						viewDetails[index].channelList.push(viewName);
						aEventsList[index] = viewName;
					}
				} else {

					viewDetails[index].channelList.splice(viewDetails[index].channelList.indexOf(viewName), 1);
					aEventsList[index] = "";
				}
				oUserSettingsModel.setProperty("/settings/selectedNotification/viewDetails", viewDetails);
				oUserSettingsModel.setProperty("/settings/selectedNotification/aEventsList", aEventsList);
				oUserSettingsModel.refresh(true)
			} else if (type === "GROUP") {
				if (!oSelectedObject.newEventAdded) {
					oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", true);
				}
			} else if (type === "CHANNEL") {
				if (!oSelectedObject.newEventAdded) {
					oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", true);
				}
				var selectedKeys = oEvent.getSource().getSelectedKeys();
				var allKeys = oEvent.getSource().getKeys();
				if (selectedKeys.length === 0) {
					oEvent.getSource().setSelectedKeys(["None"]);
				} else if (selectedKeys.includes("None")) {
					if (selectedKeys[selectedKeys.length - 1] === "None") {
						oEvent.getSource().setSelectedKeys(["None"]);
					} else {
						selectedKeys.splice(selectedKeys.indexOf("None"), 1);
						oEvent.getSource().setSelectedKeys(selectedKeys);
					}
				} else {
					for (var i = 0; i < selectedKeys.length; i++) {
						if (!allKeys.includes(selectedKeys[i])) {
							selectedKeys.splice(i, 1);
							i--;
						}
					}
					if (selectedKeys.length === 0) {
						oEvent.getSource().setSelectedKeys(["None"]);
					}
				}
			} else if (type === "ENABLEEVENT") {
				oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", true);
				var oSelectedObjectPath = oEvent.getSource().getBindingContext("oUserSettingsModel").getPath();
				oUserSettingsModel.setProperty(oSelectedObjectPath + "/isEnable", oEvent.getParameter("state"));
				oUserSettingsModel.refersh(true);
			}
		},
		updateGeneralSettings: function (oEvent, action) {
			var oPayload = {},
				url = "";
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			if (action === "UPDATE") {
				var oSelectedObjectPath = oEvent.getSource().getBindingContext("oUserSettingsModel").getPath();
				oUserSettingsModel.setProperty(oSelectedObjectPath + "/isEnable", oEvent.getParameter("state"));
				var oSelectedObject = oUserSettingsModel.getProperty(oSelectedObjectPath);
				oPayload = {
					viewDtos: [{
						"viewType": oSelectedObject.viewType,
						"viewName": oSelectedObject.viewName,
						"isEnable": oSelectedObject.isEnable

					}]
				};
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/updateViewList";
			} else {
				var oNewConfiguration = oUserSettingsModel.getProperty("/settings/notification/oNewConfiguration");
				var configType = oUserSettingsModel.getProperty("/settings/notification/configType");

				if (configType === "ADDGROUP") {
					oPayload = {
						"viewDtos": [{
							"viewType": "What",
							"viewName": oNewConfiguration.viewName,
							"viewIcon": "sap-icon://key-user-settings",
						}]
					}
					url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/createWhatObject"
				} else {
					oPayload = {
						"viewDtos": [{
							"viewName": oNewConfiguration.viewName,
							"viewIcon": "sap-icon://responsive"
						}]
					}

					url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/createChannel";
				}
			}
			this.doAjax(url, "POST", oPayload, function (oData) {
				this._showToastMessage(oData.message);
				this.loadNotification();
				if (oUserSettingsModel.getProperty("/settings/notification/configType") === "ADDCHANNEL") {
					this.getNoticationChannels();
				}
				if (oUserSettingsModel.getProperty("/settings/notification/configType") === "ADDGROUP" || (oPayload.viewDtos.length === 1 &&
						oPayload.viewDtos[0].viewType === "What")) {
					this.getNotifEventsDetails();
				}
				if (oData.statusCode === "0") {
					this.closeAddNotifSettings();
				}

			}.bind(this), function (oEvent) {}.bind(this));
		},
		saveNotificationSettings: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var oPayload = {},
				url = "";
			if (oUserSettingsModel.getProperty("/settings/notification/newEventAdded")) {
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/createEvents";
				var oSelectedObj = oUserSettingsModel.getProperty("/settings/selectedNotification")
				oPayload = {
					"eventDtos": []
				};
				for (var i = 0; i < oSelectedObj.viewDetails.length; i++) {
					if (oSelectedObj.viewDetails[i].newEventAdded) {
						var newEvent = jQuery.extend(true, {}, oSelectedObj.viewDetails[i]);
						delete newEvent.newEventAdded;
						oPayload.eventDtos.push(newEvent)
					}
				}

				this.doAjax(url, "POST", oPayload, function (oData) {
					// this._showToastMessage(oData.message);
					var viewType, viewName;
					var oSelectedObj = oUserSettingsModel.getProperty("/settings/selectedNotification")
					if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") !== "PROFILE" && !oUserSettingsModel.getProperty(
							"/settings/notification/notificationEventChanged")) {
						viewType = oSelectedObj.viewType;
						viewName = oSelectedObj.viewName;
						this.getNotifEventsDetails(viewType, viewName);
					}
					oUserSettingsModel.setProperty("/settings/notification/newEventAdded", false);
				}.bind(this), function (oEvent) {}.bind(this));
			}
			if (oUserSettingsModel.getProperty("/settings/notification/eventsDeleted")) {
				var deletedEvents = oUserSettingsModel.getProperty("/settings/notification/deletedEvents");
				// make payload and
				oPayload = {
					"viewType": null,
					"viewName": null,
					"settingId": null,
					"eventDtos": deletedEvents
				}
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/deleteViewDetailByAdmin";
				this.doAjax(url, "POST", oPayload, function (oData) {
					// this._showToastMessage(oData.message);
					var viewType, viewName;
					var oSelectedObj = oUserSettingsModel.getProperty("/settings/selectedNotification")
					if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") !== "PROFILE" && !oUserSettingsModel.getProperty(
							"/settings/notification/notificationEventChanged")) {
						viewType = oSelectedObj.viewType;
						viewName = oSelectedObj.viewName;
						this.getNotifEventsDetails(viewType, viewName);
					}
					oUserSettingsModel.setProperty("/settings/notification/eventsDeleted", false);
					oUserSettingsModel.setProperty("/settings/notification/deletedEvents", []);
				}.bind(this), function (oEvent) {}.bind(this));
			}
			if (oUserSettingsModel.getProperty("/settings/notification/notificationEventChanged")) {
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/updateViewDetail";
				var oSelectedObj = oUserSettingsModel.getProperty("/settings/selectedNotification")
				oPayload = {
					"eventDtos": oSelectedObj.viewDetails
				};
				// Update Profile
				if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") === "PROFILE") {
					oPayload.viewType = "Profile";
					oPayload.viewName = oSelectedObj.profileName;
					oPayload.settingId = oSelectedObj.settingId

				} else {
					// Update View 
					// by admin
					if (oUserSettingsModel.getProperty("/settings/selectedSetting") === "SETTINGS_ADMIN_NOTIFICATIONS") {
						url = url + "ByAdmin";
						oPayload.eventDtos = [];
						for (var i = 0; i < oSelectedObj.viewDetails.length; i++) {
							if (!oSelectedObj.viewDetails[i].newEventAdded) {
								oPayload.eventDtos.push(oSelectedObj.viewDetails[i])
							}
						}
					} else {
						// by user
						oPayload.viewType = oSelectedObj.viewType;
						oPayload.viewName = oSelectedObj.viewName;
						oPayload.settingId = oSelectedObj.settings
					}
				}

				this.doAjax(url, "POST", oPayload, function (oData) {
					this._showToastMessage(oData.message);
					var viewType, viewName;
					var oSelectedObj = oUserSettingsModel.getProperty("/settings/selectedNotification")
					if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") === "PROFILE") {
						viewType = "Profile";
						viewName = oSelectedObj.profileName

					} else {
						viewType = oSelectedObj.viewType;
						viewName = oSelectedObj.viewName;
					}
					this.getNotifEventsDetails(viewType, viewName);
				}.bind(this), function (oEvent) {}.bind(this));
			}
			if (oUserSettingsModel.getProperty("/settings/notification/notificationSettingsChanged")) {
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/updateSettings";
				if (oUserSettingsModel.getProperty("/settings/selectedSetting") === "SETTINGS_ADMIN_NOTIFICATIONS") {
					url = url + "ByAdmin";
				}
				oPayload = oUserSettingsModel.getProperty("/settings/selectedNotification/viewSettings");
				this.doAjax(url, "POST", oPayload, function (oData) {
					if (oData.statusCode === "0") {
						this._showToastMessage(oData.message);
						oUserSettingsModel.setProperty("/settings/refreshSettings", true);
						var settingId;
						if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") === "PROFILE") {
							settingId = "settingId=" + oUserSettingsModel.getProperty("/settings/selectedNotification/settingId")
						} else if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") === "ADDITIONAL") {
							settingId = "tabType=AdditionalSetting";
						} else {
							settingId = "settingId=" + oUserSettingsModel.getProperty("/settings/selectedNotification/settings")
						}
						this.generateNotifSettings(settingId);
					} else {
						this._showToastMessage(oData.message || oData.status);
					}
				}.bind(this), function (oEvent) {}.bind(this));
			}

		},
		discardNotificationSettings: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var notificationEventChanged = oUserSettingsModel.getProperty("/settings/notification/notificationEventChanged"),
				notificationSettingsChanged = oUserSettingsModel.getProperty("/settings/notification/notificationSettingsChanged"),
				newEventAdded = oUserSettingsModel.getProperty("/settings/notification/newEventAdded"),
				eventsDeleted = oUserSettingsModel.getProperty("/settings/notification/eventsDeleted");
			if (notificationEventChanged || newEventAdded || eventsDeleted) {
				var viewType, viewName;
				var oSelectedObj = oUserSettingsModel.getProperty("/settings/selectedNotification")
				if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") === "PROFILE") {
					viewType = "Profile";
					viewName = oSelectedObj.profileName

				} else {
					viewType = oSelectedObj.viewType;
					viewName = oSelectedObj.viewName;
				}
				this.getNotifEventsDetails(viewType, viewName);
			}
			if (notificationSettingsChanged) {
				var settingId;
				if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") === "PROFILE") {
					settingId = "settingId=" + oUserSettingsModel.getProperty("/settings/selectedNotification/settingId")
				} else if (oUserSettingsModel.getProperty("/settings/notifSelectedTab") === "ADDITIONAL") {
					settingId = "tabType=AdditionalSetting";
				} else {
					settingId = "settingId=" + oUserSettingsModel.getProperty("/settings/selectedNotification/settings")
				}
				this.generateNotifSettings(settingId);
			}

		},
		deleteNotificationConfig: function (oEvent, type) {

			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var oSelectedObject = oEvent.getSource().getBindingContext("oUserSettingsModel").getObject();
			var url, payload = {};
			// flag = false;

			if (type === "EVENTLIST") {
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/deleteViewDetailByAdmin"
				var sPath = oEvent.getSource().getBindingContext("oUserSettingsModel").getPath()
				sPath = sPath.split("/");
				var index = sPath.pop();
				sPath = sPath.join("/")
				var eventsDto = oUserSettingsModel.getProperty(sPath)
				if (oSelectedObject.newEventAdded) {
					eventsDto.splice(index, 1);
				} else {
					var i18n = this.getView().getModel("i18n").getResourceBundle();
					var warning = i18n.getText("WARNING_TEXT");
					var alertmessage = i18n.getText("DELETE_CAUTION_TEXT");
					this._createConfirmationMessage(warning, alertmessage, "Warning", i18n.getText(
							"YES_TEXT"), i18n.getText("NO_TEXT"), true,
						function (success) {
							oUserSettingsModel.setProperty("/settings/notification/eventsDeleted", true);
							var deletedEvents = oUserSettingsModel.getProperty("/settings/notification/deletedEvents");
							deletedEvents.push({
								"eventGroup": oSelectedObject.eventGroup,
								"eventName": oSelectedObject.eventName,
								"eventId": oSelectedObject.eventId
							});
							eventsDto.splice(index, 1);
							oUserSettingsModel.refresh(true)
								// oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", true);
						}.bind(this),
						function (failure) {

						});

				}
			} else if (type === "GROUP" || type === "CHANNEL") {
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/deleteViewList";
				payload.viewName = oSelectedObject.viewName;
				if (type === "CHANNEL") {
					url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/deleteChannel";
				}
				var i18n = this.getView().getModel("i18n").getResourceBundle();
				var warning = i18n.getText("WARNING_TEXT");
				var alertmessage = i18n.getText("DELETE_CAUTION_TEXT");
				this._createConfirmationMessage(warning, alertmessage, "Warning", i18n.getText(
						"YES_TEXT"), i18n.getText("NO_TEXT"), true,
					function (success) {
						this.doAjax(url, "POST", payload, function (oData) {
							this.loadNotification();
						}.bind(this), function (oEvent) {}.bind(this));
					}.bind(this),
					function (failure) {

					});

				// flag = true;
				// } else if (type === "CHANNEL") {
				// 	// url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/deleteChannel";
				// 	// payload.viewName = oSelectedObject.viewName;
				// 	// flag = true;
			}
			// if (flag) {
			// 	this.doAjax(url, "POST", payload, function (oData) {
			// 		this.loadNotification();
			// 	}.bind(this), function (oEvent) {}.bind(this));
			// }
			oUserSettingsModel.refresh(true)

		},
		addEvent: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/notification/newEventAdded", true);
			var selectedNotification = oUserSettingsModel.getProperty("/settings/selectedNotification");
			// oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", true);
			var newEvent = {
				"eventGroup": selectedNotification.header,
				"eventName": "",
				"eventId": "",
				"priority": "HIGH",
				"isDefault": true,
				"isEnable": true,
				"settingId": "",
				"userId": "",
				"channel": "",
				"type": "",
				"id": null,
				"adminUser": null,
				"channelList": this.getModel("oConstantsModel").getProperty("/aNotificationChannels"),
				"validForUsage": null,
				"newEventAdded": true
			}
			selectedNotification.viewDetails.unshift(newEvent);
			oUserSettingsModel.setProperty("/settings/selectedNotification", selectedNotification);
			oUserSettingsModel.refresh(true);

		},
		updateProfile: function (oEvent, action) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var oPayload, url, flag = true;
			if (action === "CREATE") {
				oPayload = oUserSettingsModel.getProperty("/settings/notification/oNewConfiguration");
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/createProfile";
				if (oUserSettingsModel.getProperty("/settings/selectedSetting") === "SETTINGS_ADMIN_NOTIFICATIONS") {
					url = url + "ByAdmin";
				}
			} else if (action === "UPDATE") {
				flag = false;
				var selectedProfile = oUserSettingsModel.getProperty("/settings/notification/selectedProfile");
				if (oEvent.getParameter("selectedItem")) {
					selectedProfile = oEvent.getParameter("selectedItem").getBindingContext("oUserSettingsModel").getObject();
				}
				oUserSettingsModel.setProperty("/settings/notification/selectedProfile", selectedProfile);
				oUserSettingsModel.setProperty("/settings/notification/selectedProfileChange", true);

			} else if (action === "DELETE") {
				oPayload = oEvent.getSource().getBindingContext("oUserSettingsModel").getObject();
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/deleteProfile";
				if (oUserSettingsModel.getProperty("/settings/selectedSetting") === "SETTINGS_ADMIN_NOTIFICATIONS") {
					url = url + "ByAdmin";
				}
			} else if (action === "SAVE") {
				url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/updateProfile";
				if (oUserSettingsModel.getProperty("/settings/selectedSetting") === "SETTINGS_ADMIN_NOTIFICATIONS") {
					url = url + "ByAdmin";
					var selectedObject = oEvent.getSource().getBindingContext("oUserSettingsModel").getObject();
					selectedObject.isEnable = !selectedObject.isEnable;
					var sPath = oEvent.getSource().getBindingContext("oUserSettingsModel").getPath();
					oUserSettingsModel.setProperty(sPath, selectedObject)

					oPayload = {
						"profileName": selectedObject.profileName,
						"isEnable": selectedObject.isEnable
					}
				} else {
					oPayload = oUserSettingsModel.getProperty("/settings/notification/selectedProfile");
				}
			}
			// VALIDATION
			if (flag && (action === "SAVE" || action === "CREATE")) {
				if (oPayload.profileName && ((oPayload.scheduledTo && oPayload.scheduledFrom && oUserSettingsModel.getProperty(
							"/settings/selectedSetting") !== "SETTINGS_ADMIN_NOTIFICATIONS") || oUserSettingsModel.getProperty(
							"/settings/selectedSetting") ===
						"SETTINGS_ADMIN_NOTIFICATIONS")) {

				} else {
					flag = false;
				}
			}
			if (flag) {
				oUserSettingsModel.setProperty("/settings/busy", true);
				this.doAjax(url, "POST", oPayload, function (oData) {
					if (oData.statusCode === "0") {
						this.loadProfileNotificationSettings();
						this.closeAddNotifSettings();
					}
					oUserSettingsModel.setProperty("/settings/busy", false);
					this._showToastMessage(oData.message);

				}.bind(this), function (oEvent) {}.bind(this));
			}
		},
		openAddNotifSettings: function (oEvent, configType) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			this.getModel("oUserSettingsModel").setProperty("/settings/notification/addConfigHeader", oEvent.getSource().getText());
			var oNewConfiguration;
			if (configType === "ADDPROFILE") {
				oNewConfiguration = {
					"profileName": "",
					"isActive": true,
					"scheduledFrom": null,
					"scheduledTo": null,

				}

			} else if (configType === "ADDGROUP" || configType === "ADDCHANNEL") {
				oNewConfiguration = {
					"viewName": "",
				}
			}
			oUserSettingsModel.setProperty("/settings/notification/configType", configType);
			oUserSettingsModel.setProperty("/settings/notification/oNewConfiguration", oNewConfiguration);
			if (!this._oAddNotifSettings) {
				this._oAddNotifSettings = this._createFragment("oneapp.incture.workbox.fragment.AddNotifSettings", this);
				this.getView().addDependent(this._oAddNotifSettings);
			}
			this._oAddNotifSettings.open();
		},

		closeAddNotifSettings: function () {
			if (this._oAddNotifSettings && this._oAddNotifSettings.isOpen()) {
				this._oAddNotifSettings.close();
			}
			var oUserSettingsModel = this.getModel("oUserSettingsModel");

			oUserSettingsModel.setProperty("/settings/notification/newConfigName", "");
			oUserSettingsModel.setProperty("/settings/notification/oNewConfiguration", {});
			oUserSettingsModel.setProperty("/settings/notification/configType", "");

		},
		// Old notification code
		selectedChannelsChange: function (oEvent) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", true);
			var channel = oEvent.getSource().getBindingContext("oConstantsModel").getObject();
			var event = oEvent.getSource().getBindingContext("oUserSettingsModel").getObject();
			if (oEvent.getParameter("selected")) {
				event.channelLists.push(channel.valueName);
			} else {
				var index = event.channelLists.indexOf(channel.valueName);
				if (index !== -1) {
					event.channelLists.splice(index, 1);
				}
			}
			this.oUserSettingsModel.refresh(true);

		},
		saveNotificationConfig: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");

			var settingView = oUserSettingsModel.getProperty("/settings/settingView");
			if (settingView === "EVENTLIST") {
				// oUserSettingsModel.oData.settings.selectedNotification.viewDetails
				var viewDetails = oUserSettingsModel.getProperty("/settings/selectedNotification/viewDetails");
				oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", false);
			}
			if (settingView === "GROUP" || settingView === "CHANNEL") {
				var viewDetails = oUserSettingsModel.getProperty("/settings/selectedNotification/viewDetails");
				oUserSettingsModel.setProperty("/settings/notification/notificationEventChanged", false);
			}
		},
		// -------------------------------------------- END - NOTIFICATION METHODS---------------------------

		//	-------------------------------START - VERSION CONTROL METHODS---------------------------
		getAllVersions: function () {
			this.doAjax("/oneappinctureworkbox/WorkboxJavaService/versionControl/getAllVersion", "GET", null, function (oData) {
				// oData.versions = []
				var oUserSettingsModel = this.getModel("oUserSettingsModel");
				oUserSettingsModel.setProperty("/settings/allVersions", oData.versions);
				var versionNum = "",
					selectedVersion = "";
				if (oData.versions.length > 0) {
					selectedVersion = oData.versions[0].versionNumber;
					oUserSettingsModel.setProperty("/settings/selectedVersion", selectedVersion);
					this.loadVersions("=" + selectedVersion);
				} else if (this.oAppModel.getProperty("/currentView") === "adminConsole") {
					oUserSettingsModel.setProperty("/settings/selectedVersionTab", "createVersion");
					sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController().versionControlTabClick();

				}
			}.bind(this), function (oError) {}.bind(this));
		},
		loadVersions: function (versionNumber) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/busy", true);
			var url = "/oneappinctureworkbox/WorkboxJavaService/versionControl/getVersionDetail?versionNumber" + versionNumber;
			this.doAjax(url, "GET", null, function (oData) {
				var uploadAttachmentCounter = oUserSettingsModel.getProperty("/settings/uploadAttachmentCounter") || 0;

				// oUserSettingsModel.setProperty("/settings/uploadAttachmentCounter", 0);
				if (oData.message.statusCode === "0") {
					oUserSettingsModel.setProperty("/settings/versionDetails", oData.versionDetails);
					oUserSettingsModel.setProperty("/settings/selectedVersion", oData.versionDetails.versionNumber);
				}
				if (oUserSettingsModel.getProperty("/settings/createVersion") === "UPLOAD" && oUserSettingsModel.getProperty(
						"/settings/enableAttachmentInVC")) {
					var versionAttachments = oUserSettingsModel.getProperty("/settings/versionAttachments");
					for (var i = 0; i < versionAttachments.whatsNew.length; i++) {
						if (versionAttachments.whatsNew[i].attachmentDetails) {
							uploadAttachmentCounter++;
							oUserSettingsModel.setProperty("/settings/uploadAttachmentCounter", uploadAttachmentCounter);
							this.fnUploadAttachment(versionAttachments.whatsNew[i].attachmentDetails, oData.versionDetails.whatsNew[i].versionId);
						}
					}
					oUserSettingsModel.setProperty("/settings/createVersion", "")
					this.versionControlTabClick();
				}
				oUserSettingsModel.setProperty("/settings/busy", false);
			}.bind(this), function (oEvent) {}.bind(this));
		},

		//service call for Upload attachment
		fnUploadAttachment: function (oFile, versionId) {
			var that = this;
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var aAttachmentDetails = [];
			var oFormData = new FormData();

			var sFileType;

			var sFileExtension = oFile.attachmentType.substring(oFile.attachmentType.lastIndexOf("/") + 1);
			if (sFileExtension === "jpg" || sFileExtension === "jpeg" || sFileExtension === "png") {
				sFileType = "image/" + sFileExtension;
			} else if (sFileExtension === "mp4") {
				sFileType = "video/mp4"
			} else {
				sFileType = "application/" + sFileExtension;
			}
			oFormData.append("file", oFile.attachmentContent);
			oFormData.append("fileName", oFile.attachmentName);
			oFormData.append("versionId", versionId);
			oFormData.append("fileType", sFileType);

			var sAttachmentUrl = "/oneappinctureworkbox/WorkboxJavaService/versionControl/upload";
			setTimeout(function () {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("UPLOADING_TEXT") + oFile.attachmentName);
			}.bind(this), 1000);
			$.ajax({
				url: sAttachmentUrl,
				type: "POST",
				crossDomain: true,
				processData: false,
				contentType: false,
				data: oFormData,
				success: function (data, textStatus, XMLHttpRequest) {
					if (textStatus === "success") {
						var uploadAttachmentCounter = oUserSettingsModel.getProperty("/settings/uploadAttachmentCounter");
						uploadAttachmentCounter--;
						setTimeout(function () {
							this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("UPLOADED_TEXT") + oFile.attachmentName);
						}.bind(this), 1000);
						if (oUserSettingsModel.getProperty("/settings/selectedVersionTab") !== "createVersion") {
							this.loadVersions("=" + oUserSettingsModel.getProperty("/settings/selectedVersion"));
						}
					}
					oUserSettingsModel.setProperty("/settings/uploadAttachmentCounter", uploadAttachmentCounter);
					oUserSettingsModel.refresh(true);
				}.bind(this),
				error: function (data, textStatus, XMLHttpRequest) {
					sap.m.MessageToast.show("Error");
				}
			});
		},
		openLinkVersionControl: function (documentId, link) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			if (link) {
				window.open(link);
			} else {
				var url = "/oneappinctureworkbox/WorkboxJavaService/versionControl/getDocumentByID?documentID=" + documentId;
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILE_UPLOAD_MSG"));
				// this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("EMPTY_UPDATES_FOR_VERSION_CONTROL_TEXT"));

				this.doAjax(url, "GET", null, function (oData) {
						var fileType = oData.data.fileType.split("/")[1].replace(";base64", "");
						if (oData.data.attachmentType.includes("image")) {
							this.oAppModel.setProperty("/previewImage", true);
							this.openImageViewer(oData.data.encodedFileContent, oData.data.fileName, fileType, "application/" + fileType, null);
						} else {
							var u8_2 = new Uint8Array(atob(oData.data.encodedFileContent).split("").map(function (c) {
								return c.charCodeAt(0);
							}));
							var blob = new Blob([u8_2], {
								type: oData.data.fileType,
								name: oData.data.fileName + "." + fileType
							});
							var url = window.URL.createObjectURL(blob);
							window.open(url);

						}
					}.bind(this),
					function (oError) {}.bind(this));
			}
		},
		versionControlTabClick: function (oEvent) {
			var selectedKey;
			if (oEvent) {
				selectedKey = oEvent.getParameter("selectedKey");
			}
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			if (selectedKey === "versionHistory") {
				this.getAllVersions();
			} else if ((oEvent && selectedKey === "createVersion") || oUserSettingsModel.getProperty("/settings/selectedVersionTab") ===
				"createVersion") {
				var date = new Date();
				var newVersion = {
					"versionNumber": "",
					"projectCode": "INC00987",
					"projectName": "Workbox",
					"whatsNew": [{
						"detailType": "What's New",
						"labelDesc": "What's New",
						"description": "",
						"linkLabel": "",
						"link": "",
						"documentId": "",
						"validForUsage": null
					}],
					"bugFixes": [{
						"detailType": "Bug Fixes",
						"labelDesc": "Bug Fixes",
						"description": "",
						"linkLabel": "",
						"link": "",
						"documentId": "",
						"validForUsage": null
					}],
					"improvements": [{
						"detailType": "Improvements",
						"labelDesc": "Improvements",
						"description": "",
						"linkLabel": "",
						"link": "",
						"documentId": "",
						"validForUsage": null
					}],
					"technicalInformation": {
						"versionNumber": "",
						"dateofRelease": ("0" + date.getDate()).slice(-2) + "-" + date.toLocaleString('default', {
							month: 'short'
						}) + "-" + date.getFullYear().toString().substr(-2) + " " + date.toLocaleString('en-US', {
							hour: 'numeric',
							minute: 'numeric',
							hour12: true
						}),
						"language": "English, Indonesian, Arabic, Chinese",
						"osDetails": "Web, Android, iOS",
						"author": "Workbox",
						"applicationSize": "10MB",
						"users": "100",
						"frontendVersion": "",
						"gitDetails": "",
						"validForUsage": null
					},
					"validForUsage": null
				};
				var attachmentDto = {
					"versionNumber": "",
					"whatsNew": [{
						"linkLabel": "",
						"link": "",
						"documentId": "",
					}],
					"bugFixes": [{
						"linkLabel": "",
						"link": "",
						"documentId": "",
					}],
					"improvements": [{
						"linkLabel": "",
						"link": "",
						"documentId": "",
					}]
				};
				oUserSettingsModel.setProperty("/settings/newVersion", newVersion);
				oUserSettingsModel.setProperty("/settings/templateNewVersion", jQuery.extend(true, {}, newVersion));
				if (oUserSettingsModel.getProperty("/settings/enableAttachmentInVC")) {
					oUserSettingsModel.setProperty("/settings/versionAttachments", attachmentDto);
					oUserSettingsModel.setProperty("/settings/templateVersionAttachments", jQuery.extend(true, {}, attachmentDto));
				}
				selectedKey = "createVersion";
			}
			oUserSettingsModel.setProperty("/settings/selectedVersionTab", selectedKey);
			oUserSettingsModel.refresh(true);
		},
		addVersionDetails: function (selectedProperty) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var templateNewVersion = oUserSettingsModel.getProperty("/settings/templateNewVersion");
			var newVersion = oUserSettingsModel.getProperty("/settings/newVersion");
			newVersion[selectedProperty].push(jQuery.extend(true, {}, templateNewVersion[selectedProperty][0]));

			if (oUserSettingsModel.getProperty("/settings/enableAttachmentInVC")) {

				var versionAttachments = oUserSettingsModel.getProperty("/settings/versionAttachments");
				var templateVersionAttachments = oUserSettingsModel.getProperty("/settings/templateVersionAttachments");
				versionAttachments[selectedProperty].push(jQuery.extend(true, {}, templateVersionAttachments[selectedProperty][0]));

			}

			oUserSettingsModel.refresh(true);
		},
		deleteVersionDetails: function (oEvent) {
			var sPath = oEvent.getSource()._getPropertiesToPropagate()["oBindingContexts"]["oUserSettingsModel"].getPath();
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var index = sPath.slice(sPath.lastIndexOf("/") + 1);
			sPath = sPath.slice(0, sPath.lastIndexOf("/"));
			var selObj = oUserSettingsModel.getProperty(sPath);
			selObj.splice(index, 1);
			if (oUserSettingsModel.getProperty("/settings/enableAttachmentInVC")) {
				selObj = oUserSettingsModel.getProperty(sPath.replace("newVersion", "versionAttachments"));
				selObj.splice(index, 1);
			}

			oUserSettingsModel.refresh(true);
		},
		onClickApplyVersionControl: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel"),
				inValidLink = false;
			var newVersion = jQuery.extend(true, {}, oUserSettingsModel.getProperty("/settings/newVersion"));
			var versionAttachments = oUserSettingsModel.getProperty("/settings/versionAttachments");
			var flag = true,
				bAttachment = false;
			if (!newVersion.technicalInformation.versionNumber || !newVersion.technicalInformation.dateofRelease || !newVersion.technicalInformation
				.osDetails ||
				!newVersion.technicalInformation.language || !newVersion.technicalInformation.frontendVersion || !newVersion.technicalInformation
				.gitDetails
			) {
				flag = false;
			}
			if (flag) {
				for (var i = 0; i < newVersion.whatsNew.length; i++) {
					if (!bAttachment && newVersion.whatsNew[i].description &&versionAttachments && versionAttachments.whatsNew[i].attachmentDetails) {
						bAttachment = true;
					}
					newVersion.whatsNew[i].linkLabel = "";
					if (!newVersion.whatsNew[i].description) {
						newVersion.whatsNew.splice(i, 1);
						versionAttachments.whatsNew.splice(i, 1);
						i--;
					}
					if (newVersion.whatsNew[i].link && oUserSettingsModel.getProperty("/settings/enableAttachmentInVC")) {
						try {
							new URL(newVersion.whatsNew[i].link);
							inValidLink = !true;
						} catch (e) {
							inValidLink = !false;
						}
					}
				}
				for (i = 0; i < newVersion.bugFixes.length; i++) {

					newVersion.bugFixes[i].linkLabel = "";
					if (!newVersion.bugFixes[i].description) {
						newVersion.bugFixes.splice(i, 1);
						i--;
					}
				}
				for (i = 0; i < newVersion.improvements.length; i++) {
					newVersion.improvements[i].linkLabel = "";
					if (!newVersion.improvements[i].description) {
						newVersion.improvements.splice(i, 1);
						i--;
					}
				}
				if (newVersion.whatsNew.length > 0 || newVersion.bugFixes.length > 0 || newVersion.improvements.length > 0) {
					newVersion.versionNumber = newVersion.technicalInformation.versionNumber;
					if (inValidLink) {
						// If link is not valid
						this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("RECHECK_TRYOUT_LINK"));
					} else {
						// create version, validated 
						var url = "/oneappinctureworkbox/WorkboxJavaService/versionControl/createNewVersion";
						this.doAjax(url, "POST", newVersion, function (oData) {

								if (oData.status === "SUCCESS") {
									// call version details for the created version
									if (bAttachment) {
										oUserSettingsModel.setProperty("/settings/createVersion", "UPLOAD");
										this.loadVersions("=" + newVersion.versionNumber);
									} else {
										this.versionControlTabClick();
									}
								}
								this._showToastMessage(oData.message);
							}.bind(this),
							function (oError) {}.bind(this));

					}

				} else {
					// If whatsnew, bugfixes and improvements are empty
					this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("EMPTY_UPDATES_FOR_VERSION_CONTROL_TEXT"));
				}
			} else {
				// If technical details are empty
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			}

		},
		uploadVersionAttachment: function (oEvent) {
			var aFiles = oEvent.getParameter("files");
			var iFileSizeInBytes = 0;
			for (var i = 0; i < aFiles.length; i++) {
				iFileSizeInBytes = iFileSizeInBytes + aFiles[i].size;
			}
			var iFileSizeInMB = (iFileSizeInBytes / (1024 * 1024)).toFixed(2);
			if (iFileSizeInMB > 25) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILE_SIZE_EXCEEDED"));
			} else {
				var aAttachment = [];
				var sPath = oEvent.getSource()._getPropertiesToPropagate()["oBindingContexts"]["oUserSettingsModel"].getPath();

				var oUserSettingsModel = this.getModel("oUserSettingsModel");
				oUserSettingsModel.setProperty(sPath + "/link", "");
				this.uploadBase64Format(oEvent, function (oFile) {
					var attachment = {
						"attachment": oFile.filebase64Format,
						"attachmentName": oFile.fileName,
						"attachmentType": "application/" + oFile.fileType,
						"attachmentContent": oFile.fileContent
					};
					oUserSettingsModel.setProperty(sPath + "/linkLabel", oFile.fileName);
					oUserSettingsModel.setProperty(sPath.replace("newVersion", "versionAttachments") + "/attachmentDetails", attachment);
					oUserSettingsModel.refresh(true);
				}.bind(this));

			}
		},
		//	-------------------------------END - VERSION CONTROL METHODS---------------------------

		// -------------------------------------------- END - NOTIFICATION METHODS---------------------------

		onLogout: function () {
			sap.m.URLHelper.redirect("logout.html", false);
		},

		openUserProfile: function (oEvent) {
			var oSource = oEvent.getSource();
			if (!this._oUserProfile) {
				this._oUserProfile = this._createFragment("oneapp.incture.workbox.fragment.UserProfile", this);
				this.getView().addDependent(this._oUserProfile);
				var that = this;
			}
			this._oUserProfile.openBy(oSource);
		},

		// <------------------------------------ END - SETTINGS Methods------------------------------------->

		// <------------------------------------ START - Language Methods------------------------------------->
		onChangeLanguage: function (oEvent) {
			var key = oEvent.getSource().getSelectedKey();
			var oAppModel = this.getModel("oAppModel");
			oAppModel.setProperty("/selectedKey", key);
			oAppModel.setProperty("/languageChanged", true);
			if (key === "i18n_ENGLISH") {
				sap.ui.getCore().getConfiguration().setLanguage("en");
				oAppModel.setProperty("/selectedLanguage", "en");
			} else if (key === "i18n_INDONESIAN") {
				sap.ui.getCore().getConfiguration().setLanguage("in");
				oAppModel.setProperty("/selectedLanguage", "in");
			} else if (key === "i18n_ARABIC") {
				sap.ui.getCore().getConfiguration().setLanguage("ar");
				oAppModel.setProperty("/selectedLanguage", "ar");
			} else if (key === "i18n_CHINESE") {
				sap.ui.getCore().getConfiguration().setLanguage("zh");
				oAppModel.setProperty("/selectedLanguage", "zh");
			}
		},
		showTaskDetails: function (oEvent) {
			var oNotification = oEvent.getSource().getBindingContext("oUserSettingsModel").getObject();
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/notification/notificationBusy", true);
			var origin = oNotification.origin;
			if (origin === "Task") {
				this.navigateToTaskDetail(oNotification); // In Base Controller - By Karishma
				oUserSettingsModel.setProperty("/settings/notification/notificationBusy", false);
			}
		},
		// <------------------------------------ END - Language Methods------------------------------------->
		exportData: function (oEvent) {
			var filterData = this.oAppModel.getProperty("/filterData");
			var url = "/oneappinctureworkbox/WorkboxJavaService/filesExport/inboxDownload";

			this.doAjax(url, "POST", filterData, function (oData) {
					this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("EXPORTING_TEXT") + this.oAppModel.getProperty("/inbox/workBoxDtos").length + " tasks.");

					var fileName = filterData.inboxType;
					if (this.oAppModel.getProperty("/currentViewPage") === "AdminInbox") {
						fileName = "Admin Tasks";
					}
					if (oData.message.status === "SUCCESS") {
						this.downloadAttachment(null, "application/xlsx", fileName, oData.fileContent);
					}
				}.bind(this),
				function () {});
		},

		/*setUserWorkloadSortData: function () {
			var oUserWorkLoadSortData = this.getModel("oUserWorkLoadSortData");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var sortData = [{
				"key": "Ascending tasks",
				"value": i18n.getText("ASCENDING_TASKS_TEXT")
			}, {
				"key": "Descending tasks",
				"value": i18n.getText("DESCENDING_TASKS_TEXT")
			}, {
				"key": "Alphabetical",
				"value": i18n.getText("ALPHABETICAL_TASKS_TEXT")
			}];
			oUserWorkLoadSortData.setProperty("/sortData", sortData);
			oUserWorkLoadSortData.setProperty("/selectedSort", sortData[0].value);
		},*/
		/***************** Collaboration changes - BY Karishma *********************/
		onSelectingSuggestionItem: function (oEvent) {
			var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
			this.getView().setModel(oCollaborationModel, "oCollaborationModel");
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			oCollaborationModel.setProperty("/aChat", []);
			oCollaborationModel.setProperty("/selectedUserName", "");
			if (oEvent.getParameter("selectedItem")) {
				var sPath = oEvent.getParameter("selectedItem").getBindingContext("oAdvanceFilterModel").sPath;
				var oSearchObject = oAdvanceFilterModel.getProperty(sPath);
				this.getView().byId("WB_SIDENAV_LIST").setSelectedKey("directMessage");
				var sPlaceholder = this.getModel("i18n").getResourceBundle().getText("CHAT_SEARCH_PLACEHOLDER");
				oCollaborationModel.setProperty("/searchfieldPlaceholder", sPlaceholder);
				oCollaborationModel.setProperty("/selectedScreen", "directMessage");
				oCollaborationModel.setProperty("/bGlobalSearchPerson", true);
				oCollaborationModel.setProperty("/bGlobalSearch", false);
				oCollaborationModel.setProperty("/bNotGroupMember", false);
				this.fnGetChatHistory(oSearchObject);
			} else {
				oCollaborationModel.setProperty("/bGlobalSearch", true);
				oCollaborationModel.setProperty("/sSelectedIconTab", "Direct Message");
			}
			this.getView().byId("ID_GLOBAL_SEARCH").setValue("");
			// oAdvanceFilterModel.setProperty("/sGlobalSearchTerm", "");
		},
		fnGetChatHistory: function (oSearchObject) {
			var aMemberDetails = [],
				aMemberPid = [];
			var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
			this.getView().setModel(oCollaborationModel, "oCollaborationModel");
			var oLoggedInUser = {
				displayName: this.oAppModel.getProperty("/loggedInUserName"),
				email: this.oAppModel.getProperty("/loggedInUserDetails/userEmail"),
				firstName: this.oAppModel.getProperty("/loggedInUserDetails/userFirstName"),
				id: this.oAppModel.getProperty("/loggedInUserDetails/userId"),
				lastName: this.oAppModel.getProperty("/loggedInUserDetails/userLastName")
			};
			oCollaborationModel.setProperty("/oLoggedInUser", oLoggedInUser);
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			oCollaborationModel.setProperty("/selectedUserName", oSearchObject.displayName);
			oCollaborationModel.setProperty("/selectedChatId", oSearchObject.chatID);
			oCollaborationModel.setProperty("/sSelectedChatType", "personal");
			aMemberDetails.push(oSearchObject);
			aMemberDetails.push(oLoggedInUser);
			for (var i = 0; i < aMemberDetails.length; i++) {
				aMemberPid.push(aMemberDetails[i].id);
			}
			oCollaborationModel.setProperty("/aMemberDetails", aMemberDetails);
			oCollaborationModel.setProperty("/aMemberPid", aMemberPid);
			oCollaborationModel.setProperty("/bInitiateChat", false);
			oCollaborationModel.setProperty("/bFirstTimeHistory", true);
			oCollaborationModel.setProperty("/aChat", []);
			oCollaborationModel.setProperty("/iPageCount", 0);
			// if (oSearchObject.chatID) {
			this.fnGetHistoryServiceCall(sUserId, oSearchObject.chatID)
				// } else {
				// 	oCollaborationModel.setProperty("/bInitiateChat", true);
				// 	oCollaborationModel.setProperty("/selectedChatId", "");
				// }

			// var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
		},
		fnGetHistoryServiceCall: function (sUserId, sChatId) {
			var that = this;
			var collaboration = sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.Chat');
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var url = "/ActJavaService/chat/chatList/personal/" + sUserId;
			this.doAjax(url, "GET", null, function (oData) {
				var aChatList = oData.data;
				for (var i = 0; i < aChatList.length; i++) {
					var aFilter = aChatList[i].memberDetails.filter(function (obj) {
						return (obj.id !== sUserId);
					});
					aChatList[i].senderDetails = aFilter;
				}
				oCollaborationModel.setProperty("/userList", aChatList);
			}.bind(this), function (oError) {}.bind(this));
			if (!sChatId) {
				oCollaborationModel.setProperty("/bInitiateChat", true);
				oCollaborationModel.setProperty("/selectedChatId", "");
			} else {
				var iPageSize = 10;
				oCollaborationModel.setProperty("/bChatScreenLoader", true);
				var url = "/ActJavaService/chat/chatHistory/" + sUserId + "/" + sChatId + "/0/" + iPageSize;
				this.doAjax(url, "GET", null, function (oData) {
						if (oData.data) {
							var bIsDeliver = false,
								bIsSent = false;
							var aMessages = oData.data.chatHistory;
							aMessages = aMessages.sort((a, b) => new Date(Number(a.sentAt)) - new Date(Number(b.sentAt)));
							for (var j = aMessages.length - 1; j >= 0; j--) {
								if (aMessages[j].sentBy === sUserId) {
									if (aMessages[j].messageStatus.length > 0) {
										var aMessageStatus = aMessages[j].messageStatus;
										var aStatusFilter = aMessageStatus.filter(function (obj) {
											return (obj.status === "READ");
										});
										if (aMessageStatus.length === aStatusFilter.length) {
											aMessages[j].commentStatus = "READ";
											break;
										} else {
											var aStatusFilter = aMessageStatus.filter(function (obj) {
												return (obj.status === "DELIVERED");
											});
											if (aMessageStatus.length === aStatusFilter.length) {
												if (!bIsDeliver) {
													aMessages[j].commentStatus = "DELIVERED";
													bIsDeliver = true;
												}
											} else {
												var aStatusFilter = aMessageStatus.filter(function (obj) {
													return (obj.status === "SENT");
												});
												if (aStatusFilter.length > 0) {
													if (!bIsSent) {
														aMessages[j].commentStatus = "SENT";
														bIsSent = true;
													}
												} else {
													if (!bIsDeliver) {
														aMessages[j].commentStatus = "DELIVERED";
														bIsDeliver = true;
													}
												}
											}
										}
									}
								}
							}
							// for (var j = aMessages.length - 1; j >= 0; j--) {
							// 	if (aMessages[j].sentBy === sUserId) {
							// 		if ((aMessages[j].messageStatus.length > 0) && aMessages[j].messageStatus[0].status === "READ") {
							// 			aMessages[j].commentStatus = aMessages[j].messageStatus[0].status;
							// 			break;
							// 		}
							// 		if ((aMessages[j].messageStatus.length > 0) && aMessages[j].messageStatus[0].status === "DELIVERED") {
							// 			if (!bIsDeliver) {
							// 				aMessages[j].commentStatus = aMessages[j].messageStatus[0].status;
							// 				bIsDeliver = true;
							// 			}
							// 		}
							// 		if ((aMessages[j].messageStatus.length > 0) && aMessages[j].messageStatus[0].status === "SENT") {
							// 			if (!bIsSent) {
							// 				aMessages[j].commentStatus = aMessages[j].messageStatus[0].status;
							// 				bIsSent = true;
							// 			}
							// 		}
							// 	}
							// }
							oCollaborationModel.setProperty("/aChat", aMessages);
							oCollaborationModel.setProperty("/scrollHeight", sap.ui.Device.resize.height - 237 + "px");
							that.scrollBottom("ID_CHAT_SCROLLCONTAINER", collaboration.getController());
							oCollaborationModel.setProperty("/bChatScreenLoader", false);
							var iTotalMessage = oData.data.totalItemCount;
							var iTotalPageCount = (iTotalMessage / iPageSize) === 0 ? (iTotalMessage / iPageSize) : Math.floor(iTotalMessage / iPageSize);
							oCollaborationModel.setProperty("/iTotalPageCount", iTotalPageCount);
						} else {
							oCollaborationModel.setProperty("/aChat", []);
							oCollaborationModel.setProperty("/bChatScreenLoader", false);
						}
						oCollaborationModel.refresh(true);
					}.bind(this),
					function (oData) {}.bind(this));
			}
		},
		chatGlobalSearch: function (value, sEvent) {
			// Chat Global search function
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
			this.getView().setModel(oCollaborationModel, "oCollaborationModel");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			oCollaborationModel.setProperty("/bGlobalSearchBusy", true);
			oCollaborationModel.setProperty("/iSearchMessagePageNo", 0);
			oCollaborationModel.setProperty("/iSearchPeoplePageNo", 0);
			oCollaborationModel.setProperty("/iSearchGroupPageNo", 0);
			if (value) {
				var oPayload = {
					"userID": sUserId,
					"term": value,
					"messages": {
						"pageNumber": 0,
						"pageSize": 11
					},
					"chats": {
						"pageNumber": 0,
						"pageSize": 11
					},
					"people": {
						"pageNumber": 0,
						"pageSize": 11
					}
				};
				var sSearchUrl = "/ActJavaService/chat/globalSearch";
				this.doAjax(sSearchUrl, "POST", oPayload, function (oData) {
					if (sEvent === "liveSearch") {
						oAdvanceFilterModel.setProperty("/aUsers", oData.data.people);
						// oSearchbar.getBinding("suggestionItems").filter(oData.data.people);
					} else if (sEvent === "globalSearchClick") {
						oCollaborationModel.setProperty("/iTotalPageCount", 0);
						var aMessages = oData.data.messages ? oData.data.messages : [];
						var aPeople = oData.data.people ? oData.data.people : [];
						var aGroup = oData.data.groupChats ? oData.data.groupChats : [];
						if (aMessages.length > 0) {
							for (var i = 0; i < aMessages.length; i++) {
								if (aMessages[i].chatType === "personal") {
									var aFilter = aMessages[i].memberDetails.filter(function (obj) {
										return (obj.id !== sUserId);
									});
									aMessages[i].senderDetails = aFilter;
								}
							}
						}
						var iTotalMessageCount = oData.data.messagesPage.totalItemCount;
						var iTotalSearchMessagePage = (iTotalMessageCount % 11) === 0 ? (iTotalMessageCount / 11) - 1 : Math.floor(
							iTotalMessageCount /
							11);
						var iTotalPeopleCount = oData.data.peoplePage.totalItemCount;
						var iTotalSearchPeoplePage = (iTotalPeopleCount % 11) === 0 ? (iTotalPeopleCount / 11) - 1 : Math.floor(iTotalPeopleCount /
							11);
						var iTotalGroupCount = oData.data.groupPage.totalItemCount;
						var iTotalSearchGroupPage = (iTotalGroupCount % 11) === 0 ? (iTotalGroupCount / 11) - 1 : Math.floor(iTotalGroupCount / 11);
						oCollaborationModel.setProperty("/iTotalSearchMessagePage", iTotalSearchMessagePage);
						oCollaborationModel.setProperty("/iTotalSearchPeoplePage", iTotalSearchPeoplePage);
						oCollaborationModel.setProperty("/iTotalSearchGroupPage", iTotalSearchGroupPage);
						oCollaborationModel.setProperty("/aSearchMessage", aMessages);
						oCollaborationModel.setProperty("/aSearchPeople", aPeople);
						oCollaborationModel.setProperty("/aSearchGroup", aGroup);
						var oMessageTab = oCollaborationModel.getProperty("/oMessageTab");
						var iMessageTabHeight = $("#" + oMessageTab.getId())[0].scrollHeight;
						oCollaborationModel.setProperty("/iMessageTabHeight", iMessageTabHeight);
						oCollaborationModel.setProperty("/bGlobalSearchBusy", false);
					}
				}.bind(this), function (oError) {}.bind(this));
			}
		},
		fnResetChatGlobalSearch: function (value) {
			var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
			this.getView().setModel(oCollaborationModel, "oCollaborationModel");
			oCollaborationModel.setProperty("/bGlobalSearch", true);
			oCollaborationModel.setProperty("/aChat", []);
			oCollaborationModel.setProperty("/aMemberDetails", []);
			oCollaborationModel.setProperty("/selectedUserName", "");
			oCollaborationModel.setProperty("/sParticipantsName", "");
			oCollaborationModel.setProperty("/sSelectedChatType", "");
			oCollaborationModel.setProperty("/sGlobalSearchTerm", value);
			oCollaborationModel.setProperty("/bNotGroupMember", false);
			oCollaborationModel.setProperty("/sSelectedSearchTab", "Mesaages");
			oCollaborationModel.setProperty("/bGlobalSearchBusy", false);
			// var oMessageTab = oCollaborationModel.getProperty("/oMessageTab");
			// var iMessageTabHeight = $("#" + oMessageTab.getId())[0].scrollHeight;
			// oCollaborationModel.setProperty("/iMessageTabHeight", iMessageTabHeight);
		},

		/***************** Collaboration changes End- BY Karishma *********************/
		/*****************Dashboard changes by Arpita - start *************************/
		dashBoardSettings: function (oEvent) {
			this.onGraphSettings();
			this.openManageFilter();

		},

		/*****************Dashboard changes by Arpita - start *************************/

		onGraphSettingsDrop: function (oInfo) {
			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),
				oGrid = oDragged.getParent(),
				oGraphDataModel = this.getModel("oGraphDataModel"),
				oData = this.getModel("oGraphDataModel").getProperty("/graphData"),
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
			oGraphDataModel.setProperty("/graphData", oData);
			if (this.oAppModel.getProperty("/ManageFilterActive")) {
				sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().wbGridRender(true);
			}
		},

		//Email Template task save in admin console
		sendEmailfn: function () {
			var oDefaultDataModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getModel(
				"oDefaultDataModel");
			var adminConsole = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.AdminConsole").getController();
			var oAppModel = this.oAppModel;
			oAppModel.setProperty("/emailTemplatelistVisible", true);
			oAppModel.setProperty("/emailTemplateVisible", false);
			oAppModel.refresh(true);
			var tempData = oDefaultDataModel.getProperty("/emailAttributesDetails/customAttibutes");
			var data = oDefaultDataModel.getProperty("/emailTemplateDetails");
			var subjectData = data.emailContent.subject;
			for (var i = 0; i < tempData.length; i++) {
				if (subjectData.includes(tempData[i].label)) {
					subjectData = subjectData.replace(("{" + tempData[i].label + "}"), ("${" + tempData[i].key + "}"));
					i = i - (i + 1);
				}
			}
			data.emailContent.subject = subjectData;

			var bodyData = data.emailContent.messageBody;
			for (i = 0; i < tempData.length; i++) {
				if (bodyData.includes(tempData[i].label)) {
					bodyData = bodyData.replace(("{" + tempData[i].label + "}"), ("${" + tempData[i].key + "}"));
					i = i - (i + 1);
				}
			}
			data.emailContent.messageBody = bodyData;
			var url = "/oneappinctureworkbox/WorkboxJavaService/emailTemplate/saveEmailTemplate";
			this.doAjax(url, "POST", data, function (oData) {
				this._showToastMessage(oData.message);
				// this.setEmailTemplateData();
				adminConsole.getEmailTemplate();
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},
		onGraphSettingsData: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().onGraphSettings();
		},
		onGraphSettings: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var graphData = oGraphDataModel.getProperty("/graphData");
			if (!graphData) {
				this.graphSettingsData();
			}
		},

		graphSettingsData: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			oGraphDataModel.setProperty("/graphActiveTasks", true);
			oGraphDataModel.setProperty("/graphTaskCompletionTrend", false);
			oGraphDataModel.setProperty("/graphUserWorkItemText", true);
			oGraphDataModel.setProperty("/graphTaskSummary", false);
			var graphSettingsData = [{
					"graph": i18n.getText("ACTIVE_TASKS_TEXT"),
					"key": "activeTasks",
					"fragment": this.frag1,
					"width": "50",
					"isActive": oGraphDataModel.getProperty("/graphActiveTasks")
				}, {
					"graph": i18n.getText("TASK_COMPLETION_TREND_TEXT"),
					"key": "taskCompletionTrend",
					"fragment": this.frag2,
					"width": "50",
					"isActive": oGraphDataModel.getProperty("/graphTaskCompletionTrend")

				}, {
					"graph": i18n.getText("USER_WORK_ITEM_TEXT"),
					"key": "userWorkloadItem",
					"fragment": this.frag3,
					"width": "50",
					"isActive": oGraphDataModel.getProperty("/graphUserWorkItemText")
				}, {
					"graph": i18n.getText("TASK_SUMMARY_TEXT"),
					"key": "taskSummary",
					"fragment": this.frag4,
					"width": "50",
					"isActive": oGraphDataModel.getProperty("/graphTaskSummary")
				}
				/*, {
								"graph": i18n.getText("ORIGIN_SYST_GRAPH_TEXT"),
								"key": "originSystem",
								"fragment": this.frag5
							}, {
								"graph": i18n.getText("STATUS_GRAPH_TEXT"),
								"key": "statusGraph",
								"fragment": this.frag6
							}*/
			];
			oGraphDataModel.setProperty("/graphData", graphSettingsData);
			oGraphDataModel.refresh();
		},

		onGraphActivate: function (oEvent) {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var state = oEvent.getParameters().state;
			var customKey = oEvent.getSource().getCustomData()[0].getKey();

			if (state) {
				if (customKey === "activeTasks") {
					oGraphDataModel.setProperty("/graphActiveTasks", true);
				} else if (customKey === "taskCompletionTrend") {
					oGraphDataModel.setProperty("/graphTaskCompletionTrend", true);
				} else if (customKey === "userWorkloadItem") {
					oGraphDataModel.setProperty("/graphUserWorkItemText", true);
				} else if (customKey === "taskSummary") {
					oGraphDataModel.setProperty("/graphTaskSummary", true);
				} else if (customKey === "originSystem") {
					oGraphDataModel.setProperty("/graphOriginSystem", true);
				} else if (customKey === "statusGraph") {
					oGraphDataModel.setProperty("/graphStatus", true);
				}
			} else {
				if (customKey === "activeTasks") {
					oGraphDataModel.setProperty("/graphActiveTasks", false);
				} else if (customKey === "taskCompletionTrend") {
					oGraphDataModel.setProperty("/graphTaskCompletionTrend", false);
				} else if (customKey === "userWorkloadItem") {
					oGraphDataModel.setProperty("/graphUserWorkItemText", false);
				} else if (customKey === "taskSummary") {
					oGraphDataModel.setProperty("/graphTaskSummary", false);
				} else if (customKey === "originSystem") {
					oGraphDataModel.setProperty("/graphOriginSystem", false);
				} else if (customKey === "statusGraph") {
					oGraphDataModel.setProperty("/graphStatus", false);
				}
			}
		},

		onGraphWidthChange: function (oEvent) {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var sPath = oEvent.getSource().getBindingContext("oGraphDataModel").sPath
			var id = oEvent.getParameters().selectedItem.getId().split("-")[2];
			var key = oEvent.getParameters().selectedItem.getKey();
			var customKey = oEvent.getSource().getCustomData()[0].getKey();
			if (key === "50") {
				if (customKey === "activeTasks") {
					oGraphDataModel.setProperty(sPath + "/width", "50");
				} else if (customKey === "taskCompletionTrend") {
					oGraphDataModel.setProperty(sPath + "/width", "50");
				} else if (customKey === "userWorkloadItem") {
					oGraphDataModel.setProperty(sPath + "/width", "50");
				} else if (customKey === "taskSummary") {
					oGraphDataModel.setProperty(sPath + "/width", "50");
				} else {
					if (customKey === "activeTasks") {
						oGraphDataModel.setProperty(sPath + "/width", "100");
					} else if (customKey === "taskCompletionTrend") {
						oGraphDataModel.setProperty(sPath + "/width", "100");
					} else if (customKey === "userWorkloadItem") {
						oGraphDataModel.setProperty(sPath + "/width", "100");
					} else if (customKey === "taskSummary") {
						oGraphDataModel.setProperty(sPath + "/width", "100");
					}
				}
			}
			if (this.oAppModel.getProperty("/ManageFilterActive")) {
				sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.Dashboard').getController().changeGraphWidth();
			}
		},
		////changes for custom excel upload --start
		uploadExcelWorksheetChange: function (oEvent) {
			var oCustomTaskModel = this.getModel("oCustomTaskModel");
			taskManagement.uploadExcelWorksheetChangeTM(oEvent, oCustomTaskModel, this);
		},
		onImportSelectedRow: function (oEvent) {
			this.onCloseReviewSelectionFragment();
			var oCustomTaskModel = this.getModel("oCustomTaskModel");
			taskManagement.onImportSelectedRowTM(oCustomTaskModel, this);
		},
		onCloseReviewSelectionFragment: function () {
			sap.ui.core.Fragment.byId("ID_EXCEL_CUSTOMIZING", "ID_WORKSHEET").setSelectedItem(null);
			this._oCustomInputExcel.close();
		},
		onSelectExcelRange: function (oEvent) {
			var oCustomTaskModel = this.getModel("oCustomTaskModel");
			taskManagement.onSelectExcelRangeTM(oEvent, oCustomTaskModel);
		},
		changeInRange: function (oEvent) {
			var oCustomTaskModel = this.getModel("oCustomTaskModel");
			taskManagement.changeInRangeTM(oEvent, oCustomTaskModel);
		},
		////changes for custom excel upload --end
		// filter scroll changes
		scrollFilterCarousel: function (oEvent, direction) {
			var oScrollContainer = this.getView().byId("ID_FILTER_CAROUSEL").getId();
			var leftPos = $("#" + oScrollContainer).scrollLeft();
			var scrollPos;
			if (direction === "L") {
				scrollPos = leftPos - 250;

			} else if (direction === "R") {
				scrollPos = leftPos + 250;
			}
			$("#" + oScrollContainer).animate({
				scrollLeft: scrollPos
			}, 200);
			this.showScrollCarouselIcon()
			this.oAppModel.refresh(true)
		},
		showScrollCarouselIcon: function () {
			var oScrollContainer = this.getView().byId("ID_FILTER_CAROUSEL");
			var id = oScrollContainer.getId();
			var width = $('#' + id).outerWidth()
			var scrollWidth = $('#' + id)[0].scrollWidth;
			var scrollLeft = $('#' + id).scrollLeft();
			// Extreme left
			if (scrollLeft === 0) {
				oScrollContainer.getParent().getItems()[0].setVisible(false);
			} else {
				oScrollContainer.getParent().getItems()[0].setVisible(true);
			}
			// Extreme right
			if (scrollWidth - width === scrollLeft) {
				oScrollContainer.getParent().getItems()[2].setVisible(false);
			} else {
				oScrollContainer.getParent().getItems()[2].setVisible(true);
			}
        },
        
        //Jabil Changes - start
        	/***********Jabil Changes - Start*************/
		openSubstitution: function () {
            //this.setModel(oUserSubstitutionModel, "oUserSubstitutionModel");
            var oUserSubstitutionModel = this.getModel("oUserSettingsModel");
            var oUserSettingsModel = this.getModel("oUserSettingsModel");
            if (!this._substitution) {
                this._substitution = this._createFragment("oneapp.incture.workbox.fragment.UserSubstitutions", this);
                this.getView().addDependent(this._substitution);
                this._substitution.setModel(oUserSubstitutionModel, "oUserSubstitutionModel");
			}
			this._substitution.setModel(oUserSubstitutionModel, "oUserSubstitutionModel");
            //this.wbPrepareActionPayload(selectedAction); // to prepare payload
            oUserSettingsModel.setProperty("/addNewSub", false);
            this.loadSubstitutionData("mySubs");
			this._substitution.open();
        },
        
        onCloseSubstitution: function(){
        	this._substitution.close();
        },
        
        substitutionITBSelect: function (oEvent) {
			var selectedKey = oEvent.getParameters().selectedKey;
			var oUserSubstitutionModel = this.getModel("oUserSettingsModel");
			oUserSubstitutionModel.setProperty("/selectedSubstitution", selectedKey);
			if (selectedKey === "MySubstitutes") {
				this.loadSubstitutionData("mySubs");
			} else if (selectedKey === "ImSubstituting") {
				this.loadSubstitutionData("iAmSubs");
			}
		},
		
		loadSubstitutionData: function (property) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			this.backToSubsScreen();
			var url = "";
			var payload = null;
			var serviceType = "GET";
			var userId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataText" + property, false);

			oUserSettingsModel.setProperty("/settings/busy", true);
			if (property === "mySubs") {
				url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/substituting";
			}
			if (property === "iAmSubs") {
				url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/substituted";
			}
			if (property === "allSubs") {
				serviceType = "POST";
				payload = {};
				url = "/oneappinctureworkbox/WorkboxJavaService/substitutionRule/getRules";
			}
			this.doAjax(url, serviceType, payload, function (oData) {
				oUserSettingsModel.setProperty("/settings/substitutionSettings/" + property, {});
				oUserSettingsModel.setProperty("/settings/substitutionSettings/" + property, oData);
				oUserSettingsModel.setProperty("/settings/substitutionSettings/temp" + property, jQuery.extend(true, {}, oData));
				if (property === "mySubs") {
					oUserSettingsModel.setProperty("/substitutionDto", oUserSettingsModel.getProperty(
						"/settings/substitutionSettings/mySubs/dtoList"));
				} else if (property === "iAmSubs") {
					oUserSettingsModel.setProperty("/substitutionDto", oUserSettingsModel.getProperty(
						"/settings/substitutionSettings/iAmSubs/dtoList"));
				}
				if (oData.dtoList !== null) {
					if (oData.dtoList.length > 0) {
						oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataText" + property, false);
					} else {
						oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataText" + property, true);
					}
				} else {
					oUserSettingsModel.setProperty("/settings/substitutionSettings/noDataText" + property, true);
				}
				oUserSettingsModel.setProperty("/settings/substitutionSettings/addRow", true);
				oUserSettingsModel.setProperty("/settings/busy", false);
				oUserSettingsModel.refresh(true);
			}.bind(this), function (oEvent) {}.bind(this));
		},
		
		backToSubsScreen: function () {
			var oUserSubstitutionModel = this.getModel("oUserSubstitutionModel");
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/addNewSub", false);
			oUserSettingsModel.setProperty("/backToSubScreen", true);
			oUserSettingsModel.refresh();
			//this.loadSubstitutionData("mySubs");
		},
		
		addSubstitute: function () {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var oUserSubstitutionModel = this.getModel("oUserSubstitutionModel");
			oUserSettingsModel.setProperty("/isSubstitutionList", false);
			oUserSettingsModel.setProperty("/addNewSub", true);
			oUserSettingsModel.setProperty("/backToSubScreen", false);
			/*	oUserSettingsModel.getProperty("/updateSubs", false);*/
			oUserSettingsModel.setProperty("/updateSubs", false);
			oUserSettingsModel.setProperty("/addSubstituteDto", {
				"processList": []
			});
			var addSubstituteDto = oUserSettingsModel.getProperty("/addSubstituteDto");
			addSubstituteDto.active = "true";
			addSubstituteDto.createdBy = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			addSubstituteDto.createdByDisp = this.oAppModel.getProperty("/loggedInUserName");
			addSubstituteDto.disableButton = "true";
			addSubstituteDto.enabled = "true";
			addSubstituteDto.onBehalfOf = "";
			addSubstituteDto.startDate = "";
			addSubstituteDto.endDate = "";
			addSubstituteDto.substitutingUserName = "";
			addSubstituteDto.substitutingUser = "";
			addSubstituteDto.substitutedUser = this.oAppModel.getProperty("/loggedInUserDetails/userId")
			addSubstituteDto.substitutedUserName = this.oAppModel.getProperty("/loggedInUserName");
			//addSubstituteDto.substitutingUser = this.oAppModel.getProperty("/loggedInUserName");
			oUserSettingsModel.setProperty("/addSubstituteDto/startDate", "");
			oUserSettingsModel.setProperty("/addSubstituteDto/endDate", "");

		},
		
		substitutionSuggestionItemSelect: function (oEvent) {
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var selectedItem = oEvent.getParameters().selectedItem.getText();
			var selectedKey = oEvent.getParameters().selectedItem.getKey();
			var createdUser = oUserSettingsModel.getProperty("/addSubstituteDto").substitutedUser;
			if (createdUser === selectedKey) {
				this._showToastMessage("Can't substitute same loggedin user");
				oUserSettingsModel.setProperty("/addSubstituteDto/substitutingUserName", null);
			} else {
				oUserSettingsModel.setProperty("/addSubstituteDto/substitutingUserName", selectedItem);
				oUserSettingsModel.setProperty("/addSubstituteDto/substitutingUser", selectedKey);
				oUserSettingsModel.refresh();
			}
        },
        
        handleFirstDateChange: function (oEvent) {
			var fromDate = oEvent.getSource().getDateValue().getTime();
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/fromDate", fromDate);
			var currentDate = new Date();
			var prevDate = currentDate.setDate(currentDate.getDate() - 1);
			if (fromDate <= prevDate) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("DATE_ERROR_SUBSTITUTION"));
				oUserSettingsModel.setProperty("/addSubstituteDto/startDate", "");
				oUserSettingsModel.setProperty("/fromDate", "");
			}

			if (oUserSettingsModel.getProperty("/toDate") !== "") {
				if (oUserSettingsModel.getProperty("/toDate") < fromDate) {
					this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FROM_DATE_TEXT_SUBSTITUTION"));
					oUserSettingsModel.setProperty("/addSubstituteDto/startDate", "");
					oUserSettingsModel.setProperty("/fromDate", "");
				}
			}
		},

		handleSecondDateChange: function (oEvent) {
			var toDate = oEvent.getSource().getDateValue().getTime();
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/toDate", toDate);
			var currentDate = new Date();
			var prevDate = currentDate.setDate(currentDate.getDate() - 1);
			if (toDate <= prevDate) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("DATE_ERROR_SUBSTITUTION"));
				oUserSettingsModel.setProperty("/addSubstituteDto/endDate", "");
				oUserSettingsModel.setProperty("/toDate", "");
			} else if (oUserSettingsModel.getProperty("/fromDate") !== "") {
				if (oUserSettingsModel.getProperty("/fromDate") > toDate) {
					this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("TO_DATE_GREATER_THAN_FROM"));
					oUserSettingsModel.setProperty("/addSubstituteDto/endDate", "");
					oUserSettingsModel.setProperty("/toDate", "");
				}
			}

		},
		/***********Jabil Changes - End*************/
    
        //Jabil Changes - end
        
	});
});
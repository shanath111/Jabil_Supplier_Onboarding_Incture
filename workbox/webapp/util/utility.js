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

		/*****Development by Vaishnavi - start*****/

		/***** App Controller (Common Functions) - start *****/

		//Function to set Side Nav items on load
		fnSetSideNavItemsUT: function (i18n, oAppModel, that) {
			var surl = "/WorkboxJavaService/inbox/inboxTiles";
			that.doAjax(surl, "GET", null, function (oData) {
				oAppModel.setProperty("/navigationItems", oData.inboxTypeDtos);
			}.bind(that), function (oError) {}.bind(that));
			oAppModel.setProperty("/currentView", "unifiedInbox");
			that.onSelectView();
		},

		//expandable collapsable functionality of side navigation list items
		onExpandCollapseNavBarUT: function (oAppModel, that) {
			if (oAppModel.getProperty("/functionality/expanded")) {
				oAppModel.setProperty("/functionality/expanded", false);
				oAppModel.setProperty("/functionality/direction", "Column");
				oAppModel.setProperty("/functionality/visibility", false);
			} else {
				oAppModel.setProperty("/functionality/expanded", true);
				oAppModel.setProperty("/functionality/direction", "Row");
				oAppModel.setProperty("/functionality/visibility", true);
				if (oAppModel.getProperty("/currentView") === "unifiedInbox" && that.oAppModel.getProperty("/isRightPaneVisible")) {
					sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().collapseRightPane();
				}
			}
		},

		/***** App Controller (Common Functions) - end *****/

		/***** Admin Console (Common Functions) - start *****/

		// according the to tab that is active, this will call the particular reset method
		onClickResetUT: function (that, oDefaultDataModel, oAppModel) {
			oAppModel.setProperty("/isChanged", false);
			var currentTab = oAppModel.getProperty("/currentViewPage");
			that.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", "MyInbox");
			if (currentTab === "tableConfiguration") {
				that.getCustomAttributes();
			} else if (currentTab === "graphConfiguration") {
				that.fetchGraphListfn();
				that.fetchGraphParameterfn();
				that.setGraphConfigData();
				oDefaultDataModel.setProperty("/sequenceApplyButton", false);
			} else if (currentTab === "workLoad") {
				that.getWorkLoadData();
			} else if (currentTab === "cfaApproverMatrix") {
				that.getCFAmatrixFn();
			} else if (currentTab === "workFlow" || currentTab === "createWorkFlow") {
				if (oDefaultDataModel.getProperty("/fromApp")) {
					oDefaultDataModel.setProperty("/setEnabled", true);
					oDefaultDataModel.setProperty("/taskAddButtonStatus", false);
					oDefaultDataModel.setProperty("/CustomAddButtonStatus", false);
					oDefaultDataModel.setProperty("/customDeleteButtonStatus", false);
					oDefaultDataModel.setProperty("/TaskDeleteButtonStatus", false);
					oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", true);
				}
				oDefaultDataModel.setProperty("/orderBy", null);
				oDefaultDataModel.setProperty("/ownerSequType", null);
				oAppModel.setProperty("/openPreviewWorkFlow", false);
				oDefaultDataModel.setProperty("/openPreviewWorkFlow", false);
				that.getWorkFlowData();
			} else if (currentTab === "manageWorkFlow") {
				that.getView().byId("ID_MANAGE_PROCESS_LIST").removeSelections();
				oAppModel.setProperty("/enableMWorkflowButton", false);
			} else if (currentTab === "taskCreation") {
				that.getUIGenerationPage();
			} else if (currentTab === "manageDashboardTiles") {
				that.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", "AdminInbox");
				that.fetchSavedFilters();
			} else if (currentTab === "taskDetailConfiguration") {
				oDefaultDataModel.setProperty("/configSelectedTab", "connectorConfiguration");
				oDefaultDataModel.setProperty("/configSelectedProcess", null);
				oDefaultDataModel.setProperty("/configuredProcessName", null);
				oDefaultDataModel.setProperty("/extraLayoutCustomData", []);
				oDefaultDataModel.setProperty("/layoutCustomData", null);
				oDefaultDataModel.setProperty("/isChanged", false);
				that.getSystemProcessFn();
				that.fetchConnectorListFn();
				that.setLayoutFn();
				oDefaultDataModel.setProperty("/taskTemplateData", []);
				oDefaultDataModel.setProperty("/taskTemplateData/layoutsData", []);
			} else if (currentTab === "auditLogs") {
				that.getAuditLogsData();
			} else if (currentTab === "emailTemplate") {
				oAppModel.setProperty("/emailTemplatelistVisible", true);
				oAppModel.setProperty("/emailTemplateVisible", false);
				that.getView().byId("idVerticalLayout").removeAllContent();
				that.setEmailTemplateData();
				that.getEmailTemplate();
				that.addRTE();
			} else if (currentTab === "manageSubstitution") {
				that.getManageSubstitutions();
				that.getModel("addNewModel").setProperty("/buttonEnability", true);
				that.getModel("addNewModel").refresh(true);
			} else if (currentTab === "versionControl") {
				that.versionControlTabClick();
			} else if (currentTab === "manageNotifiifcationSetting") {
				that.manageNotifiifcationSettings();
			} else if (currentTab === "advancedWorkFlow" || currentTab === "createAdvancedWorkFlow") {
				oDefaultDataModel.setProperty("/setEnabled", true);
				oDefaultDataModel.setProperty("/advancedWfData", null);
				that.setAdvancedWfData();
				that.getWorkFlowData();
				oAppModel.setProperty("/functionality/expanded", false);
				oAppModel.setProperty("/functionality/direction", "Column");
				oAppModel.setProperty("/functionality/visibility", false);
			} else if (currentTab === "manageIndividualBudget") {
				that.fetchBudgetListFn();
			}
			oAppModel.refresh(true);
		},

		// according the to tab that is active, this will call the particular submit method
		onClickApplyUT: function (that, oAppModel) {
			var currentTab = oAppModel.getProperty("/currentViewPage");
			oAppModel.setProperty("/isChanged", false);
			if (currentTab === "tableConfiguration") {
				that.customAttributesPost();
			} else if (currentTab === "workLoad") {
				that.workLoadDataPost();
			} else if (currentTab === "workFlow" || currentTab === "createWorkFlow") {
				that.createWorkFlowVaildation();
			} else if (currentTab === "graphConfiguration") {
				that.graphConfigPostFn();
			} else if (currentTab === "versionControl") {
				that.onClickApplyVersionControl();
			} else if (currentTab === "advancedWorkFlow" || currentTab === "createAdvancedWorkFlow") {
				that.createAdvancedWorkflowFn();
			}
			oAppModel.refresh();
		},

		/***** Admin Console (Common Functions) - end *****/

		/*****Development by Vaishnavi - end*****/

		// funtion for sorting dropdown in userworkload.
		setUserWorkloadSortData: function (that) {
			//var oUserWorkLoadSortData = this.getModel("oUserWorkLoadSortData");
			var i18n = that.getModel("i18n").getResourceBundle();
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
			that.oAppModel.setProperty("/sortData", sortData);
			that.oAppModel.setProperty("/selectedSort", "");
		}
	};
});
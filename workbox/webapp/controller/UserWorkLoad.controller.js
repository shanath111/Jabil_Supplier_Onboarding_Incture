sap.ui.define([
	"oneapp/incture/workbox/controller/BaseController",
	"oneapp/incture/workbox/util/formatter",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/m/Dialog"
], function (BaseController, formatter, taskManagement, workbox, utility, JSONModel, Sorter, Dialog) {
	"use strict";

	return BaseController.extend("oneapp.incture.workbox.controller.UserWorkLoad", {
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oAppModel = this.getOwner().getModel("oAppModel");
			this.oAppModel = oAppModel;
			var oUserWorkLoadData = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oUserWorkLoadData, "oUserWorkLoadData");
			oUserWorkLoadData = this.getModel("oUserWorkLoadData");
			oUserWorkLoadData.setProperty("/userWorkloadProcessName", "ALL");
			oUserWorkLoadData.setProperty("/UWLProcessSelected", "ALL");
			oUserWorkLoadData.setProperty("/userWorkloadRequestNumber", "");
			this.getProcessNameFunc(); //func to get all the process
			this.oRouter.attachRoutePatternMatched(function (oEvent) {
				if (oEvent.getParameter("name") === "UserWorkLoad") {
					this.oAppModel.setProperty("/transitionWait", false);

					oAppModel.setProperty("/currentView", "userWorkload");
					this.setNavigationDetailsFn();
					if (oAppModel.getProperty("/loadTableUserManagement") === true) {
						oAppModel.setProperty("/viewWorkLoadTable", true);
					} else {
						oAppModel.setProperty("/viewWorkLoadTable", false);
					}
					this.oAppModel.setProperty("/UWLProcessSelected", "ALL");
					oAppModel.setProperty("/loadTableUserManagement", false);
					oUserWorkLoadData.setProperty("/userWorkloadTaskType", "ALL");
					oAppModel.setProperty("/functionality/expanded", true);
					oAppModel.setProperty("/functionality/direction", "Row");
					oAppModel.setProperty("/functionality/visibility", true);
					this.fnUserData();
					this.removeAllTokens(true);
				}
			}.bind(this));
		},

		getProcessNameFunc: function () { //func to get all the process
			var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
			var url = "/WorkboxJavaService/heatMap/getSearchList";
			this.doAjax(url, "GET", null, function (oData) {
				oUserWorkLoadData.setProperty("/processNames", oData.procList);
				oUserWorkLoadData.setProperty("/selectedProcess", oData.procList[0].value); // setting the default data as 1st process in  dropdown
			}.bind(this), function (oError) {}.bind(this));
		},

		onTabSelect: function (oEvent) {
			var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
			var taskType = oEvent.getSource().getSelectedKey();
			oUserWorkLoadData.setProperty("/userWorkloadTaskType", taskType);
			this.fnUserData();
		},

		fnUserData: function () {
			//put busy indicator
			var that = this;
			var oAppModel = this.getModel("oAppModel");
			var selectedProcess = oAppModel.getProperty("/UWLProcessSelected");
			var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
			oUserWorkLoadData.setProperty("/workLoadDto", []);
			var processName = oUserWorkLoadData.getProperty("/selectedProcess");
			var requestNumber = oUserWorkLoadData.getProperty("/userWorkloadRequestNumber");
			var taskType = oUserWorkLoadData.getProperty("/userWorkloadTaskType");

			var oPayload = {
				"processName": selectedProcess,
				"requestId": requestNumber,
				"taskStatus": taskType
			};
			oUserWorkLoadData.getData().searchData = oPayload;
			oUserWorkLoadData.setProperty("/enableBusyIndicators", true);
			var url = "/WorkboxJavaService/heatMap/getUserWorkload";
			this.doAjax(url, "POST", oPayload, function (oEvent) {
				var userWorkloadDtos = oEvent.userWorkloadDtos;
				oUserWorkLoadData.setProperty("/userWorkloadDtos", userWorkloadDtos);
				that.getWorkLoadRange();
				oUserWorkLoadData.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oEvent) {}.bind(this));
		},

		/*onSearchPress: function () {
			this.fnUserData();
		},*/

		getWorkLoadRange: function () {
			var that = this;
			var i18n = this.getOwner().getModel("i18n").getResourceBundle();
			var url = "/WorkboxJavaService/config/workloadrange";
			this.getModel("oUserWorkLoadData").setProperty("/enableBusyIndicators", true);
			//	var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
			this.doAjax(url, "GET", null, function (oEvent) {
					var workLoadRange = oEvent.workloadRangeDtos;
					//	var oUserDefaultData = that.oAppModel.getData();
					var oUserWorkLoadData = that.getModel("oUserWorkLoadData");
					if (workLoadRange) {
						for (var i = 0; i < workLoadRange.length; i++) {
							if (workLoadRange[i].loadType === "HIGH") {
								var highLoadHighLimit = parseInt(workLoadRange[i].highLimit, 10);
								var highLoadLowLimit = parseInt(workLoadRange[i].lowLimit, 10);
							} else if (workLoadRange[i].loadType === "MEDIUM") {
								var normalLoadHighLimit = parseInt(workLoadRange[i].highLimit, 10);
								var normalLoadLowLimit = parseInt(workLoadRange[i].lowLimit, 10);
							} else if (workLoadRange[i].loadType === "LOW") {
								var lowLoadHighLimit = parseInt(workLoadRange[i].highLimit, 10);
								var lowLoadLowLimit = parseInt(workLoadRange[i].lowLimit, 10);
							}
						}
						oUserWorkLoadData.setProperty("/highLoadHighLimit", highLoadHighLimit);
						oUserWorkLoadData.setProperty("/highLoadLowLimit", highLoadLowLimit);
						oUserWorkLoadData.setProperty("/normalLoadHighLimit", normalLoadHighLimit);
						oUserWorkLoadData.setProperty("/normalLoadLowLimit", normalLoadLowLimit);
						oUserWorkLoadData.setProperty("/lowLoadHighLimit", lowLoadHighLimit);
						oUserWorkLoadData.setProperty("/lowLoadLowLimit", lowLoadLowLimit);
						var aLowTaskTile = [];
						var aNormalTaskTile = [];
						var aHighTaskTile = [];
						var userWorkLoadData = oUserWorkLoadData.getProperty("/userWorkloadDtos");
						if (userWorkLoadData) {
							for (var j = 0; j < userWorkLoadData.length; j++) {
								if (userWorkLoadData[j].noOfTask >= oUserWorkLoadData.getProperty("/lowLoadLowLimit") && userWorkLoadData[j].noOfTask <=
									oUserWorkLoadData.getProperty("/lowLoadHighLimit")) {
									userWorkLoadData[j].taskType = "Low"; //i18n.getText("WORKLOAD_LOW_TEXT");
									aLowTaskTile.push(userWorkLoadData[j]);
								} else if (userWorkLoadData[j].noOfTask >= oUserWorkLoadData.getProperty("/normalLoadLowLimit") && userWorkLoadData[j].noOfTask <=
									oUserWorkLoadData.getProperty("/normalLoadHighLimit")) {
									userWorkLoadData[j].taskType = "Normal"; //i18n.getText("WORKLOAD_NORMAL_TEXT");
									aNormalTaskTile.push(userWorkLoadData[j]);
								} else if (userWorkLoadData[j].noOfTask >= oUserWorkLoadData.getProperty("/highLoadLowLimit")) {
									userWorkLoadData[j].taskType = "High"; //i18n.getText("WORKLOAD_HIGH_TEXT");
									aHighTaskTile.push(userWorkLoadData[j]);
								}
							}
							var userWorkload = [{
								"loadHeader": i18n.getText("WORKLOAD_HIGH_TEXT"),
								"loadData": aHighTaskTile
							}, {
								"loadHeader": i18n.getText("WORKLOAD_NORMAL_TEXT"),
								"loadData": aNormalTaskTile
							}, {
								"loadHeader": i18n.getText("WORKLOAD_LOW_TEXT"),
								"loadData": aLowTaskTile
							}];
							oUserWorkLoadData.setProperty("/workLoadDto", userWorkload);
							this.onSortingUser(this.oAppModel.getProperty("/selectedSort"));
							this.getModel("oAppModel").setProperty("/workLoadDto", userWorkload);
							oUserWorkLoadData.setProperty("/enableBusyIndicators", false);
							oUserWorkLoadData.refresh(true);
						}
					} else {
						//toastMessage(oEvent.responseMessage.message);
					}
				}.bind(this),
				function (oEvent) {}.bind(this));
		},

		onSorting: function (oEvent) {
			var selectedSortType = oEvent.getSource().getSelectedKey();
			var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
			var highWorkLoadCount = oUserWorkLoadData.highWorkLoadCount;
			var normalWorkLoadCount = oUserWorkLoadData.normalWorkLoadCount;
			var lowWorkLoadCount = oUserWorkLoadData.lowWorkLoadCount;
			var totalWorkLoadCount = oUserWorkLoadData.totalWorkLoadCount;
			var oGrid = this.getView().byId("ID_USER_LIST_GRID");
			var oBinding = oGrid.getBinding("content");
			var bDescending = "";
			var aSorters = [];
			var sPath = "";
			if (selectedSortType === "Ascending tasks") {
				sPath = "noOfTask";
				bDescending = false;
			} else if (selectedSortType === "Descending tasks") {
				sPath = "noOfTask";
				bDescending = true;
			} else if (selectedSortType === "Alphabetical") {
				sPath = "userName";
				bDescending = false;
			} else {
				this.fnUserData();
			}
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
			oUserWorkLoadData.highWorkLoadCount = highWorkLoadCount;
			oUserWorkLoadData.normalWorkLoadCount = normalWorkLoadCount;
			oUserWorkLoadData.lowWorkLoadCount = lowWorkLoadCount;
			oUserWorkLoadData.totalWorkLoadCount = totalWorkLoadCount;
			oUserWorkLoadData.refresh(true);
		},

		onAfterRendering: function () {
			var that = this;
			var viewId = this.getView().getId();
			sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({
				"viewId": viewId
			}), "oUWLModel");
			var i18n = this.getOwner().getModel("i18n").getResourceBundle();
			var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
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
			var segmentedBtnData = [{
				"key": "ALL",
				"value": i18n.getText("ALL_TEXT")
			}, {
				"key": "RESERVED",
				"value": i18n.getText("INPROGRESS_TEXT")
			}, {
				"key": "READY",
				"value": i18n.getText("NEW_TEXT")
			}, ];
			// utility.setUserWorkloadSortData(that);
			oUserWorkLoadData.setProperty("/sortData", sortData);
			oUserWorkLoadData.setProperty("/segmentedBtnData", segmentedBtnData);
			this.oAppModel.setProperty("/sortData", sortData);
			this.oAppModel.setProperty("/segmentedBtnData", segmentedBtnData);
			this.oAppModel.setProperty("/selectedSort", "Ascending tasks");
		},
		onSortingUser: function (selectedSortType) {
			var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
			oUserWorkLoadData.setProperty("/enableBusyIndicators", true);
			/*var oContent = this.getView().byId("ID_WORKLOAD_TASKS");
			var oBindings = oContent.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];*/
			var sortDtoHigh = oUserWorkLoadData.getProperty("/workLoadDto")[0].loadData;
			var sortDtoNormal = oUserWorkLoadData.getProperty("/workLoadDto")[1].loadData;
			var sortDtoLow = oUserWorkLoadData.getProperty("/workLoadDto")[2].loadData;
			if (selectedSortType === "Ascending tasks") {
				sortDtoHigh.sort(function (a, b) {
					return a.noOfTask - b.noOfTask;
				});
				sortDtoNormal.sort(function (a, b) {
					return a.noOfTask - b.noOfTask;
				});
				sortDtoLow.sort(function (a, b) {
					return a.noOfTask - b.noOfTask;
				});
			} else if (selectedSortType === "Descending tasks") {
				sortDtoHigh.sort(function (a, b) {
					return b.noOfTask - a.noOfTask;
				});
				sortDtoNormal.sort(function (a, b) {
					return b.noOfTask - a.noOfTask;
				});
				sortDtoLow.sort(function (a, b) {
					return b.noOfTask - a.noOfTask;
				});
			} else if (selectedSortType === "Alphabetical") {
				sortDtoLow = this.alphabeticalSort(sortDtoLow);
				sortDtoNormal = this.alphabeticalSort(sortDtoNormal);
				sortDtoHigh = this.alphabeticalSort(sortDtoHigh);
			}
			oUserWorkLoadData.getProperty("/workLoadDto")[0].loadData = sortDtoHigh;
			oUserWorkLoadData.getProperty("/workLoadDto")[1].loadData = sortDtoNormal;
			oUserWorkLoadData.getProperty("/workLoadDto")[2].loadData = sortDtoLow;
			oUserWorkLoadData.setProperty("/enableBusyIndicators", false);
			oUserWorkLoadData.refresh(true);
		},
		alphabeticalSort: function (sortDto) {
			sortDto.sort(function (a, b) {
				if (!a.userName) {
					a.userName = "";
				}
				if (!b.userName) {
					b.userName = "";
				}

				var x = a.userName.toLowerCase();
				var y = b.userName.toLowerCase();
				if (x < y) {
					return -1;
				}
				if (x > y) {
					return 1;
				}
				return 0;
			});
			return sortDto;
		},
		/****** Development by Vaishnavi - start******/

		//on click of tile getting the data to generate the table
		openTableDetailFn: function (oEvent) {
			var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
			var processName = this.oAppModel.getProperty("/UWLProcessSelected");
			var status = oUserWorkLoadData.getProperty("/userWorkloadTaskType");
			var userID = oEvent.getSource().getBindingContext("oUserWorkLoadData").getObject().userId;
			oUserWorkLoadData.setProperty("/userWorkloadUserName", oEvent.getSource().getBindingContext("oUserWorkLoadData").getObject().userName);
			var filterData = {
				"quickFilter": {}
			};
			if (processName) {
				if (processName !== "ALL") {
					filterData.quickFilter.processName = processName;
				}
			}
			if (status !== "ALL") {
				filterData.quickFilter.status = status;
			}

			filterData.quickFilter.userId = userID;
			filterData.inboxType = "AdminInbox";
			var url = "/WorkboxJavaService/inbox/filterService";
			var oTaskInboxModel = sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.UnifiedInbox").getModel(
				"oTaskInboxModel");
			oTaskInboxModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "POST", filterData, function (oData) {
				this.oAppModel.setProperty("/viewWorkLoadTable", true);
				oUserWorkLoadData.setProperty("/tableData", oData);
				this.generateTable();
				oTaskInboxModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oData) {}.bind(this));
		},

		//structuring the data and generating the table
		generateTable: function () {
			var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
			var tableData = oUserWorkLoadData.getProperty("/tableData").workBoxDtos;
			var columnHeaders = oUserWorkLoadData.getProperty("/tableData").headerDto.headers;
			var lineItemData = [];
			for (var i = 0; i < tableData.length; i++) {
				var obj = {};
				for (var j = 0; j < columnHeaders.length; j++) {
					if (columnHeaders[j].type === "STANDARD") {
						obj[columnHeaders[j].key] = tableData[i][columnHeaders[j].key];

					}
				}
				obj.requestId = tableData[i].requestId;
				obj.createdAt = tableData[i].createdAt;
				obj.startedBy = tableData[i].startedBy;
				obj.description = tableData[i].taskDescription;
				obj.processName = tableData[i].processName;
				obj.subject = tableData[i].subject;
				obj.status = tableData[i].status;
				lineItemData.push(obj);
			}
			oUserWorkLoadData.getProperty("/tableData").headerData = columnHeaders;
			oUserWorkLoadData.getProperty("/tableData").lineItemData = lineItemData;

			var taskTable = this.getView().byId("ID_TASK_TABLE");
			taskTable.setVisibleRowCount(tableData.length);
			taskTable.setSelectionMode("None");
			var oTaskTableModel = this.getModel("oUserWorkLoadData");
			taskTable.setModel(oTaskTableModel);
			var headerData = oTaskTableModel.getProperty("/tableData").headerData;
			for (var z = 0; z < headerData.length; z++) {
				headerData[z].name = oTaskTableModel.getProperty("/tableData").headerData[z].name.toUpperCase();
			}
			oTaskTableModel.getProperty("/tableData").headerData[1].name.toUpperCase();

			taskTable.bindColumns("/tableData/headerData", function (sId, oContext) {
				var columnName = oContext.getObject().name;
				var template = oContext.getObject().key;
				return new sap.ui.table.Column({
					label: columnName,
					template: template,
					sortProperty: template
				});
			});
			taskTable.bindRows("/tableData/lineItemData");
		},

		//close table function
		exitTableDetailFn: function () {
			this.oAppModel.setProperty("/viewWorkLoadTable", false);
		},

		//on click of table row process story fragment is displayed
		fetchDetailsFn: function (oEvent) {
			var index = oEvent.getParameter("rowIndex");
			var taskDetails = this.getModel("oUserWorkLoadData").getProperty("/tableData").workBoxDtos[index];
			this.oAppModel.setProperty("/taskObjectDetails", taskDetails);
			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().checkNewTaskDetailTab();
		}

		/****** Development by Vaishnavi - end******/
	});
});
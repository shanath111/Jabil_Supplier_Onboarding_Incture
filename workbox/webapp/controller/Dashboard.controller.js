sap.ui.define([
	"oneapp/incture/workbox/controller/BaseController",
	"oneapp/incture/workbox/util/formatter",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/ui/core/Fragment"
], function (BaseController, formatter, taskManagement, workbox, utility, JSONModel, Dialog, Fragment) {
	"use strict";

	return BaseController.extend("oneapp.incture.workbox.controller.Dashboard", {

		/*****Development by Vaishnavi - start*****/

		onInit: function () {
			var oAppModel = this.getOwner().getModel("oAppModel");
			this.oAppModel = oAppModel;
			var oGraphDataModel = this.getOwnerComponent().getModel("oGraphDataModel");
			this.getView().setModel(oGraphDataModel, "oGraphDataModel");
			oGraphDataModel.setProperty("/enableBusyIndicators", {});
			oGraphDataModel.setProperty("/graphActiveTasks", true);
			oGraphDataModel.setProperty("/graphTaskCompletionTrend", false);
			oGraphDataModel.setProperty("/graphUserWorkItemText", true);
			oGraphDataModel.setProperty("/graphTaskSummary", false);
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.attachRoutePatternMatched(function (oEvent) {
				if (oEvent.getParameter("name") === "Dashboard") {
							this.oAppModel.setProperty("/transitionWait",false);
					oAppModel.setProperty("/currentView", "dashBoard");
					this.setNavigationDetailsFn();
					this.removeAllTokens(true);
					oAppModel.setProperty("/graphStatus", "");
					oAppModel.setProperty("/graphMeasureNames", "");
					oAppModel.setProperty("/isCritical", "");
					oAppModel.setProperty("/graphProcessName", null);
					oAppModel.setProperty("/graphProcessDisplayName", null);
					oAppModel.setProperty("/graphName", "");
					oAppModel.setProperty("/graphYear", "");
					oAppModel.setProperty("/graphUser", "");
					oAppModel.setProperty("/graphProcessMeasureName", "");
					oAppModel.setProperty("/donutGraphClicked", "");
					oAppModel.setProperty("/dynamicGraphFilterPayload", null);

					// Set Admin task in search for Dashboard
					// AdminInbox
					this.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", "AdminInbox");
					this.getModel("oAdvanceFilterModel").setProperty("/customTileClicked", false);
					this.getModel("oAdvanceFilterModel").setProperty("/selectedGraphGroupId", null);
					this.oAppModel.setProperty("/currentViewPage", "");
					this.createFrag();
					this.fnGetDurationData();
					this.fnGetProcessNames();
					this.fnGetGraphTiles();
					this.fnGetActiveTasksGraphData();
					this.fnGetTaskCompletionGraphData();
					this.fnGetUserWorkItemGraphData();
					this.fnGetTaskDonutGraphData();
					this.fnGetCustomGraphList();
					//this.fnGetDummyGraphData();
					//this.fnGetDummyGraphData2();
					//this.wbGridRender();
					this.changeGraphWidth();
					if(oGraphDataModel.getProperty("/graphData")){
						this.wbGridRender(true);
					}
					else{
						this.wbGridRender(false);
					}
				}
			}.bind(this));
		},

		//service call to get the custom graphs list
		fnGetCustomGraphList: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var url = "/WorkboxJavaService/Dashboard/getGraphList";
			oGraphDataModel.setProperty("/customGraphData", []);
			// oGraphDataModel.setProperty("/enableBusyIndicators/customGraph", true);
			this.doAjax(url, "GET", null, function (oData) {
				oGraphDataModel.setProperty("/customGraphDetails", oData.graphDetails);
				var graphCount = 0;
				for (var i = 0; i < oData.graphDetails.length; i++) {
					var graphData = oData.graphDetails[i];
					var surl = "/WorkboxJavaService/Dashboard/getCustomGraph/" + graphData.graphConfigId;
					var graphConfigId = graphData.graphConfigId;
					oGraphDataModel.setProperty("/enableBusyIndicators/" + graphConfigId, true);
					this.doAjax(surl, "GET", null, function (oData1) {
						var sequence;
						for (var j = 0; j < oData.graphDetails.length; j++) {
							if (oData1.graphConfigurationDo && (oData1.graphConfigurationDo.graphConfigId === oData.graphDetails[j].graphConfigId)) {
								sequence = oData.graphDetails[j].sequence;
								break;
							}
						}
						graphCount++;
						var customGraphs = oGraphDataModel.getProperty("/customGraphData");
						if (oData1.graphConfigurationDo) {
							customGraphs[sequence] = oData1;
						}
						oGraphDataModel.refresh(true);
						if (graphCount === oData.graphDetails.length) {
							this.createCustomGraphFragment();
						}
					}.bind(this), function (oError) {}.bind(this));
				}

				oGraphDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//setting the duration comboBox values
		fnGetDurationData: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var durationData = [{
				"key": "week",
				"text": "Week"
			}, {
				"key": "month",
				"text": "Month"
			}];
			oGraphDataModel.setProperty("/durationListData", durationData);
			oGraphDataModel.setProperty("/selectedDuration", "month");
		},

		//getting the process names and setting it to model
		fnGetProcessNames: function () {
			var oConstantsModel = this.getModel("oConstantsModel");
			oConstantsModel.setProperty("/selectedProcess", "ALL");
		},

		//to get all the tasks count and setting it to the model
		fnGetGraphTiles: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var url = "/WorkboxJavaService/Dashboard/getAllDetails?GraphType=taskCount";
			oGraphDataModel.setProperty("/enableBusyIndicators/count", true);
			this.doAjax(url, "GET", null, function (oData) {
				oGraphDataModel.setProperty("/graphTiles", oData.graphDto.tiles);
				oGraphDataModel.setProperty("/enableBusyIndicators/count", false);
			}.bind(this), function (oError) {}.bind(this));
			oGraphDataModel.refresh(true);
		},

		//to get the total active tasks graph data
		fnGetActiveTasksGraphData: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var url = "/WorkboxJavaService/Dashboard/getAllDetails?GraphType=activeTasksGraph";
			oGraphDataModel.setProperty("/enableBusyIndicators/activeGraph", true);
			this.doAjax(url, "GET", null, function (oData) {
				oGraphDataModel.setProperty("/totalActiveTaskList", oData.graphDto.totalActiveTaskList);
				this.setStackedBarGraph();
				oGraphDataModel.setProperty("/enableBusyIndicators/activeGraph", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		//to get the data for task completion trend graph and setting it to the model
		fnGetTaskCompletionGraphData: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var duration = oGraphDataModel.getProperty("/selectedDuration");
			var url = "/WorkboxJavaService/Dashboard/getAllDetails?GraphType=taskCompletionTrendGraph&duration=" + duration;
			oGraphDataModel.setProperty("/enableBusyIndicators/trendGraph", true);
			this.doAjax(url, "GET", null, function (oData) {
				oGraphDataModel.setProperty("/taskCompletionTrendList", oData.graphDto.taskCompletionTrendList);
				this.setTaskCompleteTrendGraph();
				oGraphDataModel.setProperty("/enableBusyIndicators/trendGraph", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		//to get the data for user work item graph and setting it to the model
		fnGetUserWorkItemGraphData: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var processName = this.getModel("oConstantsModel").getProperty("/selectedProcess");
			var url = "/WorkboxJavaService/Dashboard/getAllDetails?processName=" + processName + "&GraphType=userWorkCountGraph";
			oGraphDataModel.setProperty("/enableBusyIndicators/userGraph", true);
			this.doAjax(url, "GET", null, function (oData) {
				oGraphDataModel.setProperty("/userWorkCountList", oData.graphDto.userWorkCountList);
				this.setUserWorkItemGraph();
				oGraphDataModel.setProperty("/enableBusyIndicators/userGraph", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		//to get the data for donut graph and setting it to the model
		fnGetTaskDonutGraphData: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var url = "/WorkboxJavaService/Dashboard/getAllDetails?GraphType=taskSummary";
			oGraphDataModel.setProperty("/enableBusyIndicators/donutGraph", true);
			this.doAjax(url, "GET", null, function (oData) {
				var taskDonutList = oData.graphDto.taskDonutList;
				if (taskDonutList) {
					for (var i = 0; i < taskDonutList.length; i++) {
						taskDonutList[i].strDisplayName = taskDonutList[i].status + " " + taskDonutList[i].strName;
					}
				}
				oGraphDataModel.setProperty("/taskDonutList", oData.graphDto.taskDonutList);
				this.setDonutGraph();
				oGraphDataModel.setProperty("/enableBusyIndicators/donutGraph", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		//fetching the data and generating stacked bar graph
		setStackedBarGraph: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var oVizFrame = this.frag1.getItems()[1];
			oVizFrame.destroyFeeds();
			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					dataLabel: {
						showTotal: false
					},
					isRoundCorner: true
				},
				tooltip: {
					visible: true
				},
				title: {
					visible: false
				},
				interaction: {
					selectability: {
						axisLabelSelection: false,
						legendSelection: false
					}
				},
				categoryAxis: {
					label: {
						visible: true
					},
					title: {
						visible: false
					},
					axisIndicator: {
						enable: false
					}
				},
				valueAxis: {
					title: {
						visible: false
					}
				}
			});
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Process",
					value: "{processDisplayName}"
				}],
				measures: [{
					name: "On Time",
					value: "{inTime}"
				}, {
					name: "Critical",
					value: "{critical}"
				}, {
					name: "SLA Breached",
					value: "{slaBreached}"
				}],
				data: {
					path: "/totalActiveTaskList"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oGraphDataModel);

			var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["On Time"]
				}),
				oFeedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Critical"]
				}),
				oFeedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["SLA Breached"]
				}),
				oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Process"]
				});

			oVizFrame.addFeed(oFeedValueAxis);
			oVizFrame.addFeed(oFeedValueAxis1);
			oVizFrame.addFeed(oFeedValueAxis2);
			oVizFrame.addFeed(oFeedCategoryAxis);
			var maxValue = 6;
			var oGraphData = oGraphDataModel.getProperty("/totalActiveTaskList");
			if (oGraphData) {
				for (var i = 0; i < oGraphData.length; i++) {
					maxValue = Math.max(maxValue, oGraphData[i].inTime + oGraphData[i].critical + oGraphData[i].slaBreached);
				}
			}
			var scales = [{
				"feed": "color",
				"palette": ["#34A853", "#FBBC05", "#FF6060"]
			}, {
				"feed": "valueAxis",
				"max": maxValue
			}];
			oVizFrame.setVizScales(scales);

			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(oVizFrame.getVizUid());
		},

		//fetching the data and generating task completion trend graph
		setTaskCompleteTrendGraph: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			//var taskCompletionTrendGraph = this.getView().byId("WB_COLUMN_GRAPH");
			var taskCompletionTrendGraph = this.frag2.getItems()[1];
			taskCompletionTrendGraph.destroyFeeds();
			var name = "Month";
			if (oGraphDataModel.getProperty("/selectedDuration") === "week") {
				name = "Date";
			}
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: name,
					value: "{strName}"
				}],

				measures: [{
					name: "TaskCount",
					value: "{taskCount}"
				}],

				data: {
					path: "/taskCompletionTrendList"
				}
			});
			taskCompletionTrendGraph.setDataset(oDataset);
			taskCompletionTrendGraph.setModel(oGraphDataModel);
			taskCompletionTrendGraph.setVizProperties({
				title: {
					visible: false
				},
				interaction: {
					selectability: {
						axisLabelSelection: false,
						legendSelection: false
					}
				},
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					primaryScale: {
						minValue: 10
					},
					width: 4
				},
				categoryAxis: {
					label: {
						visible: true
					},
					title: {
						text: "{i18n>TASK_COUNT_TEXT}",
						visible: false
					}
				},
				valueAxis: {
					title: {
						visible: false
					}
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["TaskCount"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": [name]
				});
			taskCompletionTrendGraph.addFeed(feedValueAxis);
			taskCompletionTrendGraph.addFeed(feedCategoryAxis);
			var maxValue = 3;
			var oGraphData = oGraphDataModel.getProperty("/taskCompletionTrendList");
			if (oGraphData) {
				for (var i = 0; i < oGraphData.length; i++) {
					maxValue = Math.max(maxValue, oGraphData[i].taskCount);
				}
			}
			var scales = [{
				"feed": "color",
				"palette": ["#2f2c85"]
			}, {
				"feed": "valueAxis",
				"max": maxValue
			}];
			taskCompletionTrendGraph.setVizScales(scales);
		},

		//fetching the data and generating stacked column bar graph (user work item)
		setUserWorkItemGraph: function () {
			var oGraphDataModel = this.getView().getModel("oGraphDataModel");
			//	var userWorkItemGraph = this.getView().byId("WB_STACKED_COLUMNBAR_GRAPH");
			var userWorkItemGraph = this.frag3.getItems()[1];
			userWorkItemGraph.destroyFeeds();
			userWorkItemGraph.setVizProperties({
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					dataLabel: {
						showTotal: false
					},
					isRoundCorner: true
				},
				tooltip: {
					visible: true
				},
				title: {
					visible: false
				},
				interaction: {
					selectability: {
						axisLabelSelection: false,
						legendSelection: false
					}
				},
				categoryAxis: {
					label: {
						visible: true,
						hideSubLevels: true
					},
					title: {
						visible: false
					}
				},
				valueAxis: {
					title: {
						visible: false
					}
				}
			});
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "User Name",
					value: "{userName}"
				}, {
					name: "User ID",
					value: "{userId}"
				}],
				measures: [{
					name: "On Time",
					value: "{inTime}"
				}, {
					name: "Critical",
					value: "{critical}"
				}, {
					name: "SLA Breached",
					value: "{slaBreached}"
				}],
				data: {
					path: "/userWorkCountList"
				}
			});
			userWorkItemGraph.setDataset(oDataset);
			userWorkItemGraph.setModel(oGraphDataModel);

			var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["On Time"]
				}),
				oFeedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Critical"]
				}),
				oFeedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["SLA Breached"]
				}),

				oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["User Name"]
				}),
				oFeedCategoryAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["User ID"]
				});

			userWorkItemGraph.addFeed(oFeedValueAxis);
			userWorkItemGraph.addFeed(oFeedValueAxis1);
			userWorkItemGraph.addFeed(oFeedValueAxis2);
			userWorkItemGraph.addFeed(oFeedCategoryAxis);
			userWorkItemGraph.addFeed(oFeedCategoryAxis1);
			var maxValue = 3;
			var oGraphData = oGraphDataModel.getProperty("/userWorkCountList");
			if (oGraphData) {
				for (var i = 0; i < oGraphData.length; i++) {
					maxValue = Math.max(maxValue, oGraphData[i].inTime + oGraphData[i].critical + oGraphData[i].slaBreached);
				}
			}
			var userWorkItemGraphScales = [{
				"feed": "color",
				"palette": ["#34A853", "#FBBC05", "#FF6060"]
			}, {
				"feed": "valueAxis",
				"max": maxValue
			}];
			userWorkItemGraph.setVizScales(userWorkItemGraphScales);

			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(userWorkItemGraph.getVizUid());
		},

		//fetching the data and generating the donut graph
		setDonutGraph: function () {
			var oGraphDataModel = this.getView().getModel("oGraphDataModel");
			//var donutGraph = this.getView().byId("WB_DONUT_GRAPH");
			var donutGraph = this.frag4.getItems()[1];
			donutGraph.destroyFeeds();
			var oPieDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Task Name",
					value: "{strDisplayName}"
				}],
				measures: [{
					name: "Task Count",
					value: "{taskCount}"
				}],
				data: {
					path: "/taskDonutList"
				}
			});
			donutGraph.setDataset(oPieDataset);
			donutGraph.setModel(oGraphDataModel);
			donutGraph.setVizProperties({
				title: {
					visible: false
				},
				interaction: {
					selectability: {
						axisLabelSelection: false,
						legendSelection: false
					}
				}
			});
			var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "size",
					"type": "Measure",
					"values": ["Task Count"]
				}),
				feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "color",
					"type": "Dimension",
					"values": ["Task Name"]
				});
			donutGraph.addFeed(feedSize);
			donutGraph.addFeed(feedColor);
			var scales = [{
				"feed": "color",
				"palette": ["#34A853", "#2A5E2E", "#FBBC05", "#BC561E", "#5792F5", "#3F5690"]
			}];
			donutGraph.setVizScales(scales);
		},

		//function to set graph values for Custom Graphs
		setCustomGraphData: function (i, oVizFrame) {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			oVizFrame.destroyFeeds();
			var oDataset;
			if (oGraphDataModel.getProperty("/customGraphData/" + i)) {
				var x = oGraphDataModel.getProperty("/customGraphData/" + i + "/graphConfigurationDo/xLabel");
				var y = oGraphDataModel.getProperty("/customGraphData/" + i + "/graphConfigurationDo/yLabel");
				var chartType = oGraphDataModel.getProperty("/customGraphData/" + i + "/graphConfigurationDo/chartType");
				var xCategory = oGraphDataModel.getProperty("/customGraphData/" + i + "/graphConfigurationDo/xCategory");
				var yCategory = oGraphDataModel.getProperty("/customGraphData/" + i + "/graphConfigurationDo/yCategory");
			}
			if (chartType === "bar" || chartType === "stacked_bar") {
				y = [x, x = y][0];
			}

			////common Properties
			oVizFrame.setVizProperties({
				title: {
					visible: false
				},
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					dataPointSize: {
						max: 24,
						min: 24
					}
				},
				categoryAxis: {
					title: {
						visible: true,
						text: x
					},
					label: {
						rotation: "false",
						angle: "0",
						truncatedLabelRatio: "100"
					}
				},
				valueAxis: {
					title: {
						visible: true,
						text: y
					}
				}
			});

			////setting Dataset if category exist
			if (xCategory || yCategory) {
				var data = oGraphDataModel.getProperty("/customGraphData/" + i + "/data/0/graphDataCountDto");
				if (data)
					var len = data.length;
				var categoryMeasure = [];
				for (var j = 0; j < len; j++) {
					var a = {
						name: oGraphDataModel.getProperty("/customGraphData/" + i + "/data/0/graphDataCountDto/" + j + "/idDisplayName"),
						value: "{oGraphDataModel>graphDataCountDto/" + j + "/count}"
					};
					categoryMeasure.push(a);
					oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "valueAxis",
						'type': "Measure",
						'values': [oGraphDataModel.getProperty("/customGraphData/" + i + "/data/0/graphDataCountDto/" + j + "/idDisplayName")]
					}));
				}
				oDataset = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: x,
						value: "{oGraphDataModel>xDisplayValue}"
					}],

					measures: categoryMeasure,

					data: {
						path: 'oGraphDataModel>/customGraphData/' + i + '/data'
					}
				});

				oVizFrame.setDataset(oDataset);
			} else {
				////setting Dataset 
				oDataset = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: x,
						value: "{oGraphDataModel>xDisplayValue}"
					}],

					measures: [{
						name: y,
						value: "{oGraphDataModel>yValue}"
					}],

					data: {
						path: 'oGraphDataModel>/customGraphData/' + i + '/data'
					}
				});

				oVizFrame.setDataset(oDataset);
			}

			////adding FeedItem based on the Graph Type 
			if (chartType === "pie" || chartType === "donut") {
				var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "size",
						"type": "Measure",
						"values": [y]
					}),
					feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "color",
						"type": "Dimension",
						"values": [x]
					});
				oVizFrame.addFeed(feedSize);
				oVizFrame.addFeed(feedColor);
			} else {
				if (xCategory || yCategory) {
					var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "categoryAxis",
						'type': "Dimension",
						'values': [x]
					});
					// oVizFrame.addFeed(feedValueAxis);
					oVizFrame.addFeed(feedCategoryAxis);
					oVizFrame.setVizProperties({
						legendGroup: {
							layout: {
								position: "bottom",
								alignment: "center"
							}
						}
					});
				} else {
					var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
							'uid': "valueAxis",
							'type': "Measure",
							'values': [y]
						}),
						feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
							'uid': "categoryAxis",
							'type': "Dimension",
							'values': [x]
						});
					oVizFrame.addFeed(feedValueAxis);
					oVizFrame.addFeed(feedCategoryAxis);
					oVizFrame.setVizProperties({
						legendGroup: {
							layout: {
								position: "bottom",
								alignment: "center"
							}
						}
					});
				}
			}

			///setting barSpacing for column typed graphs
			if (chartType === "column" || chartType === "stacked_column") {
				oVizFrame.setVizProperties({
					plotArea: {
						gap: {
							barSpacing: 2.2
						}
					}
				});
			}
		},

		//on click of graph, fetching the detail of graph/tile and navigating to inbox page
		fetchGraphDetailFn: function (oEvent) {
			var oAppModel = this.oAppModel;
			oAppModel.setProperty("/graphClicked", "true");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			this.getModel("oAdvanceFilterModel").setProperty("/customTileClicked", false);
			if (oEvent.getSource().getAggregation("items")) {
				var oSelectedTile = oEvent.getSource().getBindingContext("oGraphDataModel").getObject();
				// if (oSelectedTile.type === "CUSTOM") {
				oAppModel.setProperty("/removeFilterToken", false);
				oSelectedTile.tilePayload = JSON.parse(oSelectedTile.tilePayload);
				var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
				oAppModel.setProperty("/isViewApplied", true);
				oAdvanceFilterModel.setProperty("/filterName", "");
				oAdvanceFilterModel.setProperty("/isView", false);
				oAdvanceFilterModel.setProperty("/viewName", "");
				oAdvanceFilterModel.setProperty("/filterId", "");
				oAdvanceFilterModel.setProperty("/viewAppliedContext", oSelectedTile.tilePayload);
				var searchInboxDto = this.oAppModel.getProperty("/searchInboxDto");
				for (var i = 0; i < searchInboxDto.length; i++) {
					if (searchInboxDto[i].inboxId === oSelectedTile.tilePayload.inboxType) {
						this.setCurrentPage(null, oSelectedTile.tilePayload.inboxType, oSelectedTile.tilePayload.name, true, true);
						oAdvanceFilterModel.setProperty("/inboxIdGraph", searchInboxDto[i].inboxId);
						oAdvanceFilterModel.setProperty("/inboxNameGraph", searchInboxDto[i].name);
						break;
					}
				}
				this.getModel("oAdvanceFilterModel").setProperty("/customTileClicked", true);
				var that = oAdvanceFilterModel.getProperty("/appController");
				that.setSavedFilterToInbox(oSelectedTile.tilePayload);
			}

			//if graph data is clicked
			else {
				if (oEvent.getParameters().data.length > 1) {
					return;
				}
				var selectedGraphData = oEvent.getParameter("data")[0].data;

				// if Total Active Tasks graph is clicked 
				if (selectedGraphData.Process) {
					oAppModel.setProperty("/graphUser", "");
					var rowNumber = oEvent.getParameter("data")[0].data._context_row_number;
					var processName = this.getModel("oGraphDataModel").getProperty("/totalActiveTaskList")[rowNumber].processName;
					var processDisplayName = this.getModel("oGraphDataModel").getProperty("/totalActiveTaskList")[rowNumber].processDisplayName;

					oAppModel.setProperty("/graphProcessName", processName);
					oAppModel.setProperty("/graphProcessDisplayName", processDisplayName);
					oAppModel.setProperty("/isCritical", true);
					oAppModel.setProperty("/graphName", "totalActiveTasks");
				}

				if (selectedGraphData.measureNames) {
					oAppModel.setProperty("/graphMeasureNames", selectedGraphData.measureNames);
				}

				//if task completion graph is clicked
				if (selectedGraphData.Year) {
					oAppModel.setProperty("/graphName", "taskCompletionTrend");
					oAppModel.setProperty("/graphYear", selectedGraphData.Year);
					oAppModel.setProperty("/isCritical", false);
					oAppModel.setProperty("/graphUser", "");
					oAppModel.setProperty("/graphStatus", "ALL COMPLETED");
				}

				// if User Workload graph is clicked
				if (selectedGraphData["User ID"]) {
					oAppModel.setProperty("/graphName", "userWorkItemCount");
					oAppModel.setProperty("/graphUser", selectedGraphData["User ID"]);
					oAppModel.setProperty("/isCritical", true);
					//oAppModel.setProperty("/graphStatus", "RESERVED");
					oAppModel.setProperty("/graphProcessName", this.getModel("oConstantsModel").getProperty("/selectedProcess"));
					oAppModel.setProperty("/graphProcessMeasureName", oEvent.getParameters().data[0].data.measureNames);
				}

				//if donut graph is clicked
				if (selectedGraphData["Task Name"]) {
					rowNumber = oEvent.getParameter("data")[0].data._context_row_number;
					var reportFilter = this.getModel("oGraphDataModel").getProperty("/taskDonutList")[rowNumber].strName;
					var status = this.getModel("oGraphDataModel").getProperty("/taskDonutList")[rowNumber].status;

					if (reportFilter === "SLA Breached") {
						reportFilter = "After SLA";
					}
					reportFilter = status + " " + reportFilter;

					var tokenDisplayName = this.getModel("oGraphDataModel").getProperty("/taskDonutList")[rowNumber].strDisplayName;
					oAppModel.setProperty("/graphMeasureTokenNames", tokenDisplayName);
					if (status === "In Progress") {
						status = "RESERVED";
					} else if (status === "Completed") {
						status = "ALL COMPLETED";
						oAppModel.setProperty("/taskSummaryCompletedTask", true);
					} else if (status === "New") {
						status = "READY";
					}
					oAppModel.setProperty("/graphStatus", status);
					oAppModel.setProperty("/graphMeasureNames", reportFilter);
					oAppModel.setProperty("/isCritical", false);
					oAppModel.setProperty("/donutGraphClicked", true);
				}
				this._doNavigate("UnifiedInbox", {});
			}
		},

		/*****Development by Vaishnavi - end*****/

		/*****Development by Arpita - start*****/

		dashBoardSettings: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.openManageFilter();
		},

		/*****Development by Arpita - end*****/

		fnGetDummyGraphData: function () {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			//var taskCompletionTrendGraph = this.getView().byId("WB_STACKED_BAR_GRAPH_Dummy");
			var taskCompletionTrendGraph = this.frag5.getItems()[1];
			var oData = [{
				status: "Critical",
				strName: "SCP",
				taskCount: 50
			}, {
				status: null,
				strName: "ECC",
				taskCount: 20
			}, {
				status: null,
				strName: "Ad-Hoc",
				taskCount: 100
			}];
			oGraphDataModel.setProperty("/DummyGraph1", oData);
			taskCompletionTrendGraph.destroyFeeds();
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Year",
					value: "{strName}"
				}],

				measures: [{
					name: "TaskCount",
					value: "{taskCount}"
				}],

				data: {
					path: "/DummyGraph1"
				}
			});
			taskCompletionTrendGraph.setDataset(oDataset);
			taskCompletionTrendGraph.setModel(oGraphDataModel);
			taskCompletionTrendGraph.setVizProperties({
				title: {
					visible: false
				},
				interaction: {
					selectability: {
						axisLabelSelection: false,
						legendSelection: false
					}
				},
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					primaryScale: {
						minValue: 10
					},
					width: 4
				},
				categoryAxis: {
					label: {
						visible: true
					},
					title: {
						text: "{i18n>TASK_COUNT_TEXT}",
						visible: false
					}
				},
				valueAxis: {
					title: {
						visible: false
					}
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["TaskCount"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Year"]
				});
			taskCompletionTrendGraph.addFeed(feedValueAxis);
			taskCompletionTrendGraph.addFeed(feedCategoryAxis);
			var maxValue = 3;
			var oGraphData = oGraphDataModel.getProperty("/taskCompletionTrendList");
			if (oGraphData) {
				for (var i = 0; i < oGraphData.length; i++) {
					maxValue = Math.max(maxValue, oGraphData[i].taskCount);
				}
			}
			var scales = [{
				"feed": "color",
				"palette": ["#2f2c85"]
			}, {
				"feed": "valueAxis",
				"max": maxValue
			}];
			taskCompletionTrendGraph.setVizScales(scales);

		},

		fnGetDummyGraphData2: function () {

			var oGraphDataModel = this.getModel("oGraphDataModel");
			//var taskCompletionTrendGraph = this.getView().byId("WB_STACKED_COLUMNBAR_GRAPH_Dummy");
			var taskCompletionTrendGraph = this.frag6.getItems()[1];
			var oData = [{
				status: "Critical",
				strName: "Ready",
				taskCount: 100
			}, {
				status: null,
				strName: "Reserved",
				taskCount: 50
			}];
			oGraphDataModel.setProperty("/DummyGraph2", oData);
			taskCompletionTrendGraph.destroyFeeds();
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Year",
					value: "{strName}"
				}],

				measures: [{
					name: "TaskCount",
					value: "{taskCount}"
				}],

				data: {
					path: "/DummyGraph2"
				}
			});
			taskCompletionTrendGraph.setDataset(oDataset);
			taskCompletionTrendGraph.setModel(oGraphDataModel);
			taskCompletionTrendGraph.setVizProperties({
				title: {
					visible: false
				},
				interaction: {
					selectability: {
						axisLabelSelection: false,
						legendSelection: false
					}
				},
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					primaryScale: {
						minValue: 10
					},
					width: 4
				},
				categoryAxis: {
					label: {
						visible: true
					},
					title: {
						text: "Task Count",
						visible: false
					}
				},
				valueAxis: {
					title: {
						visible: false
					}
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["TaskCount"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Year"]
				});
			taskCompletionTrendGraph.addFeed(feedValueAxis);
			taskCompletionTrendGraph.addFeed(feedCategoryAxis);
			var maxValue = 3;
			var oGraphData = oGraphDataModel.getProperty("/taskCompletionTrendList");
			if (oGraphData) {
				for (var i = 0; i < oGraphData.length; i++) {
					maxValue = Math.max(maxValue, oGraphData[i].taskCount);
				}
			}
			var scales = [{
				"feed": "color",
				"palette": ["#2f2c85"]
			}, {
				"feed": "valueAxis",
				"max": maxValue
			}];
			taskCompletionTrendGraph.setVizScales(scales);

		},

		/*	onGraphSettings: function () {
				var oGraphDataModel = this.getModel("oGraphDataModel");
				var graphData = oGraphDataModel.getProperty("/graphData");
				if (!graphData) {
					this.graphSettingsData();
				}
			},*/

		onGraphSettingsClose: function () {
			this._graphSettings.close();
		},
		onGraphWidthChange: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.onGraphWidthChange(oEvent);
		},
		onGraphActivate: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.onGraphActivate(oEvent);
		},
		onGraphSettingsDrop: function (oInfo) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.onGraphSettingsDrop(oInfo);
		},

		wbGridRender: function (isSettings) {
			var cssGrid = this.getView().byId("ID_CSS_GRID");
			cssGrid.removeAllItems();

			var oGraphDataModel = this.getModel("oGraphDataModel");
			var graphData = oGraphDataModel.getProperty("/graphData");

			if (isSettings) {
				for (var i = 0; i <graphData.length; i++) {
					if (graphData[i].key === "activeTasks") {
						cssGrid.addItem(this.frag1);
						this.setStackedBarGraph();
					} else if (graphData[i].key === "taskCompletionTrend") {
						cssGrid.addItem(this.frag2);
						this.setTaskCompleteTrendGraph();
					} else if (graphData[i].key === "userWorkloadItem") {
						cssGrid.addItem(this.frag3);
						this.setUserWorkItemGraph();
					} else if (graphData[i].key === "taskSummary") {
						cssGrid.addItem(this.frag4);
						this.setDonutGraph();
					}
				}
			} else {
				cssGrid.addItem(this.frag1);
				this.setStackedBarGraph();

				cssGrid.addItem(this.frag2);
				this.setTaskCompleteTrendGraph();

				cssGrid.addItem(this.frag3);
				this.setUserWorkItemGraph();

				cssGrid.addItem(this.frag4);
				this.setDonutGraph();
			}
			if(graphData && i>=graphData.length){
			this.createCustomGraphFragment();
			}
		},

		createFrag: function () {
			var cssGrid = this.getView().byId("ID_CSS_GRID");
			cssGrid.removeAllItems();
			if (!this.frag1) {
				this.frag1 = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.ActiveTaskGraph", this);
			}
			if (!this.frag2) {
				this.frag2 = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.TaskCompletionGraph", this);
			}
			if (!this.frag3) {
				this.frag3 = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.UserWorkItemGraph", this);
			}
			if (!this.frag4) {
				this.frag4 = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.TaskSummaryGraph", this);
			}
			/*cssGrid.addItem(this.frag1);
			this.setStackedBarGraph();

			cssGrid.addItem(this.frag2);
			this.setTaskCompleteTrendGraph();

			cssGrid.addItem(this.frag3);
			this.setUserWorkItemGraph();

			cssGrid.addItem(this.frag4);
			this.setDonutGraph();*/
		},
		
		changeGraphWidth:function(){
				var graphData = this.getModel("oGraphDataModel").getProperty("/graphData"),
				customKey;
			if (graphData) {
				for (var index = 0; index < graphData.length; index++) {
					customKey = graphData[index].key;
					if (graphData[index].width === "50") {
						if (customKey === "activeTasks") {
							this.frag1.getItems()[1].getParent().getLayoutData().setGridColumn("span 1");
						} else if (customKey === "taskCompletionTrend") {
							this.frag2.getItems()[1].getParent().getLayoutData().setGridColumn("span 1");
						} else if (customKey === "userWorkloadItem") {
							this.frag3.getItems()[1].getParent().getLayoutData().setGridColumn("span 1");
						} else if (customKey === "taskSummary") {
							this.frag4.getItems()[1].getParent().getLayoutData().setGridColumn("span 1");
						}
					} else {
						if (customKey === "activeTasks") {
							this.frag1.getItems()[1].getParent().getLayoutData().setGridColumn("span 2");
						} else if (customKey === "taskCompletionTrend") {
							this.frag2.getItems()[1].getParent().getLayoutData().setGridColumn("span 2");
						} else if (customKey === "userWorkloadItem") {
							this.frag3.getItems()[1].getParent().getLayoutData().setGridColumn("span 2");
						} else if (customKey === "taskSummary") {
							this.frag4.getItems()[1].getParent().getLayoutData().setGridColumn("span 2");
						}
					}
				}
			}
		},

		/**** dynamic graph generation -start -Monisha.D****/

		//function to create dynamic grid for Custom Graphs
		createCustomGraphFragment: function () {
			var cssGrid = this.getView().byId("ID_CSS_GRID");
			var a = cssGrid.getItems();
			if (a.length > 4) {
				a.splice(4, a.length);
				cssGrid.removeAllItems();
				for (var j = 0; j < a.length; j++)
					cssGrid.addItem(a[j]);
			}
			// cssGrid.removeAllItems();
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var data = oGraphDataModel.getProperty("/customGraphData");
			if (data) {
				for (var i = 1; i < data.length; i++) {
					var graphConfigurationDto = oGraphDataModel.getProperty("/customGraphData/" + i + "/graphConfigurationDo");
					if (graphConfigurationDto && graphConfigurationDto.isActive) {
						oGraphDataModel.setProperty("/enableBusyIndicators/" + graphConfigurationDto.graphConfigId, false);
						var graphGrid = new sap.m.VBox({
							renderType: "Bare",
							// alignItems: "Center",
							width: "100%"
						}).addItem(new sap.m.HBox({
							renderType: "Bare",
							alignItems: "Center",
							width: "100%",
							justifyContent: "SpaceBetween"
						}).addStyleClass("wbDashboardHeaderComboClass").addItem(new sap.m.Text({
							text: graphConfigurationDto.graphName
						}).addStyleClass("wbDashboardTitleTextClass")));
						graphGrid.addStyleClass("wbDashboardChartClass");
						var oVizFrame = new sap.viz.ui5.controls.VizFrame({
							busyIndicatorDelay: 0,
							busy: "{oGraphDataModel>/enableBusyIndicators/" + graphConfigurationDto.graphConfigId + "}",
							vizType: graphConfigurationDto.chartType,
							legendVisible: graphConfigurationDto.showLegends,
							width: "100%",
							selectData: function (oEvent) {
								this.graphBasedFilterFn(oEvent, this.oAppModel);
							}.bind(this)
						});
						oVizFrame.setHeight(this.formatter.wbGraphHeight());
						graphGrid.addItem(oVizFrame);
						cssGrid.addItem(graphGrid);

						var count = oGraphDataModel.getProperty("/customGraphData/" + i + "/totalCount");
						///pagination ***starts***
						if (graphConfigurationDto.xAxisTopValue || graphConfigurationDto.yAxisTopValue) {
							var maxCount, currentPageEnd, noOfLinks = 5,
								nextPageVisible = true;
							if (graphConfigurationDto.xAxisTopValue) maxCount = graphConfigurationDto.xAxisTopValue;
							else maxCount = graphConfigurationDto.yAxisTopValue;
							var maxPage = Math.trunc(count / maxCount);
							if (count % maxCount) maxPage++;
							if (count <= maxCount * noOfLinks) {
								currentPageEnd = maxPage;
								nextPageVisible = false;
							} else {
								currentPageEnd = noOfLinks;
							}
							oGraphDataModel.setProperty("/customGraphData/" + i + "/pagination", {
								"numberOfPages": maxPage,
								"pagePrevVisible": false,
								"pageNextVisible": nextPageVisible,
								"scrollClicked": false,
								"pages": [],
								"pageStart": 1,
								"pageEnd": currentPageEnd,
								"selectedPage": 1,
								"selectedPageObj": null
							});
							var pageArray = [],
								pageStart = oGraphDataModel.getProperty("/customGraphData/" + i + "/pagination/pageStart"),
								pageEnd = oGraphDataModel.getProperty("/customGraphData/" + i + "/pagination/pageEnd");

							for (var j = pageStart; j <= pageEnd; j++) {
								var page = {
									"page": j
								};
								pageArray.push(page);
							}
							oGraphDataModel.setProperty("/customGraphData/" + i + "/pagination/pages", pageArray);
							var oPagination = new sap.m.HBox({
								renderType: "Bare",
								alignItems: "Center",
								justifyContent: "End",
								width: "100%"
							}).addItem(new sap.m.Button({
								icon: "sap-icon://nav-back",
								enabled: "{oGraphDataModel>/customGraphData/" + i + "/pagination/pagePrevVisible}",
								press: function (oEvent) {
									this.onScrollLeftFn(oEvent);
								}.bind(this)
							}).addStyleClass("wbInboxPaginationLinkClass").addStyleClass("wbGraphPagination"));
							var pageLinks = new sap.m.HBox({
								renderType: "Bare",
								alignItems: "Center"
							}).addStyleClass("wbInboxPaginationClass");
							oPagination.addItem(pageLinks);

							pageLinks.bindAggregation("items", "oGraphDataModel>/customGraphData/" + i + "/pagination/pages",
								function (index, context) {
									var bindingObject = context.getObject();
									var contextPath = context.getPath();

									var HBox = this.addPaginationLinks(contextPath, bindingObject);
									return HBox;
								}.bind(this));

							oPagination.addItem(new sap.m.Button({
								icon: "sap-icon://navigation-right-arrow",
								enabled: "{oGraphDataModel>/customGraphData/" + i + "/pagination/pageNextVisible}",
								press: function (oEvent) {
									this.onScrollRightFn(oEvent);
								}.bind(this)
							}).addStyleClass("wbInboxPaginationLinkClass").addStyleClass("sapUiTinyMarginEnd").addStyleClass("wbGraphPagination"));
							graphGrid.addItem(oPagination);
						}
						///pagination ends
						if (graphConfigurationDto.yScrollbar || graphConfigurationDto.xScrollbar)
							oVizFrame.setUiConfig({
								applicationSet: 'fiori'
							});

						if (graphConfigurationDto.chartType === "bar" || graphConfigurationDto.chartType === "donut" || graphConfigurationDto.chartType ===
							"pie" || graphConfigurationDto.chartType === "stacked_bar")
							oVizFrame.addStyleClass("wbDashboardScrollClass wbDashboardScrollWidthClass");
						else
							oVizFrame.addStyleClass("wbDashboardScrollClass wbDashboardScrollHeightClass");
						var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
						oTooltip.connect(oVizFrame.getVizUid());
						this.setCustomGraphData(i, oVizFrame);
					}
				}
			}
			oGraphDataModel.refresh(true);
		},

		//function to  create dynamic pagination Link
		addPaginationLinks: function (contextPath, bindingObject) {
			var oLink = new sap.m.Link({
				text: "{oGraphDataModel>page}",
				visible: "{path: 'oGraphDataModel>page' ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetGraphLinkStyleClass'}",
				press: function (oEvent) {
					var items = oEvent.getSource().getParent().getItems();
					for (var i = 0; i < items.length; i++) {
						if (items[i].getText() == bindingObject.page) {
							items[i].removeStyleClass("wbInboxPaginationLinkColor");
							items[i].addStyleClass("wbInboxActivePaginationLinkColor");
						} else {
							items[i].removeStyleClass("wbInboxActivePaginationLinkColor");
							items[i].addStyleClass("wbInboxPaginationLinkColor");
						}
					}
					this.fetchGraphData(contextPath, bindingObject.page);
					this.getModel("oGraphDataModel").setProperty(contextPath.split("/pages")[0] + "/selectedPage", bindingObject.page);
				}.bind(this)
			}).addStyleClass("wbInboxPaginationLinkColor");
			return oLink;
		},

		//Function to handle the click functionality of pagination
		fetchGraphData: function (contextPath, page) {
			var dataPath = contextPath.split("/pagination");
			var graphId = this.getModel("oGraphDataModel").getProperty(dataPath[0]).graphConfigurationDo.graphConfigId;
			this.getModel("oGraphDataModel").setProperty("/enableBusyIndicators/" + graphId, true);
			var surl = "/WorkboxJavaService/Dashboard/getCustomGraph/" + graphId + "?page=" + page;
			this.doAjax(surl, "GET", null, function (oData1) {
				this.getModel("oGraphDataModel").setProperty(dataPath[0] + "/data", oData1.data);
				this.getModel("oGraphDataModel").setProperty("/enableBusyIndicators/" + graphId, false);
				this.getModel("oGraphDataModel").refresh();
			}.bind(this), function (oError) {}.bind(this));
		},

		//function to scroll right in pagination
		onScrollRightFn: function (oEvent) {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var dataPath = (oEvent.getSource().getBindingInfo("enabled").binding.sPath).split("pageNextVisible")[0];
			var oldPageStart = oGraphDataModel.getProperty(dataPath + "pageStart");
			var oldPageEnd = oGraphDataModel.getProperty(dataPath + "pageEnd");
			var SelectedPage = oGraphDataModel.getProperty(dataPath + "selectedPage");
			this.getModel("oGraphDataModel").setProperty(dataPath + "selectedPage", SelectedPage + 1);

			oGraphDataModel.setProperty(dataPath + "pageStart", oldPageStart + 1);
			oGraphDataModel.setProperty(dataPath + "pageEnd", oldPageEnd + 1);

			var pageArray = [];
			for (var j = oldPageStart + 1; j <= oldPageEnd + 1; j++) {
				var page = {
					"page": j
				};
				pageArray.push(page);
			}
			oGraphDataModel.setProperty(dataPath + "pages", pageArray);
			oGraphDataModel.setProperty(dataPath + "pagePrevVisible", true);

			this.fetchGraphData(dataPath, SelectedPage + 1);
			if (oGraphDataModel.getProperty(dataPath + "numberOfPages") <= oldPageEnd + 1) {
				oGraphDataModel.setProperty(dataPath + "pageNextVisible", false);
			}
			oGraphDataModel.refresh(true);
		},

		//function to scroll left in pagination
		onScrollLeftFn: function (oEvent) {
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var dataPath = (oEvent.getSource().getBindingInfo("enabled").binding.sPath).split("pagePrevVisible")[0];
			var oldPageStart = oGraphDataModel.getProperty(dataPath + "pageStart");
			var oldPageEnd = oGraphDataModel.getProperty(dataPath + "pageEnd");
			var SelectedPage = oGraphDataModel.getProperty(dataPath + "selectedPage");
			this.getModel("oGraphDataModel").setProperty(dataPath + "selectedPage", SelectedPage - 1);

			oGraphDataModel.setProperty(dataPath + "pageStart", oldPageStart - 1);
			oGraphDataModel.setProperty(dataPath + "pageEnd", oldPageEnd - 1);

			var pageArray = [];
			for (var j = oldPageStart - 1; j <= oldPageEnd - 1; j++) {
				var page = {
					"page": j
				};
				pageArray.push(page);
			}
			oGraphDataModel.setProperty(dataPath + "pages", pageArray);
			oGraphDataModel.setProperty(dataPath + "pageNextVisible", true);
			this.fetchGraphData(dataPath, SelectedPage - 1);
			if (oldPageStart - 1 <= 1)
				oGraphDataModel.setProperty(dataPath + "pagePrevVisible", false);
			oGraphDataModel.refresh(true);
		},

		//function to add filter value to the graph and navigate to inbox to fetch the tasks
		graphBasedFilterFn: function (oEvent, oAppModel) {
			var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
			var oGraphDataModel = this.getModel("oGraphDataModel");
			var sDataPath = oEvent.getSource().getAggregation("dataset").getBindingInfo("data").path;
			var graphConfigurationDto = oGraphDataModel.getProperty(sDataPath.split("data")[0] + "graphConfigurationDo");
			var oFilterMap = JSON.parse(graphConfigurationDto.filterData);
			var filterKeys = Object.keys(oFilterMap.filterMap);
			var filter = "",
				displayValue = "";
			var selectedBar = oEvent.getParameter("data")[0].data;
			var graphData = oGraphDataModel.getProperty(sDataPath + "/" + selectedBar._context_row_number);
			var xParameter = graphConfigurationDto.xParameter;
			var category = graphConfigurationDto.yCategory;
			if (graphConfigurationDto.chartType === "stacked_bar" || graphConfigurationDto.chartType === "bar") {
				xParameter = graphConfigurationDto.yParameter;
			}
			if (graphConfigurationDto.chartType === "stacked_bar" || graphConfigurationDto.chartType === "bar") {
				category = graphConfigurationDto.xCategory;
			}
			if (!category) {
				category = "";
			}

			if (xParameter.toLowerCase() === "status") {
				oFilterMap.filterMap["te.STATUS"].value = "'" + graphData.xValue + "'";
				oFilterMap.filterMap["te.STATUS"].displayValue = "'" + graphData.xDisplayValue + "'";
			} else if (xParameter.toLowerCase() === "grouplist") {
				oFilterMap.filterMap["tw.GROUP_ID"].value = graphData.xValue;
				oFilterMap.filterMap["tw.GROUP_ID"].displayValue = "'" + graphData.xDisplayValue + "'";
				oAdvanceFilterModel.setProperty("/selectedGraphGroupId", graphData.xDisplayValue);
			} else if (xParameter.toLowerCase() === "processlist") {
				oFilterMap.filterMap["pe.NAME"].value = "'" + graphData.xValue + "'";
				oFilterMap.filterMap["pe.NAME"].displayValue = "'" + graphData.xDisplayValue + "'";
			} else if (xParameter.toLowerCase() === "userlist") {
				oFilterMap.filterMap["tw.TASK_OWNER"].value = graphData.xValue;
				oFilterMap.filterMap["tw.TASK_OWNER"].displayValue = "'" + graphData.xDisplayValue + "'";
			} else if (xParameter.toLowerCase() === "origin") {
				oFilterMap.filterMap["te.ORIGIN"].value = "'" + graphData.xValue + "'";
				oFilterMap.filterMap["te.ORIGIN"].displayValue = "'" + graphData.xDisplayValue + "'";
			} else if (xParameter.toLowerCase() === "createdby") {
				oFilterMap.filterMap["pe.STARTED_BY"].value = graphData.xValue;
				oFilterMap.filterMap["pe.STARTED_BY"].displayValue = "'" + graphData.xDisplayValue + "'";
			} else if (xParameter.toLowerCase() === "comp_deadline") {
				oFilterMap.filterMap["te.COMP_DEADLINE"].value = "'" + graphData.xValue + "'";
			} else if (xParameter.toLowerCase() === "createdon") {
				this.modifyDateFormatFn(oFilterMap.filterMap["te.CREATED_AT"], graphData.xValue);
			} else if (xParameter.toLowerCase() === "completedon") {
				this.modifyDateFormatFn(oFilterMap.filterMap["te.COMPLETED_AT"], graphData.xValue);
			} else if (xParameter.toLowerCase() === "duedate") {
				this.modifyDateFormatFn(oFilterMap.filterMap["te.SLA_DUE_DATES"], graphData.xValue);
			}
			if (!graphData.graphDataCountDto) {
				graphData.graphDataCountDto = [];
			}
			if (graphData.graphDataCountDto.length) {
				for (var i = 0; i < graphData.graphDataCountDto.length; i++) {
					if (selectedBar.measureNames === graphData.graphDataCountDto[i].idDisplayName) {
						filter = graphData.graphDataCountDto[i].id;
						displayValue = graphData.graphDataCountDto[i].idDisplayName;
						if (category.toLowerCase() === "status" || category.toLowerCase() === "origin" ||
							category.toLowerCase() === "processlist" || category.toLowerCase() === "comp_deadline"
						) {
							filter = "'" + filter + "'";
							displayValue = "'" + displayValue + "'";
						}
						if (category.toLowerCase() === "grouplist") {
							oAdvanceFilterModel.setProperty("/selectedGraphGroupId", selectedBar.measureNames);
						}
					}
				}
				for (var j = 0; j < filterKeys.length; j++) {
					if (!oFilterMap.filterMap[filterKeys[j]].value) {
						if (filterKeys[j] === "te.SLA_DUE_DATES" || filterKeys[j] === "te.COMPLETED_AT" || filterKeys[j] === "te.CREATED_AT") {
							var duration = graphConfigurationDto.yFilter;
							if (graphConfigurationDto.chartType === "stacked_bar" || graphConfigurationDto.chartType === "bar") {
								duration = graphConfigurationDto.xFilter;
							}
							if (duration === "week") {
								oFilterMap.filterMap[filterKeys[j]].lowerLimit = filter + " " + "00:00:00";
								oFilterMap.filterMap[filterKeys[j]].upperLimit = filter + " " + "23:59:59";
							} else {
								this.modifyDateFormatFn(oFilterMap.filterMap[filterKeys[j]], filter);
							}
						} else {
							oFilterMap.filterMap[filterKeys[j]].value = filter;
							oFilterMap.filterMap[filterKeys[j]].displayValue = displayValue;
						}
					}
				}
			}
			oAppModel.setProperty("/dynamicGraphFilterPayload", oFilterMap);
			oAppModel.setProperty("/graphClicked", true);

			oAppModel.setProperty("/isViewApplied", true);
			oAdvanceFilterModel.setProperty("/isView", false);
			oAdvanceFilterModel.setProperty("/viewName", "");
			oAdvanceFilterModel.setProperty("/filterId", "");
			oAdvanceFilterModel.setProperty("/viewAppliedContext", oFilterMap);
			oAdvanceFilterModel.setProperty("/searchInboxType", "AllTask");
			oAdvanceFilterModel.setProperty("/inboxIdGraph", "AllTask");
			oAdvanceFilterModel.setProperty("/inboxNameGraph", "All Task");

			this.getModel("oAdvanceFilterModel").setProperty("/customTileClicked", true);
			var that = oAdvanceFilterModel.getProperty("/appController");
			that.setSavedFilterToInbox(oFilterMap);
			oAppModel.setProperty("/removeFilterToken", false);
		},

		//set the upper and lower limit for month duration in navigation payload
		modifyDateFormatFn: function (obj, value) {
			var month = new Date(Date.parse(value + " 1, " + new Date().getFullYear())).getMonth() + 1;
			var date = new Date(month + "-1-" + new Date().getFullYear());
			var sFormat = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-
				2);
			var eDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
			var eFormat = eDate.getFullYear() + "-" + ("0" + (eDate.getMonth() + 1)).slice(-2) + "-" + ("0" + eDate.getDate()).slice(-
				2);
			obj.lowerLimit = sFormat + " " + "00:00:00";
			obj.upperLimit = eFormat + " " + "23:59:59";
			return;
		}

		/**** dynamic graph generation -end -Monisha.D****/
	});
});
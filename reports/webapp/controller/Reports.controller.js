sap.ui.define([
    //  "sap/ui/core/mvc/Controller",
    "oneapp/incture/report/reports/controller/BaseController",
    "oneapp/incture/report/reports/util/formatter",
    // "oneapp/incture/workbox/util/taskManagement",
    // "oneapp/incture/workbox/util/workbox",
    // "oneapp/incture/workbox/util/utility",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/ui/core/Fragment"
], function (BaseController, formatter, JSONModel, Dialog, Fragment) {
    "use strict";

    return BaseController.extend("oneapp.incture.report.reports.controller.Reports", {

        /*****Development by Vaishnavi - start*****/

        onInit: function () {
            var oAppModel = this.getOwner().getModel("oAppModel");
            this.oAppModel = oAppModel;
            var oGraphDataModel = this.getOwnerComponent().getModel("oGraphDataModel");
            this.getView().setModel(oGraphDataModel, "oGraphDataModel");
            oGraphDataModel.setProperty("/enableBusyIndicators", {});

            var oRouter = this.getOwnerComponent().getRouter();
            // oRouter.attachRoutePatternMatched(function (oEvent) {
            // 	if (oEvent.getParameter("name") === "Reports") {
            oAppModel.setProperty("/currentView", "dashBoard");
            //this.setNavigationDetailsFn();
            //this.removeAllTokens(true);
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
            // this.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", "AdminInbox");
            // this.getModel("oAdvanceFilterModel").setProperty("/customTileClicked", false);
            // this.getModel("oAdvanceFilterModel").setProperty("/selectedGraphGroupId", null);
            this.oAppModel.setProperty("/currentViewPage", "");
            // this.createFrag();
            this.fnGetDurationData(); // sets duration for Task Completions Trend
            this.fnGetProcessNames();
            this.fnGetGraphTiles();
            this.fnGetActiveTasksGraphData();
            this.fnGetTaskCompletionGraphData();
            this.fnGetUserWorkItemGraphData();
            this.fnGetTaskDonutGraphData();
            // this.fnGetCustomGraphList();
            //this.fnGetDummyGraphData();
            //this.fnGetDummyGraphData2();
            //this.wbGridRender();
            // this.changeGraphWidth();
            // if(oGraphDataModel.getProperty("/graphData")){
            // 	this.wbGridRender(true);
            // }
            // else{
            // this.wbGridRender(false);
            // }
            // 	}
            // }.bind(this));
            // this.getOwnerComponent().getRouter().navTo("Home");
        },
        fnNavToHome: function () {
            this.getOwnerComponent().getRouter().navTo("Home");
        },
        fnRouterReport: function () {


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
fnInputSpaceCheck
        //getting the process names and setting it to model
        fnGetProcessNames: function () {
            var oConstantsModel = this.getModel("oConstantsModel");
            if (!oConstantsModel) {
                oConstantsModel = this.getOwnerComponent().getModel("oConstantsModel");
            }
            oConstantsModel.setProperty("/selectedProcess", "ALL");
        },

        //to get all the tasks count and setting it to the model
        fnGetGraphTiles: function () {
            var oGraphDataModel = this.getModel("oGraphDataModel");
            var url = "/oneappincturereportreports/WorkboxJavaService/Dashboard/getAllDetails?GraphType=taskCount";
            oGraphDataModel.setProperty("/enableBusyIndicators/count", true);
            this.doAjax(url, "GET", null, function (oData) {
                oGraphDataModel.setProperty("/graphTiles", oData.graphDto.tiles);
                oGraphDataModel.setProperty("/enableBusyIndicators/count", false);
            }.bind(this), function (oError) { }.bind(this));
            oGraphDataModel.refresh(true);
        },

        //to get the total active tasks graph data
        fnGetActiveTasksGraphData: function () {
            var oGraphDataModel = this.getModel("oGraphDataModel");
            var url = "/oneappincturereportreports/WorkboxJavaService/Dashboard/getAllDetails?GraphType=activeTasksGraph";
            oGraphDataModel.setProperty("/enableBusyIndicators/activeGraph", true);
            this.doAjax(url, "GET", null, function (oData) {
                oGraphDataModel.setProperty("/totalActiveTaskList", oData.graphDto.totalActiveTaskList);
                this.setStackedBarGraph();
                oGraphDataModel.setProperty("/enableBusyIndicators/activeGraph", false);
            }.bind(this), function (oError) { }.bind(this));
        },

        //to get the data for task completion trend graph and setting it to the model
        fnGetTaskCompletionGraphData: function () {
            var oGraphDataModel = this.getModel("oGraphDataModel");
            var duration = oGraphDataModel.getProperty("/selectedDuration");
            var url = "/oneappincturereportreports/WorkboxJavaService/Dashboard/getAllDetails?GraphType=taskCompletionTrendGraph&duration=" + duration;
            oGraphDataModel.setProperty("/enableBusyIndicators/trendGraph", true);
            this.doAjax(url, "GET", null, function (oData) {
                oGraphDataModel.setProperty("/taskCompletionTrendList", oData.graphDto.taskCompletionTrendList);
                this.setTaskCompleteTrendGraph();
                oGraphDataModel.setProperty("/enableBusyIndicators/trendGraph", false);
            }.bind(this), function (oError) { }.bind(this));
        },

        //to get the data for user work item graph and setting it to the model
        fnGetUserWorkItemGraphData: function () {
            var oGraphDataModel = this.getModel("oGraphDataModel");
            var processName = this.getModel("oConstantsModel").getProperty("/selectedProcess");
            var url = "/oneappincturereportreports/WorkboxJavaService/Dashboard/getAllDetails?processName=" + processName + "&GraphType=userWorkCountGraph";
            oGraphDataModel.setProperty("/enableBusyIndicators/userGraph", true);
            this.doAjax(url, "GET", null, function (oData) {
                oGraphDataModel.setProperty("/userWorkCountList", oData.graphDto.userWorkCountList);
                this.setUserWorkItemGraph();
                oGraphDataModel.setProperty("/enableBusyIndicators/userGraph", false);
            }.bind(this), function (oError) { }.bind(this));
        },

        //to get the data for donut graph and setting it to the model
        fnGetTaskDonutGraphData: function () {
            var oGraphDataModel = this.getModel("oGraphDataModel");
            var url = "/oneappincturereportreports/WorkboxJavaService/Dashboard/getAllDetails?GraphType=taskSummary";
            oGraphDataModel.setProperty("/enableBusyIndicators/donutGraph", true);
            this.doAjax(url, "GET", null, function (oData) {
                var taskDonutList = oData.graphDto.taskDonutList;
                if (taskDonutList) {
                    for (var i = 0; i < taskDonutList.length; i++) {
                        if (taskDonutList[i].strName === "On Time") {
                            taskDonutList[i].strDisplayName = taskDonutList[i].status + " " + taskDonutList[i].strName;
                        } else if (taskDonutList[i].strName === "SLA Breached") {
                            taskDonutList[i].strDisplayName = taskDonutList[i].status + " " + "After SLA";
                        }

                    }
                }
                oGraphDataModel.setProperty("/taskDonutList", oData.graphDto.taskDonutList);
                this.setDonutGraph();
                oGraphDataModel.setProperty("/enableBusyIndicators/donutGraph", false);
            }.bind(this), function (oError) { }.bind(this));
        },

        //fetching the data and generating stacked bar graph
        setStackedBarGraph: function () {
            var oGraphDataModel = this.getModel("oGraphDataModel");
            var oVizFrame = this.byId("ID_ACTIVE_TASK_COUNT").getItems()[1];
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
            var interval = setInterval(function () {
                if (this.oAppModel.getProperty("/currentView") !== "dashBoard" && oTooltip && oTooltip._oPopup) {
                    oTooltip._oPopup.close();
                    clearInterval(interval);
                }
            }.bind(this), 1000);
        },

        //fetching the data and generating task completion trend graph
        setTaskCompleteTrendGraph: function () {
            var oGraphDataModel = this.getModel("oGraphDataModel");
            //var taskCompletionTrendGraph = this.getView().byId("WB_COLUMN_GRAPH");
            var taskCompletionTrendGraph = this.byId("ID_TASK_COMPLETION").getItems()[1];
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
            var userWorkItemGraph = this.byId("ID_USER_WORKITEM").getItems()[1];
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
            var interval = setInterval(function () {
                if (this.oAppModel.getProperty("/currentView") !== "dashBoard" && oTooltip && oTooltip._oPopup) {
                    oTooltip._oPopup.close();
                    clearInterval(interval);
                }
            }.bind(this), 1000);
        },

        //fetching the data and generating the donut graph
        setDonutGraph: function () {
            var oGraphDataModel = this.getView().getModel("oGraphDataModel");
            //var donutGraph = this.getView().byId("WB_DONUT_GRAPH");
            var donutGraph = this.byId("ID_TASK_SUMMARY").getItems()[1];
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

        //on click of graph, fetching the detail of graph/tile and navigating to inbox page
        fetchGraphDetailFn: function (oEvent) {
            var oAppModel = this.oAppModel;
            oAppModel.setProperty("/graphClicked", "true");
            var oGraphDataModel = this.getModel("oGraphDataModel");
            var i18n = this.getView().getModel("i18n").getResourceBundle();
            var params = {
                "params": true
            };
            //if graph data is clicked

            if (oEvent.getParameters().data.length > 1) {
                return;
            }
            var selectedGraphData = oEvent.getParameter("data")[0].data;


            // if Total Active Tasks graph is clicked 
            if (selectedGraphData.Process) {
                var processClicked = selectedGraphData._context_row_number;
                //var processList = oGraphDataModel.getData().totalActiveTaskList;
                //var processName = selectedGraphData.Process;
                var processName = oGraphDataModel.getData().totalActiveTaskList[processClicked].processName;
                var measureNames = selectedGraphData.measureNames;
                params.processName = processName;
                params.measureNames = measureNames;
                params.graph = "totalActiveGraph";
            }

            // if (selectedGraphData.measureNames) {
            // 	oAppModel.setProperty("/graphMeasureNames", selectedGraphData.measureNames);
            // }

            //if task completion graph is clicked
            if (selectedGraphData.Month || selectedGraphData.Date) {
                var duration = selectedGraphData.Month;
                params.duration = duration;
                params.status = "ALL COMPLETED";
                params.graph = "taskCompletionTrend";
            }

            // if User Workload graph is clicked
            if (selectedGraphData["User ID"]) {
                var userId = selectedGraphData["User ID"];
                var measureNames = selectedGraphData.measureNames;
                params.userId = userId;
                params.measureNames = measureNames;
                params.graph = "userWorkLoad";
            }

            //if donut graph is clicked
            if (selectedGraphData["Task Name"]) {
                var rowNumber = oEvent.getParameter("data")[0].data._context_row_number;
                var status = this.getModel("oGraphDataModel").getProperty("/taskDonutList")[rowNumber].status;
                var taskName = selectedGraphData["Task Name"];
                if (status === "In Progress") {
                    status = "RESERVED";
                } else if (status === "Completed") {
                    status = "ALL COMPLETED";
                } else if (status === "New") {
                    status = "READY";
                }
                params.status = status;
                params.taskName = taskName;
                params.graph = "donutGraph";
            }


            //this._doNavigate("UnifiedInbox", {});
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: "inbox",
                    action: "Approve"
                },
                params: params
            })) || "";

            // navigates to the new hash
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            });
        },
        //set the upper and lower limit for month duration in navigation payload
        modifyMonthFormatFn: function (obj, value) {
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
        },

    });
});
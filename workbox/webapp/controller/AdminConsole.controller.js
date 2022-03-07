sap.ui.define([
	"oneapp/incture/workbox/controller/BaseController",
	"oneapp/incture/workbox/util/formatter",
	"sap/ui/core/Fragment",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/Token",
	"sap/ui/richtexteditor/RichTextEditor"
	// "oneapp/incture/workbox/controlExtension/ExtRTE"
], function (BaseController, formatter, Fragment, taskManagement, workbox, utility, JSONModel, Filter, Export, ExportTypeCSV, Token, RTE) {
	"use strict";

	return BaseController.extend("oneapp.incture.workbox.controller.AdminConsole", {

		/*****Development by Vaishnavi - start*****/
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			var oAppModel = this.getOwner().getModel("oAppModel");
			this.oAppModel = oAppModel;
			oAppModel.setProperty("/previousPage", "customAttributes");
			oAppModel.setProperty("/openPreviewWorkFlow", false);
			var oModel = new JSONModel();
			this.getView().setModel(oModel, "oDefaultDataModel");
			var otaskCreationModel = new JSONModel();
			this.getView().setModel(otaskCreationModel, "otaskCreationModel");
			otaskCreationModel.setProperty(
				"/uiGeneration");
			var oDropDownValueseModel = new sap.ui.model.json.JSONModel();
			oDropDownValueseModel.setProperty("/dropDownValues", {});
			this.getView()
				.setModel(oDropDownValueseModel, "oDropDownValueseModel");
			var tableModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(tableModel, "tableModel");
			tableModel.setProperty(
				"/lineItems");
			var addNewModel = new JSONModel();
			this.getView().setModel(addNewModel, "addNewModel");
			addNewModel.setProperty(
				"/buttonEnability", true);
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/busyIndicators", {});
			var surl = "/WorkboxJavaService/customHeaders/getCustomTemplates?processName=STANDARD";
			this.doAjax(surl, "GET", null, function (
				oData) {
				oDefaultDataModel.setProperty("/standardTemplateDetails", oData.customAttributeTemplates);
			}.bind(this), function (oError) {}.bind(this));

			oRouter.attachRoutePatternMatched(function (oEvent) {
				if (oEvent.getParameter("name") === "AdminConsole") {
					this.oAppModel.setProperty("/transitionWait",false);
					oAppModel.setProperty("/currentView", "adminConsole");
					this.setNavigationDetailsFn();
					//Custom Attributes - func to get all the process
					var selectedProcess = this.getModel("oConstantsModel").getProperty("/processNamesList")[0].processName;
					this.getModel("oConstantsModel").setProperty("/selectedProcess", selectedProcess);
					this.getCustomAttributes();
					oDefaultDataModel.setProperty("/setEnabled", true);
					oDefaultDataModel.setProperty("/CustomAddButtonStatus", false);
					oDefaultDataModel.setProperty("/customDeleteButtonStatus", true);
					oDefaultDataModel.setProperty("/TaskDeleteButtonStatus", true);
					oDefaultDataModel.setProperty("/openPreviewWorkFlow", false);
					oAppModel.setProperty("/openPreviewWorkFlow", false);
					this.removeAllTokens(
						true);
					this.onFilter();
					
				}
			}.bind(this));
			//Workload - geting the workload data
			this.getWorkLoadData();

			//WorkFlow - getting all the cross constants
			this.getCrossConstants();

			//Manage Groups - service call to get the members
			this.getCustomGroupsFn();
			this.getCustomGroupMembersFn();

			//create group property setting
			oDefaultDataModel.setProperty("/cGroupNameValue", "");
			oDefaultDataModel.setProperty("/createGroupVisibility", false);

			//setting model to uiGeneration dropdown
			otaskCreationModel.getData().uiGeneration = {
				"catalogueName": "ORR",
				"processName": "purchaseorderapproval"
			};

			this.addRTE();
		},

		/*****Common functions - start*****/

		// on hover the visibility of checkbox
		onAfterRendering: function () {

			/* Start - adding the focus out event for input fields (task name - task template, custom attribute name - process and task level)*/

			/*var processTaskLabel = this.getView().byId("ID_TASK_CUSTOM_LABEL");
			processTaskLabel.addEventDelegate({
				onfocusin: $.proxy(function (oEvent) {
					var order = oEvent.srcControl;
					var key = order.getBindingContext("oDefaultDataModel").getObject().key;
					order.addEventDelegate({
						onfocusout: $.proxy(function (oEvent) {
							var inputValue = oEvent.srcControl.getValue();
							this.checkCustomLabelValue(inputValue, key);
						}, this)
					});
				}, this)
			});

			/* End - adding the focus out event for input fields (task name - task template, custom attribute name - process and task level)*/
		},

		// according the to tab that is active, this will call the particular submit method
		onClickApply: function () {
			var that = this;
			var oAppModel = this.oAppModel;
			utility.onClickApplyUT(that, oAppModel);
		},

		// according the to tab that is active, this will call the particular reset method
		onClickReset: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oAppModel = this.oAppModel;
			utility.onClickResetUT(that, oDefaultDataModel, oAppModel);
		},

		/*****Common functions - end*****/

		/*****WorkBox (Custom Attributes)- start*****/

		// to get the custom attributes corresponding to the selected process
		getCustomAttributes: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oAppModel = this.oAppModel;
			var oConstantsModel = this.getModel("oConstantsModel");
			var processName = oConstantsModel.getProperty("/selectedProcess");
			oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			var url = "/WorkboxJavaService/customHeaders/getCustomTemplates?processName=" + processName;
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/customAttributeDetails", oData);
				oDefaultDataModel.setProperty("/maxCustomAttrCount", 3);
				oAppModel.setProperty("/isChanged", false);
				oDefaultDataModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oError) {}.bind(this));
			oAppModel.refresh(true);
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
			this.oAppModel.setProperty("/isChanged", true);
			this.getModel("oDefaultDataModel").setProperty("/standardAttributeChange", true);
		},

		//customattribute post call
		customAttributesPost: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/customHeaders/saveCustomAttributes";
			var validateData = oDefaultDataModel.getProperty("/customAttributeDetails/customAttributeTemplates");
			var check = this.customAttributesValidation(validateData, oDefaultDataModel);
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			if (check) {
				if (oDefaultDataModel.getProperty("/standardAttributeChange")) {
					var standardData = oDefaultDataModel.getProperty("/standardTemplateDetails");
					for (var i = 0; i < standardData.length; i++) {
						if (!standardData[i].label) {
							var validationCheck = 1;
						}
					}
					if (validationCheck) {
						this._showToastMessage(i18n.getText("LABEL_NOT_EMPTY"));
					} else {
						validateData = validateData.concat(standardData);
					}
				}
				if (!validationCheck) {
					this.doAjax(url, "POST", validateData, function (oData) {
						this.getCustomAttributes();
						this._showToastMessage(oData.message);
						var surl = "/WorkboxJavaService/customHeaders/getCustomTemplates?processName=STANDARD";
						if (oDefaultDataModel.getProperty("/standardAttributeChange")) {
							this.doAjax(surl, "GET", null, function (oData) {
								oDefaultDataModel.setProperty("/standardAttributeChange", false);
								oDefaultDataModel.setProperty("/standardTemplateDetails", oData.customAttributeTemplates);
							}.bind(this), function (oError) {}.bind(this));
						}
					}.bind(this), function (oError) {}.bind(this));
				}
			}
		},

		// custom attribute validation
		customAttributesValidation: function (validateData, oDefaultDataModel) {
			var limit = oDefaultDataModel.getProperty("/maxCustomAttrCount");
			var count = 0;
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			for (var i = 0; i < validateData.length; i++) {
				if (validateData[i].isActive) {
					count++;
				}
				if (!validateData[i].label.trim()) {
					this._showToastMessage(i18n.getText("LABEL_NOT_EMPTY"));
					return false;
				}
			}
			if (count > limit) {
				this._showToastMessage(i18n.getText("MORE_THAN_TEXT") + " " + limit + " " + i18n.getText("CUSTOM_ATTRIBUTES_VALIDATION_MESSAGE") +
					" " + limit + i18n.getText("OR_BELOW_TEXT"));
				return false;
			}
			return true;
		},

		//on switching the active state of custom attribute
		onActivateCustom: function (oEvent) {
			var oAppModel = this.oAppModel;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oAppModel.setProperty("/isChanged", true);
			var context = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			if (context.isActive) {
				context.isActive = false;
			} else {
				context.isActive = true;
			}
			oDefaultDataModel.refresh(true);
		},

		/*****WorkBox (Custom Attributes)- end*****/

		/*****WorkBox (WorkLoad)- start*****/

		// to get the data of workload
		getWorkLoadData: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/admin/configurations";
			oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/adminConfigurations", oData);
				if (oData) {
					if (!oData.workloadRangeDtos) {
						oData.workloadRangeDtos = [{
							"loadType": "HIGH",
							"lowLimit": ""
						}, {
							"highLimit": "",
							"loadType": "MEDIUM",
							"lowLimit": ""
						}, {
							"highLimit": "",
							"loadType": "LOW",
							"lowLimit": "0"
						}];
					}
					var workloadRangeDtos = oData.workloadRangeDtos;
					if (workloadRangeDtos && !(workloadRangeDtos instanceof Array)) {
						workloadRangeDtos = [workloadRangeDtos];
					}
					var data = {
						countDetails: {
							hmax: "infinity",
							hmin: workloadRangeDtos[0].lowLimit,
							nmax: workloadRangeDtos[1].highLimit,
							nmin: workloadRangeDtos[1].lowLimit,
							lmax: workloadRangeDtos[2].highLimit,
							lmin: workloadRangeDtos[2].lowLimit
						}
					};
					oDefaultDataModel.setProperty("/workLoadDetails", data);
				}
				oDefaultDataModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		//triggers the post call of workload data
		workLoadDataPost: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/admin/configurations";
			var configData = oDefaultDataModel.getProperty("/workLoadDetails");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			if (parseInt(configData.countDetails.lmax, 10) > parseInt(configData.countDetails.nmax, 10) || parseInt(configData.countDetails.lmax,
					10) ===
				parseInt(configData.countDetails.nmax, 10)) {
				this._showToastMessage(i18n.getText("NORMAL_GREATER_THAN_LOW"));
				return;
			} else if (configData.countDetails.lmax === "" || configData.countDetails.nmax === "") {
				this._showToastMessage(i18n.getText("ENTER_ALL_FIELDS"));
				return;
			} else if (configData.countDetails.lmax < "0" || configData.countDetails.nmax < "0") {
				this._showToastMessage(i18n.getText("NEGATIVE_VALUES_NOT_ALLOWED"));
				return;
			}
			var data = oDefaultDataModel.getProperty("/adminConfigurations");
			data.workloadRangeDtos[0].lowLimit = configData.countDetails.hmin;
			data.workloadRangeDtos[1].highLimit = configData.countDetails.nmax;
			data.workloadRangeDtos[2].highLimit = configData.countDetails.lmax;
			this.doAjax(url, "POST", data, function (oData) {
				this._showToastMessage(oData.message);
				this.getWorkLoadData();
			}.bind(this), function (oError) {}.bind(this));
		},

		// to validate the value in the input function (allows only positive values)
		countWorkLoad: function (oEvent) {
			var oAppModel = this.oAppModel;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oAppModel.setProperty("/isChanged", true);
			var input = oEvent.getSource().getValue();
			var name = oEvent.getSource().getName();
			var countDetails = oDefaultDataModel.getProperty("/workLoadDetails").countDetails;
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			if (input) {
				input = this.isNumber(oEvent);
				if (parseInt(input, 10) > 0) {
					if (name === "hmin") {
						if (parseInt(input, 10) - 1 > 0) {
							countDetails.hmin = input;
							countDetails.nmax = parseInt(input, 10) - 1;
						} else {
							this._showToastMessage(i18n.getText("COUNT_GREATER_THAN_ONE"));
							oEvent.getSource().setValue("");
						}
					} else if (name === "nmax") {
						countDetails.nmax = input;
						countDetails.hmin = parseInt(input, 10) + 1;
					} else if (name === "nmin") {
						if (parseInt(input, 10) - 1 > 0) {
							countDetails.nmin = input;
							countDetails.lmax = parseInt(input, 10) - 1;
						} else {
							this._showToastMessage(i18n.getText("COUNT_GREATER_THAN_ONE"));
							oEvent.getSource().setValue("");
						}
					} else if (name === "lmax") {
						countDetails.lmax = input;
						countDetails.nmin = parseInt(input, 10) + 1;
					}
				} else {
					this._showToastMessage(i18n.getText("COUNT_GREATER_THAN_ZERO"));
				}
			} else {
				if (name === "hmin") {
					countDetails.nmax = "";
				} else if (name === "nmax") {
					countDetails.hmin = "";
				} else if (name === "nmin") {
					countDetails.lmax = "";
				} else if (name === "lmax") {
					countDetails.nmin = "";
				}
			}
			oDefaultDataModel.refresh();
			oAppModel.refresh();
		},

		//avoiding negative values
		isNumber: function (oEvent) {
			var source = oEvent.getSource();
			var input = source.getValue();
			var regex = "^[1-9]([0-9]*)$";
			if (input) {
				if (!input.match(regex)) {
					if (input.length < 2) {
						source._lastValue = "";
						source.setValue("");
					} else {
						input = source._lastValue;
						source.setValue(input);
					}
				} else {
					source._lastValue = input;
				}
				return input;
			} else {
				return "";
			}
		},

		/*****WorkBox (WorkLoad)- end*****/

		/*****WorkBox (Graph Configuration)- start*****/

		//function to fetch graph list -Monisha.D
		fetchGraphListfn: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.fetchGraphListfn(this.getModel("oDefaultDataModel"), "admin");
		},

		//function to initialise the graph configuration data json
		setGraphConfigData: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.setGraphConfigData(this.getModel("oDefaultDataModel"));
		},

		//checks the value string of labels and removes the special character
		checkInputValue: function (oEvent, property) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.checkInputValue(oEvent, property, this.getModel("oDefaultDataModel"));
		},

		//setting the chart type and changing the class
		setChartTypeFn: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.setChartTypeFn(oEvent, this.getModel("oDefaultDataModel"));
		},

		//binding the filter multicombobox items w.r.t selected category
		changeFilterItemsFn: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.changeFilterItemsFn(oEvent, this.getModel("oDefaultDataModel"));
		},

		//set the category and filter values 
		changeParameterFn: function (oEvent, property) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.changeParameterFn(oEvent, property, this.getModel("oDefaultDataModel"));
		},

		//change switch and validate top value function
		setSwitchPropertyFn: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.setSwitchPropertyFn(this.getModel("oDefaultDataModel"));
		},

		//create graph configuration post call
		graphConfigPostFn: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.graphConfigPostFn(this.getModel("oDefaultDataModel"), "admin");
		},

		//function to remove the graph
		deleteGraphConfigfn: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.deleteGraphConfigfn(oEvent, this.getModel("oDefaultDataModel"), "admin");
		},

		//function to get the values during Icon tab Switch in graph Config 
		onGraphConfigViewSelect: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.onGraphConfigViewSelect(oEvent, this.getModel("oDefaultDataModel"));
		},

		//function for editing the graph
		onGraphListItemSelect: function (oEvent) {
			var view = this;
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.onGraphListItemSelect(oEvent, this.getModel("oDefaultDataModel"), view);
		},

		//function for fetching the graph parameter
		fetchGraphParameterfn: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.fetchGraphParameterfn(this.getModel("oDefaultDataModel"));
		},

		//function to active and disable the graph
		activeGraphfn: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.activeGraphfn(oEvent, this.getModel("oDefaultDataModel"));
		},

		//on dropping the graph list item the sequence is set
		onDropGraphListItem: function (oInfo) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.onDropGraphListItem(oInfo, this.getModel("oDefaultDataModel"));
		},

		//To save the updated graph list 
		onSaveGraphListSequence: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.onSaveGraphListSequence(this.getModel("oDefaultDataModel"));
		},

		/*****WorkBox (Graph Configuration)- end*****/

		/*****WorkBox (CFA Approver Matrix) - start  (Mylan POC)*****/

		getCFAmatrixFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var data = [{
				"documentType": "Purchase Orders",
				"costCenter": "103190",
				"vf": "Global Integrated Services - GIS",
				"gre": "Jai Pharma",
				"pt": "Research & Development",
				"threshold": ">10000",
				"function": "Business",
				"approver": "Venkatesh"
			}, {
				"documentType": "Purchase Requisitions",
				"costCenter": "103140",
				"vf": "Regulatory Affairs",
				"gre": "MPI",
				"pt": "Charitable Donations",
				"threshold": ">25000",
				"function": "Finance",
				"approver": "Preetham"
			}, {
				"documentType": "Invoices",
				"costCenter": "103120",
				"vf": "Corporate Affairs",
				"gre": "Regional Supply Chain",
				"pt": "General Payments",
				"threshold": ">50000",
				"function": "Business",
				"approver": "Vaishnavi"
			}, {
				"documentType": "Purchase Requisitions",
				"costCenter": "103170",
				"vf": "EH&S",
				"gre": "Jai Pharma",
				"pt": "Payroll Expenditures",
				"threshold": ">75000",
				"function": "Finance",
				"approver": "Vaishnavi"
			}, {
				"documentType": "Purchase Orders",
				"costCenter": "103150",
				"vf": "Global Supply Chain",
				"gre": "Regional Supply Chain",
				"pt": "Tax",
				"threshold": ">100000",
				"function": "Business",
				"approver": "Venkatesh"
			}, {
				"documentType": "Invoices",
				"costCenter": "103190",
				"vf": "Regulatory Affairs",
				"gre": "MPI",
				"pt": "Payroll Expenditures",
				"threshold": ">125000",
				"function": "Finance",
				"approver": "Venkatesh"
			}, {
				"documentType": "Purchase Orders",
				"costCenter": "103120",
				"vf": "Corporate Affairs",
				"gre": "Jai Pharma",
				"pt": "Charitable Donations",
				"threshold": ">150000",
				"function": "Business",
				"approver": "Preetham"
			}];
			oDefaultDataModel.setProperty("/CFAApproverMatrixData", data);

			var surl = "/WorkboxJavaService/tasks/getApprover";
			this.doAjax(surl, "GET", null, function (oData) {
				if (oData.name) {
					oDefaultDataModel.setProperty("/CFAApproverMatrixData/0/approver", oData.name);
				}
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//filtering the data in the cfa table
		searchCFAApproverDataFn: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter([
					new Filter("documentType", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("costCenter", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("vf", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("gre", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("pt", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("approver", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("threshold", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("function", sap.ui.model.FilterOperator.Contains, sQuery)
				], false);
				aFilters.push(filter);
			}
			var oBinding = this.getView().byId("WB_CFA_APPROVER_LIST").getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},

		//exporting the table data of cfa
		exportCfaTableData: function () {
			var oExport = new Export({
				exportType: new ExportTypeCSV({
					fileExtension: "xls",
					separatorChar: "\t"
				}),
				models: this.getView().getModel("oDefaultDataModel"),
				rows: {
					path: "/CFAApproverMatrixData"
				},
				columns: [{
					name: "Document Type",
					template: {
						content: "{documentType}"
					}
				}, {
					name: "Cost Center",
					template: {
						content: "{costCenter}"
					}
				}, {
					name: "Vertical Function",
					template: {
						content: "{vf}"
					}
				}, {
					name: "GRE",
					template: {
						content: "{gre}"
					}
				}, {
					name: "Payment Type",
					template: {
						content: "{pt}"
					}
				}, {
					name: "Threshold",
					template: {
						content: "{threshold}"
					}
				}, {
					name: "Function",
					template: {
						content: "{function}"
					}
				}, {
					name: "Approver",
					template: {
						content: "{approver}"
					}
				}]
			});
			oExport.saveFile().catch(function (oError) {}).then(function () {
				oExport.destroy();
			});
		},

		/*****WorkBox (CFA Approver Matrix) - end*****/

		/*****WorkBox (Task detail page configuration) - start*****/

		//fetching the details of connectors configuration
		fetchConnectorListFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var data = [{
				"sourceSystem": "BPM",
				"technicalName": "SAP BPM",
				"isActive": true
			}, {
				"sourceSystem": "SuccessFactors",
				"technicalName": "SAP SuccessFactors",
				"isActive": true
			}, {
				"sourceSystem": "Sharepoint",
				"technicalName": "Microsoft Sharepoint",
				"isActive": true
			}, {
				"sourceSystem": "SCP",
				"technicalName": "SAP Cloud platform workflow",
				"isActive": true
			}, {
				"sourceSystem": "ARIBA",
				"technicalName": "SAP ARIBA",
				"isActive": true
			}, {
				"sourceSystem": "ECC",
				"technicalName": "SAP ECC Workflow",
				"isActive": true
			}, {
				"sourceSystem": "Docusign",
				"technicalName": "Docusign E-Signature Workflow",
				"isActive": false
			}, {
				"sourceSystem": "Teams",
				"technicalName": "Microsoft Teams",
				"isActive": false
			}, {
				"sourceSystem": "Salesforce",
				"technicalName": "Salesforce workflow",
				"isActive": true
			}, {
				"sourceSystem": "JIRA",
				"technicalName": "JIRA Workflow",
				"isActive": false
			}, {
				"sourceSystem": "Zoho",
				"technicalName": "Zoho workflow",
				"isActive": false
			}];
			oDefaultDataModel.setProperty("/configureConnectorList", data);
			oDefaultDataModel.refresh(true);
		},

		//opening the fragment for configuring connector
		configureConnectorFn: function () {
			if (!this._oConfigConnectorFragment) {
				this._oConfigConnectorFragment = this._createFragment("oneapp.incture.workbox.fragment.ConfigureConnectorAC", this);
				this.getView().addDependent(this._oConfigConnectorFragment);
			}
			this._oConfigConnectorFragment.open();
		},

		//closing the configure connector fragment and resetting the properties
		closeConfigConnectorFragment: function () {
			this._oConfigConnectorFragment.close();
		},

		//get system processes - service call
		getSystemProcessFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/busyIndicators/systemList", true);
			var url = "/WorkboxJavaService/customProcess/getProcess?processType=system";
			this.doAjax(url, "GET", null, function (oData) {
				for (var i = 0; i < oData.processDetails.length; i++) {
					if (oData.processDetails[i].processName === "ALL") {
						oData.processDetails.splice(i, 1);
					}
				}
				oDefaultDataModel.setProperty("/systemProcessList", oData.processDetails);
				oDefaultDataModel.setProperty("/busyIndicators/systemList", false);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//opening the help popover - to get the process json file
		openHelpProcessJson: function (oEvent) {
			var oSource = oEvent.getSource();
			var oParent = oSource.getParent();
			if (!this._helpJSONPopover) {
				this._helpJSONPopover = this._createFragment("oneapp.incture.workbox.fragment.ProcessJsonHelpAC", this);
				this.getView().addDependent(this._helpJSONPopover);
			}
			this._helpJSONPopover.openBy(oParent);
			this.getModel("oDefaultDataModel").setProperty("/modelProcessName", null);
		},

		//downloading the process json file
		downloadProcessJsonFn: function () {
			var processName = this.getModel("oDefaultDataModel").getProperty("/modelProcessName");
			if (!processName) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			} else {
				var url = "https://bpmworkflowruntimea2d6007ea-kbniwmq1aj.hana.ondemand.com/workflow-service/rest/v1/workflow-definitions/" +
					processName + "/model";
				var a = document.createElement("a");
				document.body.appendChild(a);
				a.style = "display: none";
				a.href = url;
				a.download = processName + "." + "json";
				a.click();
				this._helpJSONPopover.close();
			}
		},

		//opening the fragment to configure the process
		configureProcessFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var processData = {
				"processDisplayName": "",
				"origin": "",
				"sla": 0,
				"critical": 0
			};
			oDefaultDataModel.setProperty("/configureProcessData", processData);

			if (!this._oConfigProcessFragment) {
				this._oConfigProcessFragment = this._createFragment("oneapp.incture.workbox.fragment.ConfigProcessAC", this);
				this.getView().addDependent(this._oConfigProcessFragment);
			}
			this._oConfigProcessFragment.open();
		},

		//storing the attachment in a property
		prepareJsonPayload: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oFile = oEvent.getParameter("files");
			oDefaultDataModel.setProperty("/configuredProcessName", oFile[0].name);
			oDefaultDataModel.setProperty("/uploadedJsonFile", oFile[0]);
			oDefaultDataModel.refresh(true);
		},

		//post ajax call funciton to upload the process json file
		uploadProcessJsonFn: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var processDetails = oDefaultDataModel.getProperty("/configureProcessData");
			var file = oDefaultDataModel.getProperty("/configuredProcessName");
			var validationCheck;
			if (processDetails.processDisplayName === "" || processDetails.origin === "" || processDetails.sla <= 0 || processDetails.critical <=
				0 || !file) {
				validationCheck = 1;
			} else if (processDetails.sla <= processDetails.critical) {
				validationCheck = 2;
			}

			if (validationCheck) {
				if (validationCheck === 1) {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
				} else if (validationCheck === 2) {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("DUE_DATE_ERR_MSG"));
				}
			} else {
				var oFormData = new FormData();
				var oFile = oDefaultDataModel.getProperty("/uploadedJsonFile");
				oFormData.append("file", oFile);
				oFormData.append("name", processDetails.processDisplayName);
				oFormData.append("sla", processDetails.sla);
				oFormData.append("origin", processDetails.origin);
				oFormData.append("critical", processDetails.critical);
				var url = "/WorkboxJavaService/SCP/uploadFile";
				$.ajax({
					url: url,
					type: "POST",
					crossDomain: true,
					processData: false,
					contentType: false,
					data: oFormData,
					success: function (data, textStatus, XMLHttpRequest) {
						that.getSystemProcessFn();
						that.onCloseConfigProcessFragment();
						that._showToastMessage(data.message);
					},
					error: function (data, textStatus, XMLHttpRequest) {
						that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("ERROR_TEXT"));
					}
				});
			}
			oDefaultDataModel.setProperty("/taskTemplateData", []);
			oDefaultDataModel.setProperty("/taskTemplateData/layoutsData", []);
			oDefaultDataModel.refresh(true);
		},

		//closing the configure process fragment and resetting the properties
		onCloseConfigProcessFragment: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/configuredProcessName", null);
			oDefaultDataModel.setProperty("/uploadedJsonFile", null);
			oDefaultDataModel.setProperty("/configureProcessData", null);
			oDefaultDataModel.refresh(true);
			this._oConfigProcessFragment.close();
		},

		//on click of process, get details of the task configuration layout
		getProcessConfigDetails: function (oEvent) {
			var index = oEvent.getSource().getSelectedContextPaths()[0].split("/")[2];
			var processName = this.getModel("oDefaultDataModel").getProperty("/systemProcessList")[index].processName;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/configSelectedTab", "taskConfiguration");
			oDefaultDataModel.setProperty("/configSelectedProcess", processName);
			this.getTemplatesFn();
			oEvent.getSource().removeSelections();
			oDefaultDataModel.refresh(true);
		},

		//getting the process details and template of task
		getTemplatesFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var processName = oDefaultDataModel.getProperty("/configSelectedProcess");
			var url = "/WorkboxJavaService/SCP/getProcessDetails?processName=" + processName;
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/configuredProcessDetails", oData);
				this.getView().byId("WB_TASK_CONFIG_TAB_ID").setSelectedKey(oData.tasks[0].taskName);
				oDefaultDataModel.setProperty("/currentTemplateTab", oData.tasks[0].taskName);
				this.templateServiceCall(processName, oData.tasks[0].taskName);
				this.fetchTaskAttributesFn();
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//service call to fetch all the task attributes
		fetchTaskAttributesFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var processName = oDefaultDataModel.getProperty("/configSelectedProcess");
			var url = "/WorkboxJavaService/SCP/processContextData?processName=" + processName;
			this.doAjax(url, "GET", null, function (oData) {
					var data = JSON.parse(oData.context);
					var keys = Object.keys(data);
					var customData = [];
					var obj;
					var check;
					var sKeys;
					for (var j = 0; j < keys.length; j++) {
						if (typeof (data[keys[j]]) === "string") {
							obj = {
								"layoutId": "",
								"key": keys[j],
								"keyLabel": keys[j],
								"keyType": "INPUT",
								"isEditable": true,
								"sourceIndex": "",
								"isMandatory": true,
								"isVisible": true,
								"hasAction": false,
								"actionURL": "",
								"sequence": j + 1,
								"valueHelpId": "",
								"keyValue": null,
								"index": null,
								"validForUsage": null
							};
							customData.push(obj);
						} else {
							var subData = [];
							if (keys[j] !== "forms") {
								sKeys = Object.keys(data[keys[j]][0]);
							} else {
								sKeys = data[keys[j]];
							}
							for (var z = 0; z < sKeys.length; z++) {
								var label;
								if (keys[j] !== "forms") {
									label = sKeys[z];
								} else {
									label = sKeys[z].key;
								}
								obj = {
									"layoutId": "",
									"key": label,
									"keyLabel": label,
									"keyType": "INPUT",
									"sourceKey": keys[j],
									"isEditable": true,
									"isMandatory": true,
									"isVisible": true,
									"sourceIndex": "",
									"hasAction": false,
									"actionURL": "",
									"sequence": z + 1,
									"valueHelpId": "",
									"keyValue": null,
									"index": null,
									"validForUsage": null
								};
								if (keys[j] === "forms") {
									obj.sourceIndex = z;
									obj.valueHelpId = JSON.stringify(sKeys[z].valueHelp);
									obj.keyValue = sKeys[z].value;
								}
								subData.push(obj);
							}
							check = {
								"keyLabel": keys[j],
								"attributeList": subData
							};
							customData.push(check);
						}
					}
					var list = {
						"attributeList": customData
					};
					oDefaultDataModel.setProperty("/layoutCustomData", list);
				}.bind(this),
				function (oError) {}.bind(this));
		},

		//getting the template configuration details
		getTasktemplateData: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var taskName = this.getView().byId("WB_TASK_CONFIG_TAB_ID").getSelectedKey();
			var processName = oDefaultDataModel.getProperty("/configSelectedProcess");
			var warning = this.getView().getModel("i18n").getResourceBundle().getText("DATA_LOSS_ALERT_TEXT");
			var alertmessage = this.getView().getModel("i18n").getResourceBundle().getText("ALERT_TEXT");
			if (oDefaultDataModel.getProperty("/isChanged")) {
				this._createConfirmationMessage(warning, alertmessage, "Warning", "Yes", "No", true,
					function (discardChange) {
						oDefaultDataModel.setProperty("/isChanged", false);
						this.oAppModel.setProperty("/isChanged", false);
						oDefaultDataModel.setProperty("/currentTemplateTab", taskName);
						this.templateServiceCall(processName, taskName);

						//this.fetchTaskAttributesFn();
					},
					function (clearTabPress) {
						this.getView().byId("WB_TASK_CONFIG_TAB_ID").setSelectedKey(oDefaultDataModel.getProperty("/currentTemplateTab"));
						oDefaultDataModel.setProperty("/isChanged", true);
						this.oAppModel.setProperty("/isChanged", true);
					});
			} else {
				this.templateServiceCall(processName, taskName);
				//this.fetchTaskAttributesFn();
			}
		},

		//getting layout details
		templateServiceCall: function (processName, taskName) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var tURl = "/WorkboxJavaService/detailPage/taskConfiguration?processName=" + processName + "&taskName=" + taskName;
			oDefaultDataModel.setProperty("/currentTemplateTab", taskName);
			oDefaultDataModel.setProperty("/busyIndicators/templateCreation", true);
			this.doAjax(tURl, "GET", null, function (data) {
				oDefaultDataModel.setProperty("/isChanged", false);
				this.oAppModel.setProperty("/isChanged", false);
				if (data.taskTemplateData.length) {
					oDefaultDataModel.setProperty("/taskTemplateData", data.taskTemplateData[0]);
				} else {
					that.setLayoutFn();
					oDefaultDataModel.setProperty("/taskTemplateData", []);
					oDefaultDataModel.setProperty("/taskTemplateData/layoutsData", []);
				}
				oDefaultDataModel.setProperty("/busyIndicators/templateCreation", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		//to create the layout structure
		setLayoutFn: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/busyIndicators/templateCreation", true);
			var i18n = that.getView().getModel("i18n").getResourceBundle();
			var headerDto = [{
				"label": i18n.getText("LABEL_TEXT")
			}, {
				"label": i18n.getText("KEY_TEXT")
			}, {
				"label": i18n.getText("DATA_TYPE_TEXT")
			}, {
				"label": i18n.getText("VISIBILITY_TEXT")
			}, {
				"label": i18n.getText("EDITABLE_TEXT")
			}, {
				"label": i18n.getText("MANDATORY_TEXT")
			}, {
				"label": ""
			}];
			oDefaultDataModel.setProperty("/tableHeaderDto", headerDto);
			oDefaultDataModel.refresh(true);
			var vBox = new sap.m.VBox({
				renderType: "Bare",
				width: "100%",
				alignItems: "Center"
			}).bindAggregation("items", "oDefaultDataModel>/taskTemplateData/layoutsData", function (index, context) {
				var bindingObject = context.getObject();
				var VBox = that.createControlsFn(bindingObject, oDefaultDataModel);
				var subLayout = new sap.m.VBox({
					renderType: "Bare",
					alignItems: "Center",
					width: "98.5%"
				}).addStyleClass("sapUiTinyMargin").bindAggregation("items", "oDefaultDataModel>subLayoutsData", function (subIndex,
					subContext) {
					var subObject = subContext.getObject();
					subObject.level = "2";
					var subVBox = that.createControlsFn(subObject, oDefaultDataModel);
					var sSubVBox = new sap.m.VBox({
						renderType: "Bare",
						alignItems: "Center",
						width: "98.5%"
					}).addStyleClass("sapUiTinyMargin").bindAggregation("items", "oDefaultDataModel>subLayoutsData", function (sSubIndex,
						sSubContext) {
						var sSubObj = sSubContext.getObject();
						sSubObj.level = "3";
						var container = that.createControlsFn(sSubObj, oDefaultDataModel);
						return container;
					}.bind(that));
					subVBox.addItem(sSubVBox);
					return subVBox;
				}.bind(that));
				VBox.addItem(subLayout);
				return VBox;
			}.bind(that));
			this.getView().byId("ID_CREATE_TASK_DETAIL_LAYOUT").addItem(vBox);
			oDefaultDataModel.setProperty("/busyIndicators/templateCreation", false);
		},

		//adding controls to the layout
		createControlsFn: function (bindingObject, oDefaultDataModel) {
			var that = this;
			var i18n = that.getView().getModel("i18n").getResourceBundle();
			var subLayoutBtn = false;
			var attributeVisibleBtn = true;
			var text;

			if (bindingObject.layoutType.toLowerCase() === "grid" || bindingObject.layoutType.toLowerCase() === "icontabbar" ||
				bindingObject
				.layoutType
				.toLowerCase() === "forms") {
				text = i18n.getText("ADD_TEXT") + " " + i18n.getText("ATTRIBUTE_TEXT");
				subLayoutBtn = true;
			} else if (bindingObject.layoutType.toLowerCase() === "table" || bindingObject.layoutType.toLowerCase() === "actions") {
				text = i18n.getText("ADD_TEXT") + " " + i18n.getText("COLUMN_TEXT");
				if (bindingObject.layoutType.toLowerCase() === "actions") {
					attributeVisibleBtn = false;
				}
			}

			var titleContent = new sap.m.HBox({
					renderType: "Bare",
					width: "99.5%",
					alignItems: "Center",
					justifyContent: "SpaceBetween"
				}).addStyleClass("wbTaskTemplateContentClass")
				.addItem(new sap.m.HBox({
						renderType: "Bare",
						alignItems: "Center"
					})
					.addItem(new sap.m.Text({
						text: "{oDefaultDataModel>label}"
					}).addStyleClass("wbTaskDetailContentMargin wbTaskDetailInputWrapper"))
					.addItem(new sap.m.Button({
						tooltip: i18n.getText("EDIT_TEXT") + " " + i18n.getText("LAYOUT_TEXT"),
						icon: "sap-icon://edit",
						press: function (oEvt) {
							oDefaultDataModel.setProperty("/editLayout", true);
							oDefaultDataModel.setProperty("/editLayoutData", bindingObject);
							bindingObject.sourceKey = bindingObject.layoutAttributesData[0].sourceKey;
							that.createLayoutFn();
						}
					}).addStyleClass("wbCustomButtonClass")))
				.addItem(new sap.m.HBox({
						renderType: "Bare",
						alignItems: "Center"
					}).addItem(new sap.m.Button({
						text: i18n.getText("ADD_TEXT") + " " + i18n.getText("SUB_TEXT") + i18n.getText("LAYOUT_TEXT"),
						type: "Emphasized",
						press: function (oEvt) {
							oDefaultDataModel.setProperty("/createSubLayout", true);
							oDefaultDataModel.setProperty("/createSubLayoutData", bindingObject);
							that.createLayoutFn();
						},
						visible: subLayoutBtn
					}).addStyleClass("wbEmphasizedButtonStyleClass sapUiTinyMarginEnd"))
					.addItem(new sap.m.Button({
						text: text,
						type: "Emphasized",
						press: function (oEvt) {
							that.showAttributesLayoutFn(bindingObject);
						},
						visible: attributeVisibleBtn
					}).addStyleClass("wbEmphasizedButtonStyleClass sapUiTinyMarginEnd"))
					.addItem(new sap.m.Button({
						text: i18n.getText("DELETE_TEXT") + " " + i18n.getText("LAYOUT_TEXT"),
						type: "Reject",
						press: function (oEvt) {
							that.deleteLayoutFn(bindingObject, bindingObject.level);
						}
					}).addStyleClass("wbAdminMGroupsRemoveBulkBtn sapUiTinyMarginEnd")));

			var VBox = new sap.m.VBox({
					renderType: "Bare",
					width: "100%"
				}).addStyleClass("wbTaskDetailContentClass")
				.addItem(titleContent);

			var table = new sap.m.Table({
				width: "98.5%"
			}).addStyleClass("wbCustomTableClass sapUiTinyMargin");
			table.bindAggregation("columns", "oDefaultDataModel>/tableHeaderDto", function (
				index, context) {
				var column;
				var tableObject = context.getObject();
				var widthValue = "auto";
				if (!tableObject.label) {
					widthValue = "5%";
				}
				column = new sap.m.Column({
					width: widthValue,
					header: new sap.m.Label({
						text: tableObject.label,
						wrapping: true
					}).addStyleClass("wbTransformToUpperCase")
				});
				return column;
			}.bind(that));
			table.bindAggregation("items", "oDefaultDataModel>layoutAttributesData", function (index, context) {
				var row = new sap.m.ColumnListItem();
				var rowData = context.getObject();
				row.addCell(new sap.m.Text({
					text: rowData.keyLabel
				}));
				row.addCell(new sap.m.Text({
					text: rowData.key
				}));
				row.addCell(new sap.m.Text({
					text: rowData.keyType
				}));
				row.addCell(new sap.m.CheckBox({
					selected: rowData.isVisible,
					select: function (oEvt) {
						var visible = true;
						var editable = false;
						var mandatory = false;
						that.setRowData(oEvt, rowData, visible, editable, mandatory);
					}
				}));
				row.addCell(new sap.m.CheckBox({
					selected: rowData.isEditable,
					select: function (oEvt) {
						var visible = false;
						var editable = true;
						var mandatory = false;
						that.setRowData(oEvt, rowData, visible, editable, mandatory);
					}
				}));
				row.addCell(new sap.m.CheckBox({
					selected: rowData.isMandatory,
					select: function (oEvt) {
						var visible = false;
						var editable = false;
						var mandatory = true;
						that.setRowData(oEvt, rowData, visible, editable, mandatory);
					}
				}));
				row.addCell(new sap.m.Button({
					icon: "sap-icon://edit",
					tooltip: i18n.getText("EDIT_TEXT") + " " + i18n.getText("ATTRIBUTE_TEXT"),
					press: function (oEvt) {
						that.openEditAttributeFragFn(rowData, bindingObject, index);
					}
				})).addStyleClass("wbCustomButtonClass");
				return row;
			}.bind(that));

			VBox.addItem(table);
			return VBox;
		},

		//function to open the fragment to add layout
		createLayoutFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var layoutData = {
				"layoutId": "",
				"layoutName": "",
				"label": "",
				"layoutSize": "",
				"parentLayoutName": "",
				"sequence": "1",
				"level": "1",
				"sourceKey": null,
				"layoutType": "",
				"layoutAttributesData": [],
				"subLayoutsData": [],
				"validForUsage": null
			};

			var data = oDefaultDataModel.getProperty("/editLayoutData");
			if (data) {
				layoutData.layoutSize = data.layoutSize;
				layoutData.layoutId = data.layoutId;
				layoutData.layoutName = data.layoutName;
				layoutData.label = data.label;
				layoutData.layoutType = data.layoutType;
				layoutData.layoutAttributesData = data.layoutAttributesData;
				layoutData.sourceKey = data.sourceKey;
				layoutData.subLayoutsData = data.subLayoutsData;
			}
			oDefaultDataModel.setProperty("/createLayoutData", layoutData);

			if (!this._oCreateLayoutFragment) {
				this._oCreateLayoutFragment = this._createFragment("oneapp.incture.workbox.fragment.CreateLayoutAC", this);
				this.getView().addDependent(this._oCreateLayoutFragment);
			}
			this._oCreateLayoutFragment.open();
		},

		//closing the create layout fragment and resetting the create layout properties
		onCloseCreateLayoutFragment: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/createSubLayout", false);
			oDefaultDataModel.setProperty("/createSubLayout", false);
			oDefaultDataModel.setProperty("/editLayout", false);
			oDefaultDataModel.setProperty("/editLayoutData", null);
			oDefaultDataModel.setProperty("/createLayoutData", null);
			oDefaultDataModel.refresh(true);
			this._oCreateLayoutFragment.close();
		},

		//adding the layout to the template json
		addLayoutFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var layouts = oDefaultDataModel.getProperty("/taskTemplateData/layoutsData");
			var layoutData = oDefaultDataModel.getProperty("/createLayoutData");
			var validationCheck;
			if (!layoutData.label || !layoutData.layoutName || !layoutData.layoutType || (layoutData.layoutType.toLowerCase() ===
					"grid" && !layoutData.layoutSize)) {
				validationCheck = 1;
			}

			if (!validationCheck) {
				var editLayout = oDefaultDataModel.getProperty("/editLayoutData");
				if (editLayout) {
					var layoutId = editLayout.layoutId;
					var level = editLayout.level;
					var layoutType = editLayout.layoutType;
					if (layoutType !== layoutData.layoutType) {
						layoutData.layoutAttributesData = [];
						layoutData.subLayoutsData = [];
					}
					for (var i = 0; i < layouts.length; i++) {
						if (level === "1") {
							if (layoutId === layouts[i].layoutId) {
								layouts[i] = layoutData;
								break;
							}
						} else if (level === "2") {
							var subLayout = layouts[i].subLayoutsData;
							for (var j = 0; j < subLayout.length; j++) {
								if (layoutId === subLayout[j].layoutId) {
									subLayout[j] = layoutData;
									break;
								}
							}
						}
					}
				} else {
					if (!oDefaultDataModel.getProperty("/createSubLayout")) {
						layoutData.level = "1";
						layouts.push(layoutData);
					} else {
						var selLayout = oDefaultDataModel.getProperty("/createSubLayoutData");
						selLayout.subLayoutsData.push(layoutData);
					}
				}
				oDefaultDataModel.setProperty("/isChanged", true);
				this.oAppModel.setProperty("/isChanged", true);
				this.onCloseCreateLayoutFragment();
			} else {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			}
		},

		//opening the custom attributes fragment to add in the layout
		showAttributesLayoutFn: function (layoutData) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/selectedLayout", layoutData);
			oDefaultDataModel.refresh(true);

			if (!this._oAddAttributeLayoutFragment) {
				this._oAddAttributeLayoutFragment = this._createFragment("oneapp.incture.workbox.fragment.AddLayoutAttributesAC", this);
				this.getView().addDependent(this._oAddAttributeLayoutFragment);
			}
			this._oAddAttributeLayoutFragment.open();
		},

		//closing the add attribute fragment
		closeAddAttLayoutFragment: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/selectedLayout", null);
			oDefaultDataModel.refresh(true);
			this._oAddAttributeLayoutFragment.close();
		},

		//checks the selection if parent node is selected, then child nodes are selected
		checkSelectionFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var selItems = oEvent.getSource().getSelectedContextPaths();
			for (var i = 0; i < selItems.length; i++) {
				var data = oDefaultDataModel.getProperty(selItems[i]);
				if (data.attributeList) {
					var arr = selItems[i].split("/");
					var index = parseInt(arr[arr.length - 1], 10);
					oEvent.getSource().getItems()[index].setSelected(false);
				}
			}
		},

		//adding attributes to the selected layout and to template json
		addAttributestoLayoutFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var selectedLayout = oDefaultDataModel.getProperty("/selectedLayout");
			var sourceKey = "";
			var sourceIndex = "";
			if (selectedLayout.layoutAttributesData.length) {
				sourceKey = selectedLayout.layoutAttributesData[0].sourceKey;
				sourceIndex = selectedLayout.layoutAttributesData[0].sourceIndex;
			}
			var items = sap.ui.getCore().byId("ID_ADD_ATTRIBUTE_LAYOUT_LIST").getSelectedContextPaths();
			selectedLayout.layoutAttributesData = [];
			var item;

			for (var i = 0; i < items.length; i++) {
				item = oDefaultDataModel.getProperty(items[i]);
				item.layoutId = selectedLayout.layoutId;
				item.sourceIndex = sourceIndex;
				if (sourceKey === "forms") {
					item.sourceIndex = i + 1;
				}
				item.sequence = i + 1;
				selectedLayout.layoutAttributesData.push(item);
			}
			sap.ui.getCore().byId("ID_ADD_ATTRIBUTE_LAYOUT_LIST").removeSelections();

			var extraItems = sap.ui.getCore().byId("ID_ADD_EXTRA_ATTRIBUTE_LAYOUT_LIST").getSelectedContextPaths();
			for (var j = 0; j < extraItems.length; j++) {
				item = oDefaultDataModel.getProperty(extraItems[j]);
				item.sourceKey = sourceKey;
				item.sourceIndex = sourceIndex;
				if (sourceKey === "forms") {
					item.sourceIndex = i + 1;
				}
				item.layoutId = selectedLayout.layoutId;
				item.sequence = i + 1;
				if (!item.key) {
					item.key = item.keyLabel;
				}
				selectedLayout.layoutAttributesData.push(item);
			}
			sap.ui.getCore().byId("ID_ADD_EXTRA_ATTRIBUTE_LAYOUT_LIST").removeSelections();
			oDefaultDataModel.setProperty("/isChanged", true);
			this.oAppModel.setProperty("/isChanged", true);
			this.closeAddAttLayoutFragment();
		},

		//opening the edit aatribute fragment
		openEditAttributeFragFn: function (rowData, bindingObject, index) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/editAttributeObject", bindingObject);
			oDefaultDataModel.setProperty("/editAttributeIndex", index.split("-")[1]);

			var obj = {
				"layoutId": rowData.layoutId,
				"key": rowData.key,
				"keyLabel": rowData.keyLabel,
				"keyType": "INPUT",
				"isEditable": rowData.isEditable,
				"isMandatory": rowData.isMandatory,
				"isVisible": rowData.isVisible,
				"hasAction": false,
				"actionURL": "",
				"sequence": "",
				"valueHelpId": "",
				"keyValue": null,
				"index": null,
				"validForUsage": null
			};
			oDefaultDataModel.setProperty("/editObjectDetails", obj);
			if (!this._oEditAttributeFragment) {
				this._oEditAttributeFragment = this._createFragment("oneapp.incture.workbox.fragment.EditAttributeAC", this);
				this.getView().addDependent(this._oEditAttributeFragment);
			}
			this._oEditAttributeFragment.open();
		},

		editAttributeSubfn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var index = oDefaultDataModel.getProperty("/editAttributeIndex");
			oDefaultDataModel.setProperty("/editAttributeObject/layoutAttributesData/" + index, oDefaultDataModel.getProperty(
				"/editObjectDetails"));
			oDefaultDataModel.refresh(true);
			this.closeEditAttributeFragFn();
		},

		//closing the frgament and resetting the properties
		closeEditAttributeFragFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/editAttributeObject", null);
			oDefaultDataModel.setProperty("/editAttributeIndex", null);
			oDefaultDataModel.setProperty("/editObjectDetails", null);
			oDefaultDataModel.refresh(true);
			this._oEditAttributeFragment.close();
		},

		//setting the visible, editable and mandatory property of layout attributes data (if the user directly edits from table)
		setRowData: function (oEvt, rowData, visible, editable, mandatory) {
			if (visible) {
				rowData.isVisible = oEvt.getParameter("selected");
			} else if (editable) {
				rowData.isEditable = oEvt.getParameter("selected");
			} else if (mandatory) {
				rowData.isMandatory = oEvt.getParameter("selected");
			}
			this.getModel("oDefaultDataModel").refresh(true);
		},

		//adding extra attributes
		addExtraContextFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var data = oDefaultDataModel.getProperty("/extraLayoutCustomData");
			var obj = {
				"layoutId": "",
				"key": "",
				"keyLabel": "",
				"keyType": "INPUT",
				"isEditable": false,
				"isMandatory": false,
				"isVisible": true,
				"hasAction": false,
				"actionURL": "",
				"sequence": "",
				"valueHelpId": "",
				"keyValue": null,
				"index": null,
				"validForUsage": null
			};
			data.push(obj);
			oDefaultDataModel.refresh(true);
		},

		//checking the label - validation
		checkLabelDataFn: function (oEvent) {
			var value = oEvent.getSource().getValue();
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			var data = oDefaultDataModel.getProperty("/layoutCustomData");
			var validationCheck;
			for (var i = 0; i < data.length; i++) {
				if (value === data[i].keyLabel && data[i].key !== object.key) {
					validationCheck = 1;
				}
			}
			if (validationCheck) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("CUSTOM_ATTRIBUTE_LABEL_ERR"));
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		},

		//deletion of layout
		deleteLayoutFn: function (bindingObject, level) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var data = oDefaultDataModel.getData().taskTemplateData.layoutsData;
			for (var i = 0; i < data.length; i++) {
				if (level === "1") {
					if (bindingObject.layoutName === data[i].layoutName) {
						data.splice(i, 1);
						break;
					}
				} else if (level === "2" || level === "3") {
					var subData = data[i].subLayoutsData;
					for (var j = 0; j < subData.length; j++) {
						if (level === "2") {
							if (bindingObject.layoutName === subData[j].layoutName) {
								subData.splice(j, 1);
								break;
							}
						} else if (level === "3") {
							var subSData = subData[j].subLayoutsData;
							for (var z = 0; z < subSData.length; z++) {
								if (bindingObject.layoutName === subSData[z].layoutName) {
									subSData.splice(z, 1);
									break;
								}
							}
						}
					}
				}
			}
			oDefaultDataModel.refresh(true);
		},

		//opening copy layout fragment 
		openCopyLayoutFragFn: function () {
			if (!this._oOpenCopyLayoutFragment) {
				this._oOpenCopyLayoutFragment = this._createFragment("oneapp.incture.workbox.fragment.CopyLayoutAC", this);
				this.getView().addDependent(this._oOpenCopyLayoutFragment);
			}
			this._oOpenCopyLayoutFragment.open();
		},

		//close copy layout fragment 
		closeCopyLayoutFragFn: function () {
			sap.ui.getCore().byId("WB_COPY_LAYOUT_LIST_ID").removeSelections();
			this._oOpenCopyLayoutFragment.close();
		},

		//copy layout from the selected task 
		copyLayoutFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var taskName = oDefaultDataModel.getProperty(sap.ui.getCore().byId("WB_COPY_LAYOUT_LIST_ID").getSelectedContextPaths()[0] +
				"/taskName");
			var processName = oDefaultDataModel.getProperty("/configSelectedProcess");
			oDefaultDataModel.setProperty("/isChanged", true);
			this.oAppModel.setProperty("/isChanged", true);
			this.templateServiceCall(processName, taskName);
			this.closeCopyLayoutFragFn();
		},

		//updating the task template configuration post call
		updateTaskConfigFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var postData = {};
			var templateData = oDefaultDataModel.getProperty("/taskTemplateData");
			var processName = oDefaultDataModel.getProperty("/configSelectedProcess");
			var taskName = this.getView().byId("WB_TASK_CONFIG_TAB_ID").getSelectedKey();

			for (var i = 0; i < templateData.layoutsData.length; i++) {
				templateData.layoutsData[i].sequence = i + 1;
				var subLayoutsData = templateData.layoutsData[i].subLayoutsData;
				for (var k = 0; k < subLayoutsData.length; k++) {
					subLayoutsData[k].sequence = k + 1;
				}
			}

			postData.processName = processName;
			postData.taskName = taskName;
			postData.origin = oDefaultDataModel.getProperty("/configuredProcessDetails/origin");
			postData.parentTaskName = "";
			postData.templateId = templateData.templateId;
			postData.layoutsData = templateData.layoutsData;

			var url = "/WorkboxJavaService/detailPage/updateTaskConfiguration";
			this.doAjax(url, "POST", postData, function (oData) {
				this._showToastMessage(oData.message);
				oDefaultDataModel.setProperty("/isChanged", false);
				this.oAppModel.setProperty("/isChanged", false);
				if (oDefaultDataModel.getProperty("/extraLayoutCustomData").length) {
					this.updateProcessContextData();
				}
				this.templateServiceCall(processName, taskName);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//update process context data - post call
		updateProcessContextData: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var postData = {
				"processName": oDefaultDataModel.getProperty("/configSelectedProcess"),
				"context": {}
			};
			var layouts = oDefaultDataModel.getData().taskTemplateData.layoutsData;
			for (var i = 0; i < layouts.length; i++) {
				var attributes;
				var arr = [];
				var key;
				var sourceKey;
				var obj;
				attributes = layouts[i].layoutAttributesData;
				sourceKey = attributes[0].sourceKey;
				obj = {};
				for (var j = 0; j < attributes.length; j++) {
					key = attributes[j].key;
					if (!sourceKey) {
						postData.context[key] = "";
					} else if (sourceKey !== "forms") {
						obj[key] = "";
					} else if (sourceKey === "forms") {
						var formObj = {};
						formObj.valueHelp = [];
						formObj.value = "";
						formObj.key = key;
						arr.push(formObj);
					}
				}
				if (sourceKey) {
					if (sourceKey !== "forms") {
						arr.push(obj);
					}
					postData.context[sourceKey] = arr;
				}
			}
			postData.context = JSON.stringify(postData.context);

			var url = "/WorkboxJavaService/SCP/updateProcessContextData";
			this.doAjax(url, "POST", postData, function (oData) {
				this.fetchTaskAttributesFn();
				oDefaultDataModel.setProperty("/extraLayoutCustomData", []);
			}.bind(this), function (oError) {}.bind(this));
		},

		/*****WorkBox (Task detail page configuration) - end*****/

		/*****WorkBox (Audit Logs) - start*****/

		//to get the audit logs data
		getAuditLogsData: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var surl = "/WorkboxJavaService/detailPage/auditLogs";
			oDefaultDataModel.setProperty("/busyIndicators/auditLogs", true);
			this.doAjax(surl, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/auditLogsData", oData);
				oDefaultDataModel.setProperty("/busyIndicators/auditLogs", false);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//filtering the data in the auditlogs table
		searchAuditLogsACFn: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter([
					new Filter("requestId", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("platform", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("signatureVerified", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("userId", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("userName", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("action", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("updatedAtString", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("completedAtString", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("comment", sap.ui.model.FilterOperator.Contains, sQuery)
				], false);
				aFilters.push(filter);
			}
			var oBinding = this.getView().byId("WB_AUDIT_LOGS_AC").getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},

		/*****WorkBox (Audit Logs) - end*****/

		/*****TaskManagement - start*****/

		/*****TaskManagement (advanced workflow) - start*****/

		//set advanced workflow data
		setAdvancedWfData: function () {
			var data = {
				"teamDetailDto": [{
					"templateId": "endTask",
					"width": 160,
					"icon": "sap-icon://accept",
					"status": "Success",
					"titleLineSize": 2,
					"eventName": "End",
					"sourceId": [
						""
					],
					"targetId": [
						""
					]
				}, {
					"templateId": "startTask",
					"width": 160,
					"icon": "sap-icon://accept",
					"status": "Success",
					"titleLineSize": 2,
					"eventName": "Start",
					"sourceId": [
						""
					],
					"targetId": [
						""
					]
				}],
				"mappingLines": []
			};
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/refreshGraph", true);
			oDefaultDataModel.setProperty("/advancedWfData", data);
			this.setWfActiveTaskData();
			this.getSourceDropdownDetails();
			var mapLines = [{
				"from": "startTask",
				"to": "endTask"
			}];
			oDefaultDataModel.setProperty("/advancedWfData/mappingLines", mapLines);
			oDefaultDataModel.refresh(true);
		},

		refreshGraphFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			if (oDefaultDataModel.getProperty("/refreshGraph")) {
				oDefaultDataModel.setProperty("/refreshGraph", false);
				oDefaultDataModel.refresh(true);
			}
		},

		//fetching the default node data after deleting the node
		setWfActiveTaskData: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var activeTask = {
				"processName": "",
				"eventName": "",
				"templateId": Math.random().toString(20).substr(2, 24),
				"taskType": "Approve/Reject",
				"taskNature": "User Based",
				"individual": [],
				"group": [],
				"runTimeUser": 0,
				"isEdited": 0,
				"customKey": null,
				"customAttributes": [],
				"sourceId": [],
				"targetId": [],
				"subject": "",
				"description": "",
				"url": null,
				"rules": null,
				"customattrTypes": null,
				"statusDto": {
					"ready": "Ready",
					"reserved": "Reserved",
					"completed": "Completed",
					"approve": "Approved",
					"resolved": "Resolved",
					"reject": "Rejected",
					"done": "Done"
				}
			};
			oDefaultDataModel.setProperty("/advancedWfActiveTask", activeTask);
			oDefaultDataModel.refresh(true);
		},

		//line generation function for workflow flowchart
		setMappingLinesFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var nodes = oDefaultDataModel.getProperty("/advancedWfData/teamDetailDto");
			var newLines = [];
			for (var i = 0; i < nodes.length; i++) {
				var templateId = nodes[i].templateId;
				if (templateId !== "startTask" && templateId !== "endTask") {
					var source = nodes[i].sourceId;
					if (!source.length) {
						source.push("startTask");
					}
					var target = nodes[i].targetId;
					if (!target.length) {
						target.push("endTask");
					}
					for (var j = 0; j < source.length; j++) {
						var sObj = {
							"from": source[j],
							"to": templateId
						};
					}
					for (var z = 0; z < target.length; z++) {
						var tObj = {
							"from": templateId,
							"to": target[z]
						};
					}
					newLines.push(sObj);
					newLines.push(tObj);
				}
			}
			var unique = [];
			var temp = "";
			for (var a = 0; a < newLines.length; a++) {
				var id = [newLines[a].from, newLines[a].to].join("|");
				var count = 0;
				for (var i = 0; i < unique.length; i++) {
					temp = [unique[i].from, unique[i].to].join("|");
					if (temp === id) {
						count++;
					}
				}
				if (!count) {
					unique.push(newLines[a]);
				}
			}
			oDefaultDataModel.setProperty("/advancedWfData/mappingLines", unique);
			oDefaultDataModel.refresh(true);
		},

		//function activates on click of mapping lines between the node
		linePress: function (oEvent) {
			oEvent.bPreventDefault = true;
		},

		//fetching the selected Node Data and setting to Right Pane of Advanced WF
		setWfNodeSelectedData: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var sPath = oEvent.getSource().getBindingContext("oDefaultDataModel").sPath;
			var oSelectedData = oDefaultDataModel.getProperty(sPath);
			var selectedMainTab = this.getView().byId("WB_ADVANCED_WF_ID");
			selectedMainTab.setSelectedKey("taskDetails");
			if (oSelectedData.templateId !== "startTask" && oSelectedData.templateId !== "endTask") {
				oDefaultDataModel.setProperty("/advancedWfActiveTask", oSelectedData);
			}
			oDefaultDataModel.refresh();
		},

		//saving the selected task to the workflow payload
		saveActiveTaskFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var taskDto = oDefaultDataModel.getProperty("/advancedWfData/teamDetailDto");
			var activeTask = oDefaultDataModel.getProperty("/advancedWfActiveTask");
			for (var i = 0; i < taskDto.length; i++) {
				if (activeTask.templateId === taskDto[i].templateId) {
					taskDto[i] = activeTask;
					this.setMappingLinesFn();
					break;
				}
			}
		},

		//fetch rule based attributes function
		onTaskDetailsTabChange: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var tab = oEvent.getSource().getSelectedKey();
			var taskType = oDefaultDataModel.getProperty("/advancedWfActiveTask/taskNature");
			if (taskType === "Rule Based" && tab === "taskOwnerDetails") {
				taskManagement.fetchRuleTaskAttributeTM(this, oDefaultDataModel);
			}
		},

		//change run time type property
		onSelectRunTimeType: function (oEvent) {
			var type = "individual";
			if (oEvent.getSource().getSelectedIndex()) {
				type = "group";
			}
			oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().runTimeType = type;
		},

		//setting dropdown values and table attributes function
		dataTypeChangeFn: function (oEvent) {
			var dataType = oEvent.getSource().getSelectedKey();
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			if (dataType === "DROPDOWN") {
				object.dropDownValues = [{
					"valueName": "",
					"value": Math.random().toString(20).substr(2, 24),
					"isEdited": 2
				}];
			} else if (dataType === "TABLE") {
				object.tableAttributes = [{
					"dataType": "INPUT",
					"description": "",
					"isActive": true,
					"isDeleted": false,
					"isVisible": true,
					"isEditable": true,
					"isEdited": 2,
					"isMandatory": true,
					"key": Math.random().toString(20).substr(2, 24),
					"label": "",
					"processName": "",
					"attributePath": "",
					"validForUsage": true,
					"isRunTime": false,
					"origin": "Table",
					"copy": false,
					"dependantOn": null
				}];
			} else {
				object.dropDownValues = null;
				object.tableAttributes = null;
			}
		},

		//add rules in the selected task
		addRuleAdvancedWfFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var data = oDefaultDataModel.getProperty("/advancedWfActiveTask");
			if (!data.rules) {
				data.rules = [];
			}
			var add = {
				"ruleId": Math.random().toString(20).substr(2, 24),
				"ruleTypeId": data.templateId,
				"custom_key": null,
				"condition": null,
				"destination": [],
				"operator": ""
			};
			data.rules.push(add);
			oDefaultDataModel.refresh(true);
		},

		//delete rules in the selected task
		deleteRuleAdvancedWfFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var data = oDefaultDataModel.getProperty("/advancedWfActiveTask");
			var index = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath().split("/")[3];
			data.rules.splice(index, 1);
			oDefaultDataModel.refresh(true);
		},

		//get source destination details
		getSourceDropdownDetails: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var data = oDefaultDataModel.getProperty("/advancedWfData/teamDetailDto");
			var source = [];
			for (var i = 0; i < data.length; i++) {
				var obj = {
					"text": data[i].eventName,
					"key": data[i].templateId
				};
				source.push(obj);
			}
			oDefaultDataModel.setProperty("/advancedWfSourceItems", source);
			oDefaultDataModel.refresh(true);
		},

		//create advanced workflow post call
		createAdvancedWorkflowFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var data = oDefaultDataModel.getProperty("/advancedWfData/teamDetailDto");
			var workFlowProcessData = oDefaultDataModel.getProperty("/createWorkFlowData/processDetail");
			workFlowProcessData.labelName = workFlowProcessData.processDisplayName;
			workFlowProcessData.processName = workFlowProcessData.processDisplayName;
			var tempData = oDefaultDataModel.getProperty("/processLevelAttributes");
			var taskDto = jQuery.extend(true, [], data);
			taskDto.splice(0, 1);
			taskDto.splice(0, 1);
			for (var i = 0; i < taskDto.length; i++) {
				taskDto[i].processName = workFlowProcessData.processDisplayName;
				var subjectData = taskDto[i].subject;
				for (var z = 0; z < tempData.length; z++) {
					if (subjectData.search(tempData[z].label) >= 0) {
						taskDto[i].subject = subjectData.replace(("{" + tempData[z].label + "}"), ("${" + tempData[z].key + "}"));
						subjectData = taskDto[i].subject;
					}
					var descData = taskDto[i].description;
					if (descData.search(tempData[z].label) >= 0) {
						taskDto[i].description = descData.replace(("{" + tempData[z].label + "}"), ("${" + tempData[z].key + "}"));
						descData = taskDto[i].description;
					}
				}
				for (var j = 0; j < taskDto[i].sourceId.length; j++) {
					if (taskDto[i].sourceId[j] === "endTask" || taskDto[i].sourceId[j] === "startTask") {
						taskDto[i].sourceId.splice(j, 1);
					}
				}
				for (var j = 0; j < taskDto[i].targetId.length; j++) {
					if (taskDto[i].targetId[j] === "endTask" || taskDto[i].targetId[j] === "startTask") {
						taskDto[i].targetId.splice(j, 1);
					}
				}
				var taskAttributes = taskDto[i].customAttributes;
				for (var z = 0; z < taskAttributes.length; z++) {
					taskAttributes[z].processName = taskDto[i].templateId;
				}
				if (taskDto[i].taskNature === "Rule Based") {
					for (var x = 0; x < taskDto[i].rules.length; x++) {
						taskDto[i].rules[x].condition = taskDto[i].rules[x].logic + taskDto[i].rules[x].value;
					}
				}
			}
			oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto", taskDto);
			var custom = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
			for (var a = 0; a < custom.length; a++) {
				custom[a].processName = workFlowProcessData.processDisplayName;
			}
			var url = "/WorkboxJavaService/customProcess/processWorkflowCreation";
			var response = oDefaultDataModel.getProperty("/createWorkFlowData");
			this.doAjax(url, "POST", response, function (oData) {
				this.getWorkFlowData();
				this.setAdvancedWfData();
				oDefaultDataModel.refresh(true);
				this._showToastMessage(oData.message);
				this.doAjax("/WorkboxJavaService/customProcess/getProcess?processType=All", "GET", null, function (data1) {
					this.getModel("oConstantsModel").setProperty("/processNames", data1.processDetails);
					var process = jQuery.extend(true, [], data1.processDetails);
					for (var i = 0; i < process.length; i++) {
						if (process[i].processName === "ALL") {
							process.splice(i, 1);
						}
					}
					this.getModel("oConstantsModel").setProperty("/processNamesList", process);
					this.getModel("oConstantsModel").setProperty("/selectedProcess", process[0].processName); // setting the default data as 1st process in  dropdown
					this.getModel("oConstantsModel").refresh(true);
				}.bind(this), function (oError) {}.bind(this));
			}.bind(this), function (oError) {}.bind(this));
			oDefaultDataModel.refresh(true);
		},

		/*****TaskManagement (advanced workflow) - end*****/

		/*****TaskManagement (Create Workflow)- start*****/

		//getting the cross constants (action type, creation type, data type, group and individual)
		getCrossConstants: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var that = this;
			taskManagement.getCrossConstantsTM(that, oDefaultDataModel);
		},

		//removing the special characters 
		removeSpecialCharacter: function (oEvent, property) {
			var value;
			var oSource = oEvent.getSource();
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			// Combobox or input
			if (property === "specialCharacter") {
				value = oEvent.getParameter("value").replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
				// For Unilab poc dont restrict ()
				if (this.getModel("oDefaultDataModel").getProperty("/manageProcessName") === "ProjectProposalDocumentApproval") {
					value = oEvent.getParameter("value").replace(/[`~!@#$%^&*_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
				}
				oSource.setValue(value);
			}
			// Step Input
			if (property === "numericOnly") {
				value = oEvent.getParameter("value");
				if (value > oSource.getMax()) {
					oSource.setValue(oEvent.getSource().getMax());
					oSource.setValueStateText("Value exceeded limit");
					this._showToastMessage(i18n.getText("DUE_CRITICAL_DAYS_MESSAGE"));
				}
				if (oSource.getValue() < 0) {
					oSource.setValue("");
				}
			}
		},

		//changing the property 
		changeProperty: function (oEvent, property) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (oEvent.getSource().getBindingContext("oDefaultDataModel").getPath().split("/")[2] === "customAttribute") {
					var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
					if (object.isEdited !== 2) {
						object.isEdited = 1;
					}
				}
			}
			if (property) {
				this.removeSpecialCharacter(oEvent, property);
			}
			this.oAppModel.setProperty("/isChanged", true);
		},

		//changing the swtich property 
		changeSwtichProperty: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
		},

		//changing the run time user selection 
		changeRunTimeProperty: function (oEvent) {
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			object.dataType = "DROPDOWN";
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
			if (oEvent.getSource().getState()) {
				object.runTimeType = "individual";
				delete object.dropDownValues;
				delete object.tableAttributes;
			} else {
				object.runTimeType = null;
				object.isRunTime = false;
				object.dropDownValues = [{
					"valueName": "",
					"value": Math.random().toString(20).substr(2, 24),
					"isEdited": 2
				}];
			}
		},

		//changing the run time switch property of task
		changeTaskRunTimeProperty: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("oDefaultDataModel").sPath.split("/customAttribute")[0];
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			object.dataType = "DROPDOWN";
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var task = oDefaultDataModel.getProperty(path);
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (object.isEdited !== 2) {
					object.isEdited = 1;
					task.isEdited = 1;
				}
			}
			if (oEvent.getSource().getState()) {
				task.group = [];
				task.individual = [];
				task.runTimeUser = 1;
				object.runTimeType = "individual";
				delete object.dropDownValues;
				delete object.tableAttributes;
			} else {
				object.runTimeType = null;
				task.runTimeUser = 0;
				task.customKey = null;
				object.dropDownValues = [{
					"valueName": "",
					"value": Math.random().toString(20).substr(2, 24),
					"isEdited": 2
				}];
			}
		},

		//changing the run time type switch property of task
		changeTaskRunTimeTypeProperty: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("oDefaultDataModel").sPath.split("/customAttribute")[0];
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var task = oDefaultDataModel.getProperty(path);
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (object.isEdited !== 2) {
					object.isEdited = 1;
					task.isEdited = 1;
				}
			}
		},

		//changing the dataType of attributes - (generating payload structure to create dropdown values)
		changeDataTypeProperty: function (oEvent) {
			this.oAppModel.setProperty("/isChanged", true);
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
			var dataType = oEvent.getSource().getSelectedItem().getText();
			if (dataType === "DROPDOWN" || dataType === "TABLE") {
				if (oEvent.getSource().getBindingContext("oDefaultDataModel").sPath.split("/").length === 4) {
					oEvent.getSource().getParent().getParent().getParent().getParent().setExpanded(true);
				} else {
					oEvent.getSource().getParent().getParent().getParent().getParent().getParent().setExpanded(true);
				}
			}
			if (dataType === "DROPDOWN") {
				object.dropDownValues = [{
					"valueName": "",
					"value": Math.random().toString(20).substr(2, 24),
					"isEdited": 2
				}];
			}
			if (dataType === "INPUT NUMERIC-CALCULATE") {
				var processLevelAttributes = oDefaultDataModel.getProperty("/processLevelAttributes");
				var processLevelOperatorAttributes;
				var operators = [{
					"label": "+",
					"key": "+"
				}, {
					"label": "-",
					"key": "-"
				}, {
					"label": "*",
					"key": "*"
				}, {
					"label": "/",
					"key": "/"
				}];
				processLevelOperatorAttributes = processLevelAttributes.concat(operators);
				oDefaultDataModel.setProperty("/processLevelOperatorAttributes", processLevelOperatorAttributes);
			} else if (dataType === "TABLE") {
				object.tableAttributes = [{
					"dataType": "INPUT",
					"description": "",
					"isActive": true,
					"isDeleted": false,
					"isVisible": true,
					"isEditable": true,
					"isEdited": 2,
					"isMandatory": true,
					"key": Math.random().toString(20).substr(2, 24),
					"label": "",
					"processName": "",
					"attributePath": "",
					"validForUsage": true,
					"isRunTime": false,
					"origin": "Table",
					"copy": false,
					"dependantOn": null
				}];
			}
			oDefaultDataModel.refresh(true);
		},

		//opening the popover of customize status
		customiseStatusFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var obj;
			if (this.oAppModel.getProperty("/currentViewPage") === "workFlow" || this.oAppModel.getProperty("/currentViewPage") ===
				"createWorkFlow") {
				obj = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			} else {
				obj = oDefaultDataModel.getProperty("/advancedWfActiveTask");
			}
			oDefaultDataModel.setProperty("/customStatusObject", obj);
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (obj.isEdited !== 2) {
					obj.isEdited = 1;
				}
			}
			var oSource = oEvent.getSource();
			if (!this._custStatusPopover) {
				this._custStatusPopover = this._createFragment("oneapp.incture.workbox.fragment.CustomiseStatusAC", this);
				this.getView().addDependent(this._custStatusPopover);
			}
			this._custStatusPopover.openBy(oSource);
			oDefaultDataModel.refresh(true);
		},

		//closing the popover and resettig the properties
		onCloseCustomiseStatusFn: function () {
			this._custStatusPopover.close();
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/customStatusObject", null);
			oDefaultDataModel.refresh(true);
		},

		//modifying the status of the tasks
		submitCustStatusFn: function () {
			this.onCloseCustomiseStatusFn();
		},

		//changing the property of url (is edited)
		changeURLProperty: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
			this.oAppModel.setProperty("/isChanged", true);
		},

		//changing the is Edited value in manage workflow (action type property)
		changeActionTypeProperty: function (oEvent) {
			this.oAppModel.setProperty("/isChanged", true);
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
		},

		//changing the is Edited value in manage workflow (event name property)
		changeTaskNameProperty: function (oEvent) {
			this.oAppModel.setProperty("/isChanged", true);
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var dto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			var oContext = oEvent.getSource().getBindingContext("oDefaultDataModel");
			var row = parseInt(oContext.sPath.split("/")[3], 10);
			var inputValue = oEvent.getParameter("value");
			var object = oContext.getObject();
			var key = object.templateId;
			if (oEvent.getParameter("value")) {
				if (dto.length - 1 === row) {
					oDefaultDataModel.setProperty("/TaskDeleteButtonStatus", true);
				}
			} else {
				if (dto.length - 1 === row) {
					oDefaultDataModel.setProperty("/TaskDeleteButtonStatus", false);
				}
			}
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
			this.removeSpecialCharacter(oEvent, "specialCharacter");
			taskManagement.generateTaskTemplateDropdown(oDefaultDataModel);
			this.checkTaskNameLabelValue(inputValue, key);
		},

		//changing the is Edited value in manage workflow (custom attribute label name property)
		changeCustomNameProperty: function (oEvent) {
			this.oAppModel.setProperty("/isChanged", true);
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var dto = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
			var oContext = oEvent.getSource().getBindingContext("oDefaultDataModel");
			var row = parseInt(oContext.sPath.split("/")[3], 10);
			var object = oContext.getObject();
			var key = object.key;
			var inputValue = oEvent.getParameter("value");
			if (inputValue) {
				if (dto.length - 1 === row) {
					oDefaultDataModel.setProperty("/CustomAddButtonStatus", true);
					oDefaultDataModel.setProperty("/customDeleteButtonStatus", true);
				}
			} else {
				if (dto.length - 1 === row) {
					oDefaultDataModel.setProperty("/CustomAddButtonStatus", false);
					oDefaultDataModel.setProperty("/customDeleteButtonStatus", false);
				}
			}
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
			this.removeSpecialCharacter(oEvent, "specialCharacter");
			this.checkCustomLabelValue(oEvent, inputValue, key);
		},

		//changing task attributes property
		changeTaskCustomNameProperty: function (oEvent) {
			this.oAppModel.setProperty("/isChanged", true);
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oContext = oEvent.getSource().getBindingContext("oDefaultDataModel");
			var customPath = oContext.getPath().split("/customAttributes")[0] +
				"/customAttributes";
			var dto = oDefaultDataModel.getProperty(customPath);
			var row = parseInt(oContext.sPath.split("/")[5], 10);
			var inputValue = oEvent.getParameter("value");
			var object = oContext.getObject();
			var key = object.key;
			if (inputValue) {
				if (dto.length - 1 === row) {
					oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", true);
				}
			} else {
				if (dto.length - 1 === row) {
					oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", false);
				}
			}
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
			this.removeSpecialCharacter(oEvent, "specialCharacter");
			this.checkCustomLabelValue(oEvent, inputValue, key);
		},

		//changing the is Edited value in manage workflow (task owner property)
		changeTaskOwnerProperty: function (oEvent, property) {
			this.oAppModel.setProperty("/isChanged", true);
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oContext = oEvent.getSource().getBindingContext("oDefaultDataModel");
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (oContext.getPath().split("/")[2] === "teamDetailDto") {
					var object = oContext.getObject();
					if (object.isEdited !== 2) {
						object.isEdited = 4;
					}
				}
			}
			if (property) {
				this.removeSpecialCharacter(oEvent, property);
			}
		},

		//initialising the create workflow with default data (null)
		getWorkFlowData: function () {
			var that = this;
			var selectedMainTab = that.getView().byId("WB_EXISTING_WF_ID");
			selectedMainTab.setSelectedKey("customAttributeTemplate");
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.getWorkFlowDataTM(that, oDefaultDataModel);
		},

		// validating the mandatory fields and creating  the workflow -post call
		workFlowCreatePost: function (validationCheck) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/customProcess/processWorkflowCreation";
			taskManagement.workFlowCreatePostTM(that, url, oDefaultDataModel, validationCheck);
		},

		//validation of process detail in create workflow
		createWorkFlowVaildation: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				var url = "/WorkboxJavaService/customProcess/updateProcess";
				taskManagement.updateWorkFlowTM(that, oDefaultDataModel, url);
			} else {
				taskManagement.createWorkFlowValidationTM(that, oDefaultDataModel);
			}
		},

		//validation of task detail in create workflow
		createWorkflowTaskValidation: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var that = this;
			taskManagement.createWorkFlowTaskValidationTM(that, oDefaultDataModel);
		},

		//validation of custom attribute in create workflow
		createWorkFlowCustomValidation: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.createWorkFlowCustomValidationTM(that, oDefaultDataModel);
		},

		//adding the dropdown values to the attribute of data type DROPDOWN
		addDropdownValues: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.addDropdownValuesTM(oEvent, oDefaultDataModel, this.oAppModel);
		},

		//deleting the dropdown values to the attribute of data type DROPDOWN
		deleteDropdownValues: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.deleteDropdownValuesTM(oEvent, oDefaultDataModel, this.oAppModel);
		},

		//adding the table column to the attribute of data type TABLE
		addTableColumnValues: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.addTableColumnValuesTM(oEvent, oDefaultDataModel, this.oAppModel);
		},

		//deleting the dropdown values to the attribute of data type TABLE
		deleteTableColumnValues: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.deleteTableColumnValuesTM(oEvent, oDefaultDataModel, this.oAppModel);
		},

		//checks the last row's event name, if filled allow user to add one more task level (row)
		addTaskLevelFn: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.addTaskLevelFnTM(that, oDefaultDataModel);
			//advanced workflow
			if (that.oAppModel.getProperty("/currentViewPage") === "advancedWorkFlow" || that.oAppModel.getProperty("/currentViewPage") ===
				"createAdvancedWorkFlow") {
				this.getSourceDropdownDetails();
			}
		},

		//sets the value of source of the tasks
		changeSourceTaskFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			object.sourceId = oEvent.getSource().getSelectedKeys();
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
		},
		changeTaskOwnerOrderBy: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/isChanged", true);
		},
		//sets the value of destination of the tasks
		changeDestTaskFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			object.targetId = oEvent.getSource().getSelectedKeys();
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (object.isEdited !== 2) {
					object.isEdited = 1;
				}
			}
		},

		//addding the task template to the team detail dto of workflow
		addTaskTemplateFn: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.addTaskTemplateFnTM(that, oDefaultDataModel);
		},

		//closing of add task template fragment
		onCloseAddTaskFragment: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.onCloseAddTaskFragmentTM(that, oDefaultDataModel);
		},

		//activating task level custom attributes
		onSelectTaskLevelCustomAttributes: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.onSelectTaskLevelCustomAttributesTM(that, oEvent, oDefaultDataModel);
		},

		//add existing custom attributes to the task template
		openShowAttributesFn: function () {
			var that = this;
			this.fetchExistingAttribute();
			taskManagement.openAddAttributesFragment(that);
		},

		//fetching the existing attributes and setting the data 
		fetchExistingAttribute: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.fetchExistingAttributeTM(that, oDefaultDataModel);
		},

		//adding attributes to the task template
		addExistingAttributestoTask: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.addExistingAttributestoTaskTM(that, oEvent, oDefaultDataModel);
		},

		//selects/deselects all the items in the add attribute list
		checkAttributeListFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var list = sap.ui.getCore().byId("ID_ADD_ATTRIBUTE_LIST");
			if (oEvent.getSource().getProperty("selected")) {
				oDefaultDataModel.setProperty("/attributeCheckBox", true);
				list.selectAll();
			} else {
				oDefaultDataModel.setProperty("/attributeCheckBox", false);
				list.removeSelections();
			}
			oDefaultDataModel.refresh(true);
		},

		//selects/deselects the checkbox in the add attribute list
		checkListSelectionFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var selectedItems = oEvent.getSource().getSelectedItems();
			var items = oEvent.getSource().getItems();
			if (selectedItems.length !== items.length) {
				oDefaultDataModel.setProperty("/attributeCheckBox", false);
			} else {
				oDefaultDataModel.setProperty("/attributeCheckBox", true);
			}
			oDefaultDataModel.refresh(true);
		},

		//closing of add existing attributes fragment
		onCloseAddAttributeFragment: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.onCloseAddAttributeFragmentTM(that, oDefaultDataModel);
		},

		//adding task level custom attributes function
		addTaskCustomAttributesFn: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.addTaskCustomAttributesFnTM(oEvent, oDefaultDataModel, that);
		},

		//deleting task level custom attributes function
		deleteTaskCustomAttributeFn: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.deleteTaskCustomAttributeFnTM(oEvent, oDefaultDataModel, that);
		},

		//delete the row if more than 1 row is present and if runtimeuser is enabled then corresponding custom attribute is also deleted
		deleteTaskLevelFn: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.deleteTaskLevelFnTM(oEvent, that, oDefaultDataModel);
		},

		//checks the last row's label, if filled allow user to add one more custom attribute (row)
		addCustomAttributeFn: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.addCustomAttributeFnTM(that, oDefaultDataModel);
		},

		//delete the selected row if more than 1 row is present else clear the value of that row and if runtimeuser is enabled then corresponding task level is also deleted
		deleteCustomAttributeFn: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.deleteCustomAttributeFnTM(that, oEvent, oDefaultDataModel);
		},

		//opening of task type template popover
		openTaskOwnerPopUpfn: function (oEvent) {
			var taskNature;
			if (this.oAppModel.getProperty("/currentViewPage") === "workFlow" || this.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				taskNature = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().taskNature;
			}
			if (taskNature) {
				if (taskNature === "Rule Based") {
					this.openSetRuleTaskFn(oEvent);
				} else {
					this.openOwnerSelectionFn(oEvent);
				}
			} else {
				this.openOwnerSelectionFn(oEvent);
			}
		},
		setTaskOwnerOrderBy: function (oEvent) {
			var oSource = oEvent.getSource();
			var oParent = oSource.getParent();
			if (!this._oTaskOwnerOrderByPopover) {
				this._oTaskOwnerOrderByPopover = this._createFragment("oneapp.incture.workbox.fragment.TaskOwnerOrderBy", this);
				this.getView().addDependent(this._oTaskOwnerOrderByPopover);
			}
			this._oTaskOwnerOrderByPopover.openBy(oParent);

		},

		//if the task nature is user based, then owner selection popover is displayed
		openOwnerSelectionFn: function (oEvent) {
			var oSource = oEvent.getSource();
			var oParent = oSource.getParent();
			if (!this._oTaskTypePopover) {
				this._oTaskTypePopover = this._createFragment("oneapp.incture.workbox.fragment.TaskTypeTemplateAC", this);
				this.getView().addDependent(this._oTaskTypePopover);
			}
			this._oTaskTypePopover.openBy(oParent);
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oConstantsModel = this.getModel("oConstantsModel");
			var groupList = sap.ui.getCore().byId("WB_GROUP_LIST_TASK_OWNER");
			var individualList = sap.ui.getCore().byId("WB_INDIVIDUAL_LIST_TASK_OWNER");
			var contextList = sap.ui.getCore().byId("WB_CONTEXT_LIST_TASK_OWNER");
			var selectedMainTab = sap.ui.getCore().byId("WB_TASK_OWNER_ID");
			groupList.removeSelections();
			individualList.removeSelections();
			contextList.removeSelections();
			selectedMainTab.setSelectedKey("taskownergroup");
			var teamDetailDto = oDefaultDataModel.getData().createWorkFlowData.teamDetailDto;
			var indexPath = oEvent.getSource().getBindingContext("oDefaultDataModel").sPath.split("/");
			var currentIndex = indexPath[3];
			if (!teamDetailDto[currentIndex].ownerSequenceType) {
				teamDetailDto[currentIndex].ownerSequenceType = {
					"ownerSequType": "Group",
					"attrTypeId": "",
					"attrTypeName": "",
					"orderBy": "ASC"
				};
				oDefaultDataModel.setProperty("/orderBy", "ASC");
				oDefaultDataModel.setProperty("/ownerSequType", "Group");
			} else {
				oDefaultDataModel.getData().orderBy = teamDetailDto[currentIndex].ownerSequenceType.orderBy;
				oDefaultDataModel.getData().ownerSequType = teamDetailDto[currentIndex].ownerSequenceType.ownerSequType;
			}
			if (teamDetailDto) {
				if (!teamDetailDto[currentIndex].ownerSelectionRules) {
					teamDetailDto[currentIndex].ownerSelectionRules = [];
				}
				if (!teamDetailDto[currentIndex].group) {
					teamDetailDto[currentIndex].group = [];
				}
				if (!teamDetailDto[currentIndex].individual) {
					teamDetailDto[currentIndex].individual = [];
				}
				if (teamDetailDto[currentIndex].ownerSelectionRules.length === 0) {
					if (teamDetailDto[currentIndex].runTimeUser !== 1) {
						if (teamDetailDto[currentIndex].group.length > 0) {
							selectedMainTab.setSelectedKey("taskownergroup");
							var groupListItems = oDefaultDataModel.getData().allGroups.dto;
							var group = teamDetailDto[currentIndex].group;
							for (var i = 0; i < group.length; i++) {
								for (var j = 0; j < groupListItems.length; j++) {
									if (group[i] === groupListItems[j].groupId) {
										groupList._aSelectedPaths.push("/allGroups/dto/" + j);
									}
								}
							}
						}
						if (teamDetailDto[currentIndex].individual.length > 0) {
							selectedMainTab.setSelectedKey("taskownerindividual");
							var individualListItems = oConstantsModel.getData().allUsers;
							var individual = teamDetailDto[currentIndex].individual;
							for (var i = 0; i < individual.length; i++) {
								for (var j = 0; j < individualListItems.length; j++) {
									if (individual[i] === individualListItems[j].userId) {
										individualList._aSelectedPaths.push("/allUsers/" + j);
									}
								}
							}
						}
					}
				} else {
					selectedMainTab.setSelectedKey("taskownerruleapprover");
				}
			}

			//getting all the attributed with data type as dropdown and mandatory as true for select from context list
			oDefaultDataModel.setProperty("/ActiveTaskRules", oEvent.getSource().getBindingContext("oDefaultDataModel").getObject());
			var processCustomData = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
			var customData = [];
			var obj;

			if (!processCustomData) {
				processCustomData = [];
			}
			for (var i = 0; i < processCustomData.length; i++) {
				if (processCustomData[i].label) {
					if (processCustomData[i].dataType === "DROPDOWN" && processCustomData[i].isRunTime === true && processCustomData[i].isMandatory ===
						true) {
						obj = jQuery.extend(true, {}, processCustomData[i]);
						obj.copy = true;
						obj.attributePath = "${" + obj.key + "}";
						customData.push(obj);
					}
				}
			}

			var teamDetailDto;
			if (this.oAppModel.getProperty("/currentViewPage") === "workFlow" || this.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			} else {
				teamDetailDto = oDefaultDataModel.getProperty("/advancedWfData/teamDetailDto");
			}

			for (var j = 0; j < teamDetailDto.length; j++) {
				var taskCustomData = teamDetailDto[j].customAttributes;
				if (!taskCustomData) {
					taskCustomData = [];
				}
				for (var z = 0; z < taskCustomData.length; z++) {
					if (!taskCustomData[z].copy) {
						if (taskCustomData[z].label) {
							if (taskCustomData[z].dataType === "DROPDOWN" && taskCustomData[z].isRunTime === true && taskCustomData[z].isMandatory ===
								true) {
								obj = jQuery.extend(true, {}, taskCustomData[z]);
								obj.copy = true;
								obj.attributePath = "${" + obj.key + "}";
								obj.taskName = teamDetailDto[j].eventName;
								obj.key = Math.random().toString(20).substr(2, 24);
								customData.push(obj);
							}
						}
					}
				}
			}
			oDefaultDataModel.setProperty("/runTimeContextData", customData);
			if (teamDetailDto[currentIndex].runTimeUser === 1) {
				selectedMainTab.setSelectedKey("taskownercontext");
				var contextListItems = oDefaultDataModel.getData().runTimeContextData;
				var customKeyList = teamDetailDto[currentIndex].customKey;
				for (var j = 0; j < contextListItems.length; j++) {
					if (customKeyList === contextListItems[j].key) {
						contextList._aSelectedPaths.push("/runTimeContextData/" + j);
					}
				}
			}
			oDefaultDataModel.refresh(true);
			oConstantsModel.refresh(true);
		},

		//approver rule based function add rows
		addRuleApproverFn: function () {
			var obj = {
				"attributeName": null,
				"condition": null,
				"logic": null,
				"value": null,
				"custom_key": null,
				"approver": null,
				"ruleId": Math.random().toString(20).substr(2, 24)
			};
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var rules = oDefaultDataModel.getProperty("/ActiveTaskRules/ownerSelectionRules");
			if (!rules) {
				rules = [];
			}
			rules.push(obj);
			oDefaultDataModel.setProperty("/ActiveTaskRules/ownerSelectionRules", rules);
			oDefaultDataModel.refresh(true);
		},

		//delete rows in rule based approver
		deleteRuleApproverFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var index = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath().split("/")[3];
			var rules = oDefaultDataModel.getProperty("/ActiveTaskRules/ownerSelectionRules");
			rules.splice(index, 1);
			oDefaultDataModel.refresh(true);
		},

		//if the task nature is rule based, rule fragment is displayed
		openSetRuleTaskFn: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var destinationDropdown = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().sourceDropdown;
			var rule = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().rules;
			oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().individual = [];
			oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().group = [];
			taskManagement.fetchRuleTaskAttributeTM(that, oDefaultDataModel);

			var ruleDto;
			if (!rule) {
				ruleDto = {
					"destinationDropDown": destinationDropdown,
					"ruleDto": [{
						"destination": "",
						"condition": "",
						"attribute": "",
						"logic": "",
						"value": "",
						"attributeName": "",
						"ruleId": Math.random().toString(20).substr(2, 24)
					}]
				};
			} else {
				ruleDto = {
					"destinationDropDown": destinationDropdown,
					"ruleDto": []
				};

				for (var i = 0; i < rule.length; i++) {
					var customData = oDefaultDataModel.getProperty("/ruleBasedCustomAttributes");
					for (var j = 0; j < customData.length; j++) {
						if (customData[j].key === rule[i].custom_key) {
							var attributeName = customData[j].label;
						}
					}
					var obj = {
						"destination": rule[i].destination,
						"condition": "",
						"custom_key": rule[i].custom_key,
						"ruleId": rule[i].ruleId,
						"logic": rule[i].logic,
						"value": rule[i].value,
						"attributeName": attributeName
					};
					ruleDto.ruleDto.push(obj);
				}
			}
			oDefaultDataModel.setProperty("/setRulesContentDto", ruleDto);
			oDefaultDataModel.refresh(true);
			if (!this._oAddTaskRuleFragment) {
				this._oAddTaskRuleFragment = this._createFragment("oneapp.incture.workbox.fragment.AddTaskRuleAC", this);
				this.getView().addDependent(this._oAddTaskRuleFragment);
			}
			this._oAddTaskRuleFragment.open();
		},

		//changing the date format (rule based task)
		changeDateFormatFn: function (oEvent) {
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			var value = "'" + oEvent.getParameter("value") + "'";
			object.value = value;
			this.getModel("oDefaultDataModel").refresh(true);
		},

		//setting the property attribute name
		setAttributeNameRuleFn: function (oEvent) {
			var obj = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			obj.attributeName = oEvent.getSource().getSelectedItem().getText();
			obj.dataType = oEvent.getSource().getSelectedItem().getBindingContext("oDefaultDataModel").getObject().dataType;
			this.getModel("oDefaultDataModel").refresh(true);
		},

		setAttributeNameRuleOwnerFn: function (oEvent) {
			var obj = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			obj.attributeName = oEvent.getSource().getSelectedItem().getText();
			this.getModel("oDefaultDataModel").refresh(true);
		},

		//add rule to the selected task function
		addRuleToTaskFn: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.addRuleToTaskFnTM(that, oDefaultDataModel);
			this.onCloseAddRuleFragment();
		},

		//adding row of rule dto to task
		addRuleRowsFn: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.addRuleRowsFnTM(that, oDefaultDataModel);
		},

		//deletion of rows in rule Dto
		deleteRuleRowsFn: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.deleteRuleRowsFnTM(oEvent, that, oDefaultDataModel);
		},

		//closing of add task rule fragment
		onCloseAddRuleFragment: function () {
			this._oAddTaskRuleFragment.close();
		},

		//closing of task template popover
		onCloseTaskTemplateFragment: function () {
			this._oTaskTypePopover.close();
		},

		//closing of task template popover
		onCloseTaskOnwerOrderByFragment: function () {
			this._oTaskOwnerOrderByPopover.close();
		},

		//adding the task owners to the task template
		addTaskOwnerfn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var taskData;

			if (this.oAppModel.getProperty("/currentViewPage") === "workFlow" || this.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				var templateId = this.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").getSelectedKey();
				var teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
				for (var j = 0; j < teamDetailDto.length; j++) {
					if (templateId === teamDetailDto[j].templateId) {
						taskData = teamDetailDto[j];
						break;
					}
				}
			} else {
				taskData = oDefaultDataModel.getProperty("/advancedWfActiveTask");
			}

			var groupList = sap.ui.getCore().byId("WB_GROUP_LIST_TASK_OWNER");
			var individualList = sap.ui.getCore().byId("WB_INDIVIDUAL_LIST_TASK_OWNER");
			var contextList = sap.ui.getCore().byId("WB_CONTEXT_LIST_TASK_OWNER");
			var selectContext = contextList.getSelectedItems();

			if (selectContext.length) {
				var contextData = contextList.getSelectedItems();
				if (contextData.length) {
					for (j = 0; j < contextData.length; j++) {
						var obj = contextData[j].getBindingContext("oDefaultDataModel").getObject();
						obj.key = Math.random().toString(20).substr(2, 24);
						obj.isRunTime = true;
						obj.origin = "Task";
						if (oDefaultDataModel.getProperty("/setEnabled") === false) {
							obj.isEdited = 2;
							if (taskData.isEdited !== 2) {
								taskData.isEdited = 1;
							}
						}
						taskData.customAttributes.push(obj);
						taskData.customKey = obj.attributePath.split("${")[1].split("}")[0];
						taskData.runTimeUser = 1;
						taskData.individual = [];
						taskData.group = [];
					}
				}
			} else {
				var groupData = [];
				var selectedGroupItems = groupList.getSelectedItems();
				if (selectedGroupItems.length) {
					for (var i = 0; i < selectedGroupItems.length; i++) {
						groupData.push(selectedGroupItems[i].getBindingContext("oDefaultDataModel").getObject().groupId);
					}
				}
				var individualData = [];
				var selectedindividualItems = individualList.getSelectedItems();
				if (selectedindividualItems.length) {
					for (i = 0; i < selectedindividualItems.length; i++) {
						individualData.push(selectedindividualItems[i].getBindingContext("oConstantsModel").getObject().userId);
					}
				}
			}
			taskData.group = groupData;
			taskData.individual = individualData;
			taskData.ownerSequenceType = {
				"ownerSequType": oDefaultDataModel.getData().ownerSequType,
				"attrTypeId": "",
				"attrTypeName": "",
				"orderBy": oDefaultDataModel.getData().orderBy
			};
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (taskData.isEdited !== 2) {
					taskData.isEdited = 4;
				}
			}
			if (!selectContext.length) {
				taskData.runTimeUser = 0;
				taskData.customKey = null;
				for (var i = 0; i < taskData.customAttributes.length; i++) {
					if (taskData.customAttributes[i].isRunTime) {
						taskData.customAttributes.splice(i, 1);
					}
				}
			}
			var rules = oDefaultDataModel.getProperty("/ActiveTaskRules/ownerSelectionRules");
			if (!rules) {
				rules = [];
			}
			if (rules.length) {
				taskData.group = [];
				taskData.individual = [];
				for (var i = 0; i < rules.length; i++) {
					rules[i].condition = rules[i].logic + rules[i].value;
				}
				taskData.ownerSelectionRules = rules;
			}

			groupList.removeSelections();
			individualList.removeSelections();
			contextList.removeSelections();
			this._oTaskTypePopover.close();
			oDefaultDataModel.refresh(true);
		},

		//checking the value of label in custom attributes
		checkCustomLabelValue: function (oEvent, inputValue, key) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.checkCustomLabelValueTM(oEvent, that, inputValue, key, oDefaultDataModel);
		},

		//checking the event name in task template
		checkTaskNameLabelValue: function (inputValue, key) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.checkTaskNameLabelValueTM(that, inputValue, key, oDefaultDataModel);
		},

		//on selecting the creation type in process detail
		onSelectInstance: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.onSelectInstanceTM(that, oEvent, oDefaultDataModel);
		},

		//read the excel file and setting the custom attribute data and process name
		uploadExcelWorkFlow: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			taskManagement.uploadExcelWorkFlowTM(that, oEvent, oDefaultDataModel);
		},

		//setting the data according to source and destination and loading the flow chart
		loadWorkFlowFlowChartFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			var data = [];

			for (var i = 0; i < teamDetailDto.length; i++) {
				if (!teamDetailDto[i].sourceId[0]) {
					data.push(teamDetailDto[i]);
					break;
				}
			}
			var destinationId = data[0].targetId[0];
			for (i = 0; i < teamDetailDto.length; i++) {
				if (teamDetailDto[i].sourceId[0]) {
					if (destinationId === teamDetailDto[i].templateId) {
						data.push(teamDetailDto[i]);
					}
					destinationId = teamDetailDto[i].targetId[0];
				}
			}
			oDefaultDataModel.setProperty("/previewTaskDto", data);
			oDefaultDataModel.refresh(true);
		},

		//on clicking of buttons in flowchart the corresponding task template is displayed
		showTaskDetailTemplateFn: function (oEvent) {
			var templateId = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().templateId;
			this.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").setSelectedKey(templateId);
		},

		//sending the index of the task detail when the user clicks on preview
		workFlowPreviewFn: function () {
			var index = 0;
			this.workFlowPreviewSetDataFn(index);
			this.setPreviewProperties();
		},

		setPreviewProperties: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var taskDetails = [];
			var teamDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			for (var i = 0; i < teamDto.length; i++) {
				taskDetails.push(teamDto[i]);
			}
			oDefaultDataModel.setProperty("/previewTaskDto", taskDetails);
			var lines = [];
			var uniqueLines = [];
			taskDetails.push({
				"eventName": "Start",
				"templateId": "startTask"
			});
			taskDetails.push({
				"eventName": "End",
				"templateId": "endTask"
			});
			for (var i = 0; i < taskDetails.length; i++) {
				var templateId = taskDetails[i].templateId;
				if (templateId !== "startTask" && templateId !== "endTask") {
					var source = taskDetails[i].sourceId;
					if (!source) {
						source = [];
					}
					if (source.length === 1 && !source[0]) {
						source.splice(0, 1);
					}
					if (!source.length) {
						source.push("startTask");
					}
					var target = taskDetails[i].targetId;
					if (!target) {
						target = [];
					}
					if (target.length === 1 && !target[0]) {
						target.splice(0, 1);
					}
					if (!target.length) {
						target.push("endTask");
					}
					for (var j = 0; j < source.length; j++) {
						if (source[j]) {
							var sObj = {
								"from": source[j],
								"to": templateId
							};
						}
					}
					for (var z = 0; z < target.length; z++) {
						if (target[z]) {
							var tObj = {
								"from": templateId,
								"to": target[z]
							};
						}
					}
					if (sObj) {
						lines.push(sObj);
					}
					if (tObj) {
						lines.push(tObj);
					}
				}
			}
			var temp;
			for (var a = 0; a < lines.length; a++) {
				var id = [lines[a].from, lines[a].to].join("|");
				var count = 0;
				for (var i = 0; i < uniqueLines.length; i++) {
					temp = [uniqueLines[i].from, uniqueLines[i].to].join("|");
					if (temp === id) {
						count++;
					}
				}
				if (!count) {
					uniqueLines.push(lines[a]);
				}
			}
			oDefaultDataModel.setProperty("/mappingLinesPreview", uniqueLines);
			oDefaultDataModel.refresh(true);
		},

		//on click of buttons in preview fragment fetching the correspoding task details
		showTaskDetailsPreviewFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var templateId = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().templateId;
			if (templateId !== "startTask" && templateId !== "endTask") {
				var taskDto = oDefaultDataModel.getProperty("/previewTaskDto");
				for (var i = 0; i < taskDto.length; i++) {
					if (templateId === taskDto[i].templateId) {
						this.workFlowPreviewSetDataFn(i);
						break;
					}
				}
			}
		},

		//getting the data of workflow and preview
		workFlowPreviewSetDataFn: function (index) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/previewAttachmentDto", []);
			oDefaultDataModel.setProperty("/previewGridDto", []);
			var headerDetails = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto/" + index + "/");
			oDefaultDataModel.setProperty("/previewHeaderDto", headerDetails);
			var teamDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			var url;
			if (headerDetails.url) {
				url = headerDetails.url;
			} else {
				url = oDefaultDataModel.getProperty("/createWorkFlowData/processDetail/url");
			}

			if (url) {
				$("#ID_FRAME_DETAIL").attr("src", url);
				$("#ID_FRAME_DETAIL").height("100%");
			} else {
				var gridDetails = [];
				var attachmentDetails = [];
				var customDto = headerDetails.customAttributes;
				if (!customDto) {
					customDto = [];
				}
				var i18n = this.getView().getModel("i18n").getResourceBundle();
				for (var j = 0; j < customDto.length; j++) {
					if (customDto[j].dataType === "ATTACHMENT") {
						attachmentDetails.push(customDto[j]);
					} else {
						gridDetails.push(customDto[j]);
					}
				}
				oDefaultDataModel.setProperty("/previewAttachmentDto", attachmentDetails);
				oDefaultDataModel.setProperty("/previewGridDto", gridDetails);
			}
			if (teamDto.length) {
				oDefaultDataModel.setProperty("/openPreviewWorkFlow", true);
				this.oAppModel.setProperty("/openPreviewWorkFlow", true);
			} else {
				this._showToastMessage(i18n.getText("ATLEAST_ONE_TASK_REQ_FOR_WORKFLOW"));
			}
			oDefaultDataModel.refresh(true);
		},

		//close preview work flow
		closePreviewPage: function () {
			this.getModel("oDefaultDataModel").setProperty("/openPreviewWorkFlow", false);
			this.oAppModel.setProperty("/openPreviewWorkFlow", false);
		},

		/*****TaskManagement (Create Workflow)- end*****/

		/*****TaskManagement (Manage Workflow)- start*****/

		//getting the details of process and displaying the values
		onProcessListItemSelect: function (oEvent) {
			var that = this;
			that.getView().byId("WB_EXISTING_WF_ID").setSelectedKey("customAttributeTemplate");
			var url = "/WorkboxJavaService/customProcess/getAttributes/";
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oAppModel = this.oAppModel;
			taskManagement.onProcessListItemSelectTM(that, oEvent, url, oDefaultDataModel, oAppModel);
		},

		//checking the process lsit function
		checkProcessListFn: function (oEvent) {
			var oAppModel = this.oAppModel;
			var paths = oEvent.getSource().getSelectedContextPaths();
			if (paths.length) {
				oAppModel.setProperty("/isChanged", true);
				oAppModel.setProperty("/enableMWorkflowButton", true);
			} else {
				oAppModel.setProperty("/isChanged", false);
				oAppModel.setProperty("/enableMWorkflowButton", false);
			}
		},

		//deletion of process and opening of confirmation message popup
		deleteProcessFn: function (oEvent) {
			var that = this;
			var processArray = [];
			var processName;
			if (oEvent) {
				processName = oEvent.getSource().getBindingContext("oConstantsModel").getObject().processDisplayName;
				processArray.push(oEvent.getSource().getBindingContext("oConstantsModel").getObject().processName);
			}
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var warning = i18n.getText("DELETE_PROCESS_TEXT");
			var alertmessage = i18n.getText("DELETE_CAUTION_TEXT");
			var message = warning;
			if (processName) {
				message = message + " - " + processName;
			}
			this._createConfirmationMessage(message, alertmessage, "Warning", "Yes", "No", true,
				function (discardChange) {
					var url = "/WorkboxJavaService/customProcess/deleteProcess";
					taskManagement.deleteProcessFnTM(that, url, processArray);
				},
				function (clearTabPress) {

				});
		},

		//opening the popover for process description
		onAddDescFn: function (oEvent) {
			var oSource = oEvent.getSource();
			var oParent = oSource.getParent();
			if (!this._descPopover) {
				this._descPopover = this._createFragment("oneapp.incture.workbox.fragment.AddDescriptionAC", this);
				this.getView().addDependent(this._descPopover);
			}
			this._descPopover.openBy(oParent);
		},

		//triggering the fromatter to get proper source and destination dropdown values
		onTaskTemplateTabChange: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var items = oDefaultDataModel.getProperty("/TaskTemplateDropdownDetails");
			var templateId = oEvent.getSource().getSelectedKey();
			var dropdownData = jQuery.extend(true, [], items);
			for (var i = 0; i < dropdownData.length; i++) {
				if (dropdownData[i].key === templateId || dropdownData[i].isEdited === 3) {
					dropdownData.splice(i, 1);
				}
				if (!dropdownData[i].text) {
					dropdownData.splice(i, 1);
				}
			}
			var teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			for (var j = 0; j < teamDetailDto.length; j++) {
				if (templateId === teamDetailDto[j].templateId) {
					teamDetailDto[j].sourceDropdown = dropdownData;
					if (!teamDetailDto[j].customAttributes) {
						teamDetailDto[j].customAttributes = [];
					}
					if (teamDetailDto[j].customAttributes.length) {
						if (teamDetailDto[j].customAttributes[teamDetailDto[j].customAttributes.length - 1].label) {
							oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", true);
						} else {
							oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", false);
						}
					} else {
						oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", true);
					}
				}
			}
			oDefaultDataModel.refresh(true);
		},

		searchManageWF: function (oEvent) {
			var aFilters = [];
			var sQuery = "";
			if (oEvent) {
				sQuery = oEvent.getSource().getValue();
			}
			var filterArry = [];
			var filterData = ["processDisplayName", "processType", "origin"];
			if (sQuery && sQuery.length > 0) {
				for (var i = 0; i < filterData.length; i++) {
					var bindingName = filterData[i];
					filterArry.push(new sap.ui.model.Filter(bindingName, sap.ui.model.FilterOperator.Contains, sQuery));
				}
				var filter = new sap.ui.model.Filter(filterArry, false);
				aFilters.push(filter);
			}
			var reqList = this.getView().byId("ID_MANAGE_PROCESS_LIST");
			var binding = reqList.getBinding("items");
			binding.filter(aFilters, "Application");
		},

		/*****TaskManagement (Manage Workflow)- end*****/

		/*****Workbox (Manage Individual Budget) - start*******/

		//fetch the budget list user service and setting it to property
		fetchBudgetListFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/idpMapping/getUsersBudget";
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/individualBudgetList", oData.dto);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//post call for updating the budget list
		updateBudgetListFn: function (oEvent) {
			var response = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			var url = "/WorkboxJavaService/idpMapping/updateUsersBudget";
			this.doAjax(url, "POST", response, function (oData) {
				this._showToastMessage(oData.message);
				this.fetchBudgetListFn();
			}.bind(this), function (oError) {}.bind(this));
		},

		//filter the budget list with all the fields
		searchBudgetListFn: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter([
					new Filter("userFirstName", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("userLastName", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("userId", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("userEmail", sap.ui.model.FilterOperator.Contains, sQuery)
				], false);
				aFilters.push(filter);
			}
			var oBinding = this.getView().byId("WB_INDIVIDUAL_BUDGET_LIST").getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},

		/*****Workbox (Manage Individual Budget) - end*******/

		/*****TaskManagement (Manage Groups)- start*****/

		//service call to get the custom groups
		getCustomGroupsFn: function () {
			var url = "/WorkboxJavaService/group/getAllGroup/CUSTOM";
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "GET", null, function (oData) {
				if (oData.dto.length > 100) {
					oDefaultDataModel.setSizeLimit(oData.dto.length);
				}
				oDefaultDataModel.setProperty("/allGroups", oData);
				oDefaultDataModel.setProperty("/selectedGroupName", oData.dto[0].groupName);
				oDefaultDataModel.setProperty("/selectedGroupID", oData.dto[0].groupId);
				this.getCustomGroupMembersFn();
				oDefaultDataModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		//service call to get the custom group members
		getCustomGroupMembersFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var groupId = oDefaultDataModel.getProperty("/selectedGroupID");
			var customGroupDto = oDefaultDataModel.getProperty("/allGroups/dto");
			if (oDefaultDataModel.getProperty("/allGroups/dto")) {
				for (var i = 0; i < customGroupDto.length; i++) {
					if (groupId === customGroupDto[i].groupId) {
						oDefaultDataModel.setProperty("/selectedGroupName", customGroupDto[i].groupName);
						break;
					}
				}
			}
			oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			var url = "/WorkboxJavaService/group/getGroupDetail/CUSTOM/" + groupId;
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/groupMembers", oData);
				oDefaultDataModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oError) {}.bind(this));
			oDefaultDataModel.refresh(true);
		},

		//service call to get the idp group members
		getIDPGroupMembersFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var groupId = oDefaultDataModel.getProperty("/selectedidpGroupID");
			oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			var url = "/WorkboxJavaService/group/getGroupDetail/IDP/" + groupId;
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/groupMembers", oData);
				oDefaultDataModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oError) {}.bind(this));
			oDefaultDataModel.refresh(true);
		},

		//search custom group names
		searchCustomGroupFn: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("groupName", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oBinding = this.getView().byId("WB_CUSTOM_GROUPS_LIST").getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		//search idp group names
		searchIDPGroupFn: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("groupName", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oBinding = this.getView().byId("WB_IDP_GROUPS_LIST").getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		//search Individual group names
		searchIndividualNameFn: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("userFirstName", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oBinding = sap.ui.getCore().byId("WB_RESOURCES_LIST").getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		//remove selected resource in list from group
		removeResourceFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/group/updateGroup";
			var paths = this.getView().byId("WB_GROUP_MEMBERS_LIST").getSelectedContextPaths();
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			if (paths.length) {
				for (var i = 0; i < paths.length; i++) {
					oDefaultDataModel.setProperty(paths[i] + "/isEdited", 3);
				}
				var response = {
					"groupId": oDefaultDataModel.getProperty("/selectedGroupID"),
					"groupName": oDefaultDataModel.getProperty("/selectedGroupName"),
					"userDetail": oDefaultDataModel.getProperty("/groupMembers/userDetail")
				};
				this.doAjax(url, "POST", response, function (oData) {
					this._showToastMessage(oData.message);
					this.getCustomGroupMembersFn();
				}.bind(this), function (oError) {}.bind(this));
				this.getView().byId("WB_GROUP_MEMBERS_LIST").removeSelections();
			} else {
				this._showToastMessage(i18n.getText("SELECT_RESOURCES_TO_REMOVE"));
			}
			oDefaultDataModel.refresh(true);
		},

		//removing individual resource from group
		removeIndividualResourceFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/group/updateGroup";
			var obj = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			obj.isEdited = 3;
			var response = {
				"groupId": oDefaultDataModel.getProperty("/selectedGroupID"),
				"groupName": oDefaultDataModel.getProperty("/selectedGroupName"),
				"userDetail": oDefaultDataModel.getProperty("/groupMembers/userDetail")
			};
			this.doAjax(url, "POST", response, function (oData) {
				this._showToastMessage(oData.message);
				this.getCustomGroupMembersFn();
			}.bind(this), function (oError) {}.bind(this));
			oDefaultDataModel.refresh(true);
		},

		//opening of add resource fragment
		openAddResourceFragmentFn: function () {
			var oConstantsModel = this.getModel("oConstantsModel");
			var members = oConstantsModel.getProperty("/allUsers");
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			if (oDefaultDataModel.getProperty("/createGroupVisibility")) {
				if (oDefaultDataModel.getProperty("/cGroupNameValue")) {
					if (!this._oAddResourceFragment) {
						this._oAddResourceFragment = this._createFragment("oneapp.incture.workbox.fragment.AddResourceGroup", this);
						this.getView().addDependent(this._oAddResourceFragment);
					}
					this._oAddResourceFragment.open();
				} else {
					this._showToastMessage(i18n.getText("GRP_NAME_TO_SELECT_RESOURCE"));
				}
				oConstantsModel.setProperty("/showMembers", members);
			} else {
				var membersList = jQuery.extend(true, [], members);
				var eMembers = oDefaultDataModel.getProperty("/groupMembers/userDetail");
				for (var i = 0; i < eMembers.length; i++) {
					for (var j = 0; j < membersList.length; j++) {
						if (eMembers[i].userId === membersList[j].userId) {
							membersList.splice(j, 1);
						}
					}
				}
				oConstantsModel.setProperty("/showMembers", membersList);
				if (!this._oAddResourceFragment) {
					this._oAddResourceFragment = this._createFragment("oneapp.incture.workbox.fragment.AddResourceGroup", this);
					this.getView().addDependent(this._oAddResourceFragment);
				}
				this._oAddResourceFragment.open();
			}
			oConstantsModel.refresh(true);
		},

		//adding resource to the existing group
		addResourceFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/group/updateGroup";
			var paths = sap.ui.getCore().byId("WB_RESOURCES_LIST").getSelectedContextPaths();
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			if (paths.length) {
				var eMembers = oDefaultDataModel.getProperty("/groupMembers/userDetail");
				for (var i = 0; i < paths.length; i++) {
					var obj = this.getModel("oConstantsModel").getProperty(paths[i]);
					var nMember = {};
					nMember.userId = obj.userId;
					nMember.userName = obj.userFirstName + " " + obj.userLastName;
					nMember.isEdited = 2;
					eMembers.push(nMember);
				}
				var response = {
					"groupId": oDefaultDataModel.getProperty("/selectedGroupID"),
					"groupName": oDefaultDataModel.getProperty("/selectedGroupName"),
					"userDetail": eMembers
				};
				this.doAjax(url, "POST", response, function (oData) {
					this._showToastMessage(oData.message);
					this.getCustomGroupMembersFn();
					this.onCloseResourceFragment();
				}.bind(this), function (oError) {}.bind(this));
				sap.ui.getCore().byId("WB_RESOURCES_LIST").removeSelections();
			} else {
				this._showToastMessage(i18n.getText("SELECT_RESOURCES_TO_ADD_IN_GRP"));
			}
			oDefaultDataModel.refresh(true);
		},

		//closing of add resource fragment		
		onCloseResourceFragment: function () {
			sap.ui.getCore().byId("WB_RESOURCES_LIST").removeSelections();
			this._oAddResourceFragment.close();
		},

		//creating a new group submit function
		submitGroupFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/group/createGroup";
			var groupName = oDefaultDataModel.getProperty("/cGroupNameValue");
			var ownerId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var paths = sap.ui.getCore().byId("WB_RESOURCES_LIST").getSelectedContextPaths();
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			oDefaultDataModel.setProperty("/scrollHeightCustomGroup", ((sap.ui.Device.resize.height - 271) + "px"));
			if (paths.length) {
				var memberList = [];
				for (var i = 0; i < paths.length; i++) {
					var obj = this.getModel("oConstantsModel").getProperty(paths[i]);
					var nMember = {};
					nMember.userId = obj.userId;
					nMember.userName = obj.userFirstName + " " + obj.userLastName;
					nMember.isEdited = 0;
					memberList.push(nMember);
				}
				var response = {
					"groupName": groupName,
					"userDetail": memberList
				};

				this.doAjax(url, "POST", response, function (oData) {
					oDefaultDataModel.setProperty("/cGroupNameValue", "");
					oDefaultDataModel.setProperty("/createGroupVisibility", false);
					this._showToastMessage(oData.message);
					this.onCloseResourceFragment();
					this.getCustomGroupsFn();
					this.getCustomGroupMembersFn();
				}.bind(this), function (oError) {}.bind(this));
				sap.ui.getCore().byId("WB_RESOURCES_LIST").removeSelections();
			} else {
				this._showToastMessage(i18n.getText("SELECT_RESOURCE_TO_CREATE_GRP"));
			}
			//taskManagement.submitGroupFnTM(that, url, oEvent, oDefaultDataModel);
		},

		//on click on the create the input field and discard button visibility
		createGroupFn: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty("/scrollHeightCustomGroup", ((sap.ui.Device.resize.height - 303) + "px"));
			oDefaultDataModel.setProperty("/createGroupVisibility", true);
		},

		//discard all the create group changes 
		resetCreateGroupFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			if (sap.ui.getCore().byId("WB_RESOURCES_LIST")) {
				sap.ui.getCore().byId("WB_RESOURCES_LIST").removeSelections();
			}
			oDefaultDataModel.setProperty("/cGroupNameValue", "");
			oDefaultDataModel.setProperty("/createGroupVisibility", false);
			oDefaultDataModel.setProperty("/scrollHeightCustomGroup", ((sap.ui.Device.resize.height - 271) + "px"));
			oDefaultDataModel.refresh(true);
		},

		//on selection of tab
		onManageGroupViewSelect: function (oEvent) {
			var oView = oEvent.getSource().getSelectedKey();
			if (oView === "idpGropus") {
				this.getIDPGroupMembersFn();
			} else {
				this.getCustomGroupsFn();
			}
		},

		//checkbox functionality
		// onListItemSelect: function (oEvent) {
		// 	var oDefaultDataModel = this.getModel("oDefaultDataModel");
		// 	var oList = oEvent.getSource();
		// 	var itemLength = oList.getSelectedItems().length;
		// 	if (itemLength > 0) {
		// 		oList.removeStyleClass("wbInboxCardListDisplay");
		// 		oDefaultDataModel.setProperty("/multiSelect", true);
		// 		oEvent.getSource().getItems().forEach(function (r) {
		// 			r.$().find(".sapMCb").children().show();
		// 		});
		// 	} else {
		// 		oList.addStyleClass("wbInboxCardListDisplay");
		// 		oDefaultDataModel.setProperty("/multiSelect", false);
		// 		oEvent.getSource().getItems().forEach(function (r) {
		// 			r.$().find(".sapMCb").children().hide();
		// 		});
		// 	}
		// },

		/*****TaskManagement (Manage Groups)- end*****/

		/*****TaskManagement - end*****/

		/*****Development by Vaishnavi - end*****/

		/*****Development by Akshatha*****/

		/*****Task UI Generator - end*****/

		getUIGenerationPageAdmin: function () {
			var that = this;
			var otaskCreationModel = this.getView().getModel("otaskCreationModel");
			var catalogueName = otaskCreationModel.getProperty("/uiGeneration/catalogueName");
			var processName = otaskCreationModel.getProperty("/uiGeneration/processName");
			var oUIGenerationPageModelAdmin = new sap.ui.model.json.JSONModel();
			that.getView().setModel(oUIGenerationPageModelAdmin, "oUIGenerationPageModelAdmin");
			oUIGenerationPageModelAdmin.loadData("/WorkboxJavaService/dynamicPage/getDynamicDetails?catalogueName=" + catalogueName +
				"&processName=" +
				processName, null, true);
			oUIGenerationPageModelAdmin.attachRequestCompleted(function (oEvent) {
				var uIGenerationData = that.getView().getModel("oUIGenerationPageModelAdmin").getData();
				if (uIGenerationData) {
					if (!(uIGenerationData.groupList instanceof Array)) {
						uIGenerationData.groupList = [uIGenerationData.groupList];
					}
					that.getView().getModel("oUIGenerationPageModelAdmin").refresh();
				}
				// that.getAllTemplates();
			});
			oUIGenerationPageModelAdmin.attachRequestFailed(function (oEvent) {});
		},

		onFilter: function () {
			var otaskCreationModel = this.getView().getModel("otaskCreationModel");
			var that = this;
			var data = [{
				"Name": "Incture ORR",
				"Value": "ORR"

			}, {
				"Name": "Incture ECITY",
				"Value": "ECITY"
			}];
			var processName = otaskCreationModel.getProperty("/uiGeneration/processName");
			if (processName === "purchaseorderapproval") {
				data = [{
					"Name": "Incture ORR",
					"Value": "ORR"
				}, {
					"Name": "Incture ECITY",
					"Value": "ECITY"
				}, {
					"Name": "Trial",
					"Value": "Trial"
				}];

			} else if (processName === "purchaserequisitionprocess") {
				data = [{
					"Name": "Plant 1",
					"Value": "P1"

				}, {
					"Name": "Plant 2",
					"Value": "P2"
				}];
			} else if (processName === "gl_posting_process") {
				data = [{
					"Name": "WR Grace",
					"Value": "WR_Grace"
				}];
			}
			var filterModel = new sap.ui.model.json.JSONModel(data);
			that.getView().setModel(filterModel, "filterModel");
			var filterModelAdmin = new sap.ui.model.json.JSONModel(data);
			that.getView().setModel(filterModelAdmin, "filterModelAdmin");
		},

		updateUIGenerator: function () {
			var otaskCreationModel = this.getView().getModel("otaskCreationModel");
			var oUpdateNewUI = new sap.ui.model.json.JSONModel();
			var oUIGenerationPageModelAdmin = this.getView().getModel("oUIGenerationPageModelAdmin");
			var oPayload = oUIGenerationPageModelAdmin.getProperty("/groupList");
			var catalogueName = otaskCreationModel.getProperty("/uiGeneration/catalogueName");
			var processName = otaskCreationModel.getProperty("/uiGeneration/processName");
			for (var i = 0; i < oPayload.length; i++) {
				oPayload[i].catalogueName = catalogueName;
				oPayload[i].processName = processName;
			}
			for (i = 0; i < oPayload.length; i++) {
				var length = oPayload[i].poFieldDetails.length;
				for (var j = 0; j < length; j++) {
					oPayload[i].poFieldDetails[j].processName = processName;
				}
			}
			var oHeader = {
				"Content-Type": "application/json;charset=utf-8"
			};
			oUpdateNewUI.loadData("/WorkboxJavaService/dynamicPage/saveCustomization", JSON.stringify(oPayload), true,
				"POST",
				false,
				false, oHeader);
			oUpdateNewUI.attachRequestCompleted(function (oEvent) {
				this.getUIGenerationPageAdmin();
			}.bind(this));
			oUpdateNewUI.attachRequestFailed(function (oEvent) {});
		},

		onResetDataUI: function () {
			var otaskCreationModel = this.getView().getModel("otaskCreationModel");
			var resetAdmin = new sap.ui.model.json.JSONModel();
			this.getView().setModel(resetAdmin, "resetAdmin");
			var processName = otaskCreationModel.getProperty("/uiGeneration/processName");
			var catalogueName = otaskCreationModel.getProperty("/uiGeneration/catalogueName");
			resetAdmin.loadData("/WorkboxJavaService/dynamicPage/reset/" + catalogueName + "?processName=" + processName, null, true);
			resetAdmin.attachRequestCompleted(function (oEvent) {});
			resetAdmin.attachRequestFailed(function (oEvent) {});
		},

		/*****Task UI Generator - end*****/

		/*****Task Creation UI Generation - Start*****/

		getUIGenerationPage: function (check) {
			var that = this;
			var otaskCreationModel = this.getView().getModel("otaskCreationModel");
			var oUIGenerationPageModel = new sap.ui.model.json.JSONModel();
			that.getView().setModel(oUIGenerationPageModel, "oUIGenerationPageModel");
			var processName = otaskCreationModel.getProperty("/uiGeneration/processName");
			var catalogueName = otaskCreationModel.getProperty("/uiGeneration/catalogueName");
			var selectModel = new sap.ui.model.json.JSONModel();
			that.getView().setModel(selectModel, "selectModel");
			/*var url = "model/dynamicUI.json";*/
			var url = "/WorkboxJavaService/dynamicPage/getDynamicDetailsForUser?catalogueName=" + catalogueName + "&processName=" +
				processName;
			oUIGenerationPageModel.loadData(url, null, true);
			oUIGenerationPageModel.attachRequestCompleted(function (oEvent) {
				var uIGenerationData = that.getView().getModel("oUIGenerationPageModel").getData();
				if (uIGenerationData) {
					if (!(uIGenerationData.groupList instanceof Array)) {
						uIGenerationData.groupList = [uIGenerationData.groupList];
					}
				}
				oUIGenerationPageModel.refresh();
				var valueStatedep = 2;
				that.generateUI(valueStatedep);
			});
			oUIGenerationPageModel.attachRequestFailed(function (oEvent) {});
		},

		generateUI: function (valueStatedep) {
			var oUIGenerationPageModel = this.getView().getModel("oUIGenerationPageModel");
			var generationData = oUIGenerationPageModel.getProperty("/groupList");
			var oOuterBox = this.getView().byId("idUIGenerationBox");
			var innerBox = this.getView().byId("addHBox");
			oOuterBox.removeAllItems();
			innerBox.removeAllItems();
			for (var i = 0; i < generationData.length; i++) {
				if (generationData.length !== 0) { // if contentDto.length === 0 then will not render lineItem and Attachments
					if (generationData[i].groupType === "GRID") {
						oOuterBox.addItem(new sap.m.Label({
							text: generationData[i].title
						}).addStyleClass("sapMLabel sapUiSmallMarginBegin"));
						var sDefaultSpan;
						if (generationData[i] && generationData[i].length === 1) {
							sDefaultSpan = "L12 M12 S12";
						} else {
							sDefaultSpan = "L3 M6 S12";
						}
						var newContent = new sap.ui.layout.Grid({
							defaultSpan: sDefaultSpan,
							vSpacing: 0
						}).addStyleClass("wbTaskDetailContentClass wbTaskDetailPaddingClass");
						//	wbTaskDetailContentClass wbTaskDetailPaddingClass
						this.createGridElements(newContent, generationData[i].poFieldDetails, "oDynamicGridDto/" + i + "/contentDto",
							"oTaskDetailModel", i);
						oOuterBox.addItem(newContent);
					} else if (generationData[i].groupType === "TABLE") {
						var newTableContent = this.createTableElements(generationData[i].poFieldDetails, i, valueStatedep, generationData[i].lineItemDto);
						oOuterBox.addItem(newTableContent);
					} else if (generationData[i].groupType === "GRID2") {
						oOuterBox.addItem(new sap.m.Label({
							text: generationData[i].title
						}).addStyleClass("sapMLabel sapUiSmallMarginBegin"));
						sDefaultSpan = "L12 M12 S12";
						oOuterBox.addItem(innerBox);
						var grouping1 = generationData[i].poFieldDetails.filter(function (x) {
							return x.subGroupId == "1";
						});
						var grouping2 = generationData[i].poFieldDetails.filter(function (x) {
							return x.subGroupId == "2";
						});
						for (var k = 0; k < 2; k++) {
							var newContent = new sap.ui.layout.Grid({
								defaultSpan: sDefaultSpan,
								vSpacing: 0
							}).addStyleClass("taskDetailBoxStyleClass");
							if (k === 0) {
								var dynamicControlData = grouping1;
							} else {
								dynamicControlData = grouping2;
							}
							this.createGridElements(newContent, dynamicControlData, "oDynamicGridDto/" + i + "/contentDto",
								"oTaskDetailModel", i);
							innerBox.addItem(newContent);
						}
					} else {
						oOuterBox.addItem(new sap.m.Label({
							text: generationData[i].title
						}).addStyleClass("taskDetailHeadingStyleClass"));

						var newContentList = this.createElementList(generationData[i].poFieldDetails, "oDynamicGridDto/" + i + "/contentDto",
							"oTaskDetailModel", i);
						oOuterBox.addItem(newContentList);
					}
				}
			}
		},

		createElementList: function (dynamicControlData, sDynamicDto, sModelName, groupIndex) {
			var oUIGenerationPageModel = this.getView().getModel("oUIGenerationPageModel");
			var generationData = oUIGenerationPageModel.getProperty("/groupList");
			var oList = new sap.m.List();
			oList.bindAggregation("items", "oUIGenerationPageModel>/groupList/" + groupIndex + "/poFieldDetails", function (index,
				context) {
				var newhBoxControl = new sap.m.HBox({
					"renderType": "Bare"
				});
				var sPath = context.getPath();
				var indexPath = sPath.split("/");
				var currentIndex = indexPath[4];
				var dynamicControl = dynamicControlData[currentIndex];
				var newValue = dynamicControl.value.split(":");
				var width = "28%";
				var inputListControl = new sap.m.InputListItem().addStyleClass(
					"flexClass inboxOuterBoxStyle userWorkListGridStyleClass wbUserWorkListGridStyleClass listMargin sapUiSizeCompact");
				for (var listValue = 0; listValue < newValue.length; listValue++) {
					if (listValue === (newValue.length - 1)) {
						width = "100%";
					}
					var textControl = new sap.m.Text({
						text: newValue[listValue],
						width: width
					}).addStyleClass("sapUiSizeCompact");
					newhBoxControl.addItem(textControl);
					inputListControl.addContent(newhBoxControl);
				}
				return inputListControl;
			});
			return oList;
		},

		createGridElements: function (oGrid, dynamicControlData, sDynamicDto, sModelName, groupIndex) {
			if (dynamicControlData[0].subGroupId === undefined) {
				oGrid.setDefaultSpan("L3 M6 S12");
			} else {
				oGrid.setDefaultSpan("L6 M12 S12");
			}
			for (var i = 0; i < dynamicControlData.length; i++) {
				var newControl = new sap.m.VBox({
					justifyContent: "SpaceBetween"
				}).addStyleClass("taskHeaderBox");
				newControl.addItem(new sap.m.Label({
					text: dynamicControlData[i].label,
					required: dynamicControlData[i].isMandatory
				}).addStyleClass("sapMLabel"));
				var dynamicControl = dynamicControlData[i];
				var returnedControl = this.getEachControl(dynamicControlData, (dynamicControl.dataType).toLowerCase(), dynamicControl.key,
					dynamicControl.editability,
					dynamicControl.label, dynamicControl.value, dynamicControl.serviceUrl, dynamicControl.valueState, groupIndex, i);
				newControl.addItem(returnedControl);
				oGrid.addContent(newControl);
			}
		},

		createTableElements: function (dynamicControlData, index, valueStatedep, lineItemDataTable) {
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var tableId = new sap.m.Table({
				fixedLayout: false
			});
			var oUIGenerationPageModel = this.getView().getModel("oUIGenerationPageModel");
			var generationData = oUIGenerationPageModel.getProperty("/groupList");
			var oOuterBox = this.getView().byId("idUIGenerationBox");
			var innerBox = this.getView().byId("addHBoxItem");
			innerBox.removeAllItems();
			tableId.setModel(oUIGenerationPageModel, "oUIGenerationPageModel");
			oOuterBox.addItem(innerBox);
			innerBox.addItem(new sap.m.Label({
					text: generationData[index].title
				}).addStyleClass("sapUiSmallMarginBegin sapUiTinyMarginTop"))
				.addItem(new sap.m.Button({
					text: i18n.getText("ADD_NEW_ITEM"),
					press: function (oEvent) {
						this.addRowCopy(tableId, dynamicControlData, index, valueStatedep, lineItemDataTable);
					}.bind(this)
				}).addStyleClass("wbDefaultButtonClass sapUiSmallMarginEnd sapUiSizeCompact"));
			tableId.bindAggregation("columns", "oUIGenerationPageModel>/groupList/" + index + "/poFieldDetails", function (index,
				context) {
				var contextPath = context.getPath();
				var records = context.getObject();
				var oColumn = new sap.m.Column({
					header: new sap.m.Label({
						wrapping: true,
						text: records.label,
						required: records.isMandatory
					}).addStyleClass("")
				});
				return oColumn;
			});
			tableId.setWidth("auto");
			//wbCustomTableClass
			/*	tableId.addStyleClass("slaTableBorderClass sapUiSizeCompact taskDetailBoxStyleClass");*/
			tableId.addStyleClass("wbCustomTableClass wbmargintaskCreationUiTable");
			this.tableJSON(tableId, dynamicControlData, index, valueStatedep, lineItemDataTable);
			return tableId;
		},

		tableJSON: function (tableId, dynamicControlData, index, valueStatedep, lineItemDataTable) {
			var length = dynamicControlData.length;
			var tableModel = this.getView().getModel("tableModel");
			var poField = [];
			var lineItems = [];
			if (valueStatedep === 2) {
				var tableModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(tableModel, "tableModel");
				tableModel.setProperty("/lineItems");
				for (var k = 0; k < length; k++) {
					var poFieldObject = {
						"label": dynamicControlData[k].label,
						"eccKey": dynamicControlData[k].eccKey,
						"editability": dynamicControlData[k].editability,
						"isMandatory": dynamicControlData[k].isMandatory,
						"dataType": dynamicControlData[k].dataType,
						"processName": dynamicControlData[k].processName,
						"serviceUrl": dynamicControlData[k].serviceUrl,
						"visibility": dynamicControlData[k].visibility,
						"dependency": dynamicControlData[k].dependency,
						"key": dynamicControlData[k].key
					};
					poField.push(poFieldObject);
				}
				lineItems.push(poField);
				tableModel.setProperty("/lineItems", lineItems);
				tableModel.refresh();
			}
			this.addRow(tableId, tableModel, dynamicControlData, index, valueStatedep, lineItemDataTable);
		},

		addRow: function (tableId, tableModel, dynamicControlData, groupIndex, valueStatedep, lineItemDataTable) {
			var that = this;
			var innerLength = dynamicControlData.length;
			var data = tableModel.getProperty("/lineItems");
			tableId.bindAggregation("items", "tableModel>/lineItems", function (index, context) {
				var indexPath = index.split("-");
				var j = parseInt(indexPath[1]);
				var sPath = context.getPath();
				var iPath = sPath.split("/");
				var i = parseInt(iPath[2]);
				var colItems = new sap.m.ColumnListItem();
				tableId.addItem(colItems);
				var rowNumber = tableModel.getProperty("/lineItems").length;
				that.newRow(i, tableId, tableModel, dynamicControlData, groupIndex, innerLength, data, colItems, lineItemDataTable);
				return colItems;
			});
		},

		newRow: function (i, tableId, tableModel, dynamicControlData, groupIndex, innerLength, data, colItems, lineItemDataTable) {
			var that = this;
			for (var j = 0; j < innerLength; j++) {
				this.innerRows(i, tableId, tableModel, dynamicControlData, groupIndex, innerLength, data, colItems, lineItemDataTable, j);
			}
		},

		innerRows: function (i, tableId, tableModel, dynamicControlData, groupIndex, innerLength, data, colItems, lineItemDataTable,
			j) {
			var that = this;
			var rowNumber = tableModel.getProperty("/lineItems").length;
			if (lineItemDataTable !== undefined) {
				if (lineItemDataTable.length > i) {
					var a = data[i][j].key;
					var b = Object.keys(lineItemDataTable[i]);
					var c = Object.values(lineItemDataTable[i]);
					for (var x = 0; x < b.length; x++) {
						if (b[x] === a) {
							if (c[x] !== "") {
								data[i][j].value = c[x];
							}
						}
					}
				}
			}
			var tableModel = this.getView().getModel("tableModel");
			var data = tableModel.getProperty("/lineItems");
			if (data[i][j].dataType === "SELECT") {
				var item = new sap.m.Select({
					selectedKey: data[i][j].value,
					enabled: data[i][j].editability,
					name: j + "-" + data[i][j].label,
					forceSelection: false,
					valueState: data[i][j].valueState,
					change: function (oEvent) {
						that.onSelectChangeSelectTable(oEvent, groupIndex, i);
					}
				}).addStyleClass("widthSelect wbTableDropdownStyle sapUiSizeCompact");
				that.loadDependencykey(data[i][j].key, data[i][j].serviceUrl, dynamicControlData, j, groupIndex, i, tableModel);
				item.attachBrowserEvent("click", function () {
					var checkValue = 1;
					that.loadDependencykey(data[i][j].key, data[i][j].serviceUrl, dynamicControlData, j, groupIndex, i, tableModel,
						checkValue);
				}.bind(this));
				item.bindItems("oDropDownValueseModel>/dropDownValues/" + data[i][j].key + (i + 1), function (index, context) {
					var obj = context.getObject();
					return new sap.ui.core.Item({
						text: obj.value,
						key: obj.value
					});
				});
				colItems.addCell(item);
			} else if (data[i][j].dataType === "INPUT") {
				item = new sap.m.Input({
					editable: data[i][j].editability,
					tooltip: j + "-" + data[i][j].label,
					value: data[i][j].value,
					valueState: data[i][j].valueState,
					change: function (oEvent) {
						that.onSelectChangeTable(oEvent, groupIndex, i);
					}
				}).addStyleClass("wbDefaultCustomInputWrapper sapUiSizeCompact sapUiSmallMarginTop");
				colItems.addCell(item);
			} else if (data[i][j].dataType === "DATE") {
				item = new sap.m.DatePicker({
					placeholder: "mm/dd/yyyy",
					displayFormat: "MM/dd/yyyy",
					valueFormat: "yyyy-MM-dd",
					editable: data[i][j].isEditable,
					change: function (oEvent) {
						that.onSelectChangeTable(oEvent, groupIndex);
					}
				}).addStyleClass("sapUiSizeCompact wbDefaultCustomInputWrapper");
				colItems.addCell(item).addStyleClass(".sapMListTblHeader>.sapMTableTH");
			}
		},

		addRowCopy: function (tableId, dynamicControlData, index, valueStatedep, lineItemDataTable) {
			var tableModel = this.getView().getModel("tableModel");
			var poField = [];
			var lineItems = [];
			var length = dynamicControlData.length;
			lineItems = tableModel.getProperty("/lineItems");
			for (var i = 0; i < length; i++) {
				var lineItemObject = {
					"label": dynamicControlData[i].label,
					"eccKey": dynamicControlData[i].eccKey,
					"editability": dynamicControlData[i].editability,
					"isMandatory": dynamicControlData[i].isMandatory,
					"dataType": dynamicControlData[i].dataType,
					"processName": dynamicControlData[i].processName,
					"serviceUrl": dynamicControlData[i].serviceUrl,
					"visibility": dynamicControlData[i].visibility,
					"dependency": dynamicControlData[i].dependency,
					"key": dynamicControlData[i].key
				};
				poField.push(lineItemObject);
			}
			lineItems.push(poField);
			tableModel.setProperty("/lineItems", lineItems);
			tableModel.refresh();
			this.addRow(tableId, tableModel, dynamicControlData, index, valueStatedep, lineItemDataTable);
		},

		onSelectChange: function (oEvent, groupIndex) {
			var oUIGenerationPageModel = this.getView().getModel("oUIGenerationPageModel");
			var generationData = oUIGenerationPageModel.getProperty("/groupList");
			var value = oEvent.getSource().getSelectedKey();
			var name = oEvent.getSource().getProperty("name");
			var j = parseInt(name.split("-")[0], 10);
			var label = name.split("-")[1];
			var index = 0;
			var length = generationData[groupIndex].poFieldDetails.length;
			for (var i = 0; i < length; i++) {
				if (generationData[groupIndex].poFieldDetails[i].label === label) {
					index = i;
				}
			}
			generationData[groupIndex].poFieldDetails[index].value = value;
		},

		onSelectChangeText: function (oEvent, groupIndex) {
			var oUIGenerationPageModel = this.getView().getModel("oUIGenerationPageModel");
			var generationData = oUIGenerationPageModel.getProperty("/groupList");
			var value = oEvent.getSource().getValue();
			var name = oEvent.getSource().getTooltip();
			var j = parseInt(name.split("-")[0], 10);
			var controlName = name.split(" ");
			var label = name.split("-")[1];
			if (controlName[1] === "Date" || controlName[2] === "Date") {
				value = value + "T00:00:00";
			}
			var length = generationData[groupIndex].poFieldDetails.length;
			var index = 0;
			for (var i = 0; i < length; i++) {
				if (generationData[groupIndex].poFieldDetails[i].label === label) {
					index = i;
				}
			}
			generationData[groupIndex].poFieldDetails[index].value = value;
		},

		onSelectChangeTable: function (oEvent, groupIndex, i) {
			var tableModel = this.getView().getModel("tableModel");
			var data = tableModel.getProperty("/lineItems");
			var value = oEvent.getSource().getValue();
			var toolTip = oEvent.getSource().getTooltip();
			var index = toolTip.split("-");
			data[i][index[0]].value = value;
		},

		onSelectChangeSelectTable: function (oEvent, groupIndex, i) {
			var tableModel = this.getView().getModel("tableModel");
			var data = tableModel.getProperty("/lineItems");
			var value = oEvent.getSource().getSelectedKey();
			var name = oEvent.getSource().getProperty("name");
			var j = parseInt(name.split("-")[0], 10);
			data[i][j].value = value;
		},

		getDropDownValues: function (key, url, dynamicControlData, groupIndex, rowIndex, currentIndex) {
			var that = this;
			var oUIGenerationPageModel = this.getView().getModel("oUIGenerationPageModel");
			var generationData = oUIGenerationPageModel.getProperty("/groupList");
			/*	var rowNumber = this.getView().getModel("tableModel").getProperty("/lineItems").length;*/
			var dropDownModel = new sap.ui.model.json.JSONModel();
			var oDropDownValueseModel = that.getView().getModel("oDropDownValueseModel");
			//	url = "/WorkboxJavaService/dynamicPage/getPOFieldValues/" + key;
			if (generationData[groupIndex].groupType !== "TABLE") {
				/*	url = "/WorkboxJavaService/dynamicPage/getPOFieldValues/" + key;*/
				dropDownModel.loadData(url, null, true);
				dropDownModel.attachRequestCompleted(function (oEvent) {
					var uIGenerationData = dropDownModel.getData();
					oDropDownValueseModel.setProperty("/dropDownValues/" + key, uIGenerationData.data);
					oDropDownValueseModel.refresh();
				});
				dropDownModel.attachRequestFailed(function (oEvent) {});
			} else {
				var rowNumber = this.getView().getModel("tableModel").getProperty("/lineItems").length;
				/*	url = "/WorkboxJavaService/dynamicPage/getPOFieldValues/" + key;*/
				dropDownModel.loadData(url, null, true);
				dropDownModel.attachRequestCompleted(function (oEvent) {
					var uIGenerationData = dropDownModel.getData();
					oDropDownValueseModel.setProperty("/dropDownValues/" + key + (rowIndex + 1), uIGenerationData.data);
					oDropDownValueseModel.refresh();
				});
				dropDownModel.attachRequestFailed(function (oEvent) {});
			}
		},

		onCreatePO: function () {
			this.getUIGenerationPage(true);
		},

		loadDependencykey: function (key, serviceUrl, dynamicControlData, currentIndex, groupIndex, rowIndex, tableModel, checkValue) {
			var oUIGenerationPageModel = this.getView().getModel("oUIGenerationPageModel");
			var generationData = oUIGenerationPageModel.getProperty("/groupList");
			if (generationData[groupIndex].groupType !== "TABLE") {
				if (dynamicControlData[currentIndex].dependency === "") {
					this.getDropDownValues(key, serviceUrl, dynamicControlData, groupIndex, rowIndex, currentIndex);
				} else {
					this.getDropDownDependencyValues(key, serviceUrl, dynamicControlData, currentIndex, groupIndex, rowIndex, tableModel,
						checkValue);
				}
			} else {
				var tableModel = this.getView().getModel("tableModel");
				var data = tableModel.getProperty("/lineItems");
				if (data[rowIndex][currentIndex].dependency === "") {
					this.getDropDownValues(key, serviceUrl, dynamicControlData, groupIndex, rowIndex, currentIndex);
				} else {
					this.getDropDownDependencyValues(key, serviceUrl, dynamicControlData, currentIndex, groupIndex, rowIndex, tableModel,
						checkValue);
				}
			}
		},

		getDropDownDependencyValues: function (key, serviceUrl, dynamicControlData, currentIndex, groupIndex, rowIndex, tableModel,
			checkValue) {
			var that = this;
			var oUIGenerationPageModel = this.getView().getModel("oUIGenerationPageModel");
			var generationData = oUIGenerationPageModel.getProperty("/groupList");
			var length = dynamicControlData.length;
			var oDropDownValueseModel = that.getView().getModel("oDropDownValueseModel");
			var dropDownDependencyModel = new sap.ui.model.json.JSONModel();
			var tableModel = this.getView().getModel("tableModel");
			var data = tableModel.getProperty("/lineItems");
			var rowNumber = data.length;
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			if (generationData[groupIndex].groupType !== "TABLE") {
				for (var i = 0; i < length; i++) {
					if (dynamicControlData[currentIndex].dependency === dynamicControlData[i].key) {
						var keys = dynamicControlData[currentIndex].key;
						var value = dynamicControlData[currentIndex].dependency;
						var dependencyValue = dynamicControlData[i].value;
						if (dependencyValue === undefined) {
							var msg = i18n.getText("SELECT_VALUE_FROM") + " " + dynamicControlData[i].label;
							sap.m.MessageToast.show(msg);
						}
						var url = "/WorkboxJavaService/dynamicPage/getPOFieldValues/" + keys + "?dependencyKey=" + value +
							"&dependencyValue=" + dependencyValue + "&taskType=T1";
						dropDownDependencyModel.loadData(url, null, true);
						dropDownDependencyModel.attachRequestCompleted(function (oEvent) {
							var uIGenerationData = dropDownDependencyModel.getData();
							oDropDownValueseModel.setProperty("/dropDownValues/" + key, uIGenerationData.data);
							oDropDownValueseModel.refresh();
						});
						dropDownDependencyModel.attachRequestFailed(function (oEvent) {});
					}
				}
			} else {
				//var tableModel = this.getView().getModel("tableModel");
				var data = tableModel.getProperty("/lineItems");
				var rowNumber = data.length;
				if (checkValue === 1) {
					for (i = 0; i < length; i++) {
						if (data[rowIndex][currentIndex].dependency === data[rowIndex][i].key) {
							keys = data[rowIndex][currentIndex].key;
							value = data[rowIndex][currentIndex].dependency;
							dependencyValue = data[rowIndex][i].value;
							if (dependencyValue === undefined) {
								var msg = i18n.getText("SELECT_VALUE_FROM") + " " + data[rowIndex][i].label;
								sap.m.MessageToast.show(msg);
							}
							url = "/WorkboxJavaService/dynamicPage/getPOFieldValues/" + keys + "?dependencyKey=" + value +
								"&dependencyValue=" + dependencyValue + "&taskType=T1";
							dropDownDependencyModel.loadData(url, null, true);
							dropDownDependencyModel.attachRequestCompleted(function (oEvent) {
								var uIGenerationData = dropDownDependencyModel.getData();
								oDropDownValueseModel.setProperty("/dropDownValues/" + key + (rowIndex + 1), uIGenerationData.data);
								oDropDownValueseModel.refresh();
							});
							dropDownDependencyModel.attachRequestFailed(function (oEvent) {});
						}
					}
				}
			}
		},

		getEachControl: function (dynamicControlData, controlType, key, editability, label, value, serviceUrl, valueState, groupIndex,
			currentIndex, listValue) {
			var control = null;
			if (controlType === "select") {
				var selectControl;
				selectControl = new sap.m.Select({
					width: "80%",
					selectedKey: value,
					enabled: editability,
					name: currentIndex + "-" + label,
					forceSelection: false,
					valueState: valueState,
					change: function (oEvent) {
						this.onSelectChange(oEvent, groupIndex);
					}.bind(this)
				}).addStyleClass("wbGridDropdownStyle sapUiSizeCompact");
				selectControl.attachBrowserEvent("click", function (oEvent) {
					this.loadDependencykey(key, serviceUrl, dynamicControlData, currentIndex, groupIndex);
				}.bind(this));
				selectControl.bindItems("oDropDownValueseModel>/dropDownValues/" + key, function (index, context) {
					var obj = context.getObject();
					return new sap.ui.core.Item({
						text: obj.value,
						key: obj.value
					});
				});
				control = selectControl;
			} else if (controlType === "input") {
				var inputControl = new sap.m.Input({
					width: "80%",
					tooltip: currentIndex + "-" + label,
					editable: editability,
					value: value,
					valueState: valueState,
					change: function (oEvent) {
						this.onSelectChangeText(oEvent, groupIndex);
					}.bind(this)
				}).addStyleClass("wbTaskDetailInputWrapperUI");
				//	wbDefaultCustomInputWrapper  wbTaskDetailInputWrapperUI
				control = inputControl;
			} else if (controlType === "text") {
				var textControl = new sap.m.Text({
					text: value[listValue],
					width: "25%"
				}).addStyleClass("sapUiSizeCompact");
				control = textControl;
			} else if (controlType === "date") {
				var dateControl = new sap.m.DatePicker({
					width: "80%",
					placeholder: "mm/dd/yyyy",
					displayFormat: "MM/dd/yyyy",
					valueFormat: "yyyy-MM-dd",
					value: value,
					tooltip: currentIndex + "-" + label,
					editable: editability,
					valueState: valueState,
					change: function (oEvent) {
						this.onSelectChangeText(oEvent, groupIndex);
					}.bind(this)
				}).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapperUI");
				control = dateControl;
			}
			return control;
		},

		_fetchToken: function (oUrl) {
			var token;
			$.ajax({
				url: oUrl,
				method: "GET",
				async: false,
				headers: {
					"x-csrf-token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("x-csrf-token");
				},
				error: function (result, xhr, data) {

				}
			});
			return token;
		},

		poCreatedSuccess: function (oEvent) {
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var otaskCreationModel = this.getView().getModel("otaskCreationModel");
			var oUIGenerationPageModel = this.getView().getModel("oUIGenerationPageModel");
			var tableModel = this.getView().getModel("tableModel");
			var generationData = oUIGenerationPageModel.getProperty("/groupList");
			var propertyData = tableModel.getProperty("/lineItems");
			var valueStatedep, message, title, key, i, j;
			var lineItems = [];
			var oPayload = {};
			var check;
			for (i = 0; i < propertyData.length; i++) {
				var lineItem = propertyData[i];
				var obj = {};
				for (j = 0; j < lineItem.length; j++) {
					key = lineItem[j].eccKey;
					obj[key] = lineItem[j].value;
					if (lineItem[j].isMandatory === true) {
						if (lineItem[j].value === undefined || lineItem[j].value === "") {
							check = 1;
							valueStatedep = 1;
							tableModel.setProperty("/lineItems/" + i + "/" + j + "/valueState", "Error");
							tableModel.getProperty("/lineItems/" + i + "/" + j + "/valueState");
						}
						this.generateUI(valueStatedep);
						tableModel.refresh();
						if (lineItem[j].value !== undefined || lineItem[j].value === "") {
							tableModel.setProperty("/lineItems/" + i + "/" + j + "/valueState", "None");
							tableModel.getProperty("/lineItems/" + i + "/" + j + "/valueState");
						}
					}
				}
				lineItems.push(obj);
			}
			for (i = 0; i < generationData.length - 1; i++) {
				var headerItem = generationData[i];
				if (headerItem.groupType !== "TABLE") {
					for (j = 0; j < headerItem.poFieldDetails.length; j++) {
						key = headerItem.poFieldDetails[j].eccKey;
						oPayload[key] = headerItem.poFieldDetails[j].value;
						if (key === "CreatDate" || key === "DocDate") {
							if (oPayload[key] === "" || oPayload[key] === undefined) {
								check = 2;
								message = i18n.getText("ERR_DATE");
								title = i18n.getText("ERROR_TEXT");
								this._createConfirmationMessage(title, message, "Error",
									"Yes", "No", true,
									function (discardChange) {},
									function (clearTabPress) {});
								/*	MessageBox.error("Please enter  date");
									this.busy.close();*/
							}
						}
						if (headerItem.poFieldDetails[j].isMandatory === true) {
							if (headerItem.poFieldDetails[j].value === undefined) {
								check = 1;
								valueStatedep = 3;
								oUIGenerationPageModel.setProperty("/groupList/" + i + "/poFieldDetails/" + j + "/valueState", "Error");
								oUIGenerationPageModel.getProperty("/groupList/" + i + "/poFieldDetails/" + j + "/valueState");
							}
							this.generateUI(valueStatedep);
							oUIGenerationPageModel.refresh();
							if ((headerItem.poFieldDetails[j].value !== undefined)) {
								oUIGenerationPageModel.setProperty("/groupList/" + i + "/poFieldDetails/" + j + "/valueState", "None");
								oUIGenerationPageModel.getProperty("/groupList/" + i + "/poFieldDetails/" + j + "/valueState");
							}
						}
					}
				}
			}
			if (check === 1) {
				message = i18n.getText("FILL_MANDATORY_DETAILS_TEXT");
				title = i18n.getText("ERROR_TEXT");
				this._createConfirmationMessage(title, message, "Error",
					"YES", "NO", true,
					function (discardChange) {},
					function (clearTabPress) {});
				//	MessageBox.error("Please fill mandatory fields");
				//	this.busy.close();
			}
			var processName = otaskCreationModel.getProperty("/uiGeneration/processName");
			if (processName === "purchaseorderapproval") {
				var url = "/sap/opu/odata/sap/ZGW_PO_CREATE_SRV/PO_HEADERSet";
				oPayload["ITEM_DATASET"] = lineItems;
			} else if (processName === "purchaserequisitionprocess") {
				url = "/sap/opu/odata/sap/ZGW_PR_CREATE_SRV/PR_HEADERSET";
				oPayload["PR_ITEMSET"] = lineItems;
			} else if (processName === "gl_posting_process") { // For WR Grace POC
				url = "/WorkboxJavaService/workFlow/instances";
				var oPayload1 = {
					"definitionId": processName,
					//	"context": oPayload
					"context": {
						"amount": oPayload.Amount,
						"businessArea": oPayload.BusinessArea,
						"valueDate": oPayload.ValueDate,
						"pstky": lineItems[0].PstKy,
						"account": lineItems[0].Account,
						"documentDate": oPayload.DocumentDate,
						"type": oPayload.Type,
						"postingDate": oPayload.PostingDate,
						"companyCode": oPayload.CompanyCode,
						"currency": oPayload.CurrencyRate,
						"requestId": Math.random().toString(20).substr(2, 24)
					}
				};
			}
			if (processName === "purchaserequisitionprocess" || processName === "purchaseorderapproval") {
				var sToken = this._fetchToken(url);
				if (check !== 1 && check !== 2) {
					$.ajax({
						url: url,
						method: "POST",
						contentType: "application/json;charset=utf-8",
						async: true,
						data: JSON.stringify(oPayload),
						headers: {
							"X-CSRF-Token": sToken
						},
						success: function (result, xhr, data) {
							var poNmbr = [];
							poNmbr = data.getResponseHeader("location").split("'");
							var i18n = this.getView().getModel("i18n").getResourceBundle();
							var success = i18n.getText("SUCCESS_TEXT");
							var purchase = i18n.getText("PURCHASE_REQUEST_TEXT");
							var createSuccess = i18n.getText("SUCCESS_CREATION_TEXT");
							this._createConfirmationMessage(success, purchase + "  " + poNmbr[1] + " " + createSuccess, "Success",
								"Yes", "No", true,
								function (discardChange) {},
								function (clearTabPress) {});
							oUIGenerationPageModel.getData();
							this.getUIGenerationPage(false);
							oUIGenerationPageModel.refresh();
							return;
						}.bind(this),
						error: function (error) {}.bind(this)
					});
				}
			} else if (processName === "gl_posting_process") {
				this.doAjax(url, "POST", oPayload1, function (oData) {
					this._showToastMessage("GL account posting approval is generated");
					var success = i18n.getText("SUCCESS_TEXT");
					/*	this._createConfirmationMessage(success, oData.message, "Success",
							"Yes", "No", true,
							function (discardChange) {},
							function (clearTabPress) {});*/
					this.getUIGenerationPage(false);
					oUIGenerationPageModel.refresh();
				}.bind(this), function (oError) {}.bind(this));
			}
		},

		/*****Task Creation UI Generation - end*****/

		/*****Development by Akshatha - end*****/

		/*****Development by Arpita - start*****/

		editTileFilter: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.editTileFilter(oEvent);
		},

		applySaveFilter: function (property, oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.applySaveFilter(property, oEvent);
		},

		/*****Development by Arpita - end*****/

		/*****Development by Kushal - start*****/

		//To Load the main screen of add template//
		getEmailTemplate: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/emailTemplate/getEmailTemplate";
			//To get the list of existing template
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/emailListDetails", oData);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//Rich Text Editor Creation and popover
		addRTE: function () {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oRichTextEditor = new RTE({
				width: "100%",
				height: "38vh",
				customToolbar: true,
				showGroupFont: true,
				showGroupLink: true,
				showGroupInsert: true,
				editable: "{= ${oDefaultDataModel>/emailTemplateDetails/emailTemplate/status} === 'Deactivated' ? false : true}",
				value: "{oDefaultDataModel>/emailTemplateDetails/emailContent/messageBody}",
				change: function (oEvent) {
					var tempData = oEvent.getParameter("newValue");
					var match = tempData.indexOf("$");
					if (match !== -1) {
						var oButton = oEvent.getSource().getParent();
						if (!that._oPopoverTagPpl) {
							that._oPopoverTagPpl = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.ShowSuggestion", that);
							that.getView().addDependent(that._oPopoverTagPpl);
						}
						that._oPopoverTagPpl.openBy(oButton);
					}
					oDefaultDataModel.setProperty("/emailTemplateDetails/emailContent/messageBody", tempData);
				},
				ready: function () {
					this.addButtonGroup("styleselect").addButtonGroup("table");
				}
			});
			oRichTextEditor.addStyleClass("wbEmailTemplateRTE");
			this.getView().byId("idVerticalLayout").addContent(oRichTextEditor);
		},

		//On new template//
		addEmailTemplateFn: function () {
			var oAppModel = this.oAppModel;
			this.setEmailTemplateData();
			this.fetchProcessList();
			oAppModel.setProperty("/emailTemplatelistVisible", false);
			oAppModel.setProperty("/emailTemplateVisible", true);
			oAppModel.refresh(true);
		},

		//Toget process list
		fetchProcessList: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url = "/WorkboxJavaService/customProcess/getProcess?processType=Ad-hoc";
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/emailProcessDetails", oData);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//On Process change//
		onEmailProcessChange: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			oDefaultDataModel.setProperty(
				"/emailTemplateDetails/emailTemplate/taskName", "");
			oDefaultDataModel.setProperty(
				"emailAttributesDetails/customAttibutes", "");

			//Toget task list
			var url = "/WorkboxJavaService/emailTemplate/getTaskDetail/" + oDefaultDataModel.getProperty(
				"/emailTemplateDetails/emailTemplate/processName");
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/emailTaskDetails", oData);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//On task change//
		onEmailTaskChange: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var url;
			if (!oEvent.getSource()._sPickerType) {
				var templateId = oDefaultDataModel.getProperty(oEvent.getSource().getSelectedContextPaths()[0]).templateId;
				var process = oDefaultDataModel.getProperty(oEvent.getSource().getSelectedContextPaths()[0]).processName;
				oDefaultDataModel.setProperty("/emailTemplateDetails/emailTemplate/processName", process);
				var task = oDefaultDataModel.getProperty(oEvent.getSource().getSelectedContextPaths()[0]).taskName;
				oDefaultDataModel.setProperty("/emailTemplateDetails/emailTemplate/taskName", task);
				var version = oDefaultDataModel.getProperty(oEvent.getSource().getSelectedContextPaths()[0]).latestVersion;
				this.fetchProcessList();
				//Toget task list
				url = "/WorkboxJavaService/emailTemplate/getAttributeKeys/" + oDefaultDataModel.getProperty(
					"/emailTemplateDetails/emailTemplate/processName") + "/" + oDefaultDataModel.getProperty(
					"/emailTemplateDetails/emailTemplate/taskName");
				this.doAjax(url, "GET", null, function (oData) {
					var arr = [];
					if (!oData.customAttibutes) {
						oData.customAttibutes = [];
					}
					for (var i = 0; i < oData.customAttibutes.length; i++) {
						if (oData.customAttibutes[i].key === "taskOwner" || oData.customAttibutes[i].key === "creator") {
							arr.push(oData.customAttibutes[i]);
						}
					}
					oData.runTimeAttributes = arr;
					oDefaultDataModel.setProperty("/emailAttributesDetails", oData);
					this.onEmailTemplateListItemSelect(templateId, version);
					oDefaultDataModel.refresh(true);
				}.bind(this), function (oError) {}.bind(this));
				this.onEmailProcessChange();
				oEvent.getSource().removeSelections();
			} else {
				//Toget task list
				url = "/WorkboxJavaService/emailTemplate/getAttributeKeys/" + oDefaultDataModel.getProperty(
					"/emailTemplateDetails/emailTemplate/processName") + "/" + oDefaultDataModel.getProperty(
					"/emailTemplateDetails/emailTemplate/taskName");
				this.doAjax(url, "GET", null, function (oData) {
					var arr = [];
					if (!oData.customAttibutes) {
						oData.customAttibutes = [];
					}
					for (var i = 0; i < oData.customAttibutes.length; i++) {
						if (oData.customAttibutes[i].key === "taskOwner" || oData.customAttibutes[i].key === "creator") {
							arr.push(oData.customAttibutes[i]);
						}
					}
					oData.runTimeAttributes = arr;
					oDefaultDataModel.setProperty("/emailAttributesDetails", oData);
					oDefaultDataModel.refresh(true);
				}.bind(this), function (oError) {}.bind(this));
			}
		},

		//On List Select
		onEmailTemplateListItemSelect: function (templateId, version) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oAppModel = this.oAppModel;
			var tempData = oDefaultDataModel.getProperty("/emailAttributesDetails/customAttibutes");
			var url = "/WorkboxJavaService/emailTemplate/getTemplateDetailsByTemplateIdVersion?templateId=" + templateId + "&version=" +
				version;
			this.doAjax(url, "GET", null, function (oData) {
				oAppModel.setProperty("/emailTemplatelistVisible", false);
				oAppModel.setProperty("/emailTemplateVisible", true);
				if (oData.emailContent.subject) {
					for (var i = 0; i < tempData.length; i++) {
						if (oData.emailContent.subject.search(tempData[i].key) >= 0) {
							oData.emailContent.subject = oData.emailContent.subject.replace(("${" + tempData[i].key + "}"), ("{" + tempData[i].label +
								"}"));
							i = i - (i + 1);
						}
					}
				}
				if (oData.emailContent.messageBody) {
					for (i = 0; i < tempData.length; i++) {
						if (oData.emailContent.messageBody.search(tempData[i].key) >= 0) {
							oData.emailContent.messageBody = oData.emailContent.messageBody.replace(("${" + tempData[i].key + "}"), ("{" +
								tempData[i].label +
								"}"));
							i = i - (i + 1);
						}
					}
				}
				oDefaultDataModel.setProperty("/emailTemplateDetails", oData);
				oAppModel.refresh(true);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//Email Template Version Change
		onEmailTemplateVersionChange: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var sPath = oEvent.getSource().getBindingContext("oDefaultDataModel").sPath;
			var tempData = oDefaultDataModel.getProperty(sPath);
			var templateId = tempData.templateId;
			var process = tempData.processName;
			oDefaultDataModel.setProperty("/emailTemplateDetails/emailTemplate/processName", process);
			var task = tempData.taskName;
			oDefaultDataModel.setProperty("/emailTemplateDetails/emailTemplate/taskName", task);
			var version = oEvent.getParameters().value;
			this.fetchProcessList();
			//Toget task list
			var url = "/WorkboxJavaService/emailTemplate/getAttributeKeys/" + oDefaultDataModel.getProperty(
				"/emailTemplateDetails/emailTemplate/processName") + "/" + oDefaultDataModel.getProperty(
				"/emailTemplateDetails/emailTemplate/taskName");
			this.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/emailAttributesDetails", oData);
				this.onEmailTemplateListItemSelect(templateId, version);
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
			this.onEmailProcessChange();
		},

		//function to initialise the email Template json data
		setEmailTemplateData: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var data = {
				"emailTemplate": {
					"processName": "",
					"taskName": "",
					"emailTypeId": "",
					"latestVersion": null,
					"versions": [],
					"templateId": "",
					"templateType": "",
					"templateName": "",
					"status": "Activated",
					"ownerId": ""
				},
				"emailContent": {
					"version": null,
					"to": "",
					"cc": "",
					"bcc": "",
					"subject": "",
					"messageBody": "",
					"isAttachment": false,
					"attachmentList": [],
					"isTableContent": false,
					"emailTableContent": []
				}
			};
			oDefaultDataModel.setProperty("/emailTemplateDetails", data);
			oDefaultDataModel.refresh(true);
		},

		//Live change in subject
		onTagging: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			if (this.oAppModel.getProperty("/currentViewPage") === 'createWorkFlow') {
				if (oDefaultDataModel.getProperty("/setEnabled") === false) {
					var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
					if (object.isEdited !== 2) {
						object.isEdited = 1;
					}
				}
			}
			oEvent.getSource().setFilterFunction(function (sFilterText, oItem) {
				if (sFilterText.lastIndexOf("$") !== -1) {
					var iIndex = sFilterText.lastIndexOf("$");
					sFilterText = sFilterText.substring(iIndex + 1);
					var selected = oItem.getText().match(new RegExp(sFilterText, "i"));
					return selected;
				}
			});
		},

		//On selecting items from the suggestion
		onSelectingSuggestionItem: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var sDisplayName = oEvent.getParameter("selectedItem").getBindingContext("oDefaultDataModel").getObject().label;
			var value = oEvent.getSource()._sBeforeSuggest;
			var iIndex = value.lastIndexOf("$");
			var inputValue = value.substring(0, iIndex);
			var bindingPath = oEvent.getSource().mBindingInfos.value.parts[0].path;
			if (this.oAppModel.getProperty("/currentViewPage") === "createWorkFlow") {
				bindingPath = oEvent.getSource().getBindingContext("oDefaultDataModel").sPath + "/" + bindingPath;
			}
			if (sDisplayName === "+" || sDisplayName === "-" || sDisplayName === "*" || sDisplayName === "/") {
				oDefaultDataModel.setProperty(bindingPath, inputValue + sDisplayName + " ");
			} else {
				oDefaultDataModel.setProperty(bindingPath, inputValue + "{" + sDisplayName + "} ");
			}
		},

		//To delete the created template
		deleteTemplateFn: function (oEvent) {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var templateId = oDefaultDataModel.getProperty(oEvent.getSource().getBindingContext("oDefaultDataModel").sPath).templateId;
			var url = "/WorkboxJavaService/emailTemplate/deleteEmailTemaplte/" + templateId;
			this.doAjax(url, "GET", null, function (oData) {
				this._showToastMessage(oData.message);
				this.getEmailTemplate();
				oDefaultDataModel.refresh(true);
			}.bind(this), function (oError) {}.bind(this));
		},

		//Selection suggestion in email body
		onEmailSelectionChange: function (oEvent) {
			var that = this;
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var tempData = oDefaultDataModel.getProperty("/emailTemplateDetails/emailContent/messageBody");
			var sPath = oEvent.getParameter("selectedItem").getBindingContext("oDefaultDataModel").sPath;
			var sSelectedValue = oDefaultDataModel.getProperty(sPath).label;
			var iIndex = tempData.lastIndexOf("$");
			if (iIndex >= 0) {
				var inputValue = tempData.substring(0, iIndex);
				var remainingText = tempData.substring(iIndex + 1);
				this.getView().getModel("oDefaultDataModel").setProperty("/emailTemplateDetails/emailContent/messageBody", (inputValue +
					"{" +
					sSelectedValue + "}" + remainingText));
			}
			that._oPopoverTagPpl.close();
		},

		/*****Development by Kushal - end*****/

		/*******Manage Substitution - Start(Development by Varali)********/
		getManageSubstitutions: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oSubstitutionModel = new JSONModel();
			this.getView().setModel(oSubstitutionModel, "oSubstitutionModel");
			/*	var url = "/WorkboxJavaService/substitutionRule/getAllSubtitutionProcessApprovers";*/
			var url = "/WorkboxJavaService/substitutionRule/manageProcesses";
			oSubstitutionModel.setProperty("/manageProcessBusyIndicator", true);
			//oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "GET", null, function (oData) {
				this._showToastMessage(oData.message.message);
				var tableData = oData.data;
				for (var i = 0; i < tableData.length; i++) {
					tableData[i].isTickVisible = false;
					tableData[i].isCrossVisible = false;
					tableData[i].processEdit = false;
					tableData[i].approverNameEditable = false;
				}
				oSubstitutionModel.setProperty("/manageProcessBusyIndicator", false);
				oSubstitutionModel.setProperty("/manageSubs", tableData);
				oSubstitutionModel.refresh(true);
				//oDefaultDataModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		updateManageSubs: function (oEvent) {
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var sPath = oEvent.getParameters().id.split("-")[2];
			var payload = this.getModel("oSubstitutionModel").getData().manageSubs[sPath];
			payload.isTickVisible = true;
			payload.isCrossVisible = true;
			payload.processEdit = false;
			payload.approverNameEditable = true;
			oSubstitutionModel.refresh(true);
		},

		addManageSub: function () {
			var addNewModel = this.getModel("addNewModel");
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var tabledata = oSubstitutionModel.getProperty("/manageSubs");
			if (tabledata.length && tabledata[0].processDisplayName !== "") {
				tabledata.unshift({
					"process": "",
					"processDisplayName": "",
					"approvingUser": "",
					"approvingUserName": "",
					"activated": false,
					"approvelRequired": false,
					"validForUsage": null,
					"isTickVisible": true,
					"isCrossVisible": true,
					"processEdit": true,
					"approverNameEditable": true
				});
			} else {
				tabledata.push({
					"process": "",
					"processDisplayName": "",
					"approvingUser": "",
					"approvingUserName": "",
					"activated": false,
					"approvelRequired": false,
					"validForUsage": null,
					"isTickVisible": true,
					"isCrossVisible": true,
					"processEdit": true,
					"approverNameEditable": true
				});
				oSubstitutionModel.setProperty("/manageSubs", tabledata);
			}
			oSubstitutionModel.setProperty("/addSubs", true);
			oSubstitutionModel.refresh();
			addNewModel.setProperty("/buttonEnability", false);
		},

		// on click of the tick mark
		onUpdateOrAddOrDelete: function (oEvent, clickedOn) {
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var addNewModel = this.getModel("addNewModel");
			var sPath = oEvent.getParameters().id.split("-")[2];
			//var icon = oEvent.getSource().getIcon();
			var url;
			var payload = this.getModel("oSubstitutionModel").getData().manageSubs[sPath];
			delete payload.isTickVisible;
			delete payload.isCrossVisible;
			delete payload.processEdit;
			delete payload.approverNameEditable;
			/*icon === "sap-icon://delete"*/
			if (clickedOn === "delete") {
				url = "/WorkboxJavaService/substitutionRule/deleteSubtitutionProcessApprover";
				addNewModel.setProperty("/buttonEnability", true);
			} else {
				if (oSubstitutionModel.getProperty("/addSubs")) {
					url = "/WorkboxJavaService/substitutionRule/createSubtitutionProcessApprover";
					addNewModel.setProperty("/buttonEnability", true);
				} else if (oSubstitutionModel.getProperty("/addSubs") === undefined) {
					url = "/WorkboxJavaService/substitutionRule/updateSubtitutionProcessApprover";
				}
			}

			//oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "POST", payload, function (oData) {
				this._showToastMessage(oData.message);
				//this.getEmailTemplate();
				this.getManageSubstitutions();
				//oDefaultDataModel.setProperty("/enableBusyIndicators", false);
				oSubstitutionModel.setProperty("/addSubs", false);
			}.bind(this), function (oError) {}.bind(this));

		},

		onActivateSubs: function (oEvent) {
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var sPath = oEvent.getParameters().id.split("-")[2];
			var activated = oSubstitutionModel.getData().manageSubs[sPath].activated;
			if (activated) {
				oSubstitutionModel.getData().manageSubs[sPath].activated = false;
			} else {
				oSubstitutionModel.getData().manageSubs[sPath].activated = true;
			}
			oSubstitutionModel.refresh();

			if (!oSubstitutionModel.getProperty("/addSubs")) {
				var payload = oSubstitutionModel.getData().manageSubs[sPath];
				var url = "/WorkboxJavaService/substitutionRule/updateSubtitutionProcessApprover";
				this.doAjax(url, "POST", payload, function (oData) {
					this._showToastMessage(oData.message);
					//this.getEmailTemplate();
					this.getManageSubstitutions();
				}.bind(this), function (oError) {}.bind(this));
			}

		},

		onDiscardSubsClick: function (oEvent) {
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var addNewModel = this.getModel("addNewModel");
			var tabledata = oSubstitutionModel.getProperty("/manageSubs");
			if (oSubstitutionModel.getProperty("/addSubs")) {
				tabledata.shift();
			} else {
				var sPath = oEvent.getParameters().id.split("-")[2];
				var payload = this.getModel("oSubstitutionModel").getData().manageSubs[sPath];
				payload.isTickVisible = false;
				payload.isCrossVisible = false;
				payload.processEdit = false;
				payload.approverNameEditable = false;
				payload.approvingUserName = oSubstitutionModel.getProperty("/oldApprover");
			}
			addNewModel.setProperty("/buttonEnability", true);
			oSubstitutionModel.setProperty("/addSubs", false);
			//oSubstitutionModel.refresh();
		},

		onChangeSubsTab: function (oEvent) {
			var selectedKey = oEvent.getParameters().selectedKey;
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			if (selectedKey === "substitutionList") {
				oSubstitutionModel.setProperty("/addSubs", true);
				this.getSubstitutionList();
			} else {
				this.getManageSubstitutions();
			}
		},

		getSubstitutionList: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var url = "/WorkboxJavaService/substitutionRule/getRules";
			oSubstitutionModel.setProperty("/manageProcessBusyIndicator", true);
			var payload = {};
			oSubstitutionModel.setProperty("/addSubstituteDto", {
				"processList": []
			});
			//oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "POST", payload, function (oData) {
				oSubstitutionModel.setProperty("/manageProcessBusyIndicator", false);
				var listData = oData.dtoList;
				oSubstitutionModel.setProperty("/listData", listData);
				//oDefaultDataModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oError) {}.bind(this));
		},

		addSubstituteList: function () {
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oSubstitutionModel.setProperty("/addSubs", false);
			oSubstitutionModel.setProperty("/updateSubs", false);
			oSubstitutionModel.refresh();
		},

		backToSubsScreen: function () {
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			oSubstitutionModel.setProperty("/addSubs", true);
			oSubstitutionModel.refresh();
		},

		updateSubstitutionList: function (oEvent, clickedOn) {
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var sPath = oEvent.getParameters().id.split("-")[2];
			var addSubstituteDto = oSubstitutionModel.getProperty("/addSubstituteDto");
			if (!addSubstituteDto) {
				oSubstitutionModel.setProperty("/addSubstituteDto", {});
			}

			//Payload for update
			var substitutionDto = oSubstitutionModel.getData().listData;
			addSubstituteDto.version = substitutionDto[sPath].version;
			addSubstituteDto.substitutedUser = substitutionDto[sPath].substitutedUser;
			addSubstituteDto.substitutedUserName = substitutionDto[sPath].substitutedUserName;
			addSubstituteDto.substitutingUser = substitutionDto[sPath].substitutingUser;
			addSubstituteDto.substitutingUserName = substitutionDto[sPath].substitutingUserName;
			/*addSubstituteDto.startDate = substitutionDto[sPath].startDate;
			addSubstituteDto.endDate = substitutionDto[sPath].endDate;
			var date = new Date();
			addSubstituteDto.updateAt = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-
			    2) + "T23:59:59";*/
			addSubstituteDto.createdBy = substitutionDto[sPath].createdBy;
			addSubstituteDto.createdByDisp = substitutionDto[sPath].createdByDisp;
			addSubstituteDto.processList = substitutionDto[sPath].processList;
			addSubstituteDto.disableButton = substitutionDto[sPath].disableButton;
			addSubstituteDto.createdAt = substitutionDto[sPath].createdAt;
			addSubstituteDto.startDate = substitutionDto[sPath].startDate;
			addSubstituteDto.endDate = substitutionDto[sPath].endDate;
			addSubstituteDto.modifiedAt = null;
			addSubstituteDto.processStatusMap = null;
			//addSubstituteDto.active = substitutionDto[sPath].active;
			addSubstituteDto.enabled = substitutionDto[sPath].enabled;
			addSubstituteDto.validForUsage = substitutionDto[sPath].validForUsage;
			addSubstituteDto.ruleId = substitutionDto[sPath].ruleId;
			addSubstituteDto.changeActive = false;
			oSubstitutionModel.setProperty("/updateSubs", true);
			if (clickedOn === "switch") {
				addSubstituteDto.changeActive = true;
				var state = oEvent.getParameters().state;
				if (state) {
					addSubstituteDto.active = true;
				} else {
					addSubstituteDto.active = false;
				}
				oSubstitutionModel.refresh();
				this.saveSubstitution();
			} else {
				addSubstituteDto.active = true;
				oSubstitutionModel.setProperty("/addSubs", false);
				oSubstitutionModel.refresh();
			}

		},

		deleteSubstitutionList: function (oEvent) {
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var sPath = oEvent.getParameters().id.split("-")[2];
			//oSubstitutionModel.setProperty("/addSubs", tru);
			oSubstitutionModel.refresh();
			var payload = this.getModel("oSubstitutionModel").getData().listData[sPath];
			delete payload.processStatus;
			var url = "/WorkboxJavaService/substitutionRule/delete";
			//oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			this.doAjax(url, "POST", payload, function (oData) {
				this._showToastMessage(oData.message);
				this.getSubstitutionList();
				//var listData = oData.dtoList;
				//oSubstitutionModel.setProperty("/listData", listData);
				//oDefaultDataModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), function (oError) {}.bind(this));

		},

		saveSubstitution: function () {
			var oDefaultDataModel = this.getModel("oDefaultDataModel");
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var addSubstituteDto = oSubstitutionModel.getProperty("/addSubstituteDto");
			var flag = true;
			var url;
			if (!addSubstituteDto.substitutedUserName || !addSubstituteDto.substitutingUserName || !addSubstituteDto.substitutedUser ||
				!addSubstituteDto.substitutingUser || !addSubstituteDto.startDate || !addSubstituteDto.endDate) {
				flag = false;
				if (!addSubstituteDto.substitutedUser || !addSubstituteDto.substitutedUserName) {
					addSubstituteDto.substitutedUserName = "";
					addSubstituteDto.substitutedUser = "";
				}
				if (!addSubstituteDto.substitutingUser || !addSubstituteDto.substitutingUserName) {
					addSubstituteDto.substitutingUser = "";
					addSubstituteDto.substitutingUserName = "";
				}
				oSubstitutionModel.refresh(true);
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
				return;
			}
			if (addSubstituteDto.processList === null || addSubstituteDto.processList.length === 0) {
				addSubstituteDto.processList = ["ALL"];
			}

			addSubstituteDto.startDate = new Date(addSubstituteDto.startDate);
			addSubstituteDto.startDate = addSubstituteDto.startDate.getFullYear() + "-" + ("0" + (addSubstituteDto.startDate.getMonth() +
					1))
				.slice(-
					2) +
				"-" + ("0" + addSubstituteDto.startDate.getDate()).slice(-2) + "T00:00:00";
			addSubstituteDto.endDate = new Date(addSubstituteDto.endDate);
			addSubstituteDto.endDate = addSubstituteDto.endDate.getFullYear() + "-" + ("0" + (addSubstituteDto.endDate.getMonth() + 1)).slice(-
					2) +
				"-" + ("0" + addSubstituteDto.endDate.getDate()).slice(-2) + "T23:59:59";

			if (oSubstitutionModel.getProperty("/updateSubs")) {
				url = "/WorkboxJavaService/substitutionRule/update";
			} else {
				url = "/WorkboxJavaService/substitutionRule/create";
			}
			//oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			if (flag) {
				this.doAjax(url, "POST", addSubstituteDto, function (oData) {
					this._showToastMessage(oData.message);
					//this.loadSubstitutionData("mySubs");
					//oUserSettingsModel.getProperty("/addSubstituteDto", {});
					this.getSubstitutionList();
					oSubstitutionModel.setProperty("/addSubs", true);
					//	oDefaultDataModel.setProperty("/enableBusyIndicators", false);
				}.bind(this), function (oEvent) {}.bind(this));
			}
		},

		manageSubApproverSelect: function (oEvent) {
			var value = oEvent.getSource().getLastValue();
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			oSubstitutionModel.setProperty("/oldApprover", value);
		},

		onSwitchOrActivateClick: function (oEvent) {
			var sPath = oEvent.getParameters().id.split("-")[2];
			var state = oEvent.getParameters().state;
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			var payload = this.getModel("oSubstitutionModel").getData().manageSubs[sPath];
			payload.approvelRequired = state;
			if (!oSubstitutionModel.getProperty("/addSubs")) {
				delete payload.isTickVisible;
				delete payload.isCrossVisible;
				delete payload.processEdit;
				delete payload.approverNameEditable;
				var url = "/WorkboxJavaService/substitutionRule/updateSubtitutionProcessApprover";
				this.doAjax(url, "POST", payload, function (oData) {
					this._showToastMessage(oData.message);
					//this.getEmailTemplate();
					this.getManageSubstitutions();
					//oDefaultDataModel.setProperty("/enableBusyIndicators", false);
					oSubstitutionModel.setProperty("/addSubs", false);
				}.bind(this), function (oError) {}.bind(this));
			}

		},

		handleFirstDateChange: function (oEvent) {
			var fromDate = oEvent.getSource().getDateValue().getTime();
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			oSubstitutionModel.setProperty("/fromDate", fromDate);
			var currentDate = new Date();
			var prevDate = currentDate.setDate(currentDate.getDate() - 1);
			if (fromDate <= prevDate) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("DATE_ERROR_SUBSTITUTION"));
				oSubstitutionModel.setProperty("/addSubstituteDto/startDate", "");
				oSubstitutionModel.setProperty("/fromDate", "");
			}

			if (oSubstitutionModel.getProperty("/toDate") !== "") {
				if (oSubstitutionModel.getProperty("/toDate") < fromDate) {
					this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FROM_DATE_TEXT_SUBSTITUTION"));
					oSubstitutionModel.setProperty("/addSubstituteDto/startDate", "");
					oSubstitutionModel.setProperty("/fromDate", "");
				}
			}
		},

		handleSecondDateChange: function (oEvent) {
			var toDate = oEvent.getSource().getDateValue().getTime();
			var oSubstitutionModel = this.getModel("oSubstitutionModel");
			oSubstitutionModel.setProperty("/toDate", toDate);
			var currentDate = new Date();
			var prevDate = currentDate.setDate(currentDate.getDate() - 1);
			if (toDate <= prevDate) {
				this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("DATE_ERROR_SUBSTITUTION"));
				oSubstitutionModel.setProperty("/addSubstituteDto/endDate", "");
				oSubstitutionModel.setProperty("/toDate", "");
			} else if (oSubstitutionModel.getProperty("/fromDate") !== "") {
				if (oSubstitutionModel.getProperty("/fromDate") > toDate) {
					this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("TO_DATE_GREATER_THAN_FROM"));
					oSubstitutionModel.setProperty("/addSubstituteDto/endDate", "");
					oSubstitutionModel.setProperty("/toDate", "");
				}
			}

		},

		subsProcessSelection: function (oEvent) {
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
		//==============Substitution List Development - End ==================

		/*******Manage Substitution - End(Development by Varali)********/

		/*****Development by Arpita - start*****/
		loadVersions: function (oEvent) {
			var path = oEvent.getSource()._getBindingContext("oUserSettingsModel").getPath();
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			var selectedKey = oUserSettingsModel.getProperty(path + "/versionNumber");
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.loadVersions("=" + selectedKey);

		},
		versionControlTabClick: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.versionControlTabClick(oEvent);
		},
		addVersionDetails: function (selectedProperty) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.addVersionDetails(selectedProperty);
		},
		deleteVersionDetails: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.deleteVersionDetails(oEvent);
		},
		onClickApplyVersionControl: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.onClickApplyVersionControl();
		},
		uploadVersionAttachment: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.uploadVersionAttachment(oEvent);
		},
		openLinkVersionControl: function (documentId, link) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.openLinkVersionControl(documentId, link);
		},
		// Notification 
		manageNotifiifcationSettings: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");

			if (!this._oSettings) {
				that.getNoticationChannels();
				that.getNotifEventsDetails();
			}
			var oUserSettingsModel = this.getModel("oUserSettingsModel");
			oUserSettingsModel.setProperty("/settings/settingView", "GENERAL");
			oUserSettingsModel.setProperty("/settings/notifSelectedTab", "GENERAL");
			oUserSettingsModel.setProperty("/settings/settingsNav", []);
			that.loadNotification();
			oUserSettingsModel.setProperty("/settings/selectedSetting", "SETTINGS_ADMIN_NOTIFICATIONS");

		},
		selectNotificationGroup: function (oEvent, type) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.selectNotificationGroup(oEvent, type);

		},
		goBackNotificationGroup: function (oEvent, type) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.goBackNotificationGroup(oEvent, type);

		},
		confirmDiscardChanges: function (notificationEventChanged, notificationSettingsChanged) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.confirmDiscardChanges(notificationEventChanged, notificationSettingsChanged);

		},
		successGoBack: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.successGoBack();

		},
		selectNotifSettings: function (oEvent) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.selectNotifSettings(oEvent);

		},
		loadProfileNotificationSettings: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.loadProfileNotificationSettings();

		},
		loadAdditionalNotificationSettings: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.loadAdditionalNotificationSettings();
		},
		getNotifEventsDetails: function (viewType, viewName) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.getNotifEventsDetails(viewType, viewName);

		},
		generateNotifSettings: function (settingsParams) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.generateNotifSettings(settingsParams);

		},
		addNotificationDropdownList: function (bindingObject) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.addNotificationDropdownList(bindingObject);

		},
		getFrequencyControl: function (bindingObject) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.getFrequencyControl(bindingObject);

		},
		updateNotificationSettings: function (oEvent, type, settingsType) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.updateNotificationSettings(oEvent, type, settingsType);

		},
		updateEventSettings: function (oEvent, type) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.updateEventSettings(oEvent, type);

		},
		updateGeneralSettings: function (oEvent, action) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.updateGeneralSettings(oEvent, action);

		},
		saveNotificationSettings: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.saveNotificationSettings();

		},
		addEvent: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.addEvent();

		},
		updateProfile: function (oEvent, action) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.updateProfile(oEvent, action);

		},
		openAddNotifSettings: function (oEvent, configType) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.openAddNotifSettings(oEvent, configType);

		},

		closeAddNotifSettings: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.closeAddNotifSettings();

		},

		saveNotificationConfig: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.saveNotificationConfig();

		},
		discardNotificationSettings: function () {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.discardNotificationSettings();

		},
		deleteNotificationConfig: function (oEvent, configType) {
			var that = this.getModel("oAdvanceFilterModel").getProperty("/appController");
			that.deleteNotificationConfig(oEvent, configType);

		},
		/*****Development by Arpita - end*****/

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
		}
	});
});
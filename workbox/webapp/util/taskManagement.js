sap.ui.define([
	"oneapp/incture/workbox/util/formatter",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel"
], function (formatter, taskManagement, workbox, utility, JSONModel, Filter) {
	"use strict";

	return {
		formatter: formatter,
		utility: utility,
		// <----------------------------------------- START - CREATE NEW TASK FRAGMENT Methods--------------------------------->

		/**
		 * Function to the create new task fragment 
		 * @public
		 * @param that reference to App.controller.js
		 */
		onOpenCreateTaskFragmentTM: function (that) {
			that.doAjax("/WorkboxJavaService/customProcess/getProcess?processType=Ad-hoc", "GET", null, function (oData) {
					that.getModel("oCustomTaskModel").setProperty("/customProcessNames", oData.processDetails);
					that.oAppModel.setProperty("/enableSubmitButton", false);
					that.oAppModel.setProperty("/enableSaveButton", false);
					that.oAppModel.setProperty("/enableExcelUploadButton", false);
				}.bind(that),
				function (oEvent) {}.bind(that));
		},

		/**
		 * Function to load the custom attributes input field On select of process name  
		 * @public
		 * @param that reference to App.controller.js
		 * @param {Object} the payload object 
		 * @param {sap.ui.model.odata.type.String} Selected Process name
		 * @param {ExtDatePicker} Extended ExtDatePicker function
		 */
		dynamicInstanceCreationTM: function (that, selectedItem, ExtDatePicker) {
			that.getModel("oCustomTaskModel").setProperty("/enableBusyIndicators", true);
			that.doAjax("/WorkboxJavaService/tasks/getProcessAttributes/" + selectedItem, "GET", null, function (oData) {
				var oCustomTaskModel = that.getModel("oCustomTaskModel");
				oCustomTaskModel.setProperty("/customInstance", oData);
				that.oAppModel.setProperty("/draftEventId", "");
				if (oData.responseMessage.status === "FAILURE") {
					that._showToastMessage(oData.responseMessage.message);
				} else {
					var templateListOfProcesssAttributes = jQuery.extend(true, {}, oData.listOfProcesssAttributes[0]);
					oCustomTaskModel.setProperty("/templateListOfProcesssAttributes", templateListOfProcesssAttributes);
					this.uploadInstancesTM(that, oData, ExtDatePicker, oCustomTaskModel);
					if (oData.type === "Single Instance") {
						if (selectedItem === "AFENexus") { //read excel data colwise
							oCustomTaskModel.setProperty("/excelDataHeaderOrientation", "col");
						} else {
							oCustomTaskModel.setProperty("/excelDataHeaderOrientation", "row");

						}
					} else {
						oCustomTaskModel.setProperty("/excelDataHeaderOrientation", "row");
					}
					oCustomTaskModel.setProperty("/enableBusyIndicators", false);
					oCustomTaskModel.refresh(true);
				}

			}.bind(this), function (event) {}.bind(this));
		},

		//getting the attributes for draft and creating the controls dynamically
		viewDraftFnTM: function (that, url, ExtDatePicker) {
			that.getModel("oCustomTaskModel").setProperty("/enableBusyIndicators", true);
			that.doAjax(url, "GET", null, function (oData) {
				var oCustomTaskModel = that.getModel("oCustomTaskModel");
				oCustomTaskModel.setProperty("/customInstance", oData);
				if (oData.responseMessage.status === "FAILURE") {
					that._showToastMessage(oData.responseMessage.message);
				} else {
					this.uploadInstancesTM(that, oData, ExtDatePicker, oCustomTaskModel);
					oCustomTaskModel.setProperty("/enableBusyIndicators", false);
					oCustomTaskModel.refresh(true);
				}
			}.bind(this), function (event) {}.bind(this));
		},

		/**
		 * Function to Fetch dropdown using url from the customAttributeTemplateDto for dataType===Dropdown
		  and set dropdown list to the oCustomTaskModel based the process selected
		 * @public
		 * @param that reference to App.controller.js
		 * @param {Object} oData containing the dropdown list
		 */

		fetchDropdownList: function (that, attributeData) {
			if (!(attributeData.dropDownType === "individual" && attributeData.url === "/idpMapping/getUsers")) {
				that.doAjax("/WorkboxJavaService" + attributeData.url, "GET", null, function (oData) {
					// taskManagement.setCustomDropdownList(data, that.getModel("oCustomTaskModel"));
					var oCustomTaskModel = that.getModel("oCustomTaskModel");
					if (oCustomTaskModel.iSizeLimit < oData.dto.length) {
						oCustomTaskModel.setSizeLimit(oData.dto.length);
					}
					oCustomTaskModel.setProperty("/dropdownLists" + attributeData.key, oData.dto);
					oCustomTaskModel.refresh();
				}.bind(this), function (oError) {}.bind(this));
			}
		},

		/**
		 * Function to upload instances 
		 * @public
		 * @param that reference to App.controller.js
		 * @param {Object} the payload object 
		 * @param {ExtDatePicker} Extended ExtDatePicker function
		 * @param {sap.ui.model.Model} oCustomTaskModel- Custom model for create new task fragment
		 
		 */
		uploadInstancesTM: function (that, oData, ExtDatePicker, oCustomTaskModel) {
			var mainVBox = that.getView().byId("ID_INSTANCE_AGGEGRATION_VBOX");
			var customData = oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes/0/customAttributeTemplateDto");
			var attachmentDto = [];
			var attributeData = [];
			for (var j = 0; j < customData.length; j++) {
				if (customData[j].dataType === "ATTACHMENT") {
					customData[j].value = "";
					attachmentDto.push(customData[j]);
					customData.splice(j, 1);
				}
			}
			attributeData = customData;

			if (attachmentDto.length) {
				for (var z = 0; z < attachmentDto.length; z++) {
					attributeData.push(attachmentDto[z]);
				}
			}

			oData.listOfProcesssAttributes[0].customAttributeTemplateDto = attributeData;
			oCustomTaskModel.setProperty("/customInstance/listOfProcesssAttributes/0/customAttributeTemplateDto", attributeData);

			for (var i = 0; i < attributeData.length; i++) {
				if (attributeData[i].dataType === "DROPDOWN") {
					this.fetchDropdownList(that, attributeData[i]);
				}
			}
			oCustomTaskModel.setProperty("/enableVBoxContent", true);
			that.oAppModel.setProperty("/enableSubmitButton", true);
			that.oAppModel.setProperty("/enableSaveButton", true);
			that.oAppModel.setProperty("/enableExcelUploadButton", true);

			var contextTM = this;
			if (oData.type === "Multiple Instance") {
				oCustomTaskModel.setProperty("/multipleInstance", true);
				oCustomTaskModel.setProperty("/singleInstance", false);
				var headers = jQuery.extend(true, [], oData.listOfProcesssAttributes[0].customAttributeTemplateDto);
				var addColum = {
					"dataType": "Add Icon"
				};
				headers.push(addColum);
				oCustomTaskModel.setProperty("/headers", headers);

				mainVBox.removeAllItems();
				oCustomTaskModel.refresh(true);

				mainVBox.addItem(new sap.m.Table().addStyleClass("wbCreateTaskTable"));
				var tableContent = mainVBox.getItems()[0];
				tableContent.bindAggregation("columns", "oCustomTaskModel>/headers",
					function (index, context) {
						var bindingObject = context.getObject();
						var isVisible = true;
						var oColumn;
						if (bindingObject.dataType === "Add") {
							oColumn = new sap.m.Column({
								visible: true,
								header: new sap.ui.core.Icon({
									src: "sap-icon://add",
									tooltip: "Add Task"
										/*press: function (oEvent) {
											that.addInstance(oEvent);
										}*/
								}).addStyleClass("wbCreateTaskAddIcon")
							});
						} else {
							oColumn = new sap.m.Column({
								visible: isVisible,
								header: new sap.m.Label({
									text: bindingObject.label,
									required: bindingObject.isMandatory
								}).addStyleClass("wbCreateTaskHeaderLabelClass")
							});
						}
						return oColumn;
					});
				tableContent.bindAggregation("items", "oCustomTaskModel>/customInstance/listOfProcesssAttributes", function (
					rowIndex, rowContext) {
					var rowData = new sap.m.ColumnListItem();
					var sPath = "oCustomTaskModel>" + rowContext.getPath();
					rowData.bindAggregation("cells", sPath + "/customAttributeTemplateDto", function (colIndex, colContext) {
						var contextPath = colContext.getPath();
						var contextData = colContext.getObject();
						var cell = contextTM.addCellContentMultipleInstanceTM("oCustomTaskModel>" + contextPath, contextData, ExtDatePicker,
							oCustomTaskModel, that);

						return cell;

					}.bind(this));
					var itemDelete = new sap.m.Button({
						enabled: oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes").length > 1 ? true : false,
						type: "Reject",
						visible: true,
						text: "Remove",
						tooltip: "Delete Instance",
						press: function (oEvent) {
							this.deleteInstanceTM(that, oEvent, oCustomTaskModel);
						}.bind(this)
					}).addStyleClass("wbAdminMGroupsRemoveBtn");
					return rowData;
				}.bind(that));

				this.addDeleteIconInstanceCreationTM(that, oCustomTaskModel);
			} else {
				oCustomTaskModel.setProperty("/singleInstance", true);
				oCustomTaskModel.setProperty("/multipleInstance", false);
				mainVBox.removeAllItems();
				mainVBox.addItem(new sap.ui.layout.cssgrid.CSSGrid({
					gridTemplateColumns: "1fr 1fr",
					gridGap: "1rem "
				}));

				var dummyData = oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes/0/customAttributeTemplateDto");
				for (var a = 0; a < dummyData.length; a++) {
					if (dummyData[a].key === "description") {
						var dummy = {
							attachmentSize: null,
							attachmentType: null,
							attrDes: "",
							dataType: "TEXT",
							dataTypeKey: 0,
							dropDownType: null,
							isActive: true,
							isDeleted: false,
							isEditable: null,
							isEdited: 0,
							isMandatory: null,
							key: "dummy",
							label: "",
							processName: "",
							processType: null,
							taskId: null,
							url: null,
							value: "",
							valueList: []
						};
						dummyData.splice(a + 1, 0, dummy);
						break;
					}
				}
				var textAreaDto = [];
				for (var z = 0; z < dummyData.length; z++) {
					if (dummyData[z].key !== "description" && dummyData[z].dataType === "TEXT AREA") {
						textAreaDto.push(dummyData[z]);
					} else if (dummyData[z].dataType === "ATTACHMENT") {
						var count = 1;
					}
				}

				if (textAreaDto.length) {
					for (var a = 0; a < dummyData.length; a++) {
						for (var b = 0; b < textAreaDto.length; b++) {
							if (dummyData[a].key === textAreaDto[b].key) {
								dummyData.splice(a, 1);
							}
						}
					}
				}

				if (textAreaDto.length) {
					var checkLength = dummyData.length;
					if (count) {
						checkLength = dummyData.length - 1;
					}
					var remainder = (checkLength) % 2;
					if (remainder) {
						var dummy2 = {
							attachmentSize: null,
							attachmentType: null,
							attrDes: "",
							dataType: "TEXT",
							dataTypeKey: 0,
							dropDownType: null,
							isActive: true,
							isEditable: null,
							isEdited: 0,
							isMandatory: null,
							key: "dummy2",
							label: "",
							processName: "",
							processType: null,
							taskId: null,
							url: null,
							value: "",
							valueList: []
						};
						dummyData.splice((dummyData.length - attachmentDto.length), 0, dummy2);
					}

					if (!attachmentDto.length) {
						dummyData = dummyData.concat(textAreaDto);
					} else {
						for (var i = 0; i < textAreaDto.length; i++) {
							dummyData.splice((dummyData.length - attachmentDto.length), 0, textAreaDto[i]);
						}
					}
				}

				if (textAreaDto.length) {
					if (attachmentDto.length) {
						var remainder = (dummyData.length) % 2;
						if (!remainder) {
							var dummy1 = {
								attachmentSize: null,
								attachmentType: null,
								attrDes: "",
								dataType: "TEXT",
								dataTypeKey: 0,
								dropDownType: null,
								isActive: true,
								isEditable: null,
								isEdited: 0,
								isMandatory: null,
								key: "dummy1",
								label: "",
								processName: "",
								processType: null,
								taskId: null,
								url: null,
								value: "",
								valueList: []
							};
							dummyData.splice((dummyData.length - attachmentDto.length), 0, dummy1);
						}
					}
				}

				oData.listOfProcesssAttributes[0].customAttributeTemplateDto = dummyData;
				oCustomTaskModel.setProperty("/customInstance/listOfProcesssAttributes/0/customAttributeTemplateDto", dummyData);
				oCustomTaskModel.setProperty("/selectedProcess", oData.processName);
				oCustomTaskModel.refresh(true);

				var gridContent = mainVBox.getItems()[0];
				gridContent.bindAggregation("items",
					"oCustomTaskModel>/customInstance/listOfProcesssAttributes/0/customAttributeTemplateDto",
					function (
						index, context) {
						var VBox;
						var bindingObject = context.getObject();
						var bindingPath = context.getPath();
						VBox = contextTM.addGridContentSingleInstanceTM(bindingObject, bindingPath, ExtDatePicker, oCustomTaskModel, that);
						return VBox;
					}.bind(that));
			}
		},
		/**
		 * Method to aggregate VBox to grid content - Single instance creation 
		 * @public
		 * @param {Object} Context Object from factory function
		 * @param {ExtDatePicker} Extended ExtDatePicker function
		 * @param {sap.ui.model.Model} oCustomTaskModel- Custom model for create new task fragment
		 * @returns {sap.m.VBox} Returns VBox control
		 */
		addGridContentSingleInstanceTM: function (bindingObject, bindingPath, ExtDatePicker, oCustomTaskModel, contextGlobal) {
			var VBox;
			var that = this;
			var isVisible = true,
				isEditable = bindingObject.isEditable;
			// var oConstantsModel = AppView.getModel("oConstantsModel");
			if (bindingObject.processName === "ProjectProposalDocumentApproval") {

				if (bindingObject.label.includes("Available Budget") && (
						bindingObject.dataType === "INPUT" || bindingObject.dataType === "INPUT NUMERIC" || bindingObject.dataType === "INPUT NUMERIC-CALCULATE")) {
					isVisible = false;
					var z = 0;
					var costCenterValue = oCustomTaskModel.getProperty("/costCenterValue");
					if (!costCenterValue && contextGlobal.oAppModel.getProperty("/inboxType") === "Draft") {
						var path = bindingPath.split("/");
						path.pop();
						path = path.join("/");
						var list = oCustomTaskModel.getProperty(path);
						for (z = 0; z < list.length; z++) {
							if (list[z].label.includes("Cost Center")) {
								costCenterValue = list[z].value.split(",");
								break;
							}
						}
					}
					if (costCenterValue && costCenterValue.length > 0) {
						for (z = 0; z < costCenterValue.length; z++) {
							if (bindingObject.label.includes(costCenterValue[z])) {
								isVisible = true;
								isEditable = false;
							}
						}
					}
				} else if (bindingObject.label.includes("Budget") && !bindingObject.label.includes("Available Budget")) {
					oCustomTaskModel.setProperty("/budgetIndex", bindingPath.split("/").splice(3).join("/"));
				}
			}
			var isMandatory = bindingObject.isMandatory;
			if (bindingObject.dataType === "INPUT") {
				VBox = new sap.m.VBox({
						visible: isVisible,
						justifyContent: "Start"
					}).addItem(new sap.m.Label({
						text: bindingObject.label,
						required: isMandatory
					}))
					.addItem(new sap.m.Input({
						width: "85%",
						value: "{oCustomTaskModel>value}",
						required: isMandatory,
						change: function (oEvent) {
							bindingObject.isEdited = 2;
							var str = oEvent.getSource().getValue();
							if (!str.replace(/\s/g, "").length) {
								oEvent.getSource().setValue("");
							}
						},
						editable: isEditable
					})).addStyleClass("wbDefaultCustomInputWrapper wbCreateTaskInputWrapper");
				// For AFE Nexus
				// if (oCustomTaskModel.getProperty("/selectedProcess") === "AFENexus" && bindingObject.attrDes === "AFE Title") {
				// 	bindingObject.value = contextGlobal.oAppModel.getProperty("/loggedInUserDetails/userFirstName") + " " + contextGlobal.oAppModel.getProperty(
				// 		"/loggedInUserDetails/userLastName");
				// }
			} else if (bindingObject.dataType === "SWITCH") {
				if (!bindingObject.value) {
					bindingObject.value = "false";
				}
				VBox = new sap.m.VBox({
						visible: isVisible,
						justifyContent: "Start"
					}).addItem(new sap.m.Label({
						text: bindingObject.label,
						required: isMandatory
					}))
					.addItem(new sap.m.Switch({
						state: "{= ${oCustomTaskModel>value} === 'true' ? true : false}",
						change: function (oEvent) {
							bindingObject.isEdited = 2;
							if (oEvent.getSource().getState()) {
								bindingObject.value = "true";
							} else {
								bindingObject.value = "false";
							}
						},
						enabled: isEditable
					})).addStyleClass("wbCustomSwitch");
			} else if (bindingObject.dataType === "INPUT NUMERIC" ||bindingObject.dataType === "INPUT NUMERIC-CALCULATE") {
				VBox = new sap.m.VBox({
						visible: isVisible,
						justifyContent: "Start"
					}).addItem(new sap.m.Label({
						text: bindingObject.label,
						required: isMandatory
					}))
					.addItem(new sap.m.Input({
						width: "85%",
						value: "{oCustomTaskModel>value}",
						/*editable: bindingObject.isEditable,*/
						required: isMandatory,
						change: function (oEvent) {
							bindingObject.isEdited = 2;
							var newValue = oEvent.getParameter("value");
							newValue = newValue.replace(/[^\d]/g, "");
							oEvent.getSource().setValue(newValue);
							if (!newValue.replace(/\s/g, "").length) {
								oEvent.getSource().setValue("");
							}
						},
						editable: isEditable
					})).addStyleClass("wbDefaultCustomInputWrapper wbCreateTaskInputWrapper");
			} else if (bindingObject.dataType === "DROPDOWN") {
				if (!bindingObject.dropDownType) {
					bindingObject.dropDownType = "";
				}
				if (bindingObject.dropDownType === "individual") {
					VBox = new sap.m.VBox({
							visible: isVisible,
							justifyContent: "Start"
						}).addItem(new sap.m.Label({
							text: bindingObject.label,
							required: isMandatory
						}))
						.addItem(new sap.m.MultiComboBox({
							width: "85%",
							placeholder: "Select " + bindingObject.label,
							tooltip: bindingObject.label,
							editable: bindingObject.isEditable,
							items: {
								path: "oConstantsModel>/allUsers",
								template: new sap.ui.core.Item({
									key: "{oConstantsModel>userId}",
									text: "{oConstantsModel>userFirstName} {oConstantsModel>userLastName}"
								})
							},
							selectionFinish: function (oEvent) {
								var bindingPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
								that.addResourceList(oEvent, bindingPath, oCustomTaskModel, bindingObject.dropDownType);
							},
							selectionChange: function (oEvent) {
								bindingObject.isEdited = 2;
							},
							selectedKeys: "{path: 'oCustomTaskModel>valueList' ,formatter: 'oneapp.incture.workbox.util.formatter.wbValueListCreateInstance'}"
						})).addStyleClass("wbDefaultCustomInputWrapper wbCreateTaskInputWrapper");
				} else if (bindingObject.dropDownType.toLowerCase() === "group") {
					VBox = new sap.m.VBox({
							visible: isVisible,
							justifyContent: "Start"
						}).addItem(new sap.m.Label({
							text: bindingObject.label,
							required: isMandatory
						}))
						.addItem(new sap.m.MultiComboBox({
							width: "85%",
							placeholder: "Select " + bindingObject.label,
							tooltip: bindingObject.label,
							editable: bindingObject.isEditable,
							items: {
								path: "oCustomTaskModel>/dropdownLists" + bindingObject.key,
								template: new sap.ui.core.Item({
									key: "{oCustomTaskModel>groupId}",
									text: "{oCustomTaskModel>groupName}"
								})
							},
							selectionFinish: function (oEvent) {
								var bindingPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
								that.addResourceList(oEvent, bindingPath, oCustomTaskModel, bindingObject.dropDownType);
							},
							selectionChange: function (oEvent) {
								bindingObject.isEdited = 2;
							},
							selectedKeys: "{path: 'oCustomTaskModel>valueList' ,formatter: 'oneapp.incture.workbox.util.formatter.wbValueListCreateInstance'}"
						})).addStyleClass("wbDefaultCustomInputWrapper wbCreateTaskInputWrapper");
				} else if (bindingObject.dropDownType.toLowerCase() === "role") {
					VBox = new sap.m.VBox({
							visible: isVisible,
							justifyContent: "Start"
						}).addItem(new sap.m.Label({
							text: bindingObject.label,
							required: isMandatory
						}))
						.addItem(new sap.m.MultiComboBox({
							width: "85%",
							placeholder: "Select " + bindingObject.label,
							tooltip: bindingObject.label,
							editable: bindingObject.isEditable,
							items: {
								path: "oCustomTaskModel>/dropdownLists" + bindingObject.key,
								template: new sap.ui.core.Item({
									key: "{oCustomTaskModel>roleId}",
									text: "{oCustomTaskModel>roleName}"
								})
							},
							selectionFinish: function (oEvent) {
								var bindingPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
								that.addResourceList(oEvent, bindingPath, oCustomTaskModel, bindingObject.dropDownType);
							},
							selectionChange: function (oEvent) {
								bindingObject.isEdited = 2;
							},
							selectedKeys: "{path: 'oCustomTaskModel>valueList' ,formatter: 'oneapp.incture.workbox.util.formatter.wbValueListCreateInstance'}"
						})).addStyleClass("wbDefaultCustomInputWrapper wbCreateTaskInputWrapper");
				} else if (bindingObject.processName === "ProjectProposalDocumentApproval") {
					VBox = new sap.m.VBox({
							visible: isVisible,
							justifyContent: "Start"
						}).addItem(new sap.m.Label({
							text: bindingObject.label,
							required: isMandatory
						}))
						.addItem(new sap.m.MultiComboBox({
							width: "85%",
							placeholder: "Select " + bindingObject.label,
							tooltip: bindingObject.label,
							editable: isEditable,
							items: {
								path: "oCustomTaskModel>/dropdownLists" + bindingObject.key,
								template: new sap.ui.core.Item({
									key: "{oCustomTaskModel>value}",
									text: "{oCustomTaskModel>value}"
								})
							},
							selectionFinish: function (oEvent) {
								var bindingPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
								that.addMultiSelectValues(oEvent, bindingPath, oCustomTaskModel);
							},
							selectionChange: function (oEvent) {
								bindingObject.isEdited = 2;
							},
							selectedKeys: "{path: 'oCustomTaskModel>value' ,formatter: 'oneapp.incture.workbox.util.formatter.wbSetSelectedKeysString'}"
						})).addStyleClass("wbDefaultCustomInputWrapper wbCreateTaskInputWrapper");
				} else {
					VBox = new sap.m.VBox({
							visible: isVisible,
							justifyContent: "Start"
						}).addItem(new sap.m.Label({
							text: bindingObject.label,
							required: isMandatory
						}))
						.addItem(new sap.m.ComboBox({
							width: "85%",
							placeholder: "Select " + bindingObject.label,
							tooltip: bindingObject.label,
							editable: isEditable,
							items: {
								path: "oCustomTaskModel>/dropdownLists" + bindingObject.key,
								template: new sap.ui.core.Item({
									key: "{oCustomTaskModel>value}",
									text: "{oCustomTaskModel>value}"
								})
							},
							selectedKey: "{oCustomTaskModel>value}",
							change: function (oEvent) {
								bindingObject.isEdited = 2;
							}
						})).addStyleClass("wbDefaultCustomInputWrapper wbCreateTaskInputWrapper");
				}
			} else if (bindingObject.dataType === "TEXT") {
				VBox = new sap.m.VBox({
						visible: isVisible,
						justifyContent: "Start"
					}).addItem(new sap.m.Label({

						required: isMandatory
					}))
					.addItem(new sap.m.Text({
						width: "85%",
						text: "{oCustomTaskModel>value}"
					}));
			} else
			if (bindingObject.dataType === "DATETYPE") {
				VBox = new sap.m.VBox({
						visible: isVisible,
						justifyContent: "Start"
					}).addItem(new sap.m.Label({
						text: bindingObject.label,
						required: isMandatory
					}))
					.addItem(new ExtDatePicker({
						width: "85%",
						displayFormat: "dd MMM yyyy",
						valueFormat: "yyyy-MM-dd",
						editable: isEditable,
						value: "{oCustomTaskModel>value}",
						required: isMandatory,
						change: function (oEvent) {
							bindingObject.isEdited = 2;
						}
					})).addStyleClass("wbDefaultCustomInputWrapper wbCreateTaskInputWrapper");
				if (bindingObject.processName === "ProjectProposalDocumentApproval") {
					VBox.getAggregation("items")[1].setMinDate(this.formatter.wbSetMinDateSubsRule(new Date()));
				}
			} else if (bindingObject.dataType === "ATTACHMENT") {
				VBox = new sap.m.VBox({
						visible: isVisible,
						justifyContent: "Start"
					}).addItem(new sap.m.Label({
						text: bindingObject.label,
						required: isMandatory
					}))
					.addItem(new sap.ui.unified.FileUploader({
						icon: "sap-icon://add",
						tooltip: contextGlobal.getView().getModel("i18n").getResourceBundle().getText("UPLOAD_FILE_TEXT"),
						buttonText: contextGlobal.getView().getModel("i18n").getResourceBundle().getText("ADD_FILES_TEXT"),
						buttonOnly: true,
						fileType: "jpg,jpeg,png,xlsx,ods,xls,docx,zip,ppt,pdf,csv,msg",
						enabled: isEditable,
						placeholder: contextGlobal.getView().getModel("i18n").getResourceBundle().getText("UPLOAD_FILE_TEXT") + " " + bindingObject.label,
						change: function (oEvent) {
							var bindingPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
							that.handleImageUploadInstanceCreation(oEvent, bindingPath, oCustomTaskModel);
						}
					}).addStyleClass("wbDefaultButtonClass"))
					.addItem(new sap.m.HBox({
							justifyContent: "Start",
							visible: "{path: 'oCustomTaskModel>attachmentName' ,formatter: 'oneapp.incture.workbox.util.formatter.wbShowUploadedImageInstanceCreation'}"
						}).addStyleClass("wbCreateTaskAttachmentClass")
						.addItem(new sap.m.Image({
							src: '{parts: ["oCustomTaskModel>value", "oCustomTaskModel>attachmentType"], formatter:"oneapp.incture.workbox.util.formatter.wbParseAttachmentType"}',
							press: function (oEvent) {
								contextGlobal.downloadAttachment(bindingObject.attachmentId, bindingObject.attachmentType, bindingObject.attachmentName,
									bindingObject.value, bindingObject.attachmentSize);
							},
							// visible: "{= ${oCustomTaskModel>value} ? true : false}"
						}).addStyleClass("wbCreateTaskFragmentAttachmentImage"))
						.addItem(new sap.m.VBox({
								justifyContent: "Start"
							}).addStyleClass("sapUiTinyMarginBegin")
							.addItem(new sap.m.Text({
								text: "{oCustomTaskModel>attachmentName}.{oCustomTaskModel>attachmentType}"
							})).addItem(new sap.m.Text({
								text: "{path: 'oCustomTaskModel>attachmentSize' ,formatter: 'oneapp.incture.workbox.util.formatter.wbAttachmentSizeParser'}"
							}).addStyleClass("wbCreateTaskAttachmentSizeText"))
							.addItem(new sap.m.HBox({
								justifyContent: "End"
							}).addItem(new sap.m.Button({
								text: "Remove",
								type: "Reject",
								visible: "{path: 'oCustomTaskModel>attachmentName' ,formatter: 'oneapp.incture.workbox.util.formatter.wbShowUploadedImageInstanceCreation'}",
								press: function (oEvent) {
									that.deleteUploadedImage(oEvent, oCustomTaskModel);
								}
							}).addStyleClass("wbAdminMGroupsRemoveBtn")))));
			} else {
				VBox = new sap.m.VBox({
						visible: isVisible,
						justifyContent: "Start"
					}).addItem(new sap.m.Label({
						text: bindingObject.label,
						required: isMandatory
					}))
					.addItem(new sap.m.TextArea({
						width: "85%",
						value: "{oCustomTaskModel>value}",
						editable: bindingObject.editableValue,
						required: isMandatory,
						change: function (oEvent) {
							bindingObject.isEdited = 2;
							var str = oEvent.getSource().getValue();
							if (!str.replace(/\s/g, "").length) {
								oEvent.getSource().setValue("");
							}
						}
					}))
					.addStyleClass("wbDefaultCustomInputWrapper wbCreateTaskTextAreaWrapper");
			}
			return VBox;
		},
		/**
		 * Method to aggregate Cells of row items in table - Multiple instance creation 
		 * @public
		 * @param {sap.ui.model.odata.type.String} Context Object Path from factory function
		 * @param {Object} Context Object from factory function
		 * @param {ExtDatePicker} Extended ExtDatePicker function
		 * @param {sap.ui.model.Model} oCustomTaskModel- Custom model for create new task fragment
		 * @returns Returns Dynamic control
		 */
		addCellContentMultipleInstanceTM: function (contextPath, bindingObject, ExtDatePicker, oCustomTaskModel, contextGlobal) {
			var VBox;
			var that = this;
			var isVisible = true;
			if (bindingObject.dataType === "INPUT") {
				VBox = new sap.m.Input({
					width: "90%",
					visible: isVisible,
					editable: bindingObject.isEditable,
					value: "{" + contextPath + "/value}",
					change: function (oEvent) {
						bindingObject.isEdited = 2;
						var str = oEvent.getSource().getValue();
						if (!str.replace(/\s/g, "").length) {
							oEvent.getSource().setValue("");
						}
					}
				}).addStyleClass("wbDefaultCustomInputWrapper");
			} else if (bindingObject.dataType === "SWITCH") {
				if (!bindingObject.value) {
					bindingObject.value = "false";
				}
				VBox = new sap.m.Switch({
					state: "{= ${oCustomTaskModel>value} === 'true' ? true : false}",
					change: function (oEvent) {
						bindingObject.isEdited = 2;
						if (oEvent.getSource().getState()) {
							bindingObject.value = "true";
						} else {
							bindingObject.value = "false";
						}
					},
					enabled: bindingObject.isEditable
				}).addStyleClass("wbCustomSwitch");
			} else if (bindingObject.dataType === "INPUT NUMERIC" || bindingObject.dataType === "INPUT NUMERIC-CALCULATE") {
				VBox = new sap.m.Input({
					width: "90%",
					visible: isVisible,
					editable: bindingObject.isEditable,
					value: "{" + contextPath + "/value}",

					change: function (oEvent) {
						bindingObject.isEdited = 2;
						var str = oEvent.getSource().getValue();
						if (!str.replace(/\s/g, "").length) {
							oEvent.getSource().setValue("");
						}
						str = str.replace(/[^\d]/g, "");
						oEvent.getSource().setValue(str);
					}
				}).addStyleClass("wbDefaultCustomInputWrapper");
			} else if (bindingObject.dataType === "DROPDOWN") {
				if (!bindingObject.dropDownType) {
					bindingObject.dropDownType = "";
				}
				if (bindingObject.dropDownType === "individual") {
					if (bindingObject.processName === "NovoPOCSampleData") {
						bindingObject.valueList = [{
							"id": bindingObject.value,
							type: "individual"
						}];
					}
					VBox = new sap.m.MultiComboBox({
						width: "90%",
						visible: isVisible,
						editable: bindingObject.isEditable,
						placeholder: "Select " + bindingObject.label,
						tooltip: bindingObject.label,
						items: {
							path: "oCustomTaskModel>/dropdownLists" + bindingObject.key,
							template: new sap.ui.core.Item({
								key: "{oCustomTaskModel>userId}",
								text: "{oCustomTaskModel>userFirstName} {oCustomTaskModel>userLastName}"
							})
						},
						selectionFinish: function (oEvent) {
							var bindingPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
							that.addResourceList(oEvent, bindingPath, oCustomTaskModel, bindingObject.dropDownType);
						},
						selectionChange: function (oEvent) {
							bindingObject.isEdited = 2;
						},
						selectedKeys: "{path: 'oCustomTaskModel>valueList' ,formatter: 'oneapp.incture.workbox.util.formatter.wbValueListCreateInstance'}"
					}).addStyleClass("wbDefaultCustomInputWrapper");
				} else if (bindingObject.dropDownType.toLowerCase() === "group") {
					if (bindingObject.processName === "NovoPOCSampleData") {
						bindingObject.valueList = [{
							"id": bindingObject.value,
							"type": "group"
						}];
					}
					VBox = new sap.m.MultiComboBox({
						width: "90%",
						visible: isVisible,
						editable: bindingObject.isEditable,
						placeholder: "Select " + bindingObject.label,
						tooltip: bindingObject.label,
						items: {
							path: "oCustomTaskModel>/dropdownLists" + bindingObject.key,
							template: new sap.ui.core.Item({
								key: "{oCustomTaskModel>groupId}",
								text: "{oCustomTaskModel>groupName}"
							})
						},
						selectionFinish: function (oEvent) {
							var bindingPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
							that.addResourceList(oEvent, bindingPath, oCustomTaskModel, bindingObject.dropDownType);
						},
						selectionChange: function (oEvent) {
							bindingObject.isEdited = 2;
						},
						selectedKeys: "{path: 'oCustomTaskModel>valueList' ,formatter: 'oneapp.incture.workbox.util.formatter.wbValueListCreateInstance'}"
					}).addStyleClass("wbDefaultCustomInputWrapper");
				} else if (bindingObject.dropDownType.toLowerCase() === "role") {
					VBox = new sap.m.MultiComboBox({
						width: "90%",
						visible: isVisible,
						editable: bindingObject.isEditable,
						placeholder: "Select " + bindingObject.label,
						tooltip: bindingObject.label,
						items: {
							path: "oCustomTaskModel>/dropdownLists" + bindingObject.key,
							template: new sap.ui.core.Item({
								key: "{oCustomTaskModel>roleId}",
								text: "{oCustomTaskModel>roleName}"
							})
						},
						selectionFinish: function (oEvent) {
							var bindingPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
							that.addResourceList(oEvent, bindingPath, oCustomTaskModel, bindingObject.dropDownType);
						},
						selectionChange: function (oEvent) {
							bindingObject.isEdited = 2;
						},
						selectedKeys: "{path: 'oCustomTaskModel>valueList' ,formatter: 'oneapp.incture.workbox.util.formatter.wbValueListCreateInstance'}"
					}).addStyleClass("wbDefaultCustomInputWrapper");
				} else {
					VBox = new sap.m.ComboBox({
						width: "90%",
						visible: isVisible,
						editable: bindingObject.isEditable,
						placeholder: "Select " + bindingObject.label,
						tooltip: bindingObject.label,
						items: {
							path: "oCustomTaskModel>/dropdownLists" + bindingObject.key,
							template: new sap.ui.core.Item({
								key: "{oCustomTaskModel>value}",
								text: "{oCustomTaskModel>value}"
							})
						},
						selectedKey: "{" + contextPath + "/value}",
						change: function (oEvent) {
							bindingObject.isEdited = 2;
						}
					}).addStyleClass("wbDefaultCustomInputWrapper");

				}
			} else if (bindingObject.dataType === "DATETYPE") {
				VBox = new ExtDatePicker({
					width: "90%",
					displayFormat: "dd MMM yyyy",
					valueFormat: "yyyy-MM-dd",
					value: "{" + contextPath + "/value}",
					visible: isVisible,
					change: function (oEvent) {
						bindingObject.isEdited = 2;
					},
					editable: bindingObject.isEditable
				}).addStyleClass("wbDefaultCustomInputWrapper");
			} else if (bindingObject.dataType === "ATTACHMENT") {
				VBox = new sap.m.HBox({
						justifyContent: "Start",
						visible: isVisible,
						width: "90%"
					}).addItem(new sap.ui.unified.FileUploader({
						icon: "sap-icon://add",
						tooltip: contextGlobal.getView().getModel("i18n").getResourceBundle().getText("UPLOAD_FILE_TEXT"),
						iconOnly: true,
						buttonOnly: true,
						enabled: bindingObject.isEditable,
						fileType: "jpg,jpeg,png,xlsx,ods,xls,docx,zip,ppt,pdf,csv,msg",
						change: function (oEvent) {
							var bindingPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
							that.handleImageUploadInstanceCreation(oEvent, bindingPath, oCustomTaskModel);
						}
					}).addStyleClass("wbDefaultButtonClass wbCreateTaskAttachmentButtonClass"))
					.addItem(new sap.m.Image({
						src: '{parts: ["oCustomTaskModel>value", "oCustomTaskModel>attachmentType"], formatter:"oneapp.incture.workbox.util.formatter.wbParseAttachmentType"}',
						press: function (oEvent) {
							contextGlobal.downloadAttachment(bindingObject.attachmentId, bindingObject.attachmentType, bindingObject.attachmentName,
								bindingObject.value, bindingObject.attachmentSize);
						},
						visible: "{= ${oCustomTaskModel>value} ? true : false}"
					}).addStyleClass("wbCreateTaskFragmentAttachmentImage sapUiSmallMarginBegin"))
					.addItem(new sap.ui.core.Icon({
						src: "sap-icon://delete",
						visible: "{path: 'oCustomTaskModel>attachmentName' ,formatter: 'oneapp.incture.workbox.util.formatter.wbShowUploadedImageInstanceCreation'}",
						size: "12px",
						press: function (oEvent) {
							that.deleteUploadedImage(oEvent, oCustomTaskModel);
						}
					}).addStyleClass("wbCreateTaskFragmentAttachmentDeleteIcon"));

			} else {
				VBox = new sap.m.Input({
					width: "90%",
					value: "{" + contextPath + "/value}",
					visible: isVisible,
					tooltip: bindingObject.value,
					editable: bindingObject.isEditable,
					change: function (oEvent) {
						bindingObject.isEdited = 2;
						var str = oEvent.getSource().getValue();
						if (!str.replace(/\s/g, "").length) {
							oEvent.getSource().setValue("");
						}
					}
				}).addStyleClass("wbDefaultCustomInputWrapper");
			}
			// oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttribute").length;

			return VBox;
		},

		/**
		 * Method to add delete instance column - Multiple instance creation
		 * @public
		 * @param {sap.ui.model.Model} oCustomTaskModel- Custom model for create new task fragment
		 */
		addDeleteIconInstanceCreationTM: function (that, oCustomTaskModel) {
			var mainVBox;
			try {
				mainVBox = that.getView().byId("ID_INSTANCE_AGGEGRATION_VBOX");
			} catch (e) {
				mainVBox = sap.ui.core.UIComponent.getRouterFor(that).getView("oneapp.incture.workbox.view.CreateTask").byId(
					"ID_INSTANCE_AGGEGRATION_VBOX");
			}
			var tableContent = mainVBox.getItems()[0];
			var isVisible = true;
			if (oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes").length <= 1) {
				isVisible = false;
			}
			var tableItems = tableContent.getAggregation("items");
			for (var i = 0; i < tableItems.length; i++) {
				var itemDelete = new sap.m.Button({
					enabled: isVisible,
					type: "Reject",
					visible: true,
					text: "Remove",
					tooltip: "Delete Instance",
					press: function (oEvent) {
						this.deleteInstanceTM(that, oEvent, oCustomTaskModel);
					}.bind(this)
				}).addStyleClass("wbAdminMGroupsRemoveBtn");
				tableContent.getAggregation("items")[i].addCell(itemDelete);
			}
		},
		/**
		 * Method to add instance row - Multiple instance creation
		 * @public
		 * @param {sap.ui.model.Model} oCustomTaskModel- Custom model for create new task fragment
		 */
		addInstanceTM: function (that, oCustomTaskModel) {
			var templateListOfProcesssAttributes = jQuery.extend(true, {}, oCustomTaskModel.getProperty("/templateListOfProcesssAttributes"));
			var attachmentDto = [];
			for (var j = 0; j < templateListOfProcesssAttributes.customAttributeTemplateDto.length; j++) {
				if (templateListOfProcesssAttributes.customAttributeTemplateDto[j].dataType === "ATTACHMENT") {
					attachmentDto.push(templateListOfProcesssAttributes.customAttributeTemplateDto[j]);
					templateListOfProcesssAttributes.customAttributeTemplateDto.splice(j, 1);
				}
			}

			if (attachmentDto.length) {
				for (var z = 0; z < attachmentDto.length; z++) {
					templateListOfProcesssAttributes.customAttributeTemplateDto.push(attachmentDto[z]);
				}
			}
			var data = oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes");
			data.push(templateListOfProcesssAttributes);
			oCustomTaskModel.refresh();
			this.addDeleteIconInstanceCreationTM(that, oCustomTaskModel);
		},
		/**
		 * Function to upload instances 
		 * @public
		 * @param that reference to App.controller.js
		 * @param {Object} the payload object 
		 * @param {ExtDatePicker} Extended ExtDatePicker function
		 * @param {sap.ui.model.Model} oCustomTaskModel- Custom model for create new task fragment
		 
		 */
		deleteInstanceTM: function (that, oEvent, oCustomTaskModel) {
			// var sPath = oEvent.getSource()._getBindingContext("oCustomTaskModel").getPath();
			// var index = sPath.split("/")[3];
			// oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes").splice(index * 1, 1);
			// oCustomTaskModel.refresh();
			// this.addDeleteIconInstanceCreationTM(that, oCustomTaskModel);
			oCustomTaskModel.setProperty("/enableBusyIndicators", true);
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var index = sPath.slice("/customInstance/listOfProcesssAttributes/".length);
			oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes").splice(index * 1, 1);
			oCustomTaskModel.refresh();
			this.addDeleteIconInstanceCreationTM(that, oCustomTaskModel);
			oCustomTaskModel.setProperty("/enableBusyIndicators", false);
		},

		/**
		 * Function to add ResourceList to the multi dropdown
		 * @public
		 * @param {sap.ui.base.Event} oEvent of triggering action
		 * @param {sap.ui.model.Model} oCustomTaskModel- Custom model for create new task fragment
		 */
		addResourceList: function (oEvent, bindingPath, oCustomTaskModel, dropDownType) {
			var aSelectedItems = oEvent.getParameter("selectedItems");
			var valueList = [];
			valueList = jQuery.extend(true, [], valueList);
			var tempObject = {};
			for (var i = 0; i < aSelectedItems.length; i++) {
				tempObject = jQuery.extend(true, {}, tempObject);
				tempObject = {
					"type": "individual",
					"id": aSelectedItems[i].getKey()
				};
				if (dropDownType.toLowerCase() === "group") {
					tempObject.type = "group";
				} else if (dropDownType.toLowerCase() === "role") {
					tempObject.type = "role";
				}
				valueList.push(tempObject);
			}
			oCustomTaskModel.setProperty(bindingPath + "/valueList", valueList);
		},
		addMultiSelectValues: function (oEvent, bindingPath, oCustomTaskModel) {
			var aSelectedItems = oEvent.getParameter("selectedItems");
			var valueList = [];
			for (var i = 0; i < aSelectedItems.length; i++) {
				valueList.push(aSelectedItems[i].getKey());

			}
			oCustomTaskModel.setProperty(bindingPath + "/value", valueList.join(","));
			if (oCustomTaskModel.getProperty("/selectedProcess") === "ProjectProposalDocumentApproval") {
				oCustomTaskModel.setProperty("/costCenterValue", valueList);
				oCustomTaskModel.refresh(true);
			}
		},

		/**
		 * Function to SAVE or SUBMIT task
		 * @public
		 * @param that reference to App.controller.js
		 * @param {sap.ui.model.odata.type.String} Action type either SAVE or SUBMIT
		 */
		onCreateTaskTM: function (that, actionType) {
			that.oAppModel.setProperty("/enableSubmitButton", false);
			that.oAppModel.setProperty("/enableSaveButton", false);
			that.oAppModel.setProperty("/enableExcelUploadButton", false);
			var oCustomTaskModel = that.getModel("oCustomTaskModel");
			oCustomTaskModel.setProperty("/customInstance/actionType", actionType);
			oCustomTaskModel.setProperty("/customInstance/isEdited", 2);
			if (that.oAppModel.getProperty("/draftEventId")) {
				oCustomTaskModel.setProperty("/customInstance/processId", that.oAppModel.getProperty("/draftProcessId"));
			}
			var processCount = oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes");
			if (oCustomTaskModel.getProperty("/customInstance").type === "Single Instance") {
				var customData = processCount[0].customAttributeTemplateDto;
				for (var z = 0; z < customData.length; z++) {
					if (customData[z].key === "dummy" || customData[z].key === "dummy1" || customData[z].key === "dummy2") {
						customData.splice(z, 1);
					}
				}
			} else {
				var sbusyIndicatorValue = oCustomTaskModel.getProperty("/busyIndicatorValue");
				var processLength = oCustomTaskModel.getData().customInstance.listOfProcesssAttributes.length;
				var incrementalValue = Math.ceil(200 / (processLength * 0.33));
				if (processLength > 20 && incrementalValue <= 90) {
					oCustomTaskModel.setProperty("/busyBarIndicator", true);
					var myVar = setInterval(function () {
						sbusyIndicatorValue = sbusyIndicatorValue + incrementalValue;
						if (sbusyIndicatorValue <= 90) {
							oCustomTaskModel.setProperty("/busyIndicatorValue", sbusyIndicatorValue);
						}
					}, 2000);
				}
			}
			oCustomTaskModel.setProperty("/customInstance/listOfProcesssAttributes", processCount);
			var payload = oCustomTaskModel.getProperty("/customInstance");
			oCustomTaskModel.setProperty("/enableBusyIndicators", true);
			that.doAjax("/WorkboxJavaService/tasks/createTasks", "POST", payload, function (oData) {
				that._showToastMessage(oData.message);
				oCustomTaskModel.setProperty("/busyIndicatorValue", 100);
				clearInterval(myVar);
				if (oData.status !== "FAILURE") {
					that.oAppModel.setProperty("/inboxName", "");
					if (actionType === "Submit" || actionType === "SecondSubmit") {
						that.setCurrentPage("CreatedTasks", "CreatedTasks", "Created Tasks", false);
						that.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", "CreatedTasks");

					} else if (actionType === "Save" || actionType === "SecondSave") {
						that.setCurrentPage("Draft", "Draft", "Draft", false);
						that.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", "Draft");

					}
					that._doNavigate("UnifiedInbox", {});
					that.oAppModel.setProperty("/draftEventId", "");
					that.oAppModel.setProperty("/draftProcessId", "");
					var customTask = {
						"selectedProcess": "",
						"enableVBoxContent": false,
						"singleInstance": false,
						"multipleInstance": false
					};
					oCustomTaskModel.setData(customTask);
				} else {
					that.oAppModel.setProperty("/enableExcelUploadButton", true);
					that.oAppModel.setProperty("/enableSaveButton", true);
					that.oAppModel.setProperty("/enableSubmitButton", true);
				}
				oCustomTaskModel.setProperty("/enableBusyIndicators", false);
				oCustomTaskModel.setProperty("/busyBarIndicator", false);
				oCustomTaskModel.setProperty("/busyIndicatorValue", 0);
			}.bind(this), function (oEvent) {}.bind(this));
		},
		/**
		 * Function to validate for missing description before SAVE or SUBMIT task
		 * @public
		 * @param {sap.ui.model.odata.type.String} Action type either SAVE or SUBMIT
		 * @param {sap.ui.model.Model}  oCustomTaskModel- Custom model for create new task fragment
		 * @returns {sap.ui.model.odata.type.Boolean} whether missing value true or false
		 */
		validateMandatoryFieldTM: function (actionType, oCustomTaskModel) {
			/*that.oAppModel.setProperty("/enableSubmitButton", false);
					that.oAppModel.setProperty("/enableSaveButton", false);
					that.oAppModel.setProperty("/enableExcelUploadButton", false);*/
			var missingMandatoryField = false;
			var templateDto = oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes");

			for (var i = 0; i < templateDto.length; i++) {
				if (missingMandatoryField === true) {
					break;
				}
				var customAttributeTemplate = templateDto[i].customAttributeTemplateDto;
				if (actionType === "Save" || actionType === "SecondSave") {
					for (var j = 0; j < customAttributeTemplate.length; j++) {
						if (customAttributeTemplate[j].key === "description" && customAttributeTemplate[j].value === "") {
							missingMandatoryField = true;
							break;
						}
					}
				} else {
					for (var j = 0; j < customAttributeTemplate.length; j++) {
						if (customAttributeTemplate[j].processName !== "STANDARD" && customAttributeTemplate[j].isMandatory) {
							if (customAttributeTemplate[j].dataType === "DROPDOWN" && customAttributeTemplate[j].isRunTime) {
								if (!customAttributeTemplate[j].valueList.length) {
									missingMandatoryField = true;
									break;
								}
							} else if (!customAttributeTemplate[j].value && customAttributeTemplate[j].dataType.toLowerCase() !== "attachment") {
								missingMandatoryField = true;
								break;
							} else if (!customAttributeTemplate[j].attachmentType && customAttributeTemplate[j].dataType.toLowerCase() === "attachment") {
								missingMandatoryField = true;
								break;
							}
						} else {
							if (customAttributeTemplate[j].key === "description" && !customAttributeTemplate[j].value) {
								missingMandatoryField = true;
								break;
							}
						}
						/*if ((customAttributeTemplate[j].key === "description" && customAttributeTemplate[j].value === "") || (customAttributeTemplate[j].processName !==
								"STANDARD" && customAttributeTemplate[j].isMandatory && (customAttributeTemplate[j].value === "" && customAttributeTemplate[j].valueList
									.length === 0))) {

							missingMandatoryField = true;
							break;
						}*/
					}
				}
			}
			return missingMandatoryField;
		},

		onClickClearTM: function (oCustomTaskModel) {
			var templateDto = oCustomTaskModel.getProperty("/customInstance/listOfProcesssAttributes");
			// for (var i = 0; i < templateDto.length; i++) {
			templateDto = templateDto.slice(0, 1);
			var customAttributeTemplate = templateDto[0].customAttributeTemplateDto;
			for (var j = 0; j < customAttributeTemplate.length; j++) {
				if (customAttributeTemplate[j].key !== "requestId" || customAttributeTemplate[j].key !== "createdAt" || customAttributeTemplate[j].key !==
					"startedBy" || customAttributeTemplate[j].key !==
					"status") {
					customAttributeTemplate[j].value = "";
					if (customAttributeTemplate[j].dataType === "DROPDOWN") {
						customAttributeTemplate[j].valueList = null;
					}
				}
			}
			// }
			oCustomTaskModel.setProperty("/customInstance/listOfProcesssAttributes", templateDto);
		},
		/**
		 * Function to convert uploaded image to base64 format and bind to the model
		 * @public
		 * @param {sap.ui.base.Event} oEvent of triggering action
		 * @param {sap.ui.model.Model} oCustomTaskModel- Custom model for create new task fragment
		 */
		handleImageUploadInstanceCreation: function (oEvent, bindingPath, oCustomTaskModel) {
			oEvent.getSource().getParent().getItems()[2].setVisible(true);
			var uploadedFile = oEvent.getParameter("files")[0]; //"sample.pdf"
			var reader = new FileReader();
			var attachment = {
				"fileType": oEvent.getParameter("files")[0].name.split(".")[1],
				"fileName": oEvent.getParameter("files")[0].name.split(".")[0],
				"attachmentSize": uploadedFile.size,
				"base64UploadFile": "",
				"bindingPath": bindingPath
			};

			reader.onload = function (oEvt) {
				// var oCustomTaskModel = that.getModel("oCustomTaskModel");
				var attachedImage = this;
				attachedImage.base64UploadFile = oEvt.target.result;
				oCustomTaskModel.setProperty(attachedImage.bindingPath + "/value", attachedImage.base64UploadFile.split(",")[1]); //In base64 format
				oCustomTaskModel.setProperty(attachedImage.bindingPath + "/attachmentType", "application/" + attachedImage.fileType);
				oCustomTaskModel.setProperty(attachedImage.bindingPath + "/attachmentName", attachedImage.fileName);
				oCustomTaskModel.setProperty(attachedImage.bindingPath + "/attachmentSize", attachedImage.attachmentSize);
				oCustomTaskModel.setProperty(attachedImage.bindingPath + "/isEdited", 2);
				oCustomTaskModel.setProperty("/customInstance/isEdited", 2);
				oCustomTaskModel.refresh();
			}.bind(attachment);
			reader.readAsDataURL(uploadedFile);
		},

		/**
		 * Function to delete uploaded image  and unbind the properties from the model
		 * @public
		 * @param {sap.ui.base.Event} oEvent of triggering action
		 * @param {sap.ui.model.Model} oCustomTaskModel- Custom model for create new task fragment
		 */
		deleteUploadedImage: function (oEvent, oCustomTaskModel) {
			// var oCustomTaskModel = this.getModel("oCustomTaskModel");
			var bindingPath = oEvent.getSource()._getPropertiesToPropagate().oBindingContexts.oCustomTaskModel.getPath();
			oCustomTaskModel.setProperty(bindingPath + "/value", "");
			oCustomTaskModel.setProperty(bindingPath + "/attachmentType", "");
			oCustomTaskModel.setProperty(bindingPath + "/attachmentSize", "");
			oCustomTaskModel.setProperty(bindingPath + "/attachmentName", "");
			oEvent.getSource().getParent().getItems()[0].clear(); //Clear the file uploader
			oEvent.getSource().getParent().getItems()[2].setVisible(false); //Set visible for delete icon
			oCustomTaskModel.refresh();

		},
		// <----------------------------------------- START - EXCEL UPLOAD Methods------------------------------------------------>
		/**
		 * Function to bind converted data from excel uploader to the oCustomTaskModel
		 * @public
		 * @param that reference to App.controller.js
		 * @param {sap.ui.base.Event} oEvent of triggering action
		 * @param {ExtDatePicker} Extended ExtDatePicker function
		 */
		/*****excel upload old function---- start*****/
		uploadInstaceExcelTM: function (that, oEvent, ExtDatePicker, oCustomTaskModel) {
			oCustomTaskModel.setProperty("/enableBusyIndicators", true);
			var isRowObject = true;
			var isSheetToJson = false;
			var sheetName = "";
			that.uploadExcel(oEvent, function (resultSet) {
				// var oCustomTaskModel = that.getModel("oCustomTaskModel");
				var rowObject = resultSet.rowObject;
				if (rowObject.length > 0) {
					var listOfProcesssAttributes = [];
					var clonedObject = oCustomTaskModel.getProperty("/templateListOfProcesssAttributes");
					var flag = 0,
						i, j, k, tempObject, customAttributeTemplateDto, formattedDate, date, dataType; // to check matching labels, if no labels match the value remains 0 else 1
					var keys = Object.keys(rowObject[0]);

					if (oCustomTaskModel.getProperty("/excelDataHeaderOrientation") === "col") { //add instances col wise
						tempObject = jQuery.extend(true, {}, clonedObject);
						customAttributeTemplateDto = clonedObject.customAttributeTemplateDto;
						for (j = 0; j < customAttributeTemplateDto.length; j++) {
							for (k = 0; k < rowObject.length; k++) {

								if (rowObject[k][keys[0]] && customAttributeTemplateDto[j].label.toLowerCase().trim() === rowObject[k][keys[0]].toString().toLowerCase()
									.trim()) {
									dataType = customAttributeTemplateDto[j].dataType.toLowerCase().trim();
									flag = 1;
									if (dataType === "date") {
										date = new Date(rowObject[k][keys[1]]);
										formattedDate = date.getDate() + " " + date.toLocaleString("en-us", {
											month: "short"
										}) + " " + date.getFullYear();
										tempObject.customAttributeTemplateDto[j].value = formattedDate;

									}
									if (dataType === "input" || dataType === "input numeric" ||
										dataType === "text area" || dataType === "dropdown") {
										tempObject.customAttributeTemplateDto[j].value = rowObject[k][keys[1]];
									}
								}
							}

						}
						listOfProcesssAttributes.push(tempObject);
					} else { //add instances row wise
						for (i = 0; i < rowObject.length; i++) {
							var values = Object.values(rowObject[i]);
							tempObject = jQuery.extend(true, {}, clonedObject);
							customAttributeTemplateDto = clonedObject.customAttributeTemplateDto;
							for (j = 0; j < customAttributeTemplateDto.length; j++) {
								for (k = 0; k < keys.length; k++) {
									if (customAttributeTemplateDto[j].label.toLowerCase().trim() === keys[k].toString().toLowerCase().trim()) {
										dataType = customAttributeTemplateDto[j].dataType.toLowerCase().trim();
										flag = 1;
										if (dataType === "date") {
											date = new Date(values[k]);
											formattedDate = date.getDate() + " " + date.toLocaleString("en-us", {
												month: "short"
											}) + " " + date.getFullYear();
											tempObject.customAttributeTemplateDto[j].value = formattedDate;

										}
										if (dataType === "input" || dataType === "input numeric" ||
											dataType === "text area" || dataType === "dropdown") {
											tempObject.customAttributeTemplateDto[j].value = values[k];
										}

									}
									// For NOVO NORDISK POC
									if (customAttributeTemplateDto[j].label.toLowerCase() ===
										"description" && oCustomTaskModel.getProperty("/selectedProcess").includes("Novo")) {
										tempObject.customAttributeTemplateDto[j].value = rowObject[i]["Description of a Task"];
									}
								}
							}

							listOfProcesssAttributes.push(tempObject);
							if (oCustomTaskModel.getProperty("/customInstance/type") === "Single Instance") {
								break;
							}
						}
					}
					if (flag === 1) { // if any label matched
						oCustomTaskModel.setProperty("/customInstance/listOfProcesssAttributes",
							listOfProcesssAttributes);
						oCustomTaskModel.refresh();
						if (oCustomTaskModel.getProperty("/customInstance/type") === "Multiple Instance") {
							this.addDeleteIconInstanceCreationTM(sap.ui.core.UIComponent.getRouterFor(that).getView(
								"oneapp.incture.workbox.view.CreateTask"), oCustomTaskModel);
						}
					} else {
						that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("INVALID_EXCEL"));
					}

				} else {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("NO_DATA_FETCH_MSG"));

				}
				oCustomTaskModel.setProperty("/enableBusyIndicators", false);
			}.bind(this), sheetName, isRowObject, isSheetToJson);

		},
		/*****excel upload old function---- end*****/
		/*****custom excel upload---- start*****/
		uploadInstaceExcelCustomTM: function (that, oEvent, ExtDatePicker, oCustomTaskModel) {
			// oCustomTaskModel.setProperty("/enableBusyIndicators", true);
			// Only need the workbook data here
			// sending rowObject and sheetToJson to false , hence wont receive the two objects and amplify performance - arpita
			var isRowObject = false;
			var isSheetToJson = false;
			var sheetName = "";
			that.uploadExcel(oEvent, function (resultSet) {
				oCustomTaskModel.setProperty("/excelData", resultSet.workbook);
				// oCustomTaskModel.setProperty("/XLSX", XLSX);
				oCustomTaskModel.setProperty("/excelData/header", 1);
				oCustomTaskModel.setProperty("/excelUploadSelectedIndex", 0);
				oCustomTaskModel.setProperty("/excelData/startRange", 2);
				oCustomTaskModel.setProperty("/excelData/endRange", 3);
				oCustomTaskModel.setProperty("/excelDataHeaderOrientation", "row");
				oCustomTaskModel.setProperty("/selectedWorksheet", "");
				oCustomTaskModel.refresh();
				if (!that._oCustomInputExcel) {
					that._oCustomInputExcel = that._createFragment("ID_EXCEL_CUSTOMIZING", "oneapp.incture.workbox.fragment.ExcelUploadCustomInput",
						that);
					that.getView().addDependent(that._oCustomInputExcel);
				}
				that._oCustomInputExcel.open();
				// oCustomTaskModel.setProperty("/enableBusyIndicators", false);
			}, sheetName, isRowObject, isSheetToJson);
			// }.bind(this));

		},
		uploadExcelWorksheetChangeTM: function (oEvent, oCustomTaskModel, that) {
			var sPath = oEvent.getSource().getSelectedItem().getBindingContext("oCustomTaskModel").getPath();
			var oSelectedWorksheet = oCustomTaskModel.getProperty(sPath).name;
			var oSelectedWorksheetIndex = parseInt(sPath.split("/")[4],
				10);
			oCustomTaskModel.setProperty("/selectedWorksheet", oSelectedWorksheet);
			// oCustomTaskModel.setProperty("/selectedWorksheetItem", oEvent.getSource().getSelectedItem());
			oCustomTaskModel.setProperty("/selectedWorksheetIndex", oSelectedWorksheetIndex);
			if (oCustomTaskModel.getProperty("/excelDataHeaderOrientation") === "col") {

				oCustomTaskModel.setProperty("/excelData/header", "A");
				oCustomTaskModel.setProperty("/excelData/startRange", "B");
				if (oCustomTaskModel.getProperty("/singleInstance")) {
					oCustomTaskModel.setProperty("/excelData/endRange", "B");
				} else {
					oCustomTaskModel.setProperty("/excelData/endRange", "C");
				}
			} else {
				oCustomTaskModel.setProperty("/excelData/header", 1);
				oCustomTaskModel.setProperty("/excelData/startRange", 2);
				if (oCustomTaskModel.getProperty("/singleInstance")) {
					oCustomTaskModel.setProperty("/excelData/endRange", 2);
				} else {
					oCustomTaskModel.setProperty("/excelData/endRange", 3);
				}
			}
			// var rowObject = this.fileReadFnTM(oSelectedWorksheetIndex, oCustomTaskModel);
			var workbook = oCustomTaskModel.getProperty("/excelData");
			var isToRowObject = false,
				isSheetToJson = true;
			var resultSet = that.getWorkbookObject(workbook, workbook.SheetNames[oCustomTaskModel.getProperty("/selectedWorksheetIndex")],
				isToRowObject, isSheetToJson); //change
			oCustomTaskModel.setProperty("/RowObject", resultSet.sheetToJson);
			oCustomTaskModel.refresh();
		},
		fileReadFnTM: function (oSelectedWorksheet, oCustomTaskModel) {
			// Not in use
			var workbook = oCustomTaskModel.getProperty("/excelData");
			var XLSX = oCustomTaskModel.getProperty("/XLSX");
			var header = oCustomTaskModel.getProperty("/excelData/header");
			if (oCustomTaskModel.getProperty("/excelDataHeaderOrientation") === "col") {
				header = this.interpretHeader(header);
			} else {
				header--;
			}
			var rowObject = XLSX.utils.sheet_to_row_object_array(
				workbook.Sheets[workbook.SheetNames[oSelectedWorksheet]], {
					header: header,
					// blankRows: false,
					defval: null
				});
			var range = XLSX.utils.decode_range(workbook.Sheets[workbook.SheetNames[oSelectedWorksheet]]['!ref']);
			range.s.c = 0;
			range.s.r = 0;
			var new_range = XLSX.utils.encode_range(range);
			rowObject = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[oSelectedWorksheet]], {
				blankrows: true,
				defval: '',
				range: new_range
			});
			return rowObject;
		},
		interpretHeader: function (header) {
			var alphaCode;
			header = header.trim(); // Change
			for (var i = header.length - 1, value = 0; i >= 0; i--) {
				alphaCode = (header.charCodeAt(header.length - 1 - i) - 65) + 1;
				value += (alphaCode * (Math.pow(26, i)));
			}
			header = value - 1;
			return header;

		},
		onSelectExcelRangeTM: function (oEvent, oCustomTaskModel) {

			if (oEvent.getSource().getSelectedIndex()) {
				oCustomTaskModel.setProperty("/excelDataHeaderOrientation", "col");
				oCustomTaskModel.setProperty("/excelData/header", "A");
				oCustomTaskModel.setProperty("/excelData/startRange", "B");
				if (oCustomTaskModel.getProperty("/singleInstance")) {
					oCustomTaskModel.setProperty("/excelData/endRange", "B");
				} else {
					oCustomTaskModel.setProperty("/excelData/endRange", "C");
				}
			} else {
				oCustomTaskModel.setProperty("/excelDataHeaderOrientation", "row");
				oCustomTaskModel.setProperty("/excelData/header", 1);
				oCustomTaskModel.setProperty("/excelData/startRange", 2);
				if (oCustomTaskModel.getProperty("/singleInstance")) {
					oCustomTaskModel.setProperty("/excelData/endRange", 2);
				} else {
					oCustomTaskModel.setProperty("/excelData/endRange", 3);
				}
			}
			oCustomTaskModel.refresh();
		},
		onImportSelectedRowTM: function (oCustomTaskModel, that) {
			var header = oCustomTaskModel.getProperty("/excelData/header");
			var endRange = oCustomTaskModel.getProperty("/excelData/endRange");
			var startRange = oCustomTaskModel.getProperty("/excelData/startRange");
			// var oSelectedWorksheet = oCustomTaskModel.getProperty("/selectedWorksheetIndex");
			var workbook = oCustomTaskModel.getProperty("/excelData");
			var isToRowObject = false,
				isSheetToJson = true;
			var resultSet = that.getWorkbookObject(workbook, workbook.SheetNames[oCustomTaskModel.getProperty("/selectedWorksheetIndex")],
				isToRowObject, isSheetToJson); //change
			oCustomTaskModel.setProperty("/RowObject", resultSet.sheetToJson);
			var rowObject = resultSet.sheetToJson;
			oCustomTaskModel.setProperty("/RowObject", rowObject);
			// var rowObject = oCustomTaskModel.getProperty("/RowObject");
			oCustomTaskModel.setProperty("/enableBusyIndicators", true);
			if (rowObject.length > 0) {
				if (oCustomTaskModel.getProperty("/excelDataHeaderOrientation") === "col") {
					header = this.interpretHeader(header);
					startRange = this.interpretHeader(startRange);
					endRange = this.interpretHeader(endRange);
				}
				if ((header > startRange && header < endRange) || header >= endRange || header >= startRange) {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("HEADER_COL_VAL_COL_ISSUE"));
					oCustomTaskModel.setProperty("/enableBusyIndicators", false);
					return;
				} else if (endRange < startRange) {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("RANGE_ISSUE"));
					oCustomTaskModel.setProperty("/enableBusyIndicators", false);
					return;
				} else if (endRange - startRange > 100) {
					that._showToastMessage("Maximum 100 Tasks can be created at a time");
					oCustomTaskModel.setProperty("/enableBusyIndicators", false);
					return;
				}
				var listOfProcesssAttributes = [];
				var clonedObject = oCustomTaskModel.getProperty("/templateListOfProcesssAttributes");
				var flag = 0,
					i, j, k, tempObject, customAttributeTemplateDto, formattedDate, date, dataType; // to check matching labels, if no labels match the value remains 0 else 1
				var keys = Object.keys(rowObject[0]);
				if (header > 1)
					keys = Object.values(rowObject[header - 2]);
				if (oCustomTaskModel.getProperty("/excelDataHeaderOrientation") === "col") {
					//add instances col wise
					tempObject = jQuery.extend(true, {}, clonedObject);
					customAttributeTemplateDto = clonedObject.customAttributeTemplateDto;
					for (var m = startRange; m <= endRange; m++) {
						tempObject = jQuery.extend(true, {}, clonedObject);
						for (j = 0; j < customAttributeTemplateDto.length; j++) {
							for (k = 0; k < rowObject.length; k++) {
								// keys[0]= header
								if (Object.values(rowObject[k])[header] && customAttributeTemplateDto[j].label.toLowerCase().trim() === Object.values(rowObject[
										k])[header].toString().toLowerCase().trim()) {
									dataType = customAttributeTemplateDto[j].dataType.toLowerCase().trim();
									flag = 1;
									if (dataType === "date" || dataType === "datetype") {
										date = new Date(Object.values(rowObject[k])[m]);
										formattedDate = date.getDate() + " " + date.toLocaleString("en-us", {
											month: "short"
										}) + " " + date.getFullYear();
										tempObject.customAttributeTemplateDto[j].value = formattedDate;

									}
									if (dataType === "input" || dataType === "input numeric" ||dataType === "input numeric-calculate"||
										dataType === "text area" || dataType === "dropdown") {
										tempObject.customAttributeTemplateDto[j].value = Object.values(rowObject[k])[m];
									}
								}
							}
						}
						listOfProcesssAttributes.push(tempObject);
					}
				} else { //add instances row wise
					// startRange -= parseInt(oCustomTaskModel.getProperty("/excelData/header"), 10);
					// endRange -= parseInt(oCustomTaskModel.getProperty("/excelData/header"), 10);
					startRange--;
					endRange--;
					rowObject = rowObject.slice(startRange - 1, endRange);
					oCustomTaskModel.setProperty("/busyIndicatorValue", 0);
					var sbusyIndicatorValue = oCustomTaskModel.getProperty("/busyIndicatorValue");
					var processLength = rowObject.length;
					var incrementalValue = Math.ceil(400 / (processLength * 0.134));
					if (processLength > 20 && incrementalValue <= 90) {
						oCustomTaskModel.setProperty("/ProgressbarAction", "Uploading");
						oCustomTaskModel.setProperty("/busyBarIndicator", true);
						var myVar = setInterval(function () {
							sbusyIndicatorValue = sbusyIndicatorValue + incrementalValue;
							if (sbusyIndicatorValue <= 90) {
								oCustomTaskModel.setProperty("/busyIndicatorValue", sbusyIndicatorValue);
							} else {
								oCustomTaskModel.setProperty("/busyIndicatorValue", 0);
								oCustomTaskModel.setProperty("/busyBarIndicator", false);
								clearInterval(myVar);
							}
						}, 4);
					}
					for (i = 0; i < rowObject.length; i++) {
						var values = Object.values(rowObject[i]);
						tempObject = jQuery.extend(true, {}, clonedObject);
						customAttributeTemplateDto = clonedObject.customAttributeTemplateDto;
						for (j = 0; j < customAttributeTemplateDto.length; j++) {
							for (k = 0; k < keys.length; k++) {
								if (customAttributeTemplateDto[j].label.toLowerCase().trim() === keys[k].toString().toLowerCase().trim()) {
									dataType = customAttributeTemplateDto[j].dataType.toLowerCase().trim();
									flag = 1;
									if (dataType === "date" || dataType === "datetype") {
										date = new Date(values[k]);
										formattedDate = date.getDate() + " " + date.toLocaleString("en-us", {
											month: "short"
										}) + " " + date.getFullYear();
										tempObject.customAttributeTemplateDto[j].value = formattedDate;

									}
									if (dataType === "input" || dataType === "input numeric" ||dataType === "input numeric-calculate"||
										dataType === "text area" || dataType === "dropdown") {
										tempObject.customAttributeTemplateDto[j].value = values[k];
									}

								}
								// For NOVO NORDISK POC
								if (customAttributeTemplateDto[j].label.toLowerCase() ===
									"description" && oCustomTaskModel.getProperty("/selectedProcess").includes("Novo")) {
									tempObject.customAttributeTemplateDto[j].value = rowObject[i]["Description of a Task"];
								}
							}
						}

						listOfProcesssAttributes.push(tempObject);
						if (oCustomTaskModel.getProperty("/customInstance/type") === "Single Instance") {
							break;
						}
					}
				}
				if (flag === 1) { // if any label matched
					oCustomTaskModel.setProperty("/customInstance/listOfProcesssAttributes",
						listOfProcesssAttributes);
					oCustomTaskModel.refresh();
					if (oCustomTaskModel.getProperty("/customInstance/type") === "Multiple Instance") {
						this.addDeleteIconInstanceCreationTM(sap.ui.core.UIComponent.getRouterFor(that).getView(
							"oneapp.incture.workbox.view.CreateTask"), oCustomTaskModel);
					}

				} else {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("INVALID_EXCEL"));
				}

			} else {
				that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("NO_DATA_FETCH_MSG"));

			}
			oCustomTaskModel.setProperty("/enableBusyIndicators", false);
		},
		changeInRangeTM: function (oEvent, oCustomTaskModel) {
			var startRange = oCustomTaskModel.getProperty("/excelData/startRange");
			var endRange = oCustomTaskModel.getProperty("/excelData/endRange");
			if (oCustomTaskModel.getProperty("/singleInstance")) {
				oCustomTaskModel.setProperty("/excelData/endRange", startRange);
			} else {
				oCustomTaskModel.setProperty("/excelData/endRange", endRange);
			}
		},
		/*****custom excel upload---- end*****/

		// <----------------------------------------- END - EXCEL UPLOAD Methods------------------------------------------------>	

		// <----------------------------------------- END - CREATE NEW TASK FRAGMENT Methods------------------------------------------------>

		/*****Development by Vaishnavi - start*****/

		/****** Admin Console (TaskManagement) - start ******/

		/****** Admin Console (Create workflow) - start ******/

		//initialising the create workflow with default data (null)
		getWorkFlowDataTM: function (that, oDefaultDataModel) {
			//calling the timer function
			this.settingTimer(that, oDefaultDataModel);
			var tmThis = this;

			if (!oDefaultDataModel.getProperty("/setEnabled")) {
				var processName = oDefaultDataModel.getProperty("/manageProcessName");
				var origin = oDefaultDataModel.getProperty("/manageProcessOrigin");
				var url = "/WorkboxJavaService/customProcess/getAttributes/";
				url = url + processName + "?processType=" + origin;
				that.doAjax(url, "GET", null, function (oData) {
					oDefaultDataModel.setProperty("/createWorkFlowData", oData);
					oDefaultDataModel.setProperty("/CustomAddButtonStatus", true);
					oDefaultDataModel.setProperty("/customDeleteButtonStatus", true);
					oDefaultDataModel.setProperty("/TaskDeleteButtonStatus", true);
					tmThis.fetchExistingAttributeTM(that, oDefaultDataModel);
					tmThis.generateTaskTemplateDropdown(oDefaultDataModel);
					tmThis.fetchExistingAttributeTM(that, oDefaultDataModel);
					var items = oDefaultDataModel.getProperty("/TaskTemplateDropdownDetails");
					var dropdownData = jQuery.extend(true, [], items);
					var templateId = that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").getSelectedKey();
					for (var i = 0; i < dropdownData.length; i++) {
						if (dropdownData[i].key === templateId || dropdownData[i].isEdited === 3) {
							dropdownData.splice(i, 1);
						}
					}
					var tempData = oDefaultDataModel.getProperty("/processLevelAttributes");
					var teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
					for (var j = 0; j < teamDetailDto.length; j++) {
						var subject = teamDetailDto[j].subject;
						var desc = teamDetailDto[j].description;
						for (var i = 0; i < tempData.length; i++) {
							if (subject.search(tempData[i].key) >= 0) {
								teamDetailDto[j].subject = subject.replace(("${" + tempData[i].key + "}"), ("{" + tempData[i].label +
									"}"));
								subject = teamDetailDto[j].subject;
							}
							if (desc.search(tempData[i].key) >= 0) {
								teamDetailDto[j].description = desc.replace(("${" + tempData[i].key + "}"), ("{" + tempData[i].label +
									"}"));
								desc = teamDetailDto[j].description;
							}
						}
						if (templateId === teamDetailDto[j].templateId) {
							teamDetailDto[j].sourceDropdown = dropdownData;
						}

						var operatorAttributes;
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
						operatorAttributes = tempData.concat(operators);
						var customAttribute = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
						for (var p = 0; p < customAttribute.length; p++) {
							var val = customAttribute[p].attributePath;
							if (val) {
								for (var q = 0; q < operatorAttributes.length; q++) {
									if (val.includes(operatorAttributes[q].key)) {
										if (operatorAttributes[q].label === "+" || operatorAttributes[q].label === "-" || operatorAttributes[q].label === "*" ||
											operatorAttributes[q].label === "/") {
											var tempValues = val.replace((" '" + operatorAttributes[q].label + "' "), (" " + operatorAttributes[q].label +
												" "));
											if (val !== tempValues) {
												q = q - (q + 1);
												val = tempValues;
											}
										} else {
											val = val.replace(("${" + operatorAttributes[q].key + "}"), ("{" +
												operatorAttributes[q].label + "}"));
											q = q - (q + 1);
										}
									}
								}
							}
							customAttribute[p].attributePath = val;
						}
						oDefaultDataModel.setProperty("/processLevelOperatorAttributes", operatorAttributes);
						var values = teamDetailDto[j].customAttributes;
						for (var l = 0; l < values.length; l++) {
							for (var k = 0; k < operatorAttributes.length; k++) {
								if (values[l].attributePath.includes(operatorAttributes[k].key)) {
									if (operatorAttributes[k].label === "+" || operatorAttributes[k].label === "-" || operatorAttributes[k].label === "*" ||
										operatorAttributes[k].label === "/") {
										var tempValues = values[l].attributePath.replace((" '" + operatorAttributes[k].label + "' "), (" " + operatorAttributes[k].label +
											" "));
										if (values[l].attributePath !== tempValues) {
											k = k - (k + 1);
											values[l].attributePath = tempValues;
										}
									} else {
										values[l].attributePath = values[l].attributePath.replace(("${" + operatorAttributes[k].key + "}"), ("{" +
											operatorAttributes[k].label + "}"));
										k = k - (k + 1);
									}
								}
							}
						}
					}
					oDefaultDataModel.refresh(true);
				}.bind(that), function (oError) {}.bind(that));
			} else {
				var data = {
					"processDetail": {
						"criticalDate": "",
						"criticalDateDays": 0,
						"criticalDateHours": 0,
						"description": "",
						"labelName": "",
						"origin": "Ad-hoc",
						"processDisplayName": "",
						"processName": "",
						"processRequestId": "",
						"processType": "Single Instance",
						"sla": "",
						"slaDays": 0,
						"slaHours": 0,
						"subject": "",
						"validForUsage": true,
						"url": ""
					},
					"customAttribute": [{
						"dataType": "INPUT",
						"description": "",
						"isActive": true,
						"isDeleted": false,
						"isVisible": true,
						"isEditable": true,
						"isEdited": 0,
						"isMandatory": true,
						"key": Math.random().toString(20).substr(2, 24),
						"label": "",
						"processName": "",
						"validForUsage": true,
						"isRunTime": false,
						"origin": "Process",
						"copy": false
					}],
					"teamDetailDto": [{
						"processName": "",
						"eventName": "Task 1",
						"templateId": Math.random().toString(20).substr(2, 24),
						"taskType": "Approve/Reject",
						"taskNature": "User Based",
						"individual": [],
						"group": [],
						"runTimeUser": 0,
						"isEdited": 0,
						"customKey": null,
						"customAttributes": [],
						"sourceId": null,
						"targetId": null,
						"subject": "",
						"description": "",
						"url": null,
						"rules": null,
						"customattrTypes": null,
						"sourceDropdown": [{
							"text": "None",
							"key": ""
						}],
						"statusDto": {
							"ready": "Ready",
							"reserved": "Reserved",
							"completed": "Completed",
							"approve": "Approved",
							"resolved": "Resolved",
							"reject": "Rejected",
							"done": "Done"
						}
					}]
				};
				oDefaultDataModel.setProperty("/createWorkFlowData", data);
				oDefaultDataModel.setProperty("/setEnabled", true);
				oDefaultDataModel.setProperty("/mandatorySource", false);
				oDefaultDataModel.setProperty("/manageProcessName", null);
				oDefaultDataModel.setProperty("/manageProcessOrigin", null);
				oDefaultDataModel.setProperty("/CustomAddButtonStatus", false);
				oDefaultDataModel.setProperty("/customDeleteButtonStatus", true);
				oDefaultDataModel.setProperty("/TaskDeleteButtonStatus", true);
				oDefaultDataModel.setProperty("/existingCustomAttributes", []);
				oDefaultDataModel.refresh(true);
			}
		},

		//on selecting the creation type in process detail
		onSelectInstanceTM: function (that, oEvent, oDefaultDataModel) {
			that.changeProperty();
			var processDetail = oDefaultDataModel.getProperty("/createWorkFlowData/processDetail");
			processDetail.processType = oEvent.getSource().getSelectedButton().getText();
			oDefaultDataModel.refresh(true);
		},

		//addding the values of dropdown to the attribute of data type dropdown
		addDropdownValuesTM: function (oEvent, oDefaultDataModel, oAppModel) {
			var obj = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			if (!obj.dropDownValues) {
				obj.dropDownValues = [];
			}
			var add = {
				"valueName": "",
				"value": Math.random().toString(20).substr(2, 24),
				"isEdited": 0
			};
			if (oAppModel.getProperty("/currentViewPage") === "workFlow" || oAppModel.getProperty("/currentViewPage") === "createWorkFlow") {
				add.isEdited = 2;
			}
			obj.dropDownValues.push(add);
			oDefaultDataModel.refresh(true);
		},

		//deletion of dropdown values to the attribute of data type dropdown
		deleteDropdownValuesTM: function (oEvent, oDefaultDataModel, oAppModel) {
			var path = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath();
			var index;
			var data;
			if (path.split("/").length !== 6) {
				index = path.split("/")[7];
				data = oDefaultDataModel.getProperty(path.split("/dropDownValues")[0] + "/dropDownValues");
			} else {
				index = path.split("/")[5];
				data = oDefaultDataModel.getProperty(path.split("/dropDownValues")[0] + "/dropDownValues");
			}

			if (oDefaultDataModel.getProperty("/setEnabled")) {
				data.splice(index, 1);
			} else {
				if (data[index].isEdited === 2) {
					data.splice(index, 1);
				} else {
					if (oAppModel.getProperty("/currentViewPage") === "workFlow" || oAppModel.getProperty("/currentViewPage") === "createWorkFlow") {
						data[index].isEdited = 3;
					}
				}
			}
			oDefaultDataModel.refresh(true);
		},

		//adding the table column to the attribute of data type TABLE
		addTableColumnValuesTM: function (oEvent, oDefaultDataModel, oAppModel) {
			var object = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject();
			var tableColumnArray = object.tableAttributes;
			if (!tableColumnArray) {
				tableColumnArray = [];
			}
			var add = {
				"dataType": "INPUT",
				"description": "",
				"isActive": true,
				"isDeleted": false,
				"isVisible": true,
				"isEditable": true,
				"isEdited": 0,
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
			};
			if (oAppModel.getProperty("/currentViewPage") === "workFlow" || oAppModel.getProperty("/currentViewPage") === "createWorkFlow") {
				add.isEdited = 2;
			}
			tableColumnArray.push(add);
			oDefaultDataModel.refresh(true);
		},

		//deleting the dropdown values to the attribute of data type TABLE
		deleteTableColumnValuesTM: function (oEvent, oDefaultDataModel, oAppModel) {
			var path = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath();
			var index;
			var data;
			if (path.split("/").length === 6) {
				index = path.split("/")[5];
				data = oDefaultDataModel.getProperty(path.split("/tableAttributes")[0] + "/tableAttributes");
			} else {
				index = path.split("/")[7];
				data = oDefaultDataModel.getProperty(path.split("/tableAttributes")[0] + "/tableAttributes");
			}

			if (oDefaultDataModel.getProperty("/setEnabled")) {
				data.splice(index, 1);
			} else {
				if (data[index].isEdited === 2) {
					data.splice(index, 1);
				} else {
					if (oAppModel.getProperty("/currentViewPage") === "workFlow" || oAppModel.getProperty("/currentViewPage") === "createWorkFlow") {
						data[index].isEdited = 3;
					}
					data[index].isDeleted = true;
				}
			}
			oDefaultDataModel.refresh(true);
		},

		//checks the last row's event name, if filled then allows user to add one more task level (row)
		addTaskLevelFnTM: function (that, oDefaultDataModel) {
			that.oAppModel.setProperty("/isChanged", true);
			var add = {
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
			oDefaultDataModel.setProperty("/addTaskObjectSet", add);

			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				add.isEdited = 2;
			}
			if (!that._oAddTaskTemplate) {
				that._oAddTaskTemplate = that._createFragment("oneapp.incture.workbox.fragment.AddTaskTemplate", that);
				that.getView().addDependent(that._oAddTaskTemplate);
			}
			that._oAddTaskTemplate.open();
			oDefaultDataModel.refresh(true);
		},

		//addding the task template to the team detail dto of workflow
		addTaskTemplateFnTM: function (that, oDefaultDataModel) {
			var data;
			var add = oDefaultDataModel.getProperty("/addTaskObjectSet");
			if (that.oAppModel.getProperty("/currentViewPage") === "advancedWorkFlow" || that.oAppModel.getProperty("/currentViewPage") ===
				"createAdvancedWorkFlow") {
				data = oDefaultDataModel.getProperty("/advancedWfData/teamDetailDto");
				var lines = oDefaultDataModel.getProperty("/advancedWfData/mappingLines");
				for (var i = 0; i < lines.length; i++) {
					if (add.sourceId[0] === lines[i].from) {
						lines.splice(i, 1);
					}
				}
			} else {
				data = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			}
			if (add.eventName) {
				data.push(add);
				if (that.oAppModel.getProperty("/currentViewPage") === "createWorkFlow" || that.oAppModel.getProperty("/currentViewPage") ===
					"workFlow") {
					oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto", data);
					oDefaultDataModel.setProperty("/TaskDeleteButtonStatus", true);
					var key = add.templateId;
					var inputValue = add.eventName;
					this.checkTaskNameLabelValueTM(that, inputValue, key, oDefaultDataModel);
					var templateId = add.templateId;
					that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").setSelectedKey(templateId);
					this.generateTaskTemplateDropdown(oDefaultDataModel);
					var items = oDefaultDataModel.getProperty("/TaskTemplateDropdownDetails");
					var dropdownData = jQuery.extend(true, [], items);
					for (var i = 0; i < dropdownData.length; i++) {
						if (dropdownData[i].key === templateId || dropdownData[i].isEdited === 3) {
							dropdownData.splice(i, 1);
						}
					}
					var teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
					for (var j = 0; j < teamDetailDto.length; j++) {
						if (templateId === teamDetailDto[j].templateId) {
							teamDetailDto[j].sourceDropdown = dropdownData;
						}
					}
					oDefaultDataModel.setProperty("/mandatorySource", true);
				} else {
					that.getSourceDropdownDetails();
					that.setMappingLinesFn();
				}
				oDefaultDataModel.refresh(true);
				that._oAddTaskTemplate.close();
			} else {
				that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			}
		},

		//to generate the dropdown details of source and destination for task template
		generateTaskTemplateDropdown: function (oDefaultDataModel) {
			var taskTemplateDetails = [];
			var data = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			for (var i = 0; i < data.length; i++) {
				var obj = {
					"text": data[i].eventName,
					"key": data[i].templateId,
					"isEdited": data[i].isEdited
				};
				taskTemplateDetails.push(obj);
			}
			var defaultObj = {
				"text": "None",
				"key": ""
			};
			taskTemplateDetails.push(defaultObj);
			oDefaultDataModel.setProperty("/TaskTemplateDropdownDetails", taskTemplateDetails);
		},

		//closing of add task fragment
		onCloseAddTaskFragmentTM: function (that, oDefaultDataModel) {
			oDefaultDataModel.setProperty("/addTaskObjectSet", null);
			oDefaultDataModel.refresh(true);
			that._oAddTaskTemplate.close();
		},

		//fetching the existing attributes to show in add existing fragment / rule based task condition
		fetchExistingAttributeTM: function (that, oDefaultDataModel) {
			var processCustomData = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
			var customData = [];
			var processLevelData = [];
			var tableAttributes;
			var obj = {};
			if (!processCustomData) {
				processCustomData = [];
			}
			for (var i = 0; i < processCustomData.length; i++) {
				if (processCustomData[i].label) {
					processLevelData.push(jQuery.extend(true, {}, processCustomData[i]));
					obj = jQuery.extend(true, {}, processCustomData[i]);
					obj.copy = true;
					obj.attributePath = "${" + obj.key + "}";
					obj.origin = "Task";
					obj.taskName = "Process";
					obj.key = Math.random().toString(20).substr(2, 24);
					if (oDefaultDataModel.getProperty("/setEnabled") === false) {
						obj.isEdited = 2;
					}
					customData.push(obj);
				}
				if (processCustomData[i].dataType === "TABLE") {
					if (obj) {
						tableAttributes = obj.tableAttributes;
					}
					if (!tableAttributes) {
						tableAttributes = [];
					}
					for (var k = 0; k < tableAttributes.length; k++) {
						tableAttributes[k].attributePath = "${" + tableAttributes[k].key + "}";
						tableAttributes[k].key = Math.random().toString(20).substr(2, 24);
					}
				}
			}
			oDefaultDataModel.setProperty("/processLevelAttributes", processLevelData);
			var teamDetailDto;
			if (that.oAppModel.getProperty("/currentViewPage") === "workFlow" || that.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			} else {
				teamDetailDto = oDefaultDataModel.getProperty("/advancedWfData/teamDetailDto");
			}

			if (!teamDetailDto) {
				teamDetailDto = [];
			}

			for (var j = 0; j < teamDetailDto.length; j++) {
				var taskCustomData = teamDetailDto[j].customAttributes;
				if (!taskCustomData) {
					taskCustomData = [];
				}
				for (var z = 0; z < taskCustomData.length; z++) {
					if (!taskCustomData[z].copy) {
						if (taskCustomData[z].label) {
							obj = jQuery.extend(true, {}, taskCustomData[z]);
							obj.copy = true;
							obj.attributePath = "${" + obj.key + "}";
							obj.taskName = teamDetailDto[j].eventName;
							obj.key = Math.random().toString(20).substr(2, 24);
							if (oDefaultDataModel.getProperty("/setEnabled") === false) {
								obj.isEdited = 2;
							}
							customData.push(obj);
						}
						if (taskCustomData[z].dataType === "TABLE") {
							tableAttributes = obj.tableAttributes;
							if (!tableAttributes) {
								tableAttributes = [];
							}
							for (var k = 0; k < tableAttributes.length; k++) {
								tableAttributes[k].attributePath = "${" + tableAttributes[k].key + "}";
								tableAttributes[k].key = Math.random().toString(20).substr(2, 24);
							}
						}
					}
				}
			}
			oDefaultDataModel.setProperty("/existingCustomAttributes", customData);
			oDefaultDataModel.setProperty("/attributeCheckBox", false);
			oDefaultDataModel.refresh(true);
		},

		//fetching the attributes for rule based tasks
		//the attributes in process level and the previous tasks attribute data
		fetchRuleTaskAttributeTM: function (that, oDefaultDataModel) {
			var processCustomData = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
			var customData = [];
			var obj;

			if (!processCustomData) {
				processCustomData = [];
			}
			for (var i = 0; i < processCustomData.length; i++) {
				if (processCustomData[i].label) {
					if (processCustomData[i].dataType === "TABLE") {
						var tableAttributes = processCustomData[i].tableAttributes;
						if (!tableAttributes) {
							tableAttributes = [];
						}
						for (var k = 0; k < tableAttributes.length; k++) {
							obj = jQuery.extend(true, {}, tableAttributes[k]);
							obj.taskName = tableAttributes[k].origin;
							customData.push(obj);
						}
					} else {
						obj = jQuery.extend(true, {}, processCustomData[i]);
						obj.taskName = processCustomData[i].origin;
						customData.push(obj);
					}
				}
			}

			var teamDetailDto;
			if (that.oAppModel.getProperty("/currentViewPage") === "workFlow" || that.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
				var templateID = that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").getSelectedKey();

				for (var i = 0; i < teamDetailDto.length; i++) {
					if (templateID === teamDetailDto[i].templateId) {
						var index = i;
						break;
					}
				}
			} else {
				teamDetailDto = oDefaultDataModel.getProperty("/advancedWfData/teamDetailDto");
				index = teamDetailDto.length;
			}

			for (var j = 0; j < teamDetailDto.length; j++) {
				if (j < index) {
					var taskCustomData = teamDetailDto[j].customAttributes;
					if (!taskCustomData) {
						taskCustomData = [];
					}
					for (var z = 0; z < taskCustomData.length; z++) {
						if (taskCustomData[z].label) {
							if (taskCustomData[z].dataType === "TABLE") {
								var tableAttributes = taskCustomData[z].tableAttributes;
								if (!tableAttributes) {
									tableAttributes = [];
								}
								for (var k = 0; k < tableAttributes.length; k++) {
									obj = jQuery.extend(true, {}, tableAttributes[k]);
									obj.taskName = teamDetailDto[j].evemtName;
									customData.push(obj);
								}
							} else {
								obj = jQuery.extend(true, {}, taskCustomData[z]);
								obj.taskName = teamDetailDto[j].eventName;
								customData.push(obj);
							}
						}
					}
				}
			}
			oDefaultDataModel.setProperty("/ruleBasedCustomAttributes", customData);
			oDefaultDataModel.refresh(true);
		},

		//add existing attributes is opened if the user wnats to add existing attributes
		openAddAttributesFragment: function (that) {
			if (!that._oAddExistingAttributes) {
				that._oAddExistingAttributes = that._createFragment("oneapp.incture.workbox.fragment.AddAttributesAC", that);
				that.getView().addDependent(that._oAddExistingAttributes);
			}
			that._oAddExistingAttributes.open();
		},

		//adding the selected attributes to the task template
		addExistingAttributestoTaskTM: function (that, oEvent, oDefaultDataModel) {
			var listItems = sap.ui.getCore().byId("ID_ADD_ATTRIBUTE_LIST").getSelectedContexts();
			var selectedItems = [];
			for (var j = 0; j < listItems.length; j++) {
				selectedItems.push(listItems[j].getObject());
			}

			var teamDetailDto;
			if (that.oAppModel.getProperty("/currentViewPage") === "workFlow" || that.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				var task = that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").getSelectedKey();
				teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
				for (var i = 0; i < teamDetailDto.length; i++) {
					if (task === teamDetailDto[i].templateId) {
						if (!teamDetailDto[i].customAttributes) {
							teamDetailDto[i].customAttributes = [];
						}
						var length = teamDetailDto[i].customAttributes.length;
						if (length) {
							if (!teamDetailDto[i].customAttributes[length - 1].label) {
								teamDetailDto[i].customAttributes.splice(length - 1, 1);
							}
						}
						teamDetailDto[i].customAttributes = teamDetailDto[i].customAttributes.concat(selectedItems);
						break;
					}
				}
				oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", true);
			} else {
				teamDetailDto = oDefaultDataModel.getProperty("/advancedWfActiveTask");
				teamDetailDto.customAttributes = teamDetailDto.customAttributes.concat(selectedItems);
			}
			oDefaultDataModel.refresh(true);
			this.onCloseAddAttributeFragmentTM(that, oDefaultDataModel);
		},

		//closing of add attribute fragment
		onCloseAddAttributeFragmentTM: function (that, oDefaultDataModel) {
			oDefaultDataModel.setProperty("/attributeCheckBox", false);
			sap.ui.getCore().byId("ID_ADD_ATTRIBUTE_LIST").removeSelections();
			that._oAddExistingAttributes.close();
		},

		//adding rule to the selected task
		addRuleToTaskFnTM: function (that, oDefaultDataModel) {
			var templateID = that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").getSelectedKey();
			var taskDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			var data = {};
			for (var i = 0; i < taskDto.length; i++) {
				if (templateID === taskDto[i].templateId) {
					data = taskDto[i];
					break;
				}
			}
			var ruleDto = oDefaultDataModel.getProperty("/setRulesContentDto");
			var rule = ruleDto.ruleDto;
			data.rules = [];
			for (var j = 0; j < rule.length; j++) {
				if (rule[j].custom_key !== "" && rule[j].logic !== "" && rule[j].value !== "") {
					var obj = {
						"ruleId": rule[j].ruleId,
						"ruleTypeId": templateID,
						"custom_key": rule[j].custom_key,
						"condition": rule[j].logic + "'" + rule[j].value + "'",
						"destination": rule[j].destination,
						"attributeName": rule[j].attributeName,
						"logic": rule[j].logic,
						"value": rule[j].value,
						"operator": ""
					};
					data.rules.push(obj);
				}
			}

			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (data.isEdited !== 2) {
					data.isEdited = 1;
				}
			}
			oDefaultDataModel.refresh(true);
		},

		//adding row of rule dto to task
		addRuleRowsFnTM: function (that, oDefaultDataModel) {
			var templateID = that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").getSelectedKey();
			var taskDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			var data = {};
			for (var i = 0; i < taskDto.length; i++) {
				if (templateID === taskDto[i].templateId) {
					data = taskDto[i];
					break;
				}
			}
			var ruleDto = oDefaultDataModel.getProperty("/setRulesContentDto/ruleDto");
			var add = {
				"destination": "",
				"condition": "",
				"attribute": "",
				"logic": "",
				"value": "",
				"attributeName": "",
				"ruleId": Math.random().toString(20).substr(2, 24)
			};
			ruleDto.push(add);
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (data.isEdited !== 2) {
					data.isEdited = 1;
				}
			}
			oDefaultDataModel.refresh(true);
		},

		//deletion of rows in rule dto
		deleteRuleRowsFnTM: function (oEvent, that, oDefaultDataModel) {
			var templateID = that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").getSelectedKey();
			var taskDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			var data = {};
			for (var i = 0; i < taskDto.length; i++) {
				if (templateID === taskDto[i].templateId) {
					data = taskDto[i];
					break;
				}
			}
			var ruleDto = oDefaultDataModel.getProperty("/setRulesContentDto/ruleDto");
			var index = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath().split("/")[3];
			ruleDto.splice(index, 1);
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (data.isEdited !== 2) {
					data.isEdited = 1;
				}
			}
			oDefaultDataModel.refresh(true);
		},

		//adding task level custom attributes function
		addTaskCustomAttributesFnTM: function (oEvent, oDefaultDataModel, that) {
			var custom;
			if (that.oAppModel.getProperty("/currentViewPage") === "workFlow" || that.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				var path = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath();
				custom = oDefaultDataModel.getProperty(path).customAttributes;
			} else {
				custom = oDefaultDataModel.getProperty("/advancedWfActiveTask").customAttributes;
			}
			if (!custom) {
				custom = [];
			}
			var add = {
				"label": "",
				"key": Math.random().toString(20).substr(2, 24),
				"dataType": "INPUT",
				"isMandatory": true,
				"isActive": true,
				"isDeleted": false,
				"isVisible": true,
				"isEditable": true,
				"description": "",
				"isEdited": 0,
				"processName": "",
				"isRunTime": false,
				"attributePath": "",
				"validForUsage": null,
				"origin": "Task",
				"copy": false
			};
			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				add.isEdited = 2;
			}
			custom.push(add);
			if (that.oAppModel.getProperty("/currentViewPage") === "workFlow" || that.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				oDefaultDataModel.setProperty(path + "/customAttributes", custom);
				oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", false);
			}
			oDefaultDataModel.refresh(true);
		},

		//deleting task level custom attributes function
		deleteTaskCustomAttributeFnTM: function (oEvent, oDefaultDataModel, that) {
			var path = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath();
			var index = path.split("/")[5];
			var customPath = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath().split("/customAttributes")[0] +
				"/customAttributes";
			var custom = oDefaultDataModel.getProperty(customPath);
			if (that.oAppModel.getProperty("/currentViewPage") === "workFlow" || that.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				var data = oDefaultDataModel.getProperty(oEvent.getSource().getBindingContext("oDefaultDataModel").getPath().split(
					"/customAttributes")[0]);
				if (oDefaultDataModel.getProperty("/setEnabled")) {
					if (custom[index].isRunTime) {
						if (custom[index].key === data.customKey) {
							data.runTimeUser = 0;
							data.customKey = null;
						}
					}
					custom.splice(index, 1);
				} else {
					oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().isDeleted = true;
					if (custom[index].key === data.customKey) {
						data.runTimeUser = 0;
						data.customKey = null;
						if (data.isEdited !== 2) {
							data.isEdited = 4;
						}
					}
					if (oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().isEdited === 2) {
						custom.splice(index, 1);
					} else {
						oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().isEdited = 1;
					}
				}
				if (!custom.length) {
					oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", true);
				}
			} else {
				custom.splice(index, 1);
			}
			oDefaultDataModel.refresh(true);
		},

		//delete the selected row if more than 1 row is present else clear the data in that row and
		// if runtimeuser is enabled then corresponding custom attribute is also deleted
		deleteTaskLevelFnTM: function (oEvent, that, oDefaultDataModel) {
			var obj = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath();
			var templateId = oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().templateId;
			var res = obj.split("/");
			var index = res[3];
			var data;
			if (that.oAppModel.getProperty("/currentViewPage") === "workFlow" || that.oAppModel
				.getProperty("/currentViewPage") === "createWorkFlow") {
				data = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			} else {
				data = oDefaultDataModel.getProperty("/advancedWfData/teamDetailDto");
			}

			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (data[index].isEdited === 2) {
					data.splice(index, 1);
				} else {
					data[index].isEdited = 3;
				}
			} else {
				data.splice(index, 1);
			}

			if (!data.length) {
				var add = {
					"processName": "",
					"eventName": "Task 1",
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
				add.sourceDropdown = [{
					"text": "None",
					"key": ""
				}];
				if (oDefaultDataModel.getProperty("/setEnabled") === false) {
					add.isEdited = 2;
				}
				data.push(add);
				oDefaultDataModel.setProperty("/TaskCustomAddButtonStatus", true);
			}

			if (that.oAppModel.getProperty("/currentViewPage") === "advancedWorkFlow" || that.oAppModel
				.getProperty("/currentViewPage") === "createAdvancedWorkFlow") {
				for (var i = 0; i < data.length; i++) {
					if (data[i].templateId !== "startTask" && data[i].templateId !== "endTask") {
						var source = data[i].sourceId;
						var target = data[i].targetId;
						for (var j = 0; j < source.length; j++) {
							if (templateId === source[j]) {
								source.splice(j, 1);
							}
						}
						for (var k = 0; k < target.length; k++) {
							if (templateId === target[k]) {
								target.splice(k, 1);
							}
						}
					}
				}
				that.setWfActiveTaskData();
				that.setMappingLinesFn();
				that.getSourceDropdownDetails();
			}

			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				var count = 0;
				for (var i = 0; i < data.length; i++) {
					if (data[i].isEdited !== 3) {
						count++;
					}
				}
				if (count === 1) {
					oDefaultDataModel.setProperty("/mandatorySource", false);
				}
			} else {
				if (data.length === 1) {
					oDefaultDataModel.setProperty("/mandatorySource", false);
				}
			}

			oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto", data);
			this.generateTaskTemplateDropdown(oDefaultDataModel);
			oDefaultDataModel.refresh(true);
		},

		//checks the last row's label, if filled allow user to add one more custom attribute (row)
		addCustomAttributeFnTM: function (that, oDefaultDataModel) {
			that.oAppModel.setProperty("/isChanged", true);
			var data = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
			if (!data) {
				data = [];
			}
			var add = {
				"dataType": "INPUT",
				"description": "",
				"isActive": true,
				"isDeleted": false,
				"isVisible": true,
				"isEditable": true,
				"isEdited": 0,
				"isMandatory": true,
				"key": Math.random().toString(20).substr(2, 24),
				"label": "",
				"processName": "",
				"attributePath": "",
				"validForUsage": true,
				"isRunTime": false,
				"origin": "Process",
				"copy": false
			};

			if (oDefaultDataModel.getProperty("/setEnabled") === false && (that.oAppModel.getProperty("/currentViewPage") === "workFlow" ||
					that.oAppModel
					.getProperty("/currentViewPage") === "createWorkFlow")) {
				add.isEdited = 2;
			}
			data.push(add);
			oDefaultDataModel.setProperty("/customDeleteButtonStatus", true);
			oDefaultDataModel.setProperty("/createWorkFlowData/customAttribute", data);
			oDefaultDataModel.setProperty("/CustomAddButtonStatus", false);
			this.fetchExistingAttributeTM(that, oDefaultDataModel);
			oDefaultDataModel.refresh(true);
		},

		//delete the selected row if more than 1 row is present else clear the value of that row and if runtimeuser is enabled then corresponding task level is also deleted
		deleteCustomAttributeFnTM: function (that, oEvent, oDefaultDataModel) {
			var obj = oEvent.getSource().getBindingContext("oDefaultDataModel").getPath();
			var res = obj.split("/");
			var index = res[3];
			var custom = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");

			if (oDefaultDataModel.getProperty("/setEnabled") === false) {
				if (that.oAppModel.getProperty("/currentViewPage") === "workFlow" || that.oAppModel.getProperty("/currentViewPage") ===
					"createWorkFlow") {
					if (oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().isEdited === 2) {
						custom.splice(index, 1);
					} else {
						oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().isDeleted = true;
						oEvent.getSource().getBindingContext("oDefaultDataModel").getObject().isEdited = 1;
					}
				}
			} else {
				custom.splice(index, 1);
			}
			if (custom.length) {
				if (!custom[custom.length - 1].label) {
					oDefaultDataModel.setProperty("/CustomAddButtonStatus", false);
					oDefaultDataModel.setProperty("/customDeleteButtonStatus", false);
				} else {
					oDefaultDataModel.setProperty("/CustomAddButtonStatus", true);
					oDefaultDataModel.setProperty("/customDeleteButtonStatus", true);
				}
			} else {
				oDefaultDataModel.setProperty("/CustomAddButtonStatus", true);
				oDefaultDataModel.setProperty("/customDeleteButtonStatus", false);
			}
			that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("CUSTOM_ATTRIBUTE_DELETION_MSG"));
			this.fetchExistingAttributeTM(that, oDefaultDataModel);
			oDefaultDataModel.refresh(true);
		},

		//read the excel file and setting the process name, creation type and label of custom attributes
		uploadExcelWorkFlowTM: function (that, oEvent, oDefaultDataModel) {
			var TMthis = this;
			var filename = ((oEvent.getSource().getValue()).split(".xlsx"))[0];
			oDefaultDataModel.setProperty("/createWorkFlowData/processDetail/processDisplayName", filename);
			oDefaultDataModel.setProperty("/createWorkFlowData/processDetail/processType", "Multiple Instance");
			oDefaultDataModel.setProperty("/createWorkFlowData/processDetail/slaDays", 3);
			oDefaultDataModel.setProperty("/createWorkFlowData/processDetail/criticalDateDays", 2);
			var isRowObject = true;
			var isSheetToJson = false;
			var sheetName = "";
			that.uploadExcel(oEvent, function (resultSet) {
				var rowObject = resultSet.rowObject;
				if (rowObject.length > 0) {
					oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto/0/sourceDropdown", [{
						"text": "None",
						"key": ""
					}]);

					var label = "";
					var customData = [];
					for (var i = 0; i < rowObject.length; i++) {
						label = rowObject[i][Object.keys(rowObject[0])[0]];
						var obj = {
							"dataType": "INPUT",
							"description": label,
							"isActive": true,
							"isDeleted": false,
							"isEditable": true,
							"isVisible": true,
							"isEdited": 0,
							"isMandatory": false,
							"key": Math.random().toString(20).substr(2, 24),
							"label": label,
							"processName": "",
							"validForUsage": true,
							"isRunTime": false
						};
						if (label === "Role" && filename === "Novo POC Sample Data") {
							obj.isRunTime = true;
							obj.runTimeType = "group";
							obj.dataType = "DROPDOWN";
						}
						customData.push(obj);
					}
					oDefaultDataModel.setProperty("/createWorkFlowData/customAttribute", customData);
					oDefaultDataModel.setProperty("/CustomAddButtonStatus", true);
					oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto/0/sourceId", [""]);
					oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto/0/targetId", [""]);
					TMthis.fetchExistingAttributeTM(that, oDefaultDataModel);
					if (filename === "Novo POC Sample Data") {
						oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto/0/subject", "New task created for Nova Sample Data {Task}");
						oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto/0/description",
							"New task created for Nova Sample Data {Task}");
						var taskAttributes = [];
						for (var j = 0; j < customData.length; j++) {
							if (customData[j].label) {
								obj = jQuery.extend(true, {}, customData[j]);
								obj.copy = true;
								obj.attributePath = "${" + obj.key + "}";
								obj.origin = "Task";
								obj.taskName = "Process";
								obj.isEditable = false;
								obj.key = Math.random().toString(20).substr(2, 24);
								if (oDefaultDataModel.getProperty("/setEnabled") === false) {
									obj.isEdited = 2;
								}
								taskAttributes.push(obj);
								if (customData[j].label === "Role") {
									oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto/0/customKey", obj.attributePath.split("${")[1].split("}")[
										0]);
									oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto/0/runTimeUser", 1);
								}
							}
						}
						oDefaultDataModel.setProperty("/createWorkFlowData/teamDetailDto/0/customAttributes", taskAttributes);
					}
				} else {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("NO_DATA_FETCH_MSG"));
				}
			}.bind(that), sheetName, isRowObject, isSheetToJson);
			oDefaultDataModel.refresh(true);
		},

		//validation of process detail in create workflow
		createWorkFlowValidationTM: function (that, oDefaultDataModel) {
			var workFlowProcessData = oDefaultDataModel.getProperty("/createWorkFlowData/processDetail");
			workFlowProcessData.labelName = workFlowProcessData.processDisplayName;
			workFlowProcessData.processName = workFlowProcessData.processDisplayName;
			var validationCheck = 0;
			if (workFlowProcessData.processName === "" || workFlowProcessData.type === "") {
				validationCheck = 1;
			}

			if (!(workFlowProcessData.slaDays || workFlowProcessData.slaHours)) {
				oDefaultDataModel.setProperty("/negativeValues", true);
			} else {
				oDefaultDataModel.setProperty("/negativeValues", false);
			}
			if (!(workFlowProcessData.criticalDateDays || workFlowProcessData.criticalDateHours)) {
				oDefaultDataModel.setProperty("/negativeValues", true);
			} else {
				oDefaultDataModel.setProperty("/negativeValues", false);
			}

			if (workFlowProcessData.criticalDateDays !== workFlowProcessData.slaDays) {
				if (workFlowProcessData.criticalDateDays > workFlowProcessData.slaDays) {
					validationCheck = 2;
				}
			} else {
				if (workFlowProcessData.criticalDateHours || workFlowProcessData.slaHours) {
					if (workFlowProcessData.criticalDateHours > workFlowProcessData.slaHours || workFlowProcessData.criticalDateHours ===
						workFlowProcessData.slaHours) {
						validationCheck = 2;
					}
				} else {
					if (workFlowProcessData.criticalDateDays === workFlowProcessData.slaDays) {
						validationCheck = 2;
					}
				}
			}

			if (validationCheck) {
				that.workFlowCreatePost(validationCheck);
			} else {
				that.createWorkflowTaskValidation();
			}
		},

		//validation of task detail in create workflow
		createWorkFlowTaskValidationTM: function (that, oDefaultDataModel) {
			var validationCheck;
			var workFlowTaskData = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			var tempData = oDefaultDataModel.getProperty("/processLevelAttributes");
			for (var i = 0; i < workFlowTaskData.length; i++) {
				workFlowTaskData[i].processName = oDefaultDataModel.getProperty("/createWorkFlowData/processDetail/processName");
				var subjectData = workFlowTaskData[i].subject;
				for (var z = 0; z < tempData.length; z++) {
					if (subjectData.includes(tempData[z].label) >= 0) {
						workFlowTaskData[i].subject = subjectData.replace(("{" + tempData[z].label + "}"), ("${" + tempData[z].key + "}"));
						subjectData = workFlowTaskData[i].subject;
					}
					var descData = workFlowTaskData[i].description;
					if (descData.includes(tempData[z].label) >= 0) {
						workFlowTaskData[i].description = descData.replace(("{" + tempData[z].label + "}"), ("${" + tempData[z].key + "}"));
						descData = workFlowTaskData[i].description;
					}
				}
				if (!workFlowTaskData[i].individual) {
					workFlowTaskData[i].individual = [];
				}
				if (!workFlowTaskData[i].group) {
					workFlowTaskData[i].group = [];
				}
				if (!workFlowTaskData[i].ownerSelectionRules) {
					workFlowTaskData[i].ownerSelectionRules = [];
				}
				if ((workFlowTaskData[i].eventName === "") || ((workFlowTaskData[i].taskNature ===
						"User Based") && (workFlowTaskData[i].individual.length === 0 &&
						workFlowTaskData[i].group.length === 0) && (workFlowTaskData[i].runTimeUser === 0) && (workFlowTaskData[i].ownerSelectionRules.length ===
						0))) {
					validationCheck = 1;
					break;
				}

				if (workFlowTaskData[i].customAttributes) {
					var taskAttributes = workFlowTaskData[i].customAttributes;
					for (var j = 0; j < taskAttributes.length; j++) {
						taskAttributes[j].processName = workFlowTaskData[i].templateId;
						if (!taskAttributes[j].label) {
							validationCheck = 1;
							break;
						}
						if (taskAttributes[j].dataType === "DROPDOWN" && taskAttributes[j].isRunTime === false) {
							var values = taskAttributes[j].dropDownValues;
							for (var k = 0; k < values.length; k++) {
								if (!values[k].valueName) {
									validationCheck = 1;
									break;
								}
							}
						} else if (taskAttributes[j].dataType === "TABLE") {
							var values = taskAttributes[j].tableAttributes;
							for (var k = 0; k < values.length; k++) {
								values[k].processName = taskAttributes[j].key;
								values[k].dependantOn = workFlowTaskData[i].eventName;
								if (!values[k].label) {
									validationCheck = 1;
									break;
								}
							}
						} else if (taskAttributes[j].copy === false && taskAttributes[j].dataType === "INPUT NUMERIC-CALCULATE") {
							var operatorAttributes = oDefaultDataModel.getProperty("/processLevelOperatorAttributes");
							var values = taskAttributes[j].attributePath;
							for (var k = 0; k < operatorAttributes.length; k++) {
								if (values.includes(operatorAttributes[k].label)) {
									if (operatorAttributes[k].label === "+" || operatorAttributes[k].label === "-" || operatorAttributes[k].label === "*" ||
										operatorAttributes[k].label === "/") {
										var tempValues = values.replace((" " + operatorAttributes[k].label + " "), (" '" + operatorAttributes[k].label + "' "));
										if (values !== tempValues) {
											k = k - (k + 1);
											values = tempValues;
										}
									} else {
										values = values.replace(("{" + operatorAttributes[k].label + "}"), ("${" + operatorAttributes[k].key + "}"));
										k = k - (k + 1);
									}
								}
							}
							taskAttributes[j].attributePath = values;
						}
					}
				}
			}

			if (validationCheck) {
				that.workFlowCreatePost(validationCheck);
			} else {
				that.createWorkFlowCustomValidation();
			}
		},

		//validation of custom attribute in create workflow
		createWorkFlowCustomValidationTM: function (that, oDefaultDataModel) {
			var validationCheck;
			var workFlowCustomData = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
			for (var j = 0; j < workFlowCustomData.length; j++) {
				if (!workFlowCustomData[j].key) {
					workFlowCustomData[j].key = workFlowCustomData[j].label;
				}
				workFlowCustomData[j].processName = oDefaultDataModel.getProperty("/createWorkFlowData/processDetail/processName");
				if ((workFlowCustomData[j].label === "") || (workFlowCustomData[j].dataType === "")) {
					validationCheck = 1;
					break;
				}
				if (workFlowCustomData[j].dataType === "DROPDOWN" && workFlowCustomData[j].isRunTime === false) {
					var values = workFlowCustomData[j].dropDownValues;
					for (var k = 0; k < values.length; k++) {
						if (!values[k].valueName) {
							validationCheck = 1;
							break;
						}
					}
				} else if (workFlowCustomData[j].dataType === "TABLE") {
					var values = workFlowCustomData[j].tableAttributes;
					for (var k = 0; k < values.length; k++) {
						values[k].processName = workFlowCustomData[j].key;
						values[k].dependantOn = oDefaultDataModel.getProperty("/createWorkFlowData/processDetail/processName");
						if (!values[k].label) {
							validationCheck = 1;
							break;
						}
					}
				} else if (workFlowCustomData[j].dataType === "INPUT NUMERIC-CALCULATE") {
					var operatorAttributes = oDefaultDataModel.getProperty("/processLevelOperatorAttributes");
					var values = workFlowCustomData[j].attributePath;
					for (var k = 0; k < operatorAttributes.length; k++) {
						if (values.includes(operatorAttributes[k].label)) {
							if (operatorAttributes[k].label === "+" || operatorAttributes[k].label === "-" || operatorAttributes[k].label === "*" ||
								operatorAttributes[k].label === "/") {
								var tempValues = values.replace((" " + operatorAttributes[k].label + " "), (" '" + operatorAttributes[k].label + "' "));
								if (values !== tempValues) {
									k = k - (k + 1);
									values = tempValues;
								}
							} else {
								values = values.replace(("{" + operatorAttributes[k].label + "}"), ("${" + operatorAttributes[k].key + "}"));
								k = k - (k + 1);
							}
						}
					}
					workFlowCustomData[j].attributePath = values;
				}
			}
			that.workFlowCreatePost(validationCheck);
		},

		//create workflow
		workFlowCreatePostTM: function (that, url, oDefaultDataModel, validationCheck) {
			if (validationCheck) {
				if (validationCheck === 1) {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
				} else if (validationCheck === 2) {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("DUE_DATE_ERR_MSG"));
				}
			} else if (oDefaultDataModel.getProperty("/negativeValues")) {
				that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("DATE_ERR_MSG"));
			} else {
				var data = oDefaultDataModel.getProperty("/createWorkFlowData");
				var taskDetail = data.teamDetailDto;
				var count = 0;
				for (var i = 0; i < taskDetail.length; i++) {
					delete taskDetail[i].sourceDropdown;
					if (taskDetail.length !== 1) {
						if (taskDetail[i].sourceId.length === 1 || taskDetail[i].sourceId.length === 0) {
							if (taskDetail[i].sourceId.length === 1) {
								if (!taskDetail[i].sourceId[0]) {
									count++;
								}
							} else if (taskDetail[i].sourceId.length === 0) {
								count++;
							}
						}
					} else {
						count = 1;
					}
				}

				if (count !== 1) {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("SOURCE_DEST_ERR"));
				} else {
					that.doAjax(url, "POST", data, function (oData) {
						var setData = {
							"processDetail": {
								"criticalDate": "",
								"criticalDateDays": 0,
								"criticalDateHours": 0,
								"description": "",
								"labelName": "",
								"origin": "Ad-hoc",
								"processDisplayName": "",
								"processName": "",
								"processRequestId": "",
								"processType": "Single Instance",
								"sla": "",
								"slaDays": 0,
								"slaHours": 0,
								"subject": "",
								"url": "",
								"validForUsage": true
							},
							"customAttribute": [{
								"dataType": "INPUT",
								"description": "",
								"isActive": true,
								"isDeleted": false,
								"isVisible": true,
								"isEditable": true,
								"isEdited": 0,
								"isMandatory": true,
								"key": "",
								"label": "",
								"processName": "",
								"validForUsage": true,
								"isRunTime": false,
								"origin": "Process",
								"copy": false
							}],
							"teamDetailDto": [{
								"processName": "",
								"eventName": "Task 1",
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
							}]
						};
						oDefaultDataModel.setProperty("/createWorkFlowData", setData);
						oDefaultDataModel.setProperty("/sourceDropdown", []);
						oDefaultDataModel.setProperty("/existingCustomAttributes", []);
						oDefaultDataModel.refresh(true);
						that._showToastMessage(oData.message);

						that.doAjax("/WorkboxJavaService/customProcess/getProcess?processType=All", "GET", null, function (data1) {
							that.getModel("oConstantsModel").setProperty("/processNames", data1.processDetails);
							var process = jQuery.extend(true, [], data1.processDetails);
							for (var i = 0; i < process.length; i++) {
								if (process[i].processName === "ALL") {
									process.splice(i, 1);
								}
							}
							that.getModel("oConstantsModel").setProperty("/processNamesList", process);
							that.getModel("oConstantsModel").setProperty("/selectedProcess", process[0].processName); // setting the default data as 1st process in  dropdown
							that.getModel("oConstantsModel").refresh(true);
						}.bind(that), function (oError) {}.bind(that));
					}.bind(that), function (oError) {}.bind(that));
				}
			}
		},

		//validation and updation of work flow
		updateWorkFlowTM: function (that, oDefaultDataModel, url) {
			var data = oDefaultDataModel.getProperty("/createWorkFlowData");
			var processName = oDefaultDataModel.getProperty("/createWorkFlowData/processDetail/processName");
			var workFlowProcessData = oDefaultDataModel.getProperty("/createWorkFlowData/processDetail");
			var count;
			var validationCheck;
			if (!(workFlowProcessData.slaDays || workFlowProcessData.slaHours)) {
				count = 1;
			}
			if (!(workFlowProcessData.criticalDateDays || workFlowProcessData.criticalDateHours)) {
				count = 1;
			}

			if (workFlowProcessData.criticalDateDays !== workFlowProcessData.slaDays) {
				if (workFlowProcessData.criticalDateDays > workFlowProcessData.slaDays) {
					count = 2;
				}
			} else {
				if (workFlowProcessData.criticalDateHours || workFlowProcessData.slaHours) {
					if (workFlowProcessData.criticalDateHours > workFlowProcessData.slaHours || workFlowProcessData.criticalDateHours ===
						workFlowProcessData.slaHours) {
						count = 2;
					}
				} else {
					if (workFlowProcessData.criticalDateDays === workFlowProcessData.slaDays) {
						count = 2;
					}
				}
			}

			var teamDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			var tempData = oDefaultDataModel.getProperty("/processLevelAttributes");
			if (workFlowProcessData.origin) {
				if (teamDto) {
					for (var i = 0; i < teamDto.length; i++) {
						delete teamDto[i].sourceDropdown;
						teamDto[i].processName = processName;
						if (!teamDto[i].group) {
							teamDto[i].group = [];
						}
						if (!teamDto[i].individual) {
							teamDto[i].individual = [];
						}
						var subjectData = teamDto[i].subject;
						for (var z = 0; z < tempData.length; z++) {
							if (subjectData.includes(tempData[z].label) >= 0) {
								teamDto[i].subject = subjectData.replace(("{" + tempData[z].label + "}"), ("${" + tempData[z].key + "}"));
								subjectData = teamDto[i].subject;
							}
							var descData = teamDto[i].description;
							if (descData.includes(tempData[z].label) >= 0) {
								teamDto[i].description = descData.replace(("{" + tempData[z].label + "}"), ("${" + tempData[z].key + "}"));
								descData = teamDto[i].description;
							}
						}
						if ((teamDto[i].eventName === "") || ((teamDto[i].taskNature === "User Based") && (teamDto[i].individual.length === 0 &&
								teamDto[i].group.length === 0) && teamDto[i].isRunTime === 0)) {
							validationCheck = 1;
							break;
						}
						var workFlowCustomData = teamDto[i].customAttributes;
						if (!workFlowCustomData) {
							workFlowCustomData = [];
						}
						for (var z = 0; z < workFlowCustomData.length; z++) {
							workFlowCustomData[z].processName = teamDto[i].templateId;
							if (workFlowCustomData[z].dataType === "DROPDOWN" && workFlowCustomData[z].isRuntime !== true) {
								var values = workFlowCustomData[z].dropDownValues;
								if (values) {
									for (var k = 0; k < values.length; k++) {
										if (!values[k].valueName) {
											validationCheck = 1;
											break;
										}
									}
								}
							} else if (workFlowCustomData[z].dataType === "TABLE") {
								var values = workFlowCustomData[z].tableAttributes;
								if (values) {
									for (var k = 0; k < values.length; k++) {
										values[k].processName = workFlowCustomData[z].key;
										values[k].dependantOn = teamDto[i].eventName;
										if (!values[k].label) {
											validationCheck = 1;
											break;
										}
									}
								}
							}
							
						}
					}
				}

				var customData = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
				if (!customData) {
					customData = [];
				}
				for (var j = 0; j < customData.length; j++) {
					customData[j].processName = processName;
					if (!customData[j].key) {
						customData[j].key = customData[j].label;
					}
					if ((customData[j].label === "")) {
						validationCheck = 1;
						break;
					}
					if (customData[j].dataType === "DROPDOWN" && customData[j].isRunTime === false) {
						var values = customData[j].dropDownValues;
						if (values) {
							for (var k = 0; k < values.length; k++) {
								if (!values[k].valueName) {
									validationCheck = 1;
									break;
								}
							}
						}
					} else if (customData[j].dataType === "TABLE") {
						var values = customData[j].tableAttributes;
						if (values) {
							for (var k = 0; k < values.length; k++) {
								values[k].dependantOn = processName;
								values[k].processName = customData[i].key;
								if (!values[k].label) {
									validationCheck = 1;
									break;
								}
							}
						}
					}
					else if (customData[j].dataType === "INPUT NUMERIC-CALCULATE") {
					var operatorAttributes = oDefaultDataModel.getProperty("/processLevelOperatorAttributes");
					var values = customData[j].attributePath;
					for (var k = 0; k < operatorAttributes.length; k++) {
						if (values.includes(operatorAttributes[k].label)) {
							if (operatorAttributes[k].label === "+" || operatorAttributes[k].label === "-" || operatorAttributes[k].label === "*" ||
								operatorAttributes[k].label === "/") {
								var tempValues = values.replace((" " + operatorAttributes[k].label + " "), (" '" + operatorAttributes[k].label + "' "));
								if (values !== tempValues) {
									k = k - (k + 1);
									values = tempValues;
								}
							} else {
								values = values.replace(("{" + operatorAttributes[k].label + "}"), ("${" + operatorAttributes[k].key + "}"));
								k = k - (k + 1);
							}
						}
					}
					customData[j].attributePath = values;
				}
				}
			}

			if (count) {
				if (count === 1) {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("DUE_DATE_ERR_MSG"));
				} else {
					that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("DATE_ERR_MSG"));
				}
			} else if (validationCheck) {
				that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
			} else {
				var tmThis = this;
				that.doAjax(url, "POST", data, function (oData) {
					oDefaultDataModel.setProperty("/setEnabled", true);
					processName = oDefaultDataModel.getProperty("/manageProcessName");
					var origin = oDefaultDataModel.getProperty("/manageProcessOrigin");
					var surl = "/WorkboxJavaService/customProcess/getAttributes/" + processName + "?processType=" + origin;
					that.doAjax(surl, "GET", null, function (oData) {
						oDefaultDataModel.setProperty("/createWorkFlowData", null);
						oDefaultDataModel.setProperty("/createWorkFlowData", oData);
						oDefaultDataModel.setProperty("/setEnabled", false);
						tmThis.generateTaskTemplateDropdown(oDefaultDataModel);
						var items = oDefaultDataModel.getProperty("/TaskTemplateDropdownDetails");
						that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").setSelectedKey(oDefaultDataModel.getProperty(
							"/createWorkFlowData/teamDetailDto/0/templateId"));
						var templateId = that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").getSelectedKey();
						var dropdownData = jQuery.extend(true, [], items);
						for (var i = 0; i < dropdownData.length; i++) {
							if (dropdownData[i].key === templateId || dropdownData[i].isEdited === 3) {
								dropdownData.splice(i, 1);
							}
						}
						var teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
						for (var j = 0; j < teamDetailDto.length; j++) {
							var subject = teamDetailDto[j].subject;
							var desc = teamDetailDto[j].description;
							for (var i = 0; i < tempData.length; i++) {
								if (subject.search(tempData[i].key) >= 0) {
									teamDetailDto[j].subject = subject.replace(("${" + tempData[i].key + "}"), ("{" + tempData[i].label +
										"}"));
									subject = teamDetailDto[j].subject;
								}
								if (desc.search(tempData[i].key) >= 0) {
									teamDetailDto[j].description = desc.replace(("${" + tempData[i].key + "}"), ("{" + tempData[i].label +
										"}"));
									desc = teamDetailDto[j].description;
								}
							}
							if (templateId === teamDetailDto[j].templateId) {
								teamDetailDto[j].sourceDropdown = dropdownData;
							}
						}
						oDefaultDataModel.refresh(true);
					}.bind(that), function (oError) {}.bind(that));
					that._showToastMessage(oData.message);
					that.doAjax("/WorkboxJavaService/customProcess/getProcess?processType=All", "GET", null, function (data1) {
						that.getModel("oConstantsModel").setProperty("/processNames", data1.processDetails);
						var process = jQuery.extend(true, [], data1.processDetails);
						for (var i = 0; i < process.length; i++) {
							if (process[i].processName === "ALL") {
								process.splice(i, 1);
							}
						}
						that.getModel("oConstantsModel").setProperty("/processNamesList", process);
						that.getModel("oConstantsModel").setProperty("/selectedProcess", process[0].processName); // setting the default data as 1st process in  dropdown
						that.getModel("oConstantsModel").refresh(true);
					}.bind(that), function (oError) {}.bind(that));
					if (processName === "AFENexus") {
						tmThis.updateTaskOwnerOrderBy(that, oDefaultDataModel);
					}
				}.bind(that), function (oError) {}.bind(that));
			}
		},
		updateTaskOwnerOrderBy: function (that, oDefaultDataModel) {
			var url = "/WorkboxJavaService/customProcess/updateAfeNexusOrder?processName=AFENexus&orderType=" + oDefaultDataModel.getProperty(
				"/taskOnwerOrderBy");
			var tmThis = this;
			that.doAjax(url, "GET", null, function (oData) {
				tmThis.getTaskOrderByDropdownList(this, oDefaultDataModel);
			}.bind(that), function (oError) {}.bind(that));

		},
		//checking the label of custom attributes
		checkCustomLabelValueTM: function (oEvent, that, inputValue, key, oDefaultDataModel) {
			var processCustomData = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
			var flag = 0;
			if (!processCustomData) {
				processCustomData = [];
			}
			for (var i = 0; i < processCustomData.length; i++) {
				if (processCustomData[i].key !== key) {
					if (inputValue === processCustomData[i].label) {
						flag++;
						break;
					}
				}
			}
			if (!flag) {
				var teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
				for (var j = 0; j < teamDetailDto.length; j++) {
					var taskCustomData = teamDetailDto[j].customAtributes;
					if (!taskCustomData) {
						taskCustomData = [];
					}
					for (var z = 0; z < taskCustomData.length; z++) {
						if (taskCustomData[z].key !== key) {
							if (!taskCustomData[z].copy) {
								if (inputValue === taskCustomData[z].label) {
									flag++;
									break;
								}
							}
						}
					}
				}
			}

			if (flag) {
				that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("CUSTOM_ATTRIBUTE_LABEL_ERR"));
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
			this.fetchExistingAttributeTM(that, oDefaultDataModel);
		},

		//checking the event name in task template
		checkTaskNameLabelValueTM: function (that, inputValue, key, oDefaultDataModel) {
			var teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
			for (var i = 0; i < teamDetailDto.length; i++) {
				if (teamDetailDto[i].templateId !== key) {
					if (inputValue === teamDetailDto[i].eventName) {
						that._showToastMessage(that.getView().getModel("i18n").getResourceBundle().getText("TASK_NAME_ERR"));
						break;
					}
				}
			}
		},

		//getting all the cross constants(data type, creation type, custom and idp groups etc)
		getCrossConstantsTM: function (that, oDefaultDataModel) {

			//service call to get the creation type
			var url = "/WorkboxJavaService/crossConstant/getConstants/CREATIONTYPE";
			that.doAjax(url, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/processType", oData);
			}.bind(that), function (oError) {}.bind(that));

			//service call to get the data type
			var surl = "/WorkboxJavaService/crossConstant/getConstants/DATATYPE";
			that.doAjax(surl, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/dataType", oData);
			}.bind(that), function (oError) {}.bind(that));

			//service call to get the task type
			var turl = "/WorkboxJavaService/crossConstant/getConstants/ACTIONTYPE";
			that.doAjax(turl, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/actionType", oData);
			}.bind(that), function (oError) {}.bind(that));

			//to define the task type attributes
			var data = {
				dto: [{
						"text": "User Based",
						"key": "User Based"
					}, {
						"text": "Rule Based",
						"key": "Rule Based"
					}
					/*, {
											"text": "Notification",
											"key": "notification"
										}, {
											"text": "System",
											"key": "system"
										}*/
				]
			};
			oDefaultDataModel.setProperty("/taskType", data);

			//setting the logical operators for rule based task
			var operator = [{
				"text": "=",
				"key": "="
			}, {
				"text": "!=",
				"key": "!="
			}, {
				"text": ">",
				"key": ">"
			}, {
				"text": ">=",
				"key": ">="
			}, {
				"text": "<",
				"key": "<"
			}, {
				"text": "<=",
				"key": "<="
			}];
			oDefaultDataModel.setProperty("/logicalOperator", operator);

			//setting the dropdoewn values - conditional operator for rule based workflow
			/*var dataCondition = [{
				"text": this.getView().getModel("i18n").getResourceBundle().getText("AND_CONDITION_TEXT"),
				"key": "&&"
			}, {
				"text": this.getView().getModel("i18n").getResourceBundle().getText("OR_CONDITION_TEXT"),
				"key": "||"
			}];
			oDefaultDataModel.setProperty("/conditionDropdown", dataCondition);*/

			//service to get the origin
			var oUrl = "/WorkboxJavaService/inbox/selectionList?selectionParameter=te.ORIGIN";
			that.doAjax(oUrl, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/originList", oData.keyValuePairs);
			}.bind(that), function (oError) {}.bind(that));
			oDefaultDataModel.refresh(true);

			//service call to get the idp groups
			var pUrl = "/WorkboxJavaService/group/getAllGroup/IDP";
			that.doAjax(pUrl, "GET", null, function (oData) {
				oDefaultDataModel.setProperty("/idpGroups", oData);
				oDefaultDataModel.setProperty("/selectedidpGroupName", oData.dto[0].groupName);
				oDefaultDataModel.setProperty("/selectedidpGroupID", oData.dto[0].groupId);
			}.bind(that), function (oError) {}.bind(that));
			oDefaultDataModel.refresh(true);
		},

		/****** Admin Console (Create workflow) - end ******/

		/****** Admin Console (Manage workflow) - start ******/

		//fetching the details of selected process for manage workflow
		onProcessListItemSelectTM: function (that, oEvent, url, oDefaultDataModel, oAppModel) {
			var processName = oEvent.getSource().getBindingContext("oConstantsModel").getObject().processName;
			var origin = oEvent.getSource().getBindingContext("oConstantsModel").getObject().origin;

			//calling the timer function
			this.settingTimer(that, oDefaultDataModel);

			if (!origin) {
				origin = "System";
			}
			url = url + processName + "?processType=" + origin;
			var tmThis = this;
			oDefaultDataModel.setProperty("/enableBusyIndicators", true);
			that.doAjax(url, "GET", null, function (oData) {
				if (oData.processDetail.processType === "Multiple Instance") {
					oData.processDetail.processType = 1;
				}
				oDefaultDataModel.setProperty("/createWorkFlowData", oData);
				//that._showToastMessage(oData.responseMessage.message);
				oDefaultDataModel.getProperty("/sideNavItemProperties").setSelectedKey("createWorkFlow");
				oDefaultDataModel.setProperty("/manageProcessName", processName);
				oDefaultDataModel.setProperty("/manageProcessOrigin", origin);
				oDefaultDataModel.setProperty("/setEnabled", false);
				oAppModel.setProperty("/openPreviewWorkFlow", false);
				oDefaultDataModel.setProperty("/openPreviewWorkFlow", false);
				oDefaultDataModel.setProperty("/fromApp", false);
				oAppModel.setProperty("/currentViewPage", "createWorkFlow");
				tmThis.generateTaskTemplateDropdown(oDefaultDataModel);
				tmThis.fetchExistingAttributeTM(that, oDefaultDataModel);
				var tempData = oDefaultDataModel.getProperty("/processLevelAttributes");
				var items = oDefaultDataModel.getProperty("/TaskTemplateDropdownDetails");
				that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").setSelectedKey(oDefaultDataModel.getProperty(
					"/createWorkFlowData/teamDetailDto/0/templateId"));
				var templateId = that.getView().byId("ID_ADMIN_TASKTEMPLATE_TAB").getSelectedKey();
				var dropdownData = jQuery.extend(true, [], items);
				for (var i = 0; i < dropdownData.length; i++) {
					if (dropdownData[i].key === templateId || dropdownData[i].isEdited === 3) {
						dropdownData.splice(i, 1);
					}
				}
				var teamDetailDto = oDefaultDataModel.getProperty("/createWorkFlowData/teamDetailDto");
				var count = 0;
				for (var j = 0; j < teamDetailDto.length; j++) {
					var subject = teamDetailDto[j].subject;
					var desc = teamDetailDto[j].description;
					for (var i = 0; i < tempData.length; i++) {
						if (subject.search(tempData[i].key) >= 0) {
							teamDetailDto[j].subject = subject.replace("${" + tempData[i].key + "}", ("{" + tempData[i].label +
								"}"));
							subject = teamDetailDto[j].subject;
						}
						if (desc.search(tempData[i].key) >= 0) {
							teamDetailDto[j].description = desc.replace("${" + tempData[i].key + "}", ("{" + tempData[i].label +
								"}"));
							desc = teamDetailDto[j].description;
						}
					}
					if (teamDetailDto[j].isEdited !== 3) {
						count++;
					}
					if (templateId === teamDetailDto[j].templateId) {
						teamDetailDto[j].sourceDropdown = dropdownData;
					}

					var operatorAttributes;
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
					operatorAttributes = tempData.concat(operators);
					var customAttribute = oDefaultDataModel.getProperty("/createWorkFlowData/customAttribute");
					for (var p = 0; p < customAttribute.length; p++) {
						var val = customAttribute[p].attributePath;
						if (val) {
							for (var q = 0; q < operatorAttributes.length; q++) {
								if (val.includes(operatorAttributes[q].key)) {
									if (operatorAttributes[q].label === "+" || operatorAttributes[q].label === "-" || operatorAttributes[q].label === "*" ||
										operatorAttributes[q].label === "/") {
										var tempValues = val.replace((" '" + operatorAttributes[q].label + "' "), (" " + operatorAttributes[q].label +
											" "));
										if (val !== tempValues) {
											q = q - (q + 1);
											val = tempValues;
										}
									} else {
										val = val.replace(("${" + operatorAttributes[q].key + "}"), ("{" +
											operatorAttributes[q].label + "}"));
										q = q - (q + 1);
									}
								}
							}
						}
						customAttribute[p].attributePath = val;
					}
					oDefaultDataModel.setProperty("/processLevelOperatorAttributes", operatorAttributes);
					var values = teamDetailDto[j].customAttributes;
					for (var l = 0; l < values.length; l++) {
						for (var k = 0; k < operatorAttributes.length; k++) {
							if (values[l].attributePath !== null && values[l].attributePath.includes(operatorAttributes[k].key)) {
								if (operatorAttributes[k].label === "+" || operatorAttributes[k].label === "-" || operatorAttributes[k].label === "*" ||
									operatorAttributes[k].label === "/") {
									var tempValues = values[l].attributePath.replace((" '" + operatorAttributes[k].label + "' "), (" " + operatorAttributes[k].label +
										" "));
									if (values[l].attributePath !== tempValues) {
										k = k - (k + 1);
										values[l].attributePath = tempValues;
									}
								} else {
									values[l].attributePath = values[l].attributePath.replace(("${" + operatorAttributes[k].key + "}"), ("{" +
										operatorAttributes[k].label + "}"));
									k = k - (k + 1);
								}
							}
						}
					}
				}
				if (count === 1) {
					oDefaultDataModel.setProperty("/mandatorySource", false);
				} else {
					oDefaultDataModel.setProperty("/mandatorySource", true);
				}
				oDefaultDataModel.setProperty("/CustomAddButtonStatus", true);
				oDefaultDataModel.setProperty("/customDeleteButtonStatus", true);
				oDefaultDataModel.setProperty("/TaskDeleteButtonStatus", true);
				oDefaultDataModel.setProperty("/enableBusyIndicators", false);
				oDefaultDataModel.refresh(true);
			}.bind(that), function (oError) {}.bind(that));
			// AFE NEXUS CHANGES
			if (processName === "AFENexus") {
				this.getTaskOrderByDropdownList(that, oDefaultDataModel, oAppModel);
			}
		},
		getTaskOrderByDropdownList: function (that, oDefaultDataModel) {
			var taskOnwerOrderByList = [{
				"key": "Ascending",
				"value": "Ascending"
			}, {
				"key": "Descending",
				"value": "Descending"
			}, {
				"key": "Alphabetical",
				"value": "Alphabetical"
			}]
			oDefaultDataModel.setProperty("/taskOnwerOrderByList", taskOnwerOrderByList);

			var url = "/WorkboxJavaService/customProcess/getAFENexusOrder?processName=AFENexus"
			that.doAjax(url, "GET", null, function (oData) {
				if (!oData.orderType) {
					oData.orderType = taskOnwerOrderByList[0].key;
				}
				oDefaultDataModel.setProperty("/taskOnwerOrderBy", oData.orderType);
				oDefaultDataModel.refresh(true);
			}.bind(that), function (oError) {}.bind(that));

		},

		//deletion of process - service call
		deleteProcessFnTM: function (that, url, processArray) {
			if (!processArray.length) {
				var paths = that.getView().byId("ID_MANAGE_PROCESS_LIST").getSelectedContextPaths();
				for (var i = 0; i < paths.length; i++) {
					processArray.push(that.getModel("oConstantsModel").getProperty(paths[i]).processName);
				}
			}
			that.doAjax(url, "POST", processArray, function (oData) {
				that.oAppModel.setProperty("/enableMWorkflowButton", false);
				that.doAjax("/WorkboxJavaService/customProcess/getProcess?processType=All", "GET", null, function (data1) {
					that.getModel("oConstantsModel").setProperty("/processNames", data1.processDetails);
					var process = jQuery.extend(true, [], data1.processDetails);
					for (var i = 0; i < process.length; i++) {
						if (process[i].processName === "ALL") {
							process.splice(i, 1);
						}
					}
					that.getView().byId("ID_MANAGE_PROCESS_LIST").removeSelections();
					that.getModel("oConstantsModel").setProperty("/processNamesList", process);
					that.getModel("oConstantsModel").setProperty("/selectedProcess", process[0].processName); // setting the default data as 1st process in  dropdown
				}.bind(that), function (oError) {}.bind(that));
				that._showToastMessage(oData.message);
			}.bind(that), function (oError) {}.bind(that));
		},

		/****** Admin Console (Manage workflow) - end ******/

		/****** Admin Console (TaskManagement) - end ******/

		/*****Development by Vaishnavi - end*****/

		//to increase the session time
		settingTimer: function (that, oDefaultDataModel) {
			var title = that.getView().getModel("i18n").getResourceBundle().getText("SESSION_TIMED_OUT");
			var msg = that.getView().getModel("i18n").getResourceBundle().getText("REFRESH_THE_PAGE");
			var interval = setInterval(function () {
				var currentViewPage = that.oAppModel.getProperty("/currentViewPage");
				if (currentViewPage === "createWorkFlow") {
					var url = "/WorkboxJavaService/customProcess/serverStatus";
					that.doAjax(url, "GET", null, function (data) {
						if (data.message === "FAILURE") {
							that._createConfirmationMessage(title, msg, "Warning", "OK", "OK", false, function () {});
						}
					}.bind(this), function (oError) {
						that._createConfirmationMessage(title, msg, "Warning", "OK", "OK", false, function () {});
					}.bind(this));
				} else {
					clearInterval(interval);
				}
			}, 300000); 
		}

};
});
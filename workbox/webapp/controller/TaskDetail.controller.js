sap.ui.define([
    "oneapp/incture/workbox/controller/BaseController",
    "oneapp/incture/workbox/util/formatter",
    "oneapp/incture/workbox/util/taskManagement",
    "oneapp/incture/workbox/util/workbox",
    "oneapp/incture/workbox/util/utility",
    "oneapp/incture/workbox/util/ODataOperationManager",
    "sap/ui/model/json/JSONModel",
    "oneapp/incture/workbox/controlExtension/ExtDatePicker"
], function (BaseController, formatter, taskManagement, workbox, utility, ODataOperationManager, JSONModel, ExtDatePicker) {
    "use strict";
    return BaseController.extend("oneapp.incture.workbox.controller.TaskDetail", {

        /*****Development by Vaishnavi - start*****/

        onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            
            var oAppModel = this.getOwner().getModel("oAppModel");
            this.oAppModel = oAppModel;

            /********** task owner-Chnages by karishma **********/
            var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
            this.getView().setModel(oCollaborationModel, "oCollaborationModel");
            /********** task owner-Chnages by karishma **********/

            var oTaskDetailModel = new JSONModel();
            this.getView().setModel(oTaskDetailModel, "oTaskDetailModel");
            oTaskDetailModel.setProperty("/enableBusyIndicators", {});
            this.oRouter.attachRoutePatternMatched(function (oEvent) {
                if (oEvent.getParameter("name") === "TaskDetail") {
                    this.oAppModel.setProperty("/transitionWait", false);
                    this.setTaskDetailPage();
                }
            }.bind(this));
        },

        //checking the basic details and setting the functions
        setTaskDetailPage: function () {
            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            oTaskDetailModel.setProperty("/isUpdated", false);
            oTaskDetailModel.setProperty("/iconTabBarInfo", null);
            oTaskDetailModel.setProperty("/formDetails", null);
            oTaskDetailModel.setProperty("/contentDto", null);
            oTaskDetailModel.setProperty("/caseID", null);
            oTaskDetailModel.setProperty("/managerProcessID", null);
            oTaskDetailModel.setProperty("/allFormDetails", []);
            oTaskDetailModel.setProperty("/roleEditableValue", null);
            var oAppModel = this.oAppModel;
            this.getView().byId("WB_TASK_DETAIL_CONTENT").removeAllItems();
            sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().resetActionButtons();
            var taskDetails = oAppModel.getProperty("/taskObjectDetails");
            var processName = taskDetails.processName;
            var url = taskDetails.url;
            if (!url) {
                this.getTaskDetails();
                if (processName === "ApprovalForAwardforRFQ") {
                    this.getAribaDetails();
                }
            } else {
                var headerDto = [{
                    "value": taskDetails.subject
                }, {
                    "value": taskDetails.startedBy
                }, {
                    "value": taskDetails.createdAt
                }, {
                    "value": taskDetails.taskDescription
                }];
                this.getModel("oTaskDetailModel").setProperty("/headerDto", headerDto);
                this.wbDataForHeaderButtons();
                $("#frameId").attr("src", url);
                $("#frameContentDiv").height("100%");
                $("#frameId").height("100%");
            }
            this.preserveData();
            oAppModel.setProperty("/currentView", "taskDetailPage");
            oAppModel.setProperty("/functionality/expanded", false);
            oAppModel.setProperty("/functionality/direction", "Column");
            oAppModel.setProperty("/functionality/visibility", false);
        },

        //getting the task details
        getTaskDetails: function () {
            var oAppModel = this.oAppModel;
            var object = oAppModel.getProperty("/taskObjectDetails");
            var taskId = object.taskId;
            var processName = object.processName;

            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            var url;
            oTaskDetailModel.setProperty("/enableBusyIndicators/taskContent", true);
            this.getView().byId("WB_TASK_DETAIL_CONTENT").removeAllItems();

            if (processName === "analyst_appproval_process" || processName === "inventoryparentworkflow" || processName ===
                "ic_manager_approval_process" || processName === "configuration_test_workflow" || processName === "test_scp_workflow" ||
                processName === "analyst_appproval_process_test12345" || processName === "forms_test_workflow" || processName ===
                "employee_workflwo" || processName === "vendor_management_approval") {
                if (processName === "analyst_appproval_process" || processName === "inventoryparentworkflow" || processName ===
                    "ic_manager_approval_process") {
                    url = "oneappinctureworkbox/WorkboxJavaService/detailPage/dynamicDetailsJabil?taskId=" + taskId;
                    oTaskDetailModel.setProperty("/roleEditableValue", true);
                } else {
                    url = "oneappinctureworkbox/WorkboxJavaService/detailPage/dynamicDetailFromContext?taskId=" + taskId;
                }
                this.doAjax(url, "GET", null, function (oData) {
                    oTaskDetailModel.setProperty("/contentDto", oData);
                    var layouts = oData.layouts;
                    for (var i = 0; i < layouts.length; i++) {
                        if (layouts[i].layoutType.toLowerCase() === "grid") {
                            this.createGridFn(oTaskDetailModel, layouts[i]);
                            var contentData = layouts[i].layoutAttributes;
                            for (var j = 0; j < contentData.length; j++) {
                                if (contentData[j].key === "caseId") {
                                    oTaskDetailModel.setProperty("/caseID", contentData[j].keyValue);
                                } else if (contentData[j].key === "icManagerProcessId") {
                                    oTaskDetailModel.setProperty("/managerProcessID", contentData[j].keyValue);
                                }
                            }
                        } else if (layouts[i].layoutType.toLowerCase() === "table") {
                            this.createTableFn(oTaskDetailModel, layouts[i]);
                        } else if (layouts[i].layoutType.toLowerCase() === "icontabbar") {
                            var subLayout = layouts[i].subLayots;
                            for (var k = 0; k < subLayout.length; k++) {
                                if (subLayout[k].layoutType.toLowerCase() === "forms") {
                                    this.createIconTabBarFn(oTaskDetailModel, subLayout[k].data);
                                }
                            }
                        }
                    }
                    //call the workbox function to get the buttons.
                    this.wbDataForHeaderButtons();
                    oTaskDetailModel.setProperty("/enableBusyIndicators/taskContent", false);
                }.bind(this), function (oError) { }.bind(this));
            } else {
                url = "oneappinctureworkbox/WorkboxJavaService/detailPage/dynamicDetails?taskId=" + taskId;
                this.doAjax(url, "GET", null, function (oData) {
                    oTaskDetailModel.setProperty("/contentDto", oData.contentDto);
                    this.createControlsFn();
                    //call the workbox function to get the buttons.
                    this.wbDataForHeaderButtons();

                    //if the process is purchase order service call to get the line items
                    if (processName === "PurchaseRequisition" || processName === "PurchaseOrderApprovalProcess") {
                        for (var i = 0; i < oData.contentDto.length; i++) {
                            if (oData.contentDto[i].dataType === "TASKDETAILS") {
                                var contentDto = oData.contentDto[i].contentDto;
                                for (var j = 0; j < contentDto.length; j++) {
                                    if (processName === "PurchaseRequisition") {
                                        if (contentDto[j].key === "PR_ITEM_NUMBER") {
                                            oTaskDetailModel.setProperty("/selectedLineItem", contentDto[j].value);
                                            break;
                                        }
                                    } else {
                                        if (contentDto[j].key === "PO_NUMBER") {
                                            oTaskDetailModel.setProperty("/selectedLineItem", contentDto[j].value);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        this.getPurchaseOrderLineItems(oTaskDetailModel);
                    }
                    oTaskDetailModel.setProperty("/enableBusyIndicators/taskContent", false);
                }.bind(this), function (oError) { }.bind(this));
            }
        },

        //if the process is purchase order service call to get the line items
        getPurchaseOrderLineItems: function (oTaskDetailModel) {
            var taskDetails = this.oAppModel.getProperty("/taskObjectDetails");
            var filterValue = taskDetails.processId;
            var sUrl;
            var oParams;
            var oModel;
            if (taskDetails.processName === "PurchaseRequisition") {
                oModel = new ODataOperationManager(this.getOwnerComponent(), "PRoDataModel");
                sUrl = "/PR_DETAILSSet";
                oParams = {
                    "$filter": "(Banfn eq '" + filterValue + "')"
                };
            } else {
                oModel = new ODataOperationManager(this.getOwnerComponent(), "POoDataModel");
                sUrl = "/PO_HEADERSet('" + oTaskDetailModel.getProperty("/selectedLineItem") + "')";
                oParams = {
                    "$expand": "PO_ITEMSET"
                };
            }
            oModel.readData(sUrl, oParams, function (oData) {
                if (taskDetails.processName === "PurchaseRequisition") {
                    oTaskDetailModel.setProperty("/purchaseProcessLineItem", oData.results);
                } else {
                    oTaskDetailModel.setProperty("/purchaseProcessLineItem", oData.PO_ITEMSET.results);
                }
                oTaskDetailModel.refresh(true);
            }.bind(this), function (oError) { }.bind(this));
        },

        //updating the line item details post call
        onQuantityUpdate: function (oEvent) {
            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            var selectedItem = oEvent.getSource().getParent().getBindingContext("oTaskDetailModel").getObject();
            var aData = {
                "banfn": selectedItem.Banfn,
                "bnfpo": selectedItem.Bnfpo,
                "menge": selectedItem.Menge,
                "maktx": selectedItem.Maktx
            };
            var url = "oneappinctureworkbox/WorkboxJavaService/ECC/updatePRDetails";
            this.doAjax(url, "POST", aData, function (oData) {
                if (oData.statusCode === "0") {
                    this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("UPDATE_LINE_ITEM_SUCCESS_MSG"));
                    sap.m.MessageToast.show("Line Item Quanity Updated Successfully");
                    this.getPurchaseOrderLineItems(oTaskDetailModel);
                }
            }.bind(this),
                function (oEvt) { }.bind(this));
        },

        //common function to create the grid 
        createGridFn: function (oTaskDetailModel, layoutData) {
            var that = this;
            oTaskDetailModel.setProperty("/" + layoutData.layoutId, layoutData.layoutAttributes);

            var vBox = new sap.m.VBox({
                renderType: "Bare"
            }).addStyleClass("wbTaskDetailContentClass")
                .addItem(new sap.m.HBox({
                    renderType: "Bare",
                    alignItems: "Center"
                }).addStyleClass("wbTaskTemplateContentClass")
                    .addItem(new sap.m.Text({
                        text: layoutData.label
                    }).addStyleClass("wbTaskDetailContentMargin")));

            var span = layoutData.layoutSize;
            if (!span) {
                span = "XL3 L3 M6 S12";
            }
            var oGrid = new sap.ui.layout.Grid({
                defaultSpan: span,
                vSpacing: 0.5
            }).addStyleClass("wbTaskDetailPaddingClass");
            oGrid.bindAggregation("content", "oTaskDetailModel>/" + layoutData.layoutId, function (index, context) {
                var VBox;
                var bindingObject = context.getObject();
                var type = "grid";
                VBox = this.createGridControls(bindingObject, oTaskDetailModel, type);
                return VBox;
            }.bind(that));

            vBox.addItem(oGrid);
            this.getView().byId("WB_TASK_DETAIL_CONTENT").addItem(vBox);
        },

        //to create the controls in the grid
        createGridControls: function (bindingObject, oTaskDetailModel, type) {
            var heightValue = "auto";
            var vBox;
            var item;

            if (type === "form") {
                heightValue = "5rem";
            }

            vBox = new sap.m.VBox({
                renderType: "Bare",
                width: "97%",
                visible: bindingObject.isVisible,
                height: heightValue
            }).addItem(new sap.m.Label({
                text: bindingObject.keyLabel,
                required: bindingObject.isMandatory
            }));
            item = this.addCellItem(bindingObject, oTaskDetailModel);
            vBox.addItem(item);
            return vBox;
        },

        //common function to create the table
        createTableFn: function (oTaskDetailModel, layoutData) {
            var that = this;
            oTaskDetailModel.setProperty("/" + layoutData.layoutId, layoutData.data);

            var titleBox = new sap.m.HBox({
                renderType: "Bare",
                alignItems: "Center",
                justifyContent: "SpaceBetween",
                width: "99.25%"
            }).addStyleClass("wbTaskTemplateContentClass")
                .addItem(new sap.m.Text({
                    text: layoutData.label
                }).addStyleClass("wbTaskDetailContentMargin"));

            var vBox = new sap.m.VBox({
                renderType: "Bare"
            }).addStyleClass("wbTaskDetailContentClass")
                .addItem(titleBox);

            var tableCon = new sap.m.VBox({
                renderType: "Bare",
                alignItems: "Center"
            }).addStyleClass("wbTaskDetailPaddingClass");
            var mTable = new sap.m.Table({}).addStyleClass("wbCustomTableClass");
            if (that.oAppModel.getProperty("/taskObjectDetails/processName") === "analyst_appproval_process") {
                mTable.setMode("MultiSelect");
                var buttonBox = new sap.m.HBox({
                    alignItems: "Center",
                    renderType: "Bare"
                })
                    .addItem(new sap.m.Button({
                        type: "Emphasized",
                        text: that.getView().getModel("i18n").getResourceBundle().getText("SAVE_TEXT"),
                        visible: "{= ${oTaskDetailModel>/formDetails} && (${oAppModel>/taskObjectDetails/processName} === 'analyst_appproval_process' || ${oAppModel>/taskObjectDetails/processName} === 'analystprocessworkflow') ? true : false}",
                        press: function (oEvt) {
                            that.saveFormData(oEvt);
                        }
                    })).addStyleClass("wbCustomButtonClass")
                    .addItem(new sap.m.Button({
                        type: "Emphasized",
                        text: that.getView().getModel("i18n").getResourceBundle().getText("JUSTIFY_ANSWER_TEXT"),
                        visible: "{= ${oAppModel>/taskObjectDetails/processName} === 'analyst_appproval_process'}",
                        press: function (oEvent) {
                            that.generateFormData(oEvent, oTaskDetailModel);
                        }
                    })).addStyleClass("wbCustomButtonClass");
                titleBox.addItem(buttonBox);
            }

            mTable.bindAggregation("columns", "oTaskDetailModel>/" + layoutData.layoutId + "/0/layoutAttributes", function (index, context) {
                var column;
                var bindingObject = context.getObject();
                var visibleValue = bindingObject.isVisible;
                column = new sap.m.Column({
                    width: "auto",
                    visible: visibleValue,
                    header: new sap.m.Label({
                        text: bindingObject.keyLabel,
                        required: bindingObject.isMandatory,
                        wrapping: true
                    }).addStyleClass("wbTransformToUpperCase")
                });
                return column;
            }.bind(that));

            mTable.bindAggregation("items", "oTaskDetailModel>/" + layoutData.layoutId, function (index, context) {
                var row = new sap.m.ColumnListItem();
                row.bindAggregation("cells", "oTaskDetailModel>layoutAttributes", function (colIndex, colContext) {
                    var cellContent = colContext.getObject();
                    var cell = this.addCellItem(cellContent, oTaskDetailModel);
                    return cell;
                }.bind(that));
                return row;
            }.bind(that));

            tableCon.addItem(mTable);
            vBox.addItem(tableCon);
            this.getView().byId("WB_TASK_DETAIL_CONTENT").addItem(vBox);
        },

        //adding the cells (table) or the value controls (grid) 
        addCellItem: function (bindingObject, oTaskDetailModel) {
            var item;
            if (bindingObject.keyType === "INPUT") {
                item = new sap.m.Input({
                    value: "{oTaskDetailModel>keyValue}",
                    editable: bindingObject.isEditable,
                    width: "80%"
                }).addStyleClass("wbTaskDetailInputWrapper");
            } else if (bindingObject.keyType === "DROPDOWN") {
                item = new sap.m.ComboBox({
                    items: {
                        path: "oConstantsModel>/allUsers",
                        template: new sap.ui.core.Item({
                            key: "{oConstantsModel>userId}",
                            text: "{oConstantsModel>userFirstName} {oConstantsModel>userLastName}"
                        })
                    },
                    selectedKey: "{oTaskDetailModel>keyValue}",
                    //editable: bindingObject.isEditable,
                    width: "80%"
                }).addStyleClass("wbDefaultCustomInputWrapper");
            } else if (bindingObject.keyType === "RADIO BUTTON") {
                item = new sap.m.RadioButtonGroup({
                    editable: bindingObject.isEditable,
                    width: "80%",
                    columns: bindingObject.radioButtonValues.length,
                    selectedIndex: '{parts:["oTaskDetailModel>radioButtonValues", "oTaskDetailModel>keyValue"], formatter:"oneapp.incture.workbox.util.formatter.wbTaskDetailRadioBtnFn"}',
                    select: function (oEvent) {
                        var object = oEvent.getSource().getBindingContext("oTaskDetailModel").getObject();
                        object.keyValue = oEvent.getSource().getSelectedButton().getText();
                    }
                });
                item.bindAggregation("buttons", "oTaskDetailModel>radioButtonValues", function (index, context) {
                    var oneRadioContent = new sap.m.RadioButton({
                        text: "{oTaskDetailModel>key}"
                    });
                    return oneRadioContent;
                });
            } else if (bindingObject.keyType === "TEXT AREA") {
                item = new sap.m.TextArea({
                    value: "{oTaskDetailModel>keyValue}",
                    width: "80%",
                    editable: bindingObject.isEditable
                }).addStyleClass("wbTaskDetailInputWrapper");
            } else if (bindingObject.keyType === "TEXT") {
                item = new sap.m.Text({
                    text: "{oTaskDetailModel>keyValue}",
                    width: "80%",
                    wrapping: true
                });
            }
            return item;
        },

        //common function to create the icon tab bar
        createIconTabBarFn: function (oTaskDetailModel, layoutData) {
            var that = this;
            oTaskDetailModel.setProperty("/iconTabBarInfo", layoutData);

            var vBox = new sap.m.VBox({
                renderType: "Bare",
                alignItems: "Center"
            }).addStyleClass("wbTaskDetailPaddingClass wbTaskDetailMarginClass");

            var oIconTabBar = new sap.m.IconTabBar({}).addStyleClass("wbAdminIconTabBackground");
            oIconTabBar.bindAggregation("items", "oTaskDetailModel>/iconTabBarInfo", function (index, context) {
                var bindingObject = context.getObject();
                var formId = bindingObject.formLayoutData[0].formId;
                var iconTabFiter = new sap.m.IconTabFilter({
                    text: formId,
                    key: formId
                });
                var lineItem = bindingObject.formLayoutData[0].lineItemDataAttributes;
                if (lineItem) {
                    var lineItemArray = [];
                    for (var i = 0; i < lineItem.length; i++) {
                        var obj = {
                            "layoutAttributes": lineItem[i]
                        };
                        lineItemArray.push(obj);
                    }
                    bindingObject.formLayoutData[0].lineItemDataAttributes = lineItemArray;
                }
                if (lineItem.length) {
                    var vTableCoBox = new sap.m.VBox({
                        renderType: "Bare",
                        alignItems: "Center"
                    });
                    var vtableBox = new sap.m.VBox({
                        renderType: "Bare",
                        width: "98.5%"
                    }).addStyleClass("wbFormTemplateBorderClass sapUiTinyMarginTop")
                        .addItem(new sap.m.HBox({
                            renderType: "Bare",
                            alignItems: "Center"
                        }).addStyleClass("wbTaskTemplateContentClass")
                            .addItem(new sap.m.Text({
                                text: that.getView().getModel("i18n").getResourceBundle().getText("LINE_ITEM_TEXT")
                            }).addStyleClass("wbTaskDetailContentMargin")));

                    var mTable = new sap.m.Table({
                        width: "98%"
                    }).addStyleClass("wbCustomTableClass wbTaskDetailContentMargin");
                    mTable.bindAggregation("columns", "oTaskDetailModel>formLayoutData/0/lineItemDataAttributes/0/layoutAttributes", function (
                        indexTable, contextTable) {
                        var column;
                        var bindingObjectTab = contextTable.getObject();
                        var visibleValue = bindingObjectTab.isVisible;
                        column = new sap.m.Column({
                            width: "auto",
                            visible: visibleValue,
                            header: new sap.m.Label({
                                text: bindingObjectTab.keyLabel,
                                wrapping: true
                            }).addStyleClass("wbTransformToUpperCase")
                        });
                        return column;
                    }.bind(that));
                    mTable.bindAggregation("items", "oTaskDetailModel>formLayoutData/0/lineItemDataAttributes", function (indexTable,
                        contextTable) {
                        var row = new sap.m.ColumnListItem();
                        row.bindAggregation("cells", "oTaskDetailModel>layoutAttributes", function (colIndex, colContext) {
                            var cellContent = colContext.getObject();
                            var cell = this.addCellItem(cellContent, oTaskDetailModel);
                            return cell;
                        }.bind(that));
                        return row;
                    }.bind(that));
                    vtableBox.addItem(mTable);
                    vTableCoBox.addItem(vtableBox);
                    iconTabFiter.addContent(vTableCoBox);
                }

                var formData = bindingObject.formLayoutData[0].formDataAttributes;
                if (formData) {
                    var vFormConBox = new sap.m.VBox({
                        renderType: "Bare",
                        alignItems: "Center",
                        width: "100%"
                    });

                    var titleContent = new sap.m.HBox({
                        renderType: "Bare",
                        alignItems: "Center",
                        justifyContent: "SpaceBetween"
                    }).addStyleClass("wbTaskTemplateContentClass")
                        .addItem(new sap.m.Text({
                            text: that.getView().getModel("i18n").getResourceBundle().getText("REPLY_FORM_TEXT")
                        }).addStyleClass("wbTaskDetailContentMargin"));

                    var statusItem;
                    statusItem = new sap.m.HBox({
                        alignItems: "Center",
                        renderType: "Bare"
                    }).addItem(new sap.m.Button({
                        text: that.getView().getModel("i18n").getResourceBundle().getText("APPROVE_TEXT"),
                        icon: "sap-icon://customfont/ApproveAccept",
                        type: "Transparent",
                        press: function (oEvt) {
                            that.approveFormFn(oEvt);
                        },
                        visible: "{= ${oTaskDetailModel>formLayoutData/0/formStatus} === 'SUBMITTED' ? true : false}"
                    }).addStyleClass("wbCustomButtonClass"))
                        .addItem(new sap.m.Button({
                            text: that.getView().getModel("i18n").getResourceBundle().getText("RETURN_TEXT"),
                            icon: "sap-icon://customfont/DeclineReject",
                            type: "Reject",
                            press: function (oEvt) {
                                that.returnFormFn(oEvt);
                            },
                            visible: "{= ${oTaskDetailModel>formLayoutData/0/formStatus} === 'SUBMITTED' ? true : false}"
                        }).addStyleClass("wbAdminMGroupsRemoveBtn"))
                        .addItem(new sap.m.Text({
                            text: that.getView().getModel("i18n").getResourceBundle().getText("APPROVED_FORM_STATUS"),
                            visible: "{= ${oTaskDetailModel>formLayoutData/0/formStatus} === 'APPROVED' ? true : false}"
                        }).addStyleClass("wbFormApprovedStatusText sapUiSmallMarginEnd"))
                        .addItem(new sap.m.Text({
                            text: that.getView().getModel("i18n").getResourceBundle().getText("RETURNED_FORM_STATUS"),
                            visible: "{= ${oTaskDetailModel>formLayoutData/0/formStatus} === 'RETURNED' ? true : false}"
                        }).addStyleClass("wbFormReturnedStatusText sapUiSmallMarginEnd"));
                    titleContent.addItem(statusItem);

                    var formAttributes = bindingObject.formLayoutData[0].formDataAttributes;
                    var structuredForm = [];
                    for (var i = 0; i < formAttributes.length; i++) {
                        var bObj = {};
                        var array = formAttributes[i];
                        bObj.keyType = "TEXT AREA";
                        for (var j = 0; j < array.length; j++) {
                            if (array[j].key === "valueHelp") {
                                var valueHelp = JSON.parse(array[j].keyValue);
                                if (valueHelp.length) {
                                    var valueArray = [];
                                    for (var k = 0; k < valueHelp.length; k++) {
                                        bObj.keyType = "RADIO BUTTON";
                                        var obj = {
                                            "key": valueHelp[k]
                                        };
                                        valueArray.push(obj);
                                    }
                                    bObj.radioButtonValues = valueArray;
                                }
                            } else if (array[j].keyType === "TEXT") {
                                bObj.keyLabel = array[j].keyValue;
                                bObj.isEditable = false;
                                if (array[j].keyValue === "Manager Comment") {
                                    bObj.isEditable = true;
                                }
                            } else {
                                bObj.keyValue = array[j].keyValue;
                            }
                        }
                        structuredForm.push(bObj);
                    }
                    bindingObject.formLayoutData[0].structuredForm = structuredForm;

                    var vFormBox = new sap.m.VBox({
                        renderType: "Bare",
                        width: "98.5%"
                    }).addStyleClass("wbFormTemplateBorderClass sapUiTinyMarginTop")
                        .addItem(titleContent);

                    var oFormGrid = new sap.ui.layout.Grid({
                        defaultSpan: "L6 M6 S12",
                        vSpacing: 0.5,
                        width: "98%"
                    }).addStyleClass("wbTaskDetailPaddingClass");
                    oFormGrid.bindAggregation("content", "oTaskDetailModel>formLayoutData/0/structuredForm", function (indexGrid, contextGrid) {
                        var VBox;
                        var bindingObjectGrid = contextGrid.getObject();
                        var type = "form";
                        VBox = this.createGridControls(bindingObjectGrid, oTaskDetailModel, type);
                        return VBox;
                    }.bind(that));
                    vFormBox.addItem(oFormGrid);
                    vFormConBox.addItem(vFormBox);
                    iconTabFiter.addContent(vFormConBox);
                }
                return iconTabFiter;
            }.bind(that));

            vBox.addItem(oIconTabBar);
            this.getView().byId("WB_TASK_DETAIL_CONTENT").addItem(vBox);
        },

        //approve form if the process is ic manager approval
        approveFormFn: function (oEvent) {
            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            var obj = oEvent.getSource().getBindingContext("oTaskDetailModel").getObject();
            var path = oEvent.getSource().getBindingContext("oTaskDetailModel").getPath();
            oTaskDetailModel.setProperty(path + "/formLayoutData/0/formStatus", "APPROVED");
            this.updateFormData(obj.formLayoutData[0]);
        },

        //reject form function if the process is ic manager approval
        returnFormFn: function (oEvent) {
            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            var obj = oEvent.getSource().getBindingContext("oTaskDetailModel").getObject();
            var path = oEvent.getSource().getBindingContext("oTaskDetailModel").getPath();
            oTaskDetailModel.setProperty(path + "/formLayoutData/0/formStatus", "RETURNED");
            this.updateFormData(obj.formLayoutData[0]);
        },

        //updating form data - post service call
        updateFormData: function (obj) {
            var processName = this.oAppModel.getProperty("/taskObjectDetails/processName");
            var processId = this.oAppModel.getProperty("/taskObjectDetails/processId");
            var url = "oneappinctureworkbox/WorkboxJavaService/workFlow/updateContextData?processId=" + processId + "&processName=" + processName;
            var postUpdateData = {
                "forms": []
            };

            var forms = [];
            var form = obj.structuredForm;
            for (var i = 0; i < form.length; i++) {
                var oneDiv = {};
                oneDiv.key = form[i].keyLabel;
                oneDiv.valueHelp = [];
                oneDiv.value = form[i].keyValue;
                if (form[i].keyType === "RADIO BUTTON") {
                    var valueHelp = form[i].radioButtonValues;
                    var valueArray = [];
                    for (var j = 0; j < valueHelp.length; j++) {
                        if (valueHelp[j].key) {
                            valueArray.push(valueHelp[j].key);
                        }
                    }
                    oneDiv.valueHelp = valueArray;
                }
                forms.push(oneDiv);
            }

            var postObj = {
                "formId": obj.formId,
                "formStatus": obj.formStatus,
                "formData": forms
            };

            if (postObj.formStatus === "RETURNED") {
                postObj.lineItems = [];
                for (var j = 0; j < obj.lineItemDataAttributes.length; j++) {
                    var attributeValues = obj.lineItemDataAttributes[j].layoutAttributes;
                    var object = {};
                    for (var z = 0; z < attributeValues.length; z++) {
                        var key = attributeValues[z].keyLabel;
                        var value = attributeValues[z].keyValue;
                        object[key] = value;

                    }
                    postObj.lineItems.push(object);
                }
            }
            postUpdateData.forms.push(postObj);
            this.doAjax(url, "POST", postUpdateData, function (oData) {
                this._showToastMessage(oData.message);
            }.bind(this),
                function (oEvent) { }.bind(this));
        },

        //creating the dynamic content (content dto) body of the page
        createControlsFn: function () {
            var oOuterBox = this.getView().byId("WB_TASK_DETAIL_CONTENT");
            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            var oDynamicGridDto = oTaskDetailModel.getData().contentDto;

            oOuterBox.removeAllItems();

            if (oDynamicGridDto) {
                if (this.oAppModel.getProperty("/taskObjectDetails/processName") === "ProjectProposalDocumentApproval") {
                    oTaskDetailModel.setProperty("/isClosePPDA", false);
                    oTaskDetailModel.setProperty("/isResubmitPPDA", true);
                }
                for (var i = 0; i < oDynamicGridDto.length; i++) {
                    if (oDynamicGridDto[i].contentDto) {
                        if (oDynamicGridDto[i].contentDto.length !== 0) { // if contentDto.length === 0 then will not render lineItem and Attachments
                            var sDefaultSpan, flag = true;
                            // To check if any any attachment attributes are present in attachment
                            if (oDynamicGridDto[i].contentDto[0].dataType === "ATTACHMENT") {
                                flag = false;
                                for (var j = 0; j < oDynamicGridDto[i].contentDto.length; j++) {
                                    if (oDynamicGridDto[i].contentDto[j].attributeValues.length === 4) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                            if (flag) {
                                if (oDynamicGridDto[i] && oDynamicGridDto[i].length === 1) {
                                    sDefaultSpan = "L12 M12 S12";
                                } else {
                                    sDefaultSpan = "L3 M6 S12";
                                }
                                var newContent = new sap.ui.layout.Grid({
                                    defaultSpan: sDefaultSpan,
                                    vSpacing: 0.5
                                }).addStyleClass("wbTaskDetailContentClass wbTaskDetailPaddingClass");
                                this.createDynamicControls(newContent, oDynamicGridDto[i].contentDto, "oDynamicGridDto/" + i + "/contentDto",
                                    "oTaskDetailModel");
                                oOuterBox.addItem(newContent);
                            }
                        }
                    }
                }
            }
        },

        createDynamicControls: function (oGrid, dynamicControlData, sDynamicDto, sModelName) {
            oGrid.setDefaultSpan("L3 M6 S12");
            var oDetailModel = this.getView().getModel("oDetailModel");
            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            var z;

            if (!dynamicControlData) {
                oDetailModel.setProperty("/busyIndicators/gridContentBusy", false);
                return;
            }
            if (this.oAppModel.getProperty("/taskObjectDetails/processName") === "ProjectProposalDocumentApproval") {
                for (z = 0; z < dynamicControlData.length; z++) {
                    if (dynamicControlData[z].key === "gia69b268cfe") {
                        if (dynamicControlData[z].value.toLowerCase() === "closed") {
                            oTaskDetailModel.setProperty("/isClosePPDA", false);
                            oTaskDetailModel.setProperty("/isResubmitPPDA", false);
                        } else { //open
                            oTaskDetailModel.setProperty("/isClosePPDA", true);
                            oTaskDetailModel.setProperty("/isResubmitPPDA", true);
                        }
                    }
                    if (dynamicControlData[z].label.includes("Cost Center")) {
                        oTaskDetailModel.setProperty("/costCenterValue", dynamicControlData[z].value.split(","));
                    }
                }
            }

            for (var i = 0; i < dynamicControlData.length; i++) {
                var editableValue = false;
                var visibleValue = true;
                var runTime = false;
                if (this.oAppModel.getProperty("/taskObjectDetails/origin") === "Ad-hoc") {
                    editableValue = dynamicControlData[i].isEditable;
                    runTime = dynamicControlData[i].isRunTime;
                    visibleValue = dynamicControlData[i].isVisible;
                }

                if (this.oAppModel.getProperty("/taskObjectDetails/processName") === "ProjectProposalDocumentApproval") {
                    if (this.oAppModel.getProperty("/currentViewPage") === "CompletedTasks" && oTaskDetailModel.getProperty("/isResubmitPPDA")) {
                        editableValue = true;
                    }
                    if (dynamicControlData[i].key === "gia69b268cfe" || dynamicControlData[i].label.includes("Project Start Date")) {
                        editableValue = false;

                    } else if (dynamicControlData[i].label.includes("Available Budget") && (
                        dynamicControlData[i].dataType === "INPUT" || dynamicControlData[i].dataType === "INPUT NUMERIC" || dynamicControlData[i].dataType === "INPUT NUMERIC-CALCULATE")) {
                        editableValue = false;
                        visibleValue = false;
                        var costCenterValue = oTaskDetailModel.getProperty("/costCenterValue");

                        if (costCenterValue && costCenterValue.length > 0 && costCenterValue.join() !== "") {
                            for (z = 0; z < costCenterValue.length; z++) {
                                if (dynamicControlData[i].label.includes(costCenterValue[z])) {
                                    visibleValue = true;

                                }
                            }
                        }
                    }
                }
                var height = "auto";
                if (visibleValue) {
                    if ((dynamicControlData[i].dataType).toLowerCase() === "text" || (dynamicControlData[i].dataType).toLowerCase() ===
                        "text area") {
                        height = "auto";
                    }
                    var newControl = new sap.m.VBox({
                        height: height,
                        renderType: "Bare",
                        visible: visibleValue
                    });
                    newControl.addItem(new sap.m.Label({
                        text: dynamicControlData[i].label,
                        required: dynamicControlData[i].isMandatory
                    }));

                    if ((dynamicControlData[i].dataType).toLowerCase() === "select") {
                        var selectControl;
                        selectControl = new sap.m.Select({
                            width: "80%",
                            selectedKey: dynamicControlData[i].value,
                            editable: editableValue,
                            visible: visibleValue,
                            name: dynamicControlData[i].label,
                            tooltip: dynamicControlData[i].label,
                            change: function (oEvent) {
                                this.setDropdownValuefn(oEvent, dynamicControlData);
                                oTaskDetailModel.setProperty("/isUpdated", true);

                            }.bind(this)
                        }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                        selectControl.bindItems(sModelName + ">/" + sDynamicDto + "/" + i + "/attributeValues", function (index, context) {
                            var obj = context.getObject();
                            return new sap.ui.core.Item({
                                text: obj.value,
                                key: obj.value
                            });
                        });
                        newControl.addItem(selectControl);
                    } else if ((dynamicControlData[i].dataType).toLowerCase() === "input") {
                        var index = i;
                        var inputControl = new sap.m.Input({
                            width: "80%",
                            value: dynamicControlData[i].value,
                            editable: editableValue,
                            visible: visibleValue,
                            tooltip: dynamicControlData[i].label,
                            change: function (oEvent) {
                                this.setValuefn(oEvent, dynamicControlData);
                                oTaskDetailModel.setProperty("/isUpdated", true);

                            }.bind(this)
                        }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                        newControl.addItem(inputControl);
                    } else if ((dynamicControlData[i].dataType).toLowerCase() === "input numeric" || (dynamicControlData[i].dataType).toLowerCase() === "input numeric-calculate") {
                        var inputNumericControl = new sap.m.Input({
                            width: "80%",
                            value: dynamicControlData[i].value,
                            editable: editableValue,
                            visible: visibleValue,
                            tooltip: dynamicControlData[i].label,
                            change: function (oEvent) {
                                this.setValuefn(oEvent, dynamicControlData);
                                oTaskDetailModel.setProperty("/isUpdated", true);
                            }.bind(this)
                        }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                        // For budget calculation in PPDA
                        if (dynamicControlData[i].label.includes("Budget") && !dynamicControlData[i].label.includes("Available Budget") && this.oAppModel
                            .getProperty("/currentViewPage") === "CompletedTasks" && oTaskDetailModel.getProperty("/isResubmitPPDA")) {
                            oTaskDetailModel.setProperty("/budgeIndex", i);
                            inputNumericControl = new sap.m.StepInput({
                                editable: editableValue,
                                visible: visibleValue,
                                width: "80%",
                                min: 0,
                                textAlign: 'Left',
                                step: 100,
                                tooltip: dynamicControlData[i].label,
                                value: dynamicControlData[i].value,
                                change: function (oEvent) {
                                    this.setValuefn(oEvent, dynamicControlData);
                                    oTaskDetailModel.setProperty("/isUpdated", true);
                                }.bind(this)
                            }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                        }
                        newControl.addItem(inputNumericControl);
                    } else if ((dynamicControlData[i].dataType).toLowerCase() === "switch") {
                        var state;
                        if (dynamicControlData[i].value === "true") {
                            state = true;
                        } else {
                            state = false;
                        }
                        var switchControl = new sap.m.Switch({
                            enabled: editableValue,
                            visible: visibleValue,
                            tooltip: dynamicControlData[i].label,
                            state: state,
                            change: function (oEvent) {
                                for (var x = 0; x < dynamicControlData.length; x++) {
                                    if (dynamicControlData[x].dataType.toLowerCase() === "switch") {
                                        if (oEvent.getSource().getTooltip() === dynamicControlData[x].label) {
                                            if (oEvent.getSource().getState()) {
                                                dynamicControlData[x].value = "true";
                                            } else {
                                                dynamicControlData[x].value = "false";
                                            }
                                        }
                                    }
                                }
                            }.bind(this)
                        }).addStyleClass("wbCustomSwitch");
                        newControl.addItem(switchControl);
                    } else if ((dynamicControlData[i].dataType).toLowerCase() === "link") {
                        var linkControl = new sap.m.Link({
                            width: "100%",
                            text: dynamicControlData[i].value,
                            press: function (oEvent) {
                                this.onURLClick(oEvent);
                                oTaskDetailModel.setProperty("/isUpdated", true);
                            }.bind(this)
                        }).addStyleClass("sapUiSizeCompact");
                        newControl.addItem(linkControl);
                    } else if ((dynamicControlData[i].dataType).toLowerCase() === "text area") {
                        var textAreaControl = new sap.m.Input({
                            width: "80%",
                            value: dynamicControlData[i].value,
                            editable: editableValue,
                            visible: visibleValue,
                            tooltip: dynamicControlData[i].label,
                            change: function (oEvent) {
                                this.setValuefn(oEvent, dynamicControlData);
                                oTaskDetailModel.setProperty("/isUpdated", true);
                            }.bind(this)
                        }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                        newControl.addItem(textAreaControl);
                    } else if ((dynamicControlData[i].dataType).toLowerCase() === "dropdown") {
                        var comboControl;
                        if (runTime) {
                            dynamicControlData[i].value = (dynamicControlData[i].value).split(",");
                            if (dynamicControlData[i].runTimeType === "group") {
                                this.doAjax("oneappinctureworkbox/WorkboxJavaService" + dynamicControlData[i].url, "GET", null, function (oData) {
                                    oTaskDetailModel.setProperty("/dropdownValues" + dynamicControlData[this].key, oData.dto);
                                }.bind(i),
                                    function (oData) { }.bind(this));
                                comboControl = new sap.m.MultiComboBox({
                                    width: "80%",
                                    selectedKeys: dynamicControlData[i].value,
                                    visible: visibleValue,
                                    editable: editableValue,
                                    tooltip: dynamicControlData[i].label,
                                    selectionFinish: function (oEvent) {
                                        this.setMultipleDropdownValuefn(oEvent, dynamicControlData);
                                    }.bind(this),
                                    items: {
                                        path: "oTaskDetailModel>/dropdownValues" + dynamicControlData[i].key,
                                        template: new sap.ui.core.Item({
                                            text: "{oTaskDetailModel>groupName}",
                                            key: "{oTaskDetailModel>groupId}"
                                        })
                                    }
                                }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                            } else if (dynamicControlData[i].runTimeType === "role") {
                                this.doAjax("oneappinctureworkbox/WorkboxJavaService" + dynamicControlData[i].url, "GET", null, function (oData) {
                                    oTaskDetailModel.setProperty("/dropdownValues" + dynamicControlData[this].key, oData.dto);
                                }.bind(i),
                                    function (oData) { }.bind(this));
                                comboControl = new sap.m.MultiComboBox({
                                    width: "80%",
                                    selectedKeys: dynamicControlData[i].value,
                                    visible: visibleValue,
                                    editable: editableValue,
                                    tooltip: dynamicControlData[i].label,
                                    selectionFinish: function (oEvent) {
                                        this.setMultipleDropdownValuefn(oEvent, dynamicControlData);
                                    }.bind(this),
                                    items: {
                                        path: "oTaskDetailModel>/dropdownValues" + dynamicControlData[i].key,
                                        template: new sap.ui.core.Item({
                                            text: "{oTaskDetailModel>roleName}",
                                            key: "{oTaskDetailModel>roleId}"
                                        })
                                    }
                                }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                            } else {
                                comboControl = new sap.m.MultiComboBox({
                                    width: "80%",
                                    selectedKeys: dynamicControlData[i].value,
                                    visible: visibleValue,
                                    editable: editableValue,
                                    tooltip: dynamicControlData[i].label,
                                    selectionFinish: function (oEvent) {
                                        this.setMultipleDropdownValuefn(oEvent, dynamicControlData);
                                    }.bind(this),
                                    items: {
                                        path: "oConstantsModel>/allUsers",
                                        template: new sap.ui.core.Item({
                                            text: "{oConstantsModel>userFirstName} {oConstantsModel>userLastName}",
                                            key: "{oConstantsModel>userId}"
                                        })
                                    }
                                }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                            }
                        } else if (this.oAppModel.getProperty("/taskObjectDetails/processName") === "ProjectProposalDocumentApproval" && this.oAppModel
                            .getProperty(
                                "/currentViewPage") === "CompletedTasks" && dynamicControlData[i].label.includes("Cost Center")) {
                            var dropdownUrl = "oneappinctureworkbox/WorkboxJavaService/crossConstant/getConstants/" + dynamicControlData[i].key;
                            this.doAjax(dropdownUrl, "GET", null, function (oData) {
                                oTaskDetailModel.setProperty("/dropdownValues" + dynamicControlData[this].key, oData.dto);
                            }.bind(i),
                                function (oData) { }.bind(this));
                            comboControl = new sap.m.MultiComboBox({
                                width: "80%",
                                // selectedKeys: "{path: 'oCustomTaskModel>value' ,formatter: 'oneapp.incture.workbox.util.formatter.wbValuesCreateInstance'}"
                                selectedKeys: this.formatter.wbValuesCreateInstance(dynamicControlData[i].value),
                                visible: visibleValue,
                                editable: editableValue,
                                tooltip: dynamicControlData[i].label,
                                selectionFinish: function (oEvent) {
                                    this.setMultipleDropdownValuefn(oEvent, dynamicControlData);
                                    oTaskDetailModel.setProperty("/isUpdated", true);
                                }.bind(this),
                                items: {
                                    path: "oTaskDetailModel>/dropdownValues" + dynamicControlData[i].key,
                                    template: new sap.ui.core.Item({
                                        text: "{oTaskDetailModel>value}",
                                        key: "{oTaskDetailModel>value}"
                                    })
                                },
                            }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                            oTaskDetailModel.setProperty("/costCenterIndex", i);
                        } else {
                            this.doAjax("oneappinctureworkbox/WorkboxJavaService" + dynamicControlData[i].url, "GET", null, function (oData) {
                                oTaskDetailModel.setProperty("/dropdownValues" + dynamicControlData[this].key, oData.dto);
                            }.bind(i),
                                function (oData) { }.bind(this));
                            comboControl = new sap.m.ComboBox({
                                width: "80%",
                                value: dynamicControlData[i].value,
                                visible: visibleValue,
                                editable: editableValue,
                                tooltip: dynamicControlData[i].label,
                                change: function (oEvent) {
                                    this.setDropdownValuefn(oEvent, dynamicControlData);
                                    oTaskDetailModel.setProperty("/isUpdated", true);
                                }.bind(this),
                                items: {
                                    path: "oTaskDetailModel>/dropdownValues" + dynamicControlData[i].key,
                                    template: new sap.ui.core.Item({
                                        text: "{oTaskDetailModel>value}",
                                        key: "{oTaskDetailModel>value}"
                                    })
                                }
                            }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");

                        }
                        newControl.addItem(comboControl);
                    } else if (dynamicControlData[i].dataType === "") {
                        newControl.addItem(new sap.m.HBox());
                    } else if ((dynamicControlData[i].dataType).toLowerCase() === "text") {
                        var textControl = new sap.m.Text({
                            width: "100%",
                            text: dynamicControlData[i].value
                        }).addStyleClass("sapUiSizeCompact sapUiTinyMarginTop");
                        newControl.addItem(textControl);
                    } else if ((dynamicControlData[i].dataType).toLowerCase() === "datetype") {
                        var dateControl = new ExtDatePicker({
                            width: "80%",
                            value: dynamicControlData[i].value,
                            tooltip: dynamicControlData[i].label,
                            placeholder: "mm/dd/yyyy",
                            displayFormat: "dd MMM yyyy",
                            valueFormat: "yyyy-MM-dd",
                            visible: visibleValue,
                            editable: editableValue,
                            change: function (oEvent) {
                                this.setValuefn(oEvent, dynamicControlData);
                                oTaskDetailModel.setProperty("/isUpdated", true);

                            }.bind(this)
                        }).addStyleClass("sapUiSizeCompact wbTaskDetailInputWrapper");
                        newControl.addItem(dateControl);
                    } else if ((dynamicControlData[i].dataType) === "LINEITEM") {
                        if (i === 0) {
                            newControl = this.createLineItemTable(dynamicControlData);
                            oGrid.setDefaultSpan("L12 M12 S12");
                        } else {
                            newControl = null;
                        }
                    } else if ((dynamicControlData[i].dataType) === "ATTACHMENT") {
                        if (i === 0) {
                            newControl = this.attachmentDto();
                        } else {
                            newControl = null;
                        }
                    }
                    oGrid.addContent(newControl);
                }
            }
        },

        // method to create a table if its a line item 
        createLineItemTable: function (dynamicControlData) {
            var that = this;
            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            var justifyButtonVisible = false;
            var tableId = new sap.m.Table({});
            tableId.addStyleClass("wbCustomTableClass");
            var processName = this.oAppModel.getProperty("/taskObjectDetails").processName;
            if (processName === "analystprocessworkflow" || processName ===
                "analyst_appproval_process") {
                tableId.setMode("MultiSelect");
                for (var i = 0; i < dynamicControlData.length; i++) {
                    var iconObject = {
                        "key": "icon",
                        "attributeValue": "✔",
                        "updated": false
                    };
                    dynamicControlData[i].attributeValues.splice(0, 0, iconObject);
                }
                justifyButtonVisible = true;
            }
            tableId.setModel(oTaskDetailModel, "oTaskDetailModel");
            oTaskDetailModel.setProperty("/" + dynamicControlData[0].key, dynamicControlData[0].attributeValues);
            oTaskDetailModel.setProperty("/lineItem" + dynamicControlData[0].key, dynamicControlData);
            oTaskDetailModel.setProperty("/lineItem" + dynamicControlData[0].key + "/processName", processName);
            tableId.bindAggregation("columns", "oTaskDetailModel>/" + dynamicControlData[0].key, function (index, context) {
                var records = context.getObject();
                var visibleValue = true;
                var widthValue = "auto";
                if (records.key === "icon") {
                    visibleValue = false;
                    widthValue = "2rem";
                }
                var oColumn = new sap.m.Column({
                    width: widthValue,
                    header: new sap.m.Text({
                        wrapping: true,
                        text: records.key,
                        visible: visibleValue
                    }).addStyleClass("sStyleClass")
                });
                return oColumn;
            });
            tableId.bindItems("oTaskDetailModel>/lineItem" + dynamicControlData[0].key, function (index, context) {
                var records = context.getObject().attributeValues;
                processName = context.getObject().processName;
                var row = new sap.m.ColumnListItem();
                for (var k in records) {
                    //checks the process and the key to generate the cell control
                    if (records[k].key === "Analyst" && (processName === "jabilinventorymanagement" || processName ===
                        "inventoryparentworkflow")) {
                        row.addCell(new sap.m.ComboBox({
                            items: {
                                path: "oConstantsModel>/allUsers",
                                template: new sap.ui.core.Item({
                                    key: "{oConstantsModel>userId}",
                                    text: "{oConstantsModel>userFirstName} {oConstantsModel>userLastName}"
                                })
                            },
                            selectionChange: function (oEvent) {
                                var analyst = oEvent.getSource().getSelectedKey();
                                var object = oEvent.getSource().getBindingContext("oTaskDetailModel").getObject();
                                var attributeValues = object.attributeValues;
                                for (var i = 0; i < attributeValues.length; i++) {
                                    if (attributeValues[i].key === "Analyst") {
                                        attributeValues[i].attributeValue = analyst;
                                    }
                                }
                            },
                            selectedKey: records[k].attributeValue
                        })).addStyleClass("wbDefaultCustomInputWrapper");
                    } else if ((processName === "analystprocessworkflow" || processName === "analyst_appproval_process") && records[k].key ===
                        "icon") {
                        row.addCell(new sap.m.Text({
                            text: records[k].attributeValue,
                            visible: records[k].updated
                        }));
                    } else {
                        row.addCell(new sap.m.Text({
                            text: records[k].attributeValue
                        }));
                    }
                }
                return row;
            });
            var vbox = new sap.m.VBox({
                renderType: "Bare"
            }).addItem(new sap.m.HBox({
                renderType: "Bare",
                alignItems: "Center",
                width: "103%",
                justifyContent: "SpaceBetween"
            }).addStyleClass("wbTaskDetailAttachmentClass sapUiTinyMarginBottom")
                .addItem(new sap.m.Text({
                    text: this.getView().getModel("i18n").getResourceBundle().getText("LINE_ITEM_TEXT")
                }).addStyleClass("sapUiTinyMarginBottom"))
                .addItem(new sap.m.HBox({
                    renderType: "Bare"
                }).addItem(new sap.m.Button({
                    text: this.getView().getModel("i18n").getResourceBundle().getText("SAVE_TEXT"),
                    type: "Emphasized",
                    visible: "{= ${oTaskDetailModel>/formDetails} && (${oAppModel>/taskObjectDetails/processName} === 'analyst_appproval_process' || ${oAppModel>/taskObjectDetails/processName} === 'analystprocessworkflow') ? true : false}",
                    press: function (oEvt) {
                        that.saveFormData(oEvt);
                    }
                })).addStyleClass("wbCustomButtonClass")
                    .addItem(new sap.m.Button({
                        text: this.getView().getModel("i18n").getResourceBundle().getText("JUSTIFY_ANSWER_TEXT"),
                        type: "Emphasized",
                        visible: justifyButtonVisible,
                        press: function (oEvent) {
                            that.generateFormData(oEvent, oTaskDetailModel);
                        }
                    })).addStyleClass("wbCustomButtonClass"))
            ).addItem(tableId);
            if (processName === "analystprocessworkflow" || processName === "analyst_appproval_process") {
                oTaskDetailModel.setProperty("/containerDetails", vbox);
                oTaskDetailModel.refresh(true);
            }
            return vbox;
        },

        //if the process is analystprocessworkflow then on click of row form is generated
        generateFormData: function (oEvent, oTaskDetailModel) {
            var tableId = oEvent.getSource().getParent().getParent().getParent().getItems()[1].getItems()[0];
            var paths = tableId.getSelectedContextPaths();
            var that = this;
            var index;
            var form;
            var check;
            var formData;

            if (!paths.length) {
                index = 0;
                formData = oTaskDetailModel.getProperty("/allFormDetails");
                if (!formData) {
                    formData = [];
                }
                if (formData.length) {
                    if (formData[0].formData.length) {
                        check = formData[0];
                    }
                }
            } else {
                index = paths[0].split("/")[2];
                formData = oTaskDetailModel.getProperty("/allFormDetails");
                for (var k = 0; k < formData.length; k++) {
                    if (k === parseInt(index, 10)) {
                        check = formData[index];
                        break;
                    }
                }
            }

            if (check) {
                oTaskDetailModel.setProperty("/formDetails", check);
                this.createFormControlsFn(oTaskDetailModel, that, tableId);
            } else {
                var taskId = this.oAppModel.getProperty("/taskObjectDetails/taskId");
                //var url = "oneappinctureworkbox/WorkboxJavaService/inventory/getFormDetails?taskId=" + taskId + "&index=" + index;
                var url = "oneappinctureworkbox/WorkboxJavaService/inventory/getFormDetails?taskId=" + taskId;
                this.doAjax(url, "GET", null, function (oData) {
                    if (!oData.length) {
                        form = oData.formData;
                    } else {
                        form = oData[0].formData;
                    }
                    for (var i = 0; i < form.length; i++) {
                        var valueHelp = form[i].valueHelp;
                        var valueArray = [];
                        if (valueHelp.length) {
                            for (var j = 0; j < valueHelp.length; j++) {
                                var obj = {
                                    "key": valueHelp[j]
                                };
                                valueArray.push(obj);
                            }
                            form[i].valueHelp = valueArray;
                            if (!form[i].value) {
                                form[i].value = valueArray[0].key;
                            }
                        }
                    }
                    var orderArray = [];
                    var textAreaDto = [];
                    var radioButtonDto = [];
                    var even = 0;
                    var odd = 0;
                    for (var i = 0; i < form.length; i++) {
                        if (form[i].valueHelp.length) {
                            radioButtonDto.push(form[i]);
                        } else {
                            textAreaDto.push(form[i]);
                        }
                    }
                    for (var i = 0; i < 7; i++) {
                        if (i % 2 === 0) {
                            orderArray.push(textAreaDto[even]);
                            even++;
                        } else {
                            orderArray.push(radioButtonDto[odd]);
                            odd++;
                        }
                    }
                    oData.formData = orderArray;
                    if (!oData.length) {
                        oTaskDetailModel.setProperty("/formDetails", oData);
                    } else {
                        oTaskDetailModel.setProperty("/formDetails", oData[0]);
                    }
                    oTaskDetailModel.refresh(true);
                    this.createFormControlsFn(oTaskDetailModel, that, tableId);
                }.bind(this), function (oError) { }.bind(this));
            }
        },

        //creating dynamic controls for form details
        createFormControlsFn: function (oTaskDetailModel, that, tableId) {

            var vbox = new sap.ui.layout.Grid({
                defaultSpan: "L6 M6 S12",
                vSpacing: 1,
                hSpacing: 1,
                position: "Center"
            }).addStyleClass("sapUiSmallMarginTop");
            vbox.bindAggregation("content", "oTaskDetailModel>/formDetails/formData",
                function (index, context) {
                    var radioButton = new sap.m.RadioButtonGroup({
                        visible: "{= ${oTaskDetailModel>valueHelp}.length > 0 ? true : false}",
                        columns: "{= ${oTaskDetailModel>valueHelp}.length}",
                        select: function (oEvent) {
                            var object = oEvent.getSource().getBindingContext("oTaskDetailModel").getObject();
                            object.value = oEvent.getSource().getSelectedButton().getText();
                        },
                        selectedIndex: '{parts:["oTaskDetailModel>valueHelp", "oTaskDetailModel>value"], formatter:"oneapp.incture.workbox.util.formatter.wbTaskDetailRadioBtnFn"}'
                    });
                    radioButton.bindAggregation("buttons", "oTaskDetailModel>valueHelp", function (index, context) {
                        var oneRadioContent = new sap.m.RadioButton({
                            text: "{oTaskDetailModel>key}"
                        });
                        return oneRadioContent;
                    });
                    var key = context.getObject().key;
                    var editableValue = true;
                    if (key === "Manager Comment") {
                        editableValue = false;
                    }
                    var oneDiv = new sap.m.VBox({
                        renderType: "Bare",
                        width: "97%",
                        height: "5rem"
                    }).addStyleClass("sapUiTinyMarginTopBottom")
                        .addItem(new sap.m.Text({
                            text: "{oTaskDetailModel>key}"
                        })).addItem(new sap.m.TextArea({
                            value: "{oTaskDetailModel>value}",
                            width: "100%",
                            visible: "{= ${oTaskDetailModel>valueHelp}.length > 0 ? false : true}",
                            editable: editableValue
                        })).addStyleClass("wbTaskDetailInputWrapper")
                        .addItem(radioButton);
                    return oneDiv;
                });
            var formData = new sap.m.VBox({
                width: "100%",
                renderType: "Bare"
            })
                .addItem(new sap.m.HBox({
                    renderType: "Bare",
                    justifyContent: "Start",
                    alignItems: "Center"
                }).addItem(new sap.m.Label({
                    visible: "{= ${oTaskDetailModel>/formDetails} ? true : false}",
                    text: this.getView().getModel("i18n").getResourceBundle().getText("REPLY_FORM_TEXT")
                }).addStyleClass("sapUiSmallMarginTop wbAdminCustLabelProcess")))
                .addItem(vbox);
            tableId.getParent().addItem(formData);
            oTaskDetailModel.refresh(true);
        },

        //saving the form data - functiom
        saveFormData: function (oEvent) {
            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            var saveFormData = oTaskDetailModel.getProperty("/allFormDetails");
            var tableId = oEvent.getSource().getParent().getParent().getParent().getItems()[1].getItems()[0];
            var value = oTaskDetailModel.getProperty("/formDetails");
            var paths = tableId.getSelectedContextPaths();
			/*var contentDto = oTaskDetailModel.getData().contentDto;
			for (i = 0; i < contentDto.layouts.length; i++) {
				if (contentDto.layouts[i].layoutType === "TABLE") {
					var lineItems = contentDto.layouts[i].data;
					break;
				}
			}*/
            for (var i = 0; i < paths.length; i++) {
                saveFormData[paths[i].split("/")[2]] = value;
                //lineItems[paths[i].split("/")[2]].attributeValues[0].updated = true;
            }
            oTaskDetailModel.setProperty("/formDetails", null);
            tableId.removeSelections();
            tableId.getParent().removeItem(1);
            oTaskDetailModel.refresh(true);
        },

        // function to set the values in the content dto
        setValuefn: function (oEvent, dynamicControlData) {

            var label = oEvent.getSource().getTooltip();
            for (var i = 0; i < dynamicControlData.length; i++) {
                if (dynamicControlData[i].label === label) {
                    dynamicControlData[i].value = oEvent.getSource().getValue();
                }
            }
        },

        // function to set the values of dropdown and select in the content dto
        setDropdownValuefn: function (oEvent, dynamicControlData) {
            var label = oEvent.getSource().getTooltip();
            for (var i = 0; i < dynamicControlData.length; i++) {
                if (dynamicControlData[i].label === label) {
                    dynamicControlData[i].value = oEvent.getSource().getSelectedKey();
                }
            }
        },

        // function to set the values of dropdown and select in the content dto
        setMultipleDropdownValuefn: function (oEvent, dynamicControlData) {
            var label = oEvent.getSource().getTooltip();
            for (var i = 0; i < dynamicControlData.length; i++) {
                if (dynamicControlData[i].label === label) {
                    var aSelectedItems = oEvent.getParameter("selectedItems");
                    var valueList = [];
                    for (var j = 0; j < aSelectedItems.length; j++) {
                        valueList.push(aSelectedItems[j].getKey());
                    }
                    dynamicControlData[i].value = valueList.join(",");
                    break;
                }
            }
            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            if (this.oAppModel.getProperty("/taskObjectDetails/processName") === "ProjectProposalDocumentApproval") {
                oTaskDetailModel.setProperty("/costCenterValue", valueList);
                this.createControlsFn();
            }
        },

        //method the create the attchment section
        attachmentDto: function () {
            var that = this;
            var attachmentHbox = new sap.m.HBox({
                justifyContent: "SpaceBetween",
                width: "40%"
            });

            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            oTaskDetailModel.setProperty("/attachmentValues", []);
            attachmentHbox.setModel(oTaskDetailModel, "oTaskDetailModel");
            attachmentHbox.bindAggregation("items", "oTaskDetailModel>/contentDto/2/contentDto", function (index, context) {
                var contextPath = context.getPath();
                var records = context.getObject();
                var attributeData = records.attributeValues;
                var fileName = records.label;
                var fileSize = "";
                var extension;
                var attachmentValues = oTaskDetailModel.getProperty("/attachmentValues");
                var attachmentObject = {
                    attachmentSize: "",
                    attachmentType: "",
                    attachmentName: "",
                    attachmentId: ""

                };
                for (var i = 0; i < attributeData.length; i++) {
                    if (attributeData[i].key === "attachmentName") {
                        fileName = attributeData[i].attributeValue;
                        attachmentObject.attachmentName = attributeData[i].attributeValue;
                    } else if (attributeData[i].key === "attachmentSize") {
                        fileSize = attributeData[i].attributeValue;
                        attachmentObject.attachmentSize = attributeData[i].attributeValue;

                    } else if (attributeData[i].key === "attachmentType") {
                        extension = attributeData[i].attributeValue.split("/")[1];
                        attachmentObject.attachmentType = attributeData[i].attributeValue;
                    } else if (attributeData[i].key === "attachmentId") {
                        attachmentObject.attachmentId = attributeData[i].attributeValue;
                    }
                }
                attachmentValues.push(attachmentObject);
                var item = new sap.m.HBox({
                    alignItems: "Center",
                    renderType: "Bare",
                    width: "100%",
                    visible: "{= ${oTaskDetailModel>attributeValues}.length>0}"
                }).addItem(new sap.m.Image({
                    src: "{parts: ['oTaskDetailModel>value','oTaskDetailModel>attributeValues/1/attributeValue'] ,formatter: 'oneapp.incture.workbox.util.formatter.wbParseAttachmentType'}",
                    press: function (oEvent) {
                        that.onAttachmentPress(oEvent);
                    }.bind(this)
                }).addStyleClass("wbCreateTaskFragmentAttachmentImage"))
                    .addItem(new sap.m.VBox({
                        renderType: "Bare"
                    }).addStyleClass("sapUiTinyMarginBegin")
                        .addItem(new sap.m.Text({
                            text: fileName + "." + extension
                        }).addStyleClass("wbTaskDetailFileNameClass")).addItem(new sap.m.Text({
                            text: "{path: 'oTaskDetailModel>attributeValues/0/attributeValue' ,formatter: 'oneapp.incture.workbox.util.formatter.wbAttachmentSizeParser'}"
                        }).addStyleClass("sapUiTinyMarginTop wbTaskDetailFileSizeClass")));
                return item;
            });
            var vbox = new sap.m.VBox({
                renderType: "Bare",
                width: "416%"
            }).addItem(new sap.m.HBox({
                renderType: "Bare",
                alignItems: "Center",
                width: "103%"
            }).addStyleClass("wbTaskDetailAttachmentClass sapUiTinyMarginBottom")
                .addItem(new sap.m.Text({
                    text: this.getView().getModel("i18n").getResourceBundle().getText("ATTACHMENTS_TEXT")
                }).addStyleClass("sapUiTinyMarginBottom"))).addItem(attachmentHbox);
            return vbox;
        },

        //on click of attachment downloading and viewing of the attachment details
        onAttachmentPress: function (oEvent) {
            var attributeData = oEvent.getSource().getBindingContext("oTaskDetailModel").getObject().attributeValues;
            var value;
            var attachmentType, fileSize;
            var fileName = oEvent.getSource().getBindingContext("oTaskDetailModel").getObject().label;
            for (var i = 0; i < attributeData.length; i++) {
                if (attributeData[i].key === "attachmentId") {
                    value = attributeData[i].attributeValue;
                } else if (attributeData[i].key === "attachmentType") {
                    attachmentType = attributeData[i].attributeValue;
                    attachmentType = attachmentType.toLocaleLowerCase();
                } else if (attributeData[i].key === "attachmentName") {
                    fileName = attributeData[i].attributeValue;
                } else if (attributeData[i].key === "attachmentSize") {
                    fileSize = attributeData[i].attributeValue;
                }
            }
            this.downloadAttachment(value, attachmentType, fileName, null, fileSize);
        },

        //saving the task level attributes function - post call 
        saveAttributesFn: function () {
            var validation = true;
            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            var data = oTaskDetailModel.getData().contentDto;
            var contentDto = [];
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].dataType === "TASKDETAILS") {
                        contentDto = data[i].contentDto;
                    }
                }
            }
            var customAttributes = [];
            if (contentDto) {
                for (var j = 0; j < contentDto.length; j++) {
                    if (contentDto[j].isMandatory && !contentDto[j].value) {
                        this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
                        validation = false;
                        break;
                    }
                    if (typeof (contentDto[j].value) !== "string") {
                        contentDto[j].value = contentDto[j].value.join(",");
                    }
                    var obj = {
                        "key": contentDto[j].key,
                        "attributeValue": contentDto[j].value
                    };
                    customAttributes.push(obj);
                }
            }
            var postData = {
                "customAttributes": customAttributes,
                "eventId": this.oAppModel.getProperty("/taskObjectDetails/taskId")
            };

            if (customAttributes.length) {
                var url = "oneappinctureworkbox/WorkboxJavaService/tasks/updateTaskAttributes";
                this.doAjax(url, "POST", postData, function (oData) {
                    //this._showToastMessage(oData.message);
                }.bind(this),
                    function (oData) { }.bind(this));
            }
            return validation;
        },

        //saving the task level attributes function - post call 
        updateAttributesFn: function () {
            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            var postData = {};
            var layouts = oTaskDetailModel.getData().contentDto.layouts;
            for (var i = 0; i < layouts.length; i++) {
                var attributes;
                var tableData;
                var arr = [];
                var key;
                var value;
                var sourceKey;
                var obj;
                if (layouts[i].layoutType.toLowerCase() === "grid") {
                    attributes = layouts[i].layoutAttributes;
                    sourceKey = attributes[0].sourceKey;
                    for (var j = 0; j < attributes.length; j++) {
                        obj = {};
                        key = attributes[j].key;
                        value = attributes[j].keyValue;
                        if (!sourceKey) {
                            postData[key] = value;
                        } else {
                            obj.key = key;
                            obj.valueHelp = attributes[j].valueHelpId;
                            obj.value = value;
                            arr.push(obj);
                        }
                    }
                    if (sourceKey) {
                        postData[sourceKey] = arr;
                    }
                } else if (layouts[i].layoutType.toLowerCase() === "table") {
                    tableData = layouts[i].data;
                    for (var z = 0; z < tableData.length; z++) {
                        attributes = tableData[z].layoutAttributes;
                        obj = {};
                        sourceKey = attributes[0].sourceKey;
                        for (var j = 0; j < attributes.length; j++) {
                            key = attributes[j].key;
                            value = attributes[j].keyValue;
                            obj[key] = value;
                        }
                        arr.push(obj);
                    }
                    postData[sourceKey] = arr;
                }
            }
            var processId = this.oAppModel.getProperty("/taskObjectDetails/processId");
            var url = "oneappinctureworkbox/WorkboxJavaService/workFlow/updateWorkflowContextData?processId=" + processId;
            this.doAjax(url, "POST", postData, function (oData) {
                this._showToastMessage(oData.message);
                this.getTaskDetails();
            }.bind(this),
                function (oData) { }.bind(this));
        },

        //Unilab POC
        resubmitFn: function (oEvent) {
            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            var taskObjectDetails = this.getModel("oAppModel").getProperty("/taskObjectDetails");
            var missingField = false,
                isBudgetAllow = true,
                value, dateExpired = false;
            var template = {
                "actionType": "Resubmit",
                "isEdited": null,
                "processId": taskObjectDetails.processId,
                "processName": taskObjectDetails.processName,
                "requestId": taskObjectDetails.requestId,
                "resourceid": "",
                "type": "Single Instance",
                "listOfProcesssAttributes": [{
                    "resourceId": "",
                    "customAttributeTemplateDto": [{
                        "processName": "STANDARD",
                        "key": "description",
                        "label": "Description",
                        "processType": null,
                        "isEditable": null,
                        "isActive": true,
                        "isMandatory": true,
                        "isEdited": 0,
                        "attrDes": "",
                        "value": "Description",
                        "dataType": "TEXT AREA",
                        "valueList": null,
                        "attachmentType": null,
                        "attachmentSize": null,
                        "attachmentName": null,
                        "attachmentId": null,
                        "dataTypeKey": 0,
                        "dropDownType": null,
                        "url": null,
                        "taskId": "",
                        "origin": null,
                        "attributePath": null,
                        "dependantOn": null,
                        "rowNumber": 0,
                        "tableAttributes": null,
                        "isDeleted": false
                    }]
                }]
            };
            var customAttributeTemplateDto = {
                "attachmentName": null,
                "attachmentSize": null,
                "attachmentType": null,
                "attachmentId": null,
                "attributePath": null,
                "dependantOn": null,
                "isDeleted": false,
                "origin": "Process",
                "rowNumber": 0,
                "tableAttributes": null,
                "attrDes": "",
                "dataType": "TEXT AREA", //to fill
                "dataTypeKey": 0,
                "dropDownType": null,
                "isActive": true,
                "isEditable": null,
                "isEdited": 0,
                "isMandatory": true,
                "key": "description", //to fill
                "label": "Description", //to fill
                "processName": this.getModel("oAppModel").getProperty("/taskObjectDetails/processName"),
                "processType": null,
                "taskId": "",
                "url": null,
                "value": "", //to fill
                "valueList": null,
                "editableValue": false
            };
            var attachmentDto = {
                "processName": this.getModel("oAppModel").getProperty("/taskObjectDetails/processName"),
                "key": null, //to be added
                "label": "Attachments",
                "processType": null,
                "isEditable": true, // to be added
                "isActive": true, //to be added
                "isMandatory": false, //to be added
                "isEdited": 0,
                "attrDes": "Attachments",
                "value": "",
                "dataType": "INPUT",
                "valueList": [],
                "attachmentType": "", //tobe added
                "attachmentSize": null, //to be added
                "attachmentName": "", //to be added
                "attachmentId": null, //to be added
                "dataTypeKey": 0,
                "dropDownType": null,
                "url": null,
                "taskId": null,
                "origin": "Process",
                "attributePath": null,
                "dependantOn": null,
                "rowNumber": 0,
                "tableAttributes": null,
                "isDeleted": false
            };

            if (taskObjectDetails.processName === "AFENexus") {
                var contentDto = oTaskDetailModel.getProperty("/contentDto/0/contentDto");
                for (var i = 0; i < contentDto.length; i++) {
                    var tempCA = jQuery.extend(true, {}, customAttributeTemplateDto);
                    tempCA.dataType = contentDto[i].dataType;
                    if (contentDto[i].attributePath) {
                        tempCA.key = contentDto[i].attributePath.slice(2, contentDto[i].attributePath.length - 1);
                    } else {
                        tempCA.key = contentDto[i].key;
                    }
                    tempCA.label = contentDto[i].label;
                    tempCA.isRunTime = contentDto[i].isRunTime;
                    if (tempCA.isRunTime) {
                        tempCA.dataTypeKey = 1;
                        tempCA.dropDownType = contentDto[i].runTimeType;
                        tempCA.url = contentDto[i].url;
                        var arr = [];
                        tempCA.valueList = [];
                        if (typeof (contentDto[i].value) === "string") {
                            arr = (contentDto[i].value).split(",");
                        } else {
                            arr = contentDto[i].value;
                        }
                        for (var z = 0; z < arr.length; z++) {
                            var obj = {
                                "id": arr[z],
                                "type": contentDto[i].runTimeType
                            };
                            tempCA.valueList.push(obj);
                        }
                    } else {
                        tempCA.value = contentDto[i].value;
                    }
                    tempCA.isMandatory = contentDto[i].isMandatory;
                    tempCA.isEditable = contentDto[i].isEditable;
                    tempCA.isActive = contentDto[i].isActive;
                    tempCA.dataType = contentDto[i].dataType;
                    tempCA.runTimeType = contentDto[i].runTimeType;
                    template.listOfProcesssAttributes[0].customAttributeTemplateDto.push(tempCA);
                }
                var attachmentContent = oTaskDetailModel.getProperty("/contentDto/2/contentDto");
                if (attachmentContent && attachmentContent.length > 0) {
                    var savedAttachment = oTaskDetailModel.getProperty("/attachmentValues");
                    for (i = 0; i < attachmentContent.length; i++) {
                        var tempAttachment = jQuery.extend(true, {}, attachmentDto);
                        tempAttachment.isEditable = attachmentContent[i].isEditable;
                        tempAttachment.dataType = "INPUT";
                        tempAttachment.isVisible = attachmentContent[i].isVisible;
                        tempAttachment.isActive = attachmentContent[i].isActive;
                        tempAttachment.isMandatory = attachmentContent[i].isMandatory;
                        tempAttachment.label = attachmentContent[i].label;
                        tempAttachment.processName = "AFENexus";
                        if (attachmentContent[i].attributeValues.length > 0) {
                            tempAttachment.value = JSON.stringify(savedAttachment);
                        }
                        if (attachmentContent[i].attributePath) {
                            tempAttachment.key = attachmentContent[i].attributePath.slice(2, attachmentContent[i].attributePath.length - 1);
                        } else {
                            tempAttachment.key = JSON.stringify(savedAttachment);
                        }
                        template.listOfProcesssAttributes[0].customAttributeTemplateDto.push(tempAttachment);
                    }
                }
                this.reCreateTask(template);
            } else {
                var contentDto = oTaskDetailModel.getProperty("/contentDto/0/contentDto");
                var costCenterSelected = oTaskDetailModel.getProperty("/contentDto/0/contentDto/" + oTaskDetailModel.getProperty(
                    "/costCenterIndex") +
                    "/value").split(",");
                var budgeBalance = oTaskDetailModel.getProperty("/contentDto/0/contentDto/" + oTaskDetailModel.getProperty("/budgeIndex") +
                    "/value");
                var remainingBudget = budgeBalance / costCenterSelected.length;
                for (var i = 0; i < contentDto.length; i++) {
                    var tempCA = jQuery.extend(true, {}, customAttributeTemplateDto);
                    tempCA.dataType = contentDto[i].dataType;
                    if (contentDto[i].attributePath) {
                        tempCA.key = contentDto[i].attributePath.slice(2, contentDto[i].attributePath.length - 1);
                    } else {
                        tempCA.key = contentDto[i].key;
                    }
                    tempCA.label = contentDto[i].label;
                    tempCA.value = contentDto[i].value;
                    tempCA.valueList = contentDto[i].valueList || [];
                    tempCA.isMandatory = contentDto[i].isMandatory;
                    tempCA.isEditable = contentDto[i].isEditable;
                    tempCA.isActive = contentDto[i].isActive;
                    if (tempCA.label.includes("Available Budget") && tempCA.value) {
                        tempCA.value = tempCA.value.replace(/[^A-Z0-9]/ig, "");
                        tempCA.value = parseInt(tempCA.value, 10) || 0;
                        if (isBudgetAllow && costCenterSelected.length > 0) {
                            for (var j = 0; j < costCenterSelected.length; j++) {
                                if (tempCA.label.includes(costCenterSelected[j]) && tempCA.value < remainingBudget) {
                                    isBudgetAllow = false;
                                }
                            }
                        }

                    } else if (contentDto[i].label.includes("Closure Date") && new Date().getTime() >= new Date(contentDto[i].value).getTime()) {
                        dateExpired = true;
                    }
                    template.listOfProcesssAttributes[0].customAttributeTemplateDto.push(tempCA);

                }
                var attachmentContent = oTaskDetailModel.getProperty("/contentDto/2/contentDto");
                if (attachmentContent && attachmentContent.length > 0) {
                    var savedAttachment = oTaskDetailModel.getProperty("/attachmentValues");
                    for (i = 0; i < attachmentContent.length; i++) {
                        var tempAttachment = jQuery.extend(true, {}, attachmentDto);
                        tempAttachment.isEditable = attachmentContent[i].isEditable;
                        tempAttachment.isActive = attachmentContent[i].isActive;
                        tempAttachment.isMandatory = attachmentContent[i].isMandatory;
                        if (attachmentContent[i].attributeValues.length > 0) {
                            tempAttachment.value = JSON.stringify(savedAttachment);
                        }
                        if (attachmentContent[i].attributePath) {
                            tempAttachment.key = attachmentContent[i].attributePath.slice(2, attachmentContent[i].attributePath.length - 1);
                        } else {
                            tempAttachment.key = attachmentContent[i].key;
                        }
                        template.listOfProcesssAttributes[0].customAttributeTemplateDto.push(tempAttachment);
                    }
                }
                if (!missingField && isBudgetAllow && !dateExpired) {
                    this.reCreateTask(template);
                } else if (!isBudgetAllow) {
                    // Budget Exceed
                    this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("BUDGET_EXCEEDED_TEXT"));
                } else if (dateExpired) {
                    // Time
                    this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("PROJECT_CLOSURE_DATE_ERR_TEXT"));
                }
            }
        },
        reCreateTask: function (template) {
            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            oTaskDetailModel.setProperty("/customInstance", template);
            oTaskDetailModel.setProperty("/singleInstance", true);
            oTaskDetailModel.setProperty("/multipleInstance", false);
            var missingField = taskManagement.validateMandatoryFieldTM("Resubmit", oTaskDetailModel);
            if (!missingField) {
                this.doAjax("oneappinctureworkbox/WorkboxJavaService/tasks/createTasks", "POST", template, function (oData) {
                    if (oData.status !== "FAILURE") {
                        this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("RESUBMITTED_SUCCESSFULLY_TEXT"));
                        setTimeout(function () {
                            oTaskDetailModel.setProperty("/isUpdated", false);
                            this.setCurrentPage("CreatedTasks", "CreatedTasks", "Created Tasks", false);
                            this.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", "CreatedTasks");
                            this._doNavigate("UnifiedInbox", {});
                        }.bind(this), 1000);

                    } else {
                        this._showToastMessage(oData.message);
                    }
                }.bind(this), function (oEvent) { }.bind(this));
            } else if (missingField) {
                this._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("FILL_MANDATORY_DETAILS_TEXT"));
            }
        },
        closePPDAAction: function () {
            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            var oPayload = {
                "eventId": this.oAppModel.getProperty("/taskObjectDetails/taskId"),
                "customAttributes": [{
                    "taskId": this.oAppModel.getProperty("/taskObjectDetails/processId"),
                    "processName": "238394c8j2hg2",
                    "key": "gia69b268cfe",
                    "attributeValue": "Closed"
                }]
            };
            this.doAjax("oneappinctureworkbox/WorkboxJavaService/tasks/updateTaskAttributes", "POST", oPayload, function (oData) {
                if (oData.status !== "FAILURE") {
                    this._showToastMessage(this.oAppModel.getProperty("/taskObjectDetails/taskDescription") + " " + this.getView().getModel("i18n").getResourceBundle().getText("CLOSED_SUSSESSFULLY_TEXT") + ".");
                    setTimeout(function () {
                        oTaskDetailModel.setProperty("/isUpdated", false);
                        oTaskDetailModel.setProperty("/isClosePPDA", false);
                        oTaskDetailModel.setProperty("/isResubmitPPDA", false);
                        this.setCurrentPage("CompletedTasks", "CompletedTasks", "Completed Tasks", false);
                        this.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", "CompletedTasks");
                        this._doNavigate("UnifiedInbox", {});
                    }.bind(this), 1000);

                } else {
                    this._showToastMessage(oData.message);
                }
            }.bind(this), function (oEvent) { }.bind(this));
        },

        //if the process is ariba then getting the ariba task details
        getAribaDetails: function () {
            var oAppModel = this.oAppModel;
            var taskId = oAppModel.getProperty("/taskObjectDetails/processId");
            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            var url = "/WorkboxServices/sapAriba/getDetail/" + taskId;
            oTaskDetailModel.setProperty("/enableBusyIndicators/aribaContent", true);
            this.doAjax(url, "GET", null, function (oData) {
                oTaskDetailModel.setProperty("/aribaDetails", oData);
                this.createAribaSupplierControlsFn();
                this.createAwardDetailsControlsFn();
                oTaskDetailModel.setProperty("/enableBusyIndicators/aribaContent", false);
            }.bind(this), function (oError) { }.bind(this));
        },

        //function to create the ariba (supplier table) content details
        createAribaSupplierControlsFn: function () {
            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            var oData = oTaskDetailModel.getProperty("/aribaDetails");
            var keys = Object.keys(oData.report);
            var values = Object.values(oData.report);
            var reportArray = [];
            for (var i = 0; i < keys.length; i++) {
                var obj = {
                    "header": keys[i],
                    "values": values[i]
                };
                reportArray.push(obj);
            }
            oTaskDetailModel.setProperty("/aribaDetails/reportDetails", reportArray);
            var supplierData = oData.supplierDetail;
            var headerData = supplierData.headerdto;
            var lineItemData = [];
            var lineItems = supplierData.valueDto;
            for (var i = 0; i < lineItems.length; i++) {
                var obj = {};
                obj.itemName = lineItems[i].itemName;
                obj.leadParticipant = lineItems[i].leadParticipant;
                obj.quantity = lineItems[i].quantity;
                obj.initial = lineItems[i].initial;
                obj.historic = lineItems[i].historic;
                obj.leading = lineItems[i].leading;
                var prices = lineItems[i].prices;
                for (var j = 0; j < prices.length; j++) {
                    obj["prices" + j] = prices[j];
                }
                obj.savings = lineItems[i].savings;
                lineItemData.push(obj);
            }
            oTaskDetailModel.setProperty("/tableSupplierLineItem", lineItemData);
            oTaskDetailModel.setProperty("/supplierHeaderData", headerData);
            var supplierListTable = this.getView().byId("WB_TASK_DETAIL_SUPPLIER_TABLE");
            supplierListTable.bindAggregation("columns",
                "oTaskDetailModel>/supplierHeaderData",
                function (index, context) {
                    var column = new sap.m.Column({
                        header: new sap.m.HBox({
                            width: "100%",
                            justifyContent: "SpaceBetween",
                            alignItems: "Center"
                        }).addItem(new sap.m.Text({
                            text: context.getObject().name,
                            wrapping: true
                        }))
                    });
                    return column;
                });
            supplierListTable.bindItems("oTaskDetailModel>/tableSupplierLineItem", function (index, context) {
                var obj = context.getObject();
                var row = new sap.m.ColumnListItem({});
                for (var k in obj) {
                    row.addCell(new sap.m.Text({
                        text: obj[k],
                        tooltip: obj[k]
                    }));
                }
                return row;
            });
        },

        //function to create the ariba (award table) content details
        createAwardDetailsControlsFn: function () {
            var oTaskDetailModel = this.getModel("oTaskDetailModel");
            var oData = oTaskDetailModel.getProperty("/aribaDetails");
            var awardDetails = oData.awardDetails;
            var headerDto = [];
            var keys = Object.keys(oData.awardDetails[0]);
            var obj = {
                "name": keys[0]
            };
            headerDto.push(obj);
            var Subkeys = Object.keys(oData.awardDetails[0].awards[0]);
            for (var i = 0; i < Subkeys.length; i++) {
                var obj1 = {
                    "name": Subkeys[i]
                };
                headerDto.push(obj1);
            }
            oTaskDetailModel.setProperty("/awardHeaderData", headerDto);
            var lineItemData = [];
            var lineItems = oData.awardDetails;
            var itemName = "";
            for (var i = 0; i < lineItems.length; i++) {
                var awardLineItem = lineItems[i].awards;
                for (var j = 0; j < awardLineItem.length; j++) {
                    var obj = {};
                    if (itemName !== lineItems[i].itemName) {
                        obj.itemName = lineItems[i].itemName;
                        itemName = obj.itemName;
                    } else {
                        obj.itemName = "";
                    }
                    obj.allocation = awardLineItem[j].allocation;
                    obj.extendedPrize = awardLineItem[j].extendedPrize;
                    obj.price = awardLineItem[j].price;
                    obj.quantity = awardLineItem[j].quantity;
                    obj.savings = awardLineItem[j].savings;
                    obj.supplierName = awardLineItem[j].supplierName;
                    lineItemData.push(obj);
                }
            }
            oTaskDetailModel.setProperty("/awardTableLineItem", lineItemData);
            var awardDetailsTable = this.getView().byId("WB_TASK_DETAIL_AWARD_TABLE");
            awardDetailsTable.bindAggregation("columns",
                "oTaskDetailModel>/awardHeaderData",
                function (index, context) {
                    var column = new sap.m.Column({
                        header: new sap.m.HBox({
                            width: "100%",
                            justifyContent: "SpaceBetween",
                            alignItems: "Center"
                        }).addItem(new sap.m.Text({
                            text: context.getObject().name,
                            wrapping: true
                        })).addStyleClass("wbTransformCapitalise")
                    });
                    return column;
                });
            awardDetailsTable.bindItems("oTaskDetailModel>/awardTableLineItem", function (index, context) {
                var obj = context.getObject();
                var row = new sap.m.ColumnListItem({});
                for (var k in obj) {
                    row.addCell(new sap.m.Text({
                        text: obj[k],
                        tooltip: obj[k]
                    }));
                }
                return row;
            });
        },

        //closing the task detail page and navigating to inbox
        closeTaskDetailPage: function () {
            var oTaskDetailModel = this.getView().getModel("oTaskDetailModel");
            if (oTaskDetailModel.getProperty("/newWindow")) {
                oTaskDetailModel.getProperty("/newWindow").close();
            }
            var oActionHeader = this.getModel("oActionHeader");
            oActionHeader.setProperty("/selectedItemLength", 0);
            oTaskDetailModel.setProperty("/costCenterValue", undefined);
            this.oAppModel.setProperty("/settings/notification/notificationClicked", false);
            if (this.oAppModel.getProperty("/previousPage") === "chat") {
                this.oAppModel.setProperty("/toChat", true);
                this._doNavigate("Chat", {});
            } else if (this.oAppModel.getProperty("/previousPage") === "userWorkLoad") {
                this.oAppModel.setProperty("/loadTableUserManagement", true);
                this._doNavigate("UserWorkLoad", {});
            } else {
                $("#frameId").attr("src", "");
                this._doNavigate("UnifiedInbox", {});
            }
        },

        /*****Development by Vaishnavi - end*****/

        /***To set the action buttons ****/
        /***Development By Varali -Start***/
        wbDataForHeaderButtons: function () {
            var that = this;
            var oAppModel = this.oAppModel;
            var taskDetails = oAppModel.getProperty("/taskObjectDetails");
            ///
            var selectedTasksArray = [];
            var status = taskDetails.status;
            var taskType = taskDetails.taskType;
            var tab = oAppModel.getProperty("/inboxTab"); // different tabs in unifiedInbox
            if (!tab) {
                tab = "myTasks";
            }
            var currentView = oAppModel.getProperty("/currentView"); // UnifiedInbox or TaskDetailPage
            var currentViewPage = oAppModel.getProperty("/currentViewPage");
            var multiselect = false;
            var isAriba = false;
            ///
            selectedTasksArray.push(taskDetails);
            oAppModel.setProperty("/selectedTasksArray", selectedTasksArray);

            //checking process condition - vaishnavi
            var isJabil = false;
            if (this.getModel("oTaskDetailModel").getProperty("/roleEditableValue") || taskDetails.processName === "WorkNet Project") {
                isJabil = true;
            }
            var hideButtons = [];
            if (taskDetails.processName === "ProjectProposalDocumentApproval") {
                hideButtons = ["Claim", "Release"];
            } else if (taskDetails.processName === "SIGNING") {
                hideButtons = ["Claim", "Release", "Approve", "Reject"];
            }
            /********** task owner-Chnages by karishma **********/
            var oCollaborationModel = this.getModel("oCollaborationModel");
            var bIsTaskOwner = oCollaborationModel.getProperty("/bIsTaskOwner");
            /********** task owner-Chnages by karishma **********/
            if (bIsTaskOwner) {
                workbox.wbCommonSubheaderAction(that, status, taskType, tab, currentView, currentViewPage, multiselect, false, isJabil,
                    hideButtons);
            } else {
                oCollaborationModel.setProperty("/bIsTaskOwner", true);
                sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().resetActionButtons();
            }
        },
        /***Development By Varali -End***/
        openGUI: function () {
            var requestId = this.oAppModel.getProperty("/taskObjectDetails/requestId");
			/*var url = "http://34.210.142.28:8080/sap/bc/gui/sap/its/webgui?~transaction=*ME23N%20MEPO_SELECT-EBELN=" + requestId +
				";DYNP_OKCODE=SHOW";*/

            window.open(url);
        }

    });
});
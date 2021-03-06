sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "dashboard/util/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/ui/model/Sorter"
],
    function (Controller, formatter, JSONModel, Filter, FilterOperator, MessageBox, BusyDialog, Sorter) {
        "use strict";
        var that, oView, oView1, oBusyDilog, oi18n;
        return Controller.extend("dashboard.controller.Home", {
            onInit: function () {
                that = this;
                oView = this.getView();
                oView1 = this.getOwnerComponent();
                oi18n = this.getOwnerComponent().getModel("i18n");
                oBusyDilog = new BusyDialog({
                    text: oi18n.getProperty("BusyTxt")   //initialize Busy Dialog
                });

                // window.addEventListener("resize", this.fnScreenResize); //Event to be triggered on screen resize
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("Home").attachMatched(this.fnVendorRequestRoute, this);

            },
               
            onAfterRendering: function () {
                // this.fnVendorRequestRoute();
                // oView.byId("purchaseOrgId").addEventDelegate({
                //     ontap: this.fnLiveChangePurchaseOrg
                // }, this);
            },
            fnNavToGraph: function () {
                this.getOwnerComponent().getRouter().navTo("Reports");
            },
            fnScreenResize: function () {
                setTimeout(function () {
                    var vTableHeight;
                    vTableHeight = that.getView().byId("id_Container").getDomRef().offsetHeight - that.getView().byId("id_FitlerPanel").getDomRef()
                        .offsetHeight;

                    vTableHeight = vTableHeight - 80;
                    vTableHeight = vTableHeight - 99;
                    var vRow = parseInt(vTableHeight / 33);

                    oView.getModel("oConfigMdl").getData().pageLimit = vRow;
                    oView.getModel("oConfigMdl").refresh();
                    that.fnLoadSupplierList();
                }, 500);
            },
            fnVendorRequestRoute: function (oEvent) {

                var temp = {
                    "caseId": "",
                    "dateCreated": "",
                    "status": "",
                    "partnerId": "",
                    "purchasingOrg": "",
                    "companyCode": "",
                    "buyerFilterSel":false,
                    "organizationName": ""

                }
                var oSupplierListHeader = new sap.ui.model.json.JSONModel();
                oSupplierListHeader.setData(temp);
                oView.setModel(oSupplierListHeader, "JMSuppReqListHeader");
                var temp1 = {
                    "data": [],
                    "totalPage": 1,
                    "totalCount": 0,
                    "currentPage": 1,
                    "headerText": "Supplier Request List (0)"
                }
                var oSupplierList = new sap.ui.model.json.JSONModel();
                oSupplierList.setData(temp1);
                oView.setModel(oSupplierList, "JMSuppReqList");
                that.fnScreenResize();
                //  that.fnClearSearch();
                that.fnLoadCompCode();
               // that.fnLoadPOrg();
                that.fnLoadStatus();


                // this.fnLoadUser();
            },

            // fnLoadCompCode: function () {
            //     var oModel = new JSONModel();
            //     var sUrl = "/dashboard/plcm_portal_services/lookup/comCode";
            //     oModel.loadData(sUrl, {
            //         "Content-Type": "application/json"
            //     });
            //     oModel.attachRequestCompleted(function (oEvent) {
            //         if (oEvent.getParameter("success")) {
            //             oView1.getModel("oBPLookUpMdl").setProperty("/CompCodeLp", oEvent.getSource().getData());
            //             oView1.getModel("oBPLookUpMdl").refresh();
            //         }
            //     });
            // },
              fnLoadCompCode: function () {
                var oModel = new JSONModel();
                var sUrl = "/dashboard/plcm_portal_services/api/v1/reference-data/company-codes";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/CompanyCode", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });
            },


            // fnLoadPOrg: function () {
            //     var oModel = new JSONModel();
            //     var sUrl = "/dashboard/plcm_portal_services/lookup/POrg";
            //     oModel.loadData(sUrl, {
            //         "Content-Type": "application/json"
            //     });
            //     oModel.attachRequestCompleted(function (oEvent) {
            //         if (oEvent.getParameter("success")) {
            //             oView1.getModel("oBPLookUpMdl").setProperty("/PurchOrgLp", oEvent.getSource().getData());
            //             oView1.getModel("oBPLookUpMdl").refresh();
            //         }
            //     });

            // },

            fnLoadPurOrg: function (vCompCode, vDescription) {
                var oModel = new JSONModel();
                var sUrl = "/dashboard/plcm_portal_services/api/v1/reference-data/purchasingOrg/" + vCompCode;
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/PurOrg", oEvent.getSource().getData());
                        if (oEvent.getSource().getData().length == 0) {
                            if (vDescription) {
                                if (vDescription.includes("Nypro")) {
                                    var temp = [{
                                        "code": "0155",
                                        "description": "Nypro Inc."
                                    }]
                                    oView.getModel("oBPLookUpMdl").setProperty("/PurOrg", temp);
                                }
                            }
                        }
                        oView.getModel("oBPLookUpMdl").refresh();
                    } else {
                        if (vDescription) {
                            if (vDescription.includes("Nypro")) {
                                var temp = [{
                                    "code": "0155",
                                    "description": "Nypro Inc."
                                }]
                                oView.getModel("oBPLookUpMdl").setProperty("/PurOrg", temp);
                            }
                        }
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });

            },
                fnLiveChangeCompCode: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                // if (vSelected == false) {
                //     oEvent.getSource().setValue("");
                // }
                this.fnLoadPurOrg(oView.getModel("JMSuppReqListHeader").getData().companyCode, oEvent.getSource().getSelectedItem().getAdditionalText());
                oView.getModel("JMSuppReqListHeader").getData().purchasingOrg = "";
                oView.getModel("JMSuppReqListHeader").refresh();
                if (oView.getModel("JMSuppReqListHeader").getData().companyCodee == "Error") {
                    oView.getModel("JMSuppReqListHeader").getData().companyCodee = "None";
                    oView.getModel("JMSuppReqListHeader").getData().companyCodem = "";
                    oView.getModel("JMSuppReqListHeader").refresh();
                }

            },

            fnLiveChangePurchaseOrg: function(oEvent){
                
                var compCode= oView.getModel("JMSuppReqListHeader").getData().companyCode;
                if(compCode === "" || compCode === undefined){
                    sap.m.MessageToast.show(oi18n.getProperty("SelectCompanyCode"));
                    
                }
                
            },

            fnLoadStatus: function () {

                var oModel = new JSONModel();
                var sUrl = "/dashboard/plcm_portal_services/case/list/portalStatus";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setProperty("/StatusLp", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                    }
                });

                // var aStatus = ["Draft", "In Progress", "Completed", "Disqualified"

                // ]
                // oView1.getModel("oBPLookUpMdl").setProperty("/StatusLp", aStatus);
                // oView1.getModel("oBPLookUpMdl").refresh();
            },

            fnLoadSupplierList: function () {

            var vBuyerName = "";
            if(oView.getModel("JMSuppReqListHeader").getData().buyerFilterSel == true){
                vBuyerName =  oView.getModel("oConfigMdl").getData().usrData.givenName;
            }
                oBusyDilog.open();
                var oModel = new JSONModel();
                var sUrl = "/dashboard/plcm_portal_services/case/search";
                var oPayload = {
                    "address1": "",
                    "address2": "",
                    "caseId": oView.getModel("JMSuppReqListHeader").getData().caseId,
                    "companyCode": oView.getModel("JMSuppReqListHeader").getData().companyCode,
                    "dateCreated": oView.getModel("JMSuppReqListHeader").getData().dateCreated,
                    "limit": oView.getModel("oConfigMdl").getData().pageLimit,
                    "pageNo": oView.getModel("JMSuppReqList").getData().currentPage - 1,
                    "partnerId": oView.getModel("JMSuppReqListHeader").getData().partnerId,
                    "plant": "",
                    "purchasingOrg": oView.getModel("JMSuppReqListHeader").getData().purchasingOrg,
                    "portalStatus": oView.getModel("JMSuppReqListHeader").getData().status,
                    "organizationName": oView.getModel("JMSuppReqListHeader").getData().organizationName,
                    "buyerName":vBuyerName
                };
                oModel.loadData(sUrl, JSON.stringify(oPayload), true, "POST", false, true, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    oBusyDilog.close();
                    if (oEvent.getParameter("success")) {

                        var vTotalPage = parseFloat(oEvent.getSource().getData().totatRecords) / Number(oView.getModel("oConfigMdl").getData().pageLimit);
                        if (vTotalPage > 1) {
                            if (vTotalPage % 1 !== 0) {
                                vTotalPage = Number(vTotalPage) + 1;
                            }


                        } else {
                            vTotalPage = 1;
                        }
                        vTotalPage = parseInt(vTotalPage);
                        var vfenable, vrenable;
                        if (vTotalPage == 1) {
                            vfenable = false;
                        }
                        else {
                            vfenable = true;
                        }
                        if (oView.getModel("JMSuppReqList").getData().currentPage == vTotalPage) {
                            vfenable = false;
                        }

                        if (oView.getModel("JMSuppReqList").getData().currentPage == 1) {
                            vrenable = false;
                        } else {
                            vrenable = true;
                        }

                        var temp = {
                            "data": oEvent.getSource().getData().bpRequests,
                            "totalPage": vTotalPage,
                            "fenable": vfenable,
                            "renable": vrenable,
                            "totalCount": oEvent.getSource().getData().totatRecords,
                            "currentPage": oView.getModel("JMSuppReqList").getData().currentPage,
                            "headerText": "Supplier Request List (" + oEvent.getSource().getData().totatRecords + ")"
                        }
                        var oData = oEvent.getSource().getData();
                        var oSupplierList = new sap.ui.model.json.JSONModel();
                        oSupplierList.setData(temp);
                        oView.setModel(oSupplierList, "JMSuppReqList");
                        if (oData.statusCode === "0" || (oData.responseMessage !== undefined ? oData.responseMessage.statusCode === "0" : false)) {

                        } else if (oData.statusCode === "1" || (oData.responseMessage !== undefined ? oData.responseMessage.statusCode === "1" : false)) {
                            var sMsg;
                            if (oData.message) {
                                sMsg = oData.message;
                            } else if (oData.responseMessage.message) {
                                sMsg = oData.responseMessage.message;
                            }
                            MessageBox.show(sMsg, {
                                icon: MessageBox.Icon.ERROR,
                                title: "Error"
                            });

                        }
                    } else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        var temp = {
                            "data": [],
                            "totalPage": 1,
                            "totalCount": 0,
                            "currentPage": 1,
                            "headerText": "Supplier Request List (0)"
                        }
                        var oSupplierList = new sap.ui.model.json.JSONModel();
                        oSupplierList.setData(temp);
                        oView.setModel(oSupplierList, "JMSuppReqList");

                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error"
                        });
                    }
                });
            },
            fnSearchSupplList: function (oEvent) {
                var vValue = oEvent.getSource().getValue();
                if (vValue && vValue.length > 0) {
                    var oFilter = new sap.ui.model.Filter("caseId", sap.ui.model.FilterOperator.Contains, vValue);
                    var oFilter1 = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.Contains, vValue);
                    var oFilter2 = new sap.ui.model.Filter("dateCreated", sap.ui.model.FilterOperator.Contains, vValue);
                    var oFilter4 = new sap.ui.model.Filter("companyCode", sap.ui.model.FilterOperator.Contains, vValue);
                    var oFilter5 = new sap.ui.model.Filter("organizationName", sap.ui.model.FilterOperator.Contains, vValue);
                    var oFilter6 = new sap.ui.model.Filter("purchasingOrg", sap.ui.model.FilterOperator.Contains, vValue);
                    var aFilter = new sap.ui.model.Filter([oFilter, oFilter1, oFilter2, oFilter4, oFilter5, oFilter6]);
                }
                var binding = oView.byId("id_VendorRequestList").getBinding("items");
                binding.filter(aFilter);
            },
            fnBuyerFilterSel:function(){
           // if(oView.getModel("JMSuppReqListHeader").getData().buyerFilterSel == true){
                this.fnLoadSupplierList();
          //  }
            },
            fnClearSearch: function () {


                var temp = {
                    "caseId": "",
                    "dateCreated": "",
                    "buyerFilterSel":false,
                    "status": "",
                    "partnerId": "",
                    "purchasingOrg": "",
                    "companyCode": "",
                    "organizationName": ""

                }
                var oSupplierListHeader = new sap.ui.model.json.JSONModel();
                oSupplierListHeader.setData(temp);
                oView.setModel(oSupplierListHeader, "JMSuppReqListHeader");

                that.fnLoadSupplierList();



            },


            fnNavToBPExtend: function () {
                this.getOwnerComponent().getRouter().navTo("BPExtend", {
                    Id: "New",
                    Name: "Display"
                });

            },


            fnCaseListPressNav: function (oEvent) {

                var params = {
                    "params": true
                };

                var isNew = oEvent.getSource().getBindingContext("JMSuppReqList").getProperty("isNew");
                var vStatus = oEvent.getSource().getBindingContext("JMSuppReqList").getProperty("status");

                params.isNew = isNew;
                var vCaseId = oEvent.getSource().getBindingContext("JMSuppReqList").getProperty("caseId");
                params.caseId = vCaseId;
                params.Enb = false;
                if(vStatus == "Draft"){
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: "buyerRegistration",
                        action: "Display"
                    },
                    params: params
                })) || "";


                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            }else{
                this.getOwnerComponent().getRouter().navTo("PreviewForm", {
                    caseId: vCaseId
                  
                });
            }

            },
            fnNextPage: function () {
                oView.getModel("JMSuppReqList").getData().currentPage = oView.getModel("JMSuppReqList").getData().currentPage + 1;
                this.fnLoadSupplierList();
            },
            fnPreviousPage: function () {
                oView.getModel("JMSuppReqList").getData().currentPage = oView.getModel("JMSuppReqList").getData().currentPage - 1;
                this.fnLoadSupplierList();
            },
            fnSortDiloag: function () {
                if (!that.oSorter) {
                    that.oSorter = sap.ui.xmlfragment(
                        "dashboard.fragment.Sorter", that);
                    oView.addDependent(that.oSorter);
                }
                that.oSorter.open();
            },
            handleSortDialogConfirm: function (oEvent) {
                var oTable = this.byId("id_VendorRequestList"),
                    mParams = oEvent.getParameters(),
                    oBinding = oTable.getBinding("items"),
                    sPath,
                    bDescending,

                    sPath = mParams.sortItem.getKey();
                bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));

                // apply the selected sort and group settings
                oBinding.sort(aSorters);
            },
            // fnLiveChangeCompCode: function (oEvent) {

            //     var vSelected = oEvent.getParameter("itemPressed");
            //     // if (!oEvent.getSource().getProperty("selectedKey")) {
            //     //     oEvent.getSource().setValue("");
            //     // }
            // },
            fnLiveChangePurchOrg: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                // if (vSelected == false) {
                //     oEvent.getSource().setValue("");
                // }

            },
            fnLiveChangeStatus: function (oEvent) {
                var vSelected = oEvent.getParameter("itemPressed");
                // if (vSelected == false) {
                //     oEvent.getSource().setValue("");
                // }

            },
            fnInputSpaceCheck: function (oEvent) {
                var spaceRegex = /^\s+$/;
                if (spaceRegex.test(oEvent.getSource().getValue())) {
                    oEvent.getSource().setValue("");
                }
            },
            fnNavToProcessFlow: function (oEvent) {

                var params = {
                    "params": true
                };
                var vCaseId = oEvent.getSource().getBindingContext("JMSuppReqList").getProperty("caseId");
                params.caseId = vCaseId;
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: "processFlow",
                        action: "display"
                    },
                    params: params
                })) || "";


                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    }
                });
            }
        });
    });

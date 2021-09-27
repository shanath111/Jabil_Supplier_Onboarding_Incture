var CustomKey, options, optionsR;
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "InboxDetail/util/formatter",
    "sap/ui/model/json/JSONModel"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, formatter, JSONModel) {
        "use strict";
        var DOTSGlobalAddressComplete, oView;
        return Controller.extend("InboxDetail.controller.POC", {

            fnLoadCountry: function (vBind) {

                var oModel = new JSONModel();
                var sUrl = "/InboxDetail/plcm_reference_data/api/v1/reference-data/countries";
                oModel.loadData(sUrl, {
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        oView.getModel("oBPLookUpMdl").setSizeLimit(10000);
                        oView.getModel("oBPLookUpMdl").setProperty("/Country", oEvent.getSource().getData());
                        oView.getModel("oBPLookUpMdl").refresh();
                        if (vBind == true) {
                            oView.getModel("JMBPCreate").getData().countryd = that.fnFetchDescriptionCommon(oView.getModel("oBPLookUpMdl").getData().Country, oView.getModel("JMBPCreate").getData().country, "Country")
                            oView.getModel("JMBPCreate").refresh();
                        }
                    }
                });
            },
            onInit: function () {
                var that = this;
                oView = this.getView();
                this.fnLoadCountry();
                var temp = {
                    "Visible": false,
                    "Visible1": false,
                    "BankKey": "9164403075"
                }
                var oBPCreateModelCmnt = new sap.ui.model.json.JSONModel();
                oBPCreateModelCmnt.setData(temp);
                oView.setModel(oBPCreateModelCmnt, "JMConfig");
                  setTimeout(function () {
                    var fields = [
                         { element: "iAddress1", field: "Address1", mode: so.fieldMode.SEARCH | so.fieldMode.POPULATE },
                          { element: "iCountry", field: "Country", mode: so.fieldMode.COUNTRY }

                    ];

                    CustomKey = "DBBFBF4BE8534789828D69479A804851";
                    options = { key: CustomKey, setCountryByIP: true };
                    DOTSGlobalAddressComplete = new so.Address(fields, options);
                  //  DOTSGlobalAddressComplete.setCountry(vCountry);

                }, 2000);
        
                // this.fnButton();
                // this.fnButton1();
                // setTimeout(function () {

                //     var fields = [
                //         { element: "iAddress1", field: "Address1", mode: so.fieldMode.SEARCH | so.fieldMode.POPULATE },
                //         { element: "iAddress2", field: "Address2", mode: so.fieldMode.POPULATE },
                //         { element: "iCity", field: "Locality", mode: so.fieldMode.POPULATE },
                //         { element: "iState", field: "AdminArea", mode: so.fieldMode.ADMINAREA },
                //         // { element: "iPostal", field: "PostalCode", mode: so.fieldMode.POPULATE },
                //         { element: "iCountry", field: "Country", mode: so.fieldMode.COUNTRY }
                //     ];

                //     CustomKey = "DBBFBF4BE8534789828D69479A804851";
                //     options = { key: CustomKey, setCountryByIP: true, Validate: true };
                //     DOTSGlobalAddressComplete = new so.Address(fields, options);
                //     var fields = [
                //         { element: "iAddress1R", field: "Address1", mode: so.fieldMode.SEARCH | so.fieldMode.POPULATE },
                //         { element: "iAddress2R", field: "Address2", mode: so.fieldMode.POPULATE },
                //         { element: "iCityR", field: "Locality", mode: so.fieldMode.POPULATE },
                //         { element: "iStateR", field: "AdminArea", mode: so.fieldMode.ADMINAREA },
                //         // { element: "iPostal", field: "PostalCode", mode: so.fieldMode.POPULATE },
                //         { element: "iCountryR", field: "Country", mode: so.fieldMode.COUNTRY }
                //     ];

                //     CustomKey = "DBBFBF4BE8534789828D69479A804851";
                //     options = { key: CustomKey, setCountryByIP: true, Validate: true };
                //     var DOTSGlobalAddressCompleteR = new so.Address(fields, options);

                // }, 1000);

            },
            fnLiveChangeCountry: function (oEvent) {
                var vCountry = oEvent.getSource().getSelectedKey();
                setTimeout(function () {
                    var fields = [
                        { element: "iAddress1", field: "Address1", mode: so.fieldMode.SEARCH },

                    ];

                    CustomKey = "DBBFBF4BE8534789828D69479A804851";
                    options = { key: CustomKey, setCountryByIP: false };
                    DOTSGlobalAddressComplete = new so.Address(fields, options);
                    DOTSGlobalAddressComplete.setCountry(vCountry);

                }, 1000);
            },
            fnButton: function () {
                oView.getModel("JMConfig").getData().Visible = true;
                oView.getModel("JMConfig").refresh();
                // var txtval =   this.getView().byId("iAddress1").getDomRef().value;
                // //Check if value is empty or not
                // if (!txtval) {
                //     this.getView().byId("iAddress1").getDomRef().setAttribute("class", "democlass")
                // } else {
                //     this.getView().byId("iAddress1").getDomRef().setAttribute("class", "cl_HTMLInput")
                // }
                setTimeout(function () {
                    var fields = [
                        { element: "iAddress1", field: "Address1", mode: so.fieldMode.SEARCH | so.fieldMode.POPULATE },
                        { element: "iAddress2", field: "Address2", mode: so.fieldMode.POPULATE },
                        { element: "iCity", field: "Locality", mode: so.fieldMode.POPULATE },
                        { element: "iState", field: "AdminArea", mode: so.fieldMode.ADMINAREA },
                        // { element: "iPostal", field: "PostalCode", mode: so.fieldMode.POPULATE },
                        { element: "iCountry", field: "Country", mode: so.fieldMode.COUNTRY }
                    ];

                    CustomKey = "DBBFBF4BE8534789828D69479A804851";
                    options = { key: CustomKey, setCountryByIP: true };
                    DOTSGlobalAddressComplete = new so.Address(fields, options);

                }, 1000);
            },
            fnButton1: function () {
                oView.getModel("JMConfig").getData().Visible1 = true;
                oView.getModel("JMConfig").refresh();
                // var txtval =   this.getView().byId("iAddress1").getDomRef().value;
                // //Check if value is empty or not
                // if (!txtval) {
                //     this.getView().byId("iAddress1").getDomRef().setAttribute("class", "democlass")
                // } else {
                //     this.getView().byId("iAddress1").getDomRef().setAttribute("class", "cl_HTMLInput")
                // }
                setTimeout(function () {

                    var fields = [
                        { element: "iAddress1R", field: "Address1", mode: so.fieldMode.SEARCH | so.fieldMode.POPULATE },
                        { element: "iAddress2R", field: "Address2", mode: so.fieldMode.POPULATE },
                        { element: "iCityR", field: "Locality", mode: so.fieldMode.POPULATE },
                        { element: "iStateR", field: "AdminArea", mode: so.fieldMode.ADMINAREA },
                        // { element: "iPostal", field: "PostalCode", mode: so.fieldMode.POPULATE },
                        { element: "iCountryR", field: "Country", mode: so.fieldMode.COUNTRY }
                    ];

                    CustomKey = "DBBFBF4BE8534789828D69479A804851";
                    optionsR = { key: CustomKey, setCountryByIP: true };
                    var DOTSGlobalAddressCompleteR = new so.Address(fields, options);


                }, 1000);

            },
            fnPrintScreen: function () {
                var $domTarget = oView.byId("id_PrintPreview").getContent()[0].getDomRef(),
                    sTargetContent = $domTarget.innerHTML;

                //	var vTitle = this.getResourceText("CalirationStatusTag");
                var printCssUrl = jQuery.sap.getModulePath("com.jabil.surveyform.css", "/style.css");
                var link = '<link rel="stylesheet" href="' + printCssUrl + '" type="text/css" />';
                var sURI = sap.ui.core.IconPool.getIconURI("accept");
                var url = sap.ui.require.toUrl(sURI);
                link = link + '<link rel="stylesheet" href="' + url + '" />';

                //		var hContent = '<html><head>' + link + '</head><body><img src="' + sMylanLogoUrl + '"/><p>' +
                //	this.getResourceText("mylanLogoText") + '</p><h1>' + vTitle + '</h1>';
                var bodyContent = sTargetContent;
                //		var closeContent = "<div style='text-align: end'>" + "</div>" + "</body></html>";
                //	var htmlpage = hContent + bodyContent + closeContent;
                var htmlpage = bodyContent;

                var win = window.open("", "PrintWindow");
                win.document.open();
                win.document.write(htmlpage);
                $.each(document.styleSheets, function (index, oStyleSheet) {
                    if (oStyleSheet.href) {
                        link = document.createElement("link");
                        link.type = oStyleSheet.type;
                        link.rel = "stylesheet";
                        link.href = oStyleSheet.href;
                        try {
                            win.document.head.appendChild(link);
                        } catch (e) {
                            win.document.getElementsByTagName("head")[0].innerHTML = win.document.getElementsByTagName("head")[0].innerHTML + link.outerHTML;
                        }
                    }
                });
                setTimeout(function () {
                    win.print();
                    win.document.close();
                    win.close();

                }, 2000);

            }




        });
    });

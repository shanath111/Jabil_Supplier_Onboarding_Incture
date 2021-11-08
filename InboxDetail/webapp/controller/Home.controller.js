sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller) {
        "use strict";

        return Controller.extend("InboxDetail.controller.Home", {
            onInit: function () {

            },
            fnNavToCRResubmit: function () {
                this.getOwnerComponent().getRouter().navTo("ResubmitCR");
            },
            fnNavToCRResubmitDetail: function () {
                this.getOwnerComponent().getRouter().navTo("ResubmitDetail");
            },
              fnNavTolaunchCC: function () {
                this.getOwnerComponent().getRouter().navTo("LaunchCC");
            },

        });
    });

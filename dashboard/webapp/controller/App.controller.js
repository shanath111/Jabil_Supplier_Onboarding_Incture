sap.ui.define([
    
    "sap/ui/core/mvc/Controller",
    
],

    function (Controller) {
        "use strict";
        
        return Controller.extend("dashboard.controller.App", {
            onInit: function () {
                this.fnLoadUser();
               
            },
             fnLoadUser: function () {
                var that = this;
                var sUrl = "/nsBuyerRegistration/plcm_portal_services/loggedinUser";
                $.ajax({
                    url: sUrl,
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        that.getView().getModel("oConfigMdl").setProperty("/usrData", data);
                        that.getView().getModel("oConfigMdl").refresh();

                    },
                    async: false,
                    error: function (data) {

                    }
                });
            },
                });
    });

sap.ui.define([
    
    "sap/ui/core/mvc/Controller",
    
],

    function (Controller) {
        "use strict";
        
        return Controller.extend("dashboard.controller.PreviewForm", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("PreviewForm").attachMatched(this.fnPreviewFormHandler, this);
              
                
              

            
            },
            fnPreviewFormHandler:function(oEvent){
                
               var  vCaseId = oEvent.getParameter("arguments").caseId;
             //  setTimeout(function () {
              //  $("#frameId").attr("src", null);
                var vUrl = window.location.origin + "/comjabilsurveyform/index.html#/PreviewForm/BuyerDashboard/" + vCaseId
                 // var vUrl = window.location.origin + "/dashboard/index.html";
                $("#frameId").attr("src", vUrl);
                $("#frameContentDiv").height("100%");
                $("#frameId").height("100%"); 
          //  }.bind(this), 500);
            },
            fnNavToHome:function(){
                // var vUrl = window.location.origin + "/dashboard/index.html";
                // sap.m.URLHelper.redirect(vUrl);
                this.getOwnerComponent().getRouter().navTo("Home");

            },
                });
    });

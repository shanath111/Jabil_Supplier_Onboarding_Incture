sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/jabil/surveyform/controller/BaseController",

], function (Controller,BaseController) {
    "use strict";

    return BaseController.extend("com.jabil.surveyform.controller.App", {
        onInit: function () {
            if(this.getOwnerComponent().getComponentData()){
                if (this.getOwnerComponent().getComponentData().startupParameters.caseId) {
                  var vCaseId = this.getOwnerComponent().getComponentData().startupParameters.caseId[0];
                  var vIsNew = this.getOwnerComponent().getComponentData().startupParameters.isNew[0];
                  this.getOwnerComponent().getRouter().navTo("PreviewForm", {
                    contextPath: vCaseId,
                    Name:"BuyerDashboard"
                });
              } 
          }
        }
        
        });
});
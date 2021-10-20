// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Wizard",
    'com/jabil/surveyform/formatter/formatter',
     "sap/m/MessageBox",
], /**
 * @param {typeof sap.ui.core.mvc.Controller} Controller 
 * @param {typeof sap.ui.model.json.JSONModel} JSONModel 
 * @param {typeof sap.m.Wizard} Wizard 
 */
function (Controller,JSONModel,Wizard,formatter,MessageBox)  {
    "use strict";
    
 Wizard.CONSTANTS["MAXIMUM_STEPS"] = 12;
	return Controller.extend("com.jabil.surveyform.controller.BaseController", {
     formatter: formatter,
          onInit: function () {
            

            },
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        
        getUser: function(){
              var that = this;
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/loggedinUser";
                oModel.loadData(sUrl, true,{
                    "Content-Type": "application/json"
                });
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        that.getView().getModel("oUserModel").setProperty("/user", oEvent.getSource().getData());
                        that.getView().getModel("oUserModel").refresh();
                    }
                });
        },

        getTaskDetails: function(taskId,oDeferred,oi18n){    
                var that = this;
                 var fDeferred = $.Deferred();
                var oModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/workflow/taskContext/" + taskId;
                oModel.loadData(sUrl);
                oModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                         that.getView().getModel("oUserModel").setProperty("/caseId", oEvent.getSource().getData().caseId);
                          that.getView().getModel("oUserModel").setProperty("/isNew", oEvent.getSource().getData().isNew);
                             that.getView().getModel("oUserModel").setProperty("/bpNumber", oEvent.getSource().getData().bpNumber);
                              that.getView().getModel("oUserModel").setProperty("/taskId", taskId);
                               that.getView().getModel("oUserModel").refresh();
                              fDeferred.resolve();
                          
                    }
                    else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });
                        

                    }
                });
                fDeferred.done(function(){
                 var aModel = new JSONModel();
                var sUrl = "/comjabilsurveyform/plcm_portal_services/case/findById/" + that.getView().getModel("oUserModel").getData().caseId;
                aModel.loadData(sUrl);
                aModel.attachRequestCompleted(function (oEvent) {
                    if (oEvent.getParameter("success")) {
                        that.getView().getModel("oUserModel").setProperty("/isNew", oEvent.getSource().getData().bpRequestScope.isNew);
                        that.getView().getModel("oUserModel").refresh();
                        oDeferred.resolve();
                          
                    }
                    else {
                        var sErMsg = oEvent.getParameter("errorobject").responseText;
                        MessageBox.show(sErMsg, {
                            icon: MessageBox.Icon.ERROR,
                            title: oi18n.getText("error")
                        });
                        

                    }
                });
                });
        }

    });
});
		
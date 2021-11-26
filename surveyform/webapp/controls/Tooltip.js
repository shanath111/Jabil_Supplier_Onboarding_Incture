sap.ui.define([
    "sap/ui/core/TooltipBase",
    "./TooltipRenderer",
  ], function(TooltipBase, TooltipRenderer) {
    "use strict";
    
    return TooltipBase.extend("com.jabil.surveyform.controls.Tooltip", {
      renderer: TooltipRenderer,
      metadata: {
        properties: {
          "width": {
            type: "sap.ui.core.CSSSize",
            defaultValue: "auto",
          },
          
        },
        aggregations: {
          "content": {
            type: "sap.ui.core.Control",
            multiple: false,
            bindable: true,
          },
        },
        defaultAggregation: "content",
      },
  
      // Issue: https://github.com/SAP/openui5/issues/3168
      // This whole tooltip is added as a delegate to the owner. Not sure why.
      // Thus the events here are handled for the owner as well. E.g.:
      onfocusin: function() {
        // Will be called on focus of this tooltip. But ...
        // Will be called on focus of the owner too, even if this is not rendered.
       // debugger;
        TooltipBase.prototype.onfocusin.apply(this, arguments);
       
      },
      // The current implementation also causes calling the below handlers twice.
    //   onlocalizationChanged: function() {
    //     debugger;
    //   },
    //   onThemeChanged: function() {
    //     debugger;
    //   },
  
    });
  });
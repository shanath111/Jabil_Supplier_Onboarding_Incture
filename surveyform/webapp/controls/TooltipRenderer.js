sap.ui.define([
    "sap/ui/core/Renderer",
  ], function(Renderer) {
    "use strict";
return Renderer.extend("com.jabil.surveyform.controls.TooltipRenderer", {
    apiVersion: 2,
    render: function(renderManager, control) {
     
      const child = control.getAggregation("content");
      if (child && child.isA("sap.ui.core.Control")) {
        renderManager.openStart("div", control)
          .accessibilityState(control, { role: "tooltip" })
          .style("max-width", "95vw")
          .style("width", control.getWidth())
          .openEnd()
          .renderControl(child)
          .close("div");
      } else {
        renderManager.openStart("span", control)
          .accessibilityState(control, { role: "tooltip" })
          .style("max-width", "90vw")
          .style("width", control.getWidth())
          .style("padding", "0.5rem")
          .class("sapThemeBaseBG-asBackgroundColor")
          .openEnd()
          .text(control.getText())
          .close("span");
      }
    },

  });
});
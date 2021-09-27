sap.ui.define([
	"sap/tnt/SideNavigation",
	"sap/tnt/SideNavigationRenderer"
], function (SideNavigation, SideNavigationRenderer) {
	"use strict";
	var ExtSideNavigation = SideNavigation.extend("oneapp.incture.workbox.controlExtension.ExtSideNavigation", {
		metadata: {
			aggregations: {
				footer: {
					type: "sap.m.FlexBox",
					multiple: false
				}
			}
		},
		renderer: {}
	});
	return ExtSideNavigation;
});
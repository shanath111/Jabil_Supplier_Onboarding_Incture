sap.ui.define([
	"sap/tnt/NavigationListItem",
	"sap/ui/core/Renderer"
], function (NavigationListItem, Renderer) {
	"use strict";
	var ExtNavigationListItem = NavigationListItem.extend("oneapp.incture.workbox.controlExtension.ExtNavigationListItem", {
		metadata: {
			properties: {
				count: {
					type: "string",
					defaultValue: null,
					bindalble: "bindable"
				}
			}
		}
	});

	ExtNavigationListItem.prototype._renderText = function (rm) {
		rm.openStart("div");
		rm.style("float", "left");
		rm.style("display", "inline");
		rm.style("margin-left", "12.5%");
		rm.style("width", "60%");
			if (this.getCount()) {
			rm.style("width", "60%");
		} else {
			rm.style("width", "100%");
		}
		rm.class("sapMText");
		rm.class("sapTntNavLIText");
		rm.class("sapMTextNoWrap");
		var textDir = this.getTextDirection();
		if (textDir !== sap.ui.core.TextDirection.Inherit) {
			rm.attr("dir", textDir.toLowerCase());
		}
		var textAlign = Renderer.getTextAlign(sap.ui.core.TextAlign.Begin, textDir);
		if (textAlign) {
			rm.style("text-align", textAlign);
		}
		rm.openEnd();
		rm.class("sapUiIcon");
		rm.style("margin-right", "5%");
		rm.icon(this.getIcon());
		rm.text(this.getText());
		rm.close("div");
	};

	ExtNavigationListItem.prototype._renderCount = function (rm) {
		rm.openStart("div");
		rm.style("float", "left");
		rm.style("display", "inline");
		if (this.getCount()) {
			rm.style("width", "24%");
		} else {
			rm.style("width", "0%");
		}
		rm.style("border-radius", "14%");
		rm.style("text-align", "right");
		rm.class("sapTntNavLIText");
		rm.class("sapMTextNoWrap");
		rm.class("sapMText");
		var textAlign = Renderer.getTextAlign(sap.ui.core.TextAlign.Center, "Inherit");
		if (textAlign) {
			rm.style("text-align", textAlign);
		}
		rm.openEnd();
		rm.openStart("bdi");
		rm.openEnd();
		rm.text(this.getCount());
		rm.close("bdi");
		rm.close("div");
	};

	ExtNavigationListItem.prototype.renderGroupItem = function (rm, control, index, length) {

		var isListExpanded = control.getExpanded(),
			isNavListItemExpanded = this.getExpanded(),
			text = this.getText(),
			tooltip,
			ariaProps = {
				level: "1",
				posinset: index + 1,
				setsize: this._getVisibleItems(control).length
			};

		//checking if there are items level 2 in the NavigationListItem
		//if yes - there is need of aria-expanded property
		if (isListExpanded && this.getItems().length !== 0) {
			ariaProps.expanded = isNavListItemExpanded;
		}
		rm.write("<div");
		rm.addClass("sapTntNavLIItem");
		rm.addClass("sapTntNavLIGroup");

		if (!this.getEnabled()) {
			rm.addClass("sapTntNavLIItemDisabled");
		} else {
			rm.write(' tabindex="-1"');
		}

		if (!isListExpanded || control.hasStyleClass("sapTntNavLIPopup")) {
			tooltip = this.getTooltip_AsString() || text;
			if (tooltip) {
				rm.writeAttributeEscaped("title", tooltip);
			}

			ariaProps.label = text;
			ariaProps.role = "menuitem";
			if (!control.hasStyleClass("sapTntNavLIPopup")) {
				ariaProps.haspopup = true;
			}
		} else {
			ariaProps.role = "treeitem";
		}
		rm.writeAccessibilityState(ariaProps);

		if (control.getExpanded()) {
			tooltip = this.getTooltip_AsString() || text;
			if (tooltip) {
				rm.writeAttributeEscaped("title", tooltip);
			}
			rm.writeAttributeEscaped("aria-label", text);
		}

		rm.writeClasses();
		rm.write(">");
		this._renderIcon(rm);
		if (control.getExpanded()) {
			var expandIconControl = this._getExpandIconControl();
			expandIconControl.setVisible(this.getItems().length > 0 && this.getHasExpander());
			expandIconControl.setSrc(this.getExpanded() ? NavigationListItem.collapseIcon : NavigationListItem.expandIcon);
			expandIconControl.setTooltip(this._getExpandIconTooltip(!this.getExpanded()));
			rm.renderControl(expandIconControl);
		}
		rm.write("</div>");
	};

	//Renders the second-level navigation item.
	ExtNavigationListItem.prototype.renderSecondLevelNavItem = function (rm, control, index, length) {

		var group = this.getParent(),
			ariaProps = {
				role: control.hasStyleClass("sapTntNavLIPopup") ? "menuitem" : "treeitem",
				level: "2"
			};
		rm.openStart("li", this);
		rm.class("sapTntNavLIItem");
		rm.class("sapTntNavLIGroupItem");
		if (control._selectedItem === this) {
			ariaProps.selected = true;
			rm.class("sapTntNavLIItemSelected");
		}
		if (!this.getEnabled() || !group.getEnabled()) {
			rm.class("sapTntNavLIItemDisabled");
		} else {
			rm.attr("tabindex", "-1");
		}

		var text = this.getText();
		var tooltip = this.getTooltip_AsString() || text;
		if (tooltip) {
			rm.attr("title", tooltip);
		}
		rm.accessibilityState(ariaProps);
		rm.openEnd();
		//this._renderIcon(rm);
		this._renderText(rm);
		this._renderCount(rm);
		rm.close("li");
	};

	return ExtNavigationListItem;
});
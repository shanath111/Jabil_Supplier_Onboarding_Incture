sap.ui.require("sap.ui.table");
sap.ui.table.Table.extend("oneapp.incture.workbox.controlExtension.Table", {
	metadata: {
		properties: {
			currentContextObj: {
				type: "object"
			}
		},
		events: {
			"rightPress": {}
		}
	},
	oncontextmenu: function (evt) {
		this.fireRightPress({
			src: evt.srcControl,
			target: evt.target
		});
		//            this.setCurrentContextObj(evt.target);
		return false;
	},
	renderer: {}
});
sap.m.List.extend("oneapp.incture.workbox.controlExtension.ExtList", {
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
		/*	This is commented
			this.setCurrentContextObj(evt.target); */
		return false;
	},
	renderer: {}
});
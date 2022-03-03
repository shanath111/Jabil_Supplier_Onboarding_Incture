sap.m.HBox.extend("oneapp.incture.workbox.controlExtension.ExtHbox", {
	metadata: {
		dnd: {
			draggable: true
		},
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
	onclick: function () {
		this.fireClick();
	},
	renderer: {}
});
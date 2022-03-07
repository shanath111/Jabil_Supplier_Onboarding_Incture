sap.ui.richtexteditor.RichTextEditor.extend("oneapp.incture.workbox.controlExtension.ExtRTE", {
	metadata: {
		properties: {
			currentContextObj: {
				type: "object"
			}
		},
		events: {
			// "liveChange": {}
			"rightPress": {}
		}
	},
	oncontextmenu: function (evt) {
		// this.fireKeyPress({
		// 	src: evt.srcControl,
		// 	target: evt.target
		// });
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
	// onkeydown: function () {
	// 	this.fireClick();
	// 	// debugger;
	// },
	// onkeyup: function () {
	// 	// this.fireC();
	// 	debugger;
	// },
	// onkeypress: function () {
	// 	// this.fireC();
	// 	debugger;
	// },
	renderer: {}
});
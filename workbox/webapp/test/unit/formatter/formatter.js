sap.ui.require(
	[
		"oneapp/incture/workbox/util/formatter",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (formatter, ResourceModel) {
		"use strict";

		QUnit.module("Text translations", {
			setup: function () {
				this._oResourceModel = new ResourceModel({
					bundleUrl: jQuery.sap.getModulePath("oneapp.incture.workbox", "/i18n/i18n.properties")
				});
			},
			teardown: function () {
				this._oResourceModel.destroy();
			}
		});
		QUnit.test("Action texts in Comments popup", function (assert) {
			// Arrange
			var oViewStub = {
				getModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};
			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var fnIsolatedFormatter = formatter.wbActionPopupTextColor.bind(oControllerStub);
			//assert
			assert.strictEqual(fnIsolatedFormatter("Approve"), "Approve", "The text Approve is correct");
			assert.strictEqual(fnIsolatedFormatter("Reject"), "Reject", "The text Reject is correct");
			assert.strictEqual(fnIsolatedFormatter("Resolve"), "Resolve", "The text Resolve is correct");
			assert.strictEqual(fnIsolatedFormatter("Done"), "Done", "The text Done is correct");
			assert.strictEqual(fnIsolatedFormatter("Complete"), "Done", "The text Complete is correct");
		});

		QUnit.module("Chat Module Tests", {
			setup: function () {
				this._oResourceModel = new ResourceModel({
					bundleUrl: jQuery.sap.getModulePath("oneapp.incture.workbox", "/i18n/i18n.properties")
				});
			},
			teardown: function () {
				this._oResourceModel.destroy();
			}
		});

		QUnit.test("Chat pin and unpin", function (assert) {
			// Arrange
			var oViewStub = {
				getModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};
			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbChatPinUnpin.bind(oControllerStub);
			//assert
			assert.strictEqual(isValid("true"), "Unpin Chat", "Chat is pinned"); // pass
			assert.strictEqual(isValid("false"), "Pin Chat", "Chat is unpinned"); // fails 
			assert.strictEqual(isValid("true"), "Pin Chat", "Pin status is incorrect");
			assert.strictEqual(isValid("false"), "Unpin Chat", "Unpin status is incorrect");
			/*assert.false( isValid("true"), "this is false?");
			assert.false( isValid("false"), "or this is false?");*/
		});

		QUnit.test("Chat favorites", function (assert) {
			// Arrange
			var oViewStub = {
				getModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};
			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbChatSetSplitContainer.bind(oControllerStub);
			//assert
			assert.strictEqual(isValid("favorites"), "false", "Selected screen is favorites");
			assert.notEqual(isValid("favorites"), "true", "Selected screen is not favorites");
			assert.strictEqual(isValid("favorites"), "true", "Selected screen is not favorites");
			assert.notEqual(isValid("favorites"), "false", "Selected screen is favorites");

		});

		QUnit.test("Sent chat visibility", function (assert, sentBy, loggedInUserId) {
			// Arrange
			var oViewStub = {
				getModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};
			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var formatterFun = formatter.wbSentChatVisiblity.bind(oControllerStub);
			//assert
			assert.strictEqual(formatterFun("p000093", "p000093"), true, "User is same");
			assert.strictEqual(formatterFun("p000093", "p000006"), false, "User is not same");
		});

		QUnit.test("ChatBot VBox", function (assert) {
			// Arrange
			var oViewStub = {
				getModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};
			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var formatterFun = formatter.wbChatBotVBox.bind(oControllerStub);
			//assert
			this.removeStyleClass(function () {})
			assert.equal(formatterFun("unifiedInbox"), "unifiedInbox", "Add the style class 'wbTLChatMainContent'");
			assert.notequal(formatterFun, "unifiedInbox", "Add the style class 'wbChatBotMainContent'");

		});

		QUnit.test("ChatBot MessageBox", function (assert) {
			// Arrange
			var oViewStub = {
				getModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};
			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var formatterFun = formatter.wbChatBotMsgBox.bind(oControllerStub);
			//assert
		});

		QUnit.module("Action Button Visibility Tests", {
			setup: function () {
				this._oResourceModel = new ResourceModel({
					bundleUrl: jQuery.sap.getModulePath("sap.ui.demo.wt", "/i18n/i18n.properties")
				});
			},
			teardown: function () {
				this._oResourceModel.destroy();
			}
		});

		QUnit.test("ActionButtonVisibility", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.setActionButtonVisibility.bind(oControllerStub);
			//assert
			var visible = false;
			var inboxTab = "MyInbox";
			// 1st if
			assert.strictEqual(isValid(visible, "CreatedTasks", "Forward", inboxTab), visible, "Forward is not visible in Created tasks");
			assert.strictEqual(isValid(visible, "CompletedTasks", "Forward", inboxTab), visible, "Forward is not visible in Completed tasks");
			// 2nd if 
			visible = true;
			assert.strictEqual(isValid(visible, "AdminInbox", "Claim", inboxTab), visible, "Claim is not visible in AdminInbox"); // fails
			assert.strictEqual(isValid(visible, "AdminInbox", "Forward", inboxTab), visible, "Forward is visible in AdminInbox");
			assert.strictEqual(isValid(visible, "AdminInbox", "View", inboxTab), visible, "View is visible in AdminInbox");
			visible = false;
			assert.strictEqual(isValid(visible, "AdminInbox", "Forward", "PinnedTasks"), visible, "Forward is not visible in PinnedTasks tab");

		});

		QUnit.module("Image instance tests", {
			setup: function () {
				this._oResourceModel = new ResourceModel({
					bundleUrl: jQuery.sap.getModulePath("sap.ui.demo.wt", "/i18n/i18n.properties")
				});
			},
			teardown: function () {
				this._oResourceModel.destroy();
			}
		});

		QUnit.test("ShowUploadedImageInstanceCreation", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var formatterFun = formatter.wbShowUploadedImageInstanceCreation.bind(oControllerStub);
			//assert
			var value = true;
			//assert.notEqual(value, true, "return true");// negative case
			assert.strictEqual(value, true, "return true");
			assert.strictEqual(value, false, "return true but fails");
			var value = false;
			assert.strictEqual(value, false, "return false");
			assert.strictEqual(value, true, "return false but fails");
		});

		QUnit.module("ProcessFlow tests", {
			setup: function () {
				this._oResourceModel = new ResourceModel({
					bundleUrl: jQuery.sap.getModulePath("sap.ui.demo.wt", "/i18n/i18n.properties")
				});
			},
			teardown: function () {
				this._oResourceModel.destroy();
			}
		});

		QUnit.test("Process flow audit Msg", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbProcessFlowAuditMsg.bind(oControllerStub);
			//assert
			var userName = "UserOne";
			var sendToUserName = "UserTwo";
			//if
			assert.strictEqual(isValid("new", userName, sendToUserName), "UserOne created a new task", "New task created");
			assert.strictEqual(isValid("forward", userName, sendToUserName), "UserOne forwarded the task to UserTwo", "The task is forwarded");
			// if else
			assert.strictEqual(isValid("completed", userName, sendToUserName), "Completed by UserOne", "The task is completed");
			assert.strictEqual(isValid("resolved", userName, sendToUserName), "Resolved by UserOne", "The task is resolved");
			assert.strictEqual(isValid("accepted", userName, sendToUserName), "Accepted by UserOne", "The task is accepted");
			assert.strictEqual(isValid("approved", userName, sendToUserName), "Approved by UserOne", "The task is approved");
			assert.strictEqual(isValid("rejected", userName, sendToUserName), "Rejected by UserOne", "The task is rejected");
			assert.strictEqual(isValid("rejected", userName, sendToUserName), "Rejected by UserOne", "The task is rejected");
			// if else
			assert.strictEqual(isValid("complete", userName, sendToUserName), "Completed by UserOne", "The task is completed");
			assert.strictEqual(isValid("resolve", userName, sendToUserName), "Resolved by UserOne", "The task is resolved");
			assert.strictEqual(isValid("approve", userName, sendToUserName), "Approved by UserOne", "The task is approved");
			//else
			assert.strictEqual(isValid("View", userName, sendToUserName), "Viewed by UserOne", "The task is Viewed"); // dummy value to run else condition 
		});

		QUnit.test("Process flow audit comment", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbProcessFlowAuditComment.bind(oControllerStub);
			//assert
			// if(comment)
			//if
			assert.strictEqual(isValid("completed", "Task Completed"), "Approver comment: Task Completed", "Approver completed the task");
			assert.strictEqual(isValid("resolved", "Task Resolved"), "Approver comment: Task Resolved", "Approver resolved the task");
			assert.strictEqual(isValid("accepted", "Task Accepted"), "Approver comment: Task Accepted", "Approver accepted the task");
			assert.strictEqual(isValid("approved", "Task Approved"), "Approver comment: Task Approved", "Approver approved the task");
			assert.strictEqual(isValid("done", "Task Done"), "Approver comment: Task Done", "Approver performed done action on the task");
			assert.strictEqual(isValid("complete", "Task Completed"), "Approver comment: Task Completed", "Approver completed the task");
			assert.strictEqual(isValid("resolve", "Resolve task"), "Approver comment: Resolve task",
				"Approver performed resolve action on the task");
			assert.strictEqual(isValid("approve", "Approve task"), "Approver comment: Approve task",
				"Approver performed approve action on the task");
			// if else
			assert.strictEqual(isValid("reject", "Reject task"), "Rejecter comment: Reject task", "Rejecter performed reject action on the task");
			assert.strictEqual(isValid("rejected", "Task Rejected"), "Rejecter comment: Task Rejected", "Rejecter rejected the task");
			assert.strictEqual(isValid("decline", "Task Decline"), "Rejecter comment: Task Decline", "Rejecter declined the task");
			// else 
			assert.strictEqual(isValid("", "No comment"), "Comment: No comment", "No comment");
			// else --> comment = null;
			assert.strictEqual(isValid("completed", null), null, "COmment is null");
		});

		QUnit.module("Notification tests", {
			setup: function () {
				this._oResourceModel = new ResourceModel({
					bundleUrl: jQuery.sap.getModulePath("sap.ui.demo.wt", "/i18n/i18n.properties")
				});
			},
			teardown: function () {
				this._oResourceModel.destroy();
			}
		});

		QUnit.test("Notifiction sound", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbShowNotifSound.bind(oControllerStub);
			//assert
			assert.strictEqual(isValid("CHANNEL", "Web"), false, "isVisible is false");
			assert.strictEqual(isValid("DIRECT", "Web"), false, "isVisible is false"); //fails
		});

		QUnit.test("Notifiction group", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbSetNotificationGroup.bind(oControllerStub);
			//assert
			assert.strictEqual(isValid("Web"), "sap-icon://laptop", "Show laptop icon");
			assert.strictEqual(isValid("Mobile"), "sap-icon://iphone", "Show mobile icon");
			assert.strictEqual(isValid("Email"), "sap-icon://email", "Show email icon");
		});
		
		QUnit.test("Notifiction switch general", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbShowNotificationSwitchGeneral.bind(oControllerStub);
			//assert
			assert.strictEqual(isValid("SETTINGS_ADMIN_NOTIFICATIONS", true), true, "boolean is true");
		});
		
		QUnit.test("Notifiction block", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbShowNotificationBlock.bind(oControllerStub);
			//assert
			assert.strictEqual(isValid("SETTINGS_ADMIN_NOTIFICATIONS", true), true, "boolean is true");
			assert.strictEqual(isValid("SETTINGS_ADMIN_NOTIFICATIONS", false), false, "boolean is false");
		});
		
		QUnit.test("Profile notifiction settings", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbShowProfileNotifSettings.bind(oControllerStub);
			//assert
			assert.strictEqual(isValid("SETTINGS_ADMIN_NOTIFICATIONS", true, "Admin"), true, "boolean is true");
			assert.strictEqual(isValid("SETTINGS_NOTIFICATIONS", true), true, "boolean is true");
			assert.strictEqual(isValid("SETTINGS_NOTIFICATIONS", false), true, "boolean is false"); // fails
			assert.strictEqual(isValid("SETTINGS_NOTIFICATIONS", false), false, "boolean is false");
		});
		
		QUnit.module("Collaboration tests", {
			setup: function () {
				this._oResourceModel = new ResourceModel({
					bundleUrl: jQuery.sap.getModulePath("sap.ui.demo.wt", "/i18n/i18n.properties")
				});
			},
			teardown: function () {
				this._oResourceModel.destroy();
			}
		});
		
		QUnit.test("SLA type", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbgetSlaType.bind(oControllerStub);
			//assert
			assert.strictEqual(isValid("ON_TIME"), "Type06", "SLA is On-Time");
			assert.strictEqual(isValid("CRITICAL"), "Type02", "SLA is Critical");
			assert.strictEqual(isValid("BREACHED"), "Type08", "SLA is Breached");
		});
		
		QUnit.test("Format title", function (assert) {
			// Arrange
			var oViewStub = {
				getResourceModel: this.stub().withArgs("i18n").returns(this._oResourceModel)
			};

			var oControllerStub = {
				getView: this.stub().returns(oViewStub)
			};
			// System under test
			var isValid = formatter.wbformatTitle.bind(oControllerStub);
			//assert
			assert.strictEqual(isValid(""), " ", "Title is empty string");
			assert.strictEqual(isValid("DummyTitle"), "DummyTitle", "Title is given");
		});
		
		

	}
);
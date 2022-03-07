sap.ui.define([
	"oneapp/incture/workbox/controller/BaseController",
	"oneapp/incture/workbox/util/formatter",
	"oneapp/incture/workbox/util/taskManagement",
	"oneapp/incture/workbox/util/workbox",
	"oneapp/incture/workbox/util/utility",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Dialog"
], function (BaseController, formatter, taskManagement, workbox, utility, JSONModel, Filter, FilterOperator, Dialog) {
	"use strict";

	return BaseController.extend("oneapp.incture.workbox.controller.Chat", {

		onInit: function () {
			var that = this; //Collaboration Changes -BY Karishma
			var oRouter = this.getOwnerComponent().getRouter();
			var oAppModel = this.getOwner().getModel("oAppModel");
			this.oAppModel = oAppModel;
			/**********Collaboration Changes -BY Karishma************/
			var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
			this.getView().setModel(oCollaborationModel, "oCollaborationModel");
			this.getView().byId("ID_TEXTAREA").onAfterRendering = function () {
				// call autocomplete plugin function after rendering of textarea is completed
				that.enableAutoComplete();
			};
			/**********Collaboration Changes End -BY Karishma************/
			var oModel = new JSONModel();
			this.getView().setModel(oModel, "oDefaultDataModel");
			oCollaborationModel.setProperty("/selectedScreen", "directMessage");
			oCollaborationModel.setProperty("/createGroupBtn", true);
			oCollaborationModel.setProperty("/BusyIndicator", false);
			oCollaborationModel.setProperty("/bShowSideContent", false); //Collaboration Changes -BY Karishma
			oCollaborationModel.setProperty("/bTypingIndicator", false); //Collaboration Changes -BY Karishma
			oCollaborationModel.setProperty("/bNotGroupMember", false); //Collaboration Changes -BY Karishma
			oCollaborationModel.setProperty("/bReplyToBox", false); //Collaboration Changes -BY Karishma
			oRouter.attachRoutePatternMatched(function (oEvent) {

				if (oEvent.getParameter("name") === "Chat") {
					this.oAppModel.setProperty("/transitionWait", false);
					oAppModel.setProperty("/currentView", "taskBoard");
					this.setNavigationDetailsFn();
					this.removeAllTokens(true);
					var oConstantsModel = this.getModel("oConstantsModel");
					oConstantsModel.setProperty("/chatSerachSuggesEnbl", true);
					var oDefaultDataModel = this.getModel("oDefaultDataModel");
					oDefaultDataModel.setProperty("/groupType", false);
					oDefaultDataModel.setProperty("/createGroupVisibility", true);

					// Set Global search for Chat
					this.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", "Chat");
					oCollaborationModel.setProperty("/sGroupName", "");
					oCollaborationModel.setProperty("/selectedScreen", "directMessage");
					oCollaborationModel.setProperty("/bShowSideContent", false);
					oAppModel.setProperty("/functionality/expanded", true);
					oAppModel.setProperty("/functionality/direction", "Row");
					oAppModel.setProperty("/functionality/visibility", true);
					this.fnGetChatUsers();
					this.getChatUserList("directMessage");
					/**********Collaboration Changes -BY Karishma************/
					oCollaborationModel.setProperty("/aTaggedId", []);
					oCollaborationModel.setProperty("/aTaggedDetails", []);
					oCollaborationModel.setProperty("/sSelectedSearchTab", "Mesaages");
					oCollaborationModel.setProperty("/bChatListSearchBar", false);
					oCollaborationModel.setProperty("/aChat", []);
					oCollaborationModel.setProperty("/selectedUserName", "");
					oCollaborationModel.setProperty("/iTotalPageCount", 0);
					oCollaborationModel.setProperty("/bChatListBusyIndicator", false);
					oCollaborationModel.setProperty("/bShowSideContent", false);
					oCollaborationModel.setProperty("/bTypingIndicator", false);
					if (!oCollaborationModel.getProperty("/oLoggedInUser/id")) {
						var oLoggedInUser = {
							displayName: this.oAppModel.getProperty("/loggedInUserName"),
							email: this.oAppModel.getProperty("/loggedInUserDetails/userEmail"),
							firstName: this.oAppModel.getProperty("/loggedInUserDetails/userFirstName"),
							id: this.oAppModel.getProperty("/loggedInUserDetails/userId"),
							lastName: this.oAppModel.getProperty("/loggedInUserDetails/userLastName"),
						}
						oCollaborationModel.setProperty("/oLoggedInUser", oLoggedInUser);
					}
					if (this.oAppModel.getProperty("/toChat")) {
						this.oAppModel.setProperty("/currentView", "taskBoard");
						this.oAppModel.getProperty("/sideNavItemProperties").setSelectedKey("channelsTasks");
						this.getModel("oConstantsModel").setProperty("/chatSerachSuggesEnbl", false);
						this.selectedChatScreen("channelsTasks");
					}
					/**********Collaboration Changes End -BY Karishma************/
				}
			}.bind(this));

		},

		/************* Collaboration Changes - By Karishma *************/
		onMessageEnter: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sTypedMessage = oEvent.getParameters().value;
			oCollaborationModel.setProperty("/sTypedMessage", sTypedMessage);
			var aTaggedDetails = oCollaborationModel.getProperty("/aTaggedDetails");
			var aTaggedId = oCollaborationModel.getProperty("/aTaggedId");
			var bTypingIndicatorInterval = oCollaborationModel.getProperty("/bTypingIndicatorInterval");
			var aMemberPid = oCollaborationModel.getProperty("/aMemberPid");
			var sChatId = oCollaborationModel.getProperty("/selectedChatId");
			var sSenderName = this.oAppModel.getProperty("/loggedInUserDetails/userFirstName");
			var sUserId = this.getModel("oAppModel").getProperty("/loggedInUserDetails/userId");
			var aSendTo = aMemberPid.filter(function (obj) {
				return (obj !== sUserId);
			});
			if (bTypingIndicatorInterval) {
				this.fnTypingIndicator(sUserId, aSendTo, sChatId, "typing", sSenderName);
				setTimeout(function () {
					oCollaborationModel.setProperty("/bTypingIndicatorInterval", true)
				}, 5000);
			}
			for (var i = 0; i < aTaggedDetails.length; i++) {
				if (sTypedMessage.includes("@" + aTaggedDetails[i].displayName)) {

				} else {
					aTaggedDetails.splice(i, 1);
					aTaggedId.splice(i, 1);
					oCollaborationModel.setProperty("/aTaggedId", aTaggedId);
					oCollaborationModel.setProperty("/aTaggedDetails", aTaggedDetails);
				}
			}
		},

		onAfterRendering: function () {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/sTypedMessage", "");
			// var oLoggedInUser = {
			// 	displayName: this.oAppModel.getProperty("/loggedInUserName"),
			// 	email: this.oAppModel.getProperty("/loggedInUserDetails/userEmail"),
			// 	firstName: this.oAppModel.getProperty("/loggedInUserDetails/userFirstName"),
			// 	id: this.oAppModel.getProperty("/loggedInUserDetails/userId"),
			// 	lastName: this.oAppModel.getProperty("/loggedInUserDetails/userLastName"),
			// }
			// oCollaborationModel.setProperty("/oLoggedInUser", oLoggedInUser);
			oCollaborationModel.setProperty("/oMessageTab", this.getView().byId("ID_MESSAGE_TAB"));
			this.getView().byId("ID_CHAT_SCROLLCONTAINER").attachBrowserEvent("scroll", function (oEvent) {
				// var that = this
				if (oEvent.target.scrollTop === 0) {
					var oCollaborationModel = that.getModel("oCollaborationModel");
					var iPageCount = oCollaborationModel.getProperty("/iPageCount");
					var iTotalPageCount = oCollaborationModel.getProperty("/iTotalPageCount");
					var bFirstTimeHistory = oCollaborationModel.getProperty("/bFirstTimeHistory");
					var iScrollHeight = oEvent.target.scrollHeight;
					if ((iTotalPageCount > iPageCount) && bFirstTimeHistory) {
						var sUserId = that.getModel("oAppModel").getProperty("/loggedInUserDetails/userId");
						var aMessages = oCollaborationModel.getProperty("/aChat");

						var sChatId = oCollaborationModel.getProperty("/selectedChatId");
						iPageCount++;
						oCollaborationModel.setProperty("/iPageCount", iPageCount);
						that.fnPaginationHistory(sUserId, sChatId, iPageCount, aMessages, "", "", "", iScrollHeight);
					}
				}

			});
			this.getView().byId("ID_MESSAGE_TAB").attachBrowserEvent("scroll", function (oEvent) {
				// var that = this
				var iMessageTabHeight = oCollaborationModel.getProperty("/iMessageTabHeight");
				if (Math.ceil(iMessageTabHeight - oEvent.target.scrollTop) === oEvent.target.clientHeight) {
					console.log("reached bottom");
					var iSearchMessagePageNo = oCollaborationModel.getProperty("/iSearchMessagePageNo");
					var iTotalSearchMessagePage = oCollaborationModel.getProperty("/iTotalSearchMessagePage");
					if (iSearchMessagePageNo < iTotalSearchMessagePage) {
						iSearchMessagePageNo++;
						that.fnGlobalSearchPagination(iSearchMessagePageNo, 0, 0);
						oCollaborationModel.setProperty("/iSearchMessagePageNo", iSearchMessagePageNo);
					}
				}

			});
			this.getView().byId("ID_PEOPLE_TAB").attachBrowserEvent("scroll", function (oEvent) {
				// var that = this
				var iPeopleTabHeight = oCollaborationModel.getProperty("/iPeopleTabHeight");
				if (Math.ceil(iPeopleTabHeight - oEvent.target.scrollTop) === oEvent.target.clientHeight) {
					console.log("reached bottom people");
					var iSearchPeoplePageNo = oCollaborationModel.getProperty("/iSearchPeoplePageNo");
					var iTotalSearchPeoplePage = oCollaborationModel.getProperty("/iTotalSearchPeoplePage");
					if (iSearchPeoplePageNo < iTotalSearchPeoplePage) {
						iSearchPeoplePageNo++;
						that.fnGlobalSearchPagination(0, iSearchPeoplePageNo, 0);
						oCollaborationModel.setProperty("/iSearchPeoplePageNo", iSearchPeoplePageNo);
					}
				}

			});
			this.getView().byId("ID_GROUP_TAB").attachBrowserEvent("scroll", function (oEvent) {
				// var that = this
				var iGroupTabHeight = oCollaborationModel.getProperty("/iGroupTabHeight");
				if (Math.ceil(iGroupTabHeight - oEvent.target.scrollTop) === oEvent.target.clientHeight) {
					console.log("reached bottom group");
					var iSearchGroupPageNo = oCollaborationModel.getProperty("/iSearchGroupPageNo");
					var iTotalSearchGroupPage = oCollaborationModel.getProperty("/iTotalSearchGroupPage");
					if (iSearchGroupPageNo < iTotalSearchGroupPage) {
						iSearchGroupPageNo++;
						that.fnGlobalSearchPagination(0, 0, iSearchGroupPageNo);
						oCollaborationModel.setProperty("/iSearchGroupPageNo", iSearchGroupPageNo);
					}
				}

			});
			this.getView().byId("ID_TEXTAREA").attachBrowserEvent("keydown", function (oEvent) {
				if (oEvent.keyCode === 13 && oEvent.shiftKey === false) {

					that.onSendPress();
				}
			}, true);
			this.getView().byId("ID_CHATBOT_TEXTAREA").attachBrowserEvent("keydown", function (oEvent) {
				if (oEvent.keyCode === 13 && oEvent.shiftKey === false) {

					// console.log(that.getView().byId("ID_CHATBOT_TEXTAREA").getValue());
					var oChatbotTextArea = that.getView().byId("ID_CHATBOT_TEXTAREA");
					that.getModel("oChatBotModel").setProperty("/sTypedMessage", oChatbotTextArea.getValue());
					that.sendChatBotMsg();
				}
			}, true);
		},
		enableAutoComplete: function () {
			var that = this;
			var oControl = this.getView().byId("ID_TEXTAREA");

			// get textarea htmltag from UI5 control
			var jQueryTextArea = jQuery("#" + oControl.getId()).find("textarea");

			jQueryTextArea.textcomplete([{
				// #1 - Regular experession used to trigger search
				match: /(^|\s)@(\w*(?:\s*\w*))$/, // --> triggers search for every char typed

				// #2 - Function called at every new key stroke
				search: function (query, fnCallback) {
					var oCollaborationModel = that.getView().getModel("oCollaborationModel");
					var sUserId = that.getView().getModel("oAppModel").getProperty("/loggedInUserDetails/userId");
					var aFilter = oCollaborationModel.getProperty("/aMemberDetails").filter(function (obj) {
						return (obj.id !== sUserId);
					});
					aFilter.push({
						chatID: "",
						displayName: "Chatbot",
						email: "",
						firstName: "Chat",
						id: "Chatbot",
						lastName: "bot"
					});
					var pData = Promise.resolve(
						aFilter
					);

					pData.then(function (oResult) {
						fnCallback(
							oResult.filter(function (oRecord) {
								// filter results based on query
								return oRecord.displayName
									.toUpperCase()
									.startsWith(query.toUpperCase());
							})
						);
					});
				},

				// #3 - Template used to display each result (also supports HTML tags)
				template: function (hit) {
					// Returns the highlighted version of the name attribute
					return hit.displayName;
				},

				// #4 - Template used to display the selected result in the textarea
				replace: function (hit) {
					var oCollaborationModel = that.getView().getModel("oCollaborationModel");
					var sTypedMessage = oCollaborationModel.getProperty("/sTypedMessage");
					var sString = sTypedMessage.substring(0, sTypedMessage.lastIndexOf("@") + 1);
					var aTaggedId = oCollaborationModel.getProperty("/aTaggedId");
					var aTaggedDetails = oCollaborationModel.getProperty("/aTaggedDetails")
					var aFilter = aTaggedId.filter(function (obj) {
						return (obj.tagged === hit.id);
					});
					if (aFilter.length === 0) {
						aTaggedId.push({
							"tagged": hit.id,
							"name": hit.displayName
						});
						// aTaggedId.push(hit.id);

						aTaggedDetails.push(hit);
						sTypedMessage = sString + hit.displayName;
						oCollaborationModel.setProperty("/sTypedMessage", sTypedMessage);
						oCollaborationModel.setProperty("/aTaggedId", aTaggedId);
						oCollaborationModel.setProperty("/aTaggedDetails", aTaggedDetails);
						return " @" + hit.displayName + " ";
					}
				}
			}]);

		},

		//Pagination on scrolltop
		fnPaginationHistory: function (sUserId, sChatId, iPageCount, aMessages, sCommentId, isAttachment, oScrollContainer, iScrollHeight) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/bChatScreenLoader", true);
			var url = "/ActJavaService/chat/chatHistory/" + sUserId + "/" + sChatId + "/" + iPageCount + "/10";
			this.doAjax(url, "GET", null, function (oData) {
				if (oData.data) {
					oCollaborationModel.setProperty("/aChat", []);
					var aOldChatHistory = oData.data.chatHistory;
					aOldChatHistory = aOldChatHistory.sort((a, b) => new Date(Number(a.sentAt)) - new Date(Number(b.sentAt)));
					var aNewMessages = aOldChatHistory.concat(aMessages);
					oCollaborationModel.setProperty("/aChat", aNewMessages);
					if (iScrollHeight) {
						setTimeout(function () {
							var id = that.getView().byId("ID_CHAT_SCROLLCONTAINER");
							var iNewheight = $("#" + id.getId())[0].scrollHeight;
							$("#" + id.getId()).scrollTop(iNewheight - iScrollHeight);
						}, 200);
					} else {
						that.fnGetMessageBox(sUserId, sChatId, iPageCount, sCommentId, aNewMessages, isAttachment, oScrollContainer);
					}
				}
				oCollaborationModel.setProperty("/bChatScreenLoader", false);
				// oCollaborationModel.setProperty("/spinnerVisibility", false);
			}.bind(this), function (oError) {}.bind(this));

		},

		// on selecting the tab
		selectedChatScreen: function (selectedKey) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/selectedScreen", selectedKey);
			oCollaborationModel.setProperty("/bFirstTimeHistory", true);
			oCollaborationModel.setProperty("/bShowSideContent", false);
			oCollaborationModel.setProperty("/sTypedMessage", "");
			oCollaborationModel.setProperty("/bGlobalSearch", false);
			oCollaborationModel.setProperty("/sTypedMessage", "");
			oCollaborationModel.setProperty("/sParticipantsName", "");
			oCollaborationModel.setProperty("/bReplyToBox", false);
			oCollaborationModel.setProperty("/sSelectedSearchTab", "Mesaages");
			oCollaborationModel.setProperty("/iTotalPageCount", 0);
			oCollaborationModel.setProperty("/bNotGroupMember", false);
			oCollaborationModel.setProperty("/aChat", []);
			oCollaborationModel.setProperty("/selectedUserName", "");
			oCollaborationModel.setProperty("/aMemberDetails", []);
			oCollaborationModel.setProperty("/sSelectedChatType", "");
			oCollaborationModel.setProperty("/bChatListSearchBar", false);
			oCollaborationModel.setProperty("/aTaggedId", []);
			var selectedChatId = oCollaborationModel.getProperty("/selectedChatId");
			this.fnUpdateCloseChat(selectedChatId);
			var oTable = this.getView().byId("idChatList");
			var oBinding = oTable.getBinding("items");
			oBinding.filter([]);
			this.getView().byId("ID_SEARCHFIELD").clear();
			this.getView().byId("ID_CHAT_FOOTER").addStyleClass("wbChatTextAreaWrapper");
			this.getView().byId("ID_CHAT_FOOTER").removeStyleClass("wbTextAreaStyleShrink");
			this.getView().byId("ID_CHAT_LIST").addStyleClass("wbGroupChatListBox");
			this.getView().byId("ID_CHAT_LIST").removeStyleClass("wbChatListBox");
			oCollaborationModel.setProperty("/bIsTaskOwner", false);
			oCollaborationModel.setProperty("/iTotalRead", 0);
			oCollaborationModel.setProperty("/iTotalDelivered", 0);
			oCollaborationModel.setProperty("/bTypingIndicatorInterval", true);
			oCollaborationModel.setProperty("/bTypingIndicator", false);
			oCollaborationModel.setProperty("/BusyIndicator", false);
			oCollaborationModel.setProperty("/sChatConversationId", "test_" + Math.floor(100000 + Math.random() * 900000));
			oCollaborationModel.refresh(true);
			var sPlaceholder;
			if (selectedKey === "pinned") {
				sPlaceholder = this.getModel("i18n").getResourceBundle().getText("CHAT_SEARCH_PLACEHOLDER_PINNED");
				oCollaborationModel.setProperty("/searchfieldPlaceholder", sPlaceholder);
				// this.getPinnedUserList(selectedKey);
				this.getPinnedList(true);
			} else if (selectedKey === "favorites") {
				// this.getFavoriteMessages();
				sPlaceholder = this.getModel("i18n").getResourceBundle().getText("CHAT_SEARCH_PLACEHOLDER_FAVOURITE");
				oCollaborationModel.setProperty("/searchfieldPlaceholder", sPlaceholder);
				this.getFavoriteList();
			} else if (selectedKey === "chatBot") {
				oCollaborationModel.setProperty("/selectedScreen", "chatBot");
				this.fnCreateRandomNumber()
				this.getModel("oChatBotModel").setProperty("/screen", "chat");
				this.getChatBotMessages();
			} else {
				this.getChatUserList(selectedKey);
			}

		},
		// Send bool false to to not refresh chat history of the first chat
		getChatUserList: function (selectedKey, bool) {
			if (bool === undefined) {
				bool = true;
			}
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/bReplyToBox", false);
			oCollaborationModel.setProperty("/bFirstTimeHistory", true);
			oCollaborationModel.setProperty("/bNotGroupMember", false);
			oCollaborationModel.setProperty("/bChatListSearchBar", false);
			oCollaborationModel.setProperty("/bTypingIndicatorInterval", true);
			oCollaborationModel.setProperty("/bTypingIndicator", false);
			oCollaborationModel.setProperty("/bChatListBusyIndicator", true);
			oCollaborationModel.setProperty("/sChatConversationId", "test_" + Math.floor(100000 + Math.random() * 900000));
			var sChatType, sPlaceholder;
			if (selectedKey === "directMessage") {
				sChatType = "personal";
				sPlaceholder = this.getModel("i18n").getResourceBundle().getText("CHAT_SEARCH_PLACEHOLDER");
				oCollaborationModel.setProperty("/chatType", "DIRECT");
				oCollaborationModel.setProperty("/searchfieldPlaceholder", sPlaceholder);
			} else if (selectedKey === "channelsTasks") {
				sChatType = "context";
				sPlaceholder = this.getModel("i18n").getResourceBundle().getText("CHAT_SEARCH_PLACEHOLDER_TASK");
				oCollaborationModel.setProperty("/chatType", "TASK");
				oCollaborationModel.setProperty("/searchfieldPlaceholder", sPlaceholder);
			} else if (selectedKey === "groups") {
				sChatType = "group";
				sPlaceholder = this.getModel("i18n").getResourceBundle().getText("CHAT_SEARCH_PLACEHOLDER_GROUP");
				oCollaborationModel.setProperty("/chatType", "GROUP");
				oCollaborationModel.setProperty("/searchfieldPlaceholder", sPlaceholder);
				this.getView().byId("ID_CHAT_LIST").addStyleClass("wbChatListBox");
				this.getView().byId("ID_CHAT_LIST").removeStyleClass("wbGroupChatListBox");
				oCollaborationModel.setProperty("/bIsTaskOwner", true);
			}
			oCollaborationModel.setProperty("/userList", []);
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var url = "/ActJavaService/chat/chatList/" + sChatType + "/" + sUserId;
			this.doAjax(url, "GET", null, function (oData) {
					var aChatList = oData.data;
					if (aChatList) {
						if (sChatType === "personal") {
							for (var i = 0; i < aChatList.length; i++) {
								var aFilter = aChatList[i].memberDetails.filter(function (obj) {
									return (obj.id !== sUserId);
								});
								aChatList[i].senderDetails = aFilter;
							}
							oCollaborationModel.setProperty("/userList", aChatList);
							oCollaborationModel.setProperty("/selectedUserName", aChatList[0].senderDetails[0].displayName);
						} else if (sChatType === "group") {
							for (var i = 0; i < aChatList.length; i++) {
								aChatList[i].searchName = aChatList[i].chatName;
							}
							oCollaborationModel.setProperty("/userList", aChatList);
							oCollaborationModel.setProperty("/aSearchList", aChatList);
							oCollaborationModel.setProperty("/selectedUserName", aChatList[0].chatName);
						} else if (sChatType === "context") {
							var aTaskList = [];
							for (var i = 0; i < aChatList.length; i++) {
								aTaskList = aTaskList.concat(aChatList[i].tasks);
								aChatList[i].bExpandPanel = false;
							}
							if (this.oAppModel.getProperty("/toChat")) {
								var sPath = this.oAppModel.getProperty("/selectedChatPathNav");
								var iIndex = sPath.split("/")[2];
								aChatList[iIndex].bExpandPanel = true;
							} else
								aChatList[0].bExpandPanel = true;

							for (var i = 0; i < aTaskList.length; i++) {
								aTaskList[i].searchName = aTaskList[i].chatName;
							}
							oCollaborationModel.setProperty("/userList", aChatList);
							oCollaborationModel.setProperty("/aSearchList", aTaskList);
						}
						if (sChatType === "context") {
							that.fnCheckIsActive(aChatList[0].tasks[0].isActive);
							// that.fnTaskdetails(aChatList[0].tasks[0].chatID);
							// oCollaborationModel.setProperty("/noData", false);
							oCollaborationModel.setProperty("/selectedChatId", aChatList[0].tasks[0].chatID);
							oCollaborationModel.setProperty("/selectedUserName", aChatList[0].tasks[0].chatName);
							oCollaborationModel.setProperty("/sSelectedChatType", aChatList[0].tasks[0].chatType);
							oCollaborationModel.setProperty("/aMemberDetails", aChatList[0].tasks[0].memberDetails);
							oCollaborationModel.setProperty("/aMemberPid", aChatList[0].tasks[0].members);
							oCollaborationModel.setProperty("/iPageCount", 0);
							oCollaborationModel.setProperty("/userList/0/tasks/0/unreadMessageCount", 0);
							var oChannelsPanel = that.byId("ID_CHAT_CHANNEL_PANEL_VBOX");
							var oFirstItem = oChannelsPanel.getAggregation("items")[0].getAggregation("content")[0].getAggregation("items")[0];
							if (this.oAppModel.getProperty("/toChat")) {
								var iSelectedTask = this.oAppModel.getProperty("/selectedChatPathNav").split("/")[4];
								var iSelectedChat = this.oAppModel.getProperty("/selectedChatPathNav").split("/")[2];
								var oSelectedItem = oChannelsPanel.getAggregation("items")[iSelectedChat].getAggregation("content")[0].getAggregation("items")[
									iSelectedTask];
								oChannelsPanel.getAggregation("items")[iSelectedChat].getAggregation("content")[0].setSelectedItem(oSelectedItem);
								that.fnCheckIsActive(aChatList[iSelectedChat].tasks[iSelectedTask].isActive);
								oCollaborationModel.setProperty("/selectedChatId", aChatList[iSelectedChat].tasks[iSelectedTask].chatID);
								oCollaborationModel.setProperty("/selectedUserName", aChatList[iSelectedChat].tasks[iSelectedTask].chatName);
								oCollaborationModel.setProperty("/sSelectedChatType", aChatList[iSelectedChat].tasks[iSelectedTask].chatType);
								oCollaborationModel.setProperty("/aMemberDetails", aChatList[iSelectedChat].tasks[iSelectedTask].memberDetails);
								oCollaborationModel.setProperty("/aMemberPid", aChatList[iSelectedChat].tasks[iSelectedTask].members);
								oCollaborationModel.setProperty("/iPageCount", 0);
								oCollaborationModel.setProperty("/userList/" + iSelectedChat + "/tasks/" + iSelectedTask + "/unreadMessageCount", 0);
								that.getChatHistory(sUserId, aChatList[iSelectedChat].tasks[iSelectedTask].chatID);
								this.oAppModel.setProperty("/toChat", false);
							} else {
								oChannelsPanel.getAggregation("items")[0].getAggregation("content")[0].setSelectedItem(oFirstItem);
								that.getChatHistory(sUserId, aChatList[0].tasks[0].chatID);
							}
							// that.byId("ID_CHAT_CHANNEL_PANEL_VBOX").getAggregatiosetSelectedItem(that.byId("ID_CHAT_CHANNELPANEL").getItems()[0]);

							oCollaborationModel.refresh(true);
						} else {
							that.fnCheckIsActive(aChatList[0].isActive);
							// oCollaborationModel.setProperty("/noData", false);
							oCollaborationModel.setProperty("/selectedChatId", aChatList[0].chatID);
							oCollaborationModel.setProperty("/sSelectedChatType", aChatList[0].chatType);
							oCollaborationModel.setProperty("/aMemberDetails", aChatList[0].memberDetails);
							oCollaborationModel.setProperty("/aMemberPid", aChatList[0].members);
							oCollaborationModel.setProperty("/iPageCount", 0);
							oCollaborationModel.setProperty("/userList/0/unreadMessageCount", 0);
							that.byId("idChatList").setSelectedItem(that.byId("idChatList").getItems()[0]);
							that.getChatHistory(sUserId, aChatList[0].chatID);
							oCollaborationModel.refresh(true);
						}
					} else {
						oCollaborationModel.setProperty("/userList", []);
						oCollaborationModel.setProperty("/aChat", []);
						oCollaborationModel.setProperty("/aMemberDetails", []);
						oCollaborationModel.setProperty("/selectedUserName", "No chat available");
						oCollaborationModel.setProperty("/selectedChatId", "");
						oCollaborationModel.setProperty("/currentChatId", "");
						oCollaborationModel.setProperty("/noData", true);
					}
					oCollaborationModel.setProperty("/bChatListBusyIndicator", false);
				}.bind(this),
				function (oData) {}.bind(this));

		},

		//To check if a person is participant of that group or not
		fnCheckIsActive: function (isActive) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var bNoData = !isActive;
			if (!isActive) {
				oCollaborationModel.setProperty("/bNotGroupMember", true);
			} else {
				oCollaborationModel.setProperty("/bNotGroupMember", false);
			}
			oCollaborationModel.setProperty("/noData", bNoData);
		},

		//On selecting different chat
		onChatSelect: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			if (oCollaborationModel.getProperty("/sSelectedChatType") === "context") {
				this.oAppModel.setProperty("/selectedChatPathNav", oEvent.getParameters().listItem.getBindingContextPath());
			}
			var selectedChatId = oCollaborationModel.getProperty("/selectedChatId");
			var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			var sSelectedSearchTab = oCollaborationModel.getProperty("/sSelectedSearchTab");
			oCollaborationModel.setProperty("/bNotGroupMember", false);
			var oBindingContext = oEvent.getParameters().listItem.getBindingContext("oCollaborationModel");
			var sPath = oEvent.getParameters().listItem.getBindingContextPath();
			var iIndex = sPath.split("/")[2];
			var oContextData = oCollaborationModel.getProperty(sPath);
			var sChatId = oContextData.chatID;
			if ("isActive" in oContextData) {
				this.fnCheckIsActive(oContextData.isActive);
			} else {
				this.fnCheckIsActive(true);
			}
			if (selectedChatId !== sChatId) {
				this.fnUpdateCloseChat(selectedChatId);
			}
			var sSelectedUserName = (oContextData.chatType === "group" || oContextData.chatType === "context") ? (oContextData.chatName) : (
				oContextData.senderDetails[0].displayName);
			oCollaborationModel.setProperty("/selectedUserName", sSelectedUserName);
			oCollaborationModel.setProperty("/selectedChatId", oContextData.chatID);
			oCollaborationModel.setProperty("/bShowSideContent", false);
			oCollaborationModel.setProperty("/sSelectedChatType", oContextData.chatType);
			oCollaborationModel.setProperty("/aMemberDetails", oContextData.memberDetails);
			oCollaborationModel.setProperty("/aMemberPid", oContextData.members);
			oCollaborationModel.setProperty("/bInitiateChat", false);
			oCollaborationModel.setProperty("/sTypedMessage", "");
			oCollaborationModel.setProperty("/bFirstTimeHistory", true);
			oCollaborationModel.setProperty("/bReplyToBox", false);
			oCollaborationModel.setProperty("/aChat", []);
			oCollaborationModel.setProperty(sPath + "/unreadMessageCount", 0);
			oCollaborationModel.setProperty("/iPageCount", 0);
			oCollaborationModel.setProperty("/iTotalPageCount", 0);
			oCollaborationModel.setProperty("/bHasAccess", true);
			oCollaborationModel.setProperty("/aTaggedId", []);
			oCollaborationModel.setProperty("/bTypingIndicatorInterval", true);
			oCollaborationModel.setProperty("/bTypingIndicator", false);
			oCollaborationModel.setProperty("/BusyIndicator", false);
			oCollaborationModel.setProperty("/sChatConversationId", "test_" + Math.floor(100000 + Math.random() * 900000));
			if (oContextData.chatType === "context") {
				oCollaborationModel.setProperty("/bIsTaskOwner", false);
			}
			// oCollaborationModel.setProperty("/noData", bIsActive);
			var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			this.getView().byId("ID_CHAT_FOOTER").addStyleClass("wbChatTextAreaWrapper");
			this.getView().byId("ID_CHAT_FOOTER").removeStyleClass("wbTextAreaStyleShrink");
			oCollaborationModel.setProperty("/iTotalRead", 0);
			oCollaborationModel.setProperty("/iTotalDelivered", 0);
			var sCommentId = oContextData.commentID;
			var isAttachment = oContextData.comment ? false : true;
			this.getChatHistory(sUserId, sChatId, sCommentId, isAttachment);
			// if (oContextData.chatType === "context") {
			// 	this.fnTaskdetails(oContextData.chatID);
			// }
		},

		//To get task owner and navigate to task detail page
		fnTaskdetails: function (sChatId, goToTask) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var url = "/WorkboxJavaService/inbox/filterService";
			var oFilterPayload = {
				"quickFilter": {
					"eventId": sChatId
				},
				"inboxType": "AllTask"
			};
			this.doAjax(url, "POST", oFilterPayload, function (oData) {
					if (oData.workBoxDtos) {
						var sTaskOwnerId = oData.workBoxDtos[0].taskOwner;
						if (oData.workBoxDtos[0].status === "READY") {
							var aTaskMembers = oCollaborationModel.getProperty("/aTaskMembers");
							var aFilter = aTaskMembers.filter(function (obj) {
								return (obj.id === sUserId);
							});
							if (aFilter.length === 1) {
								oCollaborationModel.setProperty("/bIsTaskOwner", true);
							} else {
								oCollaborationModel.setProperty("/bIsTaskOwner", false);
							}
						} else if (oData.workBoxDtos[0].status === "RESOLVED" || oData.workBoxDtos[0].status === "RESERVED") {
							if (sTaskOwnerId === sUserId) {
								oCollaborationModel.setProperty("/bIsTaskOwner", true);
							} else {
								oCollaborationModel.setProperty("/bIsTaskOwner", false);
							}
						} else {
							if (sTaskOwnerId === sUserId) {
								oCollaborationModel.setProperty("/bIsTaskOwner", true);
							} else {
								oCollaborationModel.setProperty("/bIsTaskOwner", false);
							}
						}
						if (goToTask) {
							oCollaborationModel.setProperty("/selectedUserName", "");
							oCollaborationModel.setProperty("/sParticipantsName", "");
							that.oAppModel.setProperty("/taskObjectDetails", oData.workBoxDtos[0]);
							that.setCurrentPage("MyInbox", "MyInbox", "My Task", true, true);
							that.removeAllTokens();
							that.oAppModel.setProperty("/currentViewPage", "chat");
							sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().checkNewTaskDetailTab();
							// that.navigateToTaskDetail(sChatId);
						}

					} else {
						oCollaborationModel.setProperty("/bIsTaskOwner", false);
						if (goToTask) {
							that._showToastMessage(oData.responseMessage.message);
						}
					}
				}.bind(this),
				function (oError) {}.bind(this));
		},

		//To close the update for chat - for message status
		fnUpdateCloseChat: function (sChatId) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var sTime = String(new Date().getTime());
			var sUpdateChatUrl = "/ActJavaService/chat/updateClosed/" + sUserId + "/" + sChatId + "/" + sTime;
			this.doAjax(sUpdateChatUrl, "GET", null, function (oData) {}.bind(this), function (oError) {}.bind(this));
		},

		//To get chathistory of a chat
		getChatHistory: function (sUserId, sChatId, sCommentId, isAttachment) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var aMemberPid = oCollaborationModel.getProperty("/aMemberPid");
			var sChatType = oCollaborationModel.getProperty("/sSelectedChatType");
			oCollaborationModel.setProperty("/bChatScreenLoader", true);
			var aMemberDetails = oCollaborationModel.getProperty("/aMemberDetails");
			that.fnGetMembersName(aMemberDetails);
			var iPageSize = 10;
			var url = "/ActJavaService/chat/chatHistory/" + sUserId + "/" + sChatId + "/0/" + iPageSize;
			this.doAjax(url, "GET", null, function (oData) {
					if (oData.data) {
						// for (var i = 0; i < aMemberPid.length; i++) {
						// 	if (aMemberPid[i] !== sUserId) {
						// 		that.fnSendAcknowledgement(aMemberPid[i], [sUserId], sChatId, sChatType);
						// 	}
						// }
						var aSendTo = aMemberPid.filter(function (obj) {
							return (obj !== sUserId);
						});
						that.fnSendAcknowledgement(sUserId, aSendTo, sChatId, sChatType);
						var bIsDeliver = false,
							bIsSent = false;
						var aMessages = oData.data.chatHistory;
						aMessages = aMessages.sort((a, b) => new Date(Number(a.sentAt)) - new Date(Number(b.sentAt)));

						//For Message Status
						for (var j = aMessages.length - 1; j >= 0; j--) {
							if (aMessages[j].sentBy === sUserId) {
								if (aMessages[j].messageStatus) {
									if (aMessages[j].messageStatus.length > 0) {
										var aMessageStatus = aMessages[j].messageStatus;
										var aStatusFilter = aMessageStatus.filter(function (obj) {
											return (obj.status === "READ");
										});
										if (aMessageStatus.length === aStatusFilter.length) {
											aMessages[j].commentStatus = "READ";
											break;
										} else {
											var aStatusFilter = aMessageStatus.filter(function (obj) {
												return (obj.status === "DELIVERED");
											});
											if (aMessageStatus.length === aStatusFilter.length) {
												if (!bIsDeliver) {
													aMessages[j].commentStatus = "DELIVERED";
													bIsDeliver = true;
												}
											} else {
												var aStatusFilter = aMessageStatus.filter(function (obj) {
													return (obj.status === "SENT");
												});
												if (aStatusFilter.length > 0) {
													if (!bIsSent) {
														aMessages[j].commentStatus = "SENT";
														bIsSent = true;
													}
												} else {
													if (!bIsDeliver) {
														aMessages[j].commentStatus = "DELIVERED";
														bIsDeliver = true;
													}
												}
											}
										}
									}
								}
							}
						}
						oCollaborationModel.setProperty("/aChat", aMessages);
						if (sCommentId) {
							var oScrollContainer = that.getView().byId("ID_CHAT_SCROLLCONTAINER");
							that.fnGetMessageBox(sUserId, sChatId, 0, sCommentId, aMessages, isAttachment, oScrollContainer);
						} else {
							oCollaborationModel.setProperty("/bChatScreenLoader", false);
							oCollaborationModel.setProperty("/scrollHeight", sap.ui.Device.resize.height - 237 + "px");
							that.fnScrollBottom("ID_CHAT_SCROLLCONTAINER");
						}

						var iTotalMessage = oData.data.totalItemCount;
						var iTotalPageCount = (iTotalMessage / iPageSize) === 0 ? (iTotalMessage / iPageSize) - 1 : Math.floor(iTotalMessage /
							iPageSize);
						oCollaborationModel.setProperty("/iTotalPageCount", iTotalPageCount);
						oCollaborationModel.setProperty("/aTaskMembers", oData.data.taskMembers);
					} else {
						oCollaborationModel.setProperty("/aChat", []);
						oCollaborationModel.setProperty("/bChatScreenLoader", false);
					}
					oCollaborationModel.refresh(true);
				}.bind(this),
				function (oData) {}.bind(this));
		},

		//To Highlight the messagebox
		fnGetMessageBox: function (sUserId, sChatId, iPageCount, sCommentId, aMessages, isAttachment, oScrollContainer) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			for (var i = 0; i < aMessages.length; i++) {
				if (aMessages[i].commentID === sCommentId) {
					var iIndex = i;
					break;
				}
			}
			if (typeof iIndex === "number") {
				oCollaborationModel.setProperty("/bChatScreenLoader", false);
				var iVBoxIndex = isAttachment ? 1 : 0;
				var oSelectedVBox = oScrollContainer.getAggregation("content")[0].getAggregation("items")[iIndex]
					.getAggregation("items")[0].getAggregation("items")[0].getAggregation("items")[iVBoxIndex];
				oSelectedVBox.addStyleClass("wbChatHighlightVBox");
				setTimeout(function () {
					oScrollContainer.scrollToElement(oSelectedVBox, 0);
				}, 50);
			} else {
				iPageCount++;
				oCollaborationModel.setProperty("/iPageCount", iPageCount);
				this.fnPaginationHistory(sUserId, sChatId, iPageCount, aMessages, sCommentId, isAttachment, oScrollContainer);
			}
		},

		//On click send button
		onSendPress: function (oEvent) {
			var that = this;
			var sAttachmentCommentID, aTagged = "";
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sChatId = oCollaborationModel.getProperty("/selectedChatId");
			var aTagged = oCollaborationModel.getProperty("/aTaggedId");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var sChatType = oCollaborationModel.getProperty("/sSelectedChatType");
			var aMemberDetails = oCollaborationModel.getProperty("/aMemberDetails");
			var aMemberPid = oCollaborationModel.getProperty("/aMemberPid");
			var aAttachment = oCollaborationModel.getProperty("/aAttachment");
			var bInitiateChat = oCollaborationModel.getProperty("/bInitiateChat");
			aAttachment = aAttachment ? aAttachment : [];
			if (!oCollaborationModel.getProperty("/noData")) {
				var sTypedMessage = oCollaborationModel.getProperty("/sTypedMessage");
				sTypedMessage = sTypedMessage ? sTypedMessage.trim() : "";
				if (sTypedMessage !== "" || aAttachment.length > 0) {
					if (sTypedMessage.length < 4985) {
						if (bInitiateChat) {
							this.fnInitiateChat(sChatId, sTypedMessage, sUserId, sChatType, aMemberDetails, "", aMemberPid, aTagged);
						} else if (aAttachment.length > 0) {
							this.fnUploadAttachment(sChatId, sTypedMessage, aMemberPid, sUserId, sChatType, aTagged, aMemberDetails);
						} else {
							that.fnSendMessage(sChatId, sTypedMessage, aMemberPid, sUserId, sChatType, "", aTagged, aMemberDetails);
						}
						oCollaborationModel.setProperty("/BusyIndicator", true);
						oCollaborationModel.setProperty("/sTypedMessage", "");
					} else {
						this._showToastMessage(this.getResourceBundle().getText("MAX_CHARACTER_MESSAGE"));
					}
				}
				setTimeout(function () {
					oCollaborationModel.setProperty("/sTypedMessage", "");
				}, 50);
			}
		},

		//service call for Upload attachment
		fnUploadAttachment: function (sChatId, message, sSendToUserId, sUserId, sChatType, aTagged) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var aAttachment = oCollaborationModel.getProperty("/aAttachment");
			var aAttachmentDetails = [];
			var oFormData = new FormData();
			$.each(aAttachment, function (index, oFile) {
				var sNewFileName = "img_web_" + (new Date().getTime()) + // Concat with file extension. 
					oFile.attachmentContent.name.substring(oFile.attachmentContent.name.lastIndexOf('.'));
				var sFileType;
				var sFileExtension = oFile.attachmentContent.name.substring(oFile.attachmentContent.name.lastIndexOf(".") + 1);
				var sFileName = oFile.attachmentContent.name.substring(0, oFile.attachmentContent.name.lastIndexOf("."));
				if (sFileExtension === "jpg" || sFileExtension === "jpeg" || sFileExtension === "png") {
					sFileType = "image/" + sFileExtension;
				} else {
					sFileType = "application/" + sFileExtension;
				}
				oFormData.append("file", oFile.attachmentContent);
				oFormData.append("fileName", sFileName);
				oFormData.append("fileType", sFileType);
				// oFormData.append("fileType", oFile.attachmentContent.type);
				aAttachmentDetails.push({
					"fileName": sFileName,
					"fileType": sFileType,
					"compressed": oFile.attachment
				});
			});
			oCollaborationModel.setProperty("/aAttachmentDetails", aAttachmentDetails);
			var sAttachmentUrl = "/ActJavaService/message/upload";
			$.ajax({
				url: sAttachmentUrl,
				type: "POST",
				crossDomain: true,
				processData: false,
				contentType: false,
				data: oFormData,
				success: function (data, textStatus, XMLHttpRequest) {
					var sCommentID = data.data.commentID;
					if (sCommentID) {
						that.fnSendMessage(sChatId, message, sSendToUserId, sUserId, sChatType, sCommentID, aTagged);
					} else {
						sap.m.MessageToast.show("Upload failed");
						oCollaborationModel.setProperty("/BusyIndicator", false);
						oCollaborationModel.setProperty("/aAttachment", []);
						oCollaborationModel.setProperty("/aAttachmentDetails", []);
						oCollaborationModel.setProperty("/isAttachments", false);
					}
				},
				error: function (data, textStatus, XMLHttpRequest) {
					sap.m.MessageToast.show("Error");
				}
			});
		},

		//Service call for send message
		fnSendMessage: function (sChatId, message, aMemberPid, sUserId, sChatType, sCommentID, aTagged, aMemberDetails) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/iTotalRead", 0);
			oCollaborationModel.setProperty("/iTotalDelivered", 0);
			var aChat = oCollaborationModel.getProperty("/aChat")
			var aAttachmentDetails = oCollaborationModel.getProperty("/aAttachmentDetails");
			var sSelectedUserName = oCollaborationModel.getProperty("/selectedUserName");
			var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			var isReply = oCollaborationModel.getProperty("/bReplyToBox");
			var aSendTo = aMemberPid.filter(function (obj) {
				return (obj !== sUserId);
			});
			if (isReply) {
				isReply = true;
				var aReplyToAttachments = oCollaborationModel.getProperty("/aReplyToAttachments");
				var bReplyToAttachments = (aReplyToAttachments instanceof Array && aReplyToAttachments.length > 0) ? true : false;
				var sReplyToCommentId = oCollaborationModel.getProperty("/sReplyToCommentId");
				var sReplyToText = oCollaborationModel.getProperty("/sReplyToText");
				var sReplyToSentAt = oCollaborationModel.getProperty("/sReplyToSentAt");
				var sReplyToSentBy = oCollaborationModel.getProperty("/sReplyToSentBy");
				var sReplyToSenderName = oCollaborationModel.getProperty("/sReplyToSenderName");
				var oReply = {
					"replyTo": isReply ? sReplyToCommentId : "", //commentID
					"comment": !bReplyToAttachments ? sReplyToText : "",
					"sentAt": isReply ? sReplyToSentAt : "", //For the replied comment
					"sentBy": isReply ? sReplyToSentBy : "",
					"senderName": isReply ? sReplyToSenderName : "",
					"isAttachment": bReplyToAttachments ? true : false,
					"attachmentDetails": bReplyToAttachments ? aReplyToAttachments : []
				};
			}
			var sSender = this.oAppModel.getProperty("/loggedInUserName");
			var oPayload = {
				"chatID": sChatId,
				"commentID": sCommentID ? sCommentID : "",
				"comment": message,
				"isAttachment": sCommentID ? true : false,
				"sentTo": aSendTo,
				"sentBy": sUserId,
				"chatType": sChatType,
				"sentAt": String(new Date().getTime()),
				"sendersName": sSender,
				"tagged": aTagged ? aTagged : [],
				"isReply": isReply,
				"taskDescription": (sChatType === "context") ? sSelectedUserName : "",
				"memberDetails": aMemberDetails,
				"attachmentDetails": [],
				"commentType": "chat",
				"botInfo": null
			};
			if (isReply) {
				oPayload.replyDetails = oReply;
			}
			if (aTagged instanceof Array && aTagged.length > 0) {
				if (aTagged[0].tagged === "Chatbot") {
					var sChatConversationId = oCollaborationModel.getProperty("/sChatConversationId");
					var sHeaderValue = oCollaborationModel.getProperty("/sHeaderValue");
					var sHeaderName = oCollaborationModel.getProperty("/sHeaderName");
					var oLoggedInUser = this.oAppModel.getProperty("/loggedInUserDetails");
					var sChatbotMessage = message.replace("@Chatbot", "").trim();
					oPayload.commentType = "chatbot";
					oPayload.botInfo = {
						"message": {
							"type": "text",
							"content": sChatbotMessage
						},
						"conversation_id": sChatConversationId,
						// "log_level": "info",
						"memory": {
							"user": {
								"userId": oLoggedInUser.userId,
								"name": oLoggedInUser.userFirstName + " " + oLoggedInUser.userLastName,
								"userDispName": oLoggedInUser.userFirstName + " " + oLoggedInUser.userLastName,
								"emailId": oLoggedInUser.userEmail,
								"isAdmin": "false",
								"headerValue": sHeaderValue ? sHeaderValue : "",
								"headerName": sHeaderName ? sHeaderName : ""
							}
						},
						// "merge_memory": true
					};
				}
			}
			var oChat = $.extend(true, {}, oPayload);
			oChat.attachmentDetails = aAttachmentDetails;
			oChat.commentStatus = "SENT";
			aChat.push(oChat);
			oCollaborationModel.setProperty("/aChat", aChat);
			var sUrl = "/ActJavaService/chat/saveChat";
			this.doAjax(sUrl, "POST", oPayload, function (oData) {
					if (oData.data === "You are no longer a participant of this chat!") {
						if (aChat.length > 0) {
							aChat.pop();
							oCollaborationModel.setProperty("/aChat", aChat);
						}
						that.fnCheckIsActive(false);
					} else {
						aChat[aChat.length - 1].commentID = oData.data.includes("commentID") ? oData.data.split("\"")[1] : "";
						// that.fnScrollBottom("ID_CHAT_SCROLLCONTAINER");
						that.onCloseReplyToBox();
						oCollaborationModel.setProperty("/chat/isAttachments", true);
						oCollaborationModel.setProperty("/aAttachment", []);
						oCollaborationModel.setProperty("/aAttachmentDetails", []);
						oCollaborationModel.setProperty("/aTaggedId", []);
						oCollaborationModel.setProperty("/isAttachments", false);
						oCollaborationModel.setProperty("/BusyIndicator", false);
						oCollaborationModel.refresh(true);
						if (selectedScreen !== "pinned" && selectedScreen !== "favorites") {
							that.fnRefreshChatlist(sChatType, sUserId, "");
						}
					}
					that.fnScrollBottom("ID_CHAT_SCROLLCONTAINER");
					oCollaborationModel.setProperty("/BusyIndicator", false);
				}.bind(this),
				function (oData) {}.bind(this));
		},

		//service call to initiate any chat
		fnInitiateChat: function (sChatId, message, sUserId, sChatType, aMemberDetails, sGroupName, aMemberPid, aTagged) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sTime = String(new Date().getTime());
			var bSearchBar = oCollaborationModel.getProperty("/bSearchBar");
			var bShowSideContent = oCollaborationModel.getProperty("/bShowSideContent");
			var url = "/ActJavaService/chat/initiateChat";
			var oPayload = {
				chatID: sChatId ? sChatId : "",
				memberDetails: aMemberDetails,
				lastMessageTime: sTime,
				chatName: sGroupName ? sGroupName : "",
				chatType: sChatType,
				isPublic: false,
				sizeLimit: 1000
			};
			this.doAjax(url, "POST", oPayload, function (oData) {
					oCollaborationModel.setProperty("/bInitiateChat", false);
					if (!bShowSideContent) {
						if (sChatType === "personal") {
							that.fnSendMessage(oData.data, message, aMemberPid, sUserId, sChatType, "", aTagged, aMemberDetails);
							// that.getChatUserList("directMessage");
						} else {
							oCollaborationModel.setProperty("/sGroupName", "");
							that.fnRefreshChatlist("group", sUserId);
						}
					} else {
						that.fnGetMembersName(aMemberDetails);
					}
				}.bind(this),
				function (oData) {}.bind(this));
		},

		//For group creation
		submitGroupFn: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var oLoggedInUser = oCollaborationModel.getProperty("/oLoggedInUser");
			var sGroupName = oCollaborationModel.getProperty("/sGroupName");
			var paths = sap.ui.getCore().byId("WB_RESOURCES_LIST").getSelectedContextPaths();
			var memberList = [];
			var oMember;
			var sTime = String(new Date().getTime());
			if (paths.length) {
				for (var i = 0; i < paths.length; i++) {
					var obj = this.getModel("oConstantsModel").getProperty(paths[i]);
					oMember = {
						displayName: obj.userFirstName + " " + obj.userLastName,
						email: obj.userEmail,
						firstName: obj.userFirstName,
						id: obj.userId,
						lastName: obj.userLastName,
						dateJoined: sTime,
						hasAccess: true
					}
					memberList.push(oMember);
				}
				oLoggedInUser.dateJoined = sTime;
				oLoggedInUser.hasAccess = true;
				memberList.push(oLoggedInUser);
				oCollaborationModel.setProperty("/createGroupBtn", true);
				this.onCloseResourceFragment();
				oCollaborationModel.setProperty("/aChat", []);
				this.fnInitiateChat("", "", oLoggedInUser.id, "group", memberList, sGroupName, null, null);
			}
		},

		//Upload attachment functionality
		uploadChatAttachment: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var aFiles = oEvent.getParameter("files");
			var iFileSizeInBytes = 0;
			for (var i = 0; i < aFiles.length; i++) {
				iFileSizeInBytes = iFileSizeInBytes + aFiles[i].size;
			}
			var iFileSizeInMB = (iFileSizeInBytes / (1024 * 1024)).toFixed(2);
			if (iFileSizeInMB > 25) {
				this._showToastMessage(this.getResourceBundle().getText("EXCEED_FILESIZE_TEXT"));
			} else {
				var aAttachment = [];
				oCollaborationModel.setProperty("/attachmentEvent", oEvent.getSource());
				this.uploadBase64Format(oEvent, function (oFile) {
					var attachment = {
						"attachment": oFile.filebase64Format,
						"attachmentName": oFile.fileName,
						"attachmentType": "application/" + oFile.fileType,
						"attachmentContent": oFile.fileContent
					};
					aAttachment.unshift(attachment);
					oCollaborationModel.setProperty("/chat/isAttachments", true);
					oCollaborationModel.setProperty("/aAttachment", aAttachment);
					oCollaborationModel.getProperty("/attachmentEvent").clear();
					oCollaborationModel.setProperty("/isAttachments", true);
					oCollaborationModel.setProperty("/scrollHeight", sap.ui.Device.resize.height - 237 + "px");
					oCollaborationModel.refresh(true);
				}.bind(this));
				this.fnScrollBottom("ID_CHAT_SCROLLCONTAINER");
			}
		},

		//Delete attachment
		deleteChatAttachment: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sPath = oEvent.getSource().getBindingContext("oCollaborationModel").getPath();
			var iIndex = sPath.split("/")[2];
			var aAttachment = oCollaborationModel.getProperty("/aAttachment");
			aAttachment.splice(iIndex, 1);
			if (aAttachment.length <= 0) {
				// oCollaborationModel.setProperty("/chat/isAttachments", false);
				oCollaborationModel.setProperty("/isAttachments", false);
				oCollaborationModel.setProperty("/scrollHeight", sap.ui.Device.resize.height - 237 + "px");
			}
			oCollaborationModel.setProperty("/aAttachment", aAttachment);
			oCollaborationModel.refresh(true);

		},

		//on download attachment
		onAttachmentDownload: function (oEvent) {
			var path = oEvent.getSource().getBindingContext("oCollaborationModel").getPath();
			var attachment = this.getModel("oCollaborationModel").getProperty(path);
			this.downloadAttachment(attachment.documentID, attachment.fileType, attachment.fileName, null, attachment.attachmentSize,
				null, attachment.encodedFileContent, true);
		},

		searchIndividualNameFn: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("userFirstName", sap.ui.model.FilterOperator.Contains, sQuery);
				var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
				var userIdFilter = new Filter("id", sap.ui.model.FilterOperator.NE, sUserId, true);
				// aFilters.push(userIdFilter);
				aFilters.push(filter);
			}
			var oBinding = sap.ui.getCore().byId("WB_RESOURCES_LIST").getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		//To get userlist
		fnGetChatUsers: function () {
			var that = this;
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var aUserDetails = [];
			// var url = "/WorkboxJavaService/chat/getUserList";
			var url = "/ActJavaService/chat/getAllUsers/" + sUserId;
			this.doAjax(url, "GET", null, function (oData) {
				// var oConstantsModel = that.getModel("oConstantsModel");
				// oConstantsModel.setProperty("/chatUsers", oData.userDetails);
				var aWbUserDetails = oData.data;
				for (var i = 0; i < aWbUserDetails.length; i++) {
					aWbUserDetails[i].searchName = aWbUserDetails[i].displayName
						// var obj = aWbUserDetails[i];
						// var oMember = {
						// 	displayName: obj.userFirstName + " " + obj.userLastName,
						// 	email: obj.userEmail,
						// 	firstName: obj.userFirstName,
						// 	id: obj.userId,
						// 	lastName: obj.userLastName,
						// 	searchName: obj.userFirstName + " " + obj.userLastName
						// };
						// var oMember = {
						// 	displayName: obj.displayName,
						// 	email: obj.email,
						// 	firstName: obj.firstName,
						// 	id: obj.id,
						// 	lastName: obj.lastName,
						// 	searchName: obj.displayName,

					// };
					// aUserDetails.push(oMember);
				}
				oCollaborationModel.setProperty("/aUserDetails", aWbUserDetails);
				// oConstantsModel.refresh(true);
			}.bind(this), function (oEvent) {}.bind(this));
		},

		onLiveSearch: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sQuery = oCollaborationModel.getProperty("/searchValue");
			sQuery = sQuery ? sQuery.toLowerCase() : "";
			var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			var aSearchList = oCollaborationModel.getProperty("/aSearchList");
			var aUserDetails = oCollaborationModel.getProperty("/aUserDetails");
			var aSearch = (selectedScreen === "directMessage") ? aUserDetails : aSearchList;
			if (sQuery) {
				var oSearchField = this.getView().byId("ID_SEARCHFIELD");
				// if (selectedScreen === "directMessage") {
				// var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
				// var url = "/ActJavaService/chat/search/" + sUserId + "/" + sQuery;
				// this.doAjax(url, "GET", null, function (oData) {
				// 		var aUserList = oData.data;
				// 		for (var i = 0; i < aUserList.length; i++) {
				// 			aUserList[i].searchName = aUserList[i].displayName;
				// 		}
				// 		oCollaborationModel.setProperty("/chatUsers", aUserList);
				// 		oSearchField.suggest();
				// 	}.bind(this),
				// 	function (oEvent) {}.bind(this));
				// } else {
				var aFilter = aSearch.filter(function (obj) {
					return (obj.searchName.toLowerCase().includes(sQuery));
				});
				oCollaborationModel.setProperty("/chatUsers", aFilter);
				oSearchField.suggest();
				// }
			}
		},
		onSelectName: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var sSelectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			var selectedChatId = oCollaborationModel.getProperty("/selectedChatId");
			var oLoggedInUser = oCollaborationModel.getProperty("/oLoggedInUser");
			var aGroupMembers = oCollaborationModel.getProperty("/aGroupMembers");
			aGroupMembers = aGroupMembers ? aGroupMembers : [];
			var oSelectedMember, sPath;
			var oListItemPath = oEvent.getParameters().listItem;
			if (oEvent.getParameter("query") || oListItemPath) {
				var aMemberDetails = [],
					aMemberPid = [];
				oCollaborationModel.setProperty("/aChat", []);
				oCollaborationModel.setProperty("/iTotalPageCount", 0);
				if (oEvent.getParameter("query")) {
					this.fnUpdateCloseChat(selectedChatId);
					sPath = oEvent.getParameter("suggestionItem").getBindingContext("oCollaborationModel").sPath;
					oSelectedMember = oCollaborationModel.getProperty(sPath);
					// if (sSelectedScreen === "directMessage") {
					// 	var aChatList = oCollaborationModel.getProperty("/userList");
					// 	var aFilter = aChatList.filter(function (obj) {
					// 		return (obj.senderDetails[0].id === oSelectedMember.id);
					// 	});
					// 	oSelectedMember.chatID = aFilter.length > 0 ? aFilter[0].chatID : "";
					// }
					oEvent.getSource().clear();
				} else {
					// (oListItemPath) {
					if (selectedChatId) {
						this.fnUpdateCloseChat(selectedChatId);
					}
					sPath = oListItemPath.getBindingContext("oCollaborationModel").sPath;
					oSelectedMember = oCollaborationModel.getProperty(sPath);
				}
				if (!oSelectedMember.chatType) {
					oCollaborationModel.setProperty("/selectedUserName", oSelectedMember.displayName);
					aMemberDetails.push(oSelectedMember);
					aMemberDetails.push(oLoggedInUser);
					for (var i = 0; i < aMemberDetails.length; i++) {
						aMemberPid.push(aMemberDetails[i].id);
					}
					oCollaborationModel.setProperty("/selectedChatId", oSelectedMember.chatID);
					oCollaborationModel.setProperty("/sSelectedChatType", "personal");
					oCollaborationModel.setProperty("/aMemberDetails", aMemberDetails);
					oCollaborationModel.setProperty("/aMemberPid", aMemberPid);
				} else {
					var bActive = (sSelectedScreen === "favorites") ? true : oSelectedMember.isActive;
					this.fnCheckIsActive(bActive);
					var sSelectedName = oSelectedMember.chatName ? oSelectedMember.chatName : oSelectedMember.senderDetails[0].displayName;
					oCollaborationModel.setProperty("/selectedUserName", sSelectedName);
					oCollaborationModel.setProperty("/selectedChatId", oSelectedMember.chatID);
					oCollaborationModel.setProperty("/sSelectedChatType", oSelectedMember.chatType);
					oCollaborationModel.setProperty("/aMemberDetails", oSelectedMember.memberDetails);
					oCollaborationModel.setProperty("/aMemberPid", oSelectedMember.members);
				}
				if (oSelectedMember.chatID) {
					oCollaborationModel.setProperty("/iTotalPageCount", 0);
					this.getChatHistory(sUserId, oSelectedMember.chatID, oSelectedMember.commentID, false);
				} else {
					// aGroupMembers.push(oSelectedMember);
					// oCollaborationModel.setProperty("/aGroupMembers", aGroupMembers);
					oCollaborationModel.setProperty("/bInitiateChat", true);
					oCollaborationModel.setProperty("/selectedChatId", "");
					oCollaborationModel.setProperty("/noData", false);
				}
				oCollaborationModel.setProperty("/sNewChatUserId", oSelectedMember.id);
			}
		},

		//on selecting tab in global search
		onSelectTab: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sSelectedTab = oEvent.getParameter("key");
			oCollaborationModel.setProperty("/aChat", []);
			oCollaborationModel.setProperty("/sSelectedSearchTab", sSelectedTab);
			oCollaborationModel.setProperty("/iTotalPageCount", 0);
			oCollaborationModel.setProperty("/sParticipantsName", "");
			oCollaborationModel.setProperty("/selectedUserName", "");
			oCollaborationModel.setProperty("/bNotGroupMember", false);
			oCollaborationModel.setProperty("/sSelectedChatType", "");
			oCollaborationModel.setProperty("/aMemberDetails", []);
			oCollaborationModel.setProperty("/noData", true);
			oCollaborationModel.setProperty("/selectedChatId", "");
			if (sSelectedTab === "Mesaages") {
				var iMessageTabHeight = $("#" + this.getView().byId("ID_MESSAGE_TAB").getId())[0].scrollHeight;
				oCollaborationModel.setProperty("/iMessageTabHeight", iMessageTabHeight);
			} else if (sSelectedTab === "People") {
				var iPeopleTabHeight = $("#" + this.getView().byId("ID_PEOPLE_TAB").getId())[0].scrollHeight;
				oCollaborationModel.setProperty("/iPeopleTabHeight", iPeopleTabHeight);
			} else if (sSelectedTab === "Groups") {
				var iGroupTabHeight = $("#" + this.getView().byId("ID_GROUP_TAB").getId())[0].scrollHeight;
				oCollaborationModel.setProperty("/iGroupTabHeight", iGroupTabHeight);
			}
		},

		//To navigate to task details page
		goToTask: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var selectedChatId = oCollaborationModel.getProperty("/selectedChatId");
			this.fnTaskdetails(selectedChatId, true);
			// this.navigateToTaskDetail(selectedChatId);
		},

		//To show the participant list in side panel
		showSideContent: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var bShowSideContent = oCollaborationModel.getProperty("/bShowSideContent");
			var sSelectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			var selectedChatId = oCollaborationModel.getProperty("/selectedChatId");
			if (bShowSideContent) {
				oCollaborationModel.setProperty("/bShowSideContent", false);
				this.getView().byId("ID_CHAT_FOOTER").addStyleClass("wbChatTextAreaWrapper");
				this.getView().byId("ID_CHAT_FOOTER").removeStyleClass("wbTextAreaStyleShrink");
			} else {
				if (sSelectedScreen === "channelsTasks") {
					this.fnTaskdetails(selectedChatId);
				}
				this.getView().byId("ID_CHAT_FOOTER").removeStyleClass("wbChatTextAreaWrapper");
				this.getView().byId("ID_CHAT_FOOTER").addStyleClass("wbTextAreaStyleShrink");
				oCollaborationModel.setProperty("/bShowSideContent", true);
				oCollaborationModel.setProperty("/bSearchBar", false);
			}
		},
		onPressAddMember: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/bSearchBar", true);
		},

		//search functionality for adding a new member to group
		onLiveSearchSidePanel: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var chatUsers = oCollaborationModel.getProperty("/aUserDetails");
			var sQuery = oCollaborationModel.getProperty("/sidePanelSearchValue");
			sQuery = sQuery ? sQuery.toLowerCase() : "";
			if (sQuery) {
				var oSearchField = this.getView().byId("ID_CHAT_SIDEPANEL_SEARCHFIELD");
				var aFilter = chatUsers.filter(function (obj) {
					return (obj.searchName.toLowerCase().includes(sQuery));
				});
				// var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
				// var url = "/ActJavaService/chat/search/" + sUserId + "/" + sQuery;
				// this.doAjax(url, "GET", null, function (oData) {
				oCollaborationModel.setProperty("/aUserList", aFilter);
				oSearchField.suggest();
				// }.bind(this),
				// function (oEvent) {}.bind(this));
			}
		},
		onSelectNameSidePanel: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var aMemberDetails = oCollaborationModel.getProperty("/aMemberDetails");
			var bHasAccess = oCollaborationModel.getProperty("/bHasAccess");
			var aMemberPid = oCollaborationModel.getProperty("/aMemberPid");
			var sChatId = oCollaborationModel.getProperty("/selectedChatId");
			var sChatType = oCollaborationModel.getProperty("/sSelectedChatType");
			var sGroupName = oCollaborationModel.getProperty("/selectedUserName");
			if (oEvent.getParameter("query")) {
				var sTime = String(new Date().getTime());
				var sPath = oEvent.getParameter("suggestionItem").getBindingContext("oCollaborationModel").sPath;
				var oSelectedMember = oCollaborationModel.getProperty(sPath);
				var aFilter = aMemberDetails.filter(function (obj) {
					return (obj.id === oSelectedMember.id);
				});
				if (!(aFilter.length > 0)) {
					oSelectedMember.dateJoined = sTime;
					oSelectedMember.hasAccess = bHasAccess;
					aMemberDetails.push(oSelectedMember);
					aMemberPid.push(oSelectedMember.id);
					oCollaborationModel.setProperty("/aMemberPid", aMemberPid);
					oCollaborationModel.setProperty("/aMemberDetails", aMemberDetails);
					this.fnInitiateChat(sChatId, "", "", sChatType, aMemberDetails, sGroupName, "");
				} else {
					sap.m.MessageToast.show("Already a member");
				}
				oEvent.getSource().clear();
				oCollaborationModel.refresh();
			}
		},

		onCloseSearchField: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/bSearchBar", false);
		},
		//Functionality to remove a member from group
		onRemoveMember: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var aMemberDetails = oCollaborationModel.getProperty("/aMemberDetails");
			var aMemberPid = oCollaborationModel.getProperty("/aMemberPid");
			var sPath = oEvent.getSource().getBindingContext("oCollaborationModel").sPath;
			var sName = oCollaborationModel.getProperty(sPath).displayName;
			var sChatId = oCollaborationModel.getProperty("/selectedChatId");
			var sChatType = oCollaborationModel.getProperty("/sSelectedChatType");
			var sGroupName = oCollaborationModel.getProperty("/selectedUserName");
			var confirmationMsg = "Do you want to remove " + sName + " from chat";
			var informationText = "";
			this._createConfirmationMessage("Confirmation", confirmationMsg, "Information", "Remove", "Cancel", true, function (oEvent) {
				var iIndex = sPath.split("/")[2];
				aMemberDetails.splice(iIndex, 1);
				aMemberPid.splice(iIndex, 1);
				oCollaborationModel.setProperty("/aMemberDetails", aMemberDetails);
				oCollaborationModel.setProperty("/aMemberPid", aMemberPid);
				this.fnInitiateChat(sChatId, "", "", sChatType, aMemberDetails, sGroupName, "");
			}, function (oEvt) {
				var oEvent = oEvt;
			});

		},

		//Replyto feature
		onMessageAction: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			if (!this.messageActionPopup) {
				this.messageActionPopup = sap.ui.xmlfragment("oneapp.incture.workbox.fragment.MessageAction", this);
			}
			this.getView().addDependent(this.messageActionPopup);
			this.messageActionPopup.openBy(oEvent.getSource());
			var sSelectedMessagePath = oEvent.getSource().getBindingContext("oCollaborationModel").sPath;
			var oSelectedMessage = oCollaborationModel.getProperty(sSelectedMessagePath);
			oCollaborationModel.setProperty("/oSelectedMessage", oSelectedMessage);
		},
		onCloseMessageActionPopover: function () {
			sap.ui.getCore().byId("ID_MESSAGEACTION_POPOVER").removeSelections(true);
		},
		onMessageActionPress: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var oSelectedMessage = oCollaborationModel.getProperty("/oSelectedMessage");
			var sSelectedAction = oEvent.getParameter("listItem").getProperty("title");
			if (sSelectedAction === "Copy Message") {

			} else if (sSelectedAction === "Reply") {
				var sComment = "";
				if (oSelectedMessage.comment) {
					sComment = oSelectedMessage.comment;
				} else {
					var sAttachmentName = oSelectedMessage.attachmentDetails[0].fileName + "." + oSelectedMessage.attachmentDetails[0].fileType.split(
						"/")[1];
					if ((oSelectedMessage.attachmentDetails).length < 2) {
						sComment = sAttachmentName;
					} else {
						var sLeftItems = oSelectedMessage.attachmentDetails.length - 1;
						sComment = sAttachmentName + " and " + sLeftItems + " more";
					}
				}
				oCollaborationModel.setProperty("/bReplyToBox", true);
				oCollaborationModel.setProperty("/sReplyToSenderName", oSelectedMessage.sendersName);
				oCollaborationModel.setProperty("/sReplyToSentAt", oSelectedMessage.sentAt);
				oCollaborationModel.setProperty("/sReplyToText", sComment);
				oCollaborationModel.setProperty("/aReplyToAttachments", oSelectedMessage.attachmentDetails);
				oCollaborationModel.setProperty("/sReplyToCommentId", oSelectedMessage.commentID);
				oCollaborationModel.setProperty("/sReplyToSentBy", oSelectedMessage.sentBy);
			}
			this.messageActionPopup.close();
		},
		onCloseReplyToBox: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/bReplyToBox", false);
			oCollaborationModel.setProperty("/sReplyToUserName", "");
			oCollaborationModel.setProperty("/sReplyToSentAt", "");
			oCollaborationModel.setProperty("/sReplyToText", "");
		},

		//To get the member name of group on top
		fnGetMembersName: function (aMemberDetails) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sMembersName = "";
			var sMembersNameToolTip = "";
			if (aMemberDetails && aMemberDetails.length > 0) {
				if (aMemberDetails.length < 6) {
					for (var i = 0; i < aMemberDetails.length; i++) {
						sMembersName += aMemberDetails[i].displayName + ",";
					}
					sMembersName = sMembersName.substr(0, sMembersName.length - 1);
					sMembersNameToolTip = sMembersName;
				} else {
					for (var i = 0; i < 5; i++) {
						sMembersName += aMemberDetails[i].displayName + ",";
					}
					for (var j = 0; j < aMemberDetails.length; j++) {
						sMembersNameToolTip += aMemberDetails[j].displayName + ",";
					}
					sMembersNameToolTip = sMembersNameToolTip.substr(0, sMembersNameToolTip.length - 1);
					sMembersName = sMembersName.substr(0, sMembersName.length - 1);
					sMembersName = sMembersName + " and " + (aMemberDetails.length - 5) + " more";
				}
			}
			oCollaborationModel.setProperty("/sParticipantsName", sMembersName);
			oCollaborationModel.setProperty("/sMembersNameToolTip", sMembersNameToolTip);
		},

		//Pin/Unpin functionality
		onPinPress: function (oEvent) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sSelectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var sPath = oEvent.getSource().getBindingContext("oCollaborationModel").sPath;
			var iIndex = sPath.split("/")[2];
			var selectedChatId = oCollaborationModel.getProperty("/selectedChatId");
			var sChatId = oCollaborationModel.getProperty(sPath).chatID;
			var sChatType = oCollaborationModel.getProperty(sPath).chatType;
			var sAction = oEvent.getSource().getAggregation("tooltip");
			var sTime = String(new Date().getTime());
			var sPinUrl = "/ActJavaService/chat/pinChat";
			var oPinPayload = {
				"userID": sUserId,
				"chatID": sChatId,
				"toDelete": (sAction === "Pin Chat") ? false : true,
				"pinTime": sTime
			};
			this.doAjax(sPinUrl, "POST", oPinPayload, function (oData) {
					if (oData.statusCode === 200) {
						// if (sSelectedScreen === "pinned") {
						// 	that.getPinnedList();
						// } else {
						// 	that.fnRefreshChatlist(sChatType, sUserId);
						// }
						if (sSelectedScreen !== "pinned") {
							if (sAction === "Pin Chat") {
								oCollaborationModel.setProperty(sPath + "/isPinned", true);
							} else {
								oCollaborationModel.setProperty(sPath + "/isPinned", false);
							}
						} else {
							// that.getPinnedList(false);
							var aUserList = oCollaborationModel.getProperty("/userList");
							aUserList.splice(iIndex, 1);
							oCollaborationModel.setProperty("/userList", aUserList);
							if (sChatId === selectedChatId) {
								oCollaborationModel.setProperty("/iTotalPageCount", 0);
								oCollaborationModel.setProperty("/aChat", []);
								oCollaborationModel.setProperty("/sParticipantsName", "");
								oCollaborationModel.setProperty("/selectedUserName", "");
								oCollaborationModel.setProperty("/sSelectedChatType", "");
								oCollaborationModel.setProperty("/aMemberDetails", []);
								oCollaborationModel.setProperty("/noData", true);
							}
						}
					}
				}.bind(this),
				function (oData) {}.bind(this));
		},

		//To get pinned chat list
		getPinnedList: function (bShowHistory) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			oCollaborationModel.setProperty("/bChatListBusyIndicator", true);
			// oCollaborationModel.setProperty("/userList", []);
			var sUrl = "/ActJavaService/chat/getPinned/" + sUserId;
			this.doAjax(sUrl, "GET", null, function (oData) {
					if (oData.statusCode === 200) {
						var aPinnedChat = oData.data ? oData.data : [];
						if (aPinnedChat.length > 0) {
							for (var i = 0; i < aPinnedChat.length; i++) {
								if (aPinnedChat[i].chatType === "personal") {
									var aFilter = aPinnedChat[i].memberDetails.filter(function (obj) {
										return (obj.id !== sUserId);
									});
									aPinnedChat[i].senderDetails = aFilter;
								}
								aPinnedChat[i].searchName = aPinnedChat[i].chatName ? aPinnedChat[i].chatName : aPinnedChat[i].senderDetails[0].displayName;
							}
							oCollaborationModel.setProperty("/aSearchList", aPinnedChat);
							oCollaborationModel.setProperty("/userList", aPinnedChat);
							if (bShowHistory) {
								if (aPinnedChat[0].chatType === "personal") {
									oCollaborationModel.setProperty("/selectedUserName", aPinnedChat[0].senderDetails[0].displayName);
								} else if (aPinnedChat[0].chatType === "group" || aPinnedChat[0].chatType === "context") {
									oCollaborationModel.setProperty("/selectedUserName", aPinnedChat[0].chatName);
								}
								oCollaborationModel.setProperty("/noData", false);
								oCollaborationModel.setProperty("/selectedChatId", aPinnedChat[0].chatID);
								oCollaborationModel.setProperty("/sSelectedChatType", aPinnedChat[0].chatType);
								oCollaborationModel.setProperty("/aMemberDetails", aPinnedChat[0].memberDetails);
								oCollaborationModel.setProperty("/aMemberPid", aPinnedChat[0].members);
								oCollaborationModel.setProperty("/iPageCount", 0);
								oCollaborationModel.setProperty("/userList/0/unreadMessageCount", 0);
								that.byId("idChatList").setSelectedItem(that.byId("idChatList").getItems()[0]);
								that.getChatHistory(sUserId, aPinnedChat[0].chatID);
							}
						} else {
							var i18n = "No pinned chats  available";
							oCollaborationModel.setProperty("/selectedUserName", i18n);
							oCollaborationModel.setProperty("/noData", true);
							oCollaborationModel.setProperty("/userList", []);
							oCollaborationModel.refresh(true);
						}
						oCollaborationModel.setProperty("/bChatListBusyIndicator", false);
					}

				}.bind(this),
				function (oData) {}.bind(this));

		},

		//functionality for favourite/unfavourite
		onFavouritePress: function (oEvent) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var sSelectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			var sPath = oEvent.getSource().getBindingContext("oCollaborationModel").sPath;
			var iIndex = sPath.split("/")[2];
			var selectedChatId = oCollaborationModel.getProperty("/selectedChatId");
			var sChatId = oCollaborationModel.getProperty(sPath).chatID;
			sChatId = sChatId ? sChatId : oCollaborationModel.getProperty("/selectedChatId");
			// var sChatId = oCollaborationModel.getProperty("/selectedChatId");
			var sCommentId = oCollaborationModel.getProperty(sPath).commentID;
			var sChatType = oCollaborationModel.getProperty(sPath).chatType;
			var sAction = oEvent.getSource().getAggregation("tooltip");
			var sTime = String(new Date().getTime());
			var sFavoriteUrl = "/ActJavaService/chat/favourite";
			var oFavoritePayload = {
				"userID": sUserId,
				"chatID": sChatId,
				"commentID": sCommentId,
				"toDelete": (sAction === "Favorite") ? false : true,
				"favouriteTime": sTime
			};
			var aFavoritePayload = [oFavoritePayload];
			this.doAjax(sFavoriteUrl, "POST", aFavoritePayload, function (oData) {
					if (oData.statusCode === 200) {
						if (sSelectedScreen !== "favorites") {
							if (sAction === "Favorite") {
								oCollaborationModel.setProperty(sPath + "/isFavourite", true);
							} else {
								oCollaborationModel.setProperty(sPath + "/isFavourite", false);
							}
						} else {
							// this.getFavoriteList();
							var favMessages = oCollaborationModel.getProperty("/favMessages");
							favMessages.splice(iIndex, 1);
							oCollaborationModel.setProperty("/favMessages", favMessages);
							if (sChatId === selectedChatId) {
								oCollaborationModel.setProperty("/iTotalPageCount", 0);
								oCollaborationModel.setProperty("/aChat", []);
								oCollaborationModel.setProperty("/sParticipantsName", "");
								oCollaborationModel.setProperty("/selectedUserName", "");
								oCollaborationModel.setProperty("/sSelectedChatType", "");
								oCollaborationModel.setProperty("/aMemberDetails", []);
								oCollaborationModel.setProperty("/noData", true);
							}
						}
					}
				}.bind(this),
				function (oData) {}.bind(this));
		},

		//To get favourite list
		getFavoriteList: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			oCollaborationModel.setProperty("/bChatListBusyIndicator", true);
			oCollaborationModel.setProperty("/favMessages", []);
			var sFavoriteUrl = "/ActJavaService/chat/getFavourites/" + sUserId;
			this.doAjax(sFavoriteUrl, "GET", null, function (oData) {
					if (oData.statusCode === 200) {
						var aFavoriteChat = oData.data ? oData.data : [];
						if (aFavoriteChat.length > 0) {
							for (var i = 0; i < aFavoriteChat.length; i++) {
								aFavoriteChat[i].isFavourite = true;
								if (aFavoriteChat[i].chatType === "personal") {
									var aFilter = aFavoriteChat[i].memberDetails.filter(function (obj) {
										return (obj.id !== sUserId);
									});
									aFavoriteChat[i].senderDetails = aFilter;
								}
								aFavoriteChat[i].searchName = aFavoriteChat[i].comment;
							}
							oCollaborationModel.setProperty("/aSearchList", aFavoriteChat);
							oCollaborationModel.setProperty("/favMessages", aFavoriteChat);
							oCollaborationModel.setProperty("/noData", true);
						} else {
							var i18n = "No Favourite chats  available";
							oCollaborationModel.setProperty("/selectedUserName", i18n);
							oCollaborationModel.setProperty("/noData", true);
							oCollaborationModel.setProperty("/userList", []);
							oCollaborationModel.setProperty("/favMessages", []);
							oCollaborationModel.refresh(true);
						}
					}
					oCollaborationModel.setProperty("/bChatListBusyIndicator", false);
				}.bind(this),
				function (oData) {}.bind(this));
		},
		onShowSearchBar: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/bChatListSearchBar", true);
		},
		onHideSearchBar: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/bChatListSearchBar", false);
		},
		onSelectCheckbox: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var bSelected = oEvent.getParameter("selected");
			oCollaborationModel.setProperty("/bHasAccess", bSelected);
		},

		//Pagination for global search
		fnGlobalSearchPagination: function (pageNoMessage, pageNoPeople, pageNoChats) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/bGlobalSearchBusy", true);
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var sValue = oCollaborationModel.getProperty("/sGlobalSearchTerm");
			var oPayload = {
				"userID": sUserId,
				"term": sValue,
				"messages": {
					"pageNumber": pageNoMessage,
					"pageSize": 11
				},
				"chats": {
					"pageNumber": pageNoChats,
					"pageSize": 11
				},
				"people": {
					"pageNumber": pageNoPeople,
					"pageSize": 11
				}
			};
			var sSearchUrl = "/ActJavaService/chat/globalSearch";
			this.doAjax(sSearchUrl, "POST", oPayload, function (oData) {
				oCollaborationModel.setProperty("/iTotalPageCount", 0);
				var aMessages = oData.data.messages ? oData.data.messages : [];
				var aPeople = oData.data.people ? oData.data.people : [];
				var aGroup = oData.data.groupChats ? oData.data.groupChats : [];
				if (aMessages.length > 0) {
					for (var i = 0; i < aMessages.length; i++) {
						if (aMessages[i].chatType === "personal") {
							var aFilter = aMessages[i].memberDetails.filter(function (obj) {
								return (obj.id !== sUserId);
							});
							aMessages[i].senderDetails = aFilter;
						}
					}

					if (pageNoMessage > 0) {
						var aOldMessages = oCollaborationModel.getProperty("/aSearchMessage");
						oCollaborationModel.setProperty("/aSearchMessage", aOldMessages.concat(aMessages));
						setTimeout(function () {
							var iMessageTabHeight = $("#" + that.getView().byId("ID_MESSAGE_TAB").getId())[0].scrollHeight;
							oCollaborationModel.setProperty("/iMessageTabHeight", iMessageTabHeight);
						}, 50);
					}
					if (pageNoChats > 0) {
						var aOldGroup = oCollaborationModel.getProperty("/aSearchGroup");
						oCollaborationModel.setProperty("/aSearchGroup", aOldGroup.concat(aGroup));
						setTimeout(function () {
							var iGroupTabHeight = $("#" + that.getView().byId("ID_GROUP_TAB").getId())[0].scrollHeight;
							oCollaborationModel.setProperty("/iGroupTabHeight", iGroupTabHeight);
						}, 50);
					}
					if (pageNoPeople > 0) {
						var aOldPeople = oCollaborationModel.getProperty("/aSearchPeople");
						oCollaborationModel.setProperty("/aSearchPeople", aOldPeople.concat(aPeople));
						setTimeout(function () {
							var iPeopleTabHeight = $("#" + that.getView().byId("ID_PEOPLE_TAB").getId())[0].scrollHeight;
							oCollaborationModel.setProperty("/iPeopleTabHeight", iPeopleTabHeight);
						}, 50);
					}
					oCollaborationModel.setProperty("/bGlobalSearchBusy", false);
				}
			}.bind(this), function (oError) {}.bind(this));

		},
		//Panels in channels & task
		OnExpandPanel: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			this.oAppModel.setProperty("/selectedChatExpandEvent", oEvent);
			var sSelectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			if (sSelectedScreen === "channelsTasks" && oEvent.getParameter("expand") === true) {
				var sPath = oEvent.getSource().getBindingContext("oCollaborationModel").sPath;
				var iPanelIndex = sPath.split("/")[2];
				var userList = oCollaborationModel.getProperty("/userList");
				for (var i = 0; i < userList.length; i++) {
					userList[i].bExpandPanel = false;
				}
				userList[iPanelIndex].bExpandPanel = true;
				oCollaborationModel.setProperty("/iExpandedPanelIndex", iPanelIndex);
				oCollaborationModel.setProperty("/userList", userList);
			}
		},
		//Functionality for typing indicator
		fnTypingIndicator: function (sSentBy, aSentTo, sChatId, sMessageType, sSenderName) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sAcknowledgementUrl = "/ActJavaService/chat/acknowledge";
			var oUpdatePayload = {
				"sentBy": sSentBy,
				"sentTo": aSentTo,
				"chatID": sChatId,
				"messageType": sMessageType,
				"sendersName": sSenderName
			};
			this.doAjax(sAcknowledgementUrl, "POST", oUpdatePayload, function (oData) {
				oCollaborationModel.setProperty("/bTypingIndicatorInterval", false);
			}.bind(this), function (oError) {}.bind(this));
		},
		onChatButtonClick: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sBtnText = oEvent.getSource().getProperty("text");
			var sPath = oEvent.getSource().getBindingContext("oCollaborationModel").sPath;
			var iIndex = sPath.split("/")[2];
			var sChatId = oCollaborationModel.getProperty("/selectedChatId");
			var aTagged = oCollaborationModel.getProperty("/aTaggedId");
			var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
			var sChatType = oCollaborationModel.getProperty("/sSelectedChatType");
			var aMemberDetails = oCollaborationModel.getProperty("/aMemberDetails");
			var aMemberPid = oCollaborationModel.getProperty("/aMemberPid");
			var aChat = oCollaborationModel.getProperty("/aChat");
			aTagged.push({
				"tagged": "Chatbot",
				"name": "Chatbot"
			});
			var sChatbotMessage = "@Chatbot " + sBtnText;
			this.fnSendMessage(sChatId, sChatbotMessage, aMemberPid, sUserId, sChatType, "", aTagged, aMemberDetails);
			aChat[iIndex].botInfo = [];
			oCollaborationModel.setProperty("/aChat", aChat);
		},
		/*************** End of collaboration changes -By Karishma********************/

		// to favorite or unfavorite a message.
		// onFavouritePress: function (oEvent) {
		// 	var oMessageObj = oEvent.getSource().getBindingContext("oCollaborationModel").getObject();
		// 	var sPath = oEvent.getSource().getBindingContext("oCollaborationModel").getPath().split("/")[2];
		// 	var sUrl = "/WorkboxJavaService/chat/favoriteChat";
		// 	var oCollaborationModel = this.getModel("oCollaborationModel");
		// 	var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
		// 	if (selectedScreen === "favorites") {
		// 		var oPayload = {
		// 			"chatId": oMessageObj.chatId,
		// 			"userId": this.oAppModel.getProperty("/loggedInUserDetails/userId"), // loggedInuserId
		// 			"favorite": false,
		// 			"messageId": oMessageObj.messageId
		// 		};
		// 	} else {
		// 		var oPayload = {
		// 			"chatId": oMessageObj.chatId,
		// 			"userId": this.oAppModel.getProperty("/loggedInUserDetails/userId"), // loggedInuserId
		// 			"favorite": !oMessageObj.favorite,
		// 			"messageId": oMessageObj.messageId
		// 		};
		// 	}

		// 	this.doAjax(sUrl, "POST", oPayload, function (oData) {
		// 			var oCollaborationModel = this.getModel("oCollaborationModel");
		// 			var favStatus = oCollaborationModel.getProperty("/chat/" + sPath + "/favorite");
		// 			if (selectedScreen === "favorites") {
		// 				oCollaborationModel.setProperty("/favMessages/" + sPath + "/favorite", false);
		// 				this.getFavoriteMessages();
		// 			} else {
		// 				if (favStatus) {
		// 					oCollaborationModel.setProperty("/chat/" + sPath + "/favorite", false);
		// 				} else {
		// 					oCollaborationModel.setProperty("/chat/" + sPath + "/favorite", true);
		// 				}
		// 			}

		// 		}.bind(this),
		// 		function (oData) {}.bind(this));
		// },

		handleTypeMissmatchChat: function (oEvent) {
			this.handleTypeMissmatch(oEvent);
		},

		// when a message is getting typed in the message box
		// onMessageEnter: function (oEvent) {
		// 	var oCollaborationModel = this.getModel("oCollaborationModel");
		// 	var sTypedMessage = oEvent.getParameters().value;
		// 	oCollaborationModel.setProperty("/sTypedMessage", sTypedMessage);
		// },

		// on click of create group button. (it gets disappeared and input, discard btn and create btn are visible)
		onGroupCreate: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/createGroupBtn", false);

		},

		// when create group is clicked
		onCreateGroupPress: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var sGroupName = oCollaborationModel.getProperty("/sGroupName");
			sGroupName = sGroupName.trim();
			if (sGroupName) {
				if (!this._oAddResourceFragment) {
					this._oAddResourceFragment = this._createFragment("oneapp.incture.workbox.fragment.AddResourceGroup", this);
					this.getView().addDependent(this._oAddResourceFragment);
				}
				this._oAddResourceFragment.open();
			} else {
				this._showToastMessage(this.getResourceBundle().getText("ERR_GROUPNAME"));
			}
		},

		fnCreateGroupPress: function (userIds) {
			var that = this;
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			var aTokens = oCollaborationModel.getProperty("/aSelectedUsers");
			if (selectedScreen === "directMessage") {
				var oPayload = {
					"chatId": "",
					"userId": this.oAppModel.getProperty("/loggedInUserDetails/userId"),
					"users": [aTokens[0].id],
					"chatType": "DIRECT",
					"chatName": aTokens[0].value
				};

			} else if (selectedScreen === "channelsTasks") {

			} else if (selectedScreen === "groups") {
				oCollaborationModel.setProperty("/createGroupBtn", true);
				var aTokens = oCollaborationModel.getProperty("/aSelectedUsers");
				var oPayload = {
					"chatId": "",
					"userId": this.oAppModel.getProperty("/loggedInUserDetails/userId"),
					"users": userIds,
					"chatType": "GROUP",
					"chatName": oCollaborationModel.getProperty("/sGroupName")
				};
				oCollaborationModel.setProperty("/chatType", "GROUP");
			}

			var url = "/WorkboxJavaService/chat/registerChat";
			this.doAjax(url, "POST", oPayload, function (oData) {
					that.onDiscardGroup();
					var oCollaborationModel = this.getModel("oCollaborationModel");
					var userList = oCollaborationModel.getProperty("/userList");
					var chatId = oData.chatInfoDetails[0].chatId;
					//var sChatName = oData.chatInfoDetails[0].chatName;
					if (selectedScreen !== "groups") {
						userList.push({
							"chatName": aTokens[0].value,
							"chatId": chatId,
							//"sTruncatedChatName": /*sChatNameTruncated*/ sChatName,
							//"sTruncatedMessage": /*sMessageTruncated*/ sMessage
						});
					}
					if (selectedScreen === "groups") {
						that.onCloseResourceFragment();
					}
					//that.getChatUserList("GROUP");
					oCollaborationModel.setProperty("/userList", userList);
				}.bind(this),
				function (oData) {}.bind(this));
		},

		onDiscardGroup: function () {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/createGroupBtn", true);
			oCollaborationModel.setProperty("/sGroupName", "");
			oCollaborationModel.setProperty("/aSelectedUsers", []);
		},

		// onUserSearch: function (oEvent) {
		// 	var oSF = oEvent.getSource();
		// 	var sValue = oEvent.getParameter("suggestValue"),
		// 		aFilters = [],
		// 		filterArray = [];
		// 	var sUserId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
		// 	var userIdFilter = new Filter("userId", sap.ui.model.FilterOperator.NE, sUserId, true);
		// 	aFilters.push(userIdFilter);
		// 	if (sValue) {
		// 		var sProperties = ["userFirstName", "userLastName", "userId"];
		// 		for (var i = 0; i < sProperties.length; i++) {
		// 			var bindingName = sProperties[i];
		// 			filterArray.push(new Filter(bindingName, sap.ui.model.FilterOperator.Contains, sValue));
		// 		}
		// 		var filter = new Filter(filterArray, false);
		// 		aFilters.push(filter);
		// 	}
		// 	oSF.getBinding("suggestionItems").filter(aFilters);
		// 	if (sValue) {
		// 		oSF.suggest();
		// 	}
		// },

		onSelectUser: function (oEvent) {
			var oCollaborationModel = this.getModel("oCollaborationModel"),
				oSource = oEvent.getSource(),
				sValue = oSource.getValue(),
				sSelectedUser = this.isValidValue(sValue, oSource.getAggregation("suggestionItems"));
			var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
			if (selectedScreen === "directMessage") {
				if (sSelectedUser) {
					for (var i = 0; i < oSource.getAggregation("suggestionItems").length; i++) {
						var oContextData = oSource.getAggregation("suggestionItems")[i].getBindingContext("oConstantsModel").getObject();
						if (sSelectedUser === oContextData.userId) {
							oCollaborationModel.setProperty("/selectedUserName", oContextData.userFirstName + " " + oContextData.userLastName);
							if (oContextData.chatId === "") {
								var userList = oCollaborationModel.getProperty("/userList");
								var newUserAdded = oContextData.userFirstName + " " + oContextData.userLastName;
								oCollaborationModel.setProperty("/selectedChatId", oContextData.chatId);
								oCollaborationModel.setProperty("/selectedChatPid", oContextData.userId);
								if (userList) {
									var bool = false;
									for (var j = 0; j < userList.length; j++) {
										if (oContextData.userId === userList[j].chatUser) {
											bool = true;
										}
									}
									if (!bool) {
										userList.unshift({
											"chatName": newUserAdded,
											"chatId": oContextData.chatId,
											"chatUser": oContextData.userId,
										});
									}
								}
								// add code for highlighting the selected existing user here.
								oCollaborationModel.refresh(true);
								for (var i = 0; i < userList.length; i++) {
									if (userList[i].chatUser === oContextData.userId) {
										this.byId("idChatList").setSelectedItem(this.byId("idChatList").getItems()[i]);
									}
								}
								var requestPayload = {
									"chatId": oContextData.chatId,
									"userId": this.oAppModel.getProperty("/loggedInUserDetails/userId"), // loggedInuserId
									"chatName": oContextData.userFirstName + " " + oContextData.userLastName
								};
								requestPayload.chatType = "DIRECT";
								this.getChatHistory(requestPayload);
								oCollaborationModel.setProperty("/noData", false);
							} else {
								var userList = oCollaborationModel.getProperty("/userList");
								for (var i = 0; i < userList.length; i++) {
									if (userList[i].chatId === oContextData.chatId) {
										this.byId("idChatList").setSelectedItem(this.byId("idChatList").getItems()[i]);
									}
								}
								var requestPayload = {
									"chatId": oContextData.chatId,
									"userId": this.oAppModel.getProperty("/loggedInUserDetails/userId"), // loggedInuserId
									/*"chatType": "DIRECT",*/
									"chatName": oContextData.userFirstName + " " + oContextData.userLastName
								};
								requestPayload.chatType = "DIRECT";
								this.getChatHistory(requestPayload);
								// add code for highlighting the selected existing user here.
							}
						}

					}
					oSource.clear();
				}

			} else {
				var sSearchItem = oEvent.getSource().getValue();
				var aFilter = [];
				var sQuery = sSearchItem;
				var oTable = this.getView().byId("idChatList");
				var oBinding = oTable.getBinding("items");

				if (sQuery) {
					aFilter = [];
					aFilter.push(new Filter("chatName", FilterOperator.Contains, sQuery));
					oBinding.filter(aFilter);
				} else {
					aFilter = [];
					oBinding.filter(aFilter);
				}
			}
		},

		isValidValue: function (sValue, aSuggestionItems) {
			if (sValue && aSuggestionItems.length > 0) {
				for (var i = 0; i < aSuggestionItems.length; i++) {
					if (sValue === aSuggestionItems[i].getText()) {
						return aSuggestionItems[i].getKey();
					}
				}
			}
			return false;
		},

		onDeleteUserToken: function (oEvent) {
			var index = oEvent.getSource().getBindingContext("oCollaborationModel").getPath().split("/").pop();
			var oCollaborationModel = this.getModel("oCollaborationModel");
			var aTokens = oCollaborationModel.getProperty("/aSelectedUsers") || [];
			aTokens.splice(index, 1);
			oCollaborationModel.setProperty("/aSelectedUsers", aTokens);
		},

		// onPinPress: function (oEvent) {
		// 	var that = this;
		// 	var selectedChatIndex = oEvent.getParameters().id.split("-")[4];
		// 	var oCollaborationModel = this.getModel("oCollaborationModel");
		// 	var chatType = oCollaborationModel.getData().chatType;
		// 	var chatId = oCollaborationModel.getData().userList[selectedChatIndex].chatId;
		// 	var chatName = oCollaborationModel.getData().userList[selectedChatIndex].chatName;
		// 	var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
		// 	var pinned = oCollaborationModel.getData().userList[selectedChatIndex].isPinned;
		// 	var i18n = this.getView().getModel("i18n").getResourceBundle();
		// 	var pinnedPayload = {
		// 		"chatId": chatId,
		// 		"chatName": chatName,
		// 		"chatType": chatType,
		// 		"isPinned": !pinned
		// 			/*"users": [
		// 				"string"
		// 			]*/
		// 	};
		// 	var url = "/WorkboxJavaService/chat/pinChat";
		// 	this.doAjax(url, "POST", pinnedPayload, function (oData) {
		// 		pinnedPayload = this;
		// 		// Toast Message
		// 		if (pinnedPayload.isPinned) {
		// 			that._showToastMessage(i18n.getText("CHAT_PINNED"));
		// 		} else {
		// 			that._showToastMessage(i18n.getText("CHAT_UNPINNED"));
		// 		}
		// 		// Refresh chat list
		// 		if (that.getModel("oCollaborationModel").getProperty("/selectedScreen") === "pinned") {
		// 			if ((that.getModel("oCollaborationModel").getProperty("/currentChatId") === pinnedPayload.chatId) && !pinnedPayload.pinned) {
		// 				that.getPinnedUserList("pinned");
		// 			} else {
		// 				that.getPinnedUserList("pinned", false);
		// 			}
		// 		} else {
		// 			that.getChatUserList(that.getModel("oCollaborationModel").getProperty("/selectedScreen"), false);
		// 		}
		// 		that.getModel("oCollaborationModel").refresh(true);
		// 	}.bind(pinnedPayload), function (oData) {}.bind(this));

		// },
		// Send bool false to to not refresh chat history of the first chat
		getPinnedUserList: function (selectedKey, bool) {
			var oCollaborationModel = this.getModel("oCollaborationModel");
			oCollaborationModel.setProperty("/selectedUserName", "");
			if (bool === undefined) {
				bool = true;
			}
			var url = "/WorkboxJavaService/chat/getPinnedChat";
			this.doAjax(url, "GET", null, function (oData) {
					var oCollaborationModel = this.getModel("oCollaborationModel");
					var pinnedChatList = oData.chatResponseDtos;
					var userNames = [];
					var sChatNameTruncated;
					var sMessageTruncated;
					this.pinnedChatTypeSelected = [];
					if (pinnedChatList) {
						if (pinnedChatList.length !== 0) {
							for (var i = 0; i < pinnedChatList.length; i++) {
								var sChatName = pinnedChatList[i].chatName;
								if (pinnedChatList[i].message !== null) {
									var sMessage = pinnedChatList[i].message.message;
									var sSentAt = pinnedChatList[i].message.sentAt.split(" ")[1];
									var sSentBy = pinnedChatList[i].message.sentBy;
								} else {
									var sMessage = "";
									var sSentAt = "";
									var sSentBy = "";
								}

								var chatId = pinnedChatList[i].chatId;
								var pinnedChatType = pinnedChatList[i].chatType;
								this.pinnedChatTypeSelected.push({
									"pinnedChatType": pinnedChatList[i].chatType
								});
								userNames.push({
									"chatName": sChatName,
									"message": sMessage,
									"time": sSentAt,
									"sentBy": sSentBy,
									"chatId": chatId,
									"isPinned": true
								});
								if (chatId === oCollaborationModel.getProperty("/selectedChatId")) {
									oCollaborationModel.setProperty("/selectedChatId", userNames[i].chatId);
									oCollaborationModel.setProperty("/selectedUserName", userNames[i].chatName);
									this.getView().byId("idChatList").setSelectedItem(this.getView().byId("idChatList").getItems()[i], true);
								}
							}
						} else {
							var i18n = "No pinned chats  available";
							oCollaborationModel.setProperty("/selectedUserName", i18n);
							oCollaborationModel.setProperty("/noData", true);
							oCollaborationModel.setProperty("/userList", "");
							oCollaborationModel.setProperty("/chat", "");
							oCollaborationModel.setProperty("/chatMembers", "");
							oCollaborationModel.refresh(true);
						}
					}
					oCollaborationModel.setProperty("/userList", userNames);
					this.fnScrollBottom("ID_CHAT_SCROLLBAR");
					if (bool) {
						oCollaborationModel.setProperty("/selectedUserName", userNames[0].chatName);
						var oHistoryPayload = {
							"chatId": pinnedChatList[0].chatId,
							"userId": this.oAppModel.getProperty("/loggedInUserDetails/userId"),
							"chatType": pinnedChatList[0].chatType,
							"chatName": pinnedChatList[0].chatName
						};
						this.byId("idChatList").setSelectedItem(this.byId("idChatList").getItems()[0]);
						this.getChatHistory(oHistoryPayload);
					}
				}.bind(this),
				function (oEvent) {}.bind(this));
		},

		getFavoriteMessages: function () {
			var url = "/WorkboxJavaService/chat/getAllFavorite";
			this.doAjax(url, "GET", null, function (oData) {
				var aMessages = oData.messages;
				var oCollaborationModel = this.getModel("oCollaborationModel");
				oCollaborationModel.setProperty("/favMessages", aMessages);
				for (var i = 0; i < aMessages.length; i++) {
					oCollaborationModel.setProperty("/favMessages/" + i + "/favorite", true);
				}
			}.bind(this), function (oEvent) {}.bind(this));
		},

		openEmojiChat: function (oEvent) {
			if (!this.getModel("oCollaborationModel").getProperty("/noData")) {
				this.openEmojiFrgament(oEvent);
			}
		},

		//Adding emoji	
		addEmoji: function (oEvent) {
			this.addEmojiToText(oEvent);
		},

		fnScrollBottom: function (Id) {
			var oScrollContainer = this.getView().byId(Id).getId();
			setTimeout(function () {
				$("#" + oScrollContainer).scrollTop(document.getElementById(oScrollContainer).scrollHeight);
			}, 50);
		},

		onCloseResourceFragment: function () {
			sap.ui.getCore().byId("WB_RESOURCES_LIST").removeSelections();
			this._oAddResourceFragment.close();
		},

		fnSearch: function (oEvent) {
			var oEvent = oEvent;
		},

	});

});
jQuery.sap.declare("oneapp.incture.report.reports.util.formatter");
oneapp.incture.report.reports.util.formatter = {
 fnStatusColour: function (vStatus) {
        var id = this.oParent.sId;
        var cid = this.oParent.oParent.oParent.sId;

        if (vStatus == "Completed") {
            return "Success";
        } else if (vStatus == "Error") {
            return "Error";
        } else {
            return "Warning";
        }
    },
    fnSetColorValidate: function (vStatus) {


        if (vStatus == "1") {
            return "Success";
        } else if (vStatus == "3") {
            return "Error";
        } else {
            return "Warning";
        }
    },
      fnFormatDate: function (oVal) {
        if (oVal) {

            var oPattern = "MM-dd-yyyy";

            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: oPattern
            });
            var oFormattedVal = JSON.stringify(oVal).substr(1, 19);
            oFormattedVal = new Date(oFormattedVal);
            oFormattedVal = oDateFormat.format(oFormattedVal);
            return oFormattedVal;
        }
    },
	/*****************COMMON FORMATTER - START *********************/
	//setting the values in multicombobox - create instance value in value property
	wbSetSelectedKeysString: function (value) {
		if (value) {
			return value.split(",");
		} else {
			return [];
		}
	},
	wbDateFormatter: function (value) {
		if (!value) {
			value = new Date();
		}
		var date = new Date(value);
		var dd = date.getDate();
		if (dd < 10) {
			dd = '0' + date.getDate();
		}
		var formattedDate = dd + " " + date.toLocaleString("en-us", {
			month: "short"
		}) + " " + date.getFullYear();
		return formattedDate;
	},
	wbTimeFormatter: function (value) {
		if (!value) {
			value = new Date();
		}
		var date = new Date(value);
		var time = date.toLocaleTimeString(navigator.language, {
			hour: '2-digit',
			minute: '2-digit'
		});
		// var time = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
		return time;
	},
	wbDayFormatter: function (value) {
		var date = new Date(value);
		var formattedDay = date.getDay();
		return formattedDay;
	},
	wbReturnDatePickerDateObj: function (date) {
		if (!date) {
			return;
		}
		date = new Date(date);
		var oDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
		return oDate;
	},
	wbAttachmentSizeParser: function (fileSize) {
		if (!fileSize) {
			this.setVisible(false);
			return null;
		} else {
			this.setVisible(true);
			fileSize = parseFloat(fileSize);
			var sizeInMB = (fileSize / (1024 * 1024)).toFixed(1);
			var sizeInKB = (fileSize / (1024)).toFixed(1);
			if (sizeInMB < 1) {
				return sizeInKB + " KB";
			} else
				return sizeInMB + " MB";
		}

	},
	wbParseAttachmentType: function (value, type) {
		if (type) {
			// Check type 
			type = type.toLocaleLowerCase();
			if (type.includes("application") || type.includes("image")) {
				type = type.split("/")[1];
			} else {
				type = type.split(",")[1];
			}

			var oSource = "images/AttachmentZIP.png";
			var fileExt = "";
			if (type === "png") {
				fileExt = "data:image/" + type + ";base64,";
				oSource = "images/AttachmentPNG.png";
				if (value) {
					oSource = fileExt + value;
				}
			} else if (type === "jpg" || type === "jpeg") {
				fileExt = "data:image/" + type + ";base64,";
				oSource = "images/AttachmentJPG.png";
				if (value) {
					oSource = fileExt + value;
				}
			} else if (type === "pdf") {
				oSource = "images/AttachmentPDF.png";
			} else if (type === "xlsx" || type === "xls" || type === "vnd.ms-excel" || type ===
				"vnd.openxmlformats-officedocument.spreadsheetml.sheet" || type === "vnd.openxmlformats-officedocument.spreadsheetml.template" ||
				type === "vnd.oasis.opendocument.spreadsheet") {
				oSource = "images/AttachmentXLS.png";
			} else if (type === "ods") {
				oSource = "images/AttachmentXLS.png";
			} else if (type === "docx" || type === "vnd.openxmlformats-officedocument.wordprocessingml.document") {
				oSource = "images/AttachmentDOC.png";
			} else if (type === "ppt" || type === "vnd.ms-powerpoint" || type === "vnd.openxmlformats-officedocument.presentationml.presentation" ||
				type === "vnd.openxmlformats-officedocument.presentationml.slideshow") {
				oSource = "images/AttachmentPPT.png";
			} else if (type === "zip") {
				oSource = "images/AttachmentZIP.png";
			} else if (type === "msg") {
				oSource = "images/AttachmentMSG.jpg";
			}
		} else {
			oSource = null;
		}
		return oSource;

	},
	wbGetAvatarInitials: function (name) {
		if (name === "Chat Bot" || name === "ChatBot") {
			this.setSrc("images/ChatbotIcon.svg");
			return "";
		} else if (name) {
			name = name.trim();
			var aName = name.split(" ");
			var sInitials = aName[0].substring(0, 1) + aName[aName.length - 1].substring(0, 1);
			return sInitials.toUpperCase();
		} else {
			return "";
		}
	},

	/*****************UNIFIED INBOX - START *********************/

	//setting the count of inbox type
	wbInboxTitleCount: function (currentViewPageName, inboxType, count, WB_TASK_BOARD_VIEW) {
		var text = currentViewPageName;
		if (!currentViewPageName) {
			text = this.getModel("i18n").getResourceBundle().getText("MY_TASKS_TEXT");
		}
		if (inboxType !== "PinnedTasks" && !WB_TASK_BOARD_VIEW) {
			if (count) {
				text = text + "  (" + count + ")";
			}
		}
		return text;
	},

	//setting the count of inbox type - pinned tasks
	wbPinnedTasksText: function (inboxType, count) {
		var text = "Pinned Tasks";
		if (inboxType === "PinnedTasks") {
			if (count) {
				text = text + "  (" + count + ")";
			}
		}
		return text;
	},
	//changing the date format in task detail page (header)
	wbTaskDetailDateFormatter: function (value) {
		if (!value) {
			value = new Date();
		}
		var formattedDate = "";
		if (value) {
			var day;
			day = new Date(value);
			day = day.toString().split(" ")[0];
			var date = new Date(value).toLocaleString();
			formattedDate = day + " " + date;
		}
		return formattedDate;
	},

	wbGetSelectedTasksNumber: function (selectedItems) {
		var SelectedTasksNumber = 0;
		if (selectedItems) {
			SelectedTasksNumber = selectedItems.length;
		}
		return SelectedTasksNumber;
	},
	/*****************TASK CARD VIEW - START*********************/
	//function to set the status color in inbox card view
	wbSetStatusColor: function (taskSla, currentViewPage, status) {
		if (status !== "DRAFT") {
			if (taskSla === "BREACHED") {
				this.addStyleClass("wbInboxListStatusRedBorderClass");
			} else if (taskSla === "CRITICAL") {
				this.addStyleClass("wbInboxListStatusAmberBorderClass");
			} else {
				this.addStyleClass("wbInboxListStatusGreenBorderClass");
			}
		}
		var actionContent = this.getAggregation("content")[0].getItems()[0].getAggregation("items")[1];
		if (this.isSelected()) {
			actionContent.addStyleClass("wbInboxActionTransparentClass");
			actionContent.removeStyleClass("wbInboxActionBackgroundClass");
			// this.addStyleClass("wbInboxCardSelected");
		} else {
			actionContent.addStyleClass("wbInboxActionBackgroundClass");
			actionContent.removeStyleClass("wbInboxActionTransparentClass");
			// this.removeStyleClass("wbInboxCardSelected");

		}

		return true;
	},
	wbResolveBtnVisibility: function (taskType, inboxType, status) {
		if (inboxType === "CreatedTasks") {
			return false;
		}
		if (taskType === "Complete/Resolve") {
			if (status === "RESOLVED" && inboxType === "AdminInbox") {
				return false;
			} else if (status === "RESOLVED") {
				return true;
			}

		} else {
			return false;
		}
	},

	/*****************TASK CALENDAR VIEW- START *********************/
	wbgetTeamCalendarDate: function (Date) {
		var date = new window.Date([Date]);
		return date;
	},
	wbgetSlaType: function (taskSla) {
		var Type = "Type06";
		if (taskSla === "ON_TIME") {
			Type = "Type06";
		} else if (taskSla === "CRITICAL") {
			Type = "Type02";
		} else if (taskSla === "BREACHED") {
			Type = "Type08";
		}
		return Type;
	},
	wbformatTitle: function (title) {
		var formattedTitle = title;
		if (!title) {
			formattedTitle = " ";
		}
		return formattedTitle;
	},

	wbSetGraphLinkStyleClass: function (page) {
		var currentPagePath = this.getBindingContext("oGraphDataModel").sPath.split("pages")[0];
		var currentPage = this.getModel("oGraphDataModel").getProperty(currentPagePath + "selectedPage");
		if (page === currentPage) {
			this.addStyleClass("wbInboxActivePaginationLinkColor");
			this.removeStyleClass("wbInboxPaginationLinkColor");
		} else {
			this.removeStyleClass("wbInboxActivePaginationLinkColor");
			this.addStyleClass("wbInboxPaginationLinkColor");
		}
		return true;
	},

	/*****************TASK BOARD - START *********************/
	//To set scroll for each tray in task board view 

	//input- screen height and contents in the tray
	//output- scroollbar height in px
	wbSetTaskBoardHeight: function (contents) {
		var screenHeight;
		var deviceHeight = sap.ui.Device.resize.height;
		if (contents.length < 4) {
			screenHeight = "auto";
		} else {
			screenHeight = deviceHeight - 292 + "px";
		}
		return screenHeight;
	},

	//to set the border color (wrt taskSla) and the height (wrt progress) in tray (task board view)
	wbTaskBoardTrayStatus: function (taskSla, slaDueDate, createdAt) {
		//to set the border color
		if (taskSla === "BREACHED") {
			this.addStyleClass("wbInboxListStatusRedBorderClass");
		} else if (taskSla === "CRITICAL") {
			this.addStyleClass("wbInboxListStatusAmberBorderClass");
		} else {
			this.addStyleClass("wbInboxListStatusGreenBorderClass");
		}
		this.addStyleClass("wbTaskBoardBorderClass");
		//to set the border height
		var sDate = new Date(slaDueDate);
		var cDate = new Date(createdAt);
		var diff = ((sDate.getDate() - cDate.getDate()) * 24) + (sDate.getHours() - cDate.getHours());
		var rDiff = ((new Date().getDate() - cDate.getDate()) * 24) + (new Date().getHours() - cDate.getHours());
		var rem = diff - rDiff;

		if (rem < 0 || sDate.getMonth() < new Date().getMonth()) {
			this.setHeight("auto");
		} else {
			var pRem = (Math.ceil(rem / 100) - (rem / 100)) / 2;
			if (pRem) {
				if (pRem > 0 && pRem < 0.2) {
					this.setHeight("1rem");
				} else if (pRem > 0.2 && pRem < 0.4) {
					this.setHeight("2rem");
				} else if (pRem > 0.4 && pRem < 0.6) {
					this.setHeight("3rem");
				} else if (pRem > 0.6 && pRem < 0.8) {
					this.setHeight("4rem");
				} else {
					this.setHeight("4.5rem");
				}
			} else {
				this.setHeight("0rem");
			}
		}
		return true;
	},

	/*****************PAGINATION - START *********************/
	//function to set the items in pagination
	wbSetPaginationItems: function (pages, taskBoardPages, taskBoardView) {
		if (taskBoardView) {
			this.getBinding("items").sPath = "/pagination/taskBoardPages";
		} else {
			this.getBinding("items").sPath = "/pagination/pages";
		}
		return true;
	},
	//function to set the styling of link - pagination (inbox)
	wbSetLinkStyleClass: function (page, currentPage, currentPageTray, taskBoardView) {
		var cPage = parseInt(currentPage, 10);
		if (taskBoardView) {
			cPage = parseInt(currentPageTray, 10);
		}
		if (parseInt(page, 10) === cPage) {
			this.addStyleClass("wbInboxActivePaginationLinkColor");
			this.removeStyleClass("wbInboxPaginationLinkColor");
		} else {
			this.removeStyleClass("wbInboxActivePaginationLinkColor");
			this.addStyleClass("wbInboxPaginationLinkColor");
		}
		return page;
	},
	/*****************ACTION BUTTON - START *********************/
	//setting the visibility of action buttons - sub header action buttons (app view) //commented
	setActionButtonVisibility: function (visible, currentViewPage, name, inboxTab) {
		if (currentViewPage === "CreatedTasks" || currentViewPage === "RequestorCompletedTasks" || currentViewPage === "CompletedTasks") {
			if (name === "Forward") {
				visible = false;
			}
		}
		if (currentViewPage === "AdminInbox") {
			if (name === "Forward" || name === "View") {
				visible = true;
			} else {
				visible = false;
			}
		}
		if (inboxTab === "PinnedTasks") {
			if (name === "Forward") {
				visible = false;
			}
		}
		return visible;
	},
	/*****************ADVANCE FILTER - START *********************/
	wbSetSearchSubject: function (subjectIndex, currentViewPage, filterToken) {
		if (!filterToken || filterToken.length === 0) {
			if (currentViewPage !== "chat") {
				this.bindProperty("value", "oAdvanceFilterModel>" + subjectIndex + "/value");
			} else {
				this.unbindProperty("value");
			}
			return true;
		} else {
			return false;
		}
	},
	wbSetSearchIcon: function (currentViewPage) {
		this.removeStyleClass("wbAdvSearchFilterDropdownIcon wbAdvSearchFilterSearchIcon");
		if (currentViewPage !== "chat") {
			this.setSrc("sap-icon://dropdown");
			this.setSize("1.4rem");
			this.addStyleClass("wbAdvSearchFilterDropdownIcon");
		} else {
			this.setSrc("sap-icon://search");
			this.setSize("1rem");
			this.addStyleClass("wbAdvSearchFilterSearchIcon");
		}
		return true;
	},
	wbSetReadOnlyCB: function () {
		this.addEventDelegate({
			"onAfterRendering": function (oEvent) {
				oEvent.srcControl.getDomRef().getElementsByClassName("sapMInputBaseInner")[0].setAttribute("readonly", true);
				oEvent.srcControl.getDomRef().addEventListener('keydown', function (event) {
					// Trigger when backspace and delete is clicked from keyboard
					if (event.keyCode === 8 || event.keyCode === 46) {
						var id = event.target.parentNode.parentNode.id;
						var combobox = sap.ui.getCore().byId(id);
						if (document.getSelection().toString() === combobox.getSelectedItem().getText()) {
							combobox.clearSelection();
							combobox.setValue("");
							combobox.fireSelectionChange();
						}
					}
				});
			}.bind(this)
		}, this);
		return true;
	},
	wbBlurInput: function () {
		this.addEventDelegate({
			"onAfterRendering": function (oEvent) {
				oEvent.srcControl.getDomRef().getElementsByClassName("sapMInputBaseInner")[0].setAttribute("readonly", true);
			}.bind(this)
		}, this);
		return true;
	},
	wbFilterScroll: function (filterTokens) {
		this.addEventDelegate({
			"onAfterRendering": function (oEvent) {
				oEvent.srcControl.getDomRef().addEventListener('mousemove', function (event) {
					this.getModel("oAdvanceFilterModel").getProperty("/appController").showScrollCarouselIcon();
				}.bind(this));
				var slider = document.querySelector('#' + this.getId());
				var isDown = false;
				var startX;
				var scrollLeft;

				slider.addEventListener('mousedown', function (e) {
					var rect = slider.getBoundingClientRect();
					isDown = true;
					slider.classList.add('active');
					// Get initial mouse position
					startX = e.pageX - rect.left;
					// Get initial scroll position in pixels from left
					scrollLeft = slider.scrollLeft;
				});

				slider.addEventListener('mouseleave', function () {
					isDown = false;
					slider.dataset.dragging = false;
					slider.classList.remove('active');
				});

				slider.addEventListener('mouseup', function () {
					isDown = false;
					slider.dataset.dragging = false;
					slider.classList.remove('active');
				});

				slider.addEventListener('mousemove', function (e) {
					if (!isDown) return;
					var rect = slider.getBoundingClientRect();
					e.preventDefault();
					slider.dataset.dragging = true;
					// Get new mouse position
					var x = e.pageX - rect.left;
					// Get distance mouse has moved (new mouse position minus initial mouse position)
					var walk = (x - startX);
					// Update scroll position of slider from left (amount mouse has moved minus initial scroll position)
					slider.scrollLeft = scrollLeft - walk;
					// console.log(x, walk, slider.scrollLeft);
				});
			}.bind(this)
		}, this);
		return true;
	},
	wbShowSubMenuQuickFilter: function (key, inboxType) {
		var bool = true;
		if (key !== "sortBy") {
			this.removeAllAggregation("submenu");
		}
		if (inboxType === "CompletedTasks" && key === "SLA Breached") {
			bool = false;
		}
		if (inboxType !== "CompletedTasks" && key === "Completed After SLA") {
			bool = false;
		}
		return bool;
	},

	/*****************TASK CREATION - START *********************/
	wbShowUploadedImageInstanceCreation: function (value) {
		if (!value) {
			return false;
		}
		return true;
	},

	//setting the values in multicombobox - create instance
	wbValueListCreateInstance: function (valueList) {
		var selectedKeys = [];
		if (valueList) {
			if (valueList.length > 0) {
				for (var i = 0; i < valueList.length; i++) {
					selectedKeys.push(valueList[i].id);
				}
			}
		}
		return selectedKeys;
	},
	wbSetTableGridLocation: function (tablePosition) {
		this.addEventDelegate({
			"onAfterRendering": function (oEvent) {
				oEvent.srcControl.getDomRef().style.gridRowEnd = this;
			}.bind(this)
		}, tablePosition);
		return true;
	},

	/*****************TASK DETAIL- START *********************/

	//setting the selected property of radio button group in task detail page (role - IC manager, analyst)
	wbTaskDetailRadioBtnFn: function (valueHelp, value) {
		var selectedIndex = 0;
		for (var i = 0; i < valueHelp.length; i++) {
			if (value === valueHelp[i].key) {
				selectedIndex = i;
			}
		}
		return selectedIndex;
	},

	//setting editable property for button and input in line item for process purchase order - task detail page
	wbSetEditableForQtyTDetail: function (bnfo, selectedItem) {
		if (bnfo && selectedItem) {
			if (bnfo === selectedItem) {
				return true;
			} else {
				return false;
			}
		}
	},

	//to check date format for process purchase order - task detail page
	wbFormatDeliveryDateTDetail: function (date) {
		if (date) {
			return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);;
		} else {
			return "";
		}
	},

	/*****************PROCESS STORY - START *********************/
	wbSetShowDetailsPS: function (isDetailsOpen, status) {
		var type = "Inactive";
		if (isDetailsOpen && status && (status !== "NOTSTARTED" && status !== "NOT STARTED")) {
			type = "Active";
		}
		return type;
	},
	wbProcessFlowScroll: function (isShowDetails) {
		this.removeStyleClass("wbHideScroll");
		if (isShowDetails) {
			this.addStyleClass("wbHideScroll");
		}
		return true;
	},
	wbProcessFlowAuditMsg: function (action, userName, sendToUserName) {
		var msg = "";
		action = action.toLowerCase();
		if (action === "new") {
			msg = userName + " created a new task";
		} else if (action === "forward") {
			msg = userName + " forwarded the task to " + sendToUserName;
		} else if (action === "completed" || action === "resolved" || action === "accepted" || action === "approved" || action ===
			"rejected" ||
			action === "done") {
			msg = action.charAt(0).toUpperCase() + action.slice(1) + " by " + userName;
		} else if (action === "complete" || action === "resolve" || action === "approve") {
			msg = action.charAt(0).toUpperCase() + action.slice(1) + "d by " + userName;
		} else {
			msg = action.charAt(0).toUpperCase() + action.slice(1) + "ed by " + userName;
		}
		return msg;
	},
	wbProcessFlowAuditComment: function (action, comment) {
		var msg = "";
		action = action.toLowerCase();
		if (comment) {
			if (action === "completed" || action === "resolved" || action === "accepted" || action === "approved" ||
				action === "done" || action === "complete" || action === "resolve" || action === "approve") {
				msg = "Approver comment: " + comment;
			} else if (action === "reject" || action === "rejected" || action === "decline") {
				msg = "Rejecter comment: " + comment;
			} else {
				msg = "Comment: " + comment;
			}
		} else {
			msg = null;
			this.setVisible(false);
		}
		return msg;
	},
	wbSetProcessFlowContentStyle: function (isShowDetails) {
		this.removeStyleClass("wbProcessFlowMainContentOpened wbProcessFlowMainContent");
		if (isShowDetails) {
			this.addStyleClass("wbProcessFlowMainContentOpened");
		} else {
			this.addStyleClass("wbProcessFlowMainContent");
		}
		return true;
	},
	wbSetProcessFlowStatusIcon: function (status) {
		var iconSrc;
		this.removeStyleClass(
			"wbProcessFlowIconRejectedState wbProcessFlowIconReadyState wbProcessFlowIconCompletedState wbProcessFlowIconNSState");
		if (status) {
			if (status === "READY" || status === "RESERVED" || status === "RESOLVED") {
				iconSrc = "sap-icon://pending";
				this.addStyleClass("wbProcessFlowIconReadyState");
			} else if (status === "REJECTED" || status === "REJECT" || status === "DECLINED" || status === "CANCELED") {
				iconSrc = "sap-icon://accept";
				this.addStyleClass("wbProcessFlowIconRejectedState");
			} else if (status === "COMPLETED" || status === "DONE" || status === "ACCEPTED" || status === "APPROVE" ||
				status === "APPROVED") {
				iconSrc = "sap-icon://accept";
				this.addStyleClass("wbProcessFlowIconCompletedState");
			} else if (status === "NOTSTARTED" || status === "NOT STARTED") {
				iconSrc = "sap-icon://lateness";
				this.addStyleClass("wbProcessFlowIconNSState");
			} else {
				iconSrc = "sap-icon://pending";
				this.addStyleClass("wbProcessFlowIconReadyState");
			}
		} else {
			iconSrc = "sap-icon://pending";
			this.addStyleClass("wbProcessFlowIconReadyState");
		}
		return iconSrc;
	},
	wbSetProcessFlowConnectingBar: function (showConnectingBar, status) {

		this.removeStyleClass(
			"wbProcessFlowBarReadyState wbProcessFlowBarRejectedState wbProcessFlowBarCompletedState wbProcessFlowBarNSState");
		if (status) {
			if (status === "READY" || status === "RESERVED" || status === "RESOLVED") {
				this.addStyleClass("wbProcessFlowBarReadyState");
			} else if (status === "REJECTED" || status === "REJECT" || status === "DECLINED" || status === "CANCELED") {
				this.addStyleClass("wbProcessFlowBarRejectedState");
			} else if (status === "COMPLETED" || status === "DONE" || status === "ACCEPTED" || status === "APPROVE" ||
				status === "APPROVED") {
				this.addStyleClass("wbProcessFlowBarCompletedState");
			} else if (status === "NOTSTARTED" || status === "NOT STARTED") {
				this.addStyleClass("wbProcessFlowBarNSState");
			} else {
				this.addStyleClass("wbProcessFlowBarReadyState");
			}
		} else {
			this.addStyleClass("wbProcessFlowBarReadyState");
		}
		var oProcessFlowModel = this.getBindingContext("oProcessFlowModel").getModel();

		if (showConnectingBar !== false) {
			var absPath = this.getBindingContext("oProcessFlowModel").getPath();
			showConnectingBar = true; //By default set it to true
			if (absPath && absPath.includes("subTask")) {
				var sPath = absPath.split("/");
				var rowIndex = sPath.splice(sPath.length - 1, 3);
				sPath = sPath.join("/");
				if (oProcessFlowModel.getProperty(sPath).length - 1 === parseInt(rowIndex, 10)) {
					showConnectingBar = false; //For last sub task set it to false

					if (oProcessFlowModel.getProperty(absPath + "/subTask") && oProcessFlowModel.getProperty(absPath + "/subTask").length > 0) //For last sub task set it to false
					{
						showConnectingBar = true;
					}
				}
			}
		}

		return showConnectingBar;
	},
	wbSetProcessFlowSubTaskConnectingBar: function (showConnectingBar, status) {
		this.removeStyleClass(
			"wbProcessFlowBarSTReadyState wbProcessFlowBarSTRejectedState wbProcessFlowBarSTCompletedState wbProcessFlowBarSTNSState");
		if (status) {
			if (status === "READY" || status === "RESERVED" || status === "RESOLVED") {
				this.addStyleClass("wbProcessFlowBarSTReadyState");
			} else if (status === "REJECTED" || status === "REJECT" || status === "DECLINED" || status === "CANCELED") {
				this.addStyleClass("wbProcessFlowBarSTRejectedState");
			} else if (status === "COMPLETED" || status === "DONE" || status === "ACCEPTED" || status === "APPROVE" ||
				status === "APPROVED") {
				this.addStyleClass("wbProcessFlowBarSTCompletedState");
			} else if (status === "NOTSTARTED" || status === "NOT STARTED") {
				this.addStyleClass("wbProcessFlowBarSTNSState");
			} else {
				this.addStyleClass("wbProcessFlowBarSTReadyState");
			}
		} else {
			this.addStyleClass("wbProcessFlowBarSTReadyState");
		}
		var oProcessFlowModel = this.getBindingContext("oProcessFlowModel").getModel();
		if (showConnectingBar !== false) {
			var absPath = this.getBindingContext("oProcessFlowModel").getPath();
			showConnectingBar = false;
			if (absPath.includes("subTask")) {
				var sPath = absPath.split("/");
				// sPath.splice(sPath.length - 3, 3); 
				var rowIndex = sPath.splice(sPath.length - 1, 3);
				sPath = sPath.join("/");
				if (parseInt(rowIndex, 10) === 0) {
					showConnectingBar = true;
				}
			}
		}

		return showConnectingBar;
	},
	wbSetProcessFlowAuditConnectingBar: function (auditId, lastAuditId) {
		var bool = true;
		auditId = this.getBindingContext("oProcessFlowModel").getObject().auditId;
		if (auditId === lastAuditId) {
			bool = false;
		}
		return bool;
	},
	wbSetProcessFlowTaskBackground: function (status, eventId, selTaskEvent, showDetails) {
		this.removeStyleClass(
			"wbProcessFlowTaskBackgroundReadyStateSel wbProcessFlowTaskBackgroundSel wbProcessFlowTaskBackgroundCompletedStateSel wbProcessFlowTaskBackgroundNSSel wbProcessFlowTaskBackgroundRejectedStateSel wbProcessFlowTaskBackgroundNS wbProcessFlowTaskBackgroundReadyState  wbProcessFlowTaskBackgroundRejectedState wbProcessFlowTaskBackgroundCompletedState"
		);
		if (status) {
			if (showDetails && (eventId === selTaskEvent)) {
				if (status === "READY" || status === "RESERVED" || status === "RESOLVED") {
					this.addStyleClass("wbProcessFlowTaskBackgroundReadyStateSel");
					this.addStyleClass("wbProcessFlowTaskBackgroundSel");
				} else if (status === "REJECTED" || status === "REJECT" || status === "DECLINED" || status === "CANCELED") {
					this.addStyleClass("wbProcessFlowTaskBackgroundRejectedStateSel");
					this.addStyleClass("wbProcessFlowTaskBackgroundSel");
				} else if (status === "COMPLETED" || status === "DONE" || status === "ACCEPTED" || status ===
					"APPROVE" || status === "APPROVED") {
					this.addStyleClass("wbProcessFlowTaskBackgroundSel");
					this.addStyleClass("wbProcessFlowTaskBackgroundCompletedStateSel");
				} else if (status === "NOTSTARTED" || status === "NOT STARTED") {
					this.addStyleClass("wbProcessFlowTaskBackgroundSel");
					this.addStyleClass("wbProcessFlowTaskBackgroundNSSel");
				}
			}
			// else if((!showDetails && (eventId === selTaskEvent)) || (showDetails && (eventId !== selTaskEvent))){
			else {
				if (status === "READY" || status === "RESERVED" || status === "RESOLVED") {
					this.addStyleClass("wbProcessFlowTaskBackgroundReadyState");
				} else if (status === "REJECTED" || status === "REJECT" || status === "DECLINED" || status === "CANCELED") {
					this.addStyleClass("wbProcessFlowTaskBackgroundRejectedState");
				} else if (status === "COMPLETED" || status === "DONE" || status === "ACCEPTED" || status === "APPROVE" ||
					status === "APPROVED") {
					this.addStyleClass("wbProcessFlowTaskBackgroundCompletedState");
				} else if (status === "NOTSTARTED" || status === "NOT STARTED") {
					this.addStyleClass("wbProcessFlowTaskBackgroundNS");
				} else {
					this.addStyleClass("wbProcessFlowTaskBackgroundReadyState");
				}
			}
		} else {
			this.addStyleClass("wbProcessFlowTaskBackgroundReadyState");
		}
		return true;
	},
	wbSetProcessFlowTaskArrow: function (status, eventId, selTaskEvent, showDetails) {
		this.removeStyleClass(
			"wbProcessFlowSelTaskArrowReady wbProcessFlowSelTaskArrowRejected wbProcessFlowSelTaskArrowCompleted wbProcessFlowSelTaskArrowNS");
		if (status) {
			if (showDetails && (eventId === selTaskEvent)) {
				if (status === "READY" || status === "RESERVED" || status === "RESOLVED") {
					this.addStyleClass("wbProcessFlowSelTaskArrowReady");
				} else if (status === "REJECTED" || status === "REJECT" || status === "DECLINED" || status === "CANCELED") {
					this.addStyleClass("wbProcessFlowSelTaskArrowRejected");
				} else if (status === "COMPLETED" || status === "DONE" || status === "ACCEPTED" || status ===
					"APPROVE" || status === "APPROVED") {
					this.addStyleClass("wbProcessFlowSelTaskArrowCompleted");
				} else if (status === "NOTSTARTED" || status === "NOT STARTED") {
					this.addStyleClass("wbProcessFlowSelTaskArrowNS");
				}

			}
		} else {
			this.addStyleClass("wbProcessFlowSelTaskArrowReady");
		}
		return true;
	},
	wbSetProcessFlowTaskHBoxUnderline: function (status) {
		this.removeStyleClass(
			"wbProcessFlowTaskHBoxULReadyState wbProcessFlowTaskHBoxULRejectedState wbProcessFlowTaskHBoxULCompletedState wbProcessFlowTaskHBoxULNS"
		);
		if (status) {
			if (status === "READY" || status === "RESERVED" || status === "RESOLVED") {
				this.addStyleClass("wbProcessFlowTaskHBoxULReadyState");
			} else if (status === "REJECTED" || status === "REJECT" || status === "DECLINED" || status === "CANCELED") {
				this.addStyleClass("wbProcessFlowTaskHBoxULRejectedState");
			} else if (status === "COMPLETED" || status === "DONE" || status === "ACCEPTED" || status === "APPROVE" ||
				status === "APPROVED") {
				this.addStyleClass("wbProcessFlowTaskHBoxULCompletedState");
			} else if (status === "NOTSTARTED" || status === "NOT STARTED") {
				this.addStyleClass("wbProcessFlowTaskHBoxULNS");
			} else {
				this.addStyleClass("wbProcessFlowTaskHBoxULReadyState");
			}
		} else {
			this.addStyleClass("wbProcessFlowTaskHBoxULReadyState");
		}
		return true;
	},
	wbSetProcessFlowCompletionTime: function (status, totalTime, taskSla) {
		this.removeStyleClass(
			"wbProcessFlowTaskCompletionTimeRejectedState wbProcessFlowTaskCompletionTimeReadyState"
		);
		var isVisible = false;
		if (status && totalTime) {
			if (status === "READY" || status === "RESERVED" || status === "RESOLVED" || status === "NOTSTARTED") {
				isVisible = false;
			} else if ((status === "REJECTED" || status === "REJECT" || status === "DECLINED" || status === "CANCELED")) {
				this.addStyleClass("wbProcessFlowTaskCompletionTimeRejectedState");
				isVisible = true;

			} else if ((status === "COMPLETED" || status === "DONE" || status === "ACCEPTED" || status === "APPROVE" || status ===
					"APPROVED")) {
				this.addStyleClass("wbProcessFlowTaskCompletionTimeReadyState");
				isVisible = true;
			}
		} else {
			isVisible = false;
		}
		if (taskSla === "BREACHED") {
			this.addStyleClass("wbFormReturnedStatusText");
		} else if (taskSla === "CRITICAL") {
			this.addStyleClass("wbFormPendingStatusText");
		} else {
			this.addStyleClass("wbFormApprovedStatusText");
		}
		return isVisible;
	},
	wbProcessFlowTime: function (sentAt) {
		var sTime = "";
		if (sentAt != "" && sentAt !== null) {
			sTime = sentAt;
			sentAt = new Date(sentAt);
			var hrs = sentAt.getHours();
			var mins = sentAt.getMinutes();
			sentAt.setHours(hrs);
			sentAt.setMinutes(mins);
			var diffTime = Math.abs(new Date() - sentAt);
			var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
			if (mins < 10) {
				mins = "0" + mins;
			}
			if (diffDays === 0) {
				sTime = "" + sentAt.toLocaleTimeString(navigator.language, {
					hour: '2-digit',
					minute: '2-digit'
				});
			}
			if (diffDays === 1) {
				sTime = "Yesterday " + sentAt.toLocaleTimeString(navigator.language, {
					hour: '2-digit',
					minute: '2-digit'
				});
			}
			if (diffDays > 1) {
				var dd = sentAt.getDate();
				if (dd < 10) {
					dd = '0' + sentAt.getDate();
				}
				sTime = dd + " " + sentAt.toLocaleString('default', {
					month: 'short'
				}) + " " + sentAt.getFullYear() + " " + sentAt.toLocaleTimeString(navigator.language, {
					hour: '2-digit',
					minute: '2-digit'
				});
			}
		}
		return sTime;
	},

	wbShowCostCenter: function (processName, costCenterValue, label) {
		var visibility = true;
		if (processName === "ProjectProposalDocumentApproval" && label.includes("Available Budget") && costCenterValue instanceof Array) {
			visibility = false;
			for (var i = 0; i < costCenterValue.length; i++) {
				if (label.includes(costCenterValue[i])) {
					visibility = true;
				}
			}
		} else if (label === "Course Information") {
			visibility = false;
		}
		return visibility;
	},

	/*****************NOTIFICATION - START *********************/

	wbSortNotifByEventOrigin: function (eventOrigin) {
		var visible = false;
		this.removeStyleClass("sapUiTinyMarginBottom");
		var oUserSettingsModel = this._getBindingContext("oUserSettingsModel").getModel();
		var prevEventOrigin = oUserSettingsModel.getProperty("/settings/notification/eventOrigin");
		if (!prevEventOrigin) {
			visible = true;
			this.addStyleClass("sapUiTinyMarginBottom");
			this.removeStyleClass("sapUiSmallMarginTop");
			oUserSettingsModel.setProperty("/settings/notification/eventOrigin", eventOrigin);
		} else if (eventOrigin !== prevEventOrigin) {
			visible = true;
			oUserSettingsModel.setProperty("/settings/notification/eventOrigin", eventOrigin);
			this.addStyleClass("sapUiTinyMarginBottom");
		}
		return visible;
	},
	wbSetFrequecyValue: function (value, selectedVal) {
		var finalValue = null;
		if (value) {
			var splitValue = value.split("-");
			if (selectedVal === "Every day") {

			} else if (selectedVal === "DAYSELECT") {
				finalValue = splitValue[3];
			} else if (selectedVal === "TIMEPICKER") {
				finalValue = splitValue[splitValue.length - 3] + "-" + splitValue[splitValue.length - 2] + "-" + splitValue[splitValue.length - 1];
			} else if (selectedVal === "DATESELECT") {
				finalValue = splitValue[2];
			} else if (selectedVal === "DATEPICKER") {
				var date = new Date(new Date().getFullYear() + " " + splitValue[1] + " " + splitValue[2]);
				finalValue = this.wbReturnDatePickerDateObj(date);
			} else if (selectedVal === "MINUTESPICKER") {
				finalValue = splitValue[5];
			}
		}
		return finalValue;
	},
	wbNotificationGroupTable: function (header, selectedView) {
		if (selectedView === "GROUP" && header) {
			return true;
		} else {
			return false;
		}
	},
	wbNotificationEnableEventListSwitch: function (channelList, eventId) {
		if (channelList && eventId) {
			return channelList.includes(eventId);
		} else {
			return false;
		}
	},
	wbNotifSetRadioButton: function (list, childObject) {
		var index = list.indexOf(childObject.value);
		if (index !== -1) {
			return index;
		} else {
			return null;
		}
	},
	wbShowNotifSound: function (type, header) {
		var isVisible = true;
		if (type === "CHANNEL") {
			if (header === "Web") {
				isVisible = false;
			}
		}
		return isVisible;
	},
	wbSetNotificationGroup: function (label) {
		var src = "";
		if (label === "Web") {
			src = "sap-icon://laptop";
		} else if (label === "Mobile") {
			src = "sap-icon://iphone";
		} else if (label === "Email") {
			src = "sap-icon://email";
		}
		return src;
	},
	wbShowNotificationSwitchGeneral: function (settingType, isEnabled) {
		var boolean = false;
		if (settingType === "SETTINGS_ADMIN_NOTIFICATIONS") {
			boolean = true;
		}
		return boolean;
	},
	wbShowNotificationBlock: function (settingType, isEnabled) {
		var boolean = true;
		if (settingType === "SETTINGS_NOTIFICATIONS" && !isEnabled) {
			boolean = false;
		}
		return boolean;
	},
	wbShowNoSettingText: function (settings, selectedSettings) {
		var boolean = false;
		if (settings) {
			if (selectedSettings === "SETTINGS_ADMIN_NOTIFICATIONS" && settings.length === 0) {
				boolean = true;
			}
			if (selectedSettings === "SETTINGS_NOTIFICATIONS") {
				boolean = true;
				for (var i = 0; i < settings.length; i++) {
					if (settings[i].isEnable) {
						boolean = false;
						break;
					}
				}
			}
		}
		return boolean;
	},
	wbShowProfileNotifSettings: function (selectedSettings, isEnabled, isAdmin) {
		var boolean = false;
		if (selectedSettings === "SETTINGS_ADMIN_NOTIFICATIONS" && isAdmin === "Admin") {
			boolean = true;
		} else if (selectedSettings === "SETTINGS_NOTIFICATIONS" && isEnabled) {
			boolean = true;
		}
		return boolean;
	},
	wbNotificationDesc: function (desc, action, requestId, userName, loggedInUserName) {
		var msg = "";
		action = action.toLowerCase();
		if (action === "new task assigned") {
			msg = "New task is assigned to you";
		} else if (action === "forward") {
			msg = userName + " forwarded a task to you";
		} else if (action === "complete" || action === "resolve" || action === "approve") {
			msg = userName + " " + action + "d your task ";
		} else if (action === "reject") {
			msg = userName + " " + action + "ed your task ";
		} else if (action === "approved" || action === "rejected" || action === "resolved" || action === "completed") {
			msg = userName + " " + action + " your task ";
		} else if (action === "done") {
			msg = userName + " " + "done your task ";
		} else if (action === "new substitution") {
			msg = "New Substitution added for " + userName;
		} else if (action === "system updates") {
			msg = "System Updated";
		} else if (action === "substitution activation") {
			msg = "New Substitution Rule activated for " + userName;
		} else if (action === "chat") {
			msg = userName + " sent you a new message";
		} else {
			msg = desc;
		}
		return msg;
	},
	wbNotificationTitle: function (action, title, desc, userName) {
		var sTitle = "";
		if (action === "Chat") {
			if (title) {
				sTitle = title;
			} else {
				sTitle = "In a chat with " + userName;
			}
		} else {
			sTitle = title + " - " + desc;
		}
		return sTitle;
	},
	wbNotificationBannerTitle: function (action, title, desc, userName) {
		var sTitle = "";
		if (action === "Chat") {
			if (title) {
				sTitle = title + ":" + desc.substring(14);
			} else {
				sTitle = desc.substring(14);
			}
		} else {
			sTitle = title + " - " + desc;
		}
		return sTitle;
	},
	wbSetNotificatioAuthor: function (eventName, notificationType) {
		if (notificationType === "Chat") {
			return "";
		} else {
			return eventName;
		}
	},
	wbSetNotificationTime: function (createdAt) {
		var sTime = "";
		if (createdAt != "" && createdAt !== null) {
			sTime = createdAt;
			createdAt = new Date(createdAt);
			var hrs = createdAt.getHours();
			var mins = createdAt.getMinutes();
			createdAt.setHours(hrs);
			createdAt.setMinutes(mins);

			var diffTime = Math.abs(new Date() - createdAt);
			var diffDays = Math.floor(diffTime / 86400000); // days
			var diffHrs = Math.floor((diffTime % 86400000) / 3600000); // hours
			var diffMins = Math.round(((diffTime % 86400000) % 3600000) / 60000); // minutes
			if (diffDays > 1) { //Days more than 1
				sTime = diffDays + " days ago";
			} else {
				if (diffHrs > 1) { //Hours more than 1
					sTime = diffHrs + " hours ago";
				} else {
					if (diffMins > 1) { //Minutes more than 1
						sTime = diffMins + " minutes ago";
					} else {
						sTime = "A few seconds ago";
					}
				}
			}
		}
		return sTime;
	},
	wbSetNotificationPriority: function (priority) {
		priority = priority.toLowerCase();
		if (priority === "high") {
			this.addStyleClass("wbInboxListStatusRedBorderClass");
		} else if (priority === "medium") {
			this.addStyleClass("wbInboxListStatusAmberBorderClass");
		} else {
			this.addStyleClass("wbInboxListStatusGreenBorderClass");
		}
		return true;
	},
	wbBlurLabel: function (selectedsetting, selectedTab) {
		if (selectedsetting === "SETTINGS_ADMIN_NOTIFICATIONS" && selectedTab === "GENERAL")
			this.addStyleClass("wbLabelBlurBg");
		else
			this.removeStyleClass("wbLabelBlurBg");
		return false;

	},

	/*****************THEME SETTINGS- START *********************/

	//in theme settings, set border to selected theme template
	wbSetSelectedThemeBorder: function (selectedTheme, label) {
		if (selectedTheme === label) {
			this.addStyleClass("wbSettingsThemeSelectedTray");
		} else {
			this.removeStyleClass("wbSettingsThemeSelectedTray");
		}
		return true;
	},

	/*****************SUBSTITUTION - START*********************/
	wbsetSubstitutionClass: function (status) {
		if (status === "APPROVED") {
			this.addStyleClass("wbSubsitutionProcessBtnGreen");
		} else {
			this.addStyleClass("wbSubsitutionProcessBtnRed");
		}
	},
	wbSetMinDateSubsRule: function (date) {
		date = new Date();
		var oDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		return date;
	},
	wbSetMaxDateSubsRule: function (date) {
		date = new Date(2050, 11, 31)
		var oDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		return date;
	},

	/*****************USER WORKLOAD - START *********************/

	//function to set the css of workload text based on the workload range
	wbWorkloadTextColor: function (noOfTask, loadHeader, parentCheck) {
		this.removeStyleClass("wbHighWorkloadTileTextClass");
		this.removeStyleClass("wbLowWorkloadTileTextClass");
		if (noOfTask && loadHeader) {
			if (parentCheck && parentCheck === "PARENT_VALUE_CHANGE") {
				this.getParent().removeStyleClass("wbHighWorkloadTileClass");
				this.getParent().removeStyleClass("wbNormalWorkloadTileClass");
				this.getParent().removeStyleClass("wbLowWorkloadTileClass");
				if (loadHeader === "High") {
					this.getParent().addStyleClass("wbHighWorkloadTileClass");
				} else if (loadHeader === "Normal") {
					this.getParent().addStyleClass("wbNormalWorkloadTileClass");
				} else {
					this.getParent().addStyleClass("wbLowWorkloadTileClass");
				}
			}
			if (loadHeader === "High") {
				this.addStyleClass("wbHighWorkloadTileTextClass");
				return noOfTask;
			} else {
				this.addStyleClass("wbLowWorkloadTileTextClass");
				return noOfTask;
			}
		} else {
			return "";
		}
	},

	/*****************ADMIN CONSOLE TABLE CONFIGURATION - START *********************/
	//function to set the height of scroll container in table configuration tab (Admin Console - table configuration)
	wbCustomAttributeScrollHeight: function (currentViewPage) {
		var customHeight;
		if (currentViewPage === "tableConfiguration") {
			customHeight = sap.ui.Device.resize.height - 407 + "px";
		} else {
			customHeight = sap.ui.Device.resize.height - 377 + "px";
		}
		return customHeight;
	},
	//function to set the height of process list scroll in table configuration (admin console and inbox)
	wbCustomAttributeProcessScrollHeight: function (currentViewPage) {
		var customWidth;
		if (currentViewPage === "tableConfiguration") {
			customWidth = sap.ui.Device.resize.width - 976.4 + "px";
		} else {
			customWidth = sap.ui.Device.resize.width - 1046 + "px";
		}
		return customWidth;
	},
	//function to set the width of scroll container in table configuration tab (Admin Console - table configuration)
	wbCustomAttributeContainerWidth: function (currentViewPage) {
		var customWidth;
		if (currentViewPage === "tableConfiguration") {
			customWidth = sap.ui.Device.resize.width - 523 + "px";
		} else {
			customWidth = sap.ui.Device.resize.width - 808.4 + "px";
		}
		return customWidth;
	},
	//setting the standard attribute header text in table configuration
	wbAdminStdAttrText: function (key) {
		var text;
		if (key === "requestId") {
			text = "Request Id";
		} else if (key === "createdAt") {
			text = "Created At";
		} else if (key === "startedByDisp") {
			text = "Started By";
		} else if (key === "status") {
			text = "Status";
		}
		return text;
	},
	/*****************ADMIN CONSOLE MANAGE GROUPS - START *********************/
	//function to set the scroll container height of groups (Admin console - manage groups)
	wbSetCustomScrollHeight: function () {
		var customHeight = sap.ui.Device.resize.height - 279 + "px";
		this.getModel("oDefaultDataModel").setProperty("/scrollHeightCustomGroup", customHeight);
		return true;
	},
	//function to set the height of groups container(Admin console - manage groups)
	wbSetIDPScrollHeight: function () {
		var customHeight = sap.ui.Device.resize.height - 216 + "px";
		return customHeight;
	},

	//function to set the scroll container height of group members(Admin console - manage groups)
	wbSetCustomGroupMembersHeight: function () {
		var customHeight = sap.ui.Device.resize.height - 257 + "px";
		return customHeight;
	},

	/*****************ADMIN CONSOLE TASK DETAIL CONFIGURATION - START *********************/
	//function to set the scroll container height of process list (admin console - task configuration)
	wbTaskConfigProcessListHeight: function () {
		var customHeight = sap.ui.Device.resize.height - 285 + "px";
		return customHeight;
	},

	//compares the key with layout attribute list and seting selected property - Task Configuration (admin console)
	wbSetSelectedAttList: function (key, dataList) {
		var selected = false;
		if (dataList) {
			for (var i = 0; i < dataList.length; i++) {
				if (key === dataList[i].key) {
					selected = true;
				}
			}
		}
		return selected;
	},

	/*****************ADMIN CONSOLE MANAGE WORKFLOW - START *********************/

	//function to set the height of manage workflow scroll container height (admin console - manage workflow)
	wbProcessNamesHeight: function () {
		var customHeight = sap.ui.Device.resize.height - 219 + "px";
		return customHeight;
	},
	//setting the enabled property of dropdown in workflow (admin console)
	wbSetEnabledForDropdown: function (setEnabled, isEdited, runTimeUser) {
		var enable = true;
		if (!setEnabled) {
			enable = false;
			if (isEdited === 2) {
				enable = true;
				if (runTimeUser) {
					enable = false;
				}
			}
		} else {
			if (runTimeUser) {
				enable = false;
			}
		}
		return enable;
	},

	//setting the name of task owners in workflow (admin console)
	wbSetTaskOwnerText: function (individual, group, runTimeUser, ownerSelectionRules) {
		var text = "";
		if (!ownerSelectionRules) {
			ownerSelectionRules = [];
		}
		if (!individual) {
			individual = [];
		}
		if (!group) {
			group = [];
		}
		if (runTimeUser) {
			text = this.getModel("i18n").getResourceBundle().getText("DYNAMIC_APPROVER_SELECTION_TEXT");
		} else if (ownerSelectionRules.length) {
			var flag = 0;
			for (var i = 0; i < ownerSelectionRules.length; i++) {
				if (!ownerSelectionRules[i].isDeleted) {
					flag = 1;
					break;
				}
			}
			if (flag) {
				text = this.getModel("i18n").getResourceBundle().getText("RULE_BASED_TEXT") + " " + this.getModel("i18n").getResourceBundle().getText(
					"APPROVER_TEXT");
			}
		}
		if (individual.length || group.length) {
			var individualName = "";
			var groupName = "";
			if (individual) {
				if (individual.length) {
					var individualDto = this.getModel("oConstantsModel").getProperty("/allUsers");
					for (var i = 0; i < individual.length; i++) {
						for (var j = 0; j < individualDto.length; j++) {
							if (individual[i] === individualDto[j].userId) {
								individualName = individualName + " " + individualDto[j].userFirstName;
								break;
							}
						}

					}
				}
			}
			if (group) {
				if (group.length) {
					var groupDto = this.getModel("oDefaultDataModel").getProperty("/allGroups/dto");
					for (var i = 0; i < group.length; i++) {
						for (var j = 0; j < groupDto.length; j++) {
							if (group[i] === groupDto[j].groupId) {
								groupName = groupName + " " + groupDto[j].groupName;
								break;
							}
						}
					}
				}
			}
			text = individualName + groupName;
		}
		return (text);
	},
	//setting the class of task owner input container in workflow - admin console
	wbWfTakOwnerInputContainer: function (taskNature) {
		if (taskNature) {
			if (taskNature === "User Based") {
				this.addStyleClass("wbAdminWfInputContainer");
				this.removeStyleClass("wbAdminWfRuleBasedInputContainer");
			} else {
				this.removeStyleClass("wbAdminWfInputContainer");
				this.addStyleClass("wbAdminWfRuleBasedInputContainer");
			}
		}
		return true;
	},

	//setting the selected keys in source and destination
	wbWfTaskSourceDestKeys: function (sourceDropdown, selectedKeys) {
		var keys = [];
		if (!selectedKeys) {
			selectedKeys = [];
		}
		if (!sourceDropdown) {
			sourceDropdown = [];
		}
		if (selectedKeys.length) {
			if (sourceDropdown.length) {
				for (var i = 0; i < selectedKeys.length; i++) {
					for (var j = 0; j < sourceDropdown.length; j++) {
						if (selectedKeys[i] === sourceDropdown[j].key) {
							keys.push(selectedKeys[i]);
						}
					}
				}
			}
		}
		return keys;
	},

	wbAdminWfGraphScroll: function () {
		var customHeight = sap.ui.Device.resize.height - 102 + "px";
		return customHeight;
	},
	wbAdminWfDeleteButton: function (shape) {
		if (!shape) {
			var sPath = this.getParent().getBindingContext("oDefaultDataModel").getPath();
			var sTaskName = this.getModel("oDefaultDataModel").getProperty(sPath).eventName;
			if (sTaskName === "End" || sTaskName === "Start") {
				this.getParent().addStyleClass("wbAdminWfDeleteBtn");
			}
		}
		return true;
	},
	wbProcessLevelAttributes: function (attributePath, copy, processLevelAttributes) {
		var value;
		if (copy === true) {
			for (var i = 0; i < processLevelAttributes.length; i++) {
				if (attributePath.search(processLevelAttributes[i].key) >= 0) {
					value = attributePath.replace(("${" + processLevelAttributes[i].key + "}"), ("{" + processLevelAttributes[i].label + "}"));
				}
			}
		} else {
			value = attributePath;
		}
		return value;
	},
	/*****************ADMIN CONSOLE MANAGE SUBSTITUTION - START *********************/

	//function to set the height of manage substitutions scroll container height (admin console - manage substitutions)
	wbManageSubstitutionHeight: function () {
		var customHeight = sap.ui.Device.resize.height - 196 + "px";
		return customHeight;
	},
	wbTrimDate: function (value) {
		var date = value.split("T")[0];
		date = date.replace(/-/g, " ");
		return date;
	},
	wbSubsProcessCarouselCount: function (process) {
		if (process) {
			var processLength = process.length;
			if (processLength === 1 || processLength === 2) {
				return 2;
			} else if (processLength === 3) {
				return 3;
			} else if (processLength === 4) {
				return 4;
			} else {
				return 5;
			}
		}

	},

	wbSubsProcessCarouselWidth: function (process) {
		if (process) {
			var processLength = process.length;
			var carouselWidth;
			if (processLength === 1 || processLength === 2) {
				carouselWidth = 35 + "%";
			} else if (processLength === 3) {
				carouselWidth = 53 + "%";
			} else if (processLength === 4) {
				carouselWidth = 72.5 + "%";
			} else {
				carouselWidth = 89 + "%";
			}
			return carouselWidth;
		}

	},

	wbSubsSettingsCarouselCount: function (process) {
		if (process) {
			var processLength = process.length;
			if (processLength === 1 || processLength === 2) {
				return 2;
			} else if (processLength === 3) {
				return 3;
			} else {
				return 4;
			}
		}

	},

	wbSubsSettingsCarouselWidth: function (process) {
		if (process) {
			var processLength = process.length;
			var carouselWidth;
			if (processLength === 1 || processLength === 2) {
				carouselWidth = 36 + "%";
			} else if (processLength === 3) {
				carouselWidth = 55 + "%";
			} else {
				carouselWidth = 74 + "%";
			}
			return carouselWidth;
		}

	},
	/*****************ADMIN CONSOLE GRAPH CONFIGURATION - START *********************/

	//function to set the height of Graph List scroll container height (admin console - graph List)
	wbGraphListHeight: function () {
		var customHeight = sap.ui.Device.resize.height - 278 + "px";
		return customHeight;
	},

	wbCreateGraphHeight: function () {
		var customHeight = sap.ui.Device.resize.height - 160 + "px";
		return customHeight;
	},
	//setting the style class of graph icons in graph configuration - admin console
	wbGraphChartIconStyle: function (chartType) {
		this.removeStyleClass("wbAdminGraphSelIconClass");
		if (chartType === this.getAlt()) {
			this.addStyleClass("wbAdminGraphSelIconClass");
		}
		return true;
	},

	//setting the chart type of manage graphs in graph configuration  - admin console
	wbGraphChartIcon: function (chartType) {
		var src;
		if (chartType === "column") {
			src = "sap-icon://bar-chart";
		} else if (chartType === "bar") {
			src = "sap-icon://horizontal-bar-chart";
		} else if (chartType === "donut") {
			src = "sap-icon://donut-chart";
		} else if (chartType === "line") {
			src = "sap-icon://line-chart";
		} else if (chartType === "pie") {
			src = "sap-icon://pie-chart";
		} else if (chartType === "stacked_column") {
			src = "sap-icon://vertical-stacked-chart";
		} else if (chartType === "stacked_bar") {
			src = "sap-icon://horizontal-stacked-chart";
		}
		return src;
	},

	/*****************MAIN NAVIGATION - START *********************/

	//setting the class for main content page in app view
	wbSetClassMainContentPage: function (expanded) {
		if (expanded) {
			this.addStyleClass("wbMainContentClass");
			this.removeStyleClass("wbMainCollapsedContentClass");
			this.addStyleClass("wbMainPagePadding");
			if (sap.ui.getCore().getConfiguration().getLanguage() === "ar") {
				this.removeStyleClass("wbMainPagePadding");
				this.addStyleClass("wbMainPagePaddingAr");
			}
		} else {
			this.removeStyleClass("wbMainContentClass");
			this.addStyleClass("wbMainCollapsedContentClass");
			this.removeStyleClass("wbMainPagePadding");
			if (sap.ui.getCore().getConfiguration().getLanguage() === "ar") {
				this.removeStyleClass("wbMainPagePaddingAr");
			}
		}
		return true;
	},
	//setting the style class of footer icons
	wbFooterIconColor: function (currentView, key) {
		if (currentView === key) {
			this.addStyleClass("wbFooterNavIconBackgroundClass");
		} else {
			this.removeStyleClass("wbFooterNavIconBackgroundClass");
		}
		return true;
	},

	/*****************ADMIN CONSOLE WORKFLOW PREVIEW - START *********************/

	//preview process flow task level styling
	wbPreviewTaskFlowStyling: function (taskDto, templateId) {
		if (taskDto.templateId === templateId) {
			this.setType("Emphasized");
			this.addStyleClass("wbEmphasizedButtonStyleClass");
			this.removeStyleClass("wbTransparentButtonStyleClass");
		} else {
			this.setType("Transparent");
			this.removeStyleClass("wbEmphasizedButtonStyleClass");
			this.addStyleClass("wbTransparentButtonStyleClass");
		}
		return true;
	},

	wbPreview: function () {
		var customHeight = sap.ui.Device.resize.height - 150 + "px";
		return customHeight;
	},

	//preview process flow intermediary nodes visibility
	wbIntermediaryNodeVisibility: function (taskDto, eventName) {
		var visible = true;
		if (taskDto[taskDto.length - 1].eventName === eventName) {
			visible = false;
		}
		return visible;
	},
	/*****************DASHBOARD- START *********************/

	//setting the graph height
	wbGraphHeight: function () {
		var height = (sap.ui.Device.resize.height - 357) + "px";
		return height;
	},

	wbDashboardTileGrid: function (tiles) {
		var gridTemplate = "";
		if (tiles) {
			var x = 6;
			this.setVisible(true);
			if (tiles.length === 0) {
				this.setVisible(false);
			} else if (tiles.length < 6) {
				x = tiles.length;
			}
			gridTemplate = "repeat( " + x + ",  1fr)";
		}
		return gridTemplate;
	},

	//setting donut graph height
	wbDonutGraphHeight: function () {
		var height = (sap.ui.Device.resize.height - 403) + "px";
		return height;
	},
	/*****************CHAT FORMATTER - START *********************/
	wbChatPinUnpin: function (isPinned) {
		if (isPinned) {
			return "Unpin Chat";
		} else {
			return "Pin Chat";
		}
	},
	wbChatMsgBoxStyle: function (sentBy, loggedInUser) {
		this.removeStyleClass("wbChatSentMsgVbox wbChatRecdMsgVbox");
		if (sentBy === loggedInUser) {
			this.addStyleClass("wbChatSentMsgVbox");
		} else {
			this.addStyleClass("wbChatRecdMsgVbox");
		}
		return "Bare";
	},
	wbTLChatScroll: function (messages, currentPage, pageCount, scrollable) {
		// if (currentPage > 1 && (currentPage * pageCount <= messages.length)) {
		// 	var oTaskLevelChat = this._getPropertiesToPropagate()["oModels"]["oTaskLevelChat"];
		// 	var oScrollContainer = this.getId();
		// 	var prevHeight = oTaskLevelChat.getProperty("/scrollHeight");
		// 	var scrollHeight = $("#" + oScrollContainer)[0].scrollHeight;
		// 	$("#" + oScrollContainer).scrollTop(scrollHeight - prevHeight);

		// 	oTaskLevelChat.setProperty("/scrollHeight", $("#" + oScrollContainer)[0].scrollHeight);
		// }
		return true;
	},
	wbTLChatTime: function (sentAt) {
		var sTime = "";
		if (sentAt != "" && sentAt !== null) {
			sTime = sentAt;
			sentAt = new Date(sentAt);
			var hrs = sentAt.getHours();
			var mins = sentAt.getMinutes();
			sentAt.setHours(hrs);
			sentAt.setMinutes(mins);
			var diffTime = Math.abs(new Date() - sentAt);
			var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
			if (mins < 10) {
				mins = "0" + mins;
			}
			if (diffDays === 0) {

				sTime = "" + hrs + ":" + mins;
			}
			if (diffDays === 1) {

				sTime = "Yesterday " + hrs + ":" + mins;
			}
			if (diffDays > 1) {
				sTime = sentAt.getDate() + "/" + sentAt.getMonth() + " " + hrs + ":" + mins;
			}
		}
		return sTime;
	},
	wbChatCheckImage: function (type) {
		type = type.toLocaleLowerCase();
		if (type.includes("application") || type.includes("image")) {
			type = type.split("/")[1];
		} else {
			type = type.split(",")[1];
		}
		var isVisible = false;
		if (type === "png" || type === "jpg" || type === "jpeg") {
			isVisible = true;

		}
		return isVisible;
	},
	wbChatCheckNotImage: function (type) {
		type = type.toLocaleLowerCase();
		if (type.includes("application") || type.includes("image")) {
			type = type.split("/")[1];
		} else {
			type = type.split(",")[1];
		}
		var isVisible = false;
		if (type !== "png" && type !== "jpg" && type !== "jpeg") {
			isVisible = true;
		}
		return isVisible;
	},
	wbChatAttachmentName: function (name, type) {
		if (type) {
			type = type.toLocaleLowerCase();
			if (type.includes("application") || type.includes("image")) {
				type = type.split("/")[1];
			} else {
				type = type.split(",")[1];
			}
			if (!name) {
				name = "Unknown";
			}
			if (type === "vnd.oasis.opendocument.spreadsheet") { // Added by Karishma
				return name;
			} else {
				// return name + "." + type;
				return name;
			}

		} else {
			return "";
		}
	},
	wbTLChatSetGridTemplateColumns: function (aAttachments) {
		var x = 4;
		aAttachments = aAttachments ? aAttachments : []; //By Karishma
		if (aAttachments.length < 5) {
			x = aAttachments.length;
		}
		var gridTemplate = "repeat( " + x + ", minmax(3rem, 1fr) )";
		return gridTemplate;
	},
	wbTLChatIsAttachmentVisible: function (aAttachments) {
		var bool = false;
		aAttachments = aAttachments ? aAttachments : []; //By Karishma
		if (aAttachments.length > 0) {
			bool = true;
		}
		return bool;
	},

	wbRemoveSecondsFromTime: function (sTime) {
		if (sTime) {
			var newTime;
			if (sTime.split(" ")[2] === "AM" || sTime.split(" ")[2] === "PM") {
				sTime.split(" ")[1].split(":");
				newTime = sTime.split(" ")[1].split(":")[0] + ":" + sTime.split(" ")[1].split(":")[1];
				return newTime;
			} else {
				sTime.split(":");
				newTime = sTime.split(":")[0] + ":" + sTime.split(":")[1];
				return newTime;
			}

		} else {
			return sTime;
		}

	},

	wbChatPinUnpinIcon: function (isPinned) {
		if (isPinned) {
			return "sap-icon://customfont/unpinIcon";
		} else {
			return "sap-icon://customfont/PinIcon";
		}
	},
	/*****************CHATBOT FORMATTER - START *********************/
	wbChatBotVBox: function (screen) {
		this.removeStyleClass("wbTLChatMainContent wbChatBotMainContent");
		if (screen === "unifiedInbox") {
			this.addStyleClass("wbTLChatMainContent");
		} else {
			this.addStyleClass("wbChatBotMainContent");
		}
		return true;
	},
	wbChatBotMsgBox: function (sentBy) {
		this.removeStyleClass("wbChatSentMsgVbox wbChatRecdMsgVbox");
		if (sentBy === "USER") {
			this.addStyleClass("wbChatSentMsgVbox");
		} else {
			this.addStyleClass("wbChatRecdMsgVbox");
		}
		return true;
	},

	/****************** Collaboartion Changes -BY Karishma *********************/

	WbGetTime: function (date) {
		if (date === "null") {
			return "";
		} else if (date) {
			date = Number(date);
			var sDate = new Date(date);
			return sDate.getHours() + ":" + sDate.getMinutes();
		} else {
			return "";
		}
	},
	wbGetDateTime: function (date) {
		if (date) {
			date = Number(date);
			var sDate = new Date(date);
			var sTime = sDate.getDate() + "/" + (sDate.getMonth() + 1) + " " + sDate.getHours() + ":" + sDate.getMinutes();
			return sTime;
		}
	},
	wbGetMessagestatus: function (sMessageStatus) {
		if (sMessageStatus === "READ") {
			return "sap-icon://customfont/SeenStatus";
		} else if (sMessageStatus === "DELIVERED") {
			return "sap-icon://customfont/DeliveredStatus";
		} else {
			return "sap-icon://customfont/SentStatus";
		}

	},
	// wbGetformattedText: function (sValue, tagged, aMemberDetails) {
	// 	this.getParent().removeStyleClass("messageBoxSenderCss messageBoxReceiverCss");
	// 	var sFormattedValue, sTaggedString;
	// 	if (sValue.includes("@") && (tagged instanceof Array && tagged.length > 0 && tagged[0].tagged)) {
	// 		var sString = "";
	// 		for (var i = 0; i < sValue.length; i++) {
	// 			if (sValue[i] === "@") {
	// 				var iSpaceIndex = sValue.indexOf(" ", sValue.indexOf(" ", i) + 1);
	// 				if (iSpaceIndex !== -1) {
	// 					sTaggedString = sValue.substring(i, iSpaceIndex);
	// 				} else {
	// 					sTaggedString = sValue.substring(i);
	// 				}
	// 				sString = sString + "<strong style=\"color: var(--primary-color);\">" + sTaggedString + "</strong>";
	// 				i = iSpaceIndex === -1 ? sValue.length - 1 : iSpaceIndex - 1;
	// 			} else {
	// 				sString = sString + sValue[i];
	// 			}
	// 		}
	// 		sFormattedValue = sString;
	// 	} else {
	// 		sFormattedValue = sValue;
	// 	}
	// 	return sFormattedValue;
	// },
	wbGetformattedText: function (sValue, aTagged) {
		var tagged = $.extend(true, [], aTagged);
		tagged = tagged ? tagged : [];
		var sFormattedValue, sTaggedString;
		if (sValue) {
			this.getParent().removeStyleClass("messageBoxSenderCss messageBoxReceiverCss");
			if (tagged instanceof Array && tagged.length > 0) {
				if (sValue.includes("@") && (tagged instanceof Array && tagged[0].tagged)) {
					var sString = "";
					for (var i = 0; i < sValue.length; i++) {
						if (sValue[i] === "@") {
							var sTaggedName = "";
							var iTaggedNameLength = 0;
							if (tagged.length > 0) {
								for (var j = 0; j < tagged.length; j++) {
									sTaggedName = tagged[j].name;
									iTaggedNameLength = sTaggedName.length;
									if (sValue.substring(i + 1, i + iTaggedNameLength + 1) === sTaggedName) {
										sString = sString + "<strong style=\"color: var(--primary-color);\">" + "@" + sTaggedName + "</strong>";
										iTaggedNameLength = sTaggedName.length + 1;
										tagged.splice(j, 1);
										break;
									} else {
										if (sValue.indexOf("@", i + 1) !== -1) {
											sString = sString + sValue.substring(i, sValue.indexOf("@", i + 1));
											sTaggedName = sValue.substring(i, sValue.indexOf("@", i + 1));
										} else {
											sString = sString + sValue.substring(i);
											sTaggedName = sValue.substring(i);
										}

										iTaggedNameLength = sTaggedName.length;
									}

								}

							} else {
								sString = sString + sValue.substring(i);
								sTaggedName = sValue.substring(i);
								iTaggedNameLength = sTaggedName.length;
							}
							i = i + iTaggedNameLength - 1;
						} else {
							sString = sString + sValue[i];
						}
					}
					sFormattedValue = sString;
				} else {
					sFormattedValue = sValue;
				}
			} else {
				sFormattedValue = sValue;
			}
		} else {
			sFormattedValue = "";
		}
		return sFormattedValue;
	},
	wbGetMemberName: function (aMemberDetails) {
		var sMembersName = "";
		if (aMemberDetails && aMemberDetails.length > 2) {
			for (var i = 0; i < aMemberDetails.length; i++) {
				sMembersName += aMemberDetails[i].displayName + ",";
			}
			sMembersName = sMembersName.substr(0, sMembersName.length - 1);
		}
		return sMembersName;
	},
	wbGetValueOfQuickreplies: function (aButton, messageText) {
		var aFilter = aButton.filter(function (obj) {
			return (obj.title === messageText);
		});
		return aFilter[0].value;
	},
	wbGetTaskChatTitle: function (sTaskDescription) {
		if (sTaskDescription) {
			if (sTaskDescription.length > 50) {
				return sTaskDescription.substring(0, 47) + "...";
			} else {
				return sTaskDescription;
			}
		}
	},
	wbGetActionButtons: function (actionItems, sentBy, sUserId, comment) {
		if (comment) {
			if (actionItems instanceof Array && actionItems.length > 0) {
				if (sentBy === sUserId) {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	},
	wbGetPanelContent: function (sSelectedText, bGlobalSearch) {
		if ((sSelectedText === "directMessage" || sSelectedText === "groups" || sSelectedText === "pinned") && !bGlobalSearch) {
			return true;
		} else {
			return false;
		}
	},
	wbGetChannelContent: function (sSelectedText, bGlobalSearch) {
		if ((sSelectedText === "channelsTasks") && !bGlobalSearch) {
			return true;
		} else {
			return false;
		}
	},
	wbGetSelectedUserName: function (sSelectedUserName) {
		if (sSelectedUserName) {
			sSelectedUserName = (sSelectedUserName.length > 40) ? (sSelectedUserName.substring(0, 37) + "...") : sSelectedUserName;
			return sSelectedUserName;
		} else {
			return "";
		}
	},
	wbGetFooterButton: function (sSelectedText, bGlobalSearch) {
		if ((sSelectedText === "groups") && !bGlobalSearch) {
			return true;
		} else {
			return false;
		}
	},
	wbGetChatAvatarInitials: function (sPersonName, sGroupName) {
		var name = sPersonName ? sPersonName : sGroupName;
		var sInitials;
		if (name === "Chat Bot" || name === "ChatBot") {
			this.setSrc("images/ChatbotIcon.svg");
			return "";
		} else if (name) {
			name = name.trim();
			var aName = name.split(" ");
			if (sPersonName) {
				if (aName.length > 1) {
					sInitials = aName[0].substring(0, 1) + aName[aName.length - 1].substring(0, 1);
				} else {
					sInitials = aName[0].substring(0, 2);
				}
			} else {
				sInitials = aName[0].substring(0, 2);
			}
			return sInitials.toUpperCase();
		} else {
			return "";
		}
	},
	wbTLGetStatusIcon: function (sStatus) {
		if (sStatus === "include") {
			return "images/Eye.svg";
		} else {
			return "images/EyeOff.svg";
		}
	},
	wbGetSearchMessageHeading: function (sChatName, sPersonName) {
		if (sChatName) {
			return sChatName;
		} else {
			return sPersonName;
		}
	},
	wbGetSearchMessagComment: function (sSentBy, sSenderName, sUserId, sComment, sGlobalSearchTerm) {
		sComment = sComment ? sComment : "Sent an attachment";
		sSenderName = sSenderName ? sSenderName : "";
		if (sSenderName) {
			if (sSentBy === sUserId) {
				return "You : " + sComment;
			} else {
				return sSenderName.split(" ")[0] + " : " + sComment;
			}
		} else {
			return "";
		}
	},
	wbGetReplyToCss: function (isReply, sSentBy, sUserId) {
		this.removeStyleClass("replyToMessageSenderCss replyToMessageUserCss");
		if (sSentBy !== sUserId) {
			this.addStyleClass("wbChatSentMsgVbox");
			return isReply;
		} else {
			this.addStyleClass("wbChatRecdMsgVbox");
			return isReply;
		}
	},
	wbGetReplyToSenderName: function (sSenderName, sSentBy, sUserId) {
		if (sSentBy !== sUserId) {
			return sSenderName;
		} else {
			return "You";
		}
	},
	wbGetFormattedTextVisibility: function (aTagged) {
		var bIsTagged = (aTagged instanceof Array && aTagged.length > 0 && aTagged[0].tagged) ? true : false;
		return bIsTagged;
	},
	wbGetTextVisibility: function (aTagged) {
		var bIsTagged = (aTagged instanceof Array && aTagged.length > 0 && aTagged[0].tagged) ? false : true;
		return bIsTagged;
	},
	wbReplyForAttachment: function (attachmentDetails) {
		var sComment = "";
		if (attachmentDetails instanceof Array && attachmentDetails.length) {
			var sAttachmentName = attachmentDetails[0].fileName + "." + attachmentDetails[0].fileType.split("/")[1];
			if ((attachmentDetails).length < 2) {
				sComment = sAttachmentName;
			} else {
				var sLeftItems = attachmentDetails.length - 1;
				sComment = sAttachmentName + " and " + sLeftItems + " more";
			}
		}
		return sComment;
	},
	wbGetChatbotBtnVisibility: function (aChatbotBtn) {
		var aBtn = aChatbotBtn ? aChatbotBtn : [];
		if (aBtn.length > 0) {
			return true;
		} else {
			return false;
		}
	},

	/****************** Collaboartion Changes End -BY Karishma *********************/

	/*****************FORMATTERS NOT IN USE *********************/
	wbsetProcessMarginClass: function (selectedSubstitution) {
		if (selectedSubstitution !== "ImSubstituting") {
			this.addStyleClass("wbSubsitutionProcessBtn");
		} else {
			this.addStyleClass("wbSubsitutionProcessBtnIamsubstituting");
		}
	},
	wbChatSetSplitContainer: function (selectedScreen) {
		if (selectedScreen === "favorites") {
			return false;
		} else {
			return true;
		}
	},
	wbSetManageFilterScroll: function (contents) {
		var screenHeight;
		var deviceHeight = sap.ui.Device.resize.height;
		if (contents.length < 6) {
			screenHeight = (deviceHeight - 357) + "px";
		} else {
			screenHeight = "100%";
		}
		return screenHeight;
	},
	wbSelectListAddItem: function () {
		var that = this;
		var item = new sap.ui.core.Item({
			text: "Select Condition",
			key: "selectCondition",
			enabled: false
		});
		this.addItem(item);
		return true;
	},
	wbsetWidthSearchFilter: function (advancedFilter) {
		var width = ((100 - 10) / advancedFilter.length) + "%";
		return width;
	},
	wbSetCreateTaskHeight: function () {
		var screenHeight = sap.ui.Device.resize.height - 98 + "px";
		return screenHeight;
	},
	wbShowSubsText: function (name) {
		var bool = false;
		if (name === undefined) {
			bool = true;
			if (this.getParent().getAggregation("items")[1]) {
				this.getParent().getAggregation("items")[1].destroy();
			}
		}
		return bool;
	},
	wbSetDRStartEndDate: function (startDate, endDate) {
		startDate = new Date(startDate);
		var oSDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
		this.setDateValue(oSDate);

		endDate = new Date(endDate);
		var oEDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
		this.setSecondDateValue(oEDate);
		return true;
	},
	wbSetNotificationEventsCommaSeparate: function (eventName, list) {
		if (list.length > 0) {
			if (eventName) {
				var path = this.getBindingContext("oUserSettingsModel").getPath();
				var rowIndex = parseInt(path.split("/")[path.split("/").length - 1], 10);
				var sPath = path.split("/");
				sPath.splice(sPath.length - 1, 1);
				sPath = sPath.join("/");
				if (this.getBindingContext("oUserSettingsModel").getProperty(sPath).length - 1 !== rowIndex) {
					eventName = eventName + ",";
				}
			}
		} else {
			eventName = "No events configured";
		}
		return eventName;
	},
	wbShowDownloadImage: function (value, attachmentType) {
		var source;
		if (value) {
			if (attachmentType === "application/pdf") {
				source = "images/AttachmentPDF.png";
			} else if (attachmentType === "application/jpg" || attachmentType === "application/png" || attachmentType ===
				"application/jpeg") {
				source = "images/AttachmentPNG.png";
			} else if (attachmentType === "application/xlsx" || attachmentType === "application/xls" || attachmentType === "application/ods" ||
				attachmentType === "application/csv") {
				source = "images/AttachmentExcel.png";
			} else if (attachmentType === "application/docx") {
				source = "images/AttachmentDOC.png";
			} else if (attachmentType === "application/ppt" || attachmentType === "application/pptx") {
				source = "images/AttachmentPPT.png";
			} else {
				source = "images/AttachmentZIP.png";
			}
		} else {
			source = null;
		}
		return source;
	},
	wbShowAttachmentImageType: function (value) {
		var source;
		var attachmentType = value[1].attributeValue;
		if (attachmentType === "application/pdf") {
			source = "images/AttachmentPDF.png";
		} else if (attachmentType === "application/jpg" || attachmentType === "application/png" || attachmentType ===
			"application/jpeg") {
			source = "images/AttachmentPNG.png";
		} else if (attachmentType === "application/xlsx" || attachmentType === "application/xls") {
			source = "images/AttachmentExcel.png";
		} else if (attachmentType === "application/ods") {
			source = "images/AttachmentXLS.png";
		} else if (attachmentType === "application/docx") {
			source = "images/AttachmentDOC.png";
		} else if (attachmentType === "application/ppt" || attachmentType === "application/pptx") {
			source = "images/AttachmentPPT.png";
		} else {
			source = "images/AttachmentZIP.png";
		}
		return source;
	},
	wbGetTheWorkLoadColor: function (oValue) {
		var oParent = this.getParent().getParent();
		oParent.removeStyleClass("wbHighWorkLoadUserBoxStyle");
		oParent.removeStyleClass("wbNormalWorkLoadUserBoxStyle");
		oParent.removeStyleClass("wbLowWorkLoadUserBoxStyle");
		var oUserWorkLoadData = this.getModel("oUserWorkLoadData");
		var lowWorkLoadCount = oUserWorkLoadData.getProperty("/lowWorkLoadCount");
		var normalWorkLoadCount = oUserWorkLoadData.getProperty("normalWorkLoadCount");
		var highWorkLoadCount = oUserWorkLoadData.getProperty("highWorkLoadCount");
		var totalWorkLoadCount = oUserWorkLoadData.getProperty("/totalWorkLoadCount");
		if (oValue && parseInt(oValue, 10) >= oUserWorkLoadData.lowLoadLowLimit && parseInt(oValue, 10) <= oUserWorkLoadData.lowLoadHighLimit) {
			lowWorkLoadCount = lowWorkLoadCount + 1;
			oParent.addStyleClass("wbLowWorkLoadUserBoxStyle");
		} else if (oValue && parseInt(oValue, 10) >= oUserWorkLoadData.normalLoadLowLimit && parseInt(oValue, 10) <=
			oUserWorkLoadData.normalLoadHighLimit) {
			normalWorkLoadCount = normalWorkLoadCount + 1;
			oParent.addStyleClass("wbNormalWorkLoadUserBoxStyle");
		} else if (oValue && parseInt(oValue, 10) >= oUserWorkLoadData.highLoadLowLimit) {
			highWorkLoadCount = highWorkLoadCount + 1;
			oParent.addStyleClass("wbHighWorkLoadUserBoxStyle");
		}
		totalWorkLoadCount = highWorkLoadCount + normalWorkLoadCount + lowWorkLoadCount;
		return oValue;
	},
	fnShowTime: function (time) {
		if (time) {
			var createdTime = time.split(" ");
			var displyTime = createdTime[1] + " " + createdTime[2];
		}
		return displyTime;
	},
	//function to set the scroll height
	wbInboxScrollHeight: function (pageVisible) {
		var customHeight = "85%";
		if (!pageVisible) {
			customHeight = "92%";
		}
		return customHeight;
	},
	wbFormatTime: function (createdAt) {
		if (createdAt) {
			var sTime = createdAt.split(" ")[1] + " " + createdAt.split(" ")[2];
			return sTime;
		} else {
			return "";
		}
	},
	//setting the property of initial in avatar in user work load
	wbWorkLoadAvatarInitials: function (userName) {
		var initials;
		if (userName === null) {
			return "";
		} else {
			var SplitInitials = userName.split(" ");
			if (SplitInitials[1]) {
				initials = SplitInitials[0].charAt() + SplitInitials[1].charAt();
			} else {
				initials = SplitInitials[0].charAt();
			}
			return initials;
		}
	},
	wbFormatDate: function (createdAt) {
		if (createdAt) {
			var sDate = createdAt.split(" ")[0];
			sDate = sDate.replace(/-/g, " ");
			return sDate;
		} else {
			return "";
		}
	},
	wbEmailCustomAttributeProcessScrollHeight: function (currentViewPage) {
		var customWidth = sap.ui.Device.resize.width - 1246.4 + "px";
		return customWidth;
	},
	// setting the values in multicombobox - create instance value in value property
	wbEmailValuesCreateInstance: function (value) { //	wbReturnSelectedKeys
		// var regExp = /\{([^}]+)\}/;
		// var tempData = regExp.exec(value);
		// if (value && value.length>1) {
		// 	return value.split(",");
		// } 
		// else{
		// 	return value;
		// }
		return value;

	},
	wbReceiverChatVisiblity: function (sentBy, loggedInUserId) {
		if (sentBy !== loggedInUserId) {
			return true;
		} else {
			return false;
		}
	},
	wbSentChatVisiblity: function (sentBy, loggedInUserId) {
		if (sentBy === loggedInUserId) {
			return true;
		} else {
			return false;
		}
	},
	wbActionPopupTextColor: function (action) {
		var text;
		if (action === "Approve") {
			text = this.getModel("i18n").getResourceBundle().getText("APPROVING_TASK_TEXT") + " :";
		} else if (action === "Reject") {
			text = this.getModel("i18n").getResourceBundle().getText("REJECTING_TASK_TEXT") + " :";
		} else if (action === "Resolve") {
			text = this.getModel("i18n").getResourceBundle().getText("RESOLVING_TASKS_TEXT") + " :";
		} else if (action === "Done") {
			text = this.getModel("i18n").getResourceBundle().getText("DONE_ACTION_TEXT") + " :";
		} else if (action === "Complete") {
			text = this.getModel("i18n").getResourceBundle().getText("COMPLETE_ACTION_TEXT") + " :";
		}

		return text;
	},

};
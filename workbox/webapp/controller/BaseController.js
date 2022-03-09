sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "oneapp/incture/workbox/util/formatter",
    "oneapp/incture/workbox/util/taskManagement",
    "oneapp/incture/workbox/util/workbox",
    "oneapp/incture/workbox/util/utility",
    "sap/ui/core/routing/History",
    "sap/m/Dialog",
    "sap/m/Label",
    "sap/m/TextArea",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/Device",
    "sap/m/MessageToast",
], function (Controller, formatter, taskManagement, workbox, utility, History, Dialog, Label, TextArea, Button, Text, Device,
    MessageToast) {
    "use strict";

    return Controller.extend("oneapp.incture.workbox.controller.BaseController", {
        formatter: formatter,
        utility: utility,

        onInit: function () {

        }(),
		/**
		 * Convenience method for setting the global JSON Model to variable.
		 * @public
		 */

        fnInitApp: function () {
            this.busy = new sap.m.BusyDialog();
            var oAppModel = this.getOwner().getModel("oAppModel");
            this.oAppModel = oAppModel;
            this.setDefaultData();
           // this.fnLoadUser();
        },
        fnLoadUser: function () {
            var that = this;
            var sUrl = "/oneappinctureworkbox/plcm_portal_services/loggedinUser";
            $.ajax({
                url: sUrl,
                type: 'GET',
                dataType: 'json',
                success: function (data) {
                    that.getView().getModel("oConfigMdl").setProperty("/usrData", data);
                    that.getView().getModel("oConfigMdl").refresh();

                    var aUsrData = this.getView().getModel("oConfigMdl").getData().usrData;
                    this.getView().getModel("oConfigMdl").getData().claimVisible = false;
                    this.getView().getModel("oConfigMdl").getData().ListMode = "None";
                    if (aUsrData) {
                        var aADGroups = JSON.parse(aUsrData.adGroups);
                        if (aADGroups) {
                            for (var i = 0; i < aADGroups.length; i++) {
                                if (aADGroups[i] == "IAM_P_SCP_PLC_ADMIN" || aADGroups[i] == "IAM_S_SCP_SUP_PORTAL_APPROVER") {
                                    this.getView().getModel("oConfigMdl").getData().claimVisible = true;
                                   // this.getView().getModel("oConfigMdl").getData().ListMode = "SingleSelectLeft";
                                   this.getView().getModel("oConfigMdl").getData().ListMode = "SingleSelectLeft";
                                    break;
                                }
                            }
                        }
                    }
                    this.getView().getModel("oConfigMdl").refresh();


                },
                async: false,
                error: function (data) {

                }
            });
        },
		/**
		 * Convenience method for setting the initial data
		 * @public
		 */

        setDefaultData: function () {
            this.oAppModel.setData({
                sideExpanded: false,
                requestSent: false,
                idleTimeLocal: 0,
                dialogDisplay: false,
                WB_CARD_VIEW: true,
                WB_TABLE_VIEW: false,
                WB_CALENDAR_VIEW: false,
                WB_TASK_BOARD_VIEW: false,
                advFilterTokens: [],
                navDetails: {
                    "currentViewKey": "inbox"
                },
                selectedFreeFilter: "",
                sortingDto: [],
                freeFilter: "",
                filterTokens: [],
                viewAppliedContext: "",
                previewImage: false,
                pagination: {
                    pageVisible: false
                },
                transitionWait: false,
                isAppViewVisible: false
            });
            this.getLoggedInUserDetails();
            this.getBarrerTokenFn();
        },

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

		/**
		 * Convenience method for accessing the owner component in every controller of the application.
		 * @public
		 * @returns the component
		 */
        getOwner: function () {
            return this.getOwnerComponent();
        },

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

		/**
		 * Creates the fragment from the fragment name provided to the delegate and assigns a generated id.
		 * @param {String} sFragmentID The Fragment ID
		 * @param {String} sFragmentName The Fragment Name
		 * @returns {Object} Fragment Object.
		 * @private
		 */
        _createFragment: function (sFragmentID, sFragmentName) {
            jQuery.sap.assert(sFragmentName, "Trying to instantiate fragment but fragmentName is not provided.");
            var oFragment = sap.ui.xmlfragment(sFragmentID, sFragmentName, this);
            return oFragment;
        },

		/**
		 *
		 * @constructor
		 * @param sMsg
		 */
        _showToastMessage: function (sMsg) {
            MessageToast.show(sMsg, {
                duration: 4000,
                width: "20em",
                my: "center center",
                at: "center center",
                of: window,
                offset: "0 0",
                collision: "fit fit",
                onClose: null,
                autoClose: true,
                animationTimingFunction: "ease",
                animationDuration: 1000,
                closeOnBrowserNavigation: true
            });
        },

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

		/**
		 * Convenience method for navigating across views.
		 * @public
		 * @returns null
		 */
        _doNavigate: function (sRouteName, oParams, vcond) {
            this.oAppModel.setProperty("/transitionWait", true);
            var router = sap.ui.core.UIComponent.getRouterFor(this);
            if (sRouteName == "UnifiedInbox") {
                vcond = true;
            } else {
                vcond = false;
            }
            router.navTo(sRouteName, oParams, vcond);
        },
		/**
		 * Event handler  for navigating back.
		 * It checks if there is a history entry. If yes, history.go(-1) will happen.
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // The history contains a previous entry
                history.go(-1);
            } else {
                // Otherwise we go backwards with a forward history
                var bReplace = true;
                this.getRouter().navTo("", {}, bReplace);
            }
        },
		/**
		 * Event handler  for doing an HTTP request (Non Odata).
		 * @public
		 * @params
		 * sUrl - api URL - {string}
		 * sMethod  - the method -GET or POST or PUT or DELETE (PUT,DELETE -be careful about browser compatibility) -{string}
		 * oData - null if method is GET or the Request Body -{object}
		 * rSuccess - Success callback {function}
		 * rErrror - Error callback {function}
		 * @returns {object} the response data receieved through callback
		 */
        doAjax: function (sUrl, sMethod, oData, rSuccess, rError, oHeaders) {
            var that = this;
            var headers = {
                "Content-Type": "application/json;charset=utf-8"
            };
            if (oData) {
                oData = JSON.stringify(oData);
            }
            if (oHeaders) {
                if (oHeaders["Content-Type"]) {
                    headers = oHeaders;
                } else {
                    Object.assign(headers, oHeaders);
                }
            }
            this.oAppModel.setProperty("/requestSent", true);
            this.oAppModel.setProperty("/idleTimeLocal", 0);
            var tempJsonModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(tempJsonModel, "tempJsonModel");
            tempJsonModel.loadData(sUrl, oData, true, sMethod, false, false, headers);
            tempJsonModel.attachRequestCompleted(function (oEvent) {
                that.oAppModel.setProperty("/requestSent", false);
                rSuccess(oEvent.getSource().getData());
            }.bind(rSuccess));
            tempJsonModel.attachRequestFailed(function (oEvent) {
                that.oAppModel.setProperty("/requestSent", false);
                rError(oEvent);
            }.bind(rError));
        },

		/**
		 * Method to create a dialog of different states.
		 * @public
		 * @params
		 * confirmTitle  {string}
		 * confirmMsg  -{string}
		 * sState -  state of the dialog --Error,Success..etc {string}
		 * confirmYesBtn -  {string}
		 * confirmNoBtn - {string}
		 * actionButtonVisible  decides whethr the begin button should be visible or not {boolian}
		 * closehandler - callback for begin button press -{function}
		 * @returns {object} the response data receieved through callback
		 */
        _createConfirmationMessage: function (confirmTitle, confirmMsg, sState, confirmYesBtn, confirmNoBtn, actionButtonVisible,
            closehandler, closebtnhandler) {
            var dialogDisplay = this.oAppModel.getProperty("/dialogDisplay");
            if (!dialogDisplay) {
                this.closehandler = closehandler;
                this.closebtnhandler = closebtnhandler;
                this.oAppModel.setProperty("/dialogDisplay", true);
                this.oConfirmDialog = new Dialog({
                    title: confirmTitle,
                    type: 'Message',
                    state: sState,
                    content: new Text({
                        text: confirmMsg
                    }),
                    beginButton: new Button({
                        text: confirmYesBtn,
                        type: "Transparent",
                        visible: actionButtonVisible,
                        press: function () {
                            if (closehandler !== null) {
                                this.closehandler();
                            }
                            this.oAppModel.setProperty("/dialogDisplay", false);
                            this.oConfirmDialog.close();
                        }.bind(this)
                    }).addStyleClass("wbTransparentButtonStyleClass"),
                    endButton: new Button({
                        type: "Emphasized",
                        text: confirmNoBtn,
                        press: function () {
                            if (closebtnhandler) {
                                this.closebtnhandler();
                            }
                            this.oAppModel.setProperty("/dialogDisplay", false);
                            this.oConfirmDialog.close();
                        }.bind(this)
                    }).addStyleClass("wbEmphasizedButtonStyleClass"),
                    afterClose: function () {
                        this.oConfirmDialog.destroy();
                        this.oConfirmDialog = undefined;
                    }.bind(this)
                }).addStyleClass("sapUiSizeCompact", "wbDialog");
                this.oConfirmDialog.setEscapeHandler(function (oEvent) {
                    oEvent.reject();
                });
                this.oConfirmDialog.open();
            }
        },

        // function to call the side nav items according to the view
        onSelectView: function (oEvent) {
            var oAppModel = this.oAppModel;
            var that = this;
            var oSelectedView;
            var oNavList = that.getView().byId("WB_SIDENAV_LIST");
            if (oEvent) {
                oSelectedView = oEvent.getSource().getBindingContext("oAppModel").getObject().inboxId;
            } else {
                oSelectedView = oAppModel.getProperty("/currentView");
            }

            if (oSelectedView === "unifiedInbox") {
                oAppModel.setProperty("/bGlobalSearchSuggestion", false); //Collaboration Change - By Karishma
                oAppModel.setProperty("/functionality/expanded", true);
                oAppModel.setProperty("/functionality/direction", "Row");
                oAppModel.setProperty("/functionality/visibility", true);
                oNavList.setSelectedKey("MyInbox");
                this.setCurrentPage("MyInbox", "MyInbox", "My Task", true, false);
                oAppModel.setProperty("/isViewApplied", false);
                oAppModel.setProperty("/graphClicked", false);
                if (oEvent) {
                    this.removeAllTokens(true);
                    if (oAppModel.getProperty("/currentView") === "unifiedInbox") {
                        sap.ui.core.UIComponent.getRouterFor(
                            that).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().onClickFilterDetail();
                    }
                }
                this._doNavigate("UnifiedInbox");
            } else if (oSelectedView === "userWorkload") {
                this._doNavigate("UserWorkLoad");
            } else if (oSelectedView === "adminConsole") {
                this._doNavigate("AdminConsole");
            } else if (oSelectedView === "taskBoard") {
                this._doNavigate("Chat");
            } else if (oSelectedView === "dashBoard") {
                this._doNavigate("Dashboard");
            }
            if (oEvent && oAppModel.getProperty("/currentView") === oSelectedView) {
                oAppModel.setProperty("/transitionWait", false);
            }
            oAppModel.setProperty("/currentView", oSelectedView);

        },

        //set navigation list details
        setNavigationDetailsFn: function () {
            var that = this;
            var oAppModel = this.oAppModel;
            var oSelectedView = oAppModel.getProperty("/currentView");
            oAppModel.setProperty("/currentView", oSelectedView);
            var i18n = this.getView().getModel("i18n").getResourceBundle();
            var data;
            var oNavList = this.getModel("oAdvanceFilterModel").getProperty("/appController").getView().byId("WB_SIDENAV_LIST");
            if (oSelectedView === "unifiedInbox") {
                oAppModel.setProperty("/bGlobalSearchSuggestion", false); //Collaboration Change - By Karishma
                oAppModel.setProperty("/functionality/expanded", true);
                oAppModel.setProperty("/functionality/direction", "Row");
                oAppModel.setProperty("/functionality/visibility", true);
                this.setCurrentPage("MyInbox", "MyInbox", "My Task", true, false);
                oNavList.setSelectedKey("MyInbox");
                oAppModel.setProperty("/isViewApplied", false);
                oAppModel.setProperty("/graphClicked", false);
                this.removeAllTokens(true);
                if (oAppModel.getProperty("/currentView") === "unifiedInbox") {
                    sap.ui.core.UIComponent.getRouterFor(
                        that).getView("oneapp.incture.workbox.view.UnifiedInbox").getController().onClickFilterDetail();
                }
            } else if (oSelectedView === "userWorkload") {
                oAppModel.setProperty("/functionality/expanded", true);
                oAppModel.setProperty("/functionality/direction", "Row");
                oAppModel.setProperty("/functionality/visibility", true);
                oNavList.setSelectedKey("userWorkLoad");
                oAppModel.setProperty("/currentViewPage", "userWorkLoad");
                data = [{
                    "name": i18n.getText("USER_WORKLOAD_TEXT"),
                    "count": "",
                    "dtoList": [{
                        "name": i18n.getText("WORKLOAD_TEXT"),
                        "inboxId": "userWorkLoad",
                        "icon": "sap-icon://my-view"
                        /*"count": 11*/
                    }]
                }];
                oAppModel.setProperty("/navigationItems/navigationDto", data);
            } else if (oSelectedView === "adminConsole") {
                oAppModel.setProperty("/functionality/expanded", true);
                oAppModel.setProperty("/functionality/direction", "Row");
                oAppModel.setProperty("/functionality/visibility", true);
                oAppModel.setProperty("/currentViewPage", "tableConfiguration");
                oNavList.setSelectedKey("tableConfiguration");
                oAppModel.setProperty("/currentViewDisplayText", "Table Configuration");
                data = [{
                    "name": i18n.getText("TABLE_CONFIG_TEXT"),
                    "inboxId": "tableConfiguration"
                }, {
                    "name": i18n.getText("GRAPH_CONFIGURATION_TEXT"),
                    "inboxId": "graphConfiguration"
                }, {
                    //i18n.getText("MANAGE_DASHBOARD_TILES")
                    "name": "Manage Tiles",
                    "inboxId": "manageDashboardTiles"
                }, {
                    //i18n.getText("VERSION_CONTROL_TEXT")
                    "name": i18n.getText("VERSION_CONTROL_TEXT"),
                    "inboxId": "versionControl"
                }, {
                    "name": i18n.getText("WORKLOAD_TEXT"),
                    "inboxId": "workLoad"
                },
                /*{
                    "name": i18n.getText("CFA_APPROVER_MATRIX_TEXT"),
                    "inboxId": "cfaApproverMatrix"
                },*/
                {
                    "name": i18n.getText("ADVANCED_WORKFLOW_TEXT"),
                    "inboxId": "advancedWorkFlow",
                    "dtoList": [{
                        "name": i18n.getText("CREATE_WORKFLOW_TEXT"),
                        "inboxId": "createAdvancedWorkFlow"
                    }, {
                        "inboxId": "manageWorkFlow",
                        "name": i18n.getText("MANAGE_WORKFLOW_TEXT")
                    }]
                }, {
                    "name": i18n.getText("WORKFLOW_TEXT"),
                    "inboxId": "workFlow",
                    "dtoList": [{
                        "name": i18n.getText("CREATE_WORKFLOW_TEXT"),
                        "inboxId": "createWorkFlow"
                    }, {
                        "inboxId": "manageWorkFlow",
                        "name": i18n.getText("MANAGE_WORKFLOW_TEXT")
                    }, {
                        "inboxId": "manageIndividualBudget",
                        "name": i18n.getText("MANAGE_INDIVIDUAL_BUDGET")
                    }]
                }, {
                    "name": i18n.getText("MANAGE_GROUPS_TEXT"),
                    "inboxId": "manageGroups"
                }, {
                    "name": i18n.getText("WORKBENCH_SETUP_TEXT"),
                    "inboxId": "uiGenerator",
                    "dtoList": [{
                        "name": i18n.getText("TASK_UI_GEN_TEXT"),
                        "inboxId": "taskuiGenerator"
                    }, {
                        "inboxId": "taskCreation",
                        "name": i18n.getText("TASK_CREATION_TEXT")
                    }, {
                        "name": i18n.getText("CONNECTOR_CONFIGURATION_TEXT"),
                        "inboxId": "taskDetailConfiguration"
                    }]
                }, {
                    "name": i18n.getText("AUDIT_LOGS_TEXT"),
                    "inboxId": "auditLogs",
                }, {
                    "name": i18n.getText("EMAIL_TEMPLATE_TEXT"),
                    "inboxId": "emailTemplate",
                }, {
                    "name": i18n.getText("MANAGE_SUBSTITUTIONS_TEXT"),
                    "inboxId": "manageSubstitution",
                }, {
                    "name": i18n.getText("NOTIFICATION_ADMIN_TEXT"),
                    "inboxId": "manageNotifiifcationSetting",
                }
                ];
                oAppModel.setProperty("/navigationItems/navigationDto", data);
            } else if (oSelectedView === "taskBoard") {
                var oCollaborationModel = this.getModel("oCollaborationModel"); //Collaboration Change-by karishma
                oAppModel.setProperty("/bGlobalSearchSuggestion", true); //Collaboration Change-by karishma
                oCollaborationModel.setProperty("/bGlobalSearch", false); //Collaboration Change-by karishma
                oAppModel.setProperty("/currentViewPage", "chat");
                oNavList.setSelectedKey("directMessage");
                data = [{
                    "name": i18n.getText("COLLABORATION_TEXT"),
                    "dtoList": [{
                        "name": i18n.getText("DIRECT_MESSAGE_TEXT"),
                        "inboxId": "directMessage",
                        "icon": "images/ChatDirect.svg"
                    }, {
                        "name": i18n.getText("CHANNELS_TASKS_TEXT"),
                        "inboxId": "channelsTasks",
                        "icon": "images/ChatChannelsTasks.svg"
                    }, {
                        "name": i18n.getText("GROUPS_TEXT"),
                        "inboxId": "groups",
                        "icon": "images/ChatGroups.svg"
                    }, {
                        "name": i18n.getText("CHATBOT_TEXT"),
                        "inboxId": "chatBot",
                        "icon": "images/ChatbotIcon.svg"
                    }, {
                        "name": i18n.getText("FAVOURITES_TEXT"),
                        "inboxId": "favorites",
                        "icon": "sap-icon://favorite"
                    }, {
                        "name": i18n.getText("PINNED_TEXT"),
                        "inboxId": "pinned",
                        "icon": "sap-icon://pushpin-off"
                    }]
                }];
                oAppModel.setProperty("/navigationItems/navigationDto", data);
            } else if (oSelectedView === "dashBoard") {
                oAppModel.setProperty("/functionality/expanded", false);
                oAppModel.setProperty("/functionality/direction", "Column");
                oAppModel.setProperty("/functionality/visibility", false);
                data = [];
                oAppModel.setProperty("/currentViewDisplayText", "Dashboard");
                oAppModel.setProperty("/navigationItems/navigationDto", data);
            }
            oAppModel.refresh(true);
        },

        // Set user details to oAppModel
        getLoggedInUserDetails: function () {
            var oAppModel = this.oAppModel;
            var sUrl = "/oneappinctureworkbox/WorkboxJavaService/idpMapping/getUsersDetails";
            this.doAjax(sUrl, "GET", null, function (oData) {
                oAppModel.setProperty("/loggedInUserDetails", oData.userIDPMappingDto);
                oAppModel.setProperty("/loggedInUserId", oData.userIDPMappingDto.userId);
                oAppModel.setProperty("/loginUserName", oData.userIDPMappingDto.userLoginName);
                oAppModel.setProperty("/loggedInUserName", oData.userIDPMappingDto.userFirstName + " " + oData.userIDPMappingDto.userLastName);
                var setLanguage = oData.userIDPMappingDto.language;
                if (setLanguage === "null") {
                    setLanguage = "en";
                }
                oAppModel.setProperty("/selectedLanguage", setLanguage);
                oAppModel.setProperty("/currentLanguage", setLanguage);
                sap.ui.getCore().getConfiguration().setLanguage(setLanguage);
                oAppModel.setProperty("/selectedLangKey", setLanguage);
                this.selectedLangText(setLanguage);
                if (oData.userIDPMappingDto.userRole === "Admin") {
                    oAppModel.setProperty("/isAdmin", true);
                } else {
                    oAppModel.setProperty("/isAdmin", false);
                }
                // this.chatWebSocket();
                this.notificationWebSocket();
                this.collaboratioWebSocket(oData.userIDPMappingDto.userId); // Collaboration Change - By Karishma
                this.setUserSettings();
            }.bind(this), function (oError) { }.bind(this));
        },
        // Set inbox panel
        setInboxPanel: function () {
            this.doAjax("/oneappinctureworkbox/WorkboxJavaService/inbox/inboxPanel", "GET", null, function (oData) {
                this.oAppModel.setProperty("/navigationItems/navigationDto", oData.inboxTypeDtos);
                var list = [{
                    count: null,
                    dtoList: null,
                    icon: null,
                    inboxId: "AllTask",
                    name: "All Task",
                    parentId: null,
                    type: null,
                    viewPayload: null
                }, {
                    count: null,
                    dtoList: null,
                    icon: null,
                    inboxId: "PinnedTasks",
                    name: "Pinned Tasks",
                    parentId: null,
                    type: null,
                    viewPayload: null
                }, {
                    count: null,
                    dtoList: null,
                    icon: null,
                    inboxId: "Chat",
                    name: "Chat",
                    parentId: null,
                    type: null,
                    viewPayload: null
                },
                    // {
                    // count: null,
                    // dtoList: null,
                    // icon: null,
                    // inboxId: "AdminInbox",
                    // name: "Admin Task",
                    // parentId: null,
                    // type: null,
                    // viewPayload: null
                    // }
                ];
                for (var i = 0; i < oData.inboxTypeDtos.length; i++) {
                    var inboxType = oData.inboxTypeDtos[i];
                    if (inboxType.inboxId === "AllTask") {
                        list = list.concat(inboxType.dtoList);
                    } else if (inboxType.inboxId === "Views") { } else {
                        if (inboxType.inboxId === "Groups") {
                            list = list.concat(inboxType.dtoList);
                        } else {
                            list = list.concat(inboxType);
                        }
                    }
                }
                this.oAppModel.setProperty("/searchInboxDto", list);
            }.bind(this), function (oError) { }.bind(this));
        },
        setSettingsDto: function () {
            var i18n = this.getView().getModel("i18n").getResourceBundle();
            var themes = [{
                "imgSrc": "images/CosmicCobaltTheme.png",
                "label": i18n.getText("THEME_COSMIC_COBALT_LABEL"),
                "rootColor": "47, 44, 133"
            }, {
                "imgSrc": "images/InctureBlueTheme.png",
                "label": i18n.getText("THEME_INCTURE_BLUE_LABEL"),
                "rootColor": "0, 135, 220"
            }, {
                "imgSrc": "images/ScienceBlueTheme.png",
                "label": i18n.getText("THEME_SCIENCE_BLUE_LABEL"),
                "rootColor": "0, 91, 217"
            }, {
                "imgSrc": "images/DragonRedTheme.png",
                "label": i18n.getText("THEME_DRAGON_RED"),
                "rootColor": "198, 2, 60"
            }, {
                "imgSrc": "images/CherryRedTheme.png",
                "label": i18n.getText("THEME_CHERRY_RED"),
                "rootColor": "233, 0, 0"
            }];
            var navigationList = [{
                "key": "SETTINGS_GENERAL",
                "text": i18n.getText("GENERAL_TEXT"),
                "icon": "sap-icon://action-settings",
                "list": [],
                "visible": true,
                "isActive": "Active"
            }, {
                "key": "SETTINGS_PRIVACY",
                "text": i18n.getText("PRIVACY_TEXT"),
                "icon": "sap-icon://locked",
                "list": [],
                "visible": false,
                "isActive": "Active"

            }, {
                "key": "SETTINGS_SUBSTITUTION",
                "text": i18n.getText("SUBSTITUTION_TEXT"),
                "icon": "sap-icon://group",
                "list": [],
                "visible": this.oAppModel.getProperty("/isAdmin"),
                "isActive": "Active"
            }, {
                "key": "SETTINGS_MYSUBS",
                "text": i18n.getText("SUBSTITUTION_TEXT"),
                "icon": "sap-icon://group",
                "visible": !this.oAppModel.getProperty("/isAdmin"),
                "isActive": "Active"

            }, {
                "key": "SETTINGS_NOTIFICATIONS",
                "text": i18n.getText("NOTIFICATIONS_TEXT"),
                "icon": "sap-icon://bell",
                "list": [],
                "visible": true,
                "isActive": "Active"
            }, {
                "key": "SETTINGS_VERSIONCONTROL",
                "text": i18n.getText("VERSION_TEXT"),
                "icon": "sap-icon://bbyd-active-sales",
                "list": [],
                "visible": true,
                "isActive": "Active"

            },];
            var oUserSettingsModel = this.getModel("oUserSettingsModel");
            oUserSettingsModel.setProperty("/settings/themeSettings/themes", themes);
            oUserSettingsModel.setProperty("/settings/settingsNavigationList", navigationList);
        },
        // Set theme and initialise settings
        setUserSettings: function () {
            var oUserSettingsModel = new sap.ui.model.json.JSONModel();
            this.setModel(oUserSettingsModel, "oUserSettingsModel");
            var i18n = this.getView().getModel("i18n").getResourceBundle();
            var settings = {
                "selectedVersionTab": "versionHistory",
                "selectedSetting": "SETTINGS_GENERAL",
                "themeSettings": {
                    "themes": []
                },
                "busy": false,
                "substitutionSettings": {
                    "addRow": true
                },
                "settingsNavigationList": [],
                "notification": {
                    "notificationClicked": false,
                    "dropdownLists": {},
                    "newEventAdded": false
                },
                "settingsChanged": false,
                "enableAttachmentInVC": false
            };

            oUserSettingsModel.setProperty("/settings", settings);
            this.setSettingsDto();
            var languages = [{
                "key": "ar",
                "name": i18n.getText("ARABIC_TEXT")
            }, {
                "key": "en",
                "name": i18n.getText("ENGLISH_TEXT")
            }, {
                "key": "in",
                "name": i18n.getText("INDONESIAN_TEXT")
            }, {
                "key": "zh",
                "name": i18n.getText("CHINESE_TEXT")
            }];
            var flag = true;
            var themes = oUserSettingsModel.getProperty("/settings/themeSettings/themes");
            if (this.oAppModel.getProperty("/loggedInUserDetails/theme")) {
                for (var i = 0; i < themes.length; i++) {
                    if (themes[i].rootColor === this.oAppModel.getProperty("/loggedInUserDetails/theme") || themes[i].label === this.oAppModel.getProperty(
                        "/loggedInUserDetails/theme")) {
                        flag = false;
                        document.documentElement.style.setProperty("--root-color", themes[i].rootColor);
                        oUserSettingsModel.setProperty("/settings/themeSettings/savedTheme", jQuery.extend(true, {}, themes[i]));
                        oUserSettingsModel.setProperty("/settings/themeSettings/selectedTheme", jQuery.extend(true, {}, themes[i]));
                        break;
                    }
                }
            }
            if (flag) //Unmatched theme found set the user theme
            {
                document.documentElement.style.setProperty("--root-color", themes[0].rootColor);
                oUserSettingsModel.setProperty("/settings/themeSettings/savedTheme", jQuery.extend(true, {}, themes[0]));
                oUserSettingsModel.setProperty("/settings/themeSettings/selectedTheme", jQuery.extend(true, {}, themes[0]));
            }
            // Language settings.
            var currentLang = this.oAppModel.getProperty("/loggedInUserDetails/language");
            if (currentLang !== "null") {
                for (var j = 0; j < languages.length; j++) {
                    if (languages[j].key === currentLang) {
                        this.oAppModel.setProperty("/selectedLanguage", currentLang);
                        sap.ui.getCore().getConfiguration().setLanguage(currentLang);
                    }
                }
            } else {
                sap.ui.getCore().getConfiguration().setLanguage("en");
                this.oAppModel.setProperty("/selectedLanguage", "en");
            }
            $("#splash-screen").remove();
            this.oAppModel.setProperty("/isAppViewVisible", true);
        },
        getStandardSettings: function () {
            var url = "/oneappinctureworkbox/WorkboxJavaService/notificationConfiguration/getAllSettingDetails"
            this.doAjax(url, "GET", null, function (oData) {
                var oUserSettingsModel = this.getModel("oUserSettingsModel");
                oUserSettingsModel.setProperty("/standardSettings", oData);
                this.updateNotification();
            }.bind(this), function (oError) { }.bind(this));
        },
        //  Initialising chat web socket connection
        notificationWebSocket: function () {
            var that = this;
            var userId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
            var url = "wss://testbotkbniwmq1aj.hana.ondemand.com/workbox-product/websocketNotification/" + userId; //DEV URL
            // var url = "wss://workboxweba8b98c03e.hana.ondemand.com/workbox-product/websocketNotification/" + userId; //QA URL
            this.notifSocket = new WebSocket(url);
            this.notifSocket.onopen = function (event) {
                this.getStandardSettings();
            }.bind(this);
            this.notifSocket.onmessage = function (Event) {
                var oData = JSON.parse(Event.data);
                var oUserSettingsModel = that.getModel("oUserSettingsModel");
                var notificationList = oUserSettingsModel.getProperty("/settings/notification/notificationList");
                if (oData.notifications !== undefined && oData.notifications.length > 0) {
                    notificationList = notificationList.concat(oData.notifications);
                    oUserSettingsModel.setProperty("/settings/notification/notificationList", notificationList);
                    oUserSettingsModel.setProperty("/settings/notification/count", notificationList.length);
                    this.triggerNotification(oData.notifications[0], "WSS");
                }
            }.bind(this);
            this.notifSocket.onerror = function (event) {
                that.notificationWebSocket();
            }.bind(this);
        },
        triggerNotification: function (notificationEvent, triggerSrc) {
            var oUserSettingsModel = this.getModel("oUserSettingsModel");
            var standardSettings = oUserSettingsModel.getProperty("/standardSettings/" + notificationEvent.origin.toLowerCase() +
                "SettingDtos");
            if (standardSettings && notificationEvent) {
                var sound, audio, badge, notificationStyle;
                for (var i = 0; i < standardSettings.settingDtos.length; i++) {
                    if (standardSettings.settingDtos[i].additionalSettingId === "Notification Sound") {
                        sound = standardSettings.settingDtos[i].value;
                    }
                    if (standardSettings.settingDtos[i].additionalSettingId === "Badges") {
                        badge = standardSettings.settingDtos[i].value;
                    }
                    if (standardSettings.settingDtos[i].additionalSettingId === "Notification Style") {
                        notificationStyle = standardSettings.settingDtos[i].value;
                    }
                }
                if (sound && triggerSrc !== "UPDATE" && sound !== 'Off') {
                    if (sound === "Xylophone") {
                        audio = new Audio("./audio/Xylophone.mp3");
                    } else if (sound === "Classic") {
                        audio = new Audio("./audio/Classic.mp3");
                    } else if (sound === "Night Owl") {
                        audio = new Audio("./audio/NightOwl.mp3");
                    }
                    audio.play();
                }
                if (badge) {
                    oUserSettingsModel.setProperty("/settings/badge", badge);
                }
                if (notificationStyle && triggerSrc !== "UPDATE") {
                    oUserSettingsModel.setProperty("/settings/notificationStyle", notificationStyle);
                    if (notificationStyle === "Banner") {
                        oUserSettingsModel.setProperty("/settings/notificationBannerDto", [notificationEvent]);
                        setTimeout(function () {
                            oUserSettingsModel.setProperty("/settings/notificationStyle", "OFF");
                        }, 5000);
                    }
                }

            }

        },
        //  Initialising chat web socket connection
        chatWebSocket: function () {
            var that = this;
            var userId = this.oAppModel.getProperty("/loggedInUserDetails/userId");
            var url = "wss://testbotkbniwmq1aj.hana.ondemand.com/workbox-product/websocketChat/" + userId; //DEV URL
            // var url = "wss://workboxweba8b98c03e.hana.ondemand.com/workbox-product/websocketChat/" + userId; //QA URL
            this.socket = new WebSocket(url);
            this.socket.onopen = function (event) { };
            this.socket.onmessage = function (Event) {
                var messages = [];
                var oData = JSON.parse(Event.data);
                /* ------------------For Unified Inbox Section----------------------------------*/
                if ((that.oAppModel.getProperty("/currentView")) === "unifiedInbox") {
                    if (oData.chatMessages !== undefined) {
                        var unifiedInbox = sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox');
                        var oTaskLevelChat = unifiedInbox.getModel("oTaskLevelChat");
                        if (oTaskLevelChat.getProperty("/currentChatId") === oData.chatMessages.messages[0].chatId) {
                            messages = oTaskLevelChat.getProperty("/messages");
                            messages.push(oData.chatMessages.messages[0]);
                            if (oData.chatMessages.members) {
                                var memberDetails = unifiedInbox.getController().setChatParticipantsList(oData.chatMessages.members);
                                oTaskLevelChat.setProperty("/members", oData.chatMessages.members);
                                oTaskLevelChat.setProperty("/sParticipants", memberDetails.sParticipants);
                                oTaskLevelChat.setProperty("/memberList", memberDetails.memberList);
                                oTaskLevelChat.setProperty("/sTooltip", memberDetails.tooltip);
                            }
                            that.scrollBottom("ID_TASK_LEVEL_CHAT_SCROLL", unifiedInbox.getController());
                            oTaskLevelChat.refresh(true);
                        }
                        oTaskLevelChat.setProperty("/busy", false);
                        oTaskLevelChat.setProperty("/msgSentBusy", false);
                    }
                }
                /* ------------------ For Collaboration Section -----------------*/
                if ((that.oAppModel.getProperty("/currentView")) === "taskBoard") {
                    if (oData.chatMessages !== undefined) {
                        var collaboration = sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.Chat');
                        var oCollaborationModel = collaboration.getModel("oCollaborationModel");
                        if (oCollaborationModel.getProperty("/currentChatId") === oData.chatMessages.messages[0].chatId) {
                            messages = oCollaborationModel.getProperty("/chat");
                            messages.push(oData.chatMessages.messages[0]);
                            that.scrollBottom("ID_CHAT_SCROLLBAR", collaboration.getController());
                            oCollaborationModel.refresh(true);
                        }
                        //close busy indicator.
                    }
                }
            };
            this.socket.onerror = function (event) {
                that.chatWebSocket();
            }.bind(this);
        },

        setCurrentPage: function (inboxType, currentViewPage, currentViewPageName, setNavList, advSearchInbox) {
            var oAppModel = this.oAppModel;
            if (inboxType) {
                oAppModel.setProperty("/inboxType", inboxType);
            }
            if (currentViewPage) {
                oAppModel.setProperty("/currentViewPage", currentViewPage);
            }
            if (currentViewPageName) {
                oAppModel.setProperty("/currentViewPageName", currentViewPageName);
            }
            if (setNavList) {
                oAppModel.getProperty("/sideNavItemProperties").setSelectedKey(currentViewPage || inboxType);
            }
            if (advSearchInbox) {
                this.getModel("oAdvanceFilterModel").setProperty("/searchInboxType", currentViewPage || inboxType);

            }

        },

        //Function to check device type for responsiveness
        fnChkAppResponsiveness: function () { },

        /********************************* FILE UPLOAD AND DOWNLOAD FUNCTIONS**************************/

        //Function to parse xlsx uploaded data to json and return it
        uploadExcel: function (oEvent, rSuccess, sheetName, isToRowObject, isSheetToJson) {
            var fileType = oEvent.getSource().getFileType();
            if (fileType.includes("xlsx")) {
                var that = this;
                var fileUpload = oEvent.getSource();
                var domRef = fileUpload.getFocusDomRef();
                var selectedFile = domRef.files[0];
                if (selectedFile) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        var data = event.target.result;
                        var workbook = XLSX.read(data, {
                            type: "binary",
                            cellDates: true,
                            cellNF: false,
                            cellText: false
                        });
                        var resultSet = that.getWorkbookObject(workbook, sheetName, isToRowObject, isSheetToJson);

                        if (rSuccess === undefined)
                            rSuccess = null;
                        else
                            rSuccess(resultSet);
                        this.clear();

                    }.bind(fileUpload);
                    fileReader.readAsBinaryString(selectedFile);
                } else {
                    var i18n = this.getView().getModel("i18n").getResourceBundle();
                    var bsettingsChanged = this.getModel("oUserSettingsModel").getProperty("/settings/settingsChanged");
                    if (bsettingsChanged) {
                        this._createConfirmationMessage(i18n.getText("THEME_NOT_SAVED_ERR_MSG"), "Warning", i18n.getText("YES_TEXT"), i18n.getText(
                            "NO_TEXT"), true,
                            function () {
                                that._showToastMessage(this.getView().getModel("i18n").getResourceBundle().getText("NO_EXCEL_UPLOADED_TEXT"));
                            });
                    }
                }
            }
        },
        getWorkbookObject: function (workbook, sheetName, isToRowObject, isSheetToJson) {
            var resultSet = {
                rowObject: null,
                sheetToJson: null,
                workbook: workbook
            }
            if (isToRowObject) {
                resultSet.rowObject = XLSX.utils.sheet_to_row_object_array(
                    workbook.Sheets[workbook.SheetNames[0]], {
                    header: 0,
                    blankRows: false,
                    defval: null
                });
            }
            if (isSheetToJson) {
                if (!sheetName) {
                    sheetName = workbook.SheetNames[0];
                }
                var range = XLSX.utils.decode_range(workbook.Sheets[sheetName]['!ref']);
                range.s.c = 0;
                range.s.r = 0;
                var new_range = XLSX.utils.encode_range(range);
                resultSet.sheetToJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                    blankrows: true,
                    defval: '',
                    range: new_range,
                    dateNF: "DD mmm yyyy"
                });
            }
            return resultSet;

        },
        openImageViewer: function (base64, fileName, extension, fileType, fileSize) {
            var oImageView = {
                "attachmentId": "",
                "attachmentValue": base64,
                "attachmentSize": fileSize,
                "attachmentName": fileName,
                "extension": extension,
                "fileType": fileType,
            };
            var oImageViewModel = new sap.ui.model.json.JSONModel(oImageView);
            this.setModel("oImageViewModel", oImageViewModel);

            if (!this._oImageViewer) {
                this._oImageViewer = this._createFragment("oneapp.incture.workbox.fragment.ImageViewer", this);
                this.getView().addDependent(this._oImageViewer);
            }

            this._oImageViewer.setModel(oImageViewModel, "oImageViewModel");
            this._oImageViewer.open();
            this._oImageViewer.setBusy(false);
        },
        closeImageViewer: function () {
            this._oImageViewer.close();
        },
        afterCloseImageViewer: function () {
            this.oAppModel.setProperty("/previewImage", false);
        },
        handleTypeMissmatch: function (oEvent) {
            var aFileTypes = oEvent.getSource().getFileType();
            jQuery.each(aFileTypes, function (key, value) {
                aFileTypes[key] = "*." + value;
            });
            var sSupportedFileTypes = aFileTypes.join(", ");
            MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ATTACHMENT_ERR_MSG1") + oEvent.getParameter(
                "fileType") +
                this.getView().getModel("i18n").getResourceBundle().getText("ATTACHMENT_ERR_MSG2") +
                sSupportedFileTypes);
        },
        //position the scroll to the bottom of the screen
        scrollBottom: function (scrollId, that) {
            var oScrollContainer = that.getView().byId(scrollId).getId();
            setTimeout(function () {
                $("#" + oScrollContainer).scrollTop(document.getElementById(oScrollContainer).scrollHeight);
            }, 50);
        },

        /********************************* CHAT BOT FUNCTIONS **************************/

        getBot: function () {
            var that = this;
            var oChatBotModel = that.getModel("oChatBotModel");
            oChatBotModel.setProperty("/typing", false);
            this.fnCreateRandomNumber();
            $.ajax({
                type: "GET",
                url: "https://" + "api.recast.ai/auth/v1/owners/sandhya-ravichandran",
                headers: {
                    "Authorization": oChatBotModel.getProperty("/developerToken")
                },
                success: function (data) {
                    oChatBotModel.setProperty("/chatData/_userId", data.results.owner.id);
                },
                error: function (data) {

                }
            });

        },

        fnCreateRandomNumber: function () {
            var newNumber = "test_" + Math.floor(100000 + Math.random() * 900000);
            this.getModel("oChatBotModel").setProperty("/_randomNumber", newNumber);
        },
        getChatBotMessages: function () {
            var oChatBotModel = this.getModel("oChatBotModel");
            oChatBotModel.setProperty("/messages", []);
            oChatBotModel.setProperty("/bMuteAudio", true); //Added by Karishma
            oChatBotModel.setProperty("/typing", false);
            this.scrollBottom("ID_CHATBOT_SCROLLBAR", this);
            oChatBotModel.refresh(true);
        },
        onChatActionBtnPress: function (oEvent) {
            var oChatBotModel = this.getModel("oChatBotModel");
            var message = oEvent.getSource().getText();
            var chatBotMessages = oChatBotModel.getProperty("/messages");
            var oMsg = {
                "type": "text",
                "content": message,
                "sentBy": "USER",
                "sentAt": new Date()
            };
            chatBotMessages.push(oMsg);
            this.getBotReply(message);
        },

        /*********************************CHAT EMOJI FUNCTIONS **************************/

        openEmojiFrgament: function (oEvent) {
            var that = this;
            var oSource = oEvent.getSource();
            var oParent = oSource.getParent();
            if (!this._emojiFragment) {
                this._emojiFragment = this._createFragment("oneapp.incture.workbox.fragment.Emojis", this);
                this.getView().addDependent(this._emojiFragment);
                document.addEventListener("click",
                    function closeDialog(event) {
                        if (event.target.id === "sap-ui-blocklayer-popup") {
                            that._emojiFragment.close();

                        }
                    });
                this.oAppModel.setProperty("/emojiScrollLength", (sap.ui.Device.resize.height - 457) + "px");
            }
            this._emojiFragment.openBy(oParent);
        },
        addEmojiToText: function (oEvent) {
            var message = "";
            var emoji = oEvent.getSource().getProperty("text");
            // for Task level chat
            if (this.oAppModel.getProperty("/currentView") === "unifiedInbox" && this.oAppModel.getProperty("/isTaskLevelChatVisible")) {
                message = this.getModel("oTaskLevelChat").getProperty("/newMessage");
                this.getModel("oTaskLevelChat").setProperty("/newMessage", message + emoji);
                this.getModel("oTaskLevelChat").refresh(true);
                this.sendActionPopup.close(); //Added by karishma
            }
            // For collaboration
            if (this.oAppModel.getProperty("/currentView") === "taskBoard") {
                var oCollaborationModel = this.getModel("oCollaborationModel");
                message = oCollaborationModel.getProperty("/sTypedMessage");
                oCollaborationModel.setProperty("/sTypedMessage", message + emoji);
                oCollaborationModel.refresh(true);
            }
            this._emojiFragment.close();
        },

        /********************************* ADVANCED FILTER FUNCTIONS **************************/

        // On clearing advanced filters
        clearFilters: function () {
            var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");

            oAdvanceFilterModel.setProperty("/isView", false);
            oAdvanceFilterModel.setProperty("/viewName", "");
            oAdvanceFilterModel.setProperty("/filterId", "");
            oAdvanceFilterModel.setProperty("/filterId", "");
            oAdvanceFilterModel.setProperty("/filterName", "");
            oAdvanceFilterModel.setProperty("/isTray", false);
            oAdvanceFilterModel.setProperty("/description", "");
            oAdvanceFilterModel.setProperty("/isActive", false);
            oAdvanceFilterModel.setProperty("/filterType", "CUSTOM");
            this.clearBasicFilterData();
            this.clearAdvFilterData();
            oAdvanceFilterModel.refresh(true);
        },
        clearBasicFilterData: function () {
            var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
            var templateStandardFilter = jQuery.extend(true, [], oAdvanceFilterModel.getProperty("/templateStandardFilter"));
            var templateAdvancedFilterNames = jQuery.extend(true, [], oAdvanceFilterModel.getProperty("/templateAdvancedFilterNames"));
            oAdvanceFilterModel.setProperty("/aAdvancedFilterNames", templateAdvancedFilterNames);
            var advFilter = oAdvanceFilterModel.getProperty(oAdvanceFilterModel.getProperty("/subjectIndex"));
            var standardFilter = oAdvanceFilterModel.getProperty("/standardFilter/" + advFilter.index);
            standardFilter.value = "";
            standardFilter.selectedKey = "";
            advFilter = standardFilter;
            oAdvanceFilterModel.setProperty("/standardFilter", templateStandardFilter);
            var selectedFilterNames = oAdvanceFilterModel.getProperty("/selectedFilterNames");
            if (selectedFilterNames.includes("NAME")) {
                this.removeSelProcess(false, true);
            }

        },
        clearAdvFilterData: function () {
            var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
            var templateAdvancedFilters = jQuery.extend(true, {}, oAdvanceFilterModel.getProperty("/templateAdvancedFilters"));
            oAdvanceFilterModel.setProperty("/listOfAdvancedFilters", [templateAdvancedFilters]);
            oAdvanceFilterModel.setProperty("/selectedFilterNames", []);
            oAdvanceFilterModel.setProperty("/queryList", []);
            oAdvanceFilterModel.setProperty("/queryText", "");
            oAdvanceFilterModel.setProperty("/enableAddRow", false);
        },

        removeAllTokens: function (toPreserve) {
            var oAppModel = this.oAppModel;
            var oFilterListModel = sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getModel(
                "oFilterListModel");
            var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
            if (toPreserve) {
                this.preserveData();
                oAdvanceFilterModel.setProperty("/searchInboxType", "MyInbox");
            }
            var oActionHeader = this.getModel("oActionHeader");
            if (oActionHeader) {
                oActionHeader.setProperty("/selectedItemLength", 0);
                sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().resetActionButtons();
            }
            oAppModel.setProperty("/isViewApplied", false);
            oAppModel.setProperty("/removeFilterToken", false);
            oAdvanceFilterModel.setProperty("/viewAppliedContext", {});
            oAppModel.setProperty("/freeFilter", "");
            oAppModel.setProperty("/sortingDto", []);
            oAppModel.setProperty("/selectedFreeFilter", "");
            oAppModel.setProperty("/isAppliedAdvancedFilter", false);
            oAppModel.setProperty("/advFilterTokens", []);
            oAppModel.setProperty("/filterTokens", []);
            oAppModel.setProperty("/filterData", {});
            oAdvanceFilterModel.setProperty("/subjectTokenIndex", -1);
            this.clearFilters();
            oAdvanceFilterModel.setProperty("/showAdvancedFilter", true);
            oAdvanceFilterModel.refresh(true);
            oAppModel.refresh(true);
        },
        preserveData: function () {
            var oAppModel = this.oAppModel;
            var oFilterListModel = sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getModel(
                "oFilterListModel");
            var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
            var preserveFilterData = {
                removeFilterToken: oAppModel.getProperty("/removeFilterToken"),
                freeFilter: oAppModel.getProperty("/freeFilter"),
                sortingDto: oAppModel.getProperty("/sortingDto"),
                selectedFreeFilter: oAppModel.getProperty("/selectedFreeFilter"),
                isAppliedAdvancedFilter: oAppModel.getProperty("/isAppliedAdvancedFilter"),
                sideNavItemProperties: oAppModel.getProperty("/sideNavItemProperties").getSelectedKey(),
                advFilterTokens: oAppModel.getProperty("/advFilterTokens"),
                filterTokens: oAppModel.getProperty("/filterTokens"),
                filterData: oAppModel.getProperty("/filterData"),
                isViewApplied: oAppModel.getProperty("/isViewApplied"),
                currentPage: oAppModel.getProperty("/currentPage"),
                subjectTokenIndex: oAdvanceFilterModel.getProperty("/subjectTokenIndex"),
                isView: oAdvanceFilterModel.getProperty("/isView"),
                isTray: oAdvanceFilterModel.getProperty("/isTray"),
                viewAppliedContext: oAdvanceFilterModel.getProperty("/viewAppliedContext"),
                standardFilter: jQuery.extend(true, [], oAdvanceFilterModel.getProperty("/standardFilter")),
                aAdvancedFilterNames: jQuery.extend(true, [], oAdvanceFilterModel.getProperty("/aAdvancedFilterNames")),
                listOfAdvancedFilters: jQuery.extend(true, [], oAdvanceFilterModel.getProperty("/listOfAdvancedFilters")),
                queryList: oAdvanceFilterModel.getProperty("/queryList"),
                queryText: oAdvanceFilterModel.getProperty("/queryText")
            };
            oAdvanceFilterModel.setProperty("/prevFilterData", preserveFilterData);
            oAdvanceFilterModel.refresh(true);
            oAppModel.refresh(true);
        },
        reapplyTokens: function () {
            var oAppModel = this.oAppModel;
            var oFilterListModel = sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getModel(
                "oFilterListModel");
            var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
            var prevFilterData = oAdvanceFilterModel.getProperty("/prevFilterData");
            var oActionHeader = this.getModel("oActionHeader");
            oActionHeader.setProperty("/selectedItemLength", 0);
            sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().resetActionButtons();

            oAppModel.setProperty("/removeFilterToken", prevFilterData.removeFilterToken);
            oAppModel.setProperty("/freeFilter", prevFilterData.freeFilter);
            oAppModel.setProperty("/sortingDto", prevFilterData.sortingDto);
            oAppModel.setProperty("/selectedFreeFilter", prevFilterData.selectedFreeFilter);
            oAppModel.setProperty("/isAppliedAdvancedFilter", prevFilterData.isAppliedAdvancedFilter);
            oAppModel.setProperty("/advFilterTokens", prevFilterData.advFilterTokens);
            oAppModel.setProperty("/filterTokens", prevFilterData.filterTokens);
            oAppModel.setProperty("/filterData", prevFilterData.filterData);
            oAppModel.getProperty("/sideNavItemProperties").setSelectedKey(prevFilterData.sideNavItemProperties);
            oAppModel.setProperty("/isViewApplied", prevFilterData.isViewApplied);

            oAdvanceFilterModel.setProperty("/queryList", prevFilterData.queryList);
            oAdvanceFilterModel.setProperty("/queryText", prevFilterData.queryText);
            oAdvanceFilterModel.setProperty("/subjectTokenIndex", prevFilterData.subjectTokenIndex);
            oAdvanceFilterModel.setProperty("/standardFilter", prevFilterData.standardFilter);
            oAdvanceFilterModel.setProperty("/aAdvancedFilterNames", prevFilterData.aAdvancedFilterNames);
            oAdvanceFilterModel.setProperty("/listOfAdvancedFilters", prevFilterData.listOfAdvancedFilters);
            oAdvanceFilterModel.setProperty("/viewAppliedContext", prevFilterData.viewAppliedContext);
            oAdvanceFilterModel.setProperty("/isTray", prevFilterData.isTray);
            if (prevFilterData.isViewApplied) {
                var oContext = prevFilterData.viewAppliedContext;
                oContext.viewPayload = JSON.parse(oContext.viewPayload);
                this.setCurrentPage(oContext.viewPayload.inboxType, oContext.viewPayload.inboxType, oContext.name, false, true);
                oAdvanceFilterModel.setProperty("/filterName", oContext.name);
                oAdvanceFilterModel.setProperty("/isView", true);
                oAdvanceFilterModel.setProperty("/viewName", oContext.name);
                oAdvanceFilterModel.setProperty("/filterId", oContext.inboxId);
            }
            var unifiedInbox = sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox');
            unifiedInbox.byId("WB_TASK_CARD_ITEM").removeSelections();

            oAppModel.refresh(true);
            oFilterListModel.refresh(true);
            oAdvanceFilterModel.refresh(true);
        },

        /********************************* NOTIFICATION FUNCTIONS **************************/
        updateNotification: function () {
            var url = "/oneappinctureworkbox/WorkboxJavaService/notification/getNotification";
            var oUserSettingsModel = this.getModel("oUserSettingsModel");
            oUserSettingsModel.setProperty("/settings/notification/notificationBusy", true);
            this.doAjax(url, "GET", null, function (oData) {
                oUserSettingsModel.setProperty("/settings/notification/notificationList", oData.notifications);
                oUserSettingsModel.setProperty("/settings/notification/count", oData.count);
                if (oData.count > 0 && this._oNotification && this._oNotification.isOpen()) {
                    this._oNotification.focus();
                }
                if (oData.notifications.length) {
                    this.triggerNotification(oData.notifications[0], "UPDATE");
                }
                oUserSettingsModel.setProperty("/settings/notification/notificationBusy", false);
            }.bind(this), function (oEvent) { }.bind(this));
        },

        selectedLangText: function (lang) {
            switch (lang) {
                case "en":
                    this.oAppModel.setProperty("/selectedLangKey", "English");
                    break;
                case "in":
                    this.oAppModel.setProperty("/selectedLangKey", "Bahasa Indonesia");
                    break;
                case "zh":
                    this.oAppModel.setProperty("/selectedLangKey", "中文");
                    break;
                case "ar":
                    this.oAppModel.setProperty("/selectedLangKey", "عربى");
                    break;
            }
        },

        //function to get the barrer token
        getBarrerTokenFn: function () {
            var that = this;
            var data = {
                "userId": "INC01201",
                "password": "INC01201@123"
            };
            var url = "https://hrapp.cfapps.eu10.hana.ondemand.com/login";
            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(data),
                headers: {
                    "Accept": "application/json;charset=utf8"
                },
                contentType: "application/json",
                //contentType: "application/x-www-form-urlencoded; charset=utf-8",
                success: function (response) {
                    that.oAppModel.setProperty("/bearerToken", response.token);
                },
                error: function (response) { }
            });
        },
        /************* Collaboration Changes - By Karishma *************/

        collaboratioWebSocket: function (sUserId) {
            var that = this;
            var url = "wss://testbotkbniwmq1aj.hana.ondemand.com/chat/websocketChat/web/" + sUserId; //DEV URL
            // var url = "wss://workboxweba8b98c03e.hana.ondemand.com/chat/websocketChat/web/" + sUserId; //QA URL
            this.socket = new WebSocket(url);
            this.socket.onopen = function (event) { };
            this.socket.onmessage = function (event) {

                /* ------------------For Unified Inbox Section----------------------------------*/
                if ((that.oAppModel.getProperty("/currentView")) === "unifiedInbox") {
                    var unifiedInbox = sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.UnifiedInbox');
                    var oTaskLevelChat = unifiedInbox.getModel("oTaskLevelChat");
                    var sUserId = that.oAppModel.getProperty("/loggedInUserDetails/userId");
                    var oReceived = JSON.parse(event.data);
                    if (oReceived.chatType === "context") {
                        if (that.oAppModel.getProperty("/isTaskLevelChatVisible") && that.oAppModel.getProperty("/isRightPaneVisible")) {
                            oTaskLevelChat.setProperty("/bIsMember", false);
                            oTaskLevelChat.setProperty("/bReplyToBox", false);
                            var sChatId = oTaskLevelChat.getProperty("/currentChatId");
                            //send notification
                            if (sChatId === oReceived.chatID) {
                                var aMemberDetails = oTaskLevelChat.getProperty("/aMemberList");
                                var iTotalMembers = aMemberDetails ? aMemberDetails.length : 0;
                                var iTotalRead = oTaskLevelChat.getProperty("/iTotalRead");
                                iTotalRead = iTotalRead ? iTotalRead : 0;
                                var iTotalDelivered = oTaskLevelChat.getProperty("/iTotalDelivered");
                                iTotalDelivered = iTotalDelivered ? iTotalDelivered : 0;
                                var aChat = oTaskLevelChat.getProperty("/messages");
                                oTaskLevelChat.setProperty("/currentChatId", oReceived.chatID);
                                if (oReceived.sentBy !== sUserId && (oReceived.messageType !== "acknowledge" && oReceived.messageType !== "typing")) {
                                    that.fnSendAcknowledgement(sUserId, [oReceived.sentBy], sChatId, oReceived.chatType);
                                }
                                if (oReceived.messageType !== "typing") {
                                    if (aChat.length > 0) {
                                        var iLastIndex = aChat.length - 1;
                                        for (var k = iLastIndex; k > 0; k--) {
                                            if (aChat[k].sentBy === sUserId) {
                                                var sTaskCurrentStatus = aChat[k].commentStatus;
                                                var iTaskUserLastIndex = k;
                                                break;
                                            }
                                        }
                                        for (var i = iLastIndex - 1; i > 0; i--) {
                                            if (aChat[i].sentBy === sUserId) {
                                                if (oReceived.currentMessageStatus === "DELIVERED" && aChat[i].commentStatus !== "READ") {
                                                    aChat[i].commentStatus = "";
                                                } else if (oReceived.currentMessageStatus === "SENT" && aChat[i].commentStatus !== "READ" && aChat[i].commentStatus !==
                                                    "DELIVERED") {
                                                    aChat[i].commentStatus = "";
                                                } else if (oReceived.currentMessageStatus === "READ") {
                                                    aChat[i].commentStatus = "";
                                                }
                                            }
                                        }
                                    }
                                }
                                if (oReceived.messageType !== "acknowledge") {
                                    var aMemberPid = [];
                                    var aMembers = oReceived.memberDetails;
                                    for (var i = 0; i < aMembers.length; i++) {
                                        if (aMembers[i].displayName) {
                                            aMemberPid.push(
                                                aMembers[i].id
                                            );
                                        }
                                    }

                                    if (aMembers.length >= 2) {
                                        var tooltip = aMembers[0].displayName;
                                        var sParticipants = aMembers[0].firstName + ", " + aMembers[1].firstName + " and " + (aMembers.length - 2) + " more.";
                                        for (var i = 1; i < aMembers.length; i++) {
                                            if (i !== aMembers.length - 1) {
                                                tooltip = tooltip + ", " + aMembers[i].displayName;
                                            } else {
                                                tooltip = tooltip + " and " + aMembers[i].displayName;
                                            }
                                        }
                                    }
                                    oTaskLevelChat.setProperty("/aMemberList", aMembers);
                                    oTaskLevelChat.setProperty("/aMemberPid", aMemberPid);
                                    oTaskLevelChat.setProperty("/sParticipants", sParticipants);
                                    oTaskLevelChat.setProperty("/sTooltip", tooltip);
                                }
                                if (oReceived.sentBy !== sUserId) {
                                    // if (oReceived.action === "action") {
                                    // var aActionButtons = [];
                                    // for (var i = 0; i < oReceived.actionItems.length; i++) {
                                    // aActionButtons.push({
                                    // "button": oReceived.actionItems[i][0].toUpperCase() + oReceived.actionItems[i].substring(1)
                                    // });
                                    // }
                                    // oReceived.aActionButtons = aActionButtons;
                                    // }
                                    if (oReceived.messageType !== "typing") {
                                        if (oReceived.currentMessageStatus !== "READ") {
                                            aChat.push({
                                                "sentBy": oReceived.sentBy,
                                                "comment": oReceived.comment,
                                                "commentID": oReceived.commentID,
                                                "sentAt": oReceived.sentAt,
                                                "sendersName": oReceived.sendersName,
                                                "messageStatus": oReceived.currentMessageStatus,
                                                "isAttachment": oReceived.isAttachment,
                                                "attachmentID": oReceived.attachmentID,
                                                "attachmentDetails": oReceived.attachmentDetails,
                                                "tagged": oReceived.tagged,
                                                "aActionButtons": oReceived.aActionButtons,
                                                "isReply": oReceived.isReply,
                                                "replyDetails": oReceived.replyDetails

                                            });
                                        } else {
                                            if (oReceived.currentMessageStatus === "READ") {
                                                iTotalRead++;
                                                oTaskLevelChat.setProperty("/iTotalRead", iTotalRead);
                                            }
                                        }
                                    }
                                } else {
                                    if (oReceived.currentMessageStatus === "DELIVERED") {
                                        iTotalDelivered++;
                                        oTaskLevelChat.setProperty("/iTotalDelivered", iTotalDelivered);
                                    }
                                    var iLastIndex = aChat.length - 1;
                                    // aChat[iLastIndex].commentStatus = oReceived.currentMessageStatus;
                                    if (oReceived.attachmentDetails) {
                                        aChat[iLastIndex].attachmentDetails = oReceived.attachmentDetails;
                                    }
                                }
                                if ((oReceived.sentBy === sUserId && (oReceived.messageType === "chat" || oReceived.messageType === "acknowledge")) ||
                                    (oReceived.sentBy !== sUserId && oReceived.currentMessageStatus === "READ" && oReceived.messageType !== "typing")) {
                                    var sStatus = (iTotalRead === iTotalMembers - 1) ? "READ" : ((iTotalDelivered === iTotalMembers - 1) ? "DELIVERED" : "SENT");
                                    if ((iTotalRead === iTotalMembers - 1) || (iTotalDelivered === iTotalMembers - 1)) {
                                        oTaskLevelChat.setProperty("/iTotalRead", 0);
                                        oTaskLevelChat.setProperty("/iTotalDelivered", 0);
                                    }

                                    aChat[iTaskUserLastIndex].commentStatus = (sTaskCurrentStatus === "READ") ? "READ" : ((sTaskCurrentStatus === "DELIVERED" &&
                                        sStatus === "READ") ? "READ" : (sTaskCurrentStatus === "DELIVERED" && sStatus === "DELIVERED") ? "DELIVERED" : ((
                                            sTaskCurrentStatus === "SENT" && sStatus !== "SENT") ? sStatus : "SENT"));
                                }
                                oTaskLevelChat.setProperty("/messages", aChat);
                                that.scrollBottom("ID_TASK_LEVEL_CHAT_SCROLL", unifiedInbox.getController());
                            }
                        } else if (that.oAppModel.getProperty("/isTaskLevelChatVisible") === false && that.oAppModel.getProperty("/isRightPaneVisible") ===
                            false) {
                            if (oReceived.messageType !== "acknowledge") {
                                oTaskLevelChat.setProperty("/bIsMember", false);
                                oTaskLevelChat.setProperty("/bReplyToBox", false);
                                oTaskLevelChat.setProperty("/msgSentBusy", false);
                                that.oAppModel.setProperty("/functionality/expanded", false);
                                that.oAppModel.setProperty("/functionality/direction", "Column");
                                that.oAppModel.setProperty("/functionality/visibility", false);
                                that.oAppModel.setProperty("/isRightPaneVisible", true);
                                that.oAppModel.setProperty("/isTaskLevelChatVisible", true);
                                oTaskLevelChat.setProperty("/currentChatId", oReceived.chatID);
                                oTaskLevelChat.setProperty("/sTaskDescription", oReceived.taskDescription);
                                oTaskLevelChat.setProperty("/aMemberList", oReceived.memberDetails);
                                oTaskLevelChat.setProperty("/aActivemembers", oReceived.memberDetails);
                                var aMemberPid = [];
                                var aMembers = oReceived.memberDetails;
                                for (var i = 0; i < aMembers.length; i++) {
                                    if (aMembers[i].displayName) {
                                        aMemberPid.push(
                                            aMembers[i].id
                                        );
                                    }
                                }
                                if (aMembers.length >= 2) {
                                    var tooltip = aMembers[0].displayName;
                                    var sParticipants = aMembers[0].firstName + ", " + aMembers[1].firstName + " and " + (aMembers.length - 2) + " more.";
                                    for (var i = 1; i < aMembers.length; i++) {
                                        if (i !== aMembers.length - 1) {
                                            tooltip = tooltip + ", " + aMembers[i].displayName;
                                        } else {
                                            tooltip = tooltip + " and " + aMembers[i].displayName;
                                        }
                                    }
                                }
                                oTaskLevelChat.setProperty("/sParticipants", sParticipants);
                                oTaskLevelChat.setProperty("/sTooltip", tooltip);
                                oTaskLevelChat.setProperty("/aMemberPid", aMemberPid);
                                if (oReceived.taskOwners) {
                                    if (oReceived.taskOwners[1] === "READY") {
                                        oTaskLevelChat.setProperty("/bIsOwner", true);
                                    } else if (oReceived.taskOwners[1] === "RESOLVED" || oReceived.taskOwners[1] === "RESERVED") {
                                        if (oReceived.taskOwners[0] === sUserId) {
                                            oTaskLevelChat.setProperty("/bIsOwner", true);
                                        } else {
                                            oTaskLevelChat.setProperty("/bIsOwner", false);
                                        }
                                    } else {
                                        if (oReceived.taskOwners[0] === sUserId) {
                                            oTaskLevelChat.setProperty("/bIsOwner", true);
                                        } else {
                                            oTaskLevelChat.setProperty("/bIsOwner", false);
                                        }
                                    }
                                }
                                // that.getHistory();
                                var url = "/ActJavaService/chat/chatHistory/" + sUserId + "/" + oReceived.chatID + "/0/10";
                                that.doAjax(url, "GET", null, function (oData) {
                                    var bIsDeliver = false,
                                        bIsSent = false;
                                    var aMessages = oData.data.chatHistory;
                                    aMessages = aMessages.sort((a, b) => new Date(Number(a.sentAt)) - new Date(Number(b.sentAt)));
                                    for (var j = aMessages.length - 1; j >= 0; j--) {
                                        if (aMessages[j].sentBy === sUserId) {
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
                                    oTaskLevelChat.setProperty("/messages", aMessages);
                                    that.scrollBottom("ID_TASK_LEVEL_CHAT_SCROLL", unifiedInbox.getController());
                                }.bind(this), function (oError) { }.bind(this));
                            }
                        }
                    }
                }

                /* ------------------ For Collaboration Section -----------------*/
                else if ((that.oAppModel.getProperty("/currentView")) === "taskBoard") {
                    var collaboration = sap.ui.core.UIComponent.getRouterFor(that).getView('oneapp.incture.workbox.view.Chat');
                    var oCollaborationModel = that.getOwnerComponent().getModel("oCollaborationModel");
                    that.getView().setModel(oCollaborationModel, "oCollaborationModel");
                    var sUserId = that.oAppModel.getProperty("/loggedInUserDetails/userId");
                    var oReceived = JSON.parse(event.data);
                    // if (oReceived.chatType !== "context") {
                    var userList = oCollaborationModel.getProperty("/userList");
                    var aChat = oCollaborationModel.getProperty("/aChat");
                    var sChatId = oCollaborationModel.getProperty("/selectedChatId");
                    if (sChatId === oReceived.chatID) {
                        var aMemberDetails = oCollaborationModel.getProperty("/aMemberDetails");
                        var iTotalMembers = aMemberDetails ? aMemberDetails.length : 0;
                        var iTotalRead = oCollaborationModel.getProperty("/iTotalRead");
                        iTotalRead = iTotalRead ? iTotalRead : 0;
                        var iTotalDelivered = oCollaborationModel.getProperty("/iTotalDelivered");
                        iTotalDelivered = iTotalDelivered ? iTotalDelivered : 0;
                        if (oReceived.sentBy !== sUserId && (oReceived.messageType !== "acknowledge" && oReceived.messageType !== "typing")) {
                            that.fnSendAcknowledgement(sUserId, [oReceived.sentBy], sChatId, oReceived.chatType);
                        }
                        if (oReceived.messageType !== "typing") {
                            var iLastIndex = aChat.length - 1;
                            if (aChat.length > 0) {
                                var iUserLastIndex, iPreviousIndexStatus;
                                var bUserLastIndex = false;
                                for (var k = iLastIndex; k > 0; k--) {
                                    if (aChat[k].sentBy === sUserId) {
                                        if (!iPreviousIndexStatus && bUserLastIndex) {
                                            iPreviousIndexStatus = k;
                                            var sPreviousIndexStatus = aChat[k].commentStatus;
                                            break;
                                        }
                                        if (!iUserLastIndex) {
                                            iUserLastIndex = k;
                                            bUserLastIndex = true;
                                            var sCurrentStatus = aChat[k].commentStatus;
                                        }

                                    }
                                }

                                // for (var i = iLastIndex - 1; i > 0; i--) {
                                // if (aChat[i].sentBy === sUserId) {
                                // if (oReceived.currentMessageStatus === "DELIVERED" && aChat[i].commentStatus !== "READ") {
                                // aChat[i].commentStatus = "";
                                // } else if (oReceived.currentMessageStatus === "SENT" && aChat[i].commentStatus !== "READ" && aChat[i].commentStatus !==
                                // "DELIVERED") {
                                // aChat[i].commentStatus = "";
                                // } else if (oReceived.currentMessageStatus === "READ") {
                                // aChat[i].commentStatus = "";
                                // break;
                                // }
                                // }
                                // }
                            }
                        }
                        var iLastIndex = aChat.length - 1;
                        if (oReceived.sentBy !== sUserId) {
                            if (oReceived.messageType !== "typing") {
                                if (oReceived.currentMessageStatus !== "READ") {
                                    aChat.push({
                                        "sentBy": oReceived.sentBy,
                                        "comment": oReceived.comment,
                                        "commentID": oReceived.commentID,
                                        "sentAt": oReceived.sentAt,
                                        "sendersName": oReceived.sendersName,
                                        "messageStatus": oReceived.currentMessageStatus,
                                        "isAttachment": oReceived.isAttachment,
                                        "attachmentID": oReceived.attachmentID,
                                        "attachmentDetails": oReceived.attachmentDetails,
                                        "tagged": oReceived.tagged,
                                        "isReply": oReceived.isReply,
                                        "replyDetails": oReceived.replyDetails,
                                        "botInfo": oReceived.botInfo
                                    });
                                    if (oReceived.botInfo.isHeaderSet) {
                                        oCollaborationModel.setProperty("/sHeaderValue", oReceived.botInfo.memory.user.headerValue);
                                        oCollaborationModel.setProperty("/sHeaderName", oReceived.botInfo.memory.user.headerName);
                                    } else {
                                        oCollaborationModel.setProperty("/sHeaderValue", "");
                                        oCollaborationModel.setProperty("/sHeaderName", "");
                                    }
                                } else {
                                    if (oReceived.currentMessageStatus === "READ") {
                                        iTotalRead++;
                                        oCollaborationModel.setProperty("/iTotalRead", iTotalRead);
                                    }
                                }
                            } else if (oReceived.messageType === "typing") {
                                var sSender = oReceived.sendersName;
                                oCollaborationModel.setProperty("/aTypingSender", sSender);
                                oCollaborationModel.setProperty("/bTypingIndicator", true);
                                setTimeout(function () {
                                    oCollaborationModel.setProperty("/bTypingIndicator", false);
                                }, 3000);
                            }
                        } else {
                            // if (aChat.length > 0) {
                            // // var iLastIndex = aChat.length - 1;

                            // }
                            if (oReceived.currentMessageStatus === "DELIVERED") {
                                iTotalDelivered++;
                                oCollaborationModel.setProperty("/iTotalDelivered", iTotalDelivered);
                            }

                            if (oReceived.attachmentDetails) {
                                aChat[iLastIndex].attachmentDetails = oReceived.attachmentDetails;
                            }
                            if (oReceived.sentAt) {
                                aChat[iLastIndex].sentAt = oReceived.sentAt;
                            }
                        }
                        if ((oReceived.sentBy === sUserId && (oReceived.messageType === "chat" || oReceived.messageType === "acknowledge")) ||
                            (oReceived.sentBy !== sUserId && oReceived.currentMessageStatus === "READ" && oReceived.messageType !== "typing")) {
                            var sStatus = (iTotalRead === iTotalMembers - 1) ? "READ" : ((iTotalDelivered === iTotalMembers - 1) ? "DELIVERED" : "SENT");
                            if ((iTotalRead === iTotalMembers - 1) || (iTotalDelivered === iTotalMembers - 1)) {
                                oCollaborationModel.setProperty("/iTotalRead", 0);
                                oCollaborationModel.setProperty("/iTotalDelivered", 0);
                            }

                            var sNewStatus = (sCurrentStatus === "READ") ? "READ" : ((sCurrentStatus === "DELIVERED" && sStatus ===
                                "READ") ? "READ" : (sCurrentStatus === "DELIVERED" && sStatus === "DELIVERED") ? "DELIVERED" : ((sCurrentStatus === "SENT" &&
                                    sStatus !== "SENT") ? sStatus : "SENT"));
                            aChat[iUserLastIndex].commentStatus = sNewStatus;
                            aChat[iPreviousIndexStatus].commentStatus = sNewStatus === "READ" ? "" : (sNewStatus === sPreviousIndexStatus ? "" :
                                sPreviousIndexStatus);
                            for (var i = iUserLastIndex - 1; i > 0; i--) {
                                if (aChat[i].sentBy === sUserId) {
                                    if (sNewStatus === "DELIVERED" && aChat[i].commentStatus !== "READ") {
                                        aChat[i].commentStatus = "";
                                    } else if (sNewStatus === "SENT" && aChat[i].commentStatus !== "READ" && aChat[i].commentStatus !==
                                        "DELIVERED") {
                                        aChat[i].commentStatus = "";
                                    } else if (sNewStatus === "READ") {
                                        aChat[i].commentStatus = "";
                                    }
                                }
                            }
                        }

                        oCollaborationModel.setProperty("/aChat", aChat);
                        if (oReceived.comment || oReceived.isAttachment) {
                            var selectedScreen = oCollaborationModel.getProperty("/selectedScreen");
                            if ((selectedScreen !== "pinned" && selectedScreen !== "favorites") && (oReceived.messageType !== "acknowledge" && oReceived.messageType !==
                                "typing")) {
                                that.fnRefreshChatlist(oReceived.chatType, sUserId, collaboration);
                            }
                        }
                        that.scrollBottom("ID_CHAT_SCROLLCONTAINER", collaboration.getController());
                    } else {
                        if (userList.length > 0) {
                            for (var i = 0; i < userList.length; i++) {
                                if (userList[i].chatID === oReceived.chatID) {
                                    userList[i].unreadMessageCount = userList[i].unreadMessageCount ? (userList[i].unreadMessageCount) + 1 : 1;
                                    break;
                                }
                            }
                            oCollaborationModel.setProperty("/userList", userList);
                        }
                    }
                }
                // }
            };
            this.socket.onerror = function (event) {
                that.collaboratioWebSocket(sUserId, true);
            }.bind(this);
        },
        fnSendAcknowledgement: function (sSentBy, aSentTo, sChatId, sChatType) {
            var sAcknowledgementUrl = "/ActJavaService/chat/acknowledge";
            var oUpdatePayload = {
                "sentBy": sSentBy,
                "sentTo": aSentTo,
                "chatID": sChatId,
                "chatType": sChatType,
                "sentAt": String(new Date().getTime())
            };
            this.doAjax(sAcknowledgementUrl, "POST", oUpdatePayload, function (oData) {
                sap.ui.core.UIComponent.getRouterFor(this).getView("oneapp.incture.workbox.view.Chat").getController().fnUpdateCloseChat(
                    sChatId);
            }.bind(this), function (oError) { }.bind(this));
        },
        fnRefreshChatlist: function (sChatType, sUserId, collaboration) {
            var that = this;
            var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
            this.getView().setModel(oCollaborationModel, "oCollaborationModel");
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
                    } else if (sChatType === "group") {
                        oCollaborationModel.setProperty("/userList", aChatList);
                    } else if (sChatType === "context") {
                        var iExpandedPanelIndex = oCollaborationModel.getProperty("/iExpandedPanelIndex");
                        for (var i = 0; i < aChatList.length; i++) {
                            aChatList[i].bExpandPanel = false;
                        }
                        aChatList[iExpandedPanelIndex].bExpandPanel = true;
                        oCollaborationModel.setProperty("/userList", aChatList);
                    }
                    if (that.byId("idChatList")) {
                        that.byId("idChatList").setSelectedItem(that.byId("idChatList").getItems()[0]);
                    } else {
                        collaboration.byId("idChatList").setSelectedItem(collaboration.byId("idChatList").getItems()[0]);
                    }
                    oCollaborationModel.refresh(true);
                }
            }.bind(this),
                function (oData) { }.bind(this));
        },
        onVoiceAssistant: function () {
            var oChatBotModel = this.getModel("oChatBotModel");
            window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            if ('SpeechRecognition' in window) {
                const recognition = new window.SpeechRecognition();
                recognition.interimResults = true;
                let finalTranscript = '';
				/*    recognition.start = (event) => {
				       var helloMessage = "Hello" + oDefaultDataModel.getProperty("/loggedInUser") + "how can I help You?"
				       var msg = new SpeechSynthesisUtterance(helloMessage);
				       window.speechSynthesis.speak(msg);
				   }*/
				/*this.getView().byId("idVoiceAssistant").addEventListener('results', e => {
				   console.log(e);
				})*/
                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    const speechToText = event.results[0][0].transcript;
                    // oDefaultDataModel.setProperty("/voiceData", speechToText); k
                    for (let i = event.resultIndex, len = event.results.length; i < len; i++) {
                        let transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                            finalTranscript = finalTranscript[0].toUpperCase() + finalTranscript.substring(1);
                            console.log(finalTranscript + "....")
                            this.sendChatBotMsg(null, finalTranscript);
                        }
                    }
                }
                recognition.start();
            } else {
                // speech recognition API not supported
            }
        },
        fnCloseOnLogout: function () {
            var oCollaborationModel = this.getOwnerComponent().getModel("oCollaborationModel");
            this.getView().setModel(oCollaborationModel, "oCollaborationModel");
            var sUserId = that.oAppModel.getProperty("/loggedInUserDetails/userId");
            var sTime = String(new Date().getTime());
            var sUrl = "/ActJavaService/chat/logout/" + sUserId + "/" + sTime;
            this.doAjax(sUrl, "GET", null, function (oData) { }.bind(this), function (oError) { }.bind(this));
        },
        sendChatBotMsg: function (oEvent, voiceMessage) {
            var oChatBotModel = this.getModel("oChatBotModel");
            this.scrollBottom("ID_CHATBOT_SCROLLBAR", this);
            var message;
            if (!voiceMessage) {
                message = oChatBotModel.getProperty("/sTypedMessage");
            } else {
                message = voiceMessage;
            }
            if (!message.trim()) {
                return;
            }
            var chatBotMessages = oChatBotModel.getProperty("/messages");
            var oMsg = {
                "type": "text",
                "content": message,
                "sentBy": "USER",
                "sentAt": new Date()
            };
            chatBotMessages.push(oMsg);
            oChatBotModel.setProperty("/sTypedMessage", "");
            this.getBotReply(message);
            oChatBotModel.refresh(true);
        },
        getBotReply: function (message) {
            var oLoggedInUser = this.oAppModel.getProperty("/loggedInUserDetails");
            var oChatBotModel = this.getModel("oChatBotModel");
            var sHeaderName = oChatBotModel.getProperty("/sHeaderName");
            var sHeaderValue = oChatBotModel.getProperty("/sHeaderValue");
            var bMuteAudio = oChatBotModel.getProperty("/bMuteAudio");
            oChatBotModel.setProperty("/typing", true);
            if (message.length > 0) {

                var _data = {
                    "message": {
                        "type": "text",
                        "content": message
                    },
                    "conversation_id": oChatBotModel.getProperty("/_randomNumber"),
                    "log_level": "info",
                    "merge_memory": true,
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
                    }
                };
                var url = "https://" + "api.cai.tools.sap/build/v1/dialog";
                this.doAjax(url, "POST", _data, function (data) {
                    var messageData = data.results.messages;
                    for (var i = 0; i < messageData.length; i++) {
                        if (messageData[i].type === "text") {
                            var sText = messageData[i].content;
                            if (sText === "No tasks available ." || sText === "Error occured while taking action . Please Try Again." || sText ===
                                "No tasks to selected . Please try again." || sText === "Incorrect choice. Please try again.") {
                                messageData = messageData.splice(i, messageData.length - (i + 1));
                            }
                        }
                    }
                    var chatBotMessages = oChatBotModel.getProperty("/messages");
                    if (messageData.length > 0) {
                        messageData[0].sentAt = new Date();
                        messageData[messageData.length - 1].showAvatar = true;
                        oChatBotModel.setProperty("/messages", chatBotMessages.concat(messageData));
                        oChatBotModel.setProperty("/aMessageDetails", messageData); //added by karishma
                        if (!bMuteAudio) {
                            if ('speechSynthesis' in window) {
                                // Speech Synthesis supported
                                // alert("your browser support text to speech!");
                                var msg = new SpeechSynthesisUtterance();
                                for (var j = 0; j < messageData.length; j++) {
                                    if (messageData[j].type === "text") {
                                        if (messageData[j].content[0] !== "1") {
                                            msg.text = messageData[j].content;
                                            window.speechSynthesis.speak(msg);
                                        }
                                        if (messageData[j].content === "Choose a process: ") {
                                            break;
                                        }
                                    } else if (messageData[j].type === "quickReplies") {
                                        msg.text = messageData[j].content.title;
                                        window.speechSynthesis.speak(msg);
                                    }
                                }
                            } else {
                                // Speech Synthesis Not Supported
                                alert("Sorry, your browser doesn't support text to speech!");
                            }
                        }
                        messageData[0].sentAt = new Date();
                        messageData[messageData.length - 1].showAvatar = true;
                        oChatBotModel.setProperty("/messages", chatBotMessages.concat(messageData));
                        for (var k = 0; k < messageData.length; k++) {
                            if (messageData[k].type === "quickReplies") {
                                if (messageData[k].content.title === "Confirm approve ?" || messageData[k].content.title === "Confirm Approve ?" ||
                                    messageData[k].content.title === "Confirm reject ?" || messageData[k].content.title === "Confirm Reject ?" ||
                                    messageData[k].content.title === "Confirm claim ?" || messageData[k].content.title === "Confirm Claim ?" ||
                                    messageData[k].content.title === "Confirm release ?" || messageData[k].content.title === "Confirm Release ?") {
                                    var sInstanceId = data.results.conversation.memory.instanceId;
                                    this.fnGetAuthenticationHeader(sInstanceId, messageData[k].content.title);
                                }
                            }
                        }
                    }
                    oChatBotModel.setProperty("/typing", false);
                    this.scrollBottom("ID_CHATBOT_SCROLLBAR", this);
                    oChatBotModel.refresh(true);
                }.bind(this),
                    function (oData) {
                        oChatBotModel.setProperty("/typing", false);
                    }.bind(this), {
                    // "Authorization": oChatBotModel.getProperty("/requestToken"),
                    "Authorization": "Token fa8cc47c375a79093e08a25d3917daf3", //DEV TOKEN
                    // "Authorization": "Token 644c7f9508ef2d2f6e5e584cda426c55", //QA TOKEN
                    "x-uuid": ""
                });
            }
        },
        fnGetAuthenticationHeader: function (sInstanceId, sMessage) {
            var oChatBotModel = this.getModel("oChatBotModel");
            var sTerm = "";
            if (sMessage === "Confirm claim ?" || sMessage === "Confirm Claim ?") {
                sTerm = "claimId";
            } else if (sMessage === "Confirm release ?" || sMessage === "Confirm Release ?") {
                sTerm = "releaseId";
            } else {
                sTerm = "id";
            }
            var url = "/BotAuthenticationService/get?" + sTerm + "=" + sInstanceId;
            this.doAjax(url, "GET", null, function (oData) {
                oChatBotModel.setProperty("/sHeaderName", oData.headerName);
                oChatBotModel.setProperty("/sHeaderValue", oData.headerValue);
            }.bind(this), function (oEvent) { }.bind(this));
        },
        chatbotAudio: function () {
            var oChatBotModel = this.getModel("oChatBotModel");
            var bMuteAudio = oChatBotModel.getProperty("/bMuteAudio");
            if (bMuteAudio) {
                oChatBotModel.setProperty("/bMuteAudio", false);
            } else {
                oChatBotModel.setProperty("/bMuteAudio", true);
            }
        },
        uploadBase64Format: function (oEvent, rSuccess) {
            var aFiles = oEvent.getParameter("files");
            for (var i = 0; i < aFiles.length; i++) {
                var reader = new FileReader();
                var fileType = aFiles[0].name.split(".").pop();
                var file = {
                    "fileType": fileType.toLocaleLowerCase(),
                    "fileName": aFiles[i].name.slice(0, -fileType.length - 1),
                    "fileSize": aFiles[i].size,
                    "filebase64Format": "",
                    "fullFile": "",
                    "fileContent": aFiles[i]
                };
                reader.onload = function (oEvt) {
                    this.fullFile = oEvt.target.result;
                    this.filebase64Format = oEvt.target.result.split(",")[1];
                    if (rSuccess === undefined)
                        rSuccess = null;
                    else
                        rSuccess(this);
                }.bind(file);
                reader.readAsDataURL(aFiles[i]);
            }
        },
        downloadAttachment: function (attachmentId, fileType, fileName, base64File, fileSize, bDownloadAll, encodedFile, isChat) {
            if (fileType.split("/").length === 1) {
                fileType = fileType.toLocaleLowerCase();
                fileType = "application/" + fileType;
            }
            var extension = fileType.split("/")[1];
            if (extension === "png" || extension === "jpeg" || extension === "jpg") {
                if (!this._oImageViewer) {
                    this._oImageViewer = this._createFragment("oneapp.incture.workbox.fragment.ImageViewer", this);
                    this.getView().addDependent(this._oImageViewer);
                }
                this._oImageViewer.open();
            }
            var rSuccess = function (base64) {
                var extension = fileType.split("/")[1];
                if (!this.oAppModel.getProperty("/previewImage") && (extension === "png" || extension === "jpeg" || extension === "jpg")) {
                    this.oAppModel.setProperty("/previewImage", true);
                    this.openImageViewer(base64, fileName, extension, fileType, fileSize);
                } else {
                    var u8_2 = new Uint8Array(atob(base64).split("").map(function (c) {
                        return c.charCodeAt(0);
                    }));
                    var blob = new Blob([u8_2], {
                        type: fileType,
                        name: fileName + "." + extension
                    });
                    var url = window.URL.createObjectURL(blob);
                    if (extension === "pdf") {
                        window.open(url, "DownloadedFile." + extension, "width=900px, height=600px, scrollbars=yes", true);
                    } else {
                        var a = document.createElement("a");
                        document.body.appendChild(a);
                        a.style = "display: none";
                        a.href = url;
                        a.download = fileName + "." + extension;
                        a.click();
                    }
                }
            }.bind(this);
            if (attachmentId) {
                if (isChat) {
                    var url = "/ActJavaService/message/getDocumentByID/" + attachmentId;
                    this.doAjax(url, "GET", null, function (oData) {
                        rSuccess(oData.data.encodedFileContent);
                    }.bind(this), function (oError) { }.bind(this));
                } else {
                    var url = "/oneappinctureworkbox/WorkboxJavaService/detailPage/getOriginalAttachment/" + attachmentId;
                    this.doAjax(url, "GET", null, function (oData) {
                        rSuccess(oData.encodedFileContent);
                    }.bind(this), function (oError) { }.bind(this));
                }
            } else {
                rSuccess(base64File);
            }
        },
        // navigateToTaskDetail: function (id) {
        // 	var url = "/oneappinctureworkbox/WorkboxJavaService/inbox/filterService";
        // 	var filterData = {
        // 		"quickFilter": {
        // 			"eventId": id
        // 		},
        // 		"inboxType": "AdminInbox"
        // 	};
        // 	this.doAjax(url, "POST", filterData, function (oData) {
        // 		if (oData.workBoxDtos && oData.workBoxDtos.length === 1) {
        // 			this.oAppModel.setProperty("/taskObjectDetails", oData.workBoxDtos[0]);
        // 			this.setCurrentPage("MyInbox", "MyInbox", "My Task", true, true);
        // 			this.removeAllTokens();
        // 			sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().checkNewTaskDetailTab();
        // 		} else {
        // 			this._showToastMessage(oData.responseMessage.message);
        // 		}
        // 	}.bind(this), function (oEvent) {}.bind(this));
        // },
        navigateToTaskDetail: function (oNotification) {
            var url = "/oneappinctureworkbox/WorkboxJavaService/inbox/filterService";
            var filterData;
            if (oNotification.notificationType === "Reject" || oNotification.notificationType === "Approve") {
                filterData = {
                    "quickFilter": {},
                    "inboxType": "CompletedTasks",
                    // "page": "1",
                    "advanceFilter": {
                        "advanceSearch": "",
                        "filterMap": {
                            "pe.REQUEST_ID": {
                                "operator": "AND",
                                "condition": "contains",
                                "value": oNotification.title,
                                "upperLimit": "",
                                "lowerLimit": "",
                                "dataType": "STRING",
                                "level": "pe"
                            }
                        }
                    },
                    // "sortingDtos": [{
                    // 	"orderBy": "completedAt",
                    // 	"orderType": "DESC"
                    // }]
                }
            } else {
                filterData = {
                    "quickFilter": {
                        "eventId": oNotification.id
                    },
                    "inboxType": "AdminInbox"
                };
            }
            this.doAjax(url, "POST", filterData, function (oData) {
                if (oData.workBoxDtos && oData.workBoxDtos.length === 1) {
                    this.oAppModel.setProperty("/taskObjectDetails", oData.workBoxDtos[0]);
                    this.setCurrentPage("MyInbox", "MyInbox", "My Task", true, true);
                    this.removeAllTokens();
                    sap.ui.core.UIComponent.getRouterFor(this).getView('oneapp.incture.workbox.view.UnifiedInbox').getController().checkNewTaskDetailTab();
                } else {
                    this._showToastMessage(oData.responseMessage.message);
                }
            }.bind(this), function (oEvent) { }.bind(this));
        },

        /*************** End of collaboration changes********************/
        // Common function for manage filter/tile
        fetchSavedFilters: function () {
            var adminTiles = [],
                userTiles = [],
                savedFilters = [],
                activeDashboardTiles = 0;
            var oAdvanceFilterModel = this.getModel("oAdvanceFilterModel");
            oAdvanceFilterModel.setProperty("/manageFilterBusy", true);
            // oAdvanceFilterModel.setProperty("/adminTiles", adminTiles);
            oAdvanceFilterModel.setProperty("/activeDashboardTiles", activeDashboardTiles);
            // oAdvanceFilterModel.setProperty("/userTiles", userTiles);
            if (oAdvanceFilterModel.getProperty("/manageFilterBusyAdmin") === undefined) {
                oAdvanceFilterModel.setProperty("/manageFilterBusyAdmin", true);

            }
            var url = "/oneappinctureworkbox/WorkboxJavaService/userCustomFilter/getFilters";
            this.doAjax(url, "GET", null, function (oData) {
                var i, noDataText = true;
                for (i = 0; i < oData.length; i++) {
                    if (oData[i].isTile) {
                        if (oData[i].userId === "ADMIN") {
                            adminTiles.push(oData[i]);
                        } else {
                            userTiles.push(oData[i]);
                            if (oData[i].isActive) {
                                activeDashboardTiles++;
                            }
                        }
                    }
                    if (oData[i].userId !== "ADMIN") {
                        savedFilters.push(oData[i]);
                    }
                }
                oAdvanceFilterModel.setProperty("/adminTiles", adminTiles);
                oAdvanceFilterModel.setProperty("/userTiles", userTiles);
                oAdvanceFilterModel.setProperty("/savedFilters", savedFilters);
                oAdvanceFilterModel.setProperty("/activeDashboardTiles", activeDashboardTiles);
                oAdvanceFilterModel.setProperty("/templateSavedFilters", jQuery.extend(true, [], savedFilters));
                oAdvanceFilterModel.setProperty("/manageFilterBusyAdmin", false);
                oAdvanceFilterModel.setProperty("/manageFilterBusy", false);
                oAdvanceFilterModel.refresh(true);
            }.bind(this),
                function (oEvent) { }.bind(this));
        },
    });
});
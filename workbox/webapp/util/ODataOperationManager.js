sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/base/Object"

], function (JSONModel, ODataModel, Object) {
	"use strict";

	/**
	 * Constructor
	 */
	var requestAppModel = Object.extend("oneapp.incture.workbox.util.ODataOperationManager", {
		_oDataModel: null,
		_oComponent: null,
		oJsonModel: new sap.ui.model.json.JSONModel(),
		constructor: function (oComponent, oModelName) {
			this._oComponent = oComponent;
			if (oModelName === "") {
				this._oDataModel = oComponent.getModel();
			} else {
				this._oDataModel = oComponent.getModel(oModelName);
			}

			//enable error handlr once odata model or mock data is implemented
			//this.ErrorHandler = new ErrorHandler(this._oComponent);
		}
	});

	requestAppModel.prototype.getJson = function () {
		return this.oJsonModel;
	};
	requestAppModel.prototype.getOdataModel = function () {
		return this._oDataModel;
	};

	/*
	 * Method to set/remove busy Indicator
	 *
	 * @param bParam - Boolian Parameter- true to enable Busy - false to disable busy Indicator.
	 * @param iDelay - Number Parameter - will saet the deley for Busy Indicator.
	 * @public
	 */
	/*	requestAppModel.prototype.busyIndicatorDisplay = function(bParam,iDelay) {
			if(iDelay === null || iDelay === undefined || iDelay < 0) {
				iDelay = 0;
			}
			this._oComponent.getRootControl().getModel("appView").setProperty("/delay",iDelay);
			this._oComponent.getRootControl().getModel("appView").setProperty("/busy",bParam);
		};*/
	/*
	 * Method to read an oData Entity
	 *
	 * @param fSuccess - Success callback. OData model returned as parameter.
	 * @param fError - Error callback. Error object returned as parameter.
	 * @public
	 */
	requestAppModel.prototype.readData = function (sUrl, oParameters, fSuccess, fError) {
		this._oDataModel.read(encodeURI(sUrl), {
			urlParameters: oParameters,
			success: function (oData, res) {
				//Result has .results for Entitysets but not for queries
				if (fSuccess) {
					fSuccess(oData, res);
				}
			},
			error: function (oError) {
				fError(oError);
			}
		});
	};

	requestAppModel.prototype.deleteOdata = function (sUrl, fSuccess, fError) {
		this._oDataModel.remove(encodeURI(sUrl), {
			method: "DELETE",
			success: function (data) {},
			error: function (oError) {
				fError(oError);
			}
		});
	};

	/*
	 * Method to Create the  the OData service.
	 * @param oData - Data passed for the creation
	 * @param fSuccess - Success callback. OData model returned as parameter.
	 * @param fError - Error callback. Error object returned as parameter.
	 * @public
	 */
	requestAppModel.prototype.createoData = function (sUrl, oData, fSuccess, fError) {
		this._oDataModel.create(sUrl, oData, {
			success: function (data, res) {
				fSuccess(data, res);
			},
			error: function (error) {
				fError(error);
			}
		});
	};

	requestAppModel.prototype.updateoData = function (sUrl, oData, fSuccess, fError) {
		this._oDataModel.update(sUrl, oData, {
			success: function (data, res) {
				fSuccess(data, res);
			},
			error: function (error) {
				fError(error);
			}
		});
	};

	requestAppModel.prototype.updateoDataBatch = function (sUrl, oData, mParam) {
		this._oDataModel.update(sUrl, oData, mParam);
	};

	requestAppModel.prototype.createoDataBatch = function (sUrl, oData, mParam) {
		this._oDataModel.create(sUrl, oData, mParam);
	};

	requestAppModel.prototype.submitChangeVisaBatch = function (sGroupId) {
		this._oDataModel.setDeferredGroups([sGroupId]);
		this._oDataModel.submitChanges({
			batchGroupId: sGroupId
		}, function (oData) {}, function (oError) {});
	};

	/*
	 *
	 *
	 * @param fSuccess - Success callback. OData model returned as parameter.
	 * @param fError - Error callback. Error object returned as parameter.
	 * @public
	 */
	requestAppModel.prototype.callFunction = function (sAgency, sDbKey, sPurpose, fSuccess, fError) {
		var sUrl = "";
		var oParameter = {
			"param1": sAgency,
			"interaction_purpose": sPurpose,
			"db_key": sDbKey
		};
		var mParamter = {
			method: "POST",
			urlParameters: oParameter,
			success: function (oData) {
				fSuccess(oData);
			},
			error: function (oError) {
				fError(oError);
			}
		};
		this._oDataModel.callFunction(encodeURI(sUrl), mParamter);
	};
	return requestAppModel;
});
jQuery.sap.require("sap.ui.core.Renderer");
jQuery.sap.require("sap.m.TableRenderer");
sap.ui.core.Renderer.extend("com.jabil.surveyform.controls.TabbingTableRenderer", sap.m.TableRenderer);
jQuery.sap.declare('com.jabil.surveyform.controls.TabbingTable');

sap.m.Table.extend("com.jabil.surveyform.controls.TabbingTable", {
	init: function() {
		sap.m.Table.prototype.init.apply(this, arguments);
		this.addEventDelegate({
			onAfterRendering: this.setupTabHandling
		}, this);
	},

	setupTabHandling: function() {
		var that = this,
		oDomTable = this.$(),
		aRows = this.getItems(),
		i;
        $("input:text:visible:first").focus();  //focus on 1st input field.

		oDomTable.focusin(function() {
			// remember current focused cell
			jQuery.sap.delayedCall(100, null, function() {
				// find the focused input field
				var oField = (oDomTable.find('.sapMInputFocused')[0] || oDomTable.find('.sapMFocus')[0]);
				if (oField) {
					// store ID of focused cell
					that._FieldID = oField.id;
				}else{
					that._FieldID = (sap.ui.getCore().newFocus || ($( document.activeElement )[0].getAttribute("id")).replace("-inner","") );
					delete sap.ui.getCore().newFocus;
				}
			});
		});
		// on TAB press - navigate one field forward
		oDomTable.on("keydown", function(oEvt) {
			$.sap.log.debug("Table keydown", [oEvt.which, that._FieldID]);
			if (oEvt.which != jQuery.sap.KeyCodes.TAB || !that._FieldID) {
				// Not a tab key or no field focused
				return;
			}

			var oSelectedField = sap.ui.getCore().byId(that._FieldID);
            var oRow = oSelectedField.getParent();
            if(oRow.getCells === undefined) {
                var oCells = oRow.getParent().getCells();
                var aRows = oRow.getParent().getParent().getItems();
            } else {
                
                var oCells = oRow.getCells();
                var aRows = oRow.getParent().getItems();
            }
			
			var iItems = aRows.length;

			var mInputInfo = that.getInputFieldIndices(oCells);

			var oTargetCell, thisInput, thisRow;
            if(oRow.getCells === undefined) {
                thisInput = oRow.getParent().indexOfCell(oSelectedField.getParent());
            } else {
                thisInput = oRow.indexOfCell(oSelectedField);
            }
            

			var bIsFirstEditableCell = thisInput <= mInputInfo.iFirstInput;
            var bIsLastEditableCell = thisInput >= mInputInfo.iLastInput;
            if(oRow.getCells === undefined) {
                thisRow = that.indexOfItem(oRow.getParent());
            } else {
                thisRow = that.indexOfItem(oRow);
            }
			
			var bIsFirstRow = thisRow <= 0;
			var bIsLastRow = thisRow >= iItems - 1;

			if (!oEvt.shiftKey) {
				if (!bIsLastEditableCell || bIsLastRow) {
					// 1. Tabbing to next input field within a row works, no need to handle it here
					// 2. last row: Let default handling take care of focusing the next element after the table
					return;
				}else{
					mInputInfo = that.getInputFieldIndices(aRows[thisRow + 1].getCells());
				}
				// jump to next row
				oTargetCell = aRows[thisRow + 1].getCells()[mInputInfo.iFirstInput];
			} else {
				if (mInputInfo.selFieldIndex !== mInputInfo.iLastInput && !bIsFirstEditableCell || bIsFirstRow) {
					// 1. Tabbing to previous input field within a row works, no need to handle it here
					// 2. First row: Let default handling take care of focusing the previous element before the table
					return;
				}
				// jump to previous row
				oTargetCell = aRows[thisRow - 1].getCells()[mInputInfo.iLastInput];
			}
			oTargetCell.focus();
			//console.log("Value = "+oTargetCell.getValue()+", ID = "+oTargetCell.getId());
			// Prevent any subsequent handling of this key press
			oEvt.preventDefault();
			oEvt.stopPropagation();
		});
	},

	getInputFieldIndices: function(aCells) {
		var mInputInfo = {
				aIndices: []
		};
		// get index of first and last input fields of table row
		for (var i = 0; i < aCells.length; i++) {
			var field = aCells[i];
			if (field.getMetadata()._sClassName !== "sap.m.Text") {
				mInputInfo.aIndices.push(i);
				if (typeof mInputInfo.iFirstInput === "undefined") {
					mInputInfo.iFirstInput = i;
				}
				mInputInfo.iLastInput = i;
			}
		}
		return mInputInfo;
	}
});
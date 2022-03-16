jQuery.sap.declare("InboxDetail.util.formatter");
jQuery.sap.require("sap.ui.core.format.NumberFormat");

InboxDetail.util.formatter = {

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
    stringToArrays: function(stringValue){
        if(stringValue){
            var a= [];
            var stringlistLen = stringValue.length;
            if(stringlistLen === 1){
                a.push(stringValue);
            } else if(stringlistLen > 1){
for(var i=0; i<stringlistLen;i++){
    a.push(stringValue[i]);
}
            }
        }
        return a;
    },
    fnEnableRetriggerBtn:function(oVal){
      if(oVal == "In_Progress"){
          return true;
      }else{
          return false;
      }

    },
    fnMaskInput: function (oVal) {
        var l1,l2;
        l1 = 6;
        l2 = 4;
        return oVal.replace(/\d{6}(\d{4})/, "XXXXXX$1");
    },
    fnEnableActnBtn: function (oVal) {
        if (oVal == "In Progress") {
            return false;
        } else {
            return true;
        }
    },
    fnRepresntOtherComp: function (oVal) {
        if (oVal == true) {
            return oVal;
        } else {
            return false;
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
    fnFormatRadioBtnTxt: function (oVal) {
        if (oVal == true) {
            return "Yes";
        } else {
            return "No";
        }
    },
    selectColumn: function (oVal) {
        if (oVal === "true") {
            return true;
        } else if (oVal === "false") {
            return false;
        }
    },
    fnFormatRadioBtnSelect: function (oVal) {
        if (oVal == true) {
            return 0;
        } else if (oVal == false) {
            return 1;
        } else {
            return -1;
        }
    },
    fnFetchDescription(value, vField) {
        var aArray = [];
        if (vField == "COMPANY_CODE") {
            aArray = this.oParent.oParent.oParent.oParent.oParent.oParent.getModel("oBPLookUpMdl").getData().CompanyCode;
        } else if (vField == "COUNTRY") {
            aArray = this.oParent.oParent.oParent.oParent.oParent.oParent.getModel("oBPLookUpMdl").getData().Country;
        }

        if (aArray) {
            if (value) {
                var item = aArray.find(item => item.code == value);
                if (item) {
                    return item.description;
                } else {
                    return "";
                }

            } else {
                return "";
            }
        } else {
            return "";
        }
    },


};
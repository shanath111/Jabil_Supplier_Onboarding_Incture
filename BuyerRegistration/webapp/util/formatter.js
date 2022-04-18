jQuery.sap.declare("ns.BuyerRegistration.util.formatter");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ui.core.format.DateFormat");

ns.BuyerRegistration.util.formatter = {

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
    ErrorLine: function (status) {
     
        var id = this.oParent.oParent.sId;
        var cid = this.oParent.sId;
      //  sap.ui.getCore().byId(id).addStyleClass("whiteColorLine");
        if (status == true) {
         //   sap.ui.getCore().byId(id).removeStyleClass("whiteColorLine");
          //  sap.ui.getCore().byId(id).addStyleClass("errorColorLine");
            return true;
        }

        else {
            // sap.ui.getCore().byId(id).removeStyleClass("errorColorLine");
            // sap.ui.getCore().byId(id).addStyleClass("whiteColorLine");
            return false;
        }
    },
    fnSearchResultErrorMandt: function (val) {
        if (val) {
            return false;
        } else {
            return true;
        }
    },
    fnSearchResultErrorBlock: function (val) {
        if (val) {
            return true;
        } else {
            return false;
        }
    },
    fnSearchResultErrorRelInd: function (val) {
        if (val == "PRIMARY") {
            return false;
        } else {
            return true;
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
    fnFormatConfidentialInfo: function (val) {
        if (val) {
            val = val.replace(/.(?=.{4})/g, '*');
        } else {
            val = "938883939393"
            val = val.replace(/.(?=.{4})/g, '*');
        }
        return val;

    },

    mediaTypeformatter: function (type) {
        if (type) {
            var mediaType = type.toLowerCase();
            if (mediaType == "txt") {
                return "sap-icon://attachment-text-file";
            } else if (mediaType == "pdf") {
                return "sap-icon://pdf-attachment";
            } else if (mediaType == "jpg") {
                return "sap-icon://attachment-photo";
            } else if (mediaType == "png") {
                return "sap-icon://attachment-photo";
            } else if (mediaType == "mp4") {
                return "sap-icon://attachment-video";
            } else if (mediaType == "xlsx") {
                return "sap-icon://excel-attachment";
            } else if (mediaType == "csv") {
                return "sap-icon://excel-attachment";
            } else if (mediaType == "pptx") {
                return "sap-icon://ppt-attachment";
            } else if (mediaType == "docx") {
                return "sap-icon://doc-attachment";
            } else if (mediaType == "zip") {
                return "sap-icon://attachment-zip-file";
            } else if (mediaType == "html") {
                return "sap-icon://attachment-html";
            } else if (mediaType == "exe") {
                return "sap-icon://attachment-html";
            }
        }
    },
    fnFetchDescription1: function (aArray, value) {
        if (aArray) {
            if (value) {
                var item = aArray.find(item => item.code == value);
                if (item) {
                    return item.description;
                } else {
                    return '---';
                }

            } else {
                return '---';
            }
        } else {
            return '---';
        }
    },
    // fnFetchDescMultiplePayment: function(aArray, value){
    //     if (aArray) {
    //                        if (value) {
    //                            var itemDesc ="";
    //                            for(var i=0;i<value.length;i++){
    //                            var item = aArray.find(item => item.code == value[i]);
    //                            if (item) {
    //                             itemDesc = itemDesc + item.description + ',';
    //                             }
    //                          } if(itemDesc){
    //                              return itemDesc.replace(/,([^,]*)$/, '$1')
    //                          }
    //                           else {
    //                             return '---';
    //                             }
                               
    //                        } else {
    //                           return '---';
    //                        }
    //                    } else {
    //                        return '---';
    //                    }
    //        },
    fnFetchDescMultiplePayment: function(aArray, value){
        if (aArray) {
                           if (value) {
                               var itemDesc ="";
                               for(var i=0;i<value.length;i++){
                               var item = aArray.find(item => item.code == value[i]);
                               if (item) {
                                itemDesc = itemDesc + item.description + ',';
                                }
                             } if(itemDesc){
                                 return itemDesc.replace(/,([^,]*)$/, '$1')
                             }
                              else {
                                return '---';
                                }
                               
                           } else {
                              return '---';
                           }
                       } else {
                           return '---';
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
        }
    // stringToArrays: function(stringValue){
    //     var a= [];
    //             if(stringValue){
                  
    //                 a = stringValue.split(",");
                 
    //             return a;
    //         }
    //     }
};
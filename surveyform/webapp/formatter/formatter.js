jQuery.sap.declare("com.jabil.surveyform.formatter.formatter");

com.jabil.surveyform.formatter.formatter = {

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
    formatYear: function (value) {
        return new Date(value);
    },
    fnCheckFirstItem: function (value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        //var oContext = this.oPropagatedProperties.oBindingContexts.modelSDNList.sPath.split("/")[1];
        if (Number(oContext) == 0) {
            return true;
        }
        return false;
    },
    fnCheckOtherItem: function (value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        //var oContext = this.oPropagatedProperties.oBindingContexts.modelSDNList.sPath.split("/")[1];
        if (Number(oContext) == 0) {
            return false;
        }
        return true;
    },

    fnCheckTaxType1: function(value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        if (Number(oContext) == 0) {
            return true;
        }
        return false;
    },
    fnCheckTaxType2: function(value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        if (Number(oContext) == 1) {
            return true;
        }
        return false;
    },
    fnCheckTaxType3: function(value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        if (Number(oContext) == 2) {
            return true;
        }
        return false;
    },
    fnCheckTaxType4: function(value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        if (Number(oContext) == 3) {
            return true;
        }
        return false;
    },
    fnCheckTaxType5: function(value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        if (Number(oContext) == 4) {
            return true;
        }
        return false;
    },
    fnCheckTaxType6: function(value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        if (Number(oContext) == 5) {
            return true;
        }
        return false;
    },
    fnCheckTaxType7: function(value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        if (Number(oContext) == 6) {
            return true;
        }
        return false;
    },
    fnCheckTaxType8: function(value) {
        if (value == "oDataModel") {
            var oContext = this.getBindingContext(value).sPath.split("/")[3];
        } else {
            var oContext = this.getBindingContext(value).sPath.split("/")[1];
        }
        if (Number(oContext) == 7) {
            return true;
        }
        return false;
    },
   


    fnFormatDate: function (oVal) {
        try {
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd"
            });
            var oFormattedVal = JSON.stringify(oVal).substr(1, 19);
            oFormattedVal = new Date(oFormattedVal);
            oFormattedVal = oDateFormat.format(oFormattedVal);
            return oFormattedVal;

        }
        catch (err) {

        }
    },
    fnFetchDescription: function(aArray, value){
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
     fnFetchAdditionalDescription: function(aArray, value){
 if (aArray) {
                    if (value) {
                        var item = aArray.find(item => item.code == value);
                        if (item) {
                            return item.additionalDescription;
                        } else {
                            return '';
                        }

                    } else {
                       return '';
                    }
                } else {
                    return '';
                }
    },
    fnFetchCode: function(aArray, value){
 if (aArray) {
                    if (value) {
                        var item = aArray.find(item => item.description == value);
                        if (item) {
                            return value + ' (' + item.code + ')';
                        } else {
                            return '';
                        }

                    } else {
                       return '';
                    }
                } else {
                    return '';
                }
    },
    stringToArrays: function(stringValue){
        if(stringValue){
            var a= [];
            var stringlistLen = stringValue.split("-").length;
            if(stringlistLen === 1){
                a.push(stringValue);
            } else if(stringlistLen > 1){
for(var i=0; i<stringlistLen;i++){
    a.push(stringValue.split("-")[i]);
}
            }
        }
        return a;
    }
};

/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    ZEROCONFIG = top.ZEROCONFIG,
    upload = $("#upload"),
    fileUrl = document.getElementById('fileUrl'),
    udo = document.getElementById('udo'),
    flagModelUpdated = 0,
    uploadErrObj = {
        "1": "LANG4144",
        "2": "LANG4145"
    };


String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;

$(function () {
    $P.lang(doc, true);
    ZEROCONFIG.init(initPageLoaded);
});

function initPageLoaded() {
    getVersionInfo();
    initUpload();
    createTable();
    console.log("createTable Finished");
    bindButtonEvent();
    top.Custom.init(doc);
}

function createTable() {
    console.log("createTable start");
    $("#model_list").empty();
    $("#model_list").jqGrid({ //set your grid id
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: 700, //specify width; optional
        height: "auto",
        postData: {
            "action": "fetchRemoteTemplateList"
        },

        colNames: ['Vendor', 'Model', 'Version (Remote/Local)', 'Size', 'Option'],

        colModel: [{
            name: 'vendor',
            index: 'vendor',
            // width: 200,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'model',
            index: 'model',
            // width: 200,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'version',
            index: 'version',
            // width: 150,
            resizable: false,
            align: "center",
            formatter: tansData,
            sortable: false
        }, {
            name: 'size',
            index: 'size',
            // width: 100,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],


        pager: '#model_pager', //set your pager div id
        multiselect: false,
        sortname: 'model', //the column according to which data is to be sorted; optional
        viewrecords: true, //if true, displays the total number of records, etc. as: "View X to Y out of Z” optional
        //sortorder: "asc", //sort order; optional
        noData: "No Model Available",
        // caption:"jqGrid Example" ,//title of grid
        rowNum: 16,
        jsonReader: {
            root: "response.template_list",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function () {
            $("#model_list .jqgrow:even").addClass("ui-row-even");
            top.dialog.clearDialog();
            if (flagModelUpdated == 1) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG4143")
                });
                flagModelUpdated = 0;
            }
        },
        gridComplete: function () {
            $P.lang(document, true);
            if (UCMGUI.config.msie) { // for ie
                $(".ui-pager-control > table.ui-pg-table").css("table-layout", "auto");
            }
            if (UCMGUI.config.mozilla) { // for firefox
                $("#model_list").setGridWidth(doc.documentElement.clientWidth - 50);
                $(".ui-pager-control > table.ui-pg-table").css("table-layout", "auto");
            }
            $("div#preparePad").hide();
            $("div.page-content").show();
            var source = $("#invalidModelWarning").html();
            ZEROCONFIG.connector.checkZeroConfigInvalidModels(source, false);
        }
    });
}


function tansData(cellvalue, version, rowObject) {
    var version = rowObject.version + "/-";
    var localmodel = top.zc.DataCollection.getModelByName(rowObject.vendor, rowObject.model);
    if (localmodel != undefined) {
        version = rowObject.version + "/" + localmodel.xmlVersion();
    }
    return version;
}





function createOptions(cellvalue, options, rowObject) {
    var upgrade = $("<button>").attr({
        "class": "options upgrade",
        "filename": rowObject.filename,
        "title": "Upgrade",
        "localetitle": "LANG61",
        "releasenotes": rowObject.update
    });

    var download = $("<button>").attr({
        "class": "options download",
        "filename": rowObject.filename,
        "title": "Download and Install",
        "localetitle": "LANG2465",
        "releasenotes": rowObject.update
    });

    var restore = $("<button>").attr({
        "class": "options restore",
        "filename": rowObject.filename,
        "title": "Restore",
        "localetitle": "LANG760",
        "releasenotes": rowObject.update
    });
    var invalidmodel = top.zc.DataCollection.getInvalidModelByName(rowObject.vendor, rowObject.model);
    if (invalidmodel != undefined) {
        return restore[0].outerHTML;
    }

    var localmodel = top.zc.DataCollection.getModelByName(rowObject.vendor, rowObject.model);
    if (localmodel != undefined) {
        if (localmodel.xmlVersion() == rowObject.version) {
            upgrade.addClass("disabled").css('cursor', 'default').attr('disabled', true);
        }
        return upgrade[0].outerHTML;
    }

    return download[0].outerHTML;
}

function bindButtonEvent() {
    $("#model_list")
        .delegate('.upgrade', 'click', function (ev) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });
            downloadReleaseNotes(this);
            ev.stopPropagation();
            return false;
        })
        .delegate('.download', 'click', function (ev) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });
            downloadReleaseNotes(this);
            ev.stopPropagation();
            return false;
        })
        .delegate('.restore', 'click', function (ev) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });
            downloadReleaseNotes(this);
            ev.stopPropagation();
            return false;
        });
}

function downloadModelTemplate(obj) {
    var filename = $(obj).attr("filename");

    if (!filename) {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG916")
        });
        return;
    } else {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG904")
        });
    }

    var action = {
        action: "fetchRemoteTemplatePackage",
        "model_template": filename
    };

    $.ajax({
        type: "POST",
        url: baseServerURl,
        data: action,
        success: function (data) {
            top.dialog.clearDialog();
            if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result') && data.response.result == 0) {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG3717")
                });
                flagModelUpdated = 1;
                ZEROCONFIG.reset();
                ZEROCONFIG.init(function () {
                    $('#model_list').trigger('reloadGrid');
                });
            } else {
                var message = $P.lang("LANG4144");

                if ( data.hasOwnProperty('response') && data.response.hasOwnProperty('result') ) {
                    if ( parseInt(data.response.result) < 0 ) {
                        if( uploadErrObj.hasOwnProperty(Math.abs(parseInt(data.response.result)).toString()) ){
                            message = $P.lang(uploadErrObj[ Math.abs(parseInt(data.response.result)).toString() ]);
                        }
                    }
                }

                top.dialog.dialogMessage({
                    type: 'error',
                    content: message
                });
            }
        }
    });
}

function initUpload() {
    var uploadObj = new AjaxUpload(upload, {
        action: baseServerURl + '?action=uploadfile&type=zc_model_package',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileUrl.value = file;
            // $P("#form_moh", document).valid();
        },
        onSubmit: function(file, ext) {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: function(file, data) {
            top.dialog.clearDialog();
            if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result') && data.response.result == 0) {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG3717")
                });
                flagModelUpdated = 1;
                ZEROCONFIG.reset();
                ZEROCONFIG.init(function () {
                    $('#model_list').trigger('reloadGrid');
                });
            } else {
                var message = $P.lang("LANG4144");

                if ( data.hasOwnProperty('response') && data.response.hasOwnProperty('result') ) {
                    if ( parseInt(data.response.result) < 0 ) {
                        if( uploadErrObj.hasOwnProperty(Math.abs(parseInt(data.response.result)).toString()) ){
                            message = $P.lang(uploadErrObj[ Math.abs(parseInt(data.response.result)).toString() ]);
                        }
                    }
                }

                top.dialog.dialogMessage({
                    type: 'error',
                    content: message
                });
            }
            fileUrl.value = "";
        }
    });

    udo.onclick = function() {
        var filename = $(fileUrl).val().toLowerCase();

        if (!filename) {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG910")
            });

            return false;
        }

        if (filename.endsWith('.pack')) {
            uploadObj.submit();
        } else {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG4120")
            });

            return false;
        }
    };
}

function downloadReleaseNotes(obj) {
    var releasenotes = $(obj).attr("releasenotes");
    if (!releasenotes) {
        downloadModelTemplate(obj);
        return;
    }

    var action = {
        action: "fetchRemoteReleaseNotes",
        "release_notes": releasenotes
    };

    $.ajax({
        type: "POST",
        url: baseServerURl,
        data: action,
        success: function (data) {
            var bool = UCMGUI.errorHandler(data, function () {
            });

            if (bool) {
                var source   = $("#releaseNotesTemplate").html();
                var template = Handlebars.compile(source);
                var response = data.response[0];
                var responsehtml = template(response);
                var flagReleaseNotes = response.updates.length > 0 ? 1 : 0;
                if(flagReleaseNotes){
                    top.dialog.clearDialog();
                    top.dialog.dialogConfirm({
                        confirmStr: responsehtml,
                        buttons: {
                            ok: function() {
                                downloadModelTemplate(obj);
                            },
                            cancel: function() {
                                return;
                            }
                        }
                    });
                }else{
                    downloadModelTemplate(obj);
                }
            }
        }
    });
}

function getVersionInfo() {
  var action = {
      action: "getZeroConfigVersionInfo"
  };

  $.ajax({
      type: "POST",
      url: baseServerURl,
      data: action,
      success: function (data) {
          var bool = UCMGUI.errorHandler(data, function () {
          });

          if (bool) {
              var version_info = data.response.zc_model;
              UCMGUI.domFunction.updateDocument(version_info, document);
          }
      }
  });
}

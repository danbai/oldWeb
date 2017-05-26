/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    fileType = 'user_recording',
    baseServerURl = config.paths.baseServerURl;

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG674"));

    initPage();
});

function initPage() {
    createTable();

    bindButtonEvent();
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnUpload', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4573").format($P.lang("LANG4722")),
                displayPos: "menupromptsDiv",
                frameSrc: "html/menuprompts_upload.html"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#batchDelete', 'click', function(ev) {

            var promptTable = $("#ivrprompts_list"),
                records = promptTable.getGridParam("records"),
                selected = promptTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                promptList = [],
                confirmList = [],
                i = 0,
                rowdata,
                rowName;

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG4722"))
                });

                return false;
            }

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG4722"))
                });

                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = promptTable.jqGrid('getRowData', selected[i]);

                rowName = rowdata['name'].split('</span>');

                promptList.push(rowName.length > 1 ? rowName[1] : rowName[0]);
            }


            for (i = 0; i < selectedRowsLength; i++) {
                confirmList.push("<font>" + promptList[i] + "</font>");
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG4722"), confirmList.join('<br />')),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG4722"))
                        });

                        var doSelected = function() { // DELETE_SELECTED_RECORDING();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "removeFile",
                                    "type": fileType,
                                    "data": promptList.join(",,")
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    // top.dialog.dialogMessage({
                                    //     type: 'error',
                                    //     content: errorThrown
                                    // });
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data);

                                    if (bool) {
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG871"),
                                            callback: function() {
                                                jumpPageOrNot(selectedRowsLength);
                                            }
                                        });
                                    }
                                }
                            });
                        };

                        setTimeout(doSelected, 100);
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#deleteAll', 'click', function(ev) {

            var records = $("#ivrprompts_list").getGridParam("records");

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG4722"))
                });

                return false;
            } else {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG840"),
                    buttons: {
                        ok: sendDeleteRequest
                    }
                });
            }

            ev.stopPropagation();
            return false;
        });

    $("#ivrprompts_list")
        .delegate('.play', 'click', function(ev) {
            var filename = $(this).attr("filename");

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4723").format($P.lang("LANG4722"), filename),
                displayPos: "playFile_content",
                frameSrc: "html/menuprompts_record_modal.html?mode=playRecord&item={0}".format(encodeURIComponent(filename))
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var filename = $(this).attr('filename');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(filename),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: "/cgi",
                            async: false,
                            data: {
                                "action": "checkFile",
                                "type": fileType,
                                "data": filename
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                top.dialog.clearDialog();

                                // top.dialog.dialogMessage({
                                //     type: 'error',
                                //     content: errorThrown
                                // });
                            },
                            success: function(data) {
                                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                                    $.ajax({
                                        type: "post",
                                        url: "/cgi",
                                        data: {
                                            "action": "removeFile",
                                            "type": fileType,
                                            "data": filename
                                        },
                                        error: function(jqXHR, textStatus, errorThrown) {
                                            top.dialog.clearDialog();

                                            // top.dialog.dialogMessage({
                                            //     type: 'error',
                                            //     content: errorThrown
                                            // });
                                        },
                                        success: function(data) {
                                            if (data.status == 0) {
                                                top.dialog.dialogMessage({
                                                    type: 'success',
                                                    content: $P.lang("LANG871"),
                                                    callback: function() {
                                                        jumpPageOrNot(1);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    top.dialog.dialogMessage({
                                        type: 'error',
                                        content: $P.lang("LANG3868")
                                    });
                                }
                            }
                        });
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate(".download", "click", function(ev) {
            var filename = $(this).attr("filename");

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "checkFile",
                    "type": fileType,
                    "data": filename
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                        window.open("/cgi?action=downloadFile&type=" + fileType + "&data=" + encodeURIComponent(filename), '_self');
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG3868")
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });
}

function createName(cellvalue, options, rowObject) {
    if (options.colModel.name == 'n') {
        var pointIndex = cellvalue.lastIndexOf('.'),
            filename = cellvalue.slice(0, pointIndex);

        return $('<span />').text(filename).html();
    } else if (options.colModel.name == 'name') {
        return rowObject.n;
    }
}

function createOptions(cellvalue, options, rowObject) {
    var sObjectName = rowObject.n,
        hasComma = (sObjectName.indexOf(',') > -1),
        hasWAV = sObjectName.endsWith(".wav"),
        hasMP3 = sObjectName.endsWith(".mp3"),
        downloadAttr,
        playAttr,
        play,
        del;

    playAttr = hasComma ?
        'localetitle="LANG2148" class="options play disabled" disabled' :
        (hasWAV || hasMP3) ?
        'localetitle="LANG777" class="options play"' :
        'localetitle="LANG777" class="options play disabled" disabled';
    downloadAttr = hasComma ?
        'localetitle="LANG2148" class="options download disabled" disabled' :
        'localetitle="LANG759" class="options download"';

    del = ('<button filename="' + sObjectName + '" title="Delete" localetitle="LANG739" class="options del"></button>');
    play = ('<button filename="' + sObjectName + '" title="Play" ' + playAttr + '></button>');
    download = ('<button filename="' + sObjectName + '" title="Download" ' + downloadAttr + '></button>');

    // return (play + del);
    return (download + del);
}

function createTable() {
    $("#ivrprompts_list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            'action': "listFile",
            'type': fileType,
            'filter': JSON.stringify({
                'list_dir': 0,
                'list_file': 1,
                'file_suffix': ["mp3", "wav", "gsm", "ulaw", "alaw"]
            })
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'n',
            index: 'n',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createName
        }, {
            name: 'name',
            index: 'name',
            width: 100,
            resizable: false,
            align: "center",
            hidden: true,
            formatter: createName
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#ivrprompts_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'd',
        noData: 'LANG129 LANG4722',
        jsonReader: {
            root: 'response.user_recording',
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#ivrprompts_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#ivrprompts_list"),
        totalPage = table.getGridParam("lastpage"),
        page = table.getGridParam("page"),
        reccount = table.getGridParam("reccount");

    if (page === totalPage && totalPage > 1 && reccount === selectedRows) {
        table.setGridParam({
            page: totalPage - 1
        }).trigger('reloadGrid');
    } else {
        table.trigger('reloadGrid');
    }
}

function sendDeleteRequest() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG877")
    });

    var action = {
        "action": "removeFile",
        "type": fileType,
        "data": '*'
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                setTimeout(function() {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG871"),
                        callback: function() {
                            window.location.reload();
                        }
                    });
                }, 200);
            }
        }
    });
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
        }

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

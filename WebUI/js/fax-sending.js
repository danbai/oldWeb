/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = config.paths.baseServerURl,
    mWindow = top.frames['frameContainer'].frames['mainScreen'], // this will be the main window
    upload = $("#upload"), // local upload firmware
    fileUrl = document.getElementById('fileUrl'),
    udo = document.getElementById('importExtensions'),
    uploadObj = {},
    role = $P.cookie('role');

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4067"));

    initValidator();

    initSearchValidator();

    initUpload();

    list_progress();

    // load progress
    setTimeout(setProgress, 3000);

    bindButtonEvent();

    /*
     * Pengcheng Zou Added. Fixed bug 35261 in Firefox.
     */
    $(':text').val('');
});

function bindButtonEvent() {
    $('.btn-save').click(function(event) {
        if (!$P("#form", document).valid()) {
            return;
        } else {
            var filename = fileUrl.value,
                filenameLowerCase = filename.toLowerCase(),
                id = $('#faxNum').val(),
                date = (new Date()),
                timestamp = (date.getTime() + "");

            key = parseInt(timestamp.slice(7));

            if (filenameLowerCase.endsWith('.pdf') || filenameLowerCase.endsWith('.tif') || filenameLowerCase.endsWith('.tiff')) {
                uploadObj._settings.action = '/cgi?action=uploadfile&type=SendFAX' +
                    '&id=' + id + '&key=' + key;

                uploadObj.submit();
            } else {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG4062")
                });
            }
        }

        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        return false;
    });

    $("#progress")
        .delegate('.del', 'click', function(ev) {
            var key = $(this).attr("key");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG3512"),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: baseServerURl,
                            data: {
                                "action": "deleteFaxRecords",
                                "key": key
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                top.dialog.clearDialog();

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
                                        content: $P.lang("LANG819")
                                    });

                                    jumpPageOrNot(1);
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
        });

    $("#search_all").on('click', function() {
        var txt = $P.lang("LANG3773");

        top.dialog.dialogMessage({
            type: "loading",
            title: txt,
            content: txt
        });

        $('#callee').val('');

        setTimeout(function() {
            delete $("#progress").getGridParam("postData")["callee"];

            $('#progress').setGridParam({
                page: 1
            }).trigger('reloadGrid');
        }, 200);

        return false;
    });

    $("#searchForm")
        .delegate('#btnDeleteAll', 'click', function(ev) {
            if (noRecords()) {
                return;
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG840"),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: baseServerURl,
                            data: {
                                "action": "deleteFaxRecords",
                                'username': $P.cookie('username')
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                top.dialog.clearDialog();

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
                                        content: $P.lang("LANG819")
                                    });

                                    $("#progress").setGridParam({
                                        page: 1
                                    }).trigger('reloadGrid');
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
        .delegate('#batchDeleteSelected', 'click', function(ev) {
            if (noRecords()) {
                return;
            }

            var faxTable = $("#progress"),
                selected = faxTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                faxFilesList = [],
                confirmList = [],
                divContainer = '',
                i = 0,
                rowdata;

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG4146").toLowerCase())
                });

                ev.stopPropagation();
                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = faxTable.jqGrid('getRowData', selected[i]);
                faxFilesList.push(rowdata['key']);
                confirmList.push("<font>" + rowdata['n'] + "</font>");
            }

            divContainer = '<div style="display: inline-block; max-height: 300px; text-align: left; overflow-y: auto;">' +
                confirmList.join('<br />') + '</div>';

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(divContainer),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG4146").toLowerCase())
                        });

                        var doSelected = function() { // DELETE_SELECTED_RECORDS();
                            $.ajax({
                                type: "post",
                                url: baseServerURl,
                                data: {
                                    "action": "deleteFaxRecords",
                                    "key": faxFilesList.toString()
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.clearDialog();

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
                                            content: $P.lang("LANG819")
                                        });

                                        jumpPageOrNot(selectedRowsLength);
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
        });
}

function createProgressBar(cellvalue, options, rowObject) {
    var progress = rowObject.process,
        progressbar;

    if ((progress < 100) && (progress >= 0)) {
        var id = (rowObject.key ? rowObject.key : rowObject.n);

        progressbar = '<div id="' + id + '" class="progressbar"><div id="' + id + '_label" class="progress-label"></div></div>';
    } else if (progress >= 100) {
        progressbar = '<font color="green" locale="LANG4125">' + $P.lang('LANG4125') + '</font>';
    } else {
        progressbar = '<font color="red" locale="LANG4089">' + $P.lang('LANG4089') + '</font>';
    }

    return progressbar;
}

function createUsername(cellvalue, options, rowObject) {
    var username = rowObject.username ?
        rowObject.username :
        ('<span locale="LANG2403">' + $P.lang('LANG2403') + '</span>');

    return username;
}

function createCallee(cellvalue, options, rowObject) {
    var callee = rowObject.callee ?
        rowObject.callee :
        ('<span locale="LANG2403">' + $P.lang('LANG2403') + '</span>');

    return callee;
}

function creaeSendstatus(callvalue, options, rowObject) {

    var send_status = rowObject.send_status ?
        rowObject.send_status :
        ('<span locale="LANG2403">' + $P.lang('LANG2403') + '</span>');

    return send_status;
}

function createOptions(cellvalue, options, rowObject) {
    var del = '<button key="' + rowObject.key + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return del;
}

function initUpload() {
    uploadObj = new AjaxUpload(upload, {
        action: '',
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
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                $("#progress").trigger('reloadGrid');

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG4063")
                });
            }

            fileUrl.value = "";
        }
    });
}

function initSearchValidator() {
    $("#searchForm").tooltip();

    $P("#searchForm", document).validate({
        rules: {
            "callee": {
                faxNumber: true,
                maxlength: 32
            }
        },
        newValidator: true,
        submitHandler: function() {
            var txt = $P.lang("LANG3773");

            top.dialog.dialogMessage({
                type: "loading",
                title: txt,
                content: txt
            });

            setTimeout(function() {
                $('#progress')
                    .setGridParam({
                        postData: {
                            "callee": $("#callee").val()
                        },
                        page: 1
                    })
                    .trigger('reloadGrid');
            }, 200);
        }
    });
}

function initValidator() {
    $("#form").tooltip();

    $P("#form", document).validate({
        rules: {
            "faxNum": {
                required: true,
                faxNumber: true,
                maxlength: 32
            },
            "fileUrl": {
                required: true,
                faxFileName: true,
                maxlength: 128
            }
        },
        newValidator: true
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#progress"),
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

function list_progress() {
    $("#progress").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listSendFaxstatus",
            "username": $P.cookie('username')
        },
        colNames: [
            '<span>Key</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
            '<span locale="LANG2056">' + $P.lang('LANG2056') + '</span>',
            '<span locale="LANG4065">' + $P.lang('LANG4065') + '</span>',
            '<span locale="LANG5199">' + $P.lang('LANG5199') + '</span>',
            '<span locale="LANG4087">' + $P.lang('LANG4087') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'key',
            index: 'key',
            width: 100,
            resizable: false,
            hidden: true,
            align: "center"
        }, {
            name: 'n',
            index: 'n',
            width: 200,
            resizable: false,
            align: "center"
        }, {
            name: 'd',
            index: 'd',
            width: 120,
            resizable: false,
            align: "center",
        }, {
            name: 'username',
            index: 'username',
            width: 100,
            resizable: false,
            formatter: createUsername,
            align: "center",
        }, {
            name: 'callee',
            index: 'callee',
            width: 150,
            resizable: false,
            formatter: createCallee,
            align: "center",
        }, {
            name: 'send_status',
            index: 'send_status',
            width : 100,
            resizable: false,
            formatter: creaeSendstatus,
            align: 'center',
        }, {
            name: 'process',
            index: 'process',
            width: 300,
            resizable: false,
            formatter: createProgressBar,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        loadui: 'disable',
        pager: "#progress-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true, // Xie Peng asked to change this setting.
        // multiselect: role === 'privilege_3' ? false : true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'd',
        sortorder: 'desc',
        noData: "LANG129 LANG4146",
        jsonReader: {
            root: "response.fax",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#progress .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            $('.progressbar').each(function() {
                var progressbar = $(this),
                    progressLabel = $('#' + this.id + "_label");

                progressbar.progressbar({
                    value: false,
                    change: function() {
                        progressLabel.text(progressbar.progressbar("value") + "%");
                    },
                    complete: function() {
                        progressbar
                            .parent('td').append('<font color="green" locale="LANG4125">' + $P.lang('LANG4125') + '</font>')
                            .end().remove();
                        // progressLabel.attr({'locale': 'LANG4125'}).css({'color': 'green'}).text($P.lang('LANG4125'));
                    }
                });
            });

            top.Custom.init(doc);

            top.dialog.clearDialog();
        }
    });
}

function noRecords() {
    var total = $("#progress").getGridParam("records");

    if (total == 0) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG129").format($P.lang("LANG4146").toLowerCase())
        });

        return true;
    }

    return false;
}

function setProgress() {
    var table = $("#progress"),
        page = table.getGridParam("page"),
        rowNum = table.getGridParam("rowNum"),
        sidx = table.getGridParam("sortname"),
        sord = table.getGridParam("sortorder"),
        username = $P.cookie('username'),
        dataIDs = table.getDataIDs(),
        dataIDsLength = dataIDs.length;

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listSendFaxstatus",
            "auto-refresh": Math.random(),
            "item_num": rowNum,
            "page": page,
            "sidx": sidx,
            "sord": sord,
            "username": username
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            if (data && data.hasOwnProperty('status') && (data.status === 0)) {
                var dataWithStatus = data.response.fax,
                    dataWithStatusLength = dataWithStatus.length,
                    i = 0;

                if (dataWithStatusLength == dataIDsLength) {
                    $.each(dataWithStatus, function(key, value) {
                        var process = value.process,
                            id = (value.key ? value.key : value.n),
                            progressbar = $('#' + id),
                            progressLabel = $('#' + id + "_label");

                        if (process >= 0 && process <= 100) {
                            progressbar.progressbar("value", process);
                        } else if (process < 0) {
                            progressbar
                                .parent('td').append('<font color="red" locale="LANG4089">' + $P.lang('LANG4089') + '</font>')
                                .end().remove();
                        } else {
                            return true;
                        }
                    });
                }

            }
        }
    });

    setTimeout(setProgress, 3000);
}
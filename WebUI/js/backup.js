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
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    usbDiskName = [],
    sdName = [],
    isRestoreComplete = false;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG633"));

    $("#toTop").scrollToTop(1000);

    createTable();

    bindButtonEvent();

    ReadLog();

    $("#clean").on('click', function() {
        clean_log();
    });
});

function batchDelete(tableID, path) {
    var backupFilesTable = $("#" + tableID),
        records = backupFilesTable.getGridParam("records"),
        selected = backupFilesTable.jqGrid("getGridParam", "selarrrow"),
        selectedRowsLength = selected.length,
        backupFilesList = [],
        confirmList = [],
        rowdata,
        rowName,
        i = 0;

    if (!records) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG129").format($P.lang("LANG2913"))
        });
        return;
    }

    if (selectedRowsLength < 1) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG823").format($P.lang("LANG2913").toLowerCase())
        });
        return;
    }

    for (i; i < selectedRowsLength; i++) {
        rowdata = backupFilesTable.jqGrid('getRowData', selected[i]);

        rowName = rowdata['n'];

        backupFilesList.push(rowName);
    }

    for (i = 0; i < selectedRowsLength; i++) {
        confirmList.push("<font>" + backupFilesList[i] + "</font>");

        if (path) {
            backupFilesList[i] = path + '/' + backupFilesList[i];
        }
    }

    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG2710").format($P.lang("LANG2913").toLowerCase(), confirmList.join('  ')),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG825").format($P.lang("LANG2913").toLowerCase())
                });

                var doSelected = function() { // DELETE_SELECTED_RECORDING();
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: {
                            "action": "removeFile",
                            "type": "batch_backup_package",
                            "data": backupFilesList.join("\t")
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: errorThrown,
                            //     callback: function() {
                            //         // UCMGUI.logoutFunction.doLogout();
                            //     }
                            // });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG871"),
                                    callback: function() {
                                        jumpPageOrNot(tableID, selectedRowsLength);
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
}

function createTable() {
    $("#localBackupFile_list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listFile",
            type: "backup",
            filter: JSON.stringify({
                "list_dir": 0,
                "list_file": 1,
                "file_suffix": ["tar"]
            })
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
            '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'n',
            index: 'n',
            width: 200,
            resizable: false,
            align: "center"
        }, {
            name: 'd',
            index: 'd',
            // width: 100,
            resizable: false,
            align: "center",
        }, {
            name: 's',
            index: 's',
            // width: 150,
            resizable: false,
            formatter: tranSize,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#localBackupFile_list_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: "d",
        sortorder: 'desc',
        noData: "LANG129 LANG2913",
        jsonReader: {
            root: "response.backup",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadError: function() {
            listMediaFile();
        },
        loadComplete: function() {
            $("#localBackupFile_list .jqgrow:even").addClass("ui-row-even");

            listMediaFile();
        },
        gridComplete: function() {
            top.Custom.init(doc);

            $P.lang(document, true);
        }
    });
}

function jumpPageOrNot(tableID, selectedRows) {
    var table = $("#" + tableID),
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

function listMediaFile() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "listFile",
            type: "media",
            page: 1,
            item_num: 20000,
            sidx: "d",
            sord: "desc"
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
                var media = data.response.media;

                $.each(media, function(index, item) {
                    var name = item.n;

                    if (name.contains("mmcblk")) {
                        sdName.push(name);
                    } else if (name.contains("sd")) {
                        usbDiskName.push(name);
                    }
                });

                listUsbdiskFile(usbDiskName);

                listSdFile(sdName);
            }
        }
    });
}

function listUsbdiskFile(files) {
    if (files.length == 0) {
        $("#externalBackupFileDiv").hide();
    } else {
        $.each(files, function(index, item) {
            var table = $("<table>").attr("id", item).addClass('usb_table'),
                div = $("<div>").attr("id", item + "_pager");

            $("#externalBackupFileDiv").append(table).append(div);

            setTimeout(function() {
                $("#" + item).jqGrid({
                    url: baseServerURl,
                    datatype: "json",
                    mtype: "POST",
                    width: doc.documentElement.clientWidth - 50,
                    height: "auto",
                    postData: {
                        action: "listFile",
                        type: "media",
                        filter: JSON.stringify({
                            "list_dir": 0,
                            "list_file": 1,
                            "file_suffix": ["tar"]
                        }),
                        data: item
                    },
                    colNames: [
                        '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
                        '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
                        '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
                        '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
                    ],
                    colModel: [{
                        name: 'n',
                        index: 'n',
                        width: 200,
                        resizable: false,
                        align: "center"
                    }, {
                        name: 'd',
                        index: 'd',
                        // width: 100,
                        resizable: false,
                        align: "center",
                    }, {
                        name: 's',
                        index: 's',
                        // width: 150,
                        resizable: false,
                        formatter: tranSize,
                        align: "center"
                    }, {
                        name: 'options',
                        index: 'options',
                        width: 150,
                        resizable: false,
                        align: "center",
                        formatter: createOptions,
                        sortable: false
                    }],
                    pager: "#" + item + "_pager",
                    rowNum: 10,
                    rowList: [10, 20, 30],
                    multiselect: true,
                    // multiboxonly: true,
                    viewrecords: true,
                    sortname: "d",
                    sortorder: 'desc',
                    noData: "LANG129 LANG2913",
                    jsonReader: {
                        root: "response.media",
                        page: "response.page",
                        total: "response.total_page",
                        records: "response.total_item",
                        repeatitems: false
                    },
                    loadComplete: function() {
                        $("#" + item + " .jqgrow:even").addClass("ui-row-even");
                    },
                    gridComplete: function() {
                        top.Custom.init(doc);

                        $P.lang(document, true);
                    }
                });
            }, 500);
        });
    }
}

function listSdFile(files) {
    if (files.length == 0) {
        $("#mmcblk1pBackupFileDiv").hide();
    } else {
        $.each(files, function(index, item) {
            var table = $("<table>").attr("id", item).addClass('sd_table'),
                div = $("<div>").attr("id", item + "_pager");

            $("#mmcblk1pBackupFileDiv").append(table).append(div);

            setTimeout(function() {
                $("#" + item).jqGrid({
                    url: baseServerURl,
                    datatype: "json",
                    mtype: "POST",
                    width: doc.documentElement.clientWidth - 50,
                    height: "auto",
                    postData: {
                        action: "listFile",
                        type: "media",
                        filter: JSON.stringify({
                            "list_dir": 0,
                            "list_file": 1,
                            "file_suffix": ["tar"]
                        }),
                        data: item
                    },
                    colNames: [
                        '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
                        '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
                        '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
                        '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
                    ],
                    colModel: [{
                        name: 'n',
                        index: 'n',
                        width: 200,
                        resizable: false,
                        align: "center"
                    }, {
                        name: 'd',
                        index: 'd',
                        // width: 100,
                        resizable: false,
                        align: "center",
                    }, {
                        name: 's',
                        index: 's',
                        // width: 150,
                        resizable: false,
                        formatter: tranSize,
                        align: "center"
                    }, {
                        name: 'options',
                        index: 'options',
                        width: 150,
                        resizable: false,
                        align: "center",
                        formatter: createOptions,
                        sortable: false
                    }],
                    pager: "#" + item + "_pager",
                    rowNum: 10,
                    rowList: [10, 20, 30],
                    multiselect: true,
                    // multiboxonly: true,
                    viewrecords: true,
                    sortname: "d",
                    sortorder: 'desc',
                    noData: "LANG129 LANG2913",
                    jsonReader: {
                        root: "response.media",
                        page: "response.page",
                        total: "response.total_page",
                        records: "response.total_item",
                        repeatitems: false
                    },
                    loadComplete: function() {
                        $("#" + item + " .jqgrow:even").addClass("ui-row-even");
                    },
                    gridComplete: function() {
                        top.Custom.init(doc);

                        $P.lang(document, true);
                    }
                });
            }, 500);
        });
    }
}

function tranSize(cellvalue, options, rowObject) {
    return UCMGUI.tranSize(rowObject.s);
}

function createOptions(cellvalue, options, rowObject) {
    var download = '<button fileName="' + rowObject.n + '" title="download" localetitle="LANG759" class="options download"></button>',
        restore = '<button fileName="' + rowObject.n + '" title="restore" localetitle="LANG760" class="options restore"></button>',
        del = '<button fileName="' + rowObject.n + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (download + restore + del);
}

function stopTopWindowInterval() {
    if (top.$.gsec && top.$.gsec.stopSessionCheck) {
        top.$.gsec.stopSessionCheck();
    }

    $P(topDoc).unbind('mousemove mouseenter scroll keydown click dblclick');

    // top.dialog.clearDialog();
    top.window.clearInterval(top.loginInterval);

    top.loginInterval = null;
}

function startTopWindowInterval() {
    UCMGUI.loginFunction.checkTrigger();

    top.$.gsec = new UCMGUI.gSession();
}

function reload() {
    $.ajax({
        type: "POST",
        dataType: "json",
        // async: false,
        url: "../cgi",
        timeout: 10000,
        data: {
            action: 'getInfo'
        },
        error: function(jqXHR, textStatus, errorThrown) {
            setTimeout(reload, 5000);

            if (!isRestoreComplete) {
                isRestoreComplete = true;

                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG832")
                });
            }
        },
        success: function(data) {
            if ((data.status == 0) && isRestoreComplete) {
                top.dialog.clearDialog();

                UCMGUI.logoutFunction.doLogout();
            } else {
                setTimeout(reload, 5000);
            }
        }
    });
}

function success_result(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        if (data.status === 0) {
            // top.dialog.dialogMessage({
            //     type: 'loading',
            //     content: $P.lang("LANG832")
            // });

            reload();
        }
    }
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#createBackupfile', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG758"),
                displayPos: "editForm",
                frameSrc: "html/backup_modal.html?mode=create"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#uploadBackupfile', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2256"),
                displayPos: "editForm",
                frameSrc: "html/backup_modal.html?mode=upload"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#RegularBackupfile', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4048"),
                displayPos: "editForm",
                frameSrc: "html/backup_modal.html?mode=regular"
            });

            ev.stopPropagation();
            return false;
        });

    $("#localBackupFileDiv")
        .delegate('.download', 'click', function(ev) {
            var fileName = $(this).attr("fileName"),
                checkAction = {
                    action: "checkFile",
                    type: "backup",
                    data: fileName
                },
                data = {
                    action: "downloadFile",
                    type: "backup",
                    data: fileName
                };

            if (checkFile(checkAction)) {
                $P.download(baseServerURl, data, 'post');
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.restore', 'click', function(ev) {
            var fileName = $(this).attr("fileName");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG855"),
                buttons: {
                    ok: function() {
                        if (/^[a-zA-Z0-9_\-\.]+$/.test(fileName)) {
                            stopTopWindowInterval();

                            top.dialog.dialogMessage({
                                type: 'loading',
                                content: $P.lang("LANG1415")
                            });

                            $.ajax({
                                url: baseServerURl,
                                type: "POST",
                                dataType: "json",
                                async: true,
                                data: {
                                    "action": "restoreUCMConfig",
                                    "file-restore": "default," + fileName
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.clearDialog();

                                    startTopWindowInterval();
                                    // top.dialog.dialogMessage({
                                    //     type: 'error',
                                    //     content: errorThrown
                                    // });
                                },
                                success: function(data) {
                                    success_result(data);
                                }
                            });
                        } else {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG2925")
                            });
                        }
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var fileName = $(this).attr("fileName");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(fileName),
                buttons: {
                    ok: function() {
                        var action = {
                                action: "removeFile",
                                type: "backup",
                                data: fileName
                            },
                            checkAction = {
                                action: "checkFile",
                                type: "backup",
                                data: fileName
                            };

                        if (checkFile(checkAction)) {
                            $.ajax({
                                type: "post",
                                url: baseServerURl,
                                data: action,
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.clearDialog();

                                    // top.dialog.dialogMessage({
                                    //     type: 'error',
                                    //     content: errorThrown
                                    // });
                                },
                                success: function(data) {
                                    top.dialog.clearDialog();

                                    var bool = UCMGUI.errorHandler(data);

                                    if (bool) {
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG871"),
                                            callback: function() {
                                                var table = $("#localBackupFile_list"),
                                                    totalPage = table.getGridParam("lastpage"),
                                                    page = table.getGridParam("page"),
                                                    reccount = table.getGridParam("reccount");

                                                if (page === totalPage && totalPage > 1 && reccount === 1) {
                                                    table.setGridParam({
                                                        page: totalPage - 1
                                                    }).trigger('reloadGrid');
                                                } else {
                                                    table.trigger('reloadGrid');
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.delete-select', 'click', function(ev) {
            batchDelete('localBackupFile_list');

            ev.stopPropagation();
            return false;
        });
        // .delegate('.delete-all', 'click', function(ev) {
        //     showDeleteAllDialog('localBackupFile_list');

        //     ev.stopPropagation();
        //     return false;
        // });

    $("#externalBackupFileDiv")
        .delegate('.download', 'click', function(ev) {
            var fileName = $(this).attr("fileName"),
                dir = $(this).closest("table").attr("id"),
                checkAction = {
                    action: "checkFile",
                    type: "media",
                    data: "/" + dir + "/" + fileName
                },
                data = {
                    action: "downloadFile",
                    type: "media",
                    data: "/" + dir + "/" + fileName
                };

            if (checkFile(checkAction)) {
                $P.download(baseServerURl, data, 'post');
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.restore', 'click', function(ev) {
            var fileName = $(this).attr("fileName"),
                dir = $(this).closest("table").attr("id");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG855"),
                buttons: {
                    ok: function() {
                        if (/^[a-zA-Z0-9_\-\.]+$/.test(fileName)) {
                            stopTopWindowInterval();

                            top.dialog.dialogMessage({
                                type: 'loading',
                                content: $P.lang("LANG1415")
                            });

                            $.ajax({
                                url: baseServerURl,
                                type: "POST",
                                dataType: "json",
                                async: true,
                                data: {
                                    "action": "restoreUCMConfig",
                                    "file-restore": "/media/" + dir + "/," + fileName
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.clearDialog();

                                    startTopWindowInterval();
                                    // top.dialog.dialogMessage({
                                    //     type: 'error',
                                    //     content: errorThrown
                                    // });
                                },
                                success: function(data) {
                                    success_result(data);
                                }
                            });
                        } else {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG2925")
                            });
                        }
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var fileName = $(this).attr("fileName"),
                dir = $(this).closest("table").attr("id");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(fileName),
                buttons: {
                    ok: function() {
                        var action = {
                                action: "removeFile",
                                type: "media",
                                data: dir + "/" + fileName
                            },
                            checkAction = {
                                action: "checkFile",
                                type: "media",
                                data: "/" + dir + "/" + fileName
                            };

                        if (checkFile(checkAction)) {
                            $.ajax({
                                type: "post",
                                url: baseServerURl,
                                data: action,
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.clearDialog();

                                    // top.dialog.dialogMessage({
                                    //     type: 'error',
                                    //     content: errorThrown
                                    // });
                                },
                                success: function(data) {
                                    top.dialog.clearDialog();

                                    var bool = UCMGUI.errorHandler(data);

                                    if (bool) {
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG871"),
                                            callback: function() {
                                                var table = $("#" + dir),
                                                    totalPage = table.getGridParam("lastpage"),
                                                    page = table.getGridParam("page"),
                                                    reccount = table.getGridParam("reccount");

                                                if (page === totalPage && totalPage > 1 && reccount === 1) {
                                                    table.setGridParam({
                                                        page: totalPage - 1
                                                    }).trigger('reloadGrid');
                                                } else {
                                                    table.trigger('reloadGrid');
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.delete-select', 'click', function(ev) {
            batchDelete(usbDiskName[0], usbDiskName[0]);

            ev.stopPropagation();
            return false;
        });

    $("#mmcblk1pBackupFileDiv")
        .delegate('.download', 'click', function(ev) {
            var fileName = $(this).attr("fileName"),
                dir = $(this).closest("table").attr("id"),
                checkAction = {
                    action: "checkFile",
                    type: "media",
                    data: "/" + dir + "/" + fileName
                },
                data = {
                    action: "downloadFile",
                    type: "media",
                    data: "/" + dir + "/" + fileName
                };

            if (checkFile(checkAction)) {
                $P.download(baseServerURl, data, 'post');
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.restore', 'click', function(ev) {
            var fileName = $(this).attr("fileName"),
                dir = $(this).closest("table").attr("id");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG855"),
                buttons: {
                    ok: function() {
                        if (/^[a-zA-Z0-9_\-\.]+$/.test(fileName)) {
                            stopTopWindowInterval();

                            top.dialog.dialogMessage({
                                type: 'loading',
                                content: $P.lang("LANG1415")
                            });

                            $.ajax({
                                url: baseServerURl,
                                type: "POST",
                                dataType: "json",
                                async: true,
                                data: {
                                    "action": "restoreUCMConfig",
                                    "file-restore": "/media/" + dir + "/," + fileName
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.clearDialog();

                                    startTopWindowInterval();
                                    // top.dialog.dialogMessage({
                                    //     type: 'error',
                                    //     content: errorThrown
                                    // });
                                },
                                success: function(data) {
                                    success_result(data);
                                }
                            });
                        } else {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG2925")
                            });
                        }
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var fileName = $(this).attr("fileName"),
                dir = $(this).closest("table").attr("id");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(fileName),
                buttons: {
                    ok: function() {
                        var action = {
                                action: "removeFile",
                                type: "media",
                                data: dir + "/" + fileName
                            },
                            checkAction = {
                                action: "checkFile",
                                type: "media",
                                data: "/" + dir + "/" + fileName
                            };

                        if (checkFile(checkAction)) {
                            $.ajax({
                                type: "post",
                                url: baseServerURl,
                                data: action,
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.clearDialog();

                                    // top.dialog.dialogMessage({
                                    //     type: 'error',
                                    //     content: errorThrown
                                    // });
                                },
                                success: function(data) {
                                    top.dialog.clearDialog();

                                    var bool = UCMGUI.errorHandler(data);

                                    if (bool) {
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG871"),
                                            callback: function() {
                                                var table = $("#" + dir),
                                                    totalPage = table.getGridParam("lastpage"),
                                                    page = table.getGridParam("page"),
                                                    reccount = table.getGridParam("reccount");

                                                if (page === totalPage && totalPage > 1 && reccount === 1) {
                                                    table.setGridParam({
                                                        page: totalPage - 1
                                                    }).trigger('reloadGrid');
                                                } else {
                                                    table.trigger('reloadGrid');
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.delete-select', 'click', function(ev) {
            batchDelete(sdName[0], sdName[0]);

            ev.stopPropagation();
            return false;
        });
}

function ReadLog() {
    $.ajax({
        type: "GET",
        url: "./userdefined/regular_backup_results",
        dataType: "text",
        error: function(jqXHR, textStatus, errorThrown) {

        },
        success: function(data) {
            var arr = data.split("\n").reverse(),
                sLog = "",
                rLang = /(LANG\d+)/g,
                rStatus = /tar\s*\:/,
                oErrorCode = UCMGUI.config.errorCodes,
                sErrorLang = "";

            for (var i = 0; i < arr.length; i++) {
                var str = arr[i];

                if (str != "") {
                    str = str.replace(rLang, '<span locale="$1"></span>');
                    var aError = str.split(rStatus);

                    if (aError[1]) {
                        if (aError.length <= 1 || !aError[1].match(/\d/)) {
                            sErrorLang = "LANG909";
                        } else {
                            var nStatus = aError[1].replace(/\s+/g, ""),
                                bSuccess = nStatus == "0";

                            if (bSuccess) {
                                sErrorLang = "LANG961";
                            } else {
                                sErrorLang = oErrorCode[nStatus];

                                if (sErrorLang === undefined) {
                                    sErrorLang = "LANG909";
                                }
                            }
                        }

                        str = aError[0] + "tar  " + '<span locale="' + sErrorLang + '"></span>';
                        sLog += '<div' + (bSuccess ? ' class="success"' : '') + '>' + str + '</div>';
                    }
                }
            }
            $("#cleaner_log").html(sLog);
            $P.lang(document, true);
        }
    });
}

function clean_log() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG3902"),
        buttons: {
            ok: function() {
                $.ajax({
                    type: "GET",
                    url: "../cgi?action=reloadLog&regularbackuplog=",
                    dataType: "json",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {

                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG3903"),
                                callback: function() {
                                    ReadLog();
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

function checkFile(action) {
    var result = false;

    if (action || !$.isEmptyObject(action)) {
        $.ajax({
            type: "post",
            url: "../cgi",
            async: false,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.clearDialog();

                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: function(data) {
                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                    result = true;
                }
            }
        });
    }

    if (!result) {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG3868")
        });
    }

    return result;
}

function showDeleteAllDialog(tableID) {
    var records = $("#" + tableID).getGridParam("records");

    if (!records) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG129").format($P.lang("LANG2913"))
        });
    } else {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG840"),
            buttons: {
                ok: function() {
                    sendDeleteAllRequest(tableID);
                }
            }
        });
    }
}

function sendDeleteAllRequest(tableID) {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG877")
    });

    var action = {
        "action": "removeFile",
        "type": "batch_backup_package",
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
                            jumpPageOrNot(tableID, -1);
                        }
                    });
                }, 200);
            }
        }
    });
}

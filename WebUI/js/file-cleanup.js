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
    selectbox = UCMGUI.domFunction.selectbox,
    USBDiskName = [],
    USBPathList = [],
    SDPathList = [],
    SDName = [];

String.prototype.format = top.String.prototype.format;
String.prototype.beginsWith = top.String.prototype.beginsWith;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG5122"));

    $("#toTop").scrollToTop(1000);

    listMediaFile();

    bindButtonEvent();
});

function batchDelete(tableID, path) {
    var backupFilesTable = $("#" + tableID),
        records = backupFilesTable.getGridParam("records"),
        selected = backupFilesTable.jqGrid("getGridParam", "selarrrow"),
        selectedRowsLength = selected.length,
        backupFilesList = [],
        startWithPBX = false,
        confirmList = [],
        rowdata,
        rowName,
        i = 0;

    if (!records) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG129").format($P.lang("LANG3652"))
        });
        return;
    }

    if (selectedRowsLength < 1) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG823").format($P.lang("LANG3652").toLowerCase())
        });
        return;
    }

    for (i; i < selectedRowsLength; i++) {
        rowdata = backupFilesTable.jqGrid('getRowData', selected[i]);

        rowName = rowdata['n'];

        backupFilesList.push(rowName);

        if (rowName.beginsWith('PBX_')) {
            startWithPBX = true;
            break;
        }
    }

    if (startWithPBX) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG5183")
        });
        return;
    }

    for (i = 0; i < selectedRowsLength; i++) {
        confirmList.push("<font>" + backupFilesList[i] + "</font>");

        if (path) {
            backupFilesList[i] = path + '/' + backupFilesList[i];
        }
    }

    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG2710").format($P.lang("LANG3652").toLowerCase(), confirmList.join('  ')),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG825").format($P.lang("LANG3652").toLowerCase())
                });

                var doSelected = function() { // DELETE_SELECTED_RECORDING();
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: {
                            "action": "removeFile",
                            "type": "clean_usb_sd_file",
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

function bindButtonEvent() {
    $("#externalBackupFileDiv")
        .delegate('.del', 'click', function(ev) {
            var fileName = $(this).attr("fileName"),
                dir = $(this).closest("table").attr("id");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(fileName),
                buttons: {
                    ok: function() {
                        var action = {
                                action: "removeFile",
                                type: "clean_usb_sd_file",
                                data: dir + '/' + USBPathList.join('/') + '/' + fileName
                            },
                            checkAction = {
                                action: "checkFile",
                                type: "clean_usb_sd_file",
                                data: dir + '/' + USBPathList.join('/') + '/' + fileName
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
            batchDelete(
                USBDiskName[0],
                (USBPathList.length ?
                    (USBDiskName[0] + '/' + USBPathList.join('/')) :
                    USBDiskName[0]
                )
            );

            ev.stopPropagation();
            return false;
        })
        .delegate('.path', 'click', function(ev) {
            var value = $(this).attr('value'),
                isRoot = $(this).hasClass('root'),
                postData = {
                    action: "listFile",
                    type: "media",
                    filter: JSON.stringify({
                        "list_dir": 1,
                        "list_file": 1
                    })
                };

            if (value) {
                if (!isRoot) {
                    USBPathList = value.split(',');

                    postData.data = USBDiskName[0] + '/' + USBPathList.join('/');
                } else {
                    USBPathList = [];

                    postData.data = USBDiskName[0];
                }

                $("#" + USBDiskName[0]).setGridParam({
                    postData: postData,
                    page: 1
                }).trigger('reloadGrid');
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#USBDirectorySelect', 'click', function(ev) {
            var value = $('option:selected', this).val(),
                postData = {
                    action: "listFile",
                    type: "media",
                    filter: JSON.stringify({
                        "list_dir": 1,
                        "list_file": 1
                    })
                };

            if (value) {
                USBPathList.push(value);

                postData.data = USBDiskName[0] + '/' + USBPathList.join('/');

                $("#" + USBDiskName[0]).setGridParam({
                    postData: postData,
                    page: 1
                }).trigger('reloadGrid');
            }

            ev.stopPropagation();
            return false;
        });

    $("#mmcblk1pBackupFileDiv")
        .delegate('.del', 'click', function(ev) {
            var fileName = $(this).attr("fileName"),
                dir = $(this).closest("table").attr("id");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(fileName),
                buttons: {
                    ok: function() {
                        var action = {
                                action: "removeFile",
                                type: "clean_usb_sd_file",
                                data: dir + '/' + SDPathList.join('/') + '/' + fileName
                            },
                            checkAction = {
                                action: "checkFile",
                                type: "clean_usb_sd_file",
                                data: dir + '/' + SDPathList.join('/') + '/' + fileName
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
            batchDelete(
                SDName[0],
                (SDPathList.length ?
                    (SDName[0] + '/' + SDPathList.join('/')) :
                    SDName[0]
                )
            );

            ev.stopPropagation();
            return false;
        })
        .delegate('.path', 'click', function(ev) {
            var value = $(this).attr('value'),
                isRoot = $(this).hasClass('root'),
                postData = {
                    action: "listFile",
                    type: "media",
                    filter: JSON.stringify({
                        "list_dir": 1,
                        "list_file": 1
                    })
                };

            if (value) {
                if (!isRoot) {
                    SDPathList = value.split(',');

                    postData.data = SDName[0] + '/' + SDPathList.join('/');
                } else {
                    SDPathList = [];

                    postData.data = SDName[0];
                }

                $("#" + SDName[0]).setGridParam({
                    postData: postData,
                    page: 1
                }).trigger('reloadGrid');
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#SDDirectorySelect', 'click', function(ev) {
            var value = $('option:selected', this).val(),
                postData = {
                    action: "listFile",
                    type: "media",
                    filter: JSON.stringify({
                        "list_dir": 1,
                        "list_file": 1
                    })
                };

            if (value) {
                SDPathList.push(value);

                postData.data = SDName[0] + '/' + SDPathList.join('/');

                $("#" + SDName[0]).setGridParam({
                    postData: postData,
                    page: 1
                }).trigger('reloadGrid');
            }

            ev.stopPropagation();
            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var del = '';

    if (rowObject.n.beginsWith('PBX_')) {
        del = '<button fileName="' + rowObject.n + '" title="Delete" localetitle="LANG739" class="options del disabled" disabled></button>';
    } else {
        del = '<button fileName="' + rowObject.n + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    }

    return (del);
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
                        SDName.push(name);
                    } else if (name.contains("sd")) {
                        USBDiskName.push(name);
                    }
                });

                listUsbdiskFile(USBDiskName);

                listSdFile(SDName);
            }
        }
    });
}

function listUsbdiskFile(files) {
    if (files.length == 0) {
        $("#noUSB").show();

        $("#USBPath, #USBDirectory, #externalBackupFileDiv .top_buttons, #externalBackupFileDiv .ui-jqgrid").hide();
    } else {
        $.each(files, function(index, item) {
            var table = $("<table>").attr("id", item).addClass('usb_table'),
                div = $("<div>").attr("id", item + "_pager");

            $("#externalBackupFileDiv").append(table).append(div);

            $("#noUSB").hide();

            $("#USBPath, #USBDirectory, #externalBackupFileDiv .top_buttons, #externalBackupFileDiv .ui-jqgrid").show();

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
                            "list_dir": 1,
                            "list_file": 1
                        }),
                        data: item
                    },
                    colNames: [
                        '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
                        '<span locale="LANG1950">' + $P.lang('LANG1950') + '</span>',
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
                        name: 't',
                        index: 't',
                        width: 100,
                        resizable: false,
                        align: "center",
                        formatter: tranType
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
                    noData: "LANG129 LANG3652",
                    jsonReader: {
                        root: "response.media",
                        page: "response.page",
                        total: "response.total_page",
                        records: "response.total_item",
                        repeatitems: false
                    },
                    loadComplete: function(data) {
                        $("#" + item + " .jqgrow:even").addClass("ui-row-even");
                    },
                    gridComplete: function(data) {
                        var media = data.response.media,
                            length = media.length,
                            USBPathDOM = $('#USBPath .field-content'),
                            USBDirectoryDOM = $('#USBDirectory .field-content'),
                            tempPathList = [],
                            directory = [{
                                locale: 'LANG5182',
                                val: ''
                            }],
                            i = 0;

                        USBPathDOM.empty().append('<span class="path root" value="' + item + '">' + item + '</span><span class="seperator">/</span>');
                        USBDirectoryDOM.empty();

                        for (i; i < length; i++) {
                            if (media[i].t === 'directory' && media[i].n) {
                                directory.push({
                                    txt: media[i].n,
                                    val: media[i].n
                                });
                            }
                        }

                        if (directory.length <= 1) {
                            directory = [{
                                locale: 'LANG133',
                                val: ''
                            }];
                        }

                        if (USBPathList.length) {
                            for (i = 0, length = USBPathList.length; i < length; i++) {
                                tempPathList.push(USBPathList[i]);

                                USBPathDOM.append('<span class="path" value="' + tempPathList.join() + '">' + USBPathList[i] + '</span><span class="seperator">/</span>');
                            }
                        }

                        USBDirectoryDOM.append('<select id="USBDirectorySelect" />');

                        selectbox.appendOpts({
                            el: "USBDirectorySelect",
                            opts: directory
                        }, doc);

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
        $("#noSD").show();

        $("#SDPath, #SDDirectory, #mmcblk1pBackupFileDiv .top_buttons, #mmcblk1pBackupFileDiv .ui-jqgrid").hide();
    } else {
        $.each(files, function(index, item) {
            var table = $("<table>").attr("id", item).addClass('sd_table'),
                div = $("<div>").attr("id", item + "_pager");

            $("#mmcblk1pBackupFileDiv").append(table).append(div);

            $("#noSD").hide();

            $("#SDPath, #SDDirectory, #mmcblk1pBackupFileDiv .top_buttons, #mmcblk1pBackupFileDiv .ui-jqgrid").show();

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
                            "list_dir": 1,
                            "list_file": 1
                        }),
                        data: item
                    },
                    colNames: [
                        '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
                        '<span locale="LANG1950">' + $P.lang('LANG1950') + '</span>',
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
                        name: 't',
                        index: 't',
                        width: 100,
                        resizable: false,
                        align: "center",
                        formatter: tranType
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
                    noData: "LANG129 LANG3652",
                    jsonReader: {
                        root: "response.media",
                        page: "response.page",
                        total: "response.total_page",
                        records: "response.total_item",
                        repeatitems: false
                    },
                    loadComplete: function(data) {
                        $("#" + item + " .jqgrow:even").addClass("ui-row-even");
                    },
                    gridComplete: function(data) {
                        var media = data.response.media,
                            length = media.length,
                            SDPathDOM = $('#SDPath .field-content'),
                            SDDirectoryDOM = $('#SDDirectory .field-content'),
                            tempPathList = [],
                            directory = [{
                                locale: 'LANG5182',
                                val: ''
                            }],
                            i = 0;

                        SDPathDOM.empty().append('<span class="path root" value="' + item + '">' + item + '</span><span class="seperator">/</span>');
                        SDDirectoryDOM.empty();

                        for (i; i < length; i++) {
                            if (media[i].t === 'directory' && media[i].n) {
                                directory.push({
                                    txt: media[i].n,
                                    val: media[i].n
                                });
                            }
                        }

                        if (directory.length <= 1) {
                            directory = [{
                                locale: 'LANG133',
                                val: ''
                            }];
                        }

                        if (SDPathList.length) {
                            for (i = 0, length = SDPathList.length; i < length; i++) {
                                tempPathList.push(SDPathList[i]);

                                SDPathDOM.append('<span class="path" value="' + tempPathList.join() + '">' + SDPathList[i] + '</span><span class="seperator">/</span>');
                            }
                        }

                        SDDirectoryDOM.append('<select id="SDDirectorySelect" />');

                        selectbox.appendOpts({
                            el: "SDDirectorySelect",
                            opts: directory
                        }, doc);

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

function tranType(cellvalue, options, rowObject) {
    var type = '';

    if (cellvalue === 'directory') {
        type = '<span locale="LANG5146"></span>';
    } else if (cellvalue === 'file') {
        type = '<span locale="LANG3652"></span>';
    } else {
        type = '<span locale="LANG2403"></span>';
    }

    return type;
}

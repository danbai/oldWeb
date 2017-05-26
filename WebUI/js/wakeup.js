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
    role = $P.cookie('role'),
    userName = $P.cookie("username"),
    existNames = [],
    existExtensions = [],
    extensionList = [],
    extensionObj = [],
    ivrNameArr = [{
        val: "wakeup-call",
        text: "wakeup-call"
    }],
    totalWakeup = 0,
    maxWakeup = config.featureLimits.wakeup_service;

Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.sortBy = top.Array.prototype.sortBy;
Array.prototype.lastValue = top.Array.prototype.lastValue;
String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4858"));

    bindButtonEvent();

    getCustomPrompt();

    if (role === 'privilege_3') {
        createTableInUserPortal();

        setTimeout(refleshStatusInUserPortal, 5000);
    } else {
        createTable();

        getLists();

        setTimeout(refleshStatus, 5000);
    }
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            if (totalWakeup >= Number(maxWakeup)) {
               top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5432").format(maxWakeup, totalWakeup)
                });

                return false;
            }
            if (!extensionList.length) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5039").format($P.lang("LANG85").toLowerCase())
                });

                return false;
            }

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG4858")),
                displayPos: "editForm",
                frameSrc: "html/wakeup_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnBatchDelete', 'click', function(ev) {

            var wakeupTable = $("#wakeup-list"),
                records = wakeupTable.getGridParam("records"),
                selected = wakeupTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                indexList = [],
                confirmList = [],
                i = 0,
                rowdata,
                rowIndex,
                rowName;

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG4858").toLowerCase())
                });
                return false;
            }

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG4858").toLowerCase())
                });

                ev.stopPropagation();
                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = wakeupTable.jqGrid('getRowData', selected[i]);

                rowIndex = rowdata['wakeup_index'].split('</span>');
                rowName = rowdata['wakeup_name'].split('</span>');

                indexList.push(rowIndex.length > 1 ? rowIndex[1] : rowIndex[0]);
                confirmList.push("<font>" + (rowName.length > 1 ? rowName[1] : rowName[0]) + "</font>");
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG4858").toLowerCase(), confirmList.join('  ')),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG4858").toLowerCase())
                        });

                        var DO_SELECTED = function() { // DELETE_SELECTED_USERS();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "deleteWakeupSchedule",
                                    "wakeup_index": indexList.toString()
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
                                            content: $P.lang("LANG816"),
                                            callback: function() {
                                                if (role === 'privilege_3') {
                                                    createTableInUserPortal();
                                                } else {
                                                    jumpPageOrNot(selectedRowsLength);

                                                    getLists();
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        };

                        setTimeout(DO_SELECTED, 100);
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $("body.page")
        .delegate('.edit', 'click', function(ev) {
            var name = $(this).attr('name'),
                index = $(this).attr('index'),
                extension = $(this).attr('extension');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG4858"), name),
                displayPos: "editForm",
                frameSrc: "html/wakeup_modal.html?mode=edit&index=" + index + "&extension=" + extension + "&name=" + name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var name = $(this).attr('name'),
                index = $(this).attr('index');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG4858"), name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteWakeupSchedule",
                            "wakeup_index": index
                        };

                        $.ajax({
                            type: "post",
                            url: "/cgi",
                            data: action,
                            error: function(jqXHR, textStatus, errorThrown) {
                                // top.dialog.dialogMessage({
                                //     type: 'error',
                                //     content: errorThrown
                                // });
                            },
                            success: function(data) {
                                if (data.status == 0) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            if (role === 'privilege_3') {
                                                createTableInUserPortal();
                                            } else {
                                                jumpPageOrNot(1);

                                                getLists();
                                            }
                                        }
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

            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button index="' + rowObject.wakeup_index + '" extension="' + rowObject.extension + '" name="' + rowObject.wakeup_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button index="' + rowObject.wakeup_index + '" extension="' + rowObject.extension + '" name="' + rowObject.wakeup_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createTable() {
    $("#wakeup-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listWakeupSchedule"
        },
        colNames: [
            '<span>Index</span>',
            '<span locale="LANG135"></span>',
            '<span locale="LANG85"></span>',
            '<span locale="LANG81"></span>',
            '<span locale="LANG203"></span>',
            '<span locale="LANG247"></span>',
            '<span locale="LANG74"></span>'
        ],
        colModel: [{
            name: 'wakeup_index',
            index: 'wakeup_index',
            width: 100,
            resizable: false,
            align: "center",
            hidden: true
        }, {
            name: 'wakeup_name',
            index: 'wakeup_name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'wakeup_enable',
            index: 'wakeup_enable',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'custom_date',
            index: 'custom_date',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'time',
            index: 'time',
            width: 100,
            resizable: false,
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
        pager: "#wakeup-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        viewrecords: true,
        sortname: 'wakeup_index',
        noData: "LANG129 LANG4858",
        jsonReader: {
            root: "response.ucm_wakeup",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function(data) {
            totalWakeup = data.response.total_item;
            $("#wakeup-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function createTableInUserPortal() {
    extensionList = [userName];
    extensionObj = [{
            'val': userName,
            'text': userName
        }];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getUserWakeupSchedule",
            "auto-refresh": Math.random(),
            "extension": userName
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var wakeup = data.response.wakeup;

                existNames = [];
                existExtensions = [];

                for (var i = 0, length = wakeup.length; i < length; i++) {
                    var extension = wakeup[i]['extension'],
                        name = wakeup[i]['wakeup_name'];

                    if (extension && (existExtensions.indexOf(extension) === -1)) {
                        existExtensions.push(extension);
                    }

                    if (name && (existNames.indexOf(name) === -1)) {
                        existNames.push(name);
                    }
                }

                $("#wakeup-list").jqGrid('GridUnload');

                $("#wakeup-list").jqGrid({
                    data: wakeup,
                    datatype: "local",
                    width: doc.documentElement.clientWidth - 50,
                    height: "auto",
                    colNames: [
                        '<span>Index</span>',
                        '<span locale="LANG135"></span>',
                        '<span locale="LANG85"></span>',
                        '<span locale="LANG81"></span>',
                        '<span locale="LANG203"></span>',
                        '<span locale="LANG247"></span>',
                        '<span locale="LANG74"></span>'
                    ],
                    colModel: [{
                        name: 'wakeup_index',
                        index: 'wakeup_index',
                        width: 100,
                        resizable: false,
                        align: "center",
                        hidden: true
                    }, {
                        name: 'wakeup_name',
                        index: 'wakeup_name',
                        width: 100,
                        resizable: false,
                        align: "center"
                    }, {
                        name: 'extension',
                        index: 'extension',
                        width: 100,
                        resizable: false,
                        align: "center"
                    }, {
                        name: 'wakeup_enable',
                        index: 'wakeup_enable',
                        width: 100,
                        resizable: false,
                        align: "center",
                        formatter: transTableValue
                    }, {
                        name: 'custom_date',
                        index: 'custom_date',
                        width: 100,
                        resizable: false,
                        align: "center",
                        formatter: transTableValue
                    }, {
                        name: 'time',
                        index: 'time',
                        width: 100,
                        resizable: false,
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
                    pager: "#wakeup-pager",
                    rowNum: 10,
                    rowList: [10, 20, 30],
                    multiselect: true,
                    viewrecords: true,
                    noData: "LANG129 LANG4858",
                    loadComplete: function() {
                        $("#wakeup-list .jqgrow:even").addClass("ui-row-even");
                    },
                    gridComplete: function() {
                        $P.lang(doc, true);

                        top.Custom.init(doc);
                    }
                });
            }
        }
    });
}

function getCustomPrompt() {
    var action = {
        "action": "listFile",
        "type": "ivr",
        "filter": JSON.stringify({
            "list_dir": 0,
            "list_file": 1,
            "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
        }),
        "sidx": "n",
        "sord": "desc"
    };

    $.ajax({
        type: "post",
        url: "/cgi",
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
                var res = data.response;

                if (res) {
                    var ivr = res.ivr;

                    for (var i = 0; i < ivr.length; i++) {
                        var name = ivr[i]["n"],
                            obj = {
                                text: name,
                                val: "record/" + removeSuffix(name)
                            };

                        ivrNameArr.push(obj);
                    };
                }
            }
        }
    });
}

function getLists() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getAccountList",
            "auto-refresh": Math.random()
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var extension = data.response.extension;

                if (extension.length) {
                    extension = extension.sortBy('extension');
                }

                extensionObj = transData(extension);
            }
        }
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listWakeupSchedule",
            "auto-refresh": Math.random(),
            "options": "wakeup_name,extension",
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var wakeup = data.response.ucm_wakeup;

                existNames = [];
                existExtensions = [];

                for (var i = 0, length = wakeup.length; i < length; i++) {
                    var extension = wakeup[i]['extension'],
                        name = wakeup[i]['wakeup_name'];

                    if (extension && (existExtensions.indexOf(extension) === -1)) {
                        existExtensions.push(extension);
                    }

                    if (name && (existNames.indexOf(name) === -1)) {
                        existNames.push(name);
                    }
                }
            }
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#wakeup-list"),
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

function removeSuffix(filename) {
    var name = filename.toLocaleLowerCase(),
        file_suffix = [".mp3", ".wav", ".gsm", ".ulaw", ".alaw"];

    for (var i = 0; i < file_suffix.length; i++) {
        var num = name.lastIndexOf(file_suffix[i]);

        if (num != -1 && name.endsWith(file_suffix[i])) {
            filename = filename.substring(0, num);

            return filename;
        }
    }
}

function refleshStatus() {
    getLists();

    var table = $("#wakeup-list"),
        page = table.getGridParam("page"),
        rowNum = table.getGridParam("rowNum"),
        sidx = table.getGridParam("sortname"),
        sord = table.getGridParam("sortorder"),
        dataIDs = table.getDataIDs(),
        dataIDsLength = dataIDs.length,
        oRefleshData = {
            "action": "listWakeupSchedule",
            "auto-refresh": Math.random(),
            "options": "wakeup_index,wakeup_name,wakeup_enable,extension,custom_date,time",
            "item_num": rowNum,
            "page": page,
            "sidx": sidx,
            "sord": sord
        };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: oRefleshData,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var dataWithStatus = data.response.ucm_wakeup,
                    dataWithStatusLength = dataWithStatus.length,
                    i = 0;

                if (dataWithStatusLength == dataIDsLength) {
                    for (i; i < dataWithStatusLength; i++) {
                        var rowId = dataIDs[i],
                            rowObject = table.getRowData(rowId),
                            index = dataWithStatus[i].wakeup_index,
                            name = dataWithStatus[i].wakeup_name,
                            status = dataWithStatus[i].wakeup_enable,
                            extension = dataWithStatus[i].extension,
                            date = dataWithStatus[i].custom_date,
                            time = dataWithStatus[i].time;

                        rowObject.wakeup_index = index;
                        rowObject.wakeup_name = name;
                        rowObject.wakeup_enable = status;
                        rowObject.extension = extension;
                        rowObject.custom_date = date;
                        rowObject.time = time;

                        table.setRowData(rowId, rowObject);
                    }
                } else {
                    jumpPageOrNot();

                    getLists();
                }

            }
        }
    });

    setTimeout(refleshStatus, 5000);

    $P.lang(doc, true);
}

function refleshStatusInUserPortal() {
    createTableInUserPortal();

    setTimeout(refleshStatusInUserPortal, 5000);
}

function transData(res, cb) {
    var arr = [];

    extensionList = [];

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

        extensionList.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transTableValue(cellvalue, options, rowObject) {
    var response;

    switch (options.colModel.name) {
        case 'wakeup_enable':
            if (cellvalue === 1) {
                response = '<span locale="LANG5220"></span>'
            } else {
                response = '<span locale="LANG5219"></span>'
            }
            break;
        case 'custom_date':
            if (cellvalue && cellvalue.indexOf('-') > -1) {
                response = cellvalue;
            } else if (cellvalue == '0' || cellvalue) {
                var labels = [
                        '<span locale="LANG250"></span>',
                        '<span locale="LANG251"></span>',
                        '<span locale="LANG252"></span>',
                        '<span locale="LANG253"></span>',
                        '<span locale="LANG254"></span>',
                        '<span locale="LANG255"></span>',
                        '<span locale="LANG256"></span>'
                    ],
                    days = cellvalue.split(',');

                response = [];

                for (var i = 0, length = days.length; i < length; i++) {
                    response.push(labels[parseInt(days[i])]);
                }

                response = response.join();
            } else {
                response = '<span locale="LANG2403"></span>';
            }
            break;
        default:
            response = '<span locale="LANG2403"></span>';
            break;
    }

    return response;
}
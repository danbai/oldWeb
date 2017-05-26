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
    ivrNameArr = [],
    numberList = [],
    existMiniBarCodes = [],
    existMiniBarNames = [],
    existMiniBarMaidCodes = [],
    existMiniBarGoodsCodes = [],
    existMiniBarGoodsNames = [];

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

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG5056"));

    createTable();

    bindButtonEvent();

    getCustomPrompt();

    getLists();

    // setTimeout(reflesh_status, 5000);
});

function bindButtonEvent() {
    $('body.page')
        .delegate('#addMiniBar', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG5056")),
                displayPos: "editForm",
                frameSrc: "html/pms_minibar_modal.html?mode=add&type=minibar"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#addMaid', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG5057")),
                displayPos: "editForm",
                frameSrc: "html/pms_minibar_modal.html?mode=add&type=maid"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#addGoods', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG5050")),
                displayPos: "editForm",
                frameSrc: "html/pms_minibar_modal.html?mode=add&type=goods"
            });

            ev.stopPropagation();
            return false;
        });

    $("#minibar-list")
        .delegate('.edit', 'click', function(ev) {
            var name = $(this).attr('name'),
                extension = $(this).attr('extension');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG5056"), name),
                displayPos: "editForm",
                frameSrc: "html/pms_minibar_modal.html?mode=edit&type=minibar&id=" + extension + "&name=" + name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var name = $(this).attr('name'),
                extension = $(this).attr('extension');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG5056"), name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteMiniBar",
                            "extension": extension
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
                                            jumpPageOrNot('minibar-list', 1);

                                            getLists();
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

    $("#maid-list")
        .delegate('.edit', 'click', function(ev) {
            var maid = $(this).attr('maid');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG5057"), maid),
                displayPos: "editForm",
                frameSrc: "html/pms_minibar_modal.html?mode=edit&type=maid&id=" + maid
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var maid = $(this).attr('maid');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG5057"), maid),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteMiniBarWaiter",
                            "waiter_id": maid
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
                                            jumpPageOrNot('maid-list', 1);

                                            getLists();
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

    $("#goods-list")
        .delegate('.edit', 'click', function(ev) {
            var name = $(this).attr('name'),
                extension = $(this).attr('extension');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG5050"), name),
                displayPos: "editForm",
                frameSrc: "html/pms_minibar_modal.html?mode=edit&type=goods&id=" + extension + "&name=" + name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var name = $(this).attr('name'),
                extension = $(this).attr('extension');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG5050"), name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteMiniBarGoods",
                            "extension": extension
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
                                            jumpPageOrNot('goods-list', 1);

                                            getLists();
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
    var edit, del;

    switch (options.gid) {
        case 'minibar-list':
            edit = '<button extension="' + rowObject.extension + '" name="' + rowObject.minibar_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
            del = '<button extension="' + rowObject.extension + '" name="' + rowObject.minibar_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';

            break;
        case 'maid-list':
            edit = '<button maid="' + rowObject.waiter_id + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
            del = '<button maid="' + rowObject.waiter_id + '" title="Delete" localetitle="LANG739" class="options del"></button>';

            break;
        case 'goods-list':
            edit = '<button extension="' + rowObject.extension + '" name="' + rowObject.goods_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
            del = '<button extension="' + rowObject.extension + '" name="' + rowObject.goods_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';

            break;
        default:
            edit = '<button title="Edit" localetitle="LANG738" class="options edit"></button>',
            del = '<button title="Delete" localetitle="LANG739" class="options del"></button>';

            break;
    }

    return (edit + del);
}

function createTable(argument) {
    $("#minibar-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listMiniBar"
        },
        colNames: [
            '<span locale="LANG4341"></span>',
            '<span locale="LANG135"></span>',
            // '<span locale="LANG1484"></span>',
            // '<span locale="LANG5052"></span>',
            // '<span locale="LANG5051"></span>',
            '<span locale="LANG74"></span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'minibar_name',
            index: 'minibar_name',
            width: 100,
            resizable: false,
            align: "center"
        }, /*{
            name: 'prompt',
            index: 'prompt',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'verify_skip',
            index: 'verify_skip',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'enable_list_goods',
            index: 'enable_list_goods',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue,
            hidden: true
        },*/ {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#minibar-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: 'minibar_name',
        noData: "LANG129 LANG5056",
        jsonReader: {
            root: "response.minibar_settings",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function(data) {
            $("#minibar-list .jqgrow:even").addClass("ui-row-even");

            if (data.response.total_item) {
                $('#addMiniBar').addClass('disabled').attr({'disabled': true});
            } else {
                $('#addMiniBar').removeClass('disabled').removeAttr('disabled');
            }
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });

    $("#maid-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listMiniBarWaiter"
        },
        colNames: [
            '<span locale="LANG4963"></span>',
            '<span locale="LANG127"></span>',
            '<span locale="LANG74"></span>'
        ],
        colModel: [{
            name: 'waiter_id',
            index: 'waiter_id',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'secret',
            index: 'secret',
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
        pager: "#maid-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: 'waiter_id',
        noData: "LANG129 LANG5057",
        jsonReader: {
            root: "response.minibar_waiter",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#maid-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });

    $("#goods-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listMiniBarGoods"
        },
        colNames: [
            '<span locale="LANG4341"></span>',
            '<span locale="LANG135"></span>',
            // '<span locale="LANG5053"></span>',
            // '<span locale="LANG5054"></span>',
            '<span locale="LANG74"></span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'goods_name',
            index: 'goods_name',
            width: 100,
            resizable: false,
            align: "center"
        }, /*{
            name: 'prompt_success',
            index: 'prompt_success',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'prompt_error',
            index: 'prompt_error',
            width: 100,
            resizable: false,
            align: "center"
        },*/ {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#goods-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: 'goods_name',
        noData: "LANG129 LANG5050",
        jsonReader: {
            root: "response.minibar_goods",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#goods-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
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
    numberList = UCMGUI.isExist.getList("getNumberList");

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listMiniBar",
            "auto-refresh": Math.random(),
            "options": "extension,minibar_name",
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
                var minibar = data.response.minibar_settings;

                existMiniBarCodes = [];
                existMiniBarNames = [];

                for (var i = 0, length = minibar.length; i < length; i++) {
                    var extension = minibar[i]['extension'],
                        name = minibar[i]['minibar_name'];

                    if (extension) {
                        existMiniBarCodes.push(extension);
                    }

                    if (name) {
                        existMiniBarNames.push(name);
                    }
                }
            }
        }
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listMiniBarWaiter",
            "auto-refresh": Math.random(),
            "options": "waiter_id",
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
                var maid = data.response.minibar_waiter;

                existMiniBarMaidCodes = [];

                for (var i = 0, length = maid.length; i < length; i++) {
                    var id = maid[i]['waiter_id'];

                    if (id) {
                        existMiniBarMaidCodes.push(id);
                    }
                }
            }
        }
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listMiniBarGoods",
            "auto-refresh": Math.random(),
            "options": "extension,goods_name",
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
                var goods = data.response.minibar_goods;

                existMiniBarGoodsCodes = [];
                existMiniBarGoodsNames = [];

                for (var i = 0, length = goods.length; i < length; i++) {
                    var extension = goods[i]['extension'],
                        name = goods[i]['goods_name'];

                    if (extension) {
                        existMiniBarGoodsCodes.push(extension);
                    }

                    if (name) {
                        existMiniBarGoodsNames.push(name);
                    }
                }
            }
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

function reflesh_status() {
    getLists();

    var table = $("#wakeup-list"),
        page = table.getGridParam("page"),
        rowNum = table.getGridParam("rowNum"),
        sidx = table.getGridParam("sortname"),
        sord = table.getGridParam("sortorder"),
        dataIDs = table.getDataIDs(),
        dataIDsLength = dataIDs.length,
        oRefleshData = {
            "action": "listWakeUp",
            "auto-refresh": Math.random(),
            "options": "address,w_action,w_date,w_status,room,send_status,w_time,w_type",
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
                var dataWithStatus = data.response.pms_wakeup,
                    dataWithStatusLength = dataWithStatus.length,
                    i = 0;

                if (dataWithStatusLength == dataIDsLength) {
                    for (i; i < dataWithStatusLength; i++) {
                        var rowId = dataIDs[i],
                            rowObject = table.getRowData(rowId),
                            address = dataWithStatus[i].address,
                            room = dataWithStatus[i].room,
                            send_status = dataWithStatus[i].send_status,
                            w_action = dataWithStatus[i].w_action,
                            w_date = dataWithStatus[i].w_date,
                            w_status = dataWithStatus[i].w_status,
                            w_time = dataWithStatus[i].w_time,
                            w_type = dataWithStatus[i].w_type;

                        rowObject.address = address;
                        rowObject.room = room;
                        rowObject.send_status = send_status;
                        rowObject.w_action = w_action;
                        rowObject.w_date = w_date;
                        rowObject.w_status = w_status;
                        rowObject.w_time = w_time;
                        rowObject.w_type = w_type;

                        table.setRowData(rowId, rowObject);
                    }
                }

            }
        }
    });

    setTimeout(reflesh_status, 5000);

    $P.lang(doc, true);
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

function transTableValue(cellvalue, options, rowObject) {
    var response;

    switch (options.colModel.name) {
        // case 'w_action':
        //     if (cellvalue === '0') {
        //         response = '<span locale="LANG4868"></span>';
        //     } else if (cellvalue === '1') {
        //         response = '<span locale="LANG4869"></span>';
        //     } else if (cellvalue === '2') {
        //         response = '<span locale="LANG4870"></span>';
        //     } else {
        //         response = '<span locale="LANG2403"></span>';
        //     }

        //     break;
        default:
            response = cellvalue;

            break;
    }

    return response;
}

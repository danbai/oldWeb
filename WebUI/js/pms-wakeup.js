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
    roomUsed = [],
    roomList = [];

Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.sortBy = top.Array.prototype.sortBy;
Array.prototype.lastValue = top.Array.prototype.lastValue;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4858"));

    createTable();

    bindButtonEvent();

    getLists();

    setTimeout(reflesh_status, 5000);
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            if (!(roomList.length - roomUsed.length)) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5039").format($P.lang("LANG4856").toLowerCase())
                });

                return false;
            }

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG4858")),
                displayPos: "editForm",
                frameSrc: "html/pms_wakeup_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#wakeup-list")
        .delegate('.edit', 'click', function(ev) {
            var room = $(this).attr('room'),
                address = $(this).attr('address');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG4858"), room),
                displayPos: "editForm",
                frameSrc: "html/pms_wakeup_modal.html?mode=edit&address=" + address + "&room=" + room
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var room = $(this).attr('room'),
                address = $(this).attr('address');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG4858"), room),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deletePMSWakeUp",
                            "address": address
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
                                            jumpPageOrNot(1);

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
    var edit = '<button address="' + rowObject.address + '" room="' + rowObject.room + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button address="' + rowObject.address + '" room="' + rowObject.room + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createTable(argument) {
    $("#wakeup-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listWakeUp"
        },
        colNames: [
            '<span locale="LANG4854"></span>',
            '<span locale="LANG4871"></span>',
            '<span locale="LANG1950"></span>',
            '<span locale="LANG4862"></span>',
            '<span locale="LANG203"></span>',
            '<span locale="LANG247"></span>',
            '<span locale="LANG4861"></span>',
            '<span locale="LANG74"></span>'
        ],
        colModel: [{
            name: 'room',
            index: 'room',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'w_action',
            index: 'w_action',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'w_type',
            index: 'w_type',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'w_status',
            index: 'w_status',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'w_date',
            index: 'w_date',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'w_time',
            index: 'w_time',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'send_status',
            index: 'send_status',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue,
            hidden: true
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
        // multiselect: true,
        viewrecords: true,
        sortname: 'room',
        noData: "LANG129 LANG4858",
        jsonReader: {
            root: "response.pms_wakeup",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#wakeup-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function getLists() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listPMSRoom",
            "auto-refresh": Math.random(),
            "options": "room,status",
            "sidx": "room",
            "sord": "asc"
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
                var rooms = data.response.pms_room;

                roomList = [];

                for (var i = 0, length = rooms.length; i < length; i++) {
                    var room = rooms[i]['room'],
                        status = rooms[i]['status'];

                    if (room) {
                        roomList.push(room);
                    }
                }
            }
        }
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listWakeUp",
            "auto-refresh": Math.random(),
            "options": "room"
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
                var wakeups = data.response.pms_wakeup;

                roomUsed = [];

                for (var i = 0, length = wakeups.length; i < length; i++) {
                    var room = wakeups[i]['room'];

                    if (room) {
                        roomUsed.push(room);
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
                } else {
                    jumpPageOrNot();

                    getLists();
                }

            }
        }
    });

    setTimeout(reflesh_status, 5000);

    $P.lang(doc, true);
}

function transTableValue(cellvalue, options, rowObject) {
    var response;

    switch (options.colModel.name) {
        case 'w_action':
            if (cellvalue === '0') {
                response = '<span locale="LANG4868"></span>';
            } else if (cellvalue === '1') {
                response = '<span locale="LANG4869"></span>';
            } else if (cellvalue === '2') {
                response = '<span locale="LANG4870"></span>';
            } else {
                response = '<span locale="LANG2403"></span>';
            }
            break;
        case 'w_type':
            if (cellvalue === '1') {
                response = '<span locale="LANG4866"></span>';
            } else if (cellvalue === '2') {
                response = '<span locale="LANG4867"></span>';
            } else {
                response = '<span locale="LANG2403"></span>';
            }
            break;
        case 'w_status':
            if (rowObject.w_action == '2') {
                if (cellvalue === '1') {
                    response = '<span locale="LANG4863"></span>';
                } else if (cellvalue === '2') {
                    response = '<span locale="LANG4864"></span>';
                } else if (cellvalue === '3') {
                    response = '<span locale="LANG2237"></span>';
                } else if (cellvalue === '4') {
                    response = '<span locale="LANG4865"></span>';
                } else {
                    response = '<span locale="LANG2403"></span>';
                }
            } else {
                response = '<span locale="LANG4948"></span>';
            }
            break;
        case 'send_status':
            if (cellvalue == '0') {
                response = '<span locale="LANG4153" style="color: gray;"></span>';
            } else if (cellvalue == '1') {
                response = '<span locale="LANG4154" style="color: green;"></span>';
            } else {
                response = '<span locale="LANG2403"></span>';
            }
            break;
        case 'w_date':
            if (cellvalue && cellvalue.substr) {
                var year, month, day;

                year = cellvalue.substr(0, 4);
                month = cellvalue.substr(4, 2);
                day = cellvalue.substr(6, 2);

                response = year + '-' + month + '-' + day;
            } else {
                response = '<span locale="LANG2403"></span>';
            }
            break;
        case 'w_time':
            if (cellvalue && cellvalue.substr) {
                var hour, minute;

                hour = cellvalue.substr(0, 2);
                minute = cellvalue.substr(2, 2);

                response = hour + ':' + minute;
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

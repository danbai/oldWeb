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
    existRooms = [],
    PMSProtocol = '',
    existAddress = [],
    accountList = [],
    existAccounts = [],
    roomAccountList = [],
    roomAccountObj = [];

Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.sortBy = top.Array.prototype.sortBy;
Array.prototype.lastValue = top.Array.prototype.lastValue;
Array.prototype.sortNumbers = top.Array.prototype.sortNumbers;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;
String.prototype.withOut = top.String.prototype.withOut;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4857"));

    createTable();

    bindButtonEvent();

    getPMSProtocol();

    getLists();

    setTimeout(reflesh_status, 5000);
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            if (!(roomAccountList.length - existAccounts.length)) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5039").format($P.lang("LANG85").toLowerCase())
                });

                return false;
            }

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG4856")),
                displayPos: "editForm",
                frameSrc: "html/pms_rooms_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnBatchAdd', 'click', function(ev) {

            if (!(roomAccountList.length - existAccounts.length)) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5039").format($P.lang("LANG85").toLowerCase())
                });

                return false;
            }

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4965").format($P.lang("LANG4969")),
                displayPos: "editForm",
                frameSrc: "html/pms_rooms_modal.html?mode=batchAdd"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnBatchDelete', 'click', function(ev) {

            var roomTable = $("#rooms-list"),
                records = roomTable.getGridParam("records"),
                selected = roomTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                addressList = [],
                confirmList = [],
                i = 0,
                rowdata,
                rowRoom,
                rowAdr;

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG4856").toLowerCase())
                });
                return false;
            }

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG4969").toLowerCase())
                });

                ev.stopPropagation();
                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = roomTable.jqGrid('getRowData', selected[i]);

                rowAdr = rowdata['address'].split('</span>');
                rowRoom = rowdata['room'].split('</span>');

                addressList.push(rowAdr.length > 1 ? rowAdr[1] : rowAdr[0]);
                confirmList.push("<font>" + (rowRoom.length > 1 ? rowRoom[1] : rowRoom[0]) + "</font>");
            }

            addressList.sortNumbers();

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG4969").toLowerCase(), confirmList.join('  ')),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG4969").toLowerCase())
                        });

                        var DO_SELECTED = function() { // DELETE_SELECTED_USERS();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "deletePMSRoom",
                                    "address": addressList.toString()
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
                                                jumpPageOrNot(selectedRowsLength);

                                                getLists();
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

    $("#rooms-list")
        .delegate('.edit', 'click', function(ev) {
            var room = $(this).attr('room'),
                address = $(this).attr('address'),
                extension = $(this).attr('extension');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG4856"), room),
                displayPos: "editForm",
                frameSrc: "html/pms_rooms_modal.html?mode=edit&address=" + address + "&room=" + room + "&extension=" + extension
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var room = $(this).attr('room'),
                address = $(this).attr('address');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG4856"), room),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deletePMSRoom",
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
                                var bool = UCMGUI.errorHandler(data);

                                if (bool) {
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
    var edit = '<button address="' + rowObject.address + '" room="' + rowObject.room + '" extension="' + rowObject.extension + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button address="' + rowObject.address + '" room="' + rowObject.room + '" extension="' + rowObject.extension + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createTable(argument) {
    $("#rooms-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listPMSRoom"
        },
        colNames: [
            '<span locale="LANG4893"></span>',
            '<span locale="LANG4854"></span>',
            '<span locale="LANG85"></span>',
            '<span locale="LANG4857"></span>',
            '<span locale="LANG2848"></span>',
            '<span locale="LANG2849"></span>',
            '<span locale="LANG2809"></span>',
            '<span locale="LANG4872"></span>',
            '<span locale="LANG4873"></span>',
            '<span locale="LANG4876"></span>',
            '<span locale="LANG4963"></span>',
            '<span locale="LANG74"></span>'
        ],
        colModel: [{
            name: 'address',
            index: 'address',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'room',
            index: 'room',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'status',
            index: 'status',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'first_name',
            index: 'first_name',
            width: 100,
            resizable: false,
            align: "center",
            hidden: true
        }, {
            name: 'last_name',
            index: 'last_name',
            width: 100,
            resizable: false,
            align: "center",
            hidden: true
        }, {
            name: 'user_name',
            index: 'user_name',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'account',
            index: 'account',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'vipcode',
            index: 'vipcode',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'credit',
            index: 'credit',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'maid',
            index: 'maid',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#rooms-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        viewrecords: true,
        sortname: 'address',
        noData: "LANG129 LANG4856",
        jsonReader: {
            root: "response.pms_room",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#rooms-list .jqgrow:even").addClass("ui-row-even");
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
            "action": "getSIPAccountList",
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
                accountList = data.response.extension;

                if (accountList.length) {
                    accountList = accountList.sortBy('extension');
                }

                roomAccountObj = transData(accountList);
            }
        }
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listPMSRoom",
            "auto-refresh": Math.random(),
            "options": "address,room,extension",
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

                existRooms = [];
                existAddress = [];
                existAccounts = [];

                for (var i = 0, length = rooms.length; i < length; i++) {
                    var extension = rooms[i]['extension'],
                        address = rooms[i]['address'],
                        room = rooms[i]['room'];

                    if (extension) {
                        existAccounts.push(extension);
                    }

                    if (room) {
                        existRooms.push(room);
                    }

                    if (address) {
                        existAddress.push(address);
                    }
                }
            }
        }
    });
}

function getPMSProtocol() {
    var action = {};

    action["action"] = "getPMSSettings";

    $.ajax({
        type: "post",
        url: "../cgi",
        dataType: "json",
        async: false,
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
                var settings = data.response.pms_settings;

                PMSProtocol = settings.pms_protocol;
            }
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#rooms-list"),
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

    var table = $("#rooms-list"),
        page = table.getGridParam("page"),
        rowNum = table.getGridParam("rowNum"),
        sidx = table.getGridParam("sortname"),
        sord = table.getGridParam("sortorder"),
        dataIDs = table.getDataIDs(),
        dataIDsLength = dataIDs.length,
        oRefleshData = {
            "action": "listPMSRoom",
            "auto-refresh": Math.random(),
            "options": "address,extension,first_name,last_name,room,status,user_name,account,maid,credit,vipcode",
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
                var dataWithStatus = data.response.pms_room,
                    dataWithStatusLength = dataWithStatus.length,
                    i = 0;

                if (dataWithStatusLength == dataIDsLength) {
                    for (i; i < dataWithStatusLength; i++) {
                        var rowId = dataIDs[i],
                            rowObject = table.getRowData(rowId),
                            extension = dataWithStatus[i].extension,
                            status = dataWithStatus[i].status,
                            address = dataWithStatus[i].address,
                            room = dataWithStatus[i].room,
                            first_name = dataWithStatus[i].first_name,
                            last_name = dataWithStatus[i].last_name,
                            account = dataWithStatus[i].account,
                            maid = dataWithStatus[i].maid,
                            credit = dataWithStatus[i].credit,
                            vipcode = dataWithStatus[i].vipcode,
                            user_name = dataWithStatus[i].user_name;

                        rowObject.extension = extension;
                        rowObject.status = status;
                        rowObject.address = address;
                        rowObject.room = room;
                        rowObject.first_name = first_name;
                        rowObject.last_name = last_name;
                        rowObject.account = account;
                        rowObject.maid = maid;
                        rowObject.credit = credit;
                        rowObject.vipcode = vipcode;
                        rowObject.user_name = user_name;

                        table.setRowData(rowId, rowObject);
                    }
                }
            }
        }
    });

    setTimeout(reflesh_status, 5000);

    $P.lang(doc, true);
}

function transData(res, cb) {
    var arr = [];

    roomAccountList = [];

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

        roomAccountList.push(extension);

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
        case 'status':
            if (cellvalue === '0') {
                response = '<span locale="LANG4941"></span>';
            } else if (cellvalue === '1') {
                response = '<span locale="LANG4942"></span>';
            } else if (cellvalue === '2') {
                response = '<span locale="LANG4943"></span>';
            } else if (cellvalue === '3') {
                response = '<span locale="LANG4944"></span>';
            } else {
                response = '<span locale="LANG4942"></span>';
            }

            break;
        case 'user_name':
            var firstName = rowObject.first_name,
                lastName = rowObject.last_name;

            response = firstName ?
                (firstName + (lastName ? (' ' + lastName) : '')) :
                (lastName ? lastName : '--');

            break;
        default:
            response = cellvalue ? cellvalue : '--';

            break;
    }

    return response;
}

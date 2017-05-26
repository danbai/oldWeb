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
    existIDs = [],
    existNames = [],
    modulesList = [],
    privilegeList = [],
    modulesObj = {
        'PMS': {
            'locale': 'LANG4855',
            'text': $P.lang('LANG4855'),
            'val': "PMS"
        },
        'activity_calls': {
            'locale': 'LANG3006',
            'text': $P.lang('LANG3006'),
            'val': "activity_calls"
        },
        'cdr_api': {
            'text': "CDR API",
            'val': "cdr_api"
        },
        'cdr_record': {
            'locale': 'LANG4053',
            'text': $P.lang('LANG4053'),
            'val': "cdr_record"
        },
        'meetme': {
            'locale': 'LANG3775',
            'text': $P.lang('LANG3775'),
            'val': "meetme"
        },
        'conference': {
            'locale': 'LANG18',
            'text': $P.lang('LANG18'),
            'val': "conference"
        },
        'pbx_status': {
            'locale': 'LANG1',
            'text': $P.lang('LANG1'),
            'val': "pbx_status"
        },
        'system_info': {
            'locale': 'LANG2',
            'text': $P.lang('LANG2'),
            'val': "system_info"
        },
        'warning': {
            'locale': 'LANG2580',
            'text': $P.lang('LANG2580'),
            'val': "warning"
        },
        'wakeup': {
            'locale': 'LANG4858',
            'text': $P.lang('LANG4858'),
            'val': "wakeup"
        }
    };

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

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG5167"));

    getLists();

    createTable();

    bindButtonEvent();
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            if (existIDs.length >= 6) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG808").format(6, $P.lang('LANG5167').toLowerCase())
                });

                return false;
            }

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG5167")),
                displayPos: "editForm",
                frameSrc: "html/custom_privilege_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("body.page")
        .delegate('.edit', 'click', function(ev) {
            var id = $(this).attr('privilege'),
                name = $(this).attr('name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG5167"), name),
                displayPos: "editForm",
                frameSrc: "html/custom_privilege_modal.html?mode=edit&id=" + id + "&name=" + name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var id = $(this).attr('privilege'),
                name = $(this).attr('name');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG5167").toLowerCase(), name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteCustomPrivilege",
                            "privilege_id": id
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
                                            getLists();

                                            createTable();
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

    if (rowObject.privilege_id > 2) {
        edit = '<button privilege="' + rowObject.privilege_id + '" name="' + rowObject.privilege_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>';

        if (rowObject.privilege_id > 3) {
            del = '<button privilege="' + rowObject.privilege_id + '" name="' + rowObject.privilege_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';
        } else {
            del = '<button privilege="' + rowObject.privilege_id + '" name="' + rowObject.privilege_name + '" title="Delete" localetitle="LANG739" class="options del disabled" disabled></button>';
        }
    } else {
        edit = '<button privilege="' + rowObject.privilege_id + '" name="' + rowObject.privilege_name + '" title="Edit" localetitle="LANG738" class="options edit disabled" disabled></button>';
        del = '<button privilege="' + rowObject.privilege_id + '" name="' + rowObject.privilege_name + '" title="Delete" localetitle="LANG739" class="options del disabled" disabled></button>';
    }

    return (edit + del);
}

function createTable() {
    $("#privilege-list").jqGrid('GridUnload');

    $("#privilege-list").jqGrid({
        // url: "../cgi?",
        // mtype: "POST",
        // postData: {
        //     "action": "listCustomPrivilege"
        // },
        data: privilegeList,
        datatype: "local",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        colNames: [
            '<span locale="LANG5168"></span>',
            '<span locale="LANG5172"></span>',
            '<span locale="LANG74"></span>'
        ],
        colModel: [{
            name: 'privilege_name',
            index: 'privilege_name',
            width: 100,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'privilege',
            index: 'privilege',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transValue,
            sortable: false
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#privilege-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        // sortname: 'privilege_id',
        noData: "LANG129 LANG5167",
        // jsonReader: {
        //     root: "response.privilege_id",
        //     page: "response.page",
        //     total: "response.total_page",
        //     records: "response.total_item",
        //     repeatitems: false
        // },
        loadComplete: function() {
            $("#privilege-list .jqgrow:even").addClass("ui-row-even");
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
            "page": "1",
            "sord": "asc",
            "item_num": "10000",
            "sidx": "privilege_id",
            "action": "listCustomPrivilege"
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
                var privilegeID = data.response.privilege_id;

                existIDs = [];
                existNames = [];
                privilegeList = [];

                for (var i = 0, length = privilegeID.length; i < length; i++) {
                    if (privilegeID[i].privilege_id > 3) {
                        existIDs.push(privilegeID[i].privilege_id);
                        existNames.push(privilegeID[i].privilege_name);
                    }

                    if (privilegeID[i].privilege_id !== 2) {
                        privilegeList.push(privilegeID[i]);
                    }
                }
            }
        }
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getModuleList"
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
                var modules = data.response.module;

                modulesList = [];
                modules = modules.split(',');

                for (var i = 0, length = modules.length; i < length; i++) {
                    modulesList.push(modulesObj[modules[i]]);
                }
            }
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#privilege-list"),
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

function transValue(cellvalue, options, rowObject) {
    var response;

    switch (options.colModel.name) {
        case 'privilege':
            var id = rowObject.privilege_id;

            if (id === 0) {
                response = '<span locale="LANG3860"></span>';
            } else if (id === 1) {
                response = '<span locale="LANG1047"></span>';
            } else if (id === 2) {
                response = '<span locale="LANG5173"></span>';
            } else if (id === 3) {
                response = '<span locale="LANG2863"></span>';
            } else {
                response = '<span locale="LANG5167"></span>';
            }

            break;
        default:
            response = cellvalue ? cellvalue : '--';

            break;
    }

    return response;
}

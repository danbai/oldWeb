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
    baseServerURl = config.paths.baseServerURl,
    dialList = [],
    destinationTypeValue;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3501"));

    destinationTypeValue = {
        'ringgroup': UCMGUI.isExist.getList("getRinggroupList"),
        'disa': UCMGUI.isExist.getList("getDISAList")
    };

    getList();

    createTable();

    bindButtonEvent();
});

function getList() {
    dialList = UCMGUI.isExist.getList("getNumberList");
}

function createTable() {
    $("#dial-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listSpeedDial"
        },
        colNames: [
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG3501">' + $P.lang('LANG3501') + '</span>',
            '<span locale="LANG1558">' + $P.lang('LANG1558') + '</span>',
            '<span locale="LANG1558">' + $P.lang('LANG1558') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'enable_destination',
            index: 'enable_destination',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transStatus
        }, {
            name: 'destination_type',
            index: 'destination_type',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transType,
            sortable: false
        }, {
            name: 'destination_num',
            index: 'destination_num',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transDestination,
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
        pager: "#dial-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: "extension",
        noData: "LANG129 LANG3501",
        jsonReader: {
            root: "response.speed_dial",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#dial-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(document, true);
        }
    });
}

function showDestination(val, arr, id, name) {
    for (var i = 0; i < arr.length; i++) {
        var ele = arr[i];

        if (val == ele[id]) {
            return ele[name];
        }
    }
}

function transDestination(cellvalue, options, rowObject) {
    var val = rowObject.destination_type,
        displayName = cellvalue; 

    if (cellvalue === null) {
        return '';
    }

    if (val === 'disa') {
        return showDestination(cellvalue, destinationTypeValue[val], 'disa_id', 'display_name');
    } else if (val === 'ringgroup') {
        return showDestination(cellvalue, destinationTypeValue[val], 'extension', 'ringgroup_name');
    }

    return displayName;
}

function transStatus(cellvalue, options, rowObject) {
    switch (cellvalue) {
        case 'yes':
            return '<span class="green" locale="LANG274">' + $P.lang('LANG274') + '</span>';
            break;
        case 'no':
            return '<span locale="LANG273">' + $P.lang('LANG273') + '</span>';
    }
}

function transType(cellvalue, options, rowObject) {
    switch (cellvalue) {
        case 'account':
            return '<span locale="LANG85"></span>';
        case 'voicemail':
            return '<span locale="LANG90"></span>';
        case 'conference':
            return '<span locale="LANG98"></span>';
        case 'vmgroup':
            return '<span locale="LANG89"></span>';
        case 'ivr':
            return '<span locale="LANG19"></span>';
        case 'ringgroup':
            return '<span locale="LANG600"></span>';
        case 'queue':
            return '<span locale="LANG91"></span>';
        case 'paginggroup':
            return '<span locale="LANG94"></span>';
        case 'fax':
            return '<span locale="LANG95"></span>';
        case 'disa':
            return '<span locale="LANG2353"></span>';
        case 'directory':
            return '<span locale="LANG2884"></span>';
        case 'external_number':
            return '<span locale="LANG3458"></span>';
    }
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            var total = parseInt($('#dial-pager').find('.total').text(), 10);

            if (total > 100) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5094")
                });
                return;
            }

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG5087"),
                displayPos: "dial_modal",
                frameSrc: "html/dial_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#dial-list")
        .delegate('.edit', 'click', function(ev) {
            var speed_dial = $(this).attr('speed_dial');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG3501"), speed_dial),
                displayPos: "dial_modal",
                frameSrc: "html/dial_modal.html?mode=edit&speed_dial=" + speed_dial
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var speed_dial = $(this).attr('speed_dial');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(speed_dial),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteSpeedDial",
                            "speed_dial": speed_dial
                        };

                        $.ajax({
                            type: "post",
                            url: baseServerURl,
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
                                            var table = $("#dial-list"),
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

                                            getList();
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

            ev.stopPropagation();
            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var edit = ('<button speed_dial="' + rowObject.extension + '" title="Edit" localetitle="LANG738" class="options edit"></button>'),
        del = ('<button speed_dial="' + rowObject.extension + '" title="Delete" localetitle="LANG739" class="options del"></button>');

    return (edit + del);
}
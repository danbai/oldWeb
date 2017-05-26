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
    selectbox = UCMGUI.domFunction.selectbox,
    PinSetsNameList = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
String.prototype.contains = top.String.prototype.contains;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2474"));

    createTable();

    getNameList();

    bindButtonEvent();

    top.Custom.init(doc);
});

function createOptions(cellvalue, options, rowObject) {
    var edit = ('<button id="' + rowObject.pin_sets_id + '" name="' + rowObject.pin_sets_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>'),
        del = ('<button id="' + rowObject.pin_sets_id + '" name="' + rowObject.pin_sets_name + '" title="Delete" localetitle="LANG739" class="options del"></button>');

    return (edit + del);
}

function createTable() {
    $("#PinSetsList").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listPinSets"
        },
        colNames: [
            '<span locale="LANG4557">' + $P.lang('LANG4557') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG4559">' + $P.lang('LANG4559') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'pin_sets_id',
            index: 'pin_sets_id',
            width: 100,
            resizable: false,
            hidden: true,
            align: "center"
        }, {
            name: 'pin_sets_name',
            index: 'pin_sets_name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'record_in_cdr',
            index: 'record_in_cdr',
            width: 100,
            resizable: false,
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
        pager: "#PinSetsPager",
        loadui: 'disable',
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: false,
        subGrid: true,
        subGridRowExpanded: function(subgrid_id, row_id) {
            var table = $("<table>").attr({
                id: "table_memberlist",
                width: '100%',
                cellpadding: 0,
                cellspacing: 0,
                border: 0,
                align: "center"
            }).css("display", "none");

            var thead = $("<thead>").attr("id", "").appendTo(table);
            var theadTr = $("<tr>").addClass('frow threaduser').appendTo(thead);
            var theadTrTd = $("<td width='13px'></td>" +
                "<td width='100px' locale='LANG4555' align='center'>" + $P.lang('LANG4555') + "</td>" +
                "<td width='100px' locale='LANG4556' align='center'>" + $P.lang('LANG4556') + "</td>").appendTo(theadTr);
            var tbody = $("<tbody>").attr("id", "usercontain").appendTo(table);

            var action = {
                "action": "getPinSets",
                "pin_sets_id": $("#" + row_id).children().eq(1).text()
            };

            $.ajax({
                type: "post",
                url: "../cgi",
                data: action,
                error: function(jqXHR, textStatus, errorThrown) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: errorThrown
                    });
                },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);

                    if (bool) {
                        var members = data.response.members,
                            str = "",
                            ele;

                        for (var i = 0; i < members.length; i++) {
                            ele = members[i];
                            str += '<tr><td></td><td>' + ele.pin + '</td><td>' + ele.pin_name + '</td></tr>';
                        }

                        tbody.html(str);
                    }
                }
            });

            $("#" + subgrid_id).append(table);

            table.show();
        },
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'pin_sets_id',
        noData: "LANG129 LANG4553",
        jsonReader: {
            root: "response.pin_sets_id",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#PinSetsList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG4554")),
                displayPos: "editForm",
                frameSrc: "html/pin_sets_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $('#PinSetsList')
        .delegate('.edit', 'click', function(ev) {
            var id = $(this).attr('id'),
                name = $(this).attr('name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG4554"), name),
                displayPos: "editForm",
                frameSrc: "html/pin_sets_modal.html?mode=edit&id=" + id
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var id = $(this).attr('id'),
                name = $(this).attr('name');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deletePinSets",
                            "pin_sets_id": id
                        };

                        $.ajax({
                            type: "post",
                            url: "/cgi",
                            data: action,
                            // error: function(jqXHR, textStatus, errorThrown) {
                            //     top.dialog.clearDialog();
                            //     top.dialog.dialogMessage({
                            //         type: 'error',
                            //         content: $P.lang("LANG909")
                            //     });
                            // },
                            success: function(data) {
                                if (data.status == 0) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            var table = $("#PinSetsList"),
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

                                            getNameList();
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

function getNameList() {
    var action = {
        'action': 'listPinSets'
    };

    PinSetsNameList = [];

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
                    var PinSets = res.pin_sets_id;

                    for (var i = 0; i < PinSets.length; i++) {
                        var name = PinSets[i]["pin_sets_name"];

                        if (name) {
                            PinSetsNameList.push(name);
                        }
                    };
                }
            }
        }
    });
}

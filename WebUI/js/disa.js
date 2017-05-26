/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

$(function() {
    String.prototype.format = top.String.prototype.format;
    $P.lang(doc, true);
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2353"));
    bindButtonEvent();
    createTable();
    getNameList();
});

function getNameList() {
    disaNameList = UCMGUI.isExist.getList("getDISANameList");
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button disa_id="' + rowObject.disa_id + '" disaName="' + rowObject.display_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>';
    var del = '<button disa_id="' + rowObject.disa_id + '" disaName="' + rowObject.display_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    var options = edit + del;

    return options;
}

function createTable() {
    $("#disa-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listDISA"
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG1069">' + $P.lang('LANG1069') + '</span>',
            '<span locale="LANG2358">' + $P.lang('LANG2358') + '</span>',
            '<span locale="LANG2360">' + $P.lang('LANG2360') + '</span>',
            '<span locale="LANG2363">' + $P.lang('LANG2363') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'display_name',
            index: 'display_name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'permission',
            index: 'permission',
            width: 150,
            resizable: false,
            align: "center",
            formatter: function(cellvalue, options, rowObject) {
                var perms = {
                        "internal": '<span locale="LANG1071">' + $P.lang('LANG1071') + '</span>',
                        "internal-local": '<span locale="LANG1072">' + $P.lang('LANG1072') + '</span>',
                        "internal-local-national": '<span locale="LANG1073">' + $P.lang('LANG1073') + '</span>',
                        "internal-local-national-international": '<span locale="LANG1074">' + $P.lang('LANG1074') + '</span>'
                    };

                return perms[cellvalue];
            }
        }, {
            name: 'response_timeout',
            index: 'response_timeout',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 'digit_timeout',
            index: 'digit_timeout',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 'hangup',
            index: 'hangup',
            width: 150,
            resizable: false,
            align: "center",
            formatter: function(cellvalue, options, rowObject) {
                var perms = {
                        "no": '<span locale="LANG137">' + $P.lang('LANG137') + '</span>',
                        "yes": '<span locale="LANG136">' + $P.lang('LANG136') + '</span>'
                    };

                return perms[cellvalue];
            }
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#disa-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        //multiselect: true,
        //multiboxonly: true,
        viewrecords: true,
        sortname: "display_name",
        noData: "LANG129 LANG2353",
        jsonReader: {
            root: "response.disa",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#disa-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2355"),
                displayPos: "edit_disa_div",
                frameSrc: "html/disa_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#disa-list")
        .delegate('.edit', 'click', function(ev) {

            var disaId = $(this).attr('disa_id');
            var disaName = $(this).attr('disaName');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG2353"), disaName),
                displayPos: "edit_disa_div",
                frameSrc: "html/disa_modal.html?mode=edit&disaId=" + disaId
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var disaId = $(this).attr('disa_id');
            var disaName = $(this).attr('disaName');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(disaName),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteDISA",
                            "disa": disaId
                        };

                        $.ajax({
                            type: "post",
                            url: "/cgi",
                            data: action,
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
                                    top.dialog.clearDialog();
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            jumpPageOrNot(1);
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

function jumpPageOrNot(selectedRows) {
    var table = $("#disa-list"),
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
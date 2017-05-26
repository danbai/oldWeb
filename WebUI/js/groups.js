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
    showMembers = UCMGUI.showMembers,
    showMembersTitle = UCMGUI.showMembersTitle,
    baseServerURl = config.paths.baseServerURl,
    accountList = [],
    accountObjectList = [],
    groupsNameList = [];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2705"));
    createTable();
    bindButtonEvent();
    getNameList();
});

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button group_id="' + rowObject.group_id + '" group_name = "' + rowObject.group_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>';
    var del = '<button group_id="' + rowObject.group_id + '" group_name = "' + rowObject.group_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    var options = edit + del;
    
    return options;
}

function getNameList() {
    accountObjectList = transData(UCMGUI.isExist.getList("getAccountList"));
    groupsNameList = UCMGUI.isExist.getList("getExtensionGroupNameList");
}

function createTable(argument) {
    $("#groups_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listExtensionGroup"
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG128">' + $P.lang('LANG128') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'group_name',
            index: 'group_name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'members',
            index: 'members',
            width: 150,
            resizable: false,
            align: "center",
            formatter: showMembers,
            cellattr: showMembersTitle
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#groups_list_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        //multiselect: true,
        viewrecords: true,
        sortname: 'group_name',
        noData: "LANG129 LANG2800",
        jsonReader: {
            root: "response.extension_group",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#groups_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#new_group_button', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2706"),
                displayPos: "editForm",
                frameSrc: "html/groups_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#groups_list")
        .delegate('.edit', 'click', function(ev) {
            var group_id = $(this).attr('group_id'),
                group_name = $(this).attr('group_name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG2714"), group_name),
                displayPos: "editForm",
                frameSrc: "html/groups_modal.html?mode=edit&group_id=" + group_id + "&group_name=" + group_name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var group_id = $(this).attr('group_id'),
                group_name = $(this).attr('group_name');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG2714"),group_name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteExtensionGroup",
                            "extension_group": group_id
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
                                        // top.dialog.clearDialog();
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG816")
                                        });

                                        var table = $("#groups_list"),
                                            totalPage = table.getGridParam("lastpage"),
                                            page = table.getGridParam("page"),
                                            reccount = table.getGridParam("reccount");

                                        if (page === totalPage && totalPage > 1 && reccount === 1) {
                                            table.setGridParam({page: totalPage - 1}).trigger('reloadGrid');
                                        } else {
                                            table.trigger('reloadGrid');
                                        }

                                        getNameList();
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

function transData(res, cb) {
    var arr = [];

    accountList = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"': '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"': '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"': '');
        }

        accountList.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
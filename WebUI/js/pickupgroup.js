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
    baseServerURl = config.paths.baseServerURl,
    pickupgroupExtList = [],
    pickupgroupgroupExt = [],
    extgroupList = [],
    extgroupListObj = {},
    numberList = [],
    pickuproupNameList = [];
    // pickupgroupgroupRange = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2510"));

    getLists();

    createTable();

    bindTopButtonEvent();

    bindGridButtonEvent();

    getNameList();
});

function transTable() {
    var container = "<table id='pickupgroup_list'></table><div id='pickupgroup_list_pager'></div>";

    $("#pickupgroup_div").empty();

    $(container).appendTo("#pickupgroup_div");

    createTable();

    bindGridButtonEvent();
}

function transMembersData(res) {
    if (!res) {
        return "";
    }

    var res = res.split(',');

    for (var i = 0; i < res.length; i++) {
        var extgroupListObjItem = extgroupListObj[res[i]];

        if (extgroupListObjItem) {
            res[i] = $P.lang("LANG2714") + "--" + extgroupListObjItem["text"];
        }
    }

    return res.join(",");
}

function showMembers(cellvalue, options, rowObject) {
    if (!cellvalue) {
        return "";
    }
    cellvalue = transMembersData(cellvalue);
    var memAry = cellvalue.split(','),
        memAryLength = memAry.length;

    if (memAryLength > 10) {
        return memAry[0] + ',' + memAry[1] + ',...,' + memAry[parseInt(memAryLength / 2)] + ',' + memAry[parseInt(memAryLength / 2) + 1] + ',...,' + memAry[memAryLength - 2] + ',' + memAry[memAryLength - 1];
    } else {
        return cellvalue;
    }
}

function showMembersTitle(rowId, tv, rawObject, cm, rdata) {
    var members = transMembersData(rawObject.members ? rawObject.members : "");
    return 'title="' + members + '"';
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button pickupgroupId = "' + rowObject.pickupgroup_id + '" pickupgroupName = "' + rowObject.pickupgroup_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>';
    var del = '<button  pickupgroupId = "' + rowObject.pickupgroup_id + '" pickupgroupName = "' + rowObject.pickupgroup_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    var options = edit + del;

    return options;
}

function getLists() {
    var accountList = UCMGUI.isExist.getList("getAccountList");

    pickupgroupExtList = transData(accountList);

    extgroupList = UCMGUI.isExist.getList("getExtensionGroupList");

    for (var i = 0; i < extgroupList.length; i++) {
        var groupId = extgroupList[i]["group_id"];
        var groupName = extgroupList[i]["group_name"];

        pickupgroupExt.push(groupId);

        extgroupListObj[groupId] = {
            val: groupId,
            text: groupName
        };
    }

}

function getNameList() {
    pickupgroupNameList = UCMGUI.isExist.getList("getPickupgroupNameList");
}

function createTable() {
    $("#pickupgroup_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listPickupgroup"
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG128">' + $P.lang('LANG128') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'pickupgroup_name',
            index: 'pickupgroup_name',
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
        pager: "#pickupgroup_list_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        //multiselect: true,
        viewrecords: true,
        sortname: 'pickupgroup_name',
        noData: "LANG129 LANG2912",
        jsonReader: {
            root: "response.pickupgroup",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#pickupgroup_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function bindTopButtonEvent() {
    $('div.top_buttons')
        .delegate('#new_pickupgroup_button', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2910"),
                displayPos: "editForm",
                frameSrc: "html/pickupgroup_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });
}

function bindGridButtonEvent() {
    $("#pickupgroup_list")
        .delegate('.edit', 'click', function(ev) {
            var pickupgroupId = $(this).attr('pickupgroupId'),
                pickupgroupName = $(this).attr('pickupgroupName');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG2912"), pickupgroupName),
                displayPos: "editForm",
                frameSrc: "html/pickupgroup_modal.html?mode=edit&pickupgroupId=" + pickupgroupId + "&pickupgroupName=" + pickupgroupName
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var pickupgroupId = $(this).attr('pickupgroupId'),
                pickupgroupName = $(this).attr('pickupgroupName');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG2912"), pickupgroupName),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deletePickupgroup",
                            "Pickupgroup": pickupgroupId
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
                                            var table = $("#pickupgroup_list"),
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

function transData(res, cb) {
    var arr = [];

    pickupgroupExt = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            type = res[i].account_type,
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        if (type.toUpperCase() === 'IAX') {
            continue;
        }

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"': '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"': '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"': '');
        }

        pickupgroupExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
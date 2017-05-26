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
    portExtensionList = [],
    vmgroupExtList = [],
    vmgroupExt = [],
    numberList = [],
    vmgroupNameList = [],
    vmgroupRange = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG660"));

    createTable();

    bindButtonEvent();

    getListsAndRange();

    getNameList();

    getPortExtension();
});

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button extension="' + rowObject.extension + '" vmgroup_name = "' + rowObject.vmgroup_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button extension="' + rowObject.extension + '" vmgroup_name = "' + rowObject.vmgroup_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function getListsAndRange() {
    var vmgroupList = UCMGUI.isExist.getList("getVoiceMailList").extension;

    vmgroupExtList = transData(vmgroupList);

    vmgroupRange = UCMGUI.isExist.getRange('vmgroup');
}

function getNameList() {
    numberList = UCMGUI.isExist.getList("getNumberList");
    vmgroupNameList = UCMGUI.isExist.getList("getVMgroupNameList");
}

function getPortExtension() {
    portExtensionList = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getFeatureCodes"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var featureSettings = data.response.feature_settings,
                    parkext = featureSettings.parkext,
                    parkpos = featureSettings.parkpos.split('-');

                portExtensionList.push(parseInt(parkext, 10));

                for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                    portExtensionList.push(i);
                }
            }
        }
    });
}

function createTable(argument) {
    $("#VMGroups_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listVMgroup"
        },
        colNames: [
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG1572">' + $P.lang('LANG1572') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center",
            formatter: sliceName,
            cellattr: sliceNameTitle
        }, {
            name: 'vmgroup_name',
            index: 'vmgroup_name',
            width: 100,
            resizable: false,
            align: "center",
            formatter: sliceName,
            cellattr: sliceNameTitle
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
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#VMGroups_list_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: 'extension',
        noData: "LANG129 LANG89",
        jsonReader: {
            root: "response.vmgroup",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#VMGroups_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#new_vmgroup_button', 'click', function(ev) {
            var vmgMaxnumber = 50;

            if (vmgroupNameList.length >= vmgMaxnumber) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG863").format(vmgMaxnumber)
                });
            } else {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG772"),
                    displayPos: "editForm",
                    frameSrc: "html/vmgroup_modal.html?mode=add"
                });
            }

            ev.stopPropagation();
            return false;
        });

    $("#VMGroups_list")
        .delegate('.edit', 'click', function(ev) {
            var extension = $(this).attr('extension'),
                vmgroup_name = $(this).attr('vmgroup_name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG89"), extension),
                displayPos: "editForm",
                frameSrc: "html/vmgroup_modal.html?mode=edit&extension=" + extension + "&vmgroup_name=" + vmgroup_name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var extension = $(this).attr('extension');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG89"), extension),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteVMgroup",
                            "vmgroup": extension
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
    var table = $("#VMGroups_list"),
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

function sliceName(cellvalue, options, rowObject) {
    return (cellvalue.length > 30) ? cellvalue.substr(0, 30) + '...' : cellvalue;
}

function sliceNameTitle(rowId, tv, rawObject, cm, rdata) {
    return (cm.index == 'extension') ? ('title="' + rawObject.extension + '"') : ('title="' + rawObject.vmgroup_name + '"');
}

function transData(res, cb) {
    var arr = [];

    vmgroupExt = [];

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

        vmgroupExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
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
    directoryExt = [],
    directoryExtList = [],
    extgroupList = [],
    extgroupListObj = {},
    numberList = [],
    directoryNameList = [],
    directoryRange = [],
    portExtensionList = [],
    LDAPmemberList = [],
    LDAPmemberExt = [];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2884"));

    getListsAndRange();

    createTable();

    bindTopButtonEvent();

    bindGridButtonEvent();

    getPortExtension();

    getNameList();
});

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

function getListsAndRange() {
    var accountList = UCMGUI.isExist.getList("getAccountList");

    directoryExtList = transData(accountList);

    extgroupList = UCMGUI.isExist.getList("getExtensionGroupList");

    for (var i = 0; i < extgroupList.length; i++) {
        var groupId = extgroupList[i]["group_id"],
            groupName = extgroupList[i]["group_name"];

        directoryExt.push(groupId);

        extgroupListObj[groupId] = {
            val: groupId,
            text: groupName
        };
    }

    directoryRange = UCMGUI.isExist.getRange('directory');

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listPhonebookDn",
            "options": "id,dn"
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var arr = [],
                    memberLDAP = data.response.ldap_phonebooks;

                for (var i = 0; i < memberLDAP.length; i++) {
                    var obj = {};

                    if (memberLDAP[i]["dn"] != "ou=pbx,dc=pbx,dc=com") {
                        obj["phonebook_dn"] = memberLDAP[i]["dn"];

                        LDAPmemberExt.push(memberLDAP[i]['dn'])

                        arr.push(obj);
                    }
                }

                LDAPmemberList = arr;
            }
        }
    });
}

function getNameList() {
    numberList = UCMGUI.isExist.getList("getNumberList");
    directoryNameList = UCMGUI.isExist.getList("getDirectoryNameList");
}

function bindTopButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2885"),
                displayPos: "editForm",
                frameSrc: "html/directory_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });
}

function bindGridButtonEvent() {
    $("#directory-list")
        .delegate('.edit', 'click', function(ev) {
            var directoryExt = $(this).attr('directoryExt'),
                directory_name = $(this).attr('directory_name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2729").format(directoryExt),
                displayPos: "editForm",
                frameSrc: "html/directory_modal.html?mode=edit&directoryExt=" + directoryExt + "&directory_name=" + directory_name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var directoryExt = $(this).attr('directoryExt');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG2884"), directoryExt),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteDirectory",
                            "directory": directoryExt
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
            return false;
        });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#directory-list"),
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

function transTable() {
    var container = "<table id='directory-list'></table><div id='directory-pager'></div>";

    $("#directory_div").empty();

    $(container).appendTo("#directory_div");

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

        if (res[i].indexOf('dc=') > -1) {
            delete res[i];
        }

        if (extgroupListObjItem) {
            res[i] = $P.lang("LANG2714") + "--" + extgroupListObjItem["text"];
        }
    }

    res = $.grep(res, function(n) {
        return(n)
    });

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
    var edit = ('<button directoryExt="' + rowObject.extension + '" directory_name = "' + rowObject.name + '" title="Edit" localetitle="LANG738" class="options edit"></button>'),
        del = '<button directoryExt="' + rowObject.extension + '" directory_name = "' + rowObject.name + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createTable() {
    $("#directory-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listDirectory"
        },
        colNames: [
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG128">' + $P.lang('LANG128') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'name',
            index: 'name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'members',
            index: 'members',
            width: 200,
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
        pager: "#directory-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'extension',
        noData: "LANG129 LANG2884",
        jsonReader: {
            root: "response.directory",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#directory-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function transData(res, cb) {
    var arr = [];

    directoryExt = [];

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

        directoryExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
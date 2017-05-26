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
    ringgroupExt = [],
    ringgroupExtList = [],
    extgroupList = [],
    extgroupListObj = {},
    numberList = [],
    mohNameList = [],
    ringgroupNameList = [],
    ringgroupRange = [],
    portExtensionList = [],
    LDAPmemberList = [],
    destinationTypeValue = {
        'account': [],
        'voicemail': [],
        'queue': [],
        'ringgroup': [],
        'vmgroup': [],
        'ivr': []
    },
    ivrNameArr = [{
        val: "",
        locale: "LANG133",
        text: $P.lang("LANG133")
    }];

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG600"));

    getListsAndRange();

    createTable();

    bindTopButtonEvent();

    bindGridButtonEvent();

    getNameList();

    getPortExtension();

    getCustomPrompt();
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

    ringgroupExtList = transData(accountList);

    extgroupList = UCMGUI.isExist.getList("getExtensionGroupList");

    for (var i = 0; i < extgroupList.length; i++) {
        var groupId = extgroupList[i]["group_id"],
            groupName = extgroupList[i]["group_name"];

        ringgroupExt.push(groupId);
        extgroupListObj[groupId] = {
            val: groupId,
            text: groupName
        };
    }

    var mohName = UCMGUI.isExist.getList("getMohNameList");

    mohNameList = transMusicData(mohName);

    mohNameList.unshift({
        val: "",
        locale: "LANG133",
        text: $P.lang("LANG133")
    });

    destinationTypeValue = {
        'account': UCMGUI.isExist.getList("getAccountList"),
        'voicemail': UCMGUI.isExist.getList("getVoicemailList"),
        'queue': UCMGUI.isExist.getList("getQueueList"),
        'ringgroup': UCMGUI.isExist.getList("getRinggroupList"),
        'vmgroup': UCMGUI.isExist.getList("getVMgroupList"),
        'ivr': UCMGUI.isExist.getList("getIVRList")
    };

    // voicemailList = UCMGUI.isExist.getList("getVoicemailList");
    ringgroupRange = UCMGUI.isExist.getRange('ringgroup');

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getPhonebookListDnAndMembers"
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
                    memberLDAP = data.response.extension;

                for (var i = 0; i < memberLDAP.length; i++) {
                    var phonebook = memberLDAP[i]["phonebook_dn"];

                    if (phonebook && (phonebook !== "ou=pbx,dc=pbx,dc=com")) {
                        var members = memberLDAP[i]["members"] ? memberLDAP[i]["members"].split('|') : [];

                        for (var j = 0, length = members.length; j < length; j++) {
                            var extension = members[j];

                            if (extension) {
                                arr.push(extension + '#' + phonebook);
                            }
                        }
                    }
                }

                LDAPmemberList = arr;
            }
        }
    });
}

function getNameList() {
    numberList = UCMGUI.isExist.getList("getNumberList");

    ringgroupNameList = UCMGUI.isExist.getList("getRinggroupNameList");

    destinationTypeValue['ringgroup'] = UCMGUI.isExist.getList("getRinggroupList");
}

function getCustomPrompt() {
    var action = {
        "action": "listFile",
        "type": "ivr",
        "filter": JSON.stringify({
            "list_dir": 0,
            "list_file": 1,
            "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
        }),
        "sidx": "n",
        "sord": "desc"
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
                var res = data.response;

                if (res) {
                    var ivr = res.ivr;

                    for (var i = 0; i < ivr.length; i++) {
                        var name = ivr[i]["n"],
                            obj = {
                                text: name,
                                val: "record/" + removeSuffix(name)
                            };

                        ivrNameArr.push(obj);
                    };
                }
            }
        }
    });
}

function bindTopButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG602"),
                displayPos: "editForm",
                frameSrc: "html/ringgroup_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });
}

function bindGridButtonEvent() {
    $("#ringgroup-list")
        .delegate('.edit', 'click', function(ev) {
            var ringgroupExt = $(this).attr('ringgroupExt'),
                ringgroup_name = $(this).attr('ringgroup_name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG603").format(ringgroupExt),
                displayPos: "editForm",
                frameSrc: "html/ringgroup_modal.html?mode=edit&ringgroupExt=" + ringgroupExt + "&ringgroup_name=" + ringgroup_name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var ringgroupExt = $(this).attr('ringgroupExt');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG600"), ringgroupExt),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteRinggroup",
                            "ringgroup": ringgroupExt
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
    var table = $("#ringgroup-list"),
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
    var container = "<table id='ringgroup-list'></table><div id='ringgroup-pager'></div>";

    $("#ringgroup_div").empty();

    $(container).appendTo("#ringgroup_div");

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

        if (res[i].indexOf('ou=') > -1) {
            res[i] = res[i].replace(/#/g, '(') + ')';
        }

        if (res[i].indexOf('dc=') > -1) {
            delete res[i];
        }
    }

    res = $.grep(res, function(n) {
        return (n)
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
    var edit = ('<button ringgroupExt="' + rowObject.extension + '" ringgroup_name = "' + rowObject.ringgroup_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>'),
        del = '<button ringgroupExt="' + rowObject.extension + '" ringgroup_name = "' + rowObject.ringgroup_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createStrategy(cellvalue, options, rowObject) {
    var strategy;

    switch (cellvalue) {
        case 'SIMULTA':
            strategy = '<span locale="LANG1062">' + $P.lang('LANG1062') + '</span>';
            break;
        case 'ORDER':
            strategy = '<span locale="LANG1063">' + $P.lang('LANG1063') + '</span>';
            break;
        default:
            strategy = '';
            break;
    }

    return strategy;
}

function createTable() {
    $("#ringgroup-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listRinggroup"
        },
        colNames: [
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG1137">' + $P.lang('LANG1137') + '</span>',
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
            name: 'ringgroup_name',
            index: 'ringgroup_name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'strategy',
            index: 'strategy',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createStrategy
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
        pager: "#ringgroup-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'extension',
        noData: "LANG129 LANG600",
        jsonReader: {
            root: "response.ringgroup",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#ringgroup-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function transMusicData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj["val"] = res[i];

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transData(res, cb) {
    var arr = [];

    ringgroupExt = [];

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

        ringgroupExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function removeSuffix(filename) {
    var name = filename.toLocaleLowerCase(),
        file_suffix = [".mp3", ".wav", ".gsm", ".ulaw", ".alaw"];

    for (var i = 0; i < file_suffix.length; i++) {
        var num = name.lastIndexOf(file_suffix[i]);

        if (num != -1 && name.endsWith(file_suffix[i])) {
            filename = filename.substring(0, num);

            return filename;
        }
    }
}
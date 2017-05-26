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
    codeblueExt = [],
    codeblueExtList = [],
    extgroupList = [],
    extgroupListObj = {},
    numberList = [],
    codeblueNameList = [],
    codeblueNumberList = [],
    codeblueGroupNameList = [],
    codeblueGroupNumberList = [],
    portExtensionList = [],
    ivrNameArr = [];

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4338"));

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

    codeblueExtList = transData(accountList);

    // extgroupList = UCMGUI.isExist.getList("getExtensionGroupList");

    // for (var i = 0; i < extgroupList.length; i++) {
    //     var groupId = extgroupList[i]["group_id"],
    //         groupName = extgroupList[i]["group_name"];

    //     codeblueExt.push(groupId);

    //     extgroupListObj[groupId] = {
    //         val: groupId,
    //         text: groupName
    //     };
    // }
}

function getNameList() {
    codeblueNameList = [];
    codeblueNumberList = [];
    codeblueGroupNameList = [];
    codeblueGroupNumberList = [];

    numberList = UCMGUI.isExist.getList("getNumberList");

    $.ajax({
        type: "post",
        url: "/cgi",
        async: false,
        data: {
            "action": "listCodeblueCode"
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
                var res = data.response;

                if (res) {
                    var code = res.codeblue_code;

                    for (var i = 0; i < code.length; i++) {
                        codeblueNameList.push(code[i].code_name);
                        codeblueNumberList.push(code[i].extension);
                    }
                }
            }
        }
    });

    $.ajax({
        type: "post",
        url: "/cgi",
        async: false,
        data: {
            "action": "listCodeblueGroup"
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
                var res = data.response;

                if (res) {
                    var group = res.codeblue_group;

                    for (var i = 0; i < group.length; i++) {
                        codeblueGroupNameList.push(group[i].group_name);
                        codeblueGroupNumberList.push(group[i].extension);
                    }
                }
            }
        }
    });
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
                    }
                }
            }
        }
    });
}

function bindTopButtonEvent() {
    $('.page')
        .delegate('#addCode', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG4338")),
                displayPos: "editForm",
                frameSrc: "html/codeblue_modal.html?mode=add&type=code"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#addCodeGroup', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG4339")),
                displayPos: "editForm",
                frameSrc: "html/codeblue_modal.html?mode=add&type=group"
            });

            ev.stopPropagation();
            return false;
        });
}

function bindGridButtonEvent() {
    $("#codeblueList")
        .delegate('.edit', 'click', function(ev) {
            var extension = $(this).attr('extension'),
                name = $(this).attr('name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG4338"), name),
                displayPos: "editForm",
                frameSrc: "html/codeblue_modal.html?mode=edit&type=code&extension=" + extension + "&name=" + name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var extension = $(this).attr('extension'),
                name = $(this).attr('name');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG4338"), name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteCodeblueCode",
                            "codeblue_code": extension
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
                                            jumpPageOrNot('codeblueList', 1);

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

    $("#codeblueGroupList")
        .delegate('.edit', 'click', function(ev) {
            var extension = $(this).attr('extension'),
                name = $(this).attr('name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG4339"), name),
                displayPos: "editForm",
                frameSrc: "html/codeblue_modal.html?mode=edit&type=group&extension=" + extension + "&name=" + name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var extension = $(this).attr('extension'),
                name = $(this).attr('name');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG4339"), name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteCodeblueGroup",
                            "codeblue_group": extension
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
                                            jumpPageOrNot('codeblueGroupList', 1);

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

function jumpPageOrNot(gridID, selectedRows) {
    var table = $('#' + gridID),
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
    var codeGrid = "<table id='codeblueList'></table><div id='codeblueListPager'></div>",
        codeGroupGrid = "<table id='codeblueGroupList'></table><div id='codeblueGroupListPager'></div>";

    $("#codeDIV").empty();

    $(codeGrid).appendTo("#codeDIV");


    $("#codeGroupDIV").empty();

    $(codeGroupGrid).appendTo("#codeGroupDIV");


    createTable();

    bindGridButtonEvent();
}

function transMembersData(res) {
    if (!res) {
        return "";
    }

    var res = res.split(',');

    for (var i = 0; i < res.length; i++) {
        // var extgroupListObjItem = extgroupListObj[res[i]];

        // if (extgroupListObjItem) {
        //     res[i] = $P.lang("LANG2714") + "--" + extgroupListObjItem["text"];
        // }

        if (res[i].indexOf('ou=') > -1) {
            res[i] = res[i].replace(/#/g, '(') + ')';
        }

        if (res[i].indexOf('dc=') > -1) {
            delete res[i];
        }
    }

    res = $.grep(res, function(n) {
        return (n);
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
        return memAry[0] + ',' + memAry[1] + ',...,' +
            memAry[parseInt(memAryLength / 2)] + ',' + memAry[parseInt(memAryLength / 2) + 1] + ',...,' +
            memAry[memAryLength - 2] + ',' + memAry[memAryLength - 1];
    } else {
        return cellvalue;
    }
}

function showMembersTitle(rowId, tv, rawObject, cm, rdata) {
    var members = transMembersData(rawObject.members ? rawObject.members : "");

    return 'title="' + members + '"';
}

function createOptions(cellvalue, options, rowObject) {
    var extension = rowObject.extension,
        name = '',
        edit = '',
        del = '';

    if (options.gid === 'codeblueList') {
        name = rowObject.code_name;
    } else {
        name = rowObject.group_name;
    }

    edit = ('<button extension="' + extension +
        '" name = "' + name +
        '" title="' + $P.lang("LANG738") +
        '" localetitle="LANG738" class="options edit"></button>');

    del = '<button extension="' + extension +
        '" name = "' + name +
        '" title="' + $P.lang("LANG739") +
        '" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createTable() {
    $("#codeblueList").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listCodeblueCode"
        },
        colNames: [
            '<span locale="LANG4341">' + $P.lang('LANG4341') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'code_name',
            index: 'code_name',
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
        pager: "#codeblueListPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'extension',
        noData: "LANG129 LANG4338",
        jsonReader: {
            root: "response.codeblue_code",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#codeblueList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });

    $("#codeblueGroupList").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listCodeblueGroup"
        },
        colNames: [
            '<span locale="LANG4342">' + $P.lang('LANG4342') + '</span>',
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
            name: 'group_name',
            index: 'group_name',
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
        pager: "#codeblueGroupListPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'extension',
        noData: "LANG129 LANG4339",
        jsonReader: {
            root: "response.codeblue_group",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#codeblueGroupList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function transData(res, cb) {
    var arr = [];

    codeblueExt = [];

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

        codeblueExt.push(extension);

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
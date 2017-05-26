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
    accountList = [],
    existAccount = [],
    followmeAccountList = [],
    followmeAccountObj = [],
    musicList = [],
    musicOptionList = {},
    // globalRingTimeout = 60,
    destinationTypeValue = {
        'account': [],
        'voicemail': [],
        'queue': [],
        'ringgroup': [],
        'vmgroup': [],
        'ivr': []
    },
    destinationTypeArr = [{
        locale: "LANG85",
        text: $P.lang("LANG85"),
        val: "account"
    }, {
        locale: "LANG90",
        text: $P.lang("LANG90"),
        val: "voicemail"
    }, {
        locale: "LANG91",
        text: $P.lang("LANG91"),
        val: "queue"
    }, {
        locale: "LANG600",
        text: $P.lang("LANG600"),
        val: "ringgroup"
    }, {
        locale: "LANG89",
        text: $P.lang("LANG89"),
        val: "vmgroup"
    }, {
        locale: "LANG19",
        text: $P.lang("LANG19"),
        val: "ivr"
    }, {
        locale: "LANG3458",
        text: $P.lang("LANG3458"),
        val: "external_number"
    }];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG568"));

    getLists();

    createTable();

    bindButtonEvent();
});

function getLists() {
    musicList = UCMGUI.isExist.getList("getMohNameList");

    musicOptionList = transMusicData(musicList);

    accountList = UCMGUI.isExist.getList("getAccountList");

    followmeAccountObj = transData(accountList);

    destinationTypeValue = {
        'account': accountList,
        'voicemail': UCMGUI.isExist.getList("getVoicemailList"),
        'queue': UCMGUI.isExist.getList("getQueueList"),
        'ringgroup': UCMGUI.isExist.getList("getRinggroupList"),
        'vmgroup': UCMGUI.isExist.getList("getVMgroupList"),
        'ivr': UCMGUI.isExist.getList("getIVRList")
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listFollowme",
            "options": "extension"
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
                var followme = data.response.followme;

                existAccount = [];

                for (var i = 0, length = followme.length; i < length; i++) {
                    var extension = followme[i]['extension'];

                    if (extension) {
                        existAccount.push(extension);
                    }
                }
            }
        }
    });

    // $.ajax({
    //     type: "post",
    //     url: "../cgi",
    //     data: {
    //         "action": "getGeneralPrefSettings"
    //     },
    //     async: false,
    //     error: function(jqXHR, textStatus, errorThrown) {
    //         top.dialog.clearDialog();

    //         top.dialog.dialogMessage({
    //             type: 'error',
    //             content: errorThrown
    //         });
    //     },
    //     success: function(data) {
    //         var bool = UCMGUI.errorHandler(data);

    //         if (bool) {
    //             var generalPrefSettings = data.response.general_pref_settings;

    //             globalRingTimeout = generalPrefSettings.ringtime;
    //         }
    //     }
    // });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3384"),
                displayPos: "editForm",
                frameSrc: "html/followme_modal.html?mode=add",
                hideCommand: true
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#options', 'click', function() {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG797"),
                displayPos: "editForm",
                frameSrc: "html/followme_settings.html"
            });
        });

    $("#followme-list")
        .delegate('.edit', 'click', function(ev) {
            var followme = $(this).attr('followme');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG568"), followme),
                displayPos: "editForm",
                frameSrc: "html/followme_modal.html?mode=edit&item={0}".format(followme)
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var followme = $(this).attr('followme');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG568"), followme),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteFollowme",
                            "followme": followme
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

                                            getLists();
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
    var edit = '<button followme="' + rowObject.extension + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button followme="' + rowObject.extension + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return edit + del;
}

function createStatus(cellvalue, options, rowObject) {
    var status;

    switch (cellvalue) {
        case 'yes':
            status = '<span class="green" locale="LANG274">' + $P.lang('LANG274') + '</span>';
            break;
        case 'no':
            status = '<span locale="LANG273">' + $P.lang('LANG273') + '</span>';
            break;
        default:
            status = '<span locale="LANG273">' + $P.lang('LANG273') + '</span>';
            break;
    }

    return status;
}

function createMembers(cellvalue, options, rowObject) {
    var members;

    if (!cellvalue) {
        members = '<span locale="LANG1988">' + $P.lang('LANG1988') + '</span>';
    } else {
        var flExt = cellvalue.split(',');

        for (var i = 0, length = flExt.length; i < length; i++) {
            flExt[i] = flExt[i].split('&').join(' & ');
        }

        members = flExt.join(', ');
    }

    return members;
}

function createTable() {
    $("#followme-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listFollowme",
            "options": "extension,enable_followme,members,out_of_service"
        },
        colNames: [
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG273">' + $P.lang('LANG273') + '</span>',
            '<span locale="LANG568">' + $P.lang('LANG568') + '</span>',
            '<span locale="LANG1974">' + $P.lang('LANG1974') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createExtension
        }, {
            name: 'out_of_service',
            index: 'out_of_service',
            hidden: true
        }, {
            name: 'enable_followme',
            index: 'enable_followme',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createStatus
        }, {
            name: 'members',
            index: 'members',
            width: 200,
            resizable: false,
            align: "center",
            formatter: createMembers
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#followme-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'extension',
        noData: "LANG129 LANG568",
        jsonReader: {
            root: "response.followme",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#followme-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#followme-list"),
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

function transData(res, cb) {
    var arr = [];

    followmeAccountList = [];

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

        followmeAccountList.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function createExtension(cellvalue, options, rowObject) {
    var extension;

    if (rowObject.out_of_service && rowObject.out_of_service == 'yes') {
        extension = '<span class="disabled_extension_trunk" localetitle="LANG273" title="' + $P.lang('LANG273') + '"></span>' + cellvalue;
    } else {
        extension = cellvalue;
    }

    return extension;
}

function transMusicData(res) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj["text"] = res[i];
        obj["val"] = res[i];

        arr.push(obj);
    }

    return arr;
}
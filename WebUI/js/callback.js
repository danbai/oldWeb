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
    destinationInfo = {};

String.prototype.format = top.String.prototype.format;
Array.prototype.format = top.Array.prototype.each;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3741"));

    getDestination();

    createTable();

    bindButtonEvent();

    getNameList();
});

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button callback_id="' + rowObject.callback_id + '" callbackName="' + rowObject.name + '" title="Edit" localetitle="LANG738" class="options edit"></button>';
    var del = '<button callback_id="' + rowObject.callback_id + '" callbackName="' + rowObject.name + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    var options = edit + del;

    return options;
}

function createTable() {
    $("#callback-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listCallback"
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG3824">' + $P.lang('LANG3824') + '</span>',
            '<span locale="LANG3747">' + $P.lang('LANG3747') + '</span>',
            '<span locale="LANG168">' + $P.lang('LANG168') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'name',
            index: 'name',
            width: 100,
            resizable: false,
            align: "center",
            cellattr: hideTitle
        }, {
            name: 'outside_pre',
            index: 'outside_pre',
            width: 150,
            resizable: false,
            align: "center",
            formatter: translateOutsidePre,
            cellattr: hideTitle
        }, {
            name: 'sleep_time',
            index: 'sleep_time',
            width: 150,
            resizable: false,
            align: "center",
            cellattr: hideTitle
        }, {
            name: 'destination_type',
            index: 'destination_type',
            width: 150,
            resizable: false,
            align: "center",
            sortable: false,
            formatter: translateDes,
            cellattr: hideTitle
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#callback-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        //multiselect: true,
        //multiboxonly: true,
        viewrecords: true,
        sortname: "name",
        noData: "LANG129 LANG3741",
        jsonReader: {
            root: "response.callback",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#callback-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function hideTitle(rowId, tv, rawObject, cm, rdata) {
    return 'title=""';
}

function getDisplayName(type, id_key, id_value, display_key) {
    var display_name = '';

    for (var i = 0; i < destinationInfo[type].length; i++) {
        var index = destinationInfo[type][i];
        if (index[id_key] == id_value) {
            display_name = index[display_key];
            return display_name;
        }
    };

    return display_name;
}

function showDestination(lang, val, type) {
    var destination = '';

    if (val == '') {
        destination = '<div class="members wordBreak" locale="LANG566 ' + lang + ' ' + 'LANG2886' + '">' +
            $P.lang("LANG566").format($P.lang(lang), $P.lang('LANG2886')) + '</div>';
    } else if (type == 'voicemail') {
        var item = UCMGUI.ObjectArray.find('val', val, destinationInfo[type]),
            fullname = item.text,
            disable = item.out_of_service;

        if (disable && disable == 'yes') {
            destination = '<div class="disabledExtOrTrunk members wordBreak" locale="' + lang + '"' + (fullname ? " fullname=' -- " + ' ' + fullname + ' \<' + "'" : " fullname=' -- " + ' \<' + "'") + '>' +
                $P.lang("LANG567").format($P.lang(lang), " -- " + (fullname ? ' ' + fullname + '' : ''), ' &lt;' + $P.lang('LANG273') + '&gt;') + '</div>';
        } else {
            destination = '<div class="members wordBreak" locale="' + lang + '"' + (fullname ? " fullname=' -- " + ' ' + fullname + '' + "'" : " fullname=' -- " + "'") + '>' +
                $P.lang("LANG566").format($P.lang(lang), " -- " + (fullname ? ' ' + fullname + '' : '')) + '</div>';
        }
    } else {
        destination = '<div class="members wordBreak" locale="LANG566 ' + lang + ' ' + "' -- " + val + "'" + '">' +
            $P.lang("LANG566").format($P.lang(lang), " -- " + val) + '</div>';
    }

    return destination;
}

function translateOutsidePre(cellvalue, options, rowObject) {
    var num = rowObject.outside_pre;
    if (!num) {
        num = "--";
    }
    return num;
}

function translateDes(cellvalue, options, rowObject) {
    return translateDestination(undefined, undefined, rowObject);;
}

function translateDestination(cellvalue, options, rowObject) {
    var type = rowObject.destination_type,
        destination = '',
        display_name = '';

    switch (type) {
        case 'byDID':
            destination = '<div class="members wordBreak" locale="LANG566 LANG1563 ' + "' -- Strip " + rowObject.did_strip + "'" +
                '">' + $P.lang("LANG566").format($P.lang("LANG1563"), " -- Strip " + rowObject.did_strip) + '</div>';
            break;
        case 'account':
            destination = '<div class="members wordBreak" locale="LANG5206">' + $P.lang("LANG5206") + '</div>';
            break;
        case 'voicemail':
            destination = showDestination('LANG249', rowObject[type], type);
            break;
        case 'conference':
            destination = showDestination('LANG98', rowObject[type]);
            break;
        case 'queue':
            display_name = getDisplayName(type, 'val', rowObject[type], 'text');

            destination = showDestination('LANG91', display_name);
            break;
        case 'ringgroup':
            display_name = getDisplayName(type, 'val', rowObject[type], 'text');

            destination = showDestination('LANG600', display_name);
            break;
        case 'paginggroup':
            display_name = getDisplayName(type, 'val', rowObject[type], 'text');

            destination = showDestination('LANG94', display_name);
            break;
        case 'vmgroup':
            display_name = getDisplayName(type, 'val', rowObject[type], 'text');

            destination = showDestination('LANG89', display_name);
            break;
        case 'fax':
            display_name = getDisplayName(type, 'val', rowObject[type], 'text');

            destination = showDestination('LANG95', display_name);
            break;
        case 'disa':
            display_name = getDisplayName(type, 'val', rowObject[type], 'text');

            destination = showDestination('LANG2353', display_name);
            break;
        case 'ivr':
            display_name = getDisplayName(type, 'val', rowObject[type], 'text');

            destination = showDestination('LANG134', display_name);
            break;
        case 'directory':
            display_name = getDisplayName(type, 'val', rowObject[type], 'text');

            destination = showDestination('LANG2884', display_name);
            break;
        case 'external_number':
            //display_name = getDisplayName(type, 'external_number', rowObject[type], 'name');

            destination = showDestination('LANG3458', rowObject[type]);
            break;
        case 'callback':
            display_name = getDisplayName(type, 'val', rowObject[type], 'text');

            destination = showDestination('LANG3741', display_name);
            break;
        default:
            destination = '<div class="members" locale="LANG565' + $P.lang('LANG565').format('--') + '">--</div>';
            break;
    }

    return destination;
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3743"),
                displayPos: "edit_callback_div",
                frameSrc: "html/callback_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#callback-list")
        .delegate('.edit', 'click', function(ev) {

            var callbackId = $(this).attr('callback_id');
            var callbackName = $(this).attr('callbackName');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG3741"), callbackName),
                displayPos: "edit_callback_div",
                frameSrc: "html/callback_modal.html?mode=edit&callbackId=" + callbackId
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var callbackId = $(this).attr('callback_id');
            var callbackName = $(this).attr('callbackName');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(callbackName),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteCallback",
                            "callback": callbackId
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
    var table = $("#callback-list"),
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

function getNameList() {
    callbackNameList = UCMGUI.isExist.getList("getCallbackNameList");
}

function getDestination() {
    getAccount();

    getVoicemail();

    getConference();

    getVmgroup();

    getIvr();

    getRinggroup();

    getPaginggroup();

    getQueue();

    getDirectory();

    getFax();

    getDisa();
}

function getAccount(cb) {
    var extension = UCMGUI.isExist.getList("getAccountList");

    destinationInfo["account"] = transAccountVoicemailData(extension, cb);
}

function getVoicemail(cb) {
    var voicemail = UCMGUI.isExist.getList("getVoicemailList");

    destinationInfo["voicemail"] = transAccountVoicemailData(voicemail, cb);
}

function getConference(cb) {
    var conference = UCMGUI.isExist.getList("getConferenceList");

    destinationInfo["conference"] = transData(conference, cb);
}

function getVmgroup(cb) {
    var vmgroups = UCMGUI.isExist.getList("getVMgroupList"),
        options = {
            val: "extension",
            text: "vmgroup_name"
        };

    destinationInfo["vmgroup"] = transObjData(vmgroups, options);
}

function getIvr(cb) {
    var ivr = UCMGUI.isExist.getList("getIVRList"),
        arr = [];

    for (var i = 0; i < ivr.length; i++) {
        var obj = {};

        obj["val"] = ivr[i]["ivr_id"];
        obj["text"] = ivr[i]["ivr_name"];

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    destinationInfo["ivr"] = arr;
}

function getRinggroup(cb) {
    var ringgroups = UCMGUI.isExist.getList("getRinggroupList"),
        options = {
            val: "extension",
            text: "ringgroup_name"
        };

    destinationInfo["ringgroup"] = transObjData(ringgroups, options);
}

function getPaginggroup(cb) {
    var paginggroups = UCMGUI.isExist.getList("getPaginggroupList"),
        options = {
            val: "extension",
            text: "paginggroup_name"
        };

    destinationInfo["paginggroup"] = transObjData(paginggroups, options);
}

function getQueue(cb) {
    var queues = UCMGUI.isExist.getList("getQueueList"),
        options = {
            val: "extension",
            text: "queue_name"
        };

    destinationInfo["queue"] = transObjData(queues, options);
}

function getDirectory(cb) {

    var directorys = UCMGUI.isExist.getList("getDirectoryList"),
        options = {
            val: "extension",
            text: "name"
        };

    destinationInfo["directory"] = transObjData(directorys, options);
}

function getFax(cb) {
    var fax = UCMGUI.isExist.getList("getFaxList"),
        options = {
            val: "extension",
            text: "fax_name"
        };

    destinationInfo["fax"] = transObjData(fax, options);
}

function getDisa(cb) {
    var disa = UCMGUI.isExist.getList("getDISAList"),
        arr = [];

    if ($.isArray(disa)) {
        for (var i = 0; i < disa.length; i++) {
            var obj = {};

            obj["val"] = disa[i]["disa_id"] + '';
            obj["text"] = disa[i]["display_name"];

            arr.push(obj);
        }
    }

    destinationInfo["disa"] = arr;
}

function transData(res, cb) {
    var arr = [];

    if ($.isArray(res)) {
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
}

function transObjData(res, options, cb) {
    var val = options.val,
        text = options.text,
        arr = [];

    if ($.isArray(res)) {
        for (var i = 0; i < res.length; i++) {
            var obj = {};

            obj["val"] = res[i][val];
            obj["text"] = res[i][text];

            arr.push(obj);
        }

        if (cb && typeof cb == "function") {
            cb(arr);
        }

        return arr;
    }
}

function transAccountVoicemailData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;
        if (disabled) {
            obj["out_of_service"] = disabled;
        }
        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
        }

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
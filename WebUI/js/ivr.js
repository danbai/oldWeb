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
    baseServerURl = config.paths.baseServerURl,
    keypressInfo = {},
    portExtensionList = [],
    ivrNameList = [],
    numberList = [],
    extensionRange = [],
    accountList = [],
    accountObjectList = [];

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG647"));

    $("title").attr("locale", "LANG647");

    createTable();

    bindButtonEvent();

    getListsAndRange();

    getNameList();

    getPortExtension();

    getKeypressInfo();
});

function createTable() {
    $("#ivr-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listIvr"
        },
        colNames: [
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG1445">' + $P.lang('LANG1445') + '</span>',
            '<span locale="LANG1447">' + $P.lang('LANG1447') + '</span>',
            '<span locale="LANG2540">' + $P.lang('LANG2540') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'ivr_name',
            index: 'ivr_name',
            width: 100,
            resizable: false,
            align: "center",
        }, {
            name: 'dial_extension',
            index: 'dial_extension',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transDialExtension
        }, {
            name: 'dial_trunk',
            index: 'dial_trunk',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transDialTrunk
        }, {
            name: 'response_timeout',
            index: 'response_timeout',
            width: 180,
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
        pager: "#ivr-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: "extension",
        noData: "LANG129 LANG134",
        jsonReader: {
            root: "response.ivr",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#ivr-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(document, true);

            top.Custom.init(doc);
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG766"),
                displayPos: "editForm",
                frameSrc: "html/ivr_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#ivr-list")
        .delegate('.edit', 'click', function(ev) {
            var ivr_id = $(this).attr('ivr_id'),
                ivr_name = $(this).attr('ivr_name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG2372"), ivr_name),
                displayPos: "editForm",
                frameSrc: "html/ivr_modal.html?mode=edit&ivr_id=" + ivr_id
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var ivr_id = $(this).attr('ivr_id'),
                ivr_name = $(this).attr('ivr_name');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(ivr_name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteIVR",
                            "ivr": ivr_id
                        };

                        $.ajax({
                            type: "post",
                            url: baseServerURl,
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
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            var table = $("#ivr-list"),
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

function createOptions(cellvalue, options, rowObject) {
    var edit = ('<button ivr_id="' + rowObject.ivr_id + '" ivr_name="' + rowObject.ivr_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>'),
        del = ('<button ivr_id="' + rowObject.ivr_id + '" ivr_name="' + rowObject.ivr_name + '" title="Delete" localetitle="LANG739" class="options del"></button>');

    return (edit + del);
}

function transDialTrunk(cellvalue, status, rowObject) {
    var dialTrunk = rowObject.dial_trunk.toLowerCase(),
        spanYes = "<span locale='LANG136'></span>",
        spanNo = "<span locale='LANG137'></span>";

    if (dialTrunk == "yes") {
        return spanYes;
    } else {
        return spanNo;
    }
}

function transDialExtension(cellvalue, status, rowObject) {
    var dialExtension = rowObject.dial_extension.toLowerCase(),
        spanYes = "<span locale='LANG136'></span>",
        spanNo = "<span locale='LANG137'></span>";

    if (dialExtension == "yes") {
        return spanYes;
    } else {
        return spanNo;
    }
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

function getKeypressInfo() {
    get_language()

    get_member_account();

    get_member_voicemail();

    get_member_conference();

    get_member_vmgroup();

    get_member_ivr();

    get_member_ringgroup();

    get_member_paginggroup();

    get_member_queue();

    get_member_directory();

    get_member_fax();

    get_member_prompt();

    // get_member_hangup();

    get_member_disa();

    get_member_callback();
}

function getListsAndRange() {
    extensionRange = UCMGUI.isExist.getRange('ivr');
}

function getNameList() {
    numberList = UCMGUI.isExist.getList("getNumberList");

    ivrNameList = UCMGUI.isExist.getList("getIVRNameList");
}

function get_language(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getLanguage"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var languages = data.response.languages,
                    arr = [];

                arr[0] = {
                    text: $P.lang("LANG257"),
                    locale: "LANG257"
                }

                for (var i = 0; i < languages.length; i++) {
                    var obj = {};

                    obj["val"] = languages[i]["language_id"];
                    obj["text"] = languages[i]["language_name"];

                    arr.push(obj);
                }

                if (cb && typeof cb == "function") {
                    cb(arr);
                }

                keypressInfo["language"] = arr;
            }
        }
    });
}

function get_member_account(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getAccountList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var extension = data.response.extension;

                accountObjectList = keypressInfo["member_account"] = transAccountVoicemailData(extension, cb);
            }
        }
    });
}

function get_member_voicemail(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getVoicemailList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var extension = data.response.extension;

                keypressInfo["member_voicemail"] = transAccountVoicemailData(extension, cb);
            }
        }
    });
}

function get_member_conference(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getConferenceList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var extension = data.response.extension;

                keypressInfo["member_conference"] = transData(extension, cb);
            }
        }
    });
}

function get_member_vmgroup(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getVMgroupList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var vmgroups = data.response.vmgroups,
                    options = {
                        val: "extension",
                        text: "vmgroup_name"
                    };

                keypressInfo["member_vmgroup"] = transObjData(vmgroups, options);
            }
        }
    });
}

function get_member_ivr(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getIVRList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var ivr = data.response.ivr,
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

                keypressInfo["member_ivr"] = arr;
            }
        }
    });
}

function get_member_ringgroup(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getRinggroupList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var ringgroups = data.response.ringgroups,
                    options = {
                        val: "extension",
                        text: "ringgroup_name"
                    };

                keypressInfo["member_ringgroup"] = transObjData(ringgroups, options);
            }
        }
    });
}

function get_member_paginggroup(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getPaginggroupList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var paginggroups = data.response.paginggroups,
                    options = {
                        val: "extension",
                        text: "paginggroup_name"
                    };

                keypressInfo["member_paginggroup"] = transObjData(paginggroups, options);
            }
        }
    });
}

function get_member_queue(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getQueueList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var queues = data.response.queues,
                    options = {
                        val: "extension",
                        text: "queue_name"
                    };

                keypressInfo["member_queue"] = transObjData(queues, options);
            }
        }
    });
}

function get_member_directory(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getDirectoryList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var directorys = data.response.directorys,
                    options = {
                        val: "extension",
                        text: "name"
                    };

                keypressInfo["member_directory"] = transObjData(directorys, options);
            }
        }
    });
}

function get_member_fax(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getFaxList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var fax = data.response.fax,
                    options = {
                        val: "extension",
                        text: "fax_name"
                    };

                keypressInfo["member_fax"] = transObjData(fax, options);
            }
        }
    });
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

function get_member_prompt() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "listFile",
            type: "ivr",
            filter: JSON.stringify({
                "list_dir": 0,
                "list_file": 1,
                "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
            }),
            page: 1,
            sidx: "d",
            sord: "asc"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var ivr = data.response.ivr,
                    options = {
                        val: "n",
                        text: "n"
                    };

                keypressInfo["member_prompt"] = transObjData(ivr, options, function(arr) {
                    for (var i = 0; i < arr.length; i++) {
                        arr[i].val = "record/" + removeSuffix(arr[i].val);
                    }
                });

                // Pengcheng Zou Added 'member_prompt_copy' for Event Timeout and Invalid.
                keypressInfo["member_prompt_copy"] = [].concat(keypressInfo["member_prompt"], [{val: "goodbye"}]);
            } else {
                keypressInfo["member_prompt"] = [];
                keypressInfo["member_prompt_copy"] = [{val: "goodbye"}];
            }
        }
    });
}

function get_member_hangup() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getHangupList"
        },
        success: function(data) {
            var data = eval(data);

            // keypressInfo["member_hangup"] = data.response;
        }
    });
}

function get_member_disa(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getDISAList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var disa = data.response.disa,
                    arr = [];

                if ($.isArray(disa)) {
                    for (var i = 0; i < disa.length; i++) {
                        var obj = {};

                        obj["val"] = disa[i]["disa_id"] + '';
                        obj["text"] = disa[i]["display_name"];

                        arr.push(obj);
                    }
                }

                keypressInfo["member_disa"] = arr;
            }
        }
    });
}

function get_member_callback() {
    var callback = UCMGUI.isExist.getList("getCallbackList"),
        arr = [];

    if ($.isArray(callback)) {
        for (var i = 0; i < callback.length; i++) {
            var obj = {};

            obj["val"] = callback[i]["callback_id"] + '';
            obj["text"] = callback[i]["name"];

            arr.push(obj);
        }
    }

    keypressInfo["member_callback"] = arr;
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

    accountList = [];

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

        accountList.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
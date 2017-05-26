/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    mode = gup.call(window, "mode"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    dialList = mWindow.dialList,
    ifExisted = UCMGUI.inArray,
    selectbox = UCMGUI.domFunction.selectbox,
    keypressInfo = {},
    config = UCMGUI.config,
    baseServerURl = config.paths.baseServerURl,
    sDialNum;

var optionSets = {
    'account': {},
    'voicemail': {},
    'conference': {},
    'vmgroup': {},
    'ivr': {},
    'ringgroup': {},
    'queue': {},
    'paginggroup': {},
    'fax': {},
    'disa': {},
    'directory': {},
    'external_number': {}
};

var accountObj = {
    'conference': {
        'extension': [],
        'locale': 'LANG18',
        'position': 'meetroomuser.html'
    },
    'ivr': {
        'extension': [],
        'locale': 'LANG19',
        'position': 'ivr.html'
    },
    'ringgroup': {
        'extension': [],
        'locale': 'LANG22',
        'position': 'ringgroup.html'
    },
    'queue': {
        'extension': [],
        'locale': 'LANG24',
        'position': 'queue.html'
    },
    'paginggroup': {
        'extension': [],
        'locale': 'LANG23',
        'position': 'paging_intercom.html'
    },
    'fax': {
        'extension': [],
        'locale': 'LANG29',
        'position': 'fax.html'
    }
};

Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.copy = top.Array.prototype.copy;
String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    initForm();

    initValidator();

    getRequiredInfo();

    if (mode === 'edit') {
        loadSpeedDial();
    } else {
        $('#speed_dial').val(createDial());
    }

    top.Custom.init(doc);
});

function createDial() {
    for (var i = 0; i < 100; i++) {
        if (!ifExisted(i.toString(), dialList)) {
            return i;
        }
    }
}

function getRequiredInfo() {
    get_conference();

    get_ivr_extension();

    get_ringgroup();

    get_paginggroup();

    get_queue();

    get_fax();
}

function appendlist(options) {
    var el = options.el,
        eventList = options.eventList,
        valueList = options.valueList,
        addnone = options.addnone,
        element = $("#" + el);

    if (addnone) {
        element.append('<option locale="LANG133" value="">' + $P.lang("LANG133") + '</option>');
    } else {
        if (!eventList.length) {
            element.append('<option locale="LANG133" value="">' + $P.lang("LANG133") + '</option>');
        }
    }

    for (var i = 0; i < eventList.length; i++) {
        element.append($("<option>").attr({'value': valueList[i], 'locale': eventList[i]}).text($P.lang(eventList[i])));
    }
}

function checkIfExisted(val, ele) {
    if (mode === 'edit' && val === sDialNum) {
        return true;
    }

    if (!ifExisted(val, dialList)) {
        return true;
    }

    return false;
}

function get_account(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getAccountList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var extension = data.response.extension;

                keypressInfo["account"] = transAccountVoicemailData(extension, cb);
            }
        }
    });
}

function get_voicemail(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getVoicemailList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var extension = data.response.extension;

                keypressInfo["voicemail"] = transAccountVoicemailData(extension, cb);
            }
        }
    });
}

function get_conference(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getConferenceList"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var extension = data.response.extension;

                accountObj['conference']['extension'] = extension;

                keypressInfo["conference"] = transData(extension, cb);
            }
        }
    });
}

function get_vmgroup(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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

                keypressInfo["vmgroup"] = transObjData(vmgroups, options);
            }
        }
    });
}

function get_ivr(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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

                keypressInfo["ivr"] = arr;
            }
        }
    });
}

function get_ivr_extension(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "listIvr",
            options: "extension"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var ivrExt = data.response.ivr;

                accountObj['ivr']['extension'] = [];

                for (var i = 0, length = ivrExt.length; i < length; i++) {
                    accountObj['ivr']['extension'].push(ivrExt[i]['extension']);
                }
            }
        }
    });
}

function get_ringgroup(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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

                accountObj['ringgroup']['extension'] = [];

                for (var i = 0, length = ringgroups.length; i < length; i++) {
                    accountObj['ringgroup']['extension'].push(ringgroups[i]['extension']);
                }

                keypressInfo["ringgroup"] = transObjData(ringgroups, options);
            }
        }
    });
}

function get_paginggroup(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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

                accountObj['paginggroup']['extension'] = [];

                for (var i = 0, length = paginggroups.length; i < length; i++) {
                    accountObj['paginggroup']['extension'].push(paginggroups[i]['extension']);
                }

                keypressInfo["paginggroup"] = transObjData(paginggroups, options);
            }
        }
    });
}

function get_queue(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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

                accountObj['queue']['extension'] = [];

                for (var i = 0, length = queues.length; i < length; i++) {
                    accountObj['queue']['extension'].push(queues[i]['extension']);
                }

                keypressInfo["queue"] = transObjData(queues, options);
            }
        }
    });
}

function get_directory(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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

                keypressInfo["directory"] = transObjData(directorys, options);
            }
        }
    });
}

function get_fax(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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

                accountObj['fax']['extension'] = [];

                for (var i = 0, length = fax.length; i < length; i++) {
                    accountObj['fax']['extension'].push(fax[i]['extension']);
                }

                keypressInfo["fax"] = transObjData(fax, options);
            }
        }
    });
}

function get_disa(cb) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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

                keypressInfo["disa"] = arr;
            }
        }
    });
}

function getRequiredInfo() {
    get_conference();

    get_ivr_extension();

    get_ringgroup();

    get_paginggroup();

    get_queue();

    get_fax();
}

function initForm() {
    var eventList = [
            "LANG85",
            "LANG90",
            "LANG98",
            "LANG89",
            "LANG19",
            "LANG600",
            "LANG91",
            "LANG94",
            "LANG95",
            "LANG2353",
            "LANG2884",
            "LANG3458"
        ],
        valueList = [
            "account",
            "voicemail",
            "conference",
            "vmgroup",
            "ivr",
            "ringgroup",
            "queue",
            "paginggroup",
            "fax",
            "disa",
            "directory",
            "external_number"
        ];

    $(".keypress").bind("change", function(ev) {
        keypressSwitch(this);

        ev.stopPropagation();
    });

    var key = "keypress";

    $("#" + key).attr("noSerialize", true).append('<option value="" locale="LANG1485">' + $P.lang("LANG1485") + '</option>');

    appendlist({
        el: key,
        eventList: eventList,
        valueList: valueList,
        addnone: 0
    });

    $("#keypressevent" ).attr("noSerialize", true).hide();
    $("#keypressevent_nu").attr("noSerialize", true).hide();

    /*UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "enable_destination",
        enableList: ["speed_dial","keypress" , "keypressevent", "keypressevent_nu"]
    }, doc);*/
}

// form validate
function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "external_number": {
                required: true,
                phoneNumberOrExtension: true
            },
            "speed_dial": {
                required: true,
                digits: true,
                customCallback: [$P.lang("LANG270").format($P.lang("LANG5108")), checkIfExisted]
            },
            "keypress": {
                required: true
            },
            "keypressevent": {
                required: true
            }
        },
        submitHandler: function() {
            var sKeyval = '';

            if ($('#keypressevent').is(':visible')) {
                sKeyval = $('#keypressevent').val();
            } else {
                sKeyval = $('#keypressevent_nu').val();
            }

            var action = {
                "action": mode === 'add' ? 'addSpeedDial' : 'updateSpeedDial',
                "enable_destination": $('#enable_destination')[0].checked ? 'yes' : 'no',
                "speed_dial": $('#speed_dial').val(),
                "destination_type": $('#keypress').val(),
                "account": null,
                "voicemail": null,
                "conference": null,
                "vmgroup": null,
                "ivr": null,
                "ringgroup": null,
                "queue": null,
                "paginggroup": null,
                "fax": null,
                "disa": null,
                "directory": null,
                "external_number": null,
            };

            action[$('#keypress').val()] = sKeyval;

            if (mode === 'edit') {
                action['speed_dial'] = sDialNum;
                action['extension'] = $('#speed_dial').val();
            }

            saveOneKeyDialInfo(action);
        }
    });
}

function saveOneKeyDialInfo(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#dial-list", mWindow.document).trigger('reloadGrid');
                        mWindow.getList();
                    }
                });
            }
        }
    });
}

function loadSpeedDial() {
    var action = {
        "action": "getSpeedDial",
        "speed_dial": gup.call(window, "speed_dial")
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var speedDialInfo = data.response.speed_dial,
                    destination_num = speedDialInfo.destination_num,
                    destination_type = speedDialInfo.destination_type,
                    enable_destination = (speedDialInfo.enable_destination === 'yes' ? true : false),
                    extension = speedDialInfo.extension;

                $('#enable_destination')[0].checked = enable_destination;
                $('#speed_dial').val(extension);
                $('#keypress').val(destination_type).trigger('change');

                if ($('#keypressevent').is(':visible')) {
                    $('#keypressevent').val(destination_num);
                } else {
                    $('#keypressevent_nu').val(destination_num);
                }

                sDialNum = extension;

                top.Custom.init(doc);
            }
        }
    });
}

function keypressSwitch(obj) {
    var value = $(obj).val();

    if (value && ((typeof keypressInfo[value]) == 'undefined') && (value !== "external_number")) {
        window['get_' + value]();
    }

    keypressEventSwitch(keypressInfo[value], obj);
}

function keypressEventSwitch(arr, obj) {
    var value = $(obj).val(),
        eventid = ("keypressevent"),
        elEvent = $("#" + eventid),
        eventTextid = ("keypressevent_nu"),
        elTextEvent = $("#" + eventTextid);

    elEvent.empty();

    if (value == "") {
        elEvent.hide();
        elTextEvent.hide();
        elEvent.prev().hide();
    } else if (value == "external_number") {
        elEvent.hide();
        elTextEvent.show();
        elEvent.prev().hide();
    } else {
        elEvent.show();
        elTextEvent.hide();
        elEvent.prev().show();

        if (arr && arr.length) {
            if (!optionSets[value].length) {
                selectbox.appendOpts({
                    el: eventid,
                    opts: arr
                }, document);

                optionSets[value] = elEvent.contents();
            } else {
                elEvent.append(optionSets[value].clone())[0].selectedIndex = 0;
            }
        } else {
            elEvent.append('<option locale="LANG133" value="">' + $P.lang("LANG133") + '</option>');
        }
    }

    top.Custom.init(document, elEvent[0]);
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
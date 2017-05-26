/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    enableCheckBox = UCMGUI.domFunction.enableCheckBox,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = "",
    keypressList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 't', 'i'],
    startExt = mWindow.extensionRange[0],
    endExt = mWindow.extensionRange[1],
    disableRange = mWindow.extensionRange[2],
    portExtensionList = mWindow.portExtensionList,
    oldIvrName = "",
    oldExtension = "";

var optionSets = {
    'member_account': {},
    'member_voicemail': {},
    'member_conference': {},
    'member_vmgroup': {},
    'member_ivr': {},
    'member_ringgroup': {},
    'member_queue': {},
    'member_paginggroup': {},
    'member_fax': {},
    'member_prompt': {},
    'member_prompt_copy': {}, // Pengcheng Zou Added for Event Timeout and Invalid.
    'member_hangup': {},
    'member_disa': {},
    'member_directory': {},
    'member_external_number': {},
    'member_callback': {}
};

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;

$(function() {
    var dialTrunk = $("#dial_trunk");

    mode = gup.call(window, "mode");

    initForm();

    // after initForm()
    $P.lang(doc, true);

    if (mode == "edit") {
        var ivr_id = gup.call(window, "ivr_id");

        getIvrInfo(ivr_id);
    } else if (mode == "add") {
        prepareAddItemForm();
    }

    $.navSlide(false, true, true, true);

    initValidator();

    $('#save').bind('click', function() {
        askExtensionRange($("#extension").val(), startExt, endExt, disableRange);
    });

    dialTrunk.trigger("change");

    selectbox.electedSelect({
        rightSelect: "ivr_blackwhite_list",
        leftSelect: "leftSelect",
        allToRight: "allToRight",
        oneToRight: "oneToRight",
        oneToLeft: "oneToLeft",
        allToLeft: "allToLeft",
        cb: function() {
            $P("#ivr_blackwhite_list", doc).valid();
        }
    }, doc);

    top.Custom.init(doc);
});

function initSound(cb) {

    // xpqin This is only temporary.
    var welcomePromptList = [{
            text: $P.lang("LANG133"),
            val: ""
        }, {
            val: "welcome"
        }],
        invalidPromptList = [{
            text: $P.lang("LANG133"),
            val: ""
        }, {
            val: "invalid"
        }],
        timeoutPromptList = [{
            text: $P.lang("LANG133"),
            val: ""
        }, {
            val: "ivr-create-timeout"
        }];

    welcomePromptList = welcomePromptList.concat(mWindow.keypressInfo["member_prompt"]);
    invalidPromptList = invalidPromptList.concat(mWindow.keypressInfo["member_prompt"]);
    timeoutPromptList = timeoutPromptList.concat(mWindow.keypressInfo["member_prompt"]);

    selectbox.appendOpts({
        el: "welcome_prompt",
        opts: welcomePromptList,
        selectedIndex: 1
    }, document);

    selectbox.appendOpts({
        el: "invalid_prompt",
        opts: invalidPromptList,
        selectedIndex: 1
    }, document);

    selectbox.appendOpts({
        el: "timeout_prompt",
        opts: timeoutPromptList,
        selectedIndex: 1
    }, document);
}

function initForm() {
    var eventList = [
            $P.lang("LANG85"),
            $P.lang("LANG90"),
            $P.lang("LANG98"),
            $P.lang("LANG89"),
            "IVR",
            $P.lang("LANG600"),
            $P.lang("LANG91"),
            $P.lang("LANG94"),
            $P.lang("LANG95"),
            $P.lang("LANG238"),
            $P.lang("LANG97"),
            $P.lang("LANG2353"),
            $P.lang("LANG2884"),
            $P.lang("LANG3458"),
            $P.lang("LANG3741")
        ],
        valueList = [
            "member_account",
            "member_voicemail",
            "member_conference",
            "member_vmgroup",
            "member_ivr",
            "member_ringgroup",
            "member_queue",
            "member_paginggroup",
            "member_fax",
            "member_prompt",
            "member_hangup",
            "member_disa",
            "member_directory",
            "member_external_number",
            "member_callback"
        ];

    initSound();

    var language = mWindow.keypressInfo["language"];

    selectbox.appendOpts({
        el: "language",
        opts: language
    }, document);

    $(".keypress").bind("change", function(ev) {
        keypressSwitch(this);

        ev.stopPropagation();
    });

    keypressList.each(function(index) {
        var key = "keypress_" + index;

        $("#" + key).attr("noSerialize", true).append('<option value="">' + $P.lang("LANG1485") + '</option>');

        appendlist({
            el: key,
            eventList: eventList,
            valueList: valueList,
            addnone: 0
        });

        $("#keypressevent_" + index).attr("noSerialize", true).hide();
        $("#keypressevent_nu_" + index).attr("noSerialize", true).hide();
    });

    $("#dial_trunk").change(function(ev) {
        var dialTrunkIsEnable = $("#dialTrunkIsEnable");

        if ($(this).is(":checked")) {
            dialTrunkIsEnable.show();
        } else {
            dialTrunkIsEnable.hide();
        }
        ev.stopPropagation();
    });

    $('#dial_extension').on('change', function() {
        if (this.checked) {
            listSel.removeClass('disabled');
        } else {
            listSel.addClass('disabled');
        }
    });

    var DID_all = $('#dial_all'),
        chk_DID = $(".check-DID");

    DID_all.bind("click", function(ev) {
        var DID_chkbox_all = function(value) {
            var children = $('.DID_destination_div').children().find("input");

            for (var i = 0; i < children.length; i++) {
                if (children[i].type == 'checkbox') {
                    children[i].checked = value;
                }

                if (value) {
                    $(children[i]).prev().css("backgroundPosition", "0px -50px");
                } else {
                    $(children[i]).prev().css("backgroundPosition", "0px 0px");
                }
            }
        };

        var all = $('#dial_all')[0];

        if (all.checked) {
            DID_chkbox_all(true);
        } else {
            DID_chkbox_all(false);
        }

        $('#dial_extension').trigger('change');
        $('#leftSelect')[0].disabled = $('#ivr_blackwhite_list')[0].disabled = !$('#dial_extension')[0].checked;
    });

    chk_DID.bind("click", function(ev) {
        if (chk_DID.filter(":checked").length != chk_DID.length) {
            DID_all[0].checked = false;
            DID_all.prev().css("backgroundPosition", "0px 0px");
        } else {
            DID_all[0].checked = true;
            DID_all.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });

    $('#alertinfo').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "custom") {
            $("#customAlertDiv").removeClass('custom-alert');
        } else {
            $("#customAlertDiv").addClass('custom-alert');
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    enableCheckBox({
        enableCheckBox: 'dial_trunk',
        enableList: ['ivr_out_blackwhite_list']
    }, doc);

    enableCheckBox({
        enableCheckBox: 'dial_extension',
        enableList: ['leftSelect', 'ivr_blackwhite_list']
    }, doc);

    var listSel = $('#allToRight, #oneToRight, #oneToLeft, #allToLeft');

    $('#switch').on('change', function() {
        if ($(this).val() === 'no') {
            $('.hide_list').hide();
        } else {
            $('.hide_list').css('display', 'block');
        }
    });
}

function keypressSwitch(obj) {
    var value = $(obj).val(),
        id = obj.id.split('_')[1],
        array = [],
        keypressInfo;

    // Pengcheng Zou Added 'member_prompt_copy' for Event Timeout and Invalid.
    if ((id === 't' || id === 'i') && (value === 'member_prompt')) {
        keypressInfo = mWindow.keypressInfo[value + '_copy'];
    } else {
        keypressInfo = mWindow.keypressInfo[value];
    }

    array = keypressInfo ? keypressInfo : [];

    keypressEventSwitch(array, obj);
}

function keypressEventSwitch(arr, obj) {
    var value = $(obj).val(),
        id = obj.id.split('_')[1],
        eventid = ("keypressevent_" + id),
        elEvent = $("#" + eventid),
        eventTextid = ("keypressevent_nu_" + id),
        elTextEvent = $("#" + eventTextid);

    elEvent.empty();

    if (value == "member_hangup" || value == "") {
        elEvent.hide();
        elTextEvent.hide();
        elEvent.prev().hide();
    } else if (value == "member_external_number") {
        elEvent.hide();
        elTextEvent.show();
        elEvent.prev().hide();
    } else {
        elEvent.show();
        elTextEvent.hide();
        elEvent.prev().show();

        if (arr && arr.length) {

            // Pengcheng Zou Added 'member_prompt_copy' for Event Timeout and Invalid.
            if ((id === 't' || id === 'i') && (value === 'member_prompt')) {
                value += '_copy';
            }

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
            elEvent.append('<option value="">' + $P.lang("LANG133") + '</option>');

            // ASTGUI.selectbox.append(eventid, $P.lang("LANG133"), "");
        }
    }

    top.Custom.init(document, elEvent[0]);
}

function prepareAddItemForm() {
    // $("#extension").value = tmp_allextensions.firstAvailable(parent.sessionData.GUI_PREFERENCES.getProperty('vme_start'));

    $("#extension").val(generateNewExt());

    $('#keypress_t, #keypress_i').val('member_prompt').trigger('change');

    $('#keypressevent_t, #keypressevent_i').val('goodbye');

    UCMGUI.setDefaultsWhenCreate(doc);

    selectbox.appendOpts({
        el: "leftSelect",
        opts: mWindow.accountObjectList
    }, doc);

    // $("#permission").attr("disabled", true);
}

function appendlist(options) {
    var el = options.el,
        eventList = options.eventList,
        valueList = options.valueList,
        addnone = options.addnone,
        element = $("#" + el);

    if (addnone) {
        element.append('<option value="">' + $P.lang("LANG133") + '</option>');
    } else {
        if (!eventList.length) {
            element.append('<option value="">' + $P.lang("LANG133") + '</option>');
        }
    }

    for (var i = 0; i < eventList.length; i++) {
        element.append($("<option>").attr({
            'value': valueList[i]
        }).text(eventList[i]));
    }
}

function getIvrInfo(ivr_id) {
    var action = {
        action: "getIVR",
        ivr: ivr_id
    };

    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var ivrData = data.response.ivr,
                    members = data.response.members,
                    dialTrunk = ivrData.dial_trunk;

                oldIvrName = data.response.ivr.ivr_name;
                oldExtension = data.response.ivr.extension;

                members.each(function(index) {
                    var keypress = index["keypress"];

                    if (keypress == "*") {
                        keypress = 10;
                    }

                    var keypressDom = $("#keypress_" + keypress),
                        keypressEvent = index["keypress_event"],
                        keypressEventVal = index[keypressEvent],
                        elEvent = $("#keypressevent_" + keypress),
                        elTextEvent = $("#keypressevent_nu_" + keypress),
                        keypressInfoArr = [],
                        keypressEventInfo;

                    // Pengcheng Zou Added 'member_prompt_copy' for Event Timeout and Invalid.
                    if ((keypress === 't' || keypress === 'i') && (keypressEvent === 'member_prompt')) {
                        keypressEventInfo = mWindow.keypressInfo[keypressEvent + '_copy'];
                    } else {
                        keypressEventInfo = mWindow.keypressInfo[keypressEvent];
                    }

                    // keypressDom
                    if (keypressEventVal) {
                        keypressDom.val(keypressEvent);

                        if (keypressEvent == "member_hangup" || keypressEvent == "") {
                            elEvent.hide();
                            elTextEvent.hide();
                        } else if (keypressEvent == "member_external_number") {
                            elEvent.hide();
                            elTextEvent.show().val(keypressEventVal);
                        } else {
                            elEvent.show();
                            elTextEvent.hide();

                            if (keypressEventInfo && keypressEventInfo.length) {

                                // Pengcheng Zou Added 'member_prompt_copy' for Event Timeout and Invalid.
                                if ((keypress === 't' || keypress === 'i') && (keypressEvent === 'member_prompt')) {
                                    keypressEvent += '_copy';
                                }

                                if (!optionSets[keypressEvent].length) {
                                    selectbox.appendOpts({
                                        el: ("keypressevent_" + keypress),
                                        opts: keypressEventInfo
                                    }, document);

                                    optionSets[keypressEvent] = elEvent.contents();
                                } else {
                                    elEvent.append(optionSets[keypressEvent].clone())[0].selectedIndex = 0;
                                }
                            } else {
                                elEvent.append('<option value="">' + $P.lang("LANG133") + '</option>');
                            }

                            if (keypressEventInfo) {
                                $.each(keypressEventInfo, function(index, obj) {
                                    keypressInfoArr.push(String(obj.val));
                                });
                            }

                            if ($.inArray(String(keypressEventVal), keypressInfoArr) == -1) {
                                elEvent.get(0).selectedIndex = 0;
                            } else {
                                elEvent.val(keypressEventVal);
                            }
                        }
                    } else if (keypressEvent == 'member_hangup') {
                        keypressDom.val(keypressEvent);

                        elEvent.hide();
                        elTextEvent.hide();
                    } else {
                        keypressDom[0].selectedIndex = 0;
                    }
                });

                // if (dialTrunk.toLowerCase() == "no") {
                //     $("#permission").attr("disabled", true);
                // }

                UCMGUI.domFunction.updateDocument(ivrData, document);

                var alertInfo = (ivrData.alertinfo ? ivrData.alertinfo : "");

                if (alertInfo.indexOf('custom_') > -1) {
                    $("#alertinfo").val('custom').trigger('change');

                    $("#custom_alert_info").val(alertInfo.slice(7));
                }

                var chk_DID = $(".check-DID");

                if (chk_DID.filter(":checked").length == chk_DID.length) {
                    $('#dial_all')[0].checked = true;
                }

                var listMembers = ivrData.ivr_blackwhite_list,
                    accountList = mWindow.accountList,
                    tmpGroupExt = [],
                    membersArr = listMembers ? listMembers.split(",") : [];

                tmpGroupExt = Array.prototype.copy.call(accountList, tmpGroupExt);
                tmpGroupExt.remove(membersArr);

                var rightGroupExt = transDataList(membersArr),
                    leftGroupExt = transDataList(tmpGroupExt);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftGroupExt
                }, doc);

                selectbox.appendOpts({
                    el: "ivr_blackwhite_list",
                    opts: rightGroupExt
                }, doc);

                $('#ivr_out_blackwhite_list')[0].disabled = !$('#dial_trunk')[0].checked;
                $('#leftSelect')[0].disabled = $('#ivr_blackwhite_list')[0].disabled = !$('#dial_extension')[0].checked;
                $('#dial_extension').trigger('change');
                $('#switch').trigger('change');
            }
        }
    });
}

// update or add IVR information
function updateOrAddIvrInfo(action) {
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
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#ivr-list", mWindow.document).trigger('reloadGrid');

                        mWindow.get_member_ivr();

                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

// set IVR value
function rendeIvrInfoForm(user) {
    for (var item in user) {
        if (item == "enable_multiple_extension") {
            if (user[item] == "no") {
                $("#" + item)[0].checked = false;
            }
        } else {
            $("#" + item).val(user[item]);
        }
    }

    top.Custom.init(doc);
}

function ivrNameIsExist() {
    var ivrName = $("#ivr_name").val(),
        ivrNameList = mWindow.ivrNameList,
        tmpIvrNameList = [];

    tmpIvrNameList = ivrNameList.copy(tmpIvrNameList);

    if (oldIvrName) {
        tmpIvrNameList.remove(oldIvrName);
    }

    return !UCMGUI.inArray(ivrName, tmpIvrNameList);
}

function extensionIsExist() {
    var extension = $("#extension").val(),
        numberList = mWindow.numberList,
        tmpNumberList = [];

    tmpNumberList = numberList.copy(tmpNumberList);

    if (oldExtension) {
        tmpNumberList.remove(oldExtension);
    }

    return !UCMGUI.inArray(extension, tmpNumberList);
}

function checkIfInPort(val, ele) {
    var existed = true;

    if (UCMGUI.inArray(val, portExtensionList)) {
        existed = false;
    } else {
        existed = true;
    }

    return existed;
}

function checkList(val, ele) {
    if (val !== 'no' && ($('#ivr_blackwhite_list option').length === 0 || $('#ivr_blackwhite_list')[0].disabled) &&
        ($('#ivr_out_blackwhite_list').val() === '' || $('#ivr_out_blackwhite_list')[0].disabled)) {
        return false;
    }

    return true;
}

function checkListNum(val, ele) {
    var num = 0;

    if (!$('#ivr_blackwhite_list')[0].disabled) {
        var listMembers = [];

        $.each($("#ivr_blackwhite_list").children(), function(index, item) {
            listMembers.push($(item).val());
        });

        num += listMembers.length;
    }

    if (!$('#ivr_out_blackwhite_list')[0].disabled) {
        var listMembers = $('#ivr_out_blackwhite_list').val().split(',');

        num += listMembers.length;
    }

    if (num > 500) {
        return false;
    }

    return true;
}

// form validate
function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "ivr_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG2178"), ivrNameIsExist]
            },
            "extension": {
                digits: true,
                isExist: [$P.lang("LANG2126"), extensionIsExist],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "digit_timeout": {
                required: true,
                digits: true,
                range: [1, 60]
            },
            "custom_alert_info": {
                required: true,
                alphanumeric: true
            },
            "response_timeout": {
                required: true,
                digits: true,
                range: [1, 180]
            },
            "switch": {
                customCallback1: [$P.lang("LANG5334"), checkList],
                customCallback2: [$P.lang("LANG808").format(500, $P.lang("LANG5327")), checkListNum]
            },
            "ivr_out_blackwhite_list": {
                digitalAndQuote: true
            }
        },
        submitHandler: function() {
            $(".settings").not(".current_position").addClass("none_position");

            var externals = $P("input[name='external_number']", document).filter(':visible');

            if (!externals.length || (externals.length && externals.valid())) {
                var action = {},
                    members = [];

                action = UCMGUI.formSerializeVal(document);

                action["action"] = mode == 'edit' ? "updateIVR" : "addIVR";

                if (mode == 'edit') {
                    action["ivr"] = gup.call(window, "ivr_id");
                }

                if (action["alertinfo"] === 'custom') {
                    action["alertinfo"] = 'custom_' + $("#custom_alert_info").val();
                }

                keypressList.each(function(index) {
                    var key = ("keypress_" + index),
                        keyVal = $("#" + key).val(),
                        keypresseventVal = ($("#keypressevent_" + index).val()),
                        keypresseventValText = ($("#keypressevent_nu_" + index).val()),
                        obj = {};

                    if (keyVal) {
                        if (key == "keypress_10") {
                            obj["keypress"] = "*";
                        } else {
                            obj["keypress"] = index;
                        }

                        obj["keypress_event"] = keyVal;

                        if (keyVal === "member_external_number") {
                            if (keypresseventValText) {
                                obj[keyVal] = keypresseventValText;
                            }
                        } else {
                            if (keypresseventVal) {
                                obj[keyVal] = keypresseventVal;
                            }
                        }
                    }

                    members.push(obj);
                });


                if (members.length != 0) {
                    action["members"] = JSON.stringify(members);
                }

                if ($('#dial_extension')[0].checked) {
                    var listMembers = [];

                    $.each($("#ivr_blackwhite_list").children(), function(index, item) {
                        listMembers.push($(item).val());
                    });

                    if (listMembers.length != 0) {
                        action["ivr_blackwhite_list"] = listMembers.toString();
                    }
                }

                updateOrAddIvrInfo(action);
            }
        }
    });

    if (disableRange == "no") {
        $P("#extension", document).rules("add", {
            range: [startExt, endExt]
        });
    }

    $("input[name='external_number']").each(function() {
        $P(this).rules("add", {
            required: true,
            phoneNumberOrExtension: true
        });
    });

    $P('#keypressevent_0, #keypressevent_1, #keypressevent_2, #keypressevent_3, #keypressevent_4, #keypressevent_5, #keypressevent_6, ' +
        '#keypressevent_7, #keypressevent_8, #keypressevent_9, #keypressevent_10, #keypressevent_t, #keypressevent_i', document).rules("add", {
        required: true
    });
}

function link_prompt() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG843").format($P.lang("LANG238")),
        buttons: {
            ok: function() {
                top.frames["frameContainer"].module.jumpMenu('menuprompts_record.html');
            },
            cancel: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        }
    });
}

function generateNewExt() {
    var i = startExt;

    for (i; i <= endExt; i++) {
        if ($.inArray(i.toString(), mWindow.numberList) == -1) {
            return i;
        }
    }
}

function transData(res) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        arr.push(res[i].val);
    }

    return arr;
}

function transDataList(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.accountObjectList);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
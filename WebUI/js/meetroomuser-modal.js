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
    gup = UCMGUI.gup,
    inArray = UCMGUI.inArray,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    mode = gup.call(window, "mode"),
    item = gup.call(window, "item"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'], // this will be the main window 
    conferenceRange = mWindow.conferenceRange,
    conferenceList = mWindow.conferenceList,
    existNumberList = mWindow.existNumberList,
    mohNameList = mWindow.mohNameList,
    portExtensionList = mWindow.portExtensionList,
    isNewBridge,
    EDIT_BRIDGE;

String.prototype.format = top.String.prototype.format;

function change_ps(val, text) {
    if (DOM_user_invite.checked && DOM_public.checked && !text) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG2433").format($P.lang("LANG1027"), $P.lang("LANG2431")),
            buttons: {
                ok: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                },
                cancel: function() {
                    if (val == 'i') {
                        DOM_user_invite.checked = false;
                    } else {
                        DOM_public.checked = false;
                    }

                    change_disable();

                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            }
        });
    }

    change_disable();
}

function change_disable() {
    if (DOM_public.checked) {
        $('#pincode').attr("disabled", true);
        $('#admin_pincode').attr("disabled", true);
        $('#wait_admin').attr('checked', false);
        $('#wait_admin').attr('disabled', true);
        $('#wait_admin_unchecked').attr('noSerialize', '');
    } else {
        $('#pincode').removeAttr("disabled");
        $('#wait_admin').removeAttr("disabled");
        $('#wait_admin_unchecked').attr('noSerialize', true);
        $('#admin_pincode').removeAttr("disabled");
    }

    top.Custom.init(document);
}

function conferenceNameIsExist() {}

function checkIfInPort(val, ele) {
    var existed = true;

    if (inArray(val, portExtensionList)) {
        existed = false;
    } else {
        existed = true;
    }

    return existed;
}

function checkConferenceName(val, ele) {
    if (mode == 'edit') {
        if (val == EDIT_BRIDGE) {
            return true;
        } else {
            if (inArray(val, existNumberList)) {
                return false;
            } else {
                return true;
            }
        }
    } else {
        if (inArray(val, existNumberList)) {
            return false;
        } else {
            return true;
        }
    }
}

function create_add_user_work() {
    var adduserid = $('#create_user_id').val(),
        need_confirm = "1";

    if (!$('#need_confirm')[0].checked) {
        need_confirm = "0";
    }

    create_add_request($("#belong_room_id").val(), adduserid + "@" + need_confirm);
}

function create_add_request(roomid, userid) {
    $.ajax({
        type: "GET",
        cache: false,
        url: "../cgi?action=inviteuser&conf-room=" + roomid + "&user=" + userid
    });

    top.dialog.dialogMessage({
        type: 'success',
        content: $P.lang("LANG922"),
        callback: function() {
            mWindow.location.reload();
        }
    });
}

function create_add_mcb_work() {
    var mcbremoteid = $('#create_remote_room').val(),
        mcbremotepass = $('#create_remote_pass').val();

    create_add_mcb_request($("#belong_room_id_mcb").val(), mcbremoteid + "@" + mcbremotepass);
}

function create_add_mcb_request(roomid, remoteinfo) {
    $.ajax({
        type: "GET",
        cache: false,
        url: "../cgi?action=inviteroom&conf-room=" + roomid + "&remote-room=" + remoteinfo
    });

    top.dialog.dialogMessage({
        type: 'success',
        content: $P.lang("LANG922"),
        callback: function() {
            mWindow.location.reload();
        }
    });
}

function edit_meetMe_apply_work() {
    var action = {};

    action = UCMGUI.formSerializeVal(doc),

    action["action"] = (mode == 'edit') ? "updateConference" : "addConference";

    if (mode == 'edit') {
        action["conference"] = item;
    }

    if ($("#public").is(":disabled")) {
        action["public"] = "no";
    }

    if ($("#wait_admin").is(":disabled")) {
        action["wait_admin"] = "no";
    }

    $.ajax({
        type: "post",
        url: "../cgi",
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
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.location.reload();
                    }
                });
            }
        }
    });
}

function generateNewConference() {

    var startCon = conferenceRange[0],
        endCon = conferenceRange[1],
        i = startCon;

    for (i; i <= endCon; i++) {
        if (!inArray(i, existNumberList)) {
            return i;
        }
    }

    return i;
}

// get conference information
function getConferenceInfo(roomid) {
    var action = {
            "action": "getConference",
            "conference": roomid
        },
        response = {};

    $.ajax({
        type: "post",
        url: "../cgi",
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
                var conference = data.response.conference;

                if (conference && conference != {}) {
                    response = conference;
                }
            }
        }
    });

    return response;
}

function isEnableWeakPw() {
    if (conferenceRange[4] == "yes") {
        var extension = $P.lang("LANG1029"),
            admin_pincode = $P.lang("LANG1020"),
            pincode = $P.lang("LANG1032");

        $P("#pincode", document).rules("add", {
            identical: [extension, pincode, $("#extension")],
            checkNumericPw: [
                UCMGUI.enableWeakPw.showCheckPassword, {
                    type: "digital",
                    pwsId: "#pincode",
                    doc: document
                }
            ]
        });

        $P("#admin_pincode", document).rules("add", {
            identical: [extension, admin_pincode, $("#extension")],
            checkNumericPw: [
                UCMGUI.enableWeakPw.showCheckPassword, {
                    type: "digital",
                    pwsId: "#admin_pincode",
                    doc: document
                }
            ]
        });
    }
}

function init_room_validate() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "extension": {
                required: true,
                digits: true,
                // range: [conferenceRange[0], conferenceRange[1]],
                customCallback: [$P.lang("LANG2126"), checkConferenceName],
                customCallback1: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "pincode": {
                digits: true,
                minlength: 4,
                notEqualTo: [$P.lang('LANG1020'), $('#admin_pincode')]
            },
            "admin_pincode": {
                digits: true,
                minlength: 4,
                notEqualTo: [$P.lang('LANG1032'), $('#pincode')],
                required: true
            },
            "create_user_id": {
                required: true,
                // phoneNumberOrExtension: true
                digits: true
            },
            "create_remote_room": {
                required: true,
                digits: true
            },
            "create_remote_pass": {
                digits: true
            },
            "dsp_talking_threshold": {
                required: true,
                digits: true,
                range: [100, 250]
            },
            "dsp_silence_threshold": {
                required: true,
                digits: true,
                range: [100, 2500]
            }
        },
        submitHandler: function() {
            if (mode == 'add' || mode == 'edit') {
                edit_meetMe_apply_work();
            } else if (mode == 'addUser') {
                create_add_user_work();
            } else if (mode == 'addMcb') {
                create_add_mcb_work();
            } else if (mode === 'set') {
                set_conference();
            }
        }
    });

    if (conferenceRange[2] == 'no') {
        $P("#extension", doc).rules("add", {
            range: [conferenceRange[0], conferenceRange[1]]
        });
    }
}

function initForm() {
    if (config.msie) { // Add focus/blur event for input elements in ie.
        $('input').bind('focus', function() {
            $(this).addClass('ieFocusHack');
        }).bind('blur', function() {
            $(this).removeClass('ieFocusHack');
        });
    }

    $('#moh_firstcaller').click(function() {
        this.checked ? $('#tr_musicclass').css('display', 'inline-block') : $('#tr_musicclass').css('display', 'none');
        top.Custom.init(doc);
    });

    $('#quiet_mode').change(function() {
        if (this.checked) {
            $('#announce_callers').attr('checked', false);
            $('#announce_callers').attr('disabled', true);
            $('#announce_callers_unchecked').attr('noSerialize', '');
        } else {
            $('#announce_callers').attr('disabled', false);
            $('#announce_callers_unchecked').attr('noSerialize', true);
        }

        top.Custom.init(doc);
    });

    $('#announce_callers').change(function() {
        if (this.checked) {
            $('#quiet_mode').attr('checked', false);
            $('#quiet_mode').attr('disabled', true);
            $('#quiet_mode_unchecked').attr('noSerialize', '');
        } else {
            $('#quiet_mode').attr('disabled', false);
            $('#quiet_mode_unchecked').attr('noSerialize', true);
        }

        top.Custom.init(doc);
    });

    // ASTGUI.domActions.enableDisableByCheckBox('public', ['pincode', 'admin_pincode']);
    // $('#public').change(function() {
    //     if (this.checked) {
    //         $('#wait_admin').attr('checked', false);
    //         $('#wait_admin').attr('disabled', true);
    //         $('#wait_admin_unchecked').attr('noSerialize', '');
    //     } else {
    //         $('#wait_admin').attr('disabled', false);
    //         $('#wait_admin_unchecked').attr('noSerialize', true);
    //     }

    //     change_disable();
    // });

    $('#wait_admin').change(function() {
        if (this.checked) {
            $('#public').attr('checked', false);
            $('#public').attr('disabled', true);
            $('#public_unchecked').attr('noSerialize', '');
        } else {
            $('#public').attr('disabled', false);
            $('#public_unchecked').attr('noSerialize', true);
        }

        change_disable();
    });

    $("#public").change("click", function(ev, text) {
        change_ps('p', text);
        ev.stopPropagation();
    });
    $("#user_invite").bind("click", function(ev) {
        change_ps('i');
        ev.stopPropagation();
    })
}

function loadDOMElements() {
    DOM_table_mml = $('#table_meetmelist')[0];
    // DOM_edit_MeetMeDiv = $('#edit_MeetMeDiv');
    DOM_edit_MeetMe_title = $('#edit_MeetMe_title')[0];
    DOM_extension = $('#extension')[0];
    DOM_pincode = $('#pincode')[0];
    DOM_admin_pincode = $('#admin_pincode')[0];
    DOM_moh_firstcaller = $('#moh_firstcaller')[0];
    DOM_call_menu = $('#call_menu')[0];
    DOM_announce_callers = $('#announce_callers')[0];
    DOM_quiet_mode = $('#quiet_mode')[0];
    DOM_wait_admin = $('#wait_admin')[0];
    // DOM_closeLastAdmin = $('#closeLastAdmin')[0];
    DOM_recording = $('#recording')[0];
    DOM_musicclass = $('#musicclass')[0];
    DOM_user_invite = $('#user_invite')[0];
    DOM_skipauth = $('#skipauth')[0];
    DOM_public = $('#public')[0];
}

function prepareAddItemForm() {
    isNewBridge = true;
    EDIT_BRIDGE = '';
    show_MeetMe_Form();
    $("#public")[0].checked = true;
    change_disable();
}

function prepareEditItemForm(room) {
    isNewBridge = false;
    EDIT_BRIDGE = room;
    show_MeetMe_Form();
    change_disable();
}

function prepareAddUserItemForm(roomid) {
    isNewBridge = true;
    EDIT_BRIDGE = '';
    $("#belong_room_id").val(roomid);
}

function prepareAddMcbItemForm(roomid) {
    isNewBridge = true;
    EDIT_BRIDGE = '';
    $("#belong_room_id_mcb").val(roomid);
}

function show_MeetMe_Form() {
    var mohoption;

    $.each(mohNameList, function(item, value) {
        mohoption += "<option value='" + value + "'>" + value + "</option>";
    });

    $('#tr_musicclass').hide();

    $("#musicclass").append(mohoption);

    if (isNewBridge == true) {
        DOM_extension.value = generateNewConference();
        DOM_extension.disabled = false;
        return;
    }

    var conferenceData = getConferenceInfo(EDIT_BRIDGE);
    DOM_extension.value = EDIT_BRIDGE;
    DOM_extension.disabled = true;

    if (conferenceData != undefined) {
        DOM_pincode.value = conferenceData['pincode'] || '';
        DOM_admin_pincode.value = conferenceData['admin_pincode'] || '';

        if (conferenceData['moh_firstcaller'] === 'yes') {
            DOM_moh_firstcaller.checked = true;
            $('#tr_musicclass').show();
            $(DOM_musicclass).val(conferenceData['musicclass']);
        } else {
            DOM_moh_firstcaller.checked = false;
        }

        DOM_call_menu.checked = (conferenceData['call_menu'] === 'yes') ? true : false;
        DOM_announce_callers.checked = (conferenceData['announce_callers'] === 'yes') ? true : false;
        DOM_quiet_mode.checked = (conferenceData['quiet_mode'] === 'yes') ? true : false;
        DOM_wait_admin.checked = (conferenceData['wait_admin'] === 'yes') ? true : false;
        DOM_recording.checked = (conferenceData['recording'] === 'yes') ? true : false;
        DOM_user_invite.checked = (conferenceData['user_invite'] === 'yes') ? true : false;
        DOM_skipauth.checked = (conferenceData['skipauth'] === 'yes') ? true : false;
        DOM_public.checked = (conferenceData['public'] === 'yes') ? true : false;

        if (DOM_public.checked == true) {
            DOM_pincode.value = '';

            $(DOM_pincode).attr("disabled", true);
            $(DOM_admin_pincode).attr("disabled", true);
        }

        $('#quiet_mode').trigger('change');
        $('#announce_callers').trigger('change');
        $('#public').trigger('change', 'firstLoad');
        $('#wait_admin').trigger('change');
    }
}

function set_conference() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'updateConfbridgeSettings',
            'talk_detection_events': $('#talk_detection_events')[0].checked ? 'yes' : 'no',
            'dsp_talking_threshold': $('#dsp_talking_threshold').val(),
            'dsp_silence_threshold': $('#dsp_silence_threshold').val()
        },
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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });
            }
        }
    });
}

function get_set_conference() {
    $.ajax({
        type: "GET",
        url: "../cgi?action=getConfbridgeSettings",
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
                var data = data.response.confbridge_settings;

                $('#talk_detection_events')[0].checked = data.talk_detection_events === 'yes';
                $('#dsp_talking_threshold').val(data.dsp_talking_threshold);
                $('#dsp_silence_threshold').val(data.dsp_silence_threshold);
            }
        }
    });
}

$(function() {
    $P.lang(doc, true);

    loadDOMElements();

    initForm();

    if (mode == "add") {
        prepareAddItemForm();
        $("#editForm").show();
        $("#extension").focus();
    } else if (mode == "edit") {
        prepareEditItemForm(item);
        $("#editForm").show();
    } else if (mode == "addUser") {
        prepareAddUserItemForm(item);
        $('#addUserForm').show();
        $("#create_user_id").focus();
    } else if (mode == "addMcb") {
        prepareAddMcbItemForm(item);
        $('#addMcbForm').show();
        $("#create_remote_room").focus();
    } else if (mode === 'set') {
        $('#setForm').show();
        get_set_conference();
    }

    init_room_validate();

    isEnableWeakPw();

    top.Custom.init(doc);

    $('#addConference').bind('click', function() {
        if (mode == 'add') {
            askExtensionRange($("#extension").val(), conferenceRange[0], conferenceRange[1], conferenceRange[2]);
        }
    });
});
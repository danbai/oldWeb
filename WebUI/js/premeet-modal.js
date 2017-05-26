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
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    selectbox = UCMGUI.domFunction.selectbox,
    mode = gup.call(window, "mode"),
    bookid = gup.call(window, 'bookid'),
    calendar = gup.call(window, 'calendar'),
    role = $P.cookie('role'),
    aList = [],
    aExtensionList = [],
    nMax = 25,
    numFxo = Number(config.model_info.num_fxo),
    numPri = Number(config.model_info.num_pri),
    starttime, endtime, editRecurringevent,
    aStatusComment = [],
    aUpdated = [],
    oUpdated = {};

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3776"));

    if (mode === 'add' || mode === 'edit') {
        if (role !== 'privilege_0' && role !== 'privilege_1') {
            $('#emailTemplate').hide();
        }

        $('#clear_settings').hide();

        initForm();

        createSpecialPhone();

        dateTimePicker($('#starttime'));
        //dateTimePicker($('#endtime'));

        initValidator();

        loadDOMElements();

        initAdvanced();

        isEnableWeakPw();

        change_disable();

        jumpMenu();

        if (mode === 'edit') {
            prepareEditItemForm();
        } else if (mode === 'add') {
            top.Custom.init(doc);
        }
    } else if (mode === 'cleaner') {
        initValidatorCleaner();

        initCleaner();

        $('#pre_meet_div').hide();
        $('#clear_settings').show();
    }

    if (calendar === 'calendar') {
        $('#starttime').val(decodeURIComponent(gup.call(window, 'sCalStart')));
        $('#endtime').val(parseInt(gup.call(window, 'nMeetLength')));
    }

    $.navSlide(false, false, true, true, true);
});

function jumpMenu() {
    $('.link').on('click', function() {
        var sUrl = $(this).attr('data-url') + ".html",
            lang = $(this).attr('data-lang');

        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG843").format($P.lang(lang)),
            buttons: {
                ok: function() {
                    top.frames['frameContainer'].module.jumpMenu(sUrl);
                },
                cancel: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            }
        });
    });
}

function initCleaner() {
    var CDR_FIELDS = ['Phour_clean_scheduleconf', 'Pclean_scheduleconf_interval'];

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "Pen_auto_clean_scheduleconf",
        enableList: CDR_FIELDS
    }, doc)

    $.ajax({
        type: "GET",
        url: "/cgi?action=getCleanerValue",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: load_default
    });
}

function load_default(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        $("#Phour_clean_scheduleconf").val(data.response.Phour_clean_scheduleconf);
        $("#Pclean_scheduleconf_interval").val(data.response.Pclean_scheduleconf_interval);
        $("#Pen_auto_clean_scheduleconf")[0].checked = (data.response.Pen_auto_clean_scheduleconf == 1 ? true : false);

        $("#Phour_clean_scheduleconf, #Pclean_scheduleconf_interval").attr("disabled", !$("#Pen_auto_clean_scheduleconf").is(":checked"));

        top.Custom.init(doc);
    }
}

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

function initAdvanced() {
    var mohoption,
        mohNameList = UCMGUI.isExist.getList("getMohNameList");

    $.each(mohNameList, function(item, value) {
        mohoption += "<option value='" + value + "'>" + value + "</option>";
    });

    //$('#tr_musicclass').hide();

    $("#musicclass").append(mohoption);

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
    });
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

function isEnableWeakPw() {
    var conferenceRange = UCMGUI.isExist.getRange('conference');

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

function dateTimePicker(obj) {
    obj.datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm:ss'
        //minuteMax: 30
    });

    /*obj.nFirstClick = 1;

    obj.on('focus', function() {
        if (mode === 'add') {
            if (obj.nFirstClick === 1) {
                $('.ui-datepicker-current').trigger('click');
                obj.nFirstClick = 2;
            }
        }
    });*/
}

function initForm() {
    var aConference = mWindow.aConference,
        str = '',
        ele,
        oConfno = $('#confno');

    for (var i = 0; i < aConference.length; i++) {
        ele = aConference[i].extension;
        str += '<option value="' + ele + '">' + ele + '</option>';
    }

    oConfno.html(str);
    top.Custom.init(doc, oConfno[0]);

    var bCandlerDisable = mWindow.bCandlerDisable,
        oCandler = $('#open_calendar');

    oCandler[0].disabled = bCandlerDisable;
    top.Custom.init(doc, oCandler[0]);

    var ringgroupExtList = mWindow.ringgroupExtList,
        remoteExtList = mWindow.remoteExtList;

    selectbox.appendOpts({
        el: "localeLeftSelect",
        opts: ringgroupExtList
    }, doc);

    selectbox.electedSelect({
        rightSelect: "localeRightSelect",
        leftSelect: "localeLeftSelect",
        allToRight: "localeAllToRight",
        oneToRight: "localeOneToRight",
        oneToLeft: "localeOneToLeft",
        allToLeft: "localeAllToLeft",
        isSort: true
    }, doc);

    selectbox.appendOpts({
        el: "remoteLeftSelect",
        opts: remoteExtList
    }, doc);

    selectbox.electedSelect({
        rightSelect: "remoteRightSelect",
        leftSelect: "remoteLeftSelect",
        allToRight: "remoteAllToRight",
        oneToRight: "remoteOneToRight",
        oneToLeft: "remoteOneToLeft",
        allToLeft: "remoteAllToLeft",
        isSort: true
    }, doc);

    $('#recurringevent').on('change', function() {
        if ($(this).val() === 'COMMON') {
            $('#start_locale').attr('locale', 'LANG2229');
        } else {
            $('#start_locale').attr('locale', 'LANG4282');
        }

        $P.lang(doc, true)
    });

    $('#public').on('change', function() {
        if (this.checked) {
            $('#con_admin')[0].disabled = true;
        } else {
            $('#con_admin')[0].disabled = false;
        }
    })

    $('#public').trigger('change');

    if (numPri >= 1) {
        nMax = 64;
    } else if (numFxo > 4) {
        nMax = 32;
    }
}

function createSpecialPhone() {
    var oTbody = $('#add_people').find('tbody');

    $('#btn_add').on('click', function() {
        var nMember = $('.member_tel').length,
            sTr = '<tr>' +
            '<td><input type="text" class="member_name" name="member_name" maxlength="64"></td>' +
            '<td><input type="text" id="member_tel' + nMember + '" class="member_tel" name="member_tel' + nMember + '"></td>' +
            '<td><input type="text" id="member_mail' + nMember + '" class="member_mail" name="member_mail' + nMember + '"></td>' +
            '<td class="mail_check_td">' +
            '<label>' + $P.lang("LANG3782") + '</label>' +
            '<input type="checkbox" class="mail_check" checked>' +
            '</td>' +
            '<td><button type="button" class="btn_del"></button></td>' +
            '</tr>';

        oTbody.append(sTr);

        addRules(nMember);

        top.Custom.init(doc, oTbody[0]);
        return false;
    });

    oTbody.on('click', '.btn_del', function() {
        $(this).closest('tr').remove();
        return false;
    });
}

function prepareEditItemForm() {
    $('.edit_hide').hide();

    $.ajax({
        url: '../cgi',
        type: 'GET',
        dataType: 'json',
        data: {
            action: "getMeetme",
            bookid: bookid
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: "error",
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data),
                oMeetMeList = data.response.bookid,
                aMembers = oMeetMeList.members,
                ele, location, extension, membername, nMember, sState, sComment,
                bLocaleSendEmail = true,
                bRemoteSendEmail = true,
                n = 0,
                oTbody = $('#add_people').find('tbody');

            if (bool) {
                starttime = oMeetMeList.starttime;
                endtime = oMeetMeList.endtime;
                mohFirstcaller = oMeetMeList.moh_firstcaller;
                editRecurringevent = oMeetMeList.recurringevent;

                oUpdated.confname = oMeetMeList.confname ? oMeetMeList.confname : '';
                oUpdated.confno = oMeetMeList.confno ? oMeetMeList.confno : '';
                oUpdated.description = oMeetMeList.description ? oMeetMeList.description : '';
                oUpdated.starttime = oMeetMeList.starttime ? oMeetMeList.starttime : '';
                oUpdated.endtime = oMeetMeList.endtime ? oMeetMeList.endtime : '';
                oUpdated.pincode = oMeetMeList.pincode ? oMeetMeList.pincode : '';
                oUpdated.admin_pincode = oMeetMeList.admin_pincode ? oMeetMeList.admin_pincode : '';
                oUpdated.members = oMeetMeList.members ? oMeetMeList.members : [];

                UCMGUI.domFunction.updateDocument(oMeetMeList, doc);

                var nShour = parseInt(starttime.slice(11, 13), 10),
                    nSmin = parseInt(starttime.slice(14, 16), 10),
                    nEhour = parseInt(endtime.slice(11, 13), 10),
                    nEmin = parseInt(endtime.slice(14, 16), 10);

                $('#endtime').val((nEhour - nShour) * 60 + nEmin - nSmin);

                if (mohFirstcaller === 'yes') {
                    $('#tr_musicclass').css('display', 'inline-block');
                }

                if (DOM_public.checked == true) {
                    DOM_pincode.value = '';

                    $(DOM_pincode).attr("disabled", true);
                    $(DOM_admin_pincode).attr("disabled", true);
                }

                $('#quiet_mode').trigger('change');
                $('#announce_callers').trigger('change');
                $('#public').trigger('change', 'firstLoad');
                $('#wait_admin').trigger('change');

                for (var i = 0; i < aMembers.length; i++) {
                    ele = aMembers[i];
                    location = ele.location;
                    extension = ele.member_extension;
                    bSendEmail = ele.send_email;
                    membername = ele.member_name;
                    sState = ele.state;
                    sComment = ele.comment;

                    if (location === 'local') {
                        $('#localeLeftSelect').find('option[value="' + extension + '"]').appendTo('#localeRightSelect');

                        if (bSendEmail === 'no') {
                            bLocaleSendEmail = false;
                        }
                    } else if (location === 'remote') {
                        //$('#remoteLeftSelect').find('option[value="' + extension + '"][title="' + membername + '"]').appendTo('#remoteRightSelect');
                        //bug45232,title changed.
                        var sTitleMember = membername.replace(/\s/, '--').split(' ')[0];
                        $('#remoteLeftSelect').find('option[value="' + extension + '"][title^="' + sTitleMember + '"]').appendTo('#remoteRightSelect');

                        if (bSendEmail === 'no') {
                            bRemoteSendEmail = false;
                        }
                    } else if (location === 'special') {
                        memberName = ele.member_name;
                        email = ele.email;
                        sendEmail = ele.send_email;

                        if (n === 0) {
                            oTbody.find('.member_name').val(memberName);
                            oTbody.find('.member_tel').val(extension);
                            oTbody.find('.member_mail').val(email);
                            oTbody.find('.mail_check')[0].checked = (sendEmail === 'yes' ? true : false);
                            n = 1;
                        } else {
                            nMember = $('.member_tel').length;

                            var sTr = '<tr>' +
                                '<td><input type="text" class="member_name" maxlength="64" name="member_name" value="' + (memberName ? memberName : '') + '"></td>' +
                                '<td><input type="text" id="member_tel' + nMember + '" class="member_tel" name="member_tel' + nMember + '" value="' + (extension ? extension : '') + '"></td>' +
                                '<td><input type="text" id="member_mail' + nMember + '" class="member_mail" name="member_mail' + nMember + '" value="' + (email ? email : '') + '"></td>' +
                                '<td class="mail_check_td">' +
                                '<label>' + $P.lang("LANG3782") + '</label>' +
                                '<input type="checkbox" class="mail_check" ' + (sendEmail === "yes" ? "checked" : "") + '>' +
                                '</td>' +
                                '<td><button type="button" class="btn_del"></button></td>' +
                                '</tr>';

                            oTbody.append(sTr);

                            addRules(nMember);
                        }
                    } else if (location === 'mcb') {
                        $('#create_remote_room').val(extension);
                        $('#create_remote_pass').val(ele.private_data);
                    }

                    if (ele.is_admin === 'yes') {
                        $('#con_admin').val(ele.member_extension);
                    }

                    aStatusComment[extension] = {
                        state: sState,
                        comment: sComment
                    }
                }

                $('#locale_send_email')[0].checked = bLocaleSendEmail;
                $('#remote_send_email')[0].checked = bRemoteSendEmail;

                $('#recurringevent').trigger('change');

                top.Custom.init(doc);
            }
        }
    });
}

function getMemberList(obj, location, sendEmail) {
    var memberName, memberExtension,
        oConAdmin = $('#con_admin'),
        sConAdmin = oConAdmin.val();

    obj.each(function() {
        membername = $(this).attr('title');
        memberExtension = $(this).attr('value');

        aList.push({
            'member_name': membername.replace(/\"/g, '').replace(/--/g, ' '),
            'member_extension': memberExtension,
            'email': $(this).attr('attr') ? $(this).attr('attr') : '',
            'send_email': sendEmail,
            'location': location,
            'is_admin': (!oConAdmin[0].disabled && memberExtension === sConAdmin) ? 'yes' : 'no',
            'state': aStatusComment[memberExtension] ? aStatusComment[memberExtension].state : 'needsAction',
            'comment': aStatusComment[memberExtension] ? aStatusComment[memberExtension].comment : ''
        });

        aExtensionList.push($(this).attr('value'));
    });
}

function addZero(n) {
    if (n < 10) {
        n = "0" + n;
    }
    return n;
}

function addRules(nMember) {
    $P('#member_tel' + nMember, doc).rules('add', {
        number: true,
        customCallback: [$P.lang("LANG4172"), checkMemberTelRequired]
    });

    $P('#member_mail' + nMember, doc).rules('add', {
        email: true
    });
}

function checkStartTime(val, ele) {
    /*var t = new Date(),
        sNow = t.getFullYear() + '-' + addZero(t.getMonth() + 1) + '-' + addZero(t.getDate()) + ' ' +
        addZero(t.getHours()) + ':' + addZero(t.getMinutes()) + ':' + addZero(t.getSeconds());*/
    var nClickTime = parseInt($('#kickall_time').val(), 10),
        sNow = $(".sysTime", top.frames["frameContainer"].document).text().slice(0, 16),
        sNowHour = parseInt(sNow.slice(11, 13), 10),
        sNowMinute = parseInt(sNow.slice(14, 16), 10) + nClickTime;

    if (sNowMinute >= 60) {
        sNowMinute = sNowMinute - 60;
        sNowHour = sNowHour + 1;
    }

    sNow = sNow.slice(0, 11) + addZero(sNowHour) + ':' + addZero(sNowMinute) + ':00';

    if (mode === 'edit' && editRecurringevent !== 'COMMON' && starttime === $('#starttime').val()) {
        return true;
    }

    if (val < sNow) {
        return false;
    }

    return true;
}

function checkEndTime(val, ele) {
    var nStartHour = parseInt($('#starttime').val().slice(11, 13), 10),
        nStartMinute = parseInt($('#starttime').val().slice(14, 16), 10),
        nEhour = Math.floor(val / 60) + nStartHour;

    if ( nEhour >= 24 || (nEhour>= 23 && (val % 60 + nStartMinute) > 59)) {
        return false;
    }

    return true;
}

function checkTotalMembers(val, ele) {
    var nTotal = $('#localeRightSelect').find('option').length + $('#remoteRightSelect').find('option').length,
        sName, sTel, sMail;

    $('#add_people').find('tbody').find('tr').each(function() {
        sName = $(this).find('.member_name').val();
        sTel = $(this).find('.member_tel').val();
        sMail = $(this).find('.member_mail').val();

        if (sName !== '' || sTel !== '' || sMail !== '') {
            nTotal += 1;
        }
    });

    if ($('#create_remote_room').val() !== '') {
        nTotal += 1;
    }

    if (nTotal > nMax) {
        return false;
    }

    return true;
}

function checkMemberTelRequired(val, ele) {
    if (val === '' && ($(ele).closest('tr').find('.member_name').val() !== '' || $(ele).closest('tr').find('.member_mail').val() !== '')) {
        return false;
    }

    return true;
}

function checkTimeConflict(val, ele) {
    var aMeetList = mWindow.aMeetList,
        confno = $('#confno').val(),
        starttime = val,
        nMinute = $('#endtime').val(),
        nEhour = parseInt(starttime.slice(11, 13), 10) + Math.floor(nMinute / 60),
        nEmin = parseInt(starttime.slice(14, 16), 10) + nMinute % 60,
        nClickTime = parseInt($('#kickall_time').val());
        //endtime = starttime.slice(0, 11) + addZero(parseInt(starttime.slice(11, 13), 10) + parseInt($('#endtime').val(), 10)) + starttime.slice(13),

    if (nEmin >= 60) {
        nEmin = nEmin - 60;
        nEhour = nEhour + 1;
    }

    var endtime = starttime.slice(0, 11) + addZero(nEhour) + ':' + addZero(nEmin) + ':00',
        endtimeClear = endtime.slice(0, 14) + (Number(endtime.slice(14, 16)) + nClickTime) + ':00',
        startTimeDay = starttime.slice(0, 10),
        endtimeDay = endtime.slice(0, 10),
        startTimeHour = starttime.slice(11, 16),
        endTimeHour = endtime.slice(11, 16),
        ele, eleStartTime, eleEndTime, eleConfno, eleRecurr, eleStartTimeDay, eleEndTimeDay, eleStartTimeHour, eleEndTimeHour,
        sRecurr = $('#recurringevent').val();

    if (sRecurr === 'WEEKLY') {
        sRecurr = getRecurr(starttime);
    }

    for (var i = 0; i < aMeetList.length; i++) {
        ele = aMeetList[i];
        eleStartTime = ele.starttime;
        eleEndTime = ele.endtime;
        eleEndTimeClear = eleEndTime.slice(0, 14) + (Number(eleEndTime.slice(14, 16)) + nClickTime) + ':00';
        eleConfno = ele.confno;
        eleRecurr = ele.recurr;
        eleStartTimeDay = eleStartTime.slice(0, 10);
        eleEndTimeDay = eleEndTime.slice(0, 10);
        eleStartTimeHour = eleStartTime.slice(11, 16);
        eleEndTimeHour = eleEndTime.slice(11, 16);

        /*if (eleRecurr === 'WEEKLY') {
            eleRecurr = getRecurr(eleStartTime);
        }*/

        if ((mode === 'edit' && bookid === ele.bookid) || confno !== eleConfno) {
            continue;
        }

        if (sRecurr === 'COMMON') {
            if (eleRecurr === 'COMMON') {
                if (starttime < eleEndTimeClear && endtimeClear > eleStartTime) {
                    return false;
                }
            } else if (eleRecurr === 'DAILY') {
                if (startTimeDay >= eleStartTimeDay && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                    return false;
                }
            } else if (getRecurr(starttime) === eleRecurr && startTimeDay >= eleStartTimeDay && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                return false;
            }
        } else if (sRecurr === 'DAILY') {
            if (eleRecurr === 'COMMON') {
                if (startTimeDay <= eleStartTimeDay && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                    return false;
                }
            } else if (startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                return false;
            }
        } else {
            if (eleRecurr === 'COMMON') {
                if (getRecurr(eleStartTime) === sRecurr && startTimeDay <= eleStartTimeDay && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                    return false;
                }
            } else if (eleRecurr === 'DAILY') {
                if (startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                    return false;
                }
            } else if (sRecurr === getRecurr(eleStartTime) && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                return false;
            }
        }
    }

    return true;
}

function getRecurr(startTime) {
    var myDate = new Date(),
        repeatYear = parseInt(startTime.slice(0, 4), 10),
        repeatMon = parseInt(startTime.slice(5, 7), 10) - 1,
        repeatDay = parseInt(startTime.slice(8, 10), 10);

    myDate.setFullYear(repeatYear, repeatMon, repeatDay);
    var repeatData = myDate.getDay();

    switch (repeatData) {
        case 0:
            return "Esunday";
        case 1:
            return "Fmonday";
        case 2:
            return "Gtuesday";
        case 3:
            return "Hwednesday";
        case 4:
            return "Ithursday";
        case 5:
            return "Jfriday";
        case 6:
            return "Ksaturday";
    }
}

function checkFormat(val, ele) {
    if (val.match(/['"`]/)) {
        return false;
    }

    return true;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "member_tel": {
                number: true,
                customCallback: [$P.lang("LANG4172"), checkMemberTelRequired]
            },
            "member_mail": {
                email: true
            },
            "confname": {
                required: true,
                customCallback: [$P.lang("LANG4465"), checkFormat]
            },
            "starttime": {
                required: true,
                customCallback: [$P.lang("LANG3786"), checkStartTime],
                customCallback1: [$P.lang("LANG3812"), checkTimeConflict]
            },
            "endtime": {
                required: true,
                digits: true,
                range: [1, 1440],
                customCallback: [$P.lang("LANG3785"), checkEndTime]
            },
            "description": {
                maxlength: 499,
                customCallback: [$P.lang("LANG4465"), checkFormat]
            },
            "localeRightSelect": {
                customCallback: [$P.lang("LANG3796").format(nMax), checkTotalMembers]
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
            "kickall_time": {
                required: true,
                digits: true,
                maxlength: 2,
                range: [6, 30]
            },
            "con_admin": {
                digits: true
            },
            "member_name": {
                cidName: true
            },
            "create_remote_room": {
                required: function() {
                    return $('#create_remote_pass').val() !== '';
                },
                digits: true
            },
            "create_remote_pass": {
                digits: true
            }
        },
        submitHandler: function() {
            conferenceSettings();
        }
    });
}

function initValidatorCleaner() {
    if ($("#form_cleaner").tooltip) {
        $("#form_cleaner").tooltip();
    }

    $P("#form_cleaner", doc).validate({
        rules: {
            "Phour_clean_scheduleconf": {
                required: true,
                digits: true,
                range: [0, 23]
            },
            "Pclean_scheduleconf_interval": {
                required: true,
                digits: true,
                range: [1, 30]
            }
        },
        submitHandler: function() {
            cleanerSettings();
        }
    });
}

function conferenceSettings() {
    $(".settings").not(".current_position").addClass("none_position");

    aList = [];
    aExtensionList = [];

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG905")
    });

    var data = {},
        sName, sTel, sMail, bIfMail, sLang;

    //advanced data
    data = UCMGUI.formSerializeVal(doc.getElementById('prioptions'));

    if ($("#public").is(":disabled")) {
        data["public"] = "no";
    }

    if ($("#wait_admin").is(":disabled")) {
        data["wait_admin"] = "no";
    }

    $('#confno, #confname, #description, #starttime, #kickall_time').each(function() {
        data[this.id] = $(this).val();
    });

    var sStartTime = $('#starttime').val(),
        nMinute = $('#endtime').val(),
        nEhour = parseInt(sStartTime.slice(11, 13), 10) + Math.floor(nMinute / 60),
        nEmin = parseInt(sStartTime.slice(14, 16), 10) + nMinute % 60;

    if (nEmin >= 60) {
        nEmin = nEmin - 60;
        nEhour = nEhour + 1;
    }

    data['endtime'] = sStartTime.slice(0, 11) + addZero(nEhour) + ':' + addZero(nEmin) + ':00';

    //data.closed = $('#closed')[0].checked ? 'yes' : 'no';
    data.closed = 'no';

    getMemberList($('#localeRightSelect').find('option'), 'local', $('#locale_send_email')[0].checked ? 'yes' : 'no');
    getMemberList($('#remoteRightSelect').find('option'), 'remote', $('#remote_send_email')[0].checked ? 'yes' : 'no');

    var oConAdmin = $('#con_admin'),
        sConAdmin = oConAdmin.val();

    $('#add_people').find('tbody').find('tr').each(function() {
        sName = $(this).find('.member_name').val();
        sTel = $(this).find('.member_tel').val();
        sMail = $(this).find('.member_mail').val();
        bIfMail = $(this).find('.mail_check')[0].checked ? 'yes' : 'no';

        if (sName !== '' || sTel !== '' || sMail !== '') {
            aList.push({
                'member_name': sName,
                'member_extension': sTel,
                'email': sMail ? sMail : '',
                'send_email': bIfMail,
                'location': 'special',
                'is_admin': (!oConAdmin[0].disabled && sTel === sConAdmin) ? 'yes' : 'no',
                'state': aStatusComment[sTel] ? aStatusComment[sTel].state : 'needsAction',
                'comment': aStatusComment[sTel] ? aStatusComment[sTel].comment : ''
            });

            aExtensionList.push(sTel);
        }
    });

    aExtensionList.sort();

    for (var i = 0; i < aExtensionList.length - 1; i++) {
        if (aExtensionList[i] === aExtensionList[i + 1]) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG4171").format(aExtensionList[i]),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });

            return;
        }
    }

    if ($('#con_admin').val() !== '' && !$('#con_admin')[0].disabled) {
        var bAdmin = false;

        for (var i = 0; i < aList.length; i++) {
            if ($('#con_admin').val() === aList[i].member_extension) {
                bAdmin = true;
                break;
            }
        }

        if (!bAdmin) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG4310"),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });

            return;
        }
    }

    var sRemoteRoom = $('#create_remote_room').val(),
        sRemotePass = $('#create_remote_pass').val();

    if (sRemoteRoom !== '') {
        var oMcb = {
            'member_name': sRemoteRoom,
            'member_extension': sRemoteRoom,
            'email': '',
            'send_email': 'no',
            'location': 'mcb',
            'is_admin': 'no',
            'state': 'needsAction',
            'comment': '',
            'private_data': sRemotePass
        };

        aList.push(oMcb);
    }

    data.members = JSON.stringify(aList);

    var startTime = $('#starttime').val();

    if (mode === 'add') {
        var sRecurr = $('#recurringevent').val(),
            sNow = $(".sysTime", top.frames["frameContainer"].document).text(),
            zone = sNow.slice(-6).replace(':', '');

        data.action = 'addMeetme';
        data.bookid = new Date().getTime();
        data.timezone = zone;

        if (sRecurr === 'WEEKLY') {
            sRecurr = getRecurr(startTime);
        }
        data.recurringevent = sRecurr;

        if (!$('#open_calendar')[0].disabled) {
            data.open_calendar = $('#open_calendar')[0].checked ? 'yes' : 'no';
        }

        mailId = 'invite';
        sLang = "LANG3787";
    } else {
        if (editRecurringevent !== 'COMMON' && editRecurringevent !== 'DAILY') {
            editRecurringevent = getRecurr(startTime);
        }

        data.action = 'updateMeetme';
        data.bookid = bookid;
        data.recurringevent = editRecurringevent;
        mailId = 'update';
        sLang = "LANG3789";

        var aNeedUpdated = ['confname', 'confno', 'description', 'starttime', 'endtime', 'pincode', 'admin_pincode'],
            ele;

        for (var i = 0; i < aNeedUpdated.length; i++) {
            ele = aNeedUpdated[i];

            if (ele.match(/^confname|confno|description|pincode|admin_pincode|starttime$/) && $('#' + ele).val() !== oUpdated[ele]) {
                aUpdated.push(ele);
            } else if (ele === 'endtime' && data.endtime !== oUpdated.endtime) {
                aUpdated.push('endtime');
            }
        }

        if (aUpdated.indexOf('starttime') > -1 && aUpdated.indexOf('endtime') === -1) {
            aUpdated.push('endtime');
        } else if (aUpdated.indexOf('starttime') === -1 && aUpdated.indexOf('endtime') > -1) {
            aUpdated.push('starttime');
        }

        var aOldExt = [],
            aNewExt = [],
            aDelExt = [];

        for (var i = 0; i < aList.length; i++) {
            aNewExt.push(aList[i].member_extension);
        }

        for (var i = 0; i < oUpdated.members.length; i++) {
            aOldExt.push(oUpdated.members[i].member_extension);
        }

        for (var i = 0, ele; i < aList.length; i++) {
            ele = aList[i];

            if (aOldExt.indexOf(ele.member_extension) === -1) {
                aUpdated.push('add_' + ele.member_extension);
            }

            for (var j = 0, oldEle; j < oUpdated.members.length; j++) {
                oldEle = oUpdated.members[j];

                if (ele.member_extension === oldEle.member_extension && (ele.member_name !== oldEle.member_name || ele.email !== oldEle.email || ele.is_admin !== oldEle.is_admin)) {
                    aUpdated.push('update_' + ele.member_extension);
                    break;
                }
            }
        }

        for (var i = 0, ele; i < oUpdated.members.length; i++) {
            ele = oUpdated.members[i];

            if (aNewExt.indexOf(ele.member_extension) === -1) {
                if (ele.location === 'special') {
                    aDelExt.push(ele.member_extension + ' ' + ele.member_name + ' ' + ele.email);
                } else {
                    aDelExt.push(ele.member_name + ' ' + ele.email);
                }
            }
        }

        if (aDelExt.length > 0) {
            aUpdated.push(aDelExt);
        }

        aUpdated = JSON.stringify(aUpdated);
    }

    fnSaveChanges(data, mailId, data.bookid, sLang, aUpdated);
}

function cleanerSettings() {
    var data = {
        action: 'setCleanerValue',
        Pen_auto_clean_scheduleconf: $('#Pen_auto_clean_scheduleconf').is(':checked') ? 1 : 0,
        Phour_clean_scheduleconf: $('#Phour_clean_scheduleconf').val(),
        Pclean_scheduleconf_interval: $('#Pclean_scheduleconf_interval').val()
    }

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG904")
    });

    $.ajax({
        type: "POST",
        url: "/cgi?",
        data: data,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: apply_changes
    });
}

function apply_changes(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        $.ajax({
            type: 'GET',
            url: '../cgi?action=reloadCrontabs&crontabjobs=',
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG844")
                    });
                }
            }
        });
    }
}

function fnSaveChanges(data, mailId, bookId, sLang, aUpdated) {
    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        data: data,
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
                var sUrl = "../cgi?action=sendMeetmeMail&" + mailId + "=" + bookId;

                if (mailId === 'update') {
                    sUrl += '&update_data=' + aUpdated;
                }

                $.ajax({
                    url: sUrl,
                    type: "GET",
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: errorThrown
                        });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang(sLang)
                            });

                            mWindow.aMeetList.length = 0;

                            var DO_RELOAD = function() { // DO_RELOAD();
                                var mainScreen = top.frames['frameContainer'].frames['mainScreen'];
                                mainScreen.$("#groups_list", mainScreen.document).trigger('reloadGrid');

                                mainScreen.$("#xgcalendarp", mainScreen.document).BCalReload();
                            };

                            setTimeout(DO_RELOAD, 500);
                        }
                    }
                });
            }
        }
    });
}
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
    mohNameList = [],
    oldCompactheaders = false,
    oldTosAudio = "";

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG691"));

    // getMohNameList();

    getTOSSettings();

    initValidator();

    top.Custom.init(doc);
});

function fnSaveChanges() {
    var action = {};

    action = UCMGUI.formSerializeVal(doc);
    action["action"] = "updateTOSSettings";

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang('LANG826')
    });

    $.ajax({
        type: "post",
        url: '../cgi',
        data: action,
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
                var newTosAudio = $("#tos_audio").val(),
                    newTosSip = $("#tos_sip").val(),
                    newTosVideo = $("#tos_video").val();

                if (oldTosAudio != newTosAudio || oldTosSip != newTosSip || oldTosVideo != newTosVideo) {
                    oldTosAudio = newTosAudio;
                    oldTosSip = newTosSip;
                    oldTosVideo = newTosVideo;

                    confirm_reboot();
                } else {
                    var after = function() {
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG4764")
                        });
                    };

                    setTimeout(function() {
                        if (($("#compactheaders").is(":checked") ? "yes" : "no") != oldCompactheaders) {
                            top.dialog.dialogConfirm({
                                confirmStr: $P.lang("LANG926"),
                                buttons: {
                                    ok: UCMGUI.loginFunction.confirmReboot,
                                    cancel: function() {
                                        window.location.reload();
                                    }
                                }
                            });
                        } else {
                            after();
                        }
                    }, 300);
                }
            }
        }
    });
}

function confirm_reboot() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG926"),
        buttons: {
            ok: UCMGUI.loginFunction.confirmReboot
        }
    });
}
// function getMohNameList() {
//     var option = '';

//     mohNameList = UCMGUI.isExist.getList("getMohNameList");

//     $.each(mohNameList, function(item, value) {
//         option += "<option value='" + value + "'>" + value + "</option>";
//     });

//     $("#mohinterpret, #mohsuggest").empty().append(option);
// }

function getTOSSettings() {
    var action = {};

    // action = UCMGUI.formSerialize(doc);
    action["action"] = "getTOSSettings";

    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        async: false,
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
                var siptosSettings = data.response.siptos_settings,
                    rtptimeout = siptosSettings.rtptimeout,
                    rtpholdtimeout = siptosSettings.rtpholdtimeout;

                oldCompactheaders = siptosSettings.compactheaders;
                oldTosAudio = siptosSettings.tos_audio;
                oldTosSip = siptosSettings.tos_sip;
                oldTosVideo = siptosSettings.tos_video;

                UCMGUI.domFunction.updateDocument(siptosSettings, doc);

                if (rtptimeout == 0) {
                    $("#rtptimeout").val('');
                }

                if (rtpholdtimeout == 0) {
                    $("#rtpholdtimeout").val('');
                }

                top.Custom.init(doc);
            } else {
                setDefaultValue();
            }
        }
    });
}

function initValidator() {
    var rtpTimeoutLabel = $P.lang('LANG1803'),
        rtpHoldTimeoutLabel = $P.lang('LANG1801'),
        maxExpiryLabel = $P.lang('LANG1791'),
        minExpiryLabel = $P.lang('LANG1793'),
        defaultExpiryLabel = $P.lang('LANG1783');

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "rtptimeout": {
                digits: true,
                smaller: [rtpTimeoutLabel, rtpHoldTimeoutLabel, $("input[name='rtpholdtimeout']")],
                notEqualTo: [rtpHoldTimeoutLabel, $("input[name='rtpholdtimeout']")]
            },
            "rtpholdtimeout": {
                digits: true,
                bigger: [rtpHoldTimeoutLabel, rtpTimeoutLabel, $("input[name='rtptimeout']")],
                notEqualTo: [rtpTimeoutLabel, $("input[name='rtptimeout']")]
            },
            "rtpkeepalive": {
                digits: true,
                range: [0, 3600]
            },
            "defaultexpiry": {
                digits: true
            },
            "maxexpiry": {
                digits: true,
                bigger: [maxExpiryLabel, defaultExpiryLabel, $("input[name='defaultexpiry']")]
            },
            "minexpiry": {
                digits: true,
                min: 90,
                smaller: [minExpiryLabel, defaultExpiryLabel, $("input[name='defaultexpiry']")]
            },
            "language": {
                alphanumeric: true
            }
        },
        newValidator: true,
        submitHandler: function() {
            fnSaveChanges();
        }
    });
}

function setDefaultValue() {
    var fields = UCMGUI.findInputFields(doc);

    for (var i = 0; i < fields.length; i++) {
        var val = $(fields[i]).attr("dfalt"),
            noSerialize = $(fields[i]).attr("noSerialize");

        if (!noSerialize && val.length != 0) {
            if ($(fields[i]).is(":hidden")) {
                continue;
            }

            if ($(fields[i]).is(":disabled")) {
                continue;
            }

            switch (fields[i].type) {
                case 'textarea':
                case 'text':
                    fields[i].value = '';
                    if (val) {
                        fields[i].value = val;
                    }
                    break;
                case 'checkbox':
                    fields[i].checked = false;
                    if (val = 'y') {
                        fields[i].checked = true;
                    }
                    break;
                default:
                    break;
            }
        }
    };
}
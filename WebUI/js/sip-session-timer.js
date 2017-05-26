/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG697"));

    initForm();
    getSIPSSTimerSettings();
    initValidator();

    top.Custom.init(doc);
});

function initForm() {
    $('#force_timer').change(function() {
        var timer = $("#timer")[0];
        if (this.checked) {
            if (timer.checked) {
                timer.checked = false;
            }
            timer.disabled = true;
        } else {
            timer.disabled = false;
        }

        top.Custom.init(doc, timer);
    });
}

function fnSaveChanges() {
    var action = {},
        forceTimerIsChecked = $("#force_timer").is(":checked"),
        timerIsChecked = $("#timer").is(":checked");

    action = UCMGUI.formSerializeVal(doc);

    if (forceTimerIsChecked) {
        action["session_timers"] = "always";
    } else if (timerIsChecked) {
        action["session_timers"] = "yes";
    } else {
        action["session_timers"] = "no";
    }
    action["action"] = "updateSIPSSTimerSettings";

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang('LANG826')
    });

    $.ajax({
        type: "post",
        url: '../cgi',
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
                var after = function() {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG4764")
                    });
                };

                setTimeout(function() {
                    after();
                }, 300);
            }
        }
    });
}

function getSIPSSTimerSettings() {
    var action = {};

    //action = UCMGUI.formSerialize(doc);
    action["action"] = "getSIPSSTimerSettings";

    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        async: true,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data),
                res = data.response,
                settings = res.sip_sessiontimer_settings,
                sessionTimers = settings.session_timers;

            if (bool && settings) {
                UCMGUI.domFunction.updateDocument(settings, doc);
                if (sessionTimers == "always") {
                    $("#force_timer")[0].checked = true;
                } else if (sessionTimers == "yes") {
                    $("#timer")[0].checked = true;
                }
                $('#force_timer').trigger("change");
                top.Custom.init(doc);
            }
        }
    });
}

function initValidator() {
    var expiresLabel = $P.lang("LANG1871"),
        minseLabel = $P.lang("LANG1873"),
        smallArr = [minseLabel, expiresLabel, $("#session_expires")];

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "session_expires": {
                required: true,
                digits: true,
                range: [90, 86400]
            },
            "session_minse": {
                required: true,
                digits: true,
                range: [90, 86400],
                smaller: smallArr
            }
        },
        newValidator: true,
        submitHandler: function() {
            fnSaveChanges();
        }
    });
}
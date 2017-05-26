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
    enableCheckBox = UCMGUI.domFunction.enableCheckBox,
    emailSettings = [],
    httpsEnable = false;

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG717"));

    getSettings();

    initValidator();
});

function clear_fate_password() {
    var $passwd = $('#smtp_password');

    if ($passwd.hasClass('fatePassword')) {
        $passwd.val('');
    }

    $passwd.removeClass('fatePassword');

    $(':input').unbind('focusin', clear_fate_password);
}

function getSettings() {
    // get settings
    $.ajax({
        url: "../cgi?action=getEmailSettings",
        type: 'GET',
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var emailSettings = data.response.email_settings;

                UCMGUI.domFunction.updateDocument(emailSettings, document);

                onTypeChange();

                // get display name and sender
                // if (emailSettings.smtp_type && emailSettings.smtp_type === 'client') {
                //     $("#smtp_password").addClass('fatePassword');

                //     // fate password just for display
                //     // all space can not pass the 'required' validate method, so we don't need to clear fate password before submit.

                //     $("#smtp_password").val('      ');
                //     $("#smtp_password").bind('focusin', clear_fate_password);
                // }

                top.Custom.init(document);

                $.ajax({
                    type: "POST",
                    url: "../cgi?",
                    data: "action=getHttpServer&web_https=",
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            var webHttps = data.response.httpserver.web_https;

                            if (webHttps && webHttps == 1) {
                                httpsEnable = true;
                            }
                        }
                    }
                });
            }
        }
    });
}

function onTypeChange() {
    if ($("[name=smtp_type]").val() === "client") {
        $(".smtp_mta").hide();
        $(".smtp_client").show();
    } else {
        $(".smtp_mta").show();
        $(".smtp_client").hide();
    }

    $("#options").show();
}

function check_displayName(val, ele) {
    if (val.match(/[;]/)) {
        return false;
    }
    return true;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "smtp_domain": {
                required: true,
                host: [$P.lang("LANG2050")]
            },
            "smtp_server": {
                required: true,
                host: [$P.lang("LANG2052")]
            },
            "smtp_username": {
                required: true
            },
            "smtp_password": {
                required: true
            },
            "serveremail": {
                required: true,
                email: true
            },
            "fromstring": {
                required: true,
                customCallback: [$P.lang("LANG4477"), check_displayName]
            }
        },
        newValidator: true,
        submitHandler: function() {
            saveChanges();
        }
    });
}

function smtp_save() {
    var action = {};
    action = UCMGUI.formSerializeVal(document);
    action["action"] = "updateEmailSettings";
    
    $.ajax({
        type: "POST",
        url: "../cgi?",
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
                    content: $P.lang("LANG844")
                });
            }
        }
    });
}

function saveChanges() {
    if (!httpsEnable && $('[name=smtp_type]').val() == 'client') {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG937"),
            buttons: {
                ok: function() {
                    smtp_save();
                }
            }
        });
    } else {
        smtp_save();
    }
}

function showTestForm() {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG2273"),
        displayPos: "smtp_test_div",
        frameSrc: "html/smtp_test.html"
    });
}
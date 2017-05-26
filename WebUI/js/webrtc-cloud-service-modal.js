/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = UCMGUI.config.paths.baseServerURl;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    initValidator();

    getEmail();

    top.Custom.init(doc);
});

function getEmail() {
    $.ajax({
        type: "GET",
        url: "../cgi",
        data: {
            "action": "getUser",
            "user_name": top.$.cookie("username")
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var res = data.response.user_name,
                    sMail = res.email;

                $('#cloud_email').val(sMail);
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "cloud_email": {
                required: true,
                email: true
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG4511")
            });

            var action = UCMGUI.formSerializeVal(doc);

            action['action'] = 'updateWebRTCCloudServiceSettings';

            save_changes(action);
        }
    });
}

function save_changes(action) {
    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                trial_cloud_service();
            }
        }
    });
}

function trial_cloud_service() {
    $.ajax({
        url: "../cgi?action=trialWebRTCCloudServiceSettings&retCode=result",
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
                if (data.response.retCode.length == 5) {
                    var errMessage = "";

                    switch (data.response.retCode) {
                        case "10001":
                            errMessage = $P.lang("LANG4514");
                            break;
                        case "10003":
                            errMessage = $P.lang("LANG4515");
                            break;
                        case "10004":
                            errMessage = $P.lang("LANG4516");
                            break;
                        case "10005":
                            errMessage = $P.lang("LANG4517");
                            break;
                        case "10007":
                            errMessage = $P.lang("LANG4523");
                            break;
                        case "10008":
                            errMessage = $P.lang("LANG4519");
                            break;
                        case "10009":
                            errMessage = $P.lang("LANG4527");
                            break;
                        case "20000":
                            errMessage = $P.lang("LANG4520");
                            break;
                        case "20001":
                            errMessage = $P.lang("LANG4521");
                            break;
                        case "20002":
                            errMessage = $P.lang("LANG4522");
                            break;
                    }

                    top.dialog.clearDialog();
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: errMessage
                    });
                } else {
                    mWindow.getWebRTCCloudServiceSettings();

                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG4532"),
                        buttons: {
                            ok: function() {
                                top.dialog.clearDialog();
                            },
                            cancel: function() {}
                        }
                    });
                }
            }
        }
    });
}
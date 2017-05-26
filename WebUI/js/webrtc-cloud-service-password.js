/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    oCloudAccounts = mWindow.oCloudAccounts,
    DOM_hidepass,
    DOM_oldpass,
    DOM_newpass;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    $('#cap_warning').css('display', 'none');

    DOM_hidepass = $('#hidepass');
    DOM_oldpass = $('#oldpass');
    DOM_newpass = $('#newpass')[0];

    if (oCloudAccounts.cloud_password) {
        $('#hidepass').val(oCloudAccounts.cloud_password);
    }

    if (oCloudAccounts.cloud_email) {
        $('#email').val(oCloudAccounts.cloud_email);
    }

    DOM_oldpass.focus();

    initValidator();

    top.Custom.init(doc);
});

// detect CR key and Caps Lock
document.onkeypress = function(e) {
    var e = e || window.event;

    if (e.keyCode == 13) {
        $('#save').trigger('click');

        return false;
    }

    var capsLock = false,
        charCode = (e.charCode ? e.charCode : e.keyCode);

    if (charCode >= 97 && charCode <= 122) {
        capsLock = e.shiftKey;
    } else if (charCode >= 65 && charCode <= 90 && !(e.shiftKey && /Mac/.test(navigator.platform))) {
        capsLock = !e.shiftKey;
    } else { // digits and special chars
        return true;
    }

    capsLock ? $('#cap_warning').css('display', 'block') : $('#cap_warning').css('display', 'none');
};

function checkOldPassword(val, ele) {
    if (!val) {
        return true;
    }

    var oldPassword = $('#hidepass').val(),
        response;

    if (val === oldPassword) {
        response = true;
    } else {
        response = false;
    }

    return response;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "oldpass": {
                required: true,
                minlength: 6,
                maxlength: 64,
                customCallback: [$P.lang("LANG933"), checkOldPassword]
            },
            "newpass": {
                required: true,
                minlength: 6,
                maxlength: 64,
                realAlphanumeric: true
            },
            "newpass_rep": {
                required: true,
                equalTo: DOM_newpass,
                minlength: 6,
                maxlength: 64,
                realAlphanumeric: true
            },
            "email": {
                required: true,
                email: true
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG826")
            });

            var action = {};

            action['action'] = 'updateWebRTCCloudServiceSettings';
            action['new_password'] = $('#newpass').val();
            action['cloud_email'] = $('#email').val();

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
                setTimeout(function() {
                    top.dialog.dialogMessage({
                        type: 'loading',
                        content: $P.lang("LANG4655")
                    });

                    upload_cloud_service();
                }, 200);
            }
        }
    });
}

function upload_cloud_service() {
    $.ajax({
        url: "../cgi?action=uploadWebRTCCloudServiceSettings&retCode=0",
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
                if (data.response.retCode === '0') {
                    mWindow.getWebRTCCloudServiceSettings();

                    top.dialog.clearDialog();
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang('LANG4781')
                    });
                } else {
                    top.dialog.clearDialog();
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang('LANG934')
                    });
                }
            }
        }
    });
}
/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    role = $P.cookie('role'),
    currentUserId = $P.cookie('user_id'),
    currentUserName = $P.cookie('username'),
    extensionPrefSettings = UCMGUI.isExist.getRange(), // [disable_extension_ranges, rand_password, weak_password]
    DOM_hidepass,
    DOM_oldpass,
    DOM_newpass,
    chl_val;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    top.document.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG55"));

    $('#cap_warning').css('display', 'none');

    DOM_hidepass = $('#hidepass');
    DOM_oldpass = $('#oldpass');
    DOM_newpass = $('#newpass')[0];

    DOM_oldpass.focus();

    getPassword();

    initValidator();

    enableStrongPw();

    if (role === 'privilege_0' || role === 'privilege_1') {
        $('.link').on('click', function() {
            var sUrl = "email_template.html";

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG843").format($P.lang('LANG4572')),
                buttons: {
                    ok: function() {
                        top.frames['frameContainer'].module.jumpMenu(sUrl);
                    },
                    cancel: function() {}
                }
            });
        });
    } else {
        $('.link').hide();
    }
});

/*function checkPassword(val, ele) {
    if (val == DOM_hidepass.val()) {
        return true;
    } else {
        return false;
    }
}*/

function getPassword() {
    var action = {
        "action": "getUser",
        "user_name": currentUserName,
        "user_password": '',
        'email': ''
    };

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
                if (data.response.user_name && data.response.user_name.hasOwnProperty('user_password')) {
                    var userInfo = data.response.user_name,
                        sEmail = userInfo.email;

                    // DOM_hidepass.val(userInfo.user_password);

                    if (sEmail) {
                        $('#email').val(sEmail);
                    }
                }
            }
        }
    });
}

function enableStrongPw() {
    var obj = {
        pwsId: "#newpass",
        doc: document
    };

    $P("#newpass", document).rules("add", {
        checkAlphanumericPw: [UCMGUI.enableWeakPw.showCheckPassword, obj]
    });
};

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "oldpass": {
                required: true,
                keyboradNoSpace: true,
                minlength: 4,
                // customCallback: [$P.lang("LANG933"), checkPassword]
                maxlength: 32
            },
            "newpass": {
                required: true,
                minlength: 8,
                maxlength: 32,
                // equalTo: '#newpass_rep',
                keyboradNoSpace: true
            },
            "newpass_rep": {
                required: true,
                equalTo: DOM_newpass,
                minlength: 8,
                maxlength: 32,
                keyboradNoSpace: true
            },
            "email": {
                required: true,
                email: true
            }
        },
        submitHandler: function() {
            setPassword();
        }
    });
};

function setPassword() {
    var action = {
        "action": "updateUser",
        "user_id": currentUserId,
        "user_password": DOM_newpass.value,
        'email': $('#email').val(),
        'old_password': DOM_oldpass.val()
    };

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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG932"),
                    callback: logout
                });
            }
        }
    });
}

function logout() {
    UCMGUI.logoutFunction.doLogout();
}

function UpdatePassword() {
    update_request(create_key());
};

function reload_page() {
    var f = UCMGUI.makeSyncRequest({
        action: 'logoff'
    });

    parent.window.location.reload();
}

function create_key() {
    /* jcli: modify for login with Digest-MD5 authentication */
    var r = UCMGUI.makeSyncRequest({
        action: 'challenge',
        AuthType: 'MD5'
    });

    r = r.toLowerCase();

    if (r.match("challenge:")) {
        chl_val = r.split(":")[2].trim();

        var MD5_key = MD5(chl_val + $('#oldpass')[0].value);

        return MD5_key;
    } else {
        console.log("MD5 challenge failed!");

        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG931")
        });

        return;
    }
}

/* Match to the webcgi UrlEscape function */
function UrlEscape(str) {
    var ret = "",
        strSpecial = ",/?:@&=+$#",
        strEscaped = "%2C%2F%3F%3A%40%26%3D%2B%24%23";

    for (var i = 0; i < str.length; i++) {
        var chr = str.charAt(i),
            c = chr.charCodeAt(0);

        if (strSpecial.indexOf(chr) != -1) {
            ret += "%" + c.toString(16);
        } else {
            ret += chr;
        }
    }

    return ret;
}

function JSON_encode(string) {
    return string.replace(/(\\|\"|\n|\r|\t|\\b|\f)/g, "\\$1");
}

function encryption(MD5_key) {
    var src = (UrlEscape("<}" + JSON_encode($('#oldpass')[0].value) + "{>:<}" + JSON_encode($('#newpass')[0].value) + "{>")),
        ENC = src;

    return ENC;
}

function update_request(MD5_key) {
    var enc = encryption(MD5_key),
        buf = "action=updatePassword&password=" + "{ \"challenge\": \"" + chl_val + "\", \"encryption\": \"" + enc + "\" }";

    $.ajax({
        type: "Post",
        url: "/webcgi?",
        data: buf,
        success: process_responce
    });
}

function process_responce(data) {
    if (data.response == "success") {
        top.dialog.dialogMessage({
            type: 'success',
            content: $P.lang("LANG932"),
            callback: reload_page
        });
    } else {
        if (data.detail == "The old password is incorrect !") {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG933")
            });
        } else {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG934")
            });
        }
    }
}

// detect CR key and Caps Lock
document.onkeypress = function(e) {
    var e = e || window.event;

    if (e.keyCode == 13) {
        $('#btn_update').trigger('click');
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
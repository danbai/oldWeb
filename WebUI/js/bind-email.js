/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
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

    top.document.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4203"));

    DOM_hidepass = $('#hidepass');
    DOM_oldpass = $('#oldpass');


    DOM_oldpass.focus();

    getPassword();

    initValidator();
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

                    //DOM_hidepass.val(userInfo.user_password);

                    if (sEmail) {
                        $('#email').val(sEmail);
                    }
                }
            }
        }
    });
}

function bindEmail() {
    var action = {
        "action": "updateUser",
        "user_id": currentUserId,
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
                    content: $P.lang("LANG945"),
                    callback: function() {
                        var containerScreen = top.frames['frameContainer'],
                            oCheckMsg = containerScreen.$('#check_msg', containerScreen.document),
                            oEmailprompt = containerScreen.$('#email_prompt', containerScreen.document);

                        DOM_oldpass.val('');

                        if (oEmailprompt.is(':visible')) {
                            oCheckMsg.hide();
                            oEmailprompt.hide();
                        }  
                    }
                });
            }
        }
    });
}

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
                maxlength: 32
                //customCallback: [$P.lang("LANG933"), checkPassword]
            },
            "email": {
                required: true,
                email: true
            }
        },
        submitHandler: function() {
            bindEmail();
        }
    });
};
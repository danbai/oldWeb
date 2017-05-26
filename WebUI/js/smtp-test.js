/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG717"));

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "recipients": {
                required: true,
                email: true
            }
        },
        submitHandler: function() {
            submitHandler();
        }
    });
});

var submitHandler = function() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG905")
    });

    var action = {
            'action': "sendTestMail",
            'email_addr': $('#recipients').val()
        };

    $.ajax({
        type: "post",
        url: "../cgi",
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
                top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG873"),
                    callback: function() {
                        top.dialog.clearDialog();
                    }
                });
            }
        }
    });
};
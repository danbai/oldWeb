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

    //topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4190"));

    initValidator();
});

function fnSaveChanges() {
    $.ajax({
        url: "../cgi?",
        type: "POST",
        data: {
            action: "sendPasswordEmail",
            user_name: $('#user_name').val()
        },
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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG4195")
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
            "user_name": {
                required: true
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });

            fnSaveChanges();
        }
    });
}

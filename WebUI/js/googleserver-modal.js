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

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3513"));

    getUrl();

    initValidator();
});

function getUrl() {
    $.ajax({
        url: "../cgi?action=updateOauthJsonFile&client_name=calendar",
        type: "GET",
        dataType: "json",
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var res = data.response.result;
                $('#google_url').val(res);
            }
        }
    });
}

function fnSaveChanges() {
    $.ajax({
        url: "../cgi?",
        type: "POST",
        data: {
            action: "updateCertificate",
            client_name: "calendar",
            request_code: $("#google_code").val()
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
                    content: $P.lang("LANG873")
                });

                var mainScreen = top.frames['frameContainer'].frames['mainScreen'];
                mainScreen.getCalenderSettings(false);
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
            "google_code": {
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

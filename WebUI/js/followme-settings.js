/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI;

$(function() {
    $P.lang(doc, true);

    getFollowmeSettings();

    initValidator();
});

function getFollowmeSettings() {
    var action = {
        "action": "getFollowmeSettings",
        "incoming_status": '',
        "record_name": '',
        "unreachable_status": ''
    };

    $.ajax({
        type: "post",
        url: "../cgi",
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
                var settings = data.response.followme_settings;

                UCMGUI.domFunction.updateDocument(settings, doc);

                // reset innerhtml height
                if (window.frameElement) {
                    $(window.frameElement).css("height", "0px");
                }

                top.dialog.currentDialogType = "iframe";

                top.dialog.repositionDialog();

                top.Custom.init(doc);
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {},
        submitHandler: function() {
            var action = {};

            action = UCMGUI.formSerializeVal(doc);

            action["action"] = "updateFollowmeSettings";

            $.ajax({
                type: "post",
                url: "../cgi",
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
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG815")
                        });
                    }
                }
            });
        }
    });
}
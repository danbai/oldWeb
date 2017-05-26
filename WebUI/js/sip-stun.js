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
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG663"));
    getSTUNSettings();
    initValidator();
});

function getSTUNSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getSTUNSettings"
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);
            if (bool) {
                var stSettings = data.response.stunmonitor_settings;
                UCMGUI.domFunction.updateDocument(stSettings, document);
            }
            top.Custom.init(doc);
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }
    $P("#form", document).validate({
        rules: {
            stunaddr: {
                host: ['domain']
            },
            stunrefresh: {
                digits: true,
                range: [1, 43200]
            }
        },
        submitHandler: function() {
            updateSTUNSettings();

        }
    });
}

function updateSTUNSettings() {
    var action = {};
    action = UCMGUI.formSerializeVal(doc);
    action["action"] = "updateSTUNSettings";

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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG4764")
                });
            }
        }
    });
}
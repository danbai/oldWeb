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
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG40"));
    
    getJBSettings();
    initValidator();
});

function getJBSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getJBSettings"
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
                var jbSettings = data.response.jitterbuffer_settings;
                UCMGUI.domFunction.updateDocument(jbSettings, document);
            }
            top.Custom.init(doc);
        }
    });
}

function updateJBSettings() {
    var action = {};
    action = UCMGUI.formSerializeVal(doc);
    action["action"] = "updateJBSettings";

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
                    content: $P.lang("LANG815")
                });
            }
        }
    });
}
function initValidator() {
    var label_gs_jbmax = $P.lang('LANG1655');
    var label_gs_jblen = $P.lang('LANG2460');
    var bigArr = [label_gs_jbmax, label_gs_jblen, $('#gs_jblen')];

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }
    $P("#form", document).validate({
        rules: {
            "gs_jbmax": {
                required: true,
                digits: true,
                range: [100, 1000],
                bigger: bigArr
            },
            "gs_jblen": {
                required: true,
                digits: true,
                range: [100, 1000]
            }
        },
        submitHandler: function() {
            updateJBSettings();
        },
        newValidator: true
    });
}

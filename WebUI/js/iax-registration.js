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
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG680"));

    getIAXRegSettings();
    initValidator();
});

function getIAXRegSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getIAXRegSettings"
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
                var iaxRegSettings = data.response.iax_reg_settings;
                UCMGUI.domFunction.updateDocument(iaxRegSettings, document);
            }
            top.Custom.init(doc);
        }
    });
}

function updateIAXRegSettings() {
    var action = {};
    action = UCMGUI.formSerializeVal(doc);
    action["action"] = "updateIAXRegSettings";

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

function check_autokill() {
    var key = $("#autokill").val() ? $("#autokill").val().toLowerCase() : "";

    if (!key || key == "yes" || key == "no" || /^([1-9]|([1-9]\d+))$/.test(key)) {
        return true;
    }

    return false;
};

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }
    $P("#form", document).validate({
        rules: {
            "minregexpire": {
                digits: true,
                range: [0, 65535]
            },
            "maxregexpire": {
                digits: true,
                range: [0, 65535],
                bigger: [$P.lang("LANG1663"), $P.lang("LANG1661"), $("#minregexpire")]
            },
            "iaxthreadcount": {
                digits: true,
                range: [0, 65535]
            },
            "iaxmaxthreadcount": {
                digits: true,
                range: [0, 65535],
                bigger: [$P.lang("LANG1667"), $P.lang("LANG1665"), $("#iaxthreadcount")]
            },
            "trunkfreq": {
                digits: true,
                range: [0, 65535]
            },
            "autokill": {
                customCallback: [$P.lang("LANG2212"), check_autokill]
            }
        },
        submitHandler: function() {
            updateIAXRegSettings();
        },
        newValidator: true
    });
}

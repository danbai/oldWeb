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

function fnSaveChanges() {
    var action = {};

    action = UCMGUI.formSerializeVal(doc);
    action["action"] = "updateSIPMiscSettings";

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang('LANG826')
    });

    $.ajax({
        type: "post",
        url: '../cgi',
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var after = function() {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG4764")
                    });
                };

                setTimeout(function() {
                    after();
                }, 300);
            }
        }
    });
}

function getSIPMiscSettings() {
    var action = {};

    action = UCMGUI.formSerialize(doc);
    action["action"] = "getSIPMiscSettings";

    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        async: true,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                UCMGUI.domFunction.updateDocument(data.response.sip_misc_settings, doc);

                top.Custom.init(doc);
            } else {
                setDefaultValue();
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            // "register": { }, // TODO how to validate?
            "registertimeout": {
                required: true,
                digits: true,
                range: [10, 100]
            },
            "registerattempts": {
                required: true,
                digits: true,
                range: [0, 10]
            },
            "maxcallbitrate": {
                digits: true,
                max: 65535
            }
        },
        submitHandler: function() {
            fnSaveChanges();
        }
    });
}

function setDefaultValue() {
    var fields = UCMGUI.findInputFields(doc);

    for (var i = 0; i < fields.length; i++) {
        var val = $(fields[i]).attr("dfalt"),
            noSerialize = $(fields[i]).attr("noSerialize");

        if (!noSerialize && val.length != 0) {
            if ($(fields[i]).is(":hidden")) {
                continue;
            }

            if ($(fields[i]).is(":disabled")) {
                continue;
            }

            switch (fields[i].type) {
                case 'textarea':
                case 'text':
                    fields[i].value = '';

                    if (val) {
                        fields[i].value = val;
                    }

                    break;
                case 'checkbox':
                    fields[i].checked = false;

                    if (val = 'y') {
                        fields[i].checked = true;
                    }

                    break;
                default:
                    break;
            }
        }
    };
}

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG704"));

    getSIPMiscSettings();

    initValidator();

    top.Custom.init(doc);
});
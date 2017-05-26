/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    enableCheckBox = UCMGUI.domFunction.enableCheckBox;

Array.prototype.each = top.Array.prototype.each;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3437"));

    getServiceCheck();

    initValidator();

    enableCheckBox({
        enableCheckBox: 'service_check_enable',
        enableList: ['service_check_timeout', 'service_check_count']
    }, doc);

    top.Custom.init(doc);
});

function fnSaveChanges() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang('LANG826')
    });

    var action = {};

    action = UCMGUI.formSerializeVal(doc);

    action["action"] = "updateServiceCheck";

    action["service_check_enable"] = ($("#service_check_enable")[0].checked ? '1' : '0');

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
                            content: $P.lang("LANG844")
                        });
                    };

                setTimeout(function() {
                    after();
                }, 300);
            }  
        }
    });
}

function getServiceCheck() {
    var action = {};

    action = UCMGUI.formSerialize(doc);

    action["action"] = "getServiceCheck";

    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        async: true,
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
                data.response['service_check_enable'] = (data.response['service_check_enable'] == '1') ? 'yes' : 'no';

                UCMGUI.domFunction.updateDocument(data.response, doc);

                $('#service_check_timeout')[0].disabled = !$('#service_check_enable')[0].checked;

                $('#service_check_count')[0].disabled = !$('#service_check_enable')[0].checked;

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
        rules: {
            "service_check_timeout": {
                required: true,
                digits: true,
                range: [30, 86400]
            },
            "service_check_count": {
                required: true,
                digits: true,
                range: [1, 99]
            }
        },
        newValidator: true,
        submitHandler: function() {
            fnSaveChanges();
        }
    });
}
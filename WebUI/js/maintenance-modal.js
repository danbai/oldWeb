/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    mWindow = top.frames["frameContainer"].frames["mainScreen"];

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;
String.prototype.addZero = top.String.prototype.addZero;
Number.prototype.addZero = top.Number.prototype.addZero;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    $P.lang(doc, true);

    bingEvents();

    getModuleData()

    initValidator();

    top.Custom.init(doc);
});

function bingEvents() {
    var moduleFields = ['record', 'vfax', 'voicemail_file', 'hom_file', 'prompt_tone', 'cdr_log',
            'zeroconfig', "operation_log", 'backup_file', 'corefile', 'troubleshooting', 'qmail', 'select_all'
        ];

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "mod_reset_enable",
        enableList: moduleFields
    }, doc);

    $("#ModulesBody")
        .delegate(".module-type", "click", function() {
            var checkboxes = $('.module-type'),
                select_all = $('#select_all'),
                me = this;

            if (checkboxes.filter(":checked").length != checkboxes.length) {
                select_all[0].checked = false;
                select_all.prev().css("backgroundPosition", "0px 0px");
            } else {
                select_all[0].checked = true;
                select_all.prev().css("backgroundPosition", "0px -50px");
            }
        })
        .delegate("#select_all", "click", function() {
            var select_all = function(value) {
                var children = $("#ModulesBody").children().find("input");

                for (var i = 0; i < children.length; i++) {
                    if (children[i].type == 'checkbox') {
                        children[i].checked = value;
                    }

                    if (value) {
                        $(children[i]).prev().css("backgroundPosition", "0px -50px");
                    } else {
                        $(children[i]).prev().css("backgroundPosition", "0px 0px");
                    }
                }
            };

            var all = this;

            if (all.checked) {
                select_all(true);
            } else {
                select_all(false);
            }
        });
}

function checkFileLength() {
    var eles = $("#ModulesBody input:checked");

    if (eles.length === 0) {
        return false;
    }

    return true;
}

function getModuleData() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            "action": "getModuleResetData"
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var moduleType = ['record', 'vfax', 'voicemail_file', 'hom_file', 'prompt_tone', 'cdr_log',
                        'zeroconfig', "operation_log", 'backup_file', 'corefile', 'troubleshooting', 'qmail'
                    ],
                    length = moduleType.length,
                    settings = data.response.module_reset_settings,
                    allChecked = true,
                    i = 0;

                UCMGUI.domFunction.updateDocument(settings, document);

                $("#mod_reset_enable")[0].checked = (settings.mod_reset_enable == 1 ? true : false);

                for (i; i < length; i++) {
                    if (settings[moduleType[i]] === 'no') {
                        allChecked = false;

                        break;
                    }
                }

                if (allChecked) {
                    $("#select_all")[0].checked = true;
                }

                $("input").not("#mod_reset_enable").each(function() {
                    this.disabled = !$("#mod_reset_enable")[0].checked;
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
            "record": {
                customCallback: [$P.lang("LANG3456"), checkFileLength]
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG826")
            });

            save();
        }
    });
}

function save() {
    var eles = $("#ModulesBody .module-type"),
        data = {
            action: "updateModuleResetData"
        };

    eles.each(function() {
        data[this.id] = this.checked ? "yes" : "no";
    });

    data["mod_reset_enable"] = $("#mod_reset_enable")[0].checked ? 1 : 0;

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: data,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown,
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                });

            if (bool) {
                
                $.ajax({
                    type: 'GET',
                    url: '../cgi?action=ResetModuleData&module-reset=',
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        });

                        if (bool) {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG844")
                            });
                        }
                    }
                });
            }
        }
    });
}
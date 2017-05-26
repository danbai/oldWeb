/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    enableCheckBox = UCMGUI.domFunction.enableCheckBox;

Array.prototype.each = top.Array.prototype.each;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    generateMonthHour();

    $('#editForm')
        .delegate('.lite_desc b', 'click', function(ev) {

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG843").format($P.lang("LANG64")),
                buttons: {
                    ok: function() {
                        top.frames["frameContainer"].module.jumpMenu('backup_network.html');
                    },
                    cancel: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $('#time').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value === 'month') {
            $('.month').css({'display': 'inline-block'});
            $('.week').hide();
        } else if (value === 'week') {
            $('.week').css({'display': 'inline-block'});
            $('.month').hide();
        } else {
            $('.month, .week').hide();
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('.link').on('click', function() {
        var sUrl = "email_template.html";

        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG843").format($P.lang('LANG4572')),
            buttons: {
                ok: function() {
                    top.frames['frameContainer'].module.jumpMenu(sUrl);
                },
                cancel: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            }
        });
    });

    enableCheckBox({
        enableCheckBox: 'enable',
        enableList: ['time', 'email', 'day_of_week', 'day_of_month', 'hour']
    }, doc);

    getCDR2Email();

    initValidator();
});

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "email": {
                required: true,
                multiEmail: true
            }
        },
        submitHandler: function() {
            var action = {};

            action['enable'] = $("#enable").is(":checked") ? "yes" : "no";
            action['time'] = $("#time").val();
            action['email'] = $("#email").val();
            action['day_of_week'] = $("#day_of_week").val();
            action['day_of_month'] = $("#day_of_month").val();
            action['hour'] = $("#hour").val();

            action["action"] = "updateCDR2EmailSettings";

            updateCDR2Email(action);
        }
    });
}

function updateCDR2Email(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                $.ajax({
                    type: 'GET',
                    url: '../cgi?action=reloadCrontabs&crontabjobs=',
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            // top.dialog.clearDialog();
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

function getCDR2Email() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getCDR2EmailSettings"
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                var settings = data.response.cdr2email_settings;

                UCMGUI.domFunction.updateDocument(settings, doc);

                if (!$('#enable')[0].checked) {
                    $('#time, #email, #day_of_week, #day_of_month, #hour').attr({'disabled': 'disabled'});
                }

                if (settings.time === 'month') {
                    $('.month').css({'display': 'inline-block'});
                } else if (settings.time === 'week') {
                    $('.week').css({'display': 'inline-block'});
                }
            }

            top.Custom.init(doc);

            top.dialog.repositionDialog();
        }
    });
}

function generateMonthHour() {
    for (var i = 1, options = ''; i <= 28; i++ ) {
        options += '<option value="' + i + '">' + i + '</option>';
    }

    $('#day_of_month').append(options);

    for (i = 0, options = ''; i <= 23; i++ ) {
        options += '<option value="' + i + '">' + i + '</option>';
    }

    $('#hour').append(options);
}

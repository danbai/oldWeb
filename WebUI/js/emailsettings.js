/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    baseServerURl = UCMGUI.config.paths.baseServerURl;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    getEmailSettings();

    bindEvents();

    initValidator();

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
});

function bindEvents() {
    $('#attach').click(function(ev) {
        if (this.checked) {
            $('.keep-recordings').show();
        } else {
            $('.keep-recordings').hide();
        }

        ev.stopPropagation();
    });

    $('#reserve').click(function(ev) {
        var me = this;

        if (!me.checked) {
            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG4286"),
                buttons: {
                    ok: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    },
                    cancel: function() {
                        me.checked = true;

                        top.Custom.init(doc, me);

                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                }
            });
        }

        ev.stopPropagation();
    });
}

function getEmailSettings() {
    var action = {};

    action = UCMGUI.formSerialize(doc);

    action["action"] = "getVMSettings";

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
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
                data = eval(data);

                if (data.response.voicemail_settings.attach === 'no') {
                    $('.keep-recordings').hide();
                }

                UCMGUI.domFunction.updateDocument(data.response.voicemail_settings, document);

                top.Custom.init(doc);
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
            "emailsubject": {
                required: true
            },
            "emailbody": {
                required: true
            }
        },
        submitHandler: function() {
            saveChanges();
        }
    });
}

var loadDefaults = function() {
    type = "default";

    UCMGUI.domFunction.updateElementValue({
        el: "emailbody",
        val: "Hello ${VM_NAME}, you received a message lasting ${VM_DUR} at ${VM_DATE} from, (${VM_CALLERID}). This is message ${VM_MSGNUM} in your voicemail Inbox."
    }, doc);

    UCMGUI.domFunction.updateElementValue({
        el: "emailsubject",
        val: "New voicemail from ${VM_CALLERID} for ${VM_MAILBOX}"
    }, doc);
}

var saveChanges = function() {
    var action = {};

    action = UCMGUI.formSerializeVal(document);

    action["action"] = "updateVMSettings";
    $.ajax({
        type: "post",
        url: baseServerURl,
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

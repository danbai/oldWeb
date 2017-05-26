/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG649"));

    bingEvents();

    initValidator();

    top.Custom.init(document);
});

function bingEvents() {
    // $("#reset").click(function() {
    //     top.dialog.dialogConfirm({
    //         confirmStr: $P.lang("LANG837").format($("#mtype option:selected").html()),
    //         buttons: {
    //             ok: function() {
    //                 UCMGUI.loginFunction.confirmReset($("#mtype").val());
    //             }
    //         }
    //     });
    // });

    $("#reboot").click(function() {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG835"),
            buttons: {
                ok: UCMGUI.loginFunction.confirmReboot
            }
        });
    });

    $("#mtype").change(function(event) {
        var value = this.value;

        if (value === 'data') {
            $('.user-data-modules').show();
        } else if (value === 'all') {
            $('.user-data-modules').hide();
        }
    });

    // $("#resetUserData").click(function() {
    //     top.dialog.dialogInnerhtml({
    //         dialogTitle: $P.lang("LANG4803"),
    //         displayPos: "editForm",
    //         frameSrc: "html/maintenance_modal.html"
    //     });
    // });

    $("#verify").click(function() {
        $.ajax({
            type: "GET",
            url: "../cgi?action=cerifyCertificateFile",
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown
                });
            },
            success: function(data) {
                var bool = data.status;

                if (bool === 0) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG4201").format($P.lang("LANG4200"))
                    });
                } else {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG4202").format($P.lang("LANG4200"))
                    });
                }
            }
        });
    });

    $("#modules")
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
                var children = $("#modules").children().find("input");

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
    var eles = $("#modules input:checked");

    if (eles.length === 0) {
        return false;
    }

    return true;
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
            var mtype = $("#mtype option:selected"),
                mtypeValue = mtype.val();

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG837").format(mtype.html()),
                buttons: {
                    ok: function() {
                        if (mtypeValue === 'all') {
                            UCMGUI.loginFunction.confirmReset('../cgi?action=factoryReset&type=' + mtypeValue);
                        } else {
                            top.dialog.dialogMessage({
                                type: 'loading',
                                content: $P.lang("LANG4830")
                            });

                            var eles = $("#modules .module-type"),
                                data = {
                                    action: "updateModuleResetData"
                                };

                            eles.each(function() {
                                data[this.id] = this.checked ? "yes" : "no";
                            });

                            // data["mod_reset_enable"] = $("#mod_reset_enable")[0].checked ? 1 : 0;
                            data["mod_reset_enable"] = 1;

                            $.ajax({
                                url: baseServerURl,
                                type: "POST",
                                dataType: "json",
                                async: false,
                                data: data,
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.dialogMessage({
                                        type: 'error',
                                        content: errorThrown
                                    });
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data);

                                    if (bool) {
                                        $.ajax({
                                            type: 'GET',
                                            url: '../cgi?action=ResetModuleData&module-reset=',
                                            success: function(data) {
                                                var bool = UCMGUI.errorHandler(data);

                                                if (bool) {
                                                    top.dialog.dialogMessage({
                                                        type: 'success',
                                                        content: $P.lang("LANG4831")
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
    });
}
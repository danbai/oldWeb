/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG643"));

    $("#toTop").scrollToTop(1000);

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "Phour_clean_cdr": {
                required: true,
                digits: true,
                range: [0, 23]
            },
            "Pclean_cdr_interval": {
                required: true,
                digits: true,
                range: [1, 30]
            },
            "Phour_clean_vr": {
                required: true,
                digits: true,
                range: [0, 23]
            },
            "Pclean_record_interval": {
                required: true,
                digits: true,
                range: [1, 30]
            },
            "Pclean_record_threshold": {
                required: true,
                digits: true,
                range: [1, 99]
            }
        }
    });

    CDR_FIELDS = ['Phour_clean_cdr', 'Pclean_cdr_interval'];

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "Pen_auto_clean_cdr",
        enableList: CDR_FIELDS
    }, doc);

    VR_FIELDS = ['Phour_clean_vr', 'Pclean_record_interval', 'Pclean_record_threshold',
        'Pen_auto_clean_monitor', 'Pen_auto_clean_meetme', 'Pen_auto_clean_queue', 'Pen_auto_clean_vm', 'Pen_auto_clean_fax', 'Pen_auto_clean_backup'];

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "Pen_auto_clean_vr",
        enableList: VR_FIELDS
    }, doc);

    $.ajax({
        type: "GET",
        url: "/cgi?action=getCleanerValue",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: load_default
    });

    ReadLog();
});

function load_default(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        $("#Phour_clean_cdr").val(data.response.Phour_clean_cdr);
        $("#Pclean_cdr_interval").val(data.response.Pclean_cdr_interval);
        $("#Pen_auto_clean_cdr")[0].checked = (data.response.Pen_auto_clean_cdr == 1 ? true : false);

        $("#Phour_clean_cdr, #Pclean_cdr_interval").attr("disabled", !$("#Pen_auto_clean_cdr").is(":checked"));

        $("#Phour_clean_vr").val(data.response.Phour_clean_vr);
        $("#Pclean_record_interval").val(data.response.Pclean_record_interval);
        $("#Pclean_record_threshold").val(data.response.Pclean_record_threshold);
        $("#Pen_auto_clean_vr")[0].checked = (data.response.Pen_auto_clean_vr == 1 ? true : false);

        $("#Phour_clean_vr, #Pclean_record_interval, #Pclean_record_threshold").attr("disabled", !$("#Pen_auto_clean_vr").is(":checked"));
        $("#Pen_auto_clean_monitor, #Pen_auto_clean_meetme, #Pen_auto_clean_queue, #Pen_auto_clean_vm, #Pen_auto_clean_fax, #Pen_auto_clean_backup").attr("disabled", !$("#Pen_auto_clean_vr").is(":checked"));
        $("#Pen_auto_clean_monitor")[0].checked = (data.response.Pen_auto_clean_monitor == 1 ? true : false);
        $("#Pen_auto_clean_meetme")[0].checked = (data.response.Pen_auto_clean_meetme == 1 ? true : false);
        $("#Pen_auto_clean_queue")[0].checked = (data.response.Pen_auto_clean_queue == 1 ? true : false);
        $("#Pen_auto_clean_vm")[0].checked = (data.response.Pen_auto_clean_vm == 1 ? true : false);
        $("#Pen_auto_clean_fax")[0].checked = (data.response.Pen_auto_clean_fax == 1 ? true : false);
        $("#Pen_auto_clean_backup")[0].checked = (data.response.Pen_auto_clean_backup == 1 ? true : false);

        top.Custom.init(document);
    }
}

function save_changes() {
    var cdr = $("#Pen_auto_clean_cdr").is(":checked") ? 1 : 0,
        vr = $("#Pen_auto_clean_vr").is(":checked") ? 1 : 0,
        monitor = $("#Pen_auto_clean_monitor").is(":checked") ? 1 : 0,
        meetme = $("#Pen_auto_clean_meetme").is(":checked") ? 1 : 0,
        queue = $("#Pen_auto_clean_queue").is(":checked") ? 1 : 0,
        vm = $("#Pen_auto_clean_vm").is(":checked") ? 1 : 0,
        fax = $("#Pen_auto_clean_fax").is(":checked") ? 1 : 0,
        backup = $("#Pen_auto_clean_backup").is(":checked") ? 1 : 0;

    if ($P("#form", document).valid()) {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG904")
        });

        var action = {
            "action": "setCleanerValue",
            "Pen_auto_clean_cdr": cdr,
            "Phour_clean_cdr": $("#Phour_clean_cdr").val(),
            "Pclean_cdr_interval": $("#Pclean_cdr_interval").val(),
            "Pen_auto_clean_vr": vr,
            "Phour_clean_vr": $("#Phour_clean_vr").val(),
            "Pclean_record_interval": $("#Pclean_record_interval").val(),
            "Pclean_record_threshold": $("#Pclean_record_threshold").val(),
            "Pen_auto_clean_monitor": monitor,
            "Pen_auto_clean_meetme": meetme,
            "Pen_auto_clean_queue": queue,
            "Pen_auto_clean_vm": vm,
            "Pen_auto_clean_fax": fax,
            "Pen_auto_clean_backup": backup
        }

        $.ajax({
            type: "POST",
            url: "/cgi?",
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: apply_changes
        });
    } else {
        return false;
    }

}

function apply_changes(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        $.ajax({
            type: 'GET',
            url: '../cgi?action=reloadCrontabs&crontabjobs=',
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

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

function ReadLog() {
    $.ajax({
        type: "GET",
        url: "./userdefined/cleaner_results",
        dataType: "text",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status != 404) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909")
                });
            }
        },
        success: function(data) {
            $("#cleaner_log")[0].innerHTML = '';

            var arr = data.split("\n").reverse();

            for (var i = 0; i < arr.length; i++) {
                if (arr[i] != "") {
                    if (arr[i].contains("done")) {
                        $("div#cleaner_log").append($("<div />").html(arr[i]).css({
                            color: "green"
                        }));
                    } else {
                        $("div#cleaner_log").append($("<div />").html(arr[i]).css({
                            color: "red"
                        }));
                    }
                }
            }
        }
    });
}

function clean_log() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG3902"),
        buttons: {
            ok: function() {
                $.ajax({
                    type: "GET",
                    url: "../cgi?action=reloadCleanerLog&cleanerlog=",
                    dataType: "json",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG3903"),
                                callback: function() {
                                    ReadLog();
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}
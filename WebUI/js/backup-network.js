/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    UrlDecode = UCMGUI.urlFunction.decode,
    settings = {},
    timeoutID = 0;

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG637"));

    $("#toTop").scrollToTop(1000);

    var OPTION_FIELDS = ['Psftp_account', 'Psftp_pass', 'Psftp_address',
            'Phour_backup', "Psync_cdr", "Psync_record",
            "Psync_voicemail", "Psync_vfax", "select_all", "Psftp_directory"];

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "Pen_auto_backup",
        enableList: OPTION_FIELDS
    }, doc);

    $.ajax({
        type: "GET",
        url: "/cgi?action=getDataSyncValue",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: load_default
    });

    var selectAll = $('#select_all'),
        fileType = $(".file-type");

    selectAll.bind("click", function(ev) {
        var select_all = function(value) {
            var children = $('#auto_backup_module').children().find("input");

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

    fileType.bind("click", function(ev) {
        if (fileType.filter(":checked").length != fileType.length) {
            selectAll[0].checked = false;
            selectAll.prev().css("backgroundPosition", "0px 0px");
        } else {
            selectAll[0].checked = true;
            selectAll.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });

    initValidator();
});

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "Psftp_account": {
                required: true,
                alphanumericUndDotAt: true
            },
            "Psftp_pass": {
                alphanumericUnd: true
            },
            "Psftp_address": {
                required: true,
                host: ['IP or URL']
            },
            "Phour_backup": {
                required: true,
                digits: true,
                range: [0, 23]
            },
            "Psync_cdr": {
                customCallback: [$P.lang("LANG852"), checkFileLength]
            },
            "Psftp_directory": {
                customCallback: [$P.lang("LANG2767"), checkDirectory]
            }
        },
        newValidator: true,
        submitHandler: function() {
            //save_changes();
        }
    });
}

function checkFileLength() {
    if ($("#auto_backup_module").find("input:checked").length == 0) {
        return false;
    }

    return true;
}

function checkDirectory(value, element) {
    if (!value) {
        return true;
    }

    var reg = /^([\w-.]+)(\/[\w-.]+)*$/i;

    return reg.test(value);
}

function load_default(data) {
    var fileType = ["Psync_cdr", "Psync_record", "Psync_voicemail", "Psync_vfax"],
        bool = UCMGUI.errorHandler(data),
        length = fileType.length,
        allChecked = true,
        i = 0;

    if (bool) {
        settings = data.response;

        if (data.response.Pen_auto_backup == 1) {
            data.response.Pen_auto_backup = 'yes';
        }

        UCMGUI.domFunction.updateDocument(data.response, document);

        for (i; i < length; i++) {
            if (data.response[fileType[i]] === 'no') {
                allChecked = false;

                break;
            }
        }

        if (allChecked) {
            $("#select_all")[0].checked = true;
        }

        $('#Psftp_account, #Psftp_pass, #Psftp_address, ' +
            '#Phour_backup, #Psync_cdr, #Psync_record, ' +
            '#Psync_voicemail, #Psync_vfax, #select_all, #Psftp_directory').attr('disabled', !$('#Pen_auto_backup')[0].checked);    

        ReadLog();

        top.Custom.init(document);
    }
}

function test_server() {
    var a = $('#Pen_auto_backup')[0].checked ? 1 : 0;

    if (a != 1) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG858")
        });

        return false;
    }

    if ($P("#form", document).valid()) {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG859")
        });

        $.ajax({
            type: "GET",
            url: "/cgi?" + "action=reloadTestSftp&test_server=" + $('#Psftp_account')[0].value + "," +
                $('#Psftp_pass')[0].value + "," + $('#Psftp_address')[0].value,
            dataType: "json",
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909")
                });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG3213")
                    });
                }
            }
        });
    } else {
        $("input[titles]").focus();
    }
}

function sync_all() {
    var a = $('#Pen_auto_backup')[0].checked ? 1 : 0;

    if (!settings.Pen_auto_backup || (settings.Pen_auto_backup === "0") || !settings.Psftp_address ||
        !settings.Psftp_account || (!settings.Phour_backup && settings.Phour_backup !== "0")) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG3960")
        });

        return false;
    } else {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG3961"),
            buttons: {
                ok: function() {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        dataType: "json",
                        data: {
                            "action": "doDataSyncAll",
                            "sync_all": "all"
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG909")
                            });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG3963")
                                });
                            }

                        }
                    });
                },
                cancel: function() {}
            }
        });
    }
}

function save_changes() {
    if ($P("#form", doc).valid()) {
        var a = $('#Pen_auto_backup')[0].checked ? 1 : 0;

        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG904")
        });

        var Psftp_account = $('#Psftp_account')[0].value,
            Psftp_pass = $('#Psftp_pass')[0].value,
            Psftp_address = $('#Psftp_address')[0].value,
            Phour_backup = $('#Phour_backup')[0].value,
            Psync_cdr = ($('#Psync_cdr')[0].checked ? "yes" : "no"),
            Psync_record = ($('#Psync_record')[0].checked ? "yes" : "no"),
            Psync_voicemail = ($('#Psync_voicemail')[0].checked ? "yes" : "no"),
            Psync_vfax = ($('#Psync_vfax')[0].checked ? "yes" : "no"),
            Psftp_directory = $('#Psftp_directory')[0].value;

        var buf_web = "action=setDataSyncValue" + 
            "&Pen_auto_backup=" + a + "&Psftp_account=" + Psftp_account +
            "&Psftp_pass=" + Psftp_pass + "&Psftp_address=" + Psftp_address +
            "&Phour_backup=" + Phour_backup + "&Psync_cdr=" + Psync_cdr +
            "&Psync_record=" + Psync_record + "&Psync_voicemail=" + Psync_voicemail +
            "&Psync_vfax=" + Psync_vfax + "&Psftp_directory=" + Psftp_directory;

        $.ajax({
            type: "Post",
            url: "/cgi?",
            data: buf_web,
            error: function(jqXHR, textStatus, errorThrown) {
                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: apply_changes
        });
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
                    settings = {
                        "Pen_auto_backup": ($('#Pen_auto_backup')[0].checked ? "1" : "0"),
                        "Phour_backup": $('#Phour_backup')[0].value,
                        "Psftp_account": $('#Psftp_account')[0].value,
                        "Psftp_address": $('#Psftp_address')[0].value,
                        "Psftp_pass": $('#Psftp_pass')[0].value
                    };

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
        url: "./userdefined/backup_results",
        dataType: "text",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            if (jqXHR.status != 404) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909")
                });
            }
        },
        success: function(data) {
            $("#backup_log")[0].innerHTML = '';

            var arr = data.split("\n").reverse();

            for (var i = 0; i < arr.length; i++) {
                if (arr[i] != "") {
                    if (arr[i].contains("success")) {
                        $("div#backup_log").append($("<div />").html(arr[i]).css({
                            color: "green"
                        }));
                    } else {
                        $("div#backup_log").append($("<div />").html(arr[i]).css({
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
                    url: "../cgi?action=reloadBackupLog&backuplog=",
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

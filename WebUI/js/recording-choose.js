/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    config = UCMGUI.config,
    addZero = UCMGUI.addZero,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    usbdisk_info,
    sdcard_info,
    firstLoad = true,
    lastLink = '';

Array.prototype.each = top.Array.prototype.each;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3378"));

    UCMGUI.domFunction.disableCheckBox({
        enableCheckBox: "auto_device",
        enableList: ['usb', 'sd', 'local']
    }, doc);

    check_device_model();

    check_device();

    initValidator();

    top.Custom.init(doc);
});

function check_device_model() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data:{
            "action": "getCheckDevice",
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var autoDevice = $('#auto_device')[0];

                autoDevice.checked = (data.response.auto_or_no == "no" ? false : true);

                autoDevice.updateStatus();
            }
        }
    });
}

function choose_apply() {
    var chooselink = '',
        device = document.getElementsByName("device"),
        auto_device = $('#auto_device')[0].checked ? "yes": "no";

    for (var i = 0; i < device.length; i++) {
        if (device.item(i).checked) {
            chooselink = device.item(i).getAttribute("value");
            break;
        } else {
            continue;
        }
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            "action": "setCheckDevice",
            "auto_or_no": auto_device,
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (auto_device !== 'no') {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        async: false,
                        url: "../cgi",
                        data: {
                            "action": "setCheckDeviceAuto",
                            "auto_or_no": "yes",
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG913")
                            });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: ($P.lang("LANG844"))
                                });
                            }
                        }
                    });
                }
            }
        }
    });

    if (auto_device === 'no') {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            url: "../cgi",
            data: {
                "action": 'ChooseLink',
                "choose_link": chooselink
            },
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG913")
                });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    var body = data.response["body"];

                    if (body == 'no_path') {
                        top.dialog.dialogConfirm({
                            confirmStr: $P.lang("LANG3755"),
                            buttons: {
                                ok: function() {},
                                cancel: function() {}
                            }
                        });
                    } else {
                        if (chooselink == "0") {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: ($P.lang("LANG2915"))
                            });
                        } else if (chooselink == '2' || chooselink == '5') {
                            var cp_to = (chooselink == '5') ? "USB" : "SD";

                            top.dialog.dialogConfirm({
                                confirmStr: $P.lang("LANG3854").format(cp_to, cp_to),
                                buttons: {
                                    ok: function() {
                                        top.dialog.dialogInnerhtml({
                                            dialogTitle: $P.lang("LANG3756"),
                                            displayPos: "editForm",
                                            frameSrc: "html/recording_copy.html?mode=" + chooselink
                                        });
                                    },
                                    cancel: function() {}
                                }
                            });
                        }
                    }

                }
            }
        });
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {

        },
        submitHandler: function() {
            var target = this.submitButton;

            choose_apply();
        }
    });
}

function check_device() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            "action": 'getInterfaceStatus',
            "auto-refresh": Math.random()
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                sdcard_info = data.response['interface-sdcard'],

                usbdisk_info = data.response['interface-usbdisk'];

                if (usbdisk_info == "true") {
                    $("#usb_cell").show();
                } else {
                    $("#usb_cell").hide();
                }
                if (sdcard_info == "true") {
                    $("#sd_cell").show();
                } else {
                    $("#sd_cell").hide();
                }
            }
        }
    });

    check_device_link();

    setTimeout(check_device, 5000);
}

function check_device_link() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            "action": 'getRecordingLink',
            "auto-refresh": Math.random()
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var link_info = data.response['body'],
                    link_device;

                if (firstLoad) {
                    lastLink = link_info;
                    firstLoad = false;
                } else {
                    if (link_info == lastLink) {
                        return;
                    }
                }

                $(".radio").css("background-position", "0 0");

                if (link_info == "local") {
                    $('#local')[0].checked = true;
                    $("#local").prev().css("background-position", "0px -50px");
                } else if (link_info == "USB") {
                    $('#usb')[0].checked = true;
                    $("#usb").prev().css("background-position", "0px -50px");
                } else if (link_info == "SD") {
                    $('#sd')[0].checked = true;
                    $("#sd").prev().css("background-position", "0px -50px");
                }

                // Pengcheng Zou Added.
                $('#auto_device')[0].updateStatus();

                lastLink = link_info;
            }
        }
    });
}
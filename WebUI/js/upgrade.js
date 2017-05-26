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
    progressTotal = 1,
    nupgradeurl = "../cgi?action=getUpgradeValue",
    upload = $("#upload"), // local upload firmware
    fileUrl = document.getElementById('fileUrl'),
    udo = document.getElementById('udo');

String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.trim = top.String.prototype.trim;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG619"));

    // set network upload config
    setPValueInit();

    initValidator();

    UCMGUI.loginFunction.checkifLoggedIn('ping');

    udo.onclick = function() {
        $.ajax({
            type: 'POST',
            url: '../cgi',
            data: {
                'action': 'setUpgradeValue',
                'skip_cookie_timeout': '1'
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {},
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {}
            }
        });

        $.ajax({
            type: 'POST',
            url: '../cgi',
            data: {
                'action': 'ping'
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.status == 0) {
                    // onProgress();
                    uploadObj.submit("upgrade");
                } else {
                    top.window.location.reload();
                }
            }
        });
    };
});

var uploadObj = new AjaxUpload(upload, {
    action: '../cgi?action=uploadfile&type=firmware',
    name: 'filename',
    autoSubmit: false,
    responseType: 'json',
    onChange: function(file, ext) {
        fileUrl.value = file;
        // $P("#form_upgrade", document).valid();
    },
    onSubmit: function(file, ext) {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG979")
        });

        top.window.clearInterval(top.loginInterval);

        top.loginInterval = null;
    },
    onComplete: function(file, data) {
        // this.enable();
        top.dialog.clearDialog();

        data = eval(data);

        if (data) {
            var status = data.status,
                response = data.response;

            if (data.status == 0 && response && response.result == 0) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG924"),
                    buttons: {
                        ok: function() {
                            UCMGUI.loginFunction.confirmReboot();
                        },
                        cancel: function() {
                            UCMGUI.loginFunction.checkTrigger();
                        }
                    }
                });
            } else if (data.status === 4) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG915")
                });
            } else if (response) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: transcode(response.result)
                });

                document.getElementById("fileUrl").value = "";
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG916")
                });
            }
        } else {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG916")
            });
        }
    }
});

function setPValueInit() {
    $.ajax({
        type: "GET",
        url: nupgradeurl,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                UCMGUI.domFunction.updateDocument(data.response, doc);

                top.Custom.init(doc);
            }
        }
    });
}

function initValidator() {
    $("#form_network").tooltip();

    $P("#form_network", document).validate({
        rules: {
            "firmware-server-path": {
                urlWithoutProtocol: [$P.lang('LANG1271')]
            },
            "firmware-file-prefix": {
                specialStr: true
            },
            "firmware-file-suffix": {
                specialStr: true
            }
        },
        submitHandler: function() {
            // top.dialog.dialogMessage({ type: 'loading', content: $P.lang("LANG905") });

            $.ajax({
                type: 'POST',
                url: '../cgi',
                data: {
                    'action': 'setUpgradeValue',
                    'upgrade-via': $('#upgrade-via').val(),
                    'firmware-server-path': $('#firmware-server-path').val(),
                    'firmware-file-prefix': $('#firmware-file-prefix').val(),
                    'firmware-file-suffix': $('#firmware-file-suffix').val(),
                    'username': $('#username').val(),
                    'password': $('#password').val(),
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    top.dialog.clearDialog();

                    if (errorThrown && errorThrown.length > 0) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: errorThrown
                        });
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG861")
                        });
                    }
                },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);

                    if (bool) {

                        // top.dialog.clearDialog();
                        // take out blank space

                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG844")
                        });
                    }
                }
            });
        }
    });

    $("#form_upgrade").tooltip();

    $P("#form_upgrade", document).validate({
        rules: {
            "fileUrl": {
                required: true
            }
        }
    });
}

// Not Called
function onProgress() {
    $.ajax({
        type: "GET",
        async: true,
        url: "/webcgi?action=getparam&:up_total",
        error: function() {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG909")
            });
        },
        success: function(data) {
            if (data) {
                var totalPos = (data.indexOf("=") + 1),
                    total = data.substring(totalPos);

                if (total.length != 2) {
                    progressTotal = parseInt(total);

                    getReceive();
                } else {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG909")
                    });

                    return;
                }
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909")
                });

                return;
            }
        }
    });
}

// Not Called
function getReceive() {
    var timer = setTimeout(getReceive, 1000);

    $.ajax({
        type: "GET",
        async: true,
        url: "/webcgi?action=getparam&:up_receive",
        error: function() {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG909")
            });
        },
        success: function(data) {
            if (data) {
                var receivePos = (data.indexOf("=") + 1),
                    receive = data.substring(receivePos);

                if (receive.length != 2) {
                    var progressReceive = parseInt(receive),
                        progress = (progressReceive / progressTotal);

                    if (progress == 1) {
                        progress = 100;
                    } else {
                        progress = progress + "";

                        var len = progress.indexOf(".") + 1;

                        progress = progress.substring(len);
                        progress = progress.substring(0, 2);

                        if (progress.substring(0, 1) == "0") {
                            progress = progress.substring(1);
                        }

                        progress = parseInt(progress);
                    }

                    $P("#spaceused1").progressBar(progress);

                    if (progress == 100) {
                        clearTimeout(timer);

                        setTimeout(function() {
                            top.dialog.clearDialog();

                            top.dialog.dialogConfirm({
                                confirmStr: $P.lang("LANG924"),
                                buttons: {
                                    ok: UCMGUI.loginFunction.confirmReboot
                                }
                            });

                            $P("#spaceused1").progressBar(1);

                            return;
                        }, 1000)
                    }
                } else {
                    clearTimeout(timer);

                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG909")
                    });

                    return;
                }
            } else {
                clearTimeout(timer);

                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909")
                });

                return;
            }
        }
    });
}

// Not Called
function confirm_reboot() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG832")
    });

    $.ajax({
        type: "GET",
        url: "../webcgi?action=reboot",
        success: function(data) {
            if (typeof data == "string" && data.contains("Authentication failed")) {
                UCMGUI.logoutFunction.doLogout();
                return;
            }

            setTimeout("top.window.location.reload();", 120000);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            if (errorThrown != null && errorThrown.length > 0) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG853")
                });
            }
        }
    })
}

// Not Called
function preupload() {
    var checkFlag = false;

    $.ajax({
        type: 'POST',
        url: '../preupload?type=firmware',
        async: false,
        success: function(t) {
            if (typeof t == "string" && t.contains("Authentication failed")) {
                UCMGUI.logoutFunction.doLogout();
                return;
            }

            // take out blank space
            t = t.trim().toLowerCase();

            if (t.endsWith("0") || t.endsWith("ok")) {
                checkFlag = true;
            }
        }
    });

    return checkFlag;
}

// Parse response code, return the corresponding text.
function transcode(rescode) {
    if (!isNaN(rescode)) {
        var rescode = parseInt(rescode);

        switch (rescode) {
            case 0:
                return $P.lang("LANG961");
            case 236:
                return $P.lang("LANG962");
            case 238:
                return $P.lang("LANG963");
            case 239:
                return $P.lang("LANG964");
            case 240:
                return $P.lang("LANG965");
            case 241:
                return $P.lang("LANG966");
            case 242:
                return $P.lang("LANG967");
            case 243:
            case 253:
                return $P.lang("LANG968");
            case 244:
            case 254:
                return $P.lang("LANG969");
            case 245:
                return $P.lang("LANG970");
            case 246:
                return $P.lang("LANG971");
            case 247:
            case 248:
                return $P.lang("LANG972");
            case 249:
            case 250:
            case 255:
                return $P.lang("LANG973");
            case 251:
                return $P.lang("LANG974");
            case 252:
                return $P.lang("LANG975");
            default:
                return $P.lang("LANG976");
        }
    } else {
        return $P.lang("LANG976");
    }
}
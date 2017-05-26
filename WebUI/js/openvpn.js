/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2016 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    ifExisted = UCMGUI.inArray,
    fileType = "",
    oldDom = "",
    openPort;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3990"));

    initUpload();

    initValidator();

    getOpenVPNSettings();

    btnDelete_check_state();

    // oldDom = getDomStr();

    getOpenPort();

    top.Custom.init(doc);
});

function cancel() {
    $(".click").removeClass("click");
}

function getOpenVPNSettings() {
    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            'action': 'getOpenVPNSettings',
            'vpn_index': '0',
            'remote': '',
            'proto': '',
            'dev': '',
            'cipher': '',
            'enable': '',
            'comp': ''
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var remote = data.response.openvpn_settings.remote.split(' ');

                $('#enable')[0].checked = (data.response.enable == "1") ? true : false;
                $('#proto').val(data.response.openvpn_settings.proto);
                $('#dev').val(data.response.openvpn_settings.dev);
                $('#comp')[0].checked = (data.response.openvpn_settings.comp == "yes") ? true : false;
                $('#cipher').val(data.response.openvpn_settings.cipher);
                $('#ip').val(remote[0]);
                $('#port').val(remote[1]);
            }
        }
    });
}

function checkPort(value, element) {
    if (value < 0 || value > 65535) {
        return false;
    }

    return true;
}

function getOpenPort() {
    $.ajax({
        url: "../cgi?action=getNetstatInfo",
        type: "GET",
        async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var netstat = data.response.netstat,
                    currentPort = '';

                openPort = [];

                for (var i = 0, length = netstat.length; i < length; i++) {
                    currentPort = netstat[i]['port'];

                    if (!ifExisted(currentPort, openPort)) {
                        openPort.push(currentPort);
                    }
                }
            }
        }
    });

    $.ajax({
        url: "../cgi?action=getCDRAPISettings",
        type: "GET",
        async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var tlsbindaddr = data.response.http_settings.tlsbindaddr;

                if (tlsbindaddr) {
                    var port = tlsbindaddr.split(":")[1];

                    if (port && !ifExisted(port, openPort)) {
                        openPort.push(port);
                    }
                }   
            }
        }
    });

    $.ajax({
        url: "../cgi?action=getSIPTCPSettings",
        type: "GET",
        async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var tlsbindaddr = data.response.sip_tcp_settings.tlsbindaddr,
                    tcpbindaddr = data.response.sip_tcp_settings.tcpbindaddr;

                if (tlsbindaddr) {
                    var tlsPort = tlsbindaddr.split(":")[1];

                    if (tlsPort && !ifExisted(tlsPort, openPort)) {
                        openPort.push(tlsPort);
                    }
                }

                if (tcpbindaddr) {
                    var tcpPort = tcpbindaddr.split(":")[1];

                    if (tcpPort && !ifExisted(tcpPort, openPort)) {
                        openPort.push(tcpPort);
                    }
                }
            }
        }
    });
}

function checkOpenPort(value, element) {
    var val = value;

    for (var i = 0; i < openPort.length; i++) {
        ele = openPort[i];

        if (val == ele) {
            return false;
        }
    }

    return true;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "ip": {
                required: function(element) {
                    return $('#enable').is(":checked");
                },
                host: ['']
            },
            "port": {
                required: function(element) {
                    return $('#enable').is(":checked");
                },
                digits: true,
                customCallback: [$P.lang("LANG957"), checkPort]
                // customCallback1: [$P.lang("LANG3869"), checkOpenPort]
            },
            "openvpn_ca_crt": {
                required: function(element) {
                    return $('#enable').is(":checked");
                }
            },
            "openvpn_client_crt": {
                required: function(element) {
                    return $('#enable').is(":checked");
                }
            },
            "openvpn_client_key": {
                required: function(element) {
                    return $('#enable').is(":checked");
                }
            }
        },
        newValidator: true,
        submitHandler: function(ev) {
            save_changes();
        }
    });
}

function initUpload() {
    var openvpn_ca_crt_select = $("#openvpn_ca_crt_select"),
        openvpn_ca_crt = $("#openvpn_ca_crt"),
        openvpn_ca_crt_upload = $("#openvpn_ca_crt_upload"),
        openvpn_ca_crt_delete = $("#openvpn_ca_crt_delete");

    var openvpn_ca_crt_uploader = new AjaxUpload(openvpn_ca_crt_select, {
        action: '/cgi?action=uploadfile&type=openvpn_ca_crt',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "ca_crt";

            $(openvpn_ca_crt).val(file);

            if (file) {
                $(openvpn_ca_crt_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "ca_crt";

            var pattern = /^(crt)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.crt', $P.lang('LANG3999'))
                });

                $(openvpn_ca_crt_upload).attr("disabled", true);

                $(openvpn_ca_crt).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(openvpn_ca_crt_upload).bind({
        click: function() {
            openvpn_ca_crt_uploader.submit();
        }
    });

    $(openvpn_ca_crt_delete).bind({
        click: function() {
            delete_file("openvpn_ca_crt");
            return false;
        }
    });

    // upload client cert 
    var openvpn_client_crt_select = $("#openvpn_client_crt_select"),
        openvpn_client_crt = $("#openvpn_client_crt"),
        openvpn_client_crt_upload = $("#openvpn_client_crt_upload"),
        openvpn_client_crt_delete = $("#openvpn_client_crt_delete");

    var openvpn_client_crt_uploader = new AjaxUpload(openvpn_client_crt_select, {
        action: '../cgi?action=uploadfile&type=openvpn_client_crt',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "client_crt";

            $(openvpn_client_crt).val(file);

            if (file) {
                $(openvpn_client_crt_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "client_crt";

            var pattern = /^(crt)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.crt', $P.lang('LANG4001'))
                });

                $(openvpn_client_crt_upload).attr("disabled", true);

                $(openvpn_client_crt).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(openvpn_client_crt_upload).bind({
        click: function() {
            openvpn_client_crt_uploader.submit();
        }
    });

    $(openvpn_client_crt_delete).bind({
        click: function() {
            delete_file("openvpn_client_crt");
            return false;
        }
    });

    // upload client key 
    var openvpn_client_key_select = $("#openvpn_client_key_select"),
        openvpn_client_key = $("#openvpn_client_key"),
        openvpn_client_key_upload = $("#openvpn_client_key_upload"),
        openvpn_client_key_delete = $("#openvpn_client_key_delete");

    var openvpn_client_key_uploader = new AjaxUpload(openvpn_client_key_select, {
        action: '../cgi?action=uploadfile&type=openvpn_client_key',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "client_key";

            $(openvpn_client_key).val(file);

            if (file) {
                $(openvpn_client_key_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "client_key";

            var pattern = /^(key)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.key', $P.lang('LANG4003'))
                });

                $(openvpn_client_key_upload).attr("disabled", true);

                $(openvpn_client_key).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(openvpn_client_key_upload).bind({
        click: function() {
            openvpn_client_key_uploader.submit();
        }
    });

    $(openvpn_client_key_delete).bind({
        click: function() {
            delete_file("openvpn_client_key");
            return false;
        }
    });
}

function save_changes() {
    var action = {};

    action["action"] = "updateOpenVPNSettings";
    action["vpn_index"] = "0";
    action["enable"] = ($('#enable').is(":checked") ? "1" : "0");
    action["remote"] = $('#ip').val() + ' ' + $('#port').val();
    action["proto"] = $('#proto').val();
    action["dev"] = $('#dev').val();
    action["comp"] = ($('#comp').is(":checked") ? "yes" : "no");
    action["cipher"] = $('#cipher').val();

    $.ajax({
        type: "post",
        url: baseServerURl,
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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });
            }
        }
    });
}

function getDomStr() {
    var domStr = "",
        dom = $("input, select");

    dom.each(function() {
        if (this.type == 'checkbox') {
            domStr += (this.checked ? "yes" : "no");
        } else {
            domStr += this.value;
        }
    });

    return domStr;
}

function confirm_reboot() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG927"),
        buttons: {
            ok: UCMGUI.loginFunction.confirmReboot
        }
    });
}

function file_upload_complete_tip(file, response) {
    if (fileType == "ca_crt") {
        $("#openvpn_ca_crt").val("");
    } else if (fileType == "client_crt") {
        $("#openvpn_client_crt").val("");
    } else if (fileType == "client_key") {
        $("#openvpn_client_key").val("");
    }

    top.dialog.clearDialog();

    var bool = UCMGUI.errorHandler(response);

    if (bool) {
        if (response.response && response.response.result == "0") {
            // list_key_files();
            // confirm_reboot();

            top.dialog.dialogMessage({
                type: 'success',
                content: $P.lang("LANG906")
            });

            showApplyChange();
        } else {
            if (response && response.response && response.response.body) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: response.response.body
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG907")
                });
            }
        }
    }

    btnDelete_check_state(fileType);
}

function processDeleteFile(type) {
    if (type == "openvpn_ca_crt") {
        fileType = "ca_crt";
    } else if (type == "openvpn_client_crt") {
        fileType = "client_crt";
    } else if (type == "openvpn_client_key") {
        fileType = "client_key";
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            action: "removeFile",
            type: type
        },
        async: false,
        url: baseServerURl,
        success: function(data) {
            btnDelete_check_state(fileType);

            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (data && data.response && data.response.result == "0") {
                    // confirm_reboot();

                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG871")
                    });

                    showApplyChange();
                } else {
                    if (data.response.body) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: data.response.body
                        });
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG889")
                        });
                    }
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });

            btnDelete_check_state();
        }
    });
}

function showApplyChange() {
    var applyChanges = $("#applyChanges_Button", top.frames["frameContainer"].document),
        lineButton = $("#line_Button", top.frames["frameContainer"].document);

    if (applyChanges.length > 0 && lineButton.length > 0 && !applyChanges.is(':animated')) {
        applyChanges.css("visibility", "visible");
        lineButton.css("visibility", "visible");
        // applyChanges.effect("shake", {
        //  direction: "up", distance: 2, times: 10000
        // }, 400);
    }
}

function delete_file(type) {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG938"),
        buttons: {
            ok: function() {
                processDeleteFile(type);
            }
        }
    });
}

function btnDelete_check_state(fileType) {
    if ((fileType == "ca_crt" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "openvpn_ca_crt"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#openvpn_ca_crt_delete").attr("disabled", false);
                    $("#openvpn_ca_crt").val("ca.crt");
                } else {
                    $("#openvpn_ca_crt_delete").attr("disabled", true);
                    $("#openvpn_ca_crt").val("");
                }

                $("#openvpn_ca_crt_upload").attr("disabled", true);
            }
        });
    }

    if ((fileType == "client_crt" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "openvpn_client_crt"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#openvpn_client_crt_delete").attr("disabled", false);
                    $("#openvpn_client_crt").val("client.crt");
                } else {
                    $("#openvpn_client_crt_delete").attr("disabled", true);
                    $("#openvpn_client_crt").val("");
                }

                $("#openvpn_client_crt_upload").attr("disabled", true);
            }
        });
    }

    if ((fileType == "client_key" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "openvpn_client_key"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#openvpn_client_key_delete").attr("disabled", false);
                    $("#openvpn_client_key").val("client.key");
                } else {
                    $("#openvpn_client_key_delete").attr("disabled", true);
                    $("#openvpn_client_key").val("");
                }

                $("#openvpn_client_key_upload").attr("disabled", true);
            }
        });
    }
}
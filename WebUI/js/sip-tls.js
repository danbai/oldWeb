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
    ifExisted = UCMGUI.inArray,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    oWebrtcPort = {},
    fileType = "",
    oldDom = "",
    openPort,
    oldTCPPort,
    oldTCPV6Port,
    oldTLSPort,
    oldTLSV6Port;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG690"));

    getSIPTCPSettings();

    initUpload();

    btnDelete_check_state();

    list_ca_files();

    getOpenPort();

    getWebrtcPort();

    oldDom = getDomStr();

    initValidator();

    top.Custom.init(doc);
});

function cancel() {
    $(".click").removeClass("click");
}

function checkOpenPort(value, ele) {
    var val = value.split(':')[1],
        oldValue = '';
    if (UCMGUI.isIPv6(value)) {
        val = value.split("]:")[1];
    }
    if (ele.id == 'tlsbindaddr') {
        oldValue = oldTLSPort;
    } else if (ele.id == 'tlsbindaddr6') {
        oldValue = oldTLSV6Port;
    }  else if (ele.id == 'tcpbindaddr') {
        oldValue = oldTCPPort;
    } else if (ele.id == 'tcpbindaddr6') {
        oldValue = oldTCPV6Port;
    }

    if (!val || (val == oldValue)) {
        return true;
    }

    for (var i = 0; i < openPort.length; i++) {
        var port = openPort[i];

        if (val == port) {
            return false;
        }
    }

    return true;
}

function checkPort(value, element) {
    var val = value.split(":")[1];
    if (UCMGUI.isIPv6(value)) {
        val = value.split("]:")[1];
    }
    if (val < 0 || val > 65535) {
        return false;
    }
    return true;
}

function checkWebrtcPort(value, element) {
    var val = value.split(":")[1],
        enable;
    if (UCMGUI.isIPv6(value)) {
        val = value.split("]:")[1];
    }
    if (element.id == 'tlsbindaddr') {
        enable = $('#tlsenable')[0].checked;
    } else if (element.id == 'tlsbindaddr6') {
        enable = $('#tcpenable')[0].checked;
    }  else if (element.id == 'tcpbindaddr') {
        enable = $('#tcpenable')[0].checked;
    } else if (element.id == 'tcpbindaddr6') {
        enable = $('#tcpenable')[0].checked;
    }

    if (!enable || oWebrtcPort.enable === 'no') {
        return true;
    }

    if (val === oWebrtcPort.port) {
        return false;
    }

    return true;
}

function deleteCAFile() {
    var cafileid = $(".click").siblings().eq(0).text();

    $(".click").removeClass("click");

    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "removeFile",
            type: "sip_tls_ca_dir",
            data: cafileid
        },
        url: baseServerURl,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (data && data.response && data.response.result == "0") {
                    list_ca_files();

                    confirm_reboot();
                } else {
                    var message = $P.lang("LANG889");

                    if (data && data.response && data.response.body && data.response.result != "0") {
                        message = data.response.body;
                    }

                    top.dialog.dialogMessage({
                        type: 'error',
                        content: message
                    });
                }
            }
        }
    });
}

function getSIPTCPSettings() {
    $.ajax({
        type: "post",
        url: baseServerURl,
        data: {
            action: "getSIPTCPSettings"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });

            top.Custom.init(doc);
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var sipTcpSettings = data.response.sip_tcp_settings;

                UCMGUI.domFunction.updateDocument(sipTcpSettings, doc);

                oldTCPPort = sipTcpSettings.tcpbindaddr.split(":")[1];
                oldTCPV6Port = sipTcpSettings.tcpbindaddr6.split("]:")[1];
                oldTLSPort = sipTcpSettings.tlsbindaddr.split(":")[1];
                oldTLSV6Port = sipTcpSettings.tlsbindaddr6.split("]:")[1];
                top.Custom.init(doc);
            }
        }
    });
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
                var tlsbindaddr = data.response.http_settings.tlsbindaddr,
                    tlsbindaddr6 = data.response.http_settings.tlsbindaddr6;

                if (tlsbindaddr) {
                    var port = tlsbindaddr.split(":")[1];

                    if (port && !ifExisted(port, openPort)) {
                        openPort.push(port);
                    }
                }
                if (tlsbindaddr6) {
                    var port = tlsbindaddr6.split("]:")[1];

                    if (port && !ifExisted(port, openPort)) {
                        openPort.push(port);
                    }
                }     
            }
        }
    });
}

function getWebrtcPort() {
    $.ajax({
        url: "../cgi?action=getSIPWebRTCHttpSettings",
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
                var tlsenable = data.response.webrtc_http_settings.tlsenable,
                    tlsbindaddr = data.response.webrtc_http_settings.tlsbindaddr,
                    tlsPort = tlsbindaddr.split(":")[1];

                oWebrtcPort = {
                    'enable': tlsenable,
                    'port': tlsPort
                }
            }
        }
    });
}

function initUpload() {
    var tls_ca_select = $("#tls_ca_file_select"),
        tlscafile = $("#tlscafile"),
        tls_ca_upload = $("#tls_ca_file_upload"),
        tls_ca_delete = $("#tls_ca_file_delete");

    var tls_ca_uploader = new AjaxUpload(tls_ca_select, {
        action: '/cgi?action=uploadfile&type=sip_tls_ca_file',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "ca";

            $(tlscafile).val(file);

            if (file) {
                $(tls_ca_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "ca";

            var pattern = /^(ca)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.ca', $P.lang('LANG1862'))
                });

                $(tls_ca_upload).attr("disabled", true);

                $(tlscafile).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });

            /* this.disable(); */
            // [AH] Comment out since the empty file check is already done by ajaxupload
            // if (file == null || file == '') {
            //     top.ASTGUI.dialog.alertmsg($P.lang("LANG910")); return;
            // }
            // top.onLogInFunctions.makePings.stop();
        },
        onComplete: file_upload_complete_tip
    });

    $(tls_ca_upload).bind({
        click: function() {
            tls_ca_uploader.submit();
        }
    });

    $(tls_ca_delete).bind({
        click: function() {
            delete_file("sip_tls_ca_file");
            return false;
        }
    });

    // upload client cert 
    var tls_crt_select = $("#tls_crt_select"),
        tlscrtfile = $("#tlscrtfile"),
        tls_crt_upload = $("#tls_crt_upload"),
        tls_crt_delete = $("#tls_crt_delete");

    var tls_crt_uploader = new AjaxUpload(tls_crt_select, {
        action: '../cgi?action=uploadfile&type=sip_tls_crt',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "crt";

            $(tlscrtfile).val(file);

            if (file) {
                $(tls_crt_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "crt";

            var pattern = /^(crt)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.crt', $P.lang('LANG1864'))
                });

                $(tls_crt_upload).attr("disabled", true);

                $(tlscrtfile).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(tls_crt_upload).bind({
        click: function() {
            tls_crt_uploader.submit();
        }
    });

    $(tls_crt_delete).bind({
        click: function() {
            delete_file("sip_tls_crt");
            return false;
        }
    });

    // upload client key 
    var tls_key_select = $("#tls_key_select"),
        tlskeyfile = $("#tlskeyfile"),
        tls_key_upload = $("#tls_key_upload"),
        tls_key_delete = $("#tls_key_delete");

    var tls_key_uploader = new AjaxUpload(tls_key_select, {
        action: '../cgi?action=uploadfile&type=sip_tls_key',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "key";

            $(tlskeyfile).val(file);

            if (file) {
                $(tls_key_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "key";

            var pattern = /^(key)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.key', $P.lang('LANG4166'))
                });

                $(tls_key_upload).attr("disabled", true);

                $(tlskeyfile).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(tls_key_upload).bind({
        click: function() {
            tls_key_uploader.submit();
        }
    });

    $(tls_key_delete).bind({
        click: function() {
            delete_file("sip_tls_key");
            return false;
        }
    });

    // upload CA cert to ca_dir
    var tls_ca_dir_select = $("#tls_ca_dir_select"),
        tlscadir = $("#tlscadir"),
        tls_ca_dir_upload = $("#tls_ca_dir_upload");

    var tls_ca_dir_uploader = new AjaxUpload(tls_ca_dir_select, {
        action: '/cgi?action=uploadfile&type=sip_tls_ca_dir',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "dir";

            $(tlscadir).val(file);

            if (file) {
                $(tls_ca_dir_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "ca";

            var pattern = /^(ca)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.ca', $P.lang('LANG1860'))
                });

                $(tls_ca_dir_upload).attr("disabled", true);

                $(tlscadir).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(tls_ca_dir_upload).bind({
        click: function() {
            tls_ca_dir_uploader.submit();
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "tcpenable": {},
            "tcpbindaddr": {
                required: function(element) {
                    return $('#tcpenable').is(":checked");
                },
                ipv4AddressPort: true,
                customCallback: [$P.lang("LANG957"), checkPort],
                customCallback1: [$P.lang("LANG3869"), checkOpenPort],
                customCallback2: [$P.lang("LANG3869"), checkWebrtcPort]
            },
            "tcpbindaddr6": {
                required: function(element) {
                    return $('#tcpenable').is(":checked");
                },
                ipv6Port: true,
                customCallback: [$P.lang("LANG957"), checkPort],
                customCallback1: [$P.lang("LANG3869"), checkOpenPort],
                customCallback2: [$P.lang("LANG3869"), checkWebrtcPort]
            },
            "tlsenable": {},
            "tlsbindaddr": {
                required: function(element) {
                    return $('#tlsenable').is(":checked");
                },
                ipAddressPort: true,
                customCallback: [$P.lang("LANG957"), checkPort],
                customCallback1: [$P.lang("LANG3869"), checkOpenPort],
                customCallback2: [$P.lang("LANG3869"), checkWebrtcPort],
                tcptlsportdiff: [$('#tcpbindaddr'), $('#tlsbindaddr')],
                tcptlsIPv6portdiff: [$('#tcpbindaddr6'), $('#tlsbindaddr6')]
            },
            "tlsbindaddr6": {
                required: function(element) {
                    return $('#tlsenable').is(":checked");
                },
                ipv6Port: true,
                customCallback: [$P.lang("LANG957"), checkPort],
                customCallback1: [$P.lang("LANG3869"), checkOpenPort],
                customCallback2: [$P.lang("LANG3869"), checkWebrtcPort],
                tcptlsportdiff: [$('#tcpbindaddr'), $('#tlsbindaddr')],
                tcptlsIPv6portdiff: [$('#tcpbindaddr6'), $('#tlsbindaddr6')]
            },
            "tlsclientmethod": {},
            "tlsdontverifyserver": {}
        },
        newValidator: true,
        submitHandler: function(ev) {
            save_changes();
        }
    });

    $('#tcpenable').click(function() {
        $P('#tcpbindaddr', document).valid();
        $P('#tcpbindaddr6', document).valid();
    });

    $('#tlsenable').click(function() {
        $P('#tlsbindaddr', document).valid();
        $P('#tcpbindaddr6', document).valid();
    });
}

/* xpqin: please keep this code for future use.
    function enableTcp () {
        $.ajax({
            type: "GET",
            async: false,
            url: "/webcgi?Action=getSIPSetting&tcpenable=&tlsenable=",
            error: function () {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909")
                });
            },
            success: function (data) {
                if (data && data.body) {
                    var tcpPort = $("#tcpbindaddr").val().split(":")[1],
                        tlsPort = $("#tlsbindaddr").val().split(":")[1],
                        port = "",
                        sip_tls_enable = data.body["tlsenable"],
                        sip_tcp_enable = data.body["tcpenable"];

                    if (tcpPort && tlsPort && sip_tls_enable == "yes" && sip_tcp_enable == "yes") {
                        port = tcpPort + "," + tlsPort;
                    } else if (tcpPort && sip_tcp_enable == "yes") {
                        port = tcpPort;
                    } else if (tlsPort && sip_tls_enable == "yes") {
                        port = tlsPort;
                    }

                    var actionStr = "iptables-multiport[name=asterisk-tcp, port=\""+port+"\", protocol=tcp]",
                        newJail = new listOfActions('jail.conf');

                    newJail.new_action("update", "asterisk-tcp", "action", actionStr);

                    if (sip_tcp_enable == "yes" || sip_tls_enable == "yes") {
                            var tcpEnable = true,
                                jail = config2json({filename:'jail.conf', usf: 1}),
                                jailAstUdp = jail["asterisk-udp"],
                                udpEnble = jailAstUdp["enabled"] == "true" ? true : false;

                            if (udpEnble) {
                                newJail.new_action("update", "asterisk-tcp", "enabled", tcpEnable);
                            }
                    } else {
                        newJail.new_action("update", "asterisk-tcp", "enabled", "false");
                    }

                    newJail.callActions();
                }
            }
        });
    }
*/

function save_changes() {
    var action = {};

    action = UCMGUI.formSerializeVal(document);

    action["action"] = "updateSIPTCPSettings";

    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });

            top.Custom.init(document);
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                // enableTcp();
                var newDom = getDomStr();

                if (oldDom != newDom) {
                    oldDom = newDom;

                    confirm_reboot();
                } else {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG4764"),
                        callback: function() {
                            oldDom = getDomStr();
                        }
                    });
                }
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
        confirmStr: $P.lang("LANG926"),
        buttons: {
            ok: UCMGUI.loginFunction.confirmReboot
        }
    });
}

function file_upload_complete_tip(file, response) {
    if (fileType == "ca") {
        $("#tlscafile").val("");
    } else if (fileType == "crt") {
        $("#tlscrtfile").val("");
    } else if (fileType == "key") {
        $("#tlskeyfile").val("");
    } else if (fileType == "dir") {
        $("#tlscadir").val("");

        $("#tls_ca_dir_upload").attr("disabled", true);
    }

    top.dialog.clearDialog();

    var bool = UCMGUI.errorHandler(response);

    if (bool) {
        if (response.response && response.response.result == "0") {
            list_ca_files();

            confirm_reboot();
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
    if (type == "sip_tls_ca_file") {
        fileType = "ca";
    } else if (type == "sip_tls_crt") {
        fileType = "crt";
    } else if (type == "sip_tls_key") {
        fileType = "key";
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
                    confirm_reboot();
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
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });

            btnDelete_check_state();
        }
    });
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
    if ((fileType == "ca" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "sip_tls_ca_file"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#tls_ca_file_delete").attr("disabled", false);
                    $("#tlscafile").val("TLS.ca");
                } else {
                    $("#tls_ca_file_delete").attr("disabled", true);
                    $("#tlscafile").val("");
                }

                $("#tls_ca_file_upload").attr("disabled", true);
            }
        });
    }

    if ((fileType == "crt" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "sip_tls_crt"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#tls_crt_delete").attr("disabled", false);
                    $("#tlscrtfile").val("TLS.crt");
                } else {
                    $("#tls_crt_delete").attr("disabled", true);
                    $("#tlscrtfile").val("");
                }

                $("#tls_crt_upload").attr("disabled", true);
            }
        });
    }

    if ((fileType == "key" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "sip_tls_key"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#tls_key_delete").attr("disabled", false);
                    $("#tlskeyfile").val("TLS.key");
                } else {
                    $("#tls_key_delete").attr("disabled", true);
                    $("#tlskeyfile").val("");
                }

                $("#tls_key_upload").attr("disabled", true);
            }
        });
    }
}

function list_ca_files() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "listFile",
            type: "sip_tls_ca_dir",
            page: 1,
            item_num: 1000000,
            sidx: "d",
            sord: "desc"
        },
        url: baseServerURl,
        success: function(data) {
            if (data && data.status == 0 && data.response.result == 0) {
                var caf_div = $('#cafiles_div')[0],
                    children = caf_div.childNodes;

                for (i = 0; i < children.length;) {
                    caf_div.removeChild(children[i]);
                }

                var fileArray = data.response.sip_tls_ca_dir,
                    width = $('#tls_ca_dir_upload_div').width();

                if (width == 0) {
                    // default width
                    width = 193;
                }

                for (var i = 0; i < fileArray.length; i++) {
                    $("#cafiles_div").append('<div><div id="' + fileArray[i].n + 'label" value="' + fileArray[i].n + '"><div style="width:' + width.toString() + 'px;display:inline-block;word-wrap:break-word;position:relative; top: 2px;">' + fileArray[i].n + '</div><button type="button" class="deleteFileBtn" id="' + fileArray[i].n + '">Delete</button></div>');
                };

                if (fileArray.length == 0) {
                    $("#cafiles_div").append('<div style="color: #797D7E;padding-top: 2px;padding-left: 3px;">' + $P.lang("LANG939") + '</div>');
                }
            } else {
                $("#cafiles_div").append('<div style="color: #797D7E;padding-top: 2px;padding-left: 3px;">' + $P.lang("LANG939") + '</div>');
            }

            $("#cafiles_div .deleteFileBtn").bind('click', function(ev) {
                $(this).addClass("click");

                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG938"),
                    buttons: {
                        ok: deleteCAFile,
                        cancel: cancel
                    }
                });

                ev.stopPropagation();
                return false;
            });
        }
    });
}

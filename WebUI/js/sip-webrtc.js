/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2013 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    ifExisted = UCMGUI.inArray,
    openPort,
    httpPortLoadValue,
    TlsPortLoadValue = '',
    nEarlyLoad = 0,
    oCdrPort = {};

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4396"));

    getOpenPort();

    getCDRAPIPort();

    getHttpSettings();

    // getDtlsSettings();

    initValidator();
});

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

function getOpenPort() {
    openPort = [];

    $.ajax({
        url: "../cgi?action=getNetstatInfo",
        type: "GET",
        // async: false,
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
        url: "../cgi?action=getSIPTCPSettings",
        type: "GET",
        // async: false,
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
                    if (UCMGUI.isIPv6(tlsbindaddr)) {
                        tlsPort = tlsbindaddr.split("]:")[1];
                    }
                    if (tlsPort && !ifExisted(tlsPort, openPort)) {
                        openPort.push(tlsPort);
                    }
                }

                if (tcpbindaddr) {
                    var tcpPort = tcpbindaddr.split(":")[1];
                    if (UCMGUI.isIPv6(tcpbindaddr)) {
                        tcpPort = tcpbindaddr.split("]:")[1];
                    }
                    if (tcpPort && !ifExisted(tcpPort, openPort)) {
                        openPort.push(tcpPort);
                    }
                }
            }
        }
    });
}

function getCDRAPIPort() {
    $.ajax({
        url: "../cgi?action=getCDRAPISettings",
        type: "GET",
        // async: false,
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
                var enabled = data.response.http_settings.enabled,
                    tlsbindaddr = data.response.http_settings.tlsbindaddr,
                    tlsPort = tlsbindaddr.split(":")[1];
                if (UCMGUI.isIPv6(tlsbindaddr)) {
                    tlsPort = tlsbindaddr.split("]:")[1];
                }
                oCdrPort = {
                    'enable': enabled,
                    'port': tlsPort
                }
            }
        }
    });
}


function checkTlsOpenPort(value, element) {
    var val = value.split(":")[1],
        ele,
        bindportVal = $("#bindport").val();

    if (UCMGUI.isIPv6(value)) {
        val = value.split("]:")[1];
    }
    if (val == TlsPortLoadValue) {
        return true;
    }

    if (value == "0.0.0.0") {
        val = Number(bindportVal) + 1;
    }
    for (var i = 0; i < openPort.length; i++) {
        ele = openPort[i];

        if (val == ele) {
            return false;
        }
    }

    return true;
}

function checkHttpOpenPort(val, element) {
    var ele;

    if (val == httpPortLoadValue) {
        return true;
    }

    for (var i = 0; i < openPort.length; i++) {
        ele = openPort[i];

        if (val == ele) {
            return false;
        }
    }

    return true;
}

function checkCDRAPIPort(value, element) {
    var val = value.split(":")[1],
        enable = $('#tlsenable')[0].checked,
        bindportVal = $("#bindport").val();

    if (UCMGUI.isIPv6(value)) {
        val = value.split("]:")[1];
    }
    if (!enable || oCdrPort.enable === 'no') {
        return true;
    }

    if (value == "0.0.0.0") {
        val += Number(bindportVal) + 1;
    }

    if (val === oCdrPort.port) {
        return false;
    }

    return true;
}

function checkTlsHttpSamePort(value, ele) {
    var domVal = $('#tlsbindaddr').val();
    var val = domVal.split(':')[1];

    if (UCMGUI.isIPv6(domVal)) {
        val = domVal.split("]:")[1];
    }
    if (value === val) {
        return false;
    }

    return true;
}

function initValidator() {
    if ($("#form_http").tooltip) {
        $("#form_http").tooltip();
    }

    $P("#form_http", document).validate({
        rules: {
            "bindaddr": {
                required: function(element) {
                    return $('#enabled')[0].checked;
                },
                ipAddress: true
            },
            "bindport": {
                required: function(element) {
                    return $('#enabled')[0].checked;
                },
                range: [1, 65535],
                customCallback: [$P.lang("LANG2130"), checkHttpOpenPort],
                customCallback1: [$P.lang("LANG4405"), checkTlsHttpSamePort]
            },
            "tlsbindaddr": {
                required: function(element) {
                    return $('#tlsenable')[0].checked;
                },
                ipAddressPort: true,
                customCallback: [$P.lang("LANG957"), checkPort],
                customCallback1: [$P.lang("LANG2130"), checkTlsOpenPort],
                customCallback2: [$P.lang("LANG2130"), checkCDRAPIPort]
            }
        },
        newValidator: true,
        submitHandler: function(ev) {
            var action = UCMGUI.formSerializeVal($('#form_http')[0]);

            action['action'] = 'updateSIPWebRTCHttpSettings';
            var tlsbindaddr = action["tlsbindaddr"];
            if (UCMGUI.isIPv6NoPort(tlsbindaddr)) {
                action["tlsbindaddr"] = "[" + tlsbindaddr + "]";
            }

            var bindaddr = action["bindaddr"];
            if (UCMGUI.isIPv6NoPort(bindaddr)) {
                action["bindaddr"] = "[" + bindaddr + "]";
            }
            save_changes(action);
        }
    });

    /*if ($("#form_dtls").tooltip) {
        $("#form_dtls").tooltip();
    }

    $P("#form_dtls", document).validate({
        rules: {

        },
        submitHandler: function(ev) {
            var action = UCMGUI.formSerializeVal($('#form_dtls')[0]);
            action['action'] = 'updateSIPWebRTCDtlsSettings';

            save_changes(action);
        }
    });*/
}

function save_changes(action) {
    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });

                renderWebsocketInterface();
            }
        }
    });
}

function getHttpSettings(action) {
    $.ajax({
        url: "../cgi?action=getSIPWebRTCHttpSettings",
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var http_settings = data.response.webrtc_http_settings;

                httpPortLoadValue = http_settings.bindport;

                if (http_settings.tlsbindaddr) {
                    TlsPortLoadValue = http_settings.tlsbindaddr.split(':')[1];
                    if (UCMGUI.isIPv6(http_settings.tlsbindaddr)) {
                        TlsPortLoadValue = http_settings.tlsbindaddr.split("]:")[1];
                    }
                }

                UCMGUI.domFunction.updateDocument(http_settings, $('#form_http')[0]);

                renderWebsocketInterface();

                // nEarlyLoad++;

                // if (nEarlyLoad === 2) {
                top.Custom.init(doc);
                // }
            }
        }
    });
}

function renderWebsocketInterface() {
    var bindaddr = $('#bindaddr'),
        bindport = $('#bindport'),
        tlsbindaddr = $('#tlsbindaddr'),
        websocketInterface = $('#websocket_interface'),
        secureWebsocketInterface = $('#secure_websocket_interface');

    var httpAddr = bindaddr.val() === '' ? '0.0.0.0' : bindaddr.val(),
        httpPort = bindport.val() === '' ? '8088' : bindport.val(),
        tlsbindaddr = tlsbindaddr.val() === '' ? '0.0.0.0:8443' : tlsbindaddr.val();

    websocketInterface.val('ws://' + httpAddr + ':' + httpPort + '/ws');
    secureWebsocketInterface.val('wss://' + tlsbindaddr + '/ws');
}

/*function getDtlsSettings(action) {
    $.ajax({
        url: "../cgi?action=getSIPWebRTCDtlsSettings",
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var sipdtls_settings = data.response.sipdtls_settings;

                UCMGUI.domFunction.updateDocument(sipdtls_settings, $('#form_dtls')[0]);

                nEarlyLoad++;

                if (nEarlyLoad === 2) {
                    top.Custom.init(doc);
                }
            }
        }
    });
}*/

// Download the WebRTC package
function download_pkg() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG4513")
    });

    top.window.open("/cgi?action=downloadFile&type=webrtc_package", '_self');

    top.dialog.clearDialog();
}

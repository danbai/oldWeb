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
    aRejectPort = [],
    openPort = [],
    loadValue;

String.prototype.format = top.String.prototype.format;

$(function() {
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4815"));

    $P.lang(document, true);

    initValidator();

    getCTIServer();
    getOpenPort();

    getRejectPort();

});

function getCTIServer() {
    $.ajax({
        type: 'POST',
        url: "../cgi",
        dataType: 'json',
        data: "action=getCTIMidSettings",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var ctimidSettings = data.response.ctimid_settings;

                UCMGUI.domFunction.updateDocument(ctimidSettings, document);

                loadValue = $("#port").val();

                top.Custom.init(document);
            }
        }
    });
}

function check_port() {
    if ($("#port").val() == "80") {
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

function checkOpenPort(val, ele) {
    if (val == loadValue) {
        return true;
    }

    for (var i = 0; i < openPort.length; i++) {
        var ele = openPort[i];

        if (val == ele) {
            return false;
        }
    }

    return true;
}

function getRejectPort() {
    $.ajax({
        url: "../cgi",
        type: "GET",
        async: false,
        data: {
            'action': 'listStaticDefense',
            'options': 'rule_act,dest_port,protocol,type'
        },
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
                var aRules = data.response.rule_name;
                
                for (var i = 0; i < aRules.length; i++) {
                    var ele = aRules[i];

                    if ((ele.rule_act === 'reject' || ele.rule_act === 'drop') && (ele.protocol === 'tcp' || ele.protocol === 'both') && (ele.type === 'in')) {
                        aRejectPort.push(ele.dest_port.toString());
                    }
                }  
            }
        }
    });
}

function checkRejectPort(val, ele) {
    if (val == loadValue) {
        return true;
    }

    for (var i = 0; i < aRejectPort.length; i++) {
        var ele = aRejectPort[i];

        if (val === ele) {
            return false;
        }
    }

    return true;
}

function checkRejectAll() {
    var sRejectAll;

    $.ajax({
        type: "GET",
        url: "../cgi",
        data: {
            'action': 'getTypicalFirewallSettings'
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                sRejectAll = data.response.typical_firewallsettings.reject_all;
            }
        }
    });

    if (sRejectAll === "no") {
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
            "port": {
                required: true,
                digits: true,
                range: [1, 65535],
                customCallback: [$P.lang("LANG3869"), check_port],
                customCallback1: [$P.lang("LANG3869"), checkOpenPort],
                customCallback2: [$P.lang("LANG4141"), checkRejectPort]
            }
        },
        submitHandler: function() {
            save_changes();
        }
    });
}

function save_changes() {
    if ($("#port").val() !== loadValue && checkRejectAll()) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG4126"),
            buttons: {
                ok: function() {
                    top.frames['frameContainer'].module.jumpMenu("security.html");
                }
            }
        });

        return false;
    }

    var action = {};
    action = UCMGUI.formSerializeVal(document);
    action["action"] = "updateCTIMidSettings";

    $.ajax({
        url: "../cgi?",
        type: "POST",
        data: action,
        dataType: 'json',
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
                    content: $P.lang("LANG844")
                });
            }
        }
    });
}
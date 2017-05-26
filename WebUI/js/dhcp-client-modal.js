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
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = config.paths.baseServerURl,
    mode,
    mac,
    ip,
    oDhcpSetteinsg,
    aIp = [],
    aMac = [];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    mode = gup.call(window, "mode");

    if (mode === 'edit') {
        mac = gup.call(window, "mac");
        ip = gup.call(window, "ip");

        $('#mac_div').hide();

        $('#ip').val(ip);
    }

    initValidator();

    getDhcpSettings();

    getIpAndMac();
});

function getIpAndMac() {
    $.ajax({
        type: "GET",
        url: "../cgi?action=listDHCPClient",
        error: function(jqXHR, textStatus, errorThrown) {
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                aList = data.response.dhcp_client_list;

                for (var i = 0; i < aList.length; i++) {
                    aIp.push(aList[i].ip);
                    aMac.push(aList[i].mac);
                }
            }
        }
    });
}

function getDhcpSettings() {
    $.ajax({
        type: "GET",
        url: "../cgi?action=getNetworkSettings",
        error: function(jqXHR, textStatus, errorThrown) {
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                oDhcpSetteinsg = data.response.dhcp_settings;
            }
        }
    });
}

function checkMacIsExsit(val, ele) {
    var bool = true;
        //aMac = mWindow.$("#dhcp-client-list", mWindow.document).find('td[aria-describedby="dhcp-client-list_mac"]');

    for (var i = 0; i < aMac.length; i++) {
        if (aMac[i] === val) {
            bool = false;
            break;
        }
    }

    return bool;
}

function checkIpIsExsit(val, ele) {
    var bool = true;
        //aIp = mWindow.$("#dhcp-client-list", mWindow.document).find('td[aria-describedby="dhcp-client-list_ip"]');

    for (var i = 0; i < aIp.length; i++) {
        if (mode === 'edit' && ip === val) {
            bool = true;
            break;
        }

        if (aIp[i] === val) {
            bool = false;
            break;
        }
    }

    return bool;
}

function checkIp(val, ele) {
    var dhcp_submask = oDhcpSetteinsg.dhcp_submask,
        dhcp_gateway = oDhcpSetteinsg.dhcp_gateway,
        aGateWay = dhcp_gateway.split('.'),
        aVal = val.split('.');

    if (val === dhcp_gateway || aVal[3] === 255) {
        return false;
    }

    if (/^255.255.255.*$/.test(dhcp_submask)) {
        if (aVal[0] === aGateWay[0] && aVal[1] === aGateWay[1] && aVal[2] === aGateWay[2]) {
            return true;
        }
    } else if (/^255.255.*$/.test(dhcp_submask)) {
        if (aVal[0] === aGateWay[0] && aVal[1] === aGateWay[1]) {
            return true;
        }
    } else if (/^255.*$/.test(dhcp_submask)) {
        if (aVal[0] === aGateWay[0]) {
            return true;
        }
    }

    return false;
}

function checkLanIp(val, ele) {
    var dhcp_lanip = oDhcpSetteinsg.dhcp_ipaddr;

    if (val === dhcp_lanip) {
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
            "mac": {
                required: true,
                mac: true,
                customCallback: [$P.lang("LANG2134"), checkMacIsExsit]
            },
            "ip": {
                required: true,
                ipAddress: true,
                customCallback: [$P.lang("LANG2176"), checkIp],
                customCallback1: [$P.lang("LANG270").format('IP'), checkIpIsExsit],
                customCallback2: [$P.lang("LANG5045"), checkLanIp]
            }
        },
        submitHandler: function() {
            var action = {};

            action = UCMGUI.formSerializeVal(document);
            action["isbind"] = "yes";

            if (mode === "add") {
                action["action"] = "addDHCPClient";
            } else {
                action["action"] = "updateDHCPClient";
                action["mac"] = mac;
            }

            updateOrAddDhcpClient(action);
        }
    });
}

function updateOrAddDhcpClient(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#dhcp-client-list", mWindow.document).trigger('reloadGrid');
                    }
                });
            }
        }
    });
}
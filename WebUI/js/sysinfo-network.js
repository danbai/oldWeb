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
    baseServerURl = config.paths.baseServerURl;

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG586"));

    $.ajax({
        type: "GET",
        dataType: "json",
        url: "/cgi?action=getNetworkInformation",
        error: function() {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: $P.lang("LANG909")
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var LIST = ["lan", "wan", "lan1", "lan2", "vpn", "vpn1", "hdlc1"],
                    hasVPN = ('vpn' in data.response) ? true : false,
                    hasWebRTCVPN = ('vpn1' in data.response) ? true : false;

                LIST.each(function(val) {
                    var mode = data.response[val];

                    if (mode) {
                        $("#" + val).show();

                        if (mode.ip) {
                            $("#" + val + "_ip").html(mode.ip);
                        } else {
                            $("#" + val + "_ip").html($P.lang("LANG2279").format($P.lang("LANG155")));
                            $("#" + val + "_ip").attr("locale", "LANG2279 LANG155");
                        }
                        if (mode.ipv6) {
                            $("#" + val + "_ipv6").html(mode.ipv6);
                        } else {
                            $("#" + val + "_ipv6").parent().parent().hide();
                        }
                        if (mode.ipv6_link) {
                            $("#" + val + "_ipv6_link").html(mode.ipv6_link);
                        } else {
                            $("#" + val + "_ipv6_link").parent().parent().hide();
                        }
                        if (mode.mac) {
                            var mac = mode.mac.split('');

                            $("#" + val + "_mac").html(mac[0] + mac[1] + ":" + mac[2] + mac[3] + ":" + mac[4] + mac[5] + ":" + mac[6] + mac[7] + ":" + mac[8] + mac[9] + ":" + mac[10] + mac[11]);
                        }

                        if (mode.route) {
                            $("#" + val + "_route").html(mode.route);
                        } else {
                            $("#" + val + "_route_div").hide();
                        }

                        if (mode.mask) {
                            $("#" + val + "_mask").html(mode.mask);
                        } else {
                            $("#" + val + "_mask").html($P.lang("LANG2279").format($P.lang("LANG157")));
                            $("#" + val + "_mask").attr("locale", "LANG2279 LANG157");
                        }

                        if (mode.ptp) {
                            $("#" + val + "_ptp").html(mode.ptp);
                        } else {
                            $("#" + val + "_ptp_div").hide();
                        }

                        if (mode.gateway) {
                            $("#" + val + "_gateway").html(mode.gateway);
                        } else {
                            $("#" + val + "_gateway_div").hide();
                        }

                        if (mode.dns) {
                            $("#" + val + "_dns").html(mode.dns);
                        } else {
                            $("#" + val + "_dns_div").hide();
                        }
                    } else {
                        $("#" + val).hide();
                    }
                });

                if (hasVPN || hasWebRTCVPN) {
                    var message = $P.lang('LANG4133');

                    if (hasVPN && hasWebRTCVPN) {
                        message = message.format('VPN && WebRTC VPN');
                    } else if (hasVPN) {
                        message = message.format('VPN');
                    } else {
                        message = message.format('WebRTC VPN');                        
                    }

                    top.dialog.dialogMessage({
                        type: 'loading',
                        content: message
                    });

                    setTimeout(function() {
                        if (hasVPN) {
                            checkVPNConnect();
                        }

                        if (hasWebRTCVPN) {
                            setTimeout(function() {
                                checkWebRTCVPNConnect();
                            }, 500);
                        }
                    }, 1000);
                }
            }
        }
    });
});

/* 
 * Pengcheng Zou Added. Check VPN connection status.
 */
function checkVPNConnect() {
    $.ajax({
        url: '../cgi',
        type: "POST",
        // async: false,
        dataType: "json",
        data: {
            'action': 'checkVPNConnect'
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var data = eval(data);

            if (data.status === 0) {
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: "VPN: " + $P.lang("LANG1302")
                });

                $('#VPNTitle').append('<span style="margin-left: 10px; color: green;" locale="LANG1302">' + $P.lang('LANG1302') + '</span>');
            } else {
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'error',
                    content: "VPN: " + $P.lang("LANG4441")
                });

                $('#VPNTitle').append('<span style="margin-left: 10px; color: #ef8700;" locale="LANG4441">' + $P.lang('LANG4441') + '</span>');
            }
        }
    });
}

function checkWebRTCVPNConnect() {
    $.ajax({
        url: '../cgi',
        type: "POST",
        // async: false,
        dataType: "json",
        data: {
            'action': 'checkWebRTCVPNConnect'
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var data = eval(data);

            if (data.status === 0) {
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: "WebRTC VPN: " + $P.lang("LANG1302")
                });

                $('#VPN1Title').append('<span style="margin-left: 10px; color: green;" locale="LANG1302">' + $P.lang('LANG1302') + '</span>');
            } else {
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'error',
                    content: "WebRTC VPN: " + $P.lang("LANG4441")
                });

                $('#VPN1Title').append('<span style="margin-left: 10px; color: #ef8700;" locale="LANG4441">' + $P.lang('LANG4441') + '</span>');
            }
        }
    });
}
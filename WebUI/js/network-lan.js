/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = config.paths.baseServerURl,
    interfaceObj = { // Pengcheng Zou Added.
        '0': 'eth1',
        '1': 'eth0',
        '2': {
            'LAN1': 'eth0',
            'LAN2': 'eth1'
        }
    },
    lasInterface = '', // Pengcheng Zou Added.
    methodVal = '',
    rejectAll = '',
    flag = false,
    sOldGateway = '';

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2217"));
    initValidator(); 
    initNetwork();

    loadTypicalSettings();

    $("#dhcp_enable").bind("click", function(ev) {
        DhcpSwitch();

        ev.stopPropagation();
    });

    $("#dhcp6_enable").bind("click", function(ev) {
        Dhcp6Switch();

        ev.stopPropagation();
    });
    $.navSlide(true, false, '.command', true);
    top.Custom.init(document);
});

var inSameNetworkSegment = function(ip1, ip2, submask, mask, str) {
    var res = true;

    if ((ip2 == "dhcp_gateway" && $("#dhcp_enable").is(":checked")) || str == "other") {
        var tenTotwo = function(str) {
            str = parseInt(str, 10).toString(2);

            for (i = str.length; i < 8; i = str.length) {
                str = "0" + str;
            }

            return str;
        };
        ip1 = $("#" + ip1).val().split(".");
        ip2 = $("#" + ip2).val().split(".");
        submask = $("#" + submask).val().split(".");
        mask = $("#" + mask).val().split(".");

        ip1 = tenTotwo(ip1[0]) + tenTotwo(ip1[1]) + tenTotwo(ip1[2]) + tenTotwo(ip1[3]);
        ip2 = tenTotwo(ip2[0]) + tenTotwo(ip2[1]) + tenTotwo(ip2[2]) + tenTotwo(ip2[3]);
        submask = tenTotwo(submask[0]) + tenTotwo(submask[1]) + tenTotwo(submask[2]) + tenTotwo(submask[3]);
        mask = tenTotwo(mask[0]) + tenTotwo(mask[1]) + tenTotwo(mask[2]) + tenTotwo(mask[3]);

        ip1 = ip1.split("");
        ip2 = ip2.split("");
        submask = submask.split("");
        mask = mask.split("");

        for (i = 0; i < 32; i++) {
            if ((ip1[i] & submask[i]) != (ip2[i] & mask[i])) {
                res = false;
                break;
            }
        }  
    }

    return res;
};

var isRightIP = function(id) {
    var ip = $("#" + id).val().split(".");

    var ret = true;

    if (ip[0] == "127" || ip[0] >= 224 || ip[3] == 0) {
        ret = false;
    }

    return ret;
};

var isRightClass = function(ipclass, ip, mask) {

    var ret = true;

    var ip = $("#" + ip).val().split(".");
    var mask = $("#" + mask).val();

    /* Class A IP address */
    if (ip[0] <= 126 && ipclass == "A") {
        ret = /^255.*$/.test(mask);
    }
    /* Class B IP address */
    else if (ip[0] >= 128 && ip[0] <= 191 && ipclass == "B") {
        ret = /^255.255.*$/.test(mask);
    }
    /* Class C IP address */
    else if (ip[0] >= 192 && ip[0] <= 223 && ipclass == "C") {
        ret = /^255.255.255.*$/.test(mask);
    }

    return ret;
};

var loadTypicalSettings = function() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'getTypicalFirewallSettings'
        },
        async: false,
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
                var firewallSettings = data.response.typical_firewallsettings;

                rejectAll = (firewallSettings && firewallSettings.reject_all) ? firewallSettings.reject_all : 'no';
            }
        }
    });
};

function checkDnsServer(val, ele) {
    if (val === '0.0.0.0' || val === '::') {
        return false;
    }

    return true;
}

function checkDHCPPrefix (val, ele) {

    var reg = /^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:)$|^([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:)$|^([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:)$|^([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:)$|^([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?$|^([0-9a-fA-F]{1,4}:){6}:$/;
    return reg.test(val);
}

function checkPrefixNoFourDigits(val, ele) {
    var arr = val.split(":"),
        noEmptyLen = 0;

    arr.each(function (item) {
        if (item != "") {
            noEmptyLen++;
        }
    });

    if (noEmptyLen <= 4 && arr[arr.length-1] == "" && arr[arr.length-2] == "") {
        return true;
    }
    return false;
}

function checkSpecialIPv6(val, ele) {
    var arr = ["::", "::1", "FF00::", "FE80::"];

    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        
        if (val == item || val == ("[" + item + "]")) {
            return false;
        } 
    };

    return true;
}

function checkPrefixLen(val, ele) {
    var dhcp6PrefixVal = $("#dhcp6_prefix").val();

    var arr = dhcp6PrefixVal.split(":"),
        noEmptyLen = 0;

    arr.each(function (item) {
        if (item != "") {
            noEmptyLen++;
        }
    });
    if (val < (noEmptyLen * 16)) {
        return false;
    }
    return true;
}

function checkL1PrefixLen(val, ele) {
    var dhcp6PrefixVal = $("#lan1_ipaddr6").val();

    var arr = dhcp6PrefixVal.split(":"),
        noEmptyLen = 0;

    arr.each(function (item) {
        if (item != "") {
            noEmptyLen++;
        }
    });
    if (val < (noEmptyLen * 16)) {
        return false;
    }
    return true;
}
function checkL2PrefixLen(val, ele) {
    var dhcp6PrefixVal = $("#lan2_ipaddr6").val();

    var arr = dhcp6PrefixVal.split(":"),
        noEmptyLen = 0;

    arr.each(function (item) {
        if (item != "") {
            noEmptyLen++;
        }
    });
    if (val < (noEmptyLen * 16)) {
        return false;
    }
    return true;
}
function checkIPV6SameNetworkSegment(val, ele) {
    var dhcp6PrefixVal = $("#dhcp6_prefix").val(),
        dhcp6PrefixValArr = dhcp6PrefixVal.split(":"),
        valArr = val.split(":"),
        flag = true;
    
    for (var i = 0; i < dhcp6PrefixValArr.length - 1; i++) {
        if (dhcp6PrefixValArr[i] != valArr[i]) {
            flag = false;
            break;
        }
    }

    if (val.indexOf(dhcp6PrefixVal) == -1) {
        flag = false;
    }
    
    return flag;
}
function initValidator() {
    var preip_gateway = $('#dhcp_ipaddr'),
        preip_start = $('#ipfrom');

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            altdns: {
                ipv4Dns: [$P.lang("LANG579")],
                customCallback: [$P.lang("LANG4442"), checkDnsServer]
            },
            mtu: {
                digits: true,
                range: [1280, 1500]
            },
            lan1_gateway: {
                required: true,
                ipDnsSpecial: [$P.lang("LANG156")]
            },
            lan1_submask: {
                required: true,
                mask: [$P.lang("LANG157")]
            },
            lan1_ipaddr: {
                required: true,
                ipDnsSpecial: ["IP"],
                customCallback1: [$P.lang("LANG2176"),
                    function() {
                        if ($(".LAN2")[0].style.display != "none") {
                            return inSameNetworkSegment("lan1_ipaddr", "lan1_gateway", "lan1_submask", "lan1_submask", "other");
                        } else {
                            return true;
                        }
                    }
                ],
                customCallback: [$P.lang("LANG2430"),
                    function() {
                        if ($("#lan1")[0].style.display != "none" && $("#lan1_ip_method").val() == "1" && $("#lan2_ip_method").val() == "1") {
                            return !inSameNetworkSegment("lan1_ipaddr", "lan2_ip", "lan1_submask", "lan2_mask", "other");
                        } else {
                            return true;
                        }
                    }
                ]
            },
            dns1: {
                required: true,
                ipv4Dns: [$P.lang("LANG579")],
                customCallback: [$P.lang("LANG4442"), checkDnsServer]
            },
            dns2: {
                ipv4Dns: [$P.lang("LANG579")],
                customCallback: [$P.lang("LANG4442"), checkDnsServer]
            },
            dhcp6_prefix: {
                required: true,
                customCallback: [$P.lang("LANG5164"), checkDHCPPrefix],
                customCallback1: [$P.lang("LANG5241"), checkPrefixNoFourDigits]
            },
            ip6_prefixlen: {
                digits: true,
                range: [1, 64],
                customCallback1: [$P.lang("LANG5248"), checkPrefixLen]
            },
            lan1_ip6_prefixlen: {
                digits: true,
                range: [1, 64]//,
                //customCallback1: [$P.lang("LANG5248"), checkL1PrefixLen]
            },
            lan2_ip6_prefixlen: {
                digits: true,
                range: [1, 64]//,
                //customCallback1: [$P.lang("LANG5248"), checkL2PrefixLen]
            },
            ipaddr6: {
                required: true,
                ipv6Dns: [$P.lang("LANG5130")],
                customCallback: [$P.lang("LANG2196"), checkSpecialIPv6]
            },
            ipv6Dns1: {
                required: true,
                ipv6Dns: [$P.lang("LANG579")],
                customCallback: [$P.lang("LANG4442"), checkDnsServer]
            },
            ipv6Dns2: {
                ipv6Dns: [$P.lang("LANG579")],
                customCallback: [$P.lang("LANG5164"), checkDnsServer]
            },
            lan1_username: {
                required: true,
                maxlength: 64,
                keyboradNoSpaceSpecial: true
            },
            lan1_password: {
                required: true,
                maxlength: 64,
                pppoeSecret: true
            },
            lan1_vid: {
                digits: true,
                customCallback: [$P.lang("LANG2524"),
                    function(value) {
                        var val = Number(value);

                        if (val == 0 || val > 1 && val <= 4094) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                ]
            },
            lan1_priority: {
                digits: true,
                range: [0, 7]
            },
            dhcp_ipaddr: {
                required: true,
                ipDnsSpecial: ["IP"],
                customCallback1: [$P.lang("LANG2166").format("IP"),
                    function() {
                        return isRightIP("dhcp_ipaddr");
                    }
                ],
                customCallback2: [$P.lang("LANG2176"),
                    function() {
                        return inSameNetworkSegment("dhcp_ipaddr", "dhcp_gateway", "dhcp_submask", "dhcp_submask");
                    }
                ],
                customCallback: [$P.lang("LANG2430"),
                    function() {
                        if ($("#lan1_ip_method").val() == "1") {
                            return !inSameNetworkSegment("lan1_ipaddr", "dhcp_ipaddr", "lan1_submask", "dhcp_submask", "other");
                        } else {
                            return true;
                        }
                    }
                ]
            },
            dhcp_submask: {
                required: true,
                mask: [$P.lang("LANG157")],
                customCallback: [$P.lang("LANG3035").format("A", "8"),
                    function() {
                        return isRightClass("A", "dhcp_ipaddr", "dhcp_submask");
                    }
                ],
                customCallback1: [$P.lang("LANG3035").format("B", "16"),
                    function() {
                        return isRightClass("B", "dhcp_ipaddr", "dhcp_submask");
                    }
                ],
                customCallback2: [$P.lang("LANG3035").format("C", "24"),
                    function() {
                        return isRightClass("C", "dhcp_ipaddr", "dhcp_submask");
                    }
                ]
            },
            lan2_gateway: {
                required: true,
                ipDnsSpecial: [$P.lang("LANG156")]
            },
            lan2_mask: {
                required: true,
                mask: [$P.lang("LANG157")]
            },
            lan2_ip: {
                required: true,
                ipDnsSpecial: ["IP"],
                customCallback: [$P.lang("LANG2176"),
                    function() {
                        if ($(".LAN1")[0].style.display != "none") {
                            return inSameNetworkSegment("lan2_ip", "lan2_gateway", "lan2_mask", "lan2_mask", "other");
                        } else {
                            return true;
                        }
                    }
                ]
            },
            lan2_dns1: {
                required: true,
                ipv4Dns: [$P.lang("LANG579")]
            },
            lan2_dns2: {
                ipv4Dns: [$P.lang("LANG579")]
            },
            lan2_ip6_dns1: {
                required: true,
                ipv6Dns: [$P.lang("LANG579")]
            },
            lan2_ip6_dns2: {
                ipv6Dns: [$P.lang("LANG579")]
            },
            lan2_username: {
                required: true,
                maxlength: 64,
                keyboradNoSpace: true
            },
            lan2_password: {
                required: true,
                maxlength: 64,
                pppoeSecret: true
            },
            lan2_vid: {
                digits: true,
                customCallback: [$P.lang("LANG2524"),
                    function(value) {
                        var val = Number(value);

                        if (val == 0 || val > 1 && val <= 4094) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                ]
            },
            lan2_priority: {
                digits: true,
                range: [0, 7]
            },
            ipfrom: {
                required: true,
                ipDnsSpecial: ["IP"],
                checkSameNetworkSegment: [$('#dhcp_gateway'), $('#dhcp_submask')]
            },
            ipto: {
                required: true,
                ipDnsSpecial: ["IP"],
                checkSameNetworkSegment: [$('#dhcp_gateway'), $('#dhcp_submask')],
                strbigger: [$P.lang("LANG1921"), $P.lang("LANG1919"), preip_start],
                customCallback: [$P.lang("LANG2429").format($P.lang("LANG1915"), $P.lang("LANG1919"), $P.lang("LANG1921")),
                    function() {
                        return !($("#dhcp_ipaddr").val() == $("#ipfrom").val() && ($("#dhcp_ipaddr").val() == $("#ipto").val()));
                    }
                ]
            },
            ipleasetime: {
                required: true,
                digits: true,
                range: [300, 172800]
            },
            ip6from: {
                required: true,
                ipv6Dns: ["IP"],
                customCallback: [$P.lang("LANG2196"), checkSpecialIPv6],
                customCallback: [$P.lang("LANG5258").format($P.lang("LANG1919")), checkIPV6SameNetworkSegment]
            },
            ip6to: {
                required: true,
                ipv6Dns: ["IP"],
                customCallback: [$P.lang("LANG2196"), checkSpecialIPv6],
                customCallback: [$P.lang("LANG5258").format($P.lang("LANG1921")), checkIPV6SameNetworkSegment]
            },
            ip6leasetime: {
                required: true,
                digits: true,
                range: [300, 172800]
            },
            dhcp_gateway: {
                required: true,
                ipDnsSpecial: [$P.lang("LANG156")],
                customCallback1: [$P.lang("LANG2166").format($P.lang("LANG156")),
                    function() {
                        return isRightIP("dhcp_gateway");
                    }
                ],
            }
        },
        //newValidator: true,
        submitHandler: function() {
            save_changes();
        }
    });
}

function load_network(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var response = data.response,
            netSettings = response.network_settings,
            dhcpSettings = response.dhcp_settings,
            dhcp6Settings = response.dhcp6_settings;

        methodVal = (netSettings["method"] || "1");

        var ipMethodVal = (netSettings["lan1_ip_method"] || "0"),
            mtuVal = netSettings["mtu"],
            ipsVal = (netSettings["lan1_ipaddr"] || "0.0.0.0"),
            maskVal = (netSettings["lan1_submask"] || "0.0.0.0"),
            gatewayVal = (netSettings["lan1_gateway"] || "0.0.0.0"),
            dns1Val = (netSettings["lan1_dns1"] || "0.0.0.0"),
            dns2Val = (netSettings["lan1_dns2"] || "0.0.0.0"),
            defaultInterface = (netSettings["default_interface"] || "LAN2");

        $("#method").val(methodVal);
        $("#mtu").val(mtuVal);
        $("#lan1_ip_method").val(ipMethodVal);
        $("#lan1_ipaddr").val(ipsVal);
        $("#lan1_submask").val(maskVal);
        $("#lan1_gateway").val(gatewayVal);
        $("#lan1_dns1").val(dns1Val);
        $("#lan1_dns2").val(dns2Val);

        if ($("#lan1_dns2").val() == "0.0.0.0") {
            $("#lan1_dns2").val("");
        }

       var ip6MethodVal = (netSettings["lan1_ip6_method"] || "0"),
            lan1Ipaddr6 = netSettings["lan1_ipaddr6"],
            dns1Val6 = netSettings["lan1_ip6_dns1"],
            dns2Val6 = netSettings["lan1_ip6_dns2"],
            lan1Ip6Prefixlen = netSettings["lan1_ip6_prefixlen"];
            dhcp6Prefix = (dhcp6Settings["dhcp6_prefix"] || "64");
            dhcp6Prefixlen = dhcp6Settings["dhcp6_prefixlen"];

        $("#lan1_ip6_method").val(ip6MethodVal);
        $("#lan1_ipaddr6").val(lan1Ipaddr6);
        $("#lan1_ip6_dns1").val(dns1Val6);
        $("#lan1_ip6_dns2").val(dns2Val6);
        $("#lan1_ip6_prefixlen").val(lan1Ip6Prefixlen);
        $("#dhcp6_prefix").val(dhcp6Prefix);
        $("#dhcp6_prefixlen").val(dhcp6Prefixlen);

        // if ($("#lan1_ip6_dns2").val() == "::") {
        //     $("#lan1_ip6_dns2").val("");
        // }

        var altdnsVal = netSettings["altdns"] || "0.0.0.0";

        $("#altdns").val(altdnsVal);

        if ($("#altdns").val() == "0.0.0.0") {
            $("#altdns").val("");
        }

        // $("#lan1_username").val(decodeURIComponent(netSettings["lan1_username"] || ""));
        // $("#lan1_password").val(decodeURIComponent(netSettings["lan1_password"] || ""));
        $("#lan1_username").val(netSettings["lan1_username"] || "");
        $("#lan1_password").val(netSettings["lan1_password"] || "");

        $("#lan1_vid").val(netSettings["lan1_vid"] || "");
        $("#lan1_priority").val(netSettings["lan1_priority"] || "");

        if (Number(config.model_info.num_eth) >= 2) {
            $("#lan2_ip_method").val(netSettings["lan2_ip_method"] || "0");
            $("#default_interface").val(defaultInterface);
            $("#lan2_ip").val(netSettings["lan2_ip"] || "");
            $("#lan2_mask").val(netSettings["lan2_mask"] || "");
            $("#lan2_gateway").val(netSettings["lan2_gateway"] || "");
            $("#lan2_dns1").val(netSettings["lan2_dns1"] || "");
            $("#lan2_dns2").val(netSettings["lan2_dns2"] || "");
            // $("#lan2_username").val(decodeURIComponent(netSettings["lan2_username"] || ""));
            // $("#lan2_password").val(decodeURIComponent(netSettings["lan2_password"] || ""));
            $("#lan2_username").val(netSettings["lan2_username"] || "");
            $("#lan2_password").val(netSettings["lan2_password"] || "");
            $("#lan2_vid").val(netSettings["lan2_vid"] || "");
            $("#lan2_priority").val(netSettings["lan2_priority"] || "");

            $("#lan2_ip6_method").val(netSettings["lan2_ip6_method"] || "0");

            $("#lan2_ip6_prefixlen").val(netSettings["lan2_ip6_prefixlen"] || "");
            $("#lan2_ipaddr6").val(netSettings["lan2_ipaddr6"] || "");
            $("#lan2_ip6_dns1").val(netSettings["lan2_ip6_dns1"] || "");
            $("#lan2_ip6_dns2").val(netSettings["lan2_ip6_dns2"] || "");

            if (config.model_info.allow_nat == "1") {
                $("#dhcp_submask").val(dhcpSettings["dhcp_submask"] || "");
                $("#dhcp_ipaddr").val(dhcpSettings["dhcp_ipaddr"] || "");
                $("#dhcp_enable").attr("checked", netSettings["dhcp_enable"] == 1 ? true : false);
                $("#dhcp_dns1").val(dhcpSettings["dhcp_dns1"] || "");
                $("#dhcp_dns2").val(dhcpSettings["dhcp_dns2"] || "");
                $("#ipfrom").val(dhcpSettings["ipfrom"] || "");
                $("#ipto").val(dhcpSettings["ipto"] || "");
                $("#dhcp_gateway").val(dhcpSettings["dhcp_gateway"] || "");
                $("#ipleasetime").val(dhcpSettings["ipleasetime"] || "43200");

                sOldGateway = dhcpSettings['dhcp_gateway'] || '';
                $("#dhcp6_enable").val(netSettings["dhcp6_enable"]);
                $("#dhcp6_prefix").val(dhcp6Settings["dhcp6_prefix"]);
                $("#dhcp6_prefixlen").val(dhcp6Settings["dhcp6_prefixlen"]);
                $("#dhcp6_dns1").val(dhcp6Settings["dhcp6_dns1"] || "");
                $("#dhcp6_dns2").val(dhcp6Settings["dhcp6_dns2"] || "");
                $("#ip6from").val(dhcp6Settings["ip6from"] || "");
                $("#ip6to").val(dhcp6Settings["ip6to"] || "");
                $("#ip6leasetime").val(dhcp6Settings["ip6leasetime"] || "43200");

                DhcpSwitch();
                Dhcp6Switch();
            }
        }

        ipMethodSwitch();
        ipv6MethodSwitch();
        NetworkMethodSwitch();
        // check_interface();

        /* 
         * Pengcheng Zou Added. Check if the port is eth0 or eth1.
         */
        if (methodVal === '2') {
            lasInterface = interfaceObj[methodVal][defaultInterface];
        } else {
            lasInterface = interfaceObj[methodVal];
        }
    }
}

function initNetwork() {
    document.getElementById("method").options.length = 0;

    if (Number(config.model_info.num_eth) >= 2) {
        $("#mode_div").show();

        $("<option>").attr({
            value: 1,
            locale: "LANG551"
        }).text($P.lang("LANG551")).appendTo('#method');

        $("<option>").attr({
            value: 2,
            locale: "LANG2219"
        }).text($P.lang("LANG2219")).appendTo('#method');

        if (config.model_info.allow_nat == "1") {
            $("<option>").attr({
                value: 0,
                locale: "LANG550"
            }).text($P.lang("LANG550")).appendTo('#method');
        }
    } else {
        $("#mode_div").hide();
    }

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getNetworkSettings"
        },
        success: load_network
    });

}

function ipMethodSwitch() {
    var sval = $("#lan1_ip_method").val();

    if (sval == "0") {
        $("#divStatic").hide();
        $("#divPPPoE").hide();
        $("#divDHCP").show();
    } else if (sval == "1") {
        $("#divStatic").show();
        $("#divPPPoE").hide();
        $("#divDHCP").hide();
    } else {
        $("#divStatic").hide();
        $("#divPPPoE").show();
        $("#divDHCP").hide();
    }

    var sval = $("#lan2_ip_method").val();

    if (sval == "0") {
        $("#divStatic2").hide();
        $("#divPPPoE2").hide();
        $("#divDHCP2").show();
    } else if (sval == "1") {
        $("#divStatic2").show();
        $("#divPPPoE2").hide();
        $("#divDHCP2").hide();
    } else {
        $("#divStatic2").hide();
        $("#divPPPoE2").show();
        $("#divDHCP2").hide();
    }
}

function ipv6MethodSwitch() {
    var sval = $("#lan1_ip6_method").val();

    if (sval == "0") {
        $("#divIp6Static").hide();
    } else if (sval == "1") {
        $("#divIp6Static").show();
    } else {
        $("#divIp6Static").hide();
    }

    var sval = $("#lan2_ip6_method").val();

    if (sval == "0") {
        $("#div6Static2").hide();
    } else if (sval == "1") {
        $("#div6Static2").show();
    } else {
        $("#div6Static2").hide();
    }
}

function NetworkMethodSwitch() {
    var method = $("#method").val(),
        route = $("#route"),
        lan1 = $("#lan1"),
        titleWan = $("#title-wan"),
        titleLan2 = $("#title-lan2"),
        titleLan = $("#title-lan");

    var routeIp6 = $("#routeIp6"),
        lan1Ip6 = $("#lan1Ip6"),
        titleIp6Wan = $("#titleIp6-wan"),
        titleIp6Lan2 = $("#titleIp6-lan2"),
        titleIp6lan = $("#titleIp6-lan");

    var  defaultLan = $("#default_lan");

    if (method == "0") {
        if (!$("#dhcp_enable").is(":checked") && methodVal != "0") {
            $("#dhcp_enable").trigger("click");
        }
        if ($("#dhcp6_enable").val() != "0" && methodVal != "0") {
            $("#dhcp6_enable").trigger("click");
        }

        route.show();
        lan1.hide();
        titleWan.show();
        titleLan2.hide();
        titleLan.hide();

        routeIp6.show();
        lan1Ip6.hide();
        titleIp6Wan.show();
        titleIp6Lan2.hide();
        titleIp6lan.hide();

        defaultLan.hide();
        $('#lan2Qos').appendTo(route);
    } else if (method == "2") {
        route.hide();
        lan1.show();
        titleWan.hide();
        titleLan2.show();
        titleLan.hide();

        routeIp6.hide();
        lan1Ip6.show();
        titleIp6Wan.hide();
        titleIp6Lan2.show();
        titleIp6lan.hide();

        defaultLan.show();
        $('#lan2Qos').appendTo(lan1);
    } else {
        route.hide();
        lan1.hide();
        titleWan.hide();
        titleLan2.hide();
        titleLan.show();

        routeIp6.hide();
        lan1Ip6.hide();
        titleIp6Wan.hide();
        titleIp6Lan2.hide();
        titleIp6lan.show();

        defaultLan.hide();
    }

    check_interface();
}

function DhcpSwitch() {
    var checked = !$("#dhcp_enable").is(":checked");

    $("#dhcp_dns1, #dhcp_dns2, #ipfrom, #ipto, #dhcp_gateway, #ipleasetime").attr("disabled", checked);

    //top.Custom.init(document);
}

function Dhcp6Switch() {
    var dhcp6EnableVal = $("#dhcp6_enable").val();
    var ip6checked = (dhcp6EnableVal == 0);

    if (dhcp6EnableVal == 1) {
        $("#ip6from_div, #ip6to_div, #ip6leasetime_div").hide();
    } else {
        $("#ip6from_div, #ip6to_div, #ip6leasetime_div").show();
    }
    $("#dhcp6_prefix, #dhcp6_prefixlen, #dhcp6_dns1, #dhcp6_dns2, #ip6from, #ip6to, #ip6leasetime").attr("disabled", ip6checked);

    //top.Custom.init(document);
}

function save_changes() {
    var method = $("#method").val();

    if (method === '0') {
        var aOldGateway = sOldGateway.split('\.'),
            aNewGateWay = $('#dhcp_gateway').val().split('\.');

        if (aOldGateway[0] !== aNewGateWay[0] || aOldGateway[1] !== aNewGateWay[1] || aOldGateway[2] !== aNewGateWay[2]) {
            $.ajax({
                url: baseServerURl,
                type: "GET",
                data: {
                    action: "checkIfHasMacBind"
                },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);

                    if (bool) {
                        var bBind = (data.response.hasbind === 'yes');

                        if (bBind) {
                            top.dialog.dialogConfirm({
                                confirmStr: $P.lang("LANG5077"),
                                buttons: {
                                    ok: function() {
                                        $.ajax({
                                            url: baseServerURl,
                                            type: "GET",
                                            data: {
                                                action: "deleteBatchDHCPClient",
                                                mac: 'ALL',
                                                isbind: 'no'
                                            },
                                            success: function(data) {
                                                var bool = UCMGUI.errorHandler(data);

                                                if (bool) {
                                                    top.dialog.dialogMessage({
                                                        type: 'success',
                                                        content: $P.lang("LANG5078"),
                                                        callback: function() {
                                                            saveChangeCallback();
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    },
                                    cancel: function() {
                                        top.dialog.clearDialog();
                                    }
                                }
                            });
                        } else {
                            saveChangeCallback();
                        }
                    }
                }
            });
        } else {
            saveChangeCallback();
        }
    } else {
        saveChangeCallback();
    }

    function saveChangeCallback() {
        flag = false;

        if (checkIfRejectRules(method)) {
            var buf = {},
                defaultInterface = $("#default_interface").val();

            buf["action"] = "updateNetworkSettings";
            buf["altdns"] = $("#altdns").val() || '0.0.0.0';
            buf["mtu"] = $("#mtu").val();

            if (Number(config.model_info.num_eth) >= 2) {
                buf["method"] = method;

                if (config.model_info.allow_nat == "1") {
                    flag = true;
                    // save_dhcp();
                }

                if (method == "0") {
                    buf["dhcp_ipaddr"] = $("#dhcp_ipaddr").val();
                    buf["dhcp_submask"] = $("#dhcp_submask").val();
                    buf["lan2_vid"] = $("#lan2_vid").val();
                    buf["lan2_priority"] = $("#lan2_priority").val();
                } else if (method == "2") {
                    var sval = $("#lan2_ip_method").val(),
                        s6val = $("#lan2_ip6_method").val();

                    buf["default_interface"] = defaultInterface;
                    buf["lan2_ip_method"] = sval;
                    buf["lan2_ip6_method"] = s6val;

                    if (sval == "1") {
                        buf["lan2_ip"] = $("#lan2_ip").val();
                        buf["lan2_mask"] = $("#lan2_mask").val();
                        buf["lan2_gateway"] = $("#lan2_gateway").val();
                        buf["lan2_dns1"] = $("#lan2_dns1").val();
                        buf["lan2_dns2"] = $("#lan2_dns2").val();
                    } else if (sval == "2") {
                        // buf["lan2_username"] = encodeURIComponent($("#lan2_username").val());
                        // buf["lan2_password"] = encodeURIComponent($("#lan2_password").val());
                        buf["lan2_username"] = $("#lan2_username").val();
                        buf["lan2_password"] = $("#lan2_password").val();
                    }

                    buf["lan2_vid"] = $("#lan2_vid").val();
                    buf["lan2_priority"] = $("#lan2_priority").val();

                    if (s6val == "1") {
                        buf["lan2_ipaddr6"] = $("#lan2_ipaddr6").val();
                        buf["lan2_ip6_dns1"] = $("#lan2_ip6_dns1").val();
                        buf["lan2_ip6_dns2"] = $("#lan2_ip6_dns2").val();
                        buf["lan2_ip6_prefixlen"] = $("#lan2_ip6_prefixlen").val();
                    }
                }
            }
            sval = $("#lan1_ip_method").val();
            s6val = $("#lan1_ip6_method").val();
            if (sval == "0") {
                buf["lan1_ip_method"] = "0";
            } else if (sval == "1") {
                buf["lan1_ip_method"] = "1";
                buf["lan1_ipaddr"] = $("#lan1_ipaddr").val();
                buf["lan1_submask"] = $("#lan1_submask").val();
                buf["lan1_gateway"] = $("#lan1_gateway").val();
                buf["lan1_dns1"] = $("#lan1_dns1").val();
                buf["lan1_dns2"] = $("#lan1_dns2").val() || '0.0.0.0';
            } else {
                buf["lan1_ip_method"] = "2";
                // buf["lan1_username"] = encodeURIComponent($("#lan1_username").val());
                // buf["lan1_password"] = encodeURIComponent($("#lan1_password").val());
                buf["lan1_username"] = $("#lan1_username").val();
                buf["lan1_password"] = $("#lan1_password").val();
            }

            buf["lan1_vid"] = $('#lan1_vid').val();
            buf["lan1_priority"] = $("#lan1_priority").val();

            if (s6val == "0") {
                buf["lan1_ip6_method"] = "0";
            } else if (s6val == "1") {
                buf["lan1_ip6_method"] = "1";
                buf["lan1_ipaddr6"] = $("#lan1_ipaddr6").val();
                buf["lan1_ip6_dns1"] = $("#lan1_ip6_dns1").val();
                buf["lan1_ip6_dns2"] = $("#lan1_ip6_dns2").val();
                buf["lan1_ip6_prefixlen"] = $("#lan1_ip6_prefixlen").val() || '64';
            }

            if (flag) {
                var dhcpenable = (($("#dhcp_enable").is(":checked") && ($("#method").val() == "0")) ? 1 : 0),
                    dhcp6enable = (($("#dhcp6_enable").val() != 0 && ($("#method").val() == "0")) ? $("#dhcp6_enable").val() : 0);

                buf["dhcp_enable"] = dhcpenable;
                buf["dhcp6_enable"] = dhcp6enable;

                if (dhcpenable) {
                    buf["dhcp_ipaddr"] = $("#dhcp_ipaddr").val();
                    buf["dhcp_submask"] = $("#dhcp_submask").val();
                    buf["dhcp_dns1"] = $("#dhcp_dns1").val();
                    buf["dhcp_dns2"] = $("#dhcp_dns2").val();
                    buf["ipfrom"] = $("#ipfrom").val();
                    buf["ipto"] = $("#ipto").val();
                    buf["dhcp_gateway"] = $("#dhcp_gateway").val();
                    buf["ipleasetime"] = $("#ipleasetime").val();
                }

                if (dhcp6enable) {
                    buf["dhcp6_dns1"] = $("#dhcp6_dns1").val();
                    buf["dhcp6_dns2"] = $("#dhcp6_dns2").val();
                    buf["ip6from"] = $("#ip6from").val();
                    buf["ip6to"] = $("#ip6to").val();

                    var dhcp6PrefixVal = $("#dhcp6_prefix").val();
                    var dhcp6PrefixlenVal = $("#dhcp6_prefixlen").val();

                    buf["dhcp6_prefix"] = dhcp6PrefixVal;
                    buf["dhcp6_prefixlen"] = dhcp6PrefixlenVal;
                    buf["lan2_ipaddr6"] = dhcp6PrefixVal;
                    buf["lan2_ip6_prefixlen"] = dhcp6PrefixlenVal;

                    buf["ip6leasetime"] = $("#ip6leasetime").val();
                }
            }

            $.ajax({
                type: "post",
                url: baseServerURl,
                data: buf,
                error: function(jqXHR, textStatus, errorThrown) {
                    top.dialog.clearDialog();

                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);

                    if (bool) {

                        /* 
                         * Pengcheng Zou Added. Check if need to set port.
                         */
                        var currentInterface = '';

                        if (method === '2') {
                            currentInterface = interfaceObj[method][defaultInterface];
                        } else {
                            currentInterface = interfaceObj[method];
                        }

                        if (lasInterface !== currentInterface) {
                            $.ajax({
                                type: "POST",
                                url: "../cgi",
                                async: false,
                                data: {
                                    'action': 'confPhddns',
                                    'nicName': currentInterface,
                                    'conffile': ''
                                },
                                error: function(jqXHR, textStatus, errorThrown) {},
                                success: function(data) {
                                    // var bool = UCMGUI.errorHandler(data);

                                    // if (bool) {}
                                }
                            });
                        }
                        /* -------- End -------- */

                        save_res();
                    }
                }
            });
        }
    }
}

function checkIfRejectRules(method) {
    if (methodVal === '1' && method !== '1' && rejectAll === 'yes') {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG4425"),
        });

        return false;
    } else {
        return true;
    }
}

function dhcp_res(res) {
    if (res != null && res.split('\r\n')[1] == "Update OK!") {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG927"),
            buttons: {
                ok: UCMGUI.loginFunction.confirmReboot,
                cancel: function() {
                    window.location.reload();
                }
            }
        });
    } else {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG861"),
            callback: function() {
                window.location.reload();
            }
        });
    }
}

function save_res(res) {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG927"),
        buttons: {
            ok: UCMGUI.loginFunction.confirmReboot,
            cancel: function() {
                top.dialog.clearDialog();
            }
        }
    });
}

function check_interface() {
    if ($("#method").val() == "2") {
        var def = $("#default_interface").val();

        if (def == "LAN1") {
            $(".LAN2").hide();
            $(".LAN1").show();
        } else {
            $(".LAN1").hide();
            $(".LAN2").show();
        }
    } else {
        $(".LAN2").show();
    }

    top.Custom.init(document);
}

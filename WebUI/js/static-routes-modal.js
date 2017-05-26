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
    modelInfo = config.model_info,
    num_pri = modelInfo.num_pri,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = config.paths.baseServerURl,
    mode = "",
    ipMode = '',
    isIpv6 = false,
    routeIndex = "",
    oldDest = "",
    oldNetmask = "",
    oldGateway = "",
    oldIface = "",
    oldActive = "",
    oldEnabled = "",
    ifaceModeVal = 1,
    nethdlcEnable = 0;

String.prototype.format = top.String.prototype.format;
String.prototype.contains = top.String.prototype.contains;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.indexOf = top.Array.prototype.indexOf;

$(function() {
    $P.lang(doc, true);

    mode = gup.call(window, "mode");

    ipMode = gup.call(window, "ipMode");
    isIpv6 = ipMode === 'Ipv6'; 

    if (isIpv6) {
        $('#div_netmask, #div_dest').hide();
    } else {
        $('#div_dest_ipv6').hide();
    }

    if (mode == 'edit') {
        routeIndex = gup.call(window, "routeIndex");

        getStaticRoute(routeIndex);
    } else {
        $('#div_enabled').hide();
    }

    getIfaceMode();

    initValidator();
});

function getIfaceMode() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getNetworkSettings"
        },
        success: loadNetwork
    });
}

function loadNetwork(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var netSettings = data.response.network_settings;

        ifaceModeVal = netSettings["method"];
        nethdlcEnable = netSettings["hdlc0_enable"];
    }

    var element = document.getElementById("route_iface");

    element.options.length = 0;

    element.value = oldIface;

    if (ifaceModeVal == 2) {
        $("<option>").attr({
            value: '0',
            locale: "LANG3059"
        }).text($P.lang("LANG3059")).appendTo('#route_iface');

        $("<option>").attr({
            value: '1',
            locale: "LANG3060"
        }).text($P.lang("LANG3060")).appendTo('#route_iface');
    } else if (ifaceModeVal == 0) {
        $("<option>").attr({
            value: '0',
            locale: "LANG3057"
        }).text($P.lang("LANG3057")).appendTo('#route_iface');

        $("<option>").attr({
            value: '1',
            locale: "LANG3058"
        }).text($P.lang("LANG3058")).appendTo('#route_iface');
    } else {
        $("<option>").attr({
            value: '0',
            locale: "LANG3057"
        }).text($P.lang("LANG3057")).appendTo('#route_iface');
    }

    if (num_pri > 0 && nethdlcEnable == 1) {
        $("<option>").attr({
            value: '2',
            locale: "LANG3572"
        }).text($P.lang("LANG3572")).appendTo('#route_iface');
    }

    if (mode === 'edit') {
        if (num_pri > 0) {
            if (ifaceModeVal === '1' && oldIface === '2') {
                element.selectedIndex = 1;
            } else if (ifaceModeVal === '1' && oldIface === '1') {
                element.selectedIndex = 0;
            } else {
                if (oldIface === '1') {
                    element.selectedIndex = 1;
                } else if (oldIface === '2') {
                    element.selectedIndex = 2;
                } else {
                    element.selectedIndex = 0;
                }
            }
        } else if (num_pri <= 0 && oldIface === '1') {
            element.selectedIndex = 1;
        }
    } else {
        element.selectedIndex = 0;
    }

    top.Custom.init(document);
}

function checkIsExist(val, ele) {
    var staticRoutes = mWindow.staticRoutes;
    var routeDestVal = $("#route_dest").val();
    var routeNetmaskVal = $("#route_netmask").val();
    var routeGatewayVal = $("#route_gateway").val();
    var routeIfaceVal = $("#route_iface").val();

    for (var i = 0; i < staticRoutes.length; i++) {
        var staticRoutesIndex = staticRoutes[i];
        if (staticRoutesIndex.route_dest == oldDest && staticRoutesIndex.route_iface == oldIface) {
            continue;
        }
        if (staticRoutesIndex.route_dest == routeDestVal && staticRoutesIndex.route_iface == routeIfaceVal) {
            return false;
        }
    }
    return true;
}

function checkIsExistIpv6(val, ele) {
    var staticRoutes = mWindow.staticRoutesIpv6;
    var routeDestVal = $("#route_dest_ipv6").val();
    var routeIfaceVal = $("#route_iface").val();

    for (var i = 0; i < staticRoutes.length; i++) {
        var staticRoutesIndex = staticRoutes[i];
        if (staticRoutesIndex.ipv6_route_dest == oldDest && staticRoutesIndex.ipv6_route_iface == oldIface) {
            continue;
        }
        if (staticRoutesIndex.ipv6_route_dest == routeDestVal && staticRoutesIndex.ipv6_route_iface == routeIfaceVal) {
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
            "route_dest": {
                required: true,
                ipv4: true,
                customCallback: [$P.lang("LANG5044"), checkIsExist]
            },
            "route_netmask": {
                required: false,
                specialIpAddress: true
            },
            "route_gateway": {
                required: false,
                ipAddress: true
            },
            "route_dest_ipv6": {
                required: true,
                ipv6withcidr: true,
                customCallback: [$P.lang("LANG5044"), checkIsExistIpv6]
            }
        },
        submitHandler: function() {
            var action = {};

            if (mode == "add") {
                if (isIpv6) {
                    action["action"] = "addIpv6StaticRoute";
                    action["ipv6_route_dest"] = $('#route_dest_ipv6').val();
                    action["ipv6_route_gateway"] = $('#route_gateway').val();
                    action["ipv6_route_iface"] = $('#route_iface').val();
                } else {
                    action = UCMGUI.formSerializeVal(document);
                    action["action"] = "addStaticRoute";
                }
            } else {
                if (isIpv6) {
                    action["action"] = "updateIpv6StaticRoute";
                    action["ipv6_route_enabled"] = ($('#route_enabled').is(":checked") ? 1 : 0);
                    action["ipv6_route_index"] = routeIndex;
                    action["ipv6_route_dest"] = $('#route_dest_ipv6').val();
                    action["ipv6_route_gateway"] = $('#route_gateway').val();
                    action["ipv6_route_iface"] = $('#route_iface').val();
                    action["ipv6_old_dest"] = oldDest;
                    action["ipv6_old_gateway"] = oldGateway;
                    action["ipv6_old_iface"] = oldIface;
                    action["ipv6_old_active"] = oldActive;
                    action["ipv6_old_enabled"] = oldEnabled;
                } else {
                    action = UCMGUI.formSerializeVal(document);
                    action["action"] = "updateStaticRoute";
                    action["route_enabled"] = ($('#route_enabled').is(":checked") ? 1 : 0);
                    action["route_index"] = routeIndex;
                    action["old_dest"] = oldDest;
                    action["old_netmask"] = oldNetmask;
                    action["old_gateway"] = oldGateway;
                    action["old_iface"] = oldIface;
                    action["old_active"] = oldActive;
                    action["old_enabled"] = oldEnabled;
                }
            }

            updateOrAddStaticRoutesInfo(action);
        }
    });
}

function updateOrAddStaticRoutesInfo(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG844"),
                    callback: function() {
                        if (isIpv6) {
                            mWindow.$("#ipv6-static-routes-list", mWindow.document).trigger('reloadGrid');
                            mWindow.listStaticRoutesIpv6();
                        } else {
                            mWindow.$("#static-routes-list", mWindow.document).trigger('reloadGrid');
                            //mWindow.getNameList();
                            mWindow.listStaticRoutes();
                        }
                    }
                });
            }
        }
    });
}

function getStaticRoute() {
    var action = {};

    if (isIpv6) {
        action = {
            action: 'getIpv6StaticRoute',
            ipv6_route: routeIndex
        }
    } else {
        action = {
            action: 'getStaticRoute',
            route: routeIndex
        }
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
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
                var response = data.response,
                    route;

                if (isIpv6) {
                    route = response.ipv6_route;
                    oldDest = route.ipv6_route_dest;
                    oldGateway = route.ipv6_route_gateway;
                    oldIface = route.ipv6_route_iface;
                    oldActive = route.ipv6_route_active;
                    oldEnabled = route.ipv6_route_enabled;
                    $('#route_dest_ipv6').val(oldDest);
                    $('#route_gateway').val(oldGateway);
                    $('#route_iface').val(oldIface);
                } else {
                    route = response.route;
                    oldDest = route.route_dest;
                    oldNetmask = route.route_netmask;
                    oldGateway = route.route_gateway;
                    oldIface = route.route_iface;
                    oldActive = route.route_active;
                    oldEnabled = route.route_enabled;
                    UCMGUI.domFunction.updateDocument(route, document);
                }

                $('#route_enabled')[0].checked = (oldEnabled == 1 ? true : false);
            }

            top.Custom.init(doc);

            top.dialog.repositionDialog();
        }
    });
}
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
    baseServerURl = config.paths.baseServerURl,
    routeDestList = [],
    modeVal = 1,
    nethdlcEnable = 0,
    staticRoutes = [],
    staticRoutesIpv6 = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3047"));

    getMode();

    createTable();

    createIpv6Table();

    bindButtonEvent();

    // getRouteList();

    listStaticRoutes();

    listStaticRoutesIpv6();

    // top.Custom.init(doc);
});

function getMode() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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

        modeVal = netSettings["method"];
        nethdlcEnable = netSettings["hdlc0_enable"];
    }
}

function listStaticRoutes() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "listStaticRoutes",
            options: "route_index,route_dest,route_netmask,route_iface,route_gateway"
        },
        success: function(data) {
            var res = data.response;

            staticRoutes = res.static_routes;
        }
    });
}

function listStaticRoutesIpv6() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "listIpv6StaticRoutes",
            options: "ipv6_route_index,ipv6_route_dest,ipv6_route_iface,ipv6_route_gateway"
        },
        success: function(data) {
            var res = data.response;

            staticRoutesIpv6 = res.ipv6_static_routes;
        }
    });
}

function createTable() {
    $("#static-routes-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listStaticRoutes",
            options: "route_index,route_dest,route_netmask,route_gateway,route_iface,route_active,route_enabled"
        },
        colNames: [
            '<span locale="LANG3049">' + $P.lang('LANG3049') + '</span>',
            '<span locale="LANG3051">' + $P.lang('LANG3051') + '</span>',
            '<span locale="LANG3053">' + $P.lang('LANG3053') + '</span>',
            '<span locale="LANG3055">' + $P.lang('LANG3055') + '</span>',
            '<span locale="LANG3061">' + $P.lang('LANG3061') + '</span>',
            '<span locale="LANG2772">' + $P.lang('LANG2772') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'route_dest',
            index: 'route_dest',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'route_netmask',
            index: 'route_netmask',
            width: 100,
            resizable: false,
            align: "center",
            formatter: displayNetmask
        }, {
            name: 'route_gateway',
            index: 'route_gateway',
            width: 100,
            resizable: false,
            align: "center",
            formatter: displayGateway
        }, {
            name: 'route_iface',
            index: 'route_iface',
            width: 100,
            resizable: false,
            align: "center",
            formatter: displayIface
        }, {
            name: 'route_active',
            index: 'route_active',
            width: 50,
            resizable: false,
            align: "center",
            formatter: displayActive
        }, {
            name: 'route_enabled',
            index: 'route_enabled',
            width: 50,
            resizable: false,
            align: "center",
            formatter: displayEnabled
        }, {
            name: 'options',
            index: 'options',
            width: 50,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#static-routes-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: "route_index",
        noData: "LANG129 LANG3047",
        jsonReader: {
            root: "response.static_routes",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#static-routes-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(document, true);
            // top.Custom.init(doc);
        }
    });
}

function createIpv6Table() {
    $("#ipv6-static-routes-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listIpv6StaticRoutes",
            options: "ipv6_route_index,ipv6_route_dest,ipv6_route_gateway,ipv6_route_iface,ipv6_route_active,ipv6_route_enabled"
        },
        colNames: [
            '<span locale="LANG3049">' + $P.lang('LANG3049') + '</span>',
            '<span locale="LANG3053">' + $P.lang('LANG3053') + '</span>',
            '<span locale="LANG3055">' + $P.lang('LANG3055') + '</span>',
            '<span locale="LANG3061">' + $P.lang('LANG3061') + '</span>',
            '<span locale="LANG2772">' + $P.lang('LANG2772') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'ipv6_route_dest',
            index: 'ipv6_route_dest',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'ipv6_route_gateway',
            index: 'ipv6_route_gateway',
            width: 100,
            resizable: false,
            align: "center",
            formatter: displayIpv6Gateway
        }, {
            name: 'ipv6_route_iface',
            index: 'ipv6_route_iface',
            width: 100,
            resizable: false,
            align: "center",
            formatter: displayIface
        }, {
            name: 'ipv6_route_active',
            index: 'ipv6_route_active',
            width: 50,
            resizable: false,
            align: "center",
            formatter: displayActive
        }, {
            name: 'ipv6_route_enabled',
            index: 'ipv6_route_enabled',
            width: 50,
            resizable: false,
            align: "center",
            formatter: displayEnabled
        }, {
            name: 'options',
            index: 'options',
            width: 50,
            resizable: false,
            align: "center",
            formatter: createIpv6Options,
            sortable: false
        }],
        pager: "#ipv6-static-routes-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: "ipv6_route_index",
        noData: "LANG129 LANG3047",
        jsonReader: {
            root: "response.ipv6_static_routes",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#ipv6_static-routes-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(document, true);

            top.Custom.init(doc);
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAddStaticRoute', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3048"),
                displayPos: "editForm",
                frameSrc: "html/static_routes_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnAddIpv6StaticRoute', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG5234"),
                displayPos: "editForm",
                frameSrc: "html/static_routes_modal.html?mode=add&ipMode=Ipv6"
            });

            ev.stopPropagation();
            return false;
        })

    $("#static-routes-list, #ipv6-static-routes-list")
        .delegate('.edit', 'click', function(ev) {

            var routeIndex = $(this).attr('routeIndex'),
                routeDest = $(this).attr('routeDest'),
                ipMode = '';

            if ($(this).is('.edit_ipv6')) {
                ipMode = '&ipMode=Ipv6';
            }

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3188").format(routeDest),
                displayPos: "editForm",
                frameSrc: 'html/static_routes_modal.html?mode=edit' + ipMode + '&routeIndex=' + routeIndex
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var isIpv6 = $(this).is('.del_ipv6'),
                action = {};

            var routeIndex = $(this).attr('routeIndex');
            var routeDest = $(this).attr('routeDest');
            var routeNetmask = $(this).attr('routeNetmask');
            var routeGateway = $(this).attr('routeGateway');
            var routeIface = $(this).attr('routeIface');
            var routeActive = $(this).attr('routeActive');
            var routeEnabled = $(this).attr('routeEnabled');

            if (isIpv6) {
                action = {
                    "action": "deleteIpv6StaticRoute",
                    "ipv6_route_index": routeIndex,
                    "ipv6_route_dest": routeDest,
                    "ipv6_route_gateway": routeGateway,
                    "ipv6_route_iface": routeIface,
                    "ipv6_route_active": routeActive,
                    "ipv6_route_enabled": routeEnabled
                };
            } else {
                action = {
                    "action": "deleteStaticRoute",
                    "route_index": routeIndex,
                    "route_dest": routeDest,
                    "route_netmask": routeNetmask,
                    "route_gateway": routeGateway,
                    "route_iface": routeIface,
                    "route_active": routeActive,
                    "route_enabled": routeEnabled
                };
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(routeDest),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: baseServerURl,
                            data: action,
                            error: function(jqXHR, textStatus, errorThrown) {
                                top.dialog.clearDialog();
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: errorThrown
                                });
                            },
                            success: function(data) {
                                top.dialog.clearDialog();

                                var bool = UCMGUI.errorHandler(data);

                                if (bool) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            var table;

                                            if (isIpv6) {
                                                table = $("#ipv6-static-routes-list");
                                            } else {
                                                table = $("#static-routes-list");
                                            }

                                            var totalPage = table.getGridParam("lastpage"),
                                                page = table.getGridParam("page"),
                                                reccount = table.getGridParam("reccount");

                                            if (page === totalPage && totalPage > 1 && reccount === 1) {
                                                table.setGridParam({
                                                    page: totalPage - 1
                                                }).trigger('reloadGrid');
                                            } else {
                                                table.trigger('reloadGrid');
                                            }

                                            if (isIpv6) {
                                                listStaticRoutesIpv6();
                                            } else {
                                                // getRouteList();
                                                listStaticRoutes();
                                            }
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
            ev.stopPropagation();
            return false;
        });
}

function displayNetmask(cellvalue, options, rowObject) {
    var display_netmask;

    if (!cellvalue) {
        display_netmask = "(255.255.255.255)";
    } else {
        display_netmask = cellvalue;
    }

    return display_netmask;
}

function displayGateway(cellvalue, options, rowObject) {
    var display_gateway;

    if (!cellvalue) {
        display_gateway = "(0.0.0.0)";
    } else {
        display_gateway = cellvalue;
    }

    return display_gateway;
}

function displayIpv6Gateway(cellvalue, options, rowObject) {
    var display_gateway;

    if (!cellvalue) {
        display_gateway = "(::)";
    } else {
        display_gateway = cellvalue;
    }

    return display_gateway;
}

function displayIface(cellvalue, options, rowObject) {
    var display_iface;

    if (cellvalue == "1") {
        if (modeVal == 2) {
            display_iface = "LAN2";
        } else if (modeVal == 1) {
            display_iface = "LAN";
        } else {
            display_iface = "WAN";
        }
    } else if (cellvalue == "2") {
        display_iface = "DataTrunk1";
    } else {
        if (modeVal == 2) {
            display_iface = "LAN1";
        } else {
            display_iface = "LAN";
        }
    }

    return display_iface;
}

function displayActive(cellvalue, options, rowObject) {
    var display_active;

    if (cellvalue == 1) {
        display_active = "Yes";
    } else {
        display_active = "No";
    }

    return display_active;
}

function displayEnabled(cellvalue, options, rowObject) {
    var display_enabled;

    if (cellvalue == 1) {
        display_enabled = "Yes";
    } else {
        display_enabled = "No";
    }

    return display_enabled;
}

function createOptions(cellvalue, options, rowObject) {
    var routeIndex = rowObject.route_index;
    var routeDest = rowObject.route_dest;
    var routeNetmask = rowObject.route_netmask;

    if (routeNetmask == null) {
        routeNetmask = "";
    }

    var routeGateway = rowObject.route_gateway;

    if (routeGateway == null) {
        routeGateway = "";
    }

    var routeIface = rowObject.route_iface;
    var routeActive = rowObject.route_active;
    var routeEnabled = rowObject.route_enabled;
    var bEditDisable = (routeIface == 2 && nethdlcEnable == 0);
    var edit = '<button routeIndex="' + routeIndex + '" routeDest="' + routeDest + '" routeNetmask="' + routeNetmask + '" routeGateway="' + routeGateway + '" routeIface="' + routeIface + '" routeActive="' + routeActive + '" routeEnabled="' + routeEnabled + '" title="Edit" localetitle="' + (bEditDisable ? "LANG4069" : "LANG738") + '" class="options edit"' + (bEditDisable ? " disabled" : "") + '></button>';
    var del = '<button routeIndex="' + routeIndex + '" routeDest="' + routeDest + '" routeNetmask="' + routeNetmask + '" routeGateway="' + routeGateway + '" routeIface="' + routeIface + '" routeActive="' + routeActive + '" routeEnabled="' + routeEnabled + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    var options = edit + del;

    return options;
}

function createIpv6Options(cellvalue, options, rowObject) {
    var routeIndex = rowObject.ipv6_route_index;
    var routeDest = rowObject.ipv6_route_dest;
    var routeGateway = rowObject.ipv6_route_gateway;

    if (routeGateway == null) {
        routeGateway = "";
    }

    var routeIface = rowObject.ipv6_route_iface;
    var routeActive = rowObject.ipv6_route_active;
    var routeEnabled = rowObject.ipv6_route_enabled;
    var bEditDisable = (routeIface == 2 && nethdlcEnable == 0);
    var edit = '<button routeIndex="' + routeIndex + '" routeDest="' + routeDest + '" routeGateway="' + routeGateway + '" routeIface="' + routeIface + '" routeActive="' + routeActive + '" routeEnabled="' + routeEnabled + '" title="Edit" localetitle="' + (bEditDisable ? "LANG4069" : "LANG738") + '" class="options edit edit_ipv6"' + (bEditDisable ? " disabled" : "") + '></button>';
    var del = '<button routeIndex="' + routeIndex + '" routeDest="' + routeDest + '" routeGateway="' + routeGateway + '" routeIface="' + routeIface + '" routeActive="' + routeActive + '" routeEnabled="' + routeEnabled + '" title="Delete" localetitle="LANG739" class="options del del_ipv6"></button>';
    var options = edit + del;

    return options;
}

// function getRouteList() {
//     var routeList = UCMGUI.isExist.getList("getStaticRouteList");

//     routeDestList = transData(routeList);
// }

// function transData(res, cb) {
//     var arr = [];

//     for (var i = 0; i < res.length; i++) {
//         arr.push(res[i]["route_dest"]);
//     }

//     if (cb && typeof cb == "function") {
//         cb(arr);
//     }

//     return arr;
// }
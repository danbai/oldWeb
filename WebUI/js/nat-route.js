/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    ifExisted = UCMGUI.inArray,
    existWanPort = [],
    flags = 0,
    ports = [],
    method;

Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    top.document.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG709"));

    createTable();

    bindButtonEvent();

    getNetworkIP();

    getLists();
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4340").format($P.lang("LANG709")),
                displayPos: "editForm",
                frameSrc: "html/nat_route_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#portforwarding_list")
        .delegate('.edit', 'click', function(ev) {
            var id = $(this).attr('id'),
                wanport = $(this).attr('wanport');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG709"), wanport),
                displayPos: "editForm",
                frameSrc: "html/nat_route_modal.html?mode=edit&id=" + id + "&wanport=" + wanport
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var id = $(this).attr('id'),
                wanport = $(this).attr('wanport');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG709"), wanport),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deletePortForwarding",
                            "id": id
                        };

                        $.ajax({
                            type: "post",
                            url: "/cgi",
                            data: action,
                            error: function(jqXHR, textStatus, errorThrown) {
                                // top.dialog.dialogMessage({
                                //     type: 'error',
                                //     content: errorThrown
                                // });
                            },
                            success: function(data) {
                                if (data.status == 0) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            jumpPageOrNot(1);

                                            getLists();
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

            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button id="' + rowObject.id + '" wanport="' + rowObject.wan_port + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button id="' + rowObject.id + '" wanport="' + rowObject.wan_port + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createTable(argument) {
    $("#portforwarding_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listPortForwarding"
        },
        colNames: [
            '<span>ID</span>',
            '<span locale="LANG552"></span>',
            '<span locale="LANG553"></span>',
            '<span locale="LANG554"></span>',
            '<span locale="LANG555"></span>',
            '<span locale="LANG74"></span>'
        ],
        colModel: [{
            name: 'room',
            index: 'room',
            width: 100,
            resizable: false,
            align: "center",
            hidden: true
        }, {
            name: 'wan_port',
            index: 'wan_port',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'lan_ip',
            index: 'lan_ip',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'lan_port',
            index: 'lan_port',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'protocol',
            index: 'protocol',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTableValue
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#portforwarding_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: 'id',
        noData: "LANG129 LANG709",
        jsonReader: {
            root: "response.id",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#portforwarding_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            getNetworkMethod();

            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function getLists() {
    getWanPorts();

    getOtherExistedPorts();
}

function getNetworkMethod() {
    $.ajax({
        type: "GET",
        url: "../cgi?action=getNetworkSettings&method",
        dataType: "json",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(res) {
            var bool = UCMGUI.errorHandler(res);

            if (bool) {
                method = res.response.network_settings.method;

                if (method != "0") {
                    // $.each(data, function(idx, item) {
                    //     $("[name='{0}']".format(item.wan_port)).attr("disabled", true);
                    //     $("[name='{0}']".format(item.lan_ip)).attr("disabled", true);
                    //     $("[name='{0}']".format(item.lan_port)).attr("disabled", true);
                    //     $("[name='{0}']".format(item.type)).attr("disabled", true);
                    // });

                    // $("#route_mode_status").val("Switch Mode");
                    $('#btnAdd').addClass('disabled').attr("disabled", true);
                    $('button.options').addClass('disabled').attr("disabled", true);
                } else {
                    // $.each(data, function(idx, item) {
                    //     $("[name='{0}']".format(item.wan_port)).removeAttr("disabled");
                    //     $("[name='{0}']".format(item.lan_ip)).removeAttr("disabled");
                    //     $("[name='{0}']".format(item.lan_port)).removeAttr("disabled");
                    //     $("[name='{0}']".format(item.type)).removeAttr("disabled");
                    // });

                    // $("#route_mode_status").val("Route Mode");
                    $('#btnAdd').removeClass('disabled').removeAttr("disabled");
                    $('button.options').removeClass('disabled').removeAttr("disabled");
                }
            }
        }
    });
}

function getNetworkIP() {
    $.ajax({
        type: "GET",
        url: "../cgi?action=getIptNatroute&old_ip",
        dataType: "json",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var old_ip = data.response.old_ip,
                    cur_ip = document.location.host.split(":")[0];

                if (cur_ip && old_ip != cur_ip) {
                    flags = 1;

                    $.ajax({
                        type: "GET",
                        url: "../cgi?action=updateIptNatroute&old_ip=" + cur_ip,
                        dataType: "json",
                        async: false,
                        error: function(jqXHR, textStatus, errorThrown) {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: errorThrown
                            });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {}
                        }
                    });
                }
            }
        }
    });
}

function getWanPorts() {
    existWanPort = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listPortForwarding"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var forwardings = data.response.id;

                for (var i = 0, length = forwardings.length; i < length; i++) {
                    var wanPort = forwardings[i]['wan_port'];

                    if (!wanPort) {
                        continue;
                    }

                    if (wanPort.indexOf("-") === -1) {
                        existWanPort.push(wanPort);
                    } else {
                        var aRange = wanPort.split("-"),
                            nStart = parseInt(aRange[0]),
                            nStop = parseInt(aRange[1]);

                        for (var j = nStart; j <= nStop; j++) {
                            existWanPort.push(j.toString());
                        }
                    }
                }
            }
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#portforwarding_list"),
        totalPage = table.getGridParam("lastpage"),
        page = table.getGridParam("page"),
        reccount = table.getGridParam("reccount");

    if (page === totalPage && totalPage > 1 && reccount === selectedRows) {
        table.setGridParam({
            page: totalPage - 1
        }).trigger('reloadGrid');
    } else {
        table.trigger('reloadGrid');
    }
}

function getOtherExistedPorts() {
    ports = [];

    $.ajax({
        type: "GET",
        url: "../cgi?action=getNetstatInfo",
        dataType: "json",
        async: false,
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
                    newPorts = ["25", "123", "21", "22", "23", "69", "80", "389"],
                    currentPort = '';

                for (var i = 0, length = netstat.length; i < length; i++) {
                    currentPort = netstat[i]['port'];

                    if (!ifExisted(currentPort, ports)) {
                        ports.push(currentPort);
                    }
                }

                for (i = 0, length = newPorts.length; i < length; i++) {
                    currentPort = newPorts[i];

                    if (!ifExisted(currentPort, ports)) {
                        ports.push(currentPort);
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

                    if (port && !ifExisted(port, ports)) {
                        ports.push(port);
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

                    if (tlsPort && !ifExisted(tlsPort, ports)) {
                        ports.push(tlsPort);
                    }
                }

                if (tcpbindaddr) {
                    var tcpPort = tcpbindaddr.split(":")[1];

                    if (tcpPort && !ifExisted(tcpPort, ports)) {
                        ports.push(tcpPort);
                    }
                }
            }
        }
    });

    for (var i = 0; i < existWanPort.length; i++) {
        var ele = existWanPort[i];

        if (ports.indexOf(ele) > -1) {
            ports.splice(ports.indexOf(ele), 1);
        }
    }
}

function transTableValue(cellvalue, options, rowObject) {
    var response;

    switch (options.colModel.name) {
        case 'protocol':
            if (cellvalue == '0') {
                response = '<span locale="LANG556"></span>';
            } else if (cellvalue == '1') {
                response = '<span locale="LANG557"></span>';
            } else if (cellvalue == '2') {
                response = '<span locale="LANG558"></span>';
            } else {
                response = '<span locale="LANG2403"></span>';
            }

            break;
        case 'wan_port':
        case 'lan_port':
             response = (cellvalue && cellvalue !== '0') ? cellvalue : '';

            break;
        case 'lan_ip':
            response = cellvalue ? cellvalue : '';

            break;
        default:
            response = '<span locale="LANG2403"></span>';

            break;
    }

    return response;
}

/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    ifExisted = UCMGUI.inArray,
    baseServerURl = config.paths.baseServerURl,
    amiNameList = [],
    existedPortList = [],
    removeList = ['log', 'aoc', 'verbose', 'test'],
    extensionPrefSettings; // [disable_extension_ranges, rand_password, weak_password]

String.prototype.format = top.String.prototype.format;
Array.prototype.contains = top.Array.prototype.contains;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3526"));

    createTable();

    bindButtonEvent();

    getNameList();
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#new_ami_button', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3527"),
                displayPos: "editForm",
                frameSrc: "html/ami_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#ami_settings', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3827"),
                displayPos: "editForm",
                frameSrc: "html/ami_settings.html"
            });

            ev.stopPropagation();
            return false;
        });

    $("#ami_list")
        .delegate('.edit', 'click', function(ev) {
            var user = $(this).attr('user');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG3528"), user),
                displayPos: "editForm",
                frameSrc: "html/ami_modal.html?mode=edit&user=" + user
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var user = $(this).attr('user');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG3528"), user),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteAmiUser",
                            "user": user
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
                                var bool = UCMGUI.errorHandler(data);

                                if (bool) {
                                    // top.dialog.clearDialog();
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816")
                                    });

                                    var table = $("#ami_list"),
                                        totalPage = table.getGridParam("lastpage"),
                                        page = table.getGridParam("page"),
                                        reccount = table.getGridParam("reccount");

                                    if (page === totalPage && totalPage > 1 && reccount === 1) {
                                        table.setGridParam({
                                            page: totalPage - 1
                                        }).trigger('reloadGrid');
                                    } else {
                                        table.trigger('reloadGrid');
                                    }

                                    getNameList();
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

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button user="' + rowObject.user + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button user="' + rowObject.user + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createPri(cellvalue, options, rowObject) {
    var pri = cellvalue;

    if (pri) {
        var list = pri.split(',');

        for (var i = 0, length = removeList.length; i < length; i++) {
            if (list.contains(removeList[i])) {
                list.remove(removeList[i]);
            }
        }

        pri = list.join();
    }

    return pri;
}

function createTable(argument) {
    $("#ami_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listAmiUser"
        },
        colNames: [
            '<span locale="LANG82">' + $P.lang('LANG82') + '</span>',
            '<span locale="LANG2811">' + $P.lang('LANG2811') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'user',
            index: 'user',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'pri',
            index: 'pri',
            width: 300,
            resizable: false,
            align: "center",
            formatter: createPri
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#ami_list_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: 'user',
        noData: "LANG129 LANG3528",
        jsonReader: {
            root: "response.user",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#ami_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function getNameList() {
    extensionPrefSettings = UCMGUI.isExist.getRange(); // [disable_extension_ranges, rand_password, weak_password]

    amiNameList = [];

    // Load All AMI Users.
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            "action": "listAmiUser",
            "options": "user"
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
                var userlist = data.response.user;

                for (var i = 0; i < userlist.length; i++) {
                    amiNameList.push(userlist[i]['user']);
                }
            }
        }
    });

    // Load Existed Ports.
    $.ajax({
        type: "GET",
        url: "../cgi?action=getNetstatInfo",
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

                existedPortList = [];

                for (var i = 0, length = netstat.length; i < length; i++) {
                    currentPort = netstat[i]['port'];

                    if (!ifExisted(currentPort, existedPortList)) {
                        existedPortList.push(currentPort);
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

                    if (port && !ifExisted(port, existedPortList)) {
                        existedPortList.push(port);
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

                    if (tlsPort && !ifExisted(tlsPort, existedPortList)) {
                        existedPortList.push(tlsPort);
                    }
                }

                if (tcpbindaddr) {
                    var tcpPort = tcpbindaddr.split(":")[1];

                    if (tcpPort && !ifExisted(tcpPort, existedPortList)) {
                        existedPortList.push(tcpPort);
                    }
                }
            }
        }
    });

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
                var http_settings = data.response.webrtc_http_settings;

                if (http_settings) {
                    var httpPort = http_settings.bindport.toString();

                    if (httpPort && !ifExisted(httpPort, existedPortList)) {
                        existedPortList.push(httpPort);
                    }

                    var tlsbindaddr = http_settings.tlsbindaddr;

                    if (tlsbindaddr) {
                        var tlsPort = tlsbindaddr.split(":")[1];

                        if (tlsPort && !ifExisted(tlsPort, existedPortList)) {
                            existedPortList.push(tlsPort);
                        }
                    }
                }
            }
        }
    });
}

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
    dhcpEnable = "0",
    baseServerURl = config.paths.baseServerURl;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4586"));

    createTable();
    getDHCPEnable();
    bindButtonEvent();
});

function getDHCPEnable() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "getNetworkSettings"
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response,
                    networkSettings = response.network_settings;
                    dhcpEnable = networkSettings.dhcp_enable;
            }
        }
    });
}

function showStatus(cellvalue, options, rowObject) {
    if (cellvalue === 'online') {
        return '<span locale="LANG540"></span>';
    } else {
        return '<span locale="LANG541"></span>';
    }
}

function showBind(cellvalue, options, rowObject) {
    if (cellvalue === 'yes') {
        return '<span locale="LANG4681"></span>';
    } else {
        return '<span locale="LANG4682"></span>';
    }
}

function createTable() {
    $("#dhcp-client-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listDHCPClient"
        },
        colNames: [
            '<span locale="LANG154">' + $P.lang('LANG154') + '</span>',
            '<span locale="LANG155">' + $P.lang('LANG155') + '</span>',
            //'<span locale="LANG4584">' + $P.lang('LANG4584') + '</span>',
            //'<span locale="LANG4652">' + $P.lang('LANG4652') + '</span>',
            '<span locale="LANG4585">' + $P.lang('LANG4585') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'mac',
            index: 'mac',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'ip',
            index: 'ip',
            width: 100,
            resizable: false,
            align: "center"
        }, /*{
            name: 'client',
            index: 'client',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'status',
            index: 'status',
            width: 100,
            resizable: false,
            align: "center",
            formatter: showStatus
        }, */{
            name: 'isbind',
            index: 'isbind',
            width: 100,
            resizable: false,
            align: "center",
            formatter: showBind
        }, {
            name: 'options',
            index: 'options',
            width: 50,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#dhcp-client-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        viewrecords: true,
        sortname: "mac",
        noData: "LANG129 LANG4586",
        jsonReader: {
            root: "response.dhcp_client_list",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#dhcp-client-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(document, true);
            top.Custom.init(doc);
        }
    });
}

function bindAddDel(ev, sAction, isbind, sMacInfo, isAdd) {
    var dhcpTable = $("#dhcp-client-list"),
        selected = dhcpTable.jqGrid("getGridParam", "selarrrow"),
        selectedRowsLength = selected.length,
        aMac = [],
        aConfirm = [],
        action = {
            action: sAction,
            isbind: isbind
        };

    if (selectedRowsLength < 1) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG4688")
        });

        ev.stopPropagation();
        return false;
    }

    for (var i = 0; i < selectedRowsLength; i++) {
        rowdata = dhcpTable.jqGrid('getRowData', selected[i]);

        rowMac = rowdata['mac'];

        aMac.push(rowMac);

        aConfirm.push('<font>' + rowMac + '</font>');
    }

    action.mac = aMac.join(',');

    if (isAdd && dhcpEnable == "0") {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG5034")
        });
    } else {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang(sMacInfo).format(aConfirm.join('  ')),
            buttons: {
                ok: function() {
                    $.ajax({
                        type: "POST",
                        url: baseServerURl,
                        data: action,
                        error: function(jqXHR, textStatus, errorThrown) {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: errorThrown
                            });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG961"),
                                    callback: function() {
                                        var table = $("#dhcp-client-list"),
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
    }
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAddStaticRoute', 'click', function(ev) {

            if (dhcpEnable == "0") {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5034")
                });
            } else {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG4587"),
                    displayPos: "editForm",
                    frameSrc: "html/dhcp_client_modal.html?mode=add"
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnBatchAdd', 'click', function(ev) {
            bindAddDel(ev, 'addBatchDHCPClient', 'yes', 'LANG4689', true);
        })
        .delegate('#btnBatchDel', 'click', function(ev) {
            bindAddDel(ev, 'deleteBatchDHCPClient', 'no', 'LANG5068', false);
        })

    $("#dhcp-client-list")
        .delegate('.add_bind, .edit_bind', 'click', function(ev) {
            var mac = $(this).attr('mac'),
                ip = $(this).attr('ip'),
                sLang = $(this).is('.add_bind') ? 'LANG4720' : 'LANG4588';
            if (dhcpEnable == "0" && $(this).is('.add_bind')) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5034")
                });
            } else {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang(sLang).format(mac),
                    displayPos: "editForm",
                    frameSrc: "html/dhcp_client_modal.html?mode=edit&mac=" + mac + '&ip=' + ip
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.release_bind', 'click', function(ev) {
            var mac = $(this).attr('mac'),
                action = {
                    action: 'deleteDHCPClient',
                    mac: mac
                };

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG4686").format(mac),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: baseServerURl,
                            data: action,
                            error: function(jqXHR, textStatus, errorThrown) {
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: errorThrown
                                });
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data);
                                if (bool) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            var table = $("#dhcp-client-list"),
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

function createOptions(cellvalue, options, rowObject) {
    var mac = rowObject.mac,
        ip = rowObject.ip,
        isBind = rowObject.isbind === 'yes';

    var edit = '<button mac="' + mac + '" ip="' + ip + '" "title="Bind" localetitle=' + (isBind ? "LANG4685" : "LANG4683") + ' class="options ' + (isBind ? "edit_bind" : "add_bind") + '"></button>';
    var del = '<button mac="' + mac + '" title="Release Bind" localetitle="LANG4684" class="options release_bind"' + (isBind ? "" : "disabled") + '></button>';
    var options = edit + del;

    return options;
}
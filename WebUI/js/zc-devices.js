/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    BLL = top.zc,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    zeroConfigSettings = {},
    gup = UCMGUI.gup,
    filter = gup.call(window, "filter"),
    ZEROCONFIG = top.ZEROCONFIG,
    macExtensions = {},
    macListArr = [];

String.prototype.format = top.String.prototype.format;

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#discover', 'click', function (ev) {
            var zcScanProgress;

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    action: 'checkInfo',
                    user: $P.cookie('username')
                },
                async: false,
                error: function (jqXHR, textStatus, errorThrown) {
                    top.dialog.clearDialog();
                    UCMGUI.loginFunction.switchToLoginPanel();
                },
                success: function (data) {
                    if (data && data.status == 0) {
                        zcScanProgress = data.response.zc_scan_progress;
                        UCMGUI.config.zcScanProgress = zcScanProgress;
                    }
                }
            });

            if (zcScanProgress === '1') {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang('LANG920')
                });
            } else {
                if (zeroConfigSettings.hasOwnProperty('enable_zeroconfig') && zeroConfigSettings.enable_zeroconfig === '1') {
                    top.dialog.dialogInnerhtml({
                        dialogTitle: $P.lang("LANG757"),
                        displayPos: "discoverDiv",
                        frameSrc: "html/zc_autodiscover.html?mode=autodiscover"
                    });
                } else {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang('LANG919')
                    });
                }
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnAdd', 'click', function (ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG754"),
                displayPos: "editForm",
                frameSrc: "html/zc_devices_modal_basic.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnBatch', 'click', function (ev) {
            var devicesTable = $("#zc_devices_list"),
            totalDevices = devicesTable.jqGrid("getGridParam", "records"),
            selected = devicesTable.jqGrid("getGridParam", "selarrrow"),
            selectedRowsLength = selected.length,
            devicesMacList = [],
            devicesIPList = [],
            devicesModelList = [],
            devicesStatusList = [],
            i = 0,
            rowdata;

            for (i; i < selectedRowsLength; i++) {
                rowdata = devicesTable.jqGrid('getRowData', selected[i]);

                var mac = $(rowdata['mac']).text(),
                    status = rowdata['status'],
                    vendor = rowdata["vendor"],
                    model = rowdata["model"],
                    ip = rowdata['ip'];

                var modelObj = BLL.DataCollection.getModelByName(vendor, model);

                if (mac && mac != '000000000000' && modelObj) {
                    devicesMacList.push(mac);
                    devicesIPList.push(ip);
                    devicesStatusList.push(status);
                    devicesModelList.push(modelObj.id());
                }
            }

            if (devicesMacList.length > 1) {
                // batch edit using advanced page as default
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG3866"),
                    displayPos: "editForm",
                    frameSrc: "html/zc_devices_modal_advanced.html?mode=batch&mac={0}&mid={1}".format(devicesMacList.toString(), devicesModelList.toString())
                });
            }
            else if (devicesMacList.length == 1) {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG222").format($P.lang("LANG1287"), mac.toUpperCase()),
                    displayPos: "editForm",
                    frameSrc: "html/zc_devices_modal_basic.html?mode=edit&mac={0}&ip={1}&status={2}".format(devicesMacList[0].toUpperCase(), devicesIPList[0], devicesStatusList[0])
                });
            }
            else {
              if (totalDevices < 1) {
                  top.dialog.dialogMessage({
                      type: 'warning',
                      content: $P.lang("LANG129").format($P.lang("LANG1287"))
                  });
              } else if (selectedRowsLength < 1) {
                    top.dialog.dialogMessage({
                        type: 'warning',
                        content: $P.lang("LANG3456")
                    });
                }
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnDelete', 'click', function (ev) {
            var devicesTable = $("#zc_devices_list"),
                totalDevices = devicesTable.jqGrid("getGridParam", "records"),
                selected = devicesTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                devicesMacList = [],
                devicesIpList = [],
                confirmMacList = [],
                confirmIPList = [],
                i = 0,
                rowdata;

            if (totalDevices < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG1287"))
                });

                ev.stopPropagation();
                return false;
            } else if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG848")
                });

                ev.stopPropagation();
                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = devicesTable.jqGrid('getRowData', selected[i]);

                var mac = $(rowdata['mac']).text(),
                    ip = rowdata['ip'];

                if (mac) {
                    devicesMacList.push(mac);
                } else if (ip && ip != '--') {
                    devicesIpList.push(ip);
                }
            }

            var length = 0;

            for (i = 0, length = devicesMacList.length; i < length; i++) {
                confirmMacList.push("<font style='float: left; margin-right: 5px;'>" + devicesMacList[i] + "</font>");
            }

            for (i = 0, length = devicesIpList.length; i < length; i++) {
                confirmIPList.push("<font style='float: left; margin-right: 5px;'>" + devicesIpList[i] + "</font>");
            }

            top.dialog.dialogConfirm({
                confirmStr: function () {
                    var tips = '';

                    if (devicesMacList.length > 0 && devicesIpList.length > 0) {
                        tips = '<br /><span style="float: left; margin-right: 5px;">' + $P.lang("LANG1293") + ':</span>' + confirmMacList.join('  ') +
                                '<br /><span style="clear: left; float: left; margin-right: 5px;">' + $P.lang("LANG1291") + ':</span>' + confirmIPList.join('  ');
                    } else if (devicesMacList.length > 0) {
                        tips = '<br /><span style="float: left; margin-right: 5px;">' + $P.lang("LANG1293") + ':</span>' + confirmMacList.join('  ');
                    } else if (devicesIpList.length > 0) {
                        tips = '<br /><span style="float: left; margin-right: 5px;">' + $P.lang("LANG1291") + ':</span>' + confirmIPList.join('  ');
                    }

                    return $P.lang("LANG818").format(tips);
                },
                buttons: {
                    ok: function () {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG11"))
                        });

                        var action = {
                            "action": "deleteZeroConfig"
                        };

                        if (devicesMacList.length > 0) {
                            action.mac = devicesMacList.toString();
                        }

                        if (devicesIpList.length > 0) {
                            action.original_ip = devicesIpList.toString();
                        }

                        var DO_SELECTED = function () { // DELETE_SELECTED_USERS();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: action,
                                error: function (jqXHR, textStatus, errorThrown) {
                                    top.dialog.clearDialog();
                                    top.dialog.dialogMessage({
                                        type: 'error',
                                        content: errorThrown,
                                        callback: function () {
                                            // UCMGUI.logoutFunction.doLogout();
                                        }
                                    });
                                },
                                success: function (data) {
                                    var bool = UCMGUI.errorHandler(data);
                                    if (bool) {
                                        top.dialog.clearDialog();

                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG4763"),
                                            callback: function () {
                                                //jumpPageOrNot(selectedRowsLength);
                                                processReloadTable(selectedRowsLength);
                                            }
                                        });
                                    }
                                }
                            });
                        };

                        setTimeout(DO_SELECTED, 100);
                    },
                    cancel: function () {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnReset', 'click', function (ev) {
            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2627"),
                buttons: {
                    ok: function () {
                        $.ajax({
                            type: "GET",
                            url: "../cgi",
                            data: {
                                "action": "clearDevice",
                                "field": "account"
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                // top.dialog.clearDialog();
                                // top.dialog.dialogMessage({
                                //     type: 'error',
                                //     content: errorThrown,
                                //     callback: function() {
                                //         UCMGUI.logoutFunction.doLogout();
                                //     }
                                // });
                            },
                            success: function (data) {
                                var bool = UCMGUI.errorHandler(data);
                                if (bool) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG844"),
                                        callback: function () {
                                            processReloadTable();
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $("#zc_devices_list")
        .delegate('.edit', 'click', function (ev) {
            var mac = $(this).attr('mac'),
                original_ip = $(this).attr('original_ip'),
                status = $(this).attr('status');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG1287"), mac.toUpperCase()),
                displayPos: "editForm",
                frameSrc: "html/zc_devices_modal_basic.html?mode=edit&mac={0}&ip={1}&status={2}".format(mac.toUpperCase(), original_ip, status)
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.action', 'click', function (ev) {
            var mid = $(this).attr('mid');

            var model = BLL.DataCollection.getModel(mid);

            if (model) {
                var rid = $(this).attr("rid");
                var rowData = $("#zc_devices_list").jqGrid("getRowData", rid);

                BLL.ConfigPage.updateCurrentDevice(rowData);
                var webConfig = model.property("WEBCONFIG");
                var urls = webConfig.split(";");
                var usingURL = "";
                var count = 0;

                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG904")
                });

                for (var i = 0; i < urls.length && !usingURL; i++) {
                    (function (usingIdx) {
                        $.ajax({
                            type: "POST",
                            url: "../cgi",
                            data: {
                                "action": "checkRemoteUri",
                                "uri": urls[usingIdx]
                            },
                            async: true,
                            success: function (response) {
                                // response 60 also means accessible but with SSL warning
                                if (response && (response.status === 0 || response.status === 60)) {
                                    usingURL = urls[usingIdx];
                                }
                                count++;
                            },
                            error: function () {
                                count++;
                            }
                        });
                    })(i);


                }

                (function checkReady() {
                    if (count == urls.length) {
                        if (usingURL) {
                            top.dialog.clearDialog();
                            window.open(usingURL, 'newUrl', "location=0,status=1,scrollbars=1, width=1024,height=600");
                        }
                        else {
                            top.dialog.clearDialog();
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG3907")
                            });
                        }
                    }
                    else {
                        setTimeout(checkReady, 100);
                    }
                })();

                BLL.ConfigPage.updateCurrentDevice(null);
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.sync', 'click', function (ev) {
            var mac = $(this).attr('mac'),
                ip = $(this).attr('original_ip');

            function after(res) {
                top.dialog.clearDialog();

                if (res && res.status == '0') {
                    top.dialog.dialogMessage({ type: 'success', content: $P.lang("LANG829") });
                } else {
                    top.dialog.dialogMessage({ type: 'warning', content: "Wrong!" });
                }
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2692"),
                buttons: {
                    ok: function () {
                        // top.dialog.dialogMessage({ type: 'loading', content: $P.lang("LANG829")});
                        $.ajax({
                            type: "GET",
                            url: "../cgi?action=DownloadCfg&mac=" + mac,
                            error: function (jqXHR, textStatus, errorThrown) { },
                            success: after
                        });
                    },
                    cancel: function () {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function (ev) {
            var mac = $(this).attr('mac'),
                original_ip = $(this).attr('original_ip');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(mac + ' : ' + original_ip),
                buttons: {
                    ok: function () {
                        var action = {
                            "action": "deleteZeroConfig",
                            "mac": mac,
                            "original_ip": original_ip
                        };

                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            data: action,
                            error: function (jqXHR, textStatus, errorThrown) {
                                top.dialog.clearDialog();
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: errorThrown,
                                    callback: function () {
                                        UCMGUI.logoutFunction.doLogout();
                                    }
                                });
                            },
                            success: function (data) {
                                var bool = UCMGUI.errorHandler(data);
                                if (bool) {

                                    // top.dialog.clearDialog();
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG4763"),
                                        callback: function () {
                                            processReloadTable(1);
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.reboot', 'click', function (ev) {
            var extension = null,
                rid = $(this).attr('rid'),
                ip = $(this).attr('original_ip'),
                mac = $(this).attr('mac').toUpperCase(),
                zeroConfigSettings = UCMGUI.isExist.getList("getZeroConfigSettings");

            if (macExtensions[mac]) {
                var members = macExtensions[mac];
                if (members.length === 1) {
                    extension = members[0];
                }
                else {
                    var i = $("#zc_devices_list #" + rid + " .acct_ext_list select").prop('selectedIndex');
                    extension = members[i];
                }
            }

            if (extension === undefined) {
                ev.stopPropagation();
                return false;
            }

            if (zeroConfigSettings && zeroConfigSettings.enable_zeroconfig != '1') {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG828"),
                    buttons: {
                        ok: function() {
                            top.frames['frameContainer'].module.jumpMenu('zc_autoprovision.html');
                        },
                        cancel: function() {
                            top.dialog.clearDialog();
                        }
                    }
                });
            } else {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG737"),
                    frameSrc: 'html/extension_reboot.html?extension=' + extension + '&ip=' + ip
                });
            }

            ev.stopPropagation();
            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var ret = "";

    ret += "<button class='options edit' localetitle='LANG738' title='" + $P.lang("LANG738") + "' mac='" + rowObject.mac + "' original_ip='" + rowObject.ip + "' status='" + rowObject.state + "'></button>";
    ret += "<button class='options del' localetitle='LANG739' title='" + $P.lang("LANG739") + "' mac='" + rowObject.mac + "' original_ip='" + rowObject.ip + "'></button>";

    if (rowObject.ip) {
        ret += "<button class='options sync' localetitle='LANG770' title='" + $P.lang("LANG770") + "' mac='" + rowObject.mac + "' original_ip='" + rowObject.ip + "'></button>";
    } else {
        ret += "<button class='options sync disabled' disabled='disabled' localetitle='LANG770' title='" + $P.lang("LANG770") + "' mac='" + rowObject.mac + "' original_ip='" + rowObject.ip + "'></button>";
    }

    var extension = macExtensions[rowObject.mac.toUpperCase()];
    if (rowObject.ip && extension && !UCMGUI.isIPv6(rowObject.ip)) {
      ret += "<button class='options reboot' localetitle='LANG737' title='" + $P.lang("LANG737") + "' rid='" + options.rowId + "' mac='" + rowObject.mac + "' original_ip='" + rowObject.ip + "'></button>";
    } else {
      ret += "<button class='options reboot disabled' disabled='disabled' localetitle='LANG737' title='" + $P.lang("LANG737") + "' rid='" + options.rowId + "' mac='" + rowObject.mac + "' original_ip='" + rowObject.ip + "'></button>";
    }

    var model = BLL.DataCollection.getModelByName(rowObject.vendor, rowObject.model);
    var config = null;

    if (typeof model === "object") {
        var webConfig = model.property("WEBCONFIG");
        if (rowObject.ip && webConfig) {
            config = "<button class='options action' localetitle='LANG3865' title='" + $P.lang("LANG3865") + "' rid='" + options.rowId + "' mid='" + model.id() + "'></button>";
        }
    }

    if (!config)
        config = "<button class='options action disabled' disabled='disabled' localetitle='LANG3865' title='" + $P.lang("LANG3865") + "' mac='" + rowObject.mac + "' original_ip='" + rowObject.ip + "'></button>";

    // [AH] TODO: uncomment this
    ret += config;

    return ret;
}

function createTable(type) {
    $("#zc_devices_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listZeroConfig",
            "options": "mac,ip,members,version,vendor,model,state,last_access",
            "filter": type
        },
        colNames: [
            '<span locale="LANG1293">' + $P.lang('LANG1293') + '</span>',
            '<span locale="LANG1291">' + $P.lang('LANG1291') + '</span>',
            '<span id="goToExtensionPage" locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG1298">' + $P.lang('LANG1298') + '</span>',
            '<span locale="LANG1299">' + $P.lang('LANG1299') + '</span>',
            '<span locale="LANG1295">' + $P.lang('LANG1295') + '</span>',
            //'<span locale="LANG1300">' + $P.lang('LANG1300') + '</span>',
            '<span locale="LANG1301">' + $P.lang('LANG1301') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'mac',
            index: 'mac',
            width: 150,
            resizable: false,
            formatter: transData,
            align: "center"
        }, {
            name: 'ip',
            index: 'ip',
            width: 120,
            resizable: false,
            formatter: transData,
            align: "center"
        }, {
            name: 'members',
            index: 'members',
            width: 120,
            resizable: false,
            formatter: transData,
            align: "center",
            sortable: false
        }, {
            name: 'version',
            index: 'version',
            width: 120,
            resizable: false,
            formatter: transData,
            align: "center"
        }, {
            name: 'vendor',
            index: 'vendor',
            width: 120,
            resizable: false,
            formatter: transData,
            align: "center"
        }, {
            name: 'model',
            index: 'model',
            width: 120,
            resizable: false,
            formatter: transData,
            align: "center"
        },
        //{
        //    name: 'state',
        //    index: 'state',
        //    width: 130,
        //    resizable: false,
        //    formatter: transData,
        //    align: "center"
        //},
        {
            name: 'createConfig',
            index: 'state',
            width: 150,
            resizable: false,
            formatter: transData,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 210,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#zc_devices_pager",
        rowNum: 30,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'mac',
        noData: "LANG129 LANG1287",
        jsonReader: {
            root: "response.zeroconfig",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        beforeInsertRow: function (rowid, rowdata, rowelem) {
            BLL.ConfigPage.updateCurrentDevice(rowelem);
        },
        afterInsertRow: function (rowid, rowdata, rowelem) {
            BLL.ConfigPage.updateCurrentDevice(null);
        },
        loadComplete: function () {
            $("#zc_devices_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function () {
            $("#goToExtensionPage").unbind('click').bind('click', function () {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG843").format($P.lang("LANG85")),
                    buttons: {
                        ok: function () {
                            top.frames['frameContainer'].module.jumpMenu('extension.html');
                        },
                        cancel: function () {
                            top.dialog.clearDialog();
                        }
                    }
                });
            });
            getMacList();
            top.Custom.init(doc);
            $P.lang(doc, true);
        }
    });
}

function getMacList() {
    var action = {
        "action": "listZeroConfig",
        "options": "mac",
    };
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function (jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function (data) {
            data = eval(data);

            if (data.status == 0) {
                var zeroconfig = data.response.zeroconfig;

                // reset value
                macListArr = [];

                $.each(zeroconfig, function (index, val) {
                    macListArr.push(val.mac.toLowerCase());
                });
            }
        }
    });
}
function jumpPageOrNot(selectedRows) {
    var table = $("#zc_devices_list"),
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

function set_filter(value) {
    $("#zc_devices_list")
        .setGridParam({
            postData: {
                "filter": value
            },
            page: 1
        })
        .trigger('reloadGrid');
}

function transData(cellvalue, options, rowObject) {
    var context = '';

    switch (options.colModel.name) {
        case 'mac':
            context = '<span class="device_mac">' + cellvalue.toUpperCase() + '</span>';
            break;
        case 'ip':
            context = cellvalue ? cellvalue : '--';
            break;
        case 'members':

            var usingMac = rowObject.mac.toUpperCase();
            if (macExtensions[usingMac]) {
                var members = macExtensions[usingMac];
                if (members.length === 1) {
                    context += "<span class='extension'>" + members[0] + "</span>";
                }
                else {
                    for (var i = 0; i < members.length; i++) {
                        context += "<option class='extension'>" + members[i] + "</option>";
                    }
                    context = "<div class='acct_ext_list'><select size='1'>" + context + "</select></div>";
                }
            }
            else {
                context = "--";
            }

            //var members = cellvalue.split(','),
            //    memberLength = members.length;

            //if (memberLength == 1) {
            //    if (members[0] == '') {
            //        context = '';
            //    } else {
            //        var index = members[0].split(':')[0],
            //            member = members[0].split(':')[1];

            //        context = '<span locale="LANG567 LANG1422 ' + "'&nbsp;" + index + "' '-" + member + "'" + '">' + $P.lang("LANG1422") + " " + index + "-" + member + "</span>";
            //    }
            //} else {
            //    for (var i = 0; i < memberLength; i++) {
            //        var index = members[i].split(':')[0],
            //            member = members[i].split(':')[1];

            //        if (index && member) {
            //            context += '<option locale="LANG567 LANG1422 ' + "'&nbsp;" + index + "' '-" + member + "'" + '">' + $P.lang("LANG1422") + " " + index + "-" + member + "</option>";
            //        }
            //    }

            //    context = "<div class='acct_ext_list'><select size='1'>" + context + "</select></div>";

            //    // top.Custom.init(doc, $('.acct_ext_list')[0]);
            //}
            break;
        case 'version':
            context = cellvalue ? /*decodeURIComponent*/(cellvalue).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '--';
            break;
        case 'vendor':
            // due to the case in zc_vendor table is stored as lower case, we have to change the case in here.
            context = cellvalue ? cellvalue.toUpperCase() : '--';
            break;
        case 'model':
            context = cellvalue ? /*decodeURIComponent*/(cellvalue).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '--';
            break;
        case 'state':
            var str = (cellvalue > 0 && cellvalue != 3) ? "LANG1302" : "LANG1303";
            context = '<span locale="' + str + '">' + $P.lang(str) + '</span>';
            break;
        case 'createConfig':
            //var str = (rowObject.state == 6 || rowObject.state == 7) ? "LANG136" : "LANG137";
            if (rowObject.state == 6 || rowObject.state == 7) {
                var parts = rowObject.last_access.split(" ");
                if (parts.length == 2) {
                    var dateParts = parts[0].split("-");
                    var timeParts = parts[1].split(":");
                    if (dateParts.length == 3 && timeParts.length == 3) {
                        var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
                        context = date.format("mm/dd/yyyy h:MM TT");
                    }
                    else
                        context = "--";
                }
                else
                    context = "--";
            }
            else {
                context = "--";
            }

            break;
        default:
            context = '';
            break;
    }

    return context;
}

function processReloadTable(selectedRows) {
    ZEROCONFIG.connector.getAllDeviceExtensions().done(function (result) {
        if (result.status == 0) {
            var data = result.response.getAllDeviceExtensions;
            macExtensions = {};

            $.each(data, function (index, item) {
                var usingMac = item.mac.toUpperCase();
                if (!macExtensions[usingMac])
                    macExtensions[usingMac] = [];

                macExtensions[usingMac].push(item.extension);
            });
        }
    }).always(function () {
        if (selectedRows === undefined || selectedRows === null) {
            $("#zc_devices_list").trigger('reloadGrid');
        } else {
            jumpPageOrNot(selectedRows);
        }

    });
}

$(function () {
    $P.lang(doc, true);
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG632"));

    ZEROCONFIG.init();

    (function checkReady() {
        if (ZEROCONFIG.isDataReady() == 1) {
            // needs to prepare global list
            BLL.DataCollection.prepareGlobalList();
            ZEROCONFIG.ValueMonitor.init();


            bindButtonEvent();

            // Reload required variables
            zeroConfigSettings = UCMGUI.isExist.getList("getZeroConfigSettings");

            filter = (filter ? filter : "all");
            $('#filter')[0].value = filter;

            ZEROCONFIG.connector.getAllDeviceExtensions().done(function (result) {
                if (result.status == 0) {
                    var data = result.response.getAllDeviceExtensions;
                    macExtensions = {};

                    $.each(data, function (index, item) {
                        var usingMac = item.mac.toUpperCase();
                        if (!macExtensions[usingMac])
                            macExtensions[usingMac] = [];

                        macExtensions[usingMac].push(item.extension);
                    });
                }
            }).always(function () {
                if (filter == 'res') {
                    createTable('res');
                } else {
                    createTable('all');
                }

                $("div#preparePad").hide();
                $("div#contentPad").show();
            });

            var source = $("#invalidModelWarning").html();
            ZEROCONFIG.connector.checkZeroConfigInvalidModels(source, true);
        }
        else {
            var label = $("div#loadingMsg");
            var tLocale = "LANG805";

            if (ZEROCONFIG.isDataReady() == -1)
                tLocale = "LANG3717";

            if (label.attr("locale") != tLocale) {
                label.attr("locale", tLocale);
                label.text($P.lang(tLocale));
            }

            setTimeout(checkReady, 1000);
        }
    })();
});

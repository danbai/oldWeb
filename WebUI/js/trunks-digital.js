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
    trunkNameList = [],
    groupNameList = [],
    digitalGroupList = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG639"));

    createTable();

    bindButtonEvent();

    getNameList();
});

function createTable() {
    $("#trunks-digital-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listDigitalTrunk",
            options: "trunk_name,type,trunk_index,span,channel,out_of_service"
        },
        colNames: [
            '<span locale="LANG3141">' + $P.lang('LANG3141') + '</span>',
            '<span locale="LANG1486">' + $P.lang('LANG1486') + '</span>',
            '<span locale="LANG2986">' + $P.lang('LANG2986') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'trunk_name',
            index: 'trunk_name',
            width: 120,
            resizable: false,
            align: "center",
            formatter: createName
        }, {
            name: 'type',
            index: 'type',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'channel',
            index: 'channel',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#trunks-digital-pager",
        rowNum: 30,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: "trunk_name",
        noData: "LANG129 LANG3141",
        jsonReader: {
            root: "response.digital_trunks",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#trunks-digital-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            top.Custom.init(doc);
            $P.lang(document, true);
        }
    });
}

function delAstdb(trunk) {
    var action = {
        action: "DBDel",
        Family: "TRUNK_" + trunk + "/DOD"
    };

    $.ajax({
        type: "post",
        url: "/cgi",
        data: action,
        async: false
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3142"),
                displayPos: "editForm",
                frameSrc: "html/trunks_digital_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#trunks-digital-list")
        .delegate('.edit', 'click', function(ev) {

            var trunkId = $(this).attr('trunkId');
            var trunkName = $(this).attr('trunkName');
            var trunkType = $(this).attr('trunkType');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG642").format($P.lang("LANG3143"), trunkName),
                displayPos: "editForm",
                frameSrc: "html/trunks_digital_modal.html?mode=edit&trunkId=" + trunkId + "&trunkType=" + trunkType
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.dod', 'click', function(ev) {
            var trunkId = $(this).attr('trunkId'),
                signalling = $(this).attr('signalling');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2675"),
                displayPos: "editForm",
                frameSrc: "html/trunk_dod_modal.html?trunkIndex=" + trunkId + (signalling ? ("&signalling=" + signalling) : '')
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var trunkId = $(this).attr('trunkId');
            var trunkName = $(this).attr('trunkName');
            var action = {
                "action": "deleteDigitalTrunk",
                "trunk": trunkId
            };

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(trunkName),
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
                                    var table = $("#trunks-digital-list"),
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

                                    delAstdb(trunkId);
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

function createName(cellvalue, options, rowObject) {
    var name;

    if (rowObject.out_of_service && rowObject.out_of_service == 'yes') {
        name = '<span class="disabled_extension_trunk" localetitle="LANG273" title="' + $P.lang('LANG273') + '"></span>' + cellvalue;
    } else {
        name = cellvalue;
    }

    return name;
}

function createOptions(cellvalue, options, rowObject) {
    var trunkName = rowObject.trunk_name;
    var trunkIndex = rowObject.trunk_index;
    var trunkType = rowObject.type;
    var signalling = transSignallingType(rowObject.type);

    var edit = '<button trunkName="' + trunkName + '" trunkType="' + trunkType + '" trunkId="' + trunkIndex + '" title="Edit" localetitle="LANG738" class="options edit"></button>';
    var dod = '<button trunkName="' + trunkName + '"  trunkId="' + trunkIndex + '"  signalling="' + signalling + '" title="DOD" localetitle="LANG2677" class="options dod"></button>';
    var del = '<button trunkName="' + trunkName + '" trunkId="' + trunkIndex + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    var options = edit + dod + del;

    return options;
}

function getNameList() {
    var allTrunkList = UCMGUI.isExist.getList("getTrunkList");

    trunkNameList = transData(allTrunkList);

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            "action": "listDigitalTrunk",
            "options": "trunk_name,group_index"
        },
        success: function(data) {
            var res = data.response;

            if (res && data.status == 0) {
                var digitalTrunks = res.digital_trunks;
                // trunkNameList.length = 0;

                groupNameList.length = 0;

                for (var i = 0; i < digitalTrunks.length; i++) {
                    var digitalTrunksIndex = digitalTrunks[i];
                    // trunkNameList.push(digitalTrunksIndex.trunk_name);
                    groupNameList.push(String(digitalTrunksIndex.group_index));
                }
            }
        }
    });

    listDigitalGroup();
    listDataTrunk();
}

function listDigitalGroup() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        data: {
            action: "listDigitalGroup",
            options: "group_name,group_index"
        },
        success: function(data) {
            if (data && data.status == 0) {
                var res = data.response;

                if (res) {
                    var digitalGroup = res.digital_group;
                    var arr = [];

                    for (var i = 0; i < digitalGroup.length; i++) {
                        var digitalGroupIndex = digitalGroup[i];
                        var obj = {};

                        obj["text"] = digitalGroupIndex.group_name;
                        obj["val"] = digitalGroupIndex.group_index;
                        arr.push(obj);
                    }

                    digitalGroupList = arr;
                }
            }
        }
    });

}

function listDataTrunk() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "listDataTrunk"
        },
        success: function(data) {
            if (data.status == 0) {
                netHDLCSettings = data.response.nethdlc_settings;

                if (netHDLCSettings) {
                    groupNameList.push(String(netHDLCSettings[0].group_index));
                }
            }
        }
    });

    // netHDLCSettings = [{
    //     channel: "4-15,17-31",
    //     hdlc0_enable: 1,
    //     group_index: "2",
    //     hdlc0_encapsulation: "hdlc",
    //     hdlc0_localip: "0.0.0.0",
    //     hdlc0_netmask: "255.255.255.0",
    //     hdlc0_remoteip: "0.0.0.0",
    //     hdlc0_dns1: "0.0.0.0",
    //     hdlc0_dns2: "0.0.0.0",
    //     hdlc0_defaul: 0,
    //     span: 3,
    //     span_type: "E1"
    // }];
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        arr.push(res[i]["trunk_name"]);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transSignallingType(type) {
    if (!type || !type.contains) {
        return false;
    }

    var result;

    if (type.contains('NET') || type.contains('CPE')) {
        result = 'PRI';
    } else if (type.contains('SS7')) {
        result = 'SS7';
    } else if (type.contains('MFC/R2')) {
        result = 'MFC/R2';
    }

    return result;
}
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
    msgArray = ['LANG2656', 'LANG2657', 'LANG2658', 'LANG2659', 'LANG2660', 'LANG2661', 'LANG2662', 'LANG2663'],
    errArray = ['', 'LANG2664', 'LANG2665', 'LANG2666'];

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG641"));

    createTable();

    bindButtonEvent();

    getNameList();

    // top.Custom.init(doc);
});

function createTable() {
    $("#trunks-voip-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listVoIPTrunk",
            options: "trunk_index,trunk_name,host,trunk_type,username,technology,ldap_sync_enable,trunks.out_of_service"
        },
        colNames: [
            '<span locale="LANG1382">' + $P.lang('LANG1382') + '</span>',
            '<span locale="LANG273">' + $P.lang('LANG273') + '</span>',
            '<span locale="LANG623">' + $P.lang('LANG623') + '</span>',
            '<span locale="LANG84">' + $P.lang('LANG84') + '</span>',
            '<span locale="LANG1395">' + $P.lang('LANG1395') + '</span>',
            '<span locale="LANG72">' + $P.lang('LANG72') + '</span>',
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
            name: 'out_of_service',
            index: 'out_of_service',
            hidden: true
        }, {
            name: 'technology',
            index: 'technology',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'trunk_type',
            index: 'trunk_type',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'host',
            index: 'host',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 'username',
            index: 'username',
            width: 150,
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
        pager: "#trunks-voip-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: "trunk_name",
        noData: "LANG129 LANG641",
        jsonReader: {
            root: "response.voip_trunk",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#trunks-voip-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(document, true);
            top.Custom.init(doc);
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
        .delegate('#btnAddSip', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2908"),
                displayPos: "editForm",
                frameSrc: "html/trunks_voip_modal.html?mode=addSip"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnAddIax', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2909"),
                displayPos: "editForm",
                frameSrc: "html/trunks_voip_modal.html?mode=addIax"
            });

            ev.stopPropagation();
            return false;
        });

    $("#trunks-voip-list")
        .delegate('.edit', 'click', function(ev) {

            var trunkId = $(this).attr('trunkId'),
                technology = $(this).attr('technology'),
                trunkName = $(this).attr('trunkName'),
                trunkType = $(this).attr('trunkType');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG642").format(technology, trunkName),
                displayPos: "editForm",
                frameSrc: "html/trunks_voip_modal.html?mode=edit&trunkId=" + trunkId + "&technology=" + technology + "&trunkType=" + trunkType
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.dod', 'click', function(ev) {
            var trunkId = $(this).attr('trunkId');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2675"),
                displayPos: "editForm",
                frameSrc: "html/trunk_dod_modal.html?&trunkIndex=" + trunkId
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.sync', 'click', function(ev) {
            var trunkId = $(this).attr('trunkId'),
                technology = $(this).attr('technology'),
                trunkName = $(this).attr('trunkName'),
                ldapSyncEnable = $(this).attr('ldapSyncEnable');

            manual_ldap_sync(trunkId, technology, trunkName, ldapSyncEnable);

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var trunkId = $(this).attr('trunkId'),
                technology = $(this).attr('technology'),
                trunkName = $(this).attr('trunkName'),
                action = {};

            if (technology.toLowerCase() == "sip") {
                action = {
                    "action": "deleteSIPTrunk",
                    "trunk": trunkId
                };
            } else {
                action = {
                    "action": "deleteIAXTrunk",
                    "trunk": trunkId
                };
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG4471").format(trunkName),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: baseServerURl,
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
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            var table = $("#trunks-voip-list"),
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
    var trunkName = rowObject.trunk_name,
        trunkType = rowObject.trunk_type,
        trunkIndex = rowObject.trunk_index,
        technology = rowObject.technology,
        ldapSyncEnable = rowObject.ldap_sync_enable;

    var edit = '<button trunkName="' + trunkName + '" trunkType="' + trunkType + '" trunkId="' + trunkIndex + '" technology="' + technology + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        dod = '<button trunkName="' + trunkName + '" trunkType="' + trunkType + '" trunkId="' + trunkIndex + '" technology="' + technology + '" title="DOD" localetitle="LANG2677" class="options dod"></button>',
        sync = '<button trunkName="' + trunkName + '" trunkType="' + trunkType + '" trunkId="' + trunkIndex + '" technology="' + technology + '" title="Sync LDAP" localetitle="LANG2654" class="options sync disabled" disabled=true></button>';

    if (trunkType.toLowerCase() == "peer" && technology.toLowerCase() == "sip" && ldapSyncEnable.toLowerCase() == "yes") {
        sync = '<button ldapSyncEnable="' + ldapSyncEnable + '" trunkName="' + trunkName + '" trunkType="' + trunkType + '" trunkId="' + trunkIndex + '" technology="' + technology + '" title="Sync LDAP" localetitle="LANG2654" class="options sync"></button>';
    }

    var del = '<button trunkName="' + trunkName + '" trunkType="' + trunkType + '" trunkId="' + trunkIndex + '" technology="' + technology + '" title="Delete" localetitle="LANG739" class="options del"></button>',
        options = edit + dod + sync + del;

    return options;
}

function getNameList() {
    var trunkList = UCMGUI.isExist.getList("getTrunkList");

    trunkNameList = transData(trunkList);
}

var manual_ldap_sync = function(trunkId, technology, trunkName, ldapSyncEnable) {
    var ttype = technology;

    if (!trunkId) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: "ERROR ITEM!!!!"
        });
        return;
    }

    var a = (ldapSyncEnable == "yes") ? 1 : 0;

    if (a != 1) {
        // top.dialog.clearDialog();
        // top.dialog.dialogMessage({ type: 'warning', content: $P.lang("LANG2674") });
        return;
    }

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG2655")
    });

    /* Start to sync */
    $.ajax({
        type: "Post",
        url: baseServerURl,
        data: {
            "action": "syncLDAP",
            "ldap-sync": "trunk_" + trunkId
        },
        dataType: "json",
        error: function() {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG909")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                manual_ldap_sync_progress(trunkName);
            }
        }
    });
};

var manual_ldap_sync_progress = function(trunkName) {
    /* Get the LDAP SYNC date and progress */
    var count = 120;
    var tryTimes = 0;

    check_ldap_sync_progress(trunkName, count, tryTimes);

    if (count <= 0) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang(errArray[1])
        });
    }

};

var check_ldap_sync_progress = function(trunkName, count, tryTimes) {
    if (count <= 0) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang(errArray[1])
        });

        return;
    }
    tryTimes++;
    count--;

    $.ajax({
        type: "POST",
        url: "/cgi",
        async: false,
        data: {
            action: "getldapsyncprogress",
            ldap_sync_progress: trunkName
        },
        success: function(result) {
            var bool = UCMGUI.errorHandler(result);

            if (bool) {
                /* The progress */
                var index = Number(result.response.ldap_sync_progress);

                if (isNaN(index)) {
                    setTimeout(function() {
                        check_ldap_sync_progress(trunkName, count, tryTimes)
                    }, 1000);
                    return;
                }

                if (index >= 0) {
                    if (index == 7) {
                        top.dialog.clearDialog();

                        /* successful done */
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang(msgArray[index])
                        });

                        var frameContainerDoc = top.frames["frameContainer"].document,
                            applyChanges = $("#applyChanges_Button", frameContainerDoc),
                            lineButton = $("#line_Button", frameContainerDoc);

                        // if (applyChanges.length > 0 && lineButton.length > 0 && !applyChanges.is(':animated')) {
                        applyChanges.css("visibility", "visible");

                        lineButton.css("visibility", "visible");
                    } else {
                        if (tryTimes == 60) {
                            top.dialog.dialogMessage({
                                type: 'warning',
                                content: $P.lang(errArray[1])
                            });
                        } else {
                            count = 90;

                            top.dialog.dialogMessage({
                                type: 'loading',
                                content: $P.lang(msgArray[index])
                            });

                            setTimeout(function() {
                                check_ldap_sync_progress(trunkName, count, tryTimes)
                            }, 1000);
                        }
                    }
                } else {
                    top.dialog.clearDialog();

                    var number = Math.abs(index);

                    top.dialog.dialogMessage({
                        type: 'warning',
                        content: $P.lang(errArray[number])
                    });
                }
            }
        }

    });
};

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
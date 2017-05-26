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
    maxBRITrunksNumber = (config.model_info.num_bri ? config.model_info.num_bri : 2),
    baseServerURl = config.paths.baseServerURl,
    trunkNameList = [],
    BRIPortList = [],
    brigroupList = [],
    portWithTrunkId = {},
    buttonBind = $('#btnBind, #btnUnbind');

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2834"));

    if (1 == config.model_info.num_bri) {
        buttonBind.hide();
    } else {
        buttonBind.show();
    }

    createTable();

    bindButtonEvent();
});

function createTable() {
    $("#trunks-bri-list").jqGrid({
        url: baseServerURl,
        ajaxGridOptions: {
            async: false
        },
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listBRItrunks",
            options: "trunk_name,trunk_index,span,brigroup"
        },
        colNames: [
            '<span locale="LANG83">' + $P.lang('LANG83') + '</span>',
            '<span locale="LANG2837">' + $P.lang('LANG2837') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'trunk_name',
            index: 'trunk_name',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createTrunkName
        }, {
            name: 'span',
            index: 'span',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createPort
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#trunks-bri-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: "trunk_name",
        noData: "LANG129 LANG2834",
        jsonReader: {
            root: "response.bri_trunks",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#trunks-bri-list .jqgrow:even").addClass("ui-row-even");

            getNamePortList();

            var records = $("#trunks-bri-list").getGridParam("records"),
                buttonAdd = $('#btnAdd');

            if (records >= maxBRITrunksNumber) {
                buttonAdd.hide();
            } else {
                if (buttonAdd.is(':hidden')) {
                    buttonAdd.show();
                }
            }

            if (records <= 1) {
                buttonBind.hide();
            } else {
                buttonBind.show();

                if (brigroupList[0] == brigroupList[1]) {
                    $('#btnBind').attr('disabled', 'disabled').css('cursor', 'default');

                    $('#btnUnbind').removeAttr('disabled').css('cursor', 'pointer');
                } else {
                    $('#btnUnbind').attr('disabled', 'disabled').css('cursor', 'default');

                    $('#btnBind').removeAttr('disabled').css('cursor', 'pointer');
                }
            }
        },
        gridComplete: function() {
            top.Custom.init(doc);
            $P.lang(document, true);
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2836"),
                displayPos: "editForm",
                frameSrc: "html/trunks_bri_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnBind', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2882"),
                displayPos: "editForm",
                frameSrc: "html/trunks_bri_modal.html?mode=bind"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnUnbind', 'click', function(ev) {
            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    'action': 'updateBRITrunk',
                    'trunk': portWithTrunkId['2'],
                    'brigroup': 21
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    top.dialog.clearDialog();
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: errorThrown
                    });
                },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data, function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    });

                    if (bool) {
                        top.dialog.clearDialog();
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG815"),
                            callback: function() {
                                $("#trunks-bri-list").trigger('reloadGrid');
                            }
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $("#trunks-bri-list")
        .delegate('.edit', 'click', function(ev) {

            var trunkId = $(this).attr('trunkId');
            var trunkName = $(this).attr('trunkName');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG642").format($P.lang("LANG2835"), trunkName),
                displayPos: "editForm",
                frameSrc: "html/trunks_bri_modal.html?mode=edit&trunkId=" + trunkId
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
        .delegate('.del', 'click', function(ev) {
            var span = $(this).attr('span'),
                trunkId = $(this).attr('trunkId'),
                trunkName = $(this).attr('trunkName'),
                action = {
                    "action": "deleteBRITrunk",
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
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {

                                            if ((2 == brigroupList.length && (brigroupList[1] == brigroupList[2])) && span == 1) {
                                                $.ajax({
                                                    type: "post",
                                                    url: "../cgi",
                                                    data: {
                                                        'action': 'updateBRITrunk',
                                                        'trunk': portWithTrunkId['2'],
                                                        'brigroup': 21
                                                    },
                                                    error: function(jqXHR, textStatus, errorThrown) {},
                                                    success: function(data) {}
                                                });
                                            }

                                            var table = $("#trunks-bri-list"),
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

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button trunkName="' + rowObject.trunk_name + '" trunkId="' + rowObject.trunk_index +
            '" brigroup="' + rowObject.brigroup + '" span="' + (rowObject.span - 1) +
            '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button trunkName="' + rowObject.trunk_name + '" trunkId="' + rowObject.trunk_index +
            '" brigroup="' + rowObject.brigroup + '" span="' + (rowObject.span - 1) +
            '" title="Delete" localetitle="LANG739" class="options del"></button>',
        dod = '<button trunkName="' + rowObject.trunk_name + '" trunkId="' + rowObject.trunk_index +
            '" brigroup="' + rowObject.brigroup + '" span="' + (rowObject.span - 1) +
            '" title="DOD" localetitle="LANG2677" class="options dod"></button>';

    var options = edit + dod + del;

    return options;
}

function createPort(cellvalue, options, rowObject) {
    return '<span class="bri-port">' + (cellvalue - 1) + '</span>';
}

function createTrunkName(cellvalue, options, rowObject) {
    return '<span class="bri-trunk-name">' + cellvalue + '</span>';
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

function getNamePortList() {
    trunkNameList = [];

    $('.bri-trunk-name').each(function() {
        var name = $(this).text();
        trunkNameList.push(name);
    });

    BRIPortList = [];

    $('.bri-port').each(function() {
        var port = parseInt($(this).text());
        BRIPortList.push(port);
    });

    portWithTrunkId = {};
    brigroupList = [];

    $('.edit').each(function() {
        var span = $(this).attr('span'),
            trunkId = $(this).attr('trunkId'),
            brigroup = $(this).attr('brigroup');

        portWithTrunkId[span] = trunkId;
        brigroupList.push(parseInt(brigroup));
    });    
}
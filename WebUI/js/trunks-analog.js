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
    trunkList = [],
    toneZoneSettings = [],
    chanList = [],
    failoverTrunkList = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG639"));

    createTable();

    bindButtonEvent();

    getNameList();

    getToneZoneSettings();

    list_recordings();

    // set table width
    setTimeout(function() {
        $("#recordFiles").setGridWidth($('#trunks-analog-list').width());
        $('.section-title-specail').outerWidth($('#trunks-analog-list').width(), true);
    }, 100);

    // bind resize event, set table width
    $(window).resize(function() {
        $("#recordFiles").setGridWidth($('#trunks-analog-list').width());
        $('.section-title-specail').outerWidth($('#trunks-analog-list').width(), true);
    });
});

function createTable() {
    $("#trunks-analog-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listAnalogTrunk",
            options: "trunk_name,trunk_index,chans,out_of_service,trunkmode"
        },
        colNames: [
            '<span locale="LANG83">' + $P.lang('LANG83') + '</span>',
            '<span locale="LANG273">' + $P.lang('LANG273') + '</span>',
            '<span locale="LANG3216">' + $P.lang('LANG3216') + '</span>',
            '<span locale="LANG232">' + $P.lang('LANG232') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'trunk_name',
            index: 'trunk_name',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createName
        }, {
            name: 'out_of_service',
            index: 'out_of_service',
            hidden: true
        }, {
            name: 'trunkmode',
            index: 'trunkmode',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createTrunkMode
        }, {
            name: 'chans',
            index: 'chans',
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
        pager: "#trunks-analog-pager",
        rowNum: 1000000,
        // rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: "trunk_name",
        noData: "LANG129 LANG639",
        jsonReader: {
            root: "response.analogtrunk",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#trunks-analog-list .jqgrow:even").addClass("ui-row-even");
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
                dialogTitle: $P.lang("LANG762"),
                displayPos: "editForm",
                frameSrc: "html/trunks_analog_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#trunks-analog-list")
        .delegate('.edit', 'click', function(ev) {
            var trunkId = $(this).attr('trunkId'),
                trunkName = $(this).attr('trunkName');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG642").format($P.lang("LANG105"), trunkName),
                displayPos: "editForm",
                frameSrc: "html/trunks_analog_modal.html?mode=edit&trunkId=" + trunkId
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var trunkId = $(this).attr('trunkId'),
                trunkName = $(this).attr('trunkName'),
                action = {
	                "action": "deleteAnalogTrunk",
	                "analogtrunk": trunkId
	            };

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG4471").format(trunkName),
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

                                if(bool) {
                                    var table = $("#trunks-analog-list"),
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

    $("#recordFiles")
        .delegate(".del", "click", function(ev) {
            var fileName = $(this).attr("file_name");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG938"),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            data: {
                                "action": "checkFile",
                                "type": "adt_dump",
                                "data": fileName
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                            },
                            success: function(data) {
                                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                                    $.ajax({
                                        type: "post",
                                        url: "../cgi",
                                        data: {
                                            "action": "removeFile",
                                            "type": "adt_dump",
                                            "data": fileName
                                        },
                                        error: function(jqXHR, textStatus, errorThrown) {
                                        },
                                        success: function(data) {
                                            var bool = UCMGUI.errorHandler(data);

                                            if (bool) {
                                                top.dialog.dialogMessage({
                                                    type: 'success',
                                                    content: $P.lang("LANG871"),
                                                    callback: function() {
                                                        var table = $("#recordFiles"),
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
                                } else {
                                    top.dialog.dialogMessage({
                                        type: 'error',
                                        content: $P.lang("LANG3868")
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
        })
        .delegate(".download", "click", function(ev) {
            var fileName = $(this).attr("file_name");

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "checkFile",
                    "type": "adt_dump",
                    "data": fileName
                },
                error: function(jqXHR, textStatus, errorThrown) {
                },
                success: function(data) {
                    if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                        window.open("/cgi?action=downloadFile&type=adt_dump&data=" + fileName, '_self');
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG3868")
                        });
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

function createTrunkMode(cellvalue, options, rowObject) {
    var mode = '';

    if (cellvalue == 'sla') {
        mode = '<div locale="LANG3217">' + $P.lang('LANG3217') + '</div>';
    } else if (cellvalue == 'normal') {
        mode = '<div locale="LANG544">' + $P.lang('LANG544') + '</div>';
    }

    return mode;
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button trunkName="' + rowObject.trunk_name + '" trunkId="' + rowObject.trunk_index + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button trunkName="' + rowObject.trunk_name + '" trunkId="' + rowObject.trunk_index + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function getNameList() {
    var allTrunkList = UCMGUI.isExist.getList("getTrunkList");

    trunkList = UCMGUI.isExist.getList("getAnalogTrunkNameList");

    trunkNameList = transData(allTrunkList);

    chanList = UCMGUI.isExist.getList("getAnalogTrunkChanList");

    failoverTrunkList = UCMGUI.isExist.getList("getOutrtFailoverTrunkIdList");

    var arr = [];

    for (var i = 0; i < chanList.length; i++) {
        arr.push(chanList[i]["chan"]);
    }

    chanList = arr;
}

function getToneZoneSettings() {
    var action = {
        action: "listAllToneZoneSettings",
        options: "description,country,busy,congestion",
        sidx: "description"
    };

    $.ajax({
        url: baseServerURl,
        type: 'POST',
        dataType: 'json',
        data: action,
        async: false,
        success: function(data) {
            var data = eval(data);

            if (data && data.status == 0) {
                toneZoneSettings = data.response.CountryTone;
            }
        }
    });
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

function list_recordings() {
    $("#recordFiles").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: $('#trunks-analog-list').width(),
        height: "auto",
        postData: {
            "action": "listFile",
            "type": "adt_dump",
            "filter": '{"list_dir":0, "list_file":1, "file_suffix": ["raw"]}'
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
            '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'n',
            index: 'n',
            width: 250,
            resizable: false,
            align: "center"
        }, {
            name: 'd',
            index: 'd',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 's',
            index: 's',
            width: 100,
            resizable: false,
            align: "center",
            formatter: tranSize
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            sortable: false,
            formatter: createOptionsRecord
        }],
        loadui: 'disable',
        pager: "#recordFiles-pager",
        //rowNum: 10,
        //rowList: [10, 20, 30],
        multiselect: false,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'd',
        sortorder: 'desc',
        noData: "LANG5150",
        jsonReader: {
            root: "response.adt_dump",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#recordFiles .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function tranSize(cellvalue, options, rowObject) {
    var size = parseFloat(cellvalue),
        rank = 0,
        rankchar = 'Bytes';

    while (size > 1024) {
        size = size / 1024;
        rank++;
    }

    if (rank == 1) {
        rankchar = "KB";
    } else if (rank == 2) {
        rankchar = "MB";
    } else if (rank == 3) {
        rankchar = "GB";
    }

    return Math.round(size * Math.pow(10, 2)) / Math.pow(10, 2) + " " + rankchar;
}

function createOptionsRecord(cellvalue, options, rowObject) {
    var del = '<button file_name="' + rowObject.n +
        '" title="Delete" localetitle="LANG739" class="options del"></button>',
        download = '<button file_name="' + rowObject.n +
        '" title="Download" localetitle="LANG759" class="options download"></button>';

    return del + download;
}
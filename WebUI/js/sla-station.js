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
    slaTrunkNameList = [],
    slaStationNameList = [],
    slaStationList = [],
    accountObjectList = [],
    analogtrunkObj = {};

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3225"));

    createTable();

    bindButtonEvent();

    getNameList();
    listAnalogTrunk();
});

function createTable() {
    $("#sla-station-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listSLAStation",
            options: "station_name,station,trunks"
        },
        colNames: [
            '<span locale="LANG3228">' + $P.lang('LANG3228') + '</span>',
            '<span locale="LANG3229">' + $P.lang('LANG3229') + '</span>',
            '<span locale="LANG3230">' + $P.lang('LANG3230') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'station_name',
            index: 'station_name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'station',
            index: 'station',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'trunks',
            index: 'trunks',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createTrunks
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#sla-station-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        viewrecords: true,
        sortname: "station_name",
        noData: "LANG129 LANG3225",
        jsonReader: {
            root: "response.sla_station",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#sla-station-list .jqgrow:even").addClass("ui-row-even");
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
            if (!slaTrunkNameList.length) {
                top.dialog.dialogConfirm({
                    confirmStr: top.$.lang("LANG4492"),
                    buttons: {
                        ok: function() {
                            top.frames['frameContainer'].module.jumpMenu('trunks_analog.html');
                        }
                    }
                });
            } else if (slaStationList.length === accountObjectList.length) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG4493")
                });
            } else {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG3226"),
                    displayPos: "editForm",
                    frameSrc: "html/sla_station_modal.html?mode=add"
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#batchDelete', 'click', function(ev) {
            var slaTable = $("#sla-station-list"),
                records = slaTable.getGridParam("records"),
                selected = slaTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                slaList = [],
                confirmList = [],
                i = 0,
                rowdata;

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG3225"))
                });

                return false;
            }

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG3225"))
                });

                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = slaTable.jqGrid('getRowData', selected[i]);

                slaList.push(rowdata['station']);

                confirmList.push(rowdata['station_name']);
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG3225"), confirmList.join('  ')),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG3225"))
                        });

                        var doSelected = function() { // DELETE_SELECTED_RECORDING();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "deleteSLAStation",
                                    "sla_station": slaList.join(',')
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
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG821").format(confirmList.join('  '), $P.lang("LANG2471")),
                                            callback: function() {
                                                jumpPageOrNot(selectedRowsLength);

                                                getNameList();
                                            }
                                        });
                                    }
                                }
                            });
                        };

                        setTimeout(doSelected, 100);
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $("#sla-station-list")
        .delegate('.edit', 'click', function(ev) {
            var station = $(this).attr('station'),
                stationName = $(this).attr('stationName');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3227").format(stationName),
                displayPos: "editForm",
                frameSrc: "html/sla_station_modal.html?mode=edit&station=" + station
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var station = $(this).attr('station'),
                stationName = $(this).attr('stationName'),
                action = {
                    "action": "deleteSLAStation",
                    "sla_station": station
                };

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(stationName),
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

                                if(bool) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG821").format(stationName, $P.lang("LANG2471")),
                                        callback: function() {
                                            jumpPageOrNot(1);

                                            getNameList();
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
    var edit = '<button station="' + rowObject.station + '" stationName="' + rowObject.station_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button station="' + rowObject.station + '" stationName="' + rowObject.station_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createTrunks(cellvalue, options, rowObject) {
    return (cellvalue ? cellvalue : '--');
}

function getNameList() {
    slaStationList = [],

    slaStationNameList = [],

    accountObjectList = transAccountData(UCMGUI.isExist.getList("getSIPAccountList"));
    accountObjectList = accountObjectList.sort(UCMGUI.bySort("val", "down"));

    slaTrunkNameList = UCMGUI.isExist.getList("getSLATrunkNameList");

    var action = {
            'action': "listSLAStation",
            'options': "station_name,station",
            'sidx': 'station',
            'sord': 'asc'
        };

    $.ajax({
        url: baseServerURl,
        type: 'POST',
        dataType: 'json',
        data: action,
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
                var slaStation = data.response.sla_station;

                for (var i = 0, length = slaStation.length; i < length; i++) {
                    if (slaStation[i].station) {
                        slaStationList.push(slaStation[i].station);
                    }

                    if (slaStation[i].station_name) {
                        slaStationNameList.push(slaStation[i].station_name);
                    }
                }
            }
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#sla-station-list"),
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

function transAccountData(res, cb) {
    var arr = [];

    accountList = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"': '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"': '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"': '');
        }

        accountList.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function listAnalogTrunk() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: true,
        url: baseServerURl,
        data: {
            action: "listAnalogTrunk",
            options: "trunk_name,trunk_index,out_of_service"
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var analogtrunk = data.response.analogtrunk;
                transAnalogtrunkData(analogtrunk);
            }
        }
    });
}

function transAnalogtrunkData (arr) {
    for (var i = 0; i <= arr.length - 1; i++) {
        analogtrunkObj[arr[i].trunk_name] = arr[i].out_of_service;
    };
}
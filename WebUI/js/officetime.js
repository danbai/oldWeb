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
    addZero = UCMGUI.addZero;

String.prototype.format = top.String.prototype.format;
Array.prototype.sortNumbers = top.Array.prototype.sortNumbers;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3271"));

    createTable();

    bindButtonEvent();
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#add', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3267"),
                displayPos: "editForm",
                frameSrc: "html/officetime_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#batchDelete', 'click', function(ev) {
            var officetimeTable = $("#officetime-list"),
                selected = officetimeTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                officetimeList = [],
                confirmList = [],
                i = 0,
                rowdata,
                rowExt,
                nDelRank;

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG3271"))
                });

                ev.stopPropagation();
                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = officetimeTable.jqGrid('getRowData', selected[i]);

                rowExt = rowdata['condition_index'];
                rowRank = selected[i];

                officetimeList.push(rowExt);

                nDelRank = $('.jqgrid-rownum').eq(rowRank - 1).text();

                confirmList.push("<font>" + nDelRank + "</font>");
            }

            officetimeList.sortNumbers();

            confirmList.sort(function(a, b) {
                return parseInt(a.match(/\d+/g)[0]) - parseInt(b.match(/\d+/g)[0]);
            });

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(confirmList.join('  ')),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG877")
                        });

                        var DO_SELECTED = function() { // DELETE_SELECTED_USERS();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "deleteTimeConditionOfficeTime",
                                    "time_conditions_officetime": officetimeList.toString()
                                },
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

                                        // top.dialog.clearDialog();
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG816"),
                                            callback: function() {
                                                jumpPageOrNot(selectedRowsLength);
                                            }
                                        });
                                    }
                                }
                            });
                        };

                        setTimeout(DO_SELECTED, 100);
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $("#officetime-list")
        .delegate('.edit', 'click', function(ev) {
            var condition_index = $(this).attr('condition_index'),
                rn_index = $(this).attr('rn_index'),
                nEditIndex = $(this).parent().siblings('.jqgrid-rownum').text();

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG3271"), nEditIndex),
                displayPos: "editForm",
                frameSrc: "html/officetime_modal.html?mode=edit&condition_index=" + condition_index
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var condition_index = $(this).attr('condition_index'),
                rn_index = $(this).attr('rn_index'),
                nDelIndex = $(this).parent().siblings('.jqgrid-rownum').text();

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(nDelIndex),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            data: {
                                "action": "deleteTimeConditionOfficeTime",
                                "time_conditions_officetime": condition_index
                            },
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

                                    // top.dialog.clearDialog();
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG821").format(nDelIndex, $P.lang("LANG2471")),
                                        callback: function() {
                                            jumpPageOrNot(1);
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

function ReturnWeek(list){
    var str = list.split('&'),
        dictWeek = {};

    dictWeek["sun"] = '<span locale="LANG250">' + $P.lang("LANG250") + '</span>';
    dictWeek["mon"] = '<span locale="LANG251">' + $P.lang("LANG251") + '</span>';
    dictWeek["tue"] = '<span locale="LANG252">' + $P.lang("LANG252") + '</span>';
    dictWeek["wed"] = '<span locale="LANG253">' + $P.lang("LANG253") + '</span>';
    dictWeek["thu"] = '<span locale="LANG254">' + $P.lang("LANG254") + '</span>';
    dictWeek["fri"] = '<span locale="LANG255">' + $P.lang("LANG255") + '</span>';
    dictWeek["sat"] = '<span locale="LANG256">' + $P.lang("LANG256") + '</span>';

    tmpstr = "";

    for (i = 0; i < str.length; i++) {
        if (tmpstr == "") {
            tmpstr = dictWeek[str[i]];
        } else {
            tmpstr += " " + dictWeek[str[i]];
        }
    }

    return tmpstr;
}

function ReturnMonth(list){
    var str = list.split('&'),
        dictMonth = {};

    dictMonth["jan"] = '<span locale="LANG204 \'\'">' + $P.lang("LANG204").format("") + '</span>';
    dictMonth["feb"] = '<span locale="LANG205 \'\'">' + $P.lang("LANG205").format("") + '</span>';
    dictMonth["mar"] = '<span locale="LANG206 \'\'">' + $P.lang("LANG206").format("") + '</span>';
    dictMonth["apr"] = '<span locale="LANG207 \'\'">' + $P.lang("LANG207").format("") + '</span>';
    dictMonth["may"] = '<span locale="LANG208 \'\'">' + $P.lang("LANG208").format("") + '</span>';
    dictMonth["jun"] = '<span locale="LANG209 \'\'">' + $P.lang("LANG209").format("") + '</span>';
    dictMonth["jul"] = '<span locale="LANG210 \'\'">' + $P.lang("LANG210").format("") + '</span>';
    dictMonth["aug"] = '<span locale="LANG211 \'\'">' + $P.lang("LANG211").format("") + '</span>';
    dictMonth["sep"] = '<span locale="LANG212 \'\'">' + $P.lang("LANG212").format("") + '</span>';
    dictMonth["oct"] = '<span locale="LANG213 \'\'">' + $P.lang("LANG213").format("") + '</span>';
    dictMonth["nov"] = '<span locale="LANG214 \'\'">' + $P.lang("LANG214").format("") + '</span>';
    dictMonth["dec"] = '<span locale="LANG215 \'\'">' + $P.lang("LANG215").format("") + '</span>';

    tmpstr = "";

    for (i = 0; i < str.length; i++) {
        tmpstr += dictMonth[str[i]];
    }

    return tmpstr;
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button rn_index ="' + options.rowId + '"condition_index="' + rowObject.condition_index + '" title="' + $P.lang('LANG738') + '" localetitle="LANG738" class="options edit"></button>',
        del = '<button rn_index ="' + options.rowId + '"condition_index="' + rowObject.condition_index + '" sequence="' + rowObject.sequence + '" title="' + $P.lang('LANG739') + '" localetitle="LANG739" class="options del"></button>';

    return edit + del;
}

function createDay(cellvalue, options, rowObject){
    if (cellvalue == '*') {
        return '<div locale="LANG257">' + $P.lang("LANG257") + '</div>';
    } else {
        return cellvalue.replace(/&/g,',');
    }
}

function createMonth(cellvalue, options, rowObject){
    if (cellvalue == '*') {
        return '<div locale="LANG257">' + $P.lang("LANG257") + '</div>';
    } else {
        return ReturnMonth(cellvalue);
    }
}

function createWeek(cellvalue, options, rowObject){
    if (cellvalue == '*') {
        return '<div locale="LANG257">' + $P.lang("LANG257") + '</div>';
    } else {
        return ReturnWeek(cellvalue);
    }
}

function createTime(cellvalue, options, rowObject) {
    var stime_hour = addZero(rowObject.start_hour),
        stime_minute = addZero(rowObject.start_min),
        ftime_hour = addZero(rowObject.end_hour),
        ftime_minute = addZero(rowObject.end_min),
        tempTime = (stime_hour + ':' + stime_minute + '-' + ftime_hour + ':' + ftime_minute);

    return tempTime;
}

function createTable() {
    $("#officetime-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listTimeConditionOfficeTime",
            "user_id": "0"
        },
        colNames: [
            '<span locale="LANG3269">' + $P.lang('LANG3269') + '</span>',
            '<span locale="LANG1957">' + $P.lang('LANG1957') + '</span>',
            '<span locale="LANG247">' + $P.lang('LANG247') + '</span>',
            '<span locale="LANG243">' + $P.lang('LANG243') + '</span>',
            '<span locale="LANG244">' + $P.lang('LANG244') + '</span>',
            '<span locale="LANG242">' + $P.lang('LANG242') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'condition_index',
            index: 'condition_index',
            //width: 100,
            //resizable: false,
            //align: "center",
            //sortable: false
            hidden: true

        }, {
            name: 'sequence',
            index: 'sequence',
            width: 100,
            resizable: false,
            align: "center",
            hidden: true
        }, {
            name: 'time',
            index: 'time',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createTime,
            sortable: false
        }, {
            name: 'week_day',
            index: 'week_day',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createWeek,
            sortable: false
        }, {
            name: 'month',
            index: 'month',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createMonth,
            sortable: false
        }, {
            name: 'day',
            index: 'day',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createDay,
            sortable: false
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        rownumbers: true,
        pager: "#officetime-pager",
        rowNum: 30,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'condition_index',
        noData: "LANG129 LANG3271",
        jsonReader: {
            root: "response.time_conditions_officetime",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#officetime-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            top.Custom.init(doc);

            $P.lang(doc, true);
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#officetime-list"),
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
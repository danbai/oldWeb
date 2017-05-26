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
    pagingExtList = [],
    pagingExt = [],
    extgroupList = [],
    extgroupListObj = {},
    numberList = [],
    pagingNameList = [],
    pagingRange = [],
    portExtensionList = [],
    ivrNameArr = [{
        val: "",
        locale: "LANG133"
    }];

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;;
Array.prototype.sortNumbers = top.Array.prototype.sortNumbers;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG604"));

    getListsAndRange();

    createTable();

    bindTopButtonEvent();

    bindGridButtonEvent();

    getNameList();

    getPortExtension();

    getCustomPrompt();
});

function getListsAndRange() {
    var accountList = UCMGUI.isExist.getList("getAccountList");

    pagingExtList = transData(accountList);

    extgroupList = UCMGUI.isExist.getList("getExtensionGroupList");

    for (var i = 0; i < extgroupList.length; i++) {
        var groupId = extgroupList[i]["group_id"];
        var groupName = extgroupList[i]["group_name"];

        pagingExt.push(groupId);
        extgroupListObj[groupId] = {
            val: groupId,
            text: groupName
        };
    }

    // pagingRange = UCMGUI.isExist.getRange('paging');
}

function getNameList() {
    numberList = UCMGUI.isExist.getList("getNumberList");
    pagingNameList = UCMGUI.isExist.getList("getPaginggroupNameList");
}

function getPortExtension() {
    portExtensionList = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getFeatureCodes"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var featureSettings = data.response.feature_settings,
                    parkext = featureSettings.parkext,
                    parkpos = featureSettings.parkpos.split('-');

                portExtensionList.push(parseInt(parkext, 10));

                for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                    portExtensionList.push(i);
                }
            }
        }
    });
}

function getCustomPrompt() {
    var action = {
        "action": "listFile",
        "type": "ivr",
        "filter": JSON.stringify({
            "list_dir": 0,
            "list_file": 1,
            "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
        }),
        "sidx": "n",
        "sord": "desc"
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
                var res = data.response;

                if (res) {
                    var ivr = res.ivr;

                    for (var i = 0; i < ivr.length; i++) {
                        var name = ivr[i]["n"],
                            obj = {
                                text: name,
                                val: "record/" + removeSuffix(name)
                            };

                        ivrNameArr.push(obj);
                    };
                }
            }
        }
    });
}

function bindTopButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG605"),
                displayPos: "editForm",
                frameSrc: "html/paging_intercom_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#batchDelete', 'click', function(ev) {

            var pageInterTable = $("#pageInter-list"),
                selected = pageInterTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                pageInterList = [],
                confirmList = [],
                i = 0,
                rowdata;

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG604"))
                });

                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = pageInterTable.jqGrid('getRowData', selected[i]);
                pageInterList.push(rowdata['extension']);
            }

            pageInterList.sortNumbers();

            for (i = 0; i < selectedRowsLength; i++) {
                confirmList.push("<font>" + pageInterList[i] + "</font>");
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(confirmList.join('  ')),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG604"))
                        });

                        var DO_SELECTED = function() { // DELETE_SELECTED_USERS();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "deletePaginggroup",
                                    "paginggroup": pageInterList.toString()
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
                                            content: $P.lang("LANG816"),
                                            callback: function() {
                                                jumpPageOrNot(selectedRowsLength);
                                                getNameList();
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
        })
        .delegate('#btnSettings', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG746"),
                displayPos: "editForm",
                frameSrc: "html/paging_intercom_settings.html"
            });

            ev.stopPropagation();
            return false;
        });
}

function bindGridButtonEvent() {
    $("#pageInter-list")
        .delegate('.edit', 'click', function(ev) {
            var pageInterExt = $(this).attr('pageInterExt'),
                page_name = $(this).attr('page_name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG606").format(pageInterExt),
                displayPos: "editForm",
                frameSrc: "html/paging_intercom_modal.html?mode=edit&pageInterExt=" + pageInterExt
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var pageInterExt = $(this).attr('pageInterExt');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG604"), pageInterExt),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteRinggroup",
                            "ringgroup": pageInterExt
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
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            var table = $("#pageInter-list"),
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

function transTable() {
    var container = "<table id='pageInter-list'></table><div id='pageInter-pager'></div>";

    $("#pageInter_div").empty();

    $(container).appendTo("#pageInter_div");

    createTable();

    bindGridButtonEvent();
}

function transMembersData(res) {
    if (!res) {
        return "";
    }

    var res = res.split(',');

    for (var i = 0; i < res.length; i++) {
        var extgroupListObjItem = extgroupListObj[res[i]];

        if (extgroupListObjItem) {
            res[i] = $P.lang("LANG2714") + "--" + extgroupListObjItem["text"];
        }
    }

    return res.join(",");
}

function showMembers(cellvalue, options, rowObject) {
    if (!cellvalue) {
        return "";
    }

    cellvalue = transMembersData(cellvalue);

    var memAry = cellvalue.split(','),
        memAryLength = memAry.length;

    if (memAryLength > 10) {
        return memAry[0] + ',' + memAry[1] + ',...,' + memAry[parseInt(memAryLength / 2)] + ',' + memAry[parseInt(memAryLength / 2) + 1] + ',...,' + memAry[memAryLength - 2] + ',' + memAry[memAryLength - 1];
    } else {
        return cellvalue;
    }
}

function showMembersTitle(rowId, tv, rawObject, cm, rdata) {
    var members = transMembersData(rawObject.members ? rawObject.members : "");

    return 'title="' + members + '"';
}

function createTable() {
    $("#pageInter-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listPaginggroup"
        },
        colNames: [
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG84">' + $P.lang('LANG84') + '</span>',
            '<span locale="LANG128">' + $P.lang('LANG128') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'paginggroup_name',
            index: 'paginggroup_name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'paginggroup_type',
            index: 'paginggroup_type',
            width: 100,
            resizable: false,
            formatter: transTypeData,
            align: "center"
        }, {
            name: 'members',
            index: 'members',
            width: 200,
            resizable: false,
            align: "center",
            formatter: showMembers,
            cellattr: showMembersTitle
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#pageInter-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'extension',
        noData: "LANG129 LANG604",
        jsonReader: {
            root: "response.paginggroup",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#pageInter-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            top.Custom.init(doc);
            $P.lang(doc, true);
        }
    });
}

function createOptions(cellvalue, options, rowObject) {
    var edit = ('<button pageInterExt="' + rowObject.extension + '" title="Edit" localetitle="LANG738" class="options edit"></button>'),
        del = '<button pageInterExt="' + rowObject.extension + '"  title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function jumpPageOrNot(selectedRows) {
    var table = $("#pageInter-list"),
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

function transTypeData(cellvalue, paginggroup_type, rowObject) {
    var paginggroup_type = "";

    if (rowObject.paginggroup_type == "2way") {
        paginggroup_type = '<span locale="LANG1162"></span>';
    } else {
        paginggroup_type = '<span locale="LANG1161"></span>';
    }

    return paginggroup_type;
}

function transData(res, cb) {
    var arr = [];

    pagingExt = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
        }

        pagingExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function removeSuffix(filename) {
    var name = filename.toLocaleLowerCase(),
        file_suffix = [".mp3", ".wav", ".gsm", ".ulaw", ".alaw"];

    for (var i = 0; i < file_suffix.length; i++) {
        var num = name.lastIndexOf(file_suffix[i]);

        if (num != -1 && name.endsWith(file_suffix[i])) {
            filename = filename.substring(0, num);

            return filename;
        }
    }
}
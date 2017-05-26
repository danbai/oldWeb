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
    zeroConfigSettings = {},
    gup = UCMGUI.gup,
    filter = gup.call(window, "filter"),
    BLL = top.zc,
    ZEROCONFIG = top.ZEROCONFIG;

String.prototype.format = top.String.prototype.format;

function getSelectedItems(type) {
    var listTable = $("#item-list"),
        selected = listTable.jqGrid("getGridParam", "selarrrow"),
        localData = listTable.jqGrid('getGridParam', 'data'),
        selectedRowsLength = selected.length,
        ret = [];

    for (var i = 0; i < selectedRowsLength; i++) {
        if (type === "source") {

            // needs to convert into index
            for (var j = 0; j < localData.length; j++) {
                if (localData[j].id == selected[i]) {
                    ret.push(localData[j]);
                    break;
                }
            }
        } else {
            ret.push(listTable.jqGrid('getRowData', selected[i]));
        }
    }

    return ret;
}

function getTotalItems() {
    var listTable = $("#item-list"),
        totalItems = listTable.jqGrid("getGridParam", "records");
    return totalItems;
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function (ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3446"),
                displayPos: "editForm",
                frameSrc: "html/zc_globaltemplate_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnDelete', 'click', function (ev) {
            var confirmItemList = [],
                selectedIds = [];

            var totalItems = getTotalItems();
            var selectedItems = getSelectedItems("source");

            for (var i = 0, len = selectedItems.length; i < len; i++) {
                confirmItemList.push("<font style='float: left; margin-left: 10px; word-break: break-all; text-align: left;'>[" + selectedItems[i].id + "] " + selectedItems[i].name + "</font>");

                selectedIds.push(selectedItems[i].id);
            }

            if (totalItems < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG3455"))
                });

                ev.stopPropagation();
                return false;
            } else if (selectedIds.length < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG3456")
                });

                ev.stopPropagation();
                return false;
            }


            top.dialog.dialogConfirm({
                confirmStr: function () {
                    var tips = '';

                    if (selectedItems.length > 0) {
                        tips = '<br />' + confirmItemList.join('<br/>');
                    }

                    return $P.lang("LANG818").format(tips);
                },
                buttons: {
                    ok: function () {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG11"))
                        });

                        ZEROCONFIG.connector.deleteTemplate(selectedIds).done(function (result) {
                            var bool = UCMGUI.errorHandler(result);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG816"),
                                    callback: function () {
                                        rebuildTable();
                                        // jumpPageOrNot(selectedRowsLength);
                                    }
                                });
                            }
                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                            top.dialog.clearDialog();

                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: errorThrown
                            // });
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
        .delegate('#btnToggle', 'click', function (ev) {
            var confirmItemList = [],
                selectedIds = [];

            var totalItems = getTotalItems();
            var selectedItems = getSelectedItems("source");

            for (var i = 0, len = selectedItems.length; i < len; i++) {
                confirmItemList.push("<font style='float: left; margin-left: 10px; word-break: break-all; text-align: left;'>[" + selectedItems[i].id + "] " + selectedItems[i].name + "</font>");

                selectedIds.push(selectedItems[i].id);
            }

            if (totalItems < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG3455"))
                });

                ev.stopPropagation();
                return false;
            } else if (selectedIds.length < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG3456")
                });

                ev.stopPropagation();
                return false;
            }

            top.dialog.dialogConfirm({
                confirmStr: function () {
                    var tips = '';

                    if (selectedItems.length > 0) {
                        tips = '<br />' + confirmItemList.join('<br/>');
                    }

                    return $P.lang("LANG3457").format(tips);
                },
                buttons: {
                    ok: function () {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG11"))
                        });

                        ZEROCONFIG.connector.toggleTemplateEnable(selectedIds).done(function (result) {
                            var bool = UCMGUI.errorHandler(result);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG844"),
                                    callback: function () {
                                        rebuildTable();
                                        // jumpPageOrNot(selectedRowsLength);
                                    }
                                });
                            }
                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                            top.dialog.clearDialog();

                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: errorThrown
                            // });
                        });
                    },
                    cancel: function () {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $("#item-list")
        .delegate('.edit', 'click', function (ev) {
            var name = UCMGUI.unescapeHTML($(this).attr('tname')),
                id = $(this).attr('tid');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG3455"), name),
                displayPos: "editForm",
                frameSrc: "html/zc_globaltemplate_modal.html?mode=edit&id={0}".format(id)
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function (ev) {
            var name = UCMGUI.unescapeHTML($(this).attr('tname')),
                id = $(this).attr('tid');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format("[" + id + "] " + "<br />" + name),
                buttons: {
                    ok: function () {

                        ZEROCONFIG.connector.deleteTemplate(id).done(function (result) {
                            var bool = UCMGUI.errorHandler(result);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG816"),
                                    callback: function () {
                                        rebuildTable();
                                        // jumpPageOrNot(1);
                                    }
                                });
                            }
                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                            top.dialog.clearDialog();

                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: errorThrown
                            // });
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var escapedName = UCMGUI.escapeHTML(rowObject.name);
    var edit = ("<button class='options edit' localetitle='LANG738' title='" + $P.lang("LANG738") + "' tid='" + rowObject.id + "' tname='" + escapedName + "'></button>"),
        del = ("<button class='options del' localetitle='LANG739' title='" + $P.lang("LANG739") + "' tid='" + rowObject.id + "' tname='" + escapedName + "'></button>");

    return (edit + del);
}

function prepareTemplates(callback) {
    var self = this,
        ret = [];

    // TODO: get template needs to past argument
    ZEROCONFIG.connector.getAllTemplates("global", "").done(function (result) {
        if (result.status == 0) {
            ret = result.response.templates;
        }

        // TOOD: add error handling when status is not 0

        callback.call(self, ret);

        $("div#preparePad").hide();
        $("div#contentPad").show();

    }).fail(function () {
        // TODO: add error display here

        console.error("FAIL", arguments);

        callback.call(self, ret);
    });
}

function rebuildTable() {
    prepareTemplates(function (source) {
        $("#item-list")
            .jqGrid('clearGridData')
            .jqGrid('setGridParam',
            {
                datatype: "local",
                data: source
            })
        .trigger("reloadGrid");
    });
}

function createTable(source) {
    var lastSel;

    $("#item-list").jqGrid({
        datatype: "local",
        data: source,
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        colNames: [
            '<span locale="LANG3449">' + $P.lang('LANG3449') + '</span>',
            '<span locale="LANG3450">' + $P.lang('LANG3450') + '</span>',
            '<span locale="LANG3061">' + $P.lang('LANG3061') + '</span>',
            '<span locale="LANG3453">' + $P.lang('LANG3453') + '</span>',
            '<span locale="LANG3454">' + $P.lang('LANG3454') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'name',
            index: 'name',
            width: 200,
            resizable: false,
            formatter: transData,
            align: "center"
        }, {
            name: 'description',
            index: 'description',
            width: 250,
            resizable: false,
            formatter: transData,
            align: "center"
        }, {
            name: 'enabled',
            index: 'enabled',
            width: 100,
            resizable: false,
            formatter: transData,
            align: "center",
            sortable: true
        }, {
            name: 'used',
            index: 'used',
            width: 120,
            resizable: false,
            formatter: transData,
            align: "center"
        }, {
            name: 'last_modified',
            index: 'last_modified',
            width: 150,
            resizable: false,
            formatter: transData,
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
        pager: "#item-pager",
        rowNum: 30,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'name',
        noData: "LANG129 LANG3455",
        loadComplete: function () {
            $("#item-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function () {
            // $("#goToExtensionPage").unbind('click').bind('click', function () {
            //    top.dialog.dialogConfirm({
            //        confirmStr: $P.lang("LANG843").format($P.lang("LANG85")),
            //        buttons: {
            //            ok: function () {
            //                top.frames['frameContainer'].module.jumpMenu('extension.html');
            //            },
            //            cancel: function () {
            //                top.dialog.clearDialog();
            //            }
            //        }
            //    });
            // });

            // getMacList();

            top.Custom.init(doc);

            $P.lang(doc, true);
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#item-list"),
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

function transData(cellvalue, options, rowObject) {
    var context = '';

    switch (options.colModel.name) {
        case 'name':
            context = '<span class="name">' + cellvalue + '</span>';

            break;
        case 'description':
            if (cellvalue) {
                context = '<span class="desc">' + cellvalue + '</span>';
            } else {
                context = "--";
            }

            break;
        case 'enabled':
            var css = "enabled",
                val = "LANG136"; // Yes

            if (!cellvalue) {
                css = "disabled";
                val = "LANG137";
            }

            context = '<span class="' + css + '" locale="' + val + '">' + $P.lang(val) + '</span>';

            break;
        case 'used':
            context = cellvalue ? cellvalue : '--';

            break;
        case 'last_modified':
            if (cellvalue) {
                var parts = cellvalue.split(" ");

                if (parts.length == 2) {
                    var dateParts = parts[0].split("-"),
                        timeParts = parts[1].split(":");

                    if (dateParts.length == 3 && timeParts.length == 3) {
                        var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);

                        context = date.format("mm/dd/yyyy h:MM TT");
                    } else {
                        context = "unknown";
                    }
                } else {
                    context = "unknown";
                }
            }

            break;
        default:
            context = '';

            break;
    }

    return context;
}

$(function () {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG632"));

    ZEROCONFIG.init();

    bindButtonEvent();

    (function checkReady() {
        if (ZEROCONFIG.isDataReady() == 1) {
            BLL.DataCollection.prepareGlobalList();
            prepareTemplates(createTable);

            var source = $("#invalidModelWarning").html();
            ZEROCONFIG.connector.checkZeroConfigInvalidModels(source, true);
        } else {
            var label = $("div#loadingMsg"),
                tLocale = "LANG805";

            if (ZEROCONFIG.isDataReady() == -1) {
                tLocale = "LANG3717";
            }

            if (label.attr("locale") != tLocale) {
                label.attr("locale", tLocale);
                label.text($P.lang(tLocale));
            }

            setTimeout(checkReady, 1000);
        }
    })();
});

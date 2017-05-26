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
    numberList = [],
    portExtensionList = [],
    faxNameList = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.sortNumbers = top.Array.prototype.sortNumbers;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG614"));

    initPage();
});

function initPage() {
    var role = $P.cookie('role');

    if (role == 'privilege_3') {
        $('#fax_extension_div').hide();

        listFaxFile();
    } else {
        $('#list_fax_file').hide();

        initValidator();

        createTable();

        getRange();

        getPortExtension();

        getNameList();
    }

    bindButtonEvent();
}

// bug29745
function noRecords() {
    var total = $("#faxFiles_list").getGridParam("records");

    if (total == 0) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG129").format($P.lang("LANG2988"))
        });

        return true;
    }

    return false;
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

function getRange() {
    extensionRange = UCMGUI.isExist.getRange('fax');
}

function getNameList() {
    numberList = UCMGUI.isExist.getList("getNumberList");
    faxNameList = UCMGUI.isExist.getList("getFaxNameList");
}

function createTable() {
    $("#fax_list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listFax"
        },
        colNames: [
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG126">' + $P.lang('LANG126') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'fax_name',
            index: 'fax_name',
            width: 100,
            resizable: false,
            align: "center",
        }, {
            name: 'email',
            index: 'email',
            width: 180,
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
        pager: "#fax_list_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: "extension",
        noData: "LANG129 LANG1268",
        jsonReader: {
            root: "response.fax",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadError: function() {
            listFaxFile();
        },
        loadComplete: function() {
            $("#fax_list .jqgrow:even").addClass("ui-row-even");

            listFaxFile();
        },
        gridComplete: function() {
            top.Custom.init(doc);

            $P.lang(document, true);
        }
    });
}

function tranSize(cellvalue, options, rowObject) {
    return UCMGUI.tranSize(rowObject.s);
}

function createListFaxFileOptions(cellvalue, options, rowObject) {
    var download = '<button fileName="' + rowObject.n + '" title="download" localetitle="LANG759" class="options download"></button>',
        del = '<button fileName="' + rowObject.n + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (download + del);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "file_keyword": {
                digits: true
            }
        },
        submitHandler: function() {
            var fileKeyword = $('#file_keyword').val();

            $("#faxFiles_list").setGridParam({
                postData: {
                    filter: JSON.stringify({
                        "list_dir": 0,
                        "list_file": 1,
                        "file_keyword": fileKeyword ? '-' + fileKeyword + '-' : ''
                    })
                }
            }).trigger('reloadGrid');
        }
    });
}

function listFaxFile() {
    $("#faxFiles_list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            action: "listFile",
            type: "fax",
            filter: JSON.stringify({
                "list_dir": 0,
                "list_file": 1,
                "file_keyword": ''
            })
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
            width: 200,
            resizable: false,
            align: "center"
        }, {
            name: 'd',
            index: 'd',
            // width: 100,
            resizable: false,
            align: "center",
        }, {
            name: 's',
            index: 's',
            // width: 150,
            resizable: false,
            formatter: tranSize,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createListFaxFileOptions,
            sortable: false
        }],
        pager: "#faxFiles_list_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: "d",
        sortorder: 'desc',
        noData: "LANG129 LANG2988",
        jsonReader: {
            root: "response.fax",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#faxFiles_list .jqgrow:even").addClass("ui-row-even");
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
                dialogTitle: $P.lang("LANG752"),
                displayPos: "editForm",
                frameSrc: "html/fax_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#batchDelete', 'click', function(ev) {
            var faxTable = $("#fax_list"),
                selected = faxTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                faxList = [],
                confirmList = [],
                i = 0,
                rowdata;

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG11"))
                });

                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = faxTable.jqGrid('getRowData', selected[i]);
                faxList.push(rowdata['extension']);
            }

            faxList.sortNumbers();

            for (i = 0; i < selectedRowsLength; i++) {
                confirmList.push("<font>" + faxList[i] + "</font>");
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(confirmList.join('  ')),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG11"))
                        });

                        var DO_SELECTED = function() { // DELETE_SELECTED_USERS();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "deleteFax",
                                    "fax": faxList.toString()
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
        .delegate('#settings', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG753"),
                displayPos: "editForm",
                frameSrc: "html/fax_settings.html"
            });

            ev.stopPropagation();
            return false;
        });

    $("#fax_list")
        .delegate('.edit', 'click', function(ev) {
            var extension = $(this).attr('extension');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG615").format(extension),
                displayPos: "editForm",
                frameSrc: "html/fax_modal.html?mode=edit&extension=" + extension
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var extension = $(this).attr('extension');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(extension),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteFax",
                            "fax": extension
                        };

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
                                    jumpPageOrNot(1);

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

    $("#faxFiles_list")
        .delegate('.download', 'click', function(ev) {
            var fileName = $(this).attr("fileName");

            $.ajax({
                type: "post",
                url: baseServerURl,
                data: {
                    "action": "checkFile",
                    "type": "fax",
                    "data": fileName
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                        window.open("/cgi?action=downloadFile&type=fax&data=" + fileName, '_self');
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
        })
        .delegate('.del', 'click', function(ev) {
            var fileName = $(this).attr("fileName");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(fileName),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: baseServerURl,
                            data: {
                                "action": "checkFile",
                                "type": "fax",
                                "data": fileName
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                top.dialog.clearDialog();

                                // top.dialog.dialogMessage({
                                //     type: 'error',
                                //     content: errorThrown
                                // });
                            },
                            success: function(data) {
                                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                                    $.ajax({
                                        type: "post",
                                        url: baseServerURl,
                                        data: {
                                            "action": "removeFile",
                                            "type": "fax",
                                            "data": fileName
                                        },
                                        error: function(jqXHR, textStatus, errorThrown) {
                                            top.dialog.clearDialog();

                                            // top.dialog.dialogMessage({
                                            //     type: 'error',
                                            //     content: errorThrown
                                            // });
                                        },
                                        success: function(data) {
                                            var bool = UCMGUI.errorHandler(data);

                                            if (bool) {
                                                var table = $("#faxFiles_list"),
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
        });

    $("#form")
        .delegate('#btnDeleteAll', 'click', function(ev) {
            if (noRecords()) {
                return;
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2794"),
                buttons: {
                    ok: function() {
                        var filter = JSON.parse($("#faxFiles_list").getGridParam('postData').filter),
                            action = {
                                "action": "batchRemoveFile",
                                "type": "fax",
                                "data": filter.file_keyword
                            };

                        $.ajax({
                            type: "post",
                            url: baseServerURl,
                            data: action,
                            error: function(jqXHR, textStatus, errorThrown) {
                                // top.dialog.dialogMessage({
                                //  type: 'error',
                                //  content: errorThrown
                                // });
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data);

                                if (bool) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG819"),
                                        callback: function() {
                                            $("#faxFiles_list").setGridParam({
                                                page: 1
                                            }).trigger('reloadGrid');
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
        })
        .delegate('#batchDeleteSelected', 'click', function(ev) {
            if (noRecords()) {
                return;
            }

            var faxTable = $("#faxFiles_list"),
                selected = faxTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                faxFilesList = [],
                confirmList = [],
                divContainer = '',
                i = 0,
                rowdata;

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG2988"))
                });

                ev.stopPropagation();
                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = faxTable.jqGrid('getRowData', selected[i]);
                faxFilesList.push(rowdata['n']);
            }

            for (i = 0; i < selectedRowsLength; i++) {
                confirmList.push("<font>" + faxFilesList[i] + "</font>");
            }

            divContainer = '<div style="display: inline-block; max-height: 300px; text-align: left; overflow-y: auto;">' +
                confirmList.join('<br />') + '</div>';

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(divContainer),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG2988"))
                        });

                        var DO_SELECTED = function(index, faxFilesList) { // DELETE_SELECTED_USERS();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                async: false,
                                data: {
                                    "action": "removeFile",
                                    "type": "fax",
                                    "data": faxFilesList[index]
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
                                        if (++index >= selectedRowsLength) {
                                            top.dialog.dialogMessage({
                                                type: 'success',
                                                content: $P.lang("LANG819"),
                                                callback: function() {
                                                    var table = $("#faxFiles_list"),
                                                        totalPage = table.getGridParam("lastpage"),
                                                        page = table.getGridParam("page"),
                                                        reccount = table.getGridParam("reccount");

                                                    if (page === totalPage && totalPage > 1 && reccount === selectedRowsLength) {
                                                        table.setGridParam({
                                                            page: totalPage - 1
                                                        }).trigger('reloadGrid');
                                                    } else {
                                                        table.trigger('reloadGrid');
                                                    }
                                                }
                                            });
                                        } else {
                                            DO_SELECTED(index, faxFilesList);
                                        }
                                    }
                                }
                            });
                        };

                        setTimeout(function() {
                            DO_SELECTED(0, faxFilesList);
                        }, 100);
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
    var edit = '<button extension="' + rowObject.extension + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button extension="' + rowObject.extension + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function jumpPageOrNot(selectedRows) {
    var table = $("#fax_list"),
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

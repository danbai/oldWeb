/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = "",
    remoteLangList = [],
    localLangList = mWindow.localLangList;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    mode = gup.call(window, "mode");

    setTimeout(function() {
        createTable();
        bindButtonEvent();
    }, 1000);

    top.Custom.init(doc);
});

function createTable() {
    $("#language_list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: 700,
        height: "auto",
        postData: {
            "action": "fetchRemoteLanguageList"
        },
        colNames: [
            '<span locale="LANG781">' + $P.lang('LANG781') + '</span>',
            '<span locale="LANG2466">' + $P.lang('LANG2466') + '</span>',
            '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'language',
            index: 'language',
            // width: 200,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'version',
            index: 'version',
            // width: 150,
            resizable: false,
            align: "center",
            formatter: tansData,
            sortable: false
        }, {
            name: 'size',
            index: 'size',
            // width: 100,
            resizable: false,
            align: "center",
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
        pager: "#language_pager",
        multiselect: false,
        // multiboxonly: true,
        viewrecords: true,
        sortname: "language",
        noData: "LANG2463",
        jsonReader: {
            root: "response.language_list",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#language_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(document, true);

            // Pengcheng Zou move this code form 'loadComplete function'
            top.dialog.dialog.hide();
            top.dialog.container.show();

            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
            }

            if (UCMGUI.config.msie) { // for ie
                $(".ui-pager-control > table.ui-pg-table").css("table-layout", "auto");
                // $("td[id$='pager_right']").css("table-layout", "auto");
            }

            if (UCMGUI.config.mozilla) { // for firefox
                $("#language_list").setGridWidth(doc.documentElement.clientWidth - 50);
                $(".ui-pager-control > table.ui-pg-table").css("table-layout", "auto");
                $("#gbox_language_list").show();
            }

            top.dialog.repositionDialog();
        }
    });
}

function tansData(cellvalue, version, rowObject) {
    var version = rowObject.version + "/-";

    for (var i = 0; i < localLangList.length; i++) {
        if (localLangList[i].language_name == rowObject.language) {
            version = rowObject.version + "/" + localLangList[i].version;
        }
    }

    return version;
}

function createOptions(cellvalue, options, rowObject) {
    var upgrade = $("<button>").attr({
        "class": "options upgrade",
        "filename": rowObject.filename,
        "title": "Upgrade",
        "localetitle": "LANG61"
    });

    var download = $("<button>").attr({
        "class": "options download",
        "filename": rowObject.filename,
        "title": "Download and Install",
        "localetitle": "LANG2465"
    });

    for (var i = 0; i < localLangList.length; i++) {
        if (localLangList[i].language_name == rowObject.language) {
            if (localLangList[i].version == rowObject.version) {
                upgrade.addClass("disabled").css('cursor', 'default').attr('disabled', true);
            }

            // else {
            //     // Need upgrade
            //     $("#btn_English").parent().parent().attr({"color": "blue", "font-weight": "bold"});
            // }

            return upgrade[0].outerHTML;
        }
    }

    return download[0].outerHTML;
}

function bindButtonEvent() {
    $("#language_list")
        .delegate('.upgrade', 'click', function(ev) {
            downloadVoicePrompt(this);
            ev.stopPropagation();
            return false;
        })
        .delegate('.download', 'click', function(ev) {
            downloadVoicePrompt(this);
            ev.stopPropagation();
            return false;
        });
}

function downloadVoicePrompt(obj) {
    var filename = $(obj).attr("filename"),
        susContent = "",
        loadContent = "";

    if (obj.className.contains("download")) {
        loadContent = $P.lang("LANG2462").format($P.lang("LANG2468"));
        susContent = $P.lang("LANG3841").format($P.lang("LANG2468"), $P.lang("LANG2473"));
    } else if (obj.className.contains("upgrade")) {
        loadContent = $P.lang("LANG2469").format($P.lang("LANG2468"));
        susContent = $P.lang("LANG3841").format($P.lang("LANG2468"), $P.lang("LANG2472"));
    }

    if (!filename) {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG916"),
            callback: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        });
        return;
    } else {
        top.dialog.dialogMessage({
            type: 'loading',
            content: loadContent
        });
    }

    var action = {
        action: "fetchRemoteLanguagePackage",
        "package": filename
    };

    $.ajax({
        type: "POST",
        url: baseServerURl,
        data: action,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: susContent,
                    callback: function() {
                        mWindow.getLanguageList();

                        mWindow.getCurrentLanguage();

                        $("#" + mWindow.currentLanguage, mWindow.document).attr("checked", true);

                        top.Custom.init(mWindow.document);
                    }
                });
            }
        }
    });
}
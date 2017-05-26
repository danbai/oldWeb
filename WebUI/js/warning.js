/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    warningName = ['<div locale="LANG2591">' + $P.lang("LANG2591") + '</div>',
        '<div locale="LANG2592">' + $P.lang("LANG2592") + '</div>',
        '<div locale="LANG2593">' + $P.lang("LANG2593") + '</div>',
        '<div locale="LANG2594">' + $P.lang("LANG2594") + '</div>',
        '<div locale="LANG2595">' + $P.lang("LANG2595") + '</div>',
        '<div locale="LANG2681">' + $P.lang("LANG2681") + '</div>',
        '<div locale="LANG2758">' + $P.lang("LANG2758") + '</div>',
        '<div locale="LANG2759">' + $P.lang("LANG2759") + '</div>',
        '<div locale="LANG2760">' + $P.lang("LANG2760") + '</div>',
        '<div locale="LANG2761">' + $P.lang("LANG2761") + '</div>',
        '<div locale="LANG2762">' + $P.lang("LANG2762") + '</div>',
        '<div locale="LANG3183">' + $P.lang("LANG3183") + '</div>',
        '<div locale="LANG3184">' + $P.lang("LANG3184") + '</div>',
        '<div locale="LANG3277">' + $P.lang("LANG3277") + '</div>',
        '<div locale="LANG3278">' + $P.lang("LANG3278") + '</div>',
        '<div locale="LANG3504">' + $P.lang("LANG3504") + '</div>',
        '<div locale="LANG4779">' + $P.lang("LANG4779") + '</div>',
        '<div locale="LANG4780">' + $P.lang("LANG4780") + '</div>'
    ],
    warningType = ['<div locale="LANG2597">' + $P.lang("LANG2597") + '</div>',
        '<div locale="LANG2596">' + $P.lang("LANG2596") + '</div>'
    ],
    dataPost = {};

String.prototype.trim = top.String.prototype.trim;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    top.document.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2581"));

    listAlertLog();

    initValidator();

    $("#startfrom").datetimepicker({
        showOn: "button",
        buttonImage: "../images/calendar.png",
        buttonImageOnly: true,
        buttonText: '',
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm'
    });

    $("#startto").datetimepicker({
        showOn: "button",
        buttonImage: "../images/calendar.png",
        buttonImageOnly: true,
        buttonText: '',
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm'
    });

    $('#alertLog')
        .delegate('.downloadCoredumpFile', 'click', function(ev) {
            var fileName = $(this).attr("file");

            $.ajax({
                type: "GET",
                dataType: "json",
                async: false,
                url: "../cgi?action=checkFile&type=coredump&data=" + fileName,
                error: function(jqXHR, textStatus, errorThrown) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: errorThrown
                    });
                },
                success: function(data) {
                    var status = data.hasOwnProperty('status') ? data.status : null,
                        existed = false;

                    if (status == 0) {
                        if (data.response.result == '0') {
                            existed = true;
                        }

                        if (existed) {
                            window.open("/cgi?action=downloadFile&type=coredump&data=" + fileName);
                        } else {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG2684")
                            });
                        }
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG2684")
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $('#btnDeleteSearchResult').on('click', deleteSearchResult);
    $('#btnDeleteAll').on('click', deleteAll);
});

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "startfrom": {
                smallerTime: [$P.lang("LANG1048"), $P.lang("LANG1049"), $('#startto')]
            },
            "startto": {
                biggerTime: [$P.lang("LANG1049"), $P.lang("LANG1048"), $('#startfrom')]
            }
        },
        newValidator: true,
        submitHandler: function() {
            selectLog();
        }
    });
}

function listAlertLog(option_search) {
    $("#alertLog").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: (doc.documentElement.clientWidth - 50),
        height: "auto",
        postData: {
            "action": "listWarningLog",
            "options": "id,time,action,content,row_num"
        },
        colNames: [
            '<span locale="LANG2548">' + $P.lang('LANG2548') + '</span>',
            '<span locale="LANG2549">' + $P.lang('LANG2549') + '</span>',
            '<span locale="LANG2550">' + $P.lang('LANG2550') + '</span>',
            '<span locale="LANG2551">' + $P.lang('LANG2551') + '</span>'
        ],
        colModel: [{
            name: 'time',
            index: 'time',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'id',
            index: 'id',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transID
        }, {
            name: 'action',
            index: 'action',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transAction
        }, {
            name: 'content',
            index: 'content',
            width: 300,
            resizable: false,
            align: "center",
            formatter: transContent
        }],
        pager: "#alertLogPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'time',
        sortorder: 'desc',
        noData: "LANG129 LANG2547",
        jsonReader: {
            root: "response.warning_log",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#alertLog .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            top.dialog.clearDialog();

            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function transID(cellvalue, options, rowObject) {
    return warningName[cellvalue - 1];
}

function transAction(cellvalue, options, rowObject) {
    return cellvalue == 0 ? warningType[0] : warningType[1];
}

function transContent(cellvalue, options, rowObject) {
    var id = rowObject.id,
        response = '',
        value = cellvalue,
        content = value.split("|");

    if (id == 4 || id == 16) {
        response = '<div locale="' + content[0].trim() + " '" + content[1].trim() + "'" + '">' + $P.lang(content[0].trim()).format(content[1].trim()) + '</div>';
    } else if (id == 6) {
        if (content.length == 5) {
            response = content[0].trim() +
                    ' <div locale="' + content[1].trim() + '" style="display: inline-block;">' + $P.lang(content[1].trim()) + '</div><div style="display: inline-block;">' +
                    content[2].trim() +
                    '</div><div locale="' + content[3].trim() + '" style="display: inline-block;">' + $P.lang(content[3].trim()) + '</div><div style="display: inline-block;">' +
                    '</div><div locale="LANG2683" class="downloadCoredumpFile" style="padding-left: 3px; text-decoration: underline; color: #225685; display: inline-block; cursor: pointer;" localetitle="LANG224" title="Download File" file="' + content[4].trim() + '">' + $P.lang("LANG2683") + '</div>';
        } else if (content.length == 4) {
            response = content[0].trim() +
                    ' <div locale="' + content[1].trim() + '" style="display: inline-block;">' + $P.lang(content[1].trim()) + '</div><div style="display: inline-block;">' +
                    content[2].trim() +
                    '</div><div locale="' + content[3].trim() + '" style="display: inline-block;">' + $P.lang(content[3].trim()) + '</div><div style="display: inline-block;">' +
                    '</div>';
        } 
    } else if (id == 7 || id == 15) {
        response = '<div locale="LANG2696 ' + content[0].trim() + " '" + content[1].trim() + "' " + content[2].trim() +
            " '" + content[3].trim() + "'" + '">' + $P.lang('LANG2696').format($P.lang(content[0].trim()), content[1].trim(), $P.lang(content[2].trim()), content[3].trim()) + '</div>';
    } else if (id == 8) {
        response = '<div locale="LANG564 ' + content[0].trim() + " '" + content[1].trim() + "' " + content[2].trim() +
            " '" + content[3].trim() + "' " + content[4].trim() + " '" + content[5].trim() + "'" + '">' +
            $P.lang('LANG564').format($P.lang(content[0].trim()), content[1].trim(), $P.lang(content[2].trim()), content[3].trim(), $P.lang(content[4].trim()), content[5].trim()) + '</div>';
    } else if (id == 14) {
        response = '<div locale="LANG566 ' + content[0].trim() + " '" + content[1].trim() + "'" + '">' + $P.lang('LANG566').format($P.lang(content[0].trim()), content[1].trim()) + '</div>';
    } else if (id == 10 || id == 11 || id == 14 || id == 17) {
        if (content.length === 3) {
            response = '<div locale="LANG567 ' + content[0].trim() + " '" + content[1].trim() + " ', " + content[2].trim() + "'" + '">' + $P.lang('LANG567').format($P.lang(content[0].trim()), content[1].trim(), content[2].trim()) + '</div>';
        } else if (content.length === 2) {
            response = '<div locale="LANG566 ' + content[0].trim() + " '" + content[1].trim() + "'" + '">' + $P.lang('LANG566').format($P.lang(content[0].trim()), content[1].trim()) + '</div>';
        }
    } else if (id == 3) {
        if (content.length == 5) {
            response = '<div locale="LANG2782 ' + content[0].trim() + ' ' + content[1].trim() + " '" + content[2].trim() + "' " + content[3].trim() +
                " '" + content[4].trim() + "'" + '">' + $P.lang('LANG2782').format($P.lang(content[0].trim()), $P.lang(content[1].trim()), content[2].trim(), $P.lang(content[3].trim()), content[4].trim()) + '</div>';
        } else {
            response = '<div locale="' + value.trim() + '">' + $P.lang(value.trim()) + '</div>';
        }
    } else if (id == 1 || id == 18) {
        if (content.length == 6) {
            response = content[5].trim() + ' ' + '<div locale="LANG2782 ' + content[0].trim() + ' ' + content[1].trim() + " '" + content[2].trim() + "' " + content[3].trim() +
                " '" + content[4].trim() + "'" + '" style="display: inline-block; ">' + $P.lang('LANG2782').format($P.lang(content[0].trim()), $P.lang(content[1].trim()), content[2].trim(), $P.lang(content[3].trim()), content[4].trim()) + '</div>';
        } else {
            response = '<div locale="' + value.trim() + '">' + $P.lang(value.trim()) + '</div>';
        }
    } else if (id == 12) {
        if (content.length == 6) {
            response = '<div locale="LANG564 ' + content[0].trim() + " '" + content[1].trim() + "' " + content[2].trim() +
                " '" + content[3].trim() + "' " + content[4].trim() + " '" + content[5].trim() + "'" + '">' +
                $P.lang('LANG564').format($P.lang(content[0].trim()), content[1].trim(), $P.lang(content[2].trim()), content[3].trim(), $P.lang(content[4].trim()), content[5].trim()) + '</div>';
        } else if (content.length == 7) {
            response = '<div locale="LANG3185 ' + content[0].trim() + " '" + content[1].trim() + "' " + content[2].trim() +
                " '" + content[3].trim() + "' " + content[4].trim() + " '" + content[5].trim() + "' '" + content[6].trim() + "'" + '">' +
                $P.lang('LANG3185').format($P.lang(content[0].trim()), content[1].trim(), $P.lang(content[2].trim()), content[3].trim(), $P.lang(content[4].trim()), content[5].trim(), content[6].trim()) + '</div>';
        }
    } else if (id == 13) {
        if (content.length == 8) {
            response = '<div locale="LANG3186 ' + content[0].trim() + " '" + content[1].trim() + "' " + content[2].trim() +
                " '" + content[3].trim() + "' " + content[4].trim() + " '" + content[5].trim() + "' " + content[6].trim() + " '" + content[7].trim() + "'" + '">' +
                $P.lang('LANG3186').format($P.lang(content[0].trim()), content[1].trim(), $P.lang(content[2].trim()), content[3].trim(), $P.lang(content[4].trim()), content[5].trim(), $P.lang(content[6].trim()), content[7].trim()) + '</div>';
        } else if (content.length == 9) {
            response = '<div locale="LANG3187 ' + content[0].trim() + " '" + content[1].trim() + "' " + content[2].trim() +
                " '" + content[3].trim() + "' " + content[4].trim() + " '" + content[5].trim() + "' " + content[6].trim() + " '" + content[7].trim() + "' '" + content[8].trim() + "'" + '">' +
                $P.lang('LANG3187').format($P.lang(content[0].trim()), content[1].trim(), $P.lang(content[2].trim()), content[3].trim(), $P.lang(content[4].trim()), content[5].trim(), $P.lang(content[6].trim()), content[7].trim(), content[8].trim()) + '</div>';
        }
    } else {
        response = '<div locale="' + cellvalue.trim() + '">' + $P.lang(cellvalue.trim()) + '</div>';
    }

    return response;
}

function deleteSearchResult() {
    if (noRecords()) {
        return;
    }

    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG4072"),
        buttons: {
            ok: function() {
                sendDeleteRequest(dataPost);
            }
        }
    });
}

function deleteAll() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG840"),
        buttons: {
            ok: function() {
                sendDeleteRequest();
            }
        }
    });
}

function noRecords() {
    var total = $("#alertLog").getGridParam("records");

    if (total == 0) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG129").format($P.lang("LANG2547"))
        });

        return true;
    }

    return false;
}

function selectLog() {
    var txt = $P.lang("LANG3773");

    top.dialog.dialogMessage({
        type: "loading",
        title: txt,
        content: txt
    });

    setTimeout(function() {
        dataPost = {
            "logid": $('#logid').val(),
            "logstartfrom": $('#startfrom').val(),
            "logstartto": $('#startto').val(),
            "logaction": $('#type').val()
        };

        $("#alertLog")
            .setGridParam({
                postData: dataPost,
                page: 1
            })
            .trigger('reloadGrid');
    }, 200);
}

function sendDeleteRequest(params) {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG877")
    });

    setTimeout(function() {
        if (params) {
            params.action = "warningDeleteLog";
        } else {
            params = {
                "action": "warningDeleteLog"
            };
        }

        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            url: "../cgi",
            data: params,
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG913")
                });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG819"),
                        callback: function() {
                            $("#alertLog")
                                .setGridParam({
                                    page: 1
                                })
                                .trigger('reloadGrid');
                        }
                    });
                }
            }
        });
    }, 200);
}
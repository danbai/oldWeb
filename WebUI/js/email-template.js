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
    emailType = {
        'account': 'LANG85',
        'cdr': 'LANG7',
        'conference': 'LANG3775',
        'alert': 'LANG2553',
        'fax': 'LANG95',
        'password': 'LANG2810',
        'voicemail': 'LANG20',
        'sip_account': 'LANG2927',
        'iax_account': 'LANG2928',
        'fxs_account': 'LANG2929'
    };

String.prototype.format = top.String.prototype.format;
Array.prototype.format = top.Array.prototype.each;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4572"));

    bindButtonEvent();

    createTable();
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnUpload', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4573").format($P.lang('LANG4576')),
                displayPos: "form",
                frameSrc: "html/email_template_upload.html"
            });

            ev.stopPropagation();
            return false;
        });

    $("#emailTemplateList")
        .delegate('.edit', 'click', function(ev) {
            var type = $(this).attr('emailType');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG4576"), $P.lang(emailType[type])),
                displayPos: "editTemplate",
                frameSrc: "html/email_template_modal.html?type={0}".format(type)
            });

            ev.stopPropagation();
            return false;
        })
        .delegate(".download", "click", function(ev) {
            var type = $(this).attr("emailType"),
                filename = $(this).attr("filename");

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "checkFile",
                    "type": type,
                    "data": filename
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                        window.open("/cgi?action=downloadFile&type=" + type + "&data=" + filename, '_self');
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

function createOptions(cellvalue, options, rowObject) {
    var edit,
        type,
        download,
        filename = rowObject.n;

    type = filename.substr(0, filename.length - 14);

    if (emailType[type]) {
        edit = '<button emailType="' + type + '" filename="' + filename + '" title="Edit" localetitle="LANG738" class="options edit"></button>';
        download = '<button emailType="' + type + '" filename="' + filename + '" title="Download" localetitle="LANG759" class="options download"></button>';
    } else {
        edit = '<button filename="' + filename + '" title="Edit" localetitle="LANG738" class="options edit disabled" disabled></button>';
        download = '<button  filename="' + filename + '" title="Download" localetitle="LANG759" class="options download disabled" disabled></button>';
    }


    return edit;
}

function createTable() {
    var fileList = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            "action": "listFile",
            "type": "account_template",
            "item_num": "1000000",
            "sord": "desc",
            "sidx": "d"
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
                var templates = data.response.account_template;

                $.each(templates, function(index, item) {
                    var name = item.n,
                        type = name.substr(0, name.length - 14);

                    if (emailType[type]) {
                        fileList.push(item);
                    }
                });
            }
        }
    });

    $("#emailTemplateList").jqGrid({
        // url: "../cgi?",
        // mtype: "POST",
        // postData: {
        //     "action": "listFile",
        //     "type": "account_template"
        // },
        datatype: "local",
        data: fileList,
        width: $('.page').width(),
        height: "auto",
        colNames: [
            '<span locale="LANG84">' + $P.lang('LANG84') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG247">' + $P.lang('LANG247') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'type',
            index: 'type',
            width: 100,
            resizable: false,
            align: "center",
            formatter: tranType,
            sortable: false
        }, {
            name: 'n',
            index: 'n',
            width: 100,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'd',
            index: 'd',
            width: 100,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#emailTemplatePager",
        rowNum: 10,
        // rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        // sortname: 'd',
        // sortorder: 'desc',
        noData: "LANG129 LANG4572",
        // jsonReader: {
        //     root: "response.account_template",
        //     page: "response.page",
        //     total: "response.total_page",
        //     records: "response.total_item",
        //     repeatitems: false
        // },
        loadComplete: function() {
            $("#emailTemplateList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function tranType(cellvalue, options, rowObject) {
    var span,
        type,
        locale,
        filename = rowObject.n;

    type = filename.substr(0, filename.length - 14);
    locale = emailType[type];

    if (!locale) {
        locale = 'LANG2403';
    }

    span = '<span locale="' + locale + '"></span>'

    return span;
}

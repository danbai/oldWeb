/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    selectbox = UCMGUI.domFunction.selectbox,
    queryData = {},
    moduleLocales = {
        'account': 'LANG85',
        'voicemail': 'LANG20',
        'conference': 'LANG3775',
        'password': 'LANG2810',
        'alert': 'LANG2553',
        'cdr': 'LANG7',
        'fax': 'LANG95',
        'test': 'LANG2273'
    };

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    top.document.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG5382"));

    createTable();

    initValidator();

    bindEvent();
});

function bindEvent() {
    $("#start_date").datetimepicker({
        showOn: "button",
        buttonImage: "../images/calendar.png",
        buttonImageOnly: true,
        buttonText: '',
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm'
    });

    $("#end_date").datetimepicker({
        showOn: "button",
        buttonImage: "../images/calendar.png",
        buttonImageOnly: true,
        buttonText: '',
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm'
    });

    $('.top_buttons')
        .delegate('#DeleteAll', 'click', function(ev) {
            var records = $("#emailSendLog").getGridParam("records"),
                confirmText = "LANG840";

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG5382"))
                });

                return false;
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang(confirmText),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG877")
                        });
                        
                        var action = {
                                action: "deleteMailSendLogAll"
                            };

                        // $.extend(action, queryData);

                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            async: false,
                            url: "../cgi?",
                            data: action,
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
                                    var table = $("#emailSendLog"),
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
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#showAll', 'click', function(ev) {
            var txt = $P.lang("LANG3773"),
                postData = {
                    "action": "listMailSendLog",
                    "options": "id,date,module,recipient,send_time,send_to,send_result,return_code"
                };

            top.dialog.dialogMessage({
                type: "loading",
                title: txt,
                content: txt
            });

            $('#start_date, #end_date, #recipient, #send_result, #return_code, #module').val('');

            queryData = {
                "start_date": "",
                "end_date": "",
                "recipient": "",
                "send_result": "",
                "return_code": "",
                "module": ""
            };

            $.extend(postData, queryData);

            setTimeout(function() {
                $('#emailSendLog')
                    .setGridParam({
                        postData: postData,
                        page: 1
                    })
                    .trigger('reloadGrid');
            }, 200);

            ev.stopPropagation();
            return false;
        });

    $("#emailSendLog")
        .delegate('.detail', 'click', function(ev) {
            var id = $(this).attr('logId');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3923"),
                displayPos: "editForm",
                frameSrc: "html/email_send_log_modal.html?detailNum=" + id
            });

            ev.stopPropagation();
            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var detail = '<button type="button" logId="' + rowObject.id + '" class="options detail" localetitle="LANG3923"></button>';

    return detail;
}

function checkTime(val, ele) {
    if (val === '' || val.match(/^\d{4}\-\d{2}\-\d{2}\s\d{2}:\d{2}$/)) {
        return true;
    }

    return false;
}

function createTable() {
    $("#emailSendLog").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: (doc.documentElement.clientWidth - 50),
        height: "auto",
        postData: {
            "action": "listMailSendLog",
            "options": "id,date,module,recipient,send_time,send_to,send_result,return_code"
        },
        colNames: [
            '<span locale="LANG5383">' + $P.lang('LANG5383') + '</span>',
            '<span locale="LANG5384">' + $P.lang('LANG5384') + '</span>',
            '<span locale="LANG5385">' + $P.lang('LANG5385') + '</span>',
            '<span locale="LANG5386">' + $P.lang('LANG5386') + '</span>',
            '<span locale="LANG5387">' + $P.lang('LANG5387') + '</span>',
            '<span locale="LANG5388">' + $P.lang('LANG5388') + '</span>',
            '<span locale="LANG5389">' + $P.lang('LANG5389') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'date',
            index: 'date',
            width: 200,
            resizable: false,
            align: "center"
        }, {
            name: 'module',
            index: 'module',
            width: 200,
            resizable: false,
            align: "center",
            formatter: transModules
        }, {
            name: 'recipient',
            index: 'recipient',
            width: 200,
            resizable: false,
            align: "center"
        }, {
            name: 'send_time',
            index: 'send_time',
            width: 200,
            resizable: false,
            align: "center",
            hidden: true
        }, {
            name: 'send_to',
            index: 'send_to',
            width: 200,
            resizable: false,
            align: "center",
            hidden: true
        }, {
            name: 'send_result',
            index: 'send_result',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'return_code',
            index: 'return_code',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        loadui: 'disable',
        pager: "#emailSendLogPager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'date',
        sortorder: 'desc',
        noData: "LANG129 LANG5382",
        jsonReader: {
            root: "response.mail_send_log",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#emailSendLog .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);

            top.dialog.clearDialog();
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "start_date": {
                customCallback: [$P.lang("LANG2767"), checkTime],
                smallerTime: [$P.lang("LANG1048"), $P.lang("LANG1049"), $('#toDate')]
            },
            "end_date": {
                customCallback: [$P.lang("LANG2767"), checkTime]
                // biggerTime: [$P.lang("LANG1049"), $P.lang("LANG1048"), $('#fromDate')]
            },
            "recipient": {
                keyboradNoSpace: true
            },
            "send_result": {
                keyboradNoSpace: true
            },
            "return_code": {
                digits: true
            }
        },
        newValidator: true,
        submitHandler: function() {
            var txt = $P.lang("LANG3773"),
                postData = {
                    "action": "listMailSendLog",
                    "options": "id,date,module,recipient,send_time,send_to,send_result,return_code"
                };

            top.dialog.dialogMessage({
                type: "loading",
                title: txt,
                content: txt
            });

            queryData = {
                "start_date": $("#start_date").val(),
                "end_date": $("#end_date").val(),
                "recipient": $("#recipient").val(),
                "send_result": $("#send_result").val(),
                "return_code": $("#return_code").val(),
                "module": $("#module").val()
            };

            $.extend(postData, queryData);

            setTimeout(function() {
                $('#emailSendLog')
                    .setGridParam({
                        postData: postData,
                        page: 1
                    })
                    .trigger('reloadGrid');
            }, 200);
        }
    });
}

function transModules(cellvalue, options, rowObject) {
    var val = moduleLocales[cellvalue];

    if (!val) {
        val = "LANG2403";
    }

    return "<span locale='" + val + "'>" + $P.lang(val) + "</span>";
}
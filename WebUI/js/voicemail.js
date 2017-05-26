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
    baseServerURl = config.paths.baseServerURl;

Array.prototype.each = top.Array.prototype.each;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG651"));

    initPage();
});

function initPage() {
    var role = $P.cookie('role');

    if (role == 'privilege_3') {
        $('#voicemail_settings').hide();

        listVoicemailFile();

        bindButtonEvent();
    } else {
        $('#voicemail_file_list_div').hide();

        UCMGUI.domFunction.enableCheckBox({
            enableCheckBox: "operator",
            enableList: ['operator_exten']
        }, doc);

        getAccountList();

        getVoicemailInfo();

        initValidator();

        $("#setting").bind("click", function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG767"),
                displayPos: "editForm",
                frameSrc: "../html/emailsettings.html"
            });

            ev.stopPropagation();
            return false;
        });
    }
}

function getAccountList() {
    var generalPrefExt = UCMGUI.isExist.getList("getAccountList");

    generalPrefExt = transData(generalPrefExt);

    UCMGUI.domFunction.selectbox.appendOpts({
        el: "operator_exten",
        opts: generalPrefExt
    }, doc);
}

function listVoicemailFile() {
    $('#voicemail_file_list_div table').each(function(index) {
        var $this = $(this),
            type = $this.attr('type');

        $('#' + type + '_list').jqGrid({
            url: "../cgi?",
            datatype: "json",
            mtype: "POST",
            width: $('.page').width() - 20,
            height: "auto",
            postData: {
                "action": "listFile",
                "type": type,
                "filter": '{"list_dir":0, "list_file":1, "file_suffix": ["mp3", "wav"]}'
            },
            colNames: [
                '<span locale="LANG78">' + $P.lang('LANG78') + '</span>',
                '<span locale="LANG2645">' + $P.lang('LANG2645') + '</span>',
                '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
                '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
            ],
            colModel: [{
                name: 'callerid',
                index: 'callerid',
                width: 100,
                resizable: false,
                align: "center"
            }, {
                name: 'd',
                index: 'd',
                width: 200,
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
                formatter: createOptions
            }],
            loadui: 'disable',
            pager: '#' + type + '_pager',
            rowNum: 10,
            rowList: [10, 20, 30],
            multiselect: false,
            // multiboxonly: true,
            viewrecords: true,
            sortname: 'n',
            sortorder: 'desc',
            noData: "LANG4093",
            jsonReader: {
                root: "response." + type,
                page: "response.page",
                total: "response.total_page",
                records: "response.total_item",
                repeatitems: false
            },
            loadComplete: function() {
                $('#' + type + '_list .jqgrow:even').addClass("ui-row-even");
            },
            gridComplete: function() {
                $P.lang(doc, true);

                if (index === 2) {
                    top.Custom.init(doc);
                }
            }
        });
    });
}

function createOptions(cellvalue, options, rowObject) {
    var type = options.gid.slice(0, options.gid.length - 5);

    var del = '<button file_name="' + rowObject.n + '" type="' + type + '" title="Delete" localetitle="LANG739" class="options del"></button>',
        download = '<button file_name="' + rowObject.n + '" type="' + type + '" title="Download" localetitle="LANG759" class="options download"></button>';

    return (del + download);
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

function bindButtonEvent() {
    $("#voicemail_file_list_div")
        .delegate(".del", "click", function(ev) {
            var type = $(this).attr("type"),
                fileName = $(this).attr("file_name");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG938"),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            data: {
                                "action": "checkFile",
                                "type": type,
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
                                        url: "../cgi",
                                        data: {
                                            "action": "removeFile",
                                            "type": type,
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
                                                top.dialog.dialogMessage({
                                                    type: 'success',
                                                    content: $P.lang("LANG871"),
                                                    callback: function() {
                                                        var table = $('#' + type + '_list'),
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
            var type = $(this).attr("type"),
                fileName = $(this).attr("file_name");

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "checkFile",
                    "type": type,
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
                        window.open("/cgi?action=downloadFile&type=" + type + "&data=" + fileName, '_self');
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

function getVoicemailInfo() {
    var action = {};

    // action = UCMGUI.formSerialize(doc);

    action["action"] = "getVMSettings";

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
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
                var operatorExten = $('#operator_exten');

                data = eval(data);

                UCMGUI.domFunction.updateDocument(data.response.voicemail_settings, document);

                operatorExten.val(data.response.general_pref_settings.operator);

                if (data.response.voicemail_settings.operator === 'no') {
                    operatorExten[0].disabled = true;
                }

                top.Custom.init(doc);
            }
        }
    });
}

// update IVR information
function updateVMsettingInfo(action) {
    $.ajax({
        type: "post",
        url: baseServerURl,
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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });
            }
        }
    });
}

// form validate
function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "maxgreet": {
                required: true,
                digits: true,
                range: [60, 600]
            },
            "maxmsg": {
                required: true,
                digits: true,
                range: [10, 1000]
            }
        },
        submitHandler: function() {
            var action = {};

            action = UCMGUI.formSerializeVal(document);

            action["action"] = "updateVMSettings";

            updateVMsettingInfo(action);
        }
    });
}

function transData(res, cb) {
    var arr = [];

    arr[0] = {
        'text': $P.lang("LANG133"),
        'locale': 'LANG133'
    };

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
            obj["locale"] = "LANG565 '" + obj["text"] + "'";
        }

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
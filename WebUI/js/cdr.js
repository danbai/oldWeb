/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.betweenXY = top.String.prototype.betweenXY;
String.prototype.format = top.String.prototype.format;
String.prototype.isAstTrue = top.String.prototype.isAstTrue;
String.prototype.trim = top.String.prototype.trim;

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames['frameContainer'].frames['mainScreen'], // this will be the main window
    role = $P.cookie('role'),
    backend = "CDR-CSV",
    opt_play_enabled = "options recording play",
    opt_play_disabled = "options recording play disabled",
    opt_download_enabled = "options recording download",
    opt_download_disabled = "options recording download disabled",
    opt_del_enabled = "options recording del",
    opt_del_disabled = "options recording del disabled",
    confrooms = [],
    ivrs = [],
    vmgroups = [],
    ringgroups = [],
    pagegroups = [],
    queues = [],
    extens = [],
    voip_trunks = [],
    analog_trunks = [],
    digital_trunks = [],
    all_trunks = [],
    all_exts = [],
    actionTypeList = [],
    accountCodeList = [],
    selInboundTrunkOptions, // Pengcheng Zou Added. Fixed the compatibility in Firefox.
    selOutboundTrunkOptions;

$(function() {

    $P.lang(document, true);

    top.document.title = $P.lang("LANG584").format(top.UCMGUI.config.model_info.model_name, $P.lang("LANG592"));

    initPage();

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

    if ($('#engine')[0] != null) {
        $('#engine')[0].innerHTML = backend;
    }

    $("#showOutbound, #showInbound, #showInternal, #showExternal").attr('checked', true);

    $('#btnDownloadSearch').on('click', sendDownloadSearchRequest);
    $('#btnDownload').on('click', sendDownloadRequest);
    $('#btnDownloadSettings').on('click', autoDownloadSettings);
    $('#btnDelete').on('click', showDeleteAll);

    bindGridButtonEvents();

    bindSelectEvents();

    //loadDatas();

    // load CDR Records
    listCDRRecords();

    // setSelectOptions();

    initValidator();

    top.Custom.init(doc);
});

function initPage() {
    if (role == 'privilege_3') {
        $('.privilege').hide();
    }

    if (role !== 'privilege_3') {
        check_device();

        loadActionType();

        loadDatas();

        setSelectOptions();
    } else {
        loadActionType();

        $('.user-portal-callnumber').empty().append($('.callnumber').children());
        $('.user-portal-callnumber-label').empty().append($('.callnumber-label').children());
        $('.callnumber').empty();
        $('.callnumber-label').empty();

        selectbox.appendOpts({
            el: "action_type",
            opts: actionTypeList
        }, doc);

        $('#action_type').each(function() {
            $('option', this).prop('selected', false);
        });
    }

    if (role !== 'privilege_0') {
        $('#btnDownloadSettings').hide();
    }
}

function autoDownloadSettings() {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG3955"),
        displayPos: "editForm",
        frameSrc: "html/cdr_download_settings.html"
    });

    return false;
}

// validate records size
function noRecords() {
    var total = $("#cdr_records").getGridParam("records");

    if (total == 0) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG129").format($P.lang("LANG594"))
        });

        return true;
    }

    return false;
}

function storeChoose() {
    top.frames["frameContainer"].module.jumpMenu("recording_choose.html");
}

function check_device() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            "action": 'getInterfaceStatus',
            "auto-refresh": Math.random()
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var sdcard_info = data.response['interface-sdcard'],
                    usbdisk_info = data.response['interface-usbdisk'],
                    store_msg = "";

                if (sdcard_info == "true" || usbdisk_info == "true") {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        async: false,
                        url: "../cgi",
                        data: {
                            "action": 'getRecordingLink',
                            "auto-refresh": Math.random()
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG913")
                            });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                var link_info = data.response['body'];

                                if (link_info == "local") {
                                    store_msg = "LANG1072";
                                } else if (link_info == "USB") {
                                    store_msg = "LANG263";
                                } else if (link_info == "SD") {
                                    store_msg = "LANG262";
                                }

                                $('.choose-tips').attr("locale", "LANG3757 " + store_msg);

                                $P.lang(doc, true);

                                if (role === 'privilege_0' || role === 'privilege_1') {
                                    $('.choose_buttons').show();
                                }
                            }
                        }
                    });
                } else {
                    $('.choose_buttons').hide();

                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        async: false,
                        url: "../cgi",
                        data: {
                            "action": 'getRecordingLink',
                            "auto-refresh": Math.random()
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG913")
                            });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                var link_info = data.response['body'];

                                if (link_info != "local") {
                                    $.ajax({
                                        type: "POST",
                                        dataType: "json",
                                        async: false,
                                        url: "../cgi",
                                        data: {
                                            "action": 'ChooseLink',
                                            "choose_link": "0"
                                        },
                                        error: function(jqXHR, textStatus, errorThrown) {
                                            top.dialog.dialogMessage({
                                                type: 'error',
                                                content: $P.lang("LANG913")
                                            });
                                        },
                                        success: function(data) {
                                            var bool = UCMGUI.errorHandler(data);

                                            if (bool) {}
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        }
    });

    setTimeout(check_device, 20000);
}

function displayExtCharts(ext) {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG2306"),
        frameSrc: "html/cdr_modal.html?mode=chart&item={0}".format(ext)
    });

    return false;
}

function displayCallDetail(session) {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG2307"),
        frameSrc: "html/cdr_modal.html?mode=calldetail&session={0}".format(encodeURIComponent(session))
    });

    return false;
}

function genRecordList(type, uniqueID, filelist, acctid) {
    var title = "",
        frameSrc = "html/cdr_modal.html?mode=" + type + "&uid=" + uniqueID + "&item={0}".format(encodeURIComponent(filelist));

    if (type == "play") {
        title = $P.lang("LANG225");
    } else if (type == "download") {
        title = $P.lang("LANG224");
    } else if (type == "delete") {
        title = $P.lang("LANG226");
        frameSrc += "&acctid=" + acctid;
    }

    top.dialog.dialogInnerhtml({
        dialogTitle: title,
        frameSrc: frameSrc
    });

    return false;
}

function checkTime(val, ele) {
    if (val === '' || val.match(/^\d{4}\-\d{2}\-\d{2}\s\d{2}:\d{2}$/)) {
        return true;
    }

    return false;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "CallerNumber": {
                noSpaces: true,
                customCallback1: [$P.lang("LANG2767"), validateCallerNumFormate],
                // digits: true
                maxlength: 18
            },
            "CallerName": {
                noSpacesInFrontAndEnd: true,
                cidName: true,
                maxlength: 64
            },
            "CalledNumber": {
                noSpaces: true,
                // digits: true,
                maxlength: 18
            },
            "startfrom": {
                customCallback: [$P.lang("LANG2767"), checkTime],
                smallerTime: [$P.lang("LANG1048"), $P.lang("LANG1049"), $('#startto')]
            },
            "startto": {
                customCallback: [$P.lang("LANG2767"), checkTime]
                //biggerTime: [$P.lang("LANG1049"), $P.lang("LANG1048"), $('#startfrom')]
            }
        },
        newValidator: true,
        submitHandler: function() {
            var txt = $P.lang("LANG3773");

            top.dialog.dialogMessage({
                type: "loading",
                title: txt,
                content: txt
            });

            setTimeout(function() {
                var dataPost = {},
                    fromtime = $('#startfrom').val(),
                    totime = $('#startto').val(),
                    src = $('#CallerNumber').val(),
                    caller_name = $('#CallerName').val(),
                    dst = $('#CalledNumber').val(),
                    srcTrunks = $('#src_trunk_name'),
                    dstTrunks = $('#dst_trunk_name'),
                    disposition = $('#disposition'),
                    actionType = $('#action_type'),
                    accountCode = $('#accountcode'),
                    userfield = $('#userfield'),
                    srcTrunksNameList = [],
                    dstTrunksNameList = [],
                    dispositionNameList = [],
                    actionTypeNameList = [],
                    accountCodeNameList = [],
                    userfieldNameList = [];

                dataPost.fromtime = fromtime;
                dataPost.totime = totime;
                dataPost.src = src;
                dataPost.caller_name = caller_name;
                dataPost.dst = dst;


                // Srouce Trunks
                srcTrunks.find('option:selected').each(function() {
                    srcTrunksNameList.push(this.title);
                });

                dataPost.src_trunk_name = srcTrunksNameList.join();


                // Destination Trunks
                dstTrunks.find('option:selected').each(function() {
                    dstTrunksNameList.push(this.title);
                });

                dataPost.dst_trunk_name = dstTrunksNameList.join();


                // Status
                disposition.find('option:selected').each(function() {
                    dispositionNameList.push(this.value);
                });

                dataPost.disposition = dispositionNameList.join();


                // Action Types
                actionType.find('option:selected').each(function() {
                    actionTypeNameList.push(this.value);
                });

                dataPost.action_type = actionTypeNameList.join();


                // Account Codes
                accountCode.find('option:selected').each(function() {
                    accountCodeNameList.push(this.value);
                });

                dataPost.accountcode = accountCodeNameList.join();


                // Call Types
                userfield.find('option:selected').each(function() {
                    userfieldNameList.push(this.value);
                });

                dataPost.userfield = userfieldNameList.join();


                $('#cdr_records')
                    .setGridParam({
                        postData: dataPost,
                        page: 1
                    })
                    .trigger('reloadGrid');
            }, 200);
        }
    });
}

function showDeleteAll() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG840"),
        buttons: {
            ok: sendDeleteRequest
        }
    });
}

function sendDeleteRequest() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG877")
    });

    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            "action": 'deleteCDRDB',
            "acctid": '0'
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG5318"),
                    buttons: {
                        ok: function() {
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "removeFile",
                                    "type": "voice_recording",
                                    "data": '*'
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
                                            content: $P.lang("LANG819"),
                                            callback: function() {
                                                window.location.reload();
                                            }
                                        });
                                    }
                                }
                            });
                        },
                        cancel: function() {
                            window.location.reload();
                        }  
                    }
                });

            }
        }
    });
}

function sendDownloadRequest() {
    var txt = $P.lang("LANG3774");

    top.dialog.dialogMessage({
        type: "loading",
        title: txt,
        content: txt
    });

    setTimeout(function() {
        $.ajax({
            type: "GET",
            url: "/cgi?action=reloadCDRRecordFile&reflush_Record=all",
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown
                });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    top.dialog.clearDialog();

                    top.window.open("/cgi?action=downloadFile&type=cdr_recording&data=Master.csv" + "&_location=cdr&_=" + (new Date().getTime()), '_self');
                }
            }
        });
    }, 200);
}

function sendDownloadSearchRequest() {
    if (noRecords()) {
        return;
    }
    var txt = $P.lang("LANG3774");

    top.dialog.dialogMessage({
        type: "loading",
        title: txt,
        content: txt
    });

    setTimeout(function() {
        var action = {
                "action": "CreateCdrRecord",
                "condition": 1
            },
            fromtime = $('#startfrom').val(),
            totime = $('#startto').val(),
            src = $('#CallerNumber').val(),
            caller_name = $('#CallerName').val(),
            dst = $('#CalledNumber').val(),
            srcTrunks = $('#src_trunk_name'),
            dstTrunks = $('#dst_trunk_name'),
            disposition = $('#disposition'),
            actionType = $('#action_type'),
            accountCode = $('#accountcode'),
            userfield = $('#userfield'),
            srcTrunksNameList = [],
            dstTrunksNameList = [],
            dispositionNameList = [],
            actionTypeNameList = [],
            accountCodeNameList = [],
            userfieldNameList = [];

        if (fromtime) {
            action['fromtime'] = fromtime;
        }

        if (totime) {
            action['totime'] = totime;
        }

        if (src) {
            action['src'] = src;
        }

        if (caller_name) {
            action['caller_name'] = caller_name;
        }

        if (dst) {
            action['dst'] = dst;
        }


        // Srouce Trunks
        srcTrunks.find('option:selected').each(function() {
            srcTrunksNameList.push(this.title);
        });

        if (srcTrunksNameList.length) {
            action['src_trunk_name'] = srcTrunksNameList.join();
        }


        // Destination Trunks
        dstTrunks.find('option:selected').each(function() {
            dstTrunksNameList.push(this.title);
        });

        if (dstTrunksNameList.length) {
            action['dst_trunk_name'] = dstTrunksNameList.join();
        }


        // Status
        disposition.find('option:selected').each(function() {
            dispositionNameList.push(this.value);
        });

        if (dispositionNameList.length) {
            action['disposition'] = dispositionNameList.join();
        }


        // Action Types
        actionType.find('option:selected').each(function() {
            actionTypeNameList.push(this.value);
        });

        if (actionTypeNameList.length) {
            action['action_type'] = actionTypeNameList.join();
        }


        // Account Codes
        accountCode.find('option:selected').each(function() {
            accountCodeNameList.push(this.value);
        });

        if (accountCodeNameList.length) {
            action['accountcode'] = accountCodeNameList.join();
        }


        // Call Types
        userfield.find('option:selected').each(function() {
            userfieldNameList.push(this.value);
        });

        if (userfieldNameList.length) {
            action['userfield'] = userfieldNameList.join();
        }

        $.ajax({
            type: "POST",
            url: "/cgi?",
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown
                });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    top.dialog.clearDialog();

                    top.window.open("/cgi?action=downloadCdrRecord&type=cdr_recording&data=Master_condition.csv" + "&_location=cdr&_=" + (new Date().getTime()), '_self');
                }
            }
        });
    }, 200);
}

function bindGridButtonEvents() {
    $('#cdr_records')
        .delegate('.recording', 'click', function(ev) {
            if (!this.disabled) { // this is HTML object; $(this) is JQuery object;
                var acctid = $(this).attr("acctid"),
                    id_arr = this.id.split("_"),
                    filelist = $(this).attr("filelist");

                if (id_arr.length > 1) {
                    var op_type = id_arr[0], // "play"/"download"/"delete"
                        uniqueID = id_arr[1]; // uniqueID of a record;

                    genRecordList(op_type, uniqueID, filelist, acctid);
                }
            }

            ev.stopPropagation();
            return false;
        });
}

function bindSelectEvents() {
    // $('#showInbound').bind('change', function(event) {
    //     var inboundTrunks = $('#src_trunk_name')[0];

    //     if (this.checked) {
    //         inboundTrunks.disabled = false;

    //         if (selInboundTrunkOptions && selInboundTrunkOptions.each) {
    //             selInboundTrunkOptions.each(function() {
    //                 $(this).prop('selected', true);
    //             });
    //         }
    //     } else {
    //         inboundTrunks.disabled = true;

    //         if (selInboundTrunkOptions && selInboundTrunkOptions.each) {
    //             selInboundTrunkOptions.each(function() {
    //                 $(this).prop('selected', false);
    //             });
    //         }
    //     }

    //     top.Custom.init(doc, inboundTrunks);
    // });

    // $('#showOutbound').bind('change', function(event) {
    //     var outboundTrunks = $('#dst_trunk_name')[0];

    //     if (this.checked) {
    //         outboundTrunks.disabled = false;

    //         if (selOutboundTrunkOptions && selOutboundTrunkOptions.each) {
    //             selOutboundTrunkOptions.each(function() {
    //                 $(this).prop('selected', true);
    //             });
    //         }
    //     } else {
    //         outboundTrunks.disabled = true;

    //         if (selOutboundTrunkOptions && selOutboundTrunkOptions.each) {
    //             selOutboundTrunkOptions.each(function() {
    //                 $(this).prop('selected', false);
    //             });
    //         }
    //     }

    //     top.Custom.init(doc, outboundTrunks);
    // });

    $('#src_trunk_name').bind('click', function(event) {

        // Pengcheng Zou Added. Fixed the compatibility in Firefox.
        selInboundTrunkOptions = $(this).find('option:selected');
    });

    $('#dst_trunk_name').bind('click', function(event) {

        // Pengcheng Zou Added. Fixed the compatibility in Firefox.
        selOutboundTrunkOptions = $(this).find('option:selected');
    });
}

function changeTitle(rowId, tv, rowObject, cm, rdata) {
    var title = '';

    if (rowObject['disposition'].indexOf("ANSWERED") > -1) {
        title = "Answered";
    } else if (rowObject['disposition'].indexOf("NO ANSWER") > -1) {
        title = "No Answer";
    } else if (rowObject['disposition'].indexOf("FAILED") > -1) {
        title = "Failed";
    } else if (rowObject['disposition'].indexOf("BUSY") > -1) {
        title = "Busy";
    }

    return 'title="' + title + '"';
}

function createRecordingOptions(cellvalue, options, rowObject) {
    var record_list = rowObject['recordfiles'].trim(),
        options = '',
        download = '',
        play = '',
        del = '';

    if (record_list.length > 0) {
        play = '<button localeTitle="LANG4097" title="' + $P.lang("LANG4097") + '" id="' + "play_" + rowObject.uniqueID +
            '"' + ' class="' + opt_play_enabled + '" filelist="' + record_list + '"></button>';

        download = '<button localeTitle="LANG4098" title="' + $P.lang("LANG4098") + '" id="' + "download_" + rowObject.uniqueID +
            '"' + ' class="' + opt_download_enabled + '" filelist="' + record_list + '"></button>';

        del = '<button acctid="' + rowObject.acctid + '" localeTitle="LANG4099" title="' + $P.lang("LANG4099") + '" id="' + "delete_" + rowObject.uniqueID +
            '"' + ' class="' + opt_del_enabled + '" filelist="' + record_list + '"></button>';

        options = (play + download + del);
    } else {
        options = '<div locale="LANG2317 LANG2640">' + $P.lang("LANG2317").format($P.lang("LANG2640")) + '</div>';
    }

    return options;
}

function createOptions(cellvalue, options, rowObject) {
    var params = rowObject['session'],
        options = '<button class="options detail" localeTitle="LANG3923" onclick="displayCallDetail(\'' + params + '\');"></button>';

    return options;
}

function getCallType() {
    var result = [];

    if ($("#showInbound")[0].checked) {
        result.push('Inbound');
    }

    if ($("#showOutbound")[0].checked) {
        result.push('Outbound');
    }

    if ($("#showExternal")[0].checked) {
        result.push('External');
    }

    if ($("#showInternal")[0].checked) {
        result.push('Internal');
    }

    return result.join();
}

function listCDRRecords() {
    $("#cdr_records").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listCDRDB"
        },
        colNames: [
            '<span locale="LANG177">' + $P.lang('LANG177') + '</span>',
            '<span locale="LANG169">' + $P.lang('LANG169') + '</span>',
            '<span locale="LANG5134">' + $P.lang('LANG5134') + '</span>',
            '<span locale="LANG581">' + $P.lang('LANG581') + '</span>',
            '<span locale="LANG582">' + $P.lang('LANG582') + '</span>',
            '<span locale="LANG3207">' + $P.lang('LANG3207') + '</span>',
            '<span locale="LANG2239">' + $P.lang('LANG2239') + '</span>',
            '<span locale="LANG2238">' + $P.lang('LANG2238') + '</span>',
            '<span locale="LANG4569">' + $P.lang('LANG4569') + '</span>',
            '<span locale="LANG186">' + $P.lang('LANG186') + '</span>',
            '<span locale="LANG4096">' + $P.lang('LANG4096') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'index',
            index: 'index',
            width: 70,
            resizable: false,
            sortable: false,
            align: "center"
        }, {
            name: 'start',
            index: 'start',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transRowData
        }, {
            name: 'action_type',
            index: 'action_type',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transRowData
        }, {
            name: 'clid',
            index: 'clid',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transRowData
        }, {
            name: 'dst',
            index: 'dst',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transRowData
        }, {
            name: 'dstanswer',
            index: 'dstanswer',
            width: 100,
            resizable: false,
            align: "center",
            hidden: true,
            formatter: transRowData
        }, {
            name: 'duration',
            index: 'duration',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transRowData
        }, {
            name: 'billsec',
            index: 'billsec',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transRowData
        }, {
            name: 'accountcode',
            index: 'accountcode',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transRowData
        }, {
            name: 'disposition',
            index: 'disposition',
            width: 50,
            resizable: false,
            align: "center",
            formatter: transRowData,
            cellattr: changeTitle
        }, {
            name: 'recordingOptions',
            index: 'recordingOptions',
            width: 150,
            resizable: false,
            align: "center",
            sortable: false,
            formatter: createRecordingOptions
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            sortable: false,
            formatter: createOptions
        }],
        loadui: 'disable',
        pager: "#cdr_records_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'start',
        sortorder: 'desc',
        noData: "LANG129 LANG594",
        jsonReader: {
            root: transGridData,
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#cdr_records .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            top.dialog.clearDialog();

            $P.lang(doc, true);
        }
    });
}

function loadActionType() {
    // Load Action Types
    var actionTypes = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'getCDRActionTypeList'
        },
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
                var list = data.response.action_type;

                if (list && list.length > 0) {
                    actionTypes = list;
                }
            }
        }
    });

    $.each(actionTypes, function(index, value) {
        var type_obj = {
            text: value,
            val: value
        };

        actionTypeList.push(type_obj);
    });
}

// load extension, conference and other datas
function loadDatas() {
    // Load Account Codes
    var accountCodes = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'getAccountCodeList'
        },
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
                var list = data.response.accountcode;

                if (list && list.length > 0) {
                    accountCodes = list;
                }
            }
        }
    });

    $.each(accountCodes, function(index, value) {
        var code_obj = {
            text: value,
            val: value
        };

        accountCodeList.push(code_obj);
    });


    // Load Accounts
    var exts = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listAccount',
            'page': 1,
            'item_num': 1000000,
            'options': 'extension,fullname',
            'sord': 'asc',
            'sidx': 'extension'
        },
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
                var list = data.response.account;

                if (list && list.length > 0) {
                    exts = list;
                }
            }
        }
    });

    $.each(exts, function(item, value) {
        var user_obj = {
            number: value.extension,
            name: value.fullname
        };

        extens.push(user_obj);

        all_exts.push(value.extension);
    });


    // Load Conferences
    var sessionroom = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listConference',
            'page': 1,
            'item_num': 1000000,
            'options': 'extension',
            'sord': 'asc',
            'sidx': 'extension'
        },
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
                var list = data.response.conference;

                if (list && list.length > 0) {
                    sessionroom = list;
                }
            }
        }
    });

    $.each(sessionroom, function(item, value) {
        confrooms.push(value.extension);
        all_exts.push(value.extension);
    });


    // Load Paging Groups
    var c = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listPaginggroup',
            'page': 1,
            'item_num': 1000000,
            'options': 'extension',
            'sord': 'asc',
            'sidx': 'extension'
        },
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
                var list = data.response.paginggroup;

                if (list && list.length > 0) {
                    c = list;
                }
            }
        }
    });

    $.each(c, function(item, value) {
        pagegroups.push(value.extension);
        all_exts.push(value.extension);
    });


    // Load Call Queues
    var m = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listQueue',
            'page': 1,
            'item_num': 1000000,
            'options': 'extension, queue_name',
            'sord': 'asc',
            'sidx': 'extension'
        },
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
                var list = data.response.queue;

                if (list && list.length > 0) {
                    m = list;
                }
            }
        }
    });

    $.each(m, function(item, value) {
        var queue_obj = {
            number: value.extension,
            name: value.queue_name
        };

        queues.push(queue_obj);
        all_exts.push(value.extension);
    });


    // Load Ringgroups
    var c = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listRinggroup',
            'page': 1,
            'item_num': 1000000,
            'options': 'extension, ringgroup_name',
            'sord': 'asc',
            'sidx': 'extension'
        },
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
                var list = data.response.ringgroup;

                if (list && list.length > 0) {
                    c = list;
                }
            }
        }
    });

    $.each(c, function(item, value) {
        var ringgroup_obj = {
            number: value.extension,
            name: value.ringgroup_name
        };

        ringgroups.push(ringgroup_obj);
        all_exts.push(value.extension);
    });


    // Load Voicemail Groups
    var vms = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listVMgroup',
            'page': 1,
            'item_num': 1000000,
            'options': 'extension, vmgroup_name',
            'sord': 'asc',
            'sidx': 'extension'
        },
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
                var list = data.response.vmgroup;

                if (list && list.length > 0) {
                    vms = list;
                }
            }
        }
    });

    $.each(vms, function(item, value) {
        var vmgroup_obj = {
            number: value.extension,
            name: value.vmgroup_name
        };

        vmgroups.push(vmgroup_obj);
        all_exts.push(value.extension);
    });


    // Load IVRs
    var lvms = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listIVR',
            'page': 1,
            'item_num': 1000000,
            'options': 'extension, ivr_name',
            'sord': 'asc',
            'sidx': 'extension'
        },
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
                var list = data.response.ivr;

                if (list && list.length > 0) {
                    lvms = list;
                }
            }
        }
    });

    $.each(lvms, function(item, value) {
        var ivr_obj = {
            number: value.extension,
            name: value.ivr_name
        };

        ivrs.push(ivr_obj);
        all_exts.push(value.extension);
    });


    // Load VoIP Trunks
    var trunk_list = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listVoIPTrunk',
            'page': 1,
            'item_num': 1000000,
            'options': 'trunk_index, trunk_name',
            'sord': 'asc',
            'sidx': 'trunk_name'
        },
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
                var list = data.response.voip_trunk;

                if (list && list.length > 0) {
                    trunk_list = list;
                }
            }
        }
    });

    $.each(trunk_list, function(item, value) {
        var trunk_obj = {
            number: 'trunk_' + value.trunk_index,
            name: value.trunk_name
        };

        trunk_obj.val = trunk_obj.number;
        trunk_obj.text = trunk_obj.name;

        voip_trunks.push(trunk_obj);
    });


    // Load Analog Trunks
    var trunk_list = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listAnalogTrunk',
            'page': 1,
            'item_num': 1000000,
            'options': 'trunk_index, trunk_name',
            'sord': 'asc',
            'sidx': 'trunk_name'
        },
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
                var list = data.response.analogtrunk;

                if (list && list.length > 0) {
                    trunk_list = list;
                }
            }
        }
    });

    $.each(trunk_list, function(item, value) {
        var trunk_obj = {
            number: 'trunk_' + value.trunk_index,
            name: value.trunk_name
        };

        trunk_obj.val = trunk_obj.number;
        trunk_obj.text = trunk_obj.name;

        analog_trunks.push(trunk_obj);
    });


    // Load Digital Trunks
    var trunk_list = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listDigitalTrunk',
            'page': 1,
            'item_num': 1000000,
            'options': 'trunk_index, trunk_name',
            'sord': 'asc',
            'sidx': 'trunk_name'
        },
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
                var list = data.response.digital_trunks;

                if (list && list.length > 0) {
                    trunk_list = list;
                }
            }
        }
    });

    $.each(trunk_list, function(item, value) {
        var trunk_obj = {
            number: 'trunk_' + value.trunk_index,
            name: value.trunk_name
        };

        trunk_obj.val = trunk_obj.number;
        trunk_obj.text = trunk_obj.name;

        digital_trunks.push(trunk_obj);
    });

    all_trunks = voip_trunks.concat(analog_trunks, digital_trunks)

    /*if (voip_trunks.length > 0 && analog_trunks.length > 0) {
        all_trunks = voip_trunks.concat(analog_trunks);
    } else if (voip_trunks.length > 0) {
        all_trunks = voip_trunks;
    } else if (analog_trunks.length > 0) {
        all_trunks = analog_trunks;
    }*/
}

function setSelectOptions() {
    selectbox.appendOpts({
        el: "src_trunk_name",
        opts: all_trunks
    }, doc);

    selectbox.appendOpts({
        el: "dst_trunk_name",
        opts: all_trunks
    }, doc);

    selectbox.appendOpts({
        el: "action_type",
        opts: actionTypeList
    }, doc);

    selectbox.appendOpts({
        el: "accountcode",
        opts: accountCodeList
    }, doc);

    $('#src_trunk_name, #dst_trunk_name, #action_type, #accountcode').each(function() {
        $('option', this).prop('selected', false);
    });
}

// translate row data after grid load completed
function transRowData(cellvalue, options, rowObject) {
    var dataFromModal = (typeof options !== 'object'), // Call from CDR Modal Page or Not.
        item = (dataFromModal ? options : options.colModel.name),
        content = '';

    switch (item) {
        case 'clid':
            var clid = '';

            if (rowObject['caller_name']) {
                clid += '"' + rowObject['caller_name'] + '" ';
            }

            if (rowObject['src']) {
                clid += rowObject['src'] + ' ';
            }

            if (rowObject['src_trunk_name']) {
                clid += '[Trunk: ' + rowObject['src_trunk_name'] + ']';
            }

            if ((rowObject['calltype'] == "outgoing call" || rowObject['calltype'] == "internal call") &&
                (all_exts.indexOf(rowObject['src']) > -1)) {
                content = dataFromModal ?
                    ('<div>' + clid + '</div>') :
                    ('<div class="selectable" onclick="displayExtCharts(\'' + rowObject['src'] + '\');">' + clid + '</div>');
            } else {
                content = '<div>' + clid + '</div>';
            }

            // if (rowObject['calltype'] == "outgoing call" || rowObject['calltype'] == "internal call") {
            //     if (all_exts.indexOf(rowObject['src']) > -1) {
            //         content = dataFromModal ?
            //             ('<div class="selectable">' + rowObject['clid'] + '</div>') :
            //             ('<div class="selectable" onclick="displayExtCharts(\'' + rowObject['src'] + '\');">' + rowObject['clid'] + '</div>');
            //     } else {
            //         content = '<div>' + rowObject['clid'] + '</div>';
            //     }
            // } else if (rowObject['calltype'] == "incoming call" || rowObject['calltype'] == "external call") {
            //     var trunk_str = "";

            //     all_trunks.each(function(data) {
            //         if (data.number == rowObject['channel_ext']) {
            //             trunk_str = " [Trunk: " + data.name + "]";
            //             return false;
            //         }
            //     });

            //     content = '<div>' + (rowObject['clid'] + trunk_str) + '</div>';
            // }
            break;
        case 'dst':
            var dst = '';

            if (rowObject['dst']) {
                dst += rowObject['dst'] + ' ';
            }

            if (rowObject['dst_trunk_name']) {
                dst += '[Trunk: ' + rowObject['dst_trunk_name'] + ']';
            }

            if ((rowObject['calltype'] == "incoming call" || rowObject['calltype'] == "internal call") &&
                (all_exts.indexOf(rowObject['dst']) > -1)) {
                content = dataFromModal ?
                    ('<div>' + dst + '</div>') :
                    ('<div class="selectable" onclick="displayExtCharts(\'' + rowObject['dst'] + '\');">' + dst + '</div>');
            } else {
                content = '<div>' + dst + '</div>';
            }

            // if (rowObject['calltype'] == "incoming call" || rowObject['calltype'] == "internal call") {
            //     if (all_exts.indexOf(rowObject['dst']) > -1) {
            //         content = dataFromModal ?
            //             ('<div class="selectable">' + rowObject['dst'] + '</div>') :
            //             ('<div class="selectable" onclick="displayExtCharts(\'' + rowObject['dst'] + '\');">' + rowObject['dst'] + '</div>');
            //     } else {
            //         content = '<div>' + rowObject['dst'] + '</div>';
            //     }
            // } else if (rowObject['calltype'] == "outgoing call" || rowObject['calltype'] == "external call") {
            //     var trunk_str = "";

            //     all_trunks.each(function(data) {
            //         if (data.number == rowObject['dstchannel_ext']) {
            //             trunk_str = " [Trunk: " + data.name + "]";
            //             return false;
            //         }
            //     });

            //     content = '<div>' + (rowObject['dst'] + trunk_str) + '</div>';
            // }
            break;
        case 'calltype':
            var ext1Div = '',
                connDiv = '',
                ext2Div = '',
                hint_str = '';

            if (rowObject['calltype'] == "incoming call") {
                hint_str = "Inbound call from trunk " + rowObject['channel_ext'];
                ext1DivClass = "pstndiv";
                connDivClass = "incomingdiv";
                ext2DivClass = "phonediv";
            } else if (rowObject['calltype'] == "outgoing call") {
                hint_str = "Outbound call through trunk " + rowObject['dstchannel_ext'];
                ext1DivClass = "phonediv";
                connDivClass = "outgoingdiv";
                ext2DivClass = "pstndiv";
            } else if (rowObject['calltype'] == "internal call") {
                hint_str = "Internal call";
                ext1DivClass = "phonediv";
                connDivClass = "connectdiv";
                ext2DivClass = "phonediv";
            } else if (rowObject['calltype'] == "external call") {
                hint_str = "External call through trunk " + rowObject['channel_ext'] + " and trunk " + rowObject['dstchannel_ext'];
                ext1DivClass = "pstndiv";
                connDivClass = "connectdiv";
                ext2DivClass = "pstndiv";
            }

            ext1DivTitle = hint_str;
            connDivTitle = hint_str;
            ext2DivTitle = hint_str;

            ext1Div = '<div class="' + ext1DivClass + '" title="' + ext1DivTitle + '"></div>';
            connDiv = '<div class="' + connDivClass + '" title="' + connDivTitle + '"></div>';
            ext2Div = '<div class="' + ext2DivClass + '" title="' + ext2DivTitle + '"></div>';

            content = ext1Div + connDiv + ext2Div;
            break;
        case 'disposition':
            var className = '',
                title = '';

            if (rowObject['disposition'].indexOf("ANSWERED") > -1) {
                className = "answereddiv";
                title = "Answered";
                localeTitle = 'LANG4863';
            } else if (rowObject['disposition'].indexOf("NO ANSWER") > -1) {
                className = "noanswerdiv";
                title = "No Answer";
                localeTitle = 'LANG4864';
            } else if (rowObject['disposition'].indexOf("FAILED") > -1) {
                className = "faileddiv";
                title = "Failed";
                localeTitle = 'LANG2405';
            } else if (rowObject['disposition'].indexOf("BUSY") > -1) {
                className = "busydiv";
                title = "Busy";
                localeTitle = 'LANG2237';
            }

            content = '<div class="' + className + '" localeTitle="' + localeTitle + '" title="' + $P.lang(localeTitle) + '"></div>';
            break;
        case 'dstanswer':
            if (rowObject['disposition'].indexOf("ANSWERED") > -1) {
                content = '<div>' + rowObject[item] + '</div>';
            } else {
                content = '<div></div>';
            }
            break;
        default:
            content = '<div>' + rowObject[item] + '</div>';
            break;
    }

    return content;
}


// translate Grid data from request
function transGridData(data) {
    if (!data || typeof data !== 'object') {
        return [];
    }

    var results = data.response.acctid ? (data.response.acctid.length > 0 ? data.response.acctid : []) : [],
        rowNum = $("#cdr_records").getGridParam('rowNum'),
        page = data.response.page ? parseInt(data.response.page) : 1;

    for (var i = 0, length = results.length; i < length; i++) {
        var record = results[i];

        for (var item in record) {
            if (record.hasOwnProperty(item)) {

                // Strips quotation marks from each record
                if ((item == 'duration') || (item == 'billsec')) {

                    // duration or billable seconds 
                    // converts seconds to HH:MM:SS. 
                    var s = parseInt(record[item], 10),
                        h = Math.floor(s / 3600);

                    s = s % 3600;

                    var m = Math.floor(s / 60);

                    s = s % 60;

                    record[item] = h + ":" + (m < 10 ? ("0" + m) : m) + ":" + (s < 10 ? ("0" + s) : s);
                } else if (item == 'AcctId') {
                    record.acctid = record[item];
                } else if (item == 'clid') {

                    // callerID, may have double quotation marks 
                    record[item] = record[item].toString().replace(/\"\"/g, '\"');
                } else if (item == 'uniqueid') {
                    record.uniqueID = record[item];
                } else if (item == 'recordfiles') {
                    record.recordfiles = record[item];
                }
            }
        }

        var src_sum = record['channel_ext'].indexOf("trunk") > -1 ? 1 : 0,
            dst_sum = record['dstchannel_ext'].indexOf("trunk") > -1 ? 2 : 0,
            sum = src_sum + dst_sum;

        if (sum == 0) {
            record.calltype = "internal call";
        } else if (sum == 1) {
            record.calltype = "incoming call";
        } else if (sum == 2) {
            record.calltype = "outgoing call";
        } else if (sum == 3) {
            record.calltype = "external call";
        }

        record.index = (page - 1) * rowNum + (i + 1);
    }

    return results;
}

function validateCallerNumFormate(value, element) {
    if (/^[0-9\+]*x*.{0,1}$/i.test(value)) {
        return true;
    }

    return false;
}

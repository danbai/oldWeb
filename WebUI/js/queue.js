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
    queueExt = [],
    queueExtList = [],
    queueRange = [],
    mohNameList = [],
    extgroupList = [],
    extgroupListObj = {},
    portExtensionList = [],
    voicemailPromptList = [],
    destinationTypeValue = {
        'account': [],
        'voicemail': [],
        'queue': [],
        'ringgroup': [],
        'vmgroup': [],
        'ivr': []
    },
    firstload = true,
    lastLink = '',
    currentLink = '',
    queueSettings = {};

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG607"));

    check_device();

    getListsAndRange();

    createTable();

    //list_recordings();

    bindTopButtonEvent();

    bindGridButtonEvent();

    getPortExtension();

    getNameList();

    getQueueSettings();
});

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
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: $P.lang("LANG913")
            // });
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
                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: $P.lang("LANG913")
                            // });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                var link_info = data.response['body'];

                                currentLink = link_info;

                                if (link_info == "local") {
                                    store_msg = "LANG1072";
                                } else if (link_info == "USB") {
                                    store_msg = "LANG263";
                                } else if (link_info == "SD") {
                                    store_msg = "LANG262";
                                }

                                $('.choose-tips').attr("locale", "LANG3757 " + store_msg);

                                $P.lang(doc, true);

                                $('.choose_buttons').show();
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
                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: $P.lang("LANG913")
                            // });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                var link_info = data.response['body'];

                                currentLink = link_info;

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
                                            // top.dialog.dialogMessage({
                                            //     type: 'error',
                                            //     content: $P.lang("LANG913")
                                            // });
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

    if (firstload) {
        list_recordings();

        firstload = false;

        lastLink = currentLink;
    } else {
        if (lastLink !== currentLink) {
            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG3867"),
                buttons: {
                    ok: function() {
                        $("#recordFiles").trigger("reloadGrid");

                        lastLink = currentLink;
                    },
                    cancel: function() {
                        lastLink = currentLink;
                    }
                }
            });
        }
    }

    setTimeout(check_device, 5000);
}

function bindTopButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG747"),
                displayPos: "editForm",
                frameSrc: "html/queue_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#settings', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang('LANG748'),
                frameSrc: "html/agent_login_settings.html"
            });

            ev.stopPropagation();
            return false;
        });

    $('div.recording_buttons')
        .delegate('#batchDelete', 'click', function(ev) {

            var recordFilesTable = $("#recordFiles"),
                records = recordFilesTable.getGridParam("records"),
                selected = recordFilesTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                recordFilesList = [],
                confirmList = [],
                i = 0,
                rowdata,
                rowName;

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG2240")
                });

                return false;
            }

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG2640").toLowerCase())
                });

                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = recordFilesTable.jqGrid('getRowData', selected[i]);

                rowName = rowdata['n'].split('</span>');

                recordFilesList.push(rowName.length > 1 ? rowName[1] : rowName[0]);
            }


            for (i = 0; i < selectedRowsLength; i++) {
                confirmList.push("<font>" + recordFilesList[i] + "</font>");
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2710").format($P.lang("LANG2640").toLowerCase(), confirmList.join('  ')),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG2640").toLowerCase())
                        });

                        var doSelected = function() { // DELETE_SELECTED_RECORDING();
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "removeFile",
                                    "type": "queue_recording",
                                    "data": recordFilesList.join(",,")
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
                                            content: $P.lang("LANG871"),
                                            callback: function() {
                                                jumpPageOrNot(selectedRowsLength);
                                            }
                                        });
                                    }
                                }
                            });
                        };

                        setTimeout(doSelected, 100);
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnDelete', 'click', function(ev) {

            var records = $("#recordFiles").getGridParam("records");

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG2240")
                });

                return false;
            } else {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG840"),
                    buttons: {
                        ok: sendDeleteRequest
                    }
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnDownloadBatch', 'click', function(ev) {

            var recordFilesTable = $("#recordFiles"),
                records = recordFilesTable.getGridParam("records"),
                selected = recordFilesTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                packingText = $P.lang("LANG5391"),
                actionType = 'queue_pack',
                filesListToString = '',
                recordFilesList = [],
                recordList = [],
                rowdata,
                rowName,
                i = 0;

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG2240")
                });
                return;
            }

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG4762").format($P.lang("LANG3652").toLowerCase())
                });
                return;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = recordFilesTable.jqGrid('getRowData', selected[i]);

                rowName = rowdata['n'].split('</span>');

                recordFilesList.push(rowName.length > 1 ? rowName[1] : rowName[0]);
            }

            filesListToString = recordFilesList.join(",");

            top.dialog.dialogMessage({
                type: 'loading',
                title: packingText,
                content: packingText
            });

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    'action': 'packFile',
                    'type': actionType,
                    'data': filesListToString
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
                        top.window.open("/cgi?action=downloadFile&type=" + actionType + "&data=batchQueueRecordFiles.tgz", '_self');

                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnDownloadAll', 'click', function(ev) {

            var records = $("#recordFiles").getGridParam("records"),
                packingText = $P.lang("LANG5391"),
                actionType = 'queue_pack';

            if (!records) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG2240")
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'loading',
                    title: packingText,
                    content: packingText
                });

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        'action': 'packFile',
                        'type': actionType,
                        'data': 'allQueueRecordFiles.tgz'
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
                            top.window.open("/cgi?action=downloadFile&type=" + actionType + "&data=allQueueRecordFiles.tgz", '_self');

                            top.dialog.clearDialog();
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        });

    $("#recordFiles")
        .delegate(".del", "click", function(ev) {
            var fileName = $(this).attr("file_name");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG938"),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            data: {
                                "action": "checkFile",
                                "type": "queue_recording",
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
                                            "type": "queue_recording",
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
                                                        var table = $("#recordFiles"),
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
            var fileName = $(this).attr("file_name");

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "checkFile",
                    "type": "queue_recording",
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
                        window.open("/cgi?action=downloadFile&type=queue_recording&data=" + fileName, '_self');
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

function bindGridButtonEvent() {
    $("#queue-list")
        .delegate('.edit', 'click', function(ev) {

            var extension = $(this).attr('extension');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG608").format(extension),
                displayPos: "editForm",
                frameSrc: "html/queue_modal.html?mode=edit&extension=" + extension
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
                            "action": "deleteQueue",
                            "queue": extension
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

                                    /*
                                     * Pengcheng Zou Added. For Bug 35499.
                                     */
                                    // var deleteNumbers = [],
                                    //     currentLogin = queueSettings.queuelogin,
                                    //     currentLogout = queueSettings.queuelogout;

                                    // if (currentLogin) {
                                    //     deleteNumbers.push("'" + extension + currentLogin + "'");
                                    // }

                                    // if (currentLogout) {
                                    //     deleteNumbers.push("'" + extension + currentLogout + "'");
                                    // }

                                    // if (deleteNumbers.length) {
                                    //     $.ajax({
                                    //         type: "post",
                                    //         url: "../cgi",
                                    //         async: false,
                                    //         data: {
                                    //             'action': 'deleteQueueAgentNumbers',
                                    //             'numbers': deleteNumbers.toString()
                                    //         },
                                    //         error: function(jqXHR, textStatus, errorThrown) {},
                                    //         success: function(data) {
                                    //             // var bool = UCMGUI.errorHandler(data);

                                    //             // if (bool) {}
                                    //         }
                                    //     });
                                    // }
                                    /* ------ End ------ */

                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816"),
                                        callback: function() {
                                            var table = $("#queue-list"),
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

            ev.stopPropagation();
            return false;
        });
}

function createStrategy(cellvalue, options, rowObject) {
    var strategy;

    switch (cellvalue) {
        case 'ringall':
            strategy = '<span locale="LANG1197">' + $P.lang('LANG1197') + '</span>';
            break;
        case 'linear':
            strategy = '<span locale="LANG1198">' + $P.lang('LANG1198') + '</span>';
            break;
        case 'leastrecent':
            strategy = '<span locale="LANG1199">' + $P.lang('LANG1199') + '</span>';
            break;
        case 'fewestcalls':
            strategy = '<span locale="LANG1200">' + $P.lang('LANG1200') + '</span>';
            break;
        case 'random':
            strategy = '<span locale="LANG1201">' + $P.lang('LANG1201') + '</span>';
            break;
        case 'rrmemory':
            strategy = '<span locale="LANG1202">' + $P.lang('LANG1202') + '</span>';
            break;
        default:
            strategy = '';
            break;
    }

    return strategy;
}

function createRecordingOptions(cellvalue, options, rowObject) {
    var del = '<button file_name="' + rowObject.n +
        '" title="Delete" localetitle="LANG739" class="options del"></button>',
        download = '<button file_name="' + rowObject.n +
        '" title="Download" localetitle="LANG759" class="options download"></button>';

    return del + download;
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button extension="' + rowObject.extension + '" title="Edit" localetitle="LANG738" class="options edit"></button>';

    if (rowObject.user_name == 'admin') {
        var del = '<button extension="' + rowObject.extension + '" title="Delete" localetitle="LANG739" class="options del disabled" style="cursor: default;"></button>';
    } else {
        var del = '<button extension="' + rowObject.extension + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    }

    return (edit + del);
}

function createTable() {
    $("#queue-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listQueue"
        },
        colNames: [
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG1137">' + $P.lang('LANG1137') + '</span>',
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
            name: 'queue_name',
            index: 'queue_name',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'strategy',
            index: 'strategy',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createStrategy
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
        loadui: 'disable',
        pager: "#queue-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'extension',
        noData: "LANG129 LANG607",
        jsonReader: {
            root: "response.queue",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#queue-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function getListsAndRange() {
    var accountList = UCMGUI.isExist.getList("getAccountList");

    queueExtList = transAccountVoicemailData(accountList);

    extgroupList = UCMGUI.isExist.getList("getExtensionGroupList");

    for (var i = 0; i < extgroupList.length; i++) {
        var groupId = extgroupList[i]["group_id"],
            groupName = extgroupList[i]["group_name"];

        queueExt.push(groupId);

        extgroupListObj[groupId] = {
            val: groupId,
            text: groupName
        };
    }

    queueRange = UCMGUI.isExist.getRange('queue');

    var mohName = UCMGUI.isExist.getList("getMohNameList");

    mohNameList = transData(mohName);

    destinationTypeValue = {
        'account': accountList,
        'voicemail': UCMGUI.isExist.getList("getVoicemailList"),
        'queue': UCMGUI.isExist.getList("getQueueList"),
        'ringgroup': UCMGUI.isExist.getList("getRinggroupList"),
        'vmgroup': UCMGUI.isExist.getList("getVMgroupList"),
        'ivr': UCMGUI.isExist.getList("getIVRList")
    };

    getVoicemailPrompt();
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

function getNameList() {
    numberList = UCMGUI.isExist.getList("getNumberList");

    queueNameList = UCMGUI.isExist.getList("getQueueNameList");

    destinationTypeValue['queue'] = UCMGUI.isExist.getList("getQueueList");
}

/*
 * Pengcheng Zou Added. For Bug 35499.
 */
function getQueueSettings() {
    $.ajax({
        url: "../cgi",
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            'action': 'getQueueSettings'
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                queueSettings = data.response.queue_settings;
            }
        }
    });
}

function getVoicemailPrompt() {
    $.ajax({
        url: "../cgi",
        type: "POST",
        dataType: "json",
        async: true,
        data: {
            action: "listFile",
            type: "ivr",
            filter: JSON.stringify({
                "list_dir": 0,
                "list_file": 1,
                "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
            }),
            page: 1,
            sidx: "d",
            sord: "asc"
        },
        success: function(data) {
            var data = eval(data);

            if (data.status == 0) {
                var ivr = data.response.ivr,
                    options = {
                        val: "n",
                        text: "n"
                    };

                voicemailPromptList = transVoicemailPromptData(ivr, options, function(arr) {
                    for (var i = 0; i < arr.length; i++) {
                        arr[i].val = "record/" + removeSuffix(arr[i].val);
                    }
                });
            }
        }
    });
}

function list_recordings() {
    $("#recordFiles").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listFile",
            "type": "queue_recording",
            "filter": '{"list_dir":0, "list_file":1, "file_suffix": ["mp3", "wav"]}'
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG2646">' + $P.lang('LANG2646') + '</span>',
            '<span locale="LANG607">' + $P.lang('LANG607') + '</span>',
            '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
            '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'n',
            index: 'n',
            width: 250,
            resizable: false,
            align: "center"
        }, {
            name: 'caller',
            index: 'caller',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'queue',
            index: 'queue',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'd',
            index: 'd',
            width: 150,
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
            formatter: createRecordingOptions
        }],
        pager: "#recordFiles-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'd',
        sortorder: 'desc',
        noData: "LANG2240",
        jsonReader: {
            root: "response.queue_recording",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#recordFiles .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function sendDeleteRequest() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG877")
    });

    var action = {
        "action": "removeFile",
        "type": "queue_recording",
        "data": '*'
    };

    $.ajax({
        type: "post",
        url: "../cgi",
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
                setTimeout(function() {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG871"),
                        callback: function() {
                            window.location.reload();
                        }
                    });
                }, 200);
            }
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#recordFiles"),
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

function transVoicemailPromptData(res, options, cb) {
    var val = options.val,
        text = options.text,
        arr = [];

    if ($.isArray(res)) {
        for (var i = 0; i < res.length; i++) {
            var obj = {};

            obj["val"] = res[i][val];
            obj["text"] = res[i][text];

            arr.push(obj);
        }

        if (cb && typeof cb == "function") {
            cb(arr);
        }

        return arr;
    }
}

function transTable() {
    var container = "<table id='queue-list'></table><div id='queue-pager'></div>";

    $("#queue_div").empty();

    $(container).appendTo("#queue_div");

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

function transAccountVoicemailData(res, cb) {
    var arr = [];

    queueExt = [];

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

        queueExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj["val"] = res[i];

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
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

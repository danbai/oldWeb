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
    role = $P.cookie('role'),
    enableDeleteRecordings = '',
    currentLink = '',
    firstload = true,
    lastLink = '';

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2640"));

    initPage();

    // list_recordings();

    // top.Custom.init(doc);
});

function initPage() {
    var role = $P.cookie('role');

    if (role === 'privilege_3') {
        $(".top_buttons, .choose_buttons").hide();

        getUserPrivilege();

        list_recordings();
    } else {
        check_device();
    }

    bindButtonEvent();

    $('#btnDeleteSelect').on('click', batchDelete);
    $('#btnDeleteAll').on('click', showDeleteForm);
    $('#btnDownloadBatch').on('click', batchDownloadRequest);
    $('#btnDownloadAll').on('click', sendDownloadRequest);
    $('#btnChoose').on('click', storeChoose);
}

function getUserPrivilege(index) {
    var action = {
        'action': 'getCustomPrivilege',
        'privilege_id': '3'
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var settings = data.response.privilege_id;

                enableDeleteRecordings = settings.en_rm_voice_recording;
            }
        }
    });
}

function sendDownloadRequest() {
    var records = $("#recording_file_list").getGridParam("records"),
        packingText = $P.lang("LANG5391"),
        actionType = 'cdr_pack';

    if (!records) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG2240")
        });
    } else {
        // var txt = $P.lang("LANG3774"),
        //     date = new Date(),
        //     timestamp = date.getTime();

        // top.dialog.dialogMessage({
        //     type: "loading",
        //     title: txt,
        //     content: txt
        // });

        // setTimeout(function() {
        //     $.ajax({
        //         type: "GET",
        //         url: "/cgi?action=tarRecordFile&record-file=all_cdr_record_" + timestamp + ".tgz download all_cdr_record",
        //         error: function(jqXHR, textStatus, errorThrown) {
        //             top.dialog.dialogMessage({
        //                 type: 'error',
        //                 content: errorThrown
        //             });
        //         },
        //         success: function(data) {
        //             var bool = UCMGUI.errorHandler(data);

        //             if (bool) {
        //                 top.dialog.clearDialog();

        //                 top.window.open("/cgi?action=downloadFile&type=tarRecordFile&data=all_cdr_record_" + timestamp + ".tgz", '_self');
        //             }
        //         }
        //     });
        // }, 200);

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
                'data': 'allCdrRecordFiles.tgz'
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
                    top.window.open("/cgi?action=downloadFile&type=" + actionType + "&data=allCdrRecordFiles.tgz", '_self');

                    top.dialog.clearDialog();
                }
            }
        });
    }
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
                        $("#recording_file_list").trigger("reloadGrid");

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

function list_recordings() {
    $("#recording_file_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: $('.page').width(),
        height: "auto",
        postData: {
            "action": "listFile",
            "type": "voice_recording",
            "filter": '{"list_dir":0, "list_file":1, "file_suffix": ["mp3", "wav"]}'
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG2646">' + $P.lang('LANG2646') + '</span>',
            '<span locale="LANG2647">' + $P.lang('LANG2647') + '</span>',
            '<span locale="LANG2645">' + $P.lang('LANG2645') + '</span>',
            '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'n',
            index: 'n',
            width: 100,
            resizable: false,
            hidden: true,
            align: "center"
        }, {
            name: 'caller',
            index: 'caller',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'callee',
            index: 'callee',
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
        pager: "#recording_file_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: role === 'privilege_3' ? false : true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'd',
        sortorder: 'desc',
        noData: "LANG2240",
        jsonReader: {
            root: "response.voice_recording",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#recording_file_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function createOptions(cellvalue, options, rowObject) {
    var paly, del, download;

    play = ('<button file_name="' + rowObject.n + '" title="Play" localetitle="LANG777" class="options play"></button>'),
    download = ('<button file_name="' + rowObject.n + '" title="Download" localetitle="LANG759" class="options download"></button>');

    if (enableDeleteRecordings && enableDeleteRecordings === 'no') {
        del = ('<button file_name="' + rowObject.n + '" title="Delete" localetitle="LANG739" class="options del disabled" disabled></button>');
    } else {
        del = ('<button file_name="' + rowObject.n + '" title="Delete" localetitle="LANG739" class="options del"></button>');
    }

    return (play + download + del);
}

function bindButtonEvent() {
    $("#recording_file_list")
        .delegate(".play", "click", function(ev) {
            var fileName = $(this).attr("file_name"),
                title = $P.lang("LANG225"),
                frameSrc = "html/cdr_modal.html?mode=play&item={0}".format(encodeURIComponent(fileName));

            top.dialog.dialogInnerhtml({
                dialogTitle: title,
                frameSrc: frameSrc
            });

            ev.stopPropagation();
            return false;
        })
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
                                "type": "voice_recording",
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
                                            "type": "voice_recording",
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
                                                        jumpPageOrNot(1);
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
                    "type": "voice_recording",
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
                        window.open("/cgi?action=downloadFile&type=voice_recording&data=" + encodeURIComponent(fileName), '_self');
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

function batchDelete() {
    var recordFilesTable = $("#recording_file_list"),
        records = recordFilesTable.getGridParam("records"),
        selected = recordFilesTable.jqGrid("getGridParam", "selarrrow"),
        selectedRowsLength = selected.length,
        recordList = [],
        recordFilesList = [],
        confirmList = [],
        i = 0,
        rowdata,
        recordName,
        rowName;

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
            content: $P.lang("LANG823").format($P.lang("LANG2640").toLowerCase())
        });
        return;
    }

    for (i; i < selectedRowsLength; i++) {
        rowdata = recordFilesTable.jqGrid('getRowData', selected[i]);

        rowName = rowdata['n'].split('</span>');
        recordName = rowdata['caller'] + "-" + rowdata['callee'];

        recordList.push(recordName);
        recordFilesList.push(rowName.length > 1 ? rowName[1] : rowName[0]);
    }


    for (i = 0; i < selectedRowsLength; i++) {
        confirmList.push("<font>" + recordList[i] + "</font>");
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
                            "type": "voice_recording",
                            "data": recordFilesList.join(",,")
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: errorThrown,
                            //     callback: function() {
                            //         // UCMGUI.logoutFunction.doLogout();
                            //     }
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
}

function batchDownloadRequest() {
    var recordFilesTable = $("#recording_file_list"),
        records = recordFilesTable.getGridParam("records"),
        selected = recordFilesTable.jqGrid("getGridParam", "selarrrow"),
        selectedRowsLength = selected.length,
        packingText = $P.lang("LANG5391"),
        actionType = 'cdr_pack',
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
                top.window.open("/cgi?action=downloadFile&type=" + actionType + "&data=batchCdrRecordFiles.tgz", '_self');

                top.dialog.clearDialog();
            }
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#recording_file_list"),
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

function showDeleteForm() {
    var records = $("#recording_file_list").getGridParam("records");

    if (!records) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG2240")
        });
    } else {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG840"),
            buttons: {
                ok: sendDeleteRequest
            }
        });
    }
}

function sendDeleteRequest() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG877")
    });

    var action = {
        "action": "removeFile",
        "type": "voice_recording",
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

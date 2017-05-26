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
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    udo = document.getElementById('udo'),
    mohsuggest = "",
    extensionList = [],
    extensionLen = 0,
    mohinterpret = "",
    mohNameList = "",
    siptosSettings = {};

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG671"));

    getNameList("first");

    getTOSSettings();

    var extension = UCMGUI.isExist.getList("getAccountList");

    extensionList = transData(extension);

    extensionLen = extension.length;
    // createTable();
    // bindButtonEvent();
    // initUpload();

    bindButtonEvent();

    initValidator();
});

function getNameList(flag) {
    mohNameList = UCMGUI.isExist.getList("getMohNameList");

    var opts = transClassData(mohNameList);

    selectbox.appendOpts({
        el: "moh_classes",
        opts: opts
    }, doc);

    $("#moh_classes").change(function(ev) {
        var value = $('#moh_classes :selected').text().toLowerCase();

        if ((value == "default") || (value == "ringbacktone_default")) {
            $("#mohclass_deleteButton").attr('disabled', true).addClass('disabled');
        } else {
            $("#mohclass_deleteButton").attr('disabled', false).removeClass('disabled');
        }

        createTable();

        bindListEvent();

        initUpload();
    });

    if (flag == "first") {
        $("#moh_classes").val("default");

        createTable();

        bindListEvent();
    } else if (flag == "del") {
        createTable();

        bindListEvent();
    } else {
        $("#moh_classes").val("guimohdir_" + flag).trigger("change");
    }

    if ($('#moh_classes :selected').text().toLowerCase() == "default") {
        $("#mohclass_deleteButton").attr('disabled', true).addClass('disabled');
    } else {
        $("#mohclass_deleteButton").attr('disabled', false).removeClass('disabled');
    }

    initUpload();

    top.Custom.init(doc);
}

function isCompressed(filename) {
    var result = false;

    if (filename.endsWith('.tar') || filename.endsWith('.tgz') || filename.endsWith('.tar.gz')) {
        result = true;
    }

    return result;
}

function initUpload() {
    $("#uploadDiv").empty();

    var container = "<input type='text' id='fileUrl' name='fileUrl' readonly='readonly'/><button type='button' id='upload' class='selectBtn'></button>";

    $(container).appendTo("#uploadDiv");

    var mohClassesVal = $('#moh_classes :selected').val(),
        mohClasses = ((mohClassesVal == "default") ? "" : mohClassesVal),
        action = '../cgi?action=uploadfile&type=moh&data=' + mohClasses,
        fileUrl = document.getElementById('fileUrl'),
        upload = $("#upload"); // local upload firmware

    var uploadObj = new AjaxUpload(upload, {
        action: action,
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileUrl.value = file;
            // $P("#form_moh", document).valid();
        },
        onSubmit: function(file, ext) {
            if (!onUploadFormBeforeUploading()) {
                return false;
            }

            if (isCompressed(file)) {
                this._settings.action = '../cgi?action=uploadfile&type=moh';
            } else {
                this._settings.action = '../cgi?action=uploadfile&type=moh&data=' + mohClasses;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG881")
            });
        },
        onComplete: function(file, data) {
            data = eval(data);

            if (data) {
                var status = data.status,
                    response = data.response;

                if (status == 0 && response && response.result == 0) {
                    if (isCompressed(file)) {
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG2797"),
                            callback: function() {
                                window.location.reload();
                            }
                        });
                    } else {
                        mWindow.$("#moh_list", mWindow.document).trigger('reloadGrid');

                        var needApply = response.need_apply;
                        var applyChanges = $("#applyChanges_Button", top.frames["frameContainer"].document),
                            lineButton = $("#line_Button", top.frames["frameContainer"].document);
                        
                        if (needApply && needApply == 'yes') {
                            top.$.cookie("needApplyChange", "yes");

                            if (applyChanges.length > 0 && lineButton.length > 0 && !applyChanges.is(':animated')) {
                                applyChanges.css("visibility", "visible");
                                lineButton.css("visibility", "visible");
                            }
                        }

                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG2797")
                        });

                        initUpload();
                    }
                } else if (response) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: UCMGUI.transcode(response.result)
                    });
                } else {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG916")
                    });
                }
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG916")
                });
            }

            fileUrl.value = "";
        }
    });

    udo.onclick = function() {
        if (!$P('#form_moh', document).valid()) {
            $("#fileUrl").focus();
            return;
        } else {
            uploadObj.submit();
            // onProgress();
        }
    }
}

function initValidator() {
    $("#form_moh").tooltip();

    $P("#form_moh", document).validate({
        rules: {
            "fileUrl": {
                required: true,
                maxlength: 100,
                customCallback: [$P.lang("LANG2552"), function() {
                    return /^[^\[&#(\/`;*?,|\$\>\]\+\']*$/.test($("#fileUrl").val());
                }]
            }
        }
    });
}

function onUploadFormBeforeUploading() {
    var tmp_fname = $("#fileUrl").val();

    if (tmp_fname) {
        tmp_fname = tmp_fname.toLowerCase();
        
        if (tmp_fname.endsWith('.mp3') ||
            tmp_fname.endsWith('.wav') ||
            tmp_fname.endsWith('.gsm') ||
            tmp_fname.endsWith('.ulaw') ||
            tmp_fname.endsWith('.alaw')) {

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG866")
            });

            return true;
        } else if (isCompressed(tmp_fname)) {

            if (/^[a-zA-Z0-9_\-]+(\.tar|\.tgz|\.tar\.gz)$/g.test(tmp_fname)) {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG866")
                });

                return true;
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG5406")
                });

                return false;
            }

        } else {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG5406")
            });

            return false;
        }
    }
}

function createTable() {
    var mohClasses = $('#moh_classes :selected').val();

    if (mohClasses == "default") {
        mohClasses = "";
    }

    $("#soundFiles_div").empty();

    var container = "<table id='moh_list'></table><div id='moh_pager'></div>";

    $(container).appendTo("#soundFiles_div");

    $("#moh_list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: 750,
        height: "auto",
        postData: {
            action: "listFile",
            type: "moh",
            filter: JSON.stringify({
                "list_dir": 0,
                "list_file": 1,
                "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
            }),
            data: mohClasses
        },
        colNames: [
            '<span locale="LANG1606">' + $P.lang('LANG1606') + '</span>',
            // '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
            // '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'n',
            index: 'n',
            width: 500,
            resizable: false,
            align: "center"
            // }, {
            //     name: 'd',
            //     index: 'd',
            //     width: 100,
            //     resizable: false,
            //     align: "center",
            // }, {
            //     name: 's',
            //     index: 's',
            //     width: 150,
            //     resizable: false,
            //     formatter: tranSize,
            //     align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#moh_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: "n",
        noData: "LANG1605",
        jsonReader: {
            root: "response.moh",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#moh_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            var ringBack = $("button[filename='ring_back.gsm']");

            if (ringBack.length != 0) {
                ringBack.parent().siblings().find("input[type='checkbox']").attr("disabled", "disabled");
            }

            top.Custom.init(doc);

            $P.lang(document, true);
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG774"),
                displayPos: "editForm",
                frameSrc: "html/mohfiles_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnDownloadAll', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG741").format($P.lang("LANG27")),
                displayPos: "downloadAll_content",
                frameSrc: "html/menuprompts_record_modal.html?mode=downloadAllMOH"
            });

            ev.stopPropagation();
            return false;
        });

    $("#moh_classes_list")
        .delegate('.edit', 'click', function(ev) {
            var mohClasses = $('#moh_classes :selected').text();
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2505"),
                displayPos: "editForm",
                frameSrc: "html/mohfiles_modal.html?mode=edit&mohClasses=" + mohClasses
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var mohVal = $('#moh_classes :selected').val(),
                mohName = $('#moh_classes :selected').text();

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(mohName),
                buttons: {
                    ok: function() {
                        var action = {
                                action: "removeFile",
                                type: "moh",
                                data: mohVal
                            };

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
                                    $.ajax({
                                        type: "post",
                                        url: baseServerURl,
                                        data: {
                                            "action": "deleteMoh",
                                            "moh": mohName
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
                                                    content: $P.lang("LANG816")
                                                });

                                                judgeIfMohDel(mohName);

                                                getNameList("del");
                                            }
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

function bindListEvent() {
    $("#moh_list")
        .delegate('.record', 'click', function(ev) {
            var filename = $(this).attr("filename");
            var mohClasses = $('#moh_classes :selected').val();

            if (extensionLen > 0) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG876"),
                    buttons: {
                        ok: function() {
                            top.dialog.dialogInnerhtml({
                                dialogTitle: $P.lang("LANG222").format($P.lang("LANG238"), filename),
                                displayPos: "playFile_content",
                                frameSrc: "html/mohfiles_modal.html?mode=editRecord&item={0}".format(encodeURIComponent(filename)) + "&className=" + $('#moh_classes :selected').text().toLowerCase()
                            });
                        }
                    }
                });
            } else {
                ask_add_users();
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.play', 'click', function(ev) {
            var filename = $(this).attr("filename");

            if (extensionLen > 0) {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG675").format(filename),
                    displayPos: "playFile_content",
                    frameSrc: "html/mohfiles_modal.html?mode=playRecord&item={0}".format(encodeURIComponent(filename)) + "&className=" + $('#moh_classes :selected').text().toLowerCase()
                });
            } else {
                ask_add_users();
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var ele = $('#moh_classes :selected'),
                selectedText = ele.text(),
                selectedVal = ele.val(),
                fileName = $(this).attr("fileName");

            if (selectedText.toLowerCase() != "default") {
                fileName = selectedVal + "/" + fileName;
            } else if ($("#moh_list").getGridParam('records') == 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG870")
                });

                return false;
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG4273").format($(this).attr("fileName")),
                buttons: {
                    ok: function() {
                        var action = {
                            action: "removeFile",
                            type: "moh",
                            data: fileName
                        };

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
                                        content: $P.lang("LANG2798"),
                                        callback: function() {
                                            var table = $("#moh_list"),
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

                                    initUpload();
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
            var ele = $('#moh_classes :selected'),
                selectedText = ele.text(),
                selectedVal = ele.val(),
                filename = $(this).attr("filename");

            if (selectedText.toLowerCase() != "default") {
                filename = selectedVal + "/" + filename;
            }

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "checkFile",
                    "type": "moh",
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
                        window.open("/cgi?action=downloadFile&type=moh&data=" + encodeURIComponent(filename), '_self');
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

function addRecord(ev) {
    var mohClasses = $('#moh_classes :selected').val();
    if (extensionLen > 0) {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG775"),
            displayPos: "recordnew_content",
            frameSrc: "html/mohfiles_modal.html?mode=addRecord" + "&className=" + $('#moh_classes :selected').text().toLowerCase() + "&mohClasses=" + mohClasses
        });
    } else {
        ask_add_users();
    }
}

function batchDelete() {
    var soundFilesTable = $("#moh_list"),
        sounds = soundFilesTable.getGridParam("records"),
        selected = soundFilesTable.jqGrid("getGridParam", "selarrrow"),
        selectedRowsLength = selected.length,
        soundFilesList = [],
        soundFilesName = [],
        confirmList = [],
        i = 0,
        rowdata,
        rowName,
        ele = $('#moh_classes :selected'),
        selectedText = ele.text(),
        selectedVal = ele.val();

    if (!sounds) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG3720")
        });

        return;
    }

    if (selectedRowsLength < 1) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG823").format($P.lang("LANG3719"))
        });

        return;
    }

    if ((selectedRowsLength === sounds) && (selectedText.toLowerCase() === "default")) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG870")
        });

        return;
    }

    for (i; i < selectedRowsLength; i++) {
        rowdata = soundFilesTable.jqGrid('getRowData', selected[i]);

        rowName = rowdata['n'].split('</span>');

        var fileName = rowName.length > 1 ? rowName[1] : rowName[0];

        soundFilesList.push(fileName);

        if (selectedText.toLowerCase() != "default") {
            soundFilesName.push(selectedVal + "/" + fileName);
        } else {
            soundFilesName.push(fileName);
        }
    }


    for (i = 0; i < selectedRowsLength; i++) {
        confirmList.push("<font>" + soundFilesList[i] + "</font>");
    }

    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG4273").format(confirmList.join('<br>')),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG825").format($P.lang("LANG3719"))
                });

                // var soundFilesName = soundFilesList.join(",,");

                // if (selectedText.toLowerCase() != "default") {
                //     soundFilesName = selectedVal + "/" + soundFilesName;
                // }
                var doSelected = function() {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: {
                            "action": "removeFile",
                            "type": "moh",
                            "data": soundFilesName.join(",,")
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

function jumpPageOrNot(selectedRows) {
    var table = $("#moh_list"),
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

function judgeIfMohDel(mohName) {
    var tosFlag = false,
        actionTos = {
            action: "updateTOSSettings"
        };

    if (mohName == mohsuggest) {
        tosFlag = true;
        actionTos["mohsuggest"] = "default";
    }

    if (mohName == mohinterpret) {
        tosFlag = true;
        actionTos["mohinterpret"] = "default"
    }

    if (tosFlag) {
        $.ajax({
            url: '../cgi',
            type: 'POST',
            dataType: 'json',
            data: actionTos,
            success: function(data) {}
        });
    }
}

function getTOSSettings() {
    var action = {
        action: "getTOSSettings",
        mohinterpret: "",
        mohsuggest: ""
    };

    $.ajax({
        url: '../cgi',
        type: 'POST',
        dataType: 'json',
        data: action,
        success: function(data) {
            data = eval(data);

            if (data.status == 0) {
                var siptosSettings = data.response.siptos_settings;

                mohsuggest = siptosSettings.mohsuggest;

                mohinterpret = siptosSettings.mohinterpret;
            }
        }
    });
}

function tranSize(cellvalue, options, rowObject) {
    return UCMGUI.tranSize(rowObject.s);
}

function createOptions(cellvalue, options, rowObject) {
    var sObjectName = rowObject.n,
        hasComma = (sObjectName.indexOf(',') > -1),
        mohClasses = $('#moh_classes :selected').val(),
        hasMP3 = sObjectName.toLowerCase().endsWith(".mp3"),
        downloadAttr,
        recordAttr,
        playAttr,
        download,
        record,
        play,
        del;

    var disableListInDefault = [
        'macroform-cold_day.wav',
        'macroform-robot_dity.wav',
        'macroform-the_simplicity.wav',
        'manolo_camp-morning_coffee.wav',
        'reno_project-system.wav'
    ];

    recordAttr = (hasComma || hasMP3) ?
        'localetitle="LANG4748" class="options record disabled" disabled' :
        'localetitle="LANG784" class="options record"';
    playAttr = hasComma ?
        'localetitle="LANG2148" class="options play disabled" disabled' :
        'localetitle="LANG777" class="options play"';
    downloadAttr = hasComma ?
        'localetitle="LANG2148" class="options download disabled" disabled' :
        'localetitle="LANG759" class="options download"';

    play = ('<button filename="' + sObjectName + '" title="Play" ' + playAttr + '></button>');
    record = ('<button filename="' + sObjectName + '" title="Record" ' + recordAttr + '></button>');
    download = ('<button filename="' + sObjectName + '" title="Download" ' + downloadAttr + '></button>');


    if ((mohClasses === 'guimohdir_ringbacktone_default' && rowObject.n === 'ring_back.gsm') ||
        (mohClasses === 'default' && disableListInDefault.indexOf(rowObject.n) > -1)) {
        del = ('<button fileName="' + rowObject.n + '" title="Delete" localetitle="LANG739" class="options del disabled" disabled></button>');
    } else {
        del = ('<button fileName="' + rowObject.n + '" title="Delete" localetitle="LANG739" class="options del"></button>');
    }

    return record + play + download + del;
}

function transClassData(res) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        if (res[i] == "default") {
            obj["text"] = res[i];
            obj["val"] = "default";
        } else {
            obj["text"] = res[i];
            obj["val"] = "guimohdir_" + res[i];
        }

        arr.push(obj);
    }

    return arr;
}

function transData(res, cb) {
    var arr = [];

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

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function ask_add_users() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG880"),
        buttons: {
            ok: function() {
                top.frames['frameContainer'].module.jumpMenu('extension.html');
            },
            cancel: function() {
                top.dialog.clearDialog();
            }
        }
    });
}

/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    gup = UCMGUI.gup,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = config.paths.baseServerURl,
    mode = gup.call(window, "mode"),
    item = decodeURIComponent(gup.call(window, "item")),
    className = decodeURIComponent(gup.call(window, "className")),
    oldMohName = "",
    mohClasses = "";

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);
    mohClasses = gup.call(window, "mohClasses");

    if (mode == 'edit') {
        displayClass();
        getMohInfo(mohClasses);

        $("#moh_name").attr('disabled', true);
    } else if(mode == 'add') {
        displayClass();
    } 
    else if (mode == "addRecord") {
        initForm();
        displayAddRecord();

        getFileList();
    } else if (mode == "editRecord") {
        initForm();
        displayEditRecord(item);
    } else if (mode == "playRecord") {
        initForm();
        // if (isConsumer) {
        //     $('#playFile_content .section-body').remove();

        //     showRecordList(item);
        // } else {
            displayPlayRecord(item);
        //}
    }
    top.Custom.init(doc);
    $("#moh_name").mouseleave(function(ev) {
        ev.stopPropagation();
    });

    initValidator();
});


function mohNameIsExist() {
    var mohName = $("#moh_name").val().toLowerCase(),
        mohNameList = mWindow.mohNameList,
        tmpMohNameList = [];

    tmpMohNameList = mohNameList.copy(tmpMohNameList);

    if (oldMohName) {
        tmpMohNameList.remove(oldMohName);
    }

    return !UCMGUI.inArray(mohName, tmpMohNameList);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "moh_name": {
                minlength: 2,
                required: true,
                isExist: [$P.lang("LANG270").format($P.lang("LANG1603")), mohNameIsExist],
                letterDigitUndHyphen: true
            },
            "newvmenu_name": {
                required: true,
                letterDigitUndHyphen: true,
                customCallback: [$P.lang("LANG2146"), check_filename]
            },
            "newvmenu_ext": {
                required: true
            },
            "newvmenu_format": {
                required: true
            }
        },
        submitHandler: function() {
            if (mode == "add" || mode == "edit") {
                var mohName = $("#moh_name").val(),
                    mohNameLowerCase = mohName.toLowerCase();

                if (mohNameLowerCase == mohName) {
                    beforeUpdateOrAddMohInfo();
                } else {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG2926").format(mohName, mohNameLowerCase),
                        buttons: {
                            ok: function() {
                                beforeUpdateOrAddMohInfo();
                            },
                            cancel: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        }
                    });
                }               
            } else {
                record_new_Verify();
            }
        }
    });
}

function beforeUpdateOrAddMohInfo() {
    var mohName = $("#moh_name").val(),
        mohNameLowerCase = mohName.toLowerCase(),
        action = {};

    action = UCMGUI.formSerializeVal(document);
    action["action"] = (mode == 'edit' ? "updateMoh" : "addMoh");

    if (mode == "add") {
        action["moh_name"] = mohNameLowerCase;

        var mkDirAction = {
            action: "mkDir",
            type: "moh",
            data: "guimohdir_" + mohNameLowerCase
        };

        $.ajax({
            type: "post",
            url: "../cgi",
            data: mkDirAction,
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.clearDialog();

                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        });

                if (bool) {
                    updateOrAddMohInfo(action);
                }
            }
        });
    } else {
        action["moh"] = mohName;

        updateOrAddMohInfo(action);
    }
}

function updateOrAddMohInfo(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    });

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });

                if (mode == "add") {
                    mohClasses = $("#moh_name").val().toLowerCase();

                    mWindow.getNameList(mohClasses);
                }
            }
        }
    });
}

function getMohInfo(name) {
    var action = {
        "action": "getMoh",
        "moh": name
    };

    $.ajax({
        type: "post",
        url: "../cgi",
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
                var moh = data.response.moh;

                oldMohName = moh.moh_name;

                UCMGUI.domFunction.updateDocument(moh, document);

                $("#moh_name").val(oldMohName);

                top.Custom.init(doc);
            }
        }
    });
}

function check_filename(value, element) {
    var filename = $('#newvmenu_name').val();

    if (fileList) {
        for (var i = 0; i < fileList.length; i++) {
            var pointIndex = fileList[i]['n'].lastIndexOf('.'),
                existedFileName = fileList[i]['n'].slice(0, pointIndex);

            if (filename === existedFileName) {
                return false;
            }
        }
    }

    return true;
}

function getFileList() {
    if (mohClasses == "default") {
        mohClasses = "";
    }
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listFile",
            "type": "moh",
            "filter": JSON.stringify({
                "list_dir": 0,
                "list_file": 1,
                "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
            }),
            data: mohClasses,
            "sidx": "n",
            "sord": "desc"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                fileList = data.response.moh;
            }
        }
    });
}

function initForm() {
    selectbox.appendOpts({
        el: "newvmenu_ext",
        opts: mWindow.extensionList
    }, doc);
    selectbox.appendOpts({
        el: "playVmenu_ext",
        opts: mWindow.extensionList
    }, doc);
}

function displayClass() {
    $("#editForm").show();
}
function displayAddRecord() {
    $("#recordnew_content").show();
}

function displayPlayRecord(item) {
    ACTION = 'PLAY';

    CURRENT_FILE = item;

    $('#playVmenu_ext_0').html($P.lang("LANG1611"));
    $('#play_record_button').html($P.lang("LANG777"));
    $('#playVmenu_name').text(CURRENT_FILE).html();
    $('#playFile_content').show();
}

function displayEditRecord(item) {
    ACTION = 'RECORD';

    CURRENT_FILE = item;

    $('#playVmenu_ext_0').html($P.lang("LANG1612"));
    $('#play_record_button').html($P.lang("LANG778"));
    $('#playVmenu_name').text(CURRENT_FILE).html();
    $('#playFile_content').show();
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

function play_record_file() {
    var fileName = CURRENT_FILE;
    if (className != "default") {
        fileName = $('#moh_classes :selected', mWindow.document).val() + "/" + CURRENT_FILE;
    } 
    $.ajax({
        type: "post",
        url: baseServerURl,
        async: false,
        data: {
            "action": "checkFile",
            "type": "moh",
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
                var y = $('#playVmenu_ext').val();
                if (className == "default") {
                    className = "";
                }
                if (ACTION == 'PLAY') {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        async: false,
                        data: {
                            "action": 'playPromptByOrg',
                            "channel": y,
                            "type": 'moh',
                            "class": className,
                            "Variable": removeSuffix(CURRENT_FILE),
                        },
                        error: function(jqXHR, textStatus, errorThrown) {},
                        success: function(data) {}
                    });

                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG873")
                    });
                } else if (ACTION == 'RECORD') {
                    recordFile(y);
                }

                CURRENT_FILE = '';
            } else {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG3868")
                    });
                }
            }
        });
}

function record_new_Verify() {
    CURRENT_FILE = $('#newvmenu_name').val() + $('#newvmenu_format').val();

    top.dialog.clearDialog();

    recordFile($('#newvmenu_ext').val());
}

function recordFile(extension) { // uses/dials  extension to record into CURRENT_FILE
    if (className == "default") {
        className = "";
    }
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            "action": 'recordPromptByOrg',
            "channel": extension,
            "type": 'moh',
            "class": className,
            "Variable": CURRENT_FILE,
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {}
    });

    top.dialog.dialogMessage({
        type: 'success',
        content: $P.lang("LANG873"),
        callback: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG878")
            });

            setTimeout(function() {
                top.dialog.dialogMessage({
                    type: 'info',
                    content: $P.lang("LANG879")
                });
            }, 3000);
        }
    });
}

function showRecordList(filename) {
    var record_table = document.createElement("TABLE"),
        thead = document.createElement("thead"),
        tr = document.createElement("tr");

    record_table.className = "table_record";
    tr.style.fontSize = "8pt";

    for (var i = 0; i < 1; i++) {
        var th = document.createElement("th"),
            disnameSpan = document.createElement("span");

        if (i == 0) {
            disnameSpan.innerHTML = $P.lang("LANG2386");
        }

        th.appendChild(disnameSpan);
        tr.appendChild(th);
    }

    thead.appendChild(tr);
    record_table.appendChild(thead);

    var tbody = document.createElement("tbody");
    tbody.id = "voicefile_content";

    if (filename) {
        var record_tr = document.createElement("tr"),
            filename_td = document.createElement("td"),
            link = document.createElement("a");

        // if (value.indexOf("auto-") > -1) {
        //     link.href = "../udata/monitor/" + value;
        // } else if (value.indexOf("meetme-") > -1) {
        //     link.href = "../udata/meetme/" + value;
        // }

        link.href = filename;
        link.className = 'link';
        link.appendChild(document.createTextNode(filename));

        filename_td.appendChild(link);
        record_tr.appendChild(filename_td);
        tbody.appendChild(record_tr);
    }

    record_table.appendChild(tbody);

    $("#play_record").append(record_table);

    $(".link").click(function(ev) {
        var filename = $(this).attr('href'),
            type = 'user_recording';

        // if (filename.indexOf("auto-") > -1) {
        //     type = 'voice_recording';
        // } else {
        //     type = 'conference_recording';
        // }

        window.location = "/cgi?action=playFile&type=" + type + "&data=" + encodeURIComponent(filename) + "&_=" + (new Date().getTime());

        ev.stopPropagation();
        return false;
    });

    $('#playFile_content').show();
}

function sendPlayRequest(file) {
    var mask = "";

    $.ajax({
        type: "GET",
        url: '../cgi?action=playUserRecordFile&filename=' + file,
        dataType: "json",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            if (data && data.status === 0) {
                var filename = data.response.filename;

                mask = filename ? filename : '';
            }
        }
    });

    return mask;
}
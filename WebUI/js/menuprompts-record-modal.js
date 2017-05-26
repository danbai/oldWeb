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
    gup = UCMGUI.gup,
    mode = gup.call(window, "mode"),
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    isConsumer = (($P.cookie('role') === 'privilege_3') ? true : false),
    fileList = [];

String.prototype.format = top.String.prototype.format;
String.prototype.withOut = top.String.prototype.withOut;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.addZero = top.String.prototype.addZero;
Number.prototype.addZero = top.Number.prototype.addZero;

$(function() {
    $P.lang(document, true);

    var item = decodeURIComponent(gup.call(window, "item"));

    if (mode) {
        if (!isConsumer) {
            initForm();
        }

        if (mode == "addRecord") {
            displayAddRecord();

            getFileList();
        } else if (mode == "editRecord") {
            displayEditRecord(item);
        } else if (mode == "playRecord") {
            if (isConsumer) {
                $('#playFile_content .section-body').remove();

                showRecordList(item);
            } else {
                displayPlayRecord(item);
            }
        } else if (mode == "downloadAll" || mode == "downloadAllMOH") {
            $('#downloadAll_content').show();

            generateDownloadAllName();
        }

        if (!isConsumer) {
            initValidator();
        }

        top.Custom.init(document);

        return false; // bypass reload dialog
    }
});

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

function downloadFile() {
    var downloadAllName = $('#downloadAll_name').val() + '.tar',
        actionType = (mode === 'downloadAll' ? 'ivr' : 'moh'),
        encodeFileName = encodeURIComponent(downloadAllName),
        packingText = $P.lang("LANG5391");

    top.dialog.dialogMessage({
        type: 'loading',
        title: packingText,
        content: packingText
    });

    $.ajax({
        type: "post",
        url: baseServerURl,
        data: {
            'action': 'packFile',
            'type': actionType,
            'data': downloadAllName
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
                top.window.open("/cgi?action=downloadFile&type=" + actionType + "&data=" + encodeFileName, '_self');

                top.dialog.clearDialog();
            }
        }
    });
}

function generateDownloadAllName() {
    var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
        today = new Date(),
        year = today.getFullYear(),
        // month = months[today.getMonth()],
        month = (today.getMonth() + 1),
        day = today.getDate().addZero(),
        hour = today.getHours().addZero(),
        minute = today.getMinutes().addZero(),
        seconds = today.getSeconds().addZero();

    if (mode == "downloadAll") {
        downloadAllName = "prompt_" + year + month + day + "_" + hour + minute + seconds;
    } else if (mode == "downloadAllMOH") {
        downloadAllName = "moh_" + year + month + day + "_" + hour + minute + seconds;
    }

    UCMGUI.domFunction.updateElementValue({
        el: "downloadAll_name",
        val: downloadAllName
    }, doc);
}

function getFileList() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listFile",
            "type": "ivr",
            "filter": JSON.stringify({
                "list_dir": 0,
                "list_file": 1,
                "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
            }),
            "sidx": "n",
            "sord": "desc"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                fileList = data.response.ivr;
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
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
            },
            "downloadAll_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true
            }
        },
        submitHandler: function() {
            if (mode === "addRecord") {
                record_new_Verify();
            } else {
                downloadFile();
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
    $.ajax({
        type: "post",
        url: baseServerURl,
        async: false,
        data: {
            "action": "checkFile",
            "type": "ivr",
            "data": CURRENT_FILE
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

                if (ACTION == 'PLAY') {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        async: false,
                        data: {
                            "action": 'playPromptByOrg',
                            "channel": y,
                            "type": 'ivr',
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
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            "action": 'recordPromptByOrg',
            "channel": extension,
            "type": 'ivr',
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
/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    upload = $("#upload"), // local upload firmware
    fileUrl = document.getElementById('fileUrl'),
    udo = document.getElementById('udo'),
    mode = "",
    timeout = 0,
    timeoutID = 0;

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;
String.prototype.addZero = top.String.prototype.addZero;
Number.prototype.addZero = top.Number.prototype.addZero;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    mode = gup.call(window, "mode");

    if (mode == "create") {
        initModuleTable();

        $("#uploadDiv, #regularDiv").hide();

        prepareAddItemForm();
    } else if (mode == "upload") {
        $("#backupDiv, #regularDiv").hide();

        initUpload();
    } else if (mode == "regular") {
        initModuleTable();

        $("#backupDiv, #uploadDiv").hide();
    }

    $P.lang(doc, true);

    if (mode !== "upload") {
        initValidator();
    }

    top.Custom.init(doc);
});

function checkDirectory(value, element) {
    if (!value) {
        return true;
    }

    var reg = /^([\w-.]+)(\/[\w-.]+)*$/i;

    return reg.test(value);
}

function initModuleTable() {
    var bkModuleInfo = {
            result: ["config", "cdr", "voice_record", "vfax", "voicemail_file", "voice_file", "storage"],
            resultLanguage: ["LANG4052", "LANG4053", "LANG2640", "LANG2988", "LANG2379", "LANG4054", "LANG4115"]
        },
        container = (mode == "create" ? $("#outputBody") : $("#RegularoutputBody")),
        oLocation = (mode == "create" ? $("#backup_location") : $("#regular_location")),
        sCheckbox = "",
        result = bkModuleInfo.result,
        resultLanguage = bkModuleInfo.resultLanguage;

    for (var i = 0; i < result.length; i++) {
        sCheckbox += '<div class="special"><input type="checkbox" class="file-type" id="' + result[i] + '" name="' + result[i] + '"><span locale="' + resultLanguage[i] + '"></span></div>';
    }

    sCheckbox += '<div class="special"><input type="checkbox" id="select_all" name="select_all"><span locale="LANG104"></span></div>';

    container.append(sCheckbox);

    $.ajax({
        type: 'GET',
        url: '../cgi?action=getInterfaceStatus',
        async: false,
        error: function() {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var data = data.response,
                    bSd = data['interface-sdcard'],
                    bUsb = data['interface-usbdisk'],
                    sLocationSelect = '<select id="location" name="location">' +
                                      (mode == "create" ? '<option value="local" locale="LANG1072"></option>' : '<option value="network" locale="LANG4074"></option>');

                if (bSd === 'true') {
                    sLocationSelect += '<option value="sd" locale="LANG262"></option>';
                }

                if (bUsb === 'true') {
                    sLocationSelect += '<option value="usb" locale="LANG263"></option>';
                }

                sLocationSelect += '</select>';

                oLocation.html(sLocationSelect);
            }
        }
    });

    /*var sLocationSelect = '<select id="location">' +
        '<option value="usb" locale="LANG263"></option>' +
        '<option value="sd" locale="LANG262"></option>' +
        (mode == "create" ? '<option value="local" locale="LANG1072"></option>' : '<option value="network" locale="LANG4074"></option>') +
        '</select>';*/

    container
        .delegate(".file-type", "click", function() {
            var checkboxes = $('.file-type'),
                select_all = $('#select_all'),
                me = this;

            if (checkboxes.filter(":checked").length != checkboxes.length) {
                select_all[0].checked = false;
                select_all.prev().css("backgroundPosition", "0px 0px");
            } else {
                select_all[0].checked = true;
                select_all.prev().css("backgroundPosition", "0px -50px");
            }

            if (me.id == "voice_record" && me.checked) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG2642"),
                    buttons: {
                        cancel: function() {
                            me.checked = false;

                            top.Custom.init(document, me);

                            select_all[0].checked = false;
                            select_all.prev().css("backgroundPosition", "0px 0px");

                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        },
                        ok: function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        }
                    }
                });
            }
        })
        .delegate("#select_all", "click", function() {
            var select_all = function(value) {
                var children = container.children().find("input");

                for (var i = 0; i < children.length; i++) {
                    if (children[i].type == 'checkbox') {
                        children[i].checked = value;
                    }

                    if (value) {
                        $(children[i]).prev().css("backgroundPosition", "0px -50px");
                    } else {
                        $(children[i]).prev().css("backgroundPosition", "0px 0px");
                    }
                }
            };

            var all = this;

            if (all.checked) {
                if (!$('#voice_record')[0].checked) {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG2642"),
                        buttons: {
                            cancel: function() {
                                select_all(false);

                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            },
                            ok: function() {
                                select_all(true);

                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        }
                    });
                } else {
                    select_all(true);
                }
            } else {
                select_all(false);
            }
        });

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            "action": "getBackupSettings",
            "type": (mode == "create" ? "realtime" : "regular")
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var fileType = ["config", "cdr", "voice_record", "vfax", "voicemail_file", "voice_file", "storage"],
                    length = fileType.length,
                    oData = data.response.type,
                    allChecked = true,
                    i = 0;

                UCMGUI.domFunction.updateDocument(oData, document);

                var location = $("#location");
                var locationChilds = location.children();

                if (locationChilds.filter("[value='" + oData.location + "']").length == 0) {
                    location.val(mode == "create" ? "local" : "regular");
                }

                if (oData["location"] === "network" || (locationChilds.val() === "network" && locationChilds.length == 1)) {
                    $("#sftp_show").css("display", "block");
                    $("#test").css("display", "inline-block");
                }

                for (i; i < length; i++) {
                    if (oData[fileType[i]] === 'no') {
                        allChecked = false;

                        break;
                    }
                }

                if (allChecked) {
                    $("#select_all")[0].checked = true;
                }

            }
        }
    });

    if (mode === "regular") {
        var RE_FIELDS = ['config', 'cdr', 'voice_record', 'vfax', 'voicemail_file', 'voice_file',
            'storage', "select_all", 'location', 'username', 'password', 'server', 'backup_dir', 'time', 'interval'
        ];

        UCMGUI.domFunction.enableCheckBox({
            enableCheckBox: "enable_regular",
            enableList: RE_FIELDS
        }, doc);

        $("#regularDiv").find("input, select").not("#enable_regular").each(function() {
            this.disabled = !$("#enable_regular")[0].checked;
        });

        $("#show_pwd").on('click', function() {
            top.UCMGUI.show_password(this, 'pwSpan', timeoutID, 'password', document)
        });

        $("#regular_location #location").on('change', function() {
            if ($(this).val() === "network") {
                $("#sftp_show").show();
                $("#test").show();
            } else {
                $("#sftp_show").hide();
                $("#test").hide();
            }

            top.dialog.currentDialogType = "iframe"
            top.dialog.repositionDialog();
        });

        test_server();
    }
}

function prepareAddItemForm() {
    var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
        today = new Date(),
        year = today.getFullYear(),
        month = months[today.getMonth()],
        day = today.getDate().addZero(),
        hour = today.getHours().addZero(),
        minute = today.getMinutes().addZero(),
        seconds = today.getSeconds().addZero(),
        bkpfile = "backup_" + year + month + day + "_" + hour + minute + seconds;

    UCMGUI.domFunction.updateElementValue({
        el: "newbkp_name",
        val: bkpfile
    }, doc);
}

function backupUCMConfig() {
    var action = {};

    action["action"] = "backupUCMConfig"; //backup files

    action["file-backup"] = $("#newbkp_name").val() + ".tar realtime";

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        data: action,
        success: function(data) {
            var status = data.status,
                backupDir = $("#backupDiv #location").val();

            if (status == "0") {
                var nFileStatus = data.response["file-backup"];

                if (nFileStatus === '') {
                    nFileStatus = -9;
                }

                var bool = UCMGUI.errorHandler(nFileStatus, function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                });

                if (bool) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG961"),
                        callback: function() {
                            if (backupDir === "local") {
                                mWindow.$("#localBackupFile_list", mWindow.document).trigger('reloadGrid');
                            } else if (backupDir === "sd") {
                                var sdName = mWindow.sdName;

                                if (sdName.length != 0) {
                                    for (var i = 0; i < sdName.length; i++) {
                                        mWindow.$("#" + sdName[i], mWindow.document).trigger('reloadGrid');
                                    }
                                }
                            } else if (backupDir === "usb") {
                                var usbDiskName = mWindow.usbDiskName;

                                if (usbDiskName.length != 0) {
                                    for (var i = 0; i < usbDiskName.length; i++) {
                                        mWindow.$("#" + usbDiskName[i], mWindow.document).trigger('reloadGrid');
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                UCMGUI.errorHandler(data, function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                });
            }
        }
    });
}

function checkFileLength() {
    var eles = (mode === "create" ? $("#outputBody input:checked") : $("#RegularoutputBody input:checked"));

    if (eles.length === 0) {
        return false;
    }

    return true;
}

function checkIfRequired() {
    var ifConfigChecked = $("#config").is(":checked"),
        ifVfaxVoicefileStorageChecked = ($("#vfax, #voice_file, #storage").filter(":checked").length > 0);

    if (mode === "create") {
        if (ifVfaxVoicefileStorageChecked && !ifConfigChecked) {
            return false;
        } else {
            return true;
        }
    } else if (mode === "regular") {
        var ifEnableRegularChecked = $("#enable_regular").is(":checked");

        if (ifEnableRegularChecked && ifVfaxVoicefileStorageChecked && !ifConfigChecked) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }

}

function doNew_crl_save_go() {
    var eles = (mode === "create" ? $("#outputBody .file-type") : $("#RegularoutputBody .file-type")),
        backupDir = $("#backupDiv #location").val();

    if (mode === "create") {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG854")
        });

        if (backupDir === "local") {
            var bLocalError = false;

            eles.not("#config").each(function() {
                if (this.checked) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG4114"),
                        callback: function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        }
                    });

                    bLocalError = true;
                    return false;
                }
            });

            if (bLocalError) {
                return;
            }
        }
    }

    var data = {
        action: "updateBackupSettings"
    };

    eles.each(function() {
        data[this.id] = this.checked ? "yes" : "no";
    });

    data["type"] = (mode === "create" ? "realtime" : "regular");
    data["location"] = $("#location").val();

    if (mode === "regular") {
        data["enable_regular"] = $("#enable_regular")[0].checked ? "yes" : "no";

        if (data["enable_regular"] === 'yes') {
            data["time"] = $("#time").val();
            data["interval"] = $("#interval").val();
        }

        if ($("#location").val() === "network") {
            data["username"] = $("#username").val();
            data["password"] = $("#password").val();
            data["server"] = $("#server").val();
            data["backup_dir"] = $("#backup_dir").val();
        }
    }

    if (!data.location) {
        delete data.location;
    }

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: data,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown,
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                if (mode === "create") {
                    backupUCMConfig();
                } else {
                    $.ajax({
                        type: 'GET',
                        url: '../cgi?action=reloadCrontabs&crontabjobs=',
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data, function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            });

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG844")
                                });
                            }
                        }
                    });
                }
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
            "newbkp_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true
            },
            "time": {
                required: true,
                digits: true,
                range: [0, 23]
            },
            "interval": {
                required: true,
                digits: true,
                range: [1, 30]
            },
            "location": {
                required: true
            },
            "username": {
                required: true,
                alphanumericUndDotAt: true
            },
            "password": {
                alphanumericUnd: true
            },
            "server": {
                required: true,
                host: ['IP or URL']
            },
            "backup_dir": {
                customCallback: [$P.lang("LANG2767"), checkDirectory]
            },
            "config": {
                customCallback1: [$P.lang("LANG5267"), checkIfRequired],
                customCallback2: [$P.lang("LANG852"), checkFileLength]
            }
        },
        submitHandler: function() {
            if (mode === "create") {
                var sBackName = $('#newbkp_name').val() + '.tar',
                    bRepeat = false,
                    backupDir = $("#backupDiv #location").val();

                if (backupDir === 'local') {
                    mWindow.$('#localBackupFile_list td[aria-describedby="localBackupFile_list_n"]', mWindow.document).each(function() {
                        if ($(this).text() === sBackName) {
                            bRepeat = true;
                            return false;
                        }
                    });
                } else if (backupDir === 'usb') {
                    mWindow.$('.usb_table', mWindow.document).find('tr.ui-widget-content').each(function() {
                        if ($(this).find('td').eq(0).text() === sBackName) {
                            bRepeat = true;
                            return false;
                        }
                    });
                } else if (backupDir === 'sd') {
                    mWindow.$('.sd_table', mWindow.document).find('tr.ui-widget-content').each(function() {
                        if ($(this).find('td').eq(0).text() === sBackName) {
                            bRepeat = true;
                            return false;
                        }
                    });
                }

                if (bRepeat) {
                    top.dialog.dialogConfirm({
                        type: "warning",
                        confirmStr: $P.lang("LANG4330"),
                        buttons: {
                            ok: function() {
                                doNew_crl_save_go();
                            },
                            cancel: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        }
                    });
                } else {
                    doNew_crl_save_go();
                }
            } else {
                doNew_crl_save_go();
            }
        }
    });
}

function initUpload() {
    udo.onclick = function() {
        uploadObj.submit();
    }

    $("#form").tooltip();

    $P("#form", document).validate({
        rules: {
            "fileUrl": {
                required: true
            }
        }
    });
}

var uploadObj = new AjaxUpload(upload, {
    action: baseServerURl + '?action=uploadfile&type=backup',
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
    },
    onComplete: function(file, data) {
        // this.enable();
        top.dialog.clearDialog();

        data = eval(data);

        if (data) {
            var status = data.status,
                response = data.response;

            if (status == 0 && response && response.result == 0) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG906"),
                    callback: function(argument) {
                        top.dialog.clearDialog();
                        mWindow.$("#localBackupFile_list", mWindow.document).trigger('reloadGrid');
                    }
                });
            } else if (response) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: UCMGUI.transcode(response.result),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG916"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            }
        } else {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG916"),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });
        }
    }
});

// function fileExist(fname) {
//     var res = true;

//     if (parent.mWindow.fileArray != undefined) {
//         parent.mWindow.fileArray.each(function(file) {
//             if (fname == file.filename) {
//                 res = false;
//                 return res;
//             }
//         });
//     }

//     return res;
// }

function onUploadFormBeforeUploading() {
    var tmp_fname = $(fileUrl).val();

    if (tmp_fname.endsWith('.tar') && /^[-a-zA-Z0-9_]+$/.test(tmp_fname.rChop('.tar')) == true) {
        // var res = fileExist(tmp_fname.rChop('.tar'));
        // if (res) {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG866")
        });
        // } else {
        //     top.dialog.dialogMessage({
        //         type: 'warning',
        //         content: $P.lang("LANG2146")
        //     });
        // }

        return true;
    } else {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG850"),
            callback: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        });
        return false;
    }
}

function test_server() {
    $("#test").on('click', function() {
        if (!$("#enable_regular")[0].checked) {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG858"),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });
            return;
        }
        if (!$P("#form", document).valid()) {
            $("input[titles]").focus();
            return;
        }

        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG859")
        });

        $.ajax({
            type: "GET",
            url: "/cgi?" + "action=reloadTestSftp&test_server=" + $('#username')[0].value + "," +
                $('#password')[0].value + "," + $('#server')[0].value,
            dataType: "json",
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG909"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                });

                if (bool) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG3213"),
                        callback: function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        }
                    });
                }
            }
        });
    });
}

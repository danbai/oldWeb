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
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    upload = $("#upload"), // local upload firmware
    fileUrl = document.getElementById('fileUrl'),
    udo = document.getElementById('udo'),
    defaultLang = "en",
    chineseLang = "zh",
    currentLanguage = defaultLang,
    localLangList = [],
    delErrObj = {
        "1": "LANG901",
        "2": "LANG902",
        "3": "LANG903"
    },
    uploadErrObj = {
        "1": "LANG890",
        "2": "LANG891",
        "3": "LANG892",
        "4": "LANG893",
        "5": "LANG894",
        "6": "LANG895",
        "7": "LANG896",
        "8": "LANG897",
        "9": "LANG898",
        "10": "LANG899"
    };

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG689"));

    initUpload();

    getLanguageList();

    getCurrentLanguage();

    $("#" + currentLanguage).attr("checked", true);

    top.Custom.init(doc);
});

function initUpload() {
    var uploadObj = new AjaxUpload(upload, {
        action: baseServerURl + '?action=uploadfile&type=voice_package',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileUrl.value = file;
            // $P("#form_moh", document).valid();
        },
        onSubmit: function(file, ext) {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: function(file, data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result') && data.response.result == 0) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG906"),
                        callback: function(argument) {
                            top.dialog.clearDialog();

                            getLanguageList();

                            getCurrentLanguage();

                            $("#" + currentLanguage).attr("checked", true);

                            top.Custom.init(doc);
                        }
                    });
                } else {
                    var message = $P.lang("LANG907");

                    if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result')) {
                        if (parseInt(data.response.result) < 0) {
                            message = $P.lang(uploadErrObj[Math.abs(parseInt(data.response.result)).toString()]);
                        } else if (parseInt(data.response.result) == 4) {
                            message = $P.lang("LANG915");
                        } else {
                            message = data.response.body;
                        }
                    }

                    top.dialog.dialogMessage({
                        type: 'error',
                        content: message
                    });
                }
            }

            fileUrl.value = "";
        }
    });

    udo.onclick = function() {
        var filename = $(fileUrl).val().toLowerCase();

        if (filename === '') {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG910")
            });

            return false;
        }

        if (filename.endsWith('.tar.bz2') || filename.endsWith('.tar.gz') ||
            filename.endsWith('.tar.z') || filename.endsWith('.tgz') ||
            filename.endsWith('.tar') || filename.endsWith('.bz2') ||
            filename.endsWith('.zip') || filename.endsWith('.gz')) {

            uploadObj.submit();
        } else {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG908")
            });

            return false;
        }
    };
}

function getLanguageList() {
    var option = '',
        lan_div = document.getElementById('languagediv'),
        children = lan_div.childNodes,
        sLanguageId,
        sLanguageName;

    localLangList = UCMGUI.isExist.getList("getLanguage");

    for (i = 0; i < children.length;) {
        lan_div.removeChild(children[i]);
    }

    for (var i = 0; i < localLangList.length; i++) {
        sLanguageId = localLangList[i].language_id;
        sLanguageName = localLangList[i].language_name;

        $("#languagediv").append(
            '<div class="language_wrap"><input id="' + sLanguageId + '" name="languageid" type="radio" class="" value="' + sLanguageId + '"><span>' +
            sLanguageName + '&nbsp;&nbsp;:&nbsp;&nbsp;' + sLanguageId + '</span><button class="deleteFileBtn" locale="LANG739" id="' + sLanguageId + 'del" >' + $P.lang("LANG739") + '</button></div>'
        );

        if (sLanguageId == defaultLang || sLanguageId == chineseLang) {
            $("#" + sLanguageId + "del").hide();
        }
    }

    $("#languagediv").delegate(".deleteFileBtn", 'click', function(ev) {
        $(this).addClass("click");

        top.dialog.dialogConfirm({
            confirmStr: $P.lang('LANG888'),
            buttons: {
                ok: deleteLanguage,
                cancel: cancel
            }
        });

        ev.stopPropagation();
        return false;
    });
}

function cancel() {
    $(".click").removeClass("click");
}

function deleteLanguage() {
    var siblings = $(".click").siblings(),
        languageid = siblings.filter("input[type=radio]").val(),
        isChecked = siblings.filter(":radio:checked").length,
        siblingsVal = siblings.filter(":radio").val(),
        action = {
            action: "removeFile",
            type: "voice_package",
            data: languageid
        };

    $(".click").removeClass("click");

    $.ajax({
        type: "post",
        url: baseServerURl,
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
                if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result') && data.response.result == 0) {
                    $("#" + languageid).parent().remove();

                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG871"),
                        callback: function() {
                            if (isChecked > 0 && siblingsVal == currentLanguage) {
                                save_changes(defaultLang); // Update the setting on user.conf, reset to "en".
                            }

                            getLanguageList();

                            getCurrentLanguage();

                            $("#" + currentLanguage).attr("checked", true);

                            top.Custom.init(doc);
                        }
                    });
                } else {
                    var message = $P.lang("LANG889");

                    if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result')) {
                        if (parseInt(data.response.result) < 0) {
                            message = $P.lang(delErrObj[Math.abs(parseInt(data.response.result)).toString()]);
                        } else {
                            message = data.body;
                        }
                    }

                    top.dialog.dialogMessage({
                        type: 'error',
                        content: message
                    });
                }
            }
        }
    });
}

function getCurrentLanguage() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            action: 'getLanguageSettings'
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                currentLanguage = data.response.language_settings.language;
            }
        }
    });
}

function save_changes(defaultLang) {
    if (defaultLang) {
        currentLanguage = defaultLang;

        var currentLanguageDom = $("#" + currentLanguage);

        currentLanguageDom.attr('checked', true);

        top.Custom.init(doc, currentLanguageDom[0])
    } else {
        currentLanguage = $(":radio[name=languageid]:checked").val();
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            action: 'updateLanguageSettings',
            language: currentLanguage
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });

                top.Custom.init(doc);
            }
        }
    });
}

function showVoicePromptsDialog() {
    top.dialog.dialogMessage({
        type: 'loading',
        displayPos: "editForm",
        content: $P.lang("LANG2470").format($P.lang("LANG2468"))
    });

    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG781"),
        displayPos: "editForm",
        hideContainer: true,
        frameSrc: "html/language_modal.html?"
    });

    top.dialog.dialog.show();

    // $.ajax({
    //     type: "POST",
    //     dataType: "json",
    //     async: false,
    //     url: "../cgi",
    //     data: {
    //     action: 'fetchRemoteLanguageList'
    //         fetchRemoteLanguagePackage
    //     },
    //     error: function(jqXHR, textStatus, errorThrown) {
    //         top.dialog.dialogMessage({
    //             type: 'error',
    //             content: errorThrown
    //         });
    //     },
    //     success: function(data) {
    //         if (data.status === 0) {}
    //     }
    // });
}
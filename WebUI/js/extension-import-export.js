/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    gup = UCMGUI.gup,
    inArray = UCMGUI.inArray,
    mode = gup.call(window, "mode"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'], // this will be the main window
    upload = $("#upload"), // local upload firmware
    fileUrl = document.getElementById('fileUrl'),
    udo = document.getElementById('importExtensions'),
    uploadObj = {},
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
    },
    importErrObj = {
        "-1": "LANG3176",
        "-2": "LANG3177",
        "-3": "LANG3178",
        "-4": "LANG3179",
        "-5": "LANG3190",
        "-6": "LANG3199",
        "-7": "LANG3203",
        "-8": "LANG3180",
        "-9": "LANG2157",
        "-10": "LANG2636",
        "-11": "LANG2174",
        "-12": "LANG2635",
        "-13": "LANG2161",
        "-99": "LANG3181"
    };

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    if (mode == "import") {
        $("#import_extension_div").show();

        loadJSONFile();

        initUpload();

        initValidator();
    } else if (mode == "export") {
        $("#export_extension_div").show();
    }

    top.Custom.init(doc);

    $('.btn-save').click(function(event) {
        var id = $(this).attr('id');

        if (id === 'importExtensions') {
            if (!$P("#form", document).valid()) {
                return;
            } else {
                var filename = $(fileUrl).val().toLowerCase();
                var submitForm = function() {
                    if (filename.endsWith('.csv')) {
                        uploadObj.submit();
                    } else {
                        top.dialog.dialogMessage({
                            type: 'warning',
                            content: $P.lang("LANG3165"),
                            callback: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        });
                    }
                }
                if ($("#dupliOperation").val() == "delete") {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG4473"),
                        buttons: {
                            ok: function() {
                                submitForm();
                            },
                            cancel: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        }
                    });
                } else {
                    submitForm();
                }
            }
        } else {
            var type = $('#accountType').val();

            top.window.open("/cgi?action=downloadFile&type=export_" + type + "_extensions&data=export_" + type + "_extensions.csv", '_self');

            top.dialog.clearDialog();
        }

        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    });
    $('#dupliOperation').change(function(event) {
        uploadObj = {};

        fileUrl.value = '';

        initUpload();
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    });
});

function initUpload() {
    var dupliOperationStr = 'import_' + $('#dupliOperation').val() + '_extensions';

    uploadObj = new AjaxUpload(upload, {
        action: baseServerURl + '?action=uploadfile&type=' + dupliOperationStr + "&_location=extension",
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

            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });
            if (bool) {
                if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result')) {
                    if (data.response.result == 0) {
                        // import extensions after upload successfully

                        top.dialog.closeCurrentDialog();

                        // if there is any failed extensions.
                        $.ajax({
                            type: "GET",
                            async: false,
                            dataType: "json",
                            url: "../import_extension_response.json",
                            error: function(jqXHR, textStatus, errorThrown) {},
                            success: function(data) {
                                if (!$.isEmptyObject(data)) {
                                    var fileName = data.filename,
                                        failed = data.faild,
                                        out = data.out,
                                        buf = [],
                                        extension = '',
                                        name = '',
                                        err = 0;

                                    if (failed.length || out.length) {
                                        top.dialog.container.show();
                                        top.dialog.shadeDiv.show();

                                        if (failed.length) {
                                            for (var i = 0; i < failed.length; i++) {
                                                if (!$.isEmptyObject(failed[i])) {
                                                    err = importErrObj[failed[i]["code"]];
                                                    if (failed[i]["code"] === -13) {
                                                        name = failed[i]["item"] + " " + $P.lang(err).format("4");
                                                    } else {
                                                        name = failed[i]["item"] + " " + $P.lang(err);
                                                    }
                                                    extension = failed[i]["ext"] ? failed[i]["ext"] : "";
                                                    buf.push($P.lang("LANG3200").format(failed[i]["line"]) + " (" + extension + ") : " + name.toString());
                                                }
                                            }
                                        }

                                        if (out.length) {
                                            extension = '';
                                            for (var i = 0; i < out.length; i++) {
                                                if (i % 5 == 0 && i > 0)
                                                    extension = extension + '<br/>';
                                                extension = extension + out[i] + ',';
                                            }
                                            buf.push($P.lang("LANG3182").format(extension.slice(0, extension.length - 1)));
                                        }

                                        $('.levelTip').html($P.lang("LANG2743").format(buf.join('<br/>')));

                                        $('#failed').show();

                                        // reset innerhtml height
                                        if (window.frameElement) {
                                            $(window.frameElement).css("height", "0px");
                                        }

                                        // top.dialog.currentDialogType = "iframe";
                                        top.dialog.restorePrevContentDialog();
                                        // top.dialog.repositionDialog();
                                    } else {
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG2742"),
                                            callback: function(argument) {
                                                mWindow.$("#extension-list", mWindow.document).trigger('reloadGrid');

                                                // update existNumberList/existExtentionList/existFXSList/extensionRange
                                                mWindow.updateLists();

                                                top.$.cookie("needApplyChange", "yes");

                                                var applyChanges = $("#applyChanges_Button", top.frames["frameContainer"].document),
                                                    lineButton = $("#line_Button", top.frames["frameContainer"].document);

                                                if (applyChanges.length > 0 && lineButton.length > 0 && !applyChanges.is(':animated')) {
                                                    applyChanges.css("visibility", "visible");
                                                    lineButton.css("visibility", "visible");
                                                    // applyChanges.effect("shake", {
                                                    //  direction: "up", distance: 2, times: 10000
                                                    // }, 400);
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    } else if (data.response.result == -1) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang('LANG3204')
                        });
                    } else {
                        top.dialog.clearDialog();

                        var message = $P.lang("LANG907");

                        if (parseInt(data.response.result) < 0) {
                            message = $P.lang(uploadErrObj[Math.abs(parseInt(data.response.result)).toString()]);
                        } else if (parseInt(data.response.result) == 4) {
                            message = $P.lang("LANG915");
                        } else if (data.response.body) {
                            message = data.response.body;
                        }


                        top.dialog.dialogMessage({
                            type: 'error',
                            content: message,
                            callback: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        });
                    }
                }

                fileUrl.value = "";
            }
        }
    });
}

function initValidator() {
    $("#form").tooltip();

    $P("#form", document).validate({
        rules: {
            "fileUrl": {
                required: true
            }
        }
    });
}

function loadJSONFile() {
    $.ajax({
        type: "GET",
        async: false,
        dataType: "json",
        url: "../import_extension_response.json",
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            if (!$.isEmptyObject(data)) {
                var fileName = data.filename,
                    failed = data.faild,
                    out = data.out,
                    buf = [],
                    extension = '',
                    name = '',
                    err = 0;

                if (failed.length || out.length) {
                    if (failed.length) {
                        for (var i = 0; i < failed.length; i++) {
                            if (!$.isEmptyObject(failed[i])) {
                                err = importErrObj[failed[i]["code"]];
                                if (failed[i]["code"] === -13) {
                                    name = failed[i]["item"] + " " + $P.lang(err).format("4");
                                } else {
                                    name = failed[i]["item"] + " " + $P.lang(err);
                                }
                                extension = failed[i]["ext"] ? failed[i]["ext"] : "";
                                buf.push($P.lang("LANG3200").format(failed[i]["line"]) + " (" + extension + ") : " + name.toString());
                            }
                        }
                    }

                    if (out.length) {
                        extension = '';
                        for (var i = 0; i < out.length; i++) {
                            if (i % 5 == 0 && i > 0)
                                extension = extension + '<br/>';
                            extension = extension + out[i] + ',';
                        }
                        // buf.push('{0}'.format(extension));
                        buf.push($P.lang("LANG3182").format(extension.slice(0, extension.length - 1)));
                    }

                    $('.levelTip').html($P.lang("LANG2744").format(buf.join('<br/>')));

                    $('#failed').css("display", "block");

                    // reset innerhtml height
                    if (window.frameElement) {
                        $(window.frameElement).css("height", "0px");
                    }

                    // top.dialog.currentDialogType = "iframe";
                }

                top.dialog.repositionDialog();
            }
        }
    });
}
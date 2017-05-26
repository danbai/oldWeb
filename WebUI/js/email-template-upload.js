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
    uploadObj = {};

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;

$(function() {
    $P.lang(doc, true);

    initUpload();

    initValidator();

    $('#type').change(function(event) {
        uploadObj = {};

        initUpload();
    });

    $('#save').click(function(ev) {
        if (!$P("#form", document).valid()) {
            return;
        } else {
            uploadObj.submit();
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    });

    top.Custom.init(doc);
});

function initUpload() {
    $("#uploadDiv")
        .empty()
        .append("<input type='text' id='fileUrl' name='fileUrl' readonly='readonly'/>" +
            "<button type='button' id='upload' class='selectBtn'></button>");

    var fileUrl = document.getElementById('fileUrl'),
        upload = $("#upload"); // local upload firmware

    uploadObj = new AjaxUpload(upload, {
        action: baseServerURl + '?action=uploadfile&type=' + $('#type').val(),
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileUrl.value = file;
        },
        onSubmit: function(file, ext) {
            if (!onUploadFormBeforeUploading()) {
                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG881")
            });
        },
        onComplete: function(file, data) {
            data = eval(data);

            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var status = data.status,
                    response = data.response;

                if (status == 0 && response && response.result == 0) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG906"),
                        callback: function() {
                            mWindow.$("#emailTemplateList", mWindow.document).trigger('reloadGrid');
                        }
                    });

                    initUpload();
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
            }
        }
    });
}

function initValidator() {
    $("#form").tooltip();

    $P("#form", document).validate({
        rules: {
            "fileUrl": {
                required: true,
                maxlength: 100,
                customCallback1: [$P.lang("LANG2148"), function() {
                    return /^[^&#(\/;*?,\[]*$/.test($("#fileUrl").val());
                }]
            }
        }
    });
}

var onUploadFormBeforeUploading = function() {
    var tmp_fname = $("#fileUrl").val();

    if (!$P("#form", document).valid()) {
        return false;
    } else if (tmp_fname.endsWith('.html')) {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG866")
        });

        return true;
    } else {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG911").format('html', $P.lang('LANG4576')),
            callback: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        });

        return false;
    }
};

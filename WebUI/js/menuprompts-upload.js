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
    isConsumer = (($P.cookie('role') === 'privilege_3') ? true : false),
    fileType = '',
    fileList = [],
    uploadObj = {};

String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;

$(function() {
    if (isConsumer) {
        var command = '<div class="field-cell modal-commands dialogContainer-commands" style="display: none;">' +
                    '<button type="button" class="btn btn-cancel" onclick="top.dialog.clearDialog();" locale="LANG726"></button>' +
                    '<button type="submit" class="btn btn-save" id="save" locale="LANG728"></button>' +
                '</div>';

        fileType = 'user_recording';

        $('.consumer-data').css({
            'display': 'inline-block'
        });

        $('#udo').parent().remove();

        $('#uploadForm_container').append(command);

        $('#consumerData').change(function(event) {
            uploadObj = {};

            $('#fileUrl')[0].value = '';

            initUpload();
        });

        $('#save').click(function(ev) {
            if (!$P("#menupromptsDiv", document).valid()) {
                return;
            } else {
                uploadObj.submit();
            }

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        });
    } else {
        $('#fileTip').attr('tooltip', '@LANG5405');

        fileType = 'ivr';
    }

    $P.lang(doc, true);

    getFileList();

    initUpload();

    initValidator();

    top.Custom.init(doc);
});

function getFileList() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listFile",
            "type": fileType,
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
                fileList = data.response[fileType];
            }
        }
    });
}

function file_exist(value) {
    var index = value.lastIndexOf('.'),
        filename = value.slice(0, index);

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

function initUpload() {
    $("#uploadDiv")
        .empty()
        .append("<input type='text' id='fileUrl' name='fileUrl' readonly='readonly'/>" +
            "<button type='button' id='upload' class='selectBtn'></button>");

    if (isConsumer) {
        var action = '../cgi?action=uploadfile&type=user_recording&data=' + $('#consumerData').val() + "&_location=menuprompts_record";
    } else {
        var action = '../cgi?action=uploadfile&type=ivr' + "&_location=menuprompts_record";
    }
        
    var fileUrl = document.getElementById('fileUrl'),
        upload = $("#upload"), // local upload firmware
        udo = document.getElementById('udo');

    uploadObj = new AjaxUpload(upload, {
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
                            mWindow.$("#ivrprompts_list", mWindow.document).trigger('reloadGrid');
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

    if (udo) {
        udo.onclick = function() {
            uploadObj.submit();
            // onProgress();
        };
    }
}

function initValidator() {
    $("#menupromptsDiv").tooltip();

    $P("#menupromptsDiv", document).validate({
        rules: {
            "fileUrl": {
                required: true,
                maxlength: 100,
                customCallback: [$P.lang("LANG2552"), function() {
                    return /^[^\[&#(\/`;*?,|\$\>\]\+\']*$/.test($("#fileUrl").val());
                }]
            },
            "consumerData" : {
                customCallback: [$P.lang('LANG270').format($P.lang('LANG1950')), function(val, ele) {
                    for (var i = 0; i < fileList.length; i++) {
                        var pointIndex = fileList[i]['n'].lastIndexOf('.'),
                            existedFileName = fileList[i]['n'].slice(0, pointIndex);

                        if (val === existedFileName) {
                            return false;
                        }
                    }

                    return true;
                }]
            }
        }
    });
}

function isCompressed(filename) {
    var result = false;

    if (filename.endsWith('.tar') || filename.endsWith('.tgz') || filename.endsWith('.tar.gz')) {
        result = true;
    }

    return result;
}

function onUploadFormBeforeUploading() {
    var tmp_fname = $("#fileUrl").val();

    if (tmp_fname) {
        tmp_fname = tmp_fname.toLowerCase();
        
        if (!$P("#menupromptsDiv", document).valid()) {
            return false;
        } else if (tmp_fname.endsWith('.mp3') ||
            tmp_fname.endsWith('.wav') ||
            tmp_fname.endsWith('.gsm') ||
            tmp_fname.endsWith('.ulaw') ||
            tmp_fname.endsWith('.alaw')) {

            var res = (isConsumer ? true : file_exist(tmp_fname));

            if (res) {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG866")
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG2146"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            }

            return res;
        } else if (!isConsumer && isCompressed(tmp_fname)) {

            if (/^[a-zA-Z0-9_\-]+(\.tar|\.tgz|\.tar\.gz)$/g.test(tmp_fname)) {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG866")
                });

                return true;
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG5406"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });

                return false;
            }

        } else {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG5406"),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });

            return false;
        }
    }
}

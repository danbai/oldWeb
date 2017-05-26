/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    existedPortList = mWindow.existedPortList,
    ifExisted = UCMGUI.inArray,
    oldAMIPort = "",
    oldTLSPort = "",
    oldDom = "";

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;

$(function() {
    $P.lang(doc, true);

    initUpload();

    initValidator();

    getAMISettins();

    btnDelete_check_state();
});

function AMIPortIsExist(val, ele) {
    var tmpAMIPortList = [];

    tmpAMIPortList = existedPortList.copy(tmpAMIPortList);

    if (oldAMIPort) {
        tmpAMIPortList.remove(oldAMIPort);
    }

    return !ifExisted(val.value, tmpAMIPortList);
}

function btnDelete_check_state(fileType) {
    if ((fileType == "key" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "ami_tls_key"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#ami_tls_key_delete").attr("disabled", false);
                    $("#tlsprivatekey").val("ami_private.pem");
                } else {
                    $("#ami_tls_key_delete").attr("disabled", true);
                    $("#tlsprivatekey").val("");
                }

                $("#ami_tls_key_upload").attr("disabled", true);
            }
        });
    }

    if ((fileType == "pem" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "ami_tls_cert"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#ami_tls_cert_delete").attr("disabled", false);
                    $("#tlscertfile").val("ami_certificate.pem");
                } else {
                    $("#ami_tls_cert_delete").attr("disabled", true);
                    $("#tlscertfile").val("");
                }

                $("#ami_tls_cert_upload").attr("disabled", true);
            }
        });
    }
}

function confirm_reboot() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG2709").format($P.lang("LANG844")),
        buttons: {
            ok: UCMGUI.loginFunction.confirmReboot
        }
    });
}

function delete_file(type) {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG938"),
        buttons: {
            ok: function() {
                processDeleteFile(type);
            },
            cancel: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        }
    });
}

function differentWithPort(val, ele) {
    return (val != $('#port').val());
}

function file_upload_complete_tip(file, response) {
    if (fileType == "key") {
        $("#tlsprivatekey").val("");
    } else if (fileType == "pem") {
        $("#tlscertfile").val("");
    }

    var bool = UCMGUI.errorHandler(response, function() {
        top.dialog.container.show();
        top.dialog.shadeDiv.show();
    });

    if (bool) {
        if (response.response && response.response.result == "0") {
            // list_key_files();
            // confirm_reboot();

            top.dialog.dialogMessage({
                type: 'success',
                content: $P.lang("LANG906"),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });

            showApplyChange();
        } else {
            if (response && response.response && response.response.body) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: response.response.body,
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG907"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            }
        }
    }

    btnDelete_check_state(fileType);
}

function getAMISettins() {
    var action = {
        "action": "getAmiSettings"
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
                var AMISettings = data.response.ami_settings;

                UCMGUI.domFunction.updateDocument(AMISettings, doc);

                oldAMIPort = AMISettings.port + "";

                oldTLSPort = AMISettings.tlsbindport + "";

                if (!AMISettings.tlsbindport) {
                    $('#tlsbindport').val('');
                }

                oldDom = getDomStr();

                top.Custom.init(doc);

                top.dialog.repositionDialog();
            }
        }
    });
}

function getDomStr() {
    var domStr = "",
        dom = $("input").not('#tlsprivatekey, #tlscertfile');

    dom.each(function() {
        if (this.type == 'checkbox') {
            domStr += (this.checked ? "yes" : "no");
        } else {
            domStr += this.value;
        }
    });

    return domStr;
}

function initUpload() {
    var ami_tls_key_select = $("#ami_tls_key_select"),
        amitlskeyfile = $("#tlsprivatekey"),
        ami_tls_key_upload = $("#ami_tls_key_upload"),
        ami_tls_key_delete = $("#ami_tls_key_delete");

    var ami_tls_key_uploader = new AjaxUpload(ami_tls_key_select, {
        action: '/cgi?action=uploadfile&type=ami_tls_key',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "key";

            $(amitlskeyfile).val(file);

            if (file) {
                $(ami_tls_key_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "key";

            var pattern = /^(pem)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.pem', $P.lang('LANG3000')),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });

                $(ami_tls_key_upload).attr("disabled", true);

                $(amitlskeyfile).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(ami_tls_key_upload).bind({
        click: function() {
            ami_tls_key_uploader.submit();
        }
    });

    $(ami_tls_key_delete).bind({
        click: function() {
            delete_file("ami_tls_key");
            return false;
        }
    });

    // upload client cert 
    var ami_tls_cert_select = $("#ami_tls_cert_select"),
        amitlscertfile = $("#tlscertfile"),
        ami_tls_cert_upload = $("#ami_tls_cert_upload"),
        ami_tls_cert_delete = $("#ami_tls_cert_delete");

    var ami_tls_cert_uploader = new AjaxUpload(ami_tls_cert_select, {
        action: '../cgi?action=uploadfile&type=ami_tls_cert',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "pem";

            $(amitlscertfile).val(file);

            if (file) {
                $(ami_tls_cert_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "pem";

            var pattern = /^(pem)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.pem', $P.lang('LANG3002')),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });

                $(ami_tls_cert_upload).attr("disabled", true);

                $(amitlscertfile).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(ami_tls_cert_upload).bind({
        click: function() {
            ami_tls_cert_uploader.submit();
        }
    });

    $(ami_tls_cert_delete).bind({
        click: function() {
            delete_file("ami_tls_cert");
            return false;
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "port": {
                required: true,
                digits: true,
                range: [1024, 65535],
                isExist: [$P.lang("LANG270").format($P.lang("LANG237")), AMIPortIsExist]
            },
            "tlsbindport": {
                required: function(element) {
                    return $('#tlsenable').is(':checked');
                },
                digits: true,
                range: [1, 65535],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG3835")), differentWithPort],
                isExist: [$P.lang("LANG270").format($P.lang("LANG237")), TLSPortIsExist]
            },
            "writetimeout": {
                required: true,
                range: [100, 10000]
            },
            "tlsbindaddr": {
                required: function(element) {
                    return $('#tlsenable').is(':checked');
                },
                ipAddress: true
            }
        },
        submitHandler: function() {
            var action = {};

            action = UCMGUI.formSerializeVal(document);

            action["action"] = "updateAmiSettings";

            updateOrAddAMISettings(action);
        }
    });
}

function processDeleteFile(type) {
    if (type == "ami_tls_key") {
        fileType = "key";
    } else if (type == "ami_tls_cert") {
        fileType = "pem";
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            action: "removeFile",
            type: type
        },
        async: false,
        url: baseServerURl,
        success: function(data) {
            btnDelete_check_state(fileType);

            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                if (data && data.response && data.response.result == "0") {
                    // confirm_reboot();

                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG871"),
                        callback: function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        }
                    });

                    showApplyChange();
                } else {
                    if (data.response.body) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: data.response.body,
                            callback: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        });
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG889"),
                            callback: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        });
                    }
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });

            btnDelete_check_state();
        }
    });
}

function showApplyChange() {
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

function TLSPortIsExist(val, ele) {
    var tmpTLSPortList = [];

    tmpTLSPortList = existedPortList.copy(tmpTLSPortList);

    if (oldTLSPort) {
        tmpTLSPortList.remove(oldTLSPort);
    }

    return !ifExisted(val.value, tmpTLSPortList);
}

function updateOrAddAMISettings(action) {
    var newDom = getDomStr();

    if (oldDom != newDom) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG2709").format($P.lang("LANG4385")),
            buttons: {
                ok: function() {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: action,
                        error: function(jqXHR, textStatus, errorThrown) {},
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data, function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            });

                            if (bool) {
                                UCMGUI.loginFunction.confirmReboot();
                            }
                        }
                    });
                }
            }
        });
    } else {
        $.ajax({
            type: "post",
            url: "../cgi",
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {},
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
                }
            }
        });
    }
}
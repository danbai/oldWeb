/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    decode = UCMGUI.urlFunction.decode,
    method = null,
    sCaCert = "8021x_ca_cert",
    sClientCert = "8021x_client_cert",
    sCaCert2 = "8021x_ca_cert2",
    sClientCert2 = "8021x_client_cert2";

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG708"));

    initValidator();

    bindEAPChange();

    initPage();

    top.Custom.init(document);
});

// mapping to parent jQuery
function initPage() {
    $.ajax({
        url: "../cgi",
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getNetworkSettings",
            method: ''
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                method = data.response.network_settings.method;

                if (method == "0") {
                    $("#title-lan1").hide();
                    $("#title-lan2").hide();
                    $("#title-wan").show();
                    $("#lan2").hide();
                } else if (method == "2") {
                    $("#title-lan1").show();
                    $("#title-lan2").show();
                    $("#title-wan").hide();
                    $("#title-lan").hide();
                    $("#lan2").show();
                } else {
                    $("#title-lan1").hide();
                    $("#title-wan").hide();
                    $("#lan2").hide();
                }

                $.ajax({
                    url: "../cgi",
                    type: "POST",
                    dataType: "json",
                    async: false,
                    data: {
                        action: "getNetworkproSettings"
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            if (method == 2) {
                                var oData = data.response;
                                $("#mode").val(oData["lan2.802.1x.mode"]);
                                $("#identity").val(oData["lan2.802.1x.identity"]);
                                $("#md5_secret").val(oData["lan2.802.1x.password"]);
                                $("#lan2.802.1x.mode").val(oData.mode);
                                $("#lan2.802.1x.identity").val(oData.identity);
                                $("#lan2.802.1x.password").val(oData.md5_secret);
                                sCaCert = "8021x_ca_cert2";
                                sClientCert = "8021x_client_cert2",
                                sCaCert2 = "8021x_ca_cert",
                                sClientCert2 = "8021x_client_cert";
                            }
                            else {
                                UCMGUI.domFunction.updateDocument(data.response, document);
                            }

                            EAPChange();
                            EAPChange2();
                        }
                    }
                });
            }
        }
    });

    // upload ca cert
    var ca_cert_select = $("#ca_cert_select"),
        ca_cert_file = $("#ca_cert_file"),
        ca_cert_upload = $("#ca_cert_upload"),
        ca_cert_delete = $("#ca_cert_delete");

    var ca_cert_uploader = new AjaxUpload(ca_cert_select, {
        action: '../cgi?action=uploadfile&type=' + sCaCert,
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            $(ca_cert_file).val(file);
        },
        onSubmit: function(file, ext) {
            if (!file) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG910")
                });

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(ca_cert_upload).bind({
        click: function() {
            ca_cert_uploader.submit();
        }
    });

    $(ca_cert_delete).bind({
        click: function() {
            delete_file(sCaCert);

            return false;
        }
    });

    // upload client cert 
    var client_cert_select = $("#client_cert_select"),
        client_cert_file = $("#client_cert_file"),
        client_cert_upload = $("#client_cert_upload"),
        client_cert_delete = $("#client_cert_delete");

    var client_cert_uploader = new AjaxUpload(client_cert_select, {
        action: '../cgi?action=uploadfile&type=' + sClientCert,
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            $(client_cert_file).val(file);
        },
        onSubmit: function(file, ext) {
            if (!file) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG910")
                });

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });

            // this.disable(); 
        },
        onComplete: file_upload_complete_tip
    });

    $(client_cert_upload).bind({
        click: function() {
            client_cert_uploader.submit();
        }
    });

    $(client_cert_delete).bind({
        click: function() {
            delete_file(sClientCert);

            return false;
        }
    });

    // upload ca cert2
    var ca_cert_select2 = $("#ca_cert_select2"),
        ca_cert_file2 = $("#ca_cert_file2"),
        ca_cert_upload2 = $("#ca_cert_upload2"),
        ca_cert_delete2 = $("#ca_cert_delete2");

    var ca_cert_uploader2 = new AjaxUpload(ca_cert_select2, {
        action: '../cgi?action=uploadfile&type=' + sCaCert2,
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            $(ca_cert_file2).val(file);
        },
        onSubmit: function(file, ext) {
            if (!file) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG910")
                });

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });

            // this.disable();
        },
        onComplete: file_upload_complete_tip
    });

    $(ca_cert_upload2).bind({
        click: function() {
            ca_cert_uploader2.submit();
        }
    });

    $(ca_cert_delete2).bind({
        click: function() {
            delete_file(sCaCert2);

            return false;
        }
    });

    // upload client cert2 
    var client_cert_select2 = $("#client_cert_select2"),
        client_cert_file2 = $("#client_cert_file2"),
        client_cert_upload2 = $("#client_cert_upload2"),
        client_cert_delete2 = $("#client_cert_delete2");

    var client_cert_uploader2 = new AjaxUpload(client_cert_select2, {
        action: '../cgi?action=uploadfile&type=' + sClientCert2,
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            $(client_cert_file2).val(file);
        },
        onSubmit: function(file, ext) {
            if (!file) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG910")
                });

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });

            // this.disable();
        },
        onComplete: file_upload_complete_tip
    });

    $(client_cert_upload2).bind({
        click: function() {
            client_cert_uploader2.submit();
        }
    });

    $(client_cert_delete2).bind({
        click: function() {
            delete_file(sClientCert2);

            return false;
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "identity": {
                required: true,
                keyboradNoSpace: true,
                maxlength: 15
            },
            "md5_secret": {
                required: true,
                maxlength: 15
            },
            "lan2.802.1x.identity": {
                required: true,
                keyboradNoSpace: true,
                maxlength: 15
            },
            "lan2.802.1x.password": {
                required: true,
                maxlength: 15
            }
        },
        submitHandler: function() {
            save_changes();
        }
    });
}

function file_upload_complete_tip(file, response) {
    top.dialog.clearDialog();

    var bool = UCMGUI.errorHandler(response);

    if (bool) {
        if (response.response && response.response.result == "0") {
            top.dialog.dialogMessage({
                type: 'success',
                content: $P.lang("LANG906")
            });
        } else {
            if (response && response.response && response.response.body) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: response.response.body
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG907")
                });
            }
        }
    }

    btnDelete_check_state();

    btnDelete_check_state2();
}

function delete_file(type) {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG938"),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG904")
                });

                processDeleteFile(type);
            }
        }
    });
}

function processDeleteFile(type) {
    $.ajax({
        type: "POST",
        url: "../cgi",
        dataType: "json",
        // async: false,
        data: {
            action: "removeFile",
            type: type
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });

            btnDelete_check_state();

            btnDelete_check_state2();
        },
        success: function(data, textStatus, jqXHR) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                top.dialog.clearDialog();

                if (data && data.response && data.response.result == "0") {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG871")
                    });
                } else {
                    if (data.response.body) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: data.response.body
                        });
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG889")
                        });
                    }
                }
            }

            btnDelete_check_state();

            btnDelete_check_state2();
        }
    });
}

function save_changes() {
    $("#lan2.802.1x.username").val($("#lan2.802.1x.identity").val());

    var sData = $("#form").serialize();

    if (method == 2) {
        sData = 'mode=' + $("#lan2.802.1x.mode").val() + '&identity=' + $("#lan2.802.1x.identity").val() + '&md5_secret=' + $("#lan2.802.1x.password").val() + 
                '&lan2.802.1x.mode=' + $("#mode").val() + '&lan2.802.1x.identity=' + $("#identity").val() +
                '&lan2.802.1x.username=' + $("#identity").val() + '&lan2.802.1x.password=' + $("#md5_secret").val();
    }

    $.ajax({
        url: "../cgi",
        type: "POST",
        dataType: "json",
        data: "action=updateNetworkproSettings&" + sData,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG927"),
                    buttons: {
                        ok: UCMGUI.loginFunction.confirmReboot
                    }
                });
            }

            btnDelete_check_state();

            btnDelete_check_state2();
        }
    });
}

function apply_changes() {
    // top.dialog.clearDialog();

    // $.ajax({
    //     type: 'GET',
    //     url: '../webcgi?action=reload8021x&802.1x=',
    //     success: function(response) {
    //         if (response.response.trim() == 'success') {
    //             top.dialog.dialogMessage({
    //                 type: 'success',
    //                 content: $P.lang("LANG945")
    //             });
    //         } else {
    //             top.dialog.dialogMessage({
    //                 type: 'error',
    //                 content: response.body
    //             });
    //         }
    //     }
    // });

    // $("#apply").hide();
}

function bindEAPChange() {
    $('#mode').on('change', EAPChange);
    $('#lan2.802.1x.mode').on('change', EAPChange2);
}

function changeRequired(sval, aRulesObj) {
    if (sval === '2') {
        aRulesObj.each(function() {
            $P(this).rules('remove', 'required', 'notOnlyAndDifRules');
        });
    } else {
        aRulesObj.each(function() {
            $P(this).rules('add', 'required', 'notOnlyAndDifRules');
        });
    }
}

function EAPChange() {
    var sval = $(".EAP").val(),
        aRulesObj = $P('#identity, #md5_secret', document);

    if (sval == "0") {
        $("#divNvram, #divUfile").hide();
    } else if (sval == "1") {
        $("#divNvram").show();

        $("#divUfile").hide();
    } else {
        $("#divNvram, #divUfile").show();
    }

    changeRequired(sval, aRulesObj);

    btnDelete_check_state();
}

function EAPChange2() {
    var sval = $(".EAP2").val(),
        aRulesObj = $P('input[id^="lan2.802.1x"]', document);

    if (sval == "0") {
        $("#divNvram2, #divUfile2").hide();
    } else if (sval == "1") {
        $("#divNvram2").show();

        $("#divUfile2").hide();
    } else {
        $("#divNvram2, #divUfile2").show();
    }

    $('#div_save_btns').show();

    changeRequired(sval, aRulesObj);

    btnDelete_check_state2();

    //top.Custom.init(document);
}

function btnDelete_check_state() {
    $.ajax({
        type: "GET",
        url: "../cgi",
        dataType: "json",
        async: false,
        data: {
            action: "checkFile",
            type: "8021x_ca_cert"
        },
        success: function(data) {
            var ca_cert_delete = document.getElementById("ca_cert_delete"),
                ca_cert_file = document.getElementById("ca_cert_file");

            if (method == 2) {
                ca_cert_delete = document.getElementById("ca_cert_delete2"),
                ca_cert_file = document.getElementById("ca_cert_file2");
            }

            if (data && data.status == 0 && data.response.result == 0) {
                if (ca_cert_delete && ca_cert_file) {
                    ca_cert_delete.disabled = false;
                    ca_cert_file.value = sCaCert;
                }
            } else {
                ca_cert_delete.disabled = true;
                ca_cert_file.value = "";
            }
        }
    });

    $.ajax({
        type: "GET",
        url: "../cgi",
        dataType: "json",
        async: false,
        data: {
            action: "checkFile",
            type: "8021x_client_cert"
        },
        success: function(data) {
            var client_cert_delete = document.getElementById("client_cert_delete"),
                client_cert_file = document.getElementById("client_cert_file");

            if (method == 2) {
                client_cert_delete = document.getElementById("client_cert_delete2"),
                client_cert_file = document.getElementById("client_cert_file2");
            }

            if (data && data.status == 0 && data.response.result == 0) {
                client_cert_delete.disabled = false;
                client_cert_file.value = sClientCert;
            } else {
                client_cert_delete.disabled = true;
                client_cert_file.value = "";
            }
        }
    });
}

function btnDelete_check_state2() {
    $.ajax({
        type: "GET",
        url: "../cgi",
        dataType: "json",
        async: false,
        data: {
            action: "checkFile",
            type: "8021x_ca_cert2"
        },
        success: function(data) {
            var ca_cert_delete2 = document.getElementById("ca_cert_delete2"),
                ca_cert_file2 = document.getElementById("ca_cert_file2");

            if (method == 2) {
                ca_cert_delete2 = document.getElementById("ca_cert_delete"),
                ca_cert_file2 = document.getElementById("ca_cert_file");
            }

            if (data && data.status == 0 && data.response.result == 0) {
                if (ca_cert_delete2 && ca_cert_file2) {
                    ca_cert_delete2.disabled = false;
                    ca_cert_file2.value = sCaCert2;
                }
            } else {
                if (ca_cert_delete2 && ca_cert_file2) {
                    ca_cert_delete2.disabled = true;
                    ca_cert_file2.value = "";
                }
            }
        }
    });

    $.ajax({
        type: "GET",
        url: "../cgi",
        dataType: "json",
        async: false,
        data: {
            action: "checkFile",
            type: "8021x_client_cert2"
        },
        success: function(data) {
            var client_cert_delete2 = document.getElementById("client_cert_delete2"),
                client_cert_file2 = document.getElementById("client_cert_file2");

            if (method == 2) {
                client_cert_delete2 = document.getElementById("client_cert_delete"),
                client_cert_file2 = document.getElementById("client_cert_file");
            }

            if (data && data.status == 0 && data.response.result == 0) {
                if (client_cert_delete2 && client_cert_file2) {
                    client_cert_delete2.disabled = false;
                    client_cert_file2.value = sClientCert2;
                }
            } else {
                if (client_cert_delete2 && client_cert_file2) {
                    client_cert_delete2.disabled = true;
                    client_cert_file2.value = "";
                }
            }
        }
    });
}
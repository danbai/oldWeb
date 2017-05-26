/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2016 Grandstream Networks, Inc.
 *
 */

String.prototype.format = top.String.prototype.format;

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    oCloudAccounts = {};

hljs.tabReplace = '    ';
hljs.initHighlightingOnLoad();

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4507"));

    getWebRTCCloudServiceSettings();

    initValidator();
});

function getWebRTCCloudServiceSettings() {
    $.ajax({
        url: "../cgi?action=getWebRTCCloudServiceSettings",
        type: "GET",
        // async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var cloud_account = data.response.cloud_account,
                    cloud_password = data.response.cloud_password,
                    cloud_endtime = data.response.cloud_endtime,
                    cloud_email = data.response.cloud_email;

                oCloudAccounts = {
                    'cloud_account': cloud_account,
                    'cloud_password': cloud_password,
                    'cloud_endtime': cloud_endtime,
                    'cloud_email': cloud_email
                }

                $('#cloud_account').val(cloud_account);
                $('#cloud_password').val(cloud_password);
                $('#cloud_endtime').text(cloud_endtime);

                if (cloud_password) {
                    $('#btnModify, #btnReset, #btnDelete').removeAttr('disabled');
                    $('#trial').attr('disabled', true);
                } else {
                    $('#btnModify, #btnReset, #btnDelete').attr('disabled', true);
                    $('#trial').removeAttr('disabled');
                }

                renderCloudAccount();

                top.Custom.init(doc);
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
            "cloud_account": {
                required: true,
                maxlength: 64
            },
            "cloud_password": {
                required: true,
                minlength: 6,
                maxlength: 64
            }
        },
        newValidator: true,
        submitHandler: function(ev) {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG4511")
            });

            var action = UCMGUI.formSerializeVal(doc);

            action['action'] = 'updateWebRTCCloudServiceSettings';

            save_changes(action);
        }
    });
}

function save_changes(action) {
    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                sync_cloud_service();
            }

            getWebRTCCloudServiceSettings();
        }
    });
}

function sync_cloud_service() {
    $.ajax({
        url: "../cgi?action=fetchWebRTCCloudServiceSettings&retCode=result",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (data.response.retCode.length == 5) {
                    var errMessage = "";

                    switch (data.response.retCode) {
                        case "10001":
                            errMessage = $P.lang("LANG4514");
                            break;
                        case "10003":
                            errMessage = $P.lang("LANG4515");
                            break;
                        case "10004":
                            errMessage = $P.lang("LANG4516");
                            break;
                        case "10005":
                            errMessage = $P.lang("LANG4517");
                            break;
                        case "10007":
                            errMessage = $P.lang("LANG4518");
                            break;
                        case "10008":
                            errMessage = $P.lang("LANG4519");
                            break;
                        case "20000":
                            errMessage = $P.lang("LANG4520");
                            break;
                        case "20001":
                            errMessage = $P.lang("LANG4521");
                            break;
                        case "20002":
                            errMessage = $P.lang("LANG4522");
                            break;
                    }

                    top.dialog.clearDialog();
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: errMessage
                    });
                } else {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG4531"),
                        buttons: {
                            ok: function() {
                                top.dialog.clearDialog();
                            },
                            cancel: function() {}
                        }
                    });
                }
            }
        }
    });
}

function freeTrial() {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG4526"),
        displayPos: "editForm",
        frameSrc: "html/webrtc_cloud_service_modal.html"
    });
}

function changePasswordEmail() {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG4651"),
        displayPos: "editForm",
        frameSrc: "html/webrtc_cloud_service_password.html"
    });
}

function deleteAccount() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG4731"),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG877")
                });

                var DO_DELETE = function() { // DELETE_SELECTED_USERS();
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: {
                            "action": "deleteWebRTCCloudServiceSettings",
                            "retCode": '1'
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
                                    content: $P.lang("LANG4733"),
                                    callback: function() {
                                        getWebRTCCloudServiceSettings();
                                    }
                                });
                            }
                        }
                    });
                };

                setTimeout(DO_DELETE, 100);
            },
            cancel: function() {
                top.dialog.clearDialog();
            }
        }
    });
}

function resetPassword() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG4734"),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG4737")
                });

                var DO_RESET = function() { // DELETE_SELECTED_USERS();
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: {
                            "action": "resetWebRTCCloudServicePW",
                            "retCode": ''
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

                            if (bool && data.response.retCode === 'success') {
                                top.dialog.dialogConfirm({
                                    confirmStr: $P.lang("LANG4735"),
                                    buttons: {
                                        ok: function() {
                                            top.dialog.clearDialog();

                                            getWebRTCCloudServiceSettings();
                                        },
                                        cancel: function() {}
                                    }
                                });
                            } else {
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: $P.lang("LANG4736"),
                                    callback: function() {
                                        getWebRTCCloudServiceSettings();
                                    }
                                });
                            }
                        }
                    });
                };

                setTimeout(DO_RESET, 100);
            },
            cancel: function() {
                top.dialog.clearDialog();
            }
        }
    });
}

function renderCloudAccount() {
    var sAccount = $('#cloud_account').val();

    if (sAccount) {
        $('#snippet').find('span.string').each(function() {
            if ($(this).text() === '"Your Cloud Account"') {
                $(this).text('"' + sAccount + '"');

                return false;
            }
        });
    }
}

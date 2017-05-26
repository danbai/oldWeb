/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2016 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    userName = $P.cookie("username"),
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    ifExisted = UCMGUI.inArray,
    saveAction = 'updateCRMUserSettings',
    CRMSystem = '';

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG5225"));

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: 'enable_crm',
        enableList: ['crm_username', 'crm_password', 'security_token']
    }, doc);

    initValidator();

    getCRMSettings();

    getCRMUserSettings();

    top.Custom.init(doc);
});

function getCRMSettings() {
    var action = {};

    action["action"] = "getCRMSettings";

    $.ajax({
        type: "post",
        url: baseServerURl,
        dataType: "json",
        async: false,
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
                var settings = data.response.crm_settings;

                CRMSystem = settings.crm_module;

                if (CRMSystem === 'salesforce') {
                    $('.salesforce').css({'display': 'block'});
                }
            }
        }
    });
}

function getCRMUserSettings() {
    var action = {};

    action['action'] = 'getCRMUserSettings';
    action['extension'] = userName;

    $.ajax({
        type: "post",
        url: baseServerURl,
        dataType: "json",
        async: false,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var data = eval(data);

            if (data.hasOwnProperty('response') && $.isEmptyObject(data.response)) {
                saveAction = 'addCRMUserSettings';
            } else {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    var settings = data.response.extension,
                        status = settings.login_status,
                        enableCRM = document.getElementById('enable_crm');

                    enableCRM.checked = (settings.enable_crm === 'yes' ? true : false);

                    if (enableCRM.updateStatus) {
                        enableCRM.updateStatus();
                    }

                    UCMGUI.domFunction.updateDocument(settings, doc);

                    if (status === 'login') {
                        $('#crmstatus')
                            .addClass('login').removeClass('logout')
                            .attr({'locale': 'LANG5186'}).text($P.lang('LANG5186'));
                    } else if (status === 'logout') {
                        $('#crmstatus')
                            .addClass('logout').removeClass('login')
                            .attr({'locale': 'LANG5187'}).text($P.lang('LANG5187'));
                    }
                }
            }

            setTimeout(refreshStatus, 3000);
        }
    });
}

function refreshStatus() {
    var action = {};

    action['extension'] = userName;
    action['action'] = 'getCRMUserSettings';
    action["auto-refresh"] = Math.random();

    $.ajax({
        type: "post",
        url: baseServerURl,
        dataType: "json",
        async: false,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var data = eval(data);

            if (data.hasOwnProperty('response') && !$.isEmptyObject(data.response)) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    var settings = data.response.extension,
                        status = settings.login_status;

                    if (status === 'login') {
                        $('#crmstatus')
                            .addClass('login').removeClass('logout')
                            .attr({'locale': 'LANG5186'}).text($P.lang('LANG5186'));
                    } else if (status === 'logout') {
                        $('#crmstatus')
                            .addClass('logout').removeClass('login')
                            .attr({'locale': 'LANG5187'}).text($P.lang('LANG5187'));
                    }
                }
            }
        }
    });

    setTimeout(refreshStatus, 3000);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "security_token": {
                required: true
            },
            "crm_username": {
                required: true
                // letterDigitUndHyphen: true
            },
            "crm_password": {
                required: true
                // keyboradNoSpacesemicolon: true,
                // minlength: 2
            }
        },
        newValidator: true,
        submitHandler: function(ev) {
            save_changes();
        }
    });
}

function save_changes() {
    var action = {};

    action = UCMGUI.formSerializeVal(doc);

    action['action'] = saveAction;
    action['extension'] = userName;

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
                saveAction = 'updateCRMUserSettings';

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG4764")
                });
            }
        }
    });
}

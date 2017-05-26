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
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    ifExisted = UCMGUI.inArray,
    contactsLookup = [];

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2217"));

    initSettings();

    initValidator();

    getCRMSettings();

    // getCRMStatus();

    top.Custom.init(doc);
});

function checkAddNumber(val, ele) {
    var value = val,
        result = true,
        selectedModules = [];

    $('#rightSelect option').each(function(index) {
        selectedModules.push(this.value);
    });

    if (selectedModules.length && value && !ifExisted(value, selectedModules)) {
        result = false;
    }

    return result;
}

function checkHasHTTP(val, ele) {
    return /^https?:\/\//i.test(val);
}

function initSettings() {
    contactsLookup = {
            list: ['contacts', 'leads', 'accounts'],
            obj: {
                contacts: {
                    locale: 'LANG5116 LANG5117',
                    text: $P.lang('LANG5116').format($P.lang('LANG5117')),
                    val: "contacts"
                },
                leads: {
                    locale: 'LANG5116 LANG5118',
                    text: $P.lang('LANG5116').format($P.lang('LANG5118')),
                    val: "leads"
                },
                accounts: {
                    locale: 'LANG5116 LANG5119',
                    text: $P.lang('LANG5116').format($P.lang('LANG5119')),
                    val: "accounts"
                }
            }
        };

    $('#crm_module').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "sugarcrm") {
            $(".salesforce").hide();
            $(".sugarcrm, .null").show();
        } else if (value == "salesforce") {
            $(".sugarcrm").hide();
            $(".salesforce, .null").show();
        } else {
            $(".sugarcrm, .salesforce, .null").hide();
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    selectbox.electedSelect({
        rightSelect: "rightSelect",
        leftSelect: "leftSelect",
        allToRight: "allToRight",
        oneToRight: "oneToRight",
        oneToLeft: "oneToLeft",
        allToLeft: "allToLeft",
        top: "button_top",
        up: "button_up",
        down: "button_down",
        bottom: "button_bottom",
        isSort: false,
        cb: function() {
            $P("#rightSelect", doc).valid();
        }
    }, doc);
}

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

                $('#crm_module').val(settings.crm_module).trigger('change');

                UCMGUI.domFunction.updateDocument(settings, doc);

                var leftSelect = [],
                    rightSelect = [],
                    selectOptions = [];

                if (settings.first_search) {
                    selectOptions.push(settings.first_search);
                    rightSelect.push(contactsLookup.obj[settings.first_search]);
                }

                if (settings.second_search) {
                    selectOptions.push(settings.second_search);
                    rightSelect.push(contactsLookup.obj[settings.second_search]);
                }

                if (settings.third_search) {
                    selectOptions.push(settings.third_search);
                    rightSelect.push(contactsLookup.obj[settings.third_search]);
                }
                
                for (var i = 0, length = contactsLookup.list.length; i < length; i++) {
                    if (!ifExisted(contactsLookup.list[i], selectOptions)) {
                        leftSelect.push(contactsLookup.obj[contactsLookup.list[i]]);
                    }
                }

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftSelect
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightSelect
                }, doc);
            }
        }
    });
}

function getCRMStatus() {
    var action = {};

    action["action"] = "getCRMStatus";
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
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var status = data.response.crm_status;

                status = status.login_status;

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
    });

    setTimeout(getCRMStatus, 3000);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "crm_addr": {
                required: true,
                host: ['IP or URL'],
                customCallback: [$P.lang("LANG5201"), checkHasHTTP]
            },
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
            },
            "number_add": {
                required: true,
                customCallback: [$P.lang("LANG5157"), checkAddNumber]
            },
            "rightSelect": {
                selectItemMin: 1
            }
        },
        newValidator: true,
        submitHandler: function(ev) {
            save_changes();
        }
    });
}

function save_changes() {
    var action = {},
        selectOptions = $('#rightSelect option');

    action = UCMGUI.formSerializeVal(doc);

    action["action"] = 'updateCRMSettings';
    action["first_search"] = '';
    action["second_search"] = '';
    action["third_search"] = '';

    if (selectOptions[0]) {
        action["first_search"] = selectOptions[0].value;
    }

    if (selectOptions[1]) {
        action["second_search"] = selectOptions[1].value;
    }

    if (selectOptions[2]) {
        action["third_search"] = selectOptions[2].value;
    }

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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG4764")
                });
            }
        }
    });
}

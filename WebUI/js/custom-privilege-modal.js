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
    gup = UCMGUI.gup,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    mode = gup.call(window, "mode"),
    oldPrivilegeID = gup.call(window, "id"),
    oldPrivilegeName = gup.call(window, "name"),
    existIDs = mWindow.existIDs,
    existNames = mWindow.existNames,
    modulesObj = mWindow.modulesObj,
    modulesList = mWindow.modulesList;

Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.sortBy = top.Array.prototype.sortBy;
Array.prototype.lastValue = top.Array.prototype.lastValue;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;
String.prototype.withOut = top.String.prototype.withOut;

$(function() {
    initForm();

    $P.lang(doc, true);

    initValidator();

    if (mode === 'edit') {
        getCustomPrivilege(oldPrivilegeID);
    }

    top.Custom.init(doc);
});

function checkIfDefaultNames(val, ele) {
    var name = val.toLowerCase(),
        defaultNames = ['admin', 'operator', 'monitor', 'consumer'];

    return !UCMGUI.inArray(name, defaultNames);
}

function getCustomPrivilege(index) {
    var action = {
        "action": "getCustomPrivilege",
        "privilege_id": index
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
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
                var settings = data.response.privilege_id,
                    moduleSettings = data.response.module_switch,
                    enableModules = (moduleSettings.enable_module ? moduleSettings.enable_module : ''),
                    disableModules = (moduleSettings.disable_module ? moduleSettings.disable_module : ''),
                    leftSelect = [],
                    rightSelect = [];

                enableModules = enableModules.split(',');
                disableModules = disableModules.split(',');

                $('#privilege_name').val(oldPrivilegeName);

                if (oldPrivilegeID === '3') {
                    $('#en_rm_voice_recording')[0].checked = (settings.en_rm_voice_recording === 'yes' ? true: false);
                }

                for (var i = 0, length = enableModules.length; i < length; i++) {
                    if (enableModules[i]) {
                        rightSelect.push(modulesObj[enableModules[i]]);
                    }
                }

                for (var i = 0, length = disableModules.length; i < length; i++) {
                    if (disableModules[i]) {
                        leftSelect.push(modulesObj[disableModules[i]]);
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

function getPrivilegeID() {
    var id;

    for (var i = 4; i < 10; i++) {
        if (!UCMGUI.inArray(i, existIDs)) {
            id = i;
            break;
        }
    }

    return id;
}

function initForm() {
    selectbox.electedSelect({
        rightSelect: "rightSelect",
        leftSelect: "leftSelect",
        allToRight: "allToRight",
        oneToRight: "oneToRight",
        oneToLeft: "oneToLeft",
        allToLeft: "allToLeft",
        isSort: false,
        cb: function() {
            $P("#rightSelect", doc).valid();
        }
    }, doc);

    selectbox.appendOpts({
        el: "leftSelect",
        opts: modulesList.sort(UCMGUI.bySort("val", "down"))
    }, doc);

    if (mode === 'edit') {
        if (oldPrivilegeID === '3') {
            $('.modules').hide();
            $('#privilege_name').attr({'disabled': 'disabled'});
        } else {
            $('.general-user').hide();
        }
    } else {
        $('.general-user').hide();
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "privilege_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                customCallback1: [$P.lang("LANG5174"), checkIfDefaultNames],
                customCallback2: [$P.lang("LANG2137"), privilegeNameIsExist]
            },
            "rightSelect": {
                selectItemMin: 1
            }
        },
        submitHandler: function() {
            saveCustomPrivilege();
        }
    });
}

function privilegeNameIsExist(val, ele) {
    var name = val,
        tmpNameList = [];

    tmpNameList = existNames.copy(tmpNameList);

    if (oldPrivilegeName) {
        tmpNameList.remove(oldPrivilegeName);
    }

    return !UCMGUI.inArray(name, tmpNameList);
}

function saveCustomPrivilege() {
    var action = {},
        enableModules = [],
        disableModules = [];

    if (mode == "edit") {
        action["action"] = "updateCustomPrivilege";
        action["privilege_id"] = oldPrivilegeID;
    } else if (mode == "add") {
        action["action"] = "addCustomPrivilege";
        action["privilege_id"] = getPrivilegeID();
    }

    if (oldPrivilegeID === '3') {
        action["en_rm_voice_recording"] = $('#en_rm_voice_recording').is(':checked') ? 'yes' : 'no';
    } else {
        action["privilege_name"] = $('#privilege_name').val();

        $('#rightSelect option').each(function(index) {
            enableModules.push(this.value);
        });

        $('#leftSelect option').each(function(index) {
            disableModules.push(this.value);
        });

        action["enable_module"] = enableModules.join();
        action["disable_module"] = disableModules.join();
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
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
                top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        // refresh lists
                        mWindow.getLists();

                        mWindow.createTable();
                    }
                });
            }
        }
    });
}
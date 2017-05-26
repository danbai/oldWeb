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
    mode = gup.call(window, "mode"),
    type = gup.call(window, "type"),
    oldId = gup.call(window, "id"),
    oldName = gup.call(window, "name"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    existMiniBarCodes = mWindow.existMiniBarCodes,
    existMiniBarNames = mWindow.existMiniBarNames,
    existMiniBarMaidCodes = mWindow.existMiniBarMaidCodes,
    existMiniBarGoodsCodes = mWindow.existMiniBarGoodsCodes,
    existMiniBarGoodsNames = mWindow.existMiniBarGoodsNames;

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
    $P.lang(doc, true);

    initForm();

    initValidator();

    if (mode === 'edit') {
        getSettings(oldId);
    }

    top.Custom.init(doc);
});

function codeIsExist(element) {
    var code = element.value,
        tmpCodeList = [];

    if (type === 'minibar') {
        tmpCodeList = existMiniBarCodes.copy(tmpCodeList);
    } else if (type === 'maid') {
        tmpCodeList = existMiniBarMaidCodes.copy(tmpCodeList);
    } else {
        tmpCodeList = existMiniBarGoodsCodes.copy(tmpCodeList);
    }

    // if (oldCode) {
    //     tmpCodeList.remove(oldCode);
    // }

    return !UCMGUI.inArray(code, tmpCodeList);
}

function extensionIsExist(value, element) {
    if (type === 'minibar') {
        var extension = value,
            numberList = mWindow.numberList,
            tmpNumberList = [];

        tmpNumberList = numberList.copy(tmpNumberList);

        // if (oldExtension) {
        //     tmpNumberList.remove(oldExtension);
        // }

        return !UCMGUI.inArray(extension, tmpNumberList);
    } else {
        return true;
    }
}

function nameIsExist(element) {
    var name = element.value,
        tmpNameList = [];

    if (type === 'minibar') {
        tmpNameList = existMiniBarNames.copy(tmpNameList);
    } else {
        tmpNameList = existMiniBarGoodsNames.copy(tmpNameList);
    }

    if (oldName) {
        tmpNameList.remove(oldName);
    }

    return !UCMGUI.inArray(name, tmpNameList);
}

function getSettings(index) {
    var action;

    if (type === 'minibar') {
        action = {
            "action": "getMiniBar",
            "extension": index
        };
    } else if (type === 'maid') {
        action = {
            "action": "getMiniBarWaiter",
            "waiter_id": index
        };
    } else {
        action = {
            "action": "getMiniBarGoods",
            "extension": index
        };
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
                var settings = ((type === 'maid') ? data.response.waiter_id : data.response.extension);

                $('.params').not('#' + type).remove();

                $('#' + type + ' input:first').attr({'disabled': true});

                UCMGUI.domFunction.updateDocument(settings, doc);
            }
        }
    });
}

function initForm() {
    $('#' + type).css({'display': 'block'});

    $('.params').not('#' + type).remove();

    if (type === 'minibar') {
        selectbox.appendOpts({
            el: "prompt",
            opts: mWindow.ivrNameArr
        }, doc);
    } else if (type === 'goods') {
        selectbox.appendOpts({
            el: "prompt_success",
            opts: mWindow.ivrNameArr
        }, doc);

        selectbox.appendOpts({
            el: "prompt_error",
            opts: mWindow.ivrNameArr
        }, doc);
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "extension": {
                required: true,
                digits: true,
                minlength: 2,
                customCallback: [$P.lang("LANG2126"), extensionIsExist],
                isExist: [$P.lang("LANG270").format($P.lang("LANG4341").toLowerCase()), codeIsExist]
            },
            "waiter_id": {
                required: true,
                digits: true,
                minlength: 2,
                isExist: [$P.lang("LANG270").format($P.lang("LANG4963").toLowerCase()), codeIsExist]
            },
            "minibar_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG270").format($P.lang("LANG135").toLowerCase()), nameIsExist]
            },
            "goods_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG270").format($P.lang("LANG135").toLowerCase()), nameIsExist]
            },
            "secret": {
                required: true,
                digits: true,
                minlength: 2
            },
            "prompt": {
                required: true
            },
            "prompt_success": {
                required: true
            },
            "prompt_error": {
                required: true
            }
        },
        submitHandler: function() {
            saveSettings();
        }
    });
}

function link_prompt() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG843").format($P.lang("LANG238")),
        buttons: {
            ok: function() {
                top.frames["frameContainer"].module.jumpMenu('menuprompts_record.html');
            },
            cancel: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        }
    });
}

function saveSettings() {
    var action = {},
        suffix = '';

    action = UCMGUI.formSerializeVal(doc, undefined, undefined, true); // Get Disabled Value.

    if (type === 'maid') {
        suffix = 'Waiter';
    } else if (type === 'goods') {
        suffix = 'Goods';
    }

    if (mode === 'add') {
        action.action = 'addMiniBar' + suffix;
    } else {
        action.action = 'updateMiniBar' + suffix;
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
                        mWindow.$("#" + type + "-list", mWindow.document).trigger('reloadGrid');

                        // refresh lists
                        mWindow.getLists();
                    }
                });
            }
        }
    });
}
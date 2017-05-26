/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    setDefaultsWhenCreate = UCMGUI.setDefaultsWhenCreate,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = gup.call(window, "mode"),
    oldDisaName = "",
    disaId = "",
    extensionPrefSettings = UCMGUI.isExist.getRange(); // [disable_extension_ranges, rand_password, weak_password]

var isEnableWeakPw = function() {
    if (extensionPrefSettings[2] == 'yes') { // weak_password
        $P("#password", document).rules("add", {
            checkNumericPw: [
                UCMGUI.enableWeakPw.showCheckPassword, {
                    type: "digital",
                    pwsId: "#password",
                    doc: document
                }
            ]
        });
    }
};

Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    if (mode == 'edit') {
        disaId = gup.call(window, "disaId");
        getDisaInfo(disaId);
    } else {
        // prepareAddItemForm();
        setDefaultsWhenCreate(doc);
        top.Custom.init(doc);
    }

    initValidator();
    isEnableWeakPw();
});

// function prepareAddItemForm() {

// }

function disaNameIsExist() {
    var displayName = $("#display_name").val();
    var disaNameList = mWindow.disaNameList;
    var tmpDisaNameList = [];
    tmpDisaNameList = disaNameList.copy(tmpDisaNameList);
    if (oldDisaName) {
        tmpDisaNameList.remove(oldDisaName);
    }
    return !UCMGUI.inArray(displayName, tmpDisaNameList);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }
    $P("#form", doc).validate({
        rules: {
            "display_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG2137"), disaNameIsExist],
            },
            "password": {
                required: true,
                digits: true,
                minlength: 4
            },
            "response_timeout": {
                required: true,
                digits: true,
                range: [3, 180]
            },
            "digit_timeout": {
                required: true,
                digits: true,
                range: [1, 10]
            },
            "callerid": {
                digits: true,
                minlength: 2
            }
        },
        submitHandler: function() {
            var action = {};
            action = UCMGUI.formSerializeVal(document);
            if (mode == "edit") {
                action["disa"] = disaId;
            }
            action["action"] = (mode == 'edit' ? "updateDISA" : "addDISA");
            updateOrAddDisaInfo(action);
        }
    });
}

function updateOrAddDisaInfo(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });
            if (bool) {
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#disa-list", mWindow.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

function getDisaInfo(ext) {
    var action = {
        "action": "getDISA",
        "disa": ext
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
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
                var disa = data.response.disa;
                oldDisaName = disa.display_name;
                UCMGUI.domFunction.updateDocument(disa, document);
                mWindow.getNameList();
                top.Custom.init(doc);
            }
        }
    });
}

function transData(res, cb) {
    var arr = [];
    for (var i = 0; i < res.length; i++) {
        var obj = {};
        obj["val"] = res[i];
        arr.push(obj);
    }
    if (cb && typeof cb == "function") {
        cb(arr);
    }
    return arr;
}
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
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = gup.call(window, "mode"),
    oldFaxName = "",
    oldFaxExtension = "",
    portExtensionList = mWindow.portExtensionList,
    startExt = mWindow.extensionRange[0],
    endExt = mWindow.extensionRange[1],
    disableRange = mWindow.extensionRange[2];

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    if (mode == 'edit') {
        extension = gup.call(window, "extension");

        $("#extension").attr("disabled", true);

        getFaxInfo(extension);
    } else {
        // prepareAddItemForm();
        $("#extension").val(generateNewExt());

        top.Custom.init(doc);
    }

    initValidator();

    $('#save').bind('click', function() {
        askExtensionRange($("#extension").val(), startExt, endExt, disableRange);
    });
});

function faxExtIsExist() {
    var extension = $("#extension").val(),
        numberList = mWindow.numberList,
        tmpFaxExtList = [];

    tmpFaxExtList = numberList.copy(tmpFaxExtList);

    if (oldFaxExtension) {
        numberList.remove(oldFaxExtension);
    }

    return !UCMGUI.inArray(extension, numberList);
}

function faxNameIsExist() {
    var name = $("#fax_name").val(),
        faxNameList = mWindow.faxNameList,
        tmpFaxNameList = [];

    tmpFaxNameList = faxNameList.copy(tmpFaxNameList);

    if (oldFaxName) {
        tmpFaxNameList.remove(oldFaxName);
    }

    return !UCMGUI.inArray(name, tmpFaxNameList);
}

function checkIfInPort(val, ele) {
    var existed = true;

    if (UCMGUI.inArray(val, portExtensionList)) {
        existed = false;
    } else {
        existed = true;
    }

    return existed;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "extension": {
                required: true,
                digits: true,
                isExist: [$P.lang("LANG2126"), faxExtIsExist],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "fax_name": {
                minlength: 2,
                required: true,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG2137"), faxNameIsExist]
            },
            "email": {
                required: true,
                serveremail: true
            }
        },
        submitHandler: function() {
            var action = {};

            action = UCMGUI.formSerializeVal(document);

            if (mode == "edit") {
                action["fax"] = $("#extension").val();
            }

            action["action"] = (mode == 'edit' ? "updateFax" : "addFax");

            updateOrAddFaxInfo(action);
        }
    });

    if (disableRange == "no") {
        $P("#extension", document).rules("add", {
            range: [startExt, endExt]
        });
    }
}

function updateOrAddFaxInfo(action) {
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
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                top.dialog.clearDialog();

                mWindow.$("#fax_list", mWindow.document).trigger('reloadGrid');

                mWindow.getNameList();
            }
        }
    });
}

function getFaxInfo(ext) {
    var action = {
        "action": "getFax",
        "fax": ext
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
                var fax = data.response.fax;

                oldFaxExtension = fax.extension;
                oldFaxName = fax["fax_name"];

                UCMGUI.domFunction.updateDocument(fax, document);

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

function generateNewExt() {
    var i = startExt;

    for (i; i <= endExt; i++) {
        if ($.inArray(i.toString(), mWindow.numberList) == -1) {
            return i;
        }
    }
}
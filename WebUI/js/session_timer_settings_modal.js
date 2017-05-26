/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    loginWhiteAddrList = mWindow.loginWhiteAddrList;

    String.prototype.format = top.String.prototype.format,
    Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);
    initValidator();
});

function IPIsExist(ele) {
    if(loginWhiteAddrList.indexOf($("#ip").val()) != -1) {
        return false;
    }
    return true;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }
    $P("#form", doc).validate({
        rules: {
            "ip": {
                required: true,
                ipDnsSpecial: ["IP"],
                isExist: [$P.lang("LANG270").format($P.lang("LANG1291")), IPIsExist]
            }
        },
        submitHandler: function() {
            var action = {};
            action = UCMGUI.formSerializeVal(document);
            action["action"] = "addLoginWhiteAddr";
            addLoginWhiteAddr(action);
        }
    });
}

function addLoginWhiteAddr(action) {
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
                    content: $P.lang("LANG844"),
                    callback: function() {
                        mWindow.$("#login-white-list-list", mWindow.document).trigger('reloadGrid');
                        mWindow.getIPList();
                    }
                });
            }
        }
    });
}
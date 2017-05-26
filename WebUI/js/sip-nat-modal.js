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
    mode = gup.call(window, "mode"),
    rowid,
    localnetaddr,
    localnetlen,
    aLocalNet = [];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    if (mode === 'edit') {
        rowid = gup.call(window, "rowid");
        localnetaddr = gup.call(window, "localnetaddr");
        localnetlen = gup.call(window, "localnetlen");
        $('#localnetaddr').val(localnetaddr);
        $('#localnetlen').val(localnetlen);
    }

    top.Custom.init(doc);

    getLocalNet();

    initValidator();
});

function getLocalNet() {
    $.ajax({
        type: "GET",
        url: "../cgi?action=listSipNetAddrSettings",
        error: function(jqXHR, textStatus, errorThrown) {
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                aLocalNet = data.response.sip_nat_addr;
            }
        }
    });
}

function checkIsExsit(val, ele) {
    var newLocalnetlen = parseInt($('#localnetlen').val(), 10),
        oLocal;

    for (var i = 0; i < aLocalNet.length; i++) {
        oLocal = aLocalNet[i];

        if (mode === 'edit' && rowid === oLocal.rowid) {
            continue;
        } 

        if (val === oLocal.localnetaddr && newLocalnetlen === oLocal.localnetlen) {
            return false;
        }
    }

    return true;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }
    $P("#form", doc).validate({
        rules: {
            "localnetaddr": {
                required: true,
                ipAddressWithoutIpv6: true,
                customCallback: [$P.lang("LANG270").format($P.lang("LANG1845")), checkIsExsit]
            }
        },
        submitHandler: function() {
            var action = UCMGUI.formSerializeVal(document);

            if (mode === "edit") {
                action["rowid"] = rowid;
            }

            action["action"] = (mode === 'edit' ? "updateSipNetAddrSettings" : "addSipNetAddrSettings");

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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#sip_list", mWindow.document).trigger('reloadGrid');
                    }
                });
            }
        }
    });
}
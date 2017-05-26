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
    port = null,
    address = null,
    addressV6 = null,
    selectbox = UCMGUI.domFunction.selectbox;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG678"));
    
    getMohNameList();
    getIAXGenSettings();
    initValidator();
});

function getMohNameList() {
    var mohName = UCMGUI.isExist.getList("getMohNameList");
    var mohNameList = transData(mohName);
    selectbox.appendOpts({
        el: "mohinterpret",
        opts: mohNameList
    }, doc);

    selectbox.appendOpts({
        el: "mohsuggest",
        opts: mohNameList 
    }, doc);
}

function getIAXGenSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getIAXGenSettings"
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var iaxGeneralSettings = data.response.iax_general_settings;
                UCMGUI.domFunction.updateDocument(iaxGeneralSettings, doc);
            }

            $("#mohinterpret").val(data.response.iax_general_settings.mohinterpret);
            $("#mohsuggest").val(data.response.iax_general_settings.mohsuggest);

            port = data.response.iax_general_settings.bindport,
            address = data.response.iax_general_settings.bindaddr,
            addressV6 = data.response.iax_general_settings.bindaddr6,
            top.Custom.init(doc);
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }
    $P("#form", document).validate({
        rules: {
            "bindport": {
                digits: true,
                range: [1, 65535]
            },
            "bindaddr": {
                ipAddress: true
            },
            "bindaddr6": {
                ipv6: true
            },
            "language": {
                lettersonly: true
            },
            "bandwidth": {
                required: true
            }
        },
        submitHandler: function() {
            updateIAXGenSettings();
        },
    });
}

function updateIAXGenSettings() {
    var action = {};
    action = UCMGUI.formSerializeVal(doc);
    action["mohinterpret"] = $("#mohinterpret").val();
    action["mohsuggest"] = $("#mohsuggest").val();
    action["action"] = "updateIAXGenSettings";

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
                var domPortVal = $("#bindport").val(),
                    domAddrVal = $("#bindaddr").val();
                    domAddrV6Val = $("#bindaddr6").val();

                if (domPortVal && (port != domPortVal || address != domAddrVal || addressV6 != domAddrV6Val)) {
                    setTimeout(function() {
                        top.dialog.dialogConfirm({
                            confirmStr: $P.lang("LANG927"),
                            buttons: {
                                ok: UCMGUI.loginFunction.confirmReboot,
                                cancel: function() {
                                    port = $("#bindport").val();
                                    address = $("#bindaddr").val();
                                    addressV6 = $("#bindaddr6").val();
                                }
                            }
                        });
                    }, 1000);
                }

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });
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
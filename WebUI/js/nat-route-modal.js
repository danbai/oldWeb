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
    oldID = gup.call(window, "id"),
    oldWANPort = gup.call(window, "wanport"),
    existWanPort = [];

Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    initValidator();

    existWanPort = mWindow.existWanPort.copy(existWanPort);

    if (mode === 'edit') {
        if (oldWANPort.indexOf("-") === -1) {
            existWanPort.remove(oldWANPort);
        } else {
            var aRange = oldWANPort.split("-"),
                nStart = parseInt(aRange[0]),
                nStop = parseInt(aRange[1]);

            for (var j = nStart; j <= nStop; j++) {
                existWanPort.remove(j.toString());
            }
        }

        getPortForwarding(oldID);
    }

    top.Custom.init(doc);
});

function checkWanAndLanFormat(val, ele) {

    var rWanLan = /^\d+(\-\d+)?$/;

    if (!rWanLan.test(val)) {
        return false;
    }

    if (val.indexOf("-") === -1) {
        if (ele.id.indexOf("lan") > -1) {
            if (parseInt(val) < 1 || parseInt(val) > 65535) {
                return false;
            }
        } else {
            if (parseInt(val) < 1025 || parseInt(val) > 65534) {
                return false;
            }
        }
    } else if (val.indexOf("-") > -1) {
        var aRange = val.split("-"),
            nStart = parseInt(aRange[0]),
            nStop = parseInt(aRange[1]);

        if (nStart > nStop || nStart < 1025 || nStop > 65534) {
            return false;
        }
    }

    return true;
}

function checkWanAndLanRange(val, ele) {

    var nLanVal = $(ele).closest(".wan_lan_wrap").siblings(".wan_lan_wrap").find("input").val();

    if (!val || !nLanVal) {
        return true;
    }

    if (val.indexOf("-") === -1 && nLanVal.indexOf("-") === -1) {
        return true;
    } else if (val.indexOf("-") > -1 && nLanVal.indexOf("-") > -1) {
        if (val === nLanVal) {
            return true;
        }
    }

    return false;
}

function checkWanConflict(val, ele) {
    var noConflict = true;

    $.each(existWanPort, function(item, value) {
        var nOtherVal = value;

        if (val.indexOf("-") === -1) {
            if (val === nOtherVal) {
                noConflict = false;
                return false;
            }
        } else {
            var aRange = val.split("-"),
                nStart = parseInt(aRange[0]),
                nStop = parseInt(aRange[1]);

            if (nOtherVal >= nStart && nOtherVal <= nStop) {
                noConflict = false;
                return false;
            }
        }
    });

    return noConflict;
}

function getPortForwarding(index) {
    var action = {
        "action": "getPortForwarding",
        "id": index
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
                var forwardingData = data.response.id,
                    lanPort = forwardingData.lan_port,
                    wanPort = forwardingData.wan_port;

                forwardingData.lan_port = (lanPort && lanPort !== '0') ? lanPort : '';
                forwardingData.wan_port = (wanPort && wanPort !== '0') ? wanPort : '';

                UCMGUI.domFunction.updateDocument(forwardingData, doc);
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "wan_port": {
                required: true,
                customCallback1: [$P.lang("LANG4080"), checkWanAndLanFormat],
                customCallback2: [$P.lang("LANG4081"), checkWanAndLanRange],
                customCallback3: [$P.lang("LANG4124"), checkWanConflict]
            },
            "lan_ip": {
                required: true,
                ipv4Address: true
            },
            "lan_port": {
                required: true,
                customCallback1: [$P.lang("LANG4080"), checkWanAndLanFormat],
                customCallback2: [$P.lang("LANG4081"), checkWanAndLanRange]
            }
        },
        submitHandler: function() {
            var wan_port = $('#wan_port').val(),
                ports = mWindow.ports,
                aConflict = [];

            if (wan_port.indexOf("-") === -1) {
                if (ports.indexOf(wan_port) > -1 && aConflict.indexOf(wan_port) === -1) {
                    aConflict.push(wan_port);
                }
            } else {
                var aRange = wan_port.split("-"),
                    nStart = parseInt(aRange[0]),
                    nStop = parseInt(aRange[1]);

                for (var j = nStart; j <= nStop; j++) {
                    if (ports.indexOf(j.toString()) > -1 && aConflict.indexOf(j.toString()) === -1) {
                        aConflict.push(j);
                    }
                }
            }

            if (aConflict.length !== 0) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG4134").format(aConflict.join(",")),
                    buttons: {
                        ok: function() {
                            savePortForwarding();
                        },
                        cancel: function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        }
                    }
                });
            } else {
                savePortForwarding();
            }
        }
    });
}

function savePortForwarding() {
    var action = {
        wan_port: $('#wan_port').val(),
        lan_ip: $('#lan_ip').val(),
        lan_port: $('#lan_port').val(),
        protocol: $('#protocol').val()
    };

    //action = UCMGUI.formSerializeVal(doc);

    if (mode == "edit") {
        action["action"] = "updatePortForwarding";
        action["id"] = oldID;
    } else if (mode == "add") {
        action["action"] = "addPortForwarding";
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

                var callback = function() {
                    mWindow.$("#portforwarding_list", mWindow.document).trigger('reloadGrid');

                    // refresh ports
                    mWindow.getLists();
                };

                if (mWindow.flags == 1) {
                    $.ajax({
                        type: "GET",
                        url: "../cgi?action=reloadIptNatroute&old_ip",
                        dataType: "json",
                        async: false,
                        error: function(jqXHR, textStatus, errorThrown) {
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
                                    content: $P.lang("LANG815"),
                                    callback: callback
                                });

                                mWindow.flags = 0;
                            }
                        }
                    });
                } else {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG815"),
                        callback: callback
                    });
                }
            }
        }
    });
}
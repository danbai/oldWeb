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
    portRangeMin = 250;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG676"));

    getRTPSettings();

    initValidator();
});

function getRTPSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getRTPSettings"
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
                var rtpSettings = data.response.rtp_settings;
                UCMGUI.domFunction.updateDocument(rtpSettings, document);
            }

            top.Custom.init(doc);
        }
    });
}

function updateRTPSettings() {
    var action = {};

    action = UCMGUI.formSerializeVal(doc);
    action["action"] = "updateRTPSettings";

    var turnaddr = action["turnaddr"];
    if (UCMGUI.isIPv6NoPort(turnaddr)) {
        action["turnaddr"] = "[" + turnaddr + "]";
    }

    var stunaddr = action["stunaddr"];
    if (UCMGUI.isIPv6NoPort(stunaddr)) {
        action["stunaddr"] = "[" + stunaddr + "]";
    }

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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });
            }
        }
    });
}

function rtpValidPortRange(value, element) {
    if (!value) {
        return true;
    }

    var start = $('#rtpstart').val();
    var end = $('#rtpend').val();

    if (start && end) {
        var range = parseInt(end, 10) - parseInt(start, 10);

        if (range < portRangeMin) {
            return false;
        }
    }

    return true;
}

function bfcpValidPortRange(value, element) {
    if (!value) {
        return true;
    }

    var bfcpstart = $('#bfcpstart').val();
    var bfcpend = $('#bfcpend').val();

    if (bfcpstart && bfcpend) {
        var range = parseInt(bfcpend, 10) - parseInt(bfcpstart, 10);

        if (range < portRangeMin) {
            return false;
        }
    }

    return true;
}

function bfcpTcpValidPortRange(value, element) {
    if (!value) {
        return true;
    }

    var bfcp_tcp_start = $('#bfcp_tcp_start').val();
    var bfcp_tcp_end = $('#bfcp_tcp_end').val();

    if (bfcp_tcp_start && bfcp_tcp_end) {
        var range = parseInt(bfcp_tcp_end, 10) - parseInt(bfcp_tcp_start, 10);

        if (range < portRangeMin) {
            return false;
        }
    }

    return true;
}

function initValidator() {
    var strArr = [$P.lang('LANG1616'), $P.lang('LANG1618'), $("input[name='rtpstart']")];
    var bfcpstrArr = [$P.lang('LANG4739'), $P.lang('LANG4738'), $("input[name='bfcpstart']")];
    var bfcptcpstrArr = [$P.lang('LANG4741'), $P.lang('LANG4740'), $("input[name='bfcp_tcp_start']")];

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        errorClass: "validate-error",
        errorElement: "div",
        rules: {
            "rtpstart": {
                required: true,
                digits: true,
                range: [1024, 65535],
                customCallback: [$P.lang('LANG2388').format($P.lang('LANG1616'), $P.lang('LANG1618'), portRangeMin), rtpValidPortRange]

            },
            "rtpend": {
                required: true,
                digits: true,
                range: [1024, 65535],
                bigger: strArr,
                customCallback: [$P.lang('LANG2388').format($P.lang('LANG1616'), $P.lang('LANG1618'), portRangeMin), rtpValidPortRange]
            },
            "stunaddr": {
                host: ['domain']
            },
            "turnaddr": {
                host: ['domain']
            },
            "bfcpstart": {
                required: true,
                digits: true,
                range: [1024, 65535],
                customCallback: [$P.lang('LANG2388').format($P.lang('LANG4739'), $P.lang('LANG4738'), portRangeMin), bfcpValidPortRange]

            },
            "bfcpend": {
                required: true,
                digits: true,
                range: [1024, 65535],
                bigger: bfcpstrArr,
                customCallback: [$P.lang('LANG2388').format($P.lang('LANG4739'), $P.lang('LANG4738'), portRangeMin), bfcpValidPortRange]
            },
            "bfcp_tcp_start": {
                required: true,
                digits: true,
                range: [1024, 65535],
                customCallback: [$P.lang('LANG2388').format($P.lang('LANG4741'), $P.lang('LANG4740'), portRangeMin), bfcpTcpValidPortRange]

            },
            "bfcp_tcp_end": {
                required: true,
                digits: true,
                range: [1024, 65535],
                bigger: bfcptcpstrArr,
                customCallback: [$P.lang('LANG2388').format($P.lang('LANG4741'), $P.lang('LANG4740'), portRangeMin), bfcpTcpValidPortRange]
            }
        },
        newValidator: true,
        submitHandler: function() {
            updateRTPSettings();
        }
    });
}

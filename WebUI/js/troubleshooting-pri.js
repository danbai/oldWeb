/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    eventFlag = true;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2788"));

    $("button#btnStart").button({
        icons: {
            primary: "ui-icon-play"
        },
        disabled: true
    });

    $("button#btnStop").button({
        icons: {
            primary: "ui-icon-stop"
        },
        disabled: true
    });

    $("button#btnDownload").button({
        icons: {
            primary: "ui-icon-disk"
        },
        disabled: true
    });

    $("button#btnDelete").button({
        icons: {
            primary: "ui-icon-trash"
        },
        disabled: true
    });

    $.ajax({
        url: "../cgi?",
        type: "POST",
        data: "action=pri_signaling_trace_query&pri_trace_switch=",
        error: checkFailed,
        success: checkReturn
    });

    top.Custom.init(document);
});

$(document).bind("keydown", function(ev) {
    if (ev.which == 13) {
        if (eventFlag && !$("button#btnStart").attr("disabled")) {
            btnStart_click();
        }

        ev.stopPropagation();
        return false;
    };
});

function valOrDefault(val, def) {
    return val == undefined || val == null ? def : val;
}

function checkFailed(val) {
    buttonSwitch(false); // assume haven't started 
}

function checkReturn(val) {
    var bool = UCMGUI.errorHandler(val);

    if (bool) {
        var priTraceStatus = val.response.pri_trace_switch.pri_trace_switch;

        if (priTraceStatus) {
            buttonSwitch(true);
            $("div#outputBody").append($("<div />").attr("locale", "LANG1582").html($P.lang("LANG1582")));
        } else {
            buttonSwitch(false);
        }
    }
}

function btnStart_click() {
    eventFlag = false;
    buttonSwitch(true);

    $("button#btnDownload").button("option", "disabled", true);

    $("button#btnDelete").button("option", "disabled", true);

    $("div#outputBody").empty();

    $.ajax({
        url: "../cgi?action=pri_signaling_trace&control=start",
        type: "GET",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown,
                callback: function() {
                    buttonSwitch(false, false);
                }
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                buttonSwitch(false, false);
            });

            if (bool) {
                $("div#outputBody").append($("<div />").attr("locale", "LANG1582").html($P.lang("LANG1582")));
            }
        }
    });
}

function btnStop_click() {
    top.dialog.dialogMessage({
        type: "loading",
        content: $P.lang("LANG3247")
    });
    eventFlag = true;

    $("button#btnDownload").button("option", "disabled", true);

    $("button#btnDelete").button("option", "disabled", true);

    $.ajax({
        url: "../cgi?action=pri_signaling_trace&control=stop",
        type: "GET",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                setTimeout(function() {
                    top.dialog.clearDialog();
                    buttonSwitch(false);
                }, 500);
            }
        }
    });
}

function btnDownload_click() {
    window.open("../cgi?action=downloadFile&type=pri_signaling_trace", '_self');
}

function btnDelete_click() {
    $.ajax({
        url: "../cgi?action=removeFile&type=pri_signaling_trace",
        type: "GET",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                buttonSwitch(false);
            }
        }
    });
}

function btnDownload_check_state() {
    $.ajax({
        type: "GET",
        dataType: "json",
        async: false,
        url: "../cgi?action=checkFile&type=pri_signaling_trace",
        success: function(data) {
            if (data && data.hasOwnProperty('status') && data.status == 0) {
                $("button#btnDownload").button("option", "disabled", false);

                $("button#btnDelete").button("option", "disabled", false);

                if (!($('#downloadTips').length)) {
                    $("div#outputBody").append($("<div id='downloadTips' />").attr("locale", "LANG1581").html($P.lang("LANG1581")).css({
                        color: "green"
                    }));
                }
            } else {
                $("button#btnDownload").button("option", "disabled", true);

                $("button#btnDelete").button("option", "disabled", true);

                $("div#outputBody").empty();
            }
        }
    });
}

function buttonSwitch(start) {
    $("button#btnStart").button("option", "disabled", start);

    $("button#btnStop").button("option", "disabled", !start);

    if (!start) {
        btnDownload_check_state();
    }
}
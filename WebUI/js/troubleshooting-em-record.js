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
    eventFlag = true,
    selectbox = UCMGUI.domFunction.selectbox;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4023"));

    loadPortList();

    $('#direction').change(function() {
        var value = $(this).val();

        if (value == 'rs') {
            $('#modeDiv').show();
        } else {
            $('#modeDiv').hide();
        }
    });

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
        type: "POST",
        url: "../cgi?",
        data: "action=em_signaling_trace_query&em_trace_switch=",
        error: checkFailed,
        success: checkReturn
    });

    top.Custom.init(doc);
});

function checkReturn(val) {
    var bool = UCMGUI.errorHandler(val);

    if (bool) {
        var emTraceStatus = val.response.em_trace_switch;

        // TODO : set last filter.

        if (emTraceStatus.em_trace_switch) {
            var ports = emTraceStatus.em_trace_channels,
                direction = emTraceStatus.em_trace_direction,
                mode = emTraceStatus.em_trace_mode;

            if (direction == 'rs') {
                $('#modeDiv').show();
            } else {
                $('#modeDiv').hide();
            }

            $('#direction').val(direction);

            if (mode) {
                $('#mode').val(mode);
            }

            // for (var i = 0; i < ports.length; i++) {
            //     $("." + chkbxClass + "[value=" + ports[i] + "]").attr("checked", true);
            // }
            //$("#ports").val(ports);
            buttonSwitch(true);
        } else if (emTraceStatus.em_trace_stop_finish_flag == 0) {
            $("button#btnStart, button#btnStop, button#btnDownload, button#btnDelete").button("option", "disabled", true);

            $("#direction, #mode").attr("disabled", "disabled");

            top.Custom.init(doc);

            var stopInterval = function() {
                $.ajax({
                    type: "POST",
                    url: "../cgi?",
                    data: "action=em_signaling_trace_query&em_trace_switch=",
                    dataType: "json",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        setTimeout(stopInterval, 1000);
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            var emTraceStatus = data.response.em_trace_switch;

                            if (!emTraceStatus.em_trace_switch && emTraceStatus.em_trace_stop_finish_flag == 0) {
                                if (!($('#stopingTips').length)) {
                                    $("div#outputBody").append($("<div id='stopingTips' />").attr("locale", "LANG3429").html($P.lang("LANG3429")));
                                }

                                setTimeout(stopInterval, 1000);
                            } else if (!emTraceStatus.em_trace_switch && emTraceStatus.em_trace_stop_finish_flag == 1) {
                                clearTimeout(stopInterval);

                                stopInterval = null;

                                buttonSwitch(false);
                            }
                        }
                    }
                });
            };

            stopInterval();
        } else {
            buttonSwitch(false);
        }
    }
}

function loadPortList() {
    $.ajax({
        url: '../cgi',
        type: 'POST',
        async: false,
        data: {
            "action": 'getDigitalHardwareSettings',
            'span_type': ''
        },
        success: function(data) {
            var res = data.response;
            if (res) {
                var ports = 0,
                    optsArr = [],
                    digitalDriverSettings = res.digital_driver_settings;

                if ($.isArray(digitalDriverSettings) && digitalDriverSettings.length != 0) {
                    var spanType = digitalDriverSettings[0]["span_type"].toLowerCase();
                    if (spanType == "e1") {
                        ports = 31;
                    } else {
                        ports = 24;
                    }
                }
                /*for (var i = 1; i <= ports; i++) {
                    optsArr.push({
                        val: i
                    });
                }
                selectbox.appendOpts({
                    el: "ports",
                    opts: optsArr
                }, doc);*/
                $('#ports').val(ports);
            }
        }
    });

}

$(doc).bind("keydown", function(ev) {
    if (ev.which == 13) {
        if (eventFlag && !$("button#btnStart").attr("disabled")) {
            btnStart_click();
        }

        ev.stopPropagation();
        return false;
    };
});

function checkFailed(val) {
    buttonSwitch(false); // assume haven't started 
}

function btnStart_click() {
    eventFlag = false;

    $("button#btnDownload").button("option", "disabled", true);

    $("button#btnDelete").button("option", "disabled", true);

    $("div#outputBody").empty();

    var ports, direct, mode;

    //ports = 28;
    ports = parseInt($('#ports').val(), 10) + 4;

    direct = $('#direction').val();

    if (direct == 'rs') {
        mode = $('#mode').val();
    } else {
        mode = '';
    }

    $.ajax({
        url: "../cgi",
        type: "POST",
        data: {
            'action': 'em_signaling_trace',
            'control': 'start,' + ports + ',' + direct + ',' + mode
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                buttonSwitch(true);
            }
        }
    });
}

function btnStop_click() {
    var stopInterval = function() {
        $.ajax({
            type: "POST",
            url: "../cgi?",
            data: "action=em_signaling_trace_query&em_trace_switch=",
            dataType: "json",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
                setTimeout(stopInterval, 1000);
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    var emTraceStatus = data.response.em_trace_switch;

                    if (!emTraceStatus.em_trace_switch && emTraceStatus.em_trace_stop_finish_flag == 0) {
                        if (!($('#stopingTips').length)) {
                            $("div#outputBody").append($("<div id='stopingTips' />").attr("locale", "LANG3429").html($P.lang("LANG3429")));
                        }

                        setTimeout(stopInterval, 1000);
                    } else if (!emTraceStatus.em_trace_switch && emTraceStatus.em_trace_stop_finish_flag == 1) {
                        clearTimeout(stopInterval);

                        stopInterval = null;

                        buttonSwitch(false);
                    }
                }
            }
        });
    };

    top.dialog.dialogMessage({
        type: "loading",
        content: $P.lang("LANG3247")
    });

    eventFlag = true;

    $("button#btnStop").button("option", "disabled", true);

    $("button#btnDownload").button("option", "disabled", true);

    $("button#btnDelete").button("option", "disabled", true);

    $.ajax({
        url: "../cgi?action=em_signaling_trace&control=stop",
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

                    stopInterval();
                }, 500);
            }
        }
    });
}

function btnDownload_click() {
    window.open("../cgi?action=downloadFile&type=em_signaling_trace", '_self');
}

function btnDelete_click() {
    $.ajax({
        url: "../cgi?action=removeFile&type=em_signaling_trace",
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
        url: "../cgi?action=checkFile&type=em_signaling_trace",
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

                if (!($('#deletedTips').length)) {
                    $("div#outputBody").empty().append($("<div id='deletedTips' />").attr("locale", "LANG3430").html($P.lang("LANG3430")).css({
                        color: "green"
                    }));
                }
            }
        }
    });
}

function buttonSwitch(start) {
    $("button#btnStart").button("option", "disabled", start);

    $("button#btnStop").button("option", "disabled", !start);

    if (!start) {
        $("#direction, #mode").removeAttr("disabled");

        btnDownload_check_state();
    } else {
        $("#direction, #mode").attr("disabled", "disabled");

        $("div#outputBody").append($("<div />").attr("locale", "LANG1582").html($P.lang("LANG1582")));
    }

    top.Custom.init(doc);
}
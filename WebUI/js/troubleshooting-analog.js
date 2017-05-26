/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    eventFlag = true,
    chkbxClass = "chkBoxes";

String.prototype.format = top.String.prototype.format;
Array.prototype.indexOf = top.Array.prototype.indexOf;

$(function() {
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3238"));

    loadPortList();

    $P.lang(document, true);

    selectAllPort($(".fxo_ports").find("input"), $("#fxo_port_all"));
    selectAllPort($(".fxs_ports").find("input"), $("#fxs_port_all"));

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

    $("button#btnFXOStart").button({
        icons: {
            primary: "ui-icon-play"
        },
        disabled: true
    });

    $("button#btnFXOStop").button({
        icons: {
            primary: "ui-icon-stop"
        },
        disabled: true
    });

    $("button#btnFXODownload").button({
        icons: {
            primary: "ui-icon-disk"
        },
        disabled: true
    });

    $("button#btnFXODelete").button({
        icons: {
            primary: "ui-icon-trash"
        },
        disabled: true
    });

    $.ajax({
        type: "POST",
        url: "../cgi?",
        data: "action=analog_signaling_trace_query&analog_trace_switch=",
        error: checkFailed,
        success: checkReturn
    });

    $.ajax({
        type: "POST",
        url: "../cgi?",
        data: "action=get_analog_signal_auto_trace",
        error: checkFXOFailed,
        success: checkFXOReturn
    });

    initValidator();

    top.Custom.init(document);
});

function initValidator() {
    if ($("#form2").tooltip) {
        $("#form2").tooltip();
    }

    $P("#form2", document).validate({
        rules: {
            "ext_extension": {
                required: true,
                digits: true,
                minlength: 2
            }
        }
    });
}

function loadPortList() {
    var fxo = parseInt(UCMGUI.config.model_info.num_fxo),
        fxs = parseInt(UCMGUI.config.model_info.num_fxs);

    if (fxo) {
        var lbl = document.createElement('div'),
            label = document.createElement('label'),
            lbltext = document.createTextNode($P.lang("LANG1724")),
            sAllSelected = '<div class="special" id="fox_all">' +
            '<input type="checkbox" id="fxo_port_all" name="fxo_port_all" type="checkbox" />' +
            '<span locale="LANG104" class="all_text"></span>' +
            '</div>';

        label.appendChild(lbltext);
        label.setAttribute("locale", "LANG1724");

        lbl.className = 'special';
        lbl.appendChild(label);

        document.getElementById("ports").appendChild(lbl);

        $("#ports").append(sAllSelected);
    }

    for (var i = 1; i <= fxo; i++) {
        var lbl = document.createElement('div');

        lbl.className = 'special fxo_ports';

        var label = document.createElement('label'),
            lbltext = document.createTextNode(i),
            ncbx = document.createElement('input');

        ncbx.type = 'checkbox';
        ncbx.setAttribute("noSerialize", true);
        ncbx.value = i;

        ncbx.className = chkbxClass + ' fxo-port';

        label.appendChild(lbltext);
        lbl.appendChild(ncbx);
        lbl.appendChild(label);

        document.getElementById("ports").appendChild(lbl);
    }

    if (fxs) {
        document.getElementById("ports").appendChild(document.createElement('br'));

        var lbl = document.createElement('div'),
            label = document.createElement('label'),
            lbltext = document.createTextNode($P.lang("LANG1725")),
            sAllSelected = '<div class="special" id="fxs_all">' +
            '<input type="checkbox" id="fxs_port_all" name="fxs_port_all" type="checkbox" />' +
            '<span locale="LANG104" class="all_text"></span>' +
            '</div>';

        label.appendChild(lbltext);
        label.setAttribute("locale", "LANG1725");

        lbl.className = 'special';
        lbl.appendChild(label);

        document.getElementById("ports").appendChild(lbl);

        $("#ports").append(sAllSelected);
    }

    for (var i = 1; i <= fxs; i++) {
        var lbl = document.createElement('div');

        lbl.className = 'special fxs_ports';

        var label = document.createElement('label'),
            lbltext = document.createTextNode(i),
            ncbx = document.createElement('input');

        ncbx.type = 'checkbox';
        ncbx.setAttribute("noSerialize", true);
        ncbx.value = (i + fxo);

        ncbx.className = chkbxClass + ' fxs-port'

        label.appendChild(lbltext);
        lbl.appendChild(ncbx);
        lbl.appendChild(label);

        document.getElementById("ports").appendChild(lbl);
    }
}

function selectAllPort(boxes, allBox) {
    allBox.on('change', function() {
        if (this.checked) {
            boxes.each(function() {
                this.checked = true;
                $(this).prev().css("background-position", "0 -50px");
            });
        } else {
            boxes.each(function() {
                this.checked = false;
                $(this).prev().css("background-position", "0 0");
            });
        }
    });

    boxes.on('change', function() {
        if (boxes.filter(":checked").length == boxes.length) {
            allBox[0].checked = true;
            allBox.prev().css("background-position", "0 -50px");
        } else {
            allBox[0].checked = false;
            allBox.prev().css("background-position", "0 0");
        }
    });
}

function getSelectedPorts() {
    var ports = [];

    $("." + chkbxClass + ":checked").each(function() {
        ports.push($(this).val());
    });

    return ports;
}

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
        var analogTraceStatus = val.response.analog_trace_switch;

        // TODO : set last filter.

        if (analogTraceStatus.analog_trace_switch) {
            var ports = analogTraceStatus.analog_trace_port.split('_'),
                direction = analogTraceStatus.analog_trace_direction,
                mode = analogTraceStatus.analog_trace_mode;

            if (direction == 'rs') {
                $('#modeDiv').show();
            } else {
                $('#modeDiv').hide();
            }

            $('#direction').val(direction);

            if (mode) {
                $('#mode').val(mode);
            }

            for (var i = 0; i < ports.length; i++) {
                $("." + chkbxClass + "[value=" + ports[i] + "]").attr("checked", true);
            }

            if ($('.fxo-port').length === $('.fxo-port:checked').length) {
                $('#fxo_port_all')[0].checked = true;
            }

            if ($('.fxs-port').length === $('.fxs-port:checked').length) {
                $('#fxs_port_all')[0].checked = true;
            }

            buttonSwitch(true);
        } else if (analogTraceStatus.analog_trace_stop_finish_flag == 0) {
            $("button#btnStart, button#btnStop, button#btnDownload, button#btnDelete").button("option", "disabled", true);

            $(":checkbox, #direction, #mode").attr("disabled", "disabled");

            top.Custom.init(document);

            var stopInterval = function() {
                $.ajax({
                    type: "POST",
                    url: "../cgi?",
                    data: "action=analog_signaling_trace_query&analog_trace_switch=",
                    dataType: "json",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        setTimeout(stopInterval, 1000);
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            var analogTraceStatus = data.response.analog_trace_switch;

                            if (!analogTraceStatus.analog_trace_switch && analogTraceStatus.analog_trace_stop_finish_flag == 0) {
                                if (!($('#stopingTips').length)) {
                                    $("div#outputBody").append($("<div id='stopingTips' />").attr("locale", "LANG3429").html($P.lang("LANG3429")));
                                }

                                setTimeout(stopInterval, 1000);
                            } else if (!analogTraceStatus.analog_trace_switch && analogTraceStatus.analog_trace_stop_finish_flag == 1) {
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

function checkPortRequired(element, value) {
    if ($('.chkBoxes:checked').length) {
        return true;
    }

    return false;
}

function btnStart_click() {
    if (!checkPortRequired()) {
        top.dialog.dialogMessage({
            type: "warning",
            content: $P.lang("LANG3531").format('1', $P.lang('LANG237').toLowerCase())
        });

        return false;
    }

    eventFlag = false;

    $("button#btnDownload").button("option", "disabled", true);

    $("button#btnDelete").button("option", "disabled", true);

    $("div#outputBody").empty();

    var ports, direct, mode;

    ports = getSelectedPorts().join('_');

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
            'action': 'analog_signaling_trace',
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
            data: "action=analog_signaling_trace_query&analog_trace_switch=",
            dataType: "json",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
                setTimeout(stopInterval, 1000);
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    var analogTraceStatus = data.response.analog_trace_switch;

                    if (!analogTraceStatus.analog_trace_switch && analogTraceStatus.analog_trace_stop_finish_flag == 0) {
                        if (!($('#stopingTips').length)) {
                            $("div#outputBody").append($("<div id='stopingTips' />").attr("locale", "LANG3429").html($P.lang("LANG3429")));
                        }

                        setTimeout(stopInterval, 1000);
                    } else if (!analogTraceStatus.analog_trace_switch && analogTraceStatus.analog_trace_stop_finish_flag == 1) {
                        clearTimeout(stopInterval);

                        stopInterval = null;

                        buttonSwitch(false);
                    }
                }
            }
        });
    };

    var txt = $P.lang("LANG3247");

    top.dialog.dialogMessage({
        type: "loading",
        title: txt,
        content: txt
    });

    eventFlag = true;

    $("button#btnStop").button("option", "disabled", true);

    $("button#btnDownload").button("option", "disabled", true);

    $("button#btnDelete").button("option", "disabled", true);

    $("div#outputBody").empty();

    $.ajax({
        url: "../cgi?action=analog_signaling_trace&control=stop",
        type: "GET",
        async: false,
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
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "../cgi?action=checkFile&type=analog_signaling_trace",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            if (data && data.hasOwnProperty("status") && (data.status === 0) && data.response.result == "0") {
                window.open("../cgi?action=downloadFile&type=analog_signaling_trace", '_self');
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG3868")
                });
            }
        }
    });
}

function btnDelete_click() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG841"),
        buttons: {
            ok: function() {
                $.ajax({
                    url: "../cgi?action=removeFile&type=analog_signaling_trace",
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
            },
            cancel: function() {
                top.dialog.clearDialog();
            }
        }
    });
}

function btnDownload_check_state() {
    $.ajax({
        type: "GET",
        dataType: "json",
        async: false,
        url: "../cgi?action=checkFile&type=analog_signaling_trace",
        success: function(data) {
            if (data && data.hasOwnProperty('status') && data.status == 0 && data.response.result == "0") {
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
        $(":checkbox, #direction, #mode").removeAttr("disabled");

        btnDownload_check_state();
    } else {
        $(":checkbox, #direction, #mode").attr("disabled", "disabled");

        $("div#outputBody").append($("<div />").attr("locale", "LANG1582").html($P.lang("LANG1582")));
    }

    top.Custom.init(document);
}

function checkFXOFailed(val) {
    buttonFXOSwitch(false); // assume haven't started 
}

function checkFXOReturn(val) {
    var bool = UCMGUI.errorHandler(val);

    if (bool) {
        var analogTraceStatus = val.response.analog_signal_auto_trace_start;

        // TODO : set last filter.

        if (analogTraceStatus == "1") {
            buttonFXOSwitch(true);
        } else {
            buttonFXOSwitch(false);
        }
    }
}

function btnFXOStart_click() {
    $.ajax({
        type: "POST",
        url: "../cgi?",
        data: "action=analog_signaling_trace_query&analog_trace_switch=",
        error: checkFailed,
        success: function (data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var analogTraceStatus = data.response.analog_trace_switch;

                // TODO : set last filter.

                if (analogTraceStatus.analog_trace_switch) {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG5083"),
                            buttons: {
                                ok: function() {
                                    btnStop_click();
                                    doBtnFXOStart_click();
                                },
                                cancel: function() {
                                    top.dialog.clearDialog();
                                }
                            }
                    });
                } else {
                    doBtnFXOStart_click();
                }
            }
        }
    });
}

function doBtnFXOStart_click () {
    if (!$P("#form2", document).valid()) {
        $("input[titles]").blur().focus();

        return false;
    } else {
        var tooltip = $('.ui-tooltip');

        if (tooltip.length) {
            tooltip.remove();
        }
    }
    eventFlag = false;

    $("button#btnFXODownload").button("option", "disabled", true);

    $("button#btnFXODelete").button("option", "disabled", true);

    $("div#outputFXOBody").empty();

    $.ajax({
        url: "../cgi",
        type: "POST",
        data: {
            'action': 'analog_signal_auto_trace',
            'analog_control': 'start',
            'ext_extension': $("#ext_extension").val()
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
                buttonFXOSwitch(true);
            }
        }
    });
}
function btnFXOStop_click() {
    var stopInterval = function() {
        $.ajax({
            type: "POST",
            url: "../cgi?",
            data: "action=get_analog_signal_auto_trace",
            dataType: "json",
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
                setTimeout(stopInterval, 1000);
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    var analogTraceStatus = data.response.analog_signal_auto_trace_start;

                    if (!analogTraceStatus == "1") {
                        if (!($('#stopingFXOTips').length)) {
                            $("div#outputFXOBody").append($("<div id='stopingFXOTips' />").attr("locale", "LANG3429").html($P.lang("LANG3429")));
                        }

                        setTimeout(stopInterval, 1000);
                    } else if (analogTraceStatus == "0") {
                        clearTimeout(stopInterval);

                        stopInterval = null;

                        buttonFXOSwitch(false);
                    }
                }
            }
        });
    };

    var txt = $P.lang("LANG3247");

    top.dialog.dialogMessage({
        type: "loading",
        title: txt,
        content: txt
    });

    eventFlag = true;

    $("button#btnFXOStop").button("option", "disabled", true);

    $("button#btnFXODownload").button("option", "disabled", true);

    $("button#btnFXODelete").button("option", "disabled", true);

    $("div#outputFXOBody").empty();

    $.ajax({
        url: "../cgi?action=analog_signal_auto_trace&analog_control=stop&ext_extension=",
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

function btnFXODownload_click() {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "../cgi?action=checkFile&type=analog_signal_auto_trace",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            if (data && data.hasOwnProperty("status") && (data.status === 0) && data.response.result == "0") {
                window.open("../cgi?action=downloadFile&type=analog_signal_auto_trace", '_self');
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG3868")
                });
            }
        }
    });
}

function btnFXODelete_click() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG841"),
        buttons: {
            ok: function() {
                $.ajax({
                    url: "../cgi?action=analog_signal_auto_trace&analog_control=remove&ext_extension=",
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
                            buttonFXOSwitch(false);
                        }
                    }
                });
            },
            cancel: function() {
                top.dialog.clearDialog();
            }
        }
    });
}

function btnFXODownload_check_state() {
    $.ajax({
        type: "GET",
        dataType: "json",
        async: false,
        url: "../cgi?action=checkFile&type=analog_signal_auto_trace",
        success: function(data) {
            if (data && data.hasOwnProperty('status') && data.status == 0 && data.response.result == "0") {
                $("button#btnFXODownload").button("option", "disabled", false);

                $("button#btnFXODelete").button("option", "disabled", false);

                if (!($('#downloadFXOTips').length)) {
                    $("div#outputFXOBody").append($("<div id='downloadFXOTips' />").attr("locale", "LANG1581").html($P.lang("LANG1581")).css({
                        color: "green"
                    }));
                }
            } else {
                $("button#btnFXODownload").button("option", "disabled", true);

                $("button#btnFXODelete").button("option", "disabled", true);

                if (!($('#deletedFXOTips').length)) {
                    $("div#outputFXOBody").empty().append($("<div id='deletedFXOTips' />").attr("locale", "LANG3430").html($P.lang("LANG3430")).css({
                        color: "green"
                    }));
                }
            }
        }
    });
}

function buttonFXOSwitch(start) {
    $("button#btnFXOStart").button("option", "disabled", start);

    $("button#btnFXOStop").button("option", "disabled", !start);

    if (!start) {
        $("#ext_extension").removeAttr("disabled");

        btnFXODownload_check_state();
    } else {
        $("#ext_extension").attr("disabled", "disabled");

        $("div#outputFXOBody").append($("<div />").attr("locale", "LANG1582").html($P.lang("LANG1582")));
    }

    top.Custom.init(document);
}
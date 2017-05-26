/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    type = "";

var mappingErrCode = {
    "-1": "LANG2931", // "time out"
    0: "LANG2932", // "no error return"
    1: "LANG2933", // "CPT detect is running"
    2: "LANG2934", // "ACIM detect is running"
    3: "LANG2936", // "unload dahdi module failed"
    4: "LANG2935", // "ACIM thread create failed"
    5: "LANG2937", // "fxo: cannot be opened, absent or busy"
    6: "LANG2938",// "fxo: read status failed"
    7: "LANG2939",// "fxo: not connect"
    8: "LANG2940", // "fxo: set signed linear mode failed"
    9: "LANG2941", // "fxo: cannot get buffer information"
    10: "LANG2942",// "fxo: set buffer information failed"
    11: "LANG2943", // "fxo: bring offhook failed"
    12: "LANG2944", // "fxo: unable to get a clear outside line"
    13: "LANG2945", // "fxo: unable to set echo coefficients"
    14: "LANG2946", // "fxo: unable to flush port buffer"
    15: "LANG2947" // "fxo: could not write all data to line"
    // 16: "end of error string"
}

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    type = gup.call(window, "type");

    if (type == "FXO") {
        loadFXOList();
    } else if (type == "BRI") {
        loadBRIList();
    } else {
        loadFXSList();
    }

    initValidator();
});

function confirm_reboot() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG927"),
        buttons: {
            ok: UCMGUI.loginFunction.confirmReboot,
            cancel: function() {
                mWindow.getBRISettings();
            }
        }
    });
}

function saveChanges() {
    if (type == 'BRI') {
        var portList = [],
            eles = $(".BRI_PORT");

        if (eles.length > 3) {
            portList = [{}, {}];
        } else {
            portList = [{}];
        }

        $.each(eles, function(index, item) {
            var id = $(item).attr("id"),
                val = $(item).val(),
                portIndex = id.substr(-1, 1),
                portProperty = id.slice(0, id.length -1);

            portList[portIndex - 1][portProperty] = val;
        });

        for (var i = 0; i < portList.length; i++) {
            portList[i]['action'] = "updateBRIdirverSettings";
            portList[i]['span'] = i + 2;
        }

        if (1 >= portList.length) {
            $.ajax({
                type: "post",
                url: baseServerURl,
                data: portList[0],
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
                        top.dialog.dialogMessage({
                            type: "success",
                            content: $P.lang("LANG4782")
                        });

                        setTimeout(function() {
                            confirm_reboot();
                        }, 1000);
                    }
                }
            });
        } else {
            $.ajax({
                type: "post",
                url: baseServerURl,
                data: portList[0],
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
                        $.ajax({
                            type: "post",
                            url: baseServerURl,
                            data: portList[1],
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
                                    top.dialog.dialogMessage({
                                        type: "success",
                                        content: $P.lang("LANG4782")
                                    });

                                    setTimeout(function() {
                                        confirm_reboot();
                                    }, 1000);
                                }
                            }
                        });
                    }
                }
            });
        }
    } else {
        var action = {
                action: "updateAnalogSettings"
            },
            eles = $(".EASOC_PORT"),
            sig = {},
            acim = {},
            echocefs = {},
            ifACIMautodetect = false;

        $.each(eles, function(index, item) {
            var chan = $(item).attr("id"),
                val = $(item).val();

            if (type == "FXO") {
                var echocefsVal = $(item).attr("echocefs");

                acim[chan] = val;
                echocefs[chan] = echocefsVal;
                if (mWindow.fxoSettings[index].acim != val) {
                    ifACIMautodetect = true;
                }
            } else {
                sig[chan] = val;
            }
        });

        if (type == "FXO") {
            action["acim"] = JSON.stringify(acim);
            action["echocefs"] = JSON.stringify(echocefs);
            action['acim_option'] = $('#acim_option').val();
            if (ifACIMautodetect) {
                action["ifACIMautodetect"] = "yes";
            }
        } else {
            action["sig"] = JSON.stringify(sig);
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
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
                    top.dialog.dialogMessage({
                        type: "success",
                        content: $P.lang("LANG4782")
                    });

                    mWindow.getAnalogSettings("getSettings");
                }
            }
        });
    }
}

function loadBRIList() {
    var briSettings = mWindow.briSettings;
    var optionsContainer = $('#edit_options_container');

    var mode = $('<select>').attr({ mselect: true, id: "mode" }).appendTo(optionsContainer).hide();
    var clock = $('<select>').attr({ mselect: true, id: "clock" }).appendTo(optionsContainer).hide();
    var    codec = $('<select>').attr({ mselect: true, id: "codec" }).appendTo(optionsContainer).hide();

    var modeOpts = [{ text: "NT", val: "nt" }, { text: "TE", val: "te" }],
        clockOpts = [{ text: "0", val: "0" }, { text: "1", val: "1" }, { text: "2", val: "2" }],
        codecOpts = [{ text: "ulaw", val: "0" }, { text: "alaw", val: "1" }];

    selectbox.appendOpts({ el: "mode", opts: modeOpts }, doc);
    selectbox.appendOpts({ el: "clock", opts: clockOpts }, doc);
    selectbox.appendOpts({ el: "codec", opts: codecOpts }, doc);

    var briPortsNum = Number(UCMGUI.config.model_info.num_bri);

    for (var i = 1; i <= briPortsNum; i++) {
        var portMode = briSettings[i - 1].mode,
            portClock = briSettings[i - 1].clock,
            portCodec = briSettings[i - 1].codec;

        var fieldCell = $("<div>").css("position", "relative").addClass("field-cell");
        var fieldLabel = $("<div>").attr("glabel", "@LANG237").addClass("field-label");
        var fieldContent1 = $("<div>").addClass("field-content");
        var fieldContent2 = fieldContent1.clone();
        var fieldContent3 = fieldContent1.clone();

        var modeSelect = mode.clone(true).attr("id", "mode" + i).addClass("BRI_PORT").show();
        var clockSelect = clock.clone(true).attr("id", "clock" + i).addClass("BRI_PORT").show();
        var codecSelect = codec.clone(true).attr("id", "codec" + i).addClass("BRI_PORT").show();

        modeSelect.val(portMode);
        clockSelect.val(portClock);
        codecSelect.val(portCodec);

        fieldLabel.appendTo(fieldCell);
        modeSelect.appendTo(fieldContent1);
        clockSelect.appendTo(fieldContent2);
        codecSelect.appendTo(fieldContent3);

        fieldContent1.appendTo(fieldCell);
        fieldContent2.appendTo(fieldCell);
        fieldContent3.appendTo(fieldCell);

        fieldContent1.before('<span style="float: left; margin-right: 5px;" locale="LANG2879"></span>');
        fieldContent2.before('<span style="float: left; margin-right: 5px;" locale="LANG2880"></span>');
        fieldContent3.before('<span style="float: left; margin-right: 5px;" locale="LANG2881"></span>');

        fieldCell.appendTo($("#edit_options_container"));
    }

    mode.remove();
    clock.remove();
    codec.remove();

    $("#acim_btn_div, #acim_option_div").hide();

    $P.lang(doc, true);

    top.Custom.init(doc);
}

function loadFXOList() {
    var fxoSettings = mWindow.fxoSettings,
        globalSettings = mWindow.globalSettings;
    var optionsContainer = $('#edit_options_container');
    var select = $('<select>').attr({
        mselect: true,
        id: "select"
    }).appendTo(optionsContainer)
        .hide();
    var opts = [{
        text: "600 Ω",
        val: 0
    }, {
        text: "900 Ω",
        val: 1
    }, {
        text: "270 Ω + (750 Ω || 150 nF) and 275 Ω + (780 Ω || 150 nF)",
        val: 2
    }, {
        text: "220 Ω + (820 Ω || 120 nF) and 220 Ω + (820 Ω || 115 nF)",
        val: 3
    }, {
        text: "370 Ω + (620 Ω || 310 nF)",
        val: 4
    }, {
        text: "320 Ω + (1050 Ω || 230 nF)",
        val: 5
    }, {
        text: "370 Ω + (820 Ω || 110 nF)",
        val: 6
    }, {
        text: "275 Ω + (780 Ω || 115 nF)",
        val: 7
    }, {
        text: "120 Ω + (820 Ω || 110 nF)",
        val: 8
    }, {
        text: "350 Ω + (1000 Ω || 210 nF)",
        val: 9
    }, {
        text: "200 Ω + (680 Ω || 100 nF)",
        val: 10
    }, {
        text: "600 Ω + 2.16 μF",
        val: 11
    }, {
        text: "900 Ω + 1 μF",
        val: 12
    }, {
        text: "900 Ω + 2.16 μF",
        val: 13
    }, {
        text: "600 Ω + 1 μF",
        val: 14
    }, {
        text: $P.lang('LANG1730'),
        val: 15
    }]
    selectbox.appendOpts({
        el: "select",
        opts: opts
    }, doc);

    $('#acim_option').val(globalSettings.acim_option);

    var chans = Number(UCMGUI.config.model_info.num_fxo);
    for (var i = 0; i < chans; i++) {
        var chan = fxoSettings[i].chan;
        var acim = fxoSettings[i].acim;
        var echocefs = fxoSettings[i].echocefs;
        var portNum = i + 1;
        var fieldCell = $("<div>").css("position", "relative").addClass("field-cell");
        var fieldLabel = $("<div>").addClass("field-label");
        $("<div class='glab'><span class='tooltip'></span><span class='label'>"+$P.lang('LANG2993').format(portNum)+"</span></div>").appendTo(fieldLabel);
        var fieldContent = $("<div>").addClass("field-content");
        var thisSelect = select.clone(true).attr({
            id: "chan" + chan,
            echocefs: echocefs
        }).addClass("EASOC_PORT").show();
        thisSelect.val(acim);
        fieldLabel.appendTo(fieldCell);
        fieldContent.appendTo(fieldCell);
        thisSelect.appendTo(fieldContent);
        fieldCell.appendTo($("#edit_options_container"));
    }
    $P.lang(doc, true);
    top.Custom.init(doc);
}

function loadFXSList() {
    var fxsSettings = mWindow.fxsSettings;
    var optionsContainer = $('#edit_options_container');
    var select = $('<select>').attr({
        mselect: true,
        id: "select"
    }).appendTo(optionsContainer)
        .hide();
    var opts = [{
        text: "Kewl Start",
        val: "ks"
    }, {
        text: "Loop Start",
        val: "ls"
    }]
    selectbox.appendOpts({
        el: "select",
        opts: opts
    }, doc);
    var fxsChansNum = Number(UCMGUI.config.model_info.num_fxs);
    for (var i = 0; i < fxsChansNum; i++) {
        var chan = fxsSettings[i].chan;
        var sig = fxsSettings[i].sig;
        var echocefs = fxsSettings[i].echocefs;
        var portNum = i + 1;
        var fieldCell = $("<div>").css("position", "relative").addClass("field-cell");
        var fieldLabel = $("<div>").addClass("field-label");
        $("<div class='glab'><span class='tooltip'></span><span class='label'>"+$P.lang('LANG2993').format(portNum)+"</span></div>").appendTo(fieldLabel);
        var fieldContent = $("<div>").addClass("field-content");
        var thisSelect = select.clone(true).attr("id", "chan" + chan).addClass("EASOC_PORT").show();
        thisSelect.val(sig);
        fieldLabel.appendTo(fieldCell);
        fieldContent.appendTo(fieldCell);
        thisSelect.appendTo(fieldContent);
        fieldCell.appendTo($("#edit_options_container"));
    }
    $("#acim_btn_div, #acim_option_div").hide();
    $P.lang(doc, true);
    top.Custom.init(doc);
}

function getPortList() {
    var fxoNum = $(".EASOC_PORT").length;
    var portList = "";
    for (var i = 1; i <= fxoNum; i++) {
        if (i == fxoNum) {
            portList = portList + i;
        } else {
            portList = portList + i + ",";
        }

    }
    return portList;
}

function acim_detect() {
    var portList = getPortList();
    var action = {
        action: "startPSTNDetecting",
        pstn_type: "pstn_acim",
        acim: portList,
        acim_option: $('#acim_option').val()
    }
    $.ajax({
        type: "POST",
        url: baseServerURl,
        dataType: "json",
        async: false,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG2337")
            });
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });
            if (bool) {
                setTimeout(reflesh_status, 5000);
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {},
        submitHandler: function() {
            saveChanges();
        }
    });
}

function reflesh_status() {
    var portList = getPortList();
    var action = {
        action: "getPSTNDetecting",
        pstn_type: "pstn_acim",
        acim: portList
    }
    $.ajax({
        type: "GET",
        url: baseServerURl,
        dataType: "json",
        async: false,
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
                var result = data.response.result;
                var totalState = data.response.total_state;
                var totalErr = data.response.total_err;
                var errorData = "";
                //if (parseInt(totalErr, 10) == 0) {
                if (totalState != "done") {
                    setTimeout(reflesh_status, 5000);
                } else {
                    top.dialog.clearDialog("", function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    });
                    $.each(result, function(index, val) {
                        var eleId = val.chan;
                        var eleVal = val.pstn_acim;
                        var echocefs = val.pstn_echocefs;
                        var errCode = val.errCode;
                        if (Number(errCode) != 0) {
                            errorData += $P.lang("LANG101") + eleId + "   " + $P.lang(mappingErrCode[errCode]) + "<br>";
                            top.dialog.clearDialog();
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: errorData,
                                callback: function() {
                                    top.dialog.container.show();
                                    top.dialog.shadeDiv.show();
                                }
                            });
                        } else {
                            $("#chan" + eleId).val(eleVal).attr("echocefs", echocefs);
                        }
                    });
                    top.Custom.init(doc);
                }
                // } else {
                //     for (var i = 0; i < result.length; i++) {
                //         var errCode = result[i].errCode;
                //         var chan = result[i].chan;
                //         if (Number(errCode) != 0) {
                //             top.dialog.clearDialog();
                //             top.dialog.dialogMessage({
                //                 type: 'error',
                //                 content: $P.lang("LANG101") + ":" + chan + $P.lang(mappingErrCode[errCode]),
                //                 callback: function() {
                //                     top.dialog.container.show();
                //                     top.dialog.shadeDiv.show();
                //                 }
                //             });
                //         }
                //         break;
                //     };
                // }
            }
        }
    });
}

function stop_detecting() {
    var portList = getPortList();
    var action = {
        action: "stopPSTNDetecting",
        pstn_type: "pstn_acim",
        acim: portList
    }
    $.ajax({
        type: "GET",
        url: baseServerURl,
        dataType: "json",
        async: false,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function() {
            top.dialog.clearDialog();
        }
    });
}
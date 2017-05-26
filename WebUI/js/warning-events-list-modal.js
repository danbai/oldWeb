/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

function gup(name) {
    var name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"),
        regexS = "[\\?&]" + name + "=([^&#]*)",
        regex = new RegExp(regexS),
        results = regex.exec(window.location.href);

    if (results == null) {
        return undefined;
    } else {
        return results[1];
    }
}

function getValue(item) {
    var action = 'action=warningGetConfigSettings&id=' + item;

    $.ajax({
        type: "post",
        url: "/cgi",
        data: action,
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
                var cycle_time_value = data.response.body.cycle_time,
                    cycle_time = (cycle_time_value ? cycle_time_value : ''),
                    percent_value = data.response.body.percent,
                    percent = (percent_value ? (Math.round(percent_value * 100)) : '');

                $('#threshold_value').val(percent);

                if (cycle_time === '') {
                    $('#cycle_time').val('');
                    $('#cycle_unit').val('s');

                    setCycleTimeRules('s', $P('#cycle_time', document));
                } else {
                    var unit = cycle_time.slice(-1);

                    $('#cycle_time').val(parseInt(cycle_time));
                    $('#cycle_unit').val(unit);

                    setCycleTimeRules(unit, $P('#cycle_time', document));

                    top.Custom.init(document);
                }
            }
        }
    });
}

function getWarningSendDelaySetting() {
    var action = 'action=getWarningSendDelaySetting';

    $.ajax({
        type: "post",
        url: "/cgi",
        data: action,
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
                var sendDelay = data.response.body.send_delay;

                $('#send_delay').val(sendDelay);
                top.Custom.init(document);
            }
        }
    });    
}
function setCycleTimeRules(cycleUnit, obj) {
    switch (cycleUnit) {
        case "s":
            obj.rules("add", {range: [5, 31536000]});
            break;
        case "m":
            obj.rules("add", {range: [1, 525600]});
            break;
        case "h":
            obj.rules("add", {range: [1, 8760]});
            break;
        case "d":
            obj.rules("add", {range: [1, 365]});
            break;
        default:
            break;
    }

    return;
}

function updateWarningSendDelaySetting() {
    var stop_cmd = "action=reloadWarning&warningStop=",
        start_cmd = "action=reloadWarning&warningStart=";

    var cb = function() {
        var action = {
            "action": "updateWarningSendDelaySetting",
            "send_delay": $("#send_delay").val()
        };

        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG904")
        });

        $.ajax({
            type: "post",
            url: "/cgi",
            data: action,
            error: function (jqXHR, textStatus, errorThrown) {
                top.dialog.clearDialog();

                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    $.ajax({
                        type: "GET",
                        url: "/cgi",
                        async: false,
                        data: start_cmd,
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG844")
                                });
                            }
                        }
                    });
                }
            }
        });
    };

    $.ajax({
        type: "GET",
        url: "/cgi",
        async: false,
        data: stop_cmd,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                cb();
            }
        }
    });    
}
function saveChanges(item, cycle_time, threshold_value) {
    var stop_cmd = "action=reloadWarning&warningStop=",
        start_cmd = "action=reloadWarning&warningStart=";

    var cb = function(item, cycle_time, threshold_value) {
        var action = {
            "action": "warningUpdateConfigSettings",
            "percent": threshold_value,
            "cycle_time": cycle_time,
            "id": item
        };

        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG904")
        });

        $.ajax({
            type: "post",
            url: "/cgi",
            data: action,
            error: function (jqXHR, textStatus, errorThrown) {
                top.dialog.clearDialog();

                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    $.ajax({
                        type: "GET",
                        url: "/cgi",
                        async: false,
                        data: start_cmd,
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG844")
                                });
                            }
                        }
                    });
                }
            }
        });
    };

    $.ajax({
        type: "GET",
        url: "/cgi",
        async: false,
        data: stop_cmd,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                cb(item, cycle_time, threshold_value);
            }
        }
    });
}

$(function() {
    var item = gup('item');

    $P.lang(document, true);

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    if (item == 1 || item == 3 || item === '18') {
        $('#send_delay').parents('.field-cell').hide();
        $P("#form", document).validate({
            rules: {
                "cycle_time": {
                    required: true,
                    number: true,
                    digits: true
                },
                "threshold_value": {
                    required: true,
                    number: true,
                    digits: true,
                    range: [1, 100]
                }
            },
            submitHandler: function() {
                var target = this.submitButton,
                    cycle_time,
                    threshold_value;

                if ($(target).attr('id') !== 'save') {
                    return;
                }

                cycle_time = parseInt($('#cycle_time').val()) + $('#cycle_unit').val();

                threshold_value = parseInt($('#threshold_value').val()) / 100;

                saveChanges(item, cycle_time, threshold_value);
            }
        });

        getValue(item);
    } else if(item == 7) {
        $('#threshold_value').parents('.field-cell').hide();
        $('#cycle_time').parents('.field-cell').hide();
        $P("#form", document).validate({
            rules: {
                "send_delay": {
                    range: [1, 1440]
                }
            },
            submitHandler: function() {
                updateWarningSendDelaySetting();
            }
        });
        getWarningSendDelaySetting();
    } else {
        $('#threshold_value').parents('.field-cell').hide();
        $('#send_delay').parents('.field-cell').hide();
        $P("#form", document).validate({
            rules: {
                "cycle_time": {
                    required: true,
                    number: true,
                    digits: true
                }
            },
            submitHandler: function() {
                var target = this.submitButton,
                    cycle_time,
                    threshold_value;

                if ($(target).attr('id') !== 'save') {
                    return;
                }

                cycle_time = parseInt($('#cycle_time').val()) + $('#cycle_unit').val();

                saveChanges(item, cycle_time, "");
            }
        });

        getValue(item);
    }

    $('#cycle_unit').change(function () {
        setCycleTimeRules($(this).val(), $P('#cycle_time', document));
    });
});
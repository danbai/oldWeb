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
    init = true,
    memory,
    cpu;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG586"));

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG805")
    });

    setTimeout("updateData()", 500);
});

function updateData() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "/cgi",
        data: {
            "action": 'getResourceUsage',
            "auto-refresh": Math.random()
        },
        error: function() {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG909")
            });
        },
        success: dataBind
    });

    setTimeout("updateData()", 3000);
}

function dataBind(val) {
    var bool = UCMGUI.errorHandler(val);

    if (bool) {

        var val = val.response.body;

        if (init == true) {

            // close the loading dialog
            top.dialog.clearDialog();

            cpu = new JustGage({
                id: "cpu_usage",
                value: val["cpu-usage"],
                min: 0,
                max: 100,
                title: " ",
                titleFontSize: "1px",
                label: $P.lang("LANG114"),
                levelColors: ["#91c6e4", "#ffba01", "#f26c2a"],
                valueFontColor: "#5a5a5a",
                gaugeColor: "#e4e4e4",
                levelColorsGradient: false,
                gaugeWidthScale: 0.75
            });

            memory = new JustGage({
                id: "memory_usage",
                value: val["memory-total"] - val["memory-avail"],
                min: 0,
                max: val["memory-total"],
                title: " ",
                titleFontSize: "1px",
                label: "MB",
                levelColors: ["#91c6e4", "#ffba01", "#f26c2a"],
                valueFontColor: "#5a5a5a",
                gaugeColor: "#e4e4e4",
                levelColorsGradient: false,
                gaugeWidthScale: 0.75
            });

            init = false;
        } else {
            cpu.refresh(val["cpu-usage"]);

            memory.refresh(val["memory-total"] - val["memory-avail"]);
        }
    }
}
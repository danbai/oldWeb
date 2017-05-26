/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    eventFlag = true,
    repeat = null,
    count = 0;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG670"));

    $("button#btnStart").button({
        icons: {
            primary: "ui-icon-play"
        },
        disabled: false
    });

    $("button#btnStop").button({
        icons: {
            primary: "ui-icon-stop"
        },
        disabled: true
    });

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "traceroute": {
                required: true,
                host: ['IP or URL']
            }
        }
    });

    top.Custom.init(document);
});

$(document).bind("keydown", function(ev) {
    if (ev.which == 13) {
        if (eventFlag) {
            btnStart_click();
        }

        ev.stopPropagation();
        return false;
    };
});

$(window).unload(function() {
    clearTimeout(repeat);

    repeat = null;

    $.ajax({
        url: "../cgi?action=stopTroubleShooting&traceroute=",
        type: "GET",
        async: false,
        success: dataBind
    });
});

function valOrDefault(val, def) {
    return val == undefined || val == null ? def : val;
}

function btnStart_click() {
    if (!$P("#form", doc).valid()) {
        $("input[titles]").blur().focus();

        return false;
    } else {
        var tooltip = $('.ui-tooltip');

        if (tooltip.length) {
            tooltip.remove();
        }
    }

    eventFlag = false;

    $("div#outputBody").empty();

    $("div#outputBody").siblings().remove();

    buttonSwitch(true);

    $.ajax({
        url: "../cgi?action=startTroubleShooting&" + "traceroute=" + "" + $("[name=traceroute]").val(),
        type: "GET",
        error: onResponseError,
        success: function(val) {
            var bool = UCMGUI.errorHandler(val);

            if (bool) {
                dataBind(val);
            } else {
                buttonSwitch(false);

                $("#outputBody").text(val.response.body);
            }
        }
    });
}

function btnStop_click() {
    eventFlag = true;

    clearTimeout(repeat);

    repeat = null;

    $("button#btnStop").button("option", "disabled", true);

    $.ajax({
        url: "../cgi?action=stopTroubleShooting&traceroute=",
        type: "GET",
        async: false,
        success: dataBind
    });
}

function buttonSwitch(start) {
    $("button#btnStart").button("option", "disabled", start);
    $("button#btnStop").button("option", "disabled", !start);

    if (start) {
        $("input[name=traceroute]").attr("disabled", "disabled");
    } else {
        $("input[name=traceroute]").removeAttr("disabled");
    }
}

function onResponseError(val) {
    $("div#outputBody").html(valOrDefault(val.response.body, "UNKNOWN ERROR")).css({
        color: "red"
    });

    buttonSwitch(false);
}

function dataBind(val) {
    var output,
        done = false;

    val = val.response.body;

    if (typeof val == "object") {
        if (val.traceroute) {
            output = valOrDefault(val.traceroute.content);
            done = valOrDefault(val.traceroute.finish, false);
        }
    } else {
        output = val;
    }

    if (!UCMGUI.isEmpty(output)) {
        var container = $("div#outputBody"),
            result = $("<div />").html(output.replace(/\n/ig, "<br/>"));

        $(result).addClass("output_load");

        $(result).insertBefore(container);
        // container.append(result);

        $(result).show("blind", {}, 300, function() {
            $(this).switchClass("output_load", "output", 300);

            $(container).animate({
                scrollTop: container.height()
            }, 100);
        });

        if ($("div#outputBody").children().length > 15) {
            var first = container.find("> div:first");

            $(first).hide("blind", {}, 300, function() {
                $(this).remove();
            });
        }
    }

    if (!done) {
        repeat = setTimeout("repeatRequest()", 1000);
    } else {
        buttonSwitch(false);

        $("div#outputBody").append($("<div />").attr("locale", "LANG548").html($P.lang("LANG548")).css({
            color: "green"
        }));

        eventFlag = true;
    }
}

function repeatRequest() {
    $.ajax({
        url: "../cgi?action=getTroubleShooting&traceroute=",
        type: "GET",
        error: onResponseError,
        success: dataBind
    });
}
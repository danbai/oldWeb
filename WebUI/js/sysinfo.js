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
    baseServerURl = config.paths.baseServerURl;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG586"));

    // top.dialog.dialogMessage({
    //     type: 'loading',
    //     content: $P.lang("LANG960")
    // });

    $.ajax({
        url: "../cgi?action=getSystemGeneralStatus",
        type: "GET",
        dataType: "json",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                UCMGUI.domFunction.updateDocument(data.response, document);

                $.ajax({
                    url: "../cgi?action=getSystemStatus",
                    type: "GET",
                    dataType: "json",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.clearDialog();
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: errorThrown
                        });
                    },
                    success: function(data) {
                        // top.dialog.clearDialog();
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            UCMGUI.domFunction.updateDocument(data.response, document);

                            var upTime = data.response["up-time"],
                                idleTime = data.response["idle-time"];

                            convertToTime(upTime, $("#up-time")[0]);
                            convertToTime(idleTime, $("#idle-time")[0]);
                        }

                        $P.lang(doc, true);

                        // top.Custom.init(doc);
                    }
                });
            }
        }
    });
});

function convertToTime(second, element) {
    var days,
        vtime = "";

    element = $(element);

    if (!isNaN(second)) {
        // return (new Date).clearTime().addSeconds(second).toString('HH:mm:ss');
        var time = '';

        if (second >= 24 * 3600) {
            days = parseInt(second / (24 * 3600));
            time += days + $P.lang("LANG2392") + " ";
            second %= (24 * 3600);
        }

        if (second >= 3600) {
            var tmp = parseInt(second / 3600);

            time += (((tmp < 10) ? "0" + tmp : tmp) + ":");
            vtime += (((tmp < 10) ? "0" + tmp : tmp) + ":");
            second %= 3600;
        } else {
            time += "00:";
            vtime += "00:";
        }

        if (second >= 60) {
            var tmp = parseInt(second / 60);

            time += (((tmp < 10) ? "0" + tmp : tmp) + ":");
            vtime += (((tmp < 10) ? "0" + tmp : tmp) + ":");
            second %= 60;
        } else {
            time += "00:";
            vtime += "00:";
        }

        if (second > 0) {
            var tmp = parseInt(second);

            time += (tmp < 10) ? "0" + tmp : tmp;
            vtime += (tmp < 10) ? "0" + tmp : tmp;
        } else {
            time += "00";
            vtime += "00";
        }

        if (days) {
            element.attr('locale', "LANG2406 '" + days + "' '" + vtime + "'");
        } else {
            element.html(vtime);
        }
    } else {
        element.html(second);
    }
}
/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2502"));

    top.Custom.init(document);
});

var set_time = function() {
    var time2set = $('#setsystime').val();

    setTimeout(function() {
        $.ajax({
            type: 'post',
            url: "../cgi?",
            data: 'action=setTimeManual&setTime=' + time2set,
            async: false,
            success: function(data) {
                top.dialog.clearDialog();

                var result = data.status;

                if (result == "0") {
                    top.dialog.dialogMessage({
                        type: "success",
                        content: $P.lang("LANG3481"),
                        callback: function() {
                            UCMGUI.logoutFunction.doLogout();
                        }
                    });
                } else {
                    top.dialog.dialogMessage({
                        type: "error",
                        content: $P.lang("LANG909")
                    });
                }
            },
            error: function(data) {
                top.dialog.dialogMessage({
                    type: "error",
                    content: data
                });
            }
        });
    }, 500);
};

window.onload = function() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "setsystime": {
                required: true,
                customCallback: [$P.lang("LANG2503"),
                    function(val, ele) {
                        // 2008-05-23 01:01:01
                        return val.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
                    }
                ],
                customCallback1: [$P.lang("LANG2504"),
                    function(val, ele) {
                        var arr = val.split(' '),
                            yymmdd = arr[0].split('-'),
                            hhmiss = arr[1].split(':');

                        do {
                            if (parseInt(yymmdd[1], 10) > 12 || parseInt(yymmdd[1], 10) < 1) {
                                break;
                            }

                            if (parseInt(yymmdd[2], 10) > 31 || parseInt(yymmdd[2], 10) < 1) {
                                break;
                            }

                            if (parseInt(hhmiss[0], 10) > 23 || parseInt(hhmiss[0], 10) < 0) {
                                break;
                            }

                            if (parseInt(hhmiss[1], 10) > 59 || parseInt(hhmiss[1], 10) < 0) {
                                break;
                            }

                            if (parseInt(hhmiss[2], 10) > 59 || parseInt(hhmiss[2], 10) < 0) {
                                break;
                            }

                            return true;

                        } while (0);

                        return false;
                    }
                ],
                customCallback2: [$P.lang("LANG3166"),
                    function(val, ele) {
                        var arr = val.split(' '),
                            yymmdd = arr[0].split('-');

                        if (parseInt(yymmdd[0], 10) < 1970 || parseInt(yymmdd[0], 10) > 2037) {
                            return false;
                        }

                        return true;
                    }
                ]
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG904")
            });

            set_time();
        }
    });
}

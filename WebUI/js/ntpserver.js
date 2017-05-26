/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    save_click = false,
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2491"));

    check_ntp_status();

    $("#save").on("click", save_configs);

    top.Custom.init(document);
});

var ntpd_service = function() {
    if ($("#enable_ntpserver").is(":checked")) {
        var tmp_cmd = "action=startNTPServer&startNTP=&_location=ntpserver";
    } else {
        var tmp_cmd = "action=stopNTPServer&stopNTP=&_location=ntpserver";
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: tmp_cmd,
        error: error_cb,
        success: function() {
            check_ntp_status(); 
        }
    });
};

var check_ntp_status = function() {
    var tmp_cmd = "action=checkNTPServerStatus&NTPStatus=";

    var cb = function(output) {
        var bool = UCMGUI.errorHandler(output);

        if (bool) {
            var service_status = "";

            if (output.response && output.response.NTPStatus) {
                service_status = output.response.NTPStatus;     
            }

            if (service_status == "on") {
                $("#enable_ntpserver")[0].checked = true;
            } else if (service_status == "off") {
                $("#enable_ntpserver")[0].checked = false;
            }

            if (save_click) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG844")
                });

                save_click = false;
            }
        }
    };
    
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: tmp_cmd,
        error: error_cb,
        success: cb
    });
};

var save_configs = function() {
    save_click = true;

    ntpd_service();
};

function error_cb(jqXHR, textStatus, errorThrown) {
    // top.dialog.dialogMessage({
    //     type: 'error',
    //     content: errorThrown
    // });
}
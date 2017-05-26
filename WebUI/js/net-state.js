/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4010"));

    $("#toTop").scrollToTop(500);

    $.ajax({
        url: "../cgi?action=getNetCmd&netstat=",
        type: "GET",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var str = "";
                data = data.response.body.netstat;
                for (var i = 0; i < data.length; i++) {
                    var dataStr = data[i].replace(/\s+$/, ""); 
                    if (dataStr.indexOf("RefCnt") > -1) {
                        str += '<div class="section-title">Active Unix Domain Sockets (Servers And Established)</div>';
                    }
                    if (dataStr.indexOf("Proto") > -1) {
                        str += '<p class="special_row">';
                    }
                    else {
                       str += '<p>'; 
                    }
                    var ele = dataStr.replace(/\[\s+/g, "[").replace(/\s+\]/g, "]").split(/\s+/); 
                    for (var j = 0; j < ele.length; j++) {
                        if (ele[j] == "NULL") {
                            ele[j] = "";
                        }
                        str += '<span class="row' + j +'">' + ele[j] + '</span>';
                    }
                    str += '</p>';
                }
                $("#section_content").html(str);
            }
        }
    });
});


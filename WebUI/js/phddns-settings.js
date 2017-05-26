/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4039"));

    $("#toTop").scrollToTop(1000);

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "szHost": {
                // required: true,
                // digits: true,
                // range: [0, 23]
            },
            "szUserID": {
                required: true,
                // digits: true,
                // range: [1, 30]
            },
            "szUserPWD": {
                required: true,
                // digits: true,
                // range: [0, 23]
            },
            "nicName": {
                required: true,
                // digits: true,
                // range: [1, 30]
            }
        },
        submitHandler: function() {
            save_changes();
        }
    });


    PHDDNS_FIELDS = ['szHost', 'szUserID', 'szUserPWD', 'nicName'];

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "enable_phddns",
        enableList: PHDDNS_FIELDS
    }, doc);

    if(config.model_info.net_mode == "0"){
        $("<option>")
            .attr({
                value: "eth0",
                locale: "LANG3057" // LAN
            })
            .text($P.lang($P.lang("LANG3057")))
            .appendTo('#nicName');
        $("<option>")
            .attr({
                value: "eth1",
                locale: "LANG3058" // WAN
            })
            .text($P.lang($P.lang("LANG3058")))
            .appendTo('#nicName');
    } else if(config.model_info.net_mode == "1"){
        $("<option>")
            .attr({
                value: "eth0",
                locale: "LANG3057" // LAN
            })
            .text($P.lang($P.lang("LANG3057")))
            .appendTo('#nicName');
    } else if(config.model_info.net_mode == "2"){
        $("<option>")
            .attr({
                value: "eth0",
                locale: "LANG3059" // LAN1
            })
            .text($P.lang($P.lang("LANG3059")))
            .appendTo('#nicName');
        $("<option>")
            .attr({
                value: "eth1",
                locale: "LANG3060" // LAN2
            })
            .text($P.lang($P.lang("LANG3060")))
            .appendTo('#nicName');
    }

    $.ajax({
        type: "GET",
        url: "/cgi?action=getPhddns",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: load_default
    });
});

function load_default(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var enablePhddns = (data.response.phddns_settings.enable_phddns == "yes");

        $("#szHost").val(data.response.phddns_settings.szHost);
        $("#szUserID").val(data.response.phddns_settings.szUserID);
        $("#szUserPWD").val(data.response.phddns_settings.szUserPWD);
        $("#nicName").val(data.response.phddns_settings.nicName);
        $("#enable_phddns")[0].checked = enablePhddns;

        $("#szHost").attr("disabled", !enablePhddns);
        $("#szUserID").attr("disabled", !enablePhddns);
        $("#szUserPWD").attr("disabled", !enablePhddns);
        $("#nicName").attr("disabled", !enablePhddns);

        top.Custom.init(document);
    }
}

function save_changes(){
    var enable_phddns = "no",
        szHost = $("#szHost").val(),
        szUserID = $("#szUserID").val(),
        szUserPWD = $("#szUserPWD").val(),
        nicName = $("#nicName").val();

    if ($("#enable_phddns")[0].checked){
        enable_phddns = "yes";
    }

    $.ajax({
        type: "POST",
        url: "../cgi",
        data: {
            'action': 'stopDdns',
            'type': 'phddns'
        },
        error : function(jqXHR, textStatus, errorThrown) {},
        success : function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                $.ajax({
                    type: "POST",
                    url: "../cgi",
                    data: {
                        'action': "confPhddns",
                        'enable_phddns': enable_phddns,
                        'szHost': szHost,
                        'szUserID': szUserID,
                        'szUserPWD': szUserPWD,
                        'nicName': nicName
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            if (enable_phddns == "yes") {
                                $.ajax({
                                    type: "POST",
                                    url: "../cgi",
                                    data: {
                                        'action': 'startDdns',
                                        'type': 'phddns'
                                    },
                                    error : function(jqXHR, textStatus, errorThrown) {},
                                    success : function(data) {
                                        var bool = UCMGUI.errorHandler(data);

                                        if (bool) {
                                            top.dialog.dialogMessage({
                                                type: 'success',
                                                content: $P.lang("LANG844")
                                            });
                                        }
                                    }
                                });
                            } else if (enable_phddns == "no") {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG844")
                                });
                            }
                        }
                    }
                });
            }
        }
    });
}
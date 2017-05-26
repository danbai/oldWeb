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

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4040"));

    $("#toTop").scrollToTop(1000);

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    bindEvent();

    $P("#form", document).validate({
        rules: {
            "dyndns_system": {
                // required: true,
                // digits: true,
                // range: [0, 23]
            },
            "username": {
                required: true,
                // digits: true,
                // range: [1, 30]
            },
            "password": {
                required: true,
                // digits: true,
                // range: [0, 23]
            },
            "alias": {
                required: true,
                // digits: true,
                // range: [1, 30]
            }
        },
        submitHandler: function() {
            save_changes();
        }
    });


    PHDDNS_FIELDS = ['dyndns_system', 'username', 'password', 'alias', 'hash'];

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "enable_inadyn",
        enableList: PHDDNS_FIELDS
    }, doc);

    $.ajax({
        type: "GET",
        url: "/cgi?action=getInadyn",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: load_default
    });
});


function bindEvent() {
    if ($("#dyndns_system").val() == "freedns.afraid.org") {
        $(".hash_class").show();
    } else {
        $(".hash_class").hide();
    }

    $('#dyndns_system').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "freedns.afraid.org") {
            $(".hash_class").show();
        } else {
            $(".hash_class").hide();
        }
    });
}

function load_default(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var enableInadyn = (data.response.inadyn_settings.enable_inadyn == "yes");

        $("#dyndns_system").val(data.response.inadyn_settings.dyndns_system);
        $("#username").val(data.response.inadyn_settings.username);
        $("#password").val(data.response.inadyn_settings.password);
        $("#alias").val(data.response.inadyn_settings.alias);
        $("#hash").val(data.response.inadyn_settings['hash']);
        $("#enable_inadyn")[0].checked = enableInadyn;

        $("#dyndns_system").attr("disabled", !enableInadyn);
        $("#username").attr("disabled", !enableInadyn);
        $("#password").attr("disabled", !enableInadyn);
        $("#hash").attr("disabled", !enableInadyn).val(data.response.inadyn_settings.hash);
        $("#alias").attr("disabled", !enableInadyn);

        if ($("#dyndns_system").val() == "freedns.afraid.org") {
            $(".hash_class").show();
        } else {
            $(".hash_class").hide();
        }

        top.Custom.init(document);
    }
}

function save_changes(){
    var enable_inadyn = "no";

    if ($("#enable_inadyn")[0].checked){
        enable_inadyn = "yes";
    }

    action = UCMGUI.formSerializeVal(document);

    action["action"] = "confInadyn";

    $.ajax({
        type: "POST",
        url: "../cgi",
        data: {
            'action': 'stopDdns',
            'type': 'inadyn'
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                $.ajax({
                    type: "POST",
                    url: "../cgi",
                    data: action,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            if (enable_inadyn == "yes") {
                                $.ajax({
                                    type: "POST",
                                    url: "../cgi",
                                    data: {
                                        'action': 'startDdns',
                                        'type': 'inadyn'
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
                            } else if (enable_inadyn == "no") {
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
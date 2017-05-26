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
    oldDom = "",
    enablePhddns = "no",
    enableInadyn = "no",
    action_inadyn = {},
    action_phddns = {};

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
                keyboradNoSpace: true
                // digits: true,
                // range: [1, 30]
            },
            "password": {
                required: true
                // digits: true,
                // range: [0, 23]
            },
            "alias": {
                required: true
                // digits: true,
                // range: [1, 30]
            },
            "hash": {
                required: true
            },
            "szHost": {
                // required: true,
                // digits: true,
                // range: [0, 23]
            },
            "szUserID": {
                required: true
                // digits: true,
                // range: [1, 30]
            },
            "szUserPWD": {
                required: true
                // digits: true,
                // range: [0, 23]
            },
            "nicName": {
                required: true
                // digits: true,
                // range: [1, 30]
            }
        },
        submitHandler: function() {
            var newDom = getDomStr();

            if (oldDom === newDom) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG4140")
                });
            } else {
                save_changes();
            }

            oldDom = newDom;
        }
    });

    INADYN_FIELDS = ['username', 'password', 'alias', 'hash'];
    PHDDNS_FIELDS = ['szHost', 'szUserID', 'szUserPWD', 'nicName'];

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "enable_inadyn",
        enableList: INADYN_FIELDS
    }, doc);

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "enable_phddns",
        enableList: PHDDNS_FIELDS
    }, doc);

    if (config.model_info.net_mode == "0") {
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
    } else if (config.model_info.net_mode == "1") {
        $("<option>")
            .attr({
                value: "eth0",
                locale: "LANG3057" // LAN
            })
            .text($P.lang($P.lang("LANG3057")))
            .appendTo('#nicName');
    } else if (config.model_info.net_mode == "2") {
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
        url: "/cgi?action=getInadyn",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: load_inadyn
    });

    $.ajax({
        type: "GET",
        url: "/cgi?action=getPhddns",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: load_phddns
    });

    load_default();

    oldDom = getDomStr();
});

function getDomStr() {
    var domStr = "",
        dom = $("input, select");

    dom.each(function() {
        if (this.type == 'checkbox') {
            domStr += (this.checked ? "yes" : "no");
        } else {
            domStr += this.value;
        }
    });

    return domStr;
}

function load_inadyn(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var enable_inadyn = (data.response.inadyn_settings.enable_inadyn == "yes");

        $("#dyndns_system").val(data.response.inadyn_settings.dyndns_system);
        $("#username").val(data.response.inadyn_settings.username);
        $("#password").val(data.response.inadyn_settings.password);
        $("#alias").val(data.response.inadyn_settings.alias);
        $("#hash").val(data.response.inadyn_settings['hash']);
        $("#enable_inadyn")[0].checked = enable_inadyn;
    }
}

function load_phddns(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var enable_phddns = (data.response.phddns_settings.enable_phddns == "yes");
        // tmp_enablePhddns = enablePhddns ? 'yes' : 'no';

        $("#szHost").val(data.response.phddns_settings.szHost);
        $("#szUserID").val(data.response.phddns_settings.szUserID);
        $("#szUserPWD").val(data.response.phddns_settings.szUserPWD);
        $("#nicName").val(data.response.phddns_settings.nicName);
        $("#enable_phddns")[0].checked = enable_phddns;
    }
}

function load_default() {
    var system_ddns = $("#dyndns_system").val();

    if (system_ddns == "oray.net" || !system_ddns) {
        $("#dyndns_system").val("oray.net");
        $(".phddns_class").show();
        $(".inadyn_class").hide();
        $(".hash_class").hide();

        if ($("#enable_phddns")[0].checked) {
            $("#enable_inadyn")[0].checked = true;
        } else {
            $("#enable_inadyn")[0].checked = false;
        }

        phddns_disable();
    } else {
        $(".inadyn_class").show();
        $(".phddns_class").hide();

        if ($("#enable_inadyn")[0].checked) {
            $("#enable_phddns")[0].checked = true;
        } else {
            $("#enable_phddns")[0].checked = false;
        }

        inadyn_disable();

        if ($("#dyndns_system").val() == "freedns.afraid.org") {
            $(".hash_class").show();
        } else {
            $(".hash_class").hide();
        }
    }

    top.Custom.init(document);
}

function phddns_disable() {
    $("#szHost").attr("disabled", !$("#enable_phddns")[0].checked);
    $("#szUserID").attr("disabled", !$("#enable_phddns")[0].checked);
    $("#szUserPWD").attr("disabled", !$("#enable_phddns")[0].checked);
    $("#nicName").attr("disabled", !$("#enable_phddns")[0].checked);
}

function inadyn_disable() {
    $("#username").attr("disabled", !$("#enable_inadyn")[0].checked);
    $("#password").attr("disabled", !$("#enable_inadyn")[0].checked);
    $("#hash").attr("disabled", !$("#enable_inadyn")[0].checked);
    $("#alias").attr("disabled", !$("#enable_inadyn")[0].checked);
}

function bindEvent() {
    if ($("#dyndns_system").val() == "oray.net") {
        $(".phddns_class").show();
        $(".inadyn_class").hide();
        $(".hash_class").hide();

        phddns_disable();
    } else {
        $(".inadyn_class").show();
        $(".phddns_class").hide();

        inadyn_disable();

        if ($("#dyndns_system").val() == "freedns.afraid.org") {
            $(".hash_class").show();
        } else {
            $(".hash_class").hide();
        }
    }

    $('#dyndns_system').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "oray.net") {
            $(".phddns_class").show();
            $(".inadyn_class").hide();
            $(".hash_class").hide();

            phddns_disable();
        } else {
            $(".inadyn_class").show();
            $(".phddns_class").hide();

            inadyn_disable();

            if (value == "freedns.afraid.org") {
                $(".hash_class").show();
            } else {
                $(".hash_class").hide();
            }
        }

        top.Custom.init(document);
    });

    $('#enable_inadyn').bind("click", function(ev) {
        if ($("#enable_inadyn")[0].checked == true) {
            $("#enable_phddns")[0].checked = true;
        } else {
            $("#enable_phddns")[0].checked = false;
        }

        inadyn_disable();

        top.Custom.init(document);
    });

    $('#enable_phddns').bind("click", function(ev) {
        if ($("#enable_phddns")[0].checked == true) {
            $("#enable_inadyn")[0].checked = true;
        } else {
            $("#enable_inadyn")[0].checked = false;
        }

        phddns_disable();

        top.Custom.init(document);
    });

    // top.Custom.init(document);
}

function save_changes() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG905")
    });

    action_inadyn["username"] = $("#username").val();
    action_inadyn["password"] = $("#password").val();
    action_inadyn["dyndns_system"] = $("#dyndns_system").val();
    action_inadyn["alias"] = $("#alias").val();

    if ($("#dyndns_system").val() == "freedns.afraid.org") {
        action_inadyn["hash"] = $("#hash").val();
    } else {
        action_inadyn["hash"] = "";
    }

    action_phddns["szHost"] = $("#szHost").val();
    action_phddns["szUserID"] = $("#szUserID").val();
    action_phddns["szUserPWD"] = $("#szUserPWD").val();
    // action_phddns["nicName"] = $("#nicName").val();
    action_phddns["conffile"] = "";

    enableInadyn = "no";
    if ($("#enable_inadyn")[0].checked && !$("#enable_inadyn").is(":hidden")) {
        enableInadyn = "yes";
    }

    enablePhddns = "no";
    if ($("#enable_phddns")[0].checked && !$("#enable_phddns").is(":hidden")) {
        enablePhddns = "yes";
    }

    action_inadyn["action"] = "confInadyn";
    action_inadyn["enable_inadyn"] = enableInadyn;

    action_phddns["action"] = "confPhddns";
    action_phddns["enable_phddns"] = enablePhddns;

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
                    data: action_inadyn,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            if (enableInadyn == "yes") {
                                $.ajax({
                                    type: "POST",
                                    url: "../cgi",
                                    data: {
                                        'action': 'startDdns',
                                        'type': 'inadyn'
                                    },
                                    error: function(jqXHR, textStatus, errorThrown) {},
                                    success: function(data) {
                                        var bool = UCMGUI.errorHandler(data);

                                        if (bool) {
                                            // top.dialog.dialogMessage({
                                            //     type: 'success',
                                            //     content: $P.lang("LANG844")
                                            // });

                                            phddns_setting();
                                        }
                                    }
                                });
                            } else if (enableInadyn == "no") {
                                // top.dialog.dialogMessage({
                                //     type: 'success',
                                //     content: $P.lang("LANG844")
                                // });

                                phddns_setting();
                            }
                        }
                    }
                });
            }
        }
    });
}

function phddns_setting() {
    $.ajax({
        type: "POST",
        url: "../cgi",
        data: {
            'action': 'stopDdns',
            'type': 'phddns'
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                $.ajax({
                    type: "POST",
                    url: "../cgi",
                    data: action_phddns,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            if (enablePhddns == "yes") {
                                $.ajax({
                                    type: "POST",
                                    url: "../cgi",
                                    data: {
                                        'action': 'startDdns',
                                        'type': 'phddns'
                                    },
                                    error: function(jqXHR, textStatus, errorThrown) {},
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
                            } else if (enablePhddns == "no") {
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

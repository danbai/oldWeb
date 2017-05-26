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
    datetime_names = ["remote_ntp_server", "enable_dhcp_option_42", "time_zone", "enable_dhcp_option_2", "self_defined_time_zone"];

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG718"));

    top.Custom.init(document);
});

window.onload = function() {
    $("[name=time_zone]").change(function() {
        addRule();
    });

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "remote_ntp_server": {
                maxlength: 64,
                host: 'host'
            },
            "self_defined_time_zone": {
                maxlength: 64
            }
        },
        submitHandler: function() {
            save_changes();
        }
    });

    var verparam = datetime_names.join("&");

    $.ajax({
        type: "GET",
        url: "../cgi" + "?action=getTimeSettings&" + verparam,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: getparam_success
    });
};

var addRule = function() {
    if ($("[name=time_zone]").get(0).value === "customize") {
        $("[name=self_defined_time_zone]").removeAttr("disabled").removeClass("disabled");

        $P("[name=self_defined_time_zone]", document).rules("add", {
            required: true
        });
    } else {
        $("[name=self_defined_time_zone]").attr("disabled", "disabled").addClass("disabled");

        $P("[name=self_defined_time_zone]", document).rules("remove", "required");
    }
};

function getparam_success(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var timeSettings = data.response;

        for (var item in timeSettings) {
            if (timeSettings.hasOwnProperty(item)) {
                var elements = $(":input[name=" + item + "]");

                if (elements) {
                    var type = $(elements).attr('type');

                    switch (type) {
                        case "select":
                            $(elements).find("[value='" + timeSettings[item] + "']").attr("selected", "true");

                            if (timeSettings[item] === 'customize') {
                                $('[name=self_defined_time_zone]').removeAttr("disabled").removeClass("disabled");

                                $P("[name=self_defined_time_zone]", document).rules("add", {
                                    required: true
                                });
                            } else {
                                $('[name=self_defined_time_zone]').attr("disabled", "disabled").addClass("disabled");

                                $P("[name=self_defined_time_zone]", document).rules("remove", "required");
                            }

                            break;
                        case "checkbox":
                            if (timeSettings[item] == "1") {
                                $(elements)[0].checked = true;
                            } else {
                                $(elements)[0].checked = false;
                            }

                            break;
                        case "text":
                            $(elements).val(timeSettings[item]);

                            break;
                        default:
                            break;
                    }
                }
            }
        }

        // addRule();
        top.Custom.init(document);
    }
}

function save_changes() {
    if (!$P("#form", document).valid()) {
        return false;
    }

    top.dialog.dialogMessage({
        type: "loading",
        content: $P.lang("LANG905")
    });

    var data = {
        action: "updateTimeSettings"
    };

    datetime_names.each(function(name) {
        var elements = $(":input[name=" + name + "]");

        if (elements) {
            var type = $(elements).attr('type');

            if (type == 'checkbox') {
                var value = '0';

                if (elements.is(":checked")) {
                    value = '1';
                }
            } else if (type == "select") {
                var index = $(elements)[0].selectedIndex,
                    value = $(elements)[0].options[index].value;
            } else {
                var value = elements.val();
            }

            data[name] = value || "";
        }
    });

    $.ajax({
        type: "POST",
        url: "../cgi",
        data: data,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: "error",
                content: $P.lang("LANG861")
            });
        },
        success: function(data) {
            top.dialog.clearDialog();

            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG844") + '<br />' + $P.lang("LANG833"),
                    buttons: {
                        ok: UCMGUI.loginFunction.confirmReboot
                    }
                });
            }
        }
    });
}
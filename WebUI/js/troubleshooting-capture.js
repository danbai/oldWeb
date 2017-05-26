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
    nethdlcEnable = 0,
    SFTPPort = '';

Array.prototype.each = top.Array.prototype.each;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG665"));

    bindEvents();

    initTroubleShooting();

    getNetworkSettings();

    getSFTPPort();

    getTroubleShooting();

    check_device();

    btnDownload_check_state();

    top.Custom.init(document);
});

$(document).bind("keydown", function(ev) {
    if (ev.which == 13) {
        if (eventFlag && !$("button#btnStart").attr("disabled")) {
            btnStart_click();
        }

        ev.stopPropagation();
        return false;
    }
});

function bindEvents() {
    $('#useSftp').bind("click", function(ev) {
        if (this.checked) {
            $('#useSD, #usb, #sd').attr({'disabled': 'disabled'});
        } else {
            $('#useSD').removeAttr('disabled');

            if ($('#useSD').is(':checked')) {
                $('#usb, #sd').removeAttr('disabled');
            } else {
                $('#usb, #sd').attr({'disabled': 'disabled'});
            }
        }

        top.Custom.init(doc, $('#storage')[0]);

        ev.stopPropagation();
    });

    $('#useSD').bind("click", function(ev) {
        if (this.checked) {
            $('#useSftp').attr({'disabled': 'disabled'});
            $('#usb, #sd').removeAttr('disabled');
        } else {
            $('#useSftp').removeAttr('disabled');

            $('#usb, #sd').attr({'disabled': 'disabled'});

            if ($('input[name="device"]:checked').length) {
                $('input[name="device"]:checked')[0].checked = false;
            }
        }

        top.Custom.init(document, $("useSftp")[0]);
        top.Custom.init(doc, $('#storage')[0]);

        ev.stopPropagation();
    });
}

function btnStart_click() {
    var useSftp = ($("#useSftp").is(':checked') ? 'yes' : 'no'),
        capture = $("[name=capture]").val(),
        filter = $("[name=capture-filter]").val(),
        device = $('input[name="device"]:checked').val(),
        useSD = $("#useSD"),
        data = {
            "action": "startTroubleShooting",
            "capture": capture,
            "useSftp": useSftp
        };

    if (useSD.is(':checked')) {
        if ($('#usb_cell').is(':hidden') && $('#sd_cell').is(':hidden')) {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG5090").format($P.lang('LANG5088').toLowerCase())
            });

            return false;
        } else if (!device) {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG5089").format($P.lang('LANG5088').toLowerCase())
            });

            return false;
        } else {
            data['useSD'] = device;
        }
    }

    eventFlag = false;

    top.dialog.dialogMessage({
        type: "loading",
        title: 'loading',
        content: $P.lang("LANG905")
    });

    $("button#btnDownload").button("option", "disabled", true);
    $("button#btnStart").button("option", "disabled", true);
    $("div#outputBody").empty();

    if (useSftp === 'yes') {
        data['capture-filter'] = filter ?
            (filter + ' && port !' + SFTPPort) :
            ('port !' + SFTPPort);
    } else {
        data['capture-filter'] = filter;
    }

    $.ajax({
        url: "../cgi",
        type: "POST",
        data: data,
        error: function(val) {
            var msg = "";

            msg += valOrDefault(val.response.body, "UNKNOWN ERROR") + "<br/>";
            msg += valOrDefault(val.response.detail, "");

            $("div#outputBody").html(msg).css({
                color: "red"
            });

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(val) {
            var bool = UCMGUI.errorHandler(val);

            if (bool) {
                top.dialog.clearDialog();

                dataBind(val);
            } else {
                buttonSwitch(false);

                $("#outputBody").text(val.response.body);
            }
        }
    });
}

function btnStop_click() {
    var txt = $P.lang("LANG3247");

    top.dialog.dialogMessage({
        type: "loading",
        title: txt,
        content: txt
    });

    eventFlag = true;

    $("button#btnStop").button("option", "disabled", true);

    clearTimeout(repeat);

    repeat = null;

    $.ajax({
        url: "../cgi?action=stopTroubleShooting&capture=",
        type: "GET",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(val) {
            top.dialog.clearDialog();

            dataBind(val);
        }
    });
}

function btnDownload_click() {
    window.open("../cgi?action=downloadFile&type=troubleshooting", '_self');
}

function buttonSwitch(start) {
    $("button#btnStart").button("option", "disabled", start);
    $("button#btnStop").button("option", "disabled", !start);

    if (start) {
        $("[name=capture], [name=capture-filter], #useSftp, #useSD, #usb, #sd").attr("disabled", "disabled");
    } else {
        $("[name=capture], [name=capture-filter], #useSftp").removeAttr("disabled");

        if ($("#useSftp").is(':checked')) {
            $("#useSftp").removeAttr("disabled");
            $("#useSD, #usb, #sd").attr("disabled", "disabled");
        } else if ($("#useSD").is(':checked')) {
            $("#useSftp").attr("disabled", "disabled");
            $("#useSD, #usb, #sd").removeAttr("disabled");
        } else {
            $("#useSftp, #useSD").removeAttr("disabled");
            $("#usb, #sd").attr("disabled", "disabled");
        }
    }

    top.Custom.init(document, $("[name=capture]")[0]);
    top.Custom.init(document, $("useSftp")[0]);
    top.Custom.init(document, $("storage")[0]);

    btnDownload_check_state();
}

function btnDownload_check_state() {
    $.ajax({
        type: "GET",
        dataType: "json",
        async: false,
        url: "../cgi?action=checkFile&type=troubleshooting",
        success: function(data) {
            if (data != undefined && data.status != undefined && data.status == "0" && data.response.result == "0") {
                $("button#btnDownload").button("option", "disabled", false);
                $("div#outputBody").empty();
                $("div#outputBody").append($("<div />").attr("locale", "LANG1581").html($P.lang("LANG1581")).css({
                    color: "green"
                }));
            } else {
                $("button#btnDownload").button("option", "disabled", true);
            }
        }
    });
}

function check_device() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            "action": 'getInterfaceStatus',
            "auto-refresh": Math.random()
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var sdcard_info = data.response['interface-sdcard'],
                    usbdisk_info = data.response['interface-usbdisk'];

                if (usbdisk_info == "true") {
                    $("#usb_cell").show();
                } else {
                    $("#usb_cell").hide();
                }

                if (sdcard_info == "true") {
                    $("#sd_cell").show();
                } else {
                    $("#sd_cell").hide();
                }
            }
        }
    });

    setTimeout(check_device, 5000);
}

function dataBind(val) {
    var done = false,
        output, locale;

    val = val.response.body;

    buttonSwitch(true);

    if (typeof val == "object") {
        if (val.capture) {
            output = valOrDefault(val.capture.content);
            done = valOrDefault(val.capture.finish, false);
        }
    } else {
        output = val;
    }

    if (!UCMGUI.isEmpty(output)) {
        var container = $("div#outputBody"),
            result = $("<div />").html(output.replace(/\n/ig, "<br/>"));

        $(result).addClass("output_load");

        container.append(result);

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

    if (done) {
        buttonSwitch(false);

        locale = "LANG1581";

        if ($('#useSftp').is(':checked')) {
            locale = "LANG2330";
        } else if ($('#useSD').is(':checked')) {
            locale = "LANG1365";
        }

        $("div#outputBody").empty();
        $("div#outputBody").append($("<div />").attr("locale", locale).html($P.lang(locale)).css({
            color: "green"
        }));
    } else {
        locale = "LANG1582";

        $("div#outputBody").append($("<div />").attr("locale", locale).html($P.lang(locale)).css({
            color: "black"
        }));
    }
}

function getNetworkSettings() {
    $.ajax({
        url: "../cgi?",
        type: "POST",
        data: "action=getNetworkSettings",
        async: true,
        success: processNetHDLCInterface
    });
}

function getSFTPPort() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getDisabledPortList"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var port = data.response.Psftp_port;

                SFTPPort = (port ? port : '22');
            }
        }
    });
}

function getTroubleShooting() {
    $.ajax({
        url: "../cgi?",
        type: "POST",
        data: "action=getTroubleShooting&shooting-state=",
        async: false,
        error: function(val) {
            buttonSwitch(false); // assume haven't started 
        },
        success: function(val) {
            if (typeof val == "object") {
                var capture = val.response.body.capture,
                    useSD = val.response.body.useSD;

                if (useSD) {
                    $('#useSD').trigger('click');
                    $('#' + useSD)[0].checked = true;
                }

                if (capture) {
                    var item = capture,
                        valCap = valOrDefault(item.interface, ""),
                        valFilter = valOrDefault(item.param, "");

                    // NOTE: because return is NONE, we need to make sure NONE won't insert to fields
                    if (valCap != "none") {
                        $("[name=capture]").val(valCap);
                    }

                    if (valFilter != "none") {
                        $("[name=capture-filter]").val(valFilter);
                    }

                    if ((valFilter.indexOf('port !' + SFTPPort) > -1) && !useSD) {
                        $('#useSftp').trigger('click');
                    }

                    $("div#outputBody").append($("<div />").attr("locale", "LANG1582").html($P.lang("LANG1582")));

                    buttonSwitch(true);

                    return;
                }
            }

            buttonSwitch(false);
        }
    });
}

function initTroubleShooting() {
    updateModelInfo();

    if (config.model_info.net_mode === "0") {
        $("[name=capture]").children().eq(3).remove();
        $("[name=capture]").children().eq(2).remove();
    } else if (config.model_info.net_mode === "2") {
        $("[name=capture]").children().eq(1).remove();
        $("[name=capture]").children().eq(0).remove();
    } else {
        $("[name=capture]").children().eq(3).remove();
        $("[name=capture]").children().eq(2).remove();
        $("[name=capture]").children().eq(0).remove();
    }

    if (config.model_info.vpn === '1') {
        $("[name=capture]").append('<option value="VPN">VPN</option>');
    }

    if (config.model_info.webrtcvpn === '1') {
        $("[name=capture]").append('<option value="WebRTC VPN">WebRTC VPN</option>');
    }

    if (Number(config.model_info.num_pri) >= 1) {
        $("[name=capture]").append('<option value="HB" locale="LANG3071">' + $P.lang("LANG3071") + '</option>');
    }

    $("button#btnStart").button({
        icons: {
            primary: "ui-icon-play"
        },
        disabled: true
    });

    $("button#btnStop").button({
        icons: {
            primary: "ui-icon-stop"
        },
        disabled: true
    });

    $("button#btnDownload").button({
        icons: {
            primary: "ui-icon-disk"
        },
        disabled: true
    });
}

function processNetHDLCInterface(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var netSettings = data.response.network_settings;

        nethdlcEnable = netSettings["hdlc0_enable"];
    }

    if (nethdlcEnable == 0) {
        /* Remove the NetHDLC which is the last one */
        $("[name=capture]").find('[value="NetHDLC 1"]').remove();
    }
}

function valOrDefault(val, def) {
    return val == undefined || val == null ? def : val;
}

function updateModelInfo() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            action: 'getInfo'
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            if (data.status === 0) {
                var model_info = data.response;

                config.model_info.net_mode = model_info.net_mode;
                config.model_info.vpn = model_info.enable_openvpn;
                config.model_info.webrtcvpn = model_info.enable_webrtc_openvpn;
            }
        }
    });
}
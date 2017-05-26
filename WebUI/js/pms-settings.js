/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2016 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    // extensionPrefSettings = UCMGUI.isExist.getRange(), // [disable_extension_ranges, rand_password, weak_password]
    selectbox = UCMGUI.domFunction.selectbox,
    ifExisted = UCMGUI.inArray,
    ivrNameArr = [{
        val: "wakeup-call"
    }],
    openPort,
    oldPort;

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
String.prototype.format = top.String.prototype.format;
String.prototype.endsWith = top.String.prototype.endsWith;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2217"));

    bindEvents();

    initValidator();

    getCustomPrompt();

    getPMSSettings();

    getOpenPort();

    getCDRAPIPort();

    getWebrtcPort();

    // isEnableWeakPw();

    top.Custom.init(doc);
});

function bindEvents() {
    // UCMGUI.domFunction.enableCheckBox({
    //     enableCheckBox: 'pms_enable',
    //     enableList: ['pms_protocol', 'wakeup_prompt', 'pms_addr', 'ucm_port', 'username', 'password']
    // }, doc);

    $('#pms_protocol').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "hmobile") {
            $(".hmobile, .null").show();
        } else if (value == "mitel") {
            $(".hmobile").hide();
            $(".null").show();
        } else {
            $(".hmobile, .null").hide();
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });
}

function checkOpenPort(value, element) {
    var val = value,
        ele;

    if (val == oldPort) {
        return true;
    }

    for (var i = 0; i < openPort.length; i++) {
        ele = openPort[i];

        if (val == ele) {
            return false;
        }
    }

    return true;
}

function getCDRAPIPort() {
    $.ajax({
        url: "../cgi?action=getCDRAPISettings",
        type: "GET",
        async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var tlsbindaddr = data.response.http_settings.tlsbindaddr,
                    tlsPort = tlsbindaddr.split(":")[1];

                if (tlsPort && !ifExisted(tlsPort, openPort)) {
                    openPort.push(tlsPort);
                }
            }
        }
    });
}

function getCustomPrompt() {
    var action = {
        "action": "listFile",
        "type": "ivr",
        "filter": JSON.stringify({
            "list_dir": 0,
            "list_file": 1,
            "file_suffix": ["mp3", "wav", "gsm", "ulaw", "alaw"]
        }),
        "sidx": "n",
        "sord": "desc"
    };

    $.ajax({
        type: "post",
        url: "/cgi",
        async: false,
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
                var res = data.response;

                if (res) {
                    var ivr = res.ivr;

                    for (var i = 0; i < ivr.length; i++) {
                        var name = ivr[i]["n"],
                            obj = {
                                text: name,
                                val: "record/" + removeSuffix(name)
                            };

                        ivrNameArr.push(obj);
                    }
                }
            }
        }
    });

    selectbox.appendOpts({
        el: "wakeup_prompt",
        opts: ivrNameArr
    }, doc);
}

function getOpenPort() {
    openPort = ["22"];

    $.ajax({
        url: "../cgi?action=getNetstatInfo",
        type: "GET",
        async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var netstat = data.response.netstat,
                    currentPort = '';

                for (var i = 0, length = netstat.length; i < length; i++) {
                    currentPort = netstat[i]['port'];

                    if (!ifExisted(currentPort, openPort)) {
                        openPort.push(currentPort);
                    }
                }
            }
        }
    });

    $.ajax({
        url: "../cgi?action=getSIPTCPSettings",
        type: "GET",
        async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var tlsbindaddr = data.response.sip_tcp_settings.tlsbindaddr,
                    tcpbindaddr = data.response.sip_tcp_settings.tcpbindaddr;

                if (tlsbindaddr) {
                    var tlsPort = tlsbindaddr.split(":")[1];

                    if (tlsPort && !ifExisted(tlsPort, openPort)) {
                        openPort.push(tlsPort);
                    }
                }

                if (tcpbindaddr) {
                    var tcpPort = tcpbindaddr.split(":")[1];

                    if (tcpPort && !ifExisted(tcpPort, openPort)) {
                        openPort.push(tcpPort);
                    }
                }
            }
        }
    });
}

function getPMSSettings() {
    var action = {};

    action["action"] = "getPMSSettings";

    $.ajax({
        type: "post",
        url: baseServerURl,
        dataType: "json",
        async: false,
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
                var settings = data.response.pms_settings;

                $('#pms_protocol').val(settings.pms_protocol).trigger('change');

                UCMGUI.domFunction.updateDocument(settings, doc);

                // pmsEnableElement.checked = (pmsEnable === '1' ? true : false);

                // if (pmsEnableElement.updateStatus) {
                //     pmsEnableElement.updateStatus();
                // }

                oldPort = settings.ucm_port;

                // $.ajax({
                //     type: "post",
                //     url: baseServerURl,
                //     dataType: "json",
                //     async: false,
                //     data: {
                //         'action': 'getPMS'
                //     },
                //     error: function(jqXHR, textStatus, errorThrown) {
                //         // top.dialog.dialogMessage({
                //         //     type: 'error',
                //         //     content: errorThrown
                //         // });
                //     },
                //     success: function(data) {
                //         var bool = UCMGUI.errorHandler(data);

                //         if (bool) {
                //             var settings = data.response;

                //             if (settings.start_fastagi === 'yes') {
                //                 $('#start_fastagi')[0].checked = true;
                //             }
                //         }
                //     }
                // });
            }
        }
    });
}

function getWebrtcPort() {
    $.ajax({
        url: "../cgi?action=getSIPWebRTCHttpSettings",
        type: "GET",
        async: false,
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var tlsbindaddr = data.response.webrtc_http_settings.tlsbindaddr,
                    bindport = data.response.webrtc_http_settings.bindport,
                    tlsPort = tlsbindaddr.split(":")[1];
                
                if (tlsPort && !ifExisted(tlsPort, openPort)) {
                    openPort.push(tlsPort);
                }

                if (bindport && !ifExisted(bindport, openPort)) {
                    openPort.push(bindport);
                }
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "pms_addr": {
                required: true,
                host: ['IP or URL']
            },
            // "pms_port": {
            //     required: true,
            //     range: [1, 65535]
            // },
            "ucm_port": {
                required: true,
                range: [1, 65535],
                customCallback: [$P.lang("LANG3869"), checkOpenPort]
            },
            "username": {
                required: true
                // letterDigitUndHyphen: true
            },
            "password": {
                required: true
                // keyboradNoSpacesemicolon: true,
                // minlength: 2
            }
        },
        newValidator: true,
        submitHandler: function(ev) {
            save_changes();
        }
    });
};

function isEnableWeakPw() {
    if (extensionPrefSettings[2] == 'yes') { // weak_password
        var obj = {
            pwsId: "#password",
            doc: doc
        };

        $P("#password", doc).rules("add", {
            checkAlphanumericPw: [UCMGUI.enableWeakPw.showCheckPassword, obj]
        });
    }
}

function link_prompt() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG843").format($P.lang("LANG238")),
        buttons: {
            ok: function() {
                top.frames["frameContainer"].module.jumpMenu('menuprompts_record.html');
            }
        }
    });
}

function removeSuffix(filename) {
    var name = filename.toLocaleLowerCase(),
        file_suffix = [".mp3", ".wav", ".gsm", ".ulaw", ".alaw"];

    for (var i = 0; i < file_suffix.length; i++) {
        var num = name.lastIndexOf(file_suffix[i]);

        if (num != -1 && name.endsWith(file_suffix[i])) {
            filename = filename.substring(0, num);

            return filename;
        }
    }
}

function save_changes() {
    var action = {};

    action = UCMGUI.formSerializeVal(doc, undefined, undefined, true); // Get Disabled Value.

    action["action"] = "updatePMSSettings";
    action["pms_enable"] = action["pms_protocol"] ? '1' : '0';

    $.ajax({
        type: "post",
        url: baseServerURl,
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
                // $.ajax({
                //     type: "post",
                //     url: baseServerURl,
                //     dataType: "json",
                //     data: {
                //         'action': 'setPMS',
                //         'start_fastagi': ($('#start_fastagi').is(':checked') ? 'yes' : 'no')
                //     },
                //     error: function(jqXHR, textStatus, errorThrown) {
                //         // top.dialog.dialogMessage({
                //         //     type: 'error',
                //         //     content: errorThrown
                //         // });
                //     },
                //     success: function(data) {
                //         var bool = UCMGUI.errorHandler(data);

                //         if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG4764")
                });
                //         }
                //     }
                // });
            }
        }
    });
}

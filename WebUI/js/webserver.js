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
    ifExisted = UCMGUI.inArray,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    aRejectPort = [],
    fileType = '',
    openPort = ['1', '7', '9', '11', '13', '15', '17', '19', '20', '21', '22', '23', '25', '37', '42', '43', '53', '77', '79', '87', '95',
                '101', '102', '103', '104', '109', '110', '111', '113', '115', '117', '119', '123', '135', '139', '143', '179', '389',
                '465', '512', '513', '514', '515', '526', '530', '531', '532', '540', '556', '563', '587', '601', '636', '993', '995', '2049',
                '3659', '4045', '6000', '6665', '6666', '6667', '6668', '6669'],
    loadValue;

String.prototype.format = top.String.prototype.format;

$(function() {
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG716"));

    $P.lang(document, true);

    initValidator();

    getWebServer();

    getOpenPort();

    getRejectPort();

    initUpload();

    btnDelete_check_state();

    checkPemUseful();
});

function btnDelete_check_state(fileType) {
    if ((fileType == "key" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "http_tls_key"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    // $("#http_tls_key_delete").attr("disabled", false);
                    $("#tlsprivatekey").val("private.pem");
                } else {
                    // $("#http_tls_key_delete").attr("disabled", true);
                    $("#tlsprivatekey").val("private.pem");
                }

                $("#http_tls_key_upload").attr("disabled", true);
            }
        });
    }

    if ((fileType == "pem" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "http_tls_cert"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    // $("#http_tls_cert_delete").attr("disabled", false);
                    $("#tlscertfile").val("certificate.pem");
                } else {
                    // $("#http_tls_cert_delete").attr("disabled", true);
                    $("#tlscertfile").val("certificate.pem");
                }

                $("#http_tls_cert_upload").attr("disabled", true);
            }
        });
    }
}

function checkPemUseful() {
    $.ajax({
        url: "../cgi",
        type: "GET",
        async: false,
        data: {
            'action': 'getHttpPemUseful'
        },
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
                var unuseful = data.response.pem_unuseful;
                
                if (unuseful == '1') {
                    top.dialog.dialogMessage({
                        type: 'warning',
                        content: $P.lang("LANG4833")
                    });
                }
            }
        }
    });
}

function delete_file(type) {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG938"),
        buttons: {
            ok: function() {
                processDeleteFile(type);
            }
        }
    });
}

function getWebServer() {
    $.ajax({
        type: 'POST',
        url: "../cgi",
        dataType: 'json',
        data: "action=getHttpServer&web_redirect=&web_https=&web_port=",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var httpserver = data.response.httpserver;

                for (var attr in httpserver) {
                    if (httpserver.hasOwnProperty(attr)) {
                        if (attr == 'web_https') {
                            $("#" + attr).val(httpserver[attr] == 1 ? 'enable' : 'disable');
                        } else {
                            $("#" + attr).val(httpserver[attr]);
                        }
                    }
                }

                loadValue = $("#web_port").val();

                top.Custom.init(document);
            }
        }
    });
}

function check_port() {
    if ($("#web_port").val() == "80" && $("#web_redirect").val() == "1") {
        return false;
    }

    return true;
}

function getOpenPort() {
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
                var tlsbindaddr = data.response.http_settings.tlsbindaddr;

                if (tlsbindaddr) {
                    var port = tlsbindaddr.split(":")[1];

                    if (port && !ifExisted(port, openPort)) {
                        openPort.push(port);
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

function checkOpenPort(val, ele) {
    if (val == loadValue) {
        return true;
    }

    for (var i = 0; i < openPort.length; i++) {
        var ele = openPort[i];

        if (val == ele) {
            return false;
        }
    }

    return true;
}

function getRejectPort() {
    $.ajax({
        url: "../cgi",
        type: "GET",
        async: false,
        data: {
            'action': 'listStaticDefense',
            'options': 'rule_act,dest_port,protocol,type'
        },
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
                var aRules = data.response.rule_name;
                
                for (var i = 0; i < aRules.length; i++) {
                    var ele = aRules[i];

                    if ((ele.rule_act === 'reject' || ele.rule_act === 'drop') && (ele.protocol === 'tcp' || ele.protocol === 'both') && (ele.type === 'in')) {
                        aRejectPort.push(ele.dest_port.toString());
                    }
                }  
            }
        }
    });
}

function checkRejectPort(val, ele) {
    if (val == loadValue) {
        return true;
    }

    for (var i = 0; i < aRejectPort.length; i++) {
        var ele = aRejectPort[i];

        if (val === ele) {
            return false;
        }
    }

    return true;
}

function checkRejectAll() {
    var sRejectAll;

    $.ajax({
        type: "GET",
        url: "../cgi",
        data: {
            'action': 'getTypicalFirewallSettings'
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                sRejectAll = data.response.typical_firewallsettings.reject_all;
            }
        }
    });

    if (sRejectAll === "no") {
        return false;
    }

    return true;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "web_port": {
                required: true,
                digits: true,
                range: [1, 65535],
                customCallback: [$P.lang("LANG936"), check_port],
                customCallback1: [$P.lang("LANG3869"), checkOpenPort],
                customCallback2: [$P.lang("LANG4141"), checkRejectPort]
            },
            "web_public_port": {
                digits: true,
                range: [1, 65535]
            }
        },
        submitHandler: function() {
            save_changes();
        }
    });
}

function save_changes() {
    if ($("#web_port").val() !== loadValue && checkRejectAll()) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG4126"),
            buttons: {
                ok: function() {
                    top.frames['frameContainer'].module.jumpMenu("security.html");
                }
            }
        });

        return false;
    }

    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG807"), // $P.lang("LANG833"),
        buttons: {
            ok: doSave, // ok: confirm_reboot, Modified by rzhang
            cancel: 'none'
        }
    });
}

function doSave() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG904")
    });

    var buf = "action=updateHttpServer&web_redirect=" + $("#web_redirect").val() + "&web_https=" +
        ($("#web_https").val() == "disable" ? 0 : 1) + "&web_port=" + $("#web_port").val();
        // "&web_public_port=" + $("#web_public_port").val();

    $.ajax({
        url: "../cgi?",
        type: "POST",
        data: buf,
        dataType: 'json',
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                $.ajax({
                    url: "../cgi?",
                    type: "POST",
                    data: {
                        'action': 'reloadHttpConf',
                        'reflash_conf': '0'
                    },
                    dataType: 'json',
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            jumpTo();
                        }
                    }
                });
            }
        }
    });
}

function jumpTo() {
    top.dialog.dialogMessage({
        type: "loading",
        content: $P.lang("LANG806")
    });

    $.ajax({
        type: "POST",
        url: "../cgi",
        data: "action=reloadHttpServer&reflush_server=0"
    });

    setTimeout(function() {
        top.dialog.clearDialog();

        var webHttps = $("#web_https option:selected").text(),
            webPort = $('#web_port').val();

        if (webHttps.toLowerCase() == "http") {
            top.location.href = "http://" + top.location.hostname + ":" + webPort + top.location.pathname;
        } else if (webHttps.toLowerCase() == "https") {
            top.location.href = "https://" + top.location.hostname + ":" + webPort + top.location.pathname;
        }
    }, 5000);
}

function initUpload() {
    var http_tls_key_select = $("#http_tls_key_select"),
        httptlskeyfile = $("#tlsprivatekey"),
        http_tls_key_upload = $("#http_tls_key_upload");
        // http_tls_key_delete = $("#http_tls_key_delete");

    var http_tls_key_uploader = new AjaxUpload(http_tls_key_select, {
        action: '/cgi?action=uploadfile&type=http_tls_key',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "key";

            $(httptlskeyfile).val(file);

            if (file) {
                $(http_tls_key_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "key";

            var pattern = /^(pem)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.pem', $P.lang('LANG3000'))
                });

                $(http_tls_key_upload).attr("disabled", true);

                $(httptlskeyfile).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(http_tls_key_upload).bind({
        click: function() {
            http_tls_key_uploader.submit();
        }
    });

    // $(http_tls_key_delete).bind({
    //     click: function() {
    //         delete_file("http_tls_key");
    //         return false;
    //     }
    // });

    // upload client cert 
    var http_tls_cert_select = $("#http_tls_cert_select"),
        httptlscertfile = $("#tlscertfile"),
        http_tls_cert_upload = $("#http_tls_cert_upload");
        // http_tls_cert_delete = $("#http_tls_cert_delete");

    var http_tls_cert_uploader = new AjaxUpload(http_tls_cert_select, {
        action: '../cgi?action=uploadfile&type=http_tls_cert',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "pem";

            $(httptlscertfile).val(file);

            if (file) {
                $(http_tls_cert_upload).attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            fileType = "pem";

            var pattern = /^(pem)$/ig;

            if (!(ext && pattern.test(ext))) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG911").format('.pem', $P.lang('LANG3002'))
                });

                $(http_tls_cert_upload).attr("disabled", true);

                $(httptlscertfile).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(http_tls_cert_upload).bind({
        click: function() {
            http_tls_cert_uploader.submit();
        }
    });

    // $(http_tls_cert_delete).bind({
    //     click: function() {
    //         delete_file("http_tls_cert");
    //         return false;
    //     }
    // });
}

function file_upload_complete_tip(file, response) {
    if (fileType == "key") {
        $("#tlsprivatekey").val("");
    } else if (fileType == "pem") {
        $("#tlscertfile").val("");
    }

    top.dialog.clearDialog();

    var bool = UCMGUI.errorHandler(response);

    if (bool) {
        if (response.response && response.response.result == "0") {
            // list_key_files();
            // confirm_reboot();

            top.dialog.dialogMessage({
                type: 'success',
                content: $P.lang("LANG906")
            });
        } else {
            if (response && response.response && response.response.body) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: response.response.body
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG907")
                });
            }
        }
    }

    btnDelete_check_state(fileType);
}

function processDeleteFile(type) {
    if (type == "http_tls_key") {
        fileType = "key";
    } else if (type == "http_tls_cert") {
        fileType = "pem";
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            action: "removeFile",
            type: type
        },
        async: false,
        url: baseServerURl,
        success: function(data) {
            btnDelete_check_state(fileType);

            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (data && data.response && data.response.result == "0") {
                    // confirm_reboot();

                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG871")
                    });
                } else {
                    if (data.response.body) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: data.response.body
                        });
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG889")
                        });
                    }
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });

            btnDelete_check_state();
        }
    });
}

function resetCert() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG4238"), // $P.lang("LANG833"),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG4830")
                });

                $.ajax({
                    type: "POST",
                    url: "../cgi",
                    data: "action=resetHttpServer&reflush_server=0"
                });

                setTimeout(function() {
                    top.dialog.clearDialog();

                    var webHttps = $("#web_https option:selected").text(),
                        webPort = $('#web_port').val();

                    if (webHttps.toLowerCase() == "http") {
                        top.location.href = "http://" + top.location.hostname + ":" + webPort + top.location.pathname;
                    } else if (webHttps.toLowerCase() == "https") {
                        top.location.href = "https://" + top.location.hostname + ":" + webPort + top.location.pathname;
                    }
                }, 5000);
            },
            cancel: 'none'
        }
    });
}
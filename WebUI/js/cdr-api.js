/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2013 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    extensionPrefSettings = UCMGUI.isExist.getRange(), // [disable_extension_ranges, rand_password, weak_password]
    ifExisted = UCMGUI.inArray,
    fileType = "",
    oldDom = "",
    openPort,
    loadValue,
    oWebrtcPort = {};

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2998"));

    initUpload();

    initValidator();

    getCDRAPISettings();

    getOpenPort();

    getWebrtcPort();

    btnDelete_check_state();

    // oldDom = getDomStr();

    isEnableWeakPw();

    bindEvent();

    top.Custom.init(doc);
});

function bindEvent() {
    $('#btnPermit0').on('click', function() {
        addRow(this, 'permitTable');
    });
    $('#permitTable').on('click', '.btn_del', function() {
        deleteRow(this, $(this).attr('data-tableid'));
    })
}

function addRow(btn, tableID) {

    var table = doc.getElementById(tableID),
        rowIndex = btn.parentElement.parentElement.rowIndex,
        rowCount = table.rows.length,
        existDenyList = [],
        existPermitList = [],
        row_ID;

    if (rowCount >= 10) {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG808").format(10, $P.lang('LANG2776'))
        });

        return false;
    }

    var row = table.insertRow(rowCount),
        colCount = table.rows[0].cells.length;

    $('#' + tableID + ' input[position="left"]').each(function() {
        if (tableID == 'denyTable') {
            existDenyList.push(parseInt($(this).attr('id').substr(6)));
        } else {
            existPermitList.push(parseInt($(this).attr('id').substr(8)));
        }
    });

    for (var i = 0; i < 10000; i++) {
        if (tableID == 'denyTable') {
            if (!ifExisted(i, existDenyList)) {
                break;
            }
        } else {
            if (!ifExisted(i, existPermitList)) {
                break;
            }
        }
    }

    row_ID = i;

    for (var i = 0; i < colCount; i++) {

        var newcell = row.insertCell(i);

        newcell.innerHTML = table.rows[0].cells[i].innerHTML;

        if (i === 2) {
            newcell.childNodes[0].value = "";
            newcell.childNodes[0].id = (tableID == 'denyTable' ? 'denyNetmask' : "permitNetmask") + row_ID;
            newcell.childNodes[0].name = (tableID == 'denyTable' ? 'denyNetmask' : "permitNetmask") + row_ID;
            $P(newcell.childNodes[0]).rules("add", {
                required: true,
                specialIpAddressNoBrackets: true,
                customCallback:[$P.lang("LANG2195"), ipv6Len]
            });
        } else {
            switch (newcell.childNodes[0].type) {
                case "text":
                    newcell.childNodes[0].value = "";
                    newcell.childNodes[0].id = (tableID == 'denyTable' ? 'denyIP' : "permitIP") + row_ID;
                    newcell.childNodes[0].name = (tableID == 'denyTable' ? 'denyIP' : "permitIP") + row_ID;
                    $P(newcell.childNodes[0]).rules("add", {
                        required: true,
                        ipAddressNoBrackets: true,
                        differentIPs: [$('#form')]
                    });
                    break;
                case "button":
                    newcell.childNodes[0].className = "btn_del";
                    newcell.childNodes[0].id = (tableID == 'denyTable' ? 'btnDeny' : "btnPermit") + row_ID;
                    $(newcell.childNodes[0]).attr('data-tableid', tableID);
                    break;
            }
        }
    }

    top.Custom.init(doc);
}

function cancel() {
    $(".click").removeClass("click");
}

function deleteRow(btn, tableID) {
    var table = doc.getElementById(tableID),
        rowCount = table.rows.length,
        rowIndex = btn.parentElement.parentElement.rowIndex;

    if (rowCount > rowIndex) {
        table.deleteRow(rowIndex);
    }
}

function getCDRAPISettings() {
    var action = {};

    // action = UCMGUI.formSerialize(doc);
    action["action"] = "getCDRAPISettings";

    $.ajax({
        url: '../cgi',
        type: "POST",
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
                UCMGUI.domFunction.updateDocument(data.response.http_settings, doc);

                $.ajax({
                    url: '../cgi',
                    type: "POST",
                    dataType: "json",
                    async: false,
                    data: {
                        'action': 'getCDRAPIAccount'
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
                            UCMGUI.domFunction.updateDocument(data.response.cdrapi_accounts, doc);

                            // var denyAddresses = data.response.cdrapi_denys,
                            //      denyLength = denyAddresses.length,
                            var permitAddresses = data.response.cdrapi_permits,
                                permitLength = permitAddresses.length,
                                i = 1;

                            // for (i; i < denyLength; i++) {
                            //     addRow(doc.getElementById('btnDeny0'), "denyTable");
                            // }

                            for (i = 1; i < permitLength; i++) {
                                addRow(doc.getElementById('btnPermit0'), "permitTable");
                            }

                            // if (denyAddresses.length) {
                            //     $('#denyTable input[position="left"]').each(function(index) {
                            //         if (denyAddresses[index]['deny']) {
                            //             var deny = denyAddresses[index]['deny'].split('\/');

                            //             $(this)
                            //                 .val(deny[0])
                            //                 .closest('tr').find('[position="right"]').val(deny[1]);
                            //         }
                            //     });
                            // }

                            if (permitAddresses.length) {
                                $('#permitTable input[position="left"]').each(function(index) {
                                    if (permitAddresses[index]['permit']) {
                                        var permit = permitAddresses[index]['permit'].split('\/');

                                        $(this)
                                            .val(permit[0])
                                            .closest('tr').find('[position="right"]').val(permit[1]);
                                    }
                                });
                            }

                            loadValue = $("#tlsbindaddr").val().split(":")[1];

                            top.Custom.init(doc);
                        }
                    }
                });
            }
        }
    });
}

function checkPort(value, element) {
    var val = value.split(":")[1];
    if (val < 0 || val > 65535) {
        return false;
    }
    return true;
}

function getOpenPort() {
    openPort = [];

    $.ajax({
        url: "../cgi?action=getNetstatInfo",
        type: "GET",
        //async: false,
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
        //async: false,
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

function getWebrtcPort() {
    $.ajax({
        url: "../cgi?action=getSIPWebRTCHttpSettings",
        type: "GET",
        //async: false,
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
                var tlsenable = data.response.webrtc_http_settings.tlsenable,
                    tlsbindaddr = data.response.webrtc_http_settings.tlsbindaddr,
                    tlsPort = tlsbindaddr.split(":")[1];

                oWebrtcPort = {
                    'enable': tlsenable,
                    'port': tlsPort
                }
            }
        }
    });
}

function checkOpenPort(value, element) {
    var val = value.split(":")[1],
        ele;

    if (val == loadValue) {
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

function checkWebrtcPort(value, element) {
    var val = value.split(":")[1],
        enable = $('#enabled')[0].checked;

    if (!enable || oWebrtcPort.enable === 'no') {
        return true;
    }

    if (val === oWebrtcPort.port) {
        return false;
    }

    return true;
}

function ipv6Len(value, element) {
    var num = element.name.match(/\d+/);
    var val = $("#permitIP" + num).val();

    if (UCMGUI.isIPv6(val)) {
        if (/^\d+$/.test(value)) {
            return true;
        } else if(UCMGUI.isIPv6(value)) {
            return false;
        } else {
            return false;
        }
    } else if(/^\d+$/.test(value) && !UCMGUI.isIPv6(val)) {
        return false;
    } else {
        return true;
    }
}
function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "tlsbindaddr": {
                required: function(element) {
                    return $('#enabled').is(":checked");
                },
                ipAddressPort: true,
                customCallback: [$P.lang("LANG957"), checkPort],
                customCallback1: [$P.lang("LANG3869"), checkOpenPort],
                customCallback2: [$P.lang("LANG3869"), checkWebrtcPort]
            },
            "username": {
                required: true,
                letterDigitUndHyphen: true
            },
            "secret": {
                keyboradNoSpacesemicolon: true,
                minlength: 2
            },
            // "denyIP0": {
            //     required: true,
            //     ipAddress: true
            // },
            // "denyNetmask0": {
            //     required: true,
            //     ipAddress: true
            // },
            "permitIP0": {
                required: function(element) {
                    return ($('#permitNetmask0').val() || $('#permitTable tr').length > 1 ? true : false);
                },
                ipAddressNoBrackets: true,
                differentIPs: [$('#form')]
            },
            "permitNetmask0": {
                required: function(element) {
                    return ($('#permitIP0').val() || $('#permitTable tr').length > 1 ? true : false);
                },
                specialIpAddressNoBrackets: true,
                customCallback:[$P.lang("LANG2195"), ipv6Len]
            }
        },
        newValidator: true,
        submitHandler: function(ev) {
            save_changes();
        }
    });
};

function initUpload() {
    var cdr_tls_key_select = $("#cdr_tls_key_select"),
        cdrtlskeyfile = $("#tlsprivatekey"),
        cdr_tls_key_upload = $("#cdr_tls_key_upload"),
        cdr_tls_key_delete = $("#cdr_tls_key_delete");

    var cdr_tls_key_uploader = new AjaxUpload(cdr_tls_key_select, {
        action: '/cgi?action=uploadfile&type=cdr_tls_key',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "key";

            $(cdrtlskeyfile).val(file);

            if (file) {
                $(cdr_tls_key_upload).attr("disabled", false);
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

                $(cdr_tls_key_upload).attr("disabled", true);

                $(cdrtlskeyfile).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(cdr_tls_key_upload).bind({
        click: function() {
            cdr_tls_key_uploader.submit();
        }
    });

    $(cdr_tls_key_delete).bind({
        click: function() {
            delete_file("cdr_tls_key");
            return false;
        }
    });

    // upload client cert 
    var cdr_tls_cert_select = $("#cdr_tls_cert_select"),
        cdrtlscertfile = $("#tlscertfile"),
        cdr_tls_cert_upload = $("#cdr_tls_cert_upload"),
        cdr_tls_cert_delete = $("#cdr_tls_cert_delete");

    var cdr_tls_cert_uploader = new AjaxUpload(cdr_tls_cert_select, {
        action: '../cgi?action=uploadfile&type=cdr_tls_cert',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileType = "pem";

            $(cdrtlscertfile).val(file);

            if (file) {
                $(cdr_tls_cert_upload).attr("disabled", false);
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

                $(cdr_tls_cert_upload).attr("disabled", true);

                $(cdrtlscertfile).val('');

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: file_upload_complete_tip
    });

    $(cdr_tls_cert_upload).bind({
        click: function() {
            cdr_tls_cert_uploader.submit();
        }
    });

    $(cdr_tls_cert_delete).bind({
        click: function() {
            delete_file("cdr_tls_cert");
            return false;
        }
    });
}

function isEnableWeakPw() {
    if (extensionPrefSettings[2] == 'yes') { // weak_password
        var obj = {
            pwsId: "#secret",
            doc: doc
        };

        $P("#secret", doc).rules("add", {
            checkAlphanumericPw: [UCMGUI.enableWeakPw.showCheckPassword, obj]
        });
    }
}

function save_changes() {
    var action = {};

    action["action"] = "updateCDRAPISettings";
    action["tlsenable"] = action["enabled"] = $('#enabled').is(":checked") ? "yes" : "no";
    action["tlsbindaddr"] = $('#tlsbindaddr').val();

    var tlsbindaddr = action["tlsbindaddr"];
    if (UCMGUI.isIPv6NoPort(tlsbindaddr)) {
        action["tlsbindaddr"] = "[" + tlsbindaddr + "]";
    }
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
                var action = {},
                    // denyTable = $('#denyTable input[position="left"]'),
                    permitTable = $('#permitTable input[position="left"]'),
                    // denyLength = denyTable.length,
                    permitLength = permitTable.length,
                    // denyIPs = '',
                    permitIPs = '';

                action["action"] = "updateCDRAPIAccount";
                action["username"] = $('#username').val();
                action["secret"] = $('#secret').val();

                // denyTable.each(function(index) {
                //     if (index < denyLength - 1) {
                //         denyIPs += $(this).val() + '/' + $(this).closest('tr').find('[position="right"]').val() + ';';
                //     } else {
                //         denyIPs += $(this).val() + '/' + $(this).closest('tr').find('[position="right"]').val();
                //     }
                // });

                permitTable.each(function(index) {
                    var ip = $(this).val(),
                        netmask = $(this).closest('tr').find('[position="right"]').val();

                    if (!ip) {
                        return true;
                    }

                    if (index < permitLength - 1) {
                        permitIPs += ip + '/' + netmask + ';';
                    } else {
                        if (ip && netmask) {
                            permitIPs += ip + '/' + netmask;
                        } else {
                            permitIPs = '';
                        }
                    }
                });

                // action["deny"] = denyIPs;
                action["permit"] = permitIPs;

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
                            // var newDom = getDomStr();

                            // if (oldDom != newDom) {
                            //     oldDom = newDom;
                            //     confirm_reboot();
                            // } else {
                            // }

                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG815")
                                // callback: function() {
                                //     oldDom = newDom;
                                // }
                            });
                        }
                    }
                });
            }
        }
    });
}

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

function confirm_reboot() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG927"),
        buttons: {
            ok: UCMGUI.loginFunction.confirmReboot
        }
    });
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
    if (type == "cdr_tls_key") {
        fileType = "key";
    } else if (type == "cdr_tls_cert") {
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

function btnDelete_check_state(fileType) {
    if ((fileType == "key" || fileType == undefined) && fileType != "dir") {
        $.ajax({
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "checkFile",
                type: "cdr_tls_key"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#cdr_tls_key_delete").attr("disabled", false);
                    $("#tlsprivatekey").val("private.pem");
                } else {
                    $("#cdr_tls_key_delete").attr("disabled", true);
                    $("#tlsprivatekey").val("");
                }

                $("#cdr_tls_key_upload").attr("disabled", true);
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
                type: "cdr_tls_cert"
            },
            url: baseServerURl,
            success: function(data) {
                if (data && data.status == 0 && data.response.result == 0) {
                    $("#cdr_tls_cert_delete").attr("disabled", false);
                    $("#tlscertfile").val("certificate.pem");
                } else {
                    $("#cdr_tls_cert_delete").attr("disabled", true);
                    $("#tlscertfile").val("");
                }

                $("#cdr_tls_cert_upload").attr("disabled", true);
            }
        });
    }
}

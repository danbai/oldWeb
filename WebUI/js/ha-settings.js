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
    openPort = [],
    loadValue,
    origin_port,
    origin_ip,
    origin_peer_ip,
    origin_peer_port,
    origin_haon,
    needReboot = 0;

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4360"));

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: 'haon',
        enableList: ['hbip', 'hbpeerip', 'hbto', 'check_dt', 'check_fxs1', 'check_fxs2', 'check_fxo1', 'check_fxo2', 'hbport']
    }, doc);

    getHaSettings();

    getOpenPort();

    initValidator();
});

function getHaSettings() {
    var action = {},
        actionSwitch = {
            'action': 'getHASwitch'
        };

    action["action"] = "getHASetting";

    $.ajax({
        type: "GET",
        url: baseServerURl,
        dataType: "json",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var str = '',
                    settings = data.response,
                    hanoEle = $('#haon')[0],
                    haonEnable = settings.haon === '1',
                    config_dt = settings.config_dt,
                    config_fxo = settings.config_fxo,
                    config_fxs = settings.config_fxs,
                    dtEnable = settings.check_dt,
                    fxsEnable = settings.check_fxs,
                    fxoEnable = settings.check_fxo;

                origin_port = settings.hbport;
                origin_ip = settings.hbip;
                origin_peer_ip = settings.hbpeerip;
                //origin_peer_port = settings.hbpeerport;
                origin_haon = settings.haon === '1';
                loadValue = settings.hbport;

                UCMGUI.domFunction.updateDocument(settings, doc);

                if (config_dt === '1') {
                    str += '<div class="check_div">' +
                                '<input type="checkbox" id="check_dt" noserialize="true" />' +
                                '<span class="boxLabel">E1/T1</span>' +
                            '</div>';
                }

                if (config_fxo === '1') {
                    str += '<div class="check_div">' +
                                '<input type="checkbox" id="check_fxo1" noserialize="true" />' +
                                '<span class="boxLabel">FXO1</span>' +
                            '</div>';
                } else if (config_fxo === '2') {
                    str += '<div class="check_div">' +
                                '<input type="checkbox" id="check_fxo2" noserialize="true" />' +
                                '<span class="boxLabel">FXO2</span>' +
                            '</div>';
                } else if (config_fxo === '3') {
                    str += '<div class="check_div">' +
                                '<input type="checkbox" id="check_fxo1" noserialize="true" />' +
                                '<span class="boxLabel">FXO1</span>' +
                            '</div>' + 
                            '<div class="check_div">' +
                                '<input type="checkbox" id="check_fxo2" noserialize="true" />' +
                                '<span class="boxLabel">FXO2</span>' +
                            '</div>';
                }

                if (config_fxs === '1') {
                    str += '<div class="check_div">' +
                                '<input type="checkbox" id="check_fxs1" noserialize="true" />' +
                                '<span class="boxLabel">FXS1</span>' +
                            '</div>';
                } else if (config_fxs === '2') {
                    str += '<div class="check_div">' +
                                '<input type="checkbox" id="check_fxs2" noserialize="true" />' +
                                '<span class="boxLabel">FXS2</span>' +
                            '</div>';
                } else if (config_fxs === '3') {
                    str += '<div class="check_div">' +
                                '<input type="checkbox" id="check_fxs1" noserialize="true" />' +
                                '<span class="boxLabel">FXS1</span>' +
                            '</div>' + 
                            '<div class="check_div">' +
                                '<input type="checkbox" id="check_fxs2" noserialize="true" />' +
                                '<span class="boxLabel">FXS2</span>' +
                            '</div>';
                }

                $('#hardware_scan').append(str);

                if (dtEnable === '1') {
                    $('#check_dt')[0] && ($('#check_dt')[0].checked = dtEnable);
                }

                if (fxoEnable === '1') {
                    $('#check_fxo1')[0] && ($('#check_fxo1')[0].checked = true);
                } else if (fxoEnable === '2') {
                    $('#check_fxo2')[0] && ($('#check_fxo2')[0].checked = true);
                } else if (fxoEnable === '3') {
                    $('#check_fxo1')[0] && ($('#check_fxo1')[0].checked = true);
                    $('#check_fxo2')[0] && ($('#check_fxo2')[0].checked = true);
                }

                if (fxsEnable === '1') {
                    $('#check_fxs1')[0] && ($('#check_fxs1')[0].checked = true);
                } else if (fxsEnable === '2') {
                    $('#check_fxs2')[0] && ($('#check_fxs2')[0].checked = true);
                } else if (fxsEnable === '3') {
                    $('#check_fxs1')[0] && ($('#check_fxs1')[0].checked = true);
                    $('#check_fxs2')[0] && ($('#check_fxs2')[0].checked = true);
                }

                $('#haon')[0].checked = haonEnable;

                if (hanoEle.updateStatus) {
                    hanoEle.updateStatus();
                }

                $.ajax({
                    type: "GET",
                    url: baseServerURl,
                    dataType: "json",
                    data: actionSwitch,
                    error: function(jqXHR, textStatus, errorThrown) {
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            var hamasterEle = $('#hamaster')[0],
                                hamasterEnable = data.response.hamaster === '1';

                            hamasterEle.checked = hamasterEnable;

                            top.Custom.init(doc);
                        }
                    }
                });  
            }
        }
    });
}

function getOpenPort() {
    $.ajax({
        url: "../cgi?action=getNetstatInfo",
        type: "GET",
        dataType: "json",
        error: function(jqXHR, textStatus, errorThrown) {
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var netstat = data.response.netstat,
                    currentPort = '';

                for (var i = 0, length = netstat.length; i < length; i++) {
                    currentPort = netstat[i]['port'];
                    openPort.push(currentPort);
                }
            }
        }
    });
}

function checkOpenPort(val, ele) {
    if (val === loadValue) {
        return true;
    }

    for (var i = 0; i < openPort.length; i++) {
        var ele = openPort[i];

        if (val === ele) {
            return false;
        }
    }

    return true;
}

function checkIpStart(val, ele) {
    if (val.slice(0, 10) !== '198.51.100') {
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
            "hbip": {
                required: true,
                host: ['IP or URL'],
                customCallback: [$P.lang("LANG5335"), checkIpStart]
            },
            "hbpeerip": {
                required: true,
                host: ['IP or URL'],
                customCallback: [$P.lang("LANG5335"), checkIpStart]
            },
            "hbto": {
                required: true,
                range: [5, 9]
            },
            "hbport": {
                required: true,
                digits: true,
                range: [1, 65535],
                customCallback: [$P.lang("LANG3869"), checkOpenPort]
            },
            //"hbpeerport": {
            //    required: true,
            //    digits: true,
            //    range: [1, 65535]
            //},
        },
        newValidator: true,
        submitHandler: function(ev) {
            if (document.getElementById('hbip').value != origin_ip ||
                document.getElementById('hbpeerip').value != origin_peer_ip ||
                $('#haon')[0].checked != origin_haon ||
                document.getElementById('hbport').value != origin_port) {
                needReboot = 1;
            }
            if ($('#haon')[0].checked) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG5381")  + (needReboot?"确认则重启,取消则不保存配置":""),
                    buttons: {
                        ok: function() {
                            save_changes();
                        },
                        cancel: function() {
                            needReboot = 0;
                        }
                    }
                });
            } else {
                if (needReboot == 1) {
                    top.dialog.dialogConfirm({ 
                        confirmStr: needReboot?$P.lang("LANG833"):"",
                        buttons: {
                            ok: function() {
                                save_changes();
                            },
                            cancel: function() {
                                needReboot = 0;
                            }
                        }
                    });
                } else {
                    save_changes();
                }
            }
        }
    });
};

function save_changes() {
    var action = {},
        actionSwitch = {},
        numFXS = 0,
        numFXO = 0;

    actionSwitch["hamaster"] = $('#hamaster')[0].checked ? '1' : '0';
    actionSwitch['action'] = 'setHASwitch';

    action = UCMGUI.formSerializeVal(doc);
    action["action"] = "setHASetting";
    action["haon"] = $('#haon')[0].checked ? '1' : '0';
    action["hbpeerport"] = action["hbport"];
    if ($('#check_dt')[0] && $('#check_dt')[0].checked) {
        action['check_dt'] = '1';
    } else {
        action['check_dt'] = '0';
    }

    if ($('#check_fxs1')[0] && $('#check_fxs1')[0].checked) {
        numFXS += 1;
    }
    if ($('#check_fxs2')[0] && $('#check_fxs2')[0].checked) {
        numFXS += 2;
    }
    action['check_fxs'] = numFXS.toString();

    if ($('#check_fxo1')[0] && $('#check_fxo1')[0].checked) {
        numFXO += 1;
    }
    if ($('#check_fxo2')[0] && $('#check_fxo2')[0].checked) {
        numFXO += 2;
    }
    action['check_fxo'] = numFXO.toString();

    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                origin_port = action["hbport"];
                origin_ip = action["hbip"];
                origin_peer_ip = action["hbpeerip"];
                origin_haon = $('#haon')[0].checked;
                bcStatus = data.response.bcStatus;
                if (bcStatus == 0 && needReboot == 1) {
                    top.dialog.dialogMessage({
                        type: 'loading',
                        content: $P.lang("LANG844") + $P.lang("LANG832")
                    });
                    setTimeout(UCMGUI.loginFunction.confirmReboot, 5000);
                    // UCMGUI.loginFunction.confirmReboot();
                } else if (bcStatus != 0 && needReboot == 1){
                    top.dialog.dialogMessage({
                        type: 'loading',
                        content: "本地数据更新成功,对端同步失败,正在重启UCM."
                    });
                    UCMGUI.loginFunction.confirmReboot();
                } else if(bcStatus != 0 && needReboot != 1) {
                    top.dialog.dialogMessage({
                        type: 'warning',
                        content: "本地数据更新成功,对端同步失败"
                    });
                } else {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG844")
                    });
                }
                needReboot = 0;
            }
        }
    });
}

/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    row_action_ID = 0,
    row_ignoreip_ID = 0,
    DOM_dynamic_blacklist = $("#dynamic_blacklist")[0];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2601"));

    initValidator();

    initForm();
    bindButtonEvent();
    // checkConf();
    loadDynamicBlacklist();

    top.Custom.init(document);
});

function checkConf() {
    var flag = false,
        newJail = new listOfSynActions("jail.conf");

    if (!jail.hasOwnProperty('DEFAULT')) {
        newJail.new_action('newcat', 'DEFAULT', '', '');
        newJail.callActions();
        newJail.clearActions();
        newJail.new_action('autoupdate', 'DEFAULT', 'ignoreip', '127.0.0.1/8');
        newJail.new_action('autoupdate', 'DEFAULT', 'bantime', '300');
        newJail.new_action('autoupdate', 'DEFAULT', 'findtime', '5');
        newJail.new_action('autoupdate', 'DEFAULT', 'maxretry', '10');
        newJail.new_action('autoupdate', 'DEFAULT', 'backend', 'auto');
        newJail.new_action('autoupdate', 'DEFAULT', 'usedns', 'warn');
        newJail.callActions();
        newJail.clearActions();
        flag = true;
    } else {
        if (!jail["DEFAULT"].hasOwnProperty('ignoreip')) {
            newJail.new_action('autoupdate', 'DEFAULT', 'ignoreip', '127.0.0.1/8');
            flag = true;
        }

        if (!jail["DEFAULT"].hasOwnProperty('bantime')) {
            newJail.new_action('autoupdate', 'DEFAULT', 'bantime', '300');
            flag = true;
        }

        if (!jail["DEFAULT"].hasOwnProperty('findtime')) {
            newJail.new_action('autoupdate', 'DEFAULT', 'findtime', '5');
            flag = true;
        }

        if (!jail["DEFAULT"].hasOwnProperty('maxretry')) {
            newJail.new_action('autoupdate', 'DEFAULT', 'maxretry', '10');
            flag = true;
        }

        if (!jail["DEFAULT"].hasOwnProperty('backend')) {
            newJail.new_action('autoupdate', 'DEFAULT', 'backend', 'auto');
            flag = true;
        }

        if (!jail["DEFAULT"].hasOwnProperty('usedns')) {
            newJail.new_action('autoupdate', 'DEFAULT', 'usedns', 'warn');
            flag = true;
        }

        if (flag) {
            newJail.callActions();
            newJail.clearActions();
        }
    }

    if (!jail.hasOwnProperty('asterisk-udp')) {
        newJail.new_action('newcat', 'asterisk-udp', '', '');
        newJail.callActions();
        newJail.clearActions();
        newJail.new_action('autoupdate', 'asterisk-udp', 'enabled', 'true');
        newJail.new_action('autoupdate', 'asterisk-udp', 'filter', 'asterisk');
        newJail.new_action('autoupdate', 'asterisk-udp', 'action', 'iptables-multiport[name=asterisk-udp, port="5060", protocol=udp]');
        newJail.new_action('autoupdate', 'asterisk-udp', 'logpath', '/log/syslog');
        newJail.new_action('autoupdate', 'asterisk-udp', 'maxretry', '2');
        newJail.callActions();
        newJail.clearActions();
        flag = true;
    } else {
        if (!jail["asterisk-udp"].hasOwnProperty('enabled')) {
            newJail.new_action('autoupdate', 'asterisk-udp', 'enabled', 'true');
            flag = true;
        }

        if (!jail["asterisk-udp"].hasOwnProperty('filter')) {
            newJail.new_action('autoupdate', 'asterisk-udp', 'filter', 'asterisk');
            flag = true;
        }

        if (!jail["asterisk-udp"].hasOwnProperty('action')) {
            newJail.new_action('autoupdate', 'asterisk-udp', 'action', 'iptables-multiport[name=asterisk-udp, port="5060", protocol=udp]');
            flag = true;
        }

        if (!jail["asterisk-udp"].hasOwnProperty('logpath')) {
            newJail.new_action('autoupdate', 'asterisk-udp', 'logpath', '/log/syslog');
            flag = true;
        }

        if (!jail["asterisk-udp"].hasOwnProperty('maxretry')) {
            newJail.new_action('autoupdate', 'asterisk-udp', 'maxretry', '2');
            flag = true;
        }

        if (flag) {
            newJail.callActions();
            newJail.clearActions();
        }

    }

    /* xpqin: please keep this code for future use. 
    if (!jail.hasOwnProperty('asterisk-tcp')) {
          newJail.new_action('newcat', 'asterisk-tcp', '', '');
          newJail.callActions();
          newJail.clearActions();
          newJail.new_action('autoupdate', 'asterisk-tcp', 'enabled', 'false');
          newJail.new_action('autoupdate', 'asterisk-tcp', 'filter', 'asterisk');
          newJail.new_action('autoupdate', 'asterisk-tcp', 'action', 'iptables-multiport[name=asterisk-tcp, port="5060,5061", protocol=tcp]');
          newJail.new_action('autoupdate', 'asterisk-tcp', 'logpath', '/log/syslog');
          newJail.new_action('autoupdate', 'asterisk-tcp', 'maxretry', '2');
          newJail.callActions();
          newJail.clearActions();
          flag = true;
    } else {
        if (!jail["asterisk-tcp"].hasOwnProperty('enabled')) {
            newJail.new_action('autoupdate', 'asterisk-tcp', 'enabled', 'false');
            flag = true;
        }

        if (!jail["asterisk-tcp"].hasOwnProperty('filter')) {
            newJail.new_action('autoupdate', 'asterisk-tcp', 'filter', 'asterisk');
            flag = true;
        }

        if (!jail["asterisk-tcp"].hasOwnProperty('action')) {
            newJail.new_action('autoupdate', 'asterisk-tcp', 'action', 'iptables-multiport[name=asterisk-tcp, port="5060,5061", protocol=tcp]');
            flag = true; 
        }

        if (!jail["asterisk-tcp"].hasOwnProperty('logpath')) {
            newJail.new_action('autoupdate', 'asterisk-tcp', 'logpath', '/log/syslog');
            flag = true;  
        }

        if (!jail["asterisk-tcp"].hasOwnProperty('maxretry')) {
            newJail.new_action('autoupdate', 'asterisk-tcp', 'maxretry', '2');
            flag = true;  
        }

        if (flag) {
            newJail.callActions();
        }
    } */

    if (flag) {
        jail = config2json({
            filename: 'jail.conf',
            usf: 1
        });
    }
}

var isDisplay = function() {
    if ($("#enabled").is(":checked")) {
        // isDisplayTcp(true);
        $(".isDisplay").show();
    } else {
        $(".isDisplay").hide();
    }
};

var initForm = function() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'getFail2ban'
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
                var globenabled = _$("fail2ban_enable"),
                    asterisk = _$("enabled"),
                    fail2banEnable = data.response.fail2ban_enable,
                    fail2ban = data.response.fail2ban
                    ignoreipAry = [];

                $("#bantime").val(fail2ban["bantime"]);
                $("#findtime").val(fail2ban["findtime"]);
                $("#maxretry").val(fail2ban["maxretry"]);
                $("#udpPort").val(fail2ban["port"]);
                $("#asterisk_maxretry").val(fail2ban["asterisk_maxretry"]);

                for (var item in fail2ban) {
                    var itemValue = fail2ban[item];

                    if ((item.substr(0, 8) == 'ignoreip')) {
                        if (itemValue) {
                            ignoreipAry.push(itemValue);
                        }
                    }
                }

                initInput("ignoreip", ignoreipAry.join(' '), "ignoreipTable");

                globenabled.checked = (fail2banEnable == 1 ? true : false);
                asterisk.checked = (fail2ban["enabled"] == "yes" ? true : false);

                if (!globenabled.checked) {
                    $(".isDisabled").attr("disabled", true);
                }

                if (!asterisk.checked) {
                    $(".isDisplay").hide();
                }

                // isDisplayTcp($("#asterisk").is(":checked"));
                ASTGUI.domActions.enableDisableByCheckBox('fail2ban_enable', {
                    className: "isDisabled"
                });

                top.Custom.init(document, globenabled);
                top.Custom.init(document, asterisk);
            }
        }
    });
};

var loadDynamicBlacklist = function() { // readcfg.FirewallConf
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'getFail2banList',
            "auto-refresh": Math.random()
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                $(DOM_dynamic_blacklist).empty();

                var addCell = ASTGUI.domActions.tr_addCell,
                    newRow = DOM_dynamic_blacklist.insertRow(-1);

                newRow.className = "frow";

                addCell(newRow, {
                    html: $P.lang("LANG4813"),
                    locale: "banned type"
                });
                addCell(newRow, {
                    html: $P.lang("LANG2293"),
                    locale: "LANG2293"
                });
                addCell(newRow, {
                    html: $P.lang("LANG74"),
                    locale: "Options"
                });

                var PreviousTRColor = 'odd', // 'odd' : 'even' ;
                    list = data.response.fail2banlist;

                for (var idx = 0; list[idx] && idx < list.length; idx++) {
                    var value = list[idx];

                    for(var temp in value) {
                        if (value.hasOwnProperty(temp)) {
                            var ips = value[temp];

                            for (var i = 0; i <= ips.length -1; i++) {
                                newRow = DOM_dynamic_blacklist.insertRow(-1);

                                newRow.className = PreviousTRColor;
                                addCell(newRow, {
                                    html: temp
                                });
                                addCell(newRow, {
                                    html: ips[i]
                                });
                                addCell(newRow, {
                                    html: '<button type="button" bandType="' + temp + '" ip="' + ips[i] + '" title="' + $P.lang('LANG739') + '" localetitle="LANG739" class="options del"></button>'
                                });
                            };
                        }
                    }
                }
            }
        }
    });

    setTimeout(function() {
        loadDynamicBlacklist();
    }, 5000);
};


function bindButtonEvent() {
    $("#dynamic_blacklist")
        .delegate('.del', 'click', function(ev) {
            var bandType = $(this).attr('bandType');
            var ip = $(this).attr('ip');
            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "delFail2banList",
                    "param": bandType + "," + ip
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
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG4788").format(ip, $P.lang("LANG2471")),
                            callback: function() {
                                loadDynamicBlacklist();
                            }
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });
}

/* xpqin: please keep this code for future use.
var isDisplayTcp = function(bool) {
    if (bool) {
        $.ajax({
            type: "GET",
            async: true,
            url: "/webcgi?Action=getSIPSetting&sip-tcp-enable=&sip-tls-enable=",
            error: function () {
                top.dialog.dialogMessage({ type: 'error', content: $P.lang("LANG909") });
            },
            success: function(data) {
                var newJail = new listOfActions('jail.conf');

                if (data && data.body) {
                    var sip_tls_enable = data.body["sip-tls-enable"],
                        sip_tcp_enable = data.body["sip-tcp-enable"];

                    if (sip_tcp_enable == "yes" || sip_tls_enable == "yes") {
                        var jailAstTcp = jail["asterisk-tcp"],
                            tcpPort = jailAstTcp["action"].split("multiport")[1].split("\"")[1];

                        newJail.new_action("update", "asterisk-tcp", "enabled", "true");

                        $("#tcpPort").val(tcpPort);
                        $("#tcpDiv").show();
                    } else {
                        newJail.new_action("update", "asterisk-tcp", "enabled", "false");
                    }

                    newJail.callActions();
                }
            }
        });
    };

    $P.cookie("disNoneApply", true);
} */

var initValidator = function() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "bantime": {
                required: true,
                digits: true,
                range: [0, 999999999999]
            },
            "findtime": {
                required: true,
                digits: true,
                range: [1, 999999999999]
            },
            "maxretry": {
                required: true,
                digits: true,
                range: [1, 999999999999]
            },
            "ignoreip0": {
                ipv4withcidr: ["ip"]
            },
            "asterisk_maxretry": {
                required: true,
                digits: true,
                range: [1, 999999999999]
            }
        },
        submitHandler: function() {
            apply_changes();
        }
    });
};

function addRow(btn, tableID) {
    var table = document.getElementById(tableID),
        rowIndex = btn.parentElement.parentElement.rowIndex,
        rowCount = table.rows.length,
        inputId = btn.id.match(/[^btn][^\d]*/),
        btnId = btn.id.match(/[^\d]*/);

    if (rowCount >= 5) {
        top.dialog.clearDialog();

        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG2623")
        });

        return;
    }

    var row = table.insertRow(rowCount);

    if (inputId == "action") {
        ++row_action_ID;
    } else if (inputId == "ignoreip") {
        ++row_ignoreip_ID;
    }

    var colCount = table.rows[0].cells.length;

    for (var i = 0; i < colCount; i++) {

        var newcell = row.insertCell(i);

        newcell.innerHTML = table.rows[0].cells[i].innerHTML;

        switch (newcell.childNodes[0].type) {
            case "text":
                newcell.childNodes[0].value = "";
                newcell.childNodes[0].className = inputId + " isDisabled";

                if (inputId == "action") {
                    newcell.childNodes[0].id = inputId + row_action_ID;
                    newcell.childNodes[0].name = inputId + row_action_ID;

                    $P(newcell.childNodes[0], document).rules("add", {
                        required: true,
                        digits: true,
                        range: [1, 65535]
                    });
                } else if (inputId == "ignoreip") {
                    newcell.childNodes[0].id = inputId + row_ignoreip_ID;
                    newcell.childNodes[0].name = inputId + row_ignoreip_ID;

                    $P(newcell.childNodes[0], document).rules("add", {
                        required: true,
                        ipv4withcidr: ["ip"]
                    });
                }

                break;
            case "button":
                newcell.childNodes[0].className = "btn_del isDisabled";

                if (inputId == "action") {
                    newcell.childNodes[0].id = btnId + row_action_ID;
                } else if (inputId == "ignoreip") {
                    newcell.childNodes[0].id = btnId + row_ignoreip_ID;
                }

                newcell.childNodes[0].onclick = Function("deleteRow(this, '" + tableID + "');");

                break;
        }
    }
}

function deleteRow(btn, tableID) {
    var table = document.getElementById(tableID),
        rowCount = table.rows.length,
        rowIndex = btn.parentElement.parentElement.rowIndex;

    if (rowCount > rowIndex) {
        table.deleteRow(rowIndex);
    }
}

var apply_changes = function() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG826")
    });

    var action = {
        'action': 'updateFail2ban',
        'fail2ban_enable': $('#fail2ban_enable').is(":checked") ? 1 : 0,
        'enabled': $('#enabled').is(":checked") ? 'yes' : 'no',
        'bantime': $('#bantime').val(),
        'findtime': $('#findtime').val(),
        'maxretry': $('#maxretry').val(),
        'ignoreip1': '',
        'ignoreip2': '',
        'ignoreip3': '',
        'ignoreip4': '',
        'ignoreip5': '',
        // 'port': $('#udpPort').val(),
        'asterisk_maxretry': $('#asterisk_maxretry').val()
    };

    $('.ignoreip').each(function(index) {
        var value = $(this).val();

        if (value) {
            action['ignoreip' + (index + 1)] = value;
        }
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG945"),
                    callback: function() {
                        window.location.reload();
                    }
                });
            }
        }
    });
};

function initInput(type, data, tableID) {
    var dataArr = [],
        table = document.getElementById(tableID);

    if (table && data) {
        var rowID = 0;

        if (type == "action") {
            dataArr = data.split(",");
        } else if (type == "ignoreip") {
            dataArr = data.split(" ");
        }

        dataArr.each(function(val) {
            if (rowID == 0) {
                input = document.getElementById(type + "0");

                if (input) {
                    input.value = val;
                }
            } else {
                btn = document.getElementById("btn" + type + (rowID - 1));

                addRow(btn, tableID);

                input = document.getElementById(type + rowID);
                input.value = val;
            }

            rowID++;
        })
    }
}
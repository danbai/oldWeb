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
    zeroConfigSettings = {},
    zeroConfigExtensionRange = [],
    pickExtensionRange = [],
    row_subnet_ID = 0;

Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3904"));

    initValidator();

    // Reload required variables
    updateLists();

    // // Event registration
    // UCMGUI.domFunction.enableCheckBox({
    //     enableCheckBox: "datetime_enabled",
    //     enableList: ["date_format", "time_format", "timezone"]
    // }, doc);

    $(".disablecheck").bind("click", function(ev) {
        disablecheck();

        ev.stopPropagation();
    });

    setValue();    

    top.Custom.init(doc);
});

function enableCheckbox(el, isChecked) {
    $(el)[0].disabled = isChecked;

    var el = $(el)[0],
        span = el.previousSibling;

    if (span) {
        if (span.tagName != "DIV") {
            return false;
        }

        if (!isChecked) {
            if (el.tagName == "INPUT") {
                if (el.checked) {
                    span.style.backgroundPosition = "0 -50px";
                } else {
                    span.style.backgroundPosition = "0 0";
                }

                span.onmouseover = top.Custom.pushed;
                span.onmouseout = top.Custom.unpushed;
                span.onmouseup = top.Custom.check;
            }

            $(span).removeClass("disabled");
        } else {
            if (el.tagName == "INPUT") {
                if (el.checked) {
                    span.style.backgroundPosition = "0 -100px";
                } else {
                    span.style.backgroundPosition = "0 -125px";
                }

                span.onmouseover = null;
                span.onmouseout = null;
                span.onmouseup = null;
            } else {
                span.style.backgroundPosition = "0 -44px";

                $(el).unbind();
            }

            $(span).addClass("disabled");
        }
    }
}

function disablecheck() {
    var checked = !$("#zeroconfig")[0].checked;
    var datetimeSettingsDisabled = checked;

    enableCheckbox('#auto_assign', checked);
    enableCheckbox('#auto_conf_assign', checked);
    enableCheckbox('#enable_pick', checked);

    if ($('#enable_pick')[0].disabled == false && $('#enable_pick')[0].checked == true) {
        enableCheckbox('#pick_period', false);
    } else {
        enableCheckbox('#pick_period', true);
    }

    // // Date/Time Provision Settings
    // enableCheckbox('#datetime_enabled', checked);
    //
    // // Update drop down lists based on zeroconfig
    // // and datetime_enabled
    // if( checked == false )
    // {
    //     if( $("#datetime_enabled")[0].checked == true )
    //     {
    //         datetimeSettingsDisabled = false;
    //     }
    //     else
    //     {
    //         datetimeSettingsDisabled = true;
    //     }
    // }
    //
    // enableCheckbox('#date_format', datetimeSettingsDisabled);
    // enableCheckbox('#time_format', datetimeSettingsDisabled);
    // enableCheckbox('#timezone', datetimeSettingsDisabled);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "pick_period": {
                required: true,
                number: true,
                min: 0.1,
                max: 72
            },
            "subnet0": {
                privateIpv4withcidr: true
            }
        },
        submitHandler: function() {
            save_date();
        }
    });
}

function link_prompt(type) {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG843").format($P.lang("LANG3")),
        buttons: {
            ok: function() {
                top.frames["frameContainer"].module.jumpMenu('preferences.html');
            },
            cancel: function() {
                // top.dialog.container.show();
                // top.dialog.shadeDiv.show();
            }
        }
    });
}

function save_date() {
    var autoAssign = $('#auto_assign')[0];

    if (autoAssign.checked && !autoAssign.disabled) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG849"),
            buttons: {
                ok: function() {
                    updates();
                },
                cancel: function() {
                    // top.dialog.container.show();
                    // top.dialog.shadeDiv.show();
                }
            }
        });
    } else {
        updates();
    }
}

function setValue() {
    var enabledPick = (zeroConfigSettings.zc_settings.hasOwnProperty('enable_pick') && zeroConfigSettings.zc_settings.enable_pick == 'yes') ? true : false;

    $('#zeroconfig')[0].checked = (zeroConfigSettings.hasOwnProperty('enable_zeroconfig') && zeroConfigSettings.enable_zeroconfig == '1') ? true : false;
    $('#auto_assign')[0].checked = (zeroConfigSettings.zc_settings.hasOwnProperty('auto_assign') && zeroConfigSettings.zc_settings.auto_assign == 'yes') ? true : false;
    $('#auto_conf_assign')[0].checked = (zeroConfigSettings.zc_settings.hasOwnProperty('auto_conf_assign') && zeroConfigSettings.zc_settings.auto_conf_assign) ? true : false;
    $('#enable_pick')[0].checked = enabledPick;

    if (enabledPick && zeroConfigSettings.zc_settings.hasOwnProperty('pick_until_time') && zeroConfigSettings.zc_settings.pick_until_time) {
        var untilTime = zeroConfigSettings.zc_settings.pick_until_time,
            date = new Date(untilTime * 1000),
            transTime = '';

        // transTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() +
        //        ' ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();

        // added to display timezone information
        transTime = date.format("yyyy-mm-dd HH:MM:ss Z", false);
        var warningTime = $('#warning_time');
        warningTime.attr("locale", "LANG2671 '"+transTime+"'");
        warningTime[0].innerHTML = $P.lang("LANG2671") + ' ' + transTime;
        $('#warning_div').show();
    } else
        $('#warning_div').hide();

    if (!$('#enable_pick')[0].checked) {
        $('#pick_period').val('');
    } else {
        var tmp = zeroConfigSettings.zc_settings.pick_period;

        if (tmp < 0.1) {
            tmp = 0.1
        }

        $('#pick_period').val(Math.round(tmp * Math.pow(10, 1)) / Math.pow(10, 1));
    }

    $('#start_account').text(zeroConfigExtensionRange[0]);
    $('#end_account').text(zeroConfigExtensionRange[1]);
    $('#start_ext').text(pickExtensionRange[0]);
    $('#end_ext').text(pickExtensionRange[1]);

    // Data/Time Provision Settings
    // $('#datetime_enabled')[0].checked = (zeroConfigSettings.zc_settings.hasOwnProperty('datetime_enabled') && zeroConfigSettings.zc_settings.datetime_enabled ) ? true : false;
    // $('#date_format')[0].value = zeroConfigSettings.zc_settings.hasOwnProperty('date_format') ? zeroConfigSettings.zc_settings.date_format : undefined;
    // $('#time_format')[0].value = zeroConfigSettings.zc_settings.hasOwnProperty('time_format') ? zeroConfigSettings.zc_settings.time_format : undefined;
    // $('#timezone')[0].value = zeroConfigSettings.zc_settings.hasOwnProperty('timezone') ? zeroConfigSettings.zc_settings.timezone : undefined;
    var subnetArry = [];
    for (var item in zeroConfigSettings.zc_settings) {
        var itemValue = zeroConfigSettings.zc_settings[item];
        if ((item.substr(0, 6) == 'subnet')) {
            if (itemValue) {
                subnetArry.push(itemValue);
            }
        }
    }
    
    initInput("subnet", subnetArry.join(' '), "subnetTable");

    disablecheck();
}

function updates() {
    var action = {
        "action": "updateZeroConfigSettings"
    };

    action.enable_zeroconfig = $('#zeroconfig')[0].checked ? '1' : '0';
    action.auto_assign = $('#auto_assign')[0].checked ? 'yes' : 'no';
    action.enable_pick = $('#enable_pick')[0].checked ? 'yes' : 'no';
    action.pick_period = $('#pick_period').val();
    // action.datetime_enabled = $('#datetime_enabled')[0].checked ? '1' : '0';
    // action.date_format = $('#date_format')[0].value;
    // action.time_format = $('#time_format')[0].value;
    // action.timezone = $('#timezone')[0].value;
    action.datetime_enabled = 0;
    action.date_format = 0;
    action.time_format = 0;
    action.timezone = "TZA+12";
    action.auto_conf_assign = $('#auto_conf_assign')[0].checked ? '1' : '0';
    action.subnet0 = '';
    action.subnet1 = '';
    action.subnet2 = '';
    action.subnet3 = '';
    action.subnet4 = '';

    $('.subnet').each(function(index) {
        var value = $(this).val();

        if (value) {
            action['subnet' + index] = value;
        }
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown,
            //     callback: function() {
            //         UCMGUI.logoutFunction.doLogout();
            //     }
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var enabled = $('#zeroconfig')[0].checked,
                    zcScanProgress;

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        action: 'checkInfo',
                        user: $P.cookie('username')
                    },
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.clearDialog();

                        UCMGUI.loginFunction.switchToLoginPanel();
                    },
                    success: function(data) {
                        if (data && data.status == 0) {
                            zcScanProgress = data.response.zc_scan_progress;

                            UCMGUI.config.zcScanProgress = zcScanProgress;

                            zeroConfigSettings = UCMGUI.isExist.getList("getZeroConfigSettings");

                            setValue();
                        }
                    }
                });

                if (!enabled && (zcScanProgress === '1' || zcScanProgress === '2')) {
                    setTimeout(function() {
                        top.dialog.clearDialog();

                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang('LANG918')
                        });
                    }, 2000);
                }

                top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG844")
                });
            }
        }
    });
}

function updateLists() {
    zeroConfigSettings = UCMGUI.isExist.getList("getZeroConfigSettings");

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getExtenPrefSettings"
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
                var extensionPrefSettings = data.response.extension_pref_settings;

                if (extensionPrefSettings && extensionPrefSettings != {}) {
                    var zcue_start = extensionPrefSettings.zcue_start,
                        zcue_end = extensionPrefSettings.zcue_end,
                        pkue_start = extensionPrefSettings.pkue_start,
                        pkue_end = extensionPrefSettings.pkue_end;

                    zeroConfigExtensionRange = [(zcue_start ? parseInt(zcue_start) : undefined), (zcue_end ? parseInt(zcue_end) : undefined)];
                    pickExtensionRange = [(pkue_start ? parseInt(pkue_start) : undefined), (pkue_end ? parseInt(pkue_end) : undefined)];
                }

            }
        }
    });
}

function initInput(type, data, tableID) {
    var input = null,
        dataArr = [],
        table = document.getElementById(tableID);

    if (table && data) {
        var rowID = 0;

        if (type == "subnet") {
            dataArr = data.split(" ");
        }

        dataArr.each(function(val) {
            var input = document.getElementById(type + rowID);
            if ( input == null ) {
                btn = document.getElementById("btn" + type + (rowID - 1));
                addRow(btn, tableID);
                input = document.getElementById(type + rowID);
            }

            input.value = val;

            rowID++;
        });
    }
}

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
            content: $P.lang('LANG5238')
        });

        return;
    }

    var row = table.insertRow(rowCount);
    if (inputId == "subnet") {
        ++row_subnet_ID;
    }

    var colCount = table.rows[0].cells.length;

    for (var i = 0; i < colCount; i++) {

        var newcell = row.insertCell(i);

        newcell.innerHTML = table.rows[0].cells[i].innerHTML;
        switch (newcell.childNodes[0].type) {
            case "text":
                newcell.childNodes[0].value = "";
                newcell.childNodes[0].className = inputId + " isDisabled";

                if (inputId == "subnet") {
                    newcell.childNodes[0].id = inputId + row_subnet_ID;
                    newcell.childNodes[0].name = inputId + row_subnet_ID;

                    $P(newcell.childNodes[0], document).rules("add", {                        
                        required: true,
                        privateIpv4withcidr: true
                    });
                }

                break;
            case "button":
                newcell.childNodes[0].className = "btn_del isDisabled";

                if (inputId == "subnet") {
                    newcell.childNodes[0].id = btnId + row_subnet_ID;
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

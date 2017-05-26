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
    gup = UCMGUI.gup,
    mode = gup.call(window, "mode"),
    mac = gup.call(window, "mac"),
    ip = gup.call(window, "ip"),
    status = gup.call(window, "status"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    zeroconfigExtensions = [],
    zeorConifgModels = {},
    SIPAccountList = [],
    availableAccounts = account_array_minus(SIPAccountList, zeroconfigExtensions),
    selectbox = UCMGUI.domFunction.selectbox,
    selectExt_prefix = "select-ext_";

String.prototype.format = top.String.prototype.format;
Array.prototype.isArray = top.Array.prototype.isArray;

function account_array_minus(arr1, arr2) {
    var arr3 = [];

    for (var i = 0; i < arr1.length; i++) {
        var flag = true;
        for (var j = 0; j < arr2.length; j++) {
            if (arr2[j] == arr1[i]) {
                flag = false;
            }
        }
        if (flag) {
            arr3.push(arr1[i]);
        }
    }

    return arr3;
}

function checkMacIsExsit() {
    if (mode && mode == 'add') {
        var newMac = $("#new_mac").val().toLowerCase();
        var macListArr = mWindow.macListArr;
        return !UCMGUI.inArray(newMac, macListArr);
    }
}

function disableAccountSelect() {
    var checked = $("#hotdesking")[0].checked;

    if (checked) {
        $("#edit_ext").find("select").each(function(index, el) {
            $(el).attr("disabled", true);
        });
    } else {
        $("#edit_ext").find("select").each(function(index, el) {
            $(el).removeAttr("disabled");
        });
    }
}

function differentAccount(value, element) {
    var accountSelects = $('#edit_ext').find('select'),
        different = true,
        account = value;

    accountSelects.each(function() {
        if ($(this).is(element)) {
            different = true;
            return false;
        }

        if (($(this).val() == account) && account) {
            different = false;
            return false;
        }
    });

    return different;
}

function getZeroConfig(mac, ip) {
    var action = {
        "action": "getZeroConfig",
        "mac": mac,
        "original_ip": ip,
        "ip": "",
        "version": "",
        "vendor": "",
        "model": "",
        "members": "",
        "hot_desking": ""
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown,
                callback: function() {
                    // UCMGUI.logoutFunction.doLogout();
                }
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);
            if (bool) {
                var zc_devices = data.response.zc_devices,
                    members = data.response.members,
                    acct_num = 1,
                    editExtTable = document.createElement("table");

                $('#hotdesking')[0].checked = (zc_devices.hot_desking == 'yes' ? true : false);
                $('#new_mac').val(mac).attr('disabled', 'disabled');
                $('#edit_ip').val(ip);
                $('#edit_version').val(zc_devices.version).attr('disabled', 'disabled');
                $('#edit_model').val(zc_devices.model).attr('disabled', 'disabled');

                for (var i = 0, length = zeorConifgModels.length; i < length; i++) {
                    if (zc_devices.model == zeorConifgModels[i].model) {
                        acct_num = zeorConifgModels[i].num_acct;
                        break;
                    }
                }

                $("#edit_ext").append(editExtTable);

                for (var i = 1; i <= acct_num; i++) {
                    var editExtTr = document.createElement("tr"),
                        editExtTd = document.createElement("td"),
                        editIndexTd = document.createElement("td"),
                        labelIndex = document.createElement("span"),
                        selectDiv = document.createElement("div"),
                        selectExt = document.createElement("select");

                    selectExt.id = selectExt_prefix + i;
                    selectExt.name = selectExt_prefix + i;
                    // selectExt.size = '1';
                    labelIndex.innerHTML = $P.lang('LANG1422') + " " + i + ":";
                    labelIndex.className = "label";
                    editExtTd.className = "selectPosition";
                    editIndexTd.appendChild(labelIndex);
                    selectDiv.style.position = 'relative';
                    selectDiv.appendChild(selectExt);
                    editExtTd.appendChild(selectDiv);
                    editExtTr.appendChild(editIndexTd);
                    editExtTr.appendChild(editExtTd);
                    editExtTable.appendChild(editExtTr);

                    selectbox.appendOpts({
                        el: selectExt_prefix + i,
                        opts: transData(availableAccounts)
                    }, doc);

                    $("#" + selectExt_prefix + i).prepend('<option value="">' + $P.lang('LANG133') + '</option>').val('');

                    $P(selectExt).rules("add", {
                        customCallback: [$P.lang('LANG270').format($P.lang('LANG85')), differentAccount]
                    });
                }

                for (var i = 0, length = (members ? members.length : 0); i < length; i++) {
                    var index = members[i].member_index,
                        extension = members[i].extension;

                    $("#" + selectExt_prefix + index).prepend('<option value="' + extension + '">' + extension + '</option>').val(extension);
                }

                disableAccountSelect();
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "new_mac": {
                required: true,
                mac: true,
                customCallback: [$P.lang("LANG2134"), checkMacIsExsit]
            },
            "edit_ip": {
                ipDns: ["ip"]
            }
        },
        submitHandler: function() {
            save_device_form();
        }
    });
}

function save_device_form() {
    var action = {},
        members = [];

    var doSave = function() {
        $.ajax({
            type: "post",
            url: "../cgi",
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown,
                    callback: function() {
                        // UCMGUI.logoutFunction.doLogout();
                    }
                });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    // top.dialog.clearDialog();
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG815")
                    });

                    var DO_RELOAD = function() { // DO_RELOAD();
                        if (status && (status == 6 || status == 7) && mode == 'edit') {
                            upgrade();
                        }

                        mWindow.$("#zc_devices_list", mWindow.document).trigger('reloadGrid');

                        // Load required variables
                        reloadVariables();
                    };

                    setTimeout(DO_RELOAD, 1000);
                }
            }
        });
    };

    var upgrade = function() {

        function after(res) {
            top.dialog.clearDialog();

            if (res && res.status == '0') {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG829")
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: "Wrong!"
                });
            }
        }

        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG2692"),
            buttons: {
                ok: function() {
                    // top.dialog.dialogMessage({ type: 'loading', content: $P.lang("LANG829")});
                    $.ajax({
                        type: "GET",
                        url: "../cgi?action=DownloadCfg&mac=" + mac,
                        error: function(jqXHR, textStatus, errorThrown) {},
                        success: after
                    });
                },
                cancel: function() {
                    top.dialog.clearDialog();
                }
            }
        });
    };

    action["action"] = (mode == 'edit' ? "updateZeroConfig" : "addZeroConfig");
    action["hot_desking"] = $('#hotdesking')[0].checked ? 'yes' : 'no';
    action["mac"] = $('#new_mac').val();

    if (mode == 'edit') {
        action["original_ip"] = ip;
    }

    action["ip"] = $('#edit_ip').val();
    action["version"] = $('#edit_version').val();
    action["model"] = $('#edit_model').val();

    if (action["hot_desking"] != 'yes') {
        $("#edit_ext").find("select").each(function(index, el) {
            var member = {},
                el_id = $(el).attr('id'),
                el_id_arr = el_id.split('_'),
                value = $(el).val();

            if (value) {
                member.member_index = parseInt(el_id_arr[1]);
                member.extension = value;
                members.push(member);
            }
        });
    }

    action["members"] = JSON.stringify(members);

    if (status && (status == 6 || status == 7) && mode == 'edit') {
        action["state"] = 8;
    }

    if ($('#hotdesking')[0].checked) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG2630").format(mac),
            buttons: {
                ok: doSave,
                cancel: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            }
        });

        return false;
    }

    doSave();
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};
        obj["val"] = res[i];
        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function reloadVariables() {
    zeroconfigExtensions = UCMGUI.isExist.getList("getZeroconfigExtension");

    zeorConifgModels = UCMGUI.isExist.getList("getZeroConfigModel");

    SIPAccountList = getExtList(UCMGUI.isExist.getList("getSIPAccountList"));

    availableAccounts = account_array_minus(SIPAccountList, zeroconfigExtensions);
}

function getExtList(res, cb) {
    if (!res) {
        return;
    }

    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var extension = res[i].extension;

        arr.push(extension);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

$(function() {
    $P.lang(doc, true);

    // Load required variables
    reloadVariables();

    initValidator();

    if (mode === "add") {
        var acct_num = 1,
            editExtTable = document.createElement("table");

        $("#edit_ext").append(editExtTable);

        for (var i = 1; i <= acct_num; i++) {
            var editExtTr = document.createElement("tr"),
                editExtTd = document.createElement("td"),
                editIndexTd = document.createElement("td"),
                labelIndex = document.createElement("span"),
                selectDiv = document.createElement("div"),
                selectExt = document.createElement("select");

            selectExt.id = selectExt_prefix + i;
            selectExt.name = selectExt_prefix + i;
            // selectExt.size = '1';
            labelIndex.innerHTML = $P.lang('LANG1422') + " " + i + ":";
            labelIndex.className = "label";
            editExtTd.className = "selectPosition";
            editIndexTd.appendChild(labelIndex);
            selectDiv.style.position = 'relative';
            selectDiv.appendChild(selectExt);
            editExtTd.appendChild(selectDiv);
            editExtTr.appendChild(editIndexTd);
            editExtTr.appendChild(editExtTd);
            editExtTable.appendChild(editExtTr);

            selectbox.appendOpts({
                el: selectExt_prefix + i,
                opts: transData(availableAccounts)
            }, doc);

            $("#" + selectExt_prefix + i).prepend('<option value="">' + $P.lang('LANG133') + '</option>').val('');

            $P(selectExt).rules("add", {
                customCallback: [$P.lang('LANG270').format($P.lang('LANG85')), differentAccount]
            });
        }
    } else if (mode == 'edit') {
        getZeroConfig(mac, ip);
    }

    $(".disablecheck").bind("click", function(ev) {
        disableAccountSelect();

        top.Custom.init(doc);
        ev.stopPropagation();
    });

    top.Custom.init(doc);
});
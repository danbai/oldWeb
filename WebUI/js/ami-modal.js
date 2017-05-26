/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    extensionPrefSettings = mWindow.extensionPrefSettings,
    ifExisted = UCMGUI.inArray,
    mode = gup.call(window, "mode"),
    user = gup.call(window, "user"),
    oldUserName = "",
    oldDom = "";

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;

$(function() {
    $P.lang(doc, true);

    bindEvent();

    initValidator();

    isEnableWeakPw();

    if (mode === 'edit') {
        getAMIUserInfo(user);
    } else {
        top.Custom.init(doc);
    }
});

function addRow(btn, tableID) {

    var table = doc.getElementById(tableID),
        rowIndex = btn.parentElement.parentElement.rowIndex,
        rowCount = table.rows.length,
        existDenyList = [],
        existPermitList = [],
        row_ID;

    // if (rowCount >= 10) {
    //     top.dialog.clearDialog();
    //     top.dialog.dialogMessage({
    //         type: 'error',
    //         content: $P.lang("LANG808").format(10, $P.lang('LANG1845'))
    //     });
    //     return;
    // }

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
                specialIpAddress: true
            });
        } else {
            switch (newcell.childNodes[0].type) {
                case "text":
                    newcell.childNodes[0].value = "";
                    newcell.childNodes[0].id = (tableID == 'denyTable' ? 'denyIP' : "permitIP") + row_ID;
                    newcell.childNodes[0].name = (tableID == 'denyTable' ? 'denyIP' : "permitIP") + row_ID;
                    $P(newcell.childNodes[0]).rules("add", {
                        required: true,
                        ipAddress: true,
                        differentIPs: [$('#form')]
                    });
                    break;
                case "button":
                    newcell.childNodes[0].className = "btn_del";
                    newcell.childNodes[0].id = (tableID == 'denyTable' ? 'btnDeny' : "btnPermit") + row_ID;
                    newcell.childNodes[0].onclick = Function("deleteRow(this, '" + tableID + "');");
                    break;
            }
        }
    }

    top.Custom.init((tableID == 'denyTable' ? document.getElementById('denyTable') : document.getElementById('permitTable')));

    top.dialog.repositionDialog();
}

function bindEvent() {
    var pri_all = $('#chk_pri_all'),
        chk_pri = $(".chk_pri");

    pri_all.bind("click", function(ev) {
        var pri_chkbox_all = function(value) {
            var children = $('#all_pri_container').children().find("input");

            for (var i = 0; i < children.length; i++) {
                if (children[i].type == 'checkbox') {
                    children[i].checked = value;
                }

                if (value) {
                    $(children[i]).prev().css("backgroundPosition", "0px -50px");
                } else {
                    $(children[i]).prev().css("backgroundPosition", "0px 0px");
                }
            }
        };

        var all = $('#chk_pri_all')[0];

        if (all.checked) {
            pri_chkbox_all(true);
        } else {
            pri_chkbox_all(false);
        }
    });

    chk_pri.bind("click", function(ev) {
        if (chk_pri.filter(":checked").length != chk_pri.length) {
            pri_all[0].checked = false;
            pri_all.prev().css("backgroundPosition", "0px 0px");
        } else {
            pri_all[0].checked = true;
            pri_all.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });
}

function confirm_reboot() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG2709").format($P.lang("LANG844")),
        buttons: {
            ok: UCMGUI.loginFunction.confirmReboot,
            cancel: function() {
                ReloadAMI();
            }
        }
    });
}

function deleteRow(btn, tableID) {
    var table = doc.getElementById(tableID),
        rowCount = table.rows.length,
        rowIndex = btn.parentElement.parentElement.rowIndex;

    if (rowCount > rowIndex) {
        table.deleteRow(rowIndex);
    }

    top.dialog.repositionDialog();
}

function checkIfDefaultName(val, ele) {
    var isDefault = true;

    if (val === 'cgi' || val === 'pyuser') {
        isDefault = false;
    }

    return isDefault;
}

function checkPriRequired(element, value) {
    if ($('input.chk_pri').length) {
        return true;
    }

    return false;
}

function getAMIUserInfo(name) {
    var action = {
        "action": "getAmiUser",
        "user": name
    };

    $.ajax({
        type: "post",
        url: "../cgi",
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
                var AMIUser = data.response.user,
                    secret = AMIUser.secret,
                    pri = AMIUser.pri,
                    priList = pri.split(',');

                oldUserName = name;

                $('#username').val(name).attr({'disabled': true});
                $('#secret').val(secret);

                for (var i = 0, length = priList.length, ele; i < length; i++) {
                    ele = $('#' + priList[i])[0];

                    if (ele) {
                        ele.checked = true;
                    }
                }

                var chk_pri = $(".chk_pri");

                if (chk_pri.filter(":checked").length == chk_pri.length) {
                    $('#chk_pri_all')[0].checked = true;
                }

                if (AMIUser.permit) {
                    var permitAddresses = AMIUser.permit.split(';'),
                        permitLength = permitAddresses.length,
                        // denyAddresses = AMIUser.deny.split(';'),
                        // denyLength = denyAddresses.length,
                        i = 1;

                    // for (i; i < denyLength; i++) {
                    //     addRow(doc.getElementById('btnDeny0'), "denyTable");
                    // }

                    for (i = 1; i < permitLength; i++) {
                        addRow(doc.getElementById('btnPermit0'), "permitTable");
                    }

                    // if (denyAddresses.length) {
                    //     $('#denyTable input[position="left"]').each(function(index) {
                    //         var deny = denyAddresses[index].split('\/');

                    //         $(this)
                    //             .val(deny[0])
                    //             .closest('tr').find('[position="right"]').val(deny[1]);
                    //     });
                    // }

                    if (permitAddresses.length) {
                        $('#permitTable input[position="left"]').each(function(index) {
                            var permit = permitAddresses[index].split('\/');

                            $(this)
                                .val(permit[0])
                                .closest('tr').find('[position="right"]').val(permit[1]);
                        });
                    }
                }

                oldDom = getDomStr();

                top.Custom.init(doc);

                top.dialog.repositionDialog();
            }
        }
    });
}

function getDomStr() {
    var domStr = "",
        dom = $("input");

    dom.each(function() {
        if (this.type == 'checkbox') {
            domStr += (this.checked ? "yes" : "no");
        } else {
            domStr += this.value;
        }
    });

    return domStr;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "username": {
                required: true,
                minlength: 8,
                letterDigitUndHyphen: true,
                customCallback: [$P.lang("LANG3530"), checkIfDefaultName],
                isExist: [$P.lang("LANG2137"), userNameIsExist]
            },
            "secret": {
                required: true,
                keyboradNoSpacesemicolon: true,
                minlength: 6
            },
            "originate": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG2811').toLowerCase()), checkPriRequired]
            },
            "permitIP0": {
                required: function(element) {
                    return $('#permitNetmask0').val() ? true : false;
                },
                ipAddress: true,
                differentIPs: [$('#form')]
            },
            "permitNetmask0": {
                required: function(element) {
                    return $('#permitIP0').val() ? true : false;
                },
                specialIpAddress: true
            }
        },
        submitHandler: function() {
            var action = {},
                pri = [],
                bPri = true;

            $('#all_pri_container').find('input').each(function() {
                if (this.checked) {
                    bPri = false;
                    return false;
                }
            });

            if (bPri) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG3531").format(1, $P.lang("LANG1069")),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
                return;
            }

            action["action"] = (mode == 'edit' ? "updateAmiUser" : "addAmiUser");
            action["user"] = $('#username').val();
            action["secret"] = $('#secret').val();

            $('input.chk_pri').each(function() {
                var id = $(this).attr('id');

                if ($(this).is(':checked') && (id !== 'chk_pri_all')) {
                    pri.push(id);
                }
            });

            action["pri"] = pri.join(',');

            var permitTable = $('#permitTable input[position="left"]'),
                permitLength = permitTable.length,
                permitIPs = '';
                // denyTable = $('#denyTable input[position="left"]'),
                // denyLength = denyTable.length,
                // denyIPs = '',

            // denyTable.each(function(index) {
            //     var ip = $(this).val(),
            //         netmask = $(this).closest('tr').find('[position="right"]').val();

            //     if (index < denyLength - 1) {
            //         denyIPs += ip + '/' + netmask + ';';
            //     } else {
            //         if (ip && netmask) {
            //             denyIPs += ip + '/' + netmask;
            //         } else {
            //             denyIPs = '';
            //         }
            //     }
            // });

            permitTable.each(function(index) {
                var ip = $(this).val(),
                    netmask = $(this).closest('tr').find('[position="right"]').val();

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

            updateOrAddAMIUserInfo(action);
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

function ReloadAMI() {
    var DO_RELOAD = function() { // DO_RELOAD();
        var mainScreen = top.frames['frameContainer'].frames['mainScreen'];

        mainScreen.$("#ami_list", mainScreen.document).trigger('reloadGrid');

        mWindow.getNameList();
    };

    setTimeout(DO_RELOAD, 500);
}

function updateOrAddAMIUserInfo(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                if (mode === "edit") {
                    var newDom = getDomStr();

                    if (oldDom != newDom) {
                        confirm_reboot();
                    } else {
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG815")
                        });

                        ReloadAMI();
                    }
                } else {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG815")
                    });

                    ReloadAMI();
                }
            }
        }
    });
}

function userNameIsExist() {
    var userName = $("#username").val(),
        amiNameList = mWindow.amiNameList,
        tmpUserNameList = [];

    tmpUserNameList = amiNameList.copy(tmpUserNameList);

    if (oldUserName) {
        tmpUserNameList.remove(oldUserName);
    }

    return !UCMGUI.inArray(userName, tmpUserNameList);
}

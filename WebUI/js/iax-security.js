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
    callNumberLimitsList = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.contains = top.Array.prototype.contains;
Array.prototype.indexOf = top.Array.prototype.indexOf;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG683"));

    getIAXSecSettings();

    initValidator();

    hideCallNumberLimitsForm();
});

function getIAXSecSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getIAXSecSettings"
        },
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
                var response = data.response,
                    iaxSecuritySettings = response.iax_security_settings,
                    calllimitSettings = response.iax_security_calllimit_settings;

                $.each(calllimitSettings, function(index, val) {
                    var limitStr = val.callnumberlimits;

                    pushNewCallNumberLimit(limitStr);
                });

                UCMGUI.domFunction.updateDocument(iaxSecuritySettings, document);

                // $('#calltokenoptional').val(iaxSecuritySettings.calltokenoptional);
                // $('#maxcallnumbers').val(iaxSecuritySettings.maxcallnumbers < 0 ? '' : iaxSecuritySettings.maxcallnumbers);
                // $('#maxcallnumbers_nonvalidated').val(iaxSecuritySettings.maxcallnumbers_nonvalidated < 0 ? '' : iaxSecuritySettings.maxcallnumbers_nonvalidated);
            }

            top.Custom.init(doc);
        }
    });
}

function isExist() {
    var limits = $("#iax_security_calllimit_settings").children(),
        limitsLen = limits.length,
        limitsArr = [],
        limitsIp = $("#form_newCallNumberLimit_ip").val(),
        maxcallnumbers = $("#form_newCallNumberLimit_maxcallnumbers").val(),
        limit = limitsIp + "=" + maxcallnumbers;

    for (var i = 0; i < limitsLen; i++) {
        limitsArr[i] = limits.eq(i).attr("id");
    }

    if ($.inArray(limit, limitsArr) < 0) {
        return true
    } else {
        return false;
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "calltokenoptional": {
                iporrange: true
            },
            "maxcallnumbers": {
                required: true,
                digits: true,
                range: [0, 65535]
            },
            "maxcallnumbers_nonvalidated": {
                required: true,
                digits: true,
                range: [0, 65535]
            },
            "form_newCallNumberLimit_ip": {
                required: true,
                iporrange: true,
                isLimitsExist: [$P.lang("LANG2389"), isExist]
            },
            "form_newCallNumberLimit_maxcallnumbers": {
                required: true,
                digits: true
            }
        },
        newValidator: true
    });
}

function updateIAXSecSettings() {
    $P("#form_newCallNumberLimit_ip", document).rules("remove", "required iporrange isLimitsExist");

    $P("#form_newCallNumberLimit_maxcallnumbers", document).rules("remove", "required digits");

    if ($P("#form", document).valid()) {
        hideCallNumberLimitsForm();

        var action = {},
            children = $("#iax_security_calllimit_settings").children(),
            arr = [];
        // calltokenoptional = $('#calltokenoptional').val(),
        // maxcallnumbers = $('#maxcallnumbers').val(),
        // maxcallnumbers_nonvalidated = $('#maxcallnumbers_nonvalidated').val();

        action = UCMGUI.formSerializeVal(doc);
        action["action"] = "updateIAXSecSettings";
        // action["calltokenoptional"] = calltokenoptional;
        // action["maxcallnumbers"] = maxcallnumbers ? maxcallnumbers : -1;
        // action["maxcallnumbers_nonvalidated"] = maxcallnumbers_nonvalidated ? maxcallnumbers_nonvalidated : -1;

        $.each(children, function(index, item) {
            arr.push($(item).attr("id"));
        });

        action["callnumberlimits"] = arr.join(";");

        $.ajax({
            type: "post",
            url: "../cgi",
            data: action,
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
                        content: $P.lang("LANG815")
                    });
                }
            }
        });
    }
}

function showCallNumberLimitsForm() {
    UCMGUI.domFunction.updateElementValue({
        el: "form_newCallNumberLimit_ip",
        val: ""
    }, doc);

    UCMGUI.domFunction.updateElementValue({
        el: "form_newCallNumberLimit_maxcallnumbers",
        val: ""
    }, doc);

    $('.form_newCallNumberLimit').show();

    $("#dAddCallNumberLimit").hide();
}

function hideCallNumberLimitsForm() {
    $('.form_newCallNumberLimit').hide();

    $("#dAddCallNumberLimit").show();

    // $($('.form_newCallNumberLimit')[0]).show();
}

function pushNewCallNumberLimit(limitStr) {
    if (limitStr) {
        var p = limitStr.split("="),
            newIp = p[0],
            newMaxcallnumbers = p[1];
    } else {
        var newIp = $('#form_newCallNumberLimit_ip').val(),
            newMaxcallnumbers = $('#form_newCallNumberLimit_maxcallnumbers').val();
    }

    // var tmp_pieces = newIp.split("/");
    // && !ASTGUI.validateFields(['form_newCallNumberLimit_ip'])

    if (!callNumberLimitsList.contains(newIp + "=" + newMaxcallnumbers)) {
        callNumberLimitsList.push(newIp + "=" + newMaxcallnumbers);

        clearCallNumberLimitsForm();

        refreshCallNumberLimitsList();
    } else if (!limitStr) {
        return;
    }
}

function addNewCallNumberLimit() {
    $P("#form_newCallNumberLimit_ip", document).rules("add", {
        required: true,
        iporrange: true,
        isLimitsExist: [$P.lang("LANG2389"), isExist]
    });

    $P("#form_newCallNumberLimit_maxcallnumbers", document).rules("add", {
        required: true,
        digits: true
    });

    if ($P("#form", document).validate().element($("#form_newCallNumberLimit_ip")) && $P("#form", document).validate().element($("#form_newCallNumberLimit_maxcallnumbers"))) {
        pushNewCallNumberLimit();

        $P("#form_newCallNumberLimit_ip", document).rules("remove", "required iporrange isLimitsExist");

        $P("#form_newCallNumberLimit_maxcallnumbers", document).rules("remove", "required digits");
    }
}

function deleteCallNumber(indexno) {
    callNumberLimitsList.splice(indexno, 1);

    refreshCallNumberLimitsList();
}

function clearCallNumberLimitsForm() {
    UCMGUI.domFunction.updateElementValue({
        el: "form_newCallNumberLimit_ip",
        val: ""
    }, doc);

    UCMGUI.domFunction.updateElementValue({
        el: "form_newCallNumberLimit_maxcallnumbers",
        val: ""
    }, doc);
}

function refreshCallNumberLimitsList() {
    $('#iax_security_calllimit_settings').empty();

    for (var i = 0; i < callNumberLimitsList.length; i++) {
        var pieces = callNumberLimitsList[i].split("="),
            row_div = document.createElement('div'),
            sp_delete = document.createElement('span');

        row_div.id = callNumberLimitsList[i];
        row_div.innerHTML = pieces[0] + " = " + pieces[1];

        sp_delete.className = 'callnumber_delete';
        sp_delete.innerHTML = '&nbsp;';
        sp_delete.id = "callNumberLimit" + i;

        row_div.appendChild(sp_delete);

        document.getElementById('iax_security_calllimit_settings').appendChild(row_div);

        $('#callNumberLimit' + i).click(function(e) {
            deleteCallNumber($(this).attr('id').substr(15));
        });
    }
}
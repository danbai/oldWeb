/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    row_email_ID = 0,
    UCMGUI = top.UCMGUI,
    role = top.$.cookie('role'),
    config = UCMGUI.config,
    gup = UCMGUI.gup,
    id = gup.call(window, "id"),
    isEmailRequired = false;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    top.document.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2546"));

    initValidator();

    getEmailAddresses();

    getEventList();

    $("#email0").focus();

    $('.link').on('click', function() {
        var sUrl = "email_template.html";

        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG843").format($P.lang('LANG4572')),
            buttons: {
                ok: function() {
                    top.frames['frameContainer'].module.jumpMenu(sUrl);
                },
                cancel: function() {}
            }
        });
    });

    if (role !== 'privilege_0') {
        $('#superEmailTable input[type="text"]').each(function(index) {
            this.disabled = true;
        });

        $('#superEmailTable button').each(function(index) {
            this.disabled = true;
        });
        if (role !== 'privilege_1') {
            $('span.link').hide();
        }
    }
});

function checkIsRequired(val, ele) {
    var superEmail0Val = $("#superEmail0").val();
    var email0Val = $("#email0").val();

    if (superEmail0Val  == "" && email0Val == "" && isEmailRequired) {
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
            "superEmail0": {
                isRequiredOrNot: [$('#superEmailTable')],
                customCallback: [$P.lang("LANG2150"), checkIsRequired],
                email: true,
                differentEmails: [$('#superEmailTable')]
            },
            "email0": {
                isRequiredOrNot: [$('#emailTable')],
                email: true,
                differentEmails: [$('#emailTable')]
            }
        },
        //newValidator: true,
        submitHandler: function() {
            var email_addresses = "",
                superEmail_addresses = "",
                rowCount = document.getElementById('emailTable').rows.length,
                superRowCount = document.getElementById('superEmailTable').rows.length;

            $('#emailTable input[type="text"]').each(function(index) {
                if (index === (rowCount - 1)) {
                    email_addresses += $(this).val();
                } else {
                    email_addresses += ($(this).val() + ',');
                }
            });
            $('#superEmailTable input[type="text"]').each(function(index) {
                if (index === (superRowCount - 1)) {
                    superEmail_addresses += $(this).val();
                } else {
                    superEmail_addresses += ($(this).val() + ',');
                }
            });
            setEmailAddresses(email_addresses, superEmail_addresses);
        }
    });
    
    var table = document.getElementById("emailTable");
    var superTable = document.getElementById("superEmailTable");
    var rowsLen = table.rows.length;
    var superRowsLen = superTable.rows.length;

    for (var i = 1; i < rowsLen; i++) {
        newcell = table.rows[i].childNodes[0];
        if (newcell) {
            switch (newcell.childNodes[0].type) {
                case "text":
                    $P(newcell.childNodes[0]).rules("add", {
                        required: true,
                        email: true,
                        differentEmails: [$('#emailTable')]
                    });
                    break;
                case "button":
                    //newcell.childNodes[0].onclick = Function("deleteEmailRow(this, '" + tableID + "');");
                    break;
            }
        }
    }
    for (var i = 1; i < superRowsLen; i++) {
        newcell = superTable.rows[i].childNodes[0];
        if (newcell) {
            switch (newcell.childNodes[0].type) {
                case "text":
                    $P(newcell.childNodes[0]).rules("add", {
                        required: true,
                        email: true,
                        differentEmails: [$('#superEmailTable')]
                    });
                    break;
                case "button":
                    //newcell.childNodes[0].onclick = Function("deleteEmailRow(this, '" + tableID + "');");
                    break;
            }
        }
    }
}

function getEmailAddresses() {
    var action = 'action=warningGetEmailSettings';

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
                var email = data.response.body.email,
                    email_addresses_string = email ? email : "",
                    email_addresses_array = email_addresses_string.split(','),
                    superEmail = data.response.body.admin_email,
                    superEmail_addresses_string = superEmail ? superEmail : "",
                    superEmail_addresses_array = superEmail_addresses_string.split(',');;

                renderEmail(email_addresses_array);
                renderSuperEmail(superEmail_addresses_array);
            }
        }
    });
}

function getEventList() {
    var action = 'action=warningGetGeneralSettings';

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
                var warning_general = data.response.body.warning_general;
                for (var i = 0; i < warning_general.length; i++) {
                    if (warning_general[i].enable_email == "1") {
                        var superEmail0Val = $("#superEmail0").val(),
                            email0Val = $("#email0").val();
                        if (superEmail0Val != "") {
                            // $P("#superEmail0", document).rules("add", {
                            //     required: true
                            // });
                            isEmailRequired = true;
                        } else if(email0Val != "") {
                            // $P("#email0", document).rules("add", {
                            //     required: true
                            // });
                            isEmailRequired = true;
                        } else if(superEmail0Val == "" && email0Val == "") {
                            $P("#superEmail0", document).rules("add", {
                                required: true
                            });
                        }
                    }
                };
            }
        }
    });
}

function setEmailAddresses(addresses, superAddress) {
    var stop_cmd = "action=reloadWarning&warningStop=",
        start_cmd = "action=reloadWarning&warningStart=";

    function cb(addresses, superAddress) {
        var emailAction;

        if (role === 'privilege_0') {
            emailAction = {
                "action": "warningUpdateEmailSettings",
                "admin_email": superAddress,
                "email": addresses
            };
        } else {
            emailAction = {
                "action": "warningUpdateEmailSettings",
                "admin_email": "",
                "email": addresses
            };
        }

        $.ajax({
            type: "post",
            url: "/cgi",
            async: false,
            data: emailAction,
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
                        content: $P.lang('LANG2583')
                    });

                    if (id && ($("#superEmail0").val() != "" || $("#email0").val() != "" )) {
                        var saveAction = {
                            "action": "warningUpdateGeneralSettings",
                            "enable": "",
                            "enable_email": "1",
                            "id": id.toString()
                        };

                        $.ajax({
                            type: "post",
                            url: "/cgi",
                            async: false,
                            data: saveAction,
                            error: function (jqXHR, textStatus, errorThrown) {
                                // top.dialog.dialogMessage({
                                //     type: 'error',
                                //     content: errorThrown
                                // });

                                top.frames['frameContainer'].module.jumpMenu("warning_contact.html");

                                StartCMD();
                            },
                            success: function(data) {
                                top.frames['frameContainer'].module.jumpMenu("warning_contact.html");

                                StartCMD();
                            }
                        });
                    } else {
                        StartCMD();
                    }
                }
            }
        });
    }

    function StartCMD() {
        $.ajax({
            type: "GET",
            url: "/cgi",
            async: false,
            data: start_cmd,
            success: function() {}
        });
    }

    $.ajax({
        type: "GET",
        url: "/cgi",
        async: false,
        data: stop_cmd,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                cb(addresses, superAddress);
            }
        }
    });
}

function renderEmail(emails) {
    var length = emails.length;

    if (length > 1) {
        for (var i = 1; i < length; i++) {
            addEmailRow(document.getElementById('btnemail0'), 'emailTable');
        }
    }

    $('#emailTable input[type="text"]').each(function(index) {
        $(this).val(emails[index]);
    });
}

function renderSuperEmail(emails) {
    var length = emails.length;

    if (length > 1) {
        for (var i = 1; i < length; i++) {
            addEmailRow(document.getElementById('btnSuperEmail0'), 'superEmailTable');
        }
    }

    $('#superEmailTable input[type="text"]').each(function(index) {
        $(this).val(emails[index]);
    });
}

function addEmailRow(btn, tableID) {

    var table = document.getElementById(tableID);

    var rowIndex = btn.parentElement.parentElement.rowIndex;

    var rowCount = table.rows.length;

    if (rowCount >= 10) {
        top.dialog.clearDialog();
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG2574")
        });
        return;
    }

    var row = table.insertRow(rowCount);

    ++row_email_ID;

    var colCount = table.rows[0].cells.length;

    for (var i = 0; i < colCount; i++) {

        if (i > 1) {
            continue;
        }

        var newcell = row.insertCell(i);
        newcell.innerHTML = table.rows[0].cells[i].innerHTML;

        switch (newcell.childNodes[0].type) {
            case "text":
                newcell.childNodes[0].value = "";
                newcell.childNodes[0].id = "email" + row_email_ID;
                newcell.childNodes[0].name = "email" + row_email_ID;
                $P(newcell.childNodes[0]).rules("add", {
                    required: true,
                    email: true,
                    differentEmails: [$('#' + tableID)]
                });
                break;
            case "button":
                newcell.childNodes[0].className = "btn_del";
                newcell.childNodes[0].id = "btnemail" + row_email_ID;
                newcell.childNodes[0].onclick = Function("deleteEmailRow(this, '" + tableID + "');");
                break;
        }
    }
}

function deleteEmailRow(btn, tableID) {
    var table = document.getElementById(tableID),
        rowCount = table.rows.length,
        rowIndex = btn.parentElement.parentElement.rowIndex;

    if (rowCount > rowIndex) {
        table.deleteRow(rowIndex);
    }
}
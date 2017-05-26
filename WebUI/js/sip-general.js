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
    //domains = ['domain0', 'domain1', 'domain2', 'domain3', 'domain4', 'domain5', 'domain6', 'domain7', 'domain8', 'domain9'],
    bindportVal,
    // srvlookupVal,
    bindaddrVal,
    bindAddrV6Val;

String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;

deleteRowLikeDomain = UCMGUI.deleteRowLikeDomain;
addRowLikeDomain = UCMGUI.addRowLikeDomain;

/*
function deleteRowLikeDomain(btn, tableID) {
    var table = doc.getElementById(tableID),
        rowCount = table.rows.length,
        rowIndex = btn.parentElement.parentElement.rowIndex;

    if (rowCount > rowIndex) {
        table.deleteRow(rowIndex);
    }
}

function addRowLikeDomain(config) {
    var tableId = config.tableId,
        rowNamePrefix = config.rowNamePrefix,
        rowIndex = config.rowIndex,
        rowidPrefix = config.rowIdPrefix ? config.rowIdPrefix : config.rowNamePrefix;
        maxRow = config.maxRow ? config.maxRow : 10;
        validRules = config.validRules;

    if(typeof tableId === "undefined") return;
    if(typeof rowNamePrefix === "undefined") return;
    
    var table = doc.getElementById(tableId),
        rowCount = table.rows.length,
        row_domain_ID;

    if (rowCount >= maxRow) {
        top.dialog.clearDialog();
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG948")
        });
        return;
    }

    var row = table.insertRow(rowCount),
        colCount = table.rows[0].cells.length;

    if (rowIndex) {
        row_domain_ID = rowIndex;
    } else {
        var existDomainList = [];
        $('#'+ tableId +' input[type="text"]').each(function() {
            existDomainList.push(parseInt($(this).attr('id').substr(rowNamePrefix.length)));
        });

        for (var i = 0; i < 10; i++) {
            if (!ifExisted(i, existDomainList)) {
                break;
            }
        }

        row_domain_ID = i;
    }

    for (var i = 0; i < colCount; i++) {

        var newcell = row.insertCell(i);

        newcell.innerHTML = table.rows[0].cells[i].innerHTML;

        switch (newcell.childNodes[0].type) {
            case "text":
                rowidPrefix = rowidPrefix ? rowidPrefix : rownamePrefix;
                newcell.childNodes[0].value = "";
                newcell.childNodes[0].id = rowidPrefix + row_domain_ID;
                newcell.childNodes[0].name = rowNamePrefix + row_domain_ID;

                if(validRules) {
                    $P(newcell.childNodes[0]).rules("add", validRules);
                }
                break;
            case "button":
                newcell.childNodes[0].className = "btn_del";
                newcell.childNodes[0].id = "btn" + rowNamePrefix + row_domain_ID;
                newcell.childNodes[0].onclick = Function("deleteRowLikeDomain(this, '" + tableId + "');");
                break;
        }
    }
}
*/

function confirm_reboot() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG832")
    });

    $.ajax({
        type: "GET",
        url: "../webcgi?action=reboot",
        success: function(data) {
            if (typeof data == "string" && data.contains("Authentication failed")) {
                UCMGUI.logoutFunction.doLogout();
                return;
            }

            // setTimeout("top.window.location.reload();", 120000);
            top.window.location.reload();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (errorThrown != null && errorThrow.length > 0) {
                top.dialog.clearDialog();

                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG853")
                });
            }
        }
    })
}

function fnSaveChanges() {
    var domPortVal = $("#bindport").val(),
        action = {};

    action = UCMGUI.formSerializeVal(doc);

    action["action"] = "updateSIPGenSettings";

    // $.each(domains, function(item, value) {
    //     if (!action.hasOwnProperty(value)) {
    //         action[value] = '';
    //     }
    // });

    // Should remove later?
    var newJail = new listOfSynActions('jail.conf'),
        actionStr = "iptables-multiport[name=asterisk-udp, port=\"" + domPortVal + "\", protocol=udp]";

    newJail.new_action("update", "asterisk-udp", "action", actionStr);
    newJail.callActions();
    
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang('LANG826')
    });

    $.ajax({
        type: "post",
        url: '../cgi',
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var after = function() {
                        top.dialog.clearDialog();

                        var domPortVal = $("#bindport").val(),
                            // domSrvlookupVal = ($("#srvlookup")[0].checked ? 'yes' : 'no'),
                            domAddrVal = $("#bindaddr").val(),
                            domAddrV6Val = $("#bindaddr6").val();

                        var showDialog = function() {
                                top.dialog.dialogConfirm({
                                    confirmStr: $P.lang("LANG926"),
                                    buttons: {
                                        ok: UCMGUI.loginFunction.confirmReboot,
                                        cancel: function() {
                                            // bindportVal = $("#bindport").val();
                                            // bindaddrVal = $("#bindaddr").val();
                                            // bindAddrV6Val = $("#bindaddr6").val();
                                            // srvlookupVal = ($("#srvlookup")[0].checked ? 'yes' : 'no');
                                        }
                                    }
                                });
                            };

                        // if ((domPortVal && bindportVal != domPortVal) || (domAddrVal && bindaddrVal != domAddrVal) || (domSrvlookupVal && srvlookupVal != domSrvlookupVal)) {
                        if ((domPortVal && bindportVal != domPortVal) || (domAddrVal && bindaddrVal != domAddrVal)|| (domAddrV6Val && bindAddrV6Val != domAddrV6Val)) {
                            if (domPortVal && bindportVal != domPortVal) {
                                $.ajax({
                                    type: "post",
                                    url: '../cgi',
                                    async: false,
                                    data: {
                                        'action': 'updateFail2ban',
                                        'port': domPortVal
                                    },
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
                                            showDialog();
                                        }
                                    }
                                });

                                return false;
                            }

                            showDialog();
                        } else {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG4764")
                            });
                        }

                        // if (domPortVal) {
                        //     var newJail = new listOfActions('jail.conf');
                        //     var actionStr = "iptables-multiport[name=asterisk-udp, port=\"" + domPortVal + "\", protocol=udp]";
                        //     newJail.new_action("update", "asterisk-udp", "action", actionStr);
                        //     newJail.callActions();
                        // }
                    };

                setTimeout(function() {
                    after();
                }, 300);
            }
        }
    });
}

function getSIPGenSettings() {
    var action = {
        "action": "getSIPGenSettings"
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
                var data = data.response.sip_general_settings;

                if (data) {
                    for (var item in data) {
                        var element = $("#" + item),
                            itemValue = data[item];

                        if ((item.substr(0, 6) == 'domain')) {
                            /* var id = parseInt(item.substr(6));

                            if (id > 0 && itemValue) {
                                addRowLikeDomain(doc, {
                                    "tableId" : "domainTable",           
                                    "rowIndex" : id,
                                    "rowNamePrefix" : "domain",
                                    "validRules" : {
                                        required : true,
                                        host : ['domain']
                                    }
                                });

                                doc.getElementById("domain" + id).value = itemValue;
                            } else {
                                element.val(itemValue);
                            } */
                        } else if (element.attr('type') == 'checkbox') {
                            element[0].checked = (itemValue == 'yes' ? true : false);
                        } else {
                            element.val(itemValue);
                        }
                    }
                }
            } else {
                setDefaultValue();
            }

            top.Custom.init(doc);

            bindportVal = $("#bindport").val();
            bindaddrVal = $("#bindaddr").val();
            bindAddrV6Val = $("#bindaddr6").val();
            // srvlookupVal = ($("#srvlookup")[0].checked ? 'yes' : 'no');
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "context": {
                required: true,
                letterswithbasicpunc: true
            },
            "realm": {
                required: true,
                alphanumeric: true
            },
            "bindport": {
                required: true,
                digits: true,
                range: [1, 65535]
            },
            "bindaddr": {
                required: true,
                ipAddress: true
            },
            "bindaddr6": {
                required: true,
                ipv6: true
            },
            // "domain0": {
            //     host: ['domain']
            //     // host: true  //TODO comma sperate
            // },
            // "fromdomain": {
            //     host: ['domain']
            // },
            "mwi_from": {
                alphanumeric: true
            }
        },
        submitHandler: function() {
            if ($("#allowguest").is(":checked")) {
                top.dialog.dialogConfirm({
                    type: "warning",
                    confirmStr: $P.lang("LANG2536").format($P.lang("LANG1745")),
                    buttons: {
                        ok: function() {
                            fnSaveChanges();
                        }
                    }
                });
            } else {
                fnSaveChanges();
            }
        }
    });
}

function setDefaultValue() {
    var fields = UCMGUI.findInputFields(doc);

    for (var i = 0; i < fields.length; i++) {
        var val = $(fields[i]).attr("dfalt"),
            noSerialize = $(fields[i]).attr("noSerialize");

        if (!noSerialize && val.length != 0) {
            if ($(fields[i]).is(":hidden")) {
                continue;
            }

            if ($(fields[i]).is(":disabled")) {
                continue;
            }

            switch (fields[i].type) {
                case 'textarea':
                case 'text':
                    fields[i].value = '';

                    if (val) {
                        fields[i].value = val;
                    }

                    break;
                case 'checkbox':
                    fields[i].checked = false;

                    if (val = 'y') {
                        fields[i].checked = true;
                    }

                    break;
                default:
                    break;
            }
        }
    };
}

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG701"));

    // $("#btndomain0").on('click', function(){
    //         addRowLikeDomain(doc, {
    //             "tableId": "domainTable", 
    //             "rowNamePrefix" : "domain",
    //             "validRules" : {
    //                 required : true,
    //                 host : ['domain']
    //             }
    //         })
    //     }
    // );

    getSIPGenSettings();

    initValidator();

    top.Custom.init(doc);
});

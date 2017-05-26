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
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    zeroconfigErr = {
        "1": "LANG918",
        "2": "LANG919",
        "3": "LANG920",
        "4": "LANG2538"
    };

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.format = top.String.prototype.format;
String.prototype.lChop = top.String.prototype.lChop;

$(function() {
    $P.lang(doc, true);

    // this will be the main window
    var ip = gup.call(window, "ip"),
        ipList = (ip ? ip.split(',') : []),
        ipTable = document.createElement("TABLE"),
        thead = document.createElement("thead"),
        tr = document.createElement("tr");

    ipTable.className = "table_record";
    tr.style.fontSize = "8pt";

    for (var i = 0; i < 2; i++) {
        var th = document.createElement("th");

        if (i == 0) {
            var checkall_input = document.createElement("input");

            checkall_input.id = "checkall";
            checkall_input.type = "checkbox";

            th.appendChild(checkall_input);
        } else if (i == 1) {
            var disnameSpan = document.createElement("span");

            disnameSpan.innerHTML = $P.lang("LANG155");

            th.appendChild(disnameSpan);
        }

        th.style.textAlign = "center";

        tr.appendChild(th);
    }

    thead.appendChild(tr);
    ipTable.appendChild(thead);

    var tbody = document.createElement("tbody");

    $.each(ipList, function(key, value) {
        if (UCMGUI.isIPv6(value)) {
            return;
        }
        if (value) {
            var record_tr = document.createElement("tr"),
                checkbox_td = document.createElement("td"),
                ip_td = document.createElement("td"),
                checkbox_input = document.createElement("input");
            if (UCMGUI.isIPv6(value)) {
                value = value.split(']:')[0] + "]";
            } else {
                value = value.split(':')[0];
            }

            checkbox_input.id = value;
            checkbox_input.className = "check";
            checkbox_input.type = "checkbox";
            ip_td.style.textAlign = "center";
            ip_td.id = value;
            checkbox_td.appendChild(checkbox_input);
            checkbox_input.style.left = "100px";

            ip_td.appendChild(document.createTextNode(value));
            record_tr.appendChild(checkbox_td);
            record_tr.appendChild(ip_td);
            tbody.appendChild(record_tr);
        }
    });

    ipTable.appendChild(tbody);

    $("#ipList").append(ipTable);

    var checkall = $('#checkall'),
        chkIP = $(".check");

    checkall.bind("click", function(ev) {
        var checkAll = function(value) {
            var children = chkIP;

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

        if (this.checked) {
            checkAll(true);
        } else {
            checkAll(false);
        }
    });

    chkIP.bind("click", function(ev) {
        if (chkIP.filter(":checked").length != chkIP.length) {
            checkall[0].checked = false;
            checkall.prev().css("backgroundPosition", "0px 0px");
        } else {
            checkall[0].checked = true;
            checkall.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });

    $("#rebootSubmit").click(function() {
        var ipLists = getSelectedIPs();

        if (ipLists.length > 0) {
            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG834"),
                buttons: {
                    ok: function() {
                        top.dialog.clearDialog();

                        $.ajax({
                            type: "GET",
                            url: "../cgi",
                            data: {
                                "action": "rebootDevice",
                                "ip": ipLists.join(',')
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
                                    var res = data.response.rebootDevice;

                                    if (res == "Send REBOOT !") {
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG829")
                                        });
                                    } else {
                                        var num = res.lChop("ZCERROR_");

                                        top.dialog.dialogMessage({
                                            type: 'error',
                                            content: $P.lang(zeroconfigErr[num] ? zeroconfigErr[num] : "LANG909")
                                        });
                                    }
                                }
                            }
                        });
                    },
                    cancel: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                }
            });
        } else {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG3531").format('1', $P.lang("LANG155").toLowerCase()),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });
        }
    });

    top.Custom.init(doc);
});

function getSelectedIPs(mode) {
    var extension = gup.call(window, "extension"),
        ipLists = [];

    $("#ipList input:not('#checkall')").each(function() {
        var ip = $(this).attr("id");

        if (ip.length > 0 && $(this)[0].checked) {
            ipLists.push(extension + '@' + ip);
        }
    });

    return ipLists;
}

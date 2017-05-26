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
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    netHDLCSettings = [],
    trunkNameList = [],
    groupNameList = [],
    digitalGroupList = [],
    signallingType = "",
    encapsulationObj = {
        "hdlc": "HDLC",
        "hdlc-eth": "HDLC-ETH",
        "cisco": "Cisco",
        "fr": "Frame Relay",
        "ppp": "PPP"
    },
    nethdlc = [],
    retryTimeout = null,
    retryFlag = true,
    pingcheck = 0,
    rxcheck = 0;

String.prototype.format = top.String.prototype.format;

$(function() {
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3573"));
    initTable();
    getNameList();
    listDigitalGroup();
    getSignallingType();
    $P.lang(doc, true);
});

function listDataTrunk() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "listDataTrunk"
        },
        success: function(data) {
            if (data.status == 0) {
                netHDLCSettings = data.response.nethdlc_settings;

                if (netHDLCSettings) {
                    renderPRITable(netHDLCSettings);
                }
            }
        }
    });
}

function initTable() {
    checkNetHdlcStatus("firstLoad");
    if (UCMGUI.config.model_info.num_pri) {
        listDataTrunk();
    }
    if (retryFlag) {
        retryFlag = false;
        retryTimeout = window.setInterval(function() {
            checkNetHdlcStatus();
        }, 6000);
    }
    bindButtonEvent();
}

function bindButtonEvent() {
    var theadContent = ["LANG84", "LANG237", "LANG74"];

    $(".edit").delegate(theadContent, "click", function() {
        var url = "html/trunks_data_modal.html?";
        var span = $(this).attr("span");
        url += "span=" + span;

        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG3573"),
            displayPos: "editForm",
            frameSrc: url
        });
    });
    $(".reconnection").delegate(theadContent, "click", function() {
        $(this).removeClass("reconnection").addClass("reconnecting").attr({
            localetitle: "LANG3890",
            title: $P.lang("LANG3890"),
            disabled: true
        });
        $.ajax({
            url: baseServerURl,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                "action": "reloadNetHDLC",
                "nethdlc": ""
            },
            success: function(data) {
                top.dialog.dialogMessage({
                    type: 'info',
                    content: $P.lang("LANG3875")
                });
                UCMGUI.config.promptNetHDLC = true;
                // if (retryFlag) {
                //     retryFlag = false;
                //     retryTimeout = window.setInterval(function() {
                //         checkNetHdlcStatus();
                //     }, 6000);
                // }
            }
        });

    });
    $(".switch").delegate(theadContent, "click", function() {
        var $this = $(this),
            id = parseInt($this.attr('id')),
            item = $this.attr('item'),
            value = parseInt($this.attr('value')),
            stop_cmd = "action=reloadWarning&warningStop=",
            start_cmd = "action=reloadWarning&warningStart=";

        var switchButton = function(div, id, item, value) {
            var action = {},
                hdlc0Enable = $("#hdlc0__enable");
            action["action"] = "updateNetHDLC";
            action["hdlc0__enable"] = value;
            action["hdlc0__default"] = value;
            if (value == 0) {
                action["group_index"] = "";
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG904")
            });
            $.ajax({
                type: "GET",
                url: "/cgi",
                async: false,
                data: action,
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);
                    var applyChanges = $("#applyChanges_Button", top.frames["frameContainer"].document),
                        lineButton = $("#line_Button", top.frames["frameContainer"].document);

                    if (applyChanges.length > 0 && lineButton.length > 0 && !applyChanges.is(':animated')) {
                        applyChanges.css("visibility", "visible");
                        lineButton.css("visibility", "visible");
                        // applyChanges.effect("shake", {
                        //  direction: "up", distance: 2, times: 10000
                        // }, 400);
                    }
                    if (bool) {
                        top.dialog.clearDialog();

                        top.dialog.dialogConfirm({
                            confirmStr: $P.lang("LANG927"),
                            buttons: {
                                ok: applyChangeAndReboot
                            }
                        });

                        if (value == 1) {
                            div.css({
                                'background-image': 'url(../images/switch_on_bg.png)'
                            }, 300).children('div.thumb').animate({
                                left: 12
                            }, 300);
                            div.attr({
                                "value": "0",
                                "localetitle": "LANG2599"
                            });
                            $P.lang(document, true);
                            initTable();
                        } else if (value == 0) {
                            div.css({
                                'background-image': 'url(../images/switch_off_bg.png)'
                            }).children('div.thumb').animate({
                                left: -12
                            }, 300);
                            div.attr({
                                "value": "1",
                                "localetitle": "LANG2598"
                            });
                            $("td").eq(0).html("<span class='LANG3152' localetitle='LANG2394' title='Unreachable' ></span>");
                            $(".reconnecting").removeClass("reconnecting").addClass("reconnection disabled").attr({
                                localetitle: "LANG3874",
                                title: $P.lang("LANG3874"),
                                disabled: true
                            });
                            $(".reconnection").addClass("disabled").attr("disabled", true);
                            window.clearInterval(retryTimeout);
                            retryTimeout = null;
                            retryFlag = true;
                            $P.lang(document, true);
                        }
                        //initTable();
                        getNetHDLC();
                    }
                }
            });
        };

        if (value == 1) {
            if (nethdlc.group_index) {
                switchButton($this, id, item, value);
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG3877")
                });
            }
        } else if (value == 0) {
            switchButton($this, id, item, value);
            // window.clearInterval(retryTimeout);
            // retryTimeout = null;
            // retryFlag = true;
        }

        return false;
    });
}

function renderPRITable(netHDLCSettings) {

    $("#dataTrunkstable").empty();

    var table = $("#dataTrunkstable"),
        thead = $("<thead>").appendTo(table).addClass("thead"),
        tbody = $("<tbody>").appendTo(table).addClass("tbody");

    // render thead
    var theadContent = ["LANG81", "LANG2772", "LANG237", "LANG3558", "LANG74"],
        tr = $("<tr>").addClass("frow").appendTo(thead);

    for (var i = 0; i < theadContent.length; i++) {
        var spanTh = $("<th>").appendTo(tr);

        $("<span>").appendTo(spanTh).css('cursor', 'default').attr("locale", theadContent[i]).html($P.lang(theadContent[i]));
    }

    // render tbody

    for (var i = 0; i < netHDLCSettings.length; i++) {
        var netHDLCSettingsIndex = netHDLCSettings[i],
            tr = $("<tr>").appendTo(tbody);

        if (netHDLCSettingsIndex) {
            var status = netHDLCSettingsIndex.hdlc0__enable,
                hardhdlc = netHDLCSettingsIndex.hardhdlc,
                encapsulation = netHDLCSettingsIndex.hdlc0__encapsulation,
                span = Number(netHDLCSettingsIndex.span) - 2,
                options = "";
            if (status == 0) {
                $("<td>").appendTo(tr).html("<span class='LANG3152'></span>");
            } else {
                $("<td>").appendTo(tr).html(transStatus());
            }
            $("<td>").appendTo(tr).html($P.EMSwitchBox(1, "enable", status.toString()));
            $("<td>").appendTo(tr).html(span);
            $("<td>").appendTo(tr).html(encapsulationObj[encapsulation]);
            if (status == 1) {
                options = "<button type='button' class='options edit' span='" + span + "' localetitle='LANG738' title='Edit'></button><button type='button' class='options reconnection' localetitle='LANG3874' title='Reconnection'></button>";
            } else {
                options = "<button type='button' class='options edit' span='" + span + "' localetitle='LANG738' title='Edit'></button><button type='button' class='options reconnection disabled' localetitle='LANG3874' title='Reconnection' disabled='disabled'></button>"
            }
            $("<td>").appendTo(tr).html(options);
        }
    }

    $("#dataTrunkstable tbody tr:even").addClass("even");
    $("#dataTrunkstable tbody tr:odd").addClass("odd");
}

function getNameList() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            "action": "listDigitalTrunk",
            "options": "trunk_name,group_index"
        },
        success: function(data) {
            var res = data.response;
            if (res && data.status == 0) {
                var digitalTrunks = res.digital_trunks;
                //trunkNameList.length = 0;
                groupNameList.length = 0;
                for (var i = 0; i < digitalTrunks.length; i++) {
                    var digitalTrunksIndex = digitalTrunks[i];
                    //trunkNameList.push(digitalTrunksIndex.trunk_name);
                    groupNameList.push(String(digitalTrunksIndex.group_index));
                }
            }
            getNetHDLC();
        }
    });
}

function getNetHDLC() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getNetHDLC",
            "group_index": ""
        },
        success: function(data) {
            if (data.status == 0) {
                nethdlc = data.response.nethdlc_settings;
            }
        }
    });
}

function listDigitalGroup() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        data: {
            action: "listDigitalGroup",
            options: "group_name,group_index"
        },
        success: function(data) {
            if (data && data.status == 0) {
                var res = data.response;
                if (res) {
                    var digitalGroup = res.digital_group;
                    var arr = [];
                    for (var i = 0; i < digitalGroup.length; i++) {
                        var digitalGroupIndex = digitalGroup[i];
                        var obj = {};
                        obj["text"] = digitalGroupIndex.group_name;
                        obj["val"] = digitalGroupIndex.group_index;
                        arr.push(obj);
                    }
                    digitalGroupList = arr;
                }
            }
        }
    });
}

function getSignallingType() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getDigitalHardwareSettings",
            signalling: ""
        },
        success: function(data) {
            if (data.status == 0) {
                var priSettings = data.response.digital_driver_settings;
                if ($.isArray(priSettings)) {
                    signallingType = priSettings[0]["signalling"];
                }
            }
        }
    });
}

function checkNetHdlcStatus(firstLoad) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: 'getnethdlcStatus',
            "auto-refresh": Math.random()
        },
        async: false,
        success: function(data) {
            var res = data.response;
            if (res) {
                pingcheck = Number(res.pingcheck);
                rxcheck = Number(res.rxcheck);
                if (!firstLoad) {
                    $("td").eq(0).html(transStatus());
                }
            }
        }
    });
}

function applyChangeAndReboot() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG832")
    });
    // delete interval while reboot.
    if (top.$.gsec && top.$.gsec.stopSessionCheck) {
        top.$.gsec.stopSessionCheck();
    }

    $(document).unbind('mousemove mouseenter scroll keydown click dblclick');
    top.window.clearInterval(top.loginInterval);
    top.loginInterval = null;

    window.clearInterval(retryTimeout);
    retryTimeout = null;
    retryFlag = true;

    //$.ajax({
        //url: UCMGUI.config.paths.baseServerURl + "?action=applyChanges&settings",
        //type: "GET",
        //success: function(data) {
    UCMGUI.loginFunction.confirmReboot();
        //}
    //});
}

function transStatus() {
    var status = "<span class='LANG3152'></span>";
    var reconnecting = $(".reconnecting");
    var isChangeStatus = false;

    if (pingcheck == 9) {
        status = "<span class='LANG3152' localetitle='LANG113' title='Unavailable' ></span>";
        isChangeStatus = true;
    } else if (pingcheck == 8 || rxcheck == 8) {
        status = "<span class='LANG2232' localetitle='LANG2396' title='Reachable'></span>";
        isChangeStatus = true;
    } else if (pingcheck == 1) {
        status = "<span class='LANG3152' localetitle='LANG3882' title='Please check the cable' ></span>";
        isChangeStatus = true;
    } else if (pingcheck == 7) {
        status = "<span class='LANG3152' localetitle='LANG3883' title='Please check the remote IP' ></span>";
        isChangeStatus = true;
    }
    if (isChangeStatus) {
        reconnecting.removeClass("reconnecting").addClass("reconnection").attr({
            localetitle: "LANG3874",
            title: $P.lang("LANG3874"),
            disabled: false
        });
        UCMGUI.config.promptNetHDLC = false;
    }
    return status;
}
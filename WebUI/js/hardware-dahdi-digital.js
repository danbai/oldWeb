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
    // fxsSettings = [],
    // fxoSettings = [],
    // briSettings = [],
    priSettings = [],
    ss7Settings = [],
    mfcR2Settings = [],
    digitalGroup = [],
    digitalGroupE1 = [],
    digitalGroupT1 = [],
    digitalGroupJ1 = [],
    globalSettings = {},
    oldAlawoverride = "",
    digitalTrunkGroupIndexList = [],
    dataTrunkGroupIndexList = [],
    digitalTrunkChannelList = [],
    dataTrunkChannelList = [],
    otherTrunkChannelList = [],
    digitalTrunkChannelObj = {},
    dataTrunkChannelObj = {},
    otherChannelObj = {},
    groupSpan = 0,
    groupSpanType = "",
    groupHardhdlc = -1;

String.prototype.format = top.String.prototype.format;
Array.prototype.indexOf = top.Array.prototype.indexOf;

$(function() {
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG686"));
    initTable();

    listDataTrunk();
    listDigitalTrunk();
    $P.lang(doc, true);
});


function getPRISettings(PRISettings) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getDigitalHardwareSettings"
        },
        success: function(data) {
            if (data.status == 0) {
                priSettings = data.response.digital_driver_settings;

                if (!PRISettings) {
                    listDigitalGroup();
                    renderPRITable(priSettings);
                }
            }
        }
    });
}

function getDigitalHardwareSS7Settings() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getDigitalHardwareSS7Settings"
        },
        success: function(data) {
            if (data.status == 0) {
                ss7Settings = data.response.ss7_settings;
            }
        }
    });
}

function getDigitalHardwareR2Settings() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getDigitalHardwareR2Settings"
        },
        success: function(data) {
            if (data.status == 0) {
                mfcR2Settings = data.response.mfc_r2_settings;
            }
        }
    });
}

function listDigitalGroup() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "listDigitalGroup"
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                digitalGroup = data.response.digital_group;
            }
        }
    });
}

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
                var netHDLCSettings = data.response.nethdlc_settings;
                for (var i = 0; i < netHDLCSettings.length; i++) {
                    var netHDLCSettingsIndex = netHDLCSettings[i];
                    dataTrunkGroupIndexList.push(String(netHDLCSettingsIndex.group_index));
                }
            }
        }
    });
}

function listDigitalTrunk() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            "action": "listDigitalTrunk",
            "options": "group_index"
        },
        success: function(data) {
            var res = data.response;
            if (res && data.status == 0) {
                var digitalTrunks = res.digital_trunks;
                for (var i = 0; i < digitalTrunks.length; i++) {
                    var digitalTrunksIndex = digitalTrunks[i];
                    digitalTrunkGroupIndexList.push(String(digitalTrunksIndex.group_index));
                }
            }
        }
    });
}

function initTable() {
    if (UCMGUI.config.model_info.num_pri) {
        getPRISettings();
        getDigitalHardwareSS7Settings();
        getDigitalHardwareR2Settings();
    }
    bindButtonEvent();
}

function bindButtonEvent() {
    var theadContent = ["LANG84", "LANG237", "LANG74"];

    $(".edit, .room_addUser").delegate(theadContent, "click", function showEditAnalogForm() {
        var lang = "LANG780",
            type = $(this).attr("id"),
            url = "html/hardware_dahdi_digital_modal.html?type=" + type;

        if (type == "FXO") {
            lang = "LANG2343";
        } else if (type == "BRI") {
            lang = "LANG2878";
        } else if (type == "PRI") {
            var span = $(this).attr("span");

            lang = "LANG3096";
            url += "&span=" + span;
        } else if (type == "addGroup") {
            var span = $(this).attr("span");
            var hardhdlc = Number(JSON.parse(span).hardhdlc),
                digitalGroupArr = [];

            for (var i = 0; i < digitalGroup.length; i++) {
                var digitalGroupIndex = digitalGroup[i];

                //if (spanInfo.span == digitalGroupIndex.span) {
                digitalGroupArr.push(digitalGroupIndex.channel);
                //}
            }

            lastArr = getTotalArr(digitalGroupArr);
            var otherArr = getOtherArr(lastArr, hardhdlc);
            var str = getChannelRange(otherArr);
            var strArr = str.split(",");
            lastOtherArr = getGroupChannel(strArr);

            var channelEle = $("#digital_channel");
            var lastOtherArrLen = getTotalNum(lastOtherArr);

            if (lastOtherArr.length == 0) {
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'error',
                    content: "No channel."
                });
                return;
            }

            lang = "LANG3135";
            url += "&span=" + span;
        }

        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang(lang),
            displayPos: "editForm",
            frameSrc: url
        });
    });
}

function renderPRITable(priSettings) {
    $('#digital_settings').show();

    $("#digitalcardstable").empty();

    var table = $("#digitalcardstable"),
        thead = $("<thead>").appendTo(table).addClass("thead"),
        tbody = $("<tbody>").appendTo(table).addClass("tbody");

    // render thead
    var theadContent = ["LANG84", "LANG237", "LANG74"],
        tr = $("<tr>").addClass("frow").appendTo(thead);

    for (var i = 0; i < theadContent.length; i++) {
        var spanTh = $("<th>").appendTo(tr);

        $("<span>").appendTo(spanTh).css('cursor', 'default').attr("locale", theadContent[i]).html($P.lang(theadContent[i]));
    }

    // render tbody

    for (var i = 0; i < priSettings.length; i++) {
        var priSettingsIndex = priSettings[i],
            tr = $("<tr>").appendTo(tbody);

        if (priSettingsIndex) {
            var totleChans = 31,
                spanType = priSettingsIndex.span_type,
                hardhdlc = priSettingsIndex.hardhdlc,
                span = priSettingsIndex.span;

            if (spanType.toLowerCase() == "t1" || spanType.toLowerCase() == "j1") {
                totleChans = 24;
            }

            var spanInfo = {};

            spanInfo["span"] = span;
            spanInfo["spanType"] = spanType;
            spanInfo["totleChans"] = totleChans;
            spanInfo["hardhdlc"] = hardhdlc;


            $("<td width='30%'>").appendTo(tr).html("<span id=" + span + " type=" + spanType + " name='selecttag' class='options room_noselect' totleChans=" + totleChans + " hardhdlc=" + hardhdlc + "></span>" + "<span class='spanType'>" + spanType + "</span>");
            $("<td width='30%'>").appendTo(tr).html(i + 1);
            $("<td width='40%'>").appendTo(tr).html("<button type='button' class='options edit' id='PRI' span='" + span + "' localetitle='LANG738' title='Edit'></button><button type='button' class='options room_addUser' id='addGroup' span='" + JSON.stringify(spanInfo) + "' localetitle='LANG3135' title='Add Group'></button>");
        }
    }

    $("[name='selecttag']").bind("click", function(ev) {
        var me = $(this);

        if (me.hasClass("room_noselect")) {
            renderGroupTable(me);
        } else {
            var tr = me.closest("tr"),
                next = tr.next();

            me.removeClass("room_select").addClass("room_noselect");

            next.hide();
        }

        ev.stopPropagation();
    });

    setTimeout(function() {
        $("[name='selecttag']").trigger("click");
    }, 100);

    $("#digitalcardstable tbody tr:even").addClass("even");

    $("#digitalcardstable tbody tr:odd").addClass("odd");
}

function renderGroupTable(me) {
    me.removeClass("room_noselect").addClass("room_select");

    var tr = me.closest("tr"),
        next = tr.next();

    if (next.find("table").length == 0) {
        var selectTr = $("<tr>").insertAfter(tr),
            selectTd = $("<td>").attr({
                colspan: 3,
                width: "100%"
            }).addClass("noPadding").appendTo(selectTr);

        var table = $("<table>").attr({
            cellpadding: "0",
            cellspacing: "0",
            border: "0",
            id: "digitalGroup",
            width: "100%"
        }).appendTo(selectTd);

        // render thead
        var tbody = $("<tbody>").appendTo(table).addClass("tbody"),
            tr = $("<tr>").appendTo(tbody);

        $("<span>").addClass("groupTh").attr("locale", "LANG2887").html($P.lang("LANG2887")).appendTo($("<td width='30%'>").appendTo(tr));
        $("<span>").addClass("groupTh").attr("locale", "LANG101").html($P.lang("LANG101")).appendTo($("<td width='30%'>").appendTo(tr));
        $("<span>").addClass("groupTh").attr("locale", "LANG74").html($P.lang("LANG74")).appendTo($("<td width='40%'>").appendTo(tr));

        var spanId = Number(me.attr("id")),
            spanType = me.attr("type").toLowerCase();

        digitalGroupE1.length = 0;
        digitalGroupT1.length = 0;
        digitalGroupJ1.length = 0;
        digitalTrunkChannelObj = {};
        dataTrunkChannelObj = {};
        otherChannelObj = {};
        digitalTrunkChannelList.length = 0;
        dataTrunkChannelList.length = 0;
        otherTrunkChannelList.length = 0;

        for (var i = 0; i < digitalGroup.length; i++) {
            var digitalGroupIndex = digitalGroup[i];

            if (spanId == digitalGroupIndex.span) {
                var groupTr = $("<tr>").appendTo(tbody),
                    totleChans = me.attr("totleChans"),
                    hardhdlc = me.attr("hardhdlc"),
                    groupName = digitalGroupIndex.group_name,
                    channel = digitalGroupIndex.channel,
                    groupIndex = String(digitalGroupIndex.group_index);

                if (digitalTrunkGroupIndexList.indexOf(groupIndex) != -1) {
                    digitalTrunkChannelObj[channel] = {
                        "group_name": groupName,
                        "group_index": groupIndex,
                        "channel": channel
                    };
                    digitalTrunkChannelList.push(channel);

                } else if (dataTrunkGroupIndexList.indexOf(groupIndex) != -1) {
                    dataTrunkChannelObj[channel] = {
                        "group_name": groupName,
                        "group_index": groupIndex,
                        "channel": channel
                    };
                    dataTrunkChannelList.push(channel);
                } else {
                    otherChannelObj[channel] = {
                        "group_name": groupName,
                        "group_index": groupIndex,
                        "channel": channel
                    };
                    otherTrunkChannelList.push(channel);
                }
                digitalGroupIndex.totleChans = totleChans;
                digitalGroupIndex.hardhdlc = hardhdlc;
                digitalGroupIndex.spanType = spanType;

                if (spanType == "e1") {
                    digitalGroupE1.push(digitalGroupIndex);
                } else if (spanType == "t1") {
                    digitalGroupT1.push(digitalGroupIndex);
                } else if (spanType == "j1") {
                    digitalGroupJ1.push(digitalGroupIndex);
                }

                $("<td>").html(groupName).appendTo(groupTr);
                $("<td>").html(channel).appendTo(groupTr);

                if (groupName.indexOf('DefaultGroup') > -1) {
                    $("<td>").html("<button type='button' class='options edit' spanType='editGroup' groupInfo='" + JSON.stringify(digitalGroupIndex) + "' localetitle='LANG3135' title='Edit Group'></button><button type='button' disabled='disabled' class='options del disabled' groupName='" + groupName + "' spanType='" + spanType + "' channel='" + channel + "' hardhdlc='" + hardhdlc + "' localetitle='LANG739' title='Delete'></button>").appendTo(groupTr);
                } else {
                    $("<td>").html("<button type='button' class='options edit' spanType='editGroup' groupInfo='" + JSON.stringify(digitalGroupIndex) + "' localetitle='LANG3135' title='Edit Group'></button><button type='button' class='options del' groupName='" + groupName + "' spanType='" + spanType + "' span='" + spanId + "' channel='" + channel + "' hardhdlc='" + hardhdlc + "' localetitle='LANG739' title='Delete'></button>").appendTo(groupTr);
                }
            }
        }

        $("#digitalGroup tbody tr:even").addClass("even");
        $("#digitalGroup tbody tr:odd").addClass("odd");

        $(".edit", "#digitalGroup").bind("click", function(ev) {
            var type = $(this).attr("spanType"),
                groupInfo = $(this).attr("groupInfo"),
                url = "html/hardware_dahdi_digital_modal.html?type=" + type + "&span=" + groupInfo;

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3136"),
                displayPos: "editForm",
                frameSrc: url
            });

            ev.stopPropagation();
        });

        $(".del", "#digitalGroup").bind("click", function(ev) {
            var groupName = $(this).attr("groupName"),
                channel = $(this).attr("channel"),
                digitalGroupInfo = [],
                spanType = $(this).attr("spanType"),
                hardhdlc = Number($(this).attr("hardhdlc")),
                digitalGroupArr = [],
                digitalGroupObj = {},
                arr = [],
                actionObj = {};

            groupSpan = $(this).attr("span");
            groupSpanType = spanType;
            groupHardhdlc = hardhdlc;

            if (spanType == "e1") {
                digitalGroupInfo = digitalGroupE1;
            } else if (spanType == "t1") {
                digitalGroupInfo = digitalGroupT1;
            } else if (spanType == "j1") {
                digitalGroupInfo = digitalGroupJ1;
            }

            var totalChannelArr = getTotalChannelArr(spanType, hardhdlc);

            for (var i = 0; i < digitalGroupInfo.length; i++) {
                var obj = {},
                    digitalGroupObj = {},
                    digitalGroupInfoIndex = digitalGroupInfo[i],
                    digitalGroupName = digitalGroupInfoIndex.group_name,
                    digitalGroupIndex = digitalGroupInfoIndex.group_index,
                    digitalGroupSpan = digitalGroupInfoIndex.span,
                    digitalGroupChannel = digitalGroupInfoIndex.channel,
                    originChannelLength = getTotalNum(digitalGroupChannel ? digitalGroupChannel.split(",") : []);

                if ((spanType == digitalGroupInfoIndex.spanType) && (groupName == digitalGroupName)) {
                    obj["channel"] = '';
                    digitalGroupObj["channel"] = '';
                } else if (spanType == digitalGroupInfoIndex.spanType) {
                    digitalGroupChannel = getChannel(originChannelLength, totalChannelArr);

                    obj["channel"] = digitalGroupChannel;
                    digitalGroupObj["channel"] = digitalGroupChannel;
                }

                obj["group_name"] = digitalGroupName;

                obj["group_index"] = digitalGroupIndex;
                digitalGroupObj["group_index"] = digitalGroupIndex;
                digitalGroupObj["span"] = digitalGroupSpan;
                arr.push(obj);
                digitalGroupArr.push(digitalGroupObj);
            }

            actionObj["group"] = arr;
            digitalGroup = digitalGroupArr;

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(groupName),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            data: {
                                action: "updateAllDigitalGroup",
                                group: JSON.stringify(actionObj)
                            },
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
                                    if (isModifyGroupChanneOfDataTrunk()) {
                                        top.dialog.dialogConfirm({
                                            confirmStr: $P.lang("LANG927"),
                                            buttons: {
                                                ok: applyChangeAndReboot,
                                                cancel: function() {
                                                    getPRISettings();
                                                    bindButtonEvent();
                                                }
                                            }
                                        });
                                    } else {
                                        top.dialog.clearDialog();

                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG816"),
                                            callback: function() {
                                                getPRISettings();
                                                bindButtonEvent();
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    },
                    cancel: function() {
                        top.dialog.container.hide();
                        top.dialog.shadeDiv.hide();
                    }
                }
            });

            ev.stopPropagation();
        });
    } else {
        next.show();
    }
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

    //$.ajax({
        //url: UCMGUI.config.paths.baseServerURl + "?action=applyChanges&settings",
        //type: "GET",
        //success: function(data) {
    UCMGUI.loginFunction.confirmReboot();
        //}
    //});
}

function isModifyGroupChanneOfDataTrunk() {
    var flag = false,
        groupInfoGroupIndex = undefined,
        groupInfoSpan = undefined,
        spanType = groupSpanType,
        hardhdlc = Number(groupHardhdlc),
        groupInfoSpan = Number(groupSpan);

    var totalChannelArr = getTotalChannelArr(spanType, hardhdlc);

    for (var i = 0; i < digitalGroup.length; i++) {
        var digitalGroupIndex = digitalGroup[i],
            channel = digitalGroupIndex.channel,
            groupIndex = digitalGroupIndex.group_index,
            originChannelLength = getTotalNum(channel ? channel.split(",") : []);

        if ((groupInfoSpan == digitalGroupIndex.span) && (groupInfoGroupIndex == groupIndex)) {
            var currentChannelLength = Number($("#channel").val());

            channel = getChannel(currentChannelLength, totalChannelArr);
        } else if (groupInfoSpan == digitalGroupIndex.span) {
            channel = getChannel(originChannelLength, totalChannelArr);
        }
        if (!$.isEmptyObject(dataTrunkChannelObj)) {
            for (var prop in dataTrunkChannelObj) {
                if (dataTrunkChannelObj.hasOwnProperty(prop)) {
                    var dataTrunkChannelObjProp = dataTrunkChannelObj[prop],
                        propGroupIndex = Number(dataTrunkChannelObjProp["group_index"]),
                        propChannel = dataTrunkChannelObjProp["channel"];

                    if ((propGroupIndex == groupIndex) && (propChannel != channel)) {
                        flag = true;
                        break;
                    }
                }
            }
        }
        if (flag) {
            break;
        }
    }
    return flag;
}

function getTotalChannelArr(spanType, hardhdlc) {
    var totalChannelLen = 0,
        totalChannelArr = [],
        spanType = spanType.toLowerCase(),
        hardhdlc = Number(hardhdlc);

    if (spanType == "e1") {
        totalChannelLen = 31;
    } else if (spanType == "t1" || spanType == "j1") {
        totalChannelLen = 24;
    }

    for (var j = 1; j <= totalChannelLen; j++) {
        if (hardhdlc != j) {
            totalChannelArr.push(j);
        }
    }
    return totalChannelArr;
}

function getTotalNum(arr) {
    var num = 0;
    for (var k = 0; k < arr.length; k++) {
        var index = arr[k];
        if (/-/.test(index)) {
            var first = index.match(/^\d+/);
            var last = index.match(/\d+$/);
            if (first && last) {
                first = Number(first[0]);
                last = Number(last[0]);
                num += (last - first + 1)
            }
        } else {
            num += 1;
        }
    };
    return num;
}

function getChannel(length, arr) {
    var curentChansArr = arr.splice(0, length);
    var str = getChannelRange(curentChansArr);
    var strArr = str.split(",");
    return getGroupChannel(strArr).toString();
}

function getChannelRange(arr) {
    var str = "";
    for (var i = 0; i < arr.length; i++) {
        var before = Number(arr[i]);
        var after = Number(arr[i + 1]);

        if ((before + 1) != after) {
            str += (before + ",");
        } else {
            str += (before + "-");
        }
    }
    return str;
}

function getGroupChannel(arr) {
    var lastArr = [];
    for (var i = 0; i < arr.length; i++) {
        var strArrIndex = arr[i];
        if (/-/.test(strArrIndex)) {
            var first = strArrIndex.match(/^\d+/);
            var last = strArrIndex.match(/\d+$/);
            if (first && last) {
                lastArr.push(first[0] + "-" + last[0]);
            }
        } else if (strArrIndex) {
            lastArr.push(strArrIndex);
        }
    }
    return lastArr;
}

function getOtherArr(arr, hardhdlc) {
    var totalChansLen = getTotalChans(),
        otherArr = [];
    for (var l = 1; l <= totalChansLen; l++) {
        var index = arr[l];
        if (arr.indexOf(String(l)) == -1) {
            if (l != hardhdlc) {
                otherArr.push(l);
            }
        }

    }
    return otherArr;
}

function getTotalArr(arr) {
    var totalArr = [];
    for (var i = 0; i < arr.length; i++) {
        var index = arr[i];
        var indexArr = [];

        if (/,/.test(index)) {
            indexArr = index.split(",");
        }
        if (indexArr.length == 0) {
            totalArr = totalArr.concat(getEndTotalArr(index));
        } else {
            for (var j = 0; j < indexArr.length; j++) {
                var indexArrIndex = indexArr[j];
                totalArr = totalArr.concat(getEndTotalArr(indexArrIndex));
            }
        }
    };
    return totalArr;
}

function getEndTotalArr(str) {
    var endTotalArr = [];
    if (/-/.test(str)) {
        var match = str.match(/(\d+)-(\d+)/);
        if (match[1] && match[2]) {
            var matchFirst = Number(match[1]);
            var matchSecon = Number(match[2]);

            for (var j = 0; j < (matchSecon - matchFirst + 1); j++) {
                endTotalArr.push(String(matchFirst + j));
            }
        }
    } else if (str) {
        endTotalArr.push(str);
    }
    return endTotalArr;
}

function getTotalChans() {
    var totleChans = 31,
        priSettingsInfo = priSettings;

    for (var i = 0; i < priSettingsInfo.length; i++) {
        var priSettingsInfoIndex = priSettingsInfo[i],
            spanType = priSettingsInfoIndex.span_type;

        if (spanType.toLowerCase() == "t1" || spanType.toLowerCase() == "j1") {
            totleChans = 24;
        }
    }

    return totleChans;
}
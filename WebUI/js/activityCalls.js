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
    queueArr = [],
    conferenceArr = [],
    setTimeoutIndex = 0,
    tableData = {
        data: [],
        page: 1,
        showNum: 5,
        total: 0
    },
    startTime = "",
    activity = "";

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    var modelName = config.model_info.model_name;
    topDoc.title = $P.lang("LANG584").format(modelName, $P.lang("LANG3006"));

    loadBridgeChannel();
});

function loadBridgeChannel() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        async: false,
        dataType: "json",
        data: {
            "action": "listBridgedChannels",
            "item_num": 1000000,
            "page": 1,
            "sidx": "callerid1",
            "sord": "asc",
            "auto-refresh": Math.random()
        },
        success: listBridgedChannels
    });

    setTimeoutIndex = setTimeout(loadBridgeChannel, 5000);
}

function listBridgedChannels(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var channel = data.response.channel;

        loadUnbridgeChannel(channel);
    }
}

function loadUnbridgeChannel(bridgeChannelData) {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        async: false,
        dataType: "json",
        data: {
            "action": "listUnBridgedChannels",
            "item_num": 1000000,
            "page": 1,
            "sidx": "state",
            "sord": "asc",
            "auto-refresh": Math.random()
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var channel = data.response.channel;

                for (var i = 0; i < bridgeChannelData.length; i++) {
                    channel.push(bridgeChannelData[i]);
                }
                channel = channel.sort(UCMGUI.bySort("bridge_time ? alloc_time", "down"));
                var transChannel = transChannelData(channel);

                if (transChannel.length == 0) {
                    $("#bridge_channel_div").empty();

                    renderNoDataTable();
                } else { // if (transChannel.length != tableData.data.length)
                    tableData.data = transChannel;

                    renderTable(transChannel, tableData.page);
                }
            }
        }
    });
}

function transChannelData(data) {
    var arr = [];

    for (var i = 0; i < data.length; i++) {
        var channelIndex = data[i];

        if (channelIndex["alloc_time"]) {
            var state = channelIndex.state.toLocaleLowerCase(),
                service = channelIndex.service.toLocaleLowerCase(),
                channel = channelIndex.channel.toLocaleLowerCase();

            if (state == "rsrvd" || state == "down" || state == "ring"
                    || (channel.indexOf('local') === 0 && (service == "normal" || service == "queue" || service == "confbridge"))) {
                continue;
            } else {
                channelIndex["type"] = "unbridge";
            }

            if (state == "ringing") {
                var tmp_name = channelIndex.callername,
                    tmp_num = channelIndex.callernum;

                channelIndex.callername = channelIndex.connectedname;
                channelIndex.callernum = channelIndex.connectednum;

                channelIndex.connectedname = tmp_name;
                channelIndex.connectednum = tmp_num;
            }
        } else if (channelIndex["bridge_time"]) {
            channelIndex["type"] = "bridge";
        }

        arr.push(channelIndex);
    }

    return arr;
}

function renderTable(channel, page) {
    createTbody(channel, page);
    createTfoot(channel);
}

function createTbody(channel, page) {
    $("#bridge_channel_div").empty();

    // if (dataLen == 0) {
    //     renderNoDataTable();
    // } else {

    var dataLen = channel.length,
        listsLen = 0,
        showNum = tableData.showNum,
        total = tableData.total = Math.floor(parseInt(dataLen) / (2 * showNum)),
        currentTime = getCurrentTime();

    if (total != parseInt(dataLen) / (2 * showNum)) {
        total = tableData.total = Math.floor(parseInt(dataLen) / (2 * showNum)) + 1;
    }

    if (page > total) {
        page = page - 1;
    }

    tableData.page = page;

    var pageList = tableData.pageList = (parseInt(page) - 1) * 2 * showNum;

    // if (page != 1) {
    //     pageList += 1;
    // }

    if (page == total) {
        listsLen = parseInt(dataLen);
    } else {
        listsLen = (parseInt(page) * 2 * showNum);
    }

    $("#bridge_channel_div").removeClass("border");

    var table = $("<table>")
        .attr({
            id: "bridge_channel_list",
            width: "100%"
        })
        .addClass("tableWidget borderSpacing")
        .appendTo("#bridge_channel_div");

    $("<tbody></tbody><tfoot></tfoot>").appendTo(table);

    for (var i = pageList; i < listsLen;) {
        var tr = $("<tr>").appendTo("#bridge_channel_list tbody");

        for (var j = 0; j < 2; j++) {
            var channelIndex = channel[i + j];
            var td = $("<td>")
                .addClass("channeList")
                .appendTo(tr);

            if (channelIndex) {
                var unknown = $P.lang("LANG2403"),
                    channel1 = "",
                    callerid1 = unknown,
                    channel2 = unknown,
                    callerid2 = unknown,
                    time = unknown,
                    callerState = "unknown",
                    calleeState = "unknown",
                    connectState = "",
                    service = "",
                    callerName,
                    calleeName;

                if (channelIndex["type"] == "unbridge") {
                    channel1 = channelIndex.channel;
                    callerid1 = channelIndex.callernum;
                    callerName = channelIndex.callername;
                    allocTime = getActivityTime(currentTime, channelIndex.alloc_time);
                    time = checkTime(allocTime);
                    callerid2 = channelIndex.connectednum || unknown;
                    calleeName = channelIndex.connectedname;
                    callerState = channelIndex.state.toLowerCase() || unknown;
                    // console.log(channelIndex.state.toLowerCase());
                    calleeState = checkCalleeState(channelIndex);
                    if (channelIndex.connectedname == "Call Bargin") {
                        connectState = "connectBargin";
                    } else {
                        connectState = checkConnectState(allocTime, callerState, callerid2);
                    }
                } else if (channelIndex["type"] == "bridge") {
                    channel1 = channelIndex.channel1;
                    callerid1 = channelIndex.callerid1;
                    callerName = channelIndex.name1;
                    time = getActivityTime(currentTime, channelIndex.bridge_time);
                    connectState = checkConnectState(time, "busy");
                    time = checkTime(time);
                    channel2 = channelIndex.channel2;
                    callerid2 = channelIndex.callerid2;
                    calleeName = channelIndex.name2;
                    callerState = "busy";
                    calleeState = "busy";
                    //connectState = "connected";
                }

                var callDiv = $("<div>").addClass("callDiv"),
                    caller = $("<div>").addClass("caller");

                $("<span>")
                    .attr({
                        title: channel1
                    })
                    .addClass("callState " + callerState)
                    .appendTo(caller);

                // console.log("className: " + callerState);
                if (callerid1) {
                    var sliceCallerid1;

                    if (/.*[\u4e00-\u9fa5]+.*$/.test(callerid1)) {
                        sliceCallerid1 = callerid1.length > 10 ? (callerid1.slice(0, 10) + '...') : callerid1;
                    } else {
                        sliceCallerid1 = callerid1.length > 20 ? (callerid1.slice(0, 20) + '...') : callerid1;
                    }

                    var callerNumSpan = $("<span>")
                        .addClass("callerNum")
                        .attr('title', callerid1)
                        .text(sliceCallerid1)
                        .appendTo(caller);
                }

                if (callerid1.toLowerCase() == "unknown") {
                    callerNumSpan.attr("locale", "LANG2403");
                }

                if (callerName) {
                    var sliceCallerName;

                    // if (/.*[\u4e00-\u9fa5]+.*$/.test(callerName)) {
                    //     sliceCallerName = callerName.length > 10 ? (callerName.slice(0, 10) + '...') : callerName;
                    // } else {
                    //     sliceCallerName = callerName.length > 20 ? (callerName.slice(0, 20) + '...') : callerName;
                    // }

                    sliceCallerName = callerName.length > 30 ? (callerName.slice(0, 30) + '...') : callerName;

                    $("<span>")
                        .addClass("callerName")
                        .attr('title', callerName)
                        .text(sliceCallerName)
                        .appendTo(caller);
                }

                var callTime = $("<div>").addClass("callTime");

                $("<span>")
                    .addClass("activityTime")
                    .html(time)
                    .appendTo(callTime);

                var conState = $("<span>")
                    .addClass("pointer connectState " + connectState)
                    .appendTo(callTime);

                if (connectState == "connectRinging") {
                    conState.attr("title", $P.lang("LANG111"));
                } else {
                    conState.attr("title", $P.lang("LANG4287"));
                }
                var callee = $("<div>").addClass("callee");
                var calleeStateSpan = $("<span>")
                    .addClass("callState " + calleeState)
                    .appendTo(callee);
                var calleeNumSpan = $("<span>")
                    .addClass("calleeNum")
                    .text(callerid2)
                    .appendTo(callee);
                var calleeStateTitle = callerid2;

                if (calleeState == "parked") {
                    calleeStateTitle = $P.lang("LANG99");
                    calleeStateSpan.attr("localetitle", "LANG99");
                } else if (calleeState == "queue") {
                    calleeStateTitle = $P.lang("LANG3036");
                    calleeStateSpan.attr("localetitle", "LANG3036");
                } else if (calleeState == "confbridge") {
                    calleeStateTitle = $P.lang("LANG18");
                    calleeStateSpan.attr("localetitle", "LANG18");
                }

                if (callerid2.toLowerCase() == "s") {
                    calleeNumSpan
                        .attr("locale", "LANG2403")
                        .text($P.lang('LANG2403'));
                }

                if (callerid2.toLowerCase() == "unknown") {
                    calleeNumSpan.attr("locale", "LANG2403");
                }

                if (calleeName) {
                    var sliceCalleeName;

                    // if (/.*[\u4e00-\u9fa5]+.*$/.test(calleeName)) {
                    //     sliceCalleeName = calleeName.length > 10 ? (calleeName.slice(0, 10) + '...') : calleeName;
                    // } else {
                    //     sliceCalleeName = calleeName.length > 20 ? (calleeName.slice(0, 20) + '...') : calleeName;
                    // }

                    sliceCalleeName = calleeName.length > 30 ? (calleeName.slice(0, 30) + '...') : calleeName;

                    $("<span>")
                        .addClass()
                        .attr({
                            "class": "calleeName",
                            title: calleeName

                        })
                        .text(sliceCalleeName)
                        .appendTo(callee);
                }

                calleeStateSpan.attr("title", calleeStateTitle);
                // console.log("calleeState: " + calleeState + callerid2);

                var callOptions = $("<div>").addClass("callOptions");

                $("<button>")
                    .attr({
                        "class": "options hangUp",
                        channel1: channel1,
                        channel2: channel2,
                        title: $P.lang("LANG3007"),
                        localetitle: "LANG3007"
                    })
                    .appendTo(callOptions);

                // hide temporarily
                // $("<button>").attr({
                //         title: $P.lang("LANG804"),
                //         localetitle: "LANG804",
                //         disabled: true
                //     }).addClass("options transfer disabled").appendTo(callOptions);

                var monitor = $("<button>")
                    .attr({
                        "class": "options monitor",
                        caller: callerid1,
                        callee: callerid2,
                        channel1: channel1,
                        channel2: channel2,
                        unknown: unknown,
                        title: $P.lang("LANG3008"),
                        localetitle: "LANG3008",
                        disabled: true
                    })
                    .appendTo(callOptions);

                caller.appendTo(callDiv);
                callTime.appendTo(callDiv);
                callee.appendTo(callDiv);
                callDiv.appendTo(td);
                callOptions.appendTo(td);

                if (connectState.contains("connected")) {
                    monitor[0].disabled = false;
                }

            } else {
                td.addClass("noneBackground");
                break;
            }
        }

        if (channel[i + 2]) {
            i += 2;
        } else {
            break;
        }
    }

    // }
    bindOverEvent();

    bindButtonEvent();
}

function createTfoot(channel) {
    var prevPage,
        nextPage,
        totalInfo = channel.length,
        total = tableData.total,
        tr = $("<tr>").appendTo("#bridge_channel_list tfoot"),
        td = $("<td>").appendTo(tr).attr("colspan", "2"),
        pageDes = $("<div>").appendTo(td).addClass("pageDes"),
        pageOptions = $("<div>").appendTo(td).addClass("pageOptions"),
        page = parseInt(tableData.page);

    if (page != 1) {
        prevPage = page - 1;
    } else {
        prevPage = 1;
    }

    if (page == total) {
        nextPage = total;
    } else {
        nextPage = page + 1;
    }

    $("<span>")
        .attr("locale", "LANG115")
        .html($P.lang("LANG115"))
        .appendTo(pageDes);

    $("<strong>")
        .addClass("total")
        .html(totalInfo)
        .appendTo(pageDes);

    $("<span>")
        .attr("locale", "LANG118")
        .html($P.lang("LANG118"))
        .appendTo(pageDes);

    $("<strong>")
        .addClass("current")
        .html(page + "/" + total)
        .appendTo(pageDes);


    $("<span>")
        .attr("locale", "LANG119")
        .html($P.lang("LANG119"))
        .appendTo(pageDes);

    $("<input>")
        .attr({
            "maxlength": "4",
            "class": "jump"
        })
        .appendTo(pageDes);

    $("<span>").appendTo(pageDes)
        .attr({
            "locale": "LANG120",
            "class": "btn btn-paging"
        })
        .html($P.lang("LANG120"));

    var firstBtn = $("<span>")
        .attr({
            "locale": "LANG121",
            "class": "btn btn-paging",
            "value": 1
        })
        .html($P.lang("LANG121"))
        .appendTo(pageOptions);

    var prevBtn = $("<span>")
        .attr({
            "locale": "LANG122",
            "class": "btn btn-paging",
            "value": prevPage
        })
        .html($P.lang("LANG122"))
        .appendTo(pageOptions);

    var nextBtn = $("<span>")
        .attr({
            "locale": "LANG123",
            "class": "btn btn-paging",
            "value": nextPage
        })
        .html($P.lang("LANG123"))
        .appendTo(pageOptions);

    var lastBtn = $("<span>")
        .attr({
            "locale": "LANG124",
            "class": "btn btn-paging",
            "value": total
        })
        .html($P.lang("LANG124"))
        .appendTo(pageOptions);

    var pagingCls = "btn btn-paging";
    if (page == 1) {
        firstBtn.removeClass(pagingCls)
            .addClass("pagingDisabled");
        prevBtn.removeClass(pagingCls)
            .addClass("pagingDisabled");
    } else
    if (page == total) {
        nextBtn.removeClass(pagingCls)
            .addClass("pagingDisabled");
        lastBtn.removeClass(pagingCls)
            .addClass("pagingDisabled");
    }

    if (total == 1) {
        firstBtn.removeClass(pagingCls)
            .addClass("pagingDisabled");
        prevBtn.removeClass(pagingCls)
            .addClass("pagingDisabled");
        nextBtn.removeClass(pagingCls)
            .addClass("pagingDisabled");
        lastBtn.removeClass(pagingCls)
            .addClass("pagingDisabled");
    }

    addEventJump();
}

function jumpFocus() {
    $(".jump").focus();
}

function addEventJump() {
    var tbody = $("#bridge_channel_list tbody"),
        tfoot = $("#bridge_channel_list tbody"),
        total = tableData.total;

    $(".btn-paging").bind("click", function(ev) {
        var page = parseInt($(this).attr("value"));

        if (isNaN(page)) {
            page = parseInt($(".jump").val());
        }

        jumpToPage(page);

        ev.stopPropagation();
        return false;
    });

    $(".jump").bind({
        mousedown: function(ev) {
            if (ev.button == 2) {
                $(this).val($(this).val().replace(/\D|^0/g, ''));

                ev.stopPropagation();
                return false;
            }
        },
        keydown: function(ev) {
            if (ev.keyCode == 13) {
                var page = parseInt($(".jump").val());

                me.jumpToPage(page);

                ev.stopPropagation();
                return false;
            }
        },
        keyup: function(ev) { //keyup event
            $(this).val($(this).val().replace(/\D|^0/g, ''));

            ev.stopPropagation();
            return false;
        },
        paste: function(ev) {
            $(this).val($(this).val().replace(/\D|^0/g, ''));

            ev.stopPropagation();
            return false;
        }
    });
}

function jumpToPage(page) {
    var table = $("#bridge_channel_list"),
        tbody = $("#bridge_channel_list tbody"),
        tfoot = $("#bridge_channel_list tfoot"),
        total = tableData.total;

    $('.jump').val('');

    if (page < 1 || page > total || isNaN(page)) {
        $(".jump").blur();

        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG929"),
            callback: function() {
                jumpFocus();
            }
        })

        return;
    }

    // top.sessionData.userPage = page;
    tbody.empty();
    tfoot.empty();

    var channel = tableData.data;

    createTbody(channel, page);
    createTfoot(channel);
}

function renderNoDataTable() {
    $("#bridge_channel_div").addClass("border");

    var table = $("<table>")
        .attr({
            cellpadding: 0,
            cellspacing: 0,
            border: 0,
            id: "bridge_channel_list",
            style: "width: 100%"
        })
        .addClass("tableWidget noneBorderSpacing"),
        noData = $P.lang("LANG129").format($P.lang("LANG3006"));

    $("<tbody><tr class='noData'><td locale='LANG129 LANG3006'>" + noData + "</td></tr></tbody>").appendTo(table);

    table.appendTo("#bridge_channel_div");

    bindButtonEvent();
}

function checkConnectState(allocTime, callerState, connectednum) {
    var matchArr = allocTime.match(/\d+/g),
        connectState = "connected";

    if (matchArr && parseInt(matchArr[0])) {
        connectState = "connectedWarning";
    } else if (matchArr && parseInt(matchArr[1]) > 30) {
        connectState = "connectedLongTime";
    } else if (callerState == "dialing" || callerState == "ring" || callerState == "ringing") {
        if (connectednum && connectednum == "s") {
            connectState = "connected";
        } else {
            connectState = "connectRinging";
        }
    }

    return connectState;
}

function checkTime(time) {
    var matchArr = time.match(/\d+/g),
        timeOut = $("<font>");

    if (matchArr && parseInt(matchArr[0])) {
        timeOut.text(time)
            .css("color", "#ff6868");
    } else if (parseInt(matchArr[1]) > 30) {
        timeOut.text(time).css("color", "orange");
    } else {
        timeOut.text(time)
            .css("color", "#4E5962");
    }

    return timeOut;
}

function checkCalleeState(channelIndex) {
    var callerState = channelIndex.state.toLowerCase(),
        service = channelIndex.service.toLowerCase();

    if (service == "normal") {
        if (callerState == "dialing" || callerState == "pre-ring" || callerState == "ring" || callerState == "ringing") {
            service = "ringing";
        }
        if (callerState == "up") {
            service = "up";
        }
    }

    if (service == "macro-dial" ) {
        service = "normal";
    }
    return service || "unknown";
}

function bindOverEvent() {
    var len = $(".channeList").length;

    $("td").mouseenter(function(ev) {
        $(this).addClass("hoverTd");

        ev.stopPropagation();
        return false;
    }).mouseleave(function(ev) {
        $(this).removeClass("hoverTd");

        ev.stopPropagation();
        return false;
    });

    for (var i = 0; i < len; i++) {
        var channeList = $(".channeList").eq(i),
            children = channeList.children(),
            siblings = channeList.siblings();

        // if (children.length == 0 && (siblings.length == 0 || siblings.children().length == 0)) {
        //     channeList.remove();
        //     len--;
        //     i--;
        // } else

        if (children.length == 0 && siblings.length != 0) {
            // channeList.addClass("noneBackground");
            channeList.unbind("mouseenter mouseleave");
        }
    }
}

function bindButtonEvent() {
    $(".top_buttons")
        .delegate('#btnHangUpAll', 'click', function(ev) {
            clearTimeout(setTimeoutIndex);

            if ($(".hangUp").length != 0) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG3012"),
                    buttons: {
                        ok: function() {
                            for (var i = 0; i < $(".hangUp").length; i++) {
                                var hangUpIndex = $(".hangUp").eq(i),
                                    channel1 = hangUpIndex.attr("channel1"),
                                    channel2 = hangUpIndex.attr("channel2");

                                $.ajax({
                                    url: baseServerURl,
                                    type: "POST",
                                    dataType: "json",
                                    async: false,
                                    data: {
                                        action: "Hangup",
                                        Channel: channel1
                                    },
                                    success: function(data) {
                                        // var bool = UCMGUI.errorHandler(data);
                                        if (channel2) {
                                            $.ajax({
                                                url: baseServerURl,
                                                type: "POST",
                                                dataType: "json",
                                                data: {
                                                    action: "Hangup",
                                                    Channel: channel2
                                                },
                                                success: function(data) {
                                                    // UCMGUI.errorHandler(data);
                                                }
                                            });
                                        }
                                    }
                                });
                            }

                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG3011"),
                                callback: function() {
                                    loadBridgeChannel();
                                }
                            });
                        },
                        cancel: function() {
                            setTimeoutIndex = setTimeout(loadBridgeChannel, 5000);

                            top.dialog.clearDialog();
                        }
                    }
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG129").format($P.lang("LANG3006"))
                });
            }

            ev.stopPropagation();
            return false;
        });

    $("#bridge_channel_list")
        .delegate('.hangUp', 'click', function(ev) {
            clearTimeout(setTimeoutIndex);

            var channel1 = $(this).attr("channel1"),
                channel2 = $(this).attr("channel2");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG3010"),
                buttons: {
                    ok: function() {
                        $.ajax({
                            url: baseServerURl,
                            type: "POST",
                            dataType: "json",
                            data: {
                                action: "Hangup",
                                Channel: channel1
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data, function() {
                                    setTimeoutIndex = setTimeout(loadBridgeChannel, 5000);
                                });

                                if (bool && channel2) {
                                    $.ajax({
                                        url: baseServerURl,
                                        type: "POST",
                                        dataType: "json",
                                        data: {
                                            action: "Hangup",
                                            Channel: channel2
                                        },
                                        success: function(data) {
                                            var bool = UCMGUI.errorHandler(data, function() {
                                                setTimeoutIndex = setTimeout(loadBridgeChannel, 5000);
                                            });

                                            if (bool) {
                                                top.dialog.dialogMessage({
                                                    type: 'success',
                                                    content: $P.lang("LANG3011"),
                                                    callback: function() {
                                                        loadBridgeChannel();
                                                    }
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG3011"),
                                        callback: function() {
                                            loadBridgeChannel();
                                        }
                                    });
                                }
                            }
                        });
                    },
                    cancel: function() {
                        setTimeoutIndex = setTimeout(loadBridgeChannel, 5000);

                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.transfer', 'click', function(ev) {
            ev.stopPropagation();
            return false;
        })
        .delegate('.monitor', 'click', function(ev) {
            var caller = $(this).attr("caller"),
                callee = $(this).attr("callee"),
                channel1 = $(this).attr("channel1"),
                channel2 = $(this).attr("channel2"),
                unknown = $(this).attr("unknown");

            if (channel2 == unknown) {
                channel2 = "";
            }

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG3008"),
                displayPos: "addUserForm",
                frameSrc: "html/activityCalls_modal.html?callee=" + callee + "&caller=" + caller + "&channel1=" + channel1 + "&channel2=" + channel2
            });

            ev.stopPropagation();
            return false;
        });
}

function getCurrentTime() {
    var currentTime = '1970-01-01 00:00:00 UTC+08:00';

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "checkInfo"
        },
        success: function(data) {
            if (data && data.status == 0) {
                currentTime = data.response.current_time;
            }
        }
    });

    return currentTime;
}

function getActivityTime(currentTime, time) {
    var currentTime = currentTime.replace(/-/g, "/"),
        startTime = Date.parse(time.replace(/-/g, "/")),
        timeAry = currentTime.split(' '),
        milliseconds = Date.parse(timeAry[0] + " " + timeAry[1]) - startTime,
        activity;

    if (milliseconds < 0) {
        milliseconds = 0;
    }

    // days between start time and end time
    var days = UCMGUI.addZero(Math.floor(milliseconds / (24 * 3600 * 1000)));

    // hours between start time and end time
    var leave1 = milliseconds % (24 * 3600 * 1000), // milliseconds after calculate the rest of days
        hours = UCMGUI.addZero(Math.floor(leave1 / (3600 * 1000)));

    // minutes between start time and end time
    var leave2 = leave1 % (3600 * 1000), // milliseconds after calculate the rest of hours
        minutes = UCMGUI.addZero(Math.floor(leave2 / (60 * 1000)));

    // seconds between start time and end time
    var leave3 = leave2 % (60 * 1000), // milliseconds after calculate the rest of minutes
        seconds = UCMGUI.addZero(Math.round(leave3 / 1000));

    if (days == 0) {
        activity = hours + ":" + minutes + ":" + seconds;
    } else {
        activity = days + " " + hours + ":" + minutes + ":" + seconds;
    }

    return activity;
}
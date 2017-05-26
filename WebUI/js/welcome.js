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
    ifExisted = UCMGUI.inArray,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    accountRefresh = false,
    parkingRefresh = false,
    confRefresh = false,
    queueRefresh = false,
    parkingtime = 300,
    extensionJumpVal = "",
    parkingLotJumpVal = "",
    role = $P.cookie('role'),
    enableModule = $P.cookie("enable_module"),
    allSequence = ["sys_status_trunks", "sys_status_extensions", "sys_status_queues", "sys_status_meetme", "sys_interface_status", "sys_digital_slot_status", "sys_status_plot", "sys_status_bridge", "sys_status_unbridge"],
    sequenceInfo = {
        "left": [],
        "right": []
    }
    statusObj = {
        "busy": "LANG2237",
        "hold": "LANG2228",
        "idle": "LANG2232",
        "inuse": "LANG112",
        "inuse&hold": "LANG2224",
        "inuse&ringing": "LANG2242",
        "ring": "LANG111",
        "ringing": "LANG111",
        "unconfigured": "LANG113",
        "unavailable": "LANG113",
        "unknown": "LANG113",
        "errorconfigured": "LANG2795",
        "localblock": "LANG3752",
        "remoteblock": "LANG3753",
        "bidirectionalblock": "LANG3754",
        "paused": "LANG5063"
    };

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG585"));

    if (checkAllPrivilege()) {
        getSysequence();

        getParkingLotTime();

        loadTrunks();

        loadExtensions();

        loadConferenceRooms();

        loadDigitalSlotStatues();

        // jQuery sortable init for content sections
        $('#sysstat_right_container, #sysstat_left_container').sortable({
            cancel: '.minimaxi, .loadTrunks, .loadQueues',
            cursor: 'move',
            handle: 'div.handle',
            items: '> div.content',
            placeholder: 'placeholder',
            connectWith: ".content_container",
            stop: function(event, ui) {
                setSysequence(ui)
            }
        });
    } else {
        if (enableModule) {
            if (enableModule.indexOf('trunk') > -1) {
                loadTrunks();
            } else {
                $('#sys_status_trunks, #sys_interface_status').hide();
            }

            if (enableModule.indexOf('extension') > -1) {
                loadExtensions();
            } else {
                $('#sys_status_extensions').hide();
            }

            if (enableModule.indexOf('conference') > -1) {
                loadConferenceRooms();
            } else {
                $('#sys_status_meetme').hide();
            }

            if (enableModule.indexOf('queue') > -1) {
                loadQueues();
            } else {
                $('#sys_status_queues').hide();
            }

            if (enableModule.indexOf('parking_lot') > -1) {
                loadParkingLot();
            } else {
                $('#sys_status_plot').hide();
            }

            $('#sys_digital_slot_status').hide();

            if ($('#sysstat_left_container > .content:visible').length === 0) {
                $('#sysstat_left_container').parent().remove();
                $('#sysstat_right_container').parent().css({float: 'left'});
            }
        }
    }

    bindButtonEvent();

    $(window).resize(function() {
        $("#trunks_list").setGridWidth($("#trunks_list").closest(".body").width() - 4);
        $("#extensions_list").setGridWidth($("#extensions_list").closest(".body").width() - 4);
    });

    UCMGUI.loginFunction.checkifLoggedIn('ping');
});

function checkAllPrivilege() {
    return (role === 'privilege_0' ||
            role === 'privilege_1' ||
            (!!enableModule && enableModule.indexOf('pbx_status') > -1));
}

function setSysequence(ui) {
    if (ui) {
        var item = ui.item,
            id = item.attr("id");

        if (id == "sys_status_trunks") {
            $("#trunks_list").setGridWidth($("#sys_status_trunks").width() - 2);
        } else if (id == "sys_status_extensions") {
            $("#extensions_list").setGridWidth($("#sys_status_extensions").width() - 2);
        } else if (id == "sys_status_plot") {
            $("#parking_lot_list").setGridWidth($("#sys_status_plot").width() - 2);
        }
    }

    var left = $("#sysstat_left_container").children(),
        right = $("#sysstat_right_container").children();

    sequenceInfo.left.length = 0;
    sequenceInfo.right.length = 0;

    left.each(function(index) {
        sequenceInfo.left[index] = $(left[index]).attr("id");
    });

    right.each(function(index) {
        $(right[index]).attr("id");
        sequenceInfo.right[index] = $(right[index]).attr("id");
    });

    var buf = "action=setPValue&systemStatusLeft=" + sequenceInfo.left + "&systemStatusRight=" + sequenceInfo.right;

    $.ajax({
        type: "POST",
        dataType: "json",
        async: true,
        url: "/cgi?",
        data: buf
    });
}

function getSystemStatus(status) {
    if (!status) {
        return [];
    }

    var status = status.split(","),
        length = status.length,
        statusItem = '',
        response = [],
        i = 0;

    for (i; i < length; i++) {
        if (status[i] && status[i].indexOf("_") >= 0) {
            statusItem = status[i].replace(/\|/g, "");

            if (!ifExisted(statusItem, response)) {
                response.push(statusItem);
            }
        }
    }

    return response;
}

function getSysequence() {
    $.ajax({
        type: "GET",
        async: false,
        url: "/cgi?action=getPValue&systemStatusLeft&systemStatusRight",
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response,
                    systemStatusLeft = response.systemStatusLeft,
                    systemStatusRight = response.systemStatusRight,
                    left = getSystemStatus(systemStatusLeft),
                    right = getSystemStatus(systemStatusRight),
                    leftLen = left.length,
                    rightLen = right.length;

                if ((leftLen != 0 && rightLen != 0) || (leftLen != 0 && rightLen == 0) || (leftLen == 0 && rightLen != 0)) {
                    sequenceInfo.left.length = 0;
                    sequenceInfo.right.length = 0;
                    sequenceInfo.left = left;
                    sequenceInfo.right = right;

                    renderSysequence();
                }
            }
        }
    });
}

function getParkingLotTime() {
    $.ajax({
        type: "GET",
        async: false,
        url: "/cgi?action=getFeatureCodes&parkingtime",
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response,
                    featureSettings = response.feature_settings;

                parkingtime = Number(featureSettings.parkingtime);
                parkingtime = (parkingtime && !isNaN(parkingtime)) ? parkingtime : 300;
            }
        }
    });
}

function renderSysequence() {
    var left = $("#sysstat_left_container"),
        right = $("#sysstat_right_container"),
        leftDiv = [],
        rightDiv = [];

    for (var i = 0; i < sequenceInfo.left.length; i++) {
        var leftIndex = sequenceInfo.left[i];

        if (leftIndex.indexOf("_") >= 0) {
            var sequenceInfoIndex = leftIndex.replace(/\|/g, "");

            leftDiv.push($("#" + sequenceInfoIndex).clone());
        }

        allSequence.remove(leftIndex);
    }

    for (var j = 0; j < sequenceInfo.right.length; j++) {
        var rightIndex = sequenceInfo.right[j];

        if (rightIndex.indexOf("_") >= 0) {
            var sequenceInfoIndex = rightIndex.replace(/\|/g, "");

            rightDiv.push($("#" + sequenceInfoIndex).clone());
        }

        allSequence.remove(rightIndex);
    }

    if (allSequence.length != 0) {
        for (var k = 0; k < allSequence.length; k++) {
            var allSequenceIndex = allSequence[k];

            if (allSequenceIndex.indexOf("_") >= 0) {
                var sequenceInfoIndex = allSequenceIndex.replace(/\|/g, "");

                rightDiv.push($("#" + sequenceInfoIndex).clone());
            }
        }
    }

    left.empty();

    right.empty();

    leftDiv.each(function(index, el) {
        index.appendTo(left);
    });

    rightDiv.each(function(index, el) {
        index.appendTo(right);
    });
}

function loadTrunks(isRefresh) {
    $("#trunks_div").empty();

    var container = "<table id='trunks_list'></table><div id='trunks_list_pager'></div>";

    $(container).appendTo("#trunks_div");

    $("#trunks_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: $("#sys_status_trunks").width() - 8,
        height: "auto",
        postData: {
            "action": "listAllTrunk"
        },
        colNames: [
            '<span locale="LANG81">' + $P.lang('LANG81') + '</span>',
            '<span locale="LANG83">' + $P.lang('LANG83') + '</span>',
            '<span locale="LANG273">' + $P.lang('LANG273') + '</span>',
            '<span locale="LANG84">' + $P.lang('LANG84') + '</span>',
            '<span locale="LANG72">' + $P.lang('LANG72') + '</span>',
            '<span locale="LANG994">' + $P.lang('LANG994') + '</span>'
        ],
        colModel: [{
            name: 'status',
            index: 'status',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTrunkStatusData
        }, {
            name: 'trunk_name',
            index: 'trunk_name',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createExtensionTrunk
        }, {
            name: 'out_of_service',
            index: 'out_of_service',
            hidden: true
        }, {
            name: 'type',
            index: 'type',
            width: 100,
            resizable: false,
            align: "center",
            formatter: transTypeData
        }, {
            name: 'username',
            index: 'username',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 'host',
            index: 'host',
            width: 150,
            resizable: false,
            align: "center",
            formatter: transPortData
        }],
        pager: "trunks_list_pager",
        rowNum: 10,
        // rowList: [10, 20, 30],
        viewrecords: true,
        sortname: 'status',
        noData: "LANG129 LANG2378",
        jsonReader: {
            root: "response.trunks",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadError: function() {
            if (!accountRefresh) {
                loadInterfaceStatues();
            }
        },
        loadComplete: function() {
            $("#trunks_list .jqgrow:even").addClass("ui-row-even");

            setTimeout(function() {
                $("#trunks_list").setGridWidth($("#sys_status_trunks").width() - 2);
            }, 500);

            loadInterfaceStatues();
        },
        gridComplete: function() {
            $P.lang(doc, true);
        }
    });
}

function loadExtensions(isRefresh) {
    var val = $(".section.active").val();

    $("#extension_div").empty();

    var container = "<table id='extensions_list'></table><div id='extensions_list_pager'></div>";

    $(container).appendTo("#extension_div");

    if (val == "All") {
        loadEachTypeExtension("all", isRefresh, "LANG129 LANG87");
    } else if (val == "SIP") {
        loadEachTypeExtension("sip", isRefresh, "LANG129 LANG2927");
    } else if (val == "WebRTC") {
        loadEachTypeExtension("WebRTC", isRefresh, "LANG129 LANG5035");
    } else if (val == "Analog") {
        loadEachTypeExtension("fxs", isRefresh, "LANG129 LANG2928");
    } else if (val == "IAX") {
        loadEachTypeExtension("iax", isRefresh, "LANG129 LANG2929");
    } else if (val == "ringgroup") {
        loadEachTypeExtension("ringgroup", isRefresh, "LANG129 LANG22");
    } else if (val == "vmgroup") {
        loadEachTypeExtension("vmgroup", isRefresh, "LANG129 LANG21");
    }
}

function createExtensionTrunk(cellvalue, options, rowObject) {
    var value;

    if (rowObject.out_of_service && rowObject.out_of_service == 'yes') {
        value = '<span class="disabled_extension_trunk" localetitle="LANG273" title="' + $P.lang('LANG273') + '"></span>' + cellvalue;
    } else {
        value = cellvalue;
    }

    return value;
}

function transMsgType(cellvalue, options, rowObject) {
    if (cellvalue == "vmGroup") {
        return '<div locale="LANG21">' + $P.lang("LANG21") + '</div>';
    } else if (cellvalue == "RingGroup") {
        return '<div locale="LANG22">' + $P.lang("LANG22") + '</div>';
    } else {
        return cellvalue;
    }
}

function loadEachTypeExtension(type, isRefresh, noData) {
    var action = {};

    accountRefresh = isRefresh;

    if (type) {
        action = {
            action: "listAccount",
            "auto-refresh": Math.random(),
            options: "status,extension,fullname,urgemsg,newmsg,oldmsg,account_type,out_of_service",
            account_type: type
        }
    } else {
        action = {
            action: "listAccount",
            "auto-refresh": Math.random(),
            options: "status,extension,fullname,urgemsg,newmsg,oldmsg,account_type,out_of_service"
        }
    }

    $("#extensions_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: $("#sys_status_extensions") - 7,
        height: "auto",
        postData: action,
        colNames: [
            '<span locale="LANG81">' + $P.lang('LANG81') + '</span>',
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG273">' + $P.lang('LANG273') + '</span>',
            '<span locale="LANG103">' + $P.lang('LANG103') + '</span>',
            '<span locale="LANG1521">' + $P.lang('LANG1521') + '</span>',
            '<span locale="LANG84">' + $P.lang('LANG84') + '</span>'
        ],
        colModel: [{
            name: 'status',
            index: 'status',
            width: 50,
            resizable: false,
            align: "center",
            formatter: transExtStatusData
        }, {
            name: 'extension',
            index: 'extension',
            width: 70,
            resizable: false,
            align: "center",
            formatter: createExtensionTrunk
        }, {
            name: 'out_of_service',
            index: 'out_of_service',
            hidden: true
        }, {
            name: 'fullname',
            index: 'fullname',
            width: 70,
            resizable: false,
            align: "center"
        }, {
            name: 'urgemsg',
            index: 'urgemsg',
            width: 70,
            resizable: false,
            align: "center",
            formatter: transMsgData
        }, {
            name: 'account_type',
            index: 'account_type',
            width: 50,
            resizable: false,
            align: "center",
            formatter: transMsgType
        }],
        loadui: 'disable',
        pager: "extensions_list_pager",
        rowNum: 10,
        viewrecords: true,
        sortname: 'status',
        noData: noData,
        jsonReader: {
            root: "response.account",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#extensions_list .jqgrow:even").addClass("ui-row-even");

            setTimeout(function() {
                $("#extensions_list").setGridWidth($("#sys_status_extensions").width() - 2);
            }, 0);
            $("#trunks_list").setGridWidth($("#sys_status_trunks").width() - 2);

            $("#parking_lot_list").setGridWidth($("#sys_status_plot").width() - 2);

            setTimeout(function() {
                accountRefresh = true;
                extensionJumpVal = $("#extensions_list_pager .jump").val();
                $("#extensions_list").trigger('reloadGrid');
            }, 10000);
        },
        gridComplete: function() {
            $P.lang(doc, true);
            $("#extensions_list_pager .jump").val(extensionJumpVal);
        }
    });
}

function loadQueues(isRefresh) {
    var queue_template = $('#queue_left_container > div.template'),
        queue_conts = {}, //queue containers array
        tempArr = [];

    queue_conts[0] = $('#queue_left_container');
    queue_conts[1] = $('#queue_right_container');

    var cont_index = 0;

    queueRefresh = isRefresh;

    $("#extensions_list").setGridWidth($("#sys_status_extensions").width() - 2);
    // $('.queue:not(.template)').remove();

    $.ajax({
        url: '../cgi',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            action: 'getQueueStatusList',
            "auto-refresh": Math.random()
        },
        error: function(argument) {
            if (!queueRefresh && checkAllPrivilege()) {
                loadParkingLot();
            }
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var queueStatus = data.response.queue_status;

                for (var i = 0; i < queueStatus.length; i++) {
                    var queueStatusObj = queueStatus[i],
                        queue = queue_template.clone(),
                        agent_cnt = 0,
                        call_cnt = 0,
                        line_index = 0,
                        q_name = queueStatusObj.extension,
                        strategy = queueStatusObj.strategy,
                        calls_completed = queueStatusObj.callscomplete,
                        calls_abandoned = queueStatusObj.callsabandoned,
                        service_level = queueStatusObj.sevicelevel;

                    $.ajax({
                        url: '../cgi',
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        data: {
                            action: 'getQueueMembersStatus',
                            "auto-refresh": Math.random(),
                            extension: q_name
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                var extension = data.response.extension;

                                if (extension.length != 0) {
                                    var agents = queue.contents().find('.agents'),
                                        agent_template = $('#agent_template');

                                    for (var i = 0; i < extension.length; i++) {
                                        var extensionObj = extension[i],
                                            agent = agent_template.clone(),
                                            a_exten = extensionObj.member_extension,
                                            a_status = extensionObj.status,
                                            isDynamic = extensionObj.is_dynamic;

                                        if (isDynamic == 1) {
                                            a_exten += "(*)";
                                        }

                                        if (a_exten.indexOf("group") > -1) {
                                            continue;
                                        }

                                        switch (a_status.toLowerCase()) {
                                            case 'ringing':
                                            case 'inuse&ringing':
                                                var a_status_img = '../images/agent_ringing.png';

                                                agent_cnt++;

                                                break;
                                            case 'busy':
                                            case 'inuse':
                                                var a_status_img = '../images/agent_busy.png';

                                                agent_cnt++;

                                                break;
                                            case 'available':
                                            case 'idle':
                                                var a_status_img = '../images/agent_loggedin.png';

                                                agent_cnt++;

                                                break;
                                            case 'paused':
                                                var a_status_img = '../images/agent_loggedout.png';

                                                agent_cnt++;

                                                break;   
                                            default:
                                                var a_status_img = '../images/agent_loggedout.png';

                                                break;
                                        }
                                        var statusTitle = statusObj[a_status.toLowerCase()];
                                        agent.children('span.extension').html(a_exten);
                                        agent.children('img.status_icon').attr({
                                            'src': a_status_img,
                                            'localetitle': statusTitle,
                                            'title': $P.lang(statusTitle)
                                        });

                                        agent.removeClass('template');
                                        agent.removeAttr('id');
                                        agent.addClass('agent_' + a_exten);
                                        agents.append(agent);

                                        line_index++;
                                    }
                                } else {
                                    queue.contents().find('.agents').html($P.lang("LANG2317").format($P.lang("LANG143"))).attr("locale", "LANG2317 LANG143");

                                    line_index++;
                                }
                            }
                        }
                    });

                    $.ajax({
                        url: '../cgi',
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        data: {
                            action: 'getQueueCallers',
                            "auto-refresh": Math.random(),
                            extension: q_name
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                var extension = data.response.extension;

                                if (extension.length != 0) {
                                    line_index++;

                                    var calls = queue.contents().find('.calls > table > tbody'),
                                        call_template = $('<tr></tr>').addClass('call');

                                    for (var i = 0; i < extension.length; i++) {
                                        var extensionObj = extension[i],
                                            starttime = extensionObj.starttime;

                                        call_cnt++;

                                        var call = call_template.clone(),
                                            order = (i + 1),
                                            cid = extensionObj.callerid + " " + extensionObj.callername;

                                        $('<td></td>').html(order).appendTo(call);
                                        $('<td></td>').html(cid).appendTo(call);

                                        var queueTime = getActivityTime(starttime),
                                            queueMatch = queueTime.match(/\d+/g);

                                        if (queueMatch) {
                                            var minSec = Number(queueMatch[1]) * 60 + Number(queueMatch[2]);

                                            if (minSec > 15 && minSec <= 40) {
                                                queueTime = "<font color='orange'>" + queueTime + "</font>"
                                            }

                                            if (minSec > 40) {
                                                queueTime = "<font color='red'>" + queueTime + "</font>"
                                            }
                                        }

                                        $('<td></td>').html(queueTime).addClass('count_html_up').appendTo(call);

                                        // call.addClass(call_class);
                                        call.attr('id', '' + q_name.toString() + '_call_' + cid.toString());
                                        calls.append(call);

                                        line_index++;
                                    }
                                } else {
                                    queue.contents().find('.calls > table.list > tbody').html('<tr><td locale="LANG2317 LANG142">' + $P.lang("LANG2317").format($P.lang("LANG142")) + '</td></tr>');

                                    line_index++;
                                }
                            }
                        }
                    });

                    queue.contents().find('.name').html(q_name);
                    queue.contents().find('.strategy').html(strategy);
                    queue.contents().find('.users_agents').html(call_cnt + " calls, " + agent_cnt + " agents");
                    queue.contents().find('.service_level').html(service_level);
                    queue.contents().find('.calls_complete').html(calls_completed);
                    queue.contents().find('.calls_abandoned').html(calls_abandoned);
                    queue.removeClass('template');
                    queue.attr('id', 'queue_' + q_name);
                    tempArr.push(queue);
                    // queue_conts[cont_index].append(queue);
                    // cont_index = cont_index == 1 ? 0 : 1;
                }

                $('.queue:not(.template)').remove();

                for (var j = 0; j < tempArr.length; j++) {
                    if (j % 2 == 0) {
                        queue_conts[0].append(tempArr[j]);
                    } else {
                        queue_conts[1].append(tempArr[j]);
                    }
                }

                if (tempArr.length) {
                    $('#noqueue').hide();
                    $('#sys_status_queues .column').show();
                    $('#sys_status_queues div.body').css({'background-color': '#FFF'});
                    $('#queue_div').css({'border': '0 none'});
                } else {
                    $('#noqueue').show();
                    $('#sys_status_queues .column').hide();
                    $('#sys_status_queues div.body').css({'background-color': 'transparent'});
                    $('#queue_div').css({'border': '1px solid #d6d6d6', 'border-top': '0'});
                }

                setTimeout(function() {
                    queueRefresh = true;

                    loadQueues(true)
                }, 4000);
            }

            if (!queueRefresh && checkAllPrivilege()) {
                loadParkingLot();
            }
        }
    });
}

function loadConferenceRooms(isRefresh) {
    var conf_template = $('#sys_status_meetme #meetme_div > div.template'),
        conf_body = $('#sys_status_meetme #meetme_div');

    confRefresh = isRefresh;
    // conf_body.empty();
    conf_body.append(conf_template);

    $.ajax({
        url: '../cgi',
        type: 'POST',
        dataType: 'json',
        async: false,
        data: {
            action: 'getConfStatusList',
            "auto-refresh": Math.random()
        },
        error: function() {
            if (!confRefresh && checkAllPrivilege()) {
                loadQueues();
            }
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var conferenceStatus = data.response.conference_status;

                conferenceStatus = conferenceStatus ? conferenceStatus.sort(UCMGUI.bySort("extension", "down")) : [];

                for (var i = 0; i < conferenceStatus.length; i++) {
                    // for (l in m) {
                    var extension = conferenceStatus[i].extension,
                        tmp = conf_template.clone(),
                        start_time = conferenceStatus[i].start_time;

                    tmp.attr('id', 'conf_' + extension.toString());

                    if (!confRefresh) {
                        tmp.appendTo(conf_body);
                    } else {
                        tmp = $('#conf_' + extension.toString());
                    }

                    var users_template = conf_template.contents().find('.members tr.template');

                    tmp.removeClass("template");
                    tmp.contents().find(".name").html(extension);

                    if (start_time && start_time !== '--') {
                        tmp.contents().find(".join-time").html($P.lang('LANG1048') + ' : ' + start_time).attr('locale', "LANG1048 : " + start_time);
                    }

                    $.ajax({
                        url: '../cgi',
                        type: 'POST',
                        dataType: 'json',
                        async: false,
                        data: {
                            action: 'getConfMemberStatus',
                            "auto-refresh": Math.random(),
                            extension: extension
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                var confMembersStatus = data.response.extension,
                                    len = confMembersStatus.length;

                                if (confMembersStatus.length != 0) {
                                    tmp.contents().find("tr").not(".template").remove();

                                    var join_time = confMembersStatus[0].join_time;

                                    tmp.contents().find(".status").html($P.lang('LANG2407').format(len)).attr('locale', "LANG2407 '" + len + "'");
                                    // tmp.contents().find(".join-time").html($P.lang('LANG1048') + ' : ' + join_time).attr('locale', "LANG1048 : " + join_time);
                                    tmp.find('.minimaxi').html('[ - ]');

                                    for (var i = 0; i < len; i++) {
                                        var confid = confMembersStatus[i].extension,
                                            cid = confMembersStatus[i].caller_id,
                                            duration = getActivityTime(confMembersStatus[i].join_time);

                                        addMeetmeMember(confid, cid, duration);
                                    }
                                } else {
                                    tmp.contents().find(".status").html($P.lang("LANG141")).attr("locale", "LANG141");
                                    tmp.contents().find(".time").html("00:00");
                                    tmp.contents().find(".join-time").html("").removeAttr("locale");
                                    tmp.contents().find(".members > .list > tbody").empty().html("<tr><td colspan='4' locale='LANG2317 LANG1013'>" + $P.lang("LANG2317").format($P.lang("LANG1013")) + "</td></tr>");
                                    tmp.find('.minimaxi').html('[ + ]');
                                    tmp.find('.body').hide();
                                }
                            }
                        }
                    });
                }

                if (conferenceStatus.length) {
                    $('#noconference').hide();
                } else {
                    $('#noconference').show();
                }

                setTimeout(function() {
                    confRefresh = true;

                    loadConferenceRooms(true)
                }, 5000);
            }

            if (!confRefresh && checkAllPrivilege()) {
                loadQueues();
            }
        }
    });
}

function addMeetmeMember(meetme, user_num, duration) {
    // set duration's default value
    duration = typeof(duration) != 'undefined' ? duration : 0;

    var conf = $('#conf_' + meetme.toString() + ' .members > .list > tbody');
    conf.closest(".body").show();
    // conf.empty();

    var new_row = $('#sys_status_meetme #meetme_div > div.template .members tr.template').clone();
    new_row.children('.extension').html(user_num);
    new_row.children('.duration').addClass('count_html_up').html(duration);
    // new_row.children('.mem_status').html('Active');

    new_row.removeClass('template');
    new_row.attr('id', meetme.toString() + '_' + user_num);

    conf.append(new_row);
}

function loadInterfaceStatues(isRefresh) {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: true,
        url: "../cgi",
        data: {
            action: "getInterfaceStatus"
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response;

                if (response['interface-sdcard'] == "true") {
                    $('#sdcard_status').attr({
                        "class": "sdcard_connected",
                        "localeTitle": "LANG997",
                        "title": $P.lang("LANG997")
                    });
                } else {
                    $('#sdcard_status').attr({
                        "class": "sdcard_disconnected",
                        "localeTitle": "LANG998",
                        "title": $P.lang("LANG998")
                    });
                }

                if (response['interface-usbdisk'] == "true") {
                    $('#usb_status').attr({
                        "class": "usb_connected",
                        "localeTitle": "LANG999",
                        "title": $P.lang("LANG999")

                    });
                } else {
                    $('#usb_status').attr({
                        "class": "usb_disconnected",
                        "localeTitle": "LANG1000",
                        "title": $P.lang("LANG1000")
                    });
                }

                if (typeof(response['power-poe']) != "undefined") {
                    $("#poe").show();

                    if (response['power-poe'] == 1) {
                        $('#poe_status').attr({
                            "class": "power_work",
                            "localeTitle": "LANG3075",
                            "title": $P.lang("LANG3075")
                        });
                    } else {
                        $('#poe_status').attr({
                            "class": "power_disconnected",
                            "localeTitle": "LANG3076",
                            "title": $P.lang("LANG3076")
                        });
                    }
                } else {
                    $("#poe").hide();
                }

                if (typeof(response['power-port1']) != "undefined") {
                    $("power1").show();

                    if (response['power-port1'] == "Work") {
                        $('#power1_status').attr({
                            "class": "power_work",
                            "localeTitle": "LANG3079",
                            "title": $P.lang("LANG3077") + $P.lang("LANG3079")
                        });
                    } else if (response['power-port1'] == "Disconnected") {
                        $('#power1_status').attr({
                            "class": "power_disconnected",
                            "localeTitle": "LANG3080",
                            "title": $P.lang("LANG3077") + $P.lang("LANG3080")
                        });
                    } else {
                        $('#power1_status').attr({
                            "class": "power_abnormal",
                            "localeTitle": "LANG3081",
                            "title": $P.lang("LANG3077") + $P.lang("LANG3081")
                        });
                    }
                } else {
                    $("#power1").hide();
                }

                if (typeof(response['power-port2']) != "undefined") {
                    $("#power2").show();

                    if (response['power-port2'] == "Work") {
                        $('#power2_status').attr({
                            "class": "power_work",
                            "localeTitle": "LANG3079",
                            "title": $P.lang("LANG3078") + $P.lang("LANG3079")
                        });
                    } else if (response['power-port2'] == "Disconnected") {
                        $('#power2_status').attr({
                            "class": "power_disconnected",
                            "localeTitle": "LANG3080",
                            "title": $P.lang("LANG3077") + $P.lang("LANG3080")
                        });
                    } else {
                        $('#power2_status').attr({
                            "class": "power_abnormal",
                            "localeTitle": "LANG3081",
                            "title": $P.lang("LANG3077") + $P.lang("LANG3081")
                        });
                    }
                } else {
                    $("#power2").hide();
                }

                if (!$.isEmptyObject(response['interface-network'])) {
                    if (response['interface-network'].HBT) {
                        if (response['interface-network'].HBT == "linked") {
                            $('#hbt_status').attr({
                                "class": "net_connected",
                                "localeTitle": "LANG3072",
                                "title": $P.lang("LANG3072")
                            });
                        } else {
                            $('#hbt_status').attr({
                                "class": "net_disconnected",
                                "localeTitle": "LANG3073",
                                "title": $P.lang("LANG3073")
                            });
                        }
                    } else {
                        var children = $('#hbt').children();
                        for (i = 0; i < children.length; i++) {
                            $(children[i]).hide();
                        }
                        $('#hbt').hide();
                    }
                    if (response['interface-network'].LAN1) {
                        if (response['interface-network'].LAN1 == "linked") {
                            $('#lan1_status').attr({
                                "class": "net_connected",
                                "localeTitle": "LANG1003",
                                "title": $P.lang("LANG1003")
                            });
                        } else {
                            $('#lan1_status').attr({
                                "class": "net_disconnected",
                                "localeTitle": "LANG1004",
                                "title": $P.lang("LANG1004")
                            });
                        }
                    } else {
                        var children = $('#lan1').children();

                        for (i = 0; i < children.length; i++) {
                            $(children[i]).hide();
                        }

                        $('#lan1').hide();
                    }

                    if (response['interface-network'].LAN2) {
                        if (response['interface-network'].LAN2 == "linked") {
                            $('#lan2_status').attr({
                                "class": "net_connected",
                                "localeTitle": "LANG1003",
                                "title": $P.lang("LANG1003")
                            });
                        } else {
                            $('#lan2_status').attr({
                                "class": "net_disconnected",
                                "localeTitle": "LANG1004",
                                "title": $P.lang("LANG1004")
                            });
                        }
                    } else {
                        var children = $('#lan2').children();

                        for (i = 0; i < children.length; i++) {
                            $(children[i]).hide();
                        }

                        $('#lan2').hide();
                    }

                    if (response['interface-network'].WAN) {
                        if (response['interface-network'].WAN == "linked") {
                            $('#wan_status').attr({
                                "class": "net_connected",
                                "localeTitle": "LANG1001",
                                "title": $P.lang("LANG1001")
                            });
                        } else {
                            $('#wan_status').attr({
                                "class": "net_disconnected",
                                "localeTitle": "LANG1002",
                                "title": $P.lang("LANG1002")
                            });
                        }
                    } else {
                        var children = $('#wan').children();

                        for (i = 0; i < children.length; i++) {
                            $(children[i]).hide();
                        }
                    }

                    if (response['interface-network'].LAN) {
                        if (response['interface-network'].LAN == "linked") {
                            $('#lan_status').attr({
                                "class": "net_connected",
                                "localeTitle": "LANG1003",
                                "title": $P.lang("LANG1003")
                            });
                        } else {
                            $('#lan_status').attr({
                                "class": "net_disconnected",
                                "localeTitle": "LANG1004",
                                "title": $P.lang("LANG1004")
                            });
                        }
                    } else {
                        var children = $('#lan').children();

                        for (i = 0; i < children.length; i++) {
                            $(children[i]).hide();
                        }

                        $('#lan').hide();
                        $('#wan').hide(); /*Hide WAN too*/
                    }

                }
                var DAHDI_ALARM_NONE = 0; /* No alarms */
                var DAHDI_ALARM_RECOVER = (1 << 0); /* Recovering from alarm */
                var DAHDI_ALARM_LOOPBACK = (1 << 1); /* In loopback */
                var DAHDI_ALARM_YELLOW = (1 << 2); /* Yellow Alarm */
                var DAHDI_ALARM_RED = (1 << 3); /* Red Alarm */
                var DAHDI_ALARM_BLUE = (1 << 4); /* Blue Alarm */
                var DAHDI_ALARM_NOTOPEN = (1 << 5);
                /* Verbose alarm states (upper byte) */
                var DAHDI_ALARM_LOS = (1 << 8); /* Loss of Signal */
                var DAHDI_ALARM_LFA = (1 << 9); /* Loss of Frame Alignment */
                var DAHDI_ALARM_LMFA = (1 << 10); /* Loss of Multi-Frame Align */

                if (response['interface-pri'] && response['interface-pri'].length != 0) {
                    /*Added PRI*/
                    var obj;
                    $('#digital1_status').hide();
                    $('#digital2_status').hide();
                    $('#digital1_label').hide();
                    $('#digital2_label').hide();

                    for (i = 0; i < response['interface-pri'].length; i++) {
                        if (response['interface-pri'][i].span - 2 == 1) {
                            /*Show Port 1*/
                            obj = $('#digital1_status');
                            $('#digital1_label').show();
                        } else {
                            /*Show Port 2*/
                            obj = $('#digital2_status');
                            $('#digital2_label').show();
                        }

                        if ((response['interface-pri'][i].alarm | DAHDI_ALARM_NONE) == 0) {
                            obj.attr({
                                "class": "net_connected",
                                "localeTitle": "LANG3084",
                                "title": $P.lang("LANG3094") + " " + (i + 1) + " " + $P.lang("LANG3084")
                            });
                        } else if ((response['interface-pri'][i].alarm & DAHDI_ALARM_YELLOW) != 0) {
                            obj.attr({
                                "class": "net_yellow",
                                "localeTitle": "LANG3087",
                                "title": $P.lang("LANG3094") + " " + (i + 1) + " " + $P.lang("LANG3087")
                            });
                        } else if ((response['interface-pri'][i].alarm & DAHDI_ALARM_RED) != 0) {
                            obj.attr({
                                "class": "net_red",
                                "localeTitle": "LANG3088",
                                "title": $P.lang("LANG3094") + " " + (i + 1) + " " + $P.lang("LANG3088")
                            });
                        } else if ((response['interface-pri'][i].alarm & DAHDI_ALARM_BLUE) != 0) {
                            obj.attr({
                                "class": "net_blue",
                                "localeTitle": "LANG1003",
                                "title": $P.lang("LANG3094") + " " + (i + 1) + " " + $P.lang("LANG3089")
                            });
                        } else if ((response['interface-pri'][i].alarm & DAHDI_ALARM_NOTOPEN) != 0) {
                            obj.attr({
                                "class": "net_connected_but_cant_use",
                                "localeTitle": "LANG1003",
                                "title": $P.lang("LANG3094") + " " + (i + 1) + " " + $P.lang("LANG3090")
                            });
                        }

                        obj.show();
                        /*response['interface-pri'][i].alarm: 0
                        response['interface-pri'][i].code_violations: 366
                        response['interface-pri'][i].crc_errors: 291
                        response['interface-pri'][i].ebit_count: 58
                        response['interface-pri'][i].framing_errors: 444
                        response['interface-pri'][i].general_errored_seconds: 6
                        response['interface-pri'][i].lbo: 0
                        response['interface-pri'][i].span_type: "E1"*/
                    }

                } else {
                    $('#digital1').remove();
                    $('#digital2').remove();
                }


                if (response['interface-fxs'] && response['interface-fxs'].length != 0) {
                    /*Added FXS*/
                    parseAndAddedPorts(response['interface-fxs'], "fxs", response);
                } else {
                    $('#fxs_status').remove();
                }
                if (response['interface-fxo'] && response['interface-fxo'].length != 0) {
                    /*Added FXO*/
                    parseAndAddedPorts(response['interface-fxo'], "fxo", response);
                } else {
                    $('#fxo_status').remove();
                }
                $(".interface_ul").show();
            }
        }
    });
}

function parseAndAddedPorts(data, type, res) {
    var modelInfo = config.model_info,
        fxo_total = Number(modelInfo.num_fxo),
        // xo_total = 16,
        fxs_total = Number(modelInfo.num_fxs),
        total = (fxo_total + fxs_total);

    var fxo_div = document.getElementById('fxo_status'),
        ochildren = fxo_div ? fxo_div.childNodes : [];

    if (type == "fxo") {
        for (i = 0; i < ochildren.length;) {
            fxo_div.removeChild(ochildren[i]);
        }
    }

    var fxs_div = document.getElementById('fxs_status'),
        schildren = fxs_div ? fxs_div.childNodes : [];

    if (type == "fxs") {
        for (i = 0; i < schildren.length;) {
            fxs_div.removeChild(schildren[i]);
        }
    }

    if (total <= 6) {
        // GXE5120, 5121
        if (type == "fxo") {
            for (i = 0; i < fxo_total; i++) {
                var chan = data[i].chan,
                    status = data[i].status,
                    div = $("<div>").attr({
                        localeTitle: "LANG996",
                        title: $P.lang("LANG996"),
                        id: chan
                    }).addClass("updiv"),
                    statusObj = getPortsStatus(status, "fxo", ""),
                    span = $("<span>").addClass("upindex").text(chan);

                div.attr(statusObj).append(span);

                $('#fxo_status').append(div);
            }
        } else if (type == "fxs") {
            for (i = 0; i < data.length; i++) {
                var chan = data[i].chan,
                    status = data[i].status,
                    disabled = data[i].out_of_service, // Check if this extension is disabled or not.
                    div = $("<div>").attr({
                        localeTitle: "LANG996",
                        title: $P.lang("LANG996"),
                        id: chan
                    }).addClass("updiv"),
                    statusObj = getPortsStatus(status, "fxs", "", disabled),
                    span = $("<span>").addClass("upindex").text(chan);

                div.attr(statusObj).append(span);

                $('#fxs_status').append(div);
            }
        }

        var sub_width = 36,
            sub_height = 29;

        document.getElementById('fxs_status').style.height = sub_height.toString() + "px";
        document.getElementById('fxs_status').style.width = (sub_width * fxs_total).toString() + "px";
        document.getElementById('fxo').style.height = sub_height.toString() + "px";

        $("#fxo > span").eq(0).css("top", "-10px");

        document.getElementById('fxo_status').style.height = document.getElementById('fxo').style.height;
        document.getElementById('fxo_status').style.width = (sub_width * fxo_total).toString() + "px";
        if (config.model_info.num_pri >= 1) {
            document.getElementById('interfaces_list').style.height = "220px";
        } else if(!$.isEmptyObject(res['interface-network'])){
            document.getElementById('interfaces_list').style.height = "160px";
        } else {
            document.getElementById('interfaces_list').style.height = "130px";
        }
    } else {
        // Others
        if (type == "fxo") {
            for (i = 0; i < fxo_total; i++) {
                var chan = data[i].chan,
                    status = data[i].status;

                if (chan % 2 != 0) {
                    var div = $("<div>").attr({
                            localeTitle: "LANG996",
                            title: $P.lang("LANG996"),
                            id: chan
                        }).addClass("updiv"),
                        statusObj = getPortsStatus(status, "fxo", ""),
                        span = $("<span>").addClass("upindex").text(chan);

                    div.attr(statusObj).append(span);

                    $('#fxo_status').append(div);
                }
            }

            for (i = 0; i < fxo_total; i++) {
                var chan = data[i].chan,
                    status = data[i].status;

                if (chan % 2 == 0) {
                    var div = $("<div>").attr({
                            localeTitle: "LANG996",
                            title: $P.lang("LANG996"),
                            id: chan
                        }).addClass("downdiv"),
                        statusObj = getPortsStatus(status, "fxo", "_r"),
                        span = $("<span>").addClass("downindex").text(chan);

                    div.attr(statusObj).append(span);

                    $('#fxo_status').append(div);
                }
            }
        } else if (type == "fxs") {
            for (i = 0; i < data.length; i++) {
                var chan = data[i].chan,
                    status = data[i].status,
                    disabled = data[i].out_of_service, // Check if this extension is disabled or not.
                    div = $("<div>").attr({
                        localeTitle: "LANG996",
                        title: $P.lang("LANG996"),
                        id: chan
                    }).addClass("updiv"),
                    statusObj = getPortsStatus(status, "fxs", "", disabled),
                    span = $("<span>").addClass("upindex").text(chan);

                div.attr(statusObj).append(span);

                $('#fxs_status').append(div);
            }
        }

        var sub_width = 36,
            sub_height = 29;

        document.getElementById('fxs_status').style.height = sub_height.toString() + "px";
        document.getElementById('fxs_status').style.width = (sub_width * fxs_total).toString() + "px";
        document.getElementById('fxo').style.height = (2 * sub_height).toString() + "px";

        $("#fxo > span").eq(0).css("top", "-20px");

        document.getElementById('fxo_status').style.height = document.getElementById('fxo').style.height;
        document.getElementById('fxo_status').style.width = (sub_width * fxo_total / 2).toString() + "px";
        if (fxo_total >= 8) {
            document.getElementById('interfaces_list').style.height = "195px";
        } else {
            document.getElementById('interfaces_list').style.height = "160px";
        }
    }
}

function getPortsStatus(status, type, reversal, disabled) {
    var obj = {};

    status = status.toLowerCase();

    // Disconnect and UnConfigured, UnConfigured, Disconnect, Idle, InUse

    if (type == "fxo") {
        if (status == "disconnect") {
            // Disconnected
            obj = {
                "style": "background:url(../images/FXO_disconnected" + reversal + ".png) center center no-repeat;",
                "localeTitle": "LANG996",
                "title": $P.lang("LANG996")
            };
        } else if (status == "unconfigured") {
            // Connected but unconfigure
            obj = {
                "style": "background:url(../images/FXO_unconfigured" + reversal + ".png) center center no-repeat;",
                "localeTitle": "LANG1005",
                "title": $P.lang("LANG1005")
            };
        } else if (status == "idle") {
            // Connected and Idle
            obj = {
                "style": "background:url(../images/FXO_connected" + reversal + ".png) center center no-repeat;",
                "localeTitle": "LANG1006",
                "title": $P.lang("LANG1006")
            };
        } else if (status == "inuse") {
            // Connected and in-used
            obj = {
                "style": "background:url(../images/FXO_busy" + reversal + ".png) center center no-repeat;",
                "localeTitle": "LANG112",
                "title": $P.lang("LANG112")
            };
        }
        // else if (status == "Disconnect and UnConfigured"){
        //     // Connected and in-used
        //     $('#port_' + port).attr({
        //         "style": "background:url(../config/images/FXO_unconfigured" + reversal + ".png) center center no-repeat;",
        //         "localeTitle": "LANG112",
        //         "title": $P.lang("LANG112")
        //     });
        // }
    } else if (type == "fxs") {
        // Idle, InUse, UnConfigured
        if (status == "unconfigured") {
            // Connected but unconfigure
            obj = {
                "style": "background:url(../images/FXO_unconfigured.png) center center no-repeat;",
                "localeTitle": "LANG1008",
                "title": $P.lang("LANG1008")
            };
        } else if (status == "idle") {
            // Connected and Idle
            obj = {
                "style": "background: url(../images/FXO_connected.png) center center no-repeat;",
                "localeTitle": "LANG1006",
                "title": $P.lang("LANG1006")
            };
        } else if (status == "inuse") {
            // Connected and in-used
            obj = {
                "style": "background: url(../images/FXO_busy.png) center center no-repeat;",
                "localeTitle": "LANG112",
                "title": $P.lang("LANG112")
            };
        }

        // Check if this extension is disabled or not.
        if (disabled && 　(disabled　 === 'yes')) {
            obj.localeTitle = 'LANG273';
            obj.title = $P.lang('LANG273');
        }
    }

    return obj;
}

function loadDigitalSlotStatues(isRefresh) {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: true,
        url: "../cgi",
        data: {
            action: "getPRIStatusList",
            "auto-refresh": Math.random()
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response;
                var pri = response ? response.pri : [];

                if (pri.length != 0) {
                    var PRIStatusList = $("#PRIStatusList");
                    var port = 1;
                    var T1Arr = [];
                    var E1Arr = [];
                    var J1Arr = [];

                    $("#sys_digital_slot_status").show();

                    PRIStatusList.empty();

                    for (var i = 0; i < pri.length; i++) {
                        var priIndex = pri[i];
                        var obj = {};

                        obj["slot"] = priIndex.slot;
                        obj["status"] = priIndex.status;
                        obj["chantype"] = priIndex.chantype;

                        if (priIndex.span_type == "E1") {
                            E1Arr.push(obj);
                        } else if (priIndex.span_type == "T1") {
                            T1Arr.push(obj);
                            T1Arr = T1Arr.slice(0, 24);
                        } else if (priIndex.span_type == "J1") {
                            J1Arr.push(obj);
                            J1Arr = J1Arr.slice(0, 24);
                        }
                    }

                    var renderPortStatus = function(arr, rowspan) {
                        var status,
                            statusIcon;

                        for (var i = 0; i < arr.length;) {
                            var tr = $("<tr>").appendTo(PRIStatusList);

                            if (i == 0) {
                                $("<td>").attr({
                                    "rowspan": rowspan,
                                    "width": "80px",
                                    "locale": "LANG237 \'" + port + "\'"
                                }).addClass("PRIStatusList_table_div_bottom").text($P.lang("LANG237") + " " + port).appendTo(tr);
                            }

                            var td = $("<td>").appendTo(tr);
                            var div = $("<div>").addClass("PRIStatusList_table_div");

                            for (var j = i; j < i + 8; j++) {
                                if (j == arr.length) {
                                    status = "inuse";
                                    statusIcon = statusObj[status];

                                    $("<span>").attr({
                                        localetitle: statusIcon,
                                        title: $P.lang(statusIcon)
                                    }).addClass(statusIcon).css("visibility", "hidden").appendTo(div);

                                    $("<div>").css("visibility", "hidden").appendTo(div);

                                    break;
                                }

                                if (arr[j].chantype.toLowerCase() == "d" && (arr[j].status === null || arr[j].status === '')) {
                                    statusIcon = "LANG3152";
                                } else if (arr[j].chantype.toLowerCase() == "data") {
                                    statusIcon = "LANG3133";
                                } else {
                                    status = arr[j].status.toLocaleLowerCase() || "unavailable";
                                    statusIcon = statusObj[status];
                                }

                                $("<span>").attr({
                                    localetitle: statusIcon,
                                    title: $P.lang(statusIcon)
                                }).addClass(statusIcon).appendTo(div);

                                var slot = arr[j].slot;
                                var divText = $("<div>").text(slot);
                                var bchan = divText.appendTo(div);

                                if (arr[j].chantype.toLowerCase() == "d") {
                                    bchan.addClass("DChannel");
                                }
                            }

                            div.appendTo(td);
                            i += 8;
                        }
                    };

                    if (T1Arr.length != 0) {
                        renderPortStatus(T1Arr, 3);
                        port += 1;
                    }

                    if (E1Arr.length != 0) {
                        renderPortStatus(E1Arr, 4);
                        port += 1;
                    }

                    if (J1Arr.length != 0) {
                        renderPortStatus(J1Arr, 3);
                    }

                    $("#PRIStatusList tr").last().children().children().addClass("PRIStatusList_table_div_last");
                    $(".PRIStatusList_table_div_bottom").last().removeClass("PRIStatusList_table_div_bottom");
                }

                setTimeout(function() {
                    loadDigitalSlotStatues(true);
                }, 5000);
            }
        }
    });
}

function loadParkingLot(isRefresh) {
    $("#parking_lot_div").empty();

    var container = "<table id='parking_lot_list'></table><div id='parking_lot_list_pager'></div>";

    parkingRefresh = isRefresh;

    $(container).appendTo("#parking_lot_div");

    $("#parking_lot_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: $("#sys_status_plot").width() - 6,
        height: "auto",
        postData: {
            "action": "listParkingLotStatus",
            "auto-refresh": Math.random()
        },
        colNames: [
            '<span locale="LANG78">' + $P.lang('LANG78') + '</span>',
            '<span locale="LANG101">' + $P.lang('LANG101') + '</span>',
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG102">' + $P.lang('LANG102') + '</span>'
        ],
        colModel: [{
            name: 'callerid',
            index: 'callerid',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'channel',
            index: 'channel',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 'exten',
            index: 'exten',
            width: 80,
            resizable: false,
            align: "center"
        }, {
            name: 'park_time',
            index: 'park_time',
            width: 100,
            resizable: false,
            align: "center",
            // sortable: false,
            formatter: transParkTime
        }],
        loadui: 'disable',
        pager: "parking_lot_list_pager",
        rowNum: 10,
        // rowList: [10, 20, 30],
        viewrecords: true,
        sortname: 'callerid',
        noData: "LANG129 LANG99",
        jsonReader: {
            root: "response.exten",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#parking_lot_list .jqgrow:even").addClass("ui-row-even");

            setTimeout(function() {
                $("#parking_lot_list").setGridWidth($("#sys_status_plot").width() - 2);
            }, 500);

            setTimeout(function() {
                parkingRefresh = true;
                parkingLotJumpVal = $("#parking_lot_list_pager .jump").val();
                $("#parking_lot_list").trigger('reloadGrid');
            }, 7000);
        },
        gridComplete: function() {
            $P.lang(doc, true);
            $("#parking_lot_list_pager .jump").val(parkingLotJumpVal);
        }
    });

    // top.dialog.clearDialog();
}

function bindButtonEvent() {
    // Event Delegation
    $('body')
        .delegate('.minimaxi', 'click', function() {
            $(this).parent().parent().children(".body").toggle();

            if ($(this).html() == "[ - ]") {
                $(this).html("[ + ]");
            } else {
                $(this).html("[ - ]");
            }

            return false;
        })
        .delegate('#loadInterfaceStatues', 'click', function() {
            loadInterfaceStatues("refresh");
            return false;
        })
        .delegate('#loadConferenceRooms', 'click', function() {
            loadConferenceRooms("refresh");
            return false;
        })
        .delegate('#loadParkingLot', 'click', function() {
            loadParkingLot("refresh");
            return false;
        })
        .delegate('.section', 'click', function() {
            loadExtensions("refresh");
            return false;
        })
        .delegate('#loadExtensions', 'click', function() {
            loadExtensions("refresh");
            return false;
        })
        .delegate('#loadTrunks', 'click', function() {
            loadTrunks("refresh");
            return false;
        })
        .delegate('#loadQueues', 'click', function() {
            loadQueues("refresh");
            return false;
        })
        .delegate('#loadDigitalSlotStatues', 'click', function() {
            loadDigitalSlotStatues("refresh");
            return false;
        });

    $('#sys_status_meetme')
        .delegate('.actions .kick', 'click', function() {
            alert('kick!');
        }).delegate('.actions .mute', 'click', function() {
            alert('mute!');
        });

    $('#extensions_sections')
        .delegate('.section', 'click', function(ev) {
            $(this).addClass('active');
            $(this).siblings().removeClass('active');

            // $(".header_sort_down").removeClass("header_sort_down");
            // $(".header_sort_up").removeClass("header_sort_up");

            loadExtensions("section");

            ev.stopPropagation();
        });

    if (role === 'privilege_0' || role === 'privilege_1') {
        // bind title link
        var module = top.frames['frameContainer'].module;

        $('#trunk_title').click(function() {
            module.jumpMenu("trunks_analog.html");
        });

        $('#extension_title').click(function() {
            module.jumpMenu("extension.html");
        });

        $('#queue_title').click(function() {
            module.jumpMenu("queue.html");
        });

        $('#conference_title').click(function() {
            module.jumpMenu("meetroomuser.html");
        });

        $('#interface_title').click(function() {
            if (UCMGUI.config.model_info.num_pri >= 1) {
                module.jumpMenu("hardware_dahdi_digital.html");
            } else {
                module.jumpMenu("hardware_dahdi_analog.html");
            }
        });

        $('#digital_slot_title').click(function() {
            module.jumpMenu("hardware_dahdi_digital.html");
        });

        $('#park_title').click(function() {
            module.jumpMenu("features.html");
        });
    } else {
        $('body').removeClass('dashboard');
    }
}

function renderChannelHangup(cellvalue, status, rowObject) {
    return '<div id="channelHangup">' + rowObject.channel + '</div>';
}

function renderChannel1Hangup(cellvalue, status, rowObject) {
    return '<div id="channel1Hangup">' + rowObject.channel1 + '</div>';
}

function renderChannel2Hangup(cellvalue, status, rowObject) {
    return '<div id="channel2Hangup">' + rowObject.channel2 + '</div>';
}

function transTrunkStatusData(cellvalue, status, rowObject) {
    var status = rowObject.status ? rowObject.status : "Unavailable",
        statusLower = status.toLowerCase(),
        disabled = rowObject.out_of_service;

    if (disabled == 'yes') {
        // disable
        status = '<font color="#A9A9A9" locale="LANG273">' + $P.lang('LANG273') + '</font>';
    } else {
        if (statusLower == 'unavailable' || statusLower == 'unvailable') {
            // unavailable
            status = '<font color="red" locale="LANG113">' + $P.lang('LANG113') + '</font>';
        } else if (statusLower == 'available') {
            //available
            status = '<font color="green" locale="LANG110">' + $P.lang('LANG110') + '</font>';
        } else if (statusLower == 'busy') {
            // busy
            status = '<font color="orange" locale="LANG2237">' + $P.lang('LANG2237') + '</font>';
        } else if (statusLower == 'unreachable') {
            // unreachable
            status = '<font color="red" locale="LANG2394">' + $P.lang('LANG2394') + '</font>';
        } else if (statusLower == 'unmonitored') {
            // unmonitored
            status = '<font color="gray" locale="LANG2395">' + $P.lang('LANG2395') + '</font>';
        } else if (statusLower == 'ok' || statusLower == 'reachable') {
            // reachable
            status = '<font color="green" locale="LANG2396">' + $P.lang('LANG2396') + '</font>';
        } else if (statusLower == 'lagged') {
            // lagged
            status = '<font color="gray" locale="LANG2397">' + $P.lang('LANG2397') + '</font>';
        } else if (statusLower == 'registered') {
            // registered
            status = '<font color="green" locale="LANG2398">' + $P.lang('LANG2398') + '</font>';
        } else if (statusLower == 'unregistered') {
            // unregistered
            status = '<font color="red" locale="LANG2399">' + $P.lang('LANG2399') + '</font>';
        } else if (statusLower == 'failed') {
            // failed
            status = '<font color="red" locale="LANG2405">' + $P.lang('LANG2405') + '</font>';
        } else if (statusLower == 'unknown') {
            // unknown
            status = '<font color="red" locale="LANG2403">' + $P.lang('LANG2403') + '</font>';
        } else if (statusLower == 'rejected') {
            // rejected
            status = '<font color="red" locale="LANG2401">' + $P.lang('LANG2401') + '</font>';
        } else if (statusLower == 'timeout') {
            // timeout
            status = '<font color="red" locale="LANG102">' + $P.lang('LANG102') + '</font>';
        } else if (statusLower.contains('no authentication') || statusLower == 'no') {
            // no authentication
            status = '<font color="red" locale="LANG2428">' + $P.lang('LANG2428') + '</font>';
        } else if (statusLower.contains('auth. sent') || statusLower.contains('request sent') || statusLower == 'request') {
            // trying
            status = '<font locale="LANG2402">' + $P.lang('LANG2402') + '</font>';
        } else if (statusLower == 'errorconfigured') {
            //Error configured
            status = '<font color="orange" locale="LANG2795">' + $P.lang('LANG2795') + '</font>';
        }
    }

    return status;
}

function transPortData(cellvalue, portsOrHost, rowObject) {
    var portsOrHost = rowObject.host,
        regHost = /^((([hH][Tt][Tt][Pp][Ss])|(([Tt][Ff]|[Ff]|[Hh][Tt])[Tt][Pp])):\/\/)?(((([a-z]|\d|-|\.|_|~|[A-Z])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[A-Z])|(([a-z]|\d|[A-Z])([a-z]|\d|-|\.|_|~|[A-Z])*([a-z]|\d|[A-Z])))\.)+(([a-z]|[A-Z])|(([a-z]|[A-Z])([a-z]|\d|-|\.|_|~|[A-Z])*([a-z]|[A-Z])))\.?)(:\d*)?)$/;

    if (UCMGUI.isIPv6(portsOrHost)) {
        return portsOrHost;
    }
    if (!regHost.test(portsOrHost)) {
        portsOrHost = portsOrHost ? '<font locale="LANG2986 \'' + portsOrHost + '\'">' + $P.lang("LANG2986") + portsOrHost + '</font>' : "";
    }

    return portsOrHost;
}

function transMsgData(cellvalue, msg, rowObject) {
    var urgemsg = rowObject.urgemsg?rowObject.urgemsg:0,
        newmsg = rowObject.newmsg?rowObject.newmsg:0,
        oldmsg = rowObject.oldmsg?rowObject.oldmsg:0;

    return msg = '<font color="#a6a6a6" locale="LANG574"></font>' + " " + urgemsg + "/" + newmsg + "/" + oldmsg;
}

function transExtStatusData(cellvalue, status, rowObject) {
    var status = rowObject.status?rowObject.status.toLowerCase():'unavailable',
        disabled = rowObject.out_of_service,
        span = $('<span></span>');

    if (disabled == 'yes') {
        span.addClass(statusObj['unavailable'])
            .attr({
                localeTitle: 'LANG273',
                title: $P.lang('LANG273')
            });
    } else {
        span.addClass(statusObj[status])
            .attr({
                localeTitle: statusObj[status],
                title: $P.lang(statusObj[status])
            });
    }

    status = span[0].outerHTML;

    return status;
}

function transTypeData(cellvalue, type, rowObject) {
    var type = rowObject.type,
        typeLower = (type ? type.toLowerCase() : '');

    if (typeLower == "analog") {
        var span = $('<span></span>');

        span.attr("locale", "LANG105");

        type = span[0].outerHTML;
    }

    return type;
}

function transParkTime(cellvalue, status, rowObject) {
    var activity = getActivityTime(rowObject.park_time),
        match = activity.match(/\d+/g);

    if (match) {
        var queueTimeout = parkingtime - UCMGUI.addZero((Number(match[1]) * 60) + Number(match[2]));

        return queueTimeout;
    }
}

function getCurrentTime() {
    var currentTime = '1970-01-01 00:00:00';

    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: 'checkInfo',
            user: $P.cookie('username')
        },
        success: function(data) {
            if (data && data.status == 0) {
                currentTime = data.response.current_time;
            }
        }
    });

    return currentTime;
}

function getActivityTime(startTime) {
    var startTime = startTime.replace(/-/g, "/"), // start time
        // endTime = new Date(), // end time
        endTime = getCurrentTime().replace(/-/g, "/"), // end time
        timeAry = endTime.split(' '),
        milliseconds = Date.parse(timeAry[0] + " " + timeAry[1]) - Date.parse(startTime), // milliseconds between start time and end time
        activity = '';

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

function ellipsis() {
    var labels = $(".interface_label", $(".interfaces_list").get(0));

    $.each(labels, function(index, item) {
        var item = $(item);
        var result = textSize({
                fontSize: "12px"
            }, item);

        var width = item.width() - 10; // padding-left: 10px

        item.removeClass("cursor");

        if (width < result.width) {
            item.attr("title", $P.lang(item.attr("locale")))
                .addClass("cursor");
        }
    });
}

function textSize(styles, obj) {
    var text = obj.text();
    var a = document.createElement("a");
    var result = {};

    result.width = a.offsetWidth;
    result.height = a.offsetWidth;

    a.style.fontSize = styles.fontSize;
    a.style.visibility = "hidden";

    document.body.appendChild(a);

    if (typeof a.textContent != "undefined") {
        a.textContent = text;
    } else {
        a.innerText = text;
    }

    result.width = a.offsetWidth - result.width;
    result.height = a.offsetHeight - result.height;

    a.parentNode.removeChild(a);

    return result;
}

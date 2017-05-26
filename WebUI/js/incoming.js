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
    addZero = UCMGUI.addZero,
    ifExisted = UCMGUI.inArray,
    trunkList = [],
    trunkOption = '',
    slaTrunkNameList = [],
    officeTimeList = [],
    holidayList = [],
    inboundMode = 0,
    officeTimeType = ["LANG133", "LANG3271", "LANG3275", "LANG3266", "LANG3286", "LANG3287", "LANG3288"],
    destinationType = ['byDID', 'account', 'voicemail', 'conference', 'queue', 'ringgroup', 'paginggroup', 'vmgroup', 'fax', 'disa', 'ivr', 'directory', 'external_number', 'callback'],
    destinationTypeText = ['LANG1563', 'LANG85', 'LANG90', 'LANG98', 'LANG24', 'LANG600', 'LANG23', 'LANG89', 'LANG95', 'LANG2353', 'LANG19', 'LANG2884', 'LANG3458', 'LANG3741'],
    destinationTypeValue = {
        'byDID': [],
        'account': [],
        'voicemail': [],
        'conference': [],
        'queue': [],
        'ringgroup': [],
        'paginggroup': [],
        'vmgroup': [],
        'fax': [],
        'disa': [],
        'ivr': [],
        'directory': [],
        'external_number': [],
        'callback': []
    };

String.prototype.format = top.String.prototype.format;
Array.prototype.format = top.Array.prototype.each;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG658"));

    bindButtonEvent();

    checkInboundMode();

    updateLists();

    $.each(trunkList, function(item, data) {
        var option, locale, hasClass,
            value = data.trunk_index,
            technology = data.technology,
            name = data.trunk_name,
            disabled = (data.out_of_service && data.out_of_service == 'yes'),
            isSLA = ifExisted(name, slaTrunkNameList);

        // Pengcheng Zou Added. locale="{0}{1}{2}{3}" or locale="{0}{1}{2}{3}{4}{5}"
        locale = (disabled || isSLA) ? 'LANG564' : 'LANG2696';

        if (technology == 'Analog') {
            locale += ' LANG105 ';
        } else if (technology == 'SIP') {
            locale += ' LANG108 ';
        } else if (technology == 'IAX') {
            locale += ' LANG107 ';
        } else if (technology == 'BRI') {
            locale += ' LANG2835 ';
        } else if (technology == 'PRI' || technology == 'SS7' || technology == 'MFC/R2' || technology == 'EM' || technology == 'EM_W') {
            locale += ' ' + technology + ' ';
        } else {
            locale += ' ';
        }

        locale += "'&nbsp;'" + ' LANG83 ' + "'&nbsp;--&nbsp;" + name + "'";

        if (disabled) {
            locale += " '&nbsp;--&nbsp;' " + 'LANG273';
        } else if (isSLA) {
            locale += " '&nbsp;--&nbsp;' " + 'LANG3218';
        }

        hasClass = (disabled || isSLA) ? ' class="disabledExtOrTrunk"' : '';

        option = '<option locale="' + locale + '" technology="' + technology +
            '" value="' + value + '"' + hasClass + '></option>';

        trunkOption += option;
    });

    $("#trunkList").append(trunkOption);

    if (trunkList.length > 0) {
        createTable($("#trunkList").val());

        $('#trunkListDiv').show();
    } else {
        createTable('0');
    }

    $('#trunkList').on('change', function() {
        loadIncomingRulesList(this.value);
    });
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            if (trunkList.length > 0) {
                var trunkIndex = $('#trunkList').val();

                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG771"),
                    displayPos: "editForm",
                    frameSrc: "html/incoming_modal.html?mode=add&trunkIndex=" + trunkIndex
                });
            } else {
                top.dialog.dialogConfirm({
                    confirmStr: top.$.lang("LANG2698"),
                    buttons: {
                        ok: function() {
                            top.frames['frameContainer'].module.jumpMenu('trunks_voip.html');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnBlackList', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2278"),
                displayPos: "editForm",
                frameSrc: "html/blacklist.html"
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#btnSetGlobalInboundMode', 'click', function(ev) {
            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG843").format($P.lang("LANG26")),
                buttons: {
                    ok: function() {
                        top.frames['frameContainer'].module.jumpMenu('features.html', "?scrollBottom");
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $("#incomingRulesList")
        .delegate('.edit', 'click', function(ev) {
            var inbound_route = $(this).attr('inbound_route');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG659"),
                displayPos: "editForm",
                frameSrc: "html/incoming_modal.html?mode=edit&item={0}".format(inbound_route)
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var inbound_route = $(this).attr('inbound_route');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG3512"),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteInboundRoute",
                            "inbound_route": inbound_route
                        };

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
                                        content: $P.lang("LANG816")
                                    });

                                    updateLists();

                                    var table = $("#incomingRulesList"),
                                        totalPage = table.getGridParam("lastpage"),
                                        page = table.getGridParam("page"),
                                        reccount = table.getGridParam("reccount");

                                    if (page === totalPage && totalPage > 1 && reccount === 1) {
                                        table.setGridParam({
                                            page: totalPage - 1
                                        }).trigger('reloadGrid');
                                    } else {
                                        table.trigger('reloadGrid');
                                    }
                                }
                            }
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });
}

function checkInboundMode() {
    // Load Inbound Mode
    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        data: {
            "action": "getInboundMode",
            "auto-refresh": Math.random()
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                inboundMode = data.response.inbound_mode.inbound_mode;

                var nodes = $('.inbound-mode');

                if (nodes.length) {
                    nodes.each(function() {
                        if (inboundMode === 1) {
                            $(this)
                                .removeClass('green').addClass('blue')
                                .attr({'locale': 'LANG4289 \'' + inboundMode + '\''})
                                .text($P.lang('LANG4289').format(inboundMode));
                        } else {
                            $(this)
                                .removeClass('blue').addClass('green')
                                .attr({'locale': 'LANG4288'})
                                .text($P.lang('LANG4288'));
                        }
                    });
                }
            }
        }
    });

    setTimeout(checkInboundMode, 5000);
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button inbound_route="' + rowObject.inbound_rt_index + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button inbound_route="' + rowObject.inbound_rt_index + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return edit + del;
}

function createPattern(cellvalue, options, rowObject) {
    var pattern = '';

    if (cellvalue) {
        var match = cellvalue.split(','),
            length = match.length;

        if ((options.colModel.name === 'did_pattern_match') && rowObject.out_of_service && rowObject.out_of_service === 'yes') {
            pattern += '<span class="disabled_extension_trunk" localetitle="LANG273" title="' + $P.lang('LANG273') + '"></span>';
        }

        for (var i = 0; i < length; i++) {
            pattern += '<span style="display: block; line-height: 18px;">' + match[i] + '</span>';
        }
    } else {
        pattern += '<span locale="LANG2750">' + $P.lang('LANG2750') + '</span>'
    }

    return pattern;
}

function createName(cellvalue, options, rowObject) {
    var name;

    if ($('#trunkList :selected').hasClass('disabledExtOrTrunk')) {
        name = '<span class="disabled_extension_trunk" localetitle="LANG273" title="' + $P.lang('LANG273') + '"></span>' + cellvalue;
    } else {
        name = cellvalue;
    }

    return name;
}

function createTable(trunk_index) {
    $("#incomingRulesList").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listInboundRoute",
            "options": "inbound_rt_index,did_pattern_match,did_pattern_allow,out_of_service",
            "trunk_index": trunk_index
        },
        colNames: [
            '<span locale="LANG2995">' + $P.lang('LANG2995') + '</span>',
            '<span locale="LANG246">' + $P.lang('LANG246') + '</span>',
            '<span locale="LANG2748">' + $P.lang('LANG2748') + '</span>',
            '<span locale="LANG4294">' + $P.lang('LANG4294') + '</span>',
            '<span locale="LANG1557">' + $P.lang('LANG1557') + '</span>',
            '<span locale="LANG247">' + $P.lang('LANG247') + '</span>',
            '<span locale="LANG84">' + $P.lang('LANG84') + '</span>',
            '<span locale="LANG168">' + $P.lang('LANG168') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'inbound_rt_index',
            index: 'inbound_rt_index',
            width: 100,
            resizable: false,
            hidden: true,
            align: "center"
            // formatter: showNumber,
            // formatter: createName
        }, {
            name: 'did_pattern_match',
            index: 'did_pattern_match',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createPattern
        }, {
            name: 'did_pattern_allow',
            index: 'did_pattern_allow',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createPattern
        }, {
            name: 'members',
            index: 'members',
            width: 100,
            resizable: false,
            align: "center",
            formatter: translateMode,
            cellattr: hideTitle,
            sortable: false
        }, {
            name: 'members',
            index: 'members',
            width: 100,
            resizable: false,
            align: "center",
            formatter: translateTimeType,
            cellattr: hideTitle,
            sortable: false
        }, {
            name: 'members',
            index: 'members',
            width: 60,
            resizable: false,
            align: "center",
            formatter: translateTime,
            cellattr: hideTitle,
            sortable: false
        }, {
            name: 'members',
            index: 'members',
            width: 60,
            resizable: false,
            align: "center",
            formatter: translateType,
            cellattr: hideTitle,
            sortable: false
        }, {
            name: 'members',
            index: 'members',
            width: 300,
            resizable: false,
            align: "center",
            formatter: translateDes,
            cellattr: hideTitle,
            sortable: false
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#incomingRulesList_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'inbound_rt_index',
        noData: "LANG129 LANG15",
        jsonReader: {
            root: "response.inbound_route",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#incomingRulesList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function hideTitle(rowId, tv, rawObject, cm, rdata) {
    return 'title=""';
}

function loadIncomingRulesList(value) {
    $("#incomingRulesList")
        .setGridParam({
            postData: {
                "trunk_index": value
            }
        })
        .trigger('reloadGrid');
}

function showNumber(cellvalue, options, rowObject) {
    return 'NO.' + cellvalue;
}

function translateTimeType(cellvalue, options, rowObject) {
    var members = cellvalue,
        length = members.length,
        tdText = '',
        i = 0,
        timetype;

    for (i; i < length; i++) {

        if (!members[i] || (!members[i].timetype && members[i].timetype != '0') ||
            (members[i].inbound_mode == '1' && members[i].en_multi_mode == 'no') ||
            (members[i].tc && members[i].tc == '1' && members[i].timetype == '0')) {
            continue;
        } else if (members[i].timetype == '0') {
            tdText += '<div class="members" locale="LANG565 ' + "'--'" + '">' + $P.lang('LANG565').format('--') + '</div>';
        } else {
            timetype = members[i].timetype;
            tdText += '<div class="members" locale="' + officeTimeType[(timetype > 5 ? 6 : timetype)] + '">' + $P.lang(officeTimeType[(timetype > 5 ? 6 : timetype)]) + '</div>';
        }
    }

    return tdText;
}

function translateTime(cellvalue, options, rowObject) {
    var members = cellvalue,
        length = members.length,
        i = 0,
        time = '';

    for (i; i < length; i++) {
        if (!members[i] || (!members[i].timetype && members[i].timetype != '0') ||
            (members[i].inbound_mode == '1' && members[i].en_multi_mode == 'no') ||
            (members[i].tc && members[i].tc == '1' && members[i].timetype == '0')) {
            continue;
        } else if (members[i].timetype == '0') {
            time += '<div class="members" locale="LANG565 LANG257">' + $P.lang('LANG565').format($P.lang('LANG257')) + '</div>';
            continue;
        } else if (members[i].timetype > 0 && members[i].timetype <= 5) {
            time += '<div class="members" locale="LANG565 ' + "'--'" + '">' + $P.lang('LANG565').format('--') + '</div>';
            continue;
        }

        var stime_hour = addZero(members[i].start_hour),
            stime_minute = addZero(members[i].start_min),
            ftime_hour = addZero(members[i].end_hour),
            ftime_minute = addZero(members[i].end_min),
            tempTime = (stime_hour + ':' + stime_minute + '-' + ftime_hour + ':' + ftime_minute);

        time += '<div class="members" locale="LANG565 \'' + tempTime + '\'">' + tempTime + '</div>';
    }

    return time;
}

function translateType(cellvalue, options, rowObject) {
    var members = cellvalue,
        length = members.length,
        i = 0,
        type = '';

    for (i; i < length; i++) {
        if (!members[i] || (!members[i].timetype && members[i].timetype != '0') ||
            (members[i].inbound_mode == '1' && members[i].en_multi_mode == 'no') ||
            (members[i].tc && members[i].tc == '1' && members[i].timetype == '0')) {
            continue;
        } else if (members[i].timetype == '0') {
            type += '<div class="members" locale="LANG565 ' + "'--'" + '">' + $P.lang('LANG565').format('--') + '</div>';
            continue;
        } else if (members[i].timetype > 0 && members[i].timetype <= 5) {
            type += '<div class="members" locale="LANG565 ' + "'--'" + '">' + $P.lang('LANG565').format('--') + '</div>';
            continue;
        }

        var tempType = members[i].mode == 'byWeek' ? 'LANG199' : 'LANG200';

        type += '<div class="members" locale="LANG565 ' + tempType + '">' + $P.lang(tempType) + '</div>';
    }

    return type;
}

function getDisplayName(type, id_key, id_value, display_key) {
    var display_name = '';

    destinationTypeValue[type].each(function(item) {
        if (item[id_key] == id_value) {
            display_name = item[display_key];
            return display_name;
        }
    });

    return display_name;
}

function showDestination(lang, val, type, inbondModeText) {
    var destination = '';

    if (!val) {
        destination = '<div class="members wordBreak">' + inbondModeText +
            '<span locale="LANG566 ' + lang + ' ' + 'LANG2886' + '">' +
            $P.lang("LANG566").format($P.lang(lang), $P.lang('LANG2886')) + '</span></div>';
    } else if (type == 'account' || type == 'voicemail') {
        var item = UCMGUI.ObjectArray.find('extension', val, destinationTypeValue[type]),
            fullname = item.fullname,
            disable = item.out_of_service;

        if (disable && disable == 'yes') {
            destination = '<div class="members wordBreak">' + inbondModeText +
                '<span class="disabledExtOrTrunk" locale="' + lang + '"' + (fullname ? " fullname=' -- " + val + ' "' + fullname + '" \<' + "'" : " fullname=' -- " + val + ' \<' + "'") + '>' +
                $P.lang("LANG567").format($P.lang(lang), " -- " + val + (fullname ? ' "' + fullname + '"' : ''), ' &lt;' + $P.lang('LANG273') + '&gt;') + '</span></div>';
        } else {
            destination = '<div class="members wordBreak">' + inbondModeText +
                '<span locale="' + lang + '"' + (fullname ? " fullname=' -- " + val + ' "' + fullname + '"' + "'" : " fullname=' -- " + val + "'") + '>' +
                $P.lang("LANG566").format($P.lang(lang), " -- " + val + (fullname ? ' "' + fullname + '"' : '')) + '</span></div>';
        }
    } else {
        destination = '<div class="members wordBreak">' + inbondModeText +
            '<span locale="LANG566 ' + lang + ' ' + "' -- " + val + "'" + '">' +
            $P.lang("LANG566").format($P.lang(lang), " -- " + val) + '</span></div>';
    }

    return destination;
}

function translateDes(cellvalue, options, rowObject) {
    var members = cellvalue,
        length = members.length,
        i = 0,
        destination = '';

    for (i; i < length; i++) {
        if (!members[i] || (!members[i].timetype && members[i].timetype != '0') ||
            (members[i].inbound_mode == '1' && members[i].en_multi_mode == 'no') ||
            (members[i].tc && members[i].tc == '1' && members[i].timetype == '0')) {
            continue;
        }

        destination += translateDestination(undefined, undefined, members[i]);
    }

    return destination;
}

function translateMode(cellvalue, options, rowObject) {
    var mode = '';

    if (inboundMode === 1) {
        mode += '<div class="members inbound-mode blue" locale="LANG4289 \'' + inboundMode + '\'"></div>';
    } else {
        mode += '<div class="members inbound-mode green" locale="LANG4288"></div>';
    }

    return mode;
}

function translateDestination(cellvalue, options, rowObject) {
    var type = rowObject.destination_type,
        destination = '',
        display_name = '',
        inbondModeText = '';

    if (rowObject.inbound_mode == '1') {
        inbondModeText = '<span class="blue" style="padding-right: 20px;" locale="LANG4289 \'' + rowObject.inbound_mode + '\'"></span>';
    } else {
        inbondModeText = '<span class="green" style="padding-right: 20px;" locale="LANG4288"></span>';
    }   

    switch (type) {
        case 'byDID':
            destination = '<div class="members wordBreak">' + inbondModeText + '<span locale="LANG566 LANG1563 ' + "' -- Strip " + rowObject.did_strip + "'" +
                '">' + $P.lang("LANG566").format($P.lang("LANG1563"), " -- Strip " + rowObject.did_strip) + '</span></div>';
            break;
        case 'account':
            destination = showDestination('LANG248', rowObject[type], type, inbondModeText);
            break;
        case 'voicemail':
            destination = showDestination('LANG249', rowObject[type], type, inbondModeText);
            break;
        case 'conference':
            destination = showDestination('LANG98', rowObject[type], undefined, inbondModeText);
            break;
        case 'queue':
            display_name = getDisplayName(type, 'extension', rowObject[type], 'queue_name');

            destination = showDestination('LANG91', display_name, undefined, inbondModeText);
            break;
        case 'ringgroup':
            display_name = getDisplayName(type, 'extension', rowObject[type], 'ringgroup_name');

            destination = showDestination('LANG600', display_name, undefined, inbondModeText);
            break;
        case 'paginggroup':
            display_name = getDisplayName(type, 'extension', rowObject[type], 'paginggroup_name');

            destination = showDestination('LANG94', display_name, undefined, inbondModeText);
            break;
        case 'vmgroup':
            display_name = getDisplayName(type, 'extension', rowObject[type], 'vmgroup_name');

            destination = showDestination('LANG89', display_name, undefined, inbondModeText);
            break;
        case 'fax':
            display_name = getDisplayName(type, 'extension', rowObject[type], 'fax_name');

            destination = showDestination('LANG95', display_name, undefined, inbondModeText);
            break;
        case 'disa':
            display_name = getDisplayName(type, 'disa_id', rowObject[type], 'display_name');

            destination = showDestination('LANG2353', display_name, undefined, inbondModeText);
            break;
        case 'ivr':
            display_name = getDisplayName(type, 'ivr_id', rowObject[type], 'ivr_name');

            destination = showDestination('LANG134', display_name, undefined, inbondModeText);
            break;
        case 'directory':
            display_name = getDisplayName(type, 'extension', rowObject[type], 'name');

            destination = showDestination('LANG2884', display_name, undefined, inbondModeText);
            break;
        case 'external_number':
            // display_name = getDisplayName(type, 'external_number', rowObject[type], 'name');

            destination = showDestination('LANG3458', rowObject[type], undefined, inbondModeText);
            break;
        case 'callback':
            display_name = getDisplayName(type, 'callback_id', rowObject[type], 'name');

            destination = showDestination('LANG3741', display_name, undefined, inbondModeText);
            break;
        default:
            destination = '<div class="members" locale="LANG565 ' + "'--'" + '">' + $P.lang('LANG565').format('--') + '">--</div>';
            break;
    }

    return destination;
}

function updateLists() {
    trunkList = UCMGUI.isExist.getList("getTrunkList");

    slaTrunkNameList = UCMGUI.isExist.getList("getSLATrunkNameList");

    officeTimeList = UCMGUI.isExist.getList("listTimeConditionOfficeTime");

    holidayList = UCMGUI.isExist.getList("listTimeConditionHoliday");

    destinationTypeValue = {
        'byDID': [],
        'account': UCMGUI.isExist.getList("getAccountList"),
        'voicemail': UCMGUI.isExist.getList("getVoicemailList"),
        'conference': UCMGUI.isExist.getList("getConferenceList"),
        'queue': UCMGUI.isExist.getList("getQueueList"),
        'ringgroup': UCMGUI.isExist.getList("getRinggroupList"),
        'paginggroup': UCMGUI.isExist.getList("getPaginggroupList"),
        'vmgroup': UCMGUI.isExist.getList("getVMgroupList"),
        'fax': UCMGUI.isExist.getList("getFaxList"),
        'disa': UCMGUI.isExist.getList("getDISAList"),
        'ivr': UCMGUI.isExist.getList("getIVRList"),
        'directory': UCMGUI.isExist.getList("getDirectoryList"),
        'external_number': [],
        'callback': UCMGUI.isExist.getList("getCallbackList")
    };
}

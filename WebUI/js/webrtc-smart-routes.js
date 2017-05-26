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
    enableWebRTCAnonymousCall = '',
    routeNameList = [],
    messageRouteNameList = [],
    destinationTypeValue = {
        'account': [],
        'conference': [],
        'queue': [],
        'ringgroup': [],
        'paginggroup': [],
        'vmgroup': [],
        'ivr': []
    };

Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.format = top.Array.prototype.each;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG4496"));

    bindButtonEvent();

    updateLists();

    createTable();
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            if (enableWebRTCAnonymousCall === 'yes') {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG4340").format($P.lang("LANG4503")),
                    displayPos: "editForm",
                    frameSrc: "html/webrtc_smart_routes_modal.html?mode=add"
                });
            } else {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG4561").format($P.lang("LANG4396")),
                    buttons: {
                        ok: function() {
                            top.frames['frameContainer'].module.jumpMenu('sip_webrtc.html');
                        }
                    }
                });
            }


            ev.stopPropagation();
            return false;
        })
        .delegate('#btnHeaders', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4497"),
                displayPos: "editForm",
                frameSrc: "html/webrtc_request_headers.html"
            });

            ev.stopPropagation();
            return false;
        });

    $('div.message_buttons')
        .delegate('#btnAddMessage', 'click', function(ev) {
            if (enableWebRTCAnonymousCall === 'yes') {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG4340").format($P.lang("LANG4814")),
                    displayPos: "editForm",
                    frameSrc: "html/webrtc_smart_routes_modal.html?mode=add&type=message"
                });
            } else {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG4561").format($P.lang("LANG4396")),
                    buttons: {
                        ok: function() {
                            top.frames['frameContainer'].module.jumpMenu('sip_webrtc.html');
                        }
                    }
                });
            }


            ev.stopPropagation();
            return false;
        })

    $("#smartRouterList")
        .delegate('.edit', 'click', function(ev) {
            var index = $(this).attr('index'),
                name = $(this).attr('name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG4503"), name),
                displayPos: "editForm",
                frameSrc: "html/webrtc_smart_routes_modal.html?mode=edit&index={0}".format(index)
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var index = $(this).attr('index');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG3512"),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteWebRTCInboundRoute",
                            "webrtc_inbound_index": index
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

                                    var table = $("#smartRouterList"),
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

    $("#messageRouterList")
        .delegate('.edit', 'click', function(ev) {
            var index = $(this).attr('index'),
                name = $(this).attr('name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG4814"), name),
                displayPos: "editForm",
                frameSrc: "html/webrtc_smart_routes_modal.html?mode=edit&type=message&index={0}".format(index)
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var index = $(this).attr('index');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG3512"),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteWebRTCMessagesRoute",
                            "webrtc_message_inbound_index": index
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

                                    var table = $("#messageRouterList"),
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

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button index="' + rowObject.webrtc_inbound_index + '" name="' + rowObject.webrtc_route_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '';

    if (rowObject.webrtc_inbound_index == 0) {
        del = '<button index="' + rowObject.webrtc_inbound_index + '" title="Delete" localetitle="LANG739" class="options del disabled" disabled></button>';
    } else {
        del = '<button index="' + rowObject.webrtc_inbound_index + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    }

    return edit + del;
}


function createMessageOptions(cellvalue, options, rowObject) {
    var edit = '<button index="' + rowObject.webrtc_message_inbound_index + '" name="' + rowObject.webrtc_message_route_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '';

    if (rowObject.webrtc_message_inbound_index == 0) {
        del = '<button index="' + rowObject.webrtc_message_inbound_index + '" title="Delete" localetitle="LANG739" class="options del disabled" disabled></button>';
    } else {
        del = '<button index="' + rowObject.webrtc_message_inbound_index + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    }

    return edit + del;
}

function createTable() {
    $("#smartRouterList").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listWebRTCInboundRoute"
        },
        colNames: [
            '<span locale="LANG2995">' + $P.lang('LANG2995') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG4504">' + $P.lang('LANG4504') + '</span>',
            '<span locale="LANG168">' + $P.lang('LANG168') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'webrtc_inbound_index',
            index: 'webrtc_inbound_index',
            width: 100,
            resizable: false,
            hidden: true,
            align: "center",
            formatter: showNumber
        }, {
            name: 'webrtc_route_name',
            index: 'webrtc_route_name',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 'webrtc_route_type',
            index: 'webrtc_route_type',
            width: 150,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'webrtc_destination_type',
            index: 'webrtc_destination_type',
            width: 300,
            resizable: false,
            align: "center",
            formatter: translateDestination,
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
        pager: "#smartRouterList_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'webrtc_inbound_index',
        noData: "LANG129 LANG4503",
        jsonReader: {
            root: "response.webrtc_inbound_routes",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#smartRouterList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });

    $("#messageRouterList").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listWebRTCMessagesRoute"
        },
        colNames: [
            '<span locale="LANG2995">' + $P.lang('LANG2995') + '</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG4504">' + $P.lang('LANG4504') + '</span>',
            '<span locale="LANG168">' + $P.lang('LANG168') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'webrtc_message_inbound_index',
            index: 'webrtc_message_inbound_index',
            width: 100,
            resizable: false,
            hidden: true,
            align: "center",
            formatter: showNumber
        }, {
            name: 'webrtc_message_route_name',
            index: 'webrtc_message_route_name',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 'webrtc_message_route_type',
            index: 'webrtc_message_route_type',
            width: 150,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'webrtc_message_account',
            index: 'webrtc_message_account',
            width: 300,
            resizable: false,
            align: "center",
            formatter: translateMessageDestination,
            cellattr: hideTitle,
            sortable: false
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createMessageOptions,
            sortable: false
        }],
        pager: "#messageRouterList_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'webrtc_message_inbound_index',
        noData: "LANG129 LANG4503",
        jsonReader: {
            root: "response.webrtc_message_inbound_routes",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#messageRouterList .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
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

function hideTitle(rowId, tv, rawObject, cm, rdata) {
    return 'title=""';
}

function showNumber(cellvalue, options, rowObject) {
    return 'NO.' + cellvalue;
}

function showDestination(lang, val, type) {
    var destination = '';

    if (!val) {
        destination = '<div class="members wordBreak">' +
            '<span locale="LANG566 ' + lang + ' ' + 'LANG2886' + '">' +
            $P.lang("LANG566").format($P.lang(lang), $P.lang('LANG2886')) + '</span></div>';
    } else if (type == 'account' || type == 'voicemail') {
        var item = UCMGUI.ObjectArray.find('extension', val, destinationTypeValue[type]),
            fullname = item.fullname,
            disable = item.out_of_service;

        if (disable && disable == 'yes') {
            destination = '<div class="members wordBreak">' +
                '<span class="disabledExtOrTrunk" locale="' + lang + '"' + (fullname ? " fullname=' -- " + val + ' "' + fullname + '" \<' + "'" : " fullname=' -- " + val + ' \<' + "'") + '>' +
                $P.lang("LANG567").format($P.lang(lang), " -- " + val + (fullname ? ' "' + fullname + '"' : ''), ' &lt;' + $P.lang('LANG273') + '&gt;') + '</span></div>';
        } else {
            destination = '<div class="members wordBreak">' +
                '<span locale="' + lang + '"' + (fullname ? " fullname=' -- " + val + ' "' + fullname + '"' + "'" : " fullname=' -- " + val + "'") + '>' +
                $P.lang("LANG566").format($P.lang(lang), " -- " + val + (fullname ? ' "' + fullname + '"' : '')) + '</span></div>';
        }
    } else {
        destination = '<div class="members wordBreak">' +
            '<span locale="LANG566 ' + lang + ' ' + "' -- " + val + "'" + '">' +
            $P.lang("LANG566").format($P.lang(lang), " -- " + val) + '</span></div>';
    }

    return destination;
}

function translateDestination(cellvalue, options, rowObject) {
    var type = rowObject.webrtc_destination_type,
        destination = '',
        display_name = '';

    switch (type) {
        case 'account':
            destination = showDestination('LANG248', rowObject['webrtc_' + type], type);
            break;
        case 'conference':
            destination = showDestination('LANG98', rowObject['webrtc_' + type], undefined);
            break;
        case 'queue':
            display_name = getDisplayName(type, 'extension', rowObject['webrtc_' + type], 'queue_name');

            destination = showDestination('LANG91', display_name, undefined);
            break;
        case 'ringgroup':
            display_name = getDisplayName(type, 'extension', rowObject['webrtc_' + type], 'ringgroup_name');

            destination = showDestination('LANG600', display_name, undefined);
            break;
        case 'paginggroup':
            display_name = getDisplayName(type, 'extension', rowObject['webrtc_' + type], 'paginggroup_name');

            destination = showDestination('LANG94', display_name, undefined);
            break;
        case 'vmgroup':
            display_name = getDisplayName(type, 'extension', rowObject['webrtc_' + type], 'vmgroup_name');

            destination = showDestination('LANG89', display_name, undefined);
            break;
        case 'ivr':
            display_name = getDisplayName(type, 'extension', rowObject['webrtc_' + type], 'ivr_name');

            destination = showDestination('LANG134', display_name, undefined);
            break;
        case 'special_number':
            destination = showDestination('LANG4544', rowObject['webrtc_' + type], undefined);
            break;
        default:
            destination = '<div class="members" locale="LANG565 ' + "'--'" + '">' + $P.lang('LANG565').format('--') + '">--</div>';
            break;
    }

    return destination;
}

function translateMessageDestination(cellvalue, options, rowObject) {
    return showDestination('LANG248', rowObject['webrtc_message_account'], 'account');
}

function updateLists() {
    routeNameList = [];

    messageRouteNameList = [];

    destinationTypeValue = {
        'account': UCMGUI.isExist.getList("getAccountList"),
        'conference': UCMGUI.isExist.getList("getConferenceList"),
        'queue': UCMGUI.isExist.getList("getQueueList"),
        'ringgroup': UCMGUI.isExist.getList("getRinggroupList"),
        'paginggroup': UCMGUI.isExist.getList("getPaginggroupList"),
        'vmgroup': UCMGUI.isExist.getList("getVMgroupList"),
        'ivr': UCMGUI.isExist.getList("getIVRList")
    };

    // Load All Route Name.
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            "action": "listWebRTCInboundRoute"
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
                var routes = data.response.webrtc_inbound_routes;

                for (var i = 0; i < routes.length; i++) {
                    routeNameList.push(routes[i]['webrtc_route_name']);
                }
            }
        }
    });

    // Load All Message Route Name.
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            "action": "listWebRTCMessagesRoute"
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
                var routes = data.response.webrtc_message_inbound_routes;

                for (var i = 0; i < routes.length; i++) {
                    messageRouteNameList.push(routes[i]['webrtc_message_route_name']);
                }
            }
        }
    });

    // Check if enable webrtc anonymous call.
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            "action": "getSIPWebRTCHttpSettings"
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
                var httpSettings = data.response.webrtc_http_settings;

                enableWebRTCAnonymousCall = httpSettings.enable_webrtc_anonymous_call;
            }
        }
    });
}

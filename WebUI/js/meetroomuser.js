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
    mWindow = top.frames['frameContainer'].frames['mainScreen'], // this will be the main window
    role = $P.cookie('role'),
    limitConference = 3, // default
    limitConferenceMembers = 25, // default
    conferenceRange = [],
    conferenceList = [],
    conferenceMemberList = [],
    existNumberList = [],
    mohNameList = [],
    portExtensionList = [],
    room_list = [],
    lastAttentCount = {},
    room_user_list = {},
    firstload = true,
    lastLink = '',
    currentLink = '';

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG18"));

    initCeiStatus();

    check_device();

    var numFxo = Number(UCMGUI.config.model_info.num_fxo),
        numPri = UCMGUI.config.model_info.num_pri;

    if (numPri >= 1) {
        limitConference = 8; // default
        limitConferenceMembers = 64; // default
    }

    if (numFxo > 4) {
        limitConference = 6;
        limitConferenceMembers = 32;
    }

    getListAndRange();

    getPortExtension();

    renderRoomList();

    bindButtonEvent();

    doReflesh();

    setTimeout(reflesh_status, 300);

    // list_recordings();

    // set table width
    setTimeout(function() {
        $("#recordFiles").setGridWidth($('#table_meetmelist').width());
    }, 100);

    // bind resize event, set table width
    $(window).resize(function() {
        $("#recordFiles").setGridWidth($('#table_meetmelist').width());
    });

    $('#en_auto_reflesh').click(function() {
        if ($(this).is(':checked')) {
            $P.cookie('en_conf_reflesh', 'yes');
        } else {
            $P.cookie('en_conf_reflesh', 'no');
        }
    });

    var reflesh = $("#en_auto_reflesh"),
        enConfReflesh = $P.cookie('en_conf_reflesh');

    if (enConfReflesh && enConfReflesh == 'yes') {
        if (!reflesh.is('checked')) {
            reflesh.attr('checked', true);
        }
    } else if (enConfReflesh && enConfReflesh == 'no') {
        reflesh.attr('checked', false);
    }


    $('#en_cei_notify').on('click',function(event) {
      	if (check_room_count() == 0) {
            var action = {
                    'action': 'setInitCeiStatus'
                };

            if ($(this).is(':checked')) {
                action.initCeiStatus = 1;
            } else {
                action.initCeiStatus = 0;
            }

            cei_notify(action);
        } else {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG4481")
            });

            event.preventDefault();
        }

    });

    top.Custom.init(doc);
});

function storeChoose() {
    top.frames["frameContainer"].module.jumpMenu("recording_choose.html");
}

function check_device() {
    $.ajax({
        type: "POST",
        dataType: "json",
        async: false,
        url: "../cgi",
        data: {
            "action": 'getInterfaceStatus',
            "auto-refresh": Math.random()
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var sdcard_info = data.response['interface-sdcard'],
                    usbdisk_info = data.response['interface-usbdisk'],
                    store_msg = "";

                if (sdcard_info == "true" || usbdisk_info == "true") {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        async: false,
                        url: "../cgi",
                        data: {
                            "action": 'getRecordingLink',
                            "auto-refresh": Math.random()
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG913")
                            });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                var link_info = data.response['body'];

                                currentLink = link_info;

                                if (link_info == "local") {
                                    store_msg = "LANG1072";
                                } else if (link_info == "USB") {
                                    store_msg = "LANG263";
                                } else if (link_info == "SD") {
                                    store_msg = "LANG262";
                                }

                                $('.choose-tips').attr("locale", "LANG3757 " + store_msg);

                                $P.lang(doc, true);

                                if (role === 'privilege_0' || role === 'privilege_1') {
                                    $('.choose_buttons').show();
                                }
                            }
                        }
                    });
                } else {
                    $('.choose_buttons').hide();

                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        async: false,
                        url: "../cgi",
                        data: {
                            "action": 'getRecordingLink',
                            "auto-refresh": Math.random()
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG913")
                            });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                var link_info = data.response['body'];

                                currentLink = link_info;

                                if (link_info != "local") {
                                    $.ajax({
                                        type: "POST",
                                        dataType: "json",
                                        async: false,
                                        url: "../cgi",
                                        data: {
                                            "action": 'ChooseLink',
                                            "choose_link": "0"
                                        },
                                        error: function(jqXHR, textStatus, errorThrown) {
                                            top.dialog.dialogMessage({
                                                type: 'error',
                                                content: $P.lang("LANG913")
                                            });
                                        },
                                        success: function(data) {
                                            var bool = UCMGUI.errorHandler(data);

                                            if (bool) {}
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            }
        }
    });

    if (firstload) {
        list_recordings();

        firstload = false;

        lastLink = currentLink;
    } else {
        if (lastLink !== currentLink) {
            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG3867"),
                buttons: {
                    ok: function() {
                        $("#recordFiles").trigger("reloadGrid");

                        lastLink = currentLink;
                    },
                    cancel: function() {
                        lastLink = currentLink;
                    }
                }
            });
        }
    }

    setTimeout(check_device, 5000);
}

function add_eachroom(info) {
    addRoomObject(info, 1, info.extension);
    eachroomtd(info);
}

function addRoomObject(roomdata, suxfix, id) {
    roomdata[suxfix] = {};
    roomdata[suxfix].extension = id;
    roomdata[suxfix].attend_count = 0;
    roomdata[suxfix].admin_count = 0;
    roomdata[suxfix].start_time = "";
    roomdata[suxfix].activity = "";
}

function add_user(user, extension) {
    var userhtml,
        id = user.user_no;

    if (user.channel_name) {
        userhtml = "<tr id='" + extension + "_user_" + id + "' class='user'>";
        if (user.is_admin == 1) {
            userhtml += "<td ><span id='" + extension + "_privilege_" + id + "' class='options room_admin'></span></td>";
        } else {
            userhtml += "<td ><span id='" + extension + "_privilege_" + id + "' class='options room_user'></span></td>";
        }

        userhtml += "<td id='" + extension + "_no_" + id + "'>" + id + "</td>" + "<td id='" + extension + "_caller_id_" + id + "'>" + user.caller_id + "</td>" + "<td id='" + extension + "_caller_name_" + id + "'>" + user.caller_name + "</td>" + "<td id='" + extension + "_channel_name_" + id + "'>" + user.channel_name + "</td>";
        userhtml += "<td id='" + extension + "_activity_time_" + id + "'>" + (user.activity_time ? user.activity_time : "") + "</td>";
        userhtml += '<td align="left">' + '<button localeTitle="LANG792" title="' + $P.lang('LANG792') + '" extension="' + extension + '" id="' + user.channel_name + '" callerId="' + user.caller_id + '" callerName="' + user.caller_name + '" class="options room_userkick"></button>';

        if (user.is_muted == '1') {
            userhtml += " <button id='" + extension + "_mute_" + id + "' localeTitle='LANG791' title='" + $P.lang('LANG791') + "' onclick='unmutedrequest(\'" + extension + "\',\'" + id + "\')' class='options room_unmuted' ></button>"
        } else {
            userhtml += " <button id='" + extension + "_mute_" + id + "' localeTitle='LANG790' title='" + $P.lang('LANG790') + "' onclick='mutedrequest(\'" + extension + "\',\'" + id + "\')' class='options room_muted' ></button>"
        }

        userhtml += "</td></tr>";

        $("#userend" + extension).before(userhtml);
    }
}

function bindButtonEvent() {
    $('#btnSet').on('click', function() {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG5097"),
            displayPos: "setForm",
            frameSrc: "html/meetroomuser_modal.html?mode=set"
        });
    });

    $("#table_meetmelist")
        .delegate(".room", "click", function(ev) {
            var roomid = $(this).attr("id"),
                room_id = roomid.substring(4),
                userid = "User" + room_id;

            if ($(this).find("span[name='selecttag']").filter(".room_select").length == 1) {
                $(this).find("span[name='selecttag']").removeClass().addClass("options room_noselect");
                $("#" + userid).hide();
                return;
            } else {
                $(this).find("span[name='selecttag']").removeClass().addClass("options room_select");
                $("#" + userid).show();
            }

            ev.stopPropagation();
            return false;
        })
        .delegate(".create_user", "click", function(ev) {
            if (!$(this).attr("class").contains("disabled")) {
                if (conferenceMemberList.length < limitConferenceMembers) {
                    top.dialog.dialogInnerhtml({
                        dialogTitle: $P.lang("LANG1051"),
                        displayPos: "addUserForm",
                        frameSrc: "html/meetroomuser_modal.html?mode=addUser&item=" + $(this).attr("id").substring(7) // invite_
                    });
                } else {
                    /* Reach the limitation */
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG2922").format(limitConferenceMembers, $P.lang("LANG87"))
                    });
                }
            }
            ev.stopPropagation();
            return false;
        })
        .delegate(".create_mcb", "click", function(ev) {
            if (!$(this).attr("class").contains("disabled")) {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG1051"),
                    displayPos: "addMcbForm",
                    frameSrc: "html/meetroomuser_modal.html?mode=addMcb&item=" + $(this).attr("id").substring(4) // mcb_
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate(".room_lock", "click", function(ev) {
            var id = $(this).attr("id").substring(5); // lock_

            if (!$(this).attr("class").contains("disabled")) {
                unlock(id);
            }

            ev.stopPropagation();
            return false;
        })
        .delegate(".room_unlock", "click", function(ev) {
            var id = $(this).attr("id").substring(5); // lock_

            if (!$(this).attr("class").contains("disabled")) {
                lock(id);
            }

            ev.stopPropagation();
            return false;
        })
        .delegate(".medit", "click", function(ev) {
            var id = $(this).attr("id").substring(5); // edit_

            if (!$(this).attr("class").contains("disabled")) {
                showEditForm(id);
            }

            ev.stopPropagation();
            return false;
        })
        .delegate(".mdel", "click", function(ev) {
            var id = $(this).attr("id").substring(4); // del_

            if (!$(this).attr("class").contains("disabled")) {
                delete_meetMe_confirm(id);
            }

            ev.stopPropagation();
            return false;
        })
        .delegate(".room_userkick", "click", function(ev) {
            var extension = $(this).attr("extension"),
                id = $(this).attr("id"),
                callerId = $(this).attr("callerId"),
                callerName = $(this).attr("callerName");

            del_user(extension, id, callerId, callerName);

            ev.stopPropagation();
            return false;
        });

    $("#recordFiles")
        .delegate(".del", "click", function(ev) {
            var fileName = $(this).attr("file_name");

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG938"),
                buttons: {
                    ok: function() {
                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            data: {
                                "action": "checkFile",
                                "type": "conference_recording",
                                "data": fileName
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                top.dialog.clearDialog();

                                // top.dialog.dialogMessage({
                                //     type: 'error',
                                //     content: errorThrown
                                // });
                            },
                            success: function(data) {
                                if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                                    $.ajax({
                                        type: "post",
                                        url: "../cgi",
                                        data: {
                                            "action": "removeFile",
                                            "type": "conference_recording",
                                            "data": fileName
                                        },
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
                                                // top.dialog.clearDialog();
                                                top.dialog.dialogMessage({
                                                    type: 'success',
                                                    content: $P.lang("LANG871"),
                                                    callback: function() {
                                                        var table = $("#recordFiles"),
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
                                                });
                                            }
                                        }
                                    });
                                } else {
                                    top.dialog.dialogMessage({
                                        type: 'error',
                                        content: $P.lang("LANG3868")
                                    });
                                }
                            }
                        });
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate(".download", "click", function(ev) {
            var fileName = $(this).attr("file_name");

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "checkFile",
                    "type": "conference_recording",
                    "data": fileName
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                        window.open("/cgi?action=downloadFile&type=conference_recording&data=" + fileName, '_self');
                    } else {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG3868")
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var del = '<button file_name="' + rowObject.n +
        '" title="Delete" localetitle="LANG739" class="options del"></button>',
        download = '<button file_name="' + rowObject.n +
        '" title="Download" localetitle="LANG759" class="options download"></button>';

    return del + download;
}

function del_user(roomid, userid, callerid, callername) {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang('LANG921') + " " + callername + "( " + callerid + " ) ?",
        buttons: {
            ok: function() {
                $.ajax({
                    type: "GET",
                    cache: false,
                    url: "../cgi?action=kickuser&conf-room=" + roomid + "&conf-user=" + userid,
                    success: function(data, textStatus, jqXHR) {
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG819")
                        });
                    }
                });
            }
        }
    });
}

function eachroomtd(data) {
    if (!data) {
        return false;
    }

    if (data.sort) {
        data = data.sort(UCMGUI.bySort("extension", "down"));
    }

    for (var x in data) {
        var id = data[x].extension;
        if (id && !document.getElementById("room" + id)) {
            var roomhtml = "<tr id='room" + id + "' class='room'>" +
                "<td><span id='room" + id + "_select' name='selecttag' class='options room_select'></span></td>" +
                "<td id='room" + id + "_id'>" + id + "</td>" +
                "<td id='room" + id + "_attend_count'>" + data[x].attend_count + "</td>" +
                "<td id='room" + id + "_admin_count'>" + data[x].admin_count + "</td>";

            if (data[x].attend_count == 0) {
                roomhtml += "<td id='room" + id + "_start_time'>" + '' + "</td>" +
                    "<td id='room" + id + "_activity'>" + (data[x].activity ? data[x].activity : "") + "</td>" +
                    "<td class='option' align='left'>";
            } else {
                roomhtml += "<td id='room" + id + "_start_time'>" + data[x].start_time + "</td>" +
                    "<td id='room" + id + "_activity'>" + (data[x].activity ? data[x].activity : "") + "</td>" +
                    "<td class='option' align='left'>";
            }


            if (data[x].is_locked == '1') {
                roomhtml += "<button localeTitle='LANG2695' class='options room_addMcb create_mcb disabled' id ='mcb_" + id + "'></button>" +
                    "<button localeTitle='LANG786' class='options room_addUser create_user disabled' id ='invite_" + id + "'></button>" +
                    "<button localeTitle='LANG788' class='options room_lock' id='lock_" + id + "' ></button>";
            } else {
                roomhtml += "<button localeTitle='LANG2695' class='options room_addMcb create_mcb' id ='mcb_" + id + "'></button>" +
                    "<button localeTitle='LANG786' class='options room_addUser create_user' id ='invite_" + id + "'></button>" +
                    "<button localeTitle='LANG787' class='options room_unlock ' id='lock_" + id + "'></button>";
            }

            roomhtml += "<button localeTitle='LANG738' class='options medit' id='edit_" + id + "'></button>" +
                "<button localeTitle='LANG739' class='options mdel' id='del_" + id + "'></button></td></tr>";

            $("#roomcontain").append(roomhtml);

            userhtml = "<tr class='tr_table_user' id='User" + id + "'><td colspan='8' width='100%'>" +
                "<table id='table_userlist' style='width: 100%' cellpadding='0' cellspacing='0' border='0' align='center'>" +
                "<tbody id='usercontain" + id + "'>" +
                "<tr class='frow threaduser'>" +
                "<td></td><td width='11%' locale='LANG82'></td>" +
                "<td width='15%' locale='LANG78'></td><td width='15%' locale='LANG79'></td>" +
                "<td width='25%' locale='LANG80'></td><td width='15%' locale='LANG1050'></td>" +
                "<td width='15%' locale='LANG74'></td>" +
                "</tr></tbody><tr id='userend" + id + "' style='display: none'></tr>" + "</table></td></tr>";

            $("#room" + id).after(userhtml);

            lastAttentCount[data[x].extension] = {
                last_attend_count: 0
            };

            $P.lang(document, true);
        }
    }
}

function delete_meetMe_confirm(room) {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG818").format(room),
        buttons: {
            ok: function() {
                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        "action": "deleteConference",
                        "conference": room
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
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG816"),
                                callback: function() {
                                    mWindow.location.reload();
                                }
                            });
                        }
                    }
                });
            }
        }
    });
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

function getListAndRange() {
    conferenceRange = UCMGUI.isExist.getRange('conference');
    conferenceList = UCMGUI.isExist.getList("getConferenceList");
    existNumberList = UCMGUI.isExist.getList("getNumberList");
    mohNameList = UCMGUI.isExist.getList("getMohNameList");
}

function getPortExtension() {
    portExtensionList = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getFeatureCodes"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var featureSettings = data.response.feature_settings,
                    parkext = featureSettings.parkext,
                    parkpos = featureSettings.parkpos.split('-');

                portExtensionList.push(parseInt(parkext, 10));

                for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                    portExtensionList.push(i);
                }
            }
        }
    });
}

function list_recordings() {
    $("#recordFiles").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: $('#table_meetmelist').width(),
        height: "auto",
        postData: {
            "action": "listFile",
            "type": "conference_recording",
            "filter": '{"list_dir":0, "list_file":1, "file_suffix": ["mp3", "wav"]}'
        },
        colNames: [
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG1045">' + $P.lang('LANG1045') + '</span>',
            '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
            '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'n',
            index: 'n',
            width: 250,
            resizable: false,
            align: "center"
        }, {
            name: 'room',
            index: 'room',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'd',
            index: 'd',
            width: 150,
            resizable: false,
            align: "center"
        }, {
            name: 's',
            index: 's',
            width: 100,
            resizable: false,
            align: "center",
            formatter: tranSize
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            sortable: false,
            formatter: createOptions
        }],
        loadui: 'disable',
        pager: "#recordFiles-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'd',
        sortorder: 'desc',
        noData: "LANG2240",
        jsonReader: {
            root: "response.conference_recording",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#recordFiles .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function mutedrequest(roomid, userid) {
    $.ajax({
        type: "GET",
        cache: false,
        url: "../cgi?action=muteuser&conf-room=" + roomid + "&conf-user=" + userid,
        complete: function() {
            //location.reload();
        }
    });
}

function unmutedrequest(roomid, userid) {
    $.ajax({
        type: "GET",
        cache: false,
        url: "../cgi?action=unmuteuser&conf-room=" + roomid + "&conf-user=" + userid,
        complete: function() {
            //location.reload();
        }
    });
}

function lock(roomid) {
    $.ajax({
        type: "GET",
        cache: false,
        url: "../cgi?action=lockroom&conf-room=" + roomid,
        complete: function() {
            //location.reload();
        }
    });
}

function unlock(roomid) {
    $.ajax({
        type: "GET",
        cache: false,
        url: "../cgi?action=unlockroom&conf-room=" + roomid,
        complete: function() {
            //location.reload();
        }
    });
}

function renderRoomList() {
    var length = conferenceList.length,
        sessionroom = {},
        i = 0;

    for (i; i < length; i++) {
        sessionroom[conferenceList[i]] = {};
    }

    $.ajax({
        type: "GET",
        url: "../cgi?action=listConfStatus",
        async: false,
        success: function(data, textStatus, jqXHR) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                room_user_list = {}; // Clean up
                room_list = data.response.conference;

                var roomdata = data.response.conference,
                    roomlength = roomdata.length;

                for (var id in sessionroom) {
                    var flag = false;

                    if (!sessionroom.hasOwnProperty(id)) {
                        continue;
                    }

                    for (var x in roomdata) {
                        if (roomdata[x].extension == id) {
                            flag = true;
                            break;
                        }
                    }

                    if (!flag) {
                        addRoomObject(roomdata, roomlength, id);
                        roomlength++;
                    }
                }

                eachroomtd(roomdata);
                // $("#roomcontain tr:eq(1)").trigger("click");

                if (room_list.length) {
                    $("#table_meetmelist").show();
                    $("#noconference").hide();
                } else {
                    $("#noconference").show();
                    $("#table_meetmelist").hide();
                }
            }
        }
    });
}

function remove_eachroom(info) {
    // $("#room" + info.extension + "_select").attr("class", "options room_noselect");
    $("#room" + info.extension + "_id").text(info.extension);
    $("#room" + info.extension + "_attend_count").text("0");
    $("#room" + info.extension + "_admin_count").text("0");
    $("#room" + info.extension + "_start_time").text("");
    $("#room" + info.extension + "_activity").text("");

    $("#invite_" + info.extension).removeClass("disabled");
    $("#mcb_" + info.extension).removeClass("disabled");
    $("#lock_" + info.extension).attr("class", "options room_unlock");
    $("#lock_" + info.extension).attr("localeTitle", "LANG789");
    $("#lock_" + info.extension).attr("title", $P.lang("LANG789"));
    $("#lock_" + info.extension).addClass("disabled");
    // $("#User" + info.extension).hide();
    $("#edit_" + info.extension).removeClass("disabled");
    $("#del_" + info.extension).removeClass("disabled");
}

function reflesh_room_list() {
    $.ajax({
        type: "POST",
        url: "../cgi",
        data: {
            "action": "listConfStatus",
            "auto-refresh": Math.random()
        },
        async: false,
        success: function(data, textStatus, jqXHR) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var roomdata = data.response.conference;

                var new_room = room_array_minus(roomdata, room_list),
                    rm_room = room_array_minus(room_list, roomdata),
                    length = roomdata.length,
                    org_len = room_list.length;

                var len = rm_room.length;

                for (var i = 0; i < len; i++) {
                    remove_eachroom(rm_room[i]);
                }

                var len = new_room.length;

                for (var i = 0; i < len; i++) {
                    add_eachroom(new_room[i]);
                }

                for (var i = 0; i < length; i++) {
                    update_eachroom(roomdata[i]);
                }

                if (length) {
                    $("#table_meetmelist").show();
                    $("#noconference").hide();
                } else {
                    $("#noconference").show();
                    $("#table_meetmelist").hide();
                }

                room_list = data.response.conference;
            }
        }
    });
}

function check_room_count() {
    var count = 0;
    $.ajax({
        type: "POST",
        url: "../cgi",
        data: {
            "action": "listConfStatus",
            "auto-refresh": Math.random()
        },
        async: false,
        success: function(data, textStatus, jqXHR) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var roomdata = data.response.conference;
                var length = roomdata.length;
                for (var i = 0; i < length; i++) {
                    count += roomdata[i].attend_count;
                }
            }
        }
    });

    return count;
}

function initCeiStatus() {
    $.ajax({
        type: "POST",
        url: "../cgi",
        data: {
            "action": "getInitCeiStatus"
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);
            var en_cei_notify = $('#en_cei_notify')[0];
            if (bool) {
                var init_cei_status = data.response.initCeiStatus;
                if (init_cei_status === '0') {
                    en_cei_notify.checked = false;
                } else if (init_cei_status === '1') {
                    en_cei_notify.checked = true;
                }
            }
        }
    });
}

function reflesh_user_list(room) {
    $.ajax({
        type: "POST",
        url: "../cgi",
        data: {
            "action": "getConfMemberStatus",
            "extension": room.extension,
            "auto-refresh": Math.random()
        },
        async: false,
        success: function(data, textStatus, jqXHR) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var user_list = data.response.extension,
                    org_list = [];

                user_list = (user_list == undefined ? [] : user_list);

                if (user_list.length != 0) {
                    conferenceMemberList = conferenceMemberList.concat(user_list);
                }

                if (room_user_list[room.extension] != undefined) {
                    org_list = room_user_list[room.extension];
                }

                if (user_list.length == 0) {
                    $("#lock_" + room.extension).attr("title", $P.lang('LANG789'));
                    $("#lock_" + room.extension).addClass("disabled");
                } else {
                    $("#lock_" + room.extension).removeClass("disabled");
                }

                add_list = user_array_minus(user_list, org_list);

                rm_list = user_array_minus(org_list, user_list);

                for (var x = 0; x < add_list.length; x++) {
                    add_user(add_list[x], room.extension);
                }

                for (var x = 0; x < user_list.length; x++) {
                    update_user(user_list[x], room.extension);
                }

                for (var x = 0; x < rm_list.length; x++) {
                    remove_user(rm_list[x], room.extension);
                }

                room_user_list[room.extension] = user_list;
            }
        }
    });
}

function doReflesh() {
    reflesh_room_list();

    if (room_list && room_list.length > 0) {
        conferenceMemberList.length = 0;

        for (var i = 0; i < room_list.length; i++) {
            reflesh_user_list(room_list[i]);
        }
    }
}

function reflesh_status() {
    var reflesh = $("#en_auto_reflesh");

    if (reflesh.is(':checked')) {
        doReflesh();
    }

    setTimeout(reflesh_status, 5000);
}

function remove_user(user, extension) {
    $("#" + extension + "_user_" + user.user_no).remove();
}

function room_array_minus(arr1, arr2) {
    var arr3 = [];

    if (arr1) {
        for (var i = 0; i < arr1.length; i++) {
            var flag = true;

            if (arr2) {
                for (var j = 0; j < arr2.length; j++) {
                    if (arr2[j].extension == arr1[i].extension) {
                        flag = false;
                    }
                }
            }

            if (flag) {
                arr3.push(arr1[i]);
            }
        }
    }

    return arr3;
}

function sendDeleteRequest() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG877")
    });

    var action = {
        "action": "removeFile",
        "type": "conference_recording",
        "data": '*'
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
                setTimeout(function() {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG871"),
                        callback: function() {
                            window.location.reload();
                        }
                    });
                }, 200);
            }
        }
    });
}

function sendDownloadRequest() {
    var records = $("#recordFiles").getGridParam("records"),
        packingText = $P.lang("LANG5391"),
        actionType = 'meetme_pack';

    if (!records) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG2240")
        });
    } else {
        top.dialog.dialogMessage({
            type: 'loading',
            title: packingText,
            content: packingText
        });

        $.ajax({
            type: "post",
            url: "../cgi",
            data: {
                'action': 'packFile',
                'type': actionType,
                'data': 'allMeetmeFiles.tgz'
            },
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
                    top.window.open("/cgi?action=downloadFile&type=" + actionType + "&data=allMeetmeFiles.tgz", '_self');

                    top.dialog.clearDialog();
                }
            }
        });
    }
}

function showCreateForm() {
    var maxlength = (conferenceRange[1] && conferenceRange[0]) ? (conferenceRange[1] - conferenceRange[0] + 1) : 1;

    if ((conferenceList.length < limitConference) && (conferenceList.length < maxlength)) {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG731"),
            displayPos: "editForm",
            frameSrc: "html/meetroomuser_modal.html?mode=add"
        });
    } else if (conferenceList.length >= maxlength) {
        /* Reach the limitation */
        top.dialog.dialogConfirm({
            confirmStr: top.$.lang("LANG2732").format(conferenceRange[0], conferenceRange[1]),
            buttons: {
                ok: function() {
                    top.frames['frameContainer'].module.jumpMenu('preferences.html');
                }
            }
        });
    } else {
        /* Reach the limitation */
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG808").format(limitConference, $P.lang("LANG98"))
        });
    }
}

function showDeleteForm() {
    var records = $("#recordFiles").getGridParam("records");

    if (!records) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG2240")
        });
    } else {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG840"),
            buttons: {
                ok: sendDeleteRequest
            }
        });
    }
}

function showEditForm(item) {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG596").format(item),
        displayPos: "editForm",
        frameSrc: "html/meetroomuser_modal.html?mode=edit&item={0}".format(item)
    });
}

function batchDelete() {
    var recordFilesTable = $("#recordFiles"),
        records = recordFilesTable.getGridParam("records"),
        selected = recordFilesTable.jqGrid("getGridParam", "selarrrow"),
        selectedRowsLength = selected.length,
        recordFilesList = [],
        confirmList = [],
        i = 0,
        rowdata,
        rowName;

    if (!records) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG2240")
        });

        return false;
    }

    if (selectedRowsLength < 1) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG823").format($P.lang("LANG2640").toLowerCase())
        });

        return false;
    }

    for (i; i < selectedRowsLength; i++) {
        rowdata = recordFilesTable.jqGrid('getRowData', selected[i]);

        rowName = rowdata['n'].split('</span>');

        recordFilesList.push(rowName.length > 1 ? rowName[1] : rowName[0]);
    }


    for (i = 0; i < selectedRowsLength; i++) {
        confirmList.push("<font>" + recordFilesList[i] + "</font><br/>");
    }

    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG2710").format($P.lang("LANG2640").toLowerCase(), confirmList.join('  ')),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG825").format($P.lang("LANG2640").toLowerCase())
                });

                var doSelected = function() { // DELETE_SELECTED_RECORDING();
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: {
                            "action": "removeFile",
                            "type": "conference_recording",
                            "data": recordFilesList.join(",,")
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
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG871"),
                                    callback: function() {
                                        jumpPageOrNot(selectedRowsLength);
                                    }
                                });
                            }
                        }
                    });
                };

                setTimeout(doSelected, 100);
            },
            cancel: function() {
                top.dialog.clearDialog();
            }
        }
    });
}

function batchDownloadRequest() {
    var recordFilesTable = $("#recordFiles"),
        records = recordFilesTable.getGridParam("records"),
        selected = recordFilesTable.jqGrid("getGridParam", "selarrrow"),
        selectedRowsLength = selected.length,
        packingText = $P.lang("LANG5391"),
        actionType = 'meetme_pack',
        filesListToString = '',
        recordFilesList = [],
        recordList = [],
        rowdata,
        rowName,
        i = 0;

    if (!records) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG2240")
        });
        return;
    }

    if (selectedRowsLength < 1) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG4762").format($P.lang("LANG3652").toLowerCase())
        });
        return;
    }

    for (i; i < selectedRowsLength; i++) {
        rowdata = recordFilesTable.jqGrid('getRowData', selected[i]);

        rowName = rowdata['n'].split('</span>');

        recordFilesList.push(rowName.length > 1 ? rowName[1] : rowName[0]);
    }

    filesListToString = recordFilesList.join(",");

    top.dialog.dialogMessage({
        type: 'loading',
        title: packingText,
        content: packingText
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'packFile',
            'type': actionType,
            'data': filesListToString
        },
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
                top.window.open("/cgi?action=downloadFile&type=" + actionType + "&data=batchMeetmeRecordFiles.tgz", '_self');

                top.dialog.clearDialog();
            }
        }
    });
}


function jumpPageOrNot(selectedRows) {
    var table = $("#recordFiles"),
        totalPage = table.getGridParam("lastpage"),
        page = table.getGridParam("page"),
        reccount = table.getGridParam("reccount");

    if (page === totalPage && totalPage > 1 && reccount === selectedRows) {
        table.setGridParam({
            page: totalPage - 1
        }).trigger('reloadGrid');
    } else {
        table.trigger('reloadGrid');
    }
}

function tranSize(cellvalue, options, rowObject) {
    var size = parseFloat(cellvalue),
        rank = 0,
        rankchar = 'Bytes';

    while (size > 1024) {
        size = size / 1024;
        rank++;
    }

    if (rank == 1) {
        rankchar = "KB";
    } else if (rank == 2) {
        rankchar = "MB";
    } else if (rank == 3) {
        rankchar = "GB";
    }

    return Math.round(size * Math.pow(10, 2)) / Math.pow(10, 2) + " " + rankchar;
}

function update_eachroom(info) {

    $("#room" + info.extension + "_id").text(info.extension);
    $("#room" + info.extension + "_attend_count").text(info.attend_count);
    $("#room" + info.extension + "_admin_count").text(info.admin_count);

    if (info.attend_count == 0) {
        $("#room" + info.extension + "_start_time").text('');
        $("#room" + info.extension + "_activity").text('');
    } else {
        $("#room" + info.extension + "_start_time").text(info.start_time);
        $("#room" + info.extension + "_activity").text(getActivityTime(info.start_time));
    }

    if (parseInt(info.attend_count) > 0) {
        $("#edit_" + info.extension).addClass("disabled");
        $("#del_" + info.extension).addClass("disabled");
        $("#lock_" + info.extension).removeClass("disabled");
    } else {
        $("#edit_" + info.extension).removeClass("disabled");
        $("#del_" + info.extension).removeClass("disabled");
        $("#lock_" + info.extension).addClass("disabled");
    }

    if (info.is_locked == '1') {
        $("#invite_" + info.extension).addClass("disabled");
        $("#mcb_" + info.extension).addClass("disabled");
        $("#lock_" + info.extension).attr({
            "class": "options room_lock",
            "title": $P.lang("LANG788")
        });
        $("#lock_" + info.extension).attr("localeTitle", "LANG788");
    } else {
        $("#invite_" + info.extension).removeClass("disabled");
        $("#mcb_" + info.extension).removeClass("disabled");
        $("#lock_" + info.extension).attr("localeTitle", "LANG787");
        $("#lock_" + info.extension).attr({
            "class": "options room_unlock",
            "title": $P.lang("LANG787")
        });
    }

    if (lastAttentCount[info.extension] && lastAttentCount[info.extension].last_attend_count > 0 && info.attend_count == 0) {

        // When a conference end, reflesh the recording list
        $("#recordFiles").trigger('reloadGrid');
        lastAttentCount[info.extension].last_attend_count = 0;
    } else {
        lastAttentCount[info.extension].last_attend_count = info.attend_count;
    }
}

function update_user(user, extension) {
    var id = user.user_no;
    var channel = user.channel_name;

    if (id) {
        if (user.is_admin == 1) {
            $("#" + extension + "_privilege_" + id).attr("class", "options room_admin");
        } else {
            $("#" + extension + "_privilege_" + id).attr("class", "options room_user");
        }

        $("#" + extension + "_no_" + id).text(user.user_no);
        $("#" + extension + "_caller_id_" + id).text(user.caller_id);
        $("#" + extension + "_caller_name_" + id).text(user.caller_name);
        $("#" + extension + "_channel_name_" + id).text(user.channel_name);

        if (user.is_muted == '1') {
            $("#" + extension + "_mute_" + id).attr({
                "title": $P.lang("LANG790"),
                "localeTitle": "LANG790",
                "onclick": "unmutedrequest(\'" + extension + "\',\'" + channel + "\')",
                "class": "options room_muted"
            });
        } else {
            $("#" + extension + "_mute_" + id).attr({
                "title": $P.lang("LANG791"),
                "localeTitle": "LANG791",
                "onclick": "mutedrequest(\'" + extension + "\',\'" + channel + "\')",
                "class": "options room_unmuted"
            });
        }

        if (user.is_talking === 1) {
            $("#" + extension + "_privilege_" + id).addClass('is_talking').attr({'title': $P.lang("LANG5109"), 'localeTitle': 'LANG5109'});
        } else {
            $("#" + extension + "_privilege_" + id).removeClass('is_talking').attr({'title': '', 'localeTitle': ''});
        }

        $("#" + extension + "_activity_time_" + id).text(getActivityTime(user.join_time));
    }
}

function user_array_minus(arr1, arr2) {
    var arr3 = [];

    if (arr1) {
        for (var i = 0; i < arr1.length; i++) {
            var flag = true;

            if (arr2) {
                for (var j = 0; j < arr2.length; j++) {
                    if (arr2[j].channel_name == arr1[i].channel_name) {
                        flag = false;
                    }
                }
            }

            if (flag) {
                arr3.push(arr1[i]);
            }
        }
    }

    return arr3;
}

function cei_notify(action) {
    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        async: false,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG3910")
                });
            }
        }
    });
}
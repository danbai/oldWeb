/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    enableModule = $P.cookie("enable_module"),
    role = $P.cookie('role'),
    aConference = [],
    ringgroupExtList = [],
    remoteExtList = [],
    bCandlerDisable = true,
    aMeetList = [],
    nGrid = 0,
    bFirstLoad = true;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3775"));

    createTable();

    bindButtonEvent();

    getData();

    showCreateTable();

    top.Custom.init(doc);
});

function showCreateTable() {
    var oGridTable = $('#top_table'),
        oBtn = $('#btn_show_table');

    oBtn.on('click', function() {
        if (nGrid === 0) {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG4337")
            });
        } else {
            if (oGridTable.is(':visible')) {
                oGridTable.hide();
            } else {
                oGridTable.show();
            }
        }
    });
}

function addZero(n) {
    if (n < 10) {
        n = "0" + n;
    }
    return n;
}

function showStatus(cellvalue, options, rowObject) {
    var sRecurr = rowObject.recurringevent,
        sStartTime = rowObject.starttime.slice(0, 16),
        sEndTime = rowObject.endtime.slice(0, 16),
        /*t = new Date(),
        sNow = t.getFullYear() + '-' + addZero(t.getMonth() + 1) + '-' + addZero(t.getDate()) + ' ' +
                addZero(t.getHours()) + ':' + addZero(t.getMinutes()) + ':' + addZero(t.getSeconds()),*/
        sNow = $(".sysTime", top.frames["frameContainer"].document).text().slice(0, 16),
        sStatus = '';

    if (sRecurr === 'COMMON') {
        if (sNow < sStartTime) {
            sStatus = '<span locale="LANG3809"></span>';
        } else if (sNow >= sStartTime && sNow <= sEndTime) {
            sStatus = '<span locale="LANG3810"></span>';
        } else {
            sStatus = '<span locale="LANG3811"></span>';
        }
    } else if (sRecurr === 'DAILY') {
        sStatus = '<span locale="LANG3813"></span>';
    } else {
        sStatus = '<span locale="LANG3814"></span>';
    }

    return sStatus;
}

function showRecurr(cellvalue, options, rowObject) {
    var bookid = rowObject.bookid,
        confno = rowObject.confno,
        starttime = rowObject.starttime,
        endtime = rowObject.endtime,
        recurr = rowObject.recurringevent;

    aMeetList.push({
        confno: confno,
        starttime: starttime,
        endtime: endtime,
        bookid: bookid,
        recurr: recurr
    });

    switch (cellvalue) {
        case 'COMMON':
            return '<span locale="LANG3806"></span>';
        case 'DAILY':
            return '<span locale="LANG3804"></span>';
        case 'Esunday':
            return '<span locale="LANG3585"></span>';
        case 'Fmonday':
            return '<span locale="LANG3579"></span>';
        case 'Gtuesday':
            return '<span locale="LANG3580"></span>';
        case 'Hwednesday':
            return '<span locale="LANG3581"></span>';
        case 'Ithursday':
            return '<span locale="LANG3582"></span>';
        case 'Jfriday':
            return '<span locale="LANG3583"></span>';
        case 'Ksaturday':
            return '<span locale="LANG3584"></span>';
    }
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button bookid="' + rowObject.bookid  + '" confname="' + rowObject.confname + '" confno="' + rowObject.confno +
                '" title="Edit" localetitle="LANG738" class="options edit"></button>',
        del = '<button bookid="' + rowObject.bookid + '" confname="' + rowObject.confname + '" confno="' + rowObject.confno +
                '" title="Delete" localetitle="LANG739" class="options del"></button>',
        options = edit + del;

    return options;
}

function createTable(argument) {
    $("#groups_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listMeetme"
        },
        colNames: [
            '<span locale="LANG3784">' + $P.lang('LANG3784') + '</span>',
            '<span locale="LANG3783">' + $P.lang('LANG3783') + '</span>',
            '<span locale="LANG1048">' + $P.lang('LANG1048') + '</span>',
            '<span locale="LANG1049">' + $P.lang('LANG1049') + '</span>',
            '<span locale="LANG3802">' + $P.lang('LANG3802') + '</span>',
            '<span locale="LANG3791">' + $P.lang('LANG3791') + '</span>',
            '<span locale="LANG3803">' + $P.lang('LANG3803') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'confno',
            index: 'confno',
            width: 125,
            resizable: false,
            align: "center"
        }, {
            name: 'confname',
            index: 'confname',
            width: 125,
            resizable: false,
            align: "center"
        }, {
            name: 'starttime',
            index: 'starttime',
            width: 125,
            resizable: false,
            align: "center"
        }, {
            name: 'endtime',
            index: 'endtime',
            width: 125,
            resizable: false,
            align: "center"
        }, {
            name: 'status',
            index: 'status',
            width: 125,
            resizable: false,
            align: "center",
            formatter: showStatus,
            sortable: false
        }, {
            name: 'open_calendar',
            index: 'open_calendar',
            width: 125,
            resizable: false,
            align: "center"
        }, {
            name: 'recurringevent',
            index: 'recurringevent',
            width: 150,
            resizable: false,
            align: "center",
            formatter: showRecurr
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#groups_list_pager",
        loadui: 'disable',
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: false,
        subGrid: true,
        subGridRowExpanded: function(subgrid_id, row_id) {
            var subgrid_table_id = subgrid_id + "_t",
                pager_id = "p_" + subgrid_table_id;

            var table = $("<table>").attr({
                id: "table_userlist",
                width: '100%',
                cellpadding: 0,
                cellspacing: 0,
                border: 0,
                align: "center"
            }).css("display", "none");

            var thead = $("<thead>").attr("id", "").appendTo(table);
            var theadTr = $("<tr>").addClass('frow threaduser').appendTo(thead);
            var theadTrTd = $("<td width='13px' ></td>" +
                "<td width='100px' locale='LANG186' align='center'>" + $P.lang('LANG186') + "</td>" +
                "<td width='100px' locale='LANG2026' align='center'>" + $P.lang('LANG2026') + "</td>" +
                "<td width='100px' locale='LANG3781' align='center'>" + $P.lang('LANG3781') + "</td> " +
                "<td width='100px' locale='LANG2032' align='center'>" + $P.lang('LANG2032') + "</td> " +
                "<td width='100px' locale='LANG3782' align='center'>" + $P.lang('LANG3782') + "</td> " +
                "<td width='100px' locale='LANG3792' align='center'>" + $P.lang('LANG3792') + "</td> ").appendTo(theadTr);
            var tbody = $("<tbody>").attr("id", "usercontain").appendTo(table);
            var action = {
                "action": "getMeetme",
                "bookid": $(".edit").eq(row_id - 1).attr("bookid")
            };

            $.ajax({
                type: "post",
                url: "../cgi",
                data: action,
                error: function(jqXHR, textStatus, errorThrown) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: errorThrown
                    });
                },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);

                    if (bool) {
                        var eventlist = data.response.bookid.members,
                            str = "",
                            ele;
                        for (var i = 0; i < eventlist.length; i++) {
                            ele = eventlist[i];
                            str += '<tr><td></td><td class="return_state">' + ele.state + '</td><td>' + ele.member_name +
                                    '</td><td>' + ele.member_extension + '</td><td>' + ele.email + '</td><td>' +
                                    ele.send_email + '</td><td>' + ele.comment + '</td></tr>';
                        }
                        tbody.html(str);
                    }
                }
            });

            $("#" + subgrid_id).append(table);

            table.show();
        },
        viewrecords: true,
        sortname: 'starttime',
        noData: "LANG129 LANG3775",
        jsonReader: {
            root: "response.bookid",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#groups_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function(subgrid_id) {
            $P.lang(doc, true);

            var oGbox = $('#top_table');

            nGrid = subgrid_id.response.bookid.length;

            if (nGrid === 0) {
                oGbox.hide();
            }
        }
    });
}

function checkMeetCurrent(bookid, confname, confno) {
    var oRes = {
        bEditDisable: false,
        bDelDisable: false
    };

    $.ajax({
        url: '../cgi?action=getScheduleConferenceStatus&confno=' + confno + '&bookid=' + bookid,
        type: 'GET',
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var sRes = data.response.result;

                if (sRes === 'call') {
                    top.dialog.dialogMessage({
                        type: 'warning',
                        content: $P.lang("LANG4374")
                    });

                    oRes.bEditDisable = true;
                    oRes.bDelDisable = true;
                } else if (sRes === 'kick') {
                    top.dialog.dialogMessage({
                        type: 'warning',
                        content: $P.lang("LANG4378")
                    });

                    oRes.bEditDisable = true;
                }
            }
        }
    });

    return oRes;
}

function delSuccess(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        top.dialog.dialogMessage({
            type: 'success',
            content: $P.lang("LANG3788")
        });

        aMeetList.length = 0;

        var table = $("#groups_list"),
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

        $("#xgcalendarp").BCalReload();
    }
}

function bindDel(bookid, confname, confno) {
    if (checkMeetCurrent(bookid, confname, confno).bDelDisable) {
        return false;
    }

    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG2710").format($P.lang("LANG3775"), confname),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG905")
                });

                $.ajax({
                    type: "GET",
                    url: "/cgi?action=sendMeetmeMail&delete=" + bookid,
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: errorThrown
                        });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            $.ajax({
                                url: "../cgi?action=deleteMeetme&bookid=" + bookid,
                                type: "GET",
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.dialogMessage({
                                        type: 'error',
                                        content: errorThrown
                                    });
                                },
                                success: function(data) {
                                    if (data && data.status === -67) {
                                        top.dialog.dialogConfirm({
                                            confirmStr: $P.lang("LANG4474"),
                                            buttons: {
                                                ok: function () {
                                                    top.dialog.dialogMessage({
                                                        type: 'loading',
                                                        content: $P.lang("LANG905")
                                                    });

                                                    $.ajax({
                                                        url: "../cgi?action=deleteMeetme&bookid=" + bookid + '&force=yes',
                                                        type: "GET",
                                                        error: function(jqXHR, textStatus, errorThrown) {
                                                            top.dialog.dialogMessage({
                                                                type: 'error',
                                                                content: errorThrown
                                                            });
                                                        },
                                                        success: function(data) {
                                                            delSuccess(data);
                                                        }
                                                    });
                                                },
                                                cancel: function () {
                                                    top.dialog.clearDialog();
                                                }
                                            }
                                        });
                                    } else {
                                        delSuccess(data);
                                    }
                                }
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
    return false;
}

function bindEdit(bookid, confname, confno) {
    if (checkMeetCurrent(bookid, confname, confno).bEditDisable) {
        return false;
    }

    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG222").format($P.lang("LANG3775"), confname),
        displayPos: "pre_meet_div",
        frameSrc: "html/premeet_modal.html?mode=edit&bookid=" + bookid
    });

    return false;
}

function bindAdd(ifCalender, sCalStart, nMeetLength) {
    if (aConference.length === 0) {
        if (role === 'privilege_0' || role === 'privilege_1' || (enableModule && enableModule.indexOf('conference') > -1)) {
            top.dialog.dialogConfirm({
                confirmStr: top.$.lang("LANG3780"),
                buttons: {
                    ok: function() {
                        top.frames['frameContainer'].module.jumpMenu('meetroomuser.html');
                    }
                }
            });
        } else {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG5039").format($P.lang("LANG18").toLowerCase())
            });
        }

        return;
    }

    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG3776"),
        displayPos: "pre_meet_div",
        frameSrc: 'html/premeet_modal.html?mode=add' + (ifCalender ? '&calendar=calendar&sCalStart=' + sCalStart +'&nMeetLength=' + nMeetLength : '')
    });
}

function bindButtonEvent() {
    $('#btnAdd').on('click', function(ev) {
        bindAdd();

        ev.stopPropagation();
        return false;
    });

    $('#refresh_google').on('click', function(ev) {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG905")
        });

        $.ajax({
            url: "../cgi?action=manualUpdateState&updatestate=yes",
            type: "GET",
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown
                });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    if (data.response.updatestate.match(/error|timeout/)) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG2981")
                        });
                    } else {
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG3795")
                        });

                        $("#groups_list").trigger('reloadGrid')
                    }
                }
            }
        });

        ev.stopPropagation();
        return false;
    });

    $('#btnClear').on('click', function(ev) {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG4277"),
            displayPos: "clear_settings",
            frameSrc: "html/premeet_modal.html?mode=cleaner"
        });

        ev.stopPropagation();
        return false;
    });

    $("#groups_list")
        .delegate('.edit', 'click', function(ev) {
            var bookid = $(this).attr('bookid'),
                confname = $(this).attr('confname'),
                confno = $(this).attr('confno');

            bindEdit(bookid, confname, confno);

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var bookid = $(this).attr('bookid'),
                confno = $(this).attr('confno'),
                confname = $(this).attr('confname');

            bindDel(bookid, confno + ' ' + confname, confno);

            ev.stopPropagation();
            return false;
        });
}

function getData() {
    $.ajax({
        url: "../cgi?action=listConfStatus",
        dataType: "json",
        type: "GET",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: "error",
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                aConference = data.response.conference;
            }
        }
    });

    $.ajax({
        url: "../cgi?action=getGoogleAccountCal",
        type: "GET",
        dataType: "json",
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var res = data.response,
                    calendarName = res.googlecalendar.calendar_name.slice(0, -1),
                    oCandler = $('#open_calendar');

                if (calendarName !== "anonymous@gmail.com" && calendarName !== "" && calendarName.match(/^([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+$/)) {
                    bCandlerDisable = false;
                } else {
                    $('#refresh_google, #lite_desc').hide();
                }
            }
        }
    });

    var accountList = UCMGUI.isExist.getList("getUserList"),
        remoteList = UCMGUI.isExist.getList("getRemoteUser");

        ringgroupExtList = transLocale(accountList);
        remoteExtList = transRemote(remoteList);
}

function transLocale(res) {
    var arr = [],
        ele, firstname, lastname, username, email, fullname;

    for (var i = 0; i < res.users.length; i++) {
        ele = res.users[i],
        firstname = ele.first_name;
        lastname = ele.last_name;
        username = ele.user_name;
        email = ele.email;

        if (firstname && lastname) {
            fullname = '"' + firstname + ' ' + lastname + '"';
        } else if (firstname) {
            fullname = '"' + firstname + '"';
        } else if (lastname) {
            fullname = '"' + lastname + '"';
        } else {
            fullname = '';
        }
        //fullname = (firstname ? firstname : '') + (lastname ? (' ' + lastname) : '');

        arr.push({
            text: username + ' ' + fullname,
            val: username,
            attr: email ? email : ''
        });
    }

    return arr;
}

function transRemote(res) {
    var arr = [],
        ele, firstname, lastname, accountnumber, email, phonebook, fullname;

    for (var i = 0; i < res.phonebooks.length; i++) {
        ele = res.phonebooks[i];
        firstname = ele.firstname;
        lastname = ele.lastname;
        accountnumber = ele.accountnumber;
        email = ele.email;
        phonebook = ele.phonebook_dn;

        if (firstname && lastname) {
            fullname = '"' + firstname + ' ' + lastname + '"';
        } else if (firstname) {
            fullname = '"' + firstname + '"';
        } else if (lastname) {
            fullname = '"' + lastname + '"';
        } else {
            fullname = '';
        }
        //fullname = (firstname ? firstname : '') + (lastname ? (' ' + lastname) : '');

        arr.push({
            text: phonebook.split(',')[0].slice(3) + '--' + accountnumber + ' ' + fullname,
            val: accountnumber,
            attr: email ? email : ''
        });
    }

    return arr;
}




































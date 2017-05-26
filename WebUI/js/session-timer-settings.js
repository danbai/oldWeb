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
    baseServerURl = config.paths.baseServerURl,
    loginWhiteAddrList = [],
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3965"));

    getLoginParam();
    updateLoginBanned();
    createTableWhiteList();
    bindButtonEvent();
    initValidator();

    $("#login_max_num").change(function () {
        var loginBandTime = $("#login_band_time");
        if (this.value == 0) {
            loginBandTime.attr("disabled", true);
        } else {
            loginBandTime.attr("disabled", false);
        }
    });
    getIPList();
});
function getIPList() {
    loginWhiteAddrList = [];
    $.ajax({
        type: "GET",
        url: "../cgi?action=listLoginWhiteAddr",
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var loginWhiteAddr = data.response.login_white_addr;

                for(var i = 0; i <= loginWhiteAddr.length - 1; i++) {
                    var ip = loginWhiteAddr[i]["ip"];
                    loginWhiteAddrList.push(ip);
                }
            }
        }
    });
}

function updateLoginBanned() {
    $.ajax({
        url: baseServerURl,
        type: "POST",
        async: false,
        dataType: "json",
        data: {
            "action": "updateLoginBanned"
        },
        success: function() {
            createTableBandList();
        },
        error: function () {
            createTableBandList();
        }
    });
}

function createTableBandList() {
    $("#session-timer-settings-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listLoginBanned"
        },
        colNames: [
            '<span locale="LANG155">' + $P.lang('LANG155') + '</span>',
            '<span locale="LANG2446">' + $P.lang('LANG2446') + '</span>',
            '<span locale="LANG4789">' + $P.lang('LANG4789') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'ip',
            index: 'ip',
            width: 120,
            resizable: false,
            align: "center"
        }, {
            name: 'user_name',
            index: 'user_name',
            width: 100,
            resizable: false,
            align: "center"
        },{
            name: 'login_time',
            index: 'login_time',
            width: 120,
            resizable: false,
            align: "center"
        },{
            name: 'options',
            index: 'options',
            width: 120,
            resizable: false,
            align: "center",
            formatter: createBandListOptions,
            sortable: false
        }],
        loadui: 'disable',
        pager: "#session-timer-settings-pager",
        rowNum: 30,
        rowList: [10, 20, 30],
        //multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'ip',
        noData: "LANG129 LANG4792",
        jsonReader: {
            root: "response.login_banned",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#session-timer-settings-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
            top.dialog.clearDialog();
        }
    });
}

function createTableWhiteList() {
    $("#login-white-list-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listLoginWhiteAddr"
        },
        colNames: [
            '<span locale="LANG155">' + $P.lang('LANG155') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'ip',
            index: 'ip',
            width: 120,
            resizable: false,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 120,
            resizable: false,
            align: "center",
            formatter: createWhiteListOptions,
            sortable: false
        }],
        loadui: 'disable',
        pager: "#login-white-list-pager",
        rowNum: 30,
        rowList: [10, 20, 30],
        //multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'ip',
        noData: "LANG129 LANG4787",
        jsonReader: {
            root: "response.login_white_addr",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#login-white-list-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
            top.dialog.clearDialog();
        }
    });
}

function createBandListOptions(cellvalue, options, rowObject) {
    var del = '<button userName="' + rowObject.user_name + '" ip="' + rowObject.ip + '" title="' + $P.lang('LANG739') + '" localetitle="LANG739" class="options del"></button>';
    return del;
}

function createWhiteListOptions(cellvalue, options, rowObject) {
    var del = '<button ip="' + rowObject.ip + '" title="' + $P.lang('LANG739') + '" localetitle="LANG739" class="options del"></button>';
    return del;
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#add', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG4790"),
                displayPos: "editForm",
                frameSrc: "html/session_timer_settings_modal.html"
            });

            ev.stopPropagation();
            return false;
        });
     $("#session-timer-settings-list")
        .delegate('.del', 'click', function(ev) {
            var userName = $(this).attr('userName');
            var ip = $(this).attr('ip');
            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "deleteLoginBanned",
                    "ip": ip,
                    "user_name": userName
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
                            content: $P.lang("LANG4788").format(userName, $P.lang("LANG2471")),
                            callback: function() {
                                jumpPageOrNotBandList(1);
                                // update existNumberList/existExtentionList/existFXSList/extensionRange
                                updateLists();
                            }
                        });
                    }
                }
            });
            ev.stopPropagation();
            return false;
        });
    $("#login-white-list-list")
        .delegate('.del', 'click', function(ev) {
            var ip = $(this).attr('ip');
            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "deleteLoginWhiteAddr",
                    "ip": ip
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
                            content: $P.lang("LANG4788").format(ip, $P.lang("LANG2471")),
                            callback: function() {
                                jumpPageOrNotWhiteList(1);
                                getIPList();
                            }
                        });
                    }
                }
            });
            ev.stopPropagation();
            return false;
        });
}

function jumpPageOrNotBandList(selectedRows) {
    var table = $("#session-timer-settings-list"),
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

function jumpPageOrNotWhiteList(selectedRows) {
    var table = $("#login-white-list-list"),
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

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "cookie_timeout": {
                required: true,
                digits: true,
                range: [0, 60]
            },
            "login_max_num": {
                required: true,
                digits: true,
                range: [0, 100]
            },
            "login_band_time": {
                required: true,
                digits: true,
                range: [0, 10000]
            }
        },
        submitHandler: function() {
            var action = {};
            var loginBandTime = $("#login_band_time");
            action['cookie_timeout'] = ($("#cookie_timeout").val() * 60);
            action['login_max_num'] = $("#login_max_num").val();
            if (!loginBandTime.is(":disabled")) {
                action['login_band_time'] =  (loginBandTime.val() * 60);
            }
            action["action"] = "updateLoginParam";

            updateLoginParam(action);
        }
    });
}

function updateLoginParam(action) {
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
                // top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG844")
                });
            }
        }
    });
}

function getLoginParam() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getLoginParam"
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool && data.response) {
                var res = data.response;
                var timeout = res.cookie_timeout;
                var loginMaxNum = res.login_max_num;
                var loginBandTimeVal = res.login_band_time;
                var loginBandTime = $("#login_band_time");

                $("#cookie_timeout").val(timeout / 60);
                $("#login_max_num").val(loginMaxNum);

                if (loginMaxNum == 0) {
                   loginBandTime.attr("disabled", true); 
                }
                loginBandTime.val(loginBandTimeVal / 60);
            }

            top.Custom.init(doc);
        }
    });
}
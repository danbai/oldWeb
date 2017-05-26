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
    userList = [],
    privilegeInfo = {},
    updateDocumentException = UCMGUI.domFunction.updateDocumentException,
    privilege = {};

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format($P.lang("LANG82"), $P.lang("LANG2802"));

    initPage();
});

function initPage() {
    var role = $P.cookie('role');

    if (role === 'privilege_0' || role === 'privilege_1') {
        $('#user_detail').hide();

        getLists();

        createTable();

        bindButtonEvent();
    } else {
        $('#user_list_div').hide();

        initValidator();

        getUserInfo();

        jumpMenu();
    }

    if (role !== 'privilege_0') {
        $('.top_buttons').hide();
    }
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2807"),
                displayPos: "user_list_modal",
                frameSrc: "html/user_list_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#user-list")
        .delegate('.edit', 'click', function(ev) {

            var user_id = $(this).attr('user_id'),
                user_name = $(this).attr('user_name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2808").format(user_name),
                displayPos: "user_list_modal",
                frameSrc: "html/user_list_modal.html?mode=edit&user_id=" + user_id + "&user_name=" + user_name
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {

            var user_id = $(this).attr('user_id'),
                user_name = $(this).attr('user_name'),
                privilege = $(this).attr('privilege'),
                confirmStr = "LANG2710";

            if (privilege === "3") {
                confirmStr = "LANG4100";
            }

            if ($(this).hasClass('disabled')) {
                return false;
            } else {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang(confirmStr).format($P.lang("LANG82"), user_name),
                    buttons: {
                        ok: function() {
                            var action = {
                                "action": "deleteUser",
                                "user_name": user_name
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
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG816")
                                        });

                                        var table = $("#user-list"),
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

                                        // update userlist, privilege
                                        getLists();
                                    }
                                }
                            });
                        },
                        cancel: function() {
                            top.dialog.clearDialog();
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button privilege="' + rowObject.privilege + '" user_id="' + rowObject.user_id + '" user_name="' + rowObject.user_name + '" title="Edit" localetitle="LANG738" class="options edit"></button>';

    if (rowObject.user_id == $P.cookie('user_id')) {
        var del = '<button privilege="' + rowObject.privilege + '" user_id="' + rowObject.user_id + '" user_name="' + rowObject.user_name + '" title="Delete" localetitle="LANG739" class="options del disabled" style="cursor: default;"></button>';
    } else {
        var del = '<button privilege="' + rowObject.privilege + '" user_id="' + rowObject.user_id + '" user_name="' + rowObject.user_name + '" title="Delete" localetitle="LANG739" class="options del"></button>';
    }

    return (edit + del);
}

function createTable() {
    $("#user-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listUser"
        },
        colNames: [
            '<span locale="LANG2809">' + $P.lang('LANG2809') + '</span>',
            '<span locale="LANG2811">' + $P.lang('LANG2811') + '</span>',
            // '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG2819">' + $P.lang('LANG2819') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
                name: 'user_name',
                index: 'user_name',
                width: 100,
                resizable: false,
                align: "center"
            }, {
                name: 'privilege',
                index: 'privilege',
                width: 100,
                resizable: false,
                formatter: showPrivilege,
                align: "center"
            },
            // {
            //     name: 'name',
            //     index: 'name',
            //     width: 100,
            //     resizable: false,
            //     align: "center",
            //     formatter: nameSplice,
            //     sortable: false
            // },
            {
                name: 'login_time',
                index: 'login_time',
                width: 150,
                resizable: false,
                formatter: showLoginTime,
                align: "center"
            }, {
                name: 'options',
                index: 'options',
                width: 150,
                resizable: false,
                align: "center",
                formatter: createOptions,
                sortable: false
            }
        ],
        pager: "#user-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'privilege',
        noData: "LANG129 LANG82",
        jsonReader: {
            root: "response.user_id",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#user-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function getLists() {
    userList = UCMGUI.isExist.getList("getUserNameList");

    getPrivilege(); // get Privilege List
}

// get Privilege List
function getPrivilege() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getPrivilege"
        },
        async: false,
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
                if (data.response.privilege && data.response.privilege != {}) {
                    privilege = data.response.privilege;
                }
            }
        }
    });
}

function getPrivilegeName(id) {
    var name = '';

    for (var i = 0, length = privilege.length; i < length; i++) {
        if (id == privilege[i].privilege_id) {
            name = privilege[i].privilege_name;
            break;
        }
    }

    return name;
}

// get user information in edit mode
function getUserInfo() {
    var userName = $P.cookie("username"),
        action = {
            "action": "getUser",
            "user_name": userName
        };

    $("#user_name").val(userName);

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (data.response.user_name && data.response.user_name != {}) {
                    var userInfo = data.response.user_name,
                        sEmail = userInfo.email;

                    privilegeInfo = data.response.privilege_info;

                    renderUserInfoForm(userInfo);

                    if (sEmail) {
                        $('#jumpEmail').text(sEmail).removeAttr('locale');
                    }
                }
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    // form validate
    $P("#form", doc).validate({
        rules: {
            /*"user_password": {
                required: true,
                minlength: 4,
                maxlength: 32,
                keyboradNoSpacesemicolon: true
            },*/
            "first_name": {
                minlength: 1,
                cidName: true,
                maxlength: 32
            },
            "last_name": {
                minlength: 1,
                cidName: true,
                maxlength: 32
            },
            /*"email": {
                email: true
            },*/
            "family_number": {
                digits: true
            },
            "phone_number": {
                digits: true
            },
            "fax": {
                digits: true
            }
        },
        submitHandler: function() {
            var action = UCMGUI.formSerializeVal(document, "", "update");

            action["user_name"] = $P.cookie("username");
            action["user_id"] = $P.cookie("user_id");
            action["action"] = "updateUser";

            $.ajax({
                type: "post",
                url: "../cgi",
                data: action,
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);

                    if (bool) {
                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG815")
                        });
                    }
                }
            });
        }
    });
}

function jumpMenu() {
    $('.link').on('click', function() {
        top.dialog.clearDialog();
        top.frames['frameContainer'].module.jumpMenu($(this).attr('data-url') + ".html");
    });
}

function nameSplice(cellvalue, options, rowObject) {
    return rowObject.first_name + rowObject.last_name;
}

// set user value
function renderUserInfoForm(user) {
    for (var item in user) {
        if (item == "enable_multiple_extension") {
            // if (user[item] == "no") {
            //     $("#" + item)[0].checked = false;
            //     // $('#vmsecret')[0].disabled = false;
            // }
        } else {
            $("#" + item).val(user[item]);
        }
    }

    if (!$.isEmptyObject(privilegeInfo)) {
        updateDocumentException(user, document, privilegeInfo);
    }

    top.Custom.init(doc);
}

function showLoginTime(cellvalue, options, rowObject) {
    var logintime;

    if (!cellvalue || cellvalue === "1970-01-01 00:00:00") {
        logintime = '<span locale="LANG565 ' + "'--'" + '">' + $P.lang('LANG565').format('--') + '</span>';
    } else {
        logintime = cellvalue;
    }

    return logintime;
}

function showPrivilege(cellvalue, options, rowObject) {
    var privilegeName;

    if (cellvalue == 0) {
        privilegeName = '<span locale="LANG3860">' + $P.lang('LANG3860') + '</span>';
    } else if (cellvalue == 1) {
        privilegeName = '<span locale="LANG1047">' + $P.lang('LANG1047') + '</span>';
    } else if (cellvalue == 2) {
        privilegeName = '<span locale="LANG5173">' + $P.lang('LANG5173') + '</span>';
    } else if (cellvalue == 3) {
        privilegeName = '<span locale="LANG2863">' + $P.lang('LANG2863') + '</span>';
    } else {
        var priName = getPrivilegeName(cellvalue);

        privilegeName = priName ?
            ('<span locale="LANG5167">' + $P.lang('LANG5167') + '</span>:&nbsp;' + priName) :
            ('<span locale="LANG2864">' + $P.lang('LANG2864') + '</span>');
    }

    return privilegeName;
}
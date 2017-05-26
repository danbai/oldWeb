/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    mode = gup.call(window, "mode"),
    user_id = gup.call(window, "user_id"),
    oldUserName = gup.call(window, "user_name"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    extensionPrefSettings = UCMGUI.isExist.getRange(), // [disable_extension_ranges, rand_password, weak_password]
    userList = mWindow.userList,
    privilege = mWindow.privilege,
    username = $P.cookie("username"),
    role = $P.cookie('role');
    priOption = '',
    ifExisted = UCMGUI.inArray,
    updateDocument = UCMGUI.domFunction.updateDocument,
    getPrivilegeAction = UCMGUI.getPrivilegeAction,
    privilegeInfo = {};

$(function() {
    $P.lang(doc, true);

    initForm();

    var userPwdEmail = $("#user_password, #email"),
        jumpPwdEmail = $("#jumpPwd, #jumpEmail");

    if (mode == 'edit') {
        $('#user_name').val(oldUserName).attr('disabled', true);

        if (oldUserName === username) {
            userPwdEmail.remove();

            jumpMenu();
        } else {
            jumpPwdEmail.remove();
        }

        getUserInfo(oldUserName);
    } else {
        jumpPwdEmail.remove();

        top.Custom.init(doc);
    }

    initValidator();

    isEnableWeakPw();
});

function isEnableWeakPw() {
    var obj = {
        pwsId: "#user_password",
        doc: document
    };

    $P("#user_password", document).rules("add", {
        checkAlphanumericPw: [UCMGUI.enableWeakPw.showCheckPassword, obj]
    });
};

function checkIfContainLetters(val, ele) {
    var containLetters;

    if (isNaN(val)) {
        containLetters = true;
    } else {
        containLetters = false;
    }

    return containLetters;
}

function checkUserName(val, ele) {
    if (mode == 'edit') {
        if (val == oldUserName) {
            return true;
        } else {
            if (ifExisted(val, userList)) {
                return false;
            } else {
                return true;
            }
        }
    } else {
        if (ifExisted(val, userList)) {
            return false;
        } else {
            return true;
        }
    }
}

// get user information in edit mode
function getUserInfo(name) {
    var action = {
        "action": "getUser",
        "user_name": name
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (data.response.user_name && data.response.user_name != {}) {
                    var userInfo = data.response.user_name,
                        sEmail = userInfo.email;

                    privilegeInfo = data.response.privilege_info;

                    renderUserInfoForm(userInfo);

                    if (oldUserName === username && sEmail) {
                        $('#jumpEmail').text(sEmail);
                    }
                }
            }
        }
    });
}

function initForm() {
    // set Privilege List
    $.each(privilege, function(key, value) {
        var privilegeID = value.privilege_id,
            privilegeName = value.privilege_name,
            mode = gup.call(window, "mode");

        // Not Monitor
        if (privilegeID !== 2) {
            if (privilegeID === 0) {
                privilegeName = $P.lang("LANG3860");
            }

            if (privilegeID === 1) {
                privilegeName = $P.lang("LANG1047");
            }

            if (privilegeID === 3) {
                privilegeName = $P.lang("LANG2863");
            }

            if (privilegeID > 3) {
                privilegeName = $P.lang('LANG5167') + '</span>:&nbsp;' + privilegeName;
            }

            priOption += "<option value='" + privilegeID + "'>" + privilegeName + "</option>";
        }
    });

    // if (user_id == 0 && mode === 'edit') {
    //     $('#user_password').parents('.field-cell').remove();
    // }

    $("#privilege").append(priOption);

    if (mode == "add") {
        $("#privilege").children().filter("option[value=0], option[value=3]").remove();
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    // form validate
    $P("#form", doc).validate({
        rules: {
            "user_name": {
                required: true,
                maxlength: 32,
                minlength: 4,
                userName: true,
                customCallback: [$P.lang("LANG2843"), checkUserName],
                customCallback1: [$P.lang("LANG3864"), checkIfContainLetters]
            },
            "user_password": {
                required: true,
                keyboradNoSpacesemicolon: true,
                minlength: 4,
                maxlength: 32
            },
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
            "email": {
                email: true
            },
            "family_number": {
                digitsWithHyphen: true
            },
            "phone_number": {
                digitsWithHyphen: true
            },
            "fax": {
                digitsWithHyphen: true
            }
            /*"family_number": {
                homeNumber: true
            },
            "phone_number": {
                phoneNumber: true
            },
            "cidnumber": {
                digits: true,
                minlength: 2
            },
            "secret": {
                required: true,
                keyboradNoSpacesemicolon: true,
                minlength: 4
            },
            "vmsecret": {
                digits: true,
                minlength: 4
            },
            "cfuext": {
                numeric_pound_star: true
            },
            "cfnext": {
                numeric_pound_star: true
            },
            "cfbext": {
                numeric_pound_star: true
            },
            "fax": {
                homeNumber: true
            }*/
        },
        submitHandler: function() {
            var action = UCMGUI.formSerializeVal(document);

            if (mode == 'edit') {
                action["user_id"] = user_id;
                /*if (oldUserName == username) {
                    delete action["email"];
                }*/

                if ($('#user_password').val() === '******') {
                    delete action["user_password"];
                }
            }

            action["action"] = (mode == 'edit' ? "updateUser" : "addUser");
            action["user_name"] = $("#user_name").val();

            if (!$.isEmptyObject(privilegeInfo)) {
                action = getPrivilegeAction(action, privilegeInfo);
            }

            updateOrAddUserInfo(action);
        }
    });
}

// update or add user information
function updateOrAddUserInfo(action) {
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
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                /*var containerScreen = top.frames['frameContainer'],
                    oCheckMsg = containerScreen.$('#check_msg', containerScreen.document),
                    oEmailprompt = containerScreen.$('#email_prompt', containerScreen.document);

                if ($('#email').val() && (oldUserName == username)) {
                    oCheckMsg.hide();
                    oEmailprompt.hide();
                }*/

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });

                var DO_RELOAD = function() { // DO_RELOAD();
                    var mainScreen = top.frames['frameContainer'].frames['mainScreen'];
                    mainScreen.$("#user-list", mainScreen.document).trigger('reloadGrid');

                    // update userlist, privilege
                    mWindow.getLists();
                };

                setTimeout(DO_RELOAD, 500);
            }
        }
    });
}

// set user value
function renderUserInfoForm(user) {
    // for (var item in user) {
    //     if (item == "enable_multiple_extension") {
    //         // if (user[item] == "no") {
    //         //     $("#" + item)[0].checked = false;
    //         //     // $('#vmsecret')[0].disabled = false;
    //         // }
    //     } else {
    //         $("#" + item).val(user[item]);
    //     }
    // }

    updateDocument(user, document, privilegeInfo);

    if (mode == "edit") {
        var privilege = user.privilege;

        if (role === 'privilege_0') {
            if (privilege === 0 || privilege === 3) {
                $("#privilege")
                    .attr({'disabled': true})
                    .children().filter("option[value!=" + privilege + "]").remove();
            } else if (privilege === 1 || privilege === 2 || privilege > 3) {
                $("#privilege").children().filter("option[value=0], option[value=3]").remove();
            }
        } else {
            $("#privilege")
                    .attr({'disabled': true})
                    .children().filter("option[value!=" + privilege + "]").remove();
        }
    }

    top.Custom.init(doc);
}

function jumpMenu() {
    $('.link').on('click', function() {
        top.dialog.clearDialog();
        top.frames['frameContainer'].module.jumpMenu($(this).attr('data-url') + ".html");
    });
}
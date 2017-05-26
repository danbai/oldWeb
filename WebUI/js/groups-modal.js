/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = gup.call(window, "mode"),
    group_id = gup.call(window, "group_id"),
    group_name = gup.call(window, "group_name"),
    oldGroupName = "";

Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;

$(function() {
    $P.lang(doc, true);

    if (mode == 'edit') {
        getGroupInfo(group_id);
    } else {
        prepareAddItemForm();
        top.Custom.init(doc);
    }

    initValidator();

    selectbox.electedSelect({
        rightSelect: "rightSelect",
        leftSelect: "leftSelect",
        allToRight: "allToRight",
        oneToRight: "oneToRight",
        oneToLeft: "oneToLeft",
        allToLeft: "allToLeft",
        cb: function() {
            $P("#rightSelect", doc).valid();
        }
    }, doc);
});

function prepareAddItemForm() {
    selectbox.appendOpts({
        el: "leftSelect",
        opts: mWindow.accountObjectList
    }, doc);
}

function groupNameIsExist() {
    var groupName = $("#group_name").val(),
        groupsNameList = mWindow.groupsNameList,
        tmpGroupNameList = [];

    tmpGroupNameList = groupsNameList.copy(tmpGroupNameList);

    if (oldGroupName) {
        tmpGroupNameList.remove(oldGroupName);
    }

    return !UCMGUI.inArray(groupName, tmpGroupNameList);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "group_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG2137"), groupNameIsExist]
            },
            "rightSelect": {
                selectItemMin: 1
            }
        },
        submitHandler: function() {
            var action = {},
                members = [];

            action = UCMGUI.formSerializeVal(doc);

            $.each($("#rightSelect").children(), function(index, item) {
                members.push($(item).val());
            });

            if (members.length != 0) {
                action["members"] = members.toString();
            }

            action["action"] = (mode == 'edit' ? "updateExtensionGroup" : "addExtensiongroup");

            if (mode == 'edit') {
                action["extension_group"] = group_id;
            }

            updateOrAddVMGroupInfo(action);
        }
    });
}

function updateOrAddVMGroupInfo(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                // top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });

                var DO_RELOAD = function() { // DO_RELOAD();
                        var mainScreen = top.frames['frameContainer'].frames['mainScreen'];
                        mainScreen.$("#groups_list", mainScreen.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    };

                setTimeout(DO_RELOAD, 500);
            }
        }
    });
}

function getGroupInfo(name) {
    var action = {
        "action": "getExtensionGroup",
        "extension_group": name
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);
            if (bool) {
                var group = data.response.extension_group,
                    members = group.members;

                oldGroupName = group.group_name;

                UCMGUI.domFunction.updateDocument(group, doc);

                var accountList = mWindow.accountList,
                    tmpGroupExt = [],
                    membersArr = members ? members.split(",") : [];

                tmpGroupExt = Array.prototype.copy.call(accountList, tmpGroupExt);
                tmpGroupExt.remove(membersArr);

                var rightGroupExt = transData(membersArr),
                    leftGroupExt = transData(tmpGroupExt);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftGroupExt
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightGroupExt
                }, doc);

                top.Custom.init(doc);
            }
        }
    });
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.accountObjectList);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
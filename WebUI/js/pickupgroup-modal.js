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
    oldPickupgroupName = "",
    pickupgroupId = "";

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    if (mode == 'edit') {
        pickupgroupId = gup.call(window, "pickupgroupId");

        // originalVMGroupNameInEdit = gup.call(window, "vmgroup_name");
        getPickupGroupInfo(pickupgroupId);
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
    var arr = [];
    var extgroupList = mWindow.extgroupList;
    var pickupgroupExtList = mWindow.pickupgroupExtList;

    for (var i = 0; i < extgroupList.length; i++) {
        var obj = {};

        obj["val"] = extgroupList[i]["group_id"];
        obj["text"] = $P.lang("LANG2714") + "--" + extgroupList[i]["group_name"];

        arr.push(obj);
    }

    pickupgroupExtList = pickupgroupExtList.concat(arr);

    selectbox.appendOpts({
        el: "leftSelect",
        opts: pickupgroupExtList
    }, doc);
}

function pickupgroupNameIsExist() {
    var pickupgroupName = $("#pickupgroup_name").val();
    var pickupgroupNameList = mWindow.pickupgroupNameList;
    var tmpPickupgroupNameList = [];

    tmpPickupgroupNameList = pickupgroupNameList.copy(tmpPickupgroupNameList);

    if (oldPickupgroupName) {
        tmpPickupgroupNameList.remove(oldPickupgroupName);
    }

    return !UCMGUI.inArray(pickupgroupName, tmpPickupgroupNameList);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "pickupgroup_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG2137"), pickupgroupNameIsExist]
            },
            "rightSelect": {
                selectItemMin: 2
            }

        },
        submitHandler: function() {
            var action = {};
            var members = [];

            action = UCMGUI.formSerializeVal(document);

            $.each($("#rightSelect").children(), function(index, item) {
                members.push($(item).val());
            });

            if (members.length != 0) {
                action["members"] = members.toString();
            }

            action["action"] = (mode == 'edit' ? "updatePickupgroup" : "addPickupgroup");

            if (mode == 'edit') {
                action["pickupgroup"] = pickupgroupId;
            }

            updateOrAddPickupGroupInfo(action);
        }
    });
}

function updateOrAddPickupGroupInfo(action) {
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
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#pickupgroup_list", mWindow.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

function getPickupGroupInfo(pickupgroupId) {
    var action = {
        "action": "getPickupgroup",
        "pickupgroup": pickupgroupId
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
                var pickupgroup = data.response.pickupgroup;
                var members = pickupgroup.members;

                oldPickupgroupName = pickupgroup.pickupgroup_name;

                UCMGUI.domFunction.updateDocument(pickupgroup, document);

                var pickupgroupExt = mWindow.pickupgroupExt;
                var tmpPickupgroupExt = [];
                var membersArr = members ? members.split(",") : [];

                tmpPickupgroupExt = Array.prototype.copy.call(pickupgroupExt, tmpPickupgroupExt);
                tmpPickupgroupExt.remove(membersArr);

                var rightPickupgroupExt = transData(membersArr);
                var leftPickupgroupExt = transData(tmpPickupgroupExt);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftPickupgroupExt
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightPickupgroupExt
                }, doc);

                top.Custom.init(doc);
            }
        }
    });
}

function transData(res, cb) {
    var arr = [],
        extgroupListObj = mWindow.extgroupListObj;

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extgroupListObjItem = extgroupListObj[res[i]];

        if (extgroupListObjItem) {
            obj["val"] = extgroupListObjItem["val"];
            obj["text"] = $P.lang("LANG2714") + "--" + extgroupListObjItem["text"];
        } else {
            obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.pickupgroupExtList);
        }

        if (obj) {
            arr.push(obj);
        }
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
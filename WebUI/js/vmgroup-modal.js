/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = gup.call(window, "mode"),
    portExtensionList = mWindow.portExtensionList,
    startExt = mWindow.vmgroupRange[0],
    endExt = mWindow.vmgroupRange[1],
    disableRange = mWindow.vmgroupRange[2],
    weakPassword = mWindow.vmgroupRange[4],
    oldExtension = "",
    oldVmgroupName = "";

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    if (mode == 'edit') {
        var extension = gup.call(window, "extension"),
            originalVMGroupNameInEdit = gup.call(window, "vmgroup_name");

        getVMGroupInfo(extension);
    } else {
        prepareAddItemForm();
        top.Custom.init(doc);
    }

    initValidator();

    isEnableWeakPw();

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

    $('#save').bind('click', function() {
        askExtensionRange($("#extension").val(), startExt, endExt, disableRange);
    });
});

var isEnableWeakPw = function() {
    if (weakPassword == "yes") {
        var newCrlName = $P.lang("LANG85"),
            password = $P.lang("LANG127");

        $P("#vmsecret", document).rules("add", {
            identical: [newCrlName, password, $("#extension")],
            checkNumericPw: [
                UCMGUI.enableWeakPw.showCheckPassword, {
                    required: true,
                    type: "digital",
                    pwsId: "#vmsecret",
                    doc: document
                }
            ]
        });
    }
};

function prepareAddItemForm() {
    $("#extension").val(generateNewExt());

    selectbox.appendOpts({
        el: "leftSelect",
        opts: mWindow.vmgroupExtList
    }, doc);
}

function vmgroupNameIsExist() {
    var vmgroupName = $("#vmgroup_name").val(),
        vmgroupNameList = mWindow.vmgroupNameList,
        tmpVmgroupNameList = [];

    tmpVmgroupNameList = vmgroupNameList.copy(tmpVmgroupNameList);

    if (oldVmgroupName) {
        tmpVmgroupNameList.remove(oldVmgroupName);
    }

    return !UCMGUI.inArray(vmgroupName, tmpVmgroupNameList);
}

function extensionIsExist() {
    var extension = $("#extension").val(),
        numberList = mWindow.numberList,
        tmpNumberList = [];

    tmpNumberList = numberList.copy(tmpNumberList);

    if (oldExtension) {
        tmpNumberList.remove(oldExtension);
    }

    return !UCMGUI.inArray(extension, tmpNumberList);
}

function checkIfInPort(val, ele) {
    var existed = true;

    if (UCMGUI.inArray(val, portExtensionList)) {
        existed = false;
    } else {
        existed = true;
    }

    return existed;
}

function initValidator() {
    var maxMember = 16;

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "extension": {
                required: true,
                digits: true,
                minlength: 2,
                isExist: [$P.lang("LANG2126"), extensionIsExist],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "vmgroup_name": {
                required: true,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG2143"), vmgroupNameIsExist]
            },
            "vmsecret": {
                digits: true,
                minlength: 4
            },
            "email": {
                email: true
            },
            "rightSelect": {
                selectItemMax: [maxMember, $P.lang("LANG4486")]
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG2825")
            });

            var action = {},
                members = [];

            action = UCMGUI.formSerializeVal(document);

            $.each($("#rightSelect").children(), function(index, item) {
                members.push($(item).val());
            });

            action["members"] = members.toString();

            action["action"] = (mode == 'edit' ? "updateVMgroup" : "addVMgroup");

            if (mode == 'edit') {
                action["vmgroup"] = oldExtension;
            }

            updateOrAddVMGroupInfo(action);
        }
    });

    if (disableRange == "no") {
        $P("#extension", document).rules("add", {
            range: [startExt, endExt]
        });
    }
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
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#VMGroups_list", mWindow.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

function getVMGroupInfo(name) {
    var action = {
        "action": "getVMgroup",
        "vmgroup": name
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
                var vmgroup = data.response.vmgroup,
                    members = vmgroup.members;

                oldExtension = vmgroup.extension;
                oldVmgroupName = vmgroup.vmgroup_name;

                $("#extension").val(oldExtension);

                UCMGUI.domFunction.updateDocument(vmgroup, document);

                var vmgroupExt = mWindow.vmgroupExt,
                    tmpVmgroupExt = [],
                    membersArr = members ? members.split(",") : [];

                tmpVmgroupExt = Array.prototype.copy.call(vmgroupExt, tmpVmgroupExt);
                tmpVmgroupExt.remove(membersArr);

                var rightVmgroupExt = transData(membersArr),
                    leftVmgroupExt = transData(tmpVmgroupExt);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftVmgroupExt
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightVmgroupExt
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

        obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.vmgroupExtList);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function generateNewExt() {
    var i = startExt;

    for (i; i <= endExt; i++) {
        if ($.inArray(i.toString(), mWindow.numberList) == -1) {
            return i;
        }
    }
}
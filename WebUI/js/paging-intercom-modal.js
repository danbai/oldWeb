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
    oldExtension = "",
    oldPagingName = "";

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    selectbox.appendOpts({
        el: "custom_prompt",
        opts: mWindow.ivrNameArr
    }, doc);

    if (mode == 'edit') {
        var pageInterExt = gup.call(window, "pageInterExt");

        getPageInterInfo(pageInterExt);
    } else {
        prepareAddItemForm();

        top.Custom.init(doc);
    }

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

    initValidator();
});

function prepareAddItemForm() {
    var arr = [],
        extgroupList = mWindow.extgroupList,
        pagingExtList = mWindow.pagingExtList;

    for (var i = 0; i < extgroupList.length; i++) {
        var obj = {};

        obj["val"] = extgroupList[i]["group_id"];
        obj["text"] = $P.lang("LANG2714") + "--" + extgroupList[i]["group_name"];

        arr.push(obj);
    }

    pagingExtList = pagingExtList.concat(arr);

    selectbox.appendOpts({
        el: "leftSelect",
        opts: pagingExtList
    }, doc);
}

function pagingNameIsExist() {
    var pagingName = $("#paginggroup_name").val(),
        pagingNameList = mWindow.pagingNameList,
        tmpPagingNameList = [];

    tmpPagingNameList = pagingNameList.copy(tmpPagingNameList);

    if (oldPagingName) {
        tmpPagingNameList.remove(oldPagingName);
    }

    return !UCMGUI.inArray(pagingName, tmpPagingNameList);
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
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "paginggroup_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                isExist: [$P.lang("LANG2855"), pagingNameIsExist]
            },
            "extension": {
                required: true,
                digits: true,
                isExist: [$P.lang("LANG2126"), extensionIsExist],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "paginggroup_type": {
                required: true
            },
            "rightSelect": {
                selectItemMin: 1 //,
                // selectItemMax: [16, 'mailboxes']
            }
        },
        submitHandler: function() {
            var action = {},
                members = [];

            action = UCMGUI.formSerializeVal(document);

            $.each($("#rightSelect").children(), function(index, item) {
                members.push($(item).val());
            });

            if (members.length != 0) {
                action["members"] = members.toString();
            }

            action["action"] = (mode == 'edit' ? "updatePaginggroup" : "addPaginggroup");

            if (mode == 'edit') {
                action["paginggroup"] = oldExtension;
            }

            updateOrAddPageInterInfo(action);
        }
    });
}

function getPageInterInfo(ext) {
    var action = {
        "action": "getPaginggroup",
        "paginggroup": ext
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
                var paginggroup = data.response.paginggroup;
                var members = paginggroup.members;

                oldExtension = paginggroup.extension;
                oldPagingName = paginggroup.paginggroup_name;

                UCMGUI.domFunction.updateDocument(paginggroup, document);

                var pagingExt = mWindow.pagingExt;
                var tmpPagingExt = [];
                var membersArr = members ? members.split(",") : [];

                tmpPagingExt = Array.prototype.copy.call(pagingExt, tmpPagingExt);
                tmpPagingExt.remove(membersArr);

                var rightPagingExt = transData(membersArr);
                var leftPagingExt = transData(tmpPagingExt);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftPagingExt
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightPagingExt
                }, doc);

                top.Custom.init(doc);
            }
        }
    });
}

function updateOrAddPageInterInfo(action) {
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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#pageInter-list", mWindow.document).trigger('reloadGrid');

                        mWindow.getNameList();
                    }
                });
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
            obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.pagingExtList);
        }

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function link_prompt() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG843").format($P.lang("LANG238")),
        buttons: {
            ok: function() {
                top.frames["frameContainer"].module.jumpMenu('menuprompts_record.html');
            },
            cancel: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        }
    });
}
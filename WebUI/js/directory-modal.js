/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    setDefaultsWhenCreate = UCMGUI.setDefaultsWhenCreate,
    gup = UCMGUI.gup,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = gup.call(window, "mode"),
    startExt = mWindow.directoryRange[0],
    endExt = mWindow.directoryRange[1],
    disableRange = mWindow.directoryRange[2],
    weakPassword = mWindow.directoryRange[4],
    portExtensionList = mWindow.portExtensionList,
    oldExtension = "",
    oldDirectoryName = "";

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    initForm();

    if (mode == 'add') {
        prepareAddItemForm();

        top.Custom.init(doc);
    } else if (mode == 'edit') {
        prepareEditItemForm();
    }

    initValidator();
});

function checkIfInPort(val, ele) {
    var existed = true;

    if (UCMGUI.inArray(val, portExtensionList)) {
        existed = false;
    } else {
        existed = true;
    }

    return existed;
}

function directoryNameIsExist() {
    var directoryName = $("#name").val(),
        directoryNameList = mWindow.directoryNameList,
        tmpDirectoryNameList = [];

    tmpDirectoryNameList = directoryNameList.copy(tmpDirectoryNameList);

    if (oldDirectoryName) {
        tmpDirectoryNameList.remove(oldDirectoryName);
    }

    return !UCMGUI.inArray(directoryName, tmpDirectoryNameList);
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

function generateNewExt() {
    var i = startExt;

    for (i; i <= endExt; i++) {
        if ($.inArray(i.toString(), mWindow.numberList) == -1) {
            return i;
        }
    }
}

function getDirectoryInfo(name) {
    var action = {
        "action": "getDirectory",
        "directory": name
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
                var directoryInfo = data.response.directory;

                oldExtension = directoryInfo.extension;
                oldDirectoryName = directoryInfo.name;

                UCMGUI.domFunction.updateDocument(directoryInfo, document);

                $('.query[value="' + directoryInfo.query_type + '"]').attr('checked', true);

                $('.select[value="' + directoryInfo.select_type + '"]').attr('checked', true);

                var directoryExt = mWindow.directoryExt,
                    tmpDirectoryExt = [],
                    LDAPmemberExt = mWindow.LDAPmemberExt,
                    tmpLDAPmemberExt = [],
                    membersArr = directoryInfo.members ? directoryInfo.members.split(",") : [],
                    membersLDAPArr = directoryInfo.members_ldap ? directoryInfo.members_ldap.split("|") : [];

                tmpDirectoryExt = Array.prototype.copy.call(directoryExt, tmpDirectoryExt);
                tmpDirectoryExt.remove(membersArr);

                tmpLDAPmemberExt = Array.prototype.copy.call(LDAPmemberExt, tmpLDAPmemberExt);
                tmpLDAPmemberExt.remove(membersLDAPArr);

                var rightDirectoryExt = transExtensionData(membersArr),
                    leftDirectoryExt = transExtensionData(tmpDirectoryExt);

                var rightDirectoryLDAPExt = transExtensionLDAPData(membersLDAPArr),
                    leftDirectoryLDAPExt = transExtensionLDAPData(tmpLDAPmemberExt);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftDirectoryExt
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightDirectoryExt
                }, doc);

                selectbox.appendOpts({
                    el: "leftSelectLDAP",
                    opts: leftDirectoryLDAPExt,
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelectLDAP",
                    opts: rightDirectoryLDAPExt,
                }, doc);

                top.Custom.init(doc);
            }
        }
    });
}

function initForm() {
    $('#save').bind('click', function() {
        askExtensionRange($("#extension").val(), startExt, endExt, disableRange);
    });

    selectbox.electedSelect({
        rightSelect: "rightSelect",
        leftSelect: "leftSelect",
        allToRight: "allToRight",
        oneToRight: "oneToRight",
        oneToLeft: "oneToLeft",
        allToLeft: "allToLeft",
        // top: "button_top",
        // up: "button_up",
        // down: "button_down",
        // bottom: "button_bottom",
        // isSort: false,
        cb: function() {
            $P("#rightSelect", doc).valid();
        }
    }, doc);

    selectbox.electedSelect({
        rightSelect: "rightSelectLDAP",
        leftSelect: "leftSelectLDAP",
        allToRight: "allToRightLDAP",
        oneToRight: "oneToRightLDAP",
        oneToLeft: "oneToLeftLDAP",
        allToLeft: "allToLeftLDAP",
        // top: "button_top",
        // up: "button_up",
        // down: "button_down",
        // bottom: "button_bottom",
        // isSort: false,
        cb: function() {
            $P("#rightSelectLDAP", doc).valid();
        }
    }, doc);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG2137"), directoryNameIsExist]
            },
            "extension": {
                required: true,
                digits: true,
                minlength: 2,
                isExist: [$P.lang("LANG2126"), extensionIsExist],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "rightSelect": {
                selectItemMin: function() {
                    if ($("#rightSelectLDAP option").length) {
                        return 0;
                    }

                    return 1;
                }
                // selectItemMax: [16, $P.lang('LANG128').toLowerCase()],
                // selectMemberLength: 200 // consider CLI buffer
            },
            "rightSelectLDAP": {
                selectItemMin: function() {
                    if ($("#rightSelect option").length) {
                        return 0;
                    }

                    return 1;
                }
            },
            "wait_time": {
                required: true,
                digits: true,
                range: [3, 60]
            },
            "query_type": {
                required: true
            },
            "select_type": {
                required: true
            }
        },
        submitHandler: function() {
            var action = {},
                members = [],
                members_ldap = [],
                extensionVal = $("#extension").val();

            action = UCMGUI.formSerializeVal(document);

            action["action"] = (mode == 'edit' ? "updateDirectory" : "addDirectory");

            if (mode == 'edit') {
                action["directory"] = oldExtension;
            }

            $.each($("#rightSelect").children(), function(index, item) {
                members.push($(item).val());
            });

            if (members.length != 0) {
                action["members"] = members.toString();
            } else {
                action["members"] = "";
            }

            $.each($("#rightSelectLDAP").children(), function(index, item){
                members_ldap.push($(item).val());
            });

            if (members_ldap.length != 0) {
                action["members_ldap"] = members_ldap.join('|').toString();
            } else{
                action["members_ldap"] = "";
            }

            action["wait_time"] = $("#wait_time").val();

            action["query_type"] = $('.query:checked').val();

            action["select_type"] = $('.select:checked').val();

            updateOrAddDirectoryInfo(action);
        }
    });

    if (disableRange == "no") {
        $P("#extension", document).rules("add", {
            range: [startExt, endExt]
        });
    }
}

function prepareAddItemForm() {
    var arr = [],
        arrLDAP = [],
        extgroupList = mWindow.extgroupList,
        LDAPmemberList = mWindow.LDAPmemberList,
        directoryExtList = mWindow.directoryExtList,
        directoryExtLDAPList = [];

    $("#extension").val(generateNewExt());

    for (var i = 0; i < extgroupList.length; i++) {
        var obj = {};

        obj["val"] = extgroupList[i]["group_id"];
        obj["text"] = $P.lang("LANG2714") + "--" + extgroupList[i]["group_name"];

        arr.push(obj);
    }

    for (var i = 0; i < LDAPmemberList.length; i++) {
        var objLDAP = {};

        objLDAP["val"] = LDAPmemberList[i]["phonebook_dn"];
        objLDAP["text"] = LDAPmemberList[i]["phonebook_dn"];

        arrLDAP.push(objLDAP);
    }

    directoryExtList = directoryExtList.concat(arr);
    directoryExtLDAPList = directoryExtLDAPList.concat(arrLDAP);

    selectbox.appendOpts({
        el: "leftSelect",
        opts: directoryExtList
    }, doc);

    selectbox.appendOpts({
        el: "leftSelectLDAP",
        opts: directoryExtLDAPList
    }, doc);

    $("#wait_time").val('5');

    $('.query[value="LASTNAME"]').attr('checked', true);

    $('.select[value="SEQ"]').attr('checked', true);
}

function prepareEditItemForm() {
    var directoryExt = gup.call(window, "directoryExt"),
        originalDirectoryNameInEdit = gup.call(window, "directory_name");

    getDirectoryInfo(directoryExt);
}

function transExtensionData(res, cb) {
    var arr = [],
        extgroupListObj = mWindow.extgroupListObj;

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extgroupListObjItem = extgroupListObj[res[i]];

        if (extgroupListObjItem) {
            obj["val"] = extgroupListObjItem["val"];
            obj["text"] = $P.lang("LANG2714") + "--" + extgroupListObjItem["text"];
        } else {
            obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.directoryExtList);
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

function transExtensionLDAPData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj["val"] = res[i];
        obj["text"] = res[i];

        if (obj) {
            arr.push(obj);
        }
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function updateOrAddDirectoryInfo(action) {
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
                        mWindow.$("#directory-list", mWindow.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}
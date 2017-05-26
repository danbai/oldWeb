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
    type = gup.call(window, "type"),
    isCodeModal = (type === 'code'), // Code Modal or Code Group Modal
    selectbox = UCMGUI.domFunction.selectbox,
    setDefaultsWhenCreate = UCMGUI.setDefaultsWhenCreate,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    portExtensionList = mWindow.portExtensionList,
    oldGroupNumber = '',
    oldGroupName = '',
    oldCodeNumber = '',
    oldCodeName = '';

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    initForm();

    if (mode == 'add') {
        setDefaultsWhenCreate(doc);

        top.Custom.init(doc);
    } else if (mode == 'edit') {
        prepareEditItemForm();
    }

    initValidator();
});

function initForm() {
    if (isCodeModal) {
        $('#group').hide();

        $("#code_name").focus();

        selectbox.appendOpts({
            el: "code_prompt",
            opts: mWindow.ivrNameArr
        }, doc);
    } else {
        $('#code').hide();

        $("#group_name").focus();

        selectbox.electedSelect({
            rightSelect: "rightSelect",
            leftSelect: "leftSelect",
            allToRight: "allToRight",
            oneToRight: "oneToRight",
            oneToLeft: "oneToLeft",
            allToLeft: "allToLeft",
            top: "button_top",
            up: "button_up",
            down: "button_down",
            bottom: "button_bottom",
            isSort: false,
            cb: function() {
                $P("#rightSelect", doc).valid();
            }
        }, doc);

        selectbox.appendOpts({
            el: "leftSelect",
            opts: mWindow.codeblueExtList
        }, doc);
    }
}

function prepareEditItemForm() {
    var extension = gup.call(window, "extension");

    getInfo(extension);
}

function checkIfNameIsExist() {
    var tmpNameList = [],
        name, namelist, oldName;

    if (isCodeModal) {
        name = $("#code_name").val();
        namelist = mWindow.codeblueNameList;
        oldName = oldCodeName;
    } else {
        name = $("#group_name").val();
        namelist = mWindow.codeblueGroupNameList;
        oldName = oldGroupName;
    }

    tmpNameList = namelist.copy(tmpNameList);

    if (oldName) {
        tmpNameList.remove(oldName);
    }

    return !UCMGUI.inArray(name, tmpNameList);
}

function checkIfExtensionIsExist() {
    var tmpNumberList = [],
        existed = false,
        number, numberlist, otherNumberList, oldNumber;

    numberList = mWindow.numberList;

    // Code Number + Code Group Number can not in numberList
    if (isCodeModal) {
        number = $("#codeblue_code").val();
        otherNumberList = mWindow.codeblueGroupNumberList;
        oldNumber = oldCodeNumber;
    } else {
        number = $("#codeblue_group").val();
        otherNumberList = mWindow.codeblueNumberList;
        oldNumber = oldGroupNumber;
    }

    tmpNumberList = numberList.copy(tmpNumberList);

    if (oldNumber) {
        tmpNumberList.remove(oldNumber);
    }

    if (UCMGUI.inArray(number, tmpNumberList)) {
        existed = true;
    } else {
        $.each(otherNumberList, function(index, value) {
            var tmpNumber;

            if (isCodeModal) {
                tmpNumber = number + value;
            } else {
                tmpNumber = value + number;
            }

            if (UCMGUI.inArray(tmpNumber, tmpNumberList)) {
                existed = true;

                return false;
            }
        });
    }

    return !existed;
}

function checkIfContainOtherCodes(val, ele) {
    var contain = false,
        otherNumberList = mWindow.codeblueNumberList;

    $.each(otherNumberList, function(index, value) {
        if (val.indexOf(value) > -1 || value.beginsWith(val)) {
            contain = true;

            return false;
        }
    });

    return !contain;
}

function checkIfInPort(val, ele) {
    var existed = false,
        otherNumberList;

    // Code Number + Code Group Number can not in portExtensionList
    if (isCodeModal) {
        otherNumberList = mWindow.codeblueGroupNumberList;
    } else {
        otherNumberList = mWindow.codeblueNumberList;
    }

    if (UCMGUI.inArray(val, portExtensionList)) {
        existed = true;
    } else {
        $.each(otherNumberList, function(index, value) {
            var tmpNumber;

            if (isCodeModal) {
                tmpNumber = val + value;
            } else {
                tmpNumber = value + val;
            }

            if (UCMGUI.inArray(tmpNumber, portExtensionList)) {
                existed = true;

                return false;
            }
        });
    }

    return !existed;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "code_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                isExist: [$P.lang("LANG2137"), checkIfNameIsExist]
            },
            "group_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                isExist: [$P.lang("LANG2137"), checkIfNameIsExist]
            },
            "codeblue_code": {
                required: true,
                digits: true,
                customCallback1: [$P.lang("LANG5378"), checkIfContainOtherCodes],
                isExist: [$P.lang("LANG2126"), checkIfExtensionIsExist],
                customCallback2: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "codeblue_group": {
                required: true,
                digits: true,
                isExist: [$P.lang("LANG2126"), checkIfExtensionIsExist],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "rightSelect": {
                selectItemMin: function() {
                    return 1;
                },
                selectItemMax: [100, $P.lang('LANG128').toLowerCase()]
                // selectMemberLength: 200 // consider CLI buffer
            },
            "code_timeout": {
                required: true,
                digits: true,
                range: [3, 600]
            },
            "code_prompt": {
                required: true
            }
        },
        submitHandler: function() {
            var action = {};

            if (isCodeModal) {
                var extension = $("#codeblue_code").val();

                if (mode === 'add') {
                    action["action"] = 'addCodeblueCode';
                    action["extension"] = extension;
                } else {
                    action["action"] = 'updateCodeblueCode';
                    action["codeblue_code"] = extension;
                }

                action["code_name"] = $("#code_name").val();
                action["code_prompt"] = $("#code_prompt").val();
                action["code_timeout"] = $("#code_timeout").val();
            } else {
                var extension = $("#codeblue_group").val(),
                    members = [];

                if (mode === 'add') {
                    action["action"] = 'addCodeblueGroup';
                    action["extension"] = extension;
                } else {
                    action["action"] = 'updateCodeblueGroup';
                    action["codeblue_group"] = extension;
                }

                action["group_name"] = $("#group_name").val();

                $.each($("#rightSelect").children(), function(index, item) {
                    members.push(this.value);
                });

                if (members.length != 0) {
                    action["members"] = members.toString();
                } else {
                    action["members"] = "";
                }
            }

            updateOrAddInfo(action);
        }
    });
}

function getInfo(extension) {
    var action = {};

    if (isCodeModal) {
        action = {
            "action": "getCodeblueCode",
            "codeblue_code": extension
        };
    } else {
        action = {
            "action": "getCodeblueGroup",
            "codeblue_group": extension
        };
    }
    
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
                var datas;

                if (isCodeModal) {
                    datas = data.response.codeblue_code;

                    oldCodeNumber = datas.extension;
                    oldCodeName = datas.code_name;

                    $('#codeblue_code').val(datas.extension).attr('disabled', 'disabled');
                } else {
                    datas = data.response.codeblue_group;

                    oldGroupNumber = datas.extension;
                    oldGroupName = datas.group_name;

                    $('#codeblue_group').val(datas.extension).attr('disabled', 'disabled');

                    var codeblueExt = mWindow.codeblueExt,
                        membersArr = (datas.members ? datas.members.split(",") : []),
                        tmpGroupExt = [];

                    tmpGroupExt = Array.prototype.copy.call(codeblueExt, tmpGroupExt);
                    tmpGroupExt.remove(membersArr);

                    var rightGroupExt = transExtensionData(membersArr),
                        leftGroupExt = transExtensionData(tmpGroupExt);

                    selectbox.appendOpts({
                        el: "leftSelect",
                        opts: leftGroupExt
                    }, doc);

                    selectbox.appendOpts({
                        el: "rightSelect",
                        opts: rightGroupExt
                    }, doc);
                }

                UCMGUI.domFunction.updateDocument(datas, document);

                top.Custom.init(doc);
            }
        }
    });
}

function updateOrAddInfo(action) {
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
                        var gridID;

                        if (isCodeModal) {
                            gridID = '#codeblueList';
                        } else {
                            gridID = '#codeblueGroupList';
                        }

                        mWindow.$(gridID, mWindow.document).trigger('reloadGrid');

                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

function transExtensionData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.codeblueExtList);

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
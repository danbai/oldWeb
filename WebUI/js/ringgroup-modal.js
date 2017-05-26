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
    portExtensionList = mWindow.portExtensionList,
    startExt = mWindow.ringgroupRange[0],
    endExt = mWindow.ringgroupRange[1],
    disableRange = mWindow.ringgroupRange[2],
    weakPassword = mWindow.ringgroupRange[4],
    oldExtension = "",
    oldRinggroupName = "",
    actionItemArr = ["voicemail", "account", "vmgroup", "ivr", "ringgroup", "queue", "paginggroup", "conference", "fax", "disa", "directory", "external_number"];

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
        setDefaultsWhenCreate(doc);

        prepareAddItemForm();

        top.Custom.init(doc);
    } else if (mode == 'edit') {
        prepareEditItemForm()
    }

    initValidator();

    isEnableWeakPw();
});

function initForm() {
    $("#ringgroup_name").focus();

    $("#strategy")[0].selectedIndex = 1;

    selectbox.appendOpts({
        el: "custom_prompt",
        opts: mWindow.ivrNameArr
    }, doc);

    selectbox.appendOpts({
        el: "musicclass",
        opts: mWindow.mohNameList
    }, doc);

    var destinationTypeArr = [{
        text: $P.lang("LANG85"),
        val: "account"
    }, {
        text: $P.lang("LANG90"),
        val: "voicemail"
    }, {
        text: $P.lang("LANG91"),
        val: "queue"
    }, {
        text: $P.lang("LANG600"),
        val: "ringgroup"
    }, {
        text: $P.lang("LANG89"),
        val: "vmgroup"
    }, {
        text: $P.lang("LANG19"),
        val: "ivr"
    }, {
        text: $P.lang("LANG3458"),
        val: "external_number"
    }];

    selectbox.appendOpts({
        el: "destination_type",
        opts: destinationTypeArr
    }, doc);

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "enable_destination",
        enableList: ["destination_type", "destination_value", "external_number", "vm_extension", "vmsecret", "email"]
    }, doc);

    // $("#hasvoicemail").bind("click", function(ev) {
    //     // if (window.frameElement) {
    //     //     $(window.frameElement).css("height", "0px");
    //     //     $(window.frameElement).css("width", "0px");
    //     // }
    //     if ($("#hasvoicemail").is(":checked") && $("#vm_extension").val() == 'yes') {
    //         $("#vmoption").show();
    //     } else {
    //         $("#vmoption").hide();
    //     }
    //     top.dialog.repositionDialog("none");
    // });

    // $('#vm_extension').bind('change', function() {
    //     if ($(this).val() != 'yes') {
    //         $("#vmoption").hide();
    //     } else if ($(this).val() == 'yes' && !$(this).is(":disabled")) {
    //         $("#vmoption").show();
    //     }
    //     top.dialog.repositionDialog("none");
    // });

    selectbox.appendOpts({
        el: "destination_value",
        opts: transDestinationVal(mWindow.destinationTypeValue["account"], "account")
    }, doc);

    var changeFun = function(ev) {
        // var extensionVal = $("#extension").val();
        var destinationTypeVal = $("#destination_type option:selected").val(),
            destinationVal = $("#destination_value option:selected").val();

        if (destinationTypeVal == "voicemail" && destinationVal == "yes") {
            $("#vmoption").show();

            isEnableWeakPw();

            $("#external_number").hide();
        } else if (destinationTypeVal == "external_number") {
            $("#external_number").show();

            $("#vmoption").hide();
        } else {
            $("#external_number").hide();

            $("#vmoption").hide();
        }

        top.dialog.repositionDialog();

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    }

    $('#destination_value').bind("change", changeFun);

    $('#destination_type').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "external_number") {
            $(".selectDivValue").hide();
            $("#destination_value").empty();
            $("#external_number").show();
            $("#vmoption").hide();
        } else {
            $(".selectDivValue").show();
            $("#destination_value").empty();

            if (value != "voicemail") {
                $("#vmoption").hide();
            }

            $("#external_number").hide();

            selectbox.appendOpts({
                el: "destination_value",
                opts: transDestinationVal(mWindow.destinationTypeValue[value], value)
            }, doc);

            $('#destination_value').trigger("change");
        }

        top.Custom.init(doc, $('#destination_value')[0]);

        top.dialog.repositionDialog();

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $("#musicclass").bind("change", function(ev) {
        var value = $(this).val();

        if (!value) {
            $(".levelTip").hide();
        } else {
            $(".levelTip").show();
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#save').bind('click', function() {
        askExtensionRange($("#extension").val(), startExt, endExt, disableRange);
    });

    // selectbox.appendOpts({
    //     el: "vm_extension",
    //     opts: transVoicemailData()
    // }, doc);

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

    selectbox.electedSelect({
        rightSelect: "rightSelectLDAP",
        leftSelect: "leftSelectLDAP",
        allToRight: "allToRightLDAP",
        oneToRight: "oneToRightLDAP",
        oneToLeft: "oneToLeftLDAP",
        allToLeft: "allToLeftLDAP",
        top: "buttonTopLDAP",
        up: "buttonUpLDAP",
        down: "buttonDownLDAP",
        bottom: "buttonBottomLDAP",
        isSort: false,
        cb: function() {
            $P("#rightSelectLDAP", doc).valid();
        }
    }, doc);
}

function prepareAddItemForm() {
    var arr = [],
        arrLDAP = [],
        extgroupList = mWindow.extgroupList,
        LDAPmemberList = mWindow.LDAPmemberList,
        ringgroupExtList = mWindow.ringgroupExtList;

    $("#extension").val(generateNewExt());

    // $("#hasvoicemail")[0].updateStatus();
    $("#enable_destination")[0].updateStatus();

    for (var i = 0; i < extgroupList.length; i++) {
        var obj = {};

        obj["val"] = extgroupList[i]["group_id"];
        obj["text"] = $P.lang("LANG2714") + "--" + extgroupList[i]["group_name"];

        arr.push(obj);
    }

    for (var i = 0; i < LDAPmemberList.length; i++) {
        var objLDAP = {},
            member = LDAPmemberList[i].split('#');

        objLDAP["val"] = LDAPmemberList[i];
        objLDAP["text"] = member[0] + '(' + member[1].split(',')[0] + ')';

        arrLDAP.push(objLDAP);
    }

    ringgroupExtList = ringgroupExtList.concat(arr);
    ringgroupExtLDAPList = [].concat(arrLDAP);

    $P.lang(doc, true);

    selectbox.appendOpts({
        el: "leftSelect",
        opts: ringgroupExtList
    }, doc);

    selectbox.appendOpts({
        el: "leftSelectLDAP",
        opts: ringgroupExtLDAPList
    }, doc);

    $('#vm_extension').trigger('change');  
}

function prepareEditItemForm() {
    var ringgroupExt = gup.call(window, "ringgroupExt"),
        originalRingGroupNameInEdit = gup.call(window, "ringgroup_name");

    getRinggroupInfo(ringgroupExt);
}

function ringgroupNameIsExist() {
    var ringgroupName = $("#ringgroup_name").val(),
        ringgroupNameList = mWindow.ringgroupNameList,
        tmpRinggroupNameList = [];

    tmpRinggroupNameList = ringgroupNameList.copy(tmpRinggroupNameList);

    if (oldRinggroupName) {
        tmpRinggroupNameList.remove(oldRinggroupName);
    }

    return !UCMGUI.inArray(ringgroupName, tmpRinggroupNameList);
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
            "ringgroup_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                // checkRingGroupName: [mode, originalRingGroupNameInEdit]
                isExist: [$P.lang("LANG2137"), ringgroupNameIsExist]
            },
            "extension": {
                required: true,
                digits: true,
                isExist: [$P.lang("LANG2126"), extensionIsExist],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "rightSelect": {
                selectItemMin: function() {
                    if ($("#rightSelectLDAP option").length) {
                        return 0;
                    }

                    return 1;
                },
                // selectMemberLength: 200 // consider CLI buffer
                selectItemMax: [100, $P.lang('LANG128').toLowerCase()]
            },
            "rightSelectLDAP": {
                selectItemMin: function() {
                    if ($("#rightSelect option").length) {
                        return 0;
                    }

                    return 1;
                }
            },
            "ringtime": {
                required: true,
                digits: true,
                min: 0
            },
            "destination_type": {
                required: true
            },
            "destination_value": {
                required: true
            },
            "vmsecret": {
                // required: "#hasvoicemail:checked",
                digits: true,
                minlength: 4
            },
            "email": {
                email: true
            },
            "external_number": {
                required: true,
                phoneNumberOrExtension: true
            }
        },
        submitHandler: function() {
            var action = {},
                members = [],
                members_ldap = [],
                extensionVal = $("#extension").val(),
                destinationTypeVal = $("#destination_type option:selected").val(),
                destinationVal = $("#destination_value option:selected").val(),
                destinationVal_nu = $("#external_number").val();

            action = UCMGUI.formSerializeVal(document);

            action["action"] = (mode == 'edit' ? "updateRinggroup" : "addRinggroup");

            if (mode == 'edit') {
                action["ringgroup"] = oldExtension;
            }

            // var val = $("#vm_extension").val();
            // if (val == "yes") {
            //     action["ringgroupasvm"] = "yes";
            //     action["vm_extension"] = "";
            // } else {
            //     action["ringgroupasvm"] = "no";
            //     action["vm_extension"] = val;
            // }

            action["destination_type"] = destinationTypeVal;

            if (destinationTypeVal == "voicemail") {
                action["hasvoicemail"] = "yes";
                // action["vm_extension"] = extensionVal;

                if (destinationVal == "yes") {
                    action["ringgroupasvm"] = "yes";
                } else {
                    action["ringgroupasvm"] = "no";
                }
            } else {
                // action[destinationTypeVal] = destinationVal;
                action["hasvoicemail"] = "no";
                action["vm_extension"] = "";
                action["ringgroupasvm"] = "no";
            }

            for (var i = 0; i < actionItemArr.length; i++) {
                var actionItemArrIndex = actionItemArr[i];

                if (actionItemArrIndex != destinationTypeVal) {
                    if (actionItemArrIndex == "ringgroup") {
                        action["ringgroup_dest"] = "";
                    } else if (actionItemArrIndex == "voicemail") {
                        action["vm_extension"] = "";
                    } else {
                        action[actionItemArrIndex] = "";
                    }
                } else {
                    if (actionItemArrIndex == "ringgroup") {
                        action["ringgroup_dest"] = destinationVal;
                    } else if (actionItemArrIndex == "voicemail") {
                        if (destinationVal == "yes") {
                            action["vm_extension"] = extensionVal;
                        } else {
                            action["vm_extension"] = destinationVal;
                        }
                    } else if (actionItemArrIndex == "external_number") {
                        action[actionItemArrIndex] = destinationVal_nu;
                    } else {
                        action[actionItemArrIndex] = destinationVal;
                    }
                }
            }

            $.each($("#rightSelect").children(), function(index, item) {
                members.push(this.value);
            });

            if (members.length != 0) {
                action["members"] = members.toString();
            } else {
                action["members"] = "";
            }

            $.each($("#rightSelectLDAP").children(), function(index, item) {
                members_ldap.push(this.value);
            });

            if (members_ldap.length != 0) {
                action["members_ldap"] = members_ldap.join('|').toString();
            } else {
                action["members_ldap"] = "";
            }

            updateOrAddRinggroupInfo(action);
        }
    });

    if (disableRange == "no") {
        $P("#extension", document).rules("add", {
            range: [startExt, endExt]
        });
    }
}

function getRinggroupInfo(name) {
    var action = {
        "action": "getRinggroup",
        "ringgroup": name
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
                var ringgroupInfo = data.response.ringgroup;

                oldExtension = ringgroupInfo.extension;
                oldRinggroupName = ringgroupInfo.ringgroup_name;

                var destinationType = ringgroupInfo.destination_type;

                UCMGUI.domFunction.updateDocument(ringgroupInfo, document);

                $("#extension").attr({'disabled': true});
                $("#destination_type").trigger('change');
                $("#enable_destination").get(0).checked = (ringgroupInfo.enable_destination == "yes" ? true : false);
                $("#enable_destination").get(0).updateStatus();

                // $("#hasvoicemail")[0].updateStatus();
                // if ($("#hasvoicemail").is(":checked")) {
                //     $("#vmoption").show();
                // } else {
                //     $("#vmoption").hide();
                // }
                // if (ringgroupInfo.vm_extension) {
                //     $("#vm_extension").val(ringgroupInfo.vm_extension)
                // }
                // $("#vm_extension").trigger('change');

                if (ringgroupInfo.musicclass) {
                    $(".levelTip").show();
                }

                if (destinationType == "voicemail") {
                    var vmExtension = ringgroupInfo["vm_extension"];

                    if (vmExtension) {
                        if (vmExtension == oldExtension) {
                            $("#destination_value").val("yes");
                        } else {
                            $("#destination_value").val(vmExtension);
                        }
                    } else {
                        //$("#destination_value").get(0).selectedIndex = -1;
                        $("#destination_value").val("yes");
                    }
                } else if (destinationType == "external_number") {
                    if (ringgroupInfo[destinationType]) {
                        $("#external_number").val(ringgroupInfo[destinationType]);
                    } else {
                        $("#external_number").val('');
                    }
                } else {
                    if (ringgroupInfo[destinationType]) {
                        $("#destination_value").val(ringgroupInfo[destinationType]);
                    } else {
                        $("#destination_value").get(0).selectedIndex = -1;
                    }
                }

                $("#destination_value").trigger('change');

                top.dialog.repositionDialog("none");

                var ringgroupExt = mWindow.ringgroupExt,
                    membersArr = (ringgroupInfo.members ? ringgroupInfo.members.split(",") : []),
                    tmpRinggroupExt = [],
                    LDAPmemberList = mWindow.LDAPmemberList,
                    membersLDAPArr = ringgroupInfo.members_ldap ? ringgroupInfo.members_ldap.split("|") : [],
                    tmpLDAPmemberList = [];

                tmpRinggroupExt = Array.prototype.copy.call(ringgroupExt, tmpRinggroupExt);
                tmpRinggroupExt.remove(membersArr);

                tmpLDAPmemberList = Array.prototype.copy.call(LDAPmemberList, tmpLDAPmemberList);
                tmpLDAPmemberList.remove(membersLDAPArr);

                var rightRinggroupExt = transExtensionData(membersArr),
                    leftRinggroupExt = transExtensionData(tmpRinggroupExt);


                var rightRinggroupLDAPList = transExtensionLDAPData(membersLDAPArr),
                    leftRinggroupLDAPList = transExtensionLDAPData(tmpLDAPmemberList);

                $P.lang(doc, true);

                selectbox.appendOpts({
                    el: "leftSelectLDAP",
                    opts: leftRinggroupLDAPList,
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelectLDAP",
                    opts: rightRinggroupLDAPList,
                }, doc);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftRinggroupExt
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightRinggroupExt
                }, doc);

                top.Custom.init(doc);

            }
        }
    });
}

function updateOrAddRinggroupInfo(action) {
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
                        mWindow.$("#ringgroup-list", mWindow.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

// function transVoicemailData() {
//     var arr = [];
//     // LANG2223
//     // LANG20
//     arr[0] = {
//         val: "yes",
//         text: $P.lang("LANG2223")
//     }
//     var voicemailList = mWindow.voicemailList
//     for (var i = 0; i < voicemailList.length; i++) {
//         var obj = {};
//         obj["val"] = voicemailList[i];
//         obj["text"] = $P.lang("LANG20") + "--" + voicemailList[i];
//         arr.push(obj);
//     }
//     return arr;
// }

function transDestinationVal(res, type) {
    var ringgroupName = $("#ringgroup_name").val(),
        arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        if (type == "voicemail" || type == "account") {
            var extension = res[i].extension,
                fullname = res[i].fullname,
                disabled = res[i].out_of_service;

            obj["val"] = extension;

            if (disabled == 'yes') {
                obj["class"] = 'disabledExtOrTrunk';
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            } else {
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
            }
        } else if (type == "queue") {
            obj["text"] = res[i]["queue_name"];
            obj["val"] = res[i]["extension"];
        } else if (type == "ringgroup") {
            var resRinggroupName = res[i]["ringgroup_name"];

            if (ringgroupName == resRinggroupName) {
                continue;
            }

            obj["text"] = resRinggroupName;
            obj["val"] = res[i]["extension"];
        } else if (type == "vmgroup") {
            obj["text"] = res[i]["vmgroup_name"];
            obj["val"] = res[i]["extension"];
        } else if (type == "ivr") {
            obj["text"] = res[i]["ivr_name"];
            obj["val"] = res[i]["ivr_id"];
        } else {
            obj["val"] = res[i];
        }

        arr.push(obj);
    }

    if (type == "voicemail") {
        arr.unshift({
            text: $P.lang("LANG2223"),
            val: "yes"
        })
    }

    return arr;
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
            obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.ringgroupExtList);
        }

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transExtensionLDAPData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            member = res[i].split('#');

        obj["val"] = res[i];
        obj["text"] = member[0] + '(' + member[1].split(',')[0] + ')';

        if (obj) {
            arr.push(obj);
        }
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
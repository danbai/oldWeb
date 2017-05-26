/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    mode = gup.call(window, "mode"),
    selectbox = UCMGUI.domFunction.selectbox,
    enableCheckBox = UCMGUI.domFunction.enableCheckBox,
    oldTrunkName = "",
    trunkId = "",
    trunk_index = "",
    type = "";

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.indexOf = top.Array.prototype.indexOf;

$(function() {
    initForm();

    if (mode == 'edit') {
        type = "edit";
        trunkType = decodeURIComponent(gup.call(window, "trunkType"));
        trunkId = gup.call(window, "trunkId");
        hideCallee(trunkType);
        getDigitalTrunk(trunkId);

    } else {
        type = "add";
        optionIsDisabled();
        getDigitalHardwareSettings();
    }

    $P.lang(doc, true);
    initValidator();

    top.Custom.init(doc);
});

function getDigitalHardwareSettings() {
    $.ajax({
        type: "GET",
        url: "../cgi?action=getDigitalHardwareSettings",
        dataType: 'json',
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
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
                var sDigitalType = data.response.digital_driver_settings[0].signalling;

                hideCallee(sDigitalType);
            }
        }
    });
}

function checkIfStartWithNumber(val, ele) {
    var regStartWithNumber = /^([\d])/;

    if (val && !regStartWithNumber.test(val)) {
        return false;
    }

    return true;
}

function initForm() {
    selectbox.appendOpts({
        el: "group_index",
        opts: mWindow.digitalGroupList
    }, doc);
    tectFax();
}

function tectFax() {
    var accountList = UCMGUI.isExist.getList("listAccount").account,
        faxList = UCMGUI.isExist.getList("listFax").fax,
        str = '',
        ele;

    for (var i = 0; i < accountList.length; i++) {
        ele = accountList[i];

        if (ele.account_type.match(/FXS/i)) {
            str += '<option value="' + ele.extension + '">' + ele.extension + '</option>';
        }
    }

    for (var i = 0; i < faxList.length; i++) {
        ele = faxList[i];

        str += '<option value="' + ele.extension + '">' + ele.extension + '</option>';

    }

    $('#fax_intelligent_route_destination').append(str);
    $('#faxdetect').bind('change', function(event) {
        if ($(this).is(':checked')) {
            $('#detect_div').show();
        } else {
            $('#detect_div').hide();
        }
    });
    enableCheckBox({
        enableCheckBox: 'fax_intelligent_route',
        enableList: ['fax_intelligent_route_destination']
    }, doc);
}

function trunkNameIsExist(value, element) {
    var trunkName = $("#trunk_name").val(),
        trunkNameList = mWindow.trunkNameList,
        tmpTrunkNameList = [];

    tmpTrunkNameList = trunkNameList.copy(tmpTrunkNameList);

    if (oldTrunkName) {
        tmpTrunkNameList.remove(oldTrunkName);
    }

    return !UCMGUI.inArray(trunkName, tmpTrunkNameList);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "trunk_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                isExist: [$P.lang('LANG2137'), trunkNameIsExist]
            },
            "callerid": {
                // customCallback: [$P.lang("LANG2787"), checkIfStartWithNumber],
                digits: true
            },
            "cidname": {
                minlength: 2,
                alphanumeric: true // Unknown validation
            },
            "group_index": {
                required: true
            }
        },
        submitHandler: function() {
            var action = {};

            action = UCMGUI.formSerializeVal(document);

            action["action"] = (mode == 'edit' ? "updateDigitalTrunk" : "addDigitalTrunk");

            if (mode == "edit") {
                action["trunk"] = trunkId;
            } else {
                action["technology"] = "PRI";
            }

            updateOrAddTrunkInfo(action);
        }
    });
}

function updateOrAddTrunkInfo(action) {
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
                        mWindow.$("#trunks-digital-list", mWindow.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

function getDigitalTrunk(trunkId) {
    var action = {
        "action": "getDigitalTrunk",
        "trunk": trunkId
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
                var analogtrunk = data.response.trunk;

                oldTrunkName = analogtrunk.trunk_name;
                trunkgroup = analogtrunk.trunkgroup;
                trunk_index = analogtrunk.trunk_index;

                UCMGUI.domFunction.updateDocument(analogtrunk, document);

                if ($('#fax_intelligent_route_destination').val() === null) {
                    $('#fax_intelligent_route_destination').val('no');
                }

                var groupIndex = analogtrunk.group_index;
                $('#faxdetect').trigger('change');
                $('#fax_intelligent_route_destination')[0].disabled = !$('#fax_intelligent_route')[0].checked;

                optionIsDisabled(groupIndex);

                top.Custom.init(doc);
            }
        }
    });
}

function optionIsDisabled(groupIndex) {
    var groupNameList = mWindow.groupNameList,
        groupIndexDom = $("#group_index"),
        options = groupIndexDom.children(),
        flag = true;

    for (var i = 0; i < options.length; i++) {
        var optionsIndex = options.eq(i);

        if (UCMGUI.inArray(optionsIndex.val(), groupNameList)) {
            optionsIndex.attr("disabled", true);
        } else if (flag && mode == "add") {
            flag = false;
            groupIndexDom.get(0).selectedIndex = i;
        }

        if (groupIndex && groupIndex == optionsIndex.val()) {
            optionsIndex.attr("disabled", false);
        }
    }
    if (options.not(":disabled").length == 0) {
        groupIndexDom.get(0).selectedIndex = -1;
    }
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj["text"] = "Group " + res[i]["trunkgroup"] + "(" + res[i]["trunk_name"] + ")";
        obj["val"] = res[i]["trunkgroup"];

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transSelectData(res) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        // obj["text"] = res[i];
        obj["val"] = res[i];

        arr.push(obj);
    }

    return arr;
}

function hideCallee(trunkType) {
    if (trunkType.match(/em/i)) {
        $(".hide_callee").hide();
    }
}

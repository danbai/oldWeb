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
    oldTrunkName = "",
    trunkId = "",
    trunk_index = "",
    type = "",
    nethdlc = [];

String.prototype.format = top.String.prototype.format;

$(function() {
    initForm();
    getNetHDLC();

    $P.lang(doc, true);
    initValidator();

    top.Custom.init(doc);
});

function initForm() {
    $("#frDiv").hide();
    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "hdlc0__enable",
        enableList: "group_index"
    }, doc);
    selectbox.appendOpts({
        el: "group_index",
        opts: mWindow.digitalGroupList
    }, doc);
    $("#hdlc0__encapsulation").change(function(ev) {
        if (this.value == "fr") {
            $("#frDiv").show();
        } else {
            $("#frDiv").hide();
        }
        top.dialog.repositionDialog("none");
    });
    $("#hdlc0__fr__lmitype").change(function(ev) {
        var dceEle = $("#hdlc0__fr__dce");
        if (this.value == "none") {
            dceEle.val("0").attr("disabled", true);
        } else {
            dceEle.attr("disabled", false);
        }
        top.Custom.init(doc, dceEle[0]);
        top.dialog.repositionDialog("none");
    });
}

function getNetHDLC() {
    var netHDLCSettings = mWindow.netHDLCSettings[0];
    var groupIndex = netHDLCSettings.group_index;
    //groupIndex = groupIndex == 0 ? "" : groupIndex;
    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: false,
        data: {
            action: "getNetHDLC" //,
            //nethdlc: groupIndex
        },
        success: function(data) {
            if (data.status == 0) {
                nethdlc = data.response.nethdlc_settings;

                if (nethdlc) {
                    UCMGUI.domFunction.updateDocument(nethdlc, document);
                    var groupIndex = nethdlc.group_index;
                    var hdlc0Enable = $("#hdlc0__enable");
                    var groupIndexDom = $("#group_index");

                    groupIndexDom.val(groupIndex);
                    optionIsDisabled(groupIndex);
                    $("#hdlc0__default").get(0).checked = nethdlc.hdlc0__default == 1 ? true : false;
                    hdlc0Enable.get(0).checked = nethdlc.hdlc0__enable == 1 ? true : false;
                    hdlc0Enable.get(0).updateStatus();
                    if (!hdlc0Enable.is(":checked")) {
                        groupIndexDom.get(0).selectedIndex = -1;
                    }
                    $("#hdlc0__encapsulation").trigger("change");
                    $("#hdlc0__fr__lmitype").trigger("change");
                }
            }
        }
    });
}

function isR2EM() {
    var signallingType = mWindow.signallingType;
    if (signallingType == "mfcr2" || signallingType == "em" || signallingType == "em_w") {
        return false;
    } else {
        return true;
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "group_index": {
                required: true,
                customCallback: [$P.lang("LANG3985"), isR2EM]
            },
            "hdlc0__fr__dlci": {
                range: [1, 1023]
            },
            "hdlc0__localip": {
                required: true,
                ipDns: ["IP"],
                customCallback: [$P.lang("LANG3263").format($P.lang("LANG3565"), $P.lang("LANG3568")),
                    function() {
                        return $("#hdlc0__localip").val() != $("#hdlc0__remoteip").val();
                    }
                ]
            },
            "hdlc0__netmask": {
                required: true,
                mask: [$P.lang("LANG157")]
            },
            "hdlc0__remoteip": {
                required: true,
                ipDns: ["IP"],
                customCallback: [$P.lang("LANG3263").format($P.lang("LANG3568"), $P.lang("LANG3565")),
                    function() {
                        return $("#hdlc0__remoteip").val() != $("#hdlc0__localip").val();
                    }
                ]
            },
            "hdlc0__dns1": {
                required: true,
                ipDns: [$P.lang("LANG579")]
            },
            "hdlc0__dns2": {
                ipDns: [$P.lang("LANG579")]
            }
        },
        submitHandler: function() {
            var groupIndex = nethdlc.group_index,
                action = {},
                hdlc0Enable = $("#hdlc0__enable"),
                isChecked = hdlc0Enable.is(":checked");
            action = UCMGUI.formSerializeVal(document);
            if ($("#hdlc0__fr__dce").is(":disabled")) {
                action["hdlc0__fr__dce"] = $("#hdlc0__fr__dce").val();
            }
            action["action"] = "updateNetHDLC";
            action["group_index"] = $("#group_index").val();
            //action["nethdlc"] = groupIndex == 0 ? "" : groupIndex;
            action["hdlc0__default"] = $("#hdlc0__default").is(":checked") == true ? 1 : 0;
            action["hdlc0__enable"] = hdlc0Enable.is(":checked") == true ? 1 : 0;
            if (!isChecked) {
                action["group_index"] = "";
            }
            updateNetHDLC(action);
        }
    });
}

function updateNetHDLC(action) {
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
                if (isChange()) {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG927"),
                        buttons: {
                            ok: applyChangeAndReboot,
                            cancel: function() {
                                mWindow.initTable();
                                mWindow.listDigitalGroup();
                            }
                        }
                    });
                } else {
                    top.dialog.clearDialog();
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG815"),
                        callback: function() {
                            mWindow.initTable();
                            mWindow.listDigitalGroup();
                        }
                    });
                }
                mWindow.getNetHDLC();
            }
        }
    });
}

function applyChangeAndReboot() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG832")
    });
    // delete interval while reboot.
    if (top.$.gsec && top.$.gsec.stopSessionCheck) {
        top.$.gsec.stopSessionCheck();
    }

    $(document).unbind('mousemove mouseenter scroll keydown click dblclick');
    top.window.clearInterval(top.loginInterval);
    top.loginInterval = null;

    mWindow.clearInterval(mWindow.retryTimeout);
    mWindow.retryTimeout = null;
    mWindow.retryFlag = true;

    //$.ajax({
        //url: UCMGUI.config.paths.baseServerURl + "?action=applyChanges&settings",
        //type: "GET",
        //success: function(data) {
    UCMGUI.loginFunction.confirmReboot();
        //}
    //});
}

function isChange() {
    var eleArr = ["hdlc0__fr__lmitype", "hdlc0__fr__dlci", "hdlc0__fr__dce", "hdlc0__localip", "hdlc0__netmask", "hdlc0__remoteip", "hdlc0__dns1", "hdlc0__dns2"];
    var hdlc0DefaultVal = $("#hdlc0__default").is(":checked") ? 1 : 0;
    var hdlc0EnableVal = $("#hdlc0__enable").is(":checked") ? 1 : 0;
    var groupIndexVal = $("#group_index").val();
    var bool = false;

    if ((hdlc0EnableVal != nethdlc["hdlc0__enable"]) || (hdlc0DefaultVal != nethdlc["hdlc0__default"]) || ($("#hdlc0__encapsulation").val() != nethdlc["hdlc0__encapsulation"])) {
        bool = true;
    } else if ($("#hdlc0__enable").is(":checked") && groupIndexVal != nethdlc["group_index"]) {
        bool = true;
    } else {
        for (var i = 0; i < eleArr.length; i++) {
            var eleArrIndex = eleArr[i];
            if ($("#" + eleArrIndex).val() != nethdlc[eleArrIndex]) {
                bool = true;
            }
        }
    }

    return bool;
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
    if (!groupIndex) {
        groupIndexDom.get(0).selectedIndex = -1;
    }
}
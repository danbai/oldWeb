/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    groupInfo = {},
    type = "",
    span = "",
    originSpanType = '',
    bchanTotalChans = "",
    oldDigitalGroupName = "",
    oldGroupName = "",
    oldSingnaling = "",
    oldFraming = "",
    oldCoding = "",
    digitalHardwareSettingsAction = {},
    groupIndex = "",
    oldHardhdlc = "",
    otherArr = [],
    lastOtherArr = [],
    allGroupArr = [];

String.prototype.format = top.String.prototype.format;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.indexOf = top.Array.prototype.indexOf;

$(function() {
    $P.lang(doc, true);

    type = gup.call(window, "type");
    span = gup.call(window, "span");

    initValidator();

    if (type == "PRI") {
        loadDigitalList();
    } else if (type == "addGroup") {
        addGroup();
        generateGroupIndex();
    } else if (type == "editGroup") {
        editGroup();
    }

    $.navSlide(false, false, true, true);
});

/*function navSlide() {
    var aSettings = $(".settings"),
        aLi = $("#nav_settings").find("li"),
        oAdvance = aLi.eq(1);

    aLi.on('click', function() {
        if ($(this).hasClass("current")) {
            return;
        }
        if (!$P("#form", document).valid()) {
            $("input[titles],select[titles],textarea[titles]").focus();
            return;
        }
        var index = $(this).index();
        $(this).addClass("current").siblings().removeClass("current");
        aSettings.eq(index).addClass("current_position").siblings().removeClass("current_position");
    });

    $("#signalling").on('change', function() {
        oAdvance.find("a").animate({
            "margin-top": "-=4px"
        }, 100, function() {
            $(this).animate({
                "margin-top": "+=4px"
            }, 100);
        })
    });
}*/

function checkIfDefaultName(val, ele) {
    var isDefault = true;

    if (val.indexOf('DefaultGroup') > -1) {
        isDefault = false;
    }

    return isDefault;
}

function digitalGroupNameIsExist() {
    var digitalGroupName = $("#digital_group_name").val(),
        digitalGroupNameList = [],
        digitalGroup = mWindow.digitalGroup,
        groupInfoSpan = JSON.parse(decodeURI(span)).span;

    for (var i = 0; i < digitalGroup.length; i++) {
        var digitalGroupIndex = digitalGroup[i];

        if (groupInfoSpan == digitalGroupIndex.span) {
            digitalGroupNameList.push(digitalGroupIndex.group_name);
        }
    }

    var tmpDigitalGroupNameList = [];

    tmpDigitalGroupNameList = digitalGroupNameList.copy(tmpDigitalGroupNameList);

    if (oldDigitalGroupName) {
        tmpDigitalGroupNameList.remove(oldDigitalGroupName);
    }

    return !UCMGUI.inArray(digitalGroupName, tmpDigitalGroupNameList);
}

function generateGroupIndex() {
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            'action': 'getAvailableDAHDIGroupIndex',
            'group_index': ''
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                groupIndex = data.response.group_index;
            }
        }
    });
}

function groupNameIsExist() {
    var groupName = $("#group_name").val(),
        groupNameList = [],
        group = {},
        spanType = JSON.parse(decodeURI(span)).spanType;

    if (spanType == "e1") {
        group = mWindow.digitalGroupE1;
    } else if (spanType == "t1") {
        group = mWindow.digitalGroupT1;
    } else if (spanType == "j1") {
        group = mWindow.digitalGroupJ1;
    }

    for (var i = 0; i < group.length; i++) {
        var groupIndex = group[i];
        groupNameList.push(groupIndex.group_name);
    }

    var tmpGroupNameList = [];

    tmpGroupNameList = groupNameList.copy(tmpGroupNameList);

    if (oldGroupName) {
        tmpGroupNameList.remove(oldGroupName);
    }

    return !UCMGUI.inArray(groupName, tmpGroupNameList);
}

function isChangeSignalling() {
    var signallingVal = $("#signalling").val();
    if (signallingVal == "mfcr2" || signallingVal == "em" || signallingVal == "em_w") {
        var hardhdlc = $("#hardhdlc").val(),
            dataTrunkChannelListArr = mWindow.dataTrunkChannelList.toString().split(","),
            totalArr = getTotalArr(dataTrunkChannelListArr);

        if (totalArr.length != 0) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

function isChangeSignallingForDataTrunk() {
    var signallingVal = $("#signalling").val(),
        hardhdlc = $("#hardhdlc").val(),
        dataTrunkChannelListArr = mWindow.dataTrunkChannelList.toString().split(","),
        totalArr = getTotalArr(dataTrunkChannelListArr);

    if (totalArr.indexOf(hardhdlc) != -1) {
        return false;
    } else {
        return true;
    }
}

function isRangeDataTrunkChannel() {
    var hardhdlc = $("#hardhdlc").val(),
        dataTrunkChannelListArr = mWindow.dataTrunkChannelList.toString().split(","),
        totalArr = getTotalArr(dataTrunkChannelListArr);

    if (totalArr.indexOf(hardhdlc) != -1) {
        return false;
    } else {
        return true;
    }
}

function initValidator() {
    var totleChans = getTotalChans();

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "digital_group_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                customCallback: [$P.lang("LANG2786"), checkIfDefaultName],
                isExist: [$P.lang('LANG270').format($P.lang('LANG2887')), digitalGroupNameIsExist]
            },
            "group_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                customCallback: [$P.lang("LANG2786"), checkIfDefaultName],
                isExist: [$P.lang('LANG270').format($P.lang('LANG2887')), groupNameIsExist]
            },
            "requiredAndDigits": {
                required: true,
                digits: true
            },
            "signalling": {
                required: true,
                customCallback: [$P.lang("LANG3979"), isChangeSignalling]
            },
            "em_rxwink": {
                required: true,
                digits: true,
                range: [100, 500]
            },
            "emoutbandcalldialdelay": {
                required: true,
                digits: true,
                range: [50, 500]
            },
            "pointcode": {
                required: true,
                //digits: true,
                customCallback: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
                    function() {
                        return !($("#pointcode").val() == $("#defaultdpc").val());
                    }
                ],
                customCallback2: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
                    function() {
                        return !($("#pointcode").val() == $("#defaultdpc").val());
                    }
                ]
            },
            "defaultdpc": {
                required: true,
                // digits: true,
                customCallback: [$P.lang("LANG3263").format($P.lang("LANG3259"), $P.lang("LANG3257")),
                    function() {
                        return !($("#defaultdpc").val() && $("#pointcode").val() == $("#defaultdpc").val());
                    }
                ]
            },
            "cicbeginswith": {
                required: true,
                digits: true,
                range: function() {
                    if ($("#span_type").val() === "E1") {
                        return ($('#ss7type').val() === 'ansi') ? [0, 16353] : [0, 4065];
                    }

                    return ($('#ss7type').val() === 'ansi') ? [0, 16360] : [0, 4072];
                }
            },
            "hardhdlc": {
                required: true,
                digits: true,
                customCallback: [$P.lang("LANG3969"), isRangeDataTrunkChannel]

            },
            "mfcr2_get_ani_first": {
                customCallback: [$P.lang("LANG3370").format($P.lang("LANG3292"), $P.lang("LANG3315")),
                    function(val, ele) {
                        return !($("#mfcr2_get_ani_first").is(":checked") && $("#mfcr2_skip_category").is(":checked"));
                    }
                ]
            },
            "mfcr2_skip_category": {
                customCallback: [$P.lang("LANG3370").format($P.lang("LANG3315"), $P.lang("LANG3292")),
                    function(val, ele) {
                        return !($("#mfcr2_get_ani_first").is(":checked") && $("#mfcr2_skip_category").is(":checked"));
                    }
                ]
            },
            "mfcr2_mfback_timeout": {
                required: true,
                customCallback: [$P.lang("LANG2157"),
                    function(val, ele) {
                        return /\d+$/.test(val);
                    }
                ],
                customCallback1: [$P.lang("LANG3265").format("-1", "500", "5000"),
                    function(val, ele) {
                        val = Number(val);
                        return val == -1 || (val >= 500 && val <= 5000);
                    }
                ]
            },
            "mfcr2_metering_pulse_timeout": {
                required: true,
                customCallback: [$P.lang("LANG2157"),
                    function(val, ele) {
                        return /\d+$/.test(val);
                    }
                ],
                range: [-1, 500]
            },
            "mfcr2_double_answer_timeout": {
                required: true,
                customCallback: [$P.lang("LANG2157"),
                    function(val, ele) {
                        return /\d+$/.test(val);
                    }
                ],
                range: [-1, 500]
            },
            "internationalprefix": {
                numberOrExtension: true
            },
            "nationalprefix": {
                numberOrExtension: true
            },
            "subscriberprefix": {
                numberOrExtension: true
            },
            "localprefix": {
                numberOrExtension: true
            },
            "privateprefix": {
                numberOrExtension: true
            },
            "unknownprefix": {
                numberOrExtension: true
            },
            "pri_timer_t310": {
                required: true,
                digits: true,
                range: [8, 60]
            }
        },
        submitHandler: function() {
            $(".settings").not(".current_position").addClass("none_position");
            saveChanges();
        }
    });
}

function loadDigitalList() {
    var priSettings = mWindow.priSettings,
        ss7Settings = mWindow.ss7Settings[0],
        mfcR2Settings = mWindow.mfcR2Settings[0],
        priSettingsInfo = {};

    $("#edit_digitals_container").css({
        "display": "inline-block"
    });

    for (var i = 0; i < priSettings.length; i++) {
        var priSettingsIndex = priSettings[i];

        if (priSettingsIndex.span == span) {
            priSettingsInfo = priSettingsIndex;
            $("#span_type").val(priSettingsInfo.span_type);
            originSpanType = priSettingsInfo.span_type;
            oldDigitalGroupName = priSettingsInfo.digital_group_name;
            oldSingnaling = priSettingsInfo.signalling;
            oldFraming = priSettingsInfo.framing;
            oldCoding = priSettingsInfo.coding;
            oldHardhdlc = priSettingsInfo.hardhdlc;
        }
    }

    var totleChans = getTotalChans(),
        opts = [],
        dataTrunkChansArr = getDataTrunkChansArr(),
        allChansArr = getTotalArr(dataTrunkChansArr);
    if ((allChansArr.length + 1) >= totleChans) {
        opts = [{
            text: $P.lang("LANG133"),
            val: "0"
        }];
    }
    for (var i = 1; i <= totleChans; i++) {
        opts.push({
            val: i
        });
    }
    selectbox.appendOpts({
        el: "hardhdlc",
        opts: opts
    }, doc);

    $("#hardhdlc").change(function(ev) {
        $P("#hardhdlc", document).valid();
        ev.stopPropagation();
    });

    $('#mfcr2_get_ani_first').change(function(ev, text) {
        if (this.checked) {
            $('#mfcr2_skip_category').attr('checked', false);
            $('#mfcr2_skip_category').attr('disabled', true);
        } else {
            $('#mfcr2_skip_category').attr('disabled', false);
        }
        if (text == undefined) {
            top.Custom.init(doc, $("#mfcr2_skip_category").get(0));
        }
    });

    $('#mfcr2_skip_category').change(function(ev, text) {
        if (this.checked) {
            $('#mfcr2_get_ani_first').attr('checked', false);
            $('#mfcr2_get_ani_first').attr('disabled', true);
        } else {
            $('#mfcr2_get_ani_first').attr('disabled', false);
        }
        if (text == undefined) {
            top.Custom.init(doc, $("#mfcr2_get_ani_first").get(0));
        }
    });
    $("#signalling").bind("change", function(ev, text) {
        var value = $(this).val(),
            hardhdlcEle = $("#hardhdlc"),
            hardhdlcDiv = $("#hardhdlcDiv"),
            opts = hardhdlcEle.children(),
            noneOpt = hardhdlcEle.children().filter("[value=0]"),
            flag = true;

        if (value == "ss7") {
            var totleChans = getTotalChans(),
                dataTrunkChansArr = getDataTrunkChansArr(),
                allChansArr = getTotalArr(dataTrunkChansArr);
            hardhdlcDiv.show();

            if ((allChansArr.length + 1) >= totleChans && noneOpt.length == 0) {
                hardhdlcEle.prepend("<option value='0'>" + $P.lang("LANG133") + "</option>");
            } else if ((allChansArr.length + 1) < totleChans) {
                noneOpt.remove();
            }
            for (var i = 0; i < opts.length; i++) {
                var index = opts[i];
                index.disabled = false;
            };
            var ss7Settings = mWindow.ss7Settings[0];
            if (ss7Settings) {
                $("#ss7_called_nai").val(ss7Settings["ss7_called_nai"]);
                $("#ss7_calling_nai").val(ss7Settings["ss7_calling_nai"]);
                $("#internationalprefix").val(ss7Settings["ss7_internationalprefix"]);
                $("#nationalprefix").val(ss7Settings["ss7_nationalprefix"]);
                $("#subscriberprefix").val(ss7Settings["ss7_subscriberprefix"]);
                $("#unknownprefix").val(ss7Settings["ss7_unknownprefix"]);
                //$("#cicbeginswith").val(ss7Settings["cicbeginswith"]);
                //top.Custom.init(document, $(".prioptions").get(0));
            }
            $("#ss7Options, #callerIdPrefix, #SS7dialplanDIV, #codecDiv, #subscriberprefixDiv, #lboDiv, #rtxDiv").show();
            $("#mfcR2Div, #priT310Div, #switchtypeDiv, #localprefixDiv, #privateprefixDiv, #specialDiv, #pridialplanDIV, #channelDiv, #R2Advanced, #otherAdvanced_btn, #priPlayLocalRbtDiv, #mfcr2PlayLocaRbtDiv, #em_immediate_div, #em_w_outgoing").hide();
        } else if (value == "mfcr2") {
            hardhdlcDiv.hide();
            $("#mfcR2Div, #channelDiv, #R2Advanced, #otherAdvanced_btn, #mfcr2PlayLocaRbtDiv, #lboDiv, #rtxDiv").show();
            $("#specialDiv, #priT310Div, #ss7Options, #switchtypeDiv, #callerIdPrefix, #pridialplanDIV, #SS7dialplanDIV, #codecDiv, #priPlayLocalRbtDiv, #em_immediate_div, #em_w_outgoing").hide();
        } else if (value == "em" || value == "em_w") {
            $("#em_immediate_div").show();
            if (value === "em_w") {
                $("#em_w_outgoing").show();
            } else {
                $("#em_w_outgoing").hide();
            }
            hardhdlcDiv.hide();
            flag = false;
            $("#mfcR2Div, #priT310Div, #ss7Options, #lboDiv, #R2Advanced, #otherAdvanced_btn, #subscriberprefixDiv, #priPlayLocalRbtDiv, #mfcr2PlayLocaRbtDiv, #SS7dialplanDIV, #callerIdPrefix, #switchtypeDiv, #pridialplanDIV, #specialDiv").hide();
        } else {
            var totleChans = getTotalChans(),
                dataTrunkChansArr = getDataTrunkChansArr(),
                allChansArr = getTotalArr(dataTrunkChansArr);
            hardhdlcDiv.show();
            if ((allChansArr.length + 1) >= totleChans && noneOpt.length == 0) {
                hardhdlcEle.prepend("<option value='0'>" + $P.lang("LANG133") + "</option>");
            } else if ((allChansArr.length + 1) < totleChans) {
                noneOpt.remove();
            }
            for (var i = 0; i < opts.length; i++) {
                var index = opts[i];
                index.disabled = false;
            };
            UCMGUI.domFunction.updateDocument(priSettingsInfo, $(".prioptions").get(0));

            $("#mfcR2Div, #ss7Options, #R2Advanced, #otherAdvanced_btn, #subscriberprefixDiv, #SS7dialplanDIV, #mfcr2PlayLocaRbtDiv, #em_immediate_div, #em_w_outgoing").hide();
            $("#switchtypeDiv, #priT310Div, #localprefixDiv, #privateprefixDiv, #specialDiv, #channelDiv, #callerIdPrefix, #pridialplanDIV, #codecDiv, #priPlayLocalRbtDiv, #lboDiv, #rtxDiv").show();
            if ($("#span_type").val() == "E1") {
                $("#crcDiv").show();
            }
            if ($("#span_type").val() == "T1" || $("#span_type").val() == "J1") {
                $("#crcDiv").hide();
            }
        }

        if ($("#span_type").val() == "E1") {
            var opts;

            if (hardhdlcEle.children().filter("[value=" + oldHardhdlc + "]").length != 0) {
                hardhdlcEle.val(oldHardhdlc);
            } else {
                hardhdlcEle.val(16);
            }

            if (value === 'mfcr2') {
                opts = [{
                    val: "cas"
                }];
            } else {
                opts = [{
                    val: "ccs"
                }];
            }

            selectbox.appendOpts({
                el: "framing",
                opts: opts
            }, doc);

            opts = [];
        }
        if (($("#span_type").val() == "T1" || $("#span_type").val() == "J1") && flag) {
            if (hardhdlcEle.children().filter("[value=" + oldHardhdlc + "]").length != 0) {
                hardhdlcEle.val(oldHardhdlc);
            } else {
                hardhdlcEle.val(24);
            }
        }

        $("#coding").val(oldCoding);
        if (value == "mfcr2") {
            hardhdlcEle.val("16");
        } else if (value == "em" || value == "em_w") {
            hardhdlcEle.val(0);
        }
        var val = $("#span_type").val();
        if (val == "T1" || val == "J1") {
            if (oldCoding == "hdb3") {
                $('#coding').val("b8zs");
            }
        } else {
            if (oldCoding == "b8zs") {
                $('#coding').val("hdb3");
            }
        }
        oldSingnaling = value;
        if (text == undefined) {
            top.Custom.init(doc);
        }

        top.dialog.currentDialogType = "iframe";
        top.dialog.repositionDialog();

        ev.stopPropagation();
    });

    $('#framing').on('change', function() {
        oldFraming = $(this).val();
    });

    $("#mfcr2_variant").bind("change", function(ev, text) {
        var val = $(this).val(),
            collectCallOption = $("#mfcr2_category option[value='collect_call']");

        if (val == "br") {
            collectCallOption.attr("disabled", false);
            $("#mfcr2ForcedReleaseDiv").show();

        } else {
            if ($("#mfcr2_category").val() == "collect_call") {
                $("#mfcr2_category").val("national_subscriber");
            }
            collectCallOption.attr("disabled", true);
            $("#mfcr2ForcedReleaseDiv").hide();
        }
        var mfcR2Settings = mWindow.mfcR2Settings[0];
        resetCheckbox(text);

        if (val == "ve") {
            $("#mfcr2_get_ani_first").get(0).checked = true;
            $("#mfcr2_get_ani_first").trigger("change", text);
        }

        if (mfcR2Settings) {
            if ($("#mfcr2_variant").val() == mfcR2Settings.mfcr2_variant) {
                var mfcr2GetAniFirstVal = (mfcR2Settings.mfcr2_get_ani_first == "yes") ? true : false;
                var mfcr2AllowCollectCallsVal = (mfcR2Settings.mfcr2_allow_collect_calls == "yes") ? true : false;
                var mfcr2DoubleAnswerVal = (mfcR2Settings.mfcr2_double_answer == "yes") ? true : false;
                //var mfcr2ImmediateAcceptVal = (mfcR2Settings.mfcr2_immediate_accept == "yes") ? true : false;
                var mfcr2AcceptOnOfferVal = (mfcR2Settings.mfcr2_accept_on_offer == "yes") ? true : false;
                var mfcr2SkipCategoryVal = (mfcR2Settings.mfcr2_skip_category == "yes") ? true : false;
                var mfcr2ChargeCallsVal = (mfcR2Settings.mfcr2_charge_calls == "yes") ? true : false;

                $("#mfcr2_get_ani_first").get(0).checked = mfcr2GetAniFirstVal;
                $("#mfcr2_category").val(mfcR2Settings.mfcr2_category);
                $("#mfcr2_allow_collect_calls").get(0).checked = mfcr2AllowCollectCallsVal;
                $("#mfcr2_double_answer").get(0).checked = mfcr2DoubleAnswerVal;
                //$("#mfcr2_immediate_accept").get(0).checked = mfcr2ImmediateAcceptVal;
                $("#mfcr2_accept_on_offer").get(0).checked = mfcr2AcceptOnOfferVal;
                $("#mfcr2_skip_category").get(0).checked = mfcr2SkipCategoryVal;
                $("#mfcr2_charge_calls").get(0).checked = mfcr2ChargeCallsVal;

                $("#mfcr2_mfback_timeout").val(mfcR2Settings.mfcr2_mfback_timeout);
                $("#mfcr2_metering_pulse_timeout").val(mfcR2Settings.mfcr2_metering_pulse_timeout);

                $("#mfcr2_get_ani_first").trigger("change", text);
                $("#mfcr2_skip_category").trigger("change", text);
                $("#mfcr2_double_answer").trigger("change", text);

                $("#mf_advanced_settings")[0].checked = (mfcR2Settings.mf_advanced_settings == "yes") ? true : false;
                $("#mf_advanced_settings")[0].updateStatus();
            } else {
                $("#mf_advanced_settings")[0].checked = false;
                $("#mf_advanced_settings")[0].updateStatus();
            }
        }

        $("#advanced_area").text(":" + $(this).find("option:selected").text());

        if (text == undefined) {
            top.Custom.init(doc);
        }

        ev.stopPropagation();
    });
    $("#mfcr2_double_answer").bind("change", function(ev) {
        if ($(this).is(":checked")) {
            $("#mfcr2DoubleSnswerTimeoutDiv").show();
        } else {
            $("#mfcr2DoubleSnswerTimeoutDiv").hide();
        }

        ev.stopPropagation();
    });

    $("#span_type").bind("change", function(ev, text) {
        var hardhdlcEle = $("#hardhdlc"),
            signalling = $('#signalling').val(),
            opts;

        if ($(this).val() == "E1") {

            bchanTotalChans = 31;
            hardhdlcEle.val(bchanTotalChans);
            //$("#hardhdlc").val(16).trigger("change");

            if (signalling === 'mfcr2') {
                opts = [{
                    val: "cas"
                }];
            } else {
                opts = [{
                    val: "ccs"
                }];
            }

            selectbox.appendOpts({
                el: "framing",
                opts: opts
            }, doc);
            opts = [];
            var dataTrunkChansArr = getDataTrunkChansArr();
            var allChansArr = getTotalArr(dataTrunkChansArr);
            if (((allChansArr.length + 1) == bchanTotalChans) || (allChansArr.length == bchanTotalChans)) {
                opts = [{
                    text: $P.lang("LANG133"),
                    val: "0"
                }];
            }
            for (var i = 1; i <= bchanTotalChans; i++) {
                opts.push({
                    val: i
                });
            }
            hardhdlcEle.empty();
            selectbox.appendOpts({
                el: "hardhdlc",
                opts: opts
            }, doc);
            hardhdlcEle.val(oldHardhdlc);

            opts = [{
                val: "hdb3",
                text: "HDB3"
            }, {
                val: "ami",
                text: "AMI"
            }];

            selectbox.appendOpts({
                el: "coding",
                opts: opts
            }, doc);

            opts = [{
                text: "None",
                val: "none"
            }, {
                val: "crc4",
                text: "CRC4"
            }];

            selectbox.appendOpts({
                el: "crc",
                opts: opts
            }, doc);

            opts = [{
                val: "pri_net",
                text: "PRI_NET"
            }, {
                val: "pri_cpe",
                text: "PRI_CPE"
            }, {
                val: "ss7",
                text: "SS7"
            }, {
                val: "mfcr2",
                text: "MFC/R2"
            }];

            selectbox.appendOpts({
                el: "signalling",
                opts: opts
            }, doc);

            $("#switchtype").val("euroisdn");

            $('#crcDiv').css({
                "display": "block"
            });
        } else if ($(this).val() == "T1" || $(this).val() == "J1") {

            bchanTotalChans = 24;
            var opts = [{
                val: "esf"
            }, {
                val: 'd4'
            }];

            selectbox.appendOpts({
                el: "framing",
                opts: opts
            }, doc);

            if (hardhdlcEle.children().length > 25) {
                hardhdlcEle.empty();
                opts = [];
                var dataTrunkChansArr = getDataTrunkChansArr(),
                    allChansArr = getTotalArr(dataTrunkChansArr);
                if ((allChansArr.length + 1) == bchanTotalChans) {
                    opts = [{
                        text: $P.lang("LANG133"),
                        val: "0"
                    }];
                }
                for (var i = 1; i <= bchanTotalChans; i++) {
                    opts.push({
                        val: i
                    });
                }
                selectbox.appendOpts({
                    el: "hardhdlc",
                    opts: opts
                }, doc);
                hardhdlcEle.val(oldHardhdlc);
            }

            opts = [{
                val: "b8zs",
                text: "B8ZS"
            }, {
                val: "ami",
                text: "AMI"
            }];

            selectbox.appendOpts({
                el: "coding",
                opts: opts
            }, doc);

            opts = [{
                val: "none"
            }];

            selectbox.appendOpts({
                el: "crc",
                opts: opts
            }, doc);

            opts = [{
                val: "pri_net",
                text: "PRI_NET"
            }, {
                val: "pri_cpe",
                text: "PRI_CPE"
            }, {
                val: "ss7",
                text: "SS7"
            }, {
                val: "em",
                text: "E&M Immediate"
            }, {
                val: "em_w",
                text: "E&M Wink"
            }];

            if ($(this).val() === "J1") {
                opts.length = 3;
            }

            selectbox.appendOpts({
                el: "signalling",
                opts: opts
            }, doc);

            $("#switchtype").val("national");

            $('#crcDiv').hide();
            var hardhdlc = hardhdlcEle.val();
            if (!text && (Number(hardhdlc) > 24)) {
                //top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG3968"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            }
        }
        if (!text && !isChangeSignallingForDataTrunk()) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG3978").format($("#hardhdlc").val()),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });
        }
        if (oldSingnaling) {
            if ($('#signalling').children().filter("[value='" + oldSingnaling + "']").length == 0) {
                $('#signalling').val("pri_net");
            } else {
                $('#signalling').val(oldSingnaling);
            }
        }
        $('#coding').val(oldCoding);
        top.Custom.init(doc, $("#hardhdlc")[0]);

        if ($(this).val() == "T1" || $(this).val() == "J1") {
            if (oldSingnaling == "mfcr2") {
                $('#signalling').val("pri_cpe");
            }
            //$('#coding').val("b8zs");

            if (oldFraming && oldFraming !== 'ccs' && oldFraming !== 'cas') {
                $('#framing').val(oldFraming);
            }
        }

        if ($(this).val() == "E1") {
            if (oldSingnaling == "em" || oldSingnaling == "em_w") {
                $('#signalling').val("pri_cpe");
            }
        }

        $('#signalling').trigger("change", text);

        top.dialog.currentDialogType = "iframe";
        top.dialog.repositionDialog();
        if (text == undefined) {
            top.Custom.init(doc);
        }
        ev.stopPropagation();

    }).trigger("change", "firstLoad");

    $('#ss7type').bind("change", function(ev) {
        if ($(this).val() == "itu") {
            $P("#pointcode, #defaultdpc", document).rules("remove", "customCallback1");
            $P("#pointcode", document).rules("add", {
                digits: true,
                range: [0, 16383],
                customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
                    function() {
                        return $("#pointcode").val() != $("#defaultdpc").val();
                    }
                ]
            });
            $P("#defaultdpc", document).rules("add", {
                digits: true,
                range: [0, 16383],
                customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3259"), $P.lang("LANG3257")),
                    function() {
                        return $("#defaultdpc").val() != $("#pointcode").val();
                    }
                ]
            });
            $P("#pointcode, #defaultdpc", document).valid();
        } else {
            $P("#pointcode", document).rules("remove", "digits range");
            $P("#defaultdpc", document).rules("remove", "digits range");
            $P("#pointcode", document).rules("add", {
                customCallback1: [$P.lang("LANG3459").format(0, 16777215, 0, 255),
                    function(val, ele) {
                        return (/^\d+$/.test(val) && (0 <= Number(val) && Number(val) <= 16777215)) || /^([0-9]|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/.test(val);
                    }
                ],
                customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3257"), $P.lang("LANG3259")),
                    function() {
                        return $("#pointcode").val() != $("#defaultdpc").val();
                    }
                ]
            });
            $P("#defaultdpc", document).rules("add", {
                customCallback1: [$P.lang("LANG3459").format(0, 16777215, 0, 255),
                    function(val, ele) {
                        if (val) {
                            return (/^\d+$/.test(val) && (0 <= Number(val) && Number(val) <= 16777215)) || /^([0-9]|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\-(([0-9])|([0-9]\d)|(0\d{2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/.test(val);
                        } else {
                            return true;
                        }
                    }
                ],
                customCallback3: [$P.lang("LANG3263").format($P.lang("LANG3259"), $P.lang("LANG3257")),
                    function() {
                        return $("#defaultdpc").val() != $("#pointcode").val();
                    }
                ]
            });
            $P("#pointcode, #defaultdpc", document).valid();
        }
        //$P("#pointcode, #defaultdpc", document).valid()
        ev.stopPropagation();
    });
    if (!mfcR2Settings) {
        UCMGUI.domFunction.setDfaltVal(document);
    }

    if (ss7Settings) {
        for (var key in ss7Settings) {
            if (ss7Settings.hasOwnProperty(key)) {
                priSettingsInfo[key] = ss7Settings[key];
            }
        }
    }
    if (mfcR2Settings) {
        for (var key in mfcR2Settings) {
            if (mfcR2Settings.hasOwnProperty(key)) {
                priSettingsInfo[key] = mfcR2Settings[key];
            }
        }
    }

    if (priSettingsInfo.mfcr2_category == "collect_call" && priSettingsInfo.mfcr2_variant != "br") {
        priSettingsInfo.mfcr2_category = "national_subscriber";
    }
    UCMGUI.domFunction.updateDocument(priSettingsInfo, document);
    // UCMGUI.domFunction.updateDocument(mWindow.ss7Settings[0], document);
    // UCMGUI.domFunction.updateDocument(mWindow.mfcR2Settings[0], document);
    /*if ($("#em_rxwink option[value=" + priSettingsInfo.em_rxwink + "]").length == 0) {
        UCMGUI.domFunction.setDfaltVal($("#em_immediate_div")[0]);
    }*/
    enableCheckBox("firstLoad");

    if ($("#mfcr2_double_answer").is(":checked")) {
        $("#mfcr2DoubleSnswerTimeoutDiv").show();
    } else {
        $("#mfcr2DoubleSnswerTimeoutDiv").hide();
        $("#mfcr2_double_answer_timeout").val("-1");
    }
    if ($("#mfcr2_variant").val() == "br") {
        $("#mfcr2ForcedReleaseDiv").show();
    } else {
        $("#mfcr2ForcedReleaseDiv").hide();
    }
    $('#ss7type').trigger("change");
    $("#signalling").trigger("change", "firstLoad");
    //$("#pridialplan").trigger("change");
    //$("#prilocaldialplan").trigger("change");
    $("#mfcr2_variant").trigger("change", "firstLoad");
    $("#mfcr2_double_answer").trigger("change");
    $('#mfcr2_get_ani_first').trigger("change", "firstLoad");
    $('#mfcr2_skip_category').trigger("change", "firstLoad");

    if (!mfcR2Settings) {
        var val = $("#mfcr2_variant").val();
        resetCheckbox("firstLoad");

        if (val == "ve") {
            $("#mfcr2_get_ani_first").get(0).checked = true;
            $("#mfcr2_get_ani_first").trigger("change");
        }
    }
    $("#switchtype").val(priSettingsInfo.switchtype);

    resetAdvanceDefault();

    top.Custom.init(doc);
}

function resetCheckbox(firstLoad) {
    $("#mfcr2_get_ani_first").get(0).checked = false;
    $("#mfcr2_mfback_timeout").val(-1);
    $("#mfcr2_metering_pulse_timeout").val(-1);
    $("#mfcr2_allow_collect_calls").get(0).checked = false;
    $("#mfcr2_double_answer").get(0).checked = false;
    //$("#mfcr2_immediate_accept").get(0).checked = false;
    $("#mfcr2_accept_on_offer").get(0).checked = true;
    $("#mfcr2_skip_category").get(0).checked = false;
    $("#mfcr2_charge_calls").get(0).checked = true;

    if (!firstLoad) {
        $("#mfcr2_double_answer").trigger("change");
        $('#mfcr2_get_ani_first').trigger("change");
        $('#mfcr2_skip_category').trigger("change");
    }
}

function resetAdvanceDefault() {
    var oAdvanceDefault = {
        "itu": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "2",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "X",
            "mf_ga_tones__request_next_ani_digit": "5",
            "mf_ga_tones__request_category": "5",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "6",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "6",
            "mf_gb_tones__accept_call_no_charge": "7",
            "mf_gb_tones__busy_number": "3",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "5",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "2",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "F",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "C",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "ar": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "2",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "X",
            "mf_ga_tones__request_next_ani_digit": "5",
            "mf_ga_tones__request_category": "5",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "6",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "6",
            "mf_gb_tones__accept_call_no_charge": "7",
            "mf_gb_tones__busy_number": "3",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "5",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "2",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "X",
            "mf_g1_tones__no_more_ani_available": "C",
            "mf_g1_tones__caller_ani_is_restricted": "F",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "400",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "br": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "9",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "2",
            "mf_ga_tones__request_next_ani_digit": "5",
            "mf_ga_tones__request_category": "5",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "X",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "1",
            "mf_gb_tones__accept_call_no_charge": "5",
            "mf_gb_tones__busy_number": "2",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "7",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "6",
            "mf_gb_tones__reject_collect_call": "7",
            "mf_gb_tones__number_changed": "3",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "X",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "C",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "8",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "cn": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "2",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "X",
            "mf_ga_tones__request_next_ani_digit": "6",
            "mf_ga_tones__request_category": "6",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "X",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "1",
            "mf_gb_tones__accept_call_no_charge": "7",
            "mf_gb_tones__busy_number": "2",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "5",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "X",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "X",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "C",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "cz": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "2",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "X",
            "mf_ga_tones__request_next_ani_digit": "5",
            "mf_ga_tones__request_category": "5",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "6",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "6",
            "mf_gb_tones__accept_call_no_charge": "7",
            "mf_gb_tones__busy_number": "3",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "5",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "2",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "F",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "C",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "co": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "2",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "X",
            "mf_ga_tones__request_next_ani_digit": "5",
            "mf_ga_tones__request_category": "5",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "6",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "1",
            "mf_gb_tones__accept_call_no_charge": "5",
            "mf_gb_tones__busy_number": "2",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "6",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "X",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "F",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "C",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "ec": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "2",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "X",
            "mf_ga_tones__request_next_ani_digit": "5",
            "mf_ga_tones__request_category": "5",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "6",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "6",
            "mf_gb_tones__accept_call_no_charge": "7",
            "mf_gb_tones__busy_number": "3",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "5",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "2",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "F",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "C",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "id": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "8",
            "mf_ga_tones__request_dnis_minus_2": "9",
            "mf_ga_tones__request_dnis_minus_3": "X",
            "mf_ga_tones__request_all_dnis_again": "2",
            "mf_ga_tones__request_next_ani_digit": "6",
            "mf_ga_tones__request_category": "6",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "5",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "6",
            "mf_gb_tones__accept_call_no_charge": "7",
            "mf_gb_tones__busy_number": "3",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "5",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "2",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "F",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "C",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "mx": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "2",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "X",
            "mf_ga_tones__request_next_ani_digit": "X",
            "mf_ga_tones__request_category": "X",
            "mf_ga_tones__request_category_and_change_to_gc": "6",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "X",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "1",
            "mf_gb_tones__accept_call_no_charge": "5",
            "mf_gb_tones__busy_number": "2",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "2",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "X",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "1",
            "mf_gc_tones__request_change_to_g2": "3",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "5",
            "mf_g1_tones__no_more_dnis_available": "X",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "F",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "ph": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "2",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "X",
            "mf_ga_tones__request_next_ani_digit": "5",
            "mf_ga_tones__request_category": "5",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "6",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "6",
            "mf_gb_tones__accept_call_no_charge": "7",
            "mf_gb_tones__busy_number": "3",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "5",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "2",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "F",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "C",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        },
        "ve": {
            "mf_ga_tones__request_next_dnis_digit": "1",
            "mf_ga_tones__request_dnis_minus_1": "2",
            "mf_ga_tones__request_dnis_minus_2": "7",
            "mf_ga_tones__request_dnis_minus_3": "8",
            "mf_ga_tones__request_all_dnis_again": "X",
            "mf_ga_tones__request_next_ani_digit": "9",
            "mf_ga_tones__request_category": "5",
            "mf_ga_tones__request_category_and_change_to_gc": "X",
            "mf_ga_tones__request_change_to_g2": "3",
            "mf_ga_tones__address_complete_charge_setup": "6",
            "mf_ga_tones__network_congestion": "4",
            "mf_gb_tones__accept_call_with_charge": "6",
            "mf_gb_tones__accept_call_no_charge": "7",
            "mf_gb_tones__busy_number": "3",
            "mf_gb_tones__network_congestion": "4",
            "mf_gb_tones__unallocated_number": "5",
            "mf_gb_tones__line_out_of_order": "8",
            "mf_gb_tones__special_info_tone": "2",
            "mf_gb_tones__reject_collect_call": "X",
            "mf_gb_tones__number_changed": "X",
            "mf_gc_tones__request_next_ani_digit": "X",
            "mf_gc_tones__request_change_to_g2": "X",
            "mf_gc_tones__request_next_dnis_digit_and_change_to_ga": "X",
            "mf_g1_tones__no_more_dnis_available": "X",
            "mf_g1_tones__no_more_ani_available": "F",
            "mf_g1_tones__caller_ani_is_restricted": "C",
            "mf_g2_tones__national_subscriber": "1",
            "mf_g2_tones__national_priority_subscriber": "2",
            "mf_g2_tones__international_subscriber": "7",
            "mf_g2_tones__international_priority_subscriber": "9",
            "mf_g2_tones__collect_call": "X",
            "timers__mf_back_cycle": "5000",
            "timers__mf_back_resume_cycle": "150",
            "timers__mf_fwd_safety": "30000",
            "timers__r2_seize": "8000",
            "timers__r2_answer": "80000",
            "timers__r2_metering_pulse": "0",
            "timers__r2_double_answer": "400",
            "timers__r2_answer_delay": "150",
            "timers__cas_persistence_check": "500",
            "timers__dtmf_start_dial": "500",
            "mf_threshold": "0"
        }
    };
    var sAraeVal = "";

    $("#advanced_default").on('click', function() {
        $("#otherR2AdvancedContent select, #otherR2AdvancedContent input").filter(":visible").each(function() {
            $(this).val(oAdvanceDefault[$("#mfcr2_variant").val()][this.id]);
        });
        top.Custom.init(doc);
        $(".mcr2_default").removeClass("mcr2_default");
    });

    $('#otherAdvanced_btn').bind("click", function(ev) {
        if ($("#signalling").val() == "mfcr2" && $(".prioptions").is(":visible")) {
            $("#edit_digitals_container").hide();
            $("#otherR2Advanced").show();

            var btnCancel = top.dialog.dialogCommands.find(".btn-cancel");
            btnCancel.removeAttr("onclick");
            btnCancel.bind("click", function(ev) {
                btnCancel.attr("onclick", "top.dialog.clearDialog()");
                btnCancel.unbind("click");
                $("#edit_digitals_container").show();
                $("#otherR2Advanced").hide();
                top.dialog.currentDialogType = "iframe";
                top.dialog.repositionDialog();
                ev.stopPropagation();
            });

            $("#otherR2AdvancedContent div[tooltip]").filter(":visible").each(function() {
                var oItem = $(this).siblings(".field-content").find("select")[0] || $(this).siblings(".field-content").find("input")[0];
                sAraeVal = $("#mfcr2_variant").val();
                var nDefault = oAdvanceDefault[sAraeVal][oItem.id];
                $(this).attr("tooltip", nDefault);
                if (oItem.value != nDefault) {
                    $(this).addClass("mcr2_default");
                } else {
                    $(this).removeClass("mcr2_default");
                }
            });

            $P.lang(doc, true);
            top.Custom.init(doc);
            top.dialog.currentDialogType = "iframe";
            top.dialog.repositionDialog();
            ev.stopPropagation();
        }
    });

    $("#otherR2AdvancedContent input, #otherR2AdvancedContent select").on('change', function() {;
        var nDefault = oAdvanceDefault[sAraeVal][this.id];
        if (this.value != nDefault) {
            $(this).closest(".field-content").siblings(".field-label").addClass("mcr2_default");
        } else {
            $(this).closest(".field-content").siblings(".field-label").removeClass("mcr2_default");
        }
    });
}

function enableCheckBox() {
    var advancedFileds = [];
    var otherR2AdvancedContent = formSerializeVal($("#otherR2AdvancedContent").get(0));
    for (var key in otherR2AdvancedContent) {
        if (otherR2AdvancedContent.hasOwnProperty(key)) {
            advancedFileds.push(key);
        }
    }

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "mf_advanced_settings",
        enableList: advancedFileds
    }, doc);
    $("#mf_advanced_settings").get(0).updateStatus();
}

function addGroup() {
    $("#acim_btn_div").hide();

    $("#digital_group_container").css({
        "display": "inline-block"
    });

    var spanInfo = JSON.parse(decodeURI(gup.call(window, "span")));

    if (!$.isEmptyObject(spanInfo)) {
        var hardhdlc = Number(spanInfo.hardhdlc),
            digitalGroupArr = [],
            digitalGroup = mWindow.digitalGroup;

        for (var i = 0; i < digitalGroup.length; i++) {
            var digitalGroupIndex = digitalGroup[i];

            if (spanInfo.span == digitalGroupIndex.span) {
                digitalGroupArr.push(digitalGroupIndex.channel);
            }
        }

        lastArr = getTotalArr(digitalGroupArr);
        var otherArr = getOtherArr(lastArr, hardhdlc);
        var str = getChannelRange(otherArr);
        var strArr = str.split(",");
        lastOtherArr = getGroupChannel(strArr);

        var channelEle = $("#digital_channel");
        var lastOtherArrLen = getTotalNum(lastOtherArr);

        for (var i = 1; i <= lastOtherArrLen; i++) {
            $("<option>").attr({
                value: i
            }).text(i).appendTo(channelEle);
        }

        var usedchannel = lastOtherArr.length != 0 ? lastOtherArr.toString() : "";

        channelEle.attr("usedchannel", usedchannel).val(lastOtherArrLen);
        if (!hardhdlc) {
            hardhdlc = $P.lang("LANG133");
        }
        $("#digital_channelDes").text($P.lang("LANG170") + " " + usedchannel + " " + $P.lang("LANG3140") + hardhdlc);

        channelEle.bind("change", function(ev) {
            var groupInfo = JSON.parse(decodeURI(gup.call(window, "span"))),
                hardhdlc = Number(groupInfo.hardhdlc),
                usedchannelArr = [],
                channel = groupInfo.channel,
                spanType = groupInfo.spanType,
                digitalGroup = mWindow.digitalGroup,
                digitalChannelVal = Number($("#digital_channel").val());

            for (var k = 0; k < digitalGroup.length; k++) {
                var digitalGroupChannel = digitalGroup[k].channel;
                if (digitalGroupChannel != channel) {
                    usedchannelArr.push(digitalGroupChannel);
                }
            }

            var otherArr = getOtherArr(getTotalArr(usedchannelArr));
            otherArr.remove(hardhdlc);
            var usedchannel = getChannel(digitalChannelVal, otherArr)

            $("#channel").attr("usedchannel", usedchannel);
            $("#digital_channel").attr("usedchannel", usedchannel);
            if (!hardhdlc) {
                hardhdlc = $P.lang("LANG133");
            }
            $("#digital_channelDes").text($P.lang("LANG170") + " " + usedchannel + " " + $P.lang("LANG3140") + hardhdlc);

            ev.stopPropagation();
        });
        top.Custom.init(doc, $("#digital_group_container")[0]);
        $("#editForm").height("auto");
        top.dialog.repositionDialog();
    }
}

function editGroup() {
    $("#acim_btn_div").hide();
    $("#edit_group_container").css({
        "display": "inline-block"
    });

    var groupInfo = JSON.parse(decodeURI(gup.call(window, "span")));

    if (!$.isEmptyObject(groupInfo)) {

        oldGroupName = groupInfo.group_name;
        var groupInfoChannel = groupInfo.channel;

        $("#group_name").val(oldGroupName);

        if (oldGroupName.indexOf('DefaultGroup') > -1) {
            $("#group_name").attr('disabled', 'disabled');
        }

        var hardhdlc = Number(groupInfo.hardhdlc),
            digitalGroup = mWindow.digitalGroup,
            digitalGroupStr = "",
            otherOigitalGroupStr = "";

        for (var i = 0; i < digitalGroup.length; i++) {
            var digitalGroupIndex = digitalGroup[i];
            var channels = digitalGroupIndex.channel;
            if (groupInfoChannel != channels) {
                otherOigitalGroupStr += ("," + channels);
            }
            if (groupInfo.span == digitalGroupIndex.span) {
                digitalGroupStr += ("," + channels);
            }

        }

        var channelEle = $("#channel"),
            totleChans = getTotalChans(),
            groupInfoChanneArr = groupInfoChannel.split(","),
            optVal = getTotalNum(groupInfoChanneArr),
            otherOigitalGroupArr = otherOigitalGroupStr ? otherOigitalGroupStr.replace(/^,/, "").split(",") : [],
            optLen = getTotalNum(otherOigitalGroupArr),
            otherChansLen = totleChans - optLen;

        if (hardhdlc) {
            otherChansLen = otherChansLen - 1;
        } else {
            hardhdlc = $P.lang("LANG133");
        }
        for (var i = 1; i <= otherChansLen; i++) {
            $("<option>").attr({
                value: i
            }).text(i).appendTo(channelEle);
        }
        channelEle.attr("useredChannel", groupInfo.channel).val(optVal);

        $("#channelDes").text($P.lang("LANG170") + " " + groupInfo.channel + " " + $P.lang("LANG3140") + hardhdlc);

        channelEle.bind("change", function(ev) {
            var groupInfo = JSON.parse(decodeURI(gup.call(window, "span"))),
                hardhdlc = Number(groupInfo.hardhdlc),
                usedchannelArr = [],
                channel = groupInfo.channel,
                spanType = groupInfo.spanType,
                digitalGroup = mWindow.digitalGroup,
                channelVal = Number($("#channel").val());

            for (var k = 0; k < digitalGroup.length; k++) {
                var digitalGroupChannel = digitalGroup[k].channel;
                if (digitalGroupChannel != channel) {
                    usedchannelArr.push(digitalGroupChannel);
                }
            }

            var otherArr = getOtherArr(getTotalArr(usedchannelArr));
            otherArr.remove(hardhdlc);
            var usedchannel = getChannel(channelVal, otherArr)

            $("#channel").attr("usedchannel", usedchannel);
            if (!hardhdlc) {
                hardhdlc = $P.lang("LANG133");
            }
            $("#channelDes").text($P.lang("LANG170") + " " + usedchannel + " " + $P.lang("LANG3140") + hardhdlc);

            ev.stopPropagation();
        });
    }

    top.Custom.init(doc, $("#edit_group_container")[0]);
    $("#editForm").height("auto");
    top.dialog.repositionDialog();
}

function saveChanges() {
    if (type == "PRI") {
        var signallingVal = $("#signalling").val(),
            hardhdlcVal = $("#hardhdlc").val();

        if (signallingVal == "ss7") {
            if (mWindow.ss7Settings[0]) {
                updateDigitalHardwareSettings();
            } else {
                addDigitalHardwareSS7Settings();
            }
        } else if (signallingVal == "mfcr2") {
            if (mWindow.mfcR2Settings[0]) {
                updateDigitalHardwareSettings();
            } else {
                addDigitalHardwareR2Settings();
            }
        } else {
            updateDigitalHardwareSettings();
        }
    } else if (type == "addGroup") {
        updateGroup();
    } else if (type == "editGroup") {
        updateGroupInfo();
    }
}

function addDigitalHardwareSS7Settings() {
    var action = {};
    action["action"] = "addDigitalHardwareSS7Settings";
    action["span"] = span;
    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            updateDigitalHardwareSettings();
        },
        success: function(data) {
            updateDigitalHardwareSettings();
        }
    });
}

function addDigitalHardwareR2Settings() {
    var action = {};
    action["action"] = "addDigitalHardwareR2Settings";
    action["span"] = span;
    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            updateDigitalHardwareSettings();
        },
        success: function(data) {
            updateDigitalHardwareSettings();
        }
    });
}

function updateDigitalHardwareSettings() {
    var spanTypeVal = $("#span_type :selected").val(),
        params = ["clock", "lbo", "rxgain", "signalling", "span_type", "txgain", "codec", "coding",
            "nsf", "priindication", "resetinterval", "switchtype", "hardhdlc", "priplaylocalrbt", "em_rxwink", "emoutbandcalldialdelay"
        ],
        ss7NotSend = ["nsf", "priindication", "resetinterval", "switchtype"],
        action = {},
        signallingVal = $("#signalling").val();
    if (!isChangeSignallingForDataTrunk()) {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG3978").format($("#hardhdlc").val()),
            callback: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        });
        return false;
    }
    var resetGroups = function(action, noNeedDialog) {
        if (action && action['group'] && action['group'].length > 0) {
            $.ajax({
                type: "post",
                url: "../cgi",
                async: false,
                data: {
                    action: "updateAllDigitalGroup",
                    group: JSON.stringify(action)
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: errorThrown
                    });
                },
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);

                    if (bool) {
                        if (isModifyGroupChanneOfDataTrunk("updateDigitalHardware")) {
                            top.dialog.dialogConfirm({
                                confirmStr: $P.lang("LANG927"),
                                buttons: {
                                    ok: applyChangeAndReboot,
                                    cancel: function() {
                                        mWindow.getPRISettings();
                                        mWindow.getDigitalHardwareSS7Settings();
                                        mWindow.getDigitalHardwareR2Settings();
                                        mWindow.bindButtonEvent();
                                    }
                                }
                            });
                        } else if (!noNeedDialog) {
                            top.dialog.dialogMessage({
                                type: "success",
                                content: $P.lang("LANG4782"),
                                callback: function() {
                                    mWindow.getPRISettings();
                                    mWindow.getDigitalHardwareSS7Settings();
                                    mWindow.getDigitalHardwareR2Settings();
                                    mWindow.bindButtonEvent();
                                }
                            });
                        } else {
                            mWindow.getPRISettings();
                            mWindow.getDigitalHardwareSS7Settings();
                            mWindow.getDigitalHardwareR2Settings();
                            mWindow.bindButtonEvent();
                        }
                    }
                }
            });
        } else {
            return;
        }
    };

    var digitalGroupInfo = [],
        spanTypeVal = $("#span_type").val(),
        hardhdlc = Number($("#hardhdlc").val()),
        totalGroupChanArr = [],
        usedChannelArr = [],
        arr = [],
        actionObj = {};

    if (originSpanType == "E1") {
        digitalGroupInfo = mWindow.digitalGroupE1;
    } else if (originSpanType == "T1") {
        digitalGroupInfo = mWindow.digitalGroupT1;
    } else if (originSpanType == "J1") {
        digitalGroupInfo = mWindow.digitalGroupJ1;
    }

    var totalChannelArr = getTotalChannelArr(spanTypeVal, hardhdlc);
    for (var i = 0; i < digitalGroupInfo.length; i++) {
        var obj = {},
            digitalGroupInfoIndex = digitalGroupInfo[i],
            digitalGroupName = digitalGroupInfoIndex.group_name,
            digitalGroupIndex = digitalGroupInfoIndex.group_index,
            digitalGroupChannel = digitalGroupInfoIndex.channel,
            originChannelLength = getTotalNum(digitalGroupChannel ? digitalGroupChannel.split(",") : []);

        if (originSpanType.toLowerCase() == digitalGroupInfoIndex.spanType) {
            digitalGroupChannel = getChannel(originChannelLength, totalChannelArr);
            usedChannelArr.push(digitalGroupChannel);
            obj["channel"] = digitalGroupChannel;
        }

        obj["group_name"] = digitalGroupName;
        obj["group_index"] = digitalGroupIndex;
        arr.push(obj);
        totalGroupChanArr.push(digitalGroupInfoIndex.channel);
    }
    var totalGroupChan = getTotalArr(totalGroupChanArr);

    if ((originSpanType == 'E1') && (spanTypeVal == "T1" || spanTypeVal == "J1") && Number(totalGroupChan[totalGroupChan.length - 1]) > 24) {
        //top.dialog.clearDialog();
        if (!(totalGroupChan.length == 24 && hardhdlc == 0)) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG2783"),
                callback: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            });
            return false;
        }
    }
    actionObj["group"] = arr;
    var digitalHardwareSettingsAction = function() {
        var actions = {},
            signallingVal = $("#signalling").val();

        if (spanTypeVal !== "E1") {
            actions["crc"] = "none";
            //actions["framing"] = "esf";
        } else {
            actions["crc"] = $("#crc").val();
            /*if (signallingVal == 'mfcr2') {
                actions["framing"] = "cas";
            } else {
                actions["framing"] = "ccs";
            }*/
        }

        actions['framing'] = $('#framing').val();

        actions["bchan"] = getBchan(bchanTotalChans);
        actions["action"] = "updateDigitalHardwareSettings";

        for (var i = 0, length = params.length; i < length; i++) {
            var paramsIndex = params[i],
                paramsEle = $("#" + params[i]),
                paramsEleDom = paramsEle.get(0),
                signalling = $("#signalling").val();

            if ((paramsEle.is(":hidden") && paramsEle.closest(".prioptions").length == 0) || (signalling == "ss7" && ss7NotSend.indexOf(paramsIndex) != -1)) {
                continue;
            }
            if ((paramsEle.is(":disabled")) || (signalling == "ss7" && ss7NotSend.indexOf(paramsIndex) != -1)) {
                continue;
            }
            if (paramsEleDom.type == "checkbox") {
                actions[params[i]] = (paramsEleDom.checked == true) ? "yes" : "no";
            } else {
                actions[params[i]] = paramsEle.val();
            }
        }
        if (signallingVal == "mfcr2") {
            actions["hardhdlc"] = "16";
        } else if (signallingVal == "em" || signallingVal == "em_w") {
            actions["hardhdlc"] = "0";
        } else if (signallingVal.indexOf('pri') > -1) {
            actions["pri_timer_t310"] = $("#pri_timer_t310").val();
        }
        return actions;
    }

    var updateDigitalHardware = function() {
        $.ajax({
            type: "post",
            url: baseServerURl,
            data: digitalHardwareSettingsAction,
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
                    resetGroups(actionObj);
                }
            }
        });
    }
    var updateDigitalR2Hardware = function() {
        var actions = {};

        actions = formSerializeVal($("#mfcR2Div").get(0));
        actions["mfcr2_play_local_rbt"] = ($("#mfcr2_play_local_rbt").get(0).checked == true) ? "yes" : "no";

        var R2AdvancedActions = formSerializeVal($("#R2Advanced").get(0));
        for (var key in R2AdvancedActions) {
            if (R2AdvancedActions.hasOwnProperty(key)) {
                actions[key] = R2AdvancedActions[key];
            }
        }

        var otherR2Advanced = formSerializeVal($("#otherR2Advanced").get(0));
        for (var key in otherR2Advanced) {
            if (otherR2Advanced.hasOwnProperty(key)) {
                actions[key] = otherR2Advanced[key];
            }
        }

        actions["action"] = "updateDigitalHardwareR2Settings";
        actions["span"] = span;
        actions["mfcr2_max_ani"] = 32;
        actions["mfcr2_max_dnis"] = 32;
        if ($('#mfcr2_get_ani_first').is(":disabled")) {
            actions["mfcr2_get_ani_first"] = "no";
        }
        if ($('#mfcr2_skip_category').is(":disabled")) {
            actions["mfcr2_skip_category"] = "no";
        }

        if ($("#mfcr2_variant").val() == "br") {
            actions["mfcr2_forced_release"] = $("#mfcr2_forced_release").is(":checked") ? "yes" : "no";
        } else {
            actions["mfcr2_forced_release"] = "no";
        }

        if ($("#mfcr2_double_answer").is(":checked")) {
            actions["mfcr2_double_answer_timeout"] = $("#mfcr2_double_answer_timeout").val();
        } else {
            actions["mfcr2_double_answer_timeout"] = "-1";
        }

        if (action["mfcr2_mfback_timeout"] == "") {
            actions["mfcr2_mfback_timeout"] = "-1";
        }
        if (action["mfcr2_metering_pulse_timeout"] == "") {
            actions["mfcr2_metering_pulse_timeout"] = "-1";
        }
        if (action["mfcr2_double_answer_timeout"] == "") {
            actions["mfcr2_double_answer_timeout"] = "-1";
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: actions,
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
                    if ($("#otherR2Advanced").is(":visible") && $("#signalling").val() == "mfcr2") {
                        $("#edit_digitals_container").show();
                        $("#otherR2Advanced").hide();

                        top.dialog.currentDialogType = "iframe";
                        top.dialog.repositionDialog();

                        resetGroups(actionObj, "noNeedDialog");
                    } else {
                        resetGroups(actionObj);
                    }
                }
            }
        });
    }

    if (signallingVal == "ss7") {
        digitalHardwareSettingsAction = digitalHardwareSettingsAction();
        action["action"] = "updateDigitalHardwareSS7Settings";
        action["sigchan"] = $("#hardhdlc").val();
        action["span"] = span;
        action["ss7type"] = $("#ss7type").val();
        action["pointcode"] = $("#pointcode").val();
        //action["adjpointcode"] = $("#adjpointcode").val();
        action["defaultdpc"] = $("#defaultdpc").val();
        action["cicbeginswith"] = $("#cicbeginswith").val();
        action["networkindicator"] = $("#networkindicator").val();
        action["sigchan_assign_cic"] = $("#sigchan_assign_cic").val();
    } else if (signallingVal == "mfcr2") {
        action = digitalHardwareSettingsAction();
        action["codec"] = "alaw";
    } else {
        action = digitalHardwareSettingsAction();
        action["facilityenable"] = $("#facilityenable").is(':checked') ? 'yes' : 'no';
        action["priexclusive"] = $("#priexclusive").is(':checked') ? 'yes' : 'no';
        action["overlapdial"] = $("#overlapdial").val();
        //action["bchan"] = getBchan(bchanTotalChans);
    }

    if (signallingVal == "ss7") {
        action["ss7_called_nai"] = $("#ss7_called_nai").val();
        action["ss7_calling_nai"] = $("#ss7_calling_nai").val();
        action["ss7_internationalprefix"] = $("#internationalprefix").val();
        action["ss7_nationalprefix"] = $("#nationalprefix").val();
        action["ss7_subscriberprefix"] = $("#subscriberprefix").val();
        action["ss7_unknownprefix"] = $("#unknownprefix").val();
        //action["cicbeginswith"] = $("#cicbeginswith").val();
    } else if (signallingVal !== "mfcr2") {
        action["pridialplan"] = $("#pridialplan").val();
        action["prilocaldialplan"] = $("#prilocaldialplan").val();
        action["internationalprefix"] = $("#internationalprefix").val();
        action["nationalprefix"] = $("#nationalprefix").val();
        action["localprefix"] = $("#localprefix").val();
        action["privateprefix"] = $("#privateprefix").val();
        action["unknownprefix"] = $("#unknownprefix").val();
    }

    $.ajax({
        type: "post",
        url: baseServerURl,
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
                if (signallingVal == "ss7") {
                    updateDigitalHardware();
                } else if (signallingVal == "mfcr2") {
                    updateDigitalR2Hardware();
                    // action["action"] = "updateDigitalHardwareR2Settings";
                    // action["span"] = span;
                } else {
                    // top.dialog.dialogMessage({
                    //     type: "success",
                    //     content: $P.lang("LANG4782"),
                    //     callback: function() {
                    resetGroups(actionObj);
                    //         mWindow.getPRISettings();
                    //         mWindow.bindButtonEvent();
                    //     }
                    // });
                }
            }
        }
    });
}

function updateGroup() {
    if ($P("#form", document).valid()) {
        var action = {},
            spanInfo = JSON.parse(decodeURI(span));

        action["span"] = spanInfo.span;
        action["group_name"] = $("#digital_group_name").val();
        action["group_index"] = groupIndex;
        action["context"] = $("#digital_context").val();
        action["channel"] = $("#digital_channel").attr("usedchannel");
        action["action"] = "addDigitalGroup";

        $.ajax({
            type: "post",
            url: baseServerURl,
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
                    top.dialog.dialogMessage({
                        type: "success",
                        content: $P.lang("LANG4782")
                    });

                    mWindow.getPRISettings();
                    mWindow.bindButtonEvent();
                }
            }
        });
    }
}

function updateGroupInfo() {
    if ($P("#form", document).valid()) {
        var action = {},
            groupInfo = JSON.parse(decodeURI(gup.call(window, "span"))),
            digitalGroup = mWindow.digitalGroup,
            arr = [],
            actionObj = {},
            spanType = groupInfo.spanType,
            hardhdlc = Number(groupInfo.hardhdlc);

        var totalChannelArr = getTotalChannelArr(spanType, hardhdlc);

        for (var i = 0; i < digitalGroup.length; i++) {
            var digitalGroupIndex = digitalGroup[i],
                channel = digitalGroupIndex.channel,
                groupName = digitalGroupIndex.group_name,
                groupIndex = digitalGroupIndex.group_index,
                obj = {},
                originChannelLength = getTotalNum(channel ? channel.split(",") : []);

            if ((groupInfo.span == digitalGroupIndex.span) && (groupInfo.group_index == groupIndex)) {
                var currentChannelLength = Number($("#channel").val());
                channel = getChannel(currentChannelLength, totalChannelArr);
                obj["group_name"] = $("#group_name").val();
            } else if (groupInfo.span == digitalGroupIndex.span) {
                channel = getChannel(originChannelLength, totalChannelArr);
                obj["group_name"] = groupName;
            }

            obj["group_index"] = groupIndex;
            obj["channel"] = channel;
            arr.push(obj);
        }

        action["action"] = "updateAllDigitalGroup";
        actionObj["group"] = arr;
        action["group"] = JSON.stringify(actionObj);

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown,
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                });

                if (bool) {
                    if (isModifyGroupChanneOfDataTrunk()) {
                        top.dialog.dialogConfirm({
                            confirmStr: $P.lang("LANG927"),
                            buttons: {
                                ok: applyChangeAndReboot,
                                cancel: function() {
                                    mWindow.getPRISettings();
                                    mWindow.bindButtonEvent();
                                }
                            }
                        });
                    } else {
                        top.dialog.dialogMessage({
                            type: "success",
                            content: $P.lang("LANG4782")
                        });

                        mWindow.getPRISettings();
                        mWindow.bindButtonEvent();
                    }
                }
            }
        });
    }
}

function isModifyGroupChanneOfDataTrunk(type) {
    var digitalGroup = mWindow.digitalGroup,
        flag = false,
        dataTrunkChannelObj = mWindow.dataTrunkChannelObj,
        groupInfo = JSON.parse(decodeURI(gup.call(window, "span"))),
        groupInfoGroupIndex = undefined,
        groupInfoSpan = undefined,
        spanType = "",
        hardhdlc = -1;

    if (type == "updateDigitalHardware") {
        spanType = $("#span_type").val();
        hardhdlc = $("#hardhdlc").val();
        groupInfoSpan = groupInfo;
    } else {
        spanType = groupInfo.spanType;
        hardhdlc = Number(groupInfo.hardhdlc);
        groupInfoSpan = groupInfo.span;
        groupInfoGroupIndex = groupInfo.group_index;
    }

    var totalChannelArr = getTotalChannelArr(spanType, hardhdlc);
    for (var i = 0; i < digitalGroup.length; i++) {
        var digitalGroupIndex = digitalGroup[i],
            channel = digitalGroupIndex.channel,
            groupIndex = digitalGroupIndex.group_index,
            originChannelLength = getTotalNum(channel ? channel.split(",") : []);

        if ((groupInfoSpan == digitalGroupIndex.span) && (groupInfoGroupIndex == groupIndex)) {
            var currentChannelLength = Number($("#channel").val());

            channel = getChannel(currentChannelLength, totalChannelArr);
        } else if (groupInfoSpan == digitalGroupIndex.span) {
            channel = getChannel(originChannelLength, totalChannelArr);
        }
        if (!$.isEmptyObject(dataTrunkChannelObj)) {
            for (var prop in dataTrunkChannelObj) {
                if (dataTrunkChannelObj.hasOwnProperty(prop)) {
                    var dataTrunkChannelObjProp = dataTrunkChannelObj[prop],
                        propGroupIndex = Number(dataTrunkChannelObjProp["group_index"]),
                        propChannel = dataTrunkChannelObjProp["channel"];

                    if ((propGroupIndex == groupIndex) && (propChannel != channel)) {
                        flag = true;
                        break;
                    }
                }
            }
        }
        if (flag) {
            break;
        }
    }
    return flag;
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

    //$.ajax({
        //url: UCMGUI.config.paths.baseServerURl + "?action=applyChanges&settings",
        //type: "GET",
        //success: function(data) {
    UCMGUI.loginFunction.confirmReboot();
        //}
    //});
}

function formSerializeVal(doc) {
    var hash = {};
    var fields = UCMGUI.findInputFields(doc);
    for (var i = 0; i < fields.length; i++) {
        var domVal = "";
        var val = $(fields[i]).attr("id");
        var noSerialize = $(fields[i]).attr("noSerialize");
        if (!noSerialize && val.length != 0) {
            // if ($(fields[i]).is(":hidden")) {
            //     continue;
            // }
            if ($(fields[i]).is(":disabled")) {
                continue;
            }
            switch (fields[i].type) {
                case 'textarea':
                case 'text':
                case 'password':
                    domVal = $(fields[i]).val();
                    break;
                case 'checkbox':
                    domVal = $(fields[i]).is(":checked") ? "yes" : "no";
                    break;
                case 'radio':
                    break;
                case 'select-one':
                    domVal = $(fields[i]).val();
                    break;
                case 'select-multiple':
                    var options = new Array;
                    for (var i = 0; i < fields[i].options.length; i++) {
                        options.push(fields[i].options[i].value)
                    }
                    domVal = options.toString()
                    break;
                default:
                    break;
            }
            //if (domVal) {
            hash[val] = domVal;
            //}
        }
    };
    return hash;
}

function getTotalNum(arr) {
    var num = 0;
    for (var k = 0; k < arr.length; k++) {
        var index = arr[k];
        if (/-/.test(index)) {
            var first = index.match(/^\d+/);
            var last = index.match(/\d+$/);
            if (first && last) {
                first = Number(first[0]);
                last = Number(last[0]);
                num += (last - first + 1)
            }
        } else {
            num += 1;
        }
    };
    return num;
}

function getChannel(length, arr) {
    var curentChansArr = arr.splice(0, length);
    var str = getChannelRange(curentChansArr);
    var strArr = str.split(",");
    return getGroupChannel(strArr).toString();
}

function getChannelRange(arr) {
    var str = "";
    for (var i = 0; i < arr.length; i++) {
        var before = Number(arr[i]);
        var after = Number(arr[i + 1]);

        if ((before + 1) != after) {
            str += (before + ",");
        } else {
            str += (before + "-");
        }
    }
    return str;
}

function getGroupChannel(arr) {
    var lastArr = [];
    for (var i = 0; i < arr.length; i++) {
        var strArrIndex = arr[i];
        if (/-/.test(strArrIndex)) {
            var first = strArrIndex.match(/^\d+/);
            var last = strArrIndex.match(/\d+$/);
            if (first && last) {
                lastArr.push(first[0] + "-" + last[0]);
            }
        } else if (strArrIndex) {
            lastArr.push(strArrIndex);
        }
    }
    return lastArr;
}

function getOtherArr(arr, hardhdlc) {
    var totalChansLen = getTotalChans(),
        otherArr = [];
    for (var l = 1; l <= totalChansLen; l++) {
        var index = arr[l];
        if (arr.indexOf(String(l)) == -1) {
            if (l != hardhdlc) {
                otherArr.push(l);
            }
        }

    }
    return otherArr;
}

function getTotalArr(arr) {
    var totalArr = [];
    for (var i = 0; i < arr.length; i++) {
        var index = arr[i];
        var indexArr = [];

        if (/,/.test(index)) {
            indexArr = index.split(",");
        }
        if (indexArr.length == 0) {
            totalArr = totalArr.concat(getEndTotalArr(index));
        } else {
            for (var j = 0; j < indexArr.length; j++) {
                var indexArrIndex = indexArr[j];
                totalArr = totalArr.concat(getEndTotalArr(indexArrIndex));
            }
        }
    };
    return totalArr;
}

function getEndTotalArr(str) {
    var endTotalArr = [];
    if (/-/.test(str)) {
        var match = str.match(/(\d+)-(\d+)/);
        if (match[1] && match[2]) {
            var matchFirst = Number(match[1]);
            var matchSecon = Number(match[2]);

            for (var j = 0; j < (matchSecon - matchFirst + 1); j++) {
                endTotalArr.push(String(matchFirst + j));
            }
        }
    } else if (str) {
        endTotalArr.push(str);
    }
    return endTotalArr;
}

function getDataTrunkChansArr() {
    var dataTrunkChannelObj = mWindow.dataTrunkChannelObj;
    var allChansRangeStr = "";
    for (var prop in dataTrunkChannelObj) {
        if (dataTrunkChannelObj.hasOwnProperty(prop)) {
            allChansRangeStr += dataTrunkChannelObj[prop]["channel"] + ",";
        }
    }
    allChansRangeStr = allChansRangeStr.replace(/,$/, "");
    return allChansRangeStr.split(",");
}

function getTotalChans() {
    var totleChans = 31,
        priSettingsInfo = mWindow.priSettings;

    for (var i = 0; i < priSettingsInfo.length; i++) {
        var priSettingsInfoIndex = priSettingsInfo[i],
            currentSpan;

        if (gup.call(window, "type") == "PRI") {
            currentSpan = Number(gup.call(window, "span"));
        } else {
            currentSpan = Number(JSON.parse(decodeURI(span)).span);
        }

        if (Number(priSettingsInfoIndex.span) == currentSpan) {
            var spanType = priSettingsInfoIndex.span_type.toLowerCase(),
                spanTypeEle = $("#span_type"),
                spanTypeVal = spanTypeEle.val().toLowerCase(),
                isVisible = spanTypeEle.is(":visible");
            if (isVisible) {
                if (spanTypeVal == "t1" || spanTypeVal == "j1") {
                    totleChans = 24;
                }
            } else {
                if (spanType == "t1" || spanType == "j1") {
                    totleChans = 24;
                }
            }
        }
    }

    return totleChans;
}

function getTotalChannelArr(spanType, hardhdlc) {
    var totalChannelLen = 0,
        totalChannelArr = [],
        spanType = spanType.toLowerCase(),
        hardhdlc = Number(hardhdlc);

    if (spanType == "e1") {
        totalChannelLen = 31;
    } else if (spanType == "t1" || spanType == "j1") {
        totalChannelLen = 24;
    }

    for (var j = 1; j <= totalChannelLen; j++) {
        if (hardhdlc != j) {
            totalChannelArr.push(j);
        }
    }
    return totalChannelArr;
}

function getBchan(bchanTotalChans) {
    var hardhdlc = Number($("#hardhdlc").val()),
        signallingVal = $("#signalling").val(),
        dataTrunkChansArr = getDataTrunkChansArr(),
        totalArr = getTotalArr(dataTrunkChansArr);
    if (signallingVal == "mfcr2") {
        hardhdlc = 16;
    } else if (signallingVal == "em" || signallingVal == "em_w") {
        hardhdlc = 0;
    }
    var otherArr = getOtherArr(totalArr, hardhdlc),
        channelRangeArr = getChannelRange(otherArr).split(","),
        groupChannel = getGroupChannel(channelRangeArr).toString();

    if (groupChannel) {
        return groupChannel;
    } else {
        return 0;
    }
}

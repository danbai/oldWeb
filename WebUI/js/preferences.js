/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    updateDocument = UCMGUI.domFunction.updateDocument,
    updateElementValue = UCMGUI.domFunction.updateElementValue,
    portExtensionList = [];

String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.format = top.String.prototype.format;
Number.prototype.isValueInBetween = top.Number.prototype.isValueInBetween;

$(function() {
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG667"));

    // getAccountList();

    getPortExtension();

    getGeneralPrefSettings();

    getExtenPrefSettings();

    limitTime();

    $("#disable_extension_ranges").bind("change", function(ev) {
        saveDisableExtensionRanges();

        ev.stopPropagation();
    });

    initValidator();

    $P.lang(doc, true);
});

function limitTime() {
    var enableOutLimitime = $("#enable_out_limitime"),
        outLimitimeDiv = $("#div_out_limitime");

    enableOutLimitime.on("change", function() {
        if (this.checked) {
            outLimitimeDiv.css('display', 'block');
        } else {
            outLimitimeDiv.hide();
        }
    });
}

function checkIfInPort(value, element) {
    var id = element.id ? element.id.split('_')[0] : "";

    if ($('#disable_extension_ranges:checked').length && (id !== "zcue") && (id !== "pkue")) {
        return true;
    }

    var selfRange = $(element).parent().parent(),
        start = $('[id$="_start"]', selfRange).val(),
        end = $('[id$="_end"]', selfRange).val();

    start = Number(start);
    end = Number(end);

    var length = portExtensionList.length;

    for (var i = 0; i < length; i++) {
        if (portExtensionList[i].isValueInBetween(start, end)) {
            return false;
        }
    }

    return true;
}

function getAccountList() {
    var generalPrefExt = UCMGUI.isExist.getList("getAccountList");

    generalPrefExt = transData(generalPrefExt);

    UCMGUI.domFunction.selectbox.appendOpts({
        el: "operator",
        opts: generalPrefExt
    }, doc);
}

function getPortExtension() {
    portExtensionList = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getFeatureCodes"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var featureSettings = data.response.feature_settings,
                    parkext = featureSettings.parkext,
                    parkpos = featureSettings.parkpos.split('-');

                portExtensionList.push(parseInt(parkext, 10));

                for (var i = parseInt(parkpos[0], 10), length = parseInt(parkpos[1], 10); i <= length; i++) {
                    portExtensionList.push(i);
                }
            }
        }
    });
}

function getGeneralPrefSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            action: "getGeneralPrefSettings"
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var generalPrefSettings = data.response.general_pref_settings;

                updateDocument(generalPrefSettings, document);

                if (generalPrefSettings.limitime !== null) {
                    var limitime = generalPrefSettings.limitime,
                        warningtime = generalPrefSettings.warningtime,
                        repeattime = generalPrefSettings.repeattime;

                    $('#enable_out_limitime')[0].checked = true;
                    $("#div_out_limitime").css('display', 'block');
                    $('#limitime').val(limitime / 1000);
                    $('#warningtime').val(warningtime ? warningtime / 1000 : '');
                    $('#repeattime').val(repeattime ? repeattime / 1000 : '');
                }

                top.Custom.init(doc, $("#generalPrefSettings")[0]);
            }
        }
    });
}

function getExtenPrefSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            action: "getExtenPrefSettings"
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var extenPrefSettings = data.response.extension_pref_settings;

                updateDocument(extenPrefSettings, document);

                var disableExtensionRanges = data.response.extension_pref_settings.disable_extension_ranges;

                refreshExtensionRangesForm(disableExtensionRanges ? disableExtensionRanges : 'no');

                // top.Custom.init(doc, $("#extenPrefSettings")[0]);
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "global_outboundcid": {
                //authid: true,
                //cidName: true
                calleridSip: true
            },
            "global_outboundcidname": {
                //alphanumeric: true,
                //nowhitespace: true,
                specialCidName: true,
                minlength: 2
            },
            "ringtime": {
                required: true,
                digits: true,
                range: [3, 600]
            },
            "ue_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#ue_end')],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "ue_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#ue_start')],
                customCallback: [$P.lang("LANG2145"), compareLength],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "zcue_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#zcue_end')],
                customCallback: [$P.lang("LANG2144"), isRangeUeConflict],
                customCallback2: [$P.lang("LANG2707"), isRangeUe],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "zcue_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#zcue_start')],
                customCallback: [$P.lang("LANG2144"), isRangeUeConflict],
                customCallback2: [$P.lang("LANG2707"), isRangeUe],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "pkue_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#pkue_end')],
                customCallback: [$P.lang("LANG2144"), isRangeUeConflict],
                customCallback2: [$P.lang("LANG2707"), isRangeUe],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "pkue_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#pkue_start')],
                customCallback: [$P.lang("LANG2144"), isRangeUeConflict],
                customCallback2: [$P.lang("LANG2707"), isRangeUe],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "mm_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#mm_end')],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "mm_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#mm_start')],
                customCallback: [$P.lang("LANG2145"), compareLength],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "vme_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#vme_end')],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "vme_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#vme_start')],
                customCallback: [$P.lang("LANG2145"), compareLength],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "rge_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#rge_end')],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "rge_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#rge_start')],
                customCallback: [$P.lang("LANG2145"), compareLength],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "qe_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#qe_end')],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "qe_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#qe_start')],
                customCallback: [$P.lang("LANG2145"), compareLength],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "vmg_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#vmg_end')],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "vmg_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#vmg_start')],
                customCallback: [$P.lang("LANG2145"), compareLength],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "directory_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#directory_end')],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "directory_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#directory_start')],
                customCallback: [$P.lang("LANG2145"), compareLength],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "fax_start": {
                required: true,
                digits: true,
                minlength: 2,
                smaller: [$P.lang("LANG560"), $P.lang("LANG561"), $('#fax_end')],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "fax_end": {
                required: true,
                digits: true,
                minlength: 2,
                bigger: [$P.lang("LANG561"), $P.lang("LANG560"), $('#fax_start')],
                customCallback: [$P.lang("LANG2145"), compareLength],
                customCallback2: [$P.lang("LANG2144"), isRangeConflict],
                customCallback3: [$P.lang("LANG3971").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "limitime": {
                required: true,
                digits: true,
                customCallback: [$P.lang("LANG4346"), checkTimeLarger]
            },
            "warningtime": {
                digits: true,
                min: 1
            },
            "repeattime": {
                digits: true,
                min: 1
            }
        },
        newValidator: true
    });
}

function checkTimeLarger(val, ele) {
    var maximumTime = parseInt(val, 10),
        warningtime = parseInt($("#warningtime").val(), 10),
        repeattime = parseInt($("#repeattime").val(), 10);


    if (!isNaN(warningtime)) {
        if (!isNaN(repeattime)) {
            if (maximumTime > warningtime && warningtime > repeattime) {
                return true;
            }
        } else if (maximumTime > warningtime) {
            return true;
        }
    } else {
        if (isNaN(repeattime)) {
            return true;
        } else if (maximumTime > repeattime) {
            return true;
        }
    }

    return false;
}

function refreshExtensionRangesForm(disabled) {
    if (disabled == 'yes') {
        $('#ue_start')[0].disabled = true;
        $('#ue_end')[0].disabled = true;
        // $('#pkue_start')[0].disabled = true;
        // $('#pkue_end')[0].disabled = true;
        // $('#zcue_start')[0].disabled = true;
        // $('#zcue_end')[0].disabled = true;
        $('#mm_start')[0].disabled = true;
        $('#mm_end')[0].disabled = true;
        $('#vme_start')[0].disabled = true;
        $('#vme_end')[0].disabled = true;
        $('#rge_start')[0].disabled = true;
        $('#rge_end')[0].disabled = true;
        $('#qe_start')[0].disabled = true;
        $('#qe_end')[0].disabled = true;
        $('#vmg_start')[0].disabled = true;
        $('#vmg_end')[0].disabled = true;
        $('#directory_start')[0].disabled = true;
        $('#directory_end')[0].disabled = true;
        $('#fax_start')[0].disabled = true;
        $('#fax_end')[0].disabled = true;
        $('#reset_ranges_button').hide();
    } else {
        $('#ue_start')[0].disabled = false;
        $('#ue_end')[0].disabled = false;
        // $('#pkue_start')[0].disabled = false;
        // $('#pkue_end')[0].disabled = false;
        // $('#zcue_start')[0].disabled = false;
        // $('#zcue_end')[0].disabled = false;
        $('#mm_start')[0].disabled = false;
        $('#mm_end')[0].disabled = false;
        $('#vme_start')[0].disabled = false;
        $('#vme_end')[0].disabled = false;
        $('#rge_start')[0].disabled = false;
        $('#rge_end')[0].disabled = false;
        $('#qe_start')[0].disabled = false;
        $('#qe_end')[0].disabled = false;
        $('#vmg_start')[0].disabled = false;
        $('#vmg_end')[0].disabled = false;
        $('#directory_start')[0].disabled = false;
        $('#directory_end')[0].disabled = false;
        $('#fax_start')[0].disabled = false;
        $('#fax_end')[0].disabled = false;
        $('#reset_ranges_button').show();
    }

    top.Custom.init(doc, $("#extenPrefSettings")[0]);
}

function saveDisableExtensionRanges() {
    var disableExtensionRanges = $('#disable_extension_ranges'),
        disabled = disableExtensionRanges[0].checked;

    disableExtensionRanges[0].checked = false;

    if (disabled) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG864"),
            buttons: {
                ok: function() {
                    disableExtensionRanges[0].checked = true;
                    refreshExtensionRangesForm('yes');
                }
            }
        });
    } else {
        refreshExtensionRangesForm('no');
    }
}

function updatePageInfo() {
    if ($P("#form", document).valid()) {

        var disabled = $("#disable_extension_ranges")[0].checked;

        if (!disabled && !verify_Ranges()) {
            return;
        }

        var actionGeneralPre = {},
            actionExtensionPre = {};
        //  actionPickupGroup = {};

        actionGeneralPre = UCMGUI.formSerializeVal($("#generalPrefSettingsDiv")[0], mWindow.document);
        actionExtensionPre = UCMGUI.formSerializeVal($("#extenPrefSettingsDiv")[0], mWindow.document);
        actionGeneralPre["action"] = "updateGeneralPrefSettings";
        actionExtensionPre["action"] = "updateExtenPrefSettings";

        if ($("#enable_out_limitime")[0].checked) {
            var limitime = $("#limitime").val(),
                warningtime = $("#warningtime").val(),
                repeattime = $("#repeattime").val();

            actionGeneralPre["limitime"] = limitime * 1000;
            actionGeneralPre["warningtime"] = warningtime === '' ? '' : warningtime * 1000;
            actionGeneralPre["repeattime"] = repeattime === '' ? '' : repeattime * 1000;
        } else {
            actionGeneralPre["limitime"] = actionGeneralPre["warningtime"] = actionGeneralPre["repeattime"] = "";
        }

        $.ajax({
            type: "post",
            url: "../cgi",
            data: actionGeneralPre,
            error: function(jqXHR, textStatus, errorThrown) {
                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: actionExtensionPre,
                        error: function(jqXHR, textStatus, errorThrown) {
                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: errorThrown
                            // });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG4764")
                                });
                            }
                        }
                    });
                }
            }
        });
    }
}

function verify_Ranges() {
    var arrF = ['ue_start', 'ue_end', 'mm_start', 'mm_end', 'qe_start', 'qe_end', 'vme_start', 'vme_end', 'rge_start', 'rge_end', 'vmg_start', 'vmg_end', 'directory_start', 'directory_end', 'fax_start', 'fax_end'];
    var arr = [];

    for (var i = 0; i < arrF.length; i++) {
        arr.push($('#' + arrF[i])[0]);
    }

    var obj = {
            "ue_start": 'getAccountList',
            "mm_start": 'getConferenceList',
            "qe_start": 'getQueueList',
            "vme_start": 'getIVRList',
            "rge_start": 'getRinggroupList',
            "vmg_start": 'getVMgroupList',
            "directory_start": 'getDirectoryList',
            'fax_start': 'getFaxList'
        },
        tips = {
            "ue": 'LANG248',
            "mm": 'LANG1585',
            "qe": 'LANG1596',
            "vme": 'LANG1593',
            "rge": 'LANG1597',
            "vmg": 'LANG1569',
            "directory": 'LANG2897',
            'fax': 'LANG2907'
        },
        tipsLength = 0,
        msg = '';

    for (var i = 0; i < arrF.length; i++) {
        var tmp = arrF[i];

        if (!arrF[i].endsWith('_start')) {
            continue;
        }

        var start = $('#' + arrF[i])[0].value,
            end = $('#' + arrF[i + 1])[0].value;

        start = parseInt(start, 10);
        end = parseInt(end, 10);

        // check existed extensions out of range
        var conflicts = [];
        if (obj.hasOwnProperty(tmp)) {

            if (tmp != 'vme_start') {
                // e.g. tmp: ue_start , obj[tmp]: 'getAccountList', moduleExtension : user's extensions
                var moduleExtension = UCMGUI.isExist.getList(obj[tmp]);

                $.each(moduleExtension, function(idx, value) {
                    if (tmp == 'mm_start') {
                        var valueNum = parseInt(value, 10);

                        if (!isNaN(valueNum) && !valueNum.isValueInBetween(start, end)) {
                            conflicts.push(value);
                        }
                    } else {
                        var valueNum = parseInt(value.extension, 10);

                        if (!isNaN(valueNum) && !valueNum.isValueInBetween(start, end)) {
                            conflicts.push(value.extension);
                        }
                    }
                });
            } else {
                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: "action=ListIvr&options=extension",
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            var moduleExtension = data.response.ivr;

                            $.each(moduleExtension, function(idx, value) {
                                var valueNum = parseInt(value.extension, 10);

                                if (!isNaN(valueNum) && !valueNum.isValueInBetween(start, end)) {
                                    conflicts.push(value.extension);
                                }
                            });
                        }
                    }
                });
            }
        }

        if (conflicts.length > 0) {
            var exten_prompt = conflicts.slice(0, 5).join(',');

            exten_prompt = conflicts.length > 5 ? '[' + exten_prompt + ', ...]' : '[' + exten_prompt + ']';

            msg += (++tipsLength) + '. ' + $P.lang("LANG1600").format($P.lang(tips[arrF[i].slice(0, -6)])) + exten_prompt + '<br />' + $P.lang("LANG1601") + '<b>[' + start + ',' + end + ']</b>.<br />';
        }
    }

    if (msg) {
        top.dialog.dialogMessage({
            type: 'error',
            content: msg
        });

        return false;
    }

    return true;
};

/*
    "ue_start": "1000", 
    "ue_end": "6299", 
    "pkue_start": "4000", 
    "pkue_end": "4999", 
    "zcue_start": "5000",
    "zcue_end": "6299",
    "mm_start": "6300",
    "mm_end": "6399",
    "vme_start": "7000",
    "vme_end": "7100",
    "rge_start": "6400",
    "rge_end": "6499",
    "vmg_start": "6600",
    "vmg_end": "6699",
    "qe_start": "6500",
    "qe_end": "6599",
    "directory_start": "7101",
    "directory_end": "7199",
    "fax_start": "7200",
    "fax_end": "8200"
*/

function resetRangesDefault() {
    updateElementValue({
        el: "ue_start",
        val: "1000"
    }, doc);
    updateElementValue({
        el: "ue_end",
        val: "6299"
    }, doc);
    updateElementValue({
        el: "pkue_start",
        val: "4000"
    }, doc);
    updateElementValue({
        el: "pkue_end",
        val: "4999"
    }, doc);
    updateElementValue({
        el: "zcue_start",
        val: "5000"
    }, doc);
    updateElementValue({
        el: "zcue_end",
        val: "6299"
    }, doc);
    updateElementValue({
        el: "mm_start",
        val: "6300"
    }, doc);
    updateElementValue({
        el: "mm_end",
        val: "6399"
    }, doc);
    updateElementValue({
        el: "vme_start",
        val: "7000"
    }, doc);
    updateElementValue({
        el: "vme_end",
        val: "7100"
    }, doc);
    updateElementValue({
        el: "rge_start",
        val: "6400"
    }, doc);
    updateElementValue({
        el: "rge_end",
        val: "6499"
    }, doc);
    updateElementValue({
        el: "qe_start",
        val: "6500"
    }, doc);
    updateElementValue({
        el: "qe_end",
        val: "6599"
    }, doc);
    updateElementValue({
        el: "vmg_start",
        val: "6600"
    }, doc);
    updateElementValue({
        el: "vmg_end",
        val: "6699"
    }, doc);
    updateElementValue({
        el: "directory_start",
        val: "7101"
    }, doc);
    updateElementValue({
        el: "directory_end",
        val: "7199"
    }, doc);
    updateElementValue({
        el: "fax_start",
        val: "7200"
    }, doc);
    updateElementValue({
        el: "fax_end",
        val: "8200"
    }, doc);

    $P("#form", document).valid()
}

function compareLength(value, element) {
    if ($('#disable_extension_ranges:checked').length) {
        return true;
    }

    var selfRange = $(element).parent().parent(),
        start = $('[id$="_start"]', selfRange).val(),
        end = $('[id$="_end"]', selfRange).val();

    if (start && end && start.length > end.length) {
        return false;
    }

    return true;
}

function isRangeConflict(value, element) {
    if ($('#disable_extension_ranges:checked').length) {
        return true;
    }

    var selfRange = $(element).parent().parent(),
        start = $('[id$="_start"]', selfRange).val(),
        end = $('[id$="_end"]', selfRange).val();

    start = Number(start);
    end = Number(end);

    var otherRange = $('.extRange').not(selfRange),
        length = otherRange.length;

    for (var i = 0; i < length; i++) {
        var comp_start = $('[id$="_start"]', otherRange[i]).val(),
            comp_end = $('[id$="_end"]', otherRange[i]).val();

        comp_start = Number(comp_start);
        comp_end = Number(comp_end);

        if (start.isValueInBetween(comp_start, comp_end)) {
            return false;
        } else if (end.isValueInBetween(comp_start, comp_end)) {
            return false;
        }
    }

    return true;
}

function isRangeUe(value, element) {
    if ($('#disable_extension_ranges:checked').length) {
        return true;
    }

    var selfRange = $(element).parent().parent(),
        start = $('[id$="_start"]', selfRange).val(),
        end = $('[id$="_end"]', selfRange).val();

    start = Number(start);
    end = Number(end);

    var ueStart = $("#ue_start").val(),
        ueEnd = $("#ue_end").val();

    ueStart = Number(ueStart);
    ueEnd = Number(ueEnd);

    if (start < ueStart || end > ueEnd) {
        return false;
    }

    return true;
}

function isRangeUeConflict(value, element) {
    if ($('#disable_extension_ranges:checked').length) {
        return true;
    }

    var selfRange = $(element).parent().parent(),
        start = $('[id$="_start"]', selfRange).val(),
        end = $('[id$="_end"]', selfRange).val();

    start = Number(start);
    end = Number(end);

    var otherRange = $('.zcuePkueRange').not(selfRange),
        length = otherRange.length;

    for (var i = 0; i < length; i++) {
        var comp_start = $('[id$="_start"]', otherRange[i]).val(),
            comp_end = $('[id$="_end"]', otherRange[i]).val();

        comp_start = Number(comp_start);
        comp_end = Number(comp_end);

        if (start.isValueInBetween(comp_start, comp_end)) {
            return false;
        } else if (end.isValueInBetween(comp_start, comp_end)) {
            return false;
        }
    }

    return true;
}

function transData(res, cb) {
    var arr = [];

    arr[0] = {
        'text': $P.lang("LANG133"),
        'locale': 'LANG133'
    };

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
            obj["locale"] = "LANG565 '" + obj["text"] + "'";
        }

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
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
    selectbox = UCMGUI.domFunction.selectbox,
    appendOpts = selectbox.appendOpts,
    featureCodes = "",
    featureMaps = "",
    featureSettings = "",
    numberList = [],
    numberListWithoutFCodes = [],
    extenPrefSettings = "",
    inbound_mode = 0;

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG610"));

    if (mWindow.location.search == "?scrollBottom") {
        var scrollHeight = $(document).height()-$(window).height();
        $(document).scrollTop(scrollHeight);
    }

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: 'barge_enable',
        enableList: ['fcode_barge_listen', 'fcode_barge_whisper', 'fcode_barge_barge']
    }, doc);

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: 'enable_inboud_multi_mode',
        enableList: ['inbound_mode', 'fcode_inbound_mode_zero', 'fcode_inbound_mode_one']
    }, doc);

    var aChecks = ['fcode_dnd_on', 'fcode_dnd_off', 'fcode_cfb_on', 'fcode_cfb_off', 'fcode_cfn_on', 'fcode_cfn_off', 'fcode_cfu_on', 'fcode_cfu_off',
                    'fcode_dialvm', 'fcode_vmmain', 'fcode_agentpause', 'fcode_agentunpause', 'fcode_paging_prefix', 'fcode_intercom_prefix', 'fcode_blacklist_add',
                    'fcode_blacklist_remove', 'fcode_pickup', 'fgeneral_pickupexten', 'fcode_direct_vm', 'fcode_direct_phonenumber', 'fcode_cc_request', 'fcode_cc_cancel',
                    'fcode_seamless_transfer', 'number_seamless_transfer', 'fcode_ucm_wakeup', 'fcode_wakeup', 'fcode_pms_status'
                ],
        ele;

    for (var i = 0; i < aChecks.length; i++) {
        ele = aChecks[i];

        UCMGUI.domFunction.enableCheckBox({
            enableCheckBox: 'enable_' + ele,
            enableList: [ele]
        }, doc);
    }

    mohNameList = UCMGUI.isExist.getList("getMohNameList");

    var opts = transData(mohNameList);

    selectbox.appendOpts({
        el: "parkedmusicclass",
        opts: opts
    }, doc);

    $("#barge_enable").bind("change", function(ev) {
        var me = this;

        if (me.checked) {
            top.dialog.dialogConfirm({
                type: "warning",
                confirmStr: $P.lang("LANG4020").format($P.lang("LANG4018"), $P.lang("LANG727")),
                buttons: {
                    ok: function() {
                        me.updateStatus();
                    },
                    cancel: function() {
                        me.checked = false;

                        me.updateStatus();

                        top.Custom.init(doc, me);
                    }
                }
            });
        }

        ev.stopPropagation();
    });

    $("#enable_inboud_multi_mode").bind("change", function(ev) {
        var me = this;

        if (!me.checked) {
            top.dialog.dialogConfirm({
                type: "warning",
                confirmStr: $P.lang("LANG4301"),
                buttons: {
                    ok: function() {
                        me.updateStatus();
                        $("#inbound_mode").val(0);
                        top.Custom.init(doc, $("#inbound_mode")[0]);
                        top.Custom.init(doc, me);
                    },
                    cancel: function() {
                        me.checked = true;

                        me.updateStatus();
                        $("#inbound_mode").val(inbound_mode);
                        top.Custom.init(doc, $("#inbound_mode")[0]);
                        top.Custom.init(doc, me);
                    }
                }
            });
        }
        else {
            $("#inbound_mode").val(inbound_mode);
            top.Custom.init(doc, $("#inbound_mode")[0]);
        }

        ev.stopPropagation();
    });

    initValidator();

    getFeatureCodes();

    getInboundMode();

    getExtenPrefSettings();

    numberList = UCMGUI.isExist.getList("getNumberList");
    // accountExt = UCMGUI.isExist.getList("getAccountList");

    numberListWithoutFCodes = numberList.copy(numberListWithoutFCodes);

    for (var id in featureCodes) {
        if (featureCodes.hasOwnProperty(id)) {
            numberListWithoutFCodes.remove(featureCodes[id]);
        }
    }

    $(".btn-paging").bind("click", function(ev) {
        var action = $(this).attr("action"),
            actionParam = $(this).attr("actionParam"),
            actionParamDom = $("#" + actionParam)[0];

        if (action == "resetClass") {
            updateDocument(featureCodes, actionParamDom);
            updateDocument(featureMaps, actionParamDom);
            updateDocument(featureSettings, actionParamDom);
        } else if (action == "defaultClass") {
            var els = UCMGUI.findInputFields(actionParamDom, mWindow.document);

            $.each(els, function(index, item) {
                item = $(item);
                if (item[0] && item[0].type == "checkbox") {
                    item[0].checked = (item.attr("dfalt") == "yes" ? true : false);

                    if (item[0].updateStatus) {
                        item[0].updateStatus();
                    }
                } else {
                    item.val(item.attr("dfalt"));
                }
            });
        }

        $P("#form", doc).valid();

        top.Custom.init(doc);

        ev.stopPropagation();

        return false;
    });

    // bind blind/attend transfer checkbox
    $('.share_dial').bind('change', function() {
        var val = $(this).val();

        $('.share_dial').val(val);
        $('.share_dial').prev().text($(this).find("option[value=" + val + "]").text());

        top.Custom.init(document);
    });

    top.Custom.init(doc);
});

function getFeatureCodes() {
    var action = {
        "action": "getFeatureCodes"
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response;

                featureCodes = response.feature_codes;
                featureMaps = response.feature_maps;
                featureSettings = response.feature_settings;

                featureCodes["barge_enable"] = featureSettings["barge_enable"];

                updateDocument(featureCodes, document);
                updateDocument(featureMaps, document);
                updateDocument(featureSettings, document);
            }
        }
    });
}

function getInboundMode() {
    var action = {
        "action": "getInboundMode"
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var response = data.response;

                inbound_mode = response.inbound_mode.inbound_mode;

                $("#inbound_mode").val(inbound_mode);

                featureCodes.inbound_mode = inbound_mode;
            }
        }
    });
}

function validateFeatureMap(value, element) {
    if (!value) {
        return true;
    }

    var texts = ($('.feature_map > input[type="text"]').not($(element))),
        len = texts.length;

    for (var i = 0; i < len; i++) {
        if (texts[i].value === value) {
            return false;
        }
    }

    return true;
}

function getExtenPrefSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getExtenPrefSettings"
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                extenPrefSettings = data.response.extension_pref_settings;
            }
        }
    });
}

function checkFeatureCode(value, except_id) {
    var texts = $('input', '.feature_code, .feature_dnd'),
        texts = texts.not($('#' + except_id)),
        len = texts.length;

    for (var i = 0; i < len; i++) {
        if (texts[i].value === value) {
            return true;
        }
    }

    return false;
}

function validateParkpos(value, element) {
    if (!value) {
        return true;
    }

    if (!value.match(/^[0-9]+\-[0-9]+$/)) {
        // pattern will take care it
        return true;
    }

    // lets split
    var splits = value.split('-'),
        pos_start = parseInt(splits[0], 10),
        pos_end = parseInt(splits[1], 10);

    if (pos_start > pos_end) {
        return false;
    }

    //if ($('#park_as_extension')[0].checked) {
        //if (extenPrefSettings.disable_extension_ranges && extenPrefSettings.disable_extension_ranges != 'yes') {
            var prefs = {
                ue: 'User Extensions',
                zcue: 'Zero Config Extensions',
                pkue: 'Pick Extensions',
                mm: 'Conference Extensions',
                qe: 'Queue Extensions',
                vme: 'Voicemail Extensions',
                rge: 'Ring Group Extensions',
                vmg: 'Voicemail Group Extensions',
                fax: 'Fax Extensions'
            };

            for (pref in prefs) {
                if (!prefs.hasOwnProperty(pref)) {
                    continue;
                }

                var start = extenPrefSettings[pref + '_start'],
                    end = extenPrefSettings[pref + '_end'];

                if ((pos_start >= start && pos_start <= end) || (pos_end >= start && pos_end <= end) || (pos_start < start && pos_end >= start)) {
                    return false;
                }
            }
        //}
    //}

    var parkext = $('#parkext').val();

    for (var i = pos_start; i <= pos_end; i++) {
        if ($('#park_as_extension')[0].checked) {
            if (UCMGUI.inArray(i, numberListWithoutFCodes)) {
                return false;
            }
        }

        var val = i.toString();

        if (checkFeatureCode(val, 'parkpos') || (parkext === val)) {
            return false;
        }
    }

    return true;
}

function validateParkposFormate(value, element) {
    if (/^[1-9]\d*\-[1-9]\d*$/.test(value)) {
        return true;
    }

    return false;
}

function validateParkposRange(value, element) {
    var splits = value.split('-'),
        pos_start = parseInt(splits[0], 10),
        pos_end = parseInt((splits[1] ? splits[1] : ""), 10);

    if ((typeof pos_start === "number") && (typeof pos_end === "number") && (pos_start >= 1) && (pos_end <= 10000)) {
        $('#parkext').removeAttr("disabled");

        return true;
    }

    $('#parkext').attr("disabled", true);

    return false;
}

function checkExtensionExists(value, element) {
    if (UCMGUI.inArray(value, numberListWithoutFCodes)) {
        return false;
    }

    return true;
}

function validateParkext(value, element) {
    var splits = $('#parkpos').val().split('-'),
        pos_start = parseInt(splits[0], 10),
        pos_end = parseInt((splits[1] ? splits[1] : ""), 10);

    for (var i = pos_start; i <= pos_end; i++) {
        if (value === i.toString()) {
            return false;
        }
    }

    if (checkFeatureCode(value, $(element).attr('id'))) {
        return false;
    }

    return true;
}

function checkEditValueExistance(value, element) {
    var id = $(element).attr("id"),
        tmpNumberList = [];

    if (checkFeatureCode(value, id)) {
        return false;
    }

    if (value == $('#parkext').val()) {
        return false;
    }

    return true;
}

function checkExist(value, element) {
    if ($(element).attr('id') === 'fcode_pickup') {
        return true;
    }

    var val = $("#fcode_pickup").val(),
        len = val.length;

    value = value.substring(0, len);

    if (val == value) {
        return false;
    }

    return true;
}


function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "featuredigittimeout": {
                required: true,
                digits: true,
                range: [800,10000],
            },
            // "parkext": {
            //     required: true,
            //     digits: true,
            //     customCallback: [$P.lang("LANG2126"), checkExtensionExists],
            //     customCallback2: [$P.lang("LANG2209"), validateParkext]
            // },
            "parkpos": {
                required: true,
                pattern: /[0-9]+\-[0-9]+/,
                customCallback: [$P.lang("LANG2133"), validateParkpos],
                customCallback1: [$P.lang("LANG2644"), validateParkposFormate]
            },
            "parkingtime": {
                required: true,
                digits: true,
                min: 1
            }
        },
        submitHandler: function() {
            saveChanges();
        }
    });

    $P("#parkext", document).rules("add", {
        required: true,
        digits: true,
        range: [1, 10000],
        customCallback: [$P.lang("LANG2126"), checkExtensionExists],
        customCallback1: [$P.lang("LANG2209"), validateParkext]
    });

    $P("#parkpos", document).rules("add", {
        required: true,
        pattern: /[0-9]+\-[0-9]+/,
        customCallback: [$P.lang("LANG2644"), validateParkposFormate],
        customCallback1: [$P.lang("LANG3511").format("1", "10000"), validateParkposRange],
        customCallback2: [$P.lang("LANG2133"), validateParkpos]
    });

    $P("#fcode_pickup, #fcode_dialvm, #fcode_vmmain, #fcode_agentpause," +
            "#fcode_pms_status, #fcode_ucm_wakeup, #fcode_wakeup, " +
            "#fcode_inbound_mode_zero, #fcode_inbound_mode_one, " +
            "#fcode_barge_listen, #fcode_barge_whisper, #fcode_barge_barge, " +
            "#fcode_agentunpause, #fcode_paging_prefix, #fcode_intercom_prefix, " +
            "#fcode_blacklist_add, #fcode_blacklist_remove, #fgeneral_pickupexten, " +
            "#fcode_direct_vm, #fcode_direct_phonenumber, #fcode_dnd_on, #fcode_dnd_off, #fcode_cfb_on, #fcode_cfb_off, " +
            "#fcode_cfn_on, #fcode_cfn_off, #fcode_cfu_on, #fcode_cfu_off, #fcode_cc_request, #fcode_cc_cancel, " +
            '#number_seamless_transfer', document).rules("add", {

        required: true,
        numeric_pound_star: true,
        customCallback: [$P.lang("LANG2126"), checkExtensionExists],
        customCallback1: [$P.lang("LANG2209"), checkEditValueExistance],
        customCallback2: [$P.lang("LANG5205"), checkExist]
    });

    $P("#blindxfer, #atxfer, #disconnect, #parkcall, #automon, #automixmon, #fcode_seamless_transfer", document).rules("add", {
        required: true,
        numeric_pound_star: true,
        customCallback: [$P.lang("LANG2208"), validateFeatureMap]
    });
}

function saveChanges() {
    var action = {};

    action = UCMGUI.formSerializeVal(doc, undefined, undefined, true);

    action["action"] = "updateFeatureCodes";

    if (action.inbound_mode) {
        delete action.inbound_mode;
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
                var callback = function() {
                    // $.ajax({
                    //     type: "post",
                    //     url: "../cgi",
                    //     data: {
                    //         'action': 'setPMS',
                    //         'start_fastagi': action['enable_fcode_pms']
                    //     },
                    //     error: function(jqXHR, textStatus, errorThrown) {
                    //         // top.dialog.dialogMessage({
                    //         //     type: 'error',
                    //         //     content: errorThrown
                    //         // });
                    //     },
                    //     success: function(data) {
                    //         var bool = UCMGUI.errorHandler(data);

                    //         if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG4764")
                                });

                                getFeatureCodes();
                    //         }
                    //     }
                    // });
                };

                if (!$('#enable_inboud_multi_mode').is(':checked')) {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: {
                            'action': 'updateInboundMode',
                            'inbound_mode': 0
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: errorThrown
                            // });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                callback();
                            }
                        }
                    });
                } else if($('#enable_inboud_multi_mode').is(':checked')) {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: {
                            'action': 'updateInboundMode',
                            'inbound_mode': $("#inbound_mode").val()
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // top.dialog.dialogMessage({
                            //     type: 'error',
                            //     content: errorThrown
                            // });
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                callback();
                            }
                        }
                    });
                } else {
                    callback();
                }
            }
        }
    });
}

function updateDocument(data, doc) {
    if (typeof data == "object") {
        for (var attr in data) {
            if (data.hasOwnProperty(attr)) {
                var el = $("#" + attr, doc),
                    noSerialize = el.attr("noSerialize"),
                    noSerializeExcep = el.attr("noSerializeExcep"),
                    attr = data[attr];

                if (!noSerialize || noSerializeExcep) {
                    if (el[0] && el[0].tagName == "DIV") {
                        el.html(attr);
                    } else if (el[0] && el[0].tagName == "SPAN") {
                        el.text(attr);
                    } else if (el[0] && el[0].type == "checkbox") {
                        el[0].checked = ((attr == "yes") ? true : false);

                        if (el[0].updateStatus) {
                            el[0].updateStatus();
                        }
                    } else {
                        el.val(attr);
                    }
                }
            }
        }
    }
}

function transData(res) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};
            obj["text"] = res[i];
            obj["val"] = res[i];

        arr.push(obj);
    }

    return arr;
}

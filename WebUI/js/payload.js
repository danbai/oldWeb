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
    chkG726 = $("#option_g726_compatible_g721"),
    g726 = $("#ast_format_g726"),
    payloads = {
        'ast_format_g726_aal2': '112',
        'ast_rtp_dtmf': '101',
        'ast_format_g726': '2',
        'ast_format_ilbc': '97',
        'ast_format_opus': '123',
        'ast_format_h264': '99',
        'ast_format_h263_plus': '100,103',
        "option_g726_compatible_g721": "yes",
        "ast_format_main_video_fec": "120",
        "ast_format_slides_video_fec": "120",
        "ast_format_audio_fec": "120",
        "ast_format_main_video_red": "122",
        "ast_format_slides_video_red": "122",
        "ast_format_audio_red": "122",
        "ast_format_fecc": "125"
    };

String.prototype.format = top.String.prototype.format;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2898"));

    initValidator();

    UCMGUI.domFunction.setDfaltVal(document);
    getPayload();

    $(".btn-paging").bind("click", function(ev) {
        var action = $(this).attr("action"),
            actionParam = $(this).attr("actionParam"),
            actionParamDom = $("#" + actionParam)[0];

        if (action == "resetClass") {
            updateDocument(payloads, actionParamDom, actionParam);
        } else if (action == "defaultClass") {
            var els = UCMGUI.findInputFields(actionParamDom, mWindow.document);

            $.each(els, function(index, item) {
                if (item && item.type == "checkbox") {
                    var attr = ($(item).attr("dfalt") == "yes") ? true : false;

                    item.checked = attr;
                } else {
                    item = $(item);
                    item.val(item.attr("dfalt")).attr('disabled', false);
                }
            });

            if ('audio' == actionParam) {
                if ($('#option_g726_compatible_g721').is(":checked")) {
                    $('#ast_format_g726').attr('disabled', true);
                }
            }
        }

        $P("#form", doc).valid();

        top.Custom.init(doc);

        ev.stopPropagation();
        return false;
    });

    chkG726.bind("click", function(ev) {
        if (chkG726.is(":checked")) {
            g726.val('2').attr('disabled', true);
        } else {
            g726.val('111').attr('disabled', false);
        }

        ev.stopPropagation();
    });

    top.Custom.init(doc);
});

function checkPayloadExists(value, element) {
    var inputs = $('input:visible'),
        els = inputs.not(element),
        existed = true;

    if ($('input.fec').filter(element).length != 0) {
        els = inputs.not($('input.fec'));
    } else if ($('input.rtp_redundant_encoding').filter(element).length != 0) {
        els = inputs.not($('input.rtp_redundant_encoding'));
    } else if ($('input.rtp_fecc_encoding').filter(element).length != 0) {
        els = inputs.not($('input.rtp_fecc_encoding'));
    }

    els.each(function() {
        if ($(this).val() == value) {
            existed = false;

            return true;
        }
    });

    return existed;
}

function getPayload() {
    var action = {
        "action": "getPayloadSettings"
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

                payloads = !$.isEmptyObject(response.payload_settings[0]) ? response.payload_settings[0] : payloads;

                updateDocument(payloads, doc, 'audio');

                top.Custom.init(doc);
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "ast_format_g726_aal2": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_rtp_dtmf": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_g726": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_ilbc": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_opus": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_h264": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_main_video_fec": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_slides_video_fec": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_audio_fec": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "h263p_1": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "h263p_2": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_vp8": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_main_video_red": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_slides_video_red": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_audio_red": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            },
            "ast_format_fecc": {
                required: true,
                digits: true,
                range: [96, 127],
                customCallback: [$P.lang("LANG2728"), checkPayloadExists]
            }
        },
        submitHandler: function() {
            saveChanges();
        }
    });
}

function saveChanges() {
    var action = {},
        h263P = [];

    action = UCMGUI.formSerializeVal(doc);
    var astFormatMainVideoFec = action["ast_format_main_video_fec"];
    var astFormatMainVideoRed = action["ast_format_main_video_red"];

    action["ast_format_slides_video_fec"] = astFormatMainVideoFec;
    action["ast_format_audio_fec"] = astFormatMainVideoFec;
    action["ast_format_slides_video_red"] = astFormatMainVideoRed;
    action["ast_format_audio_red"] = astFormatMainVideoRed;

    h263P.push($('#h263p_1').val());
    h263P.push($('#h263p_2').val());

    action["action"] = "updatePayloadSettings";

    action["ast_format_h263_plus"] = h263P.toString();

    if (chkG726.is(":checked")) {
        action["option_g726_compatible_g721"] = "yes";
        action["ast_format_g726"] = '2'
    }

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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });

                getPayload();
            }
        }
    });
}

function updateDocument(data, doc, actionParam) {
    if (typeof data == "object") {
        for (var attr in data) {
            if (data.hasOwnProperty(attr)) {
                if ('ast_format_h263_plus' === attr) {
                    var h263P = data[attr].split(',');

                    $("#h263p_1", doc).val(h263P[0]);
                    $("#h263p_2", doc).val(h263P[1]);
                } else {
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
                            attr = (attr == "yes") ? true : false;
                            el[0].checked = attr;
                        } else {
                            el.val(attr);
                        }
                    }
                }
            }
        }

        if ('audio' == actionParam) {
            var g726 = $('#ast_format_g726');

            if ('yes' == data.option_g726_compatible_g721) {
                g726.val('2').attr('disabled', true);
            } else {
                if (g726.attr('disabled')) {
                    g726.attr('disabled', false);
                }
            }
        }
    }
}
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
    setDefaultsWhenCreate = UCMGUI.setDefaultsWhenCreate,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = gup.call(window, "mode"),
    oldCallbackName = "",
    callbackId = "",
    optionSets = {
        // 'account': {},
        // 'voicemail': {},
        // 'conference': {},
        // 'vmgroup': {},
        'ivr': {},
        // 'ringgroup': {},
        // 'queue': {},
        // 'paginggroup': {},
        // 'fax': {},
        'disa': {} //,
        // 'directory': {},
        // 'external_number': {}
    };

Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    initForm();

    if (mode == 'edit') {
        callbackId = gup.call(window, "callbackId");

        getCallbackInfo(callbackId);
    } else {
        setDefaultsWhenCreate(doc);

        top.Custom.init(doc);
    }

    initValidator();
});

function initForm() {
    var destinationList = [
            // $P.lang("LANG5206"),
            // $P.lang("LANG90"),
            // $P.lang("LANG98"),
            // $P.lang("LANG89"),
            "IVR",
            // $P.lang("LANG600"),
            // $P.lang("LANG91"),
            // $P.lang("LANG94"),
            // $P.lang("LANG95"),
            $P.lang("LANG2353") //,
            // $P.lang("LANG2884"),
            // $P.lang("LANG3458")
        ],
        valueList = [
            // "account",
            // "voicemail",
            // "conference",
            // "vmgroup",
            "ivr",
            // "ringgroup",
            // "queue",
            // "paginggroup",
            // "fax",
            "disa" //,
            // "directory",
            // "external_number"
        ];

    //$("#destination_type").append('<option value="">' + $P.lang("LANG1485") + '</option>');

    appendlist({
        el: "destination_type",
        destinationList: destinationList,
        valueList: valueList,
        addnone: 0
    });

    $("#destinationEventSelect").attr("noSerialize", true).hide();
    $("#destinationEventText").attr("noSerialize", true).hide();

    $("#destination_type").bind("change", function(ev) {
        destinationSwitch(this);

        ev.stopPropagation();
    }).val("disa").trigger("change");
}

function destinationSwitch(obj) {
    var value = $(obj).val(),
        array = [],
        destinationInfo = mWindow.destinationInfo[value];

    array = destinationInfo ? destinationInfo : [];

    destinationEventSwitch(array, obj);
}

function destinationEventSwitch(arr, obj) {
    var value = $(obj).val(),
        eventid = ("destinationEventSelect"),
        elEvent = $("#" + eventid),
        eventTextid = ("destinationEventText"),
        elTextEvent = $("#" + eventTextid);

    elEvent.empty();

    if (value == "external_number") {
        elEvent.hide();
        elTextEvent.show();
        elEvent.prev().hide();
    } else if (value == null || value == "account") {
        elEvent.hide();
        elTextEvent.hide();
        elEvent.prev().hide();
    } else {
        elEvent.show();
        elTextEvent.hide();
        elEvent.prev().show();

        if (arr && arr.length) {
            if (!optionSets[value].length) {
                selectbox.appendOpts({
                    el: eventid,
                    opts: arr
                }, document);

                optionSets[value] = elEvent.contents();
            } else {
                elEvent.append(optionSets[value].clone())[0].selectedIndex = 0;
            }
        }
        // else {
        //     elEvent.append('<option value="">' + $P.lang("LANG133") + '</option>');
        // }
    }

    top.Custom.init(document, elEvent[0]);
}

function appendlist(options) {
    var el = options.el,
        destinationList = options.destinationList,
        valueList = options.valueList,
        // addnone = options.addnone,
        element = $("#" + el);

    // if (addnone) {
    //     element.append('<option value="">' + $P.lang("LANG133") + '</option>');
    // } else {
    //     if (!destinationList.length) {
    //         element.append('<option value="">' + $P.lang("LANG133") + '</option>');
    //     }
    // }

    for (var i = 0; i < destinationList.length; i++) {
        element.append($("<option>").attr({
            'value': valueList[i]
        }).text(destinationList[i]));
    }
}

function callbackNameIsExist() {
    var name = $("#name").val(),
        callbackNameList = mWindow.callbackNameList,
        tmpCallbackNameList = [];

    tmpCallbackNameList = callbackNameList.copy(tmpCallbackNameList);

    if (oldCallbackName) {
        tmpCallbackNameList.remove(oldCallbackName);
    }

    return !UCMGUI.inArray(name, tmpCallbackNameList);
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
                isExist: [$P.lang("LANG2137"), callbackNameIsExist],
            },
            "number": {
                digits: true
            },
            "callerid_pattern": {
                digitalAndQuote: true
            },
            "outside_pre": {
                phoneNumberOrExtension: true
            },
            "sleep_time": {
                required: true,
                digits: true,
                range: [1, 60]
            },
            "destination_type": {
                required: true
            },
            "destinationEventSelect": {
                required: true
            },
            "destinationEventText": {
                required: true
            }
        },
        submitHandler: function() {
            var action = {};

            action = UCMGUI.formSerializeVal(document);

            if (mode == "edit") {
                action["callback"] = callbackId;
            }

            action["action"] = (mode == 'edit' ? "updateCallback" : "addCallback");

            var destinationType = $("#destination_type").val();

            if (destinationType == "account") {
                action["account"] = "";
            } else if (destinationType == "external_number") {
                action["external_number"] = $("#destinationEventText").val();
            } else {
                action[destinationType] = $("#destinationEventSelect").val();
            }

            updateOrAddCallbackInfo(action);
        }
    });
}

function updateOrAddCallbackInfo(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

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
                        mWindow.$("#callback-list", mWindow.document).trigger('reloadGrid');

                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

function getCallbackInfo(ext) {
    var action = {
        "action": "getCallback",
        "callback": ext
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var callback = data.response.callback;

                oldCallbackName = callback.name;

                UCMGUI.domFunction.updateDocument(callback, document);

                $("#destination_type").trigger("change");

                var destinationType = $("#destination_type").val();

                if (destinationType == "external_number") {
                    $("#destinationEventText").val(callback["external_number"]);
                } else if (destinationType != "account") {
                    $("#destinationEventSelect").val(callback[destinationType]);
                }

                mWindow.getNameList();

                top.Custom.init(doc);
            }
        }
    });
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj["val"] = res[i];

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
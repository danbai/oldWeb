/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    gup = UCMGUI.gup,
    mode = gup.call(window, "mode"),
    oldStationName = "";

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
        prepareEditItemForm()
    }

    initValidator();
});

function initForm() {
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
}

function prepareAddItemForm() {
    var slaStationList = mWindow.slaStationList,
        accountObjectList = mWindow.accountObjectList,
        slaTrunkNameList = mWindow.slaTrunkNameList,
        availableAccount = [];

    for (var i = 0, length = accountObjectList.length; i < length; i++) {
        var account = accountObjectList[i]['val'];

        if (!UCMGUI.inArray(account, slaStationList)) {
            availableAccount.push(accountObjectList[i]);
        }
    }

    selectbox.appendOpts({
        el: "leftSelect",
        opts: transSLATrunkName(slaTrunkNameList)
    }, doc);

    selectbox.appendOpts({
        el: "station",
        opts: availableAccount
    }, doc);
}

function prepareEditItemForm() {
    var station = gup.call(window, "station");

    selectbox.appendOpts({
        el: "station",
        opts: mWindow.accountObjectList
    }, doc);

    getSLAStationInfo(station);
}

function getSLAStationInfo(name) {
    var action = {
        "action": "getSLAStation",
        "sla_station": name
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
                var stationInfo = data.response.sla_station;

                if (stationInfo.ringtimeout == 0) {
                    stationInfo.ringtimeout = '';
                }

                if (stationInfo.ringdelay == 0) {
                    stationInfo.ringdelay = '';
                }

                oldStationName = stationInfo.station_name;

                UCMGUI.domFunction.updateDocument(stationInfo, doc);

                $('#station').val(stationInfo.station).attr('disabled', true);

                var slaTrunkNameList = mWindow.slaTrunkNameList,
                    trunksArr = (stationInfo.trunks ? stationInfo.trunks.split(",") : []),
                    tmpSLATrunkName = [];

                tmpSLATrunkName = Array.prototype.copy.call(slaTrunkNameList, tmpSLATrunkName);
                tmpSLATrunkName.remove(trunksArr);

                var rightRinggroupExt = transSLATrunkName(trunksArr),
                    leftRinggroupExt = transSLATrunkName(tmpSLATrunkName);

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

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "station_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                isExist: [$P.lang("LANG2137"), stationNameIsExist]
            },
            "station": {
                required: true
            },
            "rightSelect": {
                selectItemMin: 1,
                selectItemMax: [16, $P.lang('LANG128').toLowerCase()]
            },
            "ringtimeout": {
                digits: true,
                range: [0, 300]
                // bigger: [$P.lang("LANG1598"), $P.lang("LANG3235"), $('#ringdelay')]
            },
            "ringdelay": {
                digits: true,
                range: [0, 300]
                // smaller: [$P.lang("LANG3235"), $P.lang("LANG1598"), $('#ringtimeout')]
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG904")
            });

            var action = {},
                trunks = [],
                station = $("#station").val();

            action = UCMGUI.formSerializeVal(document);

            action["action"] = (mode == 'edit' ? "updateSLAStation" : "addSLAStation");

            action["sla_station"] = station;

            $.each($("#rightSelect").children(), function(index, item) {
                trunks.push($(item).val());
            });

            action["trunks"] = trunks.toString();

            updateOrAddSLAStationInfo(action);
        }
    });
}

function stationNameIsExist() {
    var stationName = $("#station_name").val(),
        slaStationNameList = mWindow.slaStationNameList,
        tmpSLAStationNameList = [];

    tmpSLAStationNameList = slaStationNameList.copy(tmpSLAStationNameList);

    if (oldStationName) {
        tmpSLAStationNameList.remove(oldStationName);
    }

    return !UCMGUI.inArray(stationName, tmpSLAStationNameList);
}

function updateOrAddSLAStationInfo(action) {
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
                        mWindow.$("#sla-station-list", mWindow.document).trigger('reloadGrid');

                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

function transSLATrunkName(res, cb) {
    var arr = [],
        analogtrunkObj = mWindow.analogtrunkObj;

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        var disabled = analogtrunkObj[res[i]];

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = res[i] + ' <' + $P.lang('LANG273') + '>';
        } else {
            obj["text"] = res[i];
        }
        obj["val"] = res[i];

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}
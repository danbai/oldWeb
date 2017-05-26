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
    gup = UCMGUI.gup,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    mode = gup.call(window, "mode"),
    oldRoom = gup.call(window, "room"),
    oldAddress = gup.call(window, "address"),
    roomUsed = mWindow.roomUsed,
    roomList = mWindow.roomList;

Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.sortBy = top.Array.prototype.sortBy;
Array.prototype.lastValue = top.Array.prototype.lastValue;
String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    initForm();

    initValidator();

    if (mode === 'edit') {
        getPMSWakeUp(oldAddress);
    }

    top.Custom.init(doc);
});

function checkTime(val, ele) {
    if (val === '' || val.match(/^\d{4}\-\d{2}\-\d{2}$/)) {
        return true;
    }

    return false;
}

function checkAction(val, ele) {
    if (val == '2') {
        return false;
    }

    return true;
}

function getPMSWakeUp(index) {
    var action = {
        "action": "getPMSWakeUp",
        "address": index
    };

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
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
                var wakeupData = data.response.address,
                    date = wakeupData.w_date,
                    time = wakeupData.w_time,
                    datepicker, year, month, day, hour, minute;

                if (date && date.substr) {
                    year = date.substr(0, 4);
                    month = date.substr(4, 2);
                    day = date.substr(6, 2);
                    datepicker = year + '-' + month + '-' + day;
                } else {
                    datepicker = '';
                }

                if (time && time.substr) {
                    hour = time.substr(0, 2);
                    minute = time.substr(2, 2);
                }

                $("#date").datepicker("setDate", datepicker);
                $('#time_hour').val(hour);
                $('#time_minute').val(minute);

                UCMGUI.domFunction.updateDocument(wakeupData, doc);

                $('#room').val(oldRoom).attr({'disabled': true});
            }
        }
    });
}

function initForm() {
    var allRoom = roomList,
        availableRoom = [],
        existedRoom = [];

    existedRoom = roomUsed.copy(existedRoom);

    if (mode === 'edit') {
        existedRoom.remove(oldRoom);
    }

    for (var i = 0, length = allRoom.length; i < length; i++) {
        if (!UCMGUI.inArray(allRoom[i], existedRoom)) {
            availableRoom.push(allRoom[i]);
        }
    }

    selectbox.appendOpts({
        el: "room",
        opts: transRoomData(availableRoom)
    }, doc);

    $("#date").datetimepicker({
        showOn: "button",
        showTimepicker: false,
        buttonImage: "../images/calendar.png",
        buttonImageOnly: true,
        buttonText: '',
        dateFormat: 'yy-mm-dd'
    });

    $("#time_hour")[0].selectedIndex = -1;
    $("#time_minute")[0].selectedIndex = -1;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "room": {
                required: true
            },
            "w_action": {
                customCallback: [$P.lang("LANG4959").format($P.lang('LANG4870')), checkAction]
            },
            "date": {
                required: true,
                customCallback: [$P.lang("LANG2767"), checkTime]
            },
            "time_hour": {
                required: true
            },
            "time_minute": {
                required: true
            }
        },
        submitHandler: function() {
            saveWakeUp();
        }
    });
}

function saveWakeUp() {
    var action = {};

    action = UCMGUI.formSerializeVal(doc);

    if (mode == "edit") {
        action["action"] = "updatePMSWakeUp";
        action["address"] = oldAddress;
    } else if (mode == "add") {
        action["action"] = "addPMSWakeUp";
    }

    action["send_status"] = '1';
    action["w_date"] = $('#date').val().replace(/-/ig, '');
    action["w_time"] = $('#time_hour').val() + $('#time_minute').val();

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
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
                top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#wakeup-list", mWindow.document).trigger('reloadGrid');

                        // refresh lists
                        mWindow.getLists();
                    }
                });
            }
        }
    });
}

function setSystemTime() {
    var sysTime = $(".sysTime", top.frames["frameContainer"].document).text(),
        date = sysTime.split(' ')[0],
        time = sysTime.split(' ')[1],
        datepicker, year, month, day, hour, minute;

    year = date.substr(0, 4);
    month = date.substr(5, 2);
    day = date.substr(8, 2);
    hour = time.substr(0, 2);
    minute = time.substr(3, 2);

    datepicker = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':00';

    $("#date").datepicker("setDate", datepicker);
}

function transRoomData(res, cb) {
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
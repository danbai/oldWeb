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
    oldExtension = gup.call(window, "extension"),
    existRooms = mWindow.existRooms,
    PMSProtocol = mWindow.PMSProtocol,
    existAddress = mWindow.existAddress,
    existAccounts = mWindow.existAccounts,
    roomAccountList = mWindow.roomAccountList,
    roomAccountObj = mWindow.roomAccountObj;

Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.sortBy = top.Array.prototype.sortBy;
Array.prototype.lastValue = top.Array.prototype.lastValue;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;
String.prototype.withOut = top.String.prototype.withOut;

$(function() {
    $P.lang(doc, true);

    initForm();

    initValidator();

    if (mode === 'edit') {
        getPMSRoom(oldAddress);
    }

    top.Custom.init(doc);
});

function addressIsExist(element) {
    var room = element.value,
        tmpAddressList = [];

    tmpAddressList = existAddress.copy(tmpAddressList);

    if (oldAddress) {
        tmpAddressList.remove(oldAddress);
    }

    return !UCMGUI.inArray(room, tmpAddressList);
}

function check_address(value, element) {
    var batchNumber = parseInt(value),
        startAddress = parseInt($('#batch_address').val()),
        result = true;

    for (var i = 0; i < batchNumber; i++) {
        if (UCMGUI.inArray((startAddress + i), existAddress)) {
            result = false;
            break;
        }
    }

    return result;
}

function checkFormat(val, ele) {
    if (val.match(/['"`]/)) {
        return false;
    }

    return true;
}

function check_extension(value, element) {
    var batchNumber = parseInt(value),
        startExtension = parseInt($('#batch_extension').val()),
        result = true;

    for (var i = 0; i < batchNumber; i++) {
        if (!UCMGUI.inArray((startExtension + i), roomAccountList) || UCMGUI.inArray((startExtension + i), existAccounts)) {
            result = false;
            break;
        }
    }

    return result;
}

function check_room(value, element) {
    var batchNumber = parseInt(value),
        startRoom = parseInt($('#batch_room').val()),
        result = true;

    for (var i = 0; i < batchNumber; i++) {
        if (UCMGUI.inArray((startRoom + i), existRooms)) {
            result = false;
            break;
        }
    }

    return result;
}

function getPMSRoom(index) {
    var action = {
        "action": "getPMSRoom",
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
                var roomData = data.response.address;

                UCMGUI.domFunction.updateDocument(roomData, doc);

                oldRoom = roomData.room;

                $('#address').attr({'disabled': true});

                $('#pms_room').val(roomData.room);

                if ((roomData.extension && roomData.status !== '0')/* || (PMSProtocol === 'mitel')*/) {
                    $('#extension').attr({'disabled': true});
                }
            }
        }
    });
}

function getNumberRange() {
    var max = roomAccountList.length - existAccounts.length;

    return [1, (max > 1 ? max : 1)];
}

function initForm() {
    var allAccount = roomAccountObj,
        availableAccount = [],
        existed = [];

    existed = existAccounts.copy(existed);

    if (mode === 'edit') {
        existed.remove(oldExtension);
    }

    for (var i = 0, length = allAccount.length; i < length; i++) {
        if (!UCMGUI.inArray(allAccount[i]['val'], existed)) {
            availableAccount.push(allAccount[i]);
        }
    }

    if (mode !== 'batchAdd') {
        selectbox.appendOpts({
            el: "extension",
            opts: availableAccount
        }, doc);

        if (availableAccount.length) {
            $('#address, #pms_room').val(availableAccount[0].val);
        }

        // if (PMSProtocol === 'mitel') {
        //     $('#address, #pms_room').attr({'disabled': true});

        //     $('#extension').bind("change", function(ev) {
        //         $('#address, #pms_room').val($('option:selected', this).val());

        //         ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        //         return false;
        //     });
        // }
    } else {
        selectbox.appendOpts({
            el: "batch_extension",
            opts: availableAccount
        }, doc);

        $('#batch').css('display', 'inline-block').prev().hide();
        
        if (availableAccount.length) {
            $('#batch_address, #batch_room').val(availableAccount[0].val);
        }

        // if (PMSProtocol === 'mitel') {
        //     $('#batch_address, #batch_room').attr({'disabled': true});

        //     $('#batch_extension').bind("change", function(ev) {
        //         $('#batch_address, #batch_room').val($('option:selected', this).val());

        //         ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        //         return false;
        //     });
        // }
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "address": {
                required: true,
                digits: true,
                minlength: 2,
                isExist: [$P.lang("LANG270").format($P.lang("LANG4893").toLowerCase()), addressIsExist]
            },
            "pms_room": {
                required: true,
                // digits: true,
                minlength: 2,
                customCallback: [$P.lang("LANG4465"), checkFormat],
                isExist: [$P.lang("LANG270").format($P.lang("LANG4854").toLowerCase()), roomNumberIsExist]
            },
            "batch_address": {
                required: true,
                digits: true,
                minlength: 2,
                isExist: [$P.lang("LANG270").format($P.lang("LANG4893").toLowerCase()), addressIsExist]
            },
            "batch_room": {
                required: true,
                digits: true,
                minlength: 2,
                isExist: [$P.lang("LANG270").format($P.lang("LANG4854").toLowerCase()), roomNumberIsExist]
            },
            "extension": {
                required: true
            },
            "batch_extension": {
                required: true
            },
            "batch_number": {
                required: true,
                digits: true,
                range: getNumberRange,
                customCallback: [$P.lang("LANG4989").format($P.lang("LANG4893")), check_address],
                customCallback1: [$P.lang("LANG4989").format($P.lang("LANG4854")), check_room],
                customCallback2: [$P.lang("LANG4989").format($P.lang("LANG85")), check_extension]
            }
        },
        submitHandler: function() {
            saveRoom();
        }
    });
}

function roomNumberIsExist(element) {
    var room = element.value,
        tmpRoomNumberList = [];

    tmpRoomNumberList = existRooms.copy(tmpRoomNumberList);

    if (oldRoom) {
        tmpRoomNumberList.remove(oldRoom);
    }

    return !UCMGUI.inArray(room, tmpRoomNumberList);
}

function saveRoom() {
    var action = {};

    if (mode !== 'batchAdd') {
        action = UCMGUI.formSerializeVal(doc);

        if (mode == "edit") {
            action["action"] = "updatePMSRoom";
            action["address"] = oldAddress;
        } else if (mode == "add") {
            action["action"] = "addPMSRoom";
        }

        action["address"] = $('#address').val();
        action["pms_room"] = $('#pms_room').val();
    } else {
        var startRoom = parseInt($('#batch_room').val()),
            startAddress = parseInt($('#batch_address').val()),
            startExtension = parseInt($('#batch_extension').val()),
            batchNumber = parseInt($('#batch_number').val()),
            extensionList = [],
            addressList = [],
            roomList = [];

        for (var i = 0; i < batchNumber; i++) {
            roomList.push(startRoom + i);
            addressList.push(startAddress + i);
            extensionList.push(startExtension + i);
        }

        action["action"] = "addPMSRoom";
        action["extension"] = extensionList.join();
        action["address"] = addressList.join();
        action["pms_room"] = roomList.join();
    }

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
                        mWindow.$("#rooms-list", mWindow.document).trigger('reloadGrid');

                        // refresh lists
                        mWindow.getLists();
                    }
                });
            }
        }
    });
}
/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    config = UCMGUI.config,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = gup.call(window, "mode"),
    oldUri = "";

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.existsSameValues = top.Array.prototype.existsSameValues;

$(function() {
    $P.lang(doc, true);

    initForm();

    if (mode == 'add') {
        prepareAddItemForm();
        top.Custom.init(doc);
    } else if (mode == 'edit') {
        prepareEditItemForm();
    }

    initValidator();

    top.Custom.init(doc);
});

function initForm() {
    selectbox.electedSelect({
        rightSelect: "localRightSelect",
        leftSelect: "localLeftSelect",
        allToRight: "localAllToRight",
        oneToRight: "localOneToRight",
        oneToLeft: "localOneToLeft",
        allToLeft: "localAllToLeft",
        top: "localButtonTop",
        up: "localButtonUp",
        down: "localButtonDown",
        bottom: "localButtonBottom",
        isSort: false,
        cb: function() {
            $P("#localRightSelect", doc).valid();
        }
    }, doc);

    selectbox.electedSelect({
        rightSelect: "remoteRightSelect",
        leftSelect: "remoteLeftSelect",
        allToRight: "remoteAllToRight",
        oneToRight: "remoteOneToRight",
        oneToLeft: "remoteOneToLeft",
        allToLeft: "remoteAllToLeft",
        top: "remoteButtonTop",
        up: "remoteButtonUp",
        down: "remoteButtonDown",
        bottom: "remoteButtonBottom",
        isSort: false,
        cb: function() {
            $P("#remoteRightSelect", doc).valid();
        }
    }, doc);
}

function prepareAddItemForm() {
    var arr = [],
        extgroupList = mWindow.extgroupList,
        eventlistExtList = mWindow.eventlistExtList;

    for (var i = 0; i < extgroupList.length; i++) {
        var obj = {};
        obj["val"] = extgroupList[i]["group_id"];
        obj["text"] = $P.lang("LANG2714") + "--" + extgroupList[i]["group_name"];
        arr.push(obj);
    }

    eventlistExtList = eventlistExtList.concat(arr);

    selectbox.appendOpts({
        el: "localLeftSelect",
        opts: eventlistExtList
    }, doc);

    selectbox.appendOpts({
        el: "remoteLeftSelect",
        opts: mWindow.phonebookDnArr
    }, doc);
}

function prepareEditItemForm() {
    oldUri = gup.call(window, "uri");
    $("#uri").val(oldUri);

    $("#uri").attr("disabled", true);

    getEventlistInfo(oldUri);
}

function extensionIsExist() {
    var uri = $("#uri").val(),
        numberList = mWindow.numberList;

    return !UCMGUI.inArray(uri, numberList);
}

function uriIsExist() {
    var uri = $("#uri").val(),
        uriList = mWindow.uriList,
        tmpUriList = [];

    tmpUriList = uriList.copy(tmpUriList);

    if (oldUri) {
        tmpUriList.remove(oldUri);
    }

    return !UCMGUI.inArray(uri, tmpUriList);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "uri": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                customCallback: [$P.lang("LANG2527"), extensionIsExist],
                customCallback1: [$P.lang("LANG2137"), uriIsExist]
            },
            "localRightSelect": {
                customCallback: [$P.lang("LANG2168").format("1"),
                    function() {
                        var total = $("#localRightSelect").children().length + $("#remoteRightSelect").children().length;

                        if ($('#edit_ext').val()) {
                            total += $('#edit_ext').val().split(',').length;
                        }

                        return total > 0;
                    }
                ],
                customCallback1: [$P.lang("LANG3770").format(200),
                    function() {
                        var localRightSelectLength = $("#localRightSelect").children().length,
                            editExtLength = ($('#edit_ext').val() ? $('#edit_ext').val().split(",").length : 0);
                        if (localRightSelectLength > 0) {
                            var total = $("#remoteRightSelect").children().length + localRightSelectLength + editExtLength + mWindow.extgroupList.length;
                            return total <= 200;
                        } else {
                            return true;
                        }
                    }
                ],
                customCallback2: [$P.lang("LANG2930"),
                    function() {
                        var localRightSelect = $("#localRightSelect").children(),
                            remoteRightSelect = $("#remoteRightSelect").children(),
                            localRightSelectOptVal = getOptsVal("#localRightSelect"),
                            remoteRightSelectOptVal = getOptsVal("#remoteRightSelect"),
                            editExt = $('#edit_ext').val().split(","),
                            res = true;

                        $.each(localRightSelect, function(index, val) {
                            if ($.inArray($(val).val(), editExt) != -1) {
                                res = false;
                            }
                        });

                        var bool = localRightSelectOptVal.existsSameValues(remoteRightSelectOptVal);

                        if (res && !bool) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                ]
            },
            "remoteRightSelect": {
                customCallback: [$P.lang("LANG3770").format(200),
                    function() {
                        var remoteRightSelectLength = $("#remoteRightSelect").children().length,
                            editExtLength = ($('#edit_ext').val() ? $('#edit_ext').val().split(",").length : 0);
                        if (remoteRightSelectLength > 0) {
                            var total = $("#localRightSelect").children().length + remoteRightSelectLength + editExtLength + mWindow.extgroupList.length;
                            return total <= 200;
                        } else {
                            return true;
                        }
                    }
                ],
                customCallback1: [$P.lang("LANG2930"),
                    function() {
                        //var localRightSelect = $("#localRightSelect").children();
                        var remoteRightSelect = $("#remoteRightSelect").children(),
                            editExt = $('#edit_ext').val().split(","),
                            localRightSelectOptVal = getOptsVal("#localRightSelect"),
                            remoteRightSelectOptVal = getOptsVal("#remoteRightSelect"),
                            res = true;

                        $.each(remoteRightSelect, function(index, val) {
                            if ($.inArray($(val).val(), editExt) != -1) {
                                res = false;
                            }
                        });

                        var bool = localRightSelectOptVal.existsSameValues(remoteRightSelectOptVal);

                        if (res && !bool) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                ],
                customCallback2: [$P.lang("LANG3251").format($P.lang("LANG2480")),
                    function() {
                        var json = {},
                            arr = getOptsVal("#remoteRightSelect"),
                            length = arr.length;
                        if (length == 0) {
                            return true;
                        }
                        for (var i = 0; i < length; i++) {
                            var val = arr[i];
                            if (!json[val]) {
                                json[val] = true;
                                if (i == length - 1) {
                                    return true;
                                }
                                continue;
                            }
                            if (json[val]) {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }
                ]
            },
            "edit_ext": {
                //required: true,
                customCallback: [$P.lang("LANG2167").format("'5000,5001,96000'"),
                    function() {
                        var res = true,
                            value = $('#edit_ext').val();

                        if (value) {
                            value.split(',').each(function(ext) {
                                if (!ext || /[^\d]/.test(ext) || ext.length > 64) {
                                    res = false;
                                    return res;
                                }
                            });

                        }
                        return res;
                    }
                ],
                customCallback1: [$P.lang("LANG3770").format(200),
                    function() {
                        var remoteRightSelectLength = $("#remoteRightSelect").children().length,
                            editExtLength = ($('#edit_ext').val() ? $('#edit_ext').val().split(",").length : 0);
                        if (editExtLength > 0) {
                            var total = $("#localRightSelect").children().length + remoteRightSelectLength + editExtLength + mWindow.extgroupList.length;
                            return total <= 200;
                        } else {
                            return true;
                        }
                    }
                ],
                customCallback2: [$P.lang("LANG2930"),
                    function() {
                        var localRightSelect = $("#localRightSelect").children(),
                            remoteRightSelect = $("#remoteRightSelect").children(),
                            editExt = $('#edit_ext').val().split(","),
                            res = true;

                        $.each($.merge(localRightSelect, remoteRightSelect), function(index, val) {
                            if ($.inArray($(val).val(), editExt) != -1) {
                                res = false;
                            }
                        });

                        return res;
                    }
                ],
                customCallback3: [$P.lang("LANG2930"),
                    function() {
                        var res = true,
                            editExtVal = $('#edit_ext').val();

                        if (editExtVal) {
                            var editExt = editExtVal.split(",");

                            for (var i = 0; i < editExt.length;) {
                                var arrFirst = editExt[0];

                                editExt.remove(arrFirst);

                                if ($.inArray(arrFirst, editExt) != -1) {
                                    res = false;
                                }
                            };
                        }

                        return res;
                    }
                ]
            }
        },
        submitHandler: function() {
            var action = {},
                members = [],
                extensionBaseIndex = 1;

            action["action"] = (mode == 'edit' ? "updateEventList" : "addEventList");
            action[(mode == 'edit' ? "eventlist" : "uri")] = $("#uri").val();

            $.each($("#localRightSelect").children(), function(index, item) {
                var fullname = $(item).attr('fullname'),
                    obj = {
                        local_extension: $(item).val()
                    };

                members.push(obj);
            });

            var remoteRightSelectChild = $("#remoteRightSelect").children();

            for (var i = 0; i < remoteRightSelectChild.length; i++) {
                var index = remoteRightSelectChild[i],
                    val = $(index).val(),
                    obj = {
                        remote_extension: $(index).attr("attr") + ":" +val
                    };

                if ($.inArray(val, mWindow.eventlistExt) != -1) {
                    obj = {
                        local_extension: val
                    };
                }

                members.push(obj);
            }

            var editExtVal = $("#edit_ext").val()

            if (editExtVal) {
                var editExtValArr = editExtVal ? editExtVal.split(",") : [],
                    phonebookExtArr = mWindow.phonebookExtArr,
                    phonebookExtObj = mWindow.phonebookExtObj;

                for (var i = 0; i < editExtValArr.length; i++) {
                    var val = editExtValArr[i],
                        obj = {
                            special_extension: val
                        };

                    if ($.inArray(val, mWindow.eventlistExt) != -1) {
                        obj = {
                            local_extension: val
                        };

                        members.push(obj);

                        continue;
                    }

                    for (var j = 0; j < phonebookExtArr.length; j++) {
                        var index = phonebookExtArr[j],
                            match = index.match(/\d+$/),
                            ext = match ? match[0] : "";

                        if (val == ext) {
                            obj = {
                                remote_extension: phonebookExtObj[index].attr + ":" + val
                            };
                        }
                    }

                    members.push(obj);
                }
            }

            if (members.length != 0) {
                action["members"] = JSON.stringify(members);
            }

            updateOrAddEventlistInfo(action);
        }
    });
}

function distinct(arr) {
    var ret = [],
        json = {},
        length = arr.length;

    for (var i = 0; i < length; i++) {
        var val = arr[i];
        if (!json[val]) {
            json[val] = 1;
            ret.push(val);
        }
    }
    return ret;
}

function getEventlistInfo(name) {
    var action = {
        "action": "getEventList",
        "eventlist": name
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
                var eventlist = data.response.eventlist;
                var trunkArr = [];
                var localExtension = eventlist.local_extension ? eventlist.local_extension : "";
                var remoteExtension = eventlist.remote_extension ? eventlist.remote_extension : "";
                var specialExtension = eventlist.special_extension ? eventlist.special_extension : "";
                var remoteExtensionArr = remoteExtension.match(/:(\d+)/g);
                var localMembersArr = localExtension ? localExtension.split(",") : [];
                var remoteMembersArr = remoteExtension ? remoteExtension.split(",") : [];
                var unknownMembersArr = specialExtension ? specialExtension.split(",") : [];
                var eventlistExt = mWindow.eventlistExt,
                    phonebookExtArr = mWindow.phonebookExtArr,
                    phonebookExtObj = mWindow.phonebookExtObj,
                    tmpEventlistExt = [],
                    tmpRemoteMembersArr = [];

                tmpEventlistExt = eventlistExt.copy(tmpEventlistExt);
                tmpEventlistExt.remove(localMembersArr);

                var localRightEventlistExt = transExtensionData(localMembersArr);
                var localLeftEventlistExt = transExtensionData(tmpEventlistExt);

                selectbox.appendOpts({
                    el: "localLeftSelect",
                    opts: localLeftEventlistExt
                }, doc);

                selectbox.appendOpts({
                    el: "localRightSelect",
                    opts: localRightEventlistExt
                }, doc);

                tmpRemoteMembersArr = phonebookExtArr.copy(tmpRemoteMembersArr);
                tmpRemoteMembersArr.remove(remoteMembersArr);

                var remoteLeftphonebookExt = [];
                var remoteRightphonebookExt = [];

                $.each(tmpRemoteMembersArr, function(index, item) {
                    remoteLeftphonebookExt.push(phonebookExtObj[item]);
                });

                $.each(remoteMembersArr, function(index, item) {
                    var phonebookExtObjItem = phonebookExtObj[item];
                    if (phonebookExtObjItem) {
                        remoteRightphonebookExt.push(phonebookExtObjItem);
                    } else {
                        var itemMatch = item ? item.split(":")[1] : "";
                        if (itemMatch) {
                            unknownMembersArr.push(itemMatch);
                        }
                    }
                });

                selectbox.appendOpts({
                    el: "remoteLeftSelect",
                    opts: remoteLeftphonebookExt,
                }, doc);

                selectbox.appendOpts({
                    el: "remoteRightSelect",
                    opts: remoteRightphonebookExt,
                }, doc);

                $("#edit_ext").val(unknownMembersArr.join(","));

                top.Custom.init(doc);
            }
        }
    });
}

function updateOrAddEventlistInfo(action) {
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
                        mWindow.$("#eventlist", mWindow.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}

function transExtensionData(res, cb) {
    var arr = [],
        extgroupListObj = mWindow.extgroupListObj;

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extgroupListObjItem = extgroupListObj[res[i]];

        if (extgroupListObjItem) {
            obj["val"] = extgroupListObjItem["val"];
            obj["text"] = $P.lang("LANG2714") + "--" + extgroupListObjItem["text"];
        } else {
            obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.eventlistExtList);
        }

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function getOptsVal(el) {
    var arr = [];
    $.each($(el).children(), function(index, item) {
        arr.push($(item).val());
    });
    return arr;
}

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
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    mode = gup.call(window, "mode"),
    item = gup.call(window, "id"),
    pinLocale = $P.lang('LANG4555'),
    pinNameLocale = $P.lang('LANG4556'),
    oldPinSetName = "",
    currentMembers = [],
    NUMBER = -1;

var PinSets_MiscFunctions = {
    currentState: '', // edit or add

    add_member: function() {
        NUMBER = currentMembers.length - 1;

        this.show_Member_FORM();
    },

    show_Member_FORM: function(data) { // PinSets_MiscFunctions.show_Member_FORM()
        if (!data) {
            this.currentState = 'add';

            $('#pin, #pin_name').val('');
            $('#saveMember').removeClass('btn-save').addClass('btn-update').text($P.lang('LANG769'));
        } else {
            this.currentState = 'edit';

            $('#pin').val(data.pin);
            $('#pin_name').val(data.pin_name);
            $('#saveMember').removeClass('btn-update').addClass('btn-save').text($P.lang('LANG728'));
        }

        $('.Member_FORM').show();

        $(".new-ps-cmds").hide();

        $(".step_delete").removeClass('cursor');

        $("#pin, #pin_name").removeClass('ui-state-highlight').removeAttr('titles');

        top.dialog.dialogCommands.hide();

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
    },

    hide_Member_FORM: function() { // PinSets_MiscFunctions.hide_Member_FORM()
        NUMBER = -1;

        this.currentState = '';

        $('.Member_FORM').hide();

        $(".new-ps-cmds").show();

        $(".ui-tooltip").remove();

        $(".step_delete").addClass('cursor');

        $("#PinSetsMember > .step").removeClass('editState');

        top.dialog.dialogCommands.show();

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
    },

    refresh_allMembers: function() { // PinSets_MiscFunctions.refresh_allMembers()
        this.currentState = '';

        $('#PinSetsMember').empty();

        var add_sqStep = function(a) {
                var txt = currentMembers[a],
                    tmp = document.createElement('div');

                tmp.className = 'step';
                tmp.STEPNO = a;

                var div_desc = document.createElement('div');
                div_desc.className = 'step_desc';
                div_desc.innerHTML = pinLocale + ': ' + txt.pin + '&nbsp;&nbsp;&nbsp;' + pinNameLocale + ': ' + txt.pin_name;

                tmp.appendChild(div_desc);

                var div_btn = document.createElement('div');
                div_btn.className = 'step_btn';

                var sp_edit = document.createElement('span');
                sp_edit.className = 'step_edit cursor';
                sp_edit.innerHTML = '&nbsp;';

                var sp_delete = document.createElement('span');
                sp_delete.className = 'step_delete cursor';
                sp_delete.innerHTML = '&nbsp;';

                div_btn.appendChild(sp_delete);
                div_btn.appendChild(sp_edit);

                tmp.appendChild(div_btn);

                $('#PinSetsMember').append(tmp);
            };

        for (var t = 0; t < currentMembers.length; t++) {
            add_sqStep(t);
        }
    },

    push_newMember: function() { // PinSets_MiscFunctions.push_newMember();
        var tmp_pin = $('#pin').val(),
            tmp_pin_name = $('#pin_name').val(),
            tmp_obj = {
                'pin': tmp_pin,
                'pin_name': tmp_pin_name
            };

        currentMembers.splice(NUMBER + 1, 0, tmp_obj);

        this.refresh_allMembers();

        this.hide_Member_FORM();
    },

    save_editMember: function() { // PinSets_MiscFunctions.save_editMember();
        var stepNo = Number($('.editState')[0].STEPNO),
            tmp_pin_name = $('#pin_name').val(),
            tmp_pin = $('#pin').val(),
            tmp_obj = {
                'pin': tmp_pin,
                'pin_name': tmp_pin_name
            };

        currentMembers[stepNo] = tmp_obj;

        this.refresh_allMembers();

        this.hide_Member_FORM();
    }
};

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

    bindEvent();

    initValidator();

    enableStrongPw();

    if (mode === 'edit') {
        editPinSet(item);
    } else if (mode == 'add') {
        top.Custom.init(doc);
    }
});

function enableStrongPw() {
    var extensionPrefSettings = UCMGUI.isExist.getRange();

    if (extensionPrefSettings[2] == "yes") {
        var obj = {
            pwsId: "#pin",
            type: "digital",
            doc: document
        };

        $P("#pin", document).rules("add", {
            checkNumericPw: [UCMGUI.enableWeakPw.showCheckPassword, obj]
        });
    }
};

function bindEvent() {
    $('#PinSetsMember').click(function(event) {
        var target = UCMGUI.events.getTarget(event),
            className = $(target).attr("class");

        if (!className || !className.beginsWith('step_')) {
            return false;
        }

        var stepNo = Number(target.parentNode.parentNode.STEPNO);

        if ($(target).hasClass('step_delete')) {
            if (!PinSets_MiscFunctions.currentState) {
                currentMembers.splice(stepNo, 1);

                NUMBER--;

                PinSets_MiscFunctions.refresh_allMembers();
            }
        } else if ($(target).hasClass('step_edit')) {
            var data = currentMembers[stepNo];

            PinSets_MiscFunctions.show_Member_FORM(data);

            $(target.parentNode.parentNode).addClass('editState').siblings().removeClass('editState');
        }
    });
}

function checkNameIsExist() {
    var name = $("#pin_sets_name").val(),
        PinSetsNameList = mWindow.PinSetsNameList,
        tmpPinSetsNameList = [];

    tmpPinSetsNameList = PinSetsNameList.copy(tmpPinSetsNameList);

    if (oldPinSetName) {
        tmpPinSetsNameList.remove(oldPinSetName);
    }

    return !UCMGUI.inArray(name, tmpPinSetsNameList);
}

function editPinSet(index) {
    var action = {
        "action": "getPinSets",
        "pin_sets_id": index
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
                var PinSet = data.response.pin_sets_id,
                    record = PinSet['record_in_cdr'],
                    members = data.response.members;

                currentMembers = [];
                oldPinSetName = PinSet['pin_sets_name'];

                $('#record_in_cdr')[0].checked = (record == 'yes' ? true : false);

                $('#pin_sets_name').val(oldPinSetName);

                for (var i = 0, length = members.length; i < length; i++) {
                    var obj = {
                            'pin': members[i]['pin'],
                            'pin_name': members[i]['pin_name']
                        };

                    currentMembers.push(obj);
                }

                PinSets_MiscFunctions.refresh_allMembers();

                top.Custom.init(doc);
            }
        }
    });
}

function initForm() {
    // Prevent form submit by pressing enter key.
    $("#form").keypress(function(e) {
        if (e.which == 13) {
            var tagName = e.target.tagName.toLowerCase();

            return false;
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "pin_sets_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG2137"), checkNameIsExist]
            },
            "pin": {
                required: true,
                digits: true,
                customCallback: [$P.lang("LANG270").format($P.lang("LANG4555")), is_same_pin]
            },
            "pin_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                customCallback: [$P.lang("LANG270").format($P.lang("LANG4556")), is_same_pin_name]
            },
        },
        submitHandler: function() {
            var target = this.submitButton;

            if (target.id == 'saveMember') {
                if (PinSets_MiscFunctions.currentState === 'add') {
                    PinSets_MiscFunctions.push_newMember();
                } else {
                    PinSets_MiscFunctions.save_editMember();
                }
            } else if (target.id == 'save') {
                if (!currentMembers.length) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG3391"),
                        callback: function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        }
                    });

                    return false;
                }

                savePinSet();
            }
        }
    });
}

function is_same_pin() {
    var number = $("#pin").val(),
        existed = false;

    for (var i = 0, length = currentMembers.length; i < length; i++) {
        if (PinSets_MiscFunctions.currentState === 'edit') {
            if (i === Number($('.editState')[0].STEPNO)) {
                continue;
            }
        }

        if (number === currentMembers[i].pin) {
            existed = true;
            break;
        }
    }

    return !existed;
}

function is_same_pin_name(val, ele) {
    for (var i = 0, length = currentMembers.length; i < length; i++) {
        if (PinSets_MiscFunctions.currentState === 'edit') {
            if (i === Number($('.editState')[0].STEPNO)) {
                continue;
            }
        }

        if (val === currentMembers[i].pin_name) {
            return false;
        }
    }

    return true;
}

function savePinSet() {
    var action = {},
        members = [];

    if (mode == "edit") {
        action["action"] = "updatePinSets";
        action["pin_sets_id"] = item;
    } else if (mode == "add") {
        var date = new Date();

        action["action"] = "addPinSets";
        action["pin_sets_id"] = date.getTime() + '';
    }

    action["pin_sets_name"] = $('#pin_sets_name').val();

    action["record_in_cdr"] = $('#record_in_cdr').is(':checked') ? 'yes' : 'no';

    for (var i = 0, length = currentMembers.length; i < length; i++) {
        var obj = {
                "pin": currentMembers[i].pin,
                "pin_name": currentMembers[i].pin_name,
                "pin_sets_id": action["pin_sets_id"]
            };

        members.push(obj);
    }

    action['members'] = JSON.stringify(members);

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
                        mWindow.$("#PinSetsList", mWindow.document).trigger('reloadGrid');

                        // refresh name list
                        mWindow.getNameList();
                    }
                });
            }
        }
    });
}
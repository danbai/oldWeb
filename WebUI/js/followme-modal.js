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
    item = gup.call(window, "item"),
    existAccount = mWindow.existAccount,
    followmeAccountList = mWindow.followmeAccountList,
    followmeAccountObj = mWindow.followmeAccountObj,
    musicOptionList = mWindow.musicOptionList,
    destinationTypeArr = mWindow.destinationTypeArr,
    // globalRingTimeout = mWindow.globalRingTimeout,
    CURRENT_DESTINATIONS = [],
    actionItemArr = ["voicemail", "account", "vmgroup", "ivr", "ringgroup", "queue", "external_number"],
    NUMBER = -1;

var followMe_MiscFunctions = {
    add_number: function() {
        NUMBER = CURRENT_DESTINATIONS.length - 1;

        if ($("#step_" + NUMBER).parent().parent()[0] != undefined) {
            $("#step_" + NUMBER).parent().parent()[0].style.background = "#ACACAD";
        }

        this.show_FORM_newFM_Number();
    },

    show_FORM_newFM_Number: function() { // followMe_MiscFunctions.show_FORM_newFM_Number()
        var show = true;

        $('#newFM_Number_radio_local').show();
        $('#newFM_Number_radio_local_label').show();
        $('#FMU_newNumber_local').show();
        $('#FMU_newNumber_External').hide();

        if ($('#FMU_newNumber_local > option').length < 1) {
            show = false;

            $('#newFM_Number_radio_local').hide();
            $('#newFM_Number_radio_local_label').hide();
            $('#FMU_newNumber_local').hide();
            $('#FMU_newNumber_External').show();
        }

        // var ringtime = globalRingTimeout;

        // $('#FMU_newNumber_seconds').val(ringtime < 30 ? ringtime + '' : '30');

        $('#FMU_newNumber_seconds').val('30');

        $('#FMU_newNumber_External').val('');

        $('#FMU_newNumber_local')[0].selectedIndex = 0;

        $('#newFM_Number_radio_local')[0].checked = show;
        $('#newFM_Number_radio_Externals')[0].checked = !show;

        $('#newFM_Order_radio_after')[0].checked = true;
        $('#newFM_Order_radio_alongWith')[0].checked = false;

        $('.FORM_newFM_Number').show();

        $(".new-fm-cmds").hide();

        top.dialog.dialogCommands.hide();

        if (NUMBER == -1) {
            $('#newFM_Order_radio_alongWith').hide();
            $('#newFM_Order_radio_alongWith_label').hide();
            $('#newFM_Order_radio_alongWith').prev().hide();
        } else {
            $('#newFM_Order_radio_alongWith').show();
            $('#newFM_Order_radio_alongWith_label').show();
            $('#newFM_Order_radio_alongWith').prev().show();
        }

        top.Custom.init(doc);

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
    },

    hide_FORM_newFM_Number: function() { // followMe_MiscFunctions.hide_FORM_newFM_Number()
        if ($("#step_" + NUMBER).parent().parent()[0] != undefined) {
            $("#step_" + NUMBER).parent().parent()[0].style.background = "";
        }

        NUMBER = -1;

        $('.FORM_newFM_Number').hide();

        $(".new-fm-cmds").show();

        top.dialog.dialogCommands.show();

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
    },

    reset_Fields: function() { // followMe_MiscFunctions.reset_Fields()
        $('#enable_followme')[0].checked = true;

        $('#FMU_newNumber_local')[0].selectedIndex = 0;

        $('#musicclass').val('default');

        $('#bypass_outrt_auth')[0].checked = false;

        $('#enable_option')[0].checked = true;

        $('#FMU_newNumber_seconds').val('');

        $('#sqDestinations').empty();

        $('.FORM_newFM_Number').hide();

        $(".new-fm-cmds").show();

        CURRENT_DESTINATIONS = [];

        NUMBER = -1;

        followMe_MiscFunctions.refresh_allDestinations();

        top.Custom.init(doc);
    },

    refresh_allDestinations: function() { // followMe_MiscFunctions.refresh_allDestinations()
        $('#sqDestinations').empty();

        var add_sqStep = function(a) {
            var txt = CURRENT_DESTINATIONS[a],
                tmp = document.createElement('div');

            tmp.className = 'step';
            tmp.STEPNO = a;

            var div_desc = document.createElement('div');
            div_desc.className = 'step_desc';
            div_desc.innerHTML = txt.split(',')[0].split('&').join(' <B>&</B> ') + '&nbsp;&nbsp;' + $P.lang("LANG569") + '&nbsp;&nbsp;' + "<input id='step_" + t + "' name='step_" + t + "' maxlength='2' style='width: 30px;'> " + $P.lang("LANG570");

            tmp.appendChild(div_desc);

            var div_btn = document.createElement('div');
            div_btn.className = 'step_btn';

            var sp_add = document.createElement('span');
            sp_add.className = 'step_add';
            sp_add.innerHTML = '&nbsp;';

            var sp_up = document.createElement('span');
            sp_up.className = 'step_up';
            sp_up.innerHTML = '&nbsp;';

            var sp_down = document.createElement('span');
            sp_down.className = 'step_down';
            sp_down.innerHTML = '&nbsp;';

            var sp_delete = document.createElement('span');
            sp_delete.className = 'step_delete';
            sp_delete.innerHTML = '&nbsp;';

            div_btn.appendChild(sp_add);
            div_btn.appendChild(sp_delete);
            div_btn.appendChild(sp_up);
            div_btn.appendChild(sp_down);

            tmp.appendChild(div_btn);

            $('#sqDestinations').append(tmp);
            $("#step_" + t).val(txt.split(',')[1]);

            $P('#step_' + t, document).rules('add', {
                required: true,
                digits: true,
                // cmpareRingtime: [globalRingTimeout]
                range: [10, 60]
            });
        };

        for (var t = 0; t < CURRENT_DESTINATIONS.length; t++) {
            add_sqStep(t);
        }

        if (NUMBER != -1) {
            $("#step_" + NUMBER).parent().parent()[0].style.background = "#ACACAD";
        }
    },

    save_allDestinations: function() {
        for (var t = 0; t < CURRENT_DESTINATIONS.length; t++) {
            CURRENT_DESTINATIONS[t] = CURRENT_DESTINATIONS[t].split(",")[0] + "," + $("#step_" + t).val()
        }
    },

    push_newdest: function() { // followMe_MiscFunctions.push_newdest() ;
        this.save_allDestinations();

        if ($('#newFM_Number_radio_local')[0].checked) {
            var tmp_number = $('#FMU_newNumber_local').val();
        }

        if ($('#newFM_Number_radio_Externals')[0].checked) {
            var tmp_number = $('#FMU_newNumber_External').val();
        }

        var tmp_seconds = $('#FMU_newNumber_seconds').val();

        if (tmp_number.contains('-')) {
            tmp_number = tmp_number.withOut('-');
        }

        var tmp_dest = tmp_number + ',' + tmp_seconds,
            tmp = CURRENT_DESTINATIONS[NUMBER];

        if ($('#newFM_Order_radio_after')[0].checked || !tmp) {
            CURRENT_DESTINATIONS.splice(NUMBER + 1, 0, tmp_dest);
        }

        if ($('#newFM_Order_radio_alongWith')[0].checked && tmp) {
            var a = tmp.split(',')[0];

            CURRENT_DESTINATIONS.splice(NUMBER + 1, 0, a + '&' + tmp_dest);
            CURRENT_DESTINATIONS.splice(NUMBER, 1);
        }

        this.refresh_allDestinations();
        this.hide_FORM_newFM_Number();
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

    if (mode === 'edit') {
        editFollowme(item);
    } else if (mode == 'add') {
        $("#enable_destination")[0].updateStatus();

        top.Custom.init(doc);
    }
    //$P.lang(doc, true);
    top.Custom.init(doc);
});

// function askRingtime(time) {
//     var res = 0;

//     if (!time || !/^([0-9]\d+)$/.test(time)) {
//         return false;
//     }

//     time = Number(time);

//     if (time < 0 || time > 60) {
//         return false;
//     }

//     var ringtime = globalRingTimeout;

//     if (time > ringtime) {
//         top.dialog.dialogConfirm({
//             confirmStr: $P.lang("LANG930").format(ringtime),
//             buttons: {
//                 ok: function() {
//                     top.frames["frameContainer"].module.jumpMenu('preferences.html');
//                 },
//                 cancel: function() {
//                     top.dialog.container.show();
//                     top.dialog.shadeDiv.show();
//                 }
//             }
//         });
//         return false;
//     }
//     return true;
// }

function bindEvent() {
    $('#next').bind("click", function(ev) {
        var selectedExtension = $('#extension').val();

        $('#selectedAccount').text(selectedExtension);

        $('#FMU_newNumber_local').empty();

        var allAccount = followmeAccountObj,
            existed = [selectedExtension],
            availableAccount = [];

        for (var i = 0, length = allAccount.length; i < length; i++) {
            if (!UCMGUI.inArray(allAccount[i]['val'], existed)) {
                availableAccount.push(allAccount[i]);
            }
        }

        selectbox.appendOpts({
            el: "FMU_newNumber_local",
            opts: availableAccount
        }, doc);

        top.Custom.init(doc, $('#FMU_newNumber_local')[0]);

        $('.firstStep').hide();

        $('.params').show();

        top.dialog.dialogCommands.show();

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
    });

    $('#Reselect').bind("click", function(ev) {
        $('#extension')[0].selectedIndex = 0;

        top.Custom.init(doc, $('#extension')[0]);

        $('#selectedAccount').text("");

        $('.firstStep').show();

        $('.params').hide();

        followMe_MiscFunctions.reset_Fields();

        top.dialog.dialogCommands.hide();

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
    });

    $('#newFM_Number_radio_local').bind('click', function() {
        $('#FMU_newNumber_local').hide();
        $('#FMU_newNumber_External').hide();

        if ($('#newFM_Number_radio_local')[0].checked) {
            $('#FMU_newNumber_local').show().prev().show();
        }
    });

    $('#newFM_Number_radio_Externals').bind('click', function() {
        $('#FMU_newNumber_local').hide();
        $('#FMU_newNumber_External').hide();

        if ($('#newFM_Number_radio_Externals')[0].checked) {
            $('#FMU_newNumber_External').show();
            $('#FMU_newNumber_local').prev().hide();
        }
    });

    $('#sqDestinations').click(function(event) {
        followMe_MiscFunctions.save_allDestinations();

        var s = UCMGUI.events.getTarget(event),
            cl = $(s).attr("class");

        if (!cl || !cl.beginsWith('step_')) {
            return false;
        }

        var stepNo = Number(s.parentNode.parentNode.STEPNO);

        switch (cl) {
            case 'step_delete':
                CURRENT_DESTINATIONS.splice(stepNo, 1);

                if (NUMBER == stepNo) {
                    followMe_MiscFunctions.hide_FORM_newFM_Number();
                }

                if (NUMBER != -1 && NUMBER > stepNo) {
                    NUMBER--;
                }

                break;
            case 'step_up':
                if (stepNo == 0) {
                    return false;
                }

                var tmp = CURRENT_DESTINATIONS[stepNo];

                CURRENT_DESTINATIONS.splice(stepNo, 1);
                CURRENT_DESTINATIONS.splice(stepNo - 1, 0, tmp);

                break;
            case 'step_down':
                if (stepNo == (CURRENT_DESTINATIONS.length - 1)) {
                    return false;
                }

                var tmp = CURRENT_DESTINATIONS[stepNo];

                CURRENT_DESTINATIONS.splice(stepNo + 2, 0, tmp);
                CURRENT_DESTINATIONS.splice(stepNo, 1);

                break;
            case 'step_add':
                NUMBER = stepNo;

                followMe_MiscFunctions.show_FORM_newFM_Number();

                break;
            default:
                break;
        }

        followMe_MiscFunctions.refresh_allDestinations();
    });

    $('#destination_type').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "external_number") {
            $(".selectDivValue").hide();
            $("#destination_value").empty();
            $("#external_number").show();
        } else {
            $(".selectDivValue").show();
            $("#destination_value").empty();
            $("#external_number").hide();

            if (value) {
                selectbox.appendOpts({
                    el: "destination_value",
                    opts: transDestinationVal(mWindow.destinationTypeValue[value], value)
                }, doc);
            }
        }

        top.Custom.init(doc, $('#destination_value')[0]);

        top.dialog.repositionDialog();

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });
}

function editFollowme(index) {
    var action = {
        "action": "getFollowme",
        "followme": index
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
                var followme = data.response.followme,
                    enabled = followme['enable_followme'],
                    musicclass = followme['musicclass'],
                    enable_option = followme['enable_option'],
                    members = followme['members'],
                    bypass_outrt_auth = followme['bypass_outrt_auth'],
                    enableDestination = followme['enable_destination'],
                    destinationType = followme['destination_type'];

                CURRENT_DESTINATIONS = [];

                $('#enable_followme')[0].checked = (enabled == 'yes' ? true : false);

                $('#bypass_outrt_auth')[0].checked = (bypass_outrt_auth == 'yes' ? true : false);

                $('#musicclass').val(musicclass);

                $('#enable_option')[0].checked = (enable_option == 'yes' ? true : false);

                $('#destination_type').val(destinationType).trigger('change');

                $('#enable_destination')[0].checked = (enableDestination == 'yes' ? true : false);

                $('#enable_destination')[0].updateStatus();

                if (destinationType == "voicemail") {
                    var vmExtension = followme["vm_extension"];

                    if (vmExtension) {
                        $("#destination_value").val(vmExtension);
                    } else {
                        $("#destination_value").get(0).selectedIndex = -1;
                    }
                } else if (destinationType == "external_number") {
                    if (followme[destinationType]) {
                        $("#external_number").val(followme[destinationType]);
                    } else {
                        $("#external_number").val('');
                    }
                } else {
                    destinationType = ((destinationType === "queue") ? "queue_dest" : destinationType);

                    if (followme[destinationType]) {
                        $("#destination_value").val(followme[destinationType]);
                    } else {
                        $("#destination_value").get(0).selectedIndex = -1;
                    }
                }

                for (var i = 0, length = members.length; i < length; i++) {
                    var extension = members[i]['extension'].split(',').join('&'),
                        ringtime = members[i]['ringtime'];

                    CURRENT_DESTINATIONS.push(extension + ',' + ringtime);
                }

                followMe_MiscFunctions.refresh_allDestinations();

                top.Custom.init(doc);
            }
        }
    });
}

function initForm() {
    selectbox.appendOpts({
        el: "musicclass",
        opts: musicOptionList
    }, doc);

    selectbox.appendOpts({
        el: "destination_type",
        opts: destinationTypeArr
    }, doc);

    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "enable_destination",
        enableList: ["destination_type", "destination_value", "external_number"]
    }, doc);

    selectbox.appendOpts({
        el: "destination_value",
        opts: transDestinationVal(mWindow.destinationTypeValue["account"], "account")
    }, doc);
    // Prevent form submit by pressing enter key.
    $("#form").keypress(function(e) {
        if (e.which == 13) {
            var tagName = e.target.tagName.toLowerCase();
            return false;
        }
    });
    $('#musicclass').val('default');

    $P.lang(doc, true);

    if (mode == 'add') {
        var allAccount = followmeAccountObj,
            existed = existAccount,
            availableAccount = [];

        for (var i = 0, length = allAccount.length; i < length; i++) {
            if (!UCMGUI.inArray(allAccount[i]['val'], existed)) {
                availableAccount.push(allAccount[i]);
            }
        }

        selectbox.appendOpts({
            el: "extension",
            opts: availableAccount
        }, doc);
    } else if (mode == 'edit') {
        $('.firstStep, .selectedAccountContainer').hide();

        // $('.params').show();
        $('.params').css({
            'display': 'block'
        });

        var allAccount = followmeAccountObj,
            existed = [item],
            availableAccount = [];

        for (var i = 0, length = allAccount.length; i < length; i++) {
            if (!UCMGUI.inArray(allAccount[i]['val'], existed)) {
                availableAccount.push(allAccount[i]);
            }
        }

        selectbox.appendOpts({
            el: "FMU_newNumber_local",
            opts: availableAccount
        }, doc);
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "time": {
                required: true,
                digits: true,
                range: [10, 60],
                // cmpareRingtime: [globalRingTimeout]
            },
            "FMU_newNumber_External": {
                required: true,
                phoneNumberOrExtension: true
            },
            "FMU_newNumber_local": {
                customCallback: [$P.lang("LANG2207"), is_same_user]
            },
            "destination_type": {
                required: true
            },
            "destination_value": {
                required: true
            },
            "external_number": {
                required: true,
                phoneNumberOrExtension: true
            }
        },
        submitHandler: function() {
            var target = this.submitButton;

            if (target.id == 'addNewDes') {
                followMe_MiscFunctions.push_newdest();
            } else if (target.id == 'save') {
                if (!CURRENT_DESTINATIONS.length) {
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

                // for (var i = 0; i < CURRENT_DESTINATIONS.length; i++) {
                //     var value = $("#step_" + i).val();

                //     var flag = askRingtime(value);

                //     if (!flag) {
                //         return;
                //     }
                // }

                saveFollowme();
            }
        }
    });
}

function is_same_user() {
    if ($('#newFM_Number_radio_local')[0].checked) {
        var tmp_number = $('#FMU_newNumber_local').val();
    }

    if ($('#newFM_Number_radio_Externals')[0].checked) {
        var tmp_number = $('#FMU_newNumber_External').val();
    }

    var tmp_seconds = $('#FMU_newNumber_seconds').val();

    if (tmp_number.contains('-')) {
        tmp_number = tmp_number.withOut('-');
    }

    var tmp_dest = tmp_number + ',' + tmp_seconds,
        tmp_last = CURRENT_DESTINATIONS.lastValue();

    if ($('#newFM_Order_radio_alongWith')[0].checked && tmp_last) {
        var a = tmp_last.split(',')[0];

        if (a) {
            var b = a.split('&');

            if (b) {
                for (var t = 0; t < b.length; t++) {
                    if (b[t] == tmp_dest.split(',')[0]) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

function saveFollowme() {
    var action = {},
        members = [],
        destinationTypeVal = $("#destination_type option:selected").val(),
        destinationVal = $("#destination_value option:selected").val(),
        destinationVal_nu = $("#external_number").val();

    if (mode == "edit") {
        action["action"] = "updateFollowme";
        action["followme"] = item;
    } else if (mode == "add") {
        action["action"] = "addFollowme";
        action["extension"] = $('#extension').val();
    }

    action["enable_followme"] = $('#enable_followme').is(':checked') ? 'yes' : 'no';

    action["musicclass"] = $('#musicclass').val();

    action["enable_option"] = $('#enable_option').is(':checked') ? 'yes' : 'no';

    action["bypass_outrt_auth"] = $('#bypass_outrt_auth').is(':checked') ? 'yes' : 'no';

    action["enable_destination"] = $('#enable_destination').is(':checked') ? 'yes' : 'no';

    action["destination_type"] = destinationTypeVal;

    for (var i = 0; i < actionItemArr.length; i++) {
        var actionItemArrIndex = actionItemArr[i];

        if (actionItemArrIndex != destinationTypeVal) {
            if (actionItemArrIndex == "queue") {
                action["queue_dest"] = "";
            } else if (actionItemArrIndex == "voicemail") {
                action["vm_extension"] = "";
            } else {
                action[actionItemArrIndex] = "";
            }
        } else {
            if (actionItemArrIndex == "queue") {
                action["queue_dest"] = destinationVal;
            } else if (actionItemArrIndex == "voicemail") {
                action["vm_extension"] = destinationVal;
            } else if (actionItemArrIndex == "external_number") {
                action[actionItemArrIndex] = destinationVal_nu;
            } else {
                action[actionItemArrIndex] = destinationVal;
            }
        }
    }

    for (var i = 0, length = CURRENT_DESTINATIONS.length; i < length; i++) {
        var obj = {
            "local_extension": [],
            "outside_extension": [],
            "ringtime": $("#step_" + i).val()
        };

        var extensions = CURRENT_DESTINATIONS[i].split(',')[0].split('&');

        for (var j = 0, count = extensions.length; j < count; j++) {
            if (UCMGUI.inArray(extensions[j], followmeAccountList)) {
                obj['local_extension'].push(extensions[j]);
            } else {
                obj['outside_extension'].push(extensions[j]);
            }
        }

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
                        mWindow.$("#followme-list", mWindow.document).trigger('reloadGrid');

                        // refresh name list
                        mWindow.getLists();
                    }
                });
            }
        }
    });
}

function transDestinationVal(res, type) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        if (type == "voicemail" || type == "account") {
            var extension = res[i].extension,
                fullname = res[i].fullname,
                disabled = res[i].out_of_service;

            obj["val"] = extension;

            if (disabled == 'yes') {
                obj["class"] = 'disabledExtOrTrunk';
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            } else {
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
            }
        } else if (type == "queue") {
            obj["text"] = res[i]["queue_name"];
            obj["val"] = res[i]["extension"];
        } else if (type == "ringgroup") {
            obj["text"] = res[i]["ringgroup_name"];
            obj["val"] = res[i]["extension"];
        } else if (type == "vmgroup") {
            obj["text"] = res[i]["vmgroup_name"];
            obj["val"] = res[i]["extension"];
        } else if (type == "ivr") {
            obj["text"] = res[i]["ivr_name"];
            obj["val"] = res[i]["ivr_id"];
        } else {
            obj["val"] = res[i];
        }

        arr.push(obj);
    }

    // if (type == "voicemail") {
    //     arr.unshift({
    //         text: $P.lang("LANG3502"),
    //         val: "yes"
    //     });
    // }

    return arr;
}
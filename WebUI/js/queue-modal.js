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
    startExt = mWindow.queueRange[0],
    endExt = mWindow.queueRange[1],
    disableRange = mWindow.queueRange[2],
    weakPassword = mWindow.queueRange[4],
    queueSettings = mWindow.queueSettings,
    portExtensionList = mWindow.portExtensionList,
    enableCheckBox = UCMGUI.domFunction.enableCheckBox,
    oldExtension = "",
    oldQueueName = "",
    actionItemArr = ["voicemail", "account", "vmgroup", "ivr", "ringgroup", "queue", /*"paginggroup", "conference", "fax", "disa",*/ "directory", "external_number"];

var isEnableWeakPw = function() {
    if (weakPassword == "yes") {
        var edit_Ext = $P.lang("LANG85"),
            DynamicLoginPw = $P.lang("LANG1169"),
            newCrlName = $P.lang("LANG85"),
            password = $P.lang("LANG127");

        $P("#pin", document).rules("add", {
            identical: [edit_Ext, DynamicLoginPw, $("#extension")],
            checkNumericPw: [
                UCMGUI.enableWeakPw.showCheckPassword, {
                    type: "digital",
                    pwsId: "#pin",
                    doc: document
                }
            ]
        });

        $P("#vmsecret", document).rules("add", {
            identical: [newCrlName, password, $("#extension")],
            checkNumericPw: [
                UCMGUI.enableWeakPw.showCheckPassword, {
                    required: true,
                    type: "digital",
                    pwsId: "#vmsecret",
                    doc: document
                }
            ]
        });
    }
};

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    initForm();

    if (mode == 'edit') {
        var extension = gup.call(window, "extension");

        getQueueInfo(extension);
    } else {
        setDefaultsWhenCreate(doc);

        $("#vq_switch")[0].updateStatus();

        $("#announce_position")[0].updateStatus();

        prepareAddItemForm();

        top.Custom.init(doc);
    }

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

    $('#save').bind('click', function() {
        askExtensionRange($("#extension").val(), startExt, endExt, disableRange);
    });

    initValidator();

    isEnableWeakPw();
});

function checkIfInPort(val, ele) {
    var existed = true;

    if (UCMGUI.inArray(val, portExtensionList)) {
        existed = false;
    } else {
        existed = true;
    }

    return existed;
}

function check_time(value, element) {
    return parseInt(value || 0, 10) > parseInt($('#ringtime').val() || 0, 10);
}

function initForm() {
    var destinationTypeArr = [{
            text: $P.lang("LANG85"),
            val: "account"
        }, {
            text: $P.lang("LANG90"),
            val: "voicemail"
        }, {
            text: $P.lang("LANG91"),
            val: "queue"
        }, {
            text: $P.lang("LANG600"),
            val: "ringgroup"
        }, {
            text: $P.lang("LANG89"),
            val: "vmgroup"
        }, {
            text: $P.lang("LANG19"),
            val: "ivr"
        }, {
            text: $P.lang("LANG3458"),
            val: "external_number"
        }],
        voicemailPromptList = [{
            text: $P.lang("LANG133"),
            val: ""
        }];

    $("#pin, #waittime").hide();

    $("#enable_destination")[0].selectedIndex = -1;

    voicemailPromptList = voicemailPromptList.concat(mWindow.voicemailPromptList);

    selectbox.appendOpts({
        el: "destination_type",
        opts: destinationTypeArr
    }, doc);

    selectbox.appendOpts({
        el: "destination_value",
        opts: transDestinationVal(mWindow.destinationTypeValue["account"], "account")
    }, doc);

    selectbox.appendOpts({
        el: "musicclass",
        opts: mWindow.mohNameList
    }, doc);

    selectbox.appendOpts({
        el: "custom_prompt",
        opts: voicemailPromptList
    }, doc);

    enableCheckBox({
        enableCheckBox: 'vq_switch',
        enableList: ['vq_mode', 'vq_periodic', 'vq_outprefix']
    }, doc);

    enableCheckBox({
        enableCheckBox: 'announce_position',
        enableList: ['announce_frequency']
    }, doc);

    $('#destination_value').bind("change", function(ev) {
        // var extensionVal = $("#extension").val();
        var destinationTypeVal = $("#destination_type option:selected").val(),
            destinationVal = $("#destination_value option:selected").val();

        if (destinationTypeVal == "voicemail" && destinationVal == "yes") {
            $("#vmoption").show();

            isEnableWeakPw();

            $("#external_number").hide();
        } else if (destinationTypeVal == "external_number") {
            $("#external_number").show();

            $("#vmoption").hide();
        } else {
            $("#external_number").hide();

            $("#vmoption").hide();
        }

        top.dialog.repositionDialog();

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#destination_type').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "external_number") {
            $(".selectDivValue").hide();
            $("#destination_value").empty();
            $("#external_number").show();
            $("#vmoption").hide();
        } else {
            $(".selectDivValue").show();
            $("#destination_value").empty();

            if (value != "voicemail") {
                $("#vmoption").hide();
            }

            $("#external_number").hide();

            selectbox.appendOpts({
                el: "destination_value",
                opts: transDestinationVal(mWindow.destinationTypeValue[value], value)
            }, doc);

            $('#destination_value').trigger("change");
        }

        top.Custom.init(doc, $('#destination_value')[0]);

        top.dialog.repositionDialog();

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#vq_mode').bind("change", function(ev) {
        var vqPeriodic = $("#vq_periodic");

        if (this.value == "digit") {
            vqPeriodic.attr("disabled", true);
        } else {
            vqPeriodic.attr("disabled", false);
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#vq_switch').bind("change", function(ev) {
        if(this.checked) {
           $('#vq_mode').trigger("change");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    var chkPin = $("#chk_pin"),
        pin = $("#pin"),
        chkWaittime = $("#chk_waittime"),
        waittime = $("#waittime"),
        enableDes = $('#enable_destination');

    chkPin.bind("click", function(ev) {
        if (chkPin.is(":checked")) {
            pin.show();
        } else {
            pin.hide();
        }

        ev.stopPropagation();
    });

    chkWaittime.bind("click", function(ev) {
        if (chkWaittime.is(":checked")) {
            waittime.show();

            enableDes.attr('disabled', true);

            top.Custom.init(document, enableDes[0]);
        } else {
            waittime.hide();

            enableDes.attr('disabled', false);

            top.Custom.init(document, enableDes[0]);
        }

        ev.stopPropagation();
    });

    enableDes.bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value === 'D') {
            $('#destination_type, #destination_value, #queue_timeout, ' +
                '#voice_prompt_time, #external_number, #vm_extension, ' +
                '#custom_prompt, #vmsecret, #email').attr('disabled', true);
        } else if (value === 'T') {
            $('#destination_type, #destination_value, #queue_timeout, ' +
                '#voice_prompt_time, #external_number, #vm_extension, ' +
                '#custom_prompt, #vmsecret, #email').removeAttr('disabled');

            $('.timeout').show();
            $('.cycle').hide();
        } else if (value === 'V') {
            $('#destination_type, #destination_value, #queue_timeout, ' +
                '#voice_prompt_time, #external_number, #vm_extension, ' +
                '#custom_prompt, #vmsecret, #email').removeAttr('disabled');

            $('.cycle').show();
            $('.timeout').hide();
        }

        if (value !== 'D') {
            chkWaittime.attr('disabled', true);

            top.Custom.init(doc, chkWaittime[0]);
        } else {
            chkWaittime.attr('disabled', false);

            top.Custom.init(doc, chkWaittime[0]);
        }

        top.Custom.init(doc, $('#desContainer')[0]);
        top.Custom.init(doc, $('#vmoption')[0]);
        top.Custom.init(doc, $('#vmSelectDiv')[0]);
        top.Custom.init(doc, $('#custom_prompt')[0]);

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#alertinfo').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "custom") {
            $("#customAlertDiv").removeClass('custom-alert');
        } else {
            $("#customAlertDiv").addClass('custom-alert');
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });
}

function prepareAddItemForm() {
    var arr = [],
        extgroupList = mWindow.extgroupList,
        queueExtList = mWindow.queueExtList;

    $("#extension").val(generateNewExt());

    $("#enable_destination").val('D').trigger('change');

    $("#leavewhenempty")[0].selectedIndex = 2;

    for (var i = 0; i < extgroupList.length; i++) {
        var obj = {};

        obj["val"] = extgroupList[i]["group_id"];

        obj["text"] = $P.lang("LANG2714") + "--" + extgroupList[i]["group_name"];

        arr.push(obj);
    }

    queueExtList = queueExtList.concat(arr);

    selectbox.appendOpts({
        el: "leftSelect",
        opts: queueExtList
    }, doc);
}

function queueNameIsExist() {
    var queueName = $("#queue_name").val(),
        queueNameList = mWindow.queueNameList,
        tmpQueueNameList = [];

    tmpQueueNameList = queueNameList.copy(tmpQueueNameList);

    if (oldQueueName) {
        tmpQueueNameList.remove(oldQueueName);
    }

    return !UCMGUI.inArray(queueName, tmpQueueNameList);
}

function extensionIsExist() {
    var extension = $("#extension").val(),
        numberList = mWindow.numberList,
        tmpNumberList = [];

    tmpNumberList = numberList.copy(tmpNumberList);

    if (oldExtension) {
        tmpNumberList.remove(oldExtension);
    }

    return !UCMGUI.inArray(extension, tmpNumberList);
}

function getQueueInfo(ext) {
    var action = {
        "action": "getQueue",
        "queue": ext
    };

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
                var queue = data.response.queue,
                    members = queue.members,
                    destinationType = queue.destination_type;

                oldExtension = queue.extension;
                oldQueueName = queue.queue_name;

                var pin = queue.pin,
                    waittime = queue.waittime;

                if (pin) {
                    $("#chk_pin").attr("checked", true);
                    $("#pin").show();
                }

                if (waittime) {
                    $("#chk_waittime").attr("checked", true);
                    $("#enable_destination").attr('disabled', true);
                    $("#waittime").show();
                }

                $("#enable_destination").val(queue.enable_destination).trigger('change');

                UCMGUI.domFunction.updateDocument(queue, document);

                $("#announce_position")[0].updateStatus();

                $("#vq_switch")[0].updateStatus();

                $('#vq_switch').trigger("change");

                var alertInfo = (queue.alertinfo ? queue.alertinfo : "");

                if (alertInfo.indexOf('custom_') > -1) {
                    $("#alertinfo").val('custom').trigger('change');

                    $("#custom_alert_info").val(alertInfo.slice(7));
                }

                $("#destination_type").trigger('change');

                if (destinationType == "voicemail") {
                    var vmExtension = queue["vm_extension"];

                    if (vmExtension) {
                        if (vmExtension == oldExtension) {
                            $("#destination_value").val("yes");
                        } else {
                            $("#destination_value").val(vmExtension);
                        }
                    } else {
                        $("#destination_value").get(0).selectedIndex = -1;
                    }
                } else if (destinationType == "external_number") {
                    if (queue[destinationType]) {
                        $("#external_number").val(queue[destinationType]);
                    } else {
                        $("#external_number").val('');
                    }
                } else {
                    destinationType = ((destinationType === "queue") ? "queue_dest" : destinationType);

                    if (queue[destinationType]) {
                        $("#destination_value").val(queue[destinationType]);
                    } else {
                        $("#destination_value").get(0).selectedIndex = -1;
                    }
                }

                $("#destination_value").trigger('change');

                top.dialog.repositionDialog("none");

                var queueExt = mWindow.queueExt,
                    tmpQueueExt = [],
                    membersArr = members ? members.split(",") : [];

                tmpQueueExt = Array.prototype.copy.call(queueExt, tmpQueueExt);
                tmpQueueExt.remove(membersArr);

                var rightQueueExt = transData(membersArr),
                    leftQueueExt = transData(tmpQueueExt);

                selectbox.appendOpts({
                    el: "leftSelect",
                    opts: leftQueueExt
                }, doc);

                selectbox.appendOpts({
                    el: "rightSelect",
                    opts: rightQueueExt
                }, doc);

                mWindow.getNameList();

                top.Custom.init(doc);
            }
        }
    });
}

function generateNewExt() {
    var i = startExt;

    for (i; i <= endExt; i++) {
        if ($.inArray(i.toString(), mWindow.numberList) == -1) {
            return i;
        }
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "extension": {
                required: true,
                digits: true,
                isExist: [$P.lang("LANG2126"), extensionIsExist],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "queue_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                isExist: [$P.lang("LANG2137"), queueNameIsExist],
            },
            "pin": {
                // required: '#chk_PIN',
                required: true,
                digits: true,
                minlength: 4
            },
            "ringtime": {
                required: true,
                digits: true
            },
            "wrapuptime": {
                required: true,
                digits: true
            },
            "retry": {
                required: true,
                digits: true,
                min: 1
            },
            "queue_timeout": {
                required: true,
                digits: true,
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG4083'), $P.lang('LANG1184')), check_time]
            },
            "voice_prompt_time": {
                required: true,
                digits: true,
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG4580'), $P.lang('LANG1184')), check_time]
            },
            "maxlen": {
                required: true,
                digits: true
            },
            "waittime": {
                // required: '#chk_waittime',
                required: true,
                digits: true,
                range: [1, 1000]
            },
            "rightSelect": {
                selectItemMax: [100, $P.lang('LANG1191')]
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
            },
            "custom_alert_info": {
                required: true,
                alphanumeric: true
            },
            "email": {
                email: true
            },
            "vq_periodic": {
                digits: true,
                range: [5, 2000]
            },
            "vq_outprefix": {
                maxlength: 10
            },
            "announce_frequency": {
                digits: true,
                range: [20, 2000]
            }
        },
        submitHandler: function() {
            var action = {},
                members = [],
                extensionVal = $("#extension").val(),
                destinationTypeVal = $("#destination_type option:selected").val(),
                destinationVal = $("#destination_value option:selected").val(),
                destinationVal_nu = $("#external_number").val();

            action = UCMGUI.formSerializeVal(doc);

            action["destination_type"] = destinationTypeVal;

            if (destinationTypeVal == "voicemail") {
                action["hasvoicemail"] = "yes";
                // action["vm_extension"] = extensionVal;

                if (destinationVal == "yes") {
                    action["queuesasvm"] = "yes";
                } else {
                    action["queuesasvm"] = "no";
                }
            } else {
                // action[destinationTypeVal] = destinationVal;
                action["hasvoicemail"] = "no";
                action["vm_extension"] = "";
                action["queuesasvm"] = "no";
            }

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
                        if (destinationVal == "yes") {
                            action["vm_extension"] = extensionVal;
                        } else {
                            action["vm_extension"] = destinationVal;
                        }
                    } else if (actionItemArrIndex == "external_number") {
                        action[actionItemArrIndex] = destinationVal_nu;
                    } else {
                        action[actionItemArrIndex] = destinationVal;
                    }
                }
            }

            action["alertinfo"] = $('#alertinfo').val();

            $.each($("#rightSelect").children(), function(index, item) {
                members.push($(item).val());
            });

            action["members"] = members.toString();

            if (mode == 'edit') {
                action["queue"] = oldExtension;

                if ($("#pin").is(":hidden")) {
                    action["pin"] = "";
                }
            }

            if ($("#waittime").is(":hidden")) {
                action["waittime"] = "";
            }

            if ($("#enable_destination").is(":disabled")) {
                action["enable_destination"] = 'D';
            }

            if (action["alertinfo"] === 'custom') {
                action["alertinfo"] = 'custom_' + $("#custom_alert_info").val();
            }
            
            action["action"] = (mode == 'edit' ? "updateQueue" : "addQueue");

            updateOrAddQueueInfo(action);
        }
    });

    if (disableRange == "no") {
        $P("#extension", document).rules("add", {
            range: [startExt, endExt]
        });
    }
}

function transData(res, cb) {
    var arr = [],
        extgroupListObj = mWindow.extgroupListObj;

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extgroupListObjItem = extgroupListObj[res[i]];

        if (extgroupListObjItem) {
            obj["val"] = extgroupListObjItem["val"];
            obj["text"] = $P.lang("LANG2714") + "--" + extgroupListObjItem["text"];
        } else {
            obj = UCMGUI.ObjectArray.find('val', res[i], mWindow.queueExtList);
        }

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transDestinationVal(res, type) {
    var queueName = $("#queue_name").val(),
        arr = [];

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
            var resQueueName = res[i]["queue_name"];

            if (queueName == resQueueName) {
                continue;
            }

            obj["text"] = resQueueName;
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

function updateOrAddQueueInfo(action) {
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
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {

                /*
                 * Pengcheng Zou Added. For Bug 35499.
                 */
                // var updateNumbers = [],
                //     queueExt = $("#extension").val(),
                //     currentLogin = queueSettings.queuelogin,
                //     currentLogout = queueSettings.queuelogout;

                // if (currentLogin) {
                //     updateNumbers.push("('" + queueExt + currentLogin + "')");
                // }

                // if (currentLogout) {
                //     updateNumbers.push("('" + queueExt + currentLogout + "')");
                // }

                // if (updateNumbers.length) {
                //     $.ajax({
                //         type: "post",
                //         url: "../cgi",
                //         async: false,
                //         data: {
                //             'action': 'updateQueueAgentNumbers',
                //             'numbers': updateNumbers.toString()
                //         },
                //         error: function(jqXHR, textStatus, errorThrown) {},
                //         success: function(data) {
                //             // var bool = UCMGUI.errorHandler(data);

                //             // if (bool) {}
                //         }
                //     });
                // }
                /* ------ End ------ */

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#queue-list", mWindow.document).trigger('reloadGrid');
                        mWindow.getNameList();
                    }
                });

            }
        }
    });
}

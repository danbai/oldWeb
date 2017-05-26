/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    maxExtension = config.maxExtension,
    num_pri = config.model_info.num_pri,
    maxTimeCondition = config.maxTimeCondition,
    gup = UCMGUI.gup,
    selectbox = UCMGUI.domFunction.selectbox,
    addZero = UCMGUI.addZero,
    ifExisted = UCMGUI.inArray,
    mode = gup.call(window, "mode"),
    type = gup.call(window, "type"),
    extension = gup.call(window, "extension"),
    enableCheckBox = UCMGUI.domFunction.enableCheckBox,
    disableCheckBox = UCMGUI.domFunction.disableCheckBox,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    existNumberList = mWindow.existNumberList,
    existExtentionList = mWindow.existExtentionList,
    existFXSList = mWindow.existFXSList,
    mohNameList = mWindow.mohNameList,
    extensionRange = mWindow.extensionRange,
    portExtensionList = mWindow.portExtensionList,
    autoEmailToUser = mWindow.autoEmailToUser,
    languages = mWindow.languages,
    lanOption = "<option value>" + $P.lang("LANG257") + "</option>",
    deleteRowLikeDomain = UCMGUI.deleteRowLikeDomain,
    addRowLikeDomain = UCMGUI.addRowLikeDomain,
    showCheckPassword = UCMGUI.enableWeakPw.showCheckPassword,
    updateDocumentException = UCMGUI.domFunction.updateDocumentException,
    getPrivilegeAction = UCMGUI.getPrivilegeAction,
    maxRowOfLocalNet = 10,
    datactol = {
        "clicked": false,
        "timeout": null
    },
    privilegeInfo = {},
    oldDom = '',
    currentPort,
    userID, // Pengcheng Zou Added for Edit.
    isEmptyTimeCondition = false;

Array.prototype.each = top.Array.prototype.each;
String.prototype.format = top.String.prototype.format;
Array.prototype.sortBy = top.Array.prototype.sortBy;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    initValidator();

    $('#edit_strategy_ipacl, #batch_strategy_ipacl, #edit_multiple_strategy_ipacl').change(function() {
        if ($(this).val() === "1") {
            var cur_net = top.window.location.host.split('.', 3).join(".") + ".0";

            $("input[name='local_network1']").val(cur_net);
        }
    });
    preparedData();
    UCMGUI.domFunction.setDfaltVal($("[name=max_contacts]"));
    if (type != 'sip') {
        $('.qualify_div').hide()
    }
    if (mode == 'add' || mode == 'edit') {
        if (mode === 'edit') {
            var reg = /type=(")?text(")?/;

            $('#edit_secret_span, #edit_vmsecret_span').each(function() {
                $(this).html($(this).html().toLowerCase().replace(reg, 'type="password"'));
            });

            $('.lightOffBtn').css('display', 'inline-block');
        }

        check_timecondition_tips();

        addEditExtension();

        $("#btn_local_network1").on('click', function() {
            if ($("#strategy_table1 tbody tr").length >= 10) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: top.$.lang("LANG948"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
                return;
            }

            addRowLikeDomain(doc, {
                "tableId": "strategy_table1",
                "rowNamePrefix": "local_network",
                "rowIdPrefix": "edit_local_network",
                "maxRow": maxRowOfLocalNet,
                "startWith1": true,
                "validRules": {
                    customCallback: [$P.lang("LANG2131"), check_network],
                    customCallback1: [$P.lang("LANG5247"), checkNum]
                }
            })
        });

        $("#btn_whitelist1").on('click', function() {
            if ($("#strategy_table4 tbody tr").length >= 10) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: top.$.lang("LANG809").format('', 10),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
                return;
            }

            addRowLikeDomain(doc, {
                "tableId": "strategy_table4",
                "rowNamePrefix": "edit_whitelist",
                "rowIdPrefix": "edit_whitelist",
                "maxRow": maxRowOfLocalNet,
                "startWith1": true,
                "validRules": {
                    phoneNumberOrExtension: true,
                    customCallback: [$P.lang("LANG5211"), checkWhitelistOnly]
                }
            })
        });
    } else if (mode == 'batchAdd') {
        batchAddExtension();

        $("#btn_batch_local_network1").on('click', function() {
            if ($("#strategy_table3 tbody tr").length >= maxRowOfLocalNet) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: top.$.lang("LANG948"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
                return;
            }

            addRowLikeDomain(doc, {
                "tableId": "strategy_table3",
                "rowNamePrefix": "local_network",
                "rowIdPrefix": "batch_local_network",
                "startWith1": true,
                "maxRow": maxRowOfLocalNet,
                "validRules": {
                    customCallback: [$P.lang("LANG2131"), check_network],
                    customCallback1: [$P.lang("LANG5247"), checkNum]
                }
            })
        });

    } else if (mode == 'batchEdit') {
        batchEditExtension();

        $("#btn_multiple_local_network1").on('click', function() {
            if ($("#strategy_table2 tbody tr").length >= maxRowOfLocalNet) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: top.$.lang("LANG948"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
                return;
            }

            addRowLikeDomain(doc, {
                "tableId": "strategy_table2",
                "rowNamePrefix": "local_network",
                "rowIdPrefix": "edit_multiple_local_network",
                "startWith1": true,
                "maxRow": maxRowOfLocalNet,
                "validRules": {
                    customCallback: [$P.lang("LANG2131"), check_network],
                    customCallback1: [$P.lang("LANG5247"), checkNum]
                }
            })
        });
    }

    if (mode != 'edit') {
        isEnableWeakPw();
    }

    $('#createUser').bind('click', function() {
        if (mode == 'add') {
            askExtensionRange($("#edit_extension").val(), extensionRange[0], extensionRange[1], extensionRange[2]);
        }
    });

    // $('#batchAddUsers').bind('click', function() {
    //     askExtensionRange($("#batch_extension").val(), extensionRange[0], extensionRange[1], extensionRange[2]);
    // });

    // Prevent form submit by pressing enter key. Pengcheng Zou Added.
    $("#form").keypress(function(e) {
        if (e.which == 13) {
            var tagName = e.target.tagName.toLowerCase();

            if (tagName !== "textarea") {
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                return false;
            }
        }
    });

    BindEvent();

    $.navSlide(true, false, true, true);

    getGenaral();



    top.Custom.init(doc);
});

function preparedData () {
    selectbox.electedSelect({
        rightSelect: "rightSelect",
        leftSelect: "leftSelect",
        allToRight: "allToRight",
        oneToRight: "oneToRight",
        oneToLeft: "oneToLeft",
        allToLeft: "allToLeft",
        cb: function() {
            $P("#rightSelect", doc).valid();
        }
    }, doc);

    selectbox.appendOpts({
        el: "leftSelect",
        opts: mWindow.accountLists
    }, doc);

    selectbox.electedSelect({
        rightSelect: "seamless_rightSelect",
        leftSelect: "seamless_leftSelect",
        allToRight: "seamless_allToRight",
        oneToRight: "seamless_oneToRight",
        oneToLeft: "seamless_oneToLeft",
        allToLeft: "seamless_allToLeft",
        cb: function() {
            $P("#seamless_rightSelect", doc).valid();
        }
    }, doc);

    selectbox.appendOpts({
        el: "seamless_leftSelect",
        opts: mWindow.accountLists
    }, doc);

    selectbox.electedSelect({
        rightSelect: "batch_edit_rightSelect",
        leftSelect: "batch_edit_leftSelect",
        allToRight: "batch_edit_allToRight",
        oneToRight: "batch_edit_oneToRight",
        oneToLeft: "batch_edit_oneToLeft",
        allToLeft: "batch_edit_allToLeft",
        cb: function() {
            $P("#batch_edit_rightSelect", doc).valid();
        }
    }, doc);

    selectbox.appendOpts({
        el: "batch_edit_leftSelect",
        opts: mWindow.accountLists
    }, doc);

    selectbox.electedSelect({
        rightSelect: "seamless_batch_edit_rightSelect",
        leftSelect: "seamless_batch_edit_leftSelect",
        allToRight: "seamless_batch_edit_allToRight",
        oneToRight: "seamless_batch_edit_oneToRight",
        oneToLeft: "seamless_batch_edit_oneToLeft",
        allToLeft: "seamless_batch_edit_allToLeft",
        cb: function() {
            $P("#seamless_batch_edit_rightSelect", doc).valid();
        }
    }, doc);

    selectbox.appendOpts({
        el: "seamless_batch_edit_leftSelect",
        opts: mWindow.accountLists
    }, doc);

    selectbox.electedSelect({
        rightSelect: "batch_add_rightSelect",
        leftSelect: "batch_add_leftSelect",
        allToRight: "batch_add_allToRight",
        oneToRight: "batch_add_oneToRight",
        oneToLeft: "batch_add_oneToLeft",
        allToLeft: "batch_add_allToLeft",
        cb: function() {
            $P("#batch_add_rightSelect", doc).valid();
        }
    }, doc);

    selectbox.appendOpts({
        el: "batch_add_leftSelect",
        opts: mWindow.accountLists
    }, doc);

    selectbox.electedSelect({
        rightSelect: "seamless_batch_add_rightSelect",
        leftSelect: "seamless_batch_add_leftSelect",
        allToRight: "seamless_batch_add_allToRight",
        oneToRight: "seamless_batch_add_oneToRight",
        oneToLeft: "seamless_batch_add_oneToLeft",
        allToLeft: "seamless_batch_add_allToLeft",
        cb: function() {
            $P("#seamless_batch_add_rightSelect", doc).valid();
        }
    }, doc);

    selectbox.appendOpts({
        el: "seamless_batch_add_leftSelect",
        opts: mWindow.accountLists
    }, doc);
}

var isEnableWeakPw = function() {
    $P("#user_password", document).rules("add", {
        checkAlphanumericPw: [
            showCheckPassword, {
                pwsId: "#user_password",
                doc: document
            }
        ]
    });

    if (extensionRange[4] == "yes") { // weak_password
        $(".password-div").hide();

        var obj = {
                pwsId: "#edit_secret",
                doc: document
            },
            new_ext = $P.lang("LANG85"),
            edit_secret = $P.lang("LANG1075"),
            edit_vmsecret = $P.lang("LANG1079");

        if (mode == "add" || mode == "edit") {
            $P("#edit_secret", document).rules("add", {
                required: true,
                identical: [new_ext, edit_secret, $("#edit_extension")],
                checkAlphanumericPw: [showCheckPassword, obj]
            });
            $P("#edit_vmsecret", document).rules("add", {
                identical: [new_ext, edit_vmsecret, $("#edit_extension")],
                checkNumericPw: [
                    showCheckPassword, {
                        type: "digital",
                        pwsId: "#edit_vmsecret",
                        doc: document
                    }
                ]
            });
            $P("#edit_user_outrt_passwd", document).rules("add", {
                notEqualTo: [$P.lang('LANG86').format($P.lang('LANG4342')).toLowerCase(), $('#edit_extension')],
                checkNumericPw: [
                    showCheckPassword, {
                        type: "digital",
                        pwsId: "#edit_user_outrt_passwd",
                        doc: document
                    }
                ]
            });
        } else if (mode == "batchEdit") {
            var selectedUsers = extension.split(',');
            $P("#edit_multiple_secret", document).rules("add", {
                identical: [new_ext, edit_secret, selectedUsers],
                checkAlphanumericPw: [
                    showCheckPassword, {
                        pwsId: "#edit_multiple_secret",
                        doc: document
                    }
                ]
            });
            $P("#edit_multiple_vmsecret", document).rules("add", {
                identical: [new_ext, edit_vmsecret, selectedUsers],
                checkNumericPw: [
                    showCheckPassword, {
                        type: "digital",
                        pwsId: "#edit_multiple_vmsecret",
                        doc: document
                    }
                ]
            });
        } else if (mode == "batchAdd") {
            $P("#batch_secret", document).rules("add", {
                //identical: [new_ext, edit_secret, getBatchUsers()],
                customCallback: [$P.lang("LANG2637").format(new_ext, edit_secret), checkIdentical],
                checkAlphanumericPw: [
                    showCheckPassword, {
                        pwsId: "#batch_secret",
                        doc: document
                    }
                ]
            });
            $P("#batch_vmsecret", document).rules("add", {
                //identical: [new_ext, edit_vmsecret, getBatchUsers()],
                customCallback: [$P.lang("LANG2637").format(new_ext, edit_vmsecret), checkIdentical],
                checkNumericPw: [
                    showCheckPassword, {
                        type: "digital",
                        pwsId: "#batch_vmsecret",
                        doc: document
                    }
                ]
            });
        }
    }
};

function checkIdentical(val, ele) {
    var params = getBatchUsers();

    if ($.isArray(params)) {
        for (var i = 0; i < params.length; i++) {
            if (val === params[i]) {
                return false;
            }
        }
    }

    return true;
}

var OrderTable = {
    "lists": [],
    "table_id": '',
    "operater_switch": true,
    "newCell": [],
    "click_val": null,
    "bind_event": function() {
        var TBL = $('#' + this.table_id)[0];

        $(TBL).on('click', '.table-add', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            if (OrderTable.max_failover > 0 && OrderTable.max_failover <= OrderTable.lists.length) {
                var target = $(this),
                    max_msg = $P.lang("LANG2141").format(OrderTable.max_failover);

                // XXX it doesn't work until I set tooltip position twice.
                $(this).tooltip({
                    position: {
                        my: "right center",
                        at: "left center"
                    }
                });

                $(this).attr("titles", max_msg).addClass("ui-state-highlight").trigger("focusin");

                setTimeout(function() {
                    target.removeAttr("titles").removeClass("ui-state-highlight").trigger("focusout");
                }, 2000);

                return;
            }

            top.dialog.dialogCommands.hide();

            append_time_value();

            var clickRow = $(this).parent().parent(),
                newCell = doc.createElement('tr');

            OrderTable.newCell = $(newCell);

            $(newCell)
                .css({
                    'background': '#CAECFF'
                })
                .attr({
                    'id': 'new_time_condition'
                });


            var cell = doc.createElement('td');

            $(cell).attr('colspan', 5);

            newCell.appendChild(cell);


            // new add div
            var div = doc.createElement('div');

            $(div).attr('class', 'testdiv');

            cell.appendChild(div);


            $('#table_edit_template').appendTo($(div));

            clickRow.after(newCell);

            $('#table-add-btn').show();
            $('#table-edit-btn').hide();

            // default edit value
            OrderTable.set_edit_values(-1);

            if (clickRow.attr('data-item-val') === 'add_item') {
                clickRow.hide();
            }

            // $('#table-add-btn').show();
            OrderTable.click_val = $(this).parent().parent().attr('data-item-val');

            $("#table_edit_template input[type=checkbox]:checked").each(function(index) {
                this.checked = false;
                this.previousSibling.style.backgroundPosition = "0 0";
            });

            $("#table_edit_template input[type=radio]").each(function(index) {
                if (!this.checked) {
                    this.previousSibling.style.backgroundPosition = "0 0";
                }
            });

            $("#new_itrl_stime_hour").change(function() {
                if (!$("#new_itrl_stime_minute").val()) {
                    $("#new_itrl_stime_minute").val("00");
                    top.Custom.init(doc, $('#new_itrl_stime_minute')[0]);
                }
            });

            $("#new_itrl_ftime_hour").change(function() {
                if (!$("#new_itrl_ftime_minute").val()) {
                    $("#new_itrl_ftime_minute").val("00");
                    top.Custom.init(doc, $('#new_itrl_ftime_minute')[0]);
                }
            });

            // reset innerhtml height
            // if (window.frameElement) {
            //     $(window.frameElement).css("height", "0px");
            // }

            // top.dialog.currentDialogType = "iframe";

            // top.dialog.repositionDialog("none");
            // top.dialog.repositionDialog();

            OrderTable.operater_switch = 'add';

            top.Custom.init(doc);

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;

            // TODO
            // disable operator -- add/edit/up/down...
        });

        $(TBL).on('click', '.table-del', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            var clickRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('condition_index', clickRow.attr('data-item-val'));

            // remove select item from lists
            OrderTable.lists.splice(curIdx, 1);

            OrderTable.refresh_timecondition();

            // reset innerhtml height
            if (window.frameElement) {
                $(window.frameElement).css("height", "0px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-edit', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            top.dialog.dialogCommands.hide();

            var clickRow = $(this).parent().parent(),
                newCell = doc.createElement('tr');

            OrderTable.newCell = $(newCell);

            $(newCell).css('background', '#CAECFF');


            var cell = doc.createElement('td');

            $(cell).attr('colspan', 5);

            newCell.appendChild(cell);


            var curIdx = OrderTable.getOptionOrder('condition_index', clickRow.attr('data-item-val'));

            OrderTable.set_edit_values(curIdx);


            // new add div
            var div = doc.createElement('div');

            $(div).attr('class', 'testdiv');

            cell.appendChild(div);


            $('#table_edit_template').appendTo($(div));

            clickRow.after(newCell);

            $('#table-add-btn').hide();
            $('#table-edit-btn').show();

            clickRow.hide();

            OrderTable.click_val = $(this).parent().parent().attr('data-item-val');

            // reset innerhtml height
            // if (window.frameElement) {
            //     $(window.frameElement).css("height", "0px");
            // }

            // top.dialog.currentDialogType = "iframe";

            // top.dialog.repositionDialog();

            OrderTable.operater_switch = 'edit';

            top.Custom.init(doc);

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });
    },
    "getOptionOrder": function(key, val) {
        var len = this.lists.length;

        for (var i = 0; i < len; i++) {
            if (this.lists[i][key] == val) {
                return i;
            }
        }

        return -1;
    },
    "tbl_btn_cancel": function(ev) {
        top.dialog.dialogCommands.show();

        $('#table_edit_template').appendTo($('#table_template_placeholder'));
        $('[data-item-val="' + this.click_val + '"]').show();

        this.newCell.remove();
        this.newCell = [];

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";
        top.dialog.repositionDialog();

        OrderTable.operater_switch = true;
        OrderTable.click_val = null;
    },
    "tbl_btn_add": function(ev) {
        // TODO
        // var elements = '#new_itrl_tc_dest, #new_itrl_tc_dest_val, #new_itrl_tc_digits, ' +
        //         '#new_itrl_stime_hour, #new_itrl_ftime_hour, #new_itrl_stime_minute, ' +
        //         '#new_itrl_ftime_minute, #new_itrl_month_jan, #new_itrl_week_sun';

        if (!$P('#form', document).valid()) {
            return;
        }

        if ($('#mode')[0].checked) {
            if (!check_days_required()) {
                // check failed
                return;
            }
        }

        // Prevent form submit by pressing enter key. Pengcheng Zou Added.
        // if (!check_week_required()) {
        //     return false;
        // }

        var stime_hour = $('#new_itrl_stime_hour')[0].value,
            stime_minute = $('#new_itrl_stime_minute')[0].value,
            ftime_hour = $('#new_itrl_ftime_hour')[0].value,
            ftime_minute = $('#new_itrl_ftime_minute')[0].value,
            time = '';

        if (stime_hour == "" && stime_minute == "" && ftime_hour == "" && ftime_minute == "") {
            stime_hour = '00';
            stime_minute = '00';
            ftime_hour = '23';
            ftime_minute = '59';
            time = "00:00-23:59";
        } else {
            time = stime_hour + ':' + stime_minute + '-' + ftime_hour + ':' + ftime_minute;
        }

        var date_add = function(container, key, el_id) {
            el = doc.getElementById(el_id);

            if (el.checked == false) {
                return;
            }

            var offset = el_id.indexOf(key) + key.length + 1,
                value = el_id.substring(offset);

            if (container['value'] == '') {
                container['value'] = value;
            } else {
                container['value'] = container['value'] + '&' + value;
            }
        };

        var mode = '';

        if ($('#mode')[0].checked) {
            mode = 'byDay';
        } else {
            mode = 'byWeek';
        }

        // week
        var week = {
            value: ''
        };

        date_add(week, 'week', 'new_itrl_week_sun');
        date_add(week, 'week', 'new_itrl_week_mon');
        date_add(week, 'week', 'new_itrl_week_tue');
        date_add(week, 'week', 'new_itrl_week_wed');
        date_add(week, 'week', 'new_itrl_week_thu');
        date_add(week, 'week', 'new_itrl_week_fri');
        date_add(week, 'week', 'new_itrl_week_sat');

        // month
        var month = {
                value: ''
            },
            day = {
                value: ''
            };

        if (!$('#mode')[0].checked) {
            month.value = '*';
            day.value = '*';
        } else {
            date_add(month, 'month', 'new_itrl_month_jan');
            date_add(month, 'month', 'new_itrl_month_feb');
            date_add(month, 'month', 'new_itrl_month_mar');
            date_add(month, 'month', 'new_itrl_month_apr');
            date_add(month, 'month', 'new_itrl_month_may');
            date_add(month, 'month', 'new_itrl_month_jun');
            date_add(month, 'month', 'new_itrl_month_jul');
            date_add(month, 'month', 'new_itrl_month_aug');
            date_add(month, 'month', 'new_itrl_month_sep');
            date_add(month, 'month', 'new_itrl_month_oct');
            date_add(month, 'month', 'new_itrl_month_nov');
            date_add(month, 'month', 'new_itrl_month_dec');

            var tmp_days = [];

            $('.day_selected').each(function(item) {
                var day_number = $(this).attr('id').afterChar('_');

                tmp_days.push(day_number);
            });

            day.value = tmp_days.join('&');
        }

        $('#table_edit_template').appendTo($('#table_template_placeholder'));

        // display time condition
        this.newCell = [];

        var order = this.getOptionOrder('condition_index', this.click_val);

        order = parseInt(order, 10);

        // time condition object
        var newTimeCondition = {
            'condition_index': getIndexName(),
            'start_hour': stime_hour,
            'start_min': stime_minute,
            'end_hour': ftime_hour,
            'end_min': ftime_minute,
            'time': time,
            'mode': mode,
            'week_day': week['value'],
            'month': month['value'],
            'day': day['value']
        };

        this.lists.splice(order + 1, 0, newTimeCondition);
        this.refresh_timecondition();

        top.dialog.dialogCommands.show();

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();

        OrderTable.operater_switch = true;
        OrderTable.click_val = null;

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    },
    "tbl_btn_update": function(ev) {
        // TODO
        // var elements = '#new_itrl_tc_dest, #new_itrl_tc_dest_val, #new_itrl_tc_digits, ' +
        //         '#new_itrl_stime_hour, #new_itrl_ftime_hour, #new_itrl_stime_minute, ' +
        //         '#new_itrl_ftime_minute, #new_itrl_month_jan, #new_itrl_week_sun';

        if (!$P('#form', document).valid()) {
            return;
        }

        if ($('#mode')[0].checked) {
            if (!check_days_required()) {
                // check failed
                return;
            }
        }

        var order = this.getOptionOrder('condition_index', this.click_val),
            stime_hour = $('#new_itrl_stime_hour')[0].value,
            stime_minute = $('#new_itrl_stime_minute')[0].value,
            ftime_hour = $('#new_itrl_ftime_hour')[0].value,
            ftime_minute = $('#new_itrl_ftime_minute')[0].value,
            time = stime_hour + ':' + stime_minute + '-' + ftime_hour + ':' + ftime_minute;

        var mode = '';

        if ($('#mode')[0].checked) {
            mode = 'byDay';
        } else {
            mode = 'byWeek';
        }

        this.lists[order]['start_hour'] = stime_hour;
        this.lists[order]['start_min'] = stime_minute;
        this.lists[order]['end_hour'] = ftime_hour;
        this.lists[order]['end_min'] = ftime_minute;
        this.lists[order]['time'] = time;
        this.lists[order]['mode'] = mode;

        var date_add = function(container, key, el_id) {
            el = doc.getElementById(el_id);

            if (el.checked == false) {
                return;
            }

            var offset = el_id.indexOf(key) + key.length + 1,
                value = el_id.substring(offset);

            if (container['value'] == '') {
                container['value'] = value;
            } else {
                container['value'] = container['value'] + '&' + value;
            }
        };

        // week
        var week = {
            value: ''
        };

        date_add(week, 'week', 'new_itrl_week_sun');
        date_add(week, 'week', 'new_itrl_week_mon');
        date_add(week, 'week', 'new_itrl_week_tue');
        date_add(week, 'week', 'new_itrl_week_wed');
        date_add(week, 'week', 'new_itrl_week_thu');
        date_add(week, 'week', 'new_itrl_week_fri');
        date_add(week, 'week', 'new_itrl_week_sat');

        this.lists[order]['week_day'] = week.value;

        // month
        var month = {
                value: ''
            },
            day = {
                value: ''
            };

        if (!$('#mode')[0].checked) {
            month.value = '*';
            day.value = '*';
        } else {
            date_add(month, 'month', 'new_itrl_month_jan');
            date_add(month, 'month', 'new_itrl_month_feb');
            date_add(month, 'month', 'new_itrl_month_mar');
            date_add(month, 'month', 'new_itrl_month_apr');
            date_add(month, 'month', 'new_itrl_month_may');
            date_add(month, 'month', 'new_itrl_month_jun');
            date_add(month, 'month', 'new_itrl_month_jul');
            date_add(month, 'month', 'new_itrl_month_aug');
            date_add(month, 'month', 'new_itrl_month_sep');
            date_add(month, 'month', 'new_itrl_month_oct');
            date_add(month, 'month', 'new_itrl_month_nov');
            date_add(month, 'month', 'new_itrl_month_dec');

            var tmp_days = [];

            $('.day_selected').each(function(item) {
                var day_number = $(this).attr('id').afterChar('_');

                tmp_days.push(day_number);
            });

            day.value = tmp_days.join('&');
        }

        this.lists[order]['month'] = month.value;
        this.lists[order]['day'] = day.value;

        $('#table_edit_template').appendTo($('#table_template_placeholder'));

        // this.newCell.remove();
        this.newCell = [];

        this.refresh_timecondition();

        top.dialog.dialogCommands.show();

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();

        OrderTable.operater_switch = true;
        OrderTable.click_val = null;

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    },
    "refresh_timecondition": function() {
        var TBL = $('#' + this.table_id)[0];
        var addCell = UCMGUI.domFunction.tr_addCell;

        $(TBL).children().remove();

        (function() { // add first row
            var newRow = TBL.insertRow(-1);

            newRow.className = "frow";

            addCell(newRow, {
                html: $P.lang('LANG247'),
                locale: 'LANG247'
            });
            addCell(newRow, {
                html: $P.lang('LANG243'),
                locale: 'LANG243'
            });
            addCell(newRow, {
                html: $P.lang('LANG244'),
                locale: 'LANG244'
            });
            addCell(newRow, {
                html: $P.lang('LANG242'),
                locale: 'LANG242'
            });
            addCell(newRow, {
                html: $P.lang('LANG74'),
                locale: 'LANG74'
            });
        })();

        var len = this.lists.length;

        if (len <= 0) {
            isEmptyTimeCondition = true;
            var newRow = TBL.insertRow(-1);

            newRow.className = "odd";

            var td = $('<td colspan=5 />');

            $(newRow).append(td);
            $(newRow).attr('data-item-val', 'add_item');
            $(td).append('<span class="table-add">' + $P.lang('LANG1562') + '</span>');

            return false;
        } else {
            isEmptyTimeCondition = false;
        }

        // show item list
        for (var i = 0; i < len; i++) {
            var item = this.lists[i],
                newRow = TBL.insertRow(-1);

            newRow.className = ((TBL.rows.length) % 2 == 1) ? 'odd' : 'even';

            addCell(newRow, {
                html: item.time || ''
            });

            addCell(newRow, {
                html: createWeek(item.week_day)
            });

            addCell(newRow, {
                html: createMonth(item.month)
            });

            addCell(newRow, {
                html: createDay(item.day)
            });

            // addCell(newRow, { html: "<div locale=\"LANG566 "+tmp_dest+"\">"+"$P.lang(\""+lang+"\") -- "+tmp_str+"</div>"});
            var newCell = newRow.insertCell(newRow.cells.length);
            var $tmp;

            // add icon
            $tmp = $('<span />').addClass('table-add tableIcon table-add-icon').attr('localeTitle', 'LANG769').attr('title', $P.lang('LANG769')).appendTo(newCell);

            // empty icon
            // $tmp = $('<span />').addClass('tableIcon').appendTo(newCell);
            // edit, delete icons
            $tmp = $('<span />').attr('title', $P.lang('LANG738')).attr('localeTitle', 'LANG738').addClass('table-edit tableIcon').appendTo(newCell);
            $tmp = $('<span />').attr('title', $P.lang('LANG739')).attr('localeTitle', 'LANG739').addClass('table-del tableIcon').appendTo(newCell);

            $(newRow).attr('data-item-val', item.condition_index);
        }

        $('.table-add').tooltip({
            position: {
                my: "right center",
                at: "left center"
            }
        });
    },
    "set_edit_values": function(idx) {
        $(".chk_week").attr("checked", false);
        $("#new_itrl_week_all").attr("checked", false);
        $(".chk_month").attr("checked", false);
        $("#new_itrl_month_all").attr("checked", false);

        var set_chkbox_all = function(type, value) {
            var str = '#new_itrl_' + type + '_container',
                container = $(str).children();

            for (var i = 0; i < container.length; i++) {
                var it = container[i];

                if (it.type == 'checkbox') {
                    it.checked = value;
                }
            }
        };

        var set_selected_chkbox = function(str, type, value) {
            var template = 'new_itrl_' + type + '_';

            if (str.split("&").length == 7 && str.indexOf("mon&tue") > -1) {
                $("#new_itrl_week_all")[0].checked = true;
            }
            if (str.split("&").length == 12 && str.indexOf("jan&feb") > -1) {
                $("#new_itrl_month_all")[0].checked = true;
            }

            while (str.indexOf('&') != -1) {
                var offset = str.indexOf('&'),
                    sstr = str.substring(0, offset),
                    chkbox = doc.getElementById(template + sstr);

                if (chkbox) {
                    chkbox.checked = value;
                }

                $('day_' + sstr).attr('class', 'day_selected');

                str = str.substring(offset + 1);
            }

            if (str != '') {
                var chkbox = doc.getElementById(template + str);

                if (chkbox) {
                    chkbox.checked = value;
                }
            }
        };

        if (idx == -1) {
            $('#new_itrl_stime_hour')[0].selectedIndex = -1;
            $('#new_itrl_stime_minute')[0].selectedIndex = -1;
            $('#new_itrl_ftime_hour')[0].selectedIndex = -1;
            $('#new_itrl_ftime_minute')[0].selectedIndex = -1;

            set_chkbox_all('week', false);
            set_chkbox_all('month', false);

            $('.local_month, .local_day').hide();

            $('#new_itrl_day_container td').removeClass('day_selected').addClass('day_unselected');
            return;
        }

        var item = this.lists[idx] || {},
            tmp_str,
            mode;

        // time
        $('#new_itrl_stime_hour').val(item.start_hour);
        $('#new_itrl_stime_minute').val(item.start_min);
        $('#new_itrl_ftime_hour').val(item.end_hour);
        $('#new_itrl_ftime_minute').val(item.end_min);

        // week
        tmp_str = item.week_day;

        set_chkbox_all('week', false);

        set_selected_chkbox(tmp_str.toLowerCase(), 'week', true);

        mode = item.mode;

        if (mode == 'byDay') {
            $('#mode')[0].checked = true;

            $('.local_month, .local_day, #new_itrl_day_container').show();
        } else {
            $('#mode')[0].checked = false;

            $('.local_month, .local_day, #new_itrl_day_container').hide();
        }

        // month
        tmp_str = item.month;

        set_chkbox_all('month', false);

        if (tmp_str == '*') {
            // Do nothing
        } else {
            set_selected_chkbox(tmp_str.toLowerCase(), 'month', true);
        }

        var chkbox_all = function(value) {
            var i = 1,
                t = doc.getElementById('new_itrl_day_' + i);

            while (t) {
                t.checked = value;

                i++;

                t = doc.getElementById('new_itrl_day_' + i);
            }
        };

        var chkbox_selected = function(str, value) {
            $(".day_selected").removeClass("day_selected");

            str.split('&').each(function(item) {
                $('#day_' + item).attr('class', 'day_selected');
            });
        };

        // day
        tmp_str = item.day;

        chkbox_all(false);

        if (tmp_str == '*') {
            // Do nothing
            $('#new_itrl_day_container td').removeClass('day_selected').addClass('day_unselected');
        } else {
            chkbox_selected(tmp_str.toLowerCase(), true);
        }
    }
};

function BindEvent() {
    var prefix = '',
        oPwd;

    if (mode == 'add' || mode == 'edit') {
        prefix = 'edit';
        oPwd = $('#' + prefix + '_user_outrt_passwd')[0];
    } else if (mode == 'batchAdd') {
        prefix = 'batch';
    } else if (mode == 'batchEdit') {
        prefix = 'edit_multiple';
    }

    var oAuth = $('#' + prefix + '_bypass_outrt_auth'),
        oTimeType = $('.skip_auth_timetype');

    oAuth.bind('change', function() {
        if ($(this).val() != 'bytime') {
            oTimeType.hide();
        } else {
            oTimeType.show();
        }

        if (oPwd) {
            oPwd.disabled = ($(this).val() === "yes" ? true : false);
        }
    });

    if (oAuth.val() == 'bytime') {
        oTimeType.show();
    }

    if (oPwd && (oAuth.val() === "yes")) {
        oPwd.disabled = true;
    }
}

// function navSlide() {
//     var aSettings = $(".settings"),
//         aLi = $("#nav_settings").find("li"),
//         oCommand = top.dialog.dialogCommands;

//     aLi.on('click', function() {
//         if ($(this).hasClass("current")) {
//             return;
//         }

//         if (!$P("#form", document).valid()) {
//             $("input[titles], select[titles], textarea[titles]").focus();

//             return;
//         }

//         var index = $(this).index();

//         $(this).addClass("current").siblings().removeClass("current");

//         aSettings.eq(index).addClass("current_position").siblings().removeClass("current_position");

//         if (index == 3) {
//             if ($("#table-add-btn").is(":visible") || $("#table-edit-btn").is(":visible")) {
//                 oCommand.hide();
//             }
//         } else {
//             if (oCommand.is(":hidden")) {
//                 oCommand.show();
//             }
//         }
//     });
// }

function addEditExtension() {
    $("#add_extension_div").show();

    bindTimeConditionEvent();

    append_time_value(mode);

    if (type) {
        $(".div_" + type).css({
            "display": "inline-block"
        });

        if (type !== 'fxs') {
            $("#codec_div").closest('.field-cell').show();

            $("#div_sip_iax_secret, #div_encryption, #div_strategy_ipacl").css({
                "display": "inline-block"
            });

            if (type == 'sip') {
                $("#select_available_codec option[value=opus]").removeClass("hide");
                $("#div_sip_enablehotdesk, #auth_id, #div_custom_autoanswer, .alertinfo").css({
                    "display": "inline-block"
                });

                if (mode == 'add') {
                    $("#pms_room").css({
                        "display": "inline-block"
                    });
                }

                $('#edit_enablehotdesk').click(function(ev) {
                    if (this.checked && !$('#edit_secret').val().match(/^[a-zA-Z0-9]+$/i)) {
                        top.dialog.dialogMessage({
                            type: 'warning',
                            content: top.$.lang("LANG4808"),
                            callback: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        });

                        this.checked = false;
                        return;
                    }
                    change_enablehotdesk('edit_enablehotdesk', 'edit_secret');

                    isEnableWeakPw();

                    ev.stopPropagation();
                });

                $('#edit_alertinfo').bind("change", function(ev) {
                    var value = $('option:selected', this).val();

                    if (value == "custom") {
                        $("#customAlertDiv").removeClass('custom-alert');
                    } else {
                        $("#customAlertDiv").addClass('custom-alert');
                    }

                    ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
                    return false;
                });

                //enable webrtc
                $('.sip_webrtc').removeClass('sip_webrtc');

                /*var oDivEnabledWebrtc = $('#enable_div_webrtc');

                $('#edit_enable_webrtc').on('change', function() {
                    if (this.checked) {
                        oDivEnabledWebrtc.css('display', 'inline-block');
                    } else {
                        oDivEnabledWebrtc.css('display', 'none');
                    }
                });*/
            } else {
                $("#max_contacts_div, #t38_udptl_div").hide();
            }

            $("#faxmode").css("display", "inline-block").find('option[value="gateway"]').remove();
            $("#faxmode div[tooltip='@LANG3555']").attr("tooltip", "@LANG4199");
            bind_codecs_action('codec');

            $("#div_dahdi").hide();
        } else {
            $("#max_contacts_div, #t38_udptl_div").hide();
            $("#div_dahdi").css({
                "display": "inline-block"
            });

            // if (num_pri > 0) {
            //     $("div[tooltip='@LANG3555']").attr("tooltip", "@LANG4199");
            //     $("#edit_faxmode option[value='gateway']").remove();
            // }

            setFXSData();
        }

        if (type !== 'iax') {
            $("#enable_cc").bind("click", function(event) {
                if ((type == 'sip') && $(this).is(':checked')) {
                    $(".cc-mode").css({
                        "display": "inline-block"
                    });

                    if ($("#cc_mode").val() == 'trunk') {
                        $(".cc-max-agents, .cc-max-monitors").css({
                            "display": "inline-block"
                        });
                    }
                } else {
                    $(".cc-mode, .cc-max-agents, .cc-max-monitors").hide();
                }
            });

            $("#cc_mode").bind("change", function(event) {
                if ((type == 'sip') && ($(this).val() == 'trunk')) {
                    $(".cc-max-agents, .cc-max-monitors").css({
                        "display": "inline-block"
                    });
                } else {
                    $(".cc-max-agents, .cc-max-monitors").hide();
                }
            });
        } else {
            $("#ccss").hide();
        }
    }

    $.each(languages, function(key, value) {
        lanOption += "<option value='" + value.language_id + "'>" + value.language_name + "</option>";
    });

    $("#language").append(lanOption);

    if (mohNameList.length == 0) {
        mohNameList = [{
            val: "default"
        }, {
            val: "ringbacktone_default"
        }];
    }

    selectbox.appendOpts({
        el: "edit_mohsuggest",
        opts: mohNameList
    }, doc);

    $("#edit_mohsuggest").val('default');

    $("#edit_extension").val(generateNewExtension());

    changeShowHide($("#enable_out_limitime"), $("#maximum_time"));
    changeShowHide($('#edit_dnd'), $('#strategy_table4_div'));

    if (mode == 'edit') {
        // $("#div_fullname").css({
        //     "display": "inline-block"
        // });

        var action = "action=";

        if (type == "sip") {
            action += "getSIPAccount";
        } else if (type == "iax") {
            action += "getIAXAccount";
        } else if (type == "fxs") {
            action += "getFXSAccount";
        }

        action += "&extension=" + extension;

        getExtensionValue(action, "#add_extension_div");
        // existNumberList = UCMGUI.isExist.getList("getNumberList");
    } else {
        initTimeConditionTable();

        if (type !== 'fxs') {
            $("#edit_secret").val(generatePassword());
            $("#edit_vmsecret").val(generatePassword('number'));
        } else {
            $("#edit_vmsecret").val(generatePassword('number'));
        }

        $("#user_password").val(generatePassword());

        // top.Custom.init(doc);
    }

    enableVQH();
}

function changeShowHide(enableObj, target) {
    enableObj.on("change", function() {
        if (this.checked) {
            target.css('display', 'inline-block');
        } else {
            target.hide();
        }
    });
}

function append_time_value(type) {
    var shour = $('#new_itrl_stime_hour'),
        fhour = $('#new_itrl_ftime_hour');

    shour.children().remove();
    fhour.children().remove();

    for (var i = 0; i < 24; i++) {
        var value = '';

        if (i < 10) {
            value = '0' + i;
        } else {
            value = '' + i;
        }

        shour.append($('<option>').html(value).val(value));
        fhour.append($('<option>').html(value).val(value));
    }

    var sminute = $('#new_itrl_stime_minute'),
        fminute = $('#new_itrl_ftime_minute');

    sminute.children().remove();
    fminute.children().remove();

    for (var i = 0; i < 60; i++) {
        var value = '';

        if (i < 10) {
            value = '0' + i;
        } else {
            value = '' + i;
        }

        sminute.append($('<option>').html(value).val(value));
        fminute.append($('<option>').html(value).val(value));
    }

    if (type == "add") {
        shour[0].selectedIndex = -1;
        fhour[0].selectedIndex = -1;
        sminute[0].selectedIndex = -1;
        fminute[0].selectedIndex = -1;
    }
}

function batchAddExtension() {
    $("#batchAdd_extensions_div").show();

    selectbox.appendOpts({
        el: "batch_mohsuggest",
        opts: mohNameList
    }, doc);

    $("#batch_mohsuggest").val('default');

    $.each(languages, function(key, value) {
        lanOption += "<option value='" + value.language_id + "'>" + value.language_name + "</option>";
    });

    $("#batch_language").append(lanOption);

    if (type) {
        $("#batch_" + type).css({
            "display": "inline-block"
        });

        if (type == "iax") {
            $("#batch_max_contacts_div, #batch_t38_udptl_div, .batch_sip_webrtc").hide();

        } else if (type === 'sip') {
            $("#select_available_codec option[value=opus]").removeClass("hide");
            $("#batch_pms_room, #batch_div_custom_autoanswer").css({
                "display": "inline-block"
            });
            // var oBatchWebrtc = $('#batch_enable_div_webrtc');

            // $('#batch_enable_webrtc').on('change', function() {
            //     if (this.checked) {
            //         oBatchWebrtc.show();
            //     } else {
            //         oBatchWebrtc.hide();
            //     }
            // });
        }
        // if (type == 'sip') {
        //     $("#div_sip_batch_enablehotdesk").css({
        //         "display": "inline-block"
        //     });
        //
        //     $('#batch_enablehotdesk').click(function(ev) {
        //         change_enablehotdesk('batch_enablehotdesk', 'batch_secret');
        //         isEnableWeakPw();
        //
        //         ev.stopPropagation();
        //     });
        // }
    }

    $('#codec_div').appendTo($('#batch_codecs'));

    $('#codec_div').show();

    bind_codecs_action('codec');

    enableCheckBox({
        enableCheckBox: 'batch_enable_qualify',
        enableList: ['batch_qualifyfreq']
    }, doc);
    /*enableCheckBox({
        enableCheckBox: 'batch_active_call',
        enableList: ['batch_hangup', 'batch_callbarge']
    }, doc);*/

    batchVmsecretSecret();

    $("#batch_extension").val(generateNewExtension());

    changeShowHide($("#batch_enable_out_limitime"), $("#batch_maximum_time"));

    top.Custom.init(doc);
}

function batchEditExtension() {
    $("#batchEdit_extensions_div").show();

    selectbox.appendOpts({
        el: "edit_multiple_mohsuggest",
        opts: mohNameList
    }, doc);

    $("#edit_multiple_mohsuggest").val('default');

    $.each(languages, function(key, value) {
        lanOption += "<option value='" + value.language_id + "'>" + value.language_name + "</option>";
    });

    $("#edit_language").append(lanOption);

    if (type) {
        $("#div_multiple_" + type).css({
            "display": "inline-block"
        });

        // if (type == 'sip') {
        //     $("#div_sip_multiple_enablehotdesk").css({
        //         "display": "inline-block"
        //     });
        //     $('#edit_multiple_enablehotdesk').click(function(ev) {
        //         change_enablehotdesk('edit_multiple_enablehotdesk', 'edit_multiple_secret');
        
        //         isEnableWeakPw();
        
        //         ev.stopPropagation();
        //     });
        // }
    }

    $('#codec_div').appendTo($('#multi_codecs'));

    $('#select_available_codec, #edit_allow').attr({
        "disabled": "disabled"
    });

    $('#codec_div').show();

    bind_codecs_action('codec');

    changeShowHide($("#edit_enable_out_limitime"), $("#edit_maximum_time"));

    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_permission',
        enableList: ['edit_multiple_permission']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_hasvoicemail',
        enableList: ['edit_multiple_hasvoicemail']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_secret',
        enableList: ['edit_multiple_seCHoice0', 'edit_multiple_seCHoice1', 'edit_multiple_seCHoice2']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_vmsecret',
        enableList: ['edit_multiple_vmCHoice0', 'edit_multiple_vmCHoice1', 'edit_multiple_vmCHoice2']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_callerNum',
        enableList: ['edit_multiple_callerNum', 'edit_multiple_callerNums', 'edit_multiple_callerNumer']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_ring_timeout',
        enableList: ['edit_multiple_ring_timeout']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_nat',
        enableList: ['edit_multiple_nat']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_directmedia',
        enableList: ['edit_multiple_directmedia']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_dtmfmode',
        enableList: ['edit_multiple_dtmfmode']
    }, doc);
    // enableCheckBox({
    //     enableCheckBox: 'edit_check_multiple_insecure',
    //     enableList: ['edit_multiple_insecure']
    // }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_enable_qualify',
        enableList: ['edit_multiple_enable_qualify']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_qualifyfreq',
        enableList: ['edit_multiple_qualifyfreq']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_maxcallnumbers',
        enableList: ['edit_multiple_maxcallnumbers']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_requirecalltoken',
        enableList: ['edit_multiple_requirecalltoken']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_encryption',
        enableList: ['edit_multiple_encryption']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_fax_mode',
        enableList: ['edit_multiple_fax_mode']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_strategy_ipacl',
        enableList: ['edit_multiple_strategy_ipacl', 'edit_multiple_specific_ip', 'edit_multiple_local_network1', 'edit_multiple_local_network2', 'edit_multiple_local_network3']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_bypass_outrt_auth',
        enableList: ['edit_multiple_bypass_outrt_auth', 'edit_multiple_skip_auth_timetype']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_allow',
        enableList: ['select_available_codec', 'edit_allow']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_auto_record',
        enableList: ['edit_multiple_auto_record']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_enablehotdesk',
        enableList: ['edit_multiple_enablehotdesk']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_skip_vmsecret',
        enableList: ['edit_multiple_skip_vmsecret']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_mohsuggest',
        enableList: ['edit_multiple_mohsuggest']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_tel_uri',
        enableList: ['edit_multiple_tel_uri']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_multiple_check_out_of_service',
        enableList: ['edit_multiple_out_of_service']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_multiple_check_enable_ldap',
        enableList: ['edit_multiple_enable_ldap']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_max_contacts',
        enableList: ['edit_multiple_max_contacts']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_leftRightSelect',
        enableList: ['batch_edit_leftSelect', 'batch_edit_rightSelect']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_seamless_check_leftRightSelect',
        enableList: ['seamless_batch_edit_leftSelect', 'seamless_batch_edit_rightSelect']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_enable_out_limitime',
        enableList: ['edit_enable_out_limitime', 'edit_maximumTime']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_language',
        enableList: ['edit_language']
    }, doc);
    /*enableCheckBox({
        enableCheckBox: 'edit_check_multiple_extension_status',
        enableList: ['edit_multiple_extension_status']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_check_multiple_active_call',
        enableList: ['edit_multiple_active_call']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_multiple_active_call',
        enableList: ['edit_multiple_hangup', 'edit_multiple_callbarge']
    }, doc);*/

    batchVmsecretSecret();

    batchEnableWebrtc();

    batchSelDisable();

    top.Custom.init(doc);
}

function batchSelDisable() {
    var bargeSel = $('#batch_edit_allToRight, #batch_edit_oneToRight, #batch_edit_oneToLeft, #batch_edit_allToLeft'),
        seamlessSel = $('#seamless_batch_edit_allToRight, #seamless_batch_edit_oneToRight, #seamless_batch_edit_oneToLeft, #seamless_batch_edit_allToLeft');

    $('#edit_check_leftRightSelect').on('change', function() {
        if (this.checked) {
            bargeSel.removeClass('disabled');
        } else {
            bargeSel.addClass('disabled');
        }
    });

    $('#edit_seamless_check_leftRightSelect').on('change', function() {
        if (this.checked) {
            seamlessSel.removeClass('disabled');
        } else {
            seamlessSel.addClass('disabled');
        }
    });
}

function batchEnableWebrtc() {
    if (type === 'sip') {
        $("#select_available_codec option[value=opus]").removeClass("hide");
        //var oBatchEditWebrtc = $('#batchEdit_enable_div_webrtc');

        $('.batch_edit_sip_webrtc').removeClass('batch_edit_sip_webrtc');

        enableCheckBox({
            enableCheckBox: 'edit_multiple_check_enable_webrtc',
            enableList: ['edit_multiple_enable_webrtc']
        }, doc);

        /*$('#edit_multiple_enable_webrtc').on('change', function() {
            if (this.checked) {
                oBatchEditWebrtc.show();
            } else {
                oBatchEditWebrtc.hide();
            }
        });*/
    }
}

function batchVmsecretSecret() {
    if (mode == 'batchEdit') {
        $(".editseenable").bind("click", function(ev) {
            editseenable();
            ev.stopPropagation();
        });
        $(".editvmenable").bind("click", function(ev) {
            editvmenable();
            ev.stopPropagation();
        });
        $(".editCallerNumenable").bind("click", function(ev) {
            editCallerNumenable();
            ev.stopPropagation();
        });
    } else if (mode == 'batchAdd') {
        $(".password_change").bind("click", function(ev) {
            passwordChange();
            ev.stopPropagation();
        });
    }
}

function bigNumAdd(a) {
    if (!a) {
        a = "0";
    }

    var m = a.split('').reverse(),
        ret = [],
        s = 0,
        flag = 1,
        t;

    for (var i = 0; i < a.length; i++) {
        t = Number(m[i]) + flag;

        if (t > 9) {
            flag = 1;
        } else {
            flag = 0;
        }

        ret.push(t % 10);
    }

    if (flag) {
        ret.push(1);
    }

    return ret.reverse().join('');
}

function bigNumDelete(a) {
    if (!a) {
        a = "0";
    }

    var m = a.split('').reverse(),
        ret = [],
        s = 0,
        flag = 1,
        t;

    for (var i = 0; i < a.length; i++) {
        t = Number(m[i]) - flag;

        if (t < 0) {
            flag = 1;
        } else {
            flag = 0;
        }

        ret.push((t + 10) % 10);
    }

    return ret.reverse().join('').replace(/0*(\d+)/, "$1");
}

function bind_codecs_action(id) {
    if (type !== 'fxs') {
        $('#button_add_' + id).bind('click', function() {
            if (!$('#select_available_' + id)[0].value || $('#edit_allow')[0].disabled) {
                return;
            }

            $(':selected', '#select_available_' + id).each(function(idx, item) {
                var text = $(item).clone();

                $(item).remove();

                $('#edit_allow').append(text);
            });

            $P("#edit_allow", document).valid();
        });

        $('#button_remove_' + id).bind('click', function() {
            if (!$('#edit_allow')[0].value || $('#edit_allow')[0].disabled) {
                return;
            }

            $(':selected', '#edit_allow').each(function(idx, item) {
                var text = $(item).clone();

                $(item).remove();

                $('#select_available_' + id).append(text);
            });

            $P("#edit_allow", document).valid();
        });

        $('#button_removeall_' + id).bind('click', function() {
            if ($('#edit_allow')[0].disabled) {
                return;
            }

            $("#edit_allow").children().each(function(idx, item) {
                var text = $(item).clone();

                $(item).remove();

                $('#select_available_' + id).append(text);
            });

            $P("#edit_allow", document).valid();
        });

        $('#button_addall_' + id).bind('click', function() {
            if ($('#edit_allow')[0].disabled) {
                return;
            }

            // modified to do not override former order in selected box, just append it
            $('#select_available_' + id).children().each(function(idx, item) {
                var text = $(item).clone();

                $(item).remove();

                $('#edit_allow').append(text);
            });

            $P("#edit_allow", document).valid();
        });

        /*
         * Pengcheng Zou Added. Support Double Click Event.
         */
        $('#edit_allow').delegate('option', 'dblclick', function(event) {
            if (!$('#edit_allow')[0].value || $('#edit_allow')[0].disabled) {
                return;
            }

            var node = $(this).clone();

            $(this).remove();

            $('#select_available_' + id).append(node);

            $P("#edit_allow", document).valid();
        });

        $('#select_available_' + id).delegate('option', 'dblclick', function(event) {
            if (!$('#select_available_' + id)[0].value || $('#edit_allow')[0].disabled) {
                return;
            }

            var node = $(this).clone();

            $(this).remove();

            $('#edit_allow').append(node);

            $P("#edit_allow", document).valid();
        });
        // -------- End --------

        // bind up/down/top/bottom button
        $('#button_up').bind('click', function() {
            var op = $('#edit_allow option:selected');

            if (op.length) {
                op.first().prev().before(op);
            }
        });

        $('#button_down').bind('click', function() {
            var op = $('#edit_allow option:selected');

            if (op.length) {
                op.last().next().after(op);
            }
        });

        $('#button_top').bind('click', function() {
            var op = $('#edit_allow option:selected'),
                all = $('#edit_allow option');

            if (op.length) {
                if (all.first()[0] === op.first()[0]) {
                    return;
                }

                all.first().before(op);

                $('#edit_allow').scrollTop(0);
            }
        });

        $('#button_bottom').bind('click', function() {
            var op = $('#edit_allow option:selected'),
                all = $('#edit_allow option');

            if (op.length) {
                if (all.last()[0] === op.last()[0]) {
                    return;
                }

                all.last().after(op);

                var selects = $('#edit_allow');

                selects.scrollTop(selects[0].scrollHeight);
            }
        });
    }
}

function bindTimeConditionEvent() {
    $('#mode').bind("click", function(ev) {
        if ($(this).is(':checked')) {
            $('.local_month').show();
            $('.local_day').show();
            $('#new_itrl_day_container').show();
        } else {
            $('.local_month').hide();
            $('.local_day').hide();
            $('#new_itrl_day_container').hide();
        }

        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";
        top.dialog.repositionDialog();
    });

    // init days
    var day_container = doc.getElementById('new_itrl_day_container'),
        tbl = doc.createElement('table'),
        addCell = UCMGUI.domFunction.tr_addCell;

    var days_add = function(table, length) {
        var addCell = UCMGUI.domFunction.tr_addCell;

        for (var i = 0; i < length; i++) {
            if ((i % 7) == 0) {
                var newRow = table.insertRow(-1);

                $(newRow).css('background', '#CAECFF');
            }

            // var cell = "<input type='checkbox' id='new_itrl_day_" + i + "' value='" + i + "'>" + i;
            var cell = i + 1;

            addCell(newRow, {
                html: cell,
                className: 'day_unselected',
                title: $P.lang('LANG563'),
                localeTitle: 'LANG563',
                id: 'day_' + (i + 1)
            });
        }
    };

    days_add(tbl, 31);
    day_container.appendChild(tbl);

    $('#new_itrl_day_container').delegate('td', 'mousedown', function(ev) {
        var $this = $(this);

        if (datactol.clicked === false) {
            datactol.clicked = $this;
        }

        // if (datactol.clicked == true)

        if ($(this).hasClass('day_selected')) {
            $this.removeClass('day_selected');
            $this.addClass('day_unselected');
        } else {
            $this.removeClass('day_unselected');
            $this.addClass('day_selected');
        }

        // this.className = 'day_selected';
        // $('#new_itrl_day_container').delegate('td', 'mouseenter', dayMouseEnter);

        $('#new_itrl_day_container').delegate('td', 'mouseover', dayMouseEnter);
        $('#new_itrl_day_container').css('cursor', 'col-resize');

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $(doc).on('mouseup', function(ev) {
        if (datactol.clicked) {
            datactol.clicked = false;

            $('.day_selected_pending').attr('class', 'day_selected');
            $('.day_unselected_pending').attr('class', 'day_unselected');

            $('#new_itrl_day_container').undelegate('td', 'mouseover', dayMouseEnter);
            $('#new_itrl_day_container').css('cursor', 'auto');

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        }
    });

    var week_all = $('#new_itrl_week_all'),
        month_all = $('#new_itrl_month_all'),
        chk_week = $(".chk_week"),
        chk_month = $(".chk_month");

    week_all.bind("click", function(ev) {
        var week_chkbox_all = function(value) {
            var children = $('#new_itrl_week_container').children().find("input");

            for (var i = 0; i < children.length; i++) {
                if (children[i].type == 'checkbox') {
                    children[i].checked = value;
                }

                if (value) {
                    $(children[i]).prev().css("backgroundPosition", "0px -50px");
                } else {
                    $(children[i]).prev().css("backgroundPosition", "0px 0px");
                }
            }
        };

        var all = $('#new_itrl_week_all')[0];

        if (all.checked) {
            week_chkbox_all(true);
        } else {
            week_chkbox_all(false);
        }
    });

    month_all.bind("click", function(ev) {
        var month_chkbox_all = function(value) {
            var children = $('#new_itrl_month_container').children().find("input");

            for (var i = 0; i < children.length; i++) {
                if (children[i].type == 'checkbox') {
                    children[i].checked = value;
                }

                if (value) {
                    $(children[i]).prev().css("backgroundPosition", "0px -50px");
                } else {
                    $(children[i]).prev().css("backgroundPosition", "0px 0px");
                }
            }
        };

        var all = $('#new_itrl_month_all')[0];

        if (all.checked) {
            month_chkbox_all(true);
        } else {
            month_chkbox_all(false);
        }
    });

    chk_week.bind("click", function(ev) {
        if (chk_week.filter(":checked").length != chk_week.length) {
            week_all[0].checked = false;
            week_all.prev().css("backgroundPosition", "0px 0px");
        } else {
            week_all[0].checked = true;
            week_all.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });

    chk_month.bind("click", function(ev) {
        if (chk_month.filter(":checked").length != chk_month.length) {
            month_all[0].checked = false;
            month_all.prev().css("backgroundPosition", "0px 0px");
        } else {
            month_all[0].checked = true;
            month_all.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });
}

function change_enablehotdesk(hotdesk, secret) {
    if ($("#" + hotdesk)[0].checked) {
        var new_rule = {
            required: true,
            realAlphanumeric: true,
            minlength: 4
        };

        $('#edit_authid').val(extension);

        $P('#' + secret, document).rules("remove");

        $P('#' + secret, document).rules("add", new_rule);
    } else {
        var new_rule = {
            required: true,
            keyboradNoSpacesemicolon: true,
            minlength: 4
        };

        $P('#' + secret, document).rules("remove");

        $P('#' + secret, document).rules("add", new_rule);
    }
}

function check_network(val, ele) {
    var regSubnet = /^((1\d\d|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){3}0$/;
    var regIpv6 = /^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))(\/\d+)$/; //test ipv6
    
    if (val && (regSubnet.test(val) || regIpv6.test(val))) {
        return true;
    }

    return false;
}

function checkNum(val, ele) {
    var regIpv6 = /^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?(\/\d+)$/; //test ipv6

    if( val && regIpv6.test(val)) {
        var arr = val.split("/");
        var num = arr[1];
        if (num && parseInt(num) > 128) {
            return false;
        } else {
            return true;
        }
    }
    return true;
}
function check_timecondition_tips() {
    var hasOfficeTime = (mWindow.officeTimeList.length > 0),
        hasHoliday = (mWindow.holidayList.length > 0),
        text = '';

    if (!hasOfficeTime && !hasHoliday) {
        text = generateTimeConditionTips('all');
    } else if (!hasOfficeTime) {
        text = generateTimeConditionTips('officeTime');
    } else if (!hasHoliday) {
        text = generateTimeConditionTips('holiday');
    }

    if (text) {
        $('.timecondition-tips').html(text).css({
            'display': 'block'
        });
    }
}

function check_video_codec() {
    var list = ["ulaw", "alaw", "gsm", "g726", "g726aal2", "ilbc", "g722", "adpcm", "g729", "g723", "opus"],
        res = false,
        valuelist = [],
        el = $('#edit_allow')[0],
        length = el.options.length;

    // get an array of all option values in a select box
    for (var x = 0; x < length; x++) {
        if (el.options[x].value.trim()) {
            valuelist.push(el.options[x].value);
        }
    }

    valuelist.each(function(value) {
        if (res == true) {
            return res;
        }

        list.each(function(codec) {
            if (value == codec)
                res = true;
            return res;
        });
    });

    return res;
}

function check_max_users() {
    if (maxExtension < existExtentionList.length + Number($("#batch_number").val())) {
        return false;
    } else {
        return true;
    }

    return true;
}

function check_range() {
    if (extensionRange[2] == 'no') {
        var startFrom = Number($("#batch_extension").val()),
            largeOrEqualThanStartNumber = 0,
            maxExtensionNumber = extensionRange[1],
            length = existExtentionList.length,
            i = 0;

        for (i; i < length; i++) {
            if (existExtentionList[i] >= startFrom) {
                largeOrEqualThanStartNumber++;
            }
        }

        if ((Number($("#batch_number").val()) + largeOrEqualThanStartNumber) > (maxExtensionNumber - startFrom + 1)) {
            return false;
        }
    }

    return true;
}

function checkExtensionName(val, ele) {
    var existed = true;

    if (mode == 'edit') {
        if (val == extension) {
            existed = true;
        } else {
            if (ifExisted(val, existNumberList)) {
                existed = false;
            } else {
                existed = true;
            }
        }
    } else if (mode == 'add') {
        if (ifExisted(val, existNumberList)) {
            existed = false;
        } else {
            existed = true;
        }
    }

    return existed;
}

function checkIfInPort(val, ele) {
    var existed = true;

    if (ifExisted(val, portExtensionList)) {
        existed = false;
    } else {
        existed = true;
    }

    return existed;
}

function changeShow() {
    var flag = 0;

    if (mode == 'add' || mode == 'edit') {
        if ($("#edit_strategy_ipacl")[0].selectedIndex == 1) {
            $("#local_networks").show();
            flag = 1;
        } else {
            $("#local_networks").hide();
        }

        if ($("#edit_strategy_ipacl")[0].selectedIndex == 2) {
            $("#allow_a_ip").show();
            flag = 1;
        } else {
            $("#allow_a_ip").hide();
        }
    }

    if (mode == 'batchEdit') {
        if ($("#edit_multiple_strategy_ipacl")[0].selectedIndex == 1) {
            $("#multiple_local_networks").show();
            flag = 1;
        } else {
            $("#multiple_local_networks").hide();
        }

        if ($("#edit_multiple_strategy_ipacl")[0].selectedIndex == 2) {
            $("#multiple_allow_a_ip").show();
            flag = 1;
        } else {
            $("#multiple_allow_a_ip").hide();
        }
    }

    if (mode == 'batchAdd') {
        if ($("#batch_strategy_ipacl")[0].selectedIndex == 1) {
            $("#batch_local_networks").show();
            flag = 1;
        } else {
            $("#batch_local_networks").hide();
        }

        if ($("#batch_strategy_ipacl")[0].selectedIndex == 2) {
            $("#batch_allow_a_ip").show();
            flag = 1;
        } else {
            $("#batch_allow_a_ip").hide();
        }
    }

    if (window.frameElement) {
        $(window.frameElement).css("height", "0px");
        $(window.frameElement).css("width", "0px");
    }

    top.dialog.currentDialogType = "iframe";

    if (flag == 1) {
        top.dialog.repositionDialog();
        flag = 0;
    } else {
        top.dialog.repositionDialog("none");
    }
}

function check_days_required() {
    if (!$('.day_selected').length) {
        var target = $('#day_1');

        if (datactol.timeout) {
            clearTimeout(datactol.timeout);
        }

        target.attr("titles", $P.lang("LANG3531").format('1', $P.lang('LANG242').toLowerCase())).addClass("ui-state-highlight").trigger("focusin");

        datactol.timeout = setTimeout(function() {
            target.removeAttr("titles").removeClass("ui-state-highlight").trigger("focusout");
        }, 2000);

        return false;
    }

    return true;
}

function check_month_required(element, value) {
    if ($('.chk_month:checked').length) {
        return true;
    }

    return false;
}

function check_week_required(element, value) {
    if ($('.chk_week:checked').length) {
        return true;
    }

    return false;
}

function check_time(value, element) {
    var stime_hour = parseInt($('#new_itrl_stime_hour').val() || -1, 10),
        stime_min = parseInt($('#new_itrl_stime_minute').val() || -1, 10),
        ftime_hour = parseInt($('#new_itrl_ftime_hour').val() || -1, 10),
        ftime_min = parseInt($('#new_itrl_ftime_minute').val() || -1, 10);

    if (stime_hour == -1 && stime_min == -1 && ftime_hour == -1 && ftime_min == -1) {
        return true;
    }

    if (stime_hour > -1 && stime_min > -1 && ftime_hour > -1 && ftime_min > -1 && stime_hour * 60 + stime_min < ftime_hour * 60 + ftime_min) {
        return true;
    }

    return false;
}

function getGenaral() {
    $.ajax({
        type: "GET",
        url: "../cgi",
        data: {
            action: "getGeneralPrefSettings"
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                oGeneral = data.response.general_pref_settings;
            }
        }
    });
}

function checkTimeLarger(val, ele) {
    var maximumTime = parseInt(val, 10) * 1000,
        warningtime = parseInt(oGeneral.warningtime, 10),
        repeattime = parseInt(oGeneral.repeattime, 10);

    if (!isNaN(warningtime)) {
        if (!isNaN(repeattime)) {
            if (maximumTime > warningtime && warningtime > repeattime) {
                return true;
            }
        } else if (maximumTime > warningtime) {
            return true;
        }
    } else {
        if (isNaN(repeattime)) {
            return true;
        } else if (maximumTime > repeattime) {
            return true;
        }
    }

    return false;
}

function createDay(cellvalue) {
    if (cellvalue == '*') {
        return '<div locale="LANG257">' + $P.lang("LANG257") + '</div>';
    } else {
        return cellvalue.replace(/&/g, ',');
    }
}

function createMonth(cellvalue) {
    if (cellvalue == '*') {
        return '<div locale="LANG257">' + $P.lang("LANG257") + '</div>';
    } else {
        return ReturnMonth(cellvalue);
    }
}

function createWeek(cellvalue) {
    if (cellvalue == '*') {
        return '<div locale="LANG257">' + $P.lang("LANG257") + '</div>';
    } else {
        return ReturnWeek(cellvalue);
    }
}

function dayMouseEnter(ev) {
    if (datactol.clicked === false) {
        return;
    }

    var clickedElement = $(datactol.clicked),
        clickedDay = parseInt(clickedElement.attr('id').afterChar('_'), 10),
        mouseDay = parseInt(this.id.afterChar('_'), 10),
        newClass = clickedElement.hasClass('day_selected') ? 'day_selected_pending' : 'day_unselected_pending';

    var start = (clickedDay < mouseDay) ? clickedDay : mouseDay,
        end = (clickedDay > mouseDay) ? clickedDay : mouseDay;

    $('.day_selected_pending').removeClass('day_selected_pending');
    $('.day_unselected_pending').removeClass('day_unselected_pending');

    for (var i = start; i <= end; i++) {
        $('#day_' + i).addClass(newClass);
    }

    return false;
}

function editvmenable(tmp) {
    if ($("#edit_check_multiple_vmsecret")[0].checked && $('#edit_multiple_vmCHoice1')[0].checked) {
        $("#edit_multiple_vmsecret")[0].disabled = false;
    } else {
        $("#edit_multiple_vmsecret")[0].disabled = true;
    }
}

function editCallerNumenable(tmp) {
    if ($("#edit_check_multiple_callerNum")[0].checked && $('#edit_multiple_callerNums')[0].checked) {
        $("#edit_multiple_callerNumer")[0].disabled = false;
    } else {
        $("#edit_multiple_callerNumer")[0].disabled = true;
    }
}

function editseenable(tmp) {
    if ($("#edit_check_multiple_secret")[0].checked && $('#edit_multiple_seCHoice1')[0].checked) {
        $("#edit_multiple_secret")[0].disabled = false;
    } else {
        $("#edit_multiple_secret")[0].disabled = true;
    }
}

// enable Voicemail Qualify Hotdesk
function enableVQH() {
    enableCheckBox({
        enableCheckBox: 'edit_hasvoicemail',
        enableList: ['edit_vmsecret', 'edit_skip_vmsecret']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_enable_qualify',
        enableList: ['edit_qualifyfreq']
    }, doc);
    disableCheckBox({
        enableCheckBox: 'edit_enablehotdesk',
        enableList: ['edit_authid']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_en_ringboth',
        enableList: ['edit_external_number', 'edit_ringboth_timetype']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_en_hotline',
        enableList: ['edit_hotline_number', 'edit_hotline_type']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_dnd',
        enableList: ['edit_dnd_timetype']
    }, doc);
    /*enableCheckBox({
        enableCheckBox: 'edit_active_call',
        enableList: ['edit_hangup', 'edit_callbarge']
    }, doc);*/
}

function fxs_in_use(val, ele) {
    var port = $('#edit_dahdi')[0].value;

    if (mode == 'edit') {
        if (port == currentPort) {
            return true;
        } else {
            if (ifExisted(port, existFXSList)) {
                return false;
            } else {
                return true;
            }
        }
    } else {
        if (ifExisted(port, existFXSList)) {
            return false;
        } else {
            return true;
        }
    }
}

function generateNewExtension() {

    var startExt = extensionRange[0],
        endExt = extensionRange[1],
        i = startExt;

    for (i; i <= endExt; i++) {
        if (i < 10) {
            i = "0" + i;
        }
        if (!ifExisted(i, existNumberList)) {
            return i;
        }
    }
}

function generatePassword(type, length) {
    if (extensionRange[3].toLowerCase() == "yes") { // Strong Password
        var chars = '',
            pw = '',
            strLength = (length ? length : Math.floor((Math.random() * 3) + 6));

        switch (type) {
            case 'number':
                chars += '3745890162';
                break;
            case 'char':
                chars += 'ZmnopqrMDEFGabcdefgABCXYRSstuvwxyzhijklHIJKLTUVWNOPQ';
                break;
            case 'special':
                chars += '~!@#$%^*';
                break;
            default:
                chars += '^*VW01234XYZabcdefghijklmnoABCNOHIJKLMp$%PQRSTz56qrstuvwxy9~!@#78UDEFG';
                break;
        }

        chars = chars.split('');

        for (var i = 0; i < strLength; i++) {
            pw += chars[Math.floor(Math.random() * chars.length)];
        }

        // Pengcheng Zou Added. Check if has number.
        if (!/\d/g.test(pw)) {
            pw = pw.substr(1); // length - 1
            pw += generatePassword('number', 1);
        }

        return pw;
    } else {
        return $("#edit_extension").val();
    }
}

function getBatchUsers() {
    var startExt = $("#batch_extension").val(),
        addNumber = parseInt($("#batch_number").val()),
        batchInterval = parseInt($("#batch_interval").val()),
        batchAddExtList = [];

    while (addNumber) {
        if (ifExisted(startExt, existNumberList)) {
            startExt = bigNumAdd(startExt);
            continue;
        }

        batchAddExtList.push(startExt);

        startExt = parseInt(bigNumAdd(startExt)) + (batchInterval - 1) + "";

        addNumber--;
    }

    return batchAddExtList;
}

function getDomStr() {
    var domStr = "",
        dom = $("#edit_secret, #edit_authid, #first_name, #last_name, #user_password, #email, #phone_number");

    dom.each(function() {
        if (this.type == 'checkbox') {
            domStr += (this.checked ? "yes" : "no");
        } else {
            domStr += this.value;
        }
    });

    return domStr;
}

function getExtensionValue(action, doc) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
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
                var accoutObj = {},
                    ctiObj = {};

                ctiObj = data.response.cti_feature_privilege;

                accoutObj = data.response.extension;

                privilegeInfo = data.response.privilege_info;

                if (accoutObj) {
                    // var data = data.response.extension;

                    for (var item in accoutObj) {
                        var element = $("#edit_" + item, doc),
                            itemValue = accoutObj[item];

                        if (item == 'allow') {
                            setAllowData(itemValue);
                        } else if (item.beginsWith('local_network')) {
                            if (item === 'local_network1') {
                                $('#edit_local_network1').val(itemValue);
                            }

                            if (element.length == 0 && itemValue) {
                                addRowLikeDomain(document, {
                                    "tableId": "strategy_table1",
                                    "rowNamePrefix": "local_network",
                                    "rowIdPrefix": "edit_local_network",
                                    "startWith1": true,
                                    "maxRow": maxRowOfLocalNet,
                                    "value": itemValue,
                                    "validRules": {
                                        customCallback: [$P.lang("LANG2131"), check_network],
                                        customCallback1: [$P.lang("LANG5247"), checkNum]
                                    }
                                });
                            }
                        } else if (item == 'ring_timeout' || item == 'maxcallnumbers') {
                            element.val(itemValue === 0 ? "" : itemValue);
                        } else if (item == 'vmsecret') {
                            element.val(itemValue === '-' ? "" : itemValue);
                        } else if (item === 'limitime') {
                            var outLimitime = (itemValue ? itemValue : ""),
                                enableOutLimitime = $("#enable_out_limitime"),
                                outLimitimeDiv = $("#maximum_time");
                                //outLimitimeArr = outLimitime.match(/\d+/g);

                            if (outLimitime !== '') {
                                outLimitimeDiv.css('display', 'inline-block');

                                enableOutLimitime[0].checked = true;

                                $("#maximumTime").val(outLimitime / 1000);
                            } else {
                                outLimitimeDiv.hide();
                            }
                        } else if (item === 'dndwhitelist' && itemValue !== null) {
                            var whitelistnum_array = itemValue.split(',');

                            if (whitelistnum_array.length >= 1) {
                                $('#edit_whitelist1').val(whitelistnum_array[0]);
                            }

                            if (whitelistnum_array.length > 1) {
                                for (var i = 1; i < whitelistnum_array.length; i++) {
                                    addRowLikeDomain(document, {
                                    "tableId": "strategy_table4",
                                    "rowNamePrefix": "edit_whitelist",
                                    "rowIdPrefix": "edit_whitelist",
                                    "startWith1": true,
                                    "maxRow": maxRowOfLocalNet,
                                    "value": whitelistnum_array[i],
                                    "validRules": {
                                        phoneNumberOrExtension: true,
                                        customCallback: [$P.lang("LANG5211"), checkWhitelistOnly]
                                    }
                                });
                                }
                            }
                        } else {
                            if (element.attr('type') == 'checkbox') {
                                element[0].checked = (itemValue == 'yes' ? true : false);
                            } else {
                                if (item == "hotline_type" && itemValue == 0) {
                                    element.val(1);
                                }
                                else if ((item !== 'cc_max_agents') && (item !== 'cc_max_monitors')) {
                                    element.val(itemValue);
                                }
                            }
                        }
                    }

                    $('#edit_extension').val(extension);

                    var accountList = mWindow.existExtentionList,
                        tmpGroupExt = [],
                        membersArr = accoutObj.callbarging_monitor ? accoutObj.callbarging_monitor.split(",") : [],
                        seamless_tmpGroupExt = [],
                        seamless_membersArr = accoutObj.seamless_transfer_members ? accoutObj.seamless_transfer_members.split(",") : [];

                    tmpGroupExt = Array.prototype.copy.call(accountList, tmpGroupExt);
                    membersArr.remove(extension);
                    tmpGroupExt.remove(membersArr);
                    tmpGroupExt.remove(extension);

                    seamless_tmpGroupExt = Array.prototype.copy.call(accountList, seamless_tmpGroupExt);
                    seamless_membersArr.remove(extension);
                    seamless_tmpGroupExt.remove(seamless_membersArr);
                    seamless_tmpGroupExt.remove(extension);

                    var rightGroupExt = transExtensionData(membersArr),
                        leftGroupExt = transExtensionData(tmpGroupExt);

                    selectbox.appendOpts({
                        el: "leftSelect",
                        opts: leftGroupExt
                    }, document);

                    selectbox.appendOpts({
                        el: "rightSelect",
                        opts: rightGroupExt
                    }, document);

                    var seamless_rightGroupExt = transExtensionData(seamless_membersArr),
                        seamless_leftGroupExt = transExtensionData(seamless_tmpGroupExt);

                    selectbox.appendOpts({
                        el: "seamless_leftSelect",
                        opts: seamless_leftGroupExt
                    }, document);

                    selectbox.appendOpts({
                        el: "seamless_rightSelect",
                        opts: seamless_rightGroupExt
                    }, document);

                    if (accoutObj['dahdi']) {
                        currentPort = accoutObj['dahdi'];
                    }

                    var faxdetect = accoutObj['faxdetect'];
                    var faxGateway = accoutObj['fax_gateway'];

                    if (faxdetect === 'no' && faxGateway !== 'yes') {
                        $('#edit_faxmode').val('no');
                    } else if (faxdetect === 'yes') {
                        $('#edit_faxmode').val('detect');
                    } else if (faxGateway === 'yes') {
                        $('#edit_faxmode').val('gateway');
                    }

                    if (type == 'fxs') {
                        if (accoutObj['cc_agent_policy'] && accoutObj['cc_agent_policy'] == 'generic') {
                            $('#enable_cc')[0].checked = true;
                        }
                    } else if (type == 'sip') {
                        //get webrtc data
                        //$('#edit_enable_webrtc').trigger('change');

                        if (accoutObj['cc_agent_policy'] && accoutObj['cc_agent_policy'] == 'generic') {
                            $('#enable_cc')[0].checked = true;

                            $('.cc-mode').css('display', "inline-block");

                            $('#cc_mode').val('normal');
                        } else if (accoutObj['cc_agent_policy'] && accoutObj['cc_agent_policy'] == 'native') {
                            $('#enable_cc')[0].checked = true;

                            $('.cc-mode').css('display', "inline-block");

                            $('#cc_mode').val('trunk').trigger('change');

                            $('#edit_cc_max_agents').val(accoutObj['cc_max_agents']);
                            $('#edit_cc_max_monitors').val(accoutObj['cc_max_monitors']);
                        }

                        var alertInfo = (accoutObj.alertinfo ? accoutObj.alertinfo : "");

                        if (alertInfo.indexOf('custom_') > -1) {
                            $("#edit_alertinfo").val('custom').trigger('change');

                            $("#edit_custom_alert_info").val(alertInfo.slice(7));
                        }
                    }

                    $("#edit_extension")[0].disabled = true;
                    $('#edit_vmsecret')[0].disabled = !$('#edit_hasvoicemail')[0].checked;
                    $('#edit_skip_vmsecret')[0].disabled = !$('#edit_hasvoicemail')[0].checked;
                    $('#edit_qualifyfreq')[0].disabled = !$('#edit_enable_qualify')[0].checked;
                    $('#edit_authid')[0].disabled = $('#edit_enablehotdesk')[0].checked;
                    $('#edit_external_number')[0].disabled = !$('#edit_en_ringboth')[0].checked;
                    $('#edit_ringboth_timetype')[0].disabled = !$('#edit_en_ringboth')[0].checked;
                    $('#edit_hotline_number')[0].disabled = !$('#edit_en_hotline')[0].checked;
                    $('#edit_hotline_type')[0].disabled = !$('#edit_en_hotline')[0].checked;
                    $('#edit_dnd_timetype')[0].disabled = !$('#edit_dnd')[0].checked;

                    $('#edit_dnd').trigger('change');

                    change_enablehotdesk('edit_enablehotdesk', 'edit_secret');

                    isEnableWeakPw();

                    changeShow();

                    if (!$.isEmptyObject(privilegeInfo)) {
                        updateDocumentException(accoutObj, document, privilegeInfo, {
                            before: "edit_"
                        });
                    }
                }

                /*if (ctiObj) {
                    for (var i in ctiObj) {
                        $('#edit_' + i)[0].checked = ctiObj[i] === 'yes';
                    }

                    $('#edit_hangup')[0].disabled = $('#edit_callbarge')[0].disabled = !$('#edit_active_call')[0].checked;
                }*/
            }
        }
    });

    if (mode == "edit") {
        $.ajax({
            type: "post",
            url: "../cgi",
            data: {
                "action": "getUser",
                "user_name": extension
            },
            async: false,
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
                    if (data.response.user_name && data.response.user_name != {}) {
                        var userInfo = data.response.user_name;

                        userPrivilegeInfo = data.response.privilege_info;

                        $('#first_name').val(userInfo.first_name);
                        $('#last_name').val(userInfo.last_name);
                        $('#email').val(userInfo.email);
                        $('#language').val(userInfo.language);
                        $('#user_password').val(userInfo.user_password);
                        $('#phone_number').val(userInfo.phone_number);

                        userID = userInfo.user_id;

                        if (!$.isEmptyObject(userPrivilegeInfo)) {
                            updateDocumentException(userInfo, document, userPrivilegeInfo);
                        }
                    }
                }
            }
        });

        $.ajax({
            type: "post",
            url: "../cgi",
            data: {
                "action": "listTimeConditionOfficeTime",
                "user_id": userID,
                "sidx": "condition_index",
                "sord": "asc"
            },
            async: false,
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
                    var time_condition = data.response.time_conditions_officetime,
                        translateTime = time_condition.sortBy('condition_index'),
                        ary = [];

                    if (time_condition.length == 0) {
                        isEmptyTimeCondition = true;
                    }

                    for (var i = 0; i < translateTime.length; i++) {
                        var obj = translateTime[i];

                        obj.start_hour = addZero(obj.start_hour);
                        obj.start_min = addZero(obj.start_min);
                        obj.end_hour = addZero(obj.end_hour);
                        obj.end_min = addZero(obj.end_min);

                        var stime_hour = obj.start_hour,
                            stime_minute = obj.start_min,
                            ftime_hour = obj.end_hour,
                            ftime_minute = obj.end_min;

                        if (stime_hour == "" && stime_minute == "" &&
                            ftime_hour == "" && ftime_minute == "") {

                            obj.time = "00:00-23:59";
                        } else {
                            obj.time = stime_hour + ':' + stime_minute + '-' +
                                ftime_hour + ':' + ftime_minute;
                        }

                        ary.push(obj);
                    }

                    OrderTable.lists = ary;

                    initTimeConditionTable();

                    top.dialog.repositionDialog();
                }
            }
        });

        oldDom = getDomStr();
    }


    top.Custom.init(document);
}

function getIndexName() {
    var length = 1000000,
        orderTableListsLength = OrderTable.lists.length,
        i = 0,
        j;

    for (i; i < length; i++) {

        var exist = false;

        for (j = 0; j < orderTableListsLength; j++) {
            if (i == OrderTable.lists[j]['condition_index']) {
                exist = true;
                break;
            }
        }

        if (!exist) {
            break;
        }
    }

    return i;
}

function initTimeConditionTable() {
    OrderTable.table_id = 'table_timecondition';
    OrderTable.max_failover = maxTimeCondition;
    OrderTable.refresh_timecondition();
    OrderTable.bind_event();
}

function generateTimeConditionTips(type) {
    var text = '';

    if (type == 'all') {
        text = $P.lang('LANG4218').format(
            $P.lang('LANG3271').toLowerCase(),
            $P.lang('LANG3266').toLowerCase(),
            $P.lang('LANG47'),
            $P.lang('LANG718'),
            $P.lang('LANG3271').toLowerCase(),
            $P.lang('LANG3266').toLowerCase());
    } else if (type == 'officeTime') {
        text = $P.lang('LANG4217').format(
            $P.lang('LANG3271').toLowerCase(),
            $P.lang('LANG47'),
            $P.lang('LANG718'),
            $P.lang('LANG3271'),
            $P.lang('LANG3271').toLowerCase());
    } else if (type == 'holiday') {
        text = $P.lang('LANG4217').format(
            $P.lang('LANG3266').toLowerCase(),
            $P.lang('LANG47'),
            $P.lang('LANG718'),
            $P.lang('LANG3266'),
            $P.lang('LANG3266').toLowerCase());
    }

    return text;
}

function getExtRange() {
    var arr = [1, 100];

    if (num_pri > 0) {
        arr = [1, 500];
    }

    return arr;
}

/*function checkTimeCondition() {
    var cfuTimetypeVal = $("#edit_cfu_timetype").val();
    if (cfuTimetypeVal == 6 && isEmptyTimeCondition) {
        return false;
    } else {
        return true;
    }
}*/

function checkTimeCondition(val, ele) {
    if (val === '6' && isEmptyTimeCondition) {
        return false;
    }
    return true;
}

function checkWhitelistOnly(val, ele) {
    var bOnly = true;

    if (val === '') {
        return true;
    }

    $('#strategy_table4').find('input').each(function() {
        if (this.id === ele.id) {
            return true;
        }

        if (this.value === val) {
            bOnly = false;
            return false;
        }
    });

    return bOnly;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "edit_extension": {
                required: true,
                digits: true,
                // range: [extensionRange[0], extensionRange[1]],
                minlength: 2,
                customCallback: [$P.lang("LANG2126"), checkExtensionName],
                customCallback1: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "edit_cidnumber": {
                // digits: true,
                realAlphanumeric: true,
                minlength: 2
            },
            "edit_secret": {
                required: true,
                keyboradNoSpacesemicolon: true,
                minlength: 4
            },
            "edit_multiple_secret": {
                required: true,
                keyboradNoSpacesemicolon: true,
                minlength: 4
            },
            "edit_multiple_callerNumer": {
                realAlphanumeric: true,
                minlength: 2
            },
            "edit_vmsecret": {
                required: true,
                digits: true,
                minlength: 4
            },
            "edit_multiple_vmsecret": {
                required: true,
                digits: true,
                minlength: 4
            },
            "edit_multiple_callerNumer": {
                realAlphanumeric: true,
                minlength: 2
            },
            "edit_dahdi": {
                customCallback: [$P.lang("LANG2130"), fxs_in_use]
            },
            "edit_cfb": {
                numeric_pound_star: true
            },
            "edit_cfn": {
                numeric_pound_star: true
            },
            "edit_cfu": {
                numeric_pound_star: true
            },
            "edit_external_number": {
                required: true,
                phoneNumberOrExtension: true
            },
            "edit_hotline_number": {
                required: true,
                phoneNumberOrExtension: true
            },
            "edit_ring_timeout": {
                digits: true,
                range: [3, 600]
            },
            "first_name": {
                minlength: 1,
                specialCidName: true,
                maxlength: 32
            },
            "last_name": {
                minlength: 1,
                specialCidName: true,
                maxlength: 32
            },
            "email": {
                email: true
            },
            "user_password": {
                required: true,
                keyboradNoSpacesemicolon: true,
                minlength: 4,
                maxlength: 32
            },
            "phone_number": {
                minlength: 2,
                digitsWithHyphen: true
            },
            "edit_rxgain": {
                required: true,
                gain: [-30, 6]
            },
            "edit_txgain": {
                required: true,
                gain: [-30, 6]
            },
            "edit_rxflash_min": {
                required: true,
                digits: true,
                range: [30, 1000]
            },
            "edit_rxflash": {
                required: true,
                digits: true,
                range: [40, 2000],
                bigger: [$P.lang("LANG1119"), $P.lang("LANG1117"), $("#edit_rxflash_min")]
            },
            "edit_allow": {
                selectItemMin: 1,
                customCallback: [$P.lang("LANG2138"), check_video_codec]
            },
            "edit_qualifyfreq": {
                required: true,
                digits: true,
                range: [1, 3600]
            },
            "edit_authid": {
                specialauthid1: true
            },
            "edit_maxcallnumbers": {
                digits: true,
                range: [1, 512]
            },
            "edit_custom_alert_info": {
                required: true,
                alphanumeric: true
            },
            "local_network1": {
                required: true,
                customCallback: [$P.lang("LANG2131"), check_network],
                customCallback1: [$P.lang("LANG5247"), checkNum]
            },
            // "local_network2": {
            //     customCallback: [$P.lang("LANG2131"), check_network]
            // },
            // "local_network3": {
            //     customCallback: [$P.lang("LANG2131"), check_network]
            // },
            "specific_ip": {
                required: true,
                ipDns: ["ip"]
            },
            "edit_cc_max_agents": {
                required: true,
                digits: true,
                range: [1, 999]
            },
            "edit_cc_max_monitors": {
                required: true,
                digits: true,
                range: [1, 999]
            },
            "edit_user_outrt_passwd": {
                digits: true,
                minlength: 4
            },
            "batch_vmsecret": {
                required: true,
                digits: true,
                minlength: 4
            },
            "batch_number": {
                required: true,
                digits: true,
                range: getExtRange,
                customCallback: [$P.lang("LANG811").format(maxExtension, existExtentionList.length), check_max_users],
                customCallback1: [$P.lang("LANG3508").format($P.lang('LANG1155'), $P.lang('LANG1157')), check_range]
            },
            "batch_interval": {
                required: true,
                digits: true,
                min: 1
            },
            "batch_callerNum": {
                realAlphanumeric: true,
                minlength: 2
            },
            "new_itrl_stime_hour": {
                // required: true,
                digits: true,
                range: [0, 23],
                // LANG184  LANG169
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG184'), $P.lang('LANG169')), check_time] //end time's value cannot small than start time's value.
            },
            "new_itrl_ftime_hour": {
                // required: true,
                digits: true,
                range: [0, 23],
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG184'), $P.lang('LANG169')), check_time]
            },
            "new_itrl_stime_minute": {
                // required: true,
                digits: true,
                range: [0, 59],
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG184'), $P.lang('LANG169')), check_time]
            },
            "new_itrl_ftime_minute": {
                // required: true,
                digits: true,
                range: [0, 59],
                customCallback: [$P.lang('LANG4024').format($P.lang('LANG184'), $P.lang('LANG169')), check_time]
            },
            // "new_itrl_date_week": {
            //     required: true
            //     // customCallback: ['Choose one detailed date', check_date]
            // },
            "new_itrl_month_jan": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG244').toLowerCase()), check_month_required]
            },
            "new_itrl_week_sun": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG243').toLowerCase()), check_week_required]
            },
            "edit_mohsuggest": {
                required: true
            },
            "max_contacts": {
                required: true,
                digits: true,
                minValue: 1,
                range: [1, 10]
            },
            "maximumTime": {
                required: true,
                digits: true,
                max: 86400,
                customCallback: [$P.lang("LANG4346"), checkTimeLarger]
            },
            "batch_maximumTime": {
                required: true,
                digits: true,
                max: 86400,
                customCallback: [$P.lang("LANG4346"), checkTimeLarger]
            },
            "edit_maximumTime": {
                required: true,
                digits: true,
                max: 86400,
                customCallback: [$P.lang("LANG4346"), checkTimeLarger]
            },
            "edit_cfu_timetype": {
                customCallback: [$P.lang("LANG3289"), checkTimeCondition]
            },
            "edit_cfn_timetype": {
                customCallback: [$P.lang("LANG3289"), checkTimeCondition]
            },
            "edit_cfb_timetype": {
                customCallback: [$P.lang("LANG3289"), checkTimeCondition]
            },
            "edit_dnd_timetype": {
                customCallback: [$P.lang("LANG3289"), checkTimeCondition]
            },
            "edit_skip_auth_timetype": {
                customCallback: [$P.lang("LANG3289"), checkTimeCondition]
            },
            "edit_whitelist1": {
                phoneNumberOrExtension: true,
                customCallback: [$P.lang("LANG5211"), checkWhitelistOnly]
            }
        },
        newValidator: true,
        submitHandler: function() {
            $(".settings").not(".current_position").addClass("none_position");


            var target = this.submitButton;

            if (target.id == 'createUser' || target.id == 'editUser' || target.id == 'batchAddUsers') {
                if (mode == 'add') {
                    var action = {
                        "extension": $("#edit_extension").val()
                    };

                    if (type == "sip") {
                        action['action'] = "addSIPAccountAndUser";
                    } else if (type == "iax") {
                        action['action'] = "addIAXAccountAndUser";
                    } else if (type == "fxs") {
                        action['action'] = "addFXSAccountAndUser";
                    }

                    action.first_name = $('#first_name').val();
                    action.last_name = $('#last_name').val();
                    action.email = $('#email').val();
                    action.language = $('#language').val();
                    action.user_password = $('#user_password').val();
                    action.phone_number = $('#phone_number').val();

                    if (action.first_name.length > 0 && action.last_name.length > 0) {
                        action.fullname = action.first_name + ' ' + action.last_name;
                    } else if (action.first_name.length > 0) {
                        action.fullname = action.first_name;
                    } else if (action.last_name.length > 0) {
                        action.fullname = action.last_name;
                    } else {
                        action.fullname = '';
                    }

                    setExtensionValue(action, "#add_extension_div");
                } else if (mode == 'edit') {
                    /*if (!checkTimeCondition()) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG3289"),
                            callback: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        });
                        return;
                    }*/
                    var action = {
                        "extension": extension
                    };

                    if (type == "sip") {
                        action["action"] = "updateSIPAccount";
                    } else if (type == "iax") {
                        action["action"] = "updateIAXAccount";
                    } else if (type == "fxs") {
                        action["action"] = "updateFXSAccount";
                    }

                    setExtensionValue(action, "#add_extension_div");
                } else if (mode == 'batchEdit') {
                    setBatchEditExtensionsValue();
                } else if (mode == 'batchAdd') {
                    setBatchAddExtensionsValue();
                }
            } else {
                return false;
            }
        }
    });

    if (extensionRange[2] == 'no') {
        $P("input[name='edit_extension']", document).rules("add", {
            range: [extensionRange[0], extensionRange[1]]
        });
    }
}

function passwordChange() {
    $('#batch_secret')[0].disabled = !$('#batch_same_secret')[0].checked;
    $('#batch_vmsecret')[0].disabled = !$('#batch_same_vmsecret')[0].checked;
    $('#batch_callerNum')[0].disabled = !$('#batch_same_callerNum')[0].checked;
}

function ReturnWeek(list) {
    var str = list.split('&'),
        dictWeek = {};

    dictWeek["sun"] = '<span locale="LANG250">' + $P.lang("LANG250") + '</span>';
    dictWeek["mon"] = '<span locale="LANG251">' + $P.lang("LANG251") + '</span>';
    dictWeek["tue"] = '<span locale="LANG252">' + $P.lang("LANG252") + '</span>';
    dictWeek["wed"] = '<span locale="LANG253">' + $P.lang("LANG253") + '</span>';
    dictWeek["thu"] = '<span locale="LANG254">' + $P.lang("LANG254") + '</span>';
    dictWeek["fri"] = '<span locale="LANG255">' + $P.lang("LANG255") + '</span>';
    dictWeek["sat"] = '<span locale="LANG256">' + $P.lang("LANG256") + '</span>';

    tmpstr = "";

    for (i = 0; i < str.length; i++) {
        if (tmpstr == "") {
            tmpstr = dictWeek[str[i]];
        } else {
            tmpstr += " " + dictWeek[str[i]];
        }
    }

    return tmpstr;
}

function ReturnMonth(list) {
    var str = list.split('&'),
        dictMonth = {};

    dictMonth["jan"] = '<span locale="LANG204 \'\'">' + $P.lang("LANG204").format("") + '</span>';
    dictMonth["feb"] = '<span locale="LANG205 \'\'">' + $P.lang("LANG205").format("") + '</span>';
    dictMonth["mar"] = '<span locale="LANG206 \'\'">' + $P.lang("LANG206").format("") + '</span>';
    dictMonth["apr"] = '<span locale="LANG207 \'\'">' + $P.lang("LANG207").format("") + '</span>';
    dictMonth["may"] = '<span locale="LANG208 \'\'">' + $P.lang("LANG208").format("") + '</span>';
    dictMonth["jun"] = '<span locale="LANG209 \'\'">' + $P.lang("LANG209").format("") + '</span>';
    dictMonth["jul"] = '<span locale="LANG210 \'\'">' + $P.lang("LANG210").format("") + '</span>';
    dictMonth["aug"] = '<span locale="LANG211 \'\'">' + $P.lang("LANG211").format("") + '</span>';
    dictMonth["sep"] = '<span locale="LANG212 \'\'">' + $P.lang("LANG212").format("") + '</span>';
    dictMonth["oct"] = '<span locale="LANG213 \'\'">' + $P.lang("LANG213").format("") + '</span>';
    dictMonth["nov"] = '<span locale="LANG214 \'\'">' + $P.lang("LANG214").format("") + '</span>';
    dictMonth["dec"] = '<span locale="LANG215 \'\'">' + $P.lang("LANG215").format("") + '</span>';

    tmpstr = "";

    for (i = 0; i < str.length; i++) {
        tmpstr += dictMonth[str[i]];
    }

    return tmpstr;
}

function setBatchEditExtensionsValue() {
    var action = {
        "extension": extension
    };

    if (type == "sip") {
        action["action"] = "updateSIPAccount";
    } else if (type == "iax") {
        action["action"] = "updateIAXAccount";
    } else if (type == "fxs") {
        action["action"] = "updateFXSAccount";
    }

    if ($("#edit_check_multiple_permission")[0].checked) {
        action['permission'] = $("#edit_multiple_permission").val();
    }

    if ($("#edit_check_multiple_hasvoicemail")[0].checked) {
        action['hasvoicemail'] = ($("#edit_multiple_hasvoicemail")[0].checked ? 'yes' : 'no');
    }

    if ($("#edit_check_multiple_secret")[0].checked && $("#edit_multiple_seCHoice0")[0].checked) {
        action['secret'] = 'r';
    }

    if ($("#edit_check_multiple_secret")[0].checked && $("#edit_multiple_seCHoice1")[0].checked) {
        action['secret'] = $("#edit_multiple_secret").val();
    }

    if ($("#edit_check_multiple_vmsecret")[0].checked && $("#edit_multiple_vmCHoice0")[0].checked) {
        action['vmsecret'] = 'r';
    }

    if ($("#edit_check_multiple_vmsecret")[0].checked && $("#edit_multiple_vmCHoice1")[0].checked) {
        action['vmsecret'] = $("#edit_multiple_vmsecret").val();
    }

    if ($("#edit_check_multiple_callerNum")[0].checked && $("#edit_multiple_callerNum")[0].checked) {
        action['cidnumber'] = 'e';
    }

    if ($("#edit_check_multiple_callerNum")[0].checked && $("#edit_multiple_callerNums")[0].checked) {
        action['cidnumber'] = $("#edit_multiple_callerNumer").val();
    }

    if ($("#edit_check_multiple_ring_timeout")[0].checked) {
        action['ring_timeout'] = $("#edit_multiple_ring_timeout").val();
    }

    if ($("#edit_check_multiple_encryption")[0].checked) {
        action['encryption'] = $("#edit_multiple_encryption").val();
    }

    if ($("#edit_check_multiple_fax_mode")[0].checked) {
        var fax = $('#edit_multiple_fax_mode').val();

        if (fax == "no") {
            action['faxdetect'] = "no";
            //action['fax_gateway'] = "no";
        } else if (fax == "detect") {
            action['faxdetect'] = "yes";
            //action['fax_gateway'] = "no";
        }
    }

    if ($("#edit_check_multiple_strategy_ipacl")[0].checked && $("#edit_multiple_strategy_ipacl").val() == '0') {
        action['strategy_ipacl'] = '0';
    }

    if ($("#edit_check_multiple_strategy_ipacl")[0].checked && $("#edit_multiple_strategy_ipacl").val() == '1') {
        action['strategy_ipacl'] = '1';

        for (var i = 1; i <= maxRowOfLocalNet; i++) {
            if ($("#edit_multiple_local_network" + i).length === 0) {
                action["local_network" + i] = '';
            } else {
                action["local_network" + i] = $("#edit_multiple_local_network" + i).val();
            }
        }
    }

    if ($("#edit_check_multiple_strategy_ipacl")[0].checked && $("#edit_multiple_strategy_ipacl").val() == '2') {
        action['strategy_ipacl'] = '2';
        action['specific_ip'] = $("#edit_multiple_specific_ip").val();
    }

    if ($("#edit_check_multiple_bypass_outrt_auth")[0].checked) {
        action['bypass_outrt_auth'] = $("#edit_multiple_bypass_outrt_auth").val();

        if (action['bypass_outrt_auth'] === 'bytime') {
            action['skip_auth_timetype'] = $("#edit_multiple_skip_auth_timetype").val();
        }
    }

    if ($("#edit_check_multiple_auto_record")[0].checked) {
        action['auto_record'] = ($("#edit_multiple_auto_record")[0].checked ? 'yes' : 'no');
    }

    if ($("#edit_check_multiple_enablehotdesk")[0].checked) {
        action['enablehotdesk'] = ($("#edit_multiple_enablehotdesk")[0].checked ? 'yes' : 'no');
    }

    if ($("#edit_check_multiple_mohsuggest")[0].checked) {
        action['mohsuggest'] = $("#edit_multiple_mohsuggest").val();
    }

    if ($("#edit_check_multiple_skip_vmsecret")[0].checked) {
        action['skip_vmsecret'] = ($("#edit_multiple_skip_vmsecret")[0].checked ? 'yes' : 'no');
    }

    if ($("#edit_check_multiple_allow")[0].checked) {
        var allow = $("#edit_allow")[0],
            options = [];

        for (var i = 0; i < allow.options.length; i++) {
            options.push(allow.options[i].value)
        }

        action['allow'] = options.toString();
    }

    if ($("#edit_multiple_check_out_of_service")[0].checked) {
        action['out_of_service'] = ($("#edit_multiple_out_of_service")[0].checked ? 'yes' : 'no');
    }

    if ($("#edit_multiple_check_enable_ldap")[0].checked) {
        action['enable_ldap'] = ($("#edit_multiple_enable_ldap")[0].checked ? 'yes' : 'no');
    }

    if ($("#edit_check_enable_out_limitime")[0].checked) {
        if ($('#edit_maximumTime').is(':visible')) {
            var maximumTime = $("#edit_maximumTime").val();
            maximumTime = maximumTime ? (parseInt(maximumTime) * 1000) : '';

            action['limitime'] = maximumTime;
        } else {
            action['limitime'] = '';
        }
    }

    if ($("#edit_check_language")[0].checked) {
        action['language'] = $("#edit_language").val();
    }

    /*if ($("#edit_check_multiple_extension_status")[0].checked) {
        action['extension_status'] = ($("#edit_multiple_extension_status")[0].checked ? 'yes' : 'no');
    }

    if ($("#edit_check_multiple_active_call")[0].checked) {
        action['active_call'] = ($("#edit_multiple_active_call")[0].checked ? 'yes' : 'no');
        action['hangup'] = ($("#edit_multiple_hangup")[0].checked ? 'yes' : 'no');
        action['callbarge'] = ($("#edit_multiple_callbarge")[0].checked ? 'yes' : 'no');
    }*/

    if (type == 'sip') {
        if ($("#edit_check_multiple_nat")[0].checked) {
            action['nat'] = ($("#edit_multiple_nat")[0].checked ? 'yes' : 'no');
        }

        if ($("#edit_check_multiple_directmedia")[0].checked) {
            action['directmedia'] = $("#edit_multiple_directmedia").val();
        }

        if ($("#edit_check_multiple_dtmfmode")[0].checked) {
            action['dtmfmode'] = $("#edit_multiple_dtmfmode").val();
        }

        // if ($("#edit_check_multiple_insecure")[0].checked) {
        //     action['insecure'] = $("#edit_multiple_insecure").val();
        // }

        if ($("#edit_check_multiple_enable_qualify")[0].checked) {
            action['enable_qualify'] = ($("#edit_multiple_enable_qualify")[0].checked ? 'yes' : 'no');
        }

        if ($("#edit_check_multiple_qualifyfreq")[0].checked) {
            action['qualifyfreq'] = $("#edit_multiple_qualifyfreq").val();
        }

        if ($("#edit_check_multiple_tel_uri")[0].checked) {
            action['tel_uri'] = $("#edit_multiple_tel_uri").val();
        }

        if ($('#edit_check_multiple_max_contacts')[0].checked) {
            action['max_contacts'] = $('#edit_multiple_max_contacts').val();
        }

        if ($('#edit_multiple_check_enable_webrtc')[0].checked) {
            var enable_webrtc = $('#edit_multiple_enable_webrtc')[0].checked ? 'yes' : 'no';
            if (enable_webrtc == 'yes') {
                action['enable_webrtc'] = enable_webrtc;
                action['media_encryption'] = 'auto_dtls';
                action['account_type'] = 'SIP(WebRTC)';
            } else {
                action['enable_webrtc'] = enable_webrtc;
                action['media_encryption'] = 'no';
                action['account_type'] = 'SIP';
            }

            //if ($('#edit_multiple_enable_webrtc')[0].checked) {
                //action['ice_support'] = $('#edit_multiple_ice_support')[0].checked ? 'yes' : 'no';
                //action['use_avpf'] = $('#edit_multiple_use_avpf')[0].checked ? 'yes' : 'no';
            //}
        }
    } else if (type == 'iax') {
        if ($("#edit_check_multiple_maxcallnumbers")[0].checked) {
            action['maxcallnumbers'] = $("#edit_multiple_maxcallnumbers").val();
        }

        if ($("#edit_check_multiple_requirecalltoken")[0].checked) {
            action['requirecalltoken'] = $("#edit_multiple_requirecalltoken").val();
        }
    }
    var members = [];
    $.each($("#batch_edit_rightSelect").children(), function(index, item) {
        members.push($(item).val());
    });

    if (!$("#batch_edit_rightSelect").is(":disabled")) {
        if (members.length != 0) {
            action["callbarging_monitor"] = members.toString();
        } else {
            action["callbarging_monitor"] = "";
        }
    }

    var seamless_members = [];
    $.each($("#seamless_batch_edit_rightSelect").children(), function(index, item) {
        seamless_members.push($(item).val());
    });

    if (!$("#seamless_batch_edit_rightSelect").is(":disabled")) {
        if (seamless_members.length != 0) {
            action["seamless_transfer_members"] = seamless_members.toString();
        } else {
            action["seamless_transfer_members"] = "";
        }
    }

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG814")
    });

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
                if (top.dialog.closeCurrentDialog) {
                    top.dialog.closeCurrentDialog();
                }

                if ((autoEmailToUser === 'yes') && action['secret']) {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        async: false,
                        data: {
                            'action': 'sendAccount2User',
                            'extension': action['extension']
                        },
                        error: function(jqXHR, textStatus, errorThrown) {},
                        success: function(data) {}
                    });
                }

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#extension-list", mWindow.document).trigger('reloadGrid');

                        // update existNumberList/existExtentionList/existFXSList/extensionRange
                        mWindow.updateLists();
                    }
                });
            }
        }
    });
}

function setBatchAddExtensionsValue() {
    var action = {},
        addNumber = parseInt($("#batch_number").val()),
        batchAddExtList = [],
        newusersLists = [];

    if (type == "sip") {
        action['action'] = "addSIPAccountAndUser";
    } else if (type == "iax") {
        action['action'] = "addIAXAccountAndUser";
    } else if (type == "fxs") {
        action['action'] = "addFXSAccountAndUser";
    }

    batchAddExtList = getBatchUsers();
    
    if (askExtensionRange($("#batch_extension").val(), extensionRange[0], extensionRange[1], extensionRange[2], batchAddExtList[batchAddExtList.length - 1])) {
newusersLists.push("<font>" + batchAddExtList[0] + "</font>");

    for (var i = 1; i < addNumber; i++) {
        var newusersItem = batchAddExtList[i],
            prevItem = batchAddExtList[i - 1],
            prev = bigNumDelete(newusersItem);

        if ((typeof prevItem == 'string' ? prevItem.replace(/0*(\d+)/, "$1") : prevItem) == prev) {
            newusersItem = "<font>" + newusersItem + "</font>";
        } else {
            newusersItem = "<font color='green'>" + newusersItem + "</font>";
        }

        newusersLists.push(newusersItem);
    }

    action['extension'] = batchAddExtList.toString();

    $("input[id], select[id], textarea[id]", "#batchAdd_extensions_div").each(function() {
        if ($(this).is(":visible")) {
            var domVal = "",
                val = $(this).attr("id");

            if (val == 'batch_extension' || val == 'batch_number' ||
                val == 'batch_rand_secret' || val == 'batch_rand_vmsecret' ||
                val == 'batch_same_callerNumber' || val == 'batch_same_callerNum' ||
                val == 'batch_same_secret' || val == 'batch_same_vmsecret' ||
                val == 'batch_secret' || val == 'batch_vmsecret' ||
                val == 'select_available_codec' || val == 'batch_faxmode' ||
                val == 'batch_maximumTime' || val == 'batch_enable_out_limitime' || 
                val == 'maximumTime' || val == 'batch_room' ||
                val == 'batch_add_leftSelect' || val == 'batch_add_rightSelect' || 
                val == 'batch_interval' || val == 'batch_callerNum' || val === 'seamless_batch_add_leftSelect' ||
                val === 'seamless_batch_add_rightSelect') {
                return;
            }

            if (type != 'sip' && val === 'batch_enable_qualify') {
                return;
            }
            if ($(this).is(":disabled")) {
                return;
            }

            if (val.length != 0) {
                switch (this.type) {
                    case 'textarea':
                    case 'text':
                        domVal = $(this).val();
                        break;
                    case 'checkbox':
                        domVal = $(this).is(":checked") ? "yes" : "no";
                        break;
                    case 'radio':
                        break;
                    case 'select-one':
                        domVal = $(this).val();
                        break;
                    case 'select-multiple':
                        var options = new Array;

                        for (var i = 0; i < this.options.length; i++) {
                            options.push(this.options[i].value)
                        }

                        domVal = options.toString()
                        break;
                    default:
                        break;
                }
            }

            if (val == 'edit_allow') {
                action[val.substr(5)] = domVal;
            } else {
                action[val.substr(6)] = domVal;
            }
        }
    });

    var members = [];
    $.each($("#batch_add_rightSelect").children(), function(index, item) {
        members.push($(item).val());
    });

    if (members.length != 0) {
        action["callbarging_monitor"] = members.toString();
    } else {
        action["callbarging_monitor"] = "";
    }

    var seamless_members = [];
    $.each($("#seamless_batch_add_rightSelect").children(), function(index, item) {
        seamless_members.push($(item).val());
    });

    if (seamless_members.length != 0) {
        action["seamless_transfer_members"] = seamless_members.toString();
    } else {
        action["seamless_transfer_members"] = "";
    }

    var fax = $('#batch_faxmode').val();

    if (fax == "no") {
        action['faxdetect'] = "no";
        //action['fax_gateway'] = "no";
    } else if (fax == "detect") {
        action['faxdetect'] = "yes";
        //action['fax_gateway'] = "no";
    }

    if ($("#batch_rand_secret")[0].checked) {
        action['secret'] = 'r';
    }
    if ($("#batch_same_callerNumber")[0].checked) {
        action['cidnumber'] = 'e';
    }
    if ($("#batch_same_callerNum")[0].checked) {
        action['cidnumber'] = $("#batch_callerNum").val();
    }
    if ($("#batch_rand_vmsecret")[0].checked) {
        action['vmsecret'] = 'r';
    }

    if ($("#batch_same_secret")[0].checked) {
        action['secret'] = $("#batch_secret").val();
    }

    if ($("#batch_same_vmsecret")[0].checked) {
        action['vmsecret'] = $("#batch_vmsecret").val();
    }

    if ($('#batch_maximumTime').is(':visible')) {
        var maximumTime = $("#batch_maximumTime").val();
        maximumTime = maximumTime ? (parseInt(maximumTime) * 1000) : '';

        action['limitime'] = maximumTime;
    } else {
        action['limitime'] = '';
    }

    if (type === 'sip') {
        if ($('#batch_enable_webrtc')[0].checked) {
            action['media_encryption'] = 'auto_dtls';
            action['account_type'] = 'SIP(WebRTC)';
        } else {
            action['media_encryption'] = 'no';
            action['account_type'] = 'SIP';
        }

        if ($('#batch_room')[0].checked) {
            action['room'] = action['extension'];
        }
    }

    action['user_password'] = "r"; // 'r' means a random password.

    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG813").format(newusersLists.join('  ')),
        buttons: {
            ok: function() {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG736")
                });

                var do_batch_add = function() {
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
                                if (top.dialog.closeCurrentDialog) {
                                    top.dialog.closeCurrentDialog();
                                }

                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG4104"),
                                    callback: function() {
                                        mWindow.$("#extension-list", mWindow.document).trigger('reloadGrid');

                                        // update existNumberList/existExtentionList/existFXSList/extensionRange
                                        mWindow.updateLists();
                                    }
                                });
                            }
                        }
                    });
                }

                setTimeout(do_batch_add, 100);
            },
            cancel: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        }
    });        
    }
    
}

function setExtensionValue(action, doc) {
    var exceptTextNode = '#enable_cc, #edit_cc_max_agents, #edit_cc_max_monitors, #edit_custom_alert_info, #edit_room',
        exceptSelectNode = '#select_available_codec, #edit_faxmode, #cc_mode, #leftSelect, #rightSelect, #seamless_leftSelect, #seamless_rightSelect';

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG826")
    });

    var members = [];
    $.each($("#rightSelect").children(), function(index, item) {
        members.push($(item).val());
    });

    if (members.length != 0) {
        action["callbarging_monitor"] = members.toString();
    } else {
        action["callbarging_monitor"] = "";
    }

    var seamless_members = [];
    $.each($("#seamless_rightSelect").children(), function(index, item) {
        seamless_members.push($(item).val());
    });

    if (seamless_members.length != 0) {
        action["seamless_transfer_members"] = seamless_members.toString();
    } else {
        action["seamless_transfer_members"] = "";
    }



    $("input[id]:not(" + exceptTextNode + "), select[id]:not(" + exceptSelectNode + "), textarea[id]", doc).each(function() {
        if ($(this).is(":visible")) {
            var domVal = "",
                val = $(this).attr("id");

            if (val == 'edit_extension' || val == 'edit_fullname' ||
                val == 'first_name' || val == 'last_name' || val == 'user_password' || val === 'phone_number' ||
                val == 'email' || val == 'language' ||
                val == 'mode' || val.beginsWith('new_itrl') || val === 'enable_out_limitime' || val.match(/edit_whitelist/g) ||
                val === 'maximumTime') {
                return;
            }
            if (type != 'sip' && val === 'edit_enable_qualify') {
                return;
            }
            if ($(this).is(":disabled") && !$(this).is("#edit_authid")) {
                return;
            }

            if (val.length != 0) {
                switch (this.type) {
                    case 'textarea':
                    case 'text':
                    case 'password':
                        domVal = $(this).val();
                        break;
                    case 'checkbox':
                        domVal = $(this).is(":checked") ? "yes" : "no";
                        break;
                    case 'radio':
                        break;
                    case 'select-one':
                        domVal = $(this).val();
                        break;
                    case 'select-multiple':
                        var options = new Array;

                        for (var i = 0; i < this.options.length; i++) {
                            options.push(this.options[i].value)
                        }

                        domVal = options.toString()
                        break;
                    default:
                        break;
                }
            }

            action[val.substr(5)] = domVal;
        }
    });

    var edit_whitelist_array = [];
    $('#strategy_table4').find('input').each(function() {
        if ($(this).val() !== '') {
            edit_whitelist_array.push($(this).val());
        }
    });
    action['dndwhitelist'] = edit_whitelist_array.join(',');

    var fax = $('#edit_faxmode').val();

    if (fax == "no") {
        action['faxdetect'] = "no";
        if (type == 'fxs') {
            action['fax_gateway'] = "no";
        }
    } else if (fax == "detect") {
        action['faxdetect'] = "yes";
        if (type == 'fxs') {
            action['fax_gateway'] = "no";
        }
    } else if (fax == "gateway") {
        action['faxdetect'] = "no";
        if (type == 'fxs') {
            action['fax_gateway'] = "yes";
        }
    }

    if (type == 'fxs') {
        action['hanguponpolarityswitch'] = action['answeronpolarityswitch'];

        if ($('#enable_cc').is(':checked')) {
            action['cc_agent_policy'] = "generic";
            action['cc_monitor_policy'] = "generic";
            action['cc_max_agents'] = "1";
            action['cc_max_monitors'] = "5";
            action['cc_offer_timer'] = "120";
            action['ccnr_available_timer'] = "3600";
            action['ccbs_available_timer'] = "3600";
        } else {
            action['cc_agent_policy'] = "never";
            action['cc_monitor_policy'] = "never";
        }
    } else {
        // SIP/ IAX
        for (var i = 1; i <= maxRowOfLocalNet; i++) {
            if (!action.hasOwnProperty("local_network" + i)) {
                action["local_network" + i] = '';
            }
        }

        if (type == 'sip') {
            if ($('#enable_cc').is(':checked')) {
                if ($('#cc_mode').val() == 'trunk') {
                    action['cc_agent_policy'] = "native";
                    action['cc_monitor_policy'] = "native";
                    action['cc_max_agents'] = $('#edit_cc_max_agents').val();
                    action['cc_max_monitors'] = $('#edit_cc_max_monitors').val();
                    action['cc_offer_timer'] = "120";
                    action['ccnr_available_timer'] = "3600";
                    action['ccbs_available_timer'] = "3600";
                } else {
                    action['cc_agent_policy'] = "generic";
                    action['cc_monitor_policy'] = "generic";
                    action['cc_max_agents'] = "1";
                    action['cc_max_monitors'] = "5";
                    action['cc_offer_timer'] = "120";
                    action['ccnr_available_timer'] = "3600";
                    action['ccbs_available_timer'] = "3600";
                }
            } else {
                action['cc_agent_policy'] = "never";
                action['cc_monitor_policy'] = "never";
            }

            var edit_enable_webrtc = $('#edit_enable_webrtc')[0].checked ? 'yes' : 'no';

            if (edit_enable_webrtc == "yes") {
                action['enable_webrtc'] = edit_enable_webrtc;
                action['media_encryption'] = "auto_dtls";
                action['account_type'] = 'SIP(WebRTC)';
            } else {
                action['enable_webrtc'] = edit_enable_webrtc;
                action['media_encryption'] = "no";
                action['account_type'] = 'SIP';
            }

            if (action["alertinfo"] === 'custom') {
                action["alertinfo"] = 'custom_' + $("#edit_custom_alert_info").val();
            }

            if ($('#edit_room').is(':checked')) {
                action['room'] = action['extension'];
            }
        }
    }

    // add time condition data
    var tc = OrderTable.lists,
        tcLength = OrderTable.lists.length;

    for (i = 0; i < tcLength; i++) {
        delete tc[i]['condition_index'];
        delete tc[i]['time'];

        tc[i]['sequence'] = 0;
        // tc[i]['condition_index'] = i + 1;

        if (mode == 'edit') {
            tc[i]['user_id'] = userID;
        }
    }

    action['time_condition'] = JSON.stringify(tc);

    if ($('#maximum_time').is(':visible')) {
        var maximumTime = $("#maximumTime").val();
        maximumTime = maximumTime ? (parseInt(maximumTime) * 1000) : '';

        action['limitime'] = maximumTime;
    } else {
        action['limitime'] = '';
    }

    if (mode == 'edit') {
        var userAction = {
            "action": "updateUser",
            "user_id": userID,
            "first_name": $('#first_name').val(),
            "last_name": $('#last_name').val(),
            "email": $('#email').val(),
            "user_password": $('#user_password').val(),
            "language": $('#language').val(),
            "phone_number": $('#phone_number').val()
        };

        if ($('#user_password').val() === '******') {
            delete userAction["user_password"];
        }
    }

    if (!$.isEmptyObject(privilegeInfo)) {
        action = getPrivilegeAction(action, privilegeInfo);
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
            var bool = UCMGUI.errorHandler(data, function() {

                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                if (mode == 'edit') {
                    var newDom = getDomStr();

                    if (oldDom !== newDom) {
                        userAction["email_to_user"] = 'no';
                    }

                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: userAction,
                        async: false,
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
                                if (top.dialog.closeCurrentDialog) {
                                    top.dialog.closeCurrentDialog();
                                }

                                if ((oldDom !== newDom) && (autoEmailToUser === 'yes') && userAction['email']) {
                                    $.ajax({
                                        type: "post",
                                        url: "../cgi",
                                        async: false,
                                        data: {
                                            'action': 'sendAccount2User',
                                            'extension': action['extension']
                                        },
                                        error: function(jqXHR, textStatus, errorThrown) {},
                                        success: function(data) {}
                                    });
                                }

                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG815"),
                                    callback: function() {
                                        mWindow.$("#extension-list", mWindow.document).trigger('reloadGrid');

                                        // update existNumberList/existExtentionList/existFXSList/extensionRange
                                        mWindow.existFXSList = UCMGUI.isExist.getList("getDahdiList");
                                        mWindow.updateLists();
                                    }
                                });
                            }
                        }
                    });
                } else {
                    if (top.dialog.closeCurrentDialog) {
                        top.dialog.closeCurrentDialog();
                    }

                    if ((autoEmailToUser === 'yes') && action['email']) {
                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            async: false,
                            data: {
                                'action': 'sendAccount2User',
                                'extension': action['extension']
                            },
                            error: function(jqXHR, textStatus, errorThrown) {},
                            success: function(data) {}
                        });
                    }

                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG4104"),
                        callback: function() {
                            mWindow.$("#extension-list", mWindow.document).trigger('reloadGrid');
                            if (type == 'fxs') {
                                mWindow.existFXSList = UCMGUI.isExist.getList("getDahdiList");
                            }
                            // update existNumberList/existExtentionList/existFXSList/extensionRange
                            mWindow.updateLists();
                        }
                    });
                }

            }
        }
    });
}

function setAllowData(data) {
    if (!data) {
        return;
    }

    var allow = data.split(','),
        length = allow.length,
        i = 0,
        selectAvailableCodec = $("#select_available_codec"),
        editAllow = $("#edit_allow"),
        editAllowOptions = $("#edit_allow option");

    selectAvailableCodec.append(editAllowOptions);
    editAllow.empty();

    for (i; i < length; i++) {
        var item = $("#select_available_codec option[value=" + allow[i] + "]");

        $("#edit_allow").append(item);
    }
}

function setFXSData() {
    var i = 1,
        option = '',
        // num_fxs = parseInt(UCMGUI.config.model_info.num_fxs ? UCMGUI.config.model_info.num_fxs : "1"),
        // num_fxo = parseInt(UCMGUI.config.model_info.num_fxo ? UCMGUI.config.model_info.num_fxo : "1");
        num_fxs = 2,
        num_fxo = 0;

    for (i; i <= num_fxs; i++) {
        option += '<option value="' + (i + num_fxo) + '">FXS ' + i + '</option>';
    }

    $("#edit_dahdi").append(option);

    if (existFXSList && existFXSList.length === 1 && existFXSList[0] === 1) {
        $("#edit_dahdi").val("2");
    }
}

function transExtensionData(res, cb) {
    var arr = [],
        accountListsObj = mWindow.accountListsObj;

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            resIndex = accountListsObj[res[i]];

        if (resIndex) {
            var extension = resIndex.extension,
                fullname = resIndex.fullname,
                disabled = resIndex.out_of_service;
                obj["val"] = extension;

            if (disabled == 'yes') {
                obj["class"] = 'disabledExtOrTrunk';
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
                obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <';
                obj["disable"] = true; // disabled extension
            } else {
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
            }

            arr.push(obj);
        }


        if (cb && typeof cb == "function") {
            cb(arr);
        }
    }
    return arr;
}
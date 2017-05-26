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
    addZero = UCMGUI.addZero,
    ifExisted = UCMGUI.inArray,
    gup = UCMGUI.gup,
    maxTimeCondition = config.maxTimeCondition,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    selectbox = UCMGUI.domFunction.selectbox,
    accountList = [],
    accountLists = [],
    accountListsObj = {},
    addOrEdit = gup.call(window, "mode"),
    inboundRouteIndex = gup.call(window, "item"),
    officeTimeType = mWindow.officeTimeType,
    slaTrunkNameList = mWindow.slaTrunkNameList,
    destinationType = mWindow.destinationType,
    destinationTypeText = mWindow.destinationTypeText,
    destinationTypeValue = mWindow.destinationTypeValue,
    translateDestination = mWindow.translateDestination,
    trunkList = mWindow.trunkList,
    trunkOption = '',
    isDialTrunkDivShow = false,
    datactol = {
        "clicked": false,
        "timeout": null
    },
    destinationMode = {
        'defaultMode': {
            'destination_type': '',
            'account': '',
            'voicemail': '',
            'conference': '',
            'vmgroup': '',
            'ivr': '',
            'ringgroup': '',
            'queue': '',
            'paginggroup': '',
            'fax': '',
            'disa': '',
            'directory': '',
            'external_number': '',
            'callback': '',
            'did_strip': '',
            'incoming_prepend': '',
            'timecondition': []
        },
        'mode1': {
            'destination_type': '',
            'account': '',
            'voicemail': '',
            'conference': '',
            'vmgroup': '',
            'ivr': '',
            'ringgroup': '',
            'queue': '',
            'paginggroup': '',
            'fax': '',
            'disa': '',
            'directory': '',
            'external_number': '',
            'callback': '',
            'did_strip': '',
            'incoming_prepend': '',
            'timecondition': []
        }
    };

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

            if (OrderTable.max_timecondition > 0 && OrderTable.max_timecondition <= OrderTable.lists.length) {
                var target = $(this),
                    max_msg = $P.lang("LANG808").format(OrderTable.max_timecondition, $P.lang("LANG1557"));

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

            var clickRow = $(this).parent().parent();
            var newCell = doc.createElement('tr');

            OrderTable.newCell = $(newCell);

            $(newCell)
                .css('background', '#CAECFF')
                .attr("id", 'new_time_condition');

            var cell = doc.createElement('td');

            $(cell).attr('colspan', 4);

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
            if (window.frameElement) {
                $(window.frameElement).css("height", "500px");
            }

            top.dialog.currentDialogType = "iframe";

            // top.dialog.repositionDialog("none");
            top.dialog.repositionDialog();

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
            var curIdx = OrderTable.getOptionOrder('index', clickRow.attr('data-item-val'));

            // remove select item from lists
            OrderTable.lists.splice(curIdx, 1);

            OrderTable.refresh_timecondition();

            // checkout if destination_type or custom time has byDID?
            var otherMode = $('#nav_settings > li:not(".current") > a').attr('id'),
                otherModeDestination = destinationMode[otherMode],
                defaultDestinationHasDID = (otherModeDestination.destination_type === 'byDID');

            if (($('#destination_type').val() === 'byDID') || defaultDestinationHasDID || checkIfCustomTimeHasByDID()) {
                $(".dial_trunk_div, .DID_destination_div").show();
                isDialTrunkDivShow = true;

                $('#trunk_index').find('[technology="Analog"]').attr({
                    'disabled': true
                });
            } else {
                $(".dial_trunk_div, .DID_destination_div").hide();
                isDialTrunkDivShow = false;

                $('#trunk_index').find('[technology="Analog"]').attr({
                    'disabled': false
                });
            }

            $("#dial_trunk").trigger("change");

            // reset innerhtml height
            if (window.frameElement) {
                $(window.frameElement).css("height", "500px");
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

            var clickRow = $(this).parent().parent();
            var newCell = doc.createElement('tr');

            OrderTable.newCell = $(newCell);

            $(newCell).css('background', '#CAECFF');


            var cell = doc.createElement('td');

            $(cell).attr('colspan', 4);

            newCell.appendChild(cell);

            var curIdx = OrderTable.getOptionOrder('index', clickRow.attr('data-item-val'));

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

            // Pengcheng Zou Added.
            // Fixed the display error while the destination has been deleted. 
            var item = OrderTable.lists[curIdx] || {},
                desType = item['destination_type'],
                desValue = item[desType];

            if (desType && (desType != 'byDID') && (desType != 'external_number') && !desValue) {
                $('#new_itrl_tc_dest_val')[0].selectedIndex = -1;
            }

            OrderTable.click_val = $(this).parent().parent().attr('data-item-val');

            // reset innerhtml height
            if (window.frameElement) {
                $(window.frameElement).css("height", "500px");
            }

            top.dialog.currentDialogType = "iframe";

            top.dialog.repositionDialog();

            OrderTable.operater_switch = 'edit';

            top.Custom.init(doc);

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-up', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            var currentRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('index', currentRow.attr('data-item-val'));

            if (curIdx <= 0) {
                return;
            }

            var prevRow = currentRow.prev();
            var prevIdx = OrderTable.getOptionOrder('index', prevRow.attr('data-item-val'));
            var lists = OrderTable.lists;
            var tmp = lists[curIdx];

            lists[curIdx] = lists[prevIdx];
            lists[prevIdx] = tmp;

            OrderTable.refresh_timecondition();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-down', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            var currentRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('index', currentRow.attr('data-item-val'));
            var last = OrderTable.lists.length - 1;

            if (curIdx >= last) {
                return;
            }

            var nextRow = currentRow.next();
            var nextIdx = OrderTable.getOptionOrder('index', nextRow.attr('data-item-val'));
            var lists = OrderTable.lists;
            var tmp = lists[curIdx];

            lists[curIdx] = lists[nextIdx];
            lists[nextIdx] = tmp;

            OrderTable.refresh_timecondition();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-top', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            var currentRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('index', currentRow.attr('data-item-val'));

            if (curIdx <= 0) {
                return;
            }

            var item = OrderTable.lists[curIdx];

            OrderTable.lists.splice(curIdx, 1);
            OrderTable.lists.splice(0, 0, item);

            OrderTable.refresh_timecondition();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-bottom', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            var currentRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('index', currentRow.attr('data-item-val'));
            var lastIdx = OrderTable.lists.length - 1;

            if (curIdx >= lastIdx) {
                return;
            }

            var item = OrderTable.lists[curIdx];

            OrderTable.lists.splice(curIdx, 1);
            OrderTable.lists.splice(lastIdx, 0, item);

            OrderTable.refresh_timecondition();

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

        OrderTable.operater_switch = true;

        OrderTable.click_val = null;

        // checkout if destination_type or custom time has byDID?
        var otherMode = $('#nav_settings > li:not(".current") > a').attr('id'),
            otherModeDestination = destinationMode[otherMode],
            defaultDestinationHasDID = (otherModeDestination.destination_type === 'byDID');

        if (($('#destination_type').val() === 'byDID') || defaultDestinationHasDID || checkIfCustomTimeHasByDID()) {
            $(".dial_trunk_div, .DID_destination_div").show();
            isDialTrunkDivShow = true;

            $('#trunk_index').find('[technology="Analog"]').attr({
                'disabled': true
            });
        } else {
            $(".dial_trunk_div, .DID_destination_div").hide();
            isDialTrunkDivShow = false;

            $('#trunk_index').find('[technology="Analog"]').attr({
                'disabled': false
            });
        }

        $("#dial_trunk").trigger("change");

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "500px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
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

        var tc_dest = $('#new_itrl_tc_dest').val(),
            tc_digits = $('#new_itrl_tc_digits')[0].value || '',
            tc_prepend_val = $('#new_itrl_tc_prepend')[0].value || '',
            tc_dest_val;

        if (tc_dest == 'byDID') {
            tc_dest_val = '';
        } else if (tc_dest == 'external_number') {
            tc_dest_val = $('#new_itrl_tc_dest_val_nu').val();
        } else {
            tc_dest_val = $('#new_itrl_tc_dest_val').val();
        }

        if (tc_digits == '') {
            tc_digits = '0';
        }

        // display time condition
        this.newCell = [];

        var order = this.getOptionOrder('index', this.click_val);

        order = parseInt(order, 10);

        var office = $('#office').val(),
            isSpecific = (office == '6'),
            timetype;

        if (isSpecific) {
            timetype = $('#timetype')[0].checked ? '7' : '6';
        } else {
            timetype = office;
        }

        // time condition object
        var newTimeCondition = {
            'index': getIndexName(),
            'start_hour': (isSpecific ? stime_hour : '00'),
            'start_min': (isSpecific ? stime_minute : '00'),
            'end_hour': (isSpecific ? ftime_hour : '23'),
            'end_min': (isSpecific ? ftime_minute : '59'),
            'time': (isSpecific ? time : '00:00-23:59'),
            'mode': (isSpecific ? mode : 'byWeek'),
            'week_day': (isSpecific ? week['value'] : '*'),
            'month': (isSpecific ? month['value'] : '*'),
            'day': (isSpecific ? day['value'] : '*'),
            'destination_type': tc_dest,
            'did_strip': tc_digits,
            'timecondition_prepend': tc_prepend_val,
            'timetype': timetype
        };

        for (var i = 1; i < destinationType.length; i++) {
            if (tc_dest == destinationType[i]) {
                newTimeCondition[destinationType[i]] = tc_dest_val;
            } else {
                newTimeCondition[destinationType[i]] = '';
            }
        }

        this.lists.splice(order + 1, 0, newTimeCondition);
        this.refresh_timecondition();

        top.dialog.dialogCommands.show();

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "500px");
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

        // Prevent form submit by pressing enter key. Pengcheng Zou Added.
        // if (!check_week_required()) {
        //     return false;
        // }

        var office = $('#office').val(),
            isSpecific = (office == '6'),
            timetype;

        if (isSpecific) {
            timetype = $('#timetype')[0].checked ? '7' : '6';
        } else {
            timetype = office;
        }

        var order = this.getOptionOrder('index', this.click_val),
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

        this.lists[order]['start_hour'] = (isSpecific ? stime_hour : '00');
        this.lists[order]['start_min'] = (isSpecific ? stime_minute : '00');
        this.lists[order]['end_hour'] = (isSpecific ? ftime_hour : '23');
        this.lists[order]['end_min'] = (isSpecific ? ftime_minute : '59');
        this.lists[order]['time'] = (isSpecific ? time : '00:00-23:59');
        this.lists[order]['mode'] = (isSpecific ? mode : 'byWeek');
        this.lists[order]['timetype'] = timetype;

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

        this.lists[order]['week_day'] = (isSpecific ? week.value : '*');

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

        this.lists[order]['month'] = (isSpecific ? month.value : '*');
        this.lists[order]['day'] = (isSpecific ? day.value : '*');

        // time condition destination
        var tc_dest = $('#new_itrl_tc_dest').val(),
            tc_digits = $('#new_itrl_tc_digits')[0].value,
            tc_prepend_val = $('#new_itrl_tc_prepend')[0].value,
            tc_dest_val;

        if (tc_dest == 'byDID') {
            tc_dest_val = '';
        } else if (tc_dest == 'external_number') {
            tc_dest_val = $('#new_itrl_tc_dest_val_nu').val();
        } else {
            tc_dest_val = $('#new_itrl_tc_dest_val').val();
        }

        if (tc_digits == '') {
            tc_digits = '0';
        }

        this.lists[order]['destination_type'] = tc_dest;
        this.lists[order]['did_strip'] = tc_digits;
        this.lists[order]['timecondition_prepend'] = tc_prepend_val;

        for (var i = 1; i < destinationType.length; i++) {
            if (tc_dest == destinationType[i]) {
                this.lists[order][destinationType[i]] = tc_dest_val;
            } else {
                this.lists[order][destinationType[i]] = '';
            }
        }

        $('#table_edit_template').appendTo($('#table_template_placeholder'));

        // this.newCell.remove();
        this.newCell = [];

        this.refresh_timecondition();

        top.dialog.dialogCommands.show();

        // reset innerhtml height
        if (window.frameElement) {
            $(window.frameElement).css("height", "500px");
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
                html: $P.lang('LANG1557'),
                locale: 'LANG1557'
            });
            addCell(newRow, {
                html: $P.lang('LANG247'),
                locale: 'LANG247'
            });
            addCell(newRow, {
                html: $P.lang('LANG168'),
                locale: 'LANG168'
            });
            addCell(newRow, {
                html: $P.lang('LANG74'),
                locale: 'LANG74'
            });
        })();

        var len = this.lists.length;

        if (len <= 0) {
            var newRow = TBL.insertRow(-1);
            var td = $('<td colspan="4" />');

            $(newRow)
                .addClass("odd")
                .append(td)
                .attr('data-item-val', 'add_item');

            $(td).append('<span class="table-add">' + $P.lang('LANG1562') + '</span>');

            return;
        }

        // show item list
        for (var i = 0; i < len; i++) {
            var item = this.lists[i],
                newRow = TBL.insertRow(-1);

            newRow.className = ((TBL.rows.length) % 2 == 1) ? 'odd' : 'even';

            addCell(newRow, {
                html: $P.lang((item.timetype >= 6) ? officeTimeType[6] : officeTimeType[item.timetype])
            });

            addCell(newRow, {
                html: ((item.timetype >= 6) ? (item.time || '--') : '--')
            });

            addCell(newRow, {
                html: translateDestination(undefined, undefined, item)
            });

            // addCell(newRow, { html: "<div locale=\"LANG566 "+tmp_dest+"\">"+"$P.lang(\""+lang+"\") -- "+tmp_str+"</div>"});
            var newCell = newRow.insertCell(newRow.cells.length);
            var $tmp;

            // add icons
            $tmp = $('<span />').addClass('table-add tableIcon table-add-icon').attr('localeTitle', 'LANG769').attr('title', $P.lang('LANG769')).appendTo(newCell);

            // top,up,down,bottom icons
            $tmp = $('<span />').addClass('table-top clickTop tableIcon').attr('localeTitle', 'LANG793').attr('title', $P.lang('LANG793')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-up clickUp tableIcon').attr('localeTitle', 'LANG794').attr('title', $P.lang('LANG794')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-down clickDown tableIcon').attr('localeTitle', 'LANG795').attr('title', $P.lang('LANG795')).appendTo(newCell);
            $tmp = $('<span />').addClass('table-bottom clickBottom tableIcon').attr('localeTitle', 'LANG796').attr('title', $P.lang('LANG796')).appendTo(newCell);

            // empty icon 
            // $tmp = $('<span />').addClass('tableIcon').appendTo(newCell);
            // edit, delete icons
            $tmp = $('<span />').attr('title', $P.lang('LANG738')).attr('localeTitle', 'LANG738').addClass('table-edit tableIcon').appendTo(newCell);
            $tmp = $('<span />').attr('title', $P.lang('LANG739')).attr('localeTitle', 'LANG739').addClass('table-del tableIcon').appendTo(newCell);

            $(newRow).attr('data-item-val', item.index);
        }

        $('.table-add').tooltip({
            position: {
                my: "right center",
                at: "left center"
            }
        });
    },
    "set_edit_values": function(idx) {
        $('#office')[0].selectedIndex = -1;
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
            $('#office').val('1').trigger('change');

            $('#new_itrl_stime_hour')[0].selectedIndex = -1;
            $('#new_itrl_stime_minute')[0].selectedIndex = -1;
            $('#new_itrl_ftime_hour')[0].selectedIndex = -1;
            $('#new_itrl_ftime_minute')[0].selectedIndex = -1;

            set_chkbox_all('week', false);
            set_chkbox_all('month', false);

            $('#new_itrl_tc_dest')[0].selectedIndex = -1;
            $('#new_itrl_tc_digits')[0].value = '0';
            $('#new_itrl_tc_prepend')[0].value = '';
            $('#new_itrl_tc_dest_val')[0].selectedIndex = -1;

            $('.local_month, .local_day').hide();
            $('.tc_byDid, .newSelectDivValue').hide();
            $('#new_itrl_tc_dest_val_nu').val('').hide();

            $('#new_itrl_day_container td').removeClass('day_selected').addClass('day_unselected');
            return;
        }

        var item = this.lists[idx] || {},
            tmp_str,
            mode,
            timetype;

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

        timetype = item.timetype;

        if (timetype == '7') {
            $('#timetype')[0].checked = true;
        } else {
            $('#timetype')[0].checked = false;
        }

        // office
        $('#office').val((timetype >= 6) ? '6' : timetype).trigger('change');

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

        // time condition destination
        $('#new_itrl_tc_dest').val(item.destination_type);
        $('#new_itrl_tc_dest').trigger('change');

        if (item.destination_type == 'byDID') {
            $('#new_itrl_tc_digits').val(item.did_strip);
            $('#new_itrl_tc_prepend').val(item.timecondition_prepend);
        } else if (item.destination_type == 'external_number') {
            $('#new_itrl_tc_dest_val_nu').val(item[item.destination_type]);
        } else {
            // $('#new_itrl_tc_dest').trigger('change');
            $('#new_itrl_tc_dest_val').val(item[item.destination_type]);
        }
    }
};

Array.prototype.each = top.Array.prototype.each;
Array.prototype.sortBy = top.Array.prototype.sortBy;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    var dialTrunk = $("#dial_trunk");

    // Pengcheng Zou Moved. Set Trunk Options First.
    setTrunkList();

    isDisplayPrilevel();

    $P.lang(doc, true);

    preparedData();

    setDestinationList();

    bindEvent();

    append_time_value(addOrEdit);

    initValidator();

    if (addOrEdit === 'edit') {
        getInboundRouteValue();
    } else {
        $('.hideOnEdit').css({
            "display": "inline-block"
        });

        var trunkIndex = gup.call(window, "trunkIndex");

        $('#trunk_index').val(trunkIndex).trigger('change');

        initTimeConditionTable();

        top.Custom.init(doc);
    }

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

    $('#tm_cancel').on('click', function(ev) {
        OrderTable.tbl_btn_cancel(ev);
    });

    $('#table-add-btn').on('click', function(ev) {
        OrderTable.tbl_btn_add(ev);
    });

    $('#table-edit-btn').on('click', function(ev) {
        OrderTable.tbl_btn_update(ev);
    });

    // dialTrunk.trigger("change");
});

function preparedData () {
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

        accountList = UCMGUI.isExist.getList("getAccountList"),
        accountLists = transData(accountList);

        for (var i = 0; i < accountList.length; i++) {
            var value = accountList[i]["extension"];

            accountListsObj[value] = accountList[i];
        }

    selectbox.appendOpts({
        el: "seamless_leftSelect",
        opts: accountLists
    }, doc);
}

function transData(res, cb) {
    var arr = [];

    ringgroupExt = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
        }

        ringgroupExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
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

function bindEvent() {
    $("#prepend_inbound_name").hide();

    if (addOrEdit == 'add') {
        $('#trunk_index').bind("change", function(ev) {
            var trunkType = $('option:selected', this).attr('technology'),
                lastTrunkType = $(this).attr('lasttype');

            if (trunkType == "Analog") {
                $(".dial_trunk_div, .DID_destination_div").hide();
                isDialTrunkDivShow = false;
                $("#did_pattern_match").val('s').attr('disabled', 'disabled');

                $('body').find('[value="byDID"]').attr({
                    'disabled': true
                });
            } else {
                if (lastTrunkType == 'Analog') {
                    $("#did_pattern_match").val('').removeAttr('disabled');
                } else {
                    $("#did_pattern_match").removeAttr('disabled');
                }

                $('body').find('[value="byDID"]').attr({
                    'disabled': false
                });
            }

            $(this).attr({
                'lasttype': trunkType
            });

            $("#dial_trunk").trigger("change");

            top.dialog.repositionDialog();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });
    }
    $("#prepend_trunk_name").change(function() {
        var prependCheckEle = $("#prepend_inbound_name_enable");
        var prependEle = $("#prepend_inbound_name");

        if(this.checked) {
           prependCheckEle.attr("disabled", true);
           prependEle.attr("disabled", true); 
        } else {
            prependCheckEle.attr("disabled", false);
            prependEle.attr("disabled", false);
        }
        top.Custom.init(doc);
        top.dialog.repositionDialog();
    });

    $("#prepend_inbound_name_enable").change(function(ev) {
        var prependEle = $("#prepend_inbound_name");

        if(this.checked == true) {
           prependEle.show(); 
        } else {
            prependEle.hide();
        }
        top.dialog.repositionDialog();
    });

    $('#destination_type').bind("change", function(ev) {
        if (UCMGUI.config.safari &&
            ($('#trunk_index option:selected').attr('technology') == 'Analog') &&
            (this.selectedIndex === 0)) {

            this.selectedIndex = -1;

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        }

        var value = $(this).val(),
            option = '';

        if (value == "byDID") {
            $(".dial_trunk_div, .DID_destination_div, .localext_byDid").show();
            isDialTrunkDivShow = true;
            $(".selectDivValue, #destination_value_nu").hide();

            $('#trunk_index').find('[technology="Analog"]').attr({
                'disabled': true
            });
        } else {
            if (value == "external_number") {
                $(".selectDivValue, .localext_byDid").hide();
                $("#destination_value_nu").show();
            } else {
                $("#destination_value_nu, .localext_byDid").hide();

                if (value) {
                    $("#destination_value").empty().append(setDestinationOptions(value));

                    $(".selectDivValue").show();

                } else {
                    $("#destination_value").empty();

                    $(".selectDivValue").hide();

                    this.selectedIndex = -1;
                }

                top.Custom.init(doc, $('#destination_value')[0]);
            }

            // checkout if the value of other destinations(except itself) is ByDID?
            var otherMode = $('#nav_settings > li:not(".current") > a').attr('id'),
                otherModeDestination = destinationMode[otherMode],
                defaultDestinationHasDID = (otherModeDestination.destination_type === 'byDID');

            if (checkIfOtherDestinationHasByDID(this) || defaultDestinationHasDID || checkIfCustomTimeHasByDID()) {
                $(".dial_trunk_div, .DID_destination_div").show();
                isDialTrunkDivShow = true;

                $('#trunk_index').find('[technology="Analog"]').attr({
                    'disabled': true
                });
            } else {
                $(".dial_trunk_div, .DID_destination_div").hide();
                isDialTrunkDivShow = false;

                $('#trunk_index').find('[technology="Analog"]').attr({
                    'disabled': false
                });
            }
        }

        $("#dial_trunk").trigger("change");

        top.dialog.repositionDialog();

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#new_itrl_tc_dest').bind("change", function(ev) {
        if (UCMGUI.config.safari &&
            ($('#trunk_index option:selected').attr('technology') == 'Analog') &&
            (this.selectedIndex === 0)) {

            this.selectedIndex = -1;

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        }

        var value = $('option:selected', this).val(),
            option = '';

        if (value == "byDID") {
            $(".dial_trunk_div, .DID_destination_div, .tc_byDid").show();
            isDialTrunkDivShow = true;
            $(".newSelectDivValue, #new_itrl_tc_dest_val_nu").hide();

            $('#trunk_index').find('[technology="Analog"]').attr({
                'disabled': true
            });
        } else {
            if (value == "external_number") {
                $(".tc_byDid, .newSelectDivValue").hide();
                $("#new_itrl_tc_dest_val_nu").show();
            } else {
                $(".tc_byDid, #new_itrl_tc_dest_val_nu").hide();

                $("#new_itrl_tc_dest_val").empty().append(setDestinationOptions(value));

                $(".newSelectDivValue").show();

                top.Custom.init(doc, $('#new_itrl_tc_dest_val')[0]);
            }

            // checkout if the value of other destinations(except itself) is ByDID or custom time has byDID?
            var otherMode = $('#nav_settings > li:not(".current") > a').attr('id'),
                otherModeDestination = destinationMode[otherMode],
                defaultDestinationHasDID = (otherModeDestination.destination_type === 'byDID');

            if (checkIfOtherDestinationHasByDID(this) || defaultDestinationHasDID || checkIfCustomTimeHasByDID()) {
                $(".dial_trunk_div, .DID_destination_div").show();
                isDialTrunkDivShow = true;

                $('#trunk_index').find('[technology="Analog"]').attr({
                    'disabled': true
                });
            } else {
                $(".dial_trunk_div, .DID_destination_div").hide();
                isDialTrunkDivShow = false;

                $('#trunk_index').find('[technology="Analog"]').attr({
                    'disabled': false
                });
            }
        }

        $("#dial_trunk").trigger("change");

        top.dialog.repositionDialog();

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#alertinfo').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        if (value == "custom") {
            $("#customAlertDiv").removeClass('custom-alert');

            top.dialog.repositionDialog();
        } else {
            $("#customAlertDiv").addClass('custom-alert');

            top.dialog.repositionDialog();
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#office').bind("change", function(ev) {
        var value = $('option:selected', this).val(),
            hasOfficeTime = (mWindow.officeTimeList.length > 0),
            hasHoliday = (mWindow.holidayList.length > 0);

        if (value == '6') {
            $('#specificTime').show();
            $('.timecondition-tips').hide();
        } else {
            var text = '';

            $('#specificTime').hide();

            if (value == '1' || value == '2') {
                if (!hasOfficeTime) {
                    text = generateTimeConditionTips('officeTime');

                    $('.timecondition-tips').html(text).css({
                        'display': 'block'
                    });
                } else {
                    $('.timecondition-tips').hide();
                }
            } else if (value == '3' || value == '4') {
                if (!hasHoliday) {
                    text = generateTimeConditionTips('holiday');

                    $('.timecondition-tips').html(text).css({
                        'display': 'block'
                    });
                } else {
                    $('.timecondition-tips').hide();
                }
            } else {
                if (!(hasOfficeTime || hasHoliday)) {
                    if (!hasOfficeTime && !hasHoliday) {
                        text = generateTimeConditionTips('all');
                    } else if (!hasOfficeTime) {
                        text = generateTimeConditionTips('officeTime');
                    } else if (!hasHoliday) {
                        text = generateTimeConditionTips('holiday');
                    }

                    $('.timecondition-tips').html(text).css({
                        'display': 'block'
                    })
                } else {
                    $('.timecondition-tips').hide();
                }
            }
        }

        if (window.frameElement) {
            $(window.frameElement).css("height", "500px");
        }

        top.dialog.repositionDialog();
    });

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
            $(window.frameElement).css("height", "500px");
        }

        top.dialog.repositionDialog();
    });

    $('#en_multi_mode').bind("click", function(ev) {
        if ($(this).is(':checked')) {
            $('#li_last').removeClass('disabled');
        } else {
            $('#li_last').removeClass('current').addClass('disabled');

            $('#defaultMode').trigger('click');
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });

    $('#nav_settings').delegate('a', 'click', function(ev) {
        var id = $(this).attr('id'),
            parent = $(this).parent(),
            parentHasCurrentClass = parent.hasClass('current'),
            parentHasDisabledClass = parent.hasClass('disabled');

        if (parentHasDisabledClass || parentHasCurrentClass) {
            return;
        }

        if (!$P("#form", doc).valid()) {
            $("input[titles], select[titles], textarea[titles]").focus();

            return;
        }

        parent.addClass("current").siblings().removeClass("current");

        
        var prevID = $('#nav_settings > li:not(".current") > a').attr('id');

        getDestinationModeValue(prevID);

        setDestinationModeValue(id);


        var dialogCommands = top.dialog.dialogCommands;

        if (dialogCommands.is(":hidden")) {
            dialogCommands.show();
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();


        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
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
        datactol.clicked = false;

        $('.day_selected_pending').attr('class', 'day_selected');
        $('.day_unselected_pending').attr('class', 'day_unselected');
        $('#new_itrl_day_container').undelegate('td', 'mouseover', dayMouseEnter);
        $('#new_itrl_day_container').css('cursor', 'auto');

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        // return false;
    });

    var week_all = $('#new_itrl_week_all'),
        month_all = $('#new_itrl_month_all'),
        DID_all = $('#ext_all'),
        chk_week = $(".chk_week"),
        chk_month = $(".chk_month"),
        chk_DID = $(".check-DID");

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

    DID_all.bind("click", function(ev) {
        var DID_chkbox_all = function(value) {
            var children = $('.DID_destination_div').children().find("input");

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

        var all = $('#ext_all')[0];

        if (all.checked) {
            DID_chkbox_all(true);
        } else {
            DID_chkbox_all(false);
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

    chk_DID.bind("click", function(ev) {
        if (chk_DID.filter(":checked").length != chk_DID.length) {
            DID_all[0].checked = false;
            DID_all.prev().css("backgroundPosition", "0px 0px");
        } else {
            DID_all[0].checked = true;
            DID_all.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });
}

function getDestinationModeValue(id) {
    var data = destinationMode[id];

    for (var item in data) {
        if (data.hasOwnProperty(item)) {
            data[item] = '';
        }
    }

    var destinationType = $('#destination_type').val(),
        didStrip = $('#did_strip').val();

    data.destination_type = destinationType ? destinationType : '';

    data.did_strip = didStrip ? didStrip : '0';

    if (data.destination_type && data.destination_type !== 'byDID' && data.destination_type !== 'external_number') {
        data[data.destination_type] = $('#destination_value').val();
        data.did_strip = '0';
    } else if (data.destination_type === 'external_number') {
        data.external_number = $('#destination_value_nu').val();
    }

    data.incoming_prepend = $('#incoming_prepend').val();

    data.timecondition = [];

    for (var i = 0, length = OrderTable.lists.length; i < length; i++) {
        data.timecondition.push(OrderTable.lists[i]);
    }

}

function setDestinationModeValue(id) {
    var data = destinationMode[id];

    // Initialize Timecondition Data 
    OrderTable.newCell = [];

    OrderTable.operater_switch = true;

    OrderTable.click_val = null;

    OrderTable.lists = [];

    for (var i = 0, length = data.timecondition.length; i < length; i++) {
        OrderTable.lists.push(data.timecondition[i]);
    }

    $('#table_edit_template').appendTo($('#table_template_placeholder'));

    OrderTable.refresh_timecondition();


    // Set Destination Value
    $("#destination_type").val(data.destination_type);
    $("#did_strip").val(data.did_strip === '' ? '0' : data.did_strip);
    // $("#did_strip").val(data.did_strip === '0' ? '' : data.did_strip);
    $("#incoming_prepend").val(data.incoming_prepend);

    $("#destination_type").trigger('change');

    if (data.destination_type !== 'byDID' && data.destination_type !== 'external_number') {
        $("#destination_value").val(data[data.destination_type]);
    } else if (data.destination_type === 'external_number') {
        $("#destination_value_nu").val(data[data.destination_type]);
    }

    top.Custom.init(doc, $('#defaultDestination')[0]);


    // Reposition Dialog
    top.dialog.dialogCommands.show();

    if (window.frameElement) {
        $(window.frameElement).css("height", "500px");
    }

    top.dialog.currentDialogType = "iframe";

    top.dialog.repositionDialog();
}

function checkIfOtherDestinationHasByDID(exceptElement) {
    var existed = false,
        selects = $('#destination_type, #new_itrl_tc_dest').not(exceptElement);

    // Fixed display error in Firefox.
    if ($('#destination_type').val() == 'byDID') {
        existed = true;
    }

    selects.each(function() {
        if (!$(this).is(':hidden') && $(this).val() == 'byDID') {
            existed = true;
            return false;
        }
    });

    return existed;
}

function checkIfCustomTimeHasByDID() {
    var existed = false,
        customTimelist = OrderTable.lists,
        otherMode = $('#nav_settings > li:not(".current") > a').attr('id'),
        otherModeCustomTimelist = destinationMode[otherMode].timecondition;

    if (OrderTable.operater_switch == 'edit') {
        $.each(customTimelist, function(index, data) {
            if ((data.destination_type == 'byDID') && (data.index != OrderTable.click_val)) {
                existed = true;
                return false;
            }
        });
    } else {
        $.each(customTimelist, function(index, data) {
            if (data.destination_type == 'byDID') {
                existed = true;
                return false;
            }
        });
    }

    $.each(otherModeCustomTimelist, function(index, data) {
        if (data.destination_type == 'byDID') {
            existed = true;
            return false;
        }
    });

    return existed;
}

function checkIfOtherDestinationHasExternal(exceptElement) {
    var existed = false,
        selects = $('#destination_type, #new_itrl_tc_dest').not(exceptElement);

    // Fixed display error in Firefox.
    if ($('#destination_type').val() == 'external_number') {
        existed = true;
    }

    selects.each(function() {
        if (!$(this).is(':hidden') && $(this).val() == 'external_number') {
            existed = true;
            return false;
        }
    });

    return existed;
}

function checkIfCustomTimeHasExternal() {
    var existed = false,
        customTimelist = OrderTable.lists;

    if (OrderTable.operater_switch == 'edit') {
        $.each(customTimelist, function(index, data) {
            if ((data.destination_type == 'external_number') && (data.index != OrderTable.click_val)) {
                existed = true;
                return false;
            }
        });
    } else {
        $.each(customTimelist, function(index, data) {
            if (data.destination_type == 'external_number') {
                existed = true;
                return false;
            }
        });
    }

    return existed;
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

function check_pattern_format(value, element) {
    var str = value.split('\n');

    for (var i = 0; i < str.length; i++) {
        if (/^_$/.test(str[i]) || /(\[.*?(\.|\!).*?\])|(\[\])/g.test(str[i]) || /\//.test(str[i])) {
            return false;
        }
    }

    return true;
}

function check_pattern(value, element) {
    var bool = true;
    var edit_itrl_pattern_val = $("#did_pattern_match").val();
    var edit_did_pattern_val = $("#did_pattern_allow").val();

    if (!/^_/.test(value)) {
        value = '_' + value;
    }

    var trunk = $('#trunk_index')[0].value;

    if (!trunk) {
        return true;
    }

    var idx = trunk.match(/^trunk_([1-9][0-9]*)/)[1];
    var rules = parent.sessionData.pbxinfo.incomingrules['ext-did-' + idx];

    if (OLDPATTERN) {
        var oldpattern_itrl = OLDPATTERN.split("/")[0];
        var oldpattern_did = OLDPATTERN.split("/")[1];

        if (!/^_/.test(oldpattern_did)) {
            oldpattern_did = '_' + oldpattern_did;
        }

        if (element.id == "did_pattern_match") {
            bool = (value != oldpattern_did);
        }

        if (element.id == "did_pattern_match") {
            bool = (value != oldpattern_itrl);
        };
    }

    if (rules && bool) {
        for (var k = 0; k < rules.length; ++k) {
            // added '/' in the pattern for incoming CallerID Identification
            var pattern = rules[k].match(/^exten=([_0-9a-zA-Z!\[\]\-\.\?\+\*\#\/_]+),.*/)[1];

            // var pattern = rules[k].match(/^exten=(_[0-9a-zA-Z!\[\]\-\.\?\+\*\#]+),.*/)[1];
            var pattern_itrl = pattern.split("/")[0];
            var pattern_did = pattern.split("/")[1];

            if (!/^_/.test(edit_itrl_pattern_val)) {
                edit_itrl_pattern_val = '_' + edit_itrl_pattern_val;
            }

            if (pattern_itrl == edit_itrl_pattern_val && edit_did_pattern_val && pattern_did == edit_did_pattern_val) {
                return false;
            }
        }
    }

    return true;
}

function check_pattern_with_cid(value, element) {
    var str = value.split('\n'),
        res = false;

    for (var i = 0; i < str.length; i++) {
        if (!/^_/.test(str[i])) {
            str[i] = '_' + str[i];
        }

        if (/^_[0-9a-zA-Z!\[\]\-\.\?\+\*\#]+[0-9]+$/.test(str[i])) {
            res = true;
        } else if (!/\//.test(str[i])) {
            res = true;
        } else {
            return false;
        }
    }

    return res;
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

function checkIfDidEmpty(val, ele) {
    var bSelected = false;

    if ($('.DID_destination_div').is(':visible')) { // If one of all the destinations you configured is byDID
        $('.check-DID').each(function() {
            if (this.checked) {
                bSelected = true;
                return false;
            }
        });

        return bSelected;
    }

    return true;
}

// function check_dest_val(value, element) {
//     var idx = $('#destination_type').val();
//     var name = DESTINATION_LIST[parseInt(idx)];

//     if (value == name + ' number')
//         return false;

//     return true;
// }

// function check_tc_dest_val(value, element) {
//     var idx = $('#new_itrl_tc_dest').val();
//     var name = DESTINATION_LIST[parseInt(idx)];

//     if (value == name + ' number')
//         return false;

//     return true;
// }

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

function transAccountData(res, cb) {
    var ary = [];

    for (var i = 0; i < res.length; i++) {
        var extension = res[i].extension;

        ary.push(extension);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return ary;
}

function transExtensionData(res, cb) {
    var arr = [];

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

function getInboundRouteValue() {
    // Load Multi Mode Data
    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        data: {
            "action": "listInboundRouteExtra",
            "inbound_route": inboundRouteIndex
        },
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
                var multiMode = data.response.inbound_route_extra;

                for (var item in destinationMode['mode1']) {
                    if (destinationMode['mode1'].hasOwnProperty(item) && (item !== 'timecondition')) {
                        if (multiMode.length && multiMode[0][item] !== null) {
                            destinationMode['mode1'][item] = multiMode[0][item];
                        }
                    }
                }
            }
        }
    });

    var action = {},
        params = ["trunk_index", "did_pattern_match", "did_pattern_allow", "en_multi_mode",
            "destination_type", "prepend_trunk_name", "prepend_inbound_name_enable", "prepend_inbound_name", "account", "voicemail", "conference",
            "vmgroup", "ivr", "ringgroup", "queue", "paginggroup", "fax", "disa", "directory",
            "external_number", "callback", "did_strip", "permission", "dial_trunk", "ext_local",
            "ext_fax", "voicemailgroups", "voicemenus", "ext_conference", "ext_queues", "ext_group",
            "ext_paging", "ext_directory", "alertinfo", "incoming_prepend", "out_of_service", 'seamless_transfer_did_whitelist'
        ],
        paramLength = params.length;

    // action = UCMGUI.formSerialize(doc);
    action["action"] = "getInboundRoute";
    action["inbound_route"] = inboundRouteIndex;

    for (var i = 0; i < paramLength; i++) {
        action[params[i]] = '';
    }

    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
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
                var inbound_routes = data.response.inbound_routes,
                    inbound_did_destination = data.response.inbound_did_destination,
                    did_pattern_match = (inbound_routes.did_pattern_match ? inbound_routes.did_pattern_match : ""),
                    did_pattern_allow = (inbound_routes.did_pattern_allow ? inbound_routes.did_pattern_allow : "");

                UCMGUI.domFunction.updateDocument(inbound_did_destination, doc);

                for (var item in destinationMode['defaultMode']) {
                    if (destinationMode['defaultMode'].hasOwnProperty(item) && (item !== 'timecondition')) {
                        destinationMode['defaultMode'][item] = inbound_routes[item];
                    }
                }

                $('#trunk_index').val(inbound_routes.trunk_index);

                var trunkType = $('#trunk_index').find('option[value="' + inbound_routes.trunk_index + '"]').attr('technology');

                if (trunkType == "Analog") {
                    $(".dial_trunk_div, .DID_destination_div").hide();
                    isDialTrunkDivShow = false;
                    $("#did_pattern_match").val(did_pattern_match).attr('disabled', 'disabled');
                    $('body').find('[value="byDID"]').attr({
                        'disabled': true
                    });
                } else {
                    $("#did_pattern_match").val(did_pattern_match.split(',').join('\n'));
                    $('body').find('[value="byDID"]').attr({
                        'disabled': false
                    });
                }

                $("#did_pattern_allow").val(did_pattern_allow.split(',').join('\n'));
                $("#out_of_service").attr('checked', (inbound_routes.out_of_service == 'yes' ? true : false));
                $("#prepend_trunk_name").attr('checked', (inbound_routes.prepend_trunk_name == 'yes' ? true : false));
                $("#prepend_inbound_name").val(inbound_routes.prepend_inbound_name);
                $("#prepend_inbound_name_enable").attr('checked', (inbound_routes.prepend_inbound_name_enable == 'yes' ? true : false));

                $("#prepend_inbound_name_enable").trigger("change");

                if (inbound_routes.en_multi_mode === 'yes') {
                    $("#en_multi_mode").attr('checked', true);

                    $('#li_last').removeClass('disabled');
                } else {
                    $("#en_multi_mode").attr('checked', false);
                }

                $("#destination_type").val(inbound_routes.destination_type);
                $("#did_strip").val(inbound_routes.did_strip);
                $("#incoming_prepend").val(inbound_routes.incoming_prepend);
                $("#permission").val(inbound_routes.permission);
                $("#destination_type").trigger('change');

                if (inbound_routes.destination_type != 'byDID' && inbound_routes.destination_type != 'external_number') {
                    $("#destination_value").val(inbound_routes[inbound_routes.destination_type]);
                } else if (inbound_routes.destination_type == 'external_number') {
                    $("#destination_value_nu").val(inbound_routes[inbound_routes.destination_type]);
                }

                var alertInfo = (inbound_routes.alertinfo ? inbound_routes.alertinfo : ""),
                    chk_DID = $(".check-DID");

                if (alertInfo.indexOf('custom_') > -1) {
                    $("#alertinfo").val('custom').trigger('change');

                    $("#custom_alert_info").val(alertInfo.slice(7));
                } else {
                    $("#alertinfo").val(alertInfo);
                }

                if (chk_DID.filter(":checked").length == chk_DID.length) {
                    $('#ext_all')[0].checked = true;
                }

                $('#dial_trunk').trigger("change");
                $('#prepend_trunk_name').trigger("change");

                var existExtentionList = transAccountData(accountList),
                    seamless_tmpGroupExt = [],
                    seamless_membersArr = inbound_routes.seamless_transfer_did_whitelist ? inbound_routes.seamless_transfer_did_whitelist.split(",") : [];

                seamless_tmpGroupExt = Array.prototype.copy.call(existExtentionList, seamless_tmpGroupExt);
                seamless_tmpGroupExt.remove(seamless_membersArr);

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
            }
        }
    });

    // Load Time Condition Data
    $.ajax({
        url: '../cgi',
        type: "POST",
        dataType: "json",
        data: {
            "action": "listInboundTimeCondition",
            "inbound_route": inboundRouteIndex,
            "page": 1,
            "item_num": 1000000,
            "sidx": "sequence",
            "options": "condition_index,inbound_mode,timetype,sequence,start_hour,start_min,end_hour,end_min,mode,week_day,month,day,destination_type,account,voicemail,conference,vmgroup,ivr,ringgroup,queue,paginggroup,fax,disa,did_strip,directory,external_number,callback,timecondition_prepend"
        },
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
                var time_condition = data.response.time_condition,
                    translateTime = time_condition.sortBy('sequence'),
                    translateTimeLength = translateTime.length,
                    DIDDestination = $(".DID_destination_div"),
                    DIDDestinationHidden = DIDDestination.is(':hidden'),
                    dialTrunk = $(".dial_trunk_div"),
                    dialTrunkHidden = dialTrunk.is(':hidden'),
                    ary = [],
                    i = 0;

                for (i; i < translateTimeLength; i++) {
                    if (translateTime[i].timetype) {
                        var obj = translateTime[i];

                        obj.index = i;

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

                        if (obj.destination_type == 'byDID' && DIDDestinationHidden) {
                            DIDDestination.show();
                        }

                        if (obj.destination_type == 'byDID' && dialTrunkHidden) {
                            dialTrunk.show();

                            $("#dial_trunk").trigger("change");
                        }

                        ary.push(obj);

                        destinationMode[(obj.inbound_mode == 1 ? 'mode1' : 'defaultMode')].timecondition.push(obj);
                    }
                }

                OrderTable.lists = [];

                for (var i = 0, length = destinationMode['defaultMode'].timecondition.length; i < length; i++) {
                    OrderTable.lists.push(destinationMode['defaultMode'].timecondition[i]);
                }

                initTimeConditionTable();
            }
        }
    });

    top.dialog.repositionDialog();

    top.Custom.init(doc);
}

function getIndexName() {
    var length = 1000000,
        orderTableListsLength = OrderTable.lists.length,
        i = 0,
        j;

    for (i; i < length; i++) {
        var exist = false;

        for (j = 0; j < orderTableListsLength; j++) {
            if (i == OrderTable.lists[j]['index']) {
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
    OrderTable.max_timecondition = maxTimeCondition;
    OrderTable.refresh_timecondition();
    OrderTable.bind_event();
}

function initValidator() {
    $("#did_pattern_match").bind("blur", function() {
        $P("#did_pattern_allow", doc).valid();
    });

    $("#did_pattern_allow").bind("blur", function() {
        $P("#did_pattern_match", doc).valid();
    });

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "trunk_index": {
                required: true
            },
            "did_pattern_match": {
                noEmptyLine: true,
                required: true,
                // startWithUnderline: true,
                customCallback3: [$P.lang('LANG2139'), check_pattern_format],
                dialpattern: ['dial pattern'],
                dialpattern_additional: ['dial pattern'],
                // customCallback1: ["An incoming rule already exists for this pattern in the selected Trunk", check_pattern],
                customCallback2: ["Invalid format! The format of CID Identification should be numbers.", check_pattern_with_cid],
                differentPatterns: ['\n']
            },
            "did_pattern_allow": {
                noEmptyLine: true,
                // required: true,
                // startWithUnderline: true,
                customCallback3: [$P.lang('LANG2139'), check_pattern_format],
                dialpattern: ['dial pattern'],
                dialpattern_additional: ['dial pattern'],
                // customCallback1: ["An incoming rule already exists for this pattern in the selected Trunk", check_pattern],
                customCallback2: ["Invalid format! The format of CID Identification should be numbers.", check_pattern_with_cid],
                differentPatterns: ['\n']
            },
            "destination_type": {
                required: function() {
                    if ($('#defaultMode').parent().hasClass('current') ||
                        ($('#en_multi_mode').is(':checked') && $('#mode1').parent().hasClass('current'))) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            "destination_value": {
                // customCallback: ["The Number doesn't exist, please check it", check_dest_val]
                required: true
            },
            "did_strip": {
                digits: true,
                stripMax: ['pattern length', $('#did_pattern_match'), $('#incoming_prepend')]
            },
            "incoming_prepend": {
                phoneNumberOrExtension: true
            },
            "prepend_inbound_name": {
                required: true,
                letterDigitUndHyphen: true
            },
            "ext_local": {
                customCallback: [$P.lang('LANG4272'), checkIfDidEmpty]
            },
            "new_itrl_tc_dest": {
                required: true
            },
            "new_itrl_tc_dest_val": {
                // customCallback: ["The Number doesn't exist, please check it", check_tc_dest_val]
                required: true
            },
            "new_itrl_tc_digits": {
                digits: true,
                stripMax: ['pattern length', $('#did_pattern_match'), $('#new_itrl_tc_prepend')]
            },
            "new_itrl_tc_prepend": {
                phoneNumberOrExtension: true
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
            "permission": {
                required: true
            },
            "custom_alert_info": {
                required: true,
                alphanumeric: true
            },
            "external_number_1": {
                required: true,
                phoneNumberOrExtension: true
            },
            "external_number_2": {
                required: true,
                phoneNumberOrExtension: true
            },
            "external_number_3": {
                required: true,
                phoneNumberOrExtension: true
            }
        },
        submitHandler: function() {
            var target = this.submitButton;

            if (target.id !== 'save') {
                return false;
            } else {
                var levelVal = $("#permission").val(),
                    multiMode = $('#en_multi_mode').is(':checked'),
                    modeID = $('#nav_settings > li.current > a').attr('id'),
                    content = '';
                
                if (modeID === 'defaultMode') {
                    if (multiMode && !destinationMode['mode1'].destination_type) {
                        content = 'LANG4293';
                    }
                } else {
                    if (!destinationMode['defaultMode'].destination_type) {
                        content = 'LANG4292';
                    }
                }

                if (content) {
                    top.dialog.dialogMessage({
                        type: 'warning',
                        content: top.$.lang(content),
                        callback: function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        }
                    });

                    return;
                }

                if ($("#permission").is(":visible") && levelVal && levelVal != "internal") {
                    top.dialog.dialogConfirm({
                        type: "warning",
                        confirmStr: $P.lang("LANG2537").format($P.lang("LANG1071"), $P.lang("LANG658")),
                        buttons: {
                            ok: function() {
                                updateInboundRule(modeID);
                            },
                            cancel: function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            }
                        }
                    });
                } else {
                    updateInboundRule(modeID);
                }
            }
        }
    });
}

function setTrunkList() {
    var trunkIndexElement = $("#trunk_index");

    $.each(trunkList, function(item, data) {
        var option, hasClass,
            text = "",
            value = data.trunk_index,
            technology = data.technology,
            name = data.trunk_name,
            disabled = (data.out_of_service && data.out_of_service == 'yes'),
            isSLA = ifExisted(name, slaTrunkNameList);

        // Pengcheng Zou Added. locale="{0}{1}{2}{3}" or locale="{0}{1}{2}{3}{4}{5}"
        // locale = (disabled || isSLA) ? 'LANG564' : 'LANG2696';

        if (technology == 'Analog') {
            text += $P.lang('LANG105');
        } else if (technology == 'SIP') {
            text += $P.lang('LANG108');
        } else if (technology == 'IAX') {
            text += $P.lang('LANG107');
        } else if (technology == 'BRI') {
            text += $P.lang('LANG2835');
        } else if (technology == 'PRI' || technology == 'SS7' || technology == 'MFC/R2' || technology == 'EM' || technology == 'EM_W') {
            text += technology;
        }

        text += $P.lang('LANG83') + " -- " + name;

        if (disabled) {
            text += $P.lang('LANG273');
        } else if (isSLA) {
            text += $P.lang('LANG3218');
        }

        hasClass = (disabled || isSLA) ? ' class="disabledExtOrTrunk"' : '';

        option = '<option technology="' + technology +
            '" value="' + value + '"' + hasClass + '>' + text + '</option>';

        trunkOption += option;
    });

    trunkIndexElement.append(trunkOption);
    trunkIndexElement[0].selectedIndex = -1;
}

function isDisplayPrilevel() {
    $("#dial_trunk").change(function(ev) {
        var prilevelDiv = $("#edit_itrl_prilevel");

        if ($(this).is(":checked") && isDialTrunkDivShow) {
            prilevelDiv.css('display', 'block');
        } else {
            prilevelDiv.hide();
        }

        ev.stopPropagation();
    });
}

function setDestinationList() {
    $.each(destinationType, function(item, data) {
        var destinationOption = '',
            destinationTypeElement = $("#destination_type"),
            newItrlTcDestElement = $("#new_itrl_tc_dest");

        destinationOption += '<option value="' + data + '">' + $P.lang(destinationTypeText[item]) + "</option>";

        destinationTypeElement.append(destinationOption);
        destinationTypeElement[0].selectedIndex = -1;

        newItrlTcDestElement.append(destinationOption);
        newItrlTcDestElement[0].selectedIndex = -1;
    });
}

function setDestinationOptions(type) {
    var options = '';

    switch (type) {
        case 'account':
        case 'voicemail':
            $.each(destinationTypeValue[type], function(item, value) {
                var extension = value.extension,
                    fullname = value.fullname,
                    disabled = value.out_of_service;

                if (disabled == 'yes') {
                    options += "<option class='disabledExtOrTrunk' value='" + extension + "'>" +
                        extension + (fullname ? ' "' + fullname + '"' : '') + ' &lt;' + $P.lang('LANG273') + '&gt;' + "</option>";
                } else {
                    options += "<option value='" + extension + "'>" + extension + (fullname ? ' "' + fullname + '"' : '') + "</option>";
                }
            });
            break;
        case 'conference':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value + "'>" + value + "</option>";
            });
            break;
        case 'queue':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.extension + "'>" + value.queue_name + "</option>";
            });
            break;
        case 'ringgroup':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.extension + "'>" + value.ringgroup_name + "</option>";
            });
            break;
        case 'paginggroup':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.extension + "'>" + value.paginggroup_name + "</option>";
            });
            break;
        case 'vmgroup':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.extension + "'>" + value.vmgroup_name + "</option>";
            });
            break;
        case 'fax':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.extension + "'>" + value.fax_name + "</option>";
            });
            break;
        case 'disa':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.disa_id + "'>" + value.display_name + "</option>";
            });
            break;
        case 'ivr':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.ivr_id + "'>" + value.ivr_name + "</option>";
            });
            break;
        case 'directory':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.extension + "'>" + value.name + "</option>";
            });
            break;
        case 'external_number':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.external_number + "'>" + "</option>";
            });
        case 'callback':
            $.each(destinationTypeValue[type], function(item, value) {
                options += "<option value='" + value.callback_id + "'>" + value.name + "</option>";
            });
        default:
            break;
    }

    return options;
}

function timeConditionHasDID() {
    if (OrderTable.lists.length <= 0) {
        return false;
    }

    var hasDID = false;

    for (var i = 0, length = OrderTable.lists.length; i < length; i++) {
        if (OrderTable.lists[i].destination_type == 'byDID') {
            hasDID = true;
            break;
        }
    }

    return hasDID;
}

function updateInboundRule(modeID) {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang('LANG826')
    });

    var params = ['did_pattern_match', 'did_pattern_allow', 'permission', 'alertinfo', "prepend_inbound_name"],
        checkboxParams = ['en_multi_mode', 'prepend_trunk_name', 'dial_trunk',
            'ext_local', 'ext_conference', 'ext_queues', 'ext_group', 'ext_paging',
            'voicemenus', 'voicemailgroups', 'ext_fax', 'ext_directory', 'prepend_inbound_name_enable', 'out_of_service'
        ],
        action = {
            'multi_mode': []
        },
        tc = [],
        i = 0,
        length;

    if (addOrEdit == 'edit') {
        action["action"] = "updateInboundRoute";
        action["inbound_route"] = inboundRouteIndex;
    } else {
        action["action"] = "addInboundRoute";
        action["trunk_index"] = $('#trunk_index').val();
    }

    for (i = 0, length = params.length; i < length; i++) {
        var elementValue = $('#' + params[i]).val();

        if (params[i] == 'did_pattern_match') {
            var matchAry = elementValue.split('\n'),
                trueMatch = [];

            for (var j = 0; j < matchAry.length; j++) {
                if (!matchAry[j]) {
                    continue;
                } else {
                    trueMatch.push((matchAry[j][0] !== '_') ? '_' + matchAry[j] : matchAry[j]);
                }
            }

            elementValue = trueMatch.toString();
        } else if (params[i] == 'did_pattern_allow') {
            var allowAry = elementValue.split('\n'),
                trueAllow = [];

            for (var j = 0; j < allowAry.length; j++) {
                if (!allowAry[j]) {
                    continue;
                } else {
                    trueAllow.push((allowAry[j][0] !== '_') ? '_' + allowAry[j] : allowAry[j]);
                }
            }

            elementValue = trueAllow.toString();
        } else if (params[i] == 'alertinfo') {
            elementValue = (elementValue == 'custom') ? ('custom_' + $("#custom_alert_info").val()) : elementValue;
        }

        action[params[i]] = elementValue;
    }

    for (i = 0, length = checkboxParams.length; i < length; i++) {
        action[checkboxParams[i]] = $('#' + checkboxParams[i])[0].checked ? 'yes' : 'no';
    }

    if ($("#prepend_trunk_name")[0].checked) {
        action["prepend_inbound_name_enable"] = "no";
        action["prepend_inbound_name"] = "";
    }

    getDestinationModeValue(modeID);

    for (var mode in destinationMode) {
        if (destinationMode.hasOwnProperty(mode)) {
            var isDefault = (mode === 'defaultMode');

            for (i = 0, length = destinationMode[mode].timecondition.length; i < length; i++) {
                destinationMode[mode].timecondition[i].inbound_mode = (isDefault ? 0 : 1);

                tc.push(destinationMode[mode].timecondition[i]);
            }

            if (!isDefault) {
                var ary = [{
                    'mode': 1
                }];

                for (var item in destinationMode[mode]) {
                    if (destinationMode[mode].hasOwnProperty(item) && (item !== 'timecondition')) {
                        ary[0][item] = destinationMode[mode][item];
                    }
                }

                if (ary[0].destination_type) {
                    action['multi_mode'] = JSON.stringify(ary);
                } else {
                    action['multi_mode'] = JSON.stringify([]);
                }
            } else {
                for (var item in destinationMode[mode]) {
                    if (destinationMode[mode].hasOwnProperty(item) && (item !== 'timecondition')) {
                        action[item] = destinationMode[mode][item];
                    }
                }
            }
        }
    }

    var tcLength = tc.length;

    if (tcLength) {
        for (i = 0; i < tcLength; i++) {
            tc[i].sequence = i + 1;

            delete tc[i]['condition_index'];
            delete tc[i]['index'];
            delete tc[i]['time'];
        }
    }
    //  else {
    //     tc.push({
    //         'inbound_mode': 0,
    //         'account': "",
    //         'conference': "",
    //         'day': "*",
    //         'destination_type': 'account',
    //         'did_strip': '0',
    //         'timecondition_prepend': "",
    //         'directory': "",
    //         'external_number': "",
    //         'disa': "",
    //         'end_hour': '23',
    //         'end_min': '59',
    //         'fax': "",
    //         'ivr': "",
    //         'mode': "byWeek",
    //         'month': "*",
    //         'paginggroup': "",
    //         'queue': "",
    //         'ringgroup': "",
    //         'sequence': 1,
    //         'start_hour': '00',
    //         'start_min': '00',
    //         'timetype': 0,
    //         'vmgroup': "",
    //         'voicemail': "",
    //         'week_day': "*"
    //     });
    // }

    action['time_condition'] = JSON.stringify(tc);

    var seamless_members = [];
    $.each($("#seamless_rightSelect").children(), function(index, item) {
        seamless_members.push($(item).val());
    });

    if (seamless_members.length != 0) {
        action["seamless_transfer_did_whitelist"] = seamless_members.toString();
    } else {
        action["seamless_transfer_did_whitelist"] = "";
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
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {

                // top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });

                var DO_RELOAD = function() { // DO_RELOAD();
                    var mainScreen = top.frames['frameContainer'].frames['mainScreen'],
                        currentTrunkIndex = action["trunk_index"],
                        trunkElement = mainScreen.$("#trunkList", mainScreen.document),
                        lastTrunk = trunkElement.val();

                    // update outboundRouteList, trunkList
                    mWindow.updateLists();

                    if ((addOrEdit == 'add') && (currentTrunkIndex != lastTrunk)) {
                        trunkElement.val(currentTrunkIndex);
                        mWindow.loadIncomingRulesList(currentTrunkIndex);
                        top.Custom.init(mainScreen.document);
                    } else {
                        mainScreen.$("#incomingRulesList", mainScreen.document).trigger('reloadGrid');
                    }
                };

                setTimeout(DO_RELOAD, 500);
            }
        }
    });
}

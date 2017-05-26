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
    gup = UCMGUI.gup,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    mode = gup.call(window, "mode"),
    item = gup.call(window, "item"),
    MonthList = "",
    DayList = "",
    WeekList = "",
    StartHour = "",
    EndHour = "",
    StartMin = "",
    EndMin = "",
    Advanced = "",
    datactol = {
        "clicked": false,
        "timeout": null
    };

Array.prototype.each = top.Array.prototype.each;
Array.prototype.sortBy = top.Array.prototype.sortBy;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;

$(function() {
    $P.lang(doc, true);

    append_time_value();

    bindEvent();

    initValidator();

    if (mode === 'edit') {
        var index = gup.call(window, "condition_index");

        editTimeCondition(index);

        if ($('#advanced').is(':checked')) {
            $('.local_month').show();
            $('.local_day').show();
        }
    } else if (mode == 'add') {
        top.Custom.init(doc);
    }
});

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
    $('#advanced').bind("click", function(ev) {
        if ($(this).is(':checked')) {
            $('.local_month').show();
            $('.local_day').show();
        } else {
            $('.local_month').hide();
            $('.local_day').hide();
        }

        // $('#new_itrl_day_container').hide();

        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();
    });

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

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;;
        return false;
    });

    $(doc).on('mouseup', function(ev) {
        datactol.clicked = false;

        $('.day_selected_pending').attr('class', 'day_selected');
        $('.day_unselected_pending').attr('class', 'day_unselected');
        $('#new_itrl_day_container').undelegate('td', 'mouseover', dayMouseEnter);
        $('#new_itrl_day_container').css('cursor', 'auto');

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;;
        // return false;
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

function date_add(container, key, el_id) {
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

function data_write() {
    var week = {
            value: ''
        },
        month = {
            value: ''
        },
        day = {
            value: ''
        };

    date_add(week, 'week', 'new_itrl_week_sun');
    date_add(week, 'week', 'new_itrl_week_mon');
    date_add(week, 'week', 'new_itrl_week_tue');
    date_add(week, 'week', 'new_itrl_week_wed');
    date_add(week, 'week', 'new_itrl_week_thu');
    date_add(week, 'week', 'new_itrl_week_fri');
    date_add(week, 'week', 'new_itrl_week_sat');

    WeekList = week.value;

    if ($('#advanced')[0].checked == false) {
        month.value = "*";
        day.value = "*";
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

    MonthList = month.value;
    DayList = day.value;

    if ($('#advanced')[0].checked == false) {
        Advanced = "byWeek";
    } else if ($('#advanced')[0].checked == true) {
        Advanced = "byDay";
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
}


function edit_time_condition_apply_work() {
    data_write();

    var action = {};

    action["user_id"] = "0";
    action["sequence"] = "0";

    if (mode == "edit") {
        action["action"] = "updateTimeConditionOfficeTime";
        action["time_conditions_officetime"] = gup.call(window, "condition_index");
    } else if (mode == "add") {
        action["action"] = "addTimeConditionOfficeTime";
    }

    action["start_hour"] = $('#new_itrl_stime_hour').val();
    action["start_min"] = $('#new_itrl_stime_minute').val();
    action["end_hour"] = $('#new_itrl_ftime_hour').val();
    action["end_min"] = $('#new_itrl_ftime_minute').val();
    action["month"] = MonthList;
    action["week_day"] = WeekList;
    action["day"] = DayList;
    action["mode"] = Advanced;

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
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815")
                });

                var DO_RELOAD = function() {
                    mWindow.$("#officetime-list", mWindow.document).trigger('reloadGrid');
                };

                setTimeout(DO_RELOAD, 500);
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
            "new_itrl_month_jan": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG244').toLowerCase()), check_month_required]
            },
            "new_itrl_week_sun": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG243').toLowerCase()), check_week_required]
            }
        },
        submitHandler: function() {
            var target = this.submitButton;

            if (check_week_required() && check_month_required() && $('#advanced').is(':checked')) {
                if (check_days_required()) {
                    edit_time_condition_apply_work();
                }

                // return;
            } else if ($('#advanced').is(':checked') == false && check_week_required()) {
                edit_time_condition_apply_work();
            }

        }
    });
}

function editTimeCondition(index) {
    var action = {
        "action": "getTimeConditionOfficeTime",
        "time_conditions_officetime": index
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
                var time_conditions_officetime = data.response.time_conditions_officetime,
                    monthStr = [],
                    dayStr = [],
                    weekStr = [];

                MonthList = time_conditions_officetime.month;
                DayList = time_conditions_officetime.day;
                WeekList = time_conditions_officetime.week_day;
                StartHour = addZero(time_conditions_officetime.start_hour);
                EndHour = addZero(time_conditions_officetime.end_hour);
                StartMin = addZero(time_conditions_officetime.start_min);
                EndMin = addZero(time_conditions_officetime.end_min);
                Advanced = time_conditions_officetime.mode;

                $('#advanced')[0].checked = Advanced == 'byDay' ? true : false;
                $('#new_itrl_stime_hour').val(StartHour);
                $('#new_itrl_stime_minute').val(StartMin);
                $('#new_itrl_ftime_hour').val(EndHour);
                $('#new_itrl_ftime_minute').val(EndMin);

                if (MonthList == "*") {

                } else {
                    monthStr = MonthList.split("&");

                    if (monthStr.length == 12) {
                        $("#new_itrl_month_all")[0].checked = true;
                    }
                    for (i = 0; i < monthStr.length; i++) {
                        var tmp = $("#new_itrl_month_" + monthStr[i]);

                        tmp[0].checked = true;
                    }
                }

                if (DayList == "*") {

                } else {
                    dayStr = DayList.split("&");

                    for (i = 0; i < dayStr.length; i++) {
                        var a = $('#day_' + dayStr[i]).attr('class', 'day_selected');
                    }
                }

                if (WeekList == "*") {

                } else {
                    weekStr = WeekList.split("&");

                    if (weekStr.length == 7) {
                        $("#new_itrl_week_all")[0].checked = true;
                    }

                    for (i = 0; i < weekStr.length; i++) {
                        var tmp = $("#new_itrl_week_" + weekStr[i]);

                        tmp[0].checked = true;
                    }
                }

                top.Custom.init(doc);
            }
        }
    });
}

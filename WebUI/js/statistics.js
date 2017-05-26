/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.betweenXY = top.String.prototype.betweenXY;
String.prototype.format = top.String.prototype.format;
String.prototype.isAstTrue = top.String.prototype.isAstTrue;
String.prototype.trim = top.String.prototype.trim;

if (!Array.indexOf) {
    Array.prototype.indexOf = function(obj) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }

        return -1;
    }
}

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    records_too_big = false,
    backend = "CDR-CSV",
    condition = "",
    intDest = [],
    intExt_str = "'conf','',",
    recordsOutbound = [],
    recordsInbound = [],
    recordsInternal = [],
    recordsExternal = [],
    recordsAll = [],
    data = [],
    period_cond = [],
    calltypeContainer = $("#calltype_choices"),
    periodContainer = $("#period_choices"),
    serviceContainer = $("#service_choices"),
    calltype_arr,
    period_key = "", // get which period option is selected;
    service_key = "",
    curr_date = new Date(),
    curr_year = curr_date.getFullYear(),
    curr_month = curr_date.getMonth() + 1,
    curr_month_str = (curr_month < 10) ? "0" + curr_month : curr_month,
    curr_day = curr_date.getDate(),
    curr_day_str = (curr_day < 10) ? "0" + curr_day : curr_day,
    period_focused = "";

var period_keys = ["monthly", "weekly", "daily", "hourly", "acc_hourly"],
    service_keys = ["all", "sip", "pstn", "digital", "iax"];

var calltype = {
    "inbound": {
        id: "inbound",
        checked: false,
        locale: "LANG193",
        label: $P.lang("LANG193"),
        datasource: recordsInbound
        // callback: ib_dataBindCallback
    },
    "outbound": {
        id: "outbound",
        checked: false,
        locale: "LANG194",
        label: $P.lang("LANG194"),
        datasource: recordsOutbound
        // callback: ob_dataBindCallback
    },
    "internal": {
        id: "internal",
        checked: false,
        locale: "LANG195",
        label: $P.lang("LANG195"),
        datasource: recordsInternal
        // callback: it_dataBindCallback
    },
    "external": {
        id: "external",
        checked: false,
        locale: "LANG196",
        label: $P.lang("LANG196"),
        datasource: recordsExternal
        // callback: et_dataBindCallback
    },
    "all_calltype": {
        id: "all_calltype",
        checked: true,
        locale: "LANG197",
        label: $P.lang("LANG197"),
        datasource: recordsAll
        // callback: all_dataBindCallback
    }
};

var period = {
    "monthly": {
        locale: "LANG198",
        label: $P.lang("LANG198"),
        type: "radio",
        checked: true,
        element: [{
            row: 0,
            label: "",
            id: "monthly-date",
            name: "monthly-date",
            type: "select",
            onchange: getOnchangeFunc(),
            option: year_options()
        }]
    },
    "weekly": {
        locale: "LANG199",
        label: $P.lang("LANG199"),
        type: "radio",
        checked: false,
        element: [{
            row: 0,
            label: "",
            id: "weekly-date",
            name: "weekly-date",
            type: "select",
            onchange: getOnchangeFunc(),
            option: year_options()
        }]
    },
    "daily": {
        locale: "LANG200",
        label: $P.lang("LANG200"),
        type: "radio",
        checked: false,
        element: [{
            row: 0,
            label: "",
            id: "daily-date",
            name: "daily-date",
            type: "text",
            defaults: curr_year + "-" + curr_month_str,
            onchange: getOnchangeFunc()
        }]
    },
    "hourly": {
        locale: "LANG201",
        label: $P.lang("LANG201"),
        type: "radio",
        checked: false,
        element: [{
            row: 0,
            label: "",
            id: "hourly-date",
            name: "hourly-date",
            type: "text",
            defaults: curr_year + "-" + curr_month_str + "-" + curr_day_str,
            onchange: getOnchangeFunc()
        }]
    },
    "acc_hourly": {
        locale: "LANG202",
        label: $P.lang("LANG202"),
        type: "radio",
        checked: false,
        element: [{
            row: 0,
            label: "",
            id: "acc_hourly-date-from",
            name: "acc_hourly-date-from",
            type: "text",
            defaults: curr_year + "-" + curr_month_str,
            onchange: getOnchangeFunc()
        }, {
            row: 1,
            locale: "LANG171",
            label: $P.lang("LANG171"),
            id: "acc_hourly-date-to",
            name: "acc_hourly-date-to",
            type: "text",
            defaults: curr_year + "-" + curr_month_str,
            onchange: getOnchangeFunc()
        }]
    }
};

var service = {
    "all_service": {
        locale: "LANG104",
        label: $P.lang("LANG104"),
        type: "radio",
        checked: true
    },
    "sip": {
        locale: "LANG191",
        label: $P.lang("LANG191"),
        type: "radio",
        checked: false
    },
    "pstn": {
        locale: "LANG192",
        label: $P.lang("LANG192"),
        type: "radio",
        checked: false
    },
    "digital": {
        locale: "LANG5379",
        label: $P.lang("LANG5379"),
        type: "radio",
        checked: false
    },
    "iax": {
        locale: "LANG5380",
        label: $P.lang("LANG5380"),
        type: "radio",
        checked: false
    }
};

function date_str(date) {
    if (date < 10) {
        return "0" + date;
    } else {
        return "" + date;
    }
}

function year_options() {
    var options = "",
        num_year = 5,
        k;

    k = num_year - 1;

    while (k > -1) {
        if (k > 0) {
            options = options + '<option value="' + (curr_year - k) + '">' + (curr_year - k) + '</option>';
        } else {
            options = options + '<option value="' + (curr_year - k) + '" selected="selected">' + (curr_year - k) + '</option>';
        }

        k--;
    }

    return options;
}

function getOnchangeFunc() {
    return "setElementValue(this)";
}

function setElementValue(element) {
    var id = $(element).attr("id"),
        ids = [];

    ids = id.split("-");

    // window.alert("setelementvalue id " + id);
    if (ids.length > 0) {
        var key = ids[0],
            el_arr = period[key].element;

        for (var i = 0; i < el_arr.length; i++) {
            if (el_arr[i].id == id) {
                el_arr[i].value = $(element).val();
            }
        }
    }
}

function weekOfYear(year, month, day) {
    var date1 = new Date(year, 0, 1),
        date2 = new Date(year, month - 1, day, 1),
        dayMS = 24 * 60 * 60 * 1000,
        firstDay = (7 - date1.getDay()) * dayMS,
        weekMS = 7 * dayMS;

    date1 = date1.getTime();
    date2 = date2.getTime();

    return Math.ceil((date2 - date1 - firstDay) / weekMS) + 1;
}

function processCDRResult(result, call_type) {
    var saved_data = [],
        sub_datasets = [],
        datasource = [],
        color = "#000000",
        length = result.length;

    if (length) {
        for (var i = 0; i < length; i++) {
            saved_data[result[i]['time']] = Math.floor(result[i]['count']);
        }
    }

    if (period_key == "monthly") { // monthly data 
        for (var i = 0; i < 12; i++) {
            var time = Date.UTC(period_cond[0], i),
                time_str = period_cond[0] + "-" + date_str(i + 1);

            if (saved_data[time_str] != undefined) {
                datasource.push([time, saved_data[time_str]]);
            } else {
                datasource.push([time, 0]);
            }
        }
    } else if (period_key == "weekly") {
        var num_of_week = weekOfYear(period_cond[0], 12, 31);

        for (var i = 1; i < num_of_week; i++) {
            var time_str = period_cond[0] + "-" + date_str(i);

            if (saved_data[time_str] != undefined) {
                datasource.push([i, saved_data[time_str]]);
            } else {
                datasource.push([i, 0]);
            }
        }

        mode = null;
    } else if (period_key == "daily") { // daily data 
        var period_arr = period_cond[0].split("-"),
            year = parseInt(period_arr[0]),
            month = parseInt(period_arr[1]) - 1;

        for (var i = 1; i <= 31; i++) {
            var time = Date.UTC(year, month, i),
                time_str = period_cond[0] + "-" + date_str(i);

            if (saved_data[time_str] != undefined) {
                datasource.push([time, saved_data[time_str]]);
            } else {
                datasource.push([time, 0]);
            }
        }
    } else if (period_key == "hourly") { // hourly data 
        var period_arr = period_cond[0].split("-"),
            year = parseInt(period_arr[0]),
            month = parseInt(period_arr[1]) - 1,
            day = parseInt(period_arr[2]);

        for (var i = 0; i < 24; i++) {
            var time = Date.UTC(year, month, day, i),
                time_str = period_cond[0] + "-" + date_str(i);

            if (saved_data[time_str] != undefined) {
                datasource.push([time, saved_data[time_str]]);
            } else {
                datasource.push([time, 0]);
            }
        }
    } else if (period_key == "acc_hourly") {
        for (var i = 0; i < 24; i++) {
            var key = Date.UTC(2012, 0, 1, i).toString(),
                time_str = date_str(i);

            if (saved_data[time_str] != undefined) {
                datasource.push([key, saved_data[time_str]]);
            } else {
                datasource.push([key, 0]);
            }
        }
    }

    if (call_type == "inbound") {
        color = "#EDC240";
    } else if (call_type == "outbound") {
        color = "#AFD8F8";
    } else if (call_type == "internal") {
        color = "#CB4B4B";
    } else if (call_type == "external") {
        color = "#4DA74D";
    } else if (call_type == "all_calltype") {
        color = "#9440ED";
    }

    if (call_type != "no_calltype") {
        var calltypeLocale = calltype[call_type].locale;

        sub_datasets[call_type] = {
            locale: calltypeLocale,
            label: $P.lang(calltypeLocale),
            data: datasource,
            color: color
        };
    } else {
        sub_datasets[call_type] = {
            data: datasource
        };
    }

    if (!checkDataItemHasThisColor(color)) {
        data.push(sub_datasets[call_type]);
    }

    var mode = (period_key == "weekly") ? null : 'time';

    $.plot($("#placeholder"), data, {
        yaxis: {
            min: 0,
            minTickSize: 1,
            tickDecimals: 0
        },
        xaxis: {
            mode: mode,
            monthNames: ["LANG204", "LANG205", "LANG206", "LANG207", "LANG208", "LANG209", "LANG210", "LANG211", "LANG212", "LANG213", "LANG214", "LANG215"]
        }
    });
}

function checkDataItemHasThisColor(color) {
    if (!color) {
        return false;
    }

    var hasColor = false;

    for (var i = 0; i < data.length; i++) {
        var item = data[i];

        if (item.color === color) {
            hasColor = true;
            break;
        }
    }

    return hasColor;
}

function plotAccordingToChoices() {
    if (!$P('#form', document).valid()) {
        $("input[titles]").mouseover();
    } else {
        condition = "";
        data = [];
        period_cond = []; // store year, month, day....if any;
        calltype_arr = calltypeContainer.find("input:checked");
        period_key = periodContainer.find("input:checked").attr("id"); // get which period option is selected;
        service_key = serviceContainer.find("input:checked").attr("id");

        var query_str = "",
            calltype_cond = "",
            el_arr = period[period_key].element;

        $.each(el_arr, function(key, val) {
            period_cond.push($("#" + val.id).val()); // get year/month/day.. value from the web element;
        });

        if (service_key == "sip") {
            condition += "&service=sip";
        } else if (service_key == "pstn") {
            condition += "&service=pstn";
        } else if (service_key == "all_service") {
            condition += "&service=all";
        } else if (service_key == "digital") {
            condition += "&service=digital";
        } else if (service_key == "iax") {
            condition += "&service=iax";
        } 

        if (period_key == "monthly") {
            condition += "&timetype=month&timestart=" + period_cond[0];
        } else if (period_key == "weekly") {
            condition += "&timetype=week&timestart=" + period_cond[0];
        } else if (period_key == "daily") {
            condition += "&timetype=day&timestart=" + period_cond[0];
        } else if (period_key == "hourly") {
            condition += "&timetype=hour&timestart=" + period_cond[0];
        } else if (period_key == "acc_hourly") {
            condition += "&timetype=range&timestart=" + period_cond[0] + "&timeend=" + period_cond[1];
        }

        if (calltype_arr.length > 0) {
            calltype_arr.each(function() {
                var call_type = $(this).attr("id");

                if (call_type == "inbound") {
                    calltype_cond = "&calltype=inband&callinfo=" + intExt_str;
                } else if (call_type == "outbound") {
                    calltype_cond = "&calltype=outband&callinfo=" + intExt_str;
                } else if (call_type == "internal") {
                    calltype_cond = "&calltype=incall&callinfo=" + intExt_str;
                } else if (call_type == "external") {
                    calltype_cond = "&calltype=excall&callinfo=" + intExt_str;
                } else if (call_type == "all_calltype") {
                    calltype_cond = "&calltype=all";
                }

                query_str = condition + calltype_cond;

                var request = $.ajax({
                    type: "GET",
                    url: "/cgi",
                    // async: false,
                    dataType: "json",
                    data: "action=getCDRStatistics" + query_str,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            var cdr_table = data.response.cdrstatistics.cdr;

                            processCDRResult(cdr_table, call_type);
                        }
                    }
                });

            });
        } else {
            processCDRResult("", "no_calltype");
        }

        $(document.body).show();

        var mode = (period_key == "weekly") ? null : 'time';

        $.plot($("#placeholder"), data, {
            yaxis: {
                min: 0,
                minTickSize: 1,
                tickDecimals: 0
            },
            xaxis: {
                mode: mode,
                monthNames: ["LANG204", "LANG205", "LANG206", "LANG207", "LANG208", "LANG209", "LANG210", "LANG211", "LANG212", "LANG213", "LANG214", "LANG215"]
            }
        });
    }
}

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var extension = res[i].extension;

        arr.push(extension);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "acc_hourly-date-from": {
                smallerTime: [$P.lang("LANG1048"), $P.lang("LANG1049"), $('#acc_hourly-date-to')]
            },
            "acc_hourly-date-to": {
                biggerTime: [$P.lang("LANG1049"), $P.lang("LANG1048"), $('#acc_hourly-date-from')]
            }
        },
        newValidator: true,
        submitHandler: function() {}
    });
}

window.onload = function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG593"));

    if ($('#engine')[0] != null) {
        $('#engine')[0].innerHTML = backend;
    }

    $.each(service, function(key, val) {
        var checked = '';

        if (val.checked == true) {
            checked = 'checked="checked"';
        }

        serviceContainer.append('<div style="line-height: 30px;"><input type="' + val.type + '" name="service" ' + checked + ' id="' + key + '">' +
            '<label for="id' + key + '" locale=' + val.locale + '>' + val.label + '</label></div>');
    });

    serviceContainer.find("input").click(plotAccordingToChoices);

    serviceContainer.closest('td').css('width', '100px');

    var t = 0;

    $.each(calltype, function(key, val) {
        val.color = t;
        ++t;
    });

    // insert checkboxes 

    $.each(calltype, function(key, val) {
        var checked = '';
        if (val.checked == true) {
            checked = 'checked="checked"';
        }

        calltypeContainer.append('<div style="line-height: 30px;"><input type="checkbox" name="' + key +
            '" ' + checked + ' id="' + key + '">' +
            '<label for="id' + key + '" locale=' + val.locale + '  class="label">' + val.label + '</label></div>');

    });

    calltypeContainer.find("input").click(plotAccordingToChoices);

    calltypeContainer.closest('td').css('width', '120px');

    var newTable = $("<table/>");

    $.each(period, function(key, val) {

        // periodContainer.append('<tr>');
        var checked = '';

        if (val.checked == true) {
            checked = 'checked="checked"';
        }

        var newTr = $("<tr/>");

        newTr.css("line-height", "29px");
        newTr.append('<td class="align" style="position: relative; width: 80px;" valign="top">' +
            '<input type="' + val.type + '" class="period" name="period" ' + checked + ' id="' + key + '">' +
            '<label for="id' + key + '" locale=' + val.locale + '  class="label">' + val.label + '</label></td>');

        var el_arr = val.element;

        var td_str = '<td class="align" style="position: relative; top: 4px;" valign="top">';

        $.each(el_arr, function(index, el) {
            if (el.type == "text") {
                if (el.label) {
                    td_str = td_str + '<font style="margin: 0 5px; top: -4px; position: relative;" locale=' + el.locale + '>' + el.label + '</font>' + '<input type="text" id="' + el.id + '" name="' + el.name + '" class="special" value="' + el.defaults + '" oninput="plotAccordingToChoices()"/>';
                } else {
                    td_str = td_str + '<input type="text" id="' + el.id + '" name="' + el.name + '" class="special" value="' + el.defaults + '" oninput="plotAccordingToChoices()"/>';
                }
            } else if (el.type == "select") {
                if (el.label) {
                    td_str = td_str + '<font style="margin: 0 5px; top: -4px; position: relative;" locale=' + el.locale + '>' + el.label + '</font>' + '<select id="' + el.id + '" name="' + el.name + '" onchange="plotAccordingToChoices()">' + el.option + '</select>';
                } else {
                    td_str = td_str + '</font>' + '<select id="' + el.id + '" name="' + el.name + '" onchange="plotAccordingToChoices()">' + el.option + '</select>';
                }
            }
        });

        td_str = td_str + "</td>";
        newTr.append(td_str);
        newTable.append(newTr);
    });

    $('.page').delegate(".period", "click", function() {
        plotAccordingToChoices();
    });

    periodContainer.append(newTable);

    periodContainer.css({"position": "relative", "top": "-5px"}).closest('td').css('width', '500px');

    var input_ids = ["daily-date", "acc_hourly-date-from", "acc_hourly-date-to"]; //these ones' datepicker needs to be customized. 

    $.each(input_ids, function(key, val) {
        $("#" + val).datepicker({
            showOn: "button",
            buttonImage: "../images/calendar.png",
            buttonImageOnly: true,
            buttonText: '',
            dateFormat: 'yy-mm',
            changeMonth: true,
            changeYear: true,
            showButtonPanel: false,
            onClose: function() {
                var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val(),
                    year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();

                $(this).val($.datepicker.formatDate('yy-mm', new Date(year, month, 1)));

                if (!$P(this, document).valid()) {
                    $(this).mouseover();
                }
            },
            beforeShow: function() {
                var selDate;

                if ((selDate = $(this).val()).length > 0) {
                    var month = parseInt(selDate.substring(5)),
                        year = parseInt(selDate.substring(0, 4));

                    $(this).datepicker('option', 'defaultDate', new Date(year, month - 1, 1));
                    $(this).datepicker('setDate', new Date(year, month - 1, 1));
                }
            }
        });

        $("#" + val).focus(function() {
            if ((period_focused == "" || period_focused == val) && $('#ui-datepicker-div').is(':visible')) {
                var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val(),
                    year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();

                if (month && year) {
                    $(this).val($.datepicker.formatDate('yy-mm', new Date(year, month, 1)));
                }
            }

            var id_arr = val.split("-");

            if ($("#" + id_arr[0]).is(':checked')) {
                plotAccordingToChoices();
            }

            period_focused = val;
        });

        if (val !== 'daily-date') {
            $("#" + val).mouseover(function() {
                var element = $(this),
                    offset = element.offset(),
                    titles = element.attr('titles'),
                    hasHighLight = element.hasClass('ui-state-highlight'),
                    tooltip = $('.ui-tooltip');

                if (hasHighLight && titles && !tooltip.is(':visible')) {
                    tooltip
                        .find('.ui-tooltip-content').text(titles)
                        .end().css({'display': 'block', 'top': offset.top + 20, 'left': offset.left});

                    setTimeout(function() {
                        element.removeAttr('titles');
                        tooltip.css({'display': 'none'});
                    }, 2000);
                }
            });
        }
    });

    $("#hourly-date").datepicker({
        showOn: "button",
        buttonImage: "../images/calendar.png",
        buttonImageOnly: true,
        buttonText: '',
        dateFormat: 'yy-mm-dd',
        onSelect: function() {
            if ($("#hourly").attr("checked") == "checked") {
                plotAccordingToChoices();
            }
        }
    });

    $("#hourly-date").focus(function() {
        $(".ui-datepicker-calendar").show();

        period_focused = "hourly-date";
    });

    intDest = transData(UCMGUI.isExist.getList('getAccountList'));

    var fxs_str = config.FXS_PORTS_DETECTED;

    if (fxs_str.length > 0) {
        intDest = intDest.concat(fxs_str);
    }

    for (var i = 0; i < intDest.length; i++) {
        if (i < intDest.length - 1) {
            intExt_str += "'" + intDest[i] + "',";
        } else {
            intExt_str += "'" + intDest[i] + "'";
        }
    }

    if (intDest.length == 0) {
        intExt_str = "'conf',''";
    }

    initValidator();

    plotAccordingToChoices();

    top.Custom.init(doc);
}
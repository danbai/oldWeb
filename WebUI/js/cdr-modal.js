/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
String.prototype.format = top.String.prototype.format;

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    gup = UCMGUI.gup,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    createRecordingOptions = mWindow.createRecordingOptions,
    genRecordList = mWindow.genRecordList,
    transRowData = mWindow.transRowData,
    transGridData = mWindow.transGridData,
    curr_date = new Date(),
    curr_year = curr_date.getFullYear(),
    curr_month = curr_date.getMonth() + 1,
    curr_month_str = (curr_month < 10) ? "0" + curr_month : curr_month,
    curr_day = curr_date.getDate(),
    curr_day_str = (curr_day < 10) ? "0" + curr_day : curr_day,
    begin_month = (curr_month == 12) ? 1 : curr_month + 1, // if curr month is Nov, then the chart should show from Dec last year to now.
    begin_month_str = (begin_month < 10) ? "0" + begin_month : begin_month,
    begin_year = (begin_month == 1) ? curr_year : curr_year - 1,
    begin_day = (curr_day >= 27) ? 1 : curr_day + 1,
    monthArray = [];

var cd_fields = ["disposition", "userfield", "start", "answer", "end", "duration", "billsec", "clid", "dst"];

var period = [{
    label: $P.lang("LANG2270"),
    selectfield: " strftime('%Y-%m', start) ",
    groupby: " group by strftime('%m', start) ",
    starttime: " strftime('%Y-%m', start) >= '" + begin_year + "-" + begin_month_str + "' and strftime('%Y-%m', start) <= '" + curr_year + "-" + curr_month_str + "' ",
    value: 0
}];

var options = [{
    label: "Extensions",
    value: 0,
    data: mWindow.extens
}, {
    label: "Conference",
    value: 1,
    data: mWindow.confrooms
}, {
    label: "IVR",
    value: 2,
    data: mWindow.ivrs
}, {
    label: "Voicemail Groups",
    value: 3,
    data: mWindow.vmgroups
}, {
    label: "Ring Groups",
    value: 4,
    data: mWindow.ringgroups
}, {
    label: "Paging/Intercom",
    value: 5,
    data: mWindow.pagegroups
}, {
    label: "Call Queue",
    value: 6,
    data: mWindow.queues
}];

window.onload = function() {
    $P.lang(document, true);

    // this will be the main window
    var mode = gup.call(window, "mode"),
        item = decodeURIComponent(gup.call(window, "item")),
        uniqueID = gup.call(window, "uid"),
        files = (item ? item.split("@") : ''),
        record_table = document.createElement("TABLE");

    record_table.className = "table_record";

    $(document.body).show();

    if (mode == "download") {
        var thead = document.createElement("thead"),
            tr = document.createElement("tr");

        tr.style.fontSize = "8pt";

        for (var i = 0; i < 1; i++) {
            var th = document.createElement("th"),
                disnameSpan = document.createElement("span");

            if (i == 0) {
                disnameSpan.innerHTML = $P.lang("LANG2386");
            }

            th.appendChild(disnameSpan);
            tr.appendChild(th);
        }

        thead.appendChild(tr);
        record_table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.id = "voicefile_content";

        $.each(files, function(key, value) {
            if (value) {
                var record_tr = document.createElement("tr"),
                    filename_td = document.createElement("td");

                filename_td.style.textAlign = "center";
                filename_td.style.cursor = "pointer";
                filename_td.id = value;
                filename_td.appendChild(document.createTextNode(value));
                filename_td.onclick = Function('sendDownloadRequest("' + value + '")');

                record_tr.appendChild(filename_td);
                tbody.appendChild(record_tr);
            }
        });

        record_table.appendChild(tbody);

        $("#" + mode + "_record").append(record_table);

        $("#" + mode + "_filelist").show();
    } else if (mode == "play") {
        var thead = document.createElement("thead"),
            tr = document.createElement("tr");

        tr.style.fontSize = "8pt";

        for (var i = 0; i < 1; i++) {
            var th = document.createElement("th"),
                disnameSpan = document.createElement("span");

            if (i == 0) {
                disnameSpan.innerHTML = $P.lang("LANG2386");
            }

            th.appendChild(disnameSpan);
            tr.appendChild(th);
        }

        thead.appendChild(tr);
        record_table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.id = "voicefile_content";

        $.each(files, function(key, value) {
            if (value) {
                var record_tr = document.createElement("tr"),
                    filename_td = document.createElement("td"),
                    link = document.createElement("a");

                // if (value.indexOf("auto-") > -1) {
                //     link.href = "../udata/monitor/" + value;
                // } else if (value.indexOf("meetme-") > -1) {
                //     link.href = "../udata/meetme/" + value;
                // }

                link.href = value;
                link.className = 'link';
                link.appendChild(document.createTextNode(value));

                filename_td.appendChild(link);
                record_tr.appendChild(filename_td);
                tbody.appendChild(record_tr);
            }
        });

        record_table.appendChild(tbody);

        $("#" + mode + "_record").append(record_table);

        $(".link").click(function(ev) {
            var filename = $(this).attr('href'),
                type;

            if (filename.indexOf("auto-") > -1) {
                type = 'voice_recording';
            } else {
                type = 'conference_recording';
            }

            $.ajax({
                type: "post",
                url: "../cgi",
                data: {
                    "action": "checkFile",
                    "type": type,
                    "data": filename
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    // top.dialog.dialogMessage({
                    //     type: 'error',
                    //     content: errorThrown
                    // });
                },
                success: function(data) {
                    if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                        window.location = "/cgi?action=playFile&type=" + type + "&data=" + encodeURIComponent(filename) + "&_=" + (new Date().getTime());
                    } else {
                        checkFileErrorHandler(data);
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

        $("#" + mode + "_filelist").show();
    } else if (mode == "delete") {
        var acctid = gup.call(window, "acctid"),
            thead = document.createElement("thead"),
            tr = document.createElement("tr");

        tr.style.fontSize = "8pt";

        for (var i = 0; i < 2; i++) {
            var th = document.createElement("th"),
                disnameSpan = document.createElement("span");

            if (i == 0) {
                disnameSpan.innerHTML = "";
            } else if (i == 1) {
                disnameSpan.innerHTML = $P.lang("LANG2386");
            }

            th.appendChild(disnameSpan);
            tr.appendChild(th);
        }

        thead.appendChild(tr);
        record_table.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.id = "voicefile_content";

        $.each(files, function(key, value) {
            if (value) {
                var record_tr = document.createElement("tr"),
                    checkbox_td = document.createElement("td"),
                    filename_td = document.createElement("td"),
                    checkbox_input = document.createElement("input");

                checkbox_input.id = value;
                checkbox_input.type = "checkbox";
                filename_td.style.textAlign = "center";
                filename_td.id = value;
                checkbox_td.appendChild(checkbox_input);
                checkbox_input.style.left = "100px";

                filename_td.appendChild(document.createTextNode(value));
                record_tr.appendChild(checkbox_td);
                record_tr.appendChild(filename_td);
                tbody.appendChild(record_tr);
            }
        });

        record_table.appendChild(tbody);

        $("#" + mode + "_record").append(record_table);

        $("#" + mode + "_submit").click(function() {
            var sel_files = getSelectedFiles(mode);

            if (sel_files['selected'].length > 0) {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG938"),
                    buttons: {
                        ok: function() {
                            top.dialog.clearDialog();

                            if (mode == "delete") {
                                sendDeleteRequest(uniqueID, sel_files, acctid, item);
                            } else if (mode == "download") {
                                sendDownloadRequest(uniqueID, sel_files);
                            }
                        },
                        cancel: function() {
                            top.dialog.container.show();
                            top.dialog.shadeDiv.show();
                        }
                    }
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG2640").toLowerCase()),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            }
        });

        $("#" + mode + "_filelist").show();
    } else if (mode == "chart") {
        if (item == undefined || item.length == 0) {
            return;
        }

        monthArray = genMonthArray();

        var findcategory = false,
            selected_index = -1,
            i = -1,
            choicetable = document.createElement("table"),
            tr_title = document.createElement("tr"),
            td_category_title = document.createElement("td"),
            td_extlist_title = document.createElement("td"),
            td_period_title = document.createElement("td"),
            tr_choicetable = document.createElement("tr"),
            td_category = document.createElement("td"),
            category = document.createElement("select");

        choicetable.id = "table_chart";
        choicetable.className = "table_chart";

        td_category_title.appendChild(document.createTextNode($P.lang("LANG2258")));
        td_extlist_title.appendChild(document.createTextNode($P.lang("LANG2260")));
        td_period_title.appendChild(document.createTextNode($P.lang("LANG2261")));

        tr_title.appendChild(td_category_title);
        tr_title.appendChild(td_extlist_title);
        tr_title.appendChild(td_period_title);

        category.id = "category";
        category.size = 7;
        category.className = "select_category";

        options.each(function(option) {
            var option_el = document.createElement("option");

            i++;

            option_el.innerHTML = option.label;
            option_el.value = option.value;

            if (!findcategory) {
                option.data.each(function(data_item) {
                    if (((typeof(data_item) == "object") && data_item.number == item) ||
                        (!(typeof(data_item) == "object") && data_item == item)) {

                        option_el.selected = true;

                        selected_index = i;

                        findcategory = true;

                        return false;
                    }
                });
            }

            category.appendChild(option_el);
        });

        if (selected_index == -1) {
            return;
        }

        td_category.appendChild(category);
        tr_choicetable.appendChild(td_category);

        var td_extlist = document.createElement("td"),
            extlist = document.createElement("select"),
            selected_option = options[selected_index];

        extlist.id = "select_ext";
        extlist.size = 7;
        extlist.className = "select_extlist";

        selected_option.data.each(function(val) {
            var ext_el = document.createElement("option");

            if (typeof(val) == "object") {
                ext_el.innerHTML = '"' + val.name + '" <' + val.number + '>';
                ext_el.value = val.number;

                if (val.number == item) {
                    ext_el.selected = true;
                }
            } else {
                ext_el.innerHTML = val;
                ext_el.value = val;

                if (val == item) {
                    ext_el.selected = true;
                }
            }

            extlist.appendChild(ext_el);
        });

        td_extlist.appendChild(extlist);
        tr_choicetable.appendChild(td_extlist);

        var td_period = document.createElement("td"),
            periodlist = document.createElement("select");

        periodlist.id = "select_period";
        periodlist.size = 7;
        periodlist.className = "select_period";

        i = -1;

        period.each(function(option) {
            var option_el = document.createElement("option");

            i++;

            option_el.innerHTML = option.label;
            option_el.value = option.value;
            if (i == 0) {
                option_el.selected = true;
            }

            periodlist.appendChild(option_el);

        });

        td_period.appendChild(periodlist);
        tr_choicetable.appendChild(td_period);

        plotAccordingToChoices(item, 0);

        choicetable.appendChild(tr_title);
        choicetable.appendChild(tr_choicetable);

        $("#choiceholder").append(choicetable);

        $("#chart").show();

        $("#category").change(function() {
            var sidx = Math.floor($(this).val()),
                j = -1,
                selected_ext = "-1"; // item;

            $("#select_ext").empty();

            options[sidx].data.each(function(val) {
                var ext_el = document.createElement("option");

                j++;

                if (typeof(val) == "object") {
                    ext_el.innerHTML = '"' + val.name + '" <' + val.number + '>';
                    ext_el.value = val.number;

                    if (j == 0) {
                        ext_el.selected = true;
                        selected_ext = val.number;
                    }
                } else if (val.length > 0) {
                    ext_el.innerHTML = val;
                    ext_el.value = val;

                    if (j == 0) {
                        ext_el.selected = true;
                        selected_ext = val;
                    }
                }

                extlist.appendChild(ext_el);
            });

            plotAccordingToChoices(selected_ext, $("#select_period").val());

        });

        $("#select_ext").change(function() {
            var selected_ext = Math.floor($(this).val());

            plotAccordingToChoices(selected_ext, $("#select_period").val());
        });

        $('#select_period').change(function() {
            var selected_period = Math.floor($(this).val()),
                selected_ext = Math.floor($('#select_ext').val());

            plotAccordingToChoices(selected_ext, selected_period);
        });
    } else if (mode == "calldetail") {
        var session = decodeURIComponent(gup.call(window, "session")),
            caller = gup.call(window, "caller"),
            start = gup.call(window, "start"),
            d = document.createElement("TABLE"),
            thead = document.createElement("thead"),
            tr = document.createElement("tr"),
            headers = ["LANG169", "LANG4226", "LANG5134", "LANG581", "LANG582", "LANG2239", "LANG2238", "LANG4569", "LANG186", "LANG4096"];

        d.id = "table_calldetail";
        d.className = "table_calldetail";
        tr.style.fontSize = "8pt";

        for (var i = 0; i < 10; i++) {
            var th = document.createElement("th"),
                disnameSpan = document.createElement("span");

            disnameSpan.innerHTML = $P.lang(headers[i]);

            th.appendChild(disnameSpan);
            tr.appendChild(th);
        }

        thead.appendChild(tr);
        d.appendChild(thead);

        var tbody = document.createElement("tbody");
        tbody.id = "table_content";

        d.appendChild(tbody);
        $("#calldetail").append(d);

        callDetail(session, caller, start);

        $("#calldetail").show();

        $('#table_calldetail')
            .delegate('.recording', 'click', function(ev) {
                if (!this.disabled) { // this is HTML object; $(this) is JQuery object;
                    var acctid = $(this).attr("acctid"),
                        id_arr = this.id.split("_"),
                        filelist = $(this).attr("filelist");

                    if (id_arr.length > 1) {
                        var op_type = id_arr[0], // "play"/"download"/"delete"
                            uniqueID = id_arr[1]; // uniqueID of a record;

                        genRecordList(op_type, uniqueID, filelist, acctid);
                    }
                }

                ev.stopPropagation();
                return false;
            });
    }

    top.Custom.init(document);
};

function checkFileErrorHandler(data) {
    var response = data.response || {},
        result = response.result;

    if (typeof result === 'number') {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang(UCMGUI.config.errorCodes[result] || 'LANG916')
        });
    } else {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG3868")
        });
    }
}

function date_str(date) {
    if (date < 10) {
        return "0" + date;
    } else {
        return "" + date;
    }
}

function genMonthArray() {
    var monthArr = [];

    if (begin_month == 1) {
        for (var i = 1; i <= 12; i++) {
            var data = curr_year + "-" + date_str(i);

            monthArr.push(data);
        }
    } else {
        for (var i = begin_month; i <= 12; i++) {
            var data = begin_year + "-" + date_str(i);

            monthArr.push(data);
        }

        for (var j = 1; j <= curr_month; j++) {
            var data = curr_year + "-" + date_str(j);

            monthArr.push(data);
        }
    }

    return monthArr;
}

function sendDeleteRequest(uniqueID, files, acctid, fileList) {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG877")
    });

    var action = {
        "action": 'updateCDRDB',
        "acctid": acctid
    };

    if (files['unselected'].length > 0) {
        action["record_file"] = files['unselected'].join('@') + '@';
    } else {
        action["record_file"] = '';
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "checkFile",
            "type": (files['selected'][0].indexOf("auto-") > -1) ? "voice_recording" : "conference_recording",
            "data": files['selected'].join(',,')
        },
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG913")
            });
        },
        success: function(data) {
            if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: false,
                    url: "../cgi",
                    data: action,
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG913")
                        });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            var action = {
                                "action": "removeFile",
                                "type": (files['selected'][0].indexOf("auto-") > -1) ? "voice_recording" : "conference_recording",
                                "data": files['selected'].join(',,')
                            };

                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: action,
                                error: function(jqXHR, textStatus, errorThrown) {
                                    top.dialog.clearDialog();

                                    // top.dialog.dialogMessage({
                                    //     type: 'error',
                                    //     content: errorThrown
                                    // });
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data);

                                    if (bool) {
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG871"),
                                            callback: function() {
                                                mWindow.$("#cdr_records", mWindow.document).trigger('reloadGrid');
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                checkFileErrorHandler(data);
            }
        }
    });
}

function sendDownloadRequest(file) {
    var type;

    if (file.indexOf("auto-") > -1) {
        type = 'voice_recording';
    } else {
        type = 'conference_recording';
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "checkFile",
            "type": type,
            "data": file
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            if (data && data.hasOwnProperty("status") && (data.status === 0)) {
                top.window.open("/cgi?action=downloadFile&type=" + type + "&data=" + encodeURIComponent(file) + "&_=" + (new Date().getTime()), '_self');
            } else {
                checkFileErrorHandler(data);
            }
        }
    });
}

function sendPlayRequest(file) {
    var mask = "";

    $.ajax({
        type: "GET",
        url: '../cgi?action=playCDRFile&filename=' + file,
        dataType: "json",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            if (data && data.status === 0) {
                var filename = data.response.filename;

                mask = filename ? filename : '';
            }
        }
    });

    return mask;
}

function getSelectedFiles(mode) {
    var filenames = {
        'selected': [],
        'unselected': []
    };

    $("#" + mode + "_filelist input").each(function() {
        var filename = $(this).attr("id");

        if (filename.length > 0 && $(this)[0].checked) {
            filenames['selected'].push(filename);
        } else if (filename.length > 0) {
            filenames['unselected'].push(filename);
        }
    });

    return filenames;
}

function onResponseError(errorThrown) {
    top.dialog.dialogMessage({
        type: 'error',
        content: errorThrown
    });
}

// load statistic data
function plotAccordingToChoices(item, period_idx) {
    $.ajax({
        type: "POST",
        dataType: "json",
        // async: false,
        url: "../cgi",
        data: {
            "action": 'getCDRDB',
            "src": item,
            "fromtime": begin_year + "-" + begin_month_str,
            "totime": curr_year + "-" + curr_month_str
        },
        error: function(jqXHR, textStatus, errorThrown) {
            onResponseError(errorThrown);
        },
        success: function(data) {
            processChartResult(data);
        }
    });
}

// parse statistic data
function processChartResult(val) {
    var bool = UCMGUI.errorHandler(val);

    if (bool) {
        var mode = 'time',
            saved_data = [],
            sub_datasets = [],
            datasource = [],
            data = [];

        var cdr_table = val.response.cdrdb["cdr"],
            total_num = cdr_table.length;

        for (var i = 0; i < total_num; i++) {
            saved_data[cdr_table[i]['time']] = Math.floor(cdr_table[i]['count']);
        }

        if ($("#select_period").val() == 0) {
            monthArray.each(function(time_str) {
                var tmpArr = time_str.split("-"),
                    year = Math.floor(tmpArr[0]),
                    month = Math.floor(tmpArr[1]),
                    time = Date.UTC(year, month - 1);

                if (saved_data[time_str] != undefined) {
                    datasource.push([time_str, saved_data[time_str]]);
                } else {
                    datasource.push([time_str, 0]);
                }
            });

            sub_datasets = {
                color: "#5482FF",
                data: datasource
            };

            data.push(sub_datasets);

            $.plot($("#placeholder"), data, {
                yaxis: {
                    min: 0,
                    axisLabel: $P.lang("LANG2263"),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelPadding: 3,
                    minTickSize: 1,
                    tickDecimals: 0
                },
                xaxis: {
                    mode: 'categories',
                    axisLabel: $P.lang("LANG2276"),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    // timeformat: "%y-%m"
                    axisLabelPadding: 12
                },
                bars: {
                    show: true,
                    barWidth: 0.6,
                    // lineWidth: 0.2,
                    align: "center",
                    fill: true,
                    fillColor: {
                        colors: [{
                            opacity: 0.2
                        }, {
                            opacity: 0.1
                        }]
                    }
                }
            });
        }
    }
}

// load detail data
function callDetail(session) {
    $.ajax({
        type: "POST",
        dataType: "json",
        // async: false,
        url: "../cgi",
        data: {
            "action": 'getSubCDR',
            // "callinfocmd": cd_fields.toString(),
            // "acctid": item
            "session": session
        },
        error: function(jqXHR, textStatus, errorThrown) {
            onResponseError(errorThrown);
        },
        success: function(data) {
            processCalldetailResult(data);
        }
    });
}

// parse detail data
function processCalldetailResult(data) {
    var bool = UCMGUI.errorHandler(data);

    if (bool) {
        var cdr_table = data.response.sub_cdr,
            len = cdr_table.length;

        if (len) {
            var transData = transGridData({
                'response': {
                    'acctid': cdr_table
                }
            });

            for (var i = 0; i < len; i++) {
                var r = transData[i],
                    tr = document.createElement("tr"),
                    names = ['start', 'action_owner', 'action_type', 'clid', 'dst', 'duration', 'billsec', 'accountcode', 'disposition'];

                for (var j = 0; j < 10; j++) {
                    var td = document.createElement("td");

                    if (j < 9) {
                        content = transRowData(undefined, names[j], r);
                    } else {
                        content = createRecordingOptions(undefined, undefined, r);
                    }

                    $(td).append(content);

                    tr.appendChild(td);
                }

                table_content.appendChild(tr);

                // if (r['start'].length > 1) {
                //     var tr_start = document.createElement("tr"),
                //         td_time = document.createElement("td"),
                //         td_event = document.createElement("td");

                //     td_time.appendChild(document.createTextNode(r['start']));
                //     td_event.appendChild(document.createTextNode(r['clid'] + $P.lang("LANG2310") + r['dst']));

                //     tr_start.appendChild(td_time);
                //     tr_start.appendChild(td_event);
                //     table_content.appendChild(tr_start);
                // }

                // if (r['answer'].length > 1) {
                //     var tr_start = document.createElement("tr"),
                //         td_time = document.createElement("td"),
                //         td_event = document.createElement("td");

                //     td_time.appendChild(document.createTextNode(r['answer']));

                //     if (r['userfield'].length <= 1 || r['userfield'] == "EXT" || r['userfield'] == "TR") {
                //         td_event.appendChild(document.createTextNode(r['dst'] + $P.lang("LANG2311") + r['billsec'] + " " + $P.lang("LANG570")));
                //     } else if (r['userfield'] == "FC") {
                //         td_event.appendChild(document.createTextNode($P.lang("LANG2382") + $P.lang("LANG2374") + r['dst']));
                //     } else if (r['userfield'] == "CONF") {
                //         td_event.appendChild(document.createTextNode($P.lang("LANG2382") + $P.lang("LANG18") + r['dst']));
                //     } else if (r['userfield'] == "FAX") {
                //         td_event.appendChild(document.createTextNode($P.lang("LANG2382") + $P.lang("LANG2375") + r['dst']));
                //     } else if (r['userfield'] == "PG") {
                //         td_event.appendChild(document.createTextNode($P.lang("LANG2382") + $P.lang("LANG2376") + r['dst']));
                //     } else if (r['userfield'] == "QUEUE") {
                //         td_event.appendChild(document.createTextNode($P.lang("LANG2382") + $P.lang("LANG2377") + r['dst']));
                //     } else if (r['userfield'] == "VM") {
                //         td_event.appendChild(document.createTextNode($P.lang("LANG2382") + $P.lang("LANG2379") + r['dst']));
                //     } else if (r['userfield'] == "VMG") {
                //         td_event.appendChild(document.createTextNode($P.lang("LANG2382") + $P.lang("LANG2380") + r['dst']));
                //     } else if (r['userfield'] == "RG") {
                //         td_event.appendChild(document.createTextNode($P.lang("LANG2382") + $P.lang("LANG2383") + r['dst']));
                //     }

                //     tr_start.appendChild(td_time);
                //     tr_start.appendChild(td_event);
                //     table_content.appendChild(tr_start);
                // }

                // if (r['end'].length > 1) {
                //     var tr_start = document.createElement("tr"),
                //         td_time = document.createElement("td"),
                //         td_event = document.createElement("td");

                //     td_time.appendChild(document.createTextNode(r['end']));
                //     td_event.appendChild(document.createTextNode($P.lang("LANG2312")));

                //     tr_start.appendChild(td_time);
                //     tr_start.appendChild(td_event);
                //     table_content.appendChild(tr_start);
                // }
            }
        } else {
            var tr = document.createElement("tr"),
                td = document.createElement("td");

            $(td)
                .attr('colspan', 8)
                .append(document.createTextNode($P.lang("LANG2317").format($P.lang("LANG2307"))));

            tr.appendChild(td);
            table_content.appendChild(tr);
        }
    }
}

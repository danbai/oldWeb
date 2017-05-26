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
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    gup = UCMGUI.gup,
    mWindow = top.frames["frameContainer"].frames["mainScreen"];

String.prototype.format = top.String.prototype.format;

$(function() {
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3926"));
    var detailNum = gup.call(window, "detailNum"),
        data = mWindow.detailObj[detailNum];
    renderOperLogDetailTable(data);

    $P.lang(doc, true);
});


function renderOperLogDetailTable(data) {
    var table = $("#operationLogDetailtable"),
        thead = $("<thead>").appendTo(table).addClass("thead"),
        tbody = $("<tbody>").appendTo(table).addClass("tbody");

    // render thead
    var theadContent = ["LANG74", "LANG3925"],
        tr = $("<tr>").addClass("frow").appendTo(thead);

    for (var i = 0; i < theadContent.length; i++) {
        var spanTh = $("<th>").appendTo(tr);

        $("<span>").appendTo(spanTh).css('cursor', 'default').attr("locale", theadContent[i]).html($P.lang(theadContent[i]));
    }

    // render tbody
    var options2Lang = top.options2Lang,
        _location = data["_location"],
        action = data["action"],
        locationObj = options2Lang[_location],
        options2LangAction = options2Lang[action];

    for (var prop in data) {
        if (data.hasOwnProperty(prop) && prop != "_location" && prop != "action") {
            var param = prop;

            if (locationObj && locationObj[prop]) {
                param = "<span locale='" + locationObj[prop] + "'>" + $P.lang(locationObj[prop]) + "</span>";
            }
            if (options2LangAction && options2LangAction[prop]) {
                param = "<span locale='" + options2LangAction[prop] + "'>" + $P.lang(options2LangAction[prop]) + "</span>";
            }

            var tr = $("<tr>").appendTo(tbody);
            $("<td>").appendTo(tr).html(param).css("width", "200px");
            var propData = data[prop] ? data[prop] : "",
                optStr = "";
            try {
                var arr = JSON.parse(propData);
                if ($.isArray(arr)) {
                    for (var i = 0; i < arr.length; i++) {
                        var index = arr[i];
                        for (var temp in index) {
                            if (index.hasOwnProperty(temp)) {
                                if (locationObj && locationObj[temp]) {
                                    param = "<span locale='" + locationObj[temp] + "'>" + $P.lang(locationObj[prop]) + "</span>";
                                }

                                if (options2LangAction && options2LangAction[temp]) {
                                    param = "<span locale='" + options2LangAction[temp] + "'>" + $P.lang(options2LangAction[prop]) + "</span>";
                                }

                                if (data.action === 'addEventList') {
                                    if (temp === 'extension') {
                                        optStr += (index[temp] ? index[temp] : "") + ",";
                                    }
                                } else {
                                    if (data.action === 'addMeetme' && prop === 'members') {
                                        if (temp === 'member_extension') {
                                            optStr += (index[temp] ? index[temp] : "") + ';';
                                        }
                                    } else {
                                        optStr += param + ": " + (index[temp] ? index[temp] : "") + ";  ";
                                    }
                                }
                            }
                        };
                        if (/;\s+$/.test(optStr)) {
                            optStr = optStr.replace(/;\s+$/, ".");
                        }
                    };

                    if (data.action === 'addEventList') {
                        optStr = optStr.slice(0, -1);
                    }
                } else {
                    optStr = propData;
                }
            } catch (e) {
                optStr = propData;
            }

            $("<td>").appendTo(tr).html(optStr);
        }
    }

    $("#operationLogDetailtable tbody tr:even").addClass("even");
    $("#operationLogDetailtable tbody tr:odd").addClass("odd");
}
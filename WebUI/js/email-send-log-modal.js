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
    detailID = gup.call(window, "detailNum"),
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    mWindow = top.frames["frameContainer"].frames["mainScreen"];

String.prototype.format = top.String.prototype.format;

$(function() {
    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3926"));

    getLogDetail(detailID);

    $P.lang(doc, true);
});

function getLogDetail(id) {
    $.ajax({
        type: "POST",
        async: false,
        dataType: "json",
        url: baseServerURl,
        data: {
            'action': 'getSubMailSendLog',
            'id': id
        },
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
                var detail = data.response.sub_send_mail_log;

                renderOperLogDetailTable(detail);
            }
        }
    });
}

function renderOperLogDetailTable(data) {
    var table = $("#emailSendLogDetail"),
        thead = $("<thead>").appendTo(table).addClass("thead"),
        tbody = $("<tbody>").appendTo(table).addClass("tbody");

    // render thead
    var theadContent = ["LANG5392", "LANG5393", "LANG5388", "LANG5389"],
        tr = $("<tr>").addClass("frow").appendTo(thead);

    for (var i = 0; i < theadContent.length; i++) {
        var spanTh = $("<th>").appendTo(tr);

        $("<span>").appendTo(spanTh).css('cursor', 'default').attr("locale", theadContent[i]).html($P.lang(theadContent[i]));
    }

    $.each(data, function(index, obj) {
        var tr = $("<tr>").appendTo(tbody);

        $("<td><span>" + obj.send_time + "</span></td>").appendTo(tr);
        $("<td><span>" + obj.send_to + "</span></td>").appendTo(tr);
        $("<td><span>" + obj.send_result + "</span></td>").appendTo(tr);
        $("<td><span>" + obj.return_code + "</span></td>").appendTo(tr);
    });

    $("#emailSendLogDetail tbody tr:even").addClass("even");
    $("#emailSendLogDetail tbody tr:odd").addClass("odd");
}
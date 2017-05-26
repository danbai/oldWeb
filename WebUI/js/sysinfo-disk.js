/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG586"));

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG805")
    });

    setTimeout(function() {
        $.ajax({
            type: "GET",
            dataType: "json",
            async: false,
            url: "/cgi?action=getStorageUsage",
            error: function() {
                top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'error',
                    content: $.lang("LANG909")
                });
            },
            success: DrawPie
        });
    }, 500);
});

function addKannma(number) {
    if (number == 0) {
        return 0;
    }

    var num = (number + ""),
        symble = "";

    num = num.replace(new RegExp(",", "g"), "");

    if (/^([-+]).*$/.test(num)) {
        symble = num.replace(/^([-+]).*$/, "$1");
        num = num.replace(/^([-+])(.*)$/, "$2");
    }

    if (/^[0-9]+(\.[0-9]+)?$/.test(num)) {
        var num = num.replace(new RegExp("^[0]+", "g"), "");

        if (/^\./.test(num)) {
            num = "0" + num;
        }

        var decimal = num.replace(/^[0-9]+(\.[0-9]+)?$/, "$1"),
            integer = num.replace(/^([0-9]+)(\.[0-9]+)?$/, "$1"),
            re = /(\d+)(\d{3})/;

        while (re.test(integer)) {
            integer = integer.replace(re, "$1,$2");
        }

        return symble + integer + decimal;
    } else {
        return number;
    }
}

function drawPieDif(val, total, avail, ul, MB) {
    for (var i = 0; i < val[total].length; i++) {
        var disk_name = val[total][i].diskname,
            disk_total = val[total][i].value,
            disk_avail = val[avail][i].value,
            title,
            card,
            p;

        if (disk_name == "cfg") {
            title = '<span locale="LANG161">' + $P.lang("LANG161") + '</span>';
        } else if (disk_name == "data") {
            title = '<span locale="LANG162">' + $P.lang("LANG162") + '</span>';
        } else if (disk_name.indexOf("mmcblk") >= 0) {

            // SD Card
            var subStr = disk_name.split('mmcblk')[1].split('p');

            card = subStr[0];
            p = subStr[1];

            title = '<span locale="LANG262">' + $P.lang("LANG262") + '</span>&nbsp;' + card + ',&nbsp;';
            title += '<span locale="LANG164">' + $P.lang("LANG164") + '</span>&nbsp;' + p;
        } else {

            // USB Disk
            var subStr = disk_name.split('sd')[1];

            p = subStr.replace(/\D/g, "");
            card = subStr.split(p)[0];

            title = '<span locale="LANG263">' + $P.lang("LANG263") + '</span>&nbsp;' + card + ',&nbsp;';
            title += '<span locale="LANG164">' + $P.lang("LANG164") + '</span>&nbsp;' + p;
        }

        $("#" + ul).append(
            '<li>' +
                '<div>' +
                    '<div class="field-label">' + title + '</div>' +
                    '<div class="field-label">' +
                        '<span locale="LANG115">' + $P.lang("LANG115") + '</span>' +
                        '<span id="' + disk_name + total + '_size"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="field-content">' +
                    '<div id="' + disk_name + total + '_graph" class="graph" style="width: 500px; height: 260px;"></div>' +
                '</div>' +
            '</li>');

        $('#' + disk_name + total + '_size').html(addKannma(disk_total) + MB);

        var disk = [{
            label: '<span locale="LANG116">' + $P.lang("LANG116") + "</span>:" + addKannma(parseInt(disk_avail)) + MB,
            data: parseInt(disk_avail)
        }, {
            label: '<span locale="LANG117">' + $P.lang("LANG117") + "</span>:" + addKannma(parseInt(disk_total - disk_avail)) + MB,
            data: parseInt(disk_total - disk_avail)
        }];

        $.plot($('#' + disk_name + total + '_graph'), disk, {
            colors: ["#AFD8F8", "#edc240"],
            series: {
                pie: {
                    show: true,
                    label: {
                        show: true,
                        radius: 2 / 5,
                        formatter: function(label, series) {
                            var percent = Math.round(series.percent);

                            if (percent == 0 && (series.percent > 0)) {
                                percent = 1;
                            }

                            if (percent == 100 && (series.percent < 100)) {
                                percent = 99;
                            }

                            return ('<div style="font-size:12px;text-align:center;padding:2px;color:white;">' + '<br/>' + percent + '%</div>');
                        },
                        background: {
                            opacity: 0
                        }
                    }
                }
            },
            legend: {
                show: true,
                labelFormatter: null, // fn: string -> string
                labelBoxBorderColor: null, // border color for the little label boxes
                container: null, // container (as jQuery object) to put legend in, null means default on top of graph
                position: "nw", // position of default legend container within plot
                margin: 0, // distance from grid edge to default legend container within plot
                backgroundColor: null, // null means auto-detect
                backgroundOpacity: 0 // set to 0 to avoid background
            }
        });
    }
}

function DrawPie(val) {
    var bool = UCMGUI.errorHandler(val);

    if (bool) {

        // close the loading dialog
        top.dialog.clearDialog();

        var val = val.response.body;

        drawPieDif(val, 'disk-total', 'disk-avail', 'pielist_disk', ' MB');
        drawPieDif(val, 'inode-total', 'inode-avail', 'pielist_node', '');
    }
}

function dataBind(val) {

    // close the loading dialog
    top.dialog.clearDialog();

    var disk_total = val["disk-total"],
        disk_avail = val["disk-avail"];

    var disk0 = [{
        label: $P.lang("LANG116"),
        data: disk_avail[0] - 1
    }, {
        label: $P.lang("LANG117"),
        data: disk_total[0] - disk_avail[0] - 1
    }];

    var disk1 = [{
        label: $P.lang("LANG116"),
        data: disk_avail[1] - 1
    }, {
        label: $P.lang("LANG117"),
        data: disk_total[1] - disk_avail[1] - 1
    }];

    $("div#disk0_size").html($P.lang("LANG115") + ":" + disk_total[0] + "MB");

    $("div#disk1_size").html($P.lang("LANG115") + ":" + disk_total[1] + "MB");

    $.plot($("#disk0_graph"), disk0, {
        series: {
            pie: {
                show: true,
                combine: {
                    color: '#999',
                    threshold: 0.1
                },
                label: {
                    show: true,
                    radius: 1,
                    formatter: function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' + label +
                            '<br/>' + series.data[0][1].toString() + 'MB' +
                            '<br/>' + Math.round(series.percent) + '%</div>';
                    },
                    background: {
                        opacity: 0.8
                    }
                }
            }
        },
        legend: {
            show: false
        }
    });

    $.plot($("#disk1_graph"), disk1, {
        series: {
            pie: {
                show: true,
                combine: {
                    color: '#999',
                    threshold: 0.1
                },
                label: {
                    show: true,
                    radius: 1,
                    formatter: function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' + label +
                            '<br/>' + series.data[0][1].toString() + 'MB' +
                            '<br/>' + Math.round(series.percent) + '%</div>';
                    },
                    background: {
                        opacity: 0.8
                    }
                }
            }
        },
        legend: {
            show: false
        }
    });
}

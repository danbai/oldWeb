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
    enableCheckBox = UCMGUI.domFunction.enableCheckBox,
    numPri = Number(config.model_info.num_pri),
    process_all = $('#all_processes'),
    chk_process = $(".process"),
    oldSyslogServer = "",
    oldSyslogbkEnabled = "",
    oldSyslogbkInterval = "";

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG661"));

    getSystemLogServer();

    initLogSwitchProcess();

    createTable();

    bindCheckBoxEvent();

    bindButtonEvent();

    // bind resize event, set table width
    $(window).resize(function() {
        $("#log_switch_static_list").setGridWidth($('#form').width());
    });

    initValidator();

    top.Custom.init(doc);
});

function initLogSwitchProcess() {
    if (numPri >= 1) {
        $('#log_switch_process_list tbody').append(
            '<tr class="ui-widget-content jqgrow ui-row-ltr">' +
                '<td class="wordBreak" style="text-align: center;">' +
                    '<span locale="LANG5307" localetitle="LANG5307">HA Log</span>' +
                '</td>' +
                '<td class="wordBreak" style="text-align: center;">' +
                    '<input type="checkbox" class="process" id="ha" name="ha" />' +
                '</td>' +
            '</tr>'
        );

        chk_process = $(".process");
    }
}

function bindCheckBoxEvent() {
    $('#form')
        .delegate('.normal', 'click', function(ev) {
            var id = this.id,
                table_name = id.split('-')[0];

            selectNormal(id, $("#" + table_name + " input"));

            ev.stopPropagation();
            // return false;
        })
        .delegate('.allRow', 'click', function(ev) {
            var id = this.id,
                table_name = id.split('-')[0];

            selectAllRow(id, $("#" + table_name + " input"));

            ev.stopPropagation();
            // return false;
        })
        .delegate('.AllColumn', 'click', function(ev) {
            var id = this.id,
                table_name = id.split('-')[0];

            selectAllColumn(id, $("#" + table_name + " input"));

            ev.stopPropagation();
            // return false;
        });

    process_all.bind("click", function(ev) {
        var process_chkbox_all = function(value) {
            var children = chk_process;

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

        if (this.checked) {
            process_chkbox_all(true);
        } else {
            process_chkbox_all(false);
        }
    });

    chk_process.bind("click", function(ev) {
        if (chk_process.filter(":checked").length != chk_process.length) {
            process_all[0].checked = false;
            process_all.prev().css("backgroundPosition", "0px 0px");
        } else {
            process_all[0].checked = true;
            process_all.prev().css("backgroundPosition", "0px -50px");
        }

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });

    $('#log_switch_process_list tbody td').bind("click", function(ev) {
        $(this).parent().addClass('ui-state-highlight').siblings().removeClass('ui-state-highlight');
    });
}

function createCheckbox(cellvalue, options, rowObject) {
    if (options.gid == 'log_switch_dynamic_list') {
        var checkbox = '<input type="checkbox" id="' + options.gid + '-' + rowObject.id + '_' +
            (options.pos + 1) + (cellvalue == '1' ? '" checked="checked' : '') + '" class="normal styled" />';
    } else {
        var checkbox = '<input type="checkbox" id="' + options.gid + '-' + rowObject.id + '_' +
            options.pos + (cellvalue == '1' ? '" checked="checked' : '') + '" class="normal styled" />';
    }

    return checkbox;
}

function createCheckboxHeader(cellvalue, options, rowObject) {
    var checkbox = '<input type="checkbox" id="' + options.gid + '-' + rowObject.id + '_all' + '" class="allRow styled" />';

    return checkbox;
}

function createTable() {
    $("#log_switch_static_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        autowidth: true,
        height: 228,
        postData: {
            "action": "listLogSwitchStatic",
            "log_switch_static": ''
        },
        colNames: [
            '<span locale="LANG4158"></span>',
            '<span locale="LANG4159"></span>',
            '<span>' + 'Error' + '</span>',
            '<span>' + 'Warn' + '</span>',
            '<span>' + 'Notice' + '</span>',
            '<span>' + 'Debug' + '</span>',
            '<span>' + 'Verbose' + '</span>'
        ],
        colModel: [{
            name: 'id',
            index: 'id',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createCheckboxHeader,
            sortable: false
        }, {
            name: 'module_name',
            index: 'module_name',
            width: 100,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'ERROR',
            index: 'ERROR',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createCheckbox,
            sortable: false
        }, {
            name: 'WARN',
            index: 'WARN',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createCheckbox,
            sortable: false
        }, {
            name: 'NOTIC',
            index: 'NOTIC',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createCheckbox,
            sortable: false
        }, {
            name: 'DEBUG',
            index: 'DEBUG',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createCheckbox,
            sortable: false
        }, {
            name: 'VERB',
            index: 'VERB',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createCheckbox,
            sortable: false
        }],
        pager: "#log_switch_static_pager",
        rowNum: 1000000,
        // rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'module_name',
        noData: "LANG129 LANG67",
        jsonReader: {
            root: "response.log_switch_static",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#log_switch_static_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            var lastInputId = $('#log_switch_static_list tr:last td:last').find('input').attr('id'),
                length = lastInputId.split('-')[1].split('_'),
                rowLength = length[0],
                colLength = length[1];

            var allModules = '<tr role="row" tabindex="-1" class="ui-widget-content jqgrow ui-row-ltr">' +
                '<td role="gridcell" style="text-align: center; position: relative;" title=""></td>' +
                '<td role="gridcell" style="text-align:center;" title="All Modules" locale="LANG4160"></td>' +
                '<td role="gridcell" style="text-align: center; position: relative;" title="">' +
                '<input type="checkbox" id="log_switch_static_list-all_2" class="AllColumn styled"></td>' +
                '<td role="gridcell" style="text-align: center; position: relative;" title="">' +
                '<input type="checkbox" id="log_switch_static_list-all_3" class="AllColumn styled"></td>' +
                '<td role="gridcell" style="text-align: center; position: relative;" title="">' +
                '<input type="checkbox" id="log_switch_static_list-all_4" class="AllColumn styled"></td>' +
                '<td role="gridcell" style="text-align: center; position: relative;" title="">' +
                '<input type="checkbox" id="log_switch_static_list-all_5" class="AllColumn styled"></td>' +
                '<td role="gridcell" style="text-align: center; position: relative;" title="">' +
                '<input type="checkbox" id="log_switch_static_list-all_6" class="AllColumn styled"></td></tr>';

            $('#log_switch_static_list .jqgfirstrow').after(allModules);

            $('#log_switch_static_pager').hide();

            for (var i = 1; i <= rowLength; i++) {
                var select_row = true;

                for (var j = 2; j <= colLength; j++) {
                    var ele = $('#log_switch_static_list-' + i + '_' + j)[0];

                    if (ele && !ele.checked) {
                        select_row = false;
                        break;
                    }
                }

                if (select_row) {
                    var eleAll = $('#log_switch_static_list-' + i + '_all')[0];

                    if (eleAll) {
                        eleAll.checked = true;
                    }
                }
            }

            for (var j = 2; j <= colLength; j++) {
                var select_column = true;

                for (var i = 1; i <= rowLength; i++) {
                    var ele = $('#log_switch_static_list-' + i + '_' + j)[0];

                    if (ele && !ele.checked) {
                        select_column = false;
                        break;
                    }
                }

                if (select_column) {
                    var eleAll = $('#log_switch_static_list-' + 'all_' + j)[0];

                    if (eleAll) {
                        eleAll.checked = true;
                    }
                }
            }

            $("#log_switch_static_list").setGridWidth($('#form').width());

            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });

    $("#log_switch_dynamic_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: 450,
        autowidth: false,
        shrinkToFit: true,
        height: "auto",
        postData: {
            "action": "listLogSwitchDynamic",
            "log_switch_dynamic": ''
        },
        colNames: [
            '<span locale="LANG4161"></span>',
            '<span locale="LANG4162"></span>'
        ],
        colModel: [{
            name: 'dlevel',
            index: 'dlevel',
            width: 100,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'switch',
            index: 'switch',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createCheckbox,
            sortable: false
        }],
        pager: "#log_switch_dynamic_pager",
        rowNum: 1000000,
        // rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        // sortname: 'id',
        noData: "LANG129 LANG67",
        jsonReader: {
            root: "response.log_switch_dynamic",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#log_switch_dynamic_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            var lastInputId = $('#log_switch_dynamic_list tr:last td:last').find('input').attr('id'),
                length = lastInputId.split('-')[1].split('_'),
                rowLength = length[0],
                colLength = length[1];

            var allModules = '<tr role="row" tabindex="-1" class="ui-widget-content jqgrow ui-row-ltr">' +
                '<td role="gridcell" style="text-align:center;" title="All Modules" locale="LANG4160"></td>' +
                '<td role="gridcell" style="text-align: center; position: relative;" title="">' +
                '<input type="checkbox" id="log_switch_dynamic_list-all_2" class="AllColumn styled"></td></tr>';

            $('#log_switch_dynamic_list .jqgfirstrow').after(allModules);

            $('#log_switch_dynamic_pager').hide();

            for (var j = 2; j <= colLength; j++) {
                var select_column = true;

                for (var i = 1; i <= rowLength; i++) {
                    var ele = $('#log_switch_dynamic_list-' + i + '_' + j)[0];

                    if (ele && !ele.checked) {
                        select_column = false;
                        break;
                    }
                }

                if (select_column) {
                    var eleAll = $('#log_switch_dynamic_list-' + 'all_' + j)[0];

                    if (eleAll) {
                        eleAll.checked = true;
                    }
                }
            }

            $P.lang(doc, true);

            $("#log_switch_dynamic_list-4_2").bind("click", function(ev) {
                var me = this,
                    listDiv = $("#log_switch_dynamic_list").get(0),
                    checkbox = $("input[type=checkbox]", listDiv);

                if (!me.checked && checkbox[0]) {
                    checkbox[0].checked = false;

                    var flag = true;

                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG2997"),
                        buttons: {
                            ok: function() {

                            },
                            cancel: function() {
                                me.checked = true;

                                for (var i = 1; i < checkbox.length - 1; i++) {
                                    if (!checkbox[i].checked) {
                                        flag = false;
                                    }
                                }

                                if (flag) {
                                    checkbox[0].checked = true;
                                }

                                top.Custom.init(doc, listDiv);
                            }
                        }
                    });
                } else {
                    for (var i = 1; i < checkbox.length - 1; i++) {
                        if (!checkbox[i].checked) {
                            flag = false;
                        }
                    }

                    if (flag && checkbox[0]) {
                        checkbox[0].checked = true;
                    }
                }

                top.Custom.init(doc, listDiv);

                ev.stopPropagation();
            });

            $("#log_switch_dynamic_list-all_2").on('click', function() {
                if (this.checked == false) {
                    $("#log_switch_dynamic_list-4_2").trigger("click");
                } 
            });

            top.Custom.init(doc);
        }
    });

    $.ajax({
        type: "GET",
        url: "../cgi?action=getLogSwitch",
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
                var settings = data.response;

                $('#cdrapi')[0].checked = (settings.cdrapi === '1' ? true : false);
                $('#pbxmid')[0].checked = (settings.pbxmid === '1' ? true : false);
                $('#apply_python')[0].checked = (settings.apply_python === '1' ? true : false);
                $('#cgi')[0].checked = (settings.cgi === '1' ? true : false);
                $('#warning')[0].checked = (settings.warning === '1' ? true : false);
                $('#zeroconfig')[0].checked = (settings.zeroconfig === '1' ? true : false);

                if (numPri >= 1) {
                    $('#ha')[0].checked = (settings.ha === '1' ? true : false);
                }

                if (chk_process.filter(":checked").length === chk_process.length) {
                    process_all[0].checked = true;
                    process_all.prev().css("backgroundPosition", "0px -50px");
                }
            }
        }
    });
}

function getSystemLogServer() {
    enableCheckBox({
        enableCheckBox: 'syslogbk_enabled',
        enableList: 'syslogbk_interval'
    }, doc);

    $.ajax({
        type: "GET",
        url: "../cgi?action=getSyslogValue&syslog-server&syslogbk_interval&syslogbk_enabled",
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();

            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data),
                data = data.response;

            if (bool) {
                oldSyslogServer = data['syslog-server'];
                oldSyslogbkEnabled = data['syslogbk_enabled'];
                oldSyslogbkInterval = data['syslogbk_interval'];

                $('#syslog-server').val(oldSyslogServer);
                $('#syslogbk_enabled')[0].checked = (oldSyslogbkEnabled === '1');
                $('#syslogbk_interval').val(oldSyslogbkInterval)[0].disabled = (oldSyslogbkEnabled === '0');
            }
        }
    });
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "syslogbk_interval": {
                digits: true,
                range: [3, 120]
            },
            "P207": {
                host: [$P.lang('LANG1395')]
            }
        },
        submitHandler: function() {
            saveChanges();
        }
    });
}

function saveChanges() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG826")
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "setSyslogValue",
            "syslog-server": $('#syslog-server').val(),
            "syslogbk_enabled": $('#syslogbk_enabled')[0].checked ? '1' : '0',
            "syslogbk_interval": $('#syslogbk_interval').val()
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var logSwitchStaticData = [],
                    lastInputId = $('#log_switch_static_list tr:last td:last').find('input').attr('id'),
                    length = lastInputId.split('-')[1].split('_'),
                    rowLength = length[0],
                    colLength = length[1];

                for (var i = 1; i <= rowLength; i++) {
                    var itemData = [i];

                    for (var j = 2; j <= colLength; j++) {
                        var ele = $('#log_switch_static_list-' + i + '_' + j)[0];

                        if (ele && ele.checked) {
                            itemData.push(1);
                        } else {
                            itemData.push(0);
                        }
                    }

                    logSwitchStaticData.push(itemData);
                }

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        "action": "updateLogSwitchStatic",
                        "log_switch_static": JSON.stringify({
                            "SCHEMA": ["id", "ERROR", "WARN", "NOTIC", "DEBUG", "VERB"],
                            "TYPE": ["INT", "INT", "INT", "INT", "INT", "INT"],
                            "data": logSwitchStaticData
                        }),
                        "ERROR": '',
                        "WARN": '',
                        "NOTIC": '',
                        "VERB": '',
                        "DEBUG": ''
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
                            var logSwitchDynamicData = [],
                                lastInputId = $('#log_switch_dynamic_list tr:last td:last').find('input').attr('id'),
                                length = lastInputId.split('-')[1].split('_'),
                                rowLength = length[0],
                                colLength = length[1];

                            for (var i = 1; i <= rowLength; i++) {
                                var itemData = [i];

                                for (var j = 2; j <= colLength; j++) {
                                    var ele = $('#log_switch_dynamic_list-' + i + '_' + j)[0];

                                    if (ele && ele.checked) {
                                        itemData.push(1);
                                    } else {
                                        itemData.push(0);
                                    }
                                }

                                logSwitchDynamicData.push(itemData);
                            }

                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "updateLogSwitchDynamic",
                                    "log_switch_dynamic": JSON.stringify({
                                        "SCHEMA": ["id", "switch"],
                                        "TYPE": ["INT", "INT"],
                                        "data": logSwitchDynamicData
                                    }),
                                    "switch": ''
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
                                    var bool = UCMGUI.errorHandler(data),
                                        data = {
                                            "action": "setLogSwitch",
                                            "cdrapi": ($('#cdrapi').is(':checked') ? '1' : '0'),
                                            "pbxmid": ($('#pbxmid').is(':checked') ? '1' : '0'),
                                            "apply_python": ($('#apply_python').is(':checked') ? '1' : '0'),
                                            "cgi": ($('#cgi').is(':checked') ? '1' : '0'),
                                            "warning": ($('#warning').is(':checked') ? '1' : '0'),
                                            "zeroconfig": ($('#zeroconfig').is(':checked') ? '1' : '0')
                                        };

                                    if (numPri >= 1) {
                                        data['ha'] = $('#ha').is(':checked') ? '1' : '0';
                                    }

                                    if (bool) {
                                        $.ajax({
                                            type: "post",
                                            url: "../cgi",
                                            data: data,
                                            async: false,
                                            error: function(jqXHR, textStatus, errorThrown) {
                                                top.dialog.clearDialog();

                                                top.dialog.dialogMessage({
                                                    type: 'error',
                                                    content: errorThrown
                                                });
                                            },
                                            success: function(data) {
                                                var bool = UCMGUI.errorHandler(data),
                                                    syslogServer = $("#syslog-server").val(),
                                                    syslogbkEnabled = $("#syslogbk_enabled")[0].checked ? "1" : "0",
                                                    syslogbkInterval = $("#syslogbk_interval").val();

                                                if (bool && (oldSyslogServer != syslogServer || oldSyslogbkEnabled != syslogbkEnabled || (!$("#syslogbk_interval")[0].disabled && (oldSyslogbkInterval != syslogbkInterval)))) {
                                                    oldSyslogServer = syslogServer;
                                                    oldSyslogbkEnabled = syslogbkEnabled;
                                                    oldSyslogbkInterval = syslogbkInterval;
                                                    
                                                    $.ajax({
                                                        type: "post",
                                                        url: "../cgi",
                                                        data: {
                                                            "action": "restartSyslog",
                                                            "syslog-restart": ""
                                                        },
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
                                                                var after = function() { // after();
                                                                    // top.dialog.clearDialog();
                                                                    top.dialog.dialogMessage({
                                                                        type: 'success',
                                                                        content: $P.lang("LANG815")
                                                                    });
                                                                };

                                                                setTimeout(after, 500);
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    top.dialog.dialogMessage({
                                                        type: 'success',
                                                        content: $P.lang("LANG815")
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

function selectAllRow(id, inputs) {
    var id_arr = id.split("-");

    if (id_arr.length != 2) { // an id should have 2 parts; before - is table_name, after is row_column;
        return;
    }

    var row_column_arr = id_arr[1].split("_");

    if (row_column_arr.length != 2) {
        return;
    }

    var table_name = id_arr[0],
        row = row_column_arr[0],
        column = row_column_arr[1];

    // $("#" + table_name + " input").each(function() {
    inputs.each(function() {
        var rid = $(this).attr("id"),
            rid_arr = rid.split("-"),
            r_table = rid_arr[0],
            r_c_arr = rid_arr[1].split("_"),
            r_row = r_c_arr[0],
            r_column = r_c_arr[1];

        if (r_table == table_name && r_row == row && r_column != column) {
            var ele = $("#" + id)[0];

            if (ele && !ele.checked && $(this)[0] && $(this)[0].checked) {
                $(this)[0].checked = false;

                $(this).prev().css("backgroundPosition", "0px 0px");

                selectNormal(rid, inputs);
            } else if (ele && ele.checked && $(this)[0] && !$(this)[0].checked) {
                $(this)[0].checked = true;

                $(this).prev().css("backgroundPosition", "0px -50px");

                selectNormal(rid, inputs);
            }
        }
    });
}

function selectAllColumn(id, inputs) {
    var id_arr = id.split("-");

    if (id_arr.length != 2) { // an id should have 2 parts; before - is table_name, after is row_column;
        return;
    }

    var row_column_arr = id_arr[1].split("_");

    if (row_column_arr.length != 2) {
        return;
    }

    var table_name = id_arr[0],
        row = row_column_arr[0],
        column = row_column_arr[1];

    // $("#" + table_name + " input").each(function() {
    inputs.each(function() {
        var rid = $(this).attr("id"),
            rid_arr = rid.split("-"),
            r_table = rid_arr[0],
            r_c_arr = rid_arr[1].split("_"),
            r_row = r_c_arr[0],
            r_column = r_c_arr[1];

        if (r_table == table_name && r_row != row && r_column == column) {
            var ele = $("#" + id)[0];

            if (ele && !ele.checked && $(this)[0] && $(this)[0].checked) {
                $(this)[0].checked = false;

                $(this).prev().css("backgroundPosition", "0px 0px");

                selectNormal(rid, inputs);
            } else if (ele && ele.checked && $(this)[0] && !$(this)[0].checked) {
                $(this)[0].checked = true;

                $(this).prev().css("backgroundPosition", "0px -50px");

                selectNormal(rid, inputs);
            }
        }
    });
}

function selectNormal(id, inputs) {
    var id_arr = id.split("-"),
        table_name = "",
        row = -1,
        column = -1,
        row_id = "",
        column_id = "";

    if (id_arr.length != 2) { // an id should have 2 parts; before - is table_name, after is row_column;
        return;
    }

    var row_column_arr = id_arr[1].split("_");

    if (row_column_arr.length != 2) {
        return;
    }

    table_name = id_arr[0];
    row = row_column_arr[0];
    column = row_column_arr[1];

    row_id = "#" + table_name + "-" + row + "_all";
    column_id = "#" + table_name + "-all_" + column;

    var ele = $("#" + id)[0];

    if (ele && !ele.checked) { // unselect
        var el = $(column_id);

        if (el.length > 0 && el[0].checked) {
            el[0].checked = false;

            $(el).prev().css("backgroundPosition", "0px 0px");
        }

        el = $(row_id);

        if (el.length > 0 && el[0].checked) {
            el[0].checked = false;

            $(el).prev().css("backgroundPosition", "0px 0px");
        }
    } else {
        var select_row = true,
            select_column = true;

        // $("#" + table_name + " input").each(function() {
        inputs.each(function() {
            var rid = $(this).attr("id"),
                rid_arr = rid.split("-"),
                r_table = rid_arr[0],
                r_c_arr = rid_arr[1].split("_"),
                r_row = r_c_arr[0],
                r_column = r_c_arr[1];

            if (r_table == table_name && r_row == row && r_column != column && r_column != "all") {
                if ($(this)[0] && !$(this)[0].checked) {
                    select_row = false;
                }
            }

            if (r_table == table_name && r_row != row && r_row != "all" && r_column == column) {
                if ($(this)[0] && !$(this)[0].checked) {
                    select_column = false;
                }
            }
        });

        var eleRow = $(row_id)[0];

        if (select_row && $(row_id).length > 0 && eleRow && !eleRow.checked) {
            eleRow.checked = true;

            $(row_id).prev().css("backgroundPosition", "0px -50px");
        }

        var eleCol = $(column_id)[0]

        if (select_column && $(column_id).length > 0 && eleCol && !eleCol.checked) {
            eleCol.checked = true;

            $(column_id).prev().css("backgroundPosition", "0px -50px");
        }
    }
}

function bindButtonEvent() {
    $("#download").bind('click', function(ev) {
        var data = {
            action: "downloadFile",
            type: "syslog"
        };

        $P.download(baseServerURl, data, 'post');

        ev.stopPropagation();
        return false;
    });

    $("#clean").bind('click', function(ev) {
        var action = {
            action: "removeFile",
            type: "syslog"
        };

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {
                top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown
                });
            },
            success: function(data) {
                top.dialog.clearDialog();

                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG871")
                    });
                }
            }
        });

        ev.stopPropagation();
        return false;
    });
}
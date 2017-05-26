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
    updateDocumentException = UCMGUI.domFunction.updateDocumentException;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG695"));

    getSIPNATSettings();

    createTable();

    bindButtonEvent();

    initValidator();
});

function getSIPNATSettings() {
    var action = {
        action: 'getSIPNATSettings'
    };

    $.ajax({
        url: '../cgi',
        type: "GET",
        dataType: "json",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var sip_nat_settings = data.response.sip_nat_settings;

                UCMGUI.domFunction.updateDocument(sip_nat_settings, doc);

                var ipInSdpConnection = sip_nat_settings.ip_in_sdp_connection;

                if ((sip_nat_settings.externhost == null || sip_nat_settings.externhost.length == 0) && sip_nat_settings.hasOwnProperty('externip')) {
                    $('#externhost').val(sip_nat_settings.externip);
                }

                if (ipInSdpConnection == null) {
                    $('#ip_in_sdp_connection')[0].checked = true;;
                } else {
                    $('#ip_in_sdp_connection')[0].checked = (ipInSdpConnection == 1 ? true : false);
                }
                if (sip_nat_settings.hasOwnProperty('externudpport') && sip_nat_settings.externudpport == 0) {
                    $('#externudpport').val('5060');
                }
                if (sip_nat_settings.hasOwnProperty('externtcpport') && sip_nat_settings.externtcpport == 0) {
                    $('#externtcpport').val('5060');
                }

                if (sip_nat_settings.hasOwnProperty('externtlsport') && sip_nat_settings.externtlsport == 0) {
                    $('#externtlsport').val('5061');
                }
            }
        }
    });
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#btnAdd', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2807"),
                displayPos: "user_list_modal",
                frameSrc: "html/sip_nat_modal.html?mode=add"
            });

            ev.stopPropagation();
            return false;
        });

    $("#sip_list")
        .delegate('.edit', 'click', function(ev) {
            var rowid = $(this).attr('rowid'),
                localnetaddr = $(this).attr('localnetaddr'),
                localnetlen = $(this).attr('localnetlen');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG5245").format(localnetaddr),
                displayPos: "user_list_modal",
                frameSrc: "html/sip_nat_modal.html?mode=edit&rowid=" + rowid + "&localnetaddr=" + localnetaddr + '&localnetlen=' + localnetlen
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var rowid = $(this).attr('rowid'),
                localnetaddr = $(this).attr('localnetaddr'),
                confirmStr = "LANG818";

            top.dialog.dialogConfirm({
                confirmStr: $P.lang(confirmStr).format(localnetaddr),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteSipNetAddrSettings",
                            "rowid": rowid
                        };

                        $.ajax({
                            type: "post",
                            url: "../cgi",
                            data: action,
                            error: function(jqXHR, textStatus, errorThrown) {
                            },
                            success: function(data) {
                                var bool = UCMGUI.errorHandler(data);

                                if (bool) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816")
                                    });

                                    var table = $("#sip_list"),
                                        totalPage = table.getGridParam("lastpage"),
                                        page = table.getGridParam("page"),
                                        reccount = table.getGridParam("reccount");

                                    if (page === totalPage && totalPage > 1 && reccount === 1) {
                                        table.setGridParam({
                                            page: totalPage - 1
                                        }).trigger('reloadGrid');
                                    } else {
                                        table.trigger('reloadGrid');
                                    }
                                }
                            }
                        });
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });
}

function createOptions(cellvalue, options, rowObject) {
    var edit = '<button localnetaddr="' + rowObject.localnetaddr + '" localnetlen="' + rowObject.localnetlen + '" rowid="' + rowObject.rowid + '" title="Edit" localetitle="LANG738" class="options edit"></button>';

    var del = '<button localnetaddr="' + rowObject.localnetaddr + '" localnetlen="' + rowObject.localnetlen + '" rowid="' + rowObject.rowid + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return (edit + del);
}

function createTable() {
    $("#sip_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listSipNetAddrSettings"
        },
        colNames: [
            '<span locale="LANG1845">' + $P.lang('LANG1845') + '</span>',
            '<span locale="LANG3051">' + $P.lang('LANG3051') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'localnetaddr',
            index: 'localnetaddr',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'localnetlen',
            index: 'localnetlen',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#sip-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'localnetaddr',
        noData: "LANG129 LANG1845",
        jsonReader: {
            root: "response.sip_nat_addr",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#sip_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function checkPort(value, element) {
    if (value.indexOf(':') === -1) {
        return true;
    }

    var val = value.split(":")[1];

    if (val < 0 || val > 65535) {
        return false;
    }
    return true;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "externhost": {
                hostWithoutIpv6: [$P.lang('LANG547').toLowerCase()],
                customCallback: [$P.lang("LANG957"), checkPort]
            },
            "externudpport": {
                required: true,
                digits: true,
                range: [1, 65535]
            },
            "externtcpport": {
                required: true,
                digits: true,
                range: [1, 65535]
            },
            "externtlsport": {
                required: true,
                digits: true,
                range: [1, 65535]
            }
        },
        submitHandler: function() {
            var action = UCMGUI.formSerializeVal(document);
            action["action"] = "updateSIPNATSettings";
            action["ip_in_sdp_connection"] =  $("#ip_in_sdp_connection").is(":checked") ? 1 : 0;

            $.ajax({
                type: "post",
                url: "../cgi",
                data: action,
                success: function(data) {
                    var bool = UCMGUI.errorHandler(data);

                    if (bool) {
                        var after = function() {
                            top.dialog.dialogConfirm({
                                confirmStr: $P.lang("LANG927"),
                                buttons: {
                                    ok: UCMGUI.loginFunction.confirmReboot,
                                    cancel: function() {
                                        window.location.reload();
                                    }
                                }
                            });
                        };

                        setTimeout(function() {
                            after();
                        }, 300);
                    }
                }
            });
        }
    });
}
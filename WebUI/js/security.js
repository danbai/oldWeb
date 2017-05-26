/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 * This project extends Asterisk GUI project and contains Grandstream Network's
 * implementation which uses Asterisk GUI.
 *
 * Asterisk and Asterisk GUI are registered trademarks of Digium, Inc.
 * Please see http://www.asterisk.org for more information about the Asterisk
 * project.
 *
 * This program is free software, distributed under the terms of
 * the GNU General Public License Version 2. See the LICENSE file
 * at the top of the source tree.
 *
 * Modifications:
 * Added for support Security functions
 *
 */
var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    typicalFirewallSettings = {},
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    FW_OLD_NAME = "",
    ruleNameList = [],
    ruleActList = {},
    mode = gup("mode"),
    item = gup("item"),
    DOM_new_fw_name,
    DOM_new_fw_interface,
    DOM_new_fw_action,
    DOM_new_fw_proto,
    DOM_new_fw_type,
    DOM_new_fw_services,
    loadRuleCompleted = false,
    LoginPort,
    sequence,
    isNew,
    nMethodMode;

String.prototype.format = top.String.prototype.format;

window.onload = function() {
    $P.lang(document, true);

    loadTypicalSettings();

    loadDOMElements();

    if (mode) {
        initValidator();

        loadRuleName();

        if (mode == "add") {
            prepareAddItemForm();
        } else if (mode == "edit") {
            sequence = gup("sequence");
            prepareEditItemForm(item);
        }

        return false; // bypass reload dialog
    } else {
        top.document.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG38"));

        $("title").attr("locale", "LANG38");

        update_FirewallTable();

        loadActionList();

        bindGridButtons();
    }

    getNetstatInfo();

    top.Custom.init(doc);
};

var bindGridButtons = function() {
    $("#firewall_list")
        .delegate('.rule_clickTop', 'click', function(ev) {
            var sequence = $(this).attr('sequence');

            if (loadRuleCompleted && (sequence != 1)) {
                loadRuleCompleted = false;

                var action = {
                    "action": "moveStaticDefenseTop",
                    "sequence": sequence
                };

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: action,
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.clearDialog();

                        top.dialog.dialogMessage({
                            type: 'error',
                            content: errorThrown,
                            callback: function() {
                                // UCMGUI.logoutFunction.doLogout();
                            }
                        });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            $("#firewall_list").trigger('reloadGrid');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.rule_clickUp', 'click', function(ev) {
            var sequence = $(this).attr('sequence');

            if (loadRuleCompleted && (sequence != 1)) {
                loadRuleCompleted = false;

                var action = {
                    "action": "moveStaticDefenseUp",
                    "sequence": sequence
                };

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: action,
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.clearDialog();

                        top.dialog.dialogMessage({
                            type: 'error',
                            content: errorThrown,
                            callback: function() {
                                // UCMGUI.logoutFunction.doLogout();
                            }
                        });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            $("#firewall_list").trigger('reloadGrid');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.rule_clickDown', 'click', function(ev) {
            var sequence = $(this).attr('sequence'),
                records = $("#firewall_list").getGridParam("records");

            if (loadRuleCompleted && (sequence != records)) {
                loadRuleCompleted = false;

                var action = {
                    "action": "moveStaticDefenseDown",
                    "sequence": sequence
                };

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: action,
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.clearDialog();

                        top.dialog.dialogMessage({
                            type: 'error',
                            content: errorThrown,
                            callback: function() {
                                // UCMGUI.logoutFunction.doLogout();
                            }
                        });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            $("#firewall_list").trigger('reloadGrid');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.rule_clickBottom', 'click', function(ev) {
            var sequence = $(this).attr('sequence'),
                records = $("#firewall_list").getGridParam("records");

            if (loadRuleCompleted && (sequence != records)) {
                loadRuleCompleted = false;

                var action = {
                    "action": "moveStaticDefenseBottom",
                    "sequence": sequence
                };

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: action,
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.clearDialog();

                        top.dialog.dialogMessage({
                            type: 'error',
                            content: errorThrown,
                            callback: function() {
                                // UCMGUI.logoutFunction.doLogout();
                            }
                        });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            $("#firewall_list").trigger('reloadGrid');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        });
};

var checkIfAllowed = function(ruleActList) {
    for (var item in ruleActList) {
        if (ruleActList[item]['rule_act'] == 'accept' && ruleActList[item]['dest_port'] == LoginPort && ruleActList[item]['protocol'] != 'udp' &&
            ruleActList[item]['type'] == 'in' && (nMethodMode == '1' || ruleActList[item]['interface'] === 'Both')) {
            return true;
        }
    }

    return false;
};

var loadActionList = function() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listStaticDefense',
            'options': 'rule_act,dest_port,protocol,type,interface'
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
                var ruleNames = data.response.rule_name,
                    rejectAll = $('#rejectAll')[0];

                ruleActList = ruleNames;

                if (rejectAll.disabled) {
                    if (checkIfAllowed(ruleActList)) {
                        rejectAll.disabled = false;
                        top.Custom.init(doc, rejectAll);
                    } else {
                        if (rejectAll.checked) {
                            rejectAll.checked = false;
                            top.Custom.init(doc, rejectAll);
                            applyChanges(false);
                        }
                    }
                } else {
                    if (!checkIfAllowed(ruleActList)) {
                        rejectAll.disabled = true;
                        top.Custom.init(doc, rejectAll);

                        if (rejectAll.checked) {
                            rejectAll.checked = false;
                            top.Custom.init(doc, rejectAll);
                            applyChanges(false);
                        }
                    }
                }
            }
        }
    });
};

var loadRuleName = function() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'listStaticDefense',
            'options': 'rule_name'
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
                var ruleNames = data.response.rule_name;

                for (var i = 0; i < ruleNames.length; i++) {
                    ruleNameList.push(ruleNames[i]['rule_name']);
                }
            }
        }
    });
};

var loadTypicalSettings = function() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'getTypicalFirewallSettings'
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
                typicalFirewallSettings = data.response.typical_firewallsettings;
            }
        }
    });
};

var loadDOMElements = function(editor) {
    // initialize interface
    interfaceInit();

    DOM_new_fw_name = _$('new_fw_name');
    DOM_new_fw_interface = _$('new_fw_interface');
    DOM_new_fw_action = _$('new_fw_act');
    DOM_new_fw_proto = _$('new_fw_proto');
    DOM_new_fw_type = _$('new_fw_type');
    DOM_new_fw_services = _$('new_fw_services');

    var type = $('#new_fw_type');
    type.change(function() {
        var el = _$('new_fw_type');

        if (el.value == "in") {
            $('#new_fw_interf').show();
        } else if (el.value == "out") {
            $('#new_fw_interf').hide();
        }

        top.dialog.repositionDialog("none");
    });

    var rule_service = $('#new_fw_services');
    rule_service.change(function() {
        var el = _$('new_fw_services');

        if (el.value == "custom") {
            $('#new_fw_src').show();
            $('#new_fw_dst').show();
            $('#new_fw_proto_container').show();
        } else {
            $('#new_fw_src').hide();
            $('#new_fw_dst').hide();
            $('#new_fw_proto_container').hide();
        }

        if (window.frameElement) {
            $(window.frameElement).css("height", "0px");
        }

        top.dialog.repositionDialog("none");
    });
};

var initValidator = function() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "new_fw_name": {
                required: true,
                letterDigitUndHyphen: true,
                // notEqualTo: ['reject_all', $('#rejectRuleName')]
                customCallback: [$P.lang("LANG3836"), check_name_exist]
            },
            "new_fw_act": {
                required: true
            },
            "new_fw_proto": {
                required: true
            },
            "new_fw_type": {
                required: true
            },
            "new_fw_interface": {
                required: true
            },
            "new_fw_services": {
                required: true,
                customCallback: [$P.lang("LANG3837"), check_service]
            },
            "new_fw_src_ipaddr": {
                customCallback: [$P.lang("LANG2195"), check_ipaddr],
                customCallback1: [$P.lang("LANG3511").format("1", "32"), check_ipsub]
            },
            "new_fw_src_port": {
                customCallback: [$P.lang("LANG2767"), check_port]
            },
            "new_fw_dst_ipaddr": {
                customCallback: [$P.lang("LANG2195"), check_ipaddr],
                customCallback1: [$P.lang("LANG3511").format("1", "32"), check_ipsub]
            },
            "new_fw_dst_port": {
                customCallback: [$P.lang("LANG2767"), check_port]
            }
        },
        submitHandler: function(ev) {
            var target = this.submitButton;

            if ($(target).attr('id') !== 'save') {
                return;
            }

            new_fw_save_go(ev);
        }
    });
};

var createAddress = function(cellvalue, options, rowObject) {
    var span;

    if (options.colModel.index === 'source_addr') {
        if (rowObject.source_sub) {
            span = 'Address:' + cellvalue + '/' + rowObject.source_sub + ' Port:';
        } else {
            span = 'Address:' + cellvalue + ' Port:';
        }

        if (rowObject.source_port == -1) {
            span += 'Any';
        } else {
            span += rowObject.source_port;
        }
    } else if (options.colModel.index === 'dest_addr') {
        if (rowObject.dest_sub) {
            span = 'Address:' + cellvalue + '/' + rowObject.dest_sub + ' Port:';
        } else {
            span = 'Address:' + cellvalue + ' Port:';
        }

        if (rowObject.dest_port == -1) {
            span += 'Any';
        } else {
            span += rowObject.dest_port;
        }
    }

    return span;
};

var createOptions = function(cellvalue, options, rowObject) {
    var records = $("#firewall_list").getGridParam("records"),
        btn = "<button type='button' class='options edit' onclick=\"showFirewallEditForm('" + rowObject.rule_name + "','" + rowObject.sequence + "')\" localeTitle='LANG738'></button>&nbsp;" +
        "<button type='button' class='options del' onclick=\"delete_FW_confirm('" + rowObject.rule_name + "')\" localeTitle='LANG739'></button>";

    if (rowObject.sequence == 1 && rowObject.sequence == records) {
        btn += "<button class='rule_clickTop options disabled' localeTitle='LANG793' style='cursor: default;' title='" + $P.lang('LANG793') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickUp options disabled' localeTitle='LANG794' style='cursor: default;' title='" + $P.lang('LANG794') + "'sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickDown options disabled' localeTitle='LANG795' style='cursor: default;' title='" + $P.lang('LANG795') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickBottom options disabled' localeTitle='LANG796' style='cursor: default;' title='" + $P.lang('LANG796') + "' sequence='" + rowObject.sequence + "'></button>";
    } else if (rowObject.sequence == 1) {
        btn += "<button class='rule_clickTop options disabled' localeTitle='LANG793' style='cursor: default;' title='" + $P.lang('LANG793') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickUp options disabled' localeTitle='LANG794' style='cursor: default;' title='" + $P.lang('LANG794') + "'sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickDown options' localeTitle='LANG795' title='" + $P.lang('LANG795') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickBottom options' localeTitle='LANG796' title='" + $P.lang('LANG796') + "' sequence='" + rowObject.sequence + "'></button>";
    } else if (rowObject.sequence == records) {
        btn += "<button class='rule_clickTop options' localeTitle='LANG793' title='" + $P.lang('LANG793') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickUp options' localeTitle='LANG794' title='" + $P.lang('LANG794') + "'sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickDown options disabled' style='cursor: default;' localeTitle='LANG795' title='" + $P.lang('LANG795') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickBottom options disabled' style='cursor: default;' localeTitle='LANG796' title='" + $P.lang('LANG796') + "' sequence='" + rowObject.sequence + "'></button>";
    } else {
        btn += "<button class='rule_clickTop options' localeTitle='LANG793' title='" + $P.lang('LANG793') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickUp options' localeTitle='LANG794' title='" + $P.lang('LANG794') + "'sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickDown options' localeTitle='LANG795' title='" + $P.lang('LANG795') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickBottom options' localeTitle='LANG796' title='" + $P.lang('LANG796') + "' sequence='" + rowObject.sequence + "'></button>";
    }

    return btn;
};

var update_FirewallTable = function() {
    // typical firewall settings
    var fw_attr = typicalFirewallSettings;

    if (fw_attr.hasOwnProperty('ping_enable') && fw_attr['ping_enable'] && (typeof fw_attr['ping_enable'] === "string")) {
        var values = fw_attr['ping_enable'].split(',');

        for (var i = 0; i < values.length; i++) {
            var chkbox = $('#ping_container').find('input');
            for (var j = 0; chkbox && j < chkbox.length; j++) {
                var chkboxVal = "WAN";
                var val = "WAN";
                if (chkbox[j].value == "LAN2" || chkbox[j].value == "WAN") {
                    chkboxVal = "WAN";
                }
                if (chkbox[j].value == "lan" || chkbox[j].value == "LAN1" || chkbox[j].value == "LAN") {
                    chkboxVal = "LAN";
                }
                if (values[i] == "LAN2" || values[i] == "WAN") {
                    val = "WAN";
                }
                if (values[i] == "lan" || values[i] == "LAN1" || values[i] == "LAN") {
                    val = "LAN";
                }
                if (val == chkboxVal) {
                    chkbox[j].checked = true;
                    break;
                }
            }
        }
    }

    if (fw_attr.hasOwnProperty('ping_of_death') && fw_attr['ping_of_death'] && (typeof fw_attr['ping_of_death'] === "string")) {
        var values = fw_attr['ping_of_death'].split(',');

        for (var i = 0; i < values.length; i++) {
            var chkbox = $('#deathping_container').find('input');

            for (var j = 0; chkbox && j < chkbox.length; j++) {
                var chkboxVal = "WAN";
                var val = "WAN";
                if (chkbox[j].value == "LAN2" || chkbox[j].value == "WAN") {
                    chkboxVal = "WAN";
                }
                if (chkbox[j].value == "lan" || chkbox[j].value == "LAN1" || chkbox[j].value == "LAN") {
                    chkboxVal = "LAN";
                }
                if (values[i] == "LAN2" || values[i] == "WAN") {
                    val = "WAN";
                }
                if (values[i] == "lan" || values[i] == "LAN1" || values[i] == "LAN") {
                    val = "LAN";
                }
                if (val == chkboxVal) {
                    chkbox[j].checked = true;
                    break;
                }
            }
        }
    }

    if (fw_attr.hasOwnProperty('syn_flood') && fw_attr['syn_flood'] && (typeof fw_attr['syn_flood'] === "string")) {
        var values = fw_attr['syn_flood'].split(',');

        for (var i = 0; i < values.length; i++) {
            for (var j = 0; chkbox && j < chkbox.length; j++) {
                var chkboxVal = "WAN";
                var val = "WAN";
                if (chkbox[j].value == "LAN2" || chkbox[j].value == "WAN") {
                    chkboxVal = "WAN";
                }
                if (chkbox[j].value == "lan" || chkbox[j].value == "LAN1" || chkbox[j].value == "LAN") {
                    chkboxVal = "LAN";
                }
                if (values[i] == "LAN2" || values[i] == "WAN") {
                    val = "WAN";
                }
                if (values[i] == "lan" || values[i] == "LAN1" || values[i] == "LAN") {
                    val = "LAN";
                }
                if (val == chkboxVal) {
                    chkbox[j].checked = true;
                    break;
                }
            }
        }
    }

    if (fw_attr.hasOwnProperty('reject_all') && fw_attr['reject_all'] == 'yes') {
        $('#rejectAll').attr('checked', true);
    }

    // update table
    $("#firewall_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listStaticDefense"
        },
        colNames: [
            '<span locale="LANG1957">' + $P.lang('LANG1957') + '</span>',
            '<span locale="LANG1947">' + $P.lang('LANG1947') + '</span>',
            '<span locale="LANG1948">' + $P.lang('LANG1948') + '</span>',
            '<span locale="LANG1949">' + $P.lang('LANG1949') + '</span>',
            '<span locale="LANG1950">' + $P.lang('LANG1950') + '</span>',
            '<span locale="LANG1952">' + $P.lang('LANG1952') + '</span>',
            '<span locale="LANG1953">' + $P.lang('LANG1953') + '</span>',
            '<span locale="LANG1958">' + $P.lang('LANG1958') + '</span>'
        ],
        colModel: [{
            name: 'sequence',
            index: 'sequence',
            width: 50,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'rule_name',
            index: 'rule_name',
            width: 100,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'rule_act',
            index: 'rule_act',
            width: 50,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'protocol',
            index: 'protocol',
            width: 50,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'type',
            index: 'type',
            width: 50,
            resizable: false,
            align: "center",
            sortable: false
        }, {
            name: 'source_addr',
            index: 'source_addr',
            width: 200,
            resizable: false,
            align: "center",
            formatter: createAddress,
            sortable: false
        }, {
            name: 'dest_addr',
            index: 'dest_addr',
            width: 200,
            resizable: false,
            align: "center",
            formatter: createAddress,
            sortable: false
        }, {
            name: 'options',
            index: 'options',
            width: 250,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#firewall_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        // multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'sequence',
        noData: "LANG129 LANG2751",
        jsonReader: {
            root: "response.rule_name",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#firewall_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            loadRuleCompleted = true;
        }
    });
};

var prepareAddItemForm = function() {
    isNew = true;
    FW_OLD_NAME = '';
    ASTGUI.resetTheseFields([DOM_new_fw_action, DOM_new_fw_name, DOM_new_fw_proto, DOM_new_fw_type, DOM_new_fw_services]);
    top.Custom.init(doc);
    $("#editForm").show();
};

var prepareEditItemForm = function(item) {
    isNew = false;

    ASTGUI.resetTheseFields([DOM_new_fw_action, DOM_new_fw_name, DOM_new_fw_proto, DOM_new_fw_type, DOM_new_fw_interface, DOM_new_fw_services]);

    ASTGUI.updateFieldToValue(DOM_new_fw_name, item);

    FW_OLD_NAME = item;

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'getStaticDefense',
            'rule_name': item
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
                var rule = data.response.rule_name;

                for (var item in rule) {
                    switch (item) {
                        case 'rule_act':
                            ASTGUI.updateFieldToValue(DOM_new_fw_action, rule[item]);
                            break;
                        case 'protocol':
                            ASTGUI.updateFieldToValue(DOM_new_fw_proto, rule[item]);
                            break;
                        case 'type':
                            ASTGUI.updateFieldToValue(DOM_new_fw_type, rule[item]);

                            if (rule[item] == "in") {
                                $('#new_fw_type').bind('change');
                                $('#new_fw_type').trigger('change');
                            }
                            break;
                        case 'interface':
                            ASTGUI.updateFieldToValue(DOM_new_fw_interface, rule[item]);
                            break;
                        case 'source_addr':
                            var addr = rule[item];

                            if (rule['source_sub']) {
                                addr += '/' + rule['source_sub'];
                            }

                            ASTGUI.updateFieldToValue(_$('new_fw_src_ipaddr'), addr);
                            ASTGUI.updateFieldToValue(_$('new_fw_src_port'), (rule['source_port'] == -1 ? 'Any' : rule['source_port']));
                            break;
                        case 'dest_addr':
                            var addr = rule[item];

                            if (rule['dest_sub']) {
                                addr += '/' + rule['dest_sub'];
                            }

                            ASTGUI.updateFieldToValue(_$('new_fw_dst_ipaddr'), addr);
                            ASTGUI.updateFieldToValue(_$('new_fw_dst_port'), (rule['dest_port'] == -1 ? 'Any' : rule['dest_port']));
                            break;
                        case 'flags':
                            ASTGUI.updateFieldToValue(DOM_new_fw_services, rule[item]);
                            break;
                    }
                }

                var service = DOM_new_fw_services.value;

                if (service == 'custom') {
                    $('#new_fw_src').show();
                    $('#new_fw_dst').show();
                    $('#new_fw_proto_container').show();
                }

                top.Custom.init(doc);

                $("#editForm").show();
            }
        }
    });
};

var service2port = function(services) {
    var table = {
        'FTP': '21',
        'SSH': '22',
        'Telnet': '23',
        'TFTP': '69',
        'HTTP': '80',
        'LDAP': '389'
    };

    if (table.hasOwnProperty(services)) {
        return table[services];
    }

    return '';
};

var port2service = function(port) {
    var table = {
        '21': 'FTP',
        '22': 'SSH',
        '23': 'Telnet',
        '69': 'TFTP',
        '80': 'HTTP',
        '389': 'LDAP'
    };

    if (table.hasOwnProperty(port)) {
        return table[port];
    }

    return '';
};

var port2proto = function(port) {
    var table = {
        '21': 'tcp',
        '22': 'tcp',
        '23': 'tcp',
        '69': 'udp',
        '80': 'tcp',
        '389': 'tcp'
    };

    return table[port];
};

var new_fw_save_go = function(ev) {
    var action = {};

    if (!isNew) {
        action['action'] = 'updateStaticDefense';
        action['sequence'] = sequence;
    } else {
        action['action'] = 'addStaticDefense';
    }

    var tmp_fw_name = DOM_new_fw_name.value.toLowerCase(),
        tmp_fw_action = DOM_new_fw_action.value,
        tmp_fw_proto = DOM_new_fw_proto.value,
        tmp_fw_type = DOM_new_fw_type.value,
        tmp_fw_interface = DOM_new_fw_interface.value,
        tmp_flags = DOM_new_fw_services.value;

    if (tmp_flags == "custom") {
        var src_ipaddr = ASTGUI.getFieldValue('new_fw_src_ipaddr') || "Anywhere",
            src_port = ASTGUI.getFieldValue('new_fw_src_port') || "Any",
            dst_ipaddr = ASTGUI.getFieldValue('new_fw_dst_ipaddr') || "Anywhere",
            dst_port = ASTGUI.getFieldValue('new_fw_dst_port') || "Any";
    } else {
        var tmp_dst = service2port(tmp_flags);
        var src_ipaddr = "Anywhere",
            src_port = "Any",
            dst_ipaddr = "Anywhere",
            dst_port = tmp_dst;

        tmp_fw_proto = port2proto(tmp_dst);
    }

    src_ipaddr = src_ipaddr.split('/'); // '192.168.0.0/16' to ['192.168.0.0', '16']
    dst_ipaddr = dst_ipaddr.split('/'); // 'Anywhere' to ['Anywhere']

    action['rule_name'] = tmp_fw_name;
    action['rule_act'] = tmp_fw_action;
    action['protocol'] = tmp_fw_proto;
    action['type'] = tmp_fw_type;
    action['source_addr'] = src_ipaddr[0];
    action['source_sub'] = (src_ipaddr[1] ? parseInt(src_ipaddr[1]) : 0);
    action['source_port'] = (src_port === 'Any' ? -1 : src_port);
    action['dest_addr'] = dst_ipaddr[0];
    action['dest_sub'] = (dst_ipaddr[1] ? parseInt(dst_ipaddr[1]) : 0);
    action['dest_port'] = (dst_port === 'Any' ? -1 : dst_port);
    action['interface'] = tmp_fw_interface;
    action['flags'] = tmp_flags;

    var sourceAddr = action['source_addr'];
    var destAddr = action['dest_addr'];

    if (UCMGUI.isIPv6(sourceAddr) && !UCMGUI.isIPv6NoPort(sourceAddr)) {
        action['source_addr'] = sourceAddr.replace("[", "").replace("]", "");
    }
    if (UCMGUI.isIPv6(destAddr) && !UCMGUI.isIPv6NoPort(destAddr)) {
        action['dest_addr'] = destAddr.replace("[", "").replace("]", "");
    } 
    var bRejectIn = (tmp_fw_action === 'reject' || tmp_fw_action === 'drop') && (tmp_fw_type === 'in') && (src_ipaddr[0] === 'Anywhere') && (src_port === 'Any') &&
        ((dst_ipaddr[0] === 'Anywhere' || dst_ipaddr[0] === mWindow.location.hostname || subMaskDetect(dst_ipaddr.join('/'))) && (dst_port === 'Any' || dst_port === LoginPort)) &&
        (tmp_fw_proto === 'tcp' || tmp_fw_proto === 'both'),

        bRejectOut = (tmp_fw_action === 'reject' || tmp_fw_action === 'drop') && (tmp_fw_type === 'out') &&
        ((src_ipaddr[0] === mWindow.location.hostname || src_ipaddr[0] === 'Anywhere' || subMaskDetect(src_ipaddr.join('/'))) && (src_port === LoginPort || src_port === 'Any')) &&
        (dst_ipaddr[0] === 'Anywhere') && (dst_port === 'Any') && (tmp_fw_proto === 'tcp' || tmp_fw_proto === 'both');

    if (bRejectIn || bRejectOut) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG3524"),
            callback: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        });
    } else {
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
                var bool = UCMGUI.errorHandler(data, function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                });

                if (bool) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG815"),
                        callback: function() {
                            mWindow.$("#firewall_list", mWindow.document).trigger('reloadGrid');

                            mWindow.loadActionList();
                        }
                    });
                }
            }
        });
    }
};

var delete_FW_confirm = function(a) {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG818").format(a),
        buttons: {
            ok: function() {
                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: {
                        'action': 'deleteStaticDefense',
                        'rule_name': a
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
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG816"),
                                callback: function() {
                                    var oTable = $("#firewall_list"),
                                        totalPage = oTable.getGridParam("lastpage"),
                                        page = oTable.getGridParam("page"),
                                        reccount = oTable.getGridParam("reccount");

                                    if (page === totalPage && totalPage > 1 && reccount === 1) {
                                        oTable.setGridParam({
                                            page: totalPage - 1
                                        }).trigger('reloadGrid');
                                    } else {
                                        oTable.trigger('reloadGrid');
                                    };

                                    loadActionList();
                                }
                            });
                        }
                    }
                });
            }
        }
    });
};

var applyChanges = function(click) {
    var aPingInput = $("#ping_container").find("input"),
        aDeathpingInput = $("#deathping_container").find("input"),
        bConflict = false;

    aPingInput.each(function() {
        if (this.checked && aDeathpingInput[aPingInput.index(this)].checked) {
            bConflict = true;
            return false;
        }
    });

    if (bConflict) {
        top.dialog.dialogMessage({
            type: "warning",
            content: $P.lang("LANG4105")
        });
        return;
    }

    if (click) {
        var ping_container = $('#ping_container').find('input'),
            ping_enable_list = [],
            ping_enable = '';

        for (var i = 0; ping_container && i < ping_container.length; i++) {
            if (ping_container[i].checked) {
                ping_enable_list.push(ping_container[i].value);
            }
        }

        ping_enable = ping_enable_list.join(',');

        var synflood_container = $('#synflood_container').find('input'),
            synflood_list = [],
            syn_flood = '';

        for (var i = 0; synflood_container && i < synflood_container.length; i++) {
            if (synflood_container[i].checked) {
                synflood_list.push(synflood_container[i].value);
            }
        }

        syn_flood = synflood_list.join(',');

        var deathping_container = $('#deathping_container').find('input'),
            deathping_list = [],
            ping_of_death = '';

        for (var i = 0; deathping_container && i < deathping_container.length; i++) {
            if (deathping_container[i].checked) {
                deathping_list.push(deathping_container[i].value);
            }
        }

        ping_of_death = deathping_list.join(',');

        var action = {
            'action': 'updateTypicalFirewallSettings',
            'ping_enable': ping_enable,
            'syn_flood': syn_flood,
            'ping_of_death': ping_of_death
        };
    } else {
        var action = {
            'action': 'updateTypicalFirewallSettings'
        };
    }

    var saveTypical = function(action, click) {
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

                if (bool && click) {
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG945")
                    });
                }
            }
        });
    };

    if ($('#rejectAll')[0].checked) {
        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG2754").format($P.lang("LANG2752")),
            buttons: {
                ok: function() {
                    action['reject_all'] = 'yes';

                    saveTypical(action, true);
                },
                cancel: function() {
                    $('#rejectAll').attr('checked', false);

                    top.Custom.init(doc, $('#rejectAll')[0]);

                    // action['reject_all'] = 'no';

                    // saveTypical(action);

                    action = null;
                }
            }
        });
    } else {
        action['reject_all'] = 'no';

        saveTypical(action, click);
    }
};

var interfaceInit = function() {
    $.ajax({
        type: "POST",
        url: "/cgi",
        async: false,
        data: 'action=getNetworkSettings&method&port',
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                // var kv_pairs = response.split('\r\n');
                // var mode = kv_pairs[0].split('=')[1];

                // LoginPort = kv_pairs[5].split('=')[1];

                nMethodMode = data.response.network_settings.method;

                LoginPort = data.response.network_settings.port;

                var interface_global = $('#firewall_interface');
                var interface_local = $('#new_fw_interface');

                var ping_container = $('#ping_container');
                var synflood_container = $('#synflood_container');
                var deathping_container = $('#deathping_container');

                if (nMethodMode == 0) {
                    // var wan = kv_pairs[1].split('=')[1];
                    // var lan = kv_pairs[2].split('=')[1];

                    // ping syn_flood death_ping
                    append_chkbox("ping", {
                        "eth1(WAN)": "WAN", // "WAN": wan,
                        "eth0(LAN)": "LAN" // "LAN": lan
                    });
                    append_chkbox("synflood", {
                        "eth1(WAN)": "WAN", // "WAN": wan,
                        "eth0(LAN)": "LAN" // "LAN": lan
                    });
                    append_chkbox("deathping", {
                        "eth1(WAN)": "WAN", // "WAN": wan,
                        "eth0(LAN)": "LAN" // "LAN": lan
                    });

                    interface_global.append($('<option>').html("WAN").val("WAN")); // .val(wan));
                    interface_global.append($('<option>').html("LAN").val("LAN")); // .val(lan));
                    interface_global.append($('<option>').attr('locale', 'LANG1959').html($P.lang("LANG1959")).val('Both')); // .val(lan + ',' + wan));
                    interface_local.append($('<option>').html("WAN").val("WAN")); // .val(wan));
                    interface_local.append($('<option>').html("LAN").val("LAN")); // .val(lan));
                    interface_local.append($('<option>').attr('locale', 'LANG1959').html($P.lang("LANG1959")).val('Both')); // .val(lan + ',' + wan));
                } else if (nMethodMode == 1) {
                    // var lan = kv_pairs[1].split('=')[1];

                    append_chkbox("ping", {
                        "eth0(LAN)": "lan" // "LAN": lan
                    });
                    append_chkbox("synflood", {
                        "eth0(LAN)": "lan" // "LAN": lan
                    });
                    append_chkbox("deathping", {
                        "eth0(LAN)": "lan" // "LAN": lan
                    });

                    interface_global.append($('<option>').html("LAN").val("lan")); // .val(lan));
                    interface_local.append($('<option>').html("LAN").val("lan")); // .val(lan));
                } else if (nMethodMode == 2) {
                    // var lan1 = kv_pairs[3].split('=')[1];
                    // var lan2 = kv_pairs[4].split('=')[1];

                    append_chkbox("ping", {
                        "eth0(LAN1)": "LAN1", // "LAN1": lan1,
                        "eth1(LAN2)": "LAN2" // "LAN2": lan2
                    });
                    append_chkbox("synflood", {
                        "eth0(LAN1)": "LAN1", // "LAN1": lan1,
                        "eth1(LAN2)": "LAN2" // "LAN2": lan2
                    });
                    append_chkbox("deathping", {
                        "eth0(LAN1)": "LAN1", // "LAN1": lan1,
                        "eth1(LAN2)": "LAN2" // "LAN2": lan2
                    });

                    interface_global.append($('<option>').html("LAN1").val("LAN1")); // .val(lan1));
                    interface_global.append($('<option>').html("LAN2").val("LAN2")); // .val(lan2));
                    interface_global.append($('<option>').attr('locale', 'LANG1959').html($P.lang("LANG1959")).val("Both")); // .val(lan1 + ',' + lan2));
                    interface_local.append($('<option>').html("LAN1").val("LAN1")); // .val(lan1));
                    interface_local.append($('<option>').html("LAN2").val("LAN2")); // .val(lan2));
                    interface_local.append($('<option>').attr('locale', 'LANG1959').html($P.lang("LANG1959")).val("Both")); // .val(lan1 + ',' + lan2));
                }
            }
        }
    });
};

var check_name_exist = function(value, element) {
    var fw_rules = ruleNameList,
        value = value.toLowerCase();

    for (var i = 0, length = fw_rules.length; i < length; i++) {
        var tmp_name = value;

        if (tmp_name === FW_OLD_NAME) {
            break;
        }

        if (fw_rules[i] === tmp_name) {
            return false;
        }
    }

    return true;
};

var check_service = function(value, element) {
    if (value == "custom" && (DOM_new_fw_action.value == "reject" || DOM_new_fw_action.value == "drop")) {
        var dst_ipaddr = _$('new_fw_dst_ipaddr').value || "Anywhere";
        var dst_port = _$('new_fw_dst_port').value || "Any";
        var src_ipaddr = _$('new_fw_src_ipaddr').value || "Anywhere";
        var src_port = _$('new_fw_src_port').value || "Any";

        if (/^Anywhere$/.test(dst_ipaddr) && /^Anywhere$/.test(src_ipaddr) && /^Any$/.test(dst_port) && /^Any$/.test(src_port)) {
            return false;
        }

        return true;
    } else {
        return true;
    }
};

var check_ipaddr = function(value, element) {
    if (value == "") {
        return true;
    }

    // 192.168.0.0 or 192.168.0.0/16
    // if (!/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(\/([1-9]|[12][0-9]|3[0-2]))?$/i.test(value) && !/^Anywhere$/.test(value)) {
    if (/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(\/\d+)?$/i.test(value) || UCMGUI.isIPv6(value) || /^Anywhere$/.test(value)) {
        return true;
    }

    /*if (value.split('/')[0].slice(-1) === '0') {
        return false;
    }*/

    return false;
};

var check_ipsub = function(value, element) {
    var value = value.split('/'),
        sub = parseInt(value[1], 10);

    if (sub == 0 || (sub && (sub > 32 || sub < 1))) {
        return false;
    }

    return true;
};

var check_port = function(value, element) {
    if (/^Any$/.test(value) || value == "") {
        return true;
    }
    if (/^(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/.test(value)) {
        return true;
    }
    if (!/^(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])[-]?(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/.test(value)) {
        return false;
    }
    var arr = value.split("-")
    var cntFirst = parseInt(arr[0], 10);
    var cntSecond = parseInt(arr[1], 10);

    if (cntFirst < 0 || cntFirst > 65535) {
        return false;
    }

    if (cntSecond && (cntSecond < 0 || cntSecond > 65535)) {
        return false;
    }

    if (cntFirst > cntSecond) {
        return false;
    }

    return true;
};

var append_chkbox = function(field, obj) {
    var str = '#' + field + '_container';
    var container = $(str);

    $.each(obj, function(key, value) {
        var div = $('<div>');
        div.addClass("divInline");
        var span = $('<span>');
        var chkbox = $('<input type="checkbox">');
        span.text(key);
        chkbox.val(value);
        div.append(span).append(chkbox);
        container.append(div);
    });
};

function showFirewallCreateForm() {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG52"),
        frameSrc: "html/security_modal.html?mode=add"
    });
}

function showFirewallEditForm(item, sequence) {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG53").format(item),
        frameSrc: "html/security_modal.html?mode=edit&item={0}&sequence={1}".format(item, sequence)
    });
}

function getNetstatInfo() {
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            'action': 'getNetstatInfo'
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.clearDialog();
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var netstat_info = data.response.netstat,
                    addCell = ASTGUI.domActions.tr_addCell,
                    DOM_serv_tbl = _$('services_tbl'),
                    newRow = DOM_serv_tbl.insertRow(-1),
                    tmp_str = "<span id='button_expand' name='selecttag' style='display:block; color: white; float: left; cursor: pointer;'>[ - ]</span><span locale='LANG1956'></span>",
                    cur_ports = ",",
                    tmp_offset = 0,
                    j = 1,
                    tmp_value,
                    it1,
                    it2,
                    i;

                newRow.className = "frow expand_collapsed expand";

                addCell(newRow, {
                    html: tmp_str
                });
                addCell(newRow, {
                    html: $P.lang("LANG1955"),
                    locale: "LANG1955"
                });
                addCell(newRow, {
                    html: $P.lang("LANG1954"),
                    locale: "LANG1954"
                });
                // addCell(newRow, { html: $P.lang("LANG1956"), locale: "LANG1956", width: "200px" });
                // addCell(newRow, { html: $P.lang("LANG1955"), locale: "LANG1955", width: "200px" });
                // addCell(newRow, { html: $P.lang("LANG1954"), locale: "LANG1954", width: "200px" });

                for (i = 0; i < netstat_info.length; i++) {
                    var it1 = netstat_info[i].port,
                        it2 = netstat_info[i].service;

                    tmp_offset = cur_ports.indexOf(it1);

                    if (tmp_offset != -1 && cur_ports[tmp_offset - 1] == "," && cur_ports[tmp_offset + it1.length] == ",") {
                        continue;
                    }

                    if (netstat_info[i].pro == 'tcp') {
                        cur_ports = cur_ports + it1 + ",";
                    }

                    var newRow = DOM_serv_tbl.insertRow(-1),
                        it1_tags = "<span style='visibility: hidden;'>[ - ]</span><span>" + it1 + "</span>";

                    addCell(newRow, {
                        html: it1_tags
                    });
                    addCell(newRow, {
                        html: (it2 ? it2 : '-')
                    });
                    addCell(newRow, {
                        html: netstat_info[i].pro + '/' + (netstat_info[i].ip == 'ipv4' ? 'IPv4' : 'IPv6')
                    });
                }

                $(".expand_collapsed").bind("click", function(ev) {
                    var tbody = $(this).parent(),
                        children = tbody.children(),
                        cclass = $(this).attr("class"),
                        classes = cclass.split(' ');

                    if (!classes[2] || classes[2] == "collapsed") {
                        _$('button_expand').textContent = '[ - ]';
                        classes[2] = "expand";
                        $(this).removeClass().addClass(classes.join(' '));
                        children.show();
                    } else if (classes[2] == "expand") {
                        _$('button_expand').textContent = '[ + ]';
                        classes[2] = "collapsed";
                        $(this).removeClass().addClass(classes.join(' '));
                        children.hide();
                        $(this).show();
                    }
                });
            }
        }
    });
}

function toBinary(value) { // '128' to '11111111'
    var valInt = parseInt(value),
        valBinary = valInt.toString(2);

    while (valBinary.length < 8) {
        valBinary = '0' + valBinary;
    }

    return valBinary;
}

function subMaskDetect(address) {
    var result = false;

    if (address.indexOf('/')) { // Address Like: '192.168.124.1/24'
        var ip = address.split('/')[0], // '192.168.124.1'
            subMask = address.split('/')[1],
            hostname = mWindow.location.hostname; // Such as: '192.168.124.124'

        ip = ip.split('.').map(toBinary); // ['192', '168', '124', '1'] to ["11000000", "10101000", "01111100", "00000001"]
        subMask = parseInt(subMask);  // 24
        hostname = hostname.split('.').map(toBinary);

        var count = 0,
            ipBinary = ip.join(''),
            hostnameBinary = hostname.join('');

        for (var i = 0, len = ipBinary.length; i < len; i++) {
            if (ipBinary[i] === hostnameBinary[i]) {
                count++;
            } else {
                break;
            }
        }

        if (count >= subMask) {
            result = true;
        }
    }

    return result;
}

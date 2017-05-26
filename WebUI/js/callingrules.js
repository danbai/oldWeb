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
    outboundRouteList = [],
    trunkList = [],
    accountList = [],
    groupList = [],
    PinSetsList = [],
    officeTimeList = [],
    holidayList = [],
    slaTrunkNameList = [],
    officeTimeType = ["LANG133", "LANG3271", "LANG3275", "LANG3266", "LANG3286", "LANG3287", "LANG3288"];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG655"));

    updateLists();

    createTable();

    bindButtonEvent();
});

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#new_cr_button', 'click', function(ev) {
            if (trunkList.length > 0) {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG768"),
                    displayPos: "editForm",
                    frameSrc: "html/callingrules_modal.html?mode=add"
                });
            } else {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG2698"),
                    buttons: {
                        ok: function() {
                            top.frames['frameContainer'].module.jumpMenu('trunks_voip.html');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#countryCode', 'click', function(ev) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG5336"),
                displayPos: "editForm",
                frameSrc: "html/countryCode.html"
            });

            ev.stopPropagation();
            return false;
        });

    $("#table_CRLS_list")
        .delegate('.edit', 'click', function(ev) {
            var outbound_rt_index = $(this).attr('outbound_rt_index'),
                outbound_rt_name = $(this).attr('outbound_rt_name');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG657").format(outbound_rt_name),
                displayPos: "editForm",
                frameSrc: "html/callingrules_modal.html?mode=edit&item={0}&name={1}".format(outbound_rt_index, outbound_rt_name)
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var outbound_rt_index = $(this).attr('outbound_rt_index'),
                outbound_rt_name = $(this).attr('outbound_rt_name');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(outbound_rt_name),
                buttons: {
                    ok: function() {
                        var action = {
                            "action": "deleteOutboundRoute",
                            "outbound_route": outbound_rt_index
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

                                    // top.dialog.clearDialog();
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG816")
                                    });

                                    var table = $("#table_CRLS_list"),
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

                                    updateLists();
                                }
                            }
                        });
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.rule_clickTop', 'click', function(ev) {
            var sequence = $(this).attr('sequence');

            if (sequence != 1) {
                var action = {
                    "action": "moveOutboundRouteTop",
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
                            $("#table_CRLS_list").trigger('reloadGrid');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.rule_clickUp', 'click', function(ev) {
            var sequence = $(this).attr('sequence');

            if (sequence != 1) {
                var action = {
                    "action": "moveOutboundRouteUp",
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
                            $("#table_CRLS_list").trigger('reloadGrid');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.rule_clickDown', 'click', function(ev) {
            var sequence = $(this).attr('sequence'),
                records = $("#table_CRLS_list").getGridParam("records");

            if (sequence != records) {
                var action = {
                    "action": "moveOutboundRouteDown",
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
                            $("#table_CRLS_list").trigger('reloadGrid');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.rule_clickBottom', 'click', function(ev) {
            var sequence = $(this).attr('sequence'),
                records = $("#table_CRLS_list").getGridParam("records");

            if (sequence != records) {
                var action = {
                    "action": "moveOutboundRouteBottom",
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
                            $("#table_CRLS_list").trigger('reloadGrid');
                        }
                    }
                });
            }

            ev.stopPropagation();
            return false;
        });

    $('#countryContainer')
        .delegate('.close', 'click', function(ev) {
            var me = $(this);

            me.text('-').addClass('open').removeClass('close');

            me.parent().find('.countries').show();

            ev.stopPropagation();
            return false;
        })
        .delegate('.open', 'click', function(ev) {
            var me = $(this);

            me.text('+').addClass('close').removeClass('open');

            me.parent().find('.countries').hide();

            ev.stopPropagation();
            return false;
        })
        .delegate('.parent', 'click', function(ev) {
            var me = $(this),
                parentName = me.attr('name'),
                childUl = me.parent().find('.countries'),
                childLi = me.parent().find('.child');

            if (me.is(':checked')) {
                childLi.each(function() {
                    this.checked = true;
                });
            } else {
                childLi.each(function() {
                    this.checked = false;
                });
            }

            top.Custom.init(doc, childUl[0]);
        })
        .delegate('.child', 'click', function(ev) {
            var me = $(this),
                parentName = me.attr('parent'),
                parentCheckbox = $('input[name="' + parentName + '"]'),
                parentUl = me.parents('.countries'),
                otherChildCheckbox = parentUl.find('.child').not(me),
                otherChildCheckboxIsAllChecked = true;

            if (me.is(':checked')) {
                otherChildCheckbox.each(function() {
                    if (!this.checked) {
                        otherChildCheckboxIsAllChecked = false;
                        return false;
                    }
                });

                parentCheckbox[0].checked = otherChildCheckboxIsAllChecked;
            } else {
                parentCheckbox[0].checked = false;
            }

            top.Custom.init(doc, parentUl[0]);
            top.Custom.init(doc, parentCheckbox[0]);
        });

    $('#CountryCodesForm').submit(function(event) {
        var action = {},
            country_codes = [];
            countryLi = $('li.country');

        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang('LANG826')
        });

        countryLi.each(function() {
            var obj = {},
                me = $(this);

            obj.country = me.find('.country-name').text();
            // obj.country_code = me.find('.country-code').attr('title');
            obj.disable_code = me.find(':checkbox').is(':checked') ? 'yes' : 'no';

            country_codes.push(obj);
        });

        action.action = 'updateCountryCodes';
        action.country_codes = JSON.stringify(country_codes);        

        updateCountryCodes(action);

        return false;
    });
}

function changeTitle(rowId, tv, rawObject, cm, rdata) {
    return 'title="' + rawObject.pattern + '"';
}

function checkParentCheckboxStatus() {
    $('ul.countries').each(function() {
        var me = $(this),
            parentName = me.attr('parent'),
            parentCheckbox = $('input[name="' + parentName + '"]'),
            childCheckbox = me.find('.child'),
            childCheckboxIsAllChecked = true;

        childCheckbox.each(function() {
            if (!this.checked) {
                childCheckboxIsAllChecked = false;
                return false;
            }
        });

        parentCheckbox[0].checked = childCheckboxIsAllChecked;
    });
}

function createName(cellvalue, options, rowObject) {
    var name;

    if (rowObject.out_of_service && rowObject.out_of_service == 'yes') {
        name = '<span class="disabled_extension_trunk" localetitle="LANG273" title="' + $P.lang('LANG273') + '"></span>' + cellvalue;
    } else {
        name = cellvalue;
    }

    return name;
}

function createPattern(cellvalue, options, rowObject) {
    var pattern = '',
        patternList = cellvalue.split(','),
        patternListLength = patternList.length;

    for (var i = 0; i < patternListLength; i++) {
        if (patternList[i]) {
            pattern += '<div style="line-height: 20px;">' + patternList[i] + '</div>';
        }
    }

    return pattern;
}

function createPermission(cellvalue, options, rowObject) {
    var privilegeName;

    switch (cellvalue) {
        case 'internal':
            privilegeName = '<span locale="LANG1071">' + $P.lang('LANG1071') + '</span>';
            break;
        case 'local':
            privilegeName = '<span locale="LANG1072">' + $P.lang('LANG1072') + '</span>';
            break;
        case 'national':
            privilegeName = '<span locale="LANG1073">' + $P.lang('LANG1073') + '</span>';
            break;
        case 'international':
            privilegeName = '<span locale="LANG1074">' + $P.lang('LANG1074') + '</span>';
            break;
        default:
            privilegeName = '<span locale="LANG273">' + $P.lang('LANG273') + '</span>';
    }

    return privilegeName;
}

function createOptions(cellvalue, options, rowObject) {
    var records = $("#table_CRLS_list").getGridParam("records"),
        options = "<button class='options edit' outbound_rt_name='" + rowObject.outbound_rt_name + "' outbound_rt_index='" + rowObject.outbound_rt_index + "' localeTitle='LANG738' title='" + $P.lang("LANG738") + "'></button>" +
            "<button class='options del' outbound_rt_name='" + rowObject.outbound_rt_name + "' outbound_rt_index='" + rowObject.outbound_rt_index + "' localeTitle='LANG739' title='" + $P.lang("LANG739") + "'></button>";

    if (rowObject.sequence == 1 && rowObject.sequence == records) {
        options += "<button class='rule_clickTop options disabled' localeTitle='LANG793' style='cursor: default;' title='" + $P.lang('LANG793') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickUp options disabled' localeTitle='LANG794' style='cursor: default;' title='" + $P.lang('LANG794') + "'sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickDown options disabled' localeTitle='LANG795' style='cursor: default;' title='" + $P.lang('LANG795') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickBottom options disabled' localeTitle='LANG796' style='cursor: default;' title='" + $P.lang('LANG796') + "' sequence='" + rowObject.sequence + "'></button>";
    } else if (rowObject.sequence == 1) {
        options += "<button class='rule_clickTop options disabled' localeTitle='LANG793' style='cursor: default;' title='" + $P.lang('LANG793') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickUp options disabled' localeTitle='LANG794' style='cursor: default;' title='" + $P.lang('LANG794') + "'sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickDown options' localeTitle='LANG795' title='" + $P.lang('LANG795') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickBottom options' localeTitle='LANG796' title='" + $P.lang('LANG796') + "' sequence='" + rowObject.sequence + "'></button>";
    } else if (rowObject.sequence == records) {
        options += "<button class='rule_clickTop options' localeTitle='LANG793' title='" + $P.lang('LANG793') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickUp options' localeTitle='LANG794' title='" + $P.lang('LANG794') + "'sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickDown options disabled' style='cursor: default;' localeTitle='LANG795' title='" + $P.lang('LANG795') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickBottom options disabled' style='cursor: default;' localeTitle='LANG796' title='" + $P.lang('LANG796') + "' sequence='" + rowObject.sequence + "'></button>";
    } else {
        options += "<button class='rule_clickTop options' localeTitle='LANG793' title='" + $P.lang('LANG793') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickUp options' localeTitle='LANG794' title='" + $P.lang('LANG794') + "'sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickDown options' localeTitle='LANG795' title='" + $P.lang('LANG795') + "' sequence='" + rowObject.sequence + "'></button>" +
            "<button class='rule_clickBottom options' localeTitle='LANG796' title='" + $P.lang('LANG796') + "' sequence='" + rowObject.sequence + "'></button>";
    }

    return options;
}

function createTable() {
    $("#table_CRLS_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listOutboundRoute",
            "options": "outbound_rt_name,outbound_rt_index,permission,sequence,pattern,out_of_service"
        },
        colNames: [
            '<span locale="LANG240">' + $P.lang('LANG240') + '</span>',
            '<span locale="LANG656">' + $P.lang('LANG656') + '</span>',
            '<span locale="LANG246">' + $P.lang('LANG246') + '</span>',
            '<span locale="LANG1543">' + $P.lang('LANG1543') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'sequence',
            index: 'sequence',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'outbound_rt_name',
            index: 'outbound_rt_name',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createName
        }, {
            name: 'pattern',
            index: 'pattern',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createPattern,
            cellattr: changeTitle
        }, {
            name: 'permission',
            index: 'permission',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createPermission
        }, {
            name: 'options',
            index: 'options',
            width: 150,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#table_CRLS_pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        //multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'sequence',
        noData: "LANG129 LANG655",
        jsonReader: {
            root: "response.outbound_route",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#table_CRLS_list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);
        }
    });
}

function updateLists() {
    outboundRouteList = UCMGUI.isExist.getList("getOutboundRouteList");
    trunkList = UCMGUI.isExist.getList("getTrunkList");
    accountList = UCMGUI.isExist.getList("getAccountList");
    groupList = UCMGUI.isExist.getList("getExtensionGroupList");
    slaTrunkNameList = UCMGUI.isExist.getList("getSLATrunkNameList");
    officeTimeList = UCMGUI.isExist.getList("listTimeConditionOfficeTime");
    holidayList = UCMGUI.isExist.getList("listTimeConditionHoliday");

    PinSetsList = [];

    $.ajax({
        type: "post",
        url: "/cgi",
        data: {
            'action': 'listPinSets'
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var res = data.response;

                if (res) {
                    var PinSets = res.pin_sets_id;

                    for (var i = 0; i < PinSets.length; i++) {
                        var id = PinSets[i]["pin_sets_id"],
                            name = PinSets[i]["pin_sets_name"],
                            obj = {
                                'val': id,
                                'text': name
                            };

                        PinSetsList.push(obj);
                    };
                }
            }
        }
    });
}
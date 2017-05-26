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
    maxExtension = UCMGUI.config.maxExtension,
    maxFXSExtension = UCMGUI.config.maxFXSExtension, // maybe change later
    existNumberList = [],
    existExtentionList = [],
    mohNameList = [],
    existFXSList = [],
    extensionRange = UCMGUI.isExist.getRange('extension'),
    languages = [],
    portExtensionList = [],
    officeTimeList = [],
    holidayList = [],
    accountLists = [],
    accountListsObj = {},
    addRowLikeDomain = UCMGUI.addRowLikeDomain,
    selectbox = UCMGUI.domFunction.selectbox,
    addZero = UCMGUI.addZero,
    maxTimeCondition = UCMGUI.config.maxTimeCondition,
    enableCheckBox = UCMGUI.domFunction.enableCheckBox,
    disableCheckBox = UCMGUI.domFunction.disableCheckBox,
    showCheckPassword = UCMGUI.enableWeakPw.showCheckPassword,
    autoEmailToUser = "",
    extExtension = "",
    extType = "",
    userID = "",
    datactol = {
        "clicked": false,
        "timeout": null
    },
    privilegeInfo = {},
    userPrivilegeInfo = {},
    updateDocumentException = UCMGUI.domFunction.updateDocumentException,
    getPrivilegeAction = UCMGUI.getPrivilegeAction,
    ifExisted = UCMGUI.inArray,
    isEmptyTimeCondition = false,
    refleshStatusSearch = false;

Array.prototype.each = top.Array.prototype.each;
String.prototype.format = top.String.prototype.format;
String.prototype.afterChar = top.String.prototype.afterChar;
Array.prototype.sortNumbers = top.Array.prototype.sortNumbers;
String.prototype.beginsWith = top.String.prototype.beginsWith;
Array.prototype.sortBy = top.Array.prototype.sortBy;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $('#extension_list_div').hide();

    $P.lang(doc, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG622"));

    initPage();
});

function initPage() {
    // existFXSList = UCMGUI.isExist.getList("getDahdiList");
    var role = $P.cookie('role');

    officeTimeList = UCMGUI.isExist.getList("listTimeConditionOfficeTime");

    holidayList = UCMGUI.isExist.getList("listTimeConditionHoliday");

    languages = UCMGUI.isExist.getList('getLanguage');

    if (role == 'privilege_3') {
        $('#extension_list_div').hide();

        enableCheckBox({
            enableCheckBox: 'edit_hasvoicemail',
            enableList: ['edit_vmsecret', 'edit_skip_vmsecret']
        }, doc);

        initUserDetailValidator();

        check_timecondition_tips();

        getExtensionInfo();
    } else {
        $('#extension_list_div').show();

        // existFXSList = UCMGUI.isExist.getList("getDahdiList");
        existNumberList = UCMGUI.isExist.getList("getNumberList");

        var accountList = UCMGUI.isExist.getList("getAccountList");
        existExtentionList = transAccountData(accountList);
        accountLists = transData(accountList);

        for (var i = 0; i < accountList.length; i++) {
            var value = accountList[i]["extension"];

            accountListsObj[value] = accountList[i];
        }

        mohNameList = transMohData(UCMGUI.isExist.getList("getMohNameList"));

        createTable();

        bindButtonEvent();

        $("#add").chosen({
            disable_search_threshold: 10,
            width: $("#add").width() + (config.safari ? 50 : 25) + 'px'
        });

        $("#batchAdd").chosen({
            disable_search_threshold: 10,
            width: $("#batchAdd").width() + (config.safari ? 50 : 25) + 'px'
        });

        $("#import").chosen({
            disable_search_threshold: 10,
            width: $("#import").width() + (config.safari ? 50 : 25) + 'px'
        });

        getPortExtension();

        getExtenPrefSettings();

        initValidator();

        setTimeout(reflesh_status, 5000);
    }
}

function bindButtonEvent() {
    $('div.top_buttons')
        .delegate('#add_chosen .active-result', 'click', function(ev) {
            updateLists();

            var index = $(this).attr('data-option-array-index');

            switch (index) {
                case '1':
                    btnAddSIP();
                    break;
                case '2':
                    btnAddIAX();
                    break;
                case '3':
                    btnAddFXS();
                    break;
                default:
                    break;
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#batchAdd_chosen .active-result', 'click', function(ev) {
            var index = $(this).attr('data-option-array-index');

            switch (index) {
                case '1':
                    batchAddSIP();
                    break;
                case '2':
                    batchAddIAX();
                    break;
                default:
                    break;
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#import_chosen .active-result', 'click', function(ev) {
            var index = $(this).attr('data-option-array-index');

            switch (index) {
                case '1':
                    importExts();
                    break;
                case '2':
                    exportExts();
                    break;
                default:
                    break;
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('#batchEdit', 'click', function(ev) {
            var extensionTable = $("#extension-list"),
                selected = extensionTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                typeList = [],
                typeListLength = 0,
                extensionList = [],
                i = 0,
                firstType,
                rowdata,
                rowExt,
                item;

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG810")
                });

                ev.stopPropagation();
                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = extensionTable.jqGrid('getRowData', selected[i]);

                typeList.push(rowdata['account_type']);

                rowExt = rowdata['extension'].split(/<\/span>/i);

                extensionList.push(rowExt.length > 1 ? rowExt[1] : rowExt[0]);
            }

            firstType = typeList[0].toLowerCase().slice(0, 3);
            typeListLength = typeList.length;

            for (i = 1; i < typeListLength; i++) {
                item = typeList[i].toLowerCase().slice(0, 3);

                if ((firstType != item)) {
                    top.dialog.dialogMessage({
                        type: 'warning',
                        content: $P.lang("LANG2871")
                    });

                    ev.stopPropagation();
                    return false;
                }
            }

            for (i = 0; i < typeListLength; i++) {
                item = typeList[i].toLowerCase();

                if (item.indexOf('fxs') != -1) {
                    top.dialog.dialogMessage({
                        type: 'warning',
                        content: $P.lang("LANG2870")
                    });

                    ev.stopPropagation();
                    return false;
                }
            }

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG734"),
                displayPos: "batchEdit_extensions_div",
                frameSrc: "html/extension_modal.html?mode=batchEdit&type=" + firstType + "&extension=" + extensionList.toString()
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#batchDelete', 'click', function(ev) {
            var extensionTable = $("#extension-list"),
                selected = extensionTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                extensionList = [],
                confirmList = [],
                i = 0,
                rowdata,
                rowExt;

            if (selectedRowsLength < 1) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG823").format($P.lang("LANG87"))
                });

                ev.stopPropagation();
                return false;
            }

            for (i; i < selectedRowsLength; i++) {
                rowdata = extensionTable.jqGrid('getRowData', selected[i]);

                rowExt = rowdata['extension'].split('</span>');

                extensionList.push(rowExt.length > 1 ? rowExt[1] : rowExt[0]);
            }

            extensionList.sortNumbers();

            for (i = 0; i < selectedRowsLength; i++) {
                confirmList.push("<font>" + extensionList[i] + "</font>");
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG824").format(confirmList.join('  ')),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG825").format($P.lang("LANG11"))
                        });

                        var DO_SELECTED = function() { // DELETE_SELECTED_USERS();
                            // $.ajax({
                            //     type: "post",
                            //     url: "../cgi",
                            //     data: {
                            //         "action": "deleteAccount",
                            //         "account": extensionList.toString()
                            //     },
                            //     error: function(jqXHR, textStatus, errorThrown) {
                            //         top.dialog.clearDialog();

                            //         // top.dialog.dialogMessage({
                            //         //     type: 'error',
                            //         //     content: errorThrown
                            //         // });
                            //     },
                            //     success: function(data) {
                            //         var bool = UCMGUI.errorHandler(data);

                            //         if (bool) {
                                        $.ajax({
                                            type: "post",
                                            url: "../cgi",
                                            data: {
                                                "action": "deleteUser",
                                                "user_name": extensionList.toString()
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
                                                    top.dialog.dialogMessage({
                                                        type: 'success',
                                                        content: $P.lang("LANG816"),
                                                        callback: function() {
                                                            jumpPageOrNot(selectedRowsLength);

                                                            existFXSList = UCMGUI.isExist.getList("getDahdiList");

                                                            // update existNumberList/existExtentionList/existFXSList/extensionRange
                                                            updateLists();
                                                        }
                                                    });
                                                }
                                            }
                                        });
                            //         }
                            //     }
                            // });
                        };

                        setTimeout(DO_SELECTED, 100);
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('#sendAccountToEmail', 'click', function(ev) {
            var extensionTable = $("#extension-list"),
                selected = extensionTable.jqGrid("getGridParam", "selarrrow"),
                selectedRowsLength = selected.length,
                extensionList = [],
                i = 0,
                rowdata,
                rowExt;

            for (i; i < selectedRowsLength; i++) {
                rowdata = extensionTable.jqGrid('getRowData', selected[i]);

                rowExt = rowdata['extension'].split('</span>');

                extensionList.push(rowExt.length > 1 ? rowExt[1] : rowExt[0]);
            }

            if (rowdata && rowdata.out_of_service == "yes") {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5059")
                });
                return;
            }

            extensionList.sortNumbers();

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG3498").format($P.lang("LANG25"), $P.lang("LANG3"), $P.lang("LANG4150")),
                buttons: {
                    ok: function() {
                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG3496")
                        });

                        var sendAccountsToEmail = function() {
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: {
                                    "action": "sendAccount2User",
                                    "extension": ((extensionList.length > 0) ? extensionList.toString() : '')
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
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG3497"),
                                            callback: function() {}
                                        });
                                    }
                                }
                            });
                        };

                        setTimeout(sendAccountsToEmail, 100);
                    },
                    email: function() {
                        top.frames['frameContainer'].module.jumpMenu('email_template.html');
                    },
                    cancel: function() {
                        top.dialog.clearDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });

    $("#extension-list")
        .delegate('.edit', 'click', function(ev) {
            var extension = $(this).attr('extension'),
                type = $(this).attr('extType');

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG222").format($P.lang("LANG85"), extension),
                displayPos: "add_extension_div",
                frameSrc: "html/extension_modal.html?mode=edit&type=" + type.toLowerCase().slice(0, 3) + "&extension=" + extension
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.reboot', 'click', function(ev) {
            var ip = $(this).attr('ip'),
                extension = $(this).attr('extension'),
                zeroConfigSettings = UCMGUI.isExist.getList("getZeroConfigSettings");

            if (zeroConfigSettings && zeroConfigSettings.enable_zeroconfig != '1') {
                top.dialog.dialogConfirm({
                    confirmStr: $P.lang("LANG828"),
                    buttons: {
                        ok: function() {
                            top.frames['frameContainer'].module.jumpMenu('zc_autoprovision.html');
                        },
                        cancel: function() {
                            top.dialog.clearDialog();
                        }
                    }
                });
            } else {
                top.dialog.dialogInnerhtml({
                    dialogTitle: $P.lang("LANG737"),
                    frameSrc: 'html/extension_reboot.html?extension=' + extension + '&ip=' + ip
                });
            }

            ev.stopPropagation();
            return false;
        })
        .delegate('.del', 'click', function(ev) {
            var extension = $(this).attr('extension');
            var type = $(this).attr('extType');

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG824").format(extension),
                buttons: {
                    ok: function() {
                        // $.ajax({
                        //     type: "post",
                        //     url: "../cgi",
                        //     data: {
                        //         "action": "deleteAccount",
                        //         "account": extension
                        //     },
                        //     error: function(jqXHR, textStatus, errorThrown) {
                        //         // top.dialog.dialogMessage({
                        //         //     type: 'error',
                        //         //     content: errorThrown
                        //         // });
                        //     },
                        //     success: function(data) {
                        //         var bool = UCMGUI.errorHandler(data);

                        //         if (bool) {
                                    $.ajax({
                                        type: "post",
                                        url: "../cgi",
                                        data: {
                                            "action": "deleteUser",
                                            "user_name": extension
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
                                                top.dialog.dialogMessage({
                                                    type: 'success',
                                                    content: $P.lang("LANG821").format(extension, $P.lang("LANG2471")),
                                                    callback: function() {
                                                        jumpPageOrNot(1);

                                                        if (type && type.indexOf("FXS")  != -1) {
                                                            existFXSList = UCMGUI.isExist.getList("getDahdiList");
                                                        }

                                                        // update existNumberList/existExtentionList/existFXSList/extensionRange
                                                        updateLists();
                                                    }
                                                });
                                            }
                                        }
                                    });
                        //         }
                        //     }
                        // });
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

function getExtensionInfo() {
    $.ajax({
        url: "../cgi?",
        type: "POST",
        dataType: "json",
        data: {
            action: "listAccount",
            options: "extension,account_type"
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var res = data.response;

                if (!!res) {
                    var account = res.account;

                    extExtension = account[0] ? account[0].extension : "";
                    extType = account[0] ? account[0].account_type.slice(0, 3) : "";

                    addEditExtension();
                }
            }
        }
    });

    $("#btn_local_network1").on('click', function() {
        var maxRowOfLocalNet = 10;

        addRowLikeDomain(doc, {
            "tableId": "strategy_table1",
            "rowNamePrefix": "local_network",
            "rowIdPrefix": "edit_local_network",
            "maxRow": maxRowOfLocalNet,
            "startWith1": true,
            "validRules": {
                customCallback: [$P.lang("LANG2131"), check_network]
            }
        })
    });

    $("#btn_whitelist1").on('click', function() {
        if ($("#strategy_table4 tbody tr").length >= 10) {
            top.dialog.dialogMessage({
                type: 'warning',
                content: top.$.lang("LANG809").format('', 10)
            });
            return;
        }

        addRowLikeDomain(doc, {
            "tableId": "strategy_table4",
            "rowNamePrefix": "edit_whitelist",
            "rowIdPrefix": "edit_whitelist",
            "maxRow": 10,
            "startWith1": true,
            "validRules": {
                phoneNumberOrExtension: true,
                customCallback: [$P.lang("LANG5211"), checkWhitelistOnly]
            }
        })
    });

    isEnableWeakPw();

    selectbox.electedSelect({
        rightSelect: "seamless_rightSelect",
        leftSelect: "seamless_leftSelect",
        allToRight: "seamless_allToRight",
        oneToRight: "seamless_oneToRight",
        oneToLeft: "seamless_oneToLeft",
        allToLeft: "seamless_allToLeft",
        cb: function() {
            $P("#seamless_rightSelect", doc).valid();
        }
    }, doc);

    var accountList = UCMGUI.isExist.getList("getAccountList");
    selectbox.appendOpts({
        el: "seamless_leftSelect",
        opts: transData(accountList)
    }, doc);

    $.navSlide(true, false, '.command', '#user_detail_form');
}

function getExtenPrefSettings() {
    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            action: "getExtenPrefSettings"
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var autoEmail = data.response.extension_pref_settings.auto_email_to_user;

                autoEmailToUser = autoEmail ? autoEmail : 'no';
            }
        }
    });
}

function btnAddSIP() {
    if (existExtentionList.length >= maxExtension) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG809").format($P.lang("LANG85"), maxExtension),
            callback: function() {
                top.dialog.clearDialog();
            }
        });
    } else {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG2865"),
            displayPos: "add_extension_div",
            frameSrc: "html/extension_modal.html?mode=add&type=sip"
        });
    }
}

function btnAddIAX() {
    if (existExtentionList.length >= maxExtension) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG809").format($P.lang("LANG85"), maxExtension),
            callback: function() {
                top.dialog.clearDialog();
            }
        });
    } else {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG2866"),
            displayPos: "add_extension_div",
            frameSrc: "html/extension_modal.html?mode=add&type=iax"
        });
    }
}

function btnAddFXS() {
    if (existExtentionList.length >= maxExtension) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG809").format($P.lang("LANG85"), maxExtension),
            callback: function() {
                top.dialog.clearDialog();
            }
        });
    } else {
        existFXSList = UCMGUI.isExist.getList("getDahdiList");

        if (existFXSList.length < maxFXSExtension) {
            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2867"),
                displayPos: "add_extension_div",
                frameSrc: "html/extension_modal.html?mode=add&type=fxs"
            });
        } else {
            top.dialog.dialogMessage({
                type: 'warning',
                content: $P.lang("LANG809").format($P.lang("LANG2704"), maxFXSExtension),
                callback: function() {
                    top.dialog.clearDialog();
                }
            });
        }
    }
}

function batchAddSIP() {
    if (existExtentionList.length >= maxExtension) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG809").format($P.lang("LANG85"), maxExtension),
            callback: function() {
                top.dialog.clearDialog();
            }
        });
    } else {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG2868"),
            displayPos: "batchAdd_extensions_div",
            frameSrc: "html/extension_modal.html?mode=batchAdd&type=sip"
        });
    }
}

function batchAddIAX() {
    if (existExtentionList.length >= maxExtension) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG809").format($P.lang("LANG85"), maxExtension),
            callback: function() {
                top.dialog.clearDialog();
            }
        });
    } else {
        top.dialog.dialogInnerhtml({
            dialogTitle: $P.lang("LANG2869"),
            displayPos: "batchAdd_extensions_div",
            frameSrc: "html/extension_modal.html?mode=batchAdd&type=iax"
        });
    }
}

function check_timecondition_tips() {
    var hasOfficeTime = (officeTimeList.length > 0),
        hasHoliday = (holidayList.length > 0),
        locale = '',
        text = '';

    if (!hasOfficeTime && !hasHoliday) {
        text = generateTimeConditionTips('all');
        locale = 'LANG4220 LANG3271 LANG3266 LANG3271 LANG3266';
    } else if (!hasOfficeTime) {
        text = generateTimeConditionTips('officeTime');
        locale = 'LANG4219 LANG3271';
    } else if (!hasHoliday) {
        text = generateTimeConditionTips('holiday');
        locale = 'LANG4219 LANG3266';
    }

    if (text) {
        $('.timecondition-tips')
            .attr({
                'locale': locale
            })
            .html(text)
            .css({
                'display': 'block'
            });
    }
}

function createName(cellvalue, options, rowObject) {
    if (cellvalue) {
        return cellvalue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else {
        return '--';
    }
}

function createIP(cellvalue, options, rowObject) {
    var value = '';

    if (!cellvalue || cellvalue == '-' || cellvalue == '1' || cellvalue == '2') {
        value = '--';
    } else {
        var ips = cellvalue.split(','),
            length = ips.length,
            i;

        for (i = 0; i < length; i++) {
            if (ips[i]) {
                value += ('<div class="members">' + ips[i] + '</div>');
            }
        }
    }

    return value;
}

function createOptions(cellvalue, options, rowObject) {
    var role = $P.cookie('role'),
        edit = '<button extension="' + rowObject.extension + '" extType="' + rowObject.account_type + '" title="' + $P.lang('LANG738') + '" localetitle="LANG738" class="options edit"></button>',
        del = '<button extension="' + rowObject.extension + '" extType="' + rowObject.account_type + '" title="' + $P.lang('LANG739') + '" localetitle="LANG739" class="options del"></button>',
        reboot;

    if (!rowObject.addr || rowObject.addr == '-' || rowObject.addr == '1' || rowObject.addr == '2' || UCMGUI.isIPv6(rowObject.addr) || rowObject.account_type != "SIP") {
        reboot = '<button extension="' + rowObject.extension + '" extType="' + rowObject.account_type + '" title="' + $P.lang('LANG737') + '" localetitle="LANG737" class="options reboot disabled" disabled="disabled"></button>';
    } else {
        reboot = '<button extension="' + rowObject.extension + '" ip="' + rowObject.addr + '" extType="' + rowObject.account_type + '" title="' + $P.lang('LANG737') + '" localetitle="LANG737" class="options reboot"></button>';
    }

    if (role === 'privilege_0' || role === 'privilege_1') {
        return edit + reboot + del;
    } else {
        return edit + reboot;
    }
}

function createEmailStatus(cellvalue, options, rowObject) {
    var emailStatus;

    if (cellvalue && cellvalue === 'yes') {
        emailStatus = '<span locale="LANG4153" style="color: gray;">' + $P.lang('LANG4153') + '</span>';
    } else {
        emailStatus = '<span locale="LANG4154" style="color: green;">' + $P.lang('LANG4154') + '</span>';
    }

    return emailStatus;
}

function createStatus(cellvalue, options, rowObject) {
    var status,
        disabled = rowObject.out_of_service;

    if (disabled == 'yes') {
        status = '<span extension="' + rowObject.extension + '" class="LANG113" localetitle="LANG273" title="' + $P.lang('LANG273') + '"></span>';
    } else if (!cellvalue || cellvalue == 'Unavailable') {
        status = '<span extension="' + rowObject.extension + '" class="LANG113" localetitle="LANG113" title="' + $P.lang('LANG113') + '"></span>';
    } else if (cellvalue == 'Idle') {
        status = '<span extension="' + rowObject.extension + '" class="LANG2232" localetitle="LANG2232" title="' + $P.lang('LANG2232') + '"></span>';
    } else if (cellvalue == 'InUse') {
        status = '<span extension="' + rowObject.extension + '" class="LANG2242" localetitle="LANG2242" title="' + $P.lang('LANG2242') + '"></span>';
    } else if (cellvalue == 'Ringing') {
        status = '<span extension="' + rowObject.extension + '" class="LANG111" localetitle="LANG111" title="' + $P.lang('LANG111') + '"></span>';
    } else if (cellvalue == 'Busy') {
        status = '<span extension="' + rowObject.extension + '" class="LANG2237" localetitle="LANG2237" title="' + $P.lang('LANG2237') + '"></span>';
    }

    return status;
}

function createExtension(cellvalue, options, rowObject) {
    var extension;

    if (rowObject.out_of_service && rowObject.out_of_service == 'yes') {
        extension = '<span class="disabled_extension_trunk" localetitle="LANG273" title="' + $P.lang('LANG273') + '"></span>' + cellvalue;
    } else {
        extension = cellvalue;
    }

    return extension;
}

function createTable() {
    $("#extension-list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: doc.documentElement.clientWidth - 50,
        height: "auto",
        postData: {
            "action": "listAccount",
            "options": "extension,account_type,fullname,status,addr,out_of_service,email_to_user"
        },
        colNames: [
            '<span locale="LANG81">' + $P.lang('LANG81') + '</span>',
            '<span locale="LANG85">' + $P.lang('LANG85') + '</span>',
            '<span locale="LANG273">' + $P.lang('LANG273') + '</span>',
            '<span locale="LANG1065">' + $P.lang('LANG1065') + '</span>',
            '<span locale="LANG623">' + $P.lang('LANG623') + '</span>',
            '<span locale="LANG624">' + $P.lang('LANG624') + '</span>',
            '<span locale="LANG4152">' + $P.lang('LANG4152') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'status',
            index: 'status',
            width: 80,
            resizable: false,
            align: "center",
            formatter: createStatus
        }, {
            name: 'extension',
            index: 'extension',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createExtension
        }, {
            name: 'out_of_service',
            index: 'out_of_service',
            hidden: true
        }, {
            name: 'fullname',
            index: 'fullname',
            width: 120,
            resizable: false,
            align: "center"
        }, {
            name: 'account_type',
            index: 'account_type',
            width: 50,
            resizable: false,
            align: "center"
        }, {
            name: 'addr',
            index: 'addr',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createIP
        }, {
            name: 'email_to_user',
            index: 'email_to_user',
            width: 80,
            resizable: false,
            align: "center",
            formatter: createEmailStatus
        }, {
            name: 'options',
            index: 'options',
            width: 120,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        loadui: 'disable',
        pager: "#extension-pager",
        rowNum: 30,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: 'extension',
        noData: "LANG129 LANG87",
        jsonReader: {
            root: "response.account",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function() {
            $("#extension-list .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function() {
            $P.lang(doc, true);

            top.Custom.init(doc);

            updateLists();

            top.dialog.clearDialog();
        }
    });
}

function exportExts() {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG2734"),
        displayPos: "export_extension_div",
        frameSrc: "html/extension_import_export.html?mode=export"
    });
}

function generateTimeConditionTips(type) {
    var text = '';

    if (type == 'all') {
        text = $P.lang('LANG4220').format(
            $P.lang('LANG3271').toLowerCase(),
            $P.lang('LANG3266').toLowerCase(),
            $P.lang('LANG3271').toLowerCase(),
            $P.lang('LANG3266').toLowerCase());
    } else if (type == 'officeTime') {
        text = $P.lang('LANG4219').format(
            $P.lang('LANG3271').toLowerCase(),
            $P.lang('LANG3271').toLowerCase());
    } else if (type == 'holiday') {
        text = $P.lang('LANG4219').format(
            $P.lang('LANG3266').toLowerCase(),
            $P.lang('LANG3266').toLowerCase());
    }

    return text;
}

function getPortExtension() {
    portExtensionList = [];

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getFeatureCodes"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var featureSettings = data.response.feature_settings,
                    parkext = featureSettings.parkext,
                    parkpos = featureSettings.parkpos.split('-');

                portExtensionList.push(parseInt(parkext, 10));

                for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                    portExtensionList.push(i);
                }
            }
        }
    });
}

function importExts() {
    top.dialog.dialogInnerhtml({
        dialogTitle: $P.lang("LANG2733"),
        displayPos: "import_extension_div",
        frameSrc: "html/extension_import_export.html?mode=import"
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#extension-list"),
        totalPage = table.getGridParam("lastpage"),
        page = table.getGridParam("page"),
        reccount = table.getGridParam("reccount");

    if (page === totalPage && totalPage > 1 && reccount === selectedRows) {
        table.setGridParam({
            page: totalPage - 1
        }).trigger('reloadGrid');
    } else {
        table.trigger('reloadGrid');
    }
}

function reflesh_status() {
    var reflesh = $("#en_auto_reflesh");

    if (reflesh.is(':checked')) {

        var table = $("#extension-list"),
            page = table.getGridParam("page"),
            rowNum = table.getGridParam("rowNum"),
            sidx = table.getGridParam("sortname"),
            sord = table.getGridParam("sortorder"),
            dataIDs = table.getDataIDs(),
            dataIDsLength = dataIDs.length,
            oPostData = $("#extension-list").getGridParam("postData"),
            oRefleshData = {
                "action": "listAccount",
                "auto-refresh": Math.random(),
                "options": "extension,status,addr,account_type,fullname,out_of_service,email_to_user",
                "item_num": rowNum,
                "page": page,
                "sidx": sidx,
                "sord": sord
            };

        if (!refleshStatusSearch) {
            extNumVal = oPostData["fullname"];
            fullnameVal = oPostData["fullname"];
        } else {
            extNumVal = $("#search_extension").val();
            fullnameVal = $("#search_callerName").val();
        }

        if (oPostData["ext_num"]) {
            oRefleshData["ext_num"] = extNumVal;
        }

        if (oPostData["fullname"]) {
            oRefleshData["fullname"] = fullnameVal;
        }

        $.ajax({
            type: "post",
            url: "../cgi",
            data: oRefleshData,
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    var dataWithStatus = data.response.account,
                        dataWithStatusLength = dataWithStatus.length,
                        i = 0;

                    if (dataWithStatusLength == dataIDsLength) {
                        for (i; i < dataWithStatusLength; i++) {
                            var rowId = dataIDs[i],
                                rowObject = table.getRowData(rowId),
                                extension = dataWithStatus[i].extension,
                                status = dataWithStatus[i].status,
                                ip = dataWithStatus[i].addr,
                                type = dataWithStatus[i].account_type,
                                fullname = dataWithStatus[i].fullname,
                                emailStatus = dataWithStatus[i].email_to_user,
                                disabled = dataWithStatus[i].out_of_service;

                            rowObject.extension = extension;
                            rowObject.status = status;
                            rowObject.addr = ip;
                            rowObject.account_type = type;
                            rowObject.fullname = fullname;
                            rowObject.email_to_user = emailStatus;
                            rowObject.out_of_service = dataWithStatus[i].out_of_service;

                            table.setRowData(rowId, rowObject);
                        }
                    }

                }
            }
        });
    }

    setTimeout(reflesh_status, 5000);
}

function transAccountData(res, cb) {
    var ary = [];

    for (var i = 0; i < res.length; i++) {
        var extension = res[i].extension;

        ary.push(extension);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return ary;
}

function transMohData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        obj["val"] = res[i];

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function updateLists() {

    // update existNumberList/existExtentionList/existFXSList/extensionRange
    // existFXSList = UCMGUI.isExist.getList("getDahdiList"),
    var role = $P.cookie('role');

    extensionRange = UCMGUI.isExist.getRange('extension');

    languages = UCMGUI.isExist.getList('getLanguage');

    if (role !== 'privilege_3') {
        existNumberList = UCMGUI.isExist.getList("getNumberList");

        var accountList = UCMGUI.isExist.getList("getAccountList");

        existExtentionList = transAccountData(accountList);
        accountLists = transData(accountList);

        accountListsObj = {};
        
        for (var i = 0; i < accountList.length; i++) {
            var value = accountList[i]["extension"];

            accountListsObj[value] = accountList[i];
        }
    }
}

function checkTimeCondition() {
    var cfuTimetypeVal = $("#edit_cfu_timetype").val();
    if (cfuTimetypeVal == 6 && isEmptyTimeCondition) {
        return false;
    } else {
        return true;
    }
}

function validateCallerNumFormate(value, element) {
    if (/^[0-9\+]*x*.{0,1}$/i.test(value)) {
        return true;
    }

    return false;
}

function checkWhitelistOnly(val, ele) {
    var bOnly = true;

    if (val === '') {
        return true;
    }

    $('#strategy_table4').find('input').each(function() {
        if (this.id === ele.id) {
            return true;
        }

        if (this.value === val) {
            bOnly = false;
            return false;
        }
    });

    return bOnly;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "search_extension": {
                noSpaces: true,
                customCallback1: [$P.lang("LANG2767"), validateCallerNumFormate],
                // digits: true
                maxlength: 18
            },
            "search_callerName": {
                noSpacesInFrontAndEnd: true,
                cidName: true,
                maxlength: 64
            },
        },
        submitHandler: function() {
            var txt = $P.lang("LANG3773");
            refleshStatusSearch = true;
            top.dialog.dialogMessage({
                type: "loading",
                title: txt,
                content: txt
            });

            setTimeout(function() {
                $('#extension-list')
                    .setGridParam({
                        postData: {
                            "ext_num": $("#search_extension").val(),
                            "fullname": $("#search_callerName").val()
                        },
                        page: 1
                    })
                    .trigger('reloadGrid');
            }, 200);
        }
    });

    $("#search_all").on('click', function() {
        var txt = $P.lang("LANG3773");
        refleshStatusSearch = false;
        top.dialog.dialogMessage({
            type: "loading",
            title: txt,
            content: txt
        });

        $('#search_extension').val('');
        $('#search_callerName').val('');

        setTimeout(function() {
            delete $("#extension-list").getGridParam("postData")["ext_num"];
            delete $("#extension-list").getGridParam("postData")["fullname"];

            $('#extension-list').trigger('reloadGrid');
        }, 200);

        return false;
    });
}

function addEditExtension() {
    var type = extType.toLowerCase();

    bindTimeConditionEvent();

    append_time_value("edit");

    if (type) {
        $(".div_" + type).css({
            "display": "inline-block"
        });

        if (type !== 'fxs') {
            $("#codec_div").closest('.field-cell').show();

            $("#div_sip_iax_secret, #div_encryption, #div_strategy_ipacl").css({
                "display": "inline-block"
            });

            if (type == 'sip') {
                $("#div_sip_enablehotdesk,#auth_id").css({
                    "display": "inline-block"
                });

                $('#edit_enablehotdesk').click(function(ev) {
                    change_enablehotdesk('edit_enablehotdesk', 'edit_secret');

                    isEnableWeakPw();

                    ev.stopPropagation();
                });
            }

            bind_codecs_action('codec', type);

            $("#div_dahdi").hide();

            $("#faxmode").css("display", "block").find('option[value="gateway"]').remove();
        } else {
            $("#div_dahdi").css({
                "display": "inline-block"
            });

            setFXSData();
        }
    }

    var lanOption = "<option value>" + $P.lang("LANG257") + "</option>";

    $.each(languages, function(key, value) {
        lanOption += "<option value='" + value.language_id + "'>" + value.language_name + "</option>";
    });

    $("#language").append(lanOption);

    if (mohNameList.length == 0) {
        mohNameList = [{
            val: "default"
        }, {
            val: "ringbacktone_default"
        }];
    }

    selectbox.appendOpts({
        el: "edit_mohsuggest",
        opts: mohNameList
    }, doc);

    $("#edit_mohsuggest").val('default');

    //$("#edit_extension").val(generateNewExtension());

    // $("#div_fullname").css({
    //     "display": "inline-block"
    // });

    var action = "action=";

    if (type == "sip") {
        action += "getSIPAccount";
    } else if (type == "iax") {
        action += "getIAXAccount";
    } else if (type == "fxs") {
        action += "getFXSAccount";
    }

    action += "&extension=" + extExtension;

    getExtensionValue(action, "#add_extension_div");
    // existNumberList = UCMGUI.isExist.getList("getNumberList");

    enableVQH();

    changeShowHide($('#edit_dnd'), $('#strategy_table4_div'));

    $('#edit_dnd').trigger('change');
}

function changeShowHide(enableObj, target) {
    enableObj.on("change", function() {
        if (this.checked) {
            target.css('display', 'block');
        } else {
            target.hide();
        }
    });
}

function getExtensionValue(action, doc) {
    var type = extType.toLowerCase();

    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var extension = data.response.extension;

                privilegeInfo = data.response.privilege_info;

                if (extension) {
                    //var data = data.response.extension;

                    for (var item in extension) {
                        if (extension.hasOwnProperty(item)) {
                            var element = $("#edit_" + item, doc),
                                itemValue = extension[item];

                            if (element.length === 0 && item === 'dndwhitelist' && itemValue !== null) {
                                var whitelistnum_array = itemValue.split(',');

                                if (whitelistnum_array.length >= 1) {
                                    $('#edit_whitelist1').val(whitelistnum_array[0]);
                                }

                                if (whitelistnum_array.length > 1) {
                                    for (var i = 1; i < whitelistnum_array.length; i++) {
                                            addRowLikeDomain(document, {
                                            "tableId": "strategy_table4",
                                            "rowNamePrefix": "edit_whitelist",
                                            "rowIdPrefix": "edit_whitelist",
                                            "startWith1": true,
                                            "maxRow": maxRowOfLocalNet,
                                            "value": whitelistnum_array[i],
                                            "validRules": {
                                                phoneNumberOrExtension: true,
                                                customCallback: [$P.lang("LANG5211"), checkWhitelistOnly]
                                            }
                                        });
                                    }
                                }
                            }

                            if (element.length != 0) {
                                if (item == 'allow') {
                                    setAllowData(itemValue);
                                } else if (item.beginsWith('local_network')) {
                                    if (item === 'local_network1') {
                                        $('#edit_local_network1').val(itemValue);
                                    }

                                    if (element.length == 0 && itemValue !== '') {
                                        var maxRowOfLocalNet = 10;

                                        addRowLikeDomain(document, {
                                            "tableId": "strategy_table1",
                                            "rowNamePrefix": "local_network",
                                            "rowIdPrefix": "edit_local_network",
                                            "startWith1": true,
                                            "maxRow": maxRowOfLocalNet,
                                            "value": itemValue,
                                            "validRules": {
                                                customCallback: [$P.lang("LANG2131"), check_network]
                                            }
                                        });
                                    }
                                } else if (item == 'ring_timeout' || item == 'maxcallnumbers') {
                                    element.val(itemValue === 0 ? "" : itemValue);
                                } else if (item == 'vmsecret') {
                                    element.val(itemValue === '-' ? "" : itemValue);
                                } else {
                                    if (element.attr('type') == 'checkbox') {
                                        element[0].checked = (itemValue == 'yes' ? true : false);
                                    } else {
                                        if ((item !== 'cc_max_agents') && (item !== 'cc_max_monitors')) {
                                            element.val(itemValue);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    var accountList = UCMGUI.isExist.getList("getAccountList");
                        existExtentionList = transAccountData(accountList),
                        seamless_tmpGroupExt = [],
                        seamless_membersArr = extension.seamless_transfer_members ? extension.seamless_transfer_members.split(",") : [];

                    seamless_tmpGroupExt = Array.prototype.copy.call(existExtentionList, seamless_tmpGroupExt);
                    seamless_membersArr.remove(extension.extension);
                    seamless_tmpGroupExt.remove(seamless_membersArr);
                    seamless_tmpGroupExt.remove(extension.extension);

                    var seamless_rightGroupExt = transExtensionData(seamless_membersArr),
                        seamless_leftGroupExt = transExtensionData(seamless_tmpGroupExt);

                    selectbox.appendOpts({
                        el: "seamless_leftSelect",
                        opts: seamless_leftGroupExt
                    }, document);

                    selectbox.appendOpts({
                        el: "seamless_rightSelect",
                        opts: seamless_rightGroupExt
                    }, document);

                    if (extension['dahdi']) {
                        currentPort = extension['dahdi'];
                    }

                    if ((extension['faxdetect'] === 'no') && (extension['fax_gateway'] === 'no')) {
                        $('#edit_faxmode').val('no');
                    } else if (extension['faxdetect'] === 'yes') {
                        $('#edit_faxmode').val('detect');
                    } else if (extension['fax_gateway'] === 'yes') {
                        $('#edit_faxmode').val('gateway');
                    }

                    $("#edit_extension")[0].disabled = true;
                    $('#edit_vmsecret')[0].disabled = !$('#edit_hasvoicemail')[0].checked;
                    $('#edit_skip_vmsecret')[0].disabled = !$('#edit_hasvoicemail')[0].checked;
                    $('#edit_authid')[0].disabled = $('#edit_enablehotdesk')[0].checked;
                    $('#edit_external_number')[0].disabled = !$('#edit_en_ringboth')[0].checked;
                    $('#edit_ringboth_timetype')[0].disabled = !$('#edit_en_ringboth')[0].checked;
                    $('#edit_hotline_number')[0].disabled = !$('#edit_en_hotline')[0].checked;
                    $('#edit_hotline_type')[0].disabled = !$('#edit_en_hotline')[0].checked;
                    $('#edit_dnd_timetype')[0].disabled = !$('#edit_dnd')[0].checked;

                    //change_enablehotdesk('edit_enablehotdesk', 'edit_secret');

                    isEnableWeakPw();

                    //changeShow();

                    if (!$.isEmptyObject(privilegeInfo)) {
                        updateDocumentException(extension, document, privilegeInfo, {
                            before: "edit_"
                        });
                    }

                    $("#extension_detail").show();
                }
            }
        }
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getUser",
            "user_name": extExtension
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                if (data.response.user_name && data.response.user_name != {}) {
                    var userInfo = data.response.user_name;

                    userPrivilegeInfo = data.response.privilege_info;

                    $('#first_name').val(userInfo.first_name);
                    $('#last_name').val(userInfo.last_name);
                    $('#email').val(userInfo.email);
                    $('#language').val(userInfo.language);
                    $('#user_password').val(userInfo.user_password);

                    userID = userInfo.user_id;

                    if (!$.isEmptyObject(userPrivilegeInfo)) {
                        updateDocumentException(userInfo, document, userPrivilegeInfo);
                    }
                }
            }
        }
    });

    listTimeConditionOfficeTime();

    top.Custom.init(document);
}

function listTimeConditionOfficeTime() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listTimeConditionOfficeTime",
            "user_id": userID,
            "sidx": "condition_index",
            "sord": "asc"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var time_condition = data.response.time_conditions_officetime,
                    translateTime = time_condition.sortBy('condition_index'),
                    ary = [];

                    if (time_condition.length == 0) {
                        isEmptyTimeCondition = true;
                    }

                for (var i = 0; i < translateTime.length; i++) {
                    var obj = translateTime[i];

                    obj.start_hour = addZero(obj.start_hour);
                    obj.start_min = addZero(obj.start_min);
                    obj.end_hour = addZero(obj.end_hour);
                    obj.end_min = addZero(obj.end_min);

                    var stime_hour = obj.start_hour,
                        stime_minute = obj.start_min,
                        ftime_hour = obj.end_hour,
                        ftime_minute = obj.end_min;

                    if (stime_hour == "" && stime_minute == "" &&
                        ftime_hour == "" && ftime_minute == "") {

                        obj.time = "00:00-23:59";
                    } else {
                        obj.time = stime_hour + ':' + stime_minute + '-' +
                            ftime_hour + ':' + ftime_minute;
                    }

                    ary.push(obj);
                }

                OrderTable.lists = ary;

                initTimeConditionTable();
            }
        }
    });
}

// enable Voicemail Qualify Hotdesk
function enableVQH() {
    enableCheckBox({
        enableCheckBox: 'edit_hasvoicemail',
        enableList: ['edit_vmsecret']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_enable_qualify',
        enableList: ['edit_qualifyfreq']
    }, doc);
    disableCheckBox({
        enableCheckBox: 'edit_enablehotdesk',
        enableList: ['edit_authid']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_en_ringboth',
        enableList: ['edit_external_number', 'edit_ringboth_timetype']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_en_hotline',
        enableList: ['edit_hotline_number', 'edit_hotline_type']
    }, doc);
    enableCheckBox({
        enableCheckBox: 'edit_dnd',
        enableList: ['edit_dnd_timetype']
    }, doc);
}

function bind_codecs_action(id, type) {
    if (type !== 'fxs') {
        $('#button_add_' + id).bind('click', function() {
            if (!$('#select_available_' + id)[0].value || $('#edit_allow')[0].disabled) {
                return;
            }

            $(':selected', '#select_available_' + id).each(function(idx, item) {
                var text = $(item).clone();

                $(item).remove();

                $('#edit_allow').append(text);
            });

            $P("#edit_allow", document).valid();
        });

        $('#button_remove_' + id).bind('click', function() {
            if (!$('#edit_allow')[0].value || $('#edit_allow')[0].disabled) {
                return;
            }

            $(':selected', '#edit_allow').each(function(idx, item) {
                var text = $(item).clone();

                $(item).remove();

                $('#select_available_' + id).append(text);
            });

            $P("#edit_allow", document).valid();
        });

        $('#button_removeall_' + id).bind('click', function() {
            if ($('#edit_allow')[0].disabled) {
                return;
            }

            $("#edit_allow").children().each(function(idx, item) {
                var text = $(item).clone();

                $(item).remove();

                $('#select_available_' + id).append(text);
            });

            $P("#edit_allow", document).valid();
        });

        $('#button_addall_' + id).bind('click', function() {
            if ($('#edit_allow')[0].disabled) {
                return;
            }

            // modified to do not override former order in selected box, just append it
            $('#select_available_' + id).children().each(function(idx, item) {
                var text = $(item).clone();

                $(item).remove();

                $('#edit_allow').append(text);
            });

            $P("#edit_allow", document).valid();
        });

        // bind up/down/top/bottom button
        $('#button_up').bind('click', function() {
            var op = $('#edit_allow option:selected');

            if (op.length) {
                op.first().prev().before(op);
            }
        });

        $('#button_down').bind('click', function() {
            var op = $('#edit_allow option:selected');

            if (op.length) {
                op.last().next().after(op);
            }
        });

        $('#button_top').bind('click', function() {
            var op = $('#edit_allow option:selected'),
                all = $('#edit_allow option');

            if (op.length) {
                if (all.first()[0] === op.first()[0]) {
                    return;
                }

                all.first().before(op);

                $('#edit_allow').scrollTop(0);
            }
        });

        $('#button_bottom').bind('click', function() {
            var op = $('#edit_allow option:selected'),
                all = $('#edit_allow option');

            if (op.length) {
                if (all.last()[0] === op.last()[0]) {
                    return;
                }

                all.last().after(op);

                var selects = $('#edit_allow');

                selects.scrollTop(selects[0].scrollHeight);
            }
        });
    }
}

function bindTimeConditionEvent() {
    $('#mode').bind("click", function(ev) {
        if ($(this).is(':checked')) {
            $('.local_month').show();
            $('.local_day').show();
            $('#new_itrl_day_container').show();
        } else {
            $('.local_month').hide();
            $('.local_day').hide();
            $('#new_itrl_day_container').hide();
        }
    });

    // init days
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

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#new_itrl_day_container').delegate('td', 'mouseup', function(ev) {
        datactol.clicked = false;

        $('.day_selected_pending').attr('class', 'day_selected');
        $('.day_unselected_pending').attr('class', 'day_unselected');
        $('#new_itrl_day_container').undelegate('td', 'mouseover', dayMouseEnter);
        $('#new_itrl_day_container').css('cursor', 'auto');

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
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

function change_enablehotdesk(hotdesk, secret) {
    if ($("#" + hotdesk)[0].checked) {
        var new_rule = {
            required: true,
            realAlphanumeric: true,
            minlength: 4
        };

        $('#edit_authid').val(extension);
        $P('#' + secret, document).rules("remove");

        $P('#' + secret, document).rules("add", new_rule);
    } else {
        var new_rule = {
            required: true,
            keyboradNoSpacesemicolon: true,
            minlength: 4
        };

        $P('#' + secret, document).rules("remove");

        $P('#' + secret, document).rules("add", new_rule);
    }
}

var isEnableWeakPw = function() {
    if (extensionRange[4] == "yes") { // weak_password
        $(".password-div").hide();

        var obj = {
                pwsId: "#edit_secret",
                doc: document
            },
            new_ext = $P.lang("LANG85"),
            edit_secret = $P.lang("LANG1075"),
            edit_vmsecret = $P.lang("LANG1079");

        $P("#edit_secret", document).rules("add", {
            required: true,
            identical: [new_ext, edit_secret, $("#edit_extension")],
            checkAlphanumericPw: [showCheckPassword, obj]
        });
        $P("#edit_vmsecret", document).rules("add", {
            identical: [new_ext, edit_vmsecret, $("#edit_extension")],
            checkNumericPw: [
                showCheckPassword, {
                    type: "digital",
                    pwsId: "#edit_vmsecret",
                    doc: document
                }
            ]
        });
        $P("#user_password", document).rules("add", {
            checkAlphanumericPw: [
                showCheckPassword, {
                    pwsId: "#user_password",
                    doc: document
                }
            ]
        });
    }
};

var OrderTable = {
    "lists": [],
    "table_id": '',
    "operater_switch": true,
    "newCell": [],
    "click_val": null,
    "bind_event": function() {
        var TBL = $('#' + this.table_id)[0];
        $(TBL).off('click', '.table-add');
        $(TBL).off('click', '.table-del');
        $(TBL).off('click', '.table-edit');

        $(TBL).on('click', '.table-add', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            if (OrderTable.max_failover > 0 && OrderTable.max_failover <= OrderTable.lists.length) {
                var target = $(this),
                    max_msg = $P.lang("LANG2141").format(OrderTable.max_failover);

                // XXX it doesn't work until I set tooltip position twice.
                $(this).tooltip({
                    position: {
                        my: "right center",
                        at: "left center"
                    }
                });

                $(this).attr("titles", max_msg).addClass("ui-state-highlight").trigger("focusin");

                setTimeout(function() {
                    target.removeAttr("titles").removeClass("ui-state-highlight").trigger("focusout");
                }, 2000);

                return;
            }

            $('.command').hide();

            append_time_value();

            var clickRow = $(this).parent().parent(),
                newCell = doc.createElement('tr');

            OrderTable.newCell = $(newCell);

            $(newCell).css('background', '#CAECFF');
            newCell.id = 'new_time_condition';

            var cell = doc.createElement('td');

            $(cell).attr('colspan', 5);
            newCell.appendChild(cell);

            // new add div
            var div = doc.createElement('div');

            $(div).attr('class', 'testdiv');
            cell.appendChild(div);

            $('#table_edit_template').appendTo($(div));

            clickRow.after(newCell);

            $('#table-add-btn').show();
            $('#table-edit-btn').hide();

            // default edit value
            OrderTable.set_edit_values(-1);

            if (clickRow.attr('data-item-val') === 'add_item') {
                clickRow.hide();
            }

            // $('#table-add-btn').show();
            OrderTable.click_val = $(this).parent().parent().attr('data-item-val');

            $("#table_edit_template input[type=checkbox]:checked").each(function(index) {
                this.checked = false;
                this.previousSibling.style.backgroundPosition = "0 0";
            });

            $("#table_edit_template input[type=radio]").each(function(index) {
                if (!this.checked) {
                    this.previousSibling.style.backgroundPosition = "0 0";
                }
            });

            $("#new_itrl_stime_hour").change(function() {
                if (!$("#new_itrl_stime_minute").val()) {
                    $("#new_itrl_stime_minute").val("00");
                    top.Custom.init(doc, $('#new_itrl_stime_minute')[0]);
                }
            });

            $("#new_itrl_ftime_hour").change(function() {
                if (!$("#new_itrl_ftime_minute").val()) {
                    $("#new_itrl_ftime_minute").val("00");
                    top.Custom.init(doc, $('#new_itrl_ftime_minute')[0]);
                }
            });

            OrderTable.operater_switch = 'add';

            top.Custom.init(doc);

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;

            // TODO
            // disable operator -- add/edit/up/down...
        });

        $(TBL).on('click', '.table-del', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            var clickRow = $(this).parent().parent();
            var curIdx = OrderTable.getOptionOrder('condition_index', clickRow.attr('data-item-val'));

            // remove select item from lists
            OrderTable.lists.splice(curIdx, 1);

            OrderTable.refresh_timecondition();

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });

        $(TBL).on('click', '.table-edit', function(ev) {
            if (OrderTable.operater_switch !== true) {
                return false;
            }

            $('.command').hide();

            var clickRow = $(this).parent().parent(),
                newCell = doc.createElement('tr');

            OrderTable.newCell = $(newCell);
            $(newCell).css('background', '#CAECFF');

            var cell = doc.createElement('td');
            $(cell).attr('colspan', 5);
            newCell.appendChild(cell);

            var curIdx = OrderTable.getOptionOrder('condition_index', clickRow.attr('data-item-val'));
            OrderTable.set_edit_values(curIdx);

            // new add div
            var div = doc.createElement('div');
            $(div).attr('class', 'testdiv');
            cell.appendChild(div);

            $('#table_edit_template').appendTo($(div));

            clickRow.after(newCell);
            $('#table-add-btn').hide();
            $('#table-edit-btn').show();
            clickRow.hide();

            OrderTable.click_val = $(this).parent().parent().attr('data-item-val');
            OrderTable.operater_switch = 'edit';

            top.Custom.init(doc);

            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            return false;
        });
    },
    "getOptionOrder": function(key, val) {
        var len = this.lists.length;

        for (var i = 0; i < len; i++) {
            if (this.lists[i][key] == val) {
                return i;
            }
        }

        return -1;
    },
    "tbl_btn_cancel": function(ev) {
        $('.command').show();

        $('#table_edit_template').appendTo($('#table_template_placeholder'));
        $('[data-item-val="' + this.click_val + '"]').show();

        this.newCell.remove();
        this.newCell = [];
        OrderTable.operater_switch = true;
        OrderTable.click_val = null;
    },
    "tbl_btn_add": function(ev) {
        // TODO
        // var elements = '#new_itrl_tc_dest, #new_itrl_tc_dest_val, #new_itrl_tc_digits, ' +
        //         '#new_itrl_stime_hour, #new_itrl_ftime_hour, #new_itrl_stime_minute, ' +
        //         '#new_itrl_ftime_minute, #new_itrl_month_jan, #new_itrl_week_sun';

        if (!$P('#user_detail_form', document).valid()) {
            return;
        }

        if ($('#mode')[0].checked) {
            if (!check_days_required()) {
                // check failed
                return;
            }
        }

        // Prevent form submit by pressing enter key. Pengcheng Zou Added.
        // if (!check_week_required()) {
        //     return false;
        // }

        var stime_hour = $('#new_itrl_stime_hour')[0].value,
            stime_minute = $('#new_itrl_stime_minute')[0].value,
            ftime_hour = $('#new_itrl_ftime_hour')[0].value,
            ftime_minute = $('#new_itrl_ftime_minute')[0].value,
            time = '';

        if (stime_hour == "" && stime_minute == "" && ftime_hour == "" && ftime_minute == "") {
            stime_hour = '00';
            stime_minute = '00';
            ftime_hour = '23';
            ftime_minute = '59';
            time = "00:00-23:59";
        } else {
            time = stime_hour + ':' + stime_minute + '-' + ftime_hour + ':' + ftime_minute;
        }

        var date_add = function(container, key, el_id) {
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
        };

        var mode = '';

        if ($('#mode')[0].checked) {
            mode = 'byDay';
        } else {
            mode = 'byWeek';
        }

        // week
        var week = {
            value: ''
        };

        date_add(week, 'week', 'new_itrl_week_sun');
        date_add(week, 'week', 'new_itrl_week_mon');
        date_add(week, 'week', 'new_itrl_week_tue');
        date_add(week, 'week', 'new_itrl_week_wed');
        date_add(week, 'week', 'new_itrl_week_thu');
        date_add(week, 'week', 'new_itrl_week_fri');
        date_add(week, 'week', 'new_itrl_week_sat');

        // month
        var month = {
                value: ''
            },
            day = {
                value: ''
            };

        if (!$('#mode')[0].checked) {
            month.value = '*';
            day.value = '*';
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

        $('#table_edit_template').appendTo($('#table_template_placeholder'));

        // display time condition
        this.newCell = [];

        var order = this.getOptionOrder('condition_index', this.click_val);

        order = parseInt(order, 10);

        // time condition object
        var newTimeCondition = {
            'condition_index': getIndexName(),
            'start_hour': stime_hour,
            'start_min': stime_minute,
            'end_hour': ftime_hour,
            'end_min': ftime_minute,
            'time': time,
            'mode': mode,
            'week_day': week['value'],
            'month': month['value'],
            'day': day['value']
        };

        this.lists.splice(order + 1, 0, newTimeCondition);
        this.refresh_timecondition();

        $('.command').show();

        OrderTable.operater_switch = true;
        OrderTable.click_val = null;

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    },
    "tbl_btn_update": function(ev) {
        // TODO
        // var elements = '#new_itrl_tc_dest, #new_itrl_tc_dest_val, #new_itrl_tc_digits, ' +
        //         '#new_itrl_stime_hour, #new_itrl_ftime_hour, #new_itrl_stime_minute, ' +
        //         '#new_itrl_ftime_minute, #new_itrl_month_jan, #new_itrl_week_sun';

        if (!$P('#user_detail_form', document).valid()) {
            return;
        }

        if ($('#mode')[0].checked) {
            if (!check_days_required()) {
                // check failed
                return;
            }
        }

        var order = this.getOptionOrder('condition_index', this.click_val),
            stime_hour = $('#new_itrl_stime_hour')[0].value,
            stime_minute = $('#new_itrl_stime_minute')[0].value,
            ftime_hour = $('#new_itrl_ftime_hour')[0].value,
            ftime_minute = $('#new_itrl_ftime_minute')[0].value,
            time = stime_hour + ':' + stime_minute + '-' + ftime_hour + ':' + ftime_minute;

        var mode = '';

        if ($('#mode')[0].checked) {
            mode = 'byDay';
        } else {
            mode = 'byWeek';
        }

        this.lists[order]['start_hour'] = stime_hour;
        this.lists[order]['start_min'] = stime_minute;
        this.lists[order]['end_hour'] = ftime_hour;
        this.lists[order]['end_min'] = ftime_minute;
        this.lists[order]['time'] = time;
        this.lists[order]['mode'] = mode;

        var date_add = function(container, key, el_id) {
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
        };

        // week
        var week = {
            value: ''
        };

        date_add(week, 'week', 'new_itrl_week_sun');
        date_add(week, 'week', 'new_itrl_week_mon');
        date_add(week, 'week', 'new_itrl_week_tue');
        date_add(week, 'week', 'new_itrl_week_wed');
        date_add(week, 'week', 'new_itrl_week_thu');
        date_add(week, 'week', 'new_itrl_week_fri');
        date_add(week, 'week', 'new_itrl_week_sat');

        this.lists[order]['week_day'] = week.value;

        // month
        var month = {
                value: ''
            },
            day = {
                value: ''
            };

        if (!$('#mode')[0].checked) {
            month.value = '*';
            day.value = '*';
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

        this.lists[order]['month'] = month.value;
        this.lists[order]['day'] = day.value;

        $('#table_edit_template').appendTo($('#table_template_placeholder'));

        //this.newCell.remove();
        this.newCell = [];

        this.refresh_timecondition();

        $('.command').show();

        OrderTable.operater_switch = true;
        OrderTable.click_val = null;

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    },
    "refresh_timecondition": function() {
        var TBL = $('#' + this.table_id)[0];

        $(TBL).children().remove();

        var addCell = UCMGUI.domFunction.tr_addCell;

        (function() { // add first row
            var newRow = TBL.insertRow(-1);

            newRow.className = "frow";

            addCell(newRow, {
                html: $P.lang('LANG247'),
                locale: 'LANG247'
            });
            addCell(newRow, {
                html: $P.lang('LANG243'),
                locale: 'LANG243'
            });
            addCell(newRow, {
                html: $P.lang('LANG244'),
                locale: 'LANG244'
            });
            addCell(newRow, {
                html: $P.lang('LANG242'),
                locale: 'LANG242'
            });
            addCell(newRow, {
                html: $P.lang('LANG74'),
                locale: 'LANG74'
            });
        })();

        var len = this.lists.length;

        if (len <= 0) {
            isEmptyTimeCondition = true;
            var newRow = TBL.insertRow(-1);

            newRow.className = "odd";

            var td = $('<td colspan=5 />');

            $(newRow).append(td);
            $(newRow).attr('data-item-val', 'add_item');
            $(td).append('<span class="table-add">' + $P.lang('LANG1562') + '</span>');

            return false;
        } else {
            isEmptyTimeCondition = false;
        }

        // show item list
        for (var i = 0; i < len; i++) {
            var item = this.lists[i],
                newRow = TBL.insertRow(-1);

            newRow.className = ((TBL.rows.length) % 2 == 1) ? 'odd' : 'even';

            addCell(newRow, {
                html: item.time || ''
            });

            addCell(newRow, {
                html: createWeek(item.week_day)
            });

            addCell(newRow, {
                html: createMonth(item.month)
            });

            addCell(newRow, {
                html: createDay(item.day)
            });

            // addCell(newRow, { html: "<div locale=\"LANG566 "+tmp_dest+"\">"+"$P.lang(\""+lang+"\") -- "+tmp_str+"</div>"});
            var newCell = newRow.insertCell(newRow.cells.length);
            var $tmp;

            // add icon
            $tmp = $('<span />').addClass('table-add tableIcon table-add-icon').attr('localeTitle', 'LANG769').attr('title', $P.lang('LANG769')).appendTo(newCell);

            // empty icon 
            // $tmp = $('<span />').addClass('tableIcon').appendTo(newCell);
            // edit, delete icons
            $tmp = $('<span />').attr('title', $P.lang('LANG738')).attr('localeTitle', 'LANG738').addClass('table-edit tableIcon').appendTo(newCell);
            $tmp = $('<span />').attr('title', $P.lang('LANG739')).attr('localeTitle', 'LANG739').addClass('table-del tableIcon').appendTo(newCell);

            $(newRow).attr('data-item-val', item.condition_index);
        }

        $('.table-add').tooltip({
            position: {
                my: "right center",
                at: "left center"
            }
        });
    },
    "set_edit_values": function(idx) {
        $(".chk_week").attr("checked", false);
        $("#new_itrl_week_all").attr("checked", false);
        $(".chk_month").attr("checked", false);
        $("#new_itrl_month_all").attr("checked", false);

        var set_chkbox_all = function(type, value) {
            var str = '#new_itrl_' + type + '_container',
                container = $(str).children();

            for (var i = 0; i < container.length; i++) {
                var it = container[i];

                if (it.type == 'checkbox') {
                    it.checked = value;
                }
            }
        };

        var set_selected_chkbox = function(str, type, value) {
            var template = 'new_itrl_' + type + '_';

            if (str.split("&").length == 7) {
                $("#new_itrl_week_all").attr("checked", true);
            }
            if (str.split("&").length == 12) {
                $("#new_itrl_month_all").attr("checked", true);
            }

            while (str.indexOf('&') != -1) {
                var offset = str.indexOf('&'),
                    sstr = str.substring(0, offset),
                    chkbox = doc.getElementById(template + sstr);

                if (chkbox) {
                    chkbox.checked = value;
                }

                $('day_' + sstr).attr('class', 'day_selected');

                str = str.substring(offset + 1);
            }

            if (str != '') {
                var chkbox = doc.getElementById(template + str);

                if (chkbox) {
                    chkbox.checked = value;
                }
            }
        };

        if (idx == -1) {
            $('#new_itrl_stime_hour')[0].selectedIndex = -1;
            $('#new_itrl_stime_minute')[0].selectedIndex = -1;
            $('#new_itrl_ftime_hour')[0].selectedIndex = -1;
            $('#new_itrl_ftime_minute')[0].selectedIndex = -1;

            set_chkbox_all('week', false);
            set_chkbox_all('month', false);

            $('.local_month, .local_day').hide();

            $('#new_itrl_day_container td').removeClass('day_selected').addClass('day_unselected');
            return;
        }

        var item = this.lists[idx] || {},
            tmp_str,
            mode;

        // time
        $('#new_itrl_stime_hour').val(item.start_hour);
        $('#new_itrl_stime_minute').val(item.start_min);
        $('#new_itrl_ftime_hour').val(item.end_hour);
        $('#new_itrl_ftime_minute').val(item.end_min);

        // week
        tmp_str = item.week_day;

        set_chkbox_all('week', false);

        set_selected_chkbox(tmp_str.toLowerCase(), 'week', true);

        mode = item.mode;

        if (mode == 'byDay') {
            $('#mode')[0].checked = true;

            $('.local_month, .local_day, #new_itrl_day_container').show();
        } else {
            $('#mode')[0].checked = false;

            $('.local_month, .local_day, #new_itrl_day_container').hide();
        }

        // month
        tmp_str = item.month;

        set_chkbox_all('month', false);

        if (tmp_str == '*') {
            // Do nothing
        } else {
            set_selected_chkbox(tmp_str.toLowerCase(), 'month', true);
        }

        var chkbox_all = function(value) {
            var i = 1,
                t = doc.getElementById('new_itrl_day_' + i);

            while (t) {
                t.checked = value;

                i++;

                t = doc.getElementById('new_itrl_day_' + i);
            }
        };

        var chkbox_selected = function(str, value) {
            $(".day_selected").removeClass("day_selected");

            str.split('&').each(function(item) {
                $('#day_' + item).attr('class', 'day_selected');
            });
        };

        // day
        tmp_str = item.day;

        chkbox_all(false);

        if (tmp_str == '*') {
            // Do nothing
            $('#new_itrl_day_container td').removeClass('day_selected').addClass('day_unselected');
        } else {
            chkbox_selected(tmp_str.toLowerCase(), true);
        }
    }
};

function getIndexName() {
    var length = 1000000,
        orderTableListsLength = OrderTable.lists.length,
        i = 0,
        j;

    for (i; i < length; i++) {

        var exist = false;

        for (j = 0; j < orderTableListsLength; j++) {
            if (i == OrderTable.lists[j]['condition_index']) {
                exist = true;
                break;
            }
        }

        if (!exist) {
            break;
        }
    }

    return i;
}

function ReturnWeek(list) {
    var str = list.split('&'),
        dictWeek = {};

    dictWeek["sun"] = '<span locale="LANG250">' + $P.lang("LANG250") + '</span>';
    dictWeek["mon"] = '<span locale="LANG251">' + $P.lang("LANG251") + '</span>';
    dictWeek["tue"] = '<span locale="LANG252">' + $P.lang("LANG252") + '</span>';
    dictWeek["wed"] = '<span locale="LANG253">' + $P.lang("LANG253") + '</span>';
    dictWeek["thu"] = '<span locale="LANG254">' + $P.lang("LANG254") + '</span>';
    dictWeek["fri"] = '<span locale="LANG255">' + $P.lang("LANG255") + '</span>';
    dictWeek["sat"] = '<span locale="LANG256">' + $P.lang("LANG256") + '</span>';

    tmpstr = "";

    for (i = 0; i < str.length; i++) {
        if (tmpstr == "") {
            tmpstr = dictWeek[str[i]];
        } else {
            tmpstr += " " + dictWeek[str[i]];
        }
    }

    return tmpstr;
}

function ReturnMonth(list) {
    var str = list.split('&'),
        dictMonth = {};

    dictMonth["jan"] = '<span locale="LANG204 \'\'">' + $P.lang("LANG204").format("") + '</span>';
    dictMonth["feb"] = '<span locale="LANG205 \'\'">' + $P.lang("LANG205").format("") + '</span>';
    dictMonth["mar"] = '<span locale="LANG206 \'\'">' + $P.lang("LANG206").format("") + '</span>';
    dictMonth["apr"] = '<span locale="LANG207 \'\'">' + $P.lang("LANG207").format("") + '</span>';
    dictMonth["may"] = '<span locale="LANG208 \'\'">' + $P.lang("LANG208").format("") + '</span>';
    dictMonth["jun"] = '<span locale="LANG209 \'\'">' + $P.lang("LANG209").format("") + '</span>';
    dictMonth["jul"] = '<span locale="LANG210 \'\'">' + $P.lang("LANG210").format("") + '</span>';
    dictMonth["aug"] = '<span locale="LANG211 \'\'">' + $P.lang("LANG211").format("") + '</span>';
    dictMonth["sep"] = '<span locale="LANG212 \'\'">' + $P.lang("LANG212").format("") + '</span>';
    dictMonth["oct"] = '<span locale="LANG213 \'\'">' + $P.lang("LANG213").format("") + '</span>';
    dictMonth["nov"] = '<span locale="LANG214 \'\'">' + $P.lang("LANG214").format("") + '</span>';
    dictMonth["dec"] = '<span locale="LANG215 \'\'">' + $P.lang("LANG215").format("") + '</span>';

    tmpstr = "";

    for (i = 0; i < str.length; i++) {
        tmpstr += dictMonth[str[i]];
    }

    return tmpstr;
}

function setAllowData(data) {
    if (!data) {
        return;
    }

    var allow = data.split(','),
        length = allow.length,
        i = 0,
        selectAvailableCodec = $("#select_available_codec"),
        editAllow = $("#edit_allow"),
        editAllowOptions = $("#edit_allow option");

    selectAvailableCodec.append(editAllowOptions);
    editAllow.empty();

    for (i; i < length; i++) {
        var item = $("#select_available_codec option[value=" + allow[i] + "]");
        $("#edit_allow").append(item);
    }
}

function setFXSData() {
    var i = 1,
        option = '',
        // num_fxs = parseInt(UCMGUI.config.model_info.num_fxs ? UCMGUI.config.model_info.num_fxs : "1"),
        // num_fxo = parseInt(UCMGUI.config.model_info.num_fxo ? UCMGUI.config.model_info.num_fxo : "1");
        num_fxs = 2,
        num_fxo = 0

    for (i; i <= num_fxs; i++) {
        option += '<option value="' + (i + num_fxo) + '">FXS ' + i + '</option>';
    }

    $("#edit_dahdi").append(option);
}

function changeShow() {

    if ($("#edit_strategy_ipacl")[0].selectedIndex == 1) {
        $("#local_networks").show();
    } else {
        $("#local_networks").hide();
    }

    if ($("#edit_strategy_ipacl")[0].selectedIndex == 2) {
        $("#allow_a_ip").show();
    } else {
        $("#allow_a_ip").hide();
    }
}

function initTimeConditionTable() {
    OrderTable.table_id = 'table_timecondition';
    OrderTable.max_failover = maxTimeCondition;
    OrderTable.refresh_timecondition();
    OrderTable.bind_event();
}

function check_network(val, ele) {
    var regSubnet = /^((1\d\d|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){3}0$/;

    if (val && !regSubnet.test(val)) {
        return false;
    }

    return true;
}

function checkExtensionName(val, ele) {
    var existed = true;

    if (val == extension) {
        existed = true;
    } else {
        if (ifExisted(val, existNumberList)) {
            existed = false;
        } else {
            existed = true;
        }
    }

    return existed;
}

function checkIfInPort(val, ele) {
    var existed = true;

    if (ifExisted(val, portExtensionList)) {
        existed = false;
    } else {
        existed = true;
    }

    return existed;
}

function fxs_in_use(val, ele) {
    var port = $('#edit_dahdi')[0].value;
    existFXSList = UCMGUI.isExist.getList("getDahdiList");

    if (port == currentPort) {
        return true;
    } else {
        if (ifExisted(port, existFXSList)) {
            return false;
        } else {
            return true;
        }
    }
}

function check_video_codec() {
    var list = ["ulaw", "alaw", "gsm", "g726", "g726aal2", "ilbc", "g722", "adpcm", "g729", "g723"],
        res = false,
        valuelist = [],
        el = $('#edit_allow')[0],
        length = el.options.length;

    // get an array of all option values in a select box
    for (var x = 0; x < length; x++) {
        if (el.options[x].value.trim()) {
            valuelist.push(el.options[x].value);
        }
    }

    valuelist.each(function(value) {
        if (res == true) {
            return res;
        }
        list.each(function(codec) {
            if (value == codec)
                res = true;
            return res;
        });
    });

    return res;
}

function check_max_users() {
    if (maxExtension < existExtentionList.length + Number($("#batch_number").val())) {
        return false;
    } else {
        return true;
    }

    return true;
}

function check_range() {
    if (extensionRange[2] == 'no') {
        var startFrom = Number($("#batch_extension").val()),
            largeOrEqualThanStartNumber = 0,
            maxExtensionNumber = extensionRange[1],
            length = existExtentionList.length,
            i = 0;

        for (i; i < length; i++) {
            if (existExtentionList[i] >= startFrom) {
                largeOrEqualThanStartNumber++;
            }
        }

        if ((Number($("#batch_number").val()) + largeOrEqualThanStartNumber) > (maxExtensionNumber - startFrom + 1)) {
            return false;
        }
    }

    return true;
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

function createDay(cellvalue) {
    if (cellvalue == '*') {
        return '<div locale="LANG257">' + $P.lang("LANG257") + '</div>';
    } else {
        return cellvalue.replace(/&/g, ',');
    }
}

function createMonth(cellvalue) {
    if (cellvalue == '*') {
        return '<div locale="LANG257">' + $P.lang("LANG257") + '</div>';
    } else {
        return ReturnMonth(cellvalue);
    }
}

function createWeek(cellvalue) {
    if (cellvalue == '*') {
        return '<div locale="LANG257">' + $P.lang("LANG257") + '</div>';
    } else {
        return ReturnWeek(cellvalue);
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

function initUserDetailValidator() {
    if ($("#user_detail_form").tooltip) {
        $("#user_detail_form").tooltip();
    }

    $P("#user_detail_form", document).validate({
        rules: {
            "edit_extension": {
                required: true,
                digits: true,
                // range: [extensionRange[0], extensionRange[1]],
                minlength: 2,
                customCallback: [$P.lang("LANG2126"), checkExtensionName],
                customCallback: [$P.lang("LANG2172").format($P.lang("LANG1244") + ", " + $P.lang("LANG1242")), checkIfInPort]
            },
            "edit_cidnumber": {
                // digits: true,
                realAlphanumeric: true,
                minlength: 2
            },
            "edit_secret": {
                required: true,
                keyboradNoSpacesemicolon: true,
                minlength: 4
            },
            "edit_multiple_secret": {
                required: true,
                keyboradNoSpacesemicolon: true,
                minlength: 4
            },
            "edit_vmsecret": {
                required: true,
                digits: true,
                minlength: 4
            },
            "edit_multiple_vmsecret": {
                required: true,
                digits: true,
                minlength: 4
            },
            "edit_dahdi": {
                customCallback: [$P.lang("LANG2130"), fxs_in_use]
            },
            "edit_cfb": {
                numeric_pound_star: true
            },
            "edit_cfn": {
                numeric_pound_star: true
            },
            "edit_cfu": {
                numeric_pound_star: true
            },
            "edit_external_number": {
                required: true,
                phoneNumberOrExtension: true
            },
            "edit_hotline_number": {
                required: true,
                phoneNumberOrExtension: true
            },
            "edit_ring_timeout": {
                digits: true,
                range: [3, 600]
            },
            "first_name": {
                minlength: 1,
                cidName: true,
                maxlength: 32
            },
            "last_name": {
                minlength: 1,
                cidName: true,
                maxlength: 32
            },
            "email": {
                email: true
            },
            "user_password": {
                required: true,
                minlength: 4,
                maxlength: 32,
                keyboradNoSpacesemicolon: true
            },
            "edit_rxgain": {
                required: true,
                gain: [-30, 6]
            },
            "edit_txgain": {
                required: true,
                gain: [-30, 6]
            },
            "edit_rxflash_min": {
                required: true,
                digits: true,
                range: [30, 1000]
            },
            "edit_rxflash": {
                required: true,
                digits: true,
                range: [40, 2000],
                bigger: [$P.lang("LANG1119"), $P.lang("LANG1117"), $("#edit_rxflash_min")]
            },
            "edit_allow": {
                selectItemMin: 1,
                customCallback: [$P.lang("LANG2138"), check_video_codec]
            },
            "edit_qualifyfreq": {
                required: true,
                digits: true,
                range: [1, 3600]
            },
            "edit_authid": {
                authid: true
            },
            "edit_maxcallnumbers": {
                digits: true,
                range: [1, 512]
            },
            "local_network1": {
                required: true,
                customCallback: [$P.lang("LANG2131"), check_network]
            },
            // "local_network2": {
            //     customCallback: [$P.lang("LANG2131"), check_network]
            // },
            // "local_network3": {
            //     customCallback: [$P.lang("LANG2131"), check_network]
            // },            
            "specific_ip": {
                required: true,
                ipDns: ["ip"]
            },
            "edit_user_outrt_passwd": {
                digits: true,
                minlength: 4
            },
            "batch_vmsecret": {
                required: true,
                digits: true,
                minlength: 4
            },
            "batch_number": {
                required: true,
                digits: true,
                range: [1, 100],
                customCallback: [$P.lang("LANG811").format(maxExtension, existExtentionList.length), check_max_users],
                customCallback1: [$P.lang("LANG3508").format($P.lang('LANG1155'), $P.lang('LANG1157')), check_range]
            },
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
            // "new_itrl_date_week": {
            //     required: true
            //     // customCallback: ['Choose one detailed date', check_date]
            // },
            "new_itrl_month_jan": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG244').toLowerCase()), check_month_required]
            },
            "new_itrl_week_sun": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG243').toLowerCase()), check_week_required]
            },
            "edit_whitelist1": {
                phoneNumberOrExtension: true,
                customCallback: [$P.lang("LANG5211"), checkWhitelistOnly]
            }
        },
        newValidator: true,
        submitHandler: function() {
            $(".settings").not(".current_position").addClass("none_position");

            var target = this.submitButton;

            if (!checkTimeCondition()) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG3289")
                });
                return;
            }
            if (target.id == 'createUser') {
                var action = {
                        "extension": extExtension
                    },
                    type = extType.toLowerCase();

                if (type == "sip") {
                    action["action"] = "updateSIPAccount";
                } else if (type == "iax") {
                    action["action"] = "updateIAXAccount";
                } else if (type == "fxs") {
                    action["action"] = "updateFXSAccount";
                }

                setExtensionValue(action, "#add_extension_div");
                listTimeConditionOfficeTime();
            } else {
                return false;
            }
        }
    });

    // if (extensionRange[2] == 'no') {
    //     $P("input[name='edit_extension']", document).rules("add", {
    //         range: [extensionRange[0], extensionRange[1]]
    //     });
    // }
}

function setExtensionValue(action, doc) {
    var exceptTextNode = '#enable_cc, #edit_cc_max_agents, #edit_cc_max_monitors',
        exceptSelectNode = '#select_available_codec, #edit_faxmode, #cc_mode, #seamless_leftSelect, #seamless_rightSelect',
        type = extType.toLowerCase();

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG826")
    });

    var seamless_members = [];
    $.each($("#seamless_rightSelect").children(), function(index, item) {
        seamless_members.push($(item).val());
    });

    if (seamless_members.length != 0) {
        action["seamless_transfer_members"] = seamless_members.toString();
    } else {
        action["seamless_transfer_members"] = "";
    }

    $("input[id]:not(" + exceptTextNode + "), select[id]:not(" + exceptSelectNode + "), textarea[id]", doc).each(function() {
        if ($(this).is(":visible")) {
            var domVal = "",
                val = $(this).attr("id");

            if (val == 'edit_extension' || val == 'edit_fullname' ||
                val == 'first_name' || val == 'last_name' || val == 'user_password' ||
                val == 'email' || val == 'language' || val.match(/edit_whitelist/g) ||
                val == 'mode' || val.beginsWith('new_itrl')) {
                return;
            }

            if ($(this).is(":disabled") && !$(this).is("#edit_authid")) {
                return;
            }

            if (val.length != 0) {
                switch (this.type) {
                    case 'textarea':
                    case 'text':
                        domVal = $(this).val();
                        break;
                    case 'checkbox':
                        domVal = $(this).is(":checked") ? "yes" : "no";
                        break;
                    case 'radio':
                        break;
                    case 'select-one':
                        domVal = $(this).val();
                        break;
                    case 'select-multiple':
                        var options = new Array;

                        for (var i = 0; i < this.options.length; i++) {
                            options.push(this.options[i].value)
                        }

                        domVal = options.toString()
                        break;
                    default:
                        break;
                }
            }

            action[val.substr(5)] = domVal;
        }
    });

    var edit_whitelist_array = [];

    $('#strategy_table4').find('input').each(function() {
        if ($(this).val() !== '') {
            edit_whitelist_array.push($(this).val());
        }
    });

    action['dndwhitelist'] = edit_whitelist_array.join(',');

    var fax = $('#edit_faxmode').val();

    if (fax == "no") {
        action['faxdetect'] = "no";
        action['fax_gateway'] = "no";
    } else if (fax == "detect") {
        action['faxdetect'] = "yes";
        action['fax_gateway'] = "no";
    } else if (fax == "gateway") {
        action['faxdetect'] = "no";
        action['fax_gateway'] = "yes";
    }

    if (type == 'fxs') {
        action['hanguponpolarityswitch'] = action['answeronpolarityswitch'];

        if ($('#enable_cc').is(':checked')) {
            action['cc_agent_policy'] = "generic";
            action['cc_monitor_policy'] = "generic";
            action['cc_max_agents'] = "1";
            action['cc_max_monitors'] = "5";
            action['cc_offer_timer'] = "120";
            action['ccnr_available_timer'] = "3600";
            action['ccbs_available_timer'] = "3600";
        } else {
            action['cc_agent_policy'] = "never";
            action['cc_monitor_policy'] = "never";
        }
    } else {
        /* SIP/ IAX */
        // var maxRowOfLocalNet = 10;

        // for (var i = 1; i <= maxRowOfLocalNet; i++) {
        //     if (!action.hasOwnProperty("local_network" + i)) {
        //         action["local_network" + i] = '';
        //     }
        // }

        if (type == 'sip') {
            if ($('#enable_cc').is(':checked')) {
                if ($('#cc_mode').val() == 'trunk') {
                    action['cc_agent_policy'] = "native";
                    action['cc_monitor_policy'] = "native";
                    action['cc_max_agents'] = $('#edit_cc_max_agents').val();
                    action['cc_max_monitors'] = $('#edit_cc_max_monitors').val();
                    action['cc_offer_timer'] = "120";
                    action['ccnr_available_timer'] = "3600";
                    action['ccbs_available_timer'] = "3600";
                } else {
                    action['cc_agent_policy'] = "generic";
                    action['cc_monitor_policy'] = "generic";
                    action['cc_max_agents'] = "1";
                    action['cc_max_monitors'] = "5";
                    action['cc_offer_timer'] = "120";
                    action['ccnr_available_timer'] = "3600";
                    action['ccbs_available_timer'] = "3600";
                }
            } else {
                action['cc_agent_policy'] = "never";
                action['cc_monitor_policy'] = "never";
            }
        }
    }

    // add time condition data
    var tc = OrderTable.lists,
        tcLength = OrderTable.lists.length;

    for (i = 0; i < tcLength; i++) {
        delete tc[i]['condition_index'];
        delete tc[i]['time'];

        tc[i]['sequence'] = 0;
        // tc[i]['condition_index'] = i + 1;
        tc[i]['user_id'] = userID;
    }

    action['time_condition'] = JSON.stringify(tc);

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG826")
    });

    if (!$.isEmptyObject(privilegeInfo)) {
        action = getPrivilegeAction(action, privilegeInfo);
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var userAction = {
                    "action": "updateUser",
                    "user_id": userID,
                    "first_name": $('#first_name').val(),
                    "last_name": $('#last_name').val(),
                    //"email": $('#email').val(),
                    //"user_password": $('#user_password').val(),
                    "language": $('#language').val()
                };

                if (!$.isEmptyObject(userPrivilegeInfo)) {
                    userAction = getPrivilegeAction(userAction, userPrivilegeInfo);
                }

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: userAction,
                    async: false,
                    error: function(jqXHR, textStatus, errorThrown) {
                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: errorThrown
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            if (top.dialog.closeCurrentDialog) {
                                top.dialog.closeCurrentDialog();
                            }

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

function transData(res, cb) {
    var arr = [];

    ringgroupExt = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            extension = res[i].extension,
            fullname = res[i].fullname,
            disabled = res[i].out_of_service;

        obj["val"] = extension;

        if (disabled == 'yes') {
            obj["class"] = 'disabledExtOrTrunk';
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <';
            obj["disable"] = true; // disabled extension
        } else {
            obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
        }

        ringgroupExt.push(extension);

        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

function transExtensionData(res, cb) {
    var arr = [],
        accountList = UCMGUI.isExist.getList("getAccountList");
        accountLists = transData(accountList);

    for (var i = 0; i < accountList.length; i++) {
        var value = accountList[i]["extension"];

        accountListsObj[value] = accountList[i];
    }

    for (var i = 0; i < res.length; i++) {
        var obj = {},
            resIndex = accountListsObj[res[i]];

        if (resIndex) {
            var extension = resIndex.extension,
                fullname = resIndex.fullname,
                disabled = resIndex.out_of_service;
                obj["val"] = extension;

            if (disabled == 'yes') {
                obj["class"] = 'disabledExtOrTrunk';
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
                obj["locale"] = '' + extension + (fullname ? ' "' + fullname + '"' : '') + ' <';
                obj["disable"] = true; // disabled extension
            } else {
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
            }

            arr.push(obj);
        }


        if (cb && typeof cb == "function") {
            cb(arr);
        }
    }
    return arr;
}

// function navSlide() {
//     var aSettings = $(".settings"),
//         aLi = $("#nav_settings").find("li"),
//         oFrame = top.dialog.contentIframe,
//         oCommand = $(".command");

//     aLi.on('click', function() {
//         if ($(this).hasClass("current")) {
//             return;
//         }

//         if (!$P("#user_detail_form", document).valid()) {
//             $("input[titles],select[titles],textarea[titles]").focus();

//             return;
//         }

//         var index = $(this).index();

//         $(this).addClass("current").siblings().removeClass("current");

//         aSettings.eq(index).addClass("current_position").siblings().removeClass("current_position");

//         if (index == 3) {
//             if ($("#table-add-btn").is(":visible") || $("#table-edit-btn").is(":visible")) {
//                 oCommand.hide();
//             }
//         } else {
//             if (oCommand.is(":hidden")) {
//                 oCommand.show();
//             }
//         }
//     });
// }

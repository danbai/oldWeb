/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    sessionData = new ASTGUI.customObject,
    mWindow = window,
    enable = $('#enable'),
    DOM_dynamic_blacklist,
    DOM_enable,
    DOM_timeout,
    DOM_block_timeout,
    DOM_threshold,
    DOM_whitelist;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2303"));
});

window.onload = function() {
    load_DOMelements();

    loadDynamicBlacklist();

    loadDynamicDefense();

    initValidator();

    $('#enable').trigger("change");

    top.Custom.init(document);
};

var load_DOMelements = function() {
    $("#whitelist").resizable({
        handles: "se",
        minHeight: 80,
        minWidth: 100
    });

    enable.change(function() {
        if ($(this).is(":checked")) {
            $("#timeout").attr("disabled", false);
            $("#block_timeout").attr("disabled", false);
            $("#threshold").attr("disabled", false);
            $("#whitelist").attr("disabled", false);
            $("#dynamic_blacklist").attr("disabled", false);
        } else {
            $("#timeout").attr("disabled", true);
            $("#block_timeout").attr("disabled", true);
            $("#threshold").attr("disabled", true);
            $("#whitelist").attr("disabled", true);
            $("#dynamic_blacklist").attr("disabled", true);
        }
    });

    DOM_dynamic_blacklist = $("#dynamic_blacklist")[0];
    DOM_enable = $("#enable")[0];
    DOM_timeout = $("#timeout")[0];
    DOM_block_timeout = $("#block_timeout")[0];
    DOM_threshold = $("#threshold")[0];
    DOM_whitelist = $("#whitelist")[0];
};

var loadDynamicBlacklist = function() { // readcfg.FirewallConf
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'getBlacklist'
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
                $(DOM_dynamic_blacklist).empty();

                var addCell = ASTGUI.domActions.tr_addCell,
                    newRow = DOM_dynamic_blacklist.insertRow(-1);

                newRow.className = "frow";

                addCell(newRow, {
                    html: ""
                });

                addCell(newRow, {
                    html: $P.lang("LANG2293"),
                    locale: "LANG2293"
                });

                addCell(newRow, {
                    html: $P.lang("LANG2299"),
                    locale: "LANG2299"
                });

                var PreviousTRColor = 'odd', // 'odd' : 'even' ;
                    blacklist = data.response.blacklist[0],
                    list = blacklist['blacklist'].split(',') || [];

                for (var idx = 0; list[idx] && idx < list.length; idx++) {
                    var value = list[idx];

                    newRow = DOM_dynamic_blacklist.insertRow(-1);

                    newRow.className = PreviousTRColor;

                    addCell(newRow, {
                        html: ""
                    });

                    addCell(newRow, {
                        html: value
                    });

                    var btn = "<button type='button' class='options del' onclick=\"removeItem('" + value + "')\" title=" + $P.lang("LANG739") + "></button>";

                    addCell(newRow, {
                        html: btn
                    });
                }
            }
        }
    });
};

var loadDynamicDefense = function() {
    sessionData["pbxinfo"] = new ASTGUI.customObject;

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'getDynamicDefense'
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
                sessionData.pbxinfo['dynamic_defense'] = data.response.dynamic_defense;

                update_dynamic_defense();
            }
        }
    });
};

var initValidator = function() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "timeout": {
                digits: true,
                range: [1, 59],
                customCallback: [$P.lang('LANG2766'), check_detect_timeout]
            },
            "block_timeout": {
                digits: true,
                range: [1, 86399],
                customCallback: [$P.lang('LANG2766'), check_block_timeout]
            },
            "threshold": {
                digits: true,
                range: [5, 1000],
                customCallback: [$P.lang('LANG2766'), check_detect_threshold]
            },
            "whitelist": {
                customCallback: [$P.lang('LANG2767'), check_whitelist],
                customCallback1: [$P.lang('LANG2816'), differentWhiteList]
            }
        },
        newValidator: true,
        submitHandler: function(ev) {
            var target = this.submitButton;

            if ($(target).attr('id') !== 'save') {
                return;
            }

            saveChanges();
        }
    });
};

var update_dynamic_defense = function() {
    var general = sessionData.pbxinfo['dynamic_defense'],
        enable = general['enable'] || "",
        timeout = general['timeout'] || "",
        block_timeout = general['block_timeout'] || "",
        threshold = general['threshold'] || "",
        whitelist = general['white_addr'] || "";

    if (enable == "yes") {
        DOM_enable.checked = true;
        $('#enable').trigger('change');
    } else {
        DOM_enable.checked = false;
        $('#enable').trigger('change');
    }

    ASTGUI.updateFieldToValue(DOM_timeout, timeout);

    ASTGUI.updateFieldToValue(DOM_block_timeout, block_timeout);

    ASTGUI.updateFieldToValue(DOM_threshold, threshold);

    ASTGUI.updateFieldToValue(DOM_whitelist, whitelist.split('\\n').join('\n'));
};

var removeItem = function(item) {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG877")
    });

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'deleteBlackip',
            'blackip': item
        },
        // async: false,
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
                    content: $P.lang("LANG816"),
                    callback: function() {
                        loadDynamicBlacklist();
                    }
                });
            }
        }
    });
};

var saveChanges = function() {
    var enable = DOM_enable.checked ? 'yes' : 'no',
        timeout = DOM_timeout.value,
        block_timeout = DOM_block_timeout.value,
        threshold = DOM_threshold.value,
        whiteArray = DOM_whitelist.value.split('\n'),
        whitelist = [];

    for (var i = 0, length = whiteArray.length; i < length; i++) {
        var item = whiteArray[i];

        if (item) {
            if (UCMGUI.isIPv6(whiteArray[i])) {
                item = item.replace("[", "").replace("]", "");
            }
            whitelist.push(item);
        }
    }

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            'action': 'updateDynamicDefense',
            'enable': enable,
            'threshold': threshold,
            'timeout': timeout,
            'block_timeout': block_timeout,
            'white_addr': whitelist.join('\\n')
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
                // applyChanges();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG945"),
                    callback: function() {
                        window.location.reload();
                    }
                });
            }
        }
    });
}

var applyChanges = function() {
    $.ajax({
        type: 'GET',
        url: '../webcgi?action=reloadDynamicDefense&dynamic_defense=',
        success: function(response) {
            if (response.response.trim() == 'success') {
                 top.dialog.dialogMessage({
                     type: 'success',
                     content: $P.lang("LANG945")
                 });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: response.body
                });
             }
         }
     });
};


var check_detect_timeout = function() {
    var enable = $("#enable"),
        timeout = $("#timeout");

    if (enable.is(":checked")) {
        if (timeout.val() == "") {
            return false;
        }
    }

    return true;
};

var check_block_timeout = function() {
    var enable = $("#enable"),
        timeout = $("#block_timeout");

    if (enable.is(":checked")) {
        if (timeout.val() == "") {
            return false;
        }
    }

    return true;
};

var check_detect_threshold = function() {
    var enable = $("#enable"),
        threshold = $("#threshold");

    if (enable.is(":checked")) {
        if (threshold.val() == "") {
            return false;
        }
    }

    return true;
};

var check_whitelist = function() {
    var enable = $("#enable"),
        whitelist = $("#whitelist");

    if (enable.is(":checked")) {
        var values = whitelist.val(),
            list = values.split('\n');

        if (values === '') {
            return true;
        }

        for (var i = 0; i < list.length; i++) {
            var listVal = list[i];

            if (listVal.indexOf(" ") < 0) {
                listVal = listVal.trim();
            }
            var arr = listVal.split(" ");
            var arrIP = arr[0];
            var arrPort = arr[1];

            if (typeof arrIP != "undefined") {
                var reg =  /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
                var arrIPSplit = arrIP.split("-");
                var arrIPSplitOne = arrIPSplit[0];
                var arrIPSplitTwo = arrIPSplit[1];
        
                if (typeof arrIPSplitOne != "undefined" && (!reg.test(arrIPSplitOne) && !UCMGUI.isIPv6(arrIPSplitOne))) {
                    return false;
                }
                if (typeof arrIPSplitTwo != "undefined" && (!reg.test(arrIPSplitTwo) && !UCMGUI.isIPv6(arrIPSplitTwo))) {
                    return false;
                }
            }
            if (typeof arrPort != "undefined") {
                if (!/^\d*:\d*$/.test(arrPort)) {
                    return false;  
                }
                var arrPortSplit = arrPort.split(":");
                var arrPortSplitFirst = parseInt(arrPortSplit[0]);
                var arrPortSplitSecon = parseInt(arrPortSplit[1]);
                if (arrPortSplitFirst >= arrPortSplitSecon) {
                    return false;
                }
                if (1 <= arrPortSplitFirst && arrPortSplitFirst <= 65535 && 1 <= arrPortSplitSecon && arrPortSplitSecon<= 65535) {
                    continue;
                } else {
                    return false;
                }
                if (arrPortSplitFirst > arrPortSplitSecon ) {
                    return false;
                }
            }
        }
    }

    return true;
};

var differentWhiteList = function(value, element) {
    var str = value.split('\n'),
        different = true,
        whiteList = '';

    for (var j = 0; j < str.length; j++) {
        whiteList = str[j];
        if (whiteList) {
            whiteList = whiteList.split(" ")[0];
        }

        if (!whiteList) {
            continue;
        }

        for (var i = 0; i < str.length; i++) {
            if (i == j) {
                continue;
            }

            if (!str[i]) {
                continue;
            }

            if (str[i] && str[i].split(" ")[0] === whiteList) {
                different = false;
                break;
            }
        }

        if (!different) {
            break;
        }
    }

    return different;
};
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
    role = $P.cookie('role'),
    userName = $P.cookie("username"),
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    mode = gup.call(window, "mode"),
    oldIndex = gup.call(window, "index"),
    oldName = gup.call(window, "name"),
    oldExtension = gup.call(window, "extension"),
    existNames = mWindow.existNames,
    existExtensions = mWindow.existExtensions,
    extensionList = mWindow.extensionList,
    extensionObj = mWindow.extensionObj;

Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.sortBy = top.Array.prototype.sortBy;
Array.prototype.lastValue = top.Array.prototype.lastValue;
String.prototype.afterChar = top.String.prototype.afterChar;
String.prototype.beginsWith = top.String.prototype.beginsWith;
String.prototype.contains = top.String.prototype.contains;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;
String.prototype.withOut = top.String.prototype.withOut;

$(function() {
    $P.lang(doc, true);

    initForm();

    initValidator();

    if (mode === 'edit') {
        getWakeupService(oldIndex);
    }

    top.Custom.init(doc);
});

function checkTime(val, ele) {
    if (val === '' || val.match(/^\d{4}\-\d{2}\-\d{2}$/)) {
        return true;
    }

    return false;
}

function checkWeekRequired(element, value) {
    if ($('.chk_week:checked').length) {
        return true;
    }

    return false;
}

function getWakeupService(index) {
    var action = {
        "action": "getWakeupSchedule",
        "wakeup_index": index
    };

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

            if (bool) {
                var wakeup = data.response.wakeup_index,
                    enable = wakeup.wakeup_enable,
                    date = wakeup.custom_date,
                    time = wakeup.time;

                time = time.split(':');

                UCMGUI.domFunction.updateDocument(wakeup, doc);

                if (enable === 1) {
                    $('#wakeup_enable').attr({'checked': true});
                } else {
                    $('#wakeup_enable').attr({'checked': false});
                }

                if (date.indexOf('-') > -1) {
                    $("#custom_date").datepicker("setDate", date);
                } else {
                    $('#custom')[0].checked = true;

                    $(".custom").css({'display': 'block'});

                    $(".custom-date").hide();

                    date = date.split(',');

                    for (var i = 0, length = date.length; i < length; i++) {
                        $(':checkbox[value="' + date[i] + '"]').attr({'checked': true});
                    }

                    if (date.length === 7) {
                        $('#week_all').attr({'checked': true});
                    }
                }

                $('#time_hour').val(time[0]);
                $('#time_minute').val(time[1]);
            }
        }
    });
}

function initForm() {
    var allExtensions = extensionObj,
        availableExtensions = [],
        existed = [];

    existed = existExtensions.copy(existed);

    if (mode === 'edit') {
        existed.remove(oldExtension);
    }

    for (var i = 0, length = allExtensions.length; i < length; i++) {
        // if (!UCMGUI.inArray(allExtensions[i]['val'], existed)) {
            availableExtensions.push(allExtensions[i]);
        // }
    }

    if (role === 'privilege_3') {
        $('.link').hide();
    }

    selectbox.appendOpts({
        el: "extension",
        opts: availableExtensions
    }, doc);

    selectbox.appendOpts({
        el: "prompt",
        opts: mWindow.ivrNameArr
    }, doc);

    $("#custom_date").datetimepicker({
        showOn: "button",
        showTimepicker: false,
        buttonImage: "../images/calendar.png",
        buttonImageOnly: true,
        buttonText: '',
        dateFormat: 'yy-mm-dd'
    });

    $('#custom').click(function(ev) {
        if (!this.checked) {
            $(".custom").hide();
            $(".custom-date").show();
        } else {
            $(".custom").show();
            $(".custom-date").hide();
        }

        top.dialog.currentDialogType = "iframe";

        top.dialog.repositionDialog();

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    });

    var week_all = $('#week_all'),
        chk_week = $(".chk_week");

    week_all.bind("click", function(ev) {
        var week_chkbox_all = function(value) {
            for (var i = 0; i < chk_week.length; i++) {
                if (chk_week[i].type == 'checkbox') {
                    chk_week[i].checked = value;
                }

                if (value) {
                    $(chk_week[i]).prev().css("backgroundPosition", "0px -50px");
                } else {
                    $(chk_week[i]).prev().css("backgroundPosition", "0px 0px");
                }
            }
        };

        if (this.checked) {
            week_chkbox_all(true);
        } else {
            week_chkbox_all(false);
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

    $("#time_hour")[0].selectedIndex = -1;
    $("#time_minute")[0].selectedIndex = -1;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "wakeup_name": {
                required: true,
                minlength: 2,
                letterDigitUndHyphen: true,
                isExist: [$P.lang("LANG270").format($P.lang("LANG4858").toLowerCase()), nameIsExist]
            },
            "extension": {
                required: true
            },
            "prompt": {
                required: true
            },
            "custom_date": {
                required: true,
                customCallback: [$P.lang("LANG2767"), checkTime]
            },
            "week_sun": {
                customCallback: [$P.lang("LANG3531").format('1', $P.lang('LANG203').toLowerCase()), checkWeekRequired]
            },
            "time_hour": {
                required: true
            },
            "time_minute": {
                required: true
            }
        },
        submitHandler: function() {
            saveWakeupService();
        }
    });
}

function link_prompt() {
    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG843").format($P.lang("LANG238")),
        buttons: {
            ok: function() {
                top.frames["frameContainer"].module.jumpMenu('menuprompts_record.html');
            },
            cancel: function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            }
        }
    });
}

function nameIsExist(element) {
    var name = element.value,
        tmpNameList = [];

    tmpNameList = existNames.copy(tmpNameList);

    if (oldName) {
        tmpNameList.remove(oldName);
    }

    return !UCMGUI.inArray(name, tmpNameList);
}

function saveWakeupService() {
    var action = {};

    action = UCMGUI.formSerializeVal(doc);

    if (mode == "edit") {
        action["action"] = "updateWakeupSchedule";
        action["wakeup_index"] = oldIndex;
    } else if (mode == "add") {
        action["action"] = "addWakeupSchedule";
    }

    action["wakeup_enable"] = ($('#wakeup_enable').is(':checked') ? 1 : 0);
    action["time"] = $('#time_hour').val() + ':' + $('#time_minute').val();

    if (!$('#custom').is(':checked')) {
        action["custom_date"] = $('#custom_date').val();
    } else {
        var dayList = [];

        $('.chk_week:checked').each(function(index) {
            dayList.push(this.value);
        });

        action["custom_date"] = dayList.join();
    }

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

            if (bool) {
                top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        if (role === 'privilege_3') {
                            mWindow.createTableInUserPortal();
                        } else {
                            mWindow.$("#wakeup-list", mWindow.document).trigger('reloadGrid');

                            // refresh lists
                            mWindow.getLists();
                        }
                    }
                });
            }
        }
    });
}
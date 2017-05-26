/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    role = top.$.cookie('role'),
    events = [
        "LANG2591",
        "LANG2592",
        "LANG2593",
        "LANG2594",
        "LANG2595",
        "LANG2681",
        "LANG2758",
        "LANG2759",
        "LANG2760",
        "LANG2761",
        "LANG2762",
        "LANG3183",
        "LANG3184",
        "LANG3277",
        "LANG3278",
        "LANG3504",
        "LANG4779",
        "LANG4780",
        "ha_fault"
    ],
    eventName = ['<div locale="LANG2591">' + $P.lang("LANG2591") + '</div>',
        '<div locale="LANG2592">' + $P.lang("LANG2592") + '</div>',
        '<div locale="LANG2593">' + $P.lang("LANG2593") + '</div>',
        '<div locale="LANG2594">' + $P.lang("LANG2594") + '</div>',
        '<div locale="LANG2595">' + $P.lang("LANG2595") + '</div>',
        '<div locale="LANG2681">' + $P.lang("LANG2681") + '</div>',
        '<div locale="LANG2758">' + $P.lang("LANG2758") + '</div>',
        '<div locale="LANG2759">' + $P.lang("LANG2759") + '</div>',
        '<div locale="LANG2760">' + $P.lang("LANG2760") + '</div>',
        '<div locale="LANG2761">' + $P.lang("LANG2761") + '</div>',
        '<div locale="LANG2762">' + $P.lang("LANG2762") + '</div>',
        '<div locale="LANG3183">' + $P.lang("LANG3183") + '</div>',
        '<div locale="LANG3184">' + $P.lang("LANG3184") + '</div>',
        '<div locale="LANG3277">' + $P.lang("LANG3277") + '</div>',
        '<div locale="LANG3278">' + $P.lang("LANG3278") + '</div>',
        '<div locale="LANG3504">' + $P.lang("LANG3504") + '</div>',
        '<div locale="LANG4779">' + $P.lang("LANG4779") + '</div>',
        '<div locale="LANG4780">' + $P.lang("LANG4780") + '</div>',
        '<div "ha fault">'    + "ha故障"    + '</div>'
    ],
    noButtonIds = [2, 4, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19],
    has_contact;
    // SECURITYSWITCH;

String.prototype.format = top.String.prototype.format;

function getSelectedEvents() {
    return UCMGUI.domFunction.get_checked('selected_extensions', document);
}

function getEmailSettings() {
    var action = 'action=warningCheckHasContact';

    $.ajax({
        type: "post",
        url: "/cgi",
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
                has_contact = data.response.body.has_contact;
            }
        }
    });
}

// function getLogSwitchDynamic() {
//     var action = 'action=listLogSwitchDynamic';

//     $.ajax({
//         type: "post",
//         url: "/cgi",
//         async: false,
//         data: action,
//         error: function(jqXHR, textStatus, errorThrown) {
//             // top.dialog.dialogMessage({
//             //     type: 'error',
//             //     content: errorThrown
//             // });
//         },
//         success: function(data) {
//             var bool = UCMGUI.errorHandler(data);

//             if (bool) {
//                 var log_switch_dynamic = data.response.log_switch_dynamic;
//                 for (var i = 0; i < log_switch_dynamic.length; i++) {
//                     if (log_switch_dynamic[i].dlevel == "SECURITY") {
//                         SECURITYSWITCH = log_switch_dynamic[i].switch;
//                     }
//                 }
//             }
//         }
//     });
// }

function getEventList() {
    var action = 'action=warningGetGeneralSettings';

    $.ajax({
        type: "post",
        url: "/cgi",
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
                var warning_general = data.response.body.warning_general;

                generateData(warning_general);

                $('.top_buttons').show();
            } else {
                $('.top_buttons').hide();

                renderTable([], []);
            }
        }
    });
}

function generateData(warning_general) {
    var eventList = warning_general,
        length = eventList.length,
        eventId = [],
        i = 0;

    for (i; i < length; i++) {
        transformData(eventList[i]);

        eventId[i] = i;
    }

    renderTable(eventList, eventId);
}

function transformData(data) {
    for (var name in data) {
        if (data.hasOwnProperty(name)) {
            switch (name) {
                case "id":
                    data["name"] = eventName[data[name] - 1];

                    if (!UCMGUI.inArray(data[name], noButtonIds)) {
                        data["paramSetting"] = '<button id="' + data["id"] + '" title="编辑" localetitle="LANG738" class="options editParameters"></button>';
                    } else {
                        data["paramSetting"] = '<button id="' + data["id"] + '" title="编辑" localetitle="LANG738" class="options disabled editParameters" disabled="disabled"></button>';
                    }

                    break;
                case "enable":
                    data[name] = $P.EMSwitchBox(data["id"], "enable", data[name]);
                    break;
                case "enable_email":
                    data[name] = $P.EMSwitchBox(data["id"], "enable_email", data[name]);
                    break;
                default:
                    break;
            }
        }
    }
}

function renderTable(eventList, eventId) {
    $('#warning_log_container').empty();

    var table = window.tableWidget;

    eventList.splice(1, 0, eventList[eventList.length - 1]);
    eventList.splice(12, 0, eventList[eventList.length - 2]);
    eventList.splice(eventList.length - 2, 2);

    table = new tableWidget({
        position: 'warning_log_container',
        theadContent: ["checkbox", "LANG2558", "LANG2559", "LANG2560", "LANG2561", ''],
        tbodyContent: {
            label: "checkbox",
            id: eventId,
            content: {
                list: eventList,
                listId: ['name', 'enable', 'enable_email', 'paramSetting']
            }
        },
        jumpPage: {
            // page: config.userPage,
            page: 1,
            callback: function() {
                $P.lang(document, true);
            }
        },
        showNum: '30',
        noData: "LANG129 LANG2553"
    });

    $P.lang(document, true);
}

function saveChanges(selected, item, value) {
    var stop_cmd = "action=reloadWarning&warningStop=",
        start_cmd = "action=reloadWarning&warningStart=",
        ids = [];

    for (var i = 0; i < selected.length; i++) {
        var id = $('.selected_extensions[value=' + selected[i] + ']').parents('tr').find('.editParameters').attr('id');

        ids[i] = parseInt(id);
    }

    var cb = function(selected, ids, item, value) {
        var saveAction = {
            "action": "warningUpdateGeneralSettings",
            "enable": "",
            "enable_email": "",
            "id": ids.toString()
        };

        saveAction[item] = value;

        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG904")
        });

        $.ajax({
            type: "post",
            url: "/cgi",
            data: saveAction,
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
                    $.ajax({
                        type: "GET",
                        url: "/cgi",
                        async: false,
                        data: start_cmd,
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG844"),
                                    callback: function() {
                                        if ((selected.indexOf('16') > -1) && (item === 'enable') && (value === 1) && (role === 'privilege_0')) {
                                            top.dialog.dialogConfirm({
                                                confirmStr: $P.lang("LANG4806"),
                                                buttons: {
                                                    ok: function() {
                                                        top.frames['frameContainer'].module.jumpMenu("trunks_voip.html");
                                                    },
                                                    cancel: function() {}
                                                }
                                            });
                                        }
                                    }
                                });

                                for (var i = 0; i < selected.length; i++) {
                                    var checkbox = $('.selected_extensions[value=' + selected[i] + ']'),
                                        switchButton = checkbox.parents('tr').find('.switch[item="' + item + '"]'),
                                        thumb = switchButton.find('.thumb');

                                    $("#warning_log_container #CHECKALL")[0].checked = false;
                                    checkbox[0].checked = false;
                                    top.Custom.init(document);

                                    if (value === 0) {
                                        switchButton.attr({
                                            "style": "",
                                            "value": "1",
                                            "localetitle": "LANG2598"
                                        }).removeClass("on").addClass("off");
                                        thumb.animate({
                                            left: -12
                                        }, 300);
                                        $P.lang(document, true);
                                    } else if (value === 1) {
                                        switchButton.attr({
                                            "style": "",
                                            "value": "0",
                                            "localetitle": "LANG2599"
                                        }).removeClass("off").addClass("on");
                                        thumb.animate({
                                            left: 12
                                        }, 300);
                                        $P.lang(document, true);
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });
    };

    $.ajax({
        type: "GET",
        url: "/cgi",
        async: false,
        data: stop_cmd,
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                cb(selected, ids, item, value);
            }
        }
    });
}

function checkCircle(val, ele) {
    var nCircle = parseInt(val, 10),
        sMethod = $('#Ptype_send_warningemail').val();

    if (nCircle === 0) {
        return true;
    }

    if (sMethod === 'minute' && nCircle >= 1 && nCircle <= 59) {
        return true;
    } else if (sMethod === 'hour' && nCircle >= 1 && nCircle <= 23) {
        return true;
    } else if (sMethod === 'day' && nCircle >=1 && nCircle <= 30) {
        return true;
    }

    return false;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "email_circle": {
                required: true,
                digits: true,
                customCallback: [$P.lang("LANG4495"), checkCircle]
            }
        },
        newValidator: true,
        submitHandler: function() {
            emailCircleSave();
        }
    });
}

function emailCircleSave() {
    var data = {};
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG905")
    });

    var Pmode_send_warningemailVal = $("#Pmode_send_warningemail").val();

    data["action"] = "setWarningEmailValue";
    data["Pmode_send_warningemail"] = Pmode_send_warningemailVal;

    if (Pmode_send_warningemailVal == 1) {
           data["Pmin_send_warningemail"] = $('#email_circle').val(),
           data["Ptype_send_warningemail"] =$('#Ptype_send_warningemail').val()    
    }
    $.ajax({
        url: '../cgi',
        data: data,
        type: "POST",
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                $.ajax({
                    type: 'GET',
                    url: '../cgi?action=reloadCrontabs&crontabjobs=',
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG844")
                            });
                        }
                    }
                });
            }
        }
    });
}

function getWarningEmailValue() {
    $.ajax({
        type: 'GET',
        url: '../cgi?action=getWarningEmailValue',
        dataType: 'json',
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                $('#Pmode_send_warningemail').val(data.response.Pmode_send_warningemail);
                $('#email_circle').val(data.response.Pmin_send_warningemail);
                $('#Ptype_send_warningemail').val(data.response.Ptype_send_warningemail);
                top.Custom.init(document, $('#Ptype_send_warningemail')[0]);
                top.Custom.init(document, $('#Pmode_send_warningemail')[0]);
                $("#Pmode_send_warningemail").trigger("change");
            }
        }
    });
}

$(function() {
    $P.lang(document, true);

    top.document.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG2582"));

    getEventList();
    // getLogSwitchDynamic();
    getEmailSettings();

    /* lets add some event handlers/delegators */
    $('div.top_buttons')
        .delegate('#btnTurnOnWarning', 'click', function() {
            var selected = getSelectedEvents();

            if (!selected.length) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG2562")
                });

                return false;
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2563"),
                buttons: {
                    ok: function() {
                        saveChanges(selected, "enable", 1);
                    }
                }
            });
        })
        .delegate('#btnTurnOffWarning', 'click', function() {
            var selected = getSelectedEvents();

            if (!selected.length) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG2562")
                });

                return false;
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2564"),
                buttons: {
                    ok: function() {
                        saveChanges(selected, "enable", 0);
                    }
                }
            });
        })
        .delegate('#btnTurnOnMailNotification', 'click', function() {
            var selected = getSelectedEvents(),
                ifAllWarningOn = true,
                ids = [],
                i = 0;

            if (!selected.length) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG2562")
                });

                return false;
            }

            for (i; i < selected.length; i++) {
                var tr = $('.selected_extensions[value=' + selected[i] + ']').parents('tr'),
                    enableWarning = tr.find('div[item="enable"]').attr('value'),
                    id = tr.find('.editParameters').attr('id');

                ids[i] = parseInt(id);

                if (enableWarning === '1') {
                    ifAllWarningOn = false;
                }
            }

            if (ifAllWarningOn) {
                if (has_contact == 0) {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG2631"),
                        buttons: {
                            ok: function() {
                                top.frames['frameContainer'].module.jumpMenu("warning_contact.html", "?id=" + ids.join());
                            },
                            cancel: function() {
                                // saveChanges(selected, "enable_email", 1);
                            }
                        }
                    });
                } else {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG2565"),
                        buttons: {
                            ok: function() {
                                saveChanges(selected, "enable_email", 1);
                            }
                        }
                    });
                }
            } else {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG5004")
                });
            }
        })
        .delegate('#btnTurnOffMailNotification', 'click', function() {
            var selected = getSelectedEvents();

            if (!selected.length) {
                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG2562")
                });

                return false;
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG2566"),
                buttons: {
                    ok: function() {
                        saveChanges(selected, "enable_email", 0);
                    }
                }
            });
        });

    $('#warning_log_container')
        .delegate('.editParameters', 'click', function(ev) {
            var item = parseInt($(this).attr('id'));

            top.dialog.dialogInnerhtml({
                dialogTitle: $P.lang("LANG2567").format($P.lang(events[item - 1])),
                frameSrc: "html/warning_events_list_modal.html?item={0}".format(item)
            });

            ev.stopPropagation();
            return false;
        })
        .delegate('.switch', 'click', function(ev) {
            var $this = $(this),
                id = parseInt($this.attr('id')),
                item = $this.attr('item'),
                value = parseInt($this.attr('value')),
                stop_cmd = "action=reloadWarning&warningStop=",
                start_cmd = "action=reloadWarning&warningStart=";

            var cb = function() {
                var switchButton = function(div, id, item, value) {
                    var cb = function(div, id, item, value) {
                        var saveAction = {
                            "action": "warningUpdateGeneralSettings",
                            "enable": "",
                            "enable_email": "",
                            "id": id
                        };

                        saveAction[item] = value;

                        top.dialog.dialogMessage({
                            type: 'loading',
                            content: $P.lang("LANG904")
                        });

                        $.ajax({
                            type: "post",
                            url: "/cgi",
                            data: saveAction,
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
                                    $.ajax({
                                        type: "GET",
                                        url: "/cgi",
                                        async: false,
                                        data: start_cmd,
                                        success: function(data) {
                                            var bool = UCMGUI.errorHandler(data);

                                            if (bool) {
                                                top.dialog.dialogMessage({
                                                    type: 'success',
                                                    content: $P.lang("LANG844"),
                                                    callback: function() {
                                                        if ((id === 16) && (item === 'enable') && (value === 1) && (role === 'privilege_0')) {
                                                            top.dialog.dialogConfirm({
                                                                confirmStr: $P.lang("LANG4806"),
                                                                buttons: {
                                                                    ok: function() {
                                                                        top.frames['frameContainer'].module.jumpMenu("trunks_voip.html");
                                                                    },
                                                                    cancel: function() {
                                                                        //switchButton($this, id, item, value);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }
                                                });

                                                if (value == 1) {
                                                    div.css({
                                                        'background-image': 'url(../images/switch_on_bg.png)'
                                                    }, 300).children('div.thumb').animate({
                                                        left: 12
                                                    }, 300);

                                                    div.attr({
                                                        "value": "0",
                                                        "localetitle": "LANG2599"
                                                    });

                                                    // $P.lang(document, true);
                                                    getEventList();
                                                } else if (value == 0) {
                                                    div.css({
                                                        'background-image': 'url(../images/switch_off_bg.png)'
                                                    }).children('div.thumb').animate({
                                                        left: -12
                                                    }, 300);

                                                    div.attr({
                                                        "value": "1",
                                                        "localetitle": "LANG2598"
                                                    });

                                                    // $P.lang(document, true);
                                                    getEventList();
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    };

                    $.ajax({
                        type: "GET",
                        url: "/cgi",
                        async: false,
                        data: stop_cmd,
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data);

                            if (bool) {
                                cb(div, id, item, value);
                            }
                        }
                    });
                };

                if (value == 1 && item === "enable_email") {
                    var checkIfAlertOn = ($this.parent().prev().children().attr('value') === '1' ? false : true);

                    if (!checkIfAlertOn) {
                        top.dialog.dialogMessage({
                            type: 'warning',
                            content: $P.lang("LANG4487")
                        });
                    } else if (has_contact == 0) {
                        top.dialog.dialogConfirm({
                            confirmStr: $P.lang("LANG2631"),
                            buttons: {
                                ok: function() {
                                    top.frames['frameContainer'].module.jumpMenu("warning_contact.html", "?id=" + id);
                                },
                                cancel: function() {
                                    // switchButton($this, id, item, value);
                                }
                            }
                        });
                    } else {
                        switchButton($this, id, item, value);
                    }
                } else {
                    switchButton($this, id, item, value);
                } 
            }
            // var locale = $this.parent().prev().children().attr("locale");
            // if (SECURITYSWITCH == 0 && value == 1 && (locale == "LANG2758" || locale == "LANG2759" || locale == "LANG3183" || locale == "LANG3184" || locale == "LANG3277" || locale == "LANG3278" || locale == "LANG3504")) {
            //     cb();
            // } else {
                cb();
            // }

            return false;
        });

    $("#Pmode_send_warningemail").bind("change", function(){
        if (this.value == 0) {
            $("#email_circle, #Ptype_send_warningemail").attr("disabled", true);
        } else {
            $("#email_circle, #Ptype_send_warningemail").attr("disabled", false);
        }

        top.Custom.init(document, $("#Ptype_send_warningemail")[0]);
    });

    getWarningEmailValue();

    initValidator();
});
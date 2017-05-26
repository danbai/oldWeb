/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var applyChanges = function() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $.lang("LANG806")
    });

    $.ajax({
        url: UCMGUI.config.paths.baseServerURl + "?action=applyChanges&settings=",
        type: "GET",
        success: function(data) {
            var status = data.status,
                settings = data.response.hasOwnProperty('settings') ? data.response.settings : '',
                message = '',
                applyChanges = $("#applyChanges_Button", top.frames["frameContainer"].document),
                lineButton = $("#line_Button", top.frames["frameContainer"].document);

            top.dialog.clearDialog();

            if (status === 0 && settings === '0') {
                applyChanges.css("visibility", "hidden").removeClass('apply_animate');
                lineButton.css("visibility", "hidden");

                top.$.removeCookie("needApplyChange");

                if (data.response.need_reboot && data.response.need_reboot === '1') {
                    top.dialog.dialogConfirm({
                        confirmStr: top.$.lang("LANG833"),
                        buttons: {
                            ok: UCMGUI.loginFunction.confirmReboot,
                            cancel: function() {
                                top.dialog.clearDialog();
                            }
                        }
                    });
                } else {
                    dialog.dialogMessage({
                        type: 'info',
                        content: $.lang("LANG951")
                    });
                }
            } else if (status === -9 && settings.contains('-1')) {
                dialog.dialogMessage({
                    type: 'error',
                    content: $.lang("LANG2805")
                });
            } else if (status === -9 && settings.contains('486')) {
                dialog.dialogMessage({
                    type: 'info',
                    content: $.lang("LANG2803")
                });
            } else if (status === -9 && settings.contains('485')) {
                dialog.dialogMessage({
                    type: 'info',
                    content: $.lang("LANG2804")
                });
            } else if (status === -69) {
                dialog.dialogMessage({
                    type: 'error',
                    content: $.lang("LANG4760")
                });
            } else {
                UCMGUI.errorHandler(data);
            }
        }
    });
};

$(document).keydown(function(e) {
    var doPrevent;

    if (e.keyCode == 8) {
        var d = e.srcElement || e.target;

        if (d.tagName.toUpperCase() == 'INPUT' || d.tagName.toUpperCase() == 'TEXTAREA') {
            doPrevent = d.readOnly || d.disabled;
        } else
            doPrevent = true;
    } else {
        doPrevent = false;
    }

    if (doPrevent) {
        e.preventDefault();
    }
});

$(function() {
    window.dialog = new dialog();

    UCMGUI.checkBrowserIfIE6();

    UCMGUI.loginFunction.checkifLoggedIn();

    jQuery.extend(jQuery.validator.defaults, {
        showErrors: function(map, list) {

            // there's probably a way to simplify this
            var focussed;

            if (document.activeElement.contentWindow != undefined) {
                focussed = document.activeElement.contentWindow.document.body;
            }

            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("close", {
                    currentTarget: focussed
                }, true)
            }

            this.currentElements.removeAttr("titles").removeClass("ui-state-highlight");

            $.each(list, function(index, error) {
                $(error.element).attr("titles", error.message).addClass("ui-state-highlight");
            });

            if (focussed && $(focussed).is("input, textarea")) {
                $(this.currentForm).tooltip("open", {
                    target: focussed
                });
            }
        },
        ignoreTitle: true,
        submitHandler: function() {}
    });

    $("#spaceused1").progressbar({
        value: 1
    });

    $('.button_retry').on('click', function () {
        location.reload();
    });
});
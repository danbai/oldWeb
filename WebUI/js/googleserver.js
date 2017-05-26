/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    topDoc = top.document,
    doc = document;
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(document, true);

    topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG3513"));

    getSettings();

    getCalenderSettings();

    $('#get_author').on('click', function() {
        this.disabled = true;
        getUrl();
    });

    bindEvent();

    initValidator();
});

function getCalenderSettings() {
    $.ajax({
        url: "../cgi?action=getGoogleAccountCal",
        type: "GET",
        dataType: "json",
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var res = data.response.googlecalendar,
                    calendar = res.calendar_name.slice(0, -1),
                    nReflesh = res.refresh_time;

                    $('#google_host').val(calendar);
                    $('#reflesh_time_input').val(nReflesh);
            }
        }
    });
}

function getSettings() {
    $.ajax({
        url: "../cgi?action=getGoogleAuthorizationInfo",
        type: "GET",
        dataType: "json",
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var res = data.response.googlecalendar;

                $('#google_id').val(res.client_id);

                $('#google_pwd').val(res.client_secret);
            }
        }
    });
}

function bindEvent() {
    $('#reset_btn').on('click', function(ev) {
        $.ajax({
            url: "../cgi?action=resetOauthJsonFile",
            type: "GET",
            success: function(data) {
                var bool = UCMGUI.errorHandler(data);

                if (bool) {
                    getSettings();
                }
            }
        });

        ev.stopPropagation();
        return false;
    });
}

function getUrl() {
    $.ajax({
        url: "../cgi?action=updateOauthJsonFile&client_name=calendar",
        type: "GET",
        dataType: "json",
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var res = data.response.result,
                    openRes = window.open(res, '_blank');

                if (!openRes) {
                    $('#desc_href').attr('href', res);
                    $('#author_prompt').show();
                } else {
                    $('#author_prompt').hide();
                }

                $('#get_author')[0].disabled = false;
            }
        }
    });
}

function ClientSaveChanges() {
    $.ajax({
        url: '../cgi?',
        type: "POST",
        data: {
            action: 'updateOauthJsonFile',
            client_id: $('#google_id').val(),
            client_secret: $('#google_pwd').val()
        },
        error: function(jqXHR, textStatus, errorThrown) {
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
                    content: $P.lang("LANG844")
                });
            }
        }
    });
}

function CalenderSaveChanges() {
    $.ajax({
        url: '../cgi?',
        type: "POST",
        data: {
            action: 'updateOauthJsonFile',
            //GoogleAccount: $('#google_host').val(),
            refresh_time: $('#reflesh_time_input').val()
        },
        error: function(jqXHR, textStatus, errorThrown) {
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
                    content: $P.lang("LANG844")
                });
            }

            //getCalenderSettings(false);
        }
    });
}

function fnAuthorSaveChanges() {
    $.ajax({
        url: "../cgi?",
        type: "POST",
        data: {
            action: "updateCertificate",
            client_name: "calendar",
            request_code: $("#google_code").val()
        },
        error: function(jqXHR, textStatus, errorThrown) {
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
                    content: $P.lang("LANG873")
                });

                $('#google_code').val('');

                getCalenderSettings();
            }
        }
    });
}

function initValidator() {
    if ($("#form_server").tooltip) {
        $("#form_server").tooltip();
    }

    $P("#form_server", doc).validate({
        rules: {
            "google_id": {
                required: true
            },
            "google_pwd": {
                required: true
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });

            ClientSaveChanges();
        }
    });

    if ($("#form_calender").tooltip) {
        $("#form_calender").tooltip();
    }

    $P("#form_calender", doc).validate({
        rules: {
            /*"google_host": {
                required: true,
                email: true
            },*/
            "reflesh_time_input": {
                required: true,
                digits: true
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });

            CalenderSaveChanges();
        }
    });

    if ($("#form_author").tooltip) {
        $("#form_author").tooltip();
    }

    $P("#form_author", doc).validate({
        rules: {
            "google_code": {
                required: true
            }
        },
        submitHandler: function() {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });

            fnAuthorSaveChanges();
        }
    });
}
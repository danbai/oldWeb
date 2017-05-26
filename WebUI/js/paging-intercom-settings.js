/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);
    getPaginggroupSettings();
    initValidator();
});

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "paging_header": {
                required: true,
                alphanumeric: true
            }
        },
        submitHandler: function() {
            updatePaginggroupSettings();
        }
    });
}

function updatePaginggroupSettings() {
    var action = {
        action: "updatePaginggroupSettings",
        paging_header: $("#paging_header").val(),
        custom_prompt: $("#custom_prompt").val()
    }
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
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
                    content: $P.lang("LANG815")
                });
            }
        }
    });
}

function getPaginggroupSettings() {
    selectbox.appendOpts({
        el: "custom_prompt",
        opts: mWindow.ivrNameArr
    }, doc);

    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            action: "getPaginggroupSettings"
        },
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
                var paginggroupSettings = data.response.paginggroup_settings;
                if (paginggroupSettings && paginggroupSettings.paging_header) {
                    $("#paging_header").val(paginggroupSettings.paging_header);
                    $("#custom_prompt").val(paginggroupSettings.custom_prompt);
                }
                top.Custom.init(doc);
            }
        }
    });
}

function link() {
    top.dialog.clearDialog();
    top.frames['frameContainer'].module.jumpMenu("features.html");
};

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
};
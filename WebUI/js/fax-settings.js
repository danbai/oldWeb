/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */
var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    baseServerURl = UCMGUI.config.paths.baseServerURl;

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    getFaxsettings();

    initValidator();

    $('.link').on('click', function() {
        var sUrl = "email_template.html";

        top.dialog.dialogConfirm({
            confirmStr: $P.lang("LANG843").format($P.lang('LANG4572')),
            buttons: {
                ok: function() {
                    top.frames['frameContainer'].module.jumpMenu(sUrl);
                },
                cancel: function() {
                    top.dialog.container.show();
                    top.dialog.shadeDiv.show();
                }
            }
        });
    });
});

function getFaxsettings() {
    var action = {};

    action = UCMGUI.formSerialize(doc);
    action["action"] = "getFaxsettings";

    $.ajax({
        url: baseServerURl,
        type: "POST",
        dataType: "json",
        async: true,
        data: action,
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
                data = eval(data);

                UCMGUI.domFunction.updateDocument(data.response.fax_settings, document);

                top.Custom.init(doc);
            }
        }
    });
}

function initValidator() {
    var minRateLabel = $P.lang("LANG1266");
    var maxRateLabel = $P.lang("LANG1264");
    var bigArr = [minRateLabel, maxRateLabel, $("#minrate"), {
        equal: true
    }];
    var smallArr = [minRateLabel, maxRateLabel, $("#maxrate")];

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "local_station_id": {
                specialauthid: true
            },
            "default_email": {
                serveremail: true
            },
            "minrate": {
                smaller: smallArr
            },
            "emailsubject": {
                required: true
            },
            "emailbody": {
                required: true
            }
        },
        submitHandler: function() {
            saveChanges();
        }
    });
}

function loadDefaults() {
    UCMGUI.domFunction.updateElementValue({
        el: "emailbody",
        val: "Hello ${RECEIVEEXTEN}, you have received a new fax ${FILENAME} (${FAXPAGES} pages) at ${FAXDATE} from ${CALLERIDNUM} ${CALLERIDNAME}."
    }, doc);

    UCMGUI.domFunction.updateElementValue({
        el: "emailsubject",
        val: "New Fax from ${CALLERIDNUM} ${CALLERIDNAME}"
    }, doc);
}

function saveChanges() {
    var action = {};

    action = UCMGUI.formSerializeVal(document);
    action["action"] = "updateFaxsettings";

    $.ajax({
        type: "post",
        url: baseServerURl,
        data: action,
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
                    content: $P.lang("LANG815")
                });
            }
        }
    });
}
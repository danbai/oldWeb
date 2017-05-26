/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    selectbox = UCMGUI.domFunction.selectbox,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    mode = gup.call(window, "mode"),
    bri_chkbxClass = "BRI_ChkBoxes",
    oldTrunkName = "",
    trunkId = "",
    trunkNameList = mWindow.trunkNameList,
    BRIPortList = mWindow.BRIPortList,
    portWithTrunkId = mWindow.portWithTrunkId;

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;
Array.prototype.indexOf = top.Array.prototype.indexOf;

$(function() {
    loadPorts();

    if (mode == 'edit') {
        $('#content').show();
        $('#bind-content').remove();

        trunkId = gup.call(window, "trunkId");
        getAnalogTrunk(trunkId);
    } else if (mode == 'add') {
        $('#content').show();
        $('#bind-content').remove();
    } else if (mode == 'bind') {
        $('#editForm').css('width', '600px');
        $('#content').remove();
        $('#bind-content').show();
    }

    initValidator();

    $P.lang(doc, true);

    top.Custom.init(doc);
});

function getAnalogTrunk(trunkId) {
    var action = {
        "action": "getBRITrunk",
        "trunk": trunkId
    };

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
            var bool = UCMGUI.errorHandler(data);
            if (bool) {
                var britrunk = data.response.trunk;

                oldTrunkName = britrunk.trunk_name;

                UCMGUI.domFunction.updateDocument(britrunk, document);

                $.each($('.' + bri_chkbxClass + ':disabled'), function(index, item) {
                    if ($(item).val() == (britrunk.span - 1)) {
                        $(item)
                            .attr({
                                disabled: false,
                                checked: true
                            })
                            .removeClass('existed');

                        $('.' + bri_chkbxClass).not(this).each(function() {
                            if (!$(this).hasClass('existed')) {
                                $(this).attr('disabled', true);
                                top.Custom.init(document, this);
                            }
                        });
                    }
                });

                top.Custom.init(doc);
            }
        }
    });
}

function getSelectedPorts() {
    return $("." + bri_chkbxClass + ":checked");
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", document).validate({
        rules: {
            "trunk_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                isExist: [$P.lang('LANG2135').format(1, $P.lang('LANG2837')), trunkNameIsExist]
            }
        },
        submitHandler: function() {
            if (mode == 'bind') {
                var action = {
                        '1': {
                            'action': 'updateBRITrunk',
                            'trunk': portWithTrunkId['1'],
                            'brigroup': 20,
                            'auto_recording': ($("#auto_recording").is(':checked') ? 'yes' : 'no'),
                            'keepcid': ($("#keepcid").is(':checked') ? 'yes' : 'no')
                        },
                        '2': {
                            'action': 'updateBRITrunk',
                            'trunk': portWithTrunkId['2'],
                            'brigroup': 20,
                            'auto_recording': ($("#auto_recording").is(':checked') ? 'yes' : 'no'),
                            'keepcid': ($("#keepcid").is(':checked') ? 'yes' : 'no')
                        }
                    };

                $.ajax({
                    type: "post",
                    url: "../cgi",
                    data: action['1'],
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
                            $.ajax({
                                type: "post",
                                url: "../cgi",
                                data: action['2'],
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
                                        top.dialog.clearDialog();
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG815"),
                                            callback: function() {
                                                mWindow.$("#trunks-bri-list", mWindow.document).trigger('reloadGrid');
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                var action = {},
                    port = 0;

                action = UCMGUI.formSerializeVal(document);

                port = parseInt(getSelectedPorts().val());

                if (mode == 'edit') {
                    action["action"] = "updateBRITrunk";
                    action["trunk"] = trunkId;
                } else if (mode == 'add') {
                    action["action"] = "addBRITrunk";
                }

                action["span"] = port + 1;

                if (port == 1) {
                    action["dahdichan"] = '3-4';
                    action["channel"] = '3-4';

                    if (mode == 'add') {
                        action["brigroup"] = 20;
                    }
                } else if (port == 2) {
                    action["dahdichan"] = '6-7';
                    action["channel"] = '6-7';

                    if (mode == 'add') {
                        action["brigroup"] = 21;
                    }
                }

                action["technology"] = 'BRI';
                action["pulsedial"] = 'no';
                action["faxdetect"] = 'no';

                updateOrAddTrunkInfo(action);
            }
        }
    });
}

function loadPorts() {
    var ports = Number(UCMGUI.config.model_info.num_bri ? UCMGUI.config.model_info.num_bri : 1);

    for (var i = 1; i <= ports; i++) {
        var lbl = document.createElement('div');

        lbl.className = 'special';

        var label = document.createElement('label'),
            lbltext = document.createTextNode(i),
            ncbx = document.createElement('input');

        ncbx.type = 'checkbox';
        ncbx.setAttribute("noSerialize", true);
        ncbx.value = i;

        if (UCMGUI.inArray(i, BRIPortList)) {
            ncbx.disabled = true;
            ncbx.className = bri_chkbxClass + ' existed';
        } else {
            ncbx.className = bri_chkbxClass;
        }

        label.appendChild(lbltext);
        lbl.appendChild(ncbx);
        lbl.appendChild(label);

        document.getElementById("bri_ports_container").appendChild(lbl);
    };

    $('.' + bri_chkbxClass).bind("click", function() {
        $P('#trunk_name', document).valid();

        if ($(this).is(':checked')) {
            $('.' + bri_chkbxClass).not(this).each(function() {
                if (!$(this).hasClass('existed')) {
                    $(this).attr('disabled', true);
                    top.Custom.init(document, this);
                }
            });
        } else {
            $('.' + bri_chkbxClass).not(this).each(function() {
                if (!$(this).hasClass('existed')) {
                    $(this).attr('disabled', false);
                    top.Custom.init(document, this);
                }
            });
        }
    });
}

function trunkNameIsExist(value, element) {
    if ($('.' + bri_chkbxClass + ':checked').length) {
        var trunkName = $("#trunk_name").val(),
            tmpTrunkNameList = [];

        tmpTrunkNameList = trunkNameList.copy(tmpTrunkNameList);

        if (oldTrunkName) {
            tmpTrunkNameList.remove(oldTrunkName);
        }

        return !UCMGUI.inArray(trunkName, tmpTrunkNameList);
    }

    return false;
}

function updateOrAddTrunkInfo(action) {
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
                top.dialog.clearDialog();
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        mWindow.$("#trunks-bri-list", mWindow.document).trigger('reloadGrid');
                    }
                });
            }
        }
    });
}
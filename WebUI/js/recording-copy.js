/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    config = UCMGUI.config,
    addZero = UCMGUI.addZero,
    mode = gup.call(window, "mode"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'];

String.prototype.format = top.String.prototype.format;

$(function() {
    $P.lang(doc, true);

    bindEvent();

    initValidator();

    top.Custom.init(doc);
});

function bindEvent() {
    if ($('#all_recordings').is(':checked')) {
        $("#monitor")[0].checked = true;
        $("#meetme")[0].checked = true;
        $("#queue")[0].checked = true;
        //$("#voicemail")[0].checked = true;
    }

    $('#all_recordings').bind("click", function(ev) {
        if ($(this).is(':checked')) {
            $("#monitor")[0].checked = true;
            $("#meetme")[0].checked = true;
            $("#queue")[0].checked = true;
            //$("#voicemail")[0].checked = true;
        } else {
            $("#monitor")[0].checked = false;
            $("#meetme")[0].checked = false;
            $("#queue")[0].checked = false;
            //$("#voicemail")[0].checked = false;
        }
        top.Custom.init(doc);
    });

    $(".chk_recordings").bind("click", function(ev) {
        if ($(".chk_recordings").filter(":checked").length != $(".chk_recordings").length) {
            $('#all_recordings')[0].checked = false;
        } else {
            $('#all_recordings')[0].checked = true;
        }
        top.Custom.init(doc);
    });
}

function choose_apply() {
    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang("LANG905")
    });

    var copy = [];
    var checkedList = $(":checked");

    for (var i = 0; i < checkedList.length; i++) {
        var checkedListIndex = checkedList[i].id;

        if (checkedListIndex) {
            var checkedListIndexId = checkedList[i].id;
            if (checkedListIndexId == "all_recordings") {
                continue;
            }   
            copy.push(checkedListIndexId);
        }
    }
    copy = copy.join("-");

    $.ajax({
        type: "post",
        url: "../cgi",
        async: false,
        data: {
            "action": "removeFile",
            "type": "voice_recording",
            "data": "none"
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
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: true,
                    url: "../cgi",
                    data: {
                        "action": 'cpRecordings',
                        "cp_dest": mode,
                        "cp_type": copy
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        top.dialog.clearDialog();

                        // top.dialog.dialogMessage({
                        //     type: 'error',
                        //     content: $P.lang("LANG913")
                        // });
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data);

                        if (bool) {
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG3759")
                            });
                        }
                    }
                });
            }
        }
    });
}

function checkRequired(val, ele) {
    if ($(".chk_recordings:checked").length) {
        return true;
    }

    return false;
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "recordings": {
                customCallback: [$P.lang("LANG2168").format("1"), checkRequired]
            }
        },
        submitHandler: function() {
            var target = this.submitButton;

            choose_apply();
        }
    });
}
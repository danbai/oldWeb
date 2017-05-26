/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    selectbox = UCMGUI.domFunction.selectbox,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    gup = UCMGUI.gup,
    caller = gup.call(window, "caller"),
    callee = gup.call(window, "callee"),
    channel1 = gup.call(window, "channel1"),
    channel2 = gup.call(window, "channel2");

$(function() {
    $P.lang(doc, true);

    var callList = [{"val":channel1,"text":caller},{"val":channel2,"text":callee}],
        spyMode = [{"val":"Listen"},{"val":"Whisper"},{"val":"Barge"}];

    if (channel2 == ""){
        callList = [{"val":channel1,"text":caller}];
    }

    selectbox.appendOpts({
        el: "edit_extension",
        opts: callList
    }, doc);

    selectbox.appendOpts({
        el: "edit_mode",
        opts: spyMode
    }, doc);

    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "invite_name": {
                required: true,
                minlength: 2,
                digits: true
            }
        },
        submitHandler: function() {
            create_add_user_work();
        }
    });

    top.Custom.init(doc);
});

function create_add_user_work() {
    var adduserid = $('#create_user_id').val(),
        need_confirm = "1",
        mode = "";

    top.dialog.dialogMessage({
        type: 'loading',
        content: $P.lang('LANG4750')
    });

    if (!$('#need_confirm')[0].checked) {
        need_confirm = "0";
    }

    if ($("#edit_mode").val() == "Listen") {
        mode = "";
    }

    if ($("#edit_mode").val() == "Whisper") {
        mode = "w";
    }

    if ($("#edit_mode").val() == "Barge") {
        mode = "B";
    }

    $.ajax({
        type: "GET",
        cache: false,
        url: "../cgi?action=callbarge&channel=" + $("#edit_extension").val() + "&exten=" + $("#edit_extension").find("option:selected").text() + "&mode=" + mode +  "&barge-exten=" + adduserid + "@" + need_confirm,
        success: function(data) {
            if (data && data.status == 0) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG4751"),
                    callback: function() {
                        mWindow.location.reload();
                    }
                });
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG2198"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            }
        }
    });
}

function transChannelData(data) {
    var status = null;

    for (var i = 0; i < data.length; i++) {
        var channelIndex = data[i];

        if (channelIndex["alloc_time"]) {
            var state = channelIndex.state.toLocaleLowerCase(),
                channel = channelIndex.channel.toLocaleLowerCase();

            if (channel.indexOf($('#create_user_id').val() + "@from-internal") > 0) {
                status = state;
            }
        }
    }

    return status;
}
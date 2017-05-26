/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2015 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    udo = document.getElementById('save'),
    $select_headers = $('#select_headers'),
    origin_headers_array = [],
    headers_array = [],
    requestResponse = true,
    errorText = '';

Array.prototype.contains = top.Array.prototype.contains;
Array.prototype.sortExtension = top.Array.prototype.sortExtension;
Array.prototype.indexOf = top.Array.prototype.indexOf;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.format = top.String.prototype.format;
String.prototype.trim = top.String.prototype.trim;

$(function() {
    $P.lang(doc, true);

    initForm();

    $('.btn-save').click(function(event) {
        if (!$P("#form", document).valid()) {
            return;
        } else {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG905")
            });

            save_changes();
        }

        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    });
});

function initForm() {
    init_headers_select();

    bind_event();

    $select_headers.trigger('lengthchange');

    top.Custom.init(doc);

    initValidator();
}

function bind_event() {
    $select_headers.on('lengthchange', function(ev) {
        $('#headers_total').html(headers_array.length);
    });

    $('#del_btn').click(function(ev) {
        $(':selected', $select_headers).each(function(idx, item) {
            $item = $(item);

            headers_array.splice(headers_array.indexOf($item.val()), 1);

            $item.remove();
        });

        $select_headers.trigger('lengthchange');
    });
};

// check the new header is already exists in headers or not
function check_header_existance(value, element) {
    if (!value) {
        return true;
    }

    if (headers_array.contains(value)) {
        return false;
    }

    return true;
}

function init_headers_select() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "listWebRTCRequestHeader"
        },
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                headers_array = [];

                var webrtc_request_header_obj = data.response.webrtc_request_header;

                $.each(webrtc_request_header_obj, function(index, obj) {
                    headers_array.push(obj.webrtc_header);
                });

                $.each(headers_array, function(index, value) {
                    var $option = $('<option></option>');

                    $option.val(value).text(value).attr('title', value);

                    $select_headers.append($option);
                });

                origin_headers_array = headers_array.slice();
            }
        }
    });
}

function initValidator() {
    $("#form").tooltip();

    $P("#form", doc).validate({
        debug: true,
        rules: {
            "new_header": {
                letterDigitUndHyphen: true,
                minlength: 2,
                customCallback: [$P.lang('LANG4499'), check_header_existance]
            }
        },
        submitHandler: function() {
            var target = this.submitButton;

            if (target.id !== 'save') {
                var $new_header = $('#new_header'),
                    header = $new_header.val();

                if (header == null || header.trim() === "") {
                    $new_header.val('');
                    return;
                }

                // append new number to select 
                var $option = $('<option></option>');

                $option
                    .val(header)
                    .attr('title', header)
                    .text(header);

                $select_headers.append($option);

                headers_array.push(header);

                $select_headers.val([]); // clear selection

                $select_headers.prop('selectedIndex', $select_headers.prop('length') - 1);

                $select_headers.trigger('lengthchange');

                // clear input and get focus
                $new_header.val('');

                $new_header.trigger('focus');
            }
        }
    });
}

function setRequest(data, callback) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: data,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            requestResponse = false;
            errorText = errorThrown;
        },
        success: function(data) {}
    });
}

function save_error(errorThrown) {
    top.dialog.clearDialog();

    top.dialog.dialogMessage({
        type: 'error',
        content: errorThrown,
        callback: function() {
            top.dialog.clearDialog();
        }
    });
}

function save_success() {
    top.dialog.clearDialog();

    top.dialog.dialogMessage({
        type: 'success',
        content: $P.lang("LANG844"),
        callback: function() {
            top.dialog.clearDialog();
        }
    });
}

function save_changes() {
    var headers_add = $(headers_array).not(origin_headers_array),
        headers_del = $(origin_headers_array).not(headers_array),
        addLength = headers_add.length,
        delLength = headers_del.length;

    for (var i = 0; i < delLength; i++) {
        setRequest({
            "action": "deleteWebRTCRequestHeader",
            "webrtc_header": headers_del[i]
        });
    }

    for (var j = 0; j < addLength; j++) {
        setRequest({
            "action": "addWebRTCRequestHeader",
            "webrtc_header": headers_add[j]
        });
    }

    if (requestResponse) {
        save_success();
    } else {
        save_error(errorText);
    }
}
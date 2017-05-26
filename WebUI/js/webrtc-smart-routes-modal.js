/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    doc = document,
    UCMGUI = top.UCMGUI,
    gup = UCMGUI.gup,
    ifExisted = UCMGUI.inArray,
    selectbox = UCMGUI.domFunction.selectbox,
    askExtensionRange = UCMGUI.isExist.askExtensionRange,
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    mode = gup.call(window, "mode"),
    routeType = gup.call(window, "type"),
    webrtcInboundIndex,
    oldRouteName;

String.prototype.format = top.String.prototype.format;
Array.prototype.each = top.Array.prototype.each;
Array.prototype.indexOf = top.Array.prototype.indexOf;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

$(function() {
    $P.lang(doc, true);

    loadRequestHeaders();

    initForm();

    if (mode == 'add') {
        top.Custom.init(doc);
    } else if (mode == 'edit') {
        prepareEditItemForm()
    }

    initValidator();
});

function addRow(btn, tableID) {
    var table = doc.getElementById(tableID),
        rowIndex = btn.parentElement.parentElement.rowIndex,
        rowCount = table.rows.length,
        existHeadersList = [],
        row_ID;

    // if (rowCount >= 10) {
    //     top.dialog.clearDialog();
    //     top.dialog.dialogMessage({
    //         type: 'error',
    //         content: $P.lang("LANG808").format(10, $P.lang('LANG1845'))
    //     });
    //     return;
    // }

    var row = table.insertRow(rowCount),
        colCount = table.rows[0].cells.length;

    $('#HeadersTable input[type="text"]').each(function() {
        existHeadersList.push(parseInt($(this).attr('id').substr(19)));
    });

    for (var i = 0; i < 10000; i++) {
        if (!ifExisted(i, existHeadersList)) {
            break;
        }
    }

    row_ID = i;

    for (var i = 0; i < colCount; i++) {

        var newcell = row.insertCell(i);

        newcell.innerHTML = table.rows[0].cells[i].innerHTML;

        if (i === 0) {
            newcell.style.position = 'relative';

            var selectBox = $(newcell).find('select');
            selectBox.attr('id', 'webrtc_header' + row_ID);
            selectBox.attr('name', 'webrtc_header' + row_ID);
            selectBox.attr('class', 'headersSelect');

            $(newcell).find('.divSelect').remove();
        } else {
            switch (newcell.childNodes[0].type) {
                case "text":
                    newcell.childNodes[0].value = "";
                    newcell.childNodes[0].id = "webrtc_header_value" + row_ID;
                    newcell.childNodes[0].name = "webrtc_header_value" + row_ID;
                    $P(newcell.childNodes[0]).rules("add", {
                        required: true
                    });
                    break;
                case "button":
                    newcell.childNodes[0].className = "btn_del";
                    newcell.childNodes[0].id = "btn" + row_ID;
                    newcell.childNodes[0].onclick = Function("deleteRow(this, '" + tableID + "');");
                    break;
            }
        }
    }

    top.Custom.init(doc);

    top.dialog.repositionDialog();
}

function deleteRow(btn, tableID) {
    var table = doc.getElementById(tableID),
        rowCount = table.rows.length,
        rowIndex = btn.parentElement.parentElement.rowIndex;

    if (rowCount > rowIndex) {
        table.deleteRow(rowIndex);
    }

    top.dialog.repositionDialog();
}

function getWebRTCInboundRouteInfo(index) {
    var action = {
            "action": "getWebRTCInboundRoute",
            "webrtc_inbound_index": index
        };

    if (routeType) {
        action = {
                "action": "getWebRTCMessagesRoute",
                "webrtc_message_inbound_index": index
            };
    }

    $.ajax({
        type: "post",
        url: "../cgi",
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
                var inboundRoutes = data.response[routeType ? 'webrtc_message_inbound_routes' : 'webrtc_inbound_routes'],
                    operation = data.response[routeType ? 'webrtc_message_header_operation' : 'webrtc_header_operation'],
                    headers = data.response[routeType ? 'webrtc_message_header_value' : 'webrtc_header_value'],
                    headersLength = headers.length;

                oldRouteName = inboundRoutes[routeType ? 'webrtc_message_route_name' : 'webrtc_route_name'];

                $("#route_name").val(oldRouteName);

                if (inboundRoutes.webrtc_default_destination_type) {
                    $("#default_destination_type").val(inboundRoutes.webrtc_default_destination_type).trigger('change');
                    $("#default_destination_value").val(inboundRoutes['webrtc_default_' + inboundRoutes.webrtc_default_destination_type]);
                    $("#default_destination")[0].checked = (inboundRoutes.webrtc_default_destination === "yes" ? true : false);
                    $("#default_destination")[0].updateStatus();
                } else {
                    $("#default_destination_type").val('');
                    $("#default_destination_value").val('');
                }

                if (inboundRoutes.webrtc_destination_type) {
                    $("#destination_type").val(inboundRoutes.webrtc_destination_type).trigger('change');
                    
                    if (inboundRoutes.webrtc_destination_type === 'special_number') {
                        $("#special_number").val(inboundRoutes['webrtc_special_number']);
                    } else {
                        $("#destination_value").val(inboundRoutes['webrtc_' + inboundRoutes.webrtc_destination_type]);
                    }
                } else {
                    $("#destination_type").val(routeType ? 'account' : '');
                    $("#destination_value").val(routeType ? inboundRoutes['webrtc_message_account'] : '');
                }

                if (operation.length) {
                    $("#header_operation").val(operation[0][routeType ? 'webrtc_message_condition_operate' : 'webrtc_condition_operate']);
                } else {
                    $("#header_operation").val('');
                }

                if (headersLength) {
                    for (i = 1; i < headersLength; i++) {
                        addRow(doc.getElementById('btn0'), "HeadersTable");
                    }

                    $('#HeadersTable select').each(function(index) {
                        var header = headers[index][routeType ? 'webrtc_message_header' : 'webrtc_header'],
                            value = headers[index][routeType ? 'webrtc_message_header_value' : 'webrtc_header_value'];

                        $(this)
                            .val(header)
                            .closest('tr').find('[position="right"]').val(value);
                    });
                } else {
                    $("#webrtc_header0").val('');
                }

                if (webrtcInboundIndex == 0) {
                    $("#route_name")[0].disabled = true;
                    $("#configure").hide();
                }

                top.Custom.init(doc);

                top.dialog.repositionDialog();
            }
        }
    });
}

function initForm() {
    var destinationTypeArr = [{
            text: $P.lang("LANG85"),
            val: "account"
        }, {
            text: $P.lang("LANG19"),
            val: "ivr"
        }, {
            text: $P.lang("LANG89"),
            val: "vmgroup"
        }, {
            text: $P.lang("LANG98"),
            val: "conference"
        }, {
            text: $P.lang("LANG600"),
            val: "ringgroup"
        }, {
            text: $P.lang("LANG91"),
            val: "queue"
        }, {
            text: $P.lang("LANG23"),
            val: "paginggroup"
        }, {
            text: $P.lang("LANG4544"),
            val: "special_number"
        }];

    selectbox.appendOpts({
        el: "destination_type",
        opts: destinationTypeArr
    }, doc);

    selectbox.appendOpts({
        el: "destination_value",
        opts: transDestinationVal(mWindow.destinationTypeValue["account"], "account")
    }, doc);


    // Remove Special Number for Default Destination Type.
    destinationTypeArr.pop();

    selectbox.appendOpts({
        el: "default_destination_type",
        opts: destinationTypeArr
    }, doc);

    selectbox.appendOpts({
        el: "default_destination_value",
        opts: transDestinationVal(mWindow.destinationTypeValue["account"], "account")
    }, doc);


    UCMGUI.domFunction.enableCheckBox({
        enableCheckBox: "default_destination",
        enableList: ["default_destination_type", "default_destination_value"]
    }, doc);

    $("#default_destination")[0].checked = false;

    $("#default_destination")[0].updateStatus();


    $('#destination_type').bind("change", function(ev) {
        var value = $('option:selected', this).val(),
            destinationValueSelect = $(this).parent().next(),
            defaultDestination = $("#default_destination");

        if (value === "special_number") {
            destinationValueSelect.hide();
            $("#special_number").show();
        } else {
            $("#special_number").hide();
            $("#destination_value").empty();
            destinationValueSelect.show();

            selectbox.appendOpts({
                el: "destination_value",
                opts: transDestinationVal(mWindow.destinationTypeValue[value], value)
            }, doc);
        }

        if (value === 'ivr' || value === 'vmgroup' ||
            value === 'conference' || value === 'paginggroup') {
            if (defaultDestination.is(':checked')) {
                $("#default_destination_type, #default_destination_value, #default_special_number").attr({'disabled': 'disabled'});
            }

            defaultDestination.attr({'disabled': 'disabled'});
        } else {
            if (defaultDestination.is(':checked')) {
                $("#default_destination_type, #default_destination_value, #default_special_number").removeAttr('disabled');
            }

            defaultDestination.removeAttr('disabled');
        }

        top.Custom.init(doc, $('#destination_value')[0]);
        top.Custom.init(doc, $('#defaultDestination')[0]);

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    $('#default_destination_type').bind("change", function(ev) {
        var value = $('option:selected', this).val();

        $("#default_destination_value").empty();

        selectbox.appendOpts({
            el: "default_destination_value",
            opts: transDestinationVal(mWindow.destinationTypeValue[value], value)
        }, doc);

        top.Custom.init(doc, $('#default_destination_value')[0]);

        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
        return false;
    });

    if (routeType) {
        $('#defaultDestination').hide();

        $('#destination_type option:gt(0)').remove();

        $('#destination_value').empty();

        selectbox.appendOpts({
            el: "destination_value",
            opts: transDestinationVal(UCMGUI.isExist.getList("getSIPAccountList"), "account")
        }, doc);
    }
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "route_name": {
                required: true,
                letterDigitUndHyphen: true,
                minlength: 2,
                isExist: [$P.lang("LANG2137"), routeNameIsExist]
            },
            "destination_type": {
                required: true
            },
            "destination_value": {
                required: true
            },
            "special_number": {
                required: true,
                phoneNumberOrExtension: true
            },
            "default_destination_type": {
                required: true
            },
            "default_destination_value": {
                required: true
            },
            "webrtc_header_value0": {
                required: true
            }
        },
        submitHandler: function() {
            var action = {},
                destinations = {
                    "account": '',
                    "ivr": '',
                    "vmgroup": '',
                    "conference": '',
                    "ringgroup": '',
                    "queue": '',
                    "paginggroup": '',
                    "special_number": ''
                },
                destinationTypeVal = $("#destination_type option:selected").val(),
                destinationVal = $("#destination_value option:selected").val();

            if (mode == 'edit') {
                action["action"] = routeType ? "updateWebRTCMessagesRoute" : "updateWebRTCInboundRoute";
                action[routeType ? "webrtc_message_inbound_index" : "webrtc_inbound_index"] = webrtcInboundIndex;
            } else {
                action["action"] = routeType ? "addWebRTCMessagesRoute" : "addWebRTCInboundRoute";
            }

            action[routeType ? "webrtc_message_route_name" : "webrtc_route_name"] = $('#route_name').val();
            
            if (routeType) {
                action["webrtc_message_account"] = destinationVal;
            } else {
                action["webrtc_destination_type"] = destinationTypeVal;

                if (destinationTypeVal === 'special_number') {
                    destinations['special_number'] = $("#special_number").val();
                } else {
                    destinations[destinationTypeVal] = destinationVal;
                }

                for (prop in destinations) {
                    action['webrtc_' + prop] = destinations[prop];
                }
            }

            if ((webrtcInboundIndex != 0 && mode == 'edit') || (mode == 'add')) {
                if (routeType) {
                    action["webrtc_message_header_operation"] = JSON.stringify([{
                            'webrtc_message_condition_operate': $('#header_operation').val()
                        }]);
                } else {
                    var defaultDestinations = {
                            "account": '',
                            "ivr": '',
                            "vmgroup": '',
                            "conference": '',
                            "ringgroup": '',
                            "queue": '',
                            "paginggroup": ''
                        },
                        defaultDestinationTypeVal = $("#default_destination_type option:selected").val(),
                        defaultDestinationVal = $("#default_destination_value option:selected").val();

                    action["webrtc_default_destination"] = ($('#default_destination').is(':checked') ? 'yes' : 'no');
                    action["webrtc_default_destination_type"] = defaultDestinationTypeVal;
                    action["webrtc_header_operation"] = JSON.stringify([{
                            'webrtc_condition_operate': $('#header_operation').val()
                        }]);

                    defaultDestinations[defaultDestinationTypeVal] = defaultDestinationVal;

                    for (prop in defaultDestinations) {
                        action['webrtc_default_' + prop] = defaultDestinations[prop];
                    }
                }

                var headersTable = $('#HeadersTable select'),
                    headersLength = headersTable.length,
                    headers = [];

                headersTable.each(function(index) {
                    var obj = {},
                        header = $(this).val(),
                        value = $(this).closest('tr').find('[position="right"]').val();

                    if (routeType) {
                        obj.webrtc_message_header = header;
                        obj.webrtc_message_header_value = value;
                    } else {
                        obj.webrtc_header = header;
                        obj.webrtc_header_value = value;
                    }

                    headers.push(obj);
                });

                action[routeType ? "webrtc_message_header_value" : "webrtc_header_value"] = JSON.stringify(headers);
            }

            updateWebRTCInboundRouteInfo(action);
        }
    });
}

function loadRequestHeaders() {
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
                var webrtc_request_header_obj = data.response.webrtc_request_header;

                $.each(webrtc_request_header_obj, function(index, obj) {
                    var $option = $('<option></option>');

                    $option.val(obj.webrtc_header).text(obj.webrtc_header).attr('title', obj.webrtc_header);

                    $('#webrtc_header0').append($option);
                });
            }
        }
    });
}

function prepareEditItemForm() {
    webrtcInboundIndex = gup.call(window, "index");

    getWebRTCInboundRouteInfo(webrtcInboundIndex);
}

function routeNameIsExist() {
    var routeName = $("#route_name").val(),
        routeNameList = (routeType ? mWindow.messageRouteNameList : mWindow.routeNameList),
        tmpRouteNameList = [];

    tmpRouteNameList = routeNameList.copy(tmpRouteNameList);

    if (oldRouteName) {
        tmpRouteNameList.remove(oldRouteName);
    }

    return !UCMGUI.inArray(routeName, tmpRouteNameList);
}

function updateWebRTCInboundRouteInfo(action) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: action,
        error: function(jqXHR, textStatus, errorThrown) {
            // top.dialog.dialogMessage({
            //     type: 'error',
            //     content: errorThrown
            // });
        },
        success: function(data) {
            var bool = UCMGUI.errorHandler(data, function() {
                top.dialog.container.show();
                top.dialog.shadeDiv.show();
            });

            if (bool) {
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG815"),
                    callback: function() {
                        var tableID = (routeType ? "#messageRouterList" : "#smartRouterList");

                        mWindow.$(tableID, mWindow.document).trigger('reloadGrid');

                        mWindow.updateLists();
                    }
                });
            }
        }
    });
}

function transDestinationVal(res, type) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};

        if (type == "account") {
            var extension = res[i].extension,
                fullname = res[i].fullname,
                disabled = res[i].out_of_service;

            obj["val"] = extension;

            if (disabled == 'yes') {
                obj["class"] = 'disabledExtOrTrunk';
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '') + ' <' + $P.lang('LANG273') + '>';
            } else {
                obj["text"] = extension + (fullname ? ' "' + fullname + '"' : '');
            }
        } else if (type == "queue") {
            obj["text"] = res[i]["queue_name"];
            obj["val"] = res[i]["extension"];
        } else if (type == "ringgroup") {
            obj["text"] = res[i]["ringgroup_name"];
            obj["val"] = res[i]["extension"];
        } else if (type == "vmgroup") {
            obj["text"] = res[i]["vmgroup_name"];
            obj["val"] = res[i]["extension"];
        } else if (type == "ivr") {
            obj["text"] = res[i]["ivr_name"];
            obj["val"] = res[i]["extension"];
        } else if (type == "paginggroup") {
            obj["text"] = res[i]["paginggroup_name"];
            obj["val"] = res[i]["extension"];
        } else {
            obj["val"] = res[i];
        }

        arr.push(obj);
    }

    return arr;
}
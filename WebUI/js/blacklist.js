/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    baseServerURl = UCMGUI.config.paths.baseServerURl,
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    upload = $("#upload"), // local upload firmware
    fileUrl = document.getElementById('fileUrl'),
    udo = document.getElementById('save'),
    uploadObj = {},
    blacklist_array = [],
    BLACKLIST = 'blacklist',
    uploadErrObj = {
        "1": "LANG890",
        "2": "LANG891",
        "3": "LANG892",
        "4": "LANG893",
        "5": "LANG894",
        "6": "LANG895",
        "7": "LANG896",
        "8": "LANG897",
        "9": "LANG898",
        "10": "LANG899"
    };

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
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG905")
        });

        var filename = $(fileUrl).val().toLowerCase();

        if (filename.length) {
            if (filename.endsWith('.csv')) {
                save_changes();

                //uploadObj.submit();
            } else {
                top.dialog.clearDialog();

                top.dialog.dialogMessage({
                    type: 'warning',
                    content: $P.lang("LANG3165"),
                    callback: function() {
                        top.dialog.container.show();
                        top.dialog.shadeDiv.show();
                    }
                });
            }
        } else {
            save_changes();
        }

        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    });
});

// check the new number is already exists in blacklist or not
function check_blacklist_existance(value, element) {
    if (!value) {
        return true;
    }

    if (blacklist_array.contains(value)) {
        return false;
    }

    return true;
};

function init_blacklist_options() {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: {
            "action": "getInboundBlacklistSettings"
        },
        async: true,
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
                var enable = data.response.inbound_blacklist_settings.enable;
                if (enable && enable == 'yes') {
                    $('#blacklist_enable').attr('checked', 'checked');
                    top.Custom.init(doc, $('#blacklist_enable')[0]);
                }
            }
        }
    });
}

function init_blacklist_table() {
    $("#blacklist_list").jqGrid({
        url: "../cgi?",
        datatype: "json",
        mtype: "POST",
        width: 600,
        height: "auto",
        postData: {
            "action": "listInboundBlacklist"
        },
        colNames: [
            '<span locale="LANG4342">' + $P.lang('LANG4342') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [{
            name: 'number',
            index: 'number',
            width: 100,
            resizable: false,
            align: "center"
        }, {
            name: 'options',
            index: 'options',
            width: 100,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#blacklist_listpager",
        rowNum: 6,
        //rowList: [10, 20, 30],
        // multiselect: true,
        viewrecords: true,
        sortname: 'number',
        noData: "LANG129 LANG2278",
        jsonReader: {
            root: "response.number",
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function(data) {
            // if (data.response && data.response.number && data.response.number.length != 0) {
            //     $("#blacklist_list_div .ui-jqgrid").style.display = "block";
            // } else {
            //     $("#blacklist_list_div .ui-jqgrid")[0].style.display = "none";
            // }
            $("#blacklist_listpager .jqgrow:even").addClass("ui-row-even");
        },
        gridComplete: function(data) {
            // if (data.response && data.response.number && data.response.number.length != 0) {
            //     $("#blacklist_list_div .ui-jqgrid")[0].style.display = "block";
            // } else {
            //     $("#blacklist_list_div .ui-jqgrid")[0].style.display = "none";
            // }
            $P.lang(doc, true);
            top.Custom.init(doc);
        }
    });
}

function createOptions(cellvalue, options, rowObject) {
    var del = '<button number="' + rowObject.number + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return del;
}

function bindButtonEvent() {
    $("#blacklist_add").bind("click", function(ev) {
        var number = $("#new_number").val();
        if(number == "") {
            return;
        }
        if ($P("#new_number", doc).valid()) {
            var action = {
                "action": "addInboundBlacklist",
                "number": number
            };

            $.ajax({
                type: "post",
                url: "/cgi",
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
                        jumpPageOrNot(1);
                        getInboundBlacklist();
                    }
                    $("#new_number").val("");
                }
            });
        }
        ev.stopPropagation();
        return false;
    });

    $("#blacklist_list")
        .delegate('.del', 'click', function(ev) {
            var number = $(this).attr('number');
            var action = {
                "action": "deleteInboundBlacklist",
                "number": number
            };

            $.ajax({
                type: "post",
                url: "/cgi",
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
                        jumpPageOrNot(1);
                        getInboundBlacklist();
                    }
                }
            });
            ev.stopPropagation();
            return false;
        });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#blacklist_list"),
        totalPage = table.getGridParam("lastpage"),
        page = table.getGridParam("page"),
        reccount = table.getGridParam("reccount");

    if (page === totalPage && totalPage > 1 && reccount === selectedRows) {
        table.setGridParam({
            page: totalPage - 1
        }).trigger('reloadGrid');
    } else {
        table.trigger('reloadGrid');
    }
}

function initForm() {
    init_blacklist_table();

    bindButtonEvent();
    init_blacklist_options();
    getInboundBlacklist();
    initUpload();

    top.Custom.init(doc);

    initValidator();
}

function getInboundBlacklist() {
    $.ajax({
        type: "POST",
        url: "../cgi",
        data: {
            action: "listInboundBlacklist"
        },
        error: function(jqXHR, textStatus, errorThrown) {},
        success: function(data) {
            var bool = UCMGUI.errorHandler(data);

            if (bool) {
                var number = data.response.number;
                for (var i = 0; i <= number.length; i++) {
                    if(number[i]) {
                        blacklist_array.push(number[i].number);
                    }
                }
            }
        }
    });
}
function initValidator() {
    $("#form").tooltip();

    $P("#form", doc).validate({
        debug: true,
        rules: {
            "new_number": {
                // required: true,
                alphanumericStarPlusPound: true,
                minlength: 2,
                // callerid: true,
                customCallback: [$P.lang('LANG2285'), check_blacklist_existance]
            }//,
            // "fileUrl": {
            //     required: true,
            //     customCallback: [$P.lang("LANG2552"), function() {
            //         return /^[^\[&#(\/`;*?,|\$\>\]\+\']*$/.test($("#fileUrl").val());
            //     }]
            // }
        },
        submitHandler: function() {
            var target = this.submitButton;

            if (target.id !== 'save') {
                var $new_number = $('#new_number'),
                    num = $new_number.val();

                if (num == null || num.trim() === "") {
                    $new_number.val('');
                    return;
                }

                // clear input and get focus
                $new_number.val('');

                $new_number.trigger('focus');
            }
        }
    });
}

function initUpload() {
    uploadObj = new AjaxUpload(upload, {
        action: baseServerURl + '?action=uploadfile&type=importInboundBlacklist',
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function(file, ext) {
            fileUrl.value = file;
            if (file) {
                $("#blacklist_upload").attr("disabled", false);
            }
        },
        onSubmit: function(file, ext) {
            // if (!onUploadFormBeforeUploading()) {
            //     return false;
            // }
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang('LANG905')
            });
        },
        onComplete: function(file, data) {

            var bool = UCMGUI.errorHandler(data);
            if (bool) {
                // import extensions after upload successfully
                if (data.hasOwnProperty('response') && data.response.hasOwnProperty('result')) {
                    if (data.response.result == 0) {
                        save_after();
                    } else if (data.response.result == -1) {
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang('LANG3204')
                        });
                    } else {
                        top.dialog.clearDialog();

                        var message = $P.lang("LANG3165");

                        if (parseInt(data.response.result) < 0) {
                            message = $P.lang(uploadErrObj[Math.abs(parseInt(data.response.result)).toString()]);
                        } else if (parseInt(data.response.result) == 4) {
                            message = $P.lang("LANG915");
                        } else if (data.response.body) {
                            message = data.response.body;
                        }

                        top.dialog.dialogMessage({
                            type: 'error',
                            content: message
                        });
                    }
                }

                fileUrl.value = "";
            }
        }
    });
    $("#blacklist_upload").bind("click", function() {
        uploadObj.submit();
    });
}

function setRequest(data, callback) {
    $.ajax({
        type: "post",
        url: "../cgi",
        data: data,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: errorThrown
            });
        },
        success: function(data) {
            if (data.hasOwnProperty('status') && data.status == 0 && callback) {
                setTimeout(callback, 500);
            }
        }
    });
}

function save_after() {
    top.dialog.clearDialog();

    top.dialog.dialogMessage({
        "type": 'success',
        "content": $P.lang("LANG815"),
        "callback": function() {
            top.dialog.clearDialog();
        }
    });
};

function save_changes() {
    var blacklist_enable = ($('#blacklist_enable')[0].checked ? 'yes' : 'no');

    if ($(fileUrl).val().length) {
        setRequest({
            "action": "updateInboundBlacklistSettings",
            "enable": blacklist_enable
        });
    } else {
        setRequest({
            "action": "updateInboundBlacklistSettings",
            "enable": blacklist_enable
        }, save_after);
    }
}
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
    baseServerURl = config.paths.baseServerURl,
    gup = UCMGUI.gup,
    type = gup.call(window, "type"),
    model = gup.call(window, "model"),
    allowFormat = gup.call(window, "format"),
    mWindow = top.frames["frameContainer"].frames["mainScreen"],
    udo = document.getElementById('udo');

String.prototype.format = top.String.prototype.format;
Array.prototype.copy = top.Array.prototype.copy;
String.prototype.endsWith = top.String.prototype.endsWith;
String.prototype.rChop = top.String.prototype.rChop;

$(function () {
    $P.lang(doc, true);
    bindPage();

    initValidator();
});

function handleDirectorySwitch() {
    var newDirectoryBlock = $("#new-container");
    var value = $("#selDirectory").val();

    newDirectoryBlock.hide();

    if (value == "-1") {
        $("#iptFolderName").val("");
        newDirectoryBlock.show();
        $("div#main-container").hide();
    }
    else {
        createTable();
        $("div#main-container").show();

        initUpload();
    }
}

function bindPage() {

    bindList();

    $("#selDirectory").on("change", function (e) {
        handleDirectorySwitch();
    });

    $("button#btnCreateFolder").on("click", function (e) {
        createDirectory();
    });

    createTable();

    initUpload();

    top.Custom.init(doc);
}

function bindList() {

    var selector = $("#selDirectory");
    var originalVal = selector.val();
    selector.empty();

    selector.append($("<option/>").attr("locale", "LANG3856").text($P.lang("LANG3856")).val(""));

    var key = "zc_" + type;
    var bindQuery = {};
    bindQuery["action"] = "listFile";
    bindQuery["type"] = key;
    bindQuery["page"] = 1;
    bindQuery["sidx"] = "n";
    bindQuery["sord"] = "asc";

    if (type != "phonebook")
    {
        bindQuery["filter"] = JSON.stringify({
            "list_dir": 1,
            "list_file": 0
        });

        $.ajax({
            type: "post",
            url: "../cgi",
            data: bindQuery,
            async: false,
            error: function (jqXHR, textStatus, errorThrown) {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: errorThrown
                });
            },
            success: function (data) {
                //var bool = UCMGUI.errorHandler(data, function () {
                //    top.dialog.restorePrevContentDialog();
                //});

                if (data.status === 0)
                {
                    var source = data.response[key];

                    if (source)
                    {
                        $.each(source, function (idx, item) {
                            selector.append($("<option/>").text(item.n).val(item.n).addClass("item"));
                        });
                    }
                }
            }
        });
    }

    // now firmwrae is the only type which allow user to create folder
    if (type === "firmware")
    {
        selector.append($("<option/>").attr("locale", "LANG3852").text($P.lang("LANG3852")).val("-1"));
    }

    if (originalVal)
        selector.val(originalVal);
}


function createDirectory()
{
    var selValue = $('#selDirectory :selected').val();
    var newFolderName = $("input#iptFolderName").val();
    var validator = $P("#newForm", document).validate();


    if (selValue == "-1" && validator.element($("#iptFolderName")))
    {
        if (newFolderName)
        {
            var mkDirAction = {
                action: "mkDir",
                type: "zc_" + type,
                data: $("input#iptFolderName").val()
            };

            $.ajax({
                type: "post",
                url: "../cgi",
                data: mkDirAction,
                error: function (jqXHR, textStatus, errorThrown) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: errorThrown
                    });
                },
                success: function (data) {
                    var bool = UCMGUI.errorHandler(data, function () {
                        top.dialog.restorePrevContentDialog();
                    });

                    if (bool) {
                        if (data.response)
                        {
                            if (data.response.result == "0")
                            {
                                bindList();
                                $("#selDirectory").val(newFolderName);
                                // clear original input
                                $("input#iptFolderName").val("");

                                handleDirectorySwitch();

                                top.Custom.init(doc);
                            }
                            else if (data.response.result == "-1")
                            {
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: $P.lang("LANG3853"),
                                    closeCallback: function () {
                                        top.dialog.restorePrevContentDialog();
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }
    }
}

function initUpload() {
    $("#uploadDiv").empty();

    var container = "<input type='text' id='fileUrl' name='fileUrl' readonly='readonly'/><button type='button' id='upload' class='selectBtn'></button>";


    $(container).appendTo("#uploadDiv");

    var modelInfo = "";
    if ( model != undefined && model.length > 0 )
        modelInfo = "&extra=" + model;

    var selValue = $('#selDirectory :selected').val(),
        selData = ((selValue == "") ? "" : selValue),
        action = "../cgi?action=uploadfile&type=zc_" + type + "&data=" + selData + modelInfo,
        fileUrl = document.getElementById('fileUrl'),
        allowExtension = null,
        upload = $("#upload"); // local upload firmware

    if (allowFormat && allowFormat.length > 0) {
        allowExtension = new RegExp(".(" + allowFormat + ")$", "i");
    }

    var uploadObj = new AjaxUpload(upload, {
        action: action,
        name: 'filename',
        autoSubmit: false,
        responseType: 'json',
        onChange: function (file, ext) {
            fileUrl.value = file;
            // $P("#form_moh", document).valid();
        },
        onSubmit: function (file, ext) {
            if (allowExtension && !allowExtension.test(file)) {
                top.dialog.dialogMessage({
                    type: "error",
                    content: $P.lang("LANG4112^" + allowFormat.split("|").join(", ")),
                    closeCallback: function () {
                        top.dialog.restorePrevContentDialog();
                    }
                });

                return false;
            }

            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG881")
            });
        },
        onComplete: function (file, data) {
            //top.dialog.clearDialog("message");

            data = eval(data);

            if (data) {
                var status = data.status,
                    response = data.response;

                if (status == 0 && response && response.result == 0) {

                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG906"),
                        closeCallback: function () {
                            createTable();
                            top.dialog.restorePrevContentDialog();
                        }
                    });

                    initUpload();
                } else if (response) {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: UCMGUI.transcode(response.result),
                        closeCallback: function () {
                            top.dialog.restorePrevContentDialog();
                        }
                    });
                } else {
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG916"),
                        closeCallback: function () {
                            top.dialog.restorePrevContentDialog();
                        }
                    });
                }
            } else {
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG916"),
                    closeCallback: function () {
                        top.dialog.restorePrevContentDialog();
                    }
                });
            }
        }
    });

    udo.onclick = function () {
        uploadObj.submit();
        // onProgress();
    }
}

function initValidator() {
    $("#form").tooltip();
    $("#newForm").tooltip();

    $P("#form", document).validate({
        rules: {
            "fileUrl": {
                required: true
            }
        }
    });

    $P("#newForm", document).validate({
        rules: {
            "folderName": {
                minlength: 2,
                letterDigitUndHyphen: true,
                required: true
            }
        }
    });
}

var onUploadFormBeforeUploading = function () {
    var tmp_fname = $("#fileUrl").val();

    if (tmp_fname.endsWith('.mp3') || tmp_fname.endsWith('.wav') || tmp_fname.endsWith('.gsm') || tmp_fname.endsWith('.ulaw') || tmp_fname.endsWith('.alaw')) {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG866")
        });

        return true;
    } else {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG867")
        });

        return false;
    }
};

function createTable() {

    var key = "zc_" + type;
    var selValue = $('#selDirectory :selected').val();
    if (selValue == "-1")
        selValue = "";
    var contentContainer = $("#directory-contents");
    contentContainer.empty();

    var container = "<table id='grid-list'></table><div id='grid-pager'></div>";
    var postData = {};

    postData["action"] = "listFile";
    postData["type"] = key;
    postData["data"] = selValue;
    if (type == "firmware")
    {
        postData["filter"] = JSON.stringify({
            "list_dir": 1,
            "list_file": 1
        });
    }

    $(container).appendTo(contentContainer);


    $("#grid-list").jqGrid({
        url: baseServerURl,
        datatype: "json",
        mtype: "POST",
        width: 700,
        height: "auto",
        postData: postData,
        colNames: [
            '<span>&nbsp;</span>',
            '<span locale="LANG135">' + $P.lang('LANG135') + '</span>',
            '<span locale="LANG203">' + $P.lang('LANG203') + '</span>',
            '<span locale="LANG2257">' + $P.lang('LANG2257') + '</span>',
            '<span locale="LANG74">' + $P.lang('LANG74') + '</span>'
        ],
        colModel: [
        {
            name: 't',
            index: 't',
            width: 20,
            resizable: false,
            formatter: transData,
            align: "center",
            sortable: false
        },
        {
            name: 'n',
            index: 'n',
            width: 300,
            resizable: false,
            align: "center"
        },
        {
            name: 'd',
            index: 'd',
            width: 100,
            resizable: false,
            formatter: transData,
            align: "center",
        },
        {
            name: 's',
            index: 's',
            width: 100,
            resizable: false,
            formatter: tranSize,
            align: "center"
        },
        {
            name: 'options',
            index: 'options',
            width: 80,
            resizable: false,
            align: "center",
            formatter: createOptions,
            sortable: false
        }],
        pager: "#grid-pager",
        rowNum: 10,
        rowList: [10, 20, 30],
        multiselect: true,
        // multiboxonly: true,
        viewrecords: true,
        sortname: "n",
        noData: "LANG3855",
        jsonReader: {
            root: "response." + key,
            page: "response.page",
            total: "response.total_page",
            records: "response.total_item",
            repeatitems: false
        },
        loadComplete: function () {
            $("#grid-list .jqgrow:even").addClass("ui-row-even");
        },
        customErrorHandler: function (data) {
            return true;
        },
        gridComplete: function () {
            top.Custom.init(doc);
            $P.lang(document, true);
        }
    });

    bindButtonEvent();
}

function bindButtonEvent() {

    var gridList = $("#grid-list");
    gridList
        .delegate('.del', 'click', function (ev) {
            var ele = $('#selDirectory :selected'),
                selectedText = ele.text(),
                selectedVal = ele.val(),
                fileName = $(this).attr("fileName");

            if (selectedVal && selectedVal != "-1") {
                fileName = selectedVal + "/" + fileName;
            }

            top.dialog.dialogConfirm({
                confirmStr: $P.lang("LANG818").format(fileName),
                buttons: {
                    ok: function () {
                        var action = {
                            action: "removeFile",
                            type: "zc_" + type,
                            data: fileName
                        };

                        $.ajax({
                            type: "post",
                            url: baseServerURl,
                            data: action,
                            error: function (jqXHR, textStatus, errorThrown) {
                                top.dialog.closeCurrentDialog();
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: errorThrown
                                });
                            },
                            success: function (data) {
                                top.dialog.closeCurrentDialog();

                                var bool = UCMGUI.errorHandler(data);

                                if (bool) {
                                    top.dialog.dialogMessage({
                                        type: 'success',
                                        content: $P.lang("LANG871"),
                                        callback: function () {
                                            var table = $("#grid-list"),
                                                totalPage = table.getGridParam("lastpage"),
                                                page = table.getGridParam("page"),
                                                reccount = table.getGridParam("reccount");

                                            if (page === totalPage && totalPage > 1 && reccount === 1) {
                                                table.setGridParam({
                                                    page: totalPage - 1
                                                }).trigger('reloadGrid');
                                            } else {
                                                table.trigger('reloadGrid');
                                            }
                                            bindList();
                                            top.dialog.restorePrevContentDialog();

                                            top.Custom.init(doc);
                                            //var frameContainerDoc = top.frames["frameContainer"].document,
                                            //    applyChanges = $("#applyChanges_Button", frameContainerDoc),
                                            //    lineButton = $("#line_Button", frameContainerDoc);

                                            //// if (applyChanges.length > 0 && lineButton.length > 0 && !applyChanges.is(':animated')) {
                                            //applyChanges.css("visibility", "visible");
                                            //lineButton.css("visibility", "visible");
                                            // applyChanges.effect("shake", {
                                            //  direction: "up", distance: 2, times: 10000
                                            // }, 400);
                                            // }
                                        }
                                    });

                                    initUpload();
                                }
                            }
                        });
                    },
                    cancel: function () {
                        top.dialog.restorePrevContentDialog();
                    }
                }
            });

            ev.stopPropagation();
            return false;
        });
}

function batchDelete() {
    var sourceTable = $("#grid-list"),
        source = sourceTable.getGridParam("records"),
        selected = sourceTable.jqGrid("getGridParam", "selarrrow"),
        selectedRowsLength = selected.length,
        fileList = [],
        fileNames = [],
        confirmList = [],
        i = 0,
        rowdata,
        rowName,
        ele = $('#selDirectory :selected'),
        selectedText = ele.text(),
        selectedVal = ele.val();

    if (!source) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG3855"),
            closeCallback: function () {
                top.dialog.restorePrevContentDialog();
            }
        });
        return;
    }
    if (selectedRowsLength < 1) {
        top.dialog.dialogMessage({
            type: 'warning',
            content: $P.lang("LANG3456"),
            closeCallback: function () {
                top.dialog.restorePrevContentDialog();
            }
        });
        return;
    }

    for (i; i < selectedRowsLength; i++) {
        rowdata = sourceTable.jqGrid('getRowData', selected[i]);

        rowName = rowdata['n'].split('</span>');
        var fileName = rowName.length > 1 ? rowName[1] : rowName[0];
        fileList.push(fileName);
        if (selectedVal != "") {
            fileNames.push(selectedVal + "/" + fileName);
        } else {
            fileNames.push(fileName);
        }
    }


    for (i = 0; i < selectedRowsLength; i++) {
        confirmList.push("<font>" + fileList[i] + "</font>");
    }

    top.dialog.dialogConfirm({
        confirmStr: $P.lang("LANG818").format(confirmList.join('<br/>')),
        buttons: {
            ok: function () {
                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG825").format($P.lang("LANG3862"))
                });

                var doSelected = function () {
                    $.ajax({
                        type: "post",
                        url: "../cgi",
                        data: {
                            "action": "removeFile",
                            "type": "zc_" + type,
                            "data": fileNames.join(",,")
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            top.dialog.closeCurrentDialog("message");
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: errorThrown,
                                closeCallback: function () {
                                    top.dialog.restorePrevContentDialog();
                                    // UCMGUI.logoutFunction.doLogout();
                                }
                            });
                        },
                        success: function (data) {
                            var bool = UCMGUI.errorHandler(data);
                            if (bool) {
                                top.dialog.closeCurrentDialog("message");

                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG871"),
                                    closeCallback: function () {
                                        bindList();
                                        top.dialog.restorePrevContentDialog();
                                        jumpPageOrNot(selectedRowsLength);

                                        top.Custom.init(doc);
                                    }
                                });
                            }
                        }
                    });
                }
                setTimeout(doSelected, 100);
            },
            cancel: function () {
                top.dialog.restorePrevContentDialog();
                //top.dialog.closeCurrentDialog();
            }
        }
    });
}

function jumpPageOrNot(selectedRows) {
    var table = $("#grid-list"),
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

function tranSize(cellvalue, options, rowObject) {

    if (rowObject.t == "file")
        return UCMGUI.tranSize(rowObject.s);
    else if (rowObject.t == "directory" && rowObject.s > 0)
        return UCMGUI.tranSize(rowObject.s);
    else
        return "---";
}

function createOptions(cellvalue, options, rowObject) {
    var del;

    del = '<button fileName="' + rowObject.n + '" title="Delete" localetitle="LANG739" class="options del"></button>';

    return del;
}

function transData(cellvalue, options, rowObject) {
    var context = "";

    switch (options.colModel.name) {
        case "t":
            if (cellvalue == 'file')
            {
                context = "<img src='/images/icn_file.png' />";
            }
            else
                context = "<img src='/images/icn_folder.png' />";
            break;
        case "d":
            if (cellvalue) {
                var parts = cellvalue.split(" ");
                if (parts.length >= 2) {
                    var dateParts = parts[0].split("-");
                    var timeParts = parts[1].split(":");
                    if (dateParts.length == 3 && timeParts.length == 3) {
                        var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
                        context = date.format("mm/dd/yyyy h:MM TT");
                    }
                    else
                        context = "unknown";
                }
                else
                    context = "unknown";
            }
            break;
        default:
            context = "";
            break;
    }

    return context;
}

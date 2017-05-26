/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    BLL = top.zc,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    gup = UCMGUI.gup,
    mode = gup.call(window, "mode"),
    templateId = gup.call(window, "id"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    ZEROCONFIG = top.ZEROCONFIG;

String.prototype.format = top.String.prototype.format;
Array.prototype.isArray = top.Array.prototype.isArray;

function transData(res, cb) {
    var arr = [];

    for (var i = 0; i < res.length; i++) {
        var obj = {};
        obj["val"] = res[i];
        arr.push(obj);
    }

    if (cb && typeof cb == "function") {
        cb(arr);
    }

    return arr;
}

var source = null,
    naviBox = null;



$(function () {

    function checkNameExist()
    {
        var ret = true;
        var name = $("#templateName").val();
        ZEROCONFIG.connector.getTemplateByName(name, "").done(function (data) {
            if (data.status == 0 && data.response.body.length > 0)
            {
                if (data.response.body[0].id != templateId)
                    ret = false;
            }
        })
        .fail(function () {

        });
        return ret;
    }

    function initValidator() {
        if ($("#form").tooltip) {
            $("#form").tooltip();
        }

        $P("#form", doc).validate({
            rules: {
                "templateName": {
                    required: true,
                    maxlength: 64,
                    customCallback: [$P.lang("LANG2137"), checkNameExist]
                }
            },
            submitHandler: function () {
                if ($("div#contentPad").is(":visible")) {
                    pageSubmit();
                }
            }
        });
    }

    function pageSubmit() {
        var item = {};

        item.name = $("input#templateName").val();
        item.desc = $("input#templateDesc").val();
        item.enabled = $("input#templateEnabled").is(':checked') ? 1 : 0;
        item.isDefault = 0; // false
        if (mode === "add") {
            ZEROCONFIG.connector.updateTemplate(-1,
                                                item.name,
                                                null, // model id
                                                item.desc,
                                                item.enabled,
                                                item.isDefault)
                .done(function (result) {
                    if (result.status == 0) {
                        // needs to be executed before top dialog clear
                        mWindow.rebuildTable();

                        // this response is super weird...
                        var id = result.response.updateTemplate[0].id;
                        top.dialog.clearDialog("*");
                        top.dialog.dialogInnerhtml({
                            dialogTitle: $P.lang("LANG222").format($P.lang("LANG3455"), item.name),
                            displayPos: "editForm",
                            frameSrc: "html/zc_globaltemplate_modal.html?mode=edit&id={0}".format(id)
                        });
                    }
                    else
                    {
                        // display error
                    }
                })
                .fail(function () {
                    top.dialog.clearDialog("*");
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG862")
                    });
                    console.error("PROCESS ERROR", arguments);
                });
        }
        else {
            BLL.PrepareSubmitConfigurations(templateId, source, function (result) {
                if (result.error.length > 0) {
                    //// TODO: come back to display error
                    //// display error here
                    //for (var i = 0; i < result.error.length; i++) {
                    //    console.log(result.error[i]);
                    //}
                }
                else {
                    var processList = [];
                    var processName = [];

                    top.dialog.dialogMessage({
                        type: 'loading',
                        content: $P.lang("LANG978")
                    });

                    ZEROCONFIG.connector.deleteAllTemplateSettings(templateId).done(function (ret) {

                        if (ret.status != 0) {
                            top.dialog.clearDialog("*");
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG862")
                            });
                            console.warn("FAIL: Unable to delete settings", ret);
                            return;
                        }

                        processName.push("item");
                        processList.push(ZEROCONFIG.connector.updateTemplate(templateId,
                                                                             item.name,
                                                                             null, // model id
                                                                             item.desc,
                                                                             item.enabled,
                                                                             item.isDefault));

                        if (result.update.refId.length > 0) {
                            processName.push("update");
                            processList.push(ZEROCONFIG.connector.updateTemplateSettings(result.update.refId,
                                                                                         result.update.elementId,
                                                                                         result.update.elementNum,
                                                                                         result.update.entityName,
                                                                                         result.update.value));
                        }

                        $.when.apply({}, processList).done(function () {
                            var resultSet = arguments;
                            if (processList.length == 1) {
                                resultSet = [];
                                resultSet.push(arguments);
                            }

                            for (var i = 0; i < processName.length; i++) {
                                var result = resultSet[i][0];
                                if (result.status != 0) {
                                    top.dialog.clearDialog("*");
                                    var bool = UCMGUI.errorHandler(result, function() {
                                        top.dialog.container.show();
                                        top.dialog.shadeDiv.show();
                                    });
                                    console.error("Process error:" + processName[i]);
                                    return;
                                }
                            }

                            mWindow.rebuildTable();

                            top.dialog.clearDialog("*");
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG873")
                            });
                        }).fail(function () {
                            console.warn("FAIL", arguments);
                            top.dialog.clearDialog("*");
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG862")
                            });
                        });
                    })
                    .fail(function () {
                        console.warn("FAIL", arguments);
                        top.dialog.clearDialog("*");
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG862")
                        });
                    });



                }
            });
        }
    }


    function pageLoadCallback(result) {
        var timers = new SimpleTimer();
        naviBox = $("div#navBar-inner div.combo").navibox({
            mode: "select",
            source: source,
            deferred: timers,
            container: "div#itemContainer"
        });

        timers.start(function () {
            $("div#preparePad").hide();
            $("div#contentPad").show();

            // we need to prevent the use of ENTER as submit on input and select fields
            $("input,select", document).keypress(function (event) { return event.keyCode != 13; });
        });


        $(window).scroll(function () {
            $('#navBar-inner').toggleClass('scrolling', $(window).scrollTop() > $('#navBar').offset().top);

            //can be rewritten long form as:
            var scrollPosition, headerOffset, isScrolling;
            scrollPosition = $(window).scrollTop();
            headerOffset = $('#navBar').offset().top;
            isScrolling = scrollPosition > headerOffset;
            $('#navBar-inner').toggleClass('scrolling', isScrolling);
            if (isScrolling)
                $("#navTop").show();
            else
                $("#navTop").hide();
        });
    }

    var bindPage = function (data) {
        // TODO: this kind of return data needs to improve!
        if (data && data.id && data.id.length > 0) {
            var item = data.id[0];
            $("input#templateName").val(item.name);
            $("input#templateDesc").val(item.description);
            if (item.enabled)
                $("input#templateEnabled").attr("checked", "checked");
            else
                $("input#templateEnabled").removeAttr("checked");

            top.Custom.init(doc);
        }
        else {
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG3881"),
                closeCallback: function () {
                    mWindow.rebuildTable();
                    top.dialog.clearDialog("*");
                }
            });
        }
    }

    var bindSettings = function (data) {
        var ret = {};
        // TODO: this kind of return data needs to improve!
        if (data && data.template_id) {
            var currentData = data.template_id;

            // NOTE: it is weird the return data is stored under object.template_id
            for (var i = 0; i < currentData.length; i++) {
                var item = currentData[i];
                var key = item.element_id + "#" + item.element_number;
                if (!ret[key]) {
                    ret[key] = { "values": {}, "originName": "", "originType": "" };
                }

                ret[key].values[item.entity_name] = item.value;
            }
        }
        else {
            top.dialog.clearDialog("*");
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG853")
            });
            console.error("Fail to load data", result);
        }

        source = BLL.DataCollection.generateGlobalBlockList(ret);
        ZEROCONFIG.valueDelegation.executeRequests(pageLoadCallback);
    }

    var loadPageContents = function () {
        (function checkReady() {
            if (ZEROCONFIG.isDataReady() == 1) {

                var processList = [];
                var processName = [];

                processList.push(ZEROCONFIG.connector.getTemplate(templateId));
                processName.push("Item");

                processList.push(ZEROCONFIG.connector.getTemplateSettings(templateId));
                processName.push("Settings");

                $.when.apply({}, processList).done(function () {
                    var resultSet = arguments;
                    if (processList.length == 1) {
                        resultSet = [];
                        resultSet.push(arguments);
                    }

                    for (var i = 0; i < processList.length; i++) {
                        var result = resultSet[i][0];
                        if (result.status != 0) {
                            // TODO: add error handling
                            console.error("Process error:" + processName[i]);
                            return;
                        }
                        else {
                            if (processName[i] == "Item") {
                                bindPage(result.response);
                            }
                            else if (processName[i] == "Settings") {
                                bindSettings(result.response);
                            }
                        }
                    }

                }).fail(function () {
                    console.log("FAIL", arguments);
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG3881"),
                        closeCallback: function () {
                            mWindow.rebuildTable();
                            top.dialog.clearDialog("*");
                        }
                    });
                });
            }
            else {
                var label = $("div#loadingMsg");
                var tLocale = "LANG805";

                if (ZEROCONFIG.isDataReady() == -1)
                    tLocale = "LANG3717";

                if (label.attr("locale") != tLocale) {
                    label.attr("locale", tLocale);
                    label.text($P.lang(tLocale));
                }

                setTimeout(checkReady, 1000);
            }
        })();
    }

    $(document).ready(function () {
        if (mode === "edit") {
            $("div#preparePad").css("height", "600px");
        }
        else {
            $("button#save").attr("locale", "LANG3446");
        }

        $P.lang(doc, true);
        BLL.ConfigPage.resetStatus();
        BLL.ConfigPage.updatePageDOM("global-template", window, document);

        initValidator();

        top.Custom.init(doc);

        if (mode === "add") {
            $("div#preparePad").hide();
            $("div#contentPad").show();
        }
        else if (mode == 'edit') {
            $("div#optionPad").show();
            // loading page content is needed only for edit mode
            loadPageContents();
        }
    });


});

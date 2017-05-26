/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    BLL = top.zc,
    doc = document,
    UCMGUI = top.UCMGUI,
    config = UCMGUI.config,
    ZEROCONFIG = top.ZEROCONFIG;

Array.prototype.each = top.Array.prototype.each;
Array.prototype.remove = top.Array.prototype.remove;
Array.prototype.copy = top.Array.prototype.copy;
Array.prototype.isArray = top.Array.prototype.isArray;

String.prototype.format = top.String.prototype.format;

$(function () {
    ZEROCONFIG.init();

    // local variables
    var templateId = 0,
        source = null,
        naviBox = null;

    var pageValueLoadedCallback = function (result) {
        var data = {};

        if (result.status == 0) {
            // NOTE: it is weird the return data is stored under object.template_id
            for (var i = 0; i < result.response.template_id.length; i++) {
                var item = result.response.template_id[i];
                var key = item.element_id + "#" + item.element_number;
                if (!data[key]) {
                    data[key] = { "values": {}, "originName": "", "originType": "" };
                }

                data[key].values[item.entity_name] = item.value;
            }
        }
        else {
            top.dialog.clearDialog();
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG853")
            });
            console.error("Fail to load data", result);
        }

        source = BLL.DataCollection.generateGlobalBlockList(data);

        ZEROCONFIG.valueDelegation.executeRequests(pageLoadCallback);
    }

    var pageLoadCallback = function (result) {

        var timers = new SimpleTimer();
        naviBox = $("div#navBar-inner div.combo").navibox({
            mode: "all",
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
            if ($('#navBar').offset())
                $('#navBar-inner').toggleClass('scrolling', $(window).scrollTop() > $('#navBar').offset().top);
            else
                return;

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

        $("button#save").on("click", function (e) {
            BLL.PrepareSubmitConfigurations(templateId, source, function (result) {
                if (result.error.length > 0) {
                    // display error here
                    //for (var i = 0; i < result.error.length; i++) {
                    //    console.log(result.error[i]);
                    //}
                }
                else {

                    var processList = [];
                    var listName = [];

                    top.dialog.dialogMessage({
                        type: 'loading',
                        content: $P.lang("LANG978")
                    });

                    // process delete ALL settings first
                    ZEROCONFIG.connector.deleteAllTemplateSettings(templateId).done(function (ret) {

                        if (ret.status != 0) {
                            top.dialog.clearDialog();
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG862")
                            });
                            console.warn("FAIL: Unable to delete settings", ret);
                            return;
                        }

                        if (result.update.refId.length > 0) {
                            listName.push("update");
                            processList.push(ZEROCONFIG.connector.updateTemplateSettings(result.update.refId,
                                                                                  result.update.elementId,
                                                                                  result.update.elementNum,
                                                                                  result.update.entityName,
                                                                                  result.update.value));

                            $.when.apply({}, processList).done(function () {
                                top.dialog.clearDialog();

                                var resultSet = arguments;
                                if (processList.length == 1) {
                                    resultSet = [];
                                    resultSet.push(arguments);
                                }

                                for (var i = 0; i < listName.length; i++) {
                                    var result = resultSet[i][0];
                                    if (result.status != 0) {
                                        console.error("Process error:" + listName[i]);
                                        top.dialog.dialogMessage({
                                            type: 'error',
                                            content: $P.lang("LANG862")
                                        });
                                        return;
                                    }
                                }
                                top.dialog.dialogMessage({
                                    type: 'success',
                                    content: $P.lang("LANG873")
                                });
                            }).fail(function () {
                                top.dialog.clearDialog();
                                console.log("FAIL", arguments);
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: $P.lang("LANG862")
                                });
                            });
                        }
                        else
                        {
                            top.dialog.clearDialog();
                            top.dialog.dialogMessage({
                                type: 'success',
                                content: $P.lang("LANG873")
                            });
                        }
                    })
                    .fail(function () {
                        top.dialog.clearDialog();
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG862")
                        });
                    });
                }
            });
        });
    }

    $(document).ready(function () {
        $P.lang(doc, true);
        topDoc.title = $P.lang("LANG584").format(config.model_info.model_name, $P.lang("LANG632"));
        BLL.ConfigPage.resetStatus();
        BLL.ConfigPage.updatePageDOM("globalpolicy", window, document);
        // loading page settings

        (function checkReady() {
            if (ZEROCONFIG.isDataReady() == 1) {
                BLL.DataCollection.prepareGlobalList();

                ZEROCONFIG.connector.getTemplateSettings(templateId)
                    .done(function (result) {
                        setTimeout(function () {
                            pageValueLoadedCallback(result);
                        }, 1);
                    }).fail(function () {
                        // TODO: add error display here
                        console.error("FAIL", arguments);
                    });

                var source = $("#invalidModelWarning").html();
                ZEROCONFIG.connector.checkZeroConfigInvalidModels(source, true);
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

        // register element events

    });
});

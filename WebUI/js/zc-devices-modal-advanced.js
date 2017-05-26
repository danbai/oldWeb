/*
 * Description: UCM6100 WebGUI
 * Copyright (C) 2014 Grandstream Networks, Inc.
 *
 */

var $P = top.$,
    topDoc = top.document,
    doc = document,
    UCMGUI = top.UCMGUI,
    BLL = top.zc,
    config = UCMGUI.config,
    gup = UCMGUI.gup,
    mode = gup.call(window, "mode"),
    mac = gup.call(window, "mac"),
    mid = gup.call(window, "mid"),
    ip = gup.call(window, "ip"),
    status = gup.call(window, "status"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    ZEROCONFIG = top.ZEROCONFIG,
    model = {},
    loadedConfigure = null,
    templates = {},
    customFields = {},
    curModelTemplates = [],
    curGlobalTemplates = [],
    defaultModelTemplate = null,
    source = null,
    devmappings = null,
    optionTimer = null,
    singleModelMode = false,
    currentMac = mac,
    __globalTemplateLoaded = false,
    __globalTemplateRendered = false,
    __modelTemplateLoaded = false,
    __modelTemplateRendered = false,
    modified = false;

String.prototype.format = top.String.prototype.format;
Array.prototype.isArray = top.Array.prototype.isArray;

var bindPage = function (data) {
    // TODO: this kind of return data needs to improve!
    if (data && !$.isEmptyObject(data.zc_devices)) {
        var item = data.zc_devices;

        item.mac = mac;

        model = BLL.DataCollection.getModelByName(item.vendor, item.model);
        if (model) {
            item.modelId = model.id();

            $("#loading-pad").hide();
            $("#empty-pad").show();

            $("span#deviceMac").html(item.mac);
            $("span#deviceIp").html(item.ip);
            $("span#deviceVersion").html(item.version);
            $("span#deviceModel").html((item.vendor + " " + item.model).toUpperCase());
            // does not allow modify....? Is there any reasonable need to modify this value?
            //$("select#deviceModel").val(modelId).attr("disabled", "disabled");

            var thumbnail = $("div.thumbnail");
            thumbnail.empty();
            var img = new Image();
            img.onload = function () {
                thumbnail[0].appendChild(img);
            }
            img.onerror = function () {
                img = null;
                thumbnail.append($("<img/>").attr("src", "../images/empty.png").addClass("sm_thumbnail"));
            }
            img.className = "sm_thumbnail";
            img.src = model.resourcePath() + model.thumbnail();


            BLL.ConfigPage.updatePageConfig(item.modelId, "device", item);
            BLL.ConfigPage.modelInfo().prepareListData();
        }
        else {
            $("#empty-pad").hide();
        }
    } else {
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG3881"),
            closeCallback: function () {
                mWindow.processReloadTable();
                top.dialog.clearDialog("*");
            }
        });
    }
}

var bindCustomFields = function (data) {
    customFields = {};
    if (data && data.getZeroConfigCustomSettings) {
        var currentData = data.getZeroConfigCustomSettings;

        for (var i = 0; i < currentData.length; i++) {
            var item = currentData[i];

            customFields[item.devname] = item.value;
        }
    }
    else {
        console.warn("Unable to retrieve the custom fields for this page.");
    }
}

var bindTemplates = function (data, isModel) {
    if (data) {
        var currentData = data;
        for (var i = 0; i < currentData.length; i++) {
            var item = currentData[i];

            if (item.is_default) {
                defaultModelTemplate = item;
                $("#contentDefaultModel").text(defaultModelTemplate.name);
            }
            else {
                templates[item.id] = item;

                if (isModel) {
                    item.isModel = true;
                }
            }
        }
    }
}

var bindMappings = function (data) {
    var modelTemplateList = $("select#availModelTemplates");
    var globalTemplateList = $("select#availGlobalTemplates");

    var selectedGlobalTemplateList = $("#selGlobalTemplates");
    var selectedModelTemplateList = $("#selModelTemplates");

    curModelTemplates.length = 0;
    curGlobalTemplates.length = 0;

    if (data && data.zc_device_template_mapping) {
        var currentData = data.zc_device_template_mapping;

        for (var i = 0; i < currentData.length; i++) {
            var item = currentData[i];
            var template;
            if (template = templates[item.template_id]) {
                template.mapped = true;
                var usingList = selectedGlobalTemplateList;
                if (template.isModel) {
                    usingList = selectedModelTemplateList;
                    curModelTemplates.push(template.id);
                }
                else
                    curGlobalTemplates.push(template.id);

                usingList.append($("<option/>").attr("value", template.id).text(template.name));
            }
        }
    }


    var modelTemplates = [];
    var globalTemplates = [];
    for (var name in templates) {
        if (templates.hasOwnProperty(name)) {
            var item = templates[name];
            if (!item.mapped) {
                if (item.isModel)
                    modelTemplates.push(item);
                else
                    globalTemplates.push(item);
            }
        }
    }

    var sortItem = function (a, b) {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    }

    modelTemplates.sort(sortItem);
    globalTemplates.sort(sortItem);

    // bind available model templates 
    if (__modelTemplateLoaded && !__modelTemplateRendered) {
        modelTemplateList.append($("<option/>").attr("value", "").text(""));
        for (var i = 0; i < modelTemplates.length; i++) {
            var item = modelTemplates[i];
            if (item) {
                modelTemplateList.append(
                    $("<option/>").attr("value", item.id).text(item.name)
                );
            }
        }

        __modelTemplateRendered = true;
    }

    if (__globalTemplateLoaded && !__globalTemplateRendered) {
        globalTemplateList.append($("<option/>").attr("value", "").text(""));
        for (var i = 0; i < globalTemplates.length; i++) {
            var item = globalTemplates[i];
            if (item) {
                globalTemplateList.append(
                    $("<option/>").attr("value", item.id).text(item.name)
                );
            }
        }

        __globalTemplateRendered = true;
    }
}

var loadRequiredContents = function (callback) {

    var processList = [];
    var processName = [];


    if (!__globalTemplateLoaded) {
        processList.push(ZEROCONFIG.connector.getAllTemplates("global", "enabled"));
        processName.push("GlobalTemplates");
    }

    if (singleModelMode) {
        if (!__modelTemplateLoaded) {
            processList.push(ZEROCONFIG.connector.getAllModelTemplates(model.id(), "enabled"));
            processName.push("ModelTemplates");
        }
    }

    if (mode !== "batch") {
        processList.push(ZEROCONFIG.connector.getDeviceTemplateMappings(currentMac));
        processName.push("Mapping");
    }

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
                if (processName[i] == "GlobalTemplates") {
                    bindTemplates(result.response.templates, false);
                    __globalTemplateLoaded = true;
                }
                //else if (processName[i] == "CustomFields") {
                //    bindCustomFields(result.response);
                //}
                else if (processName[i] == "ModelTemplates") {
                    bindTemplates(result.response.model_id, true);
                    __modelTemplateLoaded = true;
                }
                else if (processName[i] == "Mapping") {
                    bindMappings(result.response);
                }
            }
        }

        $("div#preparePad").hide();
        $("div#contentPad").show();

        if (typeof callback === "function") {
            callback.call(this);
        }

    }).fail(function () {
        top.dialog.clearDialog("*");
        console.log("FAIL", arguments);
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG862")
        });
    });
}

var loadPageContents = function () {

    ZEROCONFIG.connector.getZeroConfig(mac, ip).done(function (result) {
        if (result.status === 0) {
            // binding page state
            bindPage(result.response);

            loadRequiredContents(function () {
                // loading the preview when ready
                loadPreview();
            });
        }
        else {
            top.dialog.clearDialog("*");
            // TODO: add customize error
            console.log("FAIL", arguments);
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG862")
            });
        }

    }).fail(function () {
        top.dialog.clearDialog("*");
        console.log("FAIL", arguments);
        top.dialog.dialogMessage({
            type: 'error',
            content: $P.lang("LANG862")
        });
    });
}


function pageSubmit(callback) {
    var self = this;
    if (modified) {
        top.dialog.dialogMessage({
            type: 'loading',
            content: $P.lang("LANG978")
        });
    }

    var macList = [];
    var keepModelTemps = false;
    if (mode !== "batch") {
        macList.push(currentMac);
    }
    else {
        macList = $("div#batch-list").modelDevices("deviceList");
        keepModelTemps = [];
        for (var i = 0; i < macList.length; i++) {
            keepModelTemps[i] = !singleModelMode;
        }
    }

    ZEROCONFIG.connector.deleteDeviceTemplateMappings(macList, keepModelTemps).done(function () {

        var updateList = {
            "mac": [],
            "templateId": [],
            "priority": []
        };

        var selectedGlobalTemplateList = $("#selGlobalTemplates");
        var selectedModelTemplateList = $("#selModelTemplates");

        var p = 0;

        curGlobalTemplates.length = 0;
        curModelTemplates.length = 0;

        $("option", selectedGlobalTemplateList).each(function (index, item) {
            var usingP = ++p;

            for (var i = 0; i < macList.length; i++) {
                updateList.mac.push(macList[i])
                updateList.templateId.push(item.value);
                updateList.priority.push(usingP);
            }

            curGlobalTemplates.push(item.value);
        });

        $("option", selectedModelTemplateList).each(function (index, item) {
            var usingP = ++p;

            for (var i = 0; i < macList.length; i++) {
                updateList.mac.push(macList[i])
                updateList.templateId.push(item.value);
                updateList.priority.push(usingP);
            }

            curModelTemplates.push(item.value);
        });

        if (updateList.mac.length > 0) {
            ZEROCONFIG.connector.updateDeviceTemplateMappings(
                updateList.mac,
                updateList.templateId,
                updateList.priority
            )
            .done(function (result) {

                if (result.status == 0) {
                    if (typeof callback === "function") {
                        callback.call(self);
                    }
                    else {
                        var DO_RELOAD = function () { // DO_RELOAD();
                            if ((status == 6 || status == 7) && mode == "edit") {
                                function after(res) {
                                    top.dialog.clearDialog("*");

                                    if (res && res.status == '0') {
                                        top.dialog.dialogMessage({
                                            type: 'success',
                                            content: $P.lang("LANG829")
                                        });
                                    } else {
                                        top.dialog.dialogMessage({
                                            type: 'warning',
                                            content: "Wrong!"
                                        });
                                    }
                                }

                                top.dialog.dialogConfirm({
                                    confirmStr: $P.lang("LANG2692"),
                                    buttons: {
                                        ok: function () {
                                            // top.dialog.dialogMessage({ type: 'loading', content: $P.lang("LANG829")});
                                            $.ajax({
                                                type: "GET",
                                                url: "../cgi?action=DownloadCfg&mac=" + mac,
                                                error: function (jqXHR, textStatus, errorThrown) { },
                                                success: after
                                            });
                                        },
                                        cancel: function () {
                                            top.dialog.clearDialog("*");
                                        }
                                    }
                                });
                            }
                            else
                                top.dialog.clearDialog("*");
                        };

                        setTimeout(DO_RELOAD, 1000);
                        mWindow.processReloadTable();

                        top.dialog.dialogMessage({
                            type: 'success',
                            content: $P.lang("LANG873")
                        });
                    }
                }
                else {
                    console.warn("PROCESS ERROR", result);
                    top.dialog.clearDialog("*");
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG862")
                    });
                }


            })
            .fail(function () {
                console.warn("PROCESS ERROR", arguments);
                top.dialog.clearDialog("*");
                top.dialog.dialogMessage({
                    type: 'error',
                    content: $P.lang("LANG862")
                });
            });
        }
        else {
            if (typeof callback === "function") {
                callback.call(self);
            }
            else {
                mWindow.processReloadTable();
                top.dialog.clearDialog("*");
                top.dialog.dialogMessage({
                    type: 'success',
                    content: $P.lang("LANG873")
                });
            }
        }

    });

}

var bindPreview = function (data) {
    if (data && data.body) {
        var currentData = data.body.view || [];
        var loadingPad = $("div#loadingPad");
        var container = $("div#previewContentPad");

        loadingPad.show();

        container.remove();
        container = $("<div/>").attr("id", "previewContentPad").hide().insertAfter(loadingPad);


        var ret = {};
        for (var i = 0; i < currentData.length; i++) {
            var item = currentData[i];
            var key = item.fieldId;
            if (!ret[key]) {
                ret[key] = { "values": {}, "originName": "", "originType": "" };

                switch (item.templateType) {
                    case 1: // TEMPLATE_GLOBAL_POLICY
                        ret[key].originName = "Global Policy";
                        ret[key].originType = "global";
                        break;
                    case 2: // TEMPLATE_GLOBAL_TEMPLATE
                    case 3: // TEMPLATE_MODEL_DEFAULT
                    case 4: // TEMPLATE_MODEL_TEMPLATE
                        ret[key].originName = item.templateName;
                        ret[key].originType = "template";
                        break;
                    case 6: // TEMPLATE_DEVICE_REQUIRED
                        ret[key].originName = "UCM Configured";
                        ret[key].originType = "locked";
                        break;
                    default:
                        break;
                }
            }

            ret[key].values[item.entityName] = item.value;
        }
        // loading model fields
        if (!source) {
            var using = model.generateFieldList(ret);
            devmappings = using.devmapping;
            source = using.source;
        }
        else {
            // let's clean up the original values
            for (var i = 0; i < source.length; i++) {
                var lv1 = source[i];
                delete lv1._widget;

                if (lv1.items) {
                    for (var j = 0; j < lv1.items.length; j++) {
                        var lv2 = lv1.items[j];
                        delete lv2._widget;

                        if (lv2.items) {
                            for (var k = 0; k < lv2.items.length; k++) {
                                var item = lv2.items[k];
                                delete item._widget;
                                delete item._loadedValue;
                                delete item._selected;

                                var found;
                                if (found = ret[item.id]) {
                                    item._loadedValue = found;
                                    item._selected = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        // process custom fields
        var customContainer = null;
        for (var name in customFields) {
            if (customFields.hasOwnProperty(name)) {
                var value = customFields[name];
                var found;

                if (found = devmappings[name]) {
                    for (var i = 0; i < found.length; i++) {
                        var item = found[i];
                        if (!item._loadedValue) {
                            item._loadedValue = { "values": {}, "originName": "", "originType": "" };
                            item._selected = true;
                        }
                        if (item.mappings) {
                            item._loadedValue.values[item.mappings[name]] = value;
                        }
                    }
                }
                else {
                    if (!customContainer) {
                        var main = $("<div/>").attr("id", "customContainer").appendTo(container);
                        var title = $("<div/>")
                                        .addClass("contaienr-header")
                                        .append($("<span/>").addClass("label").text($P.lang("LANG3483")))
                                        .appendTo(main);

                        customContainer = $("<div/>").attr("id", "fieldContainer").appendTo(main);
                    }

                    var row = $("<div/>").addClass("field").appendTo(customContainer);
                    $("<div/>").addClass("cell label").text(name).appendTo(row);
                    $("<div/>").addClass("cell contents").text(value).appendTo(row);

                }
            }
        }


        ZEROCONFIG.valueDelegation.executeRequests(function () {
            var timers = new SimpleTimer();
            container.fieldContainer({
                mode: "preview",
                source: source,
                deferred: timers
            });

            timers.start(function () {
                loadingPad.hide();
                container.show();

                $(".control").removeAttr("disabled");

                if (customContainer)
                    $(".empty", container).hide();

                // we need to prevent the use of ENTER as submit on input and select fields
                $("input,select", document).keypress(function (event) { return event.keyCode != 13; });
            });
        });
    }
    else {
        var loadingPad = $("div#loadingPad");
        var container = $("div#previewContentPad");

        loadingPad.show();

        container.remove();
        container = $("<div/>").attr("id", "previewContentPad").hide().insertAfter(loadingPad);

        console.warn("Warning: invalid return data");
        container.fieldContainer({
            mode: "preview",
            source: []
        });

        loadingPad.hide();
        container.show();

        $(".control").removeAttr("disabled");
    }
}

var loadPreview = function (type) {
    $(".control").attr("disabled", "disabled");

    // TODO: Add reload preview logic here
    var selectedGlobalTemplateList = $("#selGlobalTemplates");
    var selectedModelTemplateList = $("#selModelTemplates");

    var mTemplates = [];
    var gTemplates = [];

    $("option", selectedGlobalTemplateList).each(function (index, item) {
        gTemplates.push(item.value);
    });

    $("option", selectedModelTemplateList).each(function (index, item) {
        mTemplates.push(item.value);
    });

    var processLoadPreview = function () {
        ZEROCONFIG.connector.getZeroConfigPreview(currentMac, model.id(), gTemplates, mTemplates)
            .done(function (result) {
                if (result.status === 0) {
                    bindPreview(result.response);
                }
                else {
                    console.warn("FAILED: unable to load preview->" + result.status);
                    $(".control").removeAttr("disabled");
                }
            })
            .fail(function () {
                console.warn("FAILED", arguments);
                $(".control").removeAttr("disabled");
            })
            .always(function () {

            });
    }

    if (type === "global")
        processLoadPreview();
    else {
        ZEROCONFIG.connector.getZeroConfigCustomSettings(currentMac, model.id(), mTemplates)
            .done(function (result) {

                if (result.status === 0) {
                    bindCustomFields(result.response);

                    processLoadPreview();
                }
                else {
                    console.warn("FAILED: unable to load custom fields->" + result.status);
                    $(".control").removeAttr("disabled");
                }

            })
            .fail(function () {
                console.warn("FAILED", arguments);
                $(".control").removeAttr("disabled");
            })
            .always(function () {

            });
    }

}

var triggerModify = function (skipTrigger, type) {
    if (skipTrigger !== true)
        modified = true;

    if (!optionTimer) {
        //$("#empty-pad").hide();
        //$("#content-pad").hide();
        //$("#loading-pad").show();
    }
    else
        clearTimeout(optionTimer);

    optionTimer = setTimeout(function () {
        if (singleModelMode) {
            loadPreview(type);
        }

        optionTimer = null;
    }, 1000);
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
        },
        submitHandler: function () {
            if ($("div#contentPad").is(":visible")) {
                pageSubmit();
            }
        }
    });
}

var initListBox = function (type) {
    var nameAddButton = "#btnModelTemplateAdd";
    var nameUpButton = "#btnModelTemplateUp";
    var nameDownButton = "#btnModelTemplateDown";
    var nameDelButton = "#btnModelTemplateDelete";
    var nameAvailList = "#availModelTemplates";
    var nameSelList = "#selModelTemplates";

    if (type == "global") {
        nameAddButton = "#btnGlobalTemplateAdd";
        nameUpButton = "#btnGlobalTemplateUp";
        nameDownButton = "#btnGlobalTemplateDown";
        nameDelButton = "#btnGlobalTemplateDelete";
        nameAvailList = "#availGlobalTemplates";
        nameSelList = "#selGlobalTemplates";
    }

    var availListWidget = $(nameAvailList);
    var selListWidget = $(nameSelList);

    $(nameAddButton).on("click", function (e) {
        var selected = $("option:selected", availListWidget);
        if (selected.length > 0) {
            var option = selected[0];
            if (option.value) {
                option.selected = false;
                $(option).detach().appendTo(selListWidget);
                triggerModify(false, type);
            }
            else {
                // Nothing to handle when select empty item
            }
        }
    });

    $(nameDelButton).on("click", function (e) {
        var selected = $("option:selected", selListWidget);
        if (selected.length > 0) {
            var option = selected[0];
            if (option.value) {
                option.selected = false;
                var $option = $(option);
                var added = false;
                $option.detach();

                $("option", availListWidget).each(function () {
                    var $this = $(this);
                    if ($(this).text() > $option.text()) {
                        $option.insertBefore($this);
                        added = true;
                        return false;
                    }
                });

                if (!added)
                    $option.appendTo(availListWidget);

                triggerModify(false, type);
            }
            else {
                // Nothing to handle when select empty item
            }
        }
    });

    $(nameUpButton).on("click", function (e) {
        var selected = $("option:selected", selListWidget);
        if (selected.length > 0) {
            var $option = $(selected[0]);
            var prev = $option.prev();
            if (prev.length > 0) {
                var $prev = $(prev[0]);

                $option.detach().insertBefore($prev);
                triggerModify(false, type);
            }
        }
    });

    $(nameDownButton).on("click", function (e) {
        var selected = $("option:selected", selListWidget);
        if (selected.length > 0) {
            var $option = $(selected[0]);
            var next = $option.next();
            if (next.length > 0) {
                var $next = $(next[0]);

                $option.detach().insertAfter($next);
                triggerModify(false, type);
            }
        }
    });
}

function switchPads(isSingleMode) {
    if (isSingleMode) {
        $(".multiple-model-pad").hide();
        $(".single-model-pad").show();

        $("ul#menu li#menu-basic").show();
    }
    else {
        $(".multiple-model-pad").show();
        $(".single-model-pad").hide();

        $("ul#menu li#menu-basic").hide();
    }

    singleModelMode = isSingleMode;
}

$(function () {
    if (mode == "add") {
        // TODO: add error handling
        console.error("ERROR: unsupported mode");
        return;
    }
    BLL.ConfigPage.updatePageDOM("device-advanced", window, document);
    $P.lang(doc, true);

    initValidator();

    (function checkReady() {
        if (ZEROCONFIG.isDataReady() == 1) {
            BLL.DataCollection.prepareGlobalList();

            // handle menu logic
            $("ul#menu li#menu-advanced").addClass("sel");
            $("ul#menu li#menu-basic a").on("click", function (e) {
                var openWindow = function () {
                    var macList = [];
                    var usingMac = mac;
                    var usingIP = ip;
                    var usingStatus = status;

                    if (mode !== "batch") {
                        top.dialog.clearDialog("*");
                        top.dialog.dialogInnerhtml({
                            dialogTitle: $P.lang("LANG222").format($P.lang("LANG1287"), usingMac),
                            displayPos: "editForm",
                            frameSrc: "html/zc_devices_modal_basic.html?mode=edit&mac={0}&ip={1}&status={2}".format(usingMac, usingIP, usingStatus)
                        });
                    }
                    else {
                        macList = $("div#batch-list").modelDevices("deviceList");
                        top.dialog.clearDialog("*");
                        top.dialog.dialogInnerhtml({
                            dialogTitle: $P.lang("LANG3866"),
                            displayPos: "editForm",
                            frameSrc: "html/zc_devices_modal_basic.html?mode=batch&mac={0}&mid={1}&ip=&status=".format(macList.toString(), model.id())
                        });
                    }
                }

                if (!modified) {
                    openWindow();
                }
                else {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG3482"),
                        buttons: {
                            ok: function () {
                                // TODO: add save 
                                pageSubmit(function () {
                                    // open customize window after save
                                    openWindow();
                                });
                            },
                            cancel: function () {
                                // no save and switch
                                openWindow();
                            }
                        }
                    });
                }
            });

            $("div#btnEditGlobalPolicy").on("click", function (e) {

                var openWindow = function () {
                    top.dialog.clearDialog("*");
                    top.frames['frameContainer'].module.jumpMenu('zc_globalpolicy.html');
                }

                if (!modified) {
                    openWindow();
                }
                else {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG3482"),
                        buttons: {
                            ok: function () {
                                // TODO: add save 
                                pageSubmit(function () {
                                    // open customize window after save
                                    openWindow();
                                });
                            },
                            cancel: function () {
                                // no save and switch
                                openWindow();
                            }
                        }
                    });
                }
            });

            $("div#btnEditCustomizeSettings").on("click", function (e) {

                var openCustomizeWindow = function () {

                    var macList = [];
                    var usingMac = mac;
                    var usingIP = ip;
                    var usingStatus = status;

                    if (mode !== "batch") {
                        top.dialog.clearDialog("*");
                        top.dialog.dialogInnerhtml({
                            dialogTitle: $P.lang("LANG222").format($P.lang("LANG3476"), mac),
                            displayPos: "editForm",
                            frameSrc: "html/zc_devices_modal_custom.html?mode=edit&mac={0}&ip={1}&gtemp={2}&mtemp={3}&status={4}".format(usingMac, usingIP, curGlobalTemplates.toString(), curModelTemplates.toString(), usingStatus)
                        });
                    }
                    else {
                        macList = $("div#batch-list").modelDevices("deviceList");
                        top.dialog.clearDialog("*");
                        top.dialog.dialogInnerhtml({
                            dialogTitle: $P.lang("LANG3866"),
                            displayPos: "editForm",
                            frameSrc: "html/zc_devices_modal_custom.html?mode=batch&mac={0}&gtemp={1}&mtemp={2}&mid={3}&ip=&status=".format(macList.toString(), curGlobalTemplates.toString(), curModelTemplates.toString(), model.id())
                        });
                    }
                }

                if (!modified) {
                    openCustomizeWindow();
                }
                else {
                    top.dialog.dialogConfirm({
                        confirmStr: $P.lang("LANG3482"),
                        buttons: {
                            ok: function () {
                                // TODO: add save 
                                pageSubmit(function () {
                                    // open customize window after save
                                    openCustomizeWindow();
                                });
                            },
                            cancel: function () {
                                // no save and switch
                                openCustomizeWindow();
                            }
                        }
                    });
                }
            });

            initListBox("model");
            initListBox("global");

            if (mode === "edit") {
                switchPads(true);

                loadPageContents();
            }
            else if (mode === "batch") {
                $("div#info-container").hide();
                $("div#batch-container").show();

                var inMac = mac.split(",");
                var inMid = mid.split(",");

                var options = {};
                var modelDevices = {};

                if (inMac.length === inMid.length) {
                    for (var i = 0; i < inMac.length; i++) {
                        if (!modelDevices[inMid[i]])
                            modelDevices[inMid[i]] = [];

                        modelDevices[inMid[i]].push(inMac[i]);
                    }


                    if (inMid.length === 1) {
                        switchPads(true);
                        currentMac = inMac[0];
                        model = BLL.DataCollection.getModel(inMid[0]);

                        BLL.ConfigPage.updatePageConfig(model.id(), "model", model);
                        BLL.ConfigPage.modelInfo().prepareListData();
                    }
                    else
                        switchPads(false);

                    options.source = modelDevices;
                    options.updateCallback = function (sender) {
                        currentMac = sender.currentMac();
                        model = sender.currentModel();

                        if (sender.totalModels() == 1 && !singleModelMode) {
                            switchPads(true);

                            BLL.ConfigPage.updatePageConfig(model.id(), "model", model);
                            BLL.ConfigPage.modelInfo().prepareListData();

                            // needs to reload page...
                            loadRequiredContents(function () {
                                bindMappings({});
                            });
                        }

                        if (singleModelMode) {
                            triggerModify(true);

                            $("div#previewPrepareMsg").show().html($P.lang("LANG3891^" + currentMac))
                        }
                    }

                    $("div#batch-list").modelDevices(options);

                    loadRequiredContents(function () {
                        bindMappings({});
                    });
                }
                else {
                    top.dialog.clearDialog("*");
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG839")
                    });
                }

            }

            //top.Custom.init(doc);
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

});

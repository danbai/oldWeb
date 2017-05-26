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
    ip = gup.call(window, "ip"),
    mid = gup.call(window, "mid"),
    gtemp = gup.call(window, "gtemp"),
    mtemp = gup.call(window, "mtemp"),
    status = gup.call(window, "status"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    ZEROCONFIG = top.ZEROCONFIG,
    model = {},
    loadedConfigure = null,
    templates = {},
    source = null,
    devmappings = [],
    modified = false,
    fieldIndex = 0;

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
            var modelInfo = model;
            img.onload = function () {
                thumbnail[0].appendChild(img);
                var imageItems = [];
                var imageList = modelInfo.imageMappings();
                for (var name in imageList) {
                    if (imageList.hasOwnProperty(name)) {
                        var newMapItem = {};
                        var imgMap = imageList[name];
                        var regions = imgMap.getRegions();

                        newMapItem.src = modelInfo.resourcePath() + imgMap.getPath();
                        newMapItem.verticalFit = false;
                        newMapItem.map = []
                        for (var rname in regions) {
                            if (regions.hasOwnProperty(rname)) {
                                var region = regions[rname];
                                var link = region.getLink(BLL.ConfigPage.mode());
                                if (link) {
                                    newMapItem.map.push({ "coords": region.toCoords(), "ref": link.getFullPath() });
                                }
                            }
                        }

                        imageItems.push(newMapItem);
                    }
                }

                if (imageItems.length > 0) {
                    var zoom = $("<div/>")
                                .addClass("zoon-glass")
                                .appendTo(thumbnail);

                    zoom.magnificPopup({
                        closeBtnInside: false,
                        items: imageItems,
                        gallery: {
                            enabled: true,
                            navigateByImgClick: false
                        },
                        verticalFit: false,
                        type: "mapimage",
                        callbacks: {
                            mapclick: function (sender) {
                                var $sender = $(sender);
                                var ref;
                                if (ref = $sender.attr("ref")) {
                                    var found = $("[path='" + ref + "']");
                                    if (found.length > 0) {
                                        window.location.hash = ""; // clear existing hash
                                        window.location.hash = "#" + found.attr("id");
                                        $.magnificPopup.close();
                                    }
                                }

                            }
                        }
                    });
                }
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

function pageLoadCallback(result) {
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

        ZEROCONFIG.ValueMonitor.sync();
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

var bindCustomFields = function (data) {
    if (data && data.mac) {
        var currentData = data.mac;

        for (var i = 0; i < currentData.length; i++) {
            var item = currentData[i];

            addField(item.devname, item.value);
        }
    }
    else {
        console.warn("Unable to retrieve the custom fields for this page.");
    }
}

var bindSettings = function (data) {
    var ret = {};

    model = BLL.ConfigPage.modelInfo();

    // TODO: this kind of return data needs to improve!
    if (data && data.body && data.body.view) {
        var currentData = data.body.view;

        // NOTE: it is weird the return data is stored under object.template_id
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
    }
    else {
        console.warn("Unable to retrieve the data for this page.");
    }

    if (model) {
        var using = model.generateFieldList(ret);
        devmappings = using.devmapping;
        source = using.source;
        ZEROCONFIG.valueDelegation.executeRequests(pageLoadCallback);
    }
    else {
        // TODO: add error handling
        console.error("INVALID Model");
    }
}

var loadPageContents = function () {

    var processList = [];
    var processName = [];

    ZEROCONFIG.connector.getZeroConfig(mac, ip).done(function (result) {
        bindPage(result.response);

        processList.push(ZEROCONFIG.connector.getZeroConfigPreview(mac, model.id(), gtemp, mtemp));
        processName.push("Settings");

        processList.push(ZEROCONFIG.connector.getDeviceCustomSettings(mac));
        processName.push("CustomFields");


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
                    else if (processName[i] == "CustomFields") {
                        bindCustomFields(result.response);
                    }
                    else if (processName[i] == "Settings") {
                        bindSettings(result.response);
                    }
                }
            }

        }).fail(function () {
            top.dialog.clearDialog("*");
            console.log("FAIL", arguments);
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG862")
            });
        });
    }).fail(function () {
        console.error("FAIL", arguments);
    });

}



function pageSubmit() {

    var usingMac = [];

    if (mode === "batch")
        usingMac = $("div#batch-list").modelDevices("deviceList");
    else
        usingMac.push(mac);

    // prepare fields
    BLL.PrepareSubmitConfigurations(usingMac, source, function (result) {
        if (result.error.length > 0) {
            //// TODO: come back to display error
            //// display error here
            //for (var i = 0; i < result.error.length; i++) {
            //    console.log(result.error[i]);
            //}
        }
        else {
            top.dialog.dialogMessage({
                type: 'loading',
                content: $P.lang("LANG978")
            });

            var processList = [];
            var processName = [];

            processName.push("delCustom");
            processList.push(ZEROCONFIG.connector.deleteAllDeviceCustomSettings(usingMac));

            processName.push("delFields");
            processList.push(ZEROCONFIG.connector.deleteAllDeviceSettings(usingMac));


            $.when.apply({}, processList).always(function () {

                processList.length = processName.length = 0;

                // load custom fields
                var mainContainer = $("div#fieldContainer");
                var customFields = {
                }

                $("div.row.field", mainContainer).each(function (index, item) {
                    var $item = $(item);
                    var nameField = $("input.name-field", $item).val();
                    var valueField = $("input.value-field", $item).val();

                    if (nameField)
                        customFields[nameField] = valueField;
                });

                var outputCustomFields = {
                    "mac": [],
                    "name": [],
                    "value": []
                }

                for (var name in customFields) {
                    if (customFields.hasOwnProperty(name)) {
                        var usingVal = UCMGUI.urlFunction.escape(customFields[name]);
                        for (var i = 0; i < usingMac.length; i++) {
                            outputCustomFields.mac.push(usingMac[i]);
                            outputCustomFields.name.push(name);
                            outputCustomFields.value.push(usingVal);
                        }
                    }
                }

                if (outputCustomFields.name.length > 0) {
                    processName.push("insertCustom");
                    processList.push(ZEROCONFIG.connector.insertDeviceCustomSettings(outputCustomFields.mac,
                                                                                     outputCustomFields.name,
                                                                                     outputCustomFields.value));
                }

                if (result.update.refId.length > 0) {
                    processName.push("updateFields");
                    processList.push(ZEROCONFIG.connector.insertDeviceSettings(result.update.refId,
                                                                               result.update.elementId,  // this is actually field ids
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
                            console.error("Process error:" + processName[i]);
                            top.dialog.clearDialog("*");
                            var bool = UCMGUI.errorHandler(result, function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            });
                            return;
                        }
                    }

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
                }).fail(function () {
                    top.dialog.clearDialog("*");
                    console.log("FAIL", arguments);
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG862")
                    });
                });
            });
        }
    });
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

function addField(name, value) {
    var id = "custom-field-" + (++fieldIndex);
    var mainContainer = $("<div/>").attr("id", id).addClass("row field");

    var controlContainer = $("<div />")
                            .addClass("cell")
                            .appendTo(mainContainer);
    var nameContainer = $("<div />")
                            .addClass("cell")
                            .appendTo(mainContainer);
    var valueContainer = $("<div />")
                            .addClass("cell")
                            .appendTo(mainContainer);
    var descContainer = $("<div />")
                        .addClass("cell")
                        .appendTo(mainContainer);
    var tooltip = $("<ucm-tooltip/>")
                    .addClass("warning not-remove")
                    .appendTo(descContainer)
                    .hide();

    $("<a/>")
        .addClass("remove")
        .attr("tabIndex", -1)
        .appendTo(controlContainer)
        .on("click", function (e) {
            mainContainer.remove();
        });

    var usingItem = null;
    var possibleLink = $("<a/>")
        .addClass("link")
        .attr("tabIndex", -1)
        .attr("locale", "LANG3510")
        .text($P.lang("LANG3510"))
        .appendTo(tooltip)
        .on("click", function (e) {
            if (usingItem) {
                var expendParent = function (item) {
                    if (item._parent)
                        expendParent(item._parent);
                    else if (item._widget && item._widget.expand) {
                        item._widget.expand();
                    }
                }

                expendParent(usingItem);

                setTimeout(function () {
                    var widget = $('#' + usingItem._uuid);
                    var pos = widget.offset().top - 36;
                    if (pos < 0) pos = 0;
                    if (pos > $(document).height() - $(window).height()) {
                        pos = $(document).height() - $(window).height();
                    }

                    $(document.body).scrollTop(pos);
                    widget.effect("highlight", {}, 500);
                }, 0);
            }
        });


    var verifyName = function (name) {
        var found;
        if ((found = devmappings[name]) && found.length > 0) {
            tooltip.show();
            usingItem = found[0];
            possibleLink.attr("href", "#" + found[0]._uuid);

            var labelValue = usingItem.label.toString();
            if (labelValue.length > 1 && labelValue.lastIndexOf("@", 0) === 0) {
                labelValue = $P.lang(labelValue.substring(1));
            }

            possibleLink.attr("title", labelValue);
        }
        else
            tooltip.hide();
    }

    $("<input/>")
        .attr("id", id + "-name")
        .addClass("name-field")
        .val(name ? name : "")
        .appendTo(nameContainer)
        .on("change", function (e) {
            var $this = $(this);
            var curValue = $this.val();

            verifyName(curValue);
        });

    $("<input/>")
        .attr("id", id + "-value")
        .addClass("value-field")
        .val(value ? value : "")
        .appendTo(valueContainer);

    $("div#fieldContainer").append(mainContainer);

    verifyName(name);
}

$(function () {
    if (mode == "add") {
        // TODO: add error handling
        console.error("ERROR: unsupported mode");
        return;
    }

    if (mode !== "batch") {
        BLL.ConfigPage.updatePageDOM("device-custom", window, document);
    }
    else
        BLL.ConfigPage.updatePageDOM("device-custom-batch", window, document);
    
    $P.lang(doc, true);
    initValidator();

    (function checkReady() {
        if (ZEROCONFIG.isDataReady() == 1) {
            // needs to prepare global list
            BLL.DataCollection.prepareGlobalList();
            ZEROCONFIG.ValueMonitor.init();

            $("#btnAddNewField").on("click", function (e) {
                addField("", "");
            });

            if (mode === "batch")
            {
                $("div#info-container").hide();
                $("div#batch-container").show();

                var inMac = mac.split(",");

                var options = {};
                var modelDevices = {};

                if (mid && inMac.length > 0) {

                    BLL.ConfigPage.updatePageConfig(mid, "model", BLL.DataCollection.getModel(mid), true);
                    if (BLL.ConfigPage.modelInfo())
                    {
                        BLL.ConfigPage.modelInfo().prepareListData();
                    }
                    else
                    {
                        // ERROR
                    }

                    // process list
                    modelDevices[mid] = [];

                    for (var i = 0; i < inMac.length; i++) {
                        modelDevices[mid].push(inMac[i]);
                    }

                    options.source = modelDevices;
                    options.updateCallback = function (sender) {
                        currentMac = sender.firstAvailableDevice();
                    }

                    $("div#batch-list").modelDevices(options);

                    bindSettings({});
                }
                else {
                    top.dialog.clearDialog("*");
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG839")
                    });
                }
            }
            else
            {
                loadPageContents();
            }
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

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
    ZEROCONFIG = top.ZEROCONFIG,
    devmappings = [],
    fieldIndex = 0;

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

    function checkNameExist() {
        var ret = true;
        var name = $("input#templateName").val();
        var modelID = $("select#templateModel").val();

        ZEROCONFIG.connector.getTemplateByName(name, modelID).done(function (data) {
            if (data.status == 0 && data.response.body.length > 0) {
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
                "templateModel": {
                    required: true
                },
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
        item.model = $("select#templateModel").val();
        item.enabled = $("input#templateEnabled").is(':checked') ? 1 : 0;
        item.isDefault = $("input#templateDefault").is(':checked') ? 1 : 0;

        if (mode === "add") {
            ZEROCONFIG.connector.updateTemplate(-1,
                                                item.name,
                                                item.model,
                                                item.desc,
                                                item.enabled,
                                                item.isDefault)
                .done(function (result) {
                    if (result.status == 0) {
                        mWindow.rebuildTable();

                        // this response is super weird...
                        var id = result.response.updateTemplate[0].id;
                        top.dialog.clearDialog("*");
                        top.dialog.dialogInnerhtml({
                            dialogTitle: $P.lang("LANG222").format($P.lang("LANG3455"), item.name),
                            displayPos: "editForm",
                            frameSrc: "html/zc_modeltemplate_modal.html?mode=edit&id={0}".format(id)
                        });

                        //mWindow.$("#item-list", mWindow.document).trigger('reloadGrid');
                    }
                })
                .fail(function () {
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

                    // prepare deleting existing settings
                    processName.push("deleteSettings");
                    processList.push(ZEROCONFIG.connector.deleteAllModelTemplateSettings(templateId));

                    processName.push("deleteCustomSettings");
                    processList.push(ZEROCONFIG.connector.deleteAllModelTemplateCustomSettings(templateId));

                    $.when.apply({}, processList).done(function () {

                        var resultSet = arguments;
                        if (processList.length == 1) {
                            resultSet = [];
                            resultSet.push(arguments);
                        }

                        for (var i = 0; i < processName.length; i++) {
                            var r = resultSet[i][0];
                            if (r.status != 0) {
                                console.error("Process error:" + processName[i]);
                                top.dialog.clearDialog("*");
                                top.dialog.dialogMessage({
                                    type: 'error',
                                    content: $P.lang("LANG862")
                                });
                                return;
                            }
                        }

                        // reset the list
                        processName.length = 0;
                        processList.length = 0;



                        processName.push("item");
                        processList.push(ZEROCONFIG.connector.updateTemplate(templateId,
                                                                             item.name,
                                                                             item.model,
                                                                             item.desc,
                                                                             item.enabled,
                                                                             item.isDefault));

                        // [AH] START custom fields
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
                            "refid": [],
                            "name": [],
                            "value": []
                        }

                        for (var name in customFields) {
                            if (customFields.hasOwnProperty(name)) {
                                var usingVal = UCMGUI.urlFunction.escape(customFields[name]);
                                outputCustomFields.refid.push(templateId);
                                outputCustomFields.name.push(name);
                                outputCustomFields.value.push(usingVal);
                            }
                        }

                        if (outputCustomFields.name.length > 0) {
                            processName.push("insertCustom");
                            processList.push(ZEROCONFIG.connector.updateModelTemplateCustomSettings(outputCustomFields.refid,
                                                                                                    outputCustomFields.name,
                                                                                                    outputCustomFields.value));
                        }
                        // [AH] END custom fields

                        if (result.update.refId.length > 0) {
                            processName.push("update");
                            processList.push(ZEROCONFIG.connector.updateModelTemplateSettings(result.update.refId,
                                                                                              result.update.elementId,  // this is actually field ids
                                                                                              result.update.entityName,
                                                                                              result.update.value));
                        }

                        // process
                        $.when.apply({}, processList).done(function () {

                            var resultSet = arguments;
                            if (processList.length == 1) {
                                resultSet = [];
                                resultSet.push(arguments);
                            }

                            for (var i = 0; i < processName.length; i++) {
                                var r = resultSet[i][0];
                                if (r.status != 0) {
                                    console.error("Process error:" + processName[i]);
                                    top.dialog.clearDialog("*");
                                    var bool = UCMGUI.errorHandler(r, function() {
                                        top.dialog.container.show();
                                        top.dialog.shadeDiv.show();
                                    });
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
                            top.dialog.clearDialog("*");
                            top.dialog.dialogMessage({
                                type: 'error',
                                content: $P.lang("LANG862")
                            });
                            console.warn("FAIL", arguments);
                        });

                    }).fail(function () {
                        top.dialog.clearDialog("*");
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG862")
                        });
                        console.warn("FAIL", arguments);
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

    var bindPage = function (data) {
        // TODO: this kind of return data needs to improve!
        if (data && data.id && data.id.length > 0) {
            var item = data.id[0];
            $("input#templateName").val(item.name);
            $("input#templateDesc").val(item.description);
            $("select#templateModel").val(item.model_id).attr("disabled", "disabled");
            if (item.enabled)
                $("input#templateEnabled").attr("checked", "checked");
            else
                $("input#templateEnabled").removeAttr("checked");
            if (item.is_default)
                $("input#templateDefault").attr("checked", "checked");
            else
                $("input#templateDefault").removeAttr("checked");

            BLL.ConfigPage.updatePageConfig(item.model_id, "template", item);
            if (BLL.ConfigPage.modelInfo())
                BLL.ConfigPage.modelInfo().prepareListData();

            // this function when calling after value is set perform weird
            top.Custom.init(doc);
            $("div#selecttemplateModel.divSelect span.modelSpanDes").css("width", "");
            //top.Custom.choose($("select#templateModel")[0]);
            //top.Custom.select_disable($("select#templateModel")[0]);
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
                var key = item.field_id;
                if (!ret[key]) {
                    ret[key] = { "values": {}, "originName": "", "originType": "" };
                }

                ret[key].values[item.entity_name] = item.value;
            }
        }
        else {
            console.warn("Unable to retrieve the data for this page.");
        }

        var model = BLL.ConfigPage.modelInfo();
        if (model) {
            var using = model.generateFieldList(ret);
            devmappings = using.devmapping;
            source = using.source;

            ZEROCONFIG.valueDelegation.executeRequests(pageLoadCallback);

            bindModelThumbnail(model);
        }
        else {
            // TODO: add error handling
            console.error("INVALID Model");
        }

    }


    var loadPageContents = function () {

        var processList = [];
        var processName = [];

        processList.push(ZEROCONFIG.connector.getTemplate(templateId));
        processName.push("Item");

        processList.push(ZEROCONFIG.connector.getModelTemplateSettings(templateId));
        processName.push("Settings");

        processList.push(ZEROCONFIG.connector.getModelTemplateCustomSettings(templateId));
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
                    top.dialog.clearDialog("*");
                    top.dialog.dialogMessage({
                        type: 'error',
                        content: $P.lang("LANG853")
                    });
                    console.error("Fail to load data", result);
                    return;
                }
                else {
                    if (processName[i] == "Item") {
                        bindPage(result.response);
                    }
                    else if (processName[i] == "Settings") {
                        bindSettings(result.response);
                    }
                    else if (processName[i] == "CustomFields") {
                        bindCustomFields(result.response);
                    }
                }
            }

        }).fail(function () {
            top.dialog.clearDialog("*");
            top.dialog.dialogMessage({
                type: 'error',
                content: $P.lang("LANG862")
            });
            console.warn("FAIL", arguments);
        });
    }

    function bindModelThumbnail(model) {
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
            thumbnail.append($("<img/>").attr("src", "../images/empty.png").addClass("thumbnail"));
        }
        img.className = "thumbnail";
        if (model)
            img.src = model.resourcePath() + model.thumbnail();
        else
            img.src = "../images/empty.png";
    }

    $(document).ready(function () {
        if (mode === "edit") {
            $("div#preparePad").css("height", "600px");
        }
        else {
            $("button#save").attr("locale", "LANG3446");
        }
        BLL.ConfigPage.resetStatus();
        BLL.ConfigPage.updatePageDOM("model-template", window, document);

        $P.lang(doc, true);
        initValidator();

        (function checkReady() {
            if (ZEROCONFIG.isDataReady() == 1) {
                // needs to prepare global list
                BLL.DataCollection.prepareGlobalList();
                ZEROCONFIG.ValueMonitor.init();

                // init add button event handler
                $("#btnAddNewField").on("click", function (e) {
                    addField("", "");
                });

                var models = BLL.DataCollection.generateBasicModelList();
                var modelSelect = $("select#templateModel");
                // insert empty model
                modelSelect.append($("<option/>").val("").text(""));
                modelSelect.on("change", function (e) {
                    var val = $(this).val();

                    bindModelThumbnail(BLL.DataCollection.getModel(val));
                });

                // bind models to the list
                $.each(models, function (idx, item) {
                    modelSelect.append($("<option/>").val(item.id).html((item.vendor + " " + item.name).toUpperCase()));
                });

                // this function when calling after value is set perform weird
                top.Custom.init(doc);
                //top.Custom.init(doc, $("select#templateModel")[0]);
                $("div#selecttemplateModel.divSelect span.modelSpanDes").css("width", "");

                if (mode === "add") {
                    $("div#preparePad").hide();
                    $("div#contentPad").show();
                }
                else if (mode == 'edit') {
                    $("div#optionPad").show();
                    // loading page content is needed only for edit mode
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

    var bindCustomFields = function (data) {
        if (data && data.template_id) {
            var currentData = data.template_id;

            for (var i = 0; i < currentData.length; i++) {
                var item = currentData[i];

                addField(item.devname, item.value);
            }
        }
        else {
            console.warn("Unable to retrieve the custom fields for this page.");
        }
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
                        if (widget.length > 0)
                        {
                            var pos = widget.offset().top - 36;
                            if (pos < 0) pos = 0;
                            if (pos > $(document).height() - $(window).height()) {
                                pos = $(document).height() - $(window).height();
                            }

                            $(document.body).scrollTop(pos);
                            widget.effect("highlight", {}, 500);
                        }
                        else
                        {
                            naviBox.navibox("addItemByUUID", usingItem._uuid);
                        }
                    }, 0);
                }
            });


        var verifyName = function (name) {
            var found;
            if ((found = devmappings[name]) && found.length > 0 && $('#' + found[0]._uuid).length > 0) {
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

});

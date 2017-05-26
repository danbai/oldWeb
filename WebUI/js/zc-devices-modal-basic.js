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
    status = gup.call(window, "status"),
    mid = gup.call(window, "mid"),
    mWindow = top.frames['frameContainer'].frames['mainScreen'],
    ZEROCONFIG = top.ZEROCONFIG,
    models = {},
    loadedModelID = -1,
    loadedConfigure = null,
    source = null,
    currentMac = mac,
    optionTimer = null;

String.prototype.format = top.String.prototype.format;
Array.prototype.isArray = top.Array.prototype.isArray;

function checkMacIsExsit() {
    if (mode && mode == 'add') {
        var newMac = $("input#deviceMac").val().toLowerCase();
        var macListArr = mWindow.macListArr;
        return !UCMGUI.inArray(newMac, macListArr);
    }
    return true;
}

//function differentAccount(value, element) {
//    var accountSelects = $('#edit_ext').find('select'),
//        different = true,
//        account = value;

//    accountSelects.each(function () {
//        if ($(this).is(element)) {
//            different = true;
//            return false;
//        }

//        if (($(this).val() == account) && account) {
//            different = false;
//            return false;
//        }
//    });

//    return different;
//}

var bindPage = function (data) {
    // TODO: this kind of return data needs to improve!
    if (data && !$.isEmptyObject(data.zc_devices)) {
        var item = data.zc_devices;
        item.mac = mac;

        var modelId = -1;
        for (var i = 0; i < models.length; i++) {
            if (models[i].vendor.toLowerCase() == item.vendor.toLowerCase() &&
                models[i].name.toLowerCase() == item.model.toLowerCase()) {
                modelId = models[i].id;
                break;
            }
        }

        $("input#deviceMac").val(item.mac).attr("disabled", "disabled");
        $("input#deviceIp").val(item.ip);
        $("input#deviceVersion").val(item.version).attr("disabled", "disabled");
        // does not allow modify....? Is there any reasonable need to modify this value?

        if (modelId == -1) {
            $("#loading-pad").hide();
            $("#empty-pad").show();
        } else {
            $("#empty-pad").hide();
            $("select#deviceModel").val(modelId).attr("disabled", "disabled");
            loadedModelID = modelId;
        }


        BLL.ConfigPage.updatePageConfig(modelId, "device", item, true);
        if (BLL.ConfigPage.modelInfo())
            BLL.ConfigPage.modelInfo().prepareListData();

        top.Custom.init(doc);
        $("div#selectdeviceModel.divSelect span.modelSpanDes").css("width", "");
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

var bindSettings = function (data) {
    var ret = {};
    // TODO: this kind of return data needs to improve!
    if (data && data.mac) {
        var currentData = data.mac;

        // NOTE: it is weird the return data is stored under object.template_id
        for (var i = 0; i < currentData.length; i++) {
            var item = currentData[i];
            var key = item.element_id + "#" + item.element_number;
            if (!ret[key]) {
                ret[key] = {
                    "values": {},
                    "originName": "",
                    "originType": ""
                };
            }

            ret[key].values[item.entity_name] = item.value;
        }
    } else {
        console.warn("Unable to retrieve the data for this page.");
    }

    bindBasicOptions(ret, function () {
        $("div#preparePad").hide();
        $("div#contentPad").show();
    });
}

var loadPageContents = function () {

    var processList = [];
    var processName = [];

    processList.push(ZEROCONFIG.connector.getZeroConfig(mac, ip));
    processName.push("Item");

    processList.push(ZEROCONFIG.connector.getDeviceTypeSettings(mac));
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
            } else {
                if (processName[i] == "Item") {
                    bindPage(result.response);
                } else if (processName[i] == "Settings") {
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
}

function initValidator() {
    if ($("#form").tooltip) {
        $("#form").tooltip();
    }

    $P("#form", doc).validate({
        rules: {
            "deviceModel": {
                required: true
            },
            "deviceMac": {
                required: true,
                mac: true,
                customCallback: [$P.lang("LANG2134"), checkMacIsExsit]
            },
            "deviceIp": {
                ipDns: ["ip"]
            },
            "deviceVersion": {
                versionNum: true
            }
        },
        submitHandler: function () {
            if (!$("#loading-pad").is(":visible")) {
                pageSubmit();
            }
        }
    });
}


function pageSubmit(callback) {


    var doSave = function () {
        var action = {};

        action["action"] = (mode == 'edit' ? "updateZeroConfig" : "addZeroConfig");
        action["mac"] = $("input#deviceMac").val().toUpperCase();

        //if (mode == 'edit') {
        //    action["original_ip"] = ip && ip != "null" ? ip : "";
        //}

        action["ip"] = $('input#deviceIp').val();
        action["version"] = $('input#deviceVersion').val();


        var modelId = $("select#deviceModel").val();
        var modelName = "";
        var vendorName = "";
        for (var i = 0; i < models.length; i++) {
            if (models[i].id == modelId) {
                vendorName = models[i].vendor;
                modelName = models[i].name;
                break;
            }
        }
        action["vendor"] = vendorName;
        action["model"] = modelName;

        // TODO: ??? what do status 6, 7 and 8 mean???
        if (status && (status == 6 || status == 7) && mode == 'edit') {
            action["state"] = 8;
        }

        return $.ajax({
            type: "post",
            url: "../cgi",
            data: action
        });
    };

    var upgrade = function () {

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
    };

    var usingMac;
    var keepExtensions = false;
    if (mode === "batch")
    {
        usingMac = $("div#batch-list").modelDevices("deviceList");
        keepExtensions = [];
        for (var i = 0; i < usingMac.length; i++)
            keepExtensions[i] = true;
    }
    else
    {
        usingMac = $("input#deviceMac").val().toUpperCase();
        keepExtensions = false;
    }


    BLL.PrepareSubmitConfigurations(usingMac, source, function (result) {
        if (result.error.length > 0) {
            //// TODO: come back to display error
            //// display error here
            //for (var i = 0; i < result.error.length; i++) {
            //    console.error(result.error[i]);
            //}
        } else {
            var upd = result.update.refId.length > 0;
            var processAdd = function () {
                var processList = [];
                var processName = [];

                top.dialog.dialogMessage({
                    type: 'loading',
                    content: $P.lang("LANG978")
                });

                if (mode !== "batch") {
                    processName.push("item");
                    processList.push(doSave());
                }


                if (upd) {
                    processName.push("insert");
                    processList.push(ZEROCONFIG.connector.insertDeviceTypeSettings(result.update.refId,
                        result.update.elementId, // this is actually field ids
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
                            console.error("Process error:" + processName[i]);
                            var bool = UCMGUI.errorHandler(result, function() {
                                top.dialog.container.show();
                                top.dialog.shadeDiv.show();
                            });
                            return;
                        }
                    }

                    //top.dialog.clearDialog();
                    top.dialog.dialogMessage({
                        type: 'success',
                        content: $P.lang("LANG873")
                    });

                    var DO_RELOAD = function () { // DO_RELOAD();
                        mWindow.processReloadTable();

                        if (status && (status == 6 || status == 7) && mode == 'edit') {
                            upgrade();
                        }
                        else
                            top.dialog.clearDialog("*");

                        //mWindow.$("#zc_devices_list", mWindow.document).trigger('reloadGrid');

                        // Load required variables
                        //reloadVariables(); // FIXME [AH] is this really needed?
                    };

                    if (typeof callback === "function") {
                        callback.call(self);
                    }
                    else {
                        setTimeout(DO_RELOAD, 1000);
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

            var processUpdate = function () {
                if (mode !== "add") {
                    // using original mac address to remove
                    ZEROCONFIG.connector.deleteAllDeviceTypeSettings(usingMac, keepExtensions).done(processAdd).fail(function () {
                        top.dialog.clearDialog("*");
                        console.log("FAIL", arguments);
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG862")
                        });
                    });
                } else {
                    processAdd();
                }
            }

            if (upd) {
                ZEROCONFIG.connector.checkDeviceTypeSettings(result.update.refId,
                    result.update.elementId, // this is actually field ids
                    result.update.elementNum,
                    result.update.entityName,
                    result.update.value).done(function (data){
                    var response = data.response;
                    if (data.status != 0) {
                        top.dialog.clearDialog("*");
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG862")
                        });
                        return;
                    }
                    else if (response.listUnavailableSIPAccount !== undefined && response.listUnavailableSIPAccount.length > 0) {
                        var extList = "";
                        for (var i = 0; i < response.listUnavailableSIPAccount.length; i++) {
                          extList += " " + response.listUnavailableSIPAccount[i].extension;
                        }
                        top.dialog.clearDialog("*");
                        top.dialog.dialogMessage({
                            type: 'error',
                            content: $P.lang("LANG862") + $P.lang("LANG4832").format(extList)
                        });
                        return;
                    }
                    else {
                        processUpdate();
                    }
                });
            }
            else {
                processUpdate();
            }
        }
    });

}

function bindBasicOptions(data, callback) {
    var self = this;
    var model = null;
    var modelSelect = $("select#deviceModel");
    var id = modelSelect.val();
    var container = $("div#content-pad");
    container.empty();

    for (var i = 0; i < models.length; i++) {
        if (models[i].id == id) {
            model = models[i];
            break;
        }
    }

    if (model) {
        BLL.ConfigPage.updatePageConfig(id, "model", model, true);
        BLL.ConfigPage.modelInfo().prepareListData();

        source = BLL.DataCollection.generateTypeBlockList(model.modelType, data);

        ZEROCONFIG.valueDelegation.executeRequests(function (result) {
            var timers = new SimpleTimer();
            for (var i = 0; i < source.length; i++) {
                timers.add((function (idx) {
                    return function () {
                        var subGroup = $("<div/>").fieldSubGroup({
                            "item": function () {
                                return source[idx];
                            },
                            "deferred": timers,
                            "mode": "all"
                        });

                        subGroup.appendTo(container);
                    }
                })(i));
            }

            timers.start(function () {
                if (mode === "edit" && loadedModelID > -1) {
                    $("ul#menu li#menu-advanced").show();
                }

                $("#loading-pad").hide();
                if (source)
                    container.show();

                if (typeof callback === "function")
                    callback.call(self);

                // we need to prevent the use of ENTER as submit on input and select fields
                $("input,select", document).keypress(function (event) {
                    return event.keyCode != 13;
                });

                ZEROCONFIG.ValueMonitor.sync();
            });
        });

        var modelInfo = BLL.ConfigPage.modelInfo();
        var thumbnail = $("div.thumbnail");
        thumbnail.empty();
        var img = new Image();
        img.onload = function () {
            thumbnail[0].appendChild(img);

            var imageItems = [];
            var imageList = modelInfo.imageMappings();
            for (var name in imageList) {
                if (imageList.hasOwnProperty(name))
                {
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
                            if (link)
                            {
                                newMapItem.map.push({ "coords": region.toCoords(),  "ref": link.getFullPath() });
                            }
                        }
                    }

                    imageItems.push(newMapItem);
                }
            }

            if (imageItems.length > 0)
            {
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
                                    $.magnificPopup.close();
                                    //$('html, body').scrollTop(found.offset().top);
                                    window.location.hash = ""; // clear existing hash
                                    window.location.hash = "#" + found.attr("id");
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
        img.src = modelInfo.resourcePath() + modelInfo.thumbnail();
    } else {
        $("ul#menu li#menu-advanced").hide();
        $("#loading-pad").hide();
        $("#empty-pad").show();
        if (typeof callback === "function")
            callback.call(this);
    }
}

function bindModels() {
    models = BLL.DataCollection.generateBasicModelList();

    var modelSelect = $("select#deviceModel");

    var basicOptionBoundCallback = function () {
        modelSelect.removeAttr("disabled");
    }

    modelSelect.on("change", function (e) {
        if (!optionTimer) {
            $("#empty-pad").hide();
            $("#content-pad").hide();
            $("#loading-pad").show();
        } else
            clearTimeout(optionTimer);

        optionTimer = setTimeout(function () {
            modelSelect.attr("disabled", "disabled");
            bindBasicOptions(loadedConfigure, basicOptionBoundCallback);
            optionTimer = null;
        }, 1000);
    });

    // insert empty model
    modelSelect.append($("<option/>").val("").text(""));

    // bind models to the list
    $.each(models, function (idx, item) {
        modelSelect.append($("<option/>").val(item.id).html((item.vendor + " " + item.name).toUpperCase()));
    });
}

$(function () {
    if (mode == "add")
        $("button#save").attr("locale", "LANG754");

    if (mode != "batch") {
        BLL.ConfigPage.updatePageDOM("device-basic", window, document);
    }
    else
        BLL.ConfigPage.updatePageDOM("device-basic-batch", window, document);

    $P.lang(doc, true);
    initValidator();
    if (top.UCMGUI.config.msie && !(top.UCMGUI.config.ie9 || top.UCMGUI.config.ie8)) {
        $(document).find("input:visible, textarea:visible").not(":disabled").eq(0).focus().blur();
    }
    (function checkReady() {
        if (ZEROCONFIG.isDataReady() == 1) {

            BLL.DataCollection.prepareGlobalList();
            ZEROCONFIG.ValueMonitor.init();

            // handle menu logic
            $("ul#menu li#menu-basic").addClass("sel");
            $("ul#menu li#menu-advanced a").on("click", function (e) {
                var openWindow = function () {
                    if (mode !== "batch") {
                        top.dialog.clearDialog("*");
                        top.dialog.dialogInnerhtml({
                            dialogTitle: $P.lang("LANG222").format($P.lang("LANG1287"), mac),
                            displayPos: "editForm",
                            frameSrc: "html/zc_devices_modal_advanced.html?mode=edit&mac={0}&ip={1}&status={2}".format(mac, ip, status)
                        });
                    }
                    else {
                        var macList = $("div#batch-list").modelDevices("deviceList");
                        var midList = [];
                        for (var i = 0; i < macList.length; i++)
                        {
                            midList.push(loadedModelID);
                        }

                        top.dialog.clearDialog("*");
                        top.dialog.dialogInnerhtml({
                            dialogTitle: $P.lang("LANG3866"),
                            displayPos: "editForm",
                            frameSrc: "html/zc_devices_modal_advanced.html?mode=batch&mac={0}&mid={1}&ip=&status=".format(macList.toString(), midList.toString())
                        });
                    }
                }

                if (!BLL.ConfigPage.pageModified()) {
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

            bindModels();

            top.Custom.init(doc);
            $("div#selectdeviceModel.divSelect span.modelSpanDes").css("width", "");

            if (mode === "add") {
                // when add, no advanced option will be available
                $("ul#menu li#menu-advanced").hide();
                //// switch panels
                $("div#preparePad").hide();
                $("div#contentPad").show();
            } else if (mode == 'edit') {
                loadPageContents();
            }
            else if (mode == "batch") {
                $("div#info-container").hide();
                $("div#batch-container").show();

                var inMac = mac.split(",");

                var options = {};
                var modelDevices = {};

                if (mid && inMac.length > 0) {
                    $("#empty-pad").hide();
                    $("select#deviceModel").val(mid).attr("disabled", "disabled");
                    loadedModelID = mid;

                    BLL.ConfigPage.updatePageConfig(mid, "model", BLL.DataCollection.getModel(mid), true);
                    if (BLL.ConfigPage.modelInfo())
                        BLL.ConfigPage.modelInfo().prepareListData();

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

                    bindBasicOptions({}, function () {
                        $("div#preparePad").hide();
                        $("div#contentPad").show();
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
        } else {
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

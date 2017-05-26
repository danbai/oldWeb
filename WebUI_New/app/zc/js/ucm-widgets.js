(function ($) {
    var BLL = top.zc;
    var ZEROCONFIG = top.ZEROCONFIG;
    var LOCALE = {
        "addOption": "@LANG3539",
        "showItems": "@LANG3537",
        "emptyContainer": "@LANG2824",
        "showMoreItems": "@LANG3538",
        "loading": "@LANG904",
        "resetToDefault": "@LANG3509",
        "protected": "@LANG3540",
        "noMatchOption": "@LANG3541"
    }

    if (!BLL)
        console.error("ERROR: Business Logic Layer is required");

    BLL.WidgetFactory.prepareDocumentWidgets(document);

    if (!String.prototype.format) {
        if (top.String.prototype.format)
            String.prototype.format = top.String.prototype.format;
        else
            String.prototype.format = function (str) {
                var args = arguments;
                return this.replace(/{(\d+)}/g, function(match, number) {
                    return typeof args[number] != 'undefined' ? args[number] : match;
                });
            }
    }


    Number.prototype.pad = function (size) {
        var s = String(this);
        if (typeof (size) !== "number") { size = 2; }

        while (s.length < size) { s = "0" + s; }
        return s;
    }

    // register required functions
    var typeOracle = undefined;
    if (BLL.TypeOracle && typeof BLL.TypeOracle.findType === "function") {
        typeOracle = BLL.TypeOracle.findType;
    }
    else
        typeOracle = function (type) {
            console.warn("!WARING! calling missing type oracle function for:" + type);
            return undefined;
        };

    var translate = undefined;
    var createLabel = undefined;
    if (typeof $.lang === "function")
        translate = $.lang;
    else if (typeof $P === "function" && typeof $P.lang === "function")
        translate = $P.lang;
    else
        translate = function (req) {
            console.warn("!WARING! calling missing lang function for:" + req);
            return req;
        };

    if (typeof $.createGLabel === "function")
        createLabel = $.lang;
    else if (typeof $P === "function" && typeof $P.createGLabel === "function")
        createLabel = $P.createGLabel;
    else
        createLabel = function (req) {
            console.warn("!WARING! calling create label function");
            return req;
        };

    // shared functions
    var _waitForJump = null;
    function jumpHash(id) {
        if (_waitForJump)
            clearTimeout(_waitForJump);
        _waitForJump = setTimeout(function () {
            var item = $('#' + id);
            var done = false;
            if (item.length == 0)
                return;
            var pos = $('#' + id).offset().top - 30;
            var viewPointH = $(document).height() - $(window).height();
            var viewPointS = $(window).scrollTop();

            if (pos < 0) pos = 0;
            if (pos > viewPointH) pos = viewPointH;

            var hlEffect = function (e) {
                if (!done) {
                    $("#" + id).effect("highlight", {}, 500);
                    done = true;
                }
            }

            if (pos == viewPointS)
                hlEffect();
            else {
                $("body, html").animate({
                    scrollTop: pos
                }, 1000, "swing", hlEffect);
            }
            //$(document.body).scrollTop(pos);
        }, 50);
    }
    function highlightText(text, node) {
        if (text === "" || typeof (node) !== "object")
            return;

        var searchText = $.trim(text).toLowerCase(), currentNode = node.get(0).firstChild, matchIndex, newTextNode, newSpanNode;
        while ((matchIndex = currentNode.data.toLowerCase().indexOf(searchText)) >= 0) {
            newTextNode = currentNode.splitText(matchIndex);
            currentNode = newTextNode.splitText(searchText.length);
            newSpanNode = document.createElement("span");
            newSpanNode.className = "highlight";
            currentNode.parentNode.insertBefore(newSpanNode, currentNode);
            newSpanNode.appendChild(newTextNode);
        }
    }

    function createGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function sortByElementName(a, b) {
        var aVal = a.getAttribute("itemid");
        var bVal = b.getAttribute("itemid");
        if (aVal && bVal) {
            return aVal > bVal ? 1 : -1;
        }
        else if (aVal)
            return 1;
        else
            return -1;
    }

    function prepareLocalizedLabel(element, label, asTitle) {
        var labelValue = label.toString();
        element = $(element);

        if (labelValue.length > 1 && labelValue.lastIndexOf("@", 0) === 0) {
            labelValue = labelValue.substring(1);
            if (!asTitle) {
                element.attr("locale", labelValue);
                element.text(translate(labelValue));
            }
            else {
                element.attr("localeTitle", labelValue);
                element.attr("title", translate(labelValue));
            }
            return;
        }

        if (!asTitle)
            element.text(labelValue);
        else
            element.attr("title", labelValue)
    }

    function testVisibleCondition(item) {
        if (typeof item.visibility === "function") {
            return item.visibility();
        }

        return true;
    }

    // [AH] NOTE: there are some overhead on each compare which is something
    // needs to be improved in the future
    function testLocalizedString(matcher, label) {
        var labelValue = label.toString();

        if (labelValue.length > 1 && labelValue.lastIndexOf("@", 0) === 0) {
            return matcher.test(translate(labelValue.substring(1)));
        }

        return matcher.test(labelValue);
    }

    // const variables
    var THUMBNAIL_CELL_WIDTH = 150;
    var MD_SLIDE_HEIGHT = 150;
    var MD_SLIDE_PADDING = 1;
    // for model device list
    $.widget("ucm.modelDevices", {
        options: {
            source: [],
            width: 700,
            updateCallback: null
        },
        // intend to be private
        _: {
            mainContainer: null,
            itemContainer: null,
            currentIndex: -1,
            currentMac: "",
            items: []
        },
        // override jQuery UI methods
        _create: function () {
            var self = this;

            self._.wrapper = $("<div/>")
                                .addClass("ucm-model-devices")
                                .insertAfter(self.element);

            self.element.hide();

            self._bindWidget();
        },
        _rebuildWidgets: function () {
            var self = this;

            var itemLen = self._.items.length;
            var itemWidth = self.options.width;
            var contentWidth = itemWidth - THUMBNAIL_CELL_WIDTH;
            if (itemLen > 2) {
                itemWidth -= THUMBNAIL_CELL_WIDTH;
                contentWidth -= THUMBNAIL_CELL_WIDTH;
            }
            else if (itemLen > 1) {
                itemWidth -= THUMBNAIL_CELL_WIDTH / 2;
                contentWidth -= THUMBNAIL_CELL_WIDTH / 2;
            }
            else if (itemLen === 1) {
                var lastModel = self._.items[0];
                if (lastModel.items.length === 1) {
                    // now only have one widget left, we should disable the delete
                    var foundControl = $("div[mac='" + lastModel.items[0] + "']", lastModel.deviceContainer);

                    if (foundControl.length)
                        foundControl.remove();
                }
            }

            $.each(self._.items, function (index, item) {
                item.index = index;
                item.containerWidth = itemWidth;
                item.contentWidth = contentWidth;
                item.modelWidget.css("width", Number(itemWidth) + 2);
                item.cellContents.css("width", contentWidth);
            });

            self.switchModel(self._.currentIndex);
        },
        _bindWidget: function () {
            var self = this;

            var usingSource = self.options.source;
            var source = {};
            var idx = 0;
            self._.items = []
            self._.wrapper.empty();

            self._.mainContainer = $("<div/>")
                .addClass("ucm-unslider")
                .css({
                    "width": Number(self.options.width) + 2,
                    "height": MD_SLIDE_HEIGHT,
                })
                .appendTo(self._.wrapper);

            self._.itemContainer = $("<div/>")
                .attr("wid", "slides")
                .css({
                    "position": "absolute",
                    "left": "0",
                    "height": MD_SLIDE_HEIGHT,
                    "width": Number(self.options.width) + 2,
                    "overflow": "hidden",
                    "z-index": 0
                })
                .appendTo(self._.mainContainer);


            if (typeof usingSource === "object") {
                for (name in usingSource) {
                    if (usingSource.hasOwnProperty(name)) {
                        var model = BLL.DataCollection.getModel(name);
                        if (model) {
                            var current = {};

                            current.index = idx++;
                            current.model = model;
                            current.modelWidget = $("<div/>")
                                                    .addClass("item")
                                                    .css({
                                                        "position": "absolute",
                                                        "height": MD_SLIDE_HEIGHT - 2,
                                                        "top": 0,
                                                        "left": 0 - self.options.width,
                                                        "overflow": "hidden",
                                                        "z-index": 0
                                                    })
                                                    .attr("model", name)
                                                    .appendTo(self._.itemContainer);
                            current.modelContainer = $("<div/>")
                                                    .addClass("model-container")
                                                    .appendTo(current.modelWidget);
                            current.cellThumbnail = $("<div/>")
                                                    .addClass("cell thumbnail")
                                                    .css("width", THUMBNAIL_CELL_WIDTH)
                                                    .appendTo(current.modelContainer);
                            current.thumbnailHolder = $("<div/>")
                                                        .addClass("t-holder")
                                                        .appendTo(current.cellThumbnail);

                            current.cellContents = $("<div/>")
                                                    .addClass("cell contents")
                                                    .appendTo(current.modelContainer);


                            function appendGlass(obj) {
                                obj.controlGlass = $("<div/>")
                                                   .addClass("nav-glass")
                                                   .hide()
                                                   .attr("title", obj.model.vendor() + " " + obj.model.name())
                                                   .appendTo(obj.cellThumbnail)
                                                   .on("click", function (e) {
                                                       self.switchModel(obj.index);
                                                   });
                            }

                            var thumbnail = new Image();
                            thumbnail.onload = (function (obj) {
                                return function () {
                                    if (obj.thumbnailHolder.parents("html").length == 0)
                                        obj.thumbnailHolder.appendTo(obj.cellThumbnail);
                                    this.className = "thumbnail";
                                    var img = $(this);
                                    obj.thumbnailHolder.append(img);
                                    appendGlass(obj);
                                }
                            })(current);

                            thumbnail.onerror = (function (obj) {
                                return function () {
                                    if (obj.thumbnailHolder.parents("html").length == 0)
                                        obj.thumbnailHolder.appendTo(obj.cellThumbnail);

                                    obj.thumbnailHolder.append($("<img/>").attr("src", "../images/empty.png").addClass("thumbnail"));
                                    appendGlass(obj);
                                }
                            })(current);

                            thumbnail.src = model.resourcePath() + model.thumbnail();

                            $("<div/>")
                                .addClass("title")
                                .text(model.vendor().toUpperCase() + " " + model.name().toUpperCase())
                                .appendTo(current.cellContents);

                            current.deviceContainer = $("<div/>")
                                                        .addClass("devices")
                                                        .css("height", MD_SLIDE_HEIGHT - (14 * 2))
                                                        .appendTo(current.cellContents);

                            current.items = usingSource[name].slice(0);


                            $.each(current.items, function (idx, mac) {

                                var workingItem = {};
                                workingItem.mac = mac;
                                workingItem.devContainer = $("<div/>")
                                                    .addClass("device")
                                                    .attr("id", "device-" + mac)
                                                    .on("click", (function (obj, item) {
                                                        return function (e) {
                                                            $("div.device", obj.deviceContainer).removeClass("sel");

                                                            item.devContainer.addClass("sel");
                                                            if (self._.currentMac != item.mac) {
                                                                self._.currentMac = item.mac;

                                                                if (typeof self.options.updateCallback === "function") {
                                                                    self.options.updateCallback.call({}, self);
                                                                }
                                                            }
                                                        };
                                                    })(current, workingItem))
                                                    .appendTo(current.deviceContainer);
                                workingItem.devItemHolder = $("<span/>")
                                                    .addClass("holder")
                                                    .appendTo(workingItem.devContainer);
                                workingItem.devName = $("<div/>")
                                                    .addClass("name")
                                                    .text(mac)
                                                    .appendTo(workingItem.devItemHolder);
                                workingItem.devCtrl = $("<div/>")
                                                    .addClass("control")
                                                    .attr("mac", mac)
                                                    .appendTo(workingItem.devItemHolder)
                                                    .on("click", (function (obj, item) {
                                                        return function (e) {
                                                            var found = obj.items.indexOf(item.mac);
                                                            if (found > -1) {
                                                                workingItem.devContainer.remove();

                                                                obj.items.splice(found, 1);

                                                                if (obj.items.length === 0) {
                                                                    obj.modelWidget.remove();
                                                                    self._.items.splice(obj.index, 1);

                                                                    self._rebuildWidgets();
                                                                }
                                                                else if (self._.items.length === 1 && obj.items.length === 1) {
                                                                    self._rebuildWidgets();
                                                                }

                                                            }

                                                        };
                                                    })(current, workingItem));
                            });

                            self._.items.push(current);

                        }
                    }
                }
            }


            var modelItems = self._.items;

            var itemLen = modelItems.length;
            if (itemLen > 0) {
                self._.itemContainer.css("width", self.options.width * modelItems.length + 2);

                var itemWidth = self.options.width;
                var contentWidth = itemWidth - THUMBNAIL_CELL_WIDTH;
                if (itemLen > 2) {
                    itemWidth -= THUMBNAIL_CELL_WIDTH;
                    contentWidth -= THUMBNAIL_CELL_WIDTH;
                }
                else if (itemLen > 1) {
                    itemWidth -= THUMBNAIL_CELL_WIDTH / 2;
                    contentWidth -= THUMBNAIL_CELL_WIDTH / 2;
                }


                $.each(modelItems, function (index, item) {
                    item.containerWidth = itemWidth;
                    item.contentWidth = contentWidth;
                    item.modelWidget.css("width", Number(itemWidth) + 2);
                    item.cellContents.css("width", contentWidth);

                });
            }

            (function checkReady() {

                var ready = true;

                $.each(self._.items, function (index, item) {
                    if (!item.controlGlass) {
                        ready = false;
                        return false;
                    }
                });

                if (ready) {
                    self.switchModel(0);
                }
                else {
                    setTimeout(checkReady, 500);
                }
            })();


            //self._.mainContainer.unslider({
            //    autoplay: false,
            //    fluid: true,
            //    dots: true
            //});

        },
        _setOption: function (key, value) {
            this._super(key, value);
        },
        _setOptions: function (options) {
            var self = this;

            $.each(options, function (key, value) {
                self._setOption(key, value);
            });
        },
        _destroy: function () {
            var self = this;

            self._.wrapper.remove();
            self._ = {};
            // restore the original element
            self.element.show();
        },
        xposAdjustment: function () {
            var self = this;

            if (self._.items.length > 2)
                return THUMBNAIL_CELL_WIDTH * 2;
            else if (self._.items.length == 2)
                return
        },
        _moveItemTo: function (item, showing, pos, callback) {
            if (item) {
                var aniOpt = { "duration": 1500, "easing": "swing" };
                var opt = {};

                if (item.controlGlass)
                    item.controlGlass.hide();

                if (showing) {
                    //item.cellContents.show(aniOpt);
                    item.modelWidget.css("z-index", 99999);
                    item.cellContents.animate($.extend({ "width": item.contentWidth }, {}), 1000, "swing");

                }
                else {
                    item.modelWidget.css("z-index", 0);
                    item.cellContents.animate($.extend({ "width": 0 }, {}), 1000, "swing");
                    //item.cellContents.hide(aniOpt);
                }
                item.modelWidget.animate($.extend({ "left": pos }, opt), 1000, "swing", function (data) {
                    if (!showing && item.controlGlass) {
                        item.controlGlass.fadeIn(500);
                    }
                    else if (showing) {
                        item.modelWidget.addClass("current");
                    }
                });

            }
        },
        totalModels: function () {
            var self = this;

            return self._.items.length;
        },
        numberOfCrrentModelDevices: function () {
            var self = this;

            return self._.items[self._.currentIndex].items.length;
        },
        currentModel: function () {
            var self = this;

            return self._.items[self._.currentIndex].model;
        },
        currentMac: function () {
            var self = this;

            return self._.currentMac;
        },
        deviceList: function () {
            var self = this;
            var ret = [];

            for (var i = 0; i < self._.items.length; i++) {
                var model = self._.items[i];
                for (var j = 0; j < model.items.length; j++) {
                    ret.push(model.items[j]);
                }
            }

            return ret;
        },
        firstAvailableDevice: function () {
            var self = this;
            if (self._.currentIndex > -1 && self.numberOfCrrentModelDevices() > 0) {
                return self._.items[self._.currentIndex].items[0];
            }

            return "";
        },
        switchModel: function (index) {
            var self = this;

            // no need to process
            //if (index === self._.currentIndex)
            //    return;

            var itemLen = self._.items.length;
            var parkingPos = 0;
            var sliderWidth = self.options.width;

            if (index > itemLen - 1)
                index = 0;
            else if (index < 0)
                index = itemLen - 1;

            // process only in range
            if (index > -1 && index < itemLen) {
                var orgCurIdx = self._.currentIndex;
                var orgPreIdx = orgCurIdx - 1;
                var orgNexIdx = orgCurIdx + 1;

                if (orgCurIdx > -1) {
                    if (orgPreIdx < 0)
                        orgPreIdx = self._.items.length - 1;
                    if (orgNexIdx > itemLen - 1)
                        orgNexIdx = 0;
                }

                var preIndex = index - 1;
                var nexIndex = index + 1;

                if (preIndex < 0)
                    preIndex = self._.items.length - 1;
                if (nexIndex > itemLen - 1)
                    nexIndex = 0;

                var current = self._.items[index];
                var previous = null;
                var next = null;

                if (orgCurIdx > -1 && orgCurIdx < itemLen) {
                    self._.items[orgCurIdx].modelWidget.removeClass("current");
                }

                if (itemLen > 2) {
                    if (preIndex != index) {
                        previous = self._.items[preIndex];
                        previous.controlGlass.removeClass("left, right");
                        previous.controlGlass.addClass("left");
                    }


                    if (nexIndex != index) {
                        next = self._.items[nexIndex];
                        next.controlGlass.removeClass("left, right");
                        next.controlGlass.addClass("right");
                    }

                    parkingPos = THUMBNAIL_CELL_WIDTH / 2;

                    self._moveItemTo(current, true, parkingPos);
                    //current.modelWidget.css("left", parkingPos);

                    //previous.cellContents.hide(aniOpt);
                    self._moveItemTo(previous, false, 0 - parkingPos - MD_SLIDE_PADDING);
                    //previous.modelWidget.css("left", 0 - parkingPos);

                    if (nexIndex != orgPreIdx &&
                        nexIndex != orgCurIdx &&
                        nexIndex != orgNexIdx) {
                        next.modelWidget.css("left", sliderWidth + parkingPos);
                    }

                    self._moveItemTo(next, false, sliderWidth - parkingPos + MD_SLIDE_PADDING);
                    //next.modelWidget.css("left", sliderWidth - parkingPos);
                }
                else if (itemLen > 1) {
                    parkingPos = THUMBNAIL_CELL_WIDTH / 2;

                    if (index > 0) {
                        //current.cellContents.show(aniOpt);
                        self._moveItemTo(current, true, parkingPos);
                        //current.modelWidget.css("left", parkingPos);

                        previous = self._.items[preIndex];
                        previous.controlGlass.removeClass("left, right");
                        previous.controlGlass.addClass("left");

                        self._moveItemTo(previous, false, 0 - parkingPos - MD_SLIDE_PADDING);
                        //previous.modelWidget.css("left", 0);
                    }
                    else {
                        self._moveItemTo(current, true, 0);
                        //current.modelWidget.css("left", 0);

                        next = self._.items[nexIndex];
                        next.controlGlass.removeClass("left, right");
                        next.controlGlass.addClass("right");
                        self._moveItemTo(next, false, sliderWidth - parkingPos + MD_SLIDE_PADDING);
                        //next.modelWidget.css("left", sliderWidth - parkingPos);
                    }
                }
                else {
                    //current.cellContents.show(aniOpt);
                    self._moveItemTo(current, true, 0);
                    //current.modelWidget.css("left", 0);
                }


                if (orgCurIdx > -1) {
                    function reset(idx, isPrev) {
                        if (idx > -1 && idx < itemLen &&
                            idx != index &&
                            idx != preIndex &&
                            idx != nexIndex) {
                            var usingItem = self._.items[idx];

                            if (isPrev) {
                                usingItem.modelWidget.animate($.extend({ "left": 0 - self.options.width }, {}), 1000, "swing", function (data) {
                                    //usingItem.cellContents.hide();
                                    usingItem.cellContents.css("width", 0);
                                });
                            }
                            else {
                                //usingItem.cellContents.hide();
                                usingItem.cellContents.css("width", 0);
                                usingItem.modelWidget.css("left", 0 - self.options.width);
                            }
                        }
                    }

                    reset(orgCurIdx);
                    reset(orgPreIdx, true);
                    reset(orgNexIdx);
                }


                self._.currentIndex = index;
                self._.currentMac = self.firstAvailableDevice();

                $("div.device", self._.itemContainer).removeClass("sel");
                $("div#device-" + self._.currentMac, self._.itemContainer).addClass("sel");

                if (typeof self.options.updateCallback === "function") {
                    self.options.updateCallback.call({}, self);
                }
            }
        }
    });

    // UI widgets
    $.widget("ucm.navibox", {
        options: {
            mode: "all",
            factory: null,
            deferred: null,
            source: [],
            container: null
        },
        _create: function () {
            var self = this;

            this._setOptions(this.options);
            this._showAllPressed = false;
            if (this.element[0].type !== undefined &&
                this.element[0].type !== "") {
                this.wrapper = $("<span>").insertAfter(this.element);

                this.element.hide();
            }
            else {
                this.wrapper = $("<span>").appendTo(this.element);
            }

            this.wrapper.addClass("ucm-navibox");
            this.controlWrapper = $("<span>")
                .addClass("ucm-navibox-control")
                .insertAfter(this.wrapper);

            this._createAutocomplete();
            this._createShowAllButton();
            this._createAddButton();

            if (this.options.container) {
                this.options.container.fieldContainer({
                    mode: this.options.mode,
                    deferred: this.options.deferred,
                    factory: this.options.factory,
                    source: function () { return self.source(); }
                });
            }
        },
        _createAutocomplete: function () {
            var self = this;

            this.input = $("<input>")
              .appendTo(this.wrapper)
              .val("")
              .attr("title", "")
              .addClass("ucm-navibox-input ui-widget ui-widget-content ui-state-default")
              .autocomplete({
                  delay: 0,
                  minLength: 0,
                  source: $.proxy(this, "_source"),
                  open: function (event, ui) {
                      $(this).autocomplete("widget")
                             .menu("widget").removeClass("ui-corner-all")
                             .find(".ui-corner-all").removeClass("ui-corner-all");
                  }
              })
              .tooltip({
                  tooltipClass: "ui-state-highlight"
              });

            this.input.autocomplete().data("ui-autocomplete")._renderItem = this._renderComboItem;
            this.input.autocomplete().data("ui-autocomplete")._renderMenu = this._renderComboMenu;
            this._on(this.input, {
                autocompleteselect: "_autocompleteSelect",
                autocompletesearch: "_autocompleteSearch",
                autocompletefocus: "_autocompleteFocus",
                autocompletechange: "_removeIfInvalid"
            });
        },
        _createShowAllButton: function () {
            var self = this;
            var input = this.input,
              wasOpen = false;

            var localeShowItems = LOCALE.showItems;
            var localeShowItemsReal = localeShowItems;

            if (localeShowItems.length > 1 && localeShowItems.lastIndexOf("@", 0) === 0) {
                localeShowItems = localeShowItems.substring(1);
                localeShowItemsReal = translate(localeShowItems);
            }

            var button = $("<a>")
              .attr("tabIndex", -1)
              .attr("title", localeShowItemsReal) // TODO: need translation
              .tooltip()
              .appendTo(this.wrapper)
              .button({
                  icons: {
                      primary: "ui-icon-triangle-1-s"
                  },
                  text: false
              })
              .removeClass("ui-corner-all")
              .addClass("ucm-navibox-toggle")
              .mousedown(function () {
                  wasOpen = input.autocomplete("widget").is(":visible");
              })
              .click(function () {
                  input.focus();

                  // Close if already visible
                  if (wasOpen) {
                      return;
                  }

                  // Pass empty string as value to search for, displaying all results
                  self._showAllPressed = true;
                  input.autocomplete("search", input.val());
                  self._showAllPressed = false;
                  //input.autocomplete("search", "");
              });

            if (localeShowItems != localeShowItemsReal)
                button.attr("localeTitle", localeShowItems);
        },
        _createAddButton: function () {
            var self = this;

            if (self.options.mode !== "all") {
                self.controlButton = $("<button>")
                  .appendTo(this.controlWrapper)
                  .addClass("btn btn-update")
                  .attr("disabled", "disabled")
                  .attr("type", "button")
                  .mousedown(function () {

                  })
                  .click(function () {
                      var autocomplete = self.input.autocomplete().data("ui-autocomplete");
                      //console.log(autocomplete);

                      function selectAllChild(item) {
                          if (item.items) {
                              $.each(item.items, function (index, child) {
                                  selectAllChild(child);
                              });
                          }
                          else if (item._level === 2) {
                              item._selected = true;
                          }
                      }

                      if (autocomplete.selectedItem) {
                          var realItem = autocomplete.selectedItem._realItem;

                          selectAllChild(realItem);
                          //realItem._selected = true;

                          self.options.container.fieldContainer("addItem", realItem);
                          self._expandParentWidget(realItem);

                          self.controlButton.attr("disabled", "disabled");

                          jumpHash(realItem._uuid);
                      }
                  });

                prepareLocalizedLabel(self.controlButton, LOCALE.addOption);

                this.document.on("itemDestoryEvent", function (e) {
                    if (e.originator) {
                        var autocomplete = self.input.autocomplete().data("ui-autocomplete");

                        if (autocomplete.selectedItem) {
                            if (autocomplete.selectedItem._uuid === e.originator._uuid) {
                                self.controlButton.removeAttr("disabled")
                            }
                        }
                    }
                });
            }
        },
        _expandParentWidget: function (item) {
            if (item._parent)
                this._expandParentWidget(item._parent);
            else if (item._widget) {
                item._widget.expand();
            }
        },
        _renderComboItem: function (ul, item) {
            if (item != undefined) {
                var node = $("<a></a>");

                prepareLocalizedLabel(node, item.label);

                if (this.lastItem) {
                    if (item._uuid === this.lastItem._uuid)
                        node.addClass("sel");
                }
                else
                    highlightText(this.term, node);

                if (this.options.mode !== "all" && !item._selected) {
                    node.addClass("active");
                }

                return $("<li class=\"level" + (item._level + 1) + "\">")
                  .append(node)
                  .appendTo(ul);
            }

        },
        _renderComboMenu: function (ul, items) {
            var widget = this;
            $.each(items, function (index, item) {
                var addFirst = false;
                if (item.items != undefined) {
                    $.each(item.items, function (index, subItem) {
                        if (subItem.items && subItem.items.length > 0) {
                            if (!addFirst) {
                                widget._renderItemData(ul, item);

                                addFirst = true;
                            }

                            widget._renderItemData(ul, subItem);

                            $.each(subItem.items, function (index, leafItem) {
                                widget._renderItemData(ul, leafItem);
                            });
                        }
                    });
                }
            });

            //this.input.autocomplete('widget').removeClass('ui-corner-all');
            //$(ul).find("li:odd").addClass("odd");
        },
        _initItemProperty: function (item, lv) {
            var self = this;

            if (!item._uuid) {
                item._uuid = createGUID();
                item._level = lv;
            }

            if (item.items) {
                $.each(item.items, function (idx, child) {
                    child._parent = item;
                    self._initItemProperty(child, lv + 1);
                });
            }
        },
        _cloneSourceItem: function (original, includeChild) {
            var self = this;
            var ret = {};

            if (original) {
                //if (!original._uuid)
                //{
                //    original._uuid = createGUID();
                //}

                window.jQuery.extend(ret, original);
                ret._realItem = original;
            }

            ret.items = new Array();

            if (includeChild && original) {
                if (original.items) {
                    $.each(original.items, function (index, item) {
                        // test visible condition
                        if (!testVisibleCondition(item))
                            return true;

                        var child = self._cloneSourceItem(item, includeChild);
                        ret.items.push(child);
                    });
                }
            }

            return ret;
        },
        _source: function (request, response) {
            var self = this;
            var usingTerm = self._showAllPressed ? "" : request.term;
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(usingTerm), "i");
            if (this.options.source) {
                var result = new Array();

                $.each(this.options.source, function (index, item) {
                    var level1obj = null;

                    // test visible condition
                    if (!testVisibleCondition(item))
                        return true;


                    if (!usingTerm || testLocalizedString(matcher, item.label)) {
                        level1obj = self._cloneSourceItem(item, true);
                    }
                    else if (item.items != undefined) {
                        $.each(item.items, function (index, subItem) {
                            // always try to establish parent connection
                            var level2obj = null;

                            // test visible condition
                            if (!testVisibleCondition(subItem))
                                return true;

                            if (!usingTerm || testLocalizedString(matcher, subItem.label)) {
                                if (level1obj == null)
                                    level1obj = self._cloneSourceItem(item, false);

                                level2obj = self._cloneSourceItem(subItem, true);

                                level1obj.items.push(level2obj);
                            }
                            else if (subItem.items != undefined) {
                                $.each(subItem.items, function (index, leafItem) {
                                    // test visible condition
                                    if (!testVisibleCondition(leafItem))
                                        return true;

                                    // always try to establish parent connection
                                    if (!usingTerm || testLocalizedString(matcher, leafItem.label)) {
                                        var level3obj = null;

                                        if (level1obj == null)
                                            level1obj = self._cloneSourceItem(item, false);

                                        if (level2obj == null) {
                                            level2obj = self._cloneSourceItem(subItem, false);
                                            level1obj.items.push(level2obj);
                                        }

                                        level3obj = self._cloneSourceItem(leafItem, true);
                                        level2obj.items.push(level3obj);
                                    }
                                });
                            }
                        });
                    }

                    if (level1obj != null)
                        result.push(level1obj);
                });

                response(result);
            }
            else
                response([]);
        },
        _autocompleteSelect: function (event, ui) {
            //ui.item.option.selected = true;
            this._trigger("select", event, {
                item: ui.item
            });

            var execute = true;

            if (this.options.selectCallback &&
                 typeof (this.options.selectCallback) === "function") {
                execute = this.options.selectCallback(event, ui);
            }

            if (execute !== false) {
                if (this.controlButton) {
                    if (!ui.item._widget) {
                        this.controlButton.removeAttr("disabled");
                    }
                    else {
                        this.controlButton.attr("disabled", "disabled");
                    }
                }
            }

            var autocomplete = this.input.autocomplete().data("ui-autocomplete");
            autocomplete.lastItem = window.jQuery.extend({}, ui.item);

            this.expandWidget(ui.item);

            var e = window.jQuery.Event("naviEvent");
            e.originalEvent = event;
            e.naviItem = ui.item;

            var labelValue = ui.item.label.toString();

            if (labelValue.length > 1 && labelValue.lastIndexOf("@", 0) === 0) {
                labelValue = translate(labelValue.substring(1));
            }

            // TODO: needs to load translation
            this.input.val(labelValue);
            event.preventDefault();

            $.event.trigger(e);

            // navigate to the position
            var item = ui.item._realItem;
            (function waitNext() {
                if (item._binding) {
                    // needs to wait until the binding is completed
                    setTimeout(waitNext, 100);
                }
                else {
                    if (item._widget) {
                        item._widget.element.show(); // make sure to display it
                        jumpHash(item._uuid);
                    }
                }
            })();

        },
        _autocompleteSearch: function (event, ui) {
            var autocomplete = this.input.autocomplete().data("ui-autocomplete");
            if (autocomplete.term !== autocomplete.previous)
                autocomplete.lastItem = null;

            this._trigger("search", event, ui);

            ui.term = autocomplete.term;

            var execute = true;

            if (this.options.searchCallback &&
                 typeof (this.options.searchCallback) === "function") {
                execute = this.options.searchCallback(event, ui);
            }

            if (execute !== false) {
                if (this.controlButton) {
                    this.controlButton.attr("disabled", "disabled");
                }
            }
        },
        _autocompleteFocus: function (event, ui) {
            this._trigger("focus", event, {
                item: ui.item
            });

            var labelValue = ui.item.label.toString();

            if (labelValue.length > 1 && labelValue.lastIndexOf("@", 0) === 0) {
                labelValue = translate(labelValue.substring(1));
            }

            this.input.val(labelValue);
            event.preventDefault();
        },
        _removeIfInvalid: function (event, ui) {
            // Selected an item, nothing to do
            if (ui.item) {
                return;
            }

            // Search for a match (case-insensitive)
            var value = this.input.val(),
              valueLowerCase = value.toLowerCase(),
              valid = false;

            if (value !== "") {
                var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(value) + "$", "i");

                $.each(this.input.autocomplete("widget").children(), function (index, item) {
                    if (matcher.test(item.innerText)) {
                        $(item).find("a").trigger("click");
                        valid = true;
                    }
                });

                // Found a match, nothing to do
                if (valid) {
                    return;
                }

                // Remove invalid value
                var label = LOCALE.noMatchOption;
                var labelReal = label;

                if (label.length > 1 && label.lastIndexOf("@", 0) === 0) {
                    label = label.substring(1);
                    labelReal = translate(label);
                }

                this.input
                  .val("")
                  .attr("title", labelReal.format(value))
                  .tooltip("open");

                this._delay(function () {
                    this.input.tooltip("close").attr("title", "");
                }, 2500);
                this.input.data("ui-autocomplete").lastItem = null;
                this.input.data("ui-autocomplete").term = "";
            }

            var execute = true;
            if (this.options.selectCallback &&
                typeof (this.options.invalidOptionCallback) === "function") {
                execute = this.options.invalidOptionCallback(event, ui);
            }

            if (execute !== false) {
                if (this.controlButton) {
                    this.controlButton.attr("disabled", "disabled");
                }
            }
        },
        _setOption: function (key, value) {
            var self = this;
            if (key === "source") {
                $.each(value, function (index, item) {
                    self._initItemProperty(item, 0);
                });
            }
            else if (key === "container") {
                value = $(value);
            }

            this._superApply(arguments);
        },
        _setOptions: function (options) {
            var self = this;

            $.each(options, function (key, value) {
                self._setOption(key, value);
            });
        },
        _findItemByUUID: function(uuid){
            if (!uuid)
                return null;
            var ret = null;
            $.each(this.options.source, function (index, item) {
                if (item && item._uuid === uuid)
                {
                    ret = item;
                    return false;
                }

                if (item.items != undefined) {
                    $.each(item.items, function (index, subItem) {
                        if (subItem && subItem._uuid === uuid)
                        {
                            ret = subItem;
                            return false;
                        }

                        if (subItem.items != undefined) {
                            $.each(subItem.items, function (index, leafItem) {
                                if (leafItem && leafItem._uuid === uuid)
                                {
                                    ret = leafItem;
                                    return false;
                                }
                            });
                        }

                        if (ret)
                            return false;
                    });
                }

                if (ret)
                    return false;
            });

            return ret;
        },
        _destroy: function () {
            this.wrapper.remove();
            this.controlWrapper.remove();
            this.element.show();
        }
    });

    $.ucm.navibox.prototype.expandWidget = function (item) {
        this._expandParentWidget(item);
    }

    $.ucm.navibox.prototype.addItemByUUID = function (uuid) {
        var self = this;
        var realItem = this._findItemByUUID(uuid);

        if (realItem)
        {
            function selectAllChild(item) {
                if (item.items) {
                    $.each(item.items, function (index, child) {
                        selectAllChild(child);
                    });
                }
                else if (item._level === 2) {
                    item._selected = true;
                }
            }

            selectAllChild(realItem);
            //realItem._selected = true;

            self.options.container.fieldContainer("addItem", realItem);
            self._expandParentWidget(realItem);

            self.controlButton.attr("disabled", "disabled");

            jumpHash(realItem._uuid);
        }
    }

    $.ucm.navibox.prototype.source = function () {
        var ret = [];

        if (this.options.mode === "all") {
            $.each(this.options.source, function (index, item) {
                ret.push(item);
            });
        }
        else {
            $.each(this.options.source, function (index, item) {
                var level1obj = null;

                if (item.items != undefined) {
                    $.each(item.items, function (index, subItem) {
                        // always try to establish parent connection
                        var level2obj = null;

                        if (subItem.items != undefined) {
                            $.each(subItem.items, function (index, leafItem) {
                                // always try to establish parent connection
                                if (leafItem._widget || leafItem._selected) {
                                    level1obj = item;
                                    return false;
                                }
                            });
                        }
                    });
                }

                if (level1obj != null)
                    ret.push(level1obj);
            });
        }

        return ret;
    }

    // define field Item
    $.widget("ucm.fieldItem", {
        options: {
            "tooltip": "qtip",
            "mode": "all",
            "factory": null,
            "deferred": null,
            "item": {
                "label": "unknown",
                "tooltip": "",
                "type": "text",
                "data": {}
            }
        },
        dataField: {},
        _create: function () {
            this._setOptions(this.options);

            this.dataField = {
                originValueStatus: 0,
                originValueSource: "",
                valueStatus: 0, // 0 = normal, 1 = linked, 2 = locked
                readonly: true,
                elementWidget: null,
                disabledGlass: null,
                dataControls: {} // TODO: pending to remove
            };

            var self = this;

            var item = this.options.item;
            item._widget = this;

            if (this.options.mode !== "all")
                this.dataField.readonly = false;


            if (item._loadedValue && item._loadedValue.originType) {
                if (item._loadedValue.originType === "locked") {
                    this.dataField.valueStatus = 2;
                }
                else {
                    this.dataField.valueStatus = 1;
                }

                this.dataField.readonly = true;
                this.dataField.originValueStatus = this.dataField.valueStatus;
                this.dataField.originValueSource = item._loadedValue.originName;
            }

            if (!item._uuid)
                item._uuid = createGUID();

            this.element
                .addClass("field")
                .attr("itemid", item.id.pad(8) + "." + (item.elementNum ? item.elementNum : 1).pad(3))
                .attr("path", item.pathName)
                .attr("id", item._uuid);

            this.check = $("<div/>")
                .addClass("cell sel")
                .appendTo(this.element);

            this.label = $("<div/>")
                .addClass("cell label")
                .appendTo(this.element);

            if (this.options.mode != "preview") {
                createLabel(this.label, item.label.toString(), item.tooltip.toString());
            }
            else
                prepareLocalizedLabel(this.label, item.label.toString());

            this.container = $("<div/>")
                .addClass("cell contents")
                .appendTo(this.element);

            this.status = $("<div/>")
                .addClass("cell state")
                .text(" ")
                .appendTo(this.element);
            this.resetButton = $("<span/>")
                .addClass("control reset");

            prepareLocalizedLabel(this.resetButton, LOCALE.resetToDefault, true);


            this._createContents();
            this._createCheckControl();
            //this._createTooltip();
            this._updateReadOnlyState();
            this._updateContentStatus();
        },
        _createContents: function () {
            var self = this;
            var item = self.options.item;

            // create reset button as needed;
            var updateResetButton = function () {
                self.resetButton.removeClass("disabled");
                if (self.dataField.elementWidget && !self.dataField.elementWidget.isModified()) {
                    self.resetButton.addClass("disabled");
                }
            }
            this.resetButton.on("click", function (e) {
                var ew;
                if (ew = self.dataField.elementWidget) {
                    if (ew.isModified())
                    {
                        ew.elementValue(ew.defaultValues(), true);
                    }
                }
                updateResetButton();
            });

            var monitorValueChanged = function (type, sender) {
                // Filter type
                if (type !== "change") {
                    return;
                }

                var entity = sender.entity();
                var value = sender.formValue();
                var field = sender.field();

                field.valueChanged(entity, value);
            }

            var onFieldValueChanged = function (type, sender) {
                monitorValueChanged(type, sender);
                updateResetButton();
                BLL.ConfigPage.updateModifiedInput(self);
            }

            var onActionTarget = function (action) {
                var value = null;

                // Sanity check
                if (action === null || action === undefined) {
                    console.warn("onActionTarget::Invalid action");
                    return;
                }

                if (action._name === "enabled") {
                    value = (action._argument === "true");
                    self._enableWidget(value);
                }
                else if (action._name === "locked") {
                    value = (action._argument === "true");
                    self._lockWidget(value);
                }
            }

            //var number = 0;
            if (self.options.mode !== "preview") {
                if (self.options.tooltip === "qtip") {
                    $("[tip]", self.label).each(function (i) {
                        var value = $(this).attr('tip');
                        if (value.charAt(0) == '@')
                            value = translate(value.substr(1));

                        // add label at beginning of tooltip
                        var header = $(this).next().html();
                        if (value.slice(0, 3) !== '<B>') {
                            value = '<B>' + header + '</B> ' + value;
                        }

                        $(this).qtip({
                            content: {
                                text: value
                            },
                            style: {
                                classes: 'ui-tooltip-plain ui-tooltip-shadow ui-tooltip-rounded'
                            },
                            position: {
                                my: "bottom center", // Use the corner...
                                at: "top center", // ...and opposite corner
                                target: "mouse"
                            }
                        });
                    });
                }
            }


            self.element.on("mouseleave", function (event) {
                self.dataField.elementWidget.setInfoFormWidget(null);
            });

            var type = typeOracle(item.type);
            if (type) {
                var elm = new BLL.ElementWidget(type,
                                                item.defaultValue,
                                                item.validateRegex,
                                                item.validateError,
                                                item.__scope__);
                elm.initMonitor(item.monitor, item.__scope__);

                item.__scope__.elementWidget = elm;

                if (item._selected) {
                    // allow mark readonly false only if value status is NORMAL
                    if (!self.dataField.valueStatus)
                        self.dataField.readonly = false;
                    else
                        item._selected = false; // any status other than 0 is not allow to be selected
                }

                self.dataField.elementWidget = elm;

                if (item._loadedValue) {
                    elm.elementValue(item._loadedValue.values);
                }
                else
                    elm.elementValue(elm.defaultValues());

                elm.prepareMonitor();

                updateResetButton();

                if (self.options.mode === "preview") {
                    elm.previewElement().appendTo(self.container);
                }
                else {
                    elm.registerSelectCallback(onFieldValueChanged);
                    elm.registerChangeCallback(onFieldValueChanged);
                    elm.registerKeyEventCallback(onFieldValueChanged);
                    elm.registerActionTargetCallback(onActionTarget);
                    elm.registerValidateErrorCallback(function (e, s) {
                        self._expandParentWidget(self.options.item);

                        //var hash = "#" + self.options.item._uuid;
                        //if ($(hash).offset().top > $(document).height() - $(window).height()) {
                        //    dest = $(document).height() - $(window).height();
                        //} else {
                        //    dest = $(hash).offset().top;
                        //}
                        ////go to destination
                        //$('html,body').animate({ scrollTop: dest }, 1000, 'swing');

                        //console.log("[AH] CURR:" + myWindow.location.hash);
                        jumpHash(self.options.item._uuid);
                    });
                    elm.element().appendTo(self.container);
                }
            }
            else {
                console.warn("UNKNOWN:", item.type);

                $("<span/>").text("UNKNOWN ELEMENT").appendTo(self.container);
            }
        },
        _expandParentWidget: function (item) {
            if (item._parent)
                this._expandParentWidget(item._parent);
            else if (item._widget && item._widget.expand) {
                item._widget.expand();
            }
        },
        _updateWidgetStatuses: function (enabled) {
            var self = this;

            self.options.item._selected = enabled;
            self.dataField.readonly = !self.options.item._selected;

            // it always means when selected is equal to value status NORMAL
            if (self.options.item._selected)
                self.dataField.valueStatus = 0;
            else
                self.dataField.valueStatus = self.dataField.originValueStatus;

            self._updateReadOnlyState();
            self._updateContentStatus();
        },
        _lockWidget: function (locked) {
            var self = this;

            if (self.options.mode === "all") {
                if (locked === true) {
                    self.dataField.valueStatus = 2;
                    self.checkWidget.attr("disabled", "disabled");
                } else {
                    self.dataField.valueStatus = self.dataField.originValueStatus;

                    if (self.dataField.valueStatus !== 2) {
                        self.checkWidget.removeAttr("disabled", "disabled");
                    }
                }

                self._updateReadOnlyState();
                self._updateContentStatus();
            }
        },
        _enableWidget: function (enabled, userTrigger) {
            var self = this;

            if (self.dataField.valueStatus !== 2 && self.options.mode === "all") {
                self.checkWidget.prop("checked", enabled);

                // Update disable-glass class
                if (enabled === true) {
                    self.dataField.disabledGlass.detach();
                } else {
                    self.container.append(self.dataField.disabledGlass);
                }

                self._updateWidgetStatuses(enabled);
                // [AH] Fix bug#32000. When original readonly state is TRUE,
                // we really don't case about this configuration
                // [AH] Fix bug#37179: added user trigger flag to bypass previous limitation
                if (userTrigger || !self.dataField.readonly) {
                    BLL.ConfigPage.updateModifiedInput(self);
                }

            }
        },
        _createCheckControl: function () {
            var widget;
            var self = this;
            var item = this.options.item;
            if (this.options.mode === "all") {
                widget = $("<input type='checkbox'/>")
                    .attr("tabIndex", -1);
                if (!self.dataField.readonly)
                    widget.prop("checked", true);
                if (self.dataField.valueStatus === 2)
                    widget.attr("disabled", "disabled");
            }
            else if (this.options.mode === "select") {
                widget = $("<a/>")
                    .addClass("remove")
                    .attr("tabIndex", -1);
            }

            if (widget) {
                var usingId = item._uuid + "_sel";
                widget.attr("id", usingId);
                self.dataField.disabledGlass = $("<div />").addClass("disable-glass").on("click", function (e) {
                    if (self.dataField.valueStatus !== 2 && self.dataField.readonly) {
                        $(this).detach();
                        self.checkWidget.prop("checked", true);
                        self._updateWidgetStatuses(true);
                        BLL.ConfigPage.updateModifiedInput(self);
                    }
                });

                if (self.options.mode === "all" && self.dataField.readonly) {
                    self.container.append(self.dataField.disabledGlass);
                }

                widget.click(function () {
                    var $this = $(this);

                    if (self.options.mode === "all") {
                        var checked = false;

                        if ($this.is(':checked')) {
                            checked = true;
                        }

                        self._enableWidget(checked, true);
                        self.dataField.elementWidget.requestSenderValues(checked);
                    }
                    else {
                        self.element.remove();
                    }
                });

                widget.appendTo(this.check);
                $("<label/>")
                    .attr("for", usingId)
                    .html("&nbsp")
                    .insertAfter(widget);
                this.checkWidget = widget;
            }
        },
        _updateReadOnlyState: function () {
            var self = this;

            if (self.options.mode === "all") {
                self.element.removeClass("readonly");

                if (self.dataField.readonly) {
                    this.element.addClass("readonly");
                }

                self.dataField.elementWidget.disableFormWidgets(self.dataField.readonly);
            }
        },
        _updateContentStatus: function () {
            var self = this;
            if (self.options.mode === "preview")
                return;

            self.resetButton.detach();
            self.status.removeClass("locked").removeClass("linked");

            if (self.dataField.valueStatus === 2) // locked
            {
                self.status.addClass("locked");

                var label = LOCALE.protected;
                var labelReal = label;

                if (label.length > 1 && label.lastIndexOf("@", 0) === 0) {
                    label = label.substring(1);
                    labelReal = translate(label);
                }

                self.status.attr("title", labelReal);
            }
            else if (self.dataField.valueStatus === 1) // linked
            {
                self.status.addClass("linked");
                self.status.attr("title", self.dataField.originValueSource);
            }
            else {
                self.status.attr("title", "");
                if (!self.dataField.readonly) {
                    self.resetButton.appendTo(self.status);
                }
            }

        },
        _setOption: function (key, value) {
            var self = this;
            if (key === "item") {
                if (typeof value === "function")
                    value = value();
            }
            this._superApply(arguments);
        },
        _setOptions: function (options) {
            var self = this;

            $.each(options, function (key, value) {
                self._setOption(key, value);
            });
        },
        _destroy: function () {
            var self = this;
            var item = self.options.item;

            if (item._widget) {
                delete item._widget;
                delete item._selected;

                var e = window.jQuery.Event("itemDestoryEvent");
                e.originator = item;
                e.target = self.element.get(0);//self.element.parent().get(0);

                self.element.trigger(e, []);

                if (self.element.parent().children().length == 1) {
                    if (item._parent._widget) {
                        item._parent._widget.element.remove();
                    }
                }
            }

            this._super();
        }
    });

    // define field SubGroup
    $.widget("ucm.fieldSubGroup", {
        options: {
            mode: "all",
            factory: null,
            deferred: null,
            item: {
                label: "unknown"
            }
        },
        dataField: {},
        _create: function () {
            this._setOptions(this.options);

            var item = this.options.item;
            item._widget = this;

            if (!item._uuid)
                item._uuid = createGUID();

            this.element
                .addClass("field-subgroup")
                .attr("itemid", item.id.pad(8))
                .attr("path", item.pathName)
                .attr("id", item._uuid);

            this.header = $("<div/>")
                .addClass("subgroup-header")
                .attr("id", "h-" + item._uuid)
                .appendTo(this.element);

            prepareLocalizedLabel(this.header, item.label);

            this.container = $("<div/>")
                .addClass("item-holder")
                .attr("id", "c-" + item._uuid)
                .insertAfter(this.header);

            if (this.options.mode === "all") {
                this._bindAllChildItems();
            }
            else {
                this._bindSelectedChildItems();
            }
        },
        _bindAllChildItems: function () {
            var self = this;
            var item = this.options.item;
            // having repeating items, we need to display "display more"
            var chuck = 8;
            var lateBinding = item._hasRepeatItem ? chuck : 0;
            var needsShowMore = false;
            var lastItem = item.items ? item.items.length : 0;
            var more = null;
            if (self.options.deferred && lateBinding > 0 && lateBinding < lastItem) {
                needsShowMore = true;
                lastItem = lastItem - 1;
                item._binding = true;

                this.showMoreContainer = $("<div/>")
                                        .addClass("more-holder")
                                        .addClass("controlButton")
                                        .attr("id", "m-" + item._uuid)
                                        .insertAfter(this.container);

                more = $("<span/>")
                            .addClass("control")
                            .addClass("loading")
                            .appendTo(this.showMoreContainer);

                prepareLocalizedLabel(more, LOCALE.loading);
            }

            $(item.items).each(function (idx, child) {
                if (self.options.deferred) {
                    if (!lateBinding || idx < lateBinding) {
                        self.options.deferred.add(function () {
                            self._createChildItem(child);
                        });
                    }
                    else {
                        self.options.deferred.addAfter(function () {
                            var w = self._createChildItem(child);

                            if (!child._selected)
                                w.hide();

                            if (idx >= lastItem) {
                                delete item._binding;

                                prepareLocalizedLabel(more, LOCALE.showMoreItems);

                                more.removeClass("loading");
                                more.addClass("more");
                                more.on("click", function (e) {

                                    var hiddens = $("div.field:hidden", self.container);
                                    var last = 0;


                                    if (hiddens.length > chuck)
                                        last = chuck;
                                    else {
                                        last = hiddens.length;
                                        self.showMoreContainer.remove();
                                    }

                                    var hidden;
                                    for (var i = 0; i < last; i++) {
                                        hidden = $(hiddens[i]);
                                        hidden.show();
                                    }
                                    if (hidden) {
                                        jumpHash(hidden.attr("id"));
                                    }
                                });
                            }
                        });
                    }
                }
                else
                    self._createChildItem(child);

                lastItem = idx;
            });

        },
        _bindSelectedChildItems: function () {
            var self = this;

            $(this.options.item.items).each(function (idx, child) {
                if (child._widget || child._selected) {
                    if (self.options.deferred) {
                        self.options.deferred.add(function () {
                            self._createChildItem(child);
                        });
                    }
                    else
                        self._createChildItem(child);
                }
            });
        },
        _createChildItem: function (item) {
            if (!testVisibleCondition(item) || item._widget)
                return;

            if (!item._uuid)
                item._uuid = createGUID();

            var self = this;
            var widget = $("#" + item._uuid, this.container);

            if (!widget.length) {
                widget = $("<div/>").fieldItem({
                    "item": function () { return item; },
                    "factory": this.options.factory,
                    "deferred": this.options.deferred,
                    "mode": this.options.mode
                });

                widget.appendTo(self.container);

                if (this.options.mode !== "all") {
                    this.container.children().sort(sortByElementName).each(function (idx, widget) {
                        $(widget).detach().appendTo(self.container);
                    });
                }

                return widget;
            }
        },
        _setOption: function (key, value) {
            var self = this;
            if (key === "item") {
                if (typeof value === "function")
                    value = value();
            }
            this._superApply(arguments);
        },
        _setOptions: function (options) {
            var self = this;

            $.each(options, function (key, value) {
                self._setOption(key, value);
            });
        },
        _destroy: function () {
            var self = this;
            var item = self.options.item;

            if (item._widget) {
                delete item._widget;

                var e = window.jQuery.Event("itemDestoryEvent");
                e.originator = item;
                e.target = self.element.get(0);//self.element.parent().get(0);

                self.element.trigger(e, []);

                if (self.element.parent().children().length == 1) {
                    if (item._parent._widget) {
                        item._parent._widget.element.remove();
                    }
                }
            }

            this._super();
        }
    });

    $.ucm.fieldSubGroup.prototype.addItem = function (item) {
        if (item._level === 2)
            this._createChildItem(item);
    }

    // define fieldGroup widget
    $.widget("ucm.fieldGroup", {
        options: {
            mode: "all", // preload, add
            factory: null,
            deferred: null,
            item: {
                label: "unknown"
            },
            defaultExpanded: false
        },
        dataField: {},
        _create: function () {
            var self = this;

            this._setOptions(this.options);

            this.dataField = {
                expanded: false
            };

            var item = this.options.item;
            item._widget = this;

            if (!item._uuid)
                item._uuid = createGUID();

            this.element
                .addClass("field-group")
                .attr("itemid", item.id.pad(8))
                .attr("path", item.pathName)
                .attr("id", item._uuid);

            this.header = $("<div/>")
                .addClass("group-header")
                .attr("id", "h-" + item._uuid)
                .appendTo(this.element);

            this.label = $("<div/>")
                .addClass("label")
                .appendTo(this.header);

            prepareLocalizedLabel(this.label, item.label);

            this.control = $("<div/>")
                .addClass("control")
                .appendTo(this.header);

            this.container = $("<div/>")
                .addClass("item-holder")
                .attr("id", "c-" + item._uuid)
                .insertAfter(this.header);

            if (this.options.item.items) {
                if (this.options.mode === "all") {
                    $(this.options.item.items).each(function (idx, child) {
                        if (self.options.deferred) {
                            self.options.deferred.add(function () {
                                self._createChildItem(child);
                            });
                        }
                        else
                            self._createChildItem(child);
                    });
                }
                else {
                    $(this.options.item.items).each(function (idx, item) {
                        var hasSelected = false;
                        if (item.items) {
                            $.each(item.items, function (idx, leafitem) {
                                if (testVisibleCondition(leafitem) && (leafitem._widget || leafitem._selected)) {
                                    hasSelected = true;
                                    return false;
                                }
                            });

                            if (hasSelected) {
                                if (self.options.deferred) {
                                    self.options.deferred.add(function () {
                                        self._createChildItem(item);
                                    });
                                }
                                else
                                    self._createChildItem(item);
                            }
                        }
                    });
                }
            }
            this._createControlButton();
        },
        _expand: function () {
            var self = this;

            self.dataField.expanded = true;
            self.controlButton.removeClass("collapse");
            self.controlButton.addClass("expand");

            this.container.show();
        },
        _collapse: function () {
            var self = this;

            self.dataField.expanded = false;
            self.controlButton.removeClass("expand");
            self.controlButton.addClass("collapse");

            this.container.hide();
        },
        _handleControlButtonAction: function (control, dataField) {
            var self = this;
            // TODO: needs to handle child
            if (dataField.expanded) {
                self._expand();
            }
            else {
                self._collapse();
            }
        },
        _hasChildItem: function (items) {
            var found = false;
            if (items) {
                $.each(items, function (idx, leafitem) {
                    // test for visible condition
                    if (!testVisibleCondition(leafitem))
                        return true;

                    found = true;
                    return false;
                });
            }

            return found;
        },
        _createControlButton: function () {
            var self = this;
            var dataField = this.dataField;

            if (self.options.defaultExpanded)
                dataField.expanded = true;

            var button = $("<a>")
                .attr("tabIndex", -1)
                .appendTo(this.control)
                .mousedown(function () {
                    // Do something here
                })
                .click(function () {
                    dataField.expanded = !dataField.expanded;
                    self._handleControlButtonAction(button, dataField);
                });

            self.controlButton = button;
            self._handleControlButtonAction(button, dataField);

            if (self.options.mode === "preview")
                button.hide();
        },
        _createChildItem: function (item) {
            if (!testVisibleCondition(item) || item._widget || !this._hasChildItem(item.items))
                return;

            if (!item._uuid)
                item._uuid = createGUID();

            var self = this;
            var widget = $("#" + item._uuid, this.container);

            if (!widget.length) {
                widget = $("<div/>").fieldSubGroup({
                    "item": function () { return item; },
                    "factory": self.options.factory,
                    "deferred": self.options.deferred,
                    "mode": self.options.mode
                });

                widget.appendTo(self.container);

                if (this.options.mode !== "all") {
                    this.container.children().sort(sortByElementName).each(function (idx, widget) {
                        $(widget).detach().appendTo(self.container);
                    });
                }
            }
        },
        _setOption: function (key, value) {
            var self = this;
            if (key === "item") {
                if (typeof value === "function")
                    value = value();
            }
            this._superApply(arguments);
        },
        _setOptions: function (options) {
            var self = this;

            $.each(options, function (key, value) {
                self._setOption(key, value);
            });
        },
        _destroy: function () {
            var self = this;
            var item = self.options.item;

            if (item._widget) {
                delete item._widget;

                var e = window.jQuery.Event("itemDestoryEvent");
                e.originator = item;
                e.target = self.element.get(0);//self.element.parent().get(0);

                self.element.trigger(e, []);
            }
            this._super();
        }
    });

    $.ucm.fieldGroup.prototype.addItem = function (item) {
        if (item._level === 1)
            this._createChildItem(item);
    }

    $.ucm.fieldGroup.prototype.expand = function () {
        this._expand();
    }

    $.ucm.fieldGroup.prototype.collapse = function () {
        this._collapse();
    }

    $.ucm.fieldGroup.prototype.toggleExpand = function () {
        if (this.dataField.expanded) {
            this._collapse();
        }
        else
            this._expand();
    }

    // define fieldGroup widget
    $.widget("ucm.fieldContainer", {
        options: {
            mode: "all",
            factory: null,
            deferred: null,
            expandFirst: true,
            source: []
        },
        dataField: {},
        _create: function () {
            var self = this;

            this.dataField = {
                empty: true
            };

            this._setOptions(this.options);

            this.element
                .addClass(self.options.mode === "preview" ? "field-container-preview" : "field-container");


            this.emptyLabel = $("<div/>")
                .addClass("empty")
                .appendTo(this.element);

            prepareLocalizedLabel(this.emptyLabel, LOCALE.emptyContainer);

            if (this.options.mode === "all")
                this._bindAllFieldGroup();
            else
                this._bindSelectedFieldGroup();

            this.element.on("itemDestoryEvent", function (e) {
                //e.preventDefault();

                if (e.originator && e.originator._level === 0) {
                    var $target = $(e.target);

                    if ($target.parent().length && $target.parent().get(0) === self.element.get(0)) {
                        if (self.element.children().length === 1) {
                            self.dataField.empty = true;
                            self.emptyLabel.appendTo(self.element);
                        }
                    }
                }
            });
        },
        _bindAllFieldGroup: function () {
            var self = this;
            $(this.options.source).each(function (idx, item) {

                if (self.options.deferred) {
                    self.options.deferred.add(function () {
                        var widget = self._createFieldGroup(item);
                        if (idx == 0 && widget) {
                            widget.fieldGroup("expand");
                        }
                    });
                }
                else {
                    var widget = self._createFieldGroup(item);
                    if (idx == 0 && widget) {
                        widget.fieldGroup("expand");
                    }
                }
            });
        },
        _bindSelectedFieldGroup: function () {
            var self = this;
            var count = -1;
            $(this.options.source).each(function (idx, item) {
                var hasSelected = false;
                if (item.items) {
                    $.each(item.items, function (idx, subitem) {
                        if (subitem.items) {
                            $.each(subitem.items, function (idx, leafitem) {
                                // test for visible condition
                                if (!testVisibleCondition(leafitem))
                                    return true;

                                if (leafitem._widget || leafitem._selected) {
                                    hasSelected = true;
                                    return false;
                                }
                            });

                            if (hasSelected)
                                return false;
                        }
                    });

                    if (self.options.mode === "all" || hasSelected) {
                        if (self.options.deferred) {
                            self.options.deferred.add(function () {
                                var widget = self._createFieldGroup(item);
                                if (++count == 0 || self.options.mode === "preview") {
                                    widget.fieldGroup("expand");
                                }
                            });
                        }
                        else {
                            var widget = self._createFieldGroup(item);
                            if (++count == 0 || self.options.mode === "preview") {
                                widget.fieldGroup("expand");
                            }
                        }
                    }
                }
            });
        },
        _hasChildItem: function (items) {
            var found = false;

            if (!items)
                return found;

            $(items).each(function (idx, item) {
                // test for visible condition
                if (!testVisibleCondition(item))
                    return true;

                if (item.items) {
                    $.each(item.items, function (idx, leafitem) {
                        // test for visible condition
                        if (!testVisibleCondition(leafitem))
                            return true;

                        found = true;
                        return false;
                    });

                    if (found)
                        return false;
                }
            });

            return found;
        },
        _createFieldGroup: function (item) {
            if (!item || !item.label || !testVisibleCondition(item) || !this._hasChildItem(item.items))
                return null;

            var self = this;
            var widget = null;

            if (this.options.mode !== "all") {
                $("div.field-group", this.element).each(function (idx, child) {
                    var found = $(child);
                    if (found.is(":ucm-fieldGroup") && found.attr("itemid") === item.id.pad(8)) {
                        // should never hit this case
                        if (!item._uuid) {
                            item._uuid = createGUID();
                            found.attr("id", item._uuid);
                        }
                        else if (found.attr("id") !== item._uuid) {
                            return;
                        }

                        widget = found;
                        return false;
                    }
                });
            }

            if (!widget) {
                widget = $("<div/>").fieldGroup({
                    "item": function () { return item; },
                    "factory": this.options.factory,
                    "deferred": this.options.deferred,
                    "mode": this.options.mode
                });

                if (self.dataField.empty) {
                    self.emptyLabel.detach();
                    self.dataField.empty = false;
                }

                widget.appendTo(self.element);

                if (this.options.mode !== "all") {
                    self.element.children().sort(sortByElementName).each(function (idx, w) {
                        $(w).detach().appendTo(self.element);
                    });
                }

                return widget;
            }

            return null;
        },
        _addFieldGroup: function (item) {
            if (this.options.mode !== "all") {
                if (!testVisibleCondition(item))
                    return null;

                var widget = this._createFieldGroup(item);
                if (widget) {
                    this.options.source.push(item);
                    return widget;
                }
            }
            return null;
        },
        _setOption: function (key, value) {
            var self = this;
            if (key === "source") {
                if (typeof value === "function") {
                    value = value();
                }
            }
            this._superApply(arguments);
        },
        _setOptions: function (options) {
            var self = this;

            $.each(options, function (key, value) {
                self._setOption(key, value);
            });
        }
    });

    $.ucm.fieldContainer.prototype.addItem = function (item) {
        if (item._level === 0) {
            this._addFieldGroup(item);
        }
        else if (item._level === 1) {
            if (!item._parent._widget)
                this._addFieldGroup(item._parent);
            else {
                item._parent._widget.addItem(item);
            }
        }
        else if (item._level === 2) {
            if (!item._parent._widget) {
                if (!item._parent._parent._widget) {
                    this._addFieldGroup(item._parent._parent);
                }
                else {
                    item._parent._parent._widget.addItem(item._parent);
                }
            }
            else {
                item._parent._widget.addItem(item);
            }
        }

        // if is deferred, needs to trigger immediately
        if (this.options.deferred)
            this.options.deferred.start();
    }
})(window.jQuery);

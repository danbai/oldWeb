import $ from 'jquery'
import api from "../../../api/api"

const baseServer = api.apiHost
// define namespace scope and classes
let nss = new function () {
    let ns = this
    let fileCaches = {}
    let removeZeroConfigPath = function (type, base, name) {
        let key = "zc_" + (type || "")
        let ret = false

        $.ajax({
            type: "post",
            url: baseServer,
            data: {
                "action": "removeFile",
                "type": key,
                "data": base ? base + "/" + name : name
            },
            async: false,
            error: function (jqXHR, textStatus, errorThrown) {
                ret = {};
                console.error(arguments);
            },
            success: function (data) {
                if (data.status != 0) {
                    ret = false;
                    console.warn("Unable to remove path");
                } else {
                    ret = true;
                }
            }
        })

        return ret
    }
    let listZeroConfigDirectory = function (type, reload) {
        let key = "zc_" + (type || "");
        let ret = fileCaches[key]
        if (!ret || reload) {
            $.ajax(
            {
                type: "post",
                url: baseServer,
                data: {
                    "action": "listFile",
                    "type": key,
                    "sidx": "n"
                },
                async: false,
                error: function (jqXHR, textStatus, errorThrown) {
                    ret = {}
                    console.error(arguments)
                },
                success: function (data) {
                    // Responses are pairs of directory/file name and type.
                    // If type is 0, the name is a file.
                    // If type is 1, the name is a directory.
                    if (data.status != 0) {
                        ret = []
                    }
                    else {
                        ret = data.response[key]
                    }
                    fileCaches[key] = ret
                }
            })
        }

        return ret
    }
    let allowAllGeneralWidgets = function (item) {
        if (item instanceof wg.OptionWidget ||
            item instanceof wg.LogicStatement ||
            item instanceof wg.LogicView)
            return false

        return true
    }

    // base abstract classes
    let base = new function () {
        this.BaseWidget = Class.subClass(new function () {
            // static
            let $idSeed = 0
            // private
            //let this._private = {}

            this.init = function (field, xml) {
                let valid = true
                if (field instanceof ns.ElementWidget !== true)
                    valid = false

                let pvt = this._private

                pvt.id = ""
                pvt.isValid = valid
                pvt.field = field
                pvt.children = []
                pvt.parent = null
                pvt.css = ""
                pvt.element = this.prepareDOM()

                if (this.isValid()) {
                    pvt.id = "widget-" + (++$idSeed)
                    pvt.element.attr("id", pvt.id)

                    let $xml = $(xml)
                    let tmp = $xml.attr("class")
                    if (tmp) {
                        pvt.css = tmp
                        pvt.element.addClass(tmp)
                    }

                    tmp = $xml.attr("visibility")
                    if (tmp) {
                        pvt.visible = new ExpressionParser()
                        pvt.visible.parse(tmp, processScope)
                    }
                }
            }
            this.id = function () {
                return this._private.id
            }
            this.field = function () {
                return this._private.field
            }
            this.visible = function () {
                let pvt = this._private
                let ret = true
                if (typeof pvt.visible === "object")
                    ret = pvt.visible.evaluate()
                return ret
            }
            this.parent = function (parent) {
                // NOTE: there is actually a need to set parent
                // this makes parent will no longer be secured under the class
                if (parent &&
                    parent instanceof base.BaseWidget) {
                    this._private.parent = parent
                }

                return this._private.parent
            }
            this.children = function () {
                return this._private.children
            }
            this.attach = function (item) {
                let self = this
                if (item) {
                    if (item instanceof base.BaseWidget &&
                        item.isValid() &&
                        self.isAppendableChild(item)) {
                        item.parent(self)
                        this._private.children.push(item);
                        self.widget().append(item.widget());
                        this._private.element.append(item.widget());
                    }
                }
            }
            this.detach = function () {
                let self = this;
                if (self.isValid() && this._private.parent) {
                    //parent._children = jQuery.grep(parent._children, function (item)
                    //{
                    //    return item != self;
                    //});
                    this._private.parent.children().removeItem(self);
                    this._private.parent = null;
                    this._private.element.detach();
                }
            }
            this.isValid = function () {
                return this._private.isValid && this.widget() !== undefined;
            },
            this.widget = function () {
                return this._private.element;
            }
            this.isVisible = function () {
                return this._private.element.is(":visible");
            }
            //this.isExists = function () {
            //    console.log("[AH] EXISTS", this._private.element);
            //}
            this.isAppendableChild = function (child) {
                console.error("TODO: Need implement.");
            },
            // This is suppose to be private method...
            this.prepareDOM = function () {
                console.error("TODO: Need implement.");
            }
            this.processDocumentInit = function (doc) {
                // Default implementation: do nothing
            }
            // on events
            this.onWidgetAppended = function () {
                // default implementation
            }
        });
        this.ElementType = Class.subClass(new function () {
            // private

            this.init = function (name) {
                this._private.typename = name;
                this._private.entities = {};
                this._private.overrideDataEntities = false;
            }
            this.typename = function () {
                return this._private.typename;
            }
            this.dataEntities = function (name, entity) {
                let ret = this._private.entities;
                if (name || name === "") {
                    if (!this._private.overrideDataEntities) {
                        if (entity instanceof ns.DataEntity)
                            ret[name] = entity;
                    }

                    ret = ret[name];
                }

                return ret;
            }
            this.overrideDataEntties = function (entities) {
                this._private.overrideDataEntities = true;
                this._private.entities = entities;
            }
            this.renderWidget = function (field) {
                console.error("[TODO] Function needs override");
            }
        });
        this.BaseFormWidget = this.BaseWidget.subClass(new function () {
            this.init = function (field, xml) {
                this._super(field, xml);

                let pvt = this._private;
                let ptd = this._protected;
                ptd.hasError = "";
                ptd.hasProcessError = "";
                pvt.tooltip = "";
                pvt.entity = "";
                pvt.wrapper = null;
                pvt.widget = this.widget(),
                pvt.label = "";
                pvt.labelElement = null;
                pvt.name = "";

                if (this.isValid()) {
                    let self = this;
                    let widget = pvt.widget;

                    let $xml = $(xml);
                    let tmp = null;

                    tmp = $xml.attr("entity") || "DEFAULT";

                    pvt.entity = tmp;
                    widget.attr("entity", tmp);

                    tmp = $xml.attr("tooltip");
                    if (tmp) {
                        pvt.tooltip = tmp;
                        widget.attr("tooltip", tmp);
                    }

                    tmp = $xml.attr("name");
                    if (tmp) {
                        pvt.name = tmp;
                        widget.attr("name", tmp);
                    }

                    tmp = $xml.attr("label");
                    if (tmp) {
                        // init wrapper
                        pvt.wrapper = $("<ucm-container/>")
                            .attr("id", self.id() + "_wrapper")
                            .addClass("wrapper");

                        // init label
                        pvt.label = tmp;
                        pvt.labelElement = $("<label/>")
                            .addClass("label")
                            .attr("for", self.id())
                            .appendTo(pvt.wrapper);

                        if (tmp.length > 1 && tmp.lastIndexOf("@", 0) === 0) {
                            tmp = tmp.substring(1);
                            pvt.labelElement.attr("locale", tmp)
                            pvt.labelElement.text($.lang(tmp));
                        }
                        else
                            pvt.labelElement.text(tmp);

                        widget.appendTo(pvt.wrapper);
                    }
                    tmp = $xml.attr("value");
                    if (tmp) {
                        pvt.widget.val(tmp);
                    }

                    if (this.useDefaultWidgetEvents()) {
                        widget.on("keyup", function (e) {
                            // notify field when any change made to this widget
                            self.field().notifyOnFieldKeyEvent(self);
                        });
                        widget.on("change", function (e) {
                            // notify field when any change made to this widget
                            self.field().notifyOnFieldChange(self);
                        });
                        widget.on("focus", function (e) {
                            self.field().setInfoFormWidget(self);
                            self.onFocus();
                            e.stopPropagation();
                            //console.log("TRIGGER", e, self);
                        });

                        widget.on("blur", function (e) {
                            self.field().setInfoFormWidget(null);
                            self.onBlur();
                            e.stopPropagation();
                        });
                    }
                    // append self into the collection
                    field.appendFormWidget(this);
                }
            }
            this.onFocus = function () {
                let self = this;
                let widget = this._private.widget;
                let tooltip = self.tooltip();
                let error = self.hasProcessError() || self.hasError();


                let nearParent = widget.closest("ucm-container");
                let nearBody = widget.closest("body");
                let tooltipWidget = null;

                if (tooltip || error) {
                    if (nearParent.length > 0) {
                        tooltipWidget = nearParent.prev();

                        if (tooltipWidget.prop("tagName") == "ucm-tooltip".toUpperCase()) {
                            tooltipWidget.detach();
                        }
                        else {
                            tooltipWidget = null;
                        }
                    }

                    if (!tooltipWidget)
                        tooltipWidget = $("<ucm-tooltip/>");
                    else
                        tooltipWidget.stop(true, true);

                    //tooltipWidget.text(error || tooltip);


                    // error will need to translate
                    let labelValue = error ? error.toString() : tooltip;

                    if (labelValue.length > 1 && labelValue.lastIndexOf("@", 0) === 0) {
                        labelValue = $.lang(labelValue.substring(1));
                    }

                    if (error) {
                        tooltipWidget.addClass("error");
                    }

                    tooltipWidget.html(labelValue);
                    tooltipWidget.css("display", "block");

                }

                // clear all existing
                $("ucm-tooltip", nearBody).not(".not-remove").remove();

                if (tooltipWidget && nearParent.length > 0)
                    tooltipWidget.insertBefore(nearParent);
            }
            this.onBlur = function () {
                let widget = this._private.widget;
                let nearBody = widget.closest("body");
                if (nearBody.length > 0) {
                    $("ucm-tooltip", nearBody)
                        .not(".not-remove")
                        .delay(100)
                        .fadeOut(500)
                        .animate({ "opacity": 0 }, {
                            "complete": function () {
                                $(this).remove();
                            }
                        });
                    //$("ucm-tooltip", nearBody).remove();
                }

            }
            this.useDefaultWidgetEvents = function () {
                return true;
            }
            this.name = function () {
                // return defined name or id instead
                return this._private.name || this.id();
            }
            this.label = function () {
                return this._private.label;
            }
            this.labelText = function () {
                let pvt = this._private;
                if (pvt.labelElement)
                    return pvt.labelElement.text();
                return pvt.label;
            }
            this.validate = function () {
                this._protected.hasError = this.field().validate(this);
                return this._protected.hasError;
            }
            this.hasError = function () {
                return this._protected.hasError;
            }
            this.hasProcessError = function () {
                return this._protected.hasProcessError;
            }
            this.tooltip = function () {
                return this._private.tooltip;
            }
            this.entity = function () {
                return this._private.entity;
            }
            this.value = function () {
                // default implementation for "value()"
                if (this.isValid()) {
                    return this._private.widget.val();
                }
                else
                    console.error("Invalid FormWidget!", this);
            }
            this.displayValue = function () {
                // default implementation
                return this.value();
            }
            this.disabled = function (val) {
                let widget = this._private.widget;
                if (val !== undefined && val !== null) {
                    widget.removeAttr("disabled");
                    if (val) {
                        widget.removeClass("error"); // error should not be shown when disabled
                        widget.attr("disabled", "disabled");
                    }
                }

                return widget.attr("disabled") == "disabled";
            }
            this.prepareSubmitFormValue = function (callback) {
                // default implementation
                this.validate();
                this._protected.hasProcessError = "";
                if (this.hasError())
                    this._private.widget.focus();
                if (typeof callback === "function")
                    callback.call({}, this.formValue(), this.hasError());
            }
            this.formValue = function (val) {
                // default implementation for "formValue()"
                if (this.isValid()) {
                    let w = this._private.widget;
                    if (val != undefined && val != null) {
                        // also needs to clean error
                        this._protected.hasError = "";
                        this._protected.hasProcessError = "";
                        w.removeClass("error");
                        w.val(val);
                    }

                    return w.val();
                }
                else
                    console.error("Invalid FormWidget!", this);
            }
            this.formWidget = function () {
                return this._private.widget;
            }
            // override the original widget method
            this.widget = function () {
                if (this._private && this._private.wrapper)
                    return this._private.wrapper;

                return this._super();
            }
        });
        this.BindableWidget = this.BaseFormWidget.subClass(new function () {
            this.init = function (field, xml) {
                this._super(field, xml);

                let pvt = this._private;

                pvt.filter = null;

                if (this.isValid()) {
                    let $xml = $(xml);
                    let tmp;
                    tmp = $xml.attr("filter");

                    // Parse condition-elseif/else
                    if (tmp) {
                        pvt.filter = new ExpressionParser();
                        pvt.filter.parse(tmp, processScope);
                    }
                }

            }
            this.databind = function () {
                if (this.isValid() && this.isBindable()) {
                    let curValue = this.value();
                    this.children().length = 0;
                    this.formWidget().empty();

                    this.bindChildren();

                    // restore previous selected value when possible
                    if (curValue) {
                        this.formValue(curValue);
                    }
                }
            }
            this.filterSource = function (source) {
                let pvt = this._private;
                if (!pvt.filter)
                    return source;

                let ret = [];
                $.each(source, function (index, item) {
                    if (checkLogicCondition(pvt.filter, item)) {
                        ret.push(item);
                    }
                });

                return ret;
            }
            // must override function
            this.isBindable = function () {
                console.error("TODO: Need implement.");
            }
            this.bindChildren = function () {
                console.error("TODO: Need implement.");
            }
        });
    }
    // define available TypeView elements
    let wg = new function () {
        this.Container = base.BaseWidget.subClass(new function () {
            let tagName = "ucm-container";

            this.init = function (field, xml) {
                this._super(field, xml);
            }
            this.isAppendableChild = allowAllGeneralWidgets;
            // This is suppose to be private method...
            this.prepareDOM = function () {
                return $("<" + tagName + "/>");
            }
            this.processDocumentInit = function (doc) {
                //if ("registerElement" in doc)
                //    doc.registerElement(tagName);
            }
        });
        this.HorizontalLine = base.BaseWidget.subClass(new function () {
            this.init = function (field, xml) {
                this._super(field, xml);
            }
            this.isAppendableChild = function (child) {
                return false;
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                return $("<hr/>");
            }
        });
        this.InlineContent = base.BaseWidget.subClass(new function () {
            this.init = function (field, xml) {
                this._super(field, xml);

                if (this.isValid()) {
                    let widget = this.widget();
                    let $xml = $(xml);
                    let tmp;

                    tmp = $xml.attr("text");
                    if (tmp) {
                        let labelValue = tmp;

                        if (labelValue.length > 1 && labelValue.lastIndexOf("@", 0) === 0) {
                            let labelCode = labelValue.substring(1);
                            widget.attr("locale", labelCode);
                            labelValue = $.lang(labelCode);
                        }

                        widget.text(labelValue);
                    }
                }
            }
            this.isAppendableChild = function (child) {
                return false;
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                return $("<span/>");
            }
        });
        this.LabelWidget = base.BaseWidget.subClass(new function () {
            this.init = function (field, xml) {
                this._super(field, xml);

                if (this.isValid()) {
                    let widget = this.widget();
                    let $xml = $(xml);
                    let tmp;

                    tmp = $xml.attr("for");
                    if (tmp) {
                        widget.attr("for", tmp);
                    }

                    tmp = $xml.attr("text");
                    if (tmp) {
                        if (tmp.length > 1 && tmp.lastIndexOf("@", 0) === 0) {
                            tmp = tmp.substring(1);
                            widget.attr("locale", tmp)
                            widget.text($.lang(tmp));
                        }
                        else
                            widget.text(tmp);
                    }
                }
            }
            this.isAppendableChild = function (child) {
                return false;
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                return $("<label/>");
            }
        });
        this.LogicView = base.BaseWidget.subClass(new function () {
            let tagName = "ucm-view";

            this.init = function (field, xml) {
                this._super(field, xml);
            }
            this.isAppendableChild = allowAllGeneralWidgets;
            // This is suppose to be private method...
            this.prepareDOM = function () {
                return $("<" + tagName + "/>");
            }
            this.processDocumentInit = function (doc) {
                //if ("registerElement" in doc)
                //    doc.registerElement(tagName);
            }
        });
        this.LogicStatement = base.BaseWidget.subClass(new function () {
            let tagName = "ucm-condition";

            this.init = function (field, xml) {
                this._super(field, xml);

                this._private.condition = null;

                if (this.isValid()) {
                    let $xml = $(xml);
                    let tmp;
                    tmp = $xml.attr("cond");

                    // Parse condition-elseif/else
                    if (tmp) {
                        this._private.condition = new ExpressionParser();
                        this._private.condition.parse(tmp, processScope);
                    }
                }
            }
            this.checkCondition = function () {
                return checkLogicCondition(this._private.condition);
            }
            this.isAppendableChild = function (child) {
                // only allow LogicView as child
                return child instanceof wg.LogicView;
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                return $("<" + tagName + "/>");
            }
            this.processDocumentInit = function (doc) {
                //if ("registerElement" in doc)
                //    doc.registerElement(tagName);
            }
        });
        this.LogicContainer = base.BaseWidget.subClass(new function () {
            let tagName = "ucm-logic";

            // constructor
            this.init = function (field, xml) {
                this._super(field, xml);

                this._private.condition = null;
                this._private.current = null;

                if (this.isValid()) {
                    // TODO: needs to register to the parent ElementWidget
                    let $xml = $(xml);
                    let tmp;

                    // Parse condition-if
                    tmp = $xml.attr("cond");

                    this._private.condition = new ExpressionParser();
                    this._private.condition.parse(tmp, processScope);

                    // always hide by default
                    this.widget().hide();

                    field.appendLogicBlock(this);
                }
            }
            this.showValidBlock = function () {
                let self = this;
                let found = null;
                let items = self.children();

                // verify condition statements
                if (checkLogicCondition(this._private.condition) &&
                    items.length > 0) {
                    found = items[0];
                }
                else if (items.length > 1) {
                    for (let i = 1; i < items.length; i++) {
                        let item = items[i];
                        if (item.checkCondition()) {
                            found = item;
                            break;
                        }
                    }
                }

                let widget = this.widget();

                if (this._private.current != found) {
                    // detach existing item
                    if (this._private.current) {
                        this._private.current.widget().detach();
                    }

                    this._private.current = found;

                    if (found) {
                        widget.append(found.widget());
                        widget.show();
                    }
                }

                if (!found)
                    widget.hide();

                return found;
            }
            // override attach to skip adding direct into view
            this.attach = function (item) {
                let self = this;
                if (item) {
                    if (item instanceof base.BaseWidget &&
                        item.isValid() &&
                        self.isAppendableChild(item)) {
                        item.parent(self);
                        self.children().push(item);
                    }
                }
            }
            this.isAppendableChild = function (child) {
                // only one view is allowed under LogicContainer
                if (child instanceof wg.LogicView && this.children().length == 0) {
                    return true;
                }
                // ELSE only allow LogicStatement as child
                return child instanceof wg.LogicStatement && this.children().length > 0;
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                return $("<" + tagName + "/>");
            }
            this.processDocumentInit = function (doc) {
                //if ("registerElement" in doc)
                //    doc.registerElement(tagName);
            }
        });
        this.OptionWidget = base.BaseWidget.subClass(new function () {
            this.init = function (field, xml) {
                this._super(field, xml);

                let widget = this.widget();
                let $xml = $(xml);

                let text = $xml.attr("label");
                let value = $xml.attr("value");

                if (text && typeof (text.toString) === "function" ) {
                    text = text.toString();
                }

                if (value && typeof (value.toString) === "function" ) {
                    value = value.toString();
                }

                text = text ? text : value;
                if (!text) text = "";
                if (text.length > 1 && text.lastIndexOf("@", 0) === 0) {
                    text = text.substring(1);
                    widget.attr("locale", text);
                    widget.text($.lang(text));
                }
                else
                    widget.text(text);

                widget.attr("value", value || value === "" ? value : text);

                if ($xml.attr("selected") === true)
                    widget.attr("selected", "selected");
            }
            this.isAppendableChild = function (child) {
                return false;
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                return $("<option/>");
            }
        });

        this.FileSelectorWidget = base.BaseFormWidget.subClass(new function () {
            let tagName = "ucm-fileselector";
            let EMPTY_IMAGE = "/images/spacer.gif";

            let fileUploadQueue = new function () {
                let m_queue = [];
                let m_processing = null;

                let uploadedCallback = function () {
                    if (m_processing) {
                        m_queue.shift();
                    }

                    if (m_queue.length > 0) {
                        m_processing = m_queue[0];
                        // process next directly when failed
                        m_processing.uploadLogic.submit();
                        if (!m_processing.uploading)
                            uploadedCallback();
                    }
                    else
                        m_processing = null;
                }

                this.add = function (process) {
                    // TODO: if file upload CGI allow multiple file upload, we should adjust here
                    if (process.uploadLogic) {
                        m_queue.push(process);
                        process.uploading = true;
                        process.uploadedCallback = uploadedCallback;
                        if (!m_processing)
                            uploadedCallback();
                    }
                }
            }

            let rebuildFileList = function (pvt, reload) {
                let fileList = listZeroConfigDirectory(pvt.fileType, reload);
                let selector = pvt.fileselect;
                let originalVal = selector.val();

                selector.empty();
                $.each(fileList, function (index, item) {
                    if (!pvt.allowExtension || item.t == "directory" || pvt.allowExtension.test(item.n)) {
                        selector.append($("<option/>")
                                            .attr("value", item.p)
                                            .attr("base", item.b)
                                            .attr("type", item.t)
                                            .text(item.n));
                    }
                });

                let defaultOption = $("<option/>").attr("value", "");
                let defaultOptionName = pvt.defaultOptionName;
                if (defaultOptionName.length > 1 && defaultOptionName.lastIndexOf("@", 0) === 0) {
                    defaultOptionName = defaultOptionName.substring(1);
                    defaultOption.attr("locale", defaultOptionName)
                    defaultOption.text($.lang(defaultOptionName));
                }

                selector.prepend(defaultOption);

                if (pvt.allowUpload) {
                    selector.append($("<option/>")
                                        .attr("locale", "LANG3507")
                                        .attr("value", "-1")
                                        .addClass("highlight")
                                        .text($.lang("LANG3507")));
                }

                if (originalVal)
                    selector.val(originalVal);
            }
            this.reloadControlState = function () {
                let pvt = this._private;

                let selected = pvt.fileselect.val();
                if (selected === "-1") {
                    pvt.uploadContainer.show();
                    if(pvt.uploadFileName) {
                        if (pvt.imagePreview) {
                            pvt.imagePreview.empty();
                            pvt.imageDimension.text("");

                            let img = new Image();

                            img.onload = function () {
                                pvt.imagePreview.empty();
                                pvt.imageDimension.text(this.width + " x " + this.height);
                                img.className = "preview";
                                pvt.imagePreview[0].appendChild(img);
                            }
                            img.src = pvt.uploadFileName;
                            //pvt.imagePreview.attr("src", pvt.uploadFileName || EMPTY_IMAGE);
                        }
                        pvt.fileselect.val(pvt.uploadFileName);
                        pvt.uploadFileName = "";
                        pvt.uploadContainer.hide();
                    }
                    pvt.removeButton.attr("disabled", "disabled").css("display", "none");
                }
                else {
                    pvt.uploadContainer.hide();

                    if (selected) {
                        pvt.removeButton.removeAttr("disabled").css("display", "inline-block");
                    }
                    else
                        pvt.removeButton.attr("disabled", "disabled").css("display", "none");

                    if (pvt.enablePreview) {
                        pvt.imagePreview.empty();
                        pvt.imageDimension.text("");
                        if (selected) {
                            let img = new Image();

                            img.onload = function () {
                                pvt.imagePreview.empty();
                                pvt.imageDimension.text(this.width + " x " + this.height);
                                img.className = "preview";
                                pvt.imagePreview[0].appendChild(img);
                            }
                            img.src = selected;
                        }
                    }
                }
            }
            this.disabled = function (val) {
                let pvt = this._private;

                if (val != undefined && val != null) {
                    pvt.fileselect.removeAttr("disabled");
                    pvt.uploadInput.removeAttr("disabled");
                    pvt.uploadButton.removeAttr("disabled");
                    pvt.uploadLogic.enable();

                    if (val) {
                        this.widget().removeClass("error");
                        pvt.fileselect.attr("disabled", "disabled");
                        pvt.uploadInput.attr("disabled", "disabled");
                        pvt.uploadButton.attr("disabled", "disabled");
                        pvt.uploadLogic.disable();
                        this.onBlur();
                    }

                }

                return pvt.fileselect.attr("disabled") == "disabled";
            }
            this.init = function (field, xml) {
                this._super(field, xml);

                let self = this;
                let widget = this.widget();
                let fwidget = this.formWidget();
                let pvt = this._private;
                let ptd = this._protected;

                let $xml = $(xml);
                let tmp;
                tmp = $xml.attr("type");
                pvt.fileType = tmp ? tmp : "";

                tmp = $xml.attr("allowUpload");
                pvt.allowUpload = tmp === "true" ? true : false;
                tmp = $xml.attr("allowDelete");
                pvt.allowDelete = tmp === "true" ? true : false;
                tmp = $xml.attr("allowManage");
                pvt.allowManage = tmp === "true" ? true : false;
                tmp = $xml.attr("defaultOptionName");
                pvt.defaultOptionName = tmp ? tmp : "";

                if ( BLL.ConfigPage.modelInfo() != undefined && BLL.ConfigPage.modelInfo().name() != undefined )
                {
                    pvt.modelName = BLL.ConfigPage.modelInfo().name().toLowerCase();
                }


                //pvt.uploadHandler = tmp ? tmp : "";
                //tmp = $xml.attr("rootDirectory");
                //pvt.rootDirectory = tmp ? tmp : "";
                //tmp = $xml.attr("listOption");
                //pvt.listOption = tmp ? tmp : "all";

                //pvt.uploadData = { "path": pvt.rootDirectory, "name": "" };
                pvt.uploaded = false;
                pvt.uploading = false;
                pvt.allowExtension = null;
                pvt.allowExtensionValue = "";
                pvt.uploadFileName = "";
                pvt.imagePreview = null;
                pvt.imageDimension = null;
                pvt.enablePreview = false;
                pvt.innerContainer = null;

                tmp = $xml.attr("allowExtension");
                if (tmp) {
                    pvt.allowExtension = new RegExp(".(" + tmp + ")$", "i");
                    pvt.allowExtensionValue = tmp;
                }

                // Parse condition-elseif/else
                if (tmp) {
                    this._private.condition = new ExpressionParser();
                    this._private.condition.parse(tmp, processScope);
                }
                let innerContainer = pvt.innerContainer = $("<div/>")
                                        .appendTo(fwidget);

                let selector = $("<select/>")
                                .attr("id", this.id() + "_selector")
                                .appendTo(innerContainer)
                                .on("change", function (e) {
                                    ptd.hasProcessError = "";
                                    self.reloadControlState();
                                    self.validate(); // use to clear the error
                                    self.onFocus();
                                    self.field().notifyOnFieldChange(self);
                                })
                                .on("focus", function (e) {
                                    self.field().setInfoFormWidget(self);
                                    self.onFocus();

                                    rebuildFileList(pvt, false);
                                    self.reloadControlState();
                                    e.stopPropagation();
                                    //console.log("TRIGGER", e, self);
                                })
                                .on("blur", function (e) {
                                    self.field().setInfoFormWidget(null);
                                    self.onBlur();
                                    e.stopPropagation();
                                });

                pvt.fileselect = selector;

                let controlContainer = $("<div/>")
                    .addClass("controls")
                    .appendTo(innerContainer);

                let originalDialog = top.dialog.currentDialogType;

                pvt.removeButton = $("<span/>")
                    .attr("localeTitle", "LANG739")
                    .attr("title", $.lang("LANG739"))
                    .addClass("button delete")
                    .on("click", function (e) {

                        let selector = pvt.fileselect;
                        //let originalVal = selector.val();
                        let option = $("option:selected", selector);
                        let originalVal = option.text();
                        let originalBase = option.attr("base") || "";

                        top.dialog.dialogConfirm({
                            confirmStr: function () {
                                let tips = "";

                                tips = "<br/>" + originalVal;

                                //if (selectedItems.length > 0) {
                                //    tips = '<br />' + confirmItemList.join('<br/>');
                                //}

                                return $.lang("LANG818").format(tips);
                            },
                            buttons: {
                                ok: function () {

                                    removeZeroConfigPath(pvt.fileType, originalBase, originalVal);

                                    rebuildFileList(pvt, true);
                                    ptd.hasProcessError = "";
                                    self.reloadControlState();
                                    self.validate(); // use to clear the error
                                    self.onFocus();
                                    self.field().notifyOnFieldChange(self);

                                    if (originalDialog) {
                                        top.dialog.restorePrevContentDialog();
                                    }
                                },
                                cancel: function () {
                                    if (originalDialog) {
                                        top.dialog.restorePrevContentDialog();
                                    }
                                    //top.dialog.clearDialog();

                                }
                            }
                        });

                    });

                if (pvt.allowDelete) {
                    pvt.removeButton.appendTo(controlContainer);
                }

                pvt.refreshButton = $("<span/>")
                    .addClass("button reload")
                    .attr("localeTitle", "LANG109")
                    .attr("title", $.lang("LANG109"))
                    .appendTo(controlContainer)
                    .on("click", function (e) {
                        selector.attr("disabled", "disabled");
                        setTimeout(function () {
                            rebuildFileList(pvt, true);
                            selector.removeAttr("disabled");
                        }, 0);
                    });

                pvt.manageButton = $("<span/>")
                    .addClass("button manage")
                    .attr("localeTitle", "LANG3846")
                    .attr("title", $.lang("LANG3846"))
                    .on("click", function (e) {
                        let path = "html/zc_filemanager_modal.html?type=" + pvt.fileType;
                        if (pvt.allowExtensionValue.length > 0)
                            path += "&format=" + pvt.allowExtensionValue;

                        if (pvt.hasOwnProperty('modelName') && pvt.modelName.length > 0 )
                            path += "&model=" + pvt.modelName;

                        top.dialog.dialogInnerhtml({
                            dialogTitle: $.lang("LANG3850").format(pvt.fileType),
                            displayPos: "editForm",
                            frameSrc: path,
                            closeCallback: function () {
                                rebuildFileList(pvt, true);
                                if (originalDialog) {
                                    top.dialog.restorePrevContentDialog();
                                }
                            }
                        });

                    });

                if (pvt.allowManage) {
                    //$("<div></div>")
                    //    .append($("<span/>").html("&nbsp;").addClass("icon edit"))
                    //    .append($("<span/>").attr("locale", "LANG3846").text($.lang("LANG3846")).addClass("label"))
                    //    .addClass("controlButton")
                    //    .appendTo(innerContainer);
                    pvt.manageButton.appendTo(controlContainer);
                }

                // rebuild file list
                rebuildFileList(pvt, false);

                pvt.uploadContainer = $("<div/>")
                    .attr("id", this.id() + "_uploadContainer")
                    .addClass("upload-container")
                    .hide()
                    .appendTo(innerContainer);
                pvt.uploadInput = $("<input/>")
                    .attr("id", this.id() + "_uploadInput")
                    .attr("name", "fileUrl")
                    .attr("type", "text")
                    .attr("readonly", "readonly")
                    .appendTo(pvt.uploadContainer);
                pvt.uploadButton = $("<button/>")
                    .attr("id", this.id() + "_uploadButton")
                    .attr("type", "button")
                    .addClass("selectBtn")
                    .appendTo(pvt.uploadContainer);
                pvt.imagePreview = null;
                let modelInfo = "";
                if ( pvt.hasOwnProperty('modelName') && pvt.modelName.length > 0 )
                    modelInfo = "&extra=" + pvt.modelName;
                pvt.uploadLogic = new AjaxUpload(pvt.uploadButton[0], {
                    action: "/cgi?action=uploadfile&type=zc_" + pvt.fileType + modelInfo,
                    name: "filename",
                    doc: nss.ConfigPage.currentDocument(),
                    win: nss.ConfigPage.currentWindow(),
                    data: pvt.uploadData,
                    autoSubmit: false,
                    responseType: 'json',
                    onChange: function (file, ext) {
                        pvt.uploadInput.val(file);
                        pvt.uploadFileName = "";
                        pvt.uploaded = false;
                    },
                    onSubmit: function (file, ext) {
                        pvt.uploadFileName = "";
                        ptd.hasProcessError = "";
                        ptd.hasProcessError = self.validate();

                        if (ptd.hasProcessError === "") {
                          self.onBlur();
                          pvt.uploading = true;
                          return true;
                        }

                        pvt.uploading = false;

                        return false;
                    },
                    onComplete: function (file, data) {
                        /* this.enable(); */
                        data = eval(data);
                        let me = this;
                        if (data) {
                            let status = data.status;
                            let response = data.response;

                            if (status == 0 && response) {
                                pvt.uploaded = true;
                                rebuildFileList(pvt, true);
                                if (response.path)
                                    pvt.uploadFileName = response.path.replace("//", "/");
                                //pvt.uploadData.name = pvt.uploadFileName;
                                self.reloadControlState();
                                //} else if (response) {
                                //    // ERROR
                                //    ptd.hasProcessError = response;
                            } else {
                                // ERROR
                                ptd.hasProcessError = $.lang("LANG4483");
                            }
                        } else {
                            // ERROR
                            ptd.hasProcessError = $.lang("LANG4483");
                        }

                        pvt.uploading = false;
                        if (typeof pvt.uploadedCallback === "function") {
                            pvt.uploadedCallback.call(pvt);
                        }
                    }
                });


                tmp = $xml.attr("imagePreview");
                if (tmp && tmp == "true") {
                    pvt.enablePreview = tmp;

                    pvt.imagePreview = $("<div />")
                        .appendTo(innerContainer);

                    pvt.imageDimension = $("<div />")
                        .addClass("dimension")
                        .appendTo(innerContainer);
                }

                widget.on("focus", function (e) {
                    self.field().setInfoFormWidget(self);
                    self.onFocus();
                    e.stopPropagation();
                    //console.log("TRIGGER", e, self);
                });
                widget.on("blur", function (e) {
                    self.field().setInfoFormWidget(null);
                    self.onBlur();
                    e.stopPropagation();
                });

            }
            this.useDefaultWidgetEvents = function () {
                return false;
            }
            this.validate = function () {
                let pvt = this._private;
                let ptd = this._protected;

                ptd.hasError = this.field().validate(this);

                if (ptd.hasError === "")
                {
                    if (this.type() != "directory" && pvt.allowUpload && pvt.allowExtension && !pvt.allowExtension.test(this.value())) {
                      ptd.hasError = $.lang("LANG4112^" + pvt.allowExtensionValue.split("|").join(", ")).replace("<br/>","");
                    }
                }

                return ptd.hasError;
            }
            this.value = function () {
                let pvt = this._private;
                let selVal = pvt.fileselect.val();

                //return selVal == "-1" ? pvt.uploadFileName : pvt.fileselect.val();
                if (selVal == "-1") {
                    return pvt.uploadFileName ? pvt.uploadFileName : pvt.uploadInput.val()
                }
                else
                    return pvt.fileselect.val();
            }
            this.prepareSubmitFormValue = function (callback) {
                // default implementation
                let self = this;
                let pvt = this._private;
                let ptd = this._protected;
                let selVal = pvt.fileselect.val();

                ptd.hasProcessError = "";

                //alert(pvt.uploadInput.val());
                //console.log("[AH] FILE:", pvt.uploadInput.val());
                if (selVal == "-1" && pvt.allowUpload && !pvt.uploaded && pvt.uploadInput.val()) {
                    fileUploadQueue.add(pvt);
                    //pvt.uploadLogic.submit();
                }

                (function waitForReturn() {
                    if (pvt.uploading) {
                        setTimeout(waitForReturn, 100);
                    }
                    else {
                        self.validate();
                        let error = self.hasProcessError() || self.hasError();

                        if (error)
                            self.onFocus();

                        if (typeof callback === "function") {
                            callback.call({}, self.formValue(), error);
                        }
                    }
                })();
            }

            this.formValue = function (val) {
                if (this.isValid()) {
                    let pvt = this._private;
                    let w = pvt.fileselect;

                    if (val != undefined && val != null) {
                        let found = w.find("option[value='" + val + "']");
                        if (found.length > 0) {
                            w.val(val);
                        }
                        else
                            w.find("option").eq(0).prop("selected", true);
                        pvt.uploadFileName = "";
                        this.reloadControlState();
                    }

                    return this.value();
                }
                else
                    console.error("Invalid FormWidget!", this);
            }
            this.isAppendableChild = function (child) {
                return false;
            }
            this.displayValue = function () {
                let widget = this.formWidget();

                return $("option:selected", widget).text() || "";
            }
            this.prepareDOM = function () {
                return $("<" + tagName + "/>");
            }
            this.type = function () {
                let widget = this.formWidget();

                return $("option:selected", widget).attr("type") || "";
            }
        })
        this.InputWidget = base.BaseFormWidget.subClass(new function () {
            this.init = function (field, xml) {
                this._super(field, xml);

                let pvt = this._private;
                pvt.type = "text";

                if (this.isValid()) {
                    let $xml = $(xml);
                    let widget = this.formWidget();
                    let tmp;
                    tmp = $xml.attr("type");


                    // only support checkbox | password | text for now
                    if (tmp !== "checkbox" &&
                        tmp !== "password") {
                        tmp = "text";
                    }

                    widget.attr("type", tmp);
                    pvt.type = tmp;

                    if (tmp !== "checkbox") {
                        tmp = $xml.attr("watermark");
                        if (tmp) {
                            widget.watermark(tmp);
                            widget.addClass("jq_watermark");
                            widget.attr("placeholder", tmp);
                        }
                    }
                }
            }
            // override original implementation
            this.isAppendableChild = function (child) {
                return false;
            }
            this.formValue = function (val) {
                // default implementation for "formValue()"
                if (this._private.type == "checkbox") {
                    if (this.isValid()) {
                        let w = this.formWidget();
                        if (val != undefined && val != null) {
                            w.prop("checked", val == this.value());
                        }

                        return w.prop("checked") ? this.value() : undefined;
                    }
                }
                else
                    return this._super(val);
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                return $("<input/>");
            }
        });
        // This particular checkbox will be different from regular checkbox as it does not need to
        // contain any form widget attributes
        this.SubCheckboxWidget = base.BaseWidget.subClass(new function () {
            this.init = function (field, xml) {
                this._super(field, xml);

                let widget = this.widget();
                let $xml = $(xml);

                let pvt = this._private;

                let text = $xml.attr("label");
                let value = $xml.attr("value");
                let wid = this.id();
                let idName = wid + "_checkbox";

                pvt.checkbox = $("<input/>")
                                .attr("id", idName)
                                .attr("type", "checkbox")
                                .appendTo(widget);
                pvt.label = $("<label/>")
                                .attr("id", wid + "_label")
                                .attr("for", idName)
                                .appendTo(widget);


                text = text ? text : value;
                if (!text) text = "";
                if (text.length > 1 && text.lastIndexOf("@", 0) === 0) {
                    text = text.substring(1);
                    pvt.label.attr("locale", text);
                    pvt.label.text($.lang(text));
                }
                else
                    pvt.label.text(text);

                pvt.checkbox.attr("value", value || value === "" ? value : text);

                if ($xml.attr("checked") === true)
                    pvt.checkbox.prop("checked", true);
            }
            this.isAppendableChild = function (child) {
                return false;
            }
            this.label = function () {
                let pvt = this._private;
                return pvt.label.text();
            }
            this.value = function () {
                let pvt = this._private;
                return pvt.checkbox.attr("value");
            }
            this.checked = function () {
                let pvt = this._private;
                return pvt.checkbox.is(":checked");
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                // return div as the holder
                return $("<div/>");
            }
        });
        this.CheckListWidget = base.BindableWidget.subClass(new function () {
            let tagName = "ucm-checklist";

            this.init = function (field, xml) {
                this._super(field, xml);

                this._private.source = "";
                this._private.dataTextField = "label";
                this._private.dataValueField = "value";

                let $xml = $(xml);
                let tmp;
                tmp = $xml.attr("optionsource");
                if (tmp) this._private.source = tmp;
                tmp = $xml.attr("labelfield");
                if (tmp) this._private.dataTextField = tmp;
                tmp = $xml.attr("valuefield");
                if (tmp) this._private.dataValueField = tmp;
            }
            this.source = function () {
                return this._private.source;
            }
            this.dataTextField = function () {
                return this._private.dataTextField;
            }
            this.dataValueField = function () {
                return this._private.dataValueField;
            }
            this.formValue = function (val) {
                if (this.isValid()) {
                    let w = this.formWidget();
                    let ret = [];
                    if (w && val != undefined && val != null) {
                        // remove the extra comma
                        val = val.replace(/,+$/, "");
                        let values = val.split(",");

                        // reset all check values
                        w.find("input").prop("checked", false);

                        for (let i = 0; i < values.length; i++) {
                            let found = w.find("input[value='" + values[i] + "']");
                            if (found.length > 0) {
                                found.prop("checked", true);
                                ret.push(values[i]);
                            }
                        }
                    }
                    else {
                        let items = this.children();
                        for (let i = 0; i < items.length; i++) {
                            if (items[i].checked())
                                ret.push(items[i].value())
                        }
                    }

                    if (ret.length > 0) {
                        ret.sort();
                        ret.push("");
                    }

                    return ret.toString();
                }
                else
                    console.error("Invalid FormWidget!", this);
            }
            this.isAppendableChild = function (child) {
                // only accept option as child under select widget
                if (child instanceof wg.SubCheckboxWidget)
                    return true;

                return false;
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                // return div as the holder
                return $("<" + tagName + "/>");
            }
            this.isBindable = function () {
                return this._private.source != "";
            }
            this.bindChildren = function () {
                let self = this;
                let source = ns.ListOracle.findList(this._private.source);

                if (source && source.getItems) {
                    let pvt = this._private;
                    let field = this.field();
                    source = self.filterSource(source.getItems());

                    $.each(source, function (index, item) {
                        let data = {
                            "label": item[pvt.dataTextField],
                            "value": item[pvt.dataValueField]
                        };

                        // checkbox list won't generate empty item.
                        // It needs to contain at least label or value
                        if (data.label || data.value) {
                            let newItem = new wg.SubCheckboxWidget(field, data);

                            self.attach(newItem);
                        }
                    });
                }
            }
            // override default display value
            this.displayValue = function () {
                let items = this.children();
                let ret = [];

                for (let i = 0; i < items.length; i++) {
                    if (items[i].checked())
                        ret.push(items[i].label())
                }

                return ret.toString();
            }
        });

        this.SelectWidget = base.BindableWidget.subClass(new function () {
            let setValue = function(self, value) {
                let pvt = self._private;
                let fWidget = self.formWidget();

                if (pvt.lazyBind === true && pvt.boundSource !== null) {
                    // under lazy bind mode, we need to clean up the current list
                    self.children().length = 0;
                    fWidget.empty();

                    let found = pvt.boundSource[value];
                    let newItem = null;
                    if (found) {
                        newItem = new wg.OptionWidget(self.field(), found);
                    } else if (found = pvt.boundList[0]) {
                        newItem = new wg.OptionWidget(self.field(), found);
                    }

                    if (newItem)
                        self.attach(newItem);
                } else {
                    if (fWidget && value != undefined && value != null) {
                        let found = fWidget.find("option[value='" + value + "']");
                        if (found.length > 0) {
                            fWidget.val(value);
                        }
                        else
                            fWidget.find("option").eq(0).prop("selected", true);
                    }
                }

                fWidget.trigger("chosen:updated");
            }

            this.init = function (field, xml) {
                this._super(field, xml);

                this._private.source = "";
                this._private.dataTextField = "label";
                this._private.dataValueField = "value";
                this._private.lazyBind = false;
                this._private.boundList = null;
                this._private.boundSource = null;

                let $xml = $(xml);
                let tmp;
                tmp = $xml.attr("optionsource");
                if (tmp) this._private.source = tmp;
                tmp = $xml.attr("labelfield");
                if (tmp) this._private.dataTextField = tmp;
                tmp = $xml.attr("valuefield");
                if (tmp) this._private.dataValueField = tmp;
            }
            this.source = function () {
                return this._private.source;
            }
            this.dataTextField = function () {
                return this._private.dataTextField;
            }
            this.dataValueField = function () {
                return this._private.dataValueField;
            }
            this.formValue = function (val) {
                if (this.isValid()) {
                    let w = this.formWidget();
                    let pvt = this._private;
                    if (w && val != undefined && val != null) {
                        setValue(this, val);
                    }

                    return this.formWidget().val();
                }
                else
                    console.error("Invalid FormWidget!", this);
            }
            this.isAppendableChild = function (child) {
                // only accept option as child under select widget
                if (child instanceof wg.OptionWidget)
                    return true;

                return false;
            }
            // This is suppose to be private method...
            this.prepareDOM = function () {
                let ret = $("<select/>");
                return ret;
            }
            this.isBindable = function () {
                return this._private.source != "";
            }
            this.bindChildren = function () {
                let self = this;
                let source = ns.ListOracle.findList(this._private.source.toString());

                if (source && source.getItems) {
                    let pvt = this._private;
                    let field = this.field();
                    source = self.filterSource(source.getItems());

                    pvt.boundList = [];
                    pvt.boundSource = {};
                    pvt.lazyBind = true;

                    $.each(source, function (index, item) {
                        let data = {
                            "label": item[pvt.dataTextField],
                            "value": item[pvt.dataValueField]
                        };

                        pvt.boundList.push(data);
                        pvt.boundSource[data.value] = data;
                    });

                    let found = pvt.boundList[0];

                    if (found) {
                        let newItem = new wg.OptionWidget(field, found);

                        self.attach(newItem);
                    }
                    let fWidget = self.formWidget();
                    fWidget.one("chosen:showing_dropdown", function (evt, params) {
                        // clean up the current list
                        self.children().length = 0;
                        fWidget.empty();

                        // actual binding here
                        $.each(pvt.boundList, function (index, item) {
                            let newItem = new wg.OptionWidget(field, item);
                            if (newItem.widget().text().length > 0)
                                self.attach(newItem);
                        });

                        // the end
                        pvt.lazyBind = false;

                        params.chosen.results_update_field();

                        // this will fix the first bind unable to select first option issue
                        fWidget.one("chosen:hiding_dropdown", function (e) {
                            // notify field when any change made to this widget
                            self.field().notifyOnFieldChange(self);
                        });
                    });
                }
            }
            this.value = function () {
                // default implementation for "value()"
                if (this.isValid()) {
                    return this.formValue();
                }
                else
                    console.error("Invalid FormWidget!", this);
            }
            // override default display value
            this.displayValue = function () {
                let widget = this.formWidget();

                return $("option:selected", widget).text() || "";
            }
            this.disabled = function (val) {
                let widget = this.formWidget();
                if (val !== undefined && val !== null) {
                    widget.removeAttr("disabled");
                    if (val) {
                        widget.removeClass("error"); // error should not be shown when disabled
                        widget.attr("disabled", true);
                    }
                    widget.trigger("chosen:updated");
                }

                return widget.attr("disabled") == true;
            }

            this.onWidgetAppended = function () {
                // default implementation
                let self = this;
                let fWidget = self.formWidget();
                fWidget.chosen({
                    "width": "180px",
                    "disable_search_threshold": 8,
                    "allow_single_deselect": true,
                    "placeholder_text_single": "LANG4129",
                    "no_results_text": "LANG4130"
                });
            }
        });
    }



    // public classes
    // Provision building block: block
    this.Block = function (id, name, label, isType, visibility) {
        // private
        let m_key_item_mapping = null;

        // public
        this.id = id;
        this.name = name;
        this.label = label;
        this.isType = isType;
        this.visibility = visibility;
        this.items = [];

        // helper functions
        this.appendItem = function (item) {
            if (!m_key_item_mapping)
                m_key_item_mapping = {};

            this.items.push(item);
            m_key_item_mapping[item.id] = item;
        }

        this.rebuildKeyItemMapping = function () {
            m_key_item_mapping = {};

            for (let i = 0; i < items.length; i++) {
                m_key_item_mapping[items[i]] = items[i];
            }
        }

        this.findItemByKey = function (key) {
            if (!m_key_item_mapping)
                this.rebuildKeyItemMapping();

            return m_key_item_mapping[key];
        }
    };

    // Provision building block: blockelement
    this.BlockElement = function (id, name, label, visibility) {
        // private
        let m_key_item_mapping = null;

        this.id = id;
        this.name = name;
        this.label = label;
        this.visibility = visibility;
        this.items = [];

        // helper functions
        this.appendItem = function (item) {
            if (!m_key_item_mapping)
                m_key_item_mapping = {};

            this.items.push(item);
            m_key_item_mapping[item.uniqueId()] = item;
        }

        this.rebuildKeyItemMapping = function () {
            m_key_item_mapping = {};

            for (let i = 0; i < items.length; i++) {
                m_key_item_mapping[items[i].uniqueId()] = items[i];
            }
        }

        this.findItemByKey = function (key) {
            if (!m_key_item_mapping)
                this.rebuildKeyItemMapping();

            return m_key_item_mapping[key];
        }
    }


    // Provision building block: element
    this.Element = function (id, name, label, type, defaultValue, tooltip, regex, validation, monitor, maxoccurs, visibility) {
        this.id = id;
        this.name = name;
        this.label = label;
        this.type = type;
        this.defaultValue = defaultValue;
        this.tooltip = tooltip;
        this.validateRegex = regex;
        this.validateError = validation;
        this.monitor = monitor;
        this.maxoccurs = maxoccurs;
        this.visibility = visibility;
        this.elementNum = 1;
    };

    this.Element.prototype.uniqueId = function () {
        return this.id + "#" + this.elementNum;
    }

    this.Element.prototype.generateElementInfo = function () {
        let ret = {};
        ret["unqueIdWithMac"] = this.uniqueIdWithMac();
        return ret;
    }

    this.Element.prototype.uniqueIdWithMac = function () {
        return UCMGUI.gup.call(BLL.ConfigPage.currentWindow(), "mac") + "." + this.id + "." + this.elementNum;
    }

    // Provision building block: list
    this.List = function (id, name, source, defaultLabel, defaultValue) {
        let _id = id;
        let _name = name;
        let _defaultLabel = defaultLabel
        let _defaultValue = defaultValue
        let _items = [];

        // Share letiable data
        let _source = source;
        let _labelfield = null;
        let _valuefield = null;
        let _request = null;

        // Getters
        this.getID = function () {
            return _id;
        };

        this.getName = function () {
            return _name;
        };

        this.getSource = function () {
            return _source;
        };

        this.getItems = function () {
            return _items;
        };

        // Helpers
        this.removeItems = function () {
            while (_items.length > 0) {
                _items.pop();
            }
        };

        this.appendItem = function (label, value) {
            // _items.push({ "label": label, "value": value });
            let item = {};
            item.label = label;
            item.value = value;
            _items[_items.length] = item;
        };

        this.appendObjectItem = function (obj) {
            _items.push(obj);
        };

        this.prepare = function () {
            if (!_source) {
                return;
            }

            // Dynamic list
            // Initialize share letiable data
            if (!_request) {
                // Constructing the request with options
                if (_items.length === 1) {
                    // Get label and value fields
                    _labelfield = _items[0].label;
                    _valuefield = _items[0].value;

                    // Assign argument value
                    if (_labelfield && _valuefield) {
                        _request = _source.toString() + "[options=" +
                        _labelfield.toString() + "," +
                        _valuefield.toString() + "]";
                    }
                    else {
                        // Constructing the request without options
                        _labelfield = "";
                        _valuefield = "";
                        _request = _source.toString();
                    }
                }

                // Clean up
                this.removeItems();
            }

            // Append a request to the value delegation
            if (_request) {
                this.removeItems();

                ZEROCONFIG.valueDelegation.appendRequest(_request, this);
            }
        };

        this.update = function (name, data) {
            let response;
            let label;
            let value;
            let index;
            let length;

            console.log("[TK] List-name: " + name + ", data: ", data);

            // Sanity check
            if (data.status !== 0) {
                console.warn("List-Invalid status, name: " + name +
                              ", data: ", data);
                return;
            }

            // Append default option
            this.appendItem(_defaultLabel, _defaultValue);

            // Get the response object
            response = data.response;

            // Parser
            for (let key in response) {
                // LDAP phonebook
                if (key === "ldap_phonebooks") {
                    let phonebooks = response[key]
                    length = phonebooks.length

                    for (index = 0; index < length; index++) {
                        if (_labelfield && _valuefield) {
                            label = phonebooks[index][_labelfield].toUpperCase()
                            value = phonebooks[index][_valuefield]

                            this.appendItem(label, value)
                        }
                        else {
                            this.appendObjectItem(phonebooks[index])
                        }
                    }
                }
                // Available SIP Account
                else if (key == "listAvailableSIPAccount") {
                    let accounts = response[key]
                    length = accounts.length

                    for (index = 0; index < length; index++) {
                        if (_labelfield && _valuefield) {
                            label = accounts[index][_labelfield];
                            value = accounts[index][_valuefield];

                            this.appendItem(label, value);
                        }
                        else {
                            this.appendObjectItem(accounts[index]);
                        }
                    }
                }
                else {
                    let ret = response[key];
                    length = ret.length;

                    for (index = 0; index < length; index++) {
                        if (_labelfield && _valuefield) {
                            label = ret[index][_labelfield];
                            value = ret[index][_valuefield];

                            this.appendItem(label, value);
                        }
                        else {
                            this.appendObjectItem(ret[index]);
                        }
                    }
                }
            }
        };
    };

    this.ImageMapping = function (id, path) {
        let _id = id;
        let _path = path;
        let _regions = {};

        // Getters
        this.getID = function () {
            return _id;
        };

        this.getPath = function () {
            return _path;
        };

        this.getRegions = function () {
            return _regions;
        };

        // Helpers
        this.appendRegion = function (id, region) {
            _regions[id] = region;
        };
    };

    this.ImageMappingRegion = function (id, x, y, width, height) {
        let _id = id;
        let _x = x;
        let _y = y;
        let _width = width;
        let _height = height;
        let _links = {};

        // Getters
        this.getID = function () {
            return _id;
        };

        this.getX = function () {
            return _x;
        };

        this.getY = function () {
            return _y;
        };

        this.getWidth = function () {
            return _width;
        };

        this.getHeight = function () {
            return _height;
        };
        this.toCoords = function () {
            return _x + "," + _y + "," + (_x + _width) + "," + (_y + _height);
        }
        this.getLink = function (pageName) {
            return _links[pageName];
        }
        // Helpers
        this.appendLink = function (page_name, link) {
            _links[page_name] = link;
        };
    };

    this.ImageMappingRegionLink = function (page_name, scope_name, level1, level2, level3) {
        let _pageName = page_name;
        let _scopeName = scope_name;
        let _level1 = level1;
        let _level2 = level2;
        let _level3 = level3;

        // Getters
        this.getPageName = function () {
            return _pageName;
        };

        this.getScopeName = function () {
            return _scopeName;
        };

        this.getLevel1 = function () {
            return _level1;
        };

        this.getLevel2 = function () {
            return _level2;
        };

        this.getLevel3 = function () {
            return _level3;
        };
        this.getFullPath = function () {
            let ret = "";
            if (_level1) {
                ret += _level1;
                if (_level2) {
                    ret += "." + _level2;

                    if (_level3) {
                        ret += "." + _level3;
                    }
                }
            }

            return ret;
        }
    };

    this.Model = Class.subClass(new function () {
        this.init = function (id, type, vendor, name, thumbnail, baseVersion, xmlVersion) {
            this._private.id = id;
            this._private.type = type;
            this._private.vendor = vendor;
            this._private.name = name;
            this._private.thumbnail = thumbnail;
            this._private.baseVersion = baseVersion;
            this._private.xmlVersion = xmlVersion;
            this._private.originModel = undefined;
            this._private.properties = {};
            this._private.lists = {};
            this._private.types = {};
            this._private.groups = [];
            this._private.groupsIdMapping = {};
            this._private.languages = {};
            this._private.sharedScope = {};
            this._private.imageMappings = {};
        }

        this.id = function () {
            return this._private.id;
        }
        this.modelType = function () {
            if (this._private.originModel !== undefined) {
                return this._private.originModel.modelType();
            }

            return this._private.type;
        }
        this.vendor = function () {
            return this._private.vendor || "";
        }
        this.name = function () {
            return this._private.name;
        }
        this.thumbnail = function () {
            let pvt = this._private;
            let thumbnail = pvt.thumbnail;

            if (!thumbnail && pvt.originModel !== undefined) {
                thumbnail = pvt.originModel.thumbnail();
            }

            return thumbnail;
        }
        this.baseVersion = function () {
            return this._private.baseVersion;
        }
        this.xmlVersion = function () {
            return this._private.xmlVersion;
        }
        this.resourcePath = function () {
            let pvt = this._private;

            if (pvt.originModel !== undefined) {
                return pvt.originModel.resourcePath();
            }

            return "/zeroconfig/" + pvt.name + "/";
        }
        this.property = function (name) {
            let pvt = this._private;
            let property = pvt.properties[name];

            if (!property && pvt.originModel !== undefined) {
                property = pvt.originModel.property(name);
            }

            return property ? property.toString() : "";
        }
        this.imageMappings = function () {
            let pvt = this._private;

            if (pvt.originModel !== undefined) {
                return pvt.originModel.imageMappings();
            }

            return pvt.imageMappings;
        }
        this.list = function (name) {
            let pvt = this._private;

            if (pvt.originModel !== undefined) {
                return pvt.originModel.list(name);
            }

            return pvt.lists[name];
        }
        this.type = function (name) {
            let pvt = this._private;

            if (pvt.originModel !== undefined) {
                return pvt.originModel.type(name);
            }

            return pvt.types[name];
        }
        this.group = function (name) {
            let pvt = this._private;

            if (pvt.originModel !== undefined) {
                return pvt.originModel.group(name);
            }

            return pvt.groups[name];
        }
        this.languages = function () {
            let pvt = this._private;

            if (pvt.originModel !== undefined) {
                return pvt.originModel.languages();
            }

            return pvt.languages;
        }
        this.language = function (name) {
            let pvt = this._private;

            if (pvt.originModel !== undefined) {
                return pvt.originModel.language(name);
            }

            return pvt.languages[name];
        }
        this.registerCustomLangauge = function () {
            if ($.registerCustomLocale) {
                $.registerCustomLocale(this.languages());
            }
            else
                console.warn("WARNING: required function unavailable");
        }
        this.setOriginModel = function (origin) {
            this._private.originModel = origin;
        }
        this.setImageMapping = function (id, mapping) {
            let pvt = this._private;

            // only take "ImageMapping"
            if (mapping && mapping instanceof ns.ImageMapping)
                this._private.imageMappings[id] = mapping;
        }
        this.updateProperty = function (name, val) {
            let pvt = this._private;
            if (name) {
                if (val || val === "")
                    pvt.properties[name] = ZEROCONFIG.dataFactory(val, pvt.sharedScope);
                else if (val === null)
                    delete pvt.properties[name];
            }
        }
        this.updateList = function (name, val) {
            if (name) {
                // only take "LIST"
                if (val instanceof ns.List)
                    this._private.lists[name] = val;
                else if (val === null)
                    delete this._private.lists[name];
            }
        }
        this.updateType = function (name, val) {
            if (name) {
                // only take "CustomElementType"
                if (val instanceof ns.CustomElementType) {
                    this._private.types[name] = val;

                    // attempt to find override type
                    let foundType = ns.DataCollection.getGlobalType(name);
                    if (foundType) {
                        val.overrideDataEntties(foundType.dataEntities());
                    }
                }
                else if (val === null)
                    delete this._private.types[name];
            }
        }
        this.updateGroup = function (name, val) {
            if (name) {
                let pvt = this._private;
                // only take "ModelGroup"
                if (val instanceof ns.ModelGroup) {
                    if (!pvt.groupsIdMapping[name]) {
                        pvt.groups.push(val);
                        pvt.groupsIdMapping[name] = val;
                    }
                }
                else if (val === null)
                    delete this._private.groups[name];
            }
        }
        this.updateLanguage = function (name, val) {
            if (name) {
                // only take "ModelLanguage"
                if (val instanceof ns.ModelLanguage)
                    this._private.languages[name] = val;
                else if (val === null)
                    delete this._private.languages[name];
            }
        }
        this.prepareListData = function () {
            let lists = this._private.lists;
            for (let name in lists) {
                if (lists.hasOwnProperty(name))
                    lists[name].prepare();
            }
        }
        this.generateFieldList = function (data) {
            let ret = {
                "source": [],
                "devmapping": {},
                "fieldMapping": {}
            };

            if (this._private.originModel !== undefined)
                return this._private.originModel.generateFieldList(data);

            let root = this._private.groups;

            for (let i = 0; i < root.length; i++) {
                let orgLevel1 = root[i];
                let level1Scope = {};
                let newLevel1 = deepItemClone(orgLevel1, level1Scope);
                newLevel1.pathName = newLevel1.name;

                level1Scope.item = newLevel1;
                level1Scope.parent = null;

                for (let j = 0; j < orgLevel1.items.length; j++) {
                    let orgLevel2 = orgLevel1.items[j];
                    let level2Scope = {};
                    let newLevel2 = deepItemClone(orgLevel2, level2Scope);
                    newLevel2.pathName = newLevel1.pathName + "." + newLevel2.name;

                    newLevel1.appendItem(newLevel2);

                    level2Scope.item = newLevel2;
                    level2Scope.parent = newLevel1;


                    let lastProcessElmId = 0;
                    newLevel2._hasRepeatItem = false;

                    for (let k = 0; k < orgLevel2.items.length; k++) {
                        let orgLevel3 = orgLevel2.items[k];
                        let found;
                        let level3Scope = {};
                        let newLevel3 = deepItemClone(orgLevel3, level3Scope);
                        newLevel3.pathName = newLevel2.pathName + "." + newLevel3.name;

                        if (newLevel3.elementId > 0 && newLevel3.elementId == lastProcessElmId) {
                            newLevel2._hasRepeatItem = true;
                        }

                        lastProcessElmId = newLevel3.elementId;

                        if (data && (found = data[newLevel3.id])) {
                            newLevel3._loadedValue = found;
                            newLevel3._selected = true;
                        }

                        newLevel2.appendItem(newLevel3);
                        ret.fieldMapping[newLevel3.id] = newLevel3;
                        if (newLevel3.mappings) {
                            for (let name in newLevel3.mappings) {
                                if (newLevel3.mappings.hasOwnProperty(name) && name != "__scope__") {
                                    let nameUpper = name;
                                    if (!ret.devmapping[nameUpper])
                                        ret.devmapping[nameUpper] = [];

                                    ret.devmapping[nameUpper].push(newLevel3);
                                }
                            }
                        }

                        level3Scope.item = newLevel3;
                        level3Scope.parent = newLevel2;
                    }
                }
                ret.source.push(newLevel1);
                //ret.push(jQuery.extend(true, {}, m_blocks[i]));
            }
            return ret;
        }

        this.showInfo = function () {
            console.log("MODEL:" + this._private.id, this._private);
            //console.log("Model id: " + this._private.id + ", type: " + this._private.type +
            //            ", vendor: " + this._private.vendor + ", name: " + this._private.name +
            //            ", thumbnail path: " + this._private.thumbnail);

            // Model property
            //for (let key in this._private.properties) {
            //    console.log("|-- Property name: " + key +
            //    ", value: " + this._private.properties[key]);
            //}

            // Model list
            //for (key in this._private.lists) {
            //    let list = this._private.lists[key];
            //    list.showInfo();
            //}

            //// Model type
            //for (key in this._private.types) {
            //    let type = this._private.types[key];
            //    type.showInfo();
            //}

            //// Model group
            //for (key in this._private.groups) {
            //    let group = this._private.groups[key];
            //    group.showInfo();
            //}

            //// Model user-defined language
            //for (key in this._private.languages) {
            //    let language = this._private.languages[key];
            //    language.showInfo();
            //}
        };
    });

    // Provision modelling: group
    this.ModelGroup = function (id, name, label, visibility) {
        // private
        let m_key_item_mapping = null;

        // public
        this.id = id;
        this.name = name;
        this.label = label;
        this.visibility = visibility;
        this.items = [];

        // helper functions
        this.appendItem = function (item) {
            if (!m_key_item_mapping)
                m_key_item_mapping = {};

            this.items.push(item);
            m_key_item_mapping[item.id] = item;
        }

        this.rebuildKeyItemMapping = function () {
            m_key_item_mapping = {};

            for (let i = 0; i < items.length; i++) {
                m_key_item_mapping[items[i]] = items[i];
            }
        }

        this.findItemByKey = function (key) {
            if (!m_key_item_mapping)
                this.rebuildKeyItemMapping();

            return m_key_item_mapping[key];
        }
    }

    // Provision modelling: groupfield
    this.ModelGroupfield = function (id, name, label, visibility, associatedfield) {
        // private
        let m_key_item_mapping = null;

        // public
        this.id = id;
        this.name = name;
        this.label = label;
        this.visibility = visibility;
        this.associatedfield = associatedfield;
        this.items = [];

        // helper functions
        this.appendItem = function (item) {
            if (!m_key_item_mapping)
                m_key_item_mapping = {};

            this.items.push(item);
            m_key_item_mapping[item.id] = item;
        }

        this.rebuildKeyItemMapping = function () {
            m_key_item_mapping = {};

            for (let i = 0; i < items.length; i++) {
                m_key_item_mapping[items[i]] = items[i];
            }
        }

        this.findItemByKey = function (key) {
            if (!m_key_item_mapping)
                this.rebuildKeyItemMapping();

            return m_key_item_mapping[key];
        }
    }

    // Provision modelling: field
    this.ModelField = function (id, name, label, type, defaultValue, tooltip,
                         regex, validation, monitor, visibility, associatedfield,
                         element_id, element_number) {
        this.id = id;
        this.name = name;
        this.label = label;
        this.type = type;
        this.defaultValue = defaultValue;
        this.tooltip = tooltip;
        this.validateRegex = regex;
        this.validateError = validation;
        this.monitor = monitor;
        this.visibility = visibility;
        this.associatedfield = associatedfield;
        this.elementId = element_id;
        this.elementNum = element_number;
        this.mappings = {};
    }

    // Provision modelling: user-defined language
    this.ModelLanguage = function (id, name, defaultValue) {
        this.id = id;
        this.name = name;
        this.defaultValue = defaultValue;
        this.extensions = {};
    }

    this.ModelLanguage.prototype.translate = function (code) {
        let ret = this.extensions[code] || this.defaultValue;
        return ret.toString();
    }

    this.DataEntity = Class.subClass(new function () {
        this.init = function (name, def, validateRegex, validateError) {
            this._private.name = name;
            this._private.defaultValue = def;
            this._private.validateRegex = validateRegex;
            this._private.validateError = validateError;
        }
        this.name = function (val) {
            if (val)
                this._private.name = val;

            return this._private.name;
        }
        this.defaultValue = function (val) {
            if (val)
                this._private.defaultValue = val;

            return this._private.defaultValue;
        }
        this.validateRegex = function (val) {
            if (val)
                this._private.validateRegex = val;

            return this._private.validateRegex;
        }
        this.validateError = function (val) {
            if (val)
                this._private.validateError = val;

            return this._private.validateError;
        }
    });

    // predefine types
    this.UnknownElementType = base.ElementType.subClass(new function () {
        this.init = function () {
            this._super("unknown");

            // define data entities
            this.dataEntities("", new ns.DataEntity("", "", "", ""));
        }
        // override existing
        this.renderWidget = function (field) {
            return $("<span/>")
                .text("UNKNOWN ELEMENT")
                .attr("class", "unknown");
        }
    });

    this.TextElementType = base.ElementType.subClass(new function () {
        this.init = function () {
            this._super("text");

            // define data entities
            this.dataEntities("DEFAULT", new ns.DataEntity("DEFAULT", "", "", ""));
        }
        // override existing
        this.renderWidget = function (field) {
            let define = { "type": "text", "entity": "DEFAULT" };
            let container = new wg.Container(field, {});
            let widget = new wg.InputWidget(field, define);

            container.attach(widget);
            field.appendFormWidget(widget);

            return container.widget();
        }
    });
    this.PasswordElementType = base.ElementType.subClass(new function () {
        this.init = function () {
            this._super("password");

            // define data entities
            this.dataEntities("DEFAULT", new ns.DataEntity("DEFAULT", "", "", ""));
        }
        // override existing
        this.renderWidget = function (field) {
            let define = { "type": "password", "entity": "DEFAULT" };
            let container = new wg.Container(field, {});
            let widget = new wg.InputWidget(field, define);

            container.attach(widget);
            field.appendFormWidget(widget);

            return container.widget();
        }
    });
    this.CustomElementType = base.ElementType.subClass(new function () {
        this.init = function (id, name, view) {
            let self = this;
            //let $xml = $(xml); // convert to be with jQuery wrapper

            // init base
            this._super(name);

            this._private.id = id;
            this._private.name = name; //$xml.attr("name");
            this._private.view = view;

            //let tmp;
            //// process type entites
            //tmp = $xml.find("typeentity");
            //if (tmp.length)
            //{
            //    tmp.children().each(function (index, item)
            //    {
            //        item = $(item);

            //        let name = item.attr("name");
            //        let def = "";
            //        let validateRegex = "";
            //        let validateError = "";

            //        let fnd;
            //        fnd = item.find("default");
            //        if (fnd.length > 0)
            //            def = fnd.text();
            //        fnd = item.find("validation");
            //        if (fnd.length > 0)
            //        {
            //            validateRegex = fnd.attr("regex");
            //            validateError = fnd.text();
            //        }

            //        self.dataEntities(name, new ns.DataEntity(name, def, validateRegex, validateError));
            //    });
            //}

            // process type view
            //tmp = $xml.find("typeview");
            //if (tmp.length)
            //{
            //    this._private.view = tmp;
            //}
        }
        this.id = function () {
            return this._private.id;
        }
        // override existing
        this.renderWidget = function (field) {
            if (this._private.view)
                return ns.WidgetFactory.makeWidget(field, this._private.view);

            return $("<span/>").text("INVALID");
        }

        this.showInfo = function () {
            console.log("Type id: " + this._private.id +
                        ", name: " + this._private.name +
                        ", view: " + this._private.view);
        };
    });

    this.ElementWidget = Class.subClass(new function () {
        // static values
        let tagName = "ucm-element";
        // register new tag
        //document.registerElement(tagName);

        // private methods
        let processFieldChange = function (sender, pvt) {
            //console.log("[AH] LOG: field change triggered", blocks);
            let blocks = pvt.logicBlocks;
            for (let i = 0; i < blocks.length; i++) {
                let found = blocks[i].showValidBlock();
                if (found) {
                    $("[entity]", found.widget()).each(function (index, item) {
                        let $item = $(item);
                        let wid = $item.attr("id");
                        let name = $item.attr("entity");
                        let widget;
                        if ((widget = pvt.formWidgets[wid]) && widget != sender) {
                            if (pvt.dataObject[name] != undefined) {
                                widget.formValue(pvt.dataObject[name]);
                            } else {
                                widget.formValue(pvt.defaultValues[name]);
                            }
                        }
                    });
                }
            }
        }

        let retrieveValues = function (pvt) {
            let dataObject = {};
            let defaultVals = pvt.defaultValues;
            let modified = false;

            $("[entity]", pvt.element).each(function (index, item) {
                let $item = $(item);
                let wid = $item.attr("id");
                let widget;
                if (widget = pvt.formWidgets[wid]) {
                    let name = $item.attr("entity");
                    dataObject[name] = widget.formValue() || "";
                    if (!modified && defaultVals[name] != dataObject[name])
                        modified = true;
                }
            });
            pvt.modified = modified;
            return dataObject;
        }

        // constructor
        this.init = function (elementType, defaultValues, validateRegex, validateError, scope) {
            // init private letiables
            let pvt = this._private;
            pvt.modified = false;
            pvt.defaultValues = {};
            pvt.validateRegex = validateRegex;
            pvt.validateError = validateError;
            pvt.monitor = null;
            pvt.logicBlocks = [];
            pvt.dataObject = {};
            pvt.prevDataObject = {};
            pvt.formWidgets = {};
            pvt.elementType = elementType;
            pvt.timer = null;
            pvt.element = null;
            pvt.changeCallback = [];
            pvt.selectCallback = [];
            pvt.keyEventCallback = [];
            pvt.actionTargetCallback = [];
            pvt.validateErrorCallback = [];
            processScope = scope;
            if (elementType) {
                // setting default value
                let usingDefault = defaultValues;
                if (typeof defaultValues != "object" || defaultValues instanceof DataContainer)
                    usingDefault = { "DEFAULT": defaultValues };

                let entites = elementType.dataEntities();
                for (let name in entites) {
                    if (entites.hasOwnProperty(name)) {
                        let tmp = usingDefault[name];
                        if (tmp && tmp.length > 0) {
                            pvt.defaultValues[name] = tmp;
                        }
                        else if (typeof tmp === "object") {
                            pvt.defaultValues[name] = tmp.toString();
                        }
                        else {
                            pvt.defaultValues[name] = entites[name].defaultValue();
                        }

                    }
                }
                let newWidget = elementType.renderWidget(this);

                pvt.element = $("<" + tagName + "/>")
                    .append(newWidget);
            }
            processScope = null;
        }
        this.initMonitor = function (xml, sharedScope) {
            // Sanity check
            if (!xml) {
                return;
            }

            // Find root node
            let $xml = $.parseXML(xml);
            let root = $($xml).find("monitor");

            if (!root.length) {
                console.warn("Missing monitor tag");
                this._private.monitor = null;
                return;
            }

            console.log("[TK] monitor:", xml);

            // Parse monitor's children
            parser = new MonitorParser(this, sharedScope);
            this._private.monitor = parser;

            $(root).children().each(function (index, item) {
                if (item.nodeName === "sender") {
                    parser.parseSender(item);
                } else if (item.nodeName === "receiver") {
                    parser.parseReceiver(item, sharedScope);
                }
            });
        }
        this.prepareMonitor = function () {
            if (this._private.monitor !== null) {
                this._private.monitor.prepare();
            }
        }
        this.valueChanged = function (entity, value) {
            let monitor = this._private.monitor;

            if (monitor !== null) {
                let ref = monitor._senders[entity];

                // Sanity check
                if (ref === undefined || !ref) {
                    return;
                }

                console.log("[TK] valueChanged::entity: ", entity, ", ref: ", ref, ",value: ", value);
                ZEROCONFIG.ValueMonitor.updateValue(monitor, ref, value);
            }
        }
        this.requestSenderValues = function (enabled) {
            let monitor = this._private.monitor;

            if (monitor !== null) {
                monitor.notifySenderValues(enabled);
            }
        }
        this.defaultValues = function () {
            return this._private.defaultValues;
        }
        this.validateRegex = function () {
            return this._private.validateRegex;
        }
        this.validateError = function () {
            return this._private.validateError;
        }
        this.validate = function (sender) {
            let entity = sender.entity();
            let value = sender.formValue();

            if (!entity) entity = "DEFAULT";

            let pvt = this._private;
            let widget = sender.widget(); //$("[entity='" + entity + "']", pvt.element);

            let dataEntity = pvt.elementType.dataEntities(entity);
            let validateRegex = "";
            let validateError = "";

            if (dataEntity) {
                validateRegex = dataEntity.validateRegex();
                validateError = dataEntity.validateError();
            }

            if (entity == "DEFAULT") {
                if (pvt.validateRegex) validateRegex = pvt.validateRegex;
                if (pvt.validateError) validateError = pvt.validateError;
            }

            widget.removeClass("error");

            // do not need to handle anything when there is already a process error
            if (sender.hasProcessError()) {
                widget.addClass("error");
                return "";
            }


            if (validateRegex) {
                let regex = new RegExp(validateRegex);

                if (!regex.test(value)) {
                    widget.addClass("error");
                    // notify callbacks
                    for (let i = 0; i < pvt.validateErrorCallback.length; i++) {
                        pvt.validateErrorCallback[i].call(self, "validateError", sender);
                    }
                    return validateError;
                }
            }
            return "";
        }
        this.notifyOnFieldKeyEvent = function (sender) {
            let pvt = this._private;
            let self = this;

            // notify callbacks
            for (let i = 0; i < pvt.keyEventCallback.length; i++) {
                pvt.keyEventCallback[i].call(self, "keyevent", sender);
            }
        }
        this.notifyOnActionTarget = function (action) {
            let pvt = this._private;
            let self = this;

            // notify callbacks
            for (let i = 0; i < pvt.actionTargetCallback.length; i++) {
                pvt.actionTargetCallback[i].call(self, action);
            }
        }
        this.notifyOnFieldChange = function (sender) {
            let pvt = this._private;
            let self = this;
            if (sender instanceof base.BaseFormWidget &&
                sender.field() === this) {
                //console.log("CHANGING!!", sender);
                // push the process to the next event
                if (!this._private.timer) {
                    this._private.timer = setTimeout(function () {
                        pvt.timer = null;
                        sender.validate();

                        // retrieve dataObject when is empty
                        if (jQuery.isEmptyObject(pvt.dataObject)) {
                            pvt.prevDataObject = pvt.dataObject;
                            pvt.dataObject = retrieveValues(pvt);
                        } else {
                            // update the sender entity value
                            pvt.dataObject[sender.entity()] = sender.value();
                        }

                        // process field change
                        processFieldChange(sender, pvt);

                        // setting the value
                        //let entites = self.elementType().dataEntities();

                        //for (let name in entites) {
                        //    if (entites.hasOwnProperty(name)) {
                        //        let val = $("[entity='" + name + "']", pvt.element).val();
                        //        dataObject[name] = val || "";
                        //    }
                        //}
                        pvt.prevDataObject = pvt.dataObject;
                        pvt.dataObject = retrieveValues(pvt);

                        // notify callbacks
                        for (let i = 0; i < pvt.changeCallback.length; i++) {
                            pvt.changeCallback[i].call(self, "change", sender);
                        }
                    }, 0);
                }
            }
        }
        this.isModified = function () {
            return this._private.modified;
        }
        this.registerSelectCallback = function (callback) {
            if (typeof callback === "function") {
                this._private.selectCallback.push(callback);
            }
        }
        this.registerValidateErrorCallback = function (callback) {
            if (typeof callback === "function") {
                this._private.validateErrorCallback.push(callback);
            }
        }
        this.registerChangeCallback = function (callback) {
            if (typeof callback === "function") {
                this._private.changeCallback.push(callback);
            }
        }
        this.registerKeyEventCallback = function (callback) {
            if (typeof callback === "function") {
                this._private.keyEventCallback.push(callback);
            }
        }
        this.registerActionTargetCallback = function (callback) {
            if (typeof callback === "function") {
                this._private.actionTargetCallback.push(callback);
            }
        }
        this.appendFormWidget = function (widget) {
            if (widget instanceof base.BaseFormWidget) {
                this._private.formWidgets[widget.id()] = widget;
            }
        }
        this.appendLogicBlock = function (logic) {
            if (logic instanceof wg.LogicContainer) {
                this._private.logicBlocks.push(logic);
            }
        }
        this.disableFormWidgets = function (val) {
            let pvt = this._private;
            let dataObject = {};
            $.each(pvt.formWidgets, function (i, item) {
                item.disabled(val);

                //if (item.isVisible())
                //    dataObject[item.entity()] = item.value() || "";
            });


            if (!val) {
                pvt.prevDataObject = pvt.dataObject;
                pvt.dataObject = retrieveValues(pvt);
            }
            //else
            //    pvt.dataObject = {};
        }
        this.previewElement = function () {
            let source = this._private.formWidgets;
            let container = $("<div/>").addClass("preview-container");
            let groups = {};
            let usingElement = this._private.element;
            $("[entity]", usingElement).each(function (index, item) {
                let $item = $(item);
                let wid = $item.attr("id");
                let widget;
                if (widget = source[wid]) {
                    let name = $item.attr("entity");
                    let gname = widget.name();
                    let label = widget.labelText();
                    let value = widget.value();
                    let valueDisplay = widget.displayValue();

                    let wcontainer = groups[gname];
                    if (!wcontainer) {
                        wcontainer = $("<div/>").addClass("preview-entity");

                        wcontainer.appendTo(container);

                        if (!label) {
                            label = $("label[for='" + gname + "']", usingElement).text();
                        }

                        if (label)
                            $("<label/>")
                                .addClass("label")
                                .attr("for", wid)
                                .text(label)
                                .appendTo(wcontainer);
                        groups[gname] = wcontainer;
                    }
                    else
                        wcontainer.append($("<span/>").text(","));

                    $("<span/>")
                        .addClass("value")
                        .text(valueDisplay)
                        .appendTo(wcontainer)
                        .attr("title", name + ": " + value);

                    //console.log("[AH] FOUND:" + widget.labelText(), widget.displayValue());
                }
            });
            return container;
        }
        this.elementType = function () {
            return this._private.elementType;
        }
        this.element = function () {
            return this._private.element;
        }
        this.processSubmitElementValue = function (callback) {
            let pvt = this._private;
            let waiting = 0;
            let timeout = 300;
            let processError = "";
            pvt.prevDataObject = pvt.dataObject;
            pvt.dataObject = {};
            $("[entity]", pvt.element).each(function (index, item) {
                let $item = $(item);
                let wid = $item.attr("id");
                let name = $item.attr("entity");
                let widget;
                if (widget = pvt.formWidgets[wid]) {
                    waiting++;

                    widget.prepareSubmitFormValue(function (ret, error) {
                        pvt.dataObject[name] = ret || "";
                        if (!processError && error)
                            processError = error;
                        waiting--;
                    }); // calling before

                }
            });


            (function waitForReturn() {
                if (waiting > 0 && timeout-- > 0) {
                    setTimeout(waitForReturn, 100);
                }
                else {
                    if (timeout === 0)
                        console.warn("Process submiting element value timeout!");

                    if (typeof callback === "function") {
                        callback.call({}, pvt.dataObject, processError);
                    }
                }
            })();
        }
        this.elementValue = function (dataObject, notifyChange) {
            let self = this;
            let pvt = this._private;
            if (dataObject) {
                let type = (typeof dataObject);
                if (type === "function") {
                    dataObject = dataObject();
                    type = (typeof dataObject);
                    if (type === "function")
                        return; // invalid input
                }

                if (type === "string" ||
                    type === "boolean" ||
                    type === "number") {

                    dataObject = {};
                    dataObject["DEFAULT"] = dataObject;
                }

                pvt.prevDataObject = pvt.dataObject;
                pvt.dataObject = {};

                for (let name in dataObject) {
                    if (dataObject.hasOwnProperty(name)) {
                        // Sanity check
                        if (dataObject[name] === null) {
                            continue;
                        }

                        pvt.dataObject[name] = dataObject[name].toString();
                        let found = $("[entity='" + name + "']", pvt.element);
                        if (found.length > 0) {
                            let wid = found.attr("id");
                            let widget;

                            if (widget = pvt.formWidgets[wid]) {
                                widget.formValue(pvt.dataObject[name]);
                                processFieldChange(widget, this._private);

                                if (notifyChange === true) {
                                    // notify callbacks
                                    for (let i = 0; i < pvt.changeCallback.length; i++) {
                                        pvt.changeCallback[i].call(self, "change", widget);
                                    }
                                }
                            }
                        }
                    }
                }

                pvt.dataObject = retrieveValues(pvt);
                return this._private.dataObject;
            }
            else {
                let pvt = this._private;
                // retrieve dataObject when is empty
                if (jQuery.isEmptyObject(pvt.dataObject)) {
                    pvt.prevDataObject = pvt.dataObject;
                    pvt.dataObject = retrieveValues(pvt);
                }

                return pvt.dataObject;
            }
        }
        this.setInfoFormWidget = function (widget) {
            let self = this;
            if (widget instanceof base.BaseFormWidget) {
                this._private.infoWidet = widget;
                // needs to update tooltip
                for (let i = 0; i < this._private.selectCallback.length; i++) {
                    this._private.selectCallback[i].call(self, "select", widget);
                }
            }
            else
                this._private.infoWidet = null;
        }
        this.infoFormWidget = function () {
            return this._private.infoWidet;
        }
        this.currentInfoLabel = function () {
            if (this._private.infoWidet)
                return this._private.infoWidet.label();
            return "";
        }
        this.currentInfoValidateError = function () {
            if (this._private.infoWidet)
                return this._private.infoWidet.hasError();
            return "";
        }
        this.currentInfoTooltip = function () {
            if (this._private.infoWidet)
                return this._private.infoWidet.tooltip();
            return "";
        }
    });



    // singleton objects
    this.WidgetFactory = new function () {
        let widgets = {};

        let parseWidget = function (field, item, container) {
            let cls = widgets[item.nodeName];
            if (cls) {
                let widget = new cls(field, item);
                if (widget instanceof base.BaseWidget &&
                    widget.isValid() &&
                    widget.visible()) {
                    container.attach(widget);

                    // bind when bindable
                    if (widget instanceof base.BindableWidget)
                        widget.databind();

                    $(item).children().each(function (index, child) {
                        parseWidget(field, child, widget);
                    });

                    widget.onWidgetAppended();
                }
            }
        }

        this.makeWidget = function (field, xml) {
            let self = this;
            let container = new wg.Container(field);

            let $xml = $.parseXML(xml);
            let root = $($xml).find("typeview");
            if (root.length) {
                $(root).children().each(function (index, item) {
                    parseWidget(field, item, container);
                });
            }
            return container.widget();
        }
        this.registerWidget = function (name, cls) {
            widgets[name] = cls;
        }
        this.prepareDocumentWidgets = function (doc) {
            for (let name in widgets) {
                if (widgets.hasOwnProperty(name)) {
                    widgets[name].prototype.processDocumentInit(doc);
                }
            }
        }
    }

    this.ListOracle = new function () {
        this.findList = function (name) {
            let tmp;
            let model = ns.ConfigPage.modelInfo();
            if (model && (tmp = model.list(name)))
                return tmp;

            if (tmp = ns.DataCollection.getGlobalList(name))
                return tmp;

            return null;
        }
    }

    this.TypeOracle = new function () {
        let predefines = {};
        //let global = {};
        //let models = {};

        this.registerPredefineType = function (name, type) {
            if (type instanceof base.ElementType) {
                predefines[name] = type;
            }
        }

        this.findType = function (name) {
            if (predefines[name])
                return predefines[name];

            let tmp;
            if (!ns.ConfigPage.noTypeOverride()) {
                let model = ns.ConfigPage.modelInfo();
                if (model && (tmp = model.type(name)))
                    return tmp;
            }

            if (tmp = ns.DataCollection.getGlobalType(name))
                return tmp;

            return predefines["unknown"] || null;
        }
    }

    this.DataCollection = new function () {
        let m_blocks = [],
            m_blocksIdMapping = {},
            m_typeBlocks = [],
            m_typeBlocksIdMapping = {},
            m_globalLists = {},
            m_globalTypes = {},
            m_models = {},
            m_invalidModels = {};

        this.reset = function () {
            m_blocks.length = 0;
            m_blocksIdMapping = {};
            m_typeBlocks.length = 0;
            m_typeBlocksIdMapping = {};
            m_globalLists = {};
            m_globalTypes = {};
            m_models = {};
            m_invalidModels = {};
        }

        // for debugging
        this.showInfo = function () {
            console.log("BLOCKS", m_blocks);
            console.log("TYPEBLOCKS", m_typeBlocks);
            console.log("GLOBALLISTS", m_globalLists);
            console.log("GLOBALTYPES", m_globalTypes);
            console.log("MODELS", m_models);
        }

        this.generateTypeBlockList = function (type, data) {
            let ret = [];
            let original = null;

            if (type) {
                for (let i = 0; i < m_typeBlocks.length; i++) {
                    if (type === m_typeBlocks[i].name) {
                        original = m_typeBlocks[i];
                        break;
                    }
                }

                if (original) {
                    for (let j = 0; j < original.items.length; j++) {
                        let orgBlockElm = original.items[j];
                        let blockElmScope = {};
                        let newBlockElm = deepItemClone(orgBlockElm, blockElmScope);
                        let hasChild = false;
                        newBlockElm.pathName = "TypeBlock." + newBlockElm.name;
                        blockElmScope.item = newBlockElm;
                        blockElmScope.parent = null;

                        for (let k = 0; k < orgBlockElm.items.length; k++) {
                            let orgElement = orgBlockElm.items[k];
                            let max = 1;
                            if (orgElement.maxoccurs)
                                max = parseInt(orgElement.maxoccurs.toString());

                            if (max > 1)
                                newBlockElm._hasRepeatItem = true;

                            for (let l = 0; l < max; l++) {
                                let found;
                                let elementScope = {};
                                let newElement = deepItemClone(orgElement, elementScope);
                                newElement.pathName = newBlockElm.pathName + "." + newElement.name;
                                newElement.elementNum = l + 1;
                                if (data && (found = data[newElement.uniqueId()])) {
                                    newElement._loadedValue = found;
                                    newElement._selected = true;
                                }

                                newBlockElm.appendItem(newElement);

                                elementScope.item = newElement;
                                elementScope.parent = newBlockElm;
                                hasChild = true;
                            }
                        }
                        if (hasChild)
                            ret.push(newBlockElm);
                    }
                }
            }

            return ret;
        }

        this.generateGlobalBlockList = function (data) {
            let ret = [];
            for (let i = 0; i < m_blocks.length; i++) {
                let orgBlock = m_blocks[i];
                let blockScope = {};
                let newBlock = deepItemClone(orgBlock, blockScope);
                newBlock.pathName = newBlock.name;
                blockScope.item = newBlock;
                blockScope.parent = null;

                for (let j = 0; j < orgBlock.items.length; j++) {
                    let orgBlockElm = orgBlock.items[j];
                    let blockElmScope = {};
                    let newBlockElm = deepItemClone(orgBlockElm, blockElmScope);
                    newBlockElm.pathName = newBlock.pathName + "." + newBlockElm.name;
                    newBlock.appendItem(newBlockElm);

                    blockElmScope.item = newBlockElm;
                    blockElmScope.parent = newBlock;

                    for (let k = 0; k < orgBlockElm.items.length; k++) {
                        let orgElement = orgBlockElm.items[k];
                        let max = 1;
                        if (orgElement.maxoccurs)
                            max = parseInt(orgElement.maxoccurs.toString());

                        if (max > 1)
                            newBlockElm._hasRepeatItem = true;

                        for (let l = 0; l < max; l++) {
                            let found;
                            let elementScope = {};
                            let newElement = deepItemClone(orgElement, elementScope);
                            newElement.pathName = newBlockElm.pathName + "." + newElement.name;
                            newElement.elementNum = l + 1;
                            if (data && (found = data[newElement.uniqueId()])) {
                                newElement._loadedValue = found;
                                newElement._selected = true;
                            }

                            newBlockElm.appendItem(newElement);

                            elementScope.item = newElement;
                            elementScope.parent = newBlockElm;
                        }
                    }
                }
                ret.push(newBlock);
                //ret.push(jQuery.extend(true, {}, m_blocks[i]));
            }
            return ret;
        }
        this.generateBasicModelList = function () {
            let ret = [];
            for (let name in m_models) {
                if (m_models.hasOwnProperty(name)) {
                    let model = m_models[name];
                    let newModel = {};
                    newModel.id = model.id();
                    newModel.modelType = model.modelType();
                    newModel.vendor = model.vendor();
                    newModel.name = model.name();
                    newModel.thumbnail = model.thumbnail();

                    ret.push(newModel);
                }
            }

            ret.sort(function (a, b) {
                return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
            });

            return ret;
        }
        // BLOCK
        this.getBlock = function (id) {
            if (id)
                return m_blocksIdMapping[id];

            return undefined;
        }

        this.addBlock = function (item) {
            if (!m_blocksIdMapping[item.id]) {
                m_blocks.push(item);
                m_blocksIdMapping[item.id] = item;
            }
        }

        // TYPEBLOCK
        this.getTypeBlock = function (id) {
            if (id)
                return m_typeBlocksIdMapping[id];

            return undefined;
        }

        this.getTypeBlockByName = function (name) {
            for (let i = 0; i < m_typeBlocks.length; i++) {
                if (m_typeBlocks[i].name == name)
                    return m_typeBlocks[i];
            }

            return undefined;
        }

        this.addTypeBlock = function (item) {
            if (!m_typeBlocksIdMapping[item.id]) {
                m_typeBlocks.push(item);
                m_typeBlocksIdMapping[item.id] = item;
            }
        }

        // List
        this.prepareGlobalList = function () {
            for (let name in m_globalLists) {
                if (m_globalLists.hasOwnProperty(name))
                    m_globalLists[name].prepare();
            }
        }

        // GLOBALTYPES
        this.getGlobalType = function (key) {
            if (key)
                return m_globalTypes[key];

            return undefined;
        }

        this.setGlobalType = function (key, val) {
            m_globalTypes[key] = val;
        }

        // GLOBALLISTS
        this.getGlobalList = function (key) {
            if (key) {
                return m_globalLists[key];
            }


            return undefined;
        }

        this.setGlobalList = function (key, val) {
            m_globalLists[key] = val;
        }

        // MODEL
        this.getModelByName = function (vendor, modelName) {
            for (let name in m_models) {
                if (m_models.hasOwnProperty(name)) {
                    let model = m_models[name];
                    if (vendor != undefined && modelName != undefined &&
                        vendor.toLowerCase() === model.vendor().toLowerCase() &&
                        modelName.toLowerCase() === model.name().toLowerCase()) {
                        return model;
                    }
                }
            }
            return undefined;
        }
        this.getModel = function (key) {
            if (key)
                return m_models[key];

            return undefined;
        }

        this.setModel = function (key, val) {
            m_models[key] = val;
        }

        this.setModelAlias = function (modelId, originId) {
            model = this.getModel(modelId)
            origin = this.getModel(originId)

            // Sanity check
            if (model === undefined || origin === undefined) {
                console.log("ERR! invalid model alias, model id: ", modelId,
                            ", origin id: ", originId);
                return;
            }

            model.setOriginModel(origin);
        }

        this.resetInvalidModel = function () {
            m_invalidModels = {};
        }

        this.setInvalidModel = function (key, val) {
            m_invalidModels[key] = val;
        }

        this.getInvalidModelByName = function (vendorName, modelName) {
          let item = 0;
          for (item in m_invalidModels) {
              let model = m_invalidModels[item].name;
              let vendor = m_invalidModels[item].vendor;

              if (model != undefined && vendor != undefined &&
                  vendorName.toLowerCase() === vendor.toLowerCase() &&
                  modelName.toLowerCase() === model.toLowerCase()) {
                  return model;
              }
          }
          return undefined;
        }
    }

    this.PrepareSubmitConfigurations = function (refId, source, callback) {

        let idList = refId.toString().split(",");
        let ret = {
            "update": {
                "refId": [],
                "elementId": [],
                "elementNum": [],
                "entityName": [],
                "value": []
            },
            "remove": {
                "refId": [],
                "elementId": [],
                "elementNum": [],
                "entityName": []
            },
            "error": []
        };

        let waiting = 0;
        let processNode = function (item) {
            if (item.items) {
                for (let i = 0; i < item.items.length; i++) {
                    processNode(item.items[i]);
                }
            }
            else {
                if (item._selected) {
                    let ew;
                    if (item.__scope__ && (ew = item.__scope__.elementWidget)) {
                        waiting++;

                        ew.processSubmitElementValue(function (values, processError) {

                            let type = ew.elementType();

                            if (processError) {
                                ret.error.push(item);
                            }
                            else {
                                for (let name in values) {
                                    if (values.hasOwnProperty(name)) {
                                        //let error = ew.validate(name, values[name]);
                                        //if (error) {
                                        //    ret.error.push(item);
                                        //    continue;
                                        //}
                                        let usingVal = encodeURIComponent(values[name]);
                                        for (let i = 0; i < idList.length; i++) {
                                            ret.update.refId.push(idList[i]);
                                            ret.update.elementId.push(item.id);
                                            ret.update.elementNum.push(item.elementNum);
                                            ret.update.entityName.push(name);
                                            ret.update.value.push(usingVal);
                                        }
                                    }
                                }
                            }

                            waiting--;
                        });

                    }
                    else
                        console.warn("Invalid LEAF item", item);
                }
                else if (item._loadedValue) {
                    let ew;
                    if (item.__scope__ && (ew = item.__scope__.elementWidget)) {
                        let values = ew.elementValue();
                        for (let name in values) {
                            for (let i = 0; i < idList.length; i++) {
                                ret.remove.refId.push(idList[i]);
                                ret.remove.elementId.push(item.id);
                                ret.remove.elementNum.push(item.elementNum);
                                ret.remove.entityName.push(name);
                            }

                        }
                    }
                }
            }
        }

        for (let i = 0; i < source.length; i++) {
            processNode(source[i]);
        }


        (function waitForReturn() {
            if (waiting > 0) {
                setTimeout(waitForReturn, 100);
            }
            else {
                if (typeof callback === "function") {
                    callback.call({}, ret);
                }
            }
        })();
    }

    this.ConfigPage = new function () {
        let m_modelId = -1;
        let m_currentType = "";
        let m_currentItem = null;
        let m_noTypeOverride = false;
        let m_document = document;
        let m_window = window;
        let m_lastModify = null;
        let m_pageMode = "";
        let m_current_dev = null;

        this.updateCurrentDevice = function (dev) {
            m_current_dev = dev;
        }

        this.updatePageDOM = function (mode, window, document) {
            m_pageMode = mode;
            m_window = window;
            m_document = document;
        }

        this.updatePageConfig = function (mid, loadedType, loadedItem, noTypeOverride) {
            m_modelId = mid;

            m_currentType = loadedType;
            m_currentItem = loadedItem;
            m_noTypeOverride = noTypeOverride;

            let model = ns.DataCollection.getModel(mid);
            if (model)
                model.registerCustomLangauge();

            // reset everytime when updatePageConfig is called
            m_lastModify = null;
        }

        this.currentDevice = function () {
            return m_current_dev;
        }

        this.loadedType = function () {
            return m_currentType;
        }

        this.loadedItem = function () {
            return m_currentItem;
        }

        this.modelId = function () {
            return m_modelId;
        }

        this.noTypeOverride = function () {
            return m_noTypeOverride;
        }

        this.modelInfo = function () {
            return ns.DataCollection.getModel(m_modelId)
        }

        this.mode = function () {
            return m_pageMode
        }

        this.currentDocument = function () {
            return m_document
        }
        this.currentWindow = function () {
            return m_window
        }

        this.pageModified = function () {
            return m_lastModify != null
        }

        this.updateModifiedInput = function (ipt) {
            if (ipt)
                m_lastModify = ipt
        }

        this.resetStatus = function () {
            m_modelId = -1
            m_currentType = "";
            m_currentItem = null;
            m_noTypeOverride = false;

            m_document = document;
            m_window = window;
            m_lastModify = null;
            m_pageMode = "";
            m_current_dev = null;
        }
    }

    let t = this.TypeOracle;

    t.registerPredefineType("text", new ns.TextElementType());
    t.registerPredefineType("password", new ns.PasswordElementType());
    t.registerPredefineType("unknown", new ns.UnknownElementType());

    // register predefined widgets
    let w = this.WidgetFactory;
    w.registerWidget("input", wg.InputWidget);
    w.registerWidget("select", wg.SelectWidget);
    w.registerWidget("option", wg.OptionWidget);
    w.registerWidget("container", wg.Container);
    w.registerWidget("if", wg.LogicContainer);
    w.registerWidget("elseif", wg.LogicStatement);
    w.registerWidget("else", wg.LogicStatement);
    w.registerWidget("view", wg.LogicView);
    w.registerWidget("hr", wg.HorizontalLine);
    w.registerWidget("inline", wg.InlineContent);
    w.registerWidget("label", wg.LabelWidget);
    w.registerWidget("fileselector", wg.FileSelectorWidget);
    w.registerWidget("checklist", wg.CheckListWidget);
    w.registerWidget("check", wg.SubCheckboxWidget);


    // register base to be abstract
    this.abstract = base;
}

window.zc = nss
// assign namespace to window
// TODO: change to proper namespace
module.exports = nss

// Logic to link ZeroConfig with process
// let frameSwitchCallback = function (e) {
//     // reset configuration when switch
//     nss.ConfigPage.resetStatus();
// }

// register to frameswitch event
// if (UCMGUI)
//     UCMGUI.iFrameEventDelegate.registerEventHandler("frameswitch", frameSwitchCallback);
// else
//     console.error("ERROR: Required UCMGUI is not found");
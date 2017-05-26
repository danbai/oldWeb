'use strict'

import { browserHistory } from 'react-router'
import $ from 'jquery'
import _ from 'underscore'
import cookie from 'react-cookie'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs, Modal, Tooltip, Table, Popconfirm } from 'antd'
import api from "../../api/api"
import Validator from "../../api/validator"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
// import DevicesItemBasic from './devicesItemBasic'
// import DeviceItemAdvanced from './deviceItemAdvanced'
import '../../../css/zc.less'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const baseServerURl = api.apiHost
const TabPane = Tabs.TabPane

class DevicesItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loadedModelID: "",
            models: [],
            basicSource: null,
            advancedSource: null,
            loadedConfigure: null,
            activeKey: "devicesItemBasic",
            currentMac: this.props.location.state ? this.props.location.state.mac : "",
            devicesItemBasic: {},
            devicesItemAdvanced: {},
            optionTimer: null,
            modified: false,
            singleModelMode: false,
            model: {},
            templates: {},
            customFields: {},
            curModelTemplates: [],
            curGlobalTemplates: [],
            defaultModelTemplate: null,
            devmappings: null,
            __globalTemplateLoaded: false,
            __globalTemplateRendered: false,
            __modelTemplateLoaded: false,
            __modelTemplateRendered: false
        }
    }
    componentDidMount() {
        const { formatMessage } = this.props.intl
        // window.BLL.DataCollection.reset()
        let locationState = this.props.location.state,
            mode = locationState.mode,
            mac = locationState.mac,
            mid = locationState.mid,
            self = this

        if (mode === "add") {
            // $("button#save").attr("locale", "LANG754")
        }

        if (mode !== "batch") {
            window.BLL.ConfigPage.updatePageDOM("device-basic", window, document)
            // window.BLL.ConfigPage.updatePageDOM("device-advanced", window, document)
        } else {
            window.BLL.ConfigPage.updatePageDOM("device-basic-batch", window, document)
        }
        (function checkReady() {
            if (window.ZEROCONFIG.isDataReady() === 1) {
                window.BLL.DataCollection.prepareGlobalList()
                window.ZEROCONFIG.ValueMonitor.init()

                // handle menu logic
                $("ul#menu li#menu-basic").addClass("sel")
                // $("ul#menu li#menu-advanced a").on("click", function (e) {
                //     let openWindow = function () {
                //         if (mode !== "batch") {
                //             message.destroy()
                //             // top.dialog.dialogInnerhtml({
                //             //     dialogTitle: $P.lang("LANG222").format($P.lang("LANG1287"), mac),
                //             //     displayPos: "editForm",
                //             //     frameSrc: "html/zc_devices_modal_advanced.html?mode=edit&mac={0}&ip={1}&status={2}".format(mac, ip, status)
                //             // })
                //         } else {
                //             let macList = $("div#batch-list").modelDevices("deviceList")
                //             let midList = []
                //             for (let i = 0; i < macList.length; i++) {
                //                 midList.push(self.state.loadedModelID)
                //             }
                //
                //             message.destroy()
                //             // top.dialog.dialogInnerhtml({
                //             //     dialogTitle: $P.lang("LANG3866"),
                //             //     displayPos: "editForm",
                //             //     frameSrc: "html/zc_devices_modal_advanced.html?mode=batch&mac={0}&mid={1}&ip=&status=".format(macList.toString(), midList.toString())
                //             // })
                //         }
                //     }
                //
                //     if (!window.BLL.ConfigPage.pageModified()) {
                //         openWindow()
                //     } else {
                //         confirm({
                //             content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG3482"}) }}></span>,
                //             okText: 'OK',
                //             cancelText: 'Cancel',
                //             onOk: () => {
                //                 // TODO: add save
                //                 this._pageSubmit(function () {
                //                     // open customize window after save
                //                     openWindow()
                //                 })
                //             },
                //             onCancel: () => {
                //                 // no save and switch
                //                 openWindow()
                //             }
                //         })
                //     }
                // })
                self._initListBox("model")
                self._initListBox("global")
                self._bindModels()
                $("div#selectdeviceModel.divSelect span.modelSpanDes").css("width", "")
                if (mode === "add") {
                    // when add, no advanced option will be available
                    $("ul#menu li#menu-advanced").hide()
                    // switch panels
                    $("div#preparePad").hide()
                    $("div#contentPad").show()
                } else if (mode === 'edit') {
                    self._switchPads(true)
                    self._loadPageContents()
                } else if (mode === "batch") {
                    $("div#info-container").hide()
                    $("div#batch-container").show()

                    let inMac = mac.split(",")
                    let inMid = mid.split(",")

                    let options = {}
                    let modelDevices = {}

                    if (mid && inMac.length > 0) {
                        $("#empty-pad").hide()
                        $("select#deviceModel").val(mid).attr("disabled", "disabled")
                        self.state.loadedModelID = mid

                        window.BLL.ConfigPage.updatePageConfig(mid, "model", window.BLL.DataCollection.getModel(mid), true)
                        if (window.BLL.ConfigPage.modelInfo()) {
                            window.BLL.ConfigPage.modelInfo().prepareListData()
                        }

                        // process list
                        modelDevices[mid] = []

                        for (let i = 0; i < inMac.length; i++) {
                            modelDevices[mid].push(inMac[i])
                        }

                        options.source = modelDevices
                        options.updateCallback = function (sender) {
                            self.state.currentMac = sender.firstAvailableDevice()
                        }

                        $("div#batch-list").modelDevices(options)

                        self._bindBasicOptions({}, function () {
                            $("div#preparePad").hide()
                            $("div#contentPad").show()
                        })
                    } else {
                        message.destroy()
                        message.error(formatMessage({id: "LANG839"}))
                    }

                    if (inMac.length === inMid.length) {
                        for (var i = 0; i < inMac.length; i++) {
                            if (!modelDevices[inMid[i]]) {
                                modelDevices[inMid[i]] = []
                            }
                            modelDevices[inMid[i]].push(inMac[i])
                        }

                        if (inMid.length === 1) {
                            self._switchPads(true)
                            let currentMac = inMac[0]
                            let model = window.BLL.DataCollection.getModel(inMid[0])
                            self.state.currentMac = currentMac
                            self.state.model = model
                            window.BLL.ConfigPage.updatePageConfig(model.id(), "model", model)
                            window.BLL.ConfigPage.modelInfo().prepareListData()
                        } else {
                            self._switchPads(false)
                        }

                        options.source = modelDevices
                        options.updateCallback = function (sender) {
                            let currentMac = sender.currentMac()
                            let model = sender.currentModel()
                            self.state.currentMac = currentMac
                            self.state.model = model
                            // self.setState({
                            //     currentMac: currentMac,
                            //     model: model
                            // })
                            if (sender.totalModels() === 1 && !self.state.singleModelMode) {
                                self._switchPads(true)

                                window.BLL.ConfigPage.updatePageConfig(model.id(), "model", model)
                                window.BLL.ConfigPage.modelInfo().prepareListData()

                                // needs to reload page...
                                self._loadRequiredContents(function () {
                                    self._bindMappings({})
                                })
                            }

                            if (self.state.singleModelMode) {
                                self._triggerModify(true)
                                $("div#previewPrepareMsg").show().html(formatMessage({id: "LANG3891^" + this.state.currentMac}))
                            }
                        }

                        $("div#batch-list").modelDevices(options)

                        self._loadRequiredContents(function () {
                            self._bindMappings({})
                        })
                    } else {
                        message.destroy()
                        message.error(formatMessage({id: "LANG839"}))
                    }
                }
            } else {
                let label = $("div#loadingMsg")
                let tLocale = "LANG805"

                if (window.ZEROCONFIG.isDataReady() === -1) {
                    tLocale = "LANG3717"
                }

                if (label.attr("locale") !== tLocale) {
                    label.attr("locale", tLocale)
                    label.text(formatMessage({id: tLocale}))
                }

                setTimeout(checkReady, 1000)
            }
        })()
        $.navSlide(true, false, false, false)
    }
    componentWillUnmount() {
    }
    _bindPreview = (data) => {
        const { formatMessage } = this.props.intl
        let self = this

        if (data && data.body) {
            let currentData = data.body.view || []
            let loadingPad = $("div#loadingPad")
            let container = $("div#previewContentPad")

            loadingPad.show()
            container.remove()
            container = $("<div/>").attr("id", "previewContentPad").hide().insertAfter(loadingPad)

            let ret = {}
            for (let i = 0; i < currentData.length; i++) {
                let item = currentData[i]
                let key = item.fieldId
                if (!ret[key]) {
                    ret[key] = { "values": {}, "originName": "", "originType": "" }

                    switch (item.templateType) {
                        case 1: // TEMPLATE_GLOBAL_POLICY
                            ret[key].originName = "Global Policy"
                            ret[key].originType = "global"
                            break
                        case 2: // TEMPLATE_GLOBAL_TEMPLATE
                        case 3: // TEMPLATE_MODEL_DEFAULT
                        case 4: // TEMPLATE_MODEL_TEMPLATE
                            ret[key].originName = item.templateName
                            ret[key].originType = "template"
                            break
                        case 6: // TEMPLATE_DEVICE_REQUIRED
                            ret[key].originName = "UCM Configured"
                            ret[key].originType = "locked"
                            break
                        default:
                            break
                    }
                }

                ret[key].values[item.entityName] = item.value
            }
            // loading model fields
            if (!this.state.advancedSource) {
                let using = this.state.model.generateFieldList(ret)
                let devmappings = using.devmapping
                let source = using.source
                this.state.advancedSource = source
                this.state.devmappings = devmappings
            } else {
                let source = this.state.advancedSource
                // let's clean up the original values
                for (let i = 0; i < source.length; i++) {
                    let lv1 = source[i]
                    delete lv1._widget

                    if (lv1.items) {
                        for (let j = 0; j < lv1.items.length; j++) {
                            let lv2 = lv1.items[j]
                            delete lv2._widget

                            if (lv2.items) {
                                for (let k = 0; k < lv2.items.length; k++) {
                                    let item = lv2.items[k]
                                    delete item._widget
                                    delete item._loadedValue
                                    delete item._selected

                                    let found = ret[item.id]
                                    if (found) {
                                        item._loadedValue = found
                                        item._selected = true
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // process custom fields
            let customContainer = null,
                customFields = this.state.customFields
            for (let name in customFields) {
                if (customFields.hasOwnProperty(name)) {
                    let value = customFields[name]
                    let found = this.state.devmappings ? this.state.devmappings[name] : []

                    if (found) {
                        for (let i = 0; i < found.length; i++) {
                            let item = found[i]
                            if (!item._loadedValue) {
                                item._loadedValue = { "values": {}, "originName": "", "originType": "" }
                                item._selected = true
                            }
                            if (item.mappings) {
                                item._loadedValue.values[item.mappings[name]] = value
                            }
                        }
                    } else {
                        if (!customContainer) {
                            let main = $("<div/>").attr("id", "customContainer").appendTo(container)
                            let title = $("<div/>")
                                            .addClass("contaienr-header")
                                            .append($("<span/>").addClass("label").text(formatMessage({id: "LANG3483"})))
                                            .appendTo(main)

                            customContainer = $("<div/>").attr("id", "fieldContainer").appendTo(main)
                        }

                        let row = $("<div/>").addClass("field").appendTo(customContainer)
                        $("<div/>").addClass("cell label").text(name).appendTo(row)
                        $("<div/>").addClass("cell contents").text(value).appendTo(row)
                    }
                }
            }

            window.ZEROCONFIG.valueDelegation.executeRequests(function () {
                let timers = new window.SimpleTimer()
                container.fieldContainer({
                    mode: "preview",
                    source: self.state.advancedSource,
                    deferred: timers
                })

                timers.start(function () {
                    loadingPad.hide()
                    container.show()

                    $(".control").removeAttr("disabled")

                    if (customContainer) {
                        $(".empty", container).hide()
                    }

                    // we need to prevent the use of ENTER as submit on input and select fields
                    $("input,select", document).keypress(function (event) {
                        return event.keyCode !== 13
                    })
                })
            })
        } else {
            let loadingPad = $("div#loadingPad")
            let container = $("div#previewContentPad")

            loadingPad.show()

            container.remove()
            container = $("<div/>").attr("id", "previewContentPad").hide().insertAfter(loadingPad)

            console.warn("Warning: invalid return data")
            container.fieldContainer({
                mode: "preview",
                source: []
            })

            loadingPad.hide()
            container.show()

            $(".control").removeAttr("disabled")
        }
    }
    _loadPreview = (type) => {
        $(".control").attr("disabled", "disabled")

        // TODO: Add reload preview logic here
        let selectedGlobalTemplateList = $("#selGlobalTemplates")
        let selectedModelTemplateList = $("#selModelTemplates")
        let currentMac = this.state.currentMac
        let model = this.state.model
        let self = this

        let mTemplates = []
        let gTemplates = []

        $("option", selectedGlobalTemplateList).each(function (index, item) {
            gTemplates.push(item.value)
        })

        $("option", selectedModelTemplateList).each(function (index, item) {
            mTemplates.push(item.value)
        })

        let processLoadPreview = function () {
            window.ZEROCONFIG.connector.getZeroConfigPreview(currentMac, model.id(), gTemplates, mTemplates)
                .done(function (result) {
                    if (result.status === 0) {
                        self._bindPreview(result.response)
                    } else {
                        console.warn("FAILED: unable to load preview->" + result.status)
                        $(".control").removeAttr("disabled")
                    }
                }).fail(function () {
                    console.warn("FAILED", arguments)
                    $(".control").removeAttr("disabled")
                }).always(function () {
                })
        }

        if (type === "global") {
            processLoadPreview()
        } else {
            window.ZEROCONFIG.connector.getZeroConfigCustomSettings(currentMac, model.id(), mTemplates)
                .done(function (result) {
                    if (result.status === 0) {
                        self._bindCustomFields(result.response)
                        processLoadPreview()
                    } else {
                        console.warn("FAILED: unable to load custom fields->" + result.status)
                        $(".control").removeAttr("disabled")
                    }
                }).fail(function () {
                    console.warn("FAILED", arguments)
                    $(".control").removeAttr("disabled")
                }).always(function () {
                })
        }
    }
    _triggerModify = (skipTrigger, type) => {
        if (skipTrigger !== true) {
            this.state.modified = true
        }

        if (!this.state.optionTimer) {
            // $("#empty-pad").hide()
            // $("#content-pad").hide()
            // $("#loading-pad").show()
        } else {
            clearTimeout(this.state.optionTimer)
        }

        this.state.optionTimer = setTimeout(() => {
            if (this.state.singleModelMode) {
                this._loadPreview(type)
            }
            this.state.optionTimer = null
        }, 1000)
    }
    _initListBox = (type) => {
        let self = this
        let nameAddButton = "#btnModelTemplateAdd"
        let nameUpButton = "#btnModelTemplateUp"
        let nameDownButton = "#btnModelTemplateDown"
        let nameDelButton = "#btnModelTemplateDelete"
        let nameAvailList = "#availModelTemplates"
        let nameSelList = "#selModelTemplates"

        if (type === "global") {
            nameAddButton = "#btnGlobalTemplateAdd"
            nameUpButton = "#btnGlobalTemplateUp"
            nameDownButton = "#btnGlobalTemplateDown"
            nameDelButton = "#btnGlobalTemplateDelete"
            nameAvailList = "#availGlobalTemplates"
            nameSelList = "#selGlobalTemplates"
        }

        let availListWidget = $(nameAvailList)
        let selListWidget = $(nameSelList)

        $(nameAddButton).on("click", function (e) {
            let selected = $("option:selected", availListWidget)
            if (selected.length > 0) {
                let option = selected[0]
                if (option.value) {
                    option.selected = false
                    $(option).detach().appendTo(selListWidget)
                    self._triggerModify(false, type)
                } else {
                    // Nothing to handle when select empty item
                }
            }
        })

        $(nameDelButton).on("click", function (e) {
            let selected = $("option:selected", selListWidget)
            if (selected.length > 0) {
                let option = selected[0]
                if (option.value) {
                    option.selected = false
                    let $option = $(option)
                    let added = false
                    $option.detach()

                    $("option", availListWidget).each(function () {
                        let $this = $(this)
                        if ($(this).text() > $option.text()) {
                            $option.insertBefore($this)
                            added = true
                            return false
                        }
                    })

                    if (!added) {
                        $option.appendTo(availListWidget)
                    }

                    self._triggerModify(false, type)
                } else {
                    // Nothing to handle when select empty item
                }
            }
        })

        $(nameUpButton).on("click", function (e) {
            let selected = $("option:selected", selListWidget)
            if (selected.length > 0) {
                let $option = $(selected[0])
                let prev = $option.prev()
                if (prev.length > 0) {
                    let $prev = $(prev[0])

                    $option.detach().insertBefore($prev)
                    self._triggerModify(false, type)
                }
            }
        })

        $(nameDownButton).on("click", function (e) {
            let selected = $("option:selected", selListWidget)
            if (selected.length > 0) {
                let $option = $(selected[0])
                let next = $option.next()
                if (next.length > 0) {
                    let $next = $(next[0])

                    $option.detach().insertAfter($next)
                    self._triggerModify(false, type)
                }
            }
        })
    }
    _switchPads = (isSingleMode) => {
        if (isSingleMode) {
            $(".multiple-model-pad").hide()
            $(".single-model-pad").show()

            $("ul#menu li#menu-basic").show()
        } else {
            $(".multiple-model-pad").show()
            $(".single-model-pad").hide()

            $("ul#menu li#menu-basic").hide()
        }
        this.state.singleModelMode = isSingleMode
        // this.setState({
        //     singleModelMode: isSingleMode
        // })
    }
    _checkMacIsExsit = () => {
        let locationState = this.props.location.state,
            mode = locationState.mode

        if (mode && mode === 'add') {
            let val = $("input#deviceMac").val()
            let newMac = val ? val.toLowerCase() : ""
            // let macListArr = mWindow.macListArr
            // return !UCMGUI.inArray(newMac, macListArr)
        }
        return true
    }
    _bindPage = (data) => {
        const { formatMessage } = this.props.intl

        let locationState = this.props.location.state,
            mac = locationState.mac,
            item = data.zc_devices
            item.mac = mac
        // TODO: this kind of return data needs to improve!
        if (data && !_.isEmpty(data.zc_devices)) {
            let item = data.zc_devices
            item.mac = mac

            let modelId = -1,
                models = this.state.models

            for (let i = 0; i < models.length; i++) {
                if (models[i].vendor && item.vendor && models[i].vendor.toLowerCase() === item.vendor.toLowerCase() &&
                    models[i].name && item.model && models[i].name.toLowerCase() === item.model.toLowerCase()) {
                    modelId = models[i].id
                    break
                }
            }

            $("input#deviceMac").val(item.mac).attr("disabled", "disabled")
            $("input#deviceIp").val(item.ip)
            $("input#deviceVersion").val(item.version).attr("disabled", "disabled")
            // does not allow modify....? Is there any reasonable need to modify this value?

            if (modelId === -1) {
                $("#loading-pad").hide()
                $("#empty-pad").show()
            } else {
                $("#empty-pad").hide()
                $("select#deviceModel").val(modelId).attr("disabled", "disabled")
                this.state.loadedModelID = modelId
            }

            window.BLL.ConfigPage.updatePageConfig(modelId, "device", item, true)
            if (window.BLL.ConfigPage.modelInfo()) {
                window.BLL.ConfigPage.modelInfo().prepareListData()
            }
            $("div#selectdeviceModel.divSelect span.modelSpanDes").css("width", "")
        } else {
            message.error(formatMessage({id: "LANG3881"}))
            this._processReloadTable()
            message.destroy()
        }
        let model = window.BLL.DataCollection.getModelByName(item.vendor, item.model)
        this.state.model = model
        if (model) {
            item.modelId = model.id()

            $("#loading-pad").hide()
            // $("#empty-pad").show()

            // $("span#deviceMac").html(item.mac)
            // $("span#deviceIp").html(item.ip)
            // $("span#deviceVersion").html(item.version)
            // $("span#deviceModel").html((item.vendor + " " + item.model).toUpperCase())
            // does not allow modify....? Is there any reasonable need to modify this value?
            // $("select#deviceModel").val(modelId).attr("disabled", "disabled");

            // let thumbnail = $("div.thumbnail")
            // thumbnail.empty()
            // let img = new Image()
            // img.onload = function () {
            //     thumbnail[0].appendChild(img)
            // }
            // img.onerror = function () {
            //     img = null
            //     thumbnail.append($("<img/>").attr("src", "/../../images/empty.png").addClass("sm_thumbnail"))
            // }
            // img.className = "sm_thumbnail"
            // img.src = model.resourcePath() + model.thumbnail()

            window.BLL.ConfigPage.updatePageConfig(item.modelId, "device", item)
            window.BLL.ConfigPage.modelInfo().prepareListData()
        } else {
            $("#empty-pad").hide()
        }
    }
    _bindCustomFields = (data) => {
        let customFields = {}
        if (data && data.getZeroConfigCustomSettings) {
            let currentData = data.getZeroConfigCustomSettings

            for (let i = 0; i < currentData.length; i++) {
                let item = currentData[i]

                customFields[item.devname] = item.value
            }
            this.state.customFields = customFields
            // this.setState({
            //     customFields: customFields
            // })
        } else {
            console.warn("Unable to retrieve the custom fields for this page.")
        }
    }
    _bindTemplates = (data, isModel) => {
        if (data) {
            let currentData = data
            for (let i = 0; i < currentData.length; i++) {
                let item = currentData[i]

                if (item.is_default) {
                    let defaultModelTemplate = item
                    $("#contentDefaultModel").text(defaultModelTemplate.name)
                    this.state.defaultModelTemplate = defaultModelTemplate
                    // this.setState({
                    //     defaultModelTemplate: defaultModelTemplate
                    // })
                } else {
                    this.state.templates[item.id] = item
                    if (isModel) {
                        item.isModel = true
                    }
                }
            }
        }
    }
    _bindMappings = (data) => {
        let modelTemplateList = $("select#availModelTemplates")
        let globalTemplateList = $("select#availGlobalTemplates")

        let selectedGlobalTemplateList = $("#selGlobalTemplates")
        let selectedModelTemplateList = $("#selModelTemplates")

        this.state.curModelTemplates.length = 0
        this.state.curGlobalTemplates.length = 0

        if (data && data.zc_device_template_mapping) {
            let currentData = data.zc_device_template_mapping

            for (let i = 0; i < currentData.length; i++) {
                let item = currentData[i]
                let template = this.state.templates[item.template_id]
                if (template) {
                    template.mapped = true
                    let usingList = selectedGlobalTemplateList
                    if (template.isModel) {
                        usingList = selectedModelTemplateList
                        this.state.curModelTemplates.push(template.id)
                    } else {
                        this.state.curGlobalTemplates.push(template.id)
                    }
                    usingList.append($("<option/>").attr("value", template.id).text(template.name))
                }
            }
        }

        let modelTemplates = []
        let globalTemplates = []
        let templates = this.state.templates

        for (let name in templates) {
            if (templates.hasOwnProperty(name)) {
                let item = templates[name]
                if (!item.mapped) {
                    if (item.isModel) {
                        modelTemplates.push(item)
                    } else {
                        globalTemplates.push(item)
                    }
                }
            }
        }

        let sortItem = function (a, b) {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        }

        modelTemplates.sort(sortItem)
        globalTemplates.sort(sortItem)

        // bind available model templates
        if (this.state.__modelTemplateLoaded && !this.state.__modelTemplateRendered) {
            modelTemplateList.append($("<option/>").attr("value", "").text(""))
            for (let i = 0; i < modelTemplates.length; i++) {
                let item = modelTemplates[i]
                if (item) {
                    modelTemplateList.append(
                        $("<option/>").attr("value", item.id).text(item.name)
                    )
                }
            }
            this.state.__modelTemplateRendered = true
        }

        if (this.state.__globalTemplateLoaded && !this.state.__globalTemplateRendered) {
            globalTemplateList.append($("<option/>").attr("value", "").text(""))
            for (let i = 0; i < globalTemplates.length; i++) {
                let item = globalTemplates[i]
                if (item) {
                    globalTemplateList.append(
                        $("<option/>").attr("value", item.id).text(item.name)
                    )
                }
            }
            this.state.__globalTemplateRendered = true
        }
    }
    _loadRequiredContents = (callback) => {
        const { formatMessage } = this.props.intl

        let locationState = this.props.location.state,
            mode = locationState.mode,
            self = this

        let processList = []
        let processName = []

        if (!this.state.__globalTemplateLoaded) {
            processList.push(window.ZEROCONFIG.connector.getAllTemplates("global", "enabled"))
            processName.push("GlobalTemplates")
        }

        if (this.state.singleModelMode) {
            if (!this.state.__modelTemplateLoaded) {
                if (this.state.model) {
                    processList.push(window.ZEROCONFIG.connector.getAllModelTemplates(this.state.model.id(), "enabled"))
                } else {
                    processList.push(window.ZEROCONFIG.connector.getAllModelTemplates("", "enabled"))
                }
                processName.push("ModelTemplates")
            }
        }

        if (mode !== "batch") {
            processList.push(window.ZEROCONFIG.connector.getDeviceTemplateMappings(this.state.currentMac))
            processName.push("Mapping")
        }

        $.when.apply({}, processList).done(function () {
            let resultSet = arguments
            if (processList.length === 1) {
                resultSet = []
                resultSet.push(arguments)
            }

            for (let i = 0; i < processList.length; i++) {
                let result = resultSet[i][0]
                if (result.status !== 0) {
                    // TODO: add error handling
                    console.error("Process error:" + processName[i])
                    return
                } else {
                    if (processName[i] === "GlobalTemplates") {
                        self._bindTemplates(result.response.templates, false)
                        self.state.__globalTemplateLoaded = true
                    } else if (processName[i] === "ModelTemplates") {
                        self._bindTemplates(result.response.model_id, true)
                        self.state.__modelTemplateLoaded = true
                    } else if (processName[i] === "Mapping") {
                        self._bindMappings(result.response)
                    }
                }
            }

            $("div#preparePad").hide()
            $("div#contentPad").show()

            if (typeof callback === "function") {
                callback.call(this)
            }
        }).fail(function () {
            message.destroy()
            console.log("FAIL", arguments)
            message.error(formatMessage({id: "LANG862"}))
        })
    }
    _processReloadTable = (selectedRows) => {
        let _this = this

        window.ZEROCONFIG.connector.getAllDeviceExtensions().done(function (result) {
            if (result.status === 0) {
                let data = result.response.getAllDeviceExtensions,
                    macExtensions = {}

                _.each(data, function(item, index) {
                    let usingMac = item.mac.toUpperCase()
                    if (!macExtensions[usingMac]) {
                        macExtensions[usingMac] = []
                    }

                    macExtensions[usingMac].push(item.extension)
                })
                _this.state.macExtensions = macExtensions
            }
        }).always(function () {
            if (selectedRows === undefined || selectedRows === null) {
                // $("#zc_devices_list").trigger('reloadGrid')
            } else {
                // jumpPageOrNot(selectedRows)
            }
        })
    }
    _bindSettings = (data) => {
        let ret = {}
        // TODO: this kind of return data needs to improve!
        if (data && data.mac) {
            let currentData = data.mac

            // NOTE: it is weird the return data is stored under object.template_id
            for (let i = 0; i < currentData.length; i++) {
                let item = currentData[i]
                let key = item.element_id + "#" + item.element_number
                if (!ret[key]) {
                    ret[key] = {
                        "values": {},
                        "originName": "",
                        "originType": ""
                    }
                }

                ret[key].values[item.entity_name] = item.value
            }
        } else {
            console.warn("Unable to retrieve the data for this page.")
        }

        this._bindBasicOptions(ret, function () {
            $("div#preparePad").hide()
            $("div#contentPad").show()
        })
    }
    _loadPageContents = () => {
        const { formatMessage } = this.props.intl

        let locationState = this.props.location.state,
            mac = locationState.mac,
            ip = locationState.ip,
            self = this

        let processList = []
        let processName = []

        processList.push(window.ZEROCONFIG.connector.getZeroConfig(mac, ip))
        processName.push("Item")

        processList.push(window.ZEROCONFIG.connector.getDeviceTypeSettings(mac))
        processName.push("Settings")

        $.when.apply({}, processList).done(function () {
            let resultSet = arguments
            if (processList.length === 1) {
                resultSet = []
                resultSet.push(arguments)
            }

            for (let i = 0; i < processList.length; i++) {
                let result = resultSet[i][0]
                if (result.status !== 0) {
                    // TODO: add error handling
                    console.error("Process error:" + processName[i])
                    return
                } else {
                    if (processName[i] === "Item") {
                        self._bindPage(result.response)
                    } else if (processName[i] === "Settings") {
                        self._bindSettings(result.response)
                    }
                }
            }
        }).fail(function () {
            message.destroy()
            console.log("FAIL", arguments)
            message.error(formatMessage({id: "LANG862"}))
        })
        window.ZEROCONFIG.connector.getZeroConfig(mac, ip).done(function (result) {
            if (result.status === 0) {
                // binding page state
                self._bindPage(result.response)

                self._loadRequiredContents(function () {
                    // loading the preview when ready
                    self._loadPreview()
                })
            } else {
                message.destroy()
                // TODO: add customize error
                console.log("FAIL", arguments)
                message.error(formatMessage({id: "LANG862"}))
            }
        }).fail(function () {
            message.destroy()
            console.log("FAIL", arguments)
            message.error(formatMessage({id: "LANG862"}))
        })
    }
    _pageSubmit = (callback) => {
        const { formatMessage } = this.props.intl

        let locationState = this.props.location.state,
            mode = locationState.mode,
            mac = locationState.mac,
            self = this
        message.loading(formatMessage({id: "LANG978"}), 0)
        let doSave = function () {
            let action = {},
                macVal = $("input#deviceMac").val()

            action["action"] = (mode === 'edit' ? "updateZeroConfig" : "addZeroConfig")
            if (macVal) {
                action["mac"] = macVal.toUpperCase()
            }

            // if (mode === 'edit') {
            //    action["original_ip"] = ip && ip !== "null" ? ip : ""
            // }

            action["ip"] = $('input#deviceIp').val()
            action["version"] = $('input#deviceVersion').val()

            let modelId = $("select#deviceModel").val()
            let modelName = ""
            let vendorName = ""
            let models = self.state.models

            for (let i = 0; i < models.length; i++) {
                if (models[i].id === Number(modelId)) {
                    vendorName = models[i].vendor
                    modelName = models[i].name
                    break
                }
            }
            action["vendor"] = vendorName
            action["model"] = modelName

            // TODO: ??? what do status 6, 7 and 8 mean???
            if (status && (status === 6 || status === 7) && mode === 'edit') {
                action["state"] = 8
            }

            return $.ajax({
                type: "post",
                url: baseServerURl,
                data: action,
                success: function(data) {
                    // browserHistory.push('/value-added-features/zeroConfig/devices')
                }
            })
        }
        let upgrade = function () {
            let locationState = self.props.location.state,
                mac = locationState.mac

            let after = function(res) {
                message.destroy()

                if (res && res.status === '0') {
                    // message.success(formatMessage({id: "LANG829"}))
                } else {
                    message.warning("Wrong")
                }
            }
            confirm({
                content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG2692"}) }}></span>,
                okText: 'OK',
                cancelText: 'Cancel',
                onOk: () => {
                    // message.loading(formatMessage({id: "LANG829"}))
                    $.ajax({
                        type: "GET",
                        url: baseServerURl + "action=DownloadCfg&mac=" + mac,
                        error: function (jqXHR, textStatus, errorThrown) { },
                        success: after
                    })
                },
                onCancel: () => {
                    message.destroy()
                }
            })
        }

        let usingMac
        let keepExtensions = false
        if (mode === "batch") {
            usingMac = $("div#batch-list").modelDevices("deviceList")
            keepExtensions = []
            for (let i = 0; i < usingMac.length; i++) {
                keepExtensions[i] = true
            }
        } else {
            usingMac = $("input#deviceMac").val().toUpperCase()
            keepExtensions = false
        }

        window.BLL.PrepareSubmitConfigurations(usingMac, this.state.basicSource, function (result) {
            if (result.error.length > 0) {
                // TODO: come back to display error
                // display error here
                // for (let i = 0; i < result.error.length; i++) {
                //    console.error(result.error[i])
                // }
            } else {
                let upd = result.update.refId.length > 0
                let processAdd = function () {
                    let processList = []
                    let processName = []

                    // message.loading(formatMessage({id: "LANG978"}), 0)
                    if (mode !== "batch") {
                        processName.push("item")
                        processList.push(doSave())
                    }
                    if (upd) {
                        processName.push("insert")
                        processList.push(window.ZEROCONFIG.connector.insertDeviceTypeSettings(result.update.refId,
                            result.update.elementId, // this is actually field ids
                            result.update.elementNum,
                            result.update.entityName,
                            result.update.value))
                    }

                    $.when.apply({}, processList).done(function () {
                        let resultSet = arguments
                        if (processList.length === 1) {
                            resultSet = []
                            resultSet.push(arguments)
                        }

                        for (let i = 0; i < processName.length; i++) {
                            let result = resultSet[i][0]
                            if (result.status !== 0) {
                                message.destroy()
                                console.error("Process error:" + processName[i])
                                // let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)
                                message.error("Process error:" + processName[i])
                                return
                            }
                        }

                        // message.destroy()
                        // message.success(formatMessage({id: "LANG873"}))

                        let DO_RELOAD = function () { // DO_RELOAD()
                            self._processReloadTable()

                            if (status && (status === 6 || status === 7) && mode === 'edit') {
                                message.destroy()
                                upgrade()
                            } else {
                                message.destroy()
                            }

                            // mWindow.$("#zc_devices_list", mWindow.document).trigger('reloadGrid')

                            // Load required letiables
                            // reloadletiables() // FIXME [AH] is this really needed?
                        }

                        if (typeof callback === "function") {
                            callback.call(self)
                        } else {
                            setTimeout(DO_RELOAD, 1000)
                        }
                    }).fail(function () {
                        message.destroy()
                        console.log("FAIL", arguments)
                        message.error(formatMessage({id: "LANG862"}))
                    })
                }

                let processUpdate = function () {
                    if (mode !== "add") {
                        // using original mac address to remove
                        window.ZEROCONFIG.connector.deleteAllDeviceTypeSettings(usingMac, keepExtensions).done(processAdd).fail(function () {
                            message.destroy()
                            console.log("FAIL", arguments)
                            message.error(formatMessage({id: "LANG862"}))
                        })
                    } else {
                        processAdd()
                    }
                }
                if (upd) {
                    window.ZEROCONFIG.connector.checkDeviceTypeSettings(result.update.refId,
                        result.update.elementId, // this is actually field ids
                        result.update.elementNum,
                        result.update.entityName,
                        result.update.value).done(function (data) {
                        let response = data.response
                        if (data.status !== 0) {
                            message.destroy()
                            message.error(formatMessage({id: "LANG862"}))
                            return
                        } else if (response.listUnavailableSIPAccount !== undefined && response.listUnavailableSIPAccount.length > 0) {
                            let extList = ""
                            for (let i = 0; i < response.listUnavailableSIPAccount.length; i++) {
                              extList += " " + response.listUnavailableSIPAccount[i].extension
                            }
                            message.destroy()
                            message.error(formatMessage({id: "LANG862"}) + formatMessage({id: "LANG4832"}, {0: extList}))
                            return
                        } else {
                            processUpdate()
                        }
                    })
                } else {
                    processUpdate()
                }
            }
        })

        //  if (this.state.modified) {
        //      message.loading(formatMessage({id: "LANG978"}), 0)
        //  }

         let macList = []
         let keepModelTemps = false
         if (mode !== "batch") {
             macList.push(this.state.currentMac)
         } else {
             macList = $("div#batch-list").modelDevices("deviceList")
             keepModelTemps = []
             for (let i = 0; i < macList.length; i++) {
                 keepModelTemps[i] = !self.state.singleModelMode
             }
         }

         window.ZEROCONFIG.connector.deleteDeviceTemplateMappings(macList, keepModelTemps).done(function () {
             let updateList = {
                 "mac": [],
                 "templateId": [],
                 "priority": []
             }

             let selectedGlobalTemplateList = $("#selGlobalTemplates")
             let selectedModelTemplateList = $("#selModelTemplates")

             let p = 0

             self.state.curGlobalTemplates.length = 0
             self.state.curModelTemplates.length = 0

             $("option", selectedGlobalTemplateList).each(function (index, item) {
                 let usingP = ++p

                 for (let i = 0; i < macList.length; i++) {
                     updateList.mac.push(macList[i])
                     updateList.templateId.push(item.value)
                     updateList.priority.push(usingP)
                 }

                 self.state.curGlobalTemplates.push(item.value)
             })

             $("option", selectedModelTemplateList).each(function (index, item) {
                 let usingP = ++p

                 for (let i = 0; i < macList.length; i++) {
                     updateList.mac.push(macList[i])
                     updateList.templateId.push(item.value)
                     updateList.priority.push(usingP)
                 }

                 self.state.curModelTemplates.push(item.value)
             })

             if (updateList.mac.length > 0) {
                 window.ZEROCONFIG.connector.updateDeviceTemplateMappings(
                     updateList.mac,
                     updateList.templateId,
                     updateList.priority
                 ).done(function (result) {
                     if (result.status === 0) {
                         if (typeof callback === "function") {
                             callback.call(self)
                         } else {
                             let DO_RELOAD = function () { // DO_RELOAD();
                                 if ((status === 6 || status === 7) && mode === "edit") {
                                     let after = (res) => {
                                         message.destroy()

                                         if (res && res.status === '0') {
                                             message.success(formatMessage({id: "LANG829"}))
                                         } else {
                                             message.warning("Wrong!")
                                         }
                                     }

                                     confirm({
                                         content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG2692"}) }}></span>,
                                         okText: 'OK',
                                         cancelText: 'Cancel',
                                         onOk: () => {
                                             // top.dialog.dialogMessage({ type: 'loading', content: $P.lang("LANG829")});
                                             $.ajax({
                                                 type: "GET",
                                                 url: baseServerURl + "action=DownloadCfg&mac=" + mac,
                                                 error: function (jqXHR, textStatus, errorThrown) { },
                                                 success: after
                                             })
                                         },
                                         onCancel: () => {
                                             message.destroy()
                                         }
                                     })
                                 } else {
                                     message.destroy()
                                 }
                             }

                             setTimeout(DO_RELOAD, 1000)
                             self._processReloadTable()
                             message.destroy()
                             message.success(formatMessage({id: "LANG873"}))
                             browserHistory.push('/value-added-features/zeroConfig/devices')
                         }
                     } else {
                         console.warn("PROCESS ERROR", result)
                         message.destroy()
                         message.error(formatMessage({id: "LANG862"}))
                     }
                 }).fail(function () {
                     console.warn("PROCESS ERROR", arguments)
                     message.destroy()
                     message.error(formatMessage({id: "LANG862"}))
                 })
             } else {
                 if (typeof callback === "function") {
                     callback.call(self)
                 } else {
                     self._processReloadTable()
                     message.destroy()
                     message.success(formatMessage({id: "LANG873"}))
                     browserHistory.push('/value-added-features/zeroConfig/devices')
                 }
             }
         })
    }
    _bindBasicOptions = (data, callback) => {
        let self = this
        let model = null
        let locationState = this.props.location.state,
            mode = locationState.mode
        let modelSelect = $("select#deviceModel")
        let id = modelSelect.val()
        let container = $("div#content-pad")
        container.empty()
        let models = this.state.models
        for (let i = 0; i < models.length; i++) {
            if (models[i].id === Number(id)) {
                model = models[i]
                break
            }
        }

        if (model) {
            window.BLL.ConfigPage.updatePageConfig(id, "model", model, true)
            window.BLL.ConfigPage.modelInfo().prepareListData()
            let source = window.BLL.DataCollection.generateTypeBlockList(model.modelType, data)
            this.state.basicSource = source
            window.ZEROCONFIG.valueDelegation.executeRequests(function (result) {
                let timers = new window.SimpleTimer()

                for (let i = 0; i < source.length; i++) {
                    timers.add((function (idx) {
                        return function () {
                            let subGroup = $("<div/>").fieldSubGroup({
                                "item": function () {
                                    return source[idx]
                                },
                                "deferred": timers,
                                "mode": "all"
                            })

                            subGroup.appendTo(container)
                        }
                    })(i))
                }

                timers.start(function () {
                    if (mode === "edit" && self.state.loadedModelID > -1) {
                        $("ul#menu li#menu-advanced").show()
                    }

                    $("#loading-pad").hide()
                    if (source) {
                        container.show()
                    }

                    if (typeof callback === "function") {
                        callback.call(self)
                    }

                    // we need to prevent the use of ENTER as submit on input and select fields
                    $("input,select", document).keypress(function (event) {
                        return event.keyCode !== 13
                    })

                    window.ZEROCONFIG.ValueMonitor.sync()
                })
            })

            let modelInfo = window.BLL.ConfigPage.modelInfo()
            let thumbnail = $("div.thumbnail")
            thumbnail.empty()
            let img = new Image()
            img.onload = function () {
                thumbnail[0].appendChild(img)

                let imageItems = []
                let imageList = modelInfo.imageMappings()
                for (let name in imageList) {
                    if (imageList.hasOwnProperty(name)) {
                        let newMapItem = {}
                        let imgMap = imageList[name]
                        let regions = imgMap.getRegions()

                        newMapItem.src = modelInfo.resourcePath() + imgMap.getPath()
                        newMapItem.verticalFit = false
                        newMapItem.map = []
                        for (let rname in regions) {
                            if (regions.hasOwnProperty(rname)) {
                                let region = regions[rname]
                                let link = region.getLink(window.BLL.ConfigPage.mode())
                                if (link) {
                                    newMapItem.map.push({ "coords": region.toCoords(), "ref": link.getFullPath() })
                                }
                            }
                        }

                        imageItems.push(newMapItem)
                    }
                }

                if (imageItems.length > 0) {
                    let zoom = $("<div/>")
                                .addClass("zoon-glass")
                                .appendTo(thumbnail)

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
                                let $sender = $(sender)
                                let ref = $sender.attr("ref")
                                if (ref) {
                                    let found = $("[path='" + ref + "']")
                                    if (found.length > 0) {
                                        $.magnificPopup.close()
                                        // $('html, body').scrollTop(found.offset().top)
                                        window.location.hash = "" // clear existing hash
                                        window.location.hash = "#" + found.attr("id")
                                    }
                                }
                            }
                        }
                    })
                }
            }
            img.onerror = function () {
                img = null
                thumbnail.append($("<img/>").attr("src", "/../../images/empty.png").addClass("sm_thumbnail"))
            }
            img.className = "sm_thumbnail"
            img.src = modelInfo.resourcePath() + modelInfo.thumbnail()
        } else {
            // $("ul#menu li#menu-advanced").hide()
            $("#loading-pad").hide()
            $("#empty-pad").show()
            if (typeof callback === "function") {
                callback.call(this)
            }
        }
    }
    _bindModels = () => {
        this.state.models = window.BLL.DataCollection.generateBasicModelList()
        let self = this
        let modelSelect = $("select#deviceModel")

        let basicOptionBoundCallback = function () {
            modelSelect.removeAttr("disabled")
        }

        modelSelect.on("change", function (e) {
            let optionTimer = self.state.optionTimer
            if (!optionTimer) {
                $("#empty-pad").hide()
                $("#content-pad").hide()
                $("#loading-pad").show()
            } else {
                clearTimeout(optionTimer)
            }

            optionTimer = setTimeout(function () {
                modelSelect.attr("disabled", "disabled")
                self._bindBasicOptions(self.state.loadedConfigure, basicOptionBoundCallback)
                optionTimer = null
            }, 1000)
        })

        // insert empty model
        modelSelect.append($("<option/>").val("").text(""))

        // bind models to the list
        $.each(this.state.models, function (idx, item) {
            modelSelect.append($("<option/>").val(item.id).html((item.vendor + " " + item.name).toUpperCase()))
        })
    }
    _handleSubmit = () => {
        this._pageSubmit()
    }
    _handleCancel = () => {
        browserHistory.push('/value-added-features/zeroConfig/devices')
    }
    _onChange = (activeKey) => {
        this.setState({
            activeKey
        })
    }
    _deviceCustomSettings = () => {
        let locationState = this.props.location.state,
            mode = locationState.mode,
            mac = locationState.mac,
            ip = locationState.ip,
            mid = locationState.mid,
            state = this.state,
            macList = []

            if (mode !== "batch") {
                // top.dialog.dialogInnerhtml({
                //     dialogTitle: $P.lang("LANG222").format($P.lang("LANG3476"), mac),
                //     displayPos: "editForm",
                //     frameSrc: "html/zc_devices_modal_custom.html?mode=edit&mac={0}&ip={1}&gtemp={2}&mtemp={3}&status={4}".format(usingMac, usingIP, curGlobalTemplates.toString(), curModelTemplates.toString(), usingStatus)
                // })
                browserHistory.push({
                    pathname: '/value-added-features/zeroConfig/devices/customSettings/',
                    state: {
                        mode: "edit",
                        mac: mac,
                        ip: ip,
                        status: status,
                        gtemp: state.curGlobalTemplates.toString(),
                        mtemp: state.curModelTemplates.toString()
                    }
                })
            } else {
                macList = $("div#batch-list").modelDevices("deviceList")
                // top.dialog.dialogInnerhtml({
                //     dialogTitle: $P.lang("LANG3866"),
                //     displayPos: "editForm",
                //     frameSrc: "html/zc_devices_modal_custom.html?mode=batch&mac={0}&gtemp={1}&mtemp={2}&mid={3}&ip=&status=".format(macList.toString(), curGlobalTemplates.toString(), curModelTemplates.toString(), model.id())
                // })
                browserHistory.push({
                    pathname: '/value-added-features/zeroConfig/devices/customSettings/',
                    state: {
                        mode: "batch",
                        mac: macList.toString(),
                        ip: ip,
                        status: status,
                        gtemp: state.curGlobalTemplates.toString(),
                        mtemp: state.curModelTemplates.toString(),
                        mid: state.model.id()
                    }
                })
            }
    }
    _editGlobalPolicy = () => {
        browserHistory.push('/value-added-features/zeroConfig/globalPolicy')
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        }
        let locationState = this.props.location.state,
            mode = "",
            mac = "",
            ip = ""

        if (locationState) {
            mode = locationState.mode
            mac = locationState.mac
            ip = locationState.ip
        }
        let headerTitle = formatMessage({id: "LANG754"})

        if (mode === "edit") {
            headerTitle = formatMessage({id: "LANG222"}, {0: formatMessage({id: "LANG1287"}), 1: mac.toUpperCase()})
        }
        return (
            <div className="app-content-main app-content-main-zeroconfig" id="app-content-main">
                <Title
                    headerTitle={ headerTitle }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <div className="content">
                    <Form>
                        <div id="preparePad" style={{ width: "96%", display: "table" }}>
                            <div style={{ display: "table-cell", verticalAlign: "middle" }}>
                                <div style={{display: "none"}}>
                                    <span id="loadingMsg" style={{ textAlign: "center" }}>{ formatMessage({id: "LANG805"}) }</span>
                                    <img src="/../../images/ani_loading.gif" />
                                </div>
                            </div>

                        </div>
                        <div id="info-container">
                            <Row>
                                <Col span={5}>
                                    <div className="cell thumbnail">
                                        <img id="thumbnail" src="/../../images/empty.png" className="sm_thumbnail" />
                                    </div>
                                </Col>
                                <Col span={10}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG3461" />}>
                                                <span>{ formatMessage({id: "LANG3461"}) }</span>
                                            </Tooltip>
                                        )}>
                                        <select id="deviceModel"></select>
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1294" />}>
                                                <span>{ formatMessage({id: "LANG1293"}) }</span>
                                            </Tooltip>
                                        )}>
                                        <input id="deviceMac" maxLength="12" />
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1292" />}>
                                                <span>{ formatMessage({id: "LANG1291"}) }</span>
                                            </Tooltip>
                                        )}>
                                        <input id="deviceIp" maxLength="64" />
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1297" />}>
                                                <span>{ formatMessage({id: "LANG1298"}) }</span>
                                            </Tooltip>
                                        )}>
                                        <input id="deviceVersion" maxLength="128" />
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>
                        <div id="batch-container" style={{ display: "none" }}>
                            <div className="section-message">{ formatMessage({id: "LANG3889"}) }</div>
                            <div id="batch-list"></div>
                        </div>
                        {/* <div id="option-container">
                            <ul id="menu">
                                <li id="menu-basic"><a>{ formatMessage({id: "LANG3472"}) }</a></li>
                                <li id="menu-advanced"><a>{ formatMessage({id: "LANG3473"}) }</a></li>
                            </ul>
                        </div> */}
                        <div className="section-body section-body-top">
                            <div className="nav_wrap">
                                <div className="settings_hr"></div>
                                <ul id="nav_settings" className="clearfix">
                                    <li className="current">
                                        <a href="javascript:;">{ formatMessage({id: "LANG3472"}) }</a>
                                    </li>
                                    <li className={ mode === "edit" ? "display-inline" : "hidden" }>
                                        <a href="javascript:;">{ formatMessage({id: "LANG3473"}) }</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="item_parent">
                            {/* basic */}
                            <div className="settings_floor1 settings current_position">
                                <div id="content-container">
                                    <div id="empty-pad">
                                        <div style={{ textAlign: "center", height: "30px", paddingTop: "30px" }}>{ formatMessage({id: "LANG3474"}) }</div>
                                    </div>
                                    <div id="loading-pad" style={{ display: "none" }}>
                                        <div style={{ paddingTop: "30px" }}>
                                            <span style={{ textAlign: "center", display: "none" }}>{ formatMessage({id: "LANG805"}) }</span>
                                            <img src="/../../images/ani_loading.gif" />
                                        </div>
                                    </div>
                                    <div id="content-pad" style={{ backgroundColor: "#efefef" }}></div>
                                </div>
                            </div>
                            {/* basic */}
                            {/* floor2 */}
                            <div className="settings_floor2 settings">
                                <div className="content">
                                    <div id="content-container" className="dev-advanced">
                                        <div id="template-pad">
                                            <div className="section-head">
                                                <span className="num">5</span>
                                                <span className="label">{ formatMessage({id: "LANG3476"}) }</span>
                                            </div>
                                            <div className="section-content">
                                                <div className="single-model-pad">
                                                    <div id="btnEditCustomizeSettings" className="controlButton" onClick={ this._deviceCustomSettings }>
                                                        <span className="icon edit">&nbsp;</span>
                                                        <span className="label">{ formatMessage({id: "LANG3477"}) }</span>
                                                    </div>
                                                </div>
                                                <div className="multiple-model-pad" style={{ textAlign: "center" }}>
                                                    <span className="warning">{ formatMessage({id: "LANG3888"}) }</span>
                                                </div>
                                            </div>
                                            <div className="section-head">
                                                <span className="num">4</span>
                                                <span className="label">{ formatMessage({id: "LANG3445"}) }</span>
                                            </div>
                                            <div className="section-content">
                                                <div className="single-model-pad">
                                                    <div className="template-list">
                                                        <div className="cell label">{ formatMessage({id: "LANG110"}) }</div>
                                                        <div className="cell content">
                                                            <select id="availModelTemplates" name="availModelTemplates" className="control"></select>
                                                        </div>
                                                        <div className="cell option">
                                                            <span id="btnModelTemplateAdd" className="control add"></span>
                                                        </div>
                                                    </div>
                                                    <div className="template-list">
                                                        <div className="cell label">{ formatMessage({id: "LANG3475"}) }</div>
                                                        <div className="cell content">
                                                            <select id="selModelTemplates" name="selModelTemplates" size="4" className="control"></select>
                                                        </div>
                                                        <div className="cell option">
                                                            <span id="btnModelTemplateUp" className="control up"></span>
                                                            <span id="btnModelTemplateDown" className="control down"></span>
                                                            <span id="btnModelTemplateDelete" className="control delete"></span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="multiple-model-pad" style={{ textAlign: "center" }}>
                                                    <span className="warning">{ formatMessage({id: "LANG3888"}) }</span>
                                                </div>
                                            </div>
                                            <div className="section-head">
                                                <span className="num">3</span>
                                                <span className="label">{ formatMessage({id: "LANG3462"}) }</span>
                                            </div>
                                            <div className="section-content">
                                                <div className="single-model-pad">
                                                    <div id="contentDefaultModel">[ <span style={{ color: "#808080" }}>{ formatMessage({id: "LANG113"}) }</span> ]</div>
                                                </div>
                                                <div className="multiple-model-pad" style={{ textAlign: "center" }}>
                                                    <span className="warning">{ formatMessage({id: "LANG3888"}) }</span>
                                                </div>
                                            </div>
                                            <div className="section-head">
                                                <span className="num">2</span>
                                                <span className="label">{ formatMessage({id: "LANG3444"}) }</span>
                                            </div>
                                            <div className="section-content">
                                                <div className="template-list">
                                                    <div className="cell label">{ formatMessage({id: "LANG110"}) }</div>
                                                    <div className="cell content">
                                                        <select id="availGlobalTemplates" name="availGlobalTemplates" className="control"></select>
                                                    </div>
                                                    <div className="cell option">
                                                        <span id="btnGlobalTemplateAdd" className="control add"></span>
                                                    </div>
                                                </div>
                                                <div className="template-list">
                                                    <div className="cell label">{ formatMessage({id: "LANG3475"}) }</div>
                                                    <div className="cell content">
                                                        <select id="selGlobalTemplates" name="selGlobalTemplates" size="4" className="control"></select>
                                                    </div>
                                                    <div className="cell option">
                                                        <span id="btnGlobalTemplateUp" className="control up disable"></span>
                                                        <span id="btnGlobalTemplateDown" className="control down"></span>
                                                        <span id="btnGlobalTemplateDelete" className="control delete"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="section-head">
                                                <span className="num">1</span>
                                                <span className="label">{ formatMessage({id: "LANG3169"}) }</span>
                                            </div>
                                            <div className="section-content">
                                                <div id="btnEditGlobalPolicy" className="controlButton" onClick={ this._editGlobalPolicy }>
                                                    <span className="icon edit">&nbsp;</span>
                                                    <span className="label">{ formatMessage({id: "LANG3478"}) }</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div id="separator-pad">&nbsp;</div>
                                        <div id="preview-pad">
                                            <div className="section-head">
                                                <span className="icon">&nbsp;</span>
                                                <span className="label">{ formatMessage({id: "LANG3479"}) }</span>
                                            </div>
                                            <div className="section-content">
                                                <div className="single-model-pad">
                                                    <div id="previewPrepareMsg" style={{ display: "none", lineHeight: "18px", border: "1px solid #ccc", padding: "4px 4px 4px 8px" }}></div>
                                                    <div id="loadingPad" style={{ width: "96%", display: "table" }}>
                                                        <div style={{ display: "table-cell", verticalAlign: "middle" }}>
                                                            <div style={{ textAlign: "center" }}>
                                                                <img src="/../../images/loading.gif" />
                                                            </div>
                                                            <div style={{ textAlign: "center" }}>{ formatMessage({id: "LANG805"}) }</div>
                                                        </div>
                                                    </div>
                                                    <div id="previewContentPad" style={{ display: "none" }}></div>
                                                </div>
                                                <div className="multiple-model-pad" style={{ textAlign: "center" }}>
                                                    <span className="warning">{ formatMessage({id: "LANG3888"}) }</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(DevicesItem))

'use strict'

import $ from 'jquery'
import _ from 'underscore'
import cookie from 'react-cookie'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, formatMessage } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs, Modal, Table, Popconfirm } from 'antd'
import api from "../../api/api"
import Validator from "../../api/validator"
import UCMGUI from "../../api/ucmgui"

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const baseServerURl = api.apiHost

    // mode = gup.call(window, "mode"),
    // mac = gup.call(window, "mac"),
    // mid = gup.call(window, "mid"),
    // ip = gup.call(window, "ip"),
    // status = gup.call(window, "status"),
    // loadedConfigure = null,

class DeviceAdvanced extends Component {
    constructor(props) {
        super(props)
        this.state = {
            singleModelMode: false,
            optionTimer: null,
            modified: false,
            model: {},
            source: null,
            customFields: {},
            currentMac: this.props.mac,
            devmappings: null,
            curModelTemplates: [],
            curGlobalTemplates: [],
            templates: {},
            defaultModelTemplate: null,
            __globalTemplateLoaded: false,
            __globalTemplateRendered: false,
            __modelTemplateLoaded: false,
            __modelTemplateRendered: false
        }
    }
    componentDidMount() {
        const { formatMessage } = this.props.intl

        let mode = this.props.mode,
            self = this

        if (mode === "add") {
            // TODO: add error handling
            console.error("ERROR: unsupported mode")
            return
        }
        window.BLL.ConfigPage.updatePageDOM("device-advanced", window, document)
        this._checkReady()
    }
    componentWillUnmount() {
    }
    _checkReady = () => {
        const { formatMessage } = this.props.intl

        let locationState = this.props.devicesItemAdvanced,
            mode = locationState.mode,
            self = this

        if (window.ZEROCONFIG.isDataReady() === 1) {
            window.BLL.DataCollection.prepareGlobalList()
            // handle menu logic
            $("ul#menu li#menu-advanced").addClass("sel")
            $("ul#menu li#menu-basic a").on("click", function (e) {
                let openWindow = function () {
                    let macList = []
                    let usingMac = locationState.mac
                    let usingIP = locationState.ip
                    let usingStatus = locationState.status

                    if (mode !== "batch") {
                        message.destroy()
                        // top.dialog.dialogInnerhtml({
                        //     dialogTitle: formatMessage({id: "LANG222"}, {0: formatMessage({id: "LANG1287"}), 1: usingMac}),
                        //     displayPos: "editForm",
                        //     frameSrc: "html/zc_devices_modal_basic.html?mode=edit&mac={0}&ip={1}&status={2}".format(usingMac, usingIP, usingStatus)
                        // })
                    } else {
                        macList = $("div#batch-list").modelDevices("deviceList")
                        message.destroy()
                        // top.dialog.dialogInnerhtml({
                        //     dialogTitle: formatMessage({id: "LANG3866"}),
                        //     displayPos: "editForm",
                        //     frameSrc: "html/zc_devices_modal_basic.html?mode=batch&mac={0}&mid={1}&ip=&status=".format(macList.toString(), model.id())
                        // })
                    }
                }

                if (!self.state.modified) {
                    openWindow()
                } else {
                    confirm({
                        content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG3482"}) }}></span>,
                        okText: 'OK',
                        cancelText: 'Cancel',
                        onOk: () => {
                            // TODO: add save
                            self._pageSubmit(function () {
                                // open customize window after save
                                openWindow()
                            })
                        },
                        onCancel: () => {
                            // no save and switch
                            openWindow()
                        }
                    })
                }
            })

            $("div#btnEditGlobalPolicy").on("click", function (e) {
                let openWindow = function () {
                    message.destroy()
                    top.frames['frameContainer'].module.jumpMenu('zc_globalpolicy.html')
                }

                if (!self.state.modified) {
                    openWindow()
                } else {
                    confirm({
                        content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG3482"}) }}></span>,
                        okText: 'OK',
                        cancelText: 'Cancel',
                        onOk: () => {
                            // TODO: add save
                            self._pageSubmit(function () {
                                // open customize window after save
                                openWindow()
                            })
                        },
                        onCancel: () => {
                            // no save and switch
                            openWindow()
                        }
                    })
                }
            })
            let locationState = this.props.devicesItemAdvanced,
                mode = locationState.mode

            $("div#btnEditCustomizeSettings").on("click", function (e) {
                let openCustomizeWindow = function () {
                    let macList = []
                    let usingMac = locationState.mac
                    let usingIP = locationState.ip
                    let usingStatus = locationState.status

                    if (mode !== "batch") {
                        message.destroy()
                        // top.dialog.dialogInnerhtml({
                        //     dialogTitle: $P.lang("LANG222").format($P.lang("LANG3476"), locationState.mac),
                        //     displayPos: "editForm",
                        //     frameSrc: "html/zc_devices_modal_custom.html?mode=edit&mac={0}&ip={1}&gtemp={2}&mtemp={3}&status={4}".format(usingMac, usingIP, curGlobalTemplates.toString(), curModelTemplates.toString(), usingStatus)
                        // })
                    } else {
                        macList = $("div#batch-list").modelDevices("deviceList")
                        message.destroy()
                        // top.dialog.dialogInnerhtml({
                        //     dialogTitle: $P.lang("LANG3866"),
                        //     displayPos: "editForm",
                        //     frameSrc: "html/zc_devices_modal_custom.html?mode=batch&mac={0}&gtemp={1}&mtemp={2}&mid={3}&ip=&status=".format(macList.toString(), curGlobalTemplates.toString(), curModelTemplates.toString(), model.id())
                        // })
                    }
                }

                if (!self.state.modified) {
                    openCustomizeWindow()
                } else {
                    confirm({
                        content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG3482"}) }}></span>,
                        okText: 'OK',
                        cancelText: 'Cancel',
                        onOk: () => {
                            // TODO: add save
                            self._pageSubmit(function () {
                                // open customize window after save
                                openCustomizeWindow()
                            })
                        },
                        onCancel: () => {
                            // no save and switch
                            openCustomizeWindow()
                        }
                    })
                }
            })

            self._initListBox("model")
            self._initListBox("global")

            if (mode === "edit") {
                self._switchPads(true)

                self._loadPageContents()
            } else if (mode === "batch") {
                $("div#info-container").hide()
                $("div#batch-container").show()

                let inMac = locationState.mac.split(",")
                let inMid = locationState.mid.split(",")

                let options = {}
                let modelDevices = {}

                if (inMac.length === inMid.length) {
                    for (let i = 0; i < inMac.length; i++) {
                        if (!modelDevices[inMid[i]]) {
                            modelDevices[inMid[i]] = []
                        }

                        modelDevices[inMid[i]].push(inMac[i])
                    }

                    if (inMid.length === 1) {
                        self._switchPads(true)
                        self.state.currentMac = inMac[0]
                        self.state.model = window.BLL.DataCollection.getModel(inMid[0])

                        window.BLL.ConfigPage.updatePageConfig(self.state.model.id(), "model", self.state.model)
                        window.BLL.ConfigPage.modelInfo().prepareListData()
                    } else {
                        self._switchPads(false)
                    }

                    options.source = modelDevices
                    options.updateCallback = function (sender) {
                        self.state.currentMac = sender.currentMac()
                        self.state.model = sender.currentModel()

                        if (sender.totalModels() === 1 && !self.state.singleModelMode) {
                            self._switchPads(true)

                            window.BLL.ConfigPage.updatePageConfig(self.state.model.id(), "model", self.state.model)
                            window.BLL.ConfigPage.modelInfo().prepareListData()

                            // needs to reload page...
                            self._loadRequiredContents(function () {
                                self._bindMappings({})
                            })
                        }

                        if (self.state.singleModelMode) {
                            self._triggerModify(true)

                            $("div#previewPrepareMsg").show().html(formatMessage({id: "LANG3891^" + self.state.currentMac}))
                        }
                    }

                    $("div#batch-list").modelDevices(options)

                    self._loadRequiredContents(function () {
                        self._bindMappings({})
                    })
                } else {
                    message.error(formatMessage({id: "LANG839"}))
                }
            }
            // top.Custom.init(doc)
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

            setTimeout(this._checkReady, 1000)
        }
    }
    _bindPage = (data) => {
        // TODO: this kind of return data needs to improve!
        let locationState = this.props.devicesItemAdvanced,
            mode = locationState.mode
        if (data && !$.isEmptyObject(data.zc_devices)) {
            let item = data.zc_devices

            item.mac = locationState.mac

            let model = window.BLL.DataCollection.getModelByName(item.vendor, item.model)
            if (model) {
                item.modelId = model.id()

                $("#loading-pad").hide()
                $("#empty-pad").show()

                $("span#deviceMac").html(item.mac)
                $("span#deviceIp").html(item.ip)
                $("span#deviceVersion").html(item.version)
                $("span#deviceModel").html((item.vendor + " " + item.model).toUpperCase())
                // does not allow modify....? Is there any reasonable need to modify this value?
                // $("select#deviceModel").val(modelId).attr("disabled", "disabled")

                let thumbnail = $("div.thumbnail")
                thumbnail.empty()
                let img = new Image()
                img.onload = function () {
                    thumbnail[0].appendChild(img)
                }
                img.onerror = function () {
                    img = null
                    thumbnail.append($("<img/>").attr("src", "/../../images/empty.png").addClass("sm_thumbnail"))
                }
                img.className = "sm_thumbnail"
                img.src = model.resourcePath() + model.thumbnail()

                window.BLL.ConfigPage.updatePageConfig(item.modelId, "device", item)
                window.BLL.ConfigPage.modelInfo().prepareListData()
            } else {
                $("#empty-pad").hide()
            }
        } else {
            message.error(formatMessage({id: "LANG3881"}))
            self._processReloadTable()
            message.destroy()
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
                    this.state.defaultModelTemplate = item
                    $("#contentDefaultModel").text(this.state.defaultModelTemplate.name)
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
        let locationState = this.props.devicesItemAdvanced,
            mode = locationState.mode
        let self = this
        let processList = []
        let processName = []

        if (!this.state.__globalTemplateLoaded) {
            processList.push(window.ZEROCONFIG.connector.getAllTemplates("global", "enabled"))
            processName.push("GlobalTemplates")
        }

        if (this.state.singleModelMode) {
            if (!this.state.__modelTemplateLoaded) {
                processList.push(window.ZEROCONFIG.connector.getAllModelTemplates(this.state.model.id(), "enabled"))
                processName.push("ModelTemplates")
            }
        }

        if (mode !== "batch") {
            processList.push(window.ZEROCONFIG.connector.getDeviceTemplateMappings(self.state.currentMac))
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
                    // else if (processName[i] === "CustomFields") {
                    //    bindCustomFields(result.response)
                    // }
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
    _loadPageContents = () => {
        const { formatMessage } = this.props.intl
        let self = this
        let locationState = this.props.devicesItemAdvanced
        window.ZEROCONFIG.connector.getZeroConfig(locationState.mac, locationState.ip).done(function (result) {
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
        let locationState = this.props.devicesItemAdvanced,
            mode = locationState.mode

        let self = this
        if (self.state.modified) {
            message.loading(formatMessage({id: "LANG978"}), 0)
        }

        let macList = []
        let keepModelTemps = false
        if (mode !== "batch") {
            macList.push(self.state.currentMac)
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
                            let DO_RELOAD = function () { // DO_RELOAD()
                                if ((status === 6 || status === 7) && mode === "edit") {
                                    let after = function (res) {
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
                                            $.ajax({
                                                type: "GET",
                                                url: baseServerURl + "action=DownloadCfg&mac=" + locationState.mac,
                                                error: function (jqXHR, textStatus, errorThrown) { },
                                                success: after
                                            })
                                        },
                                        onCancel: () => {
                                            message.destroy()
                                        }
                                    })
                                    confirm({
                                        content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG2692"}) }}></span>,
                                        okText: 'OK',
                                        cancelText: 'Cancel',
                                        onOk: () => {
                                            // message.loading(formatMessage({id: "LANG829"}))
                                            $.ajax({
                                                type: "GET",
                                                url: baseServerURl + "action=DownloadCfg&mac=" + locationState.mac,
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

                            message.success(formatMessage({id: "LANG873"}))
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
                }
            }
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
            if (!this.state.source) {
                let using = this.state.model.generateFieldList(ret)
                this.state.devmappings = using.devmapping
                this.state.source = using.source
            } else {
                // let's clean up the original values
                let source = this.state.source
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
            let customContainer = null
            let customFields = this.state.customFields

            for (let name in customFields) {
                if (customFields.hasOwnProperty(name)) {
                    let value = customFields[name]
                    let found = self.state.devmappings[name]

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
                    source: self.state.source,
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
                    $("input,select", document).keypress(function (event) { return event.keyCode !== 13 })
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

        let mTemplates = []
        let gTemplates = []

        $("option", selectedGlobalTemplateList).each(function (index, item) {
            gTemplates.push(item.value)
        })

        $("option", selectedModelTemplateList).each(function (index, item) {
            mTemplates.push(item.value)
        })

        let processLoadPreview = function () {
            window.ZEROCONFIG.connector.getZeroConfigPreview(self.state.currentMac, self.state.model.id(), gTemplates, mTemplates)
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
            window.ZEROCONFIG.connector.getZeroConfigCustomSettings(self.state.currentMac, self.state.model.id(), mTemplates)
                .done(function (result) {
                    if (result.status === 0) {
                        this._bindCustomFields(result.response)

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
        let optionTimer = this.state.optionTimer

        if (skipTrigger !== true) {
            this.state.modified = true
        }

        if (!optionTimer) {
        } else {
            clearTimeout(optionTimer)
        }
        let self = this
        this.state.optionTimer = setTimeout(function () {
            if (self.state.singleModelMode) {
                self._loadPreview(type)
            }

            self.state.optionTimer = null
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
    }
    _handleCancel = () => {
        this.setState({
            autoDiscoverVisible: false,
            modalType: null
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <div id="content-container" className="dev-advanced">
                        <div id="template-pad">
                            <div className="section-head">
                                <span className="num">5</span>
                                <span className="label">{ formatMessage({id: "LANG3476"}) }</span>
                            </div>
                            <div className="section-content">
                                <div className="single-model-pad">
                                    <div id="btnEditCustomizeSettings" className="controlButton">
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
                                <div id="btnEditGlobalPolicy" className="controlButton">
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
        )
    }
}

export default Form.create()(injectIntl(DeviceAdvanced))

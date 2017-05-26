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

class DeviceItemCustomSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loadedModelID: "",
            models: [],
            source: {},
            loadedConfigure: null,
            currentMac: this.props.location.state.mac,
            devicesItemBasic: {},
            devicesItemAdvanced: {},
            fieldIndex: 0,
            devmappings: [],
            model: {}
        }
    }
    componentDidMount() {
        const { formatMessage } = this.props.intl

        let locationState = this.props.location.state,
            mode = locationState.mode,
            mac = locationState.mac,
            mid = locationState.mid,
            self = this

            if (mode === "add") {
                // TODO: add error handling
                console.error("ERROR: unsupported mode")
                return
            }

            if (mode !== "batch") {
                window.BLL.ConfigPage.updatePageDOM("device-custom", window, document)
            } else {
                window.BLL.ConfigPage.updatePageDOM("device-custom-batch", window, document)
            }

            (function checkReady() {
                if (window.ZEROCONFIG.isDataReady() === 1) {
                    // needs to prepare global list
                    window.BLL.DataCollection.prepareGlobalList()
                    window.ZEROCONFIG.ValueMonitor.init()

                    // $("#btnAddNewField").on("click", function (e) {
                    //     this._addField("", "")
                    // })

                    if (mode === "batch") {
                        $("div#info-container").hide()
                        $("div#batch-container").show()

                        let inMac = mac.split(",")

                        let options = {}
                        let modelDevices = {}

                        if (mid && inMac.length > 0) {
                            window.BLL.ConfigPage.updatePageConfig(mid, "model", window.BLL.DataCollection.getModel(mid), true)

                            if (window.BLL.ConfigPage.modelInfo()) {
                                window.BLL.ConfigPage.modelInfo().prepareListData()
                            } else {
                                // ERROR
                            }

                            // process list
                            modelDevices[mid] = []

                            for (let i = 0; i < inMac.length; i++) {
                                modelDevices[mid].push(inMac[i])
                            }

                            options.source = modelDevices
                            options.updateCallback = (sender) => {
                                this.setState({
                                    currentMac: sender.firstAvailableDevice()
                                })
                            }

                            $("div#batch-list").modelDevices(options)

                            self._bindSettings({})
                        } else {
                            message.error(formatMessage({id: "LANG839"}))
                        }
                    } else {
                        self._loadPageContents()
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
    }
    componentWillUnmount() {
    }
    _checkMacIsExsit() {
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
        // TODO: this kind of return data needs to improve!
        const { formatMessage } = this.props.intl

        let locationState = this.props.location.state,
            mac = locationState.mac

        // TODO: this kind of return data needs to improve!
        if (data && !_.isEmpty(data.zc_devices)) {
            let item = data.zc_devices

            item.mac = mac

            let model = window.BLL.DataCollection.getModelByName(item.vendor, item.model)
            this.setState({
                model: model
            })
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
                let modelInfo = model
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
                                    let $sender = $(sender),
                                        ref = $sender.attr("ref")
                                    if (ref) {
                                        let found = $("[path='" + ref + "']")
                                        if (found.length > 0) {
                                            window.location.hash = "" // clear existing hash
                                            window.location.hash = "#" + found.attr("id")
                                            $.magnificPopup.close()
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
                img.src = model.resourcePath() + model.thumbnail()

                window.BLL.ConfigPage.updatePageConfig(item.modelId, "device", item)
                window.BLL.ConfigPage.modelInfo().prepareListData()
            } else {
                $("#empty-pad").hide()
            }
        } else {
            message.error(formatMessage({id: "LANG3881"}))
            browserHistory.push('/value-added-features/zeroConfig/devices')
            this._processReloadTable()
            message.destroy()
        }
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
    _pageLoadCallback = (result) => {
        let timers = new window.SimpleTimer()
        let naviBox = $("div#navBar-inner div.combo").navibox({
            mode: "all",
            source: this.state.source,
            deferred: timers,
            container: "div#itemContainer"
        })

        timers.start(function () {
            $("div#preparePad").hide()
            $("div#contentPad").show()
            // we need to prevent the use of ENTER as submit on input and select fields
            $("input,select", document).keypress(function (event) {
                return event.keyCode !== 13
            })

            window.ZEROCONFIG.ValueMonitor.sync()
        })

        $(window).scroll(function () {
            $('#navBar-inner').toggleClass('scrolling', $(window).scrollTop() > $('#navBar').offset().top)

            // can be rewritten long form as:
            let scrollPosition, headerOffset, isScrolling
            scrollPosition = $(window).scrollTop()
            headerOffset = $('#navBar').offset().top
            isScrolling = scrollPosition > headerOffset
            $('#navBar-inner').toggleClass('scrolling', isScrolling)
            if (isScrolling) {
                $("#navTop").show()
            } else {
                $("#navTop").hide()
            }
        })
    }
    _bindCustomFields = (data) => {
        if (data && data.mac) {
            let currentData = data.mac

            for (let i = 0; i < currentData.length; i++) {
                let item = currentData[i]
                this._addField(item.devname, item.value)
            }
        } else {
            console.warn("Unable to retrieve the custom fields for this page.")
        }
    }
    _bindSettings = (data) => {
        let ret = {}

        let model = window.BLL.ConfigPage.modelInfo()
        this.setState({
            model: model
        })
        // TODO: this kind of return data needs to improve!
        if (data && data.body && data.body.view) {
            let currentData = data.body.view

            // NOTE: it is weird the return data is stored under object.template_id
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
        } else {
            console.warn("Unable to retrieve the data for this page.")
        }
        if (model) {
            let using = model.generateFieldList(ret)
            this.setState({
                devmappings: using.devmapping,
                source: using.source
            })
            window.ZEROCONFIG.valueDelegation.executeRequests(this._pageLoadCallback)
        } else {
            // TODO: add error handling
            console.error("INVALID Model")
        }
    }
    _loadPageContents = () => {
        const { formatMessage } = this.props.intl
        let locationState = this.props.location.state,
            mac = locationState.mac,
            ip = locationState.ip,
            gtemp = locationState.gtemp,
            mtemp = locationState.mtemp,
            self = this
        let processList = []
        let processName = []

        window.ZEROCONFIG.connector.getZeroConfig(mac, ip).done(function (result) {
            self._bindPage(result.response)

            processList.push(window.ZEROCONFIG.connector.getZeroConfigPreview(mac, self.state.model.id(), gtemp, mtemp))
            processName.push("Settings")

            processList.push(window.ZEROCONFIG.connector.getDeviceCustomSettings(mac))
            processName.push("CustomFields")

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
                        } else if (processName[i] === "CustomFields") {
                            self._bindCustomFields(result.response)
                        } else if (processName[i] === "Settings") {
                            self._bindSettings(result.response)
                        }
                    }
                }
            }).fail(function () {
                console.log("FAIL", arguments)
                message.error(formatMessage({id: "LANG862"}))
            })
        }).fail(function () {
            console.error("FAIL", arguments)
        })
    }
    _pageSubmit = () => {
        const { formatMessage } = this.props.intl

        let locationState = this.props.location.state,
            mode = locationState.mode,
            mac = locationState.mac,
            self = this

        let usingMac = []

        if (mode === "batch") {
            usingMac = $("div#batch-list").modelDevices("deviceList")
        } else {
            usingMac.push(mac)
        }

        // prepare fields
        window.BLL.PrepareSubmitConfigurations(usingMac, this.state.source, function (result) {
            if (result.error.length > 0) {
                // TODO: come back to display error
                // display error here
                // for (let i = 0; i < result.error.length; i++) {
                //    console.log(result.error[i]);
                // }
            } else {
                message.loading(formatMessage({id: "LANG978"}), 0)

                let processList = []
                let processName = []

                processName.push("delCustom")
                processList.push(window.ZEROCONFIG.connector.deleteAllDeviceCustomSettings(usingMac))

                processName.push("delFields")
                processList.push(window.ZEROCONFIG.connector.deleteAllDeviceSettings(usingMac))

                $.when.apply({}, processList).always(function () {
                    processList.length = processName.length = 0
                    // load custom fields
                    let mainContainer = $("div#fieldContainer")
                    let customFields = {
                    }
                    $("div.row.field", mainContainer).each(function (index, item) {
                        let $item = $(item)
                        let nameField = $("input.name-field", $item).val()
                        let valueField = $("input.value-field", $item).val()

                        if (nameField) {
                            customFields[nameField] = valueField
                        }
                    })

                    let outputCustomFields = {
                        "mac": [],
                        "name": [],
                        "value": []
                    }

                    for (let name in customFields) {
                        if (customFields.hasOwnProperty(name)) {
                            let usingVal = UCMGUI.urlFunction.escape(customFields[name])
                            for (let i = 0; i < usingMac.length; i++) {
                                outputCustomFields.mac.push(usingMac[i])
                                outputCustomFields.name.push(name)
                                outputCustomFields.value.push(usingVal)
                            }
                        }
                    }

                    if (outputCustomFields.name.length > 0) {
                        processName.push("insertCustom")
                        processList.push(window.ZEROCONFIG.connector.insertDeviceCustomSettings(outputCustomFields.mac,
                                                                                         outputCustomFields.name,
                                                                                         outputCustomFields.value))
                    }

                    if (result.update.refId.length > 0) {
                        processName.push("updateFields")
                        processList.push(window.ZEROCONFIG.connector.insertDeviceSettings(result.update.refId,
                                                                                   result.update.elementId,  // this is actually field ids
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
                                console.error("Process error:" + processName[i])
                                message.destroy()
                                // let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)
                                return
                            }
                        }

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
                        browserHistory.push('/value-added-features/zeroConfig/devices')
                        self._processReloadTable()
                        message.destroy()
                        message.success(formatMessage({id: "LANG873"}))
                    }).fail(function () {
                        console.log("FAIL", arguments)
                        message.destroy()
                        message.error(formatMessage({id: "LANG862"}))
                    })
                })
            }
        })
    }
    _addField = (name, value) => {
        const { formatMessage } = this.props.intl
        let self = this
        let id = "custom-field-" + (++this.state.fieldIndex)
        let mainContainer = $("<div/>").attr("id", id).addClass("row field")

        let controlContainer = $("<div />")
                                .addClass("cell")
                                .appendTo(mainContainer)
        let nameContainer = $("<div />")
                                .addClass("cell")
                                .appendTo(mainContainer)
        let valueContainer = $("<div />")
                                .addClass("cell")
                                .appendTo(mainContainer)
        let descContainer = $("<div />")
                            .addClass("cell")
                            .appendTo(mainContainer)
        let tooltip = $("<ucm-tooltip/>")
                        .addClass("warning not-remove")
                        .appendTo(descContainer)
                        .hide()

        $("<a/>")
            .addClass("remove")
            .attr("tabIndex", -1)
            .appendTo(controlContainer)
            .on("click", function (e) {
                mainContainer.remove()
            })

        let usingItem = null
        let possibleLink = $("<a/>")
            .addClass("link")
            .attr("tabIndex", -1)
            .attr("locale", "LANG3510")
            .text(formatMessage({id: "LANG3510"}))
            .appendTo(tooltip)
            .on("click", function (e) {
                if (usingItem) {
                    let expendParent = function (item) {
                        if (item._parent) {
                            expendParent(item._parent)
                        } else if (item._widget && item._widget.expand) {
                            item._widget.expand()
                        }
                    }

                    expendParent(usingItem)

                    setTimeout(function () {
                        let widget = $('#' + usingItem._uuid)
                        let pos = widget.offset().top - 36
                        if (pos < 0) {
                            pos = 0
                        }
                        if (pos > $(document).height() - $(window).height()) {
                            pos = $(document).height() - $(window).height()
                        }

                        $(document.body).scrollTop(pos)
                        widget.effect("highlight", {}, 500)
                    }, 0)
                }
            })

        let verifyName = function (name) {
            let found
            if ((found = self.state.devmappings[name]) && found.length > 0) {
                tooltip.show()
                usingItem = found[0]
                possibleLink.attr("href", "#" + found[0]._uuid)

                let labelValue = usingItem.label.toString()
                if (labelValue.length > 1 && labelValue.lastIndexOf("@", 0) === 0) {
                    labelValue = formatMessage({id: labelValue.substring(1)})
                }

                possibleLink.attr("title", labelValue)
            } else {
                tooltip.hide()
            }
        }

        $("<input/>")
            .attr("id", id + "-name")
            .addClass("name-field")
            .val(name ? name : "")
            .appendTo(nameContainer)
            .on("change", function (e) {
                let $this = $(this)
                let curValue = $this.val()

                verifyName(curValue)
            })

        $("<input/>")
            .attr("id", id + "-value")
            .addClass("value-field")
            .val(value ? value : "")
            .appendTo(valueContainer)

        $("div#fieldContainer").append(mainContainer)

        verifyName(name)
    }
    // _bindBasicOptions = (data, callback) => {
    //     let self = this
    //     let model = null
    //     let locationState = this.props.location.state,
    //         mode = locationState.mode
    //     let modelSelect = $("select#deviceModel")
    //     let id = modelSelect.val()
    //     let container = $("div#content-pad")
    //     container.empty()
    //     let models = this.state.models
    //     for (let i = 0; i < models.length; i++) {
    //         if (models[i].id === Number(id)) {
    //             model = models[i]
    //             break
    //         }
    //     }
    //
    //     if (model) {
    //         window.BLL.ConfigPage.updatePageConfig(id, "model", model, true)
    //         window.BLL.ConfigPage.modelInfo().prepareListData()
    //
    //         this.state.source = window.BLL.DataCollection.generateTypeBlockList(model.modelType, data)
    //         let cb = function (result) {
    //             let timers = new window.SimpleTimer()
    //             let source = self.state.source
    //
    //             for (let i = 0; i < source.length; i++) {
    //                 timers.add((function (idx) {
    //                     return function () {
    //                         let subGroup = $("<div/>").fieldSubGroup({
    //                             "item": function () {
    //                                 return source[idx]
    //                             },
    //                             "deferred": timers,
    //                             "mode": "all"
    //                         })
    //
    //                         subGroup.appendTo(container)
    //                     }
    //                 })(i))
    //             }
    //
    //             timers.start(function () {
    //                 if (mode === "edit" && self.state.loadedModelID > -1) {
    //                     $("ul#menu li#menu-advanced").show()
    //                 }
    //
    //                 $("#loading-pad").hide()
    //                 if (source) {
    //                     container.show()
    //                 }
    //
    //                 if (typeof callback === "function") {
    //                     callback.call(self)
    //                 }
    //
    //                 // we need to prevent the use of ENTER as submit on input and select fields
    //                 $("input,select", document).keypress(function (event) {
    //                     return event.keyCode !== 13
    //                 })
    //
    //                 window.ZEROCONFIG.ValueMonitor.sync()
    //             })
    //         }
    //         window.ZEROCONFIG.valueDelegation.executeRequests(cb)
    //         // setTimeout(cb, 10000)
    //         let modelInfo = window.BLL.ConfigPage.modelInfo()
    //         let thumbnail = $("div.thumbnail")
    //         thumbnail.empty()
    //         let img = new Image()generateTypeBlockList
    //         img.onload = function () {
    //             thumbnail[0].appendChild(img)
    //
    //             let imageItems = []
    //             let imageList = modelInfo.imageMappings()
    //             for (let name in imageList) {
    //                 if (imageList.hasOwnProperty(name)) {
    //                     let newMapItem = {}
    //                     let imgMap = imageList[name]
    //                     let regions = imgMap.getRegions()
    //
    //                     newMapItem.src = modelInfo.resourcePath() + imgMap.getPath()
    //                     newMapItem.verticalFit = false
    //                     newMapItem.map = []
    //                     for (let rname in regions) {
    //                         if (regions.hasOwnProperty(rname)) {
    //                             let region = regions[rname]
    //                             let link = region.getLink(window.BLL.ConfigPage.mode())
    //                             if (link) {
    //                                 newMapItem.map.push({ "coords": region.toCoords(), "ref": link.getFullPath() })
    //                             }
    //                         }
    //                     }
    //
    //                     imageItems.push(newMapItem)
    //                 }
    //             }
    //
    //             if (imageItems.length > 0) {
    //                 let zoom = $("<div/>")
    //                             .addClass("zoon-glass")
    //                             .appendTo(thumbnail)
    //
    //                 zoom.magnificPopup({
    //                     closeBtnInside: false,
    //                     items: imageItems,
    //                     gallery: {
    //                         enabled: true,
    //                         navigateByImgClick: false
    //                     },
    //                     verticalFit: false,
    //                     type: "mapimage",
    //                     callbacks: {
    //                         mapclick: function (sender) {
    //                             let $sender = $(sender)
    //                             let ref = $sender.attr("ref")
    //                             if (ref) {
    //                                 let found = $("[path='" + ref + "']")
    //                                 if (found.length > 0) {
    //                                     $.magnificPopup.close()
    //                                     // $('html, body').scrollTop(found.offset().top)
    //                                     window.location.hash = "" // clear existing hash
    //                                     window.location.hash = "#" + found.attr("id")
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 })
    //             }
    //         }
    //         img.onerror = function () {
    //             img = null
    //             thumbnail.append($("<img/>").attr("src", "/../images/empty.png").addClass("sm_thumbnail"))
    //         }
    //         img.className = "sm_thumbnail"
    //         img.src = modelInfo.resourcePath() + modelInfo.thumbnail()
    //     } else {
    //         $("ul#menu li#menu-advanced").hide()
    //         $("#loading-pad").hide()
    //         $("#empty-pad").show()
    //         if (typeof callback === "function") {
    //             callback.call(this)
    //         }
    //     }
    // }
    // _bindModels = () => {
    //     this.state.models = window.BLL.DataCollection.generateBasicModelList()
    //     let self = this
    //     let modelSelect = $("select#deviceModel")
    //
    //     let basicOptionBoundCallback = function () {
    //         modelSelect.removeAttr("disabled")
    //     }
    //
    //     modelSelect.on("change", function (e) {
    //         let optionTimer = self.state.optionTimer
    //         if (!optionTimer) {
    //             $("#empty-pad").hide()
    //             $("#content-pad").hide()
    //             $("#loading-pad").show()
    //         } else {
    //             clearTimeout(optionTimer)
    //         }
    //
    //         optionTimer = setTimeout(function () {
    //             modelSelect.attr("disabled", "disabled")
    //             self._bindBasicOptions(self.state.loadedConfigure, basicOptionBoundCallback)
    //             optionTimer = null
    //         }, 1000)
    //     })
    //
    //     // insert empty model
    //     modelSelect.append($("<option/>").val("").text(""))
    //
    //     // bind models to the list
    //     $.each(this.state.models, function (idx, item) {
    //         modelSelect.append($("<option/>").val(item.id).html((item.vendor + " " + item.name).toUpperCase()))
    //     })
    // }
    _handleSubmit = () => {
        this._pageSubmit()
    }
    _handleCancel = () => {
        browserHistory.push('/value-added-features/zeroConfig/devices/')
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        }
        let locationState = this.props.location.state,
            mode = locationState.mode,
            mac = locationState.mac,
            ip = locationState.ip

        let headerTitle = formatMessage({id: "LANG222"}, {0: formatMessage({id: "LANG3476"}), 1: mac})

        if (mode === "edit") {
            headerTitle = formatMessage({id: "LANG222"}, {0: formatMessage({id: "LANG1287"}), 1: mac.toUpperCase()})
        } else {
            headerTitle = formatMessage({id: "LANG3866"})
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
                                <Col span={3}>
                                    <div className="cell thumbnail">
                                        <img id="thumbnail" src="/../../images/empty.png" className="sm_thumbnail" />
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG3461" />}>
                                                <span>{ formatMessage({id: "LANG3461"}) }</span>
                                            </Tooltip>
                                        )}>
                                        <span id="deviceModel"></span>
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1294" />}>
                                                <span>{ formatMessage({id: "LANG1293"}) }</span>
                                            </Tooltip>
                                        )}>
                                        <span id="deviceMac"></span>
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1292" />}>
                                                <span>{ formatMessage({id: "LANG1291"}) }</span>
                                            </Tooltip>
                                        )}>
                                        <span id="deviceIp"></span>
                                    </FormItem>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1297" />}>
                                                <span>{ formatMessage({id: "LANG1298"}) }</span>
                                            </Tooltip>
                                        )}>
                                        <span id="deviceVersion"></span>
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>
                        <div id="batch-container" style={{ display: "none" }}>
                            <div className="section-message">{ formatMessage({id: "LANG3889"}) }</div>
                            <div id="batch-list"></div>
                        </div>
                        <div id="optionPad" style={{ marginTop: "10px", minHeight: "300px" }}>
                            <div id="navBar">
                                <div id="navBar-inner">
                                    <div className="cell label">{ formatMessage({id: "LANG74"})}</div>
                                    <div className="cell combo"></div>
                                    <div className="cell sideControl">
                                        <a id="navTop" href="#" title="Back to top" style={{ display: "none" }}><img src="/../images/arrow_back_top.png" /></a>
                                    </div>
                                </div>
                                <div style={{ clear: "both" }}></div>
                            </div>
                            <div id="customContainer">
                                <div className="section-head">
                                    <span className="label">{ formatMessage({id: "LANG3483"}) }</span>
                                </div>
                                <div id="fieldContainer">
                                    <div className="row head">
                                        <div className="cell control">&nbsp;</div>
                                        <div className="cell name">
                                            <span>{ formatMessage({id: "LANG135"}) }</span>
                                        </div>
                                        <div className="cell value">
                                            <span>{ formatMessage({id: "LANG3485"}) }</span>
                                        </div>
                                        <div className="cell desc" style={{ width: "auto" }}>&nbsp;</div>
                                    </div>
                                </div>
                                <div className="section-content" style={{ marginTop: "8px" }}>
                                    <div id="btnAddNewField" className="controlButton" style={{ marginLeft: "40px" }} onClick={ this._addField.bind(this, "", "") }>
                                        <span className="icon add">&nbsp;</span>
                                        <span className="label">{ formatMessage({id: "LANG3484"}) }</span>
                                    </div>
                                </div>
                            </div>
                            <div id="itemContainer" style={{ backgroundColor: "#efefef" }}></div>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(DeviceItemCustomSettings))

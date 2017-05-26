'use strict'

import { browserHistory } from 'react-router'
import $ from 'jquery'
import _ from 'underscore'
import cookie from 'react-cookie'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, formatMessage } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs, Modal, Table, Popconfirm } from 'antd'
import api from "../../api/api"
import Validator from "../../api/validator"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const baseServerURl = api.apiHost

class DevicesItemBasic extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loadedModelID: "",
            models: [],
            source: {},
            loadedConfigure: null,
            currentMac: this.props.mac
        }
    }
    componentDidMount() {
        const { formatMessage } = this.props.intl

        let locationState = this.props.devicesItemBasic,
            mode = locationState.mode,
            mac = locationState.mac,
            mid = locationState.mid,
            self = this

        if (mode === "add") {
            // $("button#save").attr("locale", "LANG754")
        }

        if (mode !== "batch") {
            window.BLL.ConfigPage.updatePageDOM("device-basic", window, document)
        } else {
            window.BLL.ConfigPage.updatePageDOM("device-basic-batch", window, document)
        }
        (function checkReady() {
            if (window.ZEROCONFIG.isDataReady() === 1) {
                window.BLL.DataCollection.prepareGlobalList()
                window.ZEROCONFIG.ValueMonitor.init()

                self._bindModels()
                $("div#selectdeviceModel.divSelect span.modelSpanDes").css("width", "")
                if (mode === "add") {
                    $("div#preparePad").hide()
                    $("div#contentPad").show()
                } else if (mode === 'edit') {
                    self._loadPageContents()
                } else if (mode === "batch") {
                    $("div#info-container").hide()
                    $("div#batch-container").show()

                    let inMac = mac.split(",")

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

                        this._bindBasicOptions({}, function () {
                            $("div#preparePad").hide()
                            $("div#contentPad").show()
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
    }
    componentWillUnmount() {
    }
    _checkMacIsExsit() {
        let locationState = this.props.devicesItemBasic,
            mode = locationState.mode

        if (mode && mode === 'add') {
            let newMac = $("input#deviceMac").val().toLowerCase()
            // let macListArr = mWindow.macListArr
            // return !UCMGUI.inArray(newMac, macListArr)
        }
        return true
    }
    _bindPage = (data) => {
        let locationState = this.props.devicesItemBasic,
            mac = locationState.mac
        // TODO: this kind of return data needs to improve!
        if (data && !_.isEmpty(data.zc_devices)) {
            let item = data.zc_devices
            item.mac = mac

            let modelId = -1,
                models = this.state.models

            for (let i = 0; i < models.length; i++) {
                if (models[i].vendor.toLowerCase() === item.vendor.toLowerCase() &&
                    models[i].name.toLowerCase() === item.model.toLowerCase()) {
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
        let locationState = this.props.devicesItemBasic,
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
    }
    _pageSubmit = (callback) => {
        const { formatMessage } = this.props.intl

        let locationState = this.props.devicesItemBasic,
            mode = locationState.mode,
            mac = locationState.mac,
            self = this

        let doSave = function () {
            let action = {}

            action["action"] = (mode === 'edit' ? "updateZeroConfig" : "addZeroConfig")
            action["mac"] = $("input#deviceMac").val().toUpperCase()

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
                if (models[i].id === modelId) {
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
                    browserHistory.push('/value-added-features/zeroConfig/devices')
                }
            })
        }
        let upgrade = function () {
            let locationState = this.props.devicesItemBasic,
                mac = locationState.mac

            let after = function(res) {
                message.destroy()

                if (res && res.status === '0') {
                    message.success(formatMessage({id: "LANG829"}))
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

        window.BLL.PrepareSubmitConfigurations(usingMac, this.state.source, function (result) {
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

                    message.loading(formatMessage({id: "LANG978"}), 0)
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
                                let bool = UCMGUI.errorHandler(result, function() {
                                })
                                return
                            }
                        }

                        // message.destroy()
                        message.success(formatMessage({id: "LANG873"}))

                        let DO_RELOAD = function () { // DO_RELOAD()
                            self._processReloadTable()

                            if (status && (status === 6 || status === 7) && mode === 'edit') {
                                upgrade()
                            } else {
                                message.destroy()
                            }

                            // mWindow.$("#zc_devices_list", mWindow.document).trigger('reloadGrid')

                            // Load required variables
                            // reloadVariables() // FIXME [AH] is this really needed?
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
    }
    _bindBasicOptions = (data, callback) => {
        let self = this
        let model = null
        let locationState = this.props.devicesItemBasic,
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

            this.state.source = window.BLL.DataCollection.generateTypeBlockList(model.modelType, data)
            let cb = function (result) {
                let timers = new window.SimpleTimer()
                let source = self.state.source

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
            }
            window.ZEROCONFIG.valueDelegation.executeRequests(cb)
            // setTimeout(cb, 10000)
            let modelInfo = window.BLL.ConfigPage.modelInfo()
            // let thumbnail = $("div.thumbnail")
            // thumbnail.empty()
            // let img = new Image()
            // img.onload = function () {
            //     thumbnail[0].appendChild(img)
            //
            //     let imageItems = []
            //     let imageList = modelInfo.imageMappings()
            //     for (let name in imageList) {
            //         if (imageList.hasOwnProperty(name)) {
            //             let newMapItem = {}
            //             let imgMap = imageList[name]
            //             let regions = imgMap.getRegions()
            //
            //             newMapItem.src = modelInfo.resourcePath() + imgMap.getPath()
            //             newMapItem.verticalFit = false
            //             newMapItem.map = []
            //             for (let rname in regions) {
            //                 if (regions.hasOwnProperty(rname)) {
            //                     let region = regions[rname]
            //                     let link = region.getLink(window.BLL.ConfigPage.mode())
            //                     if (link) {
            //                         newMapItem.map.push({ "coords": region.toCoords(), "ref": link.getFullPath() })
            //                     }
            //                 }
            //             }
            //
            //             imageItems.push(newMapItem)
            //         }
            //     }
            //
            //     if (imageItems.length > 0) {
            //         let zoom = $("<div/>")
            //                     .addClass("zoon-glass")
            //                     .appendTo(thumbnail)
            //
            //         zoom.magnificPopup({
            //             closeBtnInside: false,
            //             items: imageItems,
            //             gallery: {
            //                 enabled: true,
            //                 navigateByImgClick: false
            //             },
            //             verticalFit: false,
            //             type: "mapimage",
            //             callbacks: {
            //                 mapclick: function (sender) {
            //                     let $sender = $(sender)
            //                     let ref = $sender.attr("ref")
            //                     if (ref) {
            //                         let found = $("[path='" + ref + "']")
            //                         if (found.length > 0) {
            //                             $.magnificPopup.close()
            //                             // $('html, body').scrollTop(found.offset().top)
            //                             window.location.hash = "" // clear existing hash
            //                             window.location.hash = "#" + found.attr("id")
            //                         }
            //                     }
            //                 }
            //             }
            //         })
            //     }
            // }
            // img.onerror = function () {
            //     img = null
            //     thumbnail.append($("<img/>").attr("src", "/../images/empty.png").addClass("sm_thumbnail"))
            // }
            // img.className = "sm_thumbnail"
            // img.src = modelInfo.resourcePath() + modelInfo.thumbnail()
        } else {
            $("ul#menu li#menu-advanced").hide()
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
    _handleCancel = () => {}
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        }
        let locationState = this.props.devicesItemBasic,
            mode = locationState.mode,
            mac = locationState.mac,
            ip = locationState.ip
        let headerTitle = formatMessage({id: "LANG754"})

        if (mode === "edit") {
            headerTitle = formatMessage({id: "LANG222"}, {0: formatMessage({id: "LANG1287"}), 1: mac.toUpperCase()})
        }
        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
            {/* <Form> */}
                        <div id="preparePad" style={{ width: "96%", display: "table" }}>
                            <div style={{ display: "table-cell", verticalAlign: "middle" }}>
                                <div style={{display: "none"}}>
                                    <span id="loadingMsg" style={{ textAlign: "center" }}>{ formatMessage({id: "LANG805"}) }</span>
                                    <img src="/../../images/ani_loading.gif" />
                                </div>
                            </div>

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
                    {/* </Form> */}
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(DevicesItemBasic))

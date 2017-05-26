'use strict'

import $ from 'jquery'
import _ from 'underscore'
import cookie from 'react-cookie'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Validator from "../../api/validator"

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Select, Tabs, Modal, Tooltip, Table, Popconfirm } from 'antd'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/'

const baseServerURl = api.apiHost
const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

const zeroconfigErr = {
    "1": "LANG918",
    "2": "LANG919",
    "3": "LANG920",
    "4": "LANG2538",
    "5": "LANG4389"
}

let broadcastDiscover = false

window.checkSingleIpInterval = null

class Devices extends Component {
    constructor(props) {
        super(props)

        this.state = {
            sorter: {},
            loading: false,
            membersVal: "",
            deviceList: [],
            modalType: null,
            selectedRows: [],
            macExtensions: {},
            selectedRowKeys: [],
            zcScanProgress: false,
            autoDiscoverVisible: false,
            filter: this.props.filter === 'res' ? 'res' : 'all',
            zeroConfigSettings: UCMGUI.isExist.getList("getZeroConfigSettings"),
            networkInfo: {
                LANAddr: null,
                netSegFromAddr: null,
                netSegToAddr: null
            },
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true,
                pageSize: 30
            }
        }
    }
    componentDidMount() {
        // this._getAllDeviceExtensions()
        const { formatMessage } = this.props.intl
        // window.BLL.DataCollection.reset()
        if (!window.ISREFRESHPAGE) {
            window.ZEROCONFIG.init("", formatMessage, message)

            this._checkReady()
        } else {
            setTimeout(() => {
                window.ZEROCONFIG.init("", formatMessage, message)

                this._checkReady()
            }, 600)
        }
    }
    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
        if (nextProps.filter && nextProps.activeKey === 'devices' && !this.state.autoDiscoverVisible) {
            this.setState({
                    filter: nextProps.filter === 'res' || this.state.filter === 'res' ? 'res' : 'all'
                }, () => {
                    this._listZeroConfig()
                })
        }
    }
    componentWillMount() {
    }
    componentWillUnmount() {
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _checkReady = () => {
        const { formatMessage } = this.props.intl

        let _this = this

        if (window.ZEROCONFIG.isDataReady() === 1) {
            // needs to prepare global list
            window.BLL.DataCollection.prepareGlobalList()
            window.ZEROCONFIG.ValueMonitor.init()

            // Reload required letiables
            // zeroConfigSettings = UCMGUI.isExist.getList("getZeroConfigSettings")

            let filter = this.state.filter

            filter = (filter ? filter : "all")

            this.setState({
                filter: filter
            })

            // $('#filter')[0].value = filter

            window.ZEROCONFIG.connector.getAllDeviceExtensions().done(function (result) {
                if (result.status === 0) {
                    let macExtensions = {}
                    let data = result.response.getAllDeviceExtensions

                    $.each(data, function (index, item) {
                        let usingMac = item.mac.toUpperCase()

                        if (!macExtensions[usingMac]) {
                            macExtensions[usingMac] = []
                        }

                        macExtensions[usingMac].push(item.extension)
                    })

                    // _this.state.macExtensions = macExtensions
                    _this.state.macExtensions = macExtensions
                    _this._listZeroConfig()
                }
            }).always(function () {
                // if (filter === 'res') {
                //     createTable('res')
                // } else {
                //     createTable('all')
                // }

                $("div#preparePad").hide()
                $("div#contentPad").show()
            })

            let source = $("#invalidModelWarning").html()

            window.ZEROCONFIG.connector.checkZeroConfigInvalidModels(source, true)
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
    _checkSocketScan = () => {
        const { formatMessage } = this.props.intl

        this._checkInfo().done(data => {
            if (data && data.status === 0) {
                let zcFoundConfig = data.response.zc_scan_progress,
                    _this = this

                if (zcFoundConfig === '0') {
                    clearInterval(window.checkSingleIpInterval)

                    window.heckSingleIpInterval = null

                    message.destroy()

                    confirm({
                        okText: formatMessage({id: "LANG727" }),
                        cancelText: formatMessage({id: "LANG726" }),
                        content: formatMessage({ id: "LANG917" }, { 0: formatMessage({id: "LANG3"}) }),
                        onOk() {
                            browserHistory.push('/value-added-features/zeroConfig/devices/res')
                            // _this.setState({
                            //         filter: 'res'
                            //     }, () => {
                            //         _this._listZeroConfig()
                            //     })
                        },
                        onCancel() {}
                    })
                }
            }
        })
    }
    _getAllDeviceExtensions = () => {
        $.ajax({
            type: 'post',
            url: baseServerURl,
            data: {
                action: 'getAllDeviceExtensions'
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        getAllDeviceExtensions = res.getAllDeviceExtensions

                    // this.setState({
                    //     getAllDeviceExtensions: getAllDeviceExtensions
                    // })
                }
            }.bind(this)
        })
    }
    _checkZeroConfigInvalidModels = () => {
        $.ajax({
            type: 'post',
            url: baseServerURl,
            data: {
                action: 'checkZeroConfigInvalidModels'
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        models = res.models

                    // this.setState({
                    //     models: models
                    // })
                }
            }.bind(this)
        })
    }
    _listZeroConfig = (
        params = {
                item_num: 30,
                sidx: "mac",
                sord: "asc",
                page: 1
            }
        ) => {
        $.ajax({
            type: 'post',
            url: baseServerURl,
            data: {
                action: 'listZeroConfig',
                filter: this.state.filter,
                options: 'mac,ip,members,version,vendor,model,state,last_access',
                ...params
            },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        deviceList = res.zeroconfig

                    let pagination = this.state.pagination

                    // Read total count from server
                    pagination.total = res.total_item

                    this.setState({
                        deviceList: deviceList,
                        pagination
                    })
                }
            }.bind(this)
        })
    }
    _handleFilterChange = (e) => {
        this.setState({
            filter: e
        }, () => {
            this._listZeroConfig()
        })
    }
    /**
    *   Handle Auto Discover Modal
    */
    _showAutoDiscoverModal = () => {
        const _this = this
        const { formatMessage } = this.props.intl

        this._checkInfo().done(data => {
            message.destroy()

            if (data && data.status === 0) {
                const zcScanProgress = data.response.zc_scan_progress
                const zeroConfigSettings = UCMGUI.isExist.getList("getZeroConfigSettings")

                if (zcScanProgress === '1') {
                    message.loading(formatMessage({id: "LANG920"}), 0)
                } else {
                    if (zeroConfigSettings.hasOwnProperty('enable_zeroconfig') && zeroConfigSettings.enable_zeroconfig === '1') {
                        $.ajax({
                            type: 'GET',
                            async: true,
                            url: baseServerURl + 'action=getNetworkInformation',
                            error: function(e) {
                                message.error(e.statusText)
                            },
                            success: function(data) {
                                if (data.status === 0) {
                                    const LIST = ["wan", "lan", "lan1", "lan2"]

                                    for (let i = 3; i >= 0; i--) {
                                        const mode = data.response[LIST[i]]

                                        // ZeroConfig AutoDiscover only available for lan/lan1
                                        if (mode && mode.ip && mode.mask && LIST[i] !== 'wan' && LIST[i] !== 'lan2') {
                                            _this._processNetRange(mode.ip, mode.mask)

                                            break
                                        }
                                    }
                                }
                            }
                        })
                    } else {
                        message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG919" })}}></span>)
                    }
                }
            }
        })
    }
    _processNetRange = (ipStr, maskStr) => {
        const ipArray = ipStr.split(".")
        const netMaskArray = maskStr.split(".")

        let rangeFromArray = []
        let rangeToArray = []

        if (ipArray.length !== 4 || netMaskArray.length !== 4) {
            return false
        }

        for (let i = 0; i < 4; i++) {
            const ip_octet = Number(ipArray[i])
            const mask_octet = Number(netMaskArray[i])
            const re_cidr = 8 - this._calculateCIDR(mask_octet)

            rangeFromArray.push(ip_octet & mask_octet)
            rangeToArray.push((ip_octet >> re_cidr) + Math.pow(2, re_cidr) - 1)
        }

        this.setState({
                autoDiscoverVisible: true,
                modalType: 'autoDiscover',
                networkInfo: {
                    LANAddr: ipStr,
                    netSegFromAddr: rangeFromArray.join("."),
                    netSegToAddr: rangeToArray.join(".")
                }
            }, () => {
                this.props.form.setFieldsValue({
                    targetAddr: ''
                })
            })
    }
    _calculateCIDR = (mask) => {
        let count = 0,
            cidr = 0

        if (mask === 0) {
            return cidr
        }

        while (!(mask & 0x1)) {
            mask = mask >> 1
            count++
        }

        if (count < 8) {
            cidr = 8 - count
        }

        return cidr
    }
    _handleAutoDiscover = () => {
        const _this = this
        const { formatMessage } = this.props.intl
        const { setFieldValue } = this.props.form

        let scan_cgi = (action) => {
            this.setState({
                modalType: null
            })

            $.ajax({
                type: 'GET',
                async: true,
                url: baseServerURl + action,
                error: function(e) {
                    message.error(e.statusText)
                },
                success: function(data) {
                    message.destroy()

                    if (data.status === 0) {
                        const res = data.response.scanDevices

                        if (res === "Scanning Device") {
                            if (broadcastDiscover) {
                                message.success(formatMessage({id: "LANG3768"}))

                                UCMGUI.triggerCheckInfo(formatMessage)
                            } else {
                                // check whether single ip scanning has done per second.
                                window.checkSingleIpInterval = setInterval(function() {
                                    _this._checkSocketScan()
                                }, 1000)

                                message.loading(formatMessage({id: "LANG3769"}), 0)
                            }

                            this.setState({
                                autoDiscoverVisible: false
                            })
                        } else {
                            const num = res.slice("ZCERROR_".length)

                            if (zeroconfigErr.hasOwnProperty(num)) {
                                message.error(formatMessage({id: zeroconfigErr[num]}))
                            }
                        }
                    } else {
                        message.error(formatMessage({id: "LANG909"}))
                    }
                }.bind(this)
            })
        }

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                let username = cookie.load("username")
                let action = `action=scanDevices&username=${username}&method=${values.method}&ip=${values.targetAddr}&interface=1`

                if (values.targetAddr === this.state.networkInfo.netSegToAddr) {
                    let confirmContent = `<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2221" })}}></span>`

                    confirm({
                        content: formatMessage({ id: "LANG2221" }),
                        okText: formatMessage({id: "LANG727" }),
                        cancelText: formatMessage({id: "LANG726" }),
                        onOk() {
                            broadcastDiscover = true

                            scan_cgi(action)
                        },
                        onCancel() {}
                    })
                } else {
                    broadcastDiscover = false

                    scan_cgi(action)
                }
            }
        })
    }
    _handleCancel = () => {
        this.setState({
            autoDiscoverVisible: false,
            modalType: null
        })
    }
    _checkInfo = () => {
        let username = cookie.load("username")

        if (username) {
            return $.ajax({
                method: "post",
                url: baseServerURl,
                data: {
                    action: 'checkInfo',
                    user: username
                },
                async: false
            })
        }
    }
    _edit = (record) => {
        browserHistory.push({
            pathname: '/value-added-features/zeroConfig/devices/edit/',
            state: {
                mode: "edit",
                mac: record.mac,
                ip: record.ip,
                status: record.state,
                mid: ""
            }
        })
    }
    _delete = (record) => {
        const _this = this
        const { formatMessage } = this.props.intl

        const action = {
            "mac": record.mac,
            "original_ip": record.ip,
            "action": "deleteZeroConfig"
        }

        $.ajax({
            type: "post",
            data: action,
            url: baseServerURl,
            success: function (data) {
                const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(formatMessage({id: "LANG4763"}))

                    let pagination = _this.state.pagination
                    let pageSize = pagination.pageSize
                    let current = pagination.current
                    let old_total = pagination.total

                    let new_total = old_total - 1
                    let new_total_page = (new_total - 1) / pageSize + 1

                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }

                    pagination.current = current

                    _this._listZeroConfig({
                        page: current,
                        item_num: pageSize,
                        sidx: _this.state.sorter.field ? _this.state.sorter.field : 'mac',
                        sord: _this.state.sorter.order === "descend" ? "desc" : "asc"
                    })

                    _this._clearSelectRows()

                    _this.setState({
                        pagination: pagination
                    })

                    // this.setState({
                    //     selectedRowKeys: _.without(this.state.selectedRowKeys, record.extension),
                    //     selectedRows: this.state.selectedRows.filter(function(item) { return item.extension !== record.extension })
                    // })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _sync = (record) => {
        const { formatMessage } = this.props.intl

        let mac = record.mac,
            ip = record.original_ip

        confirm({
            content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG2692"}) }}></span>,
            okText: formatMessage({id: "LANG727" }),
            cancelText: formatMessage({id: "LANG726" }),
            onOk: () => {
                message.loading(formatMessage({id: "LANG829"}), 0)

                $.ajax({
                    type: "GET",
                    url: baseServerURl + "action=DownloadCfg&mac=" + mac,
                    error: function (jqXHR, textStatus, errorThrown) { },
                    success: function(res) {
                        message.destroy()

                        if (res && res.status === 0) {
                            message.success(formatMessage({id: "LANG829"}))
                        } else {
                            message.warning("Wrong!")
                        }
                    }.bind(this)
                })
            },
            onCancel: () => {
            }
        })
    }
    _reboot = (record) => {
        const { formatMessage } = this.props.intl

        let extension = null,
            ip = record.ip,
            mac = record.mac.toUpperCase(),
            zeroConfigSettings = UCMGUI.isExist.getList("getZeroConfigSettings"),
            macExtensions = this.state.macExtensions

        if (macExtensions[mac]) {
            let members = macExtensions[mac]

            if (members.length === 1) {
                extension = members[0]
            }
            if (members.length > 1) {
                if (this.state.membersVal) {
                    extension = this.state.membersVal
                } else {
                    extension = members[0]
                }
            }
        }

        if (typeof extension === "undefined") {
            return false
        }

        if (zeroConfigSettings && zeroConfigSettings.enable_zeroconfig !== '1') {
            confirm({
                content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG828"}) }}></span>,
                okText: formatMessage({id: "LANG727" }),
                cancelText: formatMessage({id: "LANG726" }),
                onOk: () => {
                    browserHistory.push('/value-added-features/zeroConfig/settings')
                },
                onCancel: () => {
                }
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG834"}) }}></span>,
                okText: formatMessage({id: "LANG727" }),
                cancelText: formatMessage({id: "LANG726" }),
                onOk: () => {
                    $.ajax({
                        type: "GET",
                        url: baseServerURl,
                        data: {
                            action: "rebootDevice",
                            ip: `${extension}@${ip}`
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                        },
                        success: function(data) {
                            const bool = UCMGUI.errorHandler(data, null, formatMessage)

                            message.destroy()

                            if (bool) {
                                let res = data.response.rebootDevice

                                if (res === "Send REBOOT !") {
                                    message.success(formatMessage({id: "LANG829"}))
                                } else {
                                    let arr = res.match(/\d*/)
                                    if (arr) {
                                        message.error(formatMessage({id: zeroconfigErr[arr[0]]}))
                                    } else {
                                        message.error(formatMessage({id: "LANG909"}))
                                    }
                                }
                            }
                        }
                    })
                },
                onCancel: () => {
                }
            })
        }
    }
    _accessDeviceWebUI = (record, mid) => {
        const { formatMessage } = this.props.intl

        let model = window.BLL.DataCollection.getModel(mid)

        if (model) {
            window.BLL.ConfigPage.updateCurrentDevice(record)

            let webConfig = model.property("WEBCONFIG"),
                urls = webConfig.split(";"),
                usingURL = "",
                count = 0

            message.loading(formatMessage({id: "LANG904"}), 0)

            for (let i = 0; i < urls.length && !usingURL; i++) {
                (function (usingIdx) {
                    $.ajax({
                        type: "POST",
                        url: baseServerURl,
                        data: {
                            "action": "checkRemoteUri",
                            "uri": urls[usingIdx]
                        },
                        async: true,
                        success: function (response) {
                            // response 60 also means accessible but with SSL warning
                            if (response && (response.status === 0 || response.status === 60)) {
                                usingURL = urls[usingIdx]
                            }

                            count++
                        },
                        error: function () {
                            count++
                        }
                    })
                })(i)
            }

            (function checkReady() {
                if (count === urls.length) {
                    if (usingURL) {
                        message.destroy()

                        window.open(usingURL, 'newUrl', "location=0,status=1,scrollbars=1, width=1024,height=600")
                    } else {
                        message.destroy()

                        message.error(formatMessage({id: "LANG3907"}))
                    }
                } else {
                    setTimeout(checkReady, 100)
                }
            })()

            window.BLL.ConfigPage.updateCurrentDevice(null)
        }
    }
    _createDevice = () => {
        browserHistory.push({
            pathname: '/value-added-features/zeroConfig/devices/add/',
            state: {
                mode: "add"
            }
        })
    }
    _modifiedSelectedDevices = () => {
        const { formatMessage } = this.props.intl

        let devicesMacList = [],
            devicesModelList = [],
            devicesIPList = [],
            devicesStatusList = [],
            selectedRows = this.state.selectedRows,
            selectedRowsLength = selectedRows.length

        for (let i = 0; i < selectedRows.length; i++) {
            let rowdata = selectedRows[i]
            let mac = rowdata['mac'],
                status = rowdata['status'],
                vendor = rowdata["vendor"],
                model = rowdata["model"],
                ip = rowdata['ip']

            let modelObj = window.BLL.DataCollection.getModelByName(vendor, model)

            if (mac && mac !== '000000000000' && modelObj) {
                devicesMacList.push(mac)
                devicesIPList.push(ip)
                devicesStatusList.push(status)
                devicesModelList.push(modelObj.id())
            }
        }

        if (devicesMacList.length > 1) {
            // batch edit using advanced page as default
            browserHistory.push({
                pathname: '/value-added-features/zeroConfig/devices/editSlected/',
                state: {
                    mode: "batch",
                    mac: devicesMacList.toString(),
                    mid: devicesModelList.toString()
                }
            })
        } else if (devicesMacList.length === 1) {
            // top.dialog.dialogInnerhtml({
            //     dialogTitle: $P.lang("LANG222").format($P.lang("LANG1287"), mac.toUpperCase()),
            //     displayPos: "editForm",
            //     frameSrc: "html/zc_devices_modal_basic.html?mode=edit&mac={0}&ip={1}&status={2}".format(devicesMacList[0].toUpperCase(), devicesIPList[0], devicesStatusList[0])
            // })

            browserHistory.push({
                pathname: '/value-added-features/zeroConfig/devices/edit/',
                state: {
                    mode: "edit",
                    mac: devicesMacList[0].toUpperCase(),
                    ip: devicesIPList[0],
                    status: devicesStatusList[0]
                }
            })
        } else {
            if (selectedRowsLength < 1) {
                message.warning(formatMessage({id: "LANG3456"}))
            } else {
                message.warning(formatMessage({id: "LANG5620"}))
            }
        }
    }
    _resetAllExtension = () => {
        const _this = this
        const { formatMessage } = this.props.intl

        confirm({
            content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG2627"}) }}></span>,
            okText: formatMessage({id: "LANG727" }),
            cancelText: formatMessage({id: "LANG726" }),
            onOk: () => {
                $.ajax({
                    type: "GET",
                    url: baseServerURl,
                    data: {
                        "action": "clearDevice",
                        "field": "account"
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                    },
                    success: function (data) {
                        const bool = UCMGUI.errorHandler(data, null, formatMessage)

                        if (bool) {
                            message.success(formatMessage({id: "LANG844"}))

                            _this.processReloadTable()
                        }
                    }
                })
            },
            onCancel: () => {
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

                // _this.state.macExtensions = macExtensions
                _this.setState({
                    macExtensions: macExtensions
                })
            }
        }).always(function () {
            if (selectedRows === undefined || selectedRows === null) {
                // $("#zc_devices_list").trigger('reloadGrid')
            } else {
                // jumpPageOrNot(selectedRows)
            }
        })
    }
    _checkDiscoveryMask = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        let networkInfo = this.state.networkInfo,
            netSegFromAddr = networkInfo.netSegFromAddr,
            netSegFromAddrArray = netSegFromAddr.split('.'),
            netSegToAddr = networkInfo.netSegToAddr,
            netSegToAddrArray = netSegToAddr.split('.'),
            targetArray = value.split('.'),
            flag = false

        if (targetArray[0] !== netSegFromAddrArray[0] ||
            targetArray[1] !== netSegFromAddrArray[1] ||
            targetArray[2] !== netSegFromAddrArray[2]) {
            callback(formatMessage({id: "LANG5637"}))
        } else if (targetArray[3] < netSegFromAddrArray[3] || targetArray[3] > netSegToAddrArray[3]) {
            callback(formatMessage({id: "LANG5637"}))
        } else {
            callback()
        }
    }
    _batchDelete = () => {
        const _this = this
        const { formatMessage } = this.props.intl
        const selectedRowKeys = this.state.selectedRowKeys

        if (selectedRowKeys.length === 0) {
            message.error(formatMessage({id: "LANG848"}))

            return
        }

        const macList = selectedRowKeys.join(',')

        confirm({
            content: <span dangerouslySetInnerHTML={{ __html: formatMessage({ id: "LANG818" }, { 0: macList }) }}></span>,
            okText: formatMessage({id: "LANG727" }),
            cancelText: formatMessage({id: "LANG726" }),
            onOk() {
                const action = {
                    "action": "deleteZeroConfig",
                    "mac": macList
                }

                $.ajax({
                    method: "post",
                    data: action,
                    url: baseServerURl,
                    success: function (data) {
                        const bool = UCMGUI.errorHandler(data, null, formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(formatMessage({id: "LANG4763"}))

                            let pagination = _this.state.pagination
                            let pageSize = pagination.pageSize
                            let current = pagination.current
                            let old_total = pagination.total

                            let new_total = old_total - macList.length
                            let new_total_page = (new_total - macList.length) / pageSize + 1

                            if (current > new_total_page) {
                                current = Math.floor(new_total_page)
                            }

                            pagination.current = current

                            _this._listZeroConfig({
                                item_num: pageSize,
                                page: current,
                                sidx: _this.state.sorter.field ? _this.state.sorter.field : 'mac',
                                sord: _this.state.sorter.order === "descend" ? "desc" : "asc"
                            })

                            _this._clearSelectRows()

                            _this.setState({
                                pagination: pagination
                            })

                            // this.setState({
                            //     selectedRowKeys: _.without(this.state.selectedRowKeys, record.extension),
                            //     selectedRows: this.state.selectedRows.filter(function(item) { return item.extension !== record.extension })
                            // })
                        }
                    },
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            },
            onCancel() {}
        })
    }
    _handleTableChange = (pagination, filters, sorter) => {
        let pager = this.state.pagination

        pager.current = pagination.current
        pager.pageSize = pagination.pageSize

        let sorter_here = {}

        if (sorter && sorter.field) {
            this.setState({
                pagination: pager,
                sorter: sorter
            })

            sorter_here = sorter
        } else {
            this.setState({
                pagination: pager
            })

            sorter_here = this.state.sorter
        }

        this._listZeroConfig({
            page: pagination.current,
            item_num: pagination.pageSize,
            sidx: sorter_here.field ? sorter_here.field : 'mac',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows })
    }
    _createOption = (text, record, index) => {
        const { formatMessage } = this.props.intl

        let model = window.BLL.DataCollection.getModelByName(record.vendor, record.model),
            syncBtn = <span className="sprite sprite-sync" title={ formatMessage({id: "LANG770"}) } onClick={ this._sync.bind(this, record) }></span>,
            rebootBtn = <span className="sprite sprite-reboot-disabled" title={ formatMessage({id: "LANG737"}) }></span>,
            accessBtn = <span className="sprite sprite-access-disabled" title={ formatMessage({id: "LANG3865"}) }></span>

        if (!record.ip) {
            syncBtn = <span className="sprite sprite-sync-disabled" title={ formatMessage({id: "LANG770"}) }></span>
        }

        let extension = this.state.macExtensions[record.mac.toUpperCase()]

        if (record.ip && extension && !UCMGUI.isIPv6(record.ip)) {
            rebootBtn = <span className="sprite sprite-reboot" title={ formatMessage({id: "LANG737"}) } onClick={ this._reboot.bind(this, record) }></span>
        }

        if (typeof model === "object") {
            let webConfig = model.property("WEBCONFIG")

            if (record.ip && webConfig) {
                accessBtn = <span className="sprite sprite-access" title={ formatMessage({id: "LANG3865"}) } onClick={ this._accessDeviceWebUI.bind(this, record, model.id()) }></span>
            }
        }
        return (<span>
            <span className="sprite sprite-edit" title={ formatMessage({id: "LANG738"}) } onClick={ this._edit.bind(this, record) }></span>
            <Popconfirm
                placement="left"
                title={ <span dangerouslySetInnerHTML=
                            {{ __html: formatMessage({ id: "LANG818" }, { 0: record.mac }) }}
                        ></span> }
                okText={ formatMessage({id: "LANG727"}) }
                cancelText={ formatMessage({id: "LANG726"}) }
                onConfirm={ this._delete.bind(this, record) }
            >
                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
            </Popconfirm>
            { syncBtn }
            { rebootBtn }
            { accessBtn }
        </span>)
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: []
        })
    }
    _onChangeMembers = (val) => {
        this.setState({
            membersVal: val
        })
    }
    _transData = (text, record, index, type) => {
        const { formatMessage } = this.props.intl

        let macExtensions = this.state.macExtensions,
            context = {}

        switch (type) {
            case 'mac':
                context = <span className="device_mac">{ text.toUpperCase() }</span>
                break
            case 'ip':
                context = text ? text : '--'
                break
            case 'members':
                let arr = [],
                    usingMac = record.mac.toUpperCase(),
                    membersVal = this.state.membersVal

                if (macExtensions[usingMac]) {
                    let members = macExtensions[usingMac]

                    if (members.length === 1) {
                        context = <span>{ members[0] }</span>
                    } else {
                        for (let i = 0; i < members.length; i++) {
                            arr.push(members[i])
                        }

                        context = <div>
                            <Select value={ membersVal ? membersVal : members[0] } onChange={ this._onChangeMembers }>
                                {
                                    arr.map((item, key) => {
                                        return <Option key={ key } value={ item }>{ item }</Option>
                                    })
                                }
                            </Select>
                        </div>
                    }
                } else {
                    context = "--"
                }

                break
            case 'version':
                context = text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '--'

                break
            case 'vendor':
                // due to the case in zc_vendor table is stored as lower case, we have to change the case in here.
                context = text ? text.toUpperCase() : '--'

                break
            case 'model':
                context = text ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '--'

                break
            case 'state':
                let str = (text > 0 && text !== 3) ? "LANG1302" : "LANG1303"

                context = <span>{ formatMessage({id: str}) }</span>

                break
            case 'createConfig':
                if (record.state === 6 || record.state === 7) {
                    let parts = record.last_access.split(" ")

                    if (parts.length === 2) {
                        let dateParts = parts[0].split("-")
                        let timeParts = parts[1].split(":")

                        if (dateParts.length === 3 && timeParts.length === 3) {
                            let date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2])

                            context = date.format("mm/dd/yyyy h:MM TT")
                        } else {
                            context = "--"
                        }
                    } else {
                        context = "--"
                    }
                } else {
                    context = "--"
                }

                break
            default:
                context = <span></span>

                break
        }

        return context
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        }

        const networkInfo = this.state.networkInfo

        const columns = [
            {
                title: formatMessage({id: "LANG1293"}),
                dataIndex: 'mac',
                render: (text, record, index) => (
                    this._transData(text, record, index, "mac")
                )
            }, {
                title: formatMessage({id: "LANG1291"}),
                dataIndex: 'ip',
                render: (text, record, index) => (
                    this._transData(text, record, index, "ip")
                )
            }, {
                title: formatMessage({id: "LANG85"}),
                dataIndex: 'members',
                render: (text, record, index) => (
                    this._transData(text, record, index, "members")
                )
            }, {
                title: formatMessage({id: "LANG1298"}),
                dataIndex: 'version',
                render: (text, record, index) => (
                    this._transData(text, record, index, "version")
                )
            }, {
                title: formatMessage({id: "LANG1299"}),
                dataIndex: 'vendor',
                render: (text, record, index) => (
                    this._transData(text, record, index, "vendor")
                )
            }, {
                title: formatMessage({id: "LANG1295"}),
                dataIndex: 'model',
                render: (text, record, index) => (
                    this._transData(text, record, index, "model")
                )
            }, {
                title: formatMessage({id: "LANG1301"}),
                dataIndex: 'state',
                render: (text, record, index) => (
                    this._transData(text, record, index, "state")
                )
            }, {
                title: formatMessage({id: "LANG74"}),
                dataIndex: '',
                key: 'x',
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }
        ]

        const pagination = {
            showSizeChanger: true,
            total: this.state.deviceList.length,
            onShowSizeChange(current, pageSize) {
                console.log('Current: ', current, '; PageSize: ', pageSize)
            },
            onChange(current) {
                console.log('Current: ', current)
            }
        }

        // rowSelection object indicates the need for row selection
        const rowSelection = {
            onChange: this._onSelectChange,
            selectedRowKeys: this.state.selectedRowKeys
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <div id="preparePad" style={{ width: "500px" }}>
                        <div style={{ marginTop: "60px" }}>
                            <img src="/../../images/ani_loading.gif"/>
                        </div>
                        <div id="loadingMsg" style={{ textAlign: "center" }}>{ formatMessage({ id: "LANG805" }) }</div>
                    </div>
                    <div id="contentPad" style={{ display: "none" }}>
                        <div className="top-button">
                            <Button type="primary" icon="" onClick={ this._showAutoDiscoverModal }>
                                { formatMessage({id: "LANG757"}) }
                            </Button>
                            <Button type="primary" icon="" onClick={ this._createDevice }>
                                { formatMessage({id: "LANG754"}) }
                            </Button>
                            <Button type="primary" icon="" onClick={ this._batchDelete }>
                                { formatMessage({id: "LANG755"}) }
                            </Button>
                            <Button type="primary" icon="" onClick={ this._modifiedSelectedDevices }>
                                { formatMessage({id: "LANG3866"}) }
                            </Button>
                            <Button type="primary" icon="" onClick={ this._resetAllExtension }>
                                { formatMessage({id: "LANG2626"}) }
                            </Button>
                            <label style={{ marginLeft: 16 }}>{ formatMessage({id: "LANG1288"}) + ":" }</label>
                            <Select
                                value={ this.state.filter }
                                style={{ width: 200, marginLeft: 10 }}
                                onChange={ this._handleFilterChange }
                            >
                                <Option value="all">{ formatMessage({id: "LANG104"}) }</Option>
                                <Option value="res">{ formatMessage({id: "LANG1289"}) }</Option>
                            </Select>
                        </div>
                        <div>
                            <Table
                                rowKey="mac"
                                columns={ columns }
                                rowSelection={ rowSelection }
                                dataSource={ this.state.deviceList }
                                pagination={ this.state.pagination }
                                onChange={ this._handleTableChange }
                                loading={ this.state.loading }
                            />
                        </div>
                        <Modal
                            onCancel={ this._handleCancel }
                            onOk={ this._handleAutoDiscover }
                            title={ formatMessage({id: "LANG757"}) }
                            visible={ this.state.autoDiscoverVisible }
                            okText={ formatMessage({id: "LANG727"}) }
                            cancelText={ formatMessage({id: "LANG726"}) }
                        >
                            <Form>
                                <div className="lite-desc">
                                    { formatMessage({id: "LANG1316"}) }
                                </div>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4817" /> }>
                                            <span>{ formatMessage({id: "LANG4816"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    <span>
                                        { networkInfo.LANAddr }
                                    </span>
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4819" /> }>
                                            <span>{ formatMessage({id: "LANG4818"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    <span>
                                        { networkInfo.netSegFromAddr } - { networkInfo.netSegToAddr }
                                    </span>
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4821" /> }>
                                            <span>{ formatMessage({id: "LANG4820"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    <span>
                                        { networkInfo.netSegToAddr }
                                    </span>
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1320" /> }>
                                            <span>{ formatMessage({id: "LANG1319"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('method', {
                                        initialValue: 'Ping'
                                    })(
                                        <Select style={{ width: 200 }}>
                                            <Option value="Ping">Ping</Option>
                                            <Option value="ARP">ARP</Option>
                                            <Option value="SipMsg">SIP-Message</Option>
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1318" /> }>
                                            <span>{ formatMessage({id: "LANG1317"}) }</span>
                                        </Tooltip>
                                    )}
                                >
                                    { getFieldDecorator('targetAddr', {
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.ipDns(data, value, callback, formatMessage, "IP")
                                            }
                                        }, {
                                            validator: this._checkDiscoveryMask
                                        }]
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                            </Form>
                        </Modal>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    zcFoundConfig: state.zcFoundConfig
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(Actions, dispatch)
}

export default Form.create()(connect(mapStateToProps, mapDispatchToProps)(injectIntl(Devices)))

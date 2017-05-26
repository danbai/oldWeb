'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Validator from "../../api/validator"

import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select, Upload, Icon, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class TcpTls extends Component {
    constructor(props) {
        super(props)

        this.state = {
            sipTLSCa: "",
            sipTLSCrt: "",
            sipTLS: "",
            caList: [],
            usedPort: ["22"],
            rangeUsedPort: []
        }
    }
    componentDidMount() {
        this._checkFiles()
        this._getUsedPort()
    }
    componentWillUnmount() {
    }
    _getUsedPort = () => {
        const me = this

        let usedPort = this.state.usedPort
        let rangeUsedPort = this.state.rangeUsedPort

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: { action: 'getUsedPortInfo' },
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = data.response
                    let usedport = response.usedport
                    
                    usedport.map(function(item) {
                        if ($.inArray(item.port, usedPort) > -1 || $.inArray(item.port, rangeUsedPort) > -1) {

                        } else if (_.indexOf(item.port, '-') > -1) {
                            rangeUsedPort.push(item.port)
                        } else {
                            usedPort.push(item.port)
                        }
                    })
                }
            }.bind(this)
        })

        this.setState({
            usedPort: usedPort,
            rangeUsedPort: rangeUsedPort
        })
    }
    _checkFiles = () => {
        const { formatMessage } = this.props.intl

        let sipTLSCa = ""
        let sipTLSCrt = ""
        let sipTLSKey = ""
        let type = ""
        let me = this
        let caList = []

        type = "sip_tls_ca_file"

        $.ajax({
            type: "post",
            url: "/cgi",
            async: false,
            data: {
                "action": "checkFile",
                "type": type
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status")) {
                     if (data.status === 0) {
                        sipTLSCa = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        type = "sip_tls_crt"

        $.ajax({
            type: "post",
            url: "/cgi",
            async: false,
            data: {
                "action": "checkFile",
                "type": type
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status")) {
                     if (data.status === 0) {
                        sipTLSCrt = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        type = "sip_tls_key"

        $.ajax({
            type: "post",
            url: "/cgi",
            async: false,
            data: {
                "action": "checkFile",
                "type": type
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status")) {
                     if (data.status === 0) {
                        sipTLSKey = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        $.ajax({
            type: "post",
            url: "/cgi",
            async: false,
            data: {
                "action": "listFile",
                "type": "sip_tls_ca_dir",
                "page": 1,
                "item_num": 1000000,
                "sidx": "d",
                "sord": "desc"
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                if (data && data.hasOwnProperty("status") && data.status === 0 && data.response.result === 0) {
                    let fileList = data.response.sip_tls_ca_dir

                    fileList.map((item, i) => {
                        caList.push(item.n)
                    })
                }
            }
        })

        this.setState({
            sipTLSCa: sipTLSCa,
            sipTLSCrt: sipTLSCrt,
            sipTLSKey: sipTLSKey,
            caList: caList
        })
    }
    _checkFile = (type, msg, file) => {
        const { formatMessage } = this.props.intl

        let filename = file.name

        filename = filename.toLowerCase()

        if (filename.slice(-type.length) !== type) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG911"}, {0: type, 1: formatMessage({id: msg})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })

            return false
        } else {
            return true
        }
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _onRemoveFileOK = (type) => {
        const { formatMessage } = this.props.intl

        let successMessage = ''
        let me = this

        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2798" })}}></span>

        let data = {
            action: "removeFile"
        }

        if (type !== "sip_tls_ca_file" && type !== "sip_tls_crt" && type !== "sip_tls_key") {
            data.type = "sip_tls_ca_dir"
            data.data = type
        } else {
            data.type = type
        }

        $.ajax({
            data: data,
            type: 'post',
            async: true,
            url: api.apiHost,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    confirm({
                        title: formatMessage({id: "LANG543"}),
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG926" })}}></span>,
                        okText: formatMessage({id: "LANG727"}),
                        cancelText: formatMessage({id: "LANG726"}),
                        onOk: me.props.reboot,
                        onCancel: me._checkFiles.bind(this)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onRemoveFile = (type) => {
        const { formatMessage } = this.props.intl

        let me = this
        let successMessage = ''

        confirm({
            title: (formatMessage({id: "LANG543"})),
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG938"})}} ></span>,
            onOk() {
                me._onRemoveFileOK(type)
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _setUpgradeLoading= () => {
        this.setState({upgradeLoading: false})
    }
    _checkOpenPort = (rule, value, callback, formatMessage, otherKey, key) => {
        const { getFieldValue } = this.props.form
        const sipTcpSettings = this.props.dataSource

        let port = ""
        let oldPort = ""
        let otherPort = ""
        let oldAddress = ""
        let valueArray = []
        let otherValueArray = []
        let oldAddressArray = []
        let openPort = this.state.usedPort
        let otherValue = getFieldValue(otherKey)

        if (!value || value.indexOf(":") < -1) {
            callback()

            return
        }

        valueArray = value.split(":")

        port = valueArray[valueArray.length - 1]

        if (otherValue && otherValue.indexOf(":") > -1) {
            otherValueArray = otherValue.split(":")

            otherPort = otherValueArray[otherValueArray.length - 1]

            if (otherPort === port) {
                callback(formatMessage({id: "LANG3869"}))

                return
            }
        }

        oldAddress = sipTcpSettings[key]

        if (oldAddress && oldAddress.indexOf(":") > -1) {
            oldAddressArray = oldAddress.split(":")

            oldPort = oldAddressArray[oldAddressArray.length - 1]

            if (oldPort === port) {
                callback()

                return
            }
        }

        if (port && _.indexOf(openPort, port) > -1) {
            callback(formatMessage({id: "LANG3869"}))
        } else {
            let used = false

            this.state.rangeUsedPort.map(function(item) {
                let min = parseInt(item.split('-')[0])
                let max = parseInt(item.split('-')[1])
                let valuenum = parseInt(port)

                if (valuenum >= min && valuenum <= max) {
                    used = true
                }
            })

            if (used) {
                callback(formatMessage({id: "LANG3869"}))
            } else {
                callback()
            }
        }
    }
    _checkPort = (data, value, callback, formatMessage) => {
        if (!value || value.indexOf(":") < -1) {
            callback()

            return
        }

        let val = Number(value.split(":")[1])

        if (val < 0 || val > 65535) {
            callback(formatMessage({id: "LANG957"}))
        } else {
            callback()
        }
    }
    render() {
        const me = this
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const sipTcpSettings = this.props.dataSource
        const upgradeLoading = this.state.upgradeLoading
        const sipTLSCa = this.state.sipTLSCa
        const sipTLSCrt = this.state.sipTLSCrt
        const sipTLSKey = this.state.sipTLSKey
        const caList = this.state.caList || []

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        const propsTLSCa = {
            name: 'file',
            showUploadList: false,
            action: api.apiHost + 'action=uploadfile&type=sip_tls_ca_file',
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log(info.file.status)

                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }

                if (upgradeLoading) {
                    this._setUpgradeLoading()
                }

                if (info.file.status === 'removed') {
                    return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response

                    if (data) {
                        let status = data.status,
                            response = data.response

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))

                            confirm({
                                title: formatMessage({id: "LANG543"}),
                                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG926" })}}></span>,
                                okText: formatMessage({id: "LANG727"}),
                                cancelText: formatMessage({id: "LANG726"}),
                                onOk: me.props.reboot,
                                onCancel: me._checkFiles.bind(this)
                            })
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                }
            },
            onRemove() {
                message.destroy()
            },
            beforeUpload: this._checkFile.bind(this, ".ca", "LANG1860")
        }

        const propsTLSCrt = {
            name: 'file',
            showUploadList: false,
            action: api.apiHost + 'action=uploadfile&type=sip_tls_crt',
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log(info.file.status)

                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }

                if (upgradeLoading) {
                    this._setUpgradeLoading()
                }

                if (info.file.status === 'removed') {
                    return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response

                    if (data) {
                        let status = data.status,
                            response = data.response

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))

                            confirm({
                                title: formatMessage({id: "LANG543"}),
                                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG926" })}}></span>,
                                okText: formatMessage({id: "LANG727"}),
                                cancelText: formatMessage({id: "LANG726"}),
                                onOk: me.props.reboot,
                                onCancel: me._checkFiles.bind(this)
                            })
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                }
            },
            onRemove() {
                message.destroy()
            },
            beforeUpload: this._checkFile.bind(this, ".crt", "LANG1864")
        }

        const propsTLSKey = {
            name: 'file',
            showUploadList: false,
            action: api.apiHost + 'action=uploadfile&type=sip_tls_key',
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log(info.file.status)

                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }

                if (upgradeLoading) {
                    this._setUpgradeLoading()
                }

                if (info.file.status === 'removed') {
                    return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response

                    if (data) {
                        let status = data.status,
                            response = data.response

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))

                            confirm({
                                title: formatMessage({id: "LANG543"}),
                                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG926" })}}></span>,
                                okText: formatMessage({id: "LANG727"}),
                                cancelText: formatMessage({id: "LANG726"}),
                                onOk: me.props.reboot,
                                onCancel: me._checkFiles.bind(this)
                            })
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                }
            },
            onRemove() {
                message.destroy()
            },
            beforeUpload: this._checkFile.bind(this, ".key", "LANG4166")
        }

        const propsTLSCaList = {
            name: 'file',
            showUploadList: false,
            action: api.apiHost + 'action=uploadfile&type=sip_tls_ca_dir',
            headers: {
                authorization: 'authorization-text'
            },
            onChange(info) {
                // message.loading(formatMessage({ id: "LANG979" }), 0)
                console.log(info.file.status)

                if (info.file.status !== 'uploading') {
                    console.log(info.file, info.fileList)
                }

                if (upgradeLoading) {
                    this._setUpgradeLoading()
                }

                if (info.file.status === 'removed') {
                    return
                }

                if (info.file.status === 'done') {
                    // message.success(`${info.file.name} file uploaded successfully`)
                    let data = info.file.response

                    if (data) {
                        let status = data.status,
                            response = data.response

                        if (data.status === 0 && response && response.result === 0) {
                            message.success(formatMessage({id: "LANG906"}))

                            confirm({
                                title: formatMessage({id: "LANG543"}),
                                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG926" })}}></span>,
                                okText: formatMessage({id: "LANG727"}),
                                cancelText: formatMessage({id: "LANG726"}),
                                onOk: me.props.reboot,
                                onCancel: me._checkFiles.bind(this)
                            })
                        } else if (data.status === 4) {
                            message.error(formatMessage({id: "LANG915"}))
                        } else if (!_.isEmpty(response)) {
                            message.error(formatMessage({id: UCMGUI.transUploadcode(response.result)}))
                        } else {
                            message.error(formatMessage({id: "LANG916"}))
                        }
                    } else {
                        message.error(formatMessage({id: "LANG916"}))
                    }
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} file upload failed.`)
                }
            },
            onRemove() {
                message.destroy()
            },
            beforeUpload: this._checkFile.bind(this, ".ca", "LANG1860")
        }

        const spanCaList = caList.map((item, index) => {
            return (
                <row>
                    <Col span={ 12 }>
                        <span>{item}</span>
                    </Col>
                    <Col span={ 12 }>
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._onRemoveFile.bind(this, item) }
                        >
                            { formatMessage({id: "LANG739"}) }
                        </Button>
                    </Col>
                </row>
                )
        })

        return (
            <div className="content">
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1854" /> }>
                                    <span>{ formatMessage({id: "LANG1853"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('tcpenable', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: sipTcpSettings.tcpenable
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1852" /> }>
                                    <span>{ formatMessage({id: "LANG1851"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('tcpbindaddr', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.ipv4AddressPort(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkPort(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkOpenPort(data, value, callback, formatMessage, "tlsbindaddr", "tcpbindaddr")
                                }
                            }],
                            initialValue: sipTcpSettings.tcpbindaddr
                        })(
                            <Input type="text" maxLength="127" />
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5126" /> }>
                                    <span>{ formatMessage({id: "LANG5125"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('tcpbindaddr6', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.ipv6Port(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkPort(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkOpenPort(data, value, callback, formatMessage, "tlsbindaddr6", "tcpbindaddr6")
                                }
                            }],
                            initialValue: sipTcpSettings.tcpbindaddr6
                        })(
                            <Input type="text" />
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1867" /> }>
                                    <span>{ formatMessage({id: "LANG1868"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('tlsenable', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: sipTcpSettings.tlsenable
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1855" /> }>
                                    <span>{ formatMessage({id: "LANG5204"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('tlsbindaddr', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.ipAddressPort(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkPort(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkOpenPort(data, value, callback, formatMessage, "tcpbindaddr", "tlsbindaddr")
                                }
                            }],
                            initialValue: sipTcpSettings.tlsbindaddr
                        })(
                            <Input type="text" maxLength="127" />
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5128" /> }>
                                    <span>{ formatMessage({id: "LANG5127"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('tlsbindaddr6', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    Validator.ipv6Port(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkPort(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this._checkOpenPort(data, value, callback, formatMessage, "tcpbindaddr6", "tlsbindaddr6")
                                }
                            }],
                            initialValue: sipTcpSettings.tlsbindaddr6
                        })(
                            <Input type="text" maxLength="127" />
                        )}
                    </FormItem>
                    <FormItem
                        className="hidden"
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1865" /> }>
                                    <span>{ formatMessage({id: "LANG1866"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('tlsclientmethod', {
                            rules: [],
                            initialValue: sipTcpSettings.tlsclientmethod
                        })(
                            <Select style={{ width: 200 }}>
                                <Option value="tlsv1">TLSv1</Option>
                                <Option value="sslv3">SSLv3</Option>
                                <Option value="sslv2">SSLv2</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1869" /> }>
                                    <span>{ formatMessage({id: "LANG1870"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('tlsdontverifyserver', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: sipTcpSettings.tlsdontverifyserver
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1861" /> }>
                                    <span>{ formatMessage({id: "LANG1862"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        <Col span={ 12 }>
                            { getFieldDecorator('tls_ca_file', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...propsTLSCa}>
                                    <Button type="ghost">
                                        <Icon type="upload" />{sipTLSCa === "" ? formatMessage({id: "LANG1607"}) : "TLS.ca"}
                                    </Button>
                                </Upload>
                            ) }
                        </Col>
                        <Col span={ 6 }>
                            <Button
                                icon="delete"
                                type="primary"
                                size='default'
                                disabled= {sipTLSCa === ""}
                                onClick={ this._onRemoveFile.bind(this, sipTLSCa) }
                            >
                                { formatMessage({id: "LANG739"}) }
                            </Button>
                        </Col>
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1863" /> }>
                                    <span>{ formatMessage({id: "LANG1864"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        <Col span={ 12 }>
                            { getFieldDecorator('tls_crt_file', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...propsTLSCrt}>
                                    <Button type="ghost">
                                        <Icon type="upload" />{sipTLSCrt === "" ? formatMessage({id: "LANG1607"}) : "TLS.crt"}
                                    </Button>
                                </Upload>
                            ) }
                        </Col>
                        <Col span={ 6 }>
                            <Button
                                icon="delete"
                                type="primary"
                                size='default'
                                disabled={ sipTLSCrt === "" }
                                onClick={ this._onRemoveFile.bind(this, sipTLSCrt) }
                            >
                                { formatMessage({id: "LANG739"}) }
                            </Button>
                        </Col>
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4165" /> }>
                                    <span>{ formatMessage({id: "LANG4166"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        <Col span={ 12 }>
                            { getFieldDecorator('tls_key_file', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...propsTLSKey}>
                                    <Button type="ghost">
                                        <Icon type="upload" />{ sipTLSKey === "" ? formatMessage({id: "LANG1607"}) : "TLS.key" }
                                    </Button>
                                </Upload>
                            ) }
                        </Col>
                        <Col span={ 6 }>
                            <Button
                                icon="delete"
                                type="primary"
                                size='default'
                                disabled={ sipTLSKey === "" }
                                onClick={ this._onRemoveFile.bind(this, sipTLSKey) }
                            >
                                { formatMessage({id: "LANG739"}) }
                            </Button>
                        </Col>
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1859" /> }>
                                    <span>{ formatMessage({id: "LANG1860"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        <Col>
                            { getFieldDecorator('tls_ca_dir', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload { ...propsTLSCaList } >
                                    <Button type="ghost">
                                        <Icon type="upload" />{ formatMessage({id: "LANG1607"}) }
                                    </Button>
                                </Upload>
                            ) }
                        </Col>
                        <Row>
                            { spanCaList }
                        </Row>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default injectIntl(TcpTls)

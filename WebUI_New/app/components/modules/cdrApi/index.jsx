'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Tooltip, Button, Upload, Icon, Modal } from 'antd'

const FormItem = Form.Item
let uuid = 1
const confirm = Modal.confirm

class CdrApi extends Component {
    constructor(props) {
        super(props)
        this.state = {
            cdrSettings: {},
            cdrAccounts: {},
            ipList: [],
            netmaskList: [],
            cdrTLSKey: "",
            cdrTLSCrt: "",
            usedPort: [],
            rangeUsedPort: [],
            oWebrtcPort: {}
        }
    }
    componentDidMount() {
        this._getInitData()
        this._checkFiles()
        this._getUsedPort()
        this._getWebrtcPort()
    }
    _checkPermitIPRequire = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        var num = rule.field.match(/\d+/)
        var permitNetmask = 'permitNetmask' + num
        var val = getFieldValue(permitNetmask)
        const keys = getFieldValue('keys')

        if (val && !value) {
            callback(formatMessage({id: "LANG2150"}))
        } else if (!value && keys.length > 0) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkPermitNetMaskRequire = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        var num = rule.field.match(/\d+/)
        var permitIP = 'permitIP' + num
        var val = getFieldValue(permitIP)
        const keys = getFieldValue('keys')

        if (val && !value) {
            callback(formatMessage({id: "LANG2150"}))
        } else if (!value && keys.length > 0) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkRequire = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const enabled = getFieldValue('enabled')
        if (enabled && !value) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _checkPort = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        var val = value.split(":")[1]
        if (val) {
            val = parseInt(val)
        } else {
            callback()
            return
        }
        if (val < 0 || val > 65535) {
            callback(formatMessage({id: "LANG957"}))
            return
        } else {
            callback()
        }
    }
    _checkOpenPort = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        var val = value.split(":")[1]
        if (!val) {
            callback()
            return
        }
        let orginalPort = this.state.cdrSettings.tlsbindaddr.split(":")[1]
        let openPort = this.state.usedPort
        if (orginalPort) {
            openPort = _.without(openPort, orginalPort)
        }

        if (val && _.indexOf(openPort, val) > -1) {
            callback(formatMessage({id: "LANG3869"}))
        } else {
            let used = false
            this.state.rangeUsedPort.map(function(item) {
                let min = parseInt(item.split('-')[0])
                let max = parseInt(item.split('-')[1])
                let valuenum = parseInt(val)
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
    _checkWebrtcPort = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        if (!value) {
            callback()
            return
        }
        var val = value.split(":")[1]
        var enable = getFieldValue('enabled')

        if (!enable || this.state.oWebrtcPort.enable === 'no') {
            callback()
            return
        }

        if (val === this.state.oWebrtcPort.port) {
            callback(formatMessage({id: "LANG3869"}))
            return
        }
        callback()
        return
    }
    _checkIpv6Len = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        if (!value) {
            callback()
            return
        }

        var num = rule.field.match(/\d+/)
        var permitIP = 'permitIP' + num
        var val = getFieldValue(permitIP)

        if (!val) {
            callback()
            return
        }

        if (UCMGUI.isIPv6(val)) {
            if (/^\d+$/.test(value)) {
                if (parseInt(value) > 128) {
                    callback(formatMessage({id: "LANG2147"}, {0: '0', 1: '128'}))
                } else {
                    callback()
                }
            } else if (UCMGUI.isIPv6(value)) {
                callback(formatMessage({id: "LANG2195"}))
            } else {
                callback()
            }
        } else if (/^\d+$/.test(value) && !UCMGUI.isIPv6(val)) {
            callback(formatMessage({id: "LANG2195"}))
        } else {
            callback()
        }
    }
    _checkDifferentPermitIP = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const keys = getFieldValue('keys')
        let email_list = []
        let not_different = true
        if (rule.field !== 'permitIP0') {
            const tmp_value = getFieldValue('permitIP0')
            if (tmp_value === value) {
                not_different = false
            }
        }
        keys.map(function(item) {
            const field = `permitIP${item}`
            if (rule.field !== field) {
                const tmp_value = getFieldValue(field)
                if (tmp_value === value) {
                    not_different = false
                }
            }
        })
        if (not_different === false) {
            callback(formatMessage({id: "LANG2816"}))
        } else {
            callback()
        }  
    }
    _getUsedPort = () => {
        let usedPort = this.state.usedPort
        let rangeUsedPort = this.state.rangeUsedPort
        const me = this
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'getUsedPortInfo'
            },
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = data.response
                    const usedport = response.usedport
                    
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
    _getWebrtcPort = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'getSIPWebRTCHttpSettings'
            },
            type: 'json',
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {
                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    var tlsenable = data.response.webrtc_http_settings.tlsenable,
                        tlsbindaddr = data.response.webrtc_http_settings.tlsbindaddr,
                        tlsPort = tlsbindaddr.split(":")[1]

                    var oWebrtcPort = {
                        'enable': tlsenable,
                        'port': tlsPort
                    }
                    this.setState({
                        oWebrtcPort: oWebrtcPort
                    })
                }
            }.bind(this)
        })
    }
    _getInitData = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getCDRAPISettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response.http_settings || {}

                this.setState({
                    cdrSettings: response
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getCDRAPIAccount'
            },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response.cdrapi_accounts || {}
                let cdrapiPermits = res.response.cdrapi_permits || []
                let ipList = [],
                    netmaskList = []

                _.each(cdrapiPermits, function(value, key) {
                    let permit = value.permit

                    ipList.push(permit.split('\/')[0])
                    netmaskList.push(permit.split('\/')[1])
                })

                if (ipList.length > 0) {
                    uuid = ipList.length - 1
                }

                this.setState({
                    cdrAccounts: response,
                    ipList: ipList,
                    netmaskList: netmaskList
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _removeIP = (k) => {
        const { form } = this.props
        // can use data-binding to get
        const keys = form.getFieldValue('keys')

        form.setFieldsValue({
            keys: keys.filter(key => key !== k)
        })
    }
    _addIP = () => {
        uuid++
        const { form } = this.props
        const { formatMessage } = this.props.intl
        // can use data-binding to get
        const keys = form.getFieldValue('keys')
        if (keys.length === 9) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2623"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
            return
        }
        const nextKeys = keys.concat(uuid)
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys
        })
    }
    _handleCancel = () => {
        this.props.form.resetFields()
        this._getInitData()
        // browserHistory.push('/cdr/cdrApi')
    }
    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const extensionId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let actionSettings = {},
                    actionAccounts = {}

                actionSettings.action = 'updateCDRAPISettings'
                actionSettings.tlsenable = actionSettings.enabled = (values.enabled ? 'yes' : 'no')
                actionSettings.tlsbindaddr = values.tlsbindaddr

                let ipList = []

                if (values.permitIP0 && values.permitNetmask0) {
                    ipList.push(values.permitIP0 + '/' + values.permitNetmask0)
                }
                const keys = getFieldValue('keys')
                keys.map((k, index) => {
                    let ip = `permitIP${k}`
                    let netmask = `permitNetmask${k}`
                    if (values[ip] && values[netmask]) {
                        ipList.push(values[ip] + '/' + values[netmask])
                    }
                })
                actionAccounts.permit = ipList.join(';')
                actionAccounts.action = 'updateCDRAPIAccount'
                actionAccounts.username = values.username
                actionAccounts.secret = values.secret

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: actionSettings,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            $.ajax({
                                url: api.apiHost,
                                method: "post",
                                data: actionAccounts,
                                type: 'json',
                                error: function(e) {
                                    message.error(e.statusText)
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                    if (bool) {
                                        message.destroy()
                                        message.success(successMessage)
                                    }
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }
    _checkFiles = () => {
        const { formatMessage } = this.props.intl

        let cdrTLSKey = ""
        let cdrTLSCrt = ""
        let type = ""
        let me = this
        let caList = []

        type = "cdr_tls_key"
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
                        cdrTLSKey = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        type = "cdr_tls_cert"
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
                        cdrTLSCrt = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        this.setState({
            cdrTLSKey: cdrTLSKey,
            cdrTLSCrt: cdrTLSCrt
        })
    }
    _checkFormat = (type, msg, file) => {
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
        let successMessage = ''
        const { formatMessage } = this.props.intl
        let me = this

        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2798" })}}></span>
        let data = {
            action: "removeFile"
        }

        data.type = type

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: data,
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, formatMessage)
                if (bool) {
                    me._checkFiles()
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
        confirm({
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

    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue, getFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemIPLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const formItemIPWithoutLabelLayout = {
            wrapperCol: { span: 18, offset: 3 }
        }

        let cdrSettings = this.state.cdrSettings
        let cdrAccounts = this.state.cdrAccounts
        let ipList = this.state.ipList
        let netmaskList = this.state.netmaskList
        let upgradeLoading = this.state.upgradeLoading
        let cdrTLSKey = this.state.cdrTLSKey
        let cdrTLSCrt = this.state.cdrTLSCrt

        const title = formatMessage({id: "LANG2998"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        const me = this

        const propsTLSKey = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=cdr_tls_key',
            showUploadList: false,
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
                            me._checkFiles()
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
            beforeUpload: this._checkFormat.bind(this, ".pem", "LANG3000")
        }
        const propsTLSCrt = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=cdr_tls_cert',
            showUploadList: false,
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
                            me._checkFiles()
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
            beforeUpload: this._checkFormat.bind(this, ".pem", "LANG3002")
        }

        let keyList = []
        for (let k = 1; k < ipList.length; k++) {
            keyList.push(k)
        }

        getFieldDecorator('keys', { initialValue: keyList })

        const keys = getFieldValue('keys')

        const formIPItems = keys.map((k, index) => {
            return (
            <FormItem key={ k }
                { ...formItemIPWithoutLabelLayout }
            >
                <Col span="8">
                    <FormItem>
                        {getFieldDecorator(`permitIP${k}`, {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.ipAddressNoBrackets(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: this._checkDifferentPermitIP
                            }],
                            initialValue: ipList[k]
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1915"}) } />
                        )}
                    </FormItem>
                </Col>
                <Col span="1">
                    <p className="ant-form-split">/</p>
                </Col>
                <Col span="8" style={{ marginRight: 10 }}>
                    <FormItem>
                        {getFieldDecorator(`permitNetmask${k}`, {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.specialIpAddressNoBrackets(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: this._checkIpv6Len
                            }],
                            initialValue: netmaskList[k]
                            })(
                                <Input placeholder={ formatMessage({id: "LANG1902"}) } />
                        )}
                    </FormItem>
                </Col>
                <Col span="1">
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        onClick={ () => this._removeIP(k) }
                    />
                </Col>
            </FormItem>
            )
        })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'/>
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2784" /> }>
                                    <span>{ formatMessage({id: "LANG274"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('enabled', {
                                valuePropName: 'checked',
                                initialValue: cdrSettings.enabled === 'yes'
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2790" /> }>
                                    <span>{ formatMessage({id: "LANG1856"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('tlsbindaddr', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: this._checkRequire
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.ipAddressPort(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkPort
                                }, {
                                    validator: this._checkOpenPort
                                }, {
                                    validator: this._checkWebrtcPort
                                }],
                                initialValue: cdrSettings.tlsbindaddr
                            })(
                                <Input maxLength={127}/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2999" /> }>
                                    <span>{ formatMessage({id: "LANG3000"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={12}>
                            { getFieldDecorator('tlsprivatekey', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...propsTLSKey}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> { cdrTLSKey === "" ? formatMessage({id: "LANG1607"}) : "private.pem" }
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col span={6}>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {cdrTLSKey === ""}
                                    onClick={ this._onRemoveFile.bind(this, cdrTLSKey) }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3001" /> }>
                                    <span>{ formatMessage({id: "LANG3002"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={12}>
                            { getFieldDecorator('tlscertfile', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...propsTLSCrt}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> { cdrTLSCrt === "" ? formatMessage({id: "LANG1607"}) : "certificate.pem" }
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col span={6}>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {cdrTLSCrt === ""}
                                    onClick={ this._onRemoveFile.bind(this, cdrTLSCrt) }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2779" /> }>
                                    <span>{ formatMessage({id: "LANG72"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('username', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: cdrAccounts.username || 'cdrapi'
                            })(
                                <Input maxLength={64}/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2780" /> }>
                                    <span>{ formatMessage({id: "LANG73"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('secret', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.keyboradNoSpacesemicolon(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 2)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.checkAlphanumericPw(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: cdrAccounts.secret || 'cdrapi123'
                            })(
                                <Input maxLength={64}/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemIPLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG2778" />}>
                                    <span>{formatMessage({id: "LANG2776"})}</span>
                                </Tooltip>
                            )}>
                            <Col span="8">
                                <FormItem>
                                    {getFieldDecorator("permitIP0", {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: this._checkPermitIPRequire
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.ipAddressNoBrackets(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: this._checkDifferentPermitIP
                                        }],
                                        initialValue: ipList[0] ? ipList[0] : ""
                                        })(
                                            <Input placeholder={ formatMessage({id: "LANG1915"}) } />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span="1">
                                <p className="ant-form-split">/</p>
                            </Col>
                            <Col span="8" style={{ marginRight: 10 }}>
                                <FormItem>
                                    {getFieldDecorator("permitNetmask0", {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: this._checkPermitNetMaskRequire
                                        }, {
                                            validator: (data, value, callback) => {
                                                Validator.specialIpAddressNoBrackets(data, value, callback, formatMessage)
                                            }
                                        }, {
                                            validator: this._checkIpv6Len
                                        }],
                                        initialValue: netmaskList[0] ? netmaskList[0] : ""
                                        })(
                                            <Input placeholder={ formatMessage({id: "LANG1902"}) } />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span="1">
                                <Icon
                                    className="dynamic-plus-button"
                                    type="plus-circle-o"
                                    onClick={ this._addIP }
                                />
                            </Col>
                        </FormItem>
                        { formIPItems }
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(CdrApi))
'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Checkbox, message, Tooltip, Select, Upload, Icon, Modal, Col } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class OpenVPN extends Component {
    constructor(props) {
        super(props)

        this.state = {
            openVPN: {},
            enabled: false,
            vpnCaCrt: "",
            vpnClientCrt: "",
            vpnClientKey: "",
            cipherOptions: [
                { value: "aes-128-cbc", text: "AES-128-CBC" },
                { value: "aes-128-cfb", text: "AES-128-CFB" },
                { value: "aes-128-cfb1", text: "AES-128-CFB1" },
                { value: "aes-128-cfb8", text: "AES-128-CFB8" },
                { value: "aes-128-ctr", text: "AES-128-CTR" },
                { value: "aes-128-ecb", text: "AES-128-ECB" },
                { value: "aes-128-gcm", text: "AES-128-GCM" },
                { value: "aes-128-ofb", text: "AES-128-OFB" },
                { value: "aes-128-xts", text: "AES-128-XTS" },
                { value: "aes-192-cbc", text: "AES-192-CBC" },
                { value: "aes-192-cfb", text: "AES-192-CFB" },
                { value: "aes-192-cfb1", text: "AES-192-CFB1" },
                { value: "aes-192-cfb8", text: "AES-192-CFB8" },
                { value: "aes-192-ctr", text: "AES-192-CTR" },
                { value: "aes-192-ecb", text: "AES-192-ECB" },
                { value: "aes-192-gcm", text: "AES-192-GCM" },
                { value: "aes-192-ofb", text: "AES-192-OFB" },
                { value: "aes-192-xts", text: "AES-192-XTS" },
                { value: "aes-256-cbc", text: "AES-256-CBC" },
                { value: "aes-256-cfb", text: "AES-256-CFB" },
                { value: "aes-256-cfb1", text: "AES-256-CFB1" },
                { value: "aes-256-cfb8", text: "AES-256-CFB8" },
                { value: "aes-256-ctr", text: "AES-256-CTR" },
                { value: "aes-256-ecb", text: "AES-256-ECB" },
                { value: "aes-256-gcm", text: "AES-256-GCM" },
                { value: "aes-256-ofb", text: "AES-256-OFB" },
                { value: "aes-256-xts", text: "AES-256-XTS" },
                { value: "aes128", text: "AES-128" },
                { value: "aes192", text: "AES-192" },
                { value: "aes256", text: "AES-256" },
                { value: "bf", text: "BF" },
                { value: "bf-cbc", text: "BF-CBC(Blowfish)" },
                { value: "bf-cfb", text: "BF-CFB" },
                { value: "bf-ecb", text: "BF-ECB" },
                { value: "bf-ofb", text: "BF-OFB" },
                { value: "camellia-128-cbc", text: "CAMELLIA-128-CBC" },
                { value: "camellia-128-cfb", text: "CAMELLIA-128-CFB" },
                { value: "camellia-128-cfb1", text: "CAMELLIA-128-CFB1" },
                { value: "camellia-128-cfb8", text: "CAMELLIA-128-CFB8" },
                { value: "camellia-128-ecb", text: "CAMELLIA-128-ECB" },
                { value: "camellia-128-ofb", text: "CAMELLIA-128-OFB" },
                { value: "camellia-192-cbc", text: "CAMELLIA-192-CBC" },
                { value: "camellia-192-cfb", text: "CAMELLIA-192-CFB" },
                { value: "camellia-192-cfb1", text: "CAMELLIA-192-CFB1" },
                { value: "camellia-192-cfb8", text: "CAMELLIA-192-CFB8" },
                { value: "camellia-192-ecb", text: "CAMELLIA-192-ECB" },
                { value: "camellia-192-ofb", text: "CAMELLIA-192-OFB" },
                { value: "camellia-256-cbc", text: "CAMELLIA-256-CBC" },
                { value: "camellia-256-cfb", text: "CAMELLIA-256-CFB" },
                { value: "camellia-256-cfb1", text: "CAMELLIA-256-CFB1" },
                { value: "camellia-256-cfb8", text: "CAMELLIA-256-CFB8" },
                { value: "camellia-256-ecb", text: "CAMELLIA-256-ECB" },
                { value: "camellia-256-ofb", text: "CAMELLIA-256-OFB" },
                { value: "camellia128", text: "CAMELLIA128" },
                { value: "camellia192", text: "CAMELLIA192" },
                { value: "camellia256", text: "CAMELLIA256" },
                { value: "cast", text: "CAST" },
                { value: "cast-cbc", text: "CAST-CBC" },
                { value: "cast5-cbc", text: "CAST5-CBC" },
                { value: "cast5-cfb", text: "CAST5-CFB" },
                { value: "cast5-ecb", text: "CAST5-ECB" },
                { value: "cast5-ofb", text: "CAST5-OFB" },
                { value: "des", text: "DES" },
                { value: "des-cbc", text: "DES-CBC" },
                { value: "des-cfb", text: "DES-CFB" },
                { value: "des-cfb1", text: "DES-CFB1" },
                { value: "des-cfb8", text: "DES-CFB8" },
                { value: "des-ecb", text: "DES-ECB" },
                { value: "des-ede", text: "DES-EDE" },
                { value: "des-ede-cbc", text: "DES-EDE-CBC" },
                { value: "des-ede-cfb", text: "DES-EDE-CFB" },
                { value: "des-ede-ofb", text: "DES-EDE-OFB" },
                { value: "des-ede3", text: "DES-EDE3" },
                { value: "des-ede3-cbc", text: "DES-EDE3-CBC" },
                { value: "des-ede3-cfb", text: "DES-EDE3-CFB" },
                { value: "des-ede3-cfb1", text: "DES-EDE3-CFB1" },
                { value: "des-ede3-cfb8", text: "DES-EDE3-CFB8" },
                { value: "des-ede3-ofb", text: "DES-EDE3-OFB" },
                { value: "des-ofb", text: "DES-OFB" },
                { value: "des3", text: "DES3" },
                { value: "desx", text: "DESX" },
                { value: "desx-cbc", text: "DESX-CBC" },
                { value: "id-aes128-GCM", text: "ID-AES128-GCM" },
                { value: "id-aes192-GCM", text: "ID-AES192-GCM" },
                { value: "id-aes256-GCM", text: "ID-AES256-GCM" },
                { value: "rc2", text: "RC2" },
                { value: "rc2-40-cbc", text: "RC2-40-CBC" },
                { value: "rc2-64-cbc", text: "RC2-64-CBC" },
                { value: "rc2-cbc", text: "RC2-CBC" },
                { value: "rc2-cfb", text: "RC2-CFB" },
                { value: "rc2-ecb", text: "RC2-ECB" },
                { value: "rc2-ofb", text: "RC2-OFB" },
                { value: "rc4", text: "RC4" },
                { value: "rc4-40", text: "RC4-40" },
                { value: "rc4-hmac-md5", text: "RC4-HAMC-MD5" },
                { value: "seed", text: "SEED" },
                { value: "seed-cbc", text: "SEED-CBC" },
                { value: "seed-cfb", text: "SEED-CFB" },
                { value: "seed-ecb", text: "SEED-ECB" },
                { value: "seed-ofb", text: "SEED-OFB" }
            ]
        }
    }
    componentDidMount() {
        this._getOpenVPNSettings()
        this._checkFiles()
    }
    _checkJBLen = (rule, value, callback) => {
        const form = this.props.form

        if (value) {
            form.validateFields(['gs_jbmax'], { force: true })
        }

        callback()
    }
    _checkJBMax = (rule, value, callback) => {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const len = form.getFieldValue('gs_jblen')

        if (value && len && value < len) {
            callback(formatMessage({id: "LANG2142"}, { 0: formatMessage({id: "LANG1655"}), 1: formatMessage({id: "LANG2460"}) }))
        } else {
            callback()
        }
    }
    _getOpenVPNSettings = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                'comp': '',
                'dev': '',
                'remote': '',
                'proto': '',
                'cipher': '',
                'enable': '',
                'vpn_index': '0',
                action: 'getOpenVPNSettings'
            },
            success: function(res) {
                let openVPN = res.response
                let openvpn_settings = openVPN.openvpn_settings

                if (openvpn_settings.remote === ' ') {
                    openvpn_settings.remote = ''
                }

                if (openvpn_settings.remote && openvpn_settings.remote !== ' ') {
                    openvpn_settings.remote = openvpn_settings.remote.replace(" ", ":")
                }

                this.setState({
                    openVPN: openvpn_settings,
                    enabled: (openVPN.enable === '1')
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        this.props.form.resetFields()
        this._getOpenVPNSettings()
        // browserHistory.push('/system-settings/openVPN')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = {}

                _.map(values, (value, key) => {
                    if (key.indexOf('openvpn_') === -1) {
                        action[key] = value
                    }
                })

                action.vpn_index = '0'
                action.action = 'updateOpenVPNSettings'
                action.comp = action.comp ? 'yes' : 'no'
                action.enable = action.enable ? '1' : '0'

                if (action.remote) {
                    action.remote = action.remote.replace(":", " ")
                }

                if (!action.remote) {
                    action.remote = ' '
                }

                $.ajax({
                    data: action,
                    type: 'post',
                    url: api.apiHost,
                    error: function(e) {
                        message.destroy()
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(formatMessage({ id: "LANG815" }))
                        }
                    }.bind(this)
                })
            }
        })
    }
    _onEnableChange = (e) => {
        this.setState({
            enabled: e.target.checked
        })
    }
    _checkFiles = () => {
        const { formatMessage } = this.props.intl
        let vpnCaCrt = ""
        let vpnClientCrt = ""
        let vpnClientKey = ""
        let type = ""
        let me = this
        let caList = []

        type = "openvpn_ca_crt"

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
                        vpnCaCrt = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        type = "openvpn_client_crt"

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
                        vpnClientCrt = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        type = "openvpn_client_key"

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
                        vpnClientKey = type
                     }
                } else {
                    message.error(formatMessage({ id: "LANG3868" }))
                }
            }
        })

        this.setState({
            vpnCaCrt: vpnCaCrt,
            vpnClientCrt: vpnClientCrt,
            vpnClientKey: vpnClientKey
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
        const { formatMessage } = this.props.intl

        let me = this
        let successMessage = ''

        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2798" })}}></span>

        let data = {
            action: "removeFile"
        }

        data.type = type

        $.ajax({
            data: data,
            type: 'post',
            async: true,
            url: api.apiHost,
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
            onCancel() {},
            onOk() {
                me._onRemoveFileOK(type)
            },
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _setUpgradeLoading= () => {
        this.setState({upgradeLoading: false})
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        let openVPN = this.state.openVPN || {}
        let dev = openVPN.dev
        let proto = openVPN.proto
        let cipher = openVPN.cipher
        let remote = $.trim(openVPN.remote)
        let comp = (openVPN.comp === 'yes')
        let upgradeLoading = this.state.upgradeLoading
        let vpnCaCrt = this.state.vpnCaCrt
        let vpnClientCrt = this.state.vpnClientCrt
        let vpnClientKey = this.state.vpnClientKey
        let me = this

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG3990"})})

        const propsCaCrt = {
            name: 'file',
            showUploadList: false,
            action: api.apiHost + 'action=uploadfile&type=openvpn_ca_crt',
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
            beforeUpload: this._checkFormat.bind(this, ".crt", "LANG3999")
        }

        const propsClientCrt = {
            name: 'file',
            showUploadList: false,
            action: api.apiHost + 'action=uploadfile&type=openvpn_client_crt',
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
            beforeUpload: this._checkFormat.bind(this, ".crt", "LANG4001")
        }

        const propsClientKey = {
            name: 'file',
            showUploadList: false,
            action: api.apiHost + 'action=uploadfile&type=openvpn_client_key',
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
            beforeUpload: this._checkFormat.bind(this, ".key", "LANG4003")
        }

        return (
            <div className="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG3990"}) } onSubmit={ this._handleSubmit } onCancel={ this._handleCancel } isDisplay='display-block' />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3991" /> }>
                                        <span>{ formatMessage({id: "LANG274"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('enable', {
                                valuePropName: 'checked',
                                initialValue: this.state.enabled
                            })(
                                <Checkbox onChange={ this._onEnableChange } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3992" /> }>
                                        <span>{ formatMessage({id: "LANG1426"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('remote', {
                                rules: [
                                    (this.state.enabled
                                        ? {
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }
                                        : {}),
                                    {
                                        validator: (data, value, callback) => {
                                            Validator.host(data, value, callback, formatMessage, 'LANG5597')
                                        }
                                    }
                                ],
                                initialValue: remote
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3994" /> }>
                                        <span>{ formatMessage({id: "LANG3993"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('proto', {
                                initialValue: proto
                            })(
                                <Select>
                                    <Option value="udp">UDP</Option>
                                    <Option value="tcp">TCP</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3996" /> }>
                                        <span>{ formatMessage({id: "LANG3995"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('dev', {
                                initialValue: dev
                            })(
                                <Select>
                                    <Option value="tun">Dev TUN</Option>
                                    <Option value="tap">Dev TAP</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3998" /> }>
                                        <span>{ formatMessage({id: "LANG3997"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('comp', {
                                valuePropName: 'checked',
                                initialValue: comp
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4008" /> }>
                                        <span>{ formatMessage({id: "LANG4007"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('cipher', {
                                initialValue: cipher
                            })(
                                <Select>
                                    {
                                        this.state.cipherOptions.map(function(item) {
                                            return <Option key={ item.value } value={ item.value }>
                                                    { item.text }
                                                </Option>
                                            }
                                        ) 
                                    }
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4000" /> }>
                                        <span>{ formatMessage({id: "LANG3999"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <Col span={12}>
                            { getFieldDecorator('openvpn_ca_crt', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...propsCaCrt}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> { vpnCaCrt === "" ? formatMessage({id: "LANG1607"}) : "ca.crt" }
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col span={6}>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {vpnCaCrt === ""}
                                    onClick={ this._onRemoveFile.bind(this, vpnCaCrt) }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4002" /> }>
                                        <span>{ formatMessage({id: "LANG4001"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <Col span={12}>
                            { getFieldDecorator('openvpn_client_crt', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...propsClientCrt}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> { vpnClientCrt === "" ? formatMessage({id: "LANG1607"}) : "client.crt" }
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col span={6}>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {vpnClientCrt === ""}
                                    onClick={ this._onRemoveFile.bind(this, vpnClientCrt) }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4004" /> }>
                                        <span>{ formatMessage({id: "LANG4003"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <Col span={12}>
                            { getFieldDecorator('openvpn_client_key', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...propsClientKey}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> { vpnClientKey === "" ? formatMessage({id: "LANG1607"}) : "client.key" }
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col span={6}>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {vpnClientKey === ""}
                                    onClick={ this._onRemoveFile.bind(this, vpnClientKey) }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(OpenVPN))

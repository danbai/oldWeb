'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Col, Form, Input, message, Tooltip, Checkbox, Upload, Icon, Modal, Button } from 'antd'

const FormItem = Form.Item

class AMISetting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roomList: [],
            availableAccountList: [],
            roomItem: {},
            usedPort: ["22"],
            rangeUsedPort: [],
            hasKey: false,
            hasCert: false
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getUsedPort()
        this._getInitData()
        this._checkFile()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.groupNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkOpenPort = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const port = getFieldValue('port') + ''
        const tlsbindport = getFieldValue('tlsbindport') + ''
        let openPort = this.state.usedPort
        openPort = _.without(openPort, this.state.amiItem.port)
        openPort = _.without(openPort, this.state.amiItem.tlsbindport)

        if (port === tlsbindport) {
            callback(formatMessage({id: "LANG3869"}))
        } else if (value && _.indexOf(openPort, value) > -1) {
            callback(formatMessage({id: "LANG3869"}))
        } else {
            let used = false
            this.state.rangeUsedPort.map(function(item) {
                let min = parseInt(item.split('-')[0])
                let max = parseInt(item.split('-')[1])
                let valuenum = parseInt(value)
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
    _doNothing = () => {

    }
    _checkFile = () => {
        let hasCert = this.state.hasCert
        let hasKey = this.state.hasKey
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'checkFile',
                type: 'ami_tls_key'
            },
            type: 'json',
            async: false,
            error: function(e) {
                hasKey = false
            },
            success: function(data) {
                if (data.status === 0) {
                    hasKey = true
                } else {
                    hasKey = false
                }
            }.bind(this)
        })
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'checkFile',
                type: 'ami_tls_cert'
            },
            type: 'json',
            async: false,
            error: function(e) {
                hasCert = false
            },
            success: function(data) {
                if (data.status === 0) {
                    hasCert = true
                } else {
                    hasCert = false
                }
            }.bind(this)
        })
        this.setState({
            hasCert: hasCert,
            hasKey: hasKey
        })
    }
    _getUsedPort = () => {
        let usedPort = this.state.usedPort
        let rangeUsedPort = this.state.rangeUsedPort
        const me = this
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getUsedPortInfo' },
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
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        let amiItem = {}

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getAmiSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    amiItem = response.ami_settings
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            amiItem: amiItem
        })
    }
    _reBoot = () => {
        UCMGUI.loginFunction.confirmReboot()
    }
    _handleCancel = () => {
        browserHistory.push('/value-added-features/ami')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const roomId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = values
                action.tlsenable = values.tlsenable ? 'yes' : 'no'
                action.timestampevents = values.timestampevents ? 'yes' : 'no'
                action.action = "updateAmiSettings"

                let amiItem = this.state.amiItem
                let reboot = true
                if (amiItem.port + '' === action.port + '' &&
                    amiItem.tlsenable === action.tlsenable &&
                    amiItem.timestampevents === action.timestampevents &&
                    amiItem.tlsbindport + '' === action.tlsbindport + '' &&
                    amiItem.tlsbindaddr + '' === action.tlsbindaddr + '' &&
                    amiItem.writetimeout + '' === action.writetimeout + '') {
                    reboot = false
                }

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                            if (reboot) {
                                Modal.confirm({
                                    content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG833" })}}></span>,
                                    okText: formatMessage({id: "LANG727"}),
                                    cancelText: formatMessage({id: "LANG726"}),
                                    onOk: this._reBoot.bind(this)
                                })
                            }
                    }

                        this._handleCancel()
                    }.bind(this)
                })
            }
        })
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _onRemoveFileCert = () => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2798" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: "removeFile",
                type: "ami_tls_cert"
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)
                    this._checkFile()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onRemoveFileKey = () => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2798" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: "removeFile",
                type: "ami_tls_key"
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)
                    this._checkFile()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _checkKey = (file) => {
        const { formatMessage } = this.props.intl
        if (file.size < (2 * 1024 * 1024) && file.name.slice(-4) === '.pem') {
            return true
        } else {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG911"}, {0: ".pem", 1: formatMessage({id: "LANG3000"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
            return false
        }
    }
    _checkCert = (file) => {
        const { formatMessage } = this.props.intl
        if (file.size < (2 * 1024 * 1024) && file.name.slice(-4) === '.pem') {
            return true
        } else {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG911"}, {0: ".pem", 1: formatMessage({id: "LANG3002"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
            return false
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const amiItem = this.state.amiItem || {}
        let hasCert = this.state.hasCert
        let hasKey = this.state.hasKey

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const title = formatMessage({id: "LANG3827"})

        const roomItem = this.state.roomItem || {}

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })
        const me = this
        const props_key = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=ami_tls_key',
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
                if (me.state.upgradeLoading) {
                    me.setState({upgradeLoading: false})
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
                            me._checkFile()
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
            beforeUpload: me._checkKey
        }
        const props_cert = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=ami_tls_cert',
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
                if (me.state.upgradeLoading) {
                    me.setState({upgradeLoading: false})
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
                            me._checkFile()
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
            beforeUpload: me._checkCert
        }

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                    saveTxt={ formatMessage({id: "LANG4384"}) }
                    cancelTxt={ formatMessage({id: "LANG726"}) }
                />
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_port"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3828" />}>
                                    <span>{formatMessage({id: "LANG3835"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('port', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1024, 65535)
                                    }
                                }, {
                                    validator: this._checkOpenPort
                                }],
                                width: 100,
                                initialValue: amiItem.port ? amiItem.port : "7777"
                            })(
                                <Input min={1024} max={65535} />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_tlsenable"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3831" />}>
                                    <span>{formatMessage({id: "LANG1868"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('tlsenable', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                valuePropName: 'checked',
                                initialValue: amiItem.tlsenable === "yes" ? true : false
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_tlsbindport"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3833" />}>
                                    <span>{formatMessage({id: "LANG3832"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('tlsbindport', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1, 65535)
                                    }
                                }, {
                                    validator: this._checkOpenPort
                                }],
                                width: 100,
                                initialValue: amiItem.tlsbindport ? amiItem.tlsbindport : "5039"
                            })(
                                <Input min={1} max={65535} />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_writetimeout"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4571" />}>
                                    <span>{formatMessage({id: "LANG4570"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('writetimeout', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 100, 10000)
                                    }
                                }],
                                width: 100,
                                initialValue: amiItem.writetimeout ? amiItem.writetimeout : "100"
                            })(
                                <Input min={100} max={10000} />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_tlsbindaddr"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3834" />}>
                                    <span>{formatMessage({id: "LANG1856"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('tlsbindaddr', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.ipAddress(data, value, callback, formatMessage)
                                    }
                                }],
                                width: 100,
                                initialValue: amiItem.tlsbindaddr ? amiItem.tlsbindaddr : "0.0.0.0"
                            })(
                                <Input maxLength="128" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_timestampevents"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4575" />}>
                                    <span>{formatMessage({id: "LANG4574"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('timestampevents', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                valuePropName: 'checked',
                                initialValue: amiItem.timestampevents === "yes" ? true : false
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_tlsprivatekey"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3847" />}>
                                    <span>{formatMessage({id: "LANG3000"})}</span>
                                </Tooltip>
                            )}>
                            <Col span={12}>
                            { getFieldDecorator('tlsprivatekey', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...props_key}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col span={12}>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasKey === false}
                                    onClick={ this._onRemoveFileKey }>
                                    { formatMessage({id: "LANG739"}) }
                                </Button>
                            </Col>
                        </FormItem>
                        <FormItem
                            ref="div_tlscertfile"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG3863" />}>
                                    <span>{formatMessage({id: "LANG3002"})}</span>
                                </Tooltip>
                            )}>
                            <Col span={12}>
                            { getFieldDecorator('tlscertfile', {
                                valuePropName: 'fileList',
                                normalize: this._normFile
                            })(
                                <Upload {...props_cert}>
                                    <Button type="ghost">
                                        <Icon type="upload" /> { formatMessage({id: "LANG1607"}) }
                                    </Button>
                                </Upload>
                            ) }
                            </Col>
                            <Col span={12}>
                                <Button
                                    icon="delete"
                                    type="primary"
                                    size='default'
                                    disabled= {this.state.hasCert === false}
                                    onClick={ this._onRemoveFileCert }>
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

export default Form.create()(injectIntl(AMISetting))

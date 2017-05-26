'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Checkbox, message, Tooltip, Select, Upload, Icon, Modal } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import _ from 'underscore'

const FormItem = Form.Item
const Option = Select.Option

class HttpServer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            httpserver: {},
            usedPort: ["22"],
            rangeUsedPort: ['']
        }
    }
    componentDidMount () {
        this._getHttpServerSettings()
        this._getUsedPort()
    }
    _checkOpenPort = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const web_redirect = getFieldValue('web_redirect')
        if (value && value === this.state.httpserver.web_port + '') {
            callback()
        } else if (web_redirect === '1' && value === '80') {
            callback(formatMessage({id: "LANG936"}))
        } else if (value && _.indexOf(this.state.usedPort, value) > -1) {
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

                        } else if (me.state.httpserver.web_port === item.port) {

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
    _getHttpServerSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getHttpServer' },
            type: 'json',
            async: false,
            success: function(res) {
                let httpserver = res.response.httpserver

                this.setState({
                    httpserver: httpserver
                })
                this.props.setHttpPort(httpserver.web_port)
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _jumpTo = () => {
        const { formatMessage } = this.props.intl

        message.loading(formatMessage({ id: "LANG806" }), 0)

        $.ajax({
            type: "POST",
            url: api.apiHost,
            data: "action=reloadHttpServer&reflush_server=0"
        })

        setTimeout(function() {
            message.destroy()

            var webHttps = $("#web_https option:selected").text(),
                webPort = $('#web_port').val()

            if (webHttps.toLowerCase() === "http") {
                location.href = "http://" + top.location.hostname + ":" + webPort + top.location.pathname
            } else if (webHttps.toLowerCase() === "https") {
                location.href = "https://" + top.location.hostname + ":" + webPort + top.location.pathname
            }
        }, 5000)
    }
    _normFile(e) {
        if (Array.isArray(e)) {
            return e
        }

        return e && e.fileList
    }
    _resetCert = () => {
        const { formatMessage } = this.props.intl

        Modal.confirm({
            title: formatMessage({id: "LANG543" }),
            content: formatMessage({id: "LANG4238" }),
            okText: formatMessage({id: "LANG727" }),
            cancelText: formatMessage({id: "LANG726" }),
            onOk() {
                message.loading(formatMessage({ id: "LANG806" }), 0)

                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: api.apiHost,
                    data: "action=resetHttpServer&reflush_server=0"
                })

                setTimeout(function() {
                    message.destroy()

                    var webHttps = $("#web_https option:selected").text(),
                        webPort = $('#web_port').val()

                    if (webHttps.toLowerCase() === "http") {
                        location.href = "http://" + top.location.hostname + ":" + webPort + top.location.pathname
                    } else if (webHttps.toLowerCase() === "https") {
                        location.href = "https://" + top.location.hostname + ":" + webPort + top.location.pathname
                    }
                }, 5000)
            },
            onCancel() {}
        })
    }
    _handleCancel = () => {
        browserHistory.push('/system-settings/httpServer')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = values

                action.action = 'updateHttpServer'

                action.web_https = (action.web_https === 'disable' ? '0' : '1')

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(formatMessage({ id: "LANG815" }))
                            this._jumpTo()
                        }
                    }.bind(this)
                })
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
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const me = this
        if (global.httpServerRefreshHttpServer) {
            global.httpServerRefreshHttpServer = false
            this._getHttpServerSettings()
            this.props.form.resetFields(['web_redirect', 'web_https', 'web_port'])
        }

        let httpserver = this.state.httpserver || {}
        let web_https = (httpserver.web_https === 1 ? 'enable' : 'disable')
        let web_port = httpserver.web_port
        let web_redirect = String(httpserver.web_redirect)

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG716"})})
        const props_key = {
            name: 'file',
            action: api.apiHost + 'action=uploadfile&type=http_tls_key',
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
            action: api.apiHost + 'action=uploadfile&type=http_tls_cert',
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
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG571"}) }>
                                    <span>{ formatMessage({id: "LANG571"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('web_redirect', {
                            initialValue: web_redirect
                        })(
                            <Select>
                                <Option value="1">{ formatMessage({id: "LANG274"}) }</Option>
                                <Option value="0">{ formatMessage({id: "LANG273"}) }</Option>
                            </Select>
                        ) }
                    </FormItem>

                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG617"}) }>
                                    <span>{ formatMessage({id: "LANG617"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('web_https', {
                            initialValue: web_https
                        })(
                            <Select>
                                <Option value="disable">{ formatMessage({id: "LANG217"}) }</Option>
                                <Option value="enable">{ formatMessage({id: "LANG218"}) }</Option>
                            </Select>
                        ) }
                    </FormItem>

                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG618"}) }>
                                    <span>{ formatMessage({id: "LANG618"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('web_port', {
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
                            initialValue: web_port
                        })(
                            <Input />
                        ) }
                    </FormItem>

                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG2999"}) }>
                                    <span>{ formatMessage({id: "LANG3000"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
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
                    </FormItem>

                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG3001"}) }>
                                    <span>{ formatMessage({id: "LANG3002"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
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
                    </FormItem>

                    <div>
                        <Button type="primary" onClick={ this._resetCert }>{formatMessage({id: "LANG4229"})}</Button>
                    </div>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(HttpServer))
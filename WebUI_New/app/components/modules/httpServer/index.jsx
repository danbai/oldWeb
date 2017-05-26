'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { Form, Input, Button, Checkbox, message, Tooltip, Select, Upload, Icon, Modal } from 'antd'
import _ from 'underscore'
import { browserHistory } from 'react-router'
import Validator from "../../api/validator"
const FormItem = Form.Item
const Option = Select.Option

global.httpServerRefreshHttpServer = false
global.httpServerRefreshLoginSettings = false

class Http extends Component {
    constructor(props) {
        super(props)
        this.state = {
            web_port: 8089,
            httpserver: {},
            usedPort: ["22"],
            rangeUsedPort: [''],
            aRejectPort: []
        }
    }
    componentDidMount() {
        this._getHttpServerSettings()
        this._getUsedPort()
        this._getStaticDefense()
        this._checkPemUseful()
    }
    componentWillUnmount() {

    }

    _checkOpenPort = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const web_redirect = getFieldValue('web_redirect')
        if (value && value === this.state.httpserver.web_port + '' && !(web_redirect === '1' && value === '80')) {
            callback()
        } else if (web_redirect === '1' && value === '80') {
            callback(formatMessage({id: "LANG936"}))
        } else if (value && _.indexOf(this.state.usedPort, value) > -1 && value !== '80') {
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
    _checkRejectPort = (rule, value, callback) => {
         const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.aRejectPort, value) > -1) {
            callback(formatMessage({id: "LANG4141"}))
        } else {
            callback()
        }
    }
    _checkPemUseful() {
        const { formatMessage } = this.props.intl
        $.ajax({
            url: api.apiHost,
            method: "post",
            type: "json",
            async: false,
            data: {
                'action': 'getHttpPemUseful'
            },
            dataType: "json",
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    var unuseful = data.response.pem_unuseful
                    
                    if (unuseful === '1') {
                        Modal.warning({
                            content: formatMessage({id: "LANG4833" }),
                            okText: formatMessage({id: "LANG727" }),
                            onOk() {}
                        })
                    }
                }
            }
        })
    }
    _getStaticDefense = () => {
        let aRejectPort = []

        $.ajax({
            url: api.apiHost,
            method: "post",
            data: {
                action: 'listStaticDefense',
                options: 'rule_act,dest_port,protocol,type'
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
                    const rule_name = response.rule_name

                    rule_name.map(function(item) {
                        if ((item.rule_act === 'reject' || item.rule_act === 'drop') &&
                            (item.protocol === 'tcp' || item.protocol === 'both') &&
                            (item.type === 'in')) {
                            aRejectPort.push(item.dest_port.toString())
                        }
                    })
                }
            }.bind(this)
        })
        this.setState({
            aRejectPort: aRejectPort
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
    _doSave() {
        const me = this
        $.ajax({
            url: api.apiHost,
            type: "POST",
            data: {
                'action': 'reloadHttpConf',
                'reflash_conf': '0'
            }, 
            dataType: 'json',
            error: function(jqXHR, textStatus, errorThrown) {
                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    me._jumpTo()
                }
            }
        })
    }
    _jumpTo = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        message.loading(formatMessage({ id: "LANG806" }), 0)

        $.ajax({
            type: "POST",
            url: api.apiHost,
            data: "action=reloadHttpServer&reflush_server=0"
        })

        setTimeout(function() {
            message.destroy()

            let webHttps = getFieldValue('web_https') === 'disable' ? 'http' : 'https'
            let webPort = getFieldValue('web_port')

            if (webHttps.toLowerCase() === "http") {
                window.location.href = "http://" + window.location.hostname + ":" + webPort + window.location.pathname
            } else if (webHttps.toLowerCase() === "https") {
                window.location.href = "https://" + window.location.hostname + ":" + webPort + window.location.pathname
            }
        }, 5000)
    }
    _getReject = () => {
        let reject = false
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getTypicalFirewallSettings',
                _location: 'webserver'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    reject = response.typical_firewallsettings.reject_all === 'yes'
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        return reject
    }
    _gotoSecurity = () => {
        browserHistory.push('/system-settings/securitySettings')
    }
    _handleCancel = () => {
        // browserHistory.push('/system-settings/httpServer')
        const web_port = this.state.web_port
        this.setState({
            web_port: web_port
        })
        this.props.form.resetFields()
        this._getHttpServerSettings()
    }
    _realSubmit = (values) => {
        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        message.loading(formatMessage({ id: "LANG826" }), 0)

        let action = _.clone(values)

        action.action = 'updateHttpServer'

        action.web_https = (action.web_https === 'disable' ? '0' : '1')
        delete action.cookie_timeout
        delete action.login_max_num
        delete action.login_band_time
        delete action.white_ip_addr
        delete action.tlscertfile
        delete action.tlsprivatekey

        $.ajax({
            url: api.apiHost,
            method: "post",
            data: action,
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.loading(formatMessage({ id: "LANG826" }), 0)
                    // message.success(formatMessage({ id: "LANG844" }))
                    $.ajax({
                        url: api.apiHost,
                        method: "post",
                        data: {
                            action: 'updateFail2ban',
                            login_attack_defense_port: values.web_port
                        },
                        type: 'json',
                        async: false,
                        error: function(e) {
                            message.error(e.statusText)
                        },
                        success: function(data) {
                            var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                // message.success(formatMessage({ id: "LANG844" }))
                                $.ajax({
                                    url: api.apiHost,
                                    method: "post",
                                    data: {
                                        action: 'reloadFail2ban',
                                        reload_fail2ban: ''
                                    },
                                    type: 'json',
                                    async: false,
                                    error: function(e) {
                                        message.error(e.statusText)
                                    },
                                    success: function(data) {
                                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                        if (bool) {
                                            message.success(formatMessage({ id: "LANG844" }))
                                            // message.success(formatMessage({ id: "LANG844" }))
                                        }
                                    }.bind(this)
                                })
                            }
                        }.bind(this)
                    })
                    this._doSave()
                }
            }.bind(this)
        })
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        const reject = this._getReject()
        const me = this

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            // delete err.white_ip_addr
            if (!err) {
                console.log('Received values of form: ', values)
                if (reject && this.state.web_port !== values.web_port) {
                    Modal.confirm({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4126" })}}></span>,
                        okText: formatMessage({id: "LANG727"}),
                        cancelText: formatMessage({id: "LANG726"}),
                        onOk: me._gotoSecurity,
                        onCancel: me._handleCancel
                    })
                } else {
                    Modal.confirm({
                        content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG807" })}}></span>,
                        okText: formatMessage({id: "LANG727"}),
                        cancelText: formatMessage({id: "LANG726"}),
                        onOk: me._realSubmit.bind(this, values),
                        onCancel: me._handleCancel
                    })
                }
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
    _setHttpPort = (port) => {
        this.setState({
            web_port: port
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG57"})
                })

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
                <Title
                    headerTitle={ formatMessage({id: "LANG57"}) }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay= "display-block"
                />
                <div className="content">
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
                                }, {
                                    validator: this._checkRejectPort
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
                                    <Button type="ghost" style={{width: 130}}>
                                        <Icon type="upload" /> { "private.pem" }
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
                                    <Button type="ghost" style={{width: 130}}>
                                        <Icon type="upload" /> { "certificate.pem" }
                                    </Button>
                                </Upload>
                        ) }
                        </FormItem>

                        <div>
                            <Button type="primary" onClick={ this._resetCert }>{formatMessage({id: "LANG4229"})}</Button>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(Http))

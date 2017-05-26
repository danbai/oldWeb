'use strict'

import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select, Modal } from 'antd'
import _ from 'underscore'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class Basic extends Component {
    constructor(props) {
        super(props)
        this.state = {
            basicSettings: {
                pms_protocol: "",
                wakeup_prompt: "",
                pms_addr: "",
                ucm_port: "",
                username: "",
                password: ""
            },
            openPort: ["22"],
            usedPort: ["22"],
            rangeUsedPort: []
        }
    }
    componentDidMount() {
        this._getUsedPort()
        this._getBasicSettings()
    }
    componentWillUnmount() {

    }
    _checkOpenPort = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        let openPort = this.state.usedPort
        openPort = _.without(openPort, this.state.basicSettings.ucm_port)

        if (value && _.indexOf(openPort, value) > -1) {
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
    _gotoPromptOk = () => {
        browserHistory.push('/pbx-settings/voicePrompt/2')
    }
    _gotoPrompt = () => {
        const { formatMessage } = this.props.intl
        const __this = this
        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG28"})})}} ></span>,
            onOk() {
                __this._gotoPromptOk()
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
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
    _getOpenPort = () => {
        let openPort = this.state.openPort
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getNetstatInfo' },
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = data.response
                    const netstat = response.netstat
                    
                    netstat.map(function(item) {
                        if ($.inArray(item.port, openPort) > -1) {

                        } else {
                            openPort.push(item.port)
                        }
                    })
                }
            }.bind(this)
        })
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getSIPTCPSettings' },
            async: false,
            type: "json",
            error: function(jqXHR, textStatus, errorThrown) {
                // top.dialog.dialogMessage({
                //     type: 'error',
                //     content: errorThrown
                // });
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    let tlsbindaddr = data.response.sip_tcp_settings.tlsbindaddr
                    let tcpbindaddr = data.response.sip_tcp_settings.tcpbindaddr

                    if (tlsbindaddr) {
                        let tlsPort = tlsbindaddr.split(":")[1]

                        if (tlsPort && !($.inArray(tlsPort, openPort) > -1)) {
                            openPort.push(tlsPort)
                        }
                    }

                    if (tcpbindaddr) {
                        let tcpPort = tcpbindaddr.split(":")[1]

                        if (tcpPort && !($.inArray(tcpPort, openPort) > -1)) {
                            openPort.push(tcpPort)
                        }
                    }
                }
            }
        })

        this.setState({
            openPort: openPort
        })
    }
    _getBasicSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getPMSSettings' },
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        basicSettings = res.pms_settings
                        if (!basicSettings.pms_protocol) {
                            basicSettings.pms_protocol = 'disable'
                        }
                        let openPort = this.state.openPort
                        if (basicSettings.ucm_port) {
                            openPort = _.without(openPort, basicSettings.ucm_port)
                        }
                    this.setState({
                        basicSettings: basicSettings,
                        openPort: openPort
                    })
                }
            }.bind(this)
        })
    }
    _onChangeProtocol = (e) => {
        const basicSettings = this.state.basicSettings
        basicSettings.pms_protocol = e
        this.setState({
            basicSettings: basicSettings
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const basicSettings = this.state.basicSettings
        const fileList = this.props.fileList

        if (this.props.basicLoad) {
            this._getBasicSettings()
            this.props.setBasicLoad(false)
        }

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }

        const formItemPromptLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 9 }
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG5246" />}>
                                    <span>{formatMessage({id: "LANG5246"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('pms_protocol', {
                                rules: [],
                                initialValue: basicSettings.pms_protocol
                            })(
                                <Select onChange={ this._onChangeProtocol }>
                                    <Option value="disable">{ formatMessage({id: "LANG2770"}) }</Option>
                                    <Option value="hmobile">Hmobile</Option>
                                    <Option value="mitel">Mitel</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            className={ basicSettings.pms_protocol === "disable" || basicSettings.pms_protocol.value === "disable" ? "hidden" : "display-block" }
                            { ...formItemPromptLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG4859" />}>
                                    <span>{formatMessage({id: "LANG4859"})}</span>
                                </Tooltip>
                            }>
                            <Row>
                                <Col span={16}>
                                    { getFieldDecorator('wakeup_prompt', {
                                        rules: [],
                                        initialValue: basicSettings.wakeup_prompt
                                    })(
                                        <Select>
                                            {
                                                fileList.map(function(item) {
                                                    return <Option
                                                            key={ item.text }
                                                            value={ item.val }>
                                                            { item.text }
                                                        </Option>
                                                    }
                                                )
                                            }
                                        </Select>
                                    ) }
                                </Col>
                                <Col span={6} offset={1} >
                                    <a className="prompt_setting" onClick={ this._gotoPrompt } >{ formatMessage({id: "LANG1484"}) }</a>
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem
                            className={ basicSettings.pms_protocol === "hmobile" || basicSettings.pms_protocol.value === "hmobile" ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG4940" />}>
                                    <span>{formatMessage({id: "LANG4860"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('pms_addr', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: basicSettings.pms_protocol === "hmobile" || basicSettings.pms_protocol.value === "hmobile",
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.host(data, value, callback, formatMessage, 'IP or URL')
                                    }
                                }],
                                initialValue: basicSettings.pms_addr
                            })(
                                <Input maxLength="127" />
                            ) }
                        </FormItem>
                        <FormItem
                            className={ basicSettings.pms_protocol === "disable" || basicSettings.pms_protocol.value === "disable" ? "hidden" : "display-block" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG4934" />}>
                                    <span>{formatMessage({id: "LANG4880"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('ucm_port', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: basicSettings.pms_protocol === "disable" || basicSettings.pms_protocol.value === "disable" ? false : true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        basicSettings.pms_protocol === "disable" || basicSettings.pms_protocol.value === "disable" ? callback() : Validator.range(data, value, callback, formatMessage, 1, 65535)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        basicSettings.pms_protocol === "disable" || basicSettings.pms_protocol.value === "disable" ? callback() : Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: basicSettings.pms_protocol === "disable" || basicSettings.pms_protocol.value === "disable" ? this._doNothing() : this._checkOpenPort
                                }],
                                initialValue: basicSettings.ucm_port
                            })(
                                <Input min={1} max={65535} maxLength="6" />
                            ) }
                        </FormItem>
                        <FormItem
                            className={ basicSettings.pms_protocol === "hmobile" || basicSettings.pms_protocol.value === "hmobile" ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG72" />}>
                                    <span>{formatMessage({id: "LANG72"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('username', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: basicSettings.pms_protocol === "hmobile" || basicSettings.pms_protocol.value === "hmobile",
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: basicSettings.username
                            })(
                                <Input maxLength="64" />
                            ) }
                        </FormItem>
                        <FormItem
                            className={ basicSettings.pms_protocol === "hmobile" || basicSettings.pms_protocol.value === "hmobile" ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG73" />}>
                                    <span>{formatMessage({id: "LANG73"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('password', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: basicSettings.pms_protocol === "hmobile" || basicSettings.pms_protocol.value === "hmobile",
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: basicSettings.password
                            })(
                                <Input maxLength="64" />
                            ) }
                        </FormItem>
                        <FormItem
                            className={ basicSettings.pms_protocol === "hmobile" || basicSettings.pms_protocol.value === "hmobile" ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG5459" />}>
                                    <span>{formatMessage({id: "LANG5459"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('site', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: basicSettings.pms_protocol === "hmobile" || basicSettings.pms_protocol.value === "hmobile",
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        basicSettings.pms_protocol === "hmobile" || basicSettings.pms_protocol.value === "hmobile" ? Validator.letterDigitUndHyphen(data, value, callback, formatMessage) : callback()
                                    }
                                }],
                                initialValue: basicSettings.site
                            })(
                                <Input maxLength="64" />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

Basic.propTypes = {
}

export default injectIntl(Basic)

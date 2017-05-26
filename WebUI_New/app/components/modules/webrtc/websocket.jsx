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
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class WebSocket extends Component {
    constructor(props) {
        super(props)

        this.state = {
            settings: [],
            enabled: false,
            oldTLSPort: '',
            oldHTTPPort: '',
            tlsenable: false
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
        this._getSIPWebRTCHttpSettings()
    }
    _getSIPWebRTCHttpSettings = () => {
        let settings = []
        let oldTLSPort = ''
        let oldHTTPPort = ''
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'json',
            method: 'post',
            url: api.apiHost,
            data: {
                action: 'getSIPWebRTCHttpSettings'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    settings = response.webrtc_http_settings || []

                    oldHTTPPort = settings.bindport

                    if (settings.tlsbindaddr) {
                        oldTLSPort = settings.tlsbindaddr.split(':')[1]

                        if (UCMGUI.isIPv6(settings.tlsbindaddr)) {
                            oldTLSPort = settings.tlsbindaddr.split("]:")[1]
                        }
                    }

                    let httpPort = settings.bindport ? settings.bindport : '8088'
                    let httpAddr = settings.bindaddr ? settings.bindaddr : '0.0.0.0'
                    let tlsbindaddr = settings.tlsbindaddr ? settings.tlsbindaddr : '0.0.0.0:8443'

                    settings.websocket_interface = ('ws://' + httpAddr + ':' + httpPort + '/ws')
                    settings.secure_websocket_interface = ('wss://' + tlsbindaddr + '/ws')

                    this.setState({
                        settings: settings,
                        oldTLSPort: oldTLSPort,
                        oldHTTPPort: oldHTTPPort,
                        enabled: settings.enabled === 'yes',
                        tlsenable: settings.tlsenable === 'yes'
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onChangeHTTP = (e) => {
        this.setState({
            enabled: e.target.checked
        })
    }
    _onChangeTLS = (e) => {
        this.setState({
            tlsenable: e.target.checked
        })
    }
    render() {
        const form = this.props.form
        const settings = this.state.settings || {}
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        const formItemRowLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="content">
                <div className="ant-form">
                    <FormItem
                        { ...formItemRowLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4429" /> }>
                                    <span>{ formatMessage({id: "LANG4398"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('ws_enabled', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: this.state.enabled
                        })(
                            <Checkbox onChange={ this._onChangeHTTP } />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemRowLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4430" /> }>
                                    <span>{ formatMessage({id: "LANG4399"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('ws_bindaddr', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: this.state.enabled,
                                message: formatMessage({id: "LANG2150"})
                            }, { 
                                validator: (data, value, callback) => {
                                    Validator.ipAddress(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: settings.bindaddr
                        })(
                            <Input />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemRowLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4431" /> }>
                                    <span>{ formatMessage({id: "LANG4400"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('ws_bindport', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: this.state.enabled,
                                message: formatMessage({id: "LANG2150"})
                            }, { 
                                validator: (data, value, callback) => {
                                    Validator.range(data, value, callback, formatMessage, 1, 65535)
                                }
                            }],
                            initialValue: settings.bindport
                        })(
                            <Input />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemRowLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4432" /> }>
                                    <span>{ formatMessage({id: "LANG1868"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('ws_tlsenable', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: this.state.tlsenable
                        })(
                            <Checkbox onChange={ this._onChangeTLS } />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemRowLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4433" /> }>
                                    <span>{ formatMessage({id: "LANG1856"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('ws_tlsbindaddr', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: this.state.tlsenable,
                                message: formatMessage({id: "LANG2150"})
                            }, { 
                                validator: (data, value, callback) => {
                                    Validator.ipAddressPort(data, value, callback, formatMessage)
                                }
                            }],
                            initialValue: settings.tlsbindaddr
                        })(
                            <Input />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemRowLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4434" /> }>
                                    <span>{ formatMessage({id: "LANG4422"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('ws_websocket_interface', {
                            rules: [],
                            initialValue: settings.websocket_interface
                        })(
                            <Input disabled />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemRowLayout }
                        label={(
                            <span>
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4435" /> }>
                                    <span>{ formatMessage({id: "LANG4423"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('ws_secure_websocket_interface', {
                            rules: [],
                            initialValue: settings.secure_websocket_interface
                        })(
                            <Input disabled />
                        ) }
                    </FormItem>
                </div>
            </div>
        )
    }
}

export default injectIntl(WebSocket)
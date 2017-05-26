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
            settings: []
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
        this._getSIPWebRTCHttpSettings()
    }
    _getSIPWebRTCHttpSettings = () => {
        let settings = []
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

                    this.setState({
                        settings: settings
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onChangeExtensionType = (value) => {
        if (value === 'fxs') {
            this.setState({
                add_method: 'single'
            })
        }

        this.props.onExtensionTypeChange(value)
    }
    _onChangeAddMethod = (value) => {
        this.setState({
            add_method: value
        })
    }
    _onChangeQualify = (e) => {
        this.setState({
            enable_qualify: e.target.checked
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
                        { getFieldDecorator('enabled', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: settings.enabled === 'yes'
                        })(
                            <Checkbox />
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
                        { getFieldDecorator('bindaddr', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
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
                        { getFieldDecorator('bindport', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
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
                        { getFieldDecorator('tlsenable', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: settings.tlsenable === 'yes'
                        })(
                            <Checkbox />
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
                        { getFieldDecorator('tlsbindaddr', {
                            rules: [],
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
                        { getFieldDecorator('websocket_interface', {
                            rules: [],
                            initialValue: settings.websocket_interface
                        })(
                            <Input />
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
                        { getFieldDecorator('secure_websocket_interface', {
                            rules: [],
                            initialValue: settings.secure_websocket_interface
                        })(
                            <Input />
                        ) }
                    </FormItem>
                </div>
            </div>
        )
    }
}

export default injectIntl(WebSocket)
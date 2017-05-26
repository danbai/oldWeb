'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { Form, Input, Checkbox, message, Tooltip } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

const FormItem = Form.Item

class ConferenceSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            conferenceSettings: {}
        }
    }
    componentDidMount() {
        this._getConferenceSettings()
    }
    _getConferenceSettings = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getConfbridgeSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const response = res.response || {}
                const conferenceSettings = response.confbridge_settings || {}

                this.setState({
                    conferenceSettings: conferenceSettings
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/conference')
    }
    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const extensionId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = values

                action.action = 'updateConfbridgeSettings'
                action.talk_detection_events = this.props.form.getFieldValue('talk_detection_events') ? 'yes' : 'no'

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
                            message.success(successMessage)
                        }

                        this._handleCancel()
                    }.bind(this)
                })
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        let conferenceSettings = this.state.conferenceSettings || {}

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG5097"})})

        return (
            <div className="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG5097"}) } onSubmit={ this._handleSubmit } onCancel={ this._handleCancel } isDisplay='display-block' />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5099" /> }>
                                    <span>{ formatMessage({id: "LANG5098"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('talk_detection_events', {
                                valuePropName: 'checked',
                                initialValue: conferenceSettings.talk_detection_events === 'yes'
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5101" /> }>
                                    <span>{ formatMessage({id: "LANG5100"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('dsp_talking_threshold', {
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
                                        Validator.range(data, value, callback, formatMessage, 100, 250)
                                    }
                                }],
                                initialValue: conferenceSettings.dsp_talking_threshold
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5103" /> }>
                                    <span>{ formatMessage({id: "LANG5102"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('dsp_silence_threshold', {
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
                                        Validator.range(data, value, callback, formatMessage, 100, 2500)
                                    }
                                }],
                                initialValue: conferenceSettings.dsp_silence_threshold
                            })(
                                <Input />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(ConferenceSettings))
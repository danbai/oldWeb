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

class CleanSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            cleanEnable: false,
            cleanSettings: {}
        }
    }
    componentDidMount() {
        this._getCleanSettings()
    }
    _getCleanSettings = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getCleanerValue'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const response = res.response || {}

                this.setState({
                    cleanSettings: response,
                    cleanEnable: response.Pen_auto_clean_scheduleconf === '1'
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCleanEnableChange = (e) => {
        this.setState({
            cleanEnable: e.target.checked
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

                action.action = 'setCleanerValue'
                action.Pen_auto_clean_scheduleconf = action.Pen_auto_clean_scheduleconf ? '1' : '0'

                $.ajax({
                    url: api.apiHost,
                    method: "POST",
                    data: action,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            $.ajax({
                                url: api.apiHost,
                                method: 'POST',
                                data: {
                                    action: 'reloadCrontabs',
                                    crontabjobs: ''
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

        let cleanSettings = this.state.cleanSettings || {}

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG4277"})})

        return (
            <div className="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG4277"}) } onSubmit={ this._handleSubmit } onCancel={ this._handleCancel } isDisplay='display-block' />
                <Form>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <Tooltip title={ <FormattedHTMLMessage id="LANG4280" /> }>
                                <span>{ formatMessage({id: "LANG4278"}) }</span>
                            </Tooltip>
                        )}
                    >
                        { getFieldDecorator('Pen_auto_clean_scheduleconf', {
                            valuePropName: 'checked',
                            initialValue: cleanSettings.Pen_auto_clean_scheduleconf === '1'
                        })(
                            <Checkbox onChange={ this._handleCleanEnableChange } />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1434" /> }>
                                <span>{ formatMessage({id: "LANG4279"}) }</span>
                            </Tooltip>
                        )}
                    >
                        { getFieldDecorator('Phour_clean_scheduleconf', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: this.state.cleanEnable,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    this.state.cleanEnable ? Validator.digits(data, value, callback, formatMessage) : callback()
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this.state.cleanEnable ? Validator.range(data, value, callback, formatMessage, 0, 23) : callback()
                                }
                            }],
                            initialValue: cleanSettings.Phour_clean_scheduleconf
                        })(
                            <Input disabled={ !this.state.cleanEnable } />
                        ) }
                    </FormItem>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <Tooltip title={ <FormattedHTMLMessage id="LANG1436" /> }>
                                <span>{ formatMessage({id: "LANG1435"}) }</span>
                            </Tooltip>
                        )}
                    >
                        { getFieldDecorator('Pclean_scheduleconf_interval', {
                            getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                required: this.state.cleanEnable,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    this.state.cleanEnable ? Validator.digits(data, value, callback, formatMessage) : callback()
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    this.state.cleanEnable ? Validator.range(data, value, callback, formatMessage, 1, 30) : callback()
                                }
                            }],
                            initialValue: cleanSettings.Pclean_scheduleconf_interval
                        })(
                            <Input disabled={ !this.state.cleanEnable } />
                        ) }
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(CleanSettings))
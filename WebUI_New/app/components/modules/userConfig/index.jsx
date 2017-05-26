'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, message, Tooltip } from 'antd'

const FormItem = Form.Item

class UserConfig extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userConfig: {}
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                "action": "getUser",
                "user_name": localStorage.getItem('username')
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response.user_name || {}
                    this.setState({
                        userConfig: response
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = () => {
        this.props.form.resetFields()
        this._getInitData()
        // browserHistory.push('/user-value-added-features/userConfig')
    }
    _handleSubmit = () => {
        let successMessage = ''
        const { formatMessage } = this.props.intl

        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                let action = values
                action["user_name"] = JSON.parse(localStorage.getItem('username'))
                action["user_id"] = JSON.parse(localStorage.getItem('user_id'))
                action["action"] = "updateUser"

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
                        }

                        this._getInitData()
                    }.bind(this)
                })
            }
        })
    }
    _jumpChangePwd = () => {
        browserHistory.push('/user-basic-information/changePassword')
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const userConfig = this.state.userConfig || {}

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const title = formatMessage({id: "LANG5614"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block' />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2844" /> }>
                                        <span>{ formatMessage({id: "LANG2809"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('user_name', {
                                initialValue: localStorage.getItem('username')
                            })(
                                <Input disabled={ true } maxLength="32" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2847" /> }>
                                        <span>{ formatMessage({id: "LANG2812"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('department', {
                                initialValue: userConfig.department
                            })(
                                <Input maxLength="32" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2852" /> }>
                                        <span>{ formatMessage({id: "LANG95"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('fax', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: userConfig.fax
                            })(
                                <Input maxLength="32" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1082" /> }>
                                        <span>{ formatMessage({id: "LANG1081"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <a href="#" onClick={ this._jumpChangePwd }>{ formatMessage({id: "LANG4203"}) }</a>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2849" /> }>
                                        <span>{ formatMessage({id: "LANG2817"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('first_name', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.cidName(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 1)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 32)
                                    }
                                }],
                                initialValue: userConfig.first_name
                            })(
                                <Input maxLength="32" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2848" /> }>
                                        <span>{ formatMessage({id: "LANG2813"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('last_name', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.cidName(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.minlength(data, value, callback, formatMessage, 1)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 32)
                                    }
                                }],
                                initialValue: userConfig.last_name
                            })(
                                <Input maxLength="256" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2850" /> }>
                                        <span>{ formatMessage({id: "LANG2814"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('family_number', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: userConfig.family_number
                            })(
                                <Input maxLength="32" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2851" /> }>
                                        <span>{ formatMessage({id: "LANG2815"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('phone_number', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: userConfig.phone_number
                            })(
                                <Input maxLength="32" />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(UserConfig))
'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { Form, Input, message, Tooltip, Button } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

const FormItem = Form.Item

class AuthSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            accountSettings: {}
        }
    }
    componentDidMount() {
        this._getGoogleAuthor()
    }
    _getGoogleAuthor = () => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'getGoogleAuthorizationInfo'
            },
            dataType: 'json',
            success: function(res) {
                const response = res.response.googlecalendar || {}

                this.setState({
                    accountSettings: response
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _resetAuth = () => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'resetOauthJsonFile'
            },
            dataType: 'json',
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    this.props.form.setFieldsValue({
                        client_id: '',
                        client_secret: ''
                    })
                }
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
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = values

                action.action = 'updateOauthJsonFile'

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
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }
        const formItemLayoutBtn = {
            wrapperCol: { offset: 4, span: 6 }
        }

        let accountSettings = this.state.accountSettings || {}

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG4390"})})

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG4390"}) }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block' />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4392" /> }>
                                    <span>{ formatMessage({id: "LANG3514"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('client_id', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: accountSettings.client_id
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4392" /> }>
                                    <span>{ formatMessage({id: "LANG3515"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('client_secret', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: accountSettings.client_secret
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayoutBtn }
                        >
                            <Button type="Ghost" size="default" onClick={ this._resetAuth }>
                                { formatMessage({id: "LANG750"}) }
                            </Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(AuthSettings))
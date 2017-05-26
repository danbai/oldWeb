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
import { Form, Input, message, Checkbox, Tooltip, Select } from 'antd'

const Option = Select.Option
const FormItem = Form.Item

class UserCrmUserSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            crmSettings: {},
            salesforceCalss: false,
            isUpdate: false
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let crmSettings = this.state.crmSettings || {}
        let salesforceCalss = this.state.salesforceCalss || false
        let data = {} 
        let isUpdate = this.state.isUpdate || false

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {"action": "getCRMSettings"},
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    if (response.crm_settings.crm_module === "salesforce") {
                        salesforceCalss = true
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        data["action"] = "getCRMUserSettings"
        data["extension"] = JSON.parse(localStorage.getItem('username'))

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: data,
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    crmSettings = response.extension || []
                    if (crmSettings.length === 0) {
                        isUpdate = false
                    } else {
                        if (crmSettings.enable_crm === "yes") {
                            crmSettings.enable_crm = true
                        } else {
                            crmSettings.enable_crm = false
                        }
                        isUpdate = true
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            crmSettings: crmSettings,
            salesforceCalss: salesforceCalss,
            isUpdate: isUpdate
        })
    }
    _handleCancel = () => {
        this.props.form.resetFields()
        this._getInitData()
        // browserHistory.push('/user-value-added-features/userCrmUserSettings')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const disaId = this.props.params.id

        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                let action = {}
                if (values.enable_crm) {
                    action = values
                    action.enable_crm = "yes"
                } else {
                    action.enable_crm = "no"
                }

                if (this.state.isUpdate) {
                    action.action = "updateCRMUserSettings"
                } else {
                    action.action = "addCRMUserSettings"
                }
                action.extension = JSON.parse(localStorage.getItem('username'))

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
                            this._getInitData()
                        }
                    }.bind(this)
                })
            }
        })
    }
    _chanegCRM = (value) => {
        let data = this.state.crmSettings
        data["enable_crm"] = value.target.checked

        this.setState({
            crmSettings: data
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const crmSettings = this.state.crmSettings || {}

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const title = formatMessage({id: "LANG5225"})

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
                    isDisplay='display-block'
                />
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG5226" /> }>
                                        <span>{ formatMessage({id: "LANG5226"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('enable_crm', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: crmSettings.enable_crm
                            })(
                                <Checkbox onChange={ this._chanegCRM } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG72" /> }>
                                        <span>{ formatMessage({id: "LANG72"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('crm_username', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: crmSettings.crm_username
                            })(
                                <Input disabled={ !crmSettings.enable_crm } maxLength="64" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG73" /> }>
                                        <span>{ formatMessage({id: "LANG73"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('crm_password', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: crmSettings.crm_password
                            })(
                                <Input disabled={ !crmSettings.enable_crm } maxLength="64" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG5233" /> }>
                                        <span>{ formatMessage({id: "LANG5113"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                            className={ this.state.salesforceCalss ? "display-block" : "hidden" }
                        >
                            { getFieldDecorator('security_token', {
                                getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                rules: [{
                                    required: this.state.salesforceCalss && crmSettings.enable_crm,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: crmSettings.security_token
                            })(
                                <Input disabled={ !crmSettings.enable_crm } maxLength="128" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG5233" /> }>
                                        <span>{ formatMessage({id: "LANG5233"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('login_status', {
                                rules: []
                            })(
                                <span style={crmSettings.login_status === "login" ? { color: 'green' } : { color: 'grey' }}>{ crmSettings.login_status === "login" ? formatMessage({id: "LANG5186"}) : (crmSettings.login_status === "logout" ? formatMessage({id: "LANG5187"}) : '') }</span>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(UserCrmUserSettings))
'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl, formatMessage } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select, Modal } from 'antd'
import Validator from "../../api/validator"

const FormItem = Form.Item

class smtpSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email_settings: {},
            visible: false
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {

    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let email_settings = this.state.email_settings
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getEmailSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    email_settings = response.email_settings || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            email_settings: email_settings
        })
    }
    _onChangeType = (value) => {
        let email_settings = this.state.email_settings
        email_settings.smtp_type = value
        this.setState({
            email_settings: email_settings
        })
    }
    _testEmail = () => {
        this.setState({
            visible: true
        })
    }
    _handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    _sendTestEmail = () => {
        const { getFieldValue, resetFields } = this.props.form
        const { formatMessage } = this.props.intl
        this.props.form.validateFields({ force: true }, (err, values) => {
            if (err && err.hasOwnProperty('recipients')) {
            } else {
               const email_addr = getFieldValue('recipients')
               let action = {}
               action.action = 'sendTestMail'
               action.email_addr = email_addr
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
                           message.success(formatMessage({id: "LANG873"}))
                           resetFields(['recipients'])
                       }
       
                       this._handleCancel()
                   }.bind(this)
               })
            }
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const email_settings = this.state.email_settings
        const me = this
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }
        const formItemModalLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        if (this.props.smtpLoad) {
            this._getInitData()
            this.props.setSmtpLoad(false)
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_smtp_tls_enable"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2047" />}>
                                    <span>{formatMessage({id: "LANG2046"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('smtp_tls_enable', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: email_settings.smtp_tls_enable === "yes"
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_smtp_type"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2049" />}>
                                    <span>{formatMessage({id: "LANG84"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('smtp_type', {
                                rules: [],
                                initialValue: email_settings.smtp_type
                            })(
                                <Select onChange={ this._onChangeType } >
                                     <Option value="client">{formatMessage({id: "LANG2044"})}</Option>
                                     <Option value="mta">{formatMessage({id: "LANG2045"})}</Option>
                                 </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_mail_context_mode"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG5232" />}>
                                    <span>{formatMessage({id: "LANG5231"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('mail_context_mode', {
                                rules: [],
                                initialValue: email_settings.mail_context_mode
                            })(
                                <Select>
                                     <Option value="html">{formatMessage({id: "LANG5230"})}</Option>
                                     <Option value="txt">{formatMessage({id: "LANG5229"})}</Option>
                                 </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_smtp_domain"
                            className={ email_settings.smtp_type === 'client' ? 'hidden' : 'display-block' }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2051" />}>
                                    <span>{formatMessage({id: "LANG2050"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('smtp_domain', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: email_settings.smtp_type === 'client' ? false : true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        email_settings.smtp_type === 'client' ? callback() : Validator.host(data, value, callback, formatMessage, "LANG2050")
                                    }
                                }],
                                initialValue: email_settings.smtp_domain
                            })(
                                <Input maxLength="60" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_smtp_server"
                            className={ email_settings.smtp_type === 'mta' ? 'hidden' : 'display-block' }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2053" />}>
                                    <span>{formatMessage({id: "LANG2052"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('smtp_server', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: email_settings.smtp_type === 'mta' ? false : true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        email_settings.smtp_type === 'mta' ? callback() : Validator.host(data, value, callback, formatMessage, "LANG2052")
                                    }
                                }],
                                initialValue: email_settings.smtp_server
                            })(
                                <Input maxLength="60" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_enable_auth"
                            className={ email_settings.smtp_type === 'mta' ? 'hidden' : 'display-block' }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG5445" />}>
                                    <span>{formatMessage({id: "LANG5444"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('enable_auth', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: email_settings.smtp_type === 'mta' ? false : true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                valuePropName: "checked",
                                initialValue: email_settings.enable_auth === "yes"
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_smtp_username"
                            className={ email_settings.smtp_type === 'mta' ? 'hidden' : 'display-block' }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2054" />}>
                                    <span>{formatMessage({id: "LANG72"})}</span>
                                </Tooltip>
                            }>
                            <Input name="smtp_username" className="hidden"></Input>
                            { getFieldDecorator('smtp_username', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: email_settings.smtp_type === 'mta' ? false : true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: email_settings.smtp_username
                            })(
                                <Input maxLength="60" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_smtp_password"
                            className={ email_settings.smtp_type === 'mta' ? 'hidden' : 'display-block' }
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2055" />}>
                                    <span>{formatMessage({id: "LANG73"})}</span>
                                </Tooltip>
                            }>
                            <Input type="password" name="smtp_password" className="hidden"></Input>
                            { getFieldDecorator('smtp_password', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: email_settings.smtp_type === 'mta' ? false : true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: email_settings.smtp_password
                            })(
                                <Input type="password" maxLength="60" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_fromstring"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2255" />}>
                                    <span>{formatMessage({id: "LANG2271"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('fromstring', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: email_settings.fromstring
                            })(
                                <Input maxLength="64" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_serveremail"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={<FormattedHTMLMessage id="LANG2057" />}>
                                    <span>{formatMessage({id: "LANG2056"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('serveremail', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.email(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: email_settings.serveremail
                            })(
                                <Input maxLength="120" />
                            ) }
                        </FormItem>
                        <div className='top-content'>
                            <Button onClick={ this._testEmail } >
                                { formatMessage({id: "LANG2273"}) }
                            </Button>
                            <Modal 
                                title={ formatMessage({id: "LANG2273"}) }
                                visible={ this.state.visible }
                                maskClosable={false}
                                onOk={ this._sendTestEmail } 
                                onCancel={ this._handleCancel }
                                okText={ formatMessage({id: "LANG2273"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }>
                                <div className='content' >
                                    <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2264"})}} ></span>
                                </div>
                                <FormItem
                                    ref="div_recipients"
                                    { ...formItemModalLayout }
                                    label={                            
                                        <Tooltip title={<FormattedHTMLMessage id="LANG126" />}>
                                            <span>{formatMessage({id: "LANG126"})}</span>
                                        </Tooltip>
                                    }>
                                    { getFieldDecorator('recipients', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: me.state.visible,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: (data, value, callback) => {
                                                me.state.visible ? Validator.email(data, value, callback, formatMessage) : callback()
                                            }
                                        }],
                                        initialValue: ""
                                    })(
                                        <Input maxLength="128" />
                                    ) }
                                </FormItem>
                            </Modal>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

smtpSettings.propTypes = {
}

export default injectIntl(smtpSettings)

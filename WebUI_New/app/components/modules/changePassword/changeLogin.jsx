'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Button, message, Modal, Input, Tag, Select, Form, Row, Col, Tooltip, Checkbox } from 'antd'
import Validator from "../../api/validator"

const confirm = Modal.confirm
const Option = Select.Option
const FormItem = Form.Item

class ChangeLogin extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user_name: {},
            enableEmail: true,
            enablePassword: true
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const username = localStorage.username

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getUser',
                user_name: username,
                user_password: '',
                email: ''
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const user_name_val = response.user_name || []

                    this.setState({
                        user_name: user_name_val
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onChangePassword = (e) => {
        console.log('change password: ', e.target.checked)

        if (e.target.checked) {
            this.setState({
                enablePassword: true
            })
        } else {
            this.setState({
                enablePassword: false
            })
        }
    }
    _onChangeEmail = (e) => {
        console.log('change email: ', e.target.checked)

        if (e.target.checked) {
            this.setState({
                enableEmail: true
            })
        } else {
            this.setState({
                enableEmail: false
            })
        }
    }
    _gotoEmailTemplate = () => {
        const { formatMessage } = this.props.intl

        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG4576"})})}} ></span>,
            onOk() {
                browserHistory.push('/system-settings/emailSettings/template')
            },
            onCancel() {}
        })
    }
    _checkSame = (data, value, callback, formatMessage) => {
        const { getFieldValue } = this.props.form
        let other = getFieldValue("user_password")
        if (value && value !== other) {
            callback(formatMessage({id: "LANG2159"}))
        } else {
            callback()
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        let user_name = this.state.user_name
        let model_info = JSON.parse(localStorage.getItem('model_info'))
        let htmlPrivilege = JSON.parse(localStorage.getItem('html_privilege'))
        let emailPrivilege = htmlPrivilege.emailSettings === 1

        if (this.props.passwordLoad) {
            this._getInitData()
            this.props.setLoadFunc('passwordLoad', false)
        }

        let formItemLayout = {
                labelCol: { span: 3 },
                wrapperCol: { span: 6 }
            }

        let formItemWithTempLayout = {
                labelCol: { span: 3 },
                wrapperCol: { span: 18 }
            }

        let title = formatMessage({id: "LANG5468"}, {
                    0: formatMessage({id: "LANG55"}),
                    1: formatMessage({id: "LANG2032"})
                })

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_oldpass"
                            { ...formItemLayout }
                            label={
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1989" /> }>
                                    <span>{ formatMessage({id: "LANG1989"}) }</span>
                                </Tooltip>
                            }
                        >
                            { getFieldDecorator('old_password', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{ 
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: ''
                            })(
                                <Input type="password" />
                            ) }
                        </FormItem>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG55"}) }</span>
                        </div>
                        <Row className="row-section-content">
                            <FormItem
                                { ...formItemLayout }
                                label={
                                    <span>{ formatMessage({id: "LANG5466"}) }</span>
                                }
                            >
                                { getFieldDecorator('enablePassword', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: true
                                })(
                                    <Checkbox
                                        onChange={ this._onChangePassword }
                                        checked={ this.state.enablePassword }
                                    />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_newpass"
                                { ...formItemLayout }
                                className= { this.state.enablePassword ? 'display-block' : 'hidden' }
                                label={
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1990" /> }>
                                        <span>{ formatMessage({id: "LANG1990"}) }</span>
                                    </Tooltip>
                                }
                            >
                                { getFieldDecorator('user_password', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{ 
                                        required: this.state.enablePassword === true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.enablePassword ? Validator.minlength(data, value, callback, formatMessage, 8) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.enablePassword ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.enablePassword ? Validator.checkAlphanumericPw(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.enablePassword ? Validator.keyboradNoSpace(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: ''
                                })(
                                    <Input maxLength={32} type="password" />
                                ) }
                            </FormItem>
                            <FormItem
                                ref="div_newpass_rep"
                                { ...formItemLayout }
                                className= { this.state.enablePassword ? 'display-block' : 'hidden' }
                                label={
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1991" /> }>
                                        <span>{ formatMessage({id: "LANG1991"}) }</span>
                                    </Tooltip>
                                }
                            >
                                { getFieldDecorator('newpass_rep', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{ 
                                        required: this.state.enablePassword === true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.enablePassword ? Validator.minlength(data, value, callback, formatMessage, 8) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.enablePassword ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.enablePassword ? Validator.checkAlphanumericPw(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.enablePassword ? this._checkSame(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.enablePassword ? Validator.keyboradNoSpace(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: ''
                                })(
                                    <Input maxLength={32} type="password" />
                                ) }
                            </FormItem>
                        </Row>
                        <div className="section-title">
                            <span>{ formatMessage({id: "LANG4203"}) }</span>
                        </div>
                        <Row className="row-section-content">
                            <FormItem
                                ref="div_email"
                                { ...formItemWithTempLayout }
                                label={
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4192" /> }>
                                        <span>{ formatMessage({id: "LANG1081"}) }</span>
                                    </Tooltip>
                                }
                            >
                                <Col span={ 8 }>
                                    <FormItem>
                                        { getFieldDecorator('email', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{ 
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (rule, value, callback) => {
                                                    Validator.email(rule, value, callback, formatMessage)
                                                }
                                            }],
                                            initialValue: user_name.email ? user_name.email : ''
                                        })(
                                            <Input />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 6 } offset={ 1 } className={ emailPrivilege ? 'display-block' : 'hidden' }>
                                    <a className="email_template" onClick={ this._gotoEmailTemplate } >{ formatMessage({id: "LANG4576"}) }</a>
                                </Col>
                            </FormItem>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

export default injectIntl(ChangeLogin)

'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import ChangeLogin from './changeLogin'
import LoginSetting from './loginSetting'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Tabs, message, Modal } from 'antd'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'

const TabPane = Tabs.TabPane
const confirm = Modal.confirm
const FormItem = Form.Item

class ChangePassword extends Component {
    constructor(props) {
        super(props)

        this.state = {
            activeKey: "ChangeLogin",
            passwordLoad: false,
            loginLoad: false
        }
    }
    componentDidMount() {
    }
    _onChange = (activeKey) => {
        this.setState({
            activeKey
        })
    }
    _handleCancel = () => {
        if (this.state.activeKey === "ChangeLogin") {
            this.props.form.resetFields(['old_password', 'enablePassword', 'user_password', 'newpass_rep', 'email'])
            this.setState({
                passwordLoad: true
            })
        } else if (this.state.activeKey === "LoginSetting") {
            this.props.form.resetFields(['cookie_timeout', 'login_max_num', 'login_band_time'])
            this.setState({
                loginLoad: true
            })
        }
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl
        const { resetFields } = this.props.form
        const userid = localStorage.getItem('user_id')

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            console.log('Received values of form: ', values)

            let me = this
            let refs = this.refs
            let activeKey = this.state.activeKey

            if (activeKey === "ChangeLogin") {
                let action = {}

                action.user_id = userid
                action.action = 'updateUser'
                action.old_password = values.old_password

                if (values.enablePassword) {
                    action.user_password = values.user_password
                }

                action.email = values.email

                let tmp_action = action

                // delete tmp_action.action

                tmp_action["newpass_rep"] = values.newpass_rep

                for (let key in tmp_action) {
                    if (tmp_action.hasOwnProperty(key)) {
                        let divKey = refs["div_" + key]

                        if (divKey && divKey.props &&
                            ((divKey.props.className && divKey.props.className.indexOf("hidden") === -1) ||
                            typeof divKey.props.className === "undefined")) {
                            if (!err || (err && typeof err[key] === "undefined")) {
                            } else {
                                return
                            }
                        } else if (typeof divKey === "undefined") {
                            if (!err || (err && typeof err[key] === "undefined")) {
                            } else {
                                return
                            }
                        }
                    }
                }

                delete action.newpass_rep

                message.loading(formatMessage({ id: "LANG826" }), 0)

                $.ajax({
                    data: action,
                    type: 'post',
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)
                        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG932" })}}></span>

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            if (values.enablePassword) {
                                setTimeout(function() {
                                    UCMGUI.logoutFunction.doLogout(formatMessage)
                                }, 1000)
                            }
                        }
                    }.bind(this)
                })
            } else if (activeKey === "LoginSetting") {
                let action_log = {}

                action_log.action = 'updateLoginParam'
                action_log.cookie_timeout = values.cookie_timeout * 60
                action_log.login_max_num = values.login_max_num
                action_log.login_band_time = values.login_band_time * 60

                for (let key in action_log) {
                    if (action_log.hasOwnProperty(key) && key !== "action") {
                        let divKey = refs["div_" + key]

                        if (divKey && divKey.props &&
                            ((divKey.props.className && divKey.props.className.indexOf("hidden") === -1) ||
                            typeof divKey.props.className === "undefined")) {
                            if (!err || (err && typeof err[key] === "undefined")) {
                            } else {
                                return
                            }
                        } else if (typeof divKey === "undefined") {
                            if (!err || (err && typeof err[key] === "undefined")) {
                            } else {
                                return
                            }
                        }
                    }
                }

                $.ajax({
                    type: 'post',
                    async: false,
                    url: api.apiHost,
                    data: action_log,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)
                        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                        }
                        if (!values.old_password && !values.user_password && !values.newpass_rep) {
                            resetFields(['old_password', 'user_password', 'newpass_rep'])
                        }
                        if (!values.emal) {
                            resetFields(['email'])
                        }
                    }.bind(this)
                })
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
    _setLoadFunc = (key, value) => {
        if (key === 'passwordLoad') {
            this.setState({
                passwordLoad: value
            })
        } else if (key === 'loginLoad') {
            this.setState({
                loginLoad: value
            })
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        let title = formatMessage({id: "LANG5584"})
        let model_info = JSON.parse(localStorage.getItem('model_info'))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        let content = '',
            role = localStorage.getItem('role')

        if (role === 'privilege_0' || role === 'privilege_1') {
             content = <Tabs
                            onChange={ this._onChange }
                            activeKey={ this.state.activeKey }
                            animated={ UCMGUI.initConfig.msie ? false : true }
                        >
                            <TabPane
                                key="ChangeLogin"
                                tab={ formatMessage({id: "LANG5468"}, {
                                        0: formatMessage({id: "LANG55"}),
                                        1: formatMessage({id: "LANG2032"})
                                    }) }
                            >
                                <ChangeLogin 
                                    form={ this.props.form }
                                    setLoadFunc={this._setLoadFunc}
                                    passwordLoad={ this.state.passwordLoad }
                                />
                            </TabPane>
                            <TabPane tab={ formatMessage({id: "LANG3965"}) } key="LoginSetting">
                                <LoginSetting 
                                    form={ this.props.form }
                                    setLoadFunc={this._setLoadFunc}
                                    loginLoad={ this.state.loginLoad }
                                />
                            </TabPane>
                        </Tabs>
        } else {
            content = <ChangeLogin
                        form={ this.props.form }
                        setLoadFunc={this._setLoadFunc}
                        passwordLoad={ this.state.passwordLoad }/>
        }

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    isDisplay= "display-block"
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                />
                { content }
            </div>
        )
    }
}

export default Form.create()(injectIntl(ChangePassword))

'use strict'

import $ from 'jquery'
import _ from 'underscore'
import '../../../css/login'
import md5 from "../../api/md5"
import api from "../../api/api"
import cookie from 'react-cookie'
import UCMGUI from "../../api/ucmgui"
import Footer from '../../../views/footer'
import SubscribeEvent from '../../api/subscribeEvent'
import menusData from '../../../locale/menusData.json'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { message, Select, Form, Input, Button, Row, Col, Modal, Tooltip, Menu, Dropdown, Icon } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class Login extends Component {
    constructor(props) {
        super(props)

        this.state = {
            visible: false,
            countryArr: JSON.parse(localStorage.getItem('countryArr'))
        }
    }
    _getFeatureLimits = () => {
        let limits = {}

        $.ajax({
            type: 'post',
            url: api.apiHost,
            async: false,
            data: {
                action: 'getFeatureLimits'
            },
            success: function(res) {
                const response = res.response || {}

                limits = response.feature_limits || {}

                localStorage.setItem('featureLimits', JSON.stringify(limits))
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)

                localStorage.setItem('featureLimits', JSON.stringify(limits))
            }
        })
    }
    componentDidMount() {
        // Get cursor focus
        let username = $('#username').val()

        if (username) {
            $('#password').focus()
        } else {
            $('#username').focus()
        }
    }
    componentWillReceiveProps(nextProps) {
    }
    _handleSubmit = (e) => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        let username = form.getFieldValue("username"),
            password = form.getFieldValue("password")

        if (username && password) {
            let cb = $.ajax({
                type: 'post',
                async: false,
                dataType: 'json',
                url: api.apiHost,
                data: {
                    action: 'challenge',
                    user: username
                }
            })

            const resText = JSON.parse(cb.responseText)

            if ((typeof resText === 'object') && resText.hasOwnProperty('response') && resText.response.hasOwnProperty('challenge')) {
                let challenge = resText.response.challenge,
                    md5key = md5(challenge + password),
                    obj = {
                        username: username,
                        password: password,
                        md5key: md5key
                    }

                this._login(obj)
            } else {
                this._loginError(resText)
            }
        } else {
            message.error(formatMessage({id: "LANG5657"}))
        }

        e.preventDefault()
    }
    _login = (obj) => {
        const { formatMessage } = this.props.intl

        let password = obj.password,
            username = obj.username,
            md5key = obj.md5key

        $.ajax({
            type: 'post',
            url: api.apiHost,
            dataType: 'json',
            data: {
                action: 'login',
                user: username,
                token: md5key
            },
            success: function(res) {
                if ((typeof res === 'object') && res.hasOwnProperty('status')) {
                    if (res.status === 0) {
                        cookie.save('user_id', res.response.user.user_id)
                        cookie.save('username', username)

                        localStorage.setItem('first_login', 'no')
                        localStorage.setItem('username', username)
                        localStorage.setItem('user_id', res.response.user.user_id)
                        localStorage.setItem('role', res.response.user.user_role)
                        localStorage.setItem('is_strong_password', res.response.user.is_strong_password)
                        localStorage.setItem('html_privilege', JSON.stringify(res.response.user.html_privilege))
                        localStorage.setItem('weak_password', res.response.user.weak_password)

                        if (res.response.module_switch && res.response.module_switch.hasOwnProperty('enable_module')) {
                            cookie.save('enable_module', res.response.module_switch.enable_module)
                        }

                        if ((res.response.user.user_role === 'privilege_0') && (res.response.user.is_first_login === 'yes')) {
                            localStorage.setItem('first_login', 'yes')

                            // $(this).attr({
                            //     'action': './settings_guide.html'
                            // })
                        }

                        UCMGUI.loginFunction.checkTrigger(formatMessage)

                        if (window.socket) {
                            let loginSubscribe = SubscribeEvent.login

                            loginSubscribe.message.username = cookie.load("username")
                            loginSubscribe.message.cookie = cookie.load("session-identify")

                            window.socket.send(loginSubscribe)
                        }

                        this._getFeatureLimits()

                        if (localStorage.getItem('role') === 'privilege_3') {
                            browserHistory.push('/user-basic-information/userInformation')
                        } else if (res.response.user.is_first_login === 'yes') {
                            browserHistory.push('/setup-wizard')
                        } else {
                            let subMenus = menusData.subMenus

                            if (res.response.user.user_role === 'privilege_3') {
                                subMenus = menusData.userPortalMenus
                            }

                            subMenus = this._parseMenuPrivilege(subMenus)

                            browserHistory.push('/' + subMenus[0].name + '/' + subMenus[0].items[0].path)
                        }

                        // $(".errorInfo").css("visibility", "hidden")
                        // $P.lang(doc, true, true)
                    } else {
                        this._loginError(res)
                    }
                }
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }.bind(this)
        })
    }
    _loginError = (res) => {
        const { formatMessage } = this.props.intl

        let domPws = $('#password').focus()

        if (res.status === -68) {
            let remainTime = res.response.remain_time,
                minute = parseInt((Number(remainTime) / 60)) + formatMessage({id: "LANG5148"})

            if (Number(remainTime) < 60) {
                minute = Number(remainTime) + formatMessage({id: "LANG5147"})
            }

            message.error(formatMessage({id: "LANG4725"}, { 0: minute }))

            domPws.blur()

            return false
        } else if (res.response && res.response.remain_num && res.status === -37) {
            message.error(formatMessage({id: "LANG4794"}, { 0: res.response.remain_num }))

            domPws.blur()

            return false
        } else if (res.status === -70) {
            message.error(formatMessage({id: "LANG4795"}))

            return false
        } else {
            message.error(formatMessage({id: "LANG984"}))

            domPws.focus()
            domPws.select()

            return false
        }
    }
    _forgetPassword = (e) => {
        this.setState({
            visible: true
        })
    }
    _handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    _handleOk = () => {
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                $.ajax({
                    type: 'post',
                    async: false,
                    dataType: 'json',
                    url: api.apiHost,
                    data: {
                        action: "sendPasswordEmail",
                        user_name: values.user_name
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4195" })}}></span>)

                            this.setState({
                                visible: false
                            })
                        }
                    }.bind(this),
                    error: function(e) {
                        message.error(e.statusText)
                    }
                })
            }
        })
    }
    _handleChange = (val) => {
        localStorage.setItem('locale', val.key)

        window.location.reload()
    }
    _parseMenuPrivilege(menus) {
        let parsedMenu = []
        let html_privilege = JSON.parse(localStorage.getItem('html_privilege'))

        _.map(menus, (top, topIndex) => {
            let topmenu = _.clone(top)

            topmenu.items = []

            _.map(top.items, (sub, subIndex) => {
                if (html_privilege[sub.path] === 1) {
                    topmenu.items.push(sub)
                }
            })

            if (topmenu.items.length) {
                parsedMenu.push(topmenu)
            }
        })

        return parsedMenu
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const model_name = model_info.model_name

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        document.title = formatMessage({
                id: "LANG584"
            }, {
                0: model_name,
                1: formatMessage({id: "LANG269"})
            })

        let locale = localStorage.getItem('locale') || "en-US",
            localeCurrent = 'en-US',
            currentClass = ''

        let lanMenu = <Menu onClick={ this._handleChange } style={{ width: 100, height: 250, overflow: 'auto' }}>
                        {
                            this.state.countryArr.map(function(item, key) {
                                if (item.languages === locale) {
                                    localeCurrent = item.localName
                                    currentClass = 'current-dropdown'
                                } else {
                                    currentClass = ''
                                }

                                return <Menu.Item key={ item.languages } className="ant-dropdown-menu-lan-item">
                                            <a className={ "u-ml-10 " + currentClass } href="#">
                                                <span>{ item.localName }</span>
                                            </a>
                                        </Menu.Item>
                            }.bind(this))
                        }
                    </Menu>

        let userLanBanner = <div className="header-lan">
                                <span style={{ marginRight: 5 }}>{ localeCurrent }</span>
                                <Icon type="down" />
                            </div>
        return (
            <div
                className="app-login-wrapper"
                id="app-login-wrapper"
            >
                <div className="login-logo">
                    <a href="http://www.grandstream.com">
                        <span className="sprite sprite-login-logo"></span>
                    </a>
                </div>
                <div className="change-lan">
                    <Dropdown overlay={ lanMenu } placement="bottomCenter">
                        { userLanBanner }
                    </Dropdown>
                </div>
                <div className="app-login">
                    <div className="login-box main-box">
                        <div className="main-box-inner">
                                <div className="login-header">
                                    <p className="login-title">{ formatMessage({id: "LANG5632"}) + ' ' + model_name }</p>
                                    <p className="login-msg">{ formatMessage({id: "LANG5633"}) }</p>
                                </div>
                            <Form
                                layout="horizontal"
                                className="login-form"
                                onSubmit={ this._handleSubmit }
                            >
                                <FormItem
                                    id="username"
                                    className="input-wrapper"
                                >
                                    { getFieldDecorator("username", {
                                        initialValue: ""
                                    })(
                                        <Input
                                            className="login-input"
                                            placeholder={ formatMessage({id: "LANG5259"}) } />
                                    ) }
                                    <span className="sprite sprite-bg-username sprite-pos"></span>
                                </FormItem>
                                <FormItem
                                    id="password"
                                    className="input-wrapper"
                                >
                                    { getFieldDecorator("password", {
                                        initialValue: ""
                                    })(
                                        <Input
                                            type="password"
                                            className="login-input"
                                            placeholder={ formatMessage({id: "LANG5260"}) } />
                                    ) }
                                    <span className="sprite sprite-bg-password sprite-pos"></span>
                                </FormItem>
                                <Row>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="login-btn"
                                    >
                                        { formatMessage({id: "LANG269"}) }
                                    </Button>
                                </Row>
                                <FormItem
                                    className="forget-pwd-wrap"
                                >
                                    <label onClick={ this._forgetPassword } className="forget-pwd">
                                        <FormattedMessage
                                            id={ 'LANG4189' }
                                            defaultMessage={ 'Forgot Password?' }
                                        />
                                    </label>
                                </FormItem>
                            </Form>
                            <Modal
                                onOk={ this._handleOk }
                                visible={ this.state.visible }
                                onCancel={ this._handleCancel }
                                title={ formatMessage({id: "LANG4190"}) }
                                okText={ formatMessage({id: "LANG4068"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                            >
                                <Form>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <Tooltip title={ <FormattedHTMLMessage id="LANG72" /> }>
                                                <span>{ formatMessage({id: "LANG72"}) }</span>
                                            </Tooltip>
                                        )}
                                    >
                                        { getFieldDecorator('user_name', {
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: "LANG2150"})
                                            }]
                                        })(
                                            <Input />
                                        )}
                                    </FormItem>
                                    <div>{ formatMessage({id: "LANG4191"}) }</div>
                                </Form>
                            </Modal>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
}

export default Form.create()(injectIntl(Login))

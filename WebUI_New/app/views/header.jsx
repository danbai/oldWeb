'use strict'

import $ from 'jquery'
import cookie from 'react-cookie'
import api from "../components/api/api"
import UCMGUI from "../components/api/ucmgui"

import React from 'react'
import { connect } from 'react-redux'
import * as Actions from '../actions/'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { bindActionCreators } from 'redux'
import { browserHistory } from 'react-router'
import { Icon, Menu, Dropdown, Select, Button, message, Spin, Modal, Alert } from 'antd'
import SubscribeEvent from '../components/api/subscribeEvent'
import '../css/header'

const Option = Select.Option

let Header = React.createClass({
    propsTypes: {
        userData: React.PropTypes.object.isRequired
    },
    getInitialState() {
        return {
            visible: true,
            countryArr: JSON.parse(localStorage.getItem('countryArr')),
            strongPwdAndEmail: true,
            strongPwd: true,
            emailPrompt: true
        }
    },
    componentDidMount: function() {
        // Checked is logined
        // this.props.actions.checkLogin();
        this._checkPwdAndMail()
    },
    componentWillReceiveProps(nextProps) {
        // 如果没有登录则跳登录
    },
    _checkPwdAndMail() {
        let is_strong_password = localStorage.is_strong_password

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'getUser',
                user_name: localStorage.username
            },
            dataType: 'json',
            async: false,
            success: function(data) {
                var res = data.response.user_name,
                    sMail = res.email

                if (is_strong_password === '0') {
                    this.setState({
                        strongPwdAndEmail: false,
                        strongPwd: false
                    })
                } else if (is_strong_password === '1' && !sMail) {
                    this.setState({
                        strongPwdAndEmail: false,
                        emailPrompt: false
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    },
    handleChange: function(val) {
        localStorage.setItem('locale', val.key)

        window.location.reload()
    },
    handleReboot: function(e) {
        let { formatMessage } = this.props.intl

        e.preventDefault()
        message.destroy()

        Modal.confirm({
            content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG835"}) }}></span>,
            okText: formatMessage({id: 'LANG727'}),
            cancelText: formatMessage({id: 'LANG726'}),
            onOk: () => {
                this.props.setSpinLoading({loading: true, tip: <FormattedHTMLMessage id="LANG832" />})
                UCMGUI.loginFunction.confirmReboot() 
            },
            onCancel: () => {
            }
        })
    },
    // 跳转登录页
    handleLogout: function(e) {
        const { formatMessage } = this.props.intl

        e.preventDefault()

        message.destroy()

        // cookie.remove('user_id')
        // cookie.remove('username')

        // localStorage.removeItem('user_id')
        // localStorage.removeItem('username')
        // localStorage.clear()

        if (window.socket) {
            window.socket.send(SubscribeEvent.logout)
        }

        UCMGUI.logoutFunction.doLogout(formatMessage)
    },
    triggerParentCollapseChange() {
        this.props.onChangeCollpase()
    },
    _applyChanges() {
        const { formatMessage } = this.props.intl

        this.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG806"})})

        $.ajax({
            url: api.apiHost + "action=applyChanges&settings=",
            type: "GET",
            success: function(data) {
                let status = data.status,
                    settings = data.response.hasOwnProperty('settings') ? data.response.settings : ''

                this.props.setSpinLoading({loading: false})

                if (status === 0 && settings === '0') {
                    // this.setState({
                    //     visible: false
                    // })

                    // cookie.remove("needApplyChange");
                    if (data.response.need_reboot && data.response.need_reboot === '1') {
                        Modal.confirm({
                            okText: 'OK',
                            onCancel: () => {},
                            cancelText: 'Cancel',
                            content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG833" })}}></span>,
                            onOk: () => {
                                UCMGUI.loginFunction.confirmReboot() 
                            }
                        })
                    } else {
                        message.info(formatMessage({id: "LANG951"}))

                        $("#applyChanges_div").addClass("hidden").removeClass("display-inline")
                    }
                } else if (status === -9 && settings.indexOf('-1') !== -1) {
                    message.error(formatMessage({id: "LANG2805"}))
                } else if (status === -9 && settings.indexOf('486') !== -1) {
                    message.info(formatMessage({id: "LANG2803"}))
                } else if (status === -9 && settings.indexOf('485') !== -1) {
                    message.info(formatMessage({id: "LANG2804"}))
                } else if (status === -69) {
                    message.error(formatMessage({id: "LANG4760"}))
                } else {
                    UCMGUI.errorHandler(data, null, formatMessage)
                }
            }.bind(this)
        })
    },
    _gotoSetupWizard () {
        browserHistory.push('/setup-wizard')
    },
    _jumpPwdEmail () {
        let role = localStorage.getItem('role')

        if (role === 'privilege_3') {
            browserHistory.push('/user-basic-information/changePassword')
        } else {
            browserHistory.push('/maintenance/changePassword')
        }
    },
    render: function () {
        let { formatMessage } = this.props.intl
        let role = localStorage.getItem('role')
        let username = localStorage.getItem('username')
        let model_info = JSON.parse(localStorage.getItem('model_info'))

        let menu = <Menu>
                    <Menu.Item key="1" className={ (role === 'privilege_0' || role === 'privilege_1') ? 'display-block' : 'hidden' }>
                        <a className="u-ml-10" href="#" onClick={ this.handleReboot }>
                            <span className="sprite sprite-header-reboot"></span>
                            { formatMessage({id: "LANG737"}) }
                        </a>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <a className="u-ml-10" href="#" onClick={ this.handleLogout }>
                            <span className="sprite sprite-header-logout"></span>
                            { formatMessage({id: "LANG259"}) }
                        </a>
                    </Menu.Item>
                </Menu>

        let userbanner = <div className="header-user-banner">
                            <span className="sprite sprite-user-availiable-status" />
                            <span className="username">{ username }</span>
                            <Icon type="down" />
                        </div>

        let locale = localStorage.getItem('locale') || "en-US",
            localeCurrent = 'en-US',
            currentClass = ''

        let lanMenu = <Menu
                        onClick={this.handleChange}
                        style={{ width: 100, height: 250, overflow: 'auto' }}
                    >
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
            <header className="app-header clearfix">
                <div
                    className={ this.state.strongPwdAndEmail ? 'hidden' : 'check-msg' }
                    onClick={ this._jumpPwdEmail }
                >
                    <Alert 
                        className={ this.state.strongPwd ? 'hidden' : '' }
                        message={ <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4193" })}}></span> }
                        type="warning" />
                    <Alert 
                        className={ this.state.emailPrompt ? 'hidden' : '' }
                        message={ <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4197" })}}></span> }
                        type="warning" />
                </div>
                <div className="header-inner">
                    <div className="app-logo">
                        <a className="logo" href="http://www.grandstream.com">
                            <i className="sprite sprite-logo"></i>
                            {/* <img alt="logo" src={ api.serverRoot + "/images/logo-grandstream.png" } /> */}
                            <span className="logo-text">{ model_info.model_name }</span>
                        </a>
                    </div>
                    {/* <a className="logo" href="http://www.grandstream.com/">
                        <span className="logo-text">Grandstream</span>
                    </a>
                    <div className="search"></div> 
                    <nav className="left-nav">
                        <div className="app-sidebar-toggle" onClick={ this.triggerParentCollapseChange }>
                            <Icon type="bars" />
                        </div>
                    </nav> */}
                    <nav className="right-nav">
                        <Dropdown overlay={ menu } placement="bottomCenter">
                            { userbanner }
                        </Dropdown>
                    </nav>
                    <nav className="right-nav">
                        <div className="border-right"></div>
                    </nav>
                    <nav className="right-nav">
                        <Dropdown overlay={ lanMenu } placement="bottomCenter">
                            { userLanBanner }
                        </Dropdown>
                    </nav>
                    <nav className="right-nav">
                        <button
                            onClick={ this._gotoSetupWizard }
                            className={ username === 'admin' ? "setup-btn" : "hidden" }
                            title={ formatMessage({id: "LANG4283"}) }
                        >
                            { formatMessage({id: "LANG4283"}) }
                        </button>
                    </nav>
                    <nav className="right-nav">
                        <div id="applyChanges_div" className="hidden">
                            <Button type="primary"
                                onClick={ this._applyChanges }
                                className={ this.state.visible ? "display-inline apply-btn" : "hidden" }
                            >
                                { formatMessage({id: "LANG260"}) }
                            </Button>
                        </div>
                    </nav>
                    {/* <div className="nav-phone-icon"></div> */}
                </div>
            </header>
        )
    }
})

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(injectIntl(Header))

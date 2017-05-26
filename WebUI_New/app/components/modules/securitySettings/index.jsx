'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import Security from './security'
import DynamicDefense from './dynamicDefense'
import Fail2ban from './fail2ban'
import SSH from './sshAccess'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { Form, Input, Tabs, message, Modal } from 'antd'
const TabPane = Tabs.TabPane
import _ from 'underscore'

class SecuritySettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: this.props.params.id ? this.props.params.id : 'security',
            isDisplay: "display-block",
            networkSettings: {},
            dynamicLoad: false,
            fail2banLoad: false,
            securityLoad: false,
            sshLoad: false,
            cancel: 0,
            cancelDynamicLoad: false,
            cancelFail2banLoad: false
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {
    }
    _getInitData = () => {
        let networkSettings = this.state.networkSettings
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getNetworkSettings',
                method: '',
                port: ''
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    networkSettings = response.network_settings || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            networkSettings: networkSettings
        })
    }
    _onChange = (activeKey) => {
        if (activeKey === "security") {
            this.setState({
                activeKey,
                isDisplay: "display-block",
                dynamicLoad: false,
                fail2banLoad: false,
                sshLoad: false,
                securityLoad: true
            })
        } else if (activeKey === 'dynamicDefense') {
            this.setState({
                activeKey,
                isDisplay: "hidden",
                dynamicLoad: true,
                fail2banLoad: false,
                sshLoad: false,
                securityLoad: false
            })
        } else if (activeKey === 'fail2ban') {
            this.setState({
                activeKey,
                isDisplay: "hidden",
                dynamicLoad: false,
                fail2banLoad: true,
                sshLoad: false,
                securityLoad: false
            })
        } else if (activeKey === 'SSH') {
            this.setState({
                activeKey,
                isDisplay: "hidden",
                dynamicLoad: false,
                fail2banLoad: false,
                sshLoad: true,
                securityLoad: false
            })
        }
    }
    _realSubmit = (e) => {
        const { formatMessage } = this.props.intl
        let activeKey = this.state.activeKey

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (activeKey === "fail2ban") {
                let action_fail2ban = {},
                    flag = false,
                    optionsArr = ["asterisk_enabled", "login_attack_defense_enabled", "bantime", "findtime",
                        "maxretry", "asterisk_maxretry", "login_attack_defense_maxretry",
                        "ignoreip1", "ignoreip2", "ignoreip3", "ignoreip4", "ignoreip5"]

                action_fail2ban["action"] = 'updateFail2ban'
                optionsArr.map(function(it) {
                    if (err && err.hasOwnProperty(it)) {
                        flag = true   
                    } else {                        
                        action_fail2ban[it] = values[it]
                        if (values[it] === true) {
                            action_fail2ban[it] = "yes"
                        } else if (values[it] === false) {
                            action_fail2ban[it] = "no"
                        }
                    } 
                })
                action_fail2ban["fail2ban_enable"] = values.fail2ban_enable ? 1 : 0
                // action_fail2ban.asterisk_enabled = values.asterisk_enabled ? 'yes' : 'no'
                // action_fail2ban.login_attack_defense_enabled = values.login_attack_defense_enabled ? 'yes' : 'no'
                // action_fail2ban.bantime = values.bantime
                // action_fail2ban.findtime = values.findtime
                // action_fail2ban.maxretry = values.maxretry
                // action_fail2ban.asterisk_maxretry = values.asterisk_maxretry
                // action_fail2ban.login_attack_defense_maxretry = values.login_attack_defense_maxretry
                // action_fail2ban.ignoreip1 = values.ignoreip1
                if (flag) {
                    return 
                }
                let ignoreip_list = []
                if (values.ignoreip2 != null && values.ignoreip2 !== undefined) {
                    ignoreip_list.push('ignoreip2')
                }
                if (values.ignoreip3 != null && values.ignoreip3 !== undefined) {
                    ignoreip_list.push('ignoreip3')
                }
                if (values.ignoreip4 != null && values.ignoreip4 !== undefined) {
                    ignoreip_list.push('ignoreip4')
                }
                if (values.ignoreip5 !== null && values.ignoreip5 !== undefined) {
                    ignoreip_list.push('ignoreip5')
                }
                if (ignoreip_list.length > 0) {
                    ignoreip_list.map(function(item, index) {
                        action_fail2ban[`ignoreip${index + 2}`] = values[`${item}`]
                    })
                }
                if (ignoreip_list.length < 4) {
                    const len = ignoreip_list.length
                    for (let i = len; i < 4; i++) {
                        action_fail2ban[`ignoreip${i + 2}`] = ''
                    }
                }

                message.loading(formatMessage({ id: "LANG826" }), 0)
                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action_fail2ban,
                    type: 'json',
                    async: false,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                        }
                    }.bind(this)
                })
            }
            if (activeKey === "dynamicDefense") {   
                let action_dynamic = {},
                    flag = false,
                    optionsArr = ["enable", "threshold", "timeout", "block_timeout"]

                optionsArr.map(function(it) {
                    if (err && err.hasOwnProperty(it)) {
                        flag = true   
                    } else {                        
                        action_dynamic[it] = values[it]
                        if (values[it] === true) {
                            action_dynamic[it] = "yes"
                        } else if (values[it] === false) {
                            action_dynamic[it] = "no"
                        }
                    } 
                })
                action_dynamic['enable'] = values.dynamic_enable ? 'yes' : 'no'
                action_dynamic.action = 'updateDynamicDefense'
                // action_dynamic.enable = values.dynamic_enable ? 'yes' : 'no'
                // action_dynamic.threshold = values.threshold
                // action_dynamic.timeout = values.timeout
                // action_dynamic.block_timeout = values.block_timeout
                if (flag) {
                    return 
                }
                let whiteArray = values.whitelist.split('\n')
                let whitelist = []
                for (let i = 0; i < whiteArray.length; i++) {
                    let item = whiteArray[i]

                    if (item) {
                        if (UCMGUI.isIPv6(whiteArray[i])) {
                            item = item.replace("[", "").replace("]", "")
                        }
                        whitelist.push(item)
                    }
                }
                action_dynamic.white_addr = whitelist.join('\\n')

                message.loading(formatMessage({ id: "LANG826" }), 0)
                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action_dynamic,
                    type: 'json',
                    async: false,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                        }
                    }.bind(this)
                })
            }
            if (activeKey === "SSH") {
                let action_ssh = {}
                action_ssh.action = 'sshControl'
                action_ssh.option = values.access ? 'yes' : 'no'
                if (err && err.hasOwnProperty("access")) {
                    return  
                }
                message.loading(formatMessage({ id: "LANG826" }), 0)
                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action_ssh,
                    type: 'json',
                    async: false,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" })}}></span>)
                        }
                    }.bind(this)
                })
            }

            let pass = false

            if ((values.ping_enable_wan === true && values.ping_of_death_wan === true) ||
                (values.ping_enable_lan === true && values.ping_of_death_lan === true)) {
                Modal.warning({
                    content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4105"})}} ></span>,
                    okText: (formatMessage({id: "LANG727"}))
                })
                pass = true
            }
            if (pass === false && activeKey === "security") {
                let action_static = {},
                ping_enable_list = [],
                ping_of_death_list = [],
                flag = false,
                optionsArr = ["ping_enable_wan", "ping_of_death_wan", "ping_enable_lan", "ping_of_death_lan", "reject_all"]

                optionsArr.map(function(it) {
                    if (err && err.hasOwnProperty(it)) {
                        flag = true   
                    }
                })
                if (flag) {
                    return 
                }
                if (this.state.networkSettings.method === '0') {
                    if (values.ping_enable_wan === true) {
                        ping_enable_list.push('WAN')
                    }
                    if (values.ping_enable_lan === true) {
                        ping_enable_list.push('LAN')
                    }
                    if (values.ping_of_death_wan === true) {
                        ping_of_death_list.push('WAN')
                    }
                    if (values.ping_of_death_lan === true) {
                        ping_of_death_list.push('LAN')
                    }
                } else if (this.state.networkSettings.method === '1') {
                    if (values.ping_enable_lan === true) {
                        ping_enable_list.push('lan')
                    }
                    if (values.ping_of_death_lan === true) {
                        ping_of_death_list.push('lan')
                    }
                } else if (this.state.networkSettings.method === '2') {
                    if (values.ping_enable_wan === true) {
                        ping_enable_list.push('LAN1')
                    }
                    if (values.ping_enable_lan === true) {
                        ping_enable_list.push('LAN2')
                    }
                    if (values.ping_of_death_wan === true) {
                        ping_of_death_list.push('LAN1')
                    }
                    if (values.ping_of_death_lan === true) {
                        ping_of_death_list.push('LAN2')
                    }
                }
                action_static.action = 'updateTypicalFirewallSettings'
                action_static.reject_all = values.reject_all ? 'yes' : 'no'
                action_static.syn_flood = ''
                action_static.ping_of_death = ping_of_death_list.join(',')
                action_static.ping_enable = ping_enable_list.join(',')

                message.loading(formatMessage({ id: "LANG826" }), 0)
                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action_static,
                    type: 'json',
                    async: false,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            pass = true
                            message.destroy()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                        }
                    }.bind(this)
                })
            }
        })
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl

        const reject_all = this.props.form.getFieldValue('reject_all')

        if (reject_all === true) {
            Modal.confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG2754"}, {0: formatMessage({id: "LANG2752"})})}} ></span>,
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"}),
                onOk: () => {
                    this._realSubmit(e)
                },
                onCancel: () => {
                    this.props.form.setFieldsValue({reject_all: false})
                }
            })
        } else {
            this._realSubmit(e)
        }
    }
    _handleCancel = () => {
        if (this.state.activeKey === 'fail2ban') {
            this.props.form.resetFields(["asterisk_enabled", "login_attack_defense_enabled", "bantime", "findtime",
                        "maxretry", "asterisk_maxretry", "login_attack_defense_maxretry",
                        "ignoreip1", "ignoreip2", "ignoreip3", "ignoreip4", "ignoreip5"])
            const cancel = this.state.cancel + 1
            this.setState({
                cancelFail2banLoad: true,
                cancel: cancel
            })
        } else if (this.state.activeKey === 'security') {
            this.props.form.resetFields(["ping_enable_wan", "ping_of_death_wan", "ping_enable_lan", "ping_of_death_lan", "reject_all"])
            const cancel = this.state.cancel + 1
            this.setState({
                cancel: cancel
            })
        } else if (this.state.activeKey === 'dynamicDefense') {
            this.props.form.resetFields(["enable", "threshold", "timeout", "block_timeout", "whitelist"])
            const cancel = this.state.cancel + 1
            this.setState({
                cancelDynamicLoad: true,
                cancel: cancel
            })
        } else if (this.state.activeKey === 'SSH') {
            this.props.form.resetFields(["access"])
            const cancel = this.state.cancel + 1
            this.setState({
                cancel: cancel
            })
        }
    }
    _setCancelLoad = (key, value) => {
        if (key === 'dynamicDefense') {
            this.setState({
                cancelDynamicLoad: value
            })
        } else if (key === 'fail2ban') {
            this.setState({
                cancelFail2banLoad: value
            })
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG5301"})
                })

        return (
            <div className="app-content-main" id="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG5301"}) } 
                    onSubmit={ this._handleSubmit.bind(this) } 
                    onCancel={ this._handleCancel } 
                    isDisplay='display-block'
                />
                <Tabs
                    activeKey={ this.state.activeKey }
                    onChange={ this._onChange }
                    animated={ UCMGUI.initConfig.msie ? false : true }
                >
                    <TabPane tab={formatMessage({id: "LANG38"})} key="security">
                        <Security 
                            form={ this.props.form }
                            networkSettings= { this.state.networkSettings }
                            firstLoad={this.state.securityLoad}
                        />
                    </TabPane>
                    <TabPane tab={formatMessage({id: "LANG2303"})} key="dynamicDefense">
                        <DynamicDefense
                            form={ this.props.form }
                            firstLoad={this.state.dynamicLoad}
                            setCancelLoad={this._setCancelLoad}
                            cancelDynamicLoad = {this.state.cancelDynamicLoad}
                        />
                    </TabPane>
                    <TabPane tab={formatMessage({id: "LANG2600"})} key="fail2ban">
                        <Fail2ban
                            form={ this.props.form }
                            firstLoad={this.state.fail2banLoad}
                            setCancelLoad={this._setCancelLoad}
                            cancelFail2banLoad = {this.state.cancelFail2banLoad}
                        />
                    </TabPane>
                    <TabPane tab={formatMessage({id: "LANG4179"})} key="SSH">
                        <SSH
                            form={ this.props.form }
                            firstLoad={this.state.sshLoad}
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

SecuritySettings.propTypes = {
}

export default Form.create()(injectIntl(SecuritySettings))

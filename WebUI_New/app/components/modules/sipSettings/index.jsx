'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import General from './general'
import Misc from './misc'
import SessionTimer from './sessionTimer'
import TcpTls from './tcpTls'
import Nat from './nat'
import Tos from './tos'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { Form, Tabs, message, Modal } from 'antd'
const TabPane = Tabs.TabPane
import _ from 'underscore'

const baseServerURl = api.apiHost
const confirm = Modal.confirm

class SipSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: "SIPGenSettings",
            SIPGenSettings: {},
            bindportVal: "",
            bindaddrVal: "",
            bindAddrV6Val: "",
            sipMiscSettings: {},
            sipSessiontimerSettings: {},
            sipTcpSettings: {},
            sipNatSettings: {},
            sipTosSettings: {},
            isChange: false
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {

    }
    _onChange = (activeKey) => {
        this.setState({
            activeKey
        })
    }
    _getInitData = () => {
        this._getSIPGenSettings()
        this._getSIPMiscSettings()
        this._getSIPSTimerSettings()
        this._getSIPTCPSettings()
        this._getSIPNATSettings()
        this._getTOSSettings()
    }
    _getSIPGenSettings = () => {
        $.ajax({
            url: baseServerURl,
            method: "post",
            data: { action: 'getSIPGenSettings' },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        SIPGenSettings = res.sip_general_settings
                    _.each(SIPGenSettings, function(num, key) {
                        if (key === "allowtransfer" || key === "enable_diversion" || key === "allowguest") {
                            if (num === "yes") {
                                SIPGenSettings[key] = true
                            } else if (num === "no") {
                                SIPGenSettings[key] = false
                            }
                        }
                    })
                    this.setState({
                        SIPGenSettings: SIPGenSettings,
                        bindportVal: SIPGenSettings["bindport"],
                        bindaddrVal: SIPGenSettings["bindaddr"],
                        bindAddrV6Val: SIPGenSettings["bindaddr6"]
                    })
                }
            }.bind(this)
        })
    }
    _getSIPMiscSettings = () => {
        $.ajax({
            url: baseServerURl,
            method: "post",
            data: { action: 'getSIPMiscSettings' },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        sipMiscSettings = res.sip_misc_settings
                    _.each(sipMiscSettings, function(num, key) {
                        if (num === "yes") {
                            sipMiscSettings[key] = true
                        } else if (num === "no") {
                            sipMiscSettings[key] = false
                        }
                    })
                    this.setState({
                        sipMiscSettings: sipMiscSettings
                    })
                }
            }.bind(this)
        })
    }
    _getSIPSTimerSettings = () => {
        $.ajax({
            url: baseServerURl,
            method: "post",
            data: { action: 'getSIPSSTimerSettings' },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        sipSessiontimerSettings = res.sip_sessiontimer_settings
                    this.setState({
                        sipSessiontimerSettings: sipSessiontimerSettings
                    })
                }
            }.bind(this)
        })
    }
    _getSIPTCPSettings = () => {
        $.ajax({
            url: baseServerURl,
            method: "post",
            data: { action: 'getSIPTCPSettings' },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        sipTcpSettings = res.sip_tcp_settings
                    _.each(sipTcpSettings, function(num, key) {
                        if (num === "yes") {
                            sipTcpSettings[key] = true
                        } else if (num === "no") {
                            sipTcpSettings[key] = false
                        }
                    })
                    this.setState({
                        sipTcpSettings: sipTcpSettings
                    })
                }
            }.bind(this)
        })
    }
    _getSIPNATSettings = () => {
        $.ajax({
            url: baseServerURl,
            method: "post",
            data: { action: 'getSIPNATSettings' },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        sipNatSettings = res.sip_nat_settings
                        if (res.sip_nat_settings.ip_in_sdp_connection === 1) {
                            sipNatSettings.ip_in_sdp_connection = true
                        } else {
                            sipNatSettings.ip_in_sdp_connection = false
                        }
                    this.setState({
                        sipNatSettings: sipNatSettings
                    })
                }
            }.bind(this)
        })
    }
    _getTOSSettings = () => {
        $.ajax({
            url: baseServerURl,
            method: "post",
            data: { action: 'getTOSSettings' },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        sipTosSettings = res.siptos_settings
                    _.each(sipTosSettings, function(num, key) {
                        if (key === "relaxdtmf" || key === "trustrpid" || key === "sendrpid" || key === "compactheaders") {
                            if (num === "yes") {
                                sipTosSettings[key] = true
                            } else if (num === "no") {
                                sipTosSettings[key] = false
                            }
                        }
                    })
                    this.setState({
                        sipTosSettings: sipTosSettings
                    })
                }
            }.bind(this)
        })
    }
    _applyChangeAndReboot = () => {
        const { formatMessage } = this.props.intl

        message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG832" })}}></span>, 0)

        UCMGUI.loginFunction.confirmReboot()
    }
    _cancelReboot = () => {
        this._handleCancel()
    }
    _applyReboot = (needReboot) => {
        const { formatMessage } = this.props.intl

        if (needReboot) {
            confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG926" })}}></span>,
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"}),
                onOk: this._applyChangeAndReboot.bind(this),
                onCancel: this._cancelReboot.bind(this)
            })
        }
    }
    _handleCancel = () => {
        const activeKey = this.state.activeKey

        if (activeKey === "SIPGenSettings") {
            this._getSIPGenSettings()
            this.props.form.resetFields(["context", "realm", "bindport", "bindaddr", "bindaddr6",
                "allowguest", "allowtransfer", "mwi_from", "enable_diversion"])
            }
        if (activeKey === "sipMiscSettings") {
            this._getSIPMiscSettings()
            this.props.form.resetFields(["registertimeout", "registerattempts", "maxcallbitrate", "videosupport",
                "alwaysauthreject", "attr_passthrough", "use_final_sdp", "rtp_proxy", "g726nonstandard",
                "allow_blind_transfer_callback", "blind_transfer_timeout"])
        }

        if (activeKey === "sipSessiontimerSettings") {
            this._getSIPSTimerSettings()
            this.props.form.resetFields(["force_timer", "timer", "session_expires", "session_minse"])
        }

        if (activeKey === "sipTcpSettings") {
            this._getSIPTCPSettings()
            this.props.form.resetFields(["tcpenable", "tcpbindaddr", "tcpbindaddr6", "tlsenable", 
                "tlsbindaddr", "tlsbindaddr6", "tlsclientmethod", "tlsdontverifyserver", 
                "tls_ca_file", "tls_crt_file", "tls_key_file", "tls_ca_dir"])
        }

        if (activeKey === "sipNatSettings") {
            this._getSIPNATSettings()
            this.props.form.resetFields(["externhost", "ip_in_sdp_connection", "externudpport", "externtcpport", 
                "externtlsport", "permitIP", "permitMask"])
        }

        if (activeKey === "sipTosSettings") {
            this._getTOSSettings()
            this.props.form.resetFields(["tos_sip", "tos_audio", "tos_video", "compactheaders", 
                "defaultexpiry", "maxexpiry", "minexpiry", "relaxdtmf", "dtmfmode", "rtptimeout",
                "rtpholdtimeout", "rtpkeepalive", "p100rel", "trustrpid", "sendrpid",
                "progressinband", "useragent"])
        }
    }
    _checkChange = (oldObj, newObj, keyList) => {
        let res = false
        _.map(keyList, function(key, index) {
            if (newObj[key] !== undefined && (oldObj[key] + '') !== (newObj[key]) + '') {
                res = true
            }
        })
        return res
    }

    _doAction = (action, isChange) => {
        const { formatMessage } = this.props.intl
        let activeKey = this.state.activeKey
        let me = this
        $.ajax({
            url: baseServerURl,
            method: "post",
            data: action,
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)
                if (bool) {
                    if (activeKey === "SIPGenSettings") {
                        let domPortVal = action["bindport"],
                            domAddrVal = action["bindaddr"],
                            domAddrV6Val = action["bindaddr6"],
                            state = this.state,
                            bindportVal = state.bindportVal,
                            bindaddrVal = state.bindaddrVal,
                            bindAddrV6Val = state.bindAddrV6Val

                        if ((domPortVal && bindportVal !== domPortVal) || (domAddrVal && bindaddrVal !== domAddrVal) || (domAddrV6Val && bindAddrV6Val !== domAddrV6Val)) {
                            if (domPortVal && bindportVal !== domPortVal) {
                                $.ajax({
                                    type: "post",
                                    url: baseServerURl,
                                    async: false,
                                    data: {
                                        action: 'updateFail2ban',
                                        asterisk_port: domPortVal
                                    },
                                    error: function(ite) {
                                        message.error(ite.statusText)
                                    },
                                    success: function(res) {
                                        let bool = UCMGUI.errorHandler(res, null, formatMessage)

                                        if (bool) {
                                            message.destroy()
                                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}} ></span>)
                                        }
                                    }
                                })
                            }
                        } else {
                            message.destroy()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}} ></span>)
                        }
                    } else {
                        message.destroy()
                        message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}} ></span>)
                    }
                    this._applyReboot(isChange)
                    this._getInitData()
                }
            }.bind(this)
        })
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            this.props.form.resetFields(["permitIP"])
            let activeKey = this.state.activeKey
            let action = {}
            let me = this
            let refs = this.refs
            let isChange = false
            let keyList = []
            if (activeKey === "SIPGenSettings") {
                action["action"] = "updateSIPGenSettings"
                _.each(this.state.SIPGenSettings, function(num, key) {
                    if (values[key] === true) {
                        action[key] = "yes"
                    } else if (values[key] === false) {
                        action[key] = "no"
                    } else {
                        action[key] = values[key]
                    }
                })
                keyList = ["bindport", "bindaddr", "bindaddr6"]
                isChange = this._checkChange(this.state.SIPGenSettings, values, keyList)
            }
            if (activeKey === "sipMiscSettings") {
                action["action"] = "updateSIPMiscSettings"

                _.each(this.state.sipMiscSettings, function(num, key) {
                    if (values[key] === true) {
                        action[key] = "yes"
                    } else if (values[key] === false) {
                        action[key] = "no"
                    } else {
                        action[key] = values[key]
                    }
                })
            }

            if (activeKey === "sipSessiontimerSettings") {
                action["action"] = "updateSIPSSTimerSettings"
                action["session_expires"] = values.session_expires
                action["session_minse"] = values.session_minse
                if (values.force_timer) {
                    action["session_timers"] = "always"
                } else {
                    action["session_timers"] = values.timer ? "yes" : "no"
                }
            }

            if (activeKey === "sipTcpSettings") {
                action["action"] = "updateSIPTCPSettings"

                _.each(this.state.sipTcpSettings, function(num, key) {
                    if (values[key] === true) {
                        action[key] = "yes"
                    } else if (values[key] === false) {
                        action[key] = "no"
                    } else {
                        action[key] = values[key]
                    }
                    if (key !== "tlscertfile" && key !== "tlscafile" && key !== "tlscadir") {
                        keyList.push(key)
                    }
                })

                delete action.tlscertfile
                delete action.tlscafile
                delete action.tlscadir
                delete action.tlsclientmethod
                isChange = this._checkChange(this.state.sipTcpSettings, values, keyList)
            }

            if (activeKey === "sipNatSettings") {
                action["action"] = "updateSIPNATSettings"

                _.each(this.state.sipNatSettings, function(num, key) {
                    if (values[key] === true) {
                        action[key] = 1
                    } else if (values[key] === false) {
                        action[key] = 0
                    } else {
                        action[key] = values[key]
                    }
                    keyList.push(key)
                })

                delete action.permitIP
                delete action.permitMask
                isChange = this._checkChange(this.state.sipNatSettings, values, keyList)
                if (this.state.isChange) {
                    isChange = true
                    this.setState({
                        isChange: false
                    })
                }
            }

            if (activeKey === "sipTosSettings") {
                action["action"] = "updateTOSSettings"

                _.each(this.state.sipTosSettings, function(num, key) {
                    if (values[key] === true) {
                        action[key] = "yes"
                    } else if (values[key] === false) {
                        action[key] = "no"
                    } else {
                        action[key] = values[key]
                    }
                })
                keyList = ["tos_sip", "tos_audio", "tos_video", "compactheaders"]
                isChange = this._checkChange(this.state.sipTosSettings, values, keyList)
            }

            for (let key in action) {
                if (action.hasOwnProperty(key) && key !== "action") {
                    if (!err || (err && typeof err[key] === "undefined")) {
                    } else {
                        return
                    }
                }
            }
            if (activeKey === "SIPGenSettings" && values["allowguest"] === true) {
                confirm({
                    content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2536" }, {0: formatMessage({ id: "LANG1745" })})}}></span>,
                    okText: formatMessage({id: "LANG727"}),
                    cancelText: formatMessage({id: "LANG726"}),
                    onOk: this._doAction.bind(this, action, isChange)
                })
            } else {
                this._doAction(action, isChange)
            }
        })
    }
    _setIsChange = (e) => {
        this.setState({
            isChange: true
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name,
            1: formatMessage({id: "LANG39"})
        })
        return (
            <div className="app-content-main" id="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG39"}) }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <div className="ant-form form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG3"}) } key="SIPGenSettings">
                            <General
                                form={ this.props.form }
                                dataSource={ this.state.SIPGenSettings }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG41"}) } key="sipMiscSettings">
                            <Misc
                                form={ this.props.form }
                                dataSource={ this.state.sipMiscSettings }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG42"}) } key="sipSessiontimerSettings">
                            <SessionTimer
                                form={ this.props.form }
                                dataSource={ this.state.sipSessiontimerSettings }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG43"}) } key="sipTcpSettings">
                            <TcpTls
                                form={ this.props.form }
                                dataSource={this.state.sipTcpSettings}
                                 reboot={ this._applyChangeAndReboot }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG44"}) } key="sipNatSettings">
                            <Nat
                                form={ this.props.form }
                                dataSource={ this.state.sipNatSettings }
                                setIsChange={ this._setIsChange }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG45"}) } key="sipTosSettings">
                            <Tos
                                form={ this.props.form }
                                dataSource={ this.state.sipTosSettings }
                            />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

SipSettings.propTypes = {
}
export default Form.create()(injectIntl(SipSettings))


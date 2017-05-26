'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import DateTime from './datetime'
import ChangeTime from './changetime'
import OfficeTime from './officetime'
import HolidayTime from './holidaytime'
import NTPServer from './ntpserver'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { Form, Input, Tabs, message, Modal } from 'antd'
const TabPane = Tabs.TabPane
import _ from 'underscore'
import { browserHistory } from 'react-router'

const baseServerURl = api.apiHost

class TimeSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: this.props.params.id ? this.props.params.id : 'dateTime',
            isDisplay: (this.props.params.id === 'officetime' || this.props.params.id === 'holidaytime') ? "hidden" : "display-block",
            datetime: {},
            NTPStatus: 'off',
            firstLoad: false
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }
    _getNTPSatus = () => {
        const { formatMessage } = this.props.intl
        let NTPStatus = this.state.NTPStatus
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'checkNTPServerStatus',
                NTPStatus: ''
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    NTPStatus = response.NTPStatus || {}
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.setState({
            NTPStatus: NTPStatus
        })
    }
    _onChange = (activeKey) => {
        if (activeKey === 'dateTime' || activeKey === 'changeTime' || activeKey === 'NTPServer') {
            this.setState({
                activeKey,
                isDisplay: "display-block"
            })
        } else {
            this.setState({
                activeKey,
                isDisplay: "hidden"
            })
        }
    }
    _setInitDatetime = (datetime) => {
        this.setState({
            datetime: datetime
        })
    }
    _setInitNTP = (NTPStatus) => {
        this.setState({
            NTPStatus: NTPStatus
        })
    }
    _reBoot = () => {                                                                                                                                   
        UCMGUI.loginFunction.confirmReboot()
    }
    _handleCancel = () => {
        // browserHistory.push('/system-settings/timeSettings')
        const { resetFields } = this.props.form
        resetFields()
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl
        let activeKey = this.state.activeKey

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            let need_logout = false,
                need_reboot = false

            if (activeKey === "dateTime") {
                if (this.state.datetime.remote_ntp_server !== values.remote_ntp_server ||
                    this.state.datetime.time_zone !== values.time_zone ||
                    this.state.datetime.self_defined_time_zone !== values.self_defined_time_zone ||
                    (this.state.datetime.enable_dhcp_option_2 === '1') !== values.enable_dhcp_option_2 ||
                    (this.state.datetime.enable_dhcp_option_42 === '1') !== values.enable_dhcp_option_42) {
                        let action_datetime = {},
                            flag = false,
                            optionsArr = ["remote_ntp_server", "enable_dhcp_option_2", "enable_dhcp_option_42", "time_zone", 
                                "self_defined_time_zone"]

                        action_datetime["action"] = 'updateTimeSettings'
                        optionsArr.map(function(it) {
                            if (err && err.hasOwnProperty(it)) {
                                flag = true   
                            } else {                        
                                action_datetime[it] = values[it]
                                if (values[it] === true) {
                                    action_datetime[it] === "1"
                                } else if (values[it] === false) {
                                    action_datetime[it] === "0"
                                }
                            } 
                        })
                        // action_datetime["remote_ntp_server"] = values.remote_ntp_server
                        action_datetime["enable_dhcp_option_2"] = values.enable_dhcp_option_2 ? '1' : '0'
                        action_datetime["enable_dhcp_option_42"] = values.enable_dhcp_option_42 ? '1' : '0'
                        // action_datetime["time_zone"] = values.time_zone
                        // action_datetime["self_defined_time_zone"] = values.self_defined_time_zone
                        if (flag) {
                            return 
                        }
                        message.loading(formatMessage({ id: "LANG826" }))
                        $.ajax({
                            url: baseServerURl,
                            method: "post",
                            data: action_datetime,
                            type: 'json',
                            async: false,
                            error: function(e) {
                                message.error(e.statusText)
                            },
                            success: function(data) {
                                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                if (bool) {
                                    need_reboot = true
                                    message.destroy()
                                    message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                                } else {
                                    if (data.status === -1) {
                                        message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG962" })}}></span>)
                                    } else {
                                        message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2981" })}}></span>)
                                    }
                                }
                            }.bind(this)
                        })
                    }
                    // message.destroy()
                    // message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
                }

            if (activeKey === "changeTime") {
                if (err && err.hasOwnProperty("setsystime")) {
                    return   
                } 

                let action_changetime = {}
                action_changetime["action"] = "setTimeManual"
                action_changetime["setTime"] = values.setsystime.format('YYYY-MM-DD HH:mm:ss')
    
                message.loading(formatMessage({ id: "LANG826" }))
                $.ajax({
                    url: baseServerURl,
                    method: "post",
                    data: action_changetime,
                    type: 'json',
                    async: false,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            Modal.confirm({
                                content: formatMessage({id: "LANG3481"}),
                                okText: formatMessage({id: 'LANG727'}),
                                cancelText: formatMessage({id: 'LANG726'}),
                                onOk: () => {
                                    UCMGUI.logoutFunction.doLogout(formatMessage)
                                },
                                onCancel: () => {
                                }
                            })
                        } else {
                            message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2981" })}}></span>)
                        }
                    }.bind(this)
                })
            }

            if (activeKey === "NTPServer") {
                let action_ntpserver = {}
                if (err && err.hasOwnProperty("enable_ntpserver")) {
                    return   
                }
                if ((this.state.NTPStatus === 'off' && values.enable_ntpserver) ||
                    this.state.NTPStatus === 'on' && !values.enable_ntpserver) {
                    if (values.enable_ntpserver === true) {
                        action_ntpserver["action"] = "startNTPServer"
                        action_ntpserver["startNTP"] = ""
                    } else {
                        action_ntpserver["action"] = "stopNTPServer"
                        action_ntpserver["stopNTP"] = ""
                    }

                    message.loading(formatMessage({ id: "LANG826" }))
                    $.ajax({
                        url: baseServerURl,
                        method: "post",
                        data: action_ntpserver,
                        type: 'json',
                        async: false,
                        error: function(e) {
                            message.error(e.statusText)
                        },
                        success: function(data) {
                            let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                            if (bool) {
                                message.destroy()
                                message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG844" })}}></span>)
                                this._getNTPSatus()
                            } else {
                                message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2981" })}}></span>)
                            }
                        }.bind(this)
                    })
                }
                // message.destroy()
                // message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>)
            }
            if (need_reboot) {
                Modal.confirm({
                    content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG833" })}}></span>,
                    okText: formatMessage({id: "LANG727"}),
                    cancelText: formatMessage({id: "LANG726"}),
                    onOk: this._reBoot.bind(this)
                })
            }
            if (need_logout) {
                message.destroy()
                message.success(formatMessage({id: "LANG3481"}))

                UCMGUI.logoutFunction.doLogout(formatMessage)
            }
            this.setState({
                firstLoad: true
            })
        })
    }
    _setFirstLoad =(key) => {
        this.setState({
            firstLoad: key
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl

        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG718"})
                })

        return (
            <div className="app-content-main" id="app-content-main">
                <Title headerTitle={ formatMessage({id: "LANG718"}) }
                    onSubmit={ this._handleSubmit.bind(this) }
                    onCancel={ this._handleCancel }
                    isDisplay={ this.state.isDisplay }
                />
                <div className="ant-form form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={formatMessage({id: "LANG59"})} key="dateTime">
                            <DateTime
                                form={ this.props.form }
                                setInitDatetime={this._setInitDatetime}
                                firstLoad={this.state.firstLoad}
                                setFirstLoad={this._setFirstLoad}
                            />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG2502"})} key="changeTime">
                            <ChangeTime
                                form={ this.props.form }
                            />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG2491"})} key="NTPServer">
                            <NTPServer
                                form={ this.props.form }
                                setInitNTP={this._setInitNTP}
                            />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG3271"})} key="officetime">
                            <OfficeTime />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG3266"})} key="holidaytime">
                            <HolidayTime />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(TimeSettings))

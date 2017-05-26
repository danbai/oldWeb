'use strict'

import React, { Component, PropTypes } from 'react'
import {injectIntl} from 'react-intl'
import Security from './security'
import Reg from './registration'
import General from './general'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { Form, Input, Tabs, message, Modal } from 'antd'
const TabPane = Tabs.TabPane
import _ from 'underscore'
import { browserHistory } from 'react-router'

const baseServerURl = api.apiHost
const confirm = Modal.confirm
class IaxSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            IAXGenSettings: {
                mohinterpret: 'defalut',
                mohsuggest: 'defalut'
            },
            IAXSecSettings: {},
            IAXRegSettings: {},
            activeKey: "IAXGenSettings",
            limitList: []
        }
    }
    componentDidMount() {
        this._getIAXGenSettings()
        this._getIAXSecSettings()
        this._getIAXRegSettings()
    }
    componentWillUnmount() {

    }
    _onChange = (activeKey) => {
        this.setState({
            activeKey
        })
    }
    _getIAXGenSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getIAXGenSettings' },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        IAXGenSettings = res.iax_general_settings
                    this.setState({
                        IAXGenSettings: IAXGenSettings
                    })
                }
            }.bind(this)
        })        
    }
    _getIAXSecSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getIAXSecSettings' },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        IAXSecSettings = res.iax_security_settings

                    const limitList = res.iax_security_calllimit_settings || []
                    this.setState({
                        IAXSecSettings: IAXSecSettings,
                        limitList: limitList
                    })
                }
            }.bind(this)
        }) 
    }
    _getIAXRegSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getIAXRegSettings' },
            type: 'json',
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let res = data.response,
                        IAXRegSettings = res.iax_reg_settings
                    this.setState({
                        IAXRegSettings: IAXRegSettings
                    })
                }
            }.bind(this)
        })        
    }
    _handleCancel = () => {
        const { formatMessage } = this.props.intl
        const form = this.props.form
        let activeKey = this.state.activeKey
        
        if (activeKey === "IAXGenSettings") {
            this._getIAXGenSettings()
            this.props.form.resetFields(['bindport', 'bindaddr', 'bindaddr6', 'iaxcompat',
                'nochecksums', 'delayreject', 'adsi', 'mohinterpret', 'mohsuggest', 'language',
                'bandwidth'])
        } else if (activeKey === "IAXRegSettings") {
            this._getIAXRegSettings()
            this.props.form.resetFields(['minregexpire', 'maxregexpire', 'iaxthreadcount', 'iaxmaxthreadcount',
                'autokill', 'authdebug', 'codecpriority', 'tos', 'trunkfreq', 'trunktimestamps'])
        } else if (activeKey === "IAXSecSettings") {
            this._getIAXSecSettings()
            this.props.form.resetFields(['calltokenoptional', 'maxcallnumbers', 'maxcallnumbers_nonvalidated',
                'ip', 'number'])
        }
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            // delete err.white_ip_addr
            let activeKey = this.state.activeKey
            let action = {}
            let me = this
            let refs = this.refs
            let isChange = false
            if (activeKey === "IAXGenSettings") {
                action["action"] = "updateIAXGenSettings"
                action["bindport"] = values.bindport
                action["bindaddr"] = values.bindaddr
                action["bindaddr6"] = values.bindaddr6
                action["iaxcompat"] = values.iaxcompat ? "yes" : "no"
                action["nochecksums"] = values.nochecksums ? "yes" : "no"
                action["delayreject"] = values.delayreject ? "yes" : "no"
                action["adsi"] = values.adsi ? "yes" : "no"
                action["mohinterpret"] = values.mohinterpret
                action["mohsuggest"] = values.mohsuggest
                action["language"] = values.language
                action["bandwidth"] = values.bandwidth
                if (action.bindport !== this.state.IAXGenSettings.bindport || action.bindaddr !== this.state.IAXGenSettings.bindaddr || action.bindaddr6 !== this.state.IAXGenSettings.bindaddr6) {
                    isChange = true
                }
            } else if (activeKey === "IAXRegSettings") {
                action["action"] = "updateIAXRegSettings"
                action["minregexpire"] = values.minregexpire
                action["maxregexpire"] = values.maxregexpire
                action["iaxthreadcount"] = values.iaxthreadcount
                action["iaxmaxthreadcount"] = values.iaxmaxthreadcount
                action["autokill"] = values.autokill
                action["authdebug"] = values.authdebug ? "yes" : "no"
                action["codecpriority"] = values.codecpriority
                action["tos"] = values.tos
                action["trunkfreq"] = values.trunkfreq
                action["trunktimestamps"] = values.trunktimestamps ? "yes" : "no"
            } else if (activeKey === "IAXSecSettings") {
                let IAXSecSettingsAction = {}
                action["action"] = "updateIAXSecSettings"
                action["calltokenoptional"] = values.calltokenoptional
                action["maxcallnumbers"] = values.maxcallnumbers
                action["maxcallnumbers_nonvalidated"] = values.maxcallnumbers_nonvalidated
                let callnumberlimits = []
                _.map(this.state.limitList, function(key, index) {
                    callnumberlimits.push(key.callnumberlimits)
                })
                action["callnumberlimits"] = callnumberlimits.join(';')
            }
            for (let key in action) {
                if (action.hasOwnProperty(key) && key !== "action") {
                    let divKey = refs["div_" + key]
                    if (divKey && 
                       divKey.props &&
                        ((divKey.props.className &&
                        divKey.props.className.indexOf("hidden") === -1) ||
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
                url: baseServerURl,
                method: "post",
                data: action,
                type: 'json',
                error: function(e) {
                    message.error(e.statusText)
                },
                success: function(data) {
                    let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                    if (bool) {
                        message.destroy()
                        message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}} ></span>)
                        me._applyReboot(isChange)
                    }
                }.bind(this)
            })
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
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG927" })}}></span>,
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"}),
                onOk: this._applyChangeAndReboot.bind(this),
                onCancel: this._cancelReboot.bind(this)
            })
        }
    }
    _setLimitList = (e) => {
        this.setState({
            limitList: e
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG34"})
        })
        return (
            <div className="app-content-main" id="app-content-main">
                <Title 
                    headerTitle={ formatMessage({id: "LANG34"}) }  
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
                        <TabPane tab={formatMessage({id: "LANG3"})} key="IAXGenSettings">
                            <General 
                                form={ this.props.form }
                                IAXGenSettings={ this.state.IAXGenSettings }
                            />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG681"})} key="IAXRegSettings">
                            <Reg 
                                form={ this.props.form }
                                IAXRegSettings={ this.state.IAXRegSettings }
                            />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG683"})} key="IAXSecSettings">
                            <Security 
                                form={ this.props.form }
                                IAXSecSettings={ this.state.IAXSecSettings }
                                limitList={ this.state.limitList }
                                setLimitList={ this._setLimitList }
                            />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

IaxSettings.propTypes = {
}

export default Form.create()(injectIntl(IaxSettings))
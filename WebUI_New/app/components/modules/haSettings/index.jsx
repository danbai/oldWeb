'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import { Tabs, Form, message, Modal } from 'antd'
import {injectIntl, FormattedHTMLMessage} from 'react-intl'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'

import HaSettings from './haSetting'
import HaStatus from './haStatus'

const TabPane = Tabs.TabPane

class HA extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isDisplay: true,
            activeKey: "haSettings",
            settings: {},
            originalSettings: {},
            configList: [],
            checkList: [],
            originalConfigList: [],
            portList: [],
            originalPort: '',
            rangePortList: []
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }
    componentWillMount() {
        this._getHASettings()
        this._getInitData()
    }
    _onChange = (activeKey) => {
        if (activeKey === 'haSettings') {
            this.setState({
                isDisplay: true,
                activeKey
            })
        } else {
            this.setState({
                isDisplay: false,
                activeKey
            })
        }
    }
    _handleCancel = () => {
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
                let originalSettings = this.state.originalSettings
                let action = {}
                let needReboot = false
                let needPrompt = false
                let checkfxo = (this.state.checkList.indexOf("FXO1") === -1 ? 0 : 1) + (this.state.checkList.indexOf("FXO2") === -1 ? 0 : 2)
                let checkfxs = (this.state.checkList.indexOf("FXS1") === -1 ? 0 : 1) + (this.state.checkList.indexOf("FXS2") === -1 ? 0 : 2)
                action.action = "setHASetting"
                action.hbport = values.hbport
                action.hbpeerport = values.hbport
                action.haon = values.haon ? "1" : "0"
                action.hbto = values.hbto
                action.hbip = values.hbip
                action.hbpeerip = values.hbpeerip
                action.check_dt = this.state.checkList.indexOf("T1/E1") === -1 ? "0" : "1"
                action.check_fxo = checkfxo.toString()
                action.check_fxs = checkfxs.toString()
                if (action.hbport !== originalSettings.hbport ||
                    action.haon !== originalSettings.haon ||
                    action.hbip !== originalSettings.hbip ||
                    action.hbpeerip !== originalSettings.hbpeerip) {
                    needReboot = true
                }
                if (action.check_dt !== originalSettings.check_dt ||
                    action.check_fxo !== originalSettings.check_fxo ||
                    action.check_fxs !== originalSettings.check_fxs) {
                    needPrompt = true
                }
                if (needReboot || needPrompt) {
                    let tmp_content = (needPrompt ? formatMessage({id: 'LANG5381'}) : "") + (needReboot ? (formatMessage({id: 'LANG833'}) + formatMessage({id: 'LANG4385'})) : "")
                    let content = <span dangerouslySetInnerHTML={{__html: tmp_content}}></span>
                    Modal.confirm({
                        content: content,
                        okText: formatMessage({id: 'LANG727'}),
                        cancelText: formatMessage({id: 'LANG726'}),
                        onOk: () => {
                            this.saveChanges(action, needReboot)
                        },
                        onCancel: () => {
                        }
                    })
                } else {
                    this.saveChanges(action, needReboot)
                }
            }
        })
    }
    saveChanges =(action, needReboot) => {
        const { formatMessage } = this.props.intl
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
                    let bcStatus = data.response.bcStatus
                    if (bcStatus === 0 && needReboot) {
                        message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG844"}) + formatMessage({id: "LANG832"})}}></span>, 0)
                        UCMGUI.loginFunction.confirmReboot()
                    } else if (bcStatus !== 0 && needReboot) {
                        message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5649"}) + formatMessage({id: "LANG832"})}}></span>, 0)
                        UCMGUI.loginFunction.confirmReboot()
                    } else if (bcStatus !== 0 && !needReboot) {
                        message.success(formatMessage({id: "LANG5649"}))
                        this._getHASettings()
                    } else {
                        message.success(formatMessage({id: "LANG844"}))
                        this._getHASettings()
                    }
                }
            }.bind(this)
        })
    }
    onChangeCheckList =(key) => {
        this.setState({
            checkList: key
        })
    }
    _getInitData = () => {
        let portList = []
        const { formatMessage } = this.props.intl
        let usedPort = []
        let rangeUsedPort = []
        $.ajax({
            type: 'json',
            method: 'post',
            url: api.apiHost,
            data: {
                action: 'getUsedPortInfo'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    let usedport = response.usedport || []

                    usedport.map(function(item) {
                        if ($.inArray(item.port, usedPort) > -1 || $.inArray(item.port, rangeUsedPort) > -1) {

                        } else if (_.indexOf(item.port, '-') > -1) {
                            rangeUsedPort.push(item.port)
                        } else {
                            usedPort.push(item.port)
                        }
                    })

                    this.setState({
                        portList: usedPort,
                        rangePortList: rangeUsedPort
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getHASettings = () => {
        const { formatMessage } = this.props.intl
        let settings = this.state.settings
        let configArr = []
        let originalConfigArr = []
        let checkArr = []
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getHASetting'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    settings = response || {}
                    let i = 0
                    let obj = {"label": "T1/E1", "value": "T1/E1"}
                    obj["disabled"] = settings.config_dt === "0"
                    configArr.push(obj)
                    obj = {"label": "FXO1", "value": "FXO1"}
                    obj["disabled"] = !(settings.config_fxo & 1)
                    configArr.push(obj)
                    obj = {"label": "FXO2", "value": "FXO2"}
                    obj["disabled"] = !(settings.config_fxo & 2)
                    configArr.push(obj)
                    obj = {"label": "FXS1", "value": "FXS1"}
                    obj["disabled"] = !(settings.config_fxs & 1)
                    configArr.push(obj)
                    obj = {"label": "FXS2", "value": "FXS2"}
                    obj["disabled"] = !(settings.config_fxs & 2)
                    configArr.push(obj)

                    originalConfigArr = JSON.parse(JSON.stringify(configArr))

                    for (i = 0; i < configArr.length; i++) {
                        configArr[i].disabled = configArr[i].disabled || !(settings.haon === "1")
                    }

                    if (settings.check_dt === "1") {
                        checkArr.push("T1/E1")
                    }
                    if (settings.check_fxo & 1) {
                        checkArr.push("FXO1")
                    }
                    if (settings.check_fxo & 2) {
                        checkArr.push("FXO2")
                        originalConfigArr.push
                    }
                    if (settings.check_fxs & 1) {
                        checkArr.push("FXS1")
                    }
                    if (settings.check_fxs & 2) {
                        checkArr.push("FXS2")
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            settings: settings,
            originalSettings: settings,
            configList: configArr,
            checkList: checkArr,
            originalPort: settings.hbport,
            originalConfigList: originalConfigArr
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const state = this.state

        return (
            <div className="app-content-main" id="app-content-main">
                <Title 
                    headerTitle={ formatMessage({id: "LANG4359"}) } 
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay={ this.state.isDisplay ? "display-block" : "hidden" } 
                />
                <Form className="form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={formatMessage({id: "LANG4360"})} key="haSettings">
                            <HaSettings
                                activeKey={ this.state.activeKey }
                                form={ this.props.form }
                                settings={this.state.settings}
                                configList={this.state.configList}
                                onChangeCheckList={this.onChangeCheckList}
                                checkList={this.state.checkList}
                                portList={this.state.portList}
                                rangeUsedPort={this.state.rangeUsedPort}
                                rangePortList={this.state.rangePortList}
                                originalPort={this.state.originalPort}
                                originalConfigList={this.state.originalConfigList}
                            />
                        </TabPane>
                        <TabPane tab={formatMessage({id: "LANG5638"})} key="haStatus">
                            <HaStatus activeKey={ this.state.activeKey } form={ this.props.form } /> 
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
        )
    }
}

HA.propTypes = {
}

export default Form.create()(injectIntl(HA))

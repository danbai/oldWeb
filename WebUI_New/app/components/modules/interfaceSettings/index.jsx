'use strict'

import { injectIntl } from 'react-intl'
import { browserHistory } from 'react-router'
import { Tabs, Modal, message, Form } from 'antd'
import React, { Component, PropTypes } from 'react'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'

import AnalogHardware from './analogHardware'
import DigitalHardware from './digitalHardware'
import DahdiSettings from './dahdiSettings'

const TabPane = Tabs.TabPane

class InterfaceSettings extends Component {
    constructor(props) {
        super(props)

        let model_info = JSON.parse(localStorage.getItem('model_info'))
        let numPri = Number(model_info.num_pri)
        let activeKey = this.props.params.id ? this.props.params.id : (numPri >= 1 ? '1' : '2')

        this.state = {
            dahdiSettings: {},
            fxsTissShow: false,
            activeKey: activeKey,
            hardware_global_settings: {}
        }
    }
    componentDidMount() {
        this._getAnalogSettings()
        this._getDahdiSettings()
    }
    componentWillUnmount() {

    }
    _onChange = (activeKey) => {
        if (activeKey === "1") {
            this.setState({
                activeKey: activeKey
            })
        } else {
            this.setState({
                activeKey: activeKey
            })
        }
    }
    _getAnalogSettings = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getAnalogSettings'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const hardware_global_settings = response.hardware_global_settings
                    const fxsTissShow = hardware_global_settings.fxs_override_tiss === 1

                    this.setState({
                        hardware_global_settings: hardware_global_settings,
                        fxsTissShow: fxsTissShow
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getDahdiSettings = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getChanDahdiSettings'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const chan_dahdi_settings = response.chan_dahdi_settings || {}

                    this.setState({
                        dahdiSettings: chan_dahdi_settings
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _updateTiss = (e) => {
        this.setState({
            fxsTissShow: e
        })
    }
    _handleCancel = (e) => {
        const { resetFields } = this.props.form

        let activeKey = this.state.activeKey

        if (activeKey === '2') {
            this._getAnalogSettings()
        } else if (activeKey === '3') {
            this._getDahdiSettings()
        }

        resetFields()
    }
    _reBoot = () => {
        UCMGUI.loginFunction.confirmReboot()
    }
    _handleSubmit = (e) => {
        const { formatMessage } = this.props.intl
        const __this = this

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        let errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
                const hardware_global_settings = this.state.hardware_global_settings

                let action = {}
                let needReboot = false
                let activeKey = this.state.activeKey

                if (activeKey === '2') {
                    action.action = 'updateAnalogSettings'
                    action.fxs_override_tiss = values.fxs_override_tiss ? 1 : 0

                    for (let item in values) {
                        if ((hardware_global_settings[item] + '') !== values[item]) {
                            if (item !== 'fxs_override_tiss') {
                                action[item] = values[item]
                            }

                            if (item === 'alawoverride') {
                                needReboot = true
                            } else if (item === 'fxo_opermode') {
                                action["ifACIMautodetect"] = "no"
                            }
                        }
                    }

                    delete action.buffers
                    delete action.faxbuffers
                } else if (activeKey === '3') {
                    action.buffers = values.buffers
                    action.faxbuffers = values.faxbuffers
                    action.action = 'updateChanDahdiSettings'
                }

                $.ajax({
                    data: action,
                    type: 'post',
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)

                            if (needReboot) {
                                Modal.confirm({
                                    onOk: __this._reBoot.bind(this),
                                    okText: formatMessage({id: "LANG727"}),
                                    cancelText: formatMessage({id: "LANG726"}),
                                    content: <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG927"}) }}></span>
                                })
                            }
                        }

                        this._handleCancel()
                    }.bind(this)
                })
            }
        })
    }
    _renderPage = () => {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let numPri = Number(model_info.num_pri)

        if (numPri >= 1) {
            return (
                <div>
                    <Title
                        onCancel={ this._handleCancel }
                        onSubmit={ this._handleSubmit.bind(this) }
                        headerTitle={ formatMessage({id: "LANG5303"}) }
                        isDisplay={ this.state.activeKey === '1' ? 'hidden' : 'display-block' }
                    />
                    <Tabs
                        onChange={ this._onChange }
                        activeKey={ this.state.activeKey }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG686"}) } key="1">
                            <DigitalHardware />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG687"}) } key="2">
                            <AnalogHardware
                                form={ this.props.form }
                                updateTiss={ this._updateTiss }
                                fxsTissShow={ this.state.fxsTissShow }
                                hardware_global_settings={ this.state.hardware_global_settings }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG5629"}) } key="3">
                            <DahdiSettings
                                form={ this.props.form }
                                dahdiSettings={ this.state.dahdiSettings }
                            />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return (
                <div>
                    <Title
                        isDisplay="display-block"
                        onCancel={ this._handleCancel }
                        onSubmit={ this._handleSubmit.bind(this) }
                        headerTitle={ formatMessage({id: "LANG5303"}) }
                    />
                    <Tabs
                        onChange={ this._onChange }
                        activeKey={ this.state.activeKey }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG687"}) } key="2">
                            <AnalogHardware
                                form={ this.props.form }
                                updateTiss={ this._updateTiss }
                                fxsTissShow={ this.state.fxsTissShow }
                                hardware_global_settings={ this.state.hardware_global_settings }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG5629"}) } key="3">
                            <DahdiSettings
                                form={ this.props.form }
                                dahdiSettings={ this.state.dahdiSettings }
                            />
                        </TabPane>
                    </Tabs>
                    
                </div>
            )
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG5303"})
                })

        return (
            <div className="app-content-main" id="app-content-main">
                { this._renderPage() }
            </div>
        )
    }
}

InterfaceSettings.propTypes = {}

export default Form.create()(injectIntl(InterfaceSettings))
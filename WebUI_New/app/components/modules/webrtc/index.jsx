'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { injectIntl } from 'react-intl'
import Title from '../../../views/title'
import { Form, Input, message, Tabs } from 'antd'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'

import WebSocket from './websocket'
import SmartRoute from './smartroute'
import CloudService from './cloudservice'

const TabPane = Tabs.TabPane

class WebRTC extends Component {
    constructor(props) {
        super(props)

        this.state = {
            portList: []
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
        this._getInitData()
    }
    _getInitData = () => {
        let portList = []
        const { formatMessage } = this.props.intl

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

                    portList = response.usedport || []

                    this.setState({
                        portList: portList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = (e) => {
        browserHistory.push('/value-added-features/webrtc')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()
        const form = this.props.form
        const { formatMessage } = this.props.intl

        form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                message.loading(formatMessage({ id: "LANG826" }), 0)

                let childAction = []
                let updateWebRTCParamList = []
                let updateWebRTCSettings = {
                    'updateSIPWebRTCHttpSettings': ''
                }

                _.map(values, function(value, key) {
                    if (key === 'ws_websocket_interface' || key === 'ws_secure_websocket_interface') {
                        return false
                    }

                    if (key.indexOf('ws_') === 0) {
                        let keyValue = key.slice(3) + '=' + (value !== undefined && value !== null ? encodeURIComponent(UCMGUI.transCheckboxVal(value)) : '')

                        updateWebRTCParamList.push(keyValue)
                    }
                })

                updateWebRTCSettings.updateSIPWebRTCHttpSettings = updateWebRTCParamList.join('&')

                childAction.push(updateWebRTCSettings)

                $.ajax({
                    type: 'json',
                    method: "get",
                    url: api.apiHost + 'action=combineAction&data=' + JSON.stringify(childAction),
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>, 2)

                            this._handleCancel()
                        }
                    }.bind(this)
                })
            }
        })
    }
    _onChangeTabs = (activeKey) => {
        // this.props.form.validateFields((err, values) => {
        //     if (!err) {
        //         return false
        //     }
        // })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const title = formatMessage({id: "LANG4263"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    isDisplay='display-block'
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                />
                <Form className="form-contain-tab">
                    <Tabs
                        defaultActiveKey="1"
                        onChange={ this._onChangeTabs }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG4396"}) } key="1">
                            <WebSocket
                                form={ form }
                                portList={ this.state.portList }
                            />
                        </TabPane>
                        {/* <TabPane tab={ formatMessage({id: "LANG4505"}) } key="2">
                            <CloudService
                                form={ form }
                                portList={ this.state.portList }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG4496"}) } key="3">
                            <SmartRoute
                                form={ form }
                                portList={ this.state.portList }
                            />
                        </TabPane> */}
                    </Tabs>
                </Form>
            </div>
        )
    }
}

WebRTC.propTypes = {}

export default Form.create()(injectIntl(WebRTC))
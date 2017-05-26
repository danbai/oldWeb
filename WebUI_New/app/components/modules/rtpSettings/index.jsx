'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Form, Input, message, Tabs } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import RTP from './rtp'
import Payload from './payload'

const FormItem = Form.Item
const TabPane = Tabs.TabPane
const baseServerURl = api.apiHost

class RTPSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeKey: "RTP",
            payloadSettings: {},
            initPayloadSettings: {},
            disable726: true,
            settings: {}
        }
    }
    componentDidMount() {
    }
    componentWillMount() {
        this._getRTPSettings()
        this._getPayloadSettings()
    }
    _getRTPSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getRTPSettings' },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response || {}

                this.setState({
                    settings: response.rtp_settings || {}
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getPayloadSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getPayloadSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response || {}

                this.setState({
                    payloadSettings: response.payload_settings[0] || {},
                    initPayloadSettings: response.payload_settings[0] || {},
                    disable726: response.payload_settings[0].option_g726_compatible_g721 === 'yes'
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }

    _handleCancel = () => {
        // browserHistory.push('/pbx-settings/rtpSettings')
        const { resetFields } = this.props.form
        if (this.state.activeKey === "RTP") {            
            resetFields(["strictrtp", "rtpchecksums", "icesupport", "rtpstart", "rtpend", 
                        "stunaddr", "bfcpstart", "bfcpend", "bfcp_tcp_start", "bfcp_tcp_end", "turnaddr",
                        "turnusername", "turnpassword"])
            this._getRTPSettings()
        } else if (this.state.activeKey === "Payload") {
            resetFields(['ast_format_g726_aal2',
                'ast_rtp_dtmf',
                'option_g726_compatible_g721',
                'ast_format_g726',
                'ast_format_ilbc',
                'ast_format_opus',
                'ast_format_h264',
                'h263p_1',
                'h263p_2',
                'ast_format_vp8',
                'ast_format_main_video_fec',
                'ast_format_slides_video_fec',
                'ast_format_audio_fec',
                'ast_format_fecc'])
            this.getPayloadSettings()
        }
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG815" })}}></span>
        let activeKey = this.state.activeKey

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            console.log('Received values of form: ', values)

            if (activeKey === "RTP") {            
                let action_rtp = {},
                    flag = false,
                    optionsArr = ["strictrtp", "rtpchecksums", "icesupport", "rtpstart", "rtpend", 
                        "stunaddr", "bfcpstart", "bfcpend", "bfcp_tcp_start", "bfcp_tcp_end", "turnaddr",
                        "turnusername", "turnpassword"]

                action_rtp.action = 'updateRTPSettings'
                optionsArr.map(function(it) {
                    if (err && err.hasOwnProperty(it)) {
                        flag = true   
                    } else {                        
                        action_rtp[it] = values[it]
                        if (values[it] === true) {
                            action_rtp[it] = "yes"
                        } else if (values[it] === false) {
                            action_rtp[it] = "no"
                        }
                    } 
                })
                if (action_rtp.stunaddr && action_rtp.stunaddr.indexOf(':') > -1 && action_rtp.stunaddr.indexOf('[') < 0) {
                    action_rtp.stunaddr = '[' + action_rtp.stunaddr + ']'
                }
                if (action_rtp.turnaddr && action_rtp.turnaddr.indexOf(':') > -1 && action_rtp.turnaddr.indexOf('[') < 0) {
                    action_rtp.turnaddr = '[' + action_rtp.turnaddr + ']'
                }
                
                // action_rtp.strictrtp = (values.strictrtp ? 'yes' : 'no')
                // action_rtp.rtpchecksums = (values.rtpchecksums ? 'yes' : 'no')
                // action_rtp.icesupport = (values.icesupport ? 'yes' : 'no')

                // action_rtp.rtpstart = values.rtpstart
                // action_rtp.rtpend = values.rtpend
                // action_rtp.stunaddr = values.stunaddr
                // action_rtp.bfcpstart = values.bfcpstart
                // action_rtp.bfcpend = values.bfcpend
                // action_rtp.bfcp_tcp_start = values.bfcp_tcp_start
                // action_rtp.bfcp_tcp_end = values.bfcp_tcp_end
                // action_rtp.turnaddr = values.turnaddr
                // action_rtp.turnusername = values.turnusername
                // action_rtp.turnpassword = values.turnpassword
                if (flag) {
                    return 
                }
                message.loading(formatMessage({ id: "LANG826" }), 0)   
                $.ajax({
                    url: baseServerURl,
                    method: "post",
                    data: action_rtp,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                        }
                    }.bind(this)
                })
            }

            if (activeKey === "Payload") {
                let action_payload = {},
                    flag = false,
                    optionsArr = ["ast_format_g726_aal2", "ast_rtp_dtmf", "option_g726_compatible_g721", "ast_format_ilbc",
                        "ast_format_opus", "ast_format_h264", "ast_format_vp8", "ast_format_main_video_fec", "ast_format_slides_video_fec", 
                        "ast_format_audio_fec", "ast_format_fecc", "ast_format_h263_plus", "ast_format_g726"]

                action_payload.action = 'updatePayloadSettings'
                optionsArr.map(function(it) {
                    if (err && err.hasOwnProperty(it)) {
                        flag = true   
                    } else {
                        if (it === "ast_format_h263_plus") {
                            action_payload["ast_format_h263_plus"] = values.h263p_1 + ',' + values.h263p_2
                        } else {                            
                            action_payload[it] = values[it]
                            if (values[it] === true) {
                                action_payload[it] = "yes"
                            } else if (values[it] === false) {
                                action_payload[it] = "no"
                            }
                        }                        
                    } 
                })
                // action_payload.ast_format_g726_aal2 = values.ast_format_g726_aal2
                // action_payload.ast_rtp_dtmf = values.ast_rtp_dtmf
                // action_payload.option_g726_compatible_g721 = values.option_g726_compatible_g721 ? 'yes' : 'no'
                // action_payload.ast_format_ilbc = values.ast_format_ilbc
                // action_payload.ast_format_opus = values.ast_format_opus
                // action_payload.ast_format_h264 = values.ast_format_h264
                // action_payload.ast_format_vp8 = values.ast_format_vp8
                // action_payload.ast_format_main_video_fec = values.ast_format_main_video_fec
                // action_payload.ast_format_slides_video_fec = values.ast_format_main_video_fec
                // action_payload.ast_format_audio_fec = values.ast_format_main_video_fec
                // action_payload.ast_format_fecc = values.ast_format_fecc
                // action_payload.ast_format_h263_plus = values.h263p_1 + ',' + values.h263p_2
                // action_payload.ast_format_g726 = values.ast_format_g726
                if (flag) {
                    return 
                }
                message.loading(formatMessage({ id: "LANG826" }), 0)
                $.ajax({
                    url: baseServerURl,
                    method: "post",
                    data: action_payload,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        let bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                        }
                    }.bind(this)
                })
            }
        })
    }
    _setPageLoad = (key, value) => {
        if (key === 'rtp') {
            this.setState({
                rtpLoad: value
            })
        } else if (key === 'payload') {
            this.setState({
                payloadLoad: value
            })
        }
    }
    _onChange = (activeKey) => {
        this.setState({
            activeKey
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const title = formatMessage({id: "LANG676"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main app-content-extension">
                <Title
                    headerTitle={ title }
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                    isDisplay='display-block'
                />
                <Form className="form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG676"}) } key="RTP">
                            <RTP
                                form={ form }
                                settings = { this.state.settings }
                            />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG2899"}) } key="Payload">
                            <Payload
                                form={ form }
                                payloadSettings = { this.state.payloadSettings }
                                initPayloadSettings = { this.state.initPayloadSettings }
                                disable726 = { this.state.disable726 }
                            />
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(RTPSettings))
'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Row, Col, Icon, Table, Button, message, Select, Tooltip, Checkbox } from 'antd'
import { FormattedMessage, FormattedHTMLMessage, injectIntl} from 'react-intl'
import Title from '../../../views/title'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import _ from 'underscore'

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost

class UserWebrtcItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            
        }
        this._handleSubmit = (e) => {
            const { formatMessage } = this.props.intl
            const form = this.props.form 

            let action = {}

            this.props.form.validateFieldsAndScroll((err, values) => {
                let me = this
                let refs = this.refs

                for (let key in values) {
                    if (values.hasOwnProperty(key)) {
                        let divKey = refs["div_" + key]

                        if (!err || (err && typeof err[key] === "undefined")) {
                            action[key] = values[key]  
                        } else {
                            return
                        }
                    }
                }
                this._settingsSave()
            })
        }
        this._handleCancel = () => {
            browserHistory.push('/user-value-added-features/userWebrtc')
        }
    }
    componentDidMount() {

    }
    componentWillUnmount() {

    }
    _settingsSave = () => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        let ucm_user_name = localStorage.getItem("username")

        let txtIceServersVal = [],
            txtStunServerVal = getFieldValue("txtStunServer"),
            txtTurnServerUriVal = getFieldValue("txtTurnServerUri"),
            txtTurnServerUsrVal = getFieldValue("txtTurnServerUsr"),
            txtTurnServerPwsVal = getFieldValue("txtTurnServerPws")

        if (txtStunServerVal) {
            txtIceServersVal.push({
                url: "stun:" + txtStunServerVal
            })
        } else if (UCMGUI.initConfig.mozilla) {
            txtIceServersVal = [{ 
                url: 'stun:23.21.150.121:3478'
            }, { 
                url: 'stun:216.93.246.18:3478'
            }, { 
                url: 'stun:66.228.45.110:3478'
            }, { 
                url: 'stun:173.194.78.127:19302'
            }]
        }

        if (txtTurnServerUriVal && txtTurnServerUsrVal && txtTurnServerPwsVal) {
            let turnServer = {
                url: "turn:" + txtTurnServerUsrVal + "@" + txtTurnServerUriVal,
                credential: txtTurnServerPwsVal
            }

            if (UCMGUI.initConfig.mozilla) {
                turnServer = {
                    url: "turn:" + txtTurnServerUriVal,
                    username: txtTurnServerUsrVal,
                    credential: txtTurnServerPwsVal
                }
            }
            txtIceServersVal.push(turnServer)
        }

        if (txtIceServersVal.length !== 0) {
            txtIceServersVal = JSON.stringify(txtIceServersVal)
        } else {
            txtIceServersVal = ""
        }
        let action = {
            'action': 'updateWebRTCUserLogins',
            'user_name': ucm_user_name,
            'disable_video': getFieldValue('cbVideoDisable') ? 'yes' : 'no',
            'enable_webrtc_breaker': getFieldValue('cbRTCWebBreaker') ? 'yes' : 'no',
            'sip_outbound_proxy_url': getFieldValue('txtSIPOutboundProxyUrl'),
            'stun_server_addr': getFieldValue('txtStunServer'),
            'turn_server_addr': getFieldValue('txtTurnServerUri'),
            'turn_server_user_name': getFieldValue('txtTurnServerUsr'),
            'turn_server_password': getFieldValue('txtTurnServerPws'),
            'max_bandwidth': getFieldValue('txtBandwidth'),
            'video_size': getFieldValue('txtSizeVideo'),
            'disable_3gpp_early_ims': getFieldValue('cbEarlyIMS') ? 'yes' : 'no',
            'disable_debug_messages': getFieldValue('cbDebugMessages') ? 'yes' : 'no',
            'cache_media_stream': getFieldValue('cbCacheMediaStream') ? 'yes' : 'no',
            'ice_service': JSON.stringify(txtIceServersVal)
        }
        let sip_outbound_proxy_url = action["sip_outbound_proxy_url"]
        if (UCMGUI.isIPv6NoPort(sip_outbound_proxy_url)) {
            action["sip_outbound_proxy_url"] = "[" + sip_outbound_proxy_url + "]"
        }
        let stun_server_addr = action["stun_server_addr"]
        if (UCMGUI.isIPv6NoPort(stun_server_addr)) {
            action["stun_server_addr"] = "[" + stun_server_addr + "]"
        }
        let turn_server_addr = action["turn_server_addr"]
        if (UCMGUI.isIPv6NoPort(turn_server_addr)) {
            action["turn_server_addr"] = "[" + turn_server_addr + "]"
        }

        $.ajax({
            type: "post",
            url: baseServerURl,
            data: action,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    $.ajax({
                        url: baseServerURl,
                        data: {
                            action: "getWebRTCUserLogins",
                            user_name: ucm_user_name
                        },
                        type: 'POST',
                        dataType: 'json',
                        error: function(jqXHR, textStatus, errorThrown) {},
                        success: function(data) {
                            let bool = UCMGUI.errorHandler(data, null, formatMessage)

                            if (bool) {
                                browserHistory.push('/user-value-added-features/userWebrtc')
                            }
                        }
                    })
                    message.success(formatMessage({ id: "LANG4426" }))
                }
            }
        })
    }
    render() {
        const {formatMessage} = this.props.intl
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        let state = this.state,
            oWebrtcInputConf = this.props.location.state

        return (
            <div className="app-content-main" id="app-content-main">
                <Title 
                    headerTitle={ formatMessage({id: "LANG229"}) }
                    onSubmit={ this._handleSubmit.bind(this) } 
                    onCancel={ this._handleCancel }   
                    isDisplay='display-block' 
                />
                <div className="content">
                    <Form>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4240" />}>
                                            <span>{ formatMessage({id: "LANG4239"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('cbVideoDisable', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: oWebrtcInputConf.disable_video === "yes" ? true : false
                                    })(
                                        <Checkbox />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4242" />}>
                                            <span>{ formatMessage({id: "LANG4241"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('cbRTCWebBreaker', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: oWebrtcInputConf.enable_webrtc_breaker === "yes" ? true : false
                                    })(
                                        <Checkbox />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    className="hidden"
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4244" />}>
                                            <span>{ formatMessage({id: "LANG4243"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtWebsocketServerUrl', {
                                        rules: [],
                                        initialValue: ""
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4246" />}>
                                            <span>{ formatMessage({id: "LANG4245"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtSIPOutboundProxyUrl', {
                                        rules: [],
                                        initialValue: oWebrtcInputConf.sip_outbound_proxy_url || ""
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG1576" />}>
                                            <span>{ formatMessage({id: "LANG1575"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtStunServer', {
                                        rules: [],
                                        initialValue: oWebrtcInputConf.stun_server_addr || ""
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                               <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4420" />}>
                                            <span>{ formatMessage({id: "LANG4419"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtTurnServerUri', {
                                        rules: [],
                                        initialValue: oWebrtcInputConf.turn_server_addr || ""
                                    })(
                                        <Input />
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={12}>
                                
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                               <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4416" />}>
                                            <span>{ formatMessage({id: "LANG4415"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtTurnServerUsr', {
                                        rules: [],
                                        initialValue: oWebrtcInputConf.turn_server_user_name || ""
                                    })(
                                        <Input />
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4418" />}>
                                            <span>{ formatMessage({id: "LANG4417"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtTurnServerPws', {
                                        rules: [],
                                        initialValue: oWebrtcInputConf.turn_server_password || ""
                                    })(
                                        <Input />
                                    )}
                                </FormItem> 
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                               <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4250" />}>
                                            <span>{ formatMessage({id: "LANG4249"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtBandwidth', {
                                        rules: [],
                                        initialValue: oWebrtcInputConf.max_bandwidth || ""
                                    })(
                                        <Input />
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4252" />}>
                                            <span>{ formatMessage({id: "LANG4251"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('txtSizeVideo', {
                                        rules: [],
                                        initialValue: oWebrtcInputConf.video_size || ""
                                    })(
                                        <Input />
                                    )}
                                </FormItem> 
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4254" />}>
                                            <span>{ formatMessage({id: "LANG4253"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('cbEarlyIMS', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: oWebrtcInputConf.disable_3gpp_early_ims === 'yes' ? true : false
                                    })(
                                        <Checkbox />
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4256" />}>
                                            <span>{ formatMessage({id: "LANG4255"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('cbDebugMessages', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: oWebrtcInputConf.disable_debug_messages === 'yes' ? true : false
                                    })(
                                        <Checkbox />
                                    )}
                                </FormItem> 
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    { ...formItemLayout }
                                    label={(
                                        <Tooltip title={<FormattedHTMLMessage id="LANG4258" />}>
                                            <span>{ formatMessage({id: "LANG4257"}) }</span>
                                        </Tooltip>
                                    )}>
                                    { getFieldDecorator('cbCacheMediaStream', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: oWebrtcInputConf.cache_media_stream === 'yes' ? true : false
                                    })(
                                        <Checkbox />
                                    )}
                                </FormItem> 
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    className="hidden"
                                    { ...formItemLayout }
                                    label="">
                                    { getFieldDecorator('cbCallButtonOptions', {
                                        rules: [],
                                        valuePropName: 'checked',
                                        initialValue: false
                                    })(
                                        <Checkbox />
                                    )}
                                </FormItem> 
                            </Col>
                        </Row>
                    </Form>                     
                </div>
            </div>
        )
    }
}

module.exports = Form.create()(injectIntl(UserWebrtcItem))
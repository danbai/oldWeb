'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, TimePicker } from 'antd'
import moment from "moment"

const FormItem = Form.Item
const Option = Select.Option
const addZero = UCMGUI.addZero

class DHCPClientItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ipList: [],
            macList: [],
            dhcp_settings: {}
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }

    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        const id = this.props.params.id
        let ipList = this.state.ipList || []
        let macList = this.state.macList || []
        let dhcp_settings = this.state.dhcp_settings || {}

        $.ajax({
            url: api.apiHost,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: "getNetworkSettings"
            },
            success: function(data) {
                const bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    const response = data.response || {}
                    dhcp_settings = data.response.dhcp_settings
               }
           }
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listDHCPClient'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const dhcplist = response.dhcp_client_list
                    dhcplist.map(function(item) {
                        macList.push(item.mac)
                        ipList.push(item.ip)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            ipList: ipList,
            macList: macList,
            dhcp_settings: dhcp_settings
        })
    }
    _handleCancel = () => {
        browserHistory.push('/system-settings/networkSettings/DHCPClient')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const id = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = {}
                action["ip"] = values.ip
                action["isbind"] = "yes"
                action["mac"] = values.mac

                if (id) {
                    action.action = 'updateDHCPClient'
                } else {
                    action.action = 'addDHCPClient'
                }

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
                            message.destroy()
                            message.success(successMessage)
                        }

                        this._handleCancel()
                    }.bind(this)
                })
            }
        })
    }
    _checkMacIsExsit = (ele, val, callback) => {
        const { formatMessage } = this.props.intl
        let aMac = this.state.macList
        let res = true
        for (var i = 0; i < aMac.length; i++) {
            if (aMac[i] === val) {
                res = false
                break
            }
        }

        if (!res) {
            callback(formatMessage({id: "LANG2134"}))
        } else {
            callback()
        }
    }
    _checkIp = (ele, val, callback) => {
        const { formatMessage } = this.props.intl
        var dhcp_submask = this.state.dhcp_settings.dhcp_submask,
            dhcp_gateway = this.state.dhcp_settings.dhcp_gateway,
            aGateWay = dhcp_gateway.split('.'),
            aVal = val.split('.')
        let res = false

        if (val === dhcp_gateway || aVal[3] === 255) {
            res = false
        }

        if (/^255.255.255.*$/.test(dhcp_submask)) {
            if (aVal[0] === aGateWay[0] && aVal[1] === aGateWay[1] && aVal[2] === aGateWay[2]) {
                res = true
            }
        } else if (/^255.255.*$/.test(dhcp_submask)) {
            if (aVal[0] === aGateWay[0] && aVal[1] === aGateWay[1]) {
                res = true
            }
        } else if (/^255.*$/.test(dhcp_submask)) {
            if (aVal[0] === aGateWay[0]) {
                res = true
            }
        }

        if (!res) {
            callback(formatMessage({id: "LANG2176"}))
        } else {
            callback()
        }
    }
    _checkIpIsExsit = (ele, val, callback, formatMessage, msg) => {
        let res = true
        let aIp = this.state.ipList
        let ip = this.props.params.name

        for (var i = 0; i < aIp.length; i++) {
            if (ip && ip === val) {
                res = true
                break
            }

            if (aIp[i] === val) {
                res = false
                break
            }
        }

        if (!res) {
            callback(formatMessage({id: "LANG270"}, {0: msg}))
        } else {
            callback()
        }
    }
    _checkLanIp = (ele, val, callback) => {
        const { formatMessage } = this.props.intl
        var dhcp_lanip = this.state.dhcp_settings.dhcp_ipaddr

        if (val === dhcp_lanip) {
            callback(formatMessage({id: "LANG5045"}))
        } else {
            callback()
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        let mac = this.props.params.id
        let ip = this.props.params.name
        let isbind = this.props.params.isbind

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const tmptitle = ((isbind === "yes")
                ? formatMessage({id: "LANG4588"}, {
                    0: this.props.params.id
                })
                : formatMessage({id: "LANG4720"}, {
                    0: this.props.params.id
                }))
        const title = (this.props.params.id
                ? tmptitle : formatMessage({id: "LANG4587"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                    isDisplay='display-block'
                />
                <div className="content">
                    <Form>
                        <div className={ mac ? "hidden" : "display-block" }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4653" /> }>
                                            <span>{ formatMessage({id: "LANG154"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('mac', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: mac === undefined,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            mac === undefined ? Validator.mac(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            mac === undefined ? this._checkMacIsExsit(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: mac
                                })(
                                    <Input/>
                                ) }
                            </FormItem>
                        </div>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4654" /> }>
                                        <span>{ formatMessage({id: "LANG155"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('ip', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.ipAddress(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkIp
                                }, {
                                    validator: (data, value, callback) => {
                                        this._checkIpIsExsit(data, value, callback, formatMessage, 'IP')
                                    }
                                }, {
                                    validator: this._checkLanIp
                                }],
                                initialValue: ip
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(DHCPClientItem))
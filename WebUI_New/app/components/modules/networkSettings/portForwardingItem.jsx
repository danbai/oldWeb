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
import { Col, Form, Input, message, Modal, Transfer, Tooltip, Checkbox, Select, TimePicker } from 'antd'
import moment from "moment"

const FormItem = Form.Item
const Option = Select.Option
const addZero = UCMGUI.addZero

class PortForwardingItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            portForwarding: {
                protocol: "0"
            },
            usedPort: ["22"],
            rangeUsedPort: [],
            existWanPort: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
        this._getUsedPort()
    }

    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        const id = this.props.params.id
        const oldWANPort = this.props.params.name
        let portForwarding = this.state.portForwarding || {}
        let existWanPort = this.state.existWanPort || []

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listPortForwarding',
                sidx: 'id',
                sord: 'asc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)
                if (bool) {
                    const response = res.response || {}
                    const portForwardingList = response.id || []
                    _.each(portForwardingList, function(num, key) {
                        if (_.indexOf(existWanPort, num) === -1) {
                            if (num.wan_port.indexOf("-") === -1) {
                                existWanPort.push(num.wan_port)
                            } else {
                                let aRange = num.wan_port.split("-"),
                                    nStart = parseInt(aRange[0]),
                                    nStop = parseInt(aRange[1])

                                for (var j = nStart; j <= nStop; j++) {
                                    existWanPort.push(j.toString())
                                }
                            }
                        }
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (id && oldWANPort) {
            if (_.indexOf(oldWANPort, "-") === -1) {
                existWanPort = _.without(existWanPort, oldWANPort)
            } else {
                let aRange = oldWANPort.split("-"),
                    nStart = parseInt(aRange[0]),
                    nStop = parseInt(aRange[1])

                for (var j = nStart; j <= nStop; j++) {
                    existWanPort = _.without(existWanPort, j.toString())
                }
            }

            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getPortForwarding',
                    id: id
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        portForwarding = response.id
                        portForwarding['protocol'] = response.id['protocol'].toString()
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        this.setState({
            portForwarding: portForwarding,
            existWanPort: existWanPort
        })
    }
    _handleCancel = () => {
        browserHistory.push('/system-settings/networkSettings/portForwarding')
    }
    _savePortForwarding = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const { form } = this.props
        const id = this.props.params.id
        let values = form.getFieldsValue()

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>
        message.loading(loadingMessage)

        let action = {}
        action["id"] = values.id
        action["wan_port"] = values.wan_port
        action["lan_ip"] = values.lan_ip
        action["lan_port"] = values.lan_port
        action["protocol"] = Number(values.protocol)

        if (id) {
            action.action = 'updatePortForwarding'
            action.id = id
        } else {
            action.action = 'addPortForwarding'
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
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const id = this.props.params.id
        const { getFieldValue } = this.props.form

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                let wan_port = getFieldValue('wan_port')
                let ports = this.state.usedPort
                let aConflict = []

                if (wan_port === this.state.portForwarding["wan_port"]) {
                } else if (wan_port && _.indexOf(wan_port, "-") === -1) {
                    if (_.indexOf(ports, wan_port) > -1 && _.indexOf(aConflict, wan_port) === -1) {
                        aConflict.push(wan_port)
                    } else {
                        let used = false
                        this.state.rangeUsedPort.map(function(item) {
                            let min = parseInt(item.split('-')[0])
                            let max = parseInt(item.split('-')[1])
                            let valuenum = parseInt(wan_port)
                            if (valuenum >= min && valuenum <= max) {
                                used = true
                            }
                        })
                        if (used) {
                            aConflict.push(wan_port)
                        }
                    }
                } else {
                    let aRange = wan_port.split("-")
                    let nStart = parseInt(aRange[0])
                    let nStop = parseInt(aRange[1])

                    for (var j = nStart; j <= nStop; j++) {
                        if (_.indexOf(ports, j) > -1 && _.indexOf(aConflict, j) === -1) {
                            aConflict.push(j)
                        } else {
                            let used = false
                            this.state.rangeUsedPort.map(function(item) {
                                let min = parseInt(item.split('-')[0])
                                let max = parseInt(item.split('-')[1])
                                let valuenum = parseInt(j)
                                if (valuenum >= min && valuenum <= max) {
                                    used = true
                                }
                            })
                            if (used) {
                                aConflict.push(j)
                            }
                        }
                    }
                }

                if (aConflict.length !== 0) {
                    Modal.confirm({
                        content: formatMessage({id: "LANG4134"}, {0: aConflict.join(",")}),
                        okText: formatMessage({id: "LANG727"}),
                        cancelText: formatMessage({id: "LANG726"}),
                        onOk: this._savePortForwarding.bind(this)
                    })
                } else {
                    this._savePortForwarding()
                }
            }
        })
    }
    _getUsedPort = () => {
        let usedPort = this.state.usedPort
        let rangeUsedPort = this.state.rangeUsedPort
        const me = this
        $.ajax({
            url: api.apiHost,
            method: "post",
            data: { action: 'getUsedPortInfo' },
            type: 'json',
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = data.response
                    const usedport = response.usedport

                    usedport.map(function(item) {
                        if ($.inArray(item.port, usedPort) > -1 || $.inArray(item.port, rangeUsedPort) > -1) {

                        } else if (_.indexOf(item.port, '-') > -1) {
                            rangeUsedPort.push(item.port)
                        } else {
                            usedPort.push(item.port)
                        }
                    })
                }
            }.bind(this)
        })
        this.setState({
            usedPort: usedPort,
            rangeUsedPort: rangeUsedPort
        })
    }
    _checkWanAndLanFormat = (ele, val, callback) => {
        const { formatMessage } = this.props.intl
        let rWanLan = /^\d+(\-\d+)?$/
        let res = true

        if (!rWanLan.test(val)) {
            res = false
        }

        if (val.indexOf("-") === -1) {
            if (ele.field.indexOf("lan") > -1) {
                if (parseInt(val) < 1 || parseInt(val) > 65535) {
                    res = false
                }
            } else {
                if (parseInt(val) < 1025 || parseInt(val) > 65534) {
                    res = false
                }
            }
        } else if (val.indexOf("-") > -1) {
            let aRange = val.split("-")
            let nStart = parseInt(aRange[0])
            let nStop = parseInt(aRange[1])

            if (nStart > nStop || nStart < 1025 || nStop > 65534) {
                res = false
            }
        }

        if (!res) {
            callback(formatMessage({id: "LANG4080"}))
        } else {
            callback()
        }
    }
    _checkWanAndLanRange = (ele, val, callback) => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        let res = false
        let nLanVal = ""
        if (ele.field === "wan_port") {
            nLanVal = getFieldValue('lan_port')
        } else {
            nLanVal = getFieldValue('wan_port')
        }
        if (!val || !nLanVal) {
            res = true
        }
        if (_.indexOf(val, "-") === -1 && _.indexOf(nLanVal, "-") === -1) {
            res = true
        } else if (_.indexOf(val, "-") > -1 && _.indexOf(nLanVal, "-") > -1) {
            if (val === nLanVal) {
                res = true
            }
        }

        if (!res) {
            callback(formatMessage({id: "LANG4081"}))
        } else {
            callback()
        }
    }
    _checkWanConflict = (ele, val, callback) => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        let noConflict = true
        let res = true
        let existWanPort = this.state.existWanPort || []

        _.each(existWanPort, function(item, value) {
            let nOtherVal = item

            if (_.indexOf(val, "-") === -1) {
                if (val === nOtherVal) {
                    noConflict = false
                    res = false
                }
            } else {
                let aRange = val.split("-"),
                    nStart = parseInt(aRange[0]),
                    nStop = parseInt(aRange[1])

                if (nOtherVal >= nStart && nOtherVal <= nStop) {
                    noConflict = false
                    res = false
                }
            }
        })

        if (!res) {
            callback(formatMessage({id: "LANG4124"}))
        } else {
            callback()
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const PortForwarding = this.state.portForwarding

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG709"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG709"}) }))

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
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG552" /> }>
                                        <span>{ formatMessage({id: "LANG552"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('wan_port', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkWanAndLanFormat
                                }, {
                                    validator: this._checkWanAndLanRange
                                }, {
                                    validator: this._checkWanConflict
                                }],
                                initialValue: PortForwarding.wan_port
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG5194" /> }>
                                        <span>{ formatMessage({id: "LANG553"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('lan_ip', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.ipv4Address(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: PortForwarding.lan_ip
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG554" /> }>
                                        <span>{ formatMessage({id: "LANG554"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('lan_port', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkWanAndLanFormat
                                }, {
                                    validator: this._checkWanAndLanRange
                                }],
                                initialValue: PortForwarding.lan_port
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG555" /> }>
                                        <span>{ formatMessage({id: "LANG555"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('protocol', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: PortForwarding.protocol
                            })(
                                <Select style={{ width: 200 }}>
                                    <Option value='0'>{formatMessage({id: "LANG556"})}</Option>
                                    <Option value='1'>{formatMessage({id: "LANG557"})}</Option>
                                    <Option value='2'>{formatMessage({id: "LANG558"})}</Option>
                                </Select>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(PortForwardingItem))

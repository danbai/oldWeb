'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Tooltip, Button, message, Modal, Select, Table, Tag, Form, Input, Row, Col} from 'antd'
import Validator from "../../api/validator"

const FormItem = Form.Item
const Option = Select.Option

class Rules extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rule_name: {},
            nameList: [],
            interfaceList: [],
            netMethod: '1'
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _check_ipaddr = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        if (value === "") {
            callback()
        }

        // 192.168.0.0 or 192.168.0.0/16
        // if (!/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(\/([1-9]|[12][0-9]|3[0-2]))?$/i.test(value) && !/^Anywhere$/.test(value)) {
        if (/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(\/\d+)?$/i.test(value) || UCMGUI.isIPv6(value) || /^Anywhere$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2195"}))
        }
    }
    _check_port = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        if (/^Any$/.test(value) || value === "") {
            callback()
            return
        }
        if (/^(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/.test(value)) {
            callback()
            return
        }
        if (!/^(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])[-]?(6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/.test(value)) {
            callback(formatMessage({id: "LANG2767"}))
            return
        }
        var arr = value.split("-")
        var cntFirst = parseInt(arr[0], 10)
        var cntSecond = parseInt(arr[1], 10)

        if (cntFirst < 0 || cntFirst > 65535) {
            callback(formatMessage({id: "LANG2767"}))
            return
        }

        if (cntSecond && (cntSecond < 0 || cntSecond > 65535)) {
            callback(formatMessage({id: "LANG2767"}))
            return
        }

        if (cntFirst > cntSecond) {
            callback(formatMessage({id: "LANG2767"}))
            return
        }
        callback()
    }
    _checkAllReject = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const rule_act = getFieldValue('rule_act')
        const flags = getFieldValue('flags')
        const source_addr = getFieldValue('source_addr')
        const source_port = getFieldValue('source_port')
        const dest_addr = getFieldValue('dest_addr')
        const dest_port = getFieldValue('dest_port')

        if (flags === 'custom' && (rule_act === 'reject' || rule_act === 'drop') && 
            (source_addr === 'Anywhere' || source_addr === '') &&
            (source_port === 'Any' || source_port === '') &&
            (dest_addr === 'Anywhere' || dest_addr === '') &&
            (dest_port === 'Any' || dest_port === '')) {
            callback(formatMessage({id: "LANG3837"}))
        } else {
            callback()
        }
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const name = this.props.params.name
        let rule_name = this.state.rule_name
        let nameList = this.state.nameList || []
        let interfaceList = this.state.interfaceList || []
        let netMethod = this.state.netMethod
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getNetworkSettings',
                method: '',
                port: ''
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const networkSettings = response.network_settings || []
                    netMethod = networkSettings.method
                    if (netMethod === '1') {
                        interfaceList.push({
                            text: 'LAN',
                            val: 'LAN'
                        })
                    } else if (netMethod === '0') {
                        interfaceList.push({
                            text: 'WAN',
                            val: 'WAN'
                        }, {
                            text: 'LAN',
                            val: 'LAN'
                        }, {
                            text: formatMessage({id: "LANG1959"}),
                            val: 'Both'
                        })
                    } else if (netMethod === '2') {
                        interfaceList.push({
                            text: 'LAN1',
                            val: 'LAN1'
                        }, {
                            text: 'LAN2',
                            val: 'LAN2'
                        }, {
                            text: formatMessage({id: "LANG1959"}),
                            val: 'Both'
                        })
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listStaticDefense',
                options: 'rule_name'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const tmpList = response.rule_name || []
                    tmpList.map(function(item) {
                        nameList.push(item.rule_name)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        if (name) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getStaticDefense',
                    rule_name: name
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}
                        rule_name = response.rule_name || {}
                        nameList = _.without(nameList, name)
                        if (netMethod === '1') {
                            rule_name.interface = rule_name.interface.toUpperCase()
                        }
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        this.setState({
            rule_name: rule_name,
            nameList: nameList,
            interfaceList: interfaceList,
            netMethod: netMethod
        })
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.nameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _handleCancel = () => {
        browserHistory.push('/system-settings/securitySettings')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const ID = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = _.clone(values)
                if (ID) {
                    action.sequence = parseInt(ID)
                    action.action = 'updateStaticDefense'
                } else {
                    action.sequence = this.state.nameList.length + 1
                    action.action = 'addStaticDefense'
                }
                let net_interface = 'lan'
                if (this.state.netMethod === '0') {
                    net_interface = 'WAN'
                } else if (this.state.netMethod === '1') {
                    net_interface = 'lan'
                } else if (this.state.netMethod === '2') {
                    net_interface = 'LAN1'
                }
                if (values.source_addr === "") {
                    action.source_addr = "Anywhere"
                    action.source_sub = 0
                } else {
                    action.source_addr = values.source_addr.split('/')[0]
                    action.source_sub = values.source_addr.split('/')[1] ? parseInt(values.source_addr.split('/')[1]) : 0
                }
                if (values.source_port === "") {
                    action.source_port = "-1"
                } else {
                    action.source_port = values.source_port === 'Any' ? '-1' : values.source_port
                }
                if (values.dest_addr === "") {
                    action.dest_addr = "Anywhere"
                    action.dest_sub = 0
                } else {
                    action.dest_addr = values.dest_addr.split('/')[0]
                    action.dest_sub = values.dest_addr.split('/')[1] ? parseInt(values.dest_addr.split('/')[1]) : 0
                }
                if (values.dest_port === "") {
                    action.dest_port = "-1"
                } else {
                    action.dest_port = values.dest_port === 'Any' ? '-1' : values.dest_port
                }
                action.protocol = values.protocol ? values.protocol : 'tcp'
                if (this.state.netMethod === '1') {
                    action.interface = 'lan'
                } else {
                    action.interface = values.interface ? values.interface : net_interface
                }
                const flags2port = {
                    'FTP': '21',
                    'SSH': '22',
                    'Telnet': '23',
                    'TFTP': '69',
                    'HTTP': '80',
                    'LDAP': '389'
                }
                const port2pro = {
                    '21': 'tcp',
                    '22': 'tcp',
                    '23': 'tcp',
                    '69': 'udp',
                    '80': 'tcp',
                    '389': 'tcp'
                }
                if (values.flags !== 'custom') {
                    action.dest_port = flags2port[values.flags]
                    action.protocol = port2pro[action.dest_port]
                    action.dest_addr = 'Anywhere'
                    action.source_addr = 'Anywhere'
                    action.source_port = '-1'
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
    _onChangeType = (type) => {
        let rule_name = this.state.rule_name
        rule_name.type = type
        this.setState({
            rule_name: rule_name
        })
    }
    _onChangeFlags = (flags) => {
        let rule_name = this.state.rule_name
        rule_name.flags = flags
        this.setState({
            rule_name: rule_name
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const name = this.props.params.name
        const rule_name = this.state.rule_name || {}
        let source_addr = 'Anywhere'
        let dest_addr = 'Anywhere'
        if (rule_name.source_sub) {
            source_addr = rule_name.source_addr + '/' + rule_name.source_sub
        } else {
            source_addr = rule_name.source_addr
        }
        if (rule_name.dest_sub) {
            dest_addr = rule_name.dest_addr + '/' + rule_name.dest_sub
        } else {
            dest_addr = rule_name.dest_addr
        }
        const title = this.props.params.name ? formatMessage({id: "LANG53"}) : formatMessage({id: "LANG52"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }
        const formItemAddLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 12 }
        }

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
                            ref="div_new_fw_name"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1960" />}>
                                    <span>{formatMessage({id: "LANG1947"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('rule_name', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkName
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: name ? name : ''
                            })(
                                <Input maxLength='25' />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_new_fw_act"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1961" />}>
                                    <span>{formatMessage({id: "LANG1948"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('rule_act', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: rule_name.rule_act ? rule_name.rule_act : ''
                            })(
                                <Select>
                                    <Option value="accept">ACCEPT</Option>
                                    <Option value="reject">REJECT</Option>
                                    <Option value="drop">DROP</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_new_fw_type"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1963" />}>
                                    <span>{formatMessage({id: "LANG1950"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('type', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: rule_name.type ? rule_name.type : ''
                            })(
                                <Select onChange={ this._onChangeType }>
                                    <Option value='in'>IN</Option>
                                    <Option value='out'>OUT</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_new_fw_interface"
                            className= { rule_name.type === 'in' ? 'display-block' : 'hidden' }
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1964" />}>
                                    <span>{formatMessage({id: "LANG1938"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('interface', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: rule_name.type === 'in',
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: rule_name.interface ? rule_name.interface : ''
                            })(
                                <Select>
                                    {
                                        this.state.interfaceList.map(function(item) {
                                            return <Option
                                                    key={ item.text }
                                                    value={ item.val }>
                                                    { item.text }
                                                </Option>
                                            }
                                        ) 
                                    }
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_new_fw_services"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1965" />}>
                                    <span>{formatMessage({id: "LANG1951"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('flags', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkAllReject
                                }],
                                initialValue: rule_name.flags ? rule_name.flags : ''
                            })(
                                <Select onChange={ this._onChangeFlags } >
                                    <Option value='FTP'>FTP</Option>
                                    <Option value='SSH'>SSH</Option>
                                    <Option value='Telnet'>Telnet</Option>
                                    <Option value='HTTP'>HTTP</Option>
                                    <Option value='LDAP'>LDAP</Option>
                                    <Option value='custom'>Custom</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemAddLayout }
                            className= { rule_name.flags === 'custom' ? 'display-block' : 'hidden' }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1967" />}>
                                    <span>{formatMessage({id: "LANG1952"})}</span>
                                </Tooltip>
                            )}>
                            <Row>
                                <Col span={ 12 }>
                                    <FormItem>
                                    { getFieldDecorator('source_addr', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: this._check_ipaddr
                                        }],
                                        initialValue: source_addr ? source_addr : 'Anywhere'
                                    })(
                                        <Input />
                                    ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 } offset={ 1 } >
                                    <span>:</span>
                                </Col>
                                <Col span={ 6 }>
                                    <FormItem>
                                    { getFieldDecorator('source_port', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: this._check_port
                                        }],
                                        initialValue: rule_name.source_port && rule_name.source_port !== '-1' ? rule_name.source_port : 'Any'
                                    })(
                                        <Input min={ 1 } max={ 65535 } />
                                    ) }
                                    </FormItem>
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem
                            { ...formItemAddLayout }
                            className= { rule_name.flags === 'custom' ? 'display-block' : 'hidden' }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1968" />}>
                                    <span>{formatMessage({id: "LANG1953"})}</span>
                                </Tooltip>
                            )}>
                            <Row>
                                <Col span={ 12 }>
                                    <FormItem>
                                    { getFieldDecorator('dest_addr', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: this._check_ipaddr
                                        }],
                                        initialValue: dest_addr ? dest_addr : 'Anywhere'
                                    })(
                                        <Input />
                                    ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 } offset={ 1 } >
                                    <span>:</span>
                                </Col>
                                <Col span={ 6 }>
                                    <FormItem>
                                    { getFieldDecorator('dest_port', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            validator: this._check_port
                                        }],
                                        initialValue: rule_name.dest_port && rule_name.dest_port !== '-1' ? rule_name.dest_port : 'Any'
                                    })(
                                        <Input min={ 1 } max={ 65535 } />
                                    ) }
                                    </FormItem>
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem
                            ref="div_new_fw_proto"
                            { ...formItemLayout }
                            className= { rule_name.flags === 'custom' ? 'display-block' : 'hidden' }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1962" />}>
                                    <span>{formatMessage({id: "LANG1949"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('protocol', {
                                getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                    required: rule_name.flags === 'custom',
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: rule_name.protocol ? rule_name.protocol : ''
                            })(
                                <Select>
                                    <Option value='tcp'>TCP</Option>
                                    <Option value='udp'>UDP</Option>
                                    <Option value='both'>{ formatMessage({id: "LANG1959"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(Rules))

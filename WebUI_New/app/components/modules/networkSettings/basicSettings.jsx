'use strict'

import $ from 'jquery'
import _ from 'underscore'
import moment from "moment"
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Tabs, Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, DatePicker, TimePicker, Button, Modal, Row } from 'antd'

const TabPane = Tabs.TabPane
const baseServerURl = api.apiHost
const FormItem = Form.Item

class BasicSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            method_display_calss: {
                num_eth: 'display-block'
            },
            method_change_calss: {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'display-block',
                lan2title: 'hidden',
                wantitle: 'hidden'
            },
            lan1_ip_class: {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            },
            lan2_ip_class: {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            },
            default_interface_calss: {
                lan1: 'display-block',
                lan2: 'hidden'
            },
            lan1_ip6_class: {
                static: 'hidden'
            },
            lan2_ip6_class: {
                static: 'hidden'
            },
            dhcp_ip6_class: {
                fromto: 'display-block'
            },
            method_key: [],
            activeKey: "1"
        }
    }
    componentWillMount() {
        this._initNetwork()
    }
    componentDidMount() {
    }
    componentWillUnmount() {

    }

    _initNetwork = () => {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        let myclass = this.state.method_display_calss
        let method_key = this.state.method_key || []
        if (Number(model_info.num_eth) >= 2) {
            myclass.num_eth = 'display-block'
            method_key = [{"key": "1", "name": formatMessage({id: "LANG551"})}, {"key": "2", "name": formatMessage({id: "LANG2219"})}]
            if (model_info.allow_nat === "1") {
                let item = {"key": "0", "name": formatMessage({id: "LANG550"})}
                method_key.push(item)
            }
        } else {
            myclass.num_eth = 'hidden'
        }

        let network_settings = this.props.dataSource
        let dhcp_settings = this.props.dataDHCPSettings
        let dhcp6_settings = this.props.dataDHCP6Settings
        let value = network_settings.method
        let method = {}
        let default_interface = {
            lan1: 'hidden',
            lan2: 'display-block'
        }

        if (value === "0") {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'display-block',
                lantitle: 'hidden',
                lan2title: 'hidden',
                wantitle: 'display-block'
            }
        } else if (value === "1") {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'display-block',
                lan2title: 'hidden',
                wantitle: 'hidden'
            }
        } else {
            method = {
                lan1: 'display-block',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'hidden',
                lan2title: 'display-block',
                wantitle: 'hidden'
            }

            if (network_settings.default_interface === "LAN1") {
                default_interface = {
                    lan1: 'display-block',
                    lan2: 'hidden'
                }
            } else {
                default_interface = {
                    lan1: 'hidden',
                    lan2: 'display-block'
                }
            }
        }

        value = network_settings.lan1_ip_method
        let ipmethod = {}
        let ipmethod2 = {}

        if (value === "0") {
            ipmethod = {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            }
        } else if (value === "1") {
            ipmethod = {
                dhcp: 'hidden',
                static: 'display-block',
                pppoe: 'hidden'
            }
        } else {
            ipmethod = {
                dhcp: 'hidden',
                static: 'hidden',
                pppoe: 'display-block'
            }
        }
        value = network_settings.lan2_ip_method

        if (value === "0") {
            ipmethod2 = {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            }
        } else if (value === "1") {
            ipmethod2 = {
                dhcp: 'hidden',
                static: 'display-block',
                pppoe: 'hidden'
            }
        } else {
            ipmethod2 = {
                dhcp: 'hidden',
                static: 'hidden',
                pppoe: 'display-block'
            }
        }

        value = network_settings.lan1_ip6_method
        let ip6method = {}
        let ip6method2 = {}

        if (value === "1") {
            ip6method = {
                static: 'display-block'
            }
        } else {
            ip6method = {
                static: 'hidden'
            }
        }
        value = network_settings.lan2_ip6_method
        if (value === "1") {
            ip6method2 = {
                static: 'display-block'
            }
        } else {
            ip6method2 = {
                static: 'hidden'
            }
        }

        value = network_settings.dhcp6_enable
        let dhcp_ipv6 = {}

        if (value === "1") {
            dhcp_ipv6 = {
                fromto: 'hidden'
            } 
        } else {
            dhcp_ipv6 = {
                fromto: 'display-block'
            }
        }

        this.setState({
            method_display_calss: myclass,
            method_change_calss: method,
            lan1_ip_class: ipmethod,
            lan2_ip_class: ipmethod2,
            lan1_ip6_class: ip6method,
            lan2_ip6_class: ip6method2,
            default_interface_calss: default_interface,
            dhcp_ip6_class: dhcp_ipv6,
            method_key: method_key
        })
    }
    _networkMethodSwitch = (value) => {
        const { form } = this.props
        let method = {}
        let default_interface_calss = {
            lan1: 'hidden',
            lan2: 'display-block'
        }

        if (value === "0") {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'display-block',
                lantitle: 'hidden',
                lan2title: 'hidden',
                wantitle: 'display-block'
            }
        } else if (value === "1") {
            method = {
                lan1: 'hidden',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'display-block',
                lan2title: 'hidden',
                wantitle: 'hidden'
            }
        } else {
            method = {
                lan1: 'display-block',
                lan2: 'display-block',
                lan: 'hidden',
                lantitle: 'hidden',
                lan2title: 'display-block',
                wantitle: 'hidden'
            }

            let defaultInterface = form.getFieldValue("default_interface")
            if (defaultInterface === "LAN1") {
                default_interface_calss = {
                    lan1: 'display-block',
                    lan2: 'hidden'
                }
            } else {
                default_interface_calss = {
                    lan1: 'hidden',
                    lan2: 'display-block'
                }
            }
        }

        this.props.change8021x(value)

        this.setState({
            method_change_calss: method,
            default_interface_calss: default_interface_calss
        })
    }
    _onChangeTab = (activeKey) => {
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (err) {
                this.setState({ 
                    activeKey: this.state.activeKey
                })
                return
            }

            this.setState({
                activeKey
            })
        })
    }
    _onChangeIPMethod = (key, value) => {
        let method = {}

        if (value === "0") {
            method = {
                dhcp: 'display-block',
                static: 'hidden',
                pppoe: 'hidden'
            }
        } else if (value === "1") {
            method = {
                dhcp: 'hidden',
                static: 'display-block',
                pppoe: 'hidden'
            }
        } else {
            method = {
                dhcp: 'hidden',
                static: 'hidden',
                pppoe: 'display-block'
            }
        }
        if (key === "lan1_ip_method") {
            this.setState({
                lan1_ip_class: method
            })
        } else {
            this.setState({
                lan2_ip_class: method
            })
        }
    }
    _ipv6MethodSwitch = (key, value) => {
        let method = {}

        if (value === "1") {
            method = {
                static: 'display-block'
            }
        } else {
            method = {
                static: 'hidden'
            }
        }
        if (key === "lan1_ip6_method") {
            this.setState({
                lan1_ip6_class: method
            })
        } else {
            this.setState({
                lan2_ip6_class: method
            })
        }
    }
    _ipv6DHCPSwitch = (value) => {
        let data = {}

        if (value === "1") {
            data = {
                fromto: 'hidden'
            } 
        } else {
            data = {
                fromto: 'display-block'
            }
        }
        this.setState({
            dhcp_ip6_class: data
        })

        this.props.dhcp6Enable(value)
    }
    _onChangeDefaultInterface = (value) => {
        let data = {}

        if (value === "LAN1") {
            data = {
                lan1: 'display-block',
                lan2: 'hidden'
            }
        } else {
            data = {
                lan1: 'hidden',
                lan2: 'display-block'
            }
        }
        this.setState({
            default_interface_calss: data
        })
    }
    _inSameNetworkSegment = (data, value, callback, formatMessage, ip1, ip2, submask, mask, str, needSame) => {
        const { form } = this.props
        let res = true
        let dhcp_enable = form.getFieldValue('dhcp_enable') 
        if ((ip2 === "dhcp_gateway" && dhcp_enable) || str === "other") {
            let tenTotwo = function(str) {
                str = parseInt(str, 10).toString(2)
                let i = 0

                for (i = str.length; i < 8; i = str.length) {
                    str = "0" + str
                }

                return str
            }
            ip1 = form.getFieldValue(ip1).split(".")
            ip2 = form.getFieldValue(ip2).split(".")
            submask = form.getFieldValue(submask).split(".")
            mask = form.getFieldValue(mask).split(".")

            ip1 = tenTotwo(ip1[0]) + tenTotwo(ip1[1]) + tenTotwo(ip1[2]) + tenTotwo(ip1[3])
            ip2 = tenTotwo(ip2[0]) + tenTotwo(ip2[1]) + tenTotwo(ip2[2]) + tenTotwo(ip2[3])
            submask = tenTotwo(submask[0]) + tenTotwo(submask[1]) + tenTotwo(submask[2]) + tenTotwo(submask[3])
            mask = tenTotwo(mask[0]) + tenTotwo(mask[1]) + tenTotwo(mask[2]) + tenTotwo(mask[3])

            ip1 = ip1.split("")
            ip2 = ip2.split("")
            submask = submask.split("")
            mask = mask.split("")

            let i = 0
            for (i = 0; i < 32; i++) {
                if ((ip1[i] & submask[i]) !== (ip2[i] & mask[i])) {
                    res = false
                    break
                }
            }  
        }

        let msg = "LANG2176"
        if (needSame === false) {
            msg = "LANG2430"
            res = !res
        }
        if (res === false) {
            callback(formatMessage({id: msg}))
        } else {
            callback()
        }
    }
    _checkDHCPPrefix = (data, value, callback, formatMessage) => {
        const { form } = this.props
        const reg = /^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:)$|^([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:)$|^([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:)$|^([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:)$|^([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?$|^([0-9a-fA-F]{1,4}:){6}:$/

        if (value && !reg.test(value)) {
            callback(formatMessage({id: "LANG5164"}))
        } else {
            callback()
        }
    }
    _checkPrefixNoFourDigits = (data, value, callback, formatMessage) => {
        const { form } = this.props
        let res = false
        let arr = value.split(":"),
            noEmptyLen = 0

        _.each(arr, function(item, num) {
            if (item !== "") {
                noEmptyLen++
            }
        })

        if (noEmptyLen <= 4 && arr[arr.length - 1] === "" && arr[arr.length - 2] === "") {
            res = true
        }

        if (res === false) {
            callback(formatMessage({id: "LANG5241"}))
        } else {
            callback()
        }
    }
    _checkSpecialIPv6 = (data, val, callback, formatMessage) => {
        const { form } = this.props
        let res = true
        var arr = ["::", "::1", "FF00::", "FE80::"]

        for (var i = 0; i < arr.length; i++) {
            var item = arr[i]

            if (val === item || val === ("[" + item + "]")) {
                res = false
            }
        }

        if (res === false) {
            callback(formatMessage({id: "LANG2196"}))
        } else {
            callback()
        }
    }
    _checkDnsServer = (data, val, callback, formatMessage) => {
        if (val === '0.0.0.0' || val === '::') {
            callback(formatMessage({id: "LANG4442"}))
        } else {
            callback()
        }
    }
    _checkIPV6SameNetworkSegment = (data, val, callback, formatMessage, msg) => {
        const { form } = this.props
        let res = true
        let dhcp6PrefixVal = form.getFieldValue("dhcp6_prefix")
        let dhcp6PrefixValArr = dhcp6PrefixVal.split(":")
        let valArr = val.split(":")

        for (var i = 0; i < dhcp6PrefixValArr.length - 1; i++) {
            if (dhcp6PrefixValArr[i] !== valArr[i]) {
                res = false
                break
            }
        }

        if (val.indexOf(dhcp6PrefixVal) === -1) {
            res = false
        }

        if (res === false) {
            callback(formatMessage({id: "LANG5258"}, {0: msg}))
        } else {
            callback()
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const network_settings = this.props.dataSource
        const dhcp_settings = this.props.dataDHCPSettings
        const dhcp6_settings = this.props.dataDHCP6Settings
        const { form } = this.props
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        if (this.props.firstLoad) {
            this._initNetwork()
            this.props.setFirstLoad(0)
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG1914" />}>
                                    <span>{formatMessage({id: "LANG2233"})}</span>
                                </Tooltip>
                            }
                            className={ this.state.method_display_calss.num_eth }
                        >
                            { getFieldDecorator('method', {
                                rules: [],
                                initialValue: network_settings.method
                            })(
                                <Select onChange={ this._networkMethodSwitch } >
                                    {
                                        this.state.method_key.map(function(value, index) {
                                            return <Option value={ value.key } key={ index }>{ value.name }</Option>
                                        })
                                    }
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG5047" />}>
                                    <span>{formatMessage({id: "LANG5046"})}</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('mtu', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.range(data, value, callback, formatMessage, 1280, 1500)
                                    }
                                }],
                                initialValue: network_settings.mtu
                            })(
                                <Input/>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG2226" />}>
                                    <span>{formatMessage({id: "LANG2220"})}</span>
                                </Tooltip>
                            }
                            className={ this.state.method_change_calss.lan1 }
                        >
                            { getFieldDecorator('default_interface', {
                                rules: [],
                                initialValue: network_settings.default_interface
                            })(
                                <Select onChange={ this._onChangeDefaultInterface }>
                                     <Option value="LAN1">{formatMessage({id: "LANG266"})}</Option>
                                     <Option value="LAN2">{formatMessage({id: "LANG267"})}</Option>
                                 </Select>
                            ) }
                        </FormItem>
                        <Tabs type="card" className="custom-tabs" activeKey={ this.state.activeKey } onChange={ this._onChangeTab }>
                            <TabPane tab={formatMessage({id: "LANG5195"})} key="1">
                                <div className="custom-tabpanel-content">
                                    <FormItem
                                        { ...formItemLayout }
                                        label={                            
                                            <Tooltip title={<FormattedHTMLMessage id="LANG1913" />}>
                                                <span>{formatMessage({id: "LANG1912"})}</span>
                                            </Tooltip>
                                        }>
                                        { getFieldDecorator('altdns', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                validator: (data, value, callback) => {
                                                    Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"}))
                                                }
                                            }],
                                            initialValue: network_settings.altdns === "0.0.0.0" ? "" : network_settings.altdns
                                        })(
                                            <Input/>
                                        ) }
                                    </FormItem>
                                    <div className={ this.state.method_change_calss.lan1 }>
                                        <Row>
                                            <Col span={ 24 }>
                                                <div className="section-title">
                                                    <span>{ formatMessage({id: "LANG266"}) }</span>
                                                </div>
                                            </Col>
                                        </Row>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={                            
                                                <Tooltip title={<FormattedHTMLMessage id="LANG549" />}>
                                                    <span>{formatMessage({id: "LANG549"})}</span>
                                                </Tooltip>
                                            }>
                                            { getFieldDecorator('lan2_ip_method', {
                                                rules: [],
                                                initialValue: network_settings.lan2_ip_method
                                            })(
                                                <Select onChange={ this._onChangeIPMethod.bind(this, "lan2_ip_method") } >
                                                     <Option value="0">{formatMessage({id: "LANG219"})}</Option>
                                                     <Option value="1">{formatMessage({id: "LANG220"})}</Option>
                                                     <Option value="2">{formatMessage({id: "LANG221"})}</Option>
                                                 </Select>
                                            ) }
                                        </FormItem>
                                        <div className={ this.state.lan2_ip_class.static }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1292" />}>
                                                        <span>{formatMessage({id: "LANG1291"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('lan2_ip', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block',
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.default_interface_calss.lan1 === 'display-block' && this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "lan2_ip", "lan2_gateway", "lan2_mask", "lan2_mask", "other", true) : callback()
                                                        }
                                                    }],
                                                    initialValue: network_settings.lan2_ip
                                                })(
                                                    <Input/>
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1903" />}>
                                                        <span>{formatMessage({id: "LANG1902"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('lan2_mask', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block',
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.mask(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: network_settings.lan2_mask
                                                })(
                                                    <Input/>
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1901" />}>
                                                        <span>{formatMessage({id: "LANG1900"})}</span>
                                                    </Tooltip>
                                                }
                                                className={ this.state.default_interface_calss.lan1 }
                                            >
                                                { getFieldDecorator('lan2_gateway', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.default_interface_calss.lan1 === 'display-block' && this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block',
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.default_interface_calss.lan1 === 'display-block' && this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: network_settings.lan2_gateway
                                                })(
                                                    <Input/>
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1905" />}>
                                                        <span>{formatMessage({id: "LANG1904"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('lan2_dns1', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block',
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: network_settings.lan2_dns1
                                                })(
                                                    <Input/>
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1907" />}>
                                                        <span>{formatMessage({id: "LANG1906"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('lan2_dns2', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: network_settings.lan2_dns2
                                                })(
                                                    <Input/>
                                                ) }
                                            </FormItem>
                                        </div>
                                        <div className={ this.state.lan2_ip_class.pppoe }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1909" />}>
                                                        <span>{formatMessage({id: "LANG1908"})}</span>
                                                    </Tooltip>
                                                }>
                                                <Input name="lan2_username" className="hidden"></Input>
                                                { getFieldDecorator('lan2_username', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.pppoe === 'display-block',
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.pppoe === 'display-block' ? Validator.keyboradNoSpaceSpecial(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: network_settings.lan2_username
                                                })(
                                                    <Input maxLength="64" />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1911" />}>
                                                        <span>{formatMessage({id: "LANG1910"})}</span>
                                                    </Tooltip>
                                                }>
                                                <Input type="password" name="lan2_password" className="hidden"></Input>
                                                { getFieldDecorator('lan2_password', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.pppoe === 'display-block',
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip_class.pppoe === 'display-block' ? Validator.pppoeSecret(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: network_settings.lan2_password
                                                })(
                                                    <Input maxLength="64" type="password"/>
                                                ) }
                                            </FormItem>
                                        </div>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(                            
                                                <Tooltip title={<FormattedHTMLMessage id="LANG2521" />}>
                                                    <span>{formatMessage({id: "LANG2520"})}</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('lan2_vid', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    validator: (data, value, callback) => {
                                                        this.state.method_change_calss.lan1 === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this.state.method_change_calss.lan1 === 'display-block' ? Validator.range(data, value, callback, formatMessage, 0, 4094) : callback()
                                                    }
                                                }],
                                                initialValue: network_settings.lan2_vid
                                            })(
                                                <Input/>
                                            ) }
                                        </FormItem>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(                            
                                                <Tooltip title={<FormattedHTMLMessage id="LANG2523" />}>
                                                    <span>{formatMessage({id: "LANG2522"})}</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('lan2_priority', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    validator: (data, value, callback) => {
                                                        this.state.method_change_calss.lan1 === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this.state.method_change_calss.lan1 === 'display-block' ? Validator.range(data, value, callback, formatMessage, 0, 7) : callback()
                                                    }
                                                }],
                                                initialValue: network_settings.lan2_priority
                                            })(
                                                <Input/>
                                            ) }
                                        </FormItem>
                                    </div>
                                    <Row className={ this.state.method_change_calss.wantitle}>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG264"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className={ this.state.method_change_calss.lantitle}>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG265"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className={ this.state.method_change_calss.lan2title}>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG267"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="row-section-content">
                                        <div className={ this.state.method_change_calss.lan2 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG549" />}>
                                                        <span>{formatMessage({id: "LANG549"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('lan1_ip_method', {
                                                    rules: [],
                                                    initialValue: network_settings.lan1_ip_method
                                                })(
                                                    <Select onChange={ this._onChangeIPMethod.bind(this, "lan1_ip_method") } >
                                                         <Option value="0">{formatMessage({id: "LANG219"})}</Option>
                                                         <Option value="1">{formatMessage({id: "LANG220"})}</Option>
                                                         <Option value="2">{formatMessage({id: "LANG221"})}</Option>
                                                     </Select>
                                                ) }
                                            </FormItem>
                                            <div className={ this.state.lan1_ip_class.static }>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1292" />}>
                                                            <span>{formatMessage({id: "LANG1291"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan1_ipaddr', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' && this.state.default_interface_calss.lan2 === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "lan1_ipaddr", "lan1_gateway", "lan1_submask", "lan1_submask", "other", true) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "lan1_ipaddr", "lan2_ip", "lan1_submask", "lan2_mask", "other", false) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_ipaddr
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1903" />}>
                                                            <span>{formatMessage({id: "LANG1902"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan1_submask', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? Validator.mask(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_submask
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1901" />}>
                                                            <span>{formatMessage({id: "LANG1900"})}</span>
                                                        </Tooltip>
                                                    }
                                                    className={ this.state.default_interface_calss.lan2 }
                                                >
                                                    { getFieldDecorator('lan1_gateway', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' && this.state.default_interface_calss.lan2 === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' && this.state.default_interface_calss.lan2 === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_gateway
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1905" />}>
                                                            <span>{formatMessage({id: "LANG1904"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan1_dns1', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_dns1 === "0.0.0.0" ? "" : network_settings.lan1_dns1
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1907" />}>
                                                            <span>{formatMessage({id: "LANG1906"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan1_dns2', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.static === 'display-block' ? Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_dns2 === "0.0.0.0" ? "" : network_settings.lan1_dns2
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                            </div>
                                            <div className={ this.state.lan1_ip_class.pppoe }>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1909" />}>
                                                            <span>{formatMessage({id: "LANG1908"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    <Input name="lan1_username" className="hidden"></Input>
                                                    { getFieldDecorator('lan1_username', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.pppoe === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.pppoe === 'display-block' ? Validator.keyboradNoSpaceSpecial(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_username
                                                    })(
                                                        <Input maxLength="64" />
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1911" />}>
                                                            <span>{formatMessage({id: "LANG1910"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    <Input type="password" name="lan1_password" className="hidden"></Input>
                                                    { getFieldDecorator('lan1_password', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.pppoe === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip_class.pppoe === 'display-block' ? Validator.pppoeSecret(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_password
                                                    })(
                                                        <Input maxLength="64" type="password"/>
                                                    ) }
                                                </FormItem>
                                            </div>
                                        </div>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(                            
                                                <Tooltip title={<FormattedHTMLMessage id="LANG2521" />}>
                                                    <span>{formatMessage({id: "LANG2520"})}</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('lan1_vid', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    validator: (data, value, callback) => {
                                                        Validator.digits(data, value, callback, formatMessage)
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.range(data, value, callback, formatMessage, 0, 4094)
                                                    }
                                                }],
                                                initialValue: network_settings.lan1_vid
                                            })(
                                                <Input/>
                                            ) }
                                        </FormItem>
                                        <FormItem
                                            { ...formItemLayout }
                                            label={(                            
                                                <Tooltip title={<FormattedHTMLMessage id="LANG2523" />}>
                                                    <span>{formatMessage({id: "LANG2522"})}</span>
                                                </Tooltip>
                                            )}
                                        >
                                            { getFieldDecorator('lan1_priority', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    validator: (data, value, callback) => {
                                                        Validator.digits(data, value, callback, formatMessage)
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        Validator.range(data, value, callback, formatMessage, 0, 7)
                                                    }
                                                }],
                                                initialValue: network_settings.lan1_priority
                                            })(
                                                <Input/>
                                            ) }
                                        </FormItem>
                                    </Row>              
                                    <div className={ this.state.method_change_calss.lan}>
                                        <Row>
                                            <Col span={ 24 }>
                                                <div className="section-title">
                                                    <span>{ formatMessage({id: "LANG265"}) }</span>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row className="row-section-content">
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1916" />}>
                                                        <span>{formatMessage({id: "LANG1915"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp_ipaddr', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block',
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "dhcp_ipaddr", "dhcp_gateway", "dhcp_submask", "dhcp_submask", "", true) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' ? this._inSameNetworkSegment(data, value, callback, formatMessage, "lan1_ipaddr", "dhcp_ipaddr", "lan1_submask", "dhcp_submask", "other", false) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp_settings.dhcp_ipaddr
                                                })(
                                                    <Input/>
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1903" />}>
                                                        <span>{formatMessage({id: "LANG1902"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp_submask', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block',
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' ? Validator.mask(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp_settings.dhcp_submask
                                                })(
                                                    <Input/>
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1918" />}>
                                                        <span>{formatMessage({id: "LANG1917"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp_enable', {
                                                    rules: [],
                                                    valuePropName: "checked",
                                                    initialValue: network_settings.dhcp_enable
                                                })(
                                                    <Checkbox onChange={ this.props.dhcpEnable } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1905" />}>
                                                        <span>{formatMessage({id: "LANG1904"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp_dns1', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp_settings.dhcp_dns1
                                                })(
                                                    <Input disabled={ !network_settings.dhcp_enable } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1907" />}>
                                                        <span>{formatMessage({id: "LANG1906"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp_dns2', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp_settings.dhcp_dns2
                                                })(
                                                    <Input disabled={ !network_settings.dhcp_enable } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1920" />}>
                                                        <span>{formatMessage({id: "LANG1919"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('ipfrom', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? this._inSameNetworkSegment(data, value, callback, formatMessage, "ipfrom", "dhcp_gateway", "dhcp_submask", "dhcp_submask", "", true) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp_settings.ipfrom
                                                })(
                                                    <Input disabled={ !network_settings.dhcp_enable } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1922" />}>
                                                        <span>{formatMessage({id: "LANG1921"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('ipto', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? this._inSameNetworkSegment(data, value, callback, formatMessage, "ipto", "dhcp_gateway", "dhcp_submask", "dhcp_submask", "", true) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            const thisLabel = formatMessage({id: "LANG1921"})
                                                            const otherInputValue = form.getFieldValue('ipfrom')
                                                            const otherInputLabel = formatMessage({id: "LANG1919"})

                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.strbigger(data, value, callback, formatMessage, thisLabel, otherInputLabel, otherInputValue) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp_settings.ipto
                                                })(
                                                    <Input disabled={ !network_settings.dhcp_enable } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG4444" />}>
                                                        <span>{formatMessage({id: "LANG4443"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp_gateway', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.ipv4Address(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp_settings.dhcp_gateway
                                                })(
                                                    <Input disabled={ !network_settings.dhcp_enable } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1924" />}>
                                                        <span>{formatMessage({id: "LANG1923"})}</span>
                                                    </Tooltip>
                                                )}
                                            >
                                                { getFieldDecorator('ipleasetime', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable,
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp_enable ? Validator.range(data, value, callback, formatMessage, 300, 172800) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp_settings.ipleasetime
                                                })(
                                                    <Input disabled={ !network_settings.dhcp_enable } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG2521" />}>
                                                        <span>{formatMessage({id: "LANG2520"})}</span>
                                                    </Tooltip>
                                                )}
                                            >
                                                { getFieldDecorator('lan2_vid', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' ? Validator.range(data, value, callback, formatMessage, 0, 4094) : callback()
                                                        }
                                                    }],
                                                    initialValue: network_settings.lan2_vid
                                                })(
                                                    <Input/>
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={(                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG2523" />}>
                                                        <span>{formatMessage({id: "LANG2522"})}</span>
                                                    </Tooltip>
                                                )}
                                            >
                                                { getFieldDecorator('lan2_priority', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' ? Validator.range(data, value, callback, formatMessage, 0, 7) : callback()
                                                        }
                                                    }],
                                                    initialValue: network_settings.lan2_priority
                                                })(
                                                    <Input/>
                                                ) }
                                            </FormItem>
                                        </Row>
                                    </div>
                                </div>
                            </TabPane>
                            <TabPane tab={formatMessage({id: "LANG5130"})} key="2">
                                <div className="custom-tabpanel-content">
                                    <div className={ this.state.method_change_calss.lan1 }>
                                        <Row>
                                            <Col span={ 24 }>
                                                <div className="section-title">
                                                    <span>{ formatMessage({id: "LANG266"}) }</span>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row className="row-section-content">
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG549" />}>
                                                        <span>{formatMessage({id: "LANG549"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('lan2_ip6_method', {
                                                    rules: [],
                                                    initialValue: network_settings.lan2_ip6_method
                                                })(
                                                    <Select onChange={ this._ipv6MethodSwitch.bind(this, "lan2_ip6_method") } >
                                                         <Option value="0">{formatMessage({id: "LANG138"})}</Option>
                                                         <Option value="1">{formatMessage({id: "LANG220"})}</Option>
                                                     </Select>
                                                ) }
                                            </FormItem>
                                            <div className={ this.state.lan2_ip6_class.static }>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1292" />}>
                                                            <span>{formatMessage({id: "LANG1291"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan2_ipaddr6', {
                                                        getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                            required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block' ? Validator.ipv6Dns(data, value, callback, formatMessage, formatMessage({id: "LANG5130"})) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block' ? this._checkSpecialIPv6(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan2_ipaddr6
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG5159" />}>
                                                            <span>{formatMessage({id: "LANG5158"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan2_ip6_prefixlen', {
                                                        getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                            required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block' ? Validator.range(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan2_ip6_prefixlen
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG5192" />}>
                                                            <span>{formatMessage({id: "LANG1904"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan2_ip6_dns1', {
                                                        getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                            required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block' ? Validator.ipv6Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block' ? this._checkDnsServer(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan2_ip6_dns1
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG5193" />}>
                                                            <span>{formatMessage({id: "LANG1906"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan2_ip6_dns2', {
                                                        getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                            required: this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block' ? Validator.ipv6Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan1 === 'display-block' && this.state.lan2_ip6_class.static === 'display-block' ? this._checkDnsServer(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan2_ip6_dns2
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                            </div>
                                        </Row>
                                    </div>
                                    <Row className={ this.state.method_change_calss.wantitle}>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG264"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className={ this.state.method_change_calss.lantitle}>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG265"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className={ this.state.method_change_calss.lan2title}>
                                        <Col span={ 24 }>
                                            <div className="section-title">
                                                <span>{ formatMessage({id: "LANG267"}) }</span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="row-section-content">
                                        <div className={ this.state.method_change_calss.lan2 }>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG549" />}>
                                                        <span>{formatMessage({id: "LANG549"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('lan1_ip6_method', {
                                                    rules: [],
                                                    initialValue: network_settings.lan1_ip6_method
                                                })(
                                                    <Select onChange={ this._ipv6MethodSwitch.bind(this, "lan1_ip6_method") } >
                                                         <Option value="0">{formatMessage({id: "LANG138"})}</Option>
                                                         <Option value="1">{formatMessage({id: "LANG220"})}</Option>
                                                     </Select>
                                                ) }
                                            </FormItem>
                                            <div className={ this.state.lan1_ip6_class.static }>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1292" />}>
                                                            <span>{formatMessage({id: "LANG1291"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan1_ipaddr6', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block' ? Validator.ipv6Dns(data, value, callback, formatMessage, formatMessage({id: "LANG5130"})) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block' ? this._checkSpecialIPv6(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_ipaddr6
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG5159" />}>
                                                            <span>{formatMessage({id: "LANG5158"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan1_ip6_prefixlen', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block' ? Validator.range(data, value, callback, formatMessage, 1, 64) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_ip6_prefixlen
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG5192" />}>
                                                            <span>{formatMessage({id: "LANG1904"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan1_ip6_dns1', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block',
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block' ? Validator.ipv6Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block' ? this._checkDnsServer(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_ip6_dns1
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG5193" />}>
                                                            <span>{formatMessage({id: "LANG1906"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('lan1_ip6_dns2', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block' ? Validator.ipv6Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan2 === 'display-block' && this.state.lan1_ip6_class.static === 'display-block' ? this._checkDnsServer(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }],
                                                        initialValue: network_settings.lan1_ip6_dns2
                                                    })(
                                                        <Input/>
                                                    ) }
                                                </FormItem>
                                            </div>
                                        </div>
                                    </Row>
                                    <div className={ this.state.method_change_calss.lan}>
                                        <Row>
                                            <Col span={ 24 }>
                                                <div className="section-title">
                                                    <span>{ formatMessage({id: "LANG265"}) }</span>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row className="row-section-content">
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG5208" />}>
                                                        <span>{formatMessage({id: "LANG5207"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp6_enable', {
                                                    rules: [],
                                                    initialValue: network_settings.dhcp6_enable
                                                })(
                                                    <Select onChange={ this._ipv6DHCPSwitch } >
                                                         <Option value="0">{formatMessage({id: "LANG273"})}</Option>
                                                         <Option value="1">{formatMessage({id: "LANG138"})}</Option>
                                                         <Option value="2">{formatMessage({id: "LANG5209"})}</Option>
                                                     </Select>
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG5161" />}>
                                                        <span>{formatMessage({id: "LANG5160"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp6_prefix', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0",
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0" ? this._checkDHCPPrefix(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                            this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0" ? this._checkPrefixNoFourDigits(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp6_settings.dhcp6_prefix
                                                })(
                                                    <Input disabled={ network_settings.dhcp6_enable === "0" } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG5163" />}>
                                                        <span>{formatMessage({id: "LANG5162"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp6_prefixlen', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0",
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                           this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0" ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                           this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0" ? Validator.range(data, value, callback, formatMessage, 1, 64) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp6_settings.dhcp6_prefixlen
                                                })(
                                                    <Input disabled={ network_settings.dhcp6_enable === "0" } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG1905" />}>
                                                        <span>{formatMessage({id: "LANG1904"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp6_dns1', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        required: this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0",
                                                        message: formatMessage({id: "LANG2150"})
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                           this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0" ? Validator.ipv6Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                           this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0" ? this._checkDnsServer(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp6_settings.dhcp6_dns1
                                                })(
                                                    <Input disabled={ network_settings.dhcp6_enable === "0" } />
                                                ) }
                                            </FormItem>
                                            <FormItem
                                                { ...formItemLayout }
                                                label={                            
                                                    <Tooltip title={<FormattedHTMLMessage id="LANG5193" />}>
                                                        <span>{formatMessage({id: "LANG1906"})}</span>
                                                    </Tooltip>
                                                }>
                                                { getFieldDecorator('dhcp6_dns2', {
                                                    getValueFromEvent: (e) => {
                                                        return UCMGUI.toggleErrorMessage(e)
                                                    },
                                                    rules: [{
                                                        validator: (data, value, callback) => {
                                                           this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0" ? Validator.ipv6Dns(data, value, callback, formatMessage, formatMessage({id: "LANG579"})) : callback()
                                                        }
                                                    }, {
                                                        validator: (data, value, callback) => {
                                                           this.state.method_change_calss.lan === 'display-block' && network_settings.dhcp6_enable !== "0" ? this._checkDnsServer(data, value, callback, formatMessage) : callback()
                                                        }
                                                    }],
                                                    initialValue: dhcp6_settings.dhcp6_dns2
                                                })(
                                                    <Input disabled={ network_settings.dhcp6_enable === "0" } />
                                                ) }
                                            </FormItem>
                                            <div className={ this.state.dhcp_ip6_class.fromto }>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG5223" />}>
                                                            <span>{formatMessage({id: "LANG1919"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('ip6from', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0",
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0" ? Validator.ipv6Dns(data, value, callback, formatMessage, "IP") : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0" ? this._checkSpecialIPv6(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                let msg = formatMessage({id: "LANG1919"})
                                                               this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0" ? this._checkIPV6SameNetworkSegment(data, value, callback, formatMessage, msg) : callback()
                                                            }
                                                        }],
                                                        initialValue: dhcp6_settings.ip6from
                                                    })(
                                                        <Input disabled={ network_settings.dhcp6_enable === "0" } />
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG5224" />}>
                                                            <span>{formatMessage({id: "LANG1921"})}</span>
                                                        </Tooltip>
                                                    }>
                                                    { getFieldDecorator('ip6to', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0",
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0" ? Validator.ipv6Dns(data, value, callback, formatMessage, "IP") : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0" ? this._checkSpecialIPv6(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                                let msg = formatMessage({id: "LANG1921"})
                                                               this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0" ? this._checkIPV6SameNetworkSegment(data, value, callback, formatMessage, msg) : callback()
                                                            }
                                                        }],
                                                        initialValue: dhcp6_settings.ip6to
                                                    })(
                                                        <Input disabled={ network_settings.dhcp6_enable === "0" } />
                                                    ) }
                                                </FormItem>
                                                <FormItem
                                                    { ...formItemLayout }
                                                    label={(                            
                                                        <Tooltip title={<FormattedHTMLMessage id="LANG1924" />}>
                                                            <span>{formatMessage({id: "LANG1923"})}</span>
                                                        </Tooltip>
                                                    )}
                                                >
                                                    { getFieldDecorator('ip6leasetime', {
                                                        getValueFromEvent: (e) => {
                                                            return UCMGUI.toggleErrorMessage(e)
                                                        },
                                                        rules: [{
                                                            required: this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0",
                                                            message: formatMessage({id: "LANG2150"})
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0" ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                            }
                                                        }, {
                                                            validator: (data, value, callback) => {
                                                               this.state.method_change_calss.lan === 'display-block' && this.state.dhcp_ip6_class.fromto === 'display-block' && network_settings.dhcp6_enable !== "0" ? Validator.range(data, value, callback, formatMessage, 300, 172800) : callback()
                                                            }
                                                        }],
                                                        initialValue: dhcp6_settings.ip6leasetime
                                                    })(
                                                        <Input disabled={ network_settings.dhcp6_enable === "0" } />
                                                    ) }
                                                </FormItem>
                                            </div>
                                        </Row>
                                    </div>
                                </div>
                            </TabPane>
                        </Tabs>
                    </Form>
                </div>
            </div>
        )
    }
}

BasicSettings.propTypes = {
}

export default injectIntl(BasicSettings)

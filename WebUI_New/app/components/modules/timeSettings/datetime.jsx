'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl, formatMessage } from 'react-intl'
import { Form, Input, Button, Row, Col, Checkbox, message, Tooltip, Select } from 'antd'
import Validator from "../../api/validator"

const FormItem = Form.Item

class DateTime extends Component {
    constructor(props) {
        super(props)
        this.state = {
            datetime: {},
            customizeDisable: true
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {

    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let datetime = this.state.datetime
        let customizeDisable = this.state.customizeDisable
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getTimeSettings',
                remote_ntp_server: '',
                enable_dhcp_option_42: '',
                time_zone: '',
                enable_dhcp_option_2: '',
                self_defined_time_zone: ''
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    datetime = response || {}
                    if (datetime.time_zone === 'customize') {
                        customizeDisable = false
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        this.props.setInitDatetime(datetime)
        this.setState({
            datetime: datetime,
            customizeDisable: customizeDisable
        })
    }
    _onChangeTimeZone = (value) => {
        let customizeShow = this.state.customizeShow
        if (value === 'customize') {
            this.setState({
                customizeDisable: false
            })
        } else {
            this.setState({
                customizeDisable: true
            })
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { formatMessage } = this.props.intl
        const datetime = this.state.datetime
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        if (this.props.firstLoad) {
            this._getInitData()
            this.props.setFirstLoad(false)
        }

        return (
            <div className="app-content-main" id="app-content-main">
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_remote_ntp_server"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG2063" />}>
                                    <span>{formatMessage({id: "LANG2062"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('remote_ntp_server', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.host(data, value, callback, formatMessage, 'host')
                                    }
                                }],
                                initialValue: datetime.remote_ntp_server
                            })(
                                <Input />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_enable_dhcp_option_2"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG2060" />}>
                                    <span>{formatMessage({id: "LANG2059"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('enable_dhcp_option_2', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: datetime.enable_dhcp_option_2 === "1"
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_enable_dhcp_option_42"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG2065" />}>
                                    <span>{formatMessage({id: "LANG2064"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('enable_dhcp_option_42', {
                                rules: [],
                                valuePropName: "checked",
                                initialValue: datetime.enable_dhcp_option_42 === "1"
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_time_zone"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG2058" />}>
                                    <span>{formatMessage({id: "LANG2058"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('time_zone', {
                                rules: [],
                                initialValue: datetime.time_zone
                            })(
                                <Select onChange={ this._onChangeTimeZone } >
                                    <Option value="TZA+12">{ formatMessage({id: "LANG2067"}) }</Option>
                                    <Option value="TZB+11">{ formatMessage({id: "LANG2068"}) }</Option>
                                    <Option value="HAW10">{ formatMessage({id: "LANG2069"}) }</Option>
                                    <Option value="AKST9AKDT">{ formatMessage({id: "LANG2070"}) }</Option>
                                    <Option value="PST8PDT">{ formatMessage({id: "LANG2071"}) }</Option>
                                    <Option value="PST8PDT,M4.1.0,M10.5.0" locale="LANG2072"></Option>
                                    <Option value="MST7MDT">{ formatMessage({id: "LANG2073"}) }</Option>
                                    <Option value="MST7">{ formatMessage({id: "LANG2074"}) }</Option>
                                    <Option value="MST7MDT,M4.1.0,M10.5.0">{ formatMessage({id: "LANG2075"}) }</Option>
                                    <Option value="CST6CDT">{ formatMessage({id: "LANG2076"}) }</Option>
                                    <Option value="CST+6">{ formatMessage({id: "LANG2077"}) }</Option>
                                    <Option value="CST6CDT,M4.1.0,M10.5.0">{ formatMessage({id: "LANG2078"}) }</Option>
                                    <Option value="EST5EDT">{ formatMessage({id: "LANG2079"}) }</Option>
                                    <Option value="TZf+4:30">{ formatMessage({id: "LANG2080"}) }</Option>
                                    <Option value="AST4ADT">{ formatMessage({id: "LANG2081"}) }</Option>
                                    <Option value="AST4ADT,M4.1.0/00:01:00,M10.5.0/00:01:00">{ formatMessage({id: "LANG2082"}) }</Option>
                                    <Option value="NST+3:30NDT+2:30,M4.1.0/00:01:00,M10.5.0/00:01:00">{ formatMessage({id: "LANG2083"}) }</Option>
                                    <Option value="TZK+3">{ formatMessage({id: "LANG2084"}) }</Option>
                                    <Option value="BRST+3BRDT+2,M10.3.0,M2.3.0">{ formatMessage({id: "LANG2085"}) }</Option>
                                    <Option value="UTC+3">{ formatMessage({id: "LANG2086"}) }</Option>
                                    <Option value="UTC+3">{ formatMessage({id: "LANG4538"}) }</Option>
                                    <Option value="UTC+2">{ formatMessage({id: "LANG4539"}) }</Option>
                                    <Option value="TZL+2">{ formatMessage({id: "LANG2087"}) }</Option>
                                    <Option value="TZM+1">{ formatMessage({id: "LANG2088"}) }</Option>
                                    <Option value="TZN+0">{ formatMessage({id: "LANG2089"}) }</Option>
                                    <Option value="GMT+0BST-1,M3.5.0/01:00:00,M10.5.0/02:00:00">{ formatMessage({id: "LANG2090"}) }</Option>
                                    <Option value="WET-0WEST-1,M3.5.0/01:00:00,M10.5.0/02:00:00">{ formatMessage({id: "LANG2091"}) }</Option>
                                    <Option value="GMT+0IST-1,M3.5.0/01:00:00,M10.5.0/02:00:00">{ formatMessage({id: "LANG2092"}) }</Option>
                                    <Option value="CET-1CEST-2,M3.5.0/02:00:00,M10.5.0/03:00:00">{ formatMessage({id: "LANG2094"}) }</Option>
                                    <Option value="CET-1CEST-2,M3.5.0/02:00:00,M10.5.0/03:00:00">{ formatMessage({id: "LANG2095"}) }</Option>
                                    <Option value="TZP-2">{ formatMessage({id: "LANG2096"}) }</Option>
                                    <Option value="EET-2EEST-3,M3.5.0/03:00:00,M10.5.0/04:00:00">{ formatMessage({id: "LANG2097"}) }</Option>
                                    <Option value="EET-2EEST,M3.5.0/3,M10.5.0/4">{ formatMessage({id: "LANG2098"}) }</Option>
                                    <Option value="TZQ-3">{ formatMessage({id: "LANG2099"}) }</Option>
                                    <Option value="MSK-3">{ formatMessage({id: "LANG2100"}) }</Option>
                                    <Option value="MST-3">{ formatMessage({id: "LANG2101"}) }</Option>
                                    <Option value="TZR-4">{ formatMessage({id: "LANG2102"}) }</Option>
                                    <Option value="TZS-5">{ formatMessage({id: "LANG2103"}) }</Option>
                                    <Option value="TZT-5:30">{ formatMessage({id: "LANG2104"}) }</Option>
                                    <Option value="TZU-5:45">{ formatMessage({id: "LANG2105"}) }</Option>
                                    <Option value="TZV-6">{ formatMessage({id: "LANG2106"}) }</Option>
                                    <Option value="TZW-6:30">{ formatMessage({id: "LANG2107"}) }</Option>
                                    <Option value="TZX-7">{ formatMessage({id: "LANG2108"}) }</Option>
                                    <Option value="WIB-7">{ formatMessage({id: "LANG2109"}) }</Option>
                                    <Option value="TZY-8">{ formatMessage({id: "LANG2110"}) }</Option>
                                    <Option value="SGT-8">{ formatMessage({id: "LANG2111"}) }</Option>
                                    <Option value="ULAT-8">{ formatMessage({id: "LANG2112"}) }</Option>
                                    <Option value="WST-8">{ formatMessage({id: "LANG2113"}) }</Option>
                                    <Option value="TZZ-9">{ formatMessage({id: "LANG2114"}) }</Option>
                                    <Option value="CST-9:30CDT-10:30,M10.5.0/02:00:00,M3.5.0/03:00:00">{ formatMessage({id: "LANG2115"}) }</Option>
                                    <Option value="CST-9:30">{ formatMessage({id: "LANG2116"}) }</Option>
                                    <Option value="TZb-10">{ formatMessage({id: "LANG2117"}) }</Option>
                                    <Option value="EST-10EDT-11,M10.1.0/02:00:00,M3.5.0/03:00:00">{ formatMessage({id: "LANG2118"}) }</Option>
                                    <Option value="EST-10EDT-11,M10.5.0/02:00:00,M3.5.0/03:00:00">{ formatMessage({id: "LANG2119"}) }</Option>
                                    <Option value="EST-10">{ formatMessage({id: "LANG2120"}) }</Option>
                                    <Option value="TZc-11">{ formatMessage({id: "LANG2121"}) }</Option>
                                    <Option value="NZST-12NZDT-13,M9.5.0/02:00:00,M4.1.0/03:00:00">{ formatMessage({id: "LANG2122"}) }</Option>
                                    <Option value="TZd-12">{ formatMessage({id: "LANG2123"}) }</Option>
                                    <Option value="TZe-13">{ formatMessage({id: "LANG2124"}) }</Option>
                                    <Option value="customize">{ formatMessage({id: "LANG2125"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_self_defined_time_zone"
                            { ...formItemLayout }
                            label={                            
                                <Tooltip title={<FormattedHTMLMessage id="LANG2061" />}>
                                    <span>{formatMessage({id: "LANG2061"})}</span>
                                </Tooltip>
                            }>
                            { getFieldDecorator('self_defined_time_zone', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: !this.state.customizeDisable,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                        !this.state.customizeDisable ? Validator.pppoeSecret(data, value, callback, formatMessage) : callback()
                                    }
                                }],
                                initialValue: datetime.self_defined_time_zone
                            })(
                                <Input disabled={ this.state.customizeDisable } maxLength="60" />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default injectIntl(DateTime)

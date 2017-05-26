'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

import { message, Form, Checkbox, Select, Spin, Tooltip, Input, Col } from 'antd'
import {injectIntl, FormattedHTMLMessage, formatMessage} from 'react-intl'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'

const FormItem = Form.Item
const Option = Select.Option
const baseServerURl = api.apiHost
const CheckboxGroup = Checkbox.Group

class HaSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            checkList: [],
            configList: {}

        }
    }
    componentDidMount() {
    }
    componentWillMount() {
        this._getInitData()
    }
    _onChangecheck = (checkList) => {
        this.props.onChangeCheckList(checkList)
        this.setState({
            checkList
        })
    }
    _getInitData = () => {
        this.setState({
            checkList: this.props.checkList,
            configList: this.props.configList
        })
    }
    _checkOpenPort = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        var val = value
        if (!val) {
            callback()
            return
        }
        let originalPort = this.props.originalPort
        let openPort = this.props.portList
        if (originalPort) {
            openPort = _.without(openPort, originalPort)
        }
        if (val < 0 || val > 65535) {
            callback(formatMessage({id: "LANG957"}))
            return
        }
        if (val && _.indexOf(openPort, val) > -1) {
            callback(formatMessage({id: "LANG3869"}))
        } else {
            let used = false
            this.props.rangePortList.map(function(item) {
                let min = parseInt(item.split('-')[0])
                let max = parseInt(item.split('-')[1])
                let valuenum = parseInt(val)
                if (valuenum >= min && valuenum <= max) {
                    used = true
                }
            })
            if (used) {
                callback(formatMessage({id: "LANG3869"}))
            } else {
                callback()
            }
        }
    }
    _checkHaIp = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const { form } = this.props

        let hbip = form.getFieldValue('hbip')
        let hbpeerip = form.getFieldValue('hbpeerip')
        let tips = formatMessage({id: "LANG2637"}, {
                    0: formatMessage({id: "LANG5287"}),
                    1: formatMessage({id: "LANG5288"})
                })
        var val = value
        if (!val) {
            callback()
            return
        }
        if (val.slice(0, 10) !== '198.51.100') {
            callback(formatMessage({id: "LANG5335"}))
        } else if (hbip === hbpeerip) {
            callback(tips)
        } else {
            callback()
        }
    }
     _onChangeEnable = (e) => {
         let data = this.props.settings

         data.haon = e.target.checked ? "1" : "0"
         this.state.configList.disabled = !e.target.checked
         let i = 0
         let tempList = _.clone(this.props.originalConfigList)

         if (e.target.checked) {
             for (i = 0; i < this.state.configList.length; i++) {
                 this.state.configList[i].disabled = tempList[i].disabled ? true : false
             }
         } else {
             for (i = 0; i < this.state.configList.length; i++) {
                 this.state.configList[i].disabled = true
             }
         }
     }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        const settings = this.props.settings
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        document.title = formatMessage({id: "LANG4360"})

        return (
            <div className="app-content-main" id="app-content-main">
                <FormItem
                    { ...formItemLayout }
                    label={
                        <Tooltip title={<FormattedHTMLMessage id="LANG5274" />}>
                            <span>{formatMessage({id: "LANG5285"})}</span>
                        </Tooltip>
                    }>
                    { getFieldDecorator('haon', {
                        rules: [],
                        valuePropName: "checked",
                        initialValue: settings.haon === "1" ? true : false
                    })(
                        <Checkbox onChange={ this._onChangeEnable } />
                    ) }
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={
                        <Tooltip title={<FormattedHTMLMessage id="LANG5291" />}>
                            <span>{formatMessage({id: "LANG5290"})}</span>
                        </Tooltip>
                        }>
                    <Col span={12}>
                        <CheckboxGroup options={ this.state.configList } value={ this.state.checkList } onChange={ this._onChangecheck.bind(this) } />
                    </Col>
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={
                        <Tooltip title={<FormattedHTMLMessage id="LANG5276" />}>
                            <span>{formatMessage({id: "LANG5287"})}</span>
                        </Tooltip>
                }>
                    { getFieldDecorator('hbip', {
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
                            }, {
                                validator: this._checkHaIp
                        }],
                        initialValue: this.props.settings.hbip || "198.51.100.66"
                    })(
                        <Input disabled={ !(settings.haon === "1") } />
                    )}
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={
                        <Tooltip title={<FormattedHTMLMessage id="LANG5277" />}>
                            <span>{formatMessage({id: "LANG5288"})}</span>
                        </Tooltip>
                }>
                    { getFieldDecorator('hbpeerip', {
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
                        }, {
                            validator: this._checkHaIp
                        }],
                        initialValue: this.props.settings.hbpeerip || "198.51.100.88"
                    })(
                        <Input disabled={ !(settings.haon === "1") } />
                    )}
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={
                        <Tooltip title={<FormattedHTMLMessage id="LANG5325" />}>
                            <span>{formatMessage({id: "LANG5325"})}</span>
                        </Tooltip>
                }>
                    { getFieldDecorator('hbport', {
                        getValueFromEvent: (e) => {
                            return UCMGUI.toggleErrorMessage(e)
                        },
                        rules: [{
                            required: true,
                            message: formatMessage({id: "LANG2150"})
                        }, {
                            validator: this._checkOpenPort
                        }],
                        initialValue: this.props.settings.hbport || "9527"
                    })(
                        <Input disabled={ !(settings.haon === "1") } />
                    )}
                </FormItem>
                <FormItem
                    { ...formItemLayout }
                    label={
                        <Tooltip title={<FormattedHTMLMessage id="LANG5278" />}>
                            <span>{formatMessage({id: "LANG5289"})}</span>
                        </Tooltip>
                }>
                    { getFieldDecorator('hbto', {
                        getValueFromEvent: (e) => {
                            return UCMGUI.toggleErrorMessage(e)
                        },
                        rules: [{
                            required: true,
                            message: formatMessage({id: "LANG2150"})
                        }, {
                            validator: (data, value, callback) => {
                                Validator.range(data, value, callback, formatMessage, 5, 9)
                            }
                        }],
                        initialValue: this.props.settings.hbto || "7"
                    })(
                        <Input disabled={ !(settings.haon === "1") } />
                    )}
                </FormItem>
            </div>
        )
    }
}

HaSettings.propTypes = {
}

export default injectIntl(HaSettings)
module.exports = Form.create()(injectIntl(HaSettings))
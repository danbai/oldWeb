'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip, Button } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class FeatureMap extends Component {
    constructor(props) {
        super(props)

        const featureMaps = this.props.dataSource || {}

        this.state = {
            enable_fcode_seamless_transfer: featureMaps.enable_fcode_seamless_transfer === 'yes'
        }
    }
    _onChangeSeamless = (e) => {
        this.setState({
            enable_fcode_seamless_transfer: e.target.checked
        })
    }
    _validateFeatureMap = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        if (!value) {
            callback()
            return true
        }

        let texts = [
            'blindxfer',
            'atxfer',
            'disconnect',
            'parkcall',
            'automon',
            'automixmon',
            'fcode_seamless_transfer'
        ]
        const now = rule.field
        texts = _.without(texts, now)
        const len = texts.length

        let returnValue = true
        for (var i = 0; i < len; i++) {
            const tmp_value = getFieldValue(texts[i])
            if (tmp_value === value) {
                returnValue = false
            }
        }
        if (returnValue) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2208"}))
        }
    }
    _resetAll = () => {
        const { setFieldsValue } = this.props.form
        const featureMaps = this.props.dataSource || {}
        setFieldsValue({
            blindxfer: featureMaps.blindxfer,
            blindxfer_allow: featureMaps.blindxfer_allow || '',
            atxfer: featureMaps.atxfer,
            atxfer_allow: featureMaps.atxfer_allow || '',
            fcode_seamless_transfer: featureMaps.fcode_seamless_transfer,
            enable_fcode_seamless_transfer: featureMaps.enable_fcode_seamless_transfer === 'yes',
            disconnect: featureMaps.disconnect,
            disconnect_allow: featureMaps.disconnect_allow || '',
            parkcall: featureMaps.parkcall,
            parkcall_allow: featureMaps.parkcall_allow || '',
            automixmon: featureMaps.automixmon,
            automixmon_allow: featureMaps.automixmon_allow || ''
        })
        this.setState({
            enable_fcode_seamless_transfer: featureMaps.enable_fcode_seamless_transfer === 'yes'
        })
    }
    _resetDefault = () => {
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            blindxfer: "#1",
            blindxfer_allow: '',
            atxfer: "*2",
            atxfer_allow: '',
            fcode_seamless_transfer: "*44",
            enable_fcode_seamless_transfer: false,
            disconnect: "*0",
            disconnect_allow: '',
            parkcall: "#72",
            parkcall_allow: '',
            automixmon: "*3",
            automixmon_allow: ''
        })
        this.setState({
            enable_fcode_seamless_transfer: false
        })
    }
    _shareDial = (e) => {
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            blindxfer_allow: e,
            atxfer_allow: e
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const featureMaps = this.props.dataSource || {}
        const formItemLayout = {
            labelCol: { span: 12 },
            wrapperCol: { span: 10 }
        }

        return (
            <div className="content">
                <div className="top-button">
                    <Button type="primary" onClick={ this._resetAll }>{ formatMessage({id: "LANG751"}) }</Button>
                    <Button type="primary" onClick={ this._resetDefault }>{ formatMessage({id: "LANG749"}) }</Button>
                </div>
                <div className="ant-form">
                    <Row>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1215" /> }>
                                            <span>{ formatMessage({id: "LANG1214"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('blindxfer', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                         message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.numeric_pound_star(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: this._validateFeatureMap
                                    }],
                                    initialValue: featureMaps.blindxfer
                                })(
                                    <Input maxLength={5} />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('blindxfer_allow', {
                                    initialValue: featureMaps.blindxfer_allow || ''
                                })(
                                    <Select
                                        style={{ width: 200 }}
                                        onChange={ this._shareDial }
                                    >
                                        <Option value="">{ formatMessage({id: "LANG1254"}) }</Option>
                                        <Option value="T">{ formatMessage({id: "LANG1255"}) }</Option>
                                        <Option value="t">{ formatMessage({id: "LANG1256"}) }</Option>
                                        <Option value="tT">{ formatMessage({id: "LANG1257"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1209" /> }>
                                            <span>{ formatMessage({id: "LANG1208"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('atxfer', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                         message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.numeric_pound_star(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: this._validateFeatureMap
                                    }],
                                    initialValue: featureMaps.atxfer
                                })(
                                    <Input maxLength={5} />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('atxfer_allow', {
                                    initialValue: featureMaps.atxfer_allow || ''
                                })(
                                    <Select
                                        style={{ width: 200 }}
                                        onChange={ this._shareDial }
                                    >
                                        <Option value="">{ formatMessage({id: "LANG1254"}) }</Option>
                                        <Option value="T">{ formatMessage({id: "LANG1255"}) }</Option>
                                        <Option value="t">{ formatMessage({id: "LANG1256"}) }</Option>
                                        <Option value="tT">{ formatMessage({id: "LANG1257"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5155" /> }>
                                            <span>{ formatMessage({id: "LANG5153"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_seamless_transfer', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                         message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.numeric_pound_star(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: this._validateFeatureMap
                                    }],
                                    initialValue: featureMaps.fcode_seamless_transfer
                                })(
                                    <Input maxLength={5} disabled={ !this.state.enable_fcode_seamless_transfer } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_seamless_transfer', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_seamless_transfer
                                })(
                                    <Checkbox onChange={ this._onChangeSeamless } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1237" /> }>
                                            <span>{ formatMessage({id: "LANG1236"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('disconnect', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                         message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.numeric_pound_star(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: this._validateFeatureMap
                                    }],
                                    initialValue: featureMaps.disconnect
                                })(
                                    <Input maxLength={5}/>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('disconnect_allow', {
                                    initialValue: featureMaps.disconnect_allow || ''
                                })(
                                    <Select style={{ width: 200 }}>
                                        <Option value="">{ formatMessage({id: "LANG1254"}) }</Option>
                                        <Option value="H">{ formatMessage({id: "LANG1255"}) }</Option>
                                        <Option value="h">{ formatMessage({id: "LANG1256"}) }</Option>
                                        <Option value="hH">{ formatMessage({id: "LANG1257"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1217" /> }>
                                            <span>{ formatMessage({id: "LANG1216"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('parkcall', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                         message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.numeric_pound_star(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: this._validateFeatureMap
                                    }],
                                    initialValue: featureMaps.parkcall
                                })(
                                    <Input maxLength={5}/>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('parkcall_allow', {
                                    initialValue: featureMaps.parkcall_allow || ''
                                })(
                                    <Select style={{ width: 200 }}>
                                        <Option value="">{ formatMessage({id: "LANG1254"}) }</Option>
                                        <Option value="K">{ formatMessage({id: "LANG1255"}) }</Option>
                                        <Option value="k">{ formatMessage({id: "LANG1256"}) }</Option>
                                        <Option value="kK">{ formatMessage({id: "LANG1257"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1211" /> }>
                                            <span>{ formatMessage({id: "LANG1210"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('automixmon', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                         message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.numeric_pound_star(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: this._validateFeatureMap
                                    }],
                                    initialValue: featureMaps.automixmon
                                })(
                                    <Input maxLength={5}/>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('automixmon_allow', {
                                    initialValue: featureMaps.automixmon_allow || ''
                                })(
                                    <Select style={{ width: 200 }}>
                                        <Option value="">{ formatMessage({id: "LANG1254"}) }</Option>
                                        <Option value="X">{ formatMessage({id: "LANG1255"}) }</Option>
                                        <Option value="x">{ formatMessage({id: "LANG1256"}) }</Option>
                                        <Option value="xX">{ formatMessage({id: "LANG1257"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(FeatureMap)
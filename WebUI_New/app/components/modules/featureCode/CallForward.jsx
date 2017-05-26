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

let firstGetSettings = false

const FormItem = Form.Item
const Option = Select.Option

class CallForward extends Component {
    constructor(props) {
        super(props)

        const callForward = this.props.dataSource || {}

        this.state = {
            enable_fcode_dnd_on: callForward.enable_fcode_dnd_on === 'yes',
            enable_fcode_dnd_off: callForward.enable_fcode_dnd_off === 'yes',
            enable_fcode_cfb_on: callForward.enable_fcode_cfb_on === 'yes',
            enable_fcode_cfb_off: callForward.enable_fcode_cfb_off === 'yes',
            enable_fcode_cfn_on: callForward.enable_fcode_cfn_on === 'yes',
            enable_fcode_cfn_off: callForward.enable_fcode_cfn_off === 'yes',
            enable_fcode_cfu_on: callForward.enable_fcode_cfu_on === 'yes',
            enable_fcode_cfu_off: callForward.enable_fcode_cfu_off === 'yes'
        }
    }
    _checkFeatureCode = (value, except_id) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const featureCodes = this.props.featureCodes

        let valuesList = ['fcode_pickup',
            'fcode_dialvm',
            'fcode_vmmain',
            'fcode_agentpause',
            'fcode_pms_status',
            'fcode_ucm_wakeup',
            'fcode_wakeup', 
            'fcode_inbound_mode_zero',
            'fcode_inbound_mode_one', 
            'fcode_barge_listen',
            'fcode_barge_whisper',
            'fcode_barge_barge', 
            'fcode_agentunpause',
            'fcode_paging_prefix',
            'fcode_intercom_prefix', 
            'fcode_blacklist_add',
            'fcode_blacklist_remove',
            'fgeneral_pickupexten', 
            'fcode_direct_vm',
            'fcode_direct_phonenumber',
            'fcode_dnd_on', 'fcode_dnd_off', 'fcode_cfb_on', 'fcode_cfb_off',
            'fcode_cfn_on', 'fcode_cfn_off', 'fcode_cfu_on', 'fcode_cfu_off',
            'fcode_cc_request', 'fcode_cc_cancel',
            'number_seamless_transfer'
        ]

        const nowValue = except_id

        valuesList = _.without(valuesList, nowValue)
        const len = valuesList.length

        let hasSame = false
        for (var i = 0; i < len; i++) {
            const tmp_value = getFieldValue(valuesList[i])
            if (tmp_value) {
                if (tmp_value === value) {
                    hasSame = true
                }
            } else {
                if (featureCodes[valuesList[i]] === value) {
                    hasSame = true
                }
            }
        }

        return hasSame
    }
    _checkExtensionExists = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.props.numberListWithoutFCodes, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _checkEditValueExistance = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const featureSettings = this.props.featureSettings

        var id = rule.field

        if (this._checkFeatureCode(value, id)) {
            callback(formatMessage({id: "LANG2209"}))
            return
        }

        let parkextValue = featureSettings.parkext
        let parkext = getFieldValue('parkext')
        if (parkext) {
            parkextValue = parkext
        }

        if (value === parkextValue) {
            callback(formatMessage({id: "LANG2209"}))
            return
        }
        callback()
        return
    }
    _checkExist = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        if (rule.field === 'fcode_pickup') {
            callback()
            return
        }

        const val = getFieldValue('fcode_pickup')
        const len = val ? val.length : 0

        value = value.substring(0, len)

        if (val === value) {
            callback(formatMessage({id: "LANG5205"}))
            return
        }
        callback()
        return
    }
    _onChangeEnable = (e) => {
        this.setState({
            [e.target.id]: e.target.checked
        })
    }
    _resetAll = () => {
        const { setFieldsValue } = this.props.form
        const callForward = this.props.dataSource || {}
        setFieldsValue({
            fcode_dnd_on: callForward.fcode_dnd_on,
            enable_fcode_dnd_on: callForward.enable_fcode_dnd_on === 'yes',
            fcode_dnd_off: callForward.fcode_dnd_off,
            enable_fcode_dnd_off: callForward.enable_fcode_dnd_off === 'yes',
            fcode_cfb_on: callForward.fcode_cfb_on,
            enable_fcode_cfb_on: callForward.enable_fcode_cfb_on === 'yes',
            fcode_cfb_off: callForward.fcode_cfb_off,
            enable_fcode_cfb_off: callForward.enable_fcode_cfb_off === 'yes',
            fcode_cfn_on: callForward.fcode_cfn_on,
            enable_fcode_cfn_on: callForward.enable_fcode_cfn_on === 'yes',
            fcode_cfn_off: callForward.fcode_cfn_off,
            enable_fcode_cfn_off: callForward.enable_fcode_cfn_off === 'yes',
            fcode_cfu_on: callForward.fcode_cfu_on,
            enable_fcode_cfu_on: callForward.enable_fcode_cfu_on === 'yes',
            fcode_cfu_off: callForward.fcode_cfu_off,
            enable_fcode_cfu_off: callForward.enable_fcode_cfu_off === 'yes'
        })
        this.setState({
            enable_fcode_dnd_on: callForward.enable_fcode_dnd_on === 'yes',
            enable_fcode_dnd_off: callForward.enable_fcode_dnd_off === 'yes',
            enable_fcode_cfb_on: callForward.enable_fcode_cfb_on === 'yes',
            enable_fcode_cfb_off: callForward.enable_fcode_cfb_off === 'yes',
            enable_fcode_cfn_on: callForward.enable_fcode_cfn_on === 'yes',
            enable_fcode_cfn_off: callForward.enable_fcode_cfn_off === 'yes',
            enable_fcode_cfu_on: callForward.enable_fcode_cfu_on === 'yes',
            enable_fcode_cfu_off: callForward.enable_fcode_cfu_off === 'yes'
        })
    }
    _resetDefault = () => {
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            fcode_dnd_on: "*77",
            enable_fcode_dnd_on: true,
            fcode_dnd_off: "*78",
            enable_fcode_dnd_off: true,
            fcode_cfb_on: "*90",
            enable_fcode_cfb_on: true,
            fcode_cfb_off: "*91",
            enable_fcode_cfb_off: true,
            fcode_cfn_on: "*92",
            enable_fcode_cfn_on: true,
            fcode_cfn_off: "*93",
            enable_fcode_cfn_off: true,
            fcode_cfu_on: "*72",
            enable_fcode_cfu_on: true,
            fcode_cfu_off: "*73",
            enable_fcode_cfu_off: true
        })
        this.setState({
            enable_fcode_dnd_on: true,
            enable_fcode_dnd_off: true,
            enable_fcode_cfb_on: true,
            enable_fcode_cfb_off: true,
            enable_fcode_cfn_on: true,
            enable_fcode_cfn_off: true,
            enable_fcode_cfu_on: true,
            enable_fcode_cfu_off: true
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const callForward = this.props.dataSource || {}
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1239" /> }>
                                            <span>{ formatMessage({id: "LANG1238"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_dnd_on', {
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
                                        validator: this._checkExtensionExists
                                    }, {
                                        validator: this._checkEditValueExistance
                                    }, {
                                        validator: this._checkExist
                                    }],
                                    initialValue: callForward.fcode_dnd_on
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_dnd_on } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_dnd_on', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_dnd_on
                                })(
                                    <Checkbox onChange={ this._onChangeEnable } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1241" /> }>
                                            <span>{ formatMessage({id: "LANG1240"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_dnd_off', {
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
                                        validator: this._checkExtensionExists
                                    }, {
                                        validator: this._checkEditValueExistance
                                    }, {
                                        validator: this._checkExist
                                    }],
                                    initialValue: callForward.fcode_dnd_off
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_dnd_off } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_dnd_off', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_dnd_off
                                })(
                                    <Checkbox onChange={ this._onChangeEnable } />
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1221" /> }>
                                            <span>{ formatMessage({id: "LANG1220"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_cfb_on', {
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
                                        validator: this._checkExtensionExists
                                    }, {
                                        validator: this._checkEditValueExistance
                                    }, {
                                        validator: this._checkExist
                                    }],
                                    initialValue: callForward.fcode_cfb_on
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_cfb_on } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_cfb_on', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_cfb_on
                                })(
                                    <Checkbox onChange={ this._onChangeEnable } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1223" /> }>
                                            <span>{ formatMessage({id: "LANG1222"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_cfb_off', {
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
                                        validator: this._checkExtensionExists
                                    }, {
                                        validator: this._checkEditValueExistance
                                    }, {
                                        validator: this._checkExist
                                    }],
                                    initialValue: callForward.fcode_cfb_off
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_cfb_off } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_cfb_off', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_cfb_off
                                })(
                                    <Checkbox onChange={ this._onChangeEnable } />
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1225" /> }>
                                            <span>{ formatMessage({id: "LANG1224"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_cfn_on', {
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
                                        validator: this._checkExtensionExists
                                    }, {
                                        validator: this._checkEditValueExistance
                                    }, {
                                        validator: this._checkExist
                                    }],
                                    initialValue: callForward.fcode_cfn_on
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_cfn_on } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_cfn_on', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_cfn_on
                                })(
                                    <Checkbox onChange={ this._onChangeEnable } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1227" /> }>
                                            <span>{ formatMessage({id: "LANG1226"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_cfn_off', {
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
                                        validator: this._checkExtensionExists
                                    }, {
                                        validator: this._checkEditValueExistance
                                    }, {
                                        validator: this._checkExist
                                    }],
                                    initialValue: callForward.fcode_cfn_off
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_cfn_off } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_cfn_off', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_cfn_off
                                })(
                                    <Checkbox onChange={ this._onChangeEnable } />
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1229" /> }>
                                            <span>{ formatMessage({id: "LANG1228"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_cfu_on', {
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
                                        validator: this._checkExtensionExists
                                    }, {
                                        validator: this._checkEditValueExistance
                                    }, {
                                        validator: this._checkExist
                                    }],
                                    initialValue: callForward.fcode_cfu_on
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_cfu_on } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_cfu_on', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_cfu_on
                                })(
                                    <Checkbox onChange={ this._onChangeEnable } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1231" /> }>
                                            <span>{ formatMessage({id: "LANG1230"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_cfu_off', {
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
                                        validator: this._checkExtensionExists
                                    }, {
                                        validator: this._checkEditValueExistance
                                    }, {
                                        validator: this._checkExist
                                    }],
                                    initialValue: callForward.fcode_cfu_off
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_cfu_off } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_cfu_off', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_cfu_off
                                })(
                                    <Checkbox onChange={ this._onChangeEnable } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(CallForward)
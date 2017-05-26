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
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip, Button, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class FeatureCode extends Component {
    constructor(props) {
        super(props)

        const featureCodes = this.props.dataSource || {}
        const featureSettings = this.props.featureSettings || {}

        this.state = {
            enable_fcode_dialvm: featureCodes.enable_fcode_dialvm === 'yes',
            enable_fcode_vmmain: featureCodes.enable_fcode_vmmain === 'yes',
            enable_fcode_agentpause: featureCodes.enable_fcode_agentpause === 'yes',
            enable_fcode_agentunpause: featureCodes.enable_fcode_agentunpause === 'yes',
            enable_fcode_paging_prefix: featureCodes.enable_fcode_paging_prefix === 'yes',
            enable_fcode_intercom_prefix: featureCodes.enable_fcode_intercom_prefix === 'yes',
            enable_fcode_blacklist_add: featureCodes.enable_fcode_blacklist_add === 'yes',
            enable_fcode_blacklist_remove: featureCodes.enable_fcode_blacklist_remove === 'yes',
            enable_fcode_pickup: featureCodes.enable_fcode_pickup === 'yes',
            enable_number_seamless_transfer: featureCodes.enable_number_seamless_transfer === 'yes',
            enable_fgeneral_pickupexten: featureCodes.enable_fgeneral_pickupexten === 'yes',
            enable_fcode_direct_vm: featureCodes.enable_fcode_direct_vm === 'yes',
            enable_fcode_direct_phonenumber: featureCodes.enable_fcode_direct_phonenumber === 'yes',
            enable_fcode_cc_request: featureCodes.enable_fcode_cc_request === 'yes',
            enable_fcode_cc_cancel: featureCodes.enable_fcode_cc_cancel === 'yes',
            enable_fcode_ucm_wakeup: featureCodes.enable_fcode_ucm_wakeup === 'yes',
            enable_fcode_wakeup: featureCodes.enable_fcode_wakeup === 'yes',
            enable_fcode_pms_status: featureCodes.enable_fcode_pms_status === 'yes',
            barge_enable: featureSettings.barge_enable === 'yes',
            enable_fcode_presence_status: featureCodes.enable_fcode_presence_status === 'yes'
        }
    }
    componentWillMount() {
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
        const len = val.length

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
    _onChangeBargeEnable = (e) => {
        const {formatMessage} = this.props.intl,
            self = this

        this.setState({
            barge_enable: e.target.checked
        })

        if (e.target.checked) {
            Modal.confirm({
                content: <span dangerouslySetInnerHTML={{ __html: formatMessage({
                    id: "LANG4020"
                }, {
                    0: formatMessage({ id: "LANG4018" }), 
                    1: formatMessage({ id: "LANG727" })
                }) }}></span>,
                okText: formatMessage({ id: "LANG727" }),
                cancelText: formatMessage({ id: "LANG726" }),
                onOk() {
                    self.props.form.setFieldsValue({
                        barge_enable: true
                    })
                    self.setState({
                        barge_enable: true
                    })
                },
                onCancel() {
                    self.props.form.setFieldsValue({
                        barge_enable: false
                    })
                    self.setState({
                        barge_enable: false
                    })
                }
            })
        }
    }
    _resetAll = () => {
        const { setFieldsValue } = this.props.form
        const featureCodes = this.props.dataSource || {}
        setFieldsValue({
            fcode_dialvm: featureCodes.fcode_dialvm,
            enable_fcode_dialvm: featureCodes.enable_fcode_dialvm === 'yes',
            fcode_vmmain: featureCodes.fcode_vmmain,
            enable_fcode_vmmain: featureCodes.enable_fcode_vmmain === 'yes',
            fcode_agentpause: featureCodes.fcode_agentpause,
            enable_fcode_agentpause: featureCodes.enable_fcode_agentpause === 'yes',
            fcode_agentunpause: featureCodes.fcode_agentunpause,
            enable_fcode_agentunpause: featureCodes.enable_fcode_agentunpause === 'yes',
            fcode_paging_prefix: featureCodes.fcode_paging_prefix,
            enable_fcode_paging_prefix: featureCodes.enable_fcode_paging_prefix === 'yes',
            fcode_intercom_prefix: featureCodes.fcode_intercom_prefix,
            enable_fcode_intercom_prefix: featureCodes.enable_fcode_intercom_prefix === 'yes',
            fcode_blacklist_add: featureCodes.fcode_blacklist_add,
            enable_fcode_blacklist_add: featureCodes.enable_fcode_blacklist_add === 'yes',
            fcode_blacklist_remove: featureCodes.fcode_blacklist_remove,
            enable_fcode_blacklist_remove: featureCodes.enable_fcode_blacklist_remove === 'yes',
            fcode_pickup: featureCodes.fcode_pickup,
            enable_fcode_pickup: featureCodes.enable_fcode_pickup === 'yes',
            number_seamless_transfer: featureCodes.number_seamless_transfer,
            enable_number_seamless_transfer: featureCodes.enable_number_seamless_transfer === 'yes',
            fgeneral_pickupexten: featureCodes.fgeneral_pickupexten,
            enable_fgeneral_pickupexten: featureCodes.enable_fgeneral_pickupexten === 'yes',
            fcode_direct_vm: featureCodes.fcode_direct_vm,
            enable_fcode_direct_vm: featureCodes.enable_fcode_direct_vm === 'yes',
            fcode_direct_phonenumber: featureCodes.fcode_direct_phonenumber,
            enable_fcode_direct_phonenumber: featureCodes.enable_fcode_direct_phonenumber === 'yes',
            fcode_cc_request: featureCodes.fcode_cc_request,
            enable_fcode_cc_request: featureCodes.enable_fcode_cc_request === 'yes',
            fcode_cc_cancel: featureCodes.fcode_cc_cancel,
            enable_fcode_cc_cancel: featureCodes.enable_fcode_cc_cancel === 'yes',
            barge_enable: featureCodes.barge_enable === 'yes',
            fcode_barge_listen: featureCodes.fcode_barge_listen,
            fcode_barge_whisper: featureCodes.fcode_barge_whisper,
            fcode_barge_barge: featureCodes.fcode_barge_barge,
            fcode_ucm_wakeup: featureCodes.fcode_ucm_wakeup,
            enable_fcode_ucm_wakeup: featureCodes.enable_fcode_ucm_wakeup === 'yes',
            fcode_wakeup: featureCodes.fcode_wakeup,
            enable_fcode_wakeup: featureCodes.enable_fcode_wakeup === 'yes',
            fcode_pms_status: featureCodes.fcode_pms_status,
            enable_fcode_pms_status: featureCodes.enable_fcode_pms_status === 'yes',
            fcode_presence_status: featureCodes.fcode_presence_status,
            enable_fcode_presence_status: featureCodes.enable_fcode_presence_status === 'yes'
        })
        this.setState({
            enable_fcode_dialvm: featureCodes.enable_fcode_dialvm === 'yes',
            enable_fcode_vmmain: featureCodes.enable_fcode_vmmain === 'yes',
            enable_fcode_agentpause: featureCodes.enable_fcode_agentpause === 'yes',
            enable_fcode_agentunpause: featureCodes.enable_fcode_agentunpause === 'yes',
            enable_fcode_paging_prefix: featureCodes.enable_fcode_paging_prefix === 'yes',
            enable_fcode_intercom_prefix: featureCodes.enable_fcode_intercom_prefix === 'yes',
            enable_fcode_blacklist_add: featureCodes.enable_fcode_blacklist_add === 'yes',
            enable_fcode_blacklist_remove: featureCodes.enable_fcode_blacklist_remove === 'yes',
            enable_fcode_pickup: featureCodes.enable_fcode_pickup === 'yes',
            enable_number_seamless_transfer: featureCodes.enable_number_seamless_transfer === 'yes',
            enable_fgeneral_pickupexten: featureCodes.enable_fgeneral_pickupexten === 'yes',
            enable_fcode_direct_vm: featureCodes.enable_fcode_direct_vm === 'yes',
            enable_fcode_direct_phonenumber: featureCodes.enable_fcode_direct_phonenumber === 'yes',
            enable_fcode_cc_request: featureCodes.enable_fcode_cc_request === 'yes',
            enable_fcode_cc_cancel: featureCodes.enable_fcode_cc_cancel === 'yes',
            barge_enable: featureCodes.barge_enable === 'yes',
            enable_fcode_ucm_wakeup: featureCodes.enable_fcode_ucm_wakeup === 'yes',
            enable_fcode_wakeup: featureCodes.enable_fcode_wakeup === 'yes',
            enable_fcode_pms_status: featureCodes.enable_fcode_pms_status === 'yes',
            enable_fcode_presence_status: featureCodes.enable_fcode_presence_status === 'yes'
        })
    }
    _resetDefault = () => {
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            fcode_dialvm: '*98',
            enable_fcode_dialvm: true,
            fcode_vmmain: '*97',
            enable_fcode_vmmain: true,
            fcode_agentpause: '*83',
            enable_fcode_agentpause: true,
            fcode_agentunpause: '*84',
            enable_fcode_agentunpause: true,
            fcode_paging_prefix: '*81',
            enable_fcode_paging_prefix: true,
            fcode_intercom_prefix: '*80',
            enable_fcode_intercom_prefix: true,
            fcode_blacklist_add: '*40',
            enable_fcode_blacklist_add: true,
            fcode_blacklist_remove: '*41',
            enable_fcode_blacklist_remove: true,
            fcode_pickup: '**',
            enable_fcode_pickup: true,
            number_seamless_transfer: '*45',
            enable_number_seamless_transfer: false,
            fgeneral_pickupexten: '*8',
            enable_fgeneral_pickupexten: true,
            fcode_direct_vm: '*',
            enable_fcode_direct_vm: true,
            fcode_direct_phonenumber: '*88',
            enable_fcode_direct_phonenumber: true,
            fcode_cc_request: '*11',
            enable_fcode_cc_request: true,
            fcode_cc_cancel: '*12',
            enable_fcode_cc_cancel: true,
            barge_enable: false,
            fcode_barge_listen: '*54',
            fcode_barge_whisper: '*55',
            fcode_barge_barge: '*56',
            fcode_ucm_wakeup: '*36',
            enable_fcode_ucm_wakeup: true,
            fcode_wakeup: '*35',
            enable_fcode_wakeup: true,
            fcode_pms_status: '*23',
            enable_fcode_pms_status: true,
            fcode_presence_status: '*48',
            enable_fcode_presence_status: true
        })
        this.setState({
            enable_fcode_dialvm: true,
            enable_fcode_vmmain: true,
            enable_fcode_agentpause: true,
            enable_fcode_agentunpause: true,
            enable_fcode_paging_prefix: true,
            enable_fcode_intercom_prefix: true,
            enable_fcode_blacklist_add: true,
            enable_fcode_blacklist_remove: true,
            enable_fcode_pickup: true,
            enable_number_seamless_transfer: false,
            enable_fgeneral_pickupexten: true,
            enable_fcode_direct_vm: true,
            enable_fcode_direct_phonenumber: true,
            enable_fcode_cc_request: true,
            enable_fcode_cc_cancel: true,
            barge_enable: false,
            enable_fcode_ucm_wakeup: true,
            enable_fcode_wakeup: true,
            enable_fcode_pms_status: true,
            enable_fcode_presence_status: true
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const featureCodes = this.props.dataSource || {}
        const formItemLayout = {
            labelCol: { span: 12 },
            wrapperCol: { span: 10 }
        }
        const formItemLayoutDefault = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1233" /> }>
                                            <span>{ formatMessage({id: "LANG1232"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_dialvm', {
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
                                    initialValue: featureCodes.fcode_dialvm
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_dialvm } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_dialvm', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_dialvm
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1252" /> }>
                                            <span>{ formatMessage({id: "LANG1253"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_vmmain', {
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
                                    initialValue: featureCodes.fcode_vmmain
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_vmmain } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_vmmain', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_vmmain
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1205" /> }>
                                            <span>{ formatMessage({id: "LANG1204"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_agentpause', {
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
                                    initialValue: featureCodes.fcode_agentpause
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_agentpause } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_agentpause', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_agentpause
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1207" /> }>
                                            <span>{ formatMessage({id: "LANG1206"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_agentunpause', {
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
                                    initialValue: featureCodes.fcode_agentunpause
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_agentunpause } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_agentunpause', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_agentunpause
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1249" /> }>
                                            <span>{ formatMessage({id: "LANG1248"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_paging_prefix', {
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
                                    initialValue: featureCodes.fcode_paging_prefix
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_paging_prefix } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_paging_prefix', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_paging_prefix
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1247" /> }>
                                            <span>{ formatMessage({id: "LANG1246"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_intercom_prefix', {
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
                                    initialValue: featureCodes.fcode_intercom_prefix
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_intercom_prefix } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_intercom_prefix', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_intercom_prefix
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2286" /> }>
                                            <span>{ formatMessage({id: "LANG2282"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_blacklist_add', {
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
                                    initialValue: featureCodes.fcode_blacklist_add
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_blacklist_add } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_blacklist_add', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_blacklist_add
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2284" /> }>
                                            <span>{ formatMessage({id: "LANG2281"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_blacklist_remove', {
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
                                    initialValue: featureCodes.fcode_blacklist_remove
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_blacklist_remove } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_blacklist_remove', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_blacklist_remove
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1219" /> }>
                                            <span>{ formatMessage({id: "LANG1218"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_pickup', {
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
                                    initialValue: featureCodes.fcode_pickup
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_pickup } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_pickup', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_pickup
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5156" /> }>
                                            <span>{ formatMessage({id: "LANG5154"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('number_seamless_transfer', {
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
                                    initialValue: featureCodes.number_seamless_transfer
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_number_seamless_transfer } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_number_seamless_transfer', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_number_seamless_transfer
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2517" /> }>
                                            <span>{ formatMessage({id: "LANG2516"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fgeneral_pickupexten', {
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
                                    initialValue: featureCodes.fgeneral_pickupexten
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fgeneral_pickupexten } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fgeneral_pickupexten', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fgeneral_pickupexten
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2639" /> }>
                                            <span>{ formatMessage({id: "LANG2638"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_direct_vm', {
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
                                    initialValue: featureCodes.fcode_direct_vm
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_direct_vm } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_direct_vm', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_direct_vm
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5096" /> }>
                                            <span>{ formatMessage({id: "LANG5095"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_direct_phonenumber', {
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
                                    initialValue: featureCodes.fcode_direct_phonenumber
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_direct_phonenumber } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_direct_phonenumber', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_direct_phonenumber
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3722" /> }>
                                            <span>{ formatMessage({id: "LANG3721"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_cc_request', {
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
                                    initialValue: featureCodes.fcode_cc_request
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_cc_request } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_cc_request', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_cc_request
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3724" /> }>
                                            <span>{ formatMessage({id: "LANG3723"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_cc_cancel', {
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
                                    initialValue: featureCodes.fcode_cc_cancel
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_cc_cancel } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_cc_cancel', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_cc_cancel
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4019" /> }>
                                            <span>{ formatMessage({id: "LANG4018"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('barge_enable', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.barge_enable
                                })(
                                    <Checkbox onChange={ this._onChangeBargeEnable } />
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4013" /> }>
                                            <span>{ formatMessage({id: "LANG4012"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_barge_listen', {
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
                                    initialValue: featureCodes.fcode_barge_listen
                                })(
                                    <Input maxLength={10} disabled={ !this.state.barge_enable } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }></Col>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4015" /> }>
                                            <span>{ formatMessage({id: "LANG4014"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_barge_whisper', {
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
                                    initialValue: featureCodes.fcode_barge_whisper
                                })(
                                    <Input maxLength={10} disabled={ !this.state.barge_enable } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }></Col>
                    </Row>
                    <Row>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4017" /> }>
                                            <span>{ formatMessage({id: "LANG4016"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_barge_barge', {
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
                                    initialValue: featureCodes.fcode_barge_barge
                                })(
                                    <Input maxLength={10} disabled={ !this.state.barge_enable } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }></Col>
                        <Col span={ 6 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5202" /> }>
                                            <span>{ formatMessage({id: "LANG4858"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_ucm_wakeup', {
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
                                    initialValue: featureCodes.fcode_ucm_wakeup
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_ucm_wakeup } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_ucm_wakeup', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_ucm_wakeup
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5165" /> }>
                                            <span>{ formatMessage({id: "LANG5166"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_wakeup', {
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
                                    initialValue: featureCodes.fcode_wakeup
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_wakeup } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_wakeup', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_wakeup
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4924" /> }>
                                            <span>{ formatMessage({id: "LANG4885"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_pms_status', {
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
                                    initialValue: featureCodes.fcode_pms_status
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_pms_status } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_pms_status', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_pms_status
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5457" /> }>
                                            <span>{ formatMessage({id: "LANG5450"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('fcode_presence_status', {
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
                                    initialValue: featureCodes.fcode_presence_status
                                })(
                                    <Input maxLength={10} disabled={ !this.state.enable_fcode_presence_status } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 6 }>
                            <FormItem>
                                { getFieldDecorator('enable_fcode_presence_status', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_fcode_presence_status
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

export default injectIntl(FeatureCode)
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

global.FeatureMiscDisabledParkext = false

class FeatureMisc extends Component {
    constructor(props) {
        super(props)
        this.state = {
            extensionPrefSettings: {}
        }
    }
    componentWillMount() {
        this._getExtenPrefSettings()
        this._getInitData()
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
    _checkPattern = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        if (!value || /[0-9]+\-[0-9]+/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2139"}))
        }
    }
    _checkExtensionExists = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.props.numberListWithoutFCodes, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _validateParkext = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const parkpos = getFieldValue('parkpos')
        const splits = parkpos.split('-')
        const pos_start = parseInt(splits[0], 10)
        const pos_end = parseInt((splits[1] ? splits[1] : ""), 10)

        let returnValue = true
        for (var i = pos_start; i <= pos_end; i++) {
            if (value === i.toString()) {
                returnValue = false
            }
        }

        if (this._checkFeatureCode(value, rule.field)) {
            returnValue = false
        }

        if (returnValue) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2209"}))
        }
    }
    _checkWithRange = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        let extenPrefSettings = this.state.extensionPrefSettings

        const parkext = Number(value)

        if (value && extenPrefSettings && extenPrefSettings && JSON.stringify(extenPrefSettings) !== "{}") {
            if (parkext >= Number(extenPrefSettings.ue_start) && parkext <= Number(extenPrefSettings.ue_end) ||
                parkext >= Number(extenPrefSettings.mm_start) && parkext <= Number(extenPrefSettings.mm_end) ||
                parkext >= Number(extenPrefSettings.rge_start) && parkext <= Number(extenPrefSettings.rge_end) ||
                parkext >= Number(extenPrefSettings.qe_start) && parkext <= Number(extenPrefSettings.qe_end) ||
                parkext >= Number(extenPrefSettings.vmg_start) && parkext <= Number(extenPrefSettings.vmg_end) ||
                parkext >= Number(extenPrefSettings.vme_start) && parkext <= Number(extenPrefSettings.vme_end) ||
                parkext >= Number(extenPrefSettings.directory_start) && parkext <= Number(extenPrefSettings.directory_end) ||
                parkext >= Number(extenPrefSettings.fax_start) && parkext <= Number(extenPrefSettings.fax_end)) {
                callback(formatMessage({id: "LANG2144"}))
            } else {
                callback()
            }
        } else {
            callback()
        }
    }
    _validateParkpos = (rule, value, callback) => {
        if (!value) {
            callback()
            return
        }
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const numberListWithoutFCodes = this.props.numberListWithoutFCodes

        if (!value.match(/^[0-9]+\-[0-9]+$/)) {
            // pattern will take care it
            callback()
            return
        }

        // lets split
        var splits = value.split('-'),
            pos_start = parseInt(splits[0], 10),
            pos_end = parseInt(splits[1], 10)

        if (pos_start > pos_end) {
            callback(formatMessage({id: "LANG2133"}))
            return
        }

        var prefs = {
            ue: 'User Extensions',
            zcue: 'Zero Config Extensions',
            pkue: 'Pick Extensions',
            mm: 'Conference Extensions',
            qe: 'Queue Extensions',
            vme: 'Voicemail Extensions',
            rge: 'Ring Group Extensions',
            vmg: 'Voicemail Group Extensions',
            fax: 'Fax Extensions'
        }
        const extenPrefSettings = this.props.extenPrefSettings

        let returnValue = true
        for (let pref in prefs) {
            if (!prefs.hasOwnProperty(pref)) {
                continue
            }

            var start = extenPrefSettings[pref + '_start'],
                end = extenPrefSettings[pref + '_end']

            if ((pos_start >= start && pos_start <= end) || (pos_end >= start && pos_end <= end) || (pos_start < start && pos_end >= start)) {
                returnValue = false
            }
        }

        if (returnValue === false) {
            callback(formatMessage({id: "LANG2133"}))
            return
        }
        let parkext = getFieldValue('parkext')
        let park_as_extension = getFieldValue('park_as_extension')

        for (var i = pos_start; i <= pos_end; i++) {
            if (park_as_extension) {
                if (_.indexOf(numberListWithoutFCodes, i) > -1) {
                    returnValue = false
                }
            }

            var val = i.toString()

            if (this._checkFeatureCode(val, 'parkpos') || (parkext === val)) {
                returnValue = false
            }
        }
        if (returnValue) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2133"}))
        }
    }
    _validateParkposFormate = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        if (!value || /^[1-9]\d*\-[1-9]\d*$/.test(value)) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2644"}))
        }
    }
    _validateParkposRange = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue, setFieldsValue } = this.props.form

        var splits = value.split('-'),
            pos_start = parseInt(splits[0], 10),
            pos_end = parseInt((splits[1] ? splits[1] : ""), 10)

        if ((typeof pos_start === "number") && (typeof pos_end === "number") && (pos_start >= 1) && (pos_end <= 10000)) {
            global.FeatureMiscDisabledParkext = false
            callback()
        } else {
            global.FeatureMiscDisabledParkext = true
            callback(formatMessage({id: "LANG3511"}, {0: 1, 1: 10000}))
        }
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        let mohNameList = UCMGUI.isExist.getList('getMohNameList', formatMessage)

        this.setState({
            mohNameList: mohNameList ? mohNameList : ['default', 'ringbacktone_default']
        })
    }
    _getExtenPrefSettings = () => {
        let extensionPrefSettings = {}

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getExtenPrefSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const response = res.response.extension_pref_settings || {}

                this.setState({
                    extensionPrefSettings: response
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _resetAll = () => {
        const { setFieldsValue } = this.props.form
        const featureMisc = this.props.dataSource || {}
        setFieldsValue({
            featuredigittimeout: featureMisc.featuredigittimeout,
            parkext: featureMisc.parkext,
            parkpos: featureMisc.parkpos,
            park_as_extension: featureMisc.park_as_extension === 'yes',
            parkingtime: featureMisc.parkingtime,
            parkedmusicclass: featureMisc.parkedmusicclass || ''
        })
        this.setState({
            park_as_extension: featureMisc.park_as_extension === 'yes'
        })
    }
    _resetDefault = () => {
        const { setFieldsValue } = this.props.form
        setFieldsValue({
            featuredigittimeout: '1000',
            parkext: '700',
            parkpos: '701-720',
            park_as_extension: false,
            parkingtime: '300',
            parkedmusicclass: 'default'
        })
        this.setState({
            park_as_extension: false
        })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const featureMisc = this.props.dataSource || {}
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
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1235" /> }>
                                            <span>{ formatMessage({id: "LANG1234"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('featuredigittimeout', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.range(data, value, callback, formatMessage, 800, 10000)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: featureMisc.featuredigittimeout
                                })(
                                    <Input maxLength={5}/>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1245" /> }>
                                            <span>{ formatMessage({id: "LANG1244"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('parkext', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.range(data, value, callback, formatMessage, 1, 10000)
                                        }
                                    }, {
                                        validator: this._checkExtensionExists
                                    }, {
                                        validator: this._validateParkext
                                    }, {
                                        validator: this._checkWithRange
                                    }],
                                    initialValue: featureMisc.parkext
                                })(
                                    <Input disabled={ global.FeatureMiscDisabledParkext } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1243" /> }>
                                            <span>{ formatMessage({id: "LANG1242"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('parkpos', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: this._checkPattern
                                    }, {
                                        validator: this._validateParkposFormate
                                    }, {
                                        validator: this._validateParkposRange
                                    }, {
                                        validator: this._validateParkpos
                                    }],
                                    initialValue: featureMisc.parkpos
                                })(
                                    <Input maxLength={11}/>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG3983" /> }>
                                            <span>{ formatMessage({id: "LANG3982"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('park_as_extension', {
                                    valuePropName: 'checked',
                                    initialValue: featureMisc.park_as_extension === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1251" /> }>
                                            <span>{ formatMessage({id: "LANG1250"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('parkingtime', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 1)
                                        }
                                    }],
                                    initialValue: featureMisc.parkingtime
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1603" /> }>
                                            <span>{ formatMessage({id: "LANG1603"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}>
                                { getFieldDecorator('parkedmusicclass', {
                                    initialValue: featureMisc.parkedmusicclass
                                })(
                                    <Select>
                                        {
                                            this.state.mohNameList.map(function(value) {
                                                return <Option key={ value } value={ value }>{ value }</Option>
                                            })
                                        }
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

export default injectIntl(FeatureMisc)
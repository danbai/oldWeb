'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Tooltip, Modal, Button } from 'antd'

const FormItem = Form.Item

class PbxGeneralSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            generalPrefSettings: {},
            extensionPrefSettings: {},
            isDisplayLimitime: 'hidden',
            disableRange: false,
            portExtensionList: []
        }
    }
    componentDidMount() {
        this._getPortExtension()
        this._getInitData()
    }
    _isValueInBetween = (value, a, b) => {
        a = Number(a)
        b = Number(b)
        var c = Number(value),
            a1 = Math.min(a, b),
            b1 = Math.max(a, b)

        return (c >= a1 && c <= b1) ? true : false
    }
    _checkTimeLarger = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        const maximumTime = parseInt(value)
        const warningtime = parseInt(getFieldValue('warningtime'))
        const repeattime = parseInt(getFieldValue('repeattime'))

        let isTrue = false
        if (!isNaN(warningtime)) {
            if (!isNaN(repeattime)) {
                if (maximumTime > warningtime && warningtime > repeattime) {
                    isTrue = true
                }
            } else if (maximumTime > warningtime) {
                isTrue = true
            }
        } else {
            if (isNaN(repeattime)) {
                isTrue = true
            } else if (maximumTime > repeattime) {
                isTrue = true
            }
        }
        if (isTrue) {
            callback()
        } else {
            callback(formatMessage({id: "LANG4346"}))
        }
    }
    _isRangeUe = (rule, value, callback) => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const me = this
        const disable_extension_ranges = getFieldValue('disable_extension_ranges')
        if (disable_extension_ranges || !value) {
            callback()
            return
        }

        let start_str = ''
        let end_str = ''
        let head_str = ''
        const now_field = rule.field /* ue_start zue_start */
        if (now_field.slice(-6) === '_start') {
            head_str = now_field.slice(0, -6)
            start_str = now_field.slice(0, -6) + '_start'
            end_str = now_field.slice(0, -6) + '_end'
        } else if (now_field.slice(-4) === '_end') {
            head_str = now_field.slice(0, -4)
            start_str = now_field.slice(0, -4) + '_start'
            end_str = now_field.slice(0, -4) + '_end'
        }

        let start = getFieldValue(start_str)
        let end = getFieldValue(end_str)

        start = Number(start)
        end = Number(end)

        let ueStart = getFieldValue('ue_start')
        let ueEnd = getFieldValue('ue_end')

        ueStart = Number(ueStart)
        ueEnd = Number(ueEnd)

        if (start < ueStart || end > ueEnd) {
            callback(formatMessage({id: "LANG2707"}))
        } else {
            callback()
        }
    }
    _isRangeUeConflict = (rule, value, callback) => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const me = this
        const disable_extension_ranges = getFieldValue('disable_extension_ranges')
        if (disable_extension_ranges || !value) {
            callback()
            return
        }

        let start_str = ''
        let end_str = ''
        let head_str = ''
        const now_field = rule.field /* ue_start zue_start */
        if (now_field.slice(-6) === '_start') {
            head_str = now_field.slice(0, -6)
            start_str = now_field.slice(0, -6) + '_start'
            end_str = now_field.slice(0, -6) + '_end'
        } else if (now_field.slice(-4) === '_end') {
            head_str = now_field.slice(0, -4)
            start_str = now_field.slice(0, -4) + '_start'
            end_str = now_field.slice(0, -4) + '_end'
        }

        let start = getFieldValue(start_str)
        let end = getFieldValue(end_str)

        start = Number(start)
        end = Number(end)

        let otherRange = [
            'zcue_range',
            'pkue_range'
        ]

        otherRange = _.without(otherRange, head_str + '_range')
        const length = otherRange.length

        let isReturnTrue = true
        for (var i = 0; i < length; i++) {
            const comp_head_str = otherRange[i].slice(0, -6)
            const comp_start_str = comp_head_str + '_start'
            const comp_end_str = comp_head_str + '_end'
            let comp_start = getFieldValue(comp_start_str)
            let comp_end = getFieldValue(comp_end_str)

            comp_start = Number(comp_start)
            comp_end = Number(comp_end)

            if (me._isValueInBetween(start, comp_start, comp_end)) {
                isReturnTrue = false
            } else if (me._isValueInBetween(end, comp_start, comp_end)) {
                isReturnTrue = false
            }
        }
        if (isReturnTrue) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2144"}))
        }
    }
    _isRangeConflict = (rule, value, callback) => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const me = this
        const disable_extension_ranges = getFieldValue('disable_extension_ranges')
        if (disable_extension_ranges || !value) {
            callback()
            return
        }

        let start_str = ''
        let end_str = ''
        let head_str = ''
        const now_field = rule.field /* ue_start zue_start */
        if (now_field.slice(-6) === '_start') {
            head_str = now_field.slice(0, -6)
            start_str = now_field.slice(0, -6) + '_start'
            end_str = now_field.slice(0, -6) + '_end'
        } else if (now_field.slice(-4) === '_end') {
            head_str = now_field.slice(0, -4)
            start_str = now_field.slice(0, -4) + '_start'
            end_str = now_field.slice(0, -4) + '_end'
        }

        let start = getFieldValue(start_str)
        let end = getFieldValue(end_str)

        start = Number(start)
        end = Number(end)

        let otherRange = [
            'ue_range',
            'mm_range',
            'vme_range',
            'rge_range',
            'qe_range',
            'vmg_range',
            'directory_range',
            'fax_range'
        ]

        otherRange = _.without(otherRange, head_str + '_range')
        const length = otherRange.length

        let isReturnTrue = true
        for (var i = 0; i < length; i++) {
            const comp_head_str = otherRange[i].slice(0, -6)
            const comp_start_str = comp_head_str + '_start'
            const comp_end_str = comp_head_str + '_end'
            let comp_start = getFieldValue(comp_start_str)
            let comp_end = getFieldValue(comp_end_str)

            comp_start = Number(comp_start)
            comp_end = Number(comp_end)

            if (me._isValueInBetween(start, comp_start, comp_end)) {
                isReturnTrue = false
            } else if (me._isValueInBetween(end, comp_start, comp_end)) {
                isReturnTrue = false
            }
        }
        if (isReturnTrue) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2144"}))
        }
    }
    _checkIsSmaller = (rule, value, callback) => {
        if (!value) {
            callback()
            return
        }
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const me = this
        const now_field = rule.field /* ue_start zcue_start */
        const head_str = now_field.slice(0, -6)
        const end_str = head_str + '_end'
        let end = getFieldValue(end_str)
        end = Number(end)
        let start = Number(value)
        if (start >= end) {
            callback(formatMessage({id: "LANG2165"}, {0: formatMessage({id: "LANG560"}), 1: formatMessage({id: "LANG561"})}))
        } else {
            callback()
        }
    }
    _checkIsBigger = (rule, value, callback) => {
        if (!value) {
            callback()
            return
        }
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const me = this
        const now_field = rule.field /* ue_end zcue_end */
        const head_str = now_field.slice(0, -4)
        const start_str = head_str + '_start'
        let start = getFieldValue(start_str)
        start = Number(start)
        let end = Number(value)
        if (end <= start) {
            callback(formatMessage({id: "LANG2142"}, {0: formatMessage({id: "LANG561"}), 1: formatMessage({id: "LANG560"})}))
        } else {
            callback()
        }
    }
    _compareLength = (rule, value, callback) => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const me = this
        const disable_extension_ranges = getFieldValue('disable_extension_ranges')
        if (disable_extension_ranges || !value) {
            callback()
            return
        }

        let start_str = ''
        let end_str = ''
        let head_str = ''
        const now_field = rule.field /* ue_start zue_start */
        if (now_field.slice(-6) === '_start') {
            head_str = now_field.slice(0, -6)
            start_str = now_field.slice(0, -6) + '_start'
            end_str = now_field.slice(0, -6) + '_end'
        } else if (now_field.slice(-4) === '_end') {
            head_str = now_field.slice(0, -4)
            start_str = now_field.slice(0, -4) + '_start'
            end_str = now_field.slice(0, -4) + '_end'
        }

        let start = getFieldValue(start_str)
        let end = getFieldValue(end_str)

        start = Number(start)
        end = Number(end)

        if (start && end && start.length > end.length) {
            callback(formatMessage({id: "LANG2145"}))
        } else {
            callback()
        }
    }
    _checkIfInPort = (rule, value, callback) => {
        const { getFieldValue } = this.props.form
        const { formatMessage } = this.props.intl
        const me = this
        const disable_extension_ranges = getFieldValue('disable_extension_ranges')
        if (disable_extension_ranges || !value) {
            callback()
            return
        }

        let start_str = ''
        let end_str = ''
        let head_str = ''
        const now_field = rule.field /* ue_start zue_start */
        if (now_field.slice(-6) === '_start') {
            head_str = now_field.slice(0, -6)
            start_str = now_field.slice(0, -6) + '_start'
            end_str = now_field.slice(0, -6) + '_end'
        } else if (now_field.slice(-4) === '_end') {
            head_str = now_field.slice(0, -4)
            start_str = now_field.slice(0, -4) + '_start'
            end_str = now_field.slice(0, -4) + '_end'
        }

        let start = getFieldValue(start_str)
        let end = getFieldValue(end_str)

        start = Number(start)
        end = Number(end)

        const portExtensionList = this.state.portExtensionList
        var length = portExtensionList.length

        let returnValue = true
        for (var i = 0; i < length; i++) {
            if (this._isValueInBetween(portExtensionList[i], start, end)) {
                returnValue = false
            }
        }
        if (returnValue) {
            callback()
        } else {
            callback(formatMessage({id: "LANG3971"}, {0: formatMessage({id: 'LANG1244'}), 1: formatMessage({id: "LANG1242"})}))
        }
    }
    _getInitData = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getGeneralPrefSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const response = res.response.general_pref_settings || {}

                this.setState({
                    generalPrefSettings: response,
                    isDisplayLimitime: response.limitime === null ? 'hidden' : 'display-block'
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

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
                    extensionPrefSettings: response,
                    disableRange: response.disable_extension_ranges === 'yes'
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getPortExtension = () => {
        let portExtensionList = []

        $.ajax({
            type: "post",
            url: api.apiHost,
            data: {
                action: "getFeatureCodes"
            },
            async: false,
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                var bool = UCMGUI.errorHandler(data)

                if (bool) {
                    var featureSettings = data.response.feature_settings,
                        parkext = featureSettings.parkext,
                        parkpos = featureSettings.parkpos.split('-')

                    portExtensionList.push(parseInt(parkext, 10))

                    for (var i = parseInt(parkpos[0], 10); i <= parseInt(parkpos[1], 10); i++) {
                        portExtensionList.push(i)
                    }
                }
            }
        })
        this.setState({
            portExtensionList: portExtensionList
        })
    }
    _handleLimitimeChange = (e) => {
        this.setState({
            isDisplayLimitime: e.target.checked ? 'display-block' : 'hidden'
        })
    }
    _handleDisableChange = (e) => {
        const {formatMessage} = this.props.intl,
            self = this

        this.setState({
            disableRange: e.target.checked
        })

        if (e.target.checked) {
            Modal.confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG864" })}}></span>,
                okText: formatMessage({id: "LANG727" }),
                cancelText: formatMessage({id: "LANG726" }),
                onOk() {
                    self.props.form.setFieldsValue({
                        disable_extension_ranges: true
                    })
                    self.setState({
                        disableRange: true
                    })
                },
                onCancel() {
                    self.props.form.setFieldsValue({
                        disable_extension_ranges: false
                    })
                    self.setState({
                        disableRange: false
                    })
                }
            })
        }
    }
    _handleCancel = () => {
        this.props.form.resetFields()
        this._getInitData()
        browserHistory.push('/pbx-settings/pbxGeneralSettings')
    }
    _handleSubmit = () => {
        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const extensionId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let actionGeneralPre = {},
                    actionExtensionPre = {}

                actionGeneralPre.action = 'updateGeneralPrefSettings'
                actionGeneralPre.global_outboundcid = values.global_outboundcid
                actionGeneralPre.global_outboundcidname = values.global_outboundcidname
                actionGeneralPre.ringtime = values.ringtime
                actionGeneralPre.record_prompt = values.record_prompt ? 'yes' : 'no'
                if (values.enable_out_limitime) {
                    actionGeneralPre.repeattime = Number(values.repeattime) * 1000
                    actionGeneralPre.warningtime = Number(values.warningtime) * 1000
                    actionGeneralPre.limitime = Number(values.limitime) * 1000
                } else {
                    actionGeneralPre.repeattime = ""
                    actionGeneralPre.warningtime = "'"
                    actionGeneralPre.limitime = ""
                }

                actionExtensionPre.action = 'updateExtenPrefSettings'
                actionExtensionPre.weak_password = values.weak_password ? 'yes' : 'no'
                actionExtensionPre.rand_password = values.rand_password ? 'yes' : 'no'
                actionExtensionPre.auto_email_to_user = values.auto_email_to_user ? 'yes' : 'no'
                actionExtensionPre.disable_extension_ranges = values.disable_extension_ranges ? 'yes' : 'no'
                actionExtensionPre.ue_start = values.ue_start
                actionExtensionPre.ue_end = values.ue_end
                actionExtensionPre.pkue_start = values.pkue_start
                actionExtensionPre.pkue_end = values.pkue_end
                actionExtensionPre.zcue_start = values.zcue_start
                actionExtensionPre.zcue_end = values.zcue_end
                actionExtensionPre.mm_start = values.mm_start
                actionExtensionPre.mm_end = values.mm_end
                actionExtensionPre.rge_start = values.rge_start
                actionExtensionPre.rge_end = values.rge_end
                actionExtensionPre.qe_start = values.qe_start
                actionExtensionPre.qe_end = values.qe_end
                actionExtensionPre.vmg_start = values.vmg_start
                actionExtensionPre.vmg_end = values.vmg_end
                actionExtensionPre.vme_start = values.vme_start
                actionExtensionPre.vme_end = values.vme_end
                actionExtensionPre.directory_start = values.directory_start
                actionExtensionPre.directory_end = values.directory_end
                actionExtensionPre.fax_start = values.fax_start
                actionExtensionPre.fax_end = values.fax_end

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: actionGeneralPre,
                    type: 'json',
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            $.ajax({
                                url: api.apiHost,
                                method: "post",
                                data: actionExtensionPre,
                                type: 'json',
                                error: function(e) {
                                    message.error(e.statusText)
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                    if (bool) {
                                        message.destroy()
                                        message.success(successMessage)
                                    }
                                    localStorage.setItem('weak_password', actionExtensionPre.weak_password)
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }
    _resetRangesDefault = () => {
        this.props.form.setFieldsValue({
            ue_start: 1000,
            ue_end: 6299,
            pkue_start: 4000,
            pkue_end: 4999,
            zcue_start: 5000,
            zcue_end: 6299,
            mm_start: 6300,
            mm_end: 6399,
            vme_start: 7000,
            vme_end: 7100,
            rge_start: 6400,
            rge_end: 6499,
            qe_start: 6500,
            qe_end: 6599,
            vmg_start: 6600,
            vmg_end: 6699,
            directory_start: 7101,
            directory_end: 7199,
            fax_start: 7200,
            fax_end: 8200
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemLayoutExten = {
            labelCol: { span: 4 },
            wrapperCol: { span: 10 }
        }

        let generalPrefSettings = this.state.generalPrefSettings
        let extensionPrefSettings = this.state.extensionPrefSettings
        let limitime = ''
        let warningtime = ''
        let repeattime = ''

        if (generalPrefSettings.limitime !== null) {
            limitime = (generalPrefSettings.limitime ? Number(generalPrefSettings.limitime) / 1000 : '')
            warningtime = (generalPrefSettings.warningtime ? Number(generalPrefSettings.warningtime) / 1000 : '')
            repeattime = (generalPrefSettings.repeattime ? Number(generalPrefSettings.repeattime) / 1000 : '')
        }

        const title = formatMessage({id: "LANG3"})

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
                    isDisplay='display-block'/>
                <div className="content">
                    <Form>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG667"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1592" /> }>
                                        <span>{ formatMessage({id: "LANG1589"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('global_outboundcid', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.calleridSip(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: generalPrefSettings.global_outboundcid
                                })(
                                    <Input maxLength={32}/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1591" /> }>
                                        <span>{ formatMessage({id: "LANG1590"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('global_outboundcidname', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.specialCidName(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 2)
                                        }
                                    }],
                                    initialValue: generalPrefSettings.global_outboundcidname
                                })(
                                    <Input maxLength={32}/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1599" /> }>
                                        <span>{ formatMessage({id: "LANG1598"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('ringtime', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: 'LANG2150'})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.range(data, value, callback, formatMessage, 3, 600)
                                        }
                                    }],
                                    initialValue: generalPrefSettings.ringtime
                                })(
                                    <Input maxLength={3}/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3026" /> }>
                                        <span>{ formatMessage({id: "LANG3025"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('enable_out_limitime', {
                                    valuePropName: 'checked',
                                    initialValue: generalPrefSettings.limitime !== null
                                })(
                                    <Checkbox onChange={ this._handleLimitimeChange } />
                                ) }
                            </FormItem>
                            <FormItem className={ this.state.isDisplayLimitime }
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3018" /> }>
                                        <span>{ formatMessage({id: "LANG3017"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('limitime', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.isDisplayLimitime === 'display-block',
                                        message: formatMessage({id: 'LANG2150'})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.isDisplayLimitime === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: this.state.isDisplayLimitime === 'display-block' ? this._checkTimeLarger : ''
                                    }],
                                    initialValue: limitime + ''
                                })(
                                    <Input maxLength={14}/>
                                ) }
                            </FormItem>
                            <FormItem className={ this.state.isDisplayLimitime }
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3020" /> }>
                                        <span>{ formatMessage({id: "LANG3019"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('warningtime', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.isDisplayLimitime === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.isDisplayLimitime === 'display-block' ? Validator.minlength(data, value, callback, formatMessage, 1) : callback()
                                        }
                                    }],
                                    initialValue: warningtime + ''
                                })(
                                    <Input maxLength={14}/>
                                ) }
                            </FormItem>
                            <FormItem className={ this.state.isDisplayLimitime }
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3022" /> }>
                                        <span>{ formatMessage({id: "LANG3021"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('repeattime', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.isDisplayLimitime === 'display-block' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.isDisplayLimitime === 'display-block' ? Validator.minlength(data, value, callback, formatMessage, 1) : callback()
                                        }
                                    }],
                                    initialValue: repeattime + ''
                                })(
                                    <Input maxLength={14}/>
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2529" /> }>
                                        <span>{ formatMessage({id: "LANG2528"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('record_prompt', {
                                    valuePropName: 'checked',
                                    initialValue: generalPrefSettings.record_prompt === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Row>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG668"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2634" /> }>
                                        <span>{ formatMessage({id: "LANG2633"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('weak_password', {
                                    valuePropName: 'checked',
                                    initialValue: extensionPrefSettings.weak_password === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1588" /> }>
                                        <span>{ formatMessage({id: "LANG1587"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('rand_password', {
                                    valuePropName: 'checked',
                                    initialValue: extensionPrefSettings.rand_password === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4151" /> }>
                                        <span>{ formatMessage({id: "LANG4150"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('auto_email_to_user', {
                                    valuePropName: 'checked',
                                    initialValue: extensionPrefSettings.auto_email_to_user === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1586" /> }>
                                        <span>{ formatMessage({id: "LANG1586"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('disable_extension_ranges', {
                                    valuePropName: 'checked',
                                    initialValue: this.state.disableRange
                                })(
                                    <Checkbox onChange={ this._handleDisableChange } />
                                ) }
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG248" /> }>
                                        <span>{ formatMessage({id: "LANG248"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('ue_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }],
                                            initialValue: extensionPrefSettings.ue_start
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('ue_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._compareLength
                                            }],
                                            initialValue: extensionPrefSettings.ue_end
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2919" /> }>
                                        <span>{ formatMessage({id: "LANG2919"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('pkue_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeUeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._isRangeUe
                                            }],
                                            initialValue: extensionPrefSettings.pkue_start
                                        })(
                                            <Input maxLength={6} />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('pkue_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeUeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._isRangeUe
                                            }],
                                            initialValue: extensionPrefSettings.pkue_end
                                        })(
                                            <Input maxLength={6}/>
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2918" /> }>
                                        <span>{ formatMessage({id: "LANG2918"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('zcue_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeUeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._isRangeUe
                                            }],
                                            initialValue: extensionPrefSettings.zcue_start
                                        })(
                                            <Input maxLength={6}/>
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('zcue_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeUeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._isRangeUe
                                            }],
                                            initialValue: extensionPrefSettings.zcue_end
                                        })(
                                            <Input maxLength={6}/>
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1585" /> }>
                                        <span>{ formatMessage({id: "LANG1585"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('mm_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }],
                                            initialValue: extensionPrefSettings.mm_start
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('mm_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._compareLength
                                            }],
                                            initialValue: extensionPrefSettings.mm_end
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1597" /> }>
                                        <span>{ formatMessage({id: "LANG1597"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('rge_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }],
                                            initialValue: extensionPrefSettings.rge_start
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('rge_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._compareLength
                                            }],
                                            initialValue: extensionPrefSettings.rge_end
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1596" /> }>
                                        <span>{ formatMessage({id: "LANG1596"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('qe_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }],
                                            initialValue: extensionPrefSettings.qe_start
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('qe_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._compareLength
                                            }],
                                            initialValue: extensionPrefSettings.qe_end
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1569" /> }>
                                        <span>{ formatMessage({id: "LANG1569"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('vmg_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }],
                                            initialValue: extensionPrefSettings.vmg_start
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('vmg_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._compareLength
                                            }],
                                            initialValue: extensionPrefSettings.vmg_end
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1593" /> }>
                                        <span>{ formatMessage({id: "LANG1593"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('vme_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }],
                                            initialValue: extensionPrefSettings.vme_start
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('vme_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._compareLength
                                            }],
                                            initialValue: extensionPrefSettings.vme_end
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2897" /> }>
                                        <span>{ formatMessage({id: "LANG2897"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('directory_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }],
                                            initialValue: extensionPrefSettings.directory_start
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('directory_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._compareLength
                                            }],
                                            initialValue: extensionPrefSettings.directory_end
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                            <FormItem
                                { ...formItemLayoutExten }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2907" /> }>
                                        <span>{ formatMessage({id: "LANG2907"}) }</span>
                                    </Tooltip>
                                )}>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('fax_start', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsSmaller
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }],
                                            initialValue: extensionPrefSettings.fax_start
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 1 }>
                                    <p className="ant-form-split">-</p>
                                </Col>
                                <Col span={ 3 }>
                                    <FormItem>
                                        { getFieldDecorator('fax_end', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: true,
                                                message: formatMessage({id: 'LANG2150'})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.digits(data, value, callback, formatMessage)
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    Validator.minlength(data, value, callback, formatMessage, 2)
                                                }
                                            }, {
                                                validator: this._checkIsBigger
                                            }, {
                                                validator: this._isRangeConflict
                                            }, {
                                                validator: this._checkIfInPort
                                            }, {
                                                validator: this._compareLength
                                            }],
                                            initialValue: extensionPrefSettings.fax_end
                                        })(
                                            <Input maxLength={6} disabled={ this.state.disableRange } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </FormItem>
                        </Row>
                        <div>
                            <Button type="primary" size="default" onClick={ this._resetRangesDefault }>
                                { formatMessage({id: "LANG773"}) }
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(PbxGeneralSettings))

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
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class BasicSettings extends Component {
    constructor(props) {
        super(props)

        let hasvoicemail = this.props.settings.hasvoicemail
                        ? (this.props.settings.hasvoicemail === 'yes' ? true : false)
                        : true

        this.state = {
            secret: '',
            vmsecret: '',
            newExtension: '',
            user_password: '',
            languages: [],
            batch_number: '5',
            batch_interval: '1',
            add_method: 'single',
            hasvoicemail: hasvoicemail,
            enable_qualify: this.props.settings.enable_qualify === 'yes' ? true : false
        }
    }
    componentDidMount() {
        const currentEditId = this.props.currentEditId
        const extensionRange = this.props.extensionRange
        const existNumberList = this.props.existNumberList

        if (!currentEditId && extensionRange && extensionRange.length && existNumberList && existNumberList.length) {
            let newExtension = this._generateNewExtension(extensionRange, existNumberList)
            let secret = this._generatePassword(extensionRange, existNumberList) || newExtension
            let user_password = this._generatePassword(extensionRange, existNumberList) || newExtension
            let vmsecret = this._generatePassword(extensionRange, existNumberList, 'number') || newExtension

            this.setState({
                secret: secret,
                vmsecret: vmsecret,
                newExtension: newExtension,
                user_password: user_password
            })
        }
    }
    componentWillMount() {
    }
    _checkDahdi = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let existed = true
        let value = parseInt(val)
        let existFXSList = this.props.existFXSList
        let currentEditId = this.props.currentEditId

        if (currentEditId) {
            if (value === this.props.settings.dahdi) {
                existed = true
            } else {
                if (_.indexOf(existFXSList, value) > -1) {
                    existed = false
                } else {
                    existed = true
                }
            }
        } else {
            if (_.indexOf(existFXSList, value) > -1) {
                existed = false
            } else {
                existed = true
            }
        }

        if (existed === false) {
            callback(formatMessage({id: "LANG2130"}))
        } else {
            callback()
        }
    }
    _checkExtensionConflict = (data, val, callback, formatMessage) => {
        let existed = true
        let existNumberList = this.props.existNumberList
        let currentEditId = this.props.currentEditId

        if (currentEditId) {
            if (val === currentEditId) {
                existed = true
            } else {
                if (_.indexOf(existNumberList, val) > -1) {
                    existed = false
                } else {
                    existed = true
                }
            }
        } else {
            if (_.indexOf(existNumberList, val) > -1) {
                existed = false
            } else {
                existed = true
            }
        }

        if (existed === false) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _checkExtensionRange = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let error = false
        let form = this.props.form
        let extensionRange = this.props.extensionRange
        let existExtentionList = this.props.destinationDataSource.account

        if (extensionRange[2] === 'no') {
            let startFrom = Number(form.getFieldValue('extension')),
                largeOrEqualThanStartNumber = 0,
                maxExtensionNumber = extensionRange[1],
                length = existExtentionList.length,
                i = 0

            for (i; i < length; i++) {
                if (existExtentionList[i].key >= startFrom) {
                    largeOrEqualThanStartNumber++
                }
            }

            if ((Number(val) + largeOrEqualThanStartNumber) > (maxExtensionNumber - startFrom + 1)) {
                error = true
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG3508"}, {0: formatMessage({id: "LANG1155"}), 1: formatMessage({id: "LANG1157"})}))
        } else {
            callback()
        }
    }
    _checkIfInPort = (data, val, callback, formatMessage, msg) => {
        let existed = true
        let portExtensionList = this.props.portExtensionList

        if (_.indexOf(portExtensionList, val) > -1) {
            existed = false
        } else {
            existed = true
        }

        if (existed === false) {
            callback(formatMessage({id: "LANG2172"}, {0: msg}))
        } else {
            callback()
        }
    }
    _checkMaxExtension = (data, val, callback) => {
        const { formatMessage } = this.props.intl
        const FeatureLimits = JSON.parse(localStorage.getItem('featureLimits'))

        let maxExtension = FeatureLimits.extension
        let existExtentionList = this.props.destinationDataSource.account

        if (maxExtension < existExtentionList.length + Number(val)) {
            callback(formatMessage({id: "LANG811"}, {0: maxExtension, 1: existExtentionList.length}))
        } else {
            callback()
        }
    }
    _generateNewExtension = (extensionRange, existNumberList) => {
        let startExt = extensionRange[0]
        let endExt = extensionRange[1]
        let i = startExt

        for (i; i <= endExt; i++) {
            if (i < 10) {
                i = "0" + i
            }

            if (!_.contains(existNumberList, i.toString())) {
                return i.toString()
            }
        }
    }
    _generatePassword(extensionRange, existNumberList, type, length) {
        if (extensionRange[3].toLowerCase() === "yes") { // Strong Password
            let pw = ''
            let chars = ''
            let strLength = (length ? length : Math.floor((Math.random() * 3) + 6))

            switch (type) {
                case 'number':
                    chars += '3745890162'
                    break
                case 'char':
                    chars += 'ZmnopqrMDEFGabcdefgABCXYRSstuvwxyzhijklHIJKLTUVWNOPQ'
                    break
                case 'special':
                    chars += '~!@#$%^*'
                    break
                default:
                    chars += '^*VW01234XYZabcdefghijklmnoABCNOHIJKLMp$%PQRSTz56qrstuvwxy9~!@#78UDEFG'
                    break
            }

            chars = chars.split('')

            for (let i = 0; i < strLength; i++) {
                pw += chars[Math.floor(Math.random() * chars.length)]
            }

            // Pengcheng Zou Added. Check if has number.
            if (!/\d/g.test(pw)) {
                pw = pw.substr(1) // length - 1
                pw += this._generatePassword(extensionRange, existNumberList, 'number', 1)
            }

            return pw
        } else {
            return ''
        }
    }
    _onChangeExtensionType = (value) => {
        if (value === 'fxs') {
            this.setState({
                add_method: 'single'
            })
        }

        this.props.onAddMethodChange('single')
        this.props.onExtensionTypeChange(value)
    }
    _onChangeAddMethod = (value) => {
        const form = this.props.form

        this.setState({ add_method: value }, () => {
                form.validateFieldsAndScroll(['extension'], { force: true })
            })

        this.props.onAddMethodChange(value)
    }
    _onChangeHasVoicemail = (e) => {
        this.setState({
            hasvoicemail: e.target.checked
        })
    }
    _onChangeQualify = (e) => {
        this.setState({
            enable_qualify: e.target.checked
        })
    }
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form

        let settings = this.props.settings || {}
        let existFXSList = this.props.existFXSList
        let currentEditId = this.props.currentEditId
        let extension_type = this.props.extensionType
        let extensionRange = this.props.extensionRange
        let existNumberList = this.props.existNumberList
        let userSettings = this.props.userSettings || {}
        let ModelInfo = JSON.parse(localStorage.getItem('model_info'))

        let formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        let formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        return (
            <div className="content">
                <div className="ant-form">
                    <Row
                        className={ !currentEditId ? 'display-block row-header' : 'hidden' }
                    >
                        <Col span={ 24 }>
                            <FormItem
                                { ...formItemLayoutRow }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5417" /> }>
                                            <span>{ formatMessage({id: "LANG5417"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('extension_type', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: extension_type,
                                    className: (!currentEditId ? 'display-block' : 'hidden')
                                })(
                                    <Select onChange={ this._onChangeExtensionType }>
                                        <Option value='sip'>{ formatMessage({id: "LANG2927"}) }</Option>
                                        <Option value='iax'>{ formatMessage({id: "LANG2929"}) }</Option>
                                        <Option value='fxs'>{ formatMessage({id: "LANG2928"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 24 }>
                            <FormItem
                                { ...formItemLayoutRow }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5418" /> }>
                                            <span>{ formatMessage({id: "LANG5418"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                <Select
                                    value={ this.state.add_method }
                                    onChange={ this._onChangeAddMethod }
                                >
                                    <Option value='single'>{ formatMessage({id: "LANG5420"}) }</Option>
                                    <Option
                                        value='batch'
                                        disabled={ extension_type === 'fxs' }
                                    >
                                        { formatMessage({id: "LANG5419"}) }
                                    </Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                className={ (!currentEditId && this.state.add_method === 'batch')
                                                    ? 'display-block'
                                                    : 'hidden'
                                                }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1158" /> }>
                                            <span>{ formatMessage({id: "LANG1157"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('batch_number', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: (!currentEditId && this.state.add_method === 'batch'),
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            (!currentEditId && this.state.add_method === 'batch') ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            if (!currentEditId && this.state.add_method === 'batch') {
                                                if (ModelInfo.num_pri > 0) {
                                                    Validator.range(data, value, callback, formatMessage, 1, 500)
                                                } else {
                                                    Validator.range(data, value, callback, formatMessage, 1, 100)
                                                }
                                            } else {
                                                callback()
                                            }
                                        }
                                    }, {
                                        validator: (!currentEditId && this.state.add_method === 'batch') ? this._checkMaxExtension : ''
                                    }, {
                                        validator: (!currentEditId && this.state.add_method === 'batch') ? this._checkExtensionRange : ''
                                    }],
                                    initialValue: this.state.batch_number,
                                    className: (!currentEditId && this.state.add_method === 'batch')
                                                    ? 'display-block'
                                                    : 'hidden'
                                })(
                                    <Input min={ 1 } max={ 100 } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                className={ (!currentEditId && this.state.add_method === 'batch')
                                                    ? 'display-block'
                                                    : 'hidden'
                                                }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5105" /> }>
                                            <span>{ formatMessage({id: "LANG5104"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('batch_interval', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: (!currentEditId && this.state.add_method === 'batch'),
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            (!currentEditId && this.state.add_method === 'batch') ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            (!currentEditId && this.state.add_method === 'batch') ? Validator.min(data, value, callback, formatMessage, 1) : callback()
                                        }
                                    }],
                                    initialValue: this.state.batch_interval,
                                    className: (!currentEditId && this.state.add_method === 'batch')
                                                    ? 'display-block'
                                                    : 'hidden'
                                })(
                                    <Input min={ 1 } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG625"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1064" /> }>
                                            <span>{ formatMessage({id: "LANG85"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('extension', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.minlength(data, value, callback, formatMessage, 2)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 18)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method !== 'batch' ? this._checkExtensionConflict(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this._checkIfInPort(data, value, callback, formatMessage, formatMessage({id: "LANG1244"}) + ", " + formatMessage({id: "LANG1242"}))
                                        }
                                    }],
                                    initialValue: settings.extension ? settings.extension : this.state.newExtension
                                })(
                                    <Input disabled={ !!currentEditId } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type === 'fxs' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1092" /> }>
                                            <span>{ formatMessage({id: "LANG1091"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('dahdi', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            extension_type === 'fxs' ? this._checkDahdi(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: (settings.dahdi ? (settings.dahdi + '') : (existFXSList && existFXSList.length === 1 && existFXSList[0] === 1 ? '2' : '1')),
                                    className: extension_type === 'fxs' ? 'display-block' : 'hidden'
                                })(
                                    <Select>
                                        <Option value='1'>{ 'FXS 1' }</Option>
                                        <Option value='2'>{ 'FXS 2' }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1068" /> }>
                                            <span>{ formatMessage({id: "LANG1067"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('cidnumber', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.minlength(data, value, callback, formatMessage, 2) : Validator.minlength(data, value, callback, formatMessage, 1)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 32)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.realAlphanumeric(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: settings.cidnumber
                                })(
                                    this.state.add_method === 'single' ? <Input /> : <Input placeholder={ formatMessage({id: "LANG5622"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1070" /> }>
                                            <span>{ formatMessage({id: "LANG1069"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('permission', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: settings.permission ? settings.permission : 'internal'
                                })(
                                    <Select>
                                        <Option value='internal'>{ formatMessage({id: 'LANG1071'}) }</Option>
                                        <Option value='internal-local'>{ formatMessage({id: 'LANG1072'}) }</Option>
                                        <Option value='internal-local-national'>{ formatMessage({id: 'LANG1073'}) }</Option>
                                        <Option value='internal-local-national-international'>{ formatMessage({id: 'LANG1074'}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type === 'fxs' ? 'hidden' : 'display-block' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1076" /> }>
                                            <span>{ formatMessage({id: "LANG1075"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('secret', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: (extension_type !== 'fxs'),
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            extension_type !== 'fxs'
                                                ? this.state.add_method === 'single'
                                                    ? Validator.minlength(data, value, callback, formatMessage, 4)
                                                    : Validator.minlength(data, value, callback, formatMessage, 1)
                                                : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            extension_type !== 'fxs' ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            if (extension_type !== 'fxs') {
                                                let enablehotdesk = form.getFieldValue('enablehotdesk') === undefined
                                                                        ? settings.enablehotdesk === 'yes'
                                                                        : form.getFieldValue('enablehotdesk')

                                                if (enablehotdesk) {
                                                    Validator.realAlphanumeric(data, value, callback, formatMessage)
                                                } else {
                                                    Validator.keyboradNoSpacesemicolon(data, value, callback, formatMessage)
                                                }
                                            } else {
                                                callback()
                                            }
                                            form.getFieldValue('enablehotdesk') === undefined ? settings.enablehotdesk === 'yes' : form.getFieldValue('enablehotdesk')
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            (extension_type === 'fxs' || (this.state.add_method === 'batch' && value === 'r')) ? callback() : Validator.checkAlphanumericPw(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: settings.secret ? settings.secret : this.state.secret,
                                    className: extension_type === 'fxs' ? 'hidden' : 'display-block'
                                })(
                                    this.state.add_method === 'single' ? <Input /> : <Input placeholder={ formatMessage({id: "LANG5623"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this.state.add_method === 'single' && extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2488" /> }>
                                            <span>{ formatMessage({id: "LANG2487"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('authid', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' && extension_type === 'sip' ? Validator.specialauthid1(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' && extension_type === 'sip' ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                        }
                                    }],
                                    initialValue: (currentEditId && settings.enablehotdesk === 'yes') ? settings.extension : settings.authid,
                                    className: this.state.add_method === 'single' && extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Input disabled={ form.getFieldValue('enablehotdesk') === undefined ? settings.enablehotdesk === 'yes' : form.getFieldValue('enablehotdesk') } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1078" /> }>
                                            <span>{ formatMessage({id: "LANG1077"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('hasvoicemail', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.hasvoicemail
                                })(
                                    <Checkbox onChange={ this._onChangeHasVoicemail } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1080" /> }>
                                            <span>{ formatMessage({id: "LANG1079"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('vmsecret', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.minlength(data, value, callback, formatMessage, 4) : Validator.minlength(data, value, callback, formatMessage, 1)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 32)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'batch' && value === 'r' ? callback() : Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'batch' && value === 'r' ? callback() : Validator.checkNumericPw(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: settings.vmsecret ? settings.vmsecret : this.state.vmsecret
                                })(
                                    this.state.add_method === 'single' ? <Input disabled={ !this.state.hasvoicemail } /> : <Input disabled={ !this.state.hasvoicemail } placeholder={ formatMessage({id: "LANG5623"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2686" /> }>
                                            <span>{ formatMessage({id: "LANG2685"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('skip_vmsecret', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.skip_vmsecret === 'yes'
                                })(
                                    <Checkbox disabled={ !this.state.hasvoicemail } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1106" /> }>
                                            <span>{ formatMessage({id: "LANG1105"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('enable_qualify', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: this.state.enable_qualify,
                                    className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Checkbox onChange={ this._onChangeQualify } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1108" /> }>
                                            <span>{ formatMessage({id: "LANG1107"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('qualifyfreq', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: extension_type === 'sip',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            extension_type === 'sip' ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            extension_type === 'sip' ? Validator.range(data, value, callback, formatMessage, 1, 3600) : callback()
                                        }
                                    }],
                                    initialValue: settings.qualifyfreq ? settings.qualifyfreq + '' : '60',
                                    className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Input disabled={ !this.state.enable_qualify } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2756" /> }>
                                            <span>{ formatMessage({id: "LANG2755"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('out_of_service', {
                                    rules: [],
                                    valuePropName: 'checked',
                                    initialValue: settings.out_of_service === 'yes'
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row
                        className={ this.state.add_method === 'single' ? 'display-block' : 'hidden' }
                    >
                        <Col span={ 24 }>
                            <div className="section-title">
                                <span>{ formatMessage({id: "LANG2712"}) }</span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="row-section-content">
                        <Col span={ 12 } className={ this.state.add_method === 'single' ? 'display-block' : 'hidden' }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2848" /> }>
                                            <span>{ formatMessage({id: "LANG2817"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('first_name', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.minlength(data, value, callback, formatMessage, 1) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.specialCidName(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: userSettings.first_name
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 } className={ this.state.add_method === 'single' ? 'display-block' : 'hidden' }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2849" /> }>
                                            <span>{ formatMessage({id: "LANG2813"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('last_name', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.minlength(data, value, callback, formatMessage, 1) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.specialCidName(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: userSettings.last_name
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 } className={ this.state.add_method === 'single' ? 'display-block' : 'hidden' }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1082" /> }>
                                            <span>{ formatMessage({id: "LANG1081"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('email', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.email(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: userSettings.email
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 } className={ this.state.add_method === 'single' ? 'display-block' : 'hidden' }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2845" /> }>
                                            <span>{ formatMessage({id: "LANG2810"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('user_password', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.minlength(data, value, callback, formatMessage, 4) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.keyboradNoSpacesemicolon(data, value, callback, formatMessage) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.checkAlphanumericPw(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: userSettings.user_password ? userSettings.user_password : this.state.user_password
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
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2545" /> }>
                                            <span>{ formatMessage({id: "LANG31"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('language', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.add_method === 'single',
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: userSettings.language ? userSettings.language : 'default'
                                })(
                                    <Select>
                                        <Option value='default'>{ formatMessage({id: "LANG257"}) }</Option>
                                        {
                                            this.props.languages.map(function(item) {
                                                return <Option
                                                            key={ item.language_id }
                                                            value={ item.language_id }
                                                        >
                                                            { item.language_name }
                                                        </Option>
                                            })
                                        }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 12 }
                            className={ this.state.add_method === 'single' && extension_type === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG4223" /> }>
                                            <span>{ formatMessage({id: "LANG4222"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('max_contacts', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: extension_type === 'sip',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' && extension_type === 'sip' ? Validator.min(data, value, callback, formatMessage, 1) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' && extension_type === 'sip' ? Validator.digits(data, value, callback, formatMessage, 32) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' && extension_type === 'sip' ? Validator.range(data, value, callback, formatMessage, 1, 10) : callback()
                                        }
                                    }],
                                    initialValue: settings.max_contacts ? settings.max_contacts + '' : '1',
                                    className: extension_type === 'sip' ? 'display-block' : 'hidden'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 } className={ this.state.add_method === 'single' ? 'display-block' : 'hidden' }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2851" /> }>
                                            <span>{ formatMessage({id: "LANG2815"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('phone_number', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.minlength(data, value, callback, formatMessage, 2) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.maxlength(data, value, callback, formatMessage, 18) : callback()
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this.state.add_method === 'single' ? Validator.digitsWithHyphen(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: userSettings.phone_number
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(BasicSettings)
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
import { Checkbox, Col, Form, Input, Icon, message, Row, Select, Transfer, Tooltip } from 'antd'

const MAXLOCALNETWORK = 10
const FormItem = Form.Item
const Option = Select.Option

class BatchEditExtension extends Component {
    constructor(props) {
        super(props)

        this.state = {
            languages: [],
            accountList: [],
            out_limitime: false,
            strategy_ipacl: '0',
            targetKeysSeamless: [],
            bypass_outrt_auth: 'no',
            targetKeysCallbarging: [],
            extensionType: this.props.params.type,
            selectedExtensions: this.props.params.id,
            mohNameList: ['default', 'ringbacktone_default'],
            targetKeysAllow: ['ulaw', 'alaw', 'gsm', 'g726', 'g722', 'g729', 'h264', 'ilbc'],
            availableCodecs: [
                {
                    key: 'g726aal2', label: 'AAL2-G.726-32', title: 'AAL2-G.726-32'
                }, {
                    key: 'adpcm', label: 'ADPCM', title: 'ADPCM'
                }, {
                    key: 'g723', label: 'G.723', title: 'G.723'
                }, {
                    key: 'h263', label: 'H.263', title: 'H.263'
                }, {
                    key: 'h263p', label: 'H.263p', title: 'H.263p'
                }, {
                    key: 'vp8', label: 'VP8', title: 'VP8'
                }, {
                    key: 'opus', label: 'OPUS', title: 'OPUS'
                }, {
                    key: 'ulaw', label: 'PCMU', title: 'PCMU'
                }, {
                    key: 'alaw', label: 'PCMA', title: 'PCMA'
                }, {
                    key: 'gsm', label: 'GSM', title: 'GSM'
                }, {
                    key: 'g726', label: 'G.726', title: 'G.726'
                }, {
                    key: 'g722', label: 'G.722', title: 'G.722'
                }, {
                    key: 'g729', label: 'G.729', title: 'G.729'
                }, {
                    key: 'h264', label: 'H.264', title: 'H.264'
                }, {
                    key: 'ilbc', label: 'iLBC', title: 'iLBC'
                }
            ]
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    componentWillUnmount() {
    }
    _addLocalNetwork = () => {
        const { form } = this.props
        const { formatMessage } = this.props.intl

        // can use data-binding to get
        const localNetworks = form.getFieldValue('localNetworks')

        if (localNetworks.length <= 8) {
            const newLocalNetworks = localNetworks.concat(this._generateLocalNetworkID(localNetworks))

            // can use data-binding to set
            // important! notify form to detect changes
            form.setFieldsValue({
                localNetworks: newLocalNetworks
            })
        } else {
            message.warning(formatMessage({id: "LANG948"}))

            return false
        }
    }
    _checkNetwork = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let regSubnet = /^((1\d\d|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){3}0$/
        let regIpv6 = /^((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))(\/\d+)$/ // test ipv6
        
        if (!val || (val && (regSubnet.test(val) || regIpv6.test(val)))) {
            callback()
        } else {
            callback(formatMessage({id: "LANG2131"}))
        }
    }
    _checkNetworkNumber = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let error = false
        let regIpv6 = /^\[?((([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})|(:((:[0-9a-fA-F]{1,4}){1,6}|:))|([0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,5}|:))|(([0-9a-fA-F]{1,4}:){2}((:[0-9a-fA-F]{1,4}){1,4}|:))|(([0-9a-fA-F]{1,4}:){3}((:[0-9a-fA-F]{1,4}){1,3}|:))|(([0-9a-fA-F]{1,4}:){4}((:[0-9a-fA-F]{1,4}){1,2}|:))|(([0-9a-fA-F]{1,4}:){5}:([0-9a-fA-F]{1,4})?)|(([0-9a-fA-F]{1,4}:){6}:))\]?(\/\d+)$/ // test ipv6

        if (val && regIpv6.test(val)) {
            let arr = val.split('/')
            let num = arr[1]

            if (num && parseInt(num) > 128) {
                error = true
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG5247"}))
        } else {
            callback()
        }
    }
    _checkTimeLarger = (data, val, callback) => {
        const { formatMessage } = this.props.intl

        let oGeneral

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getGeneralPrefSettings'
            },
            error: function(jqXHR, textStatus, errorThrown) {},
            success: function(data) {
                let bool = UCMGUI.errorHandler(data, null, formatMessage)

                if (bool) {
                    oGeneral = data.response.general_pref_settings
                }
            }
        })

        let maximumTime = parseInt(val, 10) * 1000,
            repeattime = parseInt(oGeneral.repeattime, 10),
            warningtime = parseInt(oGeneral.warningtime, 10),
            error = true

        if (!isNaN(warningtime)) {
            if (!isNaN(repeattime)) {
                if (maximumTime > warningtime && warningtime > repeattime) {
                    error = false
                }
            } else if (maximumTime > warningtime) {
                error = false
            }
        } else {
            if (isNaN(repeattime)) {
                error = false
            } else if (maximumTime > repeattime) {
                error = false
            }
        }

        if (error) {
            callback(formatMessage({id: "LANG4346"}))
        } else {
            callback()
        }
    }
    _filterCodecsSource = () => {
        if (this.state.extensionType === 'iax') {
            return _.filter(this.state.availableCodecs, function(item) {
                    return item.key !== 'opus'
                })
        } else {
            return this.state.availableCodecs
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.label.indexOf(inputValue) > -1)
    }
    _generateLocalNetworkID = (existIDs) => {
        let newID = 2
        const keyList = _.pluck(existIDs, 'key')

        if (keyList && keyList.length) {
            newID = _.find([2, 3, 4, 5, 6, 7, 8, 9, 10], function(key) {
                    return !_.contains(keyList, key)
                })
        }

        return {
                new: true,
                key: newID
            }
    }
    _getFieldsIDs = () => {
        let id = []
        let form = this.props.form
        let fieldsValue = form.getFieldsValue()

        _.map(fieldsValue, (value, key) => {
            id.push(key)
        })

        return id
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl
        const extensionId = this.props.params.id
        const extensionType = this.props.params.type
        const disabled = formatMessage({id: "LANG273"})
        const languages = UCMGUI.isExist.getList('getLanguage', formatMessage)
        const extensionRange = UCMGUI.isExist.getRange('extension', formatMessage)
        const existNumberList = UCMGUI.isExist.getList('getNumberList', formatMessage)
        const extensionTypeUpperCase = extensionType ? extensionType.toUpperCase() : ''

        this.setState({
            languages: languages,
            extensionRange: extensionRange,
            existNumberList: existNumberList
        })

        $.ajax({
            type: 'json',
            method: 'post',
            url: api.apiHost,
            data: {
                action: 'getMohNameList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    let mohNameList = response.moh_name || []

                    this.setState({
                        mohNameList: mohNameList ? mohNameList : ['default', 'ringbacktone_default']
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'json',
            method: 'post',
            url: api.apiHost,
            data: {
                action: 'getAccountList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    let extension = response.extension || []

                    extension = extension.map(function(item) {
                        return {
                                key: item.extension,
                                value: item.extension,
                                out_of_service: item.out_of_service,
                                // disabled: (item.out_of_service === 'yes'),
                                label: (item.extension +
                                        (item.fullname ? ' "' + item.fullname + '"' : '') +
                                        (item.out_of_service === 'yes' ? ' <' + disabled + '>' : ''))
                            }
                    })

                    this.setState({
                        accountList: extension
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleCancel = (e) => {
        browserHistory.push('/extension-trunk/extension')
    }
    _handleSubmit = (e) => {
        // e.preventDefault()
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const getFieldInstance = form.getFieldInstance

        form.validateFields({ force: true }, (err, values) => {
            if (!err) {
                let action = {},
                    type = this.state.extensionType

                action.extension = this.state.selectedExtensions
                action.action = `update${this.state.extensionType.toUpperCase()}Account`

                _.map(values, function(value, key) {
                    let fieldInstance = getFieldInstance(key)

                    if (key.indexOf('check_') === 0) {
                        return false
                    }

                    if (key === 'out_limitime' || key === 'maximumTime' || key === 'localNetworks' || key === 'faxmode') {
                        return false
                    }

                    if (values['check_' + key]) {
                        if (typeof value === 'boolean') {
                            action[key] = UCMGUI.transCheckboxVal(value)
                        } else {
                            action[key] = value ? value : ''
                        }
                    }
                })

                if (values.check_faxmode) {
                    if (values.faxmode === 'no') {
                        action.faxdetect = 'no'
                    } else {
                        action.faxdetect = 'yes'
                    }
                }

                if (values.check_strategy_ipacl) {
                    if (values.strategy_ipacl === '1') {
                        for (var i = 1; i <= MAXLOCALNETWORK; i++) {
                            if (!values.hasOwnProperty('local_network' + i)) {
                                action['local_network' + i] = ''
                            } else {
                                action['local_network' + i] = values['local_network' + i]
                            }
                        }
                    } else if (values.strategy_ipacl === '2') {
                        action.specific_ip = values.specific_ip
                    }
                }

                if (values.check_bypass_outrt_auth) {
                    if (values.bypass_outrt_auth === 'bytime') {
                        action.skip_auth_timetype = values.skip_auth_timetype
                    }
                }

                if (values.check_out_limitime) {
                    if (values.out_limitime) {
                        action.limitime = values.maximumTime ? (parseInt(values.maximumTime) * 1000) : ''
                    } else {
                        action.limitime = ''
                    }
                }

                if (values.check_enable_webrtc) {
                    if (values.enable_webrtc) {
                        action.enable_webrtc = 'yes'
                        action.media_encryption = 'auto_dtls'
                        action.account_type = 'SIP(WebRTC)'
                    } else {
                        action.enable_webrtc = 'no'
                        action.media_encryption = 'no'
                        action.account_type = 'SIP'
                    }
                }

                if (values.check_language) {
                    action.language = values.language === 'default' ? '' : values.language
                }

                message.loading(formatMessage({ id: "LANG826" }), 0)

                $.ajax({
                    data: action,
                    type: 'json',
                    method: "post",
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4104" })}}></span>, 2)

                            this._handleCancel()
                        }
                    }.bind(this)
                })
            }
        })
    }
    _handleAllowChange = (targetKeys, direction, moveKeys) => {
        const { form } = this.props

        this.setState({
            targetKeysAllow: targetKeys
        })

        form.setFieldsValue({
            allow: targetKeys.toString()
        })

        console.log('targetKeys: ', targetKeys)
        console.log('direction: ', direction)
        console.log('moveKeys: ', moveKeys)
    }
    _handleCallbargingChange = (targetKeys, direction, moveKeys) => {
        const { form } = this.props

        this.setState({
            targetKeysCallbarging: targetKeys
        })

        form.setFieldsValue({
            callbarging_monitor: targetKeys.toString()
        })

        console.log('targetKeys: ', targetKeys)
        console.log('direction: ', direction)
        console.log('moveKeys: ', moveKeys)
    }
    _handleSeamlessChange = (targetKeys, direction, moveKeys) => {
        const { form } = this.props

        this.setState({
            targetKeysSeamless: targetKeys
        })

        form.setFieldsValue({
            seamless_transfer_members: targetKeys.toString()
        })

        console.log('targetKeys: ', targetKeys)
        console.log('direction: ', direction)
        console.log('moveKeys: ', moveKeys)
    }
    _handleTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        // this.setState({ targetContactKeys: nextTargetKeys })
        console.log('sourceSelectedKeys: ', sourceSelectedKeys)
        console.log('targetSelectedKeys: ', targetSelectedKeys)
    }
    _onChangeCheckbox = (e) => {
        let obj = {}

        obj[e.target.id] = e.target.checked

        this.setState(obj)
    }
    _onChangeLimiTime = (e) => {
        this.setState({
            out_limitime: e.target.checked
        })
    }
    _onChangeStrategy = (value) => {
        this.setState({
            strategy_ipacl: value
        })
    }
    _onChangeTrunkAuth = (value) => {
        this.setState({
            bypass_outrt_auth: value
        })
    }
    _onExtensionTypeChange = (value) => {
        this.setState({
            extensionType: value
        })
    }
    _renderItem = (item) => {
        const customLabel = (
                <span className={ item.out_of_service === 'yes' ? 'out-of-service' : '' }>
                    { item.label }
                </span>
            )

        return {
                label: customLabel,  // for displayed item
                value: item.value   // for title and filter matching
            }
    }
    _removeLocalNetwork = (k) => {
        let fieldsValue = {}
        const { form } = this.props
        // can use data-binding to get
        const localNetworks = form.getFieldValue('localNetworks')

        fieldsValue['local_network' + k] = ''
        fieldsValue.localNetworks = localNetworks.filter(item => item.key !== k)

        // can use data-binding to set
        form.setFieldsValue(fieldsValue)
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        const title = formatMessage({id: "LANG734"})
        const extensionType = this.state.extensionType
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
                labelCol: { span: 8 },
                wrapperCol: { span: 12 }
            }

        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemLayoutTranfer = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 }
        }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        getFieldDecorator('localNetworks', { initialValue: [] })
        getFieldDecorator('callbarging_monitor', { initialValue: '' })
        getFieldDecorator('seamless_transfer_members', { initialValue: '' })
        getFieldDecorator('allow', { initialValue: 'ulaw,alaw,gsm,g726,g722,g729,h264,ilbc' })

        const localNetworks = getFieldValue('localNetworks')
        const localNetworkFormItems = localNetworks.map((item, index) => {
            return (
                <Row
                    key={ item.key }
                    className="row-section-content"
                >
                    <Col
                        span={ 12 }
                        className={ this.state.check_strategy_ipacl && this.state.strategy_ipacl === '1' ? 'display-block' : 'hidden' }
                    >
                        <Col span={ 22 } offset={ 2 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG1145" /> }>
                                            <span>{ formatMessage({id: "LANG1146"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator(`local_network${item.key}`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: this.state.check_strategy_ipacl && this.state.strategy_ipacl === '1',
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (this.state.check_strategy_ipacl && this.state.strategy_ipacl === '1') ? this._checkNetwork : ''
                                    }, {
                                        validator: (this.state.check_strategy_ipacl && this.state.strategy_ipacl === '1') ? this._checkNetworkNumber : ''
                                    }],
                                    initialValue: item.new ? '' : getFieldValue(`local_network${item.key}`)
                                })(
                                    <Input />
                                ) }
                                <Icon
                                    type="minus-circle-o"
                                    onClick={ () => this._removeLocalNetwork(item.key) }
                                    className="dynamic-network-button"
                                />
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
            )
        })

        return (
            <div className="app-content-main app-content-extension">
                <Title
                    headerTitle={ title }
                    isDisplay='display-block'
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                />
                <div className="content">
                    <Form>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG625"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_permission', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_permission
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                            rules: [],
                                            initialValue: 'internal'
                                        })(
                                            <Select disabled={ !this.state.check_permission }>
                                                <Option value='internal'>{ formatMessage({id: 'LANG1071'}) }</Option>
                                                <Option value='internal-local'>{ formatMessage({id: 'LANG1072'}) }</Option>
                                                <Option value='internal-local-national'>{ formatMessage({id: 'LANG1073'}) }</Option>
                                                <Option value='internal-local-national-international'>{ formatMessage({id: 'LANG1074'}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_hasvoicemail', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_hasvoicemail
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                            initialValue: true
                                        })(
                                            <Checkbox disabled={ !this.state.check_hasvoicemail } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_secret', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_secret
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                        <Tooltip
                                            placement="bottom"
                                            overlayClassName="ant-tooltip-custom"
                                            title={ <FormattedHTMLMessage id="LANG5623" /> }
                                        >
                                            { getFieldDecorator('secret', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: !!this.state.check_secret,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this.state.check_secret ? Validator.minlength(data, value, callback, formatMessage, 1) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this.state.check_secret ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this.state.check_secret ? Validator.keyboradNoSpacesemicolon(data, value, callback, formatMessage) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        (this.state.check_secret && value !== 'r') ? Validator.checkAlphanumericPw(data, value, callback, formatMessage) : callback()
                                                    }
                                                }],
                                                initialValue: 'r'
                                            })(
                                                <Input disabled={ !this.state.check_secret } placeholder={ formatMessage({id: "LANG5623"}) } />
                                            ) }
                                        </Tooltip>
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_vmsecret', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_vmsecret
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                        <Tooltip
                                            placement="bottom"
                                            overlayClassName="ant-tooltip-custom"
                                            title={ <FormattedHTMLMessage id="LANG5623" /> }
                                        >
                                            { getFieldDecorator('vmsecret', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    required: !!this.state.check_vmsecret,
                                                    message: formatMessage({id: "LANG2150"})
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this.state.check_vmsecret ? Validator.minlength(data, value, callback, formatMessage, 1) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this.state.check_vmsecret ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        (this.state.check_secret && value !== 'r') ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        (this.state.check_secret && value !== 'r') ? Validator.checkNumericPw(data, value, callback, formatMessage) : callback()
                                                    }
                                                }],
                                                initialValue: 'r'
                                            })(
                                                <Input disabled={ !this.state.check_vmsecret } placeholder={ formatMessage({id: "LANG5623"}) } />
                                            ) }
                                        </Tooltip>
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_cidnumber', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_cidnumber
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                        <Tooltip
                                            placement="bottom"
                                            overlayClassName="ant-tooltip-custom"
                                            title={ <FormattedHTMLMessage id="LANG5622" /> }
                                        >
                                            { getFieldDecorator('cidnumber', {
                                                getValueFromEvent: (e) => {
                                                    return UCMGUI.toggleErrorMessage(e)
                                                },
                                                rules: [{
                                                    validator: (data, value, callback) => {
                                                        this.state.check_cidnumber ? Validator.minlength(data, value, callback, formatMessage, 1) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this.state.check_cidnumber ? Validator.maxlength(data, value, callback, formatMessage, 32) : callback()
                                                    }
                                                }, {
                                                    validator: (data, value, callback) => {
                                                        this.state.check_cidnumber ? Validator.realAlphanumeric(data, value, callback, formatMessage) : callback()
                                                    }
                                                }],
                                                initialValue: 'e'
                                            })(
                                                <Input disabled={ !this.state.check_cidnumber } placeholder={ formatMessage({id: "LANG5622"}) } />
                                            ) }
                                        </Tooltip>
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_ring_timeout', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_ring_timeout
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1599" /> }>
                                                    <span>{ formatMessage({id: "LANG1598"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('ring_timeout', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                validator: (data, value, callback) => {
                                                    this.state.check_ring_timeout ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_ring_timeout ? Validator.range(data, value, callback, formatMessage, 3, 600) : callback()
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input disabled={ !this.state.check_ring_timeout } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_auto_record', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_auto_record
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG2544" /> }>
                                                    <span>{ formatMessage({id: "LANG2543"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('auto_record', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: false
                                        })(
                                            <Checkbox disabled={ !this.state.check_auto_record } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_skip_vmsecret', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_skip_vmsecret
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                            initialValue: false
                                        })(
                                            <Checkbox disabled={ !this.state.check_skip_vmsecret } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ extensionType === 'sip' ? 'display-block' : 'hidden' }
                            >
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_enable_qualify', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_enable_qualify
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                            initialValue: false,
                                            valuePropName: 'checked'
                                        })(
                                            <Checkbox disabled={ !this.state.check_enable_qualify } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ extensionType === 'sip' ? 'display-block' : 'hidden' }
                            >
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_qualifyfreq', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_qualifyfreq
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                                required: !!this.state.check_qualifyfreq,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_qualifyfreq ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_qualifyfreq ? Validator.range(data, value, callback, formatMessage, 1, 3600) : callback()
                                                }
                                            }],
                                            initialValue: '60'
                                        })(
                                            <Input disabled={ !this.state.check_qualifyfreq } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_mohsuggest', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_mohsuggest
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1800" /> }>
                                                    <span>{ formatMessage({id: "LANG1178"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('mohsuggest', {
                                            rules: [],
                                            initialValue: 'default'
                                        })(
                                            <Select disabled={ !this.state.check_mohsuggest }>
                                                {
                                                    this.state.mohNameList.map(function(value) {
                                                        return <Option
                                                                    key={ value }
                                                                    value={ value }
                                                                >
                                                                    { value }
                                                                </Option>
                                                    })
                                                }
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_out_of_service', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_out_of_service
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                            initialValue: false,
                                            valuePropName: 'checked'
                                        })(
                                            <Checkbox disabled={ !this.state.check_out_of_service } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_enable_ldap', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_enable_ldap
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG4136" /> }>
                                                    <span>{ formatMessage({id: "LANG4135"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('enable_ldap', {
                                            rules: [],
                                            initialValue: true,
                                            valuePropName: 'checked'
                                        })(
                                            <Checkbox disabled={ !this.state.check_enable_ldap } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ extensionType === 'sip' ? 'display-block' : 'hidden' }
                            >
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_enable_webrtc', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_enable_webrtc
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG4452" /> }>
                                                    <span>{ formatMessage({id: "LANG4393"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('enable_webrtc', {
                                            rules: [],
                                            initialValue: false,
                                            valuePropName: 'checked'
                                        })(
                                            <Checkbox disabled={ !this.state.check_enable_webrtc } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_out_limitime', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_out_limitime
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3026" /> }>
                                                    <span>{ formatMessage({id: "LANG3025"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('out_limitime', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: this.state.out_limitime
                                        })(
                                            <Checkbox disabled={ !this.state.check_out_limitime } onChange={ this._onChangeLimiTime } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ this.state.out_limitime ? 'display-block' : 'hidden' }
                            >
                                <Col
                                    span={ 22 }
                                    offset={ 2 }
                                >
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG3018" /> }>
                                                    <span>{ formatMessage({id: "LANG3017"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('maximumTime', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: !!this.state.check_out_limitime && !!this.state.out_limitime,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_out_limitime && this.state.out_limitime ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_out_limitime && this.state.out_limitime ? Validator.max(data, value, callback, formatMessage, 86400) : callback()
                                                }
                                            }, {
                                                validator: this.state.check_out_limitime && this.state.out_limitime ? this._checkTimeLarger : ''
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input disabled={ !this.state.check_out_limitime } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_language', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_language
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                            rules: [],
                                            initialValue: 'default'
                                        })(
                                            <Select disabled={ !this.state.check_language }>
                                                <Option value='default'>{ formatMessage({id: "LANG257"}) }</Option>
                                                {
                                                    this.state.languages.map(function(item) {
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
                            </Col>
                        </Row>
                        <Row
                            className={ extensionType === 'sip' ? 'display-block' : 'hidden' }
                        >
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG626"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row
                            className={ extensionType === 'sip' ? 'display-block row-section-content' : 'hidden' }
                        >
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_nat', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_nat
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1093" /> }>
                                                    <span>{ 'NAT' }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('nat', {
                                            rules: [],
                                            initialValue: true,
                                            valuePropName: 'checked'
                                        })(
                                            <Checkbox disabled={ !this.state.check_nat } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_directmedia', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_directmedia
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1095" /> }>
                                                    <span>{ formatMessage({id: "LANG1094"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('directmedia', {
                                            rules: [],
                                            initialValue: 'no'
                                        })(
                                            <Select disabled={ !this.state.check_directmedia }>
                                                <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                                <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_dtmfmode', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_dtmfmode
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1098" /> }>
                                                    <span>{ formatMessage({id: "LANG1097"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('dtmfmode', {
                                            rules: [],
                                            initialValue: 'rfc2833'
                                        })(
                                            <Select disabled={ !this.state.check_dtmfmode }>
                                                <Option value='rfc2833'>{ 'RFC2833' }</Option>
                                                <Option value='info'>{ formatMessage({id: "LANG1099"}) }</Option>
                                                <Option value='inband'>{ formatMessage({id: "LANG1100"}) }</Option>
                                                <Option value='auto'>{ formatMessage({id: "LANG138"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_tel_uri', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_tel_uri
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG2769" /> }>
                                                    <span>{ formatMessage({id: "LANG2768"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('tel_uri', {
                                            rules: [],
                                            initialValue: 'disabled'
                                        })(
                                            <Select disabled={ !this.state.check_tel_uri }>
                                                <Option value='disabled'>{ formatMessage({id: "LANG2770"}) }</Option>
                                                <Option value='user_phone'>{ formatMessage({id: "LANG2771"}) }</Option>
                                                <Option value='enabled'>{ formatMessage({id: "LANG2772"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_max_contacts', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_max_contacts
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
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
                                                required: !!this.state.check_max_contacts,
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_max_contacts ? Validator.min(data, value, callback, formatMessage, 1) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_max_contacts ? Validator.digits(data, value, callback, formatMessage, 32) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_max_contacts ? Validator.range(data, value, callback, formatMessage, 1, 10) : callback()
                                                }
                                            }],
                                            initialValue: 1
                                        })(
                                            <Input disabled={ !this.state.check_max_contacts } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <Row
                            className={ extensionType === 'iax' ? 'display-block' : 'hidden' }
                        >
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG627"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row
                            className={ extensionType === 'iax' ? 'display-block row-section-content' : 'hidden' }
                        >
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_maxcallnumbers', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_maxcallnumbers
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1131" /> }>
                                                    <span>{ formatMessage({id: "LANG1130"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('maxcallnumbers', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                validator: (data, value, callback) => {
                                                    this.state.check_maxcallnumbers ? Validator.digits(data, value, callback, formatMessage) : callback()
                                                }
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_maxcallnumbers ? Validator.range(data, value, callback, formatMessage, 1, 512) : callback()
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input disabled={ !this.state.check_maxcallnumbers } />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_requirecalltoken', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_requirecalltoken
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1133" /> }>
                                                    <span>{ formatMessage({id: "LANG1132"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('requirecalltoken', {
                                            rules: [],
                                            initialValue: 'yes'
                                        })(
                                            <Select disabled={ !this.state.check_requirecalltoken }>
                                                <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                                <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                                <Option value='auto'>{ formatMessage({id: "LANG138"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG5079"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <Col span={ 24 }>
                                <Col span={ 1 }>
                                    <FormItem>
                                        { getFieldDecorator('check_callbarging_monitor', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_callbarging_monitor
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayoutTranfer }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG5081" /> }>
                                                    <span>{ formatMessage({id: "LANG5080"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        <Transfer
                                            showSearch
                                            render={ this._renderItem }
                                            dataSource={ this.state.accountList }
                                            onChange={ this._handleCallbargingChange }
                                            filterOption={ this._filterTransferOption }
                                            targetKeys={ this.state.targetKeysCallbarging }
                                            notFoundContent={ formatMessage({id: "LANG133"}) }
                                            onSelectChange={ this._handleTransferSelectChange }
                                            searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                            titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                                            className={ this.state.check_callbarging_monitor ? 'display-block' : 'ant-transfer-disabled' }
                                        />
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG5294"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <Col span={ 24 }>
                                <Col span={ 1 }>
                                    <FormItem>
                                        { getFieldDecorator('check_seamless_transfer_members', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_seamless_transfer_members
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayoutTranfer }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG5296" /> }>
                                                    <span>{ formatMessage({id: "LANG5295"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        <Transfer
                                            showSearch
                                            render={ this._renderItem }
                                            dataSource={ this.state.accountList }
                                            onChange={ this._handleSeamlessChange }
                                            filterOption={ this._filterTransferOption }
                                            targetKeys={ this.state.targetKeysSeamless }
                                            notFoundContent={ formatMessage({id: "LANG133"}) }
                                            onSelectChange={ this._handleTransferSelectChange }
                                            searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                            titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                                            className={ this.state.check_seamless_transfer_members ? 'display-block' : 'ant-transfer-disabled' }
                                        />
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={ 24 }>
                                <div className="section-title">
                                    <span>{ formatMessage({id: "LANG629"}) }</span>
                                </div>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_encryption', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_encryption
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1134" /> }>
                                                    <span>{ 'SRTP' }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('encryption', {
                                            rules: [],
                                            initialValue: 'no'
                                        })(
                                            <Select disabled={ !this.state.check_encryption }>
                                                <Option value='no'>{ formatMessage({id: "LANG4377"}) }</Option>
                                                <Option value="yes">{ formatMessage({id: "LANG4375"}) }</Option>
                                                <Option value='support'>{ formatMessage({id: "LANG4376"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_faxmode', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_faxmode
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG4199" /> }>
                                                    <span>{ formatMessage({id: "LANG3871"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('faxmode', {
                                            rules: [],
                                            initialValue: 'no'
                                        })(
                                            <Select disabled={ !this.state.check_faxmode }>
                                                <Option value='no'>{ formatMessage({id: "LANG133"}) }</Option>
                                                <Option value='detect'>{ formatMessage({id: "LANG1135"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_bypass_outrt_auth', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_bypass_outrt_auth
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG4047" /> }>
                                                    <span>{ formatMessage({id: "LANG1142"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('bypass_outrt_auth', {
                                            rules: [],
                                            initialValue: this.state.bypass_outrt_auth
                                        })(
                                            <Select disabled={ !this.state.check_bypass_outrt_auth } onChange={ this._onChangeTrunkAuth }>
                                                <Option value='no'>{ formatMessage({id: "LANG137"}) }</Option>
                                                <Option value='yes'>{ formatMessage({id: "LANG136"}) }</Option>
                                                <Option value='bytime'>{ formatMessage({id: "LANG4044"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                            <Col
                                span={ 12 }
                                className={ this.state.check_bypass_outrt_auth && this.state.bypass_outrt_auth === 'bytime' ? 'display-block' : 'hidden' }
                            >
                                <Col span={ 22 } offset={ 2 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG4046" /> }>
                                                    <span>{ formatMessage({id: "LANG4045"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('skip_auth_timetype', {
                                            rules: [],
                                            initialValue: '0'
                                        })(
                                            <Select>
                                                <Option value='0'>{ formatMessage({id: "LANG3285"}) }</Option>
                                                <Option value='1'>{ formatMessage({id: "LANG3271"}) }</Option>
                                                <Option value='2'>{ formatMessage({id: "LANG3275"}) }</Option>
                                                <Option value='3'>{ formatMessage({id: "LANG3266"}) }</Option>
                                                <Option value='4'>{ formatMessage({id: "LANG3286"}) }</Option>
                                                <Option value='5'>{ formatMessage({id: "LANG3287"}) }</Option>
                                                <Option value='6'>{ formatMessage({id: "LANG3288"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <Col span={ 12 }>
                                <Col span={ 2 }>
                                    <FormItem>
                                        { getFieldDecorator('check_strategy_ipacl', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_strategy_ipacl
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1138" /> }>
                                                    <span>{ formatMessage({id: "LANG1137"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('strategy_ipacl', {
                                            rules: [],
                                            initialValue: this.state.strategy_ipacl
                                        })(
                                            <Select disabled={ !this.state.check_strategy_ipacl } onChange={ this._onChangeStrategy }>
                                                <Option value='0'>{ formatMessage({id: "LANG1139"}) }</Option>
                                                <Option value="1">{ formatMessage({id: "LANG1140"}) }</Option>
                                                <Option value='2'>{ formatMessage({id: "LANG1141"}) }</Option>
                                            </Select>
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <Col
                                span={ 12 }
                                className={ this.state.check_strategy_ipacl && this.state.strategy_ipacl === '2' ? 'display-block' : 'hidden' }
                            >
                                <Col span={ 22 } offset={ 2 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG2346" /> }>
                                                    <span>{ formatMessage({id: "LANG1144"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('specific_ip', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: this.state.check_strategy_ipacl && this.state.strategy_ipacl === '2',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (data, value, callback) => {
                                                    this.state.check_strategy_ipacl && this.state.strategy_ipacl === '2' ? Validator.ipDns(data, value, callback, formatMessage, 'ip') : callback()
                                                }
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input />
                                        ) }
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        <Row className="row-section-content">
                            <Col
                                span={ 12 }
                                className={ this.state.check_strategy_ipacl && this.state.strategy_ipacl === '1' ? 'display-block' : 'hidden' }
                            >
                                <Col span={ 22 } offset={ 2 }>
                                    <FormItem
                                        { ...formItemLayout }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1145" /> }>
                                                    <span>{ formatMessage({id: "LANG1146"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        { getFieldDecorator('local_network1', {
                                            getValueFromEvent: (e) => {
                                                return UCMGUI.toggleErrorMessage(e)
                                            },
                                            rules: [{
                                                required: this.state.check_strategy_ipacl && this.state.strategy_ipacl === '1',
                                                message: formatMessage({id: "LANG2150"})
                                            }, {
                                                validator: (this.state.check_strategy_ipacl && this.state.strategy_ipacl === '1') ? this._checkNetwork : ''
                                            }, {
                                                validator: (this.state.check_strategy_ipacl && this.state.strategy_ipacl === '1') ? this._checkNetworkNumber : ''
                                            }],
                                            initialValue: ''
                                        })(
                                            <Input />
                                        ) }
                                        <Icon
                                            type="plus-circle-o"
                                            onClick={ this._addLocalNetwork }
                                            className="dynamic-network-button"
                                        />
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                        { localNetworkFormItems }
                        <Row className="row-section-content">
                            <Col span={ 24 }>
                                <Col span={ 1 }>
                                    <FormItem>
                                        { getFieldDecorator('check_allow', {
                                            rules: [],
                                            valuePropName: 'checked',
                                            initialValue: !!this.state.check_allow
                                        })(
                                            <Checkbox onChange={ this._onChangeCheckbox } />
                                        ) }
                                    </FormItem>
                                </Col>
                                <Col span={ 22 }>
                                    <FormItem
                                        { ...formItemLayoutTranfer }
                                        label={(
                                            <span>
                                                <Tooltip title={ <FormattedHTMLMessage id="LANG1150" /> }>
                                                    <span>{ formatMessage({id: "LANG1149"}) }</span>
                                                </Tooltip>
                                            </span>
                                        )}
                                    >
                                        <Transfer
                                            showSearch
                                            sorter={ true }
                                            render={ item => item.title }
                                            onChange={ this._handleAllowChange }
                                            targetKeys={ this.state.targetKeysAllow }
                                            dataSource={ this._filterCodecsSource() }
                                            filterOption={ this._filterTransferOption }
                                            notFoundContent={ formatMessage({id: "LANG133"}) }
                                            onSelectChange={ this._handleTransferSelectChange }
                                            searchPlaceholder={ formatMessage({id: "LANG803"}) }
                                            titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                                            className={ this.state.check_allow ? 'display-block' : 'ant-transfer-disabled' }
                                        />
                                    </FormItem>
                                </Col>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

BatchEditExtension.propTypes = {}

export default Form.create()(injectIntl(BatchEditExtension))
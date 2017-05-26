'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl, formatMessage } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Select, Transfer, Tooltip, Modal } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const CheckboxGroup = Checkbox.Group

class BasicSettings extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isDialTrunk: false,
            permissionShow: false,
            alertinfoShow: false,
            ivrblackwhiteShow: false,
            fileList: [],
            accountList: [],
            numberList: [],
            ivrNameList: [],
            languageList: [],
            select_alertinfo: "",
            custom_alertinfo: "",
            targetKeys: [],
            plainOptions: [],
            checkedList: ['dial_extension'],
            dialList: [
                'dial_extension',
                'dial_conference',
                'dial_queue',
                'dial_ringgroup',
                'dial_paginggroup',
                'dial_vmgroup',
                'dial_fax',
                'dial_directory'
            ],
            dialAll: false,
            transferDisabled: false
        }
    }
    componentWillMount() {
        this._getInitData()
        this._getLanguages()
    }
    componentDidMount() {

    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.ivrNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkExtension = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.numberList, value) > -1) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _checkBlackList = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const enable = getFieldValue('switch')
        const enTrunk = getFieldValue('dial_trunk')
        const targetKeys = this.state.targetKeys
        const ivr_out_blackwhite_list = getFieldValue('ivr_out_blackwhite_list') || ''
        const ivr_out_blackwhite_list_length = ivr_out_blackwhite_list ? ivr_out_blackwhite_list.split(',') : 0

        if (value && enable !== 'no' && (ivr_out_blackwhite_list.length === 0 || ivr_out_blackwhite_list === '') && targetKeys.length === 0) {
            callback(formatMessage({id: "LANG5334"}))
        } else if (value && enable !== 'no' && this.state.transferDisabled && ivr_out_blackwhite_list === '') {
            callback(formatMessage({id: "LANG5334"}))
        } else if (value && enable !== 'no' && enTrunk === false && targetKeys.length === 0) {
            callback(formatMessage({id: 'LANG5334'}))
        } else {
            callback()
        }
    }
    _getInitData = () => {
        const ivrItem = this.props.ivrItem || {}
        const ivrId = this.props.ivrId
        const { formatMessage } = this.props.intl
        const plainOptions = [{
                label: formatMessage({id: "LANG85"}),
                value: 'dial_extension'
            }, {
                label: formatMessage({id: "LANG18"}),
                value: 'dial_conference'
            }, {
                label: formatMessage({id: "LANG607"}),
                value: 'dial_queue'
            }, {
                label: formatMessage({id: "LANG600"}),
                value: 'dial_ringgroup'
            }, {
                label: formatMessage({id: "LANG604"}),
                value: 'dial_paginggroup'
            }, {
                label: formatMessage({id: "LANG21"}),
                value: 'dial_vmgroup'
            }, {
                label: formatMessage({id: "LANG1268"}),
                value: 'dial_fax'
            }, {
                label: formatMessage({id: "LANG2884"}),
                value: 'dial_directory'
            }]

        let accountList = _.clone(this.props.accountList)
        let fileList = this.props.fileList
        let numberList = this.props.numberList || []
        let ivrNameList = this.props.ivrNameList || []
        let languageList = this.props.languageList || []

        let ivrblackwhiteShow = false
        let isDialTrunk = false
        let permissionShow = false
        let alertinfoShow = false
        let select_alertinfo = ""
        let custom_alertinfo = ""
        let targetKeys = ivrItem.ivr_blackwhite_list ? ivrItem.ivr_blackwhite_list.split(',') || [] : []
        let checkedList = this.state.checkedList || []
        let dialAll = this.state.dialAll
        let transferDisabled = this.state.transferDisabled

        if (ivrId && ivrItem) {
            checkedList = []
            this.state.dialList.map(function(item) {
                if (ivrItem[item] === 'yes') {
                    checkedList.push(item)
                }
            })
        }

        dialAll = checkedList.length === plainOptions.length
        if (_.indexOf(checkedList, 'dial_extension') > -1) {
            transferDisabled = false
        } else {
            transferDisabled = true
        }

        if (ivrItem.switch === 'black' || ivrItem.switch === "white") {
            ivrblackwhiteShow = true
        }
        if (ivrItem.dial_trunk === 'yes') {
            permissionShow = true
            isDialTrunk = true
        }
        if (ivrItem.alertinfo && ivrItem.alertinfo.slice(0, 7) === 'custom_') {
            alertinfoShow = true
            select_alertinfo = "custom"
            custom_alertinfo = ivrItem.alertinfo.slice(7)
        } else {
            select_alertinfo = ivrItem.alertinfo
        }
        /* accountList.map(function(item, index) {
            accountList[index]['disabled'] = transferDisabled
        }) */
        this.props.getSpecialState(checkedList)
        this.setState({
            languageList: languageList,
            accountList: accountList,
            fileList: fileList,
            ivrblackwhiteShow: ivrblackwhiteShow,
            alertinfoShow: alertinfoShow,
            permissionShow: permissionShow,
            isDialTrunk: isDialTrunk,
            select_alertinfo: select_alertinfo,
            custom_alertinfo: custom_alertinfo,
            targetKeys: targetKeys,
            checkedList: checkedList,
            numberList: numberList,
            ivrNameList: ivrNameList,
            dialAll: dialAll,
            plainOptions: plainOptions,
            transferDisabled: transferDisabled
        })
    }
    _getLanguages = () => {
        const { formatMessage } = this.props.intl

        let languages = UCMGUI.isExist.getList('getLanguage')

        this.setState({
            languages: languages
        })
    }
    _onChangeExtensionType = (value) => {
        if (value === 'fxs') {
            this.setState({
                add_method: 'single'
            })

            // setState for select does not work
            this.props.form.setFieldsValue({
                add_method: 'single'
            })
        }

        this.props.onExtensionTypeChange(value)
    }
    _onChangeAddMethod = (value) => {
        this.setState({
            add_method: value
        })
    }
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    _onChangeDial = (checkedList) => {
        const plainOptions = this.state.plainOptions
        let transferDisabled = this.state.transferDisabled
        let accountList = this.state.accountList
        if (_.indexOf(checkedList, 'dial_extension') > -1) {
            transferDisabled = false
        } else {
            transferDisabled = true
        }
        /* accountList.map(function(item, index) {
            accountList[index]['disabled'] = transferDisabled
        }) */
        this.setState({
            checkedList: checkedList,
            dialAll: checkedList.length === plainOptions.length,
            transferDisabled: transferDisabled,
            accountList: accountList
        })
        this.props.getSpecialState(checkedList)
    }
    _onDialallChange = (e) => {
        let checkedList = []
        let transferDisabled = this.state.transferDisabled
        let accountList = this.state.accountList
        const plainOptions = this.state.plainOptions
        plainOptions.map(function(item) {
            checkedList.push(item.value)
        })
        if (e.target.checked) {
            transferDisabled = false
        } else {
            transferDisabled = true
        }
        /* accountList.map(function(item, index) {
            accountList[index]['disabled'] = transferDisabled
        }) */
        this.setState({
            checkedList: e.target.checked ? checkedList : [],
            dialAll: e.target.checked,
            transferDisabled: transferDisabled,
            accountList: accountList
        })
        this.props.getSpecialState(e.target.checked ? checkedList : [])
    }
    _onChangeDialTrunk = (e) => {
        if (e.target.checked) {
            this.setState({
                permissionShow: true,
                isDialTrunk: true
            })
        } else {
            this.setState({
                permissionShow: false,
                isDialTrunk: false
            })
        }
    }
    _onChangeAlertInfo = (e) => {
        if (e === "custom") {
            this.setState({
                alertinfoShow: true,
                select_alertinfo: e
            })
        } else {
            this.setState({
                alertinfoShow: false,
                select_alertinfo: e
            })
        }
    }
    _onChangeIvrBlackWhite = (e) => {
        if (e === "no") {
            this.setState({
                ivrblackwhiteShow: false
            })
        } else {
            this.setState({
                ivrblackwhiteShow: true
            })
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _handleTransferChange = (targetKeys, direction, moveKeys) => {
        this.setState({
            targetKeys: targetKeys
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
    _gotoPromptOk = () => {
        browserHistory.push('/pbx-settings/voicePrompt/2')
    }
    _gotoPrompt = () => {
        const { formatMessage } = this.props.intl
        const __this = this
        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG28"})})}} ></span>,
            onOk() {
                __this._gotoPromptOk()
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _renderItem = (item) => {
        const customLabel = (
                <span className={ item.out_of_service === 'yes' ? 'out-of-service' : '' }>
                    { item.title }
                </span>
            )

        return {
                label: customLabel,  // for displayed item
                value: item.title   // for title and filter matching
            }
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const settings = this.props.settings || {}
        const { getFieldDecorator } = this.props.form
        const currentEditId = this.props.currentEditId
        const ivrItem = this.props.ivrItem || {}
        const newIvrNum = this.props.newIvrNum
        const checkedList = this.state.checkedList
        const plainOptions = this.state.plainOptions

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemPromptLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 }
        }

        const formItemLayoutTime = {
            labelCol: { span: 3 },
            wrapperCol: { span: 1 }
        }

        const formItemLayoutRow = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        return (
            <div className="content">
                <Form>
                    <FormItem
                        ref="div_ivr_name"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1459" />}>
                                <span>{formatMessage({id: "LANG135"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('ivr_name', {
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
                                    Validator.maxlength(data, value, callback, formatMessage, 64)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: this._checkName
                            }],
                            initialValue: ivrItem.ivr_name
                        })(
                            <Input placeholder={ formatMessage({id: "LANG135"}) } maxLength='32' />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_extension"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1451" />}>
                                <span>{formatMessage({id: "LANG85"})}</span>
                            </Tooltip>
                        )}>
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
                                    Validator.maxlength(data, value, callback, formatMessage, 64)
                                }
                            }, {
                                validator: (data, value, callback) => {
                                    Validator.digits(data, value, callback, formatMessage)
                                }
                            }, {
                                validator: this._checkExtension
                            }],
                            width: 100,
                            initialValue: ivrItem.extension ? ivrItem.extension : newIvrNum
                        })(
                            <Input maxLength='32' />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_dial_trunk"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1448" />}>
                                <span>{formatMessage({id: "LANG1447"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('dial_trunk', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: (ivrItem.dial_trunk === "yes" ? true : false)
                        })(
                            <Checkbox onChange={ this._onChangeDialTrunk }/>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_permission"
                        className={ this.state.permissionShow ? "display-block" : "hidden" }
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1070" />}>
                                <span>{formatMessage({id: "LANG1069"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('permission', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            initialValue: ivrItem.permission ? ivrItem.permission : 'internal'
                        })(
                            <Select>
                                <Option value="internal">{ formatMessage({id: "LANG1071"}) }</Option>
                                <Option value="internal-local">{ formatMessage({id: "LANG1072"}) }</Option>
                                <Option value="internal-local-national">{ formatMessage({id: "LANG1073"}) }</Option>
                                <Option value="internal-local-national-international">{ formatMessage({id: "LANG1074"}) }</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_dial_box"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1446" />}>
                                <span>{formatMessage({id: "LANG1445"})}</span>
                            </Tooltip>
                        )}>
                        <CheckboxGroup options={ plainOptions } value={ checkedList } onChange={ this._onChangeDial } />
                        <Col span={ 2 }>
                            <Checkbox checked={ this.state.dialAll } onChange={ this._onDialallChange } />
                        </Col>
                        <Col span={ 6 }>{formatMessage({id: "LANG104"})}</Col>
                    </FormItem>
                    <FormItem
                        ref="div_switch"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG5328" />}>
                                <span>{formatMessage({id: "LANG5327"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('switch', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: this._checkBlackList
                            }],
                            initialValue: (ivrItem.switch ? ivrItem.switch : "no")
                        })(
                            <Select onChange={ this._onChangeIvrBlackWhite }>
                                <Option value="no">{ formatMessage({id: "LANG5332"}) }</Option>
                                <Option value="black">{ formatMessage({id: "LANG2292"}) }</Option>
                                <Option value="white">{ formatMessage({id: "LANG5333"}) }</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        className={ this.state.ivrblackwhiteShow ? "display-block" : "hidden" }
                        { ...formItemTransferLayout }
                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG5350" />}>
                                <span>{formatMessage({id: "LANG5331"})}</span>
                            </Tooltip>
                        )}
                    >
                        { getFieldDecorator('ivr_blackwhite_list', {
                            rules: [],
                            initialValue: this.state.targetKeys
                        })(
                        <Transfer
                            showSearch
                            render={ this._renderItem }
                            targetKeys={ this.state.targetKeys }
                            dataSource={ this.state.accountList }
                            onChange={ this._handleTransferChange }
                            filterOption={ this._filterTransferOption }
                            notFoundContent={ formatMessage({id: "LANG133"}) }
                            onSelectChange={ this._handleTransferSelectChange }
                            searchPlaceholder={ formatMessage({id: "LANG803"}) }
                            titles={[formatMessage({id: "LANG5121"}), formatMessage({id: "LANG3475"})]}
                            className={ this.state.transferDisabled ? 'ant-transfer-disabled' : 'display-block'}
                        />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_ivr_out_blackwhite_list"
                        className={ this.state.ivrblackwhiteShow ? "display-block" : "hidden" }
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG5330" />}>
                                <span>{formatMessage({id: "LANG5329"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('ivr_out_blackwhite_list', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                validator: (data, value, callback) => {
                                    this.state.ivrblackwhiteShow && this.state.isDialTrunk ? Validator.digitalAndQuote(data, value, callback, formatMessage) : callback()
                                }
                            }],
                            initialValue: ivrItem.ivr_out_blackwhite_list
                        })(
                            <Input type="textarea" disabled={ this.state.isDialTrunk ? false : true } />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_replace_caller_id"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG5075" />}>
                                <span>{formatMessage({id: "LANG5071"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('replace_caller_id', {
                            rules: [],
                            valuePropName: 'checked',
                            initialValue: (ivrItem.replace_caller_id === "yes" ? true : false)
                        })(
                            <Checkbox />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_alertinfo"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG3249" />}>
                                <span>{formatMessage({id: "LANG3248"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('alertinfo', {
                            rules: [],
                            initialValue: this.state.select_alertinfo ? this.state.select_alertinfo : ""
                        })(
                            <Select onChange={ this._onChangeAlertInfo }>
                                <Option value="">{ formatMessage({id: "LANG133"}) }</Option>
                                <Option value="ring1">Ring 1</Option>
                                <Option value="ring2">Ring 2</Option>
                                <Option value="ring3">Ring 3</Option>
                                <Option value="ring4">Ring 4</Option>
                                <Option value="ring5">Ring 5</Option>
                                <Option value="ring6">Ring 6</Option>
                                <Option value="ring7">Ring 7</Option>
                                <Option value="ring8">Ring 8</Option>
                                <Option value="ring9">Ring 9</Option>
                                <Option value="ring10">Ring 10</Option>
                                <Option value="Bellcore-dr1">Bellcore-dr1</Option>
                                <Option value="Bellcore-dr2">Bellcore-dr2</Option>
                                <Option value="Bellcore-dr3">Bellcore-dr3</Option>
                                <Option value="Bellcore-dr4">Bellcore-dr4</Option>
                                <Option value="Bellcore-dr5">Bellcore-dr5</Option>
                                <Option value="custom">{ formatMessage({id: "LANG231"}) }</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_custom_alert_info"
                        className={ this.state.alertinfoShow ? "display-block" : "hidden" }
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG3250" />}>
                                <span>{formatMessage({id: "LANG3250"}) }</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('custom_alert_info', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: (this.state.select_alertinfo === "custom" ? true : false),
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    this.state.select_alertinfo === "custom" ? Validator.letterDigitUndHyphen(data, value, callback, formatMessage) : callback()
                                }
                            }],
                            width: 100,
                            initialValue: this.state.custom_alertinfo
                        })(
                            <Input maxLength="64" />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_welcome_prompt"
                        { ...formItemPromptLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1484" />}>
                                <span>{formatMessage({id: "LANG1484"})}</span>
                            </Tooltip>
                        )}>
                        <Row>
                            <Col span={16} >
                                { getFieldDecorator('welcome_prompt', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: (ivrItem.welcome_prompt ? ivrItem.welcome_prompt : "welcome")
                                })(
                                    <Select>
                                        <Option value="welcome">welcome</Option>  
                                        {
                                            this.state.fileList.map(function(item) {
                                                return <Option
                                                        key={ item.val }
                                                        value={ item.val }>
                                                        { item.text }
                                                    </Option>
                                                }
                                            ) 
                                        }
                                    </Select>
                                ) }
                            </Col>
                            <Col span={6} offset={1} >
                                <a className="prompt_setting" onClick={ this._gotoPrompt } >{ formatMessage({id: "LANG1484"}) }</a>
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem
                        ref="div_digit_timeout"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG2541" />}>
                                <span>{formatMessage({id: "LANG2360"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('digit_timeout', {
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
                                    Validator.range(data, value, callback, formatMessage, 1, 60)
                                }
                            }],
                            width: 10,
                            initialValue: (ivrItem.digit_timeout ? ivrItem.digit_timeout : 3)
                        })(
                            <Input min={1} max={60} />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_response_timeout"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1479" />}>
                                <span>{formatMessage({id: "LANG2540"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('response_timeout', {
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
                                    Validator.range(data, value, callback, formatMessage, 1, 180)
                                }
                            }],
                            width: 10,
                            initialValue: (ivrItem.response_timeout ? ivrItem.response_timeout : 10)
                        })(
                            <Input min={1} max={180} />
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_timeout_prompt"
                        { ...formItemPromptLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1475" />}>
                                <span>{formatMessage({id: "LANG1474"})}</span>
                            </Tooltip>
                        )}>
                        <Row>
                            <Col span={16}>
                                { getFieldDecorator('timeout_prompt', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: (ivrItem.timeout_prompt ? ivrItem.timeout_prompt : "ivr-create-timeout")
                                })(
                                    <Select>
                                        <Option value="ivr-create-timeout">ivr-create-timeout</Option>  
                                        {
                                            this.state.fileList.map(function(item) {
                                                return <Option
                                                        key={ item.val }
                                                        value={ item.val }>
                                                        { item.text }
                                                    </Option>
                                                }
                                            ) 
                                        }
                                    </Select>
                                ) }
                            </Col>
                            <Col span={6} offset={1} >
                                <a className="prompt_setting" onClick={ this._gotoPrompt } >{ formatMessage({id: "LANG1484"}) }</a>
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem
                        ref="div_invalid_prompt"
                        { ...formItemPromptLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1454" />}>
                                <span>{formatMessage({id: "LANG1453"})}</span>
                            </Tooltip>
                        )}>
                        <Row>
                            <Col span={16}>
                                { getFieldDecorator('invalid_prompt', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    width: 100,
                                    initialValue: (ivrItem.invalid_prompt ? ivrItem.invalid_prompt : "invalid")
                                })(
                                    <Select>
                                        <Option value="invalid">invalid</Option>
                                        {
                                            this.state.fileList.map(function(item) {
                                                return <Option
                                                        key={ item.val }
                                                        value={ item.val }>
                                                        { item.text }
                                                    </Option>
                                                }
                                            ) 
                                        }
                                    </Select>
                                ) }
                            </Col>
                            <Col span={6} offset={1} >
                                <a className="prompt_setting" onClick={ this._gotoPrompt } >{ formatMessage({id: "LANG1484"}) }</a>
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem
                        ref="div_tloop"
                        { ...formItemLayoutTime }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1477" />}>
                                <span>{formatMessage({id: "LANG1476"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('tloop', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            width: 100,
                            initialValue: (ivrItem.tloop ? ivrItem.tloop : 3)
                        })(
                            <Select>
                                <Option value="1">1</Option>
                                <Option value="2">2</Option>
                                <Option value="3">3</Option>
                                <Option value="4">4</Option>
                                <Option value="5">5</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_iloop"
                        { ...formItemLayoutTime }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG1456" />}>
                                <span>{formatMessage({id: "LANG1455"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('iloop', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: true,
                                message: formatMessage({id: "LANG2150"})
                            }],
                            width: 100,
                            initialValue: ivrItem.iloop ? ivrItem.iloop : 3
                        })(
                            <Select>
                                <Option value="1">1</Option>
                                <Option value="2">2</Option>
                                <Option value="3">3</Option>
                                <Option value="4">4</Option>
                                <Option value="5">5</Option>
                            </Select>
                        ) }
                    </FormItem>
                    <FormItem
                        ref="div_language"
                        { ...formItemLayout }

                        label={(
                            <Tooltip title={<FormattedHTMLMessage id="LANG2545" />}>
                                <span>{formatMessage({id: "LANG1458"})}</span>
                            </Tooltip>
                        )}>
                        { getFieldDecorator('language', {
                            rules: [],
                            width: 100,
                            initialValue: ivrItem.language ? ivrItem.language : ""
                        })(
                            <Select>
                                <Option value="">{ formatMessage({id: "LANG257"}) }</Option>
                                {
                                    this.state.languageList.map(function(item) {
                                        return <Option
                                                key={ item.language_id }
                                                value={ item.language_id }>
                                                { item.language_name }
                                            </Option>
                                    })
                                }
                            </Select>
                        ) }
                    </FormItem>

                </Form>
            </div>
        )
    }
}

export default injectIntl(BasicSettings)

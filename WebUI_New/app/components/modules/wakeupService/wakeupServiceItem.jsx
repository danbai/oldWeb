'use strict'

import $ from 'jquery'
import _ from 'underscore'
import moment from "moment"
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl'
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, DatePicker, TimePicker, Modal, Row } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const CheckboxGroup = Checkbox.Group

global.wakeupServiceItemCheckCustomWeek = false

class WakeupServiceItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            targetKeys: [],
            accountList: [],
            fileList: [{
                val: "wakeup-call",
                text: "wakeup-call"
            }],
            wakeupServiceItem: {},
            dateShow: true,
            weekShow: false,
            customDateCheck: false,
            weekList: [],
            weekAll: false,
            plainOptions: [],
            wakeupNameList: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getWakeupName()
        this._getInitData()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.wakeupNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkWeek = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && this.state.weekList.length <= 0) {
            callback(formatMessage({id: "LANG3531"}, {0: 1, 1: formatMessage({id: "LANG242"})}))
        } else {
            callback()
        }
    }
    _removeSuffix = (filename) => {
        let name = filename.toLocaleLowerCase(),
            file_suffix = [".mp3", ".wav", ".gsm", ".ulaw", ".alaw"]

        for (let i = 0; i < file_suffix.length; i++) {
            let num = name.lastIndexOf(file_suffix[i])

            if (num !== -1 && name.endsWith(file_suffix[i])) {
                filename = filename.substring(0, num)

                return filename
            }
        }
    }
    _getWakeupName = () => {
        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listWakeupSchedule'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const wakeupList = response.ucm_wakeup || []

                    let wakeupNameList = this.state.wakeupNameList

                    wakeupList.map(function(item) {
                        wakeupNameList.push(item.wakeup_name)
                    })

                    this.setState({
                        wakeupNameList: wakeupNameList
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getInitData = () => {
        let targetKeys = []
        let accountList = []
        let fileList = this.state.fileList
        let wakeupService = {}
        let customCheck = false
        let weekList = []
        let weekAll = false
        let wakeupNameList = this.state.wakeupNameList

        const __this = this
        const { formatMessage } = this.props.intl
        const wakeupServiceId = this.props.params.id
        const wakeupServiceName = this.props.params.name
        const plainOptions = [{
                label: formatMessage({id: "LANG250"}),
                value: '0'
            }, {
                label: formatMessage({id: "LANG251"}),
                value: '1'
            }, {
                label: formatMessage({id: "LANG252"}),
                value: '2'
            }, {
                label: formatMessage({id: "LANG253"}),
                value: '3'
            }, {
                label: formatMessage({id: "LANG254"}),
                value: '4'
            }, {
                label: formatMessage({id: "LANG255"}),
                value: '5'
            }, {
                label: formatMessage({id: "LANG256"}),
                value: '6'
            }]

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listFile',
                type: 'ivr',
                filter: '{"list_dir":0,"list_file":1,"file_suffix":["mp3","wav","gsm","ulaw","alaw"]}',
                sidx: 'n',
                sord: 'desc'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    response.ivr.map(function(item) {
                        let obj = {
                            text: item.n,
                            val: "record/" + __this._removeSuffix(item.n)
                        }

                        fileList.push(obj)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'getAccountList'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const extension = response.extension || []
                    const disabled = formatMessage({id: "LANG273"})

                    accountList = extension
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (wakeupServiceId) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getWakeupSchedule',
                    wakeup_index: wakeupServiceId
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        wakeupService = res.response.wakeup_index || {}

                        if (wakeupService.custom_date.indexOf('-') > -1) {
                            customCheck = false
                        } else {
                            customCheck = true
                            weekList = wakeupService.custom_date.split(',')
                            wakeupService.custom_date = ''
                        }

                        if (weekList.length === 7) {
                            weekAll = true
                        }
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })

            wakeupNameList = _.without(wakeupNameList, wakeupServiceName)
        }

        this.setState({
            targetKeys: targetKeys,
            accountList: accountList,
            fileList: fileList,
            wakeupServiceItem: wakeupService,
            weekShow: (customCheck ? true : false),
            dateShow: (customCheck ? false : true),
            customDateCheck: customCheck,
            weekList: weekList,
            weekAll: weekAll,
            plainOptions: plainOptions,
            wakeupNameList: wakeupNameList
        })
    }
    _handleCancel = () => {
        browserHistory.push('/value-added-features/wakeupService')
    }
    _gotoPromptOk = () => {
        browserHistory.push('/pbx-settings/voicePrompt/2')
    }
    _gotoPrompt = () => {
        const { formatMessage } = this.props.intl
        const __this = this

        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG28"})})}}></span>,
            onOk() {
                __this._gotoPromptOk()
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _onCustomChange = (e) => {
        if (!e.target.checked) {
            this.setState({
                dateShow: true,
                weekShow: false
            })
        } else {
            this.setState({
                dateShow: false,
                weekShow: true
            })
        }
    }
    _onWeekallChange = (e) => {
        let checkedList = []
        let plainOptions = this.state.plainOptions

        plainOptions.map(function(item) {
            checkedList.push(item.value)
        })

        this.setState({
            weekList: e.target.checked ? checkedList : [],
            weekAll: e.target.checked
        })

        global.wakeupServiceItemCheckCustomWeek = true
        // this.props.form.validateFields(["custom"], {force: true})
    }
    _onChangeWeek = (checkedList) => {
        const plainOptions = this.state.plainOptions

        this.setState({
            weekList: checkedList,
            weekAll: checkedList.length === plainOptions.length
        })

        global.wakeupServiceItemCheckCustomWeek = true
        // this.props.form.validateFields(["custom"], {force: true})
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const { formatMessage } = this.props.intl
        const wakeupServiceId = this.props.params.id
        const wakeupServiceName = this.props.params.name

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        let errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = {}

                action.wakeup_name = values.wakeup_name
                action.extension = values.extension
                action.wakeup_enable = values.wakeup_enable ? 1 : 0
                action.prompt = values.prompt
                action.time = values.time.format('HH:mm')
                action.execute_status = values.execute_status

                if (values.custom) {
                    if (this.state.weekList.length === 0) {
                        message.error(formatMessage({id: "LANG3531"}, {0: 1, 1: formatMessage({id: "LANG243"})}))

                        return
                    }
                    action.custom_date = this.state.weekList.sort().join(',')
                } else {
                    action.custom_date = values.custom_date.format('YYYY-MM-DD')
                }

                if (wakeupServiceId) {
                    action.action = 'updateWakeupSchedule'
                    action.wakeup_index = wakeupServiceId
                    action.answer_status = 'no_handle'
                } else {
                    action.action = 'addWakeupSchedule'
                }

                $.ajax({
                    data: action,
                    type: 'post',
                    url: api.apiHost,
                    error: function(e) {
                        message.error(e.statusText)
                    },
                    success: function(data) {
                        const bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                        if (bool) {
                            message.destroy()
                            message.success(successMessage)
                        }

                        this._handleCancel()
                    }.bind(this)
                })
            }
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
    _checkExecuted = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && value === 'executed') {
            callback(formatMessage({id: "LANG4959"}, {0: formatMessage({id: "LANG4870"})}))
        } else {
            callback()
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let htmlPrivilege = JSON.parse(localStorage.getItem('html_privilege'))
        let promptPrivilege = htmlPrivilege.voicePrompt === 1

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemPromptLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        if (global.wakeupServiceItemCheckCustomWeek) {
            this.props.form.validateFields(["custom"], {force: true})

            global.wakeupServiceItemCheckCustomWeek = false
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG4858"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4858"})}))

        const wakeupServiceItem = this.state.wakeupServiceItem || {}
        const name = wakeupServiceItem.wakeup_name
        const plainOptions = this.state.plainOptions
        const checkedList = this.state.weekList

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
                    isDisplay='display-block'
                />
                <div className="content">
                    <Form>
                        <FormItem
                            ref="div_wakeup_enable"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5196" /> }>
                                    <span>{ formatMessage({id: "LANG5196"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('wakeup_enable', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: wakeupServiceItem.wakeup_enable !== undefined ? wakeupServiceItem.wakeup_enable === 1 : true
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_wakeup_name"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG135" /> }>
                                    <span>{ formatMessage({id: "LANG135"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('wakeup_name', {
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
                                        Validator.letterDigitUndHyphen(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkName
                                }],
                                initialValue: wakeupServiceItem.wakeup_name
                            })(
                                <Input placeholder={ formatMessage({id: "LANG135"}) } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_extension"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG85" /> }>
                                    <span>{ formatMessage({id: "LANG85"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('extension', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                initialValue: wakeupServiceItem.extension ? wakeupServiceItem.extension : (this.state.accountList.length > 0 ? this.state.accountList[0].extension : "")
                            })(
                                <Select>
                                    <Option key={ '' } value={ '' }>
                                        { formatMessage({id: "LANG133"}) }
                                    </Option>
                                    {
                                        this.state.accountList.map(function(item) {
                                            return <Option
                                                    key={ item.extension }
                                                    value={ item.extension }
                                                    disabled={ item.out_of_service === 'yes' }>
                                                    { item.extension + (item.fullname ? ' "' + item.fullname + '"' : '') }
                                                </Option>
                                            }
                                        )
                                    }
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_prompt"
                            { ...formItemPromptLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG1484" /> }>
                                    <span>{ formatMessage({id: "LANG1484"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Row>
                                <Col span={ 16 }>
                                    { getFieldDecorator('prompt', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }],
                                        width: 100,
                                        initialValue: wakeupServiceItem.prompt ? wakeupServiceItem.prompt : "wakeup-call"
                                    })(
                                        <Select>
                                            {
                                                this.state.fileList.map(function(item) {
                                                    return <Option
                                                            key={ item.text }
                                                            value={ item.val }>
                                                            { item.text }
                                                        </Option>
                                                    }
                                                )
                                            }
                                        </Select>
                                    ) }
                                </Col>
                                <Col span={ 6} offset={ 1 } className={ promptPrivilege ? 'display-block' : 'hidden' }>
                                    <a className="prompt_setting" onClick={ this._gotoPrompt } >{ formatMessage({id: "LANG1484"}) }</a>
                                </Col>
                            </Row>
                        </FormItem>
                        <FormItem
                            ref="div_custom"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG203" /> }>
                                    <span>{ formatMessage({id: "LANG5198"}, { 0: formatMessage({id: "LANG203"}) }) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('custom', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: this._checkWeek
                                }],
                                valuePropName: 'checked',
                                initialValue: this.state.customDateCheck
                            })(
                                <Checkbox onChange={ this._onCustomChange } />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_custom_date"
                            className={ this.state.dateShow ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG203" /> }>
                                    <span>{ formatMessage({id: "LANG203"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('custom_date', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: this.state.dateShow ? true : false,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: wakeupServiceItem.custom_date ? moment(wakeupServiceItem.custom_date, "YYYY-MM-DD") : null
                            })(
                                <DatePicker />
                            )}
                        </FormItem>
                        <FormItem
                            ref="div_weekBox"
                            className={ this.state.weekShow ? "display-block" : "hidden" }
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG203" /> }>
                                    <span>{ formatMessage({id: "LANG203"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <CheckboxGroup options={ plainOptions } value={ checkedList } onChange={ this._onChangeWeek } />
                            <Col span={ 2 }>
                                 <Checkbox checked={ this.state.weekAll } onChange={ this._onWeekallChange } />
                            </Col>
                            <Col span={ 6 }>{ formatMessage({id: "LANG104"}) }</Col>
                        </FormItem>
                        <FormItem
                            ref="div_time"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG247" /> }>
                                    <span>{ formatMessage({id: "LANG247"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('time', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{ type: 'object',
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: wakeupServiceItem.time ? moment(wakeupServiceItem.time, "HH:mm") : null
                            })(
                                <TimePicker showTime format="HH:mm" />
                            )}
                        </FormItem>
                        <FormItem
                            ref="div_execute_status"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG4871" /> }>
                                    <span>{ formatMessage({id: "LANG4871"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('execute_status', {
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkExecuted
                                }],
                                width: 100,
                                initialValue: wakeupServiceItem.execute_status ? wakeupServiceItem.execute_status : "set"
                            })(
                                <Select>
                                    <Option value="set">{ formatMessage({id: "LANG4869"}) }</Option>
                                    <Option value="executed">{ formatMessage({id: "LANG4870"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(WakeupServiceItem))
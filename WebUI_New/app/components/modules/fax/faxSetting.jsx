'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Row, Col, Form, Input, message, Transfer, Tooltip, Modal, Checkbox, Select } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class FaxItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            faxSetting: {}
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.groupNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _checkRate = (rule, value, callback) => {
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form

        const maxrate = parseInt(getFieldValue('maxrate'))
        const minrate = parseInt(value)

        if (minrate >= maxrate) {
            callback(formatMessage({id: "LANG2165"}, {0: formatMessage({id: "LANG1266"}), 1: formatMessage({id: "LANG1264"})}))
        } else {
            callback()
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        let faxSetting = {}

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getFaxsettings',
                ecm: '',
                maxrate: '',
                minrate: '',
                maxcomplicating: '',
                queuemaxmember: '',
                local_station_id: '',
                default_email: ''
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    faxSetting = res.response.fax_settings || {}
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            faxSetting: faxSetting
        })
    }
    _gotoEmailTemplate = () => {
        const { formatMessage } = this.props.intl
        const __this = this
        confirm({
            content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG4576"})})}} ></span>,
            onOk() {
                browserHistory.push('/system-settings/emailSettings/template')
            },
            onCancel() {},
            okText: formatMessage({id: "LANG727"}),
            cancelText: formatMessage({id: "LANG726"})
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/fax')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = values
                action.action = 'updateFaxsettings'
                action.ecm = values.ecm === true ? "yes" : "no"

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
                    type: 'json',
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
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 6 }
        }
        const formItemGotoLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 9 }
        }

        const title = formatMessage({id: "LANG753"})

        const faxSetting = this.state.faxSetting || {}

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
                            ref="div_ecm"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1263" />}>
                                    <span>{formatMessage({id: "LANG1262"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('ecm', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                valuePropName: 'checked',
                                width: 100,
                                initialValue: (faxSetting.ecm === "yes" ? true : false)
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_maxrate"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1265" />}>
                                    <span>{formatMessage({id: "LANG1264"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('maxrate', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                initialValue: faxSetting.maxrate ? faxSetting.maxrate : "14400"
                            })(
                                <Select>
                                    <Option value="2400">2400</Option>
                                    <Option value="4800">4800</Option>
                                    <Option value="7200">7200</Option>
                                    <Option value="9600">9600</Option>
                                    <Option value="12000">12000</Option>
                                    <Option value="14400">14400</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_minrate"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1267" />}>
                                    <span>{formatMessage({id: "LANG1266"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('minrate', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkRate
                                }],
                                width: 100,
                                initialValue: faxSetting.minrate ? faxSetting.minrate : "4800"
                            })(
                                <Select>
                                    <Option value="2400">2400</Option>
                                    <Option value="4800">4800</Option>
                                    <Option value="7200">7200</Option>
                                    <Option value="9600">9600</Option>
                                    <Option value="12000">12000</Option>
                                    <Option value="14400">14400</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_maxcomplicating"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4304" />}>
                                    <span>{formatMessage({id: "LANG4302"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('maxcomplicating', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                initialValue: faxSetting.maxcomplicating ? faxSetting.maxcomplicating + '' : '1'
                            })(
                                <Select>
                                    <Option value="1">only</Option>
                                    <Option value="2">more</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_queuemaxmember"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4305" />}>
                                    <span>{formatMessage({id: "LANG4303"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('queuemaxmember', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                initialValue: faxSetting.queuemaxmember ? faxSetting.queuemaxmember : "6"
                            })(
                                <Select>
                                    <Option value="6">6</Option>
                                    <Option value="7">7</Option>
                                    <Option value="8">8</Option>
                                    <Option value="9">9</Option>
                                    <Option value="10">10</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_local_station_id"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG5086" />}>
                                    <span>{formatMessage({id: "LANG5085"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('local_station_id', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        Validator.specialauthid(data, value, callback, formatMessage)
                                    }
                                }],
                                width: 100,
                                initialValue: faxSetting.local_station_id ? faxSetting.local_station_id : ""
                            })(
                                <Input maxLength="128" />
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_default_email"
                            { ...formItemGotoLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1261" />}>
                                    <span>{formatMessage({id: "LANG1260"})}</span>
                                </Tooltip>
                            )}>
                            <Row>
                                <Col span={ 16 }>
                                { getFieldDecorator('default_email', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.email(data, value, callback, formatMessage)
                                        }
                                    }],
                                    width: 100,
                                    initialValue: faxSetting.default_email ? faxSetting.default_email : ""
                                })(
                                    <Input maxLength="128" />
                                ) }
                                </Col>
                                <Col span={ 6 } offset={ 1 } >
                                    <a className="prompt_setting" onClick={ this._gotoEmailTemplate } >{ formatMessage({id: "LANG4576"}) }</a>
                                </Col>
                            </Row>
                        </FormItem>
                        
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(FaxItem))

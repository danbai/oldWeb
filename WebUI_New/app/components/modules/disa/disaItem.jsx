'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Form, Input, message, Checkbox, Tooltip, Select } from 'antd'

const Option = Select.Option
const FormItem = Form.Item

class DISAItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            disaNameList: [],
            disaItem: {
                permission: 'internal',
                digit_timeout: 5,
                response_timeout: 10
            }
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.disaNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        let disaNameList = []
        let disaItem = {}
        const { formatMessage } = this.props.intl
        const disaId = this.props.params.id
        const disaName = this.props.params.name

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getDISANameList' },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    let response = res.response || {}
                    disaNameList = response.display_name || []
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
        if (disaName) {
            disaNameList = _.without(disaNameList, disaName)
        }

        this.setState({
            disaNameList: disaNameList
        })

        if (disaId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getDISA',
                    disa: disaId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        disaItem = res.response.disa || {}
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })

            this.setState({
                disaItem: disaItem 
        })
        }
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/disa')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const disaId = this.props.params.id

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

                if (action.hangup === true) {
                    action.hangup = "yes"  
                } else {
                    action.hangup = "no" 
                }
                if (action.replace_caller_id === true) {
                    action.replace_caller_id = "yes"  
                } else {
                    action.replace_caller_id = "no" 
                }

               if (disaId) {
                    action.action = 'updateDISA'
                    action.disa = disaId
                } else {
                    action.action = 'addDISA'
                }

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
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const disaItem = this.state.disaItem || {}
        const name = disaItem.display_name

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 6 }
        }

        const formItemTransferLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG2353"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG2355"}))

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
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2356" /> }>
                                        <span>{ formatMessage({id: "LANG135"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('display_name', {
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
                                initialValue: name
                            })(
                                <Input placeholder={ formatMessage({id: "LANG135"}) } maxLength="32" />
                            ) }
                        </FormItem>          
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2357" /> }>
                                        <span>{ formatMessage({id: "LANG73"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('password', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: (data, value, callback) => {
                                       Validator.minlength(data, value, callback, formatMessage, 4)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                       Validator.maxlength(data, value, callback, formatMessage, 32)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.digits(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.checkNumericPw(data, value, callback, formatMessage)
                                    }
                                }],
                                initialValue: this.state.disaItem.password
                            })(
                                <Input maxLength="40" />
                            ) }
                        </FormItem>       
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1070" /> }>
                                        <span>{ formatMessage({id: "LANG1069"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('permission', {
                                rules: [],
                                initialValue: this.state.disaItem.permission
                            })(
                                <Select style={{ width: 200 }}>
                                    <Option value='internal'>{formatMessage({id: "LANG1071"})}</Option>
                                    <Option value='internal-local'>{formatMessage({id: "LANG1072"})}</Option>
                                    <Option value='internal-local-national'>{formatMessage({id: "LANG1073"})}</Option>
                                    <Option value='internal-local-national-international'>{formatMessage({id: "LANG1074"})}</Option>
                                </Select>
                            ) }
                        </FormItem> 
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2359" /> }>
                                        <span>{ formatMessage({id: "LANG2358"}) }</span>
                                    </Tooltip>
                                </span>
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
                                        Validator.range(data, value, callback, formatMessage, 3, 180)
                                    }
                                }],
                                initialValue: this.state.disaItem.response_timeout
                            })(
                                <Input min={3} max={180} maxLength="3" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2361" /> }>
                                        <span>{ formatMessage({id: "LANG2360"}) }</span>
                                    </Tooltip>
                                </span>
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
                                        Validator.range(data, value, callback, formatMessage, 1, 10)
                                    }
                                }],
                                initialValue: this.state.disaItem.digit_timeout
                            })(
                                <Input min={1} max={10} maxLength="2" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2364" /> }>
                                        <span>{ formatMessage({id: "LANG2363"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('hangup', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: this.state.disaItem.hangup === "yes" ? true : false
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG5076" /> }>
                                        <span>{ formatMessage({id: "LANG5071"}) }</span>
                                    </Tooltip>
                                </span>
                            )}>
                            { getFieldDecorator('replace_caller_id', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: this.state.disaItem.replace_caller_id === "yes" ? true : false
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(DISAItem))
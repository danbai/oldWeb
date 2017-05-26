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
import { Form, Input, message, Transfer, Tooltip } from 'antd'

const FormItem = Form.Item

class AgentLoginSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            queueList: [],
            pureNumberList: [],
            agentLoginSettings: {},
            otherInput: {
                queuelogin: 'queuelogout',
                queuelogout: 'queuelogin'
            }
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkNumber = (rule, value, callback) => {
        let result = true
        const { formatMessage } = this.props.intl

        if (value && (value !== this.state.agentLoginSettings[rule.field])) {
            $.each(this.state.queueList, function(index, data) {
                if (($.inArray((data + value), this.state.pureNumberList) > -1)) {
                    result = false
                    return true
                }
            }.bind(this))
        }

        if (!result) {
            callback(formatMessage({id: "LANG2126"}))
        } else {
            callback()
        }
    }
    _checkRequired = (rule, value, callback) => {
        let otherInputValue = ''
        const form = this.props.form
        const { formatMessage } = this.props.intl

        otherInputValue = form.getFieldValue(this.state.otherInput[rule.field])

        if (otherInputValue && !value) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    _getInitData = () => {
        let queueList = []
        let pureNumberList = []
        let agentLoginSettings = {}
        const { formatMessage } = this.props.intl

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getQueueSettings'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    agentLoginSettings = response.queue_settings || {}
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getNumberList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const numberList = response.number || []

                    pureNumberList = $.grep(numberList, function(n, i) {
                        return !isNaN(Number(n))
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getQueueList'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const queues = response.queues || []

                    queues.map(function(item) {
                        queueList.push(item.extension)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        this.setState({
            queueList: queueList,
            pureNumberList: pureNumberList,
            agentLoginSettings: agentLoginSettings
        })
    }
    _handleCancel = () => {
        browserHistory.push('/call-features/callQueue')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const extensionGroupId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>

        this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = values

                action.action = 'updateQueueSettings'

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
    _onFocus = (e) => {
        e.preventDefault()

        const form = this.props.form

        form.validateFields([e.target.id], { force: true })
    }
    render() {
        let loginContent
        let logoutContent
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const title = formatMessage({id: "LANG748"})
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 8 }
        }

        const agentLoginSettings = this.state.agentLoginSettings || {}
        const queuelogin = agentLoginSettings.queuelogin
        const queuelogout = agentLoginSettings.queuelogout

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        loginContent = <FormattedHTMLMessage
                    id="LANG1193"
                    defaultMessage="LANG1193"
                />
        logoutContent = <FormattedHTMLMessage
                    id="LANG1195"
                    defaultMessage="LANG1195"
                />

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
                                    <Tooltip title={ loginContent }>
                                        <span>{ formatMessage({id: "LANG1192"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('queuelogin', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        const otherInputValue = form.getFieldValue('queuelogout')

                                        Validator.required(data, value, callback, formatMessage, true, otherInputValue)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 10)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.numeric_pound_star(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        const otherInputValue = form.getFieldValue('queuelogout')
                                        const otherInputLabel = formatMessage({id: "LANG1194"})

                                        Validator.notEqualTo(data, value, callback, formatMessage, otherInputValue, otherInputLabel)
                                    }
                                }, {
                                    validator: this._checkNumber
                                }],
                                initialValue: queuelogin
                            })(
                                <Input onFocus={ this._onFocus } />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ logoutContent }>
                                        <span>{ formatMessage({id: "LANG1194"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('queuelogout', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    validator: (data, value, callback) => {
                                        const otherInputValue = form.getFieldValue('queuelogin')

                                        Validator.required(data, value, callback, formatMessage, true, otherInputValue)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.maxlength(data, value, callback, formatMessage, 10)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        Validator.numeric_pound_star(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: (data, value, callback) => {
                                        const otherInputValue = form.getFieldValue('queuelogin')
                                        const otherInputLabel = formatMessage({id: "LANG1192"})

                                        Validator.notEqualTo(data, value, callback, formatMessage, otherInputValue, otherInputLabel)
                                    }
                                }, {
                                    validator: this._checkNumber
                                }],
                                initialValue: queuelogout
                            })(
                                <Input onFocus={ this._onFocus } />
                            ) }
                        </FormItem>
                        {/* <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1170" /> }>
                                        <span>{ formatMessage({id: "LANG1169"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('pin', {
                                rules: [],
                                initialValue: agentLoginSettings.pin
                            })(
                                <Input />
                            ) }
                        </FormItem> */}
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG261"}) }>
                                        <span>{ formatMessage({id: "LANG261"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <FormattedHTMLMessage
                                id="LANG1196"
                                defaultMessage="LANG1196"
                            />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(AgentLoginSettings))
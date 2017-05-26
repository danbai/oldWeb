'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Button, Checkbox, Form, Input, message, Tooltip, Popconfirm, Select, Row, Col } from 'antd'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

const FormItem = Form.Item
const Option = Select.Option

class AutoDownload extends Component {
    constructor(props) {
        super(props)
        this.state = {
            enable: false,
            weekVisible: 'hidden',
            monthVisible: 'hidden'
        }
    }
    componentDidMount() {
        this._getDownloadSettings()
    }
    _getDownloadSettings = () => {
        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: { action: 'getCDR2EmailSettings' },
            type: 'json',
            async: false,
            success: function(res) {
                let response = res.response || {}
                let cdr2emailSettings = response.cdr2email_settings || {}
                let time = cdr2emailSettings.time

                this._onTimeChange(time)

                this.setState({
                    cdr2emailSettings: cdr2emailSettings,
                    enable: (cdr2emailSettings.enable === 'yes')
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onEnableChange = (e) => {
        this.setState({
            enable: e.target.checked
        })
    }
    _onTimeChange = (value) => {
        if (value === 'month') {
            this.setState({
                monthVisible: 'inline-block',
                weekVisible: 'hidden'
            })
        } else if (value === 'week') {
            this.setState({
                monthVisible: 'hidden',
                weekVisible: 'inline-block'
            })
        } else {
            this.setState({
                monthVisible: 'hidden',
                weekVisible: 'hidden'
            })
        }
    }
    _emailConfirm = () => {
        browserHistory.push('/system-settings/emailSettings/template')
    }
    _handleCancel = () => {
        browserHistory.push('/cdr/cdr')
    }
    _handleSubmit = () => {
        const { formatMessage } = this.props.intl

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(formatMessage({ id: "LANG826" }), 0)

                let action = values

                action.action = 'updateCDR2EmailSettings'
                action.enable = (action.enable ? 'yes' : 'no')

                $.ajax({
                    url: api.apiHost,
                    method: "post",
                    data: action,
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
                                data: {
                                    'action': 'reloadCrontabs',
                                    'crontabjobs': ''
                                },
                                type: 'json',
                                error: function(e) {
                                    message.error(e.statusText)
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                    if (bool) {
                                        message.destroy()
                                        message.success(formatMessage({ id: "LANG844" }))
                                    }
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 21 }
        }
        const formItemLayoutSel = {
            labelCol: { span: 3 },
            wrapperCol: { span: 21 }
        }

        const monthChildren = []
        for (let i = 1; i <= 28; i++) {
            monthChildren.push(<Option key={ i }>{ i }</Option>)
        }

        const hourChildren = []
        for (let i = 0; i <= 23; i++) {
            hourChildren.push(<Option key={ i }>{ i }</Option>)
        }

        let cdr2emailSettings = this.state.cdr2emailSettings || {}
        let enable = (cdr2emailSettings.enable === 'yes')
        let time = cdr2emailSettings.time
        let day_of_week = cdr2emailSettings.day_of_week + ''
        let day_of_month = cdr2emailSettings.day_of_month + ''
        let hour = cdr2emailSettings.hour + ''
        let email = cdr2emailSettings.email

        document.title = formatMessage({id: "LANG584"}, {0: model_info.model_name, 1: formatMessage({id: "LANG3955"})})

        return (
            <div className="app-content-main app-content-auto-download">
                <Title headerTitle={ formatMessage({id: "LANG3955"}) } onSubmit={ this._handleSubmit } onCancel={ this._handleCancel } isDisplay='display-block' />
                <Form>
                    <div
                        className="lite-desc"
                        dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3959" }, {0: formatMessage({id: "LANG64"})})}}
                    >
                    </div>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG3955"}) }>
                                    <span>{ formatMessage({id: "LANG3955"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('enable', {
                            valuePropName: 'checked',
                            initialValue: enable
                        })(
                            <Checkbox onClick={ this._onEnableChange } />
                        ) }
                    </FormItem>
                    <Row>
                        <FormItem
                            { ...formItemLayoutSel }
                            label={(
                                <span>
                                    <Tooltip title={ formatMessage({id: "LANG3957"}) }>
                                        <span>{ formatMessage({id: "LANG3956"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('time', {
                                initialValue: time
                            })(
                                <Select style={{ width: 128, marginRight: 10 }} 
                                    disabled={ !this.state.enable }
                                    onChange={ this._onTimeChange }
                                >
                                    <Option value="day">{ formatMessage({id: "LANG200"}) }</Option>
                                    <Option value="week">{ formatMessage({id: "LANG199"}) }</Option>
                                    <Option value="month">{ formatMessage({id: "LANG198"}) }</Option>
                                </Select>
                            ) }
                            { getFieldDecorator('day_of_week', {
                                initialValue: day_of_week
                            })(
                                <Select
                                    style={{ width: 128, marginRight: 10 }}
                                    disabled={ !this.state.enable }
                                    className={ this.state.weekVisible }
                                >
                                    <Option value="0">{ formatMessage({id: "LANG250"}) }</Option>
                                    <Option value="1">{ formatMessage({id: "LANG251"}) }</Option>
                                    <Option value="2">{ formatMessage({id: "LANG252"}) }</Option>
                                    <Option value="3">{ formatMessage({id: "LANG253"}) }</Option>
                                    <Option value="4">{ formatMessage({id: "LANG254"}) }</Option>
                                    <Option value="5">{ formatMessage({id: "LANG255"}) }</Option>
                                    <Option value="6">{ formatMessage({id: "LANG256"}) }</Option>
                                </Select>
                            ) }
                            { getFieldDecorator('day_of_month', {
                                initialValue: day_of_month
                            })(
                                <Select
                                    style={{ width: 128, marginRight: 10 }}
                                    disabled={ !this.state.enable }
                                    className={ this.state.monthVisible }
                                >
                                    { monthChildren }
                                </Select>
                            ) }
                            { getFieldDecorator('hour', {
                                initialValue: hour
                            })(
                                <Select
                                    style={{ width: 128 }}
                                    disabled={ !this.state.enable }
                                >
                                    {hourChildren}
                                </Select>
                            ) }
                        </FormItem>
                    </Row>
                    <FormItem
                        { ...formItemLayout }
                        label={(
                            <span>
                                <Tooltip title={ formatMessage({id: "LANG4546"}) }>
                                    <span>{ formatMessage({id: "LANG2032"}) }</span>
                                </Tooltip>
                            </span>
                        )}
                    >
                        { getFieldDecorator('email', {
                            getValueFromEvent: (e) => {
                                return UCMGUI.toggleErrorMessage(e)
                            },
                            rules: [{
                                required: this.state.enable,
                                message: formatMessage({id: "LANG2150"})
                            }, {
                                validator: (data, value, callback) => {
                                    this.state.enable ? Validator.multiEmail(data, value, callback, formatMessage) : callback()
                                }
                            }],
                            initialValue: email
                        })(
                            <Input style={{ width: 408, marginRight: 10 }} disabled={ !this.state.enable } />
                        ) }
                        <Popconfirm
                            onConfirm={ this._emailConfirm }
                            okText={ formatMessage({id: "LANG136"}) }
                            cancelText={ formatMessage({id: "LANG137"}) }
                            title={ <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG843" }, {0: formatMessage({id: "LANG4572"})})}}></span> }
                        >
                            <a href="#">{ formatMessage({id: "LANG4572"}) }</a>
                        </Popconfirm>
                    </FormItem>
                </Form>
            </div>
        )
    }
}

export default Form.create()(injectIntl(AutoDownload))
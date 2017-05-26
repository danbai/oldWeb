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
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Select, DatePicker, TimePicker } from 'antd'

const FormItem = Form.Item
const Option = Select.Option

class WakeupItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roomList: [],
            availableList: [],
            wakeupItem: {},
            time_minute: "",
            time_hour: ""
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkAction = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && value === '2') {
            callback(formatMessage({id: "LANG4959"}, {0: formatMessage({id: "LANG4870"})}))
        } else {
            callback()
        }
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.groupNameList, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
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
    _getInitData = () => {
        const wakeupId = this.props.params.id
        const wakeupName = this.props.params.name
        let roomList = []
        let availableList = []
        let usedList = []
        let time_all = []
        let wakeupItem = {}

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listPMSRoom',
                options: 'room,status',
                sidx: 'room',
                sord: 'asc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    roomList = response.pms_room
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
                action: 'listWakeUp',
                options: 'room',
                sidx: 'room',
                sord: 'asc'
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}

                    usedList = response.pms_wakeup
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        roomList.map(function(item) {
            let found = 0
            usedList.map(function(item2) {
                if (item.room === item2.room && found === 0) {
                    found = 1
                }
            })
            if (found === 0) {
                availableList.push(item)
            }
        })

        if (wakeupId) {
            $.ajax({
                url: api.apiHost,
                method: 'post',
                data: {
                    action: 'getPMSWakeUp',
                    address: wakeupId
                },
                type: 'json',
                async: false,
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        wakeupItem = res.response.address || {}
                        if (wakeupItem.time) {
                            time_all = wakeupItem.time
                        }
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        this.setState({
            roomList: roomList,
            availableList: availableList,
            time_hour: time_all[0] + time_all[1],
            time_minute: time_all[2] + time_all[3],
            wakeupItem: wakeupItem
        })
    }
    _handleCancel = () => {
        browserHistory.push('/value-added-features/pms/3')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const wakeupId = this.props.params.id

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG826" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG4764" })}}></span>
        errorMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG4762"}, {
                    0: formatMessage({id: "LANG85"}).toLowerCase()
                })}}></span>

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                message.loading(loadingMessage)

                let action = {}

                action.w_action = values.w_action
                action.w_type = values.w_type
                action.w_date = values.w_date.format("YYYYMMDD")
                action.w_time = values.w_time.format("HHmm")
                action.send_status = 1

                if (wakeupId) {
                    action.action = 'updatePMSWakeUp'
                    action.address = wakeupId
                } else {
                    action.action = 'addPMSWakeUp'
                    action.room = values.room
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
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

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
                    0: formatMessage({id: "LANG4858"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG4858"}) }))

        const wakeupItem = this.state.wakeupItem || {}

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
                            ref="div_room"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4854" />}>
                                    <span>{formatMessage({id: "LANG4854"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('room', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                width: 100,
                                initialValue: wakeupItem.address ? wakeupItem.address : (this.state.availableList.length > 0 ? this.state.availableList[0].room : "")
                            })(
                                <Select disabled={ this.props.params.id ? true : false }>
                                    {
                                        this.state.availableList.map(function(item) {
                                            return <Option
                                                    key={ item.room }
                                                    value={ item.room }>
                                                    { item.room }
                                                </Option>
                                            }
                                        ) 
                                    }
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_w_date"
                            className={ this.state.dateShow }
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG203" />}>
                                    <span>{formatMessage({id: "LANG203"}) }</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('w_date', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{ type: 'object',
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: wakeupItem.w_date ? moment(wakeupItem.w_date, "YYYYMMDD") : null
                            })(
                                <DatePicker format="YYYY-MM-DD"/>
                            )}
                        </FormItem>
                        <FormItem
                            ref="div_w_time"
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG247" />}>
                                    <span>{formatMessage({id: "LANG247"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('w_time', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{ type: 'object',
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }],
                                initialValue: wakeupItem.w_time ? moment(wakeupItem.w_time, "HHmm") : null
                            })(
                                <TimePicker showTime format="HH:mm"/>
                            )}
                        </FormItem>
                        <FormItem
                            ref="div_w_action"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG4871" />}>
                                    <span>{formatMessage({id: "LANG4871"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('w_action', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [{
                                    required: true,
                                    message: formatMessage({id: "LANG2150"})
                                }, {
                                    validator: this._checkAction
                                }],
                                width: 100,
                                initialValue: wakeupItem.w_action ? wakeupItem.w_action : "1"
                            })(
                                <Select>
                                    <Option value="1">{ formatMessage({id: "LANG4869"}) }</Option>
                                    <Option value="0">{ formatMessage({id: "LANG4868"}) }</Option>
                                    <Option value="2">{ formatMessage({id: "LANG4870"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                        <FormItem
                            ref="div_w_type"
                            { ...formItemLayout }

                            label={(
                                <Tooltip title={<FormattedHTMLMessage id="LANG1950" />}>
                                    <span>{formatMessage({id: "LANG1950"})}</span>
                                </Tooltip>
                            )}>
                            { getFieldDecorator('w_type', {
                                rules: [],
                                required: true,
                                width: 100,
                                initialValue: wakeupItem.w_type ? wakeupItem.w_type : "1"
                            })(
                                <Select>
                                    <Option value="1">{ formatMessage({id: "LANG4866"}) }</Option>
                                    <Option value="2">{ formatMessage({id: "LANG4867"}) }</Option>
                                </Select>
                            ) }
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(WakeupItem))
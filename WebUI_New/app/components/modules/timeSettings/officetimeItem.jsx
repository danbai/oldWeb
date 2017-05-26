'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

import moment from "moment"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl, FormattedHTMLMessage, formatMessage } from 'react-intl'
import { Col, Form, Input, message, Transfer, Tooltip, Checkbox, Row, Select, TimePicker } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const addZero = UCMGUI.addZero
const CheckboxGroup = Checkbox.Group

class OfficeTimeItem extends Component {
    constructor(props) {
        super(props)

        let { formatMessage } = this.props.intl

        let weekOptions = [{
                    value: 'sun',
                    label: formatMessage({id: "LANG250"})
                }, {
                    value: 'mon',
                    label: formatMessage({id: "LANG251"})
                }, {
                    value: 'tue',
                    label: formatMessage({id: "LANG252"})
                }, {
                    value: 'wed',
                    label: formatMessage({id: "LANG253"})
                }, {
                    value: 'thu',
                    label: formatMessage({id: "LANG254"})
                }, {
                    value: 'fri',
                    label: formatMessage({id: "LANG255"})
                }, {
                    value: 'sat',
                    label: formatMessage({id: "LANG256"})
                }]

        let monthOptions = [{
                    value: 'jan',
                    label: formatMessage({id: "LANG204"}, {0: ''})
                }, {
                    value: 'feb',
                    label: formatMessage({id: "LANG205"}, {0: ''})
                }, {
                    value: 'mar',
                    label: formatMessage({id: "LANG206"}, {0: ''})
                }, {
                    value: 'apr',
                    label: formatMessage({id: "LANG207"}, {0: ''})
                }, {
                    value: 'may',
                    label: formatMessage({id: "LANG208"}, {0: ''})
                }, {
                    value: 'jun',
                    label: formatMessage({id: "LANG209"}, {0: ''})
                }, {
                    value: 'jul',
                    label: formatMessage({id: "LANG210"}, {0: ''})
                }, {
                    value: 'aug',
                    label: formatMessage({id: "LANG211"}, {0: ''})
                }, {
                    value: 'sep',
                    label: formatMessage({id: "LANG212"}, {0: ''})
                }, {
                    value: 'oct',
                    label: formatMessage({id: "LANG213"}, {0: ''})
                }, {
                    value: 'nov',
                    label: formatMessage({id: "LANG214"}, {0: ''})
                }, {
                    value: 'dec',
                    label: formatMessage({id: "LANG215"}, {0: ''})
                }]

        let dayOptions = []

        for (let i = 1; i < 32; i++) {
            let value = i.toString()

            dayOptions.push({
                    value: value,
                    label: value
                })
        }

        this.state = {
            dayOptions: dayOptions,
            weekOptions: weekOptions,
            monthOptions: monthOptions,
            dayOptionsSelected: [],
            weekOptionsSelected: [],
            monthOptionsSelected: [],
            time_conditions_officetime: {},
            endtime: {},
            starttime: {}
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _forceEndTime = (rule, val, callback) => {
        this.props.form.validateFields(["endtime"], {force: true})
    }
    _forceStartTime = (rule, val, callback) => {
        this.props.form.validateFields(["starttime"], {force: true})
    }
    _checkTimeEnd = (rule, val, callback) => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let starttime = this.state.starttime && JSON.stringify(starttime) !== "{}" ? this.state.starttime : form.getFieldValue('starttime')
        let endtime = val// form.getFieldValue('endtime')

        if (JSON.stringify(starttime) !== "{}" && starttime && endtime) {
            starttime = starttime.format('HH:mm').split(':')
            endtime = endtime.format('HH:mm').split(':')

            let stime_hour = parseInt(starttime[0])
            let stime_min = parseInt(starttime[1])
            let ftime_hour = parseInt(endtime[0])
            let ftime_min = parseInt(endtime[1])

            if (stime_hour * 60 + stime_min >= ftime_hour * 60 + ftime_min) {
                callback(formatMessage({id: "LANG4024"}, {0: formatMessage({id: "LANG184"}), 1: formatMessage({id: "LANG169"})}))
            } else {
                callback()
            }
        } else {
            callback()
        }
    }
    _checkTimeStart = (rule, val, callback) => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let starttime = val // form.getFieldValue('starttime')
        let endtime = this.state.endtime && JSON.stringify(endtime) !== "{}" ? this.state.endtime : form.getFieldValue('endtime')

        if (JSON.stringify(endtime) !== "{}" && starttime && endtime) {
            starttime = starttime.format('HH:mm').split(':')
            endtime = endtime.format('HH:mm').split(':')

            let stime_hour = parseInt(starttime[0])
            let stime_min = parseInt(starttime[1])
            let ftime_hour = parseInt(endtime[0])
            let ftime_min = parseInt(endtime[1])

            if (stime_hour * 60 + stime_min >= ftime_hour * 60 + ftime_min) {
                callback(formatMessage({id: "LANG4024"}, {0: formatMessage({id: "LANG184"}), 1: formatMessage({id: "LANG169"})}))
            } else {
                callback()
            }
        } else {
            callback()
        }
    }
    _filterTransferOption = (inputValue, option) => {
        return (option.title.indexOf(inputValue) > -1)
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl

        let mode = false
        let dayOptionsSelected = []
        let weekOptionsSelected = []
        let monthOptionsSelected = []
        let timeId = this.props.params.id
        let time_conditions_officetime = this.state.time_conditions_officetime || {}

        if (timeId) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getTimeConditionOfficeTime',
                    time_conditions_officetime: timeId
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        time_conditions_officetime = response.time_conditions_officetime

                        mode = time_conditions_officetime.mode === 'byDay'
                        dayOptionsSelected = time_conditions_officetime.day === '*' ? [] : time_conditions_officetime.day.split('&')
                        weekOptionsSelected = time_conditions_officetime.week_day === '*' ? [] : time_conditions_officetime.week_day.split('&')
                        monthOptionsSelected = time_conditions_officetime.month === '*' ? [] : time_conditions_officetime.month.split('&')
                    }
                }.bind(this),
                error: function(e) {
                    message.error(e.statusText)
                }
            })
        }

        this.setState({
            mode: mode,
            dayOptionsSelected: dayOptionsSelected,
            weekOptionsSelected: weekOptionsSelected,
            monthOptionsSelected: monthOptionsSelected,
            time_conditions_officetime: time_conditions_officetime
        })
    }
    _handleCancel = () => {
        browserHistory.push('/system-settings/timeSettings/officetime')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        let errorMessage = ''
        let loadingMessage = ''
        let successMessage = ''
        let timeId = this.props.params.id

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

                let action = {}
                let starttime = values.starttime.format('HH:mm').split(':')
                let endtime = values.endtime.format('HH:mm').split(':')

                action['user_id'] = '0'
                action['sequence'] = '0'

                if (timeId) {
                    action.action = 'updateTimeConditionOfficeTime'
                    action.time_conditions_officetime = timeId
                } else {
                    action.action = 'addTimeConditionOfficeTime'
                }

                action.start_hour = starttime[0]
                action.start_min = starttime[1]
                action.end_hour = endtime[0]
                action.end_min = endtime[1]
                action.mode = values.mode ? 'byDay' : 'byWeek'
                action.month = this.state.monthOptionsSelected.length ? this.state.monthOptionsSelected.join('&') : '*'
                action.week_day = this.state.weekOptionsSelected.length ? this.state.weekOptionsSelected.join('&') : '*'
                action.day = this.state.dayOptionsSelected.length ? this.state.dayOptionsSelected.join('&') : '*'

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
    _onChangeMode = (e) => {
        this.setState({
            mode: e.target.checked
        })
    }
    _onChangeSelectOptions = (type, checkedList) => {
        let obj = {}

        obj[type] = checkedList

        this.setState(obj)

        console.log(checkedList)
    }
    _onChangePickerStart = (e) => {
        this.setState({
            starttime: e
        }, () => {
           this._forceEndTime()
        })
    }
    _onChangePickerEnd = (e) => {
        this.setState({
            endtime: e
        }, () => {
            this._forceStartTime()
        })
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let start_time = ''
        let end_time = ''

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 8 }
        }

        const formItemSpecialLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3271"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG3271"}) }))

        let time_conditions_officetime = this.state.time_conditions_officetime || {}

        if (time_conditions_officetime.start_hour !== undefined) {
            start_time = addZero(time_conditions_officetime.start_hour) + ':' + addZero(time_conditions_officetime.start_min)
            end_time = addZero(time_conditions_officetime.end_hour) + ':' + addZero(time_conditions_officetime.end_min)
        }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    isDisplay='display-block'
                    onSubmit={ this._handleSubmit }
                    onCancel={ this._handleCancel }
                />
                <div className="content specific-time">
                    <Form>
                        <FormItem
                            { ...formItemSpecialLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG247" /> }>
                                    <span>{ formatMessage({id: "LANG247"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Col span={ 6 }>
                                <FormItem>
                                    { getFieldDecorator('starttime', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            type: 'object',
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: this._checkTimeStart
                                        }],
                                        initialValue: start_time !== '' ? moment(start_time, 'HH:mm') : moment('00:00', 'HH:mm')
                                    })(
                                        <TimePicker
                                            format="HH:mm"
                                            style={{ 'width': '100%' }}
                                            onChange={ this._onChangePickerStart }
                                            placeholder={ formatMessage({id: "LANG169"}) }
                                        />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 1 }>
                                <span style={{ 'padding': '0 10px' }}>{ '-' }</span>
                            </Col>
                            <Col span={ 6 }>
                                <FormItem>
                                    { getFieldDecorator('endtime', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            type: 'object',
                                            required: true,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: this._checkTimeEnd
                                        }],
                                        initialValue: end_time !== '' ? moment(end_time, 'HH:mm') : moment('00:00', 'HH:mm')
                                    })(
                                        <TimePicker
                                            format="HH:mm"
                                            style={{ 'width': '100%' }}
                                            onChange={ this._onChangePickerEnd }
                                            placeholder={ formatMessage({id: "LANG184"}) }
                                        />
                                    ) }
                                </FormItem>
                            </Col>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG243" /> }>
                                        <span>{ formatMessage({id: "LANG243"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <CheckboxGroup
                                options={ this.state.weekOptions }
                                value={ this.state.weekOptionsSelected }
                                onChange={ this._onChangeSelectOptions.bind(this, 'weekOptionsSelected') }
                            />
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3270" /> }>
                                        <span>{ formatMessage({id: "LANG3196"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('mode', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: this.state.mode
                            })(
                                <Checkbox
                                    onChange={ this._onChangeMode }
                                />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            className={ this.state.mode ? 'display-block' : 'hidden' }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG244" /> }>
                                        <span>{ formatMessage({id: "LANG244"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <CheckboxGroup
                                options={ this.state.monthOptions }
                                value={ this.state.monthOptionsSelected }
                                onChange={ this._onChangeSelectOptions.bind(this, 'monthOptionsSelected') }
                            />
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            className={ this.state.mode ? 'display-block' : 'hidden' }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG242" /> }>
                                        <span>{ formatMessage({id: "LANG242"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <CheckboxGroup
                                options={ this.state.dayOptions }
                                value={ this.state.dayOptionsSelected }
                                onChange={ this._onChangeSelectOptions.bind(this, 'dayOptionsSelected') }
                            />
                        </FormItem>
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(OfficeTimeItem))
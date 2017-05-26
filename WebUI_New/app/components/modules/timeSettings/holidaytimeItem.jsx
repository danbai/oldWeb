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
const CheckboxGroup = Checkbox.Group

class HolidayTimeItem extends Component {
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
            time_conditions_holiday_list: []
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
        this._getInitData()
    }
    _checkName = (rule, value, callback) => {
        const { formatMessage } = this.props.intl

        if (value && _.indexOf(this.state.time_conditions_holiday_list, value) > -1) {
            callback(formatMessage({id: "LANG2137"}))
        } else {
            callback()
        }
    }
    _getInitData = () => {
        const timeId = this.props.params.id

        let mode = false
        let dayOptionsSelected = []
        let weekOptionsSelected = []
        let monthOptionsSelected = []
        let time_conditions_holiday = this.state.time_conditions_holiday || {}
        let time_conditions_holiday_list = this.state.time_conditions_holiday_list || []

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listTimeConditionHoliday',
                options: 'name'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const tmp_time_conditions_holiday_list = response.time_conditions_holiday

                    tmp_time_conditions_holiday_list.map(function(item) {
                        time_conditions_holiday_list.push(item.name)
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })

        if (timeId) {
            $.ajax({
                type: 'post',
                async: false,
                url: api.apiHost,
                data: {
                    action: 'getTimeConditionHoliday',
                    time_conditions_holiday: timeId
                },
                success: function(res) {
                    const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                    if (bool) {
                        const response = res.response || {}

                        time_conditions_holiday = response.time_conditions_holiday
                        time_conditions_holiday_list = _.without(time_conditions_holiday_list, time_conditions_holiday.name)

                        mode = time_conditions_holiday.mode === 'byDay'
                        dayOptionsSelected = time_conditions_holiday.day === '*' ? [] : time_conditions_holiday.day.split('&')
                        weekOptionsSelected = time_conditions_holiday.week_day === '*' ? [] : time_conditions_holiday.week_day.split('&')
                        monthOptionsSelected = time_conditions_holiday.month === '*' ? [] : time_conditions_holiday.month.split('&')
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
            time_conditions_holiday: time_conditions_holiday,
            time_conditions_holiday_list: time_conditions_holiday_list
        })
    }
    _handleCancel = () => {
        browserHistory.push('/system-settings/timeSettings/holidaytime')
    }
    _handleSubmit = () => {
        // e.preventDefault()

        const timeId = this.props.params.id
        const { formatMessage } = this.props.intl

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

                action['sequence'] = '0'

                if (timeId) {
                    action.action = 'updateTimeConditionHoliday'
                    action.time_conditions_holiday = timeId
                } else {
                    action.action = 'addTimeConditionHoliday'
                }

                action.name = values.name
                action.memo = values.memo
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
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }
        const formItemSpecialLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 }
        }

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3266"}),
                    1: this.props.params.name
                })
                : formatMessage({id: "LANG4340"}, {0: formatMessage({id: "LANG3266"}) }))

        let time_conditions_holiday = this.state.time_conditions_holiday || {}

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
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG135" /> }>
                                    <span>{ formatMessage({id: "LANG135"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('name', {
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
                                        Validator.cidName(data, value, callback, formatMessage)
                                    }
                                }, {
                                    validator: this._checkName
                                }],
                                initialValue: time_conditions_holiday.name ? time_conditions_holiday.name : ""
                            })(
                                <Input maxLength="25" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG3274" /> }>
                                    <span>{ formatMessage({id: "LANG3274"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('memo', {
                                getValueFromEvent: (e) => {
                                    return UCMGUI.toggleErrorMessage(e)
                                },
                                rules: [],
                                initialValue: time_conditions_holiday.memo ? time_conditions_holiday.memo : ""
                            })(
                                <Input type="textarea" rows={ 4 } maxLength="250" />
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemSpecialLayout }
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
                            { ...formItemSpecialLayout }
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
                        <FormItem
                            { ...formItemSpecialLayout }
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
                            { ...formItemSpecialLayout }
                            className={ this.state.mode ? 'display-block' : 'hidden' }
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
                    </Form>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(HolidayTimeItem))
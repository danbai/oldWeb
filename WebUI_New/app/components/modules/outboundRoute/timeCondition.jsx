'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"

import moment from 'moment'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl'
import { Button, Checkbox, Col, Form, Input, Icon, message, Radio, Row, Select, Table, TimePicker, Transfer, Tooltip } from 'antd'

const TimeFormat = 'HH:mm'
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const CheckboxGroup = Checkbox.Group
const TimeConditionType = ["LANG133", "LANG3271", "LANG3275", "LANG3266", "LANG3286", "LANG3287", "LANG3288"]

class TimeCondition extends Component {
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
            tc_mode: false,
            tc_timetype: '1',
            currentMode: '',
            currentTimeCondition: {},
            dayOptions: dayOptions,
            weekOptions: weekOptions,
            monthOptions: monthOptions,
            dayOptionsSelected: [],
            weekOptionsSelected: [],
            monthOptionsSelected: [],
            timeCondition: this.props.timeCondition
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    _checkTime = (rule, val, callback) => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let starttime = form.getFieldValue('tc_start_time')
        let endtime = form.getFieldValue('tc_end_time')

        if (starttime && endtime) {
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
    _createDay = (text, record, index) => {
        const { formatMessage } = this.props.intl

        if (text === '*') {
            return <span>{ formatMessage({id: "LANG257"}) }</span>
        } else {
            return text.replace(/&/g, ', ')
        }
    }
    _createMonth = (text, record, index) => {
        const { formatMessage } = this.props.intl

        if (text === '*') {
            return <span>{ formatMessage({id: "LANG257"}) }</span>
        } else {
            return this._parseMonth(text)
        }
    }
    _createWeek = (text, record, index) => {
        const { formatMessage } = this.props.intl

        if (text === '*') {
            return <span>{ formatMessage({id: "LANG257"}) }</span>
        } else {
            return this._parseWeek(text)
        }
    }
    _createTime = (text, record, index) => {
        const { formatMessage } = this.props.intl

        return (record.timetype >= 6) ? (text || '--') : <span>{ formatMessage({id: "LANG257"}) }</span>
    }
    _createOption = (text, record, index) => {
        const { formatMessage } = this.props.intl

        if (this.state.currentMode) {
            return <div>
                        <span className="sprite sprite-top-disabled"></span>
                        <span className="sprite sprite-up-disabled"></span>
                        <span className="sprite sprite-down-disabled"></span>
                        <span className="sprite sprite-bottom-disabled"></span>
                        <span className="sprite sprite-edit-disabled"></span>
                        <span className="sprite sprite-del-disabled"></span>
                    </div>
        } else {
            return <div>
                    <span
                        className={ record.sequence === 1 ? "sprite sprite-top-disabled" : "sprite sprite-top" }
                        onClick={ this._top.bind(this, record.sequence) }
                    >
                    </span>
                    <span
                        className={ record.sequence === 1 ? "sprite sprite-up-disabled" : "sprite sprite-up" }
                        onClick={ this._up.bind(this, record.sequence) }
                    >
                    </span>
                    <span
                        className={ record.sequence === this.state.timeCondition.length ? "sprite sprite-down-disabled" : "sprite sprite-down" }
                        onClick={ this._down.bind(this, record.sequence) }
                    >
                    </span>
                    <span
                        className={ record.sequence === this.state.timeCondition.length ? "sprite sprite-bottom-disabled" : "sprite sprite-bottom" }
                        onClick={ this._bottom.bind(this, record.sequence) }
                    >
                    </span>
                    <span
                        className="sprite sprite-edit"
                        onClick={ this._edit.bind(this, record.sequence) }
                    >
                    </span>
                    <span
                        className="sprite sprite-del"
                        onClick={ this._delete.bind(this, record.sequence) }>
                    </span>
                </div>
        }
    }
    _add = () => {
        this.setState({
            currentMode: 'add'
        })
    }
    _cancel = () => {
        const form = this.props.form

        form.resetFields(['tc_timetype', 'tc_start_time', 'tc_end_time', 'tc_not_holiday', 'tc_mode'])

        this.setState({
            tc_mode: false,
            tc_timetype: '1',
            currentMode: '',
            currentTimeCondition: {},
            dayOptionsSelected: [],
            weekOptionsSelected: [],
            monthOptionsSelected: []
        })
    }
    _edit = (index) => {
        let obj = {}
        let { form } = this.props
        let timeCondition = _.clone(this.state.timeCondition)

        timeCondition = _.filter(timeCondition, (data) => { return data.sequence === index })

        timeCondition = timeCondition[0]

        let mode = timeCondition.mode === 'byDay'
        let timetype = timeCondition.timetype >= 6 ? '6' : timeCondition.timetype + ''

        obj.tc_mode = mode
        obj.tc_timetype = timetype
        obj.tc_not_holiday = timeCondition.timetype === '7'

        if (timetype === '6') {
            obj.tc_end_time = moment(timeCondition.end_hour + ':' + timeCondition.end_min, TimeFormat)
            obj.tc_start_time = moment(timeCondition.start_hour + ':' + timeCondition.start_min, TimeFormat)
        }

        form.setFieldsValue(obj)

        let dayOptionsSelected = []
        let weekOptionsSelected = []
        let monthOptionsSelected = []

        if (timeCondition.day && timeCondition.day !== '*') {
            dayOptionsSelected = timeCondition.day.split('&')
        }

        if (timeCondition.week_day && timeCondition.week_day !== '*') {
            weekOptionsSelected = timeCondition.week_day.split('&')
        }

        if (timeCondition.month && timeCondition.month !== '*') {
            monthOptionsSelected = timeCondition.month.split('&')
        }

        this.setState({
            tc_mode: mode,
            currentMode: 'edit',
            tc_timetype: timetype,
            currentTimeCondition: timeCondition,
            dayOptionsSelected: dayOptionsSelected,
            weekOptionsSelected: weekOptionsSelected,
            monthOptionsSelected: monthOptionsSelected
        })
    }
    _delete = (index) => {
        let timeCondition = _.clone(this.state.timeCondition)

        timeCondition = _.filter(timeCondition, (data) => { return data.sequence !== index })

        this._setAllDataSequence(timeCondition)
    }
    _save = () => {
        // e.preventDefault()

        const form = this.props.form
        const { formatMessage } = this.props.intl
        const fields = ['tc_timetype', 'tc_start_time', 'tc_end_time', 'tc_not_holiday', 'tc_mode']

        form.validateFieldsAndScroll(fields, { force: true }, (err, values) => {
            if (!err) {
                let timeCondition = _.clone(this.state.timeCondition)

                let obj = {
                        mode: values.tc_mode ? 'byDay' : 'byWeek',
                        timetype: values.tc_not_holiday ? '7' : values.tc_timetype
                    }

                if (!values.tc_start_time) {
                    obj.start_hour = '00'
                    obj.start_min = '00'
                } else {
                    let startTime = values.tc_start_time.format(TimeFormat)
                    let startTimeArray = startTime.split(':')
                    let start_hour = startTimeArray[0]
                    let start_min = startTimeArray[1]

                    obj.start_hour = start_hour
                    obj.start_min = start_min
                }

                if (!values.tc_end_time) {
                    obj.end_hour = '23'
                    obj.end_min = '59'
                } else {
                    let endTime = values.tc_end_time.format(TimeFormat)
                    let endTimeArray = endTime.split(':')
                    let end_hour = endTimeArray[0]
                    let end_min = endTimeArray[1]

                    obj.end_hour = end_hour
                    obj.end_min = end_min
                }

                if (!values.tc_start_time && !values.tc_end_time) {
                    obj.time = '00:00-23:59'
                } else {
                    obj.time = obj.start_hour + ':' + obj.start_min + '-' + obj.end_hour + ':' + obj.end_min
                }

                if (this.state.dayOptionsSelected.length) {
                    obj.day = this.state.dayOptionsSelected.join('&')
                } else {
                    obj.day = '*'
                }

                if (this.state.weekOptionsSelected.length) {
                    obj.week_day = this.state.weekOptionsSelected.join('&')
                } else {
                    obj.week_day = '*'
                }

                if (this.state.monthOptionsSelected.length) {
                    obj.month = this.state.monthOptionsSelected.join('&')
                } else {
                    obj.month = '*'
                }

                if (this.state.currentMode === 'edit') {
                    timeCondition = _.map(timeCondition, (data) => {
                        if (data.sequence === this.state.currentTimeCondition.sequence) {
                            obj.sequence = data.sequence

                            return obj
                        } else {
                            return data
                        }
                    })
                } else {
                    obj.sequence = this._getTCIndex()

                    timeCondition.push(obj)
                }

                this.setState({
                    tc_mode: false,
                    tc_timetype: '1',
                    currentMode: '',
                    currentTimeCondition: {},
                    dayOptionsSelected: [],
                    weekOptionsSelected: [],
                    monthOptionsSelected: [],
                    timeCondition: timeCondition
                })

                form.setFieldsValue({
                    time_condition: timeCondition
                })

                form.resetFields(fields)
            }
        })
    }
    _setAllDataSequence = (tc) => {
        let { form } = this.props
        let timeCondition = _.map(tc, (data, index) => {
                let obj = data

                obj.sequence = index + 1

                return obj
            })

        form.setFieldsValue({
            time_condition: timeCondition
        })

        this.setState({
            timeCondition: timeCondition
        })
    }
    _top = (index) => {
        if (index === 1) {
            return false
        }

        let sequence = index - 1,
            timeCondition = _.clone(this.state.timeCondition)

        let currentTimeCondition = timeCondition[sequence]

        timeCondition.splice(sequence, 1)
        timeCondition.splice(0, 0, currentTimeCondition)

        this._setAllDataSequence(timeCondition)
    }
    _up = (index) => {
        if (index === 1) {
            return false
        }

        let sequence = index - 1,
            timeCondition = _.clone(this.state.timeCondition)

        let currentTimeCondition = timeCondition[sequence]

        timeCondition[sequence] = timeCondition[sequence - 1]
        timeCondition[sequence - 1] = currentTimeCondition

        this._setAllDataSequence(timeCondition)
    }
    _down = (index) => {
        if (index === this.state.timeCondition.length) {
            return false
        }

        let sequence = index - 1,
            timeCondition = _.clone(this.state.timeCondition)

        let currentTimeCondition = timeCondition[sequence]

        timeCondition[sequence] = timeCondition[index]
        timeCondition[index] = currentTimeCondition

        this._setAllDataSequence(timeCondition)
    }
    _bottom = (index) => {
        if (index === this.state.timeCondition.length) {
            return false
        }

        let sequence = index - 1,
            timeCondition = _.clone(this.state.timeCondition),
            length = timeCondition.length - 1

        let currentTimeCondition = timeCondition[sequence]

        timeCondition.splice(sequence, 1)
        timeCondition.splice(length, 0, currentTimeCondition)

        this._setAllDataSequence(timeCondition)
    }
    _getTCIndex = () => {
        let j,
            i = 1,
            length = 1000000,
            timeCondition = this.state.timeCondition

        for (i; i < length; i++) {
            let exist = false

            for (j = 0; j < timeCondition.length; j++) {
                if (i === timeCondition[j]['sequence']) {
                    exist = true
                    break
                }
            }

            if (!exist) {
                break
            }
        }

        return i
    }
    _onChangeTCMode = (e) => {
        this.setState({
            tc_mode: e.target.checked
        })
    }
    _onChangeTimeType = (value) => {
        this.setState({
            tc_timetype: value
        })
    }
    _onChangeSelectOptions = (type, checkedList) => {
        let obj = {}

        obj[type] = checkedList

        this.setState(obj)
    }
    _parseMonth = (list) => {
        let str = list.split('&'),
            dictMonth = {},
            tmpstr = []

        const { formatMessage } = this.props.intl

        dictMonth.jan = formatMessage({id: "LANG204"}, {0: ''})
        dictMonth.feb = formatMessage({id: "LANG205"}, {0: ''})
        dictMonth.mar = formatMessage({id: "LANG206"}, {0: ''})
        dictMonth.apr = formatMessage({id: "LANG207"}, {0: ''})
        dictMonth.may = formatMessage({id: "LANG208"}, {0: ''})
        dictMonth.jun = formatMessage({id: "LANG209"}, {0: ''})
        dictMonth.jul = formatMessage({id: "LANG210"}, {0: ''})
        dictMonth.aug = formatMessage({id: "LANG211"}, {0: ''})
        dictMonth.sep = formatMessage({id: "LANG212"}, {0: ''})
        dictMonth.oct = formatMessage({id: "LANG213"}, {0: ''})
        dictMonth.nov = formatMessage({id: "LANG214"}, {0: ''})
        dictMonth.dec = formatMessage({id: "LANG215"}, {0: ''})

        for (let i = 0; i < str.length; i++) {
            tmpstr.push(dictMonth[str[i]])
        }

        return tmpstr.join('')
    }
    _parseWeek = (list) => {
        let str = list.split('&'),
            dictWeek = {},
            tmpstr = []

        const { formatMessage } = this.props.intl

        dictWeek.sun = formatMessage({id: "LANG250"})
        dictWeek.mon = formatMessage({id: "LANG251"})
        dictWeek.tue = formatMessage({id: "LANG252"})
        dictWeek.wed = formatMessage({id: "LANG253"})
        dictWeek.thu = formatMessage({id: "LANG254"})
        dictWeek.fri = formatMessage({id: "LANG255"})
        dictWeek.sat = formatMessage({id: "LANG256"})

        for (let i = 0; i < str.length; i++) {
            tmpstr.push(dictWeek[str[i]])
        }

        return tmpstr.join(' ')
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemSpecialLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 12 }
        }

        const columns = [{
                width: 400,
                key: 'timetype',
                dataIndex: 'timetype',
                title: formatMessage({id: "LANG1557"}),
                render: (text, record, index) => {
                    return formatMessage({id: (record.timetype >= 6 ? TimeConditionType[6] : TimeConditionType[record.timetype])})
                }
            }, {
                width: 200,
                key: 'time',
                dataIndex: 'time',
                title: formatMessage({id: "LANG247"}),
                render: (text, record, index) => (
                    this._createTime(text, record, index)
                )
            }, {
                width: 400,
                key: 'week_day',
                dataIndex: 'week_day',
                title: formatMessage({id: "LANG243"}),
                render: (text, record, index) => (
                    this._createWeek(text, record, index)
                )
            }, {
                width: 400,
                key: 'month',
                dataIndex: 'month',
                title: formatMessage({id: "LANG244"}),
                render: (text, record, index) => (
                    this._createMonth(text, record, index)
                )
            }, {
                width: 400,
                key: 'day',
                dataIndex: 'day',
                title: formatMessage({id: "LANG242"}),
                render: (text, record, index) => (
                    this._createDay(text, record, index)
                )
            }, {
                width: 500,
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }]

        getFieldDecorator('time_condition', { initialValue: this.state.timeCondition })

        return (
            <div className="specific-time">
                <Row className={ this.state.currentMode ? 'display-block' : 'hidden' }>
                    {/* <Col span={ 24 }>
                        <div className="function-description">
                            <span>{ formatMessage({id: "LANG1532"}) }</span>
                        </div>
                    </Col> */}
                    <Col span={ 24 }>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1557" /> }>
                                        <span>{ formatMessage({id: "LANG1557"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('tc_timetype', {
                                rules: [],
                                initialValue: this.state.tc_timetype >= 6 ? '6' : this.state.tc_timetype
                            })(
                                <Select onChange={ this._onChangeTimeType }>
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
                </Row>
                <Row
                    className={ this.state.currentMode && this.state.tc_timetype >= 6 ? 'display-block' : 'hidden' }
                >
                    <Col span={ 24 }>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG247" /> }>
                                        <span>{ formatMessage({id: "LANG247"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            <Col span={ 11 }>
                                <FormItem>
                                    { getFieldDecorator('tc_start_time', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            type: 'object',
                                            required: false,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: this._checkTime
                                        }]
                                    })(
                                        <TimePicker
                                            format={ TimeFormat }
                                            style={{ 'width': '100%' }}
                                            placeholder={ formatMessage({id: "LANG169"}) }
                                        />
                                    ) }
                                </FormItem>
                            </Col>
                            <Col span={ 2 }>
                                <span style={{ 'display': 'inline-block', 'width': '100%', 'textAlign': 'center' }}>{ ' - ' }</span>
                            </Col>
                            <Col span={ 11 }>
                                <FormItem>
                                    { getFieldDecorator('tc_end_time', {
                                        getValueFromEvent: (e) => {
                                            return UCMGUI.toggleErrorMessage(e)
                                        },
                                        rules: [{
                                            type: 'object',
                                            required: false,
                                            message: formatMessage({id: "LANG2150"})
                                        }, {
                                            validator: this._checkTime
                                        }]
                                    })(
                                        <TimePicker
                                            format={ TimeFormat }
                                            style={{ 'width': '100%' }}
                                            placeholder={ formatMessage({id: "LANG184"}) }
                                        />
                                    ) }
                                </FormItem>
                            </Col>                                
                        </FormItem>
                    </Col>
                    <Col span={ 24 }>
                        <FormItem
                            { ...formItemSpecialLayout }
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
                    </Col>
                    <Col span={ 24 }>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3276" /> }>
                                        <span>{ formatMessage({id: "LANG3276"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('tc_not_holiday', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: false
                            })(
                                <Checkbox />
                            ) }
                        </FormItem>
                    </Col>
                    <Col span={ 24 }>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG542" /> }>
                                        <span>{ formatMessage({id: "LANG542"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator('tc_mode', {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: this.state.tc_mode
                            })(
                                <Checkbox
                                    onChange={ this._onChangeTCMode }
                                />
                            ) }
                        </FormItem>
                    </Col>
                    <Col
                        span={ 24 }
                        className={ this.state.tc_mode ? 'display-block' : 'hidden'}
                    >
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
                    </Col>
                    <Col
                        span={ 24 }
                        className={ this.state.tc_mode ? 'display-block' : 'hidden'}
                    >
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
                    </Col>
                </Row>
                <Row>
                    <Col span={ 24 }>
                        <Button
                            icon="plus"
                            type="primary"
                            onClick={ this._add }
                            className={ !this.state.currentMode ? 'display-inline' : 'hidden' }
                        >
                            { formatMessage({id: "LANG769"}) }
                        </Button>
                        <Button
                            icon="check"
                            type="primary"
                            onClick={ this._save }
                            className={ this.state.currentMode ? 'display-inline' : 'hidden' }
                        >
                            { formatMessage({id: "LANG728"}) }
                        </Button>
                        <Button
                            icon="cross"
                            type="primary"
                            onClick={ this._cancel }
                            className={ this.state.currentMode ? 'display-inline' : 'hidden' }
                        >
                            { formatMessage({id: "LANG726"}) }
                        </Button>
                    </Col>
                    <Col span={ 24 } style={{ 'margin': '20px 0 0 0' }}>
                        <Table
                            rowKey="sequence"
                            columns={ columns }
                            pagination={ false }
                            dataSource={ this.state.timeCondition }
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default injectIntl(TimeCondition)
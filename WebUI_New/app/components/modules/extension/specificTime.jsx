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

class SpecificTime extends Component {
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
            tc_mode: 'byWeek',
            tc_mode_date_type: 'week',
            dayOptions: dayOptions,
            weekOptions: weekOptions,
            monthOptions: monthOptions,
            dayOptionsSelected: [],
            weekOptionsSelected: [],
            monthOptionsSelected: [],
            timeConditionsOfficetime: this.props.timeConditionsOfficetime
        }
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    _addMembers = () => {
        // e.preventDefault()

        const form = this.props.form
        const { formatMessage } = this.props.intl
        const fields = ['tc_start_time', 'tc_end_time', 'tc_mode']

        form.validateFieldsAndScroll(fields, { force: true }, (err, values) => {
            if (!err) {
                let timeConditionsOfficetime = _.clone(this.state.timeConditionsOfficetime)

                let obj = {
                        mode: values.tc_mode,
                        condition_index: this._getTCIndex()
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

                if (this.props.currentEditId) {
                     obj.user_id = this.props.userSettings.user_id
                }

                timeConditionsOfficetime.push(obj)

                this.setState({
                    tc_mode: 'byWeek',
                    dayOptionsSelected: [],
                    weekOptionsSelected: [],
                    monthOptionsSelected: [],
                    timeConditionsOfficetime: timeConditionsOfficetime
                })

                form.setFieldsValue({
                    tc_time_condition: timeConditionsOfficetime
                })

                form.resetFields(fields)
            }
        })
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

        return text || ''
    }
    _createOption = (text, record, index) => {
        const { formatMessage } = this.props.intl

        return <div>
                <span
                    className="sprite sprite-fast-del"
                    onClick={ this._delete.bind(this, record.condition_index) }>
                </span>
            </div>
    }
    _delete = (index) => {
        let { form } = this.props
        let timeConditionsOfficetime = _.clone(this.state.timeConditionsOfficetime)

        timeConditionsOfficetime = _.filter(timeConditionsOfficetime, (data) => { return data.condition_index !== index })

        form.setFieldsValue({
            tc_time_condition: timeConditionsOfficetime
        })

        this.setState({
            timeConditionsOfficetime: timeConditionsOfficetime
        })
    }
    _getTCIndex = () => {
        let j,
            i = 0,
            length = 1000000,
            timeConditionsOfficetime = this.state.timeConditionsOfficetime

        for (i; i < length; i++) {
            let exist = false

            for (j = 0; j < timeConditionsOfficetime.length; j++) {
                if (i === timeConditionsOfficetime[j]['condition_index']) {
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
            tc_mode: e.target.value
        })
    }
    _onChangeTCModeDayType = (e) => {
        this.setState({
            tc_mode_date_type: e.target.value
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

        const radioStyle = {
            height: "30px",
            display: "block",
            lineHeight: "30px"
        }

        const orderRadio = <RadioGroup>
                                <Radio value="after">{ formatMessage({id: "LANG1983"}) }</Radio>
                                <Radio value="alongWith">{ formatMessage({id: "LANG1984"}) }</Radio>
                            </RadioGroup>

        const columns = [{
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
                width: 200,
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }]

        getFieldDecorator('tc_time_condition', { initialValue: this.state.timeConditionsOfficetime })

        return (
            <div className="content specific-time">
                <div className="ant-form">
                    <Row>
                        <Col span={ 24 } style={{ 'margin': '10px 0 0 0' }}>
                            <FormItem
                                { ...formItemSpecialLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG247" /> }>
                                            <span>{ formatMessage({id: "LANG247"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                <Col span={ 6 }>
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
                                <Col span={ 1 }>
                                    <span style={{ 'padding': '0 10px' }}>{ '-' }</span>
                                </Col>
                                <Col span={ 6 }>
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
                        <Col
                            span={ 24 }
                        >
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG5598" /> }>
                                            <span>{ formatMessage({id: "LANG5598"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator('tc_mode', {
                                    initialValue: 'byWeek'
                                })(
                                    <RadioGroup onChange={ this._onChangeTCMode }>
                                        <Radio value="byWeek">{ formatMessage({id: "LANG199"}) }</Radio>
                                        <Radio value="byDay">{ formatMessage({id: "LANG200"}) }</Radio>
                                    </RadioGroup>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 16 }
                            offset={ 4 }
                            className={ this.state.tc_mode === 'byWeek' ? 'display-block' : 'hidden'}
                        >
                            <FormItem>
                                <CheckboxGroup
                                    options={ this.state.weekOptions }
                                    value={ this.state.weekOptionsSelected }
                                    onChange={ this._onChangeSelectOptions.bind(this, 'weekOptionsSelected') }
                                />
                            </FormItem>
                        </Col>
                        <Col
                            span={ 16 }
                            offset={ 4 }
                            className={ this.state.tc_mode === 'byDay' ? 'display-block' : 'hidden'}
                        >
                            <FormItem>
                                <CheckboxGroup
                                    options={ this.state.monthOptions }
                                    value={ this.state.monthOptionsSelected }
                                    onChange={ this._onChangeSelectOptions.bind(this, 'monthOptionsSelected') }
                                />
                            </FormItem>
                        </Col>
                        <Col
                            span={ 16 }
                            offset={ 4 }
                            className={ this.state.tc_mode === 'byDay' ? 'display-block' : 'hidden'}
                        >
                            <FormItem>
                                <CheckboxGroup
                                    options={ this.state.dayOptions }
                                    value={ this.state.dayOptionsSelected }
                                    onChange={ this._onChangeSelectOptions.bind(this, 'dayOptionsSelected') }
                                />
                            </FormItem>
                        </Col>
                        {/* <Col
                            span={ 24 }
                            className={ this.state.tc_mode === 'byDay' ? 'display-block' : 'hidden'}
                        >
                            <Col span={ 8 } offset={ 4 }>
                                <FormItem>
                                    { getFieldDecorator('tc_mode_date_type', {
                                        initialValue: 'week'
                                    })(
                                        <RadioGroup onChange={ this._onChangeTCModeDayType }>
                                            <Radio value="week">{ formatMessage({id: "LANG243"}) }</Radio>
                                            <Radio value="date">{ formatMessage({id: "LANG242"}) }</Radio>
                                        </RadioGroup>
                                    ) }
                                </FormItem>
                            </Col>
                        </Col> */}
                        <Col span={ 24 } style={{ 'margin': '10px 0 0 0' }}>
                            <Col
                                span={ 4 }
                                offset={ 4 }
                            >
                                <Button
                                    icon="plus"
                                    type="primary"
                                    onClick={ this._addMembers }
                                >
                                    { formatMessage({id: "LANG769"}) }
                                </Button>
                            </Col>
                        </Col>
                        <Col span={ 24 } style={{ 'margin': '20px 0 0 0' }}>
                            <Table
                                columns={ columns }
                                pagination={ false }
                                rowKey="condition_index"
                                dataSource={ this.state.timeConditionsOfficetime }
                            />
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(SpecificTime)
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
const DestinationTypeList = ['conference', 'paginggroup', 'fax', 'disa', 'directory', 'callback', 'voicemail', 'account', 'vmgroup', 'ivr', 'ringgroup', 'queue']

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

        let obj = {
                dayOptions: dayOptions,
                weekOptions: weekOptions,
                monthOptions: monthOptions
            },
            timeCondition = {},
            inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        timeCondition = _.filter(this.props.timeCondition, (data) => { return data.inbound_mode.toString() === this.props.inboundMode })

        timeCondition = _.map(timeCondition, (data, index) => {
                let obj = data

                obj.sequence = index + 1

                return obj
            })

        obj[`${inboundMode}_tc_mode`] = false
        obj[`${inboundMode}_tc_timetype`] = '1'
        obj[`${inboundMode}_currentMode`] = ''
        obj[`${inboundMode}_destination_type`] = ''
        obj[`${inboundMode}_destination_value`] = ''
        obj[`${inboundMode}_dayOptionsSelected`] = []
        obj[`${inboundMode}_weekOptionsSelected`] = []
        obj[`${inboundMode}_monthOptionsSelected`] = []
        obj[`${inboundMode}_currentTimeCondition`] = {}
        obj[`${inboundMode}_timeCondition`] = timeCondition

        this.state = obj
    }
    componentWillMount() {
    }
    componentDidMount() {
    }
    _checkTime = (rule, val, callback) => {
        const form = this.props.form
        const { formatMessage } = this.props.intl

        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'
        let starttime = form.getFieldValue(`${inboundMode}_tc_start_time`)
        let endtime = form.getFieldValue(`${inboundMode}_tc_end_time`)

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
    _createDestination = (text, record, index) => {
        const __this = this
        const { formatMessage } = this.props.intl

        return <span
                    className="status-container"
                    // style={{ 'text-align': 'center' }}
                >
                    {
                        record.members.map(function(item, index) {
                            if (!item || (!item.timetype && item.timetype !== '0') ||
                                (item.inbound_mode === '1' && item.en_multi_mode === 'no') ||
                                (item.tc && item.tc === '1' && item.timetype === '0')) {
                                return false
                            }

                            return __this._translateDestination(undefined, undefined, item, index)
                        })
                    }
                </span>
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

        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        if (this.state[`${inboundMode}_currentMode`]) {
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
                        className={ record.sequence === this.state[`${inboundMode}_timeCondition`].length ? "sprite sprite-down-disabled" : "sprite sprite-down" }
                        onClick={ this._down.bind(this, record.sequence) }
                    >
                    </span>
                    <span
                        className={ record.sequence === this.state[`${inboundMode}_timeCondition`].length ? "sprite sprite-bottom-disabled" : "sprite sprite-bottom" }
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
        let obj = {}
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        obj[`${inboundMode}_currentMode`] = 'add'

        this.setState(obj)
    }
    _cancel = () => {
        const form = this.props.form

        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'
        let fields = [`${inboundMode}_tc_timetype`,
                        `${inboundMode}_tc_start_time`,
                        `${inboundMode}_tc_end_time`,
                        `${inboundMode}_tc_not_holiday`,
                        `${inboundMode}_tc_mode`,
                        `${inboundMode}_destination_type`,
                        `${inboundMode}_destination_value`,
                        `${inboundMode}_external_number`,
                        `${inboundMode}_did_strip`,
                        `${inboundMode}_timecondition_prepend`
                    ]

        let obj = {}

        obj[`${inboundMode}_tc_mode`] = false
        obj[`${inboundMode}_tc_timetype`] = '1'
        obj[`${inboundMode}_currentMode`] = ''
        obj[`${inboundMode}_currentTimeCondition`] = {}
        obj[`${inboundMode}_dayOptionsSelected`] = []
        obj[`${inboundMode}_weekOptionsSelected`] = []
        obj[`${inboundMode}_monthOptionsSelected`] = []
        obj[`${inboundMode}_destination_type`] = ''
        obj[`${inboundMode}_destination_value`] = ''

        this.setState(obj)

        obj = {}

        obj[`${inboundMode}_destination_type`] = ''
        obj[`${inboundMode}_destination_value`] = ''

        form.setFieldsValue(obj)

        form.resetFields(fields)
    }
    _edit = (index) => {
        let obj = {}
        let { form } = this.props
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        let timeCondition = _.clone(this.state[`${inboundMode}_timeCondition`])

        timeCondition = _.filter(timeCondition, (data) => { return data.sequence === index })

        timeCondition = timeCondition[0]

        let mode = timeCondition.mode === 'byDay'
        let timetype = timeCondition.timetype >= 6 ? '6' : timeCondition.timetype + ''

        obj[`${inboundMode}_tc_mode`] = mode
        obj[`${inboundMode}_tc_timetype`] = timetype
        obj[`${inboundMode}_tc_not_holiday`] = timeCondition.timetype === '7'
        obj[`${inboundMode}_did_strip`] = timeCondition.did_strip ? timeCondition.did_strip : '0'
        obj[`${inboundMode}_external_number`] = timeCondition.external_number ? timeCondition.external_number : ''
        obj[`${inboundMode}_destination_type`] = timeCondition.destination_type ? timeCondition.destination_type : ''
        obj[`${inboundMode}_timecondition_prepend`] = timeCondition.timecondition_prepend ? timeCondition.timecondition_prepend : ''

        if (timetype === '6') {
            obj[`${inboundMode}_tc_end_time`] = moment(timeCondition.end_hour + ':' + timeCondition.end_min, TimeFormat)
            obj[`${inboundMode}_tc_start_time`] = moment(timeCondition.start_hour + ':' + timeCondition.start_min, TimeFormat)
        }

        if (timeCondition.destination_type !== 'byDID' && timeCondition.destination_type !== 'external_number') {
            obj[`${inboundMode}_destination_value`] = timeCondition[timeCondition.destination_type]
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

        delete obj[`${inboundMode}_did_strip`]
        delete obj[`${inboundMode}_tc_end_time`]
        delete obj[`${inboundMode}_tc_start_time`]
        delete obj[`${inboundMode}_tc_not_holiday`]
        delete obj[`${inboundMode}_external_number`]
        delete obj[`${inboundMode}_timecondition_prepend`]

        obj[`${inboundMode}_currentMode`] = 'edit'
        obj[`${inboundMode}_currentTimeCondition`] = timeCondition
        obj[`${inboundMode}_dayOptionsSelected`] = dayOptionsSelected
        obj[`${inboundMode}_weekOptionsSelected`] = weekOptionsSelected
        obj[`${inboundMode}_monthOptionsSelected`] = monthOptionsSelected

        this.setState(obj)
    }
    _delete = (index) => {
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        let timeCondition = _.clone(this.state[`${inboundMode}_timeCondition`])

        timeCondition = _.filter(timeCondition, (data) => { return data.sequence !== index })

        this._setAllDataSequence(timeCondition)

        this.props.checkDestinationHasDID()
    }
    _save = () => {
        // e.preventDefault()

        const form = this.props.form
        const { formatMessage } = this.props.intl

        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'
        let fields = [`${inboundMode}_tc_timetype`,
                        `${inboundMode}_tc_start_time`,
                        `${inboundMode}_tc_end_time`,
                        `${inboundMode}_tc_not_holiday`,
                        `${inboundMode}_tc_mode`,
                        `${inboundMode}_destination_type`,
                        `${inboundMode}_destination_value`,
                        `${inboundMode}_external_number`,
                        `${inboundMode}_did_strip`,
                        `${inboundMode}_timecondition_prepend`
                    ]

        form.validateFieldsAndScroll(fields, { force: true }, (err, values) => {
            if (!err) {
                let timeCondition = _.clone(this.state[`${inboundMode}_timeCondition`])

                let obj = {
                        mode: values[`${inboundMode}_tc_mode`] ? 'byDay' : 'byWeek',
                        did_strip: values[`${inboundMode}_did_strip`] ? values[`${inboundMode}_did_strip`] : '0',
                        timetype: values[`${inboundMode}_tc_not_holiday`] ? '7' : values[`${inboundMode}_tc_timetype`],
                        destination_type: values[`${inboundMode}_destination_type`] ? values[`${inboundMode}_destination_type`] : ''
                    }

                _.map(DestinationTypeList, (value) => {
                    obj[value] = null
                })

                if (obj.destination_type === 'byDID') {
                    obj.timecondition_prepend = values[`${inboundMode}_timecondition_prepend`] ? values[`${inboundMode}_timecondition_prepend`] : null
                } else {
                    obj.timecondition_prepend = null
                }

                if (obj.destination_type === 'external_number') {
                    obj.external_number = values[`${inboundMode}_external_number`] ? values[`${inboundMode}_external_number`] : null
                } else {
                    obj.external_number = null
                }

                if (values[`${inboundMode}_destination_type`] !== 'byDID' && values[`${inboundMode}_destination_type`] !== 'external_number') {
                    obj.did_strip = '0'
                    obj[values[`${inboundMode}_destination_type`]] = values[`${inboundMode}_destination_value`]
                }

                if (!values[`${inboundMode}_tc_start_time`]) {
                    obj.start_hour = '00'
                    obj.start_min = '00'
                } else {
                    let startTime = values[`${inboundMode}_tc_start_time`].format(TimeFormat)
                    let startTimeArray = startTime.split(':')
                    let start_hour = startTimeArray[0]
                    let start_min = startTimeArray[1]

                    obj.start_hour = start_hour
                    obj.start_min = start_min
                }

                if (!values[`${inboundMode}_tc_end_time`]) {
                    obj.end_hour = '23'
                    obj.end_min = '59'
                } else {
                    let endTime = values[`${inboundMode}_tc_end_time`].format(TimeFormat)
                    let endTimeArray = endTime.split(':')
                    let end_hour = endTimeArray[0]
                    let end_min = endTimeArray[1]

                    obj.end_hour = end_hour
                    obj.end_min = end_min
                }

                if (!values[`${inboundMode}_tc_start_time`] && !values[`${inboundMode}_tc_end_time`]) {
                    obj.time = '00:00-23:59'
                } else {
                    obj.time = obj.start_hour + ':' + obj.start_min + '-' + obj.end_hour + ':' + obj.end_min
                }

                if (this.state[`${inboundMode}_dayOptionsSelected`].length) {
                    obj.day = this.state[`${inboundMode}_dayOptionsSelected`].join('&')
                } else {
                    obj.day = '*'
                }

                if (this.state[`${inboundMode}_weekOptionsSelected`].length) {
                    obj.week_day = this.state[`${inboundMode}_weekOptionsSelected`].join('&')
                } else {
                    obj.week_day = '*'
                }

                if (this.state[`${inboundMode}_monthOptionsSelected`].length) {
                    obj.month = this.state[`${inboundMode}_monthOptionsSelected`].join('&')
                } else {
                    obj.month = '*'
                }

                if (this.state[`${inboundMode}_currentMode`] === 'edit') {
                    timeCondition = _.map(timeCondition, (data) => {
                        if (data.sequence === this.state[`${inboundMode}_currentTimeCondition`].sequence) {
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

                obj = {}

                obj[`${inboundMode}_tc_mode`] = false
                obj[`${inboundMode}_tc_timetype`] = '1'
                obj[`${inboundMode}_currentMode`] = ''
                obj[`${inboundMode}_currentTimeCondition`] = {}
                obj[`${inboundMode}_dayOptionsSelected`] = []
                obj[`${inboundMode}_weekOptionsSelected`] = []
                obj[`${inboundMode}_monthOptionsSelected`] = []
                obj[`${inboundMode}_destination_type`] = ''
                obj[`${inboundMode}_destination_value`] = ''
                obj[`${inboundMode}_timeCondition`] = timeCondition

                this.setState(obj)

                obj = {}

                obj[`${inboundMode}_destination_type`] = ''
                obj[`${inboundMode}_destination_value`] = ''
                obj[`${inboundMode}_time_condition`] = timeCondition

                form.setFieldsValue(obj)

                form.resetFields(fields)

                this.props.checkDestinationHasDID()
            }
        })
    }
    _setAllDataSequence = (tc) => {
        let { form } = this.props
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        let timeCondition = _.map(tc, (data, index) => {
                let obj = data

                obj.sequence = index + 1

                return obj
            })

        let obj = {}

        obj[`${inboundMode}_time_condition`] = timeCondition

        form.setFieldsValue(obj)

        obj = {}

        obj[`${inboundMode}_timeCondition`] = timeCondition

        this.setState(obj)
    }
    _top = (index) => {
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        if (index === 1) {
            return false
        }

        let sequence = index - 1,
            timeCondition = _.clone(this.state[`${inboundMode}_timeCondition`])

        let currentTimeCondition = timeCondition[sequence]

        timeCondition.splice(sequence, 1)
        timeCondition.splice(0, 0, currentTimeCondition)

        this._setAllDataSequence(timeCondition)
    }
    _up = (index) => {
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        if (index === 1) {
            return false
        }

        let sequence = index - 1,
            timeCondition = _.clone(this.state[`${inboundMode}_timeCondition`])

        let currentTimeCondition = timeCondition[sequence]

        timeCondition[sequence] = timeCondition[sequence - 1]
        timeCondition[sequence - 1] = currentTimeCondition

        this._setAllDataSequence(timeCondition)
    }
    _down = (index) => {
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        if (index === this.state[`${inboundMode}_timeCondition`].length) {
            return false
        }

        let sequence = index - 1,
            timeCondition = _.clone(this.state[`${inboundMode}_timeCondition`])

        let currentTimeCondition = timeCondition[sequence]

        timeCondition[sequence] = timeCondition[index]
        timeCondition[index] = currentTimeCondition

        this._setAllDataSequence(timeCondition)
    }
    _bottom = (index) => {
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        if (index === this.state[`${inboundMode}_timeCondition`].length) {
            return false
        }

        let sequence = index - 1,
            timeCondition = _.clone(this.state[`${inboundMode}_timeCondition`]),
            length = timeCondition.length - 1

        let currentTimeCondition = timeCondition[sequence]

        timeCondition.splice(sequence, 1)
        timeCondition.splice(length, 0, currentTimeCondition)

        this._setAllDataSequence(timeCondition)
    }
    _getDisplayName = (type, id_key, id_value, display_key) => {
        let display_name = ''

        _.each(this.props.destinationDataSource[type], function(item) {
            if (item[id_key] === id_value) {
                display_name = item[display_key]
            }
        })

        return display_name
    }
    _getTCIndex = () => {
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        let j,
            i = 1,
            length = 1000000,
            timeCondition = this.state[`${inboundMode}_timeCondition`]

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
    _onChangeDestinationType = (value) => {
        let { form } = this.props

        let obj = {}
        let destinationValue = this.props.destinationDataSource[value]
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        obj[`${inboundMode}_external_number`] = ''
        obj[`${inboundMode}_destination_value`] = destinationValue.length ? destinationValue[0].value : ""

        this.props.form.setFieldsValue(obj)

        // this.props.checkDestinationHasDID(value)

        obj = {}
        obj[`${inboundMode}_destination_type`] = value
        obj[`${inboundMode}_destination_value`] = destinationValue.length ? destinationValue[0].value : ""

        this.setState(obj)
    }
    _onChangeTCMode = (e) => {
        let obj = {}
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        obj[`${inboundMode}_tc_mode`] = e.target.checked

        this.setState(obj)
    }
    _onChangeTimeType = (value) => {
        let obj = {}
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        obj[`${inboundMode}_tc_timetype`] = value

        this.setState(obj)
    }
    _onChangeSelectOptions = (type, checkedList) => {
        let obj = {}
        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        obj[`${inboundMode}_${type}`] = checkedList

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
    _showDestination = (lang, val, type, inbondModeText, index) => {
        let destination = ''
        const { formatMessage } = this.props.intl

        if (!val) {
            destination = <span key={ index } style={{ 'display': 'block' }}>
                                { inbondModeText }
                                { formatMessage({ id: lang }) + ' ' + formatMessage({ id: 'LANG2886' }) }
                            </span>
        } else if (type === 'account' || type === 'voicemail') {
            let item = _.find(this.props.destinationDataSource[type], function(data) {
                    return data.key === val
                }),
                fullname = item ? item.fullname : '',
                disable = item ? item.out_of_service : 'no'

            if (disable && disable === 'yes') {
                destination = <span key={ index } style={{ 'display': 'block' }}>
                                { inbondModeText }
                                <span className="out-of-service">
                                    {
                                        formatMessage({ id: lang }) + ' -- ' + val +
                                            (fullname ? ' "' + fullname + '"' : '') +
                                            ' <' + formatMessage({ id: 'LANG273' }) + '>'
                                    }
                                </span>
                            </span>
            } else {
                destination = <span key={ index } style={{ 'display': 'block' }}>
                                { inbondModeText }
                                <span>
                                    {
                                        formatMessage({ id: lang }) + ' -- ' + val +
                                            (fullname ? ' "' + fullname + '"' : '')
                                    }
                                </span>
                            </span>
            }
        } else {
            destination = <span key={ index } style={{ 'display': 'block' }}>
                                { inbondModeText }
                                { formatMessage({ id: lang }) + ' -- ' + val }
                            </span>
        }

        return destination
    }
    _translateDestination = (cellvalue, options, rowObject, index) => {
        let type = rowObject.destination_type,
            destination = '',
            display_name = '',
            inbondModeText = ''

        const { formatMessage } = this.props.intl

        // if (rowObject.inbound_mode === '1') {
        //     inbondModeText = <span
        //                         key={ index }
        //                         className="status-container ringing"
        //                         style={{ 'marginRight': '10px' }}
        //                     >{ formatMessage({id: "LANG4289"}, {0: 1}) }</span>
        // } else {
        //     inbondModeText = <span
        //                         key={ index }
        //                         className="status-container idle"
        //                         style={{ 'marginRight': '10px' }}
        //                     >{ formatMessage({id: "LANG4288"}) }</span>
        // }   

        switch (type) {
            case 'byDID':
                destination = <span
                                key={ index }
                                style={{ 'display': 'block' }}
                            >
                                { inbondModeText }
                                { formatMessage({ id: 'LANG1563' }) + ' -- Strip ' + rowObject.did_strip }
                            </span>
                break
            case 'account':
                destination = this._showDestination('LANG248', rowObject[type], type, inbondModeText, index)
                break
            case 'voicemail':
                destination = this._showDestination('LANG249', rowObject[type], type, inbondModeText, index)
                break
            case 'conference':
                destination = this._showDestination('LANG98', rowObject[type], undefined, inbondModeText, index)
                break
            case 'queue':
                display_name = this._getDisplayName(type, 'key', rowObject[type], 'label')

                destination = this._showDestination('LANG91', display_name, undefined, inbondModeText, index)
                break
            case 'ringgroup':
                display_name = this._getDisplayName(type, 'key', rowObject[type], 'label')

                destination = this._showDestination('LANG600', display_name, undefined, inbondModeText, index)
                break
            case 'paginggroup':
                display_name = this._getDisplayName(type, 'key', rowObject[type], 'label')

                destination = this._showDestination('LANG94', display_name, undefined, inbondModeText, index)
                break
            case 'vmgroup':
                display_name = this._getDisplayName(type, 'key', rowObject[type], 'label')

                destination = this._showDestination('LANG89', display_name, undefined, inbondModeText, index)
                break
            case 'fax':
                display_name = this._getDisplayName(type, 'key', rowObject[type], 'label')

                destination = this._showDestination('LANG95', display_name, undefined, inbondModeText, index)
                break
            case 'disa':
                display_name = this._getDisplayName(type, 'key', rowObject[type], 'label')

                destination = this._showDestination('LANG2353', display_name, undefined, inbondModeText, index)
                break
            case 'ivr':
                display_name = this._getDisplayName(type, 'key', rowObject[type], 'label')

                destination = this._showDestination('LANG134', display_name, undefined, inbondModeText, index)
                break
            case 'directory':
                display_name = this._getDisplayName(type, 'key', rowObject[type], 'label')

                destination = this._showDestination('LANG2884', display_name, undefined, inbondModeText, index)
                break
            case 'external_number':
                // display_name = this._getDisplayName(type, 'external_number', rowObject[type], 'label')

                destination = this._showDestination('LANG3458', rowObject[type], undefined, inbondModeText, index)
                break
            case 'callback':
                display_name = this._getDisplayName(type, 'key', rowObject[type], 'label')

                destination = this._showDestination('LANG3741', display_name, undefined, inbondModeText, index)
                break
            default:
                destination = <span>{ '--' }</span>
                break
        }

        return destination
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 6 }
        }

        const formItemDestinationLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
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
                width: 400,
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
                width: 800,
                key: 'destination',
                dataIndex: 'destination',
                title: formatMessage({id: "LANG168"}),
                render: (text, record, index) => (
                    // this._createDestination(text, record, index)
                    this._translateDestination(undefined, undefined, record)
                )
            }, {
                width: 800,
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => (
                    this._createOption(text, record, index)
                )
            }]

        let inboundMode = this.props.inboundMode === '1' ? 'mode_1' : 'mode_default'

        getFieldDecorator(`${inboundMode}_time_condition`, { initialValue: this.state[`${inboundMode}_timeCondition`] })

        return (
            <div className="specific-time">
                <Row className={ this.state[`${inboundMode}_currentMode`] ? 'display-block' : 'hidden' }>
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
                            { getFieldDecorator(`${inboundMode}_tc_timetype`, {
                                rules: [],
                                initialValue: this.state[`${inboundMode}_tc_timetype`] >= 6 ? '6' : this.state[`${inboundMode}_tc_timetype`]
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
                    <Col span={ 24 }>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemDestinationLayout }
                                label={(
                                    <span>
                                        <Tooltip title={ <FormattedHTMLMessage id="LANG2389" /> }>
                                            <span>{ formatMessage({id: "LANG1558"}) }</span>
                                        </Tooltip>
                                    </span>
                                )}
                            >
                                { getFieldDecorator(`${inboundMode}_destination_type`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }],
                                    initialValue: this.state[`${inboundMode}_destination_type`]
                                })(
                                    <Select onChange={ this._onChangeDestinationType }>
                                        <Option value="byDID" disabled={ this.props.currentTrunkType === 'Analog' }>{ formatMessage({id: "LANG1563"}) }</Option>
                                        <Option value="account">{ formatMessage({id: "LANG85"}) }</Option>
                                        <Option value="voicemail">{ formatMessage({id: "LANG90"}) }</Option>
                                        <Option value="conference">{ formatMessage({id: "LANG98"}) }</Option>
                                        <Option value="vmgroup">{ formatMessage({id: "LANG89"}) }</Option>
                                        <Option value="ivr">IVR</Option>
                                        <Option value="ringgroup">{ formatMessage({id: "LANG600"}) }</Option>
                                        <Option value="queue">{ formatMessage({id: "LANG91"}) }</Option>
                                        <Option value="paginggroup">{ formatMessage({id: "LANG94"}) }</Option>
                                        <Option value="fax">{ formatMessage({id: "LANG95"}) }</Option>
                                        <Option value="disa">{ formatMessage({id: "LANG2353"}) }</Option>
                                        <Option value="directory">{ formatMessage({id: "LANG2884"}) }</Option>
                                        <Option value="external_number">{ formatMessage({id: "LANG3458"}) }</Option>
                                        <Option value="callback">{ formatMessage({id: "LANG3741"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 6 }
                            className={ !this.state[`${inboundMode}_destination_type`] || this.state[`${inboundMode}_destination_type`] === 'byDID' || this.state[`${inboundMode}_destination_type`] === 'external_number' ? 'hidden' : 'display-block' }
                        >
                            <FormItem>
                                { getFieldDecorator(`${inboundMode}_destination_value`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        message: formatMessage({id: "LANG2150"}),
                                        required: this.state[`${inboundMode}_destination_type`] && this.state[`${inboundMode}_destination_type`] !== 'byDID' && this.state[`${inboundMode}_destination_type`] !== 'external_number'
                                    }],
                                    initialValue: this.state[`${inboundMode}_destination_value`]
                                })(
                                    this.state[`${inboundMode}_destination_type`]
                                        ? <Select>
                                                {
                                                    this.props.destinationDataSource[this.state[`${inboundMode}_destination_type`]].map(function(obj) {
                                                            return <Option
                                                                        key={ obj.key }
                                                                        value={ obj.value }
                                                                        className={ obj.out_of_service === 'yes' ? 'out-of-service' : '' }>
                                                                        { obj.label }
                                                                    </Option>
                                                        })
                                                }
                                            </Select>
                                        : <Select></Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col
                            span={ 6 }
                            className={ this.state[`${inboundMode}_destination_type`] === 'external_number' ? 'display-block' : 'hidden' }
                        >
                            <FormItem>
                                { getFieldDecorator(`${inboundMode}_external_number`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        message: formatMessage({id: "LANG2150"}),
                                        required: this.state[`${inboundMode}_destination_type`] === 'external_number'
                                    }],
                                    initialValue: ''
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                    </Col>
                    <Col
                        span={ 24 }
                        className={ this.state[`${inboundMode}_destination_type`] === 'byDID' ? 'display-block' : 'hidden' }
                    >
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1548" /> }>
                                        <span>{ formatMessage({id: "LANG245"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator(`${inboundMode}_did_strip`, {
                                rules: [],
                                initialValue: '0'
                            })(
                                <Input />
                            ) }
                        </FormItem>
                    </Col>
                    <Col
                        span={ 24 }
                        className={ this.state[`${inboundMode}_destination_type`] === 'byDID' ? 'display-block' : 'hidden' }
                    >
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <span>
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG1542" /> }>
                                        <span>{ formatMessage({id: "LANG1541"}) }</span>
                                    </Tooltip>
                                </span>
                            )}
                        >
                            { getFieldDecorator(`${inboundMode}_timecondition_prepend`, {
                                rules: [],
                                initialValue: ''
                            })(
                                <Input />
                            ) }
                        </FormItem>
                    </Col>
                </Row>
                <Row
                    className={ this.state[`${inboundMode}_currentMode`] && this.state[`${inboundMode}_tc_timetype`] >= 6 ? 'display-block' : 'hidden' }
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
                                    { getFieldDecorator(`${inboundMode}_tc_start_time`, {
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
                                    { getFieldDecorator(`${inboundMode}_tc_end_time`, {
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
                                value={ this.state[`${inboundMode}_weekOptionsSelected`] }
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
                            { getFieldDecorator(`${inboundMode}_tc_not_holiday`, {
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
                            { getFieldDecorator(`${inboundMode}_tc_mode`, {
                                rules: [],
                                valuePropName: 'checked',
                                initialValue: this.state[`${inboundMode}_tc_mode`]
                            })(
                                <Checkbox
                                    onChange={ this._onChangeTCMode }
                                />
                            ) }
                        </FormItem>
                    </Col>
                    <Col
                        span={ 24 }
                        className={ this.state[`${inboundMode}_tc_mode`] ? 'display-block' : 'hidden'}
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
                                value={ this.state[`${inboundMode}_monthOptionsSelected`] }
                                onChange={ this._onChangeSelectOptions.bind(this, 'monthOptionsSelected') }
                            />
                        </FormItem>
                    </Col>
                    <Col
                        span={ 24 }
                        className={ this.state[`${inboundMode}_tc_mode`] ? 'display-block' : 'hidden'}
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
                                value={ this.state[`${inboundMode}_dayOptionsSelected`] }
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
                            className={ !this.state[`${inboundMode}_currentMode`] ? 'display-inline' : 'hidden' }
                        >
                            { formatMessage({id: "LANG769"}) }
                        </Button>
                        <Button
                            icon="check"
                            type="primary"
                            onClick={ this._save }
                            className={ this.state[`${inboundMode}_currentMode`] ? 'display-inline' : 'hidden' }
                        >
                            { formatMessage({id: "LANG728"}) }
                        </Button>
                        <Button
                            icon="cross"
                            type="primary"
                            onClick={ this._cancel }
                            className={ this.state[`${inboundMode}_currentMode`] ? 'display-inline' : 'hidden' }
                        >
                            { formatMessage({id: "LANG726"}) }
                        </Button>
                    </Col>
                    <Col span={ 24 } style={{ 'margin': '20px 0 0 0' }}>
                        <Table
                            rowKey="sequence"
                            columns={ columns }
                            pagination={ false }
                            dataSource={ this.state[`${inboundMode}_timeCondition`] }
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

export default injectIntl(TimeCondition)
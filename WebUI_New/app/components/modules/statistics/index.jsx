'use strict'

import $ from 'jquery'
import '../../../css/cdrStatis'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import moment from 'moment'
import { Checkbox, Col, Form, Input, message, Row, Tooltip, Upload, Icon, Radio, Select, DatePicker, Button } from 'antd'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib//component/legend'
import 'echarts/lib//component/grid'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const Option = Select.Option
const { MonthPicker, RangePicker } = DatePicker
const currentYear = new Date().getFullYear()
const currentMonth = UCMGUI.addZero(new Date().getMonth() + 1)
const currentDate = UCMGUI.addZero(new Date().getDate())
let getData = {}
let timesData = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
let cdrDataObj = {
    allArr: [],
    inbandArr: [],
    outbandArr: [],
    incallArr: [],
    excallArr: []
}
let intDest = [],
    intExt_str = "'conf','',"

let monthlyTimestart = currentYear.toString(),
    weeklyTimestart = currentYear.toString(),
    dailyTimestart = currentYear + '-' + currentMonth,
    hourlyTimestart = currentYear + '-' + currentMonth + '-' + currentDate,
    accTimestart = currentYear + '-' + currentMonth,
    accTimeend = currentYear + '-' + currentMonth

class CdrStatic extends Component {
    constructor(props) {
        super(props)
        this.state = {
            monthly: 'display-block',
            weekly: 'hidden',
            daily: 'hidden',
            hourly: 'hidden',
            acc_hourly: 'hidden',
            all: true,
            inband: false,
            outband: false,
            incall: false,
            excall: false
        }
    }
    componentDidMount() {
        getData = {
            'action': 'getCDRStatistics',
            'service': 'all',
            'timetype': 'month',
            'timestart': currentYear,
            'calltype': 'all'
        }

        this._getDest()
        this._getInitData(getData, 'all')
    }
    _transData = (res) => {
        var arr = []

        for (var i = 0; i < res.length; i++) {
            var extension = res[i].extension

            arr.push(extension)
        }

        return arr
    }
    _weekOfYear = (year, month, day) => {
        var date1 = new Date(year, 0, 1),
            date2 = new Date(year, month - 1, day, 1),
            dayMS = 24 * 60 * 60 * 1000,
            firstDay = (7 - date1.getDay()) * dayMS,
            weekMS = 7 * dayMS

        date1 = date1.getTime()
        date2 = date2.getTime()

        return Math.ceil((date2 - date1 - firstDay) / weekMS) + 1
    }
    _changeTime = (type, value) => {
        if (type === 'month') {
            monthlyTimestart = value
        } else if (type === 'week') {
            weeklyTimestart = value
        } else if (type === 'day') {
            value = value.format('YYYY-MM')
            dailyTimestart = value
        } else if (type === 'hour') {
            value = value.format('YYYY-MM-DD')
            hourlyTimestart = value
        } else if (type === 'rangeStart') {
            value = value.format('YYYY-MM')
            accTimestart = value
        } else if (type === 'rangeEnd') {
            value = value.format('YYYY-MM')
            accTimeend = value
        }

        if (type !== 'rangeEnd') {
            getData.timestart = value
        } else if (type === 'rangeEnd') {
            getData.timeend = value
        }

        if (this.state.all) {
            this._getInitData(getData, 'all')
        }
        if (this.state.inband) {
            this._getInitData(getData, 'inband')
        }
        if (this.state.outband) {
            this._getInitData(getData, 'outband')
        }
        if (this.state.incall) {
            this._getInitData(getData, 'incall')
        }
        if (this.state.excall) {
            this._getInitData(getData, 'excall')
        }
    }
    _changeCalltype = (e) => {
        let targetValue = e.target.value,
            targetCheck = e.target.checked

        this.setState({
            [targetValue]: targetCheck
        })

        if (targetCheck) {
            this._getInitData(getData, targetValue)
        } else {
            cdrDataObj[targetValue + 'Arr'] = []

            this._showChart()
        }
    }
    _onChangeService = (e) => {
        getData.service = e.target.value

        if (this.state.all) {
            this._getInitData(getData, 'all')
        }
        if (this.state.inband) {
            this._getInitData(getData, 'inband')
        }
        if (this.state.outband) {
            this._getInitData(getData, 'outband')
        }
        if (this.state.incall) {
            this._getInitData(getData, 'incall')
        }
        if (this.state.excall) {
            this._getInitData(getData, 'excall')
        }
    }
    _onChangePeriod = (e) => {
        let val = e.target.value

        this.setState({
            monthly: 'hidden',
            weekly: 'hidden',
            daily: 'hidden',
            hourly: 'hidden',
            acc_hourly: 'hidden'
        })
        this.setState({
            [val]: 'display-block'
        })

        if (val === 'monthly') {
            getData.timetype = 'month'
            getData.timestart = monthlyTimestart

            if (getData.timeend) {
                delete getData.timeend
            }

            timesData = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
        } else if (val === 'weekly') {
            getData.timetype = 'week'
            getData.timestart = weeklyTimestart

            if (getData.timeend) {
                delete getData.timeend
            }

            timesData = []

            var num_of_week = this._weekOfYear(currentYear, 12, 31)

            for (let i = 1; i <= num_of_week; i++) {
                timesData.push(i)
            }
        } else if (val === 'daily') {
            getData.timetype = 'day'
            getData.timestart = dailyTimestart

            if (getData.timeend) {
                delete getData.timeend
            }

            timesData = []

            for (let i = 1; i <= 31; i++) {
                timesData.push(i)
            }
        } else if (val === 'hourly') {
            getData.timetype = 'hour'
            getData.timestart = hourlyTimestart

            if (getData.timeend) {
                delete getData.timeend
            }

            timesData = []

            for (let i = 0; i < 24; i++) {
                timesData.push(i)
            }
        } else if (val === 'acc_hourly') {
            getData.timetype = 'range'
            getData.timestart = accTimestart
            getData.timeend = accTimeend

            timesData = []

            for (let i = 0; i < 24; i++) {
                timesData.push(i)
            }
        }

        if (this.state.all) {
            this._getInitData(getData, 'all')
        }
        if (this.state.inband) {
            this._getInitData(getData, 'inband')
        }
        if (this.state.outband) {
            this._getInitData(getData, 'outband')
        }
        if (this.state.incall) {
            this._getInitData(getData, 'incall')
        }
        if (this.state.excall) {
            this._getInitData(getData, 'excall')
        }
    }
    _getDest = () => {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        intDest = this._transData(UCMGUI.isExist.getList('getAccountList', formatMessage))

        let fxsPorts = []
        if (model_info.num_fxs) {
            let length = parseInt(model_info.num_fxs, 10),
                fxoPortsLength = model_info.num_fxo ? parseInt(model_info.num_fxo, 10) : 0,
                i = 1

            for (i; i <= length; i++) {
                fxsPorts.push((fxoPortsLength + i) + '')
            }
        }

        if (fxsPorts.length > 0) {
            intDest = intDest.concat(fxsPorts)
        }

        for (let i = 0; i < intDest.length; i++) {
            if (i < intDest.length - 1) {
                intExt_str += "'" + intDest[i] + "',"
            } else {
                intExt_str += "'" + intDest[i] + "'"
            }
        }

        if (intDest.length === 0) {
            intExt_str = "'conf',''"
        }
    }
    _getInitData = (getData, calltype) => {
        if (calltype) {
            getData.calltype = calltype
        }

        if (calltype === 'all') {
            if (getData.callinfo) {
                delete getData.callinfo
            }
        } else {
            getData.callinfo = intExt_str
        }

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: getData,
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let calltype = getData.calltype,
                    cdrData = data.response.cdrstatistics.cdr

                cdrDataObj[calltype + 'Arr'] = cdrData

                this._showChart()
            }.bind(this)
        })
    }
    _showChart = () => {
        const { formatMessage } = this.props.intl
        let cdrStatisChart = echarts.init(document.getElementById('statistics'))

        const option = {
            title: {
            },
            tooltip: {
                trigger: 'axis'
            },
            color: ['#4875F0', '#0dc3e1', '#fe980e', '#ff4179', '#6f18cc'],
            legend: {
            },
            toolbox: {
                show: false,
                feature: {
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: timesData
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: formatMessage({id: "LANG197"}),
                    type: 'line',
                    data: cdrDataObj.allArr
                }, {
                    name: formatMessage({id: "LANG193"}),
                    type: 'line',
                    data: cdrDataObj.inbandArr
                }, {
                    name: formatMessage({id: "LANG194"}),
                    type: 'line',
                    data: cdrDataObj.outbandArr
                }, {
                    name: formatMessage({id: "LANG195"}),
                    type: 'line',
                    data: cdrDataObj.incallArr
                }, {
                    name: formatMessage({id: "LANG196"}),
                    type: 'line',
                    data: cdrDataObj.excallArr
                }
            ]
        }

        cdrStatisChart.setOption(option)
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, setFieldValue, getFieldValue } = this.props.form
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 12 }
        }
        const formItemOffsetLayout = {
            wrapperCol: { span: 12, offset: 3 }
        }

        const title = formatMessage({id: "LANG593"})

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        let numYear = 5,
            arrayYear = [],
            yearMonth = currentYear + '-' + currentMonth,
            yearMonthDate = yearMonth + '-' + currentDate

        for (let i = 0; i < numYear; i++) {
            arrayYear.push((currentYear - i).toString())
        }

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    isDisplay='hidden'/>
                <div className="content">
                    <Form>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG5134" /> }>
                                    <span>{ formatMessage({id: "LANG5134"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('service_choices', {
                                initialValue: 'all_service'
                            })(
                                <RadioGroup onChange={ this._onChangeService }>
                                    <Radio value="all_service">{ formatMessage({id: "LANG104"}) }</Radio>
                                    <Radio value="sip">{ formatMessage({id: "LANG191"}) }</Radio>
                                    <Radio value="pstn">{ formatMessage({id: "LANG192"}) }</Radio>
                                    <Radio value="digital">{ formatMessage({id: "LANG5379"}) }</Radio>
                                    <Radio value="iax">{ formatMessage({id: "LANG5380"}) }</Radio>
                                </RadioGroup>
                            ) }
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2308" /> }>
                                    <span>{ formatMessage({id: "LANG2308"}) }</span>
                                </Tooltip>
                            )}
                        >
                            { getFieldDecorator('period_choices', {
                                initialValue: 'monthly'
                            })(
                                <RadioGroup onChange={ this._onChangePeriod }>
                                    <Radio value="monthly">{ formatMessage({id: "LANG198"}) }</Radio>
                                    <Radio value="weekly">{ formatMessage({id: "LANG199"}) }</Radio>
                                    <Radio value="daily">{ formatMessage({id: "LANG200"}) }</Radio>
                                    <Radio value="hourly">{ formatMessage({id: "LANG201"}) }</Radio>
                                    <Radio value="acc_hourly">{ formatMessage({id: "LANG202"}) }</Radio>
                                </RadioGroup>
                            ) }
                        </FormItem>
                        <FormItem { ...formItemOffsetLayout }>
                            <div className={ this.state.monthly }>
                                <Select
                                    style={{ width: 200 }}
                                    onChange={ this._changeTime.bind(this, 'month') }
                                    defaultValue={ currentYear.toString() }
                                >
                                    {
                                        arrayYear.map(function(value, index) {
                                            return <Option value={ value } key={ index }>{ value }</Option>
                                        })
                                    }
                                </Select>
                            </div>
                            <div className={ this.state.weekly }>
                                <Select
                                    style={{ width: 200 }}
                                    onChange={ this._changeTime.bind(this, 'week') }
                                    defaultValue={ currentYear.toString() }
                                >
                                    {
                                        arrayYear.map(function(value, index) {
                                            return <Option value={ value } key={ index }>{ value }</Option>
                                        })
                                    }
                                </Select>
                            </div>
                            <div className={ this.state.daily }>
                                <MonthPicker
                                    defaultValue={ moment(yearMonth, 'YYYY-MM') }
                                    format={ 'YYYY-MM' }
                                    onChange={ this._changeTime.bind(this, 'day')} />
                            </div>
                            <div className={ this.state.hourly }>
                                <DatePicker
                                    defaultValue={ moment(yearMonthDate, 'YYYY-MM-DD') }
                                    format={ 'YYYY-MM-DD' }
                                    onChange={ this._changeTime.bind(this, 'hour') }/>
                            </div>
                            <div className={ this.state.acc_hourly }>
                                <MonthPicker
                                    defaultValue={ moment(yearMonth, 'YYYY-MM') }
                                    format={ 'YYYY-MM' } style={{ marginRight: 10 }}
                                    onChange={ this._changeTime.bind(this, 'rangeStart') }/>
                                { formatMessage({id: "LANG171"}) }
                                <MonthPicker
                                    defaultValue={ moment(yearMonth, 'YYYY-MM') }
                                    format={ 'YYYY-MM' }
                                    style={{ marginLeft: 10 }}
                                    onChange={ this._changeTime.bind(this, 'rangeEnd') } />
                            </div>
                        </FormItem>
                        <FormItem
                            { ...formItemLayout }
                            label={(
                                <Tooltip title={ <FormattedHTMLMessage id="LANG2235" /> }>
                                    <span>{ formatMessage({id: "LANG2235"}) }</span>
                                </Tooltip>
                            )}
                        >
                            <Checkbox 
                                nChange={ this._onChangeCallType }
                                value="all"
                                checked={ this.state.all }
                                onChange={ this._changeCalltype }
                            >
                                { formatMessage({id: "LANG197"}) }
                            </Checkbox>
                            <span className="call-span all-span"></span>
                            <Checkbox
                                onChange={ this._onChangeCallType }
                                value="inband"
                                checked={ this.state.inband }
                                onChange={ this._changeCalltype }
                            >
                                { formatMessage({id: "LANG193"}) }
                            </Checkbox>
                            <span className="call-span inbound-span"></span>
                            <Checkbox
                                onChange={ this._onChangeCallType }
                                value="outband"
                                checked={ this.state.outband }
                                onChange={ this._changeCalltype }
                            >
                                { formatMessage({id: "LANG194"}) }
                            </Checkbox>
                            <span className="call-span outbound-span"></span>
                            <Checkbox
                                onChange={ this._onChangeCallType }
                                value="incall"
                                checked={ this.state.incall }
                                onChange={ this._changeCalltype }
                            >
                                { formatMessage({id: "LANG195"}) }
                            </Checkbox>
                            <span className="call-span internal-span"></span>
                            <Checkbox
                                onChange={ this._onChangeCallType }
                                value="excall"
                                checked={ this.state.excall }
                                onChange={ this._changeCalltype }
                            >
                                { formatMessage({id: "LANG196"}) }
                            </Checkbox>
                            <span className="call-span external-span"></span>
                        </FormItem>
                    </Form>
                    <div style={{ backgroundColor: '#fff' }}>
                        <div id="statistics" style={{ height: 470 }}></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Form.create()(injectIntl(CdrStatic))
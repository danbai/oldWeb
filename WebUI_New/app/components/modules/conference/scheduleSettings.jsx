'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import Validator from "../../api/validator"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl'
import { Checkbox, Col, Form, Input, message, Row, Select, Tooltip, Modal, DatePicker, Popconfirm, Icon } from 'antd'
import moment from 'moment'

const FormItem = Form.Item
const Option = Select.Option
let uuid = 1
let limitConferenceMembers = 25

class ScheduleSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            conference: [],
            transAccountList: [],
            remoteExtList: [],
            bCandler: true,
            aMeetList: []
        }
    }
    componentDidMount() {
        this._getInitData()
        this._getConfoList()
        this._getLimit()
    }
    _emailConfirm = () => {
        browserHistory.push('/system-settings/emailSettings/template')
    }
    _googleConfirm = () => {
        browserHistory.push('/call-features/conference/3')
    }
    _getLimit = () => {
        let model_info = JSON.parse(localStorage.getItem('model_info'))

        let conferenceRange = UCMGUI.isExist.getRange('conference')

        let numFxo = Number(model_info.num_fxo),
            numPri = model_info.num_pri

        if (numPri >= 1) {
            limitConferenceMembers = 64
        }

        if (numFxo > 4) {
            limitConferenceMembers = 32
        }
    }
    _transLocale = (res) => {
        var arr = [],
            ele, firstname, lastname, username, email, fullname

        for (var i = 0; i < res.users.length; i++) {
            ele = res.users[i]
            firstname = ele.first_name
            lastname = ele.last_name
            username = ele.user_name
            email = ele.email

            if (firstname && lastname) {
                fullname = '"' + firstname + ' ' + lastname + '"'
            } else if (firstname) {
                fullname = '"' + firstname + '"'
            } else if (lastname) {
                fullname = '"' + lastname + '"'
            } else {
                fullname = ''
            }

            arr.push({
                text: username + ' ' + fullname,
                val: username,
                attr: email ? email : ''
            })
        }

        return arr
    }
    _transRemote = (res) => {
        var arr = [],
            ele, firstname, lastname, accountnumber, email, phonebook, fullname

        for (var i = 0; i < res.phonebooks.length; i++) {
            ele = res.phonebooks[i]
            firstname = ele.firstname
            lastname = ele.lastname
            accountnumber = ele.accountnumber
            email = ele.email
            phonebook = ele.phonebook_dn

            if (firstname && lastname) {
                fullname = '"' + firstname + ' ' + lastname + '"'
            } else if (firstname) {
                fullname = '"' + firstname + '"'
            } else if (lastname) {
                fullname = '"' + lastname + '"'
            } else {
                fullname = ''
            }

            arr.push({
                text: phonebook.split(',')[0].slice(3) + '--' + accountnumber + ' ' + fullname,
                val: accountnumber,
                attr: email ? email : ''
            })
        }

        return arr
    }
    _getInitData = () => {
        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'listConfStatus'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                var list = data.response.conference

                if (list && list.length > 0) {
                    this.setState({
                        conference: list
                    })
                }
            }.bind(this)
        })

        let accountList = UCMGUI.isExist.getList("getUserList")
        let transAccountList = this._transLocale(accountList)

        let remoteList = UCMGUI.isExist.getList("getRemoteUser")
        let remoteExtList = this._transRemote(remoteList)

        this.setState({
            transAccountList: transAccountList,
            remoteExtList: remoteExtList
        })

        $.ajax({
            url: api.apiHost,
            type: "post",
            data: {
                'action': 'getGoogleAccountCal'
            },
            async: false,
            error: function(e) {
                message.error(e.statusText)
            },
            success: function(data) {
                let res = data.response,
                    calendarName = res.googlecalendar.calendar_name.slice(0, -1)

                if (calendarName !== "anonymous@gmail.com" &&
                    calendarName !== "" &&
                    calendarName.match(/^([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+$/)) {
                    this.setState({
                        bCandler: false
                    })
                }
            }.bind(this)
        })
    }
    _getConfoList = (startTime, endTime) => {
        let data = {
            action: 'listMeetmeInfo',
            sidx: "starttime",
            sord: "asc"
        }

        data.starttime = startTime
        data.endtime = endTime

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: data,
            dataType: 'json',
            success: function(res) {
                let aMeetList = this.state.aMeetList || []
                let confoList = res.response || {}
                _.map(confoList, function(item, key) {
                     _.each(item, function(conf, key) {
                        var bookid = conf.bookid,
                            confno = conf.confno,
                            starttime = conf.starttime,
                            endtime = conf.endtime,
                            recurr = conf.recurringevent
                        aMeetList.push({
                            confno: confno,
                            starttime: starttime,
                            endtime: endtime,
                            bookid: bookid,
                            recurr: recurr
                        })
                    })
                })
                this.setState({
                    aMeetList: aMeetList
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _addList = () => {
        uuid++

        const { form } = this.props
        const { formatMessage } = this.props.intl

        const extenLists = form.getFieldValue('extenLists')
        const nextKeys = extenLists.concat(uuid)

        form.setFieldsValue({
            extenLists: nextKeys
        })
    }
    _removeList = (k) => {
        const { form } = this.props
        // can use data-binding to get
        const extenLists = form.getFieldValue('extenLists')

        // can use data-binding to set
        form.setFieldsValue({
            extenLists: extenLists.filter(key => key !== k)
        })
    }
    _renderEndTime = (starttime, endtime) => {
        if (!starttime) {
            return '15'
        }

        var nShour = parseInt(starttime.slice(11, 13), 10),
            nSmin = parseInt(starttime.slice(14, 16), 10),
            nEhour = parseInt(endtime.slice(11, 13), 10),
            nEmin = parseInt(endtime.slice(14, 16), 10)

        return ((nEhour - nShour) * 60 + nEmin - nSmin).toString()
    }
    _checkMemberTelRequired = (data, val, callback, formatMessage, name, mail) => {
        if (val === "" && (name !== "" || mail !== "")) {
            callback(formatMessage({id: "LANG4172"}))
        } else {
            callback()
        }
    }
    _checkFormat = (data, val, callback, formatMessage) => {
        if (val && val.match(/['"`]/)) {
            callback(formatMessage({id: "LANG4465"}))
        } else {
            callback()
        }
    }
    _addZero = (n) => {
        if (n < 10) {
            n = "0" + n
        }
        return n
    }
    _getCurrentTime = () => {
       let currentTime = '1970-01-01 00:00:00 UTC+08:00'

       $.ajax({
               datatype: 'json',
               type: 'post',
               url: api.apiHost,
               data: {
                   "action": 'checkInfo'
               },
               async: false,
               success: function(data) {
                   if (data && data.status === 0) {
                       currentTime = data.response.current_time
                   }
               },
               error: function(e) {
                   console.log(e.statusText)
               }
           })

       return currentTime
   }
    _checkStartTime = (data, value, callback, formatMessage) => {
        const { form } = this.props
        const id = this.props.id
        const meetList = this.props.meetList || {}
        let editRecurringevent = meetList.recurringevent
        let starttime = meetList.starttime
        let res = false
        let val = value ? value.format('YYYY-MM-DD HH:mm:ss') : ""

        var nClickTime = parseInt(form.getFieldValue('kickall_time'), 10),
            sNow = this._getCurrentTime(),
            sNowHour = parseInt(sNow.slice(11, 13), 10),
            sNowMinute = parseInt(sNow.slice(14, 16), 10) + nClickTime

        if (sNowMinute >= 60) {
            sNowMinute = sNowMinute - 60
            sNowHour = sNowHour + 1
        }

        sNow = sNow.slice(0, 11) + this._addZero(sNowHour) + ':' + this._addZero(sNowMinute) + ':00'

        if (id && editRecurringevent !== 'COMMON' && starttime === val) {
            res = true
        }

        if (val >= sNow) {
            res = true
        }

        if (res === false) {
            callback(formatMessage({id: "LANG3786"}))
        } else {
            callback()
        }
    }
    _getRecurr = (startTime) => {
        var myDate = new Date(),
            repeatYear = parseInt(startTime.slice(0, 4), 10),
            repeatMon = parseInt(startTime.slice(5, 7), 10) - 1,
            repeatDay = parseInt(startTime.slice(8, 10), 10)

        myDate.setFullYear(repeatYear, repeatMon, repeatDay)
        var repeatData = myDate.getDay()

        switch (repeatData) {
            case 0:
                return "Esunday"
            case 1:
                return "Fmonday"
            case 2:
                return "Gtuesday"
            case 3:
                return "Hwednesday"
            case 4:
                return "Ithursday"
            case 5:
                return "Jfriday"
            case 6:
                return "Ksaturday"
        }
    }
    _checkTimeConflict = (data, value, callback, formatMessage) => {
        const { form } = this.props
        const id = this.props.id
        var aMeetList = this.state.aMeetList,
            confno = form.getFieldValue('confno'),
            starttime = value ? value.format('YYYY-MM-DD HH:mm:ss') : "",
            nMinute = form.getFieldValue('endtime'),
            nEhour = parseInt(starttime.slice(11, 13), 10) + Math.floor(nMinute / 60),
            nEmin = parseInt(starttime.slice(14, 16), 10) + nMinute % 60,
            nClickTime = parseInt(form.getFieldValue('kickall_time'))
        let res = true
        if (nEmin >= 60) {
            nEmin = nEmin - 60
            nEhour = nEhour + 1
        }

        var endtime = starttime.slice(0, 11) + this._addZero(nEhour) + ':' + this._addZero(nEmin) + ':00',
            endtimeClear = endtime.slice(0, 14) + (Number(endtime.slice(14, 16)) + nClickTime) + ':00',
            startTimeDay = starttime.slice(0, 10),
            endtimeDay = endtime.slice(0, 10),
            startTimeHour = starttime.slice(11, 16),
            endTimeHour = endtime.slice(11, 16),
            ele, eleStartTime, eleEndTime, eleConfno, eleRecurr, eleStartTimeDay, eleEndTimeDay, eleStartTimeHour, eleEndTimeHour,
            sRecurr = form.getFieldValue('recurringevent')

        if (sRecurr === 'WEEKLY') {
            sRecurr = this._getRecurr(starttime)
        }

        for (var i = 0; i < aMeetList.length; i++) {
            ele = aMeetList[i]
            eleStartTime = ele.starttime
            eleEndTime = ele.endtime
            let eleEndTimeClear = eleEndTime.slice(0, 14) + (Number(eleEndTime.slice(14, 16)) + nClickTime) + ':00'
            eleConfno = ele.confno
            eleRecurr = ele.recurr
            eleStartTimeDay = eleStartTime.slice(0, 10)
            eleEndTimeDay = eleEndTime.slice(0, 10)
            eleStartTimeHour = eleStartTime.slice(11, 16)
            eleEndTimeHour = eleEndTime.slice(11, 16)

            if ((id && id === ele.bookid) || confno !== eleConfno) {
                continue
            }

            if (sRecurr === 'COMMON') {
                if (eleRecurr === 'COMMON') {
                    if (starttime < eleEndTimeClear && endtimeClear > eleStartTime) {
                        res = false
                    }
                } else if (eleRecurr === 'DAILY') {
                    if (startTimeDay >= eleStartTimeDay && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                        res = false
                    }
                } else if (this._getRecurr(starttime) === eleRecurr && startTimeDay >= eleStartTimeDay && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                    res = false
                }
            } else if (sRecurr === 'DAILY') {
                if (eleRecurr === 'COMMON') {
                    if (startTimeDay <= eleStartTimeDay && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                        res = false
                    }
                } else if (startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                    res = false
                }
            } else {
                if (eleRecurr === 'COMMON') {
                    if (this._getRecurr(eleStartTime) === sRecurr && startTimeDay <= eleStartTimeDay && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                        res = false
                    }
                } else if (eleRecurr === 'DAILY') {
                    if (startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                        res = false
                    }
                } else if (sRecurr === this._getRecurr(eleStartTime) && startTimeHour < eleEndTimeHour && endTimeHour > eleStartTimeHour) {
                    res = false
                }
            }
        }

        if (res === false) {
            callback(formatMessage({id: "LANG3812"}))
        } else {
            callback()
        }
    }
    _checkEndTime = (data, val, callback, formatMessage) => {
        const { form } = this.props
        let starttime = form.getFieldValue('starttime')
        let stime = starttime ? starttime.format('YYYY-MM-DD HH:mm:ss') : starttime
        var nStartHour = parseInt(stime.slice(11, 13), 10),
            nStartMinute = parseInt(stime.slice(14, 16), 10),
            nEhour = Math.floor(val / 60) + nStartHour

        if (nEhour >= 24 || (nEhour >= 23 && (val % 60 + nStartMinute) > 59)) {
            callback(formatMessage({id: "LANG3785"}))
        } else {
            callback()
        }
    }
    _checkOtherValue = (data, val, callback, formatMessage, item) => {
        const { form } = this.props
        form.validateFields([item], { force: true })

        return callback()
    }
    _checkTotalMembers = (data, val, callback, formatMessage) => {
        const { form } = this.props
        var nTotal = form.getFieldValue('localeRightSelect').length + form.getFieldValue('remoteRightSelect').length,
            sName, sTel, sMail

        // $('#add_people').find('tbody').find('tr').each(function() {
        //     sName = $(this).find('.member_name').val();
        //     sTel = $(this).find('.member_tel').val();
        //     sMail = $(this).find('.member_mail').val();

        //     if (sName !== '' || sTel !== '' || sMail !== '') {
        //         nTotal += 1;
        //     }
        // });

        if (form.getFieldValue('create_remote_room')) {
            nTotal += 1
        }

        if (nTotal > limitConferenceMembers) {
            callback(formatMessage({id: "LANG3796"}, {0: limitConferenceMembers}))
        } else {
            callback()
        }
    }
    _checkRequire = (data, val, callback, formatMessage) => {
        const { form } = this.props
        let pass = form.getFieldValue('create_remote_pass')

        if ((pass !== '' && pass !== undefined) && !val) {
            callback(formatMessage({id: "LANG2150"}))
        } else {
            callback()
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const { getFieldDecorator, getFieldValue } = this.props.form
        const form = this.props.form

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
        }

        const formItemLayoutRemote = {
            labelCol: { span: 9 },
            wrapperCol: { span: 12 }
        }

        const meetList = this.props.meetList || {}

        let aMembers = meetList.members ? meetList.members : [],
            localeRightSelectArray = [],
            remoteRightSelectArray = [],
            specialArray = [],
            remoteObj = {},
            conAdmin = '',
            localeSendEmail,
            remoteSendEmail

        _.each(aMembers, function(item, key) {
            let location = item.location,
                extension = item.member_extension,
                bSendEmail = item.send_email === 'yes',
                membername = item.member_name,
                sState = item.state,
                sComment = item.comment

            if (location === 'local') {
                localeRightSelectArray.push(extension)
                localeSendEmail = bSendEmail
            } else if (location === 'remote') {
                remoteRightSelectArray.push(extension)
                remoteSendEmail = bSendEmail
            } else if (location === 'special') {
                specialArray.push({
                    membername: membername,
                    extension: extension,
                    bSendEmail: bSendEmail,
                    email: item.email
                })
            } else if (location === 'mcb') {
                remoteObj.member_extension = extension
                remoteObj.private_data = item.private_data
            }

            if (item.is_admin === 'yes') {
                conAdmin = item.member_extension
            }
        })

        let keyList = []
        for (let k = 1; k < specialArray.length; k++) {
            keyList.push(k)
        }

        getFieldDecorator('extenLists', { initialValue: keyList })

        const extenLists = getFieldValue('extenLists')

        const SpecialExtenFormItems = extenLists.map((k, index) => {
            return <Row key={ k }>
                        <Col span={ 8 }>
                            <FormItem
                                { ...formItemLayoutRemote }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4461" /> }>
                                        <span>{ formatMessage({id: "LANG3778"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator(`member_name${k}`, {
                                    initialValue: specialArray[k] ? specialArray[k].membername : ''
                                })(
                                    <Input placeholder={ formatMessage({id: "LANG2026"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 4 } style={{ marginRight: 20 }}>
                            <FormItem>
                                { getFieldDecorator(`member_tel${k}`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            let member_name = form.getFieldValue(`member_name${k}`)
                                            let member_mail = form.getFieldValue(`member_mail${k}`)
                                            this._checkMemberTelRequired(data, value, callback, formatMessage, member_name, member_mail)
                                        }
                                    }],
                                    initialValue: specialArray[k] ? specialArray[k].extension : ''
                                })(
                                    <Input placeholder={ formatMessage({id: "LANG3781"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 4 } style={{ marginRight: 20 }}>
                            <FormItem>
                                { getFieldDecorator(`member_mail${k}`, {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.email(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: specialArray[k] ? specialArray[k].email : ''
                                })(
                                    <Input placeholder={ formatMessage({id: "LANG2032"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col lg={ 3 } xl={ 2 }>
                            <FormItem>
                                <span style={{marginRight: 10}}>{ formatMessage({id: "LANG3782"}) }</span>
                            </FormItem>
                        </Col>
                        <Col span={ 1 }>
                            <FormItem>
                                { getFieldDecorator(`special_send_email${k}`, {
                                    valuePropName: 'checked',
                                    initialValue: specialArray[k] ? specialArray[k].bSendEmail : false
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 1 }>
                            <FormItem>
                                <Icon
                                    type="minus-circle-o"
                                    onClick={ () => this._removeList(k) }
                                    className="dynamic-network-button" />
                            </FormItem>
                        </Col>
                    </Row>
        })

        let conference = this.state.conference

        return (
            <div className="content">
                <div className="ant-form">
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4455" /> }>
                                        <span>{ formatMessage({id: "LANG3783"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('confname', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this._checkFormat(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: meetList.confname
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4456" /> }>
                                        <span>{ formatMessage({id: "LANG3777"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('confno', {
                                    initialValue: meetList.confno || conference[0] && conference[0].extension
                                })(
                                    <Select>
                                        {
                                            this.state.conference.map(function(value, index) {
                                                return <Option value={ value.extension } key={ index }>{ value.extension }</Option>
                                            })
                                        }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4460" /> }>
                                        <span>{ formatMessage({id: "LANG4309"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('con_admin', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            !this.state.publicEnable ? Validator.digits(data, value, callback, formatMessage) : callback()
                                        }
                                    }],
                                    initialValue: conAdmin
                                })(
                                    <Input disabled={ this.props.publicEnable }/>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4457" /> }>
                                        <span>{ formatMessage({id: "LANG4281"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('kickall_time', {
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
                                            Validator.maxlength(data, value, callback, formatMessage, 2)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.range(data, value, callback, formatMessage, 6, 30)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this._checkOtherValue(data, value, callback, formatMessage, "starttime")
                                        }
                                    }],
                                    initialValue: meetList.kickall_time || '10'
                                })(
                                    <Input />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3808" /> }>
                                        <span>{ formatMessage({id: "LANG3807"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('starttime', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        required: true,
                                        message: formatMessage({id: "LANG2150"})
                                    }, {
                                        validator: (data, value, callback) => {
                                            this._checkStartTime(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this._checkTimeConflict(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: (meetList.starttime ? moment(meetList.starttime, 'YYYY-MM-DD HH:mm:ss') : '')
                                })(
                                    <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2230" /> }>
                                        <span>{ formatMessage({id: "LANG2230"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('endtime', {
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
                                            Validator.range(data, value, callback, formatMessage, 1, 1440)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this._checkEndTime(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: this._renderEndTime(meetList.starttime, meetList.endtime)
                                })(
                                    <Select>
                                        <Option value='15'>15</Option>
                                        <Option value='30'>30</Option>
                                        <Option value='45'>45</Option>
                                        <Option value='60'>60</Option>
                                        <Option value='75'>75</Option>
                                        <Option value='90'>90</Option>
                                        <Option value='105'>105</Option>
                                        <Option value='120'>120</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row className={ this.props.id ? 'hidden' : '' }>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4459" /> }>
                                        <span>{ formatMessage({id: "LANG3803"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('recurringevent', {
                                    initialValue: meetList.recurringevent || 'COMMON'
                                })(
                                    <Select>
                                        <Option value='COMMON'>{ formatMessage({id: "LANG3806"}) }</Option>
                                        <Option value='DAILY'>{ formatMessage({id: "LANG3804"}) }</Option>
                                        <Option value='WEEKLY'>{ formatMessage({id: "LANG3805"}) }</Option>
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3801" /> }>
                                        <span>{ formatMessage({id: "LANG3791"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('open_calendar', {
                                    valuePropName: 'checked',
                                    initialValue: meetList.open_calendar === 'yes'
                                })(
                                    <Checkbox disabled={ this.state.bCandler } />
                                ) }
                                <Popconfirm
                                    onConfirm={ this._googleConfirm }
                                    okText={ formatMessage({id: "LANG136"}) }
                                    cancelText={ formatMessage({id: "LANG137"}) }
                                    title={ <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG3513"})}) }}></span> }
                                >
                                    <a href="#" style={{ marginLeft: 20 }}>{ formatMessage({id: "LANG3513"}) }</a>
                                </Popconfirm>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4462" /> }>
                                        <span>{ formatMessage({id: "LANG2479"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('localeRightSelect', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this._checkTotalMembers(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: localeRightSelectArray
                                })(
                                    <Select multiple>
                                        {
                                            this.state.transAccountList.map(function(value, index) {
                                                return <Option value={ value.val } key={ index }>{ value.text }</Option>
                                            })
                                        }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3782" /> }>
                                        <span>{ formatMessage({id: "LANG3782"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('locale_send_email', {
                                    valuePropName: 'checked',
                                    initialValue: localeSendEmail
                                })(
                                    <Checkbox />
                                ) }
                                <Popconfirm
                                    onConfirm={ this._emailConfirm }
                                    okText={ formatMessage({id: "LANG136"}) }
                                    cancelText={ formatMessage({id: "LANG137"}) }
                                    title={ <span dangerouslySetInnerHTML={{ __html: formatMessage({id: "LANG843"}, {0: formatMessage({id: "LANG4572"})}) }}></span> }
                                >
                                    <a href="#" style={{ marginLeft: 20 }}>{ formatMessage({id: "LANG4572"}) }</a>
                                </Popconfirm>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG2531" /> }>
                                        <span>{ formatMessage({id: "LANG2480"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('remoteRightSelect', {
                                    initialValue: remoteRightSelectArray
                                })(
                                    <Select multiple>
                                        {
                                            this.state.remoteExtList.map(function(value, index) {
                                                return <Option value={ value.val } key={ index }>{ value.text }</Option>
                                            })
                                        }
                                    </Select>
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG3782" /> }>
                                        <span>{ formatMessage({id: "LANG3782"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('remote_send_email', {
                                    valuePropName: 'checked',
                                    initialValue: remoteSendEmail
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 8 }>
                            <FormItem
                                { ...formItemLayoutRemote }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4461" /> }>
                                        <span>{ formatMessage({id: "LANG3778"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('member_name', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.cidName(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: specialArray[0] ? specialArray[0].membername : ''
                                })(
                                    <Input placeholder={ formatMessage({id: "LANG2026"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 4 } style={{ marginRight: 20 }}>
                            <FormItem>
                                { getFieldDecorator('member_tel', {
                                    initialValue: specialArray[0] ? specialArray[0].extension : ''
                                })(
                                    <Input placeholder={ formatMessage({id: "LANG3781"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 4 } style={{ marginRight: 20 }}>
                            <FormItem>
                                { getFieldDecorator('member_mail', {
                                    initialValue: specialArray[0] ? specialArray[0].email : ''
                                })(
                                    <Input placeholder={ formatMessage({id: "LANG2032"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col xl={ 2 } lg={ 3 }>
                            <FormItem>
                                <span>{ formatMessage({id: "LANG3782"}) }</span>
                            </FormItem>
                        </Col>
                        <Col span={ 1 }>
                            <FormItem>
                                { getFieldDecorator('special_send_email', {
                                    valuePropName: 'checked',
                                    initialValue: specialArray[0] ? specialArray[0].bSendEmail : false
                                })(
                                    <Checkbox />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 1 }>
                            <FormItem>
                                <Icon
                                    type="plus-circle-o"
                                    onClick={ this._addList }
                                    className="dynamic-network-button" />
                            </FormItem>
                        </Col>
                    </Row>
                    { SpecialExtenFormItems }
                    <Row>
                        <Col span={ 8 }>
                            <FormItem
                                { ...formItemLayoutRemote }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4479" /> }>
                                        <span>{ formatMessage({id: "LANG4478"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('create_remote_room', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            this._checkRequire(data, value, callback, formatMessage)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: remoteObj.member_extension
                                })(
                                    <Input placeholder={ formatMessage({id: "LANG2693"}) } />
                                ) }
                            </FormItem>
                        </Col>
                        <Col span={ 4 }>
                            <FormItem>
                                { getFieldDecorator('create_remote_pass', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.digits(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: remoteObj.private_data
                                })(
                                    <Input placeholder={ formatMessage({id: "LANG2694"}) } />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={ 12 }>
                            <FormItem
                                { ...formItemLayout }
                                label={(
                                    <Tooltip title={ <FormattedHTMLMessage id="LANG4458" /> }>
                                        <span>{ formatMessage({id: "LANG3799"}) }</span>
                                    </Tooltip>
                                )}
                            >
                                { getFieldDecorator('description', {
                                    getValueFromEvent: (e) => {
                                        return UCMGUI.toggleErrorMessage(e)
                                    },
                                    rules: [{
                                        validator: (data, value, callback) => {
                                            Validator.maxlength(data, value, callback, formatMessage, 499)
                                        }
                                    }, {
                                        validator: (data, value, callback) => {
                                            this._checkFormat(data, value, callback, formatMessage)
                                        }
                                    }],
                                    initialValue: meetList.description
                                })(
                                    <Input type="textarea" />
                                ) }
                            </FormItem>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default injectIntl(ScheduleSettings)
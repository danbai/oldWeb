'use strict'

import $ from 'jquery'
import _ from 'underscore'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { injectIntl } from 'react-intl'
import Title from '../../../views/title'
import { Form, Input, message, Tabs, Modal } from 'antd'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from '../../../actions/'

import ScheduleSettings from './scheduleSettings'
import ScheduleConference from './scheduleConference'

const TabPane = Tabs.TabPane
let editRecurringevent = ''

class ScheduleIndex extends Component {
    constructor(props) {
        super(props)
        this.state = {
            meetList: {},
            publicEnable: true,
            activeKey: "1"
        }
    }
    componentDidMount() {
        
    }
    componentWillMount() {
        this._getInitData()
    }
    _getInitData = () => {
        const bookid = this.props.params.id

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'getMeetme',
                bookid: bookid
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    let meetList = response.bookid

                    editRecurringevent = meetList.recurringevent

                    this.setState({
                        meetList: meetList,
                        publicEnable: meetList.public ? (meetList.public === 'yes') : true
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _addZero = (n) => {
        if (n < 10) {
            n = "0" + n
        }
        return n
    }
    _handleCancel = (e) => {
        browserHistory.push('/call-features/conference')
    }
    _getRecurr = (startTime) => {
        let myDate = new Date(),
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
    _handleSubmit = () => {
        let errorMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl
        const { getFieldValue } = this.props.form
        let bookId = this.props.params.id

        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)

                this.props.setSpinLoading({loading: true, tip: formatMessage({id: "LANG826" })})

                let _this = this,
                    aList = [],
                    localeRightSelect = values.localeRightSelect,
                    remoteRightSelect = values.remoteRightSelect,
                    sRemoteRoom = values.create_remote_room,
                    sRemotePass = values.create_remote_pass,
                    sConAdmin = values.con_admin,
                    mailType = '',
                    aUpdated = []

                _.each(localeRightSelect, function(item, key) {
                    aList.push({
                        'member_name': item,
                        'member_extension': item,
                        'email': '',
                        'send_email': values.locale_send_email ? 'yes' : 'no',
                        'location': 'local',
                        'is_admin': (!_this.state.publicEnable && item === sConAdmin) ? 'yes' : 'no',
                        'state': 'needsAction',
                        'comment': ''
                    })
                })

                _.each(remoteRightSelect, function(item, key) {
                    aList.push({
                        'member_name': item,
                        'member_extension': item,
                        'email': '',
                        'send_email': values.remote_send_email ? 'yes' : 'no',
                        'location': 'remote',
                        'is_admin': (!_this.state.publicEnable && item === sConAdmin) ? 'yes' : 'no',
                        'state': 'needsAction',
                        'comment': ''
                    })
                })

                if (sRemoteRoom) {
                    let oMcb = {
                        'member_name': sRemoteRoom,
                        'member_extension': sRemoteRoom,
                        'email': '',
                        'send_email': 'no',
                        'location': 'mcb',
                        'is_admin': 'no',
                        'state': 'needsAction',
                        'comment': '',
                        'private_data': sRemotePass
                    }

                    aList.push(oMcb)
                }

                let member_tel = values.member_tel ? values.member_tel : '',
                    member_mail = values.member_mail ? values.member_mail : '',
                    member_name = values.member_name ? values.member_name : '',
                    special_send_email = values.special_send_email ? 'yes' : 'no'

                if (member_tel || member_mail || member_name) {
                    aList.push({
                        'member_name': member_name,
                        'member_extension': member_tel,
                        'email': member_mail,
                        'send_email': special_send_email,
                        'location': 'special',
                        'is_admin': 'no',
                        'state': 'needsAction',
                        'comment': ''
                    })
                }

                const extenLists = getFieldValue('extenLists')
                extenLists.map((k, index) => {
                    let member_tel = `member_tel${k}`,
                        member_mail = `member_mail${k}`,
                        member_name = `member_name${k}`,
                        special_send_email = `special_send_email${k}`

                    if (values[member_tel] || values[member_mail] || values[member_name]) {
                        aList.push({
                            'member_name': values[member_name],
                            'member_extension': values[member_tel],
                            'email': values[member_mail],
                            'send_email': values[special_send_email] ? 'yes' : 'no',
                            'location': 'special',
                            'is_admin': 'no',
                            'state': 'needsAction',
                            'comment': ''
                        })
                    }
                })

                let action = values

                if (values.public === false) {
                    action.public = 'no'
                } else {
                    action.public = 'yes'
                }

                action.wait_admin = (action.wait_admin ? 'yes' : 'no')
                action.quiet_mode = (action.quiet_mode ? 'yes' : 'no')
                action.announce_callers = (action.announce_callers ? 'yes' : 'no')
                action.call_menu = (action.call_menu ? 'yes' : 'no')
                action.recording = (action.recording ? 'yes' : 'no')
                action.moh_firstcaller = (action.moh_firstcaller ? 'yes' : 'no')
                action.skipauth = (action.skipauth ? 'yes' : 'no')
                action.user_invite = (action.user_invite ? 'yes' : 'no')
                action.open_calendar = (action.open_calendar ? 'yes' : 'no')

                if (action.moh_firstcaller === 'no') {
                    delete action.musicclass
                }

                action.members = JSON.stringify(aList)

                action.starttime = action.starttime ? action.starttime.format('YYYY-MM-DD HH:mm:ss') : ""

                let sStartTime = action.starttime,
                    nMinute = action.endtime,
                    nEhour = parseInt(sStartTime.slice(11, 13), 10) + Math.floor(nMinute / 60),
                    nEmin = parseInt(sStartTime.slice(14, 16), 10) + nMinute % 60

                if (nEmin >= 60) {
                    nEmin = nEmin - 60
                    nEhour = nEhour + 1
                }

                action['endtime'] = sStartTime.slice(0, 11) + this._addZero(nEhour) + ':' + this._addZero(nEmin) + ':00'

                action.closed = 'no'

                if (bookId) {
                    if (editRecurringevent !== 'COMMON' && editRecurringevent !== 'DAILY') {
                        editRecurringevent = this._getRecurr(sStartTime)
                    }

                    action.action = 'updateMeetme'
                    action.recurringevent = editRecurringevent
                    delete action.open_calendar
                    action.bookid = bookId
                    mailType = 'update'
                    successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3789" })}}></span>
                } else {
                    let sRecurr = action.recurringevent

                    if (sRecurr === 'WEEKLY') {
                        sRecurr = this._getRecurr(sStartTime)
                    }

                    action.recurringevent = sRecurr
                    action.action = 'addMeetme'
                    action.timezone = '+0800'
                    bookId = action.bookid = new Date().getTime()
                    mailType = 'invite'
                    successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3787" })}}></span>
                }

                delete action.extenLists
                delete action.localeRightSelect
                delete action.remoteRightSelect
                delete action.locale_send_email
                delete action.remote_send_email
                delete action.create_remote_room
                delete action.create_remote_pass

                _.each(action, function(item, key) {
                    if (key.match(/member_tel|member_mail|member_name|special_send_email/)) {
                        delete action[key]
                    }
                })

                if (sConAdmin !== '' && !this.state.publicEnable) {
                    var bAdmin = false

                    for (var i = 0; i < aList.length; i++) {
                        if (sConAdmin === aList[i].member_extension) {
                            bAdmin = true
                            break
                        }
                    }

                    if (!bAdmin) {
                        message.error(formatMessage({id: "LANG4310" }))
                        return
                    }
                }

                delete action.con_admin

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
                            let data = {
                                action: 'sendMeetmeMail',
                                [mailType]: bookId
                            }

                            if (mailType === 'update') {
                                data['update_data'] = JSON.stringify(aUpdated)
                            }
                            $.ajax({
                                url: api.apiHost,
                                method: "post",
                                data: data,
                                type: 'json',
                                error: function(e) {
                                    message.error(e.statusText)
                                },
                                success: function(data) {
                                    var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                                    if (bool) {
                                        this.props.setSpinLoading({loading: false})
                                        message.success(successMessage)
                                    }

                                    this._handleCancel()
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                })
            }
        })
    }
    _handlePublicChange = (e) => {
        const {formatMessage} = this.props.intl,
            self = this

        this.setState({
            publicEnable: e.target.checked
        })

        if (this.state.userInviteEnable && e.target.checked) {
            Modal.confirm({
                content: formatMessage({id: "LANG2433"}, {
                    0: formatMessage({id: "LANG1027"}),
                    1: formatMessage({id: "LANG2431"})
                }),
                okText: formatMessage({id: "LANG727" }),
                cancelText: formatMessage({id: "LANG726" }),
                onOk() {
                    self.props.form.setFieldsValue({
                        public: true
                    })

                    self.setState({
                        publicEnable: true
                    })
                },
                onCancel() {
                    self.props.form.setFieldsValue({
                        public: false
                    })

                    self.setState({
                        publicEnable: false
                    })
                }
            })
        }
    }
    _onChange = (activeKey) => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) {
                this.setState({ 
                    activeKey: this.state.activeKey
                })
                return
            }
            this.setState({ 
                activeKey 
            })
        })        
    }
    render() {
        const form = this.props.form
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        let meetList = this.state.meetList,
            publicEnable = this.state.publicEnable

        const title = (this.props.params.id
                ? formatMessage({id: "LANG222"}, {
                    0: formatMessage({id: "LANG3775"}),
                    1: meetList.confno + ' ' + meetList.confname
                })
                : formatMessage({id: "LANG3776"}))

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: title
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ title }
                    onCancel={ this._handleCancel }
                    onSubmit={ this._handleSubmit.bind(this) }
                    isDisplay='display-block'/>
                <Form className="form-contain-tab">
                    <Tabs
                        activeKey={ this.state.activeKey }
                        onChange={ this._onChange }
                        animated={ UCMGUI.initConfig.msie ? false : true }
                    >
                        <TabPane tab={ formatMessage({id: "LANG4275"}) } key="1">
                            <ScheduleSettings
                                form={ form }
                                meetList={ meetList }
                                id={ this.props.params.id }
                                publicEnable={ publicEnable } />
                        </TabPane>
                        <TabPane tab={ formatMessage({id: "LANG599"}) } key="2">
                            <ScheduleConference
                                form={ form }
                                meetList={ meetList }
                                publicEnable={ publicEnable }
                                handlePublicChange = { this._handlePublicChange } />
                        </TabPane>
                    </Tabs>
                </Form>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    spinLoading: state.spinLoading
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(injectIntl(ScheduleIndex)))

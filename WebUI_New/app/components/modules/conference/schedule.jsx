'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Popconfirm, Table, Tag, Card, Row, Col, DatePicker, Modal } from 'antd'
import _ from 'underscore'
import '../../../css/schedule'

let subMeetmeList = []

class Schedule extends Component {
    constructor(props) {
        super(props)
        this.state = {
            confoList: {},
            conferenceRoomList: [],
            visible: false,
            record: {}
        }
    }
    componentDidMount() {
        this._getConfoList()
        this._getConfoRoomList()
        this._getGoogleAccountCal()
    }
    _getGoogleAccountCal = () => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'getGoogleAccountCal'
            },
            dataType: 'json',
            success: function(data) {
                var res = data.response,
                    calendarName = res.googlecalendar.calendar_name.slice(0, -1)

                if (calendarName !== "anonymous@gmail.com" && calendarName !== "" &&
                    calendarName.match(/^([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+$/)) {
                    this.setState({
                        googleUpdateDisable: false
                    })
                } else {
                    this.setState({
                        googleUpdateDisable: true
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getConfoRoomList = (startTime, endTime) => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'listConfStatus'
            },
            dataType: 'json',
            success: function(res) {
                let conferenceRoomList = res.response.conference || []

                this.setState({
                    conferenceRoomList: conferenceRoomList
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
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
                let confoList = res.response || {}

                this.setState({
                    confoList: confoList
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getMeetme = (bookid) => {
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                action: 'getMeetme',
                bookid: bookid
            },
            async: false,
            dataType: 'json',
            success: function(data) {
                subMeetmeList = data.response.bookid.members || []
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _cleanSettings = () => {
        browserHistory.push('/call-features/conference/cleanSettings/')
    }
    _scheduleSettings = () => {
        const { formatMessage } = this.props.intl

        if (this.state.conferenceRoomList.length === 0) {
            Modal.confirm({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3780" })}}></span>,
                okText: formatMessage({id: "LANG727" }),
                cancelText: formatMessage({id: "LANG726" }),
                onOk() {
                    browserHistory.push('/call-features/conference/add')
                }
            })
        } else {
            browserHistory.push('/call-features/conference/scheduleIndex')
        }
    }
    _edit = (record) => {
        browserHistory.push('/call-features/conference/editSchedule/' + record.bookid)
    }
    _delete = (record) => {
        let loadingMessage = ''
        let successMessage = ''
        const { formatMessage } = this.props.intl

        loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                "action": "deleteMeetme",
                "bookid": record.bookid
            },
            dataType: 'json',
            async: true,
            success: function(res) {
                var bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getConfoList()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _refreshGoogle = () => {
        const { formatMessage } = this.props.intl

        message.loading(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG905" })}}></span>, 0)

        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: {
                "action": "manualUpdateState",
                "updatestate": 'yes'
            },
            dataType: 'json',
            async: true,
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()

                    if (data.response.updatestate.match(/error|timeout/)) {
                        message.error(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG2981" })}}></span>)
                    } else {
                        message.success(<span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG3795" })}}></span>)
                        this._getConfoList()
                    }
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _renderRecurr = (text) => {
        const { formatMessage } = this.props.intl

        switch (text) {
            case 'COMMON':
                return formatMessage({id: "LANG3806"})
            case 'DAILY':
                return formatMessage({id: "LANG3804"})
            case 'Esunday':
                return formatMessage({id: "LANG3585"})
            case 'Fmonday':
                return formatMessage({id: "LANG3579"})
            case 'Gtuesday':
                return formatMessage({id: "LANG3580"})
            case 'Hwednesday':
                return formatMessage({id: "LANG3581"})
            case 'Ithursday':
                return formatMessage({id: "LANG3582"})
            case 'Jfriday':
                return formatMessage({id: "LANG3583"})
            case 'Ksaturday':
                return formatMessage({id: "LANG3584"})
        }
    }
    _getCurrentTime = () => {
        let currentTime = '1970-01-01 00:00:00 UTC+08:00'

        $.ajax({
                type: 'json',
                method: 'post',
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
    _renderStatus = (record, sNow) => {
        const { formatMessage } = this.props.intl

        if (record.recurringevent) {
            let sRecurr = record.recurringevent,
                sStartTime = record.starttime.slice(0, 16),
                sEndTime = record.endtime.slice(0, 16),
                sStatus = ''

            if (sRecurr === 'COMMON') {
                if (sNow < sStartTime) {
                    return formatMessage({id: "LANG3809"})
                } else if (sNow >= sStartTime && sNow <= sEndTime) {
                    return formatMessage({id: "LANG3810"})
                } else {
                    return formatMessage({id: "LANG3811"})
                }
            } else if (sRecurr === 'DAILY') {
                return formatMessage({id: "LANG3813"})
            } else {
                return formatMessage({id: "LANG3814"})
            }
        }
    }
    _filterToday = () => {
        let t = new Date(),
            startTime, endTime
        startTime = endTime = (t.getFullYear() + '-' + UCMGUI.addZero(t.getMonth() + 1) + '-' + UCMGUI.addZero(t.getDate()))
        this._getConfoList(startTime, endTime)
    }
    _filterTime = (date, dateString) => {
        this._getConfoList(dateString[0], dateString[1])
    }
    _detail = (record) => {
        this.setState({
            record: record,
            visible: true
        })

        this._getMeetme(record.id)
    }
    _ModalCancel = () => {
        this.setState({
            visible: false
        })
    }

    render() {
        const { formatMessage } = this.props.intl
        const { MonthPicker, RangePicker } = DatePicker

        let confoList = this.state.confoList,
            record = this.state.record,
            sNow = this._getCurrentTime().slice(0, 16)

        const columns = [{
                key: 'state',
                dataIndex: 'state',
                title: formatMessage({id: "LANG186"})
            }, {
                key: 'member_name',
                dataIndex: 'member_name',
                title: formatMessage({id: "LANG2026"})
            }, {
                key: 'member_extension',
                dataIndex: 'member_extension',
                title: formatMessage({id: "LANG3781"})
            }, {
                key: 'email',
                dataIndex: 'email',
                title: formatMessage({id: "LANG2032"})
            }, {
                key: 'send_email',
                dataIndex: 'send_email',
                title: formatMessage({id: "LANG3782"})
            }, {
                key: 'comment',
                dataIndex: 'comment',
                title: formatMessage({id: "LANG3792"})
            }]

        return (
            <div className="app-content-main app-content-main-schedule">
                <div className="content">
                    <div className={ "lite-desc" + (this.state.googleUpdateDisable ? ' hidden' : '') }>
                        { formatMessage({id: "LANG4467"}) }
                    </div>
                    <div className="top-button clearfix">
                        <div className="btn-left">
                            <Button icon="plus"
                                type="primary"
                                size="default"
                                onClick={ this._scheduleSettings }
                            >
                                { formatMessage({id: "LANG3776"}) }
                            </Button>
                            <Button
                                icon="setting"
                                type="primary"
                                size="default"
                                onClick={ this._cleanSettings }
                            >
                                { formatMessage({id: "LANG4277"}) }
                            </Button>
                            <Button
                                icon="setting"
                                type="primary"
                                size="default"
                                className={this.state.googleUpdateDisable ? 'hidden' : ''}
                                onClick={ this._refreshGoogle }
                            >
                                { formatMessage({id: "LANG2740"}) }
                            </Button>
                        </div>
                        <div className="btn-right">
                            <Button type="primary" size="default" onClick={ this._filterToday }>
                                Today
                            </Button>
                            <RangePicker onChange={ this._filterTime } />
                        </div>
                    </div>
                    <div>
                        {
                            _.map(confoList, function(item, totalKey) {
                                return (
                                    <div key={ totalKey }>
                                        <div className="header-confo">
                                            <span className="sprite sprite-schedule-confo"></span>
                                            <span className="confo-name">{ totalKey }</span>
                                            <span className="confo-num">
                                                <span style={{ marginRight: 5 }}>{ item.length }</span>
                                                { formatMessage({id: "LANG3775"}) }
                                            </span>
                                        </div>
                                        <Row
                                            gutter={16}
                                            className="row-confo"
                                            style={{ marginLeft: 33 }}
                                        >
                                            {
                                                _.map(item, function(conf, key) {
                                                    return (
                                                        <Col
                                                            xl={ 8 }
                                                            lg={ 12 }
                                                            key={ key }
                                                            className="col-confo"
                                                        >
                                                            <Card>
                                                                <Row type="flex" justify='center' align ='middle'>
                                                                    <Col span={ 16 } className="left-col">
                                                                        <div className="item-div">
                                                                            <span className="item-title">
                                                                                { formatMessage({id: "LANG3783"}) }
                                                                            </span>
                                                                            <span className="item-detail">{ conf.confname }</span>
                                                                        </div>
                                                                        <div className="item-div">
                                                                            <span className="item-title">
                                                                                { formatMessage({id: "LANG1048"}) }
                                                                            </span>
                                                                            <span className="item-detail">{ conf.starttime }</span>
                                                                        </div>
                                                                        <div className="item-div">
                                                                            <span className="item-title">
                                                                                { formatMessage({id: "LANG1049"}) }
                                                                            </span>
                                                                            <span className="item-detail">{ conf.endtime }</span>
                                                                        </div>
                                                                        <div className="item-div">
                                                                            <span className="item-title">
                                                                                { formatMessage({id: "LANG3803"}) }
                                                                            </span>
                                                                            <span className="item-detail">
                                                                                { this._renderRecurr(conf.recurringevent) }
                                                                            </span>
                                                                        </div>
                                                                    </Col>
                                                                    <Col span={ 8 } className="right-col">
                                                                        <span
                                                                            className="sprite sprite-edit"
                                                                            onClick={ this._edit.bind(this, conf) }
                                                                        ></span>
                                                                        <span
                                                                            className="sprite sprite-schedule-detail"
                                                                            onClick={ this._detail.bind(this, conf) }
                                                                        ></span>
                                                                        <Popconfirm
                                                                            title={ formatMessage({id: "LANG841"}) }
                                                                            okText={ formatMessage({id: "LANG727"}) }
                                                                            cancelText={ formatMessage({id: "LANG726"}) }
                                                                            onConfirm={ this._delete.bind(this, conf) }
                                                                        >
                                                                            <span className="sprite sprite-del"></span>
                                                                        </Popconfirm>
                                                                    </Col>
                                                                </Row>
                                                            </Card>
                                                        </Col>
                                                    )
                                                }.bind(this))
                                            }
                                        </Row>
                                    </div>
                                )   
                            }.bind(this))
                        }
                    </div>
                    <Modal 
                        title={ 'Meeting Detail' }
                        visible={this.state.visible}
                        onCancel={this._ModalCancel}
                        footer={ null }
                        width={ 780 }
                    >
                        <div className="item-div">
                            <span className="item-title">
                                { formatMessage({id: "LANG3784"}) }
                            </span>
                            <span className="item-detail">{ record.confno }</span>
                        </div>
                        <div className="item-div">
                            <span className="item-title">
                                { formatMessage({id: "LANG3783"}) }
                            </span>
                            <span className="item-detail">{ record.confname }</span>
                        </div>
                        <div className="item-div">
                            <span className="item-title">
                                { formatMessage({id: "LANG1048"}) }
                            </span>
                            <span className="item-detail">{ record.starttime }</span>
                        </div>
                        <div className="item-div">
                            <span className="item-title">
                                { formatMessage({id: "LANG1049"}) }
                            </span>
                            <span className="item-detail">{ record.endtime }</span>
                        </div>
                        <div className="item-div">
                            <span className="item-title">
                                { formatMessage({id: "LANG3802"}) }
                            </span>
                            <span className="item-detail">
                                { this._renderStatus(record, sNow) }
                            </span>
                        </div>
                        <div className="item-div">
                            <span className="item-title">
                                { formatMessage({id: "LANG3791"}) }
                            </span>
                            <span className="item-detail">
                                { record.open_calendar }
                            </span>
                        </div>
                        <div className="item-div">
                            <span className="item-title">
                                { formatMessage({id: "LANG3803"}) }
                            </span>
                            <span className="item-detail">
                                { this._renderRecurr(record.recurringevent) }
                            </span>
                        </div>
                        <div className="item-div">
                            <span className="item-title">
                                { formatMessage({id: "LANG5021"}) }
                            </span>
                        </div>
                        <Table
                            rowKey="member_extension"
                            columns={ columns }
                            pagination={ false }
                            dataSource={ subMeetmeList }
                            showHeader={ !!subMeetmeList.length }
                        >
                        </Table>
                    </Modal>
                </div>
            </div>
        )
    }
}

export default injectIntl(Schedule)
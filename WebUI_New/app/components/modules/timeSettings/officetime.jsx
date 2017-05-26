'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag } from 'antd'

const confirm = Modal.confirm
const addZero = UCMGUI.addZero

class OfficeTime extends Component {
    constructor(props) {
        super(props)

        this.state = {
            time_conditions_officetime: [],
            selectedRowKeys: [],
            selectedRows: []
        }
    }
    componentDidMount() {
        this._getInitData()
    }
    _add = () => {
        browserHistory.push('/system-settings/timeSettings/officetime/add')
    }
    _clearSelectRows = () => {
        this.setState({
            selectedRowKeys: [],
            selectedRow: []
        })
    }
    _delete = (record) => {
        const { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        $.ajax({
            type: 'post',
            async: true,
            url: api.apiHost,
            data: {
                "action": "deleteTimeConditionOfficeTime",
                "time_conditions_officetime": record.condition_index
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getInitData()
                    this._clearSelectRows()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _batchdelete = () => {
        const { formatMessage } = this.props.intl
        const __this = this

        if (this.state.selectedRowKeys.length === 0) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG823"}, {0: formatMessage({id: "LANG3271"})})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            confirm({
                content: <span dangerouslySetInnerHTML=
                                {{__html: formatMessage({id: "LANG818"}, {0: __this.state.selectedRowKeys.sort().join('  ')})}}
                            ></span>,
                onOk() {
                    __this._batchdeleteOk()
                },
                onCancel() {},
                okText: formatMessage({id: "LANG727"}),
                cancelText: formatMessage({id: "LANG726"})
            })
        }
    }
    _batchdeleteOk = (record) => {
        const { formatMessage } = this.props.intl

        let loadingMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG877" })}}></span>
        let successMessage = <span dangerouslySetInnerHTML={{__html: formatMessage({ id: "LANG816" })}}></span>

        message.loading(loadingMessage)

        let selectConditionIndex = []
        let selectedRows = this.state.selectedRows || []

        selectedRows.map(function(item) {
            selectConditionIndex.push(item.condition_index)
        })

        $.ajax({
            type: 'post',
            async: true,
            url: api.apiHost,
            data: {
                "action": "deleteTimeConditionOfficeTime",
                "time_conditions_officetime": selectConditionIndex.join(',')
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    this._getInitData()
                    this._clearSelectRows()
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record, index) => {
        browserHistory.push('/system-settings/timeSettings/officetime/edit/' + record.condition_index + '/' + record.index)
    }
    _getInitData = () => {
        const { formatMessage } = this.props.intl

        $.ajax({
            type: 'post',
            async: false,
            url: api.apiHost,
            data: {
                action: 'listTimeConditionOfficeTime',
                user_id: 0,
                sidx: 'condition_index',
                sord: 'asc'
            },
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const tmp_time_conditions_officetime = response.time_conditions_officetime || []

                    let time_conditions_officetime = []

                    tmp_time_conditions_officetime.map(function(item, index) {
                        time_conditions_officetime.push({
                            index: index + 1,
                            condition_index: item.condition_index,
                            sequence: item.sequence,
                            week_day: item.week_day,
                            start_hour: item.start_hour,
                            end_hour: item.end_hour,
                            start_min: item.start_min,
                            end_min: item.end_min,
                            month: item.month,
                            day: item.day,
                            user_id: item.user_id
                        })
                    })

                    this.setState({
                        time_conditions_officetime: time_conditions_officetime
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedRows: selectedRows
        })
    }
    _createTime = (text, record, index) => {
        let stime_hour = addZero(record.start_hour)
        let stime_minute = addZero(record.start_min)
        let ftime_hour = addZero(record.end_hour)
        let ftime_minute = addZero(record.end_min)
        let tempTime = (stime_hour + ':' + stime_minute + '-' + ftime_hour + ':' + ftime_minute)

        return <div>
                <span>{ tempTime }</span>
            </div>
    }
    _createWeekday = (text, record, index) => {
        const { formatMessage } = this.props.intl

        if (record.week_day === '*') {
            return <div>
                <span>{ formatMessage({id: "LANG257"}) }</span>
            </div>
        } else {
            let str = record.week_day.split('&')
            let dictWeek = {}
            let tmpstr = ''

            dictWeek["sun"] = formatMessage({id: "LANG250"})
            dictWeek["mon"] = formatMessage({id: "LANG251"})
            dictWeek["tue"] = formatMessage({id: "LANG252"})
            dictWeek["wed"] = formatMessage({id: "LANG253"})
            dictWeek["thu"] = formatMessage({id: "LANG254"})
            dictWeek["fri"] = formatMessage({id: "LANG255"})
            dictWeek["sat"] = formatMessage({id: "LANG256"})

            str.map(function(item) {
                if (tmpstr === '') {
                    tmpstr = dictWeek[item]
                } else {
                    tmpstr += " " + dictWeek[item]
                }
            })

            return <div>
                <span>{ tmpstr }</span>
            </div>
        }
    }
    _createMonth = (text, record, index) => {
        const { formatMessage } = this.props.intl

        if (record.month === '*') {
            return <div>
                <span>{ formatMessage({id: "LANG257"}) }</span>
            </div>
        } else {
            let str = record.month.split('&')
            let dictMonth = {}
            let tmpstr = ''

            dictMonth["jan"] = formatMessage({id: "LANG204"}, {0: ""})
            dictMonth["feb"] = formatMessage({id: "LANG205"}, {0: ""})
            dictMonth["mar"] = formatMessage({id: "LANG206"}, {0: ""})
            dictMonth["apr"] = formatMessage({id: "LANG207"}, {0: ""})
            dictMonth["may"] = formatMessage({id: "LANG208"}, {0: ""})
            dictMonth["jun"] = formatMessage({id: "LANG209"}, {0: ""})
            dictMonth["jul"] = formatMessage({id: "LANG210"}, {0: ""})
            dictMonth["aug"] = formatMessage({id: "LANG211"}, {0: ""})
            dictMonth["sep"] = formatMessage({id: "LANG212"}, {0: ""})
            dictMonth["oct"] = formatMessage({id: "LANG213"}, {0: ""})
            dictMonth["nov"] = formatMessage({id: "LANG214"}, {0: ""})
            dictMonth["dec"] = formatMessage({id: "LANG215"}, {0: ""})

            str.map(function(item) {
                tmpstr += dictMonth[item]
            })

            return <div>
                <span>{ tmpstr }</span>
            </div>
        }
    }
    _createDay = (text, record, index) => {
        const { formatMessage } = this.props.intl

        if (record.day === '*') {
            return <div>
                <span>{ formatMessage({id: "LANG257"}) }</span>
            </div>
        } else {
            let str = record.day.replace(/&/g, ',')

            return <div>
                <span>{ str }</span>
            </div>
        }
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))

        const columns = [{
                key: 'condition_index',
                dataIndex: 'condition_index',
                className: 'hidden',
                title: formatMessage({id: "LANG3269"}),
                sorter: false
            }, {
                key: 'sequence',
                dataIndex: 'sequence',
                className: 'hidden',
                title: formatMessage({id: "LANG1957"}),
                sorter: false
            }, {
                key: 'index',
                dataIndex: 'index',
                title: formatMessage({id: "LANG5020"}),
                // className: 'index-bk',
                render: (text, record, index) => {
                    return record.index
                }
            }, {
                key: 'time',
                dataIndex: 'time',
                title: formatMessage({id: "LANG247"}),
                render: (text, record, index) => {
                    return this._createTime(text, record, index)
                }
            }, {
                key: 'week_day',
                dataIndex: 'week_day',
                title: formatMessage({id: "LANG243"}),
                sorter: false,
                render: (text, record, index) => {
                    return this._createWeekday(text, record, index)
                }
            }, {
                key: 'month',
                dataIndex: 'month',
                title: formatMessage({id: "LANG244"}),
                sorter: false,
                render: (text, record, index) => {
                    return this._createMonth(text, record, index)
                }
            }, {
                key: 'day',
                dataIndex: 'day',
                title: formatMessage({id: "LANG242"}),
                sorter: false,
                render: (text, record, index) => {
                    return this._createDay(text, record, index)
                }
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                title={ formatMessage({id: "LANG738"}) }
                                onClick={ this._edit.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._delete.bind(this, record) }
                            >
                                <span className="sprite sprite-del" title={ formatMessage({id: "LANG739"}) }></span>
                            </Popconfirm>
                        </div>
                }
            }]

        const pagination = {
                total: this.state.time_conditions_officetime.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                },
                showTotal: (total) => {
                    return formatMessage({ id: "LANG115" }) + total
                }
            }

        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG3271"})
                })

        return (
            <div className="app-content-main">
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._add }
                        >
                            { formatMessage({id: "LANG3267"}) }
                        </Button>
                        <Button
                            icon="delete"
                            type="primary"
                            size='default'
                            onClick={ this._batchdelete }
                            disabled={ !this.state.selectedRowKeys.length }
                        >
                            { formatMessage({id: "LANG3268"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="index"
                        columns={ columns }
                        pagination={ pagination }
                        rowSelection={ rowSelection }
                        dataSource={ this.state.time_conditions_officetime }
                        showHeader={ !!this.state.time_conditions_officetime.length }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(OfficeTime)

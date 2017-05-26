'use strict'

import React, { Component, PropTypes } from 'react'
import { message, Table } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import _ from 'underscore'
import { browserHistory } from 'react-router'

let parkingtime = 300

class ParkingLot extends Component {
    constructor(props) {
        super(props)
        this.state = {
            parkList: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            }
        }
    }
    componentDidMount () {
        this._getInitData()
        this._getParkingLotTime()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _handleTableChange = (pagination, filters, sorter) => {
        let params = {
            page: pagination.current,
            item_num: pagination.pageSize,
            ...filters
        }

        if (sorter.field) {
            params.sidx = sorter.field
            params.sord = sorter.order === 'ascend' ? 'asc' : 'desc'
        } else {
            params.sidx = 'callerid'
            params.sord = 'asc'
        }

        this._getInitData(params)
    }
    _getInitData = (
        params = {
            item_num: 10,
            sidx: "callerid",
            sord: "asc",
            page: 1
        }) => {
        let data = {
            ...params,
            'action': 'listParkingLotStatus',
            "auto-refresh": Math.random()
        }
        $.ajax({
            url: api.apiHost,
            type: 'post',
            data: data,
            dataType: 'json',
            success: function(res) {
                let response = res.response || {},
                    parkList = response.exten || []

                const pagination = this.state.pagination
                pagination.total = res.response.total_item

                this.setState({
                    parkList: parkList,
                    pagination
                })
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _getParkingLotTime = () => {
        $.ajax({
            url: api.apiHost,
            type: "POST",
            async: false,
            data: {
                action: 'getFeatureCodes',
                parkingtime: ''
            },
            success: function(data) {
                var bool = UCMGUI.errorHandler(data, null, this.props.intl.formatMessage)

                if (bool) {
                    var response = data.response,
                        featureSettings = response.feature_settings

                    parkingtime = Number(featureSettings.parkingtime)
                    parkingtime = (parkingtime && !isNaN(parkingtime)) ? parkingtime : 300
                }
            }.bind(this)
        })
    }
    _getCurrentTime = () => {
        var currentTime = '1970-01-01 00:00:00'

        $.ajax({
            url: api.apiHost,
            type: "POST",
            dataType: "json",
            async: false,
            data: {
                action: 'checkInfo'
            },
            success: function(data) {
                if (data && data.status === 0) {
                    currentTime = data.response.current_time
                }
            }
        })

        return currentTime
    }
    _getActivityTime = (text) => {
        var startTime = text.replace(/-/g, "/"),
            endTime = this._getCurrentTime().replace(/-/g, "/"),
            timeAry = endTime.split(' '),
            milliseconds = Date.parse(timeAry[0] + " " + timeAry[1]) - Date.parse(startTime),
            activity = ''

        if (milliseconds < 0) {
            milliseconds = 0
        }

        var days = UCMGUI.addZero(Math.floor(milliseconds / (24 * 3600 * 1000)))

        var leave1 = milliseconds % (24 * 3600 * 1000),
            hours = UCMGUI.addZero(Math.floor(leave1 / (3600 * 1000)))

        var leave2 = leave1 % (3600 * 1000),
            minutes = UCMGUI.addZero(Math.floor(leave2 / (60 * 1000)))

        var leave3 = leave2 % (60 * 1000),
            seconds = UCMGUI.addZero(Math.round(leave3 / 1000))

        if (days === 0) {
            activity = hours + ":" + minutes + ":" + seconds
        } else {
            activity = days + " " + hours + ":" + minutes + ":" + seconds
        }

        return activity
    }
    _renderTime = (text) => {
        var activity = this._getActivityTime(text),
            match = activity.match(/\d+/g)

        if (match) {
            var queueTimeout = parkingtime - UCMGUI.addZero((Number(match[1]) * 60) + Number(match[2]))

            return queueTimeout
        }

        return text
    }
    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        document.title = formatMessage({
            id: "LANG584"
        }, {
            0: model_info.model_name, 
            1: formatMessage({id: "LANG99"})
        })

        const columns = [{
                key: 'callerid',
                dataIndex: 'callerid',
                title: formatMessage({id: "LANG78"}),
                sorter: true
            }, {
                key: 'channel',
                dataIndex: 'channel',
                title: formatMessage({id: "LANG101"}),
                sorter: true
            }, {
                key: 'exten',
                dataIndex: 'exten',
                title: formatMessage({id: "LANG85"}),
                sorter: true
            }, {
                key: 'park_time',
                dataIndex: 'park_time',
                title: formatMessage({id: "LANG102"}),
                sorter: true,
                render: (text) => {
                    return this._renderTime(text)
                }
            }]

        return (
            <div className="app-content-main">
                <Title 
                    isDisplay='hidden'
                    headerTitle={ formatMessage({id: "LANG99"}) }  
                />
                <div className="content">
                    <Table
                        rowKey={ record => record.callerid }
                        columns={ columns }
                        pagination={ this.state.pagination }
                        dataSource={ this.state.parkList }
                        showHeader={ !!this.state.parkList.length }
                        onChange={ this._handleTableChange }
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(ParkingLot)
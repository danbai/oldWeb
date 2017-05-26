'use strict'

import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { Form, Input, Icon, Table, Button, message, Modal } from 'antd'
import { FormattedMessage, injectIntl} from 'react-intl'
import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import _ from 'underscore'

const baseServerURl = api.apiHost

// let detailNum = 0,
//     detailObj = {}

class OperLogUsrList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {
                field: "date",
                order: "desc"
            },
            visible: false,
            detailNum: 0,
            operationData: [],
            operationDetailData: []
        }
    }
    componentDidMount() {
        this._listOperation()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _handleTableChange = (pagination, filters, sorter) => {
        const pager = this.state.pagination

        pager.current = pagination.current

        this.setState({
            pagination: pager,
            sorter: sorter
        })

        this._listOperation({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter.field,
            sord: sorter.order === "ascend" ? "asc" : "desc",
            ...filters
        })
    }
    _listOperation = (
        params = {                
            item_num: 10,
            sidx: "date",
            sord: "desc",
            page: 1 
        }) => {
        this.setState({ loading: true })

        $.ajax({
            url: baseServerURl,
            type: 'post',
            data: {
                action: 'listOperationLog',
                options: "date,user_name,ipaddress,result,action,operation,detailed_log",
                ...params
            },
            dataType: 'json',
            async: true,
            success: function(res) {
                let operation = res.response.operation
                const pagination = this.state.pagination
                // Read total count from server
                pagination.total = res.response.total_item

                this.setState({
                    loading: false,
                    operationData: operation,
                    pagination
                })
            }.bind(this),
            error: function(e) {
                console.log(e.statusText)
            }
        })
    }
    _getOptStr = (obj) => {
        const { formatMessage } = this.props.intl

        let optStr = "",
            data = obj.data,
            options2Lang = obj.options2Lang,
            locationObj = obj.locationObj,
            action = obj.action,
            count = obj.count,
            maxLen = obj.maxLen

        for (let prop in data) {
            if (data.hasOwnProperty(prop) && prop !== "action" && prop !== "_location" && prop !== "_") {
                let param = prop,
                    options2LangAction = options2Lang[action]

                if (count && maxLen) {
                    if (count > maxLen) {
                        break
                    }

                    count++
                }

                if (locationObj && locationObj[prop]) {
                    param = "<span>" + formatMessage({id: locationObj[prop]}) + "</span>"
                }

                if (options2LangAction && options2LangAction[prop]) {
                    param = "<span>" + formatMessage({id: options2LangAction[prop]}) + "</span>"
                }

                optStr += param + ": " + (data[prop] ? data[prop] : "") + ";  "
            }
        }

        return {
            data: optStr,
            count: count
        }
    }
    _jumpPage = (_location) => {

    }
    _transResults = (cellvalue, options, rowObject) => {
        const {formatMessage} = this.props.intl

        var erroeCodes = UCMGUI.initConfig.errorCodes,
            val = erroeCodes[cellvalue]

        if (!val) {
            val = "LANG3910" // Operate Successfully 
        }

        return <span>{ formatMessage({id: val}) }</span>       
    }
    _transAction = (cellvalue, options, rowObject) => {
        const {formatMessage} = this.props.intl

        let _location = rowObject.operation._location ? rowObject.operation._location : "",
            options2Lang = this.props.options2Lang,
            locationObj = options2Lang[_location],
            page = ""

        if (options2Lang && locationObj) {
            var lang = locationObj["_LOCATION"]

            if (lang && _location !== "operationLog") {
                page = <span className='jumpPage' onClick={ this._jumpPage.bind(this, _location) } title={ formatMessage({id: 'LANG3984'}) } >{ formatMessage({id: lang}) + ":" } </span>
            } else {
                page = <span>{ formatMessage({id: lang}) + ":" }</span>
            }
        }

        if (locationObj && locationObj[cellvalue]) {
            var sVal = locationObj[cellvalue]

            if (sVal.match(/\sLANG\d+$/)) {
                var aTranLang = sVal.split(' ')

                cellvalue = <span>{ formatMessage({id: aTranLang[0]}, {0: formatMessage({id: aTranLang[1]})}) }</span>
            } else {
                cellvalue = <span>{ formatMessage({id: locationObj[cellvalue]}) }</span>
            }
        } else if (options2Lang && options2Lang[cellvalue]) {
            var _LOCATION = options2Lang[cellvalue]["_LOCATION"]

            if (_LOCATION) {
                cellvalue = <span>{ formatMessage({id: _LOCATION}) }</span>
            } else {
                cellvalue = <span>{ formatMessage({id: options2Lang[cellvalue]}) }</span>
            }
        }

        return <div>
                { page } 
                { cellvalue }
            </div>
    }
    _transOperation = (cellvalue, options, rowObject) => {
        const { formatMessage } = this.props.intl

        let optStr = "",
            isDetail = "",
            _location = rowObject.operation._location ? rowObject.operation._location : "",
            action = rowObject.action,
            options2Lang = this.props.options2Lang,
            locationObj = options2Lang[_location],
            detailedLog = rowObject.detailed_log

        if (detailedLog) {
            if (_.size(cellvalue) > 1) {
                let obj = this._getOptStr({
                    data: cellvalue,
                    options2Lang: options2Lang,
                    locationObj: locationObj,
                    action: action
                })

                optStr += obj.data
            } else {
                let count = 0,
                    maxLen = 3,
                    obj = this._getOptStr({
                        data: cellvalue,
                        options2Lang: options2Lang,
                        locationObj: locationObj,
                        action: action,
                        count: count,
                        maxLen: maxLen
                    })

                optStr += obj.data
            }

            let id = "detail" + this.state.detailNum

            // optStr += "<span class='sprite sprite-del' onclick='" + this._showDetail.bind(this, rowObject.detailed_log) + "'></span>"
            isDetail = <span className='sprite sprite-detail' onClick={ this._showDetail.bind(this, rowObject.detailed_log) }></span>
            rowObject.detailed_log["action"] = action

            // detailObj[id] = rowObject.detailed_log

            this.state.detailNum++
        } else {
            let count = 0,
                maxLen = 3,
                obj = this._getOptStr({
                    data: cellvalue,
                    options2Lang: options2Lang,
                    locationObj: locationObj,
                    action: action,
                    count: count,
                    maxLen: maxLen
                })

            optStr += obj.data
            count = obj.count

            if (count > maxLen) {
                let id = "detail" + this.state.detailNum

                // optStr += "<span class='sprite sprite-del' onclick='" + this._showDetail.bind(this, cellvalue) + "'></span>"
                isDetail = <span className='sprite sprite-detail' onClick={ this._showDetail.bind(this, cellvalue) }></span>
                // rowObject.detailed_log["action"] = action;
                // detailObj[id] = cellvalue

                this.state.detailNum++
            } else {
                if (action === "updateCountryCodes") {
                    optStr = '<div>' + optStr.substr(0, 40) + '<span class="operation-more">...</span><span class="operation-more-content">' + optStr.substr(40) + '</span>' + '</div>'
                }
            }
        }

        if (/;\s+$/.test(optStr)) {
            optStr = optStr.replace(/;\s+$/, ".")
        }

        return <div>
            <span dangerouslySetInnerHTML={{__html: optStr}} ></span>
            { isDetail }
        </div>
    }
    _showDetail = (data) => {
        this.setState({
            visible: true
        })
        let arr = []
        for (let tmp in data) {
            if (data.hasOwnProperty(tmp)) {
                let obj = {}
                obj["options"] = tmp
                obj["value"] = data[tmp]
                arr.push(obj)
            }
        }
        this.setState({
            operationDetailData: arr
        })
    }
    _handleOk = () => {
        this.setState({
            visible: false
        })
    }
    _handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    render() {
        const {formatMessage} = this.props.intl

        const columns = [
            {
                title: formatMessage({id: "LANG203"}),
                dataIndex: 'date',
                sorter: true
            }, {
                title: formatMessage({id: "LANG2809"}),
                dataIndex: 'user_name',
                sorter: true
            }, {
                title: formatMessage({id: "LANG155"}),
                dataIndex: 'ipaddress',
                sorter: true
            }, {
                title: formatMessage({id: "LANG3909"}),
                dataIndex: 'result',
                render: (text, record, index) => (
                    this._transResults(text, index, record)
                )
            }, {
                title: formatMessage({id: "LANG3922"}),
                dataIndex: 'action',
                render: (text, record, index) => (
                    this._transAction(text, index, record)
                )
            }, {
                title: formatMessage({id: "LANG3927"}),
                dataIndex: 'operation',
                render: (text, record, index) => (
                    this._transOperation(text, index, record)
                )
            }
        ]
        const detailColumns = [
            {
                title: formatMessage({id: "LANG74"}),
                dataIndex: 'options'
            }, {
                title: formatMessage({id: "LANG3925"}),
                dataIndex: 'value'
            }
        ]

        const detailPagination = {
            total: this.state.operationDetailData.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                console.log('Current: ', current, '; PageSize: ', pageSize)
            },
            onChange: (current) => {
                console.log('Current: ', current)
            }
        }

        return (
            <div className="content">
                <div className="top-button">
                    <Button type="primary" icon="delete" size='default' onClick={ this.props.deleteSearch }>
                        { formatMessage({id: "LANG4071" }, { 0: formatMessage({id: "LANG4146"})}) }
                    </Button>
                    <Button type="primary" icon="delete" size='default' onClick={ this.props.deleteAll }>
                        { formatMessage({id: "LANG3911"}) }
                    </Button>
                </div>
                <Table
                    bordered
                    columns={ columns }
                    dataSource={ this.state.operationData }
                    pagination={ this.state.pagination }
                    showHeader={ !!this.state.operationData.length }
                    onChange={ this._handleTableChange }  
                />
                <Modal
                    style={{width: "850px"}} 
                    title={ formatMessage({id: "LANG3926"}) }
                    visible={ this.state.visible }
                    onOk={ this._handleOk } 
                    onCancel={ this._handleCancel }
                    okText={ formatMessage({id: "LANG727"}) }
                    cancelText={ formatMessage({id: "LANG726"}) } >
                    <Table
                        bordered
                        columns={ detailColumns }
                        dataSource={ this.state.operationDetailData }
                        pagination={ detailPagination }
                        showHeader={ !!this.state.operationDetailData.length }
                    />
                </Modal>
            </div>
        )
    }
}

export default injectIntl(OperLogUsrList)
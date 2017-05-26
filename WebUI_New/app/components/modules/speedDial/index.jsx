'use strict'

import $ from 'jquery'
import api from "../../api/api"
import UCMGUI from "../../api/ucmgui"
import Title from '../../../views/title'
import { browserHistory } from 'react-router'
import React, { Component, PropTypes } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, message, Modal, Popconfirm, Table, Tag } from 'antd'

class SpeedDial extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ivr: {},
            disa: {},
            directory: {},
            speedDialList: [],
            pagination: {
                showTotal: this._showTotal,
                showSizeChanger: true,
                showQuickJumper: true
            },
            sorter: {},
            loading: false
        }
    }
    componentDidMount() {
        this._getSpeedDialList()
        this._getInitData()
    }
    _showTotal = (total) => {
        const { formatMessage } = this.props.intl

        return formatMessage({ id: "LANG115" }) + total
    }
    _add = () => {
        const { formatMessage } = this.props.intl
        if (this.state.speedDialList.length >= 100) {
            Modal.warning({
                content: <span dangerouslySetInnerHTML={{__html: formatMessage({id: "LANG5094"})}} ></span>,
                okText: (formatMessage({id: "LANG727"}))
            })
        } else {
            browserHistory.push('/call-features/speedDial/add')
        }
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
            method: 'post',
            data: {
                "action": "deleteSpeedDial",
                "speed_dial": record.extension
            },
            type: 'json',
            async: true,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    message.destroy()
                    message.success(successMessage)

                    const pagination = this.state.pagination
                    const pageSize = this.state.pagination.pageSize
                    let current = this.state.pagination.current
                    const old_total = this.state.pagination.total
                    const new_total = old_total - 1
                    const new_total_page = (new_total - 1) / pageSize + 1
                    if (current > new_total_page) {
                        current = Math.floor(new_total_page)
                    }
                    pagination.current = current

                    this._getSpeedDialList({
                        item_num: pageSize,
                        page: current,
                        sidx: this.state.sorter.field ? this.state.sorter.field : 'extension',
                        sord: this.state.sorter.order === "descend" ? "desc" : "asc"
                    })
                    this.setState({
                        pagination: pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _edit = (record) => {
        browserHistory.push('/call-features/speedDial/edit/' + record.extension)
    }
    _transList2Obj = (res, options) => {
        var val = options.val,
            text = options.text,
            arr = [],
            obj = {},
            key = ''

        for (var i = 0; i < res.length; i++) {
            key = res[i][val]
            obj[key] = res[i][text]
        }

        return obj
    }
   _getInitData = () => {
        const { formatMessage } = this.props.intl
        const account = this.props.params.id

        let keyIVRObj = this._transList2Obj(
            UCMGUI.isExist.getList("getIVRList"),
            {
                val: "ivr_id",
                text: "ivr_name"
            }
        )

        let keyDisaObj = this._transList2Obj(
            UCMGUI.isExist.getList("getDISAList"),
            {
                val: "disa_id",
                text: "display_name"
            }
        )

        let keyDirectoryObj = this._transList2Obj(
            UCMGUI.isExist.getList("getDirectoryList"),
            {
                val: "extension",
                text: "name"
            }
        )
        this.setState({
            ivr: keyIVRObj,
            disa: keyDisaObj,
            directory: keyDirectoryObj
        })
    }

    _getSpeedDialList = (
         params = {                
                item_num: 10,
                sidx: "extension",
                sord: "asc",
                page: 1 
            }
        ) => {
        const { formatMessage } = this.props.intl
        this.setState({loading: true})

        $.ajax({
            url: api.apiHost,
            method: 'post',
            data: {
                action: 'listSpeedDial',
                ...params
            },
            type: 'json',
            async: false,
            success: function(res) {
                const bool = UCMGUI.errorHandler(res, null, this.props.intl.formatMessage)

                if (bool) {
                    const response = res.response || {}
                    const speedDialList = response.speed_dial || []
                    const pagination = this.state.pagination
                    pagination.total = res.response.total_item

                    this.setState({
                        loading: false,
                        speedDialList: speedDialList,
                        pagination
                    })
                }
            }.bind(this),
            error: function(e) {
                message.error(e.statusText)
            }
        })
    }
    _handleTableChange = (pagination, filters, sorter) => {
        const pager = this.state.pagination

        pager.current = pagination.current

        let sorter_here = {}
        if (sorter && sorter.field) {
            this.setState({
                pagination: pager,
                sorter: sorter
            })
            sorter_here = sorter
        } else {
            this.setState({
                pagination: pager
            })
            sorter_here = this.state.sorter
        }

        this._getSpeedDialList({
            item_num: pagination.pageSize,
            page: pagination.current,
            sidx: sorter_here.field ? sorter_here.field : 'extension',
            sord: sorter_here.order === "descend" ? "desc" : "asc",
            ...filters
        })
    }
    _onSelectChange = (selectedRowKeys, selectedRows) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        // console.log('selectedRow changed: ', selectedRows)

        this.setState({ selectedRowKeys })
    }
   _enable_destination = (text, record, index) => {
        let enable_destination
        const { formatMessage } = this.props.intl

        if (text === 'yes') {
            enable_destination = <span>{ formatMessage({ id: "LANG274" }) }</span>
        } else if (text === 'no') {
            enable_destination = <span>{ formatMessage({ id: "LANG273" }) }</span>
        } else {
            enable_destination = <span>{ formatMessage({ id: "LANG274" }) }</span>
        }
        return enable_destination
    }
   destination_type = (text, record, index) => {
        let destination_type
        const { formatMessage } = this.props.intl

        if (text === 'account') {
            destination_type = <span>{ formatMessage({ id: "LANG85" }) }</span>
        } else if (text === 'voicemail') {
            destination_type = <span>{ formatMessage({ id: "LANG90" }) }</span>
        } else if (text === 'conference') {
            destination_type = <span>{ formatMessage({ id: "LANG98" }) }</span>
        } else if (text === 'vmgroup') {
            destination_type = <span>{ formatMessage({ id: "LANG89" }) }</span>
        } else if (text === 'ivr') {
            destination_type = <span>{ formatMessage({ id: "LANG19" }) }</span>
        } else if (text === 'ringgroup') {
            destination_type = <span>{ formatMessage({ id: "LANG600" }) }</span>
        } else if (text === 'queue') {
            destination_type = <span>{ formatMessage({ id: "LANG91" }) }</span>
        } else if (text === 'paginggroup') {
            destination_type = <span>{ formatMessage({ id: "LANG94" }) }</span>
        } else if (text === 'fax') {
            destination_type = <span>{ formatMessage({ id: "LANG95" }) }</span>
        } else if (text === 'disa') {
            destination_type = <span>{ formatMessage({ id: "LANG2353" }) }</span>
        } else if (text === 'directory') {
            destination_type = <span>{ formatMessage({ id: "LANG2884" }) }</span>
        } else if (text === 'external_number') {
            destination_type = <span>{ formatMessage({ id: "LANG3458" }) }</span>
        } else {
            destination_type = <span></span>
        }
        return destination_type
    }
   _destination_num = (text, record, index) => {
        let destination_num
        const { formatMessage } = this.props.intl

        if (record.destination_type === 'ivr') {
            destination_num = this.state.ivr[text]
        } else if (record.destination_type === 'disa') {
            destination_num = this.state.disa[text]
        } else if (record.destination_type === 'directory') {
            destination_num = this.state.directory[text]
        } else {
            destination_num = text
        }
        return destination_num
    }

    render() {
        const { formatMessage } = this.props.intl
        const model_info = JSON.parse(localStorage.getItem('model_info'))
        const columns = [{
                key: 'extension',
                dataIndex: 'extension',
                title: formatMessage({id: "LANG85"}),
                sorter: true
            }, {
                key: 'enable_destination',
                dataIndex: 'enable_destination',
                title: formatMessage({id: "LANG3501"}),
                sorter: false,
                render: (text, record, index) => (
                    this._enable_destination(text, record, index)
                )
            }, {
                key: 'destination_type',
                dataIndex: 'destination_type',
                title: formatMessage({id: "LANG1558"}),
                sorter: false,
                render: (text, record, index) => (
                    this.destination_type(text, record, index)
                )
            }, {
                key: 'destination_num',
                dataIndex: 'destination_num',
                title: formatMessage({id: "LANG1558"}),
                sorter: false,
                render: (text, record, index) => (
                    this._destination_num(text, record, index)
                )
            }, {
                key: 'options',
                dataIndex: 'options',
                title: formatMessage({id: "LANG74"}),
                render: (text, record, index) => {
                    return <div>
                            <span
                                className="sprite sprite-edit"
                                onClick={ this._edit.bind(this, record) }>
                            </span>
                            <Popconfirm
                                title={ formatMessage({id: "LANG841"}) }
                                okText={ formatMessage({id: "LANG727"}) }
                                cancelText={ formatMessage({id: "LANG726"}) }
                                onConfirm={ this._delete.bind(this, record) }
                            >
                                <span className="sprite sprite-del"></span>
                            </Popconfirm>
                        </div>
                }
            }]
        const pagination = {
                total: this.state.speedDialList.length,
                showSizeChanger: true,
                onShowSizeChange: (current, pageSize) => {
                    console.log('Current: ', current, '; PageSize: ', pageSize)
                },
                onChange: (current) => {
                    console.log('Current: ', current)
                }
            }
        const rowSelection = {
                onChange: this._onSelectChange,
                selectedRowKeys: this.state.selectedRowKeys
            }

        document.title = formatMessage({id: "LANG584"}, {
                    0: model_info.model_name,
                    1: formatMessage({id: "LANG3501"})
                })

        return (
            <div className="app-content-main">
                <Title
                    headerTitle={ formatMessage({id: "LANG3501"}) }
                    isDisplay='hidden'
                />
                <div className="content">
                    <div className="top-button">
                        <Button
                            icon="plus"
                            type="primary"
                            size='default'
                            onClick={ this._add }
                        >
                            { formatMessage({id: "LANG769"}) }
                        </Button>
                    </div>
                    <Table
                        rowKey="speed_dial"
                        columns={ columns }
                        dataSource={ this.state.speedDialList}
                        showHeader={ !!this.state.speedDialList.length }
                        pagination={ this.state.pagination }
                        onChange={ this._handleTableChange }
                        loading={ this.state.loading}
                    />
                </div>
            </div>
        )
    }
}

export default injectIntl(SpeedDial)